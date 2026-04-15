'use client';

import { useState } from 'react';
import { ReactNode } from 'react';

interface FlipCardProps {
  emoji: string;
  title: string;
  icon: ReactNode;
  description: string;
  frontGradient: string;
  backGradient: string;
  borderHoverColor: string;
  shadowColor: string;
  backBorderColor: string;
  backShadowColor: string;
}

export function FlipCard({
  emoji,
  title,
  icon,
  description,
  frontGradient,
  backGradient,
  borderHoverColor,
  shadowColor,
  backBorderColor,
  backShadowColor,
}: FlipCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div
      className="group relative h-64 cursor-pointer"
      style={{ transformStyle: 'preserve-3d' }}
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
    >
      <div
        className="relative w-full h-full transition-transform duration-700 ease-out"
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* Front */}
        <div
          className={`absolute w-full h-full rounded-xl border-2 border-cosmic-blue/30 ${frontGradient} backdrop-blur-sm flex flex-col items-center justify-center overflow-hidden group-hover:${borderHoverColor} transition-colors shadow-lg hover:${shadowColor}`}
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div className="text-7xl mb-4 group-hover:scale-110 transition-transform">
            {emoji}
          </div>
          <p className="text-stellar-white font-bold text-lg text-center px-2">
            {title}
          </p>
        </div>

        {/* Back */}
        <div
          className={`absolute w-full h-full rounded-xl border-2 ${backBorderColor} ${backGradient} backdrop-blur-sm flex flex-col items-center justify-center p-4 overflow-hidden shadow-lg ${backShadowColor}`}
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <div className="w-16 h-16 mb-3">
            {icon}
          </div>
          <p className="text-stellar-white/90 text-xs text-center leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}
