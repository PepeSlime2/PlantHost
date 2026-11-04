# Dicionário de dados

## `base_botanica_enriquecida.csv`

| Campo | Tipo | Obrigatório | Descrição | Origem |
|---|---|---:|---|---|
| `species_id` | string | sim | Identificador estável `PH-NNN` | gerado a partir da planilha |
| `category` | enum | sim | `cultivada` ou `silvestre` | planilha original |
| `common_name_original` | string | sim | Nome popular sem substituição | planilha original |
| `scientific_name_original` | string | sim | Nome científico original | planilha/PDF |
| `family_abbreviation_original` | string | não | Sigla de família da fonte | planilha original |
| `accepted_name` | string/null | não | Nome retornado pelo GBIF | GBIF |
| `taxonomic_status` | enum | sim | `confirmado_gbif` ou `revisao_taxonomica` | GBIF/script |
| `gbif_key` | string/null | não | Identificador taxonômico GBIF | GBIF |
| `gbif_family` | string/null | não | Família taxonômica retornada | GBIF |
| `gbif_genus` | string/null | não | Gênero retornado | GBIF |
| `gbif_species` | string/null | não | Espécie retornada | GBIF |
| `growth_habit` | string/null | não | Hábito de crescimento documentado; entrada do ML | Reflora/fonte especializada |
| `life_cycle` | string/null | não | Ciclo de vida documentado | Reflora/fonte especializada |
| `height` | string/null | não | Altura documentada | Reflora/fonte especializada |
| `leaf_traits` | string/null | não | Características das folhas | Reflora/fonte especializada |
| `flower_traits` | string/null | não | Características das flores | Reflora/fonte especializada |
| `fruit_seed_traits` | string/null | não | Frutos e sementes | Reflora/fonte especializada |
| `habitat_distribution` | string/null | não | Habitat e distribuição; entrada do ML | GBIF/Reflora |
| `characteristics_status` | enum | sim | Estado de preenchimento botânico | script |
| `reflora_taxon_id` | string/null | não | Identificador taxonômico no Reflora | Reflora |
| `reflora_taxonomic_status` | string/null | não | Status nomenclatural/taxonômico | Reflora |
| `reflora_references` | string/null | não | Referências bibliográficas declaradas pela fonte | Reflora |
| `reflora_record_url` | URL/null | não | Página do registro taxonômico | Reflora |
| `reflora_modified` | datetime/null | não | Data de atualização informada pela fonte | Reflora |
| `source_reference` | string | sim | Referência do estudo original | PDF |
| `source_page` | string | não | Página da tabela original | PDF |

## `catalogo_imagens_gbif.csv`

| Campo | Tipo | Obrigatório | Descrição | Origem |
|---|---|---:|---|---|
| `image_id` | string | sim | Identificador interno `GBIF-NNNNNN` | gerado pelo script |
| `species_id` | string | sim | Relação com a base botânica | base enriquecida |
| `occurrence_id` | string | não | Identificador da ocorrência | GBIF |
| `image_url` | URL | sim para imagem | URL original, sem download | GBIF |
| `record_url` | URL | sim para imagem | Página da ocorrência | GBIF |
| `license` | string/null | não | Licença declarada no registro | GBIF |
| `consulted_at` | date | sim | Data da consulta | script |
| `identification_status` | enum | sim | Associação não confirmada para treinamento | GBIF/script |
| `reuse_status` | enum | sim | `verificar_licenca` até revisão humana | script |
| `quality_status` | enum | sim | Qualidade ainda não avaliada | GBIF/script |

Valores ausentes são representados por string vazia nos CSVs para manter
compatibilidade simples; consumidores devem interpretá-los como `null`.

O arquivo `evidencias_fontes_complementares.csv` acrescenta `location_context`,
que registra o país, estado, região ou contexto bibliográfico informado pela
fonte. Localizações ausentes são declaradas como não informadas; nunca são
inferidas pelo nome científico.

## Regra do modelo

O modelo identifica a espécie a partir exclusivamente dos campos de
características botânicas. Imagens não são entradas do treinamento e serão
associadas apenas depois da identificação. O treinamento é bloqueado enquanto
as características e suas fontes não estiverem preenchidas.
