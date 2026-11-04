"""Integra Catalogue of Life e iNaturalist ao dataset central de ML."""

from __future__ import annotations

import csv
import json
import time
from collections import defaultdict
from datetime import date
from pathlib import Path
from urllib.parse import quote, urlencode
from urllib.request import Request, urlopen


ROOT = Path(__file__).parent
INPUT = ROOT / "base_ml_caracteristicas_complementada.csv"
OUTPUT = ROOT / "base_ml_caracteristicas_fontes_adicionais.csv"
EVIDENCE = ROOT / "evidencias_fontes_adicionais.csv"
REPORT = ROOT / "relatorio_fontes_adicionais.md"
INATURALIST = "https://api.inaturalist.org/v1"
CATALOGUE = "https://api.catalogueoflife.org/dataset/3LR/nameusage/search"


def get_json(url: str) -> dict:
    request = Request(url, headers={"User-Agent": "PlantHostAI-ML/1.0"})
    with urlopen(request, timeout=30) as response:
        return json.load(response)


def canonical_name(name: str) -> str:
    parts = name.split()
    return " ".join(parts[:2]).casefold()


def evidence(
    result: list[dict[str, str]],
    row: dict[str, str],
    field: str,
    source: str,
    url: str,
    record_id: str,
    text: str,
    location: str,
) -> None:
    if not text.strip():
        return
    result.append(
        {
            "species_id": row["species_id"],
            "scientific_name": row["accepted_name"] or row["scientific_name_original"],
            "field": field,
            "source": source,
            "source_url": url,
            "record_id": record_id,
            "consulted_at": date.today().isoformat(),
            "location_context": location,
            "status": "evidencia_complementar",
            "text": text.strip(),
        }
    )


def main() -> None:
    with INPUT.open(encoding="utf-8", newline="") as file:
        rows = list(csv.DictReader(file))
    evidences: list[dict[str, str]] = []
    additions: dict[str, dict[str, str]] = defaultdict(dict)
    failures = 0

    for row in rows:
        name = row["accepted_name"].strip() or row["scientific_name_original"].strip()
        encoded = quote(name, safe="")

        inat_url = f"{INATURALIST}/taxa?q={encoded}&per_page=10"
        try:
            data = get_json(inat_url)
            matches = [
                item for item in data.get("results", [])
                if item.get("name", "").casefold() == name.split(" ")[0].casefold()
                or item.get("name", "").casefold() == name.casefold()
            ]
            taxon = matches[0] if matches else (data.get("results") or [None])[0]
            if taxon:
                additions[row["species_id"]].update(
                    {
                        "inat_taxon_id": str(taxon.get("id") or ""),
                        "inat_common_name": str(taxon.get("preferred_common_name") or ""),
                        "inat_observations_count": str(taxon.get("observations_count") or ""),
                        "inat_wikipedia_url": str(taxon.get("wikipedia_url") or ""),
                    }
                )
                evidence(
                    evidences,
                    row,
                    "vernacular_name",
                    "iNaturalist",
                    inat_url,
                    str(taxon.get("id") or ""),
                    str(taxon.get("preferred_common_name") or ""),
                    "localidade não informada",
                )
                if taxon.get("wikipedia_url"):
                    evidence(
                        evidences,
                        row,
                        "reference_link",
                        "iNaturalist",
                        inat_url,
                        str(taxon.get("id") or ""),
                        str(taxon["wikipedia_url"]),
                        "referência externa; localidade não informada",
                    )
                observation_url = (
                    f"{INATURALIST}/observations?"
                    + urlencode({"taxon_id": taxon.get("id"), "per_page": 100})
                )
                observations = get_json(observation_url).get("results", [])
                locations = sorted(
                    {
                        str(obs.get("place_guess") or "").strip()
                        for obs in observations
                        if obs.get("place_guess")
                    }
                )
                additions[row["species_id"]]["inat_observation_locations"] = "; ".join(
                    locations
                )
                for location in locations:
                    evidence(
                        evidences,
                        row,
                        "observation_location",
                        "iNaturalist",
                        observation_url,
                        str(taxon.get("id") or ""),
                        location,
                        location,
                    )
        except Exception as error:
            failures += 1
            evidence(
                evidences,
                row,
                "consulta",
                "iNaturalist",
                inat_url,
                "",
                f"{type(error).__name__}: {error}",
                "não aplicável",
            )

        col_url = f"{CATALOGUE}?{urlencode({'q': name, 'limit': 20})}"
        try:
            data = get_json(col_url)
            exact = [
                item for item in data.get("result", [])
                if str(item.get("usage", {}).get("name", {}).get("scientificName", ""))
                and canonical_name(
                    str(item.get("usage", {}).get("name", {}).get("scientificName", ""))
                )
                == canonical_name(name)
            ]
            item = exact[0] if exact else None
            if item:
                usage = item.get("usage", {})
                additions[row["species_id"]].update(
                    {
                        "catalogue_life_id": str(item.get("id") or ""),
                        "catalogue_life_status": str(usage.get("status") or ""),
                        "catalogue_life_link": str(usage.get("link") or ""),
                        "catalogue_life_vernacular": str(
                            item.get("vernacularNames") or ""
                        ),
                    }
                )
                classification = "; ".join(
                    f"{entry.get('rank')}: {entry.get('name')}"
                    for entry in item.get("classification", [])
                )
                evidence(
                    evidences,
                    row,
                    "taxonomic_crosscheck",
                    "Catalogue of Life",
                    col_url,
                    str(item.get("id") or ""),
                    classification,
                    "localidade não informada",
                )
                evidence(
                    evidences,
                    row,
                    "vernacular_name",
                    "Catalogue of Life",
                    col_url,
                    str(item.get("id") or ""),
                    str(item.get("vernacularNames") or ""),
                    "localidade não informada",
                )
        except Exception as error:
            failures += 1
            evidence(
                evidences,
                row,
                "consulta",
                "Catalogue of Life",
                col_url,
                "",
                f"{type(error).__name__}: {error}",
                "não aplicável",
            )
        time.sleep(0.05)

    output_rows = [{**row, **additions.get(row["species_id"], {})} for row in rows]
    output_fields = list(output_rows[0])
    for row in output_rows[1:]:
        for field in row:
            if field not in output_fields:
                output_fields.append(field)
    with OUTPUT.open("w", encoding="utf-8", newline="") as file:
        writer = csv.DictWriter(file, fieldnames=output_fields)
        writer.writeheader()
        writer.writerows(output_rows)
    fields = [
        "species_id",
        "scientific_name",
        "field",
        "source",
        "source_url",
        "record_id",
        "consulted_at",
        "location_context",
        "status",
        "text",
    ]
    with EVIDENCE.open("w", encoding="utf-8", newline="") as file:
        writer = csv.DictWriter(file, fieldnames=fields)
        writer.writeheader()
        writer.writerows(evidences)
    REPORT.write_text(
        f"""# Fontes botânicas adicionais integradas

Data da consulta: {date.today().isoformat()}

- Registros centrais preservados: {len(output_rows)}
- Evidências adicionais: {len(evidences)}
- Falhas de consulta registradas: {failures}
- Fontes: iNaturalist e Catalogue of Life

O iNaturalist acrescenta nome vernacular, link de referência, contador de
observações e locais de observações. Esses locais são pontos/contextos de
observação, não uma afirmação de distribuição natural nem uma característica
morfológica.

O Catalogue of Life acrescenta conferência taxonômica, classificação, status,
link e nomes vernaculares. Nenhuma dessas fontes foi usada para inventar
altura, folhas, flores, frutos, sementes ou ciclo de vida.

Detalhes com URL, ID, data e localização estão em
`evidencias_fontes_adicionais.csv`. A camada central está em
`base_ml_caracteristicas_fontes_adicionais.csv`.
""",
        encoding="utf-8",
    )
    print(f"Fontes adicionais integradas: {len(evidences)} evidências")


if __name__ == "__main__":
    main()
