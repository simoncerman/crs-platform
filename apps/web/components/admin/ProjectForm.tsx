'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { useSession } from 'next-auth/react';
import RichTextEditor from '@/components/ui/RichTextEditor';
import ImageUploader from '@/components/admin/ImageUploader';
import ArticleImageGallery from '@/components/admin/ArticleImageGallery';
import { adminFetch } from '@/lib/admin-fetch';

interface ProjectSpec {
  key: string;
  value: string;
}

interface ProjectFormData {
  name: string;
  slug: string;
  description: string;
  category: string;
  status: 'planning' | 'development' | 'testing' | 'completed';
  coverImage?: string;
  images?: string[];
  startDate?: string;
  completionDate?: string;
  published: boolean;
  isFeatured: boolean;
  specs: ProjectSpec[];
}

interface ProjectFormProps {
  mode: 'create' | 'edit';
  projectId?: string;
  initialData?: Partial<ProjectFormData>;
}

export default function ProjectForm({ mode, projectId, initialData }: ProjectFormProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(mode === 'edit' && !initialData);
  const [error, setError] = useState('');
  const [description, setDescription] = useState(initialData?.description || '');
  const [images, setImages] = useState<string[]>(initialData?.images || []);
  const [showImagePicker, setShowImagePicker] = useState(false);

  const [hasLoaded, setHasLoaded] = useState(false);

  const { register, handleSubmit, formState: { errors }, setValue, watch, reset, control } = useForm<ProjectFormData>({
    defaultValues: initialData || {
      status: 'planning',
      published: false,
      isFeatured: false,
      category: '',
      specs: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "specs"
  });

  const name = watch('name');
  const coverImage = watch('coverImage');

  // Auto-generate slug from name
  useEffect(() => {
    if (mode === 'create' && name) {
      const slug = name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setValue('slug', slug);
    }
  }, [name, mode, setValue]);

  // Load project data for edit mode
  useEffect(() => {
    if (mode === 'edit' && projectId && !initialData && !hasLoaded && session?.accessToken) {
      const loadProject = async () => {
        try {
          const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
          
          const response = await adminFetch(`${API_URL}/api/projects/${projectId}`, {
            accessToken: session.accessToken,
          });
          
          if (!response.ok) {
            throw new Error('Projekt nenalezen');
          }

          const data = await response.json();
          const project = data.project;

          // Format dates for date input
          const formatDate = (dateStr?: string) => {
            if (!dateStr) return '';
            return new Date(dateStr).toISOString().split('T')[0];
          };

          // Convert specs object to array for form
          const specsArray: ProjectSpec[] = project.specs 
            ? Object.entries(project.specs).map(([key, value]) => ({ key, value: String(value) }))
            : [];

          reset({
            name: project.name,
            slug: project.slug,
            category: project.category || '',
            status: project.status,
            coverImage: project.coverImage || '',
            startDate: formatDate(project.startDate),
            completionDate: formatDate(project.completionDate),
            published: project.published || false,
            isFeatured: project.isFeatured || false,
            specs: specsArray,
          });
          
          setDescription(project.description || '');
          setImages(project.images || []);
          setHasLoaded(true);
        } catch (err: any) {
          setError(err.message || 'Nepodařilo se načíst projekt');
        } finally {
          setIsLoading(false);
        }
      };

      loadProject();
    }
  }, [mode, projectId, initialData, reset, session, hasLoaded]);

  const onSubmit = async (data: ProjectFormData) => {
    setIsSubmitting(true);
    setError('');

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      
      if (!session?.accessToken) {
        throw new Error('Nejste přihlášen');
      }

      const url = mode === 'create' 
        ? `${API_URL}/api/projects` 
        : `${API_URL}/api/projects/${projectId}`;
      
      const method = mode === 'create' ? 'POST' : 'PUT';

      // Convert specs array back to object
      const specsObject = (data.specs || []).reduce((acc, spec) => {
        if (spec.key.trim()) {
          acc[spec.key.trim()] = spec.value;
        }
        return acc;
      }, {} as Record<string, string>);

      // Prepare data for API
      const payload = {
        ...data,
        description,
        images,
        specs: specsObject,
        startDate: data.startDate ? new Date(data.startDate).toISOString() : null,
        completionDate: data.completionDate ? new Date(data.completionDate).toISOString() : null,
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
        throw new Error(errorData.error || 'Nepodařilo se uložit projekt');
      }

      // Po vytvoření přesměruj na seznam, při editaci zůstaň a jen obnov data
      if (mode === 'create') {
        router.push('/admin/projects');
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
          {mode === 'create' ? 'Nový projekt' : 'Upravit projekt'}
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
                  Název projektu
                </label>
                <input
                  {...register('name', { required: 'Název je povinný' })}
                  className="w-full bg-deep-spaceborder border-stellar-white/20 rounded-lg px-4 py-2 text-stellar-white focus:outline-none focus:border-cosmic-blue transition-colors"
                  placeholder="Např. Raketa Aurora 1"
                />
                {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-stellar-white/70 mb-2">
                    Slug (URL adresa)
                  </label>
                  <input
                    {...register('slug', { required: 'Slug je povinný' })}
                    className="w-full bg-deep-spaceborder border-stellar-white/20 rounded-lg px-4 py-2 text-stellar-white focus:outline-none focus:border-cosmic-blue transition-colors"
                    placeholder="např. raketa-aurora-1"
                  />
                  {errors.slug && <p className="text-red-400 text-xs mt-1">{errors.slug.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-stellar-white/70 mb-2">
                    Kategorie
                  </label>
                  <input
                    {...register('category')}
                    className="w-full bg-deep-spaceborder border-stellar-white/20 rounded-lg px-4 py-2 text-stellar-white focus:outline-none focus:border-cosmic-blue transition-colors"
                    placeholder="Např. Rakety, Motory, Avionika"
                  />
                </div>
              </div>

              {/* Technical Specifications Section */}
              <div className="pt-4 border-t border-stellar-white/10">
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-bold text-stellar-white uppercase tracking-wider">
                    Technické parametry
                  </label>
                  <button
                    type="button"
                    onClick={() => append({ key: '', value: '' })}
                    className="text-xs bg-aurora-cyan/10 hover:bg-aurora-cyan/20 text-aurora-cyan border border-aurora-cyan/30 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Přidat parametr
                  </button>
                </div>
                
                <div className="space-y-3">
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex gap-3 items-start">
                      <div className="flex-1">
                        <input
                          {...register(`specs.${index}.key` as const)}
                          placeholder="Název (např. Výška)"
                          className="w-full bg-deep-spaceborder border-stellar-white/20 rounded-lg px-3 py-2 text-sm text-stellar-white focus:outline-none focus:border-cosmic-blue transition-colors"
                        />
                      </div>
                      <div className="flex-1">
                        <input
                          {...register(`specs.${index}.value` as const)}
                          placeholder="Hodnota (např. 2.5 m)"
                          className="w-full bg-deep-spaceborder border-stellar-white/20 rounded-lg px-3 py-2 text-sm text-stellar-white focus:outline-none focus:border-cosmic-blue transition-colors"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="p-2 text-stellar-white/30 hover:text-red-500 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                  {fields.length === 0 && (
                    <p className="text-stellar-white/30 text-xs italic py-2">Žádné parametry nebyly přidány.</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-stellar-white/70 mb-2">
                  Popis projektu
                </label>
                <RichTextEditor 
                  content={description} 
                  onChange={setDescription} 
                  placeholder="Podrobný popis projektu..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stellar-white/70 mb-2">
                  Galerie obrázků
                </label>
                <ArticleImageGallery images={images} onChange={setImages} />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-deep-space/50 border border-stellar-white/10 rounded-xl p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-stellar-white/70 mb-2">
                  Status
                </label>
                <select
                  {...register('status')}
                  className="w-full bg-deep-space border border-stellar-white/20 rounded-lg px-4 py-2 text-stellar-white focus:outline-none focus:border-cosmic-blue transition-colors"
                >
                  <option value="planning" className="bg-deep-space text-stellar-white">Plánování</option>
                  <option value="development" className="bg-deep-space text-stellar-white">Vývoj</option>
                  <option value="testing" className="bg-deep-space text-stellar-white">Testování</option>
                  <option value="completed" className="bg-deep-space text-stellar-white">Dokončeno</option>
                </select>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="published"
                    {...register('published')}
                    className="w-5 h-5 rounded border-stellar-white/20 bg-deep-spacetext-cosmic-blue focus:ring-cosmic-blue"
                  />
                  <label htmlFor="published" className="text-sm font-medium text-stellar-white/70">
                    Publikovat projekt
                  </label>
                </div>

                <div className="flex items-center gap-3 p-3 bg-aurora-cyan/5 border border-aurora-cyan/20 rounded-lg">
                  <input
                    type="checkbox"
                    id="isFeatured"
                    {...register('isFeatured')}
                    className="w-5 h-5 rounded border-aurora-cyan/30 bg-deep-spacetext-aurora-cyan focus:ring-aurora-cyan"
                  />
                  <label htmlFor="isFeatured" className="text-sm font-bold text-aurora-cyan">
                    Vlajkový projekt
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-stellar-white/70 mb-2">
                  Datum zahájení
                </label>
                <input
                  type="date"
                  {...register('startDate')}
                  className="w-full bg-deep-spaceborder border-stellar-white/20 rounded-lg px-4 py-2 text-stellar-white focus:outline-none focus:border-cosmic-blue transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stellar-white/70 mb-2">
                  Předpokládané dokončení
                </label>
                <input
                  type="date"
                  {...register('completionDate')}
                  className="w-full bg-deep-spaceborder border-stellar-white/20 rounded-lg px-4 py-2 text-stellar-white focus:outline-none focus:border-cosmic-blue transition-colors"
                />
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
                {isSubmitting ? 'Ukládání...' : mode === 'create' ? 'Vytvořit projekt' : 'Uložit změny'}
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
