"""Consolida as características disponíveis no GBIF e no Reflora."""

from __future__ import annotations

import csv
from datetime import date
from pathlib import Path


ROOT = Path(__file__).parent
INPUT = ROOT / "base_botanica_caracteristicas_reflora.csv"
OUTPUT = ROOT / "base_ml_caracteristicas.csv"
STATUS = ROOT / "status_caracteristicas.csv"
REPORT = ROOT / "relatorio_base_ml_caracteristicas.md"

FEATURES = (
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
    if not rows:
        raise RuntimeError("A base enriquecida não possui registros.")

    output_rows: list[dict[str, str]] = []
    status_rows: list[dict[str, str]] = []
    for row in rows:
        output = {
            "species_id": row["species_id"],
            "category": row["category"],
            "common_name": row["common_name_original"],
            "scientific_name_original": row["scientific_name_original"],
            "accepted_name": row["accepted_name"],
            "family": row["gbif_family"] or "",
            "taxonomic_status": row["taxonomic_status"],
            "source_reference": row["source_reference"],
        }
        for field in FEATURES:
            output[field] = row.get(field, "")
            status_rows.append(
                {
                    "species_id": row["species_id"],
                    "field": field,
                    "value_status": (
                        "disponivel"
                        if output[field].strip()
                        else "nao_disponivel_na_fonte"
                    ),
                    "source": (
                        row["characteristics_source"]
                        if output[field].strip()
                        else ""
                    ),
                    "source_url": (
                        row.get("reflora_record_url", "")
                        if output[field].strip()
                        else ""
                    ),
                    "consulted_at": date.today().isoformat(),
                }
            )
        output["feature_source"] = row["characteristics_source"]
        output["feature_status"] = (
            "parcial"
            if any(output[field].strip() for field in FEATURES)
            else "sem_dados"
        )
        output_rows.append(output)

    with OUTPUT.open("w", encoding="utf-8", newline="") as file:
        writer = csv.DictWriter(file, fieldnames=list(output_rows[0]))
        writer.writeheader()
        writer.writerows(output_rows)
    with STATUS.open("w", encoding="utf-8", newline="") as file:
        writer = csv.DictWriter(file, fieldnames=list(status_rows[0]))
        writer.writeheader()
        writer.writerows(status_rows)

    coverage = {
        field: sum(bool(row[field].strip()) for row in output_rows)
        for field in FEATURES
    }
    report = f"""# Base de ML por características botânicas

Data da consolidação: {date.today().isoformat()}

Esta é a base destinada ao futuro modelo tabular. Imagens não são entradas do
modelo e serão associadas somente depois da identificação da espécie.

## Cobertura extraída

{chr(10).join(f"- `{field}`: {count}/{len(output_rows)} registros" for field, count in coverage.items())}

## Limitação essencial

A API oficial do Reflora retornou, para os registros consultados, forma de
vida, habitat, tipo de vegetação, distribuição e taxonomia. A API do GBIF
retornou descrições classificadas como hábito, forma de vida e distribuição em
parte dos registros. As fontes consultadas não retornaram de forma estruturada
altura, morfologia de folhas, flores, frutos ou sementes para a base completa.

Esses campos foram mantidos vazios e classificados como
`nao_disponivel_na_fonte` em `status_caracteristicas.csv`. Isso não significa
que a característica não exista; significa que ela não foi extraída de uma
fonte acessível e verificável nesta execução.

## Critério para treinamento

O treinamento permanece bloqueado enquanto a equipe não definir uma política
para os campos ausentes e não houver características suficientes, com fonte
rastreável, para distinguir as espécies. Não foram criados valores sintéticos,
inferidos por nome ou copiados entre espécies.
"""
    REPORT.write_text(report, encoding="utf-8")
    print(f"Base consolidada: {len(output_rows)} espécies")


if __name__ == "__main__":
    main()
