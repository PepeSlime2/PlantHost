# Diagnóstico da base botânica inicial

Data da análise: 2026-11-04

## Fontes conferidas

- Arquivo original: `dataset_plantas_hospedeiras.xlsx` (mantido sem alterações).
- Publicação: `BPD55.pdf`, Haji et al., Embrapa Semi-Árido, 2001.
- Tabela 1 da publicação: página impressa 10, plantas cultivadas.
- Tabela 2 da publicação: páginas impressas 11 e 12, plantas silvestres.

## Contagens

| Categoria | Planilha | Publicação | Situação |
|---|---:|---:|---|
| Cultivadas | 20 | 20 | conferida |
| Silvestres | 48 | 48 | conferida |
| Total | 68 | 68 | conferida |

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

- Não foram detectadas sobreposições entre categorias pela grafia original.

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
