# 📋 S05 — O QUE FOI PEDIDO PELO PROF. ME. CRISTIANO S. NEGRÃO

**Disciplina:** Análise e Projeto de Sistemas II (APS II) — 2026/2  
**Semana Letiva:** Semana 05 (S05) — Página "Entre em Contato" / Credenciamento (`/contato`)  
**Nome Oficial do Arquivo para Submissão Individual (`.docx`):** `APSII_S05_CARAFOOD.docx`  
**Valor da Entrega:** 0,50 ponto na média de Atividades Práticas Supervisionadas  

---

## 1. ENUNCIADO OFICIAL DA TAREFA (S05)

Na Semana 05, cada equipe deve implementar e publicar a **Página "Entre em Contato" (`/contato`)**, diretamente acessível pelo menu de navegação global. No domínio do **CaráFood**, esta página atua simultaneamente como canal de atendimento ao comensal e **Portal B2B de Solicitação de Credenciamento Gastronômico** para restaurantes, quiosques de praia e produtores artesanais dos 53 bairros de Caraguatatuba.

> ⚠️ **REGRA DE OURO DE SUBMISSÃO:** Envio individual obrigatório no portal acadêmico por todos os integrantes (**Gabriel Rodrigues, Matheus Vicente e Pedro Simone**), exclusivamente em formato `.docx` nomeado como `APSII_S05_CARAFOOD.docx`.

---

## 2. REQUISITOS MÍNIMOS OBRIGATÓRIOS DO ARTEFATO

1. **Implementação Funcional da Rota `/contato` (`src/app/contato/page.tsx`):**
   - Acessível pelo item **"Contato"** na barra de navegação global (`Navbar.tsx`);
   - **Formulário Funcional Obrigatório** contendo no mínimo:
     - Campo de **Nome Completo / Responsável**;
     - Campo de **E-mail e/ou Telefone (WhatsApp)**;
     - Campo de **Estabelecimento, Bairro (entre os 53 bairros de Caraguatatuba) e Categoria**;
     - Campo de **Mensagem / Motivo do Contato** (Solicitação de Credenciamento no CaráFood, Inscrição Caraguá a Gosto ou Suporte);
     - Botão de envio com validação de campos obrigatórios e **feedback visual claro de confirmação** ao usuário.
2. **Link Público em Produção + Prints Reais:**
   - URL ativa (`https://foddtech.vercel.app/contato`) e capturas de tela do formulário preenchido e do estado de confirmação.
3. **Conteúdo Teórico e Reflexivo Obrigatório:**
   - Indicação explícita de **quais Histórias de Usuário da S02 se apoiam nesta página** (`HU04` e `HU06`);
   - **Parágrafo Analítico (5 a 8 linhas):** Explicação técnica do papel da página `/contato` dentro do funil operacional do sistema (captação de parceiros, pré-cadastro estruturado, triagem de curadoria e atendimento).

---

## 3. MATRIZ DE AVALIAÇÃO E PONTUAÇÃO (0,50 PONTO)

| Critério de Correção | Peso | Pontos | O que será avaliado pelo Prof. Cristiano S. Negrão |
| :--- | :---: | :---: | :--- |
| **1. Artefato do Projeto** | **60%** | **0,30 pt** | • **Completude (0,10 pt):** Página `/contato` publicada com formulário completo, validação, link e prints.<br>• **Aderência às Instruções (0,10 pt):** Presença dos inputs obrigatórios (Nome, E-mail/Telefone, Mensagem/Motivo).<br>• **Coerência Técnica (0,10 pt):** Contextualização dos campos do formulário para o negócio *CaráFood*. |
| **2. Conteúdo Teórico** | **30%** | **0,15 pt** | • Vinculação correta com as Histórias de Usuário e explicação do papel no funil do sistema. |
| **3. Qualidade e Prazo** | **10%** | **0,05 pt** | • **Reflexão de Engenharia (0,03 pt):** Parágrafo analítico entre 5 e 8 linhas.<br>• **Organização e Nomeação (0,02 pt):** Arquivo `.docx` nomeado como `APSII_S05_CARAFOOD.docx`. |
