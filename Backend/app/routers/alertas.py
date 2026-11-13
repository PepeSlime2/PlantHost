"""
Motor de Alertas de Ocorrência de Plantas Hospedeiras (SPECB2 - Card 4).
Gera e consulta alertas regionais de criticidade rastreável.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Alerta, Especie
from ..schemas import AlertaCreate, AlertaOut

router = APIRouter(prefix="/api/alertas", tags=["Motor de Alertas"])


@router.get("", response_model=List[AlertaOut])
def listar_alertas(
    regiao: Optional[str] = Query(None, description="Filtro por região"),
    criticidade: Optional[str] = Query(None, description="Filtro por criticidade: alta, media, baixa"),
    status_alerta: Optional[str] = Query(None, description="Filtro por status: ativo, resolvido, arquivado"),
    db: Session = Depends(get_db),
):
    """
    Retorna os alertas gerados pelo motor de monitoramento com dados de região, criticidade e espécie associada.
    """
    query = db.query(Alerta)

    if regiao:
        query = query.filter(Alerta.regiao.ilike(f"%{regiao.strip()}%"))
    if criticidade:
        query = query.filter(Alerta.criticidade == criticidade.lower().strip())
    if status_alerta:
        query = query.filter(Alerta.status == status_alerta.lower().strip())

    alertas = query.order_by(Alerta.data_ocorrencia.desc()).all()
    return alertas


@router.post("", response_model=AlertaOut, status_code=status.HTTP_201_CREATED)
def criar_alerta(dados: AlertaCreate, db: Session = Depends(get_db)):
    """
    Registra um novo alerta de incidência ou risco de planta hospedeira.
    Impede duplicações de alertas ativos para a mesma espécie e região.
    """
    # Valida espécie
    especie = db.query(Especie).filter(Especie.id == dados.especie_id).first()
    if not especie:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Espécie com ID {dados.especie_id} não encontrada.",
        )

    crit_norm = dados.criticidade.lower().strip()
    if crit_norm not in ["alta", "media", "baixa"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Criticidade inválida. Valores aceitos: 'alta', 'media', 'baixa'.",
        )

    # Prevenção de alertas duplicados ativos
    duplicado = (
        db.query(Alerta)
        .filter(
            Alerta.especie_id == dados.especie_id,
            Alerta.regiao.ilike(dados.regiao.strip()),
            Alerta.status == "ativo",
        )
        .first()
    )
    if duplicado:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Já existe um alerta ativo para esta espécie na região '{dados.regiao}'.",
        )

    novo_alerta = Alerta(
        especie_id=dados.especie_id,
        regiao=dados.regiao.strip(),
        criticidade=crit_norm,
        mensagem=dados.mensagem.strip(),
        status=dados.status or "ativo",
    )
    db.add(novo_alerta)
    db.commit()
    db.refresh(novo_alerta)
    return novo_alerta


@router.put("/{alerta_id}/resolver", response_model=AlertaOut)
def resolver_alerta(alerta_id: int, db: Session = Depends(get_db)):
    """Marca um alerta ativo como resolvido."""
    alerta = db.query(Alerta).filter(Alerta.id == alerta_id).first()
    if not alerta:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Alerta não encontrado.")

    alerta.status = "resolvido"
    db.commit()
    db.refresh(alerta)
    return alerta
