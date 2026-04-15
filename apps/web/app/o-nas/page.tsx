import Link from 'next/link';
import { getMembers, API_URL } from '@/lib/api';
import { ScrollReveal, TimelineItem, HeroParallax } from './ONasClient';
import { PageTransition } from '../components/PageTransition';

export const metadata = {
  title: 'O nás | Czech Rocket Society',
  description: 'Jsme komunita studentů a nadšenců do raketové techniky, vesmíru a vědy. Náš cíl je propojit lidi se zájmem o rakety a podporovat edukaci v oblasti raketové techniky.',
};

export default async function AboutPage() {
  let boardMembers: Awaited<ReturnType<typeof getMembers>> = [];
  try {
    boardMembers = await getMembers({ active: true, tag: 'Správní rada' });
  } catch {
    // API nedostupné — sekce se zobrazí bez členů
  }
  return (
    <PageTransition className="min-h-screen bg-deep-space">
      {/* Hero sekce */}
      <section className="relative pt-32 pb-16 overflow-hidden min-h-[85vh] flex items-center">
        {/* Team photo background - full width */}
        <div className="absolute inset-0">
          <img
            src="/images/usedOnWeb/team.jpg"
            alt="Czech Rocket Society - náš tým"
            className="w-full h-full object-cover"
          />
          {/* Dark overlay for text readability - lighter to show more photo */}
          <div className="absolute inset-0 bg-gradient-to-b from-deep-space/75 via-deep-space/60 to-deep-space/80" />
          <div className="absolute inset-0 bg-gradient-to-r from-deep-space/70 via-deep-space/30 to-deep-space/70" />
        </div>

        {/* Background decoration */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-aurora-cyan/40 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-crs-ignition/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <HeroParallax>
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-block mb-6 px-6 py-2 rounded-full bg-aurora-cyan/10 border border-aurora-cyan/30 backdrop-blur-sm">
              <span className="text-aurora-cyan font-bold">Czech Rocket Society</span>
            </div>
            <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-stellar-white mb-6 leading-tight">
              Stavíme budoucnost
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-aurora-cyan via-crs-ignition to-aurora-cyan">
                českého kosmonautiky
              </span>
            </h1>
            <p className="text-lg md:text-xl text-stellar-white/95 leading-relaxed max-w-3xl mx-auto mb-12 backdrop-blur-sm bg-deep-space/30 p-6 rounded-2xl border border-stellar-white/10">
              Jsme komunita studentů, inženýrů a nadšenců, kteří spojují vášeň pro raketovou techniku s touhou posunout Českou republiku mezi přední kosmické národy.
            </p>
            
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                href="/nabor"
                className="group relative px-6 py-3 sm:px-10 sm:py-5 rounded-2xl bg-gradient-to-r from-crs-ignition to-aurora-cyan text-deep-space font-bold text-lg overflow-hidden transition-all hover:shadow-[0_0_40px_rgba(243,182,0,0.6)] hover:scale-[1.02]"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Připoj se k nám
                  <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-aurora-cyan to-crs-ignition opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
              <Link 
                href="/projekty"
                className="px-6 py-3 sm:px-10 sm:py-5 rounded-2xl border-2 border-stellar-white/50 bg-stellar-white/10 backdrop-blur-sm text-stellar-white font-bold text-lg hover:bg-stellar-white/20 hover:border-stellar-white/70 transition-all"
              >
                Naše projekty
              </Link>
            </div>

            {/* Team badge */}
            <div className="mt-16 inline-flex items-center gap-3 px-6 py-3 rounded-full bg-deep-space/60 backdrop-blur-md border border-aurora-cyan/30">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-aurora-cyan to-cosmic-blue border-2 border-deep-space" />
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-crs-ignition to-aurora-cyan border-2 border-deep-space" />
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 border-2 border-deep-space" />
              </div>
              <span className="text-stellar-white/90 font-medium text-sm">
                <span className="text-aurora-cyan font-bold">50+</span> aktivních členů z celé ČR
              </span>
            </div>
          </div>
          </HeroParallax>
        </div>
      </section>

      {/* Mise & Vize - Redesigned */}
      <section className="py-20 relative bg-gradient-to-b from-deep-space via-cosmic-blue/5 to-deep-space overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 right-1/4 w-[600px] h-[600px] bg-aurora-cyan/40 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 left-1/4 w-[600px] h-[600px] bg-crs-ignition/30 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto">
            {/* Mise */}
            <ScrollReveal className="mb-20">
              <div className="grid lg:grid-cols-2 gap-16 items-center">
                {/* Icon side */}
                <div className="relative order-2 lg:order-1">
                  <div className="relative flex justify-end">
                    {/* Large decorative number */}
                    <div className="absolute -top-20 -left-0 text-[240px] font-black text-aurora-cyan/5 leading-none select-none">
                      01
                    </div>
                    {/* Animated icon container */}
                    <div className="relative z-10 w-64 h-64">
                      <div className="absolute inset-0 bg-gradient-to-br from-aurora-cyan/20 to-cosmic-blue/20 rounded-[4rem] rotate-6 animate-pulse" />
                      <div className="absolute inset-0 bg-gradient-to-br from-cosmic-blue/20 to-aurora-cyan/20 rounded-[4rem] -rotate-6 animate-pulse" style={{ animationDelay: '0.5s' }} />
                      <div className="absolute inset-0 backdrop-blur-sm bg-deep-space/40 border-2 border-aurora-cyan/30 rounded-[4rem] flex items-center justify-center">
                        <svg className="w-32 h-32 text-aurora-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content side */}
                <div className="order-1 lg:order-2">
                  <div className="inline-block mb-4 px-4 py-2 rounded-full bg-aurora-cyan/10 border border-aurora-cyan/30">
                    <span className="text-aurora-cyan text-sm font-bold uppercase tracking-wider">Mise</span>
                  </div>
                  <h2 className="font-heading text-3xl sm:text-5xl md:text-6xl font-bold text-stellar-white mb-8 leading-tight">
                    Naše mise
                  </h2>
                  <div className="space-y-6 text-lg text-stellar-white/90 leading-relaxed">
                    <p>
                      Naším cílem je <span className="text-aurora-cyan font-bold">propojit lidi se zájmem o rakety</span> a podporovat edukaci v oblasti 
                      raketové techniky. Věříme, že vesmír není jen pro velké agentury, ale pro každého, 
                      kdo má zvědavou mysl a touhu objevovat.
                    </p>
                    <p>
                      Vytváříme prostředí, kde mohou <span className="text-aurora-cyan font-bold">studenti a nadšenci získat praktické zkušenosti</span> s návrhem, 
                      stavbou a testováním raket. Organizujeme workshopy, přednášky a společné projekty, 
                      které posouvají české raketové nadšence dopředu.
                    </p>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* Vize */}
            <ScrollReveal>
              <div className="grid lg:grid-cols-2 gap-16 items-center">
                {/* Content side */}
                <div>
                  <div className="inline-block mb-4 px-4 py-2 rounded-full bg-crs-ignition/10 border border-crs-ignition/30">
                    <span className="text-crs-ignition text-sm font-bold uppercase tracking-wider">Vize</span>
                  </div>
                  <h2 className="font-heading text-3xl sm:text-5xl md:text-6xl font-bold text-stellar-white mb-8 leading-tight">
                    Naše vize
                  </h2>
                  <div className="space-y-6 text-lg text-stellar-white/90 leading-relaxed">
                    <p>
                      Představujeme si budoucnost, kde <span className="text-crs-ignition font-bold">Česká republika hraje důležitou roli</span> v evropském 
                      i světovém rakeťáctví. Chceme inspirovat novou generaci inženýrů, vědců a 
                      průkopníků, kteří posunou hranice lidského poznání.
                    </p>
                    <p>
                      Naše vize zahrnuje vytvoření <span className="text-crs-ignition font-bold">komplexního ekosystému pro výzkum a vývoj</span> raketové 
                      techniky v ČR, propojení akademického světa s průmyslem a zapojení České republiky 
                      do mezinárodních vesmírných misí.
                    </p>
                  </div>
                </div>

                {/* Icon side */}
                <div className="relative">
                  <div className="relative">
                    {/* Large decorative number */}
                    <div className="absolute -top-16 -right-8 text-[240px] font-black text-crs-ignition/5 leading-none select-none">
                      02
                    </div>
                    {/* Animated icon container */}
                    <div className="relative z-10 w-64 h-64 mx-auto lg:mx-0">
                      <div className="absolute inset-0 bg-gradient-to-br from-crs-ignition/20 to-aurora-cyan/20 rounded-[4rem] rotate-6 animate-pulse" />
                      <div className="absolute inset-0 bg-gradient-to-br from-aurora-cyan/20 to-crs-ignition/20 rounded-[4rem] -rotate-6 animate-pulse" style={{ animationDelay: '0.5s' }} />
                      <div className="absolute inset-0 backdrop-blur-sm bg-deep-space/40 border-2 border-crs-ignition/30 rounded-[4rem] flex items-center justify-center">
                        <svg className="w-32 h-32 text-crs-ignition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Úspěchy */}
      <section className="py-16 relative bg-gradient-to-b from-deep-space to-cosmic-black">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="font-heading text-3xl font-bold text-stellar-white sm:text-5xl lg:text-6xl mb-6">
                Naše úspěchy
              </h2>
              <div className="w-16 h-1 bg-gradient-to-r from-aurora-cyan to-crs-ignition rounded-full mx-auto mb-4" />
              <p className="text-xl text-stellar-white/80 max-w-2xl mx-auto">
                Klíčové milníky na naší cestě k hvězdám
              </p>
            </div>
            </ScrollReveal>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {/* Úspěšné starty */}
              <div className="relative overflow-hidden rounded-2xl border-2 border-cosmic-blue/30 bg-gradient-to-br from-deep-space to-cosmic-blue/20 backdrop-blur-sm p-8 text-center group hover:border-crs-ignition transition-all hover:shadow-[0_0_30px_rgba(243,182,0,0.3)]">
                <div className="absolute top-6 right-6 opacity-20 group-hover:opacity-40 transition-opacity">
                  <svg className="w-20 h-20 text-crs-ignition" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2L12 8M12 2L9 5M12 2L15 5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M8 22h8M10 18h4M9 14h6" strokeLinecap="round" />
                    <path d="M6 14L8 18L10 22" opacity="0.5" />
                    <path d="M18 14L16 18L14 22" opacity="0.5" />
                  </svg>
                </div>
                <div className="relative z-10">
                  <div className="text-4xl sm:text-6xl font-bold text-crs-ignition mb-2 font-heading">15+</div>
                  <div className="text-stellar-white/90 font-medium">Úspěšných startů</div>
                </div>
              </div>

              {/* Maximální výška */}
              <div className="relative overflow-hidden rounded-2xl border-2 border-cosmic-blue/30 bg-gradient-to-br from-deep-space to-cosmic-blue/20 backdrop-blur-sm p-8 text-center group hover:border-aurora-cyan transition-all hover:shadow-[0_0_30px_rgba(80,200,255,0.3)]">
                <div className="absolute top-6 right-6 opacity-20 group-hover:opacity-40 transition-opacity">
                  <svg className="w-20 h-20 text-aurora-cyan" viewBox="0 0 24 24" fill="currentColor">
                    <ellipse cx="8" cy="6" rx="3" ry="2" opacity="0.7" />
                    <ellipse cx="12" cy="5" rx="4" ry="2.5" opacity="0.8" />
                    <ellipse cx="16" cy="6" rx="3" ry="2" opacity="0.7" />
                    <ellipse cx="10" cy="12" rx="3.5" ry="2" opacity="0.6" />
                    <ellipse cx="14" cy="12" rx="3.5" ry="2" opacity="0.6" />
                  </svg>
                </div>
                <div className="relative z-10">
                  <div className="text-4xl sm:text-6xl font-bold text-aurora-cyan mb-2 font-heading">3km</div>
                  <div className="text-stellar-white/90 font-medium">Maximální výška</div>
                </div>
              </div>

              {/* Aktivní členové */}
              <div className="relative overflow-hidden rounded-2xl border-2 border-cosmic-blue/30 bg-gradient-to-br from-deep-space to-cosmic-blue/20 backdrop-blur-sm p-8 text-center group hover:border-purple-500 transition-all hover:shadow-[0_0_30px_rgba(168,85,247,0.3)]">
                <div className="absolute top-6 right-6 opacity-20 group-hover:opacity-40 transition-opacity">
                  <svg className="w-20 h-20 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="8" r="3" />
                    <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
                    <circle cx="6" cy="10" r="2" opacity="0.7" />
                    <circle cx="18" cy="10" r="2" opacity="0.7" />
                  </svg>
                </div>
                <div className="relative z-10">
                  <div className="text-4xl sm:text-6xl font-bold text-purple-400 mb-2 font-heading">50+</div>
                  <div className="text-stellar-white/90 font-medium">Aktivních členů</div>
                </div>
              </div>

              {/* Let zkušeností */}
              <div className="relative overflow-hidden rounded-2xl border-2 border-cosmic-blue/30 bg-gradient-to-br from-deep-space to-cosmic-blue/20 backdrop-blur-sm p-8 text-center group hover:border-green-500 transition-all hover:shadow-[0_0_30px_rgba(34,197,94,0.3)]">
                <div className="absolute top-6 right-6 opacity-20 group-hover:opacity-40 transition-opacity">
                  <svg className="w-20 h-20 text-green-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 6v6l4 2" strokeLinecap="round" />
                  </svg>
                </div>
                <div className="relative z-10">
                  <div className="text-4xl sm:text-6xl font-bold text-green-400 mb-2 font-heading">8+</div>
                  <div className="text-stellar-white/90 font-medium">Let zkušeností</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Objevte více - Rozcestník */}
      <section className="py-16 relative bg-gradient-to-b from-cosmic-black to-deep-space overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-aurora-cyan/30 rounded-full blur-3xl" />
          <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-crs-ignition/20 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-6xl mx-auto">
            <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="font-heading text-3xl font-bold text-stellar-white sm:text-5xl lg:text-6xl mb-6">
                Objevte více
              </h2>
              <div className="w-16 h-1 bg-gradient-to-r from-aurora-cyan to-crs-ignition rounded-full mx-auto mb-4" />
              <p className="text-xl text-stellar-white/80 max-w-2xl mx-auto">
                Poznejte náš tým, projekty a události
              </p>
            </div>
            </ScrollReveal>

            <div className="grid md:grid-cols-3 gap-8">
              {/* Tým */}
              <Link href="/clenove" className="group relative overflow-hidden rounded-2xl">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-300" />
                <div className="relative bg-deep-space/90 backdrop-blur-sm border border-cosmic-blue/20 rounded-2xl p-8 hover:border-purple-500/50 transition-all h-full flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <svg className="w-8 h-8 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-stellar-white mb-3">Tým</h3>
                  <p className="text-stellar-white/70 leading-relaxed mb-6">
                    Poznejte lidi za českým raketovým programem
                  </p>
                  <span className="mt-auto inline-flex items-center gap-2 text-purple-400 font-semibold group-hover:gap-3 transition-all">
                    Zobrazit členy
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </div>
              </Link>

              {/* Projekty */}
              <Link href="/projekty" className="group relative overflow-hidden rounded-2xl">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-crs-ignition to-aurora-cyan rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-300" />
                <div className="relative bg-deep-space/90 backdrop-blur-sm border border-cosmic-blue/20 rounded-2xl p-8 hover:border-crs-ignition/50 transition-all h-full flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-crs-ignition/20 to-aurora-cyan/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <svg className="w-8 h-8 text-crs-ignition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-stellar-white mb-3">Projekty</h3>
                  <p className="text-stellar-white/70 leading-relaxed mb-6">
                    Přehled raketových projektů a jejich vývoje
                  </p>
                  <span className="mt-auto inline-flex items-center gap-2 text-crs-ignition font-semibold group-hover:gap-3 transition-all">
                    Zobrazit projekty
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </div>
              </Link>

              {/* Události */}
              <Link href="/udalosti" className="group relative overflow-hidden rounded-2xl">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-aurora-cyan to-cosmic-blue rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-300" />
                <div className="relative bg-deep-space/90 backdrop-blur-sm border border-cosmic-blue/20 rounded-2xl p-8 hover:border-aurora-cyan/50 transition-all h-full flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-aurora-cyan/20 to-cosmic-blue/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <svg className="w-8 h-8 text-aurora-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-stellar-white mb-3">Události</h3>
                  <p className="text-stellar-white/70 leading-relaxed mb-6">
                    Nadcházející a proběhlé akce a testy
                  </p>
                  <span className="mt-auto inline-flex items-center gap-2 text-aurora-cyan font-semibold group-hover:gap-3 transition-all">
                    Zobrazit události
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Co děláme */}
      <section className="py-16 relative bg-gradient-to-b from-cosmic-black to-deep-space">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="font-heading text-3xl sm:text-5xl font-bold text-stellar-white mb-6">
                Co děláme
              </h2>
              <div className="w-16 h-1 bg-gradient-to-r from-aurora-cyan to-crs-ignition rounded-full mx-auto mb-4" />
              <p className="text-xl text-stellar-white/80 max-w-2xl mx-auto">
                Od návrhu po start - komplexní přístup k raketové technice
              </p>
            </div>
            </ScrollReveal>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Výzkum & Vývoj */}
              <div className="relative group overflow-hidden rounded-2xl">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-aurora-cyan to-cosmic-blue rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-300" />
                <div className="relative bg-deep-space/90 backdrop-blur-sm border border-cosmic-blue/20 rounded-2xl p-8 hover:border-aurora-cyan/50 transition-all h-full overflow-hidden">
                  {/* Background image with fade effect */}
                  <div 
                    className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity rounded-2xl"
                    style={{
                      backgroundImage: `linear-gradient(to right, rgba(10,14,39,1) 0%, rgba(10,14,39,0.9) 20%, rgba(10,14,39,0.3) 40%, rgba(10,14,39,0) 60%), url("https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=600&h=600&fit=crop")`,
                      backgroundPosition: 'center',
                      backgroundSize: 'cover',
                    }}
                  />
                  <div className="relative z-10">
                    <div className="w-14 h-14 bg-gradient-to-br from-aurora-cyan/20 to-cosmic-blue/20 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                      <svg className="w-7 h-7 text-aurora-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-stellar-white mb-3">Výzkum & Vývoj</h3>
                    <p className="text-stellar-white/80 leading-relaxed mb-4">
                      Pracujeme na inovativních raketových projektech, testujeme nové technologie a postupy. Od návrhu vlastních motorů po avioniku a telemetrii.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-aurora-cyan/10 border border-aurora-cyan/30 rounded-full text-aurora-cyan text-sm">Motory</span>
                      <span className="px-3 py-1 bg-aurora-cyan/10 border border-aurora-cyan/30 rounded-full text-aurora-cyan text-sm">Avionika</span>
                      <span className="px-3 py-1 bg-aurora-cyan/10 border border-aurora-cyan/30 rounded-full text-aurora-cyan text-sm">Telemetrie</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Edukace */}
              <div className="relative group overflow-hidden rounded-2xl">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-crs-ignition to-aurora-cyan rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-300" />
                <div className="relative bg-deep-space/90 backdrop-blur-sm border border-cosmic-blue/20 rounded-2xl p-8 hover:border-crs-ignition/50 transition-all h-full overflow-hidden">
                  {/* Background image with fade effect */}
                  <div 
                    className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity rounded-2xl"
                    style={{
                      backgroundImage: `linear-gradient(to right, rgba(10,14,39,1) 0%, rgba(10,14,39,0.9) 20%, rgba(10,14,39,0.3) 40%, rgba(10,14,39,0) 60%), url("https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=600&fit=crop")`,
                      backgroundPosition: 'center',
                      backgroundSize: 'cover',
                    }}
                  />
                  <div className="relative z-10">
                    <div className="w-14 h-14 bg-gradient-to-br from-crs-ignition/20 to-aurora-cyan/20 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                      <svg className="w-7 h-7 text-crs-ignition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-stellar-white mb-3">Edukace</h3>
                    <p className="text-stellar-white/80 leading-relaxed mb-4">
                      Pořádáme workshopy, přednášky a kurzy pro všechny, kdo se chtějí naučit o raketách a vesmíru. Předáváme znalosti a inspirujeme novou generaci.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-crs-ignition/10 border border-crs-ignition/30 rounded-full text-crs-ignition text-sm">Workshopy</span>
                      <span className="px-3 py-1 bg-crs-ignition/10 border border-crs-ignition/30 rounded-full text-crs-ignition text-sm">Přednášky</span>
                      <span className="px-3 py-1 bg-crs-ignition/10 border border-crs-ignition/30 rounded-full text-crs-ignition text-sm">Kurzy</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Komunita */}
              <div className="relative group overflow-hidden rounded-2xl">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-300" />
                <div className="relative bg-deep-space/90 backdrop-blur-sm border border-cosmic-blue/20 rounded-2xl p-8 hover:border-purple-500/50 transition-all h-full overflow-hidden">
                  {/* Background image with fade effect */}
                  <div 
                    className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity rounded-2xl"
                    style={{
                      backgroundImage: `linear-gradient(to right, rgba(10,14,39,1) 0%, rgba(10,14,39,0.9) 20%, rgba(10,14,39,0.3) 40%, rgba(10,14,39,0) 60%), url("https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=600&fit=crop")`,
                      backgroundPosition: 'center',
                      backgroundSize: 'cover',
                    }}
                  />
                  <div className="relative z-10">
                    <div className="w-14 h-14 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                      <svg className="w-7 h-7 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-stellar-white mb-3">Komunita</h3>
                    <p className="text-stellar-white/80 leading-relaxed mb-4">
                      Propojujeme nadšence, studenty a profesionály z celé České republiky. Sdílíme zkušenosti, podporujeme se a společně rosteme.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-purple-500/10 border border-purple-500/30 rounded-full text-purple-400 text-sm">Networking</span>
                      <span className="px-3 py-1 bg-purple-500/10 border border-purple-500/30 rounded-full text-purple-400 text-sm">Meetupy</span>
                      <span className="px-3 py-1 bg-purple-500/10 border border-purple-500/30 rounded-full text-purple-400 text-sm">Spolupráce</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Soutěže */}
              <div className="relative group overflow-hidden rounded-2xl">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-300" />
                <div className="relative bg-deep-space/90 backdrop-blur-sm border border-cosmic-blue/20 rounded-2xl p-8 hover:border-green-500/50 transition-all h-full overflow-hidden">
                  {/* Background image with fade effect */}
                  <div 
                    className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity rounded-2xl"
                    style={{
                      backgroundImage: `linear-gradient(to right, rgba(10,14,39,1) 0%, rgba(10,14,39,0.9) 20%, rgba(10,14,39,0.3) 40%, rgba(10,14,39,0) 60%), url("https://images.unsplash.com/photo-1569163139394-de4798aa62b3?w=600&h=600&fit=crop")`,
                      backgroundPosition: 'center',
                      backgroundSize: 'cover',
                    }}
                  />
                  <div className="relative z-10">
                    <div className="w-14 h-14 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                      <svg className="w-7 h-7 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-stellar-white mb-3">Soutěže</h3>
                    <p className="text-stellar-white/80 leading-relaxed mb-4">
                      Účastníme se mezinárodních i lokálních soutěží a reprezentujeme Českou republiku. Měříme své síly s nejlepšími týmy.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-green-500/10 border border-green-500/30 rounded-full text-green-400 text-sm">EuRoC</span>
                      <span className="px-3 py-1 bg-green-500/10 border border-green-500/30 rounded-full text-green-400 text-sm">CRAS</span>
                      <span className="px-3 py-1 bg-green-500/10 border border-green-500/30 rounded-full text-green-400 text-sm">Spaceport</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Historie - Timeline */}
      <section className="py-16 relative bg-gradient-to-b from-deep-space via-cosmic-blue/5 to-deep-space overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-10 w-72 h-72 bg-aurora-cyan/40 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-10 w-72 h-72 bg-crs-ignition/30 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto">
            <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="font-heading text-3xl sm:text-5xl font-bold text-stellar-white mb-6">
                Naše historie
              </h2>
              <div className="w-16 h-1 bg-gradient-to-r from-aurora-cyan to-crs-ignition rounded-full mx-auto mb-4" />
              <p className="text-xl text-stellar-white/80">
                Od vize k realitě - cesta Czech Rocket Society
              </p>
            </div>
            </ScrollReveal>

            {/* Timeline */}
            <div className="relative">
              {/* Vertical line with animation */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-aurora-cyan/20 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-aurora-cyan to-transparent animate-[slideDown_3s_ease-in-out_infinite]" />
              </div>

              {/* Timeline items */}
              <div className="space-y-12">
                {/* 2023 */}
                <TimelineItem index={0}>
                <div className="relative pl-20">
                  <div className="absolute left-4 top-2 w-8 h-8 rounded-full bg-aurora-cyan shadow-[0_0_20px_rgba(80,200,255,0.6)] flex items-center justify-center border-4 border-deep-space">
                    <div className="w-3 h-3 rounded-full bg-stellar-white" />
                  </div>
                  <div className="bg-deep-space/60 backdrop-blur-sm border-2 border-aurora-cyan/30 rounded-2xl p-6 hover:border-aurora-cyan/60 transition-all group">
                    <div className="flex items-center gap-4 mb-3">
                      <span className="text-3xl font-bold text-aurora-cyan font-heading">2023</span>
                      <div className="h-px flex-1 bg-gradient-to-r from-aurora-cyan/50 to-transparent" />
                    </div>
                    <h3 className="text-2xl font-bold text-stellar-white mb-3">Založení společnosti</h3>
                    <p className="text-stellar-white/80 leading-relaxed">
                      Czech Rocket Society byla založena skupinou studentů z Univerzity Hradec Králové s vizí propojit českou raketovou komunitu.
                    </p>
                  </div>
                </div>
                </TimelineItem>

                {/* 2024 */}
                <TimelineItem index={1}>
                <div className="relative pl-20">
                  <div className="absolute left-4 top-2 w-8 h-8 rounded-full bg-aurora-cyan shadow-[0_0_20px_rgba(80,200,255,0.6)] flex items-center justify-center border-4 border-deep-space">
                    <div className="w-3 h-3 rounded-full bg-stellar-white" />
                  </div>
                  <div className="bg-deep-space/60 backdrop-blur-sm border-2 border-aurora-cyan/30 rounded-2xl p-6 hover:border-aurora-cyan/60 transition-all group">
                    <div className="flex items-center gap-4 mb-3">
                      <span className="text-3xl font-bold text-aurora-cyan font-heading">2024</span>
                      <div className="h-px flex-1 bg-gradient-to-r from-aurora-cyan/50 to-transparent" />
                    </div>
                    <h3 className="text-2xl font-bold text-stellar-white mb-3">První projekty</h3>
                    <p className="text-stellar-white/80 leading-relaxed">
                      Spuštění prvních raketových projektů a organizace první série workshopů zaměřených na základy raketové techniky.
                    </p>
                  </div>
                </div>
                </TimelineItem>

                {/* Budoucnost */}
                <TimelineItem index={2}>
                <div className="relative pl-20">
                  <div className="absolute left-4 top-2 w-8 h-8 rounded-full bg-aurora-cyan shadow-[0_0_20px_rgba(80,200,255,0.6)] flex items-center justify-center border-4 border-deep-space animate-pulse">
                    <div className="w-3 h-3 rounded-full bg-stellar-white" />
                  </div>
                  <div className="bg-deep-space/60 backdrop-blur-sm border-2 border-aurora-cyan/30 rounded-2xl p-6 hover:border-aurora-cyan/60 transition-all group">
                    <div className="flex items-center gap-4 mb-3">
                      <span className="text-3xl font-bold text-aurora-cyan font-heading">Budoucnost</span>
                      <div className="h-px flex-1 bg-gradient-to-r from-aurora-cyan/50 to-transparent" />
                    </div>
                    <h3 className="text-2xl font-bold text-stellar-white mb-3">Naše plány</h3>
                    <p className="text-stellar-white/80 leading-relaxed">
                      Pokračujeme v rozvoji komunity, vytváříme ambiciózní projekty a připravujeme účast v mezinárodních soutěžích. Naším cílem je stát se předním centrem pro raketovou techniku v České republice.
                    </p>
                  </div>
                </div>
                </TimelineItem>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Kontaktujte nás */}
      <section id="kontakt" className="py-16 relative bg-gradient-to-b from-deep-space to-cosmic-black overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-aurora-cyan/30 rounded-full blur-3xl" />
          <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-crs-ignition/20 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto">
            <ScrollReveal>
            <div className="text-center mb-12">
              <h2 className="font-heading text-3xl sm:text-5xl font-bold text-stellar-white mb-6">
                Kontaktujte nás
              </h2>
              <div className="w-16 h-1 bg-gradient-to-r from-aurora-cyan to-crs-ignition rounded-full mx-auto mb-4" />
              <p className="text-xl text-stellar-white/80 max-w-2xl mx-auto">
                Máte dotaz nebo návrh na spolupráci? Ozvěte se nám!
              </p>
            </div>
            </ScrollReveal>

            <div className="grid md:grid-cols-3 gap-6">
              {/* Email */}
              <div className="bg-deep-space/60 backdrop-blur-sm border border-cosmic-blue/30 rounded-2xl p-8 text-center hover:border-aurora-cyan/50 transition-all">
                <div className="w-14 h-14 bg-aurora-cyan/20 rounded-xl flex items-center justify-center mx-auto mb-5">
                  <svg className="w-7 h-7 text-aurora-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-stellar-white mb-3">Email</h3>
                <a
                  href="mailto:info@czechrocketsociety.cz"
                  className="text-aurora-cyan hover:underline font-medium"
                >
                  info@czechrocketsociety.cz
                </a>
              </div>

              {/* Sociální sítě */}
              <div className="bg-deep-space/60 backdrop-blur-sm border border-cosmic-blue/30 rounded-2xl p-8 text-center hover:border-crs-ignition/50 transition-all">
                <div className="w-14 h-14 bg-crs-ignition/20 rounded-xl flex items-center justify-center mx-auto mb-5">
                  <svg className="w-7 h-7 text-crs-ignition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-stellar-white mb-3">Sociální sítě</h3>
                <div className="flex justify-center gap-4 mt-2">
                  <a
                    href="https://www.facebook.com/czechrocketsociety"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-stellar-white/60 hover:text-aurora-cyan transition-colors"
                    aria-label="Facebook"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/>
                    </svg>
                  </a>
                  <a
                    href="https://www.instagram.com/czechrocketsociety"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-stellar-white/60 hover:text-aurora-cyan transition-colors"
                    aria-label="Instagram"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                    </svg>
                  </a>
                  <a
                    href="https://www.linkedin.com/company/czechrocketsociety"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-stellar-white/60 hover:text-aurora-cyan transition-colors"
                    aria-label="LinkedIn"
                  >
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </a>
                </div>
              </div>

              {/* Datová schránka */}
              <div className="bg-deep-space/60 backdrop-blur-sm border border-cosmic-blue/30 rounded-2xl p-8 text-center hover:border-purple-500/50 transition-all">
                <div className="w-14 h-14 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-5">
                  <svg className="w-7 h-7 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-stellar-white mb-3">Datová schránka</h3>
                <p className="text-aurora-cyan font-mono font-medium text-lg">
                  96kg7jd
                </p>
              </div>
            </div>

            {/* Správní rada */}
            {boardMembers.length > 0 && (
              <div className="mt-16">
                <h3 className="font-heading text-3xl font-bold text-stellar-white mb-8 text-center">
                  Správní rada
                </h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {boardMembers.map((member) => (
                    <div
                      key={member.id}
                      className="bg-deep-space/60 backdrop-blur-sm border border-cosmic-blue/30 rounded-2xl p-6 hover:border-aurora-cyan/50 transition-all flex flex-col items-center text-center"
                    >
                      {/* Fotka */}
                      <div className="w-24 h-24 rounded-full overflow-hidden mb-4 border-2 border-aurora-cyan/30">
                        {member.avatar ? (
                          <img
                            src={member.avatar.startsWith('http') ? member.avatar : `${API_URL}${member.avatar}`}
                            alt={member.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-aurora-cyan/20 to-cosmic-blue/20 flex items-center justify-center">
                            <svg className="w-10 h-10 text-stellar-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                          </div>
                        )}
                      </div>

                      {/* Jméno a role */}
                      <h4 className="text-lg font-bold text-stellar-white mb-1">
                        {member.name}
                      </h4>
                      <p className="text-aurora-cyan text-sm font-medium mb-3">
                        {member.role}
                      </p>

                      {/* Kontakty */}
                      <div className="space-y-1 text-sm">
                        {member.email && (
                          <a
                            href={`mailto:${member.email}`}
                            className="block text-stellar-white/70 hover:text-aurora-cyan transition-colors"
                          >
                            {member.email}
                          </a>
                        )}
                        {member.phone && (
                          <a
                            href={`tel:${member.phone.replace(/\s/g, '')}`}
                            className="block text-stellar-white/70 hover:text-aurora-cyan transition-colors"
                          >
                            {member.phone}
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA sekce - Připoj se */}
      <section className="py-20 relative bg-gradient-to-b from-cosmic-black to-cosmic-black overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-aurora-cyan/30 via-crs-ignition/20 to-transparent rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-8">
              <div className="inline-block px-6 py-2 rounded-full bg-aurora-cyan/10 border border-aurora-cyan/30 backdrop-blur-sm mb-6">
                <span className="text-aurora-cyan font-bold">Staň se součástí týmu</span>
              </div>
              <h2 className="font-heading text-3xl sm:text-5xl md:text-6xl font-bold text-stellar-white mb-6">
                Připoj se k nám
              </h2>
              <p className="text-xl text-stellar-white/80 leading-relaxed max-w-2xl mx-auto">
                Hledáme nadšence, studenty a profesionály, kteří chtějí být součástí české raketové budoucnosti. Společně posuneme hranice možného.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <div className="bg-deep-space/60 backdrop-blur-sm border border-cosmic-blue/30 rounded-2xl p-6 hover:border-aurora-cyan/50 transition-all">
                <div className="w-12 h-12 bg-aurora-cyan/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-aurora-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-stellar-white mb-2">Pro studenty</h3>
                <p className="text-stellar-white/70 text-sm">Získej praktické zkušenosti a rozviň své dovednosti</p>
              </div>

              <div className="bg-deep-space/60 backdrop-blur-sm border border-cosmic-blue/30 rounded-2xl p-6 hover:border-crs-ignition/50 transition-all">
                <div className="w-12 h-12 bg-crs-ignition/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-crs-ignition" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-stellar-white mb-2">Pro nadšence</h3>
                <p className="text-stellar-white/70 text-sm">Sdílej svou vášeň pro rakety s podobně smýšlejícími lidmi</p>
              </div>

              <div className="bg-deep-space/60 backdrop-blur-sm border border-cosmic-blue/30 rounded-2xl p-6 hover:border-purple-500/50 transition-all">
                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-stellar-white mb-2">Pro profesionály</h3>
                <p className="text-stellar-white/70 text-sm">Přispěj svými zkušenostmi a veď budoucí inženýry</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/nabor"
                className="group relative px-6 py-3 sm:px-10 sm:py-5 rounded-xl bg-gradient-to-r from-aurora-cyan to-cosmic-blue text-stellar-white font-bold text-lg hover:shadow-[0_0_40px_rgba(80,200,255,0.6)] transition-all transform hover:scale-105"
              >
                <span className="relative z-10">Chci se přidat →</span>
              </Link>
              <Link
                href="/clenove"
                className="px-6 py-3 sm:px-10 sm:py-5 rounded-xl border-2 border-stellar-white/30 text-stellar-white font-bold text-lg hover:bg-stellar-white/10 backdrop-blur-sm transition-all"
              >
                Náš tým
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PageTransition>
  );
}
