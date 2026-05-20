from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class Utilizador(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    cargo = Column(String(20), default="operador", nullable=False)  # admin, supervisor, operador
    criado_em = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relacionamento: Um utilizador pode ter muitos logs de auditoria
    logs = relationship("LogAuditoria", back_populates="utilizador", cascade="all, delete-orphan")


class LogAuditoria(Base):
    __tablename__ = "logs_auditoria"

    id = Column(Integer, primary_key=True, index=True)
    utilizador_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    acao = Column(String(100), nullable=False)  # ex: "login_sucesso", "tentativa_login_falhada", "remover_utilizador"
    detalhes = Column(String(255), nullable=True)  # ex: "IP: 192.168.1.1"
    criado_em = Column(DateTime, default=lambda: datetime.now(timezone.utc), nullable=False)

    # Relacionamento: Vincula o log de volta ao utilizador específico
    utilizador = relationship("Utilizador", back_populates="logs")