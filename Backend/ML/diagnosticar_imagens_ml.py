"""Gera diagnóstico de viabilidade para experimentos de visão computacional."""

from __future__ import annotations

import csv
from collections import Counter, defaultdict
from datetime import date
from pathlib import Path


ROOT = Path(__file__).parent
INPUT = ROOT / "catalogo_imagens_gbif.csv"
COUNTS = ROOT / "diagnostico_imagens_por_especie.csv"
REPORT = ROOT / "diagnostico_visao_computacional.md"


def read_rows() -> list[dict[str, str]]:
    with INPUT.open(encoding="utf-8", newline="") as file:
        return list(csv.DictReader(file))


def main() -> None:
    rows = read_rows()
    usable = [row for row in rows if row["image_url"]]
    by_species: dict[str, list[dict[str, str]]] = defaultdict(list)
    for row in usable:
        by_species[row["species_id"]].append(row)

    counts = []
    for species_id, species_rows in sorted(by_species.items()):
        counts.append(
            {
                "species_id": species_id,
                "scientific_name": species_rows[0]["scientific_name"],
                "image_count": str(len(species_rows)),
                "occurrence_count": str(
                    len({row["occurrence_id"] for row in species_rows if row["occurrence_id"]})
                ),
                "licensed_count": str(sum(bool(row["license"]) for row in species_rows)),
                "identification_validated_count": "0",
                "quality_evaluated_count": "0",
                "training_eligible_count": "0",
                "status": "revisao_necessaria",
            }
        )
    with COUNTS.open("w", encoding="utf-8", newline="") as file:
        writer = csv.DictWriter(file, fieldnames=list(counts[0]) if counts else [])
        if counts:
            writer.writeheader()
            writer.writerows(counts)

    image_counts = [int(row["image_count"]) for row in counts]
    insufficient = [row for row in counts if int(row["image_count"]) < 10]
    duplicate_urls = len(usable) - len({row["image_url"] for row in usable})
    licenses = Counter(row["license"] for row in usable)
    identification = Counter(row["identification_status"] for row in usable)
    image_types = Counter(row["image_type"] for row in usable)
    report = f"""# Diagnóstico para experimentos de visão computacional

Data da execução: {date.today().isoformat()}

## Resumo

| Indicador | Resultado |
|---|---:|
| Registros com URL de imagem | {len(usable)} |
| Espécies com imagens | {len(counts)} |
| Mínimo de imagens por espécie | {min(image_counts, default=0)} |
| Máximo de imagens por espécie | {max(image_counts, default=0)} |
| Mediana de imagens por espécie | {sorted(image_counts)[len(image_counts) // 2] if image_counts else 0} |
| Classes com menos de 10 imagens | {len(insufficient)} |
| URLs duplicadas | {duplicate_urls} |
| Imagens com identificação validada para treinamento | 0 |
| Imagens com qualidade avaliada | 0 |

## Licenças e metadados

Todas as imagens continuam com `reuse_status=verificar_licenca`; uma licença
informada não equivale a autorização automática para treinamento. Distribuição
de licenças observada: {dict(licenses)}.

Tipos de imagem informados pelo GBIF: {dict(image_types)}.
Status de identificação: {dict(identification)}.

## Classes insuficientes

Foram consideradas insuficientes para uma divisão mínima de treino, validação
e teste as classes com menos de 10 imagens. A lista completa está em
`diagnostico_imagens_por_especie.csv`; nenhuma classe foi excluída.

"""
    if insufficient:
        report += "\n".join(
            f"- `{row['species_id']}` — {row['scientific_name']}: "
            f"{row['image_count']} imagem(ns)"
            for row in insufficient
        )
    else:
        report += "- Nenhuma classe ficou abaixo do limiar de 10 imagens.\n"

    report += """

## Estratégia proposta de divisão

1. Revisar a identificação e a licença de cada imagem antes da inclusão.
2. Usar `occurrence_id` como grupo; imagens da mesma ocorrência não podem ser
   distribuídas entre conjuntos diferentes.
3. Aplicar divisão estratificada por espécie e por grupo em 70% treino, 15%
   validação e 15% teste somente após a revisão dos grupos.
4. Manter classes insuficientes fora do treinamento supervisionado inicial ou
   usar uma estratégia explicitamente aprovada; não criar amostras artificiais
   para mascarar a insuficiência.
5. Aplicar aumento de dados somente ao conjunto de treino.

O catálogo atual não permite avaliar ângulo, iluminação, fundo, estágio de
desenvolvimento, resolução efetiva ou imagens quase idênticas sem acessar os
arquivos. Portanto, ainda não há dataset pronto para treinamento e nenhum
modelo deve ser treinado com estes resultados.
"""
    REPORT.write_text(report, encoding="utf-8")
    print(f"Diagnóstico concluído: {len(counts)} classes e {len(usable)} imagens")


if __name__ == "__main__":
    main()
