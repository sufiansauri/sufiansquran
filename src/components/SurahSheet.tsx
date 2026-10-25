import React, { useState, useMemo } from 'react';
import { Search, X, Check, Hash, CornerDownLeft, CloudCheck } from 'lucide-react';
import { SURAH_LIST } from '../config/surahs';
import { ThemeType } from '../types/quran';
import { THEMES } from '../config/themes';

interface SurahSheetProps {
  isOpen: boolean;
  currentSurahNumber: number;
  currentAyahNumber: number;
  theme: ThemeType;
  selectedQariId?: string;
  downloadRegistry?: Record<string, any>;
  onClose: () => void;
  onSelectSurah: (surahNumber: number, ayahNumber?: number) => void;
}

export const SurahSheet: React.FC<SurahSheetProps> = ({
  isOpen,
  currentSurahNumber,
  currentAyahNumber,
  theme,
  selectedQariId,
  downloadRegistry = {},
  onClose,
  onSelectSurah,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [jumpAyahInput, setJumpAyahInput] = useState('');
  const [selectedSurahForAyah, setSelectedSurahForAyah] = useState<number | null>(null);

  const themeConfig = THEMES[theme] || THEMES['midnight-emerald'];

  // Filter surahs
  const filteredSurahs = useMemo(() => {
    if (!searchQuery.trim()) return SURAH_LIST;
    const q = searchQuery.toLowerCase().trim();
    return SURAH_LIST.filter(s =>
      s.number.toString() === q ||
      s.indonesianName.toLowerCase().includes(q) ||
      s.englishName.toLowerCase().includes(q) ||
      s.translation.toLowerCase().includes(q) ||
      s.name.includes(q)
    );
  }, [searchQuery]);

  if (!isOpen) return null;

  const activeSurahMeta = SURAH_LIST[currentSurahNumber - 1];

  const handleJumpToAyah = (e: React.FormEvent) => {
    e.preventDefault();
    const ayahNum = parseInt(jumpAyahInput, 10);
    if (!isNaN(ayahNum) && ayahNum >= 1 && ayahNum <= activeSurahMeta.numberOfAyahs) {
      onSelectSurah(currentSurahNumber, ayahNum);
      setJumpAyahInput('');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      {/* Tap backdrop to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Sheet Content */}
      <div
        className={`relative w-full max-w-lg max-h-[88dvh] rounded-t-3xl border-t border-x flex flex-col shadow-2xl overflow-hidden pb-safe animate-slide-up ${themeConfig.glassSurface} ${themeConfig.glassBorder}`}
      >
        {/* Grab Handle */}
        <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto my-3 shrink-0" />

        {/* Header */}
        <div className="px-5 pb-3 flex items-center justify-between border-b border-white/10 shrink-0">
          <div>
            <h2 className="font-ui font-bold text-lg text-white">Daftar Surah</h2>
            <p className="font-ui text-xs text-stone-400">114 Surah Al-Qur'an Al-Karim</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Tutup"
            className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-stone-300 hover:text-white active:scale-95 transition min-h-[44px] min-w-[44px]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Jump to Ayah Form for Current Surah */}
        <div className="px-5 py-2.5 bg-white/5 border-b border-white/10 shrink-0">
          <form onSubmit={handleJumpToAyah} className="flex items-center gap-2">
            <span className="text-xs font-ui text-stone-300 whitespace-nowrap">
              Lompat ke Ayat:
            </span>
            <div className="relative flex-1">
              <input
                type="number"
                min="1"
                max={activeSurahMeta.numberOfAyahs}
                placeholder={`1 - ${activeSurahMeta.numberOfAyahs}`}
                value={jumpAyahInput}
                onChange={e => setJumpAyahInput(e.target.value)}
                className="w-full bg-black/30 border border-white/15 rounded-xl px-3 py-1.5 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-amber-400"
              />
            </div>
            <button
              type="submit"
              disabled={!jumpAyahInput}
              className="px-3 py-1.5 rounded-xl bg-amber-500 text-stone-950 font-ui font-semibold text-xs disabled:opacity-40 disabled:pointer-events-none active:scale-95 transition"
            >
              Lompat
            </button>
          </form>
        </div>

        {/* Search Bar */}
        <div className="px-5 py-3 border-b border-white/10 shrink-0">
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 w-4 h-4 text-stone-400" />
            <input
              type="text"
              placeholder="Cari nama surah, arti, atau nomor..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-black/40 border border-white/15 rounded-2xl pl-10 pr-9 py-2.5 text-sm text-white placeholder-stone-500 focus:outline-none focus:border-amber-400 font-ui transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 text-stone-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Surah List */}
        <div className="flex-1 overflow-y-auto divide-y divide-white/5 px-2">
          {filteredSurahs.length === 0 ? (
            <div className="py-12 text-center text-sm font-ui text-stone-400">
              Tidak ada surah yang cocok dengan "{searchQuery}".
            </div>
          ) : (
            filteredSurahs.map(s => {
              const isCurrent = s.number === currentSurahNumber;
              const isDownloaded = Boolean(
                selectedQariId && downloadRegistry[`${s.number}_${selectedQariId}`]
              );
              return (
                <button
                  key={s.number}
                  onClick={() => {
                    onSelectSurah(s.number, 1);
                    onClose();
                  }}
                  className={`w-full px-4 py-3 rounded-2xl flex items-center justify-between text-left transition-all my-1 min-h-[56px] active:scale-[0.99] ${
                    isCurrent
                      ? 'bg-amber-400/15 border border-amber-400/40'
                      : 'hover:bg-white/5'
                  }`}
                >
                  {/* Left: Number + Indonesian Info */}
                  <div className="flex items-center gap-3">
                    {/* Number Badge */}
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-ui font-bold text-xs shrink-0 ${
                        isCurrent
                          ? 'bg-amber-400 text-stone-950 shadow-md shadow-amber-400/20'
                          : 'bg-white/10 text-stone-300'
                      }`}
                    >
                      {s.number}
                    </div>

                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <span className="font-ui font-semibold text-sm text-white">
                          {s.indonesianName}
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-400/20 text-amber-300 font-medium">
                            Diputar
                          </span>
                        )}
                        {isDownloaded && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-medium border border-emerald-500/30">
                            <CloudCheck className="w-3 h-3 text-emerald-400" />
                            <span>Offline</span>
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-stone-400 font-ui truncate max-w-[170px] sm:max-w-xs">
                        {s.translation} · {s.numberOfAyahs} ayat · {s.revelationType === 'Meccan' ? 'Makkiyah' : 'Madaniyah'}
                      </span>
                    </div>
                  </div>

                  {/* Right: Arabic Calligraphy Name */}
                  <div className="font-arabic text-xl sm:text-2xl text-amber-300/90 text-right shrink-0">
                    {s.name}
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
