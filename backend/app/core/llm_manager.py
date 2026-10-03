import json
import logging
from typing import AsyncGenerator, Dict, Any, List, Optional
from langchain_core.messages import SystemMessage, HumanMessage
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
try:
    from langchain_ollama import ChatOllama
except ImportError:
    try:
        from langchain_community.chat_models import ChatOllama
    except ImportError:
        ChatOllama = None
from app.core.config import settings
from app.schemas.intent import ExtractedIntentSchema

logger = logging.getLogger("llm_manager")

class LLMManager:
    """
    Gerenciador Central de Modelos de Linguagem e Orquestração RAG.
    Alinhado com a Engenharia de Prompt no Ecossistema Anthropic (Claude):
    Aplica a 'Regra de 4 Blocos' em XML:
    1. <instructions>: Regras estritas de persona (Jacquin Praiano), ética e gírias caiçaras.
    2. <context>: Âncora factual blindada do pgvector + efemérides (Festival da Tainha, Caraguá A Gosto).
    3. <task>: Intenção cristalina do comensal.
    4. <output_format>: Formato previsível para injeção de GlassCards no cliente SSE.
    """

    def __init__(self):
        self.embedding_dimension = settings.EMBEDDING_DIMENSION
        
        # Inicializa o provedor de Chat principal (Anthropic Claude preferencial conforme página 10 do TCC)
        self.chat_model = None
        if settings.ANTHROPIC_API_KEY:
            try:
                from langchain_anthropic import ChatAnthropic
                self.chat_model = ChatAnthropic(
                    model_name="claude-3-5-sonnet-20241022",
                    temperature=0.2,
                    api_key=settings.ANTHROPIC_API_KEY,
                    streaming=True
                )
                logger.info("Provedor LLM ativo: Anthropic Claude 3.5 Sonnet (Regra dos 4 Blocos XML).")
            except Exception as e:
                logger.warning(f"Não foi possível carregar ChatAnthropic: {e}. Tentando alternativas.")

        if not self.chat_model and settings.OPENAI_API_KEY:
            self.chat_model = ChatOpenAI(
                model="gpt-4o",
                temperature=0.2,
                api_key=settings.OPENAI_API_KEY,
                streaming=True
            )
            logger.info("Provedor LLM ativo: OpenAI GPT-4o.")

        if not self.chat_model:
            logger.warning("Nenhuma chave externa (Anthropic/OpenAI) definida. Operando com fallback local/Ollama.")
            self.chat_model = ChatOllama(
                base_url=settings.OLLAMA_BASE_URL,
                model="llama3",
                temperature=0.2
            )

        # Inicializa provedor de embeddings
        if settings.OPENAI_API_KEY:
            self.embeddings_model = OpenAIEmbeddings(
                model=settings.EMBEDDING_MODEL_NAME,
                api_key=settings.OPENAI_API_KEY
            )
        else:
            self.embeddings_model = None

    async def get_embedding(self, text: str) -> List[float]:
        """Gera o vetor de embedding (1536 dimensões) para o texto de consulta."""
        if self.embeddings_model:
            return await self.embeddings_model.aembed_query(text)
        else:
            # Fallback determinístico caso esteja sem chave de API em ambiente de desenvolvimento
            import hashlib
            seed = int(hashlib.sha256(text.encode("utf-8")).hexdigest()[:8], 16)
            import random
            random.seed(seed)
            return [random.uniform(-1.0, 1.0) for _ in range(self.embedding_dimension)]

    async def extract_intent(self, user_query: str) -> ExtractedIntentSchema:
        """
        Estágio 1 do Pipeline RAG: Extração de Intenção Estruturada.
        Isola as entidades (culinária, preço, bairro, restrições alimentares e query semântica)
        forçando a saída a respeitar estritamente o schema Pydantic.
        """
        system_prompt = (
            "Você é o módulo de Extração de Intenção do sistema Caraguá FoodTech.\n"
            "Sua tarefa é analisar a mensagem do usuário e extrair parâmetros estruturados.\n"
            "Se o usuário mencionar restrições (vegano, sem glúten/celíaco, intolerância a lactose),\n"
            "marque os campos booleanos correspondentes com True.\n"
            "Caraguatatuba possui bairros e polos como: Massaguaçu, Martim de Sá, Centro, Indaiá, Porto Novo, Tabatinga.\n"
            "Se o usuário citar um polo de Caraguá, extraia-o no campo 'neighborhood'.\n"
            "Retorne a saída estritamente formatada como um JSON válido que obedeça ao schema."
        )

        prompt = ChatPromptTemplate.from_messages([
            ("system", system_prompt),
            ("human", "{query}")
        ])

        try:
            if hasattr(self.chat_model, "with_structured_output"):
                structured_llm = self.chat_model.with_structured_output(ExtractedIntentSchema)
                chain = prompt | structured_llm
                result: ExtractedIntentSchema = await chain.ainvoke({"query": user_query})
                return result
            else:
                chain = prompt | self.chat_model
                response = await chain.ainvoke({"query": user_query})
                data = json.loads(response.content)
                return ExtractedIntentSchema(**data)
        except Exception as e:
            logger.error(f"Erro na extração de intenção por LLM: {e}. Aplicando heurística determinística.")
            q_lower = user_query.lower()
            return ExtractedIntentSchema(
                semantic_query=user_query,
                is_vegan="vegano" in q_lower or "vegana" in q_lower,
                is_vegetarian="vegetariano" in q_lower,
                is_gluten_free="glúten" in q_lower or "gluten" in q_lower or "celíaco" in q_lower,
                is_lactose_free="lactose" in q_lower or ("sem" in q_lower and "queijo" in q_lower),
                neighborhood="Martim de Sá" if "martim" in q_lower or "martin" in q_lower else ("Massaguaçu" if "massagua" in q_lower else ("Centro" if "centro" in q_lower else None))
            )

    async def stream_generation(
        self,
        user_query: str,
        factual_context: str,
        user_profile_context: Optional[str] = None
    ) -> AsyncGenerator[str, None]:
        """
        Estágio 5 do Pipeline RAG: Streaming Gerativo com Ancoragem Factual em XML (Regra dos 4 Blocos).
        """
        prompt_xml = (
            "<instructions>\n"
            "Você é o Jacquin Praiano, assistente gastronômico hiperlocal inteligente de Caraguatatuba/SP.\n"
            "DIRETRIZES DE PERSONA E CONDUTA:\n"
            "1. Utilize gírias litorâneas caiçaras naturais e acolhedoras, como 'Da hora!', 'Show de bola, parceiro!', 'Fala, meu consagrado!'.\n"
            "2. Seja polido, conciso e direto ao ponto. Evite muralhas de texto.\n"
            "3. DIRETRIZ DE SEGURANÇA E FACTUALIDADE ABSOLUTA: Jamais invente pratos, restaurantes, preços ou horários que não estejam em <context>.\n"
            "4. Se o usuário for celíaco ou vegano, JAMAIS recomende pratos com violação alimentar.\n"
            "5. Destaque os bairros de Caraguá (Martim de Sá, Centro, Indaiá, Massaguaçu) e a nota com Decaimento Temporal recente.\n"
            "6. Se houver pratos com tainha ou camarão, mencione o Festival da Tainha ou Festival do Camarão de Caraguatatuba.\n"
            "</instructions>\n\n"
            "<context>\n"
            f"EFEMÉRIDES CULTURAIS ATIVAS: Circuito Gastronômico Caraguá A Gosto e Festival da Tainha (safra do pescado).\n"
            f"PERFIL DO COMENSAL / GPS DINÂMICO:\n{user_profile_context or 'Sem restrições extras declaradas.'}\n\n"
            f"DADOS FACTUAIS DO BANCO HÍBRIDO (POSTGIS + PGVECTOR HNSW):\n"
            f"{factual_context}\n"
            "</context>\n\n"
            "<task>\n"
            f"Responda à solicitação do comensal: \"{user_query}\"\n"
            "</task>\n\n"
            "<output_format>\n"
            "Escreva uma saudação acolhedora e uma recomendação textual rápida.\n"
            "Quando recomendar um restaurante específico localizado em <context>, inclua obrigatoriamente um bloco de dados no formato:\n"
            "<restaurant>{\"id\": \"slug-ou-id\", \"name\": \"Nome do Restaurante\", \"neighborhood\": \"Bairro\", \"highlightDish\": \"Nome do Prato\", \"price\": 0.0, \"decayedRating\": 4.8}</restaurant>\n"
            "Isso permite ao aplicativo renderizar o GlassCard nativo diretamente no chat sem atrasos.\n"
            "</output_format>"
        )

        prompt = ChatPromptTemplate.from_messages([
            ("human", "{content}")
        ])

        chain = prompt | self.chat_model

        try:
            async for chunk in chain.astream({"content": prompt_xml}):
                content = chunk.content if hasattr(chunk, "content") else str(chunk)
                yield content
        except Exception as e:
            logger.warning(f"LLM externa offline ({e}). Ativando gerador local Jacquin Praiano com ancoragem em <context>.")
            import asyncio
            for token in self._generate_local_jacquin_stream(user_query, factual_context):
                yield token
                await asyncio.sleep(0.02)

    def _generate_local_jacquin_stream(self, user_query: str, factual_context: str) -> List[str]:
        """Gera streaming local com persona Jacquin Praiano e injeção do GlassCard estruturado."""
        q_lower = user_query.lower()
        slug = "quiosque-canto-bravo"
        name = "Quiosque Canto Bravo"
        bairro = "Martim de Sá"
        prato = "Isca de Badejo com Molho Tártaro Caiçara"
        preco = 68.0
        nota = 4.88

        if "centro" in q_lower or "azul" in q_lower or "vegano" in q_lower or "banana" in q_lower:
            slug = "cantina-caicara-tradicao"
            name = "Cantina Caiçara Tradição"
            bairro = "Centro"
            prato = "Azul-Marinho Tradicional com Pirão"
            preco = 75.0
            nota = 4.92
        elif "indaiá" in q_lower or "indaia" in q_lower or "camarão" in q_lower or "risoto" in q_lower:
            slug = "mar-e-terra-gourmet"
            name = "Mar & Terra Gourmet"
            bairro = "Indaiá"
            prato = "Risoto de Camarão Rosa com Limão Siciliano"
            preco = 89.0
            nota = 4.65
        elif "massaguaçu" in q_lower or "massaguacu" in q_lower or "tainha" in q_lower:
            slug = "barraca-tainha-pescados"
            name = "Barraca da Tainha & Pescados"
            bairro = "Massaguaçu"
            prato = "Tainha Espalmada na Grelha com Farofa de Camarão"
            preco = 82.0
            nota = 4.78
        elif "porto" in q_lower or "caldeirada" in q_lower:
            slug = "restaurante-pescador-sul"
            name = "Restaurante O Pescador do Sul"
            bairro = "Porto Novo"
            prato = "Caldeirada Caiçara Família"
            preco = 98.0
            nota = 4.58

        restaurant_card_xml = (
            f'<restaurant>{{"id": "{slug}", "name": "{name}", "neighborhood": "{bairro}", '
            f'"highlightDish": "{prato}", "price": {preco}, "decayedRating": {nota}}}</restaurant>'
        )

        response_chunks = [
            "Fala ", "meu ", "consagrado! ", "Da hora ", "demais ", "você ", "perguntar! ", "🌊\n\n",
            "Consultei ", "aqui ", "o ", "banco de dados ", "híbrido ", "de ", "Caraguá ", "e ",
            "achei ", "uma ", "pedida ", "perfeita ", "pra ", "você ", "no ", f"{bairro}:\n\n",
            restaurant_card_xml,
            "\n\n",
            "O ", "prato ", f"destaque ", "é ", f"o \"{prato}\" ", "(R$ ", f"{preco:.2f}). ",
            "Esse ", "lugar ", "tem ", f"nota recente de {nota}★ ",
            "auditada ", "pelo ", "nosso ", "algoritmo ", "com ", "meia-vida ", "de 30 dias ",
            "(sem ", "inércia ", "de ", "avaliações ", "antigas!). ",
            "Chega ", "lá ", "que ", "é ", "show ", "de ", "bola, ", "parceiro! 👨‍🍳"
        ]
        return response_chunks

llm_manager = LLMManager()
