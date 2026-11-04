"""Promove evidências explicitamente tipadas para atributos da base de ML."""

from __future__ import annotations

import csv
from collections import defaultdict
from datetime import date
from pathlib import Path


ROOT = Path(__file__).parent
INPUT = ROOT / "evidencias_fontes_complementares.csv"
BASE = ROOT / "base_ml_caracteristicas.csv"
OUTPUT = ROOT / "base_ml_caracteristicas_complementada.csv"
EVIDENCE = ROOT / "evidencias_atributos_ml.csv"
REPORT = ROOT / "relatorio_atributos_complementados.md"

FEATURES = (
    "growth_habit",
    "life_cycle",
    "height",
    "leaf_traits",
    "flower_traits",
    "fruit_seed_traits",
    "habitat_distribution",
)


def map_field(field: str) -> str:
    value = field.casefold().replace("_", " ").strip()
    if value in {"habit", "hábito", "growth habit", "life form", "lifeform"}:
        return "growth_habit"
    if value in {"life cycle", "lifecycle", "ciclo de vida"}:
        return "life_cycle"
    if value in {"height", "plant height", "altura"}:
        return "height"
    if value in {"leaf", "leaves", "leaf traits", "leaf morphology", "folha", "folhas"}:
        return "leaf_traits"
    if value in {
        "flower",
        "flowers",
        "flower traits",
        "flower morphology",
        "inflorescence",
        "flor",
        "flores",
    }:
        return "flower_traits"
    if value in {
        "fruit",
        "fruits",
        "fruit traits",
        "fruit morphology",
        "seed",
        "seeds",
        "seed traits",
        "fruto",
        "frutos",
        "semente",
        "sementes",
    }:
        return "fruit_seed_traits"
    if value in {
        "native range",
        "distribution",
        "habitat",
        "eunis habitat",
        "vegetation type",
        "rango de distribución altitudinal",
        "rango de elevación",
        "región biogeográfica",
    }:
        return "habitat_distribution"
    return ""


def main() -> None:
    with INPUT.open(encoding="utf-8", newline="") as file:
        raw = list(csv.DictReader(file))
    values: dict[str, dict[str, list[str]]] = defaultdict(
        lambda: {field: [] for field in FEATURES}
    )
    promoted: list[dict[str, str]] = []
    for row in raw:
        target = map_field(row["field"])
        if not target or row["status"] != "evidencia_bruta":
            continue
        text = row["text"].strip()
        if not text:
            continue
        values[row["species_id"]][target].append(text)
        promoted.append(
            {
                "species_id": row["species_id"],
                "field": target,
                "source": row["source"],
                "source_url": row["source_url"],
                "record_id": row["record_id"],
                "consulted_at": row["consulted_at"],
                "location_context": row["location_context"],
                "evidence_text": text,
                "promotion_status": "promovido_por_tipo_explicito",
            }
        )

    fields = [
        "species_id",
        "field",
        "source",
        "source_url",
        "record_id",
        "consulted_at",
        "location_context",
        "evidence_text",
        "promotion_status",
    ]
    with EVIDENCE.open("w", encoding="utf-8", newline="") as file:
        writer = csv.DictWriter(file, fieldnames=fields)
        writer.writeheader()
        writer.writerows(promoted)

    with BASE.open(encoding="utf-8", newline="") as file:
        base_rows = list(csv.DictReader(file))
    species_ids = [row["species_id"] for row in base_rows]
    output: list[dict[str, str]] = []
    for species_id in species_ids:
        item = values[species_id]
        base_row = next(row for row in base_rows if row["species_id"] == species_id)
        output.append(
            {
                "species_id": species_id,
                "category": base_row["category"],
                "common_name": base_row["common_name"],
                "scientific_name_original": base_row["scientific_name_original"],
                "accepted_name": base_row["accepted_name"],
                "family": base_row["family"],
                **{
                    field: " | ".join(dict.fromkeys(item[field]))
                    for field in FEATURES
                },
                "feature_status": (
                    "parcial"
                    if any(item[field] for field in FEATURES)
                    else "sem_dados"
                ),
                "consulted_at": date.today().isoformat(),
            }
        )
    with OUTPUT.open("w", encoding="utf-8", newline="") as file:
        writer = csv.DictWriter(file, fieldnames=list(output[0]) if output else [])
        if output:
            writer.writeheader()
            writer.writerows(output)

    counts = {
        field: sum(bool(row[field]) for row in output)
        for field in FEATURES
    }
    REPORT.write_text(
        f"""# Atributos estruturados a partir de evidências

Data da extração: {date.today().isoformat()}

Foram promovidas apenas evidências cujo tipo da fonte corresponde
explicitamente ao atributo. Descrições genéricas, nomes populares,
bibliografias e localização sem atributo botânico não foram usados como
características.

{chr(10).join(f"- `{field}`: {count}/{len(output)} espécies" for field, count in counts.items())}

`life form` foi classificado como `growth_habit`, nunca como `life_cycle`.
Altitude, distribuição geográfica e estados são registrados em
`habitat_distribution`; não são altura da planta.

O detalhamento por fonte, URL, identificador, data e localização está em
`evidencias_atributos_ml.csv`. Os campos ausentes continuam vazios e não
representam valores desconhecidos como se fossem negativos.
""",
        encoding="utf-8",
    )
    print(f"Atributos promovidos: {len(promoted)} evidências")


if __name__ == "__main__":
    main()
