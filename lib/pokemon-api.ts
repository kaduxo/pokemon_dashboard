import { PokemonCard } from "./types";

const API_BASE = "https://api.pokemontcg.io/v2";

function getHeaders() {
  const apiKey = process.env.POKEMON_TCG_API_KEY || "";
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (apiKey) headers["X-Api-Key"] = apiKey;
  return headers;
}

export async function searchCards(query: string, page = 1, pageSize = 20): Promise<{ data: PokemonCard[]; totalCount: number }> {
  const params = new URLSearchParams({
    q: query,
    page: String(page),
    pageSize: String(pageSize),
    orderBy: "-set.releaseDate",
  });

  const res = await fetch(`${API_BASE}/cards?${params}`, {
    headers: getHeaders(),
    next: { revalidate: 300 },
  });

  if (!res.ok) throw new Error(`Pokemon API error: ${res.status}`);
  const json = await res.json();
  return { data: json.data || [], totalCount: json.totalCount || 0 };
}

export async function getCard(id: string): Promise<PokemonCard | null> {
  const res = await fetch(`${API_BASE}/cards/${id}`, {
    headers: getHeaders(),
    next: { revalidate: 300 },
  });
  if (!res.ok) return null;
  const json = await res.json();
  return json.data || null;
}

export async function getSets(): Promise<any[]> {
  const res = await fetch(`${API_BASE}/sets?orderBy=-releaseDate`, {
    headers: getHeaders(),
    next: { revalidate: 3600 },
  });
  if (!res.ok) return [];
  const json = await res.json();
  return json.data || [];
}

export async function getCardsBySet(setId: string): Promise<PokemonCard[]> {
  const params = new URLSearchParams({
    q: `set.id:${setId}`,
    pageSize: "250",
    orderBy: "number",
  });
  const res = await fetch(`${API_BASE}/cards?${params}`, {
    headers: getHeaders(),
    next: { revalidate: 600 },
  });
  if (!res.ok) return [];
  const json = await res.json();
  return json.data || [];
}

export function getCardPrice(card: PokemonCard): number {
  const p = card.tcgplayer?.prices;
  if (!p) return card.cardmarket?.prices?.trendPrice || 0;
  return (
    p.holofoil?.market ||
    p["1stEditionHolofoil"]?.market ||
    p.normal?.market ||
    p.reverseHolofoil?.market ||
    card.cardmarket?.prices?.trendPrice ||
    0
  );
}

export function getCardPriceDetails(card: PokemonCard) {
  const p = card.tcgplayer?.prices;
  const cm = card.cardmarket?.prices;
  return {
    market: p?.holofoil?.market || p?.normal?.market || p?.["1stEditionHolofoil"]?.market || cm?.trendPrice || 0,
    low: p?.holofoil?.low || p?.normal?.low || cm?.lowPrice || 0,
    high: p?.holofoil?.high || p?.normal?.high || 0,
    trend: cm?.trendPrice || 0,
    tcgUrl: card.tcgplayer?.url || "",
  };
}

export function getRarityColor(rarity?: string): string {
  if (!rarity) return "#94a8c0";
  const r = rarity.toLowerCase();
  if (r.includes("secret") || r.includes("hyper")) return "#ffd60a";
  if (r.includes("illustration rare") || r.includes("special illustration")) return "#f0147a";
  if (r.includes("ultra") || r.includes("full art")) return "#7c3aed";
  if (r.includes("rare holo") || r.includes("double rare")) return "#00e5ff";
  if (r.includes("rare")) return "#00a8ff";
  if (r.includes("uncommon")) return "#00ff9d";
  if (r.includes("common")) return "#94a8c0";
  return "#94a8c0";
}

export function getRarityBadgeClass(rarity?: string): string {
  if (!rarity) return "rarity-common";
  const r = rarity.toLowerCase();
  if (r.includes("secret") || r.includes("hyper")) return "rarity-secret";
  if (r.includes("illustration rare") || r.includes("special illustration")) return "rarity-sr";
  if (r.includes("ultra") || r.includes("full art")) return "rarity-ultra";
  if (r.includes("rare holo") || r.includes("double rare")) return "rarity-holo";
  if (r.includes("rare")) return "rarity-rare";
  if (r.includes("uncommon")) return "rarity-uncommon";
  return "rarity-common";
}
