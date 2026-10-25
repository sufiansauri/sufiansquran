import { BookOpen, Mic, Settings, Info, ChevronDown, CloudDownload, CloudCheck, Loader2 } from 'lucide-react';
import { ThemeType } from '../types/quran';
import { THEMES } from '../config/themes';

interface TopBarProps {
  surahName: string;
  ayahNumber: number;
  totalAyahs: number;
  revelationType: string;
  theme: ThemeType;
  isVisible: boolean;
  isDownloaded: boolean;
  isDownloading: boolean;
  downloadPercent?: number;
  onDownloadSurah: () => void;
  onOpenSurahSheet: () => void;
  onOpenQariSheet: () => void;
  onOpenSettingsSheet: () => void;
  onOpenAboutSheet: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  surahName,
  ayahNumber,
  totalAyahs,
  revelationType,
  theme,
  isVisible,
  isDownloaded,
  isDownloading,
  downloadPercent,
  onDownloadSurah,
  onOpenSurahSheet,
  onOpenQariSheet,
  onOpenSettingsSheet,
  onOpenAboutSheet,
}) => {
  const themeConfig = THEMES[theme] || THEMES['midnight-emerald'];

  return (
    <header
      className={`w-full pt-safe z-30 transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'
      }`}
    >
      <div className="w-full max-w-lg mx-auto px-4 py-2.5 flex items-center justify-between gap-2">
        {/* Left: Surah & Verse Badge Trigger */}
        <button
          onClick={onOpenSurahSheet}
          aria-label="Pilih Surah"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border ${themeConfig.glassSurface} ${themeConfig.glassBorder} active:scale-95 transition-all text-left group min-h-[44px]`}
        >
          <BookOpen className="w-4 h-4 text-amber-400 shrink-0" />
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <span className="font-ui font-bold text-xs sm:text-sm text-white tracking-tight truncate max-w-[125px]">
                QS. {surahName}
              </span>
              <span className="font-ui font-semibold text-xs text-amber-300">
                : {ayahNumber}
              </span>
              <ChevronDown className="w-3 h-3 text-stone-400 group-hover:text-white transition-colors" />
            </div>
            <span className="text-[10px] text-stone-400 font-ui leading-none">
              Ayat {ayahNumber}/{totalAyahs} · {revelationType === 'Meccan' ? 'Makkiyah' : 'Madaniyah'}
            </span>
          </div>
        </button>

        {/* Right Action Icons: Download Surah, Qari, Settings, About */}
        <div className="flex items-center gap-1">
          {/* Download 1 Surah Offline Button */}
          <button
            onClick={onDownloadSurah}
            disabled={isDownloading}
            aria-label={
              isDownloaded
                ? 'Surah ini sudah tersimpan di perangkat (Offline)'
                : 'Download 1 Surah ini agar tersimpan di laptop'
            }
            title={
              isDownloading
                ? `Mendownload: ${downloadPercent || 0}%`
                : isDownloaded
                ? 'Tersimpan Offline di Laptop (Putar Tanpa Internet)'
                : 'Download 1 Surah ini Lengkap ke Laptop'
            }
            className={`px-2.5 h-10 rounded-xl flex items-center gap-1.5 border ${themeConfig.glassSurface} ${
              isDownloaded
                ? 'border-emerald-500/50 bg-emerald-500/15 text-emerald-300'
                : isDownloading
                ? 'border-amber-400/60 bg-amber-400/20 text-amber-300'
                : `${themeConfig.glassBorder} text-stone-300 hover:text-amber-300`
            } active:scale-90 transition-all min-h-[44px]`}
          >
            {isDownloading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                <span className="font-mono text-[11px] font-bold">{downloadPercent || 0}%</span>
              </>
            ) : isDownloaded ? (
              <>
                <CloudCheck className="w-4 h-4 text-emerald-400" />
                <span className="font-ui text-[11px] font-medium hidden sm:inline">Offline</span>
              </>
            ) : (
              <>
                <CloudDownload className="w-4 h-4" />
                <span className="font-ui text-[11px] font-medium hidden sm:inline">Unduh</span>
              </>
            )}
          </button>

          {/* Qari Button */}
          <button
            onClick={onOpenQariSheet}
            aria-label="Pilih Qari"
            title="Pilih Qari"
            className={`w-10 h-10 rounded-xl flex items-center justify-center border ${themeConfig.glassSurface} ${themeConfig.glassBorder} text-stone-200 active:scale-90 hover:text-amber-300 transition-all min-h-[44px] min-w-[44px]`}
          >
            <Mic className="w-4 h-4" />
          </button>

          {/* Settings Button */}
          <button
            onClick={onOpenSettingsSheet}
            aria-label="Pengaturan"
            title="Pengaturan & Kelola Unduhan"
            className={`w-10 h-10 rounded-xl flex items-center justify-center border ${themeConfig.glassSurface} ${themeConfig.glassBorder} text-stone-200 active:scale-90 hover:text-amber-300 transition-all min-h-[44px] min-w-[44px]`}
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* About / Creator Info Button */}
          <button
            onClick={onOpenAboutSheet}
            aria-label="Tentang Pembuat"
            title="Tentang Pembuat"
            className={`w-10 h-10 rounded-xl flex items-center justify-center border ${themeConfig.glassSurface} ${themeConfig.glassBorder} text-stone-200 active:scale-90 hover:text-amber-300 transition-all min-h-[44px] min-w-[44px]`}
          >
            <Info className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
