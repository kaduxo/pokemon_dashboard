export interface PokemonCard {
  id: string;
  name: string;
  number: string;
  set: {
    id: string;
    name: string;
    series: string;
    releaseDate: string;
    total: number;
    images: { symbol: string; logo: string };
  };
  images: { small: string; large: string };
  rarity?: string;
  types?: string[];
  supertype: string;
  subtypes?: string[];
  hp?: string;
  artist?: string;
  tcgplayer?: {
    url: string;
    updatedAt: string;
    prices?: {
      normal?: { low: number; mid: number; high: number; market: number };
      holofoil?: { low: number; mid: number; high: number; market: number };
      reverseHolofoil?: { low: number; mid: number; high: number; market: number };
      "1stEditionHolofoil"?: { low: number; mid: number; high: number; market: number };
    };
  };
  cardmarket?: {
    url: string;
    updatedAt: string;
    prices?: {
      averageSellPrice?: number;
      lowPrice?: number;
      trendPrice?: number;
      reverseHoloTrend?: number;
    };
  };
  nationalPokedexNumbers?: number[];
  legalities?: { standard?: string; expanded?: string; unlimited?: string };
}

export type CardCondition = "mint" | "near_mint" | "lightly_played" | "moderately_played" | "heavily_played" | "damaged";
export type CardStatus = "raw" | "graded" | "sealed";
export type GradeCompany = "PSA" | "BGS" | "CGC" | "SGC";

export interface CollectionCard {
  uid: string; // unique id for this collection entry
  cardId: string;
  cardData?: PokemonCard;
  condition: CardCondition;
  status: CardStatus;
  quantity: number;
  purchasePrice?: number;
  purchaseDate?: string;
  notes?: string;
  tags?: string[];
  // Graded card fields
  grade?: number;
  gradeCompany?: GradeCompany;
  gradeCertNumber?: string;
  // Market tracking
  currentPrice?: number;
  priceUpdatedAt?: string;
  // For sealed products
  productName?: string;
}

export interface Portfolio {
  totalValue: number;
  totalCost: number;
  totalCards: number;
  totalGraded: number;
  totalSealed: number;
  gainLoss: number;
  gainLossPercent: number;
  lastUpdated: string;
}

export interface PriceAlert {
  id: string;
  cardId: string;
  cardName: string;
  targetPrice: number;
  alertType: "above" | "below";
  active: boolean;
  triggeredAt?: string;
  createdAt: string;
  currentPrice?: number;
  cardImage?: string;
}

export interface StoreWatch {
  id: string;
  name: string;
  url: string;
  products: string[];
  notes?: string;
  createdAt: string;
}

export interface UpcomingRelease {
  id: string;
  name: string;
  releaseDate: string;
  type: "main_set" | "collection" | "tin" | "deck" | "promo" | "bundle";
  description: string;
  series: string;
  imageUrl?: string;
  preorderAvailable?: boolean;
  estimatedPrice?: string;
  hypeLevel: 1 | 2 | 3 | 4 | 5;
}

export interface PortfolioHistory {
  date: string;
  value: number;
  cost: number;
}

export interface GradingSimInput {
  cardId: string;
  cardName: string;
  rawPrice: number;
  estimatedCondition: number; // 1-10 raw score estimate
  company: GradeCompany;
  serviceLevel: "economy" | "standard" | "express" | "super_express";
  shippingCost: number;
}

export interface GradingSimResult {
  grade: number;
  probability: number;
  gradedPrice: number;
  gradingCost: number;
  netProfit: number;
  roi: number;
  recommendation: "grade" | "sell_raw" | "hold";
}
