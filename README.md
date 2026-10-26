<div align="center">

# 🎬 Fito

### Decide what to watch, together.

A private, two-person movie-night companion — pick a film, settle the eternal *"cinema or home?"* debate, and keep a shared watchlist in sync.

[![Live](https://img.shields.io/badge/Live-fito--gamma.vercel.app-000000?style=flat-square&logo=vercel&logoColor=white)](https://fito-gamma.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=nextdotjs)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind](https://img.shields.io/badge/Tailwind-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Supabase-Auth%20%2B%20DB-3FCF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com)
[![PWA](https://img.shields.io/badge/PWA-installable-5A0FC8?style=flat-square&logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)

</div>

---

## 📖 Overview

**Fito** turns choosing a film from a nightly argument into a few taps. It pulls rich movie data from **TMDB**, keeps a running watchlist in **Supabase**, and syncs **IMDb ratings** weekly so the list always reflects current scores. It is built as an installable **PWA** and scoped to two allow-listed users — intentionally small, intentionally private.

> **Live:** [fito-gamma.vercel.app](https://fito-gamma.vercel.app) — when Supabase auth is enabled, sign-in is restricted to allow-listed emails; otherwise it runs in open, no-login mode.

---

## ✨ Features

- **🍿 Watch decision flow** — browse, shortlist, and settle on a film; track *cinema vs. at-home* choices.
- **🔐 Passwordless auth** — Supabase **magic-link** sign-in with a hard **email allow-list** (two users). Runs fully without Supabase in a no-auth mode for local hacking.
- **🎞️ TMDB-powered catalog** — posters, metadata, and OG images sourced from The Movie Database.
- **⭐ Weekly IMDb ratings sync** — a **GitHub Actions** cron imports fresh IMDb ratings into Supabase (`--dry` mode for a safe read-only trial).
- **📱 Installable PWA** — service worker + home-screen install on iOS, Android, and desktop.
- **🪄 Polished motion** — **GSAP** + **Lenis** smooth scroll + **Motion** for fluid transitions.

---

## 🧰 Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router, Turbopack) · React 19 |
| **Language** | TypeScript 5 |
| **Styling / Motion** | Tailwind CSS 4 · GSAP · Lenis · Motion · lucide-react |
| **Backend / Data** | Supabase (SSR auth + Postgres) · TMDB API · IMDb ratings |
| **Automation** | GitHub Actions (weekly ratings cron) |
| **Testing** | Vitest |
| **Hosting** | Vercel |

---

## 🚀 Getting Started

### Prerequisites

- Node.js **≥ 20**
- A **TMDB** read access token ([themoviedb.org](https://www.themoviedb.org/settings/api))
- *(optional)* A **Supabase** project to enable authentication & the shared watchlist

### Install & run

```bash
git clone https://github.com/Thanh36-jqk/fito.git
cd fito
npm install
cp .env.example .env.local   # fill in TMDB_READ_TOKEN (Supabase optional)
npm run dev                  # http://localhost:3000
```

Without Supabase variables the app still runs — it simply skips authentication.

---

## ⚙️ Environment Variables

| Variable | Required | Scope | Description |
|---|:---:|---|---|
| `TMDB_READ_TOKEN` | ✅ | app | TMDB API read token (movie data) |
| `NEXT_PUBLIC_SUPABASE_URL` | — | client | Enables auth + shared watchlist |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | — | client | Supabase anon/publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | — | **scripts / CI only** | Ratings import. **Never set on Vercel.** |

> ⚠️ The service-role key is used **only** by `scripts/` and GitHub Actions — keeping it out of the client/Vercel runtime is a deliberate security boundary.

<details>
<summary><b>Supabase setup (auth + shared watchlist)</b></summary>

1. Create a free project at [supabase.com](https://supabase.com).
2. **SQL Editor** → run `supabase/migrations/0001_init.sql`, then edit the trailing `insert` to add the two allow-listed emails.
3. **Authentication → URL Configuration** → set Site URL and add `/.../auth/callback` redirect URLs for local + production.
4. **Authentication → Emails → Templates** → in both *Magic Link* and *Confirm signup*, set the link to:
   `{{ .RedirectTo }}?token_hash={{ .TokenHash }}&type=email` (makes the link work across any browser/mail client).
5. Copy the three Supabase keys from **Project Settings → API Keys** into `.env.local`.
6. Restart `npm run dev` and open `/login`.

</details>

<details>
<summary><b>Weekly IMDb ratings sync</b></summary>

- Add `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to **Settings → Secrets and variables → Actions**.
- Run the **"Nạp điểm IMDb"** workflow once; it then runs weekly on schedule.
- Local one-off import: `npm run imdb:import` — or a safe read-only trial: `node scripts/import-imdb-ratings.mjs --dry`.

</details>

---

## 🧪 Scripts

| Command | Description |
|---|---|
| `npm run dev` | Dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm test` | Unit tests (Vitest) |
| `npm run imdb:import` | Import IMDb ratings into Supabase |
| `node scripts/make-icons.mjs` | Regenerate app icons |

---

## ☁️ Deployment

Deploys on **Vercel** — import the repo, set `TMDB_READ_TOKEN` (and the public Supabase keys once auth is enabled), and every push to `main` ships automatically. The service worker is active only in production builds (`npm run build && npm run start`).

---

## 🔒 Privacy

Fito is a private, two-person app: the site is `noindex`, access is restricted to allow-listed emails when auth is on, and the Supabase service-role key never leaves server-side scripts.

---

## 📜 License & Author

© 2026 **Nguyễn Thành** — personal project.

[![GitHub](https://img.shields.io/badge/GitHub-Thanh36--jqk-181717?style=flat-square&logo=github)](https://github.com/Thanh36-jqk)
