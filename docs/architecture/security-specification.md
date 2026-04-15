# 🔒 Bezpečnostní Specifikace - Czech Rocket Society Platform

## Přehled

Komplexní bezpečnostní strategie pro zabezpečení webové platformy, API a uživatelských dat.

---

## 1. Autentizace & Autorizace

### 1.1 JWT (JSON Web Tokens)

**Access Token:**
- Typ: JWT
- Algoritmus: HS256 (HMAC-SHA256)
- TTL: **15 minut**
- Payload:
```json
{
  "sub": "clx1y2z3a0001",  // user ID
  "email": "admin@czechrocketsociety.cz",
  "role": "ADMIN",
  "iat": 1702028400,
  "exp": 1702029300
}
```

**Refresh Token:**
- Typ: JWT
- TTL: **7 dní**
- Uložení: httpOnly cookie (bezpečnější než localStorage)
- Rotation: nový refresh token při každém refreshi

### 1.2 Password Security

**Hashing:**
- Algoritmus: **bcrypt**
- Salt rounds: **10**
- Příklad:
```typescript
import bcrypt from 'bcrypt';

const saltRounds = 10;
const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
```

**Password Requirements:**
- Minimální délka: 8 znaků
- Musí obsahovat:
  - Alespoň 1 velké písmeno
  - Alespoň 1 malé písmeno
  - Alespoň 1 číslo
  - Alespoň 1 speciální znak (!@#$%^&*)

**Validace (Zod schema):**
```typescript
const passwordSchema = z.string()
  .min(8, 'Heslo musí mít alespoň 8 znaků')
  .regex(/[A-Z]/, 'Heslo musí obsahovat velké písmeno')
  .regex(/[a-z]/, 'Heslo musí obsahovat malé písmeno')
  .regex(/[0-9]/, 'Heslo musí obsahovat číslo')
  .regex(/[!@#$%^&*]/, 'Heslo musí obsahovat speciální znak');
```

### 1.3 Role-Based Access Control (RBAC)

**Role:**
```typescript
enum UserRole {
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
  PUBLIC = 'PUBLIC'  // non-authenticated
}
```

**Oprávnění:**

| Akce | PUBLIC | MEMBER | ADMIN |
|------|--------|--------|-------|
| Čtení článků (published) | ✅ | ✅ | ✅ |
| Čtení článků (draft) | ❌ | ❌ | ✅ |
| Vytvoření článku | ❌ | ❌ | ✅ |
| Úprava článku | ❌ | ❌ | ✅ |
| Smazání článku | ❌ | ❌ | ✅ |
| Čtení projektů | ✅ | ✅ | ✅ |
| Správa projektů | ❌ | ❌ | ✅ |
| Čtení členů | ✅ | ✅ | ✅ |
| Správa členů | ❌ | ❌ | ✅ |
| Odeslání náboru | ✅ | ✅ | ✅ |
| Správa náborů | ❌ | ❌ | ✅ |

**Middleware implementace:**
```typescript
// middleware/auth.ts
export const requireAuth = async (request, reply) => {
  const token = request.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return reply.status(401).send({ 
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Token chybí' }
    });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    request.user = decoded;
  } catch (err) {
    return reply.status(401).send({ 
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Neplatný token' }
    });
  }
};

export const requireRole = (allowedRoles: UserRole[]) => {
  return async (request, reply) => {
    if (!allowedRoles.includes(request.user.role)) {
      return reply.status(403).send({ 
        success: false,
        error: { code: 'FORBIDDEN', message: 'Nedostatečná oprávnění' }
      });
    }
  };
};
```

**Použití:**
```typescript
// Protected route
app.get('/articles/drafts', {
  preHandler: [requireAuth, requireRole(['ADMIN'])]
}, async (request, reply) => {
  // Handler
});
```

---

## 2. Input Validation

### 2.1 Request Validation (Zod)

**Příklad schema:**
```typescript
import { z } from 'zod';

const createArticleSchema = z.object({
  title: z.string().min(5).max(200),
  slug: z.string()
    .regex(/^[a-z0-9-]+$/, 'Slug může obsahovat pouze malá písmena, číslice a pomlčky'),
  content: z.string().min(100),
  excerpt: z.string().max(500).optional(),
  coverImage: z.string().url().optional(),
  published: z.boolean().default(false),
});

type CreateArticleInput = z.infer<typeof createArticleSchema>;
```

**Fastify plugin:**
```typescript
import { FastifyPluginAsync } from 'fastify';

const articlesRoutes: FastifyPluginAsync = async (app) => {
  app.post('/articles', {
    schema: {
      body: createArticleSchema,
    },
  }, async (request, reply) => {
    const validatedData = request.body as CreateArticleInput;
    // Handler
  });
};
```

### 2.2 SQL Injection Prevention

- **Prisma ORM** používá prepared statements automaticky
- **Nikdy nekoncatenovat** SQL queries ručně
- Příklad bezpečného query:
```typescript
// ✅ SAFE - Prisma
const article = await prisma.article.findUnique({
  where: { slug: userInput }
});

// ❌ DANGEROUS - raw SQL
const article = await prisma.$queryRaw`
  SELECT * FROM articles WHERE slug = ${userInput}
`;  // Zranitelné na injection!
```

### 2.3 XSS (Cross-Site Scripting) Prevention

**Sanitizace HTML inputů:**
```typescript
import DOMPurify from 'isomorphic-dompurify';

const sanitizeHTML = (dirtyHTML: string): string => {
  return DOMPurify.sanitize(dirtyHTML, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'ul', 'ol', 'li', 'a', 'img'],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class'],
  });
};

// Použití
const safeContent = sanitizeHTML(userInput);
```

**React automatická escapování:**
- React automaticky escapuje text v JSX
- Nikdy nepoužívat `dangerouslySetInnerHTML` bez sanitizace

---

## 3. HTTPS & Transport Security

### 3.1 TLS/SSL

- **Minimum:** TLS 1.2
- **Doporučeno:** TLS 1.3
- **Certificate:** Let's Encrypt (automatické obnovy)
- **HSTS Header:**
```
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

### 3.2 Security Headers

**Implementace (Fastify plugin):**
```typescript
import helmet from '@fastify/helmet';

app.register(helmet, {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.czechrocketsociety.cz"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      imgSrc: ["'self'", "data:", "https://cdn.czechrocketsociety.cz"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      connectSrc: ["'self'", "https://api.czechrocketsociety.cz"],
      frameAncestors: ["'none'"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  frameguard: {
    action: 'deny',
  },
  xssFilter: true,
  noSniff: true,
});
```

**Výsledné headers:**
```
Content-Security-Policy: default-src 'self'; ...
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
```

---

## 4. CORS (Cross-Origin Resource Sharing)

### 4.1 Konfigurace

**Produkce:**
```typescript
import cors from '@fastify/cors';

app.register(cors, {
  origin: [
    'https://czechrocketsociety.cz',
    'https://www.czechrocketsociety.cz',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});
```

**Development:**
```typescript
app.register(cors, {
  origin: ['http://localhost:3000'],
  credentials: true,
});
```

### 4.2 Preflight Requests

Browser automaticky posílá OPTIONS request pro komplexní queries:
```
OPTIONS /api/v1/articles
Access-Control-Request-Method: POST
Access-Control-Request-Headers: authorization, content-type
```

Fastify CORS plugin automaticky handluje preflight.

---

## 5. Rate Limiting

### 5.1 Global Rate Limit

```typescript
import rateLimit from '@fastify/rate-limit';

app.register(rateLimit, {
  max: 100,  // 100 requests
  timeWindow: '1 minute',
  errorResponseBuilder: (request, context) => ({
    success: false,
    error: {
      code: 'RATE_LIMIT',
      message: `Příliš mnoho požadavků. Zkuste znovu za ${Math.ceil(context.after / 1000)} sekund.`,
    },
  }),
});
```

### 5.2 Endpoint-Specific Limits

```typescript
// Recruitment form - pouze 3 submissions / hodinu
app.post('/recruitment', {
  config: {
    rateLimit: {
      max: 3,
      timeWindow: '1 hour',
    },
  },
}, async (request, reply) => {
  // Handler
});

// Login - pouze 5 pokusů / 15 minut
app.post('/auth/login', {
  config: {
    rateLimit: {
      max: 5,
      timeWindow: '15 minutes',
    },
  },
}, async (request, reply) => {
  // Handler
});
```

### 5.3 Response Headers

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 97
X-RateLimit-Reset: 1702028460
Retry-After: 60
```

---

## 6. Database Security

### 6.1 Connection Security

**Environment Variables:**
```env
# ❌ NEVER commit this to Git!
DATABASE_URL="postgresql://user:password@localhost:5432/crs_db?sslmode=require"
```

**Connection Pool:**
```typescript
// Prisma Client config
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  
  // Security settings
  connection_limit = 10
  pool_timeout = 20
}
```

### 6.2 Row-Level Security (Budoucí feature)

PostgreSQL RLS pro multi-tenant data:
```sql
-- Enable RLS on articles table
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- Policy: public can only see published articles
CREATE POLICY article_public_view ON articles
  FOR SELECT
  USING (published = true);

-- Policy: admins can see all articles
CREATE POLICY article_admin_view ON articles
  FOR SELECT
  TO admin_role
  USING (true);
```

### 6.3 Backup Security

- **Šifrované backupy** (GPG encryption)
- **Off-site storage** (AWS S3 / Azure Blob)
- **Automatické denní zálohy** (cron job)
- **Retention policy:** 30 denních + 12 měsíčních

```bash
#!/bin/bash
# backup-encrypted.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="crs_db_$DATE.backup"
ENCRYPTED_FILE="$BACKUP_FILE.gpg"

# Create backup
pg_dump -U postgres -d crs_db -F c -f /tmp/$BACKUP_FILE

# Encrypt with GPG
gpg --encrypt --recipient backup@czechrocketsociety.cz /tmp/$BACKUP_FILE

# Upload to S3
aws s3 cp /tmp/$ENCRYPTED_FILE s3://crs-backups/postgresql/

# Cleanup
rm /tmp/$BACKUP_FILE /tmp/$ENCRYPTED_FILE
```

---

## 7. Secrets Management

### 7.1 Environment Variables

**Struktura:**
```env
# .env (NEVER commit to Git!)

# Database
DATABASE_URL="postgresql://..."

# JWT
JWT_SECRET="random-256-bit-secret-key-here"
JWT_REFRESH_SECRET="another-random-secret"

# Email (pro notifications)
SMTP_HOST="smtp.gmail.com"
SMTP_USER="noreply@czechrocketsociety.cz"
SMTP_PASSWORD="app-specific-password"

# File uploads
CDN_URL="https://cdn.czechrocketsociety.cz"
S3_BUCKET="crs-uploads"
AWS_ACCESS_KEY_ID="..."
AWS_SECRET_ACCESS_KEY="..."

# Monitoring
SENTRY_DSN="https://..."
```

**Git ignore:**
```
# .gitignore
.env
.env.local
.env.production
```

### 7.2 Secret Generation

```bash
# Generate JWT secret (256-bit)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Or use OpenSSL
openssl rand -hex 32
```

### 7.3 Production Secrets

- **GitHub Secrets** pro CI/CD
- **Vercel Environment Variables** pro Next.js
- **Railway Environment Variables** pro Fastify API
- **Nikdy hardcode** secrets v kódu!

---

## 8. File Upload Security

### 8.1 Validation

**Povolené formáty:**
```typescript
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

const validateUpload = (file: MultipartFile) => {
  if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    throw new Error('Nepovolený formát souboru');
  }
  
  if (file.file.bytesRead > MAX_FILE_SIZE) {
    throw new Error('Soubor je příliš velký (max 5 MB)');
  }
};
```

### 8.2 File Storage

- **NIKDY ukládat do `/public`** (XSS riziko)
- **Používat CDN/S3** pro uploads
- **Randomizovat názvy souborů:**
```typescript
import { randomUUID } from 'crypto';

const filename = `${randomUUID()}-${Date.now()}.${extension}`;
```

### 8.3 Image Processing

**Auto-komprese a resize:**
```typescript
import sharp from 'sharp';

const processImage = async (buffer: Buffer) => {
  return sharp(buffer)
    .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 85 })
    .toBuffer();
};
```

---

## 9. Logging & Monitoring

### 9.1 Security Logs

**Co logovat:**
- ✅ Failed login attempts
- ✅ JWT token errors
- ✅ Rate limit violations
- ✅ 403/401 errors
- ✅ Suspicious activity (např. SQL injection pokusy)

**Co NELOGOVAT:**
- ❌ Passwords (ani hashed)
- ❌ JWT tokens
- ❌ Osobní údaje (GDPR)

**Příklad:**
```typescript
import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  redact: ['req.headers.authorization', 'password', 'passwordHash'],
});

// Usage
logger.warn({
  event: 'failed_login',
  email: 'user@example.com',
  ip: request.ip,
});
```

### 9.2 Error Tracking

**Sentry integrace:**
```typescript
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  beforeSend(event, hint) {
    // Redact sensitive data
    if (event.request?.headers) {
      delete event.request.headers.authorization;
    }
    return event;
  },
});
```

---

## 10. Dependency Security

### 10.1 NPM Audit

**Pravidelné kontroly:**
```bash
# Check for vulnerabilities
pnpm audit

# Fix automatically
pnpm audit fix

# Generate report
pnpm audit --json > audit-report.json
```

### 10.2 Dependabot

**GitHub Dependabot config:**
```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/apps/web"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10

  - package-ecosystem: "npm"
    directory: "/apps/api"
    schedule:
      interval: "weekly"
```

### 10.3 Lock Files

- **Commit `pnpm-lock.yaml`** do Gitu
- Zajišťuje reprodukovatelné buildy
- Prevence supply chain attacks

---

## 11. GDPR Compliance

### 11.1 Osobní Údaje

**Co ukládáme:**
- Email (users, recruitment)
- Jméno (members, recruitment)
- Telefon (recruitment)
- IP adresa (logs - anonymizovat po 30 dnech)

### 11.2 Uživatelská Práva

- **Právo na přístup:** API endpoint `/users/me/data`
- **Právo na vymazání:** `/users/me/delete` (soft delete)
- **Právo na export:** JSON export osobních dat

### 11.3 Cookie Consent

```typescript
// Cookie categories
enum CookieType {
  NECESSARY = 'necessary',  // Auth cookies
  ANALYTICS = 'analytics',  // Google Analytics
  MARKETING = 'marketing',  // Ad tracking
}

// Only NECESSARY cookies without consent
```

---

## 12. Security Checklist

### Pre-Launch
- [ ] HTTPS enabled (TLS 1.3)
- [ ] Security headers configured (Helmet)
- [ ] CORS properly configured
- [ ] Rate limiting active
- [ ] Input validation on all endpoints
- [ ] JWT secrets rotated
- [ ] Database backups automated
- [ ] Error logging (Sentry) configured
- [ ] NPM audit passed
- [ ] No secrets in Git history
- [ ] Password requirements enforced
- [ ] File upload validation active

### Post-Launch
- [ ] Monitor failed login attempts
- [ ] Regular dependency updates
- [ ] Weekly backup tests
- [ ] Monthly security audit
- [ ] Penetration testing (optional)

---

## 13. Incident Response Plan

### 13.1 Security Breach Procedure

1. **Detekce** - Monitoring alerts / user reports
2. **Containment** - Izolovat affected services
3. **Investigation** - Analyzovat logs, určit rozsah
4. **Remediation** - Patchnout vulnerability, rotate secrets
5. **Recovery** - Restore from backups if needed
6. **Notification** - Informovat affected users (GDPR)
7. **Post-mortem** - Dokumentovat incident, prevence

### 13.2 Contact

**Security issues:**
security@czechrocketsociety.cz

**Responsible disclosure policy:**
- Report privately via email
- Response within 48 hours
- No public disclosure before patch

---

**Verze:** 1.0  
**Datum:** 8.12.2025  
**Autor:** Simon Cerman
