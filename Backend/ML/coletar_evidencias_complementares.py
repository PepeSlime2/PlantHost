"""Coleta evidências complementares do GBIF e Reflora com localização explícita."""

from __future__ import annotations

import csv
import json
import time
from datetime import date
from pathlib import Path
from urllib.parse import quote
from urllib.request import Request, urlopen


ROOT = Path(__file__).parent
INPUT = ROOT / "base_botanica_caracteristicas_reflora.csv"
OUTPUT = ROOT / "evidencias_fontes_complementares.csv"
REPORT = ROOT / "relatorio_fontes_complementares.md"
GBIF = "https://api.gbif.org/v1"
REFLORA = "https://servicos.jbrj.gov.br/v2/flora/taxon/"


def get_json(url: str) -> object:
    request = Request(url, headers={"User-Agent": "PlantHostAI-ML/1.0"})
    with urlopen(request, timeout=30) as response:
        return json.load(response)


def add(
    evidence: list[dict[str, str]],
    row: dict[str, str],
    field: str,
    source: str,
    url: str,
    record_id: str,
    text: str,
    location: str,
    status: str = "evidencia_bruta",
) -> None:
    if not text.strip():
        return
    evidence.append(
        {
            "species_id": row["species_id"],
            "scientific_name": row["accepted_name"] or row["scientific_name_original"],
            "field": field,
            "source": source,
            "source_url": url,
            "record_id": record_id,
            "consulted_at": date.today().isoformat(),
            "location_context": location,
            "status": status,
            "text": text.strip(),
        }
    )


def main() -> None:
    with INPUT.open(encoding="utf-8", newline="") as file:
        rows = list(csv.DictReader(file))
    evidence: list[dict[str, str]] = []
    failures = 0

    for row in rows:
        name = row["accepted_name"].strip() or row["scientific_name_original"].strip()
        gbif_key = row["gbif_key"].strip()
        if gbif_key:
            description_url = f"{GBIF}/species/{quote(gbif_key)}/descriptions?limit=1000"
            vernacular_url = f"{GBIF}/species/{quote(gbif_key)}/vernacularNames?limit=1000"
            try:
                descriptions = get_json(description_url)
                for item in descriptions.get("results", []):
                    add(
                        evidence,
                        row,
                        str(item.get("type") or "description"),
                        "GBIF",
                        description_url,
                        str(item.get("key") or ""),
                        str(item.get("description") or ""),
                        str(item.get("source") or "localização não informada"),
                    )
                vernacular = get_json(vernacular_url)
                for item in vernacular.get("results", []):
                    name_value = str(item.get("vernacularName") or "")
                    language = str(item.get("language") or "idioma não informado")
                    add(
                        evidence,
                        row,
                        "vernacular_name",
                        "GBIF",
                        vernacular_url,
                        str(item.get("key") or ""),
                        f"{name_value} ({language})",
                        "localidade não informada",
                    )
            except Exception as error:
                failures += 1
                add(
                    evidence,
                    row,
                    "consulta",
                    "GBIF",
                    description_url,
                    "",
                    f"{type(error).__name__}: {error}",
                    "não aplicável",
                    "consulta_falhou",
                )

        reflora_url = REFLORA + quote(name, safe="")
        try:
            result = get_json(reflora_url)
            profile = result[0] if result else {}
            taxon = profile.get("taxon", {})
            for item in profile.get("distribuition", []):
                state = str(item.get("locationid") or "")
                remarks = item.get("occurrenceremarks") or {}
                add(
                    evidence,
                    row,
                    "distribution",
                    "Reflora",
                    reflora_url,
                    str(taxon.get("taxonid") or ""),
                    json.dumps(
                        {
                            "establishmentmeans": item.get("establishmentmeans"),
                            "remarks": remarks,
                        },
                        ensure_ascii=False,
                    ),
                    f"Brasil; {state}",
                )
            specie_profile = profile.get("specie_profile", {})
            for field, key in (
                ("growth_habit", "lifeForm"),
                ("habitat", "habitat"),
                ("vegetation_type", "vegetationType"),
            ):
                values = specie_profile.get(key) or []
                add(
                    evidence,
                    row,
                    field,
                    "Reflora",
                    reflora_url,
                    str(taxon.get("taxonid") or ""),
                    "; ".join(str(value) for value in values),
                    "Brasil; localização não especificada no perfil",
                )
            add(
                evidence,
                row,
                "bibliography",
                "Reflora",
                reflora_url,
                str(taxon.get("taxonid") or ""),
                str(taxon.get("source") or ""),
                "referência bibliográfica; local da obra não inferido",
            )
        except Exception as error:
            failures += 1
            add(
                evidence,
                row,
                "consulta",
                "Reflora",
                reflora_url,
                "",
                f"{type(error).__name__}: {error}",
                "não aplicável",
                "consulta_falhou",
            )
        time.sleep(0.05)

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
    with OUTPUT.open("w", encoding="utf-8", newline="") as file:
        writer = csv.DictWriter(file, fieldnames=fields)
        writer.writeheader()
        writer.writerows(evidence)
    REPORT.write_text(
        f"""# Evidências complementares com localização

Data da coleta: {date.today().isoformat()}

- Espécies processadas: {len(rows)}
- Evidências registradas: {len(evidence)}
- Falhas de consulta: {failures}
- Fontes: GBIF e API oficial Flora do Brasil 2020/Reflora

Cada linha preserva fonte, URL, identificador, data, contexto de localização e
texto bruto. A localização é registrada apenas quando a fonte a informa; não
foi inferida a partir do nome da espécie.

As evidências classificadas como `description`, `biology_ecology` ou outros
tipos não foram automaticamente convertidas em campos morfológicos. Elas ficam
disponíveis para revisão taxonômica e extração manual, evitando confundir
descrições ecológicas com características visuais.

POWO foi testado, mas o endpoint automatizado retornou HTTP 403 nesta execução;
nenhum dado dessa fonte foi incorporado.
""",
        encoding="utf-8",
    )
    print(f"Evidências complementares: {len(evidence)}")


if __name__ == "__main__":
    main()
