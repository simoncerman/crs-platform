import { getProjectBySlug, getProjects, API_URL } from '@/lib/api';

export const dynamic = 'force-dynamic';
import { format } from 'date-fns';
import { cs } from 'date-fns/locale';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import ImageGallery from '@/components/ui/ImageGallery';
import { PageTransition } from '../../components/PageTransition';

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

export async function generateStaticParams() {
  try {
    const projects = await getProjects();
    return projects.map((project) => ({
      slug: project.slug,
    }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  
  if (!project) {
    return {
      title: 'Projekt nenalezen | Czech Rocket Society',
    };
  }

  return {
    title: `${project.name} | Czech Rocket Society`,
    description: project.description || `Projekt: ${project.name}`,
  };
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project) {
    notFound();
  }

  return (
    <PageTransition className="min-h-screen bg-cosmic-black">
      {/* Hero sekce s obrázkem */}
      <div className="relative h-[60vh] min-h-[500px] w-full overflow-hidden">
        {project.coverImage ? (
          <img
            src={project.coverImage.startsWith('http') ? project.coverImage : `${API_URL}${project.coverImage}`}
            alt={project.name}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-b from-cosmic-blue/30 via-deep-space to-cosmic-black" />
        )}
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-cosmic-black via-cosmic-black/50 to-transparent" />

        {/* Breadcrumb a zpět */}
        <div className="absolute top-8 left-0 right-0">
          <div className="container mx-auto px-4">
            <Link
              href="/projekty"
              className="inline-flex items-center text-stellar-white/80 hover:text-stellar-white transition-colors"
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
              Zpět na projekty
            </Link>
          </div>
        </div>

        {/* Nadpis a status */}
        <div className="absolute bottom-0 left-0 right-0 pb-12">
          <div className="container mx-auto px-4">
            <div className="mb-4 flex flex-wrap gap-3">
              <span
                className={`inline-block px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider border backdrop-blur-sm ${statusColors[project.status as keyof typeof statusColors]}`}
              >
                {statusLabels[project.status as keyof typeof statusLabels]}
              </span>
              {project.category && (
                <span className="px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider border border-stellar-white/30 bg-stellar-white/10 text-stellar-white backdrop-blur-sm">
                  {project.category}
                </span>
              )}
              {project.isFeatured && (
                <span className="px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider border border-aurora-cyan/50 bg-aurora-cyan/10 text-aurora-cyan backdrop-blur-sm">
                  Vlajkový projekt
                </span>
              )}
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold text-stellar-white mt-4 max-w-4xl">
              {project.name}
            </h1>
          </div>
        </div>
      </div>

      {/* Obsah projektu */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-5xl mx-auto">
          {/* Metadata grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {project.startDate && (
              <div className="p-6 bg-deep-space/50 backdrop-blur-sm border border-cosmic-blue/20 rounded-xl">
                <div className="flex items-center mb-2">
                  <svg
                    className="w-5 h-5 mr-2 text-aurora-cyan"
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
                  <span className="text-stellar-white/60 text-sm uppercase tracking-widest">Zahájení</span>
                </div>
                <p className="text-stellar-white text-xl font-bold">
                  {format(new Date(project.startDate), 'MMMM yyyy', { locale: cs })}
                </p>
              </div>
            )}

            {project.completionDate && (
              <div className="p-6 bg-deep-space/50 backdrop-blur-sm border border-cosmic-blue/20 rounded-xl">
                <div className="flex items-center mb-2">
                  <svg
                    className="w-5 h-5 mr-2 text-aurora-cyan"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="text-stellar-white/60 text-sm uppercase tracking-widest">Dokončení</span>
                </div>
                <p className="text-stellar-white text-xl font-bold">
                  {format(new Date(project.completionDate), 'MMMM yyyy', { locale: cs })}
                </p>
              </div>
            )}
          </div>

          {/* Technické specifikace */}
          {project.specs && Object.keys(project.specs).length > 0 && (
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-stellar-white mb-8 flex items-center">
                <span className="w-10 h-10 rounded-xl bg-aurora-cyan/20 text-aurora-cyan flex items-center justify-center mr-4">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                  </svg>
                </span>
                Technické specifikace
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                {Object.entries(project.specs).map(([key, value]) => (
                  <div key={key} className="p-6 bg-deep-space/30 border border-cosmic-blue/10 rounded-xl hover:border-aurora-cyan/30 transition-colors">
                    <div className="text-stellar-white/50 text-xs uppercase tracking-widest mb-2">{key}</div>
                    <div className="text-stellar-white text-2xl font-bold">{value as string}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Popis projektu */}
          {project.description && (
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-stellar-white mb-8 flex items-center">
                <span className="w-10 h-10 rounded-xl bg-aurora-cyan/20 text-aurora-cyan flex items-center justify-center mr-4">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </span>
                O projektu
              </h2>
              <div className="p-8 bg-deep-space/30 backdrop-blur-sm border border-cosmic-blue/10 rounded-2xl">
                <div 
                  className="article-content max-w-none"
                  dangerouslySetInnerHTML={{ __html: project.description }}
                />
              </div>
            </div>
          )}

          {/* Galerie obrázků */}
          {project.images && project.images.length > 0 && (
            <div className="mb-16">
              <h2 className="text-3xl font-bold text-stellar-white mb-8 flex items-center">
                <span className="w-10 h-10 rounded-xl bg-aurora-cyan/20 text-aurora-cyan flex items-center justify-center mr-4">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </span>
                Galerie
              </h2>
              <ImageGallery images={project.images} alt={project.name} />
            </div>
          )}

          {/* Navigace zpět */}
          <div className="mt-16 pt-8 border-t border-cosmic-blue/10">
            <Link
              href="/projekty"
              className="inline-flex items-center px-8 py-4 bg-cosmic-blue/10 hover:bg-cosmic-blue/20 text-stellar-white rounded-xl transition-all border border-cosmic-blue/30 hover:border-aurora-cyan/50 group"
            >
              <svg
                className="w-5 h-5 mr-3 group-hover:-translate-x-1 transition-transform"
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
              Zpět na přehled projektů
            </Link>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
