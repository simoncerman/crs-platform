'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { cs } from 'date-fns/locale';
import { useSession } from 'next-auth/react';

interface Project {
  id: string;
  name: string;
  slug: string;
  category: string | null;
  status: 'planning' | 'development' | 'testing' | 'completed';
  published: boolean;
  isFeatured: boolean;
  createdAt: string;
}

export default function ProjectsListPage() {
  const { data: session } = useSession();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadProjects = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      
      const headers: HeadersInit = {};
      if (session?.accessToken) {
        headers['Authorization'] = `Bearer ${session.accessToken}`;
      }
      
      const response = await fetch(`${API_URL}/api/projects`, { headers });
      
      if (!response.ok) {
        throw new Error('Nepodařilo se načíst projekty');
      }

      const data = await response.json();
      setProjects(data.projects || []);
    } catch (err: any) {
      setError(err.message || 'Něco se pokazilo');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (session?.accessToken) {
      loadProjects();
    }
  }, [session]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Opravdu chcete smazat projekt "${name}"?`)) {
      return;
    }

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      
      if (!session?.accessToken) {
        throw new Error('Nejste přihlášen');
      }

      const response = await fetch(`${API_URL}/api/projects/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Nepodařilo se smazat projekt');
      }

      await loadProjects();
    } catch (err: any) {
      alert(err.message || 'Něco se pokazilo');
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      planning: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
      development: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
      testing: 'bg-purple-500/20 text-purple-400 border-purple-500/50',
      completed: 'bg-green-500/20 text-green-400 border-green-500/50',
    };
    
    const labels = {
      planning: 'Plánování',
      development: 'Vývoj',
      testing: 'Testování',
      completed: 'Dokončeno',
    };

    return (
      <span className={`px-2 py-1 rounded text-xs font-medium border ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-stellar-white text-xl">Načítání...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-stellar-white">Projekty</h1>
        <Link
          href="/admin/projects/new"
          className="bg-cosmic-blue/20 hover:bg-cosmic-blue/30 text-aurora-cyan border border-cosmic-blue/30 hover:border-aurora-cyan/50 font-semibold px-6 py-3 rounded-lg transition-all flex items-center gap-2"
        >
          <span className="text-xl">+</span>
          Nový projekt
        </Link>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 text-red-400">
          {error}
        </div>
      )}

      <div className="bg-deep-space/50 border border-stellar-white/10 rounded-xl overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="bg-stellar-white/5 text-stellar-white/70 text-sm uppercase tracking-wider">
              <th className="px-4 py-4 font-medium">Projekt</th>
              <th className="px-4 py-4 font-medium">Kategorie</th>
              <th className="px-4 py-4 font-medium">Status</th>
              <th className="px-4 py-4 font-medium">Vytvořeno</th>
              <th className="px-4 py-4 font-medium text-right">Akce</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stellar-white/10">
            {projects.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-stellar-white/50">
                  Zatím nebyly vytvořeny žádné projekty —{' '}
                  <Link href="/admin/projects/new" className="text-aurora-cyan hover:underline">vytvořit první</Link>
                </td>
              </tr>
            ) : (
              projects.map((project) => (
                <tr key={project.id} className="hover:bg-stellar-white/5 transition-colors group">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <Link href={`/admin/projects/edit/${project.id}`} className="text-stellar-white font-medium hover:text-aurora-cyan transition-colors">
                        {project.name}
                      </Link>
                      {project.isFeatured && (
                        <span className="px-2 py-1 rounded text-xs font-medium border bg-aurora-cyan/20 text-aurora-cyan border-aurora-cyan/50">
                          Vlajkový
                        </span>
                      )}
                      {!project.published && (
                        <span className="px-2 py-1 rounded text-xs font-medium border bg-stellar-white/10 text-stellar-white/40 border-stellar-white/20">
                          Skrytý
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 text-stellar-white/60 text-sm">{project.category || '—'}</td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    {getStatusBadge(project.status)}
                  </td>
                  <td className="px-4 py-4 text-stellar-white/60 text-sm whitespace-nowrap">
                    {format(new Date(project.createdAt), 'd. M. yyyy', { locale: cs })}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/admin/projects/edit/${project.id}`} className="text-aurora-cyan hover:text-white transition-colors text-sm">
                        Upravit
                      </Link>
                      <span className="text-stellar-white/20 mx-1">·</span>
                      <button
                        onClick={() => handleDelete(project.id, project.name)}
                        className="text-stellar-white/60 hover:text-red-400 transition-colors text-sm"
                      >
                        Smazat
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
