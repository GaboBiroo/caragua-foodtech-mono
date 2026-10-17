# 📋 S06 — O QUE FOI PEDIDO PELO PROF. ME. CRISTIANO S. NEGRÃO

**Disciplina:** Análise e Projeto de Sistemas II (APS II) — 2026/2  
**Semana Letiva:** Semana 06 (S06) — Menu e Estrutura de Navegação Global  
**Nome Oficial do Arquivo para Submissão Individual (`.docx`):** `APSII_S06_CARAFOOD.docx`  
**Valor da Entrega:** 0,50 ponto na média de Atividades Práticas Supervisionadas  

---

## 1. ENUNCIADO OFICIAL DA TAREFA (S06)

Na Semana 06, a equipe deve consolidar e documentar a **Barra de Navegação Global (`Navbar`) e a Estrutura de Roteamento** do sistema, garantindo que todas as páginas construídas estejam interligadas de forma coesa, sem links quebrados (*dead links*) ou páginas órfãs, tanto em telas Desktop quanto em dispositivos móveis (*Mobile Drawer*).

> ⚠️ **REGRA DE OURO DE SUBMISSÃO:** Envio individual obrigatório no portal acadêmico por todos os integrantes (**Gabriel Rodrigues, Matheus Vicente e Pedro Simone**), exclusivamente em formato `.docx` nomeado como `APSII_S06_CARAFOOD.docx`.

---

## 2. REQUISITOS MÍNIMOS OBRIGATÓRIOS DO ARTEFATO

1. **Barra de Navegação Global Integrada em Todas as Páginas (`src/components/Navbar.tsx`):**
   - Presença obrigatória dos links fundamentais: **Início / Home (`/`)**, **Sobre Nós (`/sobre`)**, **Contato / Credenciamento (`/contato`)**, **Rankings (`/rankings`)** e **Login / Acesso Restrito (`/login`)**;
   - Indicação visual clara da página ativa no momento (`active state`);
   - Funcionamento consistente em todas as rotas da aplicação sem perda de contexto.
2. **Mapa de Navegação Atualizado:**
   - Diagrama atualizado refletindo exatamente a estrutura real implementada no código Next.js App Router.
3. **Conteúdo Teórico e Reflexivo Obrigatório:**
   - **Texto Técnico de Justificativa (5 a 8 linhas):** Explicando a hierarquia visual dos itens do menu, os critérios de nomenclatura escolhidos e o caminho típico percorrido pelo usuário (*User Journey*).

---

## 3. MATRIZ DE AVALIAÇÃO E PONTUAÇÃO (0,50 PONTO)

| Critério de Correção | Peso | Pontos | O que será avaliado pelo Prof. Cristiano S. Negrão |
| :--- | :---: | :---: | :--- |
| **1. Artefato do Projeto** | **60%** | **0,30 pt** | • **Completude (0,10 pt):** Menu presente em todas as telas com Home, Sobre Nós, Contato, Rankings e Login.<br>• **Aderência às Instruções (0,10 pt):** Mapa de navegação atualizado e zero links quebrados.<br>• **Coerência Técnica (0,10 pt):** Responsividade e destaque visual de rota ativa. |
| **2. Conteúdo Teórico** | **30%** | **0,15 pt** | • Justificativa fundamentada sobre Arquitetura de Informação, hierarquia visual e fluxo do usuário. |
| **3. Qualidade e Prazo** | **10%** | **0,05 pt** | • **Reflexão de UX (0,03 pt):** Texto explicativo entre 5 e 8 linhas.<br>• **Organização e Nomeação (0,02 pt):** Arquivo `.docx` nomeado como `APSII_S06_CARAFOOD.docx`. |
