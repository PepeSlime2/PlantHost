"""
Estatísticas Consolidadas para o Dashboard (Card 1 de SPECFront e SPECB1).
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Especie, Alerta, ValidacaoEspecialista
from ..schemas import DashboardStatsOut

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("/stats", response_model=DashboardStatsOut)
def obter_estatisticas_dashboard(db: Session = Depends(get_db)):
    """
    Retorna indicadores agregados do acervo botânico, alertas e modelos disponíveis.
    """
    total_especies = db.query(Especie).count()
    total_silvestres = db.query(Especie).filter(Especie.category == "silvestre").count()
    total_cultivadas = db.query(Especie).filter(Especie.category == "cultivada").count()
    total_hospedeiras = db.query(Especie).filter(Especie.host_status == "registrada").count()
    total_alertas_ativos = db.query(Alerta).filter(Alerta.status == "ativo").count()
    total_validacoes = db.query(ValidacaoEspecialista).count()

    modelos = [
        "Random Forest (Multi-trait Classifier v1.2)",
        "PlantHost-Vision-CNN (MobileNetV3 v1.1)",
        "Decision Tree / Heuristic Taxonomy Engine",
    ]

    return {
        "total_especies": total_especies,
        "total_silvestres": total_silvestres,
        "total_cultivadas": total_cultivadas,
        "total_hospedeiras": total_hospedeiras,
        "total_alertas_ativos": total_alertas_ativos,
        "total_validacoes": total_validacoes,
        "modelos_disponiveis": modelos,
    }

