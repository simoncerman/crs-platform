# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Czech Rocket Society (CRS) platform — a monorepo for an interactive web application presenting the activities of the Czech Rocket Society. Bachelor thesis project (UHK, Šimon Cerman).

## Commands

### Development
```bash
pnpm dev              # Run both web and API in parallel
pnpm dev:web          # Next.js dev server only (port 3000)
pnpm dev:api          # Hono API server only (port 3001, tsx watch)
```

### Build & Lint
```bash
pnpm build            # Build all packages
pnpm lint             # Lint all packages
pnpm format           # Prettier format all files
```

### Testing (API)
```bash
cd apps/api
NODE_OPTIONS=--experimental-vm-modules pnpm test           # Run all tests
NODE_OPTIONS=--experimental-vm-modules pnpm test:watch     # Watch mode
NODE_OPTIONS=--experimental-vm-modules pnpm test:coverage  # With coverage
```
Tests use Jest + ts-jest, located in `apps/api/src/__tests__/**/*.test.ts`.

### Database (run from `apps/api`)
```bash
pnpm db:generate      # Generate Drizzle migrations
pnpm db:push          # Push schema to DB (--force)
pnpm db:migrate       # Run migrations
pnpm db:studio        # Open Drizzle Studio
pnpm db:seed          # Seed initial data
pnpm db:seed:partners # Seed partner data
pnpm admin:create     # Create admin user
pnpm admin:list       # List admin users
pnpm admin:reset      # Reset admin password
```

### Docker
```bash
pnpm docker:up        # Start services (PostgreSQL, pgAdmin, InfluxDB, Mosquitto, MailHog)
pnpm docker:down      # Stop services
pnpm docker:build     # Build Docker images
pnpm docker:logs      # View logs
```

## Architecture

### Monorepo Structure (pnpm workspaces)
- **`apps/web`** — Next.js 16 frontend (React 19, App Router, Tailwind CSS v4)
- **`apps/api`** — Hono REST API backend (Node.js, TypeScript, ESM)
- **`packages/`** — Shared packages (currently empty)
- **`docker/`** — Docker Compose configuration

### Backend (`apps/api`)
- **Framework:** Hono with `@hono/node-server`
- **ORM:** Drizzle ORM with PostgreSQL (`postgres` driver)
- **Schema:** `apps/api/src/db/schema.ts` — all tables, relations, and exported types
- **Database connection:** `apps/api/src/db/index.ts`
- **Drizzle config:** `apps/api/drizzle.config.ts`
- **API entry point:** `apps/api/src/server.ts`
- **Routes:** `apps/api/src/routes/` — auth, articles, events, members, projects, recruitment, upload, media, partners
- **Auth:** JWT tokens (jsonwebtoken) + bcrypt password hashing
- **File uploads:** Multer, served via Hono static middleware at `/uploads/*`
- **Validation:** Zod schemas
- **API docs:** Swagger UI via `@hono/swagger-ui`
- **Module type:** ESM (`"type": "module"` in package.json)

### Frontend (`apps/web`)
- **Framework:** Next.js 16 with App Router
- **Auth:** NextAuth v5 (beta.30) with JWT strategy + CredentialsProvider
- **Data fetching:** TanStack React Query
- **Forms:** React Hook Form + `@hookform/resolvers` + Zod validation
- **Styling:** Tailwind CSS v4, clsx, tailwind-merge, class-variance-authority
- **Rich text:** react-quill-new
- **Icons:** lucide-react
- **Animations:** Framer Motion
- **API client:** `apps/web/lib/api.ts`
- **Auth config:** `apps/web/lib/auth.ts`
- **Middleware:** `apps/web/middleware.ts` — protects `/admin/*` routes, redirects unauthenticated users to `/admin/login`

### Frontend Routes (Czech URL paths)
- Public: `/`, `/aktuality`, `/udalosti`, `/projekty`, `/clenove`, `/partneri`, `/nabor`, `/recruitment`, `/o-nas`
- Admin: `/admin/login`, `/admin/dashboard`, `/admin/articles`, `/admin/events`, `/admin/projects`, `/admin/partners`, `/admin/recruitment`, `/admin/media`
- Admin uses route group `(dashboard)` for shared layout

### Database Schema (Drizzle, PostgreSQL)
Tables: `users`, `articles`, `events`, `members`, `projects`, `project_members`, `recruitment_submissions`, `recruitment_settings`, `partners`

Custom enum: `partnerTierEnum` (`silver`, `gold`, `diamond`)

All entity types are exported from `apps/api/src/db/schema.ts` (e.g. `User`, `NewUser`, `Article`, `NewArticle`).

### Docker Services
PostgreSQL 16 (5432), pgAdmin (5050), InfluxDB 2.7 (8086), Mosquitto MQTT (1883/9001), MailHog SMTP (1025/8025)

### Authentication Flow
1. Frontend sends credentials to API (`POST /api/auth/login`)
2. API validates with bcrypt, returns JWT token + user data
3. NextAuth stores token in JWT session
4. Protected admin routes checked via middleware
5. API routes use auth middleware for protected endpoints
6. Server-side requests use `INTERNAL_API_URL` env var for Docker networking

### Environment Variables
- API: `apps/api/.env` (copy from `.env.example`) — `DATABASE_URL`, `JWT_SECRET`, `PORT`, `CORS_ORIGIN`, `SMTP_HOST/PORT`, `MAIL_FROM`
- Web: `apps/web/.env.local` — `NEXT_PUBLIC_API_URL`, `INTERNAL_API_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`

## Conventions

- Language: Czech for UI text, URL paths, and comments; English for code identifiers
- All database IDs are UUIDs
- Slugs are used for public-facing URLs (articles, events, projects)
- Entity status patterns: `draft`/`published` for content, `pending`/`reviewed`/`accepted`/`rejected` for recruitment
- `published` boolean field controls public visibility on most entities
- Fonts: Raleway (primary), Roboto Slab (secondary), Comfortaa (accent)
