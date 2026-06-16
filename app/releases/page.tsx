"use client";
import { useState } from "react";
import {
  CalendarDays, Clock, Flame, Star, Plus, X,
  ExternalLink, Bell, Package, Tag, ChevronRight
} from "lucide-react";
import { UPCOMING_RELEASES, getDaysUntilRelease } from "../../lib/releases";
import toast from "react-hot-toast";

const INITIAL_STORES = [
  { id: "s1", name: "Pokemon Center", url: "https://www.pokemoncenter.com", products: ["ETBs", "Booster Bundles"], notes: "Official store — sells out fast" },
  { id: "s2", name: "Target", url: "https://www.target.com", products: ["Booster Packs", "Tins"], notes: "Limited per customer. Check online & in-store" },
  { id: "s3", name: "Amazon", url: "https://www.amazon.com", products: ["Sealed boxes", "Collections"], notes: "Watch for price drops at release" },
];

const HYPE_COLORS = {
  1: "#4a6080",
  2: "#94a8c0",
  3: "#ffd60a",
  4: "#ff6b35",
  5: "#f0147a",
};

const TYPE_ICONS: Record<string, string> = {
  main_set: "🎴",
  collection: "📦",
  tin: "🥫",
  deck: "🃏",
  promo: "⭐",
  bundle: "🎁",
};

const TYPE_LABELS: Record<string, string> = {
  main_set: "Main Set",
  collection: "Collection",
  tin: "Tin",
  deck: "Battle Deck",
  promo: "Promo",
  bundle: "Bundle",
};

function HypeDots({ level }: { level: 1 | 2 | 3 | 4 | 5 }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className="w-2 h-2 rounded-full"
          style={{ background: i <= level ? HYPE_COLORS[level as keyof typeof HYPE_COLORS] : "#1a2a40" }}
        />
      ))}
    </div>
  );
}

function ReleaseCard({ release }: { release: (typeof UPCOMING_RELEASES)[0] }) {
  const days = getDaysUntilRelease(release.releaseDate);
  const isVeryClose = days <= 7;
  const isClose = days <= 30;

  return (
    <div className={`glass-card card-hover p-4 relative overflow-hidden border
      ${isVeryClose ? "border-[#f0147a33]" : isClose ? "border-[#ff6b3533]" : "border-[#1a2a40]"}`}
    >
      {isVeryClose && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#f0147a] to-transparent" />
      )}

      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">{TYPE_ICONS[release.type]}</span>
          <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border
            ${release.type === "main_set" ? "bg-[#00e5ff11] text-[#00e5ff] border-[#00e5ff33]" :
              release.type === "collection" ? "bg-[#7c3aed11] text-[#7c3aed] border-[#7c3aed33]" :
              "bg-[#ffd60a11] text-[#ffd60a] border-[#ffd60a33]"}`}
          >
            {TYPE_LABELS[release.type]}
          </span>
        </div>
        <div className={`flex items-center gap-1.5 text-xs font-['JetBrains_Mono'] font-bold
          ${isVeryClose ? "text-[#f0147a]" : isClose ? "text-[#ff6b35]" : "text-[#4a6080]"}`}
        >
          <Clock size={10} />
          {days === 0 ? "Today!" : days === 1 ? "Tomorrow!" : `${days}d`}
        </div>
      </div>

      <h3 className="font-['Orbitron'] text-xs font-bold text-[#e8f4ff] tracking-wide leading-snug mb-1">
        {release.name}
      </h3>
      <p className="text-[11px] text-[#4a6080] mb-2">{release.series}</p>
      <p className="text-[11px] text-[#94a8c0] leading-relaxed mb-3 line-clamp-3">{release.description}</p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <HypeDots level={release.hypeLevel} />
          {release.estimatedPrice && (
            <span className="num-display text-[10px] text-[#4a6080]">{release.estimatedPrice}</span>
          )}
        </div>
        <div className="text-[10px] text-[#2a4a6a]">
          {new Date(release.releaseDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </div>
      </div>

      {release.hypeLevel >= 4 && (
        <div className="mt-2 flex items-center gap-1.5">
          <button
            onClick={() => toast.success(`Reminder set for ${release.name}!`)}
            className="text-[10px] flex items-center gap-1 text-[#00e5ff] hover:text-[#00e5ff]/80 transition-colors"
          >
            <Bell size={10} /> Set Reminder
          </button>
        </div>
      )}
    </div>
  );
}

export default function ReleasesPage() {
  const [stores, setStores] = useState(INITIAL_STORES);
  const [showAddStore, setShowAddStore] = useState(false);
  const [newStore, setNewStore] = useState({ name: "", url: "", products: "", notes: "" });

  const upcomingReleases = UPCOMING_RELEASES.sort(
    (a, b) => new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime()
  );

  const nextRelease = upcomingReleases[0];
  const daysToNext = nextRelease ? getDaysUntilRelease(nextRelease.releaseDate) : 0;

  const addStore = () => {
    if (!newStore.name || !newStore.url) return;
    setStores((prev) => [...prev, {
      id: Date.now().toString(),
      name: newStore.name,
      url: newStore.url,
      products: newStore.products.split(",").map(p => p.trim()).filter(Boolean),
      notes: newStore.notes,
    }]);
    setNewStore({ name: "", url: "", products: "", notes: "" });
    setShowAddStore(false);
    toast.success(`${newStore.name} added to store watchlist!`);
  };

  return (
    <div className="min-h-screen grid-bg">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#03040a]/80 backdrop-blur-xl border-b border-[#1a2a40] px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#ff6b3518] border border-[#ff6b3533] flex items-center justify-center">
            <CalendarDays size={16} className="text-[#ff6b35]" />
          </div>
          <div>
            <h1 className="font-['Orbitron'] text-lg font-bold text-[#e8f4ff] tracking-wider">RELEASES</h1>
            <p className="text-xs text-[#4a6080] mt-0.5">Upcoming sets, products & store tracker</p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-5">
        {/* Next release hero */}
        {nextRelease && (
          <div className="animated-border p-[1px]">
            <div className="bg-[#080d14] rounded-xl p-5">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#ff6b3518] border border-[#ff6b3533] flex items-center justify-center text-2xl flex-shrink-0">
                  {TYPE_ICONS[nextRelease.type]}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold text-[#ff6b35] uppercase tracking-wider">Next Release</span>
                    <HypeDots level={nextRelease.hypeLevel} />
                  </div>
                  <h2 className="font-['Orbitron'] text-base font-black text-[#e8f4ff] tracking-wide">
                    {nextRelease.name}
                  </h2>
                  <p className="text-sm text-[#4a6080] mt-0.5">{nextRelease.description}</p>
                </div>
                <div className="text-center flex-shrink-0">
                  <div className="font-['Orbitron'] text-3xl font-black text-[#ff6b35]">{daysToNext}</div>
                  <div className="text-xs text-[#4a6080]">days to go</div>
                  <div className="text-[11px] text-[#2a4a6a] mt-1 num-display">
                    {new Date(nextRelease.releaseDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Calendar timeline */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <CalendarDays size={14} className="text-[#ff6b35]" />
            <h2 className="font-['Orbitron'] text-sm font-bold text-[#e8f4ff] tracking-wider">RELEASE CALENDAR</h2>
            <span className="stat-badge stat-badge-cyan">{upcomingReleases.length} upcoming</span>
          </div>

          {/* Group by month */}
          {Array.from(new Set(upcomingReleases.map(r => r.releaseDate.substring(0, 7)))).map((month) => {
            const monthReleases = upcomingReleases.filter(r => r.releaseDate.startsWith(month));
            const monthLabel = new Date(month + "-01").toLocaleDateString("en-US", { month: "long", year: "numeric" });
            return (
              <div key={month} className="mb-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-px flex-1 bg-[#1a2a40]" />
                  <span className="font-['Orbitron'] text-xs font-bold text-[#4a6080] tracking-widest uppercase">
                    {monthLabel}
                  </span>
                  <div className="h-px flex-1 bg-[#1a2a40]" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {monthReleases.map((r) => <ReleaseCard key={r.id} release={r} />)}
                </div>
              </div>
            );
          })}
        </div>

        {/* Hype legend */}
        <div className="glass-card p-4 flex items-center gap-4 flex-wrap">
          <span className="text-[11px] text-[#4a6080] font-semibold uppercase tracking-wider">Hype Level:</span>
          {([1, 2, 3, 4, 5] as const).map((level) => (
            <div key={level} className="flex items-center gap-2">
              <HypeDots level={level} />
              <span className="text-[11px]" style={{ color: HYPE_COLORS[level] }}>
                {level === 1 ? "Low" : level === 2 ? "Mild" : level === 3 ? "Moderate" : level === 4 ? "High" : "Must-Buy"}
              </span>
            </div>
          ))}
        </div>

        {/* Store Watchlist */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Package size={14} className="text-[#7c3aed]" />
              <h2 className="font-['Orbitron'] text-sm font-bold text-[#e8f4ff] tracking-wider">STORE WATCHLIST</h2>
            </div>
            <button
              onClick={() => setShowAddStore(!showAddStore)}
              className="btn-cyber text-xs"
            >
              <Plus size={13} /> Add Store
            </button>
          </div>

          {showAddStore && (
            <div className="mb-4 p-4 rounded-lg bg-[#080d14] border border-[#1f3350]">
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="text-[10px] text-[#4a6080] uppercase tracking-wider block mb-1">Store Name</label>
                  <input
                    value={newStore.name}
                    onChange={(e) => setNewStore({ ...newStore, name: e.target.value })}
                    placeholder="e.g. Game Nerdz"
                    className="input-cyber w-full px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#4a6080] uppercase tracking-wider block mb-1">URL</label>
                  <input
                    value={newStore.url}
                    onChange={(e) => setNewStore({ ...newStore, url: e.target.value })}
                    placeholder="https://..."
                    className="input-cyber w-full px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#4a6080] uppercase tracking-wider block mb-1">Products (comma-separated)</label>
                  <input
                    value={newStore.products}
                    onChange={(e) => setNewStore({ ...newStore, products: e.target.value })}
                    placeholder="ETBs, Booster Boxes"
                    className="input-cyber w-full px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#4a6080] uppercase tracking-wider block mb-1">Notes</label>
                  <input
                    value={newStore.notes}
                    onChange={(e) => setNewStore({ ...newStore, notes: e.target.value })}
                    placeholder="Optional note..."
                    className="input-cyber w-full px-3 py-2 text-xs"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={addStore} className="btn-cyber btn-cyber-primary text-xs">
                  <Plus size={12} /> Add Store
                </button>
                <button onClick={() => setShowAddStore(false)} className="btn-cyber text-xs">Cancel</button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {stores.map((store) => (
              <div key={store.id} className="p-3 rounded-lg bg-[#080d14] border border-[#1a2a40] hover:border-[#1f3350] transition-all group">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-sm text-[#e8f4ff]">{store.name}</span>
                  <div className="flex gap-1">
                    <a
                      href={store.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-6 h-6 rounded flex items-center justify-center text-[#4a6080] hover:text-[#00e5ff] transition-colors"
                    >
                      <ExternalLink size={11} />
                    </a>
                    <button
                      onClick={() => setStores(prev => prev.filter(s => s.id !== store.id))}
                      className="w-6 h-6 rounded flex items-center justify-center text-[#4a6080] hover:text-[#f0147a] transition-colors"
                    >
                      <X size={11} />
                    </button>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1 mb-2">
                  {store.products.map((p) => (
                    <span key={p} className="text-[9px] px-1.5 py-0.5 rounded bg-[#7c3aed18] text-[#7c3aed] border border-[#7c3aed33]">
                      {p}
                    </span>
                  ))}
                </div>
                {store.notes && (
                  <p className="text-[10px] text-[#4a6080]">{store.notes}</p>
                )}
                <button
                  onClick={() => toast.success(`Reminder set for ${store.name} — Chaos Rising releases May 22!`)}
                  className="mt-2 w-full text-[10px] flex items-center justify-center gap-1 text-[#2a4a6a] hover:text-[#4a6080] transition-colors py-1.5 rounded border border-[#1a2a40] hover:border-[#1f3350]"
                >
                  <Bell size={9} /> Notify me when new releases drop
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Quick links */}
        <div className="glass-card p-4">
          <h3 className="font-['Orbitron'] text-xs font-bold text-[#e8f4ff] tracking-wider mb-3">EXTERNAL RESOURCES</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { name: "PokeGuardian", url: "https://www.pokeguardian.com", desc: "JP/EN news" },
              { name: "Bulbapedia", url: "https://bulbapedia.bulbagarden.net", desc: "Card database" },
              { name: "TCGPlayer", url: "https://www.tcgplayer.com", desc: "Buy/Sell" },
              { name: "CardMarket", url: "https://www.cardmarket.com", desc: "EU prices" },
            ].map((link) => (
              <a
                key={link.name}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2.5 rounded-lg bg-[#080d14] border border-[#1a2a40] hover:border-[#2a4a6a] transition-all text-xs group"
              >
                <div>
                  <div className="font-medium text-[#94a8c0] group-hover:text-[#e8f4ff] transition-colors">{link.name}</div>
                  <div className="text-[10px] text-[#2a4a6a]">{link.desc}</div>
                </div>
                <ExternalLink size={10} className="text-[#2a4a6a] group-hover:text-[#00e5ff] transition-colors" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
