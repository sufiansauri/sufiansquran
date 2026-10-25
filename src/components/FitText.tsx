import React, { useEffect, useRef, useState, useLayoutEffect, useCallback } from 'react';
import { Ayah, ThemeType } from '../types/quran';
import { THEMES } from '../config/themes';

interface FitTextProps {
  ayah: Ayah;
  surahNumber: number;
  totalAyahs: number;
  showTranslation: boolean;
  hasBasmalahHeader?: boolean;
  basmalahText?: string;
  theme: ThemeType;
  audioProgress: number; // 0 to 1
  isPlaying: boolean;
  isPlayingBasmalah?: boolean;
  onTap?: () => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
}

// Convert western digits to Arabic-Indic digits: 1 -> ١, 255 -> ٢٥٥
function toArabicIndic(num: number): string {
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return String(num).split('').map(d => arabicDigits[Number(d)] || d).join('');
}

export const FitText: React.FC<FitTextProps> = ({
  ayah,
  surahNumber,
  totalAyahs,
  showTranslation,
  hasBasmalahHeader,
  basmalahText,
  theme,
  audioProgress,
  isPlaying,
  isPlayingBasmalah,
  onTap,
  onSwipeLeft,
  onSwipeRight,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLDivElement>(null);

  const [fontSizeAr, setFontSizeAr] = useState<number>(32);
  const [fontSizeTr, setFontSizeTr] = useState<number>(14);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [isOverflowing, setIsOverflowing] = useState<boolean>(false);
  const [isLandscape, setIsLandscape] = useState<boolean>(false);

  const themeConfig = THEMES[theme] || THEMES['midnight-emerald'];

  // Touch swipe handling
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const deltaY = e.changedTouches[0].clientY - touchStartY.current;

    // Only swipe if horizontal move is significant and greater than vertical move
    if (Math.abs(deltaX) > 48 && Math.abs(deltaX) > Math.abs(deltaY) * 1.5) {
      if (deltaX < 0) {
        // Swiped left -> Next ayah
        onSwipeLeft?.();
      } else {
        // Swiped right -> Previous ayah
        onSwipeRight?.();
      }
    }
  };

  /**
   * Binary search font fitting algorithm
   */
  const computeOptimalFontSize = useCallback(() => {
    const container = containerRef.current;
    const measureEl = measureRef.current;
    if (!container || !measureEl) return;

    const availableWidth = container.clientWidth - 44; // Card horizontal padding & margins
    const availableHeight = container.clientHeight - 36; // Card vertical padding & margins

    if (availableWidth <= 0 || availableHeight <= 0) return;

    const landscapeMode = availableWidth > availableHeight && availableWidth > 540;
    setIsLandscape(landscapeMode);

    // Apply measuring width
    measureEl.style.width = landscapeMode ? `${Math.floor(availableWidth / 2 - 20)}px` : `${availableWidth}px`;

    let low = 16;
    let high = 42;
    let best = 16;
    let bestTr = 13;

    // Binary search over Arabic font size (5 iterations)
    for (let i = 0; i < 6; i++) {
      const mid = Math.floor((low + high) / 2);
      const trSize = Math.max(11, Math.min(17, Math.round(mid * 0.42)));

      // Apply to measure elements
      const arEl = measureEl.querySelector('.measure-arabic') as HTMLElement | null;
      const trEl = measureEl.querySelector('.measure-translation') as HTMLElement | null;

      if (arEl) {
        arEl.style.fontSize = `${mid}px`;
        arEl.style.lineHeight = mid > 28 ? '1.8' : '1.7';
      }
      if (trEl) {
        trEl.style.fontSize = `${trSize}px`;
        trEl.style.lineHeight = '1.45';
      }

      // In landscape, we check max of Arabic and Translation heights; in portrait, we check sum
      let contentHeight = 0;
      if (landscapeMode) {
        const arHeight = arEl?.offsetHeight || 0;
        const trHeight = (showTranslation && trEl) ? trEl.offsetHeight : 0;
        contentHeight = Math.max(arHeight, trHeight) + 40; // with basmalah margin
      } else {
        contentHeight = measureEl.scrollHeight;
      }

      if (contentHeight <= availableHeight) {
        best = mid;
        bestTr = trSize;
        low = mid + 1; // Try bigger
      } else {
        high = mid - 1; // Must be smaller
      }
    }

    setFontSizeAr(best);
    setFontSizeTr(bestTr);

    // Check if at minimum size it still overflows (like QS 2:282)
    const finalArEl = measureEl.querySelector('.measure-arabic') as HTMLElement | null;
    const finalTrEl = measureEl.querySelector('.measure-translation') as HTMLElement | null;
    if (finalArEl) finalArEl.style.fontSize = `${best}px`;
    if (finalTrEl) finalTrEl.style.fontSize = `${bestTr}px`;

    const totalFinalHeight = measureEl.scrollHeight;
    const overflowing = totalFinalHeight > availableHeight + 6;
    setIsOverflowing(overflowing);

    setIsReady(true);
  }, [showTranslation, isLandscape]);

  // Recalculate on verse change, translation toggle, resize, and font load
  useLayoutEffect(() => {
    setIsReady(false);
    computeOptimalFontSize();
  }, [ayah.number, ayah.text, ayah.translation, showTranslation, computeOptimalFontSize]);

  useEffect(() => {
    const handleResize = () => {
      computeOptimalFontSize();
    };

    const container = containerRef.current;
    let observer: ResizeObserver | null = null;
    if (container && window.ResizeObserver) {
      observer = new ResizeObserver(() => {
        computeOptimalFontSize();
      });
      observer.observe(container);
    }

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    // Recompute once fonts are completely loaded
    if (document.fonts) {
      document.fonts.ready.then(() => {
        computeOptimalFontSize();
      });
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      if (observer && container) observer.unobserve(container);
    };
  }, [computeOptimalFontSize]);

  // Synchronized auto-scroll for long verses (e.g. 2:282)
  useEffect(() => {
    const scrollEl = scrollRef.current;
    if (!scrollEl) return;

    if (!isOverflowing) {
      scrollEl.scrollTop = 0;
      return;
    }

    if (isPlaying && audioProgress > 0) {
      const maxScroll = scrollEl.scrollHeight - scrollEl.clientHeight;
      if (maxScroll > 0) {
        // Smoothly scroll down along with audio progress
        scrollEl.scrollTo({
          top: audioProgress * maxScroll,
          behavior: 'smooth',
        });
      }
    }
  }, [audioProgress, isOverflowing, isPlaying]);

  // Reset scroll to top when ayah changes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [ayah.number]);

  return (
    <div
      ref={containerRef}
      onClick={onTap}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="relative flex-1 min-h-0 w-full h-full flex flex-col items-center justify-center overflow-hidden px-4 select-none cursor-pointer"
    >
      {/* Hidden Offscreen Measure Element */}
      <div
        ref={measureRef}
        aria-hidden="true"
        className="absolute left-[-9999px] top-[-9999px] opacity-0 pointer-events-none p-4"
      >
        {hasBasmalahHeader && ayah.numberInSurah === 1 && basmalahText && (
          <div className="text-center mb-3">
            <span className="font-arabic text-lg">{basmalahText}</span>
          </div>
        )}
        <div className="measure-arabic font-arabic text-center leading-relaxed">
          {ayah.text} ۝{toArabicIndic(ayah.numberInSurah)}
        </div>
        {showTranslation && ayah.translation && (
          <div className="measure-translation font-ui text-center mt-3 leading-relaxed">
            {ayah.translation}
          </div>
        )}
      </div>

      {/* Visible Render Container */}
      <div
        ref={scrollRef}
        className={`w-full h-full flex flex-col justify-center items-center overflow-y-auto no-scrollbar transition-opacity duration-300 ${
          isReady ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          scrollBehavior: 'smooth',
        }}
      >
        <div
          className={`w-full max-w-lg mx-auto py-3.5 px-4 sm:px-5 rounded-3xl bg-black/25 backdrop-blur-[5px] border border-white/10 shadow-2xl flex flex-col justify-center items-center transition-all ${
            isLandscape ? 'flex-row gap-6' : ''
          }`}
        >
          {/* Main Column or Left Column in Landscape */}
          <div className={`w-full flex flex-col items-center justify-center ${isLandscape ? 'w-1/2' : ''}`}>
            
            {/* Basmalah Header (if Surah Ayah 1 and applicable) */}
            {hasBasmalahHeader && ayah.numberInSurah === 1 && basmalahText && (
              <div
                className={`mb-2.5 px-3.5 py-1 rounded-full border text-center shadow-lg transition-all duration-300 flex items-center justify-center gap-2 ${
                  isPlayingBasmalah
                    ? 'border-amber-400 bg-amber-400/25 text-amber-200 ring-2 ring-amber-400/60 shadow-[0_0_20px_rgba(251,191,36,0.5)] animate-pulse scale-[1.03]'
                    : 'border-amber-400/30 bg-black/40 text-amber-300'
                }`}
              >
                {isPlayingBasmalah && (
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping shrink-0" />
                )}
                <span className="font-arabic text-base sm:text-lg tracking-wide opacity-95">
                  {basmalahText}
                </span>
                {isPlayingBasmalah && (
                  <span className="text-[10px] font-ui uppercase font-bold tracking-wider text-amber-300 ml-1">
                    Sedang Dibaca
                  </span>
                )}
              </div>
            )}

            {/* Arabic Verse with Calligraphic End Medallion */}
            <div
              dir="rtl"
              lang="ar"
              className={`font-arabic text-center leading-[1.8] tracking-normal transition-all duration-200 text-[#fff7df] drop-shadow-[0_2px_12px_rgba(0,0,0,0.95)] ${themeConfig.arabicGlow}`}
              style={{
                fontSize: `${fontSizeAr}px`,
                wordBreak: 'break-word',
              }}
            >
              {ayah.text}{' '}
              {/* Ornamental Ayah End Symbol */}
              <span
                className="inline-flex items-center justify-center font-arabic px-1.5 py-0.5 mx-1 rounded-full text-amber-300 select-none border border-amber-400/40 bg-black/50 text-xs sm:text-sm align-middle shadow-md"
                style={{ fontSize: `${Math.max(12, Math.round(fontSizeAr * 0.46))}px` }}
                title={`Ayat ${ayah.numberInSurah}`}
              >
                ۝{toArabicIndic(ayah.numberInSurah)}
              </span>
            </div>
          </div>

          {/* Indonesian Translation */}
          {showTranslation && ayah.translation && (
            <div
              className={`w-full text-center transition-all duration-200 ${
                isLandscape ? 'w-1/2 border-l border-white/10 pl-4' : 'mt-3 sm:mt-4 pt-2.5 border-t border-white/10'
              }`}
            >
              <div
                className="font-ui font-medium leading-relaxed tracking-normal text-white drop-shadow-[0_1px_8px_rgba(0,0,0,0.95)]"
                style={{
                  fontSize: `${fontSizeTr}px`,
                  lineHeight: fontSizeTr > 14 ? '1.55' : '1.45',
                }}
              >
                {ayah.translation}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Subtle indicator if verse is ultra-long and auto-scrolling */}
      {isOverflowing && isPlaying && (
        <div className="absolute bottom-1 right-3 text-[10px] tracking-wider uppercase font-ui opacity-40 text-amber-300 pointer-events-none">
          Auto-scroll
        </div>
      )}
    </div>
  );
};
