'use client';

import { useState } from 'react';
import ImagePickerModal from './ImagePickerModal';

interface ImageFieldProps {
  value?: string;
  onChange: (url: string) => void;
  label: string;
  required?: boolean;
}

export default function ImageField({ value, onChange, label, required }: ImageFieldProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div>
      <label className="block text-sm font-medium text-stellar-white mb-2">
        {label} {required && <span className="text-cosmic-pink">*</span>}
      </label>
      
      <div className="flex items-start gap-4">
        {/* Thumbnail preview */}
        {value && (
          <div className="relative w-32 h-32 border-2 border-cosmic-blue/30 rounded-lg overflow-hidden shrink-0">
            <img
              src={value}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Action button */}
        <div className="flex-1">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-3 bg-cosmic-blue/20 border-2 border-cosmic-blue/50 text-stellar-white rounded-lg hover:bg-cosmic-blue/30 hover:border-cosmic-blue transition-all"
          >
            {value ? 'Změnit obrázek' : 'Vybrat obrázek'}
          </button>
          
          {value && (
            <button
              type="button"
              onClick={() => onChange('')}
              className="ml-2 px-4 py-3 bg-cosmic-pink/20 border-2 border-cosmic-pink/50 text-stellar-white rounded-lg hover:bg-cosmic-pink/30 hover:border-cosmic-pink transition-all"
            >
              Odebrat
            </button>
          )}

          {value && (
            <p className="mt-2 text-sm text-stellar-white/60">
              Náhled obrázku zobrazen vlevo
            </p>
          )}
        </div>
      </div>

      <ImagePickerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={onChange}
        currentValue={value}
      />
    </div>
  );
}
