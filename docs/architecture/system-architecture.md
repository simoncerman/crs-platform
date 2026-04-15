# 🏗️ Systémová Architektura - Czech Rocket Society Platform

## Přehled

Platforma Czech Rocket Society je moderní webová aplikace postavená na **microservices** architektuře s oddělením frontend, backend API a telemetrické služby.

## Architektonický Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                           UŽIVATELÉ                                  │
│  (Návštěvníci webu, Členové spolku, Administrátoři)                │
└────────────────────────────┬────────────────────────────────────────┘
                             │ HTTPS
                             ↓
┌─────────────────────────────────────────────────────────────────────┐
│                      FRONTEND LAYER                                  │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │           Next.js 16 (App Router + React 19)               │    │
│  │  • Server Side Rendering (SSR)                             │    │
│  │  • Static Site Generation (SSG) pro články                 │    │
│  │  • Client-side interaktivita (Framer Motion)               │    │
│  │  • Tailwind CSS v4 + oficiální CRS fonty                   │    │
│  │  • React Query pro data fetching & caching                 │    │
│  └────────────────────────────────────────────────────────────┘    │
└────────────────────────────┬────────────────────────────────────────┘
                             │ REST API (JSON)
                             │ + WebSocket (real-time telemetrie)
                             ↓
┌─────────────────────────────────────────────────────────────────────┐
│                      API GATEWAY LAYER                               │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │                  Fastify (Node.js)                         │    │
│  │  • RESTful API endpoints                                   │    │
│  │  • JWT autentizace & autorizace                            │    │
│  │  • Request validation (Zod schemas)                        │    │
│  │  • Rate limiting                                           │    │
│  │  • CORS handling                                           │    │
│  │  • API dokumentace (Swagger/OpenAPI)                       │    │
│  └────────────────────────────────────────────────────────────┘    │
└────────────┬───────────────────────────────────┬────────────────────┘
             │                                   │
             │ Prisma ORM                        │ HTTP/WebSocket
             ↓                                   ↓
┌──────────────────────────┐    ┌────────────────────────────────────┐
│   DATABASE LAYER         │    │   TELEMETRY SERVICE (Go)           │
│  ┌──────────────────┐    │    │  ┌──────────────────────────┐     │
│  │   PostgreSQL 16  │    │    │  │  • MQTT Subscriber       │     │
│  │  • Users         │    │    │  │  • Data Processing       │     │
│  │  • Articles      │    │    │  │  • Real-time streaming   │     │
│  │  • Projects      │    │    │  │  • Data aggregation      │     │
│  │  • Members       │    │    │  └──────────────────────────┘     │
│  │  • Partners      │    │    │             ↓                      │
│  │  • Recruitment   │    │    │  ┌──────────────────────────┐     │
│  └──────────────────┘    │    │  │    InfluxDB 2.x          │     │
│                          │    │  │  • Flight telemetry       │     │
│                          │    │  │  • Sensor data            │     │
│                          │    │  │  • Time-series metrics    │     │
│                          │    │  └──────────────────────────┘     │
└──────────────────────────┘    └────────────────────────────────────┘
                                               ↑
                                               │ MQTT Protocol
                                               │
                                ┌──────────────────────────────┐
                                │   IoT DEVICES                │
                                │  • On-board computers        │
                                │  • Sensors (GPS, IMU, etc.)  │
                                │  • Ground station receivers  │
                                └──────────────────────────────┘
```

## Komponenty systému

### 1. Frontend (Next.js)
**Technologie:**
- Next.js 16.0.7 s App Router
- React 19.2.0 + TypeScript 5.9.3
- Tailwind CSS 4.1.17
- Framer Motion 12.23.25 (animace)
- React Query (TanStack Query) pro data management
- React Hook Form + Zod pro formuláře

**Zodpovědnosti:**
- Rendering HTML (SSR/SSG/CSR)
- Uživatelské rozhraní a interakce
- Klientská validace formulářů
- Optimalizace výkonu (lazy loading, code splitting)
- SEO optimalizace
- Cachování API odpovědí

**Deployment:**
- Vercel (produkce)
- Preview deployments pro PR

### 2. Backend API (Fastify)
**Technologie:**
- Fastify 5.x (Node.js framework)
- TypeScript
- Prisma ORM 6.x
- JWT (jsonwebtoken) pro autentizaci
- Zod pro validaci schémat
- Swagger/OpenAPI dokumentace

**Zodpovědnosti:**
- Business logika aplikace
- CRUD operace pro všechny entity
- Autentizace (login, registrace, refresh tokens)
- Autorizace (role-based access control)
- Validace vstupních dat
- File upload handling (pro obrázky projektů, články)
- Email notifications (nové nábory, events)

**API Endpoints:**
```
/api/v1/auth/*        - Autentizace
/api/v1/articles/*    - Správa článků
/api/v1/projects/*    - Správa projektů
/api/v1/members/*     - Správa členů
/api/v1/partners/*    - Správa partnerů
/api/v1/recruitment/* - Náborové formuláře
/api/v1/telemetry/*   - Přístup k telemetrickým datům
```

**Deployment:**
- Docker container
- Railway / Render / VPS

### 3. Database (PostgreSQL)
**Verze:** PostgreSQL 16

**Hlavní tabulky:**
- `users` - Uživatelské účty (admins)
- `articles` - Blog články a aktuality
- `projects` - Raketové a satelitní projekty
- `members` - Členové spolku
- `project_members` - M:N vztah mezi projekty a členy
- `partners` - Partneři a sponzoři
- `recruitment_submissions` - Náborové přihlášky

**Vlastnosti:**
- ACID compliance
- Row-level security (RLS) pro multi-tenant data
- Full-text search pro články
- JSON fields pro metadata projektů

### 4. Telemetry Service (Go) - Fáze 2
**Technologie:**
- Go 1.21+
- MQTT client (Paho)
- InfluxDB 2.x client
- WebSocket server

**Zodpovědnosti:**
- Subscribe k MQTT topicům (`crs/telemetry/#`)
- Parsing telemetrických dat z raket
- Ukládání time-series dat do InfluxDB
- Real-time streaming dat přes WebSocket do frontendu
- Data aggregation a statistiky

**Deployment:**
- Docker container
- Co-located s InfluxDB

### 5. Time-Series Database (InfluxDB)
**Verze:** InfluxDB 2.x

**Měření (measurements):**
- `flight_telemetry` - GPS souřadnice, altitude, velocity
- `sensor_data` - Teplota, tlak, zrychlení (IMU)
- `system_metrics` - Battery voltage, CPU temp, memory

**Vlastnosti:**
- Optimalizováno pro time-series data
- Downsampling pro dlouhodobé uchování dat
- Flux query language
- Retention policies (hot/cold storage)

## Data Flow

### Standard Web Request
```
User Browser → Next.js (SSR) → Fastify API → PostgreSQL → Response
```

### Real-time Telemetry
```
Rocket Sensors → MQTT Broker → Go Service → InfluxDB
                                    ↓
                               WebSocket → Next.js Frontend
```

### Content Creation
```
Admin CMS → Fastify API → PostgreSQL → Webhook → Revalidate Next.js cache
```

## Bezpečnost

### Autentizace & Autorizace
- **JWT Tokens** pro API přístup
  - Access token (15 min TTL)
  - Refresh token (7 dní TTL, stored in httpOnly cookie)
- **Role-based Access Control (RBAC)**
  - `ADMIN` - plný přístup k CMS
  - `MEMBER` - čtení + edit vlastního profilu
  - `PUBLIC` - read-only přístup

### API Security
- **CORS** - whitelist domén (czechrocketsociety.cz)
- **Rate Limiting** - 100 req/min per IP
- **Input Validation** - Zod schemas pro všechny endpointy
- **SQL Injection Protection** - Prisma ORM (prepared statements)
- **XSS Protection** - sanitizace HTML v článcích
- **HTTPS Only** - TLS 1.3

### Database Security
- **Environment Variables** pro credentials
- **Connection Pooling** s limity
- **Backup Strategy** - denní automatické zálohy
- **Encryption at Rest** - PostgreSQL + InfluxDB

## Škálovatelnost

### Horizontální škálování
- **Frontend:** Serverless edge functions (Vercel)
- **Backend API:** Multiple Fastify instances za load balancerem
- **Database:** Read replicas pro PostgreSQL
- **Telemetry:** Multiple Go workers pro high-throughput

### Cachování
- **Next.js ISR** - Incremental Static Regeneration pro články
- **React Query** - Client-side cache (5 min stale time)
- **Redis** (optional) - Session store a API cache
- **CDN** - Statické assety (images, fonts)

### Monitoring
- **Application Monitoring:** Sentry (error tracking)
- **Performance:** Vercel Analytics, Lighthouse CI
- **Uptime:** UptimeRobot / Pingdom
- **Logs:** Centralizované logování (Grafana Loki)

## CI/CD Pipeline

```
GitHub Push → GitHub Actions → Tests → Build → Deploy
                                         ↓
                               Docker Registry → Production
```

**Pipeline kroky:**
1. **Lint** - ESLint, Prettier
2. **Type Check** - TypeScript
3. **Unit Tests** - Jest / Vitest
4. **Integration Tests** - Playwright
5. **Build** - Next.js build + Docker images
6. **Deploy** - Vercel (frontend) + Railway (backend)

## Diagramy

### ER Diagram
👉 Viz `database-schema.md`

### API Endpoints
👉 Viz `api-specification.md`

### Deployment Architecture
```
┌──────────────────┐
│  Vercel Edge     │ ← Next.js Frontend
└──────────────────┘
         ↓
┌──────────────────┐
│  Railway         │ ← Fastify API + PostgreSQL
└──────────────────┘
         ↓
┌──────────────────┐
│  VPS / Cloud     │ ← Go Telemetry + InfluxDB + MQTT
└──────────────────┘
```

## Vývojové prostředí

### Lokální development
```bash
# Start PostgreSQL
docker-compose up -d postgres

# Start Fastify API
cd apps/api
pnpm dev  # http://localhost:3001

# Start Next.js
cd apps/web
pnpm dev  # http://localhost:3000

# (Později) Start Go telemetry
cd apps/telemetry
go run main.go
```

### Environment Variables
```env
# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/crs_db"

# JWT
JWT_SECRET="your-secret-key"
JWT_REFRESH_SECRET="your-refresh-secret"

# API
API_URL="http://localhost:3001"
NEXT_PUBLIC_API_URL="http://localhost:3001"

# (Fáze 2) Telemetry
MQTT_BROKER_URL="mqtt://localhost:1883"
INFLUXDB_URL="http://localhost:8086"
INFLUXDB_TOKEN="your-token"
```

## Technický dluh a budoucí vylepšení

### Fáze 1 (MVP)
- ✅ Next.js frontend + základní design
- ✅ Fastify API + PostgreSQL
- ⏳ CMS pro články a projekty
- ⏳ Náborový formulář
- ⏳ Public member profiles

### Fáze 2 (Telemetrie)
- ⏳ Go telemetry service
- ⏳ InfluxDB setup
- ⏳ Real-time data visualization
- ⏳ Historical flight data queries

### Fáze 3 (Optimalizace)
- ⏳ Redis cache layer
- ⏳ Image optimization (CDN)
- ⏳ Search functionality (Algolia / Meilisearch)
- ⏳ Newsletter system
- ⏳ Event calendar integration

---

**Verze:** 1.0  
**Datum:** 8.12.2025  
**Autor:** Simon Cerman
