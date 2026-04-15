'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const TELEMETRY_API = process.env.NEXT_PUBLIC_TELEMETRY_WS_URL?.replace('wss://', 'https://').replace('ws://', 'http://') || 'http://localhost:8082';

interface HistoryRow {
  time: number;
  field: string;
  value: number;
  session_id: string;
  device_type: string;
  device_id: string;
  data_type: string;
}

type Resolution = '500ms' | '1s' | '5s' | '10s' | '30s' | 'raw';

function formatTime(ms: number): string {
  const totalSec = Math.floor(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  return `${min}:${sec.toString().padStart(2, '0')}`;
}

export default function PlaybackPage() {
  const params = useParams();
  const sessionId = params.sessionId as string;

  const [data, setData] = useState<HistoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resolution, setResolution] = useState<Resolution>('1s');
  const [timeRange, setTimeRange] = useState({ min: 0, max: 0 });

  useEffect(() => {
    fetchHistory(resolution);
  }, [sessionId, resolution]);

  async function fetchHistory(res: Resolution) {
    setLoading(true);
    setError(null);
    try {
      const resParam = res === 'raw' ? '' : `&resolution=${res}`;
      const url = `${TELEMETRY_API}/api/history?session_id=${sessionId}${resParam}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Nepodařilo se načíst data');
      const json = await response.json();
      const rows: HistoryRow[] = json.data || [];
      setData(rows);

      if (rows.length > 0) {
        const times = rows.map((r) => r.time);
        setTimeRange({ min: Math.min(...times), max: Math.max(...times) });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chyba');
    } finally {
      setLoading(false);
    }
  }

  const allAltitude = data
    .filter((r) => r.field === 'alt')
    .map((r) => ({ time: r.time - timeRange.min, value: r.value }));

  const allSpeed = data
    .filter((r) => r.field === 'speed')
    .map((r) => ({ time: r.time - timeRange.min, value: r.value }));

  const allTemp = data
    .filter((r) => r.field === 'temp')
    .map((r) => ({ time: r.time - timeRange.min, value: r.value }));

  const allPressure = data
    .filter((r) => r.field === 'pressure')
    .map((r) => ({ time: r.time - timeRange.min, value: r.value }));

  const totalDuration = timeRange.max - timeRange.min;

  const resolutions: { value: Resolution; label: string }[] = [
    { value: 'raw', label: 'Raw' },
    { value: '500ms', label: '0.5s' },
    { value: '1s', label: '1s' },
    { value: '5s', label: '5s' },
    { value: '10s', label: '10s' },
    { value: '30s', label: '30s' },
  ];

  const tooltipStyle = {
    backgroundColor: '#0a0e27',
    border: '1px solid #64f4d2',
    borderRadius: '8px',
    color: '#f8f9fc',
  };

  return (
    <div className="min-h-screen bg-cosmic-black text-stellar-white pt-20">
      <header className="bg-deep-space/80 backdrop-blur-sm border-b border-cosmic-blue/30 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <Link
              href="/telemetrie"
              className="text-sm text-moon-gray hover:text-aurora-cyan transition-colors"
            >
              &larr; Zpět na přehled
            </Link>
            <h1 className="text-2xl font-heading font-bold mt-1">
              Historie — {sessionId}
            </h1>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => fetchHistory(resolution)}
              className="text-xs bg-aurora-cyan/20 hover:bg-aurora-cyan/30 text-aurora-cyan px-3 py-1.5 rounded border border-aurora-cyan/30 transition-colors"
            >
              Obnovit data
            </button>
            <Link
              href={`/telemetrie/live/${sessionId}`}
              className="text-xs bg-cosmic-blue/30 hover:bg-cosmic-blue/50 text-stellar-white px-3 py-1.5 rounded border border-cosmic-blue/30 transition-colors"
            >
              Živě
            </Link>
            <a
              href={`${TELEMETRY_API}/api/history/export?session_id=${sessionId}&format=csv`}
              className="text-xs bg-cosmic-blue/30 hover:bg-cosmic-blue/50 text-stellar-white px-3 py-1.5 rounded border border-cosmic-blue/30 transition-colors"
            >
              Export CSV
            </a>
            <a
              href={`${TELEMETRY_API}/api/history/export?session_id=${sessionId}&format=json`}
              className="text-xs bg-cosmic-blue/30 hover:bg-cosmic-blue/50 text-stellar-white px-3 py-1.5 rounded border border-cosmic-blue/30 transition-colors"
            >
              Export JSON
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-4">
        {loading && <div className="text-center py-12 text-moon-gray">Načítání dat...</div>}

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400">
            {error}
          </div>
        )}

        {!loading && !error && data.length === 0 && (
          <div className="text-center py-12 text-moon-gray">
            Žádná historická data pro session <span className="text-aurora-cyan">{sessionId}</span>
          </div>
        )}

        {!loading && !error && data.length > 0 && (
          <>
            {/* Resolution selector */}
            <div className="flex items-center gap-3">
              <span className="text-xs text-moon-gray">Rozlišení:</span>
              {resolutions.map((r) => (
                <button
                  key={r.value}
                  onClick={() => setResolution(r.value)}
                  className={`px-2 py-0.5 text-xs rounded transition-colors ${
                    resolution === r.value
                      ? 'bg-aurora-cyan/20 text-aurora-cyan border border-aurora-cyan/50'
                      : 'text-moon-gray hover:text-stellar-white border border-transparent'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-deep-space/50 border border-cosmic-blue/30 rounded-lg p-4">
                <h3 className="text-sm font-medium text-moon-gray mb-3">Výška (m)</h3>
                <div className="h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={allAltitude}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1a1f3a" />
                      <XAxis dataKey="time" tick={{ fill: '#a8b2d1', fontSize: 10 }} tickFormatter={(v) => formatTime(v)} axisLine={{ stroke: '#1a1f3a' }} />
                      <YAxis tick={{ fill: '#a8b2d1', fontSize: 10 }} axisLine={{ stroke: '#1a1f3a' }} />
                      <Tooltip contentStyle={tooltipStyle} formatter={(value) => [`${Number(value).toFixed(1)} m`, 'Výška']} labelFormatter={(v) => formatTime(Number(v))} />
                      <Line type="monotone" dataKey="value" stroke="#64f4d2" strokeWidth={1.5} dot={false} isAnimationActive={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-deep-space/50 border border-cosmic-blue/30 rounded-lg p-4">
                <h3 className="text-sm font-medium text-moon-gray mb-3">Rychlost (m/s)</h3>
                <div className="h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={allSpeed}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1a1f3a" />
                      <XAxis dataKey="time" tick={{ fill: '#a8b2d1', fontSize: 10 }} tickFormatter={(v) => formatTime(v)} axisLine={{ stroke: '#1a1f3a' }} />
                      <YAxis tick={{ fill: '#a8b2d1', fontSize: 10 }} axisLine={{ stroke: '#1a1f3a' }} />
                      <Tooltip contentStyle={{ ...tooltipStyle, border: '1px solid #4d9fff' }} formatter={(value) => [`${Number(value).toFixed(1)} m/s`, 'Rychlost']} labelFormatter={(v) => formatTime(Number(v))} />
                      <Line type="monotone" dataKey="value" stroke="#4d9fff" strokeWidth={1.5} dot={false} isAnimationActive={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-deep-space/50 border border-cosmic-blue/30 rounded-lg p-4">
                <h3 className="text-sm font-medium text-moon-gray mb-3">Teplota (°C)</h3>
                <div className="h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={allTemp}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1a1f3a" />
                      <XAxis dataKey="time" tick={{ fill: '#a8b2d1', fontSize: 10 }} tickFormatter={(v) => formatTime(v)} axisLine={{ stroke: '#1a1f3a' }} />
                      <YAxis tick={{ fill: '#a8b2d1', fontSize: 10 }} axisLine={{ stroke: '#1a1f3a' }} />
                      <Tooltip contentStyle={{ ...tooltipStyle, border: '1px solid #f59e0b' }} formatter={(value) => [`${Number(value).toFixed(1)} °C`, 'Teplota']} labelFormatter={(v) => formatTime(Number(v))} />
                      <Line type="monotone" dataKey="value" stroke="#f59e0b" strokeWidth={1.5} dot={false} isAnimationActive={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-deep-space/50 border border-cosmic-blue/30 rounded-lg p-4">
                <h3 className="text-sm font-medium text-moon-gray mb-3">Tlak (hPa)</h3>
                <div className="h-[220px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={allPressure}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1a1f3a" />
                      <XAxis dataKey="time" tick={{ fill: '#a8b2d1', fontSize: 10 }} tickFormatter={(v) => formatTime(v)} axisLine={{ stroke: '#1a1f3a' }} />
                      <YAxis tick={{ fill: '#a8b2d1', fontSize: 10 }} axisLine={{ stroke: '#1a1f3a' }} domain={['auto', 'auto']} />
                      <Tooltip contentStyle={{ ...tooltipStyle, border: '1px solid #a78bfa' }} formatter={(value) => [`${Number(value).toFixed(1)} hPa`, 'Tlak']} labelFormatter={(v) => formatTime(Number(v))} />
                      <Line type="monotone" dataKey="value" stroke="#a78bfa" strokeWidth={1.5} dot={false} isAnimationActive={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Data stats */}
            <div className="bg-deep-space/50 border border-cosmic-blue/30 rounded-lg p-4">
              <div className="flex flex-wrap gap-8 text-sm">
                <div>
                  <span className="text-moon-gray">Zobrazeno bodů:</span>
                  <span className="ml-2 text-stellar-white font-mono">{data.length.toLocaleString()}</span>
                </div>
                {resolution !== 'raw' && (
                  <div>
                    <span className="text-moon-gray">Agregace:</span>
                    <span className="ml-2 text-aurora-cyan font-mono">{resolution}</span>
                  </div>
                )}
                <div>
                  <span className="text-moon-gray">Délka záznamu:</span>
                  <span className="ml-2 text-stellar-white font-mono">{formatTime(totalDuration)}</span>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
