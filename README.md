# Nandhini L — Developer Portfolio

A full-stack personal portfolio: a **React + TypeScript** single-page site backed by an **ASP.NET Core 8 Web API**. The site renders instantly from bundled content and then loads live data from the API; the API also handles contact-form submissions with server-side validation, rate limiting and spam protection.

> All professional content (experience, projects, skills, education) lives in one file — [`content/portfolio.json`](content/portfolio.json) — shared by both the API and the frontend, so there is a single source of truth.

---

## Table of contents

- [Architecture](#architecture)
- [Project structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Quick start](#quick-start)
- [Environment configuration](#environment-configuration)
- [Running the backend](#running-the-backend)
- [Running the frontend](#running-the-frontend)
- [API reference](#api-reference)
- [Contact form: storage and email](#contact-form-storage-and-email)
- [Testing](#testing)
- [Production build](#production-build)
- [Deployment](#deployment)
- [Docker](#docker)
- [Accessibility and quality](#accessibility-and-quality)
- [What needs your configuration](#what-needs-your-configuration)

---

## Architecture

```
┌─────────────────────────┐        GET /api/portfolio, /projects, ...        ┌──────────────────────────┐
│  React + TypeScript SPA  │ ───────────────────────────────────────────────▶│  ASP.NET Core 8 Web API  │
│  (Vite, no UI framework) │        POST /api/contact                         │  Controllers → Services  │
│                          │ ◀───────────────────────────────────────────────│  JSON content repository │
└─────────────────────────┘        JSON responses / problem+json errors       └──────────────────────────┘
          │                                                                              │
          │ reads bundled copy for instant first paint + offline fallback                │ reads
          └──────────────────────────────▶ content/portfolio.json ◀──────────────────────┘
```

- **Frontend** calls `/api`. In development, the Vite dev server proxies `/api` to the API. In production, either host the built site behind the API (it serves `wwwroot`) or set `VITE_API_BASE_URL` to the API's URL.
- **Backend** reads the shared JSON once into memory (no database needed — the content changes only on redeploy). Contact submissions are written to a local file and, if configured, emailed.

---

## Project structure

```
nandhini-portfolio/
├── content/
│   └── portfolio.json              # Single source of truth for all portfolio content
├── backend/
│   ├── Portfolio.sln
│   ├── src/Portfolio.Api/
│   │   ├── Controllers/            # PortfolioController, ContactController
│   │   ├── Models/                 # Records + contact request/validation
│   │   ├── Services/               # Repository + contact notifiers (log/file/SMTP)
│   │   ├── Options/                # Strongly-typed config
│   │   ├── Program.cs              # DI, CORS, rate limiting, pipeline
│   │   ├── appsettings*.json
│   │   └── .env.example
│   └── tests/Portfolio.Api.Tests/  # xUnit unit + integration tests
├── frontend/
│   ├── src/
│   │   ├── components/             # layout/, sections/, ui/
│   │   ├── hooks/                  # theme, active section, in-view, portfolio loader
│   │   ├── lib/                    # validation, navigation helpers
│   │   ├── services/               # API client + typed services
│   │   ├── styles/                 # base.css, sections.css, contact.css
│   │   └── types/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   └── .env.example
├── docker-compose.yml
└── README.md
```

---

## Prerequisites

| Tool | Version | Notes |
|------|---------|-------|
| **Node.js** | 18.18+ (or 20+/22+) | Frontend build and tests |
| **npm** | 9+ | Ships with Node |
| **.NET SDK** | 8.0 | Backend build, run and tests |
| **Docker** | optional | For containerised run |

Check:

```bash
node -v && npm -v && dotnet --version
```

---

## Quick start

Open two terminals from the repository root.

**Terminal 1 — API:**

```bash
cd backend
dotnet restore
dotnet run --project src/Portfolio.Api
# API on http://localhost:5080  (health: http://localhost:5080/health)
```

**Terminal 2 — frontend:**

```bash
cd frontend
npm install
npm run dev
# Site on http://localhost:5173  (/api is proxied to the API)
```

Visit **http://localhost:5173**.

---

## Environment configuration

Both apps ship a `.env.example`. Copy it and edit — never commit real secrets.

**Frontend** (`frontend/.env.local`):

```bash
cp frontend/.env.example frontend/.env.local
```

| Variable | Default | Purpose |
|----------|---------|---------|
| `VITE_API_BASE_URL` | *(empty)* | Base URL of the API as the browser calls it. Empty = same origin (`/api`). Set to e.g. `https://api.your-domain.com` when hosted separately. **Every `VITE_` value is bundled into public JS — never put secrets here.** |
| `VITE_API_PROXY_TARGET` | `http://localhost:5080` | Where the Vite dev server forwards `/api`. |
| `VITE_API_TIMEOUT_MS` | `10000` | Abort an API request after this many ms. |

**Backend** (`backend/src/Portfolio.Api/.env.example`): ASP.NET Core reads env vars with `Section__Key` nesting. For local dev, prefer **user secrets** over env files:

```bash
cd backend/src/Portfolio.Api
dotnet user-secrets init
dotnet user-secrets set "Smtp:Host" "smtp.your-provider.com"
dotnet user-secrets set "Smtp:Password" "your-password"
```

| Setting | Default | Purpose |
|---------|---------|---------|
| `Cors__AllowedOrigins__0` | `http://localhost:5173` | Allowed browser origins (add more with `__1`, `__2`, …). |
| `Contact__StoreSubmissions` | `true` | Append each message to a local JSONL file. |
| `Contact__StorePath` | `App_Data/contact-messages.jsonl` | Where submissions are stored. |
| `Contact__PermitLimitPerMinute` | `5` | Contact submissions per IP per minute. |
| `Smtp__Host` …​ | *(empty)* | Optional email delivery. **Email is sent only when host + from + to are set.** |

---

## Running the backend

```bash
cd backend
dotnet run --project src/Portfolio.Api               # Development
dotnet run --project src/Portfolio.Api -c Release     # Release
```

Default URL: `http://localhost:5080` (change with `ASPNETCORE_URLS`).

---

## Running the frontend

```bash
cd frontend
npm run dev          # Dev server with HMR + /api proxy  (port 5173)
npm run build        # Type-check + production build into dist/
npm run preview      # Preview the production build        (port 4173)
npm run typecheck    # Type-check only
```

---

## API reference

Base path: `/api`. All responses are JSON; errors use `application/problem+json`.

| Method | Path | Description | Success |
|--------|------|-------------|---------|
| GET | `/api/portfolio` | Full portfolio content | 200 |
| GET | `/api/skills` | Skill groups | 200 |
| GET | `/api/experience` | Work experience | 200 |
| GET | `/api/projects` | All projects | 200 |
| GET | `/api/projects/{id}` | One project (e.g. `sentinel`) | 200 / 404 |
| POST | `/api/contact` | Submit a contact message | 202 / 400 / 429 / 503 |
| GET | `/health` | Liveness check | 200 `Healthy` |

**Contact request body:**

```json
{
  "name": "Priya Raman",
  "email": "priya@example.com",
  "company": "Example Corp",
  "message": "Hi Nandhini, I'd like to talk about a senior role."
}
```

Validation (mirrored on client and server): name 2–100 chars, valid email ≤254 chars, company ≤120 chars (optional), message 20–4000 chars. Invalid input returns `400` with per-field messages keyed by camelCase field name. A hidden `website` honeypot field silently drops bot submissions. See [`Portfolio.Api.http`](backend/src/Portfolio.Api/Portfolio.Api.http) for ready-to-run requests.

---

## Contact form: storage and email

By default, every valid submission is appended to `App_Data/contact-messages.jsonl` (one JSON object per line). This works out of the box with no credentials.

To also receive submissions by email, configure the `Smtp` section (via user secrets or environment variables). When host, from and to are all set, an SMTP notifier is registered automatically and each message is emailed with the sender's address as reply-to. If no durable channel is configured, the API logs a startup warning and messages are only logged.

---

## Testing

### Backend (xUnit)

```bash
cd backend
dotnet test
```

Covers: contact validation rules, the contact service (delivery, trimming, honeypot, failure handling), the JSON repository (loading, case-insensitive lookup, error cases), controller responses, the file/SMTP channels, and full in-memory HTTP integration tests via `WebApplicationFactory`.

### Frontend (Jest + React Testing Library)

```bash
cd frontend
npm test                 # Run once
npm run test:watch       # Watch mode
npm run test:coverage    # With coverage
```

Covers: validation parity with the server, navigation/active-section logic, the API client (success, validation mapping, rate limit, network, timeout), the theme hook, the header (desktop + mobile nav, keyboard, theme toggle), the contact form (all states), project cards (links vs. "available on request"), and an App-level integration test (live API + offline fallback).

---

## Production build

**Frontend** (two options):

```bash
cd frontend
npm run build            # → frontend/dist/  (host as static files, API separate)
# OR, to let the API serve the site on one origin:
npm run build:backend    # → backend/src/Portfolio.Api/wwwroot/
```

**Backend:**

```bash
cd backend
dotnet publish src/Portfolio.Api -c Release -o publish
# Run: cd publish && dotnet Portfolio.Api.dll
```

If you ran `npm run build:backend` first, the published API serves the SPA and the API from a single origin (no CORS needed).

---

## Deployment

**Single-origin (simplest):** build the frontend into the API's `wwwroot`, publish the API, and deploy the `publish/` folder to any .NET host (Azure App Service, a container, a VM). The API serves the site and the API together; set `ASPNETCORE_URLS` and your `Smtp`/`Cors` config as environment variables.

**Split hosting:** deploy `frontend/dist/` to a static host (Azure Static Web Apps, Netlify, S3+CloudFront) and the API separately. Set `VITE_API_BASE_URL` to the API URL at build time, and add the static site's origin to `Cors__AllowedOrigins`.

**Azure App Service example (single-origin):**

```bash
cd frontend && npm run build:backend && cd ..
cd backend && dotnet publish src/Portfolio.Api -c Release -o publish
az webapp up --name <app-name> --runtime "DOTNET:8.0" --os-type Linux  # from publish/
```

---

## Docker

Run both the API (serving the built site) with Docker Compose from the repository root:

```bash
docker compose up --build
# Site + API on http://localhost:8080
```

The image builds the frontend into the API's `wwwroot` and publishes the API, so everything is served on one origin. Contact submissions persist to a named volume (`contact-data`). Configure SMTP/CORS by adding environment variables in `docker-compose.yml`.

---

## Accessibility and quality

- Semantic landmarks, a skip link, visible keyboard focus, `aria-current` on the active nav item, labelled icon-only buttons, and focus moved to section headings after in-page navigation.
- Respects `prefers-reduced-motion` (entrance animations and smooth scroll disabled).
- Light and dark themes with sufficient contrast; theme respected from the system and remembered.
- Responsive from ~320px up; no horizontal overflow at phone/tablet/desktop widths.
- The site renders bundled content even if the API is unreachable, so it never shows a blank page.

---

## What needs your configuration

These are intentionally left as safe placeholders:

1. **SMTP credentials** — contact emails are off until you set the `Smtp` section. Until then, submissions save to the JSONL file.
2. **Project links** — no GitHub/demo URLs are in the source data, so cards show "Available on request." Add URLs in `content/portfolio.json` under each project's `links`.
3. **Phone visibility** — the phone number is hidden on the website (`profile.phoneVisibleOnSite: false` in `content/portfolio.json`). Set it to `true` to show it.
4. **Production origins** — add your deployed site origin(s) to `Cors__AllowedOrigins` and set `VITE_API_BASE_URL` if hosting the API separately.
