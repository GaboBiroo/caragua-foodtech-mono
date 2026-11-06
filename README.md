# 🌊 CaráFood — Plataforma Hiperlocal de Inteligência Gastronômica & Roteiro dos 53 Bairros

[![Next.js 14](https://img.shields.io/badge/Next.js-14.2_App_Router-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript 5](https://img.shields.io/badge/TypeScript-5.4_Strict-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4_JIT-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110_Async-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![PostgreSQL & PostGIS](https://img.shields.io/badge/PostgreSQL-16_PostGIS_+_pgvector-336791?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)
[![Playwright](https://img.shields.io/badge/Playwright-Harvester_Live-45ba4b?style=for-the-badge&logo=playwright)](https://playwright.dev/)
[![WCAG 2.2 AAA](https://img.shields.io/badge/Acessibilidade-WCAG_2.2_AAA-success?style=for-the-badge)](https://www.w3.org/WAI/standards-guidelines/wcag/)
[![Deploy Vercel](https://img.shields.io/badge/Vercel-Produção_Ativa-black?style=for-the-badge&logo=vercel)](https://foddtech.vercel.app/)
[![Licença MIT](https://img.shields.io/badge/Licen%C3%A7a-MIT-amber?style=for-the-badge)](LICENSE)

> **🚀 Ambiente de Produção Ativo:** [https://foddtech.vercel.app/](https://foddtech.vercel.app/)  
> **📦 Repositório Oficial no GitHub:** [github.com/GaboBiroo/caragua-foodtech-mono](https://github.com/GaboBiroo/caragua-foodtech-mono)  
> **📋 Histórico Completo de Mudanças:** Consulte [`CHANGELOG.md`](CHANGELOG.md) e [`HISTORICO_MUDANCAS.md`](HISTORICO_MUDANCAS.md)

---

## 🏛️ Identificação Institucional & Créditos Acadêmicos

Este sistema monorepo constitui o núcleo prático, experimental e científico desenvolvido para a disciplina de **Análise e Projeto de Sistemas II (APS II)** e o **Trabalho de Conclusão de Curso (TCC)** da graduação em **Tecnologia em Análise e Desenvolvimento de Sistemas (ADS)**:

- **Instituição de Ensino:** Centro Universitário Módulo — Cruzeiro do Sul Educacional (Campus Caraguatatuba / SP)
- **Docente Orientador & Avaliador:** **Prof. Me. Cristiano S. Negrão**
- **Semestre Letivo:** 2026.1 / 2026.2
- **Domínio de Aplicação:** Engenharia de Software Hiperlocal, Gastronomia Caiçara, Turismo Sustentável e Auditoria Algorítmica contra Fraudes
- **Tipo de Aplicação:** Monorepo Full-Stack com Web Responsiva (PWA Mobile-First), Back-End Assíncrono com IA Local, Banco Geoespacial/Vetorial e Aplicativo Mobile

### Composição Oficial do Grupo Discente (Matriz RACI / Scrum Roles)

| Integrante | Papel Principal no Projeto | Atribuições Centrais de Engenharia |
| :--- | :--- | :--- |
| **Gabriel Rodrigues** | **Product Owner / Tech Lead / Full-Stack** | Arquitetura de software monorepo, UI/UX em Next.js 14, esteira RAG de 5 estágios, prompt engineering do Chef Jacquin Praiano, pipeline Playwright e deploy contínuo na Vercel. |
| **Matheus Vicente** | **Engenharia de Requisitos & Domínio** | Elicitação de requisitos e Histórias de Usuário, catalogação dos 53 bairros de Caraguatatuba, modelagem de banco relacional/geoespacial (PostgreSQL + PostGIS + pgvector) e schemas Pydantic V2. |
| **Pedro Simone** | **QA, Testes de Usabilidade & Documentação** | Bateria de testes de usabilidade (S12), conformidade de acessibilidade digital (WCAG 2.2 AAA), validação dos critérios da cédula do festival e consolidação dos relatórios técnicos acadêmicos (S01–S16). |

---

## 📌 Proposta de Valor & Diferenciais Exclusivos

O **CaráFood** nasceu para superar a fragmentação da informação gastronômica e combater a invisibilidade histórica dos produtores locais em **Caraguatatuba**, a Capital Gastronômica do Litoral Norte paulista. 

Diferente de marketplaces generalistas (como iFood ou TripAdvisor), focados exclusivamente em taxas de comissão e dominados por algoritmos opacos que sofrem de severa sazonalidade turística, o CaráFood apoia-se em cinco pilares fundamentais:

1. **Hiperlocalismo Genuíno (53 Bairros Oficiais):** Mapeamento exaustivo e democrático desde os polos de alta densidade turística (*Martim de Sá*, *Prainha*, *Indaiá*, *Centro*) até as comunidades tradicionais da Zona Sul e Encostas (*Tinga*, *Perequê-Mirim*, *Morro do Algodão*, *Rio do Ouro*, *Pegorelli*, *Barranco Alto*).
2. **Cultura Caiçara & Rastreabilidade de Origem:** Integração direta da Maricultura da Praia da Cocanha (**AMAPEC** — maior parque produtor de mexilhões do Brasil), do Entreposto de Pesca Artesanal do Camaroeiro (**Colônia de Pescadores Z-8**) e de pratos seculares como o autêntico *Azul-Marinho na panela de ferro com banana verde*.
3. **Cédula Oficial Digital do Festival Caraguá a Gosto:** Votação auditada em 5 critérios canônicos (*Sabor*, *Apresentação*, *Insumos Locais*, *Atendimento* e *Ambiente*), com cálculo de notas transparentes e algoritmo de decaimento temporal para valorizar experiências recentes.
4. **Copiloto Gastronômico Chef Jacquin Praiano:** Assistente inteligente contextual via RAG de 5 Estágios (com veto alimentar estrito para alérgenos e celíacos, geolocalização por proximidade e tom bem-humorado de crítico gastronômico francês abrasileirado).
5. **Transparência Científica & Erradicação de Avaliações Falsas:** Pipeline autônomo com Playwright integrado ao OpenStreetMap (OSM) e ao Google Maps para extração de notas reais, comentários humanos autênticos e contagem auditada, com estado vazio convidativo caso um prato ainda não tenha sido avaliado por comensais.

---

## 🗺️ Estrutura Oficial do Repositório (Monorepo Limpo)

O repositório está organizado segundo a taxonomia profissional de monorepos modernos para ambientes acadêmicos e industriais de ponta:

```text
caragua-foodtech-mono/
│
├── backend/                       # 🐍 BACK-END PYTHON, IA & GEOPROCESSAMENTO
│   ├── app/                       # Aplicação modular FastAPI
│   │   ├── api/routes/            # Rotas REST (/chat, /restaurants, /dishes, /search, /moderation)
│   │   ├── core/                  # Configurações, segurança JWT e LLM Manager
│   │   ├── db/                    # Modelos SQLAlchemy 2.0 e pool de conexão
│   │   ├── schemas/               # Modelos Pydantic V2 com tipagem estrita
│   │   ├── services/              # Pipeline RAG 5 Estágios, Vector Indexer e Vetoes
│   │   └── workers/               # Scrapers autônomos, Playwright, LGPD e antifraude
│   ├── data/raw/                  # Snapshots do OpenStreetMap e 59 payloads de bairros
│   ├── scripts/                   # Scripts de migração de banco e testes de convergência
│   └── requirements.txt           # Dependências com travas estritas de versão
│
├── data/                          # 📊 CONTRATOS DE DADOS & GOVERNANÇA
│   └── seeds/                     # Especificação formal de sementes e justificativa científica
│       └── README.md              # Dicionário de dados da catalogação inicial
│
├── docker/                        # 🐳 INFRAESTRUTURA DE BANCO DE DADOS
│   ├── Dockerfile.db              # PostgreSQL 16 + PostGIS 3 + pgvector compilado
│   └── init-db.sql                # Criação de tabelas, índices H3 e colunas de vetor
│
├── docs/                          # 📚 ACERVO DOCUMENTAL COMPLETO (PADRÃO HARVARD / MIT / USP)
│   ├── academic/                  # Relatórios formais da disciplina APS II (Prof. Cristiano)
│   │   ├── APSII_S02_CARAGUA_FOODTECH.docx        # Relatório inicial da Semana 2
│   │   ├── APSII_S10_CARAFOOD.docx                # Relatório consolidado S01-S10 (Base A2)
│   │   ├── APSII_S10_CARAFOOD_FINAL.docx          # Versão final revisada para submissão A2
│   │   ├── DOSSIE_COMPLETO_CARAFOOD.md            # Dossiê técnico enciclopédico de 740+ linhas
│   │   ├── dossie_academico_tcc_a2_prof_cristiano.md # Elicitação de requisitos e teoria
│   │   └── relatorio_tecnico_etapa_1_entrega_parcial.md # Relatório técnico de entrega parcial
│   ├── architecture/              # Engenharia de software e inteligência artificial
│   │   ├── AI_CONTEXT.md                          # Especificação da esteira RAG e PostGIS
│   │   ├── GEMINI.md                              # Diretrizes de prompt engineering e governança
│   │   └── arquitetura_frontend_rag_caragua_dossie.md # Arquitetura de UI e streaming
│   ├── audits/                    # Auditorias de código, segurança e WCAG
│   ├── research/                  # Dossiês enciclopédicos sobre os 53 bairros e maricultura
│   ├── screenshots_s10/           # Evidências em alta definição de todas as telas (desktop/mobile)
│   ├── ESCOPO_APSII_PROF_NEGRAO.md # Bíblia de escopo acadêmico da APS II
│   ├── ROTEIRO_DEFESA_BANCA_E_OPERACAO.md # Roteiro oficial para apresentação e defesa de banca
│   └── TCC_RELATORIO_ENGENHARIA_E_BENCHMARKS.md # Relatório formal com métricas e benchmarks
│
├── entregas_aps2/                 # 🎓 SUÍTE COMPLETA DAS 16 ENTREGAS SEMANAIS (S01 A S16)
│   ├── S01_Registro_Inicial/      # Registro do tema, escopo e integrantes
│   ├── S02_Prototipo_Historias_Mapa/ # Wireframes, histórias de usuário e mapa de navegação
│   ├── S03_Home_Landing_Page/     # Entrega da Home / Feed com explorador dos 53 bairros
│   ├── S04_Pagina_Sobre_Nos/      # História institucional e patrimônio cultural caiçara
│   ├── S05_Pagina_Contato/        # Formulário B2B de credenciamento com protocolo único
│   ├── S06_Menu_Navegacao/        # Navbar responsiva e Dynamic Island inteligente
│   ├── S07_Tela_Login/            # Autenticação com 3 perfis RBAC e Quick-Auth TCC
│   ├── S08_Lista_Catalogo/        # Catálogo com filtros de maricultura e categorias
│   ├── S09_Pagina_Detalhe/        # Master-detail de pratos com cédula de 5 critérios
│   ├── S10_A2_Entrega_Intermediaria/ # Consolidação A2 (relatórios .docx, protótipos e prints)
│   ├── S11_Melhoria_Versionamento/# Auditoria de branches, governança de commit e changelog
│   ├── S12_Testes_Usabilidade/    # Protocolo de testes de usabilidade com usuários
│   ├── S13_Deploy_Banco/          # Migração para nuvem e pipeline de deploy na Vercel
│   ├── S14_DNS_URL_Amigavel/      # Domínio público com HTTPS e rotas canônicas
│   ├── S15_Checklist_Apresentacao/# Checklist de ensaio para defesa perante a banca examinadora
│   ├── S16_A1_Entrega_Final/      # Entrega final da disciplina e encerramento
│   └── README.md                  # Sumário executivo das 16 entregas acadêmicas
│
├── legacy/                        # 🏛️ ACERVO HISTÓRICO DE PROTÓTIPOS
│   └── prototypes/                # Protótipos standalone em HTML preservados para auditoria
│
├── mobile/                        # 📱 APLICATIVO MOBILE HÍBRIDO (EXPO / REACT NATIVE)
│   ├── src/                       # Telas do app (Expo Router, NativeWind, BottomSheet)
│   └── package.json               # Dependências do app Expo
│
├── public/                        # 🌐 ASSETS PÚBLICOS ESTÁTICOS
│   ├── icon.svg                   # Ícone oficial em vetor SVG
│   ├── jacquin-praiano.png        # Mascote oficial em alta resolução transparente
│   └── manifest.json              # Manifesto PWA para instalação no celular e desktop
│
├── scripts/                       # ⚙️ ENGENHARIA DE AUTOMAÇÃO, HARVESTING & BENCHMARKS
│   ├── run_full_gmaps_pipeline.py # 🚀 Pipeline autônomo de scraping Playwright do Google Maps
│   ├── test_gmaps_scraper.py      # Teste unitário e validação do extrator de estabelecimentos
│   ├── test_batch_gmaps.py        # Teste de coleta em lote por múltiplos bairros
│   ├── dump_real_data_for_frontend.py # Extrai o dataset consolidado para caraguaRealDump.json
│   ├── benchmark_sla_metrics.py   # Medição de latência dos endpoints e SLAs sub-segundo
│   ├── readiness_healthcheck.py   # Healthcheck automatizado de todos os serviços
│   ├── test_rag_pipeline.py       # Validação da esteira RAG e vetorização
│   ├── generate_s10_complete_docx.py # Compilador autônomo do relatório A2 em formato docx
│   ├── generate_s10_from_friend_template.py # Injetor no modelo acadêmico oficial
│   ├── generate_tcc_report.py     # Gerador de relatório técnico ABNT para o TCC
│   └── copy-build.js              # Espelhamento de build .next para web-admin (compatibilidade Vercel)
│
├── src/                           # 💻 APLICAÇÃO WEB PRINCIPAL (NEXT.JS 14 APP ROUTER)
│   ├── app/                       # 17 páginas estáticas e rotas dinâmicas
│   │   ├── api/                   # Rotas de API Serverless (/chat, /restaurants, /search, /reviews)
│   │   ├── contato/               # Credenciamento com geração de protocolo B2B
│   │   ├── login/                 # Login com 3 perfis e Quick-Auth de demonstração
│   │   ├── moderation/            # Painel de moderação e auditoria de promoções
│   │   ├── page.tsx               # Feed principal estilo Instagram com stories dos 53 bairros
│   │   ├── prato/[id]/            # Página master-detail de prato com cédula oficial de 5 critérios
│   │   ├── rag-test/              # Playground interativo do pipeline RAG de 5 estágios
│   │   ├── rankings/              # Pódio histórico do Festival Caraguá a Gosto
│   │   ├── restaurants/[slug]/    # Página detalhada do restaurante com cardápio e reviews reais
│   │   ├── sobre/                 # Página institucional e patrimônio cultural caiçara
│   │   ├── globals.css            # Estilos com design tokens e variáveis oficiais
│   │   └── layout.tsx             # Layout raiz com fontes otimizadas e metadados PWA
│   ├── components/                # Biblioteca modular de componentes reativos
│   │   ├── admin/                 # Visões de administração e arquitetura RAG
│   │   ├── consumer/              # Abas do consumidor (Feed, Radar, Busca, Avaliações, Créditos)
│   │   ├── DynamicIsland.tsx      # Ilha dinâmica superior de interação contextual
│   │   ├── FloatingJacquin.tsx    # Mascote flutuante com balões dinâmicos
│   │   ├── JacquinChatDrawer.tsx  # Chat lateral integrado à persona gastronômica
│   │   ├── CaraguaAIChatDrawer.tsx# Chat streaming conectado ao back-end de IA
│   │   ├── Navbar.tsx             # Barra de navegação unificada e responsiva
│   │   └── AcademicPortalModal.tsx# Portal acadêmico para avaliação do Prof. Cristiano Negrão
│   └── data/                      # Camada de dados da aplicação web
│       ├── caraguaData.ts         # Metadados dos 53 bairros de Caraguatatuba
│       ├── caraguaRealDump.json   # Dataset real consolidado com centenas de pratos e locais
│       └── realDataStore.ts       # Camada de consultas em memória otimizada para rotas estáticas
│
├── web-admin/                     # 🪞 ESPELHO DE BUILD VERCEL (NFT TRACE RESOLUTION)
│   └── src/                       # Cópia sincronizada da camada src/ para resolução de assets
│
├── CHANGELOG.md                   # Registro histórico detalhado de todas as mudanças
├── HISTORICO_MUDANCAS.md          # Guia detalhado de migração e organização em português
├── docker-compose.yml             # Orquestrador local do banco PostgreSQL
├── next.config.js                 # Configuração do Next.js 14
├── package.json                   # Manifesto de dependências do monorepo
├── package-lock.json              # Lockfile de dependências npm
├── tailwind.config.js             # Configurações de cores oficiais caiçaras
├── tsconfig.json                  # Configuração estrita do TypeScript 5
└── vercel.json                    # Configuração de deploy contínuo na Vercel
```

---

## 💻 Stack Tecnológica & Decisões de Engenharia

| Camada / Módulo | Tecnologia Adotada | Justificativa & Benefício Técnico |
| :--- | :--- | :--- |
| **Front-End Web** | **Next.js 14.2 (App Router)** | Renderização híbrida (SSG + ISR), Server Components nativos, rotas dinâmicas compiladas e deploy zero-config na Vercel. |
| **Linguagem (Web)** | **TypeScript 5.4 (Strict Mode)** | Tipagem estática rigorosa de ponta a ponta, evitando erros de execução e garantindo contratos de dados consistentes. |
| **Estilização** | **Tailwind CSS 3.4 + JIT** | Paleta oficial caiçara (`#135136` Verde Floresta, `#FFB703` Amarelo Solar, `#023E8A` Azul Oceano) e zero overhead de runtime. |
| **Animações Físicas** | **Framer Motion 14** | Molas físicas com coeficiente de Gabriel Lamé para transições orgânicas a 60fps no double-tap de curtidas e modais. |
| **Back-End API** | **FastAPI + Uvicorn** | Servidor assíncrono em Python com documentação OpenAPI/Swagger automática e alta performance com `asyncpg`. |
| **Banco de Dados** | **PostgreSQL 16 + PostGIS + pgvector** | Modelagem relacional com consultas espaciais geoespaciais e busca semântica por similaridade de cosseno em vetores de 1536 dimensões. |
| **Motor de IA & RAG** | **LangChain + Ollama (qwen2.5:3b)** | Pipeline de Recuperação Aumentada por Geração (RAG) em 5 estágios com veto alimentar estrito para alérgenos e celíacos. |
| **Scraping Autônomo** | **Playwright (Python)** | Extração automatizada e ética de dados públicos de estabelecimentos, notas e avaliações reais nos 53 bairros de Caraguá. |
| **Mobile App** | **Expo SDK 52 + React Native** | Aplicativo nativo multiplataforma (Android/iOS) com navegação fluida via Expo Router e componentes Tailwind com NativeWind. |
| **Cloud Hosting** | **Vercel Global Edge Network** | Deploy contínuo integrado à branch `main` do GitHub com certificado HTTPS/TLS 1.3 nativo e CDN global com latência inferior a 35ms. |

---

## 👥 Histórias de Usuário Implementadas (Matriz APS II)

### Ator 1: Usuário Principal (Turista / Morador Caiçara)
- **HU01 — Feed & Exploração por Bairro:**  
  *Como morador ou turista de Caraguatatuba, quero visualizar um feed com fotografias reais e filtrar os pratos pelos 53 bairros oficiais da cidade, para descobrir onde comer bem em bairros tradicionais além da orla central.*
- **HU02 — Avaliação Auditada do Festival (Cédula Digital):**  
  *Como cliente de um restaurante ou quiosque participante do Caraguá a Gosto, quero avaliar o prato através de uma cédula digital com 5 critérios oficiais (sabor, apresentação, insumos locais, atendimento e ambiente), para registrar meu voto auditado.*
- **HU03 — Rota Geoespacial Direta:**  
  *Como visitante em trânsito pela Rodovia dos Tamoios ou Rio-Santos, quero clicar em um prato ou restaurante e abrir instantaneamente a rota no Google Maps/Waze, para chegar ao local sem me perder.*

### Ator 2: Administrador / Gestor do Estabelecimento
- **HU04 — Credenciamento e Presença Digital:**  
  *Como proprietário de um quiosque pé na areia ou restaurante caiçara, quero solicitar o credenciamento do meu negócio informando CNPJ, bairro e especialidade, para obter visibilidade gastronômica auditada perante moradores e turistas.*
- **HU05 — Visualização de Métricas e Pódio do Festival:**  
  *Como gestor gastronômico, quero acompanhar o ranking oficial e as notas conferidas do meu cardápio em comparação com concorrentes, para valorizar meus insumos e calibrar meu atendimento.*

### Ator 3: Membro da Comunidade Produtiva Local (Pescador / Maricultor)
- **HU06 — Certificação de Origem do Insumo (AMAPEC & Colônia Z-8):**  
  *Como maricultor da Fazenda da Cocanha (AMAPEC) ou pescador artesanal do Camaroeiro (Colônia Z-8), quero que os pratos que utilizam nossos pescados e mariscos exibam um selo oficial de procedência sustentável, para combater fraudes alimentares e valorizar a economia caiçara.*

---

## 🎓 Suíte de Entregas Semanais APS II (Prof. Cristiano Negrão)

Todas as 16 entregas semanais da disciplina estão documentadas e preservadas dentro do diretório `entregas_aps2/`:

| Semana | Diretório | Conteúdo e Artefatos Entregues |
| :---: | :--- | :--- |
| **S01** | `entregas_aps2/S01_Registro_Inicial/` | Registro formal de tema, integrantes, objetivos e plano de ação. |
| **S02** | `entregas_aps2/S02_Prototipo_Historias_Mapa/` | Wireframes de baixa/alta fidelidade, matriz de histórias de usuário e mapa de navegação. |
| **S03** | `entregas_aps2/S03_Home_Landing_Page/` | Landing page principal com feed estilo Instagram e seletor dos 53 bairros. |
| **S04** | `entregas_aps2/S04_Pagina_Sobre_Nos/` | Página institucional com história de Caraguatatuba e alinhamento TCC. |
| **S05** | `entregas_aps2/S05_Pagina_Contato/` | Formulário de contato e credenciamento de estabelecimentos com protocolo único. |
| **S06** | `entregas_aps2/S06_Menu_Navegacao/` | Barra de navegação global responsiva e Dynamic Island inteligente com o Jacquin. |
| **S07** | `entregas_aps2/S07_Tela_Login/` | Tela de autenticação com 3 perfis RBAC (Consumidor, Dono de Restaurante, Auditor). |
| **S08** | `entregas_aps2/S08_Lista_Catalogo/` | Catálogo de pratos com filtros avançados de maricultura, preços e categorias. |
| **S09** | `entregas_aps2/S09_Pagina_Detalhe/` | Página de detalhes (master-detail) com cédula oficial de 5 critérios do festival. |
| **S10** | `entregas_aps2/S10_A2_Entrega_Intermediaria/` | **Entrega Intermediária (Base A2):** Relatório consolidado em Word (`APSII_S10_CARAFOOD_FINAL.docx`), protótipos e evidências. |
| **S11** | `entregas_aps2/S11_Melhoria_Versionamento/` | Auditoria de Git, fluxo de branches e governança do código-fonte. |
| **S12** | `entregas_aps2/S12_Testes_Usabilidade/` | Bateria de testes de usabilidade com questionários e métricas de satisfação. |
| **S13** | `entregas_aps2/S13_Deploy_Banco/` | Deploy da aplicação na Vercel e orquestração do banco PostgreSQL. |
| **S14** | `entregas_aps2/S14_DNS_URL_Amigavel/` | Configuração de domínio público amigável com certificado HTTPS. |
| **S15** | `entregas_aps2/S15_Checklist_Apresentacao/` | Checklist formal de ensaio para apresentação perante a banca examinadora. |
| **S16** | `entregas_aps2/S16_A1_Entrega_Final/` | **Entrega Final (Base A1 / TCC):** Encerramento do ciclo letivo e sistema em produção. |

---

## 🛠️ Guia de Inicialização Local (Setup Passo a Passo)

### 1. Pré-requisitos
- **Node.js:** Versão `18.17.0` ou superior (`v20 LTS` recomendada)
- **Python:** Versão `3.11` ou superior
- **Docker & Docker Compose** (para executar o banco PostgreSQL localmente)
- **Git** instalado no terminal

### 2. Clonar o Repositório
```bash
git clone https://github.com/GaboBiroo/caragua-foodtech-mono.git
cd caragua-foodtech-mono
```

### 3. Executar a Aplicação Web (Next.js 14)
```bash
# Instalar as dependências do front-end
npm install

# Iniciar o servidor de desenvolvimento
npm run dev
```
Acesse no navegador: 👉 `http://localhost:3000`

Para testar o build de produção:
```bash
npm run build
npm run start
```

### 4. Executar a Infraestrutura de Banco de Dados Local (Docker)
```bash
docker compose up -d
```
O PostgreSQL estará ativo na porta `5432` com as extensões **PostGIS 3** e **pgvector** habilitadas.

### 5. Executar o Back-End Python (FastAPI & RAG)
```bash
cd backend
python -m venv .venv
# No Windows:
.venv\Scripts\activate
# No Linux/Mac:
source .venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
Documentação interativa Swagger da API: 👉 `http://localhost:8000/docs`

### 6. Executar o Pipeline de Extração Real (Google Maps)
```bash
# Executa o extrator Playwright para carregar avaliações reais dos 53 bairros
python scripts/run_full_gmaps_pipeline.py
```

### 7. Executar o Aplicativo Mobile (Expo / React Native)
```bash
cd mobile
npm install
npx expo start
```
Escaneie o QR Code gerado pelo terminal com o aplicativo **Expo Go** (Android ou iOS).

---

## ♿ Acessibilidade Digital & Usabilidade (WCAG 2.2 AAA)

A interface foi projetada em estrita conformidade com os padrões internacionais do **W3C / WAI**:
- **Contraste de Cores:** Mínimo de `7:1` em todos os elementos textuais e informativos sobre fundos sólidos e cartões translúcidos (nível AAA).
- **Alvos de Toque (Touch Targets):** Todos os botões, ícones interativos e seletores possuem dimensão mínima de `48x48px` seguindo o Apple Human Interface Guidelines e o Google Material Design 3.
- **Navegação por Teclado:** Suporte completo a navegação por `Tab`, `Shift+Tab`, `Enter`, `Space` e `Escape` com anel de foco destacado (`focus:ring-2 focus:ring-[#FFB703]`).
- **Suporte a Leitores de Tela:** Estrutura semântica rigorosa com tags HTML5 (`<main>`, `<header>`, `<article>`, `<nav>`, `<section>`), atributos ARIA e textos alternativos descritivos em todas as imagens.

---

## 📜 Licença & Propriedade Intelectual

Este projeto está licenciado sob os termos da **MIT License**.  
Os nomes dos bairros oficiais, festivais, praias e patrimônios culturais são de titularidade pública do Município da Estância Balneária de Caraguatatuba/SP e de suas respectivas entidades representativas (**AMAPEC**, **Colônia de Pescadores Z-8** e **ACEC**).

**Centro Universitário Módulo — Análise e Projeto de Sistemas II — 2026**
