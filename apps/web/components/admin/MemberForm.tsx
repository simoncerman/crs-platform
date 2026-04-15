'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useSession } from 'next-auth/react';
import { adminFetch } from '@/lib/admin-fetch';

const MEMBERSHIP_TYPES = [
  'Mimořádný člen',
  'Řádný člen',
];

interface MemberFormData {
  name: string;
  dateOfBirth?: string;
  joinedAt?: string;
  email?: string;
  phone?: string;
  gmail?: string;
  address?: string;
  role: string;
  department?: string;
  classification?: string;
  membershipType?: string;
  membershipApplication: boolean;
  gdprConsent: boolean;
  membershipValidity?: string;
}

interface MemberFormProps {
  mode: 'create' | 'edit';
  memberId?: string;
}

function generateGmail(name: string): string {
  const diacriticsMap: Record<string, string> = {
    'á': 'a', 'č': 'c', 'ď': 'd', 'é': 'e', 'ě': 'e', 'í': 'i',
    'ň': 'n', 'ó': 'o', 'ř': 'r', 'š': 's', 'ť': 't', 'ú': 'u',
    'ů': 'u', 'ý': 'y', 'ž': 'z',
    'Á': 'a', 'Č': 'c', 'Ď': 'd', 'É': 'e', 'Ě': 'e', 'Í': 'i',
    'Ň': 'n', 'Ó': 'o', 'Ř': 'r', 'Š': 's', 'Ť': 't', 'Ú': 'u',
    'Ů': 'u', 'Ý': 'y', 'Ž': 'z',
  };
  const stripped = name
    .trim()
    .split('')
    .map(ch => diacriticsMap[ch] || ch)
    .join('')
    .toLowerCase();
  const parts = stripped.split(/\s+/).filter(Boolean);
  if (parts.length < 2) return '';
  return `${parts[0]}.${parts[parts.length - 1]}@czechrockets.com`;
}

export default function MemberForm({ mode, memberId }: MemberFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(mode === 'edit');
  const [error, setError] = useState('');
  const [onboarding, setOnboarding] = useState<{ googleAccount: boolean; notionWorkspace: boolean; slackInvite: boolean; notionDatabase: boolean } | null>(null);
  const [isOnboardingAction, setIsOnboardingAction] = useState(false);
  const fromRecruitment = mode === 'create' ? searchParams.get('fromRecruitment') : null;

  const prefillName = searchParams.get('name') || '';
  const prefillGmail = prefillName ? generateGmail(prefillName) : '';

  const today = new Date().toISOString().split('T')[0];

  const { register, handleSubmit, formState: { errors }, watch, reset, setValue } = useForm<MemberFormData>({
    defaultValues: {
      membershipType: 'Mimořádný člen',
      membershipApplication: !!fromRecruitment,
      gdprConsent: !!fromRecruitment,
      ...(mode === 'create' ? {
        name: prefillName,
        email: searchParams.get('email') || '',
        phone: searchParams.get('phone') || '',
        dateOfBirth: searchParams.get('dateOfBirth') || '',
        joinedAt: today,
        role: searchParams.get('role') || '',
        gmail: prefillGmail,
      } : {}),
    },
  });

  const watchName = watch('name');
  const watchJoinedAt = watch('joinedAt');

  // Auto-generate gmail when name changes (until manually edited)
  const [gmailManuallyEdited, setGmailManuallyEdited] = useState(false);
  useEffect(() => {
    if (!gmailManuallyEdited && watchName) {
      const generated = generateGmail(watchName);
      setValue('gmail', generated);
    }
  }, [watchName, gmailManuallyEdited, setValue]);

  // Auto-compute membership validity (6 months from joinedAt)
  const [validityManuallyEdited, setValidityManuallyEdited] = useState(false);
  useEffect(() => {
    if (!validityManuallyEdited && watchJoinedAt) {
      const d = new Date(watchJoinedAt);
      d.setMonth(d.getMonth() + 6);
      const formatted = `do ${d.getDate()}. ${d.getMonth() + 1}. ${d.getFullYear()}`;
      setValue('membershipValidity', formatted);
    }
  }, [watchJoinedAt, validityManuallyEdited, setValue]);

  // Load member data for edit mode
  useEffect(() => {
    if (mode === 'create') {
      setIsLoading(false);
      return;
    }

    if (mode === 'edit' && memberId) {
      if (status === 'loading') return;
      if (!session?.accessToken) {
        setError('Chyba autentizace');
        setIsLoading(false);
        return;
      }

      const loadMember = async () => {
        try {
          const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
          const response = await adminFetch(`${API_URL}/api/members/${memberId}`, {
            accessToken: session.accessToken,
          });
          if (!response.ok) throw new Error('Člen nenalezen');
          const data = await response.json();
          const m = data.member;
          reset({
            name: m.name,
            dateOfBirth: m.dateOfBirth || '',
            joinedAt: m.joinedAt ? new Date(m.joinedAt).toISOString().split('T')[0] : '',
            email: m.email || '',
            phone: m.phone || '',
            gmail: m.gmail || '',
            address: m.address || '',
            role: m.role,
            department: m.department || '',
            classification: m.classification || '',
            membershipType: m.membershipType || '',
            membershipApplication: m.membershipApplication || false,
            gdprConsent: m.gdprConsent || false,
            membershipValidity: m.membershipValidity || '',
          });
          setGmailManuallyEdited(true);
          setOnboarding(m.onboardingChecklist || { googleAccount: false, notionWorkspace: false, slackInvite: false, notionDatabase: false });
          setIsLoading(false);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Něco se pokazilo');
          setIsLoading(false);
        }
      };
      loadMember();
    }
  }, [mode, memberId, session?.accessToken, status, reset]);

  const onSubmit = async (data: MemberFormData) => {
    setIsSubmitting(true);
    setError('');

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      if (!session?.accessToken) throw new Error('Nejste přihlášen');

      const url = mode === 'create'
        ? `${API_URL}/api/members`
        : `${API_URL}/api/members/${memberId}`;

      const response = await adminFetch(url, {
        method: mode === 'create' ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        accessToken: session.accessToken,
        body: JSON.stringify({
          name: data.name,
          dateOfBirth: data.dateOfBirth || '',
          role: data.role,
          email: data.email || '',
          phone: data.phone || '',
          gmail: data.gmail || '',
          address: data.address || '',
          department: data.department || '',
          classification: data.classification || '',
          membershipType: data.membershipType || '',
          membershipApplication: data.membershipApplication,
          gdprConsent: data.gdprConsent,
          membershipValidity: data.membershipValidity || '',
          ...(data.joinedAt ? { joinedAt: new Date(data.joinedAt).toISOString() } : {}),
          ...(fromRecruitment ? { recruitmentId: fromRecruitment } : {}),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = typeof errorData.error === 'string'
          ? errorData.error
          : errorData.error?.message || JSON.stringify(errorData) || 'Něco se pokazilo';
        throw new Error(errorMessage);
      }

      const result = await response.json();

      // If created from recruitment, redirect to edit page to show onboarding checklist
      if (mode === 'create' && fromRecruitment && result.member?.id) {
        router.push(`/admin/members/edit/${result.member.id}`);
      } else {
        router.push('/admin/members');
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = "w-full bg-deep-space/50 border border-cosmic-blue/30 rounded-lg px-3 py-2 text-sm text-stellar-white focus:border-aurora-cyan/50 focus:outline-none transition-colors";
  const labelClass = "block text-stellar-white/80 text-sm mb-1";
  const sectionClass = "bg-deep-space/50 backdrop-blur-sm border border-cosmic-blue/30 rounded-xl p-4 space-y-3";

  if (isLoading) {
    return <div className="flex items-center justify-center py-20"><div className="text-stellar-white text-xl">Načítání...</div></div>;
  }

  if (error && !isLoading && mode === 'edit') {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="text-cosmic-pink text-xl">Chyba</div>
        <div className="text-stellar-white">{error}</div>
        <button onClick={() => router.push('/admin/members')} className="px-6 py-3 bg-cosmic-blue/20 border-2 border-cosmic-blue/50 text-stellar-white rounded-lg hover:bg-cosmic-blue/30">
          Zpět na seznam
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stellar-white">
            {mode === 'create' ? 'Nový člen' : 'Upravit člena'}
          </h1>
        </div>
        {fromRecruitment && (
          <span className="bg-green-500/10 border border-green-500/30 rounded-lg px-3 py-1 text-green-400 text-xs">
            Předvyplněno z náboru
          </span>
        )}
      </div>

      {error && (
        <div className="mb-4 bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-red-400 text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Osobní údaje */}
        <div className={sectionClass}>
          <h3 className="text-sm font-semibold text-stellar-white/60 uppercase tracking-wider">Osobní údaje</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div className="col-span-2">
              <label htmlFor="name" className={labelClass}>Jméno a příjmení *</label>
              <input id="name" type="text" {...register('name', { required: 'Jméno je povinné' })} className={inputClass} placeholder="Jan Novák" />
              {errors.name && <p className="mt-0.5 text-red-400 text-xs">{errors.name.message}</p>}
            </div>
            <div>
              <label htmlFor="dateOfBirth" className={labelClass}>Datum narození</label>
              <input id="dateOfBirth" type="date" {...register('dateOfBirth')} className={inputClass} />
            </div>
            <div>
              <label htmlFor="phone" className={labelClass}>Telefon</label>
              <input id="phone" type="tel" {...register('phone')} className={inputClass} placeholder="+420 123 456 789" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label htmlFor="email" className={labelClass}>Osobní e-mail</label>
              <input id="email" type="email" {...register('email')} className={inputClass} placeholder="jan@example.cz" />
            </div>
            <div>
              <label htmlFor="gmail" className={labelClass}>Spolkový Gmail <span className="text-stellar-white/30">(auto)</span></label>
              <input
                id="gmail"
                type="text"
                {...register('gmail')}
                onChange={(e) => { setValue('gmail', e.target.value); setGmailManuallyEdited(true); }}
                className={inputClass}
                placeholder="jmeno.prijmeni@czechrockets.com"
              />
            </div>
          </div>
          <div>
            <label htmlFor="address" className={labelClass}>Adresa</label>
            <input id="address" type="text" {...register('address')} className={inputClass} placeholder="Ulice 123, 110 00 Praha" />
          </div>
        </div>

        {/* Role + Členství — vedle sebe */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className={sectionClass}>
            <h3 className="text-sm font-semibold text-stellar-white/60 uppercase tracking-wider">Role a zařazení</h3>
            <div>
              <label htmlFor="role" className={labelClass}>Role *</label>
              <input id="role" type="text" {...register('role', { required: 'Role je povinná' })} className={inputClass} placeholder="Avionics Specialist..." />
              {errors.role && <p className="mt-0.5 text-red-400 text-xs">{errors.role.message}</p>}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="department" className={labelClass}>Department</label>
                <input id="department" type="text" {...register('department')} className={inputClass} placeholder="Avionics..." />
              </div>
              <div>
                <label htmlFor="classification" className={labelClass}>Zařazení</label>
                <input id="classification" type="text" {...register('classification')} className={inputClass} placeholder="Junior..." />
              </div>
            </div>
          </div>

          <div className={sectionClass}>
            <h3 className="text-sm font-semibold text-stellar-white/60 uppercase tracking-wider">Členství</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="membershipType" className={labelClass}>Typ členství</label>
                <select id="membershipType" {...register('membershipType')} className={inputClass}>
                  {MEMBERSHIP_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="joinedAt" className={labelClass}>Nástup do spolku</label>
                <input id="joinedAt" type="date" {...register('joinedAt')} className={inputClass} />
              </div>
            </div>
            <div>
              <label htmlFor="membershipValidity" className={labelClass}>Platnost členství <span className="text-stellar-white/30">(auto)</span></label>
              <input
                id="membershipValidity"
                type="text"
                {...register('membershipValidity')}
                onChange={(e) => { setValue('membershipValidity', e.target.value); setValidityManuallyEdited(true); }}
                className={inputClass}
                placeholder="do 31. 12. 2026"
              />
            </div>
            <div className="flex flex-wrap gap-4 pt-1">
              <label className="flex items-center gap-2 text-sm text-stellar-white/80 cursor-pointer">
                <input type="checkbox" {...register('membershipApplication')} className="w-4 h-4 bg-deep-space/50 border border-cosmic-blue/30 rounded text-aurora-cyan focus:ring-aurora-cyan/50" />
                Přihláška
              </label>
              <label className="flex items-center gap-2 text-sm text-stellar-white/80 cursor-pointer">
                <input type="checkbox" {...register('gdprConsent')} className="w-4 h-4 bg-deep-space/50 border border-cosmic-blue/30 rounded text-aurora-cyan focus:ring-aurora-cyan/50" />
                GDPR souhlas
              </label>
            </div>
          </div>
        </div>

        {/* Akce */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-aurora-cyan hover:bg-aurora-cyan/80 text-deep-space font-bold px-6 py-2.5 rounded-lg text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Ukládání...' : mode === 'create' ? (fromRecruitment ? 'Vytvořit člena a pokračovat' : 'Vytvořit člena') : 'Uložit změny'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/admin/members')}
            className="bg-deep-space/50 hover:bg-deep-space text-stellar-white px-6 py-2.5 rounded-lg text-sm transition-all border border-cosmic-blue/30"
          >
            Zrušit
          </button>
        </div>
      </form>

      {/* Onboarding checklist — only in edit mode */}
      {mode === 'edit' && onboarding && memberId && (() => {
        const cl = onboarding;
        const doneCount = [cl.googleAccount, cl.notionWorkspace, cl.slackInvite, cl.notionDatabase].filter(Boolean).length;
        const allDone = doneCount === 4;
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

        const memberData = {
          name: watch('name') || '',
          gmail: watch('gmail') || '',
          email: watch('email') || '',
          phone: watch('phone') || '',
        };

        const copyToClipboard = (text: string) => {
          if (text) navigator.clipboard.writeText(text);
        };

        const CopyField = ({ label, value }: { label: string; value: string }) => (
          value ? (
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); copyToClipboard(value); }}
              className="group flex items-center gap-1.5 px-2 py-1 bg-deep-space/50 hover:bg-cosmic-blue/20 border border-stellar-white/10 hover:border-cosmic-blue/40 rounded text-xs transition-colors"
              title={`Kopírovat ${label}`}
            >
              <span className="text-stellar-white/40">{label}:</span>
              <span className="text-stellar-white/80 font-mono">{value}</span>
              <svg className="w-3 h-3 text-stellar-white/30 group-hover:text-cosmic-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </button>
          ) : null
        );

        const toggleChecklist = async (key: string, value: boolean) => {
          const res = await adminFetch(`${API_URL}/api/members/${memberId}/onboarding`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            accessToken: session?.accessToken || '',
            body: JSON.stringify({ [key]: value }),
          });
          if (res.ok) {
            const data = await res.json();
            setOnboarding(data.member.onboardingChecklist);
          }
        };

        const pushToNotion = async () => {
          setIsOnboardingAction(true);
          try {
            const res = await adminFetch(`${API_URL}/api/members/${memberId}/push-notion`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              accessToken: session?.accessToken || '',
            });
            if (!res.ok) {
              const err = await res.json();
              throw new Error(err.error || 'Notion push failed');
            }
            const data = await res.json();
            setOnboarding({ ...cl, notionDatabase: true });
          } catch (err: any) {
            alert(err.message);
          } finally {
            setIsOnboardingAction(false);
          }
        };

        return (
          <div className="mt-6 bg-cosmic-blue/5 border border-cosmic-blue/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-stellar-white/60 uppercase tracking-wider">Onboarding ({doneCount}/4)</h3>
              {allDone && <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded-full text-xs font-medium border border-green-500/40">Hotovo</span>}
            </div>
            <div className="space-y-2">
              <div className="p-3 rounded-lg border border-stellar-white/10 hover:bg-stellar-white/5 transition-colors">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={cl.googleAccount} onChange={(e) => toggleChecklist('googleAccount', e.target.checked)}
                    className="w-4 h-4 bg-deep-space border border-stellar-white/30 rounded text-green-500 focus:ring-green-500/50" />
                  <p className={`text-sm font-medium ${cl.googleAccount ? 'text-stellar-white/40 line-through' : 'text-stellar-white'}`}>Založit Google účet</p>
                </label>
                <div className="flex flex-wrap gap-1.5 mt-2 ml-7">
                  <CopyField label="Jméno" value={memberData.name} />
                  <CopyField label="Gmail" value={memberData.gmail} />
                  <CopyField label="Email" value={memberData.email} />
                  <CopyField label="Telefon" value={memberData.phone} />
                </div>
              </div>

              <div className="p-3 rounded-lg border border-stellar-white/10 hover:bg-stellar-white/5 transition-colors">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={cl.notionWorkspace} onChange={(e) => toggleChecklist('notionWorkspace', e.target.checked)}
                    className="w-4 h-4 bg-deep-space border border-stellar-white/30 rounded text-green-500 focus:ring-green-500/50" />
                  <p className={`text-sm font-medium ${cl.notionWorkspace ? 'text-stellar-white/40 line-through' : 'text-stellar-white'}`}>Přidat na Notion workspace</p>
                </label>
                <div className="flex flex-wrap gap-1.5 mt-2 ml-7">
                  <CopyField label="Gmail" value={memberData.gmail} />
                </div>
              </div>

              <div className="p-3 rounded-lg border border-stellar-white/10 hover:bg-stellar-white/5 transition-colors">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={cl.slackInvite} onChange={(e) => toggleChecklist('slackInvite', e.target.checked)}
                    className="w-4 h-4 bg-deep-space border border-stellar-white/30 rounded text-green-500 focus:ring-green-500/50" />
                  <p className={`text-sm font-medium ${cl.slackInvite ? 'text-stellar-white/40 line-through' : 'text-stellar-white'}`}>Pozvat na Slack</p>
                </label>
                <div className="flex flex-wrap gap-1.5 mt-2 ml-7">
                  <CopyField label="Gmail" value={memberData.gmail} />
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-lg border border-stellar-white/20 bg-stellar-white/5 hover:bg-stellar-white/10 transition-colors">
                {cl.notionDatabase ? (
                  <span className="w-4 h-4 flex items-center justify-center text-green-500 text-sm">✓</span>
                ) : (
                  <span className="w-4 h-4" />
                )}
                <svg className="w-5 h-5 text-white flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${cl.notionDatabase ? 'text-white/40 line-through' : 'text-white'}`}>Zapsat do Notion DB</p>
                  <p className="text-xs text-white/50">Automatický export přes Notion API</p>
                </div>
                {!cl.notionDatabase && (
                  <button
                    type="button"
                    onClick={pushToNotion}
                    disabled={isOnboardingAction}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-white/10 hover:bg-white/20 text-white border border-white/30 rounded-lg font-medium transition-colors disabled:opacity-50"
                    title="Odeslat data do Notion databáze přes API"
                  >
                    {isOnboardingAction ? 'Odesílám...' : 'Zapsat'}
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
