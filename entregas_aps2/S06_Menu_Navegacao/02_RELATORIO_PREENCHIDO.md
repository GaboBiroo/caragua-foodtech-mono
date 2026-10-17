# 📄 ESPELHO OFICIAL DO TEMPLATE (.DOCX) — SEMANA 06 (S06)
**Arquivo de Destino:** `APSII_S06_CARAFOOD.docx`  
*(Copie e cole as seções abaixo diretamente nos quadros correspondentes do template Word oficial do Prof. Me. Cristiano S. Negrão)*

---

## 🏛️ 1. CABEÇALHO INSTITUCIONAL E IDENTIFICAÇÃO DO PROJETO

| Campo do Template | Conteúdo Oficial Preenchido |
| :--- | :--- |
| **Instituição de Ensino** | Centro Universitário Módulo — Caraguatatuba/SP |
| **Disciplina** | Análise e Projeto de Sistemas II (APS II) — Semestre 2026/2 |
| **Docente Orientador / Avaliador** | Prof. Me. Cristiano S. Negrão |
| **Nome Oficial do Projeto / Sistema** | **CaráFood (Caraguá FoodTech)** |
| **Integrantes e Papéis** | • **Gabriel Rodrigues** (*PO, Tech Lead & Dev Front-End / IA*)<br>• **Matheus Vicente** (*Engenheiro de Dados, Dev Back-End & Curadoria Territorial*)<br>• **Pedro Simone** (*Engenheiro de QA, UX Researcher & Documentação*) |
| **URL Pública de Produção** | [https://foddtech.vercel.app/](https://foddtech.vercel.app/) |
| **Componente de Código-Fonte** | `src/components/Navbar.tsx` (reutilizado globalmente em todas as rotas) |

---

## 🧭 2. ARQUITETURA DO MENU DE NAVEGAÇÃO GLOBAL (`Navbar.tsx`)

O componente global **`Navbar.tsx`** foi projetado com posicionamento fixo no topo da viewport (`sticky top-0 z-40`), garantindo que o usuário tenha acesso imediato a qualquer seção do sistema independentemente da profundidade de rolagem do feed.

| Ordem no Menu | Rótulo Visível | Subtítulo Semântico | Rota Next.js (`href`) | Papel na Jornada do Usuário |
| :---: | :--- | :--- | :--- | :--- |
| **0 (Logo)** | **CaráFood + Onda Municipal + Jacquin** | *Curadoria Oficial de Caraguatatuba* | `/` | Retorno instantâneo à página inicial (Convenção universal de usabilidade de Jakob Nielsen). |
| **1** | **Início** | *Feed & 53 Bairros* | `/` | Ponto central de descoberta gastronômica, filtro por polos/clima e Modo Reels. |
| **2** | **Rankings** | *Pódio & Métricas* | `/rankings` | Consulta ao pódio auditado do Festival *Caraguá a Gosto* e transparência matemática. |
| **3** | **Sobre Nós** | *História & TCC* | `/sobre` | Contextualização histórica (AMAPEC Cocanha e Colônia Z-8), missão e equipe acadêmica. |
| **4** | **Contato** | *Credenciamento* | `/contato` | Canal B2B de pré-cadastro de restaurantes dos 53 bairros e atendimento ao usuário. |
| **5** | **Login** | *Acesso Restrito* | `/login` | Autenticação de comensais auditados, gestores de restaurantes e curadores. |
| **6 (CTA)** | **Portal TCC** | *Prof. Cristiano* | Modal `z-50` | Painel executivo instantâneo para auditoria acadêmica dos requisitos de APS II. |

---

## 🗺️ 3. MAPA DE NAVEGAÇÃO ATUALIZADO (ESTRUTURA REAL EM CÓDIGO)

```
                         +-------------------------------------------------------+
                         |        COMPONENTE GLOBAL: src/components/Navbar.tsx   |
                         |               (Sticky Top-0 | Z-Index: 40)            |
                         +---------------------------+---------------------------+
                                                     |
       +-------------------+-------------------+-----+-------------+-------------------+
       |                   |                   |                   |                   |
       v                   v                   v                   v                   v
+--------------+   +---------------+   +---------------+   +---------------+   +---------------+
|   HOME (/)   |   |   RANKINGS    |   |   SOBRE NÓS   |   |    CONTATO    |   |     LOGIN     |
| src/app/     |   | (/rankings)   |   |   (/sobre)    |   |  (/contato)   |   |   (/login)    |
| page.tsx     |   | page.tsx      |   |   page.tsx    |   |   page.tsx    |   |   page.tsx    |
+------+-------+   +-------+-------+   +---------------+   +---------------+   +-------+-------+
       |                   |                                                           |
       +---------+---------+                                                           v
                 | (Clique em qualquer prato)                                  +---------------+
                 v                                                             |   MODERAÇÃO   |
       +-------------------+                                                   | (/moderation) |
       | DETALHE DO PRATO  |                                                   | Painel Gestor |
       |  (/prato/[id])    |                                                   +---------------+
       | Master-Detail +   |
       | Breadcrumb Voltar |
       +-------------------+
```

---

## 🧠 4. JUSTIFICATIVA TÉCNICA DE HIERARQUIA VISUAL E FLUXO DO USUÁRIO (7 LINHAS)

A estrutura de navegação do **CaráFood** foi desenhada aplicando a **Lei da Posição Serial (Efeitos de Primazia e Recência)** e as heurísticas de **Visibilidade do Status do Sistema**. Posicionamos à esquerda a identidade visual com o mascote *Chef Jacquin Praiano* e o item **"Início (`/`)"**, pois a descoberta de pratos é a tarefa primária de 85% dos visitantes; no centro, agrupamos em uma cápsula translúcida as rotas informacionais e analíticas (**"Rankings"**, **"Sobre Nós"** e **"Contato"**), utilizando o hook `usePathname()` do Next.js para iluminar o item ativo em **Ouro Solar (`#FFB703`)** com texto escuro de alto contraste (WCAG AAA). Na extremidade direita — área de maior fixação visual final —, destacamos os botões de ação (**"Login"** e **"Portal TCC"**), enquanto em telas móveis (`< 768px`) o menu colapsa em um *Drawer* responsivo de toque amplo (`48px`), conduzindo o usuário em um caminho natural: **Descoberta no Feed (`/`) $\rightarrow$ Aprofundamento no Prato (`/prato/[id]`) $\rightarrow$ Validação no Ranking (`/rankings`) $\rightarrow$ Autenticação/Credenciamento (`/login` e `/contato`)**.

---

## 📸 5. EVIDÊNCIAS VISUAIS DO MENU DE NAVEGAÇÃO (PARA INSERÇÃO NO .DOCX)

> 📌 **[ESPAÇO PARA PRINT 01 — NAVBAR DESKTOP COM INDICADOR DE ROTA ATIVA EM `#FFB703`]:** Captura da barra superior do CaráFood em `https://foddtech.vercel.app/` mostrando a cápsula central de navegação e os botões de ação à direita.  
> 📌 **[ESPAÇO PARA PRINT 02 — MENU MOBILE RESPONSIVO (DRAWER ABERTO) E BREADCRUMB EM `/prato/[id]`]:** Captura demonstrando a adaptação responsiva do menu para smartphones e a trilha de navegação (*Breadcrumb*) na página de detalhe.
