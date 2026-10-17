# 📄 ESPELHO OFICIAL DO TEMPLATE (.DOCX) — SEMANA 13 (S13)
**Arquivo de Destino:** `APSII_S13_CARAFOOD.docx`  
*(Copie e cole as seções abaixo diretamente nos quadros correspondentes do template Word oficial do Prof. Me. Cristiano S. Negrão)*

---

## 🏛️ 1. CABEÇALHO INSTITUCIONAL E IDENTIFICAÇÃO DO PROJETO

| Campo do Template | Conteúdo Oficial Preenchido |
| :--- | :--- |
| **Instituição de Ensino** | Centro Universitário Módulo — Caraguatatuba/SP |
| **Disciplina** | Análise e Projeto de Sistemas II (APS II) — Semestre 2026/2 |
| **Docente Orientador / Avaliador** | Prof. Me. Cristiano S. Negrão |
| **Nome Oficial do Projeto / Sistema** | **CaráFood (Caraguá FoodTech)** |
| **Integrantes e Papéis** | • **Gabriel Rodrigues** (*PO, Tech Lead & Dev Front-End / IA*)<br>• **Matheus Vicente** (*Engenheiro de Dados, Dev Back-End & DBA PostgreSQL*)<br>• **Pedro Simone** (*Engenheiro de QA, UX Researcher & Documentação*) |
| **URL de Produção (PaaS Vercel)** | [https://foddtech.vercel.app/](https://foddtech.vercel.app/) |
| **Endpoints de Persistência Ativos** | `POST/GET /api/reviews`, `GET /api/restaurants`, `GET /api/search` e `POST /api/chat` |

---

## ☁️ 2. ESCOLHA DA ARQUITETURA DE DEPLOY E BANCO DE DADOS RELACIONAL

Para garantir alta disponibilidade, custo zero de hospedagem acadêmica e escalabilidade industrial, a equipe adotou a seguinte pilha de infraestrutura em nuvem:

1. **Plataforma de Aplicação (PaaS): Vercel Cloud (`https://foddtech.vercel.app/`):**
   - Nativa para o framework **Next.js 14 (App Router)**, oferecendo integração contínua (*CI/CD*) conectada diretamente à branch `main` do GitHub (`GaboBiroo/caragua-foodtech-mono`), certificado SSL/TLS automático, CDN global e execução *Serverless* das rotas de API (`src/app/api/*`).
2. **Sistema Gerenciador de Banco de Dados (SGBD): PostgreSQL 15+ (Supabase / Neon Serverless Postgres + Prisma ORM):**
   - Banco de dados relacional gerenciado na nuvem com suporte nativo à extensão geoespacial **PostGIS** e indexação **Uber H3**, acessado pelo Back-End via **Prisma ORM (`backend/prisma/schema.prisma`)** e *Connection Pooling* (`pgBouncer`) na porta `6543` para evitar exaustão de conexões em funções Serverless.

---

## 🗄️ 3. ESQUEMA DE TABELAS DO BANCO DE DADOS E FLUXOS DE PERSISTÊNCIA

### 3.1 Script DDL (SQL PostgreSQL) das Tabelas Nucleares Persistidas

```sql
-- 1. Tabela Oficial dos 53 Bairros e 4 Macro-Regiões de Caraguatatuba
CREATE TABLE neighborhoods (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    macro_region VARCHAR(64) NOT NULL, -- 'orla-central', 'costa-norte', 'eixo-sul', 'serra-interior'
    h3_index_res9 VARCHAR(20) NOT NULL,
    llm_specialty TEXT NOT NULL
);

-- 2. Tabela de Estabelecimentos Gastronômicos Credenciados
CREATE TABLE restaurants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(160) NOT NULL,
    neighborhood_id VARCHAR(64) NOT NULL REFERENCES neighborhoods(id),
    distance_km NUMERIC(4,2) NOT NULL DEFAULT 0.50,
    verified_source VARCHAR(120) NOT NULL, -- Ex: 'AMAPEC Cocanha', 'Colônia Z-8 Camaroeiro', 'SECTUR'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Tabela de Pratos do Catálogo CaráFood
CREATE TABLE dishes (
    id VARCHAR(80) PRIMARY KEY,
    restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
    dish_name VARCHAR(180) NOT NULL,
    dish_category VARCHAR(80) NOT NULL,
    dish_price NUMERIC(10,2) NOT NULL,
    post_image TEXT NOT NULL,
    caption TEXT NOT NULL,
    jacquin_tip TEXT NOT NULL,
    caragua_gosto_award VARCHAR(140),
    super_rating NUMERIC(3,2) NOT NULL DEFAULT 5.00,
    total_reviews INTEGER NOT NULL DEFAULT 1
);

-- 4. Tabela de Cédulas Oficiais Auditadas (Fluxo Principal de Persistência S13)
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dish_id VARCHAR(80) NOT NULL REFERENCES dishes(id) ON DELETE CASCADE,
    author_name VARCHAR(120) NOT NULL,
    flavor_score SMALLINT NOT NULL CHECK (flavor_score BETWEEN 1 AND 5),       -- Peso 35%
    presentation_score SMALLINT NOT NULL CHECK (presentation_score BETWEEN 1 AND 5), -- Peso 20%
    originality_score SMALLINT NOT NULL CHECK (originality_score BETWEEN 1 AND 5),   -- Peso 15%
    service_score SMALLINT NOT NULL CHECK (service_score BETWEEN 1 AND 5),     -- Peso 15%
    ambiance_score SMALLINT NOT NULL CHECK (ambiance_score BETWEEN 1 AND 5),   -- Peso 15%
    weighted_score NUMERIC(3,2) NOT NULL,
    table_voucher VARCHAR(64),
    comment_text TEXT NOT NULL,
    z_score_valid BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Tabela de Solicitações de Credenciamento B2B (/contato)
CREATE TABLE merchant_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    protocol_code VARCHAR(32) UNIQUE NOT NULL,
    owner_name VARCHAR(140) NOT NULL,
    restaurant_name VARCHAR(160) NOT NULL,
    neighborhood_id VARCHAR(64) NOT NULL REFERENCES neighborhoods(id),
    category VARCHAR(80) NOT NULL,
    email VARCHAR(160) NOT NULL,
    whatsapp VARCHAR(40) NOT NULL,
    flagship_dish VARCHAR(160),
    message TEXT NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'PENDING_CURATION',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 3.2 Detalhamento do Fluxo Funcional de Gravação e Leitura (`POST /api/reviews` $\leftrightarrow$ PostgreSQL)
1. **Entrada no Front-End:** O usuário abre o modal **"Cédula Oficial • Caraguá a Gosto"** em qualquer prato (na Home `/` ou em `/prato/[id]`), atribui as notas de 1 a 5 para os 5 critérios oficiais, informa o número da mesa/cupom e redige sua crítica gastronômica.
2. **Processamento na API Route (`src/app/api/reviews/route.ts`):** A requisição `POST /api/reviews` valida os tipos de dados, calcula no servidor a **Super Nota Ponderada** ($S = 0,35 \cdot N_1 + 0,20 \cdot N_2 + 0,15 \cdot N_3 + 0,15 \cdot N_4 + 0,15 \cdot N_5$), verifica o índice anti-fraude **Z-Score** ($|Z| \le 2.5$) e executa o comando `INSERT INTO reviews` no PostgreSQL (com *fallback* resiliente em memória/seed caso o cluster esteja em manutenção), recalculando a média do prato com decaimento exponencial de 30 dias ($\lambda = \ln(2)/30$).
3. **Leitura e Atualização Imediata:** O endpoint retorna HTTP `201 Created` com o registro recém-gravado, atualizando imediatamente a lista de avaliações do prato e creditando `+50 Pontos Gourmet` ao usuário.

---

## ⚙️ 4. PASSO A PASSO DO DEPLOY E VARIÁVEIS DE AMBIENTE

1. **Passo 1 — Provisionamento do Banco PostgreSQL:** Criação do banco `carafood_prod` no Supabase/Neon, execução das migrations do Prisma (`npx prisma migrate deploy`) e carga inicial dos 53 bairros e 15 pratos sementes (`npx prisma db seed`).
2. **Passo 2 — Configuração das Variáveis de Ambiente no Painel da Vercel (`Settings > Environment Variables`):**
   - `DATABASE_URL`: String de conexão PostgreSQL com Pooler TLS (`postgresql://postgres:[SENHA]@db.supabase.co:6543/postgres?pgbouncer=true`);
   - `DIRECT_URL`: String de conexão direta para migrações (`porta 5432`);
   - `GEMINI_API_KEY`: Chave de API para o motor conversacional RAG do *Chef Jacquin Praiano* (`/api/chat`);
   - `NEXT_PUBLIC_APP_URL`: `https://foddtech.vercel.app`.
3. **Passo 3 — Pipeline Contínuo GitHub $\rightarrow$ Vercel:** A cada `git push origin main`, a Vercel executa `npm install`, roda `next build` (compilando as 28 rotas estáticas e dinâmicas com código de saída `0`), executa `node scripts/copy-build.js` e publica a versão em produção em menos de 45 segundos.

---

## 📸 5. EVIDÊNCIAS VISUAIS DO DEPLOY E BANCO DE DADOS (PARA INSERÇÃO NO .DOCX)

> 📌 **[ESPAÇO PARA PRINT 01 — PAINEL DE DEPLOYMENTS DA VERCEL (`foddtech.vercel.app`) COM STATUS "READY"]:** Captura do dashboard da Vercel e do log de build concluído com sucesso (`28/28 static & dynamic pages`).  
> 📌 **[ESPAÇO PARA PRINT 02 — FLUXO COMPLETO DE GRAVAÇÃO DE AVALIAÇÃO (`POST /api/reviews`) E TABELA DO BANCO]:** Captura da emissão de uma Cédula Oficial na aplicação em produção e do registro persistido.
