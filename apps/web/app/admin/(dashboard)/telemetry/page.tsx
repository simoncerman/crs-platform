'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const TELEMETRY_API = process.env.NEXT_PUBLIC_TELEMETRY_WS_URL?.replace('wss://', 'https://').replace('ws://', 'http://') || 'http://localhost:8082';
const MQTT_WS_URL = process.env.NEXT_PUBLIC_MQTT_WS_URL || 'ws://localhost:9001';

interface HealthStatus {
  status: string;
}

export default function AdminTelemetryPage() {
  const [sessions, setSessions] = useState<string[]>([]);
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [healthError, setHealthError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newSessionId, setNewSessionId] = useState('');
  const [createdSession, setCreatedSession] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([fetchHealth(), fetchSessions()]).finally(() => setLoading(false));
  }, []);

  async function fetchHealth() {
    try {
      const res = await fetch(`${TELEMETRY_API}/health`);
      if (res.ok) {
        setHealth(await res.json());
        setHealthError(false);
      } else {
        setHealthError(true);
      }
    } catch {
      setHealthError(true);
    }
  }

  async function fetchSessions() {
    try {
      const res = await fetch(`${TELEMETRY_API}/api/sessions`);
      if (res.ok) {
        const data = await res.json();
        setSessions(data.sessions || []);
      }
    } catch {
      // Ignore
    }
  }

  async function deleteSession(sessionId: string) {
    if (!confirm(`Opravdu smazat session "${sessionId}" a všechna její data?`)) return;
    setDeleting(sessionId);
    try {
      const res = await fetch(`${TELEMETRY_API}/api/sessions/${sessionId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setSessions((prev) => prev.filter((s) => s !== sessionId));
        if (createdSession === sessionId) setCreatedSession(null);
      } else {
        alert('Chyba při mazání session');
      }
    } catch {
      alert('Nepodařilo se připojit k telemetrickému serveru');
    } finally {
      setDeleting(null);
    }
  }

  function handleCreateSession() {
    const id = newSessionId.trim().replace(/\s+/g, '-').toLowerCase();
    if (!id) return;
    setCreatedSession(id);
    setNewSessionId('');
    setShowCreate(false);
  }

  const mqttBrokerDisplay = MQTT_WS_URL.replace('ws://', '').replace('wss://', '');
  const activeGuideSession = createdSession;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-stellar-white">Telemetrie</h1>
          <p className="text-stellar-white/60 mt-1">
            Správa telemetrických sessions a stav služby
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowCreate(true)}
            className="bg-aurora-cyan/20 hover:bg-aurora-cyan/30 text-aurora-cyan px-4 py-2 rounded-lg transition-colors text-sm border border-aurora-cyan/30"
          >
            + Nová session
          </button>
          <Link
            href="/telemetrie"
            target="_blank"
            className="bg-cosmic-blue/30 hover:bg-cosmic-blue/40 text-stellar-white/70 px-4 py-2 rounded-lg transition-colors text-sm border border-cosmic-blue/30"
          >
            Veřejný dashboard &rarr;
          </Link>
        </div>
      </div>

      {/* Create session modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setShowCreate(false)}>
          <div className="bg-deep-space border border-cosmic-blue/30 rounded-lg p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-stellar-white mb-4">Nová telemetrická session</h3>
            <p className="text-sm text-stellar-white/60 mb-4">
              Zadejte identifikátor session. Pozemní stanice bude odesílat data na tento identifikátor.
            </p>
            <input
              type="text"
              value={newSessionId}
              onChange={(e) => setNewSessionId(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateSession()}
              placeholder="např. launch-2026-04, test-stand-01"
              className="w-full bg-cosmic-blue/20 border border-cosmic-blue/30 rounded-lg px-4 py-2 text-stellar-white placeholder:text-stellar-white/30 focus:outline-none focus:border-aurora-cyan/50 font-mono text-sm mb-4"
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowCreate(false)}
                className="px-4 py-2 text-sm text-stellar-white/60 hover:text-stellar-white transition-colors"
              >
                Zrušit
              </button>
              <button
                onClick={handleCreateSession}
                disabled={!newSessionId.trim()}
                className="px-4 py-2 text-sm bg-aurora-cyan/20 hover:bg-aurora-cyan/30 text-aurora-cyan rounded-lg border border-aurora-cyan/30 disabled:opacity-30 transition-colors"
              >
                Vytvořit a zobrazit návod
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Service status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-cosmic-blue/30 rounded-lg p-4 border border-cosmic-blue/20">
          <h3 className="text-sm text-stellar-white/60 mb-2">Telemetry Server</h3>
          <div className="flex items-center gap-2">
            <span
              className={`inline-block w-3 h-3 rounded-full ${
                health && !healthError ? 'bg-green-500' : 'bg-red-500'
              }`}
            />
            <span className="text-stellar-white font-medium">
              {loading ? 'Kontroluji...' : health && !healthError ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>
        <div className="bg-cosmic-blue/30 rounded-lg p-4 border border-cosmic-blue/20">
          <h3 className="text-sm text-stellar-white/60 mb-2">MQTT Broker</h3>
          <span className="text-stellar-white/60 text-sm">Mosquitto 2.0</span>
        </div>
        <div className="bg-cosmic-blue/30 rounded-lg p-4 border border-cosmic-blue/20">
          <h3 className="text-sm text-stellar-white/60 mb-2">InfluxDB</h3>
          <span className="text-stellar-white/60 text-sm">Bucket: telemetry</span>
        </div>
      </div>

      {/* Connection guide for newly created session */}
      {activeGuideSession && (
        <div className="mb-8 bg-aurora-cyan/5 rounded-lg border border-aurora-cyan/20 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-aurora-cyan">
              Připojení k session: <span className="font-mono">{activeGuideSession}</span>
            </h3>
            <button
              onClick={() => setCreatedSession(null)}
              className="text-stellar-white/40 hover:text-stellar-white text-sm"
            >
              Zavřít
            </button>
          </div>

          <p className="text-sm text-stellar-white/60 mb-4">
            Nastavte pozemní stanici tak, aby publikovala data na MQTT broker s tímto session ID.
            Data se automaticky zobrazí v dashboardu.
          </p>

          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-semibold text-stellar-white mb-2">MQTT konfigurace</h4>
              <div className="bg-cosmic-blue/20 rounded p-3 font-mono text-xs space-y-1">
                <div><span className="text-moon-gray">Broker:</span> <span className="text-aurora-cyan">{mqttBrokerDisplay}</span></div>
                <div><span className="text-moon-gray">QoS:</span> <span className="text-stellar-white">1</span></div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-stellar-white mb-2">Topiky pro odesílání</h4>
              <div className="bg-cosmic-blue/20 rounded p-3 font-mono text-xs space-y-1">
                <div className="text-stellar-white">{activeGuideSession}/rocket/<span className="text-moon-gray">{'{device_id}'}</span>/telemetry/position</div>
                <div className="text-stellar-white">{activeGuideSession}/rocket/<span className="text-moon-gray">{'{device_id}'}</span>/telemetry/velocity</div>
                <div className="text-stellar-white">{activeGuideSession}/rocket/<span className="text-moon-gray">{'{device_id}'}</span>/telemetry/sensors</div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-stellar-white mb-2">Příklad payloadu (position)</h4>
              <div className="bg-cosmic-blue/20 rounded p-3 font-mono text-xs">
                <pre className="text-stellar-white/80">{`{
  "alt": 1250.5,
  "lat": 49.195,
  "lon": 16.608,
  "ts": ${Date.now()}
}`}</pre>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Link
                href={`/telemetrie/live/${activeGuideSession}`}
                target="_blank"
                className="text-xs bg-aurora-cyan/20 hover:bg-aurora-cyan/30 text-aurora-cyan px-3 py-1.5 rounded border border-aurora-cyan/30 transition-colors"
              >
                Otevřít live dashboard &rarr;
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Sessions list */}
      <div className="bg-cosmic-blue/30 rounded-lg border border-cosmic-blue/20 overflow-hidden">
        <div className="px-6 py-4 border-b border-cosmic-blue/20">
          <h2 className="text-lg font-semibold text-stellar-white">
            Zaznamenané sessions ({sessions.length})
          </h2>
        </div>

        {sessions.length === 0 ? (
          <div className="px-6 py-12 text-center text-stellar-white/40">
            <p className="text-lg mb-2">Žádné sessions v databázi</p>
            <p className="text-sm">
              Klikněte na &quot;Nová session&quot; pro vytvoření a zobrazení návodu k připojení.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-cosmic-blue/20">
            {sessions.map((sessionId) => (
              <div
                key={sessionId}
                className="px-6 py-3 flex items-center justify-between hover:bg-cosmic-blue/10"
              >
                <div className="flex items-center gap-3">
                  <span className="inline-block w-2 h-2 rounded-full bg-aurora-cyan" />
                  <span className="font-mono text-stellar-white">{sessionId}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Link
                    href={`/telemetrie/live/${sessionId}`}
                    target="_blank"
                    className="text-xs text-aurora-cyan hover:underline"
                  >
                    Živě
                  </Link>
                  <Link
                    href={`/telemetrie/playback/${sessionId}`}
                    target="_blank"
                    className="text-xs text-moon-gray hover:text-stellar-white"
                  >
                    Historie
                  </Link>
                  <button
                    onClick={() => deleteSession(sessionId)}
                    disabled={deleting === sessionId}
                    className="text-red-400 hover:text-red-300 disabled:opacity-50 p-1 rounded hover:bg-red-500/10 transition-colors"
                    title="Smazat session a všechna data"
                  >
                    {deleting === sessionId ? (
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
