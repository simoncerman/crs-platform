'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import ImageUploader from './ImageUploader';

interface ImagePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
  currentValue?: string;
}

export default function ImagePickerModal({ isOpen, onClose, onSelect, currentValue }: ImagePickerModalProps) {
  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSelect = (url: string) => {
    onSelect(url);
    onClose();
  };

  const modal = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-deep-space/90 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-deep-space border-2 border-cosmic-blue/50 rounded-2xl max-w-5xl w-full max-h-[85vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-cosmic-blue/30">
          <div>
            <h2 className="text-xl font-bold text-stellar-white">Vybrat obrázek</h2>
            <p className="text-stellar-white/50 text-sm">Nahrajte nový nebo vyberte existující obrázek</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-stellar-white/10 text-stellar-white/60 hover:text-stellar-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(85vh-80px)]">
          <ImageUploader
            onSelectImage={handleSelect}
            selectedImage={currentValue}
          />
        </div>
      </div>
    </div>
  );

  // Render via portal to escape stacking context issues
  return createPortal(modal, document.body);
}
