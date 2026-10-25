import { ThemeType } from '../types/quran';

export interface ThemeConfig {
  id: ThemeType;
  name: string;
  tagline: string;
  metaThemeColor: string;
  bgGradient: string;
  blobGradient1: string;
  blobGradient2: string;
  glassSurface: string;
  glassBorder: string;
  accentGold: string;
  accentSecondary: string;
  arabicTextClass: string;
  arabicGlow: string;
  translationText: string;
  mutedText: string;
  cardActive: string;
}

export const THEMES: Record<ThemeType, ThemeConfig> = {
  'midnight-emerald': {
    id: 'midnight-emerald',
    name: 'Midnight Emerald',
    tagline: 'Zamrud malam dengan kilau emas elegan',
    metaThemeColor: '#031711',
    bgGradient: 'bg-gradient-to-b from-[#06241a] via-[#02140e] to-[#010906]',
    blobGradient1: 'radial-gradient(circle at 20% 30%, rgba(16, 185, 129, 0.16) 0%, transparent 60%)',
    blobGradient2: 'radial-gradient(circle at 85% 75%, rgba(212, 175, 55, 0.14) 0%, transparent 55%)',
    glassSurface: 'bg-[#06241a]/70 backdrop-blur-xl',
    glassBorder: 'border-emerald-500/20',
    accentGold: '#e8c566',
    accentSecondary: '#10b981',
    arabicTextClass: 'text-[#faeed1]',
    arabicGlow: 'text-glow-gold',
    translationText: 'text-[#d1ded8]',
    mutedText: 'text-[#85a094]',
    cardActive: 'bg-emerald-950/60 border-amber-400/50 text-amber-200',
  },
  'golden-night': {
    id: 'golden-night',
    name: 'Golden Night',
    tagline: 'Obsidian dalam dengan nuansa emas murni',
    metaThemeColor: '#0a0907',
    bgGradient: 'bg-gradient-to-b from-[#19150d] via-[#0e0c07] to-[#050403]',
    blobGradient1: 'radial-gradient(circle at 25% 25%, rgba(245, 182, 66, 0.18) 0%, transparent 55%)',
    blobGradient2: 'radial-gradient(circle at 80% 80%, rgba(217, 119, 6, 0.14) 0%, transparent 60%)',
    glassSurface: 'bg-[#1a160e]/75 backdrop-blur-xl',
    glassBorder: 'border-amber-500/25',
    accentGold: '#fbbf24',
    accentSecondary: '#f59e0b',
    arabicTextClass: 'text-[#fff7e6]',
    arabicGlow: 'text-glow-gold',
    translationText: 'text-[#e5dec9]',
    mutedText: 'text-[#a1967c]',
    cardActive: 'bg-amber-950/50 border-amber-400 text-amber-300',
  },
  'ocean-dusk': {
    id: 'ocean-dusk',
    name: 'Ocean Dusk',
    tagline: 'Biru samudra malam yang tenang & sejuk',
    metaThemeColor: '#040d1a',
    bgGradient: 'bg-gradient-to-b from-[#081b33] via-[#040e1c] to-[#01060e]',
    blobGradient1: 'radial-gradient(circle at 20% 30%, rgba(56, 189, 248, 0.16) 0%, transparent 55%)',
    blobGradient2: 'radial-gradient(circle at 80% 70%, rgba(99, 102, 241, 0.14) 0%, transparent 60%)',
    glassSurface: 'bg-[#081d38]/70 backdrop-blur-xl',
    glassBorder: 'border-sky-500/20',
    accentGold: '#7dd3fc',
    accentSecondary: '#38bdf8',
    arabicTextClass: 'text-[#f0f9ff]',
    arabicGlow: 'text-glow-light',
    translationText: 'text-[#cbd5e1]',
    mutedText: 'text-[#7e9bb8]',
    cardActive: 'bg-sky-950/60 border-sky-400/60 text-sky-200',
  },
  'cream-light': {
    id: 'cream-light',
    name: 'Cream Light',
    tagline: 'Kertas mushaf klasik bernuansa hangat',
    metaThemeColor: '#f7f3e8',
    bgGradient: 'bg-gradient-to-b from-[#fbf8f0] via-[#f4eee0] to-[#e8dfcc]',
    blobGradient1: 'radial-gradient(circle at 20% 30%, rgba(212, 175, 55, 0.18) 0%, transparent 55%)',
    blobGradient2: 'radial-gradient(circle at 80% 70%, rgba(180, 83, 9, 0.08) 0%, transparent 60%)',
    glassSurface: 'bg-[#faf6ed]/90 backdrop-blur-xl',
    glassBorder: 'border-[#b59547]/30',
    accentGold: '#926014',
    accentSecondary: '#a16207',
    arabicTextClass: 'text-[#1c1811]',
    arabicGlow: 'text-glow-subtle',
    translationText: 'text-[#3d3629]',
    mutedText: 'text-[#786c57]',
    cardActive: 'bg-[#ebdcb9] border-[#926014] text-[#4d3205]',
  },
};
