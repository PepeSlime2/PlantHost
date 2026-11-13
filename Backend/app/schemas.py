"""
Esquemas Pydantic para validação e serialização da API PlantHost AI.
"""

from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field


# --- Características Botânicas ---
class CaracteristicaBotanicaBase(BaseModel):
    folha_disposicao: Optional[str] = None
    folha_forma: Optional[str] = None
    folha_margem: Optional[str] = None
    folha_textura: Optional[str] = None
    folha_filotaxia: Optional[str] = None
    flor_presenca: Optional[str] = None
    flor_cor: Optional[str] = None
    flor_simetria: Optional[str] = None
    flor_inflorescencia: Optional[str] = None
    caule_tipo: Optional[str] = None
    caule_textura: Optional[str] = None
    caule_ramificacao: Optional[str] = None
    tricomas: Optional[str] = None
    epoca_ocorrencia: Optional[str] = None
    altura: Optional[str] = None


class CaracteristicaBotanicaOut(CaracteristicaBotanicaBase):
    id: int
    model_config = ConfigDict(from_attributes=True)


# --- Evidências de Fontes ---
class EvidenciaFonteOut(BaseModel):
    id: int
    nome_fonte: str
    url_fonte: Optional[str] = None
    referencia_original: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)


# --- Espécies ---
class EspecieBase(BaseModel):
    scientific_name: str = Field(..., min_length=2, max_length=255)
    scientific_name_original: Optional[str] = None
    common_name: Optional[str] = None
    family: str = Field(..., min_length=2, max_length=100)
    category: str = Field(..., description="silvestre, cultivada ou invasora")
    habit: Optional[str] = None
    life_form: Optional[str] = None
    life_cycle: Optional[str] = None
    distribution: Optional[str] = None
    host_status: str = Field(default="registrada", description="registrada, sem_registro, indisponivel")
    host_type: Optional[str] = None
    image_url: Optional[str] = None


class EspecieCreate(EspecieBase):
    species_id: Optional[str] = None
    caracteristicas: Optional[CaracteristicaBotanicaBase] = None


class EspecieOut(EspecieBase):
    id: int
    species_id: str
    validation_status: str
    created_at: datetime
    updated_at: datetime
    caracteristicas: Optional[CaracteristicaBotanicaOut] = None
    fontes: List[EvidenciaFonteOut] = []
    model_config = ConfigDict(from_attributes=True)


class EspeciesPaginadas(BaseModel):
    total: int
    page: int
    per_page: int
    total_pages: int
    items: List[EspecieOut]


# --- Validação por Especialista ---
class ValidacaoEspecialistaIn(BaseModel):
    especialista_nome: str = Field(..., min_length=2)
    especialista_email: Optional[str] = None
    decisao: str = Field(..., description="aprovado, rejeitado, necessita_revisao")
    observacoes: Optional[str] = None


class ValidacaoEspecialistaOut(ValidacaoEspecialistaIn):
    id: int
    especie_id: int
    criado_em: datetime
    model_config = ConfigDict(from_attributes=True)


# --- Alertas ---
class AlertaCreate(BaseModel):
    especie_id: int
    regiao: str
    criticidade: str = Field(..., description="alta, media, baixa")
    mensagem: str
    status: Optional[str] = "ativo"


class AlertaOut(BaseModel):
    id: int
    especie_id: int
    regiao: str
    criticidade: str
    mensagem: str
    status: str
    data_ocorrencia: datetime
    especie: Optional[EspecieOut] = None
    model_config = ConfigDict(from_attributes=True)


# --- Inferência / Identificação ---
class PredicaoItem(BaseModel):
    species_id: str
    scientific_name: str
    common_name: Optional[str] = None
    family: str
    category: str
    host_status: str
    confidence: float
    image_url: Optional[str] = None


class IdentificacaoFeaturesIn(BaseModel):
    familia: Optional[str] = None
    forma_vida: Optional[str] = None
    habito: Optional[str] = None
    folha_disposicao: Optional[str] = None
    folha_forma: Optional[str] = None
    folha_margem: Optional[str] = None
    folha_textura: Optional[str] = None
    folha_filotaxia: Optional[str] = None
    flor_presenca: Optional[str] = None
    flor_cor: Optional[str] = None
    flor_simetria: Optional[str] = None
    flor_inflorescencia: Optional[str] = None
    caule_tipo: Optional[str] = None
    caule_textura: Optional[str] = None
    caule_ramificacao: Optional[str] = None
    tricomas: Optional[str] = None
    distribuicao: Optional[str] = None
    location: Optional[str] = None
    epoca: Optional[str] = None


class IdentificacaoResultadoOut(BaseModel):
    species: PredicaoItem
    confidence: float
    ranking: List[PredicaoItem]
    model: str
    model_version: str
    status: str
    input_mode: str
    host_evidence: Optional[Dict[str, Any]] = None
    image_metadata: Optional[Dict[str, Any]] = None


# --- Dashboard Stats ---
class DashboardStatsOut(BaseModel):
    total_especies: int
    total_silvestres: int
    total_cultivadas: int
    total_hospedeiras: int
    total_alertas_ativos: int
    total_validacoes: int
    modelos_disponiveis: List[str]
