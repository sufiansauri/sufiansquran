import React from 'react';
import { Play, Volume2, Sparkles, BookOpen } from 'lucide-react';
import { ThemeType } from '../types/quran';
import { THEMES } from '../config/themes';

interface SplashScreenProps {
  onStart: () => void;
  surahName: string;
  ayahNumber: number;
  qariName: string;
  theme: ThemeType;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onStart,
  surahName,
  ayahNumber,
  qariName,
  theme,
}) => {
  const themeConfig = THEMES[theme] || THEMES['midnight-emerald'];

  return (
    <div
      onClick={onStart}
      className={`fixed inset-0 z-50 flex flex-col justify-between items-center p-6 text-center select-none cursor-pointer overflow-hidden ${themeConfig.bgGradient}`}
    >
      {/* Decorative Top Glow */}
      <div className="pt-safe w-full flex justify-center items-center mt-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-ui text-amber-300/90 tracking-wide">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Al-Qur'an Al-Karim Murottal Player</span>
        </div>
      </div>

      {/* Center Hero Lockup */}
      <div className="flex flex-col items-center max-w-sm mx-auto my-auto animate-fade-in">
        {/* Emblem / Quran Icon */}
        <div className="relative mb-6">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-amber-500/20 via-emerald-500/10 to-amber-300/30 p-0.5 shadow-2xl shadow-emerald-950/80">
            <div className="w-full h-full rounded-[22px] bg-[#031510] flex items-center justify-center border border-amber-400/30">
              <img
                src="/icon.svg"
                alt="Murottal Player"
                className="w-16 h-16 drop-shadow-[0_0_12px_rgba(212,175,55,0.4)]"
              />
            </div>
          </div>
          {/* Subtle pulse ring */}
          <div className="absolute -inset-2 rounded-3xl border border-amber-400/20 animate-pulse pointer-events-none" />
        </div>

        {/* Title in Arabic Calligraphy & Latin */}
        <div className="font-arabic text-3xl sm:text-4xl text-amber-300 tracking-wide mb-2 text-glow-gold">
          القُرْآن الكَرِيم
        </div>
        <h1 className="font-ui text-xl sm:text-2xl font-bold tracking-tight text-white mb-2">
          Murottal Player
        </h1>
        <p className="font-ui text-xs sm:text-sm text-emerald-200/70 max-w-xs mb-8">
          Mendengarkan lantunan ayat suci Al-Qur'an dengan teks Arab Uthmani & terjemah per ayat
        </p>

        {/* Big Touch-to-Start Button */}
        <button
          onClick={onStart}
          className="group relative flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-stone-950 font-ui font-semibold text-base shadow-xl shadow-amber-500/25 active:scale-95 transition-all hover:brightness-110"
        >
          <div className="w-7 h-7 rounded-full bg-stone-950/20 flex items-center justify-center">
            <Play className="w-4 h-4 fill-current ml-0.5" />
          </div>
          <span>Ketuk untuk Mulai</span>
        </button>

        {/* Resume Info */}
        <div className="mt-4 flex items-center gap-2 text-xs font-ui text-stone-400">
          <BookOpen className="w-3.5 h-3.5 text-amber-400/80" />
          <span>
            Melanjutkan QS. {surahName} : Ayat {ayahNumber}
          </span>
        </div>
        <div className="mt-1 text-[11px] font-ui text-stone-500">
          Qari: <span className="text-stone-400">{qariName}</span>
        </div>
      </div>

      {/* Mandatory Creator Credit */}
      <div className="pb-safe w-full flex flex-col items-center gap-1.5 mb-3 text-center">
        <p className="font-ui text-xs font-medium text-amber-200/80">
          Aplikasi ini dibuat oleh Sufian Sauri, S.Hum
        </p>
        <p className="font-ui text-[10px] text-stone-500">
          Audio didukung oleh everyayah.com · Teks oleh Al-Quran Cloud
        </p>
      </div>
    </div>
  );
};
