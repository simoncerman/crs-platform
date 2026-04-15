import Link from 'next/link';
import { getArticles, getEvents, getMembers, getProjects, getEventDisplayStatus } from '@/lib/api';
import { format } from 'date-fns';
import { cs } from 'date-fns/locale';

export const dynamic = 'force-dynamic';

const quickActions = [
  {
    label: 'Nový článek',
    href: '/admin/articles/new',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
    color: 'from-aurora-cyan/20 to-aurora-cyan/5 border-aurora-cyan/30 hover:border-aurora-cyan/60',
    textColor: 'text-aurora-cyan',
  },
  {
    label: 'Nová událost',
    href: '/admin/events/new',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" />
      </svg>
    ),
    color: 'from-aurora-blue/20 to-aurora-blue/5 border-aurora-blue/30 hover:border-aurora-blue/60',
    textColor: 'text-aurora-blue',
  },
  {
    label: 'Nový člen',
    href: '/admin/members/new',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM3 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 018.124 21c-2.331 0-4.512-.645-6.374-1.766z" />
      </svg>
    ),
    color: 'from-green-400/20 to-green-400/5 border-green-400/30 hover:border-green-400/60',
    textColor: 'text-green-400',
  },
  {
    label: 'Nový projekt',
    href: '/admin/projects/new',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.58-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
      </svg>
    ),
    color: 'from-yellow-400/20 to-yellow-400/5 border-yellow-400/30 hover:border-yellow-400/60',
    textColor: 'text-yellow-400',
  },
  {
    label: 'Nový partner',
    href: '/admin/partners/new',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
      </svg>
    ),
    color: 'from-purple-400/20 to-purple-400/5 border-purple-400/30 hover:border-purple-400/60',
    textColor: 'text-purple-400',
  },
  {
    label: 'Knihovna médií',
    href: '/admin/media',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a2.25 2.25 0 002.25-2.25V5.25a2.25 2.25 0 00-2.25-2.25H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
      </svg>
    ),
    color: 'from-pink-400/20 to-pink-400/5 border-pink-400/30 hover:border-pink-400/60',
    textColor: 'text-pink-400',
  },
];

export default async function DashboardPage() {
  const [articles, events, members, projects] = await Promise.all([
    getArticles(),
    getEvents(),
    getMembers(),
    getProjects(),
  ]);

  const recentArticles = articles.slice(0, 5);
  const upcomingEvents = events
    .filter(e => {
      const ds = getEventDisplayStatus(e);
      return ds === 'upcoming' || ds === 'ongoing';
    })
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
    .slice(0, 5);

  const statsInline = [
    { label: 'Článků', value: articles.length, color: 'text-aurora-cyan' },
    { label: 'Událostí', value: events.length, color: 'text-aurora-blue' },
    { label: 'Členů', value: members.filter(m => m.active).length, color: 'text-green-400' },
    { label: 'Projektů', value: projects.length, color: 'text-yellow-400' },
  ];

  return (
    <div className="space-y-8">
      {/* Header se statistikami */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-stellar-white mb-2">
            Dashboard
          </h1>
          <p className="text-stellar-white/50">
            Správa obsahu Czech Rocket Society
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          {statsInline.map((s) => (
            <div key={s.label} className="text-center">
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-stellar-white/40">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Rychlé akce */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {quickActions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className={`group flex flex-col items-center gap-3 p-5 rounded-xl border bg-gradient-to-b transition-all ${action.color}`}
          >
            <div className={`${action.textColor} group-hover:scale-110 transition-transform`}>
              {action.icon}
            </div>
            <span className="text-stellar-white/80 group-hover:text-stellar-white text-sm font-medium text-center transition-colors">
              {action.label}
            </span>
          </Link>
        ))}
      </div>

      {/* Poslední články a nadcházející události */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Poslední články */}
        <div className="bg-deep-space/50 backdrop-blur-sm border border-cosmic-blue/30 rounded-xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-stellar-white flex items-center gap-2">
              <svg className="w-5 h-5 text-aurora-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" />
              </svg>
              Poslední články
            </h2>
            <Link href="/admin/articles" className="text-xs text-stellar-white/40 hover:text-aurora-cyan transition-colors">
              Zobrazit vše →
            </Link>
          </div>
          <div className="space-y-2">
            {recentArticles.length === 0 ? (
              <p className="text-stellar-white/40 text-sm py-4 text-center">
                Žádné články —{' '}
                <Link href="/admin/articles/new" className="text-aurora-cyan hover:underline">vytvořit první</Link>
              </p>
            ) : (
              recentArticles.map((article) => (
                <Link
                  key={article.id}
                  href={`/admin/articles/edit/${article.id}`}
                  className="flex items-center justify-between gap-3 p-3 rounded-lg hover:bg-stellar-white/5 transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="text-stellar-white/90 group-hover:text-stellar-white text-sm font-medium truncate transition-colors">
                      {article.title}
                    </h3>
                    <span className="text-xs text-stellar-white/40">
                      {article.publishedAt
                        ? format(new Date(article.publishedAt), 'd. MMM yyyy', { locale: cs })
                        : format(new Date(article.createdAt), 'd. MMM yyyy', { locale: cs })}
                    </span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-medium shrink-0 ${
                      article.status === 'published'
                        ? 'bg-green-500/15 text-green-400'
                        : 'bg-yellow-500/15 text-yellow-400'
                    }`}
                  >
                    {article.status === 'published' ? 'Pub' : 'Draft'}
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Nadcházející události */}
        <div className="bg-deep-space/50 backdrop-blur-sm border border-cosmic-blue/30 rounded-xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-stellar-white flex items-center gap-2">
              <svg className="w-5 h-5 text-aurora-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
              Nadcházející události
            </h2>
            <Link href="/admin/events" className="text-xs text-stellar-white/40 hover:text-aurora-cyan transition-colors">
              Zobrazit vše →
            </Link>
          </div>
          <div className="space-y-2">
            {upcomingEvents.length === 0 ? (
              <p className="text-stellar-white/40 text-sm py-4 text-center">
                Žádné nadcházející události —{' '}
                <Link href="/admin/events/new" className="text-aurora-cyan hover:underline">vytvořit novou</Link>
              </p>
            ) : (
              upcomingEvents.map((event) => (
                <Link
                  key={event.id}
                  href={`/admin/events/edit/${event.id}`}
                  className="flex items-center justify-between gap-3 p-3 rounded-lg hover:bg-stellar-white/5 transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="text-stellar-white/90 group-hover:text-stellar-white text-sm font-medium truncate transition-colors">
                      {event.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-stellar-white/40">
                      <span className="text-aurora-blue">
                        {format(new Date(event.startDate), 'd. MMM yyyy', { locale: cs })}
                      </span>
                      {event.location && (
                        <>
                          <span className="text-stellar-white/20">·</span>
                          <span className="truncate">{event.location}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-medium shrink-0 ${
                      getEventDisplayStatus(event) === 'ongoing'
                        ? 'bg-aurora-cyan/15 text-aurora-cyan'
                        : 'bg-aurora-blue/15 text-aurora-blue'
                    }`}
                  >
                    {getEventDisplayStatus(event) === 'ongoing' ? 'Probíhá' : 'Nadchází'}
                  </span>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
