# 📄 ESPELHO OFICIAL DO TEMPLATE (.DOCX) — SEMANA 09 (S09)
**Arquivo de Destino:** `APSII_S09_CARAFOOD.docx`  
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
| **URL da Página de Detalhe em Produção** | [https://foddtech.vercel.app/prato/post-centro-azul-marinho](https://foddtech.vercel.app/prato/post-centro-azul-marinho) *(e mais 14 rotas geradas)* |
| **Arquivos de Código-Fonte** | `src/app/prato/[id]/page.tsx` e `src/app/prato/[id]/PratoDetailClient.tsx` |

---

## 🔍 2. ARQUITETURA DA PÁGINA DE DETALHE (`/prato/[id]`) E CTAs IMPLEMENTADOS

A Página de Detalhe do **CaráFood** foi construída utilizando roteamento dinâmico do Next.js 14 (`generateStaticParams` para as 15 especialidades catalogadas nos bairros de Caraguatatuba), dividindo a interface em um layout de duas colunas de alta legibilidade precedido por uma trilha de navegação (*Breadcrumb*: `Início > [Bairro] > [Nome do Prato]`):

1. **Coluna Esquerda — Fotografia em Alta Definição e Rastreabilidade:**
   - Exibe a fotografia gastronômica ampliada, os selos translúcidos do festival *Caraguá a Gosto*, da *Fazenda Marinha da Cocanha (AMAPEC)* ou do *Entreposto do Camaroeiro (Colônia Z-8)*, e a chancela inferior de **Origem Auditada (`verifiedSource`)**.
2. **Coluna Direita — Ficha Técnica Profunda e Telemetria Algorítmica:**
   - Apresenta o cabeçalho do restaurante e bairro, categoria culinária, valor de cardápio (`R$`), Super Nota Ponderada (`★`), **Sparkline SVG de Decaimento Exponencial de 30 dias ($\lambda = \ln(2)/30$)**, selo **Z-Score OK**, descrição detalhada de preparo e o parecer técnico do *Chef Jacquin Praiano*.
3. **Call to Actions (CTAs) Principais e Seção de Avaliações Auditadas:**
   - **CTA Primário 1 (Geolocalização):** Botão **`🧭 Como Chegar (Abrir no Google Maps / Waze)`**, que traça a rota GPS exata até o restaurante no bairro correspondente em Caraguatatuba;
   - **CTA Primário 2 (Auditoria Participativa):** Botão **`🏆 Avaliar Prato na Cédula Oficial (+50 Pontos Gourmet)`**, que abre o modal dos 5 critérios ponderados do *Caraguá a Gosto* e adiciona o parecer em tempo real à lista de avaliações;
   - **CTA Secundário 3 (Coleção & Compartilhamento):** Botões de **Curtir (`❤️`)**, **Salvar no Roteiro (`📌`)** e **Compartilhar Link (`🔗`)**, seguidos pelo carrossel de *Outros Pratos Recomendados*.

---

## 🧠 3. TEXTO TEÓRICO: O PADRÃO MASTER–DETAIL, USABILIDADE E BASE PARA O CRUD (8 LINHAS)

O padrão arquitetural **Master–Detail (Mestre–Detalhe)** consiste em dividir a apresentação de uma coleção de dados em dois níveis hierárquicos acoplados: uma **Visão Mestre (*Master View*)** — representada pelo catálogo/feed da S08, que exibe apenas o resumo essencial de múltiplos itens para rápida varredura visual — e uma **Visão de Detalhe (*Detail View*)** — representada pela rota parametrizada `/prato/[id]`, que carrega todos os atributos profundos de um único registro selecionado pela sua chave primária (`id`). Do ponto de vista da Engenharia de Usabilidade, esse padrão aplica o princípio da **Divulgação Progressiva (*Progressive Disclosure*)**, evitando poluir a listagem inicial com dezenas de textos técnicos e comentários, entregando densidade informacional apenas quando o usuário demonstra interesse real no prato. Além disso, o *Master–Detail* constitui o alicerce natural das operações de **CRUD** em bancos de dados relacionais: a tela Mestre executa o `READ ALL (SELECT * FROM dishes WHERE...)`, o clique no item dispara o `READ BY ID (SELECT * FROM dishes WHERE id = :id)`, e os CTAs internos da página de detalhe hospedam com segurança as transações de `CREATE` (inserção de nova avaliação auditada na tabela `reviews`), `UPDATE` (atualização da média ponderada e curtidas do prato) e `DELETE` (remoção de comentários irregulares pelo moderador).

---

## 📸 4. EVIDÊNCIAS VISUAIS DA PÁGINA DE DETALHE (PARA INSERÇÃO NO .DOCX)

> 📌 **[ESPAÇO PARA PRINT 01 — PÁGINA DE DETALHE `/prato/post-centro-azul-marinho` COM FICHA TÉCNICA E CTAs]:** Captura de tela mostrando o Breadcrumb superior, a foto do Azul-Marinho à esquerda e a ficha completa com os botões *"Como Chegar"* e *"Avaliar Prato"* à direita.  
> 📌 **[ESPAÇO PARA PRINT 02 — SEÇÃO DE AVALIAÇÕES AUDITADAS E PRATOS RELACIONADOS]:** Captura da metade inferior da página de detalhe exibindo os comentários auditados e o modal da Cédula Oficial de 5 Critérios aberto.
