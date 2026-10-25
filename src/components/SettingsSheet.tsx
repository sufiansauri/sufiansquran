import {
  X,
  Palette,
  Gauge,
  Repeat,
  Moon,
  Volume2,
  Eye,
  Download,
  Smartphone,
  Check,
  HardDrive,
  Trash2,
  CloudDownload,
  CloudCheck,
  Loader2,
} from 'lucide-react';
import { EndOfSurahMode, PlayerSettings, RepeatMode, ThemeType } from '../types/quran';
import { THEMES } from '../config/themes';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface SettingsSheetProps {
  isOpen: boolean;
  settings: PlayerSettings;
  sleepTimerRemaining: number | null;
  surahName: string;
  totalAyahs: number;
  isCurrentSurahDownloaded: boolean;
  isDownloading: boolean;
  downloadPercent?: number;
  downloadRegistry: Record<string, any>;
  onClose: () => void;
  onUpdateTheme: (theme: ThemeType) => void;
  onUpdateSpeed: (speed: number) => void;
  onUpdateRepeat: (repeat: RepeatMode) => void;
  onUpdateEndOfSurah: (mode: EndOfSurahMode) => void;
  onToggleBasmalahAudio: (val: boolean) => void;
  onToggleWakeLock: (val: boolean) => void;
  onSetSleepTimer: (minutes: number | null) => void;
  onDownloadSurah: () => void;
  onDeleteSurahDownload: () => void;
  onClearAllDownloads: () => void;
  onOpenMobileViewModal?: () => void;
}

export const SettingsSheet: React.FC<SettingsSheetProps> = ({
  isOpen,
  settings,
  sleepTimerRemaining,
  surahName,
  totalAyahs,
  isCurrentSurahDownloaded,
  isDownloading,
  downloadPercent,
  downloadRegistry,
  onClose,
  onUpdateTheme,
  onUpdateSpeed,
  onUpdateRepeat,
  onUpdateEndOfSurah,
  onToggleBasmalahAudio,
  onToggleWakeLock,
  onSetSleepTimer,
  onDownloadSurah,
  onDeleteSurahDownload,
  onClearAllDownloads,
  onOpenMobileViewModal,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const themeConfig = THEMES[settings.theme] || THEMES['midnight-emerald'];
  const downloadedCount = Object.keys(downloadRegistry).length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="absolute inset-0" onClick={onClose} />

      <div
        className={`relative w-full max-w-lg max-h-[88dvh] rounded-t-3xl border-t border-x flex flex-col shadow-2xl overflow-hidden pb-safe animate-slide-up ${themeConfig.glassSurface} ${themeConfig.glassBorder}`}
      >
        <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto my-3 shrink-0" />

        <div className="px-5 pb-3 flex items-center justify-between border-b border-white/10 shrink-0">
          <div>
            <h2 className="font-ui font-bold text-lg text-white">Pengaturan</h2>
            <p className="font-ui text-xs text-stone-400">Preferensi suara, tampilan, dan pemutaran</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Tutup"
            className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-stone-300 hover:text-white active:scale-95 transition min-h-[44px] min-w-[44px]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* 1. Theme Selector */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Palette className="w-4 h-4 text-amber-400" />
              <label className="text-xs font-bold uppercase tracking-wider text-stone-300 font-ui">
                Pilihan Tema
              </label>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {(Object.keys(THEMES) as ThemeType[]).map(tKey => {
                const item = THEMES[tKey];
                const isActive = settings.theme === tKey;
                return (
                  <button
                    key={tKey}
                    onClick={() => onUpdateTheme(tKey)}
                    className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all min-h-[58px] ${
                      isActive
                        ? 'border-amber-400 bg-amber-400/20 shadow-md ring-1 ring-amber-400/50'
                        : 'border-white/10 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="font-ui font-semibold text-xs text-white">
                        {item.name}
                      </span>
                      {isActive && <Check className="w-3.5 h-3.5 text-amber-400 stroke-[3]" />}
                    </div>
                    <span className="font-ui text-[10px] text-stone-400 mt-1 line-clamp-1">
                      {item.tagline}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Playback Speed */}
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <Gauge className="w-4 h-4 text-amber-400" />
              <label className="text-xs font-bold uppercase tracking-wider text-stone-300 font-ui">
                Kecepatan Audio
              </label>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[0.75, 1.0, 1.25, 1.5].map(speed => (
                <button
                  key={speed}
                  onClick={() => onUpdateSpeed(speed)}
                  className={`py-2 rounded-xl text-xs font-mono font-medium border transition-all min-h-[44px] ${
                    settings.playbackSpeed === speed
                      ? 'bg-amber-400 text-stone-950 border-amber-400 font-bold shadow'
                      : 'bg-white/5 text-stone-300 border-white/10 hover:bg-white/10'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>
          </div>

          {/* 3. Ayah Repetition (Tahfidz Memorization) */}
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <Repeat className="w-4 h-4 text-amber-400" />
              <label className="text-xs font-bold uppercase tracking-wider text-stone-300 font-ui">
                Ulangi Ayat (Untuk Menghafal)
              </label>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {(['off', '2x', '3x', 'infinite'] as RepeatMode[]).map(mode => (
                <button
                  key={mode}
                  onClick={() => onUpdateRepeat(mode)}
                  className={`py-2 rounded-xl text-xs font-ui capitalize border transition-all min-h-[44px] ${
                    settings.repeatMode === mode
                      ? 'bg-amber-400 text-stone-950 border-amber-400 font-bold shadow'
                      : 'bg-white/5 text-stone-300 border-white/10 hover:bg-white/10'
                  }`}
                >
                  {mode === 'off' ? 'Mati' : mode === 'infinite' ? '∞ Selamanya' : mode}
                </button>
              ))}
            </div>
          </div>

          {/* 4. End of Surah Action */}
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-300 font-ui">
                Setelah Surah Selesai
              </label>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'next', label: 'Lanjut Surah' },
                { id: 'repeat', label: 'Ulangi Surah' },
                { id: 'stop', label: 'Berhenti' },
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => onUpdateEndOfSurah(opt.id as EndOfSurahMode)}
                  className={`py-2 px-1 text-center rounded-xl text-xs font-ui border transition-all min-h-[44px] ${
                    settings.endOfSurahMode === opt.id
                      ? 'bg-amber-400 text-stone-950 border-amber-400 font-bold shadow'
                      : 'bg-white/5 text-stone-300 border-white/10 hover:bg-white/10'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* 5. Sleep Timer */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <Moon className="w-4 h-4 text-amber-400" />
                <label className="text-xs font-bold uppercase tracking-wider text-stone-300 font-ui">
                  Sleep Timer (Pengatur Waktu Tidur)
                </label>
              </div>
              {sleepTimerRemaining !== null && (
                <span className="text-xs font-mono text-amber-300">
                  {Math.ceil(sleepTimerRemaining / 60)} menit tersisa
                </span>
              )}
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[null, 15, 30, 60].map(mins => {
                const isActive =
                  (mins === null && sleepTimerRemaining === null) ||
                  (mins !== null && sleepTimerRemaining !== null && Math.ceil(sleepTimerRemaining / 60) <= mins);
                return (
                  <button
                    key={mins ?? 'off'}
                    onClick={() => onSetSleepTimer(mins)}
                    className={`py-2 rounded-xl text-xs font-ui border transition-all min-h-[44px] ${
                      (mins === null && sleepTimerRemaining === null)
                        ? 'bg-amber-400 text-stone-950 border-amber-400 font-bold'
                        : 'bg-white/5 text-stone-300 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    {mins === null ? 'Mati' : `${mins} Menit`}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 6. Screen Wake Lock & Basmalah Audio Toggles */}
          <div className="space-y-3 pt-2 border-t border-white/10">
            {/* Audio Basmalah Pembuka */}
            <div className="flex items-center justify-between py-1">
              <div className="flex items-center gap-2.5">
                <Volume2 className="w-4 h-4 text-amber-400" />
                <div>
                  <div className="font-ui text-xs font-semibold text-white">
                    Audio Basmalah Pembuka
                  </div>
                  <div className="font-ui text-[11px] text-stone-400">
                    Putar bismillah sebelum ayat 1 surah (kecuali QS. At-Taubah)
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.playBasmalahOpening}
                onChange={e => onToggleBasmalahAudio(e.target.checked)}
                className="w-5 h-5 accent-amber-400 rounded cursor-pointer min-h-[44px] min-w-[44px]"
              />
            </div>

            {/* Screen Wake Lock */}
            <div className="flex items-center justify-between py-1">
              <div className="flex items-center gap-2.5">
                <Smartphone className="w-4 h-4 text-amber-400" />
                <div>
                  <div className="font-ui text-xs font-semibold text-white">
                    Tetap Nyalakan Layar
                  </div>
                  <div className="font-ui text-[11px] text-stone-400">
                    Layar tidak otomatis mati saat murottal berputar
                  </div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={settings.keepScreenAwake}
                onChange={e => onToggleWakeLock(e.target.checked)}
                className="w-5 h-5 accent-amber-400 rounded cursor-pointer min-h-[44px] min-w-[44px]"
              />
            </div>
          </div>

          {/* 7. Unduhan Audio 1 Surah & Penyimpanan Laptop / Perangkat */}
          <div className="pt-2 border-t border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-amber-400" />
                <label className="text-xs font-bold uppercase tracking-wider text-stone-300 font-ui">
                  Unduh Audio Surah (Offline)
                </label>
              </div>
              <span className="text-[11px] font-ui text-stone-400">
                {downloadedCount} surah tersimpan
              </span>
            </div>

            {/* Current Surah Download Card */}
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-ui font-semibold text-white block">
                    QS. {surahName} ({totalAyahs} Ayat)
                  </span>
                  <span className="text-[11px] font-ui text-stone-400">
                    {isCurrentSurahDownloaded
                      ? '✓ Tersimpan di laptop/HP (Bisa diputar tanpa internet)'
                      : isDownloading
                      ? `Sedang mengunduh: ${downloadPercent || 0}%...`
                      : 'Belum diunduh (Membutuhkan kuota/internet)'}
                  </span>
                </div>

                {isCurrentSurahDownloaded ? (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold border border-emerald-500/30">
                    Tersimpan
                  </span>
                ) : null}
              </div>

              {/* Action Buttons for Current Surah */}
              <div className="flex items-center gap-2 pt-1">
                {!isCurrentSurahDownloaded ? (
                  <button
                    onClick={onDownloadSurah}
                    disabled={isDownloading}
                    className="flex-1 py-2 px-3 rounded-xl bg-amber-500 text-stone-950 font-ui font-semibold text-xs flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95 transition"
                  >
                    {isDownloading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Mengunduh ({downloadPercent || 0}%)...</span>
                      </>
                    ) : (
                      <>
                        <CloudDownload className="w-4 h-4" />
                        <span>Unduh 1 Surah Ini ({totalAyahs} Ayat)</span>
                      </>
                    )}
                  </button>
                ) : (
                  <button
                    onClick={onDeleteSurahDownload}
                    className="py-2 px-3 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30 font-ui font-medium text-xs flex items-center justify-center gap-1.5 active:scale-95 transition hover:bg-rose-500/30"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus Unduhan Surah Ini</span>
                  </button>
                )}
              </div>
            </div>

            {/* Clear All Audio Cache if multiple exist */}
            {downloadedCount > 0 && (
              <button
                onClick={onClearAllDownloads}
                className="w-full py-2 px-3 rounded-xl border border-white/10 text-stone-400 hover:text-stone-200 text-[11px] font-ui flex items-center justify-center gap-1.5 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Bersihkan Semua Audio Offline ({downloadedCount} Surah)</span>
              </button>
            )}
          </div>

          {/* 8. Tampilan Versi Mobile & Mode HP */}
          <div className="pt-2 border-t border-white/10">
            <button
              onClick={() => {
                onClose();
                onOpenMobileViewModal?.();
              }}
              className="w-full py-3 px-4 rounded-2xl bg-white/5 border border-white/10 hover:border-amber-400/40 text-stone-200 hover:text-white hover:bg-white/10 font-ui font-semibold text-xs flex items-center justify-between shadow-sm active:scale-95 transition"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center border border-amber-400/30">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="text-xs text-white font-semibold">Tampilan Versi Mobile</div>
                  <div className="text-[10px] text-stone-400 font-normal">Bingkai HP, Preset Layar & QR Code</div>
                </div>
              </div>
              <span className="text-[11px] text-amber-300 font-mono font-medium">Buka →</span>
            </button>
          </div>

          {/* 9. PWA Install Action */}
          <div className="pt-2 border-t border-white/10">
            {isInstallable && (
              <button
                onClick={install}
                className="w-full py-3 px-4 rounded-2xl bg-amber-500 text-stone-950 font-ui font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition"
              >
                <Download className="w-4 h-4" />
                <span>Pasang Aplikasi (Add to Home Screen)</span>
              </button>
            )}

            {isIOS && !isInstalled && (
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-xs font-ui text-stone-300">
                <span className="font-semibold text-amber-300">Cara pasang di iPhone / Safari:</span>
                <p className="mt-1 text-[11px] text-stone-400 leading-relaxed">
                  Ketuk tombol <strong>Share</strong> (ikon kotak berpanah) di bawah layar Safari, lalu pilih <strong>Add to Home Screen</strong>.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
