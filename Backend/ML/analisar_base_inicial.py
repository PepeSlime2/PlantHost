"""Analisa a base inicial de plantas hospedeiras sem alterar o XLSX original."""

from __future__ import annotations

import csv
import re
import unicodedata
import zipfile
from collections import Counter, defaultdict
from datetime import date
from pathlib import Path
from xml.etree import ElementTree


ROOT = Path(__file__).parent
INPUT = ROOT / "dataset_plantas_hospedeiras.xlsx"
OUTPUT_CSV = ROOT / "base_botanica_inicial.csv"
OUTPUT_REPORT = ROOT / "relatorio_base_inicial.md"

NS = {
    "main": "http://schemas.openxmlformats.org/spreadsheetml/2006/main",
    "office": "http://schemas.openxmlformats.org/officeDocument/2006/relationships",
    "package": "http://schemas.openxmlformats.org/package/2006/relationships",
}


def normalize(value: str) -> str:
    value = unicodedata.normalize("NFKD", value)
    value = "".join(char for char in value if not unicodedata.combining(char))
    return re.sub(r"\s+", " ", value).strip().casefold()


def column_number(reference: str) -> int:
    letters = re.match(r"[A-Z]+", reference or "")
    if not letters:
        raise ValueError(f"Referência de célula inválida: {reference!r}")
    number = 0
    for char in letters.group():
        number = number * 26 + ord(char) - ord("A") + 1
    return number


def read_workbook(path: Path) -> list[dict[str, str]]:
    with zipfile.ZipFile(path) as workbook:
        shared_strings: list[str] = []
        if "xl/sharedStrings.xml" in workbook.namelist():
            shared_root = ElementTree.fromstring(workbook.read("xl/sharedStrings.xml"))
            shared_strings = [
                "".join(node.itertext())
                for node in shared_root.findall("main:si", NS)
            ]

        workbook_root = ElementTree.fromstring(workbook.read("xl/workbook.xml"))
        relationships = ElementTree.fromstring(
            workbook.read("xl/_rels/workbook.xml.rels")
        )
        targets = {
            relationship.attrib["Id"]: relationship.attrib["Target"]
            for relationship in relationships.findall("package:Relationship", NS)
        }

        records: list[dict[str, str]] = []
        for sheet in workbook_root.findall("main:sheets/main:sheet", NS):
            name = sheet.attrib["name"]
            if name not in {"Silvestres hospedeiras", "Cultivadas hospedeiras"}:
                continue
            relationship_id = sheet.attrib[f"{{{NS['office']}}}id"]
            target = targets[relationship_id].lstrip("/")
            sheet_path = target if target.startswith("xl/") else f"xl/{target}"
            root = ElementTree.fromstring(workbook.read(sheet_path))
            rows: list[dict[int, str]] = []
            for row in root.findall(".//main:sheetData/main:row", NS):
                cells: dict[int, str] = {}
                for cell in row.findall("main:c", NS):
                    cell_type = cell.attrib.get("t")
                    value_node = cell.find("main:v", NS)
                    inline_node = cell.find("main:is", NS)
                    value = ""
                    if inline_node is not None:
                        value = "".join(inline_node.itertext())
                    elif value_node is not None:
                        value = value_node.text or ""
                        if cell_type == "s":
                            value = shared_strings[int(value)]
                    cells[column_number(cell.attrib.get("r", ""))] = value
                rows.append(cells)

            if not rows:
                continue
            headers = rows[0]
            for row_number, row in enumerate(rows[1:], start=2):
                common = row.get(1, "").strip()
                scientific = row.get(2, "").strip()
                family = row.get(3, "").strip()
                if not any((common, scientific, family)):
                    continue
                records.append(
                    {
                        "source_sheet": name,
                        "source_row": str(row_number),
                        "common_name_original": common,
                        "scientific_name_original": scientific,
                        "family_abbreviation_original": family,
                        "source_reference": "Haji et al. (2001), PDF BPD55",
                        "source_page": "10" if "Cultivadas" in name else "11-12",
                    }
                )
    return records


def write_csv(records: list[dict[str, str]]) -> None:
    fields = [
        "species_id",
        "category",
        "source_sheet",
        "source_row",
        "common_name_original",
        "scientific_name_original",
        "family_abbreviation_original",
        "accepted_name",
        "taxonomic_status",
        "source_reference",
        "source_page",
        "review_note",
    ]
    with OUTPUT_CSV.open("w", newline="", encoding="utf-8") as file:
        writer = csv.DictWriter(file, fieldnames=fields)
        writer.writeheader()
        for index, record in enumerate(records, start=1):
            category = (
                "cultivada"
                if "Cultivadas" in record["source_sheet"]
                else "silvestre"
            )
            writer.writerow(
                {
                    "species_id": f"PH-{index:03d}",
                    "category": category,
                    **record,
                    "accepted_name": "",
                    "taxonomic_status": "pendente_validacao",
                    "review_note": "",
                }
            )


def build_report(records: list[dict[str, str]]) -> None:
    by_category = Counter(
        "cultivadas" if "Cultivadas" in record["source_sheet"] else "silvestres"
        for record in records
    )
    scientific_by_category: dict[str, list[str]] = defaultdict(list)
    for record in records:
        category = (
            "cultivadas" if "Cultivadas" in record["source_sheet"] else "silvestres"
        )
        scientific_by_category[category].append(
            normalize(record["scientific_name_original"])
        )
    duplicate_scientific = {
        category: sorted(
            name for name, count in Counter(names).items() if count > 1
        )
        for category, names in scientific_by_category.items()
    }
    cross_category = sorted(
        set(scientific_by_category["cultivadas"])
        & set(scientific_by_category["silvestres"])
    )

    report = f"""# Diagnóstico da base botânica inicial

Data da análise: {date.today().isoformat()}

## Fontes conferidas

- Arquivo original: `dataset_plantas_hospedeiras.xlsx` (mantido sem alterações).
- Publicação: `BPD55.pdf`, Haji et al., Embrapa Semi-Árido, 2001.
- Tabela 1 da publicação: página impressa 10, plantas cultivadas.
- Tabela 2 da publicação: páginas impressas 11 e 12, plantas silvestres.

## Contagens

| Categoria | Planilha | Publicação | Situação |
|---|---:|---:|---|
| Cultivadas | {by_category["cultivadas"]} | 20 | conferida |
| Silvestres | {by_category["silvestres"]} | 48 | conferida |
| Total | {len(records)} | 68 | conferida |

O estudo usa “plantas daninhas” para a categoria que a planilha nomeia
“silvestres”. Essa diferença terminológica foi preservada como observação,
sem recategorizar os registros.

## Divergências e duplicidades

- A aba silvestre possui 48 linhas, mas 47 nomes científicos distintos.
- `Chamaesyce hirta (L.) Millsp.` aparece duas vezes, associado a nomes comuns
  diferentes (`Erva de santa fúria` e `Orelha de mexirra`). Os registros foram
  mantidos, pois a duplicidade pode representar nomes populares distintos e
  não deve ser removida automaticamente.
- A extração textual do PDF apresenta quebras de linha em
  `Richardia grandiflora (Cham. & Schlecht) Steudel` e
  `Manihot pseudoglaziovii Pax et K. Hoffman`; a planilha mantém as grafias
  completas em uma linha. Isso é uma diferença de apresentação, não uma
  confirmação de sinonímia.
- As siglas de família foram preservadas exatamente como na fonte (`L`, `R`,
  `Cu`, etc.). A expansão das famílias depende de validação taxonômica
  posterior.
- Não foram preenchidos nomes aceitos, sinônimos ou correções taxonômicas:
  esses campos permanecem como `pendente_validacao` até consulta registrada
  ao GBIF e ao Reflora.
"""
    if cross_category:
        report += (
            "\n- Sobreposições entre categorias detectadas: "
            + ", ".join(cross_category)
            + ".\n"
        )
    else:
        report += "\n- Não foram detectadas sobreposições entre categorias pela grafia original.\n"
    report += """
## Rastreabilidade

O arquivo `base_botanica_inicial.csv` atribui um identificador estável
(`PH-001`, ...) e preserva a aba, a linha, o nome comum, o nome científico e a
sigla de família de origem. A coluna `accepted_name` ficará separada da coluna
original para impedir substituições silenciosas.

## Próxima etapa

Consultar GBIF e Reflora por registro, armazenando o nome aceito, sinônimos,
identificador, URL, data da consulta e divergências. Registros sem confirmação
devem permanecer com status de revisão; nenhum registro deve ser excluído
automaticamente.
"""
    OUTPUT_REPORT.write_text(report, encoding="utf-8")


def main() -> None:
    records = read_workbook(INPUT)
    if len(records) != 68:
        raise RuntimeError(f"Esperados 68 registros, encontrados {len(records)}")
    write_csv(records)
    build_report(records)
    print(f"Gerados: {OUTPUT_CSV.name} e {OUTPUT_REPORT.name}")


if __name__ == "__main__":
    main()
