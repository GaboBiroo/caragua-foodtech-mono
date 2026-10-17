# 📄 ESPELHO OFICIAL DO TEMPLATE (.DOCX) — SEMANA 05 (S05)
**Arquivo de Destino:** `APSII_S05_CARAFOOD.docx`  
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
| **URL da Página de Contato em Produção** | [https://foddtech.vercel.app/contato](https://foddtech.vercel.app/contato) |
| **Arquivo de Código-Fonte Principal** | `src/app/contato/page.tsx` |

---

## 📬 2. ESTRUTURA E CAMPOS DO FORMULÁRIO IMPLEMENTADO (`/contato`)

A página **`/contato`** do **CaráFood** foi desenvolvida como um **Portal Híbrido de Atendimento e Credenciamento Gastronômico**, atendendo tanto consumidores finais quanto proprietários de estabelecimentos dos 53 bairros de Caraguatatuba. O formulário interativo conta com validação HTML5/React e os seguintes campos estruturados:

| Campo do Formulário | Tipo de Input / Validação | Finalidade no Domínio do CaráFood |
| :--- | :--- | :--- |
| **1. Nome do Responsável / Solicitante** | `text` (`required`) | Identifica o proprietário do restaurante, chef, maricultor ou comensal. |
| **2. Nome do Estabelecimento / Quiosque** | `text` (`required`) | Registra a razão comercial ou nome fantasia do negócio gastronômico local. |
| **3. Bairro em Caraguatatuba (53 Bairros)** | `select` (`required` — alimentado por `NEIGHBORHOODS`) | Garante a indexação territorial exata entre os 53 bairros oficiais (ex.: Cocanha, Martim de Sá, Tinga, Porto Novo, Centro). |
| **4. Categoria / Especialidade Culinária** | `select` (`required`) | Classifica o negócio (Culinária Caiçara, Maricultura AMAPEC, Pescados Z-8, Quiosque de Praia, Pizzaria a Lenha, Smash Burger, Vegano). |
| **5. E-mail Corporativo e WhatsApp** | `email` e `tel` (`required`) | Canais diretos de retorno para envio das credenciais de acesso e validação fiscal. |
| **6. Prato Carro-Chefe & Mensagem** | `text` e `textarea` (`required`) | Detalha o motivo do contato, o prato destaque da casa e insumos utilizados. |
| **7. Feedback Visual de Confirmação** | Estado React `submitted = true` + Protocolo | Exibe tela de sucesso com número de protocolo gerado e resumo dos dados enviados. |

---

## 🔗 3. HISTÓRIAS DE USUÁRIO APOIADAS NESTA PÁGINA

1. **`HU04` (Gestor / Proprietário de Restaurante ou Quiosque):**
   - *"Como proprietário de um restaurante, quiosque de praia ou bistrô localizado em qualquer um dos 53 bairros de Caraguatatuba, quero preencher o formulário estruturado de Credenciamento e Contato informando meu bairro, especialidade e dados comerciais, para solicitar a inclusão do meu estabelecimento na vitrine digital do CaráFood."*
   - **Como a página atende:** Fornece o seletor completo dos 53 bairros e campos específicos para cadastrar o prato carro-chefe e solicitar participação na vitrine e no ranking *Caraguá a Gosto*.
2. **`HU06` (Produtor Associado AMAPEC Cocanha / Pescador Colônia Z-8):**
   - *"Como maricultor associado à AMAPEC ou pescador artesanal da Colônia Z-8, quero que os pratos preparados com nossos insumos exibam um Selo Oficial de Rastreabilidade Caiçara..."*
   - **Como a página atende:** Permite que restaurantes e fornecedores solicitem na opção de categoria a auditoria de procedência para recebimento do selo oficial *AMAPEC Cocanha* ou *Colônia Z-8 Camaroeiro*.

---

## 🧠 4. PARÁGRAFO TEÓRICO: O PAPEL DA PÁGINA NO FUNIL DO SISTEMA (7 LINHAS)

Dentro da arquitetura de negócios e engenharia de dados do **CaráFood**, a página **`/contato`** opera como o **topo e meio do funil de aquisição e governança B2B (*Merchant Onboarding Funnel*)**. Em vez de permitir cadastros abertos e não verificados que poderiam poluir o catálogo com estabelecimentos fictícios ou fora de Caraguatatuba, o formulário atua como uma **camada de pré-cadastro estruturado e triagem técnica**: ele coleta os metadados essenciais do restaurante (bairro exato entre os 53 oficiais, categoria culinária, prato principal e canais de verificação) e persiste essa solicitação como um *lead* qualificado para a curadoria. Dessa forma, a página cumpre três funções simultâneas no ciclo de vida do sistema: **captação ativa** de pequenos negócios periféricos (do Rio do Ouro à Tabatinga), **higienização de dados na entrada** (garantindo padronização territorial) e **canal de suporte direto** para comensais e organizadores do festival *Caraguá a Gosto*.

---

## 📸 5. EVIDÊNCIAS VISUAIS DA PÁGINA DE CONTATO (PARA INSERÇÃO NO .DOCX)

> 📌 **[ESPAÇO PARA PRINT 01 — FORMULÁRIO DE CONTATO E CREDENCIAMENTO EM `/contato`]:** Captura de tela de `https://foddtech.vercel.app/contato` exibindo os benefícios de credenciamento à esquerda e o formulário completo com o seletor dos 53 bairros à direita.  
> 📌 **[ESPAÇO PARA PRINT 02 — ESTADO DE CONFIRMAÇÃO E PROTOCOLO GERADO]:** Captura de tela após o envio do formulário demonstrando o feedback visual de sucesso e o alerta de confirmação.
