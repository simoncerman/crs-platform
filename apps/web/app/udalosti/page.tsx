import { getEvents, getEventDisplayStatus, type EventDisplayStatus } from '@/lib/api';
import { format } from 'date-fns';
import { cs } from 'date-fns/locale';
import Link from 'next/link';
import Image from 'next/image';
import { RocketOnPad } from '../components/EmptyStates';
import { PageTransition } from '../components/PageTransition';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Události | Czech Rocket Society',
  description: 'Nadcházející a proběhlé události Czech Rocket Society',
};

const statusLabels: Record<EventDisplayStatus, string> = {
  upcoming: 'Nadcházející',
  ongoing: 'Právě probíhá',
  past: 'Proběhlo',
  cancelled: 'Zrušeno',
  postponed: 'Odloženo',
};

const statusColors: Record<EventDisplayStatus, string> = {
  upcoming: 'bg-aurora-cyan/10 text-aurora-cyan border-aurora-cyan/30',
  ongoing: 'bg-green-500/10 text-green-400 border-green-500/30',
  past: 'bg-stellar-white/10 text-stellar-white/60 border-stellar-white/20',
  cancelled: 'bg-red-500/10 text-red-400 border-red-500/30',
  postponed: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
};

const eventTypeLabels = {
  launch: 'Start rakety',
  test: 'Testovací kampaň',
  recruitment: 'Nábor',
  pr: 'PR akce',
  event: 'Událost',
};

const eventTypeColors = {
  launch: 'bg-crs-ignition/20 text-crs-ignition border-crs-ignition/50 shadow-[0_0_15px_rgba(243,182,0,0.3)]',
  test: 'bg-aurora-cyan/20 text-aurora-cyan border-aurora-cyan/40',
  recruitment: 'bg-purple-500/20 text-purple-400 border-purple-500/40',
  pr: 'bg-pink-500/20 text-pink-400 border-pink-500/40',
  event: 'bg-stellar-white/10 text-stellar-white/70 border-stellar-white/20',
};

export default async function UdalostiPage() {
  const allEvents = await getEvents();
  
  // Filtrovat pouze publikované události a seřadit podle data
  const sortedEvents = allEvents
    .filter(event => event.published)
    .sort((a, b) => 
      new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    );

  // Pomocná funkce pro odstranění HTML tagů z popisu
  const stripHtml = (html: string) => {
    return html.replace(/<[^>]*>?/gm, '');
  };

  return (
    <PageTransition className="min-h-screen bg-cosmic-black">
      {/* Hero sekce */}
      <div className="relative overflow-hidden bg-gradient-to-b from-deep-space via-cosmic-black to-cosmic-black">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cosmic-blue/20 via-transparent to-transparent" />

        <div className="container mx-auto px-4 pt-24 pb-12 relative">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold text-stellar-white mb-6">
            Události
          </h1>
          <p className="text-xl text-stellar-white/80 max-w-2xl">
            Přehled nadcházejících i proběhlých akcí, testů a společných aktivit
          </p>
        </div>
      </div>

      {/* Seznam událostí */}
      <div className="container mx-auto px-4 pt-8 pb-16">
        {sortedEvents.length === 0 ? (
          <RocketOnPad />
        ) : (
          <div className="space-y-8">
            {sortedEvents.map((event) => (
              <Link
                key={event.id}
                href={`/udalosti/${event.slug}`}
                className="group block"
              >
                <article className="bg-deep-space/50 backdrop-blur-sm border border-cosmic-blue/20 rounded-xl overflow-hidden hover:border-cosmic-blue/50 transition-all duration-300 hover:transform hover:scale-[1.01]">
                  <div className="md:flex">
                    {/* Obrázek */}
                    <div className="md:w-1/3 relative h-64 md:h-auto bg-cosmic-black/40">
                      {event.coverImage ? (
                        <img
                          src={event.coverImage.startsWith('http') ? event.coverImage : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}${event.coverImage}`}
                          alt={event.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-cosmic-blue/10 to-deep-space flex items-center justify-center">
                          <svg
                            className="w-20 h-20 text-cosmic-blue/40"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Obsah */}
                    <div className="md:w-2/3 p-6 md:p-8 flex flex-col justify-center">
                      {/* Status badge */}
                      <div className="flex flex-wrap items-center gap-3 mb-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${statusColors[getEventDisplayStatus(event)]}`}
                        >
                          {statusLabels[getEventDisplayStatus(event)]}
                        </span>
                        {event.eventType && (
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border flex items-center gap-1.5 ${eventTypeColors[event.eventType as keyof typeof eventTypeColors] || eventTypeColors.event}`}
                          >
                            {event.eventType === 'launch' && (
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12,2L4.5,20.29L5.21,21L12,18L18.79,21L19.5,20.29L12,2Z" />
                              </svg>
                            )}
                            {eventTypeLabels[event.eventType as keyof typeof eventTypeLabels] || 'Událost'}
                          </span>
                        )}
                      </div>

                      {/* Nadpis */}
                      <h2 className="text-2xl md:text-3xl font-bold text-stellar-white mb-3 group-hover:text-aurora-cyan transition-colors duration-300">
                        {event.title}
                      </h2>

                      {/* Datum a lokace */}
                      <div className="flex flex-wrap gap-y-2 gap-x-6 mb-6 text-stellar-white/60 text-sm">
                        <div className="flex items-center">
                          <svg
                            className="w-4 h-4 mr-2 text-aurora-cyan"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                          <span>
                            {format(new Date(event.startDate), 'd. MMMM yyyy', { locale: cs })}
                            {event.endDate && ` — ${format(new Date(event.endDate), 'd. MMMM yyyy', { locale: cs })}`}
                          </span>
                        </div>
                        {event.location && (
                          <div className="flex items-center">
                            <svg
                              className="w-4 h-4 mr-2 text-aurora-cyan"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                            <span>{event.location}</span>
                          </div>
                        )}
                      </div>

                      {/* Popis */}
                      {event.description && (
                        <p className="text-stellar-white/70 line-clamp-2 mb-6 text-base leading-relaxed">
                          {stripHtml(event.description)}
                        </p>
                      )}

                      {/* Číst více */}
                      <div className="flex items-center text-aurora-cyan group-hover:text-stellar-white transition-colors font-semibold text-sm uppercase tracking-widest">
                        <span>Zobrazit detail</span>
                        <svg
                          className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform duration-300"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 7l5 5m0 0l-5 5m5-5H6"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </div>
    </PageTransition>
  );
}
