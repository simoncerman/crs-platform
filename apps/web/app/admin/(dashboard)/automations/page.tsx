'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState, useCallback } from 'react';
import { adminFetch } from '@/lib/admin-fetch';

interface Automation {
  id: string;
  key: string;
  name: string;
  description: string | null;
  enabled: boolean;
  intervalMinutes: number;
  lastRunAt: string | null;
  lastRunStatus: string | null;
  lastRunMessage: string | null;
  nextRunAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface SyncResult {
  created: number;
  updated: number;
  skipped: number;
  errors: number;
  total: number;
  members: Array<{
    name: string;
    action: 'created' | 'updated' | 'skipped' | 'error';
    error?: string;
    typClenstvi: string;
    zarazeni: string[];
  }>;
}

const AUTOMATION_ICONS: Record<string, string> = {
  'notion-members-sync': '🔄',
};

const AUTOMATION_COLORS: Record<string, { from: string; to: string; border: string; iconBg: string }> = {
  'notion-members-sync': {
    from: 'from-indigo-500/8',
    to: 'to-purple-500/5',
    border: 'border-indigo-400/25',
    iconBg: 'bg-indigo-500/15 border-indigo-400/30',
  },
};

const DEFAULT_COLOR = {
  from: 'from-cosmic-blue/8',
  to: 'to-aurora-cyan/5',
  border: 'border-cosmic-blue/25',
  iconBg: 'bg-cosmic-blue/15 border-cosmic-blue/30',
};

const INTERVAL_PRESETS = [
  { label: '5 min', value: 5 },
  { label: '15 min', value: 15 },
  { label: '30 min', value: 30 },
  { label: '1 hodina', value: 60 },
  { label: '3 hodiny', value: 180 },
  { label: '6 hodin', value: 360 },
  { label: '12 hodin', value: 720 },
  { label: '1 den', value: 1440 },
  { label: '7 dní', value: 10080 },
];

function formatDateTime(dateStr: string | null) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleString('cs-CZ', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatRelative(dateStr: string | null) {
  if (!dateStr) return null;
  const now = Date.now();
  const target = new Date(dateStr).getTime();
  const diffMs = target - now;
  const absDiff = Math.abs(diffMs);

  if (absDiff < 60_000) return diffMs > 0 ? 'za chvíli' : 'právě teď';

  const minutes = Math.floor(absDiff / 60_000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    const remHours = hours % 24;
    const timeStr = remHours > 0 ? `${days}d ${remHours}h` : `${days}d`;
    return diffMs > 0 ? `za ${timeStr}` : `před ${timeStr}`;
  }
  if (hours > 0) {
    const remMin = minutes % 60;
    const timeStr = remMin > 0 ? `${hours}h ${remMin}m` : `${hours}h`;
    return diffMs > 0 ? `za ${timeStr}` : `před ${timeStr}`;
  }
  return diffMs > 0 ? `za ${minutes}m` : `před ${minutes}m`;
}

function StatusBadge({ status }: { status: string | null }) {
  if (!status) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-500/10 text-stellar-white/40 border border-gray-500/20">
        <span className="w-1.5 h-1.5 rounded-full bg-gray-500/50" />
        Čeká na spuštění
      </span>
    );
  }

  const config: Record<string, { dot: string; bg: string; text: string; border: string; label: string }> = {
    success: { dot: 'bg-green-400', bg: 'bg-green-500/10', text: 'text-green-400', border: 'border-green-500/25', label: '✅ Úspěch' },
    error: { dot: 'bg-red-400', bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/25', label: '❌ Chyba' },
    running: { dot: 'bg-yellow-400 animate-pulse', bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/25', label: '⏳ Běží...' },
  };

  const c = config[status] || config.error;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${c.bg} ${c.text} border ${c.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}

function AutomationDescription({ automationKey, fallback }: { automationKey: string; fallback: string | null }) {
  if (automationKey === 'notion-members-sync') {
    return (
      <div className="text-stellar-white/45 text-sm mt-2 max-w-2xl space-y-1.5">
        <p>
          Přepisuje data z{' '}
          <a
            href="https://www.notion.so/d051bed6cb59832aaa43010f723bd484"
            target="_blank"
            rel="noopener noreferrer"
            className="text-aurora-cyan/70 hover:text-aurora-cyan underline underline-offset-2 transition-colors"
          >
            řádné databáze členů
          </a>
          {' '}do{' '}
          <a
            href="https://www.notion.so/2991bed6cb5980eda235de529da012da"
            target="_blank"
            rel="noopener noreferrer"
            className="text-aurora-cyan/70 hover:text-aurora-cyan underline underline-offset-2 transition-colors"
          >
            veřejné databáze členů
          </a>
          .
        </p>
        <p className="text-stellar-white/35">
          Filtruje pouze řádné a mimořádné členy bez konce ve spolku. Aktualizuje existující záznamy, přidává nové — nikdy nemaže.
        </p>
      </div>
    );
  }

  if (fallback) {
    return <p className="text-stellar-white/45 text-sm mt-1 max-w-xl">{fallback}</p>;
  }

  return null;
}

export default function AutomationsPage() {
  const { data: session } = useSession();
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [loading, setLoading] = useState(true);
  const [triggeringId, setTriggeringId] = useState<string | null>(null);
  const [syncResults, setSyncResults] = useState<Record<string, SyncResult>>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  const fetchAutomations = useCallback(async () => {
    if (!session?.accessToken) return;
    try {
      const res = await adminFetch(`${API_URL}/api/automations`, {
        accessToken: session.accessToken,
      });
      const data = await res.json();
      setAutomations(data.automations || []);
    } catch {
      // adminFetch handles 401
    } finally {
      setLoading(false);
    }
  }, [session?.accessToken, API_URL]);

  useEffect(() => {
    fetchAutomations();
  }, [fetchAutomations]);

  useEffect(() => {
    const interval = setInterval(fetchAutomations, 15_000);
    return () => clearInterval(interval);
  }, [fetchAutomations]);

  const updateAutomation = async (id: string, data: Partial<Automation>) => {
    if (!session?.accessToken) return;
    try {
      const res = await adminFetch(`${API_URL}/api/automations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        accessToken: session.accessToken,
        body: JSON.stringify(data),
      });
      const result = await res.json();
      setAutomations((prev) =>
        prev.map((a) => (a.id === id ? result.automation : a))
      );
    } catch {
      // handled
    }
  };

  const triggerAutomation = async (automation: Automation) => {
    if (!session?.accessToken) return;
    setTriggeringId(automation.id);
    try {
      await adminFetch(`${API_URL}/api/automations/${automation.id}/trigger`, {
        method: 'POST',
        accessToken: session.accessToken,
      });

      // Poll for completion
      const pollForResult = async (attempts = 0) => {
        if (attempts > 60) return;
        await new Promise((r) => setTimeout(r, 1000));

        const res = await adminFetch(`${API_URL}/api/automations/${automation.id}`, {
          accessToken: session.accessToken,
        });
        const result = await res.json();
        setAutomations((prev) =>
          prev.map((a) => (a.id === automation.id ? result.automation : a))
        );

        if (result.automation?.lastRunStatus === 'running') {
          return pollForResult(attempts + 1);
        }

        // Fetch result data (both on success and error — errors may have per-member details)
        try {
          const dataRes = await adminFetch(`${API_URL}/api/automations/${automation.id}/data`, {
            accessToken: session.accessToken,
          });
          const dataResult = await dataRes.json();
          if (dataResult.syncResult) {
            setSyncResults((prev) => ({ ...prev, [automation.id]: dataResult.syncResult }));
          }
        } catch {
          // No detail data available — that's fine, the error message is in automation.lastRunMessage
        }
      };

      await pollForResult();
    } catch {
      // handled
    } finally {
      setTriggeringId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-stellar-white/60 animate-pulse">Načítání automatizací...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Page header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">⚡</span>
          <h1 className="text-3xl font-bold text-stellar-white">Automatizace</h1>
        </div>
        <p className="text-stellar-white/50 ml-12">
          Plánované úlohy pro synchronizaci a údržbu dat. Nastav interval a nech je běžet automaticky.
        </p>
      </div>

      {automations.length === 0 ? (
        <div className="bg-deep-space/50 border-2 border-dashed border-cosmic-blue/30 rounded-2xl p-16 text-center">
          <span className="text-4xl mb-4 block">📭</span>
          <p className="text-stellar-white/50 text-lg">Žádné automatizace nejsou k dispozici.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {automations.map((automation) => {
            const result = syncResults[automation.id];
            const isExpanded = expandedId === automation.id;
            const isRunning = automation.lastRunStatus === 'running' || triggeringId === automation.id;
            const icon = AUTOMATION_ICONS[automation.key] || '⚙️';
            const colors = AUTOMATION_COLORS[automation.key] || DEFAULT_COLOR;

            return (
              <div
                key={automation.id}
                className={`rounded-2xl overflow-hidden transition-all duration-300 ${
                  isRunning
                    ? 'border-2 border-yellow-500/40 shadow-lg shadow-yellow-500/5'
                    : automation.enabled
                      ? `border-2 ${colors.border} shadow-lg shadow-aurora-cyan/5`
                      : 'border-2 border-cosmic-blue/20'
                }`}
              >
                {/* Card header with gradient */}
                <div className={`px-6 py-5 bg-gradient-to-br ${colors.from} ${colors.to}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl border ${
                        automation.enabled ? colors.iconBg : 'bg-cosmic-blue/10 border-cosmic-blue/20'
                      }`}>
                        {icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <h2 className="text-lg font-bold text-stellar-white">
                            {automation.name}
                          </h2>
                          <StatusBadge status={automation.lastRunStatus} />
                        </div>
                        <AutomationDescription automationKey={automation.key} fallback={automation.description} />
                      </div>
                    </div>

                    {/* Toggle */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-stellar-white/40">
                        {automation.enabled ? 'Aktivní' : 'Neaktivní'}
                      </span>
                      <button
                        onClick={() =>
                          updateAutomation(automation.id, { enabled: !automation.enabled })
                        }
                        className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-300 ${
                          automation.enabled
                            ? 'bg-aurora-cyan shadow-md shadow-aurora-cyan/30'
                            : 'bg-cosmic-blue/30'
                        }`}
                      >
                        <span
                          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-300 ${
                            automation.enabled ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Card body */}
                <div className={`px-6 py-5 bg-gradient-to-b from-deep-space/40 to-deep-space/60`}>
                  {/* Stats row */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                    {/* Interval */}
                    <div className="bg-cosmic-black/30 rounded-xl p-4 border border-cosmic-blue/15">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm">🕐</span>
                        <label className="text-xs text-stellar-white/40 font-medium uppercase tracking-wide">
                          Interval
                        </label>
                      </div>
                      <select
                        value={automation.intervalMinutes}
                        onChange={(e) =>
                          updateAutomation(automation.id, {
                            intervalMinutes: Number(e.target.value),
                          })
                        }
                        className="w-full bg-cosmic-black/50 border border-cosmic-blue/25 rounded-lg px-3 py-2 text-sm text-stellar-white focus:border-aurora-cyan focus:outline-none focus:ring-1 focus:ring-aurora-cyan/30 transition-all"
                      >
                        {INTERVAL_PRESETS.map((preset) => (
                          <option key={preset.value} value={preset.value}>
                            {preset.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Last run */}
                    <div className="bg-cosmic-black/30 rounded-xl p-4 border border-cosmic-blue/15">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm">📋</span>
                        <label className="text-xs text-stellar-white/40 font-medium uppercase tracking-wide">
                          Poslední běh
                        </label>
                      </div>
                      <div className="text-sm text-stellar-white font-medium">
                        {formatDateTime(automation.lastRunAt)}
                      </div>
                      {automation.lastRunAt && (
                        <div className="text-xs text-stellar-white/35 mt-0.5">
                          {formatRelative(automation.lastRunAt)}
                        </div>
                      )}
                    </div>

                    {/* Next run */}
                    <div className="bg-cosmic-black/30 rounded-xl p-4 border border-cosmic-blue/15">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm">⏭️</span>
                        <label className="text-xs text-stellar-white/40 font-medium uppercase tracking-wide">
                          Příští běh
                        </label>
                      </div>
                      <div className="text-sm text-stellar-white font-medium">
                        {automation.enabled ? formatDateTime(automation.nextRunAt) : '—'}
                      </div>
                      {automation.enabled && automation.nextRunAt && (
                        <div className="text-xs text-aurora-cyan/60 mt-0.5">
                          {formatRelative(automation.nextRunAt)}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Last run message */}
                  {automation.lastRunMessage && (
                    <div
                      className={`text-sm rounded-xl px-4 py-3 mb-5 flex items-start gap-2 ${
                        automation.lastRunStatus === 'error'
                          ? 'bg-red-500/8 text-red-400 border border-red-500/20'
                          : 'bg-green-500/8 text-green-400 border border-green-500/20'
                      }`}
                    >
                      <span className="shrink-0 mt-0.5">
                        {automation.lastRunStatus === 'error' ? '⚠️' : '✅'}
                      </span>
                      {automation.lastRunMessage}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => triggerAutomation(automation)}
                      disabled={isRunning}
                      className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                        isRunning
                          ? 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/25 cursor-not-allowed'
                          : 'bg-aurora-cyan/15 hover:bg-aurora-cyan/25 text-aurora-cyan border border-aurora-cyan/30 hover:border-aurora-cyan/50 hover:shadow-md hover:shadow-aurora-cyan/10'
                      }`}
                    >
                      {isRunning ? (
                        <>
                          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          Synchronizuji...
                        </>
                      ) : (
                        <>
                          🚀 Spustit nyní
                        </>
                      )}
                    </button>

                    {result && (
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : automation.id)}
                        className="inline-flex items-center gap-2 text-stellar-white/50 hover:text-stellar-white px-4 py-2.5 rounded-xl transition-all text-sm border border-cosmic-blue/20 hover:border-cosmic-blue/40 hover:bg-cosmic-blue/5"
                      >
                        <span>{isExpanded ? '🔼' : '🔽'}</span>
                        {isExpanded ? 'Skrýt výsledky' : `📊 Zobrazit výsledky (${result.total} členů)`}
                      </button>
                    )}
                  </div>
                </div>

                {/* Expanded results */}
                {isExpanded && result && (
                  <div className="border-t border-cosmic-blue/15 bg-cosmic-black/20">
                    {/* Summary stats */}
                    <div className="px-6 py-4 flex flex-wrap items-center gap-5 border-b border-cosmic-blue/10">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-400" />
                        <span className="text-sm text-stellar-white/60">
                          Vytvořeno: <span className="text-green-400 font-semibold">{result.created}</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-400" />
                        <span className="text-sm text-stellar-white/60">
                          Aktualizováno: <span className="text-blue-400 font-semibold">{result.updated}</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-gray-400" />
                        <span className="text-sm text-stellar-white/60">
                          Beze změn: <span className="text-gray-400 font-semibold">{result.skipped}</span>
                        </span>
                      </div>
                      {result.errors > 0 && (
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-red-400" />
                          <span className="text-sm text-stellar-white/60">
                            Chyby: <span className="text-red-400 font-semibold">{result.errors}</span>
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Members table */}
                    <div className="overflow-x-auto max-h-96 overflow-y-auto">
                      <table className="w-full text-sm">
                        <thead className="sticky top-0 bg-deep-space/95 backdrop-blur-sm z-10">
                          <tr className="border-b border-cosmic-blue/20">
                            <th className="text-left py-3 px-4 text-stellar-white/40 font-medium text-xs uppercase tracking-wider">#</th>
                            <th className="text-left py-3 px-4 text-stellar-white/40 font-medium text-xs uppercase tracking-wider">Člen</th>
                            <th className="text-left py-3 px-4 text-stellar-white/40 font-medium text-xs uppercase tracking-wider">Typ</th>
                            <th className="text-left py-3 px-4 text-stellar-white/40 font-medium text-xs uppercase tracking-wider">Zařazení</th>
                            <th className="text-left py-3 px-4 text-stellar-white/40 font-medium text-xs uppercase tracking-wider">Akce</th>
                          </tr>
                        </thead>
                        <tbody>
                          {result.members.map((member, i) => (
                            <tr
                              key={i}
                              className={`border-b transition-colors ${
                                member.action === 'error'
                                  ? 'border-red-500/15 bg-red-500/5 hover:bg-red-500/8'
                                  : 'border-cosmic-blue/8 hover:bg-cosmic-blue/5'
                              }`}
                            >
                              <td className="py-2.5 px-4 text-stellar-white/30 text-xs">{i + 1}</td>
                              <td className="py-2.5 px-4">
                                <div className="text-stellar-white font-medium whitespace-nowrap">
                                  {member.name}
                                </div>
                                {member.action === 'error' && member.error && (
                                  <div className="text-red-400/80 text-xs mt-1 max-w-md">
                                    ⚠️ {member.error}
                                  </div>
                                )}
                              </td>
                              <td className="py-2.5 px-4">
                                <span
                                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                    member.typClenstvi === 'Řádné členství'
                                      ? 'bg-green-500/12 text-green-400'
                                      : 'bg-yellow-500/12 text-yellow-400'
                                  }`}
                                >
                                  {member.typClenstvi === 'Řádné členství' ? 'Řádné' : 'Mimořádné'}
                                </span>
                              </td>
                              <td className="py-2.5 px-4">
                                {member.zarazeni.length > 0 ? (
                                  <div className="flex flex-wrap gap-1">
                                    {member.zarazeni.map((z) => (
                                      <span
                                        key={z}
                                        className="px-2 py-0.5 rounded-full text-xs bg-cosmic-blue/15 text-aurora-cyan/70"
                                      >
                                        {z}
                                      </span>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-stellar-white/20">—</span>
                                )}
                              </td>
                              <td className="py-2.5 px-4">
                                <span
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                                    member.action === 'created'
                                      ? 'bg-green-500/12 text-green-400'
                                      : member.action === 'updated'
                                        ? 'bg-blue-500/12 text-blue-400'
                                        : member.action === 'error'
                                          ? 'bg-red-500/12 text-red-400'
                                          : 'bg-gray-500/12 text-gray-400'
                                  }`}
                                >
                                  {member.action === 'created'
                                    ? '✨ Nový'
                                    : member.action === 'updated'
                                      ? '🔄 Aktualiz.'
                                      : member.action === 'error'
                                        ? '❌ Chyba'
                                        : '— Beze změn'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
