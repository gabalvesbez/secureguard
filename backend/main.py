from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
import crud
import schemas
import models
from database import engine, get_db

# Inicializa o FastAPI  (objeto que cria a api e diz nome, descricao e versao)
app = FastAPI(
    title="SecureGuard API",
    description="Sistema Avançado de Gestão de Segredos e Auditoria",
    version="1.0.0"
)

@app.post(
    "/auth/register", 
    response_model=schemas.UtilizadorResponse, 
    status_code=status.HTTP_201_CREATED,
    summary="Registar um novo utilizador",
    description="Valida os dados, encripta a password e guarda o utilizador no Supabase."
)
def registar_utilizador(utilizador: schemas.UtilizadorCreate, db: Session = Depends(get_db)):
    # 1. Verificar se o email já está registado
    utilizador_existente = crud.obter_utilizador_por_email(db, email=utilizador.email)
    if utilizador_existente:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Este email já se encontra registado no sistema."
        )
    
    # 2. Se estiver tudo OK, cria o utilizador
    novo_utilizador = crud.criar_utilizador(db=db, utilizador=utilizador)
    return novo_utilizador