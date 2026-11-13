"""
Aplicação Principal FastAPI - PlantHost AI Backend.
Integra banco de dados relacional, motor de inferência de ML e APIs REST para o Frontend.
"""

import sys
from pathlib import Path

# Garante que a raiz do repositório e o diretório Backend estejam no sys.path
_CURRENT_DIR = Path(__file__).resolve().parent
_BACKEND_DIR = _CURRENT_DIR.parent
_ROOT_DIR = _BACKEND_DIR.parent
for _p in (_ROOT_DIR, _BACKEND_DIR):
    if str(_p) not in sys.path:
        sys.path.insert(0, str(_p))

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .seed import seed_database
from .routers import especies, identificacao, alertas, dashboard


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Assegura que tabelas existem
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="PlantHost AI - API Backend",
    description=(
        "API para Identificação de Plantas Hospedeiras de Mosca-Branca (Bemisia tabaci / Bemisia argentifolii), "
        "gestão de acervo botânico, parecer técnico de especialistas e motor de alertas fitossanitários."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# Configuração de CORS para permitir requisições do Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Em desenvolvimento permite todas as origens locais
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Registro de Roteadores
app.include_router(dashboard.router)
app.include_router(especies.router)
app.include_router(identificacao.router)
app.include_router(alertas.router)


@app.get("/", tags=["Geral"])
def root():
    return {
        "sistema": "PlantHost AI",
        "versao": "1.0.0",
        "status": "online",
        "documentacao": "/docs",
    }


@app.get("/health", tags=["Geral"])
def health_check():
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("Backend.app.main:app", host="0.0.0.0", port=8000, reload=True)
