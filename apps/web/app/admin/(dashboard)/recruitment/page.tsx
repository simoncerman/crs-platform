'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { cs } from 'date-fns/locale';
import { useSession } from 'next-auth/react';

interface Submission {
  id: string;
  name: string;
  email: string;
  preferredRole?: string;
  status: string;
  createdAt: string;
}

type StatusFilter = 'all' | 'active' | 'completed' | 'rejected';

const STATUS_TABS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'Vše' },
  { value: 'active', label: 'Aktivní' },
  { value: 'completed', label: 'Dokončené' },
  { value: 'rejected', label: 'Zamítnuté' },
];

const STATUS_LABELS: Record<string, string> = {
  pending: 'Nová',
  interview_scheduled: 'Pohovor',
  interviewed: 'Rozhodnutí',
  accepted: 'Přijat',
  documents_sent: 'Dokumenty',
  completed: 'Dokončeno',
  rejected: 'Zamítnut',
};

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
  interview_scheduled: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
  interviewed: 'bg-purple-500/20 text-purple-400 border-purple-500/50',
  accepted: 'bg-green-500/20 text-green-400 border-green-500/50',
  documents_sent: 'bg-orange-500/20 text-orange-400 border-orange-500/50',
  completed: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50',
  rejected: 'bg-red-500/20 text-red-400 border-red-500/50',
};

const ACTIVE_STATUSES = ['pending', 'interview_scheduled', 'interviewed', 'accepted', 'documents_sent'];

export default function RecruitmentListPage() {
  const { data: session } = useSession();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const loadSubmissions = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const headers: HeadersInit = {};
      if (session?.accessToken) {
        headers['Authorization'] = `Bearer ${session.accessToken}`;
      }
      const response = await fetch(`${API_URL}/api/recruitment`, { headers });
      if (!response.ok) throw new Error('Nepodařilo se načíst přihlášky');
      const data = await response.json();
      setSubmissions(data.submissions || []);
    } catch (err: any) {
      setError(err.message || 'Něco se pokazilo');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (session?.accessToken) loadSubmissions();
  }, [session]);

  const getStatusBadge = (status: string) => (
    <span className={`px-2 py-1 rounded text-xs font-medium border ${STATUS_STYLES[status] || 'bg-gray-500/20 text-gray-400 border-gray-500/50'}`}>
      {STATUS_LABELS[status] || status}
    </span>
  );

  const filteredSubmissions = submissions.filter((s) => {
    if (statusFilter === 'active' && !ACTIVE_STATUSES.includes(s.status)) return false;
    if (statusFilter === 'completed' && s.status !== 'completed') return false;
    if (statusFilter === 'rejected' && s.status !== 'rejected') return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q);
    }
    return true;
  });

  if (isLoading) {
    return <div className="flex items-center justify-center py-20"><div className="text-stellar-white text-xl">Načítání...</div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-stellar-white">Nábor (Přihlášky)</h1>
        <Link
          href="/admin/recruitment/settings"
          className="px-4 py-2 bg-cosmic-blue hover:bg-aurora-cyan text-white rounded-lg font-medium transition-colors"
        >
          Nastavení náboru
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-1 bg-cosmic-black/50 border border-stellar-white/10 rounded-lg p-1">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                statusFilter === tab.value
                  ? 'bg-cosmic-blue text-white'
                  : 'text-stellar-white/60 hover:text-stellar-white hover:bg-stellar-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Hledat podle jména nebo emailu..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full sm:w-72 bg-cosmic-black border border-stellar-white/20 rounded-lg px-4 py-2 text-stellar-white placeholder-stellar-white/30 focus:outline-none focus:border-cosmic-blue transition-colors text-sm"
        />
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 text-red-400">{error}</div>
      )}

      <div className="bg-cosmic-black/50 border border-stellar-white/10 rounded-xl overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[640px]">
          <thead>
            <tr className="bg-stellar-white/5 text-stellar-white/70 text-sm uppercase tracking-wider">
              <th className="px-4 py-4 font-medium">Jméno</th>
              <th className="px-4 py-4 font-medium">E-mail</th>
              <th className="px-4 py-4 font-medium">Tým</th>
              <th className="px-4 py-4 font-medium">Status</th>
              <th className="px-4 py-4 font-medium">Datum</th>
              <th className="px-4 py-4 font-medium text-right">Akce</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stellar-white/10">
            {filteredSubmissions.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-stellar-white/50">
                  {submissions.length === 0 ? 'Zatím nebyly přijaty žádné přihlášky.' : 'Žádné přihlášky neodpovídají filtru.'}
                </td>
              </tr>
            ) : (
              filteredSubmissions.map((submission) => (
                <tr key={submission.id} className="hover:bg-stellar-white/5 transition-colors">
                  <td className="px-4 py-4">
                    <div className="text-stellar-white font-medium truncate max-w-[160px]">{submission.name}</div>
                  </td>
                  <td className="px-4 py-4 text-stellar-white/60 text-sm truncate max-w-[200px]">{submission.email}</td>
                  <td className="px-4 py-4 text-stellar-white/60 text-sm truncate max-w-[140px]">{submission.preferredRole || '-'}</td>
                  <td className="px-4 py-4 whitespace-nowrap">{getStatusBadge(submission.status)}</td>
                  <td className="px-4 py-4 text-stellar-white/60 text-sm whitespace-nowrap">
                    {format(new Date(submission.createdAt), 'd. M. yyyy', { locale: cs })}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <Link href={`/admin/recruitment/${submission.id}`} className="text-aurora-cyan hover:text-white transition-colors">
                      Detail
                    </Link>
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
