'use client';

import { useState, useEffect, type ReactNode } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { cs } from 'date-fns/locale';
import { useSession } from 'next-auth/react';
import { getEventDisplayStatus, type EventDisplayStatus } from '@/lib/api';

interface Event {
  id: number;
  title: string;
  slug: string;
  location?: string;
  startDate: string;
  endDate: string;
  specialStatus: 'cancelled' | 'postponed' | null;
  eventType: 'launch' | 'test' | 'recruitment' | 'pr' | 'event';
  published: boolean;
  createdAt: string;
}

export default function EventsListPage() {
  const { data: session } = useSession();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadEvents = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

      const headers: HeadersInit = {};
      if (session?.accessToken) {
        headers['Authorization'] = `Bearer ${session.accessToken}`;
      }

      const response = await fetch(`${API_URL}/api/events`, { headers });

      if (!response.ok) {
        throw new Error('Nepodařilo se načíst události');
      }

      const data = await response.json();
      setEvents(data.events || []);
    } catch (err: any) {
      setError(err.message || 'Něco se pokazilo');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (session?.accessToken) {
      loadEvents();
    }
  }, [session]);

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`Opravdu chcete smazat událost "${title}"?`)) {
      return;
    }

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

      if (!session?.accessToken) {
        throw new Error('Nejste přihlášen');
      }

      const response = await fetch(`${API_URL}/api/events/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Nepodařilo se smazat událost');
      }

      await loadEvents();
    } catch (err: any) {
      alert(err.message || 'Něco se pokazilo');
    }
  };

  const getStatusBadge = (event: Event) => {
    const displayStatus = getEventDisplayStatus(event);

    const styles: Record<EventDisplayStatus, string> = {
      upcoming: 'bg-aurora-cyan/10 text-aurora-cyan border-aurora-cyan/30',
      ongoing: 'bg-green-500/10 text-green-400 border-green-500/30',
      past: 'bg-stellar-white/10 text-stellar-white/60 border-stellar-white/20',
      cancelled: 'bg-red-500/10 text-red-400 border-red-500/30',
      postponed: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
    };

    const labels: Record<EventDisplayStatus, string> = {
      upcoming: 'Nadcházející',
      ongoing: 'Právě probíhá',
      past: 'Proběhlo',
      cancelled: 'Zrušeno',
      postponed: 'Odloženo',
    };

    const icons: Record<EventDisplayStatus, ReactNode> = {
      upcoming: (
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      ongoing: (
        <svg className="w-3 h-3 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="8" />
        </svg>
      ),
      past: (
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ),
      cancelled: (
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      ),
      postponed: (
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    };

    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${styles[displayStatus]}`}>
        {icons[displayStatus]}
        {labels[displayStatus]}
      </span>
    );
  };

  const getEventTypeBadge = (type: string) => {
    const styles = {
      launch: 'bg-crs-ignition/20 text-crs-ignition border-crs-ignition/40 shadow-[0_0_10px_rgba(243,182,0,0.2)]',
      test: 'bg-aurora-cyan/10 text-aurora-cyan border-aurora-cyan/30',
      recruitment: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
      pr: 'bg-pink-500/10 text-pink-400 border-pink-500/30',
      event: 'bg-stellar-white/10 text-stellar-white/60 border-stellar-white/20',
    };

    const labels = {
      launch: 'Start rakety',
      test: 'Testovací kampaň',
      recruitment: 'Nábor',
      pr: 'PR akce',
      event: 'Událost',
    };

    const currentType = (type || 'event') as keyof typeof labels;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-tight border ${styles[currentType] || styles.event}`}>
        {currentType === 'launch' && (
          <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12,2L4.5,20.29L5.21,21L12,18L18.79,21L19.5,20.29L12,2Z" />
          </svg>
        )}
        {labels[currentType] || labels.event}
      </span>
    );
  };

  const getPublishedBadge = (published: boolean) => {
    return published ? (
      <span className="flex items-center gap-1.5 text-green-400 text-xs font-medium">
        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
        Publikováno
      </span>
    ) : (
      <span className="flex items-center gap-1.5 text-stellar-white/40 text-xs font-medium">
        <span className="w-1.5 h-1.5 rounded-full bg-stellar-white/20" />
        Koncept
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
        <h1 className="text-3xl font-bold text-stellar-white">Události</h1>
        <Link
          href="/admin/events/new"
          className="bg-cosmic-blue/20 hover:bg-cosmic-blue/30 text-aurora-cyan border border-cosmic-blue/30 hover:border-aurora-cyan/50 font-semibold px-6 py-3 rounded-lg transition-all flex items-center gap-2"
        >
          <span className="text-xl">+</span>
          Nová událost
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
              <th className="px-4 py-4 font-medium">Událost</th>
              <th className="px-4 py-4 font-medium">Typ</th>
              <th className="px-4 py-4 font-medium">Datum</th>
              <th className="px-4 py-4 font-medium">Status</th>
              <th className="px-4 py-4 font-medium text-right">Akce</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stellar-white/10">
            {events.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-stellar-white/50">
                  Zatím nebyly vytvořeny žádné události.
                </td>
              </tr>
            ) : (
              events.map((event) => (
                <tr key={event.id} className="hover:bg-stellar-white/5 transition-colors group">
                  <td className="px-4 py-4">
                    <Link href={`/admin/events/edit/${event.id}`} className="text-stellar-white font-medium hover:text-aurora-cyan transition-colors">
                      {event.title}
                    </Link>
                    {event.location && (
                      <p className="text-stellar-white/40 text-xs mt-0.5">{event.location}</p>
                    )}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    {getEventTypeBadge(event.eventType)}
                  </td>
                  <td className="px-4 py-4 text-stellar-white/60 text-sm whitespace-nowrap">
                    {format(new Date(event.startDate), 'd. M. yyyy', { locale: cs })}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    {getStatusBadge(event)}
                    {!event.published && (
                      <span className="ml-2 px-2 py-1 rounded text-xs font-medium border bg-stellar-white/10 text-stellar-white/40 border-stellar-white/20">Skrytý</span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/admin/events/edit/${event.id}`} className="text-aurora-cyan hover:text-white transition-colors text-sm">
                        Upravit
                      </Link>
                      <span className="text-stellar-white/20 mx-1">·</span>
                      <button
                        onClick={() => handleDelete(event.id, event.title)}
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
