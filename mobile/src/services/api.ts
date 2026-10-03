// ==============================================================================
// api.ts — Cliente HTTP para o Backend FastAPI (Caraguá FoodTech)
// ==============================================================================

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

export interface RAGSearchPayload {
  query: string;
  latitude: number;
  longitude: number;
  is_celiac?: boolean;
  is_vegan?: boolean;
  banned_allergens?: string[];
}

export const api = {
  /**
   * Busca híbrida determinística direta (PostGIS + pgvector)
   */
  async getHybridSearch(payload: RAGSearchPayload) {
    const res = await fetch(`${API_BASE_URL}/search/hybrid`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
    return res.json();
  },

  /**
   * Listagem de restaurantes por bairro
   */
  async getRestaurants(neighborhood?: string) {
    const url = neighborhood
      ? `${API_BASE_URL}/restaurants?neighborhood=${encodeURIComponent(neighborhood)}`
      : `${API_BASE_URL}/restaurants`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
    return res.json();
  },

  /**
   * Detalhes de um restaurante específico
   */
  async getRestaurantById(id: string) {
    const res = await fetch(`${API_BASE_URL}/restaurants/${id}`);
    if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
    return res.json();
  },

  /**
   * Verificação de saúde do cluster híbrido (PostGIS + pgvector)
   */
  async checkHealth() {
    const res = await fetch(`${API_BASE_URL}/health`);
    if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
    return res.json();
  },
};

export default api;
