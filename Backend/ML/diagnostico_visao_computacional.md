# Diagnóstico para experimentos de visão computacional

Data da execução: 2026-11-04

## Resumo

| Indicador | Resultado |
|---|---:|
| Registros com URL de imagem | 2376 |
| Espécies com imagens | 59 |
| Mínimo de imagens por espécie | 19 |
| Máximo de imagens por espécie | 75 |
| Mediana de imagens por espécie | 39 |
| Classes com menos de 10 imagens | 0 |
| URLs duplicadas | 0 |
| Imagens com identificação validada para treinamento | 0 |
| Imagens com qualidade avaliada | 0 |

## Licenças e metadados

Todas as imagens continuam com `reuse_status=verificar_licenca`; uma licença
informada não equivale a autorização automática para treinamento. Distribuição
de licenças observada: {'http://creativecommons.org/licenses/by-nc/4.0/': 1806, 'http://creativecommons.org/licenses/by/4.0/': 314, 'http://creativecommons.org/publicdomain/zero/1.0/': 103, 'http://creativecommons.org/licenses/by-nc-sa/4.0/': 22, 'Partial images provided by this server are released under the Creative Commons cc-by-sa 3.0 (generic) licence [https://creativecommons.org/licenses/by-sa/3.0/de/]. Please credit images to BGBM following our citation guidelines [https://ww2.bgbm.org/Herbarium/cite.cfm]. If you would like to use images in a format or resolution which is not provided here, please contact us (d.roepert[at]bgbm.org).': 2, 'http://creativecommons.org/licenses/by-nc-nd/4.0/': 41, 'http://creativecommons.org/licenses/by-nd/4.0/': 4, 'http://creativecommons.org/licenses/by/4.0/legalcode': 41, 'http://creativecommons.org/licenses/by-nc-sa/3.0/': 20, 'http://creativecommons.org/licenses/by-nc/4.0/legalcode': 3, 'http://creativecommons.org/licenses/by-sa/4.0/': 8, '(c) Field Museum of Natural History - CC BY-NC 4.0': 1, 'http://creativecommons.org/publicdomain/zero/1.0/legalcode': 5, 'Copyright by the creator. For license and creator details, see https://nabu-naturgucker-beobachtungen.de/?sprache=en&bild=697445089.': 1, 'Copyright by the creator. For license and creator details, see https://nabu-naturgucker-beobachtungen.de/?sprache=en&bild=-45546751.': 1, 'Copyright by the creator. For license and creator details, see https://nabu-naturgucker-beobachtungen.de/?sprache=en&bild=611568281.': 1, 'Copyright by the creator. For license and creator details, see https://nabu-naturgucker-beobachtungen.de/?sprache=en&bild=1246645386.': 1, 'Copyright by the creator. For license and creator details, see https://nabu-naturgucker-beobachtungen.de/?sprache=en&bild=1769604920.': 1, 'Copyright by the creator. For license and creator details, see https://nabu-naturgucker-beobachtungen.de/?sprache=en&bild=-1290123738.': 1}.

Tipos de imagem informados pelo GBIF: {'StillImage': 2373, 'nao_informado': 1, 'InteractiveResource': 2}.
Status de identificação: {'associada_ao_registro;nao_confirmada_para_treinamento': 2376}.

## Classes insuficientes

Foram consideradas insuficientes para uma divisão mínima de treino, validação
e teste as classes com menos de 10 imagens. A lista completa está em
`diagnostico_imagens_por_especie.csv`; nenhuma classe foi excluída.

- Nenhuma classe ficou abaixo do limiar de 10 imagens.


## Estratégia proposta de divisão

1. Revisar a identificação e a licença de cada imagem antes da inclusão.
2. Usar `occurrence_id` como grupo; imagens da mesma ocorrência não podem ser
   distribuídas entre conjuntos diferentes.
3. Aplicar divisão estratificada por espécie e por grupo em 70% treino, 15%
   validação e 15% teste somente após a revisão dos grupos.
4. Manter classes insuficientes fora do treinamento supervisionado inicial ou
   usar uma estratégia explicitamente aprovada; não criar amostras artificiais
   para mascarar a insuficiência.
5. Aplicar aumento de dados somente ao conjunto de treino.

O catálogo atual não permite avaliar ângulo, iluminação, fundo, estágio de
desenvolvimento, resolução efetiva ou imagens quase idênticas sem acessar os
arquivos. Portanto, ainda não há dataset pronto para treinamento e nenhum
modelo deve ser treinado com estes resultados.
