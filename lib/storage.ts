import fs from "fs";
import path from "path";
import { CollectionCard, PriceAlert, StoreWatch, PortfolioHistory } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readJSON<T>(filename: string, defaultValue: T): T {
  ensureDataDir();
  const filePath = path.join(DATA_DIR, filename);
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(defaultValue, null, 2));
      return defaultValue;
    }
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return defaultValue;
  }
}

function writeJSON<T>(filename: string, data: T): void {
  ensureDataDir();
  const filePath = path.join(DATA_DIR, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// --- Collection ---
export function getCollection(): CollectionCard[] {
  return readJSON<CollectionCard[]>("collection.json", []);
}

export function saveCollection(cards: CollectionCard[]): void {
  writeJSON("collection.json", cards);
}

export function addToCollection(card: CollectionCard): CollectionCard[] {
  const collection = getCollection();
  const existing = collection.findIndex((c) => c.uid === card.uid);
  if (existing >= 0) {
    collection[existing] = card;
  } else {
    collection.push(card);
  }
  saveCollection(collection);
  return collection;
}

export function removeFromCollection(uid: string): CollectionCard[] {
  const collection = getCollection().filter((c) => c.uid !== uid);
  saveCollection(collection);
  return collection;
}

export function updateCollectionCard(uid: string, updates: Partial<CollectionCard>): CollectionCard[] {
  const collection = getCollection().map((c) =>
    c.uid === uid ? { ...c, ...updates } : c
  );
  saveCollection(collection);
  return collection;
}

// --- Alerts ---
export function getAlerts(): PriceAlert[] {
  return readJSON<PriceAlert[]>("alerts.json", []);
}

export function saveAlerts(alerts: PriceAlert[]): void {
  writeJSON("alerts.json", alerts);
}

export function addAlert(alert: PriceAlert): PriceAlert[] {
  const alerts = getAlerts();
  alerts.push(alert);
  saveAlerts(alerts);
  return alerts;
}

export function removeAlert(id: string): PriceAlert[] {
  const alerts = getAlerts().filter((a) => a.id !== id);
  saveAlerts(alerts);
  return alerts;
}

// --- Store Watches ---
export function getStoreWatches(): StoreWatch[] {
  return readJSON<StoreWatch[]>("stores.json", []);
}

export function saveStoreWatches(stores: StoreWatch[]): void {
  writeJSON("stores.json", stores);
}

export function addStoreWatch(store: StoreWatch): StoreWatch[] {
  const stores = getStoreWatches();
  stores.push(store);
  saveStoreWatches(stores);
  return stores;
}

export function removeStoreWatch(id: string): StoreWatch[] {
  const stores = getStoreWatches().filter((s) => s.id !== id);
  saveStoreWatches(stores);
  return stores;
}

// --- Portfolio History ---
export function getPortfolioHistory(): PortfolioHistory[] {
  return readJSON<PortfolioHistory[]>("history.json", []);
}

export function appendPortfolioHistory(entry: PortfolioHistory): void {
  const history = getPortfolioHistory();
  const today = new Date().toISOString().split("T")[0];
  const existing = history.findIndex((h) => h.date === today);
  if (existing >= 0) {
    history[existing] = entry;
  } else {
    history.push(entry);
  }
  // Keep last 365 days
  const trimmed = history.slice(-365);
  writeJSON("history.json", trimmed);
}

// --- Async aliases for API routes ---
export async function readCollection(): Promise<CollectionCard[]> {
  return getCollection()
}
export async function writeCollection(cards: CollectionCard[]): Promise<void> {
  saveCollection(cards)
}
export async function readAlerts(): Promise<PriceAlert[]> {
  return getAlerts()
}
export async function writeAlerts(alerts: PriceAlert[]): Promise<void> {
  saveAlerts(alerts)
}

// --- Settings ---
export interface AppSettings {
  currency: "USD" | "EUR" | "GBP";
  pokemonApiKey: string;
  priceSource: "tcgplayer" | "cardmarket";
  notificationsEnabled: boolean;
}

export function getSettings(): AppSettings {
  return readJSON<AppSettings>("settings.json", {
    currency: "USD",
    pokemonApiKey: "",
    priceSource: "tcgplayer",
    notificationsEnabled: true,
  });
}

export function saveSettings(settings: AppSettings): void {
  writeJSON("settings.json", settings);
}
