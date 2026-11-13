"""
Testes automatizados da API do PlantHost AI Backend.
Cobre os contratos e requisitos de SPECB1 e SPECB2.
"""

import io
import pytest
from PIL import Image
from fastapi.testclient import TestClient
from Backend.app.main import app


@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c


def test_root_and_health(client):
    res = client.get("/")
    assert res.status_code == 200
    assert res.json()["status"] == "online"

    res_h = client.get("/health")
    assert res_h.status_code == 200
    assert res_h.json()["status"] == "healthy"


def test_dashboard_stats(client):
    res = client.get("/api/dashboard/stats")
    assert res.status_code == 200
    data = res.json()
    assert data["total_especies"] >= 68
    assert data["total_hospedeiras"] >= 68
    assert data["total_alertas_ativos"] >= 1
    assert len(data["modelos_disponiveis"]) >= 2


def test_listar_especies_paginadas(client):
    res = client.get("/api/especies?page=1&per_page=5")
    assert res.status_code == 200
    data = res.json()
    assert data["page"] == 1
    assert data["per_page"] == 5
    assert len(data["items"]) == 5
    assert data["total"] >= 68


def test_busca_especie_textual(client):
    # Busca por nome científico ou comum
    res = client.get("/api/especies?q=Arruda")
    assert res.status_code == 200
    items = res.json()["items"]
    assert len(items) >= 1
    assert any("Arruda" in (i["common_name"] or "") or "Ruta" in i["scientific_name"] for i in items)


def test_filtro_categoria_e_hospedeira(client):
    res = client.get("/api/especies?category=cultivada&host_status=registrada")
    assert res.status_code == 200
    items = res.json()["items"]
    assert len(items) >= 1
    for i in items:
        assert i["category"] == "cultivada"
        assert i["host_status"] == "registrada"


def test_detalhes_especie(client):
    res = client.get("/api/especies/1")
    assert res.status_code == 200
    data = res.json()
    assert data["id"] == 1
    assert data["scientific_name"] is not None
    assert len(data["fontes"]) >= 1


def test_cadastro_especie_e_anti_duplicidade(client):
    nova = {
        "scientific_name": "Solanum testecadastro L.",
        "common_name": "Planta de Teste",
        "family": "Solanaceae",
        "category": "silvestre",
        "habit": "Herbácea",
        "host_status": "registrada",
        "host_type": "Hospedeira secundária",
    }
    # Primeiro cadastro -> 201 Created
    res1 = client.post("/api/especies", json=nova)
    assert res1.status_code in [201, 409]

    # Segundo cadastro com o mesmo nome -> 409 Conflict
    res2 = client.post("/api/especies", json=nova)
    assert res2.status_code == 409
    assert "já está cadastrada" in res2.json()["detail"]


def test_validacao_especialista(client):
    payload = {
        "especialista_nome": "Dra. Maria Botânica",
        "especialista_email": "maria@embrapa.br",
        "decisao": "aprovado",
        "observacoes": "Morfologia e evidência de hospedeira confirmadas em herbário.",
    }
    res = client.put("/api/especies/1/validar", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["decisao"] == "aprovado"
    assert data["especialista_nome"] == "Dra. Maria Botânica"

    # Confere se o status na espécie foi atualizado
    res_sp = client.get("/api/especies/1")
    assert res_sp.json()["validation_status"] == "aprovado"


def test_identificacao_caracteristicas(client):
    payload = {
        "familia": "Malvaceae",
        "habito": "Erva",
        "distribuicao": "Semiárido",
    }
    res = client.post("/api/identificar/caracteristicas", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "species" in data
    assert "confidence" in data
    assert len(data["ranking"]) >= 3
    assert data["input_mode"] == "caracteristicas"
    assert "host_evidence" in data
    assert data["host_evidence"]["is_host"] is True


def test_identificacao_imagem(client):
    # Cria imagem sintética em memória
    img = Image.new("RGB", (120, 120), color=(50, 150, 50))
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    buf.seek(0)

    files = {"file": ("folha_teste.jpg", buf, "image/jpeg")}
    res = client.post("/api/identificar/imagem", files=files)
    assert res.status_code == 200
    data = res.json()
    assert "species" in data
    assert "confidence" in data
    assert data["input_mode"] == "imagem"
    assert "image_metadata" in data


def test_motor_alertas(client):
    # Lista alertas
    res = client.get("/api/alertas")
    assert res.status_code == 200
    alertas = res.json()
    assert len(alertas) >= 1

    # Cria novo alerta
    novo_alerta = {
        "especie_id": 2,
        "regiao": "Sertão Central Cearense",
        "criticidade": "alta",
        "mensagem": "Alta incidência de ninfas de mosca-branca detectada em lavouras vizinhas.",
        "status": "ativo",
    }
    res_c = client.post("/api/alertas", json=novo_alerta)
    assert res_c.status_code in [201, 409]

    # Prevenção de duplicidade: postar idêntico deve dar 409
    res_dup = client.post("/api/alertas", json=novo_alerta)
    assert res_dup.status_code == 409
