import { getProjects, API_URL } from '@/lib/api';
import { format } from 'date-fns';
import { cs } from 'date-fns/locale';
import Link from 'next/link';
import { BlueprintDrawing } from '../components/EmptyStates';
import { PageTransition } from '../components/PageTransition';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Projekty | Czech Rocket Society',
  description: 'Naše raketové projekty a jejich vývoj',
};

const statusLabels = {
  planning: 'Plánování',
  development: 'Vývoj',
  testing: 'Testování',
  completed: 'Dokončeno',
  'on-hold': 'Pozastaveno',
};

const statusColors = {
  planning: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
  development: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
  testing: 'bg-purple-500/20 text-purple-400 border-purple-500/50',
  completed: 'bg-green-500/20 text-green-400 border-green-500/50',
  'on-hold': 'bg-stellar-white/20 text-stellar-white border-stellar-white/50',
};

export default async function ProjektyPage() {
  const projects = await getProjects();

  // Rozdělit projekty na vlajkové a běžné
  const featuredProjects = projects.filter(p => p.isFeatured && p.published);
  const regularProjects = projects.filter(p => !p.isFeatured && p.published).sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <PageTransition className="min-h-screen bg-cosmic-black">
      {/* Hero sekce */}
      <div className="relative overflow-hidden bg-gradient-to-b from-deep-space via-cosmic-black to-cosmic-black">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cosmic-blue/20 via-transparent to-transparent" />
        
        <div className="container mx-auto px-4 pt-24 pb-12 relative">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold text-stellar-white mb-6">
            Naše projekty
          </h1>
          <p className="text-xl text-stellar-white/80 max-w-2xl">
            Přehled raketových projektů, jejich vývoje a dosažených milníků
          </p>
        </div>
      </div>

      {/* Seznam projektů */}
      <div className="container mx-auto px-4 pt-8 pb-16">
        {projects.length === 0 ? (
          <BlueprintDrawing />
        ) : (
          <div className="space-y-16">
            {/* Vlajkové projekty (Velké) */}
            {featuredProjects.length > 0 && (
              <div className="space-y-12">
                {featuredProjects.map((project) => (
                  <Link
                    key={project.id}
                    href={`/projekty/${project.slug}`}
                    className="group block"
                  >
                    <article className="relative h-[70vh] min-h-[500px] w-full overflow-hidden rounded-3xl border border-cosmic-blue/20 shadow-2xl">
                      {/* Obrázek na pozadí */}
                      {project.coverImage && (
                        <img
                          src={project.coverImage.startsWith('http') ? project.coverImage : `${API_URL}${project.coverImage}`}
                          alt={project.name}
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                      )}
                      
                      {/* Gradient overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-cosmic-black via-cosmic-black/60 to-transparent" />
                      
                      {/* Obsah */}
                      <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-8 md:p-16">
                        <div className="max-w-4xl">
                          <div className="flex flex-wrap items-center gap-4 mb-6">
                            <span className={`px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider border backdrop-blur-md ${statusColors[project.status as keyof typeof statusColors]}`}>
                              {statusLabels[project.status as keyof typeof statusLabels]}
                            </span>
                            {project.category && (
                              <span className="px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider border border-stellar-white/30 bg-stellar-white/10 text-stellar-white backdrop-blur-md">
                                {project.category}
                              </span>
                            )}
                            <span className="px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider border border-aurora-cyan/50 bg-aurora-cyan/10 text-aurora-cyan backdrop-blur-md">
                              Vlajkový projekt
                            </span>
                          </div>
                          
                          <h2 className="text-3xl sm:text-5xl md:text-7xl font-bold text-stellar-white mb-6 group-hover:text-aurora-cyan transition-colors">
                            {project.name}
                          </h2>
                          
                          <p className="text-xl text-stellar-white/90 mb-8 line-clamp-3 max-w-2xl">
                            {project.description}
                          </p>
                          
                          {/* Parametry */}
                          {project.specs && (
                            <div className="flex flex-wrap gap-x-12 gap-y-6 mb-10">
                              {Object.entries(project.specs).slice(0, 4).map(([key, value]) => (
                                <div key={key}>
                                  <div className="text-stellar-white/50 text-xs uppercase tracking-widest mb-1">{key}</div>
                                  <div className="text-stellar-white text-2xl font-bold">{value as string}</div>
                                </div>
                              ))}
                            </div>
                          )}
                          
                          <div className="inline-flex items-center text-aurora-cyan font-bold text-lg group-hover:translate-x-2 transition-transform">
                            Detail projektu <span className="ml-2">→</span>
                          </div>
                        </div>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            )}

            {/* Běžné projekty (Mřížka) */}
            {regularProjects.length > 0 && (
              <div>
                {featuredProjects.length > 0 && (
                  <h3 className="text-3xl font-bold text-stellar-white mb-8">Další projekty</h3>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {regularProjects.map((project) => (
                    <Link
                      key={project.id}
                      href={`/projekty/${project.slug}`}
                      className="group block"
                    >
                      <article className="h-full bg-deep-space/50 backdrop-blur-sm border border-cosmic-blue/20 rounded-xl overflow-hidden hover:border-cosmic-blue/50 transition-all duration-300 hover:transform hover:scale-[1.02]">
                        {/* Obrázek */}
                        <div className="relative h-48 w-full overflow-hidden">
                          {project.coverImage ? (
                            <img
                              src={project.coverImage.startsWith('http') ? project.coverImage : `${API_URL}${project.coverImage}`}
                              alt={project.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                          ) : (
                            <div className="absolute inset-0 bg-gradient-to-br from-cosmic-blue/20 to-deep-space flex items-center justify-center">
                              <svg
                                className="w-16 h-16 text-cosmic-blue/40"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M13 10V3L4 14h7v7l9-11h-7z"
                                />
                              </svg>
                            </div>
                          )}
                          
                          {/* Category badge */}
                          <div className="absolute top-3 left-3">
                            {project.category && (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border border-stellar-white/30 bg-stellar-white/10 text-stellar-white backdrop-blur-sm">
                                {project.category}
                              </span>
                            )}
                          </div>

                          {/* Status badge */}
                          <div className="absolute top-3 right-3">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border backdrop-blur-sm ${statusColors[project.status as keyof typeof statusColors]}`}
                            >
                              {statusLabels[project.status as keyof typeof statusLabels]}
                            </span>
                          </div>
                        </div>

                        {/* Obsah */}
                        <div className="p-6">
                          <h2 className="text-xl font-bold text-stellar-white mb-2 group-hover:text-aurora-cyan transition-colors">
                            {project.name}
                          </h2>
                          {project.description && (
                            <p className="text-stellar-white/70 text-sm line-clamp-2 mb-4">
                              {project.description}
                            </p>
                          )}
                          <div className="text-aurora-cyan text-sm font-bold">
                            Zobrazit více →
                          </div>
                        </div>
                      </article>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </PageTransition>
  );
}
