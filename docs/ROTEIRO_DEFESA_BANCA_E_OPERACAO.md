# ROTEIRO EXECUTIVO DE DEFESA DE TCC E MANUAL DE OPERAÇÃO EM PRODUÇÃO — PLATAFORMA CARÁFOOD

**Projeto:** CaráFood (Caraguá FoodTech) — Ecossistema Hiperlocal Autônomo de Descoberta Gastronômica e Busca Híbrida Espacial-Vetorial-Léxica ($\text{SVL-RRF}$)  
**Cobertura Geográfica:** 53 Bairros Oficiais de Caraguatatuba — Litoral Norte de São Paulo  
**Stack de Produção Auditada:** PostgreSQL 16 (`PostGIS 3.6` + `pgvector 0.8.7` + `pg_trgm 1.6`) • Redis 7 • FastAPI (AsyncPG / SQLAlchemy 2.0) • Next.js 14 (App Router / TypeScript Strict)

---

## 1. Inicialização Rápida do Ecossistema (1 Comando por Camada)

### 1.1. Camada de Dados e Coordenação (Docker Compose)
```powershell
cd "c:\Users\Usuario\Desktop\Projetos Pessoais\Projeto gastronomia na faculdade\caragua-foodtech-mono"
docker compose up -d
```
* **PostgreSQL 16 + PostGIS + pgvector:** `localhost:5432` (container `caragua_foodtech_db` — `healthy`)
* **Redis 7 (Topological Queue & Checkpoints 24h):** `localhost:6379` (container `caragua_foodtech_redis` — `healthy`)

### 1.2. Servidor Backend Assíncrono (FastAPI — Porta `8000`)
```powershell
cd "c:\Users\Usuario\Desktop\Projetos Pessoais\Projeto gastronomia na faculdade\caragua-foodtech-mono\backend"
.\.venv\Scripts\uvicorn.exe app.main:app --host 0.0.0.0 --port 8000 --reload
```
* **Swagger UI Interativo (OpenAPI 3.1):** `http://localhost:8000/docs`
* **Health & Telemetria do Cluster:** `http://localhost:8000/api/v1/moderation/scraper/status`

### 1.3. Servidor Frontend Reativo (Next.js 14 — Porta `3000`)
```powershell
cd "c:\Users\Usuario\Desktop\Projetos Pessoais\Projeto gastronomia na faculdade\caragua-foodtech-mono"
npm run dev
```
* **Vitrine Hiperlocal & Busca Conversacional:** `http://localhost:3000`
* **Command Center Operacional & Moderação:** `http://localhost:3000/moderation`

---

## 2. Roteiro Cronometrado de Demonstração ao Vivo para a Banca (5 Minutos)

### Ato 1 — Descoberta Hiperlocal e Trava de Segurança Alimentar (00:00 – 01:30)
1. Abra `http://localhost:3000`.
2. Destaque no seletor territorial que **todos os 53 bairros oficiais de Caraguatatuba** estão mapeados e povoados nas 3 macrorregiões (*Orla Central*, *Costa Norte* e *Eixo Sul*).
3. Selecione um polo gastronômico específico (ex.: **Martim de Sá**, **Centro** ou **Cocanha**) e ative os chips de segurança alimentar (**🌱 Vegano**, **🌾 Sem Glúten** ou **🥛 Zero Lactose**).
4. Aponte nos cards o **Score Bayesiano Ponderado ($W_R$)** e o badge **📉 Queda de Preço Auditada**, calculado a partir da série histórica em `dish_price_history`.

### Ato 2 — Página Canônica do Estabelecimento e Conformidade LGPD (01:30 – 02:30)
1. Clique em qualquer estabelecimento (ex.: *Quiosque Mar Bravo Caiçara* ou *Cantina & Peixaria Caiçara do Centro*) para abrir `/restaurants/[slug]`.
2. Mostre no cabeçalho as coordenadas geográficas validadas por PostGIS e o índice espacial hexagonal **Uber H3 (Resolução 9)**.
3. Role até a seção de **Avaliações Auditadas pela LGPD**:
   - Mostre que nenhum nome civil é armazenado em banco: cada titular é identificado exclusivamente por seu hash criptográfico salgado `sha256:...`.
   - Destaque os tokens `[ENDERECO_RESIDENCIAL_REMOVIDO]`, `[TELEFONE_REMOVIDO]`, `[EMAIL_REMOVIDO]` e `[CPF_REMOVIDO]` aplicados deterministicamente pelo `LGPDSanitizer` antes do commit ACID.

### Ato 3 — Motor Conversacional Híbrido $\text{SVL-RRF}$ via Streaming SSE (02:30 – 03:45)
1. Clique no botão **"Assistente IA CaráFood"** na barra superior para abrir o `CaraguaAIChatDrawer`.
2. Clique em um dos chips hiperlocais ou envie:
   > *"Quais opções veganas ou sem lactose estão disponíveis até R$ 65?"*
3. Explique para a banca enquanto os tokens chegam via **Server-Sent Events (`POST /api/v1/chat/stream`)**:
   - O sistema aplica **primeiro** a trava relacional determinística (`WHERE is_vegan = TRUE ... AND price <= 65.0`) no PostgreSQL 16, garantindo **alucinação zero** em restrições alimentares.
   - Sobre o subconjunto seguro, uma única CTE calcula simultaneamente a distância cosseno em **1536 dimensões (`pgvector` HNSW)**, a distância geodésica em metros (**PostGIS**) e a similaridade lexical (**`pg_trgm`**), fundindo-os via **Reciprocal Rank Fusion ($\kappa = 60$)** em **~6,5 ms (P50)**.

### Ato 4 — Command Center Operacional e Triggers PL/pgSQL em Tempo Real (03:45 – 05:00)
1. Alterne na barra superior para o **Command Center (`/moderation`)**.
2. Mostre os 4 KPIs em tempo real (atualizados por polling de 3s no Redis 7 + PostgreSQL 16):
   - **67 Restaurantes Georreferenciados**;
   - **131 Pratos Indexados em `vector(1536)`**;
   - **Fila de Quarentena**;
   - **53 / 53 Checkpoints Redis 24h Ativos**.
3. Na **Aba 1 (Fila de Quarentena)**, clique em **"Aprovar & Indexar 1536d"** em um prato retido:
   - A UI atualiza instantaneamente (*Optimistic UI*);
   - A trigger PL/pgSQL `trg_dish_after_change_stats` incrementa automaticamente o contador `active_dishes_count` do restaurante;
   - O `VectorIndexingService` projeta e grava o vetor denso de 1536 dimensões, tornando o prato imediatamente pesquisável no RAG e visível na vitrine!
4. Na **Aba 2 (Radar de Inflação & Quedas de Preço)**, mostre as curvas **Sparkline SVG** nativas de evolução tarifária.
5. Na **Aba 3 (Topologia dos 53 Bairros)**, mostre a cobertura integral de 100% dos bairros de Caraguatatuba.

---

## 3. Perguntas Clássicas de Banca Examinadora e Respostas Fundamentadas

### Q1: Por que usar filtro relacional SQL estrito antes da busca vetorial em vez de buscar apenas por embeddings (`pgvector`)?
> **Resposta:** Embeddings densos operam por similaridade contínua no espaço $\mathbb{R}^{1536}$. Em cenários de segurança alimentar (*Food Safety*), "prato com queijo" e "prato sem lactose" compartilham contexto semântico culinário muito próximo. Delegar restrições alérgicas ou dietéticas exclusivamente à distância cosseno introduz risco de falsos positivos. Ao impor predicados booleanos exatos (`WHERE is_lactose_free = TRUE`) no plano relacional do PostgreSQL **antes** do operador `<=>`, reduzimos a probabilidade de violação dietética a **zero matemático**, além de acelerar a varredura HNSW.

### Q2: Como funciona a deduplicação de estabelecimentos capturados em múltiplas plataformas (iFood, Goomer, MenuDino, Google Maps)?
> **Resposta:** Implementamos o funcional híbrido $H(R, C)$ combinando proximidade geodésica no elipsoide WGS-84 (`PostGIS ST_DWithin` até 50m) e similaridade de trigramas insensível a acentos (`pg_trgm` + `unaccent`). Dois registros só são fundidos na mesma entidade canônica quando superam simultaneamente o limiar composto $H(R,C) \ge 0.72$ e a trava lexical mínima $\text{sim}_{\text{trgm}} \ge 0.72$. Isso evita tanto duplicatas de um mesmo restaurante quanto falsas fusões de restaurantes vizinhos de nomes distintos na mesma calçada.

### Q3: Como o sistema evita que um restaurante recém-cadastrado com apenas 1 avaliação nota 5.0 ultrapasse restaurantes tradicionais com centenas de avaliações 4.8?
> **Resposta:** Através da **Média Bayesiana Ponderada ($W_R$ — Suavização de Laplace)**:
> $$W_R = \frac{v}{v + m} R + \frac{m}{v + m} C$$
> Com mínimo de confiança $m = 10$ avaliações auditadas e prior municipal $C = 4.20$, um estabelecimento com apenas 1 nota 5.0 recebe $W_R = 4.27$, enquanto um estabelecimento consolidado com 50 avaliações e média 4.80 recebe $W_R = 4.70$. Além disso, cada avaliação sofre decaimento exponencial temporal $e^{-\lambda \Delta t}$ e triagem anti-fraude antes de compor $R$.

### Q4: Como a conformidade com a LGPD (Lei nº 13.709/2018) é garantida na esteira de web scraping?
> **Resposta:** Aplicamos *Privacy by Design* na borda de ingestão (`LGPDSanitizer`). Nenhum identificador civil de avaliador é persistido: o nome bruto recebe um *salt* criptográfico e é convertido irreversivelmente em hash `SHA-256` de 64 caracteres hexadecimais (Art. 12 da LGPD). Simultaneamente, o texto livre dos comentários passa por sanitização determinística de expressões regulares que expurgam CPF, RG, telefones, e-mails, chaves Pix/cartões e endereços residenciais (Art. 6º, III — Princípio da Necessidade), validado pela invariante `assert_lgpd_compliant` em 100% das linhas da tabela `reviews`.

---

## 4. Comandos de Auditoria Automatizada e Reprodutibilidade Científica

Para reexecutar a qualquer momento toda a validação diante da banca:

1. **Suíte E2E Full-Stack (Banco + Redis + API + RAG + TypeScript + Build Next.js):**
   ```powershell
   .\caragua-foodtech-mono\backend\.venv\Scripts\python.exe .\caragua-foodtech-mono\backend\scripts\test_full_system_convergence.py
   ```
2. **Suíte de Invariantes do Scraper Autônomo (H(R,C) + LGPD + Quarentena + Preços):**
   ```powershell
   .\caragua-foodtech-mono\backend\.venv\Scripts\python.exe .\caragua-foodtech-mono\backend\scripts\test_autonomous_harvesting_suite.py
   ```
3. **Regeneração Programática do Relatório de Benchmarks ABNT/USP:**
   ```powershell
   .\caragua-foodtech-mono\backend\.venv\Scripts\python.exe .\caragua-foodtech-mono\scripts\generate_tcc_report.py
   ```
