# 📋 S09 — O QUE FOI PEDIDO PELO PROF. ME. CRISTIANO S. NEGRÃO

**Disciplina:** Análise e Projeto de Sistemas II (APS II) — 2026/2  
**Semana Letiva:** Semana 09 (S09) — Página de Detalhe (Padrão Master–Detail)  
**Nome Oficial do Arquivo para Submissão Individual (`.docx`):** `APSII_S09_CARAFOOD.docx`  
**Valor da Entrega:** 0,50 ponto na média de Atividades Práticas Supervisionadas  

---

## 1. ENUNCIADO OFICIAL DA TAREFA (S09)

Na Semana 09, a equipe deve implementar e publicar a **Página de Detalhe (`/prato/[id]`)** seguindo o padrão arquitetural **Master–Detail**, acessada diretamente pelo clique em um item da Lista Principal / Catálogo (S08). A página deve exibir informações aprofundadas do item selecionado e conter obrigatoriamente ao menos um **Call to Action (CTA)** claro e funcional.

> ⚠️ **REGRA DE OURO DE SUBMISSÃO:** Envio individual obrigatório no portal acadêmico por todos os integrantes (**Gabriel Rodrigues, Matheus Vicente e Pedro Simone**), exclusivamente em formato `.docx` nomeado como `APSII_S09_CARAFOOD.docx`.

---

## 2. REQUISITOS MÍNIMOS OBRIGATÓRIOS DO ARTEFATO

1. **Implementação Funcional da Rota Dinâmica `/prato/[id]` (`src/app/prato/[id]/page.tsx` e `PratoDetailClient.tsx`):**
   - Acessada ao clicar no título do prato ou no botão **"Ver Ficha Completa & Rota"** em qualquer card da Home (`/`) ou da página de Rankings (`/rankings`);
   - Exibição completa dos dados aprofundados do prato: fotografia ampliada, selos de procedência (*AMAPEC Cocanha*, *Colônia Z-8*, *Caraguá a Gosto*), preço, Super Nota Ponderada, curva de decaimento de 30 dias, parecer do *Chef Jacquin Praiano*, lista de avaliações auditadas e carrossel de pratos similares;
   - **CTAs Obrigatórios Presentes e Funcionais:**
     - **CTA 1:** *"Como Chegar (Abrir no Google Maps / Waze)"*;
     - **CTA 2:** *"Emitir Cédula Oficial Caraguá a Gosto / Avaliar Prato (+50 Pontos)"*;
     - **CTA 3:** *"Salvar no Roteiro de Caraguá"*.
2. **Link Público em Produção + Prints Reais:**
   - URL ativa de detalhe (ex.: `https://foddtech.vercel.app/prato/post-centro-azul-marinho`) e capturas de tela.
3. **Conteúdo Teórico e Reflexivo Obrigatório:**
   - **Texto Técnico (5 a 8 linhas):** Explicando o que é o padrão **Master–Detail**, qual seu benefício para a usabilidade do usuário e como ele serve de base estrutural para operações de **CRUD** (*Create, Read, Update, Delete*).

---

## 3. MATRIZ DE AVALIAÇÃO E PONTUAÇÃO (0,50 PONTO)

| Critério de Correção | Peso | Pontos | O que será avaliado pelo Prof. Cristiano S. Negrão |
| :--- | :---: | :---: | :--- |
| **1. Artefato do Projeto** | **60%** | **0,30 pt** | • **Completude (0,10 pt):** Rota `/prato/[id]` operando para todos os pratos com CTAs funcionais.<br>• **Aderência às Instruções (0,10 pt):** Navegação fluida a partir da lista principal (S08) e botão de retorno (*Breadcrumb*).<br>• **Coerência Técnica (0,10 pt):** Riqueza de detalhes superior ao resumo exibido no card da lista. |
| **2. Conteúdo Teórico** | **30%** | **0,15 pt** | • Domínio conceitual do padrão *Master–Detail* e sua ligação com arquiteturas CRUD. |
| **3. Qualidade e Prazo** | **10%** | **0,05 pt** | • **Reflexão de Engenharia (0,03 pt):** Texto explicativo entre 5 e 8 linhas.<br>• **Organização e Nomeação (0,02 pt):** Arquivo `.docx` nomeado como `APSII_S09_CARAFOOD.docx`. |
