import { db, closeConnection } from './index';
import { partners } from './schema';

async function seedPartners() {
  console.log('🌱 Seeding partners...');

  const partnersData = [
    // Diamond Partners
    {
      name: 'Česká kosmická agentura',
      tier: 'diamond' as const,
      logo: 'https://images.unsplash.com/photo-1614732414444-096e5f1122d5?w=400&h=200&fit=crop',
      heroImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&h=1080&fit=crop',
      description: 'Náš strategický partner poskytující technickou podporu, financování a přístup k nejmodernějším technologiím. Spolupracujeme na vývoji nových raketových systémů a podílíme se na mezinárodních projektech.',
      fullDescription: 'Česká kosmická agentura je klíčovým partnerem Czech Rocket Society od samého začátku. Poskytuje nám nejen finanční podporu, ale také přístup k výzkumným zařízením, odborným konzultacím a mezinárodním kontaktům. Díky této spolupráci jsme schopni realizovat ambiciózní projekty, které posouvají českou kosmonautiku na světovou úroveň. Společně pracujeme na vývoji nových pohonných systémů, avioniky a telemetrických řešení. Naše partnerství zahrnuje i mentoring programy, kde experti z ČKA předávají cenné zkušenosti našim členům.',
      website: 'https://kosmicka-agentura.cz',
      order: 1,
      published: true,
    },
    {
      name: 'TechSpace Industries',
      tier: 'diamond' as const,
      logo: 'https://images.unsplash.com/photo-1599305445671-ac291c95aaa9?w=400&h=200&fit=crop',
      heroImage: 'https://images.unsplash.com/photo-1517976487492-5750f3195933?w=1920&h=1080&fit=crop',
      description: 'Technologický gigant poskytující komponenty a materiály pro aerospace průmysl. S TechSpace Industries sdílíme vizi budoucnosti vesmírných technologií a společně vyvíjíme inovativní řešení.',
      fullDescription: 'TechSpace Industries je globální lídr v oblasti aerospace technologií. Naše spolupráce začala v roce 2024 a od té doby nám poskytli přístup k nejmodernějším kompozitním materiálům, senzorům a řídicím systémům. Společně vyvíjíme nové konstrukce pro rakety s důrazem na udržitelnost a opětovnou použitelnost. TechSpace nám také zpřístupnil své testovací zařízení, kde můžeme provádět náročné zkoušky našich prototypů. Jejich expertní tým pravidelně konzultuje naše návrhy a pomáhá nám optimalizovat výkon našich raketových systémů.',
      website: 'https://techspace-industries.com',
      order: 2,
      published: true,
    },
    // Gold Partners
    {
      name: 'AeroTech Solutions',
      tier: 'gold' as const,
      logo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=300&h=150&fit=crop',
      description: 'Dodavatel pokročilých avionických systémů a řídicích jednotek pro naše raketové projekty.',
      website: 'https://aerotech-solutions.cz',
      order: 3,
      published: true,
    },
    {
      name: 'Propulsion Labs',
      tier: 'gold' as const,
      logo: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=300&h=150&fit=crop',
      description: 'Specialisté na raketové motory a pohonné systémy. Poskytují nám komponenty a odborné konzultace.',
      website: 'https://propulsion-labs.com',
      order: 4,
      published: true,
    },
    {
      name: 'DataSky Analytics',
      tier: 'gold' as const,
      logo: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=300&h=150&fit=crop',
      description: 'Poskytovatel softwarových řešení pro telemetrii, analýzu dat a vizualizaci výsledků testů.',
      website: 'https://datasky.io',
      order: 5,
      published: true,
    },
    {
      name: 'Composite Materials Co.',
      tier: 'gold' as const,
      logo: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=300&h=150&fit=crop',
      description: 'Dodavatel kompozitních materiálů pro konstrukci raketových těl a komponent.',
      website: 'https://composite-materials.eu',
      order: 6,
      published: true,
    },
    // Silver Partners
    {
      name: 'Elektro Komponenty s.r.o.',
      tier: 'silver' as const,
      logo: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=200&h=100&fit=crop',
      website: 'https://elektro-komponenty.cz',
      order: 7,
      published: true,
    },
    {
      name: 'Metal Works',
      tier: 'silver' as const,
      logo: 'https://images.unsplash.com/photo-1581092795360-fd1ca04f0952?w=200&h=100&fit=crop',
      website: 'https://metal-works.cz',
      order: 8,
      published: true,
    },
    {
      name: 'CNC Precision',
      tier: 'silver' as const,
      logo: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?w=200&h=100&fit=crop',
      website: 'https://cnc-precision.eu',
      order: 9,
      published: true,
    },
    {
      name: 'Safety Equipment Pro',
      tier: 'silver' as const,
      logo: 'https://images.unsplash.com/photo-1581093458791-9d42e06b4e36?w=200&h=100&fit=crop',
      website: 'https://safety-equipment.cz',
      order: 10,
      published: true,
    },
    {
      name: 'Tools & Machinery',
      tier: 'silver' as const,
      logo: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=200&h=100&fit=crop',
      website: 'https://tools-machinery.com',
      order: 11,
      published: true,
    },
    {
      name: 'Laboratory Supplies',
      tier: 'silver' as const,
      logo: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=200&h=100&fit=crop',
      website: 'https://lab-supplies.cz',
      order: 12,
      published: true,
    },
  ];

  try {
    await db.insert(partners).values(partnersData);
    console.log('✅ Partners seeded successfully!');
  } catch (error) {
    console.error('Error seeding partners:', error);
    throw error;
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedPartners()
    .then(async () => {
      console.log('✅ Seed completed!');
      await closeConnection();
      process.exit(0);
    })
    .catch(async (error) => {
      console.error('❌ Seed failed:', error);
      await closeConnection();
      process.exit(1);
    });
}

export { seedPartners };
