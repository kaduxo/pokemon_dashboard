"use client";
import { useState, useEffect } from "react";
import {
  FlaskConical, TrendingUp, TrendingDown, DollarSign,
  AlertTriangle, CheckCircle, XCircle, Info, ChevronDown
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from "recharts";
import {
  GRADING_SERVICES, calculateGradingROI, getOverallRecommendation
} from "../../lib/grading";
import type { GradeCompany, GradingSimResult } from "../../lib/types";

const COMPANIES: GradeCompany[] = ["PSA", "BGS", "CGC", "SGC"];

const COMPANY_INFO: Record<GradeCompany, { color: string; desc: string; turnaround: string; liquidity: string }> = {
  PSA: { color: "#00e5ff", desc: "Industry leader, highest resale premiums", turnaround: "65+ days (economy)", liquidity: "Highest" },
  BGS: { color: "#7c3aed", desc: "Sub-grades for precision collectors", turnaround: "50+ days (economy)", liquidity: "High" },
  CGC: { color: "#00ff9d", desc: "Fast turnaround, growing market share", turnaround: "30+ days (economy)", liquidity: "Medium-High" },
  SGC: { color: "#ffd60a", desc: "Budget-friendly, vintage focus", turnaround: "40+ days (economy)", liquidity: "Medium" },
};

export default function GradingPage() {
  const [cardName, setCardName] = useState("Charizard VMAX");
  const [rawPrice, setRawPrice] = useState(85);
  const [condition, setCondition] = useState(8.5);
  const [company, setCompany] = useState<GradeCompany>("PSA");
  const [serviceIndex, setServiceIndex] = useState(0);
  const [shippingCost, setShippingCost] = useState(15);
  const [results, setResults] = useState<GradingSimResult[]>([]);
  const [recommendation, setRecommendation] = useState<ReturnType<typeof getOverallRecommendation> | null>(null);

  const services = GRADING_SERVICES[company];
  const selectedService = services[serviceIndex];

  useEffect(() => {
    const r = calculateGradingROI(rawPrice, condition, company, selectedService.fee, shippingCost);
    setResults(r.sort((a, b) => b.grade - a.grade));
    setRecommendation(getOverallRecommendation(rawPrice, r, selectedService.fee, shippingCost));
  }, [rawPrice, condition, company, serviceIndex, shippingCost, selectedService.fee]);

  const chartData = results.map((r) => ({
    grade: `${company === "BGS" ? "BGS " : company === "CGC" ? "CGC " : ""}${r.grade}`,
    price: r.gradedPrice,
    profit: r.netProfit,
    probability: (r.probability * 100).toFixed(0) + "%",
    color: r.netProfit > 0 ? "#00ff9d" : "#f0147a",
  }));

  const ev = results.reduce((s, r) => s + r.gradedPrice * r.probability, 0);
  const totalCost = rawPrice + selectedService.fee + shippingCost;

  return (
    <div className="min-h-screen grid-bg">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#03040a]/80 backdrop-blur-xl border-b border-[#1a2a40] px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#ffd60a18] border border-[#ffd60a33] flex items-center justify-center">
            <FlaskConical size={16} className="text-[#ffd60a]" />
          </div>
          <div>
            <h1 className="font-['Orbitron'] text-lg font-bold text-[#e8f4ff] tracking-wider">GRADING LAB</h1>
            <p className="text-xs text-[#4a6080] mt-0.5">ROI simulator for PSA, BGS, CGC & SGC</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="max-w-6xl mx-auto space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Input panel */}
            <div className="space-y-4">
              <div className="glass-card p-5">
                <h2 className="font-['Orbitron'] text-sm font-bold text-[#e8f4ff] tracking-wider mb-4">CARD DETAILS</h2>

                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] text-[#4a6080] uppercase tracking-wider block mb-1.5">Card Name</label>
                    <input
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      className="input-cyber w-full px-3 py-2 text-sm"
                      placeholder="e.g. Charizard VMAX"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-[#4a6080] uppercase tracking-wider block mb-1.5">
                      Raw Market Price ($)
                    </label>
                    <input
                      type="number"
                      value={rawPrice}
                      onChange={(e) => setRawPrice(Number(e.target.value))}
                      className="input-cyber w-full px-3 py-2 text-sm"
                      min="1"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[11px] text-[#4a6080] uppercase tracking-wider">
                        Estimated Condition
                      </label>
                      <span className="num-display text-sm font-bold text-[#e8f4ff]">{condition}/10</span>
                    </div>
                    <input
                      type="range"
                      min="4"
                      max="10"
                      step="0.5"
                      value={condition}
                      onChange={(e) => setCondition(Number(e.target.value))}
                      className="w-full accent-[#00e5ff] cursor-pointer"
                      style={{ accentColor: "#00e5ff" }}
                    />
                    <div className="flex justify-between text-[10px] text-[#2a4a6a] mt-1">
                      <span>Played</span>
                      <span>NM</span>
                      <span>Mint</span>
                      <span>Gem</span>
                    </div>
                    <div className="mt-2 text-xs text-center" style={{ color: condition >= 9.5 ? "#00ff9d" : condition >= 8.5 ? "#00e5ff" : condition >= 7 ? "#ffd60a" : "#f0147a" }}>
                      {condition >= 9.5 ? "🌟 Gem Mint — Strong PSA 10 candidate" :
                        condition >= 9 ? "✨ Near Gem Mint — Good PSA 9-10 range" :
                        condition >= 8 ? "⭐ Near Mint — PSA 8-9 expected" :
                        condition >= 7 ? "💫 Lightly Played — PSA 7-8 range" :
                        "⚠️ Played — Consider selling raw"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Grading company */}
              <div className="glass-card p-5">
                <h2 className="font-['Orbitron'] text-sm font-bold text-[#e8f4ff] tracking-wider mb-4">GRADING COMPANY</h2>

                <div className="grid grid-cols-2 gap-2 mb-4">
                  {COMPANIES.map((c) => (
                    <button
                      key={c}
                      onClick={() => { setCompany(c); setServiceIndex(0); }}
                      className={`py-2.5 px-3 rounded-lg text-sm font-bold font-['Orbitron'] tracking-wider transition-all border
                        ${company === c
                          ? "text-white border-opacity-70"
                          : "text-[#4a6080] border-[#1a2a40] hover:text-[#94a8c0]"
                        }`}
                      style={company === c ? {
                        background: `${COMPANY_INFO[c].color}18`,
                        borderColor: COMPANY_INFO[c].color + "66",
                        color: COMPANY_INFO[c].color,
                      } : {}}
                    >
                      {c}
                    </button>
                  ))}
                </div>

                <div className="text-xs text-[#4a6080] mb-3">{COMPANY_INFO[company].desc}</div>

                <div className="space-y-1.5">
                  {services.map((svc, i) => (
                    <button
                      key={svc.name}
                      onClick={() => setServiceIndex(i)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs border transition-all
                        ${serviceIndex === i
                          ? "bg-[#00e5ff11] border-[#00e5ff33] text-[#e8f4ff]"
                          : "bg-[#080d14] border-[#1a2a40] text-[#4a6080] hover:text-[#94a8c0]"
                        }`}
                    >
                      <span className="font-medium">{svc.name}</span>
                      <div className="text-right">
                        <span className="num-display font-bold">${svc.fee}</span>
                        <span className="text-[10px] text-[#2a4a6a] ml-1">{svc.turnaround.replace("business days", "bd")}</span>
                      </div>
                    </button>
                  ))}
                </div>

                <div className="mt-3">
                  <label className="text-[11px] text-[#4a6080] uppercase tracking-wider block mb-1.5">
                    Shipping Cost ($)
                  </label>
                  <input
                    type="number"
                    value={shippingCost}
                    onChange={(e) => setShippingCost(Number(e.target.value))}
                    className="input-cyber w-full px-3 py-2 text-sm"
                    min="0"
                  />
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="lg:col-span-2 space-y-4">
              {/* Recommendation banner */}
              {recommendation && (
                <div className={`p-4 rounded-xl border flex items-start gap-3
                  ${recommendation.action === "grade"
                    ? "bg-[#00ff9d08] border-[#00ff9d33]"
                    : recommendation.action === "sell_raw"
                    ? "bg-[#f0147a08] border-[#f0147a33]"
                    : "bg-[#ffd60a08] border-[#ffd60a33]"
                  }`}
                >
                  <div className="text-2xl">
                    {recommendation.action === "grade" ? "🚀" :
                      recommendation.action === "sell_raw" ? "💰" : "⏸️"}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`font-['Orbitron'] text-sm font-bold tracking-wider
                        ${recommendation.action === "grade" ? "text-[#00ff9d]" :
                          recommendation.action === "sell_raw" ? "text-[#f0147a]" : "text-[#ffd60a]"}`}
                      >
                        {recommendation.action === "grade" ? "GRADE IT" :
                          recommendation.action === "sell_raw" ? "SELL RAW" : "HOLD"}
                      </span>
                    </div>
                    <p className="text-sm text-[#94a8c0]">{recommendation.reason}</p>
                    <div className="flex gap-4 mt-2 text-xs">
                      <span className="text-[#4a6080]">Expected Value: <span className="num-display text-[#e8f4ff] font-bold">${recommendation.ev.toFixed(2)}</span></span>
                      <span className="text-[#4a6080]">Net: <span className={`num-display font-bold ${recommendation.profit >= 0 ? "text-[#00ff9d]" : "text-[#f0147a]"}`}>
                        {recommendation.profit >= 0 ? "+" : ""}${recommendation.profit.toFixed(2)}
                      </span></span>
                    </div>
                  </div>
                </div>
              )}

              {/* Cost breakdown */}
              <div className="glass-card p-4">
                <h3 className="font-['Orbitron'] text-xs font-bold text-[#e8f4ff] tracking-wider mb-3">COST BREAKDOWN</h3>
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { label: "Raw Value", value: `$${rawPrice}`, color: "#94a8c0" },
                    { label: "Grading Fee", value: `$${selectedService.fee}`, color: "#ffd60a" },
                    { label: "Shipping", value: `$${shippingCost}`, color: "#ff6b35" },
                    { label: "Total In", value: `$${totalCost}`, color: "#f0147a" },
                  ].map((item) => (
                    <div key={item.label} className="text-center">
                      <div className="num-display text-base font-bold" style={{ color: item.color }}>{item.value}</div>
                      <div className="text-[11px] text-[#4a6080] mt-0.5">{item.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Grade chart */}
              <div className="glass-card p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-['Orbitron'] text-xs font-bold text-[#e8f4ff] tracking-wider">
                    GRADED VALUE BY GRADE
                  </h3>
                  <span className="text-[11px] text-[#4a6080]">{cardName || "Card"} · {company}</span>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={chartData} barSize={28}>
                    <XAxis dataKey="grade" tick={{ fill: "#4a6080", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#4a6080", fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                    <Tooltip
                      content={({ active, payload, label }) => {
                        if (!active || !payload?.length) return null;
                        const d = results.find(r => `${r.grade}` === label.replace(/PSA |CGC |BGS |SGC /, "")) || payload[0]?.payload;
                        return (
                          <div className="bg-[#0d1520] border border-[#1f3350] rounded-lg p-2.5 text-xs">
                            <div className="font-bold text-[#e8f4ff] mb-1">{label}</div>
                            <div className="text-[#00e5ff]">Value: ${payload[0]?.value}</div>
                            <div className="text-[#4a6080]">Probability: {d?.probability ? (d.probability * 100).toFixed(0) : "?"}%</div>
                          </div>
                        );
                      }}
                    />
                    <Bar dataKey="price" radius={[4, 4, 0, 0]}>
                      {chartData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} fillOpacity={0.8} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Grade table */}
              <div className="glass-card overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#1a2a40]">
                      {["Grade", "Probability", "Graded Value", "Net Profit", "ROI", ""].map((h) => (
                        <th key={h} className="text-left px-4 py-3 text-[10px] text-[#4a6080] font-semibold uppercase tracking-wider">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1a2a40]">
                    {results.map((r) => (
                      <tr key={r.grade} className="hover:bg-white/2 transition-colors">
                        <td className="px-4 py-3">
                          <span className="num-display font-bold text-[#e8f4ff]">{company} {r.grade}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="progress-track w-16">
                              <div className="progress-fill-cyan" style={{ width: `${r.probability * 100}%` }} />
                            </div>
                            <span className="num-display text-xs text-[#94a8c0]">{(r.probability * 100).toFixed(0)}%</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 num-display font-bold text-[#e8f4ff]">${r.gradedPrice}</td>
                        <td className="px-4 py-3">
                          <span className={`num-display font-bold text-sm ${r.netProfit >= 0 ? "text-[#00ff9d]" : "text-[#f0147a]"}`}>
                            {r.netProfit >= 0 ? "+" : ""}${r.netProfit}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`stat-badge ${r.roi >= 0 ? "stat-badge-green" : "stat-badge-red"}`}>
                            {r.roi >= 0 ? "+" : ""}{r.roi}%
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {r.recommendation === "grade" ? (
                            <CheckCircle size={13} className="text-[#00ff9d]" />
                          ) : r.recommendation === "sell_raw" ? (
                            <XCircle size={13} className="text-[#f0147a]" />
                          ) : (
                            <AlertTriangle size={13} className="text-[#ffd60a]" />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Company comparison tip */}
              <div className="glass-card p-4">
                <div className="flex items-start gap-2">
                  <Info size={14} className="text-[#00e5ff] mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-[#4a6080] space-y-1">
                    <p><span className="text-[#00e5ff] font-semibold">PSA</span> — Highest market premiums and liquidity. Best for high-value chase cards.</p>
                    <p><span className="text-[#7c3aed] font-semibold">BGS</span> — Sub-grades add value for pristine modern foils. Black Label (10/10 subs) can exceed PSA 10.</p>
                    <p><span className="text-[#00ff9d] font-semibold">CGC</span> — Fastest turnaround, competitive fees. CGC Pristine 10 trades at ~85% of PSA 10 on modern cards.</p>
                    <p><span className="text-[#ffd60a] font-semibold">SGC</span> — Budget option, good for vintage cards and bulk submissions.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
