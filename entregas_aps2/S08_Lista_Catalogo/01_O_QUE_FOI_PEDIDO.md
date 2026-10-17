# 📋 S08 — O QUE FOI PEDIDO PELO PROF. ME. CRISTIANO S. NEGRÃO

**Disciplina:** Análise e Projeto de Sistemas II (APS II) — 2026/2  
**Semana Letiva:** Semana 08 (S08) — Lista Principal / Catálogo (Feed & Rankings)  
**Nome Oficial do Arquivo para Submissão Individual (`.docx`):** `APSII_S08_CARAFOOD.docx`  
**Valor da Entrega:** 0,50 ponto na média de Atividades Práticas Supervisionadas  

---

## 1. ENUNCIADO OFICIAL DA TAREFA (S08)

Na Semana 08, a equipe deve consolidar e documentar a **Lista Principal / Catálogo de Itens do Domínio**, estruturada em cards e/ou tabela analítica, exibindo os atributos essenciais de negócio e permitindo que o usuário explore, filtre e selecione itens para visualização detalhada.

> ⚠️ **REGRA DE OURO DE SUBMISSÃO:** Envio individual obrigatório no portal acadêmico por todos os integrantes (**Gabriel Rodrigues, Matheus Vicente e Pedro Simone**), exclusivamente em formato `.docx` nomeado como `APSII_S08_CARAFOOD.docx`.

---

## 2. REQUISITOS MÍNIMOS OBRIGATÓRIOS DO ARTEFATO

1. **Catálogo Principal Implementado em Código (`src/app/page.tsx` e `src/app/rankings/page.tsx`):**
   - Exibição clara da coleção de pratos e restaurantes de Caraguatatuba estruturada em **Cards Orgânicos no Feed (`/`)** e em **Listagem Classificatória na página de Rankings (`/rankings`)**;
   - Cada item do catálogo deve exibir os atributos fundamentais do domínio:
     - **Foto Real do Prato** + Etiqueta Interativa (*In-Image Tag*);
     - **Nome do Prato e Categoria Culinária**;
     - **Nome do Estabelecimento e Bairro (entre os 53 de Caraguatatuba)**;
     - **Preço de Cardápio (`R$`)** e **Super Nota Ponderada Auditada (`★`)**;
     - **Selos de Origem** (*Caraguá a Gosto*, *Mexilhão AMAPEC Cocanha*, *Pescado Camaroeiro Z-8*).
2. **Mecanismos de Filtragem e Busca Ativos:**
   - Filtro territorial (10 Polos + Modal das 4 Macro-Regiões dos 53 Bairros), filtro por Categoria, filtro por Clima/Ocasião e Busca Textual instantânea.
3. **Conteúdo Teórico e Reflexivo Obrigatório:**
   - **Parágrafo Técnico (5 a 8 linhas):** Explicando a relação direta da listagem/catálogo com as Histórias de Usuário de exploração gastronômica (`HU01`, `HU02`, `HU03` e `HU06`).

---

## 3. MATRIZ DE AVALIAÇÃO E PONTUAÇÃO (0,50 PONTO)

| Critério de Correção | Peso | Pontos | O que será avaliado pelo Prof. Cristiano S. Negrão |
| :--- | :---: | :---: | :--- |
| **1. Artefato do Projeto** | **60%** | **0,30 pt** | • **Completude (0,10 pt):** Catálogo funcional com todos os dados essenciais do domínio.<br>• **Aderência às Instruções (0,10 pt):** Acesso direto pelo menu/Home e vínculo clicável para a página de detalhe.<br>• **Coerência Técnica (0,10 pt):** Organização visual limpa, filtros operantes e dados realistas de Caraguatatuba. |
| **2. Conteúdo Teórico** | **30%** | **0,15 pt** | • Explicação consistente da relação entre o catálogo e as Histórias de Usuário. |
| **3. Qualidade e Prazo** | **10%** | **0,05 pt** | • **Reflexão de Engenharia (0,03 pt):** Parágrafo analítico bem redigido.<br>• **Organização e Nomeação (0,02 pt):** Arquivo `.docx` nomeado como `APSII_S08_CARAFOOD.docx`. |
