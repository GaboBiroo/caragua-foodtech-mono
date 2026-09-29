# Caraguá FoodTech — Agregador Gastronômico com RAG de 5 Estágios

> **Trabalho de Conclusão de Curso (TCC)** — Análise e Desenvolvimento de Sistemas  
> **Centro Universitário Módulo** (Cruzeiro do Sul Educacional) — Campus Caraguatatuba  
> **Autor:** Gabriel Rodrigues ([@GaboBiroo](https://github.com/GaboBiroo))  
> **Repositório Monorepo Oficial:** [github.com/GaboBiroo/caragua-foodtech-mono](https://github.com/GaboBiroo/caragua-foodtech-mono)

---

## 🌊 Visão Geral do Projeto

O **Caraguá FoodTech** é uma plataforma integrada de inteligência gastronômica desenvolvida especificamente para o ecossistema de Caraguatatuba (Litoral Norte de São Paulo). A arquitetura resolve os desafios de **sazonalidade extrema** nas avaliações turísticas e de **segurança alimentar** através de uma abordagem híbrida:

1. **Pipeline RAG de 5 Estágios (Zero Alucinações):**
   - **Estágio 1:** Extração de Intenção Estruturada via LLM (`ExtractedIntentSchema`).
   - **Estágio 2:** Enriquecimento Dinâmico de Contexto (GPS Caraguatatuba + Food Safety).
   - **Estágio 3:** Busca Híbrida Determinística com **PostGIS** (`ST_DWithin`) + **pgvector** (`<=>` Cosine).
   - **Estágio 4:** Ancoragem Factual Estrita (Grounding sem desvios).
   - **Estágio 5:** Streaming Gerativo via SSE (*Server-Sent Events*).
2. **Decaimento Temporal Exponencial de Reviews ($e^{-\lambda \Delta t}$):**
   - Neutraliza distorções de notas antigas deixadas por fluxos turísticos esporádicos.
3. **Blindagem LGPD (Artigos 5º e 6º):**
   - Purga PIIs (CPF, telefone, e-mail, cartões) e aplica pseudonimização com hash SHA-256 salgado.
4. **Detecção de Fraudes Heurística (Mackenzie 2024):**
   - Identifica disparos de avaliações em lote (*bursts*) e contas suspeitas.
5. **Experiência Front-End Dupla:**
   - **Web Admin:** Dashboard analítico em **Next.js 14** (App Router, TailwindCSS).
   - **Mobile App:** Aplicativo **React Native + Expo Router**, com estética *Liquid Glass* (iOS 18+ concept) e o mascote **Jacquin Praiano** animado a 120fps com Reanimated 3.

---

## 📁 Estrutura do Monorepo

```
caragua-foodtech-mono/
├── AI_CONTEXT.md              # Memória de arquitetura completa do projeto
├── README.md                  # Este guia executável de inicialização
├── run_all.py                 # Orquestrador mestre de testes e validação
├── docker-compose.yml         # PostgreSQL 16 (PostGIS + pgvector) + Redis 7
├── docker/
│   ├── Dockerfile.db          # Imagem customizada com PostGIS 3 + pgvector 0.8
│   └── init-db.sql            # Script de criação de extensões espaciais e vetoriais
│
├── backend/                   # API Python FastAPI assíncrona
│   ├── app/
│   │   ├── api/routes/        # Endpoints REST e streaming SSE
│   │   ├── core/              # Configurações Pydantic v2 e LangChain Manager
│   │   ├── db/models/         # Entidades SQLAlchemy 2.0 (PostGIS + pgvector)
│   │   ├── schemas/           # Validações de entrada/saída Pydantic
│   │   ├── services/          # Pipeline RAG de 5 estágios
│   │   └── workers/           # Scraper Playwright, LGPD sanitizer e fraude
│   ├── scripts/               # Testes de ingestão, seeding de Caraguá e migração
│   ├── requirements.txt
│   └── .env.example
│
├── web-admin/                 # Dashboard Administrativo em Next.js 14
│   ├── src/app/               # Páginas App Router (Overview, Moderação, Rankings, RAG)
│   ├── src/components/        # Componentes UI (Sidebar, MetricCard, Header)
│   ├── src/lib/               # Cliente HTTP e tipagens TypeScript
│   └── package.json
│
└── mobile/                    # Aplicativo Mobile React Native / Expo
    ├── src/app/               # Rotas Expo Router ((tabs), Discovery, Perfil)
    ├── src/components/        # Liquid Glass (GlassCard, JacquinFAB, AIBottomSheet)
    ├── src/store/             # Zustand (GPS, alergias, chat)
    ├── assets/images/         # Assets visuais (Mascote Jacquin Praiano)
    └── package.json
```

---

## 🚀 Guia de Execução Rápida (Passo a Passo)

### Pré-requisitos
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado e ativo
- [Python 3.11+](https://www.python.org/)
- [Node.js 18+](https://nodejs.org/)
- App **Expo Go** instalado no seu iPhone ou Android (para testar o mobile)

---

### Passo 1: Subir o Banco de Dados Híbrido

No terminal raiz do projeto:

```bash
docker compose up -d
```

Verifique se os contêineres subiram:
```bash
docker ps
```
Você verá o `caragua-foodtech-db` (porta `5432`) e o `caragua-foodtech-redis` (porta `6379`) em execução.

---

### Passo 2: Inicializar o Backend FastAPI

Abra um novo terminal para o backend:

```bash
cd backend

# Criar e ativar ambiente virtual
python -m venv .venv

# Windows (PowerShell):
.venv\Scripts\Activate.ps1
# Linux / macOS:
# source .venv/bin/activate

# Instalar dependências
pip install -r requirements.txt

# Configurar variáveis de ambiente
copy .env.example .env     # No Linux/macOS use: cp .env.example .env
```

Edite o arquivo `.env` para inserir sua chave de LLM (OpenAI ou Ollama local):
```ini
OPENAI_API_KEY=sk-...               # Opcional se usar Ollama
OLLAMA_BASE_URL=http://localhost:11434
LLM_PROVIDER=openai                 # ou ollama
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/caragua_foodtech
REDIS_URL=redis://localhost:6379/0
```

Popule o banco de dados com o conjunto de dados hiperlocal de Caraguatatuba:
```bash
python scripts/seed_caragua_data.py
```

Inicie o servidor FastAPI:
```bash
uvicorn app.main:app --reload --port 8000
```
- **Documentação Swagger:** Acesse `http://localhost:8000/docs`
- **Healthcheck:** Acesse `http://localhost:8000/api/v1/health`

---

### Passo 3: Inicializar o Dashboard Web Admin (Next.js 14)

Abra outro terminal:

```bash
cd web-admin
npm install
npm run dev
```
Acesse o dashboard em: **`http://localhost:3000`**

Módulos disponíveis no Dashboard:
- `/` — Visão geral de métricas do sistema e diagrama do RAG
- `/moderation` — Fila de aprovação de promoções e alertas de fraude
- `/rankings` — Comparativo entre notas históricas vs. notas decaídas pelo tempo
- `/rag-test` — Playground interativo com streaming SSE de tokens da LLM

---

### Passo 4: Inicializar o Aplicativo Mobile (Expo / React Native)

Abra outro terminal:

```bash
cd mobile
npm install
npx expo start --tunnel
```

- **No iPhone / Android:** Abra o app **Expo Go** e escaneie o QR Code gerado no terminal.
- O app será carregado com a interface *Liquid Glass*, o feed interativo e o **Jacquin Praiano FAB** pulsando no canto inferior direito. Toque nele para conversar com a IA em tempo real!

---

### Passo 5: Executar a Suíte de Validação Mestre

Para auditar e testar todo o ecossistema com um único comando:

```bash
python run_all.py
```

Este script executa:
1. Validação estrutural de todos os diretórios do monorepo;
2. Compilação sintática rigorosa dos 34 arquivos Python;
3. Teste unitário de sanitização LGPD (minimização de PIIs e SHA-256);
4. Teste unitário de detecção de fraudes (Random Forest / Heurísticas);
5. Auditoria de modelos SQLAlchemy e do Pipeline RAG de 5 Estágios;
6. Validação das 4 páginas do Web Admin Dashboard.

---

## 🛡️ Conformidade com a LGPD e Segurança

Os testes de conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018) podem ser executados separadamente:

```bash
cd backend
python scripts/test_scraping_and_fraud.py
```

Resultados esperados:
- **Artigo 5º e 6º:** CPFs, e-mails, telefones e números de cartão são mascarados antes de atingir o banco.
- **Pseudonimização:** Nomes e identificadores brutos recebem hashing SHA-256 com *salt* criptográfico secreto.

---

## 📄 Licença e Créditos Acadêmicos

Desenvolvido por **Gabriel Rodrigues** sob as diretrizes acadêmicas do Centro Universitário Módulo (Cruzeiro do Sul Educacional). Projeto open-source sob licença MIT.
