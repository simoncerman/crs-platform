import { getEventBySlug, getEvents, getEventDisplayStatus, type EventDisplayStatus, API_URL } from '@/lib/api';

export const dynamic = 'force-dynamic';
import { format, isSameDay } from 'date-fns';
import { cs } from 'date-fns/locale';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import AddToCalendarButton from '@/components/features/events/AddToCalendarButton';
import { PageTransition } from '../../components/PageTransition';

export async function generateStaticParams() {
  try {
    const events = await getEvents();
    return events
      .filter(event => event.published)
      .map((event) => ({
        slug: event.slug,
      }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  
  if (!event) {
    return {
      title: 'Událost nenalezena | Czech Rocket Society',
    };
  }

  return {
    title: `${event.title} | Czech Rocket Society`,
    description: event.description ? event.description.substring(0, 160).replace(/<[^>]*>?/gm, '') : '',
  };
}

const statusLabels: Record<EventDisplayStatus, string> = {
  upcoming: 'Nadcházející',
  ongoing: 'Právě probíhá',
  past: 'Proběhlo',
  cancelled: 'Zrušeno',
  postponed: 'Odloženo',
};

const statusColors: Record<EventDisplayStatus, string> = {
  upcoming: 'bg-deep-space/70 text-aurora-cyan border-aurora-cyan/50 backdrop-blur-md',
  ongoing: 'bg-deep-space/70 text-green-400 border-green-500/50 backdrop-blur-md',
  past: 'bg-deep-space/70 text-stellar-white/70 border-stellar-white/30 backdrop-blur-md',
  cancelled: 'bg-deep-space/70 text-red-400 border-red-500/50 backdrop-blur-md',
  postponed: 'bg-deep-space/70 text-yellow-400 border-yellow-500/50 backdrop-blur-md',
};

const eventTypeLabels = {
  launch: 'Start rakety',
  test: 'Testovací kampaň',
  recruitment: 'Nábor',
  pr: 'PR akce',
  event: 'Událost',
};

const eventTypeColors = {
  launch: 'bg-deep-space/70 text-crs-ignition border-crs-ignition/50 backdrop-blur-md',
  test: 'bg-deep-space/70 text-aurora-cyan border-aurora-cyan/50 backdrop-blur-md',
  recruitment: 'bg-deep-space/70 text-purple-400 border-purple-500/50 backdrop-blur-md',
  pr: 'bg-deep-space/70 text-pink-400 border-pink-500/50 backdrop-blur-md',
  event: 'bg-deep-space/70 text-stellar-white/80 border-stellar-white/30 backdrop-blur-md',
};

export default async function EventDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);

  if (!event || !event.published) {
    notFound();
  }

  const imageUrl = event.coverImage 
    ? (event.coverImage.startsWith('http') ? event.coverImage : `${API_URL}${event.coverImage}`)
    : null;

  const start = new Date(event.startDate);
  const end = event.endDate ? new Date(event.endDate) : null;
  const multiDay = end ? !isSameDay(start, end) : false;

  return (
    <PageTransition className="min-h-screen bg-cosmic-black">
      {/* Hero sekce s obrázkem */}
      <div className="relative h-[60vh] min-h-[500px] w-full overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={event.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-b from-cosmic-blue/30 via-deep-space to-cosmic-black" />
        )}
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-cosmic-black via-cosmic-black/40 to-transparent" />

        {/* Breadcrumb a zpět */}
        <div className="absolute top-24 sm:top-28 left-0 right-0 z-10">
          <div className="container mx-auto px-4">
            <Link
              href="/udalosti"
              className="inline-flex items-center text-stellar-white/80 hover:text-stellar-white transition-colors bg-deep-space/60 backdrop-blur-md px-4 py-2 rounded-full border border-stellar-white/10"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              Zpět na události
            </Link>
          </div>
        </div>

        {/* Nadpis a základní info */}
        <div className="absolute bottom-0 left-0 right-0 pb-16">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border ${statusColors[getEventDisplayStatus(event)]}`}>
                {statusLabels[getEventDisplayStatus(event)]}
              </span>
              {event.eventType && (
                <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border flex items-center gap-2 ${eventTypeColors[event.eventType as keyof typeof eventTypeColors] || eventTypeColors.event}`}>
                  {event.eventType === 'launch' && (
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12,2L4.5,20.29L5.21,21L12,18L18.79,21L19.5,20.29L12,2Z" />
                    </svg>
                  )}
                  {eventTypeLabels[event.eventType as keyof typeof eventTypeLabels] || 'Událost'}
                </span>
              )}
              <div className="flex items-center text-stellar-white/90 bg-deep-space/70 backdrop-blur-md px-4 py-1.5 rounded-full border border-stellar-white/20 text-sm font-medium">
                <svg className="w-4 h-4 mr-2 text-aurora-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {multiDay ? (
                  `${format(start, 'd. M. yyyy', { locale: cs })} — ${format(end!, 'd. M. yyyy', { locale: cs })}`
                ) : (
                  format(start, 'd. MMMM yyyy', { locale: cs })
                )}
              </div>
            </div>
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-stellar-white max-w-5xl leading-tight" style={{ textShadow: '0 2px 20px rgba(0, 0, 0, 0.8)' }}>
              {event.title}
            </h1>
          </div>
        </div>
      </div>

      {/* Obsah události */}
      <div className="container mx-auto px-4 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Hlavní text */}
          <div className="lg:col-span-2">
            <div className="bg-stellar-white/5 border border-stellar-white/10 rounded-3xl p-8 md:p-12">
              <h2 className="text-2xl font-bold text-stellar-white mb-8 flex items-center">
                <span className="w-8 h-1 bg-aurora-cyan mr-4 rounded-full"></span>
                O události
              </h2>
              
              <div 
                className="article-content max-w-none"
                dangerouslySetInnerHTML={{ __html: event.description || '' }}
              />
            </div>
          </div>

          {/* Sidebar s informacemi */}
          <div className="lg:col-span-1">
            {/* Karta s detaily */}
            <div className="bg-gradient-to-br from-stellar-white/10 to-transparent border border-stellar-white/10 rounded-3xl p-8 lg:sticky lg:top-24 space-y-8">
              <div>
                <h3 className="text-xl font-bold text-stellar-white mb-8">Detaily akce</h3>
              
                <div className="space-y-8">
                  {/* Lokace */}
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-aurora-cyan/20 flex items-center justify-center shrink-0">
                      <svg className="w-5 h-5 text-aurora-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-stellar-white/40 text-xs uppercase tracking-widest font-bold mb-1">Místo konání</p>
                      <p className="text-stellar-white font-medium text-lg">{event.location || 'Bude upřesněno'}</p>
                    </div>
                  </div>

                  {multiDay ? (
                    <>
                      {/* Začátek pro vícedenní */}
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-aurora-cyan/20 flex items-center justify-center shrink-0">
                          <svg className="w-5 h-5 text-aurora-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-stellar-white/40 text-xs uppercase tracking-widest font-bold mb-1">Začátek</p>
                          <p className="text-stellar-white font-medium text-lg">
                            {format(start, 'd. M. yyyy, HH:mm', { locale: cs })}
                          </p>
                        </div>
                      </div>
                      {/* Konec pro vícedenní */}
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-aurora-cyan/20 flex items-center justify-center shrink-0">
                          <svg className="w-5 h-5 text-aurora-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-stellar-white/40 text-xs uppercase tracking-widest font-bold mb-1">Konec</p>
                          <p className="text-stellar-white font-medium text-lg">
                            {format(end!, 'd. M. yyyy, HH:mm', { locale: cs })}
                          </p>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Datum pro jednodenní */}
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-aurora-cyan/20 flex items-center justify-center shrink-0">
                          <svg className="w-5 h-5 text-aurora-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-stellar-white/40 text-xs uppercase tracking-widest font-bold mb-1">Datum</p>
                          <p className="text-stellar-white font-medium text-lg">
                            {format(start, 'd. MMMM yyyy', { locale: cs })}
                          </p>
                        </div>
                      </div>

                      {/* Čas pro jednodenní */}
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-aurora-cyan/20 flex items-center justify-center shrink-0">
                          <svg className="w-5 h-5 text-aurora-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-stellar-white/40 text-xs uppercase tracking-widest font-bold mb-1">Čas</p>
                          <p className="text-stellar-white font-medium text-lg">
                            {format(start, 'HH:mm', { locale: cs })}
                            {end && ` – ${format(end, 'HH:mm', { locale: cs })}`}
                          </p>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Kalendář */}
                  <div className="pt-4">
                    <AddToCalendarButton event={{
                      title: event.title,
                      description: event.description || '',
                      location: event.location || '',
                      startDate: event.startDate,
                      endDate: event.endDate || undefined
                    }} />
                  </div>
                </div>
              </div>

              {/* CTA nebo další info - nyní uvnitř sticky karty */}
              <div className="border-t border-stellar-white/10 pt-8">
                <h4 className="text-stellar-white font-bold mb-4 text-lg">Máte dotazy?</h4>
                <p className="text-stellar-white/70 text-sm mb-6 leading-relaxed">
                  Pokud vás k této události zajímá cokoliv dalšího, neváhejte nás kontaktovat na našich sociálních sítích nebo e-mailu.
                </p>
                <Link 
                  href="/o-nas#kontakt" 
                  className="text-aurora-cyan font-bold text-sm hover:underline flex items-center gap-2"
                >
                  Kontaktovat nás
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}

