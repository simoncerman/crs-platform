import { db } from './index';
import { users, articles, events, members, projects, projectMembers, recruitmentSettings } from './schema';
import bcrypt from 'bcryptjs';

async function seed() {
  console.log('🌱 Seeding database...');

  try {
    // Cleanup existing data
    console.log('🧹 Cleaning up existing data...');
    await db.delete(projectMembers);
    await db.delete(projects);
    await db.delete(articles);
    await db.delete(events);
    await db.delete(members);
    await db.delete(users);
    await db.delete(recruitmentSettings);

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const [adminUser] = await db.insert(users).values({
      email: 'admin@crs.cz',
      passwordHash: hashedPassword,
      name: 'Admin User',
      role: 'admin',
    }).returning();

    console.log('✅ Created admin user:', adminUser.email);

    // Create editor user
    const editorPassword = await bcrypt.hash('editor123', 10);
    
    const [editorUser] = await db.insert(users).values({
      email: 'editor@crs.cz',
      passwordHash: editorPassword,
      name: 'Editor User',
      role: 'editor',
    }).returning();

    console.log('✅ Created editor user:', editorUser.email);

    // Create members
    const membersList = await db.insert(members).values([
      {
        name: 'Ondřej Procházka',
        email: 'ondrej@crs.cz',
        role: 'Lead Avionics Engineer',
        department: 'Avionics',
        bio: 'Specialista na palubní elektroniku a telemetrické systémy.',
        active: true,
      },
      {
        name: 'Martin Dvořák',
        email: 'martin@crs.cz',
        role: 'PR & Communications Manager',
        department: 'Marketing',
        bio: 'Zodpovědný za komunikaci s veřejností a správu obsahu webu.',
        active: true,
      },
      {
        name: 'Petra Svobodová',
        email: 'petra@crs.cz',
        role: 'Propulsion Engineer',
        department: 'Propulsion',
        bio: 'Expertka na raketové motory a palivové systémy.',
        active: true,
      },
      {
        name: 'Tomáš Novák',
        email: 'tomas@crs.cz',
        role: 'Structures Engineer',
        department: 'Structures',
        bio: 'Návrh a konstrukce raketových těl a nosných struktur.',
        active: true,
      },
    ]).returning();

    console.log(`✅ Created ${membersList.length} members`);

    // Create projects
    const projectsList = await db.insert(projects).values([
      {
        name: 'Aurora-1',
        slug: 'aurora-1',
        description: 'Naše vlajková loď. Experimentální raketa navržená pro dosažení hranice 3km s pokročilou telemetrií a návratovým systémem. Projekt Aurora-1 představuje vrchol našeho inženýrského úsilí, kde kombinujeme lehké kompozitní materiály s vlastním palubním počítačem a inovativním systémem vypouštění padáku.',
        category: 'Rakety',
        status: 'development',
        specs: {
          'Výška': '3.2m',
          'Průměr': '18cm',
          'Hmotnost': '18kg',
          'Cílová výška': '3000m',
          'Motor': 'Solid Fuel K-class',
        },
        published: true,
        isFeatured: true,
        coverImage: 'https://images.unsplash.com/photo-1516849841032-87cbac4d88f7?auto=format&fit=crop&q=80&w=1000',
      },
      {
        name: 'CRS-2 Advanced Platform',
        slug: 'crs-2-advanced-platform',
        description: 'Pokročilá platforma s telemetrií a real-time sledováním.',
        category: 'Rakety',
        status: 'development',
        specs: {
          'Výška': '3.2m',
          'Průměr': '18cm',
          'Cílová výška': '3000m',
        },
        published: true,
        coverImage: 'https://images.unsplash.com/photo-1517976487492-5750f3195933?auto=format&fit=crop&q=80&w=1000',
      },
      {
        name: 'Test Stand Alpha',
        slug: 'test-stand-alpha',
        description: 'Testovací stojan pro měření tahu raketových motorů.',
        category: 'Motory',
        status: 'testing',
        specs: {
          'Max. tah': '500N',
          'Přesnost': '±2N',
        },
        published: true,
        coverImage: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=1000',
      },
      {
        name: 'Phoenix Avionics',
        slug: 'phoenix-avionics',
        description: 'Vlastní palubní počítač s integrovaným GPS, akcelerometrem a barometrem.',
        category: 'Avionika',
        status: 'development',
        specs: {
          'Procesor': 'ESP32-S3',
          'Senzory': 'BMI270, BMP390',
          'Frekvence': '868 MHz',
        },
        published: true,
        coverImage: 'https://images.unsplash.com/photo-1518364538800-6bcb3c2af0ff?auto=format&fit=crop&q=80&w=1000',
      },
    ]).returning();

    console.log(`✅ Created ${projectsList.length} projects`);

    // Assign members to projects
    await db.insert(projectMembers).values([
      {
        projectId: projectsList[0].id,
        memberId: membersList[0].id,
        role: 'Lead Engineer',
      },
      {
        projectId: projectsList[0].id,
        memberId: membersList[3].id,
        role: 'Structures Lead',
      },
      {
        projectId: projectsList[1].id,
        memberId: membersList[0].id,
        role: 'Avionics Lead',
      },
      {
        projectId: projectsList[1].id,
        memberId: membersList[2].id,
        role: 'Propulsion Lead',
      },
      {
        projectId: projectsList[2].id,
        memberId: membersList[2].id,
        role: 'Test Engineer',
      },
    ]);

    console.log('✅ Assigned members to projects');

    // Create articles
    const articlesList = await db.insert(articles).values([
      {
        title: 'Úspěšný první start CRS-1',
        slug: 'uspesny-prvni-start-crs-1',
        excerpt: 'První testovací raketa Czech Rocket Society úspěšně dosáhla výšky 1500 metrů.',
        content: `# Historický okamžik pro CRS\n\nDne 15. června 2024 se uskutečnil první úspěšný start naší testovací rakety CRS-1. Raketa dosáhla plánované výšky 1500 metrů a všechny systémy fungovaly podle očekávání.\n\n## Technické detaily\n\n- **Výška:** 2.5m\n- **Průměr:** 15cm\n- **Hmotnost:** 12kg\n- **Dosažená výška:** 1523m\n\n## Co následuje\n\nTým nyní analyzuje telemetrická data a připravuje se na další starty. CRS-2 je již ve fázi vývoje s cílem dosáhnout výšky 3000 metrů.`,
        category: 'Starty',
        tags: ['raketa', 'úspěch', 'CRS-1'],
        status: 'published',
        published: true,
        publishedAt: new Date('2024-06-16'),
        authorId: adminUser.id,
        coverImage: 'https://images.unsplash.com/photo-1517976487492-5750f3195933?auto=format&fit=crop&q=80&w=1000',
      },
      {
        title: 'Nový telemetrický systém v testování',
        slug: 'novy-telemetricky-system-v-testovani',
        excerpt: 'Náš tým dokončil vývoj nového real-time telemetrického systému pro sledování raketových startů.',
        content: `# Pokročilá telemetrie\n\nVyvíjíme nový telemetrický systém, který umožní sledování raketových dat v reálném čase.\n\n## Hlavní vlastnosti\n\n- Real-time streaming dat\n- GPS tracking\n- Senzory teploty, tlaku a zrychlení\n- WebSocket API pro živé sledování\n\nSystém bude poprvé nasazen na raketu CRS-2.`,
        category: 'Technologie',
        tags: ['telemetrie', 'technologie', 'inovace'],
        status: 'published',
        published: true,
        publishedAt: new Date('2024-10-20'),
        authorId: editorUser.id,
        coverImage: 'https://images.unsplash.com/photo-1518364538800-6bcb3c2af0ff?auto=format&fit=crop&q=80&w=1000',
      },
      {
        title: 'Hledáme nové členy do týmu Avioniky!',
        slug: 'nabor-avionika-2025',
        excerpt: 'Zajímáš se o elektroniku, programování a vesmír? Přidej se k nám a pomoz nám stavět rakety.',
        content: `# Staň se součástí CRS\n\nDo našeho týmu Avioniky hledáme nadšené studenty, kteří se chtějí podílet na vývoji palubních počítačů a telemetrie.\n\n## Co nabízíme\n\n- Práce na reálných projektech\n- Přístup k moderním technologiím\n- Skvělý kolektiv\n- Možnost vidět svůj kód letět do oblak\n\nZájemci pište na náš email!`,
        category: 'Nábor',
        tags: ['nábor', 'avionika', 'tým'],
        status: 'published',
        published: true,
        publishedAt: new Date('2024-12-01'),
        authorId: adminUser.id,
        coverImage: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=1000',
      },
      {
        title: 'Workshop pro studenty - Jak funguje raketa',
        slug: 'workshop-pro-studenty',
        excerpt: 'Czech Rocket Society pořádá workshop pro studenty středních a vysokých škol.',
        content: `# Vzdělávací aktivita\n\nPlánujeme workshop pro studenty zaměřený na základy raketové technologie.\n\n## Program\n\n- Princip raketového pohonu\n- Palubní elektronika\n- Telemetrie a sledování\n- Praktická ukázka startu\n\nRegistrace bude otevřena v prosinci 2024.`,
        category: 'Vzdělávání',
        tags: ['workshop', 'studenti', 'vzdělávání'],
        status: 'draft',
        published: false,
        authorId: editorUser.id,
      },
      {
        title: 'Přípravy na Czech Rocket Challenge vrcholí',
        slug: 'pripravy-na-crc-vrcholi',
        excerpt: 'Náš tým intenzivně pracuje na přípravě zázemí pro největší raketovou soutěž v ČR.',
        content: `# Czech Rocket Challenge 2026\n\nLetošní ročník slibuje rekordní účast. Máme přihlášeno přes 20 týmů z celé Evropy.\n\n## Na co se těšit\n\n- Nová startovací rampa\n- Vylepšený systém pro měření apogea\n- Live stream z dronů\n\nSledujte nás pro další info!`,
        category: 'Události',
        tags: ['CRC', 'soutěž', 'přípravy'],
        status: 'published',
        published: true,
        publishedAt: new Date('2025-01-10'),
        authorId: adminUser.id,
        coverImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=1000',
      },
      {
        title: 'Nová partnerství pro rok 2025',
        slug: 'nova-partnerstvi-2025',
        excerpt: 'Czech Rocket Society navazuje spolupráci s předními technologickými firmami v oblasti aerospace.',
        content: `# Spolupráce s průmyslem\n\nJe nám ctí oznámit nová partnerství, která nám umožní přístup k pokročilým materiálům a výrobním technologiím.\n\n## Naši noví partneři\n\n- **AeroSpace Dynamics:** Podpora při vývoji kompozitních struktur\n- **TechSystems:** Dodávka senzorů pro telemetrii\n- **UniLab:** Přístup k testovacím komorám\n\nDěkujeme za podporu!`,
        category: 'Partnerství',
        tags: ['partnerství', 'aerospace', 'rozvoj'],
        status: 'published',
        published: true,
        publishedAt: new Date('2025-01-15'),
        authorId: editorUser.id,
        coverImage: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?auto=format&fit=crop&q=80&w=1000',
      },
    ]).returning();

    console.log(`✅ Created ${articlesList.length} articles`);

    // Create events
    const eventsList = await db.insert(events).values([
      {
        title: 'Aurora-1 | Experimental Rocket Launch',
        slug: 'aurora-1-experimental-rocket-launch',
        description: 'Aurora-1 je testovací start experimentální rakety vyvíjené studentským týmem v rámci výzkumu letové stability, telemetrie a návratových systémů. Cílem mise je ověření chování rakety v reálných podmínkách a sběr dat pro další generaci nosičů.\n\nUdálost zahrnuje přípravu na start, finální odpočet, samotný launch a následnou analýzu letu. Start je otevřený pozorovatelům a fanouškům kosmonautiky, kteří chtějí vidět, jak se z výkresu stává realita… a z reality ohnivý sloup 😎🔥',
        location: 'Letiště Brno',
        startDate: new Date('2026-05-14T09:00:00'),
        endDate: new Date('2026-05-14T17:00:00'),
        eventType: 'launch',
        published: true,
        coverImage: 'https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?auto=format&fit=crop&q=80&w=1000',
      },
      {
        title: 'Czech Rocket Challenge 2026',
        slug: 'czech-rocket-challenge-2026',
        description: 'Czech Rocket Challenge 2026 je mezinárodní studentská soutěž zaměřená na návrh, konstrukci a start experimentálních raket. Týmy z Česka i zahraničí se utkají v technických výzvách, preciznosti provedení a schopnosti posunout hranice studentské kosmonautiky.\n\nČekají vás starty raket, testování inovativních technologií, týmová spolupráce a pořádná dávka inženýrského adrenalinu. Pokud miluješ vesmír, techniku a vůni spáleného paliva, jsi na správném místě.',
        location: 'Moravská Třebová',
        startDate: new Date('2025-12-18T08:00:00'),
        endDate: new Date('2025-12-25T18:00:00'),
        eventType: 'event',
        published: true,
        coverImage: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&q=80&w=1000',
      },
      {
        title: 'Start rakety CRS-2',
        slug: 'start-rakety-crs-2',
        description: 'Plánovaný start druhé testovací rakety s cílem dosáhnout výšky 3000 metrů.',
        location: 'Testovací areál Milovice',
        startDate: new Date('2025-03-15T10:00:00'),
        endDate: new Date('2025-03-15T16:00:00'),
        eventType: 'launch',
        published: true,
      },
      {
        title: 'Workshop: Základy raketové technologie',
        slug: 'workshop-zaklady-raketove-technologie',
        description: 'Vzdělávací workshop pro studenty a zájemce o raketovou technologii.',
        location: 'ČVUT Praha',
        startDate: new Date('2025-02-10T14:00:00'),
        endDate: new Date('2025-02-10T18:00:00'),
        eventType: 'event',
        published: true,
      },
      {
        title: 'Náborový večer CRS',
        slug: 'naborovy-vecer-crs',
        description: 'Přijď se podívat, co děláme, a staň se součástí našeho týmu!',
        location: 'Klubovna CRS',
        startDate: new Date('2025-01-15T18:00:00'),
        endDate: new Date('2025-01-15T21:00:00'),
        eventType: 'recruitment',
        published: true,
      },
      {
        title: 'Statický zážeh motoru "Ignis"',
        slug: 'staticky-zazeh-ignis',
        description: 'První statický zážeh nového hybridního motoru Ignis.',
        location: 'Testovací polygon',
        startDate: new Date('2025-04-20T13:00:00'),
        endDate: new Date('2025-04-20T17:00:00'),
        eventType: 'test',
        published: true,
        coverImage: 'https://images.unsplash.com/photo-1457364887197-9150188c107b?auto=format&fit=crop&q=80&w=1000',
      },
    ]).returning();

    console.log(`✅ Created ${eventsList.length} events`);

    // Seed recruitment settings (roles & tasks)
    await db.insert(recruitmentSettings).values({
      isActive: true,
      roles: [
        { id: 'role-sw', name: 'Software vývojář', description: 'Vývoj palubního softwaru, telemetrie, webových aplikací a řídících systémů.' },
        { id: 'role-me', name: 'Strojní inženýr', description: 'Návrh a konstrukce raketových struktur, motorů a mechanických systémů.' },
        { id: 'role-ee', name: 'Elektrotechnický inženýr', description: 'Návrh elektroniky, avioniky, senzorických systémů a napájení.' },
        { id: 'role-ch', name: 'Chemik', description: 'Vývoj a testování raketových paliv, bezpečnostní analýzy.' },
        { id: 'role-pm', name: 'Projektový manažer', description: 'Koordinace týmů, plánování milníků, řízení rizik a komunikace se stakeholdery.' },
        { id: 'role-mk', name: 'Marketing a PR', description: 'Správa sociálních sítí, propagace spolku, organizace eventů a spolupráce s partnery.' },
        { id: 'role-gd', name: 'Grafický designér', description: 'Vizuální identita spolku, návrhy mission patches, propagačních materiálů a webového designu.' },
      ],
      tasks: [
        { id: 'task-sw-1', title: 'Algoritmus pro výpočet apogea', description: 'Navrhněte v pseudokódu nebo v jazyce dle výběru jednoduchý algoritmus, který na základě dat z akcelerometru a barometru dokáže odhadnout maximální výšku letu rakety.', timeEstimate: '15–30 minut', roles: ['role-sw'] },
        { id: 'task-sw-2', title: 'Návrh datové struktury pro telemetrii', description: 'Navrhněte JSON strukturu pro ukládání telemetrických dat z rakety (GPS, akcelerometr, gyroskop, teplota, tlak). Zdůvodněte vaše designové rozhodnutí.', timeEstimate: '15–20 minut', roles: ['role-sw'] },
        { id: 'task-me-1', title: 'Analýza stability rakety', description: 'Popište základní principy stability rakety. Jak byste zjistili, zda je raketa stabilní? Co je to těžiště a střed tlaku a jak spolu souvisí?', timeEstimate: '15–25 minut', roles: ['role-me'] },
        { id: 'task-me-2', title: 'Návrh připevnění padáku', description: 'Navrhněte způsob, jak bezpečně připevnit padák k tělu rakety. Jaké síly na něj působí při otevření? Jak byste tento systém testovali?', timeEstimate: '20–30 minut', roles: ['role-me'] },
        { id: 'task-ee-1', title: 'Návrh systému pro měření výšky', description: 'Navrhněte jednoduchý elektronický systém pro měření výšky letu rakety. Jaké senzory byste použili? Jak by vypadalo blokové schéma?', timeEstimate: '15–25 minut', roles: ['role-ee'] },
        { id: 'task-ee-2', title: 'Návrh napájení palubního počítače', description: 'Palubní počítač potřebuje 5V a 3.3V napětí, odebírá max 500mA. Máte k dispozici LiPo baterii (7.4V). Navrhněte napájecí obvod.', timeEstimate: '20–30 minut', roles: ['role-ee'] },
        { id: 'task-ch-1', title: 'Složení raketového paliva', description: 'Popište základní typy raketových paliv (pevné, kapalné). Jaké jsou jejich výhody a nevýhody? Uveďte příklady složení.', timeEstimate: '20–30 minut', roles: ['role-ch'] },
        { id: 'task-pm-1', title: 'Plán projektu rakety', description: 'Vytvořte základní časový plán pro vývoj a stavbu experimentální rakety (6 měsíců). Identifikujte klíčové milníky a rizika.', timeEstimate: '20–30 minut', roles: ['role-pm'] },
        { id: 'task-mk-1', title: 'Kampaň pro nábor členů', description: 'Navrhněte marketingovou kampaň pro získání nových členů na vaší univerzitě. Jaké kanály byste použili? Jak byste měřili úspěch?', timeEstimate: '20–30 minut', roles: ['role-mk'] },
        { id: 'task-gd-1', title: 'Design mission patch', description: 'Popište nebo načrtněte návrh patch/nálepky pro konkrétní raketovou misi. Jaké prvky by měl obsahovat? Jaké barvy a styly použít?', timeEstimate: '20–30 minut', roles: ['role-gd'] },
        { id: 'task-gen-1', title: 'Vaše motivace a projekt', description: 'Popište vlastní projekt nebo nápad související s raketovou technikou/vesmírem, na kterém byste chtěli pracovat v rámci CRS. Co by bylo potřeba k jeho realizaci?', timeEstimate: '15–30 minut', roles: [] },
      ],
    });

    console.log('✅ Created recruitment settings (7 roles, 11 tasks)');

    console.log('\n🎉 Seed completed successfully!');
    console.log('\n📝 Login credentials:');
    console.log('Admin: admin@crs.cz / admin123');
    console.log('Editor: editor@crs.cz / editor123');

  } catch (error) {
    console.error('❌ Seed failed:', error);
    throw error;
  }
}

seed()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    const { client } = await import('./index');
    await client.end();
  });
