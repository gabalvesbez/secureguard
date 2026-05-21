import os
import jwt
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
import models
from database import get_db
from passlib.context import CryptContext
from cryptography.fernet import Fernet

# Configura o contexto de criptografia para usar exclusivamente o bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def gerar_hash_password(password: str) -> str:
    """
    Recebe a password em texto limpo (ex: 'Admin@1234') e devolve
    um hash irreversível (ex: '$2b$12$Kj9...') para guardar no Supabase.
    """
    return pwd_context.hash(password)


def verificar_password(password_pura: str, hash_guardado: str) -> bool:
    """
    Compara uma password digitada no login com o hash guardado na base de dados.
    Devolve True se coincidirem, e False se for inválida.
    """
    return pwd_context.verify(password_pura, hash_guardado)

load_dotenv()

# Ler as configurações do .env
SECRET_KEY = os.getenv("JWT_SECRET", "chave_fallback_se_falhar")
ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = 15

# Indica ao FastAPI que o token virá como um Bearer Token no cabeçalho Authorization
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

def criar_token_acesso(dados: dict) -> str:
    """Gera um Token JWT assinado com tempo de expiração de 15 minutos."""
    dados_para_codificar = dados.copy()
    
    # Define o tempo de expiração para daqui a 15 minutos (em UTC)
    tempo_expiracao = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    # O campo 'exp' é o padrão do JWT para determinar a data de validade
    dados_para_codificar.update({"exp": tempo_expiracao})
    
    # Codifica e assina o token com a nossa chave secreta
    token_jwt = jwt.encode(dados_para_codificar, SECRET_KEY, algorithm=ALGORITHM)
    return token_jwt

def obter_utilizador_atual(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> models.Utilizador:
    """Interceita o JWT, valida a assinatura/expiração e retorna o objeto do utilizador logado."""
    credenciais_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token inválido ou expirado. Por favor, faça login novamente.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # 1. Descodifica o token usando a nossa chave secreta
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        
        # Se o payload não tiver o email ('sub'), o token é inválido
        if email is None:
            raise credenciais_exception
            
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="O seu token de acesso expirou. Faça login novamente.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.PyJWTError:
        raise credenciais_exception

    # 2. Vai à base de dados garantir que este utilizador ainda existe
    utilizador = db.query(models.Utilizador).filter(models.Utilizador.email == email).first()
    if utilizador is None:
        raise credenciais_exception
        
    # 3. Retorna o utilizador verificado com sucesso
    return utilizador

CHAVE_MESTRA = os.getenv("CHAVE_ENCRIPCACAO")
# Inicializa o motor de encriptação se a chave existir
fernet = Fernet(CHAVE_MESTRA.encode()) if CHAVE_MESTRA else None

def encriptar_texto(texto: str) -> str:
    """Transforma texto limpo em hash ilegível."""
    if not fernet:
        return texto
    return fernet.encrypt(texto.encode()).decode()

def decriptar_texto(texto_encriptado: str) -> str:
    """Transforma o hash ilegível de volta em texto limpo."""
    if not fernet:
        return texto_encriptado
    return fernet.decrypt(texto_encriptado.encode()).decode()