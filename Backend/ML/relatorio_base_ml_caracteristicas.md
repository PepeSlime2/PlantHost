# Base de ML por características botânicas

Data da consolidação: 2026-11-04

Esta é a base destinada ao futuro modelo tabular. Imagens não são entradas do
modelo e serão associadas somente depois da identificação da espécie.

## Cobertura extraída

- `growth_habit`: 43/68 registros
- `life_cycle`: 15/68 registros
- `height`: 0/68 registros
- `leaf_traits`: 0/68 registros
- `flower_traits`: 0/68 registros
- `fruit_seed_traits`: 0/68 registros
- `habitat_distribution`: 42/68 registros

## Limitação essencial

A API oficial do Reflora retornou, para os registros consultados, forma de
vida, habitat, tipo de vegetação, distribuição e taxonomia. A API do GBIF
retornou descrições classificadas como hábito, forma de vida e distribuição em
parte dos registros. As fontes consultadas não retornaram de forma estruturada
altura, morfologia de folhas, flores, frutos ou sementes para a base completa.

Esses campos foram mantidos vazios e classificados como
`nao_disponivel_na_fonte` em `status_caracteristicas.csv`. Isso não significa
que a característica não exista; significa que ela não foi extraída de uma
fonte acessível e verificável nesta execução.

## Critério para treinamento

O treinamento permanece bloqueado enquanto a equipe não definir uma política
para os campos ausentes e não houver características suficientes, com fonte
rastreável, para distinguir as espécies. Não foram criados valores sintéticos,
inferidos por nome ou copiados entre espécies.
