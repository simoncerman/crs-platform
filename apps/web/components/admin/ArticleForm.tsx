'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { useSession } from 'next-auth/react';
import RichTextEditor from '@/components/ui/RichTextEditor';
import ImageUploader from '@/components/admin/ImageUploader';
import ArticleImageGallery from '@/components/admin/ArticleImageGallery';
import { adminFetch } from '@/lib/admin-fetch';

const fieldLabels: Record<string, string> = {
  title: 'Nadpis',
  slug: 'URL slug',
  content: 'Obsah',
  excerpt: 'Krátký popis',
  coverImage: 'Náhledový obrázek',
  images: 'Galerie obrázků',
  status: 'Status',
  publishedAt: 'Datum publikování',
};

function parseApiError(errorData: any): string {
  // Zod validation error — has issues array
  if (errorData?.error?.issues) {
    const messages = errorData.error.issues.map((issue: any) => {
      const field = issue.path?.join('.') || '';
      const label = fieldLabels[field] || field;

      if (issue.code === 'too_small' && issue.type === 'string') {
        if (issue.minimum === 1) return `${label} je povinný údaj`;
        return `${label} musí mít alespoň ${issue.minimum} znaků`;
      }
      if (issue.code === 'invalid_type' && issue.received === 'undefined') {
        return `${label} je povinný údaj`;
      }
      if (issue.code === 'invalid_string') {
        return `${label} má neplatný formát`;
      }
      if (issue.code === 'invalid_enum_value') {
        return `${label} obsahuje neplatnou hodnotu`;
      }

      return `${label}: ${issue.message}`;
    });
    return messages.join('\n');
  }

  // Simple string error
  if (typeof errorData?.error === 'string') {
    return errorData.error;
  }

  // Fallback
  return 'Nepodařilo se uložit článek. Zkontrolujte vyplněná pole.';
}

// Helper function to format UTC date to datetime-local input format
// This accounts for the browser's timezone offset
function formatDateForInput(utcDate: Date): string {
  const offset = utcDate.getTimezoneOffset() * 60000;
  const localDate = new Date(utcDate.getTime() - offset);
  return localDate.toISOString().slice(0, 16);
}

// Helper function to convert datetime-local input back to UTC ISO string
// The input is in local time, so we need to convert it back to UTC
function formatDateForAPI(datetimeLocalValue: string): string {
  // Parse the local datetime string
  const localDate = new Date(datetimeLocalValue + ':00Z'); // Treat as UTC first
  const offset = localDate.getTimezoneOffset() * 60000;
  // Adjust back to true UTC by adding the offset
  const utcDate = new Date(localDate.getTime() + offset);
  return utcDate.toISOString();
}

interface ArticleFormData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  images?: string[];
  status: 'draft' | 'published' | 'archived';
  publishedAt?: string;
}

interface ArticleFormProps {
  mode: 'create' | 'edit';
  articleId?: string;
  initialData?: Partial<ArticleFormData>;
}

export default function ArticleForm({ mode, articleId, initialData }: ArticleFormProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(mode === 'edit' && !initialData);
  const [error, setError] = useState('');
  const [content, setContent] = useState(initialData?.content || '');
  const [images, setImages] = useState<string[]>(initialData?.images || []);
  const [showImagePicker, setShowImagePicker] = useState(false);

  const [hasLoaded, setHasLoaded] = useState(false);

  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<ArticleFormData>({
    defaultValues: initialData || {
      status: 'draft',
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

  // Load article data for edit mode
  useEffect(() => {
    if (mode === 'edit' && articleId && !initialData && !hasLoaded && session?.accessToken) {
      const loadArticle = async () => {
        try {
          const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
          
          // Add authentication token for admin access to draft articles
          const response = await adminFetch(`${API_URL}/api/articles/${articleId}`, {
            accessToken: session.accessToken,
          });
          
          if (!response.ok) {
            throw new Error('Článek nenalezen');
          }

          const data = await response.json();
          const article = data.article;

          reset({
            title: article.title,
            slug: article.slug,
            excerpt: article.excerpt || '',
            coverImage: article.coverImage || '',
            status: article.status,
            publishedAt: article.publishedAt ? formatDateForInput(new Date(article.publishedAt)) : '',
          });
          
          setContent(article.content);
          setImages(article.images || []);
          setHasLoaded(true);
        } catch (err: any) {
          setError(err.message || 'Nepodařilo se načíst článek');
        } finally {
          setIsLoading(false);
        }
      };

      loadArticle();
    }
  }, [mode, articleId, initialData, reset, session, hasLoaded]);

  const onSubmit = async (data: ArticleFormData) => {
    setIsSubmitting(true);
    setError('');

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      
      if (!session?.accessToken) {
        throw new Error('Nejste přihlášen');
      }

      // Prepare data
      const articleData: any = {
        ...data,
        content,
        images,
      };
      
      // Convert publishedAt to ISO string
      if (articleData.publishedAt) {
        articleData.publishedAt = formatDateForAPI(articleData.publishedAt);
      }

      // Remove coverImage if empty
      if (!articleData.coverImage || articleData.coverImage.trim() === '') {
        delete articleData.coverImage;
      }
      
      const url = mode === 'create' 
        ? `${API_URL}/api/articles`
        : `${API_URL}/api/articles/${articleId}`;
      
      const method = mode === 'create' ? 'POST' : 'PUT';

      const response = await adminFetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        accessToken: session.accessToken,
        body: JSON.stringify(articleData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(parseApiError(errorData));
      }

      // Po vytvoření přesměruj na seznam, při editaci zůstaň a jen obnov data
      if (mode === 'create') {
        router.push('/admin/articles');
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
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-4xl font-bold text-stellar-white mb-2">
            {mode === 'create' ? 'Nový článek' : 'Upravit článek'}
          </h1>
          <p className="text-stellar-white/70">
            {mode === 'create' 
              ? 'Vytvořte nový článek nebo aktualitu'
              : 'Upravte existující článek'
            }
          </p>
        </div>
        <button
          onClick={() => router.back()}
          className="bg-deep-space/50 hover:bg-deep-space text-stellar-white/80 hover:text-stellar-white px-6 py-3 rounded-lg transition-colors border border-cosmic-blue/30"
        >
          ← Zpět
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="bg-deep-space/50 backdrop-blur-sm border-2 border-cosmic-blue/30 rounded-xl p-8 space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-stellar-white font-medium mb-2">
              Nadpis <span className="text-red-400">*</span>
            </label>
            <input
              {...register('title', { required: 'Nadpis je povinný' })}
              type="text"
              id="title"
              className="w-full px-4 py-3 bg-deep-space/50 border-2 border-cosmic-blue/30 rounded-lg text-stellar-white placeholder-stellar-white/40 focus:outline-none focus:border-aurora-cyan transition-colors"
            />
            {errors.title && (
              <p className="text-red-400 text-sm mt-1">{errors.title.message}</p>
            )}
          </div>

          {/* Slug */}
          <div>
            <label htmlFor="slug" className="block text-stellar-white font-medium mb-2">
              URL slug <span className="text-red-400">*</span>
            </label>
            <input
              {...register('slug', { required: 'Slug je povinný' })}
              type="text"
              id="slug"
              className="w-full px-4 py-3 bg-deep-space/50 border-2 border-cosmic-blue/30 rounded-lg text-stellar-white placeholder-stellar-white/40 focus:outline-none focus:border-aurora-cyan transition-colors"
            />
            {errors.slug && (
              <p className="text-red-400 text-sm mt-1">{errors.slug.message}</p>
            )}
          </div>

          {/* Excerpt */}
          <div>
            <label htmlFor="excerpt" className="block text-stellar-white font-medium mb-2">
              Krátký popis (excerpt)
            </label>
            <textarea
              {...register('excerpt')}
              id="excerpt"
              rows={3}
              className="w-full px-4 py-3 bg-deep-space/50 border-2 border-cosmic-blue/30 rounded-lg text-stellar-white placeholder-stellar-white/40 focus:outline-none focus:border-aurora-cyan transition-colors resize-none"
            />
          </div>

          {/* Cover Image */}
          <div>
            <label className="block text-stellar-white font-medium mb-2">
              Náhledový obrázek
            </label>
            
            {coverImage && (
              <div className="mb-4 relative w-full h-48 rounded-lg overflow-hidden border-2 border-cosmic-blue/30">
                <img
                  src={coverImage}
                  alt="Náhled"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setValue('coverImage', '')}
                  className="absolute top-2 right-2 bg-red-500/80 hover:bg-red-500 text-white px-3 py-1 rounded text-sm"
                >
                  Odstranit
                </button>
              </div>
            )}
            
            <button
              type="button"
              onClick={() => setShowImagePicker(!showImagePicker)}
              className="bg-cosmic-blue/20 hover:bg-cosmic-blue/30 text-aurora-cyan px-4 py-3 rounded-lg transition-colors border border-cosmic-blue/30 w-full"
            >
              {coverImage ? 'Změnit obrázek' : 'Vybrat obrázek'}
            </button>
            
            {showImagePicker && (
              <div className="mt-4 bg-deep-space/50 rounded-lg p-4 border-2 border-cosmic-blue/30">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-stellar-white font-medium">Vyberte obrázek</h3>
                  <button
                    type="button"
                    onClick={() => setShowImagePicker(false)}
                    className="text-stellar-white/60 hover:text-stellar-white"
                  >
                    ✕
                  </button>
                </div>
                <ImageUploader
                  onSelectImage={(url) => {
                    setValue('coverImage', url);
                    setShowImagePicker(false);
                  }}
                  selectedImage={coverImage}
                />
              </div>
            )}
          </div>

          {/* Gallery Images */}
          <ArticleImageGallery images={images} onChange={setImages} />

          {/* Content (Rich Text Editor) */}
          <div>
            <label className="block text-stellar-white font-medium mb-2">
              Obsah <span className="text-red-400">*</span>
            </label>
            <RichTextEditor content={content} onChange={setContent} />
          </div>

          {/* Published Date */}
          <div>
            <label htmlFor="publishedAt" className="block text-stellar-white font-medium mb-2">
              Datum publikování <span className="text-red-400">*</span>
            </label>
            <input
              {...register('publishedAt', { required: 'Datum publikování je povinné' })}
              type="datetime-local"
              id="publishedAt"
              className="w-full px-4 py-3 bg-deep-space/50 border-2 border-cosmic-blue/30 rounded-lg text-stellar-white placeholder-stellar-white/40 focus:outline-none focus:border-aurora-cyan transition-colors"
            />
            {errors.publishedAt && (
              <p className="text-red-400 text-sm mt-1">{errors.publishedAt.message}</p>
            )}
          </div>

          {/* Status */}
          <div>
            <label htmlFor="status" className="block text-stellar-white font-medium mb-2">
              Status
            </label>
            <select
              {...register('status')}
              id="status"
              className="w-full px-4 py-3 bg-deep-space border-2 border-cosmic-blue/30 rounded-lg text-stellar-white focus:outline-none focus:border-aurora-cyan transition-colors"
            >
              <option value="draft" className="bg-deep-space text-stellar-white">Koncept</option>
              <option value="published" className="bg-deep-space text-stellar-white">Publikováno</option>
              <option value="archived" className="bg-deep-space text-stellar-white">Archivováno</option>
            </select>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 text-red-400 whitespace-pre-line">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="bg-deep-space/50 hover:bg-deep-space text-stellar-white/80 hover:text-stellar-white px-6 py-3 rounded-lg transition-colors border border-cosmic-blue/30"
          >
            Zrušit
          </button>
          {mode === 'edit' && articleId && (
            <Link
              href={`/admin/articles/preview/${articleId}`}
              className="bg-cosmic-blue/20 hover:bg-cosmic-blue/30 text-aurora-cyan px-6 py-3 rounded-lg transition-colors border border-cosmic-blue/30 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Náhled
            </Link>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-aurora-cyan hover:bg-aurora-cyan/80 text-deep-space font-bold px-8 py-3 rounded-lg transition-all shadow-lg hover:shadow-aurora-cyan/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting 
              ? (mode === 'create' ? 'Vytváření...' : 'Ukládání...')
              : (mode === 'create' ? 'Vytvořit článek' : 'Uložit změny')
            }
          </button>
        </div>
      </form>
    </div>
  );
}
