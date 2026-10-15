# 🗄️ Caraguá FoodTech — Especificação da Base de Dados de Sementes (Seed Dataset)
## Etapa 1 / MVP 1.0 (Entrega Parcial Acadêmica)

> **Contexto:** Análise e Projeto de Sistemas II (APS II) / TCC  
> **Centro Universitário Módulo** — Caraguatatuba / SP  
> **Docente:** Prof. Cristiano S. Negrão  
> **Status:** Amostras Curadas Determinísticas de Alta Fidelidade (Seed V1)

---

### 1. Declaração Formal de Proveniência dos Dados na Etapa 1

Este diretório contém as definições das sementes de dados (**Seed Data**) utilizadas na versão de lançamento inicial (**Release 1.0**) da plataforma Caraguá FoodTech.

**Aviso de Transparência:**
- Os dados presentes nesta versão **NÃO** foram obtidos por meio de raspagem dinâmica de páginas web (Web Scraping) em tempo real.
- Todos os registros (15 pratos, 15 estabelecimentos gastronômicos, avaliações sintéticas auditadas e métricas) foram **curados manualmente e calibrados com base em fontes documentais históricas oficiais**:
  1. Registros e premiados do **Festival Gastronômico Caraguá a Gosto (19ª Edição - 2024)**.
  2. Dados cadastrais da **Associação dos Maricultores da Praia da Cocanha (AMAPEC)**.
  3. Registros tradicionais da **Colônia de Pescadores Z-8 de Caraguatatuba (Entreposto do Camaroeiro)**.
  4. Lista oficial cadastral dos **53 bairros municipais** da Prefeitura de Caraguatatuba.

---

### 2. Justificativa Científica e Metodológica (Padrão MIT / USP)

No desenvolvimento de sistemas complexos orientados a microsserviços e agregadores territoriais:
1. **Separação de Preocupações (SoC):** A Etapa 1 do projeto concentra-se estritamente na validação da **experiência do usuário (UX)**, da **trilha de navegação**, da **responsividade em múltiplos dispositivos** e da **conformidade com as Histórias de Usuário**.
2. **Determinismo nos Testes de Usabilidade:** O uso de sementes estáticas de alta fidelidade permite que comensais, avaliadores e o corpo docente realizem testes de navegação, cédula de votação e busca sem flutuações de rede ou indisponibilidade temporária de servidores de terceiros.
3. **Roadmap para a Etapa 2:** A esteira de automação (scraping com Playwright e BeautifulSoup, ingestão via fila Redis e vetorização de embeddings) está agendada para o ciclo subsequente de desenvolvimento.

---

### 3. Estrutura dos Dados em `caraguaData.ts`

- **`NEIGHBORHOODS`:** Array de 54 itens (53 bairros individuais + seletor global "Todos os 53 Bairros"), com identificadores normalizados, emojis temáticos e descrição de vocação gastronômica.
- **`INITIAL_FEED_POSTS`:** 15 posts estruturados simulando publicações do feed do Instagram com fotografias reais em alta definição, geolocalização exata, distância da orla em quilômetros, super notas ponderadas, badges de sustentabilidade e dicas do Chef Jacquin.
- **`INITIAL_RESTAURANTS`:** Entidades completas de estabelecimentos gastronômicos com cardápio, faixa de preço, selos sanitários e histórico de avaliações.
