# 📄 ESPELHO OFICIAL DO TEMPLATE (.DOCX) — SEMANA 01 (S01)
**Arquivo de Destino:** `APSII_S01_CARAFOOD.docx`  
*(Copie e cole as seções abaixo diretamente nos quadros correspondentes do template Word oficial do Prof. Me. Cristiano S. Negrão)*

---

## 🏛️ 1. CABEÇALHO INSTITUCIONAL E IDENTIFICAÇÃO DO PROJETO

| Campo do Template | Conteúdo Oficial Preenchido |
| :--- | :--- |
| **Instituição de Ensino** | Centro Universitário Módulo — Caraguatatuba/SP |
| **Disciplina** | Análise e Projeto de Sistemas II (APS II) — Semestre 2026/2 |
| **Docente Orientador / Avaliador** | Prof. Me. Cristiano S. Negrão |
| **Nome Oficial do Projeto / Sistema** | **CaráFood (Caraguá FoodTech)** — *Ecossistema Hiperlocal de Descoberta Gastronômica, Auditoria Cultural (Caraguá a Gosto) e Curadoria IA dos 53 Bairros de Caraguatatuba* |
| **Tema / Domínio de Negócio** | Gastronomia Regional Caiçara, Turismo Inteligente (*Smart Tourism*), Economia Criativa e *Social-Food Discovery* |
| **Tipo de Aplicação** | Aplicação Web Responsiva (*Progressive Web App — PWA*) desenvolvida em Next.js 14 (React + TypeScript + Tailwind CSS) integrada a Banco de Dados Relacional PostgreSQL |
| **URL Pública de Produção** | [https://foddtech.vercel.app/](https://foddtech.vercel.app/) |
| **Repositório GitHub Oficial** | `https://github.com/GaboBiroo/caragua-foodtech-mono` |

---

## 👥 2. COMPOSIÇÃO DA EQUIPE E PAPÉIS DE ENGENHARIA

| Nome Completo do Integrante | Papel Principal no Projeto | Atribuições e Responsabilidades no Semestre |
| :--- | :--- | :--- |
| **Gabriel Rodrigues** | **Product Owner (PO), Tech Lead & Desenvolvedor Front-End / IA** | Definição e priorização do Product Backlog, arquitetura Front-End em Next.js 14, implementação do Design System Industrial (*CaráFood*), algoritmos matemáticos de avaliação auditada e integração do concierge inteligente (*Chef Jacquin Praiano*). |
| **Matheus Vicente** | **Engenheiro de Dados, Desenvolvedor Back-End & Curador Territorial** | Modelagem do Banco de Dados Relacional (PostgreSQL / Supabase), construção das rotas de API (*API Routes*), estruturação geoespacial dos 53 bairros de Caraguatatuba em 4 Macro-Regiões e catalogação dos produtores locais (AMAPEC Cocanha e Colônia Z-8). |
| **Pedro Simone** | **Engenheiro de Qualidade (QA), UX Researcher & Documentação Técnica** | Elaboração e execução dos planos e casos de teste funcionais, condução dos testes de usabilidade cronometrados com usuários reais, verificação de acessibilidade WCAG 2.2 AAA e controle de conformidade documental dos relatórios `.docx`. |

---

## 🎯 3. CONTEXTO E PROBLEMA DE NEGÓCIO (1 A 2 PARÁGRAFOS)

Caraguatatuba consolidou-se como o principal polo econômico, universitário e turístico do Litoral Norte Paulista, abrigando uma riquíssima cadeia produtiva gastronômica distribuída ao longo de **53 bairros oficiais**, que vai desde a maior fazenda marinha de mexilhões do Estado de São Paulo na **Praia da Cocanha (gerida pela associação AMAPEC)** e o tradicional **Entreposto de Pesca Artesanal do Camaroeiro (Colônia de Pescadores Z-8 "Benjamin Constant")**, até o patrimônio imaterial do **Azul-Marinho preparado na panela de ferro** e o prestigiado festival anual **Caraguá a Gosto**. Entretanto, observa-se uma severa **assimetria de visibilidade digital**: os aplicativos de entrega tradicionais e agregadores internacionais concentram-se quase exclusivamente em redes de *fast-food* ou no circuito comercial imediato do Centro, relegando à invisibilidade dezenas de quiosques de praia, bistrôs familiares, defumadores artesanais da encosta da Serra do Mar (como nos bairros Tinga e Rio do Ouro) e peixarias da Orla Sul (Porto Novo e Palmeiras).

Somado à exclusão territorial dos bairros periféricos e costeiros, o mercado gastronômico local sofre com a **baixa confiabilidade das avaliações online convencionais**. Plataformas genéricas utilizam médias aritméticas simples que misturam notas de anos atrás com a realidade atual do estabelecimento, além de estarem vulneráveis a ataques coordenados de notas falsas (*review bombing* ou compra de avaliações por *bots*) e não diferenciarem critérios técnicos essenciais da gastronomia (como sabor, cocção, originalidade regional, atendimento e higiene). Dessa forma, turistas e moradores enfrentam alta sobrecarga cognitiva para descobrir onde comer um prato autenticamente caiçara com preço transparente, enquanto produtores e restaurantes legítimos perdem competitividade por falta de uma vitrine digital hiperlocal auditada.

---

## 💡 4. IDEIA DE SOLUÇÃO E RESULTADOS ESPERADOS DO MVP (5 BULLETS)

- **Feed Social-Gastronômico Hiperlocal (*Instagram-First Discovery*):** Construção de uma plataforma visual imersiva onde os pratos reais de Caraguatatuba são apresentados em cards fotográficos de alta definição com preço de cardápio transparente, distância da orla marítima, etiquetas interativas sobre a foto (*In-Image Dish Tagging*) e rota direta via GPS (Google Maps / Waze).
- **Explorador Territorial Despoluído dos 53 Bairros em 4 Macro-Regiões:** Implementação de uma arquitetura de navegação espacial em duas camadas que destaca os **10 Polos Gastronômicos Principais** na barra rápida e oferece um **Mapa Cartográfico Vetorial Interativo** agrupando todos os **53 bairros oficiais** nas 4 Macro-Regiões de Caraguatatuba (*Orla Central & Nobre*, *Costa Norte & Maricultura AMAPEC*, *Orla Sul & Bacia do Juqueriquerê* e *Encostas da Serra do Mar & Interior*).
- **Cédula Oficial Digital Auditada do Festival *Caraguá a Gosto*:** Substituição da avaliação subjetiva comum por uma cédula estruturada em **5 critérios ponderados oficiais** (*Sabor e Tempero Caiçara: 35%*, *Apresentação e Cocção: 20%*, *Originalidade e Insumos Regionais: 15%*, *Atendimento: 15%* e *Ambiente/Higiene: 15%*), protegida por decaimento temporal exponencial de 30 dias e filtro estatístico anti-bot (*Z-Score*).
- **Rastreabilidade Cultural de Origem (*Selos AMAPEC & Colônia Z-8*) e Passaporte Gamificado:** Identificação visual imediata dos estabelecimentos que utilizam mexilhões certificados da Fazenda Marinha da Cocanha (AMAPEC) e pescados frescos da Colônia Z-8 do Camaroeiro, recompensando o usuário com **Pontos Gourmet** e carimbos colecionáveis no *Passaporte Gastronômico Caiçara*.
- **Portal B2B de Credenciamento e Concierge Inteligente (*Chef Jacquin Praiano*):** Disponibilização de um fluxo estruturado de pré-cadastro e contato (`/contato`) e área restrita (`/login`) para quiosques e restaurantes de todos os 53 bairros, assistido pelo mascote interativo *Chef Jacquin Praiano* que orienta a descoberta gastronômica conforme o clima e a ocasião.

---

## 🤝 5. ACORDO DE TRABALHO E GOVERNANÇA DA EQUIPE

| Dimensão Operacional | Ferramentas e Práticas Acordadas pelo Grupo |
| :--- | :--- |
| **Gestão Visual de Tarefas (Backlog & Sprints)** | **GitHub Projects & Quadro Kanban:** Todas as tarefas semanais (S01 a S16) são decompostas em cartões nas colunas *Backlog*, *A Fazer (To Do)*, *Em Progresso (Doing)*, *Em Revisão/QA (Review)* e *Concluído (Done)*. |
| **Controle de Versão e Integração Contínua (CI/CD)** | **Git + GitHub (`GaboBiroo/caragua-foodtech-mono`) + Vercel:** Adoção de commits semânticos (*Conventional Commits*), validação obrigatória via `npm run build` antes de cada push e publicação automática em produção na Vercel (`https://foddtech.vercel.app/`). |
| **Comunicação e Ritos Semanais** | **WhatsApp (Canal Diário) e Discord (Reuniões de Sprint):** Alinhamento assíncrono diário pelo grupo oficial no WhatsApp e reunião síncrona semanal às terças e quintas-feiras às 20h00 no Discord para revisão do código e validação do relatório `.docx` da semana. |
| **Compromisso de Submissão Individual** | Os três integrantes (**Gabriel Rodrigues**, **Matheus Vicente** e **Pedro Simone**) revisam conjuntamente o documento `.docx` final até 24 horas antes do prazo limite e confirmam no grupo o protocolo de envio individual no portal AVA/Blackboard. |

---

## 📸 6. EVIDÊNCIA VISUAL INICIAL DO PROJETO (PARA INSERÇÃO NO .DOCX)

> 📌 **[ESPAÇO PARA PRINT 01 NO WORD]:** Inserir captura de tela da visão geral do cabeçalho do **CaráFood** em produção (`https://foddtech.vercel.app/`), evidenciando o logotipo oficial com o símbolo de onda/maré municipal de Caraguatatuba, o mascote *Chef Jacquin Praiano* e a barra de polos gastronômicos.
