# ✅ ESPELHO EXCLUSIVO DO SEGUNDO ARQUIVO DA S15: CHECKLIST DE ENTREGA FINAL
**Arquivo de Destino 2:** `APSII_S15_CARAFOOD_CHECKLIST.docx`  
**Template de Referência:** `# Checklist de Entrega Final – APS II _Disc.docx`  
**Docente Avaliador:** Prof. Me. Cristiano S. Negrão  
**Projeto:** CaráFood (Caraguá FoodTech) — **Grupo:** Gabriel Rodrigues, Matheus Vicente e Pedro Simone  

---

## 1. CHECKLIST DE PÁGINAS E INTERFACES OBRIGATÓRIAS (FRONT-END)

- [x] **1.1 Home / Landing Page (`/`) implementada e funcionando:**
  - Contém título claro, texto de contexto/problema (2–3 linhas), cards de destaque dos 53 bairros, *Dynamic Island* do Chef Jacquin e botões de CTA.
  - **URL:** `https://foddtech.vercel.app/`
- [x] **1.2 Página "Sobre Nós" (`/sobre`) implementada e acessível via menu:**
  - Contém nome do negócio (*CaráFood*), história da gastronomia de Caraguatatuba (AMAPEC Cocanha e Colônia Z-8 Camaroeiro), Missão, Visão, Valores e créditos da equipe.
  - **URL:** `https://foddtech.vercel.app/sobre`
- [x] **1.3 Página "Entre em Contato" / Credenciamento (`/contato`) implementada e funcional:**
  - Contém formulário estruturado com Nome, Estabelecimento, Seletor dos 53 Bairros, E-mail, WhatsApp, Categoria, Mensagem e feedback visual de confirmação com protocolo.
  - **URL:** `https://foddtech.vercel.app/contato`
- [x] **1.4 Menu e Estrutura de Navegação Global (`Navbar.tsx`):**
  - Presente no topo de todas as páginas (`sticky top-0 z-40`), com links ativos e sem quebra para Início, Rankings, Sobre Nós, Contato e Login, além de menu responsivo mobile.
- [x] **1.5 Tela de Login / Acesso Restrito (`/login`) implementada e funcional:**
  - Contém inputs de E-mail/Usuário e Senha, seletor de perfil (Comensal, Gestor, Curador), botões de preenchimento rápido de demonstração e feedbacks visuais imediatos de erro e sucesso.
  - **URL:** `https://foddtech.vercel.app/login`
- [x] **1.6 Lista Principal / Catálogo (`/` e `/rankings`) implementada:**
  - Exibe todos os itens com foto real, nome do prato, restaurante, bairro, distância da orla, preço (`R$`), Super Nota Ponderada (`★`) e filtros funcionais.
  - **URL:** `https://foddtech.vercel.app/rankings`
- [x] **1.7 Página de Detalhe — Padrão Master–Detail (`/prato/[id]`):**
  - Acessada ao clicar em qualquer item da lista principal, exibindo ficha técnica aprofundada, parecer do Chef Jacquin e CTAs claros (*"Como Chegar no Google Maps"* e *"Emitir Cédula Oficial"*).
  - **URL Exemplo:** `https://foddtech.vercel.app/prato/post-centro-azul-marinho`

---

## 2. CHECKLIST DE ENGENHARIA DE SOFTWARE, BANCO DE DADOS E DEPLOY

- [x] **2.1 Histórias de Usuário (Mínimo 6: 3 Usuário Final + 2 Gestor + 1 Outro Ator):**
  - Documentadas no padrão *"Como... quero... para..."* (`HU01` a `HU06`) e rastreadas em todas as telas.
- [x] **2.2 Melhoria Contínua e Versionamento Git (S11):**
  - Mais de 4 melhorias visuais e estruturais documentadas com *Changelog* ("Antes $\rightarrow$ Depois") e commits semânticos no GitHub.
- [x] **2.3 Testes de Usabilidade Executados (S12):**
  - 3 cenários testados e cronometrados com usuários reais e priorização MoSCoW das Top 3 melhorias.
- [x] **2.4 Deploy em Nuvem Ativo + Fluxo de Banco de Dados Funcionando (S13):**
  - Publicado na Vercel com HTTPS e integrado a banco relacional PostgreSQL (Supabase/Neon + Prisma ORM) nos fluxos de Avaliação (`POST/GET /api/reviews`) e Credenciamento (`/contato`).
- [x] **2.5 URL Amigável e Semântica (S14):**
  - Domínio limpo (`https://foddtech.vercel.app/`) e slugs semânticos (`/sobre`, `/contato`, `/login`, `/rankings`, `/prato/[id]`).
- [x] **2.6 Submissão Individual de Todos os Integrantes:**
  - Gabriel Rodrigues, Matheus Vicente e Pedro Simone cientes e com todos os arquivos `.docx` prontos para envio individual no portal.
