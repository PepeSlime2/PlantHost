"""Gera fila de revisão das referências bibliográficas do Reflora."""

from __future__ import annotations

import csv
from datetime import date
from pathlib import Path


ROOT = Path(__file__).parent
INPUT = ROOT / "base_botanica_caracteristicas_reflora.csv"
OUTPUT = ROOT / "fila_revisao_referencias.csv"
REPORT = ROOT / "relatorio_fila_referencias.md"

TARGET_FIELDS = (
    "growth_habit",
    "life_cycle",
    "height",
    "leaf_traits",
    "flower_traits",
    "fruit_seed_traits",
    "habitat_distribution",
)


def main() -> None:
    with INPUT.open(encoding="utf-8", newline="") as file:
        rows = list(csv.DictReader(file))
    queue: list[dict[str, str]] = []
    for row in rows:
        references = row["reflora_references"].strip()
        if not references:
            continue
        missing = [
            field
            for field in TARGET_FIELDS
            if not row.get(field, "").strip()
        ]
        queue.append(
            {
                "species_id": row["species_id"],
                "scientific_name_original": row["scientific_name_original"],
                "accepted_name": row["accepted_name"],
                "reflora_taxon_id": row["reflora_taxon_id"],
                "reflora_record_url": row["reflora_record_url"],
                "reference_text": references,
                "missing_fields": ";".join(missing),
                "review_status": "pendente_extracao",
                "reviewed_source_url": "",
                "reviewed_source_id": "",
                "reviewed_at": "",
                "notes": "",
            }
        )
    fields = list(queue[0]) if queue else [
        "species_id",
        "scientific_name_original",
        "accepted_name",
        "reflora_taxon_id",
        "reflora_record_url",
        "reference_text",
        "missing_fields",
        "review_status",
        "reviewed_source_url",
        "reviewed_source_id",
        "reviewed_at",
        "notes",
    ]
    with OUTPUT.open("w", encoding="utf-8", newline="") as file:
        writer = csv.DictWriter(file, fieldnames=fields)
        writer.writeheader()
        writer.writerows(queue)

    missing_counts = {
        field: sum(field in row["missing_fields"].split(";") for row in queue)
        for field in TARGET_FIELDS
    }
    REPORT.write_text(
        f"""# Fila de extração de características botânicas

Data da geração: {date.today().isoformat()}

- Espécies com referências bibliográficas no Reflora: {len(queue)}
- Status inicial de todas as tarefas: `pendente_extracao`

## Campos pendentes por espécie

{chr(10).join(f"- `{field}`: {count} espécie(s)" for field, count in missing_counts.items())}

## Procedimento

Para cada linha de `fila_revisao_referencias.csv`, consultar a referência
indicada pelo Reflora e registrar apenas características explicitamente
descritas na publicação. Preencher `reviewed_source_url`,
`reviewed_source_id`, `reviewed_at` e `notes`; depois incorporar os valores à
base enriquecida mantendo a fonte em `evidencias_caracteristicas_reflora.csv`.

Não usar busca por nome como substituto da leitura da fonte. Se a referência
não estiver acessível ou não descrever o atributo, manter o campo vazio e
alterar o status para `nao_localizada` ou `nao_descrito`.
""",
        encoding="utf-8",
    )
    print(f"Fila gerada: {len(queue)} espécies")


if __name__ == "__main__":
    main()
