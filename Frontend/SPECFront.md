# SPEC FRONTEND — PLANTHOST AI
**Responsável:** Felipe Scatralli

## Objetivo

Integrar o frontend já desenvolvido no Lovable ao repositório existente do PlantHost AI, aproveitando os componentes, as telas e os estilos já implementados.

O projeto está disponível no arquivo `PlantHost.zip`. A integração deve seguir rigorosamente os oito cards do Trello, na ordem definida abaixo.

## Regras específicas

1. Inspecione o repositório principal e o ZIP antes de modificar arquivos.
2. Identifique as páginas e os componentes que já estão prontos.
3. Não recrie telas existentes sem necessidade.
4. Não substitua a estrutura do projeto principal pela estrutura do ZIP.
5. Preserve rotas, dependências, configurações, estilos e funcionalidades existentes.
6. Não copie `node_modules`, segredos ou arquivos de ambiente.
7. Resolva conflitos de arquivos conscientemente, sem sobrescrever mudanças de outros integrantes.
8. Integre apenas o necessário para o card atual.
9. Use a API real quando disponível e mantenha mocks isolados quando necessário.
10. Não avance para outro card antes de concluir e validar o atual.

## Card 1 — Tela inicial e dashboard

- Integrar o layout e a navegação existentes.
- Exibir indicadores consolidados de espécies, categorias, hospedeiras e modelos, conforme os dados disponíveis.
- Consumir os dados do backend quando o contrato estiver definido.
- Implementar o botão “Iniciar identificação”.
- Criar estados de carregamento, erro e ausência de dados.

Commit: `feat(front): implementa dashboard [Trello #ID]`

## Card 2 — Upload de imagem

- Implementar seleção de imagem.
- Integrar arrastar e soltar.
- Exibir prévia e permitir substituir ou remover a imagem.
- Suportar captura pela câmera em dispositivos móveis, quando disponível.
- Validar formato e tamanho.
- Preparar envio conforme o contrato do endpoint de identificação.
- Tratar erros de upload e indisponibilidade da API.

Commit: `feat(front): implementa upload de imagem [Trello #ID]`

## Card 3 — Resultados da identificação

- Exibir espécie provável e nomes disponíveis.
- Exibir confiança retornada pelo modelo.
- Exibir status de hospedeira retornado pelo backend.
- Diferenciar resultado inconclusivo de falha técnica.
- Mostrar características e fontes quando fornecidas.
- Não inventar probabilidades nem informações botânicas.

Commit: `feat(front): apresenta resultados de identificação [Trello #ID]`

## Card 4 — Responsividade mobile

- Revisar breakpoints e estilos.
- Testar telas pequenas, tablets e desktops.
- Ajustar botões, campos, modais, tabelas e cartões.
- Garantir usabilidade do upload e da câmera em dispositivos compatíveis.
- Corrigir rolagem horizontal indevida.

Commit: `feat(front): ajusta responsividade mobile [Trello #ID]`

## Card 5 — Consulta da base botânica

- Integrar listagem de espécies.
- Exibir nome científico, nome popular, família, categoria e status de hospedeira, conforme a API.
- Implementar busca.
- Implementar filtros de espécies silvestres, cultivadas e hospedeiras, conforme os dados disponíveis.
- Respeitar paginação e ordenação do backend.
- Tratar lista vazia, erros e carregamento.

Commit: `feat(front): implementa consulta botânica [Trello #ID]`

## Card 6 — Validação de espécies

- Criar ou integrar a tela de validação.
- Exibir as informações necessárias à análise do especialista.
- Integrar o endpoint de validação acordado com o backend.
- Exibir sucesso, falha e ausência de permissão.
- Evitar envios duplicados.
- Não implementar segurança somente no frontend: a autorização deve ser validada pelo backend.

Commit: `feat(front): implementa validação de espécies [Trello #ID]`

## Card 7 — Painel de alertas

- Integrar a consulta de alertas do backend.
- Exibir espécie, região, criticidade, data e status quando disponíveis.
- Implementar lista ou mapa conforme os dados realmente fornecidos.
- Não inventar coordenadas nem gerar alertas no frontend.
- Tratar ausência de alertas e falhas da API.

Commit: `feat(front): implementa painel de alertas [Trello #ID]`

## Card 8 — Erros e feedbacks visuais

- Padronizar loaders e indicadores de processamento.
- Criar mensagens amigáveis para falha de identificação, API indisponível e arquivo inválido.
- Permitir novas tentativas quando apropriado.
- Tratar resultados inconclusivos.
- Preservar os dados preenchidos sempre que possível.
- Garantir consistência visual entre as telas.

Commit: `fix(front): padroniza erros e feedbacks [Trello #ID]`

## Procedimento de integração do ZIP

Para cada card:

1. Localize no ZIP os componentes e as telas relacionadas.
2. Compare-os com os arquivos do repositório principal.
3. Integre somente os arquivos necessários.
4. Ajuste imports, rotas e estilos preservando a arquitetura.
5. Execute build e lint usando os scripts já definidos no projeto.
6. Revise o diff para detectar alterações não relacionadas.
7. Faça o commit do card.
8. Registre no Trello os arquivos integrados e como testar.

## Critério de conclusão

Os oito cards devem estar implementados individualmente, com commits correspondentes e integração funcional com a API, sem substituir desnecessariamente o projeto existente.

**Primeira ação:** analisar o ZIP e o repositório e apresentar um plano de integração para o Card 1. Não modificar arquivos antes dessa análise.