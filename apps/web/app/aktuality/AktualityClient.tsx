'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import Link from 'next/link';
import { FloatingAstronaut } from '../components/EmptyStates';

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

interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  coverImage: string | null;
  publishedAt: string;
}

function getImageUrl(image: string | null, apiUrl: string) {
  if (!image) return null;
  return image.startsWith('http') ? image : `${apiUrl}${image}`;
}

export function AktualityClient({
  articles,
  apiUrl,
}: {
  articles: Article[];
  apiUrl: string;
}) {
  const featured = articles[0];
  const rest = articles.slice(1);

  return (
    <div className="min-h-screen bg-deep-space">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-cosmic-blue/20 via-deep-space to-deep-space" />
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-aurora-cyan/15 rounded-full blur-[120px]" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 pt-28 sm:pt-32 pb-12 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-1 bg-gradient-to-r from-aurora-cyan to-crs-ignition rounded-full" />
              <span className="font-accent text-xs tracking-[0.25em] uppercase text-aurora-cyan/70">
                Novinky & články
              </span>
            </div>
            <h1 className="font-heading text-4xl sm:text-5xl md:text-6xl font-bold text-stellar-white mb-4">
              Aktuality
            </h1>
            <p className="text-lg text-stellar-white/60 max-w-xl">
              Sledujte nejnovější zprávy, úspěchy a novinky z našeho raketového projektu
            </p>
          </motion.div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 pb-24">
        {articles.length === 0 ? (
          <FloatingAstronaut message="Zatím nejsou k dispozici žádné aktuality." />
        ) : (
          <>
            {/* Featured article */}
            {featured && (
              <ScrollReveal className="mb-12">
                <Link href={`/aktuality/${featured.slug}`}>
                  <article
                    className="group relative overflow-hidden rounded-2xl border border-stellar-white/10 bg-stellar-white/[0.03] backdrop-blur-sm hover:border-aurora-cyan/30 hover:shadow-[0_0_30px_rgba(100,244,210,0.1)] transition-all duration-500"
                  >
                    <div className="grid md:grid-cols-2">
                      {/* Image */}
                      <div className="relative h-64 md:h-full min-h-[280px] overflow-hidden">
                        {featured.coverImage ? (
                          <img
                            src={getImageUrl(featured.coverImage, apiUrl)!}
                            alt={featured.title}
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          />
                        ) : (
                          <div className="absolute inset-0 bg-gradient-to-br from-crs-base/20 via-cosmic-blue/30 to-deep-space flex items-center justify-center">
                            <img src="/images/crs-logo-white.png" alt="CRS" className="w-16 h-16 opacity-15" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-deep-space/80 hidden md:block" />
                        <div className="absolute inset-0 bg-gradient-to-t from-deep-space/60 to-transparent md:hidden" />

                        {/* Featured badge */}
                        <div className="absolute top-4 left-4">
                          <span className="px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-aurora-cyan/20 text-aurora-cyan border border-aurora-cyan/30 backdrop-blur-md">
                            Nejnovější
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-8 md:p-10 flex flex-col justify-center">
                        <time className="text-xs text-aurora-cyan/80 font-accent uppercase tracking-wider mb-3">
                          {featured.publishedAt}
                        </time>
                        <h2 className="font-heading text-2xl sm:text-3xl font-bold text-stellar-white group-hover:text-aurora-cyan transition-colors duration-300 mb-4">
                          {featured.title}
                        </h2>
                        {featured.excerpt && (
                          <p className="text-stellar-white/60 leading-relaxed mb-6 line-clamp-3">
                            {featured.excerpt}
                          </p>
                        )}
                        <div className="flex items-center text-aurora-cyan text-sm font-medium">
                          <span>Číst článek</span>
                          <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </article>
                </Link>
              </ScrollReveal>
            )}

            {/* Rest of articles */}
            {rest.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rest.map((article, i) => (
                  <ScrollReveal key={article.id} delay={i * 0.08}>
                    <Link href={`/aktuality/${article.slug}`}>
                      <motion.article
                        className="group relative overflow-hidden rounded-2xl border border-stellar-white/10 bg-stellar-white/[0.03] backdrop-blur-sm h-full hover:shadow-[0_0_30px_rgba(100,244,210,0.1)] hover:border-aurora-cyan/30 transition-all duration-500"
                        whileHover={{ y: -4 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                      >
                        {/* Image */}
                        <div className="relative h-48 overflow-hidden">
                          {article.coverImage ? (
                            <img
                              src={getImageUrl(article.coverImage, apiUrl)!}
                              alt={article.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-crs-base/20 via-cosmic-blue/30 to-deep-space flex items-center justify-center">
                              <img src="/images/crs-logo-white.png" alt="CRS" className="w-12 h-12 opacity-15" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-deep-space/50 to-transparent" />
                        </div>

                        {/* Content */}
                        <div className="p-6">
                          <time className="text-xs text-aurora-cyan/70 font-accent uppercase tracking-wider">
                            {article.publishedAt}
                          </time>
                          <h2 className="font-heading text-lg font-bold text-stellar-white mt-2 mb-3 group-hover:text-aurora-cyan transition-colors duration-300 line-clamp-2">
                            {article.title}
                          </h2>
                          {article.excerpt && (
                            <p className="text-stellar-white/50 text-sm leading-relaxed line-clamp-2">
                              {article.excerpt}
                            </p>
                          )}
                          <div className="mt-4 flex items-center text-aurora-cyan/80 text-sm font-medium">
                            <span>Číst více</span>
                            <svg className="w-4 h-4 ml-1.5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </motion.article>
                    </Link>
                  </ScrollReveal>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
