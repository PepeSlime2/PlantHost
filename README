# PlantHost AI

Sistema inteligente para identificação e monitoramento de plantas silvestres hospedeiras da mosca-branca no Semiárido brasileiro.

O projeto combina dados botânicos, modelos de Machine Learning e uma interface web para apoiar produtores, agrônomos e pesquisadores na análise de risco fitossanitário.

## Visão geral

O PlantHost AI foi pensado para responder a um problema real do campo: a mosca-branca (Bemisia tabaci / Bemisia argentifolii) pode sobreviver em espécies vegetais silvestres e em bordas de lavoura, tornando difícil a identificação de focos de risco.

A plataforma reúne:

- cadastro e consulta de espécies botânicas;
- classificação morfológica com Machine Learning;
- rastreio de evidências científicas e fontes botânicas;
- dashboard de indicadores e alertas;
- API REST para integração entre frontend e backend;
- interface moderna para uso em ambiente web.

## Funcionalidades principais

### 1. Acervo botânico
- cadastro de espécies com dados taxonômicos, categoria e status de hospedeira;
- busca por nome científico, nome popular ou família;
- paginação e filtros por categoria, status e validação;
- evidências de fontes como Embrapa, Reflora, GBIF e demais referências.

### 2. Identificação por ML
- classificação de espécies por características morfológicas;
- uso de modelo supervisionado baseado em atributos como família, hábito, folhas, flores e caule;
- retorno com ranking de espécies mais prováveis e evidência de hospedeira.

### 3. Alertas fitossanitários
- monitoramento de regiões de risco;
- indicadores de criticidade e status do alerta;
- suporte para decisões rápidas no manejo de plantas hospedeiras.

### 4. Dashboard administrativo
- total de espécies cadastradas;
- contagem por categoria;
- quantidade de espécies hospedeiras registradas;
- alertas ativos e validações realizadas.

## Stack tecnológica

### Backend
- Python
- FastAPI
- SQLAlchemy
- SQLite
- Pydantic
- scikit-learn
- Pandas / NumPy

### Frontend
- React
- TypeScript
- Vite
- Tailwind CSS
- TanStack Router / React Query

### Machine Learning
- Random Forest Classifier
- processamento de dados morfológicos e taxonômicos
- base de espécies enriquecida com informações botânicas e fontes científicas

## Estrutura do repositório

```text
PlantHostAI/
├── Backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── models.py
│   │   ├── database.py
│   │   ├── schemas.py
│   │   ├── seed.py
│   │   └── routers/
│   ├── ML/
│   │   ├── inferencia_especies.py
│   │   └── bases e dados do modelo
│   ├── data/
│   ├── tests/
│   ├── requirements.txt
│   └── venv/
├── Frontend/
│   ├── src/
│   ├── package.json
│   ├── vite.config.ts
│   └── public/
├── assets_slides/
├── Apresentacao_PlantHost_AI.md
├── Apresentacao_PlantHost_AI.pptx
├── README.md
├── SPEC.md
└── gerar_apresentacao_*.py
```

## Pré-requisitos

Antes de rodar o projeto, verifique se você possui:

- Python 3.11+
- Node.js 20+
- npm ou bun
- Git

## Como executar

### 1. Backend

A partir da raiz do projeto:

```bash
cd Backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

A API estará disponível em:

- http://localhost:8000
- documentação Swagger: http://localhost:8000/docs
- documentação ReDoc: http://localhost:8000/redoc

### 2. Frontend

Em outro terminal:

```bash
cd Frontend
npm install
npm run dev
```

A interface web será iniciada em:

- http://localhost:5173

## Endpoints principais

### Dashboard
- GET /api/dashboard/stats

### Espécies
- GET /api/especies
- GET /api/especies/{especie_id}
- POST /api/especies
- PUT /api/especies/{especie_id}/validar

### Identificação
- POST /api/identificar/caracteristicas
- POST /api/identificar/imagem

## Exemplos de uso

### Verificar saúde da API

```bash
curl http://localhost:8000/health
```

### Consultar estatísticas do dashboard

```bash
curl http://localhost:8000/api/dashboard/stats
```

### Listar espécies

```bash
curl "http://localhost:8000/api/especies?page=1&per_page=10"
```

## Dados e base de conhecimento

O projeto trabalha com dados botânicos e evidências científicas da região do Semiárido, incluindo referências associadas a plantas hospedeiras e base de atributos morfológicos.

A camada de ML foi construída sobre atributos como:

- família;
- hábito;
- forma de vida;
- ciclo de vida;
- características de folhas, flores e caule;
- distribuição geográfica.

## Observações importantes

- o backend usa SQLite local para persistência das entidades do sistema;
- a parte de ML é orientada por dados tabulares e atributos botânicos, não por visão computacional genérica;
- o projeto é acadêmico e voltado para demonstração, validação e extensão de um fluxo completo de diagnóstico e gestão.

## Status do projeto

MVP em desenvolvimento com integração funcional entre:

- backend FastAPI;
- banco relacional local;
- modelo preditivo morfológico;
- frontend em React;
- conjunto de dados botânicos e dashboard de indicadores.

## Contribuição

Para colaborar com o projeto:

1. faça o fork do repositório;
2. crie uma branch para sua feature ou correção;
3. implemente as mudanças;
4. valide a execução localmente;
5. abra um pull request com descrição clara.

## Contato

Este README foi escrito para servir como guia geral do projeto. Para detalhes específicos sobre desenvolvimento, regras de negócio e arquitetura, consulte os arquivos e pastas internas do repositório, especialmente a área de Backend e os materiais de apresentação do projeto.
