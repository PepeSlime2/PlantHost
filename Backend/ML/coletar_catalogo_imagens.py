"""Cataloga imagens públicas do GBIF sem baixar ou redistribuir arquivos."""

from __future__ import annotations

import csv
import json
import time
from datetime import date
from pathlib import Path
from urllib.parse import urlencode
from urllib.request import Request, urlopen


ROOT = Path(__file__).parent
INPUT = ROOT / "base_botanica_enriquecida.csv"
OUTPUT = ROOT / "catalogo_imagens_gbif.csv"
REPORT = ROOT / "relatorio_catalogo_imagens.md"
API = "https://api.gbif.org/v1/occurrence/search"


def get_json(params: dict[str, str | int]) -> dict:
    request = Request(
        f"{API}?{urlencode(params)}",
        headers={"User-Agent": "PlantHostAI-ML/1.0"},
    )
    with urlopen(request, timeout=30) as response:
        return json.load(response)


def media_url(media: dict) -> str:
    return str(media.get("identifier") or media.get("references") or "")


def collect(rows: list[dict[str, str]]) -> list[dict[str, str]]:
    catalog: list[dict[str, str]] = []
    seen: set[tuple[str, str]] = set()
    for row in rows:
        accepted = row["accepted_name"].strip()
        if not accepted:
            continue
        try:
            result = get_json(
                {
                    "scientificName": accepted,
                    "media_type": "StillImage",
                    "limit": 20,
                    "offset": 0,
                }
            )
        except Exception as error:
            catalog.append(
                {
                    "image_id": "",
                    "species_id": row["species_id"],
                    "scientific_name": accepted,
                    "source": "GBIF",
                    "occurrence_id": "",
                    "image_url": "",
                    "record_url": "",
                    "license": "",
                    "institution": "",
                    "dataset": "",
                    "consulted_at": date.today().isoformat(),
                    "image_type": "nao_verificada",
                    "identification_status": "consulta_falhou",
                    "reuse_status": "nao_avaliado",
                    "quality_status": "nao_avaliada",
                    "notes": f"{type(error).__name__}: {error}",
                }
            )
            continue
        for occurrence in result.get("results", []):
            occurrence_id = str(
                occurrence.get("key")
                or occurrence.get("gbifID")
                or occurrence.get("occurrenceID")
                or ""
            )
            for media in occurrence.get("media", []):
                url = media_url(media)
                unique = (occurrence_id, url)
                if not url or unique in seen:
                    continue
                seen.add(unique)
                catalog.append(
                    {
                        "image_id": f"GBIF-{len(catalog) + 1:06d}",
                        "species_id": row["species_id"],
                        "scientific_name": str(
                            occurrence.get("scientificName") or accepted
                        ),
                        "source": "GBIF",
                        "occurrence_id": occurrence_id,
                        "image_url": url,
                        "record_url": (
                            "https://www.gbif.org/occurrence/" + occurrence_id
                            if occurrence_id
                            else ""
                        ),
                        "license": str(media.get("license") or occurrence.get("license") or ""),
                        "institution": str(occurrence.get("institutionCode") or ""),
                        "dataset": str(occurrence.get("datasetName") or ""),
                        "consulted_at": date.today().isoformat(),
                        "image_type": str(media.get("type") or "nao_informado"),
                        "identification_status": (
                            "associada_ao_registro;nao_confirmada_para_treinamento"
                        ),
                        "reuse_status": "verificar_licenca",
                        "quality_status": "nao_avaliada",
                        "notes": (
                            "Imagem catalogada por metadados; não baixada. "
                            "Validar identificação, resolução e licença antes do uso."
                        ),
                    }
                )
        time.sleep(0.1)
    return catalog


def write_catalog(catalog: list[dict[str, str]]) -> None:
    fields = [
        "image_id",
        "species_id",
        "scientific_name",
        "source",
        "occurrence_id",
        "image_url",
        "record_url",
        "license",
        "institution",
        "dataset",
        "consulted_at",
        "image_type",
        "identification_status",
        "reuse_status",
        "quality_status",
        "notes",
    ]
    with OUTPUT.open("w", newline="", encoding="utf-8") as file:
        writer = csv.DictWriter(file, fieldnames=fields)
        writer.writeheader()
        writer.writerows(catalog)


def write_report(rows: list[dict[str, str]], catalog: list[dict[str, str]]) -> None:
    species_with_images = len({row["species_id"] for row in catalog if row["image_url"]})
    licenses = sum(bool(row["license"]) for row in catalog)
    failures = sum(row["identification_status"] == "consulta_falhou" for row in catalog)
    REPORT.write_text(
        f"""# Catálogo inicial de imagens

Data da consulta: {date.today().isoformat()}

- Espécies com nome aceito consultadas: {sum(bool(row["accepted_name"]) for row in rows)}
- Registros de imagem catalogados: {sum(bool(row["image_url"]) for row in catalog)}
- Espécies com pelo menos uma imagem: {species_with_images}
- Imagens com licença informada: {licenses}
- Consultas com falha registradas: {failures}

## Limitações

O catálogo contém URLs e metadados do GBIF; as imagens não foram baixadas.
Uma associação de imagem a uma ocorrência não é confirmação independente da
identificação taxonômica. `reuse_status=verificar_licenca` impede tratar os
registros como autorizados para treinamento sem análise da licença e dos termos
do registro original.

As colunas `quality_status` e `image_type` permanecem não avaliadas ou refletem
somente o metadado fornecido pelo GBIF. O catálogo não constitui ainda um
dataset pronto para treinamento.
""",
        encoding="utf-8",
    )


def main() -> None:
    with INPUT.open(encoding="utf-8", newline="") as file:
        rows = list(csv.DictReader(file))
    catalog = collect(rows)
    write_catalog(catalog)
    write_report(rows, catalog)
    print(f"Gerados: {OUTPUT.name} e {REPORT.name}; registros: {len(catalog)}")


if __name__ == "__main__":
    main()
