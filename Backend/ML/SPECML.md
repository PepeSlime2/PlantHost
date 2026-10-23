# SPEC ML 1 — DATASET BOTÂNICO, CARACTERÍSTICAS E IMAGENS

## Objetivo

Construir um dataset botânico confiável, rastreável e reproduzível para o PlantHost AI, utilizando o arquivo `dataset_plantas_hospedeiras.xlsx` como base inicial e enriquecendo seus registros com informações taxonômicas, características botânicas e imagens provenientes de fontes confiáveis.

As fontes complementares prioritárias são:

- **GBIF:** https://www.gbif.org/
- **Reflora — Flora e Funga do Brasil:** https://floradobrasil.jbrj.gov.br/
- **Reflora — Herbário Virtual:** https://reflora.jbrj.gov.br/

O trabalho deve gerar uma base estruturada que possa apoiar a identificação de espécies, a consulta de características botânicas e a futura preparação de dados para modelos de visão computacional.

## Card 1 — Análise da base inicial e das fontes

### Atividades

- Localizar e analisar o PDF original do estudo da Embrapa no repositório.
- Localizar e analisar o arquivo `dataset_plantas_hospedeiras.xlsx`.
- Utilizar as abas de plantas silvestres e cultivadas como ponto de partida.
- Conferir os registros do Excel com o documento original.
- Verificar a quantidade de espécies mencionada no estudo, incluindo as 52 invasoras, 20 cultivadas e 48 silvestres, confirmando o que cada categoria representa.
- Identificar sobreposições entre categorias sem excluir registros automaticamente.
- Preservar nome popular, nome científico, família, categoria, referência e página de origem, quando disponíveis.
- Identificar nomes científicos desatualizados, sinônimos, erros de grafia e registros duplicados.
- Consultar GBIF e Reflora para conferir a identificação taxonômica e localizar registros complementares.
- Registrar quais informações vieram do arquivo original e quais foram obtidas nas fontes complementares.

### Regras

- Não substituir silenciosamente os nomes originais.
- Preservar o nome científico original e registrar separadamente o nome aceito, quando confirmado.
- Não considerar duas espécies diferentes como equivalentes apenas porque seus nomes populares são iguais.
- Não remover registros sem documentar a justificativa.
- Se houver divergência entre fontes, registrar a divergência para revisão.

**Commit:** `feat(ml): valida base botanica inicial [Trello #ID]`

## Card 2 — Enriquecimento das características botânicas

### Atividades

Pesquisar e registrar características botânicas das espécies presentes na base, priorizando fontes oficiais, taxonômicas e científicas.

Características a investigar, quando disponíveis:

- Nome científico aceito e sinônimos.
- Nome popular.
- Família botânica.
- Gênero e espécie.
- Hábito de crescimento: erva, arbusto, árvore, trepadeira ou outras categorias justificadas.
- Ciclo de vida: anual, bienal ou perene.
- Altura ou faixa de altura.
- Características das folhas: formato, disposição, margem, nervação e outras informações documentadas.
- Características das flores: cor, formato, simetria e tipo de inflorescência.
- Características dos frutos e sementes.
- Presença de espinhos, pelos ou outras estruturas relevantes.
- Habitat e distribuição geográfica, quando documentados.
- Características úteis para diferenciar espécies visualmente semelhantes.

### Fontes

- Utilizar o Reflora — Flora e Funga do Brasil para conferir a nomenclatura e a classificação taxonômica.
- Utilizar o GBIF para consultar taxonomia, distribuição e registros de ocorrência.
- Consultar publicações científicas, herbários e outras fontes especializadas quando as características não estiverem suficientemente documentadas nas fontes principais.

### Regras

- Registrar a fonte específica de cada característica ou conjunto de características.
- Registrar URL, data de consulta e identificador do registro, quando disponível.
- Representar informações ausentes como `null` ou outro padrão definido no dicionário de dados.
- Diferenciar informação confirmada, informação não encontrada e informação que necessita de revisão.
- Não inferir características a partir apenas do nome da espécie.
- Não preencher atributos com valores estimados sem metodologia documentada.
- Manter a rastreabilidade entre cada registro enriquecido e a espécie correspondente na base original.

**Commit:** `feat(ml): enriquece caracteristicas botanicas [Trello #ID]`

## Card 3 — Coleta e organização de imagens

### Objetivo

Localizar imagens associadas às espécies do dataset para avaliar sua qualidade e disponibilidade para uso no PlantHost AI, tanto na consulta visual quanto em futuros experimentos de classificação de imagens.

### GBIF

- Pesquisar registros de ocorrência associados aos nomes científicos validados.
- Priorizar registros com identificação taxonômica consistente e imagens disponíveis.
- Coletar, quando disponíveis, URL da imagem, identificador da ocorrência, nome científico associado, instituição ou dataset de origem e licença.
- Registrar a referência original do registro e a data de consulta.
- Verificar se a imagem está acessível e se apresenta qualidade suficiente para a finalidade proposta.

Documentação de referência: https://techdocs.gbif.org/en/openapi/

### Reflora

- Consultar o Herbário Virtual Reflora para localizar espécimes e imagens associados às espécies.
- Registrar a espécie identificada, o herbário ou coleção de origem e o identificador do espécime, quando disponíveis.
- Registrar o link da página do registro e os metadados de identificação.
- Verificar as condições de acesso e de reutilização das imagens.

Portal de dados abertos: https://ferramentasreflora.jbrj.gov.br/dados-abertos?lang=pt_BR

### Metadados obrigatórios das imagens

Sempre que a informação estiver disponível, registrar:

- Identificador interno da imagem.
- Nome científico associado.
- Identificador da espécie no dataset.
- URL original da imagem.
- Fonte: GBIF, Reflora ou outra fonte autorizada.
- Identificador do registro, ocorrência ou espécime.
- Licença e condições de reutilização.
- Data de coleta ou consulta.
- Tipo de imagem: planta inteira, folha, flor, fruto, semente, espécime de herbário ou outro.
- Método de obtenção e caminho local do arquivo, caso seja armazenado.
- Status de validação da identificação.
- Observações sobre resolução, qualidade e possíveis problemas.

### Regras para as imagens

- Não considerar toda imagem associada a um registro como identificação taxonômica confirmada.
- Não presumir que imagens de espécimes de herbário sejam equivalentes a fotografias de plantas em campo.
- Não baixar nem redistribuir imagens sem verificar as condições de uso.
- Diferenciar imagens disponíveis apenas para consulta de imagens autorizadas para treinamento.
- Evitar duplicatas, imagens quebradas, imagens sem identificação confiável e registros com espécies ambíguas.
- Não misturar imagens de espécies diferentes na mesma classe sem justificativa e validação.
- Não afirmar que existe um dataset de imagens adequado antes de avaliar a quantidade, a diversidade, a qualidade e as licenças dos registros.

**Commit:** `feat(ml): coleta e organiza imagens botanicas [Trello #ID]`

## Card 4 — Preparação e qualidade do dataset

### Atividades

- Exportar a base tabular validada para CSV, mantendo o arquivo XLSX original como referência.
- Criar um dicionário de dados com nome, tipo, descrição, obrigatoriedade e origem de cada campo.
- Padronizar nomes de colunas, categorias, valores ausentes e identificadores.
- Identificar duplicatas, inconsistências taxonômicas e registros sem fonte.
- Separar os dados originais dos dados enriquecidos, sem sobrescrever a base de origem.
- Criar scripts reproduzíveis para extração, limpeza, consulta às fontes e preparação.
- Registrar erros de coleta, falhas de acesso às fontes e espécies sem informações suficientes.
- Gerar um relatório de qualidade com totais, cobertura, duplicatas, ausências e divergências.
- Documentar a versão das fontes consultadas e a data de execução dos scripts.

### Regras

- Não alterar a arquitetura existente sem necessidade justificada.
- Não adicionar dependências sem verificar as regras e o ambiente do projeto.
- Não incluir credenciais, tokens ou segredos nos scripts ou no Git.
- Não versionar grandes conjuntos de imagens no repositório sem autorização e estratégia definida.
- Manter os dados e os scripts organizados conforme os padrões já utilizados pelo projeto.

**Commit:** `feat(ml): prepara e valida dataset botanico [Trello #ID]`

## Card 5 — Preparação dos dados para experimentos de visão computacional

### Atividades

Após avaliar as imagens disponíveis:

- Contabilizar o número de imagens por espécie.
- Avaliar diversidade de ângulos, iluminação, fundo, estágio de desenvolvimento e condições de captura.
- Identificar classes com poucas imagens ou forte desbalanceamento.
- Verificar duplicatas e imagens quase idênticas.
- Definir critérios de inclusão e exclusão.
- Separar treino, validação e teste por planta, espécime, ocorrência ou grupo de imagens relacionadas, conforme os metadados disponíveis.
- Evitar que imagens da mesma planta ou do mesmo espécime apareçam em conjuntos diferentes.
- Aplicar aumento de dados somente ao conjunto de treinamento.
- Documentar limitações e riscos de viés, incluindo diferenças entre imagens de herbário e imagens de campo.

### Critério para avançar

Antes de iniciar o treinamento, apresentar um diagnóstico contendo:

- Número de espécies com imagens disponíveis.
- Quantidade de imagens por espécie.
- Percentual de imagens com identificação validada.
- Situação das licenças.
- Qualidade e diversidade visual.
- Quantidade de classes com dados insuficientes.
- Estratégia proposta de divisão dos dados.

O início do treinamento deve depender da avaliação desses resultados, e não apenas da existência de imagens.

**Commit:** `feat(ml): prepara imagens para experimentos [Trello #ID]`

## Entregáveis

1. Base botânica inicial conferida e enriquecida.
2. CSV validado e arquivo XLSX original preservado.
3. Dicionário de dados.
4. Tabela de correspondência entre nomes originais e nomes científicos aceitos.
5. Características botânicas com referências rastreáveis.
6. Catálogo de imagens com metadados, URLs, identificadores e licenças.
7. Scripts reproduzíveis de coleta, limpeza e preparação.
8. Relatório de qualidade e cobertura das informações.
9. Diagnóstico de viabilidade para experimentos de visão computacional.
10. Documentação das fontes, limitações e decisões tomadas.

## Integração com o restante do projeto

- Alinhar os identificadores e campos com o Backend 1 antes de definir o formato final dos dados.
- Reutilizar o esquema de espécies existente no projeto sempre que possível.
- Não criar uma estrutura paralela incompatível com o banco de dados.
- Separar dados taxonômicos, características botânicas e metadados de imagens.
- Definir identificadores estáveis para relacionar cada espécie, característica, fonte e imagem.
- Documentar o formato dos arquivos e os contratos necessários para consumo pelos outros módulos.
- Comunicar alterações de estrutura antes de implementá-las.

## Critérios de conclusão

O trabalho será considerado concluído quando:

- A base inicial estiver conferida e suas divergências documentadas.
- As características botânicas estiverem associadas a fontes verificáveis.
- As imagens localizadas tiverem seus metadados e condições de reutilização registrados.
- A qualidade e a cobertura dos dados estiverem documentadas.
- Os scripts puderem ser executados novamente seguindo as instruções.
- A estrutura estiver alinhada com o Backend 1.
- Não houver afirmações não comprovadas sobre a qualidade do dataset ou sobre o desempenho futuro do modelo.

## Primeira ação obrigatória

Antes de modificar arquivos, localizar o PDF original da Embrapa, o arquivo `dataset_plantas_hospedeiras.xlsx` e a estrutura atual do repositório. Apresentar um diagnóstico inicial da base e um plano de enriquecimento com GBIF e Reflora, incluindo os campos propostos, a estratégia de coleta de imagens e as limitações identificadas.

**Não reescrever módulos existentes, não treinar um modelo prematuramente e não alterar contratos de integração sem alinhamento com os responsáveis.**