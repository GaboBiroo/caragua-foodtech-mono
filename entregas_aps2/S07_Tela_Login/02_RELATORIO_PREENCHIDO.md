# 📄 ESPELHO OFICIAL DO TEMPLATE (.DOCX) — SEMANA 07 (S07)
**Arquivo de Destino:** `APSII_S07_CARAFOOD.docx`  
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
| **URL da Tela de Login em Produção** | [https://foddtech.vercel.app/login](https://foddtech.vercel.app/login) |
| **Arquivo de Código-Fonte Principal** | `src/app/login/page.tsx` |

---

## 🔐 2. ESPECIFICAÇÃO DA TELA DE LOGIN E CONTROLE DE ACESSO (`/login`)

A página **`/login`** do **CaráFood** implementa o portal unificado de autenticação do ecossistema, permitindo tanto o preenchimento manual quanto o **teste instantâneo em 1 clique com credenciais de demonstração** para facilitar a avaliação docente:

1. **Seletor de Perfil de Acesso (RBAC — Role-Based Access Control):**
   - **Perfil 1 — Comensal Auditado (`comensal@carafood.com.br`):** Morador ou turista que acumula *Pontos Gourmet*, coleciona carimbos no *Passaporte Caiçara* e emite Cédulas Oficiais do Festival *Caraguá a Gosto*.
   - **Perfil 2 — Gestor de Restaurante / Quiosque (`gestor@restaurante.com.br`):** Proprietário credenciado em um dos 53 bairros que gerencia o cardápio da casa, atualiza preços e acompanha a curva de avaliação de 30 dias.
   - **Perfil 3 — Curador / Admin SECTUR & Módulo (`cristiano@modulo.edu.br` / `admin@carafood.com.br`):** Administrador com acesso ao Painel de Moderação Anti-Fraude (`/moderation`) e auditoria estatística Z-Score.
2. **Inputs e Estados de Feedback Visual Imediato:**
   - **Campo de E-mail Institucional / Usuário** e **Campo de Senha** (com botão de visibilidade `Eye / EyeOff` e validação mínima de caracteres);
   - **Feedback de Erro (`status === 'error'`):** Caso o usuário informe uma senha incorreta (ex.: `< 6` caracteres ou credencial inválida), exibe um alerta vermelho de alto contraste explicando exatamente o motivo da falha;
   - **Feedback de Sucesso (`status === 'success'`):** Exibe o cartão de sessão autenticada com o token de perfil ativo e botões diretos de redirecionamento para o **Painel de Moderação (`/moderation`)** ou **Feed Gastronômico (`/`)**.

---

## 🧠 3. TEXTO TEÓRICO: AUTENTICAÇÃO, PERFIS DE ACESSO E REGRAS DE NEGÓCIO (7 LINHAS)

No ecossistema do **CaráFood**, a camada de autenticação (`/login`) é o alicerce que garante a integridade das **Regras de Negócio Anti-Fraude** e a separação de privilégios (*Role-Based Access Control — RBAC*). Para o **Comensal Auditado (`HU03`)**, estar autenticado impede que *bots* anônimos inundem um restaurante com avaliações falsas, vinculando cada Cédula Oficial do Festival *Caraguá a Gosto* e cada carimbo do *Passaporte Caiçara* a uma identidade única verificável. Já para o **Gestor do Restaurante (`HU04/HU05`)**, a autenticação restringe a edição de preços, fotos e etiquetas de pratos exclusivamente ao responsável legal pelo estabelecimento naquele bairro específico entre os 53 de Caraguatatuba. Por fim, o perfil de **Curador / Administrador (`HU05`)** habilita o acesso à rota restrita `/moderation`, onde são auditados os alertas do algoritmo estatístico *Z-Score* ($|Z| > 2.5$) e homologados os selos de procedência da *Fazenda Marinha da Cocanha (AMAPEC)* e da *Colônia Z-8 do Camaroeiro*.

---

## 📸 4. EVIDÊNCIAS VISUAIS DA TELA DE LOGIN (PARA INSERÇÃO NO .DOCX)

> 📌 **[ESPAÇO PARA PRINT 01 — TELA DE LOGIN (`/login`) COM SELETOR DE PERFIS E CREDENCIAIS DEMO]:** Captura de tela de `https://foddtech.vercel.app/login` exibindo os 3 perfis de acesso e os inputs de E-mail e Senha.  
> 📌 **[ESPAÇO PARA PRINT 02 — FEEDBACK VISUAL DE ERRO E FEEDBACK DE SUCESSO AUTENTICADO]:** Captura demonstrando a mensagem de erro para credenciais inválidas e o painel verde de autenticação concluída com redirecionamento.
