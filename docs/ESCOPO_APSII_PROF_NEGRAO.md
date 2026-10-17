# 📖 BÍBLIA DE REQUISITOS E ESCOPO OFICIAL — ANÁLISE E PROJETO DE SISTEMAS II (APS II — 2026/2)

**Instituição:** Centro Universitário Módulo — Caraguatatuba/SP  
**Curso:** Ciência da Computação / Sistemas de Informação / Análise e Desenvolvimento de Sistemas  
**Disciplina:** Análise e Projeto de Sistemas II (APS II) / Projeto Integrador  
**Docente Orientador e Avaliador:** Prof. Me. Cristiano S. Negrão  
**Projeto Oficial:** **CaráFood (Caraguá FoodTech)** — *Ecossistema Hiperlocal de Descoberta Gastronômica, Auditoria de Avaliações (Caraguá a Gosto) e Curadoria IA dos 53 Bairros de Caraguatatuba*  
**URL Oficial de Produção (PaaS Vercel):** [https://foddtech.vercel.app/](https://foddtech.vercel.app/)  
**Repositório Oficial (GitHub Monorepo):** `https://github.com/GaboBiroo/caragua-foodtech-mono`  

---

## 👥 1. QUADRO OFICIAL DA EQUIPE E PAPÉIS DE ENGENHARIA

| Integrante | Papel Principal no Projeto (Scrum / Engenharia) | Responsabilidades Técnicas e Acadêmicas |
| :--- | :--- | :--- |
| **Gabriel Rodrigues** | **Tech Lead, Product Owner (PO) & Desenvolvedor Full-Stack / IA** | Arquitetura Next.js 14 App Router, Design System Industrial (*CaráFood*), Motor Matemático da Cédula Auditada (Decaimento Exponencial $\lambda = \ln(2)/30$ e Filtro Anti-Bot Z-Score), Integração LLM/RAG (Chef Jacquin Praiano) e Deploy CI/CD na Vercel. |
| **Matheus Vicente** | **Engenheiro de Dados, Back-End & Curadoria Territorial** | Modelagem do Banco de Dados Relacional (PostgreSQL / Supabase / Prisma), Mapeamento Geoespacial dos 53 Bairros de Caraguatatuba nas 4 Macro-Regiões, Catalogação da Maricultura (AMAPEC - Cocanha) e Pesca Artesanal (Colônia Z-8 - Camaroeiro). |
| **Pedro Simone** | **Engenheiro de Qualidade (QA), UX Researcher & Documentação** | Planejamento e Execução de Casos de Teste Funcionais (`CT01` a `CT12`), Condução dos Testes de Usabilidade Cronometrados (S12), Auditoria de Acessibilidade WCAG 2.2 AAA e Padronização Documental ABNT/Módulo (`.docx`). |

---

## ⚖️ 2. REGRAS GERAIS DE SUBMISSÃO E COMPOSIÇÃO DE NOTA (INEGOCIÁVEIS)

1. **Regra de Envio Individual no Portal (AVA / Blackboard):**
   - Ainda que o projeto seja desenvolvido em equipe, **cada integrante deve realizar o upload individual do arquivo `.docx`** em sua própria conta do portal acadêmico dentro do prazo estipulado. O não envio individual implica nota **0,0 (zero)** para o aluno na respectiva semana.
2. **Formato Exclusivo de Entrega:**
   - Todos os relatórios semanais devem ser submetidos exclusivamente no formato **Microsoft Word (`.docx`)**, preservando rigorosamente o cabeçalho institucional, as tabelas, as fontes e a estrutura original do template fornecido pelo Prof. Me. Cristiano S. Negrão.
3. **Convenção Oficial de Nomenclatura de Arquivos:**
   - Padrão exigido: `APSII_Semana_Y_Grupo_X` ou `APSII_SXX_CARAFOOD.docx`.
   - Nomenclaturas oficiais padronizadas para o projeto **CaráFood**:
     - **S01:** `APSII_S01_CARAFOOD.docx`
     - **S02:** `APSII_S02_CARAFOOD.docx`
     - **S03:** `APSII_S03_CARAFOOD.docx`
     - **S04:** `APSII_S04_CARAFOOD.docx`
     - **S05:** `APSII_S05_CARAFOOD.docx`
     - **S06:** `APSII_S06_CARAFOOD.docx`
     - **S07:** `APSII_S07_CARAFOOD.docx`
     - **S08:** `APSII_S08_CARAFOOD.docx`
     - **S09:** `APSII_S09_CARAFOOD.docx`
     - **S10 (A2 Intermediária):** `APSII_S10_CARAFOOD.docx`
     - **S11:** `APSII_S11_CARAFOOD.docx`
     - **S12:** `APSII_S12_CARAFOOD.docx`
     - **S13:** `APSII_S13_CARAFOOD.docx`
     - **S14:** `APSII_S14_CARAFOOD.docx`
     - **S15 (Plano + Checklist):** `APSII_S15_CARAFOOD.docx` e `APSII_S15_CARAFOOD_CHECKLIST.docx`
     - **S16–S18 (A1 Final):** `APSII_A1_Entrega_Final_CARAFOOD.docx`
4. **Critérios de Avaliação e Pesos por Tarefa Semanal (0,50 ponto por semana):**

| Dimensão Avaliada | Peso (%) | Pontuação Máxima | Subcritérios de Correção do Prof. Me. Cristiano S. Negrão |
| :--- | :---: | :---: | :--- |
| **1. Artefato do Projeto** | **60%** | **0,30 pt** | • **Completude (0,10 pt):** Todos os itens, telas, prints e links solicitados estão presentes.<br>• **Aderência às Instruções (0,10 pt):** Seguiu exatamente o enunciado e os campos obrigatórios.<br>• **Coerência Técnica (0,10 pt):** Consistência entre problema, histórias de usuário, telas e banco de dados. |
| **2. Conteúdo Teórico** | **30%** | **0,15 pt** | • Respostas conceituais precisas, objetivas e contextualizadas ao domínio real do projeto (*CaráFood*), demonstrando domínio de Engenharia de Software. |
| **3. Qualidade, Reflexão e Prazo** | **10%** | **0,05 pt** | • **Evidência de Estudo/Reflexão (0,03 pt):** Redação autoral crítica e madura.<br>• **Organização e Nomeação (0,02 pt):** Uso correto do template `.docx` e nomeação padrão do arquivo. |
| **TOTAL SEMANAL** | **100%** | **0,50 pt** | Soma integral da entrega semanal auditada. |

---

## 🗓️ 3. CRONOGRAMA ANALÍTICO DE ENTREGAS (S01 A S18)

### 🔹 S01 — Registro Inicial de Projeto (`entregas_aps2/S01_Registro_Inicial/`)
- **Objetivo Pedagógico:** Formalizar a constituição da equipe, definir os papéis ágeis, delimitar o problema real de negócio e estabelecer o acordo operacional do semestre.
- **Requisitos de Artefato:**
  1. Tabela de identificação da equipe com papéis definidos (*PO/Tech Lead, Dev Back/Dados, QA/UX*).
  2. Definição do Tema/Domínio (*Gastronomia Hiperlocal e Turismo Inteligente em Caraguatatuba — CaráFood*) e Tipo de Aplicação (*Aplicação Web Progressiva / Responsive Web App em Next.js*).
  3. **Contexto e Problema (1 a 2 parágrafos densos):** A invisibilidade digital dos pequenos e médios estabelecimentos gastronômicos distribuídos pelos 53 bairros de Caraguatatuba (fora do eixo turístico óbvio), somada à manipulação de notas genéricas em plataformas estrangeiras e à falta de destaque aos insumos autóctones (Mexilhões da Cocanha - AMAPEC e Pescados do Camaroeiro - Colônia Z-8).
  4. **Ideia de Solução e Resultados Esperados (3 a 5 bullets):** Feed visual estilo rede social gastronômica, filtro despoluído para os 53 bairros em 4 Macro-Regiões, Cédula Oficial Digital do Festival *Caraguá a Gosto* com 5 critérios ponderados, e Concierge IA (*Chef Jacquin Praiano*).
  5. **Acordo de Trabalho da Equipe:** Ferramentas de gestão (GitHub Projects/Trello), versionamento (Git/GitHub), comunicação (WhatsApp/Discord) e ritos semanais.
- **Arquivo de Submissão:** `APSII_S01_CARAFOOD.docx`

---

### 🔹 S02 — Protótipo Inicial + Histórias de Usuário + Mapa de Páginas (`entregas_aps2/S02_Prototipo_Historias_Mapa/`)
- **Objetivo Pedagógico:** Levantar requisitos ágeis centrados no usuário, desenhar a arquitetura de informação inicial e consolidar conceitos fundamentais de métodos ágeis.
- **Requisitos de Artefato:**
  1. **Mínimo de 6 Histórias de Usuário (HUs)** rigorosamente no padrão Connextra (*"Como [ator], quero [ação], para [benefício]"*) com Critérios de Aceitação:
     - **3 HUs do Usuário Final (Comensal / Turista / Morador):**
       - `HU01`: Descoberta de pratos por bairro (53 bairros / 4 Macro-Regiões) e ocasião climática.
       - `HU02`: Visualização da ficha técnica detalhada do prato (*Master–Detail*), preço, selo *Caraguá a Gosto* e rota GPS.
       - `HU03`: Submissão de avaliação auditada na Cédula Digital de 5 critérios com acúmulo de Pontos Gourmet no Passaporte Caiçara.
     - **2 HUs do Gestor / Administrador da Plataforma ou Restaurante:**
       - `HU04`: Solicitação de credenciamento de novo estabelecimento gastronômico ou quiosque via formulário estruturado (`/contato`).
       - `HU05`: Acesso autenticado ao Painel Restrito (`/login` e `/moderation`) para auditoria de cédulas e proteção contra *review bombing* (Z-Score).
     - **1 HU de Outro Ator do Ecossistema (Produtor Caiçara AMAPEC / Pescador Colônia Z-8 / Curador Municipal):**
       - `HU06`: Destaque de rastreabilidade de origem (*Selo Mexilhão da Cocanha AMAPEC* e *Entreposto do Camaroeiro Z-8*) nos pratos cadastrados.
  2. **Wireframe / Protótipo das Telas Centrais:** Representação visual da Home/Landing, Catálogo/Feed Social e Página de Detalhe do Prato com Cédula de Avaliação.
  3. **Mapa de Navegação Simples (User Flow em Caixas):** Fluxograma conectando Home (`/`), Sobre Nós (`/sobre`), Contato/Credenciamento (`/contato`), Login (`/login`), Rankings (`/rankings`) e Detalhe do Prato (`/prato/[id]`).
  4. **Mini Texto de Rastreabilidade (5 a 10 linhas):** Explicação de como cada História de Usuário é materializada nas páginas do mapa de navegação.
- **Questões Teóricas Obrigatórias:**
  1. *"Em uma frase, diferencie Scrum e Kanban."*
  2. *"O que é backlog?"*
  3. *"O que é sprint?"*
- **Arquivo de Submissão:** `APSII_S02_CARAFOOD.docx`

---

### 🔹 S03 — Entrega da Home Page / Landing Page (`entregas_aps2/S03_Home_Landing_Page/`)
- **Objetivo Pedagógico:** Realizar a primeira transição concreta do documento estático para código web funcional publicado em produção.
- **Requisitos de Artefato:**
  1. Implementação real da Home Page (`src/app/page.tsx`) publicada em `https://foddtech.vercel.app/`.
  2. Elementos obrigatórios visíveis:
     - Título principal claro (*"CaráFood • Sabores Caiçaras & Roteiro dos 53 Bairros"*);
     - Texto de contexto/proposta de valor (2–3 linhas destacando a gastronomia autêntica da Cocanha ao Camaroeiro);
     - Destaques/Cards de benefícios e polos gastronômicos;
     - Call to Action (CTA) principal e botões de navegação funcionais.
  3. Prints de alta resolução da página em execução + URL pública da Vercel.
- **Requisitos Teóricos / Reflexão:**
  1. Rastreabilidade explícita com as Histórias de Usuário da S02 (`HU01`, `HU02`, `HU03`).
  2. **Mini Reflexão (5 a 8 linhas):** *"O que aprendemos ao traduzir o texto do projeto para uma página real?"*
- **Arquivo de Submissão:** `APSII_S03_CARAFOOD.docx`

---

### 🔹 S04 — Página "Sobre Nós" (`entregas_aps2/S04_Pagina_Sobre_Nos/`)
- **Objetivo Pedagógico:** Traduzir a fundamentação teórica e institucional do projeto para uma interface pública de comunicação clara com o usuário final.
- **Requisitos de Artefato:**
  1. Página `/sobre` (`src/app/sobre/page.tsx`) implementada e acessível pela Navbar global.
  2. Conteúdo obrigatório na tela: Nome oficial do negócio (**CaráFood**), história e patrimônio imaterial da gastronomia de Caraguatatuba (Azul-Marinho, Fazenda Marinha da Cocanha AMAPEC, Colônia Z-8 e Festival Caraguá a Gosto), Missão, Visão, Valores, Equipe de Engenharia e Fundamentação Acadêmica.
  3. Link direto em produção (`https://foddtech.vercel.app/sobre`) + prints da página.
- **Requisitos Teóricos / Reflexão:**
  1. Mapeamento De-Para conectando as seções da página `/sobre` às seções de *Contexto, Problema e Objetivos* do relatório técnico (S01/S02).
  2. **Questão Reflexiva (3 a 5 linhas):** *"O que muda quando o contexto técnico do relatório é traduzido para uma página 'Sobre Nós' amigável ao usuário?"*
- **Arquivo de Submissão:** `APSII_S04_CARAFOOD.docx`

---

### 🔹 S05 — Página "Entre em Contato" / Credenciamento (`entregas_aps2/S05_Pagina_Contato/`)
- **Objetivo Pedagógico:** Construir interfaces de entrada de dados (*Data Input Forms*) com validação client-side, estados de feedback e alinhamento ao modelo de negócios.
- **Requisitos de Artefato:**
  1. Página `/contato` (`src/app/contato/page.tsx`) implementada e acessível pela Navbar global.
  2. Formulário interativo estruturado contendo, no mínimo:
     - Nome do Responsável / Usuário;
     - Nome do Estabelecimento e Bairro (seleção entre os 53 bairros de Caraguatatuba);
     - E-mail Corporativo e Telefone/WhatsApp;
     - Categoria Gastronômica e Mensagem / Solicitação de Credenciamento;
     - Feedback visual imediato de submissão bem-sucedida com protocolo gerado.
  3. Link direto em produção (`https://foddtech.vercel.app/contato`) + prints da página.
- **Requisitos Teóricos / Reflexão:**
  1. Vinculação direta com as Histórias de Usuário (`HU04` e `HU06`).
  2. **Parágrafo Analítico (5 a 8 linhas):** Explicação do papel estratégico da página `/contato` no funil operacional do *CaráFood* (captação de restaurantes locais, pré-cadastro estruturado, triagem de curadoria e canal de suporte ao comensal).
- **Arquivo de Submissão:** `APSII_S05_CARAFOOD.docx`

---

### 🔹 S06 — Menu e Estrutura de Navegação (`entregas_aps2/S06_Menu_Navegacao/`)
- **Objetivo Pedagógico:** Garantir consistência arquitetural de navegação (*Global Navigation Bar*), prevenção de páginas órfãs e usabilidade responsiva (Desktop e Mobile Drawer).
- **Requisitos de Artefato:**
  1. Componente global `Navbar.tsx` presente em todas as rotas do sistema.
  2. Links obrigatórios operando sem quebra de rota: **Início / Home (`/`)**, **Sobre Nós (`/sobre`)**, **Contato / Credenciamento (`/contato`)**, **Rankings (`/rankings`)** e **Login / Acesso Restrito (`/login`)**.
  3. Mapa de Navegação atualizado refletindo fielmente as rotas reais implementadas no Next.js App Router.
- **Requisitos Teóricos / Reflexão:**
  1. **Justificativa Técnica de UX (5 a 8 linhas):** Explicação da hierarquia visual da barra de navegação (`sticky top-0 z-40`), escolha de rótulos curtos e semânticos, destaque visual da rota ativa (`usePathname`) e fluxo típico de navegação do usuário.
- **Arquivo de Submissão:** `APSII_S06_CARAFOOD.docx`

---

### 🔹 S07 — Tela de Login / Acesso Restrito (`entregas_aps2/S07_Tela_Login/`)
- **Objetivo Pedagógico:** Implementar controle de acesso, validação de credenciais e diferenciação de perfis de usuário (*Role-Based Access Control — RBAC*).
- **Requisitos de Artefato:**
  1. Página `/login` (`src/app/login/page.tsx`) funcional e integrada à Navbar global.
  2. Campos de entrada para **E-mail / Usuário** e **Senha**, seletor de perfil (*Comensal / Avaliador*, *Gestor de Restaurante* ou *Curador / Admin SECTUR*), botão de submissão e **feedback visual imediato** tanto para erro de credenciais quanto para autenticação bem-sucedida (com redirecionamento para o painel ou feed autenticado).
  3. Link direto em produção (`https://foddtech.vercel.app/login`) + prints dos estados de tela (inicial, erro de validação e sucesso).
- **Requisitos Teóricos / Reflexão:**
  1. **Análise de Segurança e Regras de Negócio (5 a 8 linhas):** Como a tela de Login se conecta aos perfis de acesso do *CaráFood* (garantindo que apenas comensais autenticados emitam cédulas válidas do festival e que gestores acessem métricas e moderação anti-fraude).
- **Arquivo de Submissão:** `APSII_S07_CARAFOOD.docx`

---

### 🔹 S08 — Lista Principal / Catálogo (`entregas_aps2/S08_Lista_Catalogo/`)
- **Objetivo Pedagógico:** Estruturar a exibição dinâmica de coleções de dados do domínio (*Data Grid / Card Feed*) com mecanismos de busca, filtragem e ordenação.
- **Requisitos de Artefato:**
  1. Catálogo principal de pratos e estabelecimentos implementado no Feed Social da Home (`/`) e na Tabela Analítica de Rankings (`/rankings`).
  2. Exibição estruturada dos atributos essenciais do domínio em cada card: **Foto Real do Prato, Nome do Prato, Nome do Restaurante, Bairro (entre os 53 de Caraguatatuba), Distância da Orla, Preço de Cardápio (`R$`), Super Nota Ponderada (`★`) e Selos de Origem (Caraguá a Gosto / AMAPEC / Colônia Z-8)**.
  3. Filtros funcionais por Polo/Bairro (barra dos 10 Polos + Modal das 4 Macro-Regiões), Categoria Gastronômica, Ocasião Climática e Busca Textual com normalização diacrítica.
- **Requisitos Teóricos / Reflexão:**
  1. **Parágrafo Técnico (5 a 8 linhas):** Relação direta do catálogo com as Histórias de Usuário de descoberta gastronômica (`HU01`) e aplicação da Lei de Hick-Hyman para evitar sobrecarga cognitiva.
- **Arquivo de Submissão:** `APSII_S08_CARAFOOD.docx`

---

### 🔹 S09 — Página de Detalhe — Padrão Master–Detail (`entregas_aps2/S09_Pagina_Detalhe/`)
- **Objetivo Pedagógico:** Implementar o padrão arquitetural *Master–Detail* com rotas dinâmicas parametrizadas (`/prato/[id]`) e chamadas para ação (*CTAs*) transacionais.
- **Requisitos de Artefato:**
  1. Rota dinâmica `src/app/prato/[id]/page.tsx` e `PratoDetailClient.tsx` acessada ao clicar em qualquer prato da listagem principal (S08).
  2. Exibição aprofundada do item selecionado: fotografia em alta definição, selo de rastreabilidade, ficha técnica completa, parecer gastronômico do Chef Jacquin, histórico de avaliações auditadas e pratos relacionados do mesmo bairro/categoria.
  3. **Presença obrigatória de CTAs claros e funcionais:**
     - **CTA 1:** *"Emitir Cédula Oficial Caraguá a Gosto / Avaliar Prato (+50 Pontos)"*;
     - **CTA 2:** *"Como Chegar (Abrir Rota GPS no Google Maps / Waze)"*;
     - **CTA 3:** *"Salvar no Roteiro Gastronômico de Caraguá"*.
- **Requisitos Teóricos / Reflexão:**
  1. **Explicação Arquitetural (5 a 8 linhas):** Conceito do padrão *Master–Detail*, seus ganhos de usabilidade (progressão gradual de informação — *Progressive Disclosure*) e como ele estrutura as operações fundamentais de CRUD (*Read by ID, Create Review, Update Rating*).
- **Arquivo de Submissão:** `APSII_S09_CARAFOOD.docx`

---

### 🔹 S10 / A2 — Entrega Intermediária: Relatório Parcial Consolidado (`entregas_aps2/S10_A2_Entrega_Intermediaria/`)
- **Objetivo Pedagógico:** Consolidar de forma coesa e sistêmica todas as entregas da primeira metade do semestre (S01 a S09), comprovando maturidade de engenharia de software e alinhamento entre documentação e código.
- **Estrutura Obrigatória de Capítulos:**
  - **Capítulo 1 — Contexto, Problema e Objetivos:** Caracterização socioeconômica e gastronômica de Caraguatatuba, dor do mercado e objetivos geral e específicos do *CaráFood*.
  - **Capítulo 2 — Histórias de Usuário e Mapa de Páginas:** Quadro consolidado das HUs (`HU01` a `HU06`), personas e diagrama de arquitetura de navegação.
  - **Capítulo 3 — Protótipo e Páginas Implementadas:** Documentação visual e técnica das **6 superfícies obrigatórias** em produção (1. Home/Landing, 2. Sobre Nós, 3. Contato/Credenciamento, 4. Login/Acesso Restrito, 5. Lista/Catálogo e Rankings, 6. Página de Detalhe `/prato/[id]`).
  - **Capítulo 4 — Navegação e Fluxos Principais:** Detalhamento da jornada ponta a ponta do usuário na plataforma.
  - **Capítulo 5 — Análise Parcial do Projeto:** Conquistas alcançadas até a S10, desafios técnicos superados e plano de ataque do Backlog para a reta final até a A1 (S11–S16).
- **Arquivo de Submissão:** `APSII_S10_CARAFOOD.docx`

---

### 🔹 S11 — Melhoria Contínua e Versionamento (`entregas_aps2/S11_Melhoria_Versionamento/`)
- **Objetivo Pedagógico:** Praticar refatoração orientada a feedback, controle de versão semântico (*Conventional Commits*) e evolução incremental de interface.
- **Requisitos de Artefato:**
  1. Implementação documentada de **pelo menos 3 melhorias estruturais concretas** no *CaráFood*:
     - **Melhoria 1 (Despoluição Cognitiva dos 53 Bairros):** Transformação da lista linear de 54 círculos na Arquitetura em 2 Camadas (10 Polos Curados na barra rápida + Modal Explorador com Mapa Vetorial e 4 Macro-Regiões).
     - **Melhoria 2 (Hierarquia de Camadas e Desobstrução Fotográfica):** Reengenharia do *Stacking Context* (`z-10` a `z-50`) e conversão dos selos dos pratos para linha horizontal translúcida (`max-w-[92%]`).
     - **Melhoria 3 (Física de Animação 60fps "Coucou" e Modo Reels Vertical):** Protagonismo interativo do Chef Jacquin Praiano e visualização vertical 9:16 em tela cheia.
  2. **Changelog Estruturado ("Antes $\rightarrow$ Depois")** com justificativa técnica e impacto na experiência do usuário.
  3. Histórico real de commits do repositório Git (`git log`) comprovando a evolução rastreável.
- **Arquivo de Submissão:** `APSII_S11_CARAFOOD.docx`

---

### 🔹 S12 — Testes de Usabilidade (`entregas_aps2/S12_Testes_Usabilidade/`)
- **Objetivo Pedagógico:** Validar empiricamente a interface com usuários reais, medir tempos de execução de tarefas, mapear pontos de fricção e priorizar melhorias de backlog.
- **Requisitos de Artefato:**
  1. Planejamento e execução documentada de **3 Cenários de Teste de Usabilidade** com participantes distintos:
     - **Cenário 1 (Descoberta Hiperlocal):** Encontrar um prato autêntico de Mexilhão na Praia da Cocanha usando o explorador territorial e verificar seu preço.
     - **Cenário 2 (Fluxo Master–Detail e Auditoria):** Acessar a ficha técnica do *Azul-Marinho Caiçara*, abrir a Cédula Oficial do Festival *Caraguá a Gosto* e emitir uma nota ponderada nos 5 critérios.
     - **Cenário 3 (Fluxo B2B de Credenciamento):** Localizar a página de Contato/Credenciamento e submeter o cadastro de um novo quiosque da Praia de Martim de Sá.
  2. Tabela de resultados contendo: Perfil do Testador, Tarefa, Tempo Cronometrado (segundos), Taxa de Sucesso, Hesitações Observadas e Coleta de Feedback.
  3. **Matriz de Priorização (Método MoSCoW e Ranking Top 3)** das melhorias derivadas dos testes.
- **Arquivo de Submissão:** `APSII_S12_CARAFOOD.docx`

---

### 🔹 S13 — Deploy Inicial + Banco de Dados Funcionando (`entregas_aps2/S13_Deploy_Banco/`)
- **Objetivo Pedagógico:** Comprovar a publicação em nuvem (*Cloud PaaS*) integrada à persistência real de dados em Sistema Gerenciador de Banco de Dados Relacional (SGBD PostgreSQL).
- **Requisitos de Artefato:**
  1. Aplicação publicada em produção na Vercel (`https://foddtech.vercel.app/`).
  2. **Fluxo Completo de Persistência em Banco de Dados Relacional (PostgreSQL via Supabase/Neon + Prisma ORM e API Routes Next.js):**
     - **Fluxo 1 (`POST /api/reviews` e `GET /api/reviews`):** Gravação e leitura de Cédulas Oficiais de Avaliação de Pratos com cálculo ponderado dos 5 critérios e validação Z-Score na tabela `reviews`.
     - **Fluxo 2 (`POST /api/credenciamento` e `GET /api/credenciamento`):** Persistência das solicitações de contato e credenciamento de estabelecimentos dos 53 bairros na tabela `merchant_leads`.
  3. Documentação completa do pipeline de deploy (GitHub $\rightarrow$ Vercel), scripts DDL/Prisma Schema, variáveis de ambiente (`DATABASE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `GEMINI_API_KEY`) e evidências do banco operando.
- **Arquivo de Submissão:** `APSII_S13_CARAFOOD.docx`

---

### 🔹 S14 — Domínios, DNS e URL Amigável (`entregas_aps2/S14_DNS_URL_Amigavel/`)
- **Objetivo Pedagógico:** Compreender a infraestrutura de resolução de nomes da Internet (DNS), certificados criptográficos TLS/SSL e semântica de URLs (*Clean URLs / RESTful Routing*).
- **Requisitos de Artefato:**
  1. **Estudo Conceitual Estruturado (1 página):** Definição técnica de Domínio (TLD, SLD, Subdomínio), funcionamento hierárquico do DNS (Root Servers, TLD Servers, Authoritative Name Servers, registros `A`, `AAAA`, `CNAME`, `TXT`) e quadro comparativo entre Domínio Próprio Registro.br (`carafood.com.br`) vs. Subdomínio PaaS Gratuito (`foddtech.vercel.app`).
  2. Registro oficial da URL amigável de produção e das rotas semânticas do sistema (`/`, `/sobre`, `/contato`, `/login`, `/rankings`, `/prato/[id]`).
  3. **Reflexão Técnica (5 a 8 linhas):** Impacto de URLs limpas, HTTPS/SSL e subdomínios estruturados na segurança cibernética, indexação SEO e confiança do usuário final.
- **Arquivo de Submissão:** `APSII_S14_CARAFOOD.docx`

---

### 🔹 S15 — Checklist Final & Plano de Apresentação (`entregas_aps2/S15_Checklist_Apresentacao/`)
- **Objetivo Pedagógico:** Auditar 100% dos entregáveis técnicos antes da banca final e estruturar um roteiro de apresentação executiva cronometrado (15 a 20 minutos) com participação equilibrada de todos os integrantes.
- **Requisitos de Artefato (Dupla Entrega Obrigatória):**
  1. **Arquivo 1 (`APSII_S15_CARAFOOD.docx` — Plano de Apresentação e Autoavaliação):**
     - Cronograma minuto a minuto da apresentação (15–20 min) dividindo exatamente as falas e demonstrações ao vivo entre **Gabriel Rodrigues**, **Matheus Vicente** e **Pedro Simone**.
     - Autoavaliação crítica e honesta da equipe (principais forças arquiteturais, pontos de atenção e lições aprendidas no semestre).
  2. **Arquivo 2 (`APSII_S15_CARAFOOD_CHECKLIST.docx` — Checklist Oficial de Entrega Final):**
     - Verificação item a item de todas as telas obrigatórias, navegação sem links quebrados, persistência em banco de dados, responsividade e documentação.
- **Arquivos de Submissão:** `APSII_S15_CARAFOOD.docx` e `APSII_S15_CARAFOOD_CHECKLIST.docx`

---

### 🔹 S16, S17 e S18 / A1 — Entrega Final Consolidada e Defesa em Banca (`entregas_aps2/S16_A1_Entrega_Final/`)
- **Objetivo Pedagógico:** Entregar o Dossiê Técnico Definitivo de Engenharia de Software (Avaliação A1 — 5,0 pontos) consolidando requisitos, arquitetura, banco de dados, testes e sistema em produção.
- **Estrutura Completa Exigida no Template Oficial A1:**
  1. **Identificação do Projeto, Equipe e Links Oficiais** (Produção Vercel + Repositório GitHub).
  2. **Contexto, Problema e Justificativa Regional** (Os 53 bairros de Caraguatatuba, AMAPEC Cocanha, Colônia Z-8 Camaroeiro e Festival Caraguá a Gosto).
  3. **Objetivos Geral e Específicos (SMART).**
  4. **Escopo do MVP (Implementado) vs. Roadmap Futuro (Backlog Pós-MVP).**
  5. **Especificação de Requisitos:**
     - Requisitos Funcionais (`RF01` a `RF12`);
     - Requisitos Não Funcionais (`RNF01` a `RNF08` — Desempenho, Segurança, Usabilidade WCAG 2.2 AAA, Disponibilidade);
     - Regras de Negócio (`RN01` a `RN06` — Cálculo Ponderado da Cédula Oficial, Meia-Vida Exponencial $\lambda = \ln(2)/30$, Filtro Anti-Bot Z-Score $|Z| \le 2.5$).
  6. **Histórias de Usuário Consolidadas e Rastreabilidade de Telas.**
  7. **Arquitetura do Sistema:** Diagrama em 3 Camadas (Apresentação Next.js 14 / Lógica de Negócio & IA / Persistência PostgreSQL & PostGIS).
  8. **Projeto de Banco de Dados:** Modelo Entidade-Relacionamento (DER) e Dicionário de Dados das Tabelas (`users`, `neighborhoods`, `restaurants`, `dishes`, `reviews`, `merchant_leads`).
  9. **Qualidade de Software:** Casos de Teste Funcionais (`CT01` a `CT10`) e Consolidação dos Testes de Usabilidade.
  10. **Manual de Implantação (Deploy) e Instruções de Execução Local.**
- **Composição da Nota Final A1 (5,0 pontos):**
  - **30% (1,5 pt):** Documentação Técnica Consolidada (`.docx`);
  - **20% (1,0 pt):** Apresentação Oral e Arguição Individual na Banca;
  - **20% (1,0 pt):** Domínio e Rigor do Conteúdo Técnico de Engenharia de Software;
  - **30% (1,5 pt):** Sistema Funcional em Produção com Banco de Dados Ativo.
- **Arquivo de Submissão:** `APSII_A1_Entrega_Final_CARAFOOD.docx`
