'use client';

import { useState } from 'react';
import ImageUploader from './ImageUploader';

interface ArticleImageGalleryProps {
  images: string[];
  onChange: (images: string[]) => void;
}

export default function ArticleImageGallery({ images, onChange }: ArticleImageGalleryProps) {
  const [showImagePicker, setShowImagePicker] = useState(false);

  const handleAddImage = (url: string) => {
    // Add image only if not already in gallery
    if (!images.includes(url)) {
      onChange([...images, url]);
    }
  };

  const handleRemoveImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onChange(newImages);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newImages = [...images];
    [newImages[index - 1], newImages[index]] = [newImages[index], newImages[index - 1]];
    onChange(newImages);
  };

  const handleMoveDown = (index: number) => {
    if (index === images.length - 1) return;
    const newImages = [...images];
    [newImages[index], newImages[index + 1]] = [newImages[index + 1], newImages[index]];
    onChange(newImages);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-stellar-white font-medium">
          Galerie obrázků ({images.length})
        </label>
        <button
          type="button"
          onClick={() => setShowImagePicker(!showImagePicker)}
          className="bg-cosmic-blue/20 hover:bg-cosmic-blue/30 text-aurora-cyan px-4 py-2 rounded-lg transition-colors border border-cosmic-blue/30 text-sm"
        >
          + Přidat obrázek
        </button>
      </div>

      {/* Current images */}
      {images.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((imageUrl, index) => (
            <div
              key={index}
              className="relative bg-deep-space/50 rounded-lg overflow-hidden border-2 border-cosmic-blue/30"
            >
              <div className="relative aspect-video">
                <img
                  src={imageUrl}
                  alt={`Obrázek ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => handleMoveUp(index)}
                  disabled={index === 0}
                  className="flex-1 px-2 py-1 rounded text-xs bg-cosmic-blue/20 text-aurora-cyan hover:bg-cosmic-blue/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="Posunout nahoru"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => handleMoveDown(index)}
                  disabled={index === images.length - 1}
                  className="flex-1 px-2 py-1 rounded text-xs bg-cosmic-blue/20 text-aurora-cyan hover:bg-cosmic-blue/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="Posunout dolů"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="flex-1 px-2 py-1 rounded text-xs bg-deep-space/50 hover:bg-red-500/30 text-stellar-white/60 hover:text-red-400 transition-colors"
                  title="Odstranit"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-stellar-white/60 bg-deep-space/30 rounded-lg border-2 border-dashed border-cosmic-blue/20">
          <p>Žádné obrázky v galerii</p>
          <p className="text-sm mt-1">Klikněte na "Přidat obrázek" pro přidání</p>
        </div>
      )}

      {/* Image picker */}
      {showImagePicker && (
        <div className="bg-deep-space/50 rounded-lg p-4 border-2 border-cosmic-blue/30">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-stellar-white font-medium">Přidat obrázky do galerie</h3>
            <button
              type="button"
              onClick={() => setShowImagePicker(false)}
              className="bg-cosmic-blue/20 hover:bg-cosmic-blue/30 text-aurora-cyan px-3 py-1 rounded transition-colors text-sm"
            >
              Hotovo
            </button>
          </div>
          <ImageUploader
            onSelectImage={handleAddImage}
            selectedImages={images}
            multiSelect={true}
          />
        </div>
      )}
    </div>
  );
}
