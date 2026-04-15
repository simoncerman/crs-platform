'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { cs } from 'date-fns/locale';
import { useSession } from 'next-auth/react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

type Status = 'pending' | 'interview_scheduled' | 'interviewed' | 'accepted' | 'documents_sent' | 'completed' | 'rejected';

interface Submission {
  id: string;
  name: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  education?: string;
  experience?: string;
  motivation?: string;
  skills?: string;
  interests?: string;
  preferredRole?: string;
  availability?: string;
  task?: string;
  taskTitle?: string;
  status: Status;
  notes?: string;
  interviewDate?: string;
  interviewNotes?: string;
  rejectionStep?: string;
  onboardingChecklist?: {
    googleAccount: boolean;
    notionWorkspace: boolean;
    slackInvite: boolean;
    notionDatabase: boolean;
  };
  createdAt: string;
}

const FLOW_STEPS: { status: Status; label: string; icon: string }[] = [
  { status: 'pending', label: 'Kontrola', icon: '📋' },
  { status: 'interview_scheduled', label: 'Pohovor', icon: '📅' },
  { status: 'interviewed', label: 'Rozhodnutí', icon: '🤔' },
  { status: 'accepted', label: 'Přijat', icon: '✅' },
  { status: 'documents_sent', label: 'Dokumenty', icon: '📄' },
  { status: 'completed', label: 'Dokončeno', icon: '🎉' },
];

function getStepIndex(status: Status): number {
  if (status === 'rejected') return -1;
  return FLOW_STEPS.findIndex(s => s.status === status);
}

interface RecruitmentDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function RecruitmentDetailPage({ params }: RecruitmentDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { data: session } = useSession();
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isActing, setIsActing] = useState(false);
  const [notes, setNotes] = useState('');
  const [interviewNotes, setInterviewNotes] = useState('');
  const [isSavingNotes, setIsSavingNotes] = useState(false);
  const [notesSaved, setNotesSaved] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [interviewDateInput, setInterviewDateInput] = useState('');
  const [showStatusOverride, setShowStatusOverride] = useState(false);

  const authHeaders = (): HeadersInit => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session?.accessToken}`,
  });

  const loadSubmission = async () => {
    try {
      const response = await fetch(`${API_URL}/api/recruitment/${id}`, {
        headers: { 'Authorization': `Bearer ${session?.accessToken}` },
      });
      if (!response.ok) throw new Error('Přihláška nenalezena');
      const data = await response.json();
      setSubmission(data.submission);
      setNotes(data.submission.notes || '');
      setInterviewNotes(data.submission.interviewNotes || '');
      if (data.submission.interviewDate) setInterviewDateInput(data.submission.interviewDate);
    } catch {
      setSubmission(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (session?.accessToken) loadSubmission();
  }, [session, id]);

  const flowAction = async (endpoint: string, body?: Record<string, unknown>) => {
    setIsActing(true);
    try {
      const response = await fetch(`${API_URL}/api/recruitment/${id}/${endpoint}`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(body || {}),
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Akce selhala');
      }
      await loadSubmission();
      setShowRejectDialog(false);
      setRejectionReason('');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsActing(false);
    }
  };

  const saveNotes = async () => {
    setIsSavingNotes(true);
    setNotesSaved(false);
    try {
      const response = await fetch(`${API_URL}/api/recruitment/${id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ notes, interviewNotes }),
      });
      if (!response.ok) throw new Error('Nepodařilo se uložit');
      setNotesSaved(true);
      setTimeout(() => setNotesSaved(false), 2000);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSavingNotes(false);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center py-20"><div className="text-stellar-white text-xl">Načítání...</div></div>;
  }

  if (!submission) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl text-stellar-white">Přihláška nenalezena</h1>
        <button onClick={() => router.back()} className="mt-4 text-cosmic-blue">Zpět</button>
      </div>
    );
  }

  const currentStepIdx = getStepIndex(submission.status);
  const isRejected = submission.status === 'rejected';
  const isCompleted = submission.status === 'completed';

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button onClick={() => router.push('/admin/recruitment')} className="text-aurora-cyan hover:text-white mb-2 flex items-center gap-1 transition-colors">
            ← Zpět na seznam
          </button>
          <h1 className="text-3xl font-bold text-stellar-white">{submission.name}</h1>
          <p className="text-stellar-white/60">
            Přijato: {format(new Date(submission.createdAt), 'd. MMMM yyyy HH:mm', { locale: cs })}
          </p>
        </div>
        {isRejected && (
          <div className="flex items-center gap-3">
            <span className="px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/50 rounded-lg text-sm font-medium">
              Zamítnuto {submission.rejectionStep ? `(ve fázi: ${FLOW_STEPS.find(s => s.status === submission.rejectionStep)?.label || submission.rejectionStep})` : ''}
            </span>
            <button
              onClick={() => flowAction('set-status', { status: submission.rejectionStep || 'pending' })}
              disabled={isActing}
              className="px-3 py-2 text-xs bg-stellar-white/5 hover:bg-stellar-white/10 text-stellar-white/70 border border-stellar-white/20 rounded-lg transition-colors disabled:opacity-50"
            >
              Vrátit zpět
            </button>
          </div>
        )}
      </div>

      {/* Flow pipeline */}
      {!isRejected && (
        <div className="bg-cosmic-black/50 border border-stellar-white/10 rounded-xl p-6">
          <div className="flex items-center justify-between">
            {FLOW_STEPS.map((step, idx) => {
              const isActive = idx === currentStepIdx;
              const isDone = idx < currentStepIdx;
              return (
                <div key={step.status} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg border-2 transition-all ${
                      isDone
                        ? 'bg-green-500/20 border-green-500/50'
                        : isActive
                          ? 'bg-cosmic-blue/20 border-cosmic-blue ring-2 ring-cosmic-blue/30'
                          : 'bg-stellar-white/5 border-stellar-white/20'
                    }`}>
                      {isDone ? '✓' : step.icon}
                    </div>
                    <span className={`mt-2 text-xs font-medium text-center ${
                      isActive ? 'text-cosmic-blue' : isDone ? 'text-green-400' : 'text-stellar-white/40'
                    }`}>
                      {step.label}
                    </span>
                  </div>
                  {idx < FLOW_STEPS.length - 1 && (
                    <div className={`h-0.5 w-full mx-1 ${idx < currentStepIdx ? 'bg-green-500/50' : 'bg-stellar-white/10'}`} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Rollback / override status */}
          <div className="mt-4 pt-4 border-t border-stellar-white/10 flex items-center justify-between">
            {!showStatusOverride ? (
              <button
                onClick={() => setShowStatusOverride(true)}
                className="text-xs text-stellar-white/40 hover:text-stellar-white/70 transition-colors"
              >
                Změnit krok ručně...
              </button>
            ) : (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-stellar-white/50">Přepnout na:</span>
                {FLOW_STEPS.map((step) => (
                  step.status !== submission.status && (
                    <button
                      key={step.status}
                      onClick={() => { flowAction('set-status', { status: step.status }); setShowStatusOverride(false); }}
                      disabled={isActing}
                      className="px-2 py-1 text-xs bg-stellar-white/5 hover:bg-stellar-white/10 text-stellar-white/70 border border-stellar-white/20 rounded transition-colors disabled:opacity-50"
                    >
                      {step.icon} {step.label}
                    </button>
                  )
                ))}
                <button
                  onClick={() => setShowStatusOverride(false)}
                  className="px-2 py-1 text-xs text-stellar-white/40 hover:text-stellar-white/70 transition-colors"
                >
                  Zrušit
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Active step action card */}
      {!isRejected && !isCompleted && (
        <div className="bg-cosmic-blue/5 border-2 border-cosmic-blue/30 rounded-xl p-6">
          <h2 className="text-lg font-bold text-stellar-white mb-4">
            {FLOW_STEPS[currentStepIdx]?.icon} {FLOW_STEPS[currentStepIdx]?.label}
          </h2>

          {/* pending → confirm interview */}
          {submission.status === 'pending' && (
            <div className="space-y-4">
              <p className="text-stellar-white/70 text-sm">
                Zkontroluj přihlášku níže. Pokud je vše v pořádku, potvrď interview a zadej datum.
              </p>
              <div>
                <label className="block text-sm text-stellar-white/60 mb-1">Datum a čas pohovoru</label>
                <input
                  type="datetime-local"
                  value={interviewDateInput}
                  onChange={(e) => setInterviewDateInput(e.target.value)}
                  className="bg-cosmic-black border border-stellar-white/20 rounded-lg px-4 py-2 text-stellar-white focus:outline-none focus:border-cosmic-blue transition-colors"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    if (!interviewDateInput) { alert('Zadej datum pohovoru'); return; }
                    const formatted = format(new Date(interviewDateInput), "d. MMMM yyyy 'v' HH:mm", { locale: cs });
                    flowAction('confirm-interview', { interviewDate: formatted });
                  }}
                  disabled={isActing}
                  className="px-5 py-2 bg-cosmic-blue hover:bg-aurora-cyan text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  Potvrdit interview
                </button>
                <button
                  onClick={() => setShowRejectDialog(true)}
                  disabled={isActing}
                  className="px-5 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  Zamítnout
                </button>
              </div>
            </div>
          )}

          {/* interview_scheduled → mark as interviewed */}
          {submission.status === 'interview_scheduled' && (
            <div className="space-y-4">
              <p className="text-stellar-white/70 text-sm">
                Interview naplánováno na <strong className="text-stellar-white">{submission.interviewDate}</strong>.
                Po provedení pohovoru zapiš poznámky a označ jako provedený.
              </p>
              <div>
                <label className="block text-sm text-stellar-white/60 mb-1">Poznámky z pohovoru</label>
                <textarea
                  value={interviewNotes}
                  onChange={(e) => setInterviewNotes(e.target.value)}
                  placeholder="Poznámky z pohovoru..."
                  rows={4}
                  className="w-full bg-cosmic-black border border-stellar-white/20 rounded-lg px-4 py-3 text-stellar-white placeholder-stellar-white/30 focus:outline-none focus:border-cosmic-blue transition-colors resize-y"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={async () => { await saveNotes(); flowAction('mark-interviewed'); }}
                  disabled={isActing}
                  className="px-5 py-2 bg-cosmic-blue hover:bg-aurora-cyan text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  Interview proběhlo
                </button>
                <button
                  onClick={() => setShowRejectDialog(true)}
                  disabled={isActing}
                  className="px-5 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  Zamítnout
                </button>
              </div>
            </div>
          )}

          {/* interviewed → accept or reject */}
          {submission.status === 'interviewed' && (
            <div className="space-y-4">
              <p className="text-stellar-white/70 text-sm">
                Interview proběhlo. Rozhodněte o přijetí uchazeče.
              </p>
              {submission.interviewNotes && (
                <div className="bg-cosmic-black/50 border border-stellar-white/10 rounded-lg p-4">
                  <p className="text-xs text-stellar-white/50 uppercase tracking-wider mb-2">Poznámky z pohovoru</p>
                  <p className="text-stellar-white text-sm whitespace-pre-wrap">{submission.interviewNotes}</p>
                </div>
              )}
              <div className="flex gap-3">
                <button
                  onClick={() => flowAction('accept')}
                  disabled={isActing}
                  className="px-5 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/40 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  Přijmout
                </button>
                <button
                  onClick={() => setShowRejectDialog(true)}
                  disabled={isActing}
                  className="px-5 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg font-medium transition-colors disabled:opacity-50"
                >
                  Zamítnout
                </button>
              </div>
            </div>
          )}

          {/* accepted → send documents */}
          {submission.status === 'accepted' && (
            <div className="space-y-4">
              <p className="text-stellar-white/70 text-sm">
                Uchazeč přijat. Odešli mu e-mail s přihláškou do spolku a GDPR souhlasem.
              </p>
              <button
                onClick={() => flowAction('send-documents')}
                disabled={isActing}
                className="px-5 py-2 bg-cosmic-blue hover:bg-aurora-cyan text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                Odeslat dokumenty e-mailem
              </button>
            </div>
          )}

          {/* documents_sent → complete */}
          {submission.status === 'documents_sent' && (
            <div className="space-y-4">
              <p className="text-stellar-white/70 text-sm">
                Dokumenty odeslány. Jakmile uchazeč vrátí vyplněné dokumenty, dokonči nábor a vytvoř nového člena.
              </p>
              <button
                onClick={async () => {
                  await flowAction('complete');
                  const params = new URLSearchParams({
                    fromRecruitment: id,
                    name: submission.name,
                    email: submission.email,
                  });
                  if (submission.phone) params.set('phone', submission.phone);
                  if (submission.dateOfBirth) params.set('dateOfBirth', submission.dateOfBirth);
                  if (submission.preferredRole) params.set('role', submission.preferredRole);
                  router.push(`/admin/members/new?${params.toString()}`);
                }}
                disabled={isActing}
                className="px-5 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/40 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                Dokumenty přijaty — dokončit nábor a vytvořit člena
              </button>
            </div>
          )}
        </div>
      )}

      {/* Completed banner */}
      {isCompleted && (
        <div className="bg-green-500/10 border-2 border-green-500/30 rounded-xl p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎉</span>
            <div>
              <h2 className="text-lg font-bold text-green-400">Nábor dokončen</h2>
              <p className="text-stellar-white/50 text-xs">Pokračuj vytvořením člena a onboardingem</p>
            </div>
          </div>
          <a
            href={`/admin/members/new?fromRecruitment=${id}&name=${encodeURIComponent(submission.name)}&email=${encodeURIComponent(submission.email)}${submission.phone ? `&phone=${encodeURIComponent(submission.phone)}` : ''}${submission.dateOfBirth ? `&dateOfBirth=${encodeURIComponent(submission.dateOfBirth)}` : ''}${submission.preferredRole ? `&role=${encodeURIComponent(submission.preferredRole)}` : ''}`}
            className="px-5 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/40 rounded-lg font-medium transition-colors text-sm"
          >
            Vytvořit člena
          </a>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-cosmic-black/50 border border-stellar-white/10 rounded-xl p-6 space-y-6">
            <section>
              <h3 className="text-sm font-medium text-stellar-white/50 uppercase tracking-wider mb-3">Motivace</h3>
              <p className="text-stellar-white whitespace-pre-wrap">{submission.motivation || 'Neuvedeno'}</p>
            </section>

            <section>
              <h3 className="text-sm font-medium text-stellar-white/50 uppercase tracking-wider mb-3">Zkušenosti</h3>
              <p className="text-stellar-white whitespace-pre-wrap">{submission.experience || 'Neuvedeno'}</p>
            </section>

            <section>
              <h3 className="text-sm font-medium text-stellar-white/50 uppercase tracking-wider mb-3">Vzdělání</h3>
              <p className="text-stellar-white">{submission.education || 'Neuvedeno'}</p>
            </section>

            <section>
              <h3 className="text-sm font-medium text-stellar-white/50 uppercase tracking-wider mb-3">Dovednosti</h3>
              <p className="text-stellar-white whitespace-pre-wrap">{submission.skills || 'Neuvedeno'}</p>
            </section>

            <section>
              <h3 className="text-sm font-medium text-stellar-white/50 uppercase tracking-wider mb-3">Oblast zájmu</h3>
              <p className="text-stellar-white whitespace-pre-wrap">{submission.interests || 'Neuvedeno'}</p>
            </section>

            {(submission.task || submission.taskTitle) && (
              <section>
                <h3 className="text-sm font-medium text-stellar-white/50 uppercase tracking-wider mb-3">Úloha</h3>
                {submission.taskTitle && (
                  <div className="bg-cosmic-blue/10 border border-cosmic-blue/20 rounded-lg p-4 mb-3">
                    <p className="text-xs text-stellar-white/40 uppercase tracking-wider mb-1">Zadání</p>
                    <p className="text-stellar-white font-medium">{submission.taskTitle}</p>
                  </div>
                )}
                {submission.task && (
                  <>
                    <p className="text-xs text-stellar-white/40 uppercase tracking-wider mb-2">Odpověď uchazeče</p>
                    <p className="text-stellar-white whitespace-pre-wrap bg-cosmic-black/30 border border-stellar-white/5 rounded-lg p-4">{submission.task}</p>
                  </>
                )}
              </section>
            )}
          </div>

          {/* Admin notes */}
          <div className="bg-cosmic-black/50 border border-stellar-white/10 rounded-xl p-6">
            <h3 className="text-sm font-medium text-stellar-white/50 uppercase tracking-wider mb-3">Interní poznámky</h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Poznámky k uchazeči (viditelné pouze pro adminy)..."
              rows={4}
              className="w-full bg-cosmic-black border border-stellar-white/20 rounded-lg px-4 py-3 text-stellar-white placeholder-stellar-white/30 focus:outline-none focus:border-cosmic-blue transition-colors resize-y"
            />
            <div className="flex items-center gap-3 mt-3">
              <button
                onClick={saveNotes}
                disabled={isSavingNotes}
                className="px-4 py-2 bg-cosmic-blue hover:bg-aurora-cyan text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {isSavingNotes ? 'Ukládání...' : 'Uložit poznámky'}
              </button>
              {notesSaved && <span className="text-green-400 text-sm">Uloženo</span>}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-cosmic-black/50 border border-stellar-white/10 rounded-xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-stellar-white mb-2">Kontaktní údaje</h3>

            <div>
              <p className="text-xs text-stellar-white/50 uppercase">E-mail</p>
              <a href={`mailto:${submission.email}`} className="text-aurora-cyan hover:text-white hover:underline transition-colors">{submission.email}</a>
            </div>

            <div>
              <p className="text-xs text-stellar-white/50 uppercase">Telefon</p>
              <p className="text-stellar-white">{submission.phone || 'Neuvedeno'}</p>
            </div>

            <div>
              <p className="text-xs text-stellar-white/50 uppercase">Datum narození</p>
              <p className="text-stellar-white">{submission.dateOfBirth || 'Neuvedeno'}</p>
            </div>

            <div>
              <p className="text-xs text-stellar-white/50 uppercase">Preferovaný tým</p>
              <p className="text-stellar-white font-medium">{submission.preferredRole || 'Neuvedeno'}</p>
            </div>

            <div>
              <p className="text-xs text-stellar-white/50 uppercase">Dostupnost</p>
              <p className="text-stellar-white">{submission.availability || 'Neuvedeno'}</p>
            </div>
          </div>

          {submission.interviewDate && (
            <div className="bg-cosmic-blue/10 border border-cosmic-blue/30 rounded-xl p-6">
              <h3 className="text-sm font-bold text-cosmic-blue mb-1">Pohovor</h3>
              <p className="text-stellar-white font-medium">{submission.interviewDate}</p>
              {submission.interviewNotes && (
                <div className="mt-3 pt-3 border-t border-stellar-white/10">
                  <p className="text-xs text-stellar-white/50 uppercase mb-1">Poznámky</p>
                  <p className="text-stellar-white/80 text-sm whitespace-pre-wrap">{submission.interviewNotes}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Rejection dialog */}
      {showRejectDialog && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-deep-space border-2 border-cosmic-blue/30 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold text-stellar-white mb-1">Zamítnout přihlášku</h3>
            <p className="text-stellar-white/50 text-sm mb-4">
              Uchazeči bude odeslán e-mail o zamítnutí.
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Důvod zamítnutí (volitelné) — uchazeč ho uvidí v e-mailu..."
              rows={4}
              className="w-full bg-cosmic-black/50 border border-cosmic-blue/30 rounded-lg px-4 py-3 text-stellar-white placeholder-stellar-white/30 focus:outline-none focus:border-aurora-cyan transition-colors resize-y mb-4"
              autoFocus
            />
            <div className="flex items-center gap-3 justify-end">
              <button
                onClick={() => { setShowRejectDialog(false); setRejectionReason(''); }}
                className="px-4 py-2 text-stellar-white/60 hover:text-stellar-white transition-colors text-sm"
              >
                Zrušit
              </button>
              <button
                onClick={() => flowAction('reject', rejectionReason.trim() ? { rejectionReason: rejectionReason.trim() } : {})}
                disabled={isActing}
                className="px-5 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-lg font-medium transition-colors text-sm disabled:opacity-50"
              >
                {isActing ? 'Odesílám...' : 'Zamítnout a odeslat e-mail'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
