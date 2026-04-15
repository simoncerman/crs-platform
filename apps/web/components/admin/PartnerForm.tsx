'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useSession } from 'next-auth/react';
import ImageField from '@/components/admin/ImageField';
import { adminFetch } from '@/lib/admin-fetch';

interface PartnerFormData {
  name: string;
  tier: 'diamond' | 'gold' | 'silver';
  logo?: string;
  description?: string;
  fullDescription?: string;
  heroImage?: string;
  website?: string;
  order: number;
  published: boolean;
}

interface PartnerFormProps {
  mode: 'create' | 'edit';
  partnerId?: string;
}

export default function PartnerForm({ mode, partnerId }: PartnerFormProps) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(mode === 'edit');
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors }, watch, reset, setValue } = useForm<PartnerFormData>({
    defaultValues: {
      tier: 'silver',
      order: 1,
      published: true,
    },
  });

  const tier = watch('tier');

  // Load partner data for edit mode
  useEffect(() => {
    // Pro create mode, vypneme loading okamžitě
    if (mode === 'create') {
      setIsLoading(false);
      return;
    }

    // Pro edit mode čekáme na session
    if (mode === 'edit' && partnerId) {
      // Pokud session ještě není ready, čekáme
      if (status === 'loading') {
        console.log('Session loading...');
        return;
      }

      // Pokud nemáme accessToken, chyba
      if (!session?.accessToken) {
        console.error('No access token available');
        setError('Chyba autentizace');
        setIsLoading(false);
        return;
      }

      // Načteme data partnera
      const loadPartner = async () => {
        try {
          const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
          
          console.log('Loading partner:', partnerId);
          const response = await adminFetch(`${API_URL}/api/partners/${partnerId}`, {
            accessToken: session.accessToken,
          });
          
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('Failed to load partner:', response.status, errorData);
            throw new Error(errorData.error || 'Partner nenalezen');
          }

          const data = await response.json();
          console.log('Loaded partner:', data);
          reset({
            name: data.partner.name,
            tier: data.partner.tier,
            logo: data.partner.logo || '',
            description: data.partner.description || '',
            fullDescription: data.partner.fullDescription || '',
            heroImage: data.partner.heroImage || '',
            website: data.partner.website || '',
            order: data.partner.order,
            published: data.partner.published,
          });
          setIsLoading(false);
        } catch (err) {
          console.error('Error loading partner:', err);
          setError(err instanceof Error ? err.message : 'Něco se pokazilo');
          setIsLoading(false);
        }
      };

      loadPartner();
    }
  }, [mode, partnerId, session?.accessToken, status, reset]);

  const onSubmit = async (data: PartnerFormData) => {
    setIsSubmitting(true);
    setError('');

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      
      if (!session?.accessToken) {
        throw new Error('Nejste přihlášen');
      }

      const url = mode === 'create' 
        ? `${API_URL}/api/partners`
        : `${API_URL}/api/partners/${partnerId}`;

      const method = mode === 'create' ? 'POST' : 'PUT';

      const response = await adminFetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        accessToken: session.accessToken,
        body: JSON.stringify({
          name: data.name,
          tier: data.tier,
          logo: data.logo || null,
          description: data.description || null,
          fullDescription: data.fullDescription || null,
          heroImage: data.heroImage || null,
          website: data.website || null,
          order: data.order,
          published: data.published,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = typeof errorData.error === 'string' 
          ? errorData.error 
          : errorData.error?.message || JSON.stringify(errorData) || 'Něco se pokazilo';
        throw new Error(errorMessage);
      }

      router.push('/admin/partners');
      router.refresh();
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : typeof err === 'object' 
        ? JSON.stringify(err) 
        : String(err);
      setError(errorMessage);
      console.error('Submit error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-stellar-white text-xl">Načítání...</div>
      </div>
    );
  }

  if (error && isLoading === false && mode === 'edit') {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="text-cosmic-pink text-xl">❌ Chyba</div>
        <div className="text-stellar-white">{error}</div>
        <button
          onClick={() => router.push('/admin/partners')}
          className="px-6 py-3 bg-cosmic-blue/20 border-2 border-cosmic-blue/50 text-stellar-white rounded-lg hover:bg-cosmic-blue/30"
        >
          Zpět na seznam
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-stellar-white mb-2">
          {mode === 'create' ? 'Nový partner' : 'Upravit partnera'}
        </h1>
        <p className="text-stellar-white/70">
          {mode === 'create' 
            ? 'Přidejte nového partnera nebo sponzora'
            : 'Upravte informace o partnerovi'}
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-red-500/10 border border-red-500/50 rounded-lg p-4 text-red-400">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Základní informace */}
        <div className="bg-deep-space/50 backdrop-blur-sm border-2 border-cosmic-blue/30 rounded-xl p-6 space-y-4">
          <h2 className="text-2xl font-bold text-stellar-white mb-4">
            Základní informace
          </h2>

          {/* Název */}
          <div>
            <label htmlFor="name" className="block text-stellar-white font-medium mb-2">
              Název partnera *
            </label>
            <input
              id="name"
              type="text"
              {...register('name', { required: 'Název je povinný' })}
              className="w-full bg-deep-space/50 border-2 border-cosmic-blue/30 rounded-lg px-4 py-3 text-stellar-white focus:border-aurora-cyan/50 focus:outline-none transition-colors"
              placeholder="Název společnosti"
            />
            {errors.name && (
              <p className="mt-1 text-red-400 text-sm">{errors.name.message}</p>
            )}
          </div>

          {/* Úroveň partnerství */}
          <div>
            <label htmlFor="tier" className="block text-stellar-white font-medium mb-2">
              Úroveň partnerství *
            </label>
            <select
              id="tier"
              {...register('tier', { required: 'Úroveň je povinná' })}
              className="w-full bg-deep-space border-2 border-cosmic-blue/30 rounded-lg px-4 py-3 text-stellar-white focus:border-aurora-cyan/50 focus:outline-none transition-colors"
            >
              <option value="diamond" className="bg-deep-space text-stellar-white">Diamond - Hlavní strategický partner</option>
              <option value="gold" className="bg-deep-space text-stellar-white">Gold - Významný partner</option>
              <option value="silver" className="bg-deep-space text-stellar-white">Silver - Podporující partner</option>
            </select>
            {errors.tier && (
              <p className="mt-1 text-red-400 text-sm">{errors.tier.message}</p>
            )}
          </div>

          {/* Website */}
          <div>
            <label htmlFor="website" className="block text-stellar-white font-medium mb-2">
              Webová stránka
            </label>
            <input
              id="website"
              type="url"
              {...register('website')}
              className="w-full bg-deep-space/50 border-2 border-cosmic-blue/30 rounded-lg px-4 py-3 text-stellar-white focus:border-aurora-cyan/50 focus:outline-none transition-colors"
              placeholder="https://partner.cz"
            />
          </div>

          {/* Pořadí */}
          <div>
            <label htmlFor="order" className="block text-stellar-white font-medium mb-2">
              Pořadí zobrazení *
            </label>
            <input
              id="order"
              type="number"
              {...register('order', { 
                required: 'Pořadí je povinné',
                valueAsNumber: true,
                min: { value: 1, message: 'Minimální hodnota je 1' }
              })}
              className="w-full bg-deep-space/50 border-2 border-cosmic-blue/30 rounded-lg px-4 py-3 text-stellar-white focus:border-aurora-cyan/50 focus:outline-none transition-colors"
              placeholder="1"
            />
            {errors.order && (
              <p className="mt-1 text-red-400 text-sm">{errors.order.message}</p>
            )}
            <p className="mt-1 text-stellar-white/60 text-sm">
              Čím nižší číslo, tím výše se partner zobrazí
            </p>
          </div>

          {/* Publikováno */}
          <div className="flex items-center gap-3">
            <input
              id="published"
              type="checkbox"
              {...register('published')}
              className="w-5 h-5 bg-deep-space/50 border-2 border-cosmic-blue/30 rounded text-aurora-cyan focus:ring-aurora-cyan/50"
            />
            <label htmlFor="published" className="text-stellar-white font-medium">
              Publikováno (zobrazit na webu)
            </label>
          </div>
        </div>

        {/* Obrázky */}
        <div className="bg-deep-space/50 backdrop-blur-sm border-2 border-cosmic-blue/30 rounded-xl p-6 space-y-4">
          <h2 className="text-2xl font-bold text-stellar-white mb-4">
            Obrázky
          </h2>

          {/* Logo */}
          <ImageField
            value={watch('logo') || ''}
            onChange={(url) => setValue('logo', url)}
            label="Logo partnera"
            required={false}
          />
          <p className="mt-1 text-stellar-white/60 text-sm">
            Doporučená velikost: {tier === 'diamond' ? '400×200px' : tier === 'gold' ? '300×150px' : '200×100px'}
          </p>

          {/* Hero image - pouze pro Diamond */}
          {tier === 'diamond' && (
            <>
              <ImageField
                value={watch('heroImage') || ''}
                onChange={(url) => setValue('heroImage', url)}
                label="Hero obrázek"
                required={false}
              />
              <p className="mt-1 text-stellar-white/60 text-sm">
                Doporučená velikost: 1920×1080px
              </p>
            </>
          )}
        </div>

        {/* Popisy */}
        <div className="bg-deep-space/50 backdrop-blur-sm border-2 border-cosmic-blue/30 rounded-xl p-6 space-y-4">
          <h2 className="text-2xl font-bold text-stellar-white mb-4">
            Popisy
          </h2>

          {/* Krátký popis */}
          <div>
            <label htmlFor="description" className="block text-stellar-white font-medium mb-2">
              Krátký popis
              {(tier === 'gold' || tier === 'silver') && ' *'}
            </label>
            <textarea
              id="description"
              {...register('description', {
                required: (tier === 'gold' || tier === 'silver') ? 'Popis je povinný' : false
              })}
              rows={3}
              className="w-full bg-deep-space/50 border-2 border-cosmic-blue/30 rounded-lg px-4 py-3 text-stellar-white focus:border-aurora-cyan/50 focus:outline-none transition-colors resize-none"
              placeholder="Stručný popis partnera a jeho přínosu..."
            />
            {errors.description && (
              <p className="mt-1 text-red-400 text-sm">{errors.description.message}</p>
            )}
            <p className="mt-1 text-stellar-white/60 text-sm">
              {tier === 'diamond' 
                ? 'Zobrazí se pod názvem partnera'
                : tier === 'gold'
                ? 'Zobrazí se na kartě partnera'
                : 'Nebude se zobrazovat (Silver partneři mají pouze logo)'}
            </p>
          </div>

          {/* Detailní popis - pouze pro Diamond */}
          {tier === 'diamond' && (
            <div>
              <label htmlFor="fullDescription" className="block text-stellar-white font-medium mb-2">
                Detailní popis
              </label>
              <textarea
                id="fullDescription"
                {...register('fullDescription')}
                rows={6}
                className="w-full bg-deep-space/50 border-2 border-cosmic-blue/30 rounded-lg px-4 py-3 text-stellar-white focus:border-aurora-cyan/50 focus:outline-none transition-colors resize-none"
                placeholder="Podrobný popis spolupráce, společných projektů a budoucích plánů..."
              />
              <p className="mt-1 text-stellar-white/60 text-sm">
                Zobrazí se pod krátkým popisem u Diamond partnerů
              </p>
            </div>
          )}
        </div>

        {/* Akce */}
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-aurora-cyan hover:bg-aurora-cyan/80 text-deep-space font-bold px-8 py-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting 
              ? 'Ukládání...' 
              : mode === 'create' 
              ? 'Vytvořit partnera' 
              : 'Uložit změny'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/admin/partners')}
            className="bg-deep-space/50 hover:bg-deep-space text-stellar-white px-8 py-4 rounded-lg transition-all border border-cosmic-blue/30"
          >
            Zrušit
          </button>
        </div>
      </form>
    </div>
  );
}
