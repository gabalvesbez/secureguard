from sqlalchemy.orm import Session
import models
import schemas
import seguranca

def obter_utilizador_por_email(db: Session, email: str):
    """Procura um utilizador na base de dados pelo email."""
    return db.query(models.Utilizador).filter(models.Utilizador.email == email).first()

def criar_utilizador(db: Session, utilizador: schemas.UtilizadorCreate):
    """Encripta a password e insere o novo utilizador no Supabase."""
    # 1. Encriptar a password que veio do Pydantic
    password_encriptada = seguranca.gerar_hash_password(utilizador.password)
    
    # 2. Criar o modelo do SQLAlchemy com os dados
    db_utilizador = models.Utilizador(
        nome=utilizador.nome,
        email=utilizador.email,
        password_hash=password_encriptada,
        cargo=utilizador.cargo
    )
    
    # 3. Salvar na Base de Dados (Supabase)
    db.add(db_utilizador)
    db.commit()
    db.refresh(db_utilizador) # Atualiza o objeto para trazer o ID gerado pelo banco
    return db_utilizador