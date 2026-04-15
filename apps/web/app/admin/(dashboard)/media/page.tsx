import ImageUploader from '@/components/admin/ImageUploader';

export default function MediaPage() {
  return (
    <div className="max-w-7xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-stellar-white mb-2">
          Média
        </h1>
        <p className="text-stellar-white/70">
          Správa obrázků a souborů
        </p>
      </div>

      {/* Image uploader */}
      <ImageUploader />
    </div>
  );
}
