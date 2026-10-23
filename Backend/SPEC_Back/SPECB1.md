# SPEC BACKEND 1 — BANCO, MODELO BOTÂNICO E CONSULTAS

## Objetivo

Responsabilizar-se pela estrutura de dados do PlantHost AI, pela consulta das espécies e pela eficiência das operações no banco.

Antes de implementar, identificar a tecnologia de banco, o ORM, as migrações e os modelos existentes. Não presumir que o projeto utiliza uma tecnologia específica sem verificar o repositório.

## Card 1 — Atualização do esquema

- Revisar os modelos atuais.
- Elaborar diagrama ER atualizado.
- Definir campos para nome científico, nome popular, família, categoria, características botânicas, fontes e status de hospedeira.
- Definir relacionamentos, restrições e regras de integridade.
- Criar migrações versionadas.
- Testar as migrações em ambiente de desenvolvimento.

Não recriar o banco nem apagar dados existentes.

Commit: `feat(back): atualiza esquema botânico [Trello #ID]`

## Card 2 — Consulta de espécies

Implementar ou adaptar `GET /api/especies`, respeitando o padrão atual do projeto.

Requisitos:
- Listagem de espécies.
- Busca textual por nomes.
- Filtros por categoria e status de hospedeira.
- Paginação e ordenação estável.
- Validação dos parâmetros.
- Resposta compatível com o frontend.
- Testes de busca, filtros, paginação e resultados vazios.

Commit: `feat(back): implementa consulta de espécies [Trello #ID]`

## Card 3 — Otimização de consultas

- Identificar consultas lentas.
- Revisar joins e possíveis consultas N+1.
- Criar índices justificados pelo padrão de acesso.
- Medir desempenho antes e depois.
- Preservar consistência dos dados e das migrações.

Commit: `perf(back): otimiza consultas botânicas [Trello #ID]`

## Card 4 — Documentação técnica

- Documentar os endpoints sob sua responsabilidade.
- Registrar parâmetros, filtros, paginação e códigos HTTP.
- Garantir compatibilidade com Swagger/OpenAPI.
- Incluir exemplos reais de requisição e resposta.
- Manter a documentação coerente com a implementação.

Commit: `docs(back): documenta esquema e consultas [Trello #ID]`

## Integração com as equipes

- Alinhar os campos botânicos com a equipe de ML.
- Alinhar o formato das respostas com o frontend.
- Não alterar unilateralmente contratos já utilizados.
- Registrar fontes das informações botânicas.
- Não assumir que as categorias do estudo da Embrapa são mutuamente exclusivas sem verificar o documento original.

## Critério de conclusão

Migrações testadas, diagrama ER atualizado, endpoints validados e documentação suficiente para os outros integrantes utilizarem a API.

**Primeira ação:** inspecionar o banco, os modelos, as rotas e as migrações existentes; apresentar o plano para o primeiro card antes de modificar arquivos.