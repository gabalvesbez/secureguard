from passlib.context import CryptContext

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