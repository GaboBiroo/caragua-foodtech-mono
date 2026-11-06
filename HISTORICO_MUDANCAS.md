# 📋 HISTÓRICO DE MUDANÇAS & DIRETÓRIO TÉCNICO DO PROJETO
## CaráFood — Monorepo Oficial (`caragua-foodtech-mono`)

> **Nota:** Este arquivo é o registro em português de todas as alterações, saneamentos de diretórios e atualizações do repositório. O arquivo técnico correspondente em inglês/padrão GitHub também está disponível em [`CHANGELOG.md`](file:///c:/Users/Usuario/Desktop/Projetos%20Pessoais/Projeto%20gastronomia%20na%20faculdade/caragua-foodtech-mono/CHANGELOG.md).

---

## 1. 🧹 Resumo da Limpeza e Organização das Pastas

### O que estava desorganizado antes:
1. **Arquivos pesados `.docx` na raiz:** Havia arquivos como `APSII_S10_CARAFOOD.docx` (6.1 MB) e `APSII_S10_CARAFOOD_FINAL.docx` (2.5 MB) jogados diretamente na raiz do projeto.
2. **Dossiês e especificações duplicadas:** Arquivos como `DOSSIE_COMPLETO_CARAFOOD.md`, `AI_CONTEXT.md` e `GEMINI.md` estavam na raiz, mesmo já existindo organizados dentro da pasta `docs/`.
3. **Lixo de compilação:** Caches como `tsconfig.tsbuildinfo` e pastas `__pycache__` geradas ao rodar scripts Python diretamente na raiz.
4. **Pasta `web-admin` desatualizada:** Como a Vercel usa `web-admin` como espelho para trace de empacotamento, a pasta estava com código antigo e faltando as rotas mais recentes de restaurantes e cardápios.
5. **Scripts novos de scraping sem versionamento:** Os scripts de coleta real do Google Maps (`run_full_gmaps_pipeline.py`, `test_gmaps_scraper.py`, etc.) estavam sem rastreamento.

---

### Como ficou organizado agora:

| Item | Onde ficava antes | Onde está agora | Motivo da mudança |
| :--- | :--- | :--- | :--- |
| **Relatório S10 Parcial (6.1 MB)** | Raiz do projeto | `docs/academic/APSII_S10_CARAFOOD.docx` & `entregas_aps2/S10_A2_Entrega_Intermediaria/` | Organização acadêmica; preserva o documento no local oficial da entrega. |
| **Relatório S10 Final A2 (2.5 MB)** | Raiz do projeto | `docs/academic/APSII_S10_CARAFOOD_FINAL.docx` & `entregas_aps2/S10_A2_Entrega_Intermediaria/` | Versão final consolidada arquivada no acervo acadêmico oficial. |
| **Dossiê Completo (90 KB)** | Raiz do projeto | `docs/academic/DOSSIE_COMPLETO_CARAFOOD.md` | Dossiê de 740+ linhas consolidando todo o projeto para a banca e para o Prof. Negrão. |
| **AI Context & Gemini** | Raiz do projeto | `docs/architecture/AI_CONTEXT.md` & `docs/architecture/GEMINI.md` | Removidas as duplicatas da raiz; especificações mantidas na pasta de arquitetura. |
| **Caches de build** | Raiz do projeto | Removidos (`tsconfig.tsbuildinfo`, `__pycache__`) | Ignorados pelo `.gitignore` para manter o Git limpo. |
| **Espelho `web-admin`** | Defasado | Sincronizado 100% com `src/` | Garante que o deploy da Vercel compile sempre o código mais atual sem falhas de build. |
| **Scripts Google Maps** | Soltos/não rastreados | Adicionados e documentados em `scripts/` | Rastreamento formal do robô de coleta real e de testes em lote. |

---

## 2. 📁 Guia Rápido dos Diretórios

- **`src/`:** Código-fonte principal da aplicação web em Next.js 14 App Router (feed de pratos, cédula de votação, explorador dos 53 bairros, moderação e IA).
- **`backend/`:** Servidor em Python FastAPI, banco relacional/vetorial SQLAlchemy, motor RAG de 5 estágios, rotas de IA e scrapers de dados.
- **`docs/`:** Documentação completa (acadêmica da disciplina APS II, arquitetura de sistemas, auditorias de código e pesquisas gastronômicas).
- **`entregas_aps2/`:** Todas as 16 entregas semanais (S01 a S16) exigidas pelo Prof. Cristiano Negrão no Centro Universitário Módulo.
- **`scripts/`:** Ferramentas de automação, pipelines de scraping do Google Maps com Playwright, benchmarks de latência e geradores de relatórios Word.
- **`docker/`:** Configuração do PostgreSQL com PostGIS (geoespacial) e pgvector (busca vetorial semântica).
- **`mobile/`:** Aplicativo móvel em React Native / Expo.
- **`public/`:** Ativos públicos (logo, ilustrações do Jacquin e manifesto PWA).
- **`data/`:** Documentação e contratos das sementes de dados e bairros de Caraguatatuba.
- **`web-admin/`:** Espelho sincronizado para compatibilidade de empacotamento da Vercel.

---

## 3. 🚀 Mudanças Técnicas Recentes

1. **Purgação de Dados Falsos:** Erradicação total de comentários e notas fictícias geradas por IA.
2. **Avaliações Reais do Google Maps:** Ingestão de avaliações autênticas de clientes reais de Caraguatatuba com autor, nota de estrelas e data da visita.
3. **Estados Vazios Elegantes:** Quando um prato não possui avaliação de usuário, o sistema exibe um estado convidativo incentivando o primeiro voto na cédula digital.
4. **Build 100% Validado:** Compilação do Next.js 14 com 17/17 páginas estáticas e rotas dinâmicas geradas com zero erros (`npm run build`).
5. **Deploy Vercel:** Sistema em produção no ar em [`https://foddtech.vercel.app/`](https://foddtech.vercel.app/).
