# 📄 ESPELHO OFICIAL DO TEMPLATE (.DOCX) — SEMANA 02 (S02)
**Arquivo de Destino:** `APSII_S02_CARAFOOD.docx`  
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

---

## 👥 2. HISTÓRIAS DE USUÁRIO (MÍNIMO DE 6 HUs: 3 USUÁRIO FINAL + 2 GESTOR + 1 OUTRO ATOR)

| ID | Categoria de Ator | História de Usuário (Padrão Connextra: *Como... Quero... Para...*) | Critérios de Aceitação & Página Vinculada |
| :--- | :--- | :--- | :--- |
| **HU01** | **Usuário Final** *(Morador ou Turista Comensal)* | **Como** turista ou morador em Caraguatatuba, **quero** filtrar o feed gastronômico pelos **53 bairros oficiais** (organizados em 10 Polos em destaque e 4 Macro-Regiões) e pela ocasião climática (*Sol & Pé na Areia* ou *Noite Caiçara*), **para** descobrir rapidamente pratos autênticos próximos à minha localização sem sofrer sobrecarga visual. | • Barra rápida com 10 polos + Modal com mapa vetorial dos 53 bairros.<br>• Filtro instantâneo sem recarregar a página.<br>• **Página:** Home / Catálogo (`/`). |
| **HU02** | **Usuário Final** *(Comensal Explorador)* | **Como** cliente em busca de uma refeição confiável, **quero** clicar em um prato do catálogo para abrir sua **Página de Detalhe (`Master–Detail`)** contendo foto real em alta definição, preço exato de cardápio, parecer do *Chef Jacquin Praiano* e botão de rota GPS, **para** decidir com segurança antes de me deslocar até o restaurante. | • Rota dinâmica `/prato/[id]` funcional.<br>• Exibição de preço, distância da orla e CTA *"Como Chegar (Google Maps/Waze)"*.<br>• **Página:** Detalhe do Prato (`/prato/[id]`). |
| **HU03** | **Usuário Final** *(Avaliador do Festival)* | **Como** comensal frequentador do festival *Caraguá a Gosto*, **quero** avaliar o prato consumido preenchendo a **Cédula Oficial Digital de 5 Critérios Ponderados** (Sabor 35%, Cocção 20%, Originalidade 15%, Atendimento 15% e Ambiente 15%), **para** contribuir com um ranking justo livre de *bots* e acumular **Pontos Gourmet** no meu *Passaporte Caiçara*. | • Cálculo automático da Super Nota Ponderada em tempo real.<br>• Crédito imediato de `+50 Pontos Gourmet`.<br>• **Páginas:** Home (`/`), Detalhe (`/prato/[id]`) e Rankings (`/rankings`). |
| **HU04** | **Gestor / Admin** *(Proprietário de Restaurante ou Quiosque)* | **Como** proprietário de um restaurante, quiosque de praia ou bistrô localizado em qualquer um dos 53 bairros de Caraguatatuba, **quero** preencher o formulário estruturado de **Credenciamento e Contato** informando meu bairro, especialidade e dados comerciais, **para** solicitar a inclusão do meu estabelecimento na vitrine digital do *CaráFood*. | • Seleção validada dos 53 bairros no formulário.<br>• Emissão de protocolo de recebimento e gravação no banco.<br>• **Página:** Contato / Credenciamento (`/contato`). |
| **HU05** | **Gestor / Admin** *(Administrador / Curador da Plataforma)* | **Como** administrador e curador técnico do *CaráFood*, **quero** autenticar-me na **Tela de Login / Acesso Restrito** com minhas credenciais institucionais, **para** auditar as cédulas submetidas, gerenciar solicitações de credenciamento e monitorar o escudo anti-fraude (*Z-Score* e meia-vida de 30 dias). | • Validação de e-mail, senha e perfil RBAC.<br>• Feedback visual imediato de erro ou sucesso com acesso ao painel.<br>• **Páginas:** Login (`/login`) e Moderação (`/moderation`). |
| **HU06** | **Outro Ator** *(Maricultor da AMAPEC Cocanha / Pescador Colônia Z-8)* | **Como** maricultor associado à **AMAPEC (Fazenda Marinha da Cocanha)** ou pescador artesanal da **Colônia Z-8 (Entreposto do Camaroeiro)**, **quero** que os pratos preparados com nossos insumos exibam um **Selo Oficial de Rastreabilidade Caiçara** e contexto histórico na plataforma, **para** valorizar a economia pesqueira local e comprovar a procedência fresca ao consumidor. | • Selos visuais *"🦪 Mexilhão AMAPEC • Cocanha"* e *"🐟 Pescado do Camaroeiro (Z-8)"* nos cards.<br>• História detalhada na página institucional.<br>• **Páginas:** Sobre Nós (`/sobre`), Home (`/`) e Detalhe (`/prato/[id]`). |

---

## 🗺️ 3. MAPA DE NAVEGAÇÃO DO SISTEMA (USER FLOW EM CAIXAS)

```
+---------------------------------------------------------------------------------------------------+
|                         BARRA DE NAVEGAÇÃO GLOBAL FIXA (Navbar.tsx - z-40)                        |
|        [ 🌊 CaráFood (Home /) ]   [ Sobre Nós (/sobre) ]   [ Contato (/contato) ]                 |
|                      [ Rankings (/rankings) ]   [ 🔐 Login (/login) ]                             |
+-------------------------------------------------+-------------------------------------------------+
                                                  |
        +-----------------------------------------+-----------------------------------------+
        |                                         |                                         |
        v                                         v                                         v
+-------------------------------+       +-----------------------------------+       +-------------------------------+
|  1. HOME & CATÁLOGO FEED (/)  |       |     2. PÁGINA SOBRE NÓS (/sobre)  |       | 3. CONTATO & CREDENCIAMENTO   |
| - Header + Dynamic Island IA  |       | - História Gastronômica Caiçara   |       |          (/contato)           |
| - Barra 10 Polos + Modal 53   |       | - AMAPEC Cocanha & Colônia Z-8    |       | - Formulário B2B (53 Bairros) |
| - Seletor Clima & Modo Reels  |       | - Missão, Visão e Equipe Módulo   |       | - Persistência no Banco SQL   |
| - Cards de Pratos Auditados   |       |   (Atende: HU06)                  |       |   (Atende: HU04)              |
|   (Atende: HU01, HU03, HU06)  |       +-----------------------------------+       +-------------------------------+
+---------------+---------------+
                |
                +---------------------------------+-----------------------------------------+
                | (Clique no Card / Ver Ficha)    | (Aba Rankings)                          | (Acesso Restrito)
                v                                 v                                         v
+-------------------------------+       +-----------------------------------+       +-------------------------------+
| 4. PÁGINA DE DETALHE DO PRATO |       |   5. PÁGINA DE RANKINGS OFICIAIS  |       |   6. TELA DE LOGIN & PAINEL   |
|        (/prato/[id])          |       |            (/rankings)            |       |     (/login -> /moderation)   |
| - Padrão Master-Detail        |       | - Pódio Top Pratos de Caraguá     |       | - Autenticação por Perfil     |
| - Ficha Técnica + Selos Z-8   |       | - Equação de Meia-Vida (30 dias)  |       | - Feedback de Erro/Sucesso    |
| - CTA 1: Emitir Cédula (HU03) |       | - Filtro Anti-Bot Z-Score         |       | - Auditoria de Cédulas        |
| - CTA 2: Rota GPS Maps (HU02) |       |   (Atende: HU01, HU03, HU05)      |       |   (Atende: HU05)              |
+-------------------------------+       +-----------------------------------+       +-------------------------------+
```

---

## 🔗 4. MINI TEXTO CONECTANDO AS HISTÓRIAS DE USUÁRIO ÀS PÁGINAS (8 LINHAS)

A arquitetura de navegação do **CaráFood** foi projetada para que cada História de Usuário possua um ponto focal direto e livre de fricção dentro do mapa de páginas. Na **Home / Catálogo Principal (`/`)**, materializam-se a **HU01** (filtragem espacial pelos 10 Polos Curados e pelo Modal Cartográfico dos 53 Bairros nas 4 Macro-Regiões, além do filtro sensorial de clima) e parte da **HU03** e **HU06**, exibindo os cards fotográficos com selos da *AMAPEC Cocanha* e *Colônia Z-8*. Ao clicar em qualquer card do feed, o usuário navega pelo fluxo *Master–Detail* até a **Página de Detalhe (`/prato/[id]`)**, cumprindo integralmente a **HU02** (ficha técnica completa, parecer do Chef Jacquin e CTA de rota GPS no Google Maps) e a **HU03** (abertura do modal da Cédula Oficial do Festival *Caraguá a Gosto* para avaliação ponderada). Por sua vez, a **Página Sobre Nós (`/sobre`)** aprofunda a **HU06** ao documentar a história caiçara e os produtores locais, enquanto a **Página de Contato/Credenciamento (`/contato`)** viabiliza a **HU04** (captação estruturada de novos restaurantes dos 53 bairros) e a **Tela de Login (`/login`)** atende à **HU05**, autenticando gestores e curadores para auditoria do ecossistema.

---

## 🖼️ 5. WIREFRAMES / PROTÓTIPOS DAS TELAS CENTRAIS (PARA INSERÇÃO NO .DOCX)

> 📌 **[ESPAÇO PARA PRINT 01 — PROTÓTIPO DA HOME E EXPLORADOR DOS 53 BAIRROS]:** Inserir captura da tela inicial em `https://foddtech.vercel.app/` mostrando a Barra dos 10 Polos e o Modal Cartográfico Vetorial dos 53 Bairros.  
> 📌 **[ESPAÇO PARA PRINT 02 — PROTÓTIPO DO CATÁLOGO / FEED E CÉDULA DE AVALIAÇÃO]:** Inserir captura do card do prato *Azul-Marinho Caiçara* e do modal da Cédula Oficial de 5 Critérios.  
> 📌 **[ESPAÇO PARA PRINT 03 — PROTÓTIPO DA PÁGINA DE DETALHE (`/prato/[id]`)]:** Inserir captura da rota `https://foddtech.vercel.app/prato/post-centro-azul-marinho` evidenciando os CTAs *"Como Chegar"* e *"Avaliar Prato"*.

---

## 📚 6. RESPOSTAS ÀS QUESTÕES TEÓRICAS OBRIGATÓRIAS DA SEMANA 02

### Questão 1: *"Em uma frase, diferencie Scrum e Kanban."*
**Resposta:** Enquanto o **Scrum** estrutura o trabalho em ciclos iterativos de duração fixa (*Sprints*) com papéis prescritos (*Product Owner, Scrum Master e Developers*) e cerimônias formais de planejamento e revisão, o **Kanban** foca na visualização contínua do fluxo de trabalho em um quadro de estados com limitação explícita de trabalho em progresso (*WIP — Work In Progress*), permitindo entregas em fluxo contínuo sem a obrigatoriedade de ciclos temporais fixos.

### Questão 2: *"O que é backlog?"*
**Resposta:** O **Backlog** (*Product Backlog*) é a lista única, dinâmica e priorizada pelo *Product Owner* que reúne todas as funcionalidades, Histórias de Usuário, requisitos técnicos, melhorias e correções necessários para construir e evoluir o produto, onde os itens de maior valor de negócio para o usuário ficam no topo detalhados e prontos para execução imediata.

### Questão 3: *"O que é sprint?"*
**Resposta:** A **Sprint** é o ciclo temporal curto e de duração fixa (*time-boxed*, geralmente de 1 a 4 semanas) que constitui o coração do framework Scrum, durante o qual a equipe de desenvolvimento trabalha em um subconjunto selecionado do backlog (*Sprint Backlog*) para construir e entregar um incremento de software funcional, testado e potencialmente utilizável ao final do período.
