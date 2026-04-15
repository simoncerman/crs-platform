# 🗄️ Databázové Schéma - PostgreSQL

## ER Diagram

```
┌─────────────────┐
│     users       │
├─────────────────┤
│ id (PK)         │
│ email           │◄─────────┐
│ password_hash   │          │
│ role            │          │
│ created_at      │          │
│ updated_at      │          │
└─────────────────┘          │
                             │
                             │ author_id (FK)
                             │
┌─────────────────────────┐  │
│      articles           │  │
├─────────────────────────┤  │
│ id (PK)                 │  │
│ title                   │  │
│ slug                    │  │
│ content (TEXT)          │  │
│ excerpt                 │  │
│ cover_image             │  │
│ published               │  │
│ published_at            │  │
│ author_id (FK) ─────────┼──┘
│ created_at              │
│ updated_at              │
└─────────────────────────┘


┌─────────────────────────┐         ┌───────────────────────┐
│       projects          │         │    project_members    │
├─────────────────────────┤         ├───────────────────────┤
│ id (PK)                 │◄────────┤ project_id (FK)       │
│ name                    │         │ member_id (FK) ───────┼──┐
│ slug                    │         │ role                  │  │
│ description             │         │ joined_at             │  │
│ status                  │         └───────────────────────┘  │
│ start_date              │                                    │
│ end_date                │                                    │
│ thumbnail               │                                    │
│ gallery (JSON[])        │                                    │
│ metadata (JSONB)        │                                    │
│ created_at              │         ┌───────────────────────┐  │
│ updated_at              │         │       members         │  │
└─────────────────────────┘         ├───────────────────────┤  │
                                    │ id (PK)               │◄─┘
                                    │ full_name             │
                                    │ role_title            │
                                    │ bio                   │
                                    │ profile_image         │
                                    │ linkedin_url          │
                                    │ github_url            │
                                    │ email                 │
                                    │ joined_at             │
                                    │ active                │
                                    │ created_at            │
                                    │ updated_at            │
                                    └───────────────────────┘


┌─────────────────────────┐
│       partners          │
├─────────────────────────┤
│ id (PK)                 │
│ name                    │
│ logo_url                │
│ website_url             │
│ description             │
│ tier                    │  (gold, silver, bronze)
│ active                  │
│ display_order           │
│ created_at              │
│ updated_at              │
└─────────────────────────┘


┌──────────────────────────────┐
│  recruitment_submissions     │
├──────────────────────────────┤
│ id (PK)                      │
│ full_name                    │
│ email                        │
│ phone                        │
│ study_field                  │
│ university                   │
│ year_of_study                │
│ skills (TEXT)                │
│ motivation (TEXT)            │
│ experience (TEXT)            │
│ availability                 │
│ status                       │  (pending, reviewed, accepted, rejected)
│ notes (TEXT)                 │  (admin notes)
│ submitted_at                 │
│ reviewed_at                  │
│ created_at                   │
│ updated_at                   │
└──────────────────────────────┘
```

## Prisma Schema

```prisma
// This is your Prisma schema file

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// =============================================
// USERS & AUTHENTICATION
// =============================================

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  passwordHash  String    @map("password_hash")
  role          UserRole  @default(ADMIN)
  
  // Relations
  articles      Article[]
  
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")
  
  @@map("users")
}

enum UserRole {
  ADMIN
  MEMBER
}

// =============================================
// ARTICLES & BLOG
// =============================================

model Article {
  id            String    @id @default(cuid())
  title         String
  slug          String    @unique
  content       String    @db.Text
  excerpt       String?
  coverImage    String?   @map("cover_image")
  published     Boolean   @default(false)
  publishedAt   DateTime? @map("published_at")
  
  // Relations
  authorId      String    @map("author_id")
  author        User      @relation(fields: [authorId], references: [id], onDelete: Cascade)
  
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")
  
  @@index([slug])
  @@index([published, publishedAt])
  @@index([authorId])
  @@map("articles")
}

// =============================================
// PROJECTS & ROCKETS
// =============================================

model Project {
  id            String          @id @default(cuid())
  name          String
  slug          String          @unique
  description   String          @db.Text
  status        ProjectStatus   @default(PLANNING)
  startDate     DateTime?       @map("start_date")
  endDate       DateTime?       @map("end_date")
  thumbnail     String?
  gallery       String[]        // Array of image URLs
  metadata      Json?           // Flexible JSON for technical specs
  
  // Relations
  members       ProjectMember[]
  
  createdAt     DateTime        @default(now()) @map("created_at")
  updatedAt     DateTime        @updatedAt @map("updated_at")
  
  @@index([slug])
  @@index([status])
  @@map("projects")
}

enum ProjectStatus {
  PLANNING
  IN_PROGRESS
  COMPLETED
  ON_HOLD
  CANCELLED
}

// =============================================
// MEMBERS & TEAM
// =============================================

model Member {
  id            String          @id @default(cuid())
  fullName      String          @map("full_name")
  roleTitle     String          @map("role_title")  // e.g., "Rocket Engineer", "Electronics Lead"
  bio           String?         @db.Text
  profileImage  String?         @map("profile_image")
  linkedinUrl   String?         @map("linkedin_url")
  githubUrl     String?         @map("github_url")
  email         String?
  joinedAt      DateTime        @default(now()) @map("joined_at")
  active        Boolean         @default(true)
  
  // Relations
  projects      ProjectMember[]
  
  createdAt     DateTime        @default(now()) @map("created_at")
  updatedAt     DateTime        @updatedAt @map("updated_at")
  
  @@index([active])
  @@map("members")
}

// Many-to-many relation between Projects and Members
model ProjectMember {
  projectId     String    @map("project_id")
  memberId      String    @map("member_id")
  role          String    // Role in this specific project (e.g., "Lead Engineer", "Tester")
  joinedAt      DateTime  @default(now()) @map("joined_at")
  
  project       Project   @relation(fields: [projectId], references: [id], onDelete: Cascade)
  member        Member    @relation(fields: [memberId], references: [id], onDelete: Cascade)
  
  @@id([projectId, memberId])
  @@map("project_members")
}

// =============================================
// PARTNERS & SPONSORS
// =============================================

model Partner {
  id            String        @id @default(cuid())
  name          String
  logoUrl       String        @map("logo_url")
  websiteUrl    String?       @map("website_url")
  description   String?       @db.Text
  tier          PartnerTier   @default(BRONZE)
  active        Boolean       @default(true)
  displayOrder  Int           @default(0) @map("display_order")  // For custom sorting
  
  createdAt     DateTime      @default(now()) @map("created_at")
  updatedAt     DateTime      @updatedAt @map("updated_at")
  
  @@index([active, displayOrder])
  @@map("partners")
}

enum PartnerTier {
  GOLD
  SILVER
  BRONZE
}

// =============================================
// RECRUITMENT
// =============================================

model RecruitmentSubmission {
  id            String              @id @default(cuid())
  fullName      String              @map("full_name")
  email         String
  phone         String?
  studyField    String              @map("study_field")
  university    String
  yearOfStudy   Int                 @map("year_of_study")
  skills        String              @db.Text  // Comma-separated or JSON
  motivation    String              @db.Text
  experience    String?             @db.Text
  availability  String              // e.g., "10 hours/week", "weekends only"
  status        RecruitmentStatus   @default(PENDING)
  notes         String?             @db.Text  // Admin notes
  
  submittedAt   DateTime            @default(now()) @map("submitted_at")
  reviewedAt    DateTime?           @map("reviewed_at")
  
  createdAt     DateTime            @default(now()) @map("created_at")
  updatedAt     DateTime            @updatedAt @map("updated_at")
  
  @@index([status])
  @@index([email])
  @@map("recruitment_submissions")
}

enum RecruitmentStatus {
  PENDING
  REVIEWED
  ACCEPTED
  REJECTED
}
```

## Indexy a Optimalizace

### Composite Indexes
```sql
-- Articles: rychlé vyhledávání publikovaných článků
CREATE INDEX idx_articles_published_date ON articles(published, published_at DESC);

-- Projects: filtrace podle statusu
CREATE INDEX idx_projects_status ON projects(status);

-- Members: aktivní členové
CREATE INDEX idx_members_active ON members(active);

-- Partners: zobrazování aktivních partnerů seřazených
CREATE INDEX idx_partners_display ON partners(active, display_order);

-- Recruitment: filtrování přihlášek podle statusu
CREATE INDEX idx_recruitment_status ON recruitment_submissions(status, submitted_at DESC);
```

### Full-Text Search
```sql
-- Full-text search pro články
CREATE INDEX idx_articles_fts ON articles 
USING GIN (to_tsvector('czech', title || ' ' || content));

-- Search query example:
-- SELECT * FROM articles 
-- WHERE to_tsvector('czech', title || ' ' || content) @@ to_tsquery('czech', 'raketa & telemetrie');
```

## Migrations

### Prisma Migration Commands
```bash
# Vytvoření nové migrace
npx prisma migrate dev --name init_schema

# Aplikace migrací v produkci
npx prisma migrate deploy

# Generování Prisma klienta
npx prisma generate

# Otevření Prisma Studia (GUI pro DB)
npx prisma studio
```

## Seed Data

### Example Seed Script
```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Vytvoření admin uživatele
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@czechrocketsociety.cz' },
    update: {},
    create: {
      email: 'admin@czechrocketsociety.cz',
      passwordHash: adminPassword,
      role: 'ADMIN',
    },
  });

  // Vytvoření ukázkového článku
  await prisma.article.create({
    data: {
      title: 'První úspěšný start rakety CRS-1',
      slug: 'prvni-uspesny-start-crs-1',
      content: 'Obsah článku...',
      excerpt: 'Historický moment pro český raketový spolek',
      published: true,
      publishedAt: new Date(),
      authorId: admin.id,
    },
  });

  // Vytvoření ukázkového projektu
  const project = await prisma.project.create({
    data: {
      name: 'CRS Rocket Alpha',
      slug: 'crs-rocket-alpha',
      description: 'První experimentální raketa spolku',
      status: 'IN_PROGRESS',
      startDate: new Date('2025-01-01'),
      metadata: {
        maxAltitude: '3000m',
        engineType: 'Solid fuel',
        weight: '12kg',
      },
    },
  });

  // Vytvoření člena
  const member = await prisma.member.create({
    data: {
      fullName: 'Jan Novák',
      roleTitle: 'Rocket Engineer',
      bio: 'Specialista na konstrukci raket',
      active: true,
    },
  });

  // Přidání člena do projektu
  await prisma.projectMember.create({
    data: {
      projectId: project.id,
      memberId: member.id,
      role: 'Lead Engineer',
    },
  });

  console.log('✅ Seed data vytvořena');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

### Spuštění seedu
```bash
npx prisma db seed
```

## Backup & Recovery

### Automatický backup (cron job)
```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/postgresql"
DB_NAME="crs_db"

# Vytvoření backupu
pg_dump -U postgres -d $DB_NAME -F c -f "$BACKUP_DIR/crs_db_$DATE.backup"

# Smazání backupů starších než 30 dní
find $BACKUP_DIR -name "*.backup" -mtime +30 -delete

echo "✅ Backup vytvořen: crs_db_$DATE.backup"
```

### Restore z backupu
```bash
pg_restore -U postgres -d crs_db -c /backups/postgresql/crs_db_20251208.backup
```

## Performance Considerations

### Connection Pooling
```typescript
// Prisma connection pool config
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  
  // Connection pool settings
  connection_limit = 10
  pool_timeout = 20
}
```

### Query Optimization
- Používat `.select()` pro partial queries
- Využívat `include` místo N+1 queries
- Cachovat časté dotazy (React Query)
- Používat pagination pro velké datasets

---

**Verze:** 1.0  
**Datum:** 8.12.2025  
**Autor:** Simon Cerman
