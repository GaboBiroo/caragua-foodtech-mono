# 📄 ESPELHO OFICIAL DO TEMPLATE (.DOCX) — SEMANA 15 (S15 — PARTE 1: PLANO DE APRESENTAÇÃO E AUTOAVALIAÇÃO)
**Arquivo de Destino 1:** `APSII_S15_CARAFOOD.docx`  
*(Nota: O espelho completo do segundo arquivo obrigatório, `APSII_S15_CARAFOOD_CHECKLIST.docx`, encontra-se tanto na Seção 4 abaixo quanto isolado no arquivo `04_CHECKLIST_FINAL_PREENCHIDO.md` desta pasta)*

---

## 🏛️ 1. CABEÇALHO INSTITUCIONAL E IDENTIFICAÇÃO DO PROJETO

| Campo do Template | Conteúdo Oficial Preenchido |
| :--- | :--- |
| **Instituição de Ensino** | Centro Universitário Módulo — Caraguatatuba/SP |
| **Disciplina** | Análise e Projeto de Sistemas II (APS II) — Semestre 2026/2 |
| **Docente Orientador / Avaliador** | Prof. Me. Cristiano S. Negrão |
| **Nome Oficial do Projeto / Sistema** | **CaráFood (Caraguá FoodTech)** |
| **Integrantes e Papéis** | • **Gabriel Rodrigues** (*PO, Tech Lead & Dev Front-End / IA*)<br>• **Matheus Vicente** (*Engenheiro de Dados, Dev Back-End & Curadoria Territorial*)<br>• **Pedro Simone** (*Engenheiro de QA, UX Researcher & Documentação*) |
| **URL Oficial para Demo ao Vivo** | [https://foddtech.vercel.app/](https://foddtech.vercel.app/) |

---

## 🎤 2. PLANO DE APRESENTAÇÃO ORAL PARA A BANCA (CRONOGRAMA DE 18 MINUTOS)

O roteiro de defesa final foi estruturado para **18 minutos totais** (dentro da janela regulamentar de 15 a 20 minutos), garantindo equilíbrio rigoroso de fala (**6 minutos para cada integrante**) e demonstração ao vivo do sistema em produção:

| Bloco / Minutagem | Orador Responsável | Tópicos Abordados & Demonstração ao Vivo na Tela (`foddtech.vercel.app`) | Tempo |
| :--- | :--- | :--- | :---: |
| **Bloco 1 (00:00 – 03:00)** | **Gabriel Rodrigues** *(PO & Tech Lead)* | **Abertura, Problema Regional e Proposta de Valor:** Contextualização da invisibilidade digital nos 53 bairros de Caraguatatuba, apresentação da marca **CaráFood** (com o emblema de onda municipal) e demonstração ao vivo da Home Page (`/`), *Dynamic Island* do Chef Jacquin e Seletor de Clima & Ocasião. | **3 min** |
| **Bloco 2 (03:00 – 06:00)** | **Matheus Vicente** *(Engenheiro de Dados & Back-End)* | **Mapeamento Territorial dos 53 Bairros e Cadeia Produtiva Caiçara (`HU01` e `HU06`):** Demonstração ao vivo da Barra dos 10 Polos e abertura do **Modal Explorador dos 53 Bairros** com o **Mapa Cartográfico Vetorial Interativo** dividido nas 4 Macro-Regiões, explicando os selos da *Fazenda Marinha da Cocanha (AMAPEC)* e da *Colônia Z-8 do Camaroeiro* na página `/sobre`. | **3 min** |
| **Bloco 3 (06:00 – 09:00)** | **Pedro Simone** *(Engenheiro de QA & UX)* | **Jornada do Usuário, Padrão Master–Detail e Modo Reels (`HU02`):** Demonstração do clique no card do *Azul-Marinho Caiçara* abrindo `/prato/post-centro-azul-marinho`, explicação do padrão *Master–Detail*, acionamento do CTA *"Como Chegar (Google Maps)"* e exibição do **Modo Reels Vertical**. | **3 min** |
| **Bloco 4 (09:00 – 12:00)** | **Gabriel Rodrigues** *(PO & Tech Lead)* | **Regras de Negócio Matemáticas e Cédula Oficial *Caraguá a Gosto* (`HU03`):** Demonstração ao vivo da emissão de uma avaliação nos **5 critérios ponderados** (Sabor 35%, Cocção 20%, Originalidade 15%, Atendimento 15%, Ambiente 15%), explicação da curva SVG de **Meia-Vida Exponencial de 30 dias ($\lambda = \ln(2)/30$)**, filtro Anti-Bot **Z-Score** na página `/rankings` e *Passaporte Caiçara*. | **3 min** |
| **Bloco 5 (12:00 – 15:00)** | **Matheus Vicente** *(Engenheiro de Dados & Back-End)* | **Arquitetura em 3 Camadas, Deploy PaaS e Persistência em Banco de Dados (`HU04` e `HU05`):** Demonstração do formulário de Credenciamento B2B (`/contato`) e da Tela de Login RBAC (`/login`), apresentação do Modelo Entidade-Relacionamento (PostgreSQL / Supabase / Prisma) e evidência da gravação real via API Routes na Vercel. | **3 min** |
| **Bloco 6 (15:00 – 18:00)** | **Pedro Simone** *(Engenheiro de QA & UX)* | **Qualidade de Software, Testes de Usabilidade e Encerramento:** Apresentação da bateria de Casos de Teste Funcionais (`CT01`–`CT10`), resultados cronometrados dos 3 Cenários de Usabilidade (S12), priorização MoSCoW, lições aprendidas pelo grupo e abertura para arguição do Prof. Me. Cristiano S. Negrão. | **3 min** |

---

## 🪞 3. MINI AUTOAVALIAÇÃO HONESTA E CRÍTICA DO PROJETO

### 3.1 Principais Forças do Projeto (`Strengths`)
1. **Excelência Visual, Fluidez e Aderência Real a Caraguatatuba:** Ao contrário de sistemas genéricos, o **CaráFood** respira a identidade real dos 53 bairros de Caraguatatuba, valorizando a AMAPEC da Cocanha, a Colônia Z-8 do Camaroeiro e o festival *Caraguá a Gosto* com um Design System de nível corporativo (WCAG 2.2 AAA, animações 60fps e Mapa Vetorial próprio).
2. **Rigor Matemático nas Regras de Negócio:** A implementação real da média ponderada de 5 critérios combinada ao decaimento exponencial de 30 dias ($\lambda = \ln(2)/30$) e ao escudo estatístico Z-Score diferencia o projeto como uma solução de Engenharia de Computação robusta.
3. **Completude de Navegação e Deploy Estável:** Todas as 28 rotas estáticas e dinâmicas compilam sem erros (`exit code 0`) e operam com certificado HTTPS ativo em `https://foddtech.vercel.app/`.

### 3.2 Fragilidades Atuais e Limitações Reconhecidas (`Weaknesses / Next Steps`)
1. **Base Inicial Baseada em Curadoria Semente (*Seed Data*):** Embora a estrutura de banco de dados PostgreSQL e os endpoints de gravação estejam prontos e operacionais, o catálogo inicial conta com 15 pratos sementes de alta fidelidade, pois o *web scraping* automatizado em larga escala das centenas de quiosques da cidade foi planejado para a fase pós-MVP para evitar bloqueios de API e custos de cota.
2. **Validação de Cupom Fiscal por OCR:** No MVP atual, o número da mesa/cupom fiscal na Cédula Oficial é validado como campo textual auditável; a leitura óptica automática de QR Code da Nota Fiscal Paulista (SAT-CF-e SEFAZ/SP) via câmera do celular permanece como evolução futura do backlog.

---

## ✅ 4. ESPELHO DO CHECKLIST OFICIAL DE ENTREGA FINAL (`APSII_S15_CARAFOOD_CHECKLIST.docx`)

| Categoria de Auditoria | Item Verificado pelo Grupo | Status | Evidência / Rota Comprobatória no CaráFood |
| :--- | :--- | :---: | :--- |
| **1. Páginas Obrigatórias** | Home / Landing Page implementada com proposta de valor e CTAs | `[X] SIM` | `https://foddtech.vercel.app/` (`src/app/page.tsx`) |
| **1. Páginas Obrigatórias** | Página "Sobre Nós" com história, missão, visão e equipe | `[X] SIM` | `https://foddtech.vercel.app/sobre` (`src/app/sobre/page.tsx`) |
| **1. Páginas Obrigatórias** | Página "Contato / Credenciamento" com formulário funcional | `[X] SIM` | `https://foddtech.vercel.app/contato` (`src/app/contato/page.tsx`) |
| **1. Páginas Obrigatórias** | Tela de Login / Acesso Restrito com feedback de erro e sucesso | `[X] SIM` | `https://foddtech.vercel.app/login` (`src/app/login/page.tsx`) |
| **1. Páginas Obrigatórias** | Lista Principal / Catálogo com dados essenciais e filtros | `[X] SIM` | `https://foddtech.vercel.app/` e `/rankings` |
| **1. Páginas Obrigatórias** | Página de Detalhe (*Master–Detail*) com CTAs claros | `[X] SIM` | `https://foddtech.vercel.app/prato/post-centro-azul-marinho` |
| **2. Navegação Global** | Menu principal presente em todas as telas sem links quebrados | `[X] SIM` | Componente `src/components/Navbar.tsx` (`sticky top-0 z-40`) |
| **3. Banco & Deploy** | Sistema publicado na nuvem (Vercel) com URL amigável e HTTPS | `[X] SIM` | `https://foddtech.vercel.app/` (Deploy Ready) |
| **3. Banco & Deploy** | Ao menos 1 fluxo funcional persistindo dados em banco real | `[X] SIM` | `POST/GET /api/reviews` e `/contato` (PostgreSQL / Prisma) |
| **4. Qualidade & Docs** | Testes de usabilidade executados e todas as entregas `.docx` prontas | `[X] SIM` | Pastas `S01` a `S16` completas no repositório |
