# 🚀 15 MELHORIAS ARQUITETURAIS E DE PRODUTO INSPIRADAS NO ECOSSISTEMA DE IA DO IFOOD (AILO, TOQAN & LARGE COMMERCE MODEL)

> **Documento Estratégico & Engenharia de Produto — CaráFood**  
> **Referência Tecnológica:** Arquitetura de Comércio Agente (Agentic Commerce) do iFood / Prosus (Ailo, Toqan e Large Commerce Model - LCM).  
> **Diretriz de Escopo:** Visão macro de ecossistema foodtech para os 53 bairros de Caraguatatuba/SP, inteligência de consumo, otimização B2B para comerciantes e orquestração de IA de ponta a ponta.

---

## 🏛️ TAXONOMIA ARQUITETURAL & DIRETRIZES DE ENGENHARIA

### 1. COMPONENTES APROVADOS (P0/P1 - Prioridade Estrita de Implementação):
- **Motor de Intenção Subjetiva (Pydantic Instructor):** Decomposição de intenções situacionais em entidades tipadas (`ExtractedIntentSchema`).
- **Smart Defaults:** Injeção de complementos canônicos sem fadiga de decisão ("efeito interrogatório").
- **Explicabilidade XAI:** Micro-veredito factual do Chef Jacquin ancorado nos dados auditados.
- **Roteamento em 2 Camadas:** Roteador Leve + PostGIS + Streaming SSE.
- **Trava SQL Determinística Obrigatória:** Filtro relacional e espacial rígido executado antes de qualquer cálculo de embedding vetorial ou inferência generativa.
- **Jobs Noturnos de Síntese e Engenharia de Cardápio:** Processamento assíncrono em lote (Batch Engineering).
- **Orquestração de Clima via Redis:** Injeção horária de contexto meteorológico (OpenWeatherMap).
- **Copiloto B2B Estruturado por Métricas Pré-Agregadas:** Consultas analíticas seguras através de DTOs e agregações fechadas.
- **Worker Estatístico Anti-Fraude:** Random Forest + Z-Score + Meia-vida exponencial de 30 dias.

### 2. COMPONENTES VETADOS E DESCARTADOS (Rigorosamente Proibidos):
- ❌ **Integração com WhatsApp / Meta Cloud API:** Foco exclusivo na Progressive Web App (PWA) Web Mobile-First, garantindo rica interatividade (Rich Cards, mapas vetoriais, SSE streaming nativo) com custo zero de infraestrutura e sem dependência de plataformas proprietárias.
- ❌ **Memória Vetorial de Longo Prazo por Usuário em `pgvector`:** Preserva a privacidade do comensal, evita custos de armazenamento desnecessários e elimina o risco de alucinação de preferências obsoletas; o contexto de sessão é volátil no Redis.
- ❌ **Estimativa Dinâmica de Tempo de Espera Baseada em IA:** Substituída por horários determinísticos informados e checagem factual de funcionamento; estimativas preditivas de tempo geram falsas expectativas e atrito presencial.
- ❌ **Text-to-SQL Livre para Lojistas:** Vetado sumariamente por risco de injeção de SQL, vazamento de dados de concorrentes e alto consumo de tokens; todas as consultas B2B utilizam rotas parametrizadas e métricas pré-agregadas.

---

## SUMÁRIO EXECUTIVO

O iFood e a Prosus redefiniram o padrão de inteligência artificial aplicada ao setor de alimentação na América Latina ao migrarem da busca tradicional por palavras-chave e navegação estática para o **Comércio Agente (Agentic Commerce)**. O ecossistema apoia-se em três pilares fundamentais:
1. **Large Commerce Model (LCM):** Modelo de domínio proprietário treinado em bilhões de eventos de consumo, operando como classificador e roteador de intenções de ultra-baixa latência e custo até 60x menor que LLMs genéricos.
2. **Ailo (B2C):** Concierge do consumidor com busca semântica aberta, smart defaults, montagem autônoma de sacola/itinerário e experiência rica PWA.
3. **Toqan (B2B):** Copiloto de inteligência de negócios para donos de restaurantes, traduzindo métricas operacionais consolidadas em respostas conversacionais em linguagem natural.

Abaixo estão detalhadas as **15 melhorias de nível sênior** para elevar a arquitetura do **CaráFood** a esse mesmo patamar tecnológico.

---

## EIXO 1: CONCIERGE DO CONSUMIDOR & DESCOBERTA INTELIGENTE (INSPIRAÇÃO: AILO)

### 1. Motor de Intenção Subjetiva e Aberta (Intent-Based Search)
- **Inspiração no iFood:** O Ailo substitui filtros hierárquicos rígidos por interpretação semântica de pedidos subjetivos (ex: *"quero um jantar romântico em até 30min por R$ 50"* ou *"algo leve pós-treino"*).
- **Aplicação no CaráFood:** Evoluir a busca textual para um analisador semântico de intenções situacionais no chat do Chef Jacquin e na barra global (ex: *"refeição farta em família no domingo"*, *"lanche rápido na madrugada"*, *"almoço executivo barato perto de mim"*).
- **Arquitetura Técnica:** Pipeline de extração de entidades via Pydantic Instructor (`ExtractedIntentSchema`) que decompõe a frase em: `ocasião` (romântico, família, rápido), `período_tempo` (almoço, noite), `faixa_preço` (econômico, premium), `ambiente` (presencial/delivery) e `restrições` (vegetariano, sem glúten).
- **Métrica de Impacto:** Redução de 45% no tempo de busca e elevação de 35% na conversão de exploração para visita/pedido.

### 2. Configuração Padrão Inteligente (Smart Defaults) sem Fricção
- **Inspiração no iFood:** Para evitar o "efeito interrogatório" com perguntas intermináveis de customização (tamanho, molho, acompanhamento), o Ailo pré-monta o pedido com as opções de maior probabilidade histórica e permite ajuste em 1 toque.
- **Aplicação no CaráFood:** Quando o usuário demonstrar interesse em um prato (ex: *"quero uma pizza artesanal"* ou *"uma porção de peixe frito"*), o sistema retorna o prato mais bem avaliado do bairro já com os acompanhamentos canônicos recomendados pelo Chef, rota GPS calculada e botão direto de ação.
- **Arquitetura Técnica:** Injeção determinística de complementos canônicos diretamente no payload do card a partir da matriz de compatibilidade culinária do catálogo.
- **Métrica de Impacto:** Queda de 60% na taxa de abandono do fluxo de escolha.

### 3. Explicabilidade da Recomendação (Explainable AI - XAI)
- **Inspiração no iFood:** O Ailo não apenas lista restaurantes; ele sintetiza em uma frase *por que* aquela opção foi escolhida para aquele momento (ex: *"Recomendei este restaurante porque tem entrega em 22 min e é o mais bem avaliado para massas no seu bairro"*).
- **Aplicação no CaráFood:** Cada card sugerido pelo assistente contém o selo de justificação técnica do Chef Jacquin (ex: *"Indico o Quiosque Canto Bravo: nota 4.88 nos últimos 30 dias, zero contaminação cruzada e peixe fresco dos barcos de pesca"*).
- **Arquitetura Técnica:** Injeção de metadados agregados de avaliações no prompt de geração de cards para produzir um micro-veredito factual determinístico, sem alucinações.
- **Métrica de Impacto:** Aumento de 28% no índice de confiança (NPS) e maior credibilidade percebida.

### 4. Assistente Conversacional Web PWA Mobile-First de Alta Fidelidade (Substituição Superior ao WhatsApp)
- **Inspiração no iFood:** Acessibilidade universal em qualquer smartphone sem atrito de instalação pesada.
- **Aplicação no CaráFood:** Concierge Web nativo no PWA CaráFood com renderização de Rich Cards, botões de ação tátil ("Como Chegar", "Ver Cardápio", "Avaliar"), síntese de voz nativa via Web Speech API e streaming de tokens via Server-Sent Events (SSE).
- **Arquitetura Técnica:** Streaming assíncrono via FastAPI (`StreamingResponse`) consumido pelo client React em tempo real. **A integração com Meta Cloud API / WhatsApp é rigorosamente descartada**, eliminando custos de mensagens, risco de banimento de números e limitações de interface textual.
- **Métrica de Impacto:** Custo zero de mensageria, latência sub-100ms no primeiro token e retenção 40% superior através de componentes visuais imersivos.

---

## EIXO 2: ENGENHARIA DE MODELO, RAG & DESEMPENHO (INSPIRAÇÃO: LCM)

### 5. Triagem Rápida em Duas Camadas (LCM Router + LLM Synthesizer)
- **Inspiração no iFood:** O LCM atua como um classificador local de ultra-baixa latência (custo 60x menor que GPT-4o), roteando para LLMs maiores apenas quando necessária síntese verbal complexa.
- **Aplicação no CaráFood:** Substituir chamadas diretas a LLMs pesadas por um roteador de intenção leve. Se a requisição for puramente transacional (ex: *"onde tem comida aberta em Martim de Sá?"*), o roteador dispara consultas ao PostGIS e devolve os dados em <200ms. O modelo narrativo só entra em ação para diálogos ricos ou consultoria culinária.
- **Arquitetura Técnica:** Middleware assíncrono em FastAPI: `IntentClassifier -> Router (Fast Filter vs. GenAI Synthesizer) -> Cache Redis -> Resposta`.
- **Métrica de Impacto:** Redução de 75% nos custos com APIs de IA e latência de resposta caindo de 2.5s para menos de 300ms na maioria das buscas.

### 6. RAG Híbrido com Trava Determinística de Estoque e Status Operacional
- **Inspiração no iFood:** A IA nunca recomenda um prato baseada apenas na memória vetorial estática; ela faz uma checagem relacional síncrona para garantir disponibilidade física.
- **Aplicação no CaráFood:** Impedir que o assistente sugira estabelecimentos inativos ou pratos indisponíveis.
- **Arquitetura Técnica:** Pipeline de 2 passos no serviço de busca:
  1. *Etapa Relacional/Espacial (Trava Determinística Obrigatória):* Filtra `is_active = True`, `is_available = True`, restrições de Food Safety e raio PostGIS via `ST_DWithin`.
  2. *Etapa Vetorial:* Ordena os pratos sobreviventes por similaridade de cosseno (`<=>`) via pgvector HNSW.
- **Métrica de Impacto:** Taxa zero de alucinação para disponibilidade de pratos e conformidade sanitária absoluta.

### 7. Cache Semântico em Redis & Invalidação Inteligente
- **Inspiração no iFood:** Perguntas frequentes com similaridade semântica superior a 95% não recalculam inferência do LLM; são entregues direto da memória RAM.
- **Aplicação no CaráFood:** Consultas repetitivas sobre pratos típicos nos bairros (ex: *"onde comer tainha na Massaguaçu?"* ou *"melhor porção em Martim de Sá"*) são cacheadas em Redis com TTL adaptativo.
- **Arquitetura Técnica:** Cluster Redis 7 armazenando hashes de vetores de consulta; verificação de similaridade de cosseno preliminar no cache antes de invocar o LLM. **Vetada a persistência de vetores de longo prazo por usuário em `pgvector`**; o cache é focado estritamente no catálogo público.
- **Métrica de Impacto:** Economia de 55% de tokens de LLM e tempo de resposta instantâneo (<50ms).

---

## EIXO 3: INTELIGÊNCIA B2B PARA RESTAURANTES (INSPIRAÇÃO: TOQAN)

### 8. Copiloto B2B Estruturado por Métricas Pré-Agregadas (Proibido Text-to-SQL Livre)
- **Inspiração no iFood:** O Toqan responde dúvidas dos gestores sobre o desempenho de sua loja em linguagem clara.
- **Aplicação no CaráFood:** Dentro do portal do comerciante credenciado, uma interface onde o dono do restaurante consulta:
  - *"Quantas pessoas visualizaram meu cardápio esta semana?"*
  - *"Qual dos meus pratos está com a melhor nota na Cédula Oficial?"*
  - *"Como está a nota recente de atendimento nos últimos 30 dias?"*
- **Arquitetura Técnica:** **Proibido Text-to-SQL livre**. O copiloto roteia a pergunta para funções analíticas predefinidas (DTOs fechados) que consultam views agregadas do PostgreSQL, formatando a resposta via LLM com ancoragem estrita nos números retornados.
- **Métrica de Impacto:** 100% de proteção contra SQL Injection e democratização da inteligência de dados para comerciantes locais.

### 9. Engenharia de Cardápio e Diagnóstico de Margem/Desempenho
- **Inspiração no iFood:** O Toqan cruza visualizações, notas e cliques para indicar pratos "estrela" e pratos que demandam otimização.
- **Aplicação no CaráFood:** O sistema analisa a visibilidade e as notas dos pratos do restaurante, emitindo alertas proativos: *"Seu prato X tem nota 4.9 mas pouca visibilidade; coloque-o como destaque do cardápio"* ou *"O prato Y está com nota 3.2 em apresentação; confira as dicas dos clientes para melhorar"*.
- **Arquitetura Técnica:** Job noturno em Python processando correlações estatísticas e gerando cards executivos no painel do restaurante.
- **Métrica de Impacto:** Aumento médio de 20% no engajamento dos itens otimizados.

### 10. Painel Executivo Noturno com Métricas Pré-Agregadas e Push Notifications
- **Inspiração no iFood:** Notificações executivas matinais com o resumo operacional da loja.
- **Aplicação no CaráFood:** Ao final do expediente ou pela manhã, o comerciante acessa um resumo sintético no portal: visualizações, novas avaliações recebidas, posição no ranking do bairro e sugestão de ação culinária do Chef Jacquin.
- **Arquitetura Técnica:** Worker noturno (Nightly Batch) que computa os dados das últimas 24h e emite alertas via Web Push PWA (sem dependência de WhatsApp).
- **Métrica de Impacto:** Aumento do acesso ao painel de 1x por semana para visitas diárias.

### 11. Gerador Inteligente de Descrições Gastronômicas e SEO
- **Inspiração no iFood:** Assistência de copywriting para qualificar itens de cardápio.
- **Aplicação no CaráFood:** Botão *"Melhorar com Chef Jacquin"* no cadastro de pratos, enriquecendo descrições simples em textos que valorizam ingredientes frescos, técnicas de preparo caiçara e texturas.
- **Arquitetura Técnica:** Template de prompt com guardrails rígidos de ingredientes (proibição de inventar insumos não cadastrados).
- **Métrica de Impacto:** Aumento de 32% no clique de detalhe em pratos com descrições ricas.

---

## EIXO 4: OPERAÇÃO EM TEMPO REAL & CONTEXTO DINÂMICO

### 12. Orquestração Sensível ao Clima via Redis (Weather-Driven Discovery)
- **Inspiração no iFood:** Reconfiguração de destaques da Home de acordo com chuva, frio ou calor extremo.
- **Aplicação no CaráFood:** A home e as recomendações do Jacquin se adaptam ao clima de Caraguatatuba (ex: chuva e frio destacam gastronomia de conforto, fondues, caldos e ambientes cobertos; sol e 32°C priorizam quiosques de praia, drinks, frutos do mar e refeições leves).
- **Arquitetura Técnica:** Cron job horário que consome a API OpenWeatherMap, grava o estado meteorológico no Redis e injeta o modificador no score de ranking dos pratos.
- **Métrica de Impacto:** Aumento de 24% na relevância imediata das opções exibidas para quem está na cidade.

### 13. Jobs Noturnos de Síntese e Engenharia de Cardápio (Batch Processing)
- **Inspiração no iFood:** Processamento assíncrono em janelas de baixa carga para recalibrar o ecossistema.
- **Aplicação no CaráFood:** Substituição de cálculos pesados em tempo de requisição por rotinas noturnas que:
  - Recalculam a meia-vida temporal de todas as avaliações (Decaimento Exponencial de 30 dias).
  - Executam a resolução de entidades e deduplicação de cardápios (Entity Resolution).
  - Compilam o ranking oficial dos 53 bairros para acesso instantâneo via CDN/Edge.
- **Arquitetura Técnica:** Script `nightly_batch.py` executado às 03:00 via cron/container worker.
- **Métrica de Impacto:** Latência de leitura na API reduzida para menos de 15ms.

---

## EIXO 5: REPUTAÇÃO, SÍNTESE DE AVALIAÇÕES & SEGURANÇA

### 14. Síntese Automatizada de Avaliações em Prós e Contras (Review Digest)
- **Inspiração no iFood:** Compilação concisa dos pontos mais elogiados e pontos de atenção de cada restaurante.
- **Aplicação no CaráFood:** Na página de detalhe (`/prato/[id]`), uma caixa inteligente exibe:
  - **Destaques Positivos:** *"92% elogiam o frescor do peixe e a crocância do molho tártaro."*
  - **Ponto de Atenção:** *"Alguns clientes relatam procura concorrida nos sábados ao meio-dia."*
- **Arquitetura Técnica:** Clusterização de embeddings de comentários e geração de micro-resumos factuais apenas para avaliações não fraudulentas (`is_fraudulent = False`).
- **Métrica de Impacto:** Decisão de escolha 3x mais rápida por parte do consumidor.

### 15. Worker Estatístico Anti-Fraude e Conformidade LGPD
- **Inspiração no iFood:** Detecção preditiva de fake reviews e blindagem de dados cadastrais.
- **Aplicação no CaráFood:** O worker `ReviewFraudDetector` (Random Forest + Z-Score) e o `LGPDSanitizer` operam em linha em toda avaliação inserida:
  - Mascaram determinística e irreversivelmente CPFs, telefones, e-mails e cartões antes da gravação.
  - Anônimizam a autoria via hash SHA-256 com salt.
  - Expurgam notas forjadas antes que influenciem a média oficial.
- **Arquitetura Técnica:** Pipeline desacoplado em `backend/app/workers/`, executando em tempo de inserção e na varredura de scraping.
- **Métrica de Impacto:** Conformidade estrita com os Artigos 5º e 6º da LGPD e 99.4% de legitimidade nas avaliações.

---

## MATRIZ DE TAXONOMIA E PRIORIDADE

| # | Componente / Melhoria | Módulo CaráFood | Taxonomia | Prioridade | Complexidade |
| :-: | :--- | :--- | :---: | :---: | :---: |
| 1 | Motor de Intenção Subjetiva | `app/core/llm_manager.py` | **Aprovado** | P0 | Média |
| 2 | Smart Defaults (Complementos Canônicos) | `app/services/rag_pipeline.py` | **Aprovado** | P1 | Baixa |
| 3 | Explicabilidade XAI (Selo Jacquin) | `app/services/rag_pipeline.py` | **Aprovado** | P1 | Baixa |
| 4 | Concierge Web PWA Mobile-First (SSE) | `src/components/FloatingJacquin.tsx` | **Aprovado** | P0 | Média |
| 5 | Roteador 2-Camadas (Fast + LLM) | `app/api/routes/search.py` | **Aprovado** | P0 | Alta |
| 6 | Trava SQL Determinística Obrigatória | `app/services/rag_pipeline.py` | **Aprovado** | P0 | Média |
| 7 | Cache Semântico em Redis | `app/core/config.py` | **Aprovado** | P1 | Média |
| 8 | Copiloto B2B por Métricas Pré-Agregadas | `app/api/routes/restaurants.py` | **Aprovado** | P1 | Alta |
| 9 | Engenharia de Cardápio Noturna | `app/workers/nightly_batch.py` | **Aprovado** | P1 | Média |
| 10 | Painel Executivo B2B Noturno (PWA) | `web-admin/src/app` | **Aprovado** | P1 | Média |
| 11 | Gerador de Descrições Gastronômicas | `app/api/routes/restaurants.py` | **Aprovado** | P2 | Baixa |
| 12 | Orquestração Sensível ao Clima (Redis) | `app/workers/nightly_batch.py` | **Aprovado** | P1 | Média |
| 13 | Jobs Noturnos de Síntese em Lote | `app/workers/nightly_batch.py` | **Aprovado** | P0 | Média |
| 14 | Síntese de Avaliações (Review Digest) | `app/workers/nightly_batch.py` | **Aprovado** | P1 | Média |
| 15 | Worker Anti-Fraude e Sanitizador LGPD | `app/workers/sanitizer_lgpd.py` | **Aprovado** | P0 | Baixa |
| — | *Integração com WhatsApp / Meta Cloud API* | *Nenhum* | ❌ **VETADO** | — | — |
| — | *Memória Vetorial de Longo Prazo por Usuário* | *Nenhum* | ❌ **VETADO** | — | — |
| — | *Estimativa Dinâmica de Espera via IA* | *Nenhum* | ❌ **VETADO** | — | — |
| — | *Text-to-SQL Livre para Lojistas* | *Nenhum* | ❌ **VETADO** | — | — |
