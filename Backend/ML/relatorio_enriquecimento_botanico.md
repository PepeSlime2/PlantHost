# Relatório de enriquecimento botânico

Data da execução: 2026-11-04

## Resultado taxonômico

- Registros processados: 68
- Correspondências taxonômicas utilizáveis no GBIF: 52
- Registros mantidos para revisão: 16
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
