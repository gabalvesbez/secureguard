# Usa uma imagem oficial leve do Python
FROM python:3.11-slim

# Define o diretório de trabalho dentro do contentor
WORKDIR /app

# Evita que o Python escreva ficheiros .pyc no disco
ENV PYTHONDONTWRITEBYTECODE 1
# Garante que os logs do Python saem diretamente para o terminal
ENV PYTHONUNBUFFERED 1

# Copia o ficheiro de dependências primeiro (otimiza a cache do Docker)
COPY requirements.txt /app/

# Instala as dependências do projeto
RUN pip install --no-cache-dir -r requirements.txt

# Copia o resto do código da aplicação para dentro do contentor
COPY . /app/

# Expõe a porta que o FastAPI vai usar (geralmente a 8000)
EXPOSE 8000

# Comando para iniciar o servidor Uvicorn dentro do contentor
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]