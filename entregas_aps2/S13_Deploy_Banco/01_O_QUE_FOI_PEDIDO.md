# 📋 S13 — O QUE FOI PEDIDO PELO PROF. ME. CRISTIANO S. NEGRÃO

**Disciplina:** Análise e Projeto de Sistemas II (APS II) — 2026/2  
**Semana Letiva:** Semana 13 (S13) — Deploy Inicial + Banco de Dados Funcionando  
**Nome Oficial do Arquivo para Submissão Individual (`.docx`):** `APSII_S13_CARAFOOD.docx`  
**Valor da Entrega:** 0,50 ponto na média de Atividades Práticas Supervisionadas  

---

## 1. ENUNCIADO OFICIAL DA TAREFA (S13)

Na Semana 13, a equipe deve comprovar que o sistema encontra-se publicado em uma plataforma de nuvem gratuita (*PaaS — Platform as a Service*, como Vercel) com **ao menos um fluxo completo gravando e lendo dados de um Banco de Dados Relacional Real** (PostgreSQL via Supabase / Neon integrado às API Routes da aplicação).

> ⚠️ **REGRA DE OURO DE SUBMISSÃO:** Envio individual obrigatório no portal acadêmico por todos os integrantes (**Gabriel Rodrigues, Matheus Vicente e Pedro Simone**), exclusivamente em formato `.docx` nomeado como `APSII_S13_CARAFOOD.docx`.

---

## 2. REQUISITOS MÍNIMOS OBRIGATÓRIOS DO ARTEFATO

1. **Sistema Publicado em Produção com Persistência Real em Banco de Dados:**
   - URL ativa na Vercel (`https://foddtech.vercel.app/`);
   - Pelo menos **1 fluxo completo de persistência de dados** operando entre Front-End $\rightarrow$ API Back-End $\rightarrow$ Banco de Dados PostgreSQL (Supabase/Neon):
     - **Fluxo A:** Submissão e leitura de Cédulas Auditadas de Avaliação de Pratos (`POST /api/reviews` e `GET /api/reviews` gravando na tabela `reviews`);
     - **Fluxo B:** Submissão de Solicitação de Credenciamento de Restaurantes dos 53 Bairros (`/contato` $\rightarrow$ tabela `merchant_leads`).
2. **Documentação Técnica do Passo a Passo do Deploy e Configuração do Banco:**
   - Justificativa da escolha da plataforma de nuvem (Vercel + Supabase/Neon PostgreSQL);
   - Script SQL (DDL) / Esquema Prisma das tabelas criadas;
   - Configuração segura de Variáveis de Ambiente (`DATABASE_URL`, `DIRECT_URL`, `GEMINI_API_KEY`);
   - Prints comprovando a aplicação em produção, o pipeline de deploy na Vercel e os registros persistidos no banco.

---

## 3. MATRIZ DE AVALIAÇÃO E PONTUAÇÃO (0,50 PONTO)

| Critério de Correção | Peso | Pontos | O que será avaliado pelo Prof. Cristiano S. Negrão |
| :--- | :---: | :---: | :--- |
| **1. Artefato do Projeto** | **60%** | **0,30 pt** | • **Completude (0,10 pt):** Deploy ativo na Vercel + fluxo de banco documentado e operante.<br>• **Aderência às Instruções (0,10 pt):** Passo a passo claro de deploy, banco e variáveis de ambiente.<br>• **Coerência Técnica (0,10 pt):** Tabelas relacionais coerentes com o domínio do *CaráFood*. |
| **2. Conteúdo Teórico** | **30%** | **0,15 pt** | • Explicação técnica da arquitetura PaaS Serverless, conexão ORM/Pooler e segurança de variáveis de ambiente. |
| **3. Qualidade e Prazo** | **10%** | **0,05 pt** | • **Evidências Técnicas (0,03 pt):** Scripts SQL/Prisma e prints do deploy/banco.<br>• **Organização e Nomeação (0,02 pt):** Arquivo `.docx` nomeado como `APSII_S13_CARAFOOD.docx`. |
