# 🌊 DOCUMENTO MESTRE DE ENGENHARIA, ARQUITETURA E OPERAÇÃO PONTA A PONTA
## Plataforma CaráFood (Caraguá FoodTech) — Monorepo Oficial (`caragua-foodtech-mono`)

> **Data de Emissão:** 25 de Novembro de 2026  
> **Versão do Documento:** 2.0 (Consolidado Ponta a Ponta — Produção & TCC)  
> **Status do Sistema:** Produção Ativa e Estabilizada em Nuvem  
> **Classificação:** Documentação Técnica, Funcional e Acadêmica Mestre  

---

## 🏛️ 1. Identificação Institucional, Equipe e Links Oficiais

### 1.1 Contexto Acadêmico
O **CaráFood** é o projeto prático, experimental e científico desenvolvido para a disciplina de **Análise e Projeto de Sistemas II (APS II)** e o **Trabalho de Conclusão de Curso (TCC)** da graduação em **Tecnologia em Análise e Desenvolvimento de Sistemas (ADS)**:

- **Instituição de Ensino:** Centro Universitário Módulo — Cruzeiro do Sul Educacional (Campus Caraguatatuba / SP)
- **Docente Orientador & Avaliador:** **Prof. Me. Cristiano S. Negrão**
- **Semestre:** 2026.1 / 2026.2
- **Área Temática:** Engenharia de Software Hiperlocal, Gastronomia Sustentável, Turismo Inteligente, Recuperação Aumentada por Geração (RAG) e Auditoria Algorítmica contra Fraudes.

### 1.2 Links Oficiais de Produção e Repositório
| Recurso | Identificador / URL | Descrição |
| :--- | :--- | :--- |
| **Produção Web Oficial** | [`https://foddtech.vercel.app/`](https://foddtech.vercel.app/) | Aplicação web responsiva (PWA) servida na Vercel Global Edge Network com HTTPS/TLS 1.3 nativo. |
| **Alias Canônico Vercel** | [`https://carafood.vercel.app/`](https://carafood.vercel.app/) | Domínio secundário otimizado para o aplicativo mobile híbrido. |
| **Repositório GitHub** | [`https://github.com/GaboBiroo/caragua-foodtech-mono.git`](https://github.com/GaboBiroo/caragua-foodtech-mono.git) | Monorepo completo contendo Front-End, Back-End, Mobile, Scripts e Docs. |
| **Branch Principal** | `main` | Branch única de release com deploy contínuo (CI/CD) automatizado na Vercel. |

### 1.3 Matriz de Responsabilidades Discentes (Scrum / RACI)
| Integrante | Papel Scrum | Atribuições Centrais de Engenharia no CaráFood |
| :--- | :--- | :--- |
| **Gabriel Rodrigues** | **Product Owner / Tech Lead / Full-Stack** | Arquitetura geral do monorepo; concepção do design system Coucou / Apple Liquid Glass; implementação em Next.js 14 App Router; pipeline RAG de 5 estágios com IA Local; prompt engineering da persona Chef Jacquin Praiano; desenvolvimento dos extratores Playwright e deploy contínuo na Vercel. |
| **Matheus Vicente** | **Engenheiro de Requisitos & Back-End** | Elicitação de requisitos funcionais e não-funcionais; catalogação geoespacial dos 53 bairros municipais de Caraguatatuba; modelagem conceitual e lógica do banco relacional/geoespacial (PostgreSQL + PostGIS + pgvector); schemas Pydantic V2 e regras de negócio da cédula do festival. |
| **Pedro Simone** | **QA, Usabilidade & Documentação Técnica** | Protocolo de testes de usabilidade com usuários reais (S12); conformidade estrita com as diretrizes de acessibilidade WCAG 2.2 AAA; validação dos 5 critérios da cédula oficial do festival; redação e consolidação dos relatórios acadêmicos semanais (S01 a S16). |

---

## 🎯 2. Visão do Produto & Proposta de Valor

### 2.1 O Problema Real de Caraguatatuba
Caraguatatuba é oficialmente reconhecida como a **Capital Gastronômica do Litoral Norte Paulista**. No entanto, o ecossistema local enfrentava severas dores estruturais:
1. **Invisibilidade Geográfica de Bairros Não-Centrais:** Os grandes agregadores comerciais (como iFood e TripAdvisor) concentram algoritmos e relevância estritamente na orla turística (Centro, Indaiá, Martim de Sá). Produtores e quiosques de bairros tradicionais da Zona Sul e Encostas (*Tinga*, *Perequê-Mirim*, *Morro do Algodão*, *Pegorelli*, *Rio do Ouro*, *Barranco Alto*) permaneciam invisíveis.
2. **Taxas Predatórias sobre Pequenos Restaurantes:** Plataformas convencionais cobram taxas abusivas (que chegam a 27% sobre cada pedido), inviabilizando quiosques familiares e pescadores artesanais.
3. **Desconexão com a Identidade e Maricultura Caiçara:** Falta de rastreabilidade de insumos seculares, como os mexilhões da Fazenda Marinha da Cocanha (**AMAPEC** — maior parque produtor de mexilhões do Brasil), o entreposto da **Colônia de Pescadores Z-8** no Camaroeiro e pratos históricos como o *Azul-Marinho na panela de ferro com banana verde*.
4. **Opacidade e Fraudes em Avaliações:** Presença massiva de avaliações sintéticas, compradas ou defasadas há anos, que distorcem a reputação dos comensais e prejudicam o tradicional **Festival Caraguá a Gosto**.

### 2.2 Os Cinco Pilares de Solução do CaráFood
1. **Hiperlocalismo Genuíno (Cobertura dos 53 Bairros Oficiais):** Todos os 53 bairros cadastrados pela Prefeitura de Caraguatatuba possuem presença digital garantida no explorador interativo e no feed.
2. **Rastreabilidade e Selos de Origem Sustentável:** Destaque para produtos certificados pela AMAPEC e Colônia Z-8, com indicação de maricultura limpa e pesca artesanal rastreada.
3. **Cédula Oficial Digital do Festival Caraguá a Gosto:** Avaliação transparente em **5 critérios oficiais** (*Sabor*, *Apresentação*, *Insumos Locais*, *Atendimento*, *Ambiente*), acompanhada de algoritmo de decaimento temporal para priorizar visitas recentes.
4. **Copiloto Gastronômico Inteligente — Chef Jacquin Praiano:** Assistente de IA contextual que atua como crítico gastronômico amigável, fornecendo recomendações hiperlocais e aplicando **vetos alimentares estritos** para alérgenos e celíacos.
5. **Transparência Científica & Política Zero Fake Data:** Coleta autônoma com Playwright a partir do OpenStreetMap e Google Maps. Erradicação de 100% de comentários fictícios de IA; quando um prato não possui voto popular, exibe-se um estado vazio elegante que convida o comensal a registrar a primeira cédula.

---

## 🏗️ 3. Arquitetura de Software Monorepo em Três Camadas

A arquitetura do CaráFood segue rigorosamente o padrão corporativo de **Três Camadas (Three-Tier Enterprise Architecture)**, desacoplada, resiliente e escalável:

```
┌────────────────────────────────────────────────────────────────────────┐
│             CAMADA 1: APRESENTAÇÃO & EXPERIÊNCIA DO USUÁRIO            │
│  ┌──────────────────────────────────┐  ┌────────────────────────────┐  │
│  │    Web PWA (Next.js 14 App Router)│  │ Mobile Shell (Expo/React)  │  │
│  │   - 17 Rotas Estáticas / SSR     │  │  - Hardware Accelerated WV │  │
│  │   - Design Tokens WCAG 2.2 AAA   │  │  - Android BackHandler SPA │  │
│  │   - Físicas 60fps Framer Motion  │  │  - Safe Area Header Guard  │  │
│  └──────────────────┬───────────────┘  └─────────────┬──────────────┘  │
└─────────────────────┼────────────────────────────────┼─────────────────┘
                      │ HTTPS / JSON / Serverless API  │
┌─────────────────────▼────────────────────────────────▼─────────────────┐
│               CAMADA 2: LÓGICA DE NEGÓCIO, IA & SERVIÇOS               │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                   FastAPI Core & Endpoints REST                  │  │
│  │   - /chat (Streaming SSE)    - /restaurants & /dishes (Catálogo) │  │
│  │   - /search (Filtros H3)     - /moderation (Auditoria & Leads)   │  │
│  └──────────────────┬───────────────────────────────────────────────┘  │
│  ┌──────────────────▼───────────────────────────────────────────────┐  │
│  │             Motor RAG de 5 Estágios & Inteligência               │  │
│  │   1. Normalização & Elicitação de Intenções (Pydantic V2)        │  │
│  │   2. Vetorização Semântica (Embeddings 1536d / Local)            │  │
│  │   3. Filtragem Espacial Hexagonal (Uber H3 Index)                │  │
│  │   4. Filtro Sanitário Estrito de Veto Alimentar (Food Safety)    │  │
│  │   5. Orquestração de Prompt & Persona Jacquin (Ollama qwen2.5)   │  │
│  └──────────────────┬───────────────────────────────────────────────┘  │
│  ┌──────────────────▼───────────────────────────────────────────────┐  │
│  │           Esteira Autônoma de Harvesting & Antifraude            │  │
│  │   - Scraper Playwright (Google Maps & OSM Live)                  │  │
│  │   - Higienização LGPD (Art. 18) e Remoção de Dados Sensíveis     │  │
│  │   - Algoritmo de Decaimento Temporal de Avaliações               │  │
│  └──────────────────┬───────────────────────────────────────────────┘  │
└─────────────────────┼──────────────────────────────────────────────────┘
                      │ SQLAlchemy 2.0 / asyncpg / PostGIS Drivers
┌─────────────────────▼──────────────────────────────────────────────────┐
│              CAMADA 3: PERSISTÊNCIA, ESPACIAL & VETORIAL               │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                     PostgreSQL 16 Enterprise                     │  │
│  │   - PostGIS 3.4 (Geometrias POINT / POLYGON dos 53 Bairros)      │  │
│  │   - pgvector (Índices HNSW / IVFFlat para Busca Semântica 1536d) │  │
│  │   - Tabelas Relacionais: Restaurants, Dishes, Reviews, Leads     │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 📱 4. Inventário Completo das Rotas e Telas da Aplicação

A aplicação web opera com **17 rotas estáticas e dinâmicas** totalmente funcionais e publicadas:

### 4.1 Rotas Visuais de Consumo e Gestão

| Rota Canônica | Tipo de Renderização | Finalidade e Comportamento Funcional |
| :--- | :--- | :--- |
| `/` | `Static (SSG)` | **Home & Feed Principal:** Feed de pratos estilo Instagram com rolagem infinita, stories horizontais dos 53 bairros com modais dedicados, Dynamic Island superior informando status em tempo real e mascote flutuante Chef Jacquin Praiano com balões contextuais. |
| `/prato/[id]` | `Dynamic (SSR/ISR)` | **Master-Detail de Prato:** Detalhamento completo do prato (fotografia real em alta definição, ingredientes caiçaras, tabela de alérgenos). Inclui a **Cédula Oficial Digital** com 5 critérios de votação auditada, botão de rota direta no **Google Maps / Waze** e acionador de pedido via **WhatsApp** com mensagem pré-formatada. |
| `/restaurants/[slug]` | `Dynamic (SSR/ISR)` | **Página do Restaurante:** Perfil comercial oficial com foto de capa, endereço completo no bairro, telefone clicável, horário de funcionamento extraído do OpenStreetMap, cardápio segmentado por categorias e lista de avaliações humanas reais extraídas do Google Maps. |
| `/rankings` | `Static (SSG)` | **Pódio Histórico & Decaimento Temporal:** Ranking transparente dos restaurantes e pratos campeões do Festival Caraguá a Gosto, ordenados por pontuação ponderada com penalização matemática para notas antigas (decaimento de 30 dias). |
| `/sobre` | `Static (SSG)` | **História Institucional & TCC:** Resgate etnográfico da cultura caiçara de Caraguatatuba, explicação da Maricultura da Cocanha (AMAPEC) e Colônia Z-8, justificativa científica e créditos acadêmicos da equipe discente e orientador. |
| `/contato` | `Static (SSG)` | **Credenciamento B2B:** Formulário para donos de restaurantes e quiosques solicitarem entrada no CaráFood, com validação de CNPJ, endereço no bairro e geração instantânea de **Protocolo Criptográfico Único** para acompanhamento. |
| `/login` | `Static (SSG)` | **Autenticação RBAC com Quick-Auth TCC:** Tela de login com controle de acesso baseado em papéis (*Consumidor*, *Restaurante Parceiro*, *Auditor Acadêmico*). Inclui botões de Quick-Auth para a banca e para o Prof. Cristiano testarem a plataforma com 1 clique sem digitar credenciais. |
| `/moderation` | `Static (SSG)` | **Painel de Auditoria & Moderação:** Interface administrativa restrita para homologação de novos restaurantes credenciados, moderação de ofertas sazonais e auditoria de votos suspeitos. |
| `/rag-test` | `Static (SSG)` | **Playground Técnico do RAG:** Laboratório de inspeção para a banca examinadora testar consultas em linguagem natural e verificar em tempo real os 5 estágios de recuperação, os vetos alimentares e a similaridade de cosseno. |

### 4.2 Endpoints de API Serverless (`src/app/api/`)

| Endpoint | Método HTTP | Finalidade Técnica |
| :--- | :---: | :--- |
| `/api/chat` | `POST / GET` | Streaming em tempo real (SSE) das respostas da IA contextual com a persona do Chef Jacquin Praiano, aplicando vetos para intolerâncias e celíacos. |
| `/api/restaurants` | `GET` | Retorna o catálogo paginado de estabelecimentos gastronômicos com suporte a filtro por nome, especialidade e identificador do bairro. |
| `/api/restaurants/[slug]` | `GET` | Retorna o payload completo de um restaurante específico (incluindo cardápio, fotos e avaliações do Google Maps). |
| `/api/restaurants/dishes/[dish_id]`| `GET` | Recupera metadados estritos de um prato específico, selos de maricultura e histórico de preços. |
| `/api/restaurants/leads` | `POST` | Processa o formulário B2B de credenciamento, gerando protocolo seguro com hash temporal. |
| `/api/restaurants/neighborhoods/summary` | `GET` | Retorna o sumário consolidado dos 53 bairros de Caraguá com densidade de restaurantes e pratos típicos. |
| `/api/restaurants/reviews` | `GET / POST` | Consulta ou registra novas avaliações auditadas da cédula do festival. |
| `/api/reviews` | `POST` | Endpoint de ingestão e sanitização de avaliações enviadas por comensais. |
| `/api/search` | `GET` | Busca multimodal por texto livre com ponderação por proximidade geográfica e filtro de ingredientes. |

---

## 🤖 5. Motor de IA e RAG de 5 Estágios (Chef Jacquin Praiano)

O CaráFood não utiliza IA generativa ingênua. Para garantir **segurança alimentar (Food Safety)**, precisão territorial e aderência à cultura local, opera uma esteira de 5 estágios rigorosos:

```
[ Usuário: "Onde comer camarão fresco perto de Martim de Sá sem glúten?" ]
                              │
                              ▼
┌────────────────────────────────────────────────────────────────────────┐
│ ESTÁGIO 1: PARSING DE INTENÇÃO & SANITIZAÇÃO (Pydantic V2)             │
│ - Detecta entidade gastronômica: "camarão"                             │
│ - Detecta entidade espacial: "Martim de Sá"                            │
│ - Detecta restrição dietética crítica: "sem glúten" (CELÍACO)          │
└─────────────────────────────┬──────────────────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────────────────┐
│ ESTÁGIO 2: VETORIZAÇÃO SEMÂNTICA (Embeddings 1536 Dimensões)           │
│ - Gera vetor denso de consulta via sentence-transformers/bge-large     │
└─────────────────────────────┬──────────────────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────────────────┐
│ ESTÁGIO 3: FILTRAGEM ESPACIAL HEXAGONAL (Uber H3 Index / PostGIS)      │
│ - Consulta hexágonos H3 de resolução 8 correspondentes ao bairro       │
│ - Restringe a busca vetorial aos restaurantes em raio de proximidade   │
└─────────────────────────────┬──────────────────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────────────────┐
│ ESTÁGIO 4: FILTRO SANITÁRIO E VETO ALIMENTAR ESTREITO (Zero Tolerância)│
│ - Varre a ficha técnica e ingredientes dos pratos recuperados          │
│ - SE contiver farinha de trigo, cevada ou aveia -> VETO SUMÁRIO!       │
│ - Garante que apenas opções seguras para celíacos cheguem à resposta   │
└─────────────────────────────┬──────────────────────────────────────────┘
                              │
                              ▼
┌────────────────────────────────────────────────────────────────────────┐
│ ESTÁGIO 5: SÍNTESE COM A PERSONA DO CHEF JACQUIN PRAIANO               │
│ - Injeta contexto seguro e factual no prompt da LLM (Ollama qwen2.5:3b)│
│ - Resposta autêntica com sotaque caiçara-francês, dicas de maricultura │
│   e rota precisa para o quiosque/restaurante seguro.                   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 📊 6. Esteira de Ingestão de Dados e Purgação de Dados Falsos

O projeto evoluiu de uma base estática inicial para uma esteira de extração viva e auditável:

1. **Snapshot OpenStreetMap (OSM):** O script `backend/scripts/ingest_real_osm_caragua.py` colheu coordenadas exatas, tags de acessibilidade, nós de ruas e horários oficiais de funcionamento de mais de 100 estabelecimentos reais cadastrados no município.
2. **Robô Autônomo Google Maps via Playwright (`scripts/run_full_gmaps_pipeline.py`):**
   - Extrai as notas de estrelas reais do Google (ex.: 4.4, 4.6, 4.7);
   - Extrai a contagem autêntica de avaliações públicas (ex.: 470, 1.452, 2.086);
   - Extrai resenhas humanas reais, com nome do autor, data da visita e comentário público legítimo;
   - Extrai telefones comerciais DDD 12 e endereços completos com CEP.
3. **Erradicação Total de Dados Falsos:** Todos os comentários sintéticos gerados por inteligência artificial foram purgados do catálogo (`src/data/caraguaRealDump.json`).
4. **Respeito aos Estados Vazios:** Se um prato específico do cardápio ainda não foi avaliado por um comensal, a interface não inventa avaliações: exibe um aviso limpo e encorajador com um botão de ação para o cliente ser o primeiro a preencher a cédula oficial.

---

## 🎓 7. Rastreabilidade Acadêmica APS II (S01 a S16 — Prof. Cristiano Negrão)

Todas as 16 entregas semanais obrigatórias do plano docente do **Prof. Me. Cristiano S. Negrão** estão documentadas e preservadas:

| Semana | Escopo Oficial da Entrega | Pasta de Arquivo no Projeto | Status de Conformidade |
| :---: | :--- | :--- | :---: |
| **S01** | Registro do tema, escopo inicial e composição da equipe | `entregas_aps2/S01_Registro_Inicial/` | **100% Homologado** |
| **S02** | Wireframes, mapa de navegação e matriz de User Stories | `entregas_aps2/S02_Prototipo_Historias_Mapa/` | **100% Homologado** |
| **S03** | Landing page principal com seletor dos 53 bairros | `entregas_aps2/S03_Home_Landing_Page/` | **100% Homologado** |
| **S04** | Página Sobre Nós com resgate histórico de Caraguá | `entregas_aps2/S04_Pagina_Sobre_Nos/` | **100% Homologado** |
| **S05** | Página de Contato B2B com protocolo único criptográfico | `entregas_aps2/S05_Pagina_Contato/` | **100% Homologado** |
| **S06** | Menu de navegação responsivo e Dynamic Island superior | `entregas_aps2/S06_Menu_Navegacao/` | **100% Homologado** |
| **S07** | Tela de autenticação com 3 perfis e Quick-Auth TCC | `entregas_aps2/S07_Tela_Login/` | **100% Homologado** |
| **S08** | Catálogo de pratos com filtros avançados de maricultura | `entregas_aps2/S08_Lista_Catalogo/` | **100% Homologado** |
| **S09** | Master-detail com cédula de votação em 5 critérios | `entregas_aps2/S09_Pagina_Detalhe/` | **100% Homologado** |
| **S10** | **Entrega Intermediária Consolidada (Base A2)** | `entregas_aps2/S10_A2_Entrega_Intermediaria/` | **100% Homologado** |
| **S11** | Auditoria de Git, fluxo de branches e governança | `entregas_aps2/S11_Melhoria_Versionamento/` | **100% Homologado** |
| **S12** | Bateria de testes de usabilidade com usuários reais | `entregas_aps2/S12_Testes_Usabilidade/` | **100% Homologado** |
| **S13** | Deploy em nuvem na Vercel e persistência de banco | `entregas_aps2/S13_Deploy_Banco/` | **100% Homologado** |
| **S14** | Domínio público amigável com certificado HTTPS/SSL | `entregas_aps2/S14_DNS_URL_Amigavel/` | **100% Homologado** |
| **S15** | Checklist de ensaio e validação para a banca | `entregas_aps2/S15_Checklist_Apresentacao/` | **100% Homologado** |
| **S16** | **Entrega Final Consolidada (Base A1 / TCC)** | `entregas_aps2/S16_A1_Entrega_Final/` | **100% Homologado** |

> **Nota Arquivística:** Os relatórios semanais gerados em formato Microsoft Word (`.docx`), totalizando mais de 50 MB de arquivos binários produzidos durante o semestre, foram reunidos e arquivados organizadamente em [`docs/antigos_docs/entregas_docx/`](docs/antigos_docs/entregas_docx/), liberando a raiz do repositório de poluição visual.

---

## 🗂️ 8. Organização Atualizada do Repositório (Padrão Limpo)

O monorepo agora apresenta uma estrutura limpa e profissional, sem arquivos soltos na raiz:

```text
caragua-foodtech-mono/
│
├── backend/                       # Back-End assíncrono em Python FastAPI, modelos e scrapers
│   ├── app/                       # Aplicação modular (api, core, db, schemas, services, workers)
│   ├── data/raw/                  # Snapshots de dados do OpenStreetMap e bairros
│   ├── scripts/                   # Utilitários de migração, ingestão e testes de convergência
│   └── requirements.txt           # Dependências com versões estritas
│
├── data/                          # Contratos de dados e documentação de sementes
│   └── seeds/README.md            # Especificação das sementes curadas
│
├── docker/                        # Contêineres de banco de dados
│   ├── Dockerfile.db              # PostgreSQL 16 + PostGIS + pgvector
│   └── init-db.sql                # Script de tabelas e índices vetoriais
│
├── docs/                          # Acervo documental e científico de ponta a ponta
│   ├── DOCUMENTO_MESTRE_PONTA_A_PONTA_CARAFOOD.md # 🌟 ESTE DOCUMENTO CONSOLIDADO
│   ├── ESCOPO_APSII_PROF_NEGRAO.md # Bíblia de requisitos da disciplina
│   ├── ROTEIRO_DEFESA_BANCA_E_OPERACAO.md # Roteiro de apresentação para a banca
│   ├── TCC_RELATORIO_ENGENHARIA_E_BENCHMARKS.md # Relatório técnico ABNT e SLAs
│   ├── MATRIZ_60_PERGUNTAS_BANCA_TCC.md # Preparação exaustiva para arguição da banca
│   ├── DOSSIE_BANCA_PITCH_E_ARQUITETURA.md # Pitch executivo para os avaliadores
│   │
│   ├── academic/                  # Dossiês acadêmicos e relatórios parciais
│   ├── architecture/              # Especificações do RAG e diretrizes de IA
│   ├── audits/                    # Auditorias de usabilidade e código
│   ├── research/                  # Pesquisas de patrimônio caiçara e 53 bairros
│   ├── screenshots_s10/           # Prints das primeiras 10 semanas
│   ├── screenshots_s11_s16/       # Prints em alta definição de todas as telas finais
│   │
│   └── antigos_docs/              # 📦 ARQUIVO DE DOCUMENTOS ANTIGOS & RELATÓRIOS
│       ├── entregas_docx/         # 8 Relatórios Word (.docx) arquivados com segurança
│       └── prints_testes/         # Evidências e capturas brutas de testes locais
│
├── entregas_aps2/                 # Suíte completa das 16 entregas semanais (S01 a S16)
│
├── legacy/                        # Protótipos standalone históricos
│
├── mobile/                        # Casca móvel híbrida React Native / Expo com WebView nativa
│   ├── src/                       # Componentes nativos, hooks e bridge
│   ├── assets/                    # Ícones e splash screen
│   └── package.json               # Dependências do app Expo
│
├── public/                        # Ativos públicos (logo, ilustrações do Jacquin, manifest PWA)
│
├── scripts/                       # Scripts de automação, robôs Playwright e geradores
│   ├── run_full_gmaps_pipeline.py # Scraper Playwright do Google Maps
│   ├── dump_real_data_for_frontend.py # Exportador do dataset para o front-end
│   ├── readiness_healthcheck.py   # Healthcheck automatizado de todos os serviços
│   ├── benchmark_sla_metrics.py   # Benchmark de latência e SLAs
│   └── copy-build.js              # Espelhamento para compatibilidade Vercel
│
├── src/                           # Aplicação web principal Next.js 14 App Router
│   ├── app/                       # 17 páginas e rotas de API Serverless
│   ├── components/                # Componentes reativos e mascote Jacquin
│   └── data/                      # Dataset consolidado de Caraguatatuba
│
├── web-admin/                     # Espelho de empacotamento sincronizado com src/
│
├── CHANGELOG.md                   # Histórico técnico de mudanças no padrão GitHub
├── HISTORICO_MUDANCAS.md          # Registro detalhado em português de toda a evolução
├── README.md                      # Vitrine oficial do repositório no GitHub
├── docker-compose.yml             # Orquestrador local do banco de dados
├── next.config.js                 # Configurações do Next.js
├── package.json                   # Dependências do front-end
└── vercel.json                    # Configuração de deploy contínuo em nuvem
```

---

## 🛠️ 9. Guia Rápido de Instalação e Execução Local

### 9.1 Executar a Aplicação Web
```bash
# 1. Navegar até o repositório
cd caragua-foodtech-mono

# 2. Instalar dependências Node.js
npm install

# 3. Executar em modo de desenvolvimento
npm run dev
# Acesse em: http://localhost:3000

# 4. Validar o build de produção
npm run build
npm run start
```

### 9.2 Executar o Banco de Dados Local
```bash
# Sobe o PostgreSQL 16 com PostGIS e pgvector na porta 5432
docker compose up -d
```

### 9.3 Executar o Back-End Python e IA
```bash
cd backend
python -m venv .venv
.venv\Scripts\activate          # No Windows
# source .venv/bin/activate     # No Linux/Mac

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
# Documentação Swagger da API: http://localhost:8000/docs
```

### 9.4 Executar o Extrator do Google Maps
```bash
# Inicia a extração Playwright nos 53 bairros
python scripts/run_full_gmaps_pipeline.py
```

---

## ⚖️ 10. Termos de Licença e Direitos Autorais

O código-fonte da plataforma está licenciado sob a **MIT License**.  
Os nomes dos 53 bairros municipais, praias, cooperativas de maricultura (**AMAPEC**), colônias de pescadores (**Z-8**) e do **Festival Gastronômico Caraguá a Gosto** são de titularidade pública e representativa do Município da Estância Balneária de Caraguatatuba/SP.

---
**Centro Universitário Módulo — Análise e Projeto de Sistemas II — 2026**  
*Prof. Me. Cristiano S. Negrão • Gabriel Rodrigues • Matheus Vicente • Pedro Simone*
