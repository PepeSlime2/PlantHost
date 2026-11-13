# Documentação Técnica da API — PlantHost AI

## Visão Geral

A API do **PlantHost AI** fornece serviços para identificação botânica, inferência via Machine Learning, gerenciamento do acervo taxonômico de plantas hospedeiras de mosca-branca (*Bemisia tabaci / Bemisia argentifolii*), motor de alertas fitossanitários e validação por especialistas.

- **URL Base:** `http://localhost:8000`
- **Swagger UI Interativo:** `http://localhost:8000/docs`
- **ReDoc:** `http://localhost:8000/redoc`
- **OpenAPI Schema:** `http://localhost:8000/openapi.json`

---

## Endpoints Principais

### 1. Dashboard
- `GET /api/dashboard/stats`: Retorna total de espécies, espécies silvestres, cultivadas, total de hospedeiras registradas, alertas ativos e modelos de ML disponíveis.

### 2. Espécies Botânicas (SPECB1 - Cards 2 e 3; SPECB2 - Cards 2 e 3)
- `GET /api/especies`:
  - **Parâmetros:**
    - `q` (string): Busca textual por nome científico, popular ou família.
    - `category` (string): `silvestre`, `cultivada` ou `invasora`.
    - `host_status` (string): `registrada`, `sem_registro` ou `indisponivel`.
    - `validation_status` (string): `pendente`, `aprovado` ou `rejeitado`.
    - `page` (int, default=1): Página.
    - `per_page` (int, default=10, max=100): Itens por página.
  - **Resposta:** `EspeciesPaginadas` com total, paginação estável e lista de espécies com características e fontes.
- `GET /api/especies/{id}`: Detalhes de uma espécie específica.
- `POST /api/especies`: Cadastro de nova espécie botânica com validação anti-duplicidade.
- `PUT /api/especies/{id}/validar`: Parecer técnico de especialista botânico (decisão: `aprovado`, `rejeitado`, `necessita_revisao`).

### 3. Identificação e Inferência de Machine Learning (SPECB2 - Card 1)
- `POST /api/identificar/caracteristicas`:
  - **Payload JSON:** Características morfológicas observadas (hábito, família, folhas, flores, caule, distribuição).
  - **Resposta:** Espécie provável, ranking probabilístico com softmax calibrado, nível de confiança, versão do modelo e evidências de hospedeira no banco.
- `POST /api/identificar/imagem`:
  - **Payload Multipart:** Arquivo de imagem (`JPEG`, `PNG`, `WEBP` até 15MB).
  - **Resposta:** Espécie provável via visão computacional, metadados cromáticos/morfológicos, ranking e status fitossanitário.

### 4. Motor de Alertas (SPECB2 - Card 4)
- `GET /api/alertas`: Consulta alertas ativos ou filtrados por região e criticidade (`alta`, `media`, `baixa`).
- `POST /api/alertas`: Registro de novo alerta regional de proliferação com prevenção de duplicidades.
- `PUT /api/alertas/{id}/resolver`: Marcação de alerta resolvido.

---

## Como Executar o Backend

```bash
uvicorn Backend.app.main:app --reload --port 8000
```

