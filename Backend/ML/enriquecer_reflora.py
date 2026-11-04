"""Enriquece características com a API oficial Flora do Brasil/Reflora."""

from __future__ import annotations

import csv
import json
import time
from datetime import date
from pathlib import Path
from urllib.parse import quote
from urllib.request import Request, urlopen


ROOT = Path(__file__).parent
INPUT = ROOT / "base_botanica_caracteristicas.csv"
OUTPUT = ROOT / "base_botanica_caracteristicas_reflora.csv"
EVIDENCE = ROOT / "evidencias_caracteristicas_reflora.csv"
REPORT = ROOT / "relatorio_reflora.md"
API = "https://servicos.jbrj.gov.br/v2/flora/taxon/"
SOURCE_NAME = "Flora do Brasil 2020 / Reflora"


def get_json(url: str) -> list[dict]:
    request = Request(url, headers={"User-Agent": "PlantHostAI-ML/1.0"})
    with urlopen(request, timeout=30) as response:
        return json.load(response)


def text_values(values: object) -> list[str]:
    if not isinstance(values, list):
        return []
    return [str(value).strip() for value in values if str(value).strip()]


def main() -> None:
    with INPUT.open(encoding="utf-8", newline="") as file:
        rows = list(csv.DictReader(file))
    evidence: list[dict[str, str]] = []
    enriched: list[dict[str, str]] = []

    for row in rows:
        values = dict(row)
        values.update(
            {
                "reflora_taxon_id": "",
                "reflora_taxonomic_status": "",
                "reflora_references": "",
                "reflora_record_url": "",
                "reflora_modified": "",
            }
        )
        name = row["accepted_name"].strip() or row["scientific_name_original"].strip()
        url = API + quote(name, safe="")
        try:
            results = get_json(url)
            profile = results[0] if results else {}
            taxon = profile.get("taxon", {})
            specie_profile = profile.get("specie_profile", {})
            distribution = profile.get("distribuition", [])
            life_form = text_values(specie_profile.get("lifeForm"))
            habitat = text_values(specie_profile.get("habitat"))
            vegetation = text_values(specie_profile.get("vegetationType"))
            states = [
                str(item.get("locationid", "")).strip()
                for item in distribution
                if item.get("locationid")
            ]
            accepted = str(taxon.get("scientificname") or "").strip()
            references = str(taxon.get("source") or "").strip()
            flora_reference = str(taxon.get("references") or "").strip()
            modified = str(taxon.get("modified") or "").strip()
            if not values["accepted_name"] and accepted:
                values["accepted_name"] = accepted
            if life_form and not values["growth_habit"]:
                values["growth_habit"] = "; ".join(life_form)
            habitat_values = habitat + vegetation + states
            if habitat_values and not values["habitat_distribution"]:
                values["habitat_distribution"] = "; ".join(habitat_values)
            fields_found = []
            if life_form:
                fields_found.append("growth_habit")
            if habitat_values:
                fields_found.append("habitat_distribution")
            status = "confirmado_parcial" if fields_found else values["characteristics_status"]
            values["characteristics_status"] = status
            source_ref = f"Reflora:{taxon.get('taxonid', '')}"
            values["characteristics_source"] = "; ".join(
                item for item in [values["characteristics_source"], source_ref] if item
            )
            values["reflora_taxon_id"] = str(taxon.get("taxonid") or "")
            values["reflora_taxonomic_status"] = str(
                taxon.get("taxonomicstatus") or ""
            )
            values["reflora_references"] = references
            values["reflora_record_url"] = flora_reference
            values["reflora_modified"] = modified
            values["review_note"] = (
                "Dados de forma de vida e/ou distribuição obtidos no Reflora; "
                "características restantes ainda requerem fonte específica."
            )
            evidence.append(
                {
                    "species_id": row["species_id"],
                    "field": "growth_habit",
                    "source": SOURCE_NAME,
                    "source_url": url,
                    "record_id": str(taxon.get("taxonid") or ""),
                    "consulted_at": date.today().isoformat(),
                    "status": "evidencia_estruturada" if life_form else "nao_encontrado",
                    "text": "; ".join(life_form),
                }
            )
            evidence.append(
                {
                    "species_id": row["species_id"],
                    "field": "habitat_distribution",
                    "source": SOURCE_NAME,
                    "source_url": url,
                    "record_id": str(taxon.get("taxonid") or ""),
                    "consulted_at": date.today().isoformat(),
                    "status": "evidencia_estruturada" if habitat_values else "nao_encontrado",
                    "text": "; ".join(habitat_values),
                }
            )
            evidence.append(
                {
                    "species_id": row["species_id"],
                    "field": "taxonomia",
                    "source": SOURCE_NAME,
                    "source_url": url,
                    "record_id": str(taxon.get("taxonid") or ""),
                    "consulted_at": date.today().isoformat(),
                    "status": "evidencia_estruturada",
                    "text": json.dumps(
                        {
                            "scientificname": taxon.get("scientificname"),
                            "taxonomicstatus": taxon.get("taxonomicstatus"),
                            "family": taxon.get("family"),
                            "references": taxon.get("references"),
                            "source": taxon.get("source"),
                            "modified": taxon.get("modified"),
                        },
                        ensure_ascii=False,
                    ),
                }
            )
        except Exception as error:
            evidence.append(
                {
                    "species_id": row["species_id"],
                    "field": "",
                    "source": SOURCE_NAME,
                    "source_url": url,
                    "record_id": "",
                    "consulted_at": date.today().isoformat(),
                    "status": "consulta_falhou",
                    "text": f"{type(error).__name__}: {error}",
                }
            )
            values["review_note"] = (
                "Consulta Reflora falhou; nenhum dado da fonte foi inferido."
            )
        enriched.append(values)
        time.sleep(0.05)

    with OUTPUT.open("w", encoding="utf-8", newline="") as file:
        writer = csv.DictWriter(file, fieldnames=list(enriched[0]))
        writer.writeheader()
        writer.writerows(enriched)
    with EVIDENCE.open("w", encoding="utf-8", newline="") as file:
        fields = [
            "species_id",
            "field",
            "source",
            "source_url",
            "record_id",
            "consulted_at",
            "status",
            "text",
        ]
        writer = csv.DictWriter(file, fieldnames=fields)
        writer.writeheader()
        writer.writerows(evidence)

    with_profile = sum(row["characteristics_status"] == "confirmado_parcial" for row in enriched)
    REPORT.write_text(
        f"""# Enriquecimento com Reflora

Data da execução: {date.today().isoformat()}

- Registros consultados: {len(enriched)}
- Registros com características parciais: {with_profile}
- Evidências registradas: {len(evidence)}
- Fonte: API oficial Flora do Brasil 2020 / Reflora
- Endpoint: `{API}{{taxonName}}`

Foram usados somente campos estruturados retornados pela API: forma de vida,
habitat, tipo de vegetação, distribuição por estado e taxonomia. Valores já
preenchidos pelo GBIF não foram substituídos; o Reflora só completou campos
vazios.

Folhas, flores, frutos, sementes, altura e ciclo de vida continuam vazios
quando a API não fornece esses campos. As evidências completas, com URL,
identificador e data, estão em `evidencias_caracteristicas_reflora.csv`.

As referências bibliográficas declaradas pelo Reflora foram preservadas nas
colunas `reflora_references`, `reflora_record_url` e `reflora_modified`; elas
indicam fontes para consulta, mas não foram convertidas automaticamente em
características morfológicas.

O treinamento permanece bloqueado até que a cobertura das características
necessárias seja suficiente e os critérios de seleção sejam definidos.
""",
        encoding="utf-8",
    )
    print(f"Reflora processado: {with_profile}/{len(enriched)} registros")


if __name__ == "__main__":
    main()
