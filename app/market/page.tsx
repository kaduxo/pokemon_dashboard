"use client";
import { useState } from "react";
import {
  TrendingUp, TrendingDown, Bell, Plus, X,
  Flame, Eye, ArrowUpRight, ArrowDownRight,
  Star, Target, Activity, Zap, BellOff
} from "lucide-react";
import toast from "react-hot-toast";
import { MARKET_OPPORTUNITIES } from "../../lib/releases";

const TRENDING_UP = [
  { name: "Prismatic Evolutions ETB", change: 22.1, price: 94, from: 77, icon: "📦", tag: "Sealed" },
  { name: "Surging Sparks Booster", change: 9.4, price: 5.80, from: 5.30, icon: "🎴", tag: "Pack" },
  { name: "Charizard ex SIR #006", change: 12.4, price: 320, from: 284, icon: "🔥", tag: "SIR" },
  { name: "Pikachu Illustrator Reprint", change: 7.8, price: 115, from: 106, icon: "⚡", tag: "Promo" },
];

const TRENDING_DOWN = [
  { name: "Umbreon VMAX Alt Art", change: -3.2, price: 285, from: 295, icon: "🌙", tag: "Alt Art" },
  { name: "Evolving Skies Booster Box", change: -5.1, price: 289, from: 304, icon: "📦", tag: "Sealed" },
  { name: "Rayquaza VMAX AA", change: -1.5, price: 160, from: 162, icon: "🐉", tag: "Alt Art" },
];

const INITIAL_ALERTS = [
  { id: "a1", cardName: "Umbreon VMAX Alt Art", targetPrice: 270, alertType: "below", active: true, currentPrice: 285, cardImage: "🌙" },
  { id: "a2", cardName: "Charizard ex SIR", targetPrice: 350, alertType: "above", active: true, currentPrice: 320, cardImage: "🔥" },
  { id: "a3", cardName: "Prismatic Evolutions ETB", targetPrice: 80, alertType: "below", active: false, currentPrice: 94, cardImage: "📦" },
];

const WATCHLIST = [
  { name: "Moonbreon Alt Art", set: "Evolving Skies", price: 95, target: 120, change7d: 5.1, watching: true },
  { name: "Mew VMAX Alt Art", set: "Fusion Strike", price: 68, target: 85, change7d: -2.3, watching: true },
  { name: "Blastoise ex SIR", set: "151", price: 95, target: 110, change7d: 3.8, watching: true },
  { name: "Leafeon VMAX Alt Art", set: "Evolving Skies", price: 52, target: 65, change7d: 1.2, watching: true },
];

function OpportunityCard({ opp }: { opp: (typeof MARKET_OPPORTUNITIES)[0] }) {
  const colors = {
    buy: { bg: "#00ff9d08", border: "#00ff9d33", badge: "bg-[#00ff9d22] text-[#00ff9d] border border-[#00ff9d44]", icon: "🟢" },
    watch: { bg: "#ffd60a08", border: "#ffd60a33", badge: "bg-[#ffd60a22] text-[#ffd60a] border border-[#ffd60a44]", icon: "🟡" },
    grade: { bg: "#7c3aed08", border: "#7c3aed33", badge: "bg-[#7c3aed22] text-[#7c3aed] border border-[#7c3aed44]", icon: "🟣" },
  };
  const c = colors[opp.type as keyof typeof colors];

  const timeSince = (ts: string) => {
    const diff = Date.now() - new Date(ts).getTime();
    const h = Math.floor(diff / 3600000);
    const d = Math.floor(h / 24);
    return d > 0 ? `${d}d ago` : `${h}h ago`;
  };

  return (
    <div className="glass-card card-hover p-4 border" style={{ background: c.bg, borderColor: c.border.replace("33", "22") }}>
      <div className="flex items-start justify-between mb-2">
        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${c.badge}`}>
          {c.icon} {opp.type === "buy" ? "Buy Signal" : opp.type === "watch" ? "Watch" : "Grade Opp"}
        </span>
        <div className="flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${opp.urgency === "high" ? "bg-[#f0147a] animate-pulse" : opp.urgency === "medium" ? "bg-[#ffd60a]" : "bg-[#4a6080]"}`} />
          <span className="text-[10px] text-[#4a6080] capitalize">{opp.urgency}</span>
        </div>
      </div>
      <h3 className="font-semibold text-[#e8f4ff] text-sm mb-1">{opp.title}</h3>
      <p className="text-xs text-[#4a6080] leading-relaxed mb-2">{opp.description}</p>
      <div className="flex items-center justify-between text-[10px] text-[#2a4a6a]">
        <span>{opp.source}</span>
        <span>{timeSince(opp.timestamp)}</span>
      </div>
    </div>
  );
}

export default function MarketPage() {
  const [alerts, setAlerts] = useState(INITIAL_ALERTS);
  const [showAddAlert, setShowAddAlert] = useState(false);
  const [newAlert, setNewAlert] = useState({ cardName: "", targetPrice: "", alertType: "below" });

  const addAlert = () => {
    if (!newAlert.cardName || !newAlert.targetPrice) return;
    setAlerts((prev) => [...prev, {
      id: Date.now().toString(),
      cardName: newAlert.cardName,
      targetPrice: Number(newAlert.targetPrice),
      alertType: newAlert.alertType as "above" | "below",
      active: true,
      currentPrice: 0,
      cardImage: "🎴",
    }]);
    setNewAlert({ cardName: "", targetPrice: "", alertType: "below" });
    setShowAddAlert(false);
    toast.success("Alert created!");
  };

  const toggleAlert = (id: string) => {
    setAlerts((prev) => prev.map((a) => a.id === id ? { ...a, active: !a.active } : a));
  };

  const removeAlert = (id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
    toast("Alert removed", { icon: "🗑️" });
  };

  return (
    <div className="min-h-screen grid-bg">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#03040a]/80 backdrop-blur-xl border-b border-[#1a2a40] px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#f0147a18] border border-[#f0147a33] flex items-center justify-center">
            <TrendingUp size={16} className="text-[#f0147a]" />
          </div>
          <div>
            <h1 className="font-['Orbitron'] text-lg font-bold text-[#e8f4ff] tracking-wider">MARKET INTEL</h1>
            <p className="text-xs text-[#4a6080] mt-0.5">Price alerts, opportunities & market trends</p>
          </div>
          <div className="ml-auto flex items-center gap-1.5 text-xs text-[#4a6080]">
            <Activity size={12} className="text-[#f0147a]" />
            Live feed
          </div>
        </div>
      </div>

      <div className="p-6 space-y-5">
        {/* Market snapshot */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "TCG Market Trend", value: "+4.2%", sub: "Last 7 days", color: "#00ff9d", icon: TrendingUp },
            { label: "Hot Cards Today", value: "12", sub: "Price increase", color: "#ff6b35", icon: Flame },
            { label: "Active Alerts", value: alerts.filter(a => a.active).length, sub: "Watching", color: "#00e5ff", icon: Bell },
            { label: "Watchlist Value", value: "$410", sub: "4 cards", color: "#7c3aed", icon: Eye },
          ].map((s) => (
            <div key={s.label} className="glass-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <s.icon size={14} style={{ color: s.color }} />
                <span className="text-[11px] text-[#4a6080]">{s.label}</span>
              </div>
              <div className="num-display text-xl font-bold" style={{ color: s.color }}>{s.value}</div>
              <div className="text-[11px] text-[#2a4a6a] mt-0.5">{s.sub}</div>
            </div>
          ))}
        </div>

        {/* Opportunities grid */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Zap size={14} className="text-[#f0147a]" />
            <h2 className="font-['Orbitron'] text-sm font-bold text-[#e8f4ff] tracking-wider">OPPORTUNITIES</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
            {MARKET_OPPORTUNITIES.map((opp) => (
              <OpportunityCard key={opp.id} opp={opp} />
            ))}
          </div>
        </div>

        {/* Trending */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Trending Up */}
          <div className="glass-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={14} className="text-[#00ff9d]" />
              <h2 className="font-['Orbitron'] text-sm font-bold text-[#e8f4ff] tracking-wider">TRENDING UP</h2>
            </div>
            <div className="space-y-2">
              {TRENDING_UP.map((card) => (
                <div key={card.name} className="flex items-center gap-3 p-2.5 rounded-lg bg-[#080d14] border border-[#1a2a40] hover:border-[#1f3350] transition-all">
                  <span className="text-xl">{card.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-[#e8f4ff] truncate">{card.name}</div>
                    <span className="text-[9px] text-[#00e5ff] bg-[#00e5ff11] border border-[#00e5ff22] px-1.5 py-0.5 rounded font-medium">{card.tag}</span>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="num-display text-sm font-bold text-[#e8f4ff]">${card.price}</div>
                    <div className="flex items-center gap-0.5 justify-end">
                      <ArrowUpRight size={10} className="text-[#00ff9d]" />
                      <span className="num-display text-[11px] text-[#00ff9d]">+{card.change}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trending Down */}
          <div className="glass-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingDown size={14} className="text-[#f0147a]" />
              <h2 className="font-['Orbitron'] text-sm font-bold text-[#e8f4ff] tracking-wider">TRENDING DOWN</h2>
            </div>
            <div className="space-y-2 mb-3">
              {TRENDING_DOWN.map((card) => (
                <div key={card.name} className="flex items-center gap-3 p-2.5 rounded-lg bg-[#080d14] border border-[#1a2a40] hover:border-[#1f3350] transition-all">
                  <span className="text-xl">{card.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-[#e8f4ff] truncate">{card.name}</div>
                    <span className="text-[9px] text-[#4a6080] bg-[#1a2a40] px-1.5 py-0.5 rounded font-medium">{card.tag}</span>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="num-display text-sm font-bold text-[#e8f4ff]">${card.price}</div>
                    <div className="flex items-center gap-0.5 justify-end">
                      <ArrowDownRight size={10} className="text-[#f0147a]" />
                      <span className="num-display text-[11px] text-[#f0147a]">{card.change}%</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Watchlist */}
            <div className="border-t border-[#1a2a40] pt-3">
              <div className="flex items-center gap-2 mb-2">
                <Star size={12} className="text-[#ffd60a]" />
                <span className="font-['Orbitron'] text-xs font-bold text-[#e8f4ff] tracking-wider">WATCHLIST</span>
              </div>
              <div className="space-y-1.5">
                {WATCHLIST.map((card) => (
                  <div key={card.name} className="flex items-center gap-2 text-xs">
                    <div className="flex-1 min-w-0">
                      <span className="text-[#94a8c0] truncate">{card.name}</span>
                    </div>
                    <span className="num-display text-[#e8f4ff] font-medium">${card.price}</span>
                    <span className={`num-display text-[10px] ${card.change7d >= 0 ? "text-[#00ff9d]" : "text-[#f0147a]"}`}>
                      {card.change7d >= 0 ? "+" : ""}{card.change7d}%
                    </span>
                    <span className="text-[#2a4a6a] text-[10px]">→ ${card.target}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Price Alerts */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Bell size={14} className="text-[#00e5ff]" />
              <h2 className="font-['Orbitron'] text-sm font-bold text-[#e8f4ff] tracking-wider">PRICE ALERTS</h2>
            </div>
            <button
              onClick={() => setShowAddAlert(!showAddAlert)}
              className="btn-cyber btn-cyber-primary text-xs"
            >
              <Plus size={13} /> New Alert
            </button>
          </div>

          {showAddAlert && (
            <div className="mb-4 p-4 rounded-lg bg-[#080d14] border border-[#1f3350]">
              <div className="grid grid-cols-3 gap-3 mb-3">
                <div>
                  <label className="text-[10px] text-[#4a6080] uppercase tracking-wider block mb-1">Card Name</label>
                  <input
                    value={newAlert.cardName}
                    onChange={(e) => setNewAlert({ ...newAlert, cardName: e.target.value })}
                    placeholder="e.g. Charizard ex"
                    className="input-cyber w-full px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#4a6080] uppercase tracking-wider block mb-1">Target Price ($)</label>
                  <input
                    type="number"
                    value={newAlert.targetPrice}
                    onChange={(e) => setNewAlert({ ...newAlert, targetPrice: e.target.value })}
                    placeholder="0.00"
                    className="input-cyber w-full px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#4a6080] uppercase tracking-wider block mb-1">Alert When</label>
                  <select
                    value={newAlert.alertType}
                    onChange={(e) => setNewAlert({ ...newAlert, alertType: e.target.value })}
                    className="input-cyber w-full px-3 py-2 text-xs"
                  >
                    <option value="below">Price drops below</option>
                    <option value="above">Price rises above</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={addAlert} className="btn-cyber btn-cyber-success text-xs">
                  <Bell size={12} /> Create Alert
                </button>
                <button onClick={() => setShowAddAlert(false)} className="btn-cyber text-xs">
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {alerts.map((alert) => {
              const diff = alert.alertType === "below"
                ? ((alert.currentPrice - alert.targetPrice) / alert.targetPrice) * 100
                : ((alert.targetPrice - alert.currentPrice) / alert.currentPrice) * 100;
              const isTriggered = alert.alertType === "below"
                ? alert.currentPrice <= alert.targetPrice
                : alert.currentPrice >= alert.targetPrice;

              return (
                <div
                  key={alert.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-all
                    ${!alert.active ? "opacity-40" : ""}
                    ${isTriggered ? "bg-[#00ff9d08] border-[#00ff9d33]" : "bg-[#080d14] border-[#1a2a40]"}`}
                >
                  <span className="text-lg">{alert.cardImage}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-[#e8f4ff]">{alert.cardName}</div>
                    <div className="text-[10px] text-[#4a6080]">
                      Alert when {alert.alertType === "below" ? "drops below" : "rises above"}{" "}
                      <span className="text-[#00e5ff] num-display font-bold">${alert.targetPrice}</span>
                    </div>
                  </div>
                  {alert.currentPrice > 0 && (
                    <div className="text-right">
                      <div className="num-display text-xs font-bold text-[#e8f4ff]">${alert.currentPrice}</div>
                      <div className={`text-[10px] num-display ${diff > 0 ? "text-[#f0147a]" : "text-[#00ff9d]"}`}>
                        {diff > 0 ? "−" : "+"}{Math.abs(diff).toFixed(1)}% to target
                      </div>
                    </div>
                  )}
                  {isTriggered && (
                    <span className="stat-badge stat-badge-green text-[9px] animate-pulse">TRIGGERED</span>
                  )}
                  <div className="flex gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => toggleAlert(alert.id)}
                      className="w-7 h-7 rounded-lg bg-[#0d1520] border border-[#1a2a40] flex items-center justify-center hover:border-[#00e5ff] transition-all"
                    >
                      {alert.active ? <Bell size={11} className="text-[#00e5ff]" /> : <BellOff size={11} className="text-[#4a6080]" />}
                    </button>
                    <button
                      onClick={() => removeAlert(alert.id)}
                      className="w-7 h-7 rounded-lg bg-[#0d1520] border border-[#1a2a40] flex items-center justify-center hover:border-[#f0147a] transition-all"
                    >
                      <X size={11} className="text-[#4a6080]" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
