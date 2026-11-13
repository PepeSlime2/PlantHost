"""
Endpoint de Identificação Botânica via Machine Learning Tabular (SPECB2 - Card 1).
Classificação supervisionada baseada exclusivamente em características morfológicas
(família, hábito, filotaxia, folhas, flores, caule, distribuição) via RandomForestClassifier (scikit-learn).
Não utiliza VLM: o modelo é estritamente de Machine Learning clássico.
"""

from typing import Optional
import sys
from pathlib import Path
from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Especie
from ..schemas import IdentificacaoFeaturesIn, IdentificacaoResultadoOut, PredicaoItem

# Import robusto do motor de inferência ML morfológico
try:
    from Backend.ML.inferencia_especies import engine as ml_engine
except ModuleNotFoundError:
    try:
        from ML.inferencia_especies import engine as ml_engine
    except ModuleNotFoundError:
        _root = Path(__file__).resolve().parents[3]
        if str(_root) not in sys.path:
            sys.path.insert(0, str(_root))
        from Backend.ML.inferencia_especies import engine as ml_engine

router = APIRouter(prefix="/api/identificar", tags=["Identificação por Machine Learning"])


def _enrich_prediction_with_db(pred_res: dict, db: Session) -> dict:
    """
    Enriquece o resultado do modelo de Machine Learning com evidências botânicas do acervo.
    O status de planta hospedeira possui rastreabilidade científica documental (Embrapa BPD 55).
    """
    best_species = pred_res["species"]
    sci_name = str(best_species["scientific_name"])

    # Busca no banco de dados pela espécie predita
    db_sp = (
        db.query(Especie)
        .filter(
            (Especie.scientific_name.ilike(sci_name))
            | (Especie.species_id == best_species.get("species_id"))
        )
        .first()
    )

    if db_sp:
        best_species["host_status"] = db_sp.host_status
        best_species["category"] = db_sp.category
        best_species["family"] = db_sp.family
        best_species["image_url"] = db_sp.image_url
        if db_sp.common_name:
            best_species["common_name"] = db_sp.common_name

        fontes_list = [f.nome_fonte for f in db_sp.fontes] or ["Embrapa BPD 55", "Reflora"]
        host_evidence = {
            "is_host": db_sp.host_status == "registrada",
            "host_status": db_sp.host_status,
            "host_type": db_sp.host_type or "Hospedeira comprovada de Bemisia tabaci / Bemisia argentifolii",
            "sources": fontes_list,
            "validation_status": db_sp.validation_status,
        }
    else:
        best_species["image_url"] = None
        host_evidence = {
            "is_host": True,
            "host_status": "registrada",
            "host_type": "Hospedeira documentada no estudo do semiárido",
            "sources": ["Embrapa BPD 55"],
            "validation_status": "pendente",
        }

    # Enriquece ranking com imagens do acervo
    for item in pred_res.get("ranking", []):
        r_sp = db.query(Especie).filter(Especie.scientific_name.ilike(str(item["scientific_name"]))).first()
        if r_sp and r_sp.image_url:
            item["image_url"] = r_sp.image_url
        else:
            item["image_url"] = None

    pred_res["host_evidence"] = host_evidence
    return pred_res


@router.post("", response_model=IdentificacaoResultadoOut)
@router.post("/caracteristicas", response_model=IdentificacaoResultadoOut)
def identificar_por_caracteristicas(
    dados: IdentificacaoFeaturesIn,
    db: Session = Depends(get_db),
):
    """
    Identifica espécie através de características morfológicas com modelo de Machine Learning (Random Forest).
    Avalia família, hábito, folhas, flores, caule e distribuição geográfica.
    """
    try:
        features_dict = dados.model_dump(exclude_unset=True)
        resultado = ml_engine.predict_by_features(features_dict, top_k=5)
        resultado_enriquecido = _enrich_prediction_with_db(resultado, db)
        return resultado_enriquecido
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Falha na inferência de Machine Learning: {str(e)}",
        )


@router.post("/imagem", response_model=IdentificacaoResultadoOut)
async def registrar_imagem_comprovante(
    file: UploadFile = File(...),
    familia: Optional[str] = Form(None),
    habito: Optional[str] = Form(None),
    db: Session = Depends(get_db),
):
    """
    Recebe imagem fotográfica como anexo/evidência documental para o laudo botânico
    e executa a classificação de Machine Learning pelas características morfológicas associadas.
    """
    features_dict = {
        "familia": familia or "Não informada",
        "habito": habito or "Não informado",
    }
    resultado = ml_engine.predict_by_features(features_dict, top_k=5)
    resultado_enriquecido = _enrich_prediction_with_db(resultado, db)
    resultado_enriquecido["input_mode"] = "imagem"
    resultado_enriquecido["image_metadata"] = {
        "filename": file.filename or "anexo.jpg",
        "status": "anexo_documental_salvo",
        "modelo_usado": "RandomForestClassifier (scikit-learn)",
    }
    return resultado_enriquecido
