# Czech Rocket Society — Interaktivní platforma

> Interactive Platform for Presenting the Activities of the Rocket Club

Webová aplikace pro Czech Rocket Society umožňující prezentaci činností spolku, správu obsahu přes admin CMS, interaktivní náborový proces a vizualizaci telemetrických dat z raketových startů.

**Bakalářská práce** — Univerzita Hradec Králové, Fakulta informatiky a managementu

- **Autor:** Šimon Cerman
- **Vedoucí práce:** Petr Bauer
- **Rok:** 2025

## Tech Stack

| Vrstva | Technologie |
|--------|------------|
| Frontend | Next.js 16, React 19, Tailwind CSS v4, Framer Motion |
| Backend (API) | Hono, Drizzle ORM, PostgreSQL, JWT auth |
| Backend (Telemetrie) | Go, MQTT (Mosquitto), InfluxDB, WebSocket |
| Infrastruktura | Docker Compose, pnpm workspaces |

## Prerekvizity

- Node.js 20+
- pnpm 9+
- Docker Desktop
- Go 1.21+ (pro telemetrickou službu)

## Spuštění

```bash
# 1. Spustit databázi a služby
pnpm docker:up

# 2. Nainstalovat závislosti
pnpm install

# 3. Připravit databázi
cd apps/api
pnpm db:push
pnpm db:seed
cd ../..

# 4. Spustit dev servery (web + API paralelně)
pnpm dev
```

- **Web:** http://localhost:3000
- **API:** http://localhost:3001
- **API dokumentace (Swagger):** http://localhost:3001/docs

Dev účty se vytvoří přes `pnpm db:seed` — viz `apps/api/src/db/seed.ts`.

## Struktura projektu

```
apps/
  web/           Next.js frontend (App Router)
  api/           Hono REST API backend
  telemetry/     Go telemetrická služba
docs/
  architecture/  Architektura, DB schema, API spec, bezpečnost
  design/        Design system, wireframes, accessibility
docker/          Docker Compose konfigurace
thesis/          LaTeX zdrojové soubory bakalářské práce
```

Podrobná technická dokumentace je v `docs/`.

## Roadmap

- Media knihovna — galerie, mazání, filtrování nahraných obrázků
- SEO a metadata — Open Graph, sitemap, robots.txt
- E-mailové notifikace — potvrzení přihlášky, notifikace admina
- Telemetrický dashboard — live streaming, historická data, porovnání startů
- CI/CD — GitHub Actions, staging deployment
- Onboarding integrace — Google Workspace, Notion, Slack po dokončení náboru
