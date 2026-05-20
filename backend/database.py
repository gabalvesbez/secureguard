import os
from urllib.parse import quote_plus
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# 1. Carregar as variáveis do ficheiro .env
load_dotenv()

user = os.getenv("DB_USER")
# O quote_plus vai transformar o teu '@' em '%40' automaticamente pelos bastidores!
password = quote_plus(os.getenv("DB_PASSWORD", ""))
host = os.getenv("DB_HOST")
port = os.getenv("DB_PORT")
database = os.getenv("DB_NAME")

# 2. Montar a URL de forma perfeitamente padronizada para o SQLAlchemy
DATABASE_URL = f"postgresql+psycopg2://{user}:{password}@{host}:{port}/{database}"

# 3. Criar o motor de conexão
engine = create_engine(
    DATABASE_URL, 
    connect_args={"sslmode": "require"} # faz com que, se não ouver conexão ssl, não haja conexão
)
# 4. Fábrica de sessões 
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 5. Classe base
#Converte um model em uma tabela, para ser inserido na base de dados, deve ser herdada
# pelas classes que usamos como model
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()  