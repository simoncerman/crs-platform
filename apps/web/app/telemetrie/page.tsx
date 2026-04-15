'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

const TELEMETRY_API = process.env.NEXT_PUBLIC_TELEMETRY_WS_URL?.replace('wss://', 'https://').replace('ws://', 'http://') || 'http://localhost:8082';

export default function TelemetriePage() {
  const [sessions, setSessions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [manualSession, setManualSession] = useState('');

  useEffect(() => {
    fetchSessions();
  }, []);

  async function fetchSessions() {
    try {
      const res = await fetch(`${TELEMETRY_API}/api/sessions`);
      if (!res.ok) throw new Error('Nepodařilo se načíst sessions');
      const data = await res.json();
      setSessions(data.sessions || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chyba připojení k telemetry serveru');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-cosmic-black text-stellar-white pt-20">
      {/* Header */}
      <header className="bg-deep-space/80 backdrop-blur-sm border-b border-cosmic-blue/30">
        <div className="max-w-5xl mx-auto px-6 py-8">
          <Link
            href="/"
            className="text-sm text-moon-gray hover:text-aurora-cyan transition-colors"
          >
            &larr; Zpět na hlavní stránku
          </Link>
          <h1 className="text-3xl font-heading font-bold mt-4">Telemetrie</h1>
          <p className="text-moon-gray mt-2">
            Sledujte živá data z raketových startů a testů motorů v reálném čase.
          </p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {/* Manual session input */}
        <div className="bg-deep-space/50 border border-cosmic-blue/30 rounded-lg p-6">
          <h2 className="text-lg font-medium mb-4">Připojit se k session</h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={manualSession}
              onChange={(e) => setManualSession(e.target.value)}
              placeholder="Zadejte Session ID (např. demo-sim)"
              className="flex-1 bg-cosmic-blue/20 border border-cosmic-blue/30 rounded-lg px-4 py-2 text-stellar-white placeholder:text-moon-gray/50 focus:outline-none focus:border-aurora-cyan/50"
            />
            <Link
              href={manualSession ? `/telemetrie/live/${manualSession}` : '#'}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                manualSession
                  ? 'bg-aurora-cyan/20 text-aurora-cyan border border-aurora-cyan/50 hover:bg-aurora-cyan/30'
                  : 'bg-cosmic-blue/10 text-moon-gray/50 border border-cosmic-blue/20 cursor-not-allowed'
              }`}
            >
              Sledovat živě
            </Link>
            <Link
              href={manualSession ? `/telemetrie/playback/${manualSession}` : '#'}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                manualSession
                  ? 'bg-cosmic-blue/20 text-stellar-white border border-cosmic-blue/50 hover:bg-cosmic-blue/30'
                  : 'bg-cosmic-blue/10 text-moon-gray/50 border border-cosmic-blue/20 cursor-not-allowed'
              }`}
            >
              Přehrát záznam
            </Link>
          </div>
        </div>

        {/* Sessions list */}
        <div>
          <h2 className="text-lg font-medium mb-4">Dostupné sessions</h2>

          {loading && (
            <div className="text-moon-gray text-center py-8">Načítání...</div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400 text-sm">
              {error}
              <p className="mt-2 text-moon-gray text-xs">
                Zkontrolujte, zda běží telemetry server na {TELEMETRY_API}
              </p>
            </div>
          )}

          {!loading && !error && sessions.length === 0 && (
            <div className="text-center py-12 text-moon-gray">
              <p className="text-lg mb-2">Žádné aktivní sessions</p>
              <p className="text-sm">
                Spusťte simulátor:{' '}
                <code className="text-aurora-cyan bg-cosmic-blue/20 px-2 py-1 rounded text-xs">
                  cd apps/telemetry && go run cmd/simulator/main.go --session demo-sim
                </code>
              </p>
            </div>
          )}

          <div className="grid gap-3">
            {sessions.map((sessionId, i) => (
              <motion.div
                key={sessionId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <div className="bg-deep-space/50 border border-cosmic-blue/30 rounded-lg p-4 hover:border-aurora-cyan/40 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <span className="font-mono text-aurora-cyan">{sessionId}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Link
                        href={`/telemetrie/live/${sessionId}`}
                        className="text-sm text-aurora-cyan hover:text-aurora-cyan/80 transition-colors"
                      >
                        Živě &rarr;
                      </Link>
                      <Link
                        href={`/telemetrie/playback/${sessionId}`}
                        className="text-sm text-moon-gray hover:text-stellar-white transition-colors"
                      >
                        Záznam &rarr;
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
