# PLANTHOST AI — SPEC GERAL DE DESENVOLVIMENTO SEGURO

## 1. Objetivo

Desenvolver o PlantHost AI de forma colaborativa, mantendo a arquitetura, as funcionalidades existentes e a compatibilidade entre frontend, backend e Machine Learning.

## 2. Regra principal: preservar o projeto existente

Antes de alterar qualquer arquivo:

1. Analise a estrutura atual do repositório.
2. Leia o README, as dependências, as configurações, as rotas, os modelos de dados e os testes existentes.
3. Identifique a tecnologia e os padrões já adotados.
4. Verifique o estado do Git e as alterações pendentes.
5. Apresente um plano curto indicando os arquivos que pretende criar ou modificar.

Não reescreva o projeto do zero. Não substitua arquivos de configuração, dependências, banco de dados, componentes ou módulos existentes sem necessidade comprovada.

Não remova funcionalidades existentes para simplificar a implementação.

Se houver conflito entre este SPEC e a arquitetura real do projeto, preserve o funcionamento atual e proponha a menor alteração possível.

## 3. Regra obrigatória do Trello e Git

Trabalhe em apenas um card por vez.

Para cada card:

1. Identifique o card e seu checklist.
2. Inspecione os arquivos envolvidos.
3. Implemente somente o escopo daquele card.
4. Execute os testes pertinentes.
5. Revise o diff para identificar alterações indevidas.
6. Apresente os arquivos modificados e os resultados dos testes.
7. Faça o commit correspondente, se autorizado.
8. Só então avance para o próximo card.

Formato dos commits:

- `feat(front): descrição [Trello #ID]`
- `feat(back): descrição [Trello #ID]`
- `feat(ml): descrição [Trello #ID]`
- `fix(front): descrição [Trello #ID]`
- `test(ml): descrição [Trello #ID]`
- `docs(back): descrição [Trello #ID]`

Substitua `ID` pelo identificador real do card.

Não faça um único commit contendo vários cards. Não misture alterações de outros integrantes. Não faça commit diretamente na branch principal sem autorização.

Se a IA não puder executar o Git, apresente os comandos exatos para o integrante executar. Nunca declare que fez um commit se ele não foi realizado.

## 4. Regras de segurança técnica

- Não exponha credenciais, tokens ou arquivos `.env`.
- Não execute comandos destrutivos sem autorização explícita.
- Não apague dados nem recrie o banco de produção.
- Não faça migrações irreversíveis sem aprovação.
- Não altere versões de dependências indiscriminadamente.
- Não introduza uma segunda implementação para uma funcionalidade que já existe.
- Não instale bibliotecas sem justificar a necessidade.
- Não desative testes ou verificações para fazer o build passar.
- Não apresente dados fictícios como resultados reais.

## 5. Integração entre integrantes

Antes de criar ou alterar contratos compartilhados, consulte a documentação existente e alinhe a proposta com os responsáveis.

O frontend deve consumir contratos publicados pelo backend.

O backend deve integrar o modelo por meio de uma interface estável, sem depender da máquina local de um integrante.

O status de planta hospedeira deve possuir fonte de evidência botânica rastreável. Não deve ser inferido exclusivamente pela confiança do classificador de imagens.

Quando uma dependência ainda não estiver pronta, use mocks isolados apenas para desenvolvimento e identifique-os claramente.

## 6. Critérios para concluir um card

Um card só pode ser considerado concluído quando:

- O checklist foi atendido.
- O código respeita a arquitetura existente.
- Os testes pertinentes foram executados.
- O build ou a verificação equivalente passou, quando aplicável.
- O diff foi revisado.
- A documentação necessária foi atualizada.
- O commit está vinculado ao card correto.
- As limitações e instruções de teste foram registradas no Trello.

## 7. Formato obrigatório da resposta da IA

Ao terminar cada card, apresente:

1. O que foi implementado.
2. Arquivos criados e modificados.
3. Testes executados e resultados reais.
4. Problemas pendentes e dependências de outros integrantes.
5. Comando e mensagem do commit.
6. Como validar manualmente a funcionalidade.

Não avance automaticamente para o próximo card. Aguarde a confirmação do integrante.

**Prioridade máxima:** preservar o que já funciona e realizar alterações pequenas, verificáveis e alinhadas ao card atual.