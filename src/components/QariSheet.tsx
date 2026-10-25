import React from 'react';
import { X, Check, Mic, Radio } from 'lucide-react';
import { QARI_LIST } from '../config/qari';
import { ThemeType } from '../types/quran';
import { THEMES } from '../config/themes';

interface QariSheetProps {
  isOpen: boolean;
  selectedQariId: string;
  theme: ThemeType;
  onClose: () => void;
  onSelectQari: (qariId: string) => void;
}

export const QariSheet: React.FC<QariSheetProps> = ({
  isOpen,
  selectedQariId,
  theme,
  onClose,
  onSelectQari,
}) => {
  const themeConfig = THEMES[theme] || THEMES['midnight-emerald'];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="absolute inset-0" onClick={onClose} />

      <div
        className={`relative w-full max-w-lg max-h-[85dvh] rounded-t-3xl border-t border-x flex flex-col shadow-2xl overflow-hidden pb-safe animate-slide-up ${themeConfig.glassSurface} ${themeConfig.glassBorder}`}
      >
        <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto my-3 shrink-0" />

        <div className="px-5 pb-3 flex items-center justify-between border-b border-white/10 shrink-0">
          <div>
            <h2 className="font-ui font-bold text-lg text-white">Pilih Qari</h2>
            <p className="font-ui text-xs text-stone-400">8 Qari ternama dunia (Audio EveryAyah)</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Tutup"
            className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-stone-300 hover:text-white active:scale-95 transition min-h-[44px] min-w-[44px]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {QARI_LIST.map(qari => {
            const isSelected = qari.id === selectedQariId;
            return (
              <button
                key={qari.id}
                onClick={() => {
                  onSelectQari(qari.id);
                  onClose();
                }}
                className={`w-full p-4 rounded-2xl flex items-center justify-between text-left transition-all border min-h-[64px] active:scale-[0.98] ${
                  isSelected
                    ? 'border-amber-400 bg-amber-400/15 shadow-md shadow-amber-400/10'
                    : 'border-white/10 bg-white/5 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isSelected ? 'bg-amber-400 text-stone-950' : 'bg-white/10 text-stone-300'
                    }`}
                  >
                    <Mic className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-ui font-bold text-sm text-white">
                        {qari.name}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-stone-400 font-mono">
                        {qari.bitrate}
                      </span>
                    </div>
                    <p className="font-ui text-xs text-stone-400 mt-0.5">
                      {qari.style}
                    </p>
                    <p className="font-arabic text-sm text-amber-300/80 mt-1" dir="rtl">
                      {qari.arabicName}
                    </p>
                  </div>
                </div>

                {isSelected && (
                  <div className="w-6 h-6 rounded-full bg-amber-400 text-stone-950 flex items-center justify-center shrink-0 shadow">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
