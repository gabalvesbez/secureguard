from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm # <- NOVO
from sqlalchemy.orm import Session
import crud
import schemas
import models
import seguranca 
from database import engine, get_db
from typing import List
from seguranca import obter_utilizador_atual 

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

@app.post(
    "/auth/login",
    summary="Realizar login do utilizador",
    description="Verifica as credenciais e devolve um Token JWT se estiverem corretas."
)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # 1. Procurar o utilizador pelo email (o OAuth2 usa o campo 'username' para o email)
    utilizador = crud.obter_utilizador_por_email(db, email=form_data.username)
    
    # 2. Se o utilizador não existir ou a password estiver errada, lança erro 401 (Unauthorized)
    if not utilizador or not seguranca.verificar_password(form_data.password, utilizador.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou password incorretos.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # 3. Gerar o token de acesso incluindo o email e o cargo do utilizador no Payload
    token_dados = {"sub": utilizador.email, "cargo": utilizador.cargo}
    token_acesso = seguranca.criar_token_acesso(dados=token_dados)
    
    # 4. Devolver no formato padrão que o OAuth2 exige
    return {
        "access_token": token_acesso,
        "token_type": "bearer"
    }

@app.post("/secrets",
          response_model=schemas.SegredoResposta,
          status_code=201,
          summary="Criar um novo segredo")
def rota_criar_segredo(
    segredo: schemas.SegredoCriar, 
    db: Session = Depends(get_db), 
    utilizador_atual: models.Utilizador = Depends(obter_utilizador_atual)
):
    # O user_id é injetado automaticamente a partir do Token JWT decriptado pelo Guardião!
    return crud.criar_segredo(db=db, segredo=segredo, utilizador_id=utilizador_atual.id)

@app.get("/secrets",
         response_model=List[schemas.SegredoResposta],
         summary="Listar segredos do utilizador logado")
def rota_listar_segredos(
    db: Session = Depends(get_db), 
    utilizador_atual: models.Utilizador = Depends(obter_utilizador_atual)
):
    # Filtro rígido: O utilizador só vê os SEUS próprios segredos
    return crud.listar_segredos_do_utilizador(db=db, utilizador_id=utilizador_atual.id)

@app.delete("/secrets/{secret_id}", summary="Eliminar um segredo específico")
def rota_eliminar_segredo(
    secret_id: int, 
    db: Session = Depends(get_db), 
    utilizador_atual: models.Utilizador = Depends(obter_utilizador_atual)
):
    segredo = crud.obter_segredo_por_id(db, segredo_id=secret_id)
    
    # 1. Validação de Existência
    if not segredo:
        raise HTTPException(status_code=404, detail="Segredo não encontrado.")
        
    # 2. Validação de Propriedade: Segurança Máxima contra ID e-Xternal tampering
    if segredo.user_id != utilizador_atual.id:
        raise HTTPException(status_code=403, detail="Não tens permissão para eliminar este segredo.")
        
    crud.eliminar_segredo(db, segredo_id=secret_id)
    return {"detail": "Segredo eliminado com sucesso."}