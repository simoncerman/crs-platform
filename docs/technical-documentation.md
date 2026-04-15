# Technická dokumentace — CRS Platform

## 1. Přehled systému

Platforma Czech Rocket Society (CRS) je full-stack webová aplikace postavená jako monorepo. Systém se skládá ze tří hlavních aplikací, kontejnerizovaných služeb a sdílené infrastruktury.

### 1.1 Technologický stack

| Vrstva | Technologie | Verze |
|--------|-------------|-------|
| Frontend | Next.js (App Router) | 16.1.6 |
| UI framework | React | 19.2.0 |
| Stylování | Tailwind CSS | 4.x |
| Backend API | Hono | 4.6.3 |
| Telemetrie server | Go (Chi router) | 1.23 |
| Relační databáze | PostgreSQL | 16 (Alpine) |
| Časová databáze | InfluxDB | 2.7 (Alpine) |
| MQTT broker | Eclipse Mosquitto | 2.0 |
| ORM | Drizzle ORM | 0.33 |
| Autentizace (frontend) | NextAuth v5 | 5.0.0-beta.30 |
| Autentizace (backend) | JWT (jsonwebtoken) | 9.0.3 |
| Kontejnerizace | Docker Compose | 3.8 |
| Package manager | pnpm (workspaces) | — |
| Runtime | Node.js + tsx | — |

---

## 2. Architektura monorepa

### 2.1 Struktura workspace

Projekt využívá pnpm workspaces pro správu monorepa. Konfigurace v `pnpm-workspace.yaml`:

```yaml
packages:
  - apps/*
  - packages/*
```

### 2.2 Adresářová struktura

```
/
├── apps/
│   ├── api/                    # Hono REST API backend
│   │   ├── src/
│   │   │   ├── server.ts       # Entry point — Hono app
│   │   │   ├── db/
│   │   │   │   ├── schema.ts   # Drizzle ORM schéma
│   │   │   │   ├── index.ts    # Databázové připojení
│   │   │   │   ├── seed.ts     # Seed data
│   │   │   │   └── admin-helper.ts
│   │   │   ├── routes/         # Route handlery
│   │   │   │   ├── auth.ts
│   │   │   │   ├── articles.ts
│   │   │   │   ├── events.ts
│   │   │   │   ├── members.ts
│   │   │   │   ├── projects.ts
│   │   │   │   ├── recruitment.ts
│   │   │   │   ├── partners.ts
│   │   │   │   ├── upload.ts
│   │   │   │   └── media.ts
│   │   │   ├── schemas/        # Zod validační schémata
│   │   │   ├── middleware/
│   │   │   │   └── auth.ts     # JWT middleware
│   │   │   └── lib/
│   │   │       ├── jwt.ts      # JWT generování/verifikace
│   │   │       └── swagger.ts  # Swagger UI
│   │   ├── __tests__/          # Jest testy
│   │   ├── drizzle/            # Migrace
│   │   ├── uploads/            # Nahrané soubory
│   │   ├── Dockerfile
│   │   ├── drizzle.config.ts
│   │   ├── jest.config.cjs
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   ├── web/                    # Next.js frontend
│   │   ├── app/
│   │   │   ├── layout.tsx      # Root layout
│   │   │   ├── globals.css     # Tailwind + design system
│   │   │   ├── page.tsx        # Homepage (/)
│   │   │   ├── aktuality/      # /aktuality, /aktuality/[slug]
│   │   │   ├── udalosti/       # /udalosti, /udalosti/[slug]
│   │   │   ├── projekty/       # /projekty, /projekty/[slug]
│   │   │   ├── clenove/        # /clenove
│   │   │   ├── partneri/       # /partneri
│   │   │   ├── nabor/          # /nabor (nábor členů)
│   │   │   ├── o-nas/          # /o-nas
│   │   │   ├── telemetrie/     # /telemetrie (live + playback)
│   │   │   └── admin/
│   │   │       ├── login/      # /admin/login
│   │   │       └── (dashboard)/  # Route group — sdílený layout
│   │   │           ├── layout.tsx
│   │   │           ├── dashboard/
│   │   │           ├── articles/
│   │   │           ├── events/
│   │   │           ├── projects/
│   │   │           ├── members/
│   │   │           ├── partners/
│   │   │           ├── recruitment/
│   │   │           ├── media/
│   │   │           └── telemetry/
│   │   ├── components/         # Sdílené React komponenty
│   │   │   └── admin/          # Admin formuláře
│   │   ├── lib/
│   │   │   ├── auth.ts         # NextAuth konfigurace
│   │   │   ├── api.ts          # API client (fetch wrapper)
│   │   │   └── types/          # TypeScript typy
│   │   ├── middleware.ts       # Route protection
│   │   ├── next.config.ts
│   │   ├── tailwind.config.ts
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── telemetry/              # Go telemetrie server
│       ├── cmd/
│       │   ├── server/main.go  # Entry point
│       │   └── simulator/main.go # Simulátor dat
│       ├── internal/
│       │   ├── api/routes.go   # Chi HTTP router
│       │   ├── ws/hub.go       # WebSocket hub
│       │   ├── mqtt/subscriber.go # MQTT klient
│       │   ├── influx/writer.go   # InfluxDB writer
│       │   └── config/config.go
│       ├── Dockerfile
│       ├── go.mod
│       └── go.sum
│
├── docker/
│   ├── docker-compose.yml      # Všechny služby
│   └── mosquitto/
│       ├── Dockerfile
│       └── config/             # Mosquitto konfigurace
│
├── docs/                       # Dokumentace
├── package.json                # Root workspace skripty
├── pnpm-workspace.yaml
├── pnpm-lock.yaml
└── CLAUDE.md
```

---

## 3. Backend — Hono REST API

### 3.1 Architektura

Backend je postaven na frameworku **Hono** s runtime prostředím `@hono/node-server`. Používá modulový systém **ESM** (`"type": "module"` v `package.json`). Pro vývoj se používá `tsx` watch mode, protože TypeScript compiler nepřidává `.js` přípony potřebné pro ESM import resolution.

### 3.2 Middleware řetězec

```
Request → Logger → CORS → [Static Files] → Route Handler → Response
```

| Middleware | Popis |
|-----------|-------|
| `hono/logger` | Logování všech HTTP požadavků |
| `hono/cors` | CORS s origin z `CORS_ORIGIN` env |
| `serveStatic` | Statické soubory z `/uploads/*` |
| `authMiddleware` | JWT verifikace (per-route) |
| `adminOnly` | Kontrola role `admin` (per-route) |

### 3.3 Autentizace a autorizace

**JWT (JSON Web Token)** s knihovnou `jsonwebtoken`:

- **Generování tokenu**: `jwt.sign(payload, secret, { expiresIn: '7d' })`
- **Verifikace**: `jwt.verify(token, secret)` — vrací payload nebo `null`
- **Payload struktura**: `{ userId, email, role }`
- **Hashování hesel**: `bcrypt` s výchozími 10 koly saltu

**Auth middleware** (`src/middleware/auth.ts`):
1. Extrahuje `Bearer <token>` z `Authorization` hlavičky
2. Verifikuje token přes `verifyToken()`
3. Nastavuje `c.set('user', payload)` do Hono kontextu
4. Vrací 401 při chybějícím/neplatném tokenu

**Admin middleware** (`adminOnly`):
- Kontroluje `user.role === 'admin'`
- Vrací 403 při nedostatečných oprávněních

### 3.4 API endpointy

#### Autentizace (`/api/auth`)

| Metoda | Endpoint | Auth | Popis |
|--------|----------|------|-------|
| POST | `/api/auth/login` | Ne | Přihlášení (email + heslo → JWT) |
| POST | `/api/auth/register` | Ne | Registrace nového uživatele |

#### Články (`/api/articles`)

| Metoda | Endpoint | Auth | Popis |
|--------|----------|------|-------|
| GET | `/api/articles` | Ne | Seznam článků (filtr: `status`, `limit`) |
| GET | `/api/articles/slug/:slug` | Ne | Článek podle slugu |
| GET | `/api/articles/:id` | Ne | Článek podle ID |
| POST | `/api/articles` | JWT | Vytvoření článku |
| PUT | `/api/articles/:id` | JWT | Úprava článku |
| DELETE | `/api/articles/:id` | JWT | Smazání článku |

#### Události (`/api/events`)

| Metoda | Endpoint | Auth | Popis |
|--------|----------|------|-------|
| GET | `/api/events` | Ne | Seznam událostí (filtr: `status`, `limit`) |
| GET | `/api/events/slug/:slug` | Ne | Událost podle slugu |
| GET | `/api/events/:id` | Ne | Událost podle ID |
| POST | `/api/events` | JWT | Vytvoření události |
| PUT | `/api/events/:id` | JWT | Úprava události |
| DELETE | `/api/events/:id` | JWT | Smazání události |

#### Členové (`/api/members`)

| Metoda | Endpoint | Auth | Popis |
|--------|----------|------|-------|
| GET | `/api/members` | Ne | Seznam členů (filtr: `active`, `tag`, `limit`) |
| GET | `/api/members/:id` | Ne | Člen podle ID |
| POST | `/api/members` | JWT | Vytvoření člena |
| PUT | `/api/members/:id` | JWT | Úprava člena |
| DELETE | `/api/members/:id` | JWT | Smazání člena |

#### Projekty (`/api/projects`)

| Metoda | Endpoint | Auth | Popis |
|--------|----------|------|-------|
| GET | `/api/projects` | Ne | Seznam projektů (filtr: `status`, `limit`) |
| GET | `/api/projects/slug/:slug` | Ne | Projekt podle slugu |
| GET | `/api/projects/:id` | Ne | Projekt podle ID |
| POST | `/api/projects` | JWT | Vytvoření projektu |
| PUT | `/api/projects/:id` | JWT | Úprava projektu |
| DELETE | `/api/projects/:id` | JWT | Smazání projektu |

#### Nábor (`/api/recruitment`)

| Metoda | Endpoint | Auth | Popis |
|--------|----------|------|-------|
| POST | `/api/recruitment/draft` | Ne | Vytvoření draftu přihlášky |
| GET | `/api/recruitment/draft/:id` | Ne | Načtení draftu |
| POST | `/api/recruitment/draft/:id/submit` | Ne | Odeslání přihlášky |
| POST | `/api/recruitment` | Ne | Přímé odeslání přihlášky |
| GET | `/api/recruitment` | JWT | Seznam přihlášek (admin) |
| GET | `/api/recruitment/:id` | JWT | Detail přihlášky (admin) |
| PUT | `/api/recruitment/:id` | JWT | Aktualizace stavu přihlášky |
| GET | `/api/recruitment/settings` | JWT | Nastavení náboru |
| PUT | `/api/recruitment/settings` | JWT | Úprava nastavení náboru |

#### Partneři (`/api/partners`)

| Metoda | Endpoint | Auth | Popis |
|--------|----------|------|-------|
| GET | `/api/partners` | Ne | Veřejný seznam partnerů |
| GET | `/api/partners/all` | JWT + Admin | Všichni partneři včetně nepublikovaných |
| GET | `/api/partners/:id` | Ne | Partner podle ID |
| POST | `/api/partners` | JWT + Admin | Vytvoření partnera |
| PUT | `/api/partners/:id` | JWT + Admin | Úprava partnera |
| DELETE | `/api/partners/:id` | JWT + Admin | Smazání partnera |

#### Média (`/api/media`, `/api/upload`)

| Metoda | Endpoint | Auth | Popis |
|--------|----------|------|-------|
| POST | `/api/media/upload` | JWT | Nahrání souboru (multipart) |
| GET | `/api/media` | JWT | Seznam nahraných souborů |
| DELETE | `/api/media/:filename` | JWT | Smazání souboru |
| POST | `/api/upload` | Ne | Veřejný upload (nábor) |
| GET | `/api/upload/:filename` | Ne | Stažení souboru |
| DELETE | `/api/upload/:filename` | JWT | Smazání souboru |

#### Systémové

| Metoda | Endpoint | Popis |
|--------|----------|-------|
| GET | `/health` | Health check |
| GET | `/api` | Info o API (verze, endpointy) |
| GET | `/docs` | Swagger UI dokumentace |

### 3.5 Validace

Vstupní data jsou validována pomocí **Zod** schémat integrovaných přes `@hono/zod-validator`. Validační schémata jsou definována v `src/schemas/` a aplikována jako middleware na POST/PUT endpointech.

---

## 4. Databázové schéma (PostgreSQL + Drizzle ORM)

### 4.1 ER diagram

```
┌──────────────┐     ┌──────────────────┐     ┌──────────────┐
│    users      │     │    articles       │     │    events     │
├──────────────┤     ├──────────────────┤     ├──────────────┤
│ id (UUID, PK)│◄────│ authorId (FK)     │     │ id (UUID, PK)│
│ email        │     │ id (UUID, PK)     │     │ title        │
│ passwordHash │     │ title             │     │ slug (unique)│
│ name         │     │ slug (unique)     │     │ description  │
│ role         │     │ excerpt           │     │ location     │
│ createdAt    │     │ content           │     │ startDate    │
│ updatedAt    │     │ coverImage        │     │ endDate      │
└──────────────┘     │ images (JSONB)    │     │ coverImage   │
                     │ category          │     │ status       │
                     │ tags (JSONB)      │     │ eventType    │
                     │ status            │     │ published    │
                     │ published         │     │ createdAt    │
                     │ publishedAt       │     │ updatedAt    │
                     │ createdAt         │     └──────────────┘
                     │ updatedAt         │
                     └──────────────────┘

┌──────────────┐     ┌───────────────────┐     ┌──────────────────┐
│   members     │     │  project_members   │     │    projects       │
├──────────────┤     ├───────────────────┤     ├──────────────────┤
│ id (UUID, PK)│◄────│ memberId (FK)     │────►│ id (UUID, PK)    │
│ name         │     │ id (UUID, PK)     │     │ name             │
│ email        │     │ projectId (FK)    │     │ slug (unique)    │
│ phone        │     │ role              │     │ description      │
│ role         │     │ createdAt         │     │ category         │
│ department   │     └───────────────────┘     │ status           │
│ tags (JSONB) │                               │ coverImage       │
│ bio          │                               │ images (JSONB)   │
│ avatar       │                               │ githubUrl        │
│ linkedIn     │                               │ startDate        │
│ github       │                               │ completionDate   │
│ active       │                               │ specs (JSONB)    │
│ joinedAt     │                               │ published        │
│ createdAt    │                               │ isFeatured       │
│ updatedAt    │                               │ createdAt        │
└──────────────┘                               │ updatedAt        │
                                               └──────────────────┘

┌──────────────────────────┐     ┌──────────────────────────┐
│  recruitment_submissions  │     │   recruitment_settings    │
├──────────────────────────┤     ├──────────────────────────┤
│ id (UUID, PK)            │     │ id (UUID, PK)            │
│ name                     │     │ isActive                 │
│ email                    │     │ roles (JSONB)            │
│ phone                    │     │ tasks (JSONB)            │
│ education                │     │ updatedAt                │
│ experience               │     └──────────────────────────┘
│ interests                │
│ motivation               │     ┌──────────────────────────┐
│ skills                   │     │       partners            │
│ preferredRole            │     ├──────────────────────────┤
│ availability             │     │ id (UUID, PK)            │
│ resumeUrl                │     │ name                     │
│ task                     │     │ tier (enum: silver/gold/ │
│ status                   │     │        diamond)          │
│ notes                    │     │ logo                     │
│ createdAt                │     │ description              │
│ updatedAt                │     │ fullDescription          │
└──────────────────────────┘     │ heroImage                │
                                 │ website                  │
                                 │ order                    │
                                 │ published                │
                                 │ createdAt                │
                                 │ updatedAt                │
                                 └──────────────────────────┘
```

### 4.2 Tabulky — detailní popis

#### `users` — Administrační uživatelé
| Sloupec | Typ | Omezení | Popis |
|---------|-----|---------|-------|
| id | UUID | PK, auto | Primární klíč |
| email | VARCHAR(255) | NOT NULL, UNIQUE | E-mail |
| passwordHash | TEXT | NOT NULL | bcrypt hash hesla |
| name | VARCHAR(255) | NOT NULL | Jméno |
| role | VARCHAR(50) | NOT NULL, default 'editor' | Role: `admin`, `editor` |
| createdAt | TIMESTAMP | NOT NULL, default NOW | Datum vytvoření |
| updatedAt | TIMESTAMP | NOT NULL, default NOW | Datum úpravy |

#### `articles` — Články/aktuality
| Sloupec | Typ | Omezení | Popis |
|---------|-----|---------|-------|
| id | UUID | PK, auto | Primární klíč |
| title | VARCHAR(500) | NOT NULL | Titulek |
| slug | VARCHAR(500) | NOT NULL, UNIQUE | URL slug |
| excerpt | TEXT | — | Krátký popis |
| content | TEXT | NOT NULL | HTML obsah (rich text) |
| coverImage | TEXT | — | URL titulního obrázku |
| images | JSONB (string[]) | default [] | Galerie obrázků |
| category | VARCHAR(100) | — | Kategorie |
| tags | JSONB (string[]) | default [] | Štítky |
| status | VARCHAR(20) | NOT NULL, default 'draft' | `draft` / `published` |
| published | BOOLEAN | NOT NULL, default false | Veřejná viditelnost |
| publishedAt | TIMESTAMP | — | Datum publikování |
| authorId | UUID | FK → users.id | Autor |
| createdAt | TIMESTAMP | NOT NULL, default NOW | Datum vytvoření |
| updatedAt | TIMESTAMP | NOT NULL, default NOW | Datum úpravy |

#### `events` — Události
| Sloupec | Typ | Omezení | Popis |
|---------|-----|---------|-------|
| id | UUID | PK, auto | Primární klíč |
| title | VARCHAR(500) | NOT NULL | Název události |
| slug | VARCHAR(500) | NOT NULL, UNIQUE | URL slug |
| description | TEXT | NOT NULL | Popis |
| location | VARCHAR(255) | — | Místo konání |
| startDate | TIMESTAMP | NOT NULL | Začátek |
| endDate | TIMESTAMP | — | Konec |
| coverImage | TEXT | — | Titulní obrázek |
| status | VARCHAR(50) | NOT NULL, default 'upcoming' | `upcoming`, `ongoing`, `completed`, `cancelled` |
| eventType | VARCHAR(100) | NOT NULL, default 'event' | `launch`, `test`, `recruitment`, `pr`, `event` |
| published | BOOLEAN | NOT NULL, default false | Veřejná viditelnost |
| createdAt | TIMESTAMP | NOT NULL, default NOW | Datum vytvoření |
| updatedAt | TIMESTAMP | NOT NULL, default NOW | Datum úpravy |

#### `members` — Členové týmu
| Sloupec | Typ | Omezení | Popis |
|---------|-----|---------|-------|
| id | UUID | PK, auto | Primární klíč |
| name | VARCHAR(255) | NOT NULL | Jméno |
| email | VARCHAR(255) | — | E-mail |
| phone | VARCHAR(50) | — | Telefon |
| role | VARCHAR(255) | NOT NULL | Pozice (Lead Engineer, apod.) |
| department | VARCHAR(100) | — | Oddělení (Avionics, Propulsion, apod.) |
| tags | JSONB (string[]) | default [] | Štítky (Správní rada, Vedení, Člen) |
| bio | TEXT | — | Životopis |
| avatar | TEXT | — | URL fotky |
| linkedIn | TEXT | — | LinkedIn profil |
| github | TEXT | — | GitHub profil |
| active | BOOLEAN | NOT NULL, default true | Aktivní člen |
| joinedAt | TIMESTAMP | NOT NULL, default NOW | Datum vstupu |
| createdAt | TIMESTAMP | NOT NULL, default NOW | Datum vytvoření |
| updatedAt | TIMESTAMP | NOT NULL, default NOW | Datum úpravy |

#### `projects` — Raketové projekty
| Sloupec | Typ | Omezení | Popis |
|---------|-----|---------|-------|
| id | UUID | PK, auto | Primární klíč |
| name | VARCHAR(255) | NOT NULL | Název projektu |
| slug | VARCHAR(255) | NOT NULL, UNIQUE | URL slug |
| description | TEXT | NOT NULL | Popis |
| category | VARCHAR(100) | — | Kategorie (Rakety, Motory, Avionika) |
| status | VARCHAR(50) | NOT NULL, default 'planning' | `planning`, `development`, `testing`, `completed` |
| coverImage | TEXT | — | Titulní obrázek |
| images | JSONB (string[]) | default [] | Galerie obrázků |
| githubUrl | TEXT | — | GitHub repozitář |
| startDate | TIMESTAMP | — | Datum zahájení |
| completionDate | TIMESTAMP | — | Datum dokončení |
| specs | JSONB (Record) | — | Technické specifikace |
| published | BOOLEAN | NOT NULL, default false | Veřejná viditelnost |
| isFeatured | BOOLEAN | NOT NULL, default false | Zvýrazněný projekt |
| createdAt | TIMESTAMP | NOT NULL, default NOW | Datum vytvoření |
| updatedAt | TIMESTAMP | NOT NULL, default NOW | Datum úpravy |

#### `project_members` — Vazební tabulka (M:N)
| Sloupec | Typ | Omezení | Popis |
|---------|-----|---------|-------|
| id | UUID | PK, auto | Primární klíč |
| projectId | UUID | NOT NULL, FK → projects.id (CASCADE) | Projekt |
| memberId | UUID | NOT NULL, FK → members.id (CASCADE) | Člen |
| role | VARCHAR(255) | — | Role v projektu |
| createdAt | TIMESTAMP | NOT NULL, default NOW | Datum vytvoření |

#### `recruitment_submissions` — Přihlášky do náboru
| Sloupec | Typ | Omezení | Popis |
|---------|-----|---------|-------|
| id | UUID | PK, auto | Primární klíč |
| name | TEXT | NOT NULL | Jméno uchazeče |
| email | VARCHAR(255) | NOT NULL | E-mail |
| phone | TEXT | — | Telefon |
| education | TEXT | NOT NULL | Vzdělání |
| experience | TEXT | — | Praxe |
| interests | TEXT | NOT NULL | Zájmy |
| motivation | TEXT | NOT NULL | Motivace |
| skills | TEXT | — | Dovednosti |
| preferredRole | TEXT | — | Preferovaná pozice |
| availability | TEXT | — | Dostupnost |
| resumeUrl | TEXT | — | URL životopisu |
| task | TEXT | — | Odpověď na zadaný úkol |
| status | VARCHAR(50) | NOT NULL, default 'pending' | `pending`, `reviewed`, `accepted`, `rejected` |
| notes | TEXT | — | Poznámky administrátora |
| createdAt | TIMESTAMP | NOT NULL, default NOW | Datum vytvoření |
| updatedAt | TIMESTAMP | NOT NULL, default NOW | Datum úpravy |

#### `recruitment_settings` — Nastavení náboru
| Sloupec | Typ | Omezení | Popis |
|---------|-----|---------|-------|
| id | UUID | PK, auto | Primární klíč |
| isActive | BOOLEAN | NOT NULL, default true | Nábor aktivní |
| roles | JSONB (Array) | NOT NULL, default [] | Nabízené pozice |
| tasks | JSONB (Array) | NOT NULL, default [] | Zadané úkoly |
| updatedAt | TIMESTAMP | NOT NULL, default NOW | Datum úpravy |

#### `partners` — Partneři
| Sloupec | Typ | Omezení | Popis |
|---------|-----|---------|-------|
| id | UUID | PK, auto | Primární klíč |
| name | VARCHAR(255) | NOT NULL | Název partnera |
| tier | ENUM | NOT NULL | `silver`, `gold`, `diamond` |
| logo | TEXT | — | URL loga |
| description | TEXT | — | Krátký popis (gold, diamond) |
| fullDescription | TEXT | — | Dlouhý popis (diamond) |
| heroImage | TEXT | — | Hero obrázek (diamond) |
| website | TEXT | — | URL webu |
| order | INTEGER | NOT NULL, default 0 | Pořadí řazení |
| published | BOOLEAN | NOT NULL, default true | Veřejná viditelnost |
| createdAt | TIMESTAMP | NOT NULL, default NOW | Datum vytvoření |
| updatedAt | TIMESTAMP | NOT NULL, default NOW | Datum úpravy |

### 4.3 Relace

- **articles → users**: Článek má jednoho autora (`authorId` FK)
- **project_members → projects**: M:N vazba s kaskádovým mazáním
- **project_members → members**: M:N vazba s kaskádovým mazáním

### 4.4 Datové typy — konvence

- Všechna ID jsou **UUID** s `defaultRandom()`
- Pole s proměnnou délkou používají **TEXT** (ne VARCHAR) — prevence overflow
- Pole s kolekcemi (tagy, obrázky) používají **JSONB**
- Technické specifikace (`specs`) jsou volně strukturované **JSONB**
- Časové značky používají **TIMESTAMP** s `defaultNow()`

---

## 5. Frontend — Next.js

### 5.1 App Router struktura

Frontend využívá Next.js 16 **App Router** s React 19. Stránky se dělí na veřejné a administrační.

#### Veřejné stránky

| Cesta | Typ | Popis |
|-------|-----|-------|
| `/` | SSR | Homepage |
| `/aktuality` | SSR | Seznam článků |
| `/aktuality/[slug]` | SSR | Detail článku |
| `/udalosti` | SSR | Seznam událostí |
| `/udalosti/[slug]` | SSR | Detail události |
| `/projekty` | SSR | Seznam projektů |
| `/projekty/[slug]` | SSR | Detail projektu |
| `/clenove` | SSR | Seznam členů |
| `/partneri` | SSR | Partneři |
| `/nabor` | CSR | Náborový formulář |
| `/o-nas` | SSR | O nás |
| `/telemetrie` | CSR | Přehled telemetrických sessions |
| `/telemetrie/live/[sessionId]` | CSR | Live telemetrie |
| `/telemetrie/playback/[sessionId]` | CSR | Playback telemetrie |

#### Administrační stránky (route group `(dashboard)`)

| Cesta | Popis |
|-------|-------|
| `/admin/login` | Přihlášení |
| `/admin/dashboard` | Dashboard se statistikami |
| `/admin/articles` | Správa článků (CRUD) |
| `/admin/articles/new` | Nový článek |
| `/admin/articles/edit/[id]` | Editace článku |
| `/admin/events` | Správa událostí (CRUD) |
| `/admin/events/new` | Nová událost |
| `/admin/events/edit/[id]` | Editace události |
| `/admin/projects` | Správa projektů (CRUD) |
| `/admin/projects/new` | Nový projekt |
| `/admin/projects/edit/[id]` | Editace projektu |
| `/admin/members` | Správa členů (CRUD) |
| `/admin/members/new` | Nový člen |
| `/admin/members/edit/[id]` | Editace člena |
| `/admin/partners` | Správa partnerů (CRUD) |
| `/admin/partners/new` | Nový partner |
| `/admin/partners/edit/[id]` | Editace partnera |
| `/admin/recruitment` | Přihlášky do náboru |
| `/admin/recruitment/[id]` | Detail přihlášky |
| `/admin/recruitment/settings` | Nastavení náboru |
| `/admin/media` | Správa médií |
| `/admin/telemetry` | Admin telemetrie |

### 5.2 Autentizační tok

```
[Uživatel]                [Next.js Frontend]              [Hono API]
    │                           │                              │
    │── 1. email + heslo ──────►│                              │
    │                           │── 2. POST /api/auth/login ──►│
    │                           │                              │── 3. bcrypt.compare()
    │                           │◄── 4. JWT token + user ──────│
    │                           │── 5. NextAuth JWT session ──►│
    │                           │                              │
    │◄── 6. session cookie ────│                              │
    │                           │                              │
    │── 7. admin request ──────►│                              │
    │                           │── 8. middleware check ───────►│
    │                           │   (session → redirect?)      │
    │                           │── 9. Authorization: Bearer ──►│
    │                           │                              │── 10. verifyToken()
    │                           │◄── 11. response ─────────────│
    │◄── 12. rendered page ────│                              │
```

**NextAuth v5 konfigurace**:
- **Provider**: `CredentialsProvider` (email + heslo)
- **Strategie**: JWT (bez session databáze)
- **Callbacks**: `jwt` (ukládá token + role do JWT), `session` (přidává do session objektu)
- **Custom login page**: `/admin/login`
- **trustHost**: `true` (nutné za proxy/Docker)
- **Secret**: `NEXTAUTH_SECRET` env proměnná

**Next.js middleware** (`middleware.ts`):
- Matchuje `/admin/:path*`
- Nepřihlášený uživatel → redirect na `/admin/login`
- Přihlášený na `/admin/login` → redirect na `/admin/dashboard`

### 5.3 API klient

Server-side i client-side komunikace s API probíhá přes `lib/api.ts`:

- **Server-side**: Používá `INTERNAL_API_URL` (Docker interní síť, např. `http://api:3001`)
- **Client-side**: Používá `NEXT_PUBLIC_API_URL` (veřejná URL, např. `http://localhost:3001`)
- **Caching**: Next.js `revalidate: 60` (ISR — 60 sekund)

Funkce: `getArticles()`, `getArticleBySlug()`, `getEvents()`, `getEventBySlug()`, `getMembers()`, `getProjects()`, `getProjectBySlug()`

### 5.4 Formuláře a validace

- **React Hook Form** — správa stavu formulářů
- **Zod** — validační schémata (sdílená s backendem)
- **@hookform/resolvers** — propojení Zod s React Hook Form
- **react-quill-new** — WYSIWYG editor pro rich text obsah

### 5.5 UI a styling

**Tailwind CSS v4** s PostCSS pipeline (`@tailwindcss/postcss`).

**Design system** — Space theme + CRS brand:

| Token | Barva | Použití |
|-------|-------|---------|
| `deep-space` | #0a0e27 | Pozadí |
| `cosmic-blue` | #1a1f3a | Sekundární pozadí |
| `nebula-purple` | #2d1b4e | Gradient akcent |
| `aurora-cyan` | #64f4d2 | Primární akcent |
| `aurora-blue` | #4d9fff | Sekundární akcent |
| `stellar-white` | #f8f9fc | Text |
| `moon-gray` | #a0a7c0 | Utlumený text |
| `crs-base` | #1D00C8 | CRS modrá |
| `crs-ignition` | #F3B600 | CRS zlatá |

**Fonty**:
- **Raleway** — nadpisy (`--font-heading`)
- **Roboto Slab** — tělo textu (`--font-sans`)
- **Comfortaa** — akcenty (`--font-accent`)

**Další UI knihovny**:
- **Framer Motion** — animace a přechody
- **Lucide React** — ikony
- **clsx + tailwind-merge** — podmíněné třídy
- **class-variance-authority** — varianty komponent
- **Recharts** — grafy (telemetrie, dashboard)

---

## 6. Telemetrický systém

### 6.1 Architektura

Telemetrický systém zajišťuje sběr, ukládání a real-time vizualizaci dat z raketových zařízení.

```
┌───────────────────┐     MQTT (QoS 0)      ┌──────────────────┐
│  Raketové zařízení │ ──────────────────────►│  Mosquitto MQTT  │
│  (nebo simulátor) │      TCP :1883         │    Broker        │
└───────────────────┘                        └────────┬─────────┘
                                                      │
                                             Subscribe (+/rocket/+/telemetry/#)
                                                      │
                                                      ▼
                                             ┌──────────────────┐
                                             │  Go Telemetry    │
                                             │  Server (:8082)  │
                                             │                  │
                                             │  ┌─────────────┐ │
                                             │  │ MQTT        │ │
                                             │  │ Subscriber  │ │
                                             │  └──────┬──────┘ │
                                             │         │        │
                                             │    ┌────┴────┐   │
                                             │    │         │   │
                                             │    ▼         ▼   │
                                             │ ┌──────┐ ┌─────┐ │
                                             │ │Influx│ │ WS  │ │
                                             │ │Writer│ │ Hub │ │
                                             │ └──┬───┘ └──┬──┘ │
                                             │    │        │    │
                                             └────┼────────┼────┘
                                                  │        │
                                      Batch write │        │ WebSocket
                                      (500/100ms) │        │ (16ms batch)
                                                  ▼        ▼
                                          ┌──────────┐  ┌──────────┐
                                          │ InfluxDB │  │ Browser  │
                                          │ 2.7      │  │ (React)  │
                                          │ :8086    │  │          │
                                          └──────────┘  └──────────┘
```

### 6.2 Go Telemetry Server

Server je napsaný v **Go 1.23** a skládá se ze 4 interních balíčků:

#### `internal/mqtt` — MQTT Subscriber
- Připojení k brokeru přes TCP (`paho.mqtt.golang`)
- Automatické reconnect s 2s intervalem
- Subscribuje na wildcard topics:
  - `+/rocket/+/telemetry/#`
  - `+/test-stand/+/telemetry/#`
- Parsuje topic do struktury `TelemetryMessage`

**MQTT topic formát**: `{session_id}/{device_type}/{device_id}/telemetry/{data_type}`

Příklad: `launch-2024/rocket/alpha-1/telemetry/position`

**TelemetryMessage struktura**:
```go
type TelemetryMessage struct {
    SessionID  string                 // Z MQTT topicu
    DeviceType string                 // rocket, test-stand
    DeviceID   string                 // Identifikátor zařízení
    DataType   string                 // position, velocity, sensors
    Payload    map[string]interface{} // JSON data
    ReceivedAt time.Time
}
```

#### `internal/influx` — InfluxDB Writer
- **Non-blocking batch writes** s konfigurací:
  - Batch size: 500 bodů
  - Flush interval: 100 ms
  - Max retries: 3
  - Retry interval: 1000 ms
- Konvertuje `TelemetryMessage` na InfluxDB point s tagy:
  - `session_id`, `device_type`, `device_id`, `data_type`
- **Flux dotazy** pro historická data:
  - `QuerySessions()` — seznam session ID
  - `QueryDevices()` — zařízení v session
  - `QueryHistory()` — historická data s volitelným downsampling (`aggregateWindow`)

#### `internal/ws` — WebSocket Hub
- Správa připojených klientů (subscribe na session_id)
- **Micro-batching**: Zprávy jsou bufferovány a odesílány každých **16 ms**
- Binary WebSocket zprávy (JSON array)
- Backpressure: Pomalí klienti jsou přeskočeni (drop)
- Ping/Pong keep-alive (30s interval)

#### `internal/api` — HTTP Router (Chi)
- **Chi v5** router s middleware (Logger, Recoverer, CORS)

| Metoda | Endpoint | Popis |
|--------|----------|-------|
| GET | `/health` | Health check |
| GET | `/ws/telemetry?session_id=X` | WebSocket real-time stream |
| GET | `/api/sessions` | Seznam telemetrických sessions |
| GET | `/api/sessions/{sessionID}/devices` | Zařízení v session |
| GET | `/api/history?session_id=X&resolution=Y` | Historická data s downsampling |
| GET | `/api/history/export?session_id=X&format=csv|json` | Export dat |

### 6.3 MQTT topic hierarchie a payload

```
{session_id}/{device_type}/{device_id}/telemetry/
├── position    → { alt, lat, lon, ts }
├── velocity    → { vx, vy, vz, speed, ts }
└── sensors     → { temp, pressure, battery, gyro[3], phase, ts }
```

### 6.4 Datový tok v prohlížeči

Frontend stránky `telemetrie/live/[sessionId]` a `telemetrie/playback/[sessionId]` využívají:

1. **WebSocket** (Go server) pro real-time data
2. **mqtt.js** knihovnu pro přímé MQTT-over-WebSocket připojení (port 9001) jako fallback
3. **REST API** pro historická data a export
4. **Recharts** pro vizualizaci grafů

---

## 7. Infrastruktura — Docker

### 7.1 Služby

```yaml
# docker/docker-compose.yml (version: '3.8')
```

| Služba | Image | Port(y) | Účel | Perzistence |
|--------|-------|---------|------|-------------|
| **postgres** | postgres:16-alpine | 5432 | Relační databáze | `postgres_data` volume |
| **pgadmin** | dpage/pgadmin4 | 5050 | DB management UI | — |
| **influxdb** | influxdb:2.7-alpine | 8086 | Časová databáze (telemetrie) | `influxdb_data`, `influxdb_config` |
| **mosquitto** | eclipse-mosquitto:2.0 | 1883, 9001 | MQTT broker (TCP + WebSocket) | `mosquitto_data`, `mosquitto_logs` |
| **telemetry** | Custom Go build | 8082 | WebSocket hub + API | — |
| **mailhog** | mailhog/mailhog | 1025, 8025 | Dev SMTP server | — |
| **api** | Custom Node.js | 3001 | Hono API backend | Volume mount (hot reload) |
| **web** | Custom Node.js | 3000 | Next.js frontend | Volume mount (hot reload) |

### 7.2 Síťování

Všechny kontejnery sdílejí síť `crs-network` (bridge). Interní DNS umožňuje komunikaci jmény kontejnerů:
- Web → API: `http://api:3001` (přes `INTERNAL_API_URL`)
- Telemetry → MQTT: `tcp://mosquitto:1883`
- Telemetry → InfluxDB: `http://influxdb:8086`
- API → PostgreSQL: `postgres://crs_dev:...@postgres:5432/crs_platform`
- API → MailHog: `mailhog:1025`

### 7.3 Health checks

| Služba | Příkaz | Interval |
|--------|--------|----------|
| PostgreSQL | `pg_isready -U crs_dev -d crs_platform` | 10s |
| InfluxDB | `influx ping` | 10s |
| Mosquitto | `mosquitto_sub -t $$SYS/# -C 1 -W 3` | 10s |

Telemetry server čeká na zdravý stav Mosquitto i InfluxDB (`depends_on: condition: service_healthy`).

---

## 8. Proměnné prostředí

### 8.1 API (`apps/api/.env`)

| Proměnná | Příklad | Popis |
|----------|---------|-------|
| `DATABASE_URL` | `postgres://crs_dev:...@localhost:5432/crs_platform` | PostgreSQL connection string |
| `JWT_SECRET` | `your-super-secret-jwt-key` | Klíč pro JWT podpis |
| `JWT_EXPIRES_IN` | `7d` | Expirace tokenu |
| `PORT` | `3001` | Port API serveru |
| `NODE_ENV` | `development` | Prostředí |
| `CORS_ORIGIN` | `http://localhost:3000` | Povolený CORS origin |
| `SMTP_HOST` | `localhost` | SMTP server |
| `SMTP_PORT` | `1025` | SMTP port |
| `MAIL_FROM` | `noreply@crs.local` | Odesílatel e-mailů |
| `ADMIN_EMAIL` | `admin@crs.local` | Admin e-mail |

### 8.2 Web (`apps/web/.env.local`)

| Proměnná | Příklad | Popis |
|----------|---------|-------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:3001` | Veřejná API URL (client-side) |
| `INTERNAL_API_URL` | `http://api:3001` | Interní API URL (server-side, Docker) |
| `NEXTAUTH_SECRET` | `your-super-secret-key` | NextAuth secret |
| `NEXTAUTH_URL` | `http://localhost:3000` | Canonical URL aplikace |

### 8.3 Telemetry (`apps/telemetry/.env`)

| Proměnná | Příklad | Popis |
|----------|---------|-------|
| `MQTT_BROKER` | `localhost:1883` | MQTT broker adresa |
| `INFLUX_URL` | `http://localhost:8086` | InfluxDB URL |
| `INFLUX_TOKEN` | `dev-token-change-in-prod` | InfluxDB auth token |
| `INFLUX_ORG` | `czech-rocket-society` | InfluxDB organizace |
| `INFLUX_BUCKET` | `telemetry` | InfluxDB bucket |
| `WS_PORT` | `8082` | WebSocket/HTTP port |

---

## 9. TypeScript konfigurace

### 9.1 API (`apps/api/tsconfig.json`)

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "sourceMap": true,
    "declaration": true
  }
}
```

### 9.2 Web (`apps/web/tsconfig.json`)

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "module": "esnext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "incremental": true,
    "paths": { "@/*": ["./*"] }
  }
}
```

---

## 10. Testování

### 10.1 Backend testy

- **Framework**: Jest 29 + ts-jest
- **Umístění**: `apps/api/src/__tests__/`
- **Spuštění**: `NODE_OPTIONS=--experimental-vm-modules pnpm test`

**Testované oblasti**:
- **JWT** (`auth.test.ts`): Generování tokenů, verifikace, expirace, neplatné tokeny
- **Auth middleware** (`middleware/auth.test.ts`): Chybějící/neplatné hlavičky, platný token, role check, admin-only middleware

**Jest konfigurace** (`jest.config.cjs`):
```javascript
{
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts'],
  collectCoverageFrom: ['src/**/*.ts', '!src/db/migrate.ts', '!src/db/seed.ts'],
  moduleNameMapper: { '^@/(.*)$': '<rootDir>/src/$1' }
}
```

---

## 11. Závislosti — kompletní přehled

### 11.1 API backend

| Balíček | Verze | Účel |
|---------|-------|------|
| hono | 4.6.3 | HTTP framework |
| @hono/node-server | 1.12.2 | Node.js adapter |
| @hono/swagger-ui | 0.5.2 | API dokumentace |
| @hono/zod-openapi | 1.1.5 | OpenAPI schéma |
| @hono/zod-validator | 0.7.5 | Request validace |
| drizzle-orm | 0.33 | ORM |
| drizzle-kit | 0.24.2 | Migrace, studio |
| postgres | 3.4.4 | PostgreSQL driver |
| bcrypt | 5.1.1 | Hashování hesel |
| jsonwebtoken | 9.0.3 | JWT |
| multer | 2.0.2 | File upload |
| nodemailer | 7.0.13 | E-maily |
| zod | 4.1.13 | Validace |
| dotenv | 16.4.5 | Env proměnné |
| tsx | 4.19.1 | TS runtime |

**Dev**: jest, ts-jest, supertest, typescript, eslint, @types/*

### 11.2 Web frontend

| Balíček | Verze | Účel |
|---------|-------|------|
| next | 16.1.6 | Framework |
| react | 19.2.0 | UI knihovna |
| react-dom | 19.2.0 | React DOM |
| next-auth | 5.0.0-beta.30 | Autentizace |
| @auth/core | 0.34.3 | Auth core |
| @tanstack/react-query | 5.90.12 | Data fetching/cache |
| react-hook-form | 7.68.0 | Formuláře |
| @hookform/resolvers | 5.2.2 | Zod resolver |
| zod | 4.1.13 | Validace |
| framer-motion | 12.23.25 | Animace |
| lucide-react | 0.556.0 | Ikony |
| react-quill-new | 3.6.0 | WYSIWYG editor |
| recharts | 3.7.0 | Grafy |
| mqtt | 5.15.0 | MQTT klient |
| clsx | 2.1.1 | Podmíněné CSS třídy |
| tailwind-merge | 3.4.0 | Tailwind merge |
| class-variance-authority | 0.7.1 | Varianty komponent |
| date-fns | 4.1.0 | Formátování dat |

**Dev**: tailwindcss 4, @tailwindcss/postcss, typescript, eslint, eslint-config-next, @types/*

### 11.3 Go Telemetry

| Balíček | Účel |
|---------|------|
| paho.mqtt.golang | MQTT klient |
| go-chi/chi/v5 | HTTP router |
| go-chi/cors | CORS middleware |
| gorilla/websocket | WebSocket |
| influxdb-client-go/v2 | InfluxDB klient |
| godotenv | Env proměnné |

---

## 12. Vývojové workflow

### 12.1 Spuštění projektu

```bash
# 1. Spustit Docker služby
pnpm docker:up

# 2. Synchronizovat databázové schéma
cd apps/api && pnpm db:push

# 3. Naplnit testovací data
cd apps/api && pnpm db:seed

# 4. Vytvořit admin účet
cd apps/api && pnpm admin:create

# 5. Spustit dev servery
pnpm dev
```

### 12.2 Dostupné skripty

| Příkaz | Popis |
|--------|-------|
| `pnpm dev` | Web + API paralelně |
| `pnpm dev:web` | Pouze Next.js (:3000) |
| `pnpm dev:api` | Pouze API (:3001) |
| `pnpm build` | Build všech balíčků |
| `pnpm lint` | Lint všech balíčků |
| `pnpm format` | Prettier formátování |
| `pnpm docker:up` | Start Docker služeb |
| `pnpm docker:down` | Stop Docker služeb |
| `pnpm docker:logs` | Logy služeb |

### 12.3 Databázová správa

```bash
cd apps/api
pnpm db:push          # Aplikovat schéma na DB
pnpm db:generate      # Generovat migrace
pnpm db:migrate       # Spustit migrace
pnpm db:studio        # Drizzle Studio GUI
pnpm db:seed          # Seed data
pnpm db:seed:partners # Seed partnerů
pnpm admin:create     # Vytvořit admin účet
pnpm admin:list       # Seznam adminů
pnpm admin:reset      # Reset hesla
```
