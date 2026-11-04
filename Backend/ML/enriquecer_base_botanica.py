"""Enriquece a base inicial com taxonomia verificável do GBIF.

Características morfológicas não retornadas pelas fontes consultadas permanecem
vazias e são marcadas para revisão manual; o script não faz inferências.
"""

from __future__ import annotations

import csv
import json
import time
from datetime import date
from pathlib import Path
from urllib.parse import quote
from urllib.request import Request, urlopen


ROOT = Path(__file__).parent
INPUT = ROOT / "base_botanica_inicial.csv"
OUTPUT = ROOT / "base_botanica_enriquecida.csv"
SOURCES = ROOT / "fontes_taxonomicas.csv"
REPORT = ROOT / "relatorio_enriquecimento_botanico.md"
GBIF_API = "https://api.gbif.org/v1/species/match?name="
GBIF_HOME = "https://www.gbif.org/species/"
REFLORA_HOME = "https://floradobrasil.jbrj.gov.br/"


def get_json(url: str) -> dict:
    request = Request(url, headers={"User-Agent": "PlantHostAI-ML/1.0"})
    with urlopen(request, timeout=30) as response:
        return json.load(response)


def gbif_match(name: str) -> dict:
    try:
        return get_json(GBIF_API + quote(name, safe=""))
    except Exception as error:
        return {"matchType": "ERROR", "error": f"{type(error).__name__}: {error}"}


def enrich(rows: list[dict[str, str]]) -> tuple[list[dict[str, str]], list[dict[str, str]]]:
    enriched: list[dict[str, str]] = []
    sources: list[dict[str, str]] = []
    for row in rows:
        match = gbif_match(row["scientific_name_original"])
        matched = match.get("matchType") not in {"ERROR", "NONE"}
        accepted = match.get("scientificName") if matched else ""
        status = "confirmado_gbif" if matched else "revisao_taxonomica"
        if match.get("rank") not in {"SPECIES", "SUBSPECIES", "VARIETY", "FORM"}:
            status = "revisao_taxonomica"

        enriched.append(
            {
                **row,
                "accepted_name": accepted,
                "taxonomic_status": status,
                "gbif_key": str(match.get("usageKey", "")),
                "gbif_match_type": str(match.get("matchType", "")),
                "gbif_confidence": str(match.get("confidence", "")),
                "gbif_family": str(match.get("family", "")),
                "gbif_genus": str(match.get("genus", "")),
                "gbif_species": str(match.get("species", "")),
                "growth_habit": "",
                "life_cycle": "",
                "height": "",
                "leaf_traits": "",
                "flower_traits": "",
                "fruit_seed_traits": "",
                "habitat_distribution": "",
                "characteristics_status": "nao_encontrado",
                "characteristics_source": "",
                "review_note": (
                    "Conferir no Reflora; consultar características morfológicas "
                    "em fonte especializada."
                ),
            }
        )
        sources.extend(
            [
                {
                    "species_id": row["species_id"],
                    "field_group": "taxonomia",
                    "source": "GBIF",
                    "source_url": (
                        GBIF_HOME + str(match["usageKey"])
                        if match.get("usageKey")
                        else ""
                    ),
                    "record_id": str(match.get("usageKey", "")),
                    "consulted_at": date.today().isoformat(),
                    "status": "confirmado" if matched else "revisao",
                    "details": json.dumps(match, ensure_ascii=False, sort_keys=True),
                },
                {
                    "species_id": row["species_id"],
                    "field_group": "caracteristicas_botanicas",
                    "source": "Reflora",
                    "source_url": REFLORA_HOME,
                    "record_id": "",
                    "consulted_at": "",
                    "status": "consulta_manual_pendente",
                    "details": (
                        "Nenhum atributo morfológico foi preenchido sem registro "
                        "específico verificável."
                    ),
                },
            ]
        )
        time.sleep(0.1)
    return enriched, sources


def write_csv(path: Path, rows: list[dict[str, str]]) -> None:
    if not rows:
        raise ValueError(f"Nenhum registro para gravar em {path.name}")
    with path.open("w", newline="", encoding="utf-8") as file:
        writer = csv.DictWriter(file, fieldnames=list(rows[0]))
        writer.writeheader()
        writer.writerows(rows)


def write_report(rows: list[dict[str, str]]) -> None:
    confirmed = sum(row["taxonomic_status"] == "confirmado_gbif" for row in rows)
    review = len(rows) - confirmed
    REPORT.write_text(
        f"""# Relatório de enriquecimento botânico

Data da execução: {date.today().isoformat()}

## Resultado taxonômico

- Registros processados: {len(rows)}
- Correspondências taxonômicas utilizáveis no GBIF: {confirmed}
- Registros mantidos para revisão: {review}
- Características morfológicas preenchidas automaticamente: 0

O nome científico original foi preservado. O nome retornado pelo GBIF foi
gravado separadamente em `accepted_name`; divergências não substituem a fonte
original.

## Características

Os campos `growth_habit`, `life_cycle`, `height`, `leaf_traits`,
`flower_traits`, `fruit_seed_traits` e `habitat_distribution` ficam vazios
quando não há evidência registrada. A ausência não significa que a
característica não exista. Cada registro possui status
`nao_encontrado` e deve ser revisado no Reflora ou em publicação especializada.

## Fontes e limitações

- GBIF foi consultado pela API `species/match` para nomenclatura e hierarquia.
- Reflora foi registrado como fonte prioritária para consulta manual; o script
  não simula confirmação nem cria identificadores de espécimes.
- A data de consulta e os identificadores retornados estão em
  `fontes_taxonomicas.csv`.
- Falhas de rede são registradas como `revisao_taxonomica` e não produzem
  sucesso aparente.
""",
        encoding="utf-8",
    )


def main() -> None:
    with INPUT.open(encoding="utf-8", newline="") as file:
        rows = list(csv.DictReader(file))
    if len(rows) != 68:
        raise RuntimeError(f"Esperados 68 registros, encontrados {len(rows)}")
    enriched, sources = enrich(rows)
    write_csv(OUTPUT, enriched)
    write_csv(SOURCES, sources)
    write_report(enriched)
    print(f"Gerados: {OUTPUT.name}, {SOURCES.name} e {REPORT.name}")


if __name__ == "__main__":
    main()
