import React, { useState, useEffect } from 'react';
import { ThemeType } from '../types/quran';
import { THEMES } from '../config/themes';
import { getBackgroundsForSurah } from '../config/backgrounds';

interface IslamicBackgroundProps {
  theme: ThemeType;
  surahNumber?: number;
  totalAyahs?: number;
}

export const IslamicBackground: React.FC<IslamicBackgroundProps> = ({
  theme,
  surahNumber = 1,
  totalAyahs,
}) => {
  const themeConfig = THEMES[theme] || THEMES['midnight-emerald'];
  const backgrounds = getBackgroundsForSurah(surahNumber, totalAyahs);

  const [currentIndex, setCurrentIndex] = useState<number>(0);

  // Reset index when surah changes so the most relevant theme shows first
  useEffect(() => {
    setCurrentIndex(0);
  }, [surahNumber]);

  // Pre-load all images in browser memory so cross-fading is instantaneous
  useEffect(() => {
    backgrounds.forEach(bg => {
      const img = new Image();
      img.src = bg.src;
    });
  }, [backgrounds]);

  // Smooth rotation every 30 seconds
  useEffect(() => {
    if (backgrounds.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % backgrounds.length);
    }, 30000); // 30 seconds per background

    return () => clearInterval(interval);
  }, [backgrounds.length]);

  return (
    <div className={`fixed inset-0 pointer-events-none overflow-hidden select-none z-0 ${themeConfig.bgGradient}`}>
      {/* 1. Cross-Fading Mobile Portrait Islamic Spiritual Background Images (Clear & Vivid) */}
      {backgrounds.map((bg, index) => {
        const isActive = index === currentIndex;
        return (
          <div
            key={bg.id}
            className={`absolute inset-0 w-full h-full transition-opacity ease-in-out ${
              isActive ? 'opacity-95 scale-100' : 'opacity-0 scale-102'
            }`}
            style={{
              transitionProperty: 'opacity, transform',
              transitionDuration: '1800ms',
            }}
          >
            <img
              src={bg.src}
              alt={bg.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center filter brightness-[0.92] contrast-[1.05] saturate-[1.08]"
            />
          </div>
        );
      })}

      {/* 2. Soft Ambient Top & Bottom Vignette for status bar and dock */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-transparent to-black/65 pointer-events-none" />

      {/* 3. Subtle Islamic Geometric Tessellation Pattern (SVG Overlay ~3.5% opacity) */}
      <svg
        className="absolute inset-0 w-full h-full opacity-[0.035] mix-blend-screen pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
      >
        <defs>
          <pattern id="islamic-grid" width="80" height="80" patternUnits="userSpaceOnUse">
            {/* 8-Pointed Star Motif */}
            <path
              d="M 40 10 L 48 28 L 68 20 L 60 40 L 78 48 L 60 56 L 68 76 L 48 68 L 40 86 L 32 68 L 12 76 L 20 56 L 2 48 L 20 40 L 12 20 L 32 28 Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.8"
            />
            <rect x="25" y="25" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="0.5" />
            <rect
              x="25"
              y="25"
              width="30"
              height="30"
              transform="rotate(45 40 40)"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
            />
            <circle cx="40" cy="40" r="4" fill="none" stroke="currentColor" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#islamic-grid)" className="text-white" />
      </svg>
    </div>
  );
};
