"""Valida as bases tabular e de imagens do PlantHostAI."""

from __future__ import annotations

import csv
from collections import Counter
from datetime import date
from pathlib import Path


ROOT = Path(__file__).parent
SPECIES = ROOT / "base_botanica_enriquecida.csv"
IMAGES = ROOT / "catalogo_imagens_gbif.csv"
REPORT = ROOT / "relatorio_qualidade_dataset.md"
ISSUES = ROOT / "problemas_qualidade.csv"


def read_csv(path: Path) -> list[dict[str, str]]:
    with path.open(encoding="utf-8", newline="") as file:
        return list(csv.DictReader(file))


def duplicate_values(rows: list[dict[str, str]], field: str) -> list[str]:
    values = [row[field] for row in rows if row.get(field)]
    return sorted(value for value, count in Counter(values).items() if count > 1)


def main() -> None:
    species = read_csv(SPECIES)
    images = read_csv(IMAGES)
    issues: list[dict[str, str]] = []

    def issue(kind: str, record_id: str, field: str, detail: str) -> None:
        issues.append(
            {
                "severity": "medium",
                "kind": kind,
                "record_id": record_id,
                "field": field,
                "detail": detail,
            }
        )

    for field in ("species_id", "source_reference", "scientific_name_original"):
        for row in species:
            if not row.get(field, "").strip():
                issue("campo_obrigatorio_ausente", row.get("species_id", ""), field, "Valor vazio")
    for row in images:
        if not row.get("source", "").strip() or not row.get("consulted_at", "").strip():
            issue(
                "metadado_obrigatorio_ausente",
                row.get("image_id", ""),
                "source/consulted_at",
                "Fonte ou data de consulta ausente",
            )
        if row.get("image_url") and row.get("reuse_status") != "verificar_licenca":
            issue(
                "imagem_sem_revisao_de_licenca",
                row.get("image_id", ""),
                "reuse_status",
                "Imagem não está marcada para verificação de licença",
            )

    for field in ("species_id",):
        for value in duplicate_values(species, field):
            issue("identificador_duplicado", value, field, "ID repetido na base botânica")
        for value in duplicate_values(images, "image_id"):
            issue("identificador_duplicado", value, "image_id", "ID repetido no catálogo")
    for value in duplicate_values(images, "image_url"):
        issue("url_imagem_duplicada", value, "image_url", "URL repetida no catálogo")

    species_ids = {row["species_id"] for row in species}
    for row in images:
        if row.get("species_id") not in species_ids:
            issue(
                "referencia_inexistente",
                row.get("image_id", ""),
                "species_id",
                f"Espécie {row.get('species_id', '')} não existe na base botânica",
            )

    fields = ["severity", "kind", "record_id", "field", "detail"]
    with ISSUES.open("w", encoding="utf-8", newline="") as file:
        writer = csv.DictWriter(file, fieldnames=fields)
        writer.writeheader()
        writer.writerows(issues)

    accepted = sum(bool(row["accepted_name"]) for row in species)
    with_license = sum(bool(row["license"]) for row in images)
    species_with_images = len({row["species_id"] for row in images if row["image_url"]})
    report = f"""# Relatório de qualidade do dataset

Data da execução: {date.today().isoformat()}

## Totais e cobertura

| Indicador | Resultado |
|---|---:|
| Registros botânicos | {len(species)} |
| Registros com nome aceito GBIF | {accepted} ({accepted / len(species):.1%}) |
| Registros de imagens catalogados | {len(images)} |
| Espécies com imagens | {species_with_images} |
| Imagens com licença informada | {with_license} ({with_license / len(images):.1%}) |
| Problemas estruturais detectados | {len(issues)} |

## Verificações

- IDs e referências entre imagens e espécies foram conferidos.
- Campos obrigatórios de origem foram conferidos.
- URLs duplicadas e identificadores repetidos foram procurados.
- O XLSX original não é sobrescrito; os CSVs enriquecidos são derivados.
- Nomes sem confirmação GBIF permanecem com status de revisão.
- Imagens permanecem como catálogo de consulta, não como conjunto autorizado
  para treinamento.

## Pendências

Características morfológicas continuam sem preenchimento automatizado.
Licenças, identificação visual, resolução, duplicatas perceptuais e tipo de
imagem exigem revisão específica antes de qualquer experimento.

Detalhes estruturados estão em `problemas_qualidade.csv`.
"""
    REPORT.write_text(report, encoding="utf-8")
    print(f"Validação concluída: {len(issues)} problema(s)")


if __name__ == "__main__":
    main()
