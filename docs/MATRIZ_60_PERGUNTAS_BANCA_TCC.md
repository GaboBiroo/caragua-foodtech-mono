# Matriz Completa de Arguição: 60 Perguntas Críticas de Banca Examinadora de TCC em TI — CaráFood

**Projeto:** CaráFood — Roteiro Gastronômico e Auditoria Cultural dos 53 Bairros de Caraguatatuba  
**Produção:** `https://foddtech.vercel.app/`  
**Repositório:** `https://github.com/GaboBiroo/caragua-foodtech-mono`

---

## BLOCO 1 — Engenharia de Software, Arquitetura & Padrões de Projeto (Q01–Q10)

### Q01: Por que escolheram arquitetura híbrida Web + Serverless (Next.js App Router) em vez de um monolito tradicional MVC separado?
- **Resposta Executiva Direta:** Escolhemos o Next.js 14 App Router porque ele unifica a camada de apresentação (React Server e Client Components) e a camada de API Serverless (`src/app/api/*`) no mesmo pipeline de build e tipagem TypeScript. Isso elimina a latência e o custo de manter dois servidores separados para um MVP acadêmico/regional, permite renderização híbrida (SSR/SSG) com carregamento inicial abaixo de 2 segundos e é suportado nativamente pelo plano gratuito da Vercel com SSL/TLS automático.
- **Lastro Técnico no Código:** `next.config.js`, `vercel.json`, `src/app/layout.tsx` e `src/app/api/*`.

### Q02: Como o sistema garante separação de responsabilidades (SoC) entre interface, regras de negócio e persistência?
- **Resposta Executiva Direta:** Aplicamos uma arquitetura em 3 camadas bem delimitadas: (1) **Camada de Apresentação (`src/app/` e `src/components/`)**, responsável exclusivamente pela renderização responsiva e eventos de UI; (2) **Camada de Serviços e Regras de Negócio (`src/lib/security.ts`, `src/lib/resilienceEngine.ts` e `src/app/api/*`)**, que executa hashing, rate-limit, sanitização, cálculo da Cédula de 5 critérios e Nota Bayesiana $W_R$; e (3) **Camada de Dados (`src/data/realDataStore.ts`, `src/lib/serverIdentityStore.ts` e `backend/sql/init.sql`)**, que encapsula o acesso aos 61 restaurantes, 2.670 pratos e registros transacionais.
- **Lastro Técnico no Código:** `src/lib/security.ts`, `src/lib/resilienceEngine.ts`, `src/data/realDataStore.ts` e `src/lib/serverIdentityStore.ts`.

### Q03: O que acontece sob concorrência alta (ex: 500 turistas acessando no feriado em Caraguatatuba)? Como o sistema escala?
- **Resposta Executiva Direta:** Como o catálogo principal de 61 estabelecimentos e 2.670 pratos é servido via CDN Edge global da Vercel e o cálculo de filtros/distância roda de forma distribuída sem bloquear conexões de banco a cada clique, 500 ou 5.000 turistas simultâneos consomem ativos pré-compilados em cache de borda. As funções Serverless (`/api/*`) escalam horizontalmente sob demanda apenas quando há escrita (novo login, credenciamento ou avaliação).
- **Lastro Técnico no Código:** `src/data/realDataStore.ts` e `src/app/prato/[id]/page.tsx`.

### Q04: Como evitam acoplamento forte entre o frontend React e a fonte de dados?
- **Resposta Executiva Direta:** Os componentes React nunca leem arquivos JSON brutos nem executam queries SQL diretamente. Eles consomem interfaces tipadas através do `realDataStore`, do `AuthContext` e das rotas REST `/api/*`. Se trocarmos o motor de persistência interno por Supabase, Neon PostgreSQL ou uma API externa, nenhum componente visual precisa ser reescrito.
- **Lastro Técnico no Código:** `src/context/AuthContext.tsx`, `src/data/realDataStore.ts` e `src/types/auth.ts`.

### Q05: Quais padrões de projeto (Design Patterns) foram aplicados no código?
- **Resposta Executiva Direta:** Aplicamos quatro padrões clássicos: (1) **Repository / Singleton Pattern** em `realDataStore.ts` e `serverIdentityStore.ts` para centralizar o acesso aos dados; (2) **Circuit Breaker / Fallback Pattern** em `fetchWithResilienceFallback()` (`src/lib/resilienceEngine.ts`) para degradação graciosa; (3) **Provider / Observer Pattern** em `AuthContext.tsx` com sincronização entre abas via evento `storage`; e (4) **Adapter Pattern** em `NativeWebViewShell.tsx` e `nativeBridgeClient.ts` para traduzir chamadas web em intents nativas do React Native.
- **Lastro Técnico no Código:** `src/lib/resilienceEngine.ts`, `src/context/AuthContext.tsx`, `src/utils/nativeBridgeClient.ts` e `mobile/src/components/NativeWebViewShell.tsx`.

### Q06: Por que TypeScript estrito foi adotado em vez de JavaScript puro? Quais bugs reais isso preveniu?
- **Resposta Executiva Direta:** O TypeScript estrito garante validação em tempo de compilação (`npx tsc --noEmit`) de contratos críticos como os 5 pesos da Cédula Oficial, o objeto de sessão `UserSession` (incluindo `nomeSocial`, `pronomeSocial` e `lgpdConsent`), os parâmetros dinâmicos de `/prato/[id]` e a normalização de preços/distâncias (`distance_km`), prevenindo erros de `undefined is not a function` ou `NaN` no cálculo da Nota Ponderada Bayesiana.
- **Lastro Técnico no Código:** `tsconfig.json`, `src/types/auth.ts`, `src/types/copyright.ts` e `src/data/realDataStore.ts`.

### Q07: Como o sistema lida com idempotência em requisições críticas (ex: clique duplo ao enviar credenciamento ou avaliação)?
- **Resposta Executiva Direta:** Todos os formulários (`/login`, `/contato`, Cédula de 5 critérios em `/prato/[id]` e modal de Direitos Autorais) controlam estado de bloqueio (`submitting = true`, `disabled={submitting}`) no exato instante do primeiro submit, impedindo disparos duplicados de `POST`, além do rate-limiting por chave de usuário no servidor.
- **Lastro Técnico no Código:** `src/app/login/page.tsx`, `src/app/contato/page.tsx`, `src/app/prato/[id]/PratoDetailClient.tsx` e `src/components/CopyrightClaimModal.tsx`.

### Q08: Qual a diferença arquitetural entre o ambiente de desenvolvimento local (Docker + FastAPI/PostgreSQL) e o ambiente de produção (Vercel Serverless)?
- **Resposta Executiva Direta:** Em desenvolvimento local (`dev`), dispomos do `docker-compose.yml` com PostgreSQL 15 (`backend/sql/init.sql`) e scripts Python (`backend/`) para coleta e auditoria de cardápios reais. Em produção (`prod` na Vercel), para operar 100% sem custo e sem dependências externas instáveis, o dump auditado gerado pelo pipeline local é embarcado no bundle e servido junto às Next.js Serverless API Routes (`src/app/api/*`).
- **Lastro Técnico no Código:** `docker-compose.yml`, `backend/sql/init.sql`, `src/data/caraguaRealDump.json` e `src/app/api/*`.

### Q09: Como funciona o ciclo de vida de estado da sessão no cliente sem causar vazamento de memória ou dessincronização entre abas?
- **Resposta Executiva Direta:** O `AuthContext.tsx` armazena na chave `carafood_user_session_v2` apenas o objeto público de sessão (nunca a senha) e registra um listener `window.addEventListener('storage', handleStorageSync)` com cleanup no `return () => window.removeEventListener(...)`. Assim, se o usuário fizer login, atualizar seu Nome Social ou sair da conta em uma aba, todas as outras abas abertas sincronizam instantaneamente sem vazamento de listeners.
- **Lastro Técnico no Código:** `src/context/AuthContext.tsx`.

### Q10: Se precisarem transformar isso em aplicativo nativo nas lojas (Google Play / App Store) amanhã, quanto do código atual é reaproveitado?
- **Resposta Executiva Direta:** Reaproveitamos **100% do ecossistema web** por meio da nossa Casca Nativa Híbrida em React Native / Expo (`mobile/src/components/NativeWebViewShell.tsx`), que já implementa interceptação de Intents Externas (`onShouldStartLoadWithRequest` + `Linking.openURL` para abrir Google Maps, Waze e WhatsApp nativos do celular), integração com o botão físico Voltar do Android (`BackHandler` sincronizado com o histórico SPA) e `SafeAreaView` no verde `#0F382C` protegendo relógio e bateria.
- **Lastro Técnico no Código:** `mobile/App.tsx`, `mobile/src/components/NativeWebViewShell.tsx` e `src/utils/nativeBridgeClient.ts`.

---

## BLOCO 2 — Banco de Dados, Persistência, Modelagem & Integridade (Q11–Q20)

### Q11: Como está modelado o banco relacional e como a integridade referencial (PK/FK) é garantida?
- **Resposta Executiva Direta:** O modelo relacional (`backend/sql/init.sql`) estrutura as entidades `restaurants` (PK `id` UUID), `menu_items` (PK `id` UUID, FK `restaurant_id` com `ON DELETE CASCADE`), `reviews` (PK `id` UUID, FK `restaurant_id` e `dish_id` com restrição `CHECK (score BETWEEN 1 AND 5)` nos 5 critérios), `partner_leads` (PK `protocol_code` `CG-FT-XXXXXX`) e `copyright_claims` (`CG-DA-XXXXXX`).
- **Lastro Técnico no Código:** `backend/sql/init.sql`, `src/data/realDataStore.ts` e `src/lib/serverIdentityStore.ts`.

### Q12: No plano gratuito da Vercel, se a instância Serverless reiniciar após inatividade (cold-start), os novos cadastros e avaliações se perdem? Como mitigar/resolver isso?
- **Resposta Executiva Direta:** Documentamos com total transparência na Seção S14 do `README.md` que funções Serverless gratuitas possuem memória efêmera entre redeploys. Para mitigar isso durante o uso real e avaliação da banca, implementamos persistência dupla (Dual-Write): toda alteração grava simultaneamente na instância Serverless (`serverIdentityStore.ts`) E no `localStorage` do cliente (`AuthContext.tsx`), mantendo a sessão, os pontos, os pratos salvos e as avaliações intactas no navegador, enquanto a conexão definitiva com PostgreSQL gerenciado (Supabase/Neon) basta apontar a variável `DATABASE_URL`.
- **Lastro Técnico no Código:** `src/context/AuthContext.tsx`, `src/lib/serverIdentityStore.ts` e `README.md`.

### Q13: Como funciona a migração transparente do Store JSON auditado para um PostgreSQL gerenciado em nuvem (Supabase/Neon) sem reescrever o frontend?
- **Resposta Executiva Direta:** Como todas as páginas e componentes consomem exclusivamente os métodos assíncronos das rotas `/api/*` e os seletores de `realDataStore.ts`, a migração consiste apenas em trocar a leitura em memória dentro dos handlers de `src/app/api/*` pelo driver `pg` / Prisma conectado ao `DATABASE_URL` do Supabase ou Neon, utilizando o mesmo DDL já pronto em `backend/sql/init.sql`.
- **Lastro Técnico no Código:** `backend/sql/init.sql` e `src/app/api/restaurants/leads/route.ts`.

### Q14: Como o sistema evita duplicidade de restaurantes quando o mesmo estabelecimento aparece com nomes ligeiramente diferentes em fontes distintas?
- **Resposta Executiva Direta:** O pipeline de ingestão normaliza nomes comerciais removendo acentos, pontuação e sufixos genéricos (`normalizeStr`) e cruza com o bairro e coordenadas geográficas (`latitude`/`longitude`). Cada restaurante recebe um `slug` canônico único e um `UUID` determinístico, evitando duplicatas no catálogo dos 61 estabelecimentos.
- **Lastro Técnico no Código:** `src/data/realDataStore.ts` (`normalizeStr` e `getRestaurantBySlug`).

### Q15: Como a busca textual lida com erros de digitação, acentuação ("camarao" vs "camarão") e case-sensitivity sem degradar performance?
- **Resposta Executiva Direta:** Utilizamos decomposição Unicode NFD (`text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()`) tanto na query digitada pelo usuário quanto nos campos indexados de nome do restaurante, bairro, endereço, categoria e descrição dos pratos. Assim, buscar `"camarao"`, `"Camarão"` ou `"CAMARAO"` retorna exatamente os mesmos pratos em menos de 5 milissegundos.
- **Lastro Técnico no Código:** `src/data/realDataStore.ts` (função `normalizeStr`).

### Q16: Como é garantida a integridade dos preços históricos (`previous_price` vs `price`) para evitar falsas promoções ("maquiagem de preço")?
- **Resposta Executiva Direta:** O sistema só exibe o selo `"Baixou R$ X,XX"` quando `previous_price > price` e a variação percentual (`last_price_delta_pct < 0`) foi registrada no histórico auditado (`price_history`) com carimbo de data (`detected_at`). Além disso, o painel `/moderation` possui a aba **"Quedas de Preço"** com gráfico sparkline para auditoria humana antes de destacar a oferta.
- **Lastro Técnico no Código:** `src/app/moderation/page.tsx` (`NativePriceChart`) e `src/data/realDataStore.ts`.

### Q17: Quais índices de banco de dados são necessários quando a base crescer de 2.670 para 200.000 pratos?
- **Resposta Executiva Direta:** No PostgreSQL (`backend/sql/init.sql`), utilizamos: (1) **B-Tree** em `restaurant_id`, `neighborhood` e `bayesian_rating DESC` para joins e ordenação rápida; (2) **GIN com `pg_trgm` (Trigram)** em `name` e `description` para busca textual tolerante a erros; e (3) **GiST (PostGIS)** sobre `GEOGRAPHY(POINT, 4326)` para consultas espaciais por raio (`ST_DWithin`).
- **Lastro Técnico no Código:** `backend/sql/init.sql`.

### Q18: Como funciona a estratégia de backup, versionamento do dump auditado e recuperação contra corrupção de dados?
- **Resposta Executiva Direta:** O dump real auditado (`src/data/caraguaRealDump.json`) é versionado diretamente no Git com histórico imutável de commits e tags (`v0.1.0` a `v2.4.0`), garantindo rastreabilidade completa e rollback instantâneo em menos de 30 segundos caso qualquer coleta automatizada introduza dados inconsistentes.
- **Lastro Técnico no Código:** `src/data/caraguaRealDump.json` e `CHANGELOG.md`.

### Q19: Por que armazenar coordenadas geográficas (`latitude`, `longitude`) e como calcular distância sem depender de APIs pagas a cada renderização?
- **Resposta Executiva Direta:** Armazenamos as coordenadas reais de cada estabelecimento e calculamos a distância ortodrômica diretamente pela **Fórmula de Haversine** (`calculateDistanceKm` em `src/data/realDataStore.ts`). Isso tem custo zero (não consome cotas pagas da Google Distance Matrix API a cada listagem) e executa instantaneamente no servidor ou cliente.
- **Lastro Técnico no Código:** `src/data/realDataStore.ts` (`calculateDistanceKm`).

### Q20: Como o sistema trata transações e consistência eventual entre o estado local (`localStorage`) e a API Serverless?
- **Resposta Executiva Direta:** Aplicamos atualização otimista com confirmação de protocolo: ao enviar uma avaliação na Cédula ou uma solicitação em `/contato`, o cliente aguarda o protocolo oficial gerado pela API (`CF-2026-XXXXXX` ou `CG-FT-XXXXXX`) e, caso haja oscilação momentânea de rede, gera um protocolo local de contingência mantendo a experiência fluida sem perda do texto digitado.
- **Lastro Técnico no Código:** `src/app/prato/[id]/PratoDetailClient.tsx` e `src/lib/resilienceEngine.ts`.

---

## BLOCO 3 — Segurança da Informação, Autenticação & AppSec / OWASP Top 10 (Q21–Q30)

### Q21: Como as senhas dos usuários são armazenadas e trafegadas? Existe risco de exposição em texto puro no navegador ou rede?
- **Resposta Executiva Direta:** Todo o tráfego ocorre exclusivamente sob **HTTPS/TLS 1.3 com HSTS**. No servidor, as senhas jamais são salvas em texto puro: utilizamos derivação criptográfica **PBKDF2-HMAC-SHA256 com 10.000 iterações e salt dedicado** (`hashPasswordSecure` em `src/lib/security.ts`). No navegador (`localStorage`), o `AuthContext` salva apenas os metadados públicos da sessão (`UserSession`), nunca armazenando senha ou hash.
- **Lastro Técnico no Código:** `src/lib/security.ts`, `src/lib/serverIdentityStore.ts` e `src/context/AuthContext.tsx`.

### Q22: Como o sistema se protege contra ataques de Cross-Site Scripting (XSS) nos campos de comentário da Cédula e formulário de Contato?
- **Resposta Executiva Direta:** Além do escape automático do JSX no React 18, todas as entradas de texto livre passam pela função `sanitizeUserInput()` (`src/lib/security.ts`) antes de serem gravadas ou devolvidas pelas rotas `/api/auth/*`, `/api/restaurants/leads`, `/api/restaurants/reviews` e `/api/copyright/claim`, removendo tags `<script>`, `<iframe>`, atributos `onerror=`/`onload=` e URIs `javascript:`.
- **Lastro Técnico no Código:** `src/lib/security.ts` (`sanitizeUserInput`).

### Q23: Como o sistema previne SQL Injection e NoSQL/JSON Injection nas rotas de busca e persistência?
- **Resposta Executiva Direta:** Nas rotas Serverless TypeScript, validamos estritamente os tipos primitivos (`String()`, `Number()`, enums fechados para `claimType` e `role`) e sanitizamos strings antes de qualquer busca. Na camada SQL (`backend/sql/`), utilizamos exclusivamente queries parametrizadas (Prepared Statements), impedindo que entradas do usuário sejam interpretadas como comandos SQL.
- **Lastro Técnico no Código:** `src/app/api/auth/register/route.ts`, `src/app/api/copyright/claim/route.ts` e `backend/sql/init.sql`.

### Q24: Quais mecanismos impedem ataques de força bruta (Brute Force) na tela de Login e na validação do código OTP de recuperação de senha?
- **Resposta Executiva Direta:** Implementamos um **Rate Limiter de janela deslizante** (`checkRateLimit` em `src/lib/security.ts`) aplicado tanto em `/api/auth/login` quanto em `/api/auth/recover`. Após 5 tentativas malsucedidas dentro de 60 segundos para o mesmo identificador, a API bloqueia novas tentativas com status **HTTP 429 (Too Many Requests)** e informa o tempo exato de espera (`retryAfterSec`).
- **Lastro Técnico no Código:** `src/lib/security.ts` (`checkRateLimit`), `src/app/api/auth/login/route.ts` e `src/app/api/auth/recover/route.ts`.

### Q25: Como os cabeçalhos HTTP de segurança (HSTS, CSP, X-Frame-Options, X-Content-Type-Options) protegem o usuário contra Clickjacking e Man-in-the-Middle?
- **Resposta Executiva Direta:** Configuramos em `next.config.js` e `vercel.json`: (1) `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload` contra downgrade HTTP e Man-in-the-Middle; (2) `Content-Security-Policy: upgrade-insecure-requests` contra Mixed Content; (3) `X-Frame-Options: SAMEORIGIN` contra Clickjacking em iframes maliciosos; e (4) `X-Content-Type-Options: nosniff` contra MIME-sniffing.
- **Lastro Técnico no Código:** `next.config.js` e `vercel.json`.

### Q26: Como funciona o controle de acesso baseado em papéis (RBAC: Comensal vs. Gestor vs. Curador)?
- **Resposta Executiva Direta:** Cada sessão possui o atributo tipado `role: 'comensal' | 'gestor' | 'curador'`. O `comensal` acessa o catálogo, salva roteiros e vota na Cédula; o `gestor` acessa o fluxo de credenciamento e reivindicação de perfil; e o `curador` gerencia a fila de aprovação de pratos, quedas de preço e protocolos de direitos autorais em `/moderation`.
- **Lastro Técnico no Código:** `src/types/auth.ts`, `src/app/login/page.tsx` e `src/app/moderation/page.tsx`.

### Q27: Como o fluxo de recuperação de senha via E-mail e WhatsApp evita enumeração de usuários (User Enumeration) e sequestro de conta?
- **Resposta Executiva Direta:** Ao solicitar um código OTP em `/api/auth/recover`, a mensagem pública retornada pela API é sempre neutra (*"Se o e-mail/número estiver vinculado a uma conta, enviamos o código de 6 dígitos"*), impedindo que um atacante descubra quais e-mails estão cadastrados. Além disso, o token OTP possui 6 dígitos aleatórios, expira em 10 minutos, é invalidado após o primeiro uso (`used = true`) e é protegido por rate-limit de 5 tentativas.
- **Lastro Técnico no Código:** `src/app/api/auth/recover/route.ts` e `src/lib/serverIdentityStore.ts`.

### Q28: No login social (Google e Apple), como o sistema valida a identidade e vincula a conta caso o usuário já tenha cadastro com o mesmo e-mail?
- **Resposta Executiva Direta:** Na rota `POST /api/auth/oauth`, o sistema consulta `findByEmailOrWhatsapp(email)`. Se o usuário já possuir uma conta criada anteriormente com aquele e-mail, o sistema vincula o provedor OAuth (`google` ou `apple`) à conta existente preservando integralmente seus pontos do Passaporte Gourmet e seus pratos salvos, sem criar conta duplicada.
- **Lastro Técnico no Código:** `src/app/api/auth/oauth/route.ts`.

### Q29: Por que chamadas HTTP locais (`localhost:8000`) falhavam nas redes corporativas/universitárias e como a arquitetura HTTPS resolveu o bloqueio?
- **Resposta Executiva Direta:** Navegadores modernos (Chrome/Edge) em redes gerenciadas como a da Universidade Cruzeiro do Sul bloqueiam requisições de origens públicas `https://` para endereços privados `http://localhost:8000` ou `http://192.168.x.x` devido às políticas de *Mixed Content* e *Private Network Access (PNA)*, exibindo alerta de "Não Seguro". Resolvemos eliminando 100% das chamadas HTTP locais no cliente e roteando tudo para endpoints Serverless internos HTTPS (`/api/*`) sob HSTS e CSP.
- **Lastro Técnico no Código:** `next.config.js`, `vercel.json` e `src/app/moderation/page.tsx`.

### Q30: Quais dados sensíveis nunca são logados em console ou expostos nas respostas JSON das APIs?
- **Resposta Executiva Direta:** O campo `passwordHash` de `StoredUserRecord` fica isolado exclusivamente no `serverIdentityStore` no servidor e jamais é incluído no payload `UserSession` retornado pelas rotas `/api/auth/login`, `/api/auth/register`, `/api/auth/oauth` ou `/api/user/privacy`.
- **Lastro Técnico no Código:** `src/lib/serverIdentityStore.ts` e `src/app/api/auth/login/route.ts`.

---

## BLOCO 4 — LGPD, Privacidade, Inclusão (Pronome Social) & Direito Digital/Autoral (Q31–Q40)

### Q31: Qual é a base legal da LGPD (Lei nº 13.709/2018) utilizada para tratar os dados dos consumidores e dos comerciantes?
- **Resposta Executiva Direta:** Para consumidores cadastrados, utilizamos o **Consentimento explícito (Art. 7º, I)** e a **Execução de Contrato/Termos de Uso do Passaporte Gourmet (Art. 7º, V)**. Para cookies analíticos e geolocalização, aplicamos consentimento granular opt-in via `LgpdConsentBanner.tsx`. Para dados comerciais públicos de estabelecimentos (PJ), aplica-se o **Legítimo Interesse (Art. 7º, IX)** para fomento econômico e informação ao consumidor, com canal imediato de oposição/atualização.
- **Lastro Técnico no Código:** `src/components/LgpdConsentBanner.tsx` e `src/app/api/user/privacy/route.ts`.

### Q32: Como o sistema operacionaliza na prática o Direito de Acesso e Portabilidade (Art. 18, II e V da LGPD)?
- **Resposta Executiva Direta:** No modal de perfil do usuário logado (`UserProfileModal.tsx`), o botão **"Baixar Meus Dados (JSON)"** aciona `POST /api/user/privacy` (`action: 'export_data'`), que gera e faz o download imediato de um arquivo `.json` estruturado contendo todos os dados cadastrais, Nome Social, Pronome Social, histórico de consentimento LGPD, pontos e pratos salvos.
- **Lastro Técnico no Código:** `src/components/UserProfileModal.tsx`, `src/context/AuthContext.tsx` e `src/app/api/user/privacy/route.ts`.

### Q33: Como o sistema executa o Direito ao Esquecimento / Eliminação (Art. 18, VI) sem destruir a integridade estatística das notas dos restaurantes?
- **Resposta Executiva Direta:** Ao acionar **"Anonimizar / Excluir Conta"** no perfil (`UserProfileModal.tsx`), a rota `POST /api/user/privacy` (`action: 'anonymize_account'`) expurga irreversivelmente os dados pessoais identificáveis (Nome Civil, Nome Social, E-mail e WhatsApp) e emite o protocolo `LGPD-DEL-XXXXXX`, mantendo apenas as notas numéricas agregadas de forma anônima conforme autorizado pelo Art. 16 e Art. 18, VI da LGPD.
- **Lastro Técnico no Código:** `src/app/api/user/privacy/route.ts` e `src/lib/serverIdentityStore.ts`.

### Q34: Como o sistema aplica o princípio da Minimização de Dados e sanitização de PII caso um usuário digite dados pessoais num comentário público?
- **Resposta Executiva Direta:** A função `maskSensitivePII()` (`src/lib/security.ts`) intercepta qualquer comentário enviado na Cédula Oficial antes da gravação e substitui automaticamente padrões de CPF (`***.***.***-**`), telefone/WhatsApp (`(**) *****-****`) e e-mail (`u***@dominio.com`), impedindo vazamento acidental de dados pessoais em áreas públicas.
- **Lastro Técnico no Código:** `src/lib/security.ts` (`maskSensitivePII`) e `src/app/api/restaurants/reviews/route.ts`.

### Q35: Como a regra de Nome Social e Pronome Social foi implementada no modelo de dados e na interface para garantir respeito e conformidade com direitos de personalidade?
- **Resposta Executiva Direta:** O contrato `UserSession` (`src/types/auth.ts`) separa `nomeCivil`, `nomeSocial` e `pronomeSocial` (`Ela/Dela`, `Ele/Dele`, `Elu/Delu`, `Não informado` ou personalizado). As funções `getDisplayName()` e `formatUserDisplayWithPronoun()` (`src/lib/security.ts`) garantem que, sempre que o `nomeSocial` estiver preenchido, ele prevaleça sobre o nome civil na `Navbar`, no modal de perfil e na assinatura pública das avaliações da Cédula Oficial.
- **Lastro Técnico no Código:** `src/types/auth.ts`, `src/lib/security.ts`, `src/app/login/page.tsx` e `src/components/UserProfileModal.tsx`.

### Q36: O scraping ou catalogação de restaurantes e preços sem autorização prévia viola a lei? Qual a diferença jurídica entre dados factuais públicos e obras protegidas (Lei nº 9.610/98)?
- **Resposta Executiva Direta:** Não viola. No Direito Brasileiro (Lei de Direitos Autorais nº 9.610/98, Art. 8º, I), **dados factuais públicos** — como o nome comercial de um restaurante, seu endereço, bairro, telefone comercial e os preços praticados ao público — não constituem obra intelectual protegida e são informações de utilidade pública (Código de Defesa do Consumidor, Art. 6º, III). Já as **fotografias e descrições criativas** gozam de proteção autoral, razão pela qual o CaráFood atribui a fonte, oferece credenciamento gratuito (0% taxa) para o restaurante subir suas fotos oficiais e mantém canal imediato de *Notice and Takedown*.
- **Lastro Técnico no Código:** `src/components/CopyrightClaimModal.tsx` e `src/app/api/copyright/claim/route.ts`.

### Q37: Se um restaurante exigir a remoção de uma foto do prato alegando direito autoral do fotógrafo, qual o fluxo técnico de Notice and Takedown no sistema?
- **Resposta Executiva Direta:** Na página de qualquer prato (`/prato/[id]`), há o botão **"É dono deste estabelecimento? Reivindicar perfil ou reportar foto (Direitos Autorais)"**. Ele abre o `CopyrightClaimModal.tsx`, onde o titular seleciona **"Remoção (Takedown)"**, registra o pedido via `POST /api/copyright/claim`, recebe na hora o protocolo `CG-DA-XXXXXX` e o item entra na aba **"Direitos Autorais"** do painel `/moderation`, onde o curador executa o Takedown em 1 clique.
- **Lastro Técnico no Código:** `src/components/CopyrightClaimModal.tsx`, `src/app/api/copyright/claim/route.ts` e `src/app/moderation/page.tsx`.

### Q38: Como o comerciante prova que é o verdadeiro dono de um estabelecimento ao reivindicar um perfil (`claim_ownership`) para evitar fraudes de concorrentes?
- **Resposta Executiva Direta:** No formulário de reivindicação (`CopyrightClaimModal.tsx` e `/contato`), exigimos o vínculo formal (Proprietário/Sócio, Gerente ou Representante), e-mail corporativo/comercial, WhatsApp oficial do estabelecimento e detalhamento (CNPJ/comprovação). A solicitação fica com status `"Em Análise Prioritária"` na aba `"Direitos Autorais"` de `/moderation` e só é homologada após verificação cruzada pelo curador com o telefone/endereço oficial do restaurante no Google Maps.
- **Lastro Técnico no Código:** `src/components/CopyrightClaimModal.tsx` e `src/app/moderation/page.tsx`.

### Q39: Como o banner de consentimento de cookies diferencia cookies estritamente necessários de cookies analíticos/geolocalização?
- **Resposta Executiva Direta:** O componente `LgpdConsentBanner.tsx` oferece três opções claras na primeira visita: **"Aceitar e Continuar"**, **"Apenas Essenciais"** ou o botão de personalização granular, onde os cookies essenciais (sessão e segurança) ficam marcados como obrigatórios e os módulos de **Geolocalização por Bairro** e **Estatísticas Anônimas** possuem chaves independentes (`checkbox`), gravando timestamp e versão da política (`2026.2-LGPD`).
- **Lastro Técnico no Código:** `src/components/LgpdConsentBanner.tsx`.

### Q40: Quem é o Controlador e quem é o Operador dos dados pessoais na arquitetura do CaráFood?
- **Resposta Executiva Direta:** Nos termos do Art. 5º, VI e VII da LGPD, o projeto **CaráFood** atua como **Controlador** (define a finalidade e as decisões sobre o tratamento dos dados da plataforma), enquanto o provedor de infraestrutura em nuvem (**Vercel Inc.** / provedor de banco gerenciado) atua como **Operador** (processa e hospeda os dados sob as instruções técnicas e cabeçalhos de segurança configurados pelo Controlador).
- **Lastro Técnico no Código:** `src/app/api/user/privacy/route.ts` e `src/app/sobre/page.tsx`.

---

## BLOCO 5 — Regras de Negócio, Algoritmos, IA & Resiliência ("Força Vital" / SPOF) (Q41–Q50)

### Q41: Explique matematicamente a Nota Ponderada Bayesiana ($W_R$) e por que ela resolve o problema de um restaurante com 1 voto nota 5.0 vencer um restaurante consolidado com 500 votos nota 4.8.
- **Resposta Executiva Direta:** Utilizamos a equação de shrinkage Bayesiano: $W_R = \frac{v}{v + m} R + \frac{m}{v + m} C$, onde $R$ é a média do restaurante, $v$ é o número de avaliações, $m = 30$ é o limiar mínimo de confiança e $C \approx 4,55$ é a média global de Caraguatatuba. Se um restaurante novo tem apenas $v = 1$ voto com nota $R = 5,0$, sua nota ponderada puxa para a média global ($W_R \approx 4,56$), enquanto uma casa consolidada com $v = 500$ votos e média $R = 4,8$ mantém $W_R \approx 4,79$, garantindo mérito estatístico real.
- **Lastro Técnico no Código:** `src/data/realDataStore.ts` e `src/app/rankings/page.tsx`.

### Q42: Como funciona o algoritmo Round-Robin Cap (máx. 2 pratos seguidos por restaurante) e qual o impacto dele na justiça econômica da plataforma?
- **Resposta Executiva Direta:** Na montagem do feed principal de pratos (`src/app/page.tsx`), mesmo que uma única hamburgueria tenha 80 itens com nota alta, o algoritmo de intercalação limita a exibição a no máximo 2 pratos consecutivos da mesma casa na primeira dobra, distribuindo os demais em rodadas (*Round-Robin*). Isso impede o monopólio visual da vitrine e garante que pequenos restaurantes de diferentes bairros sejam descobertos.
- **Lastro Técnico no Código:** `src/app/page.tsx` e `src/data/realDataStore.ts`.

### Q43: Por que os pesos da Cédula Oficial foram definidos em 35% Sabor, 20% Apresentação, 15% Insumos Locais, 15% Atendimento e 15% Ambiente?
- **Resposta Executiva Direta:** Os pesos refletem a matriz oficial de avaliação gastronômica adaptada do festival municipal *Caraguá a Gosto*: a qualidade culinária do prato em si (**Sabor & Técnica 35% + Apresentação 20% + Frescor/Insumos Locais 15% = 70% da nota**) predomina sobre fatores externos (**Atendimento 15% + Ambiente/Higiene 15% = 30%**), evitando que um pequeno quiosque simples de praia com comida excelente seja injustamente punido por não ter decoração de restaurante de luxo.
- **Lastro Técnico no Código:** `src/app/prato/[id]/PratoDetailClient.tsx`.

### Q44: Qual é a "Força Vital" do CaráFood? Se o WhatsApp cair hoje, o aplicativo morre ou continua entregando valor completo?
- **Resposta Executiva Direta:** Continua entregando **100% do seu valor principal**. O WhatsApp é apenas um botão opcional de contato externo. A **Força Vital** do CaráFood é o seu catálogo próprio auditado (61 restaurantes, 2.670 pratos com preços reais conferidos, fotos reais, filtros pelos 53 bairros, Cédula de 5 critérios e rotas GPS multi-provedor). Mesmo sem WhatsApp, o usuário descobre onde comer, quanto custa, vê o telefone fixo/celular (`tel:`) e traça a rota até o local.
- **Lastro Técnico no Código:** `src/lib/resilienceEngine.ts`, `src/app/prato/[id]/PratoDetailClient.tsx` e `src/app/sobre/page.tsx`.

### Q45: Se o Google Maps ou a Vercel enfrentarem instabilidade durante a demonstração ou em operação real, quais mecanismos de fallback garantem continuidade?
- **Resposta Executiva Direta:** Em `src/lib/resilienceEngine.ts`, implementamos redundância em todas as pontas: (1) para navegação GPS, além do Google Maps, disponibilizamos rota via **Waze** (`waze.com/ul`) e **OpenStreetMap**, além do endereço físico completo por bairro; (2) para dados e API, `fetchWithResilienceFallback()` faz fallback imediato para o store embarcado (`realDataStore.ts`) e para o estado local (`localStorage`), além de permitir execução local instantânea (`npm run start`).
- **Lastro Técnico no Código:** `src/lib/resilienceEngine.ts` e `src/data/realDataStore.ts`.

### Q46: Como o assistente Chef CaráFood evita "alucinações" (inventar restaurantes ou preços que não existem em Caraguatatuba)?
- **Resposta Executiva Direta:** O assistente (`generateAIChatReply` em `src/data/realDataStore.ts` e `CaraguaAIChatDrawer.tsx`) opera com **Grounding Determinístico Estrito (RAG sobre catálogo fechado)**: ele jamais gera nomes de restaurantes ou preços livremente; ele primeiro filtra os registros reais de `caraguaRealDump.json` por bairro, categoria, faixa de preço e dieta, e monta a resposta citando exclusivamente pratos, preços e distâncias reais existentes na base auditada.
- **Lastro Técnico no Código:** `src/data/realDataStore.ts` (`generateAIChatReply`) e `src/components/CaraguaAIChatDrawer.tsx`.

### Q47: Como o sistema garante segurança alimentar nos filtros dietéticos (Vegano, Sem Glúten, Sem Lactose) para não colocar em risco pessoas com alergias/celíacos?
- **Resposta Executiva Direta:** Os filtros dietéticos (`is_vegan`, `is_vegetarian`, `is_gluten_free`, `is_lactose_free`) operam com lógica booleana restritiva (interseção `AND` quando múltiplos filtros são marcados) e cada ficha de prato (`/prato/[id]`) traz o botão **"Conferir no Cardápio Original"** e contato direto com a cozinha do estabelecimento para confirmação de contaminação cruzada antes do consumo.
- **Lastro Técnico no Código:** `src/data/realDataStore.ts` e `src/app/prato/[id]/PratoDetailClient.tsx`.

### Q48: Como o sistema previne avaliações falsas ou ataques coordenados (review bombing) de concorrentes na Cédula Oficial?
- **Resposta Executiva Direta:** Combinamos três defesas: (1) o amortecimento da **Nota Ponderada Bayesiana ($W_R$, $m=30$)** impede que 2 ou 3 votos maliciosos derrubem a média de um restaurante; (2) o campo de **Código da Comanda/Mesa** (`tableVoucher`) e a vinculação à sessão autenticada identificam votos auditados; e (3) a higienização e moderação pela equipe de curadoria em `/moderation`.
- **Lastro Técnico no Código:** `src/app/prato/[id]/PratoDetailClient.tsx` e `src/data/realDataStore.ts`.

### Q49: Por que o sistema não processa pagamentos online (Pix/Cartão) nesta versão? Isso é uma falha ou uma decisão estratégica de escopo e risco regulatório?
- **Resposta Executiva Direta:** É uma **decisão estratégica de produto e conformidade regulatória**. Processar split de pagamento financeiro dentro do app exigiria homologação como subadquirente no Banco Central, compliance PCI-DSS e cobrança de taxas financeiras dos restaurantes — o que destruiria nossa proposta central de **0% de comissão para o pequeno comerciante**. Como plataforma de descoberta e auditoria hiperlocal, levamos o cliente direto ao balcão/cardápio do restaurante sem intermediar o dinheiro dele.
- **Lastro Técnico no Código:** `src/app/sobre/page.tsx` e `src/lib/resilienceEngine.ts`.

### Q50: Como o sistema diferencia usuário deslogado de usuário logado nas regras de negócio e incentivos (Passaporte Gourmet)?
- **Resposta Executiva Direta:** O usuário **deslogado (Visitante)** tem acesso livre à descoberta pública (61 restaurantes, 2.670 pratos, filtros dos 53 bairros e rotas GPS), mas vê o botão `"Entrar / Criar Conta"` na `Navbar` e um aviso de Modo Visitante na Cédula. Já o usuário **logado** tem sua identidade exibida na `Navbar` com **Nome Social + Pronome Social**, acumula **`+50 pontos` reais no Passaporte Gourmet** a cada avaliação enviada na Cédula, gerencia seus pratos salvos e acessa a Central de Portabilidade/Exclusão LGPD no `UserProfileModal`.
- **Lastro Técnico no Código:** `src/components/Navbar.tsx`, `src/components/UserProfileModal.tsx`, `src/context/AuthContext.tsx` e `src/app/prato/[id]/PratoDetailClient.tsx`.

---

## BLOCO 6 — UX/UI, Acessibilidade, Testes, DevOps & Sustentabilidade SaaS (Q51–Q60)

### Q51: Como vocês resolveram o problema de exibir 53 bairros oficiais em uma tela de celular de 360px sem causar sobrecarga cognitiva?
- **Resposta Executiva Direta:** Aplicamos o princípio de **Divulgação Progressiva (Progressive Disclosure)**: na barra principal da Home exibimos apenas os **10 polos gastronômicos mais movimentados** + as **4 macro-regiões** (`Norte`, `Centro`, `Sul`, `Sertão`), enquanto o botão `"53 Bairros"` abre uma gaveta modal dedicada com busca instantânea e mapa vetorial interativo dos 53 bairros.
- **Lastro Técnico no Código:** `src/app/page.tsx` e `src/data/caraguaData.ts`.

### Q52: Como o componente `SmartFoodImage.tsx` resolveu tecnicamente a distorção e o desfoque de fotos quadradas (1:1) em cards retangulares?
- **Resposta Executiva Direta:** O componente `SmartFoodImage.tsx` inspeciona as dimensões reais da foto (`knownWidth`, `knownHeight` e `naturalWidth` no `onLoad`). Quando detecta uma miniatura compacta (`< 360px`) ou proporção quadrada que ficaria esticada e borrada num container 16:9, ele renderiza uma camada de fundo com a própria foto ampliada e desfocada (`scale-125 blur-2xl opacity-55`) e posiciona a foto original nítida no centro em escala nativa 1:1.
- **Lastro Técnico no Código:** `src/components/SmartFoodImage.tsx`.

### Q53: Quais critérios de acessibilidade (WCAG: contraste de cores, tamanho de área de toque mobile, atributos semânticos) foram aplicados?
- **Resposta Executiva Direta:** Substituímos o tema escuro inicial por uma paleta clara de alto contraste (`#FAF7F2` com texto `#1C1917` e verde institucional `#0F382C` / `#135136`, superando a razão WCAG AA de 4.5:1), dimensionamos botões e áreas de toque mobile com altura mínima confortável (`py-2.5` a `py-3.5`), e aplicamos atributos semânticos `aria-label`, `aria-expanded`, `role="dialog"`, `role="tablist"` e `role="alert"` em todos os modais, abas e formulários.
- **Lastro Técnico no Código:** `src/components/Navbar.tsx`, `src/app/login/page.tsx`, `src/components/UserProfileModal.tsx` e `src/components/LgpdConsentBanner.tsx`.

### Q54: Quais metodologias foram usadas nos testes de usabilidade (Heurísticas de Nielsen, Matriz MoSCoW) e quais mudanças reais surgiram desses testes?
- **Resposta Executiva Direta:** Executamos 3 cenários cronometrados com usuários externos avaliando as 10 Heurísticas de Nielsen e priorizamos os achados pela **Matriz MoSCoW (Must, Should, Could, Won't)**. Desses testes nasceram 4 melhorias reais em produção: (1) pílulas rápidas por tipo de comida na Home; (2) botão de login em 1 toque dentro do card selecionado no celular; (3) visualização em cards mobile (`md:hidden`) no painel `/moderation`; e (4) o componente `SmartFoodImage.tsx`.
- **Lastro Técnico no Código:** `src/app/page.tsx`, `src/app/login/page.tsx`, `src/app/moderation/page.tsx` e `ENTREGAS_CRISTIANO/APSII_S12_CARAFOOD.docx`.

### Q55: Como funciona a cobertura de testes automatizados (Typecheck, Build Next.js, suíte E2E Playwright Desktop/Mobile)?
- **Resposta Executiva Direta:** O pipeline de validação executa três estágios obrigatórios: (1) checagem estática de tipos TypeScript (`npx tsc --noEmit`); (2) compilação completa de produção (`npm run build` gerando todas as rotas estáticas, dinâmicas e de API); e (3) a suíte automatizada E2E em Playwright (`scripts/test_banca_full_audit.py`), que testa cadastro com Nome Social/Pronome, Login Google/Apple, Recuperação OTP via E-mail e WhatsApp, proteção Brute-Force/XSS, Portabilidade LGPD, Takedown de Direitos Autorais e Resiliência em viewports Desktop e Mobile.
- **Lastro Técnico no Código:** `scripts/test_banca_full_audit.py` e `package.json`.

### Q56: Como está estruturado o pipeline de CI/CD entre GitHub e Vercel e como funciona o rollback caso um deploy quebre produção?
- **Resposta Executiva Direta:** Cada `git push origin main` para o GitHub aciona automaticamente o webhook do `vercel[bot]`, que executa `npm install` e `npm run build` em container isolado. Se a compilação ou checagem de tipos falhar, a Vercel aborta a promoção e mantém o último deploy estável no ar; além disso, qualquer versão anterior pode sofrer *Instant Rollback* em 1 clique no painel da Vercel ou via `git revert`.
- **Lastro Técnico no Código:** `package.json`, `vercel.json` e `scripts/copy-build.js`.

### Q57: Como esse SaaS se sustenta financeiramente ao longo do tempo se cobra 0% de comissão dos restaurantes?
- **Resposta Executiva Direta:** O CaráFood monetiza por meio de **4 pilares sustentáveis** documentados em `src/lib/resilienceEngine.ts` e na página `/sobre`: (1) **Plano Base Gratuito Perpétuo (0% comissão)** para garantir 100% dos bairros mapeados; (2) **Assinatura SaaS B2B Pro Analytics (R$ 49,90/mês)** para restaurantes que desejam inteligência de buscas e atualização self-service de promoções; (3) **Patrocínio Institucional e Turismo Sazonal** (festivais *Caraguá a Gosto*, *Festa da Tainha*, hotelaria); e (4) **Vitrine Patrocinada Hiperlocal Ética**, que destaca novidades no bairro sem jamais alterar a Nota Ponderada Bayesiana ($W_R$).
- **Lastro Técnico no Código:** `src/lib/resilienceEngine.ts` (`SAAS_REVENUE_PILLARS`) e `src/app/sobre/page.tsx`.

### Q58: Qual o custo estimado de infraestrutura em nuvem se o CaráFood escalar para 50.000 usuários ativos mensais no Litoral Norte?
- **Resposta Executiva Direta:** Graças à arquitetura baseada em cache de borda (CDN) e cálculo matemático leve sem chamadas caras a LLMs externos para navegação comum, até ~15.000 usuários mensais operam dentro da faixa gratuita (Vercel Hobby + Supabase Free). Ao escalar para **50.000 usuários ativos mensais**, o custo estimado é de apenas **US$ 45/mês (~R$ 260/mês)** (Vercel Pro US$ 20 + Supabase Pro US$ 25), o que se paga integralmente com apenas **6 restaurantes assinantes** do plano SaaS B2B de R$ 49,90/mês.
- **Lastro Técnico no Código:** `src/lib/resilienceEngine.ts` e `docs/DOSSIE_BANCA_PITCH_E_ARQUITETURA.md`.

### Q59: Por que um comerciante de bairro usaria o CaráFood em vez de ficar apenas no iFood ou Instagram?
- **Resposta Executiva Direta:** Porque no iFood o pequeno comerciante perde até **30% da receita bruta** e compete com centenas de lojas sem recorte territorial por bairro; já no Instagram, os posts desaparecem no algoritmo e não têm busca estruturada por preço ou prato. No CaráFood, um quiosque no Porto Novo, no Tinga ou na Cocanha aparece gratuitamente quando alguém filtra o seu bairro ou tipo de comida, com preço claro, rota GPS direta e **100% da margem ficando no bolso do comerciante**.
- **Lastro Técnico no Código:** `src/app/sobre/page.tsx` e `src/app/contato/page.tsx`.

### Q60: Quais são os próximos 3 passos técnicos prioritários pós-banca para transformar o projeto em uma startup operacional?
- **Resposta Executiva Direta:** (1) Conectar as rotas Serverless `/api/*` a uma instância PostgreSQL dedicada em nuvem (Supabase/Neon) usando o schema já pronto em `backend/sql/init.sql`; (2) Liberar o painel Self-Service do Comerciante com autenticação OAuth2 e verificação automatizada de CNPJ; e (3) Publicar o binário da Casca Nativa React Native (`mobile/`) na Google Play Store e Apple App Store para a temporada de verão de Caraguatatuba.
- **Lastro Técnico no Código:** `backend/sql/init.sql`, `mobile/src/components/NativeWebViewShell.tsx` e `src/app/api/*`.
