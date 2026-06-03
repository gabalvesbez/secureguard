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


def criar_segredo(db: Session, segredo: schemas.SegredoCriar, utilizador_id: int):
    # Encriptar o valor antes de mandar para o Supabase!
    valor_protegido = seguranca.encriptar_texto(segredo.valor_segredo)
    
    novo_segredo = models.Segredo(
        titulo=segredo.titulo,
        servico=segredo.servico,
        valor_segredo=valor_protegido,
        user_id=utilizador_id
    )
    db.add(novo_segredo)
    db.commit()
    db.refresh(novo_segredo)
    return novo_segredo

def listar_segredos_do_utilizador(db: Session, utilizador_id: int):
    segredos = db.query(models.Segredo).filter(models.Segredo.user_id == utilizador_id).all()
    
    # Decriptar o valor de cada segredo para que o dono o consiga ler
    for s in segredos:
        s.valor_segredo = seguranca.decriptar_texto(s.valor_segredo)
        
    return segredos

def obter_segredo_por_id(db: Session, segredo_id: int):
    return db.query(models.Segredo).filter(models.Segredo.id == segredo_id).first()

def eliminar_segredo(db: Session, segredo_id: int):
    segredo = db.query(models.Segredo).filter(models.Segredo.id == segredo_id).first()
    if segredo:
        db.delete(segredo)
        db.commit()
    return True

def registrar_log(db: Session, utilizador_id: int, acao: str, detalhes: str = None):
    """Insere um novo evento de auditoria no banco de dados."""
    novo_log = models.LogAuditoria(
        utilizador_id=utilizador_id,
        acao=acao,
        detalhes=detalhes
    )
    db.add(novo_log)
    db.commit()
    db.refresh(novo_log)
    return novo_log

def listar_logs_do_utilizador(db: Session, utilizador_id: int):
    """Busca o histórico de ações do usuário logado."""
    return db.query(models.LogAuditoria).filter(models.LogAuditoria.utilizador_id == utilizador_id).order_by(models.LogAuditoria.criado_em.desc()).all()