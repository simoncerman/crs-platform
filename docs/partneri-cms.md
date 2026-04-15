# Partneři - CMS Systém

Stránka Partneři je nyní plně integrována s CMS databází a umožňuje dynamickou správu partnerů napříč třemi úrovněmi: Diamond, Gold a Silver.

## Struktura

### Backend (API)

#### Databázové schéma
- **Soubor**: `/apps/api/src/db/schema.ts`
- **Tabulka**: `partners`
- **Enum**: `partner_tier` (diamond, gold, silver)

**Pole:**
- `id` - UUID (primární klíč)
- `name` - Název partnera
- `tier` - Úroveň partnerství (diamond/gold/silver)
- `logo` - URL loga
- `description` - Krátký popis (zobrazuje se u všech úrovní)
- `fullDescription` - Detailní popis (pouze u Diamond)
- `heroImage` - Velký hero obrázek (pouze u Diamond)
- `website` - URL webových stránek partnera
- `order` - Pořadí zobrazení
- `published` - Zda je partner publikovaný
- `createdAt` / `updatedAt` - Časové razítko

#### API Endpointy
- **Soubor**: `/apps/api/src/routes/partners.ts`

**Veřejné endpointy:**
- `GET /api/partners` - Vrací všechny publikované partnery seskupené podle úrovně

**Admin endpointy (vyžadují autentizaci):**
- `GET /api/partners/all` - Seznam všech partnerů
- `GET /api/partners/:id` - Detail partnera
- `POST /api/partners` - Vytvoření nového partnera
- `PUT /api/partners/:id` - Aktualizace partnera
- `DELETE /api/partners/:id` - Smazání partnera

### Frontend (Web)

#### Veřejná stránka
- **Soubor**: `/apps/web/app/partneri/page.tsx`
- **URL**: `/partneri`
- Zobrazuje publikované partnery ve třech sekcích
- Diamond partneři: Velký hero obrázek, logo overlay, plný popis
- Gold partneři: Mřížka karet s logem a popisem
- Silver partneři: Kompaktní mřížka s logem a názvem

## Seed Data

### Spuštění seedu
```bash
cd apps/api
pnpm db:seed:partners
```

### Testovací data
Seed script vytvoří:
- **2 Diamond partnery**: Česká kosmická agentura, TechSpace Industries
- **4 Gold partnery**: AeroTech Solutions, Propulsion Labs, DataSky Analytics, Composite Materials Co.
- **6 Silver partnerů**: Elektro Komponenty, Metal Works, CNC Precision, Safety Equipment Pro, Tools & Machinery, Laboratory Supplies

**Poznámka:** Seed používá placeholder obrázky z Unsplash. Pro produkci nahraďte skutečnými logy a obrázky partnerů.

## Správa partnerů

### Přidání nového partnera

#### Pomocí API
```bash
curl -X POST http://localhost:3001/api/partners \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "Název partnera",
    "tier": "gold",
    "logo": "/images/partners/logo.png",
    "description": "Krátký popis partnera",
    "website": "https://partner.cz",
    "order": 10,
    "published": true
  }'
```

### Přidání obrázků
Loga a hero obrázky partnerspatří do `/apps/web/public/images/partners/`:
```
/apps/web/public/images/partners/
  ├── logos/
  │   ├── partner-1-logo.png
  │   └── partner-2-logo.png
  └── heroes/
      ├── partner-1-hero.jpg
      └── partner-2-hero.jpg
```

Pak v databázi použijte relativní cesty:
- Logo: `/images/partners/logos/partner-1-logo.png`
- Hero: `/images/partners/heroes/partner-1-hero.jpg`

## Migrace

### Vygenerování migrace
```bash
cd apps/api
pnpm db:generate
```

### Aplikace migrace
```bash
cd apps/api
pnpm db:push
```

### Aktuální migrace
- `0002_white_sphinx.sql` - Přidává tabulku partners a enum partner_tier

## Doporučení pro úrovně partnerství

### Diamond (Hlavní strategičtí partneři)
- Nejvyšší úroveň sponzoringu
- Velký hero obrázek na pozadí (1920x1080px doporučeno)
- Logo v overlay (400x200px doporučeno)
- Plný popis zahrnující detaily spolupráce
- Prioritní umístění na stránce

### Gold (Významní partneři)
- Střední úroveň sponzoringu
- Logo (300x150px doporučeno)
- Krátký popis služeb/produktů
- Grid layout po 3 na řádek

### Silver (Podporující partneři)
- Základní úroveň sponzoringu
- Malé logo (200x100px doporučeno)
- Pouze název a logo
- Kompaktní grid layout po 4 na řádek

## TODO

- [ ] Vytvořit admin rozhraní pro správu partnerů v `/apps/web/app/admin/partners`
- [ ] Přidat upload obrázků přímo v admin rozhraní
- [ ] Implementovat drag-and-drop pro změnu pořadí partnerů
- [ ] Přidat autentizaci k admin endpointům
- [ ] Nahradit placeholder obrázky skutečnými logy partnerů
- [ ] Optimalizovat obrázky (WebP formát, lazy loading)
- [ ] Přidat rich text editor pro fullDescription u Diamond partnerů
