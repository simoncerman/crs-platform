'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

interface Member {
  id: string;
  name: string;
  role: string;
  email: string | null;
  phone: string | null;
  department: string | null;
  tags: string[];
  bio: string | null;
  avatar: string | null;
  linkedIn: string | null;
  github: string | null;
  active: boolean;
  joinedAt: string;
  createdAt: string;
  updatedAt: string;
}

export default function MembersListPage() {
  const { data: session } = useSession();
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadMembers = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

      const headers: HeadersInit = {};
      if (session?.accessToken) {
        headers['Authorization'] = `Bearer ${session.accessToken}`;
      }

      const response = await fetch(`${API_URL}/api/members`, { headers });

      if (!response.ok) {
        throw new Error('Nepodařilo se načíst členy');
      }

      const data = await response.json();
      setMembers(data.members || []);
    } catch (err: any) {
      setError(err.message || 'Něco se pokazilo');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (session?.accessToken) {
      loadMembers();
    }
  }, [session]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Opravdu chcete smazat člena "${name}"?`)) {
      return;
    }

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

      if (!session?.accessToken) {
        throw new Error('Nejste přihlášen');
      }

      const response = await fetch(`${API_URL}/api/members/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Nepodařilo se smazat člena');
      }

      await loadMembers();
    } catch (err: any) {
      alert(err.message || 'Něco se pokazilo');
    }
  };

  const handleToggleActive = async (member: Member) => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

      if (!session?.accessToken) {
        throw new Error('Nejste přihlášen');
      }

      const response = await fetch(`${API_URL}/api/members/${member.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          active: !member.active,
        }),
      });

      if (!response.ok) {
        throw new Error('Nepodařilo se aktualizovat člena');
      }

      await loadMembers();
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
            Členové
          </h1>
          <p className="text-stellar-white/70">
            Správa členů týmu
          </p>
        </div>
        <Link
          href="/admin/members/new"
          className="bg-cosmic-blue/20 hover:bg-cosmic-blue/30 text-aurora-cyan border-2 border-cosmic-blue/30 hover:border-aurora-cyan/50 font-semibold px-6 py-3 rounded-lg transition-all flex items-center gap-2"
        >
          <span className="text-xl">+</span>
          Nový člen
        </Link>
      </div>

      <div className="bg-deep-space/50 border border-stellar-white/10 rounded-xl overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="bg-stellar-white/5 text-stellar-white/70 text-sm uppercase tracking-wider">
              <th className="px-4 py-4 font-medium">Člen</th>
              <th className="px-4 py-4 font-medium">Role</th>
              <th className="px-4 py-4 font-medium">Oddělení</th>
              <th className="px-4 py-4 font-medium">Stav</th>
              <th className="px-4 py-4 font-medium text-right">Akce</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stellar-white/10">
            {members.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-stellar-white/50">
                  Zatím nejsou žádní členové —{' '}
                  <Link href="/admin/members/new" className="text-aurora-cyan hover:underline">přidat prvního</Link>
                </td>
              </tr>
            ) : (
              members.map((member) => (
                <tr key={member.id} className="hover:bg-stellar-white/5 transition-colors group">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      {member.avatar ? (
                        <img src={member.avatar} alt={member.name} className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-cosmic-blue/20 flex items-center justify-center">
                          <span className="text-stellar-white/60 text-xs font-bold">{member.name.charAt(0).toUpperCase()}</span>
                        </div>
                      )}
                      <Link href={`/admin/members/edit/${member.id}`} className="text-stellar-white font-medium hover:text-aurora-cyan transition-colors">
                        {member.name}
                      </Link>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-stellar-white/60 text-sm">{member.role}</td>
                  <td className="px-4 py-4 text-stellar-white/60 text-sm">{member.department || '—'}</td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleActive(member)}
                      className={`px-2 py-1 rounded text-xs font-medium border ${
                        member.active
                          ? 'bg-green-500/20 text-green-400 border-green-500/50'
                          : 'bg-stellar-white/20 text-stellar-white/40 border-stellar-white/30'
                      }`}
                    >
                      {member.active ? 'Aktivní' : 'Neaktivní'}
                    </button>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/admin/members/edit/${member.id}`} className="text-aurora-cyan hover:text-white transition-colors text-sm">
                        Upravit
                      </Link>
                      <span className="text-stellar-white/20 mx-1">·</span>
                      <button
                        onClick={() => handleDelete(member.id, member.name)}
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
