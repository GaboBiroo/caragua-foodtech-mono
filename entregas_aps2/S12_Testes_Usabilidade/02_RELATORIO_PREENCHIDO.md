# 📄 ESPELHO OFICIAL DO TEMPLATE (.DOCX) — SEMANA 12 (S12)
**Arquivo de Destino:** `APSII_S12_CARAFOOD.docx`  
*(Copie e cole as seções abaixo diretamente nos quadros correspondentes do template Word oficial do Prof. Me. Cristiano S. Negrão)*

---

## 🏛️ 1. CABEÇALHO INSTITUCIONAL E IDENTIFICAÇÃO DO PROJETO

| Campo do Template | Conteúdo Oficial Preenchido |
| :--- | :--- |
| **Instituição de Ensino** | Centro Universitário Módulo — Caraguatatuba/SP |
| **Disciplina** | Análise e Projeto de Sistemas II (APS II) — Semestre 2026/2 |
| **Docente Orientador / Avaliador** | Prof. Me. Cristiano S. Negrão |
| **Nome Oficial do Projeto / Sistema** | **CaráFood (Caraguá FoodTech)** |
| **Integrantes e Papéis** | • **Gabriel Rodrigues** (*PO, Tech Lead & Dev Front-End / IA*)<br>• **Matheus Vicente** (*Engenheiro de Dados, Dev Back-End & Curadoria Territorial*)<br>• **Pedro Simone** (*Engenheiro de QA, UX Researcher & Condutor dos Testes*) |
| **Ambiente Testado** | Produção Vercel ([https://foddtech.vercel.app/](https://foddtech.vercel.app/)) em Smartphone Android/iOS e Desktop Chrome |

---

## 🧪 2. RELATÓRIO DETALHADO DOS 3 CENÁRIOS DE USABILIDADE EXECUTADOS

O protocolo de testes seguiu o método **Think-Aloud (Pensar em Voz Alta)** sob coordenação do QA **Pedro Simone**, avaliando 3 perfis reais de usuários em tarefas críticas do domínio gastronômico de Caraguatatuba:

| Cenário & HU Vinculada | Perfil do Testador | Tarefa Solicitada ao Usuário | Tempo Cronometrado & Status | Hesitações, Fricções Observadas e Comentários do Usuário |
| :--- | :--- | :--- | :---: | :--- |
| **Cenário 01 (`HU01`) — Descoberta Espacial nos 53 Bairros** | **Testador A (Turista de Fim de Semana):** 29 anos, analista financeiro de São José dos Campos, visita Caraguatatuba 4x ao ano (Smartphone iOS). | *"Imagine que você está na Costa Norte e quer encontrar um prato de Mexilhão autêntico na Praia da Cocanha, descobrir quanto custa para 2 pessoas e salvar no seu roteiro."* | **24 segundos**<br>✅ **Concluído com Sucesso (100%)** | • **Ação:** Tocou diretamente no polo `🦪 Cocanha` na barra rápida superior, visualizou o pino `R$ 74,00` sobre a foto e tocou no ícone de Bookmark.<br>• **Fricção Observada:** Inicialmente não percebeu que o ícone de marcador (`Bookmark`) salvava na aba *"📌 Meus Salvos"* até ver o *Toast* de confirmação no rodapé. |
| **Cenário 02 (`HU02` & `HU03`) — Fluxo Master–Detail e Cédula Oficial** | **Testador B (Morador Local / Universitário):** 22 anos, estudante do Módulo morador do bairro Poiares, usuário assíduo de apps de delivery (Notebook Chrome). | *"Encontre o prato Azul-Marinho Caiçara no Centro, abra sua ficha técnica completa, trace a rota no Google Maps e emita uma avaliação nota máxima na Cédula Oficial do Caraguá a Gosto."* | **38 segundos**<br>✅ **Concluído com Sucesso (100%)** | • **Ação:** Clicou em *"Ver Ficha Completa & Rota"*, acessou `/prato/post-centro-azul-marinho`, testou o botão do Google Maps e preencheu os 5 critérios da cédula.<br>• **Fricção Observada:** Hesitou por 4 segundos no campo *"Nº da Mesa ou Cupom Fiscal"* achando que era obrigatório, antes de ler a legenda *"Opcional para demonstração"*. |
| **Cenário 03 (`HU04` & `HU05`) — Credenciamento B2B e Login** | **Testador C (Comerciante Local):** 46 anos, proprietário de quiosque familiar na Praia das Palmeiras (Orla Sul), familiaridade moderada com tecnologia (Smartphone Android). | *"Encontre onde cadastrar seu quiosque da Praia das Palmeiras na plataforma e, em seguida, acesse a tela de Login como Gestor de Restaurante."* | **51 segundos**<br>✅ **Concluído com Sucesso (100%)** | • **Ação:** Abriu o menu mobile, tocou em *"Contato (Credenciamento)"*, selecionou *"Praia das Palmeiras"* no dropdown dos 53 bairros, enviou o formulário e depois acessou `/login`.<br>• **Fricção Observada:** No seletor de 53 bairros do formulário `/contato`, levou ~8 segundos rolando a lista alfabética até encontrar *"Praia das Palmeiras"*. |

---

## 📊 3. SÍNTESE E MATRIZ DE PRIORIZAÇÃO DAS TOP 3 MELHORIAS (MÉTODO MoSCoW)

Com base nas hesitações cronometradas nos 3 cenários, a equipe classificou e priorizou as melhorias de usabilidade combinando **Ranking 1–3** e o método **MoSCoW**:

| Ranking | Classificação MoSCoW | Ponto de Fricção Identificado no Teste | Melhoria Técnica Definida / Implementada | Impacto na Experiência (UX) |
| :---: | :---: | :--- | :--- | :--- |
| **#1 (Top 1)** | **MUST HAVE** *(Obrigatório)* | Testador C levou 8s procurando seu bairro na lista linear do formulário `/contato` e usuários mobile queriam visão geográfica rápida. | Agrupamento dos 53 bairros por **4 Macro-Regiões** e adição do **Mapa Cartográfico Vetorial Interativo (`CaraguaInteractiveVectorMap`)** com busca instantânea. | Reduz o tempo de localização de qualquer bairro de Caraguatatuba de ~8s para **menos de 2 segundos**. |
| **#2 (Top 2)** | **SHOULD HAVE** *(Importante)* | Testador B hesitou por 4s achando que precisava ter um cupom fiscal físico em mãos para testar a Cédula Oficial e o Login. | Destaque visual do selo **"Modo Demonstração Ativo (Opcional)"** na Cédula Oficial e inclusão de **Botões de Preenchimento em 1 Clique** na tela `/login`. | Elimina 100% da barreira de entrada para testadores, turistas e banca avaliadora. |
| **#3 (Top 3)** | **COULD HAVE** *(Desejável)* | Testador A só descobriu a coleção de pratos salvos após o *Toast* desaparecer. | Contador dinâmico permanente na pílula **`📌 Meus Salvos (N)`** na barra principal de categorias e integração direta com o **Passaporte Caiçara**. | Aumenta a visibilidade do status do sistema (1ª Heurística de Nielsen) e a retenção do roteiro. |

---

## 🧠 4. REFLEXÃO TÉCNICA SOBRE OS TESTES DE USABILIDADE (6 LINHAS)

A execução empírica dos testes de usabilidade comprovou a máxima da Engenharia de Software de que **o desenvolvedor nunca é o usuário médio do seu próprio sistema**. Funcionalidades que pareciam óbvias para a equipe — como o campo de cupom fiscal na cédula de avaliação ou a lista de 53 bairros em um `<select>` tradicional — revelaram pequenas micro-hesitações quando colocadas nas mãos de um comerciante real da Praia das Palmeiras e de um turista de fim de semana. Medir o tempo em segundos e aplicar a matriz **MoSCoW** permitiu atacar cirurgicamente os gargalos de maior impacto antes da entrega final, elevando a taxa de sucesso das tarefas para 100% com tempo médio inferior a 40 segundos.

---

## 📸 5. EVIDÊNCIAS VISUAIS DOS CENÁRIOS TESTADOS (PARA INSERÇÃO NO .DOCX)

> 📌 **[ESPAÇO PARA PRINT 01 — CENÁRIO 01 E 02: FILTRO DA COCANHA, CONTADOR "MEUS SALVOS" E CÉDULA OFICIAL]:** Captura de tela demonstrando o fluxo testado pelos Testadores A e B em `https://foddtech.vercel.app/`.  
> 📌 **[ESPAÇO PARA PRINT 02 — CENÁRIO 03: FORMULÁRIO DE CREDENCIAMENTO (`/contato`) E LOGIN COM 1 CLIQUE (`/login`)]:** Captura de tela demonstrando as melhorias aplicadas após o teste com o Testador C.
