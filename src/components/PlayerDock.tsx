import React, { useState } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Repeat,
  Repeat1,
  Languages,
  Gauge,
  Moon,
  Loader2,
  Mic,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  SlidersHorizontal,
} from 'lucide-react';
import { RepeatMode, ThemeType } from '../types/quran';
import { THEMES } from '../config/themes';

interface PlayerDockProps {
  isPlaying: boolean;
  isPlayingBasmalah?: boolean;
  isLoadingAudio: boolean;
  currentTime: number;
  duration: number;
  audioProgress: number;
  currentAyahNumber: number;
  totalAyahs: number;
  qariName: string;
  playbackSpeed: number;
  repeatMode: RepeatMode;
  repeatCount: number;
  showTranslation: boolean;
  sleepTimerRemaining: number | null;
  theme: ThemeType;
  isVisible: boolean;
  isMinimized: boolean;
  onToggleMinimize: () => void;
  onTogglePlay: () => void;
  onPrevAyah: () => void;
  onNextAyah: () => void;
  onSeek: (time: number) => void;
  onCycleRepeat: () => void;
  onCycleSpeed: () => void;
  onToggleTranslation: () => void;
  onOpenQariSheet: () => void;
  onOpenSettingsSheet: () => void;
}

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export const PlayerDock: React.FC<PlayerDockProps> = ({
  isPlaying,
  isPlayingBasmalah,
  isLoadingAudio,
  currentTime,
  duration,
  audioProgress,
  currentAyahNumber,
  totalAyahs,
  qariName,
  playbackSpeed,
  repeatMode,
  repeatCount,
  showTranslation,
  sleepTimerRemaining,
  theme,
  isVisible,
  isMinimized,
  onToggleMinimize,
  onTogglePlay,
  onPrevAyah,
  onNextAyah,
  onSeek,
  onCycleRepeat,
  onCycleSpeed,
  onToggleTranslation,
  onOpenQariSheet,
  onOpenSettingsSheet,
}) => {
  const themeConfig = THEMES[theme] || THEMES['midnight-emerald'];

  // SVG Circular progress math for big play button
  const radius = 25;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - audioProgress * circumference;

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fraction = parseFloat(e.target.value);
    if (duration > 0) {
      onSeek(fraction * duration);
    }
  };

  const getRepeatLabel = () => {
    switch (repeatMode) {
      case '2x':
        return `2x (${repeatCount + 1}/2)`;
      case '3x':
        return `3x (${repeatCount + 1}/3)`;
      case 'infinite':
        return '∞';
      default:
        return 'Off';
    }
  };

  return (
    <footer
      className={`w-full pb-safe z-30 transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full pointer-events-none'
      }`}
    >
      <div className="w-full max-w-lg mx-auto px-3.5 pb-2">
        {/* MODE 1: MINIMIZED / SLIM BAR (MAXIMUM SPACE & TRANSPARENCY FOR BACKGROUND) */}
        {isMinimized ? (
          <div
            className="rounded-2xl border px-3 py-1.5 flex items-center justify-between gap-2 shadow-xl backdrop-blur-md bg-black/25 border-white/15 animate-fade-in"
          >
            {/* Mini Play / Pause Button */}
            <button
              onClick={onTogglePlay}
              aria-label={isPlaying ? 'Jeda' : 'Putar'}
              className="w-8 h-8 rounded-full bg-amber-400/90 hover:bg-amber-400 text-stone-950 flex items-center justify-center shrink-0 active:scale-90 transition shadow min-h-[36px] min-w-[36px]"
            >
              {isLoadingAudio ? (
                <Loader2 className="w-4 h-4 animate-spin text-stone-950" />
              ) : isPlaying ? (
                <Pause className="w-4 h-4 fill-current" />
              ) : (
                <Play className="w-4 h-4 fill-current ml-0.5" />
              )}
            </button>

            {/* Creator Credit & Direct Portfolio Link (Stacked 2-line for crystal-clear mobile view without truncation) */}
            <div className="flex-1 min-w-0 flex flex-col items-center justify-center text-center px-1">
              <span className="text-[11px] sm:text-xs leading-tight text-white font-medium drop-shadow-[0_1px_4px_rgba(0,0,0,0.95)] truncate max-w-full">
                Dibuat oleh <strong className="text-amber-300 font-bold">Sufian Sauri, S.Hum</strong>
              </span>
              <a
                href="https://sufiansweb.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                title="Buka Portofolio: https://sufiansweb.vercel.app"
                className="text-[10px] sm:text-[11px] leading-tight text-amber-300 hover:text-amber-200 underline font-semibold inline-flex items-center justify-center gap-1 mt-0.5 drop-shadow-[0_1px_4px_rgba(0,0,0,0.95)] active:scale-95 transition"
                onClick={e => e.stopPropagation()}
              >
                <span>sufiansweb.vercel.app</span>
                <ExternalLink className="w-2.5 h-2.5 inline text-amber-400" />
              </a>
            </div>

            {/* Expand Full Controls Button */}
            <button
              onClick={onToggleMinimize}
              aria-label="Tampilkan Tombol Kontrol Lengkap"
              title="Tampilkan Tombol Kontrol Lengkap"
              className="px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-stone-100 text-[10px] sm:text-[11px] font-ui font-medium flex items-center gap-1 shrink-0 active:scale-95 transition min-h-[36px] border border-white/10"
            >
              <ChevronUp className="w-3.5 h-3.5 text-amber-300" />
              <span>Tombol</span>
            </button>
          </div>
        ) : (
          /* MODE 2: REGULAR STREAMLINED DOCK */
          <div
            className={`rounded-3xl border p-2.5 sm:p-3 shadow-2xl flex flex-col gap-2 ${themeConfig.glassSurface} ${themeConfig.glassBorder}`}
          >
            {/* Audio Seek Bar & Times */}
            <div className="w-full flex flex-col gap-0.5">
              <div className="relative flex items-center group">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.005"
                  value={isNaN(audioProgress) ? 0 : audioProgress}
                  onChange={handleSliderChange}
                  aria-label="Seek audio ayat"
                  className="w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-white/15 accent-amber-400 focus:outline-none"
                />
              </div>

              <div className="flex justify-between items-center text-[10px] font-ui text-stone-400 px-0.5">
                <span>{formatTime(currentTime)}</span>
                <span className={`font-medium transition-colors ${isPlayingBasmalah ? 'text-amber-300 font-bold animate-pulse' : 'text-stone-300'}`}>
                  {isPlayingBasmalah ? 'Pembuka: Basmalah' : `Ayat ${currentAyahNumber} dari ${totalAyahs}`}
                </span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Controls Main Row */}
            <div className="flex items-center justify-between px-1">
              {/* Repeat Ayah Mode Button */}
              <button
                onClick={onCycleRepeat}
                aria-label={`Ulangi ayat (${repeatMode})`}
                title="Ulangi Ayat (Tahfidz)"
                className={`flex items-center gap-1 px-2 py-1 rounded-xl border text-xs font-ui min-h-[44px] min-w-[40px] justify-center transition-all active:scale-95 ${
                  repeatMode !== 'off'
                    ? 'border-amber-400/60 bg-amber-400/20 text-amber-300 font-semibold shadow-sm'
                    : 'border-white/10 text-stone-400 hover:text-white'
                }`}
              >
                {repeatMode === 'infinite' ? (
                  <Repeat className="w-3.5 h-3.5" />
                ) : (
                  <Repeat1 className="w-3.5 h-3.5" />
                )}
                <span className="text-[11px] font-mono tabular-nums">{getRepeatLabel()}</span>
              </button>

              {/* Previous Ayah */}
              <button
                onClick={onPrevAyah}
                aria-label="Ayat Sebelumnya"
                title="Ayat Sebelumnya"
                className="w-10 h-10 rounded-full flex items-center justify-center text-stone-300 hover:text-white active:scale-90 transition-all hover:bg-white/10 min-h-[44px] min-w-[44px]"
              >
                <SkipBack className="w-4 h-4 fill-current" />
              </button>

              {/* Central Play/Pause Button with SVG Progress Ring */}
              <button
                onClick={onTogglePlay}
                aria-label={isPlaying ? 'Jeda' : 'Putar'}
                title={isPlaying ? 'Jeda' : 'Putar'}
                className="relative w-13 h-13 rounded-full flex items-center justify-center active:scale-95 transition-transform shadow-lg shadow-amber-500/20 group min-h-[48px] min-w-[48px]"
              >
                <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 60 60">
                  <circle
                    cx="30"
                    cy="30"
                    r={radius}
                    stroke="currentColor"
                    strokeWidth="2.5"
                    fill="none"
                    className="text-white/15"
                  />
                  <circle
                    cx="30"
                    cy="30"
                    r={radius}
                    stroke="#fbbf24"
                    strokeWidth="2.5"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    strokeLinecap="round"
                    fill="none"
                    className="transition-[stroke-dashoffset] duration-150"
                  />
                </svg>

                <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-amber-500 to-amber-400 text-stone-950 flex items-center justify-center shadow-inner group-hover:brightness-105 transition-all">
                  {isLoadingAudio ? (
                    <Loader2 className="w-5 h-5 animate-spin text-stone-950" />
                  ) : isPlaying ? (
                    <Pause className="w-5 h-5 fill-current text-stone-950" />
                  ) : (
                    <Play className="w-5 h-5 fill-current text-stone-950 ml-0.5" />
                  )}
                </div>
              </button>

              {/* Next Ayah */}
              <button
                onClick={onNextAyah}
                aria-label="Ayat Berikutnya"
                title="Ayat Berikutnya"
                className="w-10 h-10 rounded-full flex items-center justify-center text-stone-300 hover:text-white active:scale-90 transition-all hover:bg-white/10 min-h-[44px] min-w-[44px]"
              >
                <SkipForward className="w-4 h-4 fill-current" />
              </button>

              {/* Playback Speed Button */}
              <button
                onClick={onCycleSpeed}
                aria-label={`Kecepatan (${playbackSpeed}x)`}
                title="Kecepatan Audio"
                className={`flex items-center gap-0.5 px-2 py-1 rounded-xl border text-xs font-ui min-h-[44px] min-w-[40px] justify-center transition-all active:scale-95 ${
                  playbackSpeed !== 1
                    ? 'border-amber-400/60 bg-amber-400/20 text-amber-300 font-semibold'
                    : 'border-white/10 text-stone-400 hover:text-white'
                }`}
              >
                <Gauge className="w-3.5 h-3.5" />
                <span className="text-[11px] font-mono tabular-nums">{playbackSpeed}x</span>
              </button>
            </div>

            {/* Sub Dock Bar: Translation Toggle, Current Qari, & Sembunyikan Tombol */}
            <div className="flex items-center justify-between pt-1 border-t border-white/10 text-xs">
              {/* Translation Toggle */}
              <button
                onClick={onToggleTranslation}
                aria-label="Toggle Terjemah Indonesia"
                className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-ui transition-colors min-h-[40px] ${
                  showTranslation
                    ? 'text-amber-300 bg-amber-400/10 font-medium'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <Languages className="w-3.5 h-3.5" />
                <span>{showTranslation ? 'Terjemah' : 'Arab'}</span>
              </button>

              {/* Qari Name Trigger */}
              <button
                onClick={onOpenQariSheet}
                aria-label="Ganti Qari"
                className="flex items-center gap-1 text-right text-[11px] font-ui text-stone-300 hover:text-amber-300 transition-colors min-h-[40px] px-1 truncate max-w-[160px]"
              >
                <Mic className="w-3 h-3 text-amber-400 shrink-0" />
                <span className="truncate">{qariName}</span>
              </button>

              {/* Sembunyikan Tombol / Rampingkan Mode Trigger */}
              <button
                onClick={onToggleMinimize}
                aria-label="Sembunyikan Tombol / Mode Ramping"
                title="Sembunyikan Tombol untuk Ruang Ayat Maksimal"
                className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-ui text-amber-300/90 hover:text-amber-200 bg-white/5 border border-white/10 hover:border-amber-400/30 min-h-[40px] active:scale-95 transition"
              >
                <ChevronDown className="w-3.5 h-3.5 text-amber-400" />
                <span>Ramping</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </footer>
  );
};
