'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { cs } from 'date-fns/locale';
import { useSession } from 'next-auth/react';

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  coverImage?: string;
  status: 'draft' | 'published' | 'archived';
  publishedAt?: string;
  createdAt: string;
}

export default function ArticlesListPage() {
  const { data: session } = useSession();
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadArticles = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      
      // Add authentication token for admin access
      const headers: HeadersInit = {};
      if (session?.accessToken) {
        headers['Authorization'] = `Bearer ${session.accessToken}`;
      }
      
      const response = await fetch(`${API_URL}/api/articles`, { headers });
      
      if (!response.ok) {
        throw new Error('Nepodařilo se načíst články');
      }

      const data = await response.json();
      setArticles(data.articles || []);
    } catch (err: any) {
      setError(err.message || 'Něco se pokazilo');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (session?.accessToken) {
      loadArticles();
    }
  }, [session]);

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Opravdu chcete smazat článek "${title}"?`)) {
      return;
    }

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      
      if (!session?.accessToken) {
        throw new Error('Nejste přihlášen');
      }

      const response = await fetch(`${API_URL}/api/articles/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Nepodařilo se smazat článek');
      }

      // Reload articles after deletion
      await loadArticles();
    } catch (err: any) {
      alert(err.message || 'Něco se pokazilo');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-stellar-white text-xl">Načítání...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 text-red-400">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-stellar-white mb-2">
            Články
          </h1>
          <p className="text-stellar-white/70">
            Správa článků a aktualit
          </p>
        </div>
        <Link
          href="/admin/articles/new"
          className="bg-cosmic-blue/20 hover:bg-cosmic-blue/30 text-aurora-cyan border-2 border-cosmic-blue/30 hover:border-aurora-cyan/50 font-semibold px-6 py-3 rounded-lg transition-all flex items-center gap-2"
        >
          <span className="text-xl">+</span>
          Nový článek
        </Link>
      </div>

      {/* Seznam článků */}
      {articles.length === 0 ? (
        <div className="bg-deep-space/50 backdrop-blur-sm border-2 border-cosmic-blue/30 rounded-xl p-12 text-center">
          <p className="text-xl text-stellar-white/60 mb-4">
            Zatím nejsou žádné články
          </p>
          <Link
            href="/admin/articles/new"
            className="inline-block bg-aurora-cyan hover:bg-aurora-cyan/80 text-deep-space font-semibold px-6 py-3 rounded-lg transition-all"
          >
            Vytvořit první článek
          </Link>
        </div>
      ) : (
        <div className="bg-deep-space/50 border border-stellar-white/10 rounded-xl overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[640px]">
            <thead>
              <tr className="bg-stellar-white/5 text-stellar-white/70 text-sm uppercase tracking-wider">
                <th className="px-4 py-4 font-medium">Článek</th>
                <th className="px-4 py-4 font-medium">Datum</th>
                <th className="px-4 py-4 font-medium">Status</th>
                <th className="px-4 py-4 font-medium text-right">Akce</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stellar-white/10">
              {articles.map((article) => {
                const isFuture = article.publishedAt && new Date(article.publishedAt) > new Date();

                return (
                  <tr key={article.id} className="hover:bg-stellar-white/5 transition-colors group">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        {article.coverImage && (
                          <div className="w-10 h-10 rounded overflow-hidden shrink-0">
                            <img src={article.coverImage} alt="" className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <Link
                            href={`/admin/articles/edit/${article.id}`}
                            className="text-stellar-white font-medium hover:text-aurora-cyan transition-colors truncate block"
                          >
                            {article.title}
                          </Link>
                          {article.excerpt && (
                            <p className="text-stellar-white/40 text-xs truncate max-w-md">{article.excerpt}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-stellar-white/60 text-sm whitespace-nowrap">
                      {article.publishedAt
                        ? format(new Date(article.publishedAt), 'd. M. yyyy', { locale: cs })
                        : '—'}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium border ${
                          article.status === 'draft'
                            ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
                            : article.status === 'archived'
                            ? 'bg-red-500/20 text-red-400 border-red-500/50'
                            : isFuture
                            ? 'bg-blue-500/20 text-blue-400 border-blue-500/50'
                            : 'bg-green-500/20 text-green-400 border-green-500/50'
                        }`}
                      >
                        {article.status === 'draft'
                          ? 'Koncept'
                          : article.status === 'archived'
                          ? 'Archiv'
                          : isFuture
                          ? 'Naplánováno'
                          : 'Publikováno'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/admin/articles/edit/${article.id}`}
                          className="text-aurora-cyan hover:text-white transition-colors text-sm"
                        >
                          Upravit
                        </Link>
                        <span className="text-stellar-white/20 mx-1">·</span>
                        <Link
                          href={`/admin/articles/preview/${article.id}`}
                          className="text-stellar-white/60 hover:text-aurora-cyan transition-colors text-sm"
                        >
                          Náhled
                        </Link>
                        <span className="text-stellar-white/20 mx-1">·</span>
                        <button
                          onClick={() => handleDelete(article.id, article.title)}
                          className="text-stellar-white/60 hover:text-red-400 transition-colors text-sm"
                        >
                          Smazat
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
