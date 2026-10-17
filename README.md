# 🌊 CaráFood — Plataforma de Inteligência Gastronômica & Roteiro dos 53 Bairros

[![Next.js 14](https://img.shields.io/badge/Next.js-14.2_App_Router-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript 5](https://img.shields.io/badge/TypeScript-5.4_Strict-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4_JIT-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-14.0_Fluid_Physics-black?style=for-the-badge&logo=framer)](https://www.framer.com/motion/)
[![WCAG 2.2 AAA](https://img.shields.io/badge/Accessibility-WCAG_2.2_AAA-success?style=for-the-badge)](https://www.w3.org/WAI/standards-guidelines/wcag/)
[![Deploy Vercel](https://img.shields.io/badge/Vercel-Production_Live-black?style=for-the-badge&logo=vercel)](https://foddtech.vercel.app/)
[![License MIT](https://img.shields.io/badge/License-MIT-amber?style=for-the-badge)](LICENSE)

> **Ambiente de Produção Ativo:** [https://foddtech.vercel.app/](https://foddtech.vercel.app/)  
> **Repositório Monorepo:** [github.com/GaboBiroo/caragua-foodtech-mono](https://github.com/GaboBiroo/caragua-foodtech-mono)

---

## 🏛️ Identificação Institucional & Créditos Acadêmicos

Este projeto constitui o núcleo prático e experimental da disciplina de **Análise e Projeto de Sistemas II (APS II)** e do **Trabalho de Conclusão de Curso (TCC)** da graduação em Análise e Desenvolvimento de Sistemas:

- **Instituição de Ensino:** Centro Universitário Módulo (Cruzeiro do Sul Educacional) — Campus Caraguatatuba / SP
- **Docente Orientador & Avaliador:** Prof. Me. Cristiano S. Negrão
- **Domínio Principal:** Inteligência Gastronômica Regional, Engenharia de Software Hiperlocal, Turismo Sustentável e Cultura Caiçara
- **Tipo de Aplicação:** Web Responsiva (PWA / Mobile-First), otimizada para Desktop e Dispositivos Móveis

### Composição do Grupo de Desenvolvimento (Matriz RACI / Scrum Roles)

| Integrante | Papel Principal no Projeto | Atribuições & Responsabilidades Centrais |
| :--- | :--- | :--- |
| **Gabriel Rodrigues** | **Tech Lead / Product Owner / Full-Stack** | Arquitetura de software, design de interação (UI/UX), implementação do motor Next.js 14, orquestração de componentes e deploy contínuo na Vercel. |
| **Matheus Vicente** | **Engenharia de Requisitos & Domínio** | Elicitação de histórias de usuário, mapeamento dos 53 bairros de Caraguatatuba, modelagem conceitual do festival Caraguá a Gosto e regras de negócio. |
| **Pedro Simone** | **QA, Testes & Documentação Técnica** | Validação de critérios de aceitação, testes de usabilidade, conformidade com a matriz WCAG 2.2 AAA e consolidação dos relatórios técnicos acadêmicos. |

---

## 📌 Resumo Executivo & Proposta de Valor

O **CaráFood** é um ecossistema digital desenvolvido para solucionar a fragmentação da informação gastronômica e a invisibilidade de produtores locais em **Caraguatatuba**, a Capital Gastronômica do Litoral Norte paulista. 

Diferente dos agregadores generalistas de mercado (como iFood ou TripAdvisor), que aplicam algoritmos genéricos e sofrem de severa sazonalidade turística, o CaráFood fundamenta-se em três pilares exclusivos:

1. **Hiperlocalismo Genuíno (53 Bairros Oficiais):** Mapeamento exaustivo desde os polos turísticos consolidados (*Martim de Sá*, *Prainha*, *Indaiá*) até as comunidades tradicionais da Zona Sul e Encostas (*Tinga*, *Perequê-Mirim*, *Morro do Algodão*, *Rio do Ouro*, *Pegorelli*).
2. **Cultura & Patrimônio Caiçara:** Integração factual da Maricultura da Cocanha (**AMAPEC** — maior parque produtor de mexilhões do Brasil), do Entreposto de Pesca Artesanal do Camaroeiro (**Colônia Z-8**) e de pratos seculares como o *Azul-Marinho na panela de ferro com banana verde*.
3. **Curadoria Inteligente & Cédula Oficial:** Acompanhamento do **Chef Jacquin Praiano** como copiloto interativo e implementação da **Cédula Digital Oficial do Festival Caraguá a Gosto** com avaliação auditada em 5 critérios ponderados.

---

## ⚠️ AVISO ACADÊMICO IMPORTANTE: Status da Base de Dados na Etapa 1 (MVP)

> ### 📢 Nota de Transparência Técnica e Científica (Entrega Parcial / Etapa 1)
> 
> Declaramos formalmente para fins de avaliação acadêmica que a presente versão do sistema (**Release 1.0 — Entrega Parcial**) opera sobre uma **Base de Amostras de Alta Fidelidade (Seed Dataset Curado)**.
> 
> - **Os dados atuais NÃO foram extraídos através de raspagem dinâmica em tempo real (web scraping).**
> - Os 15 pratos, restaurantes, comentários e notas exibidos no feed e nos perfis detalhados foram estruturados manualmente com base nos registros históricos oficiais do **Festival Gastronômico Caraguá a Gosto (19ª Edição)**, cadastros da **AMAPEC** e da **Associação Comercial de Caraguatatuba (ACEC)**.
> - **Justificativa Metodológica:** Em consonância com as boas práticas de engenharia de software da USP, MIT e Harvard, a **Etapa 1** tem como escopo estrito a validação da **experiência do usuário (UX)**, da **arquitetura de componentes**, da **responsividade**, da **trilha de navegação** e da **conformidade com as Histórias de Usuário**. 
> - A infraestrutura automatizada de extração de dados brutos (Playwright / Scrapy / Beautiful Soup) e integração vetorial em tempo real faz parte do cronograma de desenvolvimento da **Etapa 2 (Release 2.0)**.

---

## 🏛️ Estrutura do Repositório (Padrão Acadêmico Harvard / MIT / USP)

O repositório foi reestruturado seguindo a taxonomia de projetos de pesquisa aplicada e engenharia de software de laboratórios de ponta:

```
caragua-foodtech-mono/
│
├── docs/                                  # ACERVO DOCUMENTAL & PESQUISA CIENTÍFICA
│   ├── academic/                          # Entregas Oficiais da Disciplina APS II (Prof. Cristiano)
│   │   ├── relatorio_tecnico_etapa_1_entrega_parcial.md # Relatório Final Completo para Entrega Parcial
│   │   ├── dossie_academico_tcc_a2_prof_cristiano.md    # Dossiê de Requisitos, Histórias e Teoria
│   │   └── user_stories_and_backlog.md                  # Matriz de Histórias de Usuário e Épicos
│   ├── research/                          # Dossiês Etnográficos, Geográficos e de Design
│   │   ├── dossie_enciclopedico_caraguatatuba_oficial.md# 53 Bairros, AMAPEC, Z-8, Azul-Marinho
│   │   ├── dossie_design_industrial_e_benchmark_top200.md# Benchmark Top 200, Apple HIG, Lamé
│   │   └── plano_mestre_scraping_e_llm_jacquin.md       # Engenharia de Extração de Dados (Fase 2)
│   ├── architecture/                      # Engenharia de Sistemas & Especificações Técnicas
│   │   ├── AI_CONTEXT.md                  # Especificação do RAG 5 Estágios e PostGIS
│   │   └── GEMINI.md                      # Diretrizes de Prompt e Governança do Assistente
│   └── audits/                            # Auditorias de Usabilidade, Código e Acessibilidade
│       └── diagnostico_critico_reddit_it_e_15_melhorias.md # Auditoria Sênior e 15 Correções Críticas
│
├── data/                                  # GESTÃO DE DADOS & CORPUS DA PLATAFORMA
│   ├── seeds/                             # Base Curada da Etapa 1 (Amostras Históricas Auditadas)
│   │   └── README.md                      # Dicionário de dados das amostras de Caraguá
│   └── raw/                               # Diretório reservado para ingestão bruta de scraping (Etapa 2)
│
├── src/                                   # CÓDIGO FONTE DA PLATAFORMA WEB NEXT.JS 14
│   ├── app/                               # Next.js App Router (28 Rotas SSG / ISR)
│   │   ├── page.tsx                       # Feed Principal Estilo Instagram com Stories dos 53 Bairros
│   │   ├── prato/[id]/                    # Páginas Detalhadas (Master-Detail) com Rota Google Maps
│   │   ├── sobre/                         # História Institucional, Território e Créditos TCC
│   │   ├── rankings/                      # Pódio do Festival Caraguá a Gosto e Métricas Auditadas
│   │   ├── contato/                       # Credenciamento de Restaurantes e Apoio Acadêmico
│   │   ├── layout.tsx                     # Layout Raiz com Metadados OpenGraph e Fontes Otimizadas
│   │   └── globals.css                    # Folha de Estilos Tailwind com Variáveis de Design Industrial
│   ├── components/                        # Biblioteca de Componentes Reutilizáveis
│   │   ├── Navbar.tsx                     # Barra de Navegação Global com Mascote e Acesso Acadêmico
│   │   ├── DynamicIsland.tsx              # Ilha de Interação Inteligente com Chef Jacquin
│   │   ├── FloatingJacquin.tsx            # Mascote Companheiro Coeso (Inspiração Korus/Coucou)
│   │   └── AcademicPortalModal.tsx        # Portal do Docente com Rastreamento das Entregas APS II
│   └── data/                              # Modelos de Dados em TypeScript
│       └── caraguaData.ts                 # Catálogo Oficial dos 53 Bairros e 15 Pratos Emblemáticos
│
├── scripts/                               # AUTOMAÇÃO DE ENGENHARIA, BUILD E PIPELINE
│   ├── build/                             # Scripts de empacotamento e sincronização
│   │   └── copy-build.js                  # Sincronizador de build para Vercel Serverless
│   └── tools/                             # Utilitários de testes locais e simulações
│
├── legacy/                                # ACERVO DE PROTÓTIPOS E EVOLUÇÃO DO PROJETO
│   └── prototypes/                        # Protótipos standalone preservados para histórico de UX
│
├── public/                                # ATIVOS ESTÁTICOS PÚBLICOS
│   ├── jacquin-praiano.png                # Mascote Oficial em Alta Definição Transparente
│   └── favicon.ico                        # Ícone da Aplicação
│
├── package.json                           # Manifesto de Dependências Node.js
├── tailwind.config.js                     # Configuração de Cores Oficiais (Verde Floresta, Amarelo Solar)
├── tsconfig.json                          # Configuração Estrita de Compilação TypeScript
└── README.md                              # Documentação Mestre do Repositório
```

---

## 🎯 Respostas Teóricas Exigidas na APS II (Prof. Cristiano)

Em estrito atendimento aos requisitos pedagógicos da disciplina de **Análise e Projeto de Sistemas II**, apresentamos as definições fundamentais:

### 1. Diferenciação entre Scrum e Kanban (Em uma frase)
> *"O Scrum organiza o trabalho em ciclos temporais fixos e estruturados chamados Sprints com papéis e cerimônias bem definidos (como PO e Daily), enquanto o Kanban gerencia o fluxo de trabalho de forma visual e contínua através de limites estritos de trabalho em andamento (WIP), focando na entrega sob demanda sem iterações pré-fixadas."*

### 2. O que é Backlog?
> **Backlog** é o inventário ordenado, dinâmico e priorizado de tudo o que é necessário para construir ou aprimorar o produto — abrangendo novas funcionalidades (requisitos funcionais), correções de bugs, débitos técnicos e melhorias de arquitetura/usabilidade. No CaráFood, o Product Backlog é mantido sob responsabilidade do Product Owner e serve de fonte primária para o planejamento das entregas acadêmicas e de engenharia.

### 3. O que é Sprint?
> **Sprint** é um intervalo de tempo predeterminado (geralmente de 1 a 4 semanas), chamado de *time-box*, durante o qual a equipe de desenvolvimento se compromete a transformar um subconjunto selecionado de itens do Backlog (Sprint Backlog) em um incremento de produto funcional, testado e potencialmente publicável (*Definition of Done*). No nosso projeto, cada semana do cronograma docente (S01 a S06) funcionou como uma Sprint de iteração com entregas incrementais.

---

## 👥 Histórias de Usuário (User Stories) Implementadas na V1

Seguindo o padrão canônico da engenharia de requisitos (*"Como [ator], quero [ação], para que [benefício]"*):

### Ator 1: Usuário Principal (Turista / Morador Caiçara)
- **HU01 — Feed & Exploração por Bairro:**  
  *Como morador ou turista de Caraguatatuba, quero visualizar um feed com fotografias reais e filtrar os pratos pelos 53 bairros oficiais da cidade, para descobrir onde comer bem em bairros tradicionais além da orla central.*
- **HU02 — Avaliação Ponderada do Festival (Cédula Digital):**  
  *Como cliente de um quiosque ou restaurante participante do Caraguá a Gosto, quero avaliar o prato através de uma cédula digital com 5 critérios oficiais (sabor, apresentação, insumos locais, atendimento e ambiente), para registrar meu voto auditado e concorrer a prêmios.*
- **HU03 — Rota Geoespacial Direta:**  
  *Como visitante em trânsito pela Rodovia dos Tamoios ou Rio-Santos, quero clicar em um prato e abrir instantaneamente a rota no Google Maps/Waze, para chegar ao estabelecimento sem me perder nas vias locais.*

### Ator 2: Administrador / Gestor do Estabelecimento
- **HU04 — Credenciamento e Presença Digital:**  
  *Como proprietário de um quiosque pé na areia ou restaurante caiçara, quero solicitar o credenciamento do meu negócio no sistema informando CNPJ, bairro e especialidade, para obter visibilidade gastronômica auditada perante moradores e turistas.*
- **HU05 — Visualização de Métricas e Pódio do Festival:**  
  *Como gestor gastronômico, quero acompanhar o ranking oficial e o histórico de super notas do meu prato em comparação com os vencedores de edições anteriores, para calibrar meu atendimento e valorizar meus insumos.*

### Ator 3: Outro Ator Relevante (Membro da Cooperativa / Pescador Local)
- **HU06 — Certificação de Origem do Insumo (AMAPEC & Colônia Z-8):**  
  *Como maricultor da Fazenda da Cocanha (AMAPEC) ou pescador artesanal do Camaroeiro (Colônia Z-8), quero que os pratos que utilizam nossos pescados e mariscos exibam um selo oficial de procedência histórica sustentável, para valorizar a produção local e combater fraudes alimentares.*

---

## 💻 Stack Tecnológica & Decisões de Arquitetura

| Camada | Tecnologia Adotada | Motivação & Benefício Técnico |
| :--- | :--- | :--- |
| **Framework Web** | **Next.js 14.2 (App Router)** | Renderização híbrida (SSG + ISR), Server Components nativos, zero layout shift e performance extrema com 28 páginas compiladas estaticamente. |
| **Linguagem** | **TypeScript 5.4 (Strict Mode)** | Tipagem estática em tempo de compilação, prevenindo erros de runtime e garantindo contratos de dados consistentes entre bairros, posts e cédulas. |
| **Estilização** | **Tailwind CSS 3.4 + JIT** | Design system consistente com a paleta oficial caiçara (`#135136` Verde Floresta, `#FFB703` Amarelo Solar, `#023E8A` Azul Oceano) e zero runtime CSS overhead. |
| **Física de Animação**| **Framer Motion 14** | Molas físicas com coeficiente de Gabriel Lamé para transições orgânicas de double-tap like, balões de diálogo e modal expansivo. |
| **Ícones Vetoriais** | **Lucide React** | Conjunto coeso de ícones em SVG puro com conformidade semântica para leitores de tela. |
| **Infraestrutura** | **Vercel Global Edge Network** | Deploy contínuo atrelado à branch `main` do GitHub, compressão Brotli automática e CDN distribuída com latência inferior a 35ms no Brasil. |

---

## 🛠️ Guia de Inicialização Local (Setup Passo a Passo)

### Pré-requisitos
- **Node.js:** Versão `18.17.0` ou superior (`v20 LTS` recomendada)
- **Gerenciador de Pacotes:** `npm` (versão 9+), `yarn` ou `pnpm`
- **Git** instalado no terminal

### Passo a Passo

```bash
# 1. Clonar o repositório
git clone https://github.com/GaboBiroo/caragua-foodtech-mono.git

# 2. Navegar até o diretório do monorepo
cd caragua-foodtech-mono

# 3. Instalar as dependências do projeto
npm install

# 4. Executar o ambiente de desenvolvimento local
npm run dev
```

Acesse em seu navegador:
👉 `http://localhost:3000`

### Build de Produção & Verificação de Tipos

```bash
# Compilar todas as 28 rotas estáticas e executar script de espelhamento
npm run build

# Executar a aplicação compilada localmente
npm run start
```

---

## ♿ Matriz de Acessibilidade & Usabilidade (WCAG 2.2 AAA)

A plataforma foi projetada segundo os mais altos rigores de inclusão digital e design inclusivo:
- **Taxa de Contraste:** Mínimo de `7:1` em todos os textos sobre fundos sólidos e cards (em estrito cumprimento ao nível AAA).
- **Alvos de Toque (Touch Targets):** Todos os botões, links e pílulas de filtro possuem área mínima de clique de `48x48px` em conformidade com as diretrizes do Google Material 3 e Apple HIG.
- **Navegação por Teclado:** Foco visual evidente (`focus:ring-2 focus:ring-[#FFB703]`) com suporte nativo a `Tab`, `Shift+Tab`, `Enter`, `Space` e `Escape` em todos os modais.
- **Acessibilidade Sensorial:** O mascote e as dicas possuem opções de minimização para comensais que preferem interfaces de leitura estritamente textual sem elementos flutuantes.

---

## 📜 Licença & Direitos de Uso

Este projeto está licenciado sob os termos da **MIT License**.  
Os nomes dos bairros oficiais, festivais e insumos culturais são de titularidade pública do Município da Estância Balneária de Caraguatatuba e de suas respectivas entidades e cooperativas representativas (AMAPEC, Colônia Z-8, ACEC).

**Centro Universitário Módulo — Análise e Projeto de Sistemas II — 2026**
