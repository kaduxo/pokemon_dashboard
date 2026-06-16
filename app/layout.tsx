"use client";
import "./globals.css";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Toaster } from "react-hot-toast";
import {
  LayoutDashboard, Library, ScanLine, FlaskConical,
  TrendingUp, CalendarDays, Bell, Settings, Zap,
  ChevronRight, Wallet
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, accent: "#00e5ff" },
  { href: "/collection", label: "Collection", icon: Library, accent: "#7c3aed" },
  { href: "/scanner", label: "Scanner", icon: ScanLine, accent: "#00ff9d" },
  { href: "/grading", label: "Grading Lab", icon: FlaskConical, accent: "#ffd60a" },
  { href: "/market", label: "Market Intel", icon: TrendingUp, accent: "#f0147a" },
  { href: "/releases", label: "Releases", icon: CalendarDays, accent: "#ff6b35" },
];

function NavItem({ item, active }: { item: (typeof NAV_ITEMS)[0]; active: boolean }) {
  return (
    <Link
      href={item.href}
      className={`
        relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
        transition-all duration-200 group
        ${active
          ? "bg-white/5 text-white"
          : "text-[#4a6080] hover:text-[#94a8c0] hover:bg-white/3"
        }
      `}
    >
      {active && (
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-full"
          style={{ backgroundColor: item.accent }}
        />
      )}
      <item.icon
        size={16}
        style={{ color: active ? item.accent : undefined }}
        className={`flex-shrink-0 transition-colors ${active ? "" : "group-hover:text-[#94a8c0]"}`}
      />
      <span className={`flex-1 font-['Outfit'] ${active ? "text-[#e8f4ff]" : ""}`}>
        {item.label}
      </span>
      {active && (
        <ChevronRight size={14} style={{ color: item.accent }} className="opacity-60" />
      )}
    </Link>
  );
}

function Sidebar() {
  const pathname = usePathname();
  const [portfolioValue, setPortfolioValue] = useState(0);
  const [cardCount, setCardCount] = useState(0);
  const [activeAlertCount, setActiveAlertCount] = useState(0);

  useEffect(() => {
    const loadSidebarStats = async () => {
      try {
        const [colRes, alertRes] = await Promise.all([
          fetch("/api/collection").then((r) => r.json()),
          fetch("/api/alerts").then((r) => r.json()),
        ]);
        const collection: any[] = colRes.data || [];
        const alerts: any[] = alertRes.data || [];
        const value = collection.reduce(
          (s, c) => s + (c.currentPrice || 0) * (c.quantity || 1),
          0
        );
        const count = collection.reduce((s, c) => s + (c.quantity || 1), 0);
        const activeAlerts = alerts.filter((a) => a.active && !a.triggeredAt).length;
        setPortfolioValue(value);
        setCardCount(count);
        setActiveAlertCount(activeAlerts);
      } catch {
        // Sidebar stats are non-critical
      }
    };
    loadSidebarStats();
  }, [pathname]);

  return (
    <aside className="w-56 flex-shrink-0 flex flex-col h-screen sticky top-0 bg-[#03040a] border-r border-[#1a2a40]">
      {/* Logo */}
      <div className="px-4 pt-5 pb-4 border-b border-[#1a2a40]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00e5ff22] to-[#7c3aed22] border border-[#00e5ff33] flex items-center justify-center">
            <Zap size={16} className="text-[#00e5ff]" />
          </div>
          <div>
            <div className="font-['Orbitron'] text-sm font-bold text-[#e8f4ff] leading-none tracking-wider">
              POKÉDEX
            </div>
            <div className="font-['Orbitron'] text-[10px] text-[#4a6080] tracking-[0.2em] mt-0.5">
              PORTFOLIO
            </div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
        <div className="px-2 pb-2">
          <span className="text-[10px] font-semibold tracking-[0.15em] text-[#2a4a6a] uppercase font-['Outfit']">
            Navigation
          </span>
        </div>
        {NAV_ITEMS.map((item) => (
          <NavItem key={item.href} item={item} active={pathname === item.href} />
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-2 pb-4 border-t border-[#1a2a40] pt-3 space-y-0.5">
        <Link
          href="/alerts"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#4a6080] hover:text-[#94a8c0] hover:bg-white/3 text-sm transition-all group"
        >
          <Bell size={16} className="group-hover:text-[#94a8c0]" />
          <span className="font-['Outfit']">Alerts</span>
          {activeAlertCount > 0 && (
            <span className="ml-auto text-xs bg-[#f0147a22] text-[#f0147a] border border-[#f0147a33] rounded-full min-w-5 h-5 px-1 flex items-center justify-center font-bold">
              {activeAlertCount}
            </span>
          )}
        </Link>
        <Link
          href="/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[#4a6080] hover:text-[#94a8c0] hover:bg-white/3 text-sm transition-all group"
        >
          <Settings size={16} className="group-hover:text-[#94a8c0]" />
          <span className="font-['Outfit']">Settings</span>
        </Link>

        {/* Portfolio mini stat */}
        <div className="mt-2 mx-1 p-3 rounded-lg bg-[#0d1520] border border-[#1a2a40]">
          <div className="flex items-center gap-2 mb-1.5">
            <Wallet size={12} className="text-[#00e5ff]" />
            <span className="text-[10px] text-[#4a6080] uppercase tracking-wider font-semibold">Portfolio</span>
          </div>
          <div className="font-['JetBrains_Mono'] text-base font-semibold text-[#e8f4ff]">
            ${portfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-[#4a6080] mt-0.5">
            {cardCount} {cardCount === 1 ? "card" : "cards"} tracked
          </div>
        </div>
      </div>
    </aside>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <title>PokéPortfolio — Card Tracker</title>
        <meta name="description" content="Local Pokémon TCG portfolio tracker with AI scanner, grading simulator, and market intel." />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      </head>
      <body className="min-h-screen flex bg-[#03040a]">
        <Sidebar />
        <main className="flex-1 overflow-x-hidden min-h-screen">
          {children}
        </main>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#0d1520",
              border: "1px solid #1f3350",
              color: "#e8f4ff",
              fontFamily: "Outfit, sans-serif",
              fontSize: "14px",
            },
          }}
        />
      </body>
    </html>
  );
}
