'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { useState } from 'react';

const navigation = [
  { name: 'Domů', href: '/' },
  { name: 'Aktuality', href: '/aktuality' },
  { name: 'Partneři', href: '/partneri' },
  { name: 'O nás', href: '/o-nas' },
  { name: 'Přidej se', href: '/nabor' },
];

export default function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-cosmic-black/90 backdrop-blur-md border-b-2 border-cosmic-blue/30">
      <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group">
          <motion.div
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.3 }}
            className="w-10 h-10 flex items-center justify-center"
          >
            <Image
              src="/images/crs-logo-white.png"
              alt="CRS Logo"
              width={36}
              height={36}
              className="w-9 h-9 object-contain"
            />
          </motion.div>
          <div className="hidden sm:block">
            <span className="font-heading text-xl font-bold text-stellar-white">
              Czech Rocket Society
            </span>
          </div>
          <div className="sm:hidden">
            <span className="font-heading text-xl font-bold text-stellar-white">
              CRS
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== '/' && pathname.startsWith(item.href));
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className="relative px-4 py-2 transition-colors"
              >
                <span className={`${
                  isActive 
                    ? 'text-aurora-cyan' 
                    : 'text-stellar-white hover:text-aurora-cyan'
                } font-medium transition-colors`}>
                  {item.name}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-aurora-cyan"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden text-stellar-white p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </nav>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="md:hidden bg-deep-space/95 backdrop-blur-lg border-t border-cosmic-blue/20"
        >
          <div className="container mx-auto px-4 py-4 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href || 
                (item.href !== '/' && pathname.startsWith(item.href));
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-aurora-cyan/20 text-aurora-cyan border-2 border-aurora-cyan/50'
                      : 'text-stellar-white hover:bg-aurora-cyan/10 hover:text-aurora-cyan border-2 border-transparent'
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>
        </motion.div>
      )}
    </header>
  );
}
