import re
from pydantic import BaseModel, EmailStr, Field, field_validator
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime

# ==========================================
# SCHEMAS DE LOGS DE AUDITORIA
# ==========================================

class LogAuditoriaBase(BaseModel):
    acao: str
    detalhes: Optional[str] = None

class LogAuditoriaCreate(LogAuditoriaBase):
    pass

class LogAuditoriaResponse(LogAuditoriaBase):
    id: int
    utilizador_id: int
    criado_em: datetime

    class Config:
        from_attributes = True


# SCHEMAS DE UTILIZADOR

class UtilizadorBase(BaseModel):
    nome: str
    email: EmailStr  

class UtilizadorCreate(UtilizadorBase):
    password: str = Field(..., min_length=8)
    cargo: str = "operador"

    @field_validator("password")
    @classmethod
    def validar_complexidade_password(cls, v: str) -> str:
        if not re.search(r"[A-Z]", v):
            raise ValueError("A password deve conter pelo menos uma letra maiúscula.")
        if not re.search(r"[a-z]", v):
            raise ValueError("A password deve conter pelo menos uma letra minúscula.")
        if not re.search(r"[0-9]", v):
            raise ValueError("A password deve conter pelo menos um número.")
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>_]", v):
            raise ValueError("A password deve conter pelo menos um caractere especial.")
        return v

class UtilizadorResponse(UtilizadorBase):
    id: int
    cargo: str
    criado_em: datetime
    class Config:
        from_attributes = True


class UtilizadorCompletoResponse(UtilizadorResponse):
    logs: List[LogAuditoriaResponse] = []


# O que o utilizador envia ao criar um segredo
class SegredoCriar(BaseModel):
    titulo: str
    servico: str
    valor_segredo: str

# O que a API devolve ao utilizador (Sem expor IDs desnecessários ou dados crus)
class SegredoResposta(BaseModel):
    id: int
    titulo: str
    servico: str
    valor_segredo: str
    criado_em: datetime

    class Config:
        from_attributes = True