import json
import logging
from typing import AsyncGenerator, Dict, Any, List, Optional
from langchain_core.messages import SystemMessage, HumanMessage
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_community.chat_models import ChatOllama
from app.core.config import settings
from app.schemas.intent import ExtractedIntentSchema

logger = logging.getLogger("llm_manager")

class LLMManager:
    """
    Gerenciador Central de Modelos de Linguagem e Orquestração RAG.
    Suporta roteamento dinâmico entre OpenAI (GPT-4o / text-embedding-3-small)
    e modelos locais via Ollama (Llama 3 / Mistral) para soberania de dados.
    """

    def __init__(self):
        self.embedding_dimension = settings.EMBEDDING_DIMENSION
        
        # Inicializa o provedor de Chat principal
        if settings.OPENAI_API_KEY:
            self.chat_model = ChatOpenAI(
                model="gpt-4o",
                temperature=0.2,
                api_key=settings.OPENAI_API_KEY,
                streaming=True
            )
            self.embeddings_model = OpenAIEmbeddings(
                model=settings.EMBEDDING_MODEL_NAME,
                api_key=settings.OPENAI_API_KEY
            )
        else:
            logger.warning("OPENAI_API_KEY não definida. Operando com fallback Ollama local.")
            self.chat_model = ChatOllama(
                base_url=settings.OLLAMA_BASE_URL,
                model="llama3",
                temperature=0.2
            )
            # Embeddings locais (Sentence Transformers ou Ollama)
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
            "Caraguatatuba possui bairros como: Martin de Sá, Centro, Indaiá, Porto Novo, Massaguaçu, Tabatinga.\n"
            "Se o usuário citar um bairro de Caraguatatuba, extraia-o no campo 'neighborhood'.\n"
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
                # Fallback manual de estruturação JSON
                chain = prompt | self.chat_model
                response = await chain.ainvoke({"query": user_query})
                data = json.loads(response.content)
                return ExtractedIntentSchema(**data)
        except Exception as e:
            logger.error(f"Erro na extração de intenção por LLM: {e}. Aplicando heurística determinística.")
            # Heurística segura em caso de falha da LLM
            q_lower = user_query.lower()
            return ExtractedIntentSchema(
                semantic_query=user_query,
                is_vegan="vegano" in q_lower or "vegana" in q_lower,
                is_vegetarian="vegetariano" in q_lower,
                is_gluten_free="glúten" in q_lower or "gluten" in q_lower or "celíaco" in q_lower,
                is_lactose_free="lactose" in q_lower or "queijo" in q_lower and "sem" in q_lower,
                neighborhood="Martin de Sá" if "martin" in q_lower else ("Centro" if "centro" in q_lower else None)
            )

    async def stream_generation(
        self,
        user_query: str,
        factual_context: str,
        user_profile_context: Optional[str] = None
    ) -> AsyncGenerator[str, None]:
        """
        Estágio 5 do Pipeline RAG: Streaming Gerativo com Ancoragem Factual Rígida.
        Impede alucinações confinando o raciocínio estritamente aos pratos e restaurantes
        recuperados na busca do PostGIS + pgvector.
        """
        system_instruction = (
            "Você é o assistente gastronômico inteligente hiperlocal de Caraguatatuba/SP (Caraguá FoodTech).\n"
            "DIRETRIZ DE SEGURANÇA E FACTUALIDADE (LEI MÁXIMA):\n"
            "1. Baseie sua recomendação EXCLUSIVAMENTE nas informações contidas na ÂNCORA FACTUAL abaixo.\n"
            "2. NUNCA invente pratos, restaurantes, preços ou horários que não estejam no contexto.\n"
            "3. Se o usuário tiver restrições alimentares (ex: alergias, celíaco), NUNCA recomende pratos com alérgenos proibidos.\n"
            "4. Mencione sempre o bairro em Caraguatatuba e a distância aproximada calculada pelo PostGIS.\n"
            "5. Destaque avaliações reais e a nota ponderada pelo tempo (evolução de qualidade recente).\n"
            "6. Seja cordial, objetivo e valorize a cultura culinária e caiçara local."
        )

        user_content = (
            f"PERGUNTA DO USUÁRIO: {user_query}\n\n"
            f"PERFIL DO CONSUMIDOR / CONTEXTO DINÂMICO:\n{user_profile_context or 'Sem restrições extras cadastradas.'}\n\n"
            f"ÂNCORA FACTUAL RECUPERADA DETERMINISTICAMENTE DO BANCO (POSTGIS + PGVECTOR):\n"
            f"--------------------------------------------------\n"
            f"{factual_context}\n"
            f"--------------------------------------------------\n"
            f"Gere uma resposta amigável e precisa recomendando as opções mais adequadas."
        )

        prompt = ChatPromptTemplate.from_messages([
            ("system", system_instruction),
            ("human", "{content}")
        ])

        chain = prompt | self.chat_model

        try:
            async for chunk in chain.astream({"content": user_content}):
                content = chunk.content if hasattr(chunk, "content") else str(chunk)
                yield content
        except Exception as e:
            logger.error(f"Erro no streaming de LLM: {e}")
            yield f"Desculpe, ocorreu uma instabilidade ao gerar a resposta: {str(e)}"

llm_manager = LLMManager()
