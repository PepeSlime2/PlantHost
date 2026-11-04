# Características botânicas documentadas

Data da execução: 2026-11-04

- Registros processados: 68
- Registros com pelo menos uma evidência estruturada: 41
- Registros sem característica estruturada no GBIF: 27
- Evidências textuais registradas: 614

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
