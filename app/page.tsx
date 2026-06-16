"use client";
import { useState, useEffect } from "react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import {
  TrendingUp, TrendingDown, Package, Award, ArrowUpRight, ArrowDownRight,
  RefreshCw, Flame, Star, ChevronRight, Zap, Loader2, Plus,
} from "lucide-react";

const PIE_COLORS: Record<string, string> = {
  Raw: "#00e5ff",
  Graded: "#7c3aed",
  Sealed: "#ffd60a",
};

function StatCard({ label, value, sub, icon: Icon, accent, trend, trendVal }: any) {
  const isPositive = trend === "up";
  return (
    <div className="glass-card p-4 card-hover relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-5 blur-2xl" style={{ background: accent }} />
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-9 h-9 rounded-lg flex items-center justify-center"
          style={{ background: `${accent}18`, border: `1px solid ${accent}33` }}
        >
          <Icon size={18} style={{ color: accent }} />
        </div>
        {trend && (
          <span className={`stat-badge ${isPositive ? "stat-badge-green" : "stat-badge-red"}`}>
            {isPositive ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
            {trendVal}
          </span>
        )}
      </div>
      <div className="num-display text-2xl font-bold text-[#e8f4ff] mb-0.5">{value}</div>
      <div className="text-xs text-[#4a6080] font-['Outfit']">{label}</div>
      {sub && <div className="text-[11px] text-[#2a4a6a] mt-0.5 font-['Outfit']">{sub}</div>}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0d1520] border border-[#1f3350] rounded-lg p-3 text-xs">
      <div className="text-[#4a6080] mb-1">{label}</div>
      <div className="num-display text-[#00e5ff] font-bold">${payload[0]?.value?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
      {payload[1] && <div className="num-display text-[#4a6080]">Cost: ${payload[1]?.value?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>}
    </div>
  );
};

export default function DashboardPage() {
  const [collection, setCollection] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const [colRes, alertRes] = await Promise.all([
        fetch("/api/collection").then((r) => r.json()),
        fetch("/api/alerts").then((r) => r.json()),
      ]);

      const col: any[] = colRes.data || [];
      setCollection(col);
      setAlerts(alertRes.data || []);

      if (col.length > 0) {
        const totalValue = col.reduce((s: number, c: any) => s + (c.currentPrice || 0) * (c.quantity || 1), 0);
        const totalCost = col.reduce((s: number, c: any) => s + (c.purchasePrice || 0) * (c.quantity || 1), 0);
        const today = new Date().toISOString().split("T")[0];

        await fetch("/api/history", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            date: today,
            value: Math.round(totalValue * 100) / 100,
            cost: Math.round(totalCost * 100) / 100,
          }),
        });
      }

      const histRes = await fetch("/api/history").then((r) => r.json());
      const rawHist: any[] = histRes.data || [];
      setHistory(
        rawHist.map((h: any) => ({
          ...h,
          date: new Date(h.date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        }))
      );
    } catch (err) {
      console.error("Dashboard load error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const totalValue = collection.reduce((s, c) => s + (c.currentPrice || 0) * (c.quantity || 1), 0);
  const totalCost = collection.reduce((s, c) => s + (c.purchasePrice || 0) * (c.quantity || 1), 0);
  const gainLoss = totalValue - totalCost;
  const gainPct = totalCost > 0 ? ((gainLoss / totalCost) * 100).toFixed(1) : "0.0";
  const totalCards = collection.reduce((s, c) => s + (c.quantity || 1), 0);
  const gradedCount = collection.filter((c) => c.status === "graded").length;
  const sealedCount = collection.filter((c) => c.status === "sealed").length;
  const rawCount = collection.filter((c) => c.status === "raw").length;

  const topCards = [...collection]
    .sort((a, b) => (b.currentPrice || 0) - (a.currentPrice || 0))
    .slice(0, 5);

  const pieData = [
    { name: "Raw", value: rawCount, color: PIE_COLORS.Raw },
    { name: "Graded", value: gradedCount, color: PIE_COLORS.Graded },
    { name: "Sealed", value: sealedCount, color: PIE_COLORS.Sealed },
  ].filter((d) => d.value > 0);

  const activeAlerts = alerts.filter((a) => a.active && !a.triggeredAt);
  const triggeredAlerts = alerts.filter((a) => !!a.triggeredAt);

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
            <h1 className="font-['Orbitron'] text-lg font-bold text-[#e8f4ff] tracking-wider">PORTFOLIO DASHBOARD</h1>
            <p className="text-xs text-[#4a6080] font-['Outfit'] mt-0.5">Last updated: {new Date().toLocaleString()}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-[#4a6080] font-['Outfit']">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00ff9d] animate-pulse" />
              Live prices
            </div>
            <button onClick={() => loadData(true)} className="btn-cyber text-xs">
              <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-5">
        {collection.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-20 h-20 rounded-full bg-[#00e5ff11] border border-[#00e5ff22] flex items-center justify-center mb-6">
              <Package size={36} className="text-[#00e5ff]" />
            </div>
            <h2 className="font-['Orbitron'] text-xl font-bold text-[#e8f4ff] mb-3">YOUR PORTFOLIO IS EMPTY</h2>
            <p className="text-sm text-[#4a6080] mb-8 max-w-md">
              Add your first Pokémon card to start tracking your portfolio value, gains, and market performance.
            </p>
            <a href="/collection" className="btn-cyber btn-cyber-primary px-6 py-3">
              <Plus size={16} /> Add Your First Card
            </a>
          </div>
        ) : (
          <>
            {/* Hero value */}
            <div className="animated-border p-[1px]">
              <div className="bg-[#080d14] rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex-1">
                  <div className="text-xs font-semibold tracking-[0.15em] text-[#4a6080] uppercase mb-2 font-['Outfit']">
                    Total Portfolio Value
                  </div>
                  <div className="flex items-end gap-3">
                    <span className="font-['Orbitron'] text-4xl font-black text-[#e8f4ff]">
                      ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <span className={`stat-badge mb-1 ${gainLoss >= 0 ? "stat-badge-green" : "stat-badge-red"}`}>
                      {gainLoss >= 0 ? <ArrowUpRight size={11} /> : <ArrowDownRight size={11} />}
                      {gainPct}% all-time
                    </span>
                  </div>
                  <div className="text-sm text-[#4a6080] mt-1.5 font-['Outfit']">
                    <span className={gainLoss >= 0 ? "text-[#00ff9d]" : "text-[#f0147a]"}>
                      {gainLoss >= 0 ? "+" : ""}${gainLoss.toFixed(2)} total gain
                    </span>
                    {totalCost > 0 && ` · $${totalCost.toFixed(2)} invested`}
                  </div>
                </div>
                <div className="flex gap-4 text-center">
                  <div>
                    <div className="num-display text-lg font-bold text-[#00e5ff]">{totalCards}</div>
                    <div className="text-[11px] text-[#4a6080]">Cards</div>
                  </div>
                  <div className="w-px bg-[#1a2a40]" />
                  <div>
                    <div className="num-display text-lg font-bold text-[#7c3aed]">{gradedCount}</div>
                    <div className="text-[11px] text-[#4a6080]">Graded</div>
                  </div>
                  <div className="w-px bg-[#1a2a40]" />
                  <div>
                    <div className="num-display text-lg font-bold text-[#ffd60a]">{sealedCount}</div>
                    <div className="text-[11px] text-[#4a6080]">Sealed</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <StatCard label="Total Cost Basis" value={`$${totalCost.toFixed(2)}`} icon={Package} accent="#00e5ff" />
              <StatCard
                label="Unrealized Gain"
                value={`${gainLoss >= 0 ? "+" : ""}$${gainLoss.toFixed(2)}`}
                sub="All time"
                icon={TrendingUp}
                accent="#00ff9d"
                trend={gainLoss >= 0 ? "up" : "down"}
                trendVal={`${gainPct}%`}
              />
              <StatCard label="Graded Cards" value={gradedCount} icon={Award} accent="#7c3aed" />
              {topCards[0] ? (
                <StatCard
                  label="Most Valuable"
                  value={topCards[0].name}
                  sub={`$${(topCards[0].currentPrice || 0).toFixed(2)}`}
                  icon={Flame}
                  accent="#ff6b35"
                />
              ) : (
                <StatCard label="Most Valuable" value="—" icon={Flame} accent="#ff6b35" />
              )}
            </div>

            {/* Chart + Composition */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 glass-card p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="font-['Orbitron'] text-sm font-bold text-[#e8f4ff] tracking-wider">VALUE HISTORY</h2>
                    <p className="text-[11px] text-[#4a6080] mt-0.5">Portfolio vs cost basis</p>
                  </div>
                  <div className="flex gap-3 text-[11px] text-[#4a6080]">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-0.5 bg-[#00e5ff] inline-block rounded" />Value
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-0.5 bg-[#7c3aed] inline-block rounded" />Cost
                    </span>
                  </div>
                </div>
                {history.length >= 2 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={history}>
                      <defs>
                        <linearGradient id="valGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#00e5ff" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#00e5ff" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="costGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.15} />
                          <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="date" tick={{ fill: "#4a6080", fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: "#4a6080", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="value" stroke="#00e5ff" strokeWidth={2} fill="url(#valGrad)" />
                      <Area type="monotone" dataKey="cost" stroke="#7c3aed" strokeWidth={1.5} strokeDasharray="4 4" fill="url(#costGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[220px] text-center">
                    <div>
                      <TrendingUp size={32} className="text-[#2a4a6a] mx-auto mb-2" />
                      <p className="text-sm text-[#4a6080]">
                        Portfolio history builds up as you track over multiple days
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="glass-card p-4 flex flex-col">
                <h2 className="font-['Orbitron'] text-sm font-bold text-[#e8f4ff] tracking-wider mb-1">COMPOSITION</h2>
                <p className="text-[11px] text-[#4a6080] mb-4">By card status</p>
                {pieData.length > 0 ? (
                  <>
                    <div className="flex-1 flex items-center justify-center">
                      <ResponsiveContainer width="100%" height={160}>
                        <PieChart>
                          <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" strokeWidth={0}>
                            {pieData.map((entry, i) => (
                              <Cell key={i} fill={entry.color} fillOpacity={0.85} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="space-y-2">
                      {pieData.map((d) => (
                        <div key={d.name} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-sm" style={{ background: d.color }} />
                            <span className="text-[#94a8c0]">{d.name}</span>
                          </div>
                          <span className="num-display font-semibold text-[#e8f4ff]">{d.value}</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-[#4a6080] text-sm text-center">
                    No cards yet
                  </div>
                )}
              </div>
            </div>

            {/* Top cards + Alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="glass-card p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Star size={14} className="text-[#ffd60a]" />
                    <h2 className="font-['Orbitron'] text-sm font-bold text-[#e8f4ff] tracking-wider">TOP CARDS</h2>
                  </div>
                  <a href="/collection" className="text-[11px] text-[#00e5ff] flex items-center gap-1 hover:opacity-80 transition-opacity">
                    View all <ChevronRight size={11} />
                  </a>
                </div>
                <div className="divide-y divide-[#1a2a40]">
                  {topCards.map((card, i) => (
                    <div key={card.uid} className="flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-white/3 transition-all group">
                      <span className="num-display text-xs text-[#2a4a6a] w-4 text-center">{i + 1}</span>
                      <div className="relative w-10 h-14 flex-shrink-0">
                        <img
                          src={card.image}
                          alt={card.name}
                          className="w-full h-full object-contain rounded"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                        {card.grade && (
                          <div className="absolute -bottom-1 -right-1 bg-[#0d1520] text-[8px] text-[#ffd60a] border border-[#ffd60a44] rounded px-1 font-bold font-['JetBrains_Mono']">
                            {card.gradeCompany} {card.grade}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-[#e8f4ff] truncate group-hover:text-[#00e5ff] transition-colors">
                          {card.name}
                        </div>
                        <div className="text-[11px] text-[#4a6080]">{card.set} · {card.rarity}</div>
                      </div>
                      <div className="text-right">
                        <div className="num-display text-sm font-bold text-[#e8f4ff]">
                          ${(card.currentPrice || 0).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="glass-card p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Zap size={14} className="text-[#f0147a]" />
                    <h2 className="font-['Orbitron'] text-sm font-bold text-[#e8f4ff] tracking-wider">PRICE ALERTS</h2>
                  </div>
                  {activeAlerts.length === 0 && triggeredAlerts.length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-xs text-[#4a6080] mb-2">No active price alerts</p>
                      <a href="/alerts" className="text-xs text-[#00e5ff] hover:opacity-80">Create an alert →</a>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {[...triggeredAlerts, ...activeAlerts].slice(0, 4).map((alert) => (
                        <div key={alert.id} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-[#080d14] border border-[#1a2a40] text-xs">
                          {alert.triggeredAt ? (
                            <TrendingUp size={13} className="text-[#00ff9d] mt-0.5 flex-shrink-0" />
                          ) : alert.alertType === "above" ? (
                            <TrendingUp size={13} className="text-[#00e5ff] mt-0.5 flex-shrink-0" />
                          ) : (
                            <TrendingDown size={13} className="text-[#f0147a] mt-0.5 flex-shrink-0" />
                          )}
                          <div className="flex-1">
                            <p className="text-[#94a8c0]">{alert.cardName}</p>
                            <span className="text-[#2a4a6a] text-[10px]">
                              {alert.triggeredAt
                                ? `Triggered ${new Date(alert.triggeredAt).toLocaleDateString()}`
                                : `Alert: ${alert.alertType} $${alert.targetPrice}`}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="glass-card p-4">
                  <h2 className="font-['Orbitron'] text-sm font-bold text-[#e8f4ff] tracking-wider mb-3">QUICK ACTIONS</h2>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: "Scan Card", href: "/scanner", icon: "📷" },
                      { label: "Add Manual", href: "/collection", icon: "➕" },
                      { label: "Grade Check", href: "/grading", icon: "🏅" },
                      { label: "Market Intel", href: "/market", icon: "📊" },
                    ].map((a) => (
                      <a
                        key={a.label}
                        href={a.href}
                        className="flex items-center gap-2 p-2.5 rounded-lg bg-[#080d14] border border-[#1a2a40] text-xs transition-all hover:bg-[#0d1520] hover:border-[#2a4a6a] group"
                      >
                        <span>{a.icon}</span>
                        <span className="text-[#94a8c0] group-hover:text-[#e8f4ff] transition-colors">{a.label}</span>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Next release */}
            <div className="glass-card p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-[#ff6b3518] border border-[#ff6b3533] flex items-center justify-center flex-shrink-0">
                <span className="text-lg">🎴</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-xs font-semibold text-[#ff6b35] uppercase tracking-wider">Next Release</span>
                </div>
                <div className="font-semibold text-[#e8f4ff] text-sm">Mega Evolution – Chaos Rising</div>
                <div className="text-[11px] text-[#4a6080] mt-0.5">May 22, 2026 · Booster packs, ETBs, collections</div>
              </div>
              <a href="/releases" className="btn-cyber text-xs flex-shrink-0">
                View Calendar <ChevronRight size={13} />
              </a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
