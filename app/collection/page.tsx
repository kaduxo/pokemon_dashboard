"use client";
import { useState, useCallback, useEffect } from "react";
import {
  Search, Plus, Grid3X3, List, X, Loader2, Trash2,
  Package,
} from "lucide-react";
import toast from "react-hot-toast";

interface DisplayCard {
  uid: string;
  cardId: string;
  name: string;
  set: string;
  rarity: string;
  type: string;
  image: string;
  condition: string;
  status: string;
  quantity: number;
  purchasePrice: number;
  currentPrice: number;
  grade?: number;
  gradeCompany?: string;
  tags: string[];
}

const STATUSES = ["All", "Raw", "Graded", "Sealed"];

const conditionColor: Record<string, string> = {
  mint: "#00ff9d",
  near_mint: "#00e5ff",
  lightly_played: "#ffd60a",
  moderately_played: "#ff6b35",
  heavily_played: "#f0147a",
  damaged: "#94a8c0",
};

const typeClass: Record<string, string> = {
  Fire: "type-fire", Water: "type-water", Grass: "type-grass",
  Lightning: "type-electric", Psychic: "type-psychic", Dragon: "type-dragon",
  Dark: "type-dark", Steel: "type-steel", Colorless: "type-colorless",
  Fighting: "type-fighting", Fairy: "type-fairy",
};

function getCardMarketPrice(card: any): number {
  return card.tcgplayer?.prices?.holofoil?.market
    || card.tcgplayer?.prices?.["1stEditionHolofoil"]?.market
    || card.tcgplayer?.prices?.normal?.market
    || card.tcgplayer?.prices?.reverseHolofoil?.market
    || 0;
}

function CardGridItem({ card, onRemove }: { card: DisplayCard; onRemove: (uid: string) => void }) {
  const gain = (card.currentPrice || 0) - (card.purchasePrice || 0);
  const gainPct = card.purchasePrice > 0 ? ((gain / card.purchasePrice) * 100).toFixed(1) : "0.0";
  const isPos = gain >= 0;
  const [showActions, setShowActions] = useState(false);

  return (
    <div
      className="glass-card card-hover relative overflow-hidden cursor-pointer group"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="relative aspect-[3/4] bg-gradient-to-b from-[#0d1520] to-[#080d14] overflow-hidden rounded-t-xl">
        <img
          src={card.image}
          alt={card.name}
          className="w-full h-full object-contain p-2 transition-transform duration-300 group-hover:scale-105"
          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
        />
        {card.status === "graded" && card.grade && (
          <div className="absolute top-2 left-2 bg-[#0d1520]/90 backdrop-blur text-[10px] font-bold font-['JetBrains_Mono'] px-2 py-1 rounded-md border border-[#ffd60a44] text-[#ffd60a]">
            {card.gradeCompany} {card.grade}
          </div>
        )}
        <div className={`absolute top-2 right-2 text-[9px] font-bold uppercase tracking-wider px-2 py-1 rounded-md font-['Outfit']
          ${card.status === "graded" ? "bg-[#7c3aed22] text-[#7c3aed] border border-[#7c3aed44]" :
            card.status === "sealed" ? "bg-[#ffd60a22] text-[#ffd60a] border border-[#ffd60a44]" :
            "bg-[#00e5ff11] text-[#00e5ff] border border-[#00e5ff22]"}`}
        >
          {card.status}
        </div>
        {showActions && (
          <div className="absolute inset-0 bg-[#03040a]/70 backdrop-blur-sm flex items-center justify-center gap-2 rounded-t-xl">
            <button
              onClick={(e) => { e.stopPropagation(); onRemove(card.uid); }}
              className="w-8 h-8 rounded-lg bg-[#0d1520] border border-[#1f3350] flex items-center justify-center hover:border-[#f0147a] transition-all"
              title="Remove"
            >
              <Trash2 size={13} className="text-[#f0147a]" />
            </button>
          </div>
        )}
      </div>
      <div className="p-3">
        <div className="text-xs font-semibold text-[#e8f4ff] truncate mb-1">{card.name}</div>
        <div className="flex items-center gap-1.5 mb-2">
          <span className="text-[10px] text-[#4a6080]">{card.set}</span>
          {card.type && card.type !== "—" && (
            <span className={`text-[9px] px-1.5 py-0.5 rounded border font-medium ${typeClass[card.type] || "type-colorless"}`}>
              {card.type}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between">
          <div>
            <div className="num-display text-sm font-bold text-[#e8f4ff]">
              {card.currentPrice > 0 ? `$${card.currentPrice.toFixed(2)}` : "—"}
            </div>
            <div className={`num-display text-[10px] ${isPos ? "text-[#00ff9d]" : "text-[#f0147a]"}`}>
              {isPos ? "+" : ""}{gainPct}%
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-[#4a6080]">Paid</div>
            <div className="num-display text-[11px] text-[#4a6080]">
              {card.purchasePrice > 0 ? `$${card.purchasePrice}` : "—"}
            </div>
          </div>
        </div>
        {card.quantity > 1 && (
          <div className="mt-1.5 text-[10px] text-[#4a6080]">×{card.quantity}</div>
        )}
        {card.tags && card.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {card.tags.slice(0, 2).map((tag) => (
              <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded bg-[#1f3350] text-[#4a6080] border border-[#2a4a6a] font-['Outfit']">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AddCardModal({ onClose, onAdd }: { onClose: () => void; onAdd: (card: DisplayCard) => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [condition, setCondition] = useState("near_mint");
  const [status, setStatus] = useState("raw");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [saving, setSaving] = useState(false);

  const search = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/cards?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setResults(data.data || []);
      if ((data.data || []).length === 0) toast("No cards found. Try a different name.", { icon: "🔍" });
    } catch {
      toast.error("Search failed. Check your API key in settings.");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const marketPrice = getCardMarketPrice(selected);
      const res = await fetch("/api/collection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cardId: selected.id,
          name: selected.name,
          set: selected.set?.name || "",
          rarity: selected.rarity || "Unknown",
          type: selected.types?.[0] || "—",
          image: selected.images?.large || selected.images?.small || "",
          condition,
          status,
          quantity: parseInt(quantity) || 1,
          purchasePrice: parseFloat(purchasePrice) || 0,
          currentPrice: marketPrice,
          tags: [],
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`${selected.name} added to collection!`);
        onAdd(data.data);
        onClose();
      } else {
        toast.error("Failed to save card");
      }
    } catch {
      toast.error("Failed to save card");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0d1520] border border-[#1f3350] rounded-xl w-full max-w-lg p-5 animate-slide-up">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-['Orbitron'] text-sm font-bold text-[#e8f4ff] tracking-wider">ADD CARD</h3>
          <button onClick={onClose} className="text-[#4a6080] hover:text-[#e8f4ff] transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="flex gap-2 mb-4">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && search()}
            placeholder="Search card name... e.g. Charizard"
            className="input-cyber flex-1 px-3 py-2 text-sm"
          />
          <button onClick={search} disabled={loading} className="btn-cyber btn-cyber-primary">
            {loading ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
          </button>
        </div>

        {results.length > 0 && !selected && (
          <div className="space-y-1.5 max-h-60 overflow-y-auto mb-4">
            {results.map((card) => (
              <div
                key={card.id}
                onClick={() => setSelected(card)}
                className="flex items-center gap-3 p-2.5 rounded-lg cursor-pointer border bg-[#080d14] border-[#1a2a40] hover:border-[#1f3350] transition-all text-sm"
              >
                <img src={card.images?.small} alt={card.name} className="w-8 h-11 object-contain flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-[#e8f4ff] text-xs truncate">{card.name}</div>
                  <div className="text-[10px] text-[#4a6080]">{card.set?.name} · #{card.number}</div>
                </div>
                <div className="num-display text-xs text-[#00e5ff] flex-shrink-0">
                  {getCardMarketPrice(card) > 0 ? `$${getCardMarketPrice(card).toFixed(2)}` : "—"}
                </div>
              </div>
            ))}
          </div>
        )}

        {selected && (
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-2.5 rounded-lg bg-[#00e5ff11] border border-[#00e5ff33] mb-2">
              <img src={selected.images?.small} alt={selected.name} className="w-8 h-11 object-contain flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-[#e8f4ff] text-xs truncate">{selected.name}</div>
                <div className="text-[10px] text-[#4a6080]">{selected.set?.name} · #{selected.number}</div>
              </div>
              <button onClick={() => { setSelected(null); setResults([]); }} className="text-[#4a6080] hover:text-[#e8f4ff]">
                <X size={14} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-[#4a6080] uppercase tracking-wider block mb-1">Condition</label>
                <select value={condition} onChange={(e) => setCondition(e.target.value)} className="input-cyber w-full px-3 py-2 text-sm">
                  <option value="near_mint">Near Mint</option>
                  <option value="mint">Mint</option>
                  <option value="lightly_played">Lightly Played</option>
                  <option value="moderately_played">Moderately Played</option>
                  <option value="heavily_played">Heavily Played</option>
                  <option value="damaged">Damaged</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] text-[#4a6080] uppercase tracking-wider block mb-1">Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)} className="input-cyber w-full px-3 py-2 text-sm">
                  <option value="raw">Raw</option>
                  <option value="graded">Graded</option>
                  <option value="sealed">Sealed</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] text-[#4a6080] uppercase tracking-wider block mb-1">Purchase Price ($)</label>
                <input
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(e.target.value)}
                  placeholder="0.00"
                  className="input-cyber w-full px-3 py-2 text-sm"
                  type="number"
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="text-[11px] text-[#4a6080] uppercase tracking-wider block mb-1">Quantity</label>
                <input
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="input-cyber w-full px-3 py-2 text-sm"
                  type="number"
                  min="1"
                />
              </div>
            </div>
            <button
              onClick={handleAdd}
              disabled={saving}
              className="btn-cyber btn-cyber-primary w-full justify-center py-2.5"
            >
              {saving && <Loader2 size={14} className="animate-spin mr-2" />}
              Add to Collection
            </button>
          </div>
        )}

        {results.length === 0 && !loading && !selected && query && (
          <div className="text-center py-6 text-[#4a6080] text-sm">
            No results. Try a different card name.
          </div>
        )}
      </div>
    </div>
  );
}

export default function CollectionPage() {
  const [collection, setCollection] = useState<DisplayCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showAdd, setShowAdd] = useState(false);
  const [sortBy, setSortBy] = useState<"value" | "gain" | "name">("value");

  useEffect(() => {
    fetch("/api/collection")
      .then((r) => r.json())
      .then((d) => setCollection(d.data || []))
      .catch(() => setCollection([]))
      .finally(() => setLoading(false));
  }, []);

  const filtered = collection
    .filter((c) => {
      const matchSearch =
        (c.name || "").toLowerCase().includes(search.toLowerCase()) ||
        (c.set || "").toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "All" || c.status === statusFilter.toLowerCase();
      return matchSearch && matchStatus;
    })
    .sort((a, b) => {
      if (sortBy === "value") return (b.currentPrice || 0) - (a.currentPrice || 0);
      if (sortBy === "gain")
        return (
          (b.currentPrice || 0) - (b.purchasePrice || 0) -
          ((a.currentPrice || 0) - (a.purchasePrice || 0))
        );
      return (a.name || "").localeCompare(b.name || "");
    });

  const totalValue = collection.reduce((s, c) => s + (c.currentPrice || 0) * (c.quantity || 1), 0);
  const totalCost = collection.reduce((s, c) => s + (c.purchasePrice || 0) * (c.quantity || 1), 0);
  const totalGain = totalValue - totalCost;

  const handleRemove = useCallback(async (uid: string) => {
    try {
      const res = await fetch(`/api/collection?id=${uid}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setCollection((prev) => prev.filter((c) => c.uid !== uid));
        toast.success("Card removed from collection");
      } else {
        toast.error("Failed to remove card");
      }
    } catch {
      toast.error("Failed to remove card");
    }
  }, []);

  const handleAdd = useCallback((card: DisplayCard) => {
    setCollection((prev) => [...prev, card]);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen grid-bg flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-[#00e5ff]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen grid-bg">
      <div className="sticky top-0 z-10 bg-[#03040a]/80 backdrop-blur-xl border-b border-[#1a2a40] px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-['Orbitron'] text-lg font-bold text-[#e8f4ff] tracking-wider">COLLECTION</h1>
            <p className="text-xs text-[#4a6080] mt-0.5">
              {collection.length} cards ·{" "}
              <span className="text-[#00e5ff] num-display">${totalValue.toFixed(2)}</span> total value
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setView(view === "grid" ? "list" : "grid")} className="btn-cyber">
              {view === "grid" ? <List size={14} /> : <Grid3X3 size={14} />}
            </button>
            <button onClick={() => setShowAdd(true)} className="btn-cyber btn-cyber-primary">
              <Plus size={14} /> Add Card
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-4 gap-3 mb-5">
          {[
            { label: "Total Value", value: `$${totalValue.toFixed(2)}`, color: "#00e5ff" },
            { label: "Total Gain/Loss", value: `${totalGain >= 0 ? "+" : ""}$${totalGain.toFixed(2)}`, color: totalGain >= 0 ? "#00ff9d" : "#f0147a" },
            { label: "Total Cards", value: collection.length, color: "#7c3aed" },
            { label: "Graded", value: collection.filter((c) => c.status === "graded").length, color: "#ffd60a" },
          ].map((s) => (
            <div key={s.label} className="glass-card px-4 py-3 text-center">
              <div className="num-display font-bold text-lg" style={{ color: s.color }}>{s.value}</div>
              <div className="text-[11px] text-[#4a6080] mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-5">
          <div className="relative flex-1 min-w-48">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4a6080]" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search cards..."
              className="input-cyber w-full pl-9 pr-4 py-2 text-sm"
            />
          </div>
          <div className="flex gap-1.5">
            {STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all font-['Outfit']
                  ${statusFilter === s
                    ? "bg-[#00e5ff22] text-[#00e5ff] border border-[#00e5ff44]"
                    : "bg-[#0d1520] text-[#4a6080] border border-[#1a2a40] hover:text-[#94a8c0]"}`}
              >
                {s}
              </button>
            ))}
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="input-cyber px-3 py-2 text-sm"
          >
            <option value="value">Sort: Value</option>
            <option value="gain">Sort: Gain</option>
            <option value="name">Sort: Name</option>
          </select>
        </div>

        {collection.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Package size={48} className="text-[#2a4a6a] mb-4" />
            <h3 className="font-['Orbitron'] text-lg font-bold text-[#4a6080] mb-2">YOUR COLLECTION IS EMPTY</h3>
            <p className="text-sm text-[#2a4a6a] mb-6">Start building your portfolio by adding your first card</p>
            <button onClick={() => setShowAdd(true)} className="btn-cyber btn-cyber-primary">
              <Plus size={14} /> Add Your First Card
            </button>
          </div>
        ) : view === "grid" ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
            {filtered.map((card) => (
              <CardGridItem key={card.uid} card={card} onRemove={handleRemove} />
            ))}
            <div
              onClick={() => setShowAdd(true)}
              className="glass-card border-dashed border-[#1a2a40] hover:border-[#2a4a6a] flex flex-col items-center justify-center aspect-[3/4] cursor-pointer group transition-all"
              style={{ minHeight: "200px" }}
            >
              <Plus size={24} className="text-[#2a4a6a] group-hover:text-[#00e5ff] transition-colors mb-2" />
              <span className="text-[11px] text-[#2a4a6a] group-hover:text-[#4a6080] transition-colors font-['Outfit']">
                Add Card
              </span>
            </div>
          </div>
        ) : (
          <div className="glass-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1a2a40]">
                  {["Card", "Set", "Condition", "Status", "Paid", "Value", "P&L", ""].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-[11px] text-[#4a6080] font-semibold uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1a2a40]">
                {filtered.map((card) => {
                  const gain = (card.currentPrice || 0) - (card.purchasePrice || 0);
                  const gainPct = card.purchasePrice > 0 ? ((gain / card.purchasePrice) * 100).toFixed(1) : "0.0";
                  return (
                    <tr key={card.uid} className="hover:bg-white/2 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img src={card.image} alt="" className="w-8 h-11 object-contain" onError={(e) => { (e.target as any).style.display = "none"; }} />
                          <div className="font-semibold text-[#e8f4ff] text-xs">{card.name}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[#4a6080] text-xs">{card.set}</td>
                      <td className="px-4 py-3">
                        <span className="text-[11px] capitalize" style={{ color: conditionColor[card.condition] || "#94a8c0" }}>
                          {(card.condition || "").replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full
                          ${card.status === "graded" ? "bg-[#7c3aed22] text-[#7c3aed]" :
                            card.status === "sealed" ? "bg-[#ffd60a22] text-[#ffd60a]" :
                            "bg-[#00e5ff11] text-[#00e5ff]"}`}
                        >
                          {card.status}{card.grade ? ` · ${card.gradeCompany} ${card.grade}` : ""}
                        </span>
                      </td>
                      <td className="px-4 py-3 num-display text-[#4a6080] text-xs">
                        {card.purchasePrice > 0 ? `$${card.purchasePrice}` : "—"}
                      </td>
                      <td className="px-4 py-3 num-display font-bold text-[#e8f4ff] text-sm">
                        {card.currentPrice > 0 ? `$${card.currentPrice.toFixed(2)}` : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`num-display text-xs font-bold ${gain >= 0 ? "text-[#00ff9d]" : "text-[#f0147a]"}`}>
                          {gain >= 0 ? "+" : ""}${gain.toFixed(2)} ({gainPct}%)
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button onClick={() => handleRemove(card.uid)} className="text-[#2a4a6a] hover:text-[#f0147a] transition-colors">
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showAdd && <AddCardModal onClose={() => setShowAdd(false)} onAdd={handleAdd} />}
    </div>
  );
}
