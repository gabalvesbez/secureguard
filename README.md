# SecureGuard — Cofre de Palavras-Passe & Logs de Auditoria

O SecureGuard é uma aplicação web completa (Full-Stack) voltada para a gestão segura de credenciais. O projeto foi desenhado seguindo as melhores práticas de cibersegurança, mitigação de riscos da OWASP e separação estrita de responsabilidades (Separation of Concerns).

## Links do Projeto
- Frontend (Live Demo): https://secureguard-ohunirhs9-gabriel-a-projects.vercel.app/login.html
- API Backend: https://secureguard-fyln.onrender.com
*Nota: O backend está hospedado no plano gratuito do Render. Se a aplicação estiver inativa há algum tempo, o primeiro carregamento ou tentativa de login pode demorar cerca de 50 segundos para que o servidor seja reativado.*

---

## Arquitetura de Segurança & Funcionalidades

* Criptografia Simétrica (Fernet/AES-128): Os segredos dos utilizadores nunca são guardados em texto limpo. São encriptados no backend antes de tocarem na base de dados, garantindo que mesmo em caso de Data Breach, os dados permanecem ilegíveis.
* Autenticação Robusta com JWT: Fluxo de autenticação seguro utilizando tokens JSON Web Tokens (JWT) com algoritmo HS256 e tempo de expiração estrito.
* Hashing de Palavras-passe (Bcrypt): As credenciais de acesso dos utilizadores são processadas usando passlib com salts dinâmicos, protegendo o sistema contra ataques de dicionário e Rainbow Tables.
* Logs de Auditoria Invioláveis: Cada ação crítica (Login, Criação ou Remoção de segredos) gera um registo automático de auditoria na base de dados, essencial para conformidade (Compliance) e análise forense.
* Proteção de Rotas & Middleware CORS: API blindada com políticas restritas de CORS, permitindo requisições apenas de origens explicitamente autorizadas. Proteção no frontend via JavaScript impedindo o acesso ao Dashboard sem um token válido.

---

## Roadmap de Desenvolvimento & Próximos Passos

O projeto foi planeado para evoluir em três fases estratégicas, simulando o ciclo de vida de um produto de software seguro no mercado. Atualmente, o sistema encontra-se com o MVP finalizado e com diversas funcionalidades avançadas das fases seguintes já implementadas.

### Fase 1: MVP (Concluída)
* Fluxo completo de registo e autenticação de utilizadores.
* Arquitetura limpa com separação de responsabilidades (CRUD, Rotas, Modelos).
* Hashing seguro de passwords utilizando Bcrypt.
* Modelagem e persistência de dados em PostgreSQL (Supabase).

### Fase 2: Endurecimento de Segurança (Em Progresso)
* [Concluído] Implementação de Logs de Auditoria para rastreamento de ações críticas.
* [Concluído] Proteção contra ataques através de Rate Limiting.
* [Pendente] Autenticação de Dois Fatores (2FA) via TOTP.
* [Pendente] Controlo de acesso baseado em funções (RBAC).

### Fase 3: Engenharia Avançada & Resiliência (Em Progresso)
* [Concluído] Criptografia simétrica em repouso (Fernet/AES) para proteção de dados sensíveis.
* [Concluído] Deploy em ambiente de produção utilizando pipelines de CI/CD (Render e Vercel).
* [Pendente] Contentorização da aplicação utilizando Docker.
* [Pendente] Cobertura de testes unitários e de integração para validação de segurança.

---

## Stack Tecnológica

* Backend: Python 3, FastAPI, SQLAlchemy (ORM), Uvicorn, PyJWT, Cryptography (Fernet)
* Frontend: HTML5, CSS3 (Template StartBootstrap), JavaScript Nativo (Async/Fetch API)
* Base de Dados: PostgreSQL (Hospedado no Supabase)
* DevOps & Deploy: GitHub, Render (Backend CI/CD), Vercel (Frontend Continuous Deployment)

---

## Como Executar o Projeto Localmente (Backend)

1. Clone o repositório: git clone https://github.com/gabalvesbez/secureguard.git
2. Instale as dependências: pip install -r backend/requirements.txt
3. Configure o arquivo .env com as suas credenciais do Supabase e chaves criptográficas.
4. Execute o servidor: uvicorn main:app --reload