# 📄 ESPELHO OFICIAL DO TEMPLATE (.DOCX) — SEMANA 10 (S10 / A2 INTERMEDIÁRIA)
**Arquivo de Destino:** `APSII_S10_CARAFOOD.docx`  
*(Copie e cole os 5 capítulos consolidados abaixo diretamente no template Word oficial do Relatório Parcial de Projeto do Prof. Me. Cristiano S. Negrão)*

---

## 🏛️ IDENTIFICAÇÃO INSTITUCIONAL DO RELATÓRIO PARCIAL (A2)

| Campo do Template | Conteúdo Oficial Preenchido |
| :--- | :--- |
| **Instituição de Ensino** | Centro Universitário Módulo — Caraguatatuba/SP |
| **Disciplina** | Análise e Projeto de Sistemas II (APS II) — Entrega Intermediária Consolidada (S10 / A2) |
| **Docente Orientador / Avaliador** | Prof. Me. Cristiano S. Negrão |
| **Nome Oficial do Sistema** | **CaráFood (Caraguá FoodTech)** — *Ecossistema Hiperlocal de Descoberta Gastronômica, Auditoria Cultural (Caraguá a Gosto) e Curadoria IA dos 53 Bairros de Caraguatatuba* |
| **Equipe e Papéis** | • **Gabriel Rodrigues:** Product Owner (PO), Tech Lead & Desenvolvedor Front-End / IA<br>• **Matheus Vicente:** Engenheiro de Dados, Desenvolvedor Back-End & Curadoria Territorial<br>• **Pedro Simone:** Engenheiro de Qualidade (QA), UX Researcher & Documentação Técnica |
| **URL Oficial em Produção** | [https://foddtech.vercel.app/](https://foddtech.vercel.app/) |
| **Repositório GitHub** | `https://github.com/GaboBiroo/caragua-foodtech-mono` |

---

## 📖 CAPÍTULO 1 — CONTEXTO, PROBLEMA E OBJETIVOS DO PROJETO

### 1.1 Contexto Regional e Problema de Negócio
Caraguatatuba possui uma das identidades gastronômicas mais ricas do litoral brasileiro, sustentada por **53 bairros oficiais** que abrigam desde a maricultura sustentável de mexilhões na **Praia da Cocanha (Associação AMAPEC)** e a pesca artesanal diária no **Entreposto do Camaroeiro (Colônia Z-8 "Benjamin Constant")**, até o patrimônio imaterial do **Azul-Marinho na panela de ferro** e o festival anual **Caraguá a Gosto**. Contudo, pequenos e médios restaurantes, quiosques de praia e bistrôs de bairros como Tinga, Rio do Ouro, Porto Novo, Massaguaçu e Tabatinga enfrentam grave **invisibilidade digital** diante de aplicativos genéricos de entrega que priorizam apenas redes de *fast-food* na região central. Simultaneamente, os consumidores sofrem com avaliações online facilmente manipuláveis por *bots*, notas defasadas de anos anteriores e ausência de transparência nos preços de cardápio.

### 1.2 Objetivo Geral
Desenvolver e implantar o **CaráFood**, uma plataforma web responsiva (*PWA*) de descoberta social-gastronômica e auditoria de avaliações que mapeia os **53 bairros de Caraguatatuba**, destaca a rastreabilidade de insumos locais (*AMAPEC Cocanha* e *Colônia Z-8*) e aplica algoritmos matemáticos de ponderação e meia-vida temporal inspirados na cédula oficial do festival *Caraguá a Gosto*.

### 1.3 Objetivos Específicos
1. Estruturar um **Explorador Territorial em 2 Camadas** (10 Polos Curados na barra rápida + Modal Cartográfico Vetorial com as 4 Macro-Regiões dos 53 bairros) que elimine a sobrecarga cognitiva do usuário;
2. Implementar a **Cédula Oficial Digital de 5 Critérios Ponderados** (*Sabor: 35%, Cocção: 20%, Originalidade: 15%, Atendimento: 15%, Ambiente: 15%*) acoplada ao decaimento exponencial de 30 dias ($\lambda = \ln(2)/30$) e filtro anti-bot *Z-Score*;
3. Construir o fluxo completo **Master–Detail** entre o Catálogo Principal (`/`) e as fichas técnicas de pratos (`/prato/[id]`), integrando rotas GPS e o assistente interativo *Chef Jacquin Praiano*;
4. Disponibilizar os portais institucionais de **Sobre Nós (`/sobre`)**, **Credenciamento B2B (`/contato`)** e **Login / Controle de Acesso (`/login`)** com persistência em banco de dados relacional.

---

## 👥 CAPÍTULO 2 — HISTÓRIAS DE USUÁRIO E MAPA DE PÁGINAS

### 2.1 Quadro Consolidado de Histórias de Usuário (S02)

| ID | Ator / Persona | Descrição da História (*Como... Quero... Para...*) | Rotas que Materializam a HU |
| :--- | :--- | :--- | :--- |
| **HU01** | **Usuário Final** *(Turista / Morador)* | **Como** turista ou morador em Caraguatatuba, **quero** filtrar os pratos pelos 53 bairros (organizados em 10 Polos e 4 Macro-Regiões) e pela ocasião climática, **para** encontrar rapidamente onde comer perto de mim sem poluição visual. | `/` e `/rankings` |
| **HU02** | **Usuário Final** *(Comensal)* | **Como** cliente interessado em um prato, **quero** acessar sua Página de Detalhe (*Master–Detail*) com foto real, preço exato, dica do Chef Jacquin e rota GPS no Google Maps, **para** tomar minha decisão com total transparência. | `/prato/[id]` |
| **HU03** | **Usuário Final** *(Avaliador)* | **Como** frequentador do festival *Caraguá a Gosto*, **quero** avaliar o prato nos 5 critérios oficiais ponderados, **para** colaborar com um ranking justo e ganhar Pontos Gourmet no meu Passaporte Caiçara. | `/`, `/prato/[id]` e `/rankings` |
| **HU04** | **Gestor / Admin** *(Dono de Restaurante)* | **Como** proprietário de restaurante ou quiosque em um dos 53 bairros, **quero** preencher o formulário de Credenciamento informando meu bairro e prato carro-chefe, **para** incluir meu negócio na vitrine do *CaráFood*. | `/contato` |
| **HU05** | **Gestor / Admin** *(Curador / Admin)* | **Como** administrador da plataforma, **quero** realizar login na área restrita, **para** auditar avaliações suspeitas (*Z-Score*) e aprovar novos restaurantes credenciados. | `/login` e `/moderation` |
| **HU06** | **Outro Ator** *(Produtor AMAPEC / Z-8)* | **Como** maricultor da Cocanha (AMAPEC) ou pescador do Camaroeiro (Colônia Z-8), **quero** que os pratos com nossos insumos exibam selo oficial de procedência, **para** valorizar a cadeia produtiva caiçara. | `/sobre`, `/` e `/prato/[id]` |

### 2.2 Mapa de Páginas Consolidado (Arquitetura Real em Código)
- **Nível Global (`z-40`):** Barra de Navegação Fixa (`Navbar.tsx`) presente em 100% das telas.
- **Nível Primário (Rotas Principais):**
  1. `https://foddtech.vercel.app/` — Home Page, Explorador dos 53 Bairros, Modo Reels e Catálogo em Cards;
  2. `https://foddtech.vercel.app/rankings` — Pódio Classificatório e Transparência Matemática;
  3. `https://foddtech.vercel.app/sobre` — História Gastronômica de Caraguatatuba, Missão, Visão e Equipe;
  4. `https://foddtech.vercel.app/contato` — Portal de Credenciamento B2B (53 Bairros) e Atendimento;
  5. `https://foddtech.vercel.app/login` — Autenticação RBAC (Comensal, Gestor e Curador).
- **Nível Secundário (*Master–Detail* & Restrito):**
  6. `https://foddtech.vercel.app/prato/[id]` — Página de Detalhe Profundo do Prato com CTAs;
  7. `https://foddtech.vercel.app/moderation` — Painel de Moderação e Auditoria Anti-Fraude.

---

## 🖥️ CAPÍTULO 3 — PROTÓTIPO E PÁGINAS IMPLEMENTADAS (AS 6 SUPERFÍCIES OBRIGATÓRIAS)

| # | Página / Superfície | Rota Oficial em Produção | Componentes e Funcionalidades Entregues (S03 a S09) |
| :---: | :--- | :--- | :--- |
| **01** | **Home / Landing Page** | `/` | Hero com proposta de valor, *Dynamic Island* do Chef Jacquin, Barra dos 10 Polos, Modal Cartográfico dos 53 Bairros, Seletor de Clima & Ocasião, Passaporte Caiçara e Modo Reels. |
| **02** | **Página "Sobre Nós"** | `/sobre` | História da culinária caiçara, Fazenda Marinha da Cocanha (AMAPEC), Colônia Z-8 do Camaroeiro, química do Azul-Marinho, Missão, Visão, Valores e Créditos da Equipe Módulo. |
| **03** | **Contato / Credenciamento** | `/contato` | Formulário validado com seleção dos 53 bairros, categoria gastronômica, prato carro-chefe, canais de contato e emissão de protocolo de confirmação. |
| **04** | **Tela de Login / Acesso** | `/login` | Autenticação com seletor de 3 perfis (Comensal, Gestor, Curador), validação de credenciais, botões de teste rápido e estados visuais de erro e sucesso. |
| **05** | **Lista / Catálogo & Rankings** | `/` e `/rankings` | Cards ricos com In-Image Tagging, preço, distância da praia, Super Nota Ponderada, Sparkline SVG de 30 dias ($\lambda=\ln(2)/30$) e tabela classificatória do festival. |
| **06** | **Página de Detalhe** | `/prato/[id]` | Padrão *Master–Detail* com Breadcrumb, foto ampliada, ficha técnica, parecer do Chef Jacquin e CTAs funcionais (*"Como Chegar"* e *"Emitir Cédula Oficial"*). |

> 📌 **[ESPAÇO PARA PRINTS NO WORD — CAPÍTULO 3]:** Inserir na sequência as 6 capturas de tela correspondentes às rotas acima (`https://foddtech.vercel.app/`, `/sobre`, `/contato`, `/login`, `/rankings` e `/prato/post-centro-azul-marinho`).

---

## 🔄 CAPÍTULO 4 — NAVEGAÇÃO E FLUXOS PRINCIPAIS DO SISTEMA

1. **Fluxo 1 — Descoberta Espacial e Climática (Turista/Morador):** O usuário acessa a Home (`/`), escolhe a ocasião *"☀️ Sol & Pé na Areia"* ou abre o **Explorador dos 53 Bairros**, clica no pino da **Praia da Cocanha** no Mapa Vetorial e visualiza instantaneamente os pratos com mexilhões certificados pela AMAPEC.
2. **Fluxo 2 — Aprofundamento Master–Detail e Rota GPS:** Ao se interessar pelo *Azul-Marinho Caiçara* ou pelos *Mexilhões ao Vinagrete*, o usuário clica em **"Ver Ficha Completa & Rota"**, acessa `/prato/[id]`, lê o parecer técnico do Chef Jacquin e aciona o CTA **"Como Chegar"** para abrir a navegação no Google Maps/Waze.
3. **Fluxo 3 — Emissão de Cédula Auditada e Gamificação:** Na página do prato ou no feed, o comensal clica em **"Avaliar (+50 Pontos)"**, atribui notas de 1 a 5 nos 5 critérios oficiais da SECTUR, acompanha o cálculo da Super Nota Ponderada em tempo real, envia seu parecer e desbloqueia carimbos no **Passaporte Caiçara**.
4. **Fluxo 4 — Credenciamento B2B e Governança Restrita:** Um proprietário de quiosque acessa `/contato` pela Navbar, cadastra seu estabelecimento vinculado a um dos 53 bairros, e o curador autenticado em `/login` audita os registros no painel `/moderation`.

---

## 📈 CAPÍTULO 5 — ANÁLISE PARCIAL DO PROJETO (CONQUISTAS, DIFICULDADES E BACKLOG ATÉ A A1)

### 5.1 Principais Conquistas Alcançadas (S01 a S10)
- Conclusão de **100% das 6 superfícies obrigatórias** com design industrial de alto contraste (WCAG 2.2 AAA), animações fluidas a 60fps e deploy contínuo ativo na Vercel (`https://foddtech.vercel.app/`);
- Solução definitiva para o problema de poluição visual dos 53 bairros por meio da arquitetura em 2 camadas (10 Polos + Modal com Mapa Vetorial e 4 Macro-Regiões);
- Implementação funcional das regras matemáticas do domínio (Cédula Ponderada de 5 critérios, curva SVG de decaimento exponencial de 30 dias e escudo Z-Score).

### 5.2 Dificuldades Técnicas Encontradas e Superadas
- **Equilíbrio entre Densidade de Informação e Clareza Visual:** Exibir selos de origem, preço, nota e distância sem tapar a fotografia do prato exigiu refatorar o *Stacking Context* (`z-10` a `z-50`) e criar badges horizontais translúcidos;
- **Sincronização do Monorepo na Vercel:** Resolvida com a criação do script automatizado `scripts/copy-build.js` no `postbuild`, garantindo paridade absoluta entre `src/` e `web-admin/src/`.

### 5.3 Plano de Backlog para a Etapa Final (S11 a S16 / A1)
- **S11:** Documentação formal do Changelog de Melhoria Contínua (*Antes $\rightarrow$ Depois*) e histórico de versionamento Git;
- **S12:** Execução cronometrada da bateria de Testes de Usabilidade com 3 perfis de usuários externos e priorização MoSCoW;
- **S13:** Consolidação e documentação da persistência em banco de dados relacional PostgreSQL (Supabase/Neon + API Routes) para avaliações e credenciamentos;
- **S14 a S16 (A1):** Estudo de DNS/URL Amigável, Checklist Final de Auditoria, Roteiro de Apresentação de 15–20 minutos e entrega do Relatório Técnico Final Consolidado.
