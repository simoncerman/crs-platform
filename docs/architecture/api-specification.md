# 📡 API Specifikace - Czech Rocket Society Platform

## Přehled

RESTful API pro Czech Rocket Society platformu postavené na Fastify frameworku.

**Base URL:** `https://api.czechrocketsociety.cz/api/v1`  
**Lokální development:** `http://localhost:3001/api/v1`

## Autentizace

API používá **JWT (JSON Web Tokens)** pro autentizaci.

### Získání tokenů
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "admin@czechrocketsociety.cz",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "clx1y2z3a0001",
      "email": "admin@czechrocketsociety.cz",
      "role": "ADMIN"
    }
  }
}
```

### Použití tokenu
```http
GET /api/v1/articles
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Refresh token
```http
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## API Endpoints

### 🔐 Authentication

#### `POST /auth/register`
Vytvoření nového admin účtu (pouze pro existující adminy).

**Request:**
```json
{
  "email": "newadmin@czechrocketsociety.cz",
  "password": "SecurePass123!",
  "role": "ADMIN"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "clx1y2z3a0002",
    "email": "newadmin@czechrocketsociety.cz",
    "role": "ADMIN"
  }
}
```

#### `POST /auth/login`
Přihlášení uživatele.

**Request:**
```json
{
  "email": "admin@czechrocketsociety.cz",
  "password": "password123"
}
```

**Response:** `200 OK`

#### `POST /auth/refresh`
Obnovení access tokenu pomocí refresh tokenu.

#### `POST /auth/logout`
Odhlášení (invalidace refresh tokenu).

---

### 📰 Articles

#### `GET /articles`
Seznam všech článků (publikované pro public, všechny pro admin).

**Query params:**
- `page` (default: 1)
- `limit` (default: 10, max: 100)
- `published` (boolean) - filtr publikovaných
- `search` (string) - full-text search

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "articles": [
      {
        "id": "clx1y2z3a0003",
        "title": "První úspěšný start CRS-1",
        "slug": "prvni-uspesny-start-crs-1",
        "excerpt": "Historický moment...",
        "coverImage": "https://cdn.czechrocketsociety.cz/images/crs1-launch.jpg",
        "published": true,
        "publishedAt": "2025-12-01T10:00:00Z",
        "author": {
          "id": "clx1y2z3a0001",
          "email": "admin@czechrocketsociety.cz"
        },
        "createdAt": "2025-11-28T14:30:00Z",
        "updatedAt": "2025-12-01T10:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 25,
      "totalPages": 3
    }
  }
}
```

#### `GET /articles/:slug`
Detail jedného článku.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "clx1y2z3a0003",
    "title": "První úspěšný start CRS-1",
    "slug": "prvni-uspesny-start-crs-1",
    "content": "<p>Kompletní obsah článku v HTML...</p>",
    "excerpt": "Historický moment...",
    "coverImage": "https://cdn.czechrocketsociety.cz/images/crs1-launch.jpg",
    "published": true,
    "publishedAt": "2025-12-01T10:00:00Z",
    "author": {
      "id": "clx1y2z3a0001",
      "email": "admin@czechrocketsociety.cz"
    },
    "createdAt": "2025-11-28T14:30:00Z",
    "updatedAt": "2025-12-01T10:00:00Z"
  }
}
```

#### `POST /articles`
Vytvoření nového článku (pouze ADMIN).

**Request:**
```json
{
  "title": "Nový článek",
  "slug": "novy-clanek",
  "content": "<p>Obsah článku...</p>",
  "excerpt": "Krátký popis",
  "coverImage": "https://cdn.czechrocketsociety.cz/images/new.jpg",
  "published": false
}
```

**Response:** `201 Created`

#### `PATCH /articles/:id`
Úprava článku (pouze ADMIN).

#### `DELETE /articles/:id`
Smazání článku (pouze ADMIN).

#### `POST /articles/:id/publish`
Publikování článku (nastaví `published: true` a `publishedAt`).

---

### 🚀 Projects

#### `GET /projects`
Seznam všech projektů.

**Query params:**
- `page`, `limit`
- `status` (PLANNING | IN_PROGRESS | COMPLETED | ON_HOLD | CANCELLED)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "projects": [
      {
        "id": "clx1y2z3a0010",
        "name": "CRS Rocket Alpha",
        "slug": "crs-rocket-alpha",
        "description": "První experimentální raketa...",
        "status": "IN_PROGRESS",
        "startDate": "2025-01-01T00:00:00Z",
        "endDate": null,
        "thumbnail": "https://cdn.czechrocketsociety.cz/projects/alpha.jpg",
        "gallery": [
          "https://cdn.czechrocketsociety.cz/projects/alpha-1.jpg",
          "https://cdn.czechrocketsociety.cz/projects/alpha-2.jpg"
        ],
        "metadata": {
          "maxAltitude": "3000m",
          "engineType": "Solid fuel",
          "weight": "12kg"
        },
        "members": [
          {
            "id": "clx1y2z3a0020",
            "fullName": "Jan Novák",
            "roleTitle": "Rocket Engineer",
            "role": "Lead Engineer"
          }
        ],
        "createdAt": "2025-11-15T10:00:00Z",
        "updatedAt": "2025-12-08T15:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 8,
      "totalPages": 1
    }
  }
}
```

#### `GET /projects/:slug`
Detail projektu včetně všech členů.

#### `POST /projects`
Vytvoření nového projektu (pouze ADMIN).

**Request:**
```json
{
  "name": "CRS Rocket Beta",
  "slug": "crs-rocket-beta",
  "description": "Druhá generace rakety s telemetrií",
  "status": "PLANNING",
  "startDate": "2026-03-01",
  "thumbnail": "https://...",
  "metadata": {
    "maxAltitude": "5000m",
    "engineType": "Hybrid",
    "estimatedCost": "50000 CZK"
  }
}
```

**Response:** `201 Created`

#### `PATCH /projects/:id`
Aktualizace projektu.

#### `DELETE /projects/:id`
Smazání projektu.

#### `POST /projects/:id/members`
Přidání člena do projektu.

**Request:**
```json
{
  "memberId": "clx1y2z3a0021",
  "role": "Electronics Engineer"
}
```

#### `DELETE /projects/:projectId/members/:memberId`
Odebrání člena z projektu.

---

### 👥 Members

#### `GET /members`
Seznam všech členů.

**Query params:**
- `page`, `limit`
- `active` (boolean) - pouze aktivní členové

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "members": [
      {
        "id": "clx1y2z3a0020",
        "fullName": "Jan Novák",
        "roleTitle": "Rocket Engineer",
        "bio": "Specialista na konstrukci raket...",
        "profileImage": "https://cdn.czechrocketsociety.cz/members/jan-novak.jpg",
        "linkedinUrl": "https://linkedin.com/in/jan-novak",
        "githubUrl": "https://github.com/jnovak",
        "email": "jan.novak@czechrocketsociety.cz",
        "active": true,
        "joinedAt": "2024-06-15T00:00:00Z",
        "projects": [
          {
            "id": "clx1y2z3a0010",
            "name": "CRS Rocket Alpha",
            "role": "Lead Engineer"
          }
        ]
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 15,
      "totalPages": 1
    }
  }
}
```

#### `GET /members/:id`
Detail člena včetně všech projektů.

#### `POST /members`
Přidání nového člena (pouze ADMIN).

**Request:**
```json
{
  "fullName": "Anna Svobodová",
  "roleTitle": "Software Developer",
  "bio": "Full-stack developer se zaměřením na telemetrii",
  "profileImage": "https://...",
  "linkedinUrl": "https://linkedin.com/in/anna-svobodova",
  "email": "anna@czechrocketsociety.cz",
  "active": true
}
```

#### `PATCH /members/:id`
Aktualizace profilu člena.

#### `DELETE /members/:id`
Deaktivace člena (nastaví `active: false`).

---

### 🤝 Partners

#### `GET /partners`
Seznam všech partnerů.

**Query params:**
- `active` (boolean)
- `tier` (GOLD | SILVER | BRONZE)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "clx1y2z3a0030",
      "name": "Tech Corporation",
      "logoUrl": "https://cdn.czechrocketsociety.cz/partners/tech-corp.png",
      "websiteUrl": "https://techcorp.cz",
      "description": "Hlavní technologický partner",
      "tier": "GOLD",
      "active": true,
      "displayOrder": 1
    }
  ]
}
```

#### `POST /partners`
Přidání partnera (pouze ADMIN).

#### `PATCH /partners/:id`
Úprava partnera.

#### `DELETE /partners/:id`
Smazání partnera.

---

### 📝 Recruitment

#### `POST /recruitment`
Odeslání náborového formuláře (veřejné, bez autentizace).

**Request:**
```json
{
  "fullName": "Petr Horák",
  "email": "petr.horak@gmail.com",
  "phone": "+420 123 456 789",
  "studyField": "Strojní inženýrství",
  "university": "ČVUT",
  "yearOfStudy": 3,
  "skills": "CAD modelování, 3D tisk, základy elektroniky",
  "motivation": "Dlouhodobě mě fascinuje kosmonautika...",
  "experience": "Účastník soutěže CanSat 2024",
  "availability": "15 hodin týdně, možnost víkendy"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Přihláška byla úspěšně odeslána. Brzy se Ti ozveme!",
  "data": {
    "id": "clx1y2z3a0040",
    "status": "PENDING"
  }
}
```

#### `GET /recruitment`
Seznam všech přihlášek (pouze ADMIN).

**Query params:**
- `status` (PENDING | REVIEWED | ACCEPTED | REJECTED)
- `page`, `limit`

#### `GET /recruitment/:id`
Detail přihlášky (pouze ADMIN).

#### `PATCH /recruitment/:id`
Aktualizace statusu přihlášky (pouze ADMIN).

**Request:**
```json
{
  "status": "ACCEPTED",
  "notes": "Výborná motivace, zaměření na elektroniku potřebujeme. Pozvat na intro meeting."
}
```

#### `DELETE /recruitment/:id`
Smazání přihlášky (pouze ADMIN).

---

### 📊 Telemetry (Fáze 2)

#### `GET /telemetry/flights`
Seznam všech letů s telemetrií.

#### `GET /telemetry/flights/:id`
Detail letu včetně telemetrických dat.

#### `GET /telemetry/flights/:id/stream`
WebSocket endpoint pro real-time streaming dat.

---

## Error Responses

### Standardní error formát
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email je povinné pole",
    "details": {
      "field": "email",
      "constraint": "required"
    }
  }
}
```

### HTTP Status Codes
- `200 OK` - Úspěšný GET/PATCH request
- `201 Created` - Úspěšně vytvořeno
- `204 No Content` - Úspěšně smazáno
- `400 Bad Request` - Chybná validace
- `401 Unauthorized` - Chybějící/neplatný token
- `403 Forbidden` - Nedostatečná oprávnění
- `404 Not Found` - Entita nenalezena
- `409 Conflict` - Konflikt (např. duplicitní slug)
- `429 Too Many Requests` - Rate limit exceeded
- `500 Internal Server Error` - Chyba serveru

### Error Codes
```typescript
enum ErrorCode {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  RATE_LIMIT = 'RATE_LIMIT',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}
```

---

## Rate Limiting

- **Public endpoints:** 60 requests / minute per IP
- **Authenticated endpoints:** 100 requests / minute per user
- **Recruitment form:** 3 submissions / hour per IP

**Response headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1702028400
```

---

## Pagination

Všechny list endpoints podporují pagination:

**Request:**
```
GET /api/v1/articles?page=2&limit=20
```

**Response:**
```json
{
  "success": true,
  "data": {
    "articles": [...],
    "pagination": {
      "page": 2,
      "limit": 20,
      "total": 87,
      "totalPages": 5,
      "hasNext": true,
      "hasPrev": true
    }
  }
}
```

---

## Filtering & Sorting

### Filtering
```
GET /api/v1/projects?status=IN_PROGRESS
GET /api/v1/articles?published=true&search=raketa
```

### Sorting
```
GET /api/v1/articles?sortBy=publishedAt&order=desc
GET /api/v1/members?sortBy=joinedAt&order=asc
```

---

## File Uploads

Pro upload obrázků (cover images, profile images, project gallery):

```http
POST /api/v1/upload/image
Content-Type: multipart/form-data
Authorization: Bearer <token>

{
  "file": <binary>,
  "folder": "articles" | "projects" | "members" | "partners"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "url": "https://cdn.czechrocketsociety.cz/images/articles/abc123.jpg",
    "width": 1920,
    "height": 1080,
    "size": 245678
  }
}
```

**Limity:**
- Max velikost: 5 MB
- Povolené formáty: JPG, PNG, WebP
- Auto-komprese a resize

---

## Webhooks (budoucí feature)

Notifikace pro externí systémy:

```json
{
  "event": "article.published",
  "timestamp": "2025-12-08T15:30:00Z",
  "data": {
    "id": "clx1y2z3a0003",
    "title": "První úspěšný start CRS-1",
    "slug": "prvni-uspesny-start-crs-1"
  }
}
```

---

## OpenAPI/Swagger

Interaktivní API dokumentace dostupná na:
```
http://localhost:3001/documentation
https://api.czechrocketsociety.cz/documentation
```

---

**Verze:** 1.0  
**Datum:** 8.12.2025  
**Autor:** Simon Cerman
