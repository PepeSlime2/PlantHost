"""
Modelos ORM SQLAlchemy para o PlantHost AI.
Esquema botânico alinhado às especificações Embrapa/Reflora/GBIF.
"""

from datetime import datetime
from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    Boolean,
    Text,
    DateTime,
    ForeignKey,
    Index,
)
from sqlalchemy.orm import relationship
from .database import Base


class Especie(Base):
    __tablename__ = "especies"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    species_id = Column(String(50), unique=True, index=True, nullable=False)  # Ex: PH-001
    scientific_name = Column(String(255), unique=True, index=True, nullable=False)
    scientific_name_original = Column(String(255), nullable=True)
    common_name = Column(String(255), index=True, nullable=True)
    family = Column(String(100), index=True, nullable=False)
    category = Column(String(50), index=True, nullable=False)  # silvestre, cultivada, invasora
    habit = Column(String(255), nullable=True)
    life_form = Column(String(255), nullable=True)
    life_cycle = Column(String(100), nullable=True)
    distribution = Column(Text, nullable=True)
    host_status = Column(String(50), index=True, default="registrada")  # registrada, sem_registro, indisponivel
    host_type = Column(String(255), nullable=True)
    validation_status = Column(String(50), default="pendente", index=True)  # pendente, aprovado, rejeitado
    image_url = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relacionamentos
    caracteristicas = relationship("CaracteristicaBotanica", back_populates="especie", uselist=False, cascade="all, delete-orphan")
    fontes = relationship("EvidenciaFonte", back_populates="especie", cascade="all, delete-orphan")
    validacoes = relationship("ValidacaoEspecialista", back_populates="especie", cascade="all, delete-orphan")
    alertas = relationship("Alerta", back_populates="especie", cascade="all, delete-orphan")

    # Índices compostos para otimização de consultas (Card 3 de SPECB1)
    __table_args__ = (
        Index("idx_especie_categoria_hospedeira", "category", "host_status"),
        Index("idx_especie_familia_categoria", "family", "category"),
    )


class CaracteristicaBotanica(Base):
    __tablename__ = "caracteristicas_botanicas"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    especie_id = Column(Integer, ForeignKey("especies.id"), nullable=False, unique=True)

    folha_disposicao = Column(String(100), nullable=True)
    folha_forma = Column(String(100), nullable=True)
    folha_margem = Column(String(100), nullable=True)
    folha_textura = Column(String(100), nullable=True)
    folha_filotaxia = Column(String(100), nullable=True)

    flor_presenca = Column(String(100), nullable=True)
    flor_cor = Column(String(100), nullable=True)
    flor_simetria = Column(String(100), nullable=True)
    flor_inflorescencia = Column(String(100), nullable=True)

    caule_tipo = Column(String(100), nullable=True)
    caule_textura = Column(String(100), nullable=True)
    caule_ramificacao = Column(String(100), nullable=True)

    tricomas = Column(String(100), nullable=True)
    epoca_ocorrencia = Column(String(100), nullable=True)
    altura = Column(String(100), nullable=True)

    especie = relationship("Especie", back_populates="caracteristicas")


class EvidenciaFonte(Base):
    __tablename__ = "evidencias_fontes"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    especie_id = Column(Integer, ForeignKey("especies.id"), nullable=False)
    nome_fonte = Column(String(100), nullable=False)  # Embrapa BPD 55, Reflora, GBIF, etc.
    url_fonte = Column(Text, nullable=True)
    referencia_original = Column(Text, nullable=True)

    especie = relationship("Especie", back_populates="fontes")


class ValidacaoEspecialista(Base):
    __tablename__ = "validacoes_especialistas"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    especie_id = Column(Integer, ForeignKey("especies.id"), nullable=False)
    especialista_nome = Column(String(150), nullable=False)
    especialista_email = Column(String(150), nullable=True)
    decisao = Column(String(50), nullable=False)  # aprovado, rejeitado, necessita_revisao
    observacoes = Column(Text, nullable=True)
    criado_em = Column(DateTime, default=datetime.utcnow)

    especie = relationship("Especie", back_populates="validacoes")


class Alerta(Base):
    __tablename__ = "alertas"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    especie_id = Column(Integer, ForeignKey("especies.id"), nullable=False)
    regiao = Column(String(100), nullable=False, index=True)
    criticidade = Column(String(20), nullable=False, index=True)  # alta, media, baixa
    mensagem = Column(Text, nullable=False)
    status = Column(String(30), default="ativo", index=True)  # ativo, resolvido, arquivado
    data_ocorrencia = Column(DateTime, default=datetime.utcnow)

    especie = relationship("Especie", back_populates="alertas")

    __table_args__ = (
        Index("idx_alerta_regiao_criticidade", "regiao", "criticidade"),
    )

