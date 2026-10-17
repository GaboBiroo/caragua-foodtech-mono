# 📄 ESPELHO OFICIAL DO TEMPLATE (.DOCX) — SEMANA 03 (S03)
**Arquivo de Destino:** `APSII_S03_CARAFOOD.docx`  
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
| **URL da Home Page em Produção** | [https://foddtech.vercel.app/](https://foddtech.vercel.app/) |
| **Arquivo de Código-Fonte Principal** | `src/app/page.tsx` (Next.js 14 App Router + Tailwind CSS + Framer Motion) |

---

## 🖥️ 2. ESTRUTURA IMPLEMENTADA NA HOME / LANDING PAGE DO CARÁFOOD

A **Home Page (`/`)** do **CaráFood** foi codificada em React/Next.js 14 adotando uma estética solar caiçara de alto contraste (**Creme Quente `#FAF7F2`**, **Verde Mata Atlântica `#135136`** e **Ouro Tropical `#FFB703`**), estruturada em 5 blocos funcionais que atendem integralmente aos requisitos da S03:

1. **Bloco 1 — Cabeçalho Hero & Proposta de Valor (Título + Texto de 3 Linhas + CTA de Passaporte):**
   - **Selo Superior:** `🌊 CaráFood • O App Oficial da Gastronomia de Caraguatatuba` (acompanhado do símbolo vetorial animado de onda/maré municipal `<CaraguaWaveEmblem />`).
   - **Título Principal (`<h1>`):** *"Sabores Caiçaras & Roteiro dos 53 Bairros"*.
   - **Texto de Contexto (2–3 linhas):** *"Dos mexilhões frescos da Fazenda da Cocanha (AMAPEC) ao Azul-Marinho na panela de ferro. Fotos reais, cédula auditada do festival e dicas ao vivo do Chef Jacquin!"*
   - **Botão Interativo de Destaque:** `★ 350 Pontos Gourmet • Passaporte`, que abre o Passaporte Gastronômico Caiçara gamificado.
2. **Bloco 2 — Dynamic Island do Chef Jacquin Praiano:**
   - Faixa interativa integrada ao Hero onde o mascote *Chef Jacquin Praiano* saúda o visitante e oferece atalhos de 1 clique para recomendações imediatas (*"🦪 Mexilhões da Cocanha"*, *"🏆 Campeões Caraguá a Gosto"*, *"🐟 Peixes do Camaroeiro"*).
3. **Bloco 3 — Barra Fixa dos 10 Polos Gastronômicos + CTA Principal "Explorar todos os 53 Bairros":**
   - Barra *sticky* (`top-20 z-30`) apresentando os 10 polos de maior densidade gastronômica e o botão de chamada para ação **`🗺️ Explorar todos os 53 Bairros`**, que abre o modal com o Mapa Cartográfico Vetorial e as 4 Macro-Regiões de Caraguatatuba.
4. **Bloco 4 — Seletor Sensorial de Clima & Ocasião + Busca Inteligente:**
   - Permite filtrar a experiência pelo momento do usuário (*☀️ Sol & Pé na Areia*, *🌙 Noite Caiçara & Panela de Ferro*, *🦪 Rota AMAPEC & Colônia Z-8*), além de acionar o **🎬 Modo Reels** vertical e o campo de busca instantânea por ingrediente, prato ou bairro.
5. **Bloco 5 — Cards de Benefícios e Destaques do Feed Gastronômico:**
   - Exibição dos pratos emblemáticos com foto real, pino de preço sobre a imagem (*Xiaohongshu/RED Tagging*), selos de procedência, Super Nota Ponderada auditada, curva SVG de decaimento exponencial e botões de ação (*"Ver Ficha Completa & Rota"* e *"Avaliar +50 Pontos"*).

---

## 🔗 3. CONEXÃO ENTRE A HOME PAGE E AS HISTÓRIAS DE USUÁRIO (S02)

| Elemento Implementado na Home Page (`/`) | História(s) de Usuário Atendida(s) | Como a Implementação Materializa o Requisito do Usuário |
| :--- | :---: | :--- |
| **Barra dos 10 Polos + Modal Cartográfico dos 53 Bairros + Seletor de Clima** | **HU01** *(Usuário Final)* | Permite que o morador ou turista filtre os pratos por qualquer um dos 53 bairros de Caraguatatuba (agrupados em 4 Macro-Regiões) ou pela ocasião climática em menos de 2 cliques, sem poluição visual. |
| **Cards de Pratos com Preço, Distância da Orla e Botão *"Ver Ficha Completa & Rota"*** | **HU02** *(Usuário Final)* | Entrega transparência imediata de preço e localização no próprio card da Home e conduz o usuário diretamente à página de detalhe (`/prato/[id]`) e ao Google Maps. |
| **Botão *"Avaliar (+50 Pontos)"* e Cartão *"Passaporte Caiçara"*** | **HU03** *(Usuário Final)* | Aciona a partir da Home a Cédula Oficial Digital do Festival *Caraguá a Gosto* (5 critérios ponderados) e contabiliza os Pontos Gourmet do comensal. |
| **Links da Navbar para *"Contato / Credenciamento"* e *"Login"*** | **HU04 e HU05** *(Gestor / Admin)* | Oferece acesso visível no topo da Home para que donos de restaurantes solicitem credenciamento (`/contato`) e gestores acessem a área restrita (`/login`). |
| **Selos *"🦪 Mexilhão AMAPEC • Cocanha"* e *"🐟 Pescado do Camaroeiro (Z-8)"*** | **HU06** *(Produtor Local)* | Destaca na vitrine principal da aplicação os pratos elaborados com insumos autênticos da maricultura e pesca artesanal de Caraguatatuba. |

---

## 🧠 4. MINI REFLEXÃO TEÓRICA (7 LINHAS)

### *"O que aprendemos ao traduzir o texto do projeto para uma página real?"*
Ao traduzir a descrição textual do projeto (S01/S02) para o código vivo da Home Page em Next.js, aprendemos que **o que funciona no papel nem sempre funciona na percepção visual imediata do usuário**. Inicialmente, listar os 53 bairros de Caraguatatuba parecia ótimo no texto do requisito, mas na tela gerava uma fileira poluída de 54 botões que paralisava a escolha do visitante (violando a Lei de Hick-Hyman). Essa constatação prática nos levou a projetar uma arquitetura visual em duas camadas — mantendo apenas os 10 Polos Curados na barra rápida e criando um Modal Explorador com Mapa Vetorial para as 4 Macro-Regiões —, além de posicionar os selos de origem em linha horizontal translúcida para jamais cobrir a fotografia do prato, comprovando que a engenharia de interface exige equilibrar completude de dados com hierarquia cognitiva e apetite visual.

---

## 📸 5. EVIDÊNCIAS VISUAIS DA HOME PAGE EM PRODUÇÃO (PARA INSERÇÃO NO .DOCX)

> 📌 **[ESPAÇO PARA PRINT 01 — HERO, NAVBAR, DYNAMIC ISLAND E BARRA DOS 10 POLOS]:** Captura da metade superior de `https://foddtech.vercel.app/` mostrando o título principal, o mascote Chef Jacquin Praiano, o seletor de Clima & Ocasião e o botão *"Explorar todos os 53 Bairros"*.  
> 📌 **[ESPAÇO PARA PRINT 02 — CARDS DE DESTAQUE DO FEED E CTAs PRINCIPAIS]:** Captura dos cards de pratos (*Azul-Marinho Caiçara* e *Mexilhões da Cocanha*) evidenciando preço, Super Nota, Sparkline de 30 dias e os botões de CTA.
