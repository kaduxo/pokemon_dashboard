import { UpcomingRelease } from "./types";

export const UPCOMING_RELEASES: UpcomingRelease[] = [
  {
    id: "sv-chaos-rising",
    name: "Mega Evolution – Chaos Rising",
    releaseDate: "2026-05-22",
    type: "main_set",
    series: "Scarlet & Violet – Mega Evolution",
    description: "4th expansion in the Mega Evolution block. Features Mega Floette ex, Mega Greninja ex, Mega Pyroar ex, Mega Dragalge ex and 5 Mega Evolution Pokémon ex. Lumiose City theme.",
    hypeLevel: 5,
    estimatedPrice: "$4.99/pack",
  },
  {
    id: "sv-zygarde-collection",
    name: "Mega Zygarde ex Premium Collection",
    releaseDate: "2026-05-22",
    type: "collection",
    series: "Scarlet & Violet – Mega Evolution",
    description: "Foil promo Mega Zygarde ex, oversized lenticular card, tech sticker, and 8 booster packs.",
    hypeLevel: 4,
    estimatedPrice: "$49.99",
  },
  {
    id: "sv-lucario-deck",
    name: "Mega Lucario ex League Battle Deck",
    releaseDate: "2026-05-22",
    type: "deck",
    series: "Scarlet & Violet – Mega Evolution",
    description: "Ready-to-play 60-card competitive deck featuring Mega Lucario ex.",
    hypeLevel: 3,
    estimatedPrice: "$29.99",
  },
  {
    id: "lumiose-mini-tins",
    name: "Lumiose City Mini Tins",
    releaseDate: "2026-06-05",
    type: "tin",
    series: "Scarlet & Violet – Mega Evolution",
    description: "Each tin contains 2 booster packs, a sticker sheet, and a Pokémon art card.",
    hypeLevel: 2,
    estimatedPrice: "$9.99",
  },
  {
    id: "sv-greninja-collection",
    name: "Mega Greninja ex Premium Collection",
    releaseDate: "2026-07-03",
    type: "collection",
    series: "Scarlet & Violet – Mega Evolution",
    description: "Foil promo, oversized foil promo, tech sticker, and 8 Pokémon TCG boosters.",
    hypeLevel: 4,
    estimatedPrice: "$49.99",
  },
  {
    id: "sv-pitch-black",
    name: "Mega Evolution – Pitch Black",
    releaseDate: "2026-07-17",
    type: "main_set",
    series: "Scarlet & Violet – Mega Evolution",
    description: "6 Mega Evolution Pokémon ex, 4 Pokémon ex, 11 Illustration Rare Pokémon, 18 ultra rare cards. Available in booster packs, ETBs, and collections.",
    hypeLevel: 5,
    estimatedPrice: "$4.99/pack",
  },
  {
    id: "jp-abyssal-eye",
    name: "Abyssal Eye (Japanese)",
    releaseDate: "2026-01-31",
    type: "main_set",
    series: "Scarlet & Violet (Japanese)",
    description: "Japanese exclusive set with early previews of cards coming to international releases.",
    hypeLevel: 4,
    estimatedPrice: "¥165/pack",
  },
];

export function getUpcomingReleases(daysAhead = 180): UpcomingRelease[] {
  const now = new Date();
  const future = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);
  return UPCOMING_RELEASES.filter((r) => {
    const d = new Date(r.releaseDate);
    return d >= now && d <= future;
  }).sort((a, b) => new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime());
}

export function getDaysUntilRelease(releaseDate: string): number {
  const now = new Date();
  const release = new Date(releaseDate);
  return Math.ceil((release.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export const MARKET_OPPORTUNITIES = [
  {
    id: "opp-1",
    title: "Prismatic Evolutions ETBs Trending Up",
    description: "Eevee-focused ETBs from Prismatic Evolutions have risen 22% in 30 days due to sealed scarcity. Current market: ~$94.",
    type: "buy" as const,
    urgency: "high" as const,
    source: "TCGPlayer",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "opp-2",
    title: "Surging Sparks Boosters +9.4%",
    description: "Individual booster packs from Surging Sparks climbing ahead of Chaos Rising release. Consider picking up now.",
    type: "buy" as const,
    urgency: "medium" as const,
    source: "CardMarket",
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "opp-3",
    title: "Umbreon VMAX Alt Art Dip",
    description: "Umbreon VMAX Alternate Art (Evolving Skies) dropped 8% this week. Historical support level holds at $280. Potential entry.",
    type: "watch" as const,
    urgency: "medium" as const,
    source: "eBay",
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "opp-4",
    title: "Charizard ex SIR Low Pop PSA 10",
    description: "151 Charizard ex SIR PSA 10 population is unusually low (pop 34). Premium pricing with good upside.",
    type: "grade" as const,
    urgency: "low" as const,
    source: "PSA Pop Report",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
];
