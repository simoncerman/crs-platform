'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import Link from 'next/link';
import { OrbitingSatellite } from '../components/EmptyStates';

function ScrollReveal({
  children,
  className = '',
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

interface Partner {
  id: string;
  name: string;
  tier: 'diamond' | 'gold' | 'silver';
  logo: string | null;
  description: string | null;
  fullDescription: string | null;
  heroImage: string | null;
  website: string | null;
  order: number;
}

function TierHeading({
  title,
  subtitle,
  accentColor,
}: {
  title: string;
  subtitle: string;
  accentColor: string;
}) {
  return (
    <ScrollReveal className="text-center mb-12 sm:mb-16">
      <div className="flex items-center justify-center gap-3 mb-3">
        <div className={`w-8 h-0.5 rounded-full ${accentColor}`} />
        <span className="font-accent text-xs tracking-[0.25em] uppercase text-stellar-white/50">
          {subtitle}
        </span>
        <div className={`w-8 h-0.5 rounded-full ${accentColor}`} />
      </div>
      <h2 className="font-heading text-3xl sm:text-4xl font-bold text-stellar-white">{title}</h2>
    </ScrollReveal>
  );
}

export function PartneriClient({
  partners,
}: {
  partners: { diamond: Partner[]; gold: Partner[]; silver: Partner[] };
}) {
  const { diamond, gold, silver } = partners;

  return (
    <div className="min-h-screen bg-deep-space">
      {/* Hero + Diamond in one continuous section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-cosmic-blue/20 via-deep-space to-deep-space" />
        <div className="absolute inset-0 opacity-15 pointer-events-none">
          <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-crs-ignition/20 rounded-full blur-[120px]" />
          <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-aurora-cyan/15 rounded-full blur-[120px]" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 pt-28 sm:pt-32 pb-12 sm:pb-16 relative">
          <motion.div
            className="max-w-3xl mx-auto text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="inline-flex items-center gap-3 mb-5">
              <div className="w-8 h-0.5 bg-gradient-to-r from-crs-ignition to-aurora-cyan rounded-full" />
              <span className="font-accent text-xs tracking-[0.25em] uppercase text-crs-ignition/70">
                Naši podporovatelé
              </span>
              <div className="w-8 h-0.5 bg-gradient-to-r from-aurora-cyan to-crs-ignition rounded-full" />
            </div>
            <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-bold text-stellar-white mb-5">
              Partneři
            </h1>
            <p className="text-base sm:text-lg text-stellar-white/60 max-w-xl mx-auto">
              Děkujeme všem, kteří podporují rozvoj české raketové techniky a pomáhají nám dosahovat našich cílů.
            </p>
          </motion.div>
        </div>

      {/* Diamond Partners - continues in same section */}
      {diamond.length > 0 && (
        <div className="relative px-4 sm:px-6 pb-16 sm:pb-24">
          <div className="max-w-6xl mx-auto">
            <TierHeading
              title="Diamond"
              subtitle="Strategičtí partneři"
              accentColor="bg-aurora-cyan"
            />

            <div className="space-y-16 sm:space-y-20">
              {diamond.map((partner, i) => (
                <ScrollReveal key={partner.id} delay={i * 0.1}>
                  <div className="relative rounded-2xl overflow-hidden border border-aurora-cyan/20 bg-stellar-white/[0.03] backdrop-blur-sm hover:border-aurora-cyan/40 transition-all duration-500">
                    {/* Hero image */}
                    <div className="relative h-56 sm:h-72 md:h-80">
                      {partner.heroImage ? (
                        <img
                          src={partner.heroImage}
                          alt={partner.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-crs-base/20 via-cosmic-blue/30 to-deep-space flex items-center justify-center">
                          <img src="/images/crs-logo-white.png" alt="CRS" className="w-20 h-20 opacity-10" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-deep-space via-deep-space/50 to-transparent" />

                      {/* Logo on image */}
                      {partner.logo && (
                        <div className="absolute bottom-6 left-6 sm:left-8">
                          <div className="bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-lg">
                            <img
                              src={partner.logo}
                              alt={`${partner.name} logo`}
                              className="h-10 sm:h-12 w-auto object-contain"
                            />
                          </div>
                        </div>
                      )}

                      {/* Diamond badge */}
                      <div className="absolute top-4 right-4 sm:top-6 sm:right-6">
                        <span className="px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-aurora-cyan/15 text-aurora-cyan border border-aurora-cyan/25 backdrop-blur-md">
                          Diamond Partner
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 sm:p-8 md:p-10">
                      <h3 className="font-heading text-2xl sm:text-3xl font-bold text-stellar-white mb-4">
                        {partner.name}
                      </h3>

                      {partner.description && (
                        <p className="text-base sm:text-lg text-stellar-white/80 leading-relaxed mb-4">
                          {partner.description}
                        </p>
                      )}
                      {partner.fullDescription && (
                        <p className="text-sm sm:text-base text-stellar-white/55 leading-relaxed mb-6">
                          {partner.fullDescription}
                        </p>
                      )}

                      {partner.website && (
                        <a
                          href={partner.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-deep-space transition-all hover:shadow-lg hover:shadow-aurora-cyan/20 active:scale-95"
                          style={{ background: 'linear-gradient(135deg, #64f4d2, #4d9fff)' }}
                        >
                          Navštívit web
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      )}
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </div>
      )}
      </section>

      {/* Empty state when no partners at all */}
      {diamond.length === 0 && gold.length === 0 && silver.length === 0 && (
        <section className="relative px-4 sm:px-6 overflow-hidden">
          <OrbitingSatellite />
        </section>
      )}

      {/* Gold Partners */}
      {gold.length > 0 && (
        <section className="relative px-4 sm:px-6 py-16 sm:py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-deep-space via-cosmic-blue/5 to-deep-space" />

          <div className="relative max-w-6xl mx-auto">
            <TierHeading
              title="Gold"
              subtitle="Významní partneři"
              accentColor="bg-crs-ignition"
            />

            <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-6">
              {gold.map((partner, i) => (
                <ScrollReveal key={partner.id} delay={i * 0.08}>
                  <motion.div
                    className="group relative overflow-hidden rounded-2xl border border-crs-ignition/15 bg-stellar-white/[0.03] backdrop-blur-sm hover:border-crs-ignition/35 hover:shadow-[0_0_30px_rgba(243,182,0,0.08)] transition-all duration-500 h-full"
                    whileHover={{ y: -3 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  >
                    {/* Logo area */}
                    <div className="relative h-40 overflow-hidden bg-gradient-to-br from-white/[0.08] to-transparent flex items-center justify-center p-6">
                      {partner.logo ? (
                        <img
                          src={partner.logo}
                          alt={`${partner.name} logo`}
                          className="max-h-full max-w-full object-contain rounded-lg"
                        />
                      ) : (
                        <img src="/images/crs-logo-white.png" alt="CRS" className="w-14 h-14 opacity-10" />
                      )}
                      <div className="absolute top-3 right-3">
                        <span className="px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest bg-crs-ignition/10 text-crs-ignition/70 border border-crs-ignition/20">
                          Gold
                        </span>
                      </div>
                    </div>

                    <div className="p-6">
                      <h3 className="font-heading text-xl font-bold text-stellar-white mb-3 group-hover:text-crs-ignition transition-colors duration-300">
                        {partner.name}
                      </h3>
                      {partner.description && (
                        <p className="text-stellar-white/55 text-sm leading-relaxed">
                          {partner.description}
                        </p>
                      )}
                      {partner.website && (
                        <a
                          href={partner.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-4 inline-flex items-center text-crs-ignition/70 text-sm font-medium hover:text-crs-ignition transition-colors"
                        >
                          Navštívit web
                          <svg className="w-3.5 h-3.5 ml-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      )}
                    </div>
                  </motion.div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Silver Partners */}
      {silver.length > 0 && (
        <section className="relative px-4 sm:px-6 py-16 sm:py-24 overflow-hidden">
          <div className="relative max-w-6xl mx-auto">
            <TierHeading
              title="Silver"
              subtitle="Podporující partneři"
              accentColor="bg-stellar-white/30"
            />

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {silver.map((partner, i) => (
                <ScrollReveal key={partner.id} delay={i * 0.06}>
                  <a
                    href={partner.website || '#'}
                    target={partner.website ? '_blank' : undefined}
                    rel="noopener noreferrer"
                    className="group block"
                  >
                    <div className="relative overflow-hidden rounded-xl border border-stellar-white/10 bg-stellar-white/[0.03] backdrop-blur-sm hover:border-stellar-white/25 hover:bg-stellar-white/[0.06] transition-all duration-300 p-5 text-center">
                      <div className="h-16 flex items-center justify-center mb-3">
                        {partner.logo ? (
                          <img
                            src={partner.logo}
                            alt={`${partner.name} logo`}
                            className="max-h-full max-w-full object-contain rounded opacity-70 group-hover:opacity-100 transition-opacity"
                          />
                        ) : (
                          <img src="/images/crs-logo-white.png" alt="CRS" className="w-10 h-10 opacity-10" />
                        )}
                      </div>
                      <p className="text-stellar-white/70 font-medium text-sm group-hover:text-stellar-white transition-colors">
                        {partner.name}
                      </p>
                    </div>
                  </a>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="relative px-4 sm:px-6 py-16 sm:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-deep-space to-cosmic-blue/10" />
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-crs-ignition rounded-full blur-[150px]" />
        </div>

        <ScrollReveal>
          <div className="relative max-w-2xl mx-auto text-center">
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-stellar-white mb-4">
              Staň se naším partnerem
            </h2>
            <p className="text-base sm:text-lg text-stellar-white/60 leading-relaxed mb-8">
              Chcete podporovat český raketový průmysl a být součástí něčeho velkého? Kontaktujte nás.
            </p>
            <Link
              href="/o-nas#kontakt"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-deep-space text-base hover:shadow-lg hover:shadow-crs-ignition/20 transition-all active:scale-95"
              style={{ background: 'linear-gradient(135deg, #F3B600, #64f4d2)' }}
            >
              Kontaktovat nás
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </ScrollReveal>
      </section>
    </div>
  );
}
