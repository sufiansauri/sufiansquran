import React, { useState, useEffect } from 'react';
import { useQuranPlayer } from './hooks/useQuranPlayer';
import { IslamicBackground } from './components/IslamicBackground';
import { SplashScreen } from './components/SplashScreen';
import { TopBar } from './components/TopBar';
import { FitText } from './components/FitText';
import { PlayerDock } from './components/PlayerDock';
import { SurahSheet } from './components/SurahSheet';
import { QariSheet } from './components/QariSheet';
import { SettingsSheet } from './components/SettingsSheet';
import { AboutSheet } from './components/AboutSheet';
import { Toast } from './components/Toast';
import { THEMES } from './config/themes';
import { Loader2, Smartphone } from 'lucide-react';
import { MobileViewModal, MobilePreset, MOBILE_PRESETS } from './components/MobileViewModal';
import { PhoneChassis } from './components/PhoneChassis';

export default function App() {
  const [hasStarted, setHasStarted] = useState<boolean>(false);
  const [isImmersiveControlsVisible, setIsImmersiveControlsVisible] = useState<boolean>(true);
  const [isControlsMinimized, setIsControlsMinimized] = useState<boolean>(false);

  // Sheets state
  const [isSurahSheetOpen, setIsSurahSheetOpen] = useState<boolean>(false);
  const [isQariSheetOpen, setIsQariSheetOpen] = useState<boolean>(false);
  const [isSettingsSheetOpen, setIsSettingsSheetOpen] = useState<boolean>(false);
  const [isAboutSheetOpen, setIsAboutSheetOpen] = useState<boolean>(false);
  const [isMobileViewModalOpen, setIsMobileViewModalOpen] = useState<boolean>(false);

  // Mobile Version Frame & Preset Settings (saved in localStorage)
  const [isMobileFrameEnabled, setIsMobileFrameEnabled] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('quran_mobile_frame');
      if (saved !== null) return saved === 'true';
    }
    return true;
  });
  const [mobilePreset, setMobilePreset] = useState<MobilePreset>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('quran_mobile_preset') as MobilePreset;
      if (saved && MOBILE_PRESETS[saved]) return saved;
    }
    return 'iphone';
  });

  useEffect(() => {
    localStorage.setItem('quran_mobile_frame', String(isMobileFrameEnabled));
  }, [isMobileFrameEnabled]);

  useEffect(() => {
    localStorage.setItem('quran_mobile_preset', mobilePreset);
  }, [mobilePreset]);

  // Core Quran Player Hook
  const {
    settings,
    currentSurahNumber,
    currentAyahIndex,
    currentAyah,
    surahData,
    isLoadingSurah,
    surahError,
    isPlaying,
    currentTime,
    duration,
    audioProgress,
    isLoadingAudio,
    audioError,
    toastMessage,
    sleepTimerRemaining,
    repeatCount,
    selectedQari,
    isPlayingBasmalah,
    isCurrentSurahDownloaded,
    isDownloading,
    downloadProgress,
    downloadRegistry,
    downloadCurrentSurah,
    deleteCurrentSurah,
    clearAllDownloads,
    play,
    pause,
    togglePlay,
    nextAyah,
    prevAyah,
    seek,
    jumpToSurahAndAyah,
    setQari,
    setPlaybackSpeed,
    setRepeatMode,
    setEndOfSurahMode,
    toggleTranslation,
    setTheme,
    setPlayBasmalahOpening,
    setKeepScreenAwake,
    setSleepTimer,
    setToastMessage,
    retryAudio,
  } = useQuranPlayer();

  const themeConfig = THEMES[settings.theme] || THEMES['midnight-emerald'];

  // Update document theme-color meta tag dynamically
  useEffect(() => {
    const metaTag = document.getElementById('meta-theme-color');
    if (metaTag) {
      metaTag.setAttribute('content', themeConfig.metaThemeColor);
    }
  }, [themeConfig.metaThemeColor]);

  // Handle start from Splash Screen (user gesture allows audio autoplay)
  const handleStartFromSplash = () => {
    setHasStarted(true);
    play();
  };

  // Toggle between regular dock and minimized slim mode with creator credit & portfolio link
  const handleToggleImmersive = () => {
    setIsControlsMinimized(prev => !prev);
  };

  // Cycle repeat modes: off -> 2x -> 3x -> infinite -> off
  const handleCycleRepeat = () => {
    const modes: Array<typeof settings.repeatMode> = ['off', '2x', '3x', 'infinite'];
    const currIdx = modes.indexOf(settings.repeatMode);
    const nextMode = modes[(currIdx + 1) % modes.length];
    setRepeatMode(nextMode);
  };

  // Cycle playback speed: 1x -> 1.25x -> 1.5x -> 0.75x -> 1x
  const handleCycleSpeed = () => {
    const speeds = [1.0, 1.25, 1.5, 0.75];
    const currIdx = speeds.indexOf(settings.playbackSpeed);
    const nextSpeed = speeds[(currIdx + 1) % speeds.length];
    setPlaybackSpeed(nextSpeed);
  };

  return (
    <div className="w-full h-full min-h-[100dvh] max-h-[100dvh] bg-stone-950 text-white flex justify-center items-center overflow-hidden select-none relative">
      {/* Floating Desktop Quick Mobile Toolbar */}
      <div className="hidden md:flex fixed top-4 right-4 z-40 items-center gap-2 bg-stone-900/90 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-2xl shadow-2xl select-none">
        <button
          onClick={() => setIsMobileViewModalOpen(true)}
          className="flex items-center gap-2 text-stone-200 hover:text-amber-300 transition text-xs font-ui font-semibold"
          title="Pengaturan Versi Mobile & Buka di HP via QR Code"
        >
          <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center border border-amber-400/30">
            <Smartphone className="w-3.5 h-3.5" />
          </div>
          <span>Versi Mobile</span>
          <span className="text-[10px] text-stone-400 font-mono px-1.5 py-0.5 rounded-md bg-white/5 border border-white/10">
            {MOBILE_PRESETS[mobilePreset].name.split(' ')[0]}
          </span>
        </button>
        <div className="w-px h-4 bg-white/10" />
        <button
          onClick={() => setIsMobileFrameEnabled(prev => !prev)}
          className={`px-2 py-1 rounded-lg text-[11px] font-ui transition ${
            isMobileFrameEnabled
              ? 'bg-amber-500 text-stone-950 font-bold'
              : 'text-stone-400 hover:text-stone-200 bg-white/5'
          }`}
          title="Nyalakan/Matikan Bingkai Smartphone di Layar Komputer"
        >
          {isMobileFrameEnabled ? 'Bingkai HP ON' : 'Tanpa Bingkai'}
        </button>
      </div>

      {/* Ambient Desktop Backdrop Glow when Mobile Frame is active */}
      {isMobileFrameEnabled && (
        <div className="hidden md:block absolute inset-0 pointer-events-none opacity-40 blur-2xl scale-105 overflow-hidden">
          <IslamicBackground
            theme={settings.theme}
            surahNumber={currentSurahNumber}
            totalAyahs={surahData?.numberOfAyahs}
          />
        </div>
      )}

      {/* Responsive Container & Smartphone Chassis */}
      <PhoneChassis frameEnabled={isMobileFrameEnabled} preset={mobilePreset}>
        {/* Animated Islamic Ambient Background (Cross-Fades every 30s with Surah Theme Adaptation & Long Surah Stock) */}
        <IslamicBackground
          theme={settings.theme}
          surahNumber={currentSurahNumber}
          totalAyahs={surahData?.numberOfAyahs}
        />

        {/* Splash Screen on First Interaction */}
        {!hasStarted ? (
          <SplashScreen
            onStart={handleStartFromSplash}
            surahName={surahData?.indonesianName || 'Al-Fatihah'}
            ayahNumber={currentAyah?.numberInSurah || 1}
            qariName={selectedQari.name}
            theme={settings.theme}
          />
        ) : (
          <>
            {/* Top Bar */}
            <TopBar
              surahName={surahData?.indonesianName || 'Al-Fatihah'}
              ayahNumber={currentAyah?.numberInSurah || 1}
              totalAyahs={surahData?.numberOfAyahs || 7}
              revelationType={surahData?.revelationType || 'Meccan'}
              theme={settings.theme}
              isVisible={isImmersiveControlsVisible}
              isDownloaded={isCurrentSurahDownloaded}
              isDownloading={isDownloading}
              downloadPercent={downloadProgress?.percent}
              onDownloadSurah={downloadCurrentSurah}
              onOpenSurahSheet={() => setIsSurahSheetOpen(true)}
              onOpenQariSheet={() => setIsQariSheetOpen(true)}
              onOpenSettingsSheet={() => setIsSettingsSheetOpen(true)}
              onOpenAboutSheet={() => setIsAboutSheetOpen(true)}
              onOpenMobileViewModal={() => setIsMobileViewModalOpen(true)}
            />

            {/* Central Verse Text Area (FitText with Binary Search Font Fitting) */}
            <main className="flex-1 min-h-0 w-full relative flex items-center justify-center overflow-hidden">
              {isLoadingSurah ? (
                <div className="flex flex-col items-center gap-3 text-stone-400 animate-pulse">
                  <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
                  <span className="font-ui text-xs">Memuat teks ayat...</span>
                </div>
              ) : surahError ? (
                <div className="p-6 text-center max-w-xs">
                  <p className="font-ui text-xs text-rose-300 mb-3">{surahError}</p>
                  <button
                    onClick={() => jumpToSurahAndAyah(currentSurahNumber, 1)}
                    className="px-4 py-2 rounded-xl bg-amber-500 text-stone-950 font-ui font-semibold text-xs active:scale-95 transition"
                  >
                    Muat Ulang
                  </button>
                </div>
              ) : currentAyah ? (
                <FitText
                  key={`${currentSurahNumber}-${currentAyah.numberInSurah}`}
                  ayah={currentAyah}
                  surahNumber={currentSurahNumber}
                  totalAyahs={surahData?.numberOfAyahs || 1}
                  showTranslation={settings.showTranslation}
                  hasBasmalahHeader={surahData?.hasBasmalahHeader}
                  basmalahText={surahData?.basmalahText}
                  theme={settings.theme}
                  audioProgress={audioProgress}
                  isPlaying={isPlaying}
                  isPlayingBasmalah={isPlayingBasmalah}
                  onTap={handleToggleImmersive}
                  onSwipeLeft={nextAyah}
                  onSwipeRight={prevAyah}
                />
              ) : null}
            </main>

            {/* Player Dock (Bottom Controls) */}
            <PlayerDock
              isPlaying={isPlaying}
              isPlayingBasmalah={isPlayingBasmalah}
              isLoadingAudio={isLoadingAudio}
              currentTime={currentTime}
              duration={duration}
              audioProgress={audioProgress}
              currentAyahNumber={currentAyah?.numberInSurah || 1}
              totalAyahs={surahData?.numberOfAyahs || 7}
              qariName={selectedQari.name}
              playbackSpeed={settings.playbackSpeed}
              repeatMode={settings.repeatMode}
              repeatCount={repeatCount}
              showTranslation={settings.showTranslation}
              sleepTimerRemaining={sleepTimerRemaining}
              theme={settings.theme}
              isVisible={isImmersiveControlsVisible}
              isMinimized={isControlsMinimized}
              onToggleMinimize={() => setIsControlsMinimized(prev => !prev)}
              onTogglePlay={togglePlay}
              onPrevAyah={prevAyah}
              onNextAyah={nextAyah}
              onSeek={seek}
              onCycleRepeat={handleCycleRepeat}
              onCycleSpeed={handleCycleSpeed}
              onToggleTranslation={toggleTranslation}
              onOpenQariSheet={() => setIsQariSheetOpen(true)}
              onOpenSettingsSheet={() => setIsSettingsSheetOpen(true)}
            />

            {/* Sheets & Drawers */}
            <SurahSheet
              isOpen={isSurahSheetOpen}
              currentSurahNumber={currentSurahNumber}
              currentAyahNumber={currentAyah?.numberInSurah || 1}
              theme={settings.theme}
              selectedQariId={settings.selectedQariId}
              downloadRegistry={downloadRegistry}
              onClose={() => setIsSurahSheetOpen(false)}
              onSelectSurah={(surahNum, ayahNum) => {
                jumpToSurahAndAyah(surahNum, ayahNum || 1);
              }}
            />

            <QariSheet
              isOpen={isQariSheetOpen}
              selectedQariId={settings.selectedQariId}
              theme={settings.theme}
              onClose={() => setIsQariSheetOpen(false)}
              onSelectQari={qariId => setQari(qariId)}
            />

            <SettingsSheet
              isOpen={isSettingsSheetOpen}
              settings={settings}
              sleepTimerRemaining={sleepTimerRemaining}
              surahName={surahData?.indonesianName || 'Al-Fatihah'}
              totalAyahs={surahData?.numberOfAyahs || 7}
              isCurrentSurahDownloaded={isCurrentSurahDownloaded}
              isDownloading={isDownloading}
              downloadPercent={downloadProgress?.percent}
              downloadRegistry={downloadRegistry}
              onClose={() => setIsSettingsSheetOpen(false)}
              onUpdateTheme={setTheme}
              onUpdateSpeed={setPlaybackSpeed}
              onUpdateRepeat={setRepeatMode}
              onUpdateEndOfSurah={setEndOfSurahMode}
              onToggleBasmalahAudio={setPlayBasmalahOpening}
              onToggleWakeLock={setKeepScreenAwake}
              onSetSleepTimer={setSleepTimer}
              onDownloadSurah={downloadCurrentSurah}
              onDeleteSurahDownload={deleteCurrentSurah}
              onClearAllDownloads={clearAllDownloads}
              onOpenMobileViewModal={() => setIsMobileViewModalOpen(true)}
            />

            <AboutSheet
              isOpen={isAboutSheetOpen}
              theme={settings.theme}
              currentQariName={selectedQari.name}
              onClose={() => setIsAboutSheetOpen(false)}
            />

            {/* Mobile Version & Device Preset Modal */}
            <MobileViewModal
              isOpen={isMobileViewModalOpen}
              theme={settings.theme}
              frameEnabled={isMobileFrameEnabled}
              selectedPreset={mobilePreset}
              onClose={() => setIsMobileViewModalOpen(false)}
              onToggleFrame={setIsMobileFrameEnabled}
              onSelectPreset={setMobilePreset}
            />

            {/* Toast Notifications & Error Handling */}
            <Toast
              message={audioError || toastMessage}
              onClose={() => setToastMessage(null)}
              onRetry={audioError ? retryAudio : undefined}
            />
          </>
        )}
      </PhoneChassis>
    </div>
  );
}
