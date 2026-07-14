# Frequency — Universal Watch Hub

A legal, all-in-one discovery hub for movies, TV, anime, manga, music, live sports, live TV and radio.
Frequency **never hosts or streams copyrighted content** — it indexes public/licensed metadata and deep-links
straight to the legitimate service (Netflix, Spotify, ESPN, national broadcasters, etc.) already showing it.

## Stack
- **Frontend:** React 18 + TypeScript + Vite + Tailwind CSS + Framer Motion + React Query + Zustand
- **Backend:** Node.js + Express + TypeScript + Prisma + PostgreSQL + Redis (optional local cache)
- **Monorepo:** npm workspaces (`apps/web`, `apps/api`, `packages/shared-types`)

## 1. Install

```bash
npm install
```

This installs all three workspaces and generates the Prisma client automatically.

## 2. Configure environment variables

```bash
cp .env.example apps/api/.env
```

Then open `apps/api/.env` and fill in:

| Variable | Required? | Where to get it |
|---|---|---|
| `DATABASE_URL` | Yes | Local Postgres (see step 3) or a free hosted DB (Neon, Supabase) |
| `JWT_SECRET` | Yes | Any long random string |
| `TMDB_API_KEY` | Yes, for movies/TV/anime | Free at https://www.themoviedb.org/settings/api |
| `SPORTSDB_API_KEY` | No (defaults to free tier key `3`) | https://www.thesportsdb.com/api.php |
| `SPOTIFY_CLIENT_ID` / `SPOTIFY_CLIENT_SECRET` | Only for the Music page | Free at https://developer.spotify.com/dashboard |
| `REDIS_URL` | No | App falls back to an in-memory cache if unset |

Radio (Radio-Browser) and manga metadata (AniList) need **no API key** — they're open, free public APIs.

## 3. Start Postgres + Redis locally (optional but recommended)

```bash
docker compose up -d
```

If you'd rather use a hosted Postgres (Neon/Supabase free tier), just paste its connection string into
`DATABASE_URL` and skip Redis — the app works fine without it.

## 4. Push the database schema

```bash
npm run db:push
```

## 5. Run in development

```bash
npm run dev
```

- Web app: http://localhost:5173
- API: http://localhost:4000 (health check at `/health`)

## 6. Build for production

```bash
npm run build
npm start
```

`npm start` runs the compiled API (`apps/api/dist/server.js`). Deploy the built `apps/web/dist` folder to any
static host (Vercel, Netlify, Cloudflare Pages) and the API to any Node host (Railway, Render, Fly.io) — just
make sure `CLIENT_URL` in the API's env points at your deployed frontend URL for CORS.

## Project structure

```
apps/
  web/    React + TypeScript + Tailwind frontend
  api/    Express + TypeScript + Prisma backend
packages/
  shared-types/   TypeScript interfaces shared by both apps
docker-compose.yml   Local Postgres + Redis for development
```

## Feature map

| Area | Data source | Notes |
|---|---|---|
| Movies / TV / Anime | TMDB | Search, discover, detail, legal "where to watch" providers |
| Manga | AniList | Metadata only — deep-links to official readers (VIZ, MangaPlus) |
| Documentaries / Telenovelas | TMDB (genre-filtered) | |
| Sports | TheSportsDB | Live/scheduled scores by date, team search, historical "relive old games" |
| Live TV | Curated directory | Deep-links to legal FAST services (Pluto TV, Tubi, Samsung TV Plus, etc.) |
| Radio | Radio-Browser | Global open directory of legal internet radio streams |
| Music | Spotify Web API | Official embeddable player, no audio hosting |
| Mood Mixer | TMDB + in-house scoring | Signature feature: feel sliders instead of genre checkboxes |
| Time Capsule | TMDB + TheSportsDB | Pick a date, see what released/played that day |
| Watchlist / Reviews / Lists | Your own Postgres DB | Fully original user-generated data — no copyright concerns |

## Monetization hooks already wired for you
- `Pricing` page + `plan` field on `User` — plug in Stripe Checkout (`STRIPE_*` env vars are stubbed in `.env.example`)
- Watch-provider deep links are structured so you can add affiliate query params per provider
- Ad slots can be dropped into `Rail` or page layouts without restructuring

## What's intentionally *not* included
This app deliberately does **not** host, upload, or stream copyrighted movies, TV, music, or manga files — that
would be piracy and both illegal and a fast way to get the whole project shut down. Every "watch" or "listen"
action deep-links to a licensed third party.
