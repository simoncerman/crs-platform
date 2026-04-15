import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="relative bg-gradient-to-b from-deep-space to-cosmic-black border-t border-cosmic-blue/20">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Logo a popis */}
          <div className="md:col-span-2">
            <h3 className="text-2xl font-bold text-stellar-white mb-4">
              Czech Rocket Society
            </h3>
            <p className="text-stellar-white/70 mb-4 max-w-md">
              Studentská organizace zaměřená na vývoj a testování raketových technologií. 
              Spojujeme nadšence z celé České republiky.
            </p>
            <div className="flex gap-4">
              <a 
                href="https://www.facebook.com/czechrocketsociety" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-stellar-white/60 hover:text-aurora-cyan transition-colors"
                aria-label="Facebook"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/>
                </svg>
              </a>
              <a 
                href="https://www.instagram.com/czechrocketsociety" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-stellar-white/60 hover:text-aurora-cyan transition-colors"
                aria-label="Instagram"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                </svg>
              </a>
              <a 
                href="https://www.linkedin.com/company/czechrocketsociety" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-stellar-white/60 hover:text-aurora-cyan transition-colors"
                aria-label="LinkedIn"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Rychlé odkazy */}
          <div>
            <h4 className="text-stellar-white font-semibold mb-4">Rychlé odkazy</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/o-nas" className="text-stellar-white/70 hover:text-aurora-cyan transition-colors">
                  O nás
                </Link>
              </li>
              <li>
                <Link href="/projekty" className="text-stellar-white/70 hover:text-aurora-cyan transition-colors">
                  Projekty
                </Link>
              </li>
              <li>
                <Link href="/clenove" className="text-stellar-white/70 hover:text-aurora-cyan transition-colors">
                  Tým
                </Link>
              </li>
              <li>
                <Link href="/partneri" className="text-stellar-white/70 hover:text-aurora-cyan transition-colors">
                  Partneři
                </Link>
              </li>
              <li>
                <Link href="/aktuality" className="text-stellar-white/70 hover:text-aurora-cyan transition-colors">
                  Aktuality
                </Link>
              </li>
              <li>
                <Link href="/udalosti" className="text-stellar-white/70 hover:text-aurora-cyan transition-colors">
                  Události
                </Link>
              </li>
            </ul>
          </div>

          {/* Zapoj se */}
          <div>
            <h4 className="text-stellar-white font-semibold mb-4">Zapoj se</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/nabor" className="text-stellar-white/70 hover:text-aurora-cyan transition-colors">
                  Přihláška do spolku
                </Link>
              </li>
              <li>
                <Link href="/o-nas#kontakt" className="text-stellar-white/70 hover:text-aurora-cyan transition-colors">
                  Kontakt
                </Link>
              </li>
              <li>
                <Link href="/telemetrie" className="text-stellar-white/70 hover:text-aurora-cyan transition-colors">
                  Telemetrie
                </Link>
              </li>
              <li>
                <Link href="/admin/login" className="text-stellar-white/70 hover:text-crs-ignition transition-colors">
                  Admin
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Spodní část */}
        <div className="border-t border-cosmic-blue/20 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Light the candle. */}
            <p className="text-stellar-white/60 text-sm">
              © {new Date().getFullYear()} Czech Rocket Society. Per aspera ad astra.
            </p>
            <div className="flex gap-6">
              <Link href="/privacy" className="text-stellar-white/60 hover:text-aurora-cyan text-sm transition-colors">
                Ochrana soukromí
              </Link>
              <Link href="/terms" className="text-stellar-white/60 hover:text-aurora-cyan text-sm transition-colors">
                Podmínky použití
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Dekorativní prvky */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-aurora-cyan/30 to-transparent" />
    </footer>
  );
}
