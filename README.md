# Pokémon TCG Portfolio Dashboard

A free, local-first Pokémon TCG investment dashboard built with Next.js 14. Track your collection, monitor prices, scan cards with AI, simulate grading ROI, and follow market releases — all stored on your machine.

## Features

- **Dashboard** — Portfolio value, gains, charts, top cards, market alerts
- **Collection** — Add/edit/remove cards with pokemontcg.io search, grid/list view
- **AI Scanner** — Drag & drop card photo → vision AI identifies card + grades condition
- **Grading Lab** — Simulate PSA/BGS/CGC/SGC grading ROI with probability breakdown
- **Market Intel** — Opportunities, price trends, watchlist, price alerts
- **Releases** — 2026 release calendar with countdown, store watchlist
- **Alerts** — Price alerts (above/below target)
- **Settings** — API key guide, export/import, price refresh

## Stack

Next.js 14 · TypeScript · Tailwind CSS · Recharts · Framer Motion · Zustand · Claude Vision API · pokemontcg.io

## Quick Start

```bash
git clone <your-repo-url>
cd pokemon-portfolio-dashboard
npm install

# Copy env template and add your keys
cp .env.local.example .env.local

npm run dev
# Open http://localhost:3000
```

## API Keys

| Key | Required | Get it |
|-----|----------|--------|
| `POKEMON_TCG_API_KEY` | Recommended | [dev.pokemontcg.io](https://dev.pokemontcg.io/) — free tier, 1000 req/day |
| `ANTHROPIC_API_KEY` | Scanner only | [console.anthropic.com](https://console.anthropic.com/) |

Without a Pokémon TCG API key the app still works with limited card search.

## Data Storage

All data is saved locally in `/data/*.json` — no cloud, no accounts.

| File | Contents |
|------|----------|
| `collection.json` | Your cards |
| `alerts.json` | Price alerts |
| `stores.json` | Store watchlist |
| `history.json` | Portfolio value history |

## License

Free to use for personal collection tracking.

## Support

Optional — never required. If this project helps you:

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/Q1K124VQFX)