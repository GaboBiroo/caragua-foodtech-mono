# AI_CONTEXT.md — Memória de Arquitetura e Contexto de Pair Programming

> **Projeto:** Caraguá FoodTech — Agregador Gastronômico Hiperlocal com IA (RAG de 5 Estágios)  
> **Finalidade:** Trabalho de Conclusão de Curso (TCC) em Análise e Desenvolvimento de Sistemas  
> **Instituição:** Centro Universitário Módulo (Cruzeiro do Sul Educacional) — Campus Caraguatatuba/SP  
> **Autor / Desenvolvedor:** Gabriel Rodrigues ([@GaboBiroo](https://github.com/GaboBiroo))  
> **Repositório Monorepo:** `https://github.com/GaboBiroo/caragua-foodtech-mono.git`  
> **Data de Consolidação:** Setembro de 2026  

---

## 1. Escopo e Objetivo Geral

O **Caraguá FoodTech** é um ecossistema gastronômico hiperlocal concebido especificamente para a realidade de **Caraguatatuba (Litoral Norte de São Paulo)**. O projeto soluciona simultaneamente três dores estruturais dos agregadores convencionais (ex: iFood, Google Maps):

1. **Distorção Sazonal das Avaliações:** No litoral, estabelecimentos recebem avaliações extremas na alta temporada de verão (turistas enfrentando filas) que não refletem a consistência e qualidade do restaurante ao longo do ano.
2. **Alucinações de IA em Segurança Alimentar:** Modelos generativos tradicionais inventam pratos ou ignoram restrições fatais de saúde (ex: doença celíaca, alergia severa a frutos do mar).
3. **Falta de Hiperlocalidade Geográfica:** Plataformas globais desconhecem particularidades geográficas locais (distâncias entre bairros litorâneos como Martin de Sá, Indaiá, Centro, Porto Novo, culinária caiçara nativa).

### Componentes do Monorepo
- **`/backend`:** API assíncrona em Python 3.11+ / FastAPI, banco híbrido relacional, geoespacial e vetorial, orquestrador do Pipeline RAG de 5 Estágios, scraping com Playwright, filtros LGPD e detector de fraudes.
- **`/web-admin`:** Dashboard administrativo em Next.js 14 (App Router, TailwindCSS, TypeScript) para moderação de capturas noturnas, monitoramento de avaliações decaídas e testes de streaming RAG.
- **`/mobile`:** Aplicativo móvel em React Native + Expo Router, estilizado sob o conceito *Liquid Glass* (Glassmorphism com Expo Blur e NativeWind v4), animações a 120fps com Reanimated 3, chat SSE em tempo real e o mascote **Jacquin Praiano** como Floating Action Button (FAB) vivo.
- **`/docker`:** Infraestrutura de contêineres com PostgreSQL 16 (extensões `postgis` e `pgvector`), Redis 7 e scripts de inicialização.

---

## 2. Decisões Arquiteturais Fundamentadas

### 2.1. Banco Híbrido: PostgreSQL 16 + PostGIS + pgvector
* **Por que não um banco vetorial puro (ex: Pinecone, Milvus)?**
  Bancos puramente vetoriais pecam em filtros relacionais e geográficos complexos. O PostgreSQL 16 com **PostGIS** permite indexação espacial indexada por R-Tree (`GIST`) executando consultas `ST_DWithin` com precisão métrica (WGS84 / SRID 4326), enquanto o **pgvector** armazena embeddings de 1536 dimensões indexados com `HNSW` (Hierarchical Navigable Small World). Isso viabiliza busca híbrida em uma única transação ACID.
* **Geometrias e Índices Espaciais:**
  Cada restaurante possui `coordinates = Column(Geometry(geometry_type="POINT", srid=4326))` acompanhado de resolução H3 (níveis 8 e 9) e Geohashes para cache geoespacial em Redis.

### 2.2. Pipeline RAG de 5 Estágios (Zero-Hallucination Framework)
A IA Generativa (LLM) **nunca acessa o banco de dados diretamente** nem formula queries SQL arbitrárias. Ela segue 5 estágios rigorosos:
1. **Extração de Intenção Estruturada:** O usuário envia texto livre (ex: *"Quero comer peixe frito barato perto da praia"*). A LLM categoriza em `ExtractedIntentSchema` (Pydantic v2): culinária, orçamento, bairro, restrições alimentares e query semântica purificada.
2. **Enriquecimento Dinâmico:** Injeção das coordenadas GPS atuais do usuário, raio de busca padrão (km) e checagem cruzada das diretrizes de segurança alimentar do perfil (celíaco, intolerante a lactose).
3. **Busca Híbrida Determinística (PostGIS + pgvector):** Consulta SQL compilada via SQLAlchemy 2.0 executando:
   - Filtro rígido PostGIS: `ST_DWithin(restaurant.coordinates, ST_MakePoint(lon, lat), raio)`
   - Filtro rígido de Segurança Alimentar: booleanos `is_gluten_free`, `is_vegan` nos pratos.
   - Similaridade de Cosseno: `dish.embedding <=> query_vector` ordenado por menor distância.
4. **Ancoragem Factual (Grounding Context):** O backend monta um bloco de contexto factual estrito com nome, preço, ingredientes verificados, endereço e nota ponderada dos pratos encontrados. Se nada for encontrado, o pipeline bloqueia e avisa o usuário sem inventar dados.
5. **Streaming Gerativo (SSE):** A LLM formula a resposta em linguagem natural (persona acolhedora e caiçara) transmitindo tokens via *Server-Sent Events* (`text/event-stream`).

### 2.3. Algoritmo de Decaimento Temporal Exponencial das Avaliações
Para neutralizar o viés sazonal turístico de Caraguatatuba, cada review tem sua nota recalculada em rotinas noturnas via decaimento exponencial contínuo:
$$\text{Weight}(t) = e^{-\lambda \cdot \Delta t}$$
Onde:
- $\Delta t$ é o tempo decorrido desde a publicação em dias;
- $\lambda$ é a taxa de decaimento ajustada para meia-vida de 90 dias ($\lambda = \frac{\ln(2)}{90} \approx 0.0077$).
Desta forma, uma avaliação de 5 estrelas feita há 18 meses por um turista tem peso inferior a uma avaliação de 4 estrelas concedida há 15 dias por um morador local.

### 2.4. Conformidade Rigorosa com a LGPD (Artigos 5º e 6º)
O módulo `sanitizer_lgpd.py` processa todo dado proveniente de scraping antes de qualquer persistência:
- PIIs como CPF, RG, número de telefone, e-mail e dados de pagamento são expurgados por expressões regulares de precisão.
- O identificador do autor da avaliação é pseudonimizado através de hash irreversível SHA-256 com salt secreto da aplicação (`SHA256(raw_author + salt)`).

### 2.5. Detecção de Fraudes Heurística (Mackenzie 2024 Benchmark)
Inspirado nas pesquisas da Universidade Presbiteriana Mackenzie com balanceamento SMOTE e classificadores Random Forest, o módulo `fraud_detector.py` audita avaliações suspeitas através de métricas de:
- Concentração de avaliações em curto intervalo de tempo (burst attacks);
- Comprimento e lexical diversity anômalos;
- Repetição de padrões sintáticos de contas com histórico zero de consumo.

### 2.6. Design System Front-End: Liquid Glass (Mobile)
- **Stack:** React Native (Expo SDK 52, Expo Router v4, React 18, TypeScript).
- **Estética:** *Liquid Glass* (transparências extremas, bordas ultrafinas com brilho `rgba(255,255,255,0.15)`, cantos generosos `rounded-3xl`, sombras profundas com blur nativo).
- **Mascote Jacquin Praiano:** Componente `JacquinFAB.tsx` animado com React Native Reanimated 3 com ciclo constante de respiração (*breathing idle animation* a 120fps) e anel de brilho (*glow ring*) teal em frequência acelerada durante streaming da IA.

---

## 3. Status Atual do Projeto (Checklist de Implementação)

| Componente / Módulo | Arquivos Principais | Status | Validação / Testes |
|---|---|---|---|
| **Infraestrutura Docker** | `docker-compose.yml`, `docker/Dockerfile.db`, `docker/init-db.sql` | 100% Concluído | Extensões PostGIS + pgvector + pg_trgm validadas |
| **Modelos Híbridos DB** | `backend/app/db/models/*.py` (5 modelos) | 100% Concluído | Compilação sintática 100% (`py_compile`) |
| **Sanitização LGPD** | `backend/app/workers/sanitizer_lgpd.py` | 100% Concluído | **Testado e aprovado** em `test_scraping_and_fraud.py` |
| **Detector de Fraudes** | `backend/app/workers/fraud_detector.py` | 100% Concluído | **Testado e aprovado** em `test_scraping_and_fraud.py` |
| **Scraper Playwright** | `backend/app/workers/scraper_playwright.py` | 100% Concluído | Interceptação de respostas XHR/JSON implementada |
| **Pipeline RAG 5 Estágios** | `backend/app/services/rag_pipeline.py` | 100% Concluído | Extração de Intenção + Grounding + SSE Streaming |
| **Rotas da API FastAPI** | `backend/app/api/routes/*.py` | 100% Concluído | Rotas `/search/rag`, `/search/hybrid`, `/restaurants`, `/moderation` |
| **Seeder Caraguatatuba** | `backend/scripts/seed_caragua_data.py` | 100% Concluído | Coordenadas reais de bairros de Caraguá + Embeddings |
| **Orquestrador Mestre** | `run_all.py` | 100% Concluído | **Passou 100%** validando 34 arquivos Python |
| **Web Admin Dashboard** | `web-admin/src/app/**` (4 telas) | 100% Concluído | Estrutura App Router, Tailwind e componentes criados |
| **App Mobile React Native**| `mobile/src/**` (26 arquivos) | 100% Concluído | Liquid Glass, Reanimated 3, JacquinFAB, Chat SSE, Expo Router |

---

## 4. Próximos Passos Imediatos ao Clonar na Máquina Local

1. **Subir o Banco de Dados com Docker:**
   ```bash
   cd caragua-foodtech-mono
   docker compose up -d
   ```
2. **Instalar Dependências e Executar o Backend:**
   ```bash
   cd backend
   python -m venv .venv
   source .venv/bin/activate  # ou .venv\Scripts\activate no Windows
   pip install -r requirements.txt
   cp .env.example .env       # Configurar OPENAI_API_KEY ou OLLAMA_BASE_URL
   python scripts/seed_caragua_data.py
   uvicorn app.main:app --reload --port 8000
   ```
3. **Executar o Dashboard Web Admin:**
   ```bash
   cd ../web-admin
   npm install
   npm run dev
   # Acesse em: http://localhost:3000
   ```
4. **Executar o App Mobile no Expo:**
   ```bash
   cd ../mobile
   npm install
   npx expo start --tunnel   # Gera QR Code direto para o app Expo Go no iPhone/Android
   ```
