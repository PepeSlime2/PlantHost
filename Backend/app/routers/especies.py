"""
Rotas para consulta, cadastro e validação de espécies botânicas.
Atende aos Cards 1, 2 e 3 do SPECB1 e Cards 2 e 3 do SPECB2.
"""

import math
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import or_
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Especie, CaracteristicaBotanica, EvidenciaFonte, ValidacaoEspecialista
from ..schemas import (
    EspecieCreate,
    EspecieOut,
    EspeciesPaginadas,
    ValidacaoEspecialistaIn,
    ValidacaoEspecialistaOut,
)

router = APIRouter(prefix="/api/especies", tags=["Espécies Botânicas"])


@router.get("", response_model=EspeciesPaginadas)
def listar_especies(
    q: Optional[str] = Query(None, description="Busca textual por nome científico, nome comum ou família"),
    category: Optional[str] = Query(None, description="Filtro por categoria: silvestre, cultivada, invasora"),
    host_status: Optional[str] = Query(None, description="Filtro por status de hospedeira: registrada, sem_registro, indisponivel"),
    validation_status: Optional[str] = Query(None, description="Filtro por validação: pendente, aprovado, rejeitado"),
    page: int = Query(1, ge=1, description="Número da página"),
    per_page: int = Query(10, ge=1, le=100, description="Itens por página"),
    db: Session = Depends(get_db),
):
    """
    Lista espécies botânicas cadastradas com suporte a busca textual, filtros e paginação estável.
    """
    query = db.query(Especie)

    # Filtro textual (nome científico, popular ou família)
    if q:
        search_term = f"%{q.strip()}%"
        query = query.filter(
            or_(
                Especie.scientific_name.ilike(search_term),
                Especie.common_name.ilike(search_term),
                Especie.family.ilike(search_term),
            )
        )

    # Filtros exatos
    if category:
        query = query.filter(Especie.category == category.lower().strip())
    if host_status:
        query = query.filter(Especie.host_status == host_status.lower().strip())
    if validation_status:
        query = query.filter(Especie.validation_status == validation_status.lower().strip())

    total = query.count()
    total_pages = max(1, math.ceil(total / per_page))
    offset = (page - 1) * per_page

    # Ordenação estável por scientific_name
    items = query.order_by(Especie.scientific_name.asc()).offset(offset).limit(per_page).all()

    return {
        "total": total,
        "page": page,
        "per_page": per_page,
        "total_pages": total_pages,
        "items": items,
    }


@router.get("/{especie_id}", response_model=EspecieOut)
def obter_especie(especie_id: int, db: Session = Depends(get_db)):
    """Obtém detalhes completos de uma espécie pelo ID numérico ou lança 404."""
    especie = db.query(Especie).filter(Especie.id == especie_id).first()
    if not especie:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Espécie com ID {especie_id} não encontrada.",
        )
    return especie


@router.post("", response_model=EspecieOut, status_code=status.HTTP_201_CREATED)
def cadastrar_especie(dados: EspecieCreate, db: Session = Depends(get_db)):
    """
    Cadastra uma nova espécie botânica no acervo.
    Verifica duplicidade de nome científico conforme regras de integridade do SPECB2.
    """
    nome_norm = dados.scientific_name.strip()
    existente = db.query(Especie).filter(Especie.scientific_name.ilike(nome_norm)).first()
    if existente:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"A espécie com nome científico '{nome_norm}' já está cadastrada.",
        )

    # Gera species_id sequencial se não informado
    if not dados.species_id:
        total = db.query(Especie).count()
        sp_id = f"PH-MANUAL-{total+1:03d}"
    else:
        sp_id = dados.species_id

    nova_especie = Especie(
        species_id=sp_id,
        scientific_name=nome_norm,
        scientific_name_original=dados.scientific_name_original or nome_norm,
        common_name=dados.common_name,
        family=dados.family.strip(),
        category=dados.category.lower().strip(),
        habit=dados.habit,
        life_form=dados.life_form,
        life_cycle=dados.life_cycle,
        distribution=dados.distribution,
        host_status=dados.host_status,
        host_type=dados.host_type or "Cadastro manual",
        validation_status="pendente",
        image_url=dados.image_url,
    )

    if dados.caracteristicas:
        c_dict = dados.caracteristicas.model_dump(exclude_unset=True)
        nova_especie.caracteristicas = CaracteristicaBotanica(**c_dict)

    db.add(nova_especie)
    db.commit()
    db.refresh(nova_especie)
    return nova_especie


@router.put("/{especie_id}/validar", response_model=ValidacaoEspecialistaOut)
def validar_especie_especialista(
    especie_id: int,
    dados: ValidacaoEspecialistaIn,
    db: Session = Depends(get_db),
):
    """
    Registra parecer técnico de um especialista botânico para uma espécie.
    Atualiza o validation_status da espécie para aprovado, rejeitado ou necessita_revisao.
    """
    especie = db.query(Especie).filter(Especie.id == especie_id).first()
    if not especie:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Espécie com ID {especie_id} não encontrada para validação.",
        )

    decisao_norm = dados.decisao.lower().strip()
    if decisao_norm not in ["aprovado", "rejeitado", "necessita_revisao"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Decisão inválida. Valores aceitos: 'aprovado', 'rejeitado', 'necessita_revisao'.",
        )

    # Cria registro de auditoria da validação
    validacao = ValidacaoEspecialista(
        especie_id=especie.id,
        especialista_nome=dados.especialista_nome,
        especialista_email=dados.especialista_email,
        decisao=decisao_norm,
        observacoes=dados.observacoes,
    )
    db.add(validacao)

    # Atualiza status da espécie
    especie.validation_status = decisao_norm
    db.commit()
    db.refresh(validacao)

    return validacao

