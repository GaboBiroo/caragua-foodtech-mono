# 📋 S07 — O QUE FOI PEDIDO PELO PROF. ME. CRISTIANO S. NEGRÃO

**Disciplina:** Análise e Projeto de Sistemas II (APS II) — 2026/2  
**Semana Letiva:** Semana 07 (S07) — Tela de Login / Acesso Restrito (`/login`)  
**Nome Oficial do Arquivo para Submissão Individual (`.docx`):** `APSII_S07_CARAFOOD.docx`  
**Valor da Entrega:** 0,50 ponto na média de Atividades Práticas Supervisionadas  

---

## 1. ENUNCIADO OFICIAL DA TAREFA (S07)

Na Semana 07, a equipe deve construir e publicar a **Tela de Login / Acesso Restrito (`/login`)**, integrada ao menu de navegação global. O objetivo pedagógico é exercitar o desenho e a validação de fluxos de autenticação, estados de erro/sucesso e o controle de acesso baseado em perfis (*Role-Based Access Control — RBAC*) alinhado às regras de negócio do projeto.

> ⚠️ **REGRA DE OURO DE SUBMISSÃO:** Envio individual obrigatório no portal acadêmico por todos os integrantes (**Gabriel Rodrigues, Matheus Vicente e Pedro Simone**), exclusivamente em formato `.docx` nomeado como `APSII_S07_CARAFOOD.docx`.

---

## 2. REQUISITOS MÍNIMOS OBRIGATÓRIOS DO ARTEFATO

1. **Implementação Funcional da Rota `/login` (`src/app/login/page.tsx`):**
   - Inputs obrigatórios de **E-mail / Usuário** e **Senha** (com botão de alternância mostrar/ocultar senha);
   - Seletor ou identificação de perfil (*Comensal / Avaliador*, *Gestor de Restaurante* ou *Curador / Admin*);
   - Botão de submissão com **validação e feedback visual imediato**:
     - Exibição de alerta claro em caso de credenciais inválidas ou campos incompletos;
     - Exibição de estado de sucesso / sessão autenticada com atalho de redirecionamento para o Painel de Moderação (`/moderation`) ou Feed Principal (`/`).
2. **Link Público em Produção + Prints Reais:**
   - URL ativa (`https://foddtech.vercel.app/login`) e capturas de tela demonstrando os estados da tela (formulário, erro e sucesso).
3. **Conteúdo Teórico e Reflexivo Obrigatório:**
   - **Texto Explicativo (5 a 8 linhas):** Como a autenticação se conecta aos diferentes perfis de acesso do sistema (*Comensal* vs. *Gestor de Restaurante* vs. *Curador*) e às regras de negócio do *CaráFood*.

---

## 3. MATRIZ DE AVALIAÇÃO E PONTUAÇÃO (0,50 PONTO)

| Critério de Correção | Peso | Pontos | O que será avaliado pelo Prof. Cristiano S. Negrão |
| :--- | :---: | :---: | :--- |
| **1. Artefato do Projeto** | **60%** | **0,30 pt** | • **Completude (0,10 pt):** Tela `/login` publicada com inputs de usuário/senha, botão e feedbacks visuais.<br>• **Aderência às Instruções (0,10 pt):** Demonstração prática dos estados de sucesso e erro.<br>• **Coerência Técnica (0,10 pt):** Integração com a Navbar global e com os fluxos restritos do sistema. |
| **2. Conteúdo Teórico** | **30%** | **0,15 pt** | • Explicação clara de controle de acesso (RBAC) e vínculo com as regras de negócio. |
| **3. Qualidade e Prazo** | **10%** | **0,05 pt** | • **Reflexão de Engenharia (0,03 pt):** Texto analítico entre 5 e 8 linhas.<br>• **Organização e Nomeação (0,02 pt):** Arquivo `.docx` nomeado como `APSII_S07_CARAFOOD.docx`. |
