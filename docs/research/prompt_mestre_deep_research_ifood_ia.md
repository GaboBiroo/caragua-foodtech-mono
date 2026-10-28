# 🔬 PROMPT MESTRE DE DEEP RESEARCH: ECOSSISTEMA DE IA DO IFOOD (AILO, TOQAN & LARGE COMMERCE MODEL) vs. CARÁFOOD

> **Finalidade:** Prompt de pesquisa profunda (Deep Research / Engenharia Reversa de Produto) para ser executado em motores de busca avançada e agentes de IA (Google Gemini Deep Research, Perplexity Pro, OpenAI Deep Research).
> **Objetivo:** Mapear minuciosamente a arquitetura técnica, experiência do usuário (UX), modelo de linguagem de comércio (LCM), fluxos conversacionais e impacto mercadológico das soluções de IA do iFood (**Ailo** e **Toqan**), extraindo aprendizados de engenharia sênior e diferenciais competitivos para a plataforma **CaráFood (Caraguá FoodTech)**.

---

```text
Você é um Engenheiro de Software Principal, Especialista em Inteligência Artificial Generativa Aplicada ao E-commerce (Agentic Commerce) e Designer de Produto Sênior.

Sua missão é realizar uma pesquisa profunda, exaustiva e de nível industrial (Deep Research) sobre o novo ecossistema de Inteligência Artificial lançado pelo iFood, com foco central no "Ailo" (assistente/concierge de IA para consumidores) e no "Toqan" (assistente de gestão para restaurantes), analisando como essa tecnologia pode ser dissecada, comparada e adaptada para uma plataforma hiperlocal e turística de food service chamada CaráFood.

Estruture sua pesquisa e devolva um relatório técnico completo contendo obrigatoriamente as 7 dimensões a seguir:

---

### DIMENSÃO 1: ANATOMIA E ARQUITETURA DO "AILO" (CONCIERGE DO CONSUMIDOR)
1. O que é o Ailo na prática? Qual é a sua proposta de valor declarada pelo iFood (eliminar a fadiga de decisão, busca semântica vs. filtros tradicionais)?
2. Como funciona a interação multimodal e multicanal (aplicativo nativo via chat/voz vs. integração oficial via WhatsApp)?
3. Como opera o fluxo "One-Click Buy" (compra em 1 clique):
   - Como a IA traduz comandos subjetivos (ex: "quero meu hambúrguer favorito", "jantar romântico leve em até 30 minutos", "lanche barato com cupom") em uma sacola estruturada?
   - Como é feita a aplicação autônoma de regras de negócio (cupons de desconto disponíveis, taxas de entrega e pagamento nativo via Pix/cartão sem transição de tela)?
4. Qual é a estratégia de Memória e Personalização:
   - Como o histórico de compras, hábitos alimentares, restrições e horários de consumo são indexados e recuperados durante o diálogo?

---

### DIMENSÃO 2: ENGENHARIA DE MODELO — O "LARGE COMMERCE MODEL" (LCM) & STACK
1. O que é o Large Commerce Model (LCM) anunciado pelo iFood em parceria com a Prosus?
2. Como o LCM se diferencia de modelos de linguagem genéricos (GPT-4o, Claude 3.5 Sonnet, Gemini 1.5 Pro)?
   - Treinamento em dados transacionais de compras, catálogos alimentares e comportamento de consumo brasileiro.
   - Orquestração híbrida: como o modelo proprietário se conecta com APIs globais (OpenAI, Anthropic, AWS Bedrock)?
3. Pipeline RAG (Retrieval-Augmented Generation) e busca vetorial:
   - Como o iFood lida com milhares de itens de cardápios dinâmicos, estoques voláteis e restaurantes abrindo/fechando em tempo real?
   - Estratégias de Function Calling / Tool Calling para acionar endpoints internos de busca, precificação e fechamento de pedidos.

---

### DIMENSÃO 3: ASSISTENTE "TOQAN" (INTELIGÊNCIA B2B PARA RESTAURANTES)
1. Como o Toqan atua na ponta dos comerciantes e operadores de restaurante?
2. Quais tipos de consultas em linguagem natural ele processa (ex: "Cresci ontem?", "Qual meu item de menor margem?", "Costumo vender mais às quintas-feiras?")?
3. Como ele democratiza a análise de dados (BI / Business Intelligence) para pequenos estabelecimentos sem equipe analítica?

---

### DIMENSÃO 4: UX CONVERSACIONAL & PSICOLOGIA DO CONSUMIDOR DE COMIDA
1. Qual é a taxa de adesão e fricção observada em assistentes conversacionais de comida? As pessoas preferem digitar, falar ou navegar visualmente?
2. Como o iFood equilibra a "conversa" com a "exibição visual de pratos" (respostas textuais puras vs. rich cards com foto, preço e tempo)?
3. Como a IA lida com desambiguação de pedidos (ex: tamanho de pizza, ponto da carne, remoção de cebola/molho) sem se tornar prolixa ou cansativa?

---

### DIMENSÃO 5: LIMITAÇÕES, VULNERABILIDADES E CRÍTICAS AO MODELO DO IFOOD
1. Alucinações em cardápios: como o sistema evita sugerir pratos indisponíveis ou inventar preços/ingredientes?
2. Risco de Segurança Alimentar (Food Safety): como a IA do iFood reage diante de restrições severas (celíacos, intolerância a lactose, anafilaxia a frutos do mar)? Ela dá garantias ou transfere a responsabilidade para o restaurante?
3. Dependência do modelo de entrega tradicional: como o Ailo trata o público que quer comer no local (presencial / turismo) vs. delivery?
4. Taxas de intermediação: o Ailo favorece restaurantes que pagam por impulsionamento/anúncios patrocinados dentro do app?

---

### DIMENSÃO 6: BENCHMARK COMPARATIVO — IFOOD (AILO) vs. CARÁFOOD (CHEF JACQUIN)
Compare lado a lado em uma matriz técnica:
| Critério de Comparação | iFood (Ailo / LCM) | CaráFood (Chef Jacquin / RAG 5 Estágios) |
| :--- | :--- | :--- |
| **Foco Geográfico** | Nacional / Massificado | Hiperlocal (53 Bairros de Caraguatatuba) |
| **Público & Momento** | Delivery imediato em casa | Descoberta turística, comensal na praia e rota GPS |
| **Persona & Tom de Voz** | Assistente neutro / corporativo | Chef Érick Jacquin (crítico, bem-humorado, regional caiçara) |
| **Critério de Recomendação** | Histórico pessoal + algoritmos de conversão comercial | Cédula Oficial ponderada (5 critérios) + Decaimento 30d |
| **Rastreabilidade de Origem** | Opaca (industrial vs. artesanal sem distinção) | Transparente (Selos AMAPEC Cocanha e Colônia Z-8) |
| **Modelo de Monetização** | Comissão de 27% a 30% por pedido | Credenciamento gratuito (0% taxa) + B2B ético |

---

### DIMENSÃO 7: PLANO DE ABSORÇÃO & AÇÕES TÁTICAS PARA O CARÁFOOD
Apresente 5 recomendações práticas de engenharia de software e produto que o CaráFood deve absorver da estratégia do iFood para tornar seu assistente (Chef Jacquin) ainda mais competitivo:
1. Implementação de comandos de intenção subjetiva rápida (ex: "estou na praia e quero petisco crocante", "chuva e caldinho quente");
2. Integração conversacional via WhatsApp (como criar um concierge CaráFood no WhatsApp para turistas na serra/praia);
3. Geração de roteiros gastronômicos de 1 dia na cidade através de uma única frase;
4. Guardrails estritos de contaminação cruzada e segurança alimentar;
5. Mecanismo de feedback rápido no estilo "conversar com o Jacquin" sem perder o apelo apetitoso das fotografias reais.
```
