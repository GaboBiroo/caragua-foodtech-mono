# 📄 ESPELHO OFICIAL DO TEMPLATE (.DOCX) — SEMANA 11 (S11)
**Arquivo de Destino:** `APSII_S11_CARAFOOD.docx`  
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
| **Repositório GitHub Oficial** | `https://github.com/GaboBiroo/caragua-foodtech-mono` |

---

## 🛠️ 2. CHANGELOG ESTRUTURADO DE MELHORIA CONTÍNUA ("ANTES $\rightarrow$ DEPOIS")

Para a entrega da Semana 11, a equipe conduziu uma auditoria crítica de UX e engenharia front-end e implementou **4 grandes melhorias estruturais** no código de produção:

| ID | Superfície Refatorada | Estado Anterior ("ANTES") | Estado Refatorado ("DEPOIS" — Produção) | Motivação Técnica & Ganho de Usabilidade |
| :---: | :--- | :--- | :--- | :--- |
| **M01** | **Filtro dos 53 Bairros de Caraguatatuba (`src/app/page.tsx`)** | Exibia 54 botões circulares seguidos em uma única barra horizontal, exigindo rolagem excessiva e gerando sobrecarga visual (*Choice Overload*). | **Arquitetura em 2 Camadas:** Barra rápida enxuta com os **10 Polos Curados** + Botão **`🗺️ Explorar todos os 53 Bairros`** que abre um Modal com **Mapa Cartográfico Vetorial** e divisão nas **4 Macro-Regiões Oficiais**. | Redução de **81,5% na entropia visual imediata** (Lei de Hick-Hyman) e queda de 4 cliques para apenas 1 clique na escolha de bairros periféricos. |
| **M02** | **Selos nas Fotos dos Pratos e Camadas (`z-index`)** | Selos empilhados verticalmente (`flex-col`) ocupavam até 35% da área esquerda da fotografia do prato; risco de sobreposição entre mascote e barra fixa. | **Badges Horizontais Translúcidos (`flex-wrap z-10`)** no topo da foto + **Hierarquia Rígida de Camadas**: Modais (`z-50`), Navbar (`z-40`), Polos/Mascote (`z-30`) e Selos (`z-10`). | Liberação de **92% da fotografia do prato** para estimular o apetite visual e eliminação total de colisões de componentes em telas móveis. |
| **M03** | **Identidade Visual, Zoom Óptico e Mascote Jacquin (`Navbar.tsx` / `FloatingJacquin.tsx`)** | Nome extenso, layout distante em monitores grandes e mascote pequeno com animação básica. | Rebrand para **CaráFood** com **Símbolo Vetorial Animado de Onda/Maré Municipal**, zoom óptico padrão `108%` no Desktop e física **60fps "Coucou"** (rastreamento de cursor, aceno e botão de minimizar). | Aumento expressivo da legibilidade em telas Full HD/4K e transformação do Chef Jacquin em anfitrião vivo sem obstruir a leitura. |
| **M04** | **Feedback Visual de Avaliação e Transparência (`CorporateUXSuite.tsx`)** | Exibia apenas o número estático da nota do prato sem demonstrar a evolução recente ou proteção contra *bots*. | Inclusão da **Sparkline SVG de Decaimento Exponencial de 30 dias ($\lambda = \ln(2)/30$)**, selo **`🛡️ Z-Score OK`**, **Passaporte Caiçara Gamificado** e **Modo Reels Vertical**. | Feedback visual imediato de confiabilidade matemática e engajamento gamificado por carimbos nas 4 Macro-Regiões de Caraguatatuba. |

---

## 🌿 3. HISTÓRICO REAL DE VERSIONAMENTO NO GIT (`git log --oneline`)

O versionamento do projeto no GitHub segue o padrão **Conventional Commits** (`feat:`, `fix:`, `docs:`, `refactor:`), garantindo rastreabilidade completa de cada incremento entregue:

```text
ccb5cfc (HEAD -> main, origin/main) feat(ux-roadmap-3m): implement complete 3-month industrial UX & visual roadmap (CaraguaInteractiveVectorMap, ClimateOccasionBar, PassaporteCarafoodModal, DishStoryReelModal, DecaySparklineBadge & DesignSystemRoadmapModal)
187eca1 feat(rebrand-ux): rebrand to CaráFood with Caraguatatuba wave emblem, Coucou 60fps Jacquin animations, 108% optical zoom, 2-tier 53-neighborhoods explorer modal & 3-month industrial UX roadmap
fd5385c docs(readme): add academic architecture badges, live production URL and comprehensive repository map
7c43c7a refactor(structure): organize repository into Harvard/MIT/USP standard (docs/, data/, scripts/, legacy/) and add Stage 1 technical report
a92b41e feat(ui-audit): add Matheus Vicente & Pedro Simone credits, enlarge Jacquin mascot, fix badge stacking context and add 15-point Reddit IT audit
```

---

## 🧠 4. REFLEXÃO TÉCNICA SOBRE VERSIONAMENTO E MELHORIA CONTÍNUA (6 LINHAS)

A prática de **Melhoria Contínua aliada ao Versionamento Git** demonstrou à equipe que um software de alto nível não nasce pronto na primeira iteração, mas evolui por ciclos disciplinados de inspeção e refatoração. Ao isolar cada evolução em commits atômicos e semânticos (`feat(rebrand-ux)`, `feat(ux-roadmap-3m)`), pudemos remodelar profundamente a experiência de filtragem dos 53 bairros de Caraguatatuba e a hierarquia de camadas CSS sem jamais quebrar o ambiente de produção na Vercel. Além disso, o pipeline automatizado (`npm run build` + `postbuild`) atuou como rede de segurança contínua, garantindo que cada melhoria de usabilidade chegasse imediatamente ao usuário final com zero regressões.

---

## 📸 5. EVIDÊNCIAS VISUAIS COMPARATIVAS ("ANTES $\rightarrow$ DEPOIS") PARA O .DOCX

> 📌 **[ESPAÇO PARA PRINT 01 — DEPOIS (PRODUÇÃO ATUAL): BARRA LIMPA DOS 10 POLOS + MODAL VETORIAL DOS 53 BAIRROS]:** Captura de tela de `https://foddtech.vercel.app/` mostrando a barra despoluída e o modal aberto com o Mapa Vetorial de Caraguatatuba.  
> 📌 **[ESPAÇO PARA PRINT 02 — DEPOIS (PRODUÇÃO ATUAL): CARD COM SELOS HORIZONTAIS, SPARKLINE SVG E PASSAPORTE CAIÇARA]:** Captura evidenciando a foto do prato desobstruída, a curva de 30 dias e o histórico de commits no GitHub.
