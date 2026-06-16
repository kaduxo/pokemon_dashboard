import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          deep: "#03040a",
          base: "#080d14",
          surface: "#0d1520",
          elevated: "#121d2e",
          card: "#162033",
        },
        accent: {
          cyan: "#00e5ff",
          violet: "#7c3aed",
          pink: "#f0147a",
          green: "#00ff9d",
          gold: "#ffd60a",
          orange: "#ff6b35",
        },
        text: {
          primary: "#e8f4ff",
          secondary: "#94a8c0",
          muted: "#4a6080",
        },
        border: {
          subtle: "#1a2a40",
          default: "#1f3350",
          strong: "#2a4a6a",
          glow: "#00e5ff33",
        },
      },
      fontFamily: {
        display: ["var(--font-orbitron)", "monospace"],
        mono: ["var(--font-jetbrains)", "monospace"],
        body: ["var(--font-outfit)", "sans-serif"],
      },
      backgroundImage: {
        "grid-pattern":
          "linear-gradient(rgba(0,229,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,0.03) 1px, transparent 1px)",
        "holo-gradient":
          "linear-gradient(135deg, #00e5ff11 0%, #7c3aed22 25%, #f0147a11 50%, #00ff9d11 75%, #00e5ff11 100%)",
        "card-shine":
          "linear-gradient(135deg, transparent 40%, rgba(255,255,255,0.05) 50%, transparent 60%)",
        "sidebar-gradient":
          "linear-gradient(180deg, #080d14 0%, #03040a 100%)",
      },
      boxShadow: {
        "glow-cyan": "0 0 20px rgba(0,229,255,0.3), 0 0 60px rgba(0,229,255,0.1)",
        "glow-violet": "0 0 20px rgba(124,58,237,0.4), 0 0 60px rgba(124,58,237,0.15)",
        "glow-pink": "0 0 20px rgba(240,20,122,0.4), 0 0 60px rgba(240,20,122,0.15)",
        "glow-green": "0 0 20px rgba(0,255,157,0.3), 0 0 60px rgba(0,255,157,0.1)",
        "card-hover": "0 8px 32px rgba(0,229,255,0.15), 0 0 0 1px rgba(0,229,255,0.2)",
        "glass": "0 4px 24px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
      },
      animation: {
        "pulse-slow": "pulse 3s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
        "scan": "scan 2s ease-in-out infinite",
        "holo-shift": "holoShift 8s ease-in-out infinite",
        "border-flow": "borderFlow 3s linear infinite",
        "slide-up": "slideUp 0.4s ease-out",
        "fade-in": "fadeIn 0.3s ease-out",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        scan: {
          "0%": { transform: "translateY(-100%)", opacity: "0" },
          "50%": { opacity: "1" },
          "100%": { transform: "translateY(100%)", opacity: "0" },
        },
        holoShift: {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        borderFlow: {
          "0%": { backgroundPosition: "0% 50%" },
          "100%": { backgroundPosition: "200% 50%" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
