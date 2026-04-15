'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';

// ── Scroll Reveal wrapper ──────────────────────────────────────────
function ScrollReveal({
  children,
  className = '',
  delay = 0,
  direction = 'up',
  distance = 40,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  distance?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  const dirs = {
    up: { y: distance, x: 0 },
    down: { y: -distance, x: 0 },
    left: { x: distance, y: 0 },
    right: { x: -distance, y: 0 },
  };
  const initial = dirs[direction];

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, ...initial }}
      animate={isInView ? { opacity: 1, x: 0, y: 0 } : { opacity: 0, ...initial }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

// ── Animated counter ───────────────────────────────────────────────
function AnimatedCounter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const duration = 1500;
    const steps = 40;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = 1 - Math.pow(1 - step / steps, 3);
      setCount(Math.round(value * progress));
      if (step >= steps) {
        setCount(value);
        clearInterval(timer);
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [isInView, value]);

  return <span ref={ref}>{count}{suffix}</span>;
}

// ── Section heading ────────────────────────────────────────────────
function SectionHeading({
  title,
  subtitle,
  align = 'center',
}: {
  title: string;
  subtitle?: string;
  align?: 'center' | 'left';
}) {
  return (
    <ScrollReveal className={`mb-12 ${align === 'center' ? 'text-center' : ''}`}>
      <h2 className="font-heading text-3xl font-bold text-stellar-white sm:text-5xl lg:text-6xl mb-4">
        {title}
      </h2>
      <div className={`w-12 sm:w-16 h-1 bg-gradient-to-r from-aurora-cyan to-crs-ignition rounded-full mb-4 ${align === 'center' ? 'mx-auto' : ''}`} />
      {subtitle && (
        <p className="text-base sm:text-lg text-stellar-white/70 max-w-2xl mx-auto px-2">
          {subtitle}
        </p>
      )}
    </ScrollReveal>
  );
}

// ── Types ──────────────────────────────────────────────────────────
interface SerializedArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  coverImage: string | null;
  publishedAt: string | null;
}

interface SerializedEvent {
  id: string;
  slug: string;
  title: string;
  status: string;
  eventType: string | null;
  location: string | null;
  coverImage: string | null;
  startDate: string;
}

interface SerializedProject {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  category: string | null;
  coverImage: string | null;
  isFeatured: boolean | null;
}

const eventTypeLabels: Record<string, string> = {
  launch: 'Start rakety',
  test: 'Testovací kampaň',
  recruitment: 'Nábor',
  pr: 'PR akce',
  event: 'Událost',
};

const eventTypeColors: Record<string, string> = {
  launch: 'bg-crs-ignition/20 text-crs-ignition border-crs-ignition/50',
  test: 'bg-aurora-cyan/20 text-aurora-cyan border-aurora-cyan/40',
  recruitment: 'bg-purple-500/20 text-purple-400 border-purple-500/40',
  pr: 'bg-pink-500/20 text-pink-400 border-pink-500/40',
  event: 'bg-stellar-white/10 text-stellar-white/70 border-stellar-white/20',
};

// ── Glass card component ───────────────────────────────────────────
function GlassCard({
  children,
  className = '',
  hoverGlow = 'aurora-cyan',
}: {
  children: React.ReactNode;
  className?: string;
  hoverGlow?: string;
}) {
  const glowColors: Record<string, string> = {
    'aurora-cyan': 'hover:shadow-[0_0_30px_rgba(100,244,210,0.15)] hover:border-aurora-cyan/50',
    'crs-ignition': 'hover:shadow-[0_0_30px_rgba(243,182,0,0.15)] hover:border-crs-ignition/50',
    'purple': 'hover:shadow-[0_0_30px_rgba(139,92,246,0.15)] hover:border-purple-500/50',
  };

  return (
    <motion.div
      className={`relative overflow-hidden rounded-2xl border border-stellar-white/10 bg-stellar-white/[0.03] backdrop-blur-md transition-all duration-500 ${glowColors[hoverGlow] || glowColors['aurora-cyan']} ${className}`}
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
    >
      {children}
    </motion.div>
  );
}

// ════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ════════════════════════════════════════════════════════════════════
export function HomePageSections({
  articles,
  events,
  projects,
  apiUrl,
}: {
  articles: SerializedArticle[];
  events: SerializedEvent[];
  projects: SerializedProject[];
  apiUrl: string;
}) {
  return (
    <>
      {/* ── About Section ───────────────────────────────────────── */}
      <section className="relative px-4 py-16 sm:px-6 sm:py-24 lg:px-8 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-deep-space via-cosmic-blue/5 to-deep-space" />
        <div className="absolute inset-0 opacity-15 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-aurora-cyan/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-crs-ignition/15 rounded-full blur-[120px]" />
        </div>

        <div className="relative mx-auto max-w-6xl">
          <SectionHeading title="O nás" />

          <div className="grid gap-16 lg:grid-cols-2 items-center">
            <ScrollReveal direction="left" delay={0.1}>
              <div className="space-y-6">
                <p className="text-xl text-stellar-white/90 leading-relaxed">
                  Jsme <span className="text-aurora-cyan font-bold">Czech Rocket Society</span> – nezisková organizace, která se zaměřuje na výzkum, vývoj a stavbu experimentálních raket a kosmické techniky.
                </p>
                <p className="text-lg text-stellar-white/70 leading-relaxed">
                  Naše mise je inspirovat mladou generaci k technickým oborům a přispět k rozvoji českého kosmického průmyslu. Spojujeme studenty, profesionály a nadšence, kteří sdílejí vášeň pro raketovou techniku a kosmonautiku.
                </p>
                <div className="flex flex-wrap gap-4 pt-4">
                  <Link
                    href="/o-nas"
                    className="group px-6 py-3 rounded-xl bg-aurora-cyan text-deep-space font-bold hover:bg-aurora-cyan/90 transition-all hover:shadow-[0_0_25px_rgba(100,244,210,0.4)] active:scale-95"
                  >
                    Více o nás
                  </Link>
                  <Link
                    href="/nabor"
                    className="px-6 py-3 rounded-xl border border-aurora-cyan/40 text-aurora-cyan font-bold hover:bg-aurora-cyan/10 transition-all active:scale-95"
                  >
                    Připoj se k nám
                  </Link>
                </div>
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { icon: '🚀', title: 'Výzkum', desc: 'Experimentální technologie a inovativní řešení', delay: 0.1 },
                { icon: '🔬', title: 'Vývoj', desc: 'Stavba vlastních raket a komponent', delay: 0.2 },
                { icon: '🎓', title: 'Vzdělávání', desc: 'Workshopy a přednášky pro studenty', delay: 0.3 },
                { icon: '🌍', title: 'Komunita', desc: 'Propojení nadšenců a profesionálů', delay: 0.4 },
              ].map((card) => (
                <ScrollReveal key={card.title} delay={card.delay} direction="right">
                  <GlassCard className="p-6 group cursor-default">
                    <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">{card.icon}</div>
                    <h3 className="font-heading text-lg font-bold text-stellar-white mb-1">{card.title}</h3>
                    <p className="text-stellar-white/60 text-sm leading-relaxed">{card.desc}</p>
                  </GlassCard>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Achievements Section ────────────────────────────────── */}
      <section className="relative px-4 py-16 sm:px-6 sm:py-24 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-deep-space via-cosmic-blue/8 to-deep-space" />

        <div className="relative mx-auto max-w-6xl">
          <SectionHeading
            title="Naše úspěchy"
            subtitle="Klíčové milníky na naší cestě k hvězdám"
          />

          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {[
              { value: 15, suffix: '+', label: 'Úspěšných startů', color: 'text-crs-ignition', glow: 'crs-ignition', gradient: 'from-crs-ignition/10 to-transparent' },
              { value: 3, suffix: 'km', label: 'Maximální výška', color: 'text-aurora-cyan', glow: 'aurora-cyan', gradient: 'from-aurora-cyan/10 to-transparent' },
              { value: 50, suffix: '+', label: 'Aktivních členů', color: 'text-purple-400', glow: 'purple', gradient: 'from-purple-500/10 to-transparent' },
              { value: 8, suffix: '+', label: 'Let zkušeností', color: 'text-aurora-cyan', glow: 'aurora-cyan', gradient: 'from-aurora-cyan/10 to-transparent' },
            ].map((stat, i) => (
              <ScrollReveal key={stat.label} delay={i * 0.1}>
                <GlassCard className="p-8 text-center" hoverGlow={stat.glow}>
                  <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none`} />
                  <div className={`text-3xl sm:text-5xl lg:text-6xl font-bold ${stat.color} mb-2 sm:mb-3 font-heading`}>
                    <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                  </div>
                  <div className="text-stellar-white/80 font-medium text-sm">
                    {stat.label}
                  </div>
                </GlassCard>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why Join Section ─────────────────────────────────────── */}
      <section className="relative px-4 py-16 sm:px-6 sm:py-24 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-deep-space to-deep-space" />
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-crs-ignition rounded-full blur-[150px]" />
        </div>

        <div className="relative mx-auto max-w-6xl">
          <SectionHeading
            title="Proč se zapojit?"
            subtitle="Získej jedinečné zkušenosti a staň se součástí české kosmické budoucnosti"
          />

          <div className="grid gap-6 md:grid-cols-3 mb-12">
            {[
              {
                title: 'Praktické zkušenosti',
                desc: 'Pracuj na reálných projektech, které létají. Získej hands-on zkušenosti s avionikou, mechanikou a elektronikou.',
                icon: (
                  <svg className="w-7 h-7 text-aurora-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                ),
                delay: 0,
              },
              {
                title: 'Skvělá komunita',
                desc: 'Poznej studenty a profesionály z různých technických oborů. Navazuj kontakty a přátelství na celý život.',
                icon: (
                  <svg className="w-7 h-7 text-aurora-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                ),
                delay: 0.1,
              },
              {
                title: 'Rozvoj dovedností',
                desc: 'Vzdělávej se v oblastech programování, elektroniky, mechaniky, projektového řízení a mnoha dalších.',
                icon: (
                  <svg className="w-7 h-7 text-aurora-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                ),
                delay: 0.2,
              },
            ].map((card) => (
              <ScrollReveal key={card.title} delay={card.delay}>
                <GlassCard className="p-8 group cursor-default">
                  <div className="w-14 h-14 rounded-2xl bg-aurora-cyan/10 border border-aurora-cyan/20 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-aurora-cyan/20 transition-all duration-300">
                    {card.icon}
                  </div>
                  <h3 className="font-heading text-xl font-bold text-stellar-white mb-3">
                    {card.title}
                  </h3>
                  <p className="text-stellar-white/70 leading-relaxed text-sm">
                    {card.desc}
                  </p>
                </GlassCard>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal delay={0.3}>
            <div className="text-center">
              <Link
                href="/nabor"
                className="inline-flex items-center gap-3 px-8 py-4 rounded-xl font-bold text-lg text-deep-space transition-all transform hover:scale-105 active:scale-95 hover:shadow-[0_0_40px_rgba(100,244,210,0.4)]"
                style={{ background: 'linear-gradient(135deg, #64f4d2, #F3B600)' }}
              >
                <span>Začni ještě dnes</span>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── Latest Articles ──────────────────────────────────────── */}
      {articles.length > 0 && (
        <section className="relative px-4 py-16 sm:px-6 sm:py-24 lg:px-8 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-deep-space via-cosmic-blue/5 to-deep-space" />

          <div className="relative mx-auto max-w-6xl">
            <ScrollReveal>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-8 sm:mb-10">
                <div>
                  <h2 className="font-heading text-2xl font-bold text-stellar-white sm:text-4xl md:text-5xl">
                    Nejnovější aktuality
                  </h2>
                  <div className="w-16 h-1 bg-gradient-to-r from-aurora-cyan to-crs-ignition rounded-full mt-4" />
                </div>
                <Link
                  href="/aktuality"
                  className="text-aurora-cyan hover:text-aurora-cyan/80 transition-colors font-medium text-sm flex items-center gap-1"
                >
                  Všechny aktuality
                  <span>→</span>
                </Link>
              </div>
            </ScrollReveal>

            <div className="grid gap-6 md:grid-cols-3">
              {articles.map((article, i) => (
                <ScrollReveal key={article.id} delay={i * 0.1}>
                  <Link href={`/aktuality/${article.slug}`}>
                    <GlassCard className="group cursor-pointer h-full">
                      {article.coverImage && (
                        <div className="relative h-48 w-full overflow-hidden rounded-t-2xl">
                          <img
                            src={article.coverImage.startsWith('http') ? article.coverImage : `${apiUrl}${article.coverImage}`}
                            alt={article.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-deep-space/60 to-transparent" />
                        </div>
                      )}
                      <div className="p-6">
                        {article.publishedAt && (
                          <time className="text-xs text-aurora-cyan font-accent uppercase tracking-wider">
                            {article.publishedAt}
                          </time>
                        )}
                        <h3 className="mt-2 font-heading text-lg font-bold text-stellar-white group-hover:text-aurora-cyan transition-colors duration-300">
                          {article.title}
                        </h3>
                        {article.excerpt && (
                          <p className="mt-3 text-stellar-white/60 text-sm line-clamp-2 leading-relaxed">
                            {article.excerpt}
                          </p>
                        )}
                      </div>
                    </GlassCard>
                  </Link>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Upcoming Events ──────────────────────────────────────── */}
      {events.length > 0 && (
        <section className="relative px-4 py-16 sm:px-6 sm:py-24 lg:px-8 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-deep-space via-cosmic-blue/5 to-deep-space" />

          <div className="relative mx-auto max-w-6xl">
            <ScrollReveal>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-8 sm:mb-10">
                <div>
                  <h2 className="font-heading text-2xl font-bold text-stellar-white sm:text-4xl md:text-5xl">
                    Nadcházející události
                  </h2>
                  <div className="w-16 h-1 bg-gradient-to-r from-aurora-cyan to-crs-ignition rounded-full mt-4" />
                </div>
                <Link
                  href="/udalosti"
                  className="text-aurora-cyan hover:text-aurora-cyan/80 transition-colors font-medium text-sm flex items-center gap-1"
                >
                  Všechny události
                  <span>→</span>
                </Link>
              </div>
            </ScrollReveal>

            <div className="space-y-4">
              {events.map((event, i) => (
                <ScrollReveal key={event.id} delay={i * 0.1}>
                  <Link href={`/udalosti/${event.slug}`}>
                    <GlassCard className="group cursor-pointer p-4 sm:p-6 flex gap-4 sm:gap-6">
                      {event.coverImage && (
                        <div className="relative w-20 h-20 sm:w-28 sm:h-28 flex-shrink-0 rounded-xl overflow-hidden">
                          <img
                            src={event.coverImage.startsWith('http') ? event.coverImage : `${apiUrl}${event.coverImage}`}
                            alt={event.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            new Date() < new Date(event.startDate)
                              ? 'bg-aurora-blue/20 text-aurora-blue border border-aurora-blue/30'
                              : 'bg-aurora-cyan/20 text-aurora-cyan border border-aurora-cyan/30'
                          }`}>
                            {new Date() < new Date(event.startDate) ? 'Připravuje se' : 'Probíhá'}
                          </span>
                          {event.eventType && (
                            <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1.5 ${eventTypeColors[event.eventType] || eventTypeColors.event}`}>
                              {event.eventType === 'launch' && (
                                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M12,2L4.5,20.29L5.21,21L12,18L18.79,21L19.5,20.29L12,2Z" />
                                </svg>
                              )}
                              {eventTypeLabels[event.eventType] || 'Událost'}
                            </span>
                          )}
                          <time className="text-xs text-aurora-cyan/80 font-accent">
                            {event.startDate}
                          </time>
                        </div>
                        <h3 className="font-heading text-xl font-bold text-stellar-white group-hover:text-aurora-cyan transition-colors duration-300 mb-1">
                          {event.title}
                        </h3>
                        {event.location && (
                          <p className="text-stellar-white/60 text-sm flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {event.location}
                          </p>
                        )}
                      </div>
                    </GlassCard>
                  </Link>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Active Projects ──────────────────────────────────────── */}
      {projects.length > 0 && (
        <section className="relative px-4 py-16 sm:px-6 sm:py-24 lg:px-8 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-deep-space via-cosmic-blue/8 to-cosmic-blue/20" />

          <div className="relative mx-auto max-w-6xl">
            <ScrollReveal>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-8 sm:mb-10">
                <div>
                  <h2 className="font-heading text-2xl font-bold text-stellar-white sm:text-4xl md:text-5xl">
                    Aktivní projekty
                  </h2>
                  <div className="w-16 h-1 bg-gradient-to-r from-aurora-cyan to-crs-ignition rounded-full mt-4" />
                </div>
                <Link
                  href="/projekty"
                  className="text-aurora-cyan hover:text-aurora-cyan/80 transition-colors font-medium text-sm flex items-center gap-1"
                >
                  Všechny projekty
                  <span>→</span>
                </Link>
              </div>
            </ScrollReveal>

            <div className="grid gap-6 md:grid-cols-3">
              {projects.map((project, i) => (
                <ScrollReveal key={project.id} delay={i * 0.1}>
                  <Link href={`/projekty/${project.slug}`}>
                    <GlassCard className="group cursor-pointer h-full">
                      {project.coverImage && (
                        <div className="relative h-48 w-full overflow-hidden rounded-t-2xl">
                          <img
                            src={project.coverImage.startsWith('http') ? project.coverImage : `${apiUrl}${project.coverImage}`}
                            alt={project.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-deep-space/60 to-transparent" />
                          {project.category && (
                            <div className="absolute top-4 left-4">
                              <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-stellar-white/20 bg-stellar-white/10 text-stellar-white backdrop-blur-md">
                                {project.category}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                      <div className="p-6">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="w-2 h-2 rounded-full bg-aurora-cyan animate-pulse" />
                          <span className="text-[10px] text-aurora-cyan font-bold uppercase tracking-widest">
                            {project.isFeatured ? 'Vlajkový projekt' : 'Aktivní vývoj'}
                          </span>
                        </div>
                        <h3 className="font-heading text-lg font-bold text-stellar-white group-hover:text-aurora-cyan transition-colors duration-300">
                          {project.name}
                        </h3>
                        {project.description && (
                          <p className="mt-3 text-stellar-white/60 text-sm line-clamp-2 leading-relaxed">
                            {project.description}
                          </p>
                        )}
                      </div>
                    </GlassCard>
                  </Link>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
