"""Coleta características declaradas em descrições taxonômicas do GBIF."""

from __future__ import annotations

import csv
import json
import time
from datetime import date
from pathlib import Path
from urllib.parse import quote
from urllib.request import Request, urlopen


ROOT = Path(__file__).parent
INPUT = ROOT / "base_botanica_enriquecida.csv"
SOURCES = ROOT / "fontes_taxonomicas.csv"
OUTPUT = ROOT / "base_botanica_caracteristicas.csv"
EVIDENCE = ROOT / "evidencias_caracteristicas.csv"
REPORT = ROOT / "relatorio_caracteristicas_botanicas.md"
FEATURE_URL = "https://api.gbif.org/v1/species/{key}/descriptions"

FEATURES = (
    "growth_habit",
    "life_cycle",
    "height",
    "leaf_traits",
    "flower_traits",
    "fruit_seed_traits",
    "habitat_distribution",
)


def get_json(url: str) -> dict:
    request = Request(url, headers={"User-Agent": "PlantHostAI-ML/1.0"})
    with urlopen(request, timeout=30) as response:
        return json.load(response)


def feature_for(description_type: str, text: str) -> str:
    kind = description_type.casefold().replace("_", " ")
    value = text.casefold()
    if "habit" in kind:
        return "growth_habit"
    if "life form" in kind or "lifeform" in kind:
        return "life_cycle"
    if "native range" in kind or "distribution" in kind or "range" in kind:
        return "habitat_distribution"
    if "leaf" in kind or "foliage" in kind:
        return "leaf_traits"
    if "flower" in kind or "inflorescence" in kind:
        return "flower_traits"
    if "fruit" in kind or "seed" in kind:
        return "fruit_seed_traits"
    # Textual keyword matching is deliberately not used to infer a field.
    del value
    return ""


def main() -> None:
    with INPUT.open(encoding="utf-8", newline="") as file:
        rows = list(csv.DictReader(file))
    with SOURCES.open(encoding="utf-8", newline="") as file:
        source_rows = list(csv.DictReader(file))

    evidence: list[dict[str, str]] = []
    enriched: list[dict[str, str]] = []
    for row in rows:
        values = {field: "" for field in FEATURES}
        field_sources: list[str] = []
        key = row["gbif_key"].strip()
        if key:
            try:
                descriptions = get_json(FEATURE_URL.format(key=quote(key))).get(
                    "results", []
                )
            except Exception as error:
                descriptions = []
                evidence.append(
                    {
                        "species_id": row["species_id"],
                        "field": "",
                        "source": "GBIF",
                        "source_url": FEATURE_URL.format(key=key),
                        "record_id": "",
                        "consulted_at": date.today().isoformat(),
                        "status": "consulta_falhou",
                        "text": f"{type(error).__name__}: {error}",
                    }
                )
            for item in descriptions:
                text = str(item.get("description") or "").strip()
                if not text:
                    continue
                item_type = str(item.get("type") or "").strip()
                field = feature_for(item_type, text)
                evidence.append(
                    {
                        "species_id": row["species_id"],
                        "field": field,
                        "source": "GBIF",
                        "source_url": FEATURE_URL.format(key=key),
                        "record_id": str(item.get("key") or ""),
                        "consulted_at": date.today().isoformat(),
                        "status": "evidencia_textual" if field else "nao_mapeada",
                        "text": text,
                    }
                )
                if field and not values[field]:
                    values[field] = text
                    field_sources.append(
                        f"GBIF:{item.get('key', '')} ({item_type or 'sem tipo'})"
                    )
        status = (
            "confirmado_parcial"
            if any(values.values())
            else "nao_encontrado"
        )
        enriched.append(
            {
                **row,
                **values,
                "characteristics_status": status,
                "characteristics_source": "; ".join(field_sources),
                "review_note": (
                    "Evidência textual GBIF coletada; conferir no Reflora e "
                    "em fonte especializada antes do treinamento."
                    if any(values.values())
                    else "Nenhuma característica estruturada encontrada no GBIF; "
                    "consulta manual ao Reflora pendente."
                ),
            }
        )
        time.sleep(0.05)

    source_fields = [
        "species_id",
        "field",
        "source",
        "source_url",
        "record_id",
        "consulted_at",
        "status",
        "text",
    ]
    with EVIDENCE.open("w", encoding="utf-8", newline="") as file:
        writer = csv.DictWriter(file, fieldnames=source_fields)
        writer.writeheader()
        writer.writerows(evidence)
    with OUTPUT.open("w", encoding="utf-8", newline="") as file:
        writer = csv.DictWriter(file, fieldnames=list(enriched[0]))
        writer.writeheader()
        writer.writerows(enriched)

    found = sum(row["characteristics_status"] == "confirmado_parcial" for row in enriched)
    REPORT.write_text(
        f"""# Características botânicas documentadas

Data da execução: {date.today().isoformat()}

- Registros processados: {len(enriched)}
- Registros com pelo menos uma evidência estruturada: {found}
- Registros sem característica estruturada no GBIF: {len(enriched) - found}
- Evidências textuais registradas: {len(evidence)}

As características foram preenchidas somente quando o GBIF forneceu uma
descrição cujo tipo declarava explicitamente o campo correspondente (`habit`,
`life form`, `native range`, folha, flor, fruto ou semente). Não houve inferência
por nome científico, nome popular ou palavras soltas no texto.

Cada evidência está em `evidencias_caracteristicas.csv`, com URL, identificador,
data e texto original. O Reflora ainda precisa ser consultado manualmente para
confirmar ou complementar os campos. Registros sem evidência permanecem
vazios e não podem ser usados no treinamento.

O modelo continua bloqueado até que as características necessárias tenham
cobertura suficiente, fonte botânica validada e uma política explícita para
valores ausentes.
""",
        encoding="utf-8",
    )
    print(f"Características coletadas: {found}/{len(enriched)} registros")


if __name__ == "__main__":
    main()
