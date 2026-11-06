# 📋 HISTÓRICO DE MUDANÇAS & DIRETÓRIO TÉCNICO DO PROJETO (CHANGELOG)
## CaráFood — Monorepo Oficial (`caragua-foodtech-mono`)

> **Data da Atualização:** 06 de Novembro de 2026  
> **Objetivo:** Registro central de todas as mudanças de arquitetura, saneamento de dados, limpeza estrutural de diretórios e evolução acadêmica do projeto para fins de governança e avaliação na disciplina de **Análise e Projeto de Sistemas II (APS II)** e **Trabalho de Conclusão de Curso (TCC)** no **Centro Universitário Módulo**, sob orientação do **Prof. Me. Cristiano S. Negrão**.

---

## 1. 🧹 Saneamento da Estrutura de Pastas (Organização do Monorepo)

### 1.1 Problemas Identificados Anteriormente
1. **Poluição na Raiz do Repositório:** Arquivos binários pesados de relatórios Word (`.docx`) com mais de 8.6 MB estavam soltos na raiz, gerando lentidão no versionamento e poluição visual no GitHub.
2. **Duplicidade de Documentação:** Arquivos de especificação de IA (`AI_CONTEXT.md`, `GEMINI.md`) e dossiês estavam duplicados tanto na raiz quanto dentro de `docs/`.
3. **Resíduos de Build e Cache:** Arquivos como `tsconfig.tsbuildinfo` e pastas `__pycache__` geradas por execuções avulsas de scripts Python apareciam na raiz.
4. **Descompasso entre `src/` e `web-admin/`:** A pasta `web-admin/`, mantida como espelho para trace de empacotamento da Vercel, estava defasada em relação aos novos endpoints e páginas criados em `src/`.
5. **Scripts Órfãos sem Rastreio:** Novos scripts de scraping avançado do Google Maps estavam sem versionamento.

---

### 1.2 Ações Executadas e Reorganização

| Arquivo Original na Raiz | Destino / Ação Realizada | Motivação Técnica & Organização |
| :--- | :--- | :--- |
| `APSII_S10_CARAFOOD.docx` (6.1 MB) | Removido da raiz. Preservado em `docs/academic/` e `entregas_aps2/S10_A2_Entrega_Intermediaria/` | Evitar arquivos binários soltos na raiz; manter o acervo acadêmico centralizado. |
| `APSII_S10_CARAFOOD_FINAL.docx` (2.5 MB) | Removido da raiz. Preservado em `docs/academic/` e `entregas_aps2/S10_A2_Entrega_Intermediaria/` | Manter versão final consolidada da entrega intermediária S10 (A2) nos locais corretos. |
| `DOSSIE_COMPLETO_CARAFOOD.md` (90 KB) | Movido para `docs/academic/DOSSIE_COMPLETO_CARAFOOD.md` | Dossiê técnico mestre consolidado de todas as semanas S01-S16 da APS II. |
| `AI_CONTEXT.md` (9.7 KB) | Removido da raiz. Preservado em `docs/architecture/AI_CONTEXT.md` | Eliminar duplicata; especificação oficial pertence à arquitetura. |
| `GEMINI.md` (920 B) | Removido da raiz. Preservado em `docs/architecture/GEMINI.md` | Eliminar duplicata; diretrizes de governança do modelo pertencem à arquitetura. |
| `tsconfig.tsbuildinfo` | Deletado e confirmado no `.gitignore` | Cache transitório de build TypeScript nunca deve ser versionado. |
| `__pycache__/` na raiz | Deletado e confirmado no `.gitignore` | Bytecodes Python transitórios nunca devem ser versionados. |
| `web-admin/src/` | Sincronizado integralmente com `src/` | Atualizadas todas as rotas dinâmicas, páginas e dataset real no espelho da Vercel. |

---

## 2. 🗺️ Mapa Oficial da Estrutura Atualizada do Repositório

```text
caragua-foodtech-mono/
├── backend/                       # 🐍 BACK-END PYTHON & INTELIGÊNCIA ARTIFICIAL
│   ├── app/                       # Aplicação FastAPI modular
│   │   ├── api/routes/            # Endpoints: /chat, /restaurants, /dishes, /search, /moderation
│   │   ├── core/                  # Configurações de ambiente, segurança e LLM Manager
│   │   ├── db/                    # Modelos SQLAlchemy 2.0, conexão PostgreSQL e sessões
│   │   ├── schemas/               # Schemas de validação e serialização Pydantic V2
│   │   ├── services/              # Motor RAG de 5 Estágios, Vector Indexer (1536d)
│   │   └── workers/               # Scrapers autônomos, Playwright, LGPD sanitizer, antifraude
│   ├── data/                      # Dados brutos de scraping e snapshots dos 53 bairros
│   │   ├── raw/                   # Snapshots reais do OpenStreetMap e 59 payloads de bairros
│   │   └── snapshots/             # Histórico de coletas
│   ├── scripts/                   # Utilitários de migração, ingestão e testes de convergência
│   └── requirements.txt           # Dependências Python estritas com lock
│
├── data/                          # 📊 CONTRATO CENTRAL DE DADOS & SEMENTES ACADÊMICAS
│   └── seeds/                     # Especificação de sementes históricas e justificativa científica
│       └── README.md              # Documentação das sementes oficiais de Caraguatatuba
│
├── docker/                        # 🐳 INFRAESTRUTURA DE CONTÊINERES LOCAL
│   ├── Dockerfile.db              # PostgreSQL 16 com extensões PostGIS 3 + pgvector
│   └── init-db.sql                # Script de inicialização de tabelas e índices espaciais/vetoriais
│
├── docs/                          # 📚 ACERVO DOCUMENTAL COMPLETO (PADRÃO MIT/USP/HARVARD)
│   ├── academic/                  # Relatórios oficiais da disciplina APS II (Prof. Cristiano)
│   │   ├── APSII_S02_CARAGUA_FOODTECH.docx        # Entrega inicial da Semana 2
│   │   ├── APSII_S10_CARAFOOD.docx                # Relatório consolidado S01-S10 (Base A2)
│   │   ├── APSII_S10_CARAFOOD_FINAL.docx          # Versão final revisada para submissão A2
│   │   ├── DOSSIE_COMPLETO_CARAFOOD.md            # Dossiê técnico enciclopédico de 740+ linhas
│   │   ├── dossie_academico_tcc_a2_prof_cristiano.md # Requisitos, histórias e fundamentação
│   │   └── relatorio_tecnico_etapa_1_entrega_parcial.md # Relatório técnico da Etapa 1
│   ├── architecture/              # Especificações de Engenharia e RAG
│   │   ├── AI_CONTEXT.md                          # Arquitetura RAG 5 Estágios e PostGIS
│   │   ├── GEMINI.md                              # Diretrizes de Governança do Assistente
│   │   └── arquitetura_frontend_rag_caragua_dossie.md # Arquitetura de UI e streaming
│   ├── audits/                    # Auditorias de código, segurança e acessibilidade
│   │   └── diagnostico_critico_reddit_it_e_15_melhorias.md # Auditoria crítica de engenharia
│   ├── research/                  # Dossiês etnográficos, gastronômicos e benchmarks
│   │   ├── 15_melhorias_inspiradas_ia_ifood.md    # Arquiteturas de IA aplicadas
│   │   ├── dossie_caraguatatuba_e_prompt_engineering_jacquin.md # Persona Jacquin Praiano
│   │   ├── dossie_design_industrial_e_benchmark_top200.md # Benchmark e curvas de Lamé
│   │   ├── dossie_enciclopedico_caraguatatuba_oficial.md # 53 Bairros, AMAPEC e Colônia Z-8
│   │   └── plano_mestre_scraping_e_llm_jacquin.md # Diretrizes de extração de dados
│   ├── screenshots_s10/           # Evidências visuais de todas as telas em desktop e mobile
│   ├── ESCOPO_APSII_PROF_NEGRAO.md # Bíblia central de escopo e alinhamento pedagógico
│   ├── ROTEIRO_DEFESA_BANCA_E_OPERACAO.md # Roteiro de apresentação para a banca
│   └── TCC_RELATORIO_ENGENHARIA_E_BENCHMARKS.md # Relatório formal com métricas e benchmarks
│
├── entregas_aps2/                 # 🎓 SUÍTE COMPLETA DE ENTREGAS SEMANAIS (S01 A S16)
│   ├── S01_Registro_Inicial/      # Registro de tema, grupo discente e escopo
│   ├── S02_Prototipo_Historias_Mapa/ # Wireframes, histórias de usuário e mapa de navegação
│   ├── S03_Home_Landing_Page/     # Entrega da Home / Feed com 53 bairros
│   ├── S04_Pagina_Sobre_Nos/      # Página institucional e patrimônio caiçara
│   ├── S05_Pagina_Contato/        # Formulário B2B com geração de protocolo único
│   ├── S06_Menu_Navegacao/        # Barra de navegação responsiva e Dynamic Island
│   ├── S07_Tela_Login/            # Autenticação RBAC com 3 perfis e Quick-Auth TCC
│   ├── S08_Lista_Catalogo/        # Catálogo com filtros de insumos e maricultura
│   ├── S09_Pagina_Detalhe/        # Master-detail de pratos com cédula oficial de 5 critérios
│   ├── S10_A2_Entrega_Intermediaria/ # Consolidação A2: relatórios .docx, protótipos e textos
│   ├── S11_Melhoria_Versionamento/# Auditoria de Git, fluxo de branch e governança
│   ├── S12_Testes_Usabilidade/    # Bateria de testes de usabilidade com usuários reais
│   ├── S13_Deploy_Banco/          # Migração PostgreSQL na nuvem e deploy na Vercel
│   ├── S14_DNS_URL_Amigavel/      # Domínio oficial HTTPS e rotas canônicas
│   ├── S15_Checklist_Apresentacao/# Checklist de ensaio e validação para defesa de banca
│   ├── S16_A1_Entrega_Final/      # Entrega final da disciplina e encerramento
│   └── README.md                  # Sumário executivo das 16 entregas
│
├── legacy/                        # 🏛️ ACERVO HISTÓRICO DE PROTÓTIPOS
│   └── prototypes/                # Protótipos standalone HTML preservados para auditoria de UX
│
├── mobile/                        # 📱 APLICATIVO MOBILE HÍBRIDO (EXPO / REACT NATIVE)
│   ├── src/                       # Código fonte do app mobile (Expo Router, NativeWind)
│   ├── assets/                    # Imagens, QR codes e ícones
│   └── package.json               # Dependências do app Expo
│
├── public/                        # 🌐 ATIVOS PÚBLICOS ESTÁTICOS
│   ├── icon.svg                   # Ícone oficial em SVG vetorial
│   ├── jacquin-praiano.png        # Mascote oficial transparente em alta definição
│   └── manifest.json              # Manifesto PWA para instalação no celular e desktop
│
├── scripts/                       # ⚙️ ENGENHARIA DE AUTOMAÇÃO, HARVESTING & BENCHMARKS
│   ├── benchmark_sla_metrics.py   # Medição de latência dos endpoints e SLAs sub-segundo
│   ├── copy-build.js              # Espelhamento de build .next para web-admin (compatibilidade Vercel)
│   ├── dump_real_data_for_frontend.py # Extração dos dados do banco para caraguaRealDump.json
│   ├── generate_s10_complete_docx.py # Compilador autônomo do relatório A2 em formato docx
│   ├── generate_s10_from_friend_template.py # Injetor de dados no modelo acadêmico oficial
│   ├── generate_tcc_report.py     # Gerador de relatório técnico ABNT para o TCC
│   ├── gmaps_sample_output.json   # Amostra auditada de extração de locais e pratos do Google Maps
│   ├── readiness_healthcheck.py   # Healthcheck automatizado de todos os serviços (DB, API, Web)
│   ├── run_full_gmaps_pipeline.py # 🚀 Pipeline autônomo completo de scraping Playwright do Google Maps
│   ├── test_batch_gmaps.py        # Teste de coleta em lote por múltiplos bairros
│   ├── test_gmaps_scraper.py      # Teste unitário e validação do extrator de estabelecimentos
│   ├── test_rag_pipeline.py       # Teste do motor RAG com vetores e regras de veto alimentares
│   ├── build/                     # Scripts de empacotamento legados
│   └── tools/                     # Scripts de geração de HTML e docx
│
├── src/                           # 💻 APLICAÇÃO WEB PRINCIPAL (NEXT.JS 14 APP ROUTER)
│   ├── app/                       # Rotas App Router (Server & Client Components)
│   │   ├── api/                   # Rotas de API Serverless (/chat, /restaurants, /search, /reviews)
│   │   ├── contato/               # Credenciamento de quiosques e protocolo B2B
│   │   ├── login/                 # Autenticação com 3 perfis e Quick-Auth TCC
│   │   ├── moderation/            # Painel de moderação de promoções e auditoria
│   │   ├── page.tsx               # Feed principal, Stories dos 53 Bairros e Jacquin Copilot
│   │   ├── prato/[id]/            # Página de detalhes com cédula oficial e rota Google Maps
│   │   ├── rag-test/              # Playground interativo do pipeline RAG de 5 estágios
│   │   ├── rankings/              # Pódio histórico do Festival Caraguá a Gosto
│   │   ├── restaurants/[slug]/    # Página detalhada do restaurante com cardápio e reviews reais
│   │   ├── sobre/                 # Página institucional e patrimônio cultural caiçara
│   │   ├── globals.css            # Estilos globais e tokens de cores oficiais
│   │   └── layout.tsx             # Layout raiz com metadados SEO, PWA e OpenGraph
│   ├── components/                # Biblioteca modular de componentes reativos
│   │   ├── admin/                 # Visões administrativas e arquitetura RAG
│   │   ├── consumer/              # Abas do consumidor (Feed, Radar, Busca, Avaliações, Créditos)
│   │   ├── DynamicIsland.tsx      # Ilha dinâmica superior com feedback de status
│   │   ├── FloatingJacquin.tsx    # Mascote flutuante com balões contextuais
│   │   ├── JacquinChatDrawer.tsx  # Chat lateral integrado com a persona do Chef Jacquin
│   │   ├── CaraguaAIChatDrawer.tsx# Chat streaming conectado ao Ollama/FastAPI
│   │   ├── Navbar.tsx             # Barra de navegação unificada e responsiva
│   │   └── AcademicPortalModal.tsx# Portal de acesso para avaliação do Prof. Cristiano Negrão
│   └── data/                      # Camada de dados da aplicação web
│       ├── caraguaData.ts         # Metadados e catalogações dos 53 bairros
│       ├── caraguaRealDump.json   # Dataset real consolidado com centenas de pratos e locais de Caraguá
│       └── realDataStore.ts       # Camada de acesso e consultas em memória para rotas estáticas e Vercel
│
├── web-admin/                     # 🪞 ESPELHO DE BUILD VERCEL (NFT TRACE RESOLUTION)
│   ├── src/                       # Cópia sincronizada da camada src/ para garantir resolução Vercel
│   ├── package.json               # Manifesto espelho de dependências
│   └── next.config.js             # Configuração espelho
│
├── .gitignore                     # Regras de exclusão consolidadas para Node, Python, Caches e Logs
├── docker-compose.yml             # Orquestrador local do PostgreSQL + PostGIS + pgvector
├── next.config.js                 # Configuração do Next.js com otimização de imagens e headers
├── package.json                   # Manifesto de dependências do monorepo
├── package-lock.json              # Lockfile de dependências npm
├── postcss.config.js              # Configuração do PostCSS
├── tailwind.config.js             # Configuração de tokens de cores (Verde Floresta, Amarelo Solar)
├── tsconfig.json                  # Configuração estrita do compilador TypeScript
├── vercel.json                    # Configuração de deploy contínuo na Vercel
└── README.md                      # Documentação mestre e vitrine oficial do projeto
```

---

## 3. 🔬 Resumo das Atualizações Recentes de Engenharia

### 3.1 Pipeline de Ingestão Real do Google Maps (`scripts/run_full_gmaps_pipeline.py`)
- **Implementação:** Desenvolvido robô com Playwright para extração autônoma de locais gastronômicos nos 53 bairros de Caraguatatuba.
- **Dados Coletados:** Nota real no Google Maps (ex.: 4.4, 4.6), contagem total de avaliações humanas (ex.: 1.452, 2.086), comentários reais com autor, data e nota por estrelas, telefone comercial e endereço exato.
- **Purgação de Dados Sintéticos:** Eliminação de 100% de avaliações falsas geradas por IA. Quando um prato não possui avaliação de usuário, o sistema exibe estado vazio autêntico convidando o cliente a ser o primeiro a avaliar via cédula oficial.

### 3.2 Refatoração das Telas de Consumo
- **`src/app/restaurants/[slug]/page.tsx`:** Atualizado para exibir avaliações públicas reais do Google Maps, incluindo identificação do autor, estrelas auditadas e data real da visita.
- **`src/app/prato/[id]/PratoDetailClient.tsx`:** Substituída a fórmula sintética por transparência com nota conferida do Google Maps e estado vazio informativo com botão de ação para votação na cédula do festival.
- **`src/data/realDataStore.ts`:** Blindagem contra fallbacks sintéticos, mapeando campos de reviews reais com fallback para arrays vazios em conformidade estrita com o princípio da transparência científica.

### 3.3 Garantia de Build e Produção
- Build de produção verificado com **17/17 páginas estáticas e rotas dinâmicas** compiladas com zero erros via `npm run build`.
- Pós-processamento automatizado via `scripts/copy-build.js` sincronizando os artefatos com `web-admin/` para compatibilidade total com o deploy contínuo na **Vercel** (`https://foddtech.vercel.app/`).
