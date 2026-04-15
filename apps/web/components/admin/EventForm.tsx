'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useSession } from 'next-auth/react';
import RichTextEditor from '@/components/ui/RichTextEditor';
import ImageUploader from '@/components/admin/ImageUploader';
import { adminFetch } from '@/lib/admin-fetch';

interface EventFormData {
  title: string;
  slug: string;
  description: string;
  location: string;
  startDate: string;
  endDate: string;
  coverImage?: string;
  specialStatus: '' | 'cancelled' | 'postponed';
  eventType: 'launch' | 'test' | 'recruitment' | 'pr' | 'event';
  published: boolean;
}

interface EventFormProps {
  mode: 'create' | 'edit';
  eventId?: string;
  initialData?: Partial<EventFormData>;
}

export default function EventForm({ mode, eventId, initialData }: EventFormProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(mode === 'edit' && !initialData);
  const [error, setError] = useState('');
  const [description, setDescription] = useState(initialData?.description || '');
  const [showImagePicker, setShowImagePicker] = useState(false);

  const [hasLoaded, setHasLoaded] = useState(false);

  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<EventFormData>({
    defaultValues: initialData || {
      specialStatus: '',
      eventType: 'event',
      published: false,
    },
  });

  const title = watch('title');
  const coverImage = watch('coverImage');

  // Auto-generate slug from title
  useEffect(() => {
    if (mode === 'create' && title) {
      const slug = title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setValue('slug', slug);
    }
  }, [title, mode, setValue]);

  // Load event data for edit mode
  useEffect(() => {
    if (mode === 'edit' && eventId && !initialData && !hasLoaded && session?.accessToken) {
      const loadEvent = async () => {
        try {
          const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
          
          const response = await adminFetch(`${API_URL}/api/events/${eventId}`, {
            accessToken: session.accessToken,
          });
          
          if (!response.ok) {
            throw new Error('Událost nenalezena');
          }

          const data = await response.json();
          const event = data.event;

          // Format dates for datetime-local input
          const formatDate = (dateStr?: string) => {
            if (!dateStr) return '';
            const date = new Date(dateStr);
            return date.toISOString().slice(0, 16);
          };

          reset({
            title: event.title,
            slug: event.slug,
            location: event.location || '',
            startDate: formatDate(event.startDate),
            endDate: formatDate(event.endDate),
            coverImage: event.coverImage || '',
            specialStatus: event.specialStatus || '',
            eventType: event.eventType || 'event',
            published: event.published || false,
          });
          
          setDescription(event.description || '');
          setHasLoaded(true);
        } catch (err: any) {
          setError(err.message || 'Nepodařilo se načíst událost');
        } finally {
          setIsLoading(false);
        }
      };

      loadEvent();
    }
  }, [mode, eventId, initialData, reset, session, hasLoaded]);

  const onSubmit = async (data: EventFormData) => {
    setIsSubmitting(true);
    setError('');

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      
      if (!session?.accessToken) {
        throw new Error('Nejste přihlášen');
      }

      const url = mode === 'create' 
        ? `${API_URL}/api/events` 
        : `${API_URL}/api/events/${eventId}`;
      
      const method = mode === 'create' ? 'POST' : 'PUT';

      // Prepare data for API (convert dates to ISO)
      const payload = {
        ...data,
        description,
        startDate: new Date(data.startDate).toISOString(),
        endDate: new Date(data.endDate).toISOString(),
        specialStatus: data.specialStatus || null,
      };

      const response = await adminFetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        accessToken: session.accessToken,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Nepodařilo se uložit událost');
      }

      // Po vytvoření přesměruj na seznam, při editaci zůstaň a jen obnov data
      if (mode === 'create') {
        router.push('/admin/events');
        router.refresh();
      } else {
        router.refresh();
      }
    } catch (err: any) {
      setError(err.message || 'Něco se pokazilo');
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

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-stellar-white">
          {mode === 'create' ? 'Nová událost' : 'Upravit událost'}
        </h1>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 text-red-400 mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-deep-space/50 border border-stellar-white/10 rounded-xl p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-stellar-white/70 mb-2">
                  Název události <span className="text-red-400">*</span>
                </label>
                <input
                  {...register('title', { required: 'Název je povinný' })}
                  className="w-full bg-deep-spaceborder border-stellar-white/20 rounded-lg px-4 py-2 text-stellar-white focus:outline-none focus:border-cosmic-blue transition-colors"
                  placeholder="Např. Start rakety CRS-1"
                />
                {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-stellar-white/70 mb-2">
                  Slug (URL adresa) <span className="text-red-400">*</span>
                </label>
                <input
                  {...register('slug', { required: 'Slug je povinný' })}
                  className="w-full bg-deep-spaceborder border-stellar-white/20 rounded-lg px-4 py-2 text-stellar-white focus:outline-none focus:border-cosmic-blue transition-colors"
                  placeholder="např. start-rakety-crs-1"
                />
                {errors.slug && <p className="text-red-400 text-xs mt-1">{errors.slug.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-stellar-white/70 mb-2">
                  Popis události
                </label>
                <RichTextEditor 
                  content={description} 
                  onChange={setDescription} 
                  placeholder="Podrobný popis události..."
                />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-deep-space/50 border border-stellar-white/10 rounded-xl p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-stellar-white/70 mb-2">
                  Speciální status
                </label>
                <select
                  {...register('specialStatus')}
                  className="w-full bg-deep-space border border-stellar-white/20 rounded-lg px-4 py-2 text-stellar-white focus:outline-none focus:border-cosmic-blue transition-colors"
                >
                  <option value="" className="bg-deep-space text-stellar-white">Automatický (podle data)</option>
                  <option value="cancelled" className="bg-deep-space text-stellar-white">Zrušeno</option>
                  <option value="postponed" className="bg-deep-space text-stellar-white">Odloženo</option>
                </select>
                <p className="text-stellar-white/40 text-xs mt-1">
                  Ponechte „Automatický" — status se určí z data začátku a konce.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-stellar-white/70 mb-2">
                  Typ události
                </label>
                <select
                  {...register('eventType')}
                  className="w-full bg-deep-space border border-stellar-white/20 rounded-lg px-4 py-2 text-stellar-white focus:outline-none focus:border-cosmic-blue transition-colors"
                >
                  <option value="event" className="bg-deep-space text-stellar-white">Obecná událost</option>
                  <option value="launch" className="bg-deep-space text-stellar-white">Start rakety</option>
                  <option value="test" className="bg-deep-space text-stellar-white">Testovací kampaň</option>
                  <option value="recruitment" className="bg-deep-space text-stellar-white">Nábor</option>
                  <option value="pr" className="bg-deep-space text-stellar-white">PR akce</option>
                </select>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="published"
                  {...register('published')}
                  className="w-5 h-5 rounded border-stellar-white/20 bg-deep-spacetext-cosmic-blue focus:ring-cosmic-blue"
                />
                <label htmlFor="published" className="text-sm font-medium text-stellar-white/70">
                  Publikovat událost
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-stellar-white/70 mb-2">
                  Lokace <span className="text-red-400">*</span>
                </label>
                <input
                  {...register('location', { required: 'Lokace je povinná' })}
                  className="w-full bg-deep-spaceborder border-stellar-white/20 rounded-lg px-4 py-2 text-stellar-white focus:outline-none focus:border-cosmic-blue transition-colors"
                  placeholder="Např. Letiště Brno"
                />
                {errors.location && <p className="text-red-400 text-xs mt-1">{errors.location.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-stellar-white/70 mb-2">
                  Datum a čas začátku <span className="text-red-400">*</span>
                </label>
                <input
                  type="datetime-local"
                  {...register('startDate', { required: 'Datum začátku je povinné' })}
                  className="w-full bg-deep-spaceborder border-stellar-white/20 rounded-lg px-4 py-2 text-stellar-white focus:outline-none focus:border-cosmic-blue transition-colors"
                />
                {errors.startDate && <p className="text-red-400 text-xs mt-1">{errors.startDate.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-stellar-white/70 mb-2">
                  Datum a čas konce <span className="text-red-400">*</span>
                </label>
                <input
                  type="datetime-local"
                  {...register('endDate', { required: 'Datum konce je povinné' })}
                  className="w-full bg-deep-spaceborder border-stellar-white/20 rounded-lg px-4 py-2 text-stellar-white focus:outline-none focus:border-cosmic-blue transition-colors"
                />
                {errors.endDate && <p className="text-red-400 text-xs mt-1">{errors.endDate.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-stellar-white/70 mb-2">
                  Náhledový obrázek
                </label>
                <div className="space-y-4">
                  {coverImage ? (
                    <div className="relative aspect-video rounded-lg overflow-hidden border border-stellar-white/10 group">
                      <img 
                        src={coverImage} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-deep-space/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => setShowImagePicker(true)}
                          className="bg-cosmic-blue text-stellar-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-cosmic-blue/80 transition-colors"
                        >
                          Změnit
                        </button>
                        <button
                          type="button"
                          onClick={() => setValue('coverImage', '')}
                          className="bg-red-500 text-stellar-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
                        >
                          Odstranit
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowImagePicker(true)}
                      className="w-full aspect-video rounded-lg border-2 border-dashed border-stellar-white/20 hover:border-cosmic-blue/50 hover:bg-cosmic-blue/5 transition-all flex flex-col items-center justify-center gap-2 text-stellar-white/50 hover:text-cosmic-blue"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="font-medium">Vybrat obrázek z galerie</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-aurora-cyan hover:bg-aurora-cyan/80 disabled:bg-aurora-cyan/50 text-deep-space font-bold py-3 rounded-lg transition-all shadow-lg shadow-aurora-cyan/20"
              >
                {isSubmitting ? 'Ukládání...' : mode === 'create' ? 'Vytvořit událost' : 'Uložit změny'}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="w-full bg-stellar-white/10 hover:bg-stellar-white/20 text-stellar-white font-medium py-3 rounded-lg transition-all"
              >
                Zrušit
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Image Picker Modal */}
      {showImagePicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-deep-space/80 backdrop-blur-sm">
          <div className="bg-deep-space border border-stellar-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-6 border-b border-stellar-white/10 flex items-center justify-between">
              <h2 className="text-xl font-bold text-stellar-white">Galerie médií</h2>
              <button 
                onClick={() => setShowImagePicker(false)}
                className="text-stellar-white/50 hover:text-stellar-white transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <ImageUploader 
                onSelectImage={(url) => {
                  setValue('coverImage', url);
                  setShowImagePicker(false);
                }}
                selectedImage={coverImage}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
