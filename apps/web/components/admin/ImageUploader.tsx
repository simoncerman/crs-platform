'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface UploadedImage {
  filename: string;
  url: string;
  size: number;
  createdAt: string;
}

interface ImageUploaderProps {
  onSelectImage?: (url: string) => void;
  selectedImage?: string;
  selectedImages?: string[];
  multiSelect?: boolean;
}

export default function ImageUploader({ onSelectImage, selectedImage, selectedImages = [], multiSelect = false }: ImageUploaderProps) {
  const { data: session } = useSession();
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const [newlyUploadedUrls, setNewlyUploadedUrls] = useState<string[]>([]);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  const loadImages = async () => {
    try {
      if (!session?.accessToken) return;

      const response = await fetch(`${API_URL}/api/media`, {
        headers: {
          'Authorization': `Bearer ${session.accessToken}`,
        },
      });

      if (!response.ok) throw new Error('Failed to load images');

      const data = await response.json();
      setImages(data.images || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (session?.accessToken) {
      loadImages();
    }
  }, [session]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setError('');
    setUploadProgress('');

    try {
      let uploadedCount = 0;
      const uploadedUrls: string[] = [];
      let hasErrors = false;
      let errorMessages: string[] = [];

      // Upload files sequentially
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setUploadProgress(`Nahrávání ${i + 1}/${files.length}: ${file.name}`);

        // Validate file type
        if (!file.type.startsWith('image/')) {
          const msg = `Soubor ${file.name} není obrázek`;
          errorMessages.push(msg);
          hasErrors = true;
          continue;
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
          const sizeMB = (file.size / 1024 / 1024).toFixed(2);
          const msg = `Soubor ${file.name} je příliš velký (${sizeMB} MB, maximum je 5 MB)`;
          errorMessages.push(msg);
          hasErrors = true;
          continue;
        }

        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${API_URL}/api/media/upload`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session?.accessToken}`,
          },
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          const url = `${API_URL}${data.url}`;
          uploadedUrls.push(url);
          uploadedCount++;
          
          // Call callback for each uploaded image (for multi-select gallery)
          if (onSelectImage) {
            onSelectImage(url);
          }
        } else {
          const errorData = await response.json().catch(() => ({}));
          const msg = `Chyba při nahrávání ${file.name}: ${errorData.error || 'Neznámá chyba'}`;
          errorMessages.push(msg);
          hasErrors = true;
        }
      }

      // Reload images list
      await loadImages();

      // Show results
      if (errorMessages.length > 0) {
        setError(errorMessages.join('\n'));
      }

      if (uploadedCount > 0) {
        setUploadProgress(`Úspěšně nahráno ${uploadedCount} ${uploadedCount === 1 ? 'obrázek' : uploadedCount < 5 ? 'obrázky' : 'obrázků'}`);
        setNewlyUploadedUrls(uploadedUrls);
        setTimeout(() => {
          setUploadProgress('');
          setNewlyUploadedUrls([]);
        }, 3000);
      } else if (!hasErrors) {
        setError('Žádné soubory nebyly nahrány');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsUploading(false);
      // Reset input
      e.target.value = '';
    }
  };

  const handleDelete = async (filename: string) => {
    if (!confirm('Opravdu chcete smazat tento obrázek?')) return;

    try {
      const response = await fetch(`${API_URL}/api/media/${filename}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session?.accessToken}`,
        },
      });

      if (!response.ok) throw new Error('Failed to delete');

      await loadImages();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  if (isLoading) {
    return (
      <div className="text-center py-8 text-stellar-white/60">
        Načítání...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Upload area */}
      <div className="bg-deep-space/50 border-2 border-dashed border-cosmic-blue/30 rounded-xl p-8 text-center hover:border-aurora-cyan/50 transition-colors">
        <input
          type="file"
          id="image-upload"
          accept="image/*"
          multiple
          onChange={handleUpload}
          disabled={isUploading}
          className="hidden"
        />
        <label
          htmlFor="image-upload"
          className="cursor-pointer block"
        >
          <div className="text-6xl mb-4">📤</div>
          <p className="text-stellar-white font-medium mb-2">
            {isUploading ? 'Nahrávání...' : 'Klikněte pro nahrání obrázků'}
          </p>
          <p className="text-stellar-white/60 text-sm">
            PNG, JPG, GIF, WEBP (max. 5MB každý)
          </p>
          <p className="text-aurora-cyan text-sm mt-1">
            Můžete vybrat více souborů najednou
          </p>
        </label>
      </div>

      {/* Upload progress */}
      {uploadProgress && (
        <div className="bg-aurora-cyan/10 border border-aurora-cyan/50 rounded-lg p-4 text-aurora-cyan">
          {uploadProgress}
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 text-red-400">
          {error}
        </div>
      )}

      {/* Images grid */}
      {images.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image) => {
            const fullUrl = `${API_URL}${image.url}`;
            const isSelected = multiSelect 
              ? selectedImages.includes(fullUrl)
              : selectedImage === fullUrl;
            const isNewlyUploaded = newlyUploadedUrls.includes(fullUrl);
            
            return (
              <div
                key={image.filename}
                className={`relative bg-deep-space/50 rounded-lg overflow-hidden border-2 transition-all ${
                  isSelected
                    ? 'border-aurora-cyan shadow-lg shadow-aurora-cyan/20'
                    : isNewlyUploaded
                    ? 'border-green-400 shadow-lg shadow-green-400/20 animate-pulse'
                    : 'border-cosmic-blue/30 hover:border-cosmic-blue/50'
                }`}
              >
                <div className="relative aspect-square">
                  <img
                    src={fullUrl}
                    alt={image.filename}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-3 space-y-2">
                  <p className="text-stellar-white/80 text-xs truncate">
                    {image.filename}
                  </p>
                  <p className="text-stellar-white/50 text-xs">
                    {formatFileSize(image.size)}
                  </p>
                  <div className="flex gap-2">
                    {onSelectImage && (
                      <button
                        type="button"
                        onClick={() => onSelectImage(fullUrl)}
                        className={`flex-1 text-xs px-3 py-2 rounded transition-colors ${
                          isSelected
                            ? 'bg-aurora-cyan text-deep-space font-semibold'
                            : 'bg-cosmic-blue/20 text-aurora-cyan hover:bg-cosmic-blue/30'
                        }`}
                      >
                        {isSelected ? 'Vybráno' : 'Vybrat'}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDelete(image.filename)}
                      className="px-3 py-2 rounded text-xs bg-deep-space/50 hover:bg-red-500/30 text-stellar-white/60 hover:text-red-400 transition-colors"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12 text-stellar-white/60">
          <p className="text-lg mb-2">Zatím nejsou nahrány žádné obrázky</p>
          <p className="text-sm">Nahrajte první obrázek pomocí tlačítka výše</p>
        </div>
      )}
    </div>
  );
}
