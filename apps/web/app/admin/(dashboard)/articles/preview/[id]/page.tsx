'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { format } from 'date-fns';
import { cs } from 'date-fns/locale';
import { adminFetch } from '@/lib/admin-fetch';
import ImageGallery from '@/components/ui/ImageGallery';

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  coverImage: string | null;
  images?: string[];
  status: 'draft' | 'published' | 'archived';
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function ArticlePreviewPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [article, setArticle] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const id = params.id as string;
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  useEffect(() => {
    if (!session?.accessToken) return;

    const loadArticle = async () => {
      try {
        const response = await adminFetch(`${API_URL}/api/articles/${id}`, {
          accessToken: session.accessToken,
        });

        if (!response.ok) throw new Error('Článek nenalezen');

        const data = await response.json();
        setArticle(data.article);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadArticle();
  }, [id, session]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-stellar-white text-xl">Načítání náhledu...</div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="space-y-6">
        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 text-red-400">
          {error || 'Článek nenalezen'}
        </div>
        <button onClick={() => router.back()} className="text-aurora-cyan hover:underline">
          ← Zpět
        </button>
      </div>
    );
  }

  const imageUrl = article.coverImage
    ? article.coverImage.startsWith('http')
      ? article.coverImage
      : `${API_URL}${article.coverImage}`
    : null;

  const publishedDate = article.publishedAt
    ? format(new Date(article.publishedAt), 'd. MMMM yyyy', { locale: cs })
    : null;

  const publishedFull = article.publishedAt
    ? format(new Date(article.publishedAt), "d. MMMM yyyy 'v' HH:mm", { locale: cs })
    : format(new Date(article.createdAt), "d. MMMM yyyy 'v' HH:mm", { locale: cs });

  const isFuture = article.publishedAt && new Date(article.publishedAt) > new Date();

  const statusLabel =
    article.status === 'draft'
      ? 'Koncept'
      : article.status === 'archived'
      ? 'Archivováno'
      : isFuture
      ? 'Naplánováno'
      : 'Publikováno';

  const statusColor =
    article.status === 'draft'
      ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      : article.status === 'archived'
      ? 'bg-red-500/20 text-red-400 border-red-500/30'
      : isFuture
      ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      : 'bg-green-500/20 text-green-400 border-green-500/30';

  return (
    <div className="-m-8">
      {/* Admin toolbar */}
      <div className="sticky top-0 z-50 bg-deep-space/95 backdrop-blur-md border-b border-aurora-cyan/20">
        <div className="container mx-auto px-4 sm:px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="flex items-center gap-2 text-stellar-white/70 hover:text-stellar-white transition-colors text-sm"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Zpět
              </button>
              <div className="w-px h-5 bg-stellar-white/20" />
              <span className="text-stellar-white/50 text-sm">Náhled článku</span>
              <span className={`px-2.5 py-0.5 rounded-md text-xs font-medium border ${statusColor}`}>
                {statusLabel}
              </span>
              {isFuture && article.publishedAt && (
                <span className="text-blue-400/70 text-xs">
                  Publikuje se {format(new Date(article.publishedAt), "d. M. yyyy 'v' HH:mm", { locale: cs })}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Link
                href={`/admin/articles/edit/${article.id}`}
                className="flex items-center gap-2 bg-cosmic-blue/20 hover:bg-cosmic-blue/30 text-aurora-cyan px-4 py-2 rounded-lg transition-colors text-sm border border-cosmic-blue/30"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Upravit
              </Link>
              <Link
                href="/admin/articles"
                className="flex items-center gap-2 bg-deep-space/50 hover:bg-deep-space text-stellar-white/70 hover:text-stellar-white px-4 py-2 rounded-lg transition-colors text-sm border border-cosmic-blue/30"
              >
                Všechny články
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Article preview — renders same as public page */}
      <div className="bg-deep-space">
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
              <div className="w-24 h-24 rounded-full bg-stellar-white/5 flex items-center justify-center">
                <span className="text-4xl opacity-20">📄</span>
              </div>
            </div>
          )}

          {/* Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-deep-space via-deep-space/60 to-deep-space/20" />

          {/* Title area */}
          <div className="absolute bottom-0 left-0 right-0 pb-8 sm:pb-12">
            <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-0.5 bg-aurora-cyan rounded-full" />
                {publishedDate && (
                  <time className="text-xs font-accent uppercase tracking-widest text-aurora-cyan/80">
                    {publishedDate}
                  </time>
                )}
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
                <p>Publikováno: <time>{publishedFull}</time></p>
                <div className="flex items-center gap-3">
                  <Link
                    href={`/admin/articles/edit/${article.id}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-aurora-cyan/20 bg-aurora-cyan/5 text-aurora-cyan/80 hover:text-aurora-cyan hover:border-aurora-cyan/40 transition-all text-sm"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Upravit článek
                  </Link>
                  <Link
                    href="/admin/articles"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-stellar-white/10 bg-stellar-white/[0.03] text-stellar-white/70 hover:text-stellar-white hover:border-aurora-cyan/30 transition-all text-sm"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Zpět na články
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
