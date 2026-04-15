import { getArticleBySlug, getArticles, API_URL } from '@/lib/api';

export const dynamic = 'force-dynamic';
import { format } from 'date-fns';
import { cs } from 'date-fns/locale';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import ImageGallery from '@/components/ui/ImageGallery';
import { PageTransition } from '../../components/PageTransition';

export async function generateStaticParams() {
  try {
    const articles = await getArticles({ status: 'published' });
    return articles.map((article) => ({
      slug: article.slug,
    }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article) {
    return {
      title: 'Článek nenalezen | Czech Rocket Society',
    };
  }

  return {
    title: `${article.title} | Czech Rocket Society`,
    description: article.excerpt || article.content.substring(0, 160),
  };
}

export default async function ArticleDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);

  if (!article || article.status !== 'published') {
    notFound();
  }

  const imageUrl = article.coverImage
    ? article.coverImage.startsWith('http')
      ? article.coverImage
      : `${API_URL}${article.coverImage}`
    : null;

  const publishedDate = article.publishedAt
    ? format(new Date(article.publishedAt), 'd. MMMM yyyy', { locale: cs })
    : format(new Date(article.createdAt), 'd. MMMM yyyy', { locale: cs });

  const publishedFull = article.publishedAt
    ? format(new Date(article.publishedAt), "d. MMMM yyyy 'v' HH:mm", { locale: cs })
    : format(new Date(article.createdAt), "d. MMMM yyyy 'v' HH:mm", { locale: cs });

  const updatedFull =
    article.updatedAt !== article.createdAt
      ? format(new Date(article.updatedAt), "d. MMMM yyyy 'v' HH:mm", { locale: cs })
      : null;

  return (
    <PageTransition className="min-h-screen bg-deep-space">
      {/* Hero with cover image */}
      <div className="relative h-[45vh] sm:h-[50vh] min-h-[340px] w-full overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={article.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-b from-crs-base/20 via-cosmic-blue/20 to-deep-space flex items-center justify-center">
            <img src="/images/crs-logo-white.png" alt="CRS" className="w-24 h-24 opacity-10" />
          </div>
        )}

        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-deep-space via-deep-space/60 to-deep-space/20" />

        {/* Back link */}
        <div className="absolute top-24 sm:top-28 left-0 right-0">
          <div className="container mx-auto px-4 sm:px-6">
            <Link
              href="/aktuality"
              className="inline-flex items-center text-stellar-white/70 hover:text-stellar-white transition-colors text-sm backdrop-blur-sm bg-stellar-white/5 border border-stellar-white/10 rounded-full px-4 py-2"
            >
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Aktuality
            </Link>
          </div>
        </div>

        {/* Title area */}
        <div className="absolute bottom-0 left-0 right-0 pb-8 sm:pb-12">
          <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-0.5 bg-aurora-cyan rounded-full" />
              <time className="text-xs font-accent uppercase tracking-widest text-aurora-cyan/80">
                {publishedDate}
              </time>
            </div>
            <h1
              className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-stellar-white max-w-3xl leading-tight"
              style={{ textShadow: '0 2px 20px rgba(0, 0, 0, 0.5)' }}
            >
              {article.title}
            </h1>
          </div>
        </div>
      </div>

      {/* Article content */}
      <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="max-w-3xl mx-auto">
          {/* Excerpt / lead */}
          {article.excerpt && (
            <div className="mb-10 relative pl-6 border-l-2 border-aurora-cyan/40">
              <p className="text-lg sm:text-xl text-stellar-white/70 leading-relaxed italic">
                {article.excerpt}
              </p>
            </div>
          )}

          {/* Content */}
          <div
            className="article-content max-w-none"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          {/* Image Gallery */}
          {article.images && article.images.length > 0 && (
            <div className="mt-16">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-0.5 bg-aurora-cyan rounded-full" />
                <h2 className="font-heading text-xl font-bold text-stellar-white">Galerie</h2>
              </div>
              <ImageGallery images={article.images} alt={article.title} />
            </div>
          )}

          {/* Footer metadata */}
          <div className="mt-16 pt-8 border-t border-stellar-white/10">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-stellar-white/40 text-sm">
              <div className="space-y-1">
                <p>Publikováno: <time>{publishedFull}</time></p>
                {updatedFull && (
                  <p>Aktualizováno: <time>{updatedFull}</time></p>
                )}
              </div>
              <Link
                href="/aktuality"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-stellar-white/10 bg-stellar-white/[0.03] text-stellar-white/70 hover:text-stellar-white hover:border-aurora-cyan/30 transition-all text-sm"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Zpět na aktuality
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
