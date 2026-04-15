import Link from 'next/link';
import { BlackHole } from './components/BlackHole';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-deep-space relative overflow-hidden">
      <BlackHole />

      {/* 404 centered in the black hole */}
      <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none -mt-10 sm:-mt-16">
        <h1
          className="font-heading text-8xl sm:text-9xl font-bold select-none"
          style={{
            background: 'linear-gradient(135deg, #64f4d2, #4d9fff, #8b5cf6, #F3B600)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            opacity: 0.5,
            maskImage: 'radial-gradient(ellipse at center, black 50%, transparent 85%)',
            WebkitMaskImage: 'radial-gradient(ellipse at center, black 50%, transparent 85%)',
            filter: 'drop-shadow(0 0 30px rgba(100, 244, 210, 0.15))',
          }}
        >
          404
        </h1>
      </div>

      {/* Text + button at bottom */}
      <div className="absolute bottom-12 sm:bottom-20 left-0 right-0 z-10 text-center px-6">
        <p className="text-sm text-stellar-white/40 mb-1">
          Tato stránka byla pohlcena černou dírou.
        </p>
        <p className="text-xs text-stellar-white/25 mb-8">
          Ani světlo odtud neunikne.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-heading font-bold text-sm text-deep-space transition-all hover:scale-105 active:scale-95 hover:shadow-[0_0_30px_rgba(100,244,210,0.4)]"
          style={{ background: 'linear-gradient(135deg, #64f4d2, #4d9fff)' }}
        >
          Uniknout na hlavní stránku
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
