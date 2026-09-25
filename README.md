# Caraguá FoodTech - Agregador Gastronômico Inteligente

**Projeto de Conclusão de Curso (TCC) - Análise e Desenvolvimento de Sistemas**  
**Instituição:** Centro Universitário Módulo (Cruzeiro do Sul Educacional) - Campus Caraguatatuba  

---

## 📌 Visão Geral do Projeto
O **Caraguá FoodTech** é um ecossistema de recomendação gastronômica hiperlocal para o município de Caraguatatuba/SP. O sistema supera as limitações de filtragens colaborativas tradicionais através de um **Pipeline RAG (Retrieval-Augmented Generation) de 5 Estágios**, fundamentado em engenharia de dados espaciais (PostGIS e H3) e busca semântica vetorial (`pgvector`).

A arquitetura resolve dois problemas centrais identificados na literatura acadêmica:
1. **Alucinação Factual e Segurança Alimentar:** Modelos generativos puros falham em restrições alimentares críticas (alergias severas, intolerâncias). O sistema isola as regras determinísticas no banco espacial e relacional antes de repassar qualquer dado à IA Generativa.
2. **Ambientes Anti-Scraping e Volatilidade:** Ingestão de dados em lote noturno através da interceptação de tráfego de rede (XHR/JSON) via Playwright assíncrono, garantindo integridade e conformidade com a LGPD (Artigos 5º e 6º).

---

## 🏗️ Topologia da Arquitetura (Pipeline RAG de 5 Estágios)

```
[ Usuário / Cliente ]
        │
        ▼
[ Estágio 1: Extração de Intenção ] ──> LLM leve extrai parâmetros estruturados (JSON)
        │
        ▼
[ Estágio 2: Enriquecimento Dinâmico ] ──> Acopla GPS em tempo real, meteorologia e Food Safety
        │
        ▼
[ Estágio 3: Busca Híbrida Determinística ] ──> Filtro Cartesiano PostGIS (ST_DWithin) + Cosseno pgvector (<->)
        │
        ▼
[ Estágio 4: Injeção de Contexto Factual ] ──> Ancoragem estrita de pratos, distâncias reais e avaliações auditadas
        │
        ▼
[ Estágio 5: Streaming Gerativo ] ──> Síntese retórica pelo LLM Manager via SSE (Server-Sent Events)
```

---

## 🚀 Tecnologias Empregadas

- **Backend:** Python 3.11+, FastAPI, Pydantic V2, SQLAlchemy 2.0 (AsyncIO).
- **Banco de Dados Híbrido:** PostgreSQL 16 + `pgvector` (busca vetorial) + `PostGIS` (análise espacial).
- **Orquestração de IA:** LangChain, Ollama / modelos híbridos de linguagem.
- **Engenharia Locacional:** PostGIS (`ST_DWithin`), Uber H3 e Geohash.
- **Ingestão & Scraping:** Playwright Assíncrono com interceptação de rede (`page.on('response', ...)`).
- **Mitigação de Fraudes:** Scikit-Learn (Random Forest) + Imbalanced-Learn (SMOTE).
- **Web Admin Dashboard:** Next.js 14 (App Router), React, TailwindCSS, TypeScript.
- **Containerização:** Docker e Docker Compose.

---

## 📂 Estrutura do Repositório (Monorepo)

```
caragua-foodtech-mono/
├── docker-compose.yml
├── docker/
│   ├── Dockerfile.db
│   └── init-db.sql
├── backend/
│   ├── requirements.txt
│   └── app/
│       ├── main.py
│       ├── api/
│       ├── core/
│       ├── db/
│       ├── schemas/
│       ├── services/
│       └── workers/
└── web-admin/
    ├── package.json
    ├── tailwind.config.js
    └── src/
```

---

## 🛠️ Como Executar o Ambiente

1. **Subir os serviços de banco de dados e cache:**
   ```bash
   docker compose up -d
   ```

2. **Configurar o Backend (FastAPI):**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # No Windows: venv\Scripts\activate
   pip install -r requirements.txt
   uvicorn app.main:app --reload --port 8000
   ```

3. **Configurar o Web Admin (Next.js 14):**
   ```bash
   cd ../web-admin
   npm install
   npm run dev
   ```
