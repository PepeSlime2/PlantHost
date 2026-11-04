# Fila de extração de características botânicas

Data da geração: 2026-11-04

- Espécies com referências bibliográficas no Reflora: 37
- Status inicial de todas as tarefas: `pendente_extracao`

## Campos pendentes por espécie

- `growth_habit`: 0 espécie(s)
- `life_cycle`: 23 espécie(s)
- `height`: 37 espécie(s)
- `leaf_traits`: 37 espécie(s)
- `flower_traits`: 37 espécie(s)
- `fruit_seed_traits`: 37 espécie(s)
- `habitat_distribution`: 0 espécie(s)

## Procedimento

Para cada linha de `fila_revisao_referencias.csv`, consultar a referência
indicada pelo Reflora e registrar apenas características explicitamente
descritas na publicação. Preencher `reviewed_source_url`,
`reviewed_source_id`, `reviewed_at` e `notes`; depois incorporar os valores à
base enriquecida mantendo a fonte em `evidencias_caracteristicas_reflora.csv`.

Não usar busca por nome como substituto da leitura da fonte. Se a referência
não estiver acessível ou não descrever o atributo, manter o campo vazio e
alterar o status para `nao_localizada` ou `nao_descrito`.
