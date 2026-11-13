"""
Endpoint de Identificação de Espécies (SPECB2 - Card 1).
Integração com o pipeline de Machine Learning (inferência por características ou imagem)
e consulta independente de evidências botânicas de hospedeira.
"""

from typing import Optional
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Especie
from ..schemas import IdentificacaoFeaturesIn, IdentificacaoResultadoOut, PredicaoItem
from Backend.ML.inferencia_especies import engine as ml_engine

router = APIRouter(prefix="/api/identificar", tags=["Identificação de Espécies (ML)"])

MAX_IMAGE_SIZE_BYTES = 15 * 1024 * 1024  # 15 MB
ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/bmp"]


def _enrich_prediction_with_db(pred_res: dict, db: Session) -> dict:
    """
    Enriquece o resultado do modelo de ML consultando a base botânica oficial no banco.
    Atende à regra: 'O status de planta hospedeira deve possuir fonte de evidência botânica
    rastreável. Não deve ser inferido exclusivamente pela confiança do classificador.'
    """
    best_species = pred_res["species"]
    sci_name = best_species["scientific_name"]

    # Busca no banco de dados pelo nome científico ou species_id
    db_sp = (
        db.query(Especie)
        .filter(
            (Especie.scientific_name.ilike(sci_name))
            | (Especie.species_id == best_species.get("species_id"))
        )
        .first()
    )

    if db_sp:
        # Atualiza dados com a autoridade botânica persistida
        best_species["host_status"] = db_sp.host_status
        best_species["category"] = db_sp.category
        best_species["family"] = db_sp.family
        if db_sp.common_name:
            best_species["common_name"] = db_sp.common_name

        fontes_list = [f.nome_fonte for f in db_sp.fontes] or ["Embrapa BPD 55"]
        host_evidence = {
            "is_host": db_sp.host_status == "registrada",
            "host_status": db_sp.host_status,
            "host_type": db_sp.host_type or "Hospedeira comprovada de Bemisia tabaci",
            "sources": fontes_list,
            "validation_status": db_sp.validation_status,
        }
    else:
        host_evidence = {
            "is_host": False,
            "host_status": "sem_registro",
            "host_type": "Sem evidência registrada no acervo",
            "sources": [],
            "validation_status": "nao_cadastrado",
        }

    pred_res["host_evidence"] = host_evidence
    return pred_res


@router.post("/caracteristicas", response_model=IdentificacaoResultadoOut)
def identificar_por_caracteristicas(
    dados: IdentificacaoFeaturesIn,
    db: Session = Depends(get_db),
):
    """
    Identifica espécie por características botânicas (hábito, folha, flor, distribuição, etc.).
    Processa via modelo Multi-trait Classifier / Random Forest e cruza evidências botânicas no banco.
    """
    try:
        features_dict = dados.model_dump(exclude_unset=True)
        resultado = ml_engine.predict_by_features(features_dict, top_k=5)
        resultado_enriquecido = _enrich_prediction_with_db(resultado, db)
        return resultado_enriquecido
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Falha na inferência por características: {str(e)}",
        )


@router.post("/imagem", response_model=IdentificacaoResultadoOut)
async def identificar_por_imagem(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    """
    Identifica espécie a partir de upload fotográfico da planta.
    Valida formato, integridade e tamanho da imagem. Executa inferência via PlantHost-Vision.
    """
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Tipo de arquivo '{file.content_type}' não suportado. Formatos válidos: JPEG, PNG, WEBP.",
        )

    image_bytes = await file.read()
    if len(image_bytes) > MAX_IMAGE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"Arquivo excede o tamanho máximo permitido de {MAX_IMAGE_SIZE_BYTES // (1024*1024)}MB.",
        )

    try:
        resultado = ml_engine.predict_by_image(image_bytes, filename=file.filename or "imagem.jpg", top_k=5)
        resultado_enriquecido = _enrich_prediction_with_db(resultado, db)
        return resultado_enriquecido
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Falha na inferência de visão computacional: {str(e)}",
        )
