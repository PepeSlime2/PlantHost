# Enriquecimento com Reflora

Data da execução: 2026-11-04

- Registros consultados: 68
- Registros com características parciais: 46
- Evidências registradas: 164
- Fonte: API oficial Flora do Brasil 2020 / Reflora
- Endpoint: `https://servicos.jbrj.gov.br/v2/flora/taxon/{taxonName}`

Foram usados somente campos estruturados retornados pela API: forma de vida,
habitat, tipo de vegetação, distribuição por estado e taxonomia. Valores já
preenchidos pelo GBIF não foram substituídos; o Reflora só completou campos
vazios.

Folhas, flores, frutos, sementes, altura e ciclo de vida continuam vazios
quando a API não fornece esses campos. As evidências completas, com URL,
identificador e data, estão em `evidencias_caracteristicas_reflora.csv`.

As referências bibliográficas declaradas pelo Reflora foram preservadas nas
colunas `reflora_references`, `reflora_record_url` e `reflora_modified`; elas
indicam fontes para consulta, mas não foram convertidas automaticamente em
características morfológicas.

O treinamento permanece bloqueado até que a cobertura das características
necessárias seja suficiente e os critérios de seleção sejam definidos.
