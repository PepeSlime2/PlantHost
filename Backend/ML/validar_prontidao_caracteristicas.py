"""Verifica se a base tem características suficientes para treinar o ML."""

from __future__ import annotations

import csv
from datetime import date
from pathlib import Path


ROOT = Path(__file__).parent
INPUT = ROOT / "base_botanica_caracteristicas_reflora.csv"
REPORT = ROOT / "relatorio_prontidao_modelo_caracteristicas.md"

FEATURE_FIELDS = (
    "growth_habit",
    "life_cycle",
    "height",
    "leaf_traits",
    "flower_traits",
    "fruit_seed_traits",
    "habitat_distribution",
)
TARGET_FIELD = "accepted_name"


def main() -> None:
    with INPUT.open(encoding="utf-8", newline="") as file:
        rows = list(csv.DictReader(file))
    if not rows:
        raise RuntimeError("A base de características está vazia.")

    complete_features = [
        row
        for row in rows
        if all(row.get(field, "").strip() for field in FEATURE_FIELDS)
    ]
    targets = sum(bool(row.get(TARGET_FIELD, "").strip()) for row in rows)
    feature_values = {
        field: sum(bool(row.get(field, "").strip()) for row in rows)
        for field in FEATURE_FIELDS
    }
    ready = len(complete_features) > 0 and targets == len(rows)
    missing_fields = ", ".join(
        field for field, count in feature_values.items() if count < len(rows)
    )

    REPORT.write_text(
        f"""# Prontidão do modelo baseado em características

Data da verificação: {date.today().isoformat()}

## Decisão

- Registros avaliados: {len(rows)}
- Registros com todas as características preenchidas: {len(complete_features)}
- Registros com espécie-alvo (`accepted_name`): {targets}
- Pronto para treinamento: **{"sim" if ready else "não"}**

Características preenchidas por campo:

{chr(10).join(f"- `{field}`: {count}/{len(rows)}" for field, count in feature_values.items())}

## Regra de segurança

O treinamento só pode começar quando cada registro selecionado tiver
características botânicas documentadas, fonte rastreável e uma espécie-alvo
validada. Nomes populares, URLs de imagens e texto ausente não substituem
características botânicas.

{"Ainda faltam dados nos campos: " + missing_fields + "." if missing_fields else "Todos os campos estão preenchidos."}

Imagens não participam do treinamento. O catálogo de imagens permanece
reservado para associação posterior à espécie identificada.
""",
        encoding="utf-8",
    )
    print(
        f"Treinamento por características pronto: {ready}; "
        f"registros completos: {len(complete_features)}/{len(rows)}"
    )
    if not ready:
        raise SystemExit(2)


if __name__ == "__main__":
    main()
