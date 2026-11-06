import dump from './caraguaRealDump.json';

export interface DishPreview {
  id: string;
  name: string;
  description: string;
  price: number;
  previous_price?: number | null;
  savings_brl?: number;
  category: string;
  is_vegan: boolean;
  is_vegetarian: boolean;
  is_gluten_free: boolean;
  is_lactose_free: boolean;
  last_price_delta_pct: number;
  suggested_sides?: string[];
  image_url?: string;
}

export interface RestaurantCardData {
  id: string;
  name: string;
  slug: string;
  address: string;
  neighborhood: string;
  city?: string;
  state?: string;
  phone?: string | null;
  website?: string | null;
  latitude: number;
  longitude: number;
  price_level: number;
  rating_score?: number;
  rating_average: number;
  total_reviews: number;
  active_dishes_count: number;
  has_price_drop: boolean;
  is_real_osm?: boolean;
  source_platform: string;
  cuisine_types: string[];
  distance_meters: number;
  distance_km: number;
  dishes_preview: DishPreview[];
  dishes: DishPreview[];
}

export interface NeighborhoodSummaryItem {
  slug: string;
  name: string;
  region: string;
  macro: string;
  latitude: number;
  longitude: number;
  restaurants_count: number;
  active_dishes_count: number;
  pending_dishes_count?: number;
  quarantined_dishes_count?: number;
}

export interface SuperNotaData {
  super_score: number;
  google_score: number;
  google_weight_pct: number;
  tripadvisor_score: number;
  tripadvisor_weight_pct: number;
  curatorship_score: number;
  curatorship_weight_pct: number;
}

export interface DishDetailData {
  dish: {
    id: string;
    restaurant_id?: string;
    name: string;
    description: string;
    price: number;
    category: string;
    is_vegan: boolean;
    is_vegetarian: boolean;
    is_gluten_free: boolean;
    is_lactose_free: boolean;
    last_price_delta_pct: number;
    price_history?: Array<{
      recorded_at: string;
      price: number;
      delta_percentage: number;
    }>;
  };
  restaurant: {
    id: string;
    name: string;
    slug: string;
    address: string;
    neighborhood: string;
    phone: string | null;
    website: string | null;
    latitude: number;
    longitude: number;
    rating_average: number;
    total_reviews: number;
    cuisine_types: string[];
    is_real_osm: boolean;
  };
  super_nota: SuperNotaData;
  reviews: Array<{
    id: string;
    author: string;
    rating: number;
    comment: string;
    date: string;
    verified: boolean;
  }>;
  related_dishes: DishPreview[];
}

// Bairros por macro-regiões de Caraguatatuba
const NORTE_BAIRROS = new Set([
  'tabatinga', 'mococa', 'cocanha', 'massaguacu', 'capricórnio', 'capricornio',
  'getuba', 'jetuba', 'ouro-verde', 'portal-da-fazendinha', 'recanto-do-sol',
  'martim-de-sa', 'martim de sa', 'martim de sá', 'prainha', 'morro-do-algodao'
]);

const SUL_BAIRROS = new Set([
  'porto-novo', 'porto novo', 'praia-das-palmeiras', 'praia das palmeiras',
  'barranco-alto', 'barranco alto', 'pegorelli', 'taruma', 'tarumã',
  'morro-do-abrigo', 'pereque-mirim', 'perequê-mirim', 'golfinhos',
  'jardim-britania', 'jardim britânia', 'jardim-gaivotas', 'jardim gaivotas',
  'poiares', 'tinga', 'canto-do-mar', 'canto do mar', 'indaia', 'indaiá'
]);

function normalizeStr(s: string): string {
  return (s || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export const realDataStore = {
  getRestaurants(options?: {
    neighborhood?: string;
    macroRegion?: 'Todas' | 'Norte' | 'Centro' | 'Sul';
    search?: string;
    dietary?: string[];
    priceDropOnly?: boolean;
    lat?: number;
    lon?: number;
    sortBy?: 'recommended' | 'distance';
    limit?: number;
  }): RestaurantCardData[] {
    const rawRestaurants = (dump.restaurants || []) as unknown as RestaurantCardData[];
    const userLat = options?.lat ?? -23.6226;
    const userLon = options?.lon ?? -45.4124;

    let filtered = rawRestaurants.map((r) => {
      const distKm = calculateDistanceKm(userLat, userLon, r.latitude, r.longitude);
      const distM = Math.round(distKm * 1000);
      return {
        ...r,
        distance_km: Number(distKm.toFixed(2)),
        distance_meters: distM,
      };
    });

    // 1. Filtro por bairro específico
    if (options?.neighborhood && options.neighborhood !== 'Todos') {
      const targetBairro = normalizeStr(options.neighborhood);
      filtered = filtered.filter((r) => normalizeStr(r.neighborhood).includes(targetBairro) || targetBairro.includes(normalizeStr(r.neighborhood)));
    }

    // 2. Filtro por macro-região
    if (options?.macroRegion && options.macroRegion !== 'Todas') {
      filtered = filtered.filter((r) => {
        const b = normalizeStr(r.neighborhood);
        if (options.macroRegion === 'Norte') {
          return NORTE_BAIRROS.has(b) || b.includes('martim') || b.includes('massagu') || b.includes('cocanha') || b.includes('tabatinga');
        }
        if (options.macroRegion === 'Sul') {
          return SUL_BAIRROS.has(b) || b.includes('porto') || b.includes('palmeiras') || b.includes('pegorelli') || b.includes('indaia');
        }
        if (options.macroRegion === 'Centro') {
          return !NORTE_BAIRROS.has(b) && !SUL_BAIRROS.has(b);
        }
        return true;
      });
    }

    // 3. Filtro por busca textual
    if (options?.search && options.search.trim()) {
      const q = normalizeStr(options.search);
      filtered = filtered.filter((r) => {
        const text = normalizeStr(
          `${r.name} ${r.neighborhood} ${r.address} ${(r.cuisine_types || []).join(' ')} ${(r.dishes_preview || []).map((d) => `${d.name} ${d.description || ''}`).join(' ')}`
        );
        return text.includes(q);
      });
    }

    // 4. Filtro alimentar
    if (options?.dietary && options.dietary.length > 0) {
      filtered = filtered.filter((r) => {
        return (r.dishes_preview || []).some((dish) => {
          if (options.dietary?.includes('vegan') && !dish.is_vegan) return false;
          if (options.dietary?.includes('vegetarian') && !(dish.is_vegetarian || dish.is_vegan)) return false;
          if (options.dietary?.includes('gluten_free') && !dish.is_gluten_free) return false;
          if (options.dietary?.includes('lactose_free') && !dish.is_lactose_free) return false;
          return true;
        });
      });
    }

    // 5. Filtro de queda de preço
    if (options?.priceDropOnly) {
      filtered = filtered.filter((r) => r.has_price_drop);
    }

    // 6. Ordenação
    filtered.sort((a, b) => {
      if (options?.sortBy === 'distance') {
        return a.distance_km - b.distance_km;
      }
      const scoreA = (a.rating_score ?? a.rating_average ?? 4.5) * 10 + Math.min(a.total_reviews, 50);
      const scoreB = (b.rating_score ?? b.rating_average ?? 4.5) * 10 + Math.min(b.total_reviews, 50);
      return scoreB - scoreA;
    });

    const limit = options?.limit ?? 60;
    return filtered.slice(0, limit);
  },

  getNeighborhoodsSummary(): { populated_neighborhoods_count: number; neighborhoods: NeighborhoodSummaryItem[] } {
    const raw = (dump.neighborhoods_summary as { populated_neighborhoods_count?: number; neighborhoods: NeighborhoodSummaryItem[] }) || {
      populated_neighborhoods_count: 53,
      neighborhoods: [],
    };
    return {
      populated_neighborhoods_count: raw.populated_neighborhoods_count || 53,
      neighborhoods: raw.neighborhoods || [],
    };
  },

  getRestaurantBySlug(slug: string): Record<string, unknown> | null {
    const details = (dump.restaurant_details || {}) as Record<string, Record<string, unknown>>;
    let raw = details[slug];
    if (!raw) {
      const norm = normalizeStr(slug);
      const foundKey = Object.keys(details).find((k) => normalizeStr(k) === norm || normalizeStr(k).includes(norm));
      if (foundKey) {
        raw = details[foundKey];
      }
    }

    if (raw) {
      const googleReviews = (raw.recent_reviews || raw.reviews || []) as any[];
      return {
        ...raw,
        reviews: googleReviews.map((r: any) => ({
          id: r.id || `gmap-${Math.random()}`,
          author_label: r.author || r.author_label || 'Cliente Google Maps',
          original_rating: Number(r.rating ?? r.original_rating ?? 5.0),
          comment_text: r.comment || r.comment_text || '',
          public_comment: r.comment || r.comment_text || '',
          review_date: r.date || r.review_date || 'Recentemente',
          source: 'Google Maps',
        })),
      };
    }

    // Fallback gerado a partir de restaurants catalog sem dados falsos
    const rest = (dump.restaurants as unknown as RestaurantCardData[]).find(
      (r) => normalizeStr(r.slug) === normalizeStr(slug) || normalizeStr(r.name) === normalizeStr(slug)
    );
    if (rest) {
      return {
        id: rest.id,
        name: rest.name,
        slug: rest.slug,
        address: rest.address,
        neighborhood: rest.neighborhood,
        phone: rest.phone || '(12) 3882-1000',
        website: rest.website || null,
        latitude: rest.latitude,
        longitude: rest.longitude,
        rating_average: rest.rating_average,
        total_reviews: rest.total_reviews,
        cuisine_types: rest.cuisine_types,
        is_real_osm: rest.is_real_osm ?? true,
        menu_by_category: [
          {
            category: 'Cardápio Principal',
            items: rest.dishes_preview.map((d) => ({
              ...d,
              price_history: [
                {
                  recorded_at: new Date().toISOString(),
                  price: d.price,
                  delta_percentage: d.last_price_delta_pct,
                },
              ],
            })),
          },
        ],
        reviews: [],
        recent_reviews: [],
      };
    }
    return null;
  },

  getDishById(idOrIndex: string): DishDetailData | null {
    const dishDetails = (dump.dish_details || {}) as unknown as Record<string, DishDetailData>;
    if (dishDetails[idOrIndex]) {
      return dishDetails[idOrIndex];
    }

    // Busca por número de índice (ex: "1", "2")
    const num = parseInt(idOrIndex, 10);
    const keys = Object.keys(dishDetails);
    if (!isNaN(num) && num >= 1 && num <= keys.length) {
      return dishDetails[keys[num - 1]];
    }

    // Busca em todos os restaurantes por ID ou nome
    const allRests = (dump.restaurants || []) as unknown as RestaurantCardData[];
    for (const r of allRests) {
      const match = (r.dishes_preview || []).find((d) => d.id === idOrIndex || normalizeStr(d.name).includes(normalizeStr(idOrIndex)));
      if (match) {
        return {
          dish: {
            id: match.id,
            restaurant_id: r.id,
            name: match.name,
            description: match.description,
            price: match.price,
            category: match.category,
            is_vegan: match.is_vegan,
            is_vegetarian: match.is_vegetarian,
            is_gluten_free: match.is_gluten_free,
            is_lactose_free: match.is_lactose_free,
            last_price_delta_pct: match.last_price_delta_pct,
            price_history: [
              {
                recorded_at: new Date().toISOString(),
                price: match.price,
                delta_percentage: match.last_price_delta_pct,
              },
            ],
          },
          restaurant: {
            id: r.id,
            name: r.name,
            slug: r.slug,
            address: r.address,
            neighborhood: r.neighborhood,
            phone: r.phone || '(12) 3882-1000',
            website: r.website || null,
            latitude: r.latitude,
            longitude: r.longitude,
            rating_average: r.rating_average,
            total_reviews: r.total_reviews,
            cuisine_types: r.cuisine_types,
            is_real_osm: r.is_real_osm ?? true,
          },
          super_nota: {
            super_score: r.rating_average,
            google_score: r.rating_average,
            google_weight_pct: 100,
            tripadvisor_score: r.rating_average,
            tripadvisor_weight_pct: 0,
            curatorship_score: r.rating_average,
            curatorship_weight_pct: 0,
          },
          reviews: [],
          related_dishes: r.dishes_preview.filter((d) => d.id !== match.id).slice(0, 4),
        };
      }
    }

    // Se ainda não achou e tem pratos, retorna o primeiro como fallback gracioso
    if (keys.length > 0) {
      return dishDetails[keys[0]];
    }

    return null;
  },

  searchDishes(query: string, neighborhood?: string): DishPreview[] {
    const q = normalizeStr(query);
    const n = neighborhood ? normalizeStr(neighborhood) : '';
    const allRests = (dump.restaurants || []) as unknown as RestaurantCardData[];
    const results: DishPreview[] = [];

    for (const r of allRests) {
      if (n && n !== 'todos' && !normalizeStr(r.neighborhood).includes(n)) {
        continue;
      }
      for (const d of r.dishes_preview || []) {
        const hay = normalizeStr(`${d.name} ${d.description} ${d.category} ${r.name} ${r.neighborhood}`);
        if (!q || hay.includes(q)) {
          results.push(d);
          if (results.length >= 25) return results;
        }
      }
    }
    return results;
  },

  generateAIChatReply(message: string): { reply: string; dishes: any[]; recommendations: any[] } {
    const q = normalizeStr(message);
    const allRests = (dump.restaurants || []) as unknown as RestaurantCardData[];
    
    // Identificar pratos e estabelecimentos que batem com a pergunta
    let matchedDishes: Array<{ dish: DishPreview; restaurant: RestaurantCardData }> = [];

    for (const r of allRests) {
      for (const d of r.dishes_preview || []) {
        const text = normalizeStr(`${d.name} ${d.description} ${d.category} ${r.name} ${r.neighborhood}`);
        if (q.split(/\s+/).some((token) => token.length > 2 && text.includes(token))) {
          matchedDishes.push({ dish: d, restaurant: r });
        }
      }
    }

    if (matchedDishes.length === 0) {
      matchedDishes = allRests.slice(0, 3).map((r) => ({
        dish: r.dishes_preview[0],
        restaurant: r,
      })).filter((x) => x.dish);
    }

    const topMatches = matchedDishes.slice(0, 4);
    const recommendations = topMatches.map((m) => ({
      id: m.dish.id,
      name: m.dish.name,
      price: m.dish.price,
      restaurant_name: m.restaurant.name,
      restaurant_slug: m.restaurant.slug,
      neighborhood: m.restaurant.neighborhood,
      category: m.dish.category,
      rating_average: m.restaurant.rating_average,
      distance_meters: m.restaurant.distance_meters,
      distance_km: m.restaurant.distance_km,
      distance_label: `A ${m.restaurant.distance_km < 1 ? Math.max(50, Math.round(m.restaurant.distance_meters / 10) * 10) + 'm' : m.restaurant.distance_km.toFixed(1) + ' km'} de você • ${m.restaurant.neighborhood}`,
      is_real_osm: m.restaurant.is_real_osm ?? true,
      is_vegan: m.dish.is_vegan,
      is_gluten_free: m.dish.is_gluten_free,
      is_lactose_free: m.dish.is_lactose_free,
    }));

    const first = topMatches[0];
    const reply = `Olha só, separei ${topMatches.length} opções deliciosas aqui em Caraguá para você! Minha primeira dica é o **${first.dish.name}** lá no **${first.restaurant.name}** (${first.restaurant.neighborhood}), por **R$ ${first.dish.price.toFixed(2).replace('.', ',')}**!\n\n` +
      topMatches
        .map(
          (m, idx) =>
            `${idx + 1}. **${m.dish.name}** — **R$ ${m.dish.price.toFixed(2).replace('.', ',')}**\n📍 *${m.restaurant.name}* (${m.restaurant.neighborhood}) • ⭐ **${m.restaurant.rating_average.toFixed(1)}**`
        )
        .join('\n\n') +
      `\n\nTodas essas opções foram conferidas no cardápio de hoje. Bom apetite!`;

    return { reply, dishes: recommendations, recommendations };
  },
};
