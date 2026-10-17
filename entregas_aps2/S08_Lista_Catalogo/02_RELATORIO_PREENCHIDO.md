# 📄 ESPELHO OFICIAL DO TEMPLATE (.DOCX) — SEMANA 08 (S08)
**Arquivo de Destino:** `APSII_S08_CARAFOOD.docx`  
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
| **URLs do Catálogo em Produção** | • Feed Social: [https://foddtech.vercel.app/](https://foddtech.vercel.app/)<br>• Catálogo de Rankings: [https://foddtech.vercel.app/rankings](https://foddtech.vercel.app/rankings) |
| **Arquivos de Código-Fonte** | `src/app/page.tsx`, `src/app/rankings/page.tsx` e `src/data/caraguaData.ts` |

---

## 🍽️ 2. ESTRUTURA DE DADOS E ATRIBUTOS DO CATÁLOGO PRINCIPAL

O catálogo do **CaráFood** foi modelado na interface TypeScript `FeedPost` (`src/data/caraguaData.ts`) e renderizado em duas visões complementares: **Visão em Cards Sociais (`/` — para descoberta visual e apetite)** e **Visão de Ranking Analítico (`/rankings` — para comparação objetiva de notas ponderadas)**. Cada item do catálogo apresenta 10 atributos essenciais do domínio:

| Atributo Exibido no Card | Exemplo Real no Catálogo (`CaráFood`) | Importância para a Decisão do Usuário |
| :--- | :--- | :--- |
| **1. Identificação do Restaurante & Selo** | *Quiosque do Marquinhos (Cocanha)* `✓` | Confirma que o estabelecimento é real e verificado em Caraguatatuba. |
| **2. Bairro Oficial & Distância da Orla** | *Praia da Cocanha • 🏖️ Pé na Areia (30m da praia)* | Localiza o prato dentro dos 53 bairros e informa a proximidade do mar. |
| **3. Fotografia Real & In-Image Dish Tag** | Pino pulsante: *Porção p/ 2 pessoas • R$ 74,00* | Estimula o apetite visual com transparência imediata de porção e preço. |
| **4. Selos de Rastreabilidade Cultural** | `🏆 Campeão Caraguá a Gosto` • `🦪 Mexilhão AMAPEC` | Valoriza os produtores locais (AMAPEC Cocanha e Colônia Z-8 Camaroeiro). |
| **5. Preço de Cardápio (`dishPrice`)** | `R$ 74,00` / `R$ 138,00` | Elimina a frustração de cardápios sem preço em cidades turísticas. |
| **6. Super Nota Ponderada (`superRating`)** | `★ 4.98 (412 avaliações auditadas)` | Reflete a média ponderada dos 5 critérios oficiais do festival. |
| **7. Sparkline de 30 Dias & Escudo Z-Score** | Curva SVG `λ = ln(2)/30` + `🛡️ Z-Score OK` | Comprova visualmente que a nota é recente e protegida contra *bots*. |
| **8. Parecer do Chef Jacquin Praiano** | *"Mon ami, colhido hoje nas cordas da Cocanha!"* | Entrega curadoria gastronômica humanizada e dicas de harmonização. |
| **9. Ações Sociais Rápidas** | Curtir (`❤️`), Salvar no Roteiro (`📌`), Reels (`🎬`) | Permite montar uma coleção pessoal de pratos (*Meus Salvos*). |
| **10. Link Master–Detail (`/prato/[id]`)** | Botão *"Ver Ficha Completa & Rota"* | Conduz o usuário à página de detalhe profundo do prato (S09). |

---

## 🧠 3. PARÁGRAFO TEÓRICO: RELAÇÃO DO CATÁLOGO COM AS HISTÓRIAS DE USUÁRIO (7 LINHAS)

A Listagem Principal / Catálogo do **CaráFood** constitui o núcleo operacional onde todas as Histórias de Usuário de descoberta e valorização regional convergem. Para atender diretamente à **HU01**, o catálogo foi acoplado a um motor de filtragem multidimensional com normalização diacrítica (ignorando acentos e caixa alta/baixa), permitindo cruzar os **53 bairros** (via barra dos 10 Polos ou Mapa Vetorial das 4 Macro-Regiões), **10 categorias culinárias** e **4 ocasiões climáticas** sem recarregamento de página. Ao exibir no próprio card o preço real, a distância da praia, a Super Nota Ponderada e o botão *"Ver Ficha Completa & Rota"*, o catálogo prepara a transição perfeita para a **HU02** (navegação *Master–Detail*) e para a **HU03** (acionamento da Cédula Oficial do Festival *Caraguá a Gosto* e salvamento no roteiro). Simultaneamente, a presença destacada dos selos da *Fazenda Marinha da Cocanha (AMAPEC)* e do *Entreposto do Camaroeiro (Colônia Z-8)* nos cards da listagem cumpre a **HU06**, transformando o catálogo em uma ferramenta viva de fomento à economia caiçara.

---

## 📸 4. EVIDÊNCIAS VISUAIS DO CATÁLOGO E RANKINGS (PARA INSERÇÃO NO .DOCX)

> 📌 **[ESPAÇO PARA PRINT 01 — CATÁLOGO EM CARDS NO FEED PRINCIPAL COM FILTRO DE BAIRRO ATIVO]:** Captura de tela de `https://foddtech.vercel.app/` demonstrando a busca/filtro por bairro (ex.: *Cocanha* ou *Centro*) e os cards completos.  
> 📌 **[ESPAÇO PARA PRINT 02 — CATÁLOGO CLASSIFICATÓRIO NA PÁGINA `/rankings`]:** Captura de tela de `https://foddtech.vercel.app/rankings` exibindo o pódio oficial dos pratos mais bem avaliados de Caraguatatuba.
