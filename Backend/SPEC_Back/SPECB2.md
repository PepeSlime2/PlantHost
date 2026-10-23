# SPEC BACKEND 2 — API E REGRAS DE NEGÓCIO

## Objetivo

Implementar os fluxos de identificação de plantas, cadastro de espécies, validação por especialistas e consulta de alertas, integrando o backend ao frontend e ao módulo de inferência de ML.

## Card 1 — Endpoint de identificação

Implementar ou adaptar `POST /api/identificar`.

- Validar imagem e tamanho do arquivo.
- Integrar com a interface de inferência fornecida pela equipe de ML.
- Padronizar a resposta.
- Retornar espécie provável, confiança, versão do modelo e status de identificação.
- Consultar separadamente o status botânico de hospedeira.
- Tratar falhas, timeouts e resultados inconclusivos.
- Criar testes de sucesso e falha.

O contrato deve ser acordado com frontend e ML antes da implementação.

Commit: `feat(back): integra endpoint de identificação [Trello #ID]`

## Card 2 — Cadastro de espécies

Implementar ou adaptar `POST /api/especies`.

- Validar campos obrigatórios.
- Validar categorias e características.
- Evitar duplicidade conforme regra acordada com Backend 1.
- Persistir usando os modelos e as migrações existentes.
- Retornar o registro criado.
- Testar entradas inválidas e duplicadas.

Commit: `feat(back): implementa cadastro de espécies [Trello #ID]`

## Card 3 — Validação por especialistas

Implementar ou adaptar `PUT /api/especies/{id}/validar`.

- Validar autenticação e permissões no servidor.
- Definir estados e transições permitidas.
- Registrar responsável, data, decisão e observações.
- Impedir alterações não autorizadas.
- Testar permissões, dados inválidos e registros inexistentes.

Commit: `feat(back): implementa validação por especialistas [Trello #ID]`

## Card 4 — Motor de alertas

Implementar a geração e consulta de alertas relacionados às identificações e à ocorrência de plantas hospedeiras.

- Definir regras de geração com a equipe de domínio.
- Criar ou adaptar o histórico de alertas.
- Evitar alertas duplicados.
- Implementar rotina de consolidação quando necessária.
- Disponibilizar `GET /api/alertas`.
- Retornar somente região, criticidade e status sustentados pelos dados disponíveis.
- Testar geração, consulta e prevenção de duplicidades.

Não inventar localização ou incidência regional com base apenas na identificação de uma planta.

Commit: `feat(back): implementa motor de alertas [Trello #ID]`

## Card 5 — Integração e documentação

- Documentar os endpoints de sua responsabilidade.
- Atualizar Swagger/OpenAPI.
- Definir formato de erros, autenticação e limites de requisição.
- Criar testes de integração entre API e inferência.
- Comunicar ao frontend quando cada endpoint estiver disponível.

Commit: `docs(back): documenta identificação e alertas [Trello #ID]`

## Regras de integração

- Reutilizar os modelos de dados definidos pelo Backend 1.
- Não duplicar rotas nem criar outro sistema de autenticação sem necessidade.
- Não embutir caminhos locais da máquina de ML na API.
- Não retornar dados simulados como resultados reais.
- Preservar a compatibilidade com as rotas já utilizadas pelo projeto.

## Critério de conclusão

Endpoints funcionais, regras de permissão testadas, integração com ML documentada e contratos publicados para o frontend.

**Primeira ação:** inspecionar a aplicação, os modelos, as rotas e os serviços existentes e apresentar o plano do primeiro card sem modificar arquivos.