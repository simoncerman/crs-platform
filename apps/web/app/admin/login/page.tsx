'use client';

import { signIn } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Show error from redirect (e.g. expired session)
  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam) {
      setError(errorParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Nesprávné přihlašovací údaje');
      } else {
        router.push('/admin/dashboard');
        router.refresh();
      }
    } catch (err) {
      setError('Něco se pokazilo. Zkuste to prosím znovu.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cosmic-black flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Logo a nadpis */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-stellar-white mb-2">
            Admin Přihlášení
          </h1>
          <p className="text-stellar-white/70">
            Czech Rocket Society CMS
          </p>
        </div>

        {/* Přihlašovací formulář */}
        <div className="bg-deep-space/50 backdrop-blur-sm border-2 border-cosmic-blue/30 rounded-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-stellar-white mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-cosmic-black/50 border-2 border-cosmic-blue/30 rounded-lg text-stellar-white placeholder-stellar-white/40 focus:outline-none focus:border-aurora-cyan transition-colors"
                placeholder="admin@czechrocketsociety.cz"
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-stellar-white mb-2">
                Heslo
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-cosmic-black/50 border-2 border-cosmic-blue/30 rounded-lg text-stellar-white placeholder-stellar-white/40 focus:outline-none focus:border-aurora-cyan transition-colors"
                placeholder="••••••••"
              />
            </div>

            {/* Error message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-aurora-cyan hover:bg-aurora-cyan/80 text-deep-space font-semibold py-3 px-6 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-aurora-cyan/20"
            >
              {isLoading ? 'Přihlašování...' : 'Přihlásit se'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
