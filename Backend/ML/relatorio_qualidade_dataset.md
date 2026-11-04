# Relatório de qualidade do dataset

Data da execução: 2026-11-04

## Totais e cobertura

| Indicador | Resultado |
|---|---:|
| Registros botânicos | 68 |
| Registros com nome aceito GBIF | 60 (88.2%) |
| Registros de imagens catalogados | 2376 |
| Espécies com imagens | 59 |
| Imagens com licença informada | 2376 (100.0%) |
| Problemas estruturais detectados | 0 |

## Verificações

- IDs e referências entre imagens e espécies foram conferidos.
- Campos obrigatórios de origem foram conferidos.
- URLs duplicadas e identificadores repetidos foram procurados.
- O XLSX original não é sobrescrito; os CSVs enriquecidos são derivados.
- Nomes sem confirmação GBIF permanecem com status de revisão.
- Imagens permanecem como catálogo de consulta, não como conjunto autorizado
  para treinamento.

## Pendências

Características morfológicas continuam sem preenchimento automatizado.
Licenças, identificação visual, resolução, duplicatas perceptuais e tipo de
imagem exigem revisão específica antes de qualquer experimento.

Detalhes estruturados estão em `problemas_qualidade.csv`.
