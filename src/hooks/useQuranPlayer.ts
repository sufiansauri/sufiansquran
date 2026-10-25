import { useState, useEffect, useRef, useCallback } from 'react';
import { Ayah, EndOfSurahMode, PlayerSettings, Qari, RepeatMode, SurahData, ThemeType } from '../types/quran';
import { DEFAULT_QARI, getAudioUrl, getBasmalahAudioUrl, QARI_LIST } from '../config/qari';
import { fetchSurah } from '../services/quranApi';
import { SURAH_LIST } from '../config/surahs';
import {
  isSurahDownloaded,
  getCachedOrRemoteAudioUrl,
  downloadSurahAudio,
  deleteSurahAudio,
  clearAllAudioCache,
  getDownloadedSurahsRegistry,
  DownloadProgress,
} from '../services/audioCacheService';

const STORAGE_KEY_SETTINGS = 'murottal_settings_v1';
const STORAGE_KEY_POSITION = 'murottal_position_v1';

const DEFAULT_SETTINGS: PlayerSettings = {
  selectedQariId: DEFAULT_QARI.id,
  playbackSpeed: 1,
  repeatMode: 'off',
  endOfSurahMode: 'next',
  showTranslation: true,
  playBasmalahOpening: true,
  theme: 'midnight-emerald',
  keepScreenAwake: true,
};

export function useQuranPlayer() {
  // 1. Settings & Position from LocalStorage
  const [settings, setSettings] = useState<PlayerSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (saved) return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    } catch (e) {}
    return DEFAULT_SETTINGS;
  });

  const [currentSurahNumber, setCurrentSurahNumber] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_POSITION);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.surah && parsed.surah >= 1 && parsed.surah <= 114) {
          return parsed.surah;
        }
      }
    } catch (e) {}
    return 1;
  });

  const [currentAyahIndex, setCurrentAyahIndex] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_POSITION);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.ayahIndex === 'number' && parsed.ayahIndex >= 0) {
          return parsed.ayahIndex;
        }
      }
    } catch (e) {}
    return 0;
  });

  // 2. Playback and Data States
  const [surahData, setSurahData] = useState<SurahData | null>(null);
  const [isLoadingSurah, setIsLoadingSurah] = useState<boolean>(true);
  const [surahError, setSurahError] = useState<string | null>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [isLoadingAudio, setIsLoadingAudio] = useState<boolean>(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [sleepTimerRemaining, setSleepTimerRemaining] = useState<number | null>(null);
  const [repeatCount, setRepeatCount] = useState<number>(0);

  // Offline Download States
  const [isCurrentSurahDownloaded, setIsCurrentSurahDownloaded] = useState<boolean>(false);
  const [downloadProgress, setDownloadProgress] = useState<DownloadProgress | null>(null);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [downloadRegistry, setDownloadRegistry] = useState(getDownloadedSurahsRegistry());

  // Basmalah Opening State
  const [isPlayingBasmalah, setIsPlayingBasmalah] = useState<boolean>(false);

  // 3. Audio & Player Engine Refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const preloadAudioRef = useRef<HTMLAudioElement | null>(null);
  const wakeLockRef = useRef<any>(null);
  const sleepTimerRef = useRef<any>(null);
  const isPlayingRef = useRef<boolean>(false);
  const isPlayingBasmalahRef = useRef<boolean>(false);
  const isTransitioningRef = useRef<boolean>(false);
  const usingFallbackRef = useRef<boolean>(false);

  // Selected Qari
  const selectedQari = QARI_LIST.find(q => q.id === settings.selectedQariId) || DEFAULT_QARI;

  // Persist settings
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
    } catch (e) {}
  }, [settings]);

  // Persist position
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY_POSITION,
        JSON.stringify({ surah: currentSurahNumber, ayahIndex: currentAyahIndex })
      );
    } catch (e) {}
  }, [currentSurahNumber, currentAyahIndex]);

  // Keep latest state in a Ref to avoid stale closures in stable audio event listeners
  const stateRef = useRef({
    currentSurahNumber,
    currentAyahIndex,
    surahData,
    settings,
    repeatCount,
    selectedQari,
    isPlaying: false,
    isPlayingBasmalah: false,
  });

  useEffect(() => {
    stateRef.current = {
      currentSurahNumber,
      currentAyahIndex,
      surahData,
      settings,
      repeatCount,
      selectedQari,
      isPlaying,
      isPlayingBasmalah,
    };
  }, [currentSurahNumber, currentAyahIndex, surahData, settings, repeatCount, selectedQari, isPlaying, isPlayingBasmalah]);

  // Current ayah object
  const currentAyah: Ayah | null =
    surahData && surahData.ayahs && surahData.ayahs[currentAyahIndex]
      ? surahData.ayahs[currentAyahIndex]
      : null;

  // Preload next ayah audio
  const preloadNextAyah = useCallback((surahNum: number, ayahIdx: number) => {
    const sData = stateRef.current.surahData;
    if (!sData || !sData.ayahs) return;
    if (ayahIdx < sData.ayahs.length) {
      const nextAyahObj = sData.ayahs[ayahIdx];
      const nextUrl = getAudioUrl(stateRef.current.selectedQari, surahNum, nextAyahObj.numberInSurah);
      if (!preloadAudioRef.current) {
        preloadAudioRef.current = new Audio();
      }
      preloadAudioRef.current.src = nextUrl;
      preloadAudioRef.current.preload = 'auto';
    }
  }, []);

  // Directly play a given ayah index (core execution function)
  const playAyahDirect = useCallback(
    async (surahNum: number, ayahIdx: number, shouldPlay: boolean, targetSurahData?: SurahData) => {
      const audio = audioRef.current;
      const data = targetSurahData || stateRef.current.surahData;
      if (!audio || !data || !data.ayahs || data.ayahs.length === 0) return;

      const targetAyah = data.ayahs[ayahIdx] || data.ayahs[0];
      if (!targetAyah) return;

      isTransitioningRef.current = true;
      setAudioError(null);
      setIsLoadingAudio(true);
      usingFallbackRef.current = false;

      const qari = stateRef.current.selectedQari;
      const audioUrl = await getCachedOrRemoteAudioUrl(qari, surahNum, targetAyah.numberInSurah);

      audio.src = audioUrl;
      audio.playbackRate = stateRef.current.settings.playbackSpeed;

      // Handle audio errors with automatic fallback
      audio.onerror = () => {
        if (!usingFallbackRef.current && qari.fallbackFolder) {
          usingFallbackRef.current = true;
          const fallbackUrl = getAudioUrl(qari, surahNum, targetAyah.numberInSurah, true);
          audio.src = fallbackUrl;
          if (shouldPlay && isPlayingRef.current) {
            audio.play().catch(e => {
              console.warn('Fallback audio failed:', e);
              setAudioError(`Audio tidak dapat diputar (${qari.name}).`);
              setIsPlaying(false);
              isPlayingRef.current = false;
              setIsLoadingAudio(false);
            });
          }
        } else {
          setAudioError(`Gagal memuat audio ayat ${targetAyah.numberInSurah}`);
          setToastMessage(`Audio ${qari.name} ayat ${targetAyah.numberInSurah} tidak tersedia.`);
          setIsPlaying(false);
          isPlayingRef.current = false;
          setIsLoadingAudio(false);
        }
      };

      if (shouldPlay) {
        isPlayingRef.current = true;
        try {
          await audio.play();
          setIsPlaying(true);
          // Preload upcoming ayah
          preloadNextAyah(surahNum, ayahIdx + 1);
        } catch (playErr) {
          console.warn('Audio play request failed or interrupted:', playErr);
          setIsPlaying(false);
          isPlayingRef.current = false;
        } finally {
          setIsLoadingAudio(false);
          isTransitioningRef.current = false;
        }
      } else {
        setIsLoadingAudio(false);
        isTransitioningRef.current = false;
      }
    },
    [preloadNextAyah]
  );

  // Play opening Basmalah audio (Surah 1 Ayah 1 of chosen Qari) before Ayah 1 of surahs 2-114 (except 9)
  const playBasmalahOpening = useCallback(
    async (surahNum: number, shouldPlay: boolean, targetSurahData?: SurahData) => {
      const audio = audioRef.current;
      if (!audio) return;

      isPlayingBasmalahRef.current = true;
      setIsPlayingBasmalah(true);
      isTransitioningRef.current = true;
      setAudioError(null);
      setIsLoadingAudio(true);
      usingFallbackRef.current = false;

      const qari = stateRef.current.selectedQari;
      const basmalahUrl = await getCachedOrRemoteAudioUrl(qari, 1, 1);

      audio.src = basmalahUrl;
      audio.playbackRate = stateRef.current.settings.playbackSpeed;

      audio.onerror = () => {
        console.warn('Basmalah audio error, proceeding directly to Ayah 1');
        isPlayingBasmalahRef.current = false;
        setIsPlayingBasmalah(false);
        playAyahDirect(surahNum, 0, shouldPlay, targetSurahData);
      };

      if (shouldPlay) {
        isPlayingRef.current = true;
        try {
          await audio.play();
          setIsPlaying(true);
        } catch (playErr) {
          console.warn('Basmalah play request interrupted:', playErr);
          setIsPlaying(false);
          isPlayingRef.current = false;
          isPlayingBasmalahRef.current = false;
          setIsPlayingBasmalah(false);
        } finally {
          setIsLoadingAudio(false);
          isTransitioningRef.current = false;
        }
      } else {
        setIsLoadingAudio(false);
        isTransitioningRef.current = false;
      }
    },
    [playAyahDirect]
  );

  // Load a surah and optionally start playing immediately
  const loadAndPlaySurah = useCallback(
    async (surahNum: number, startAyahIdx = 0, autoPlay = false) => {
      setIsLoadingSurah(true);
      setSurahError(null);
      try {
        const data = await fetchSurah(surahNum);
        setSurahData(data);
        setCurrentSurahNumber(surahNum);
        const validIdx = Math.max(0, Math.min(startAyahIdx, data.ayahs.length - 1));
        setCurrentAyahIndex(validIdx);

        // Surah 1 (Al-Fatihah) has verse 1 as Basmalah itself.
        // Surah 9 (At-Taubah) has NO Basmalah in Islamic revelation.
        // All other surahs (2-114 except 9) recite opening Basmalah before verse 1.
        const shouldPlayBasmalah =
          validIdx === 0 &&
          surahNum !== 1 &&
          surahNum !== 9 &&
          stateRef.current.settings.playBasmalahOpening;

        if (shouldPlayBasmalah) {
          playBasmalahOpening(surahNum, autoPlay, data);
        } else {
          isPlayingBasmalahRef.current = false;
          setIsPlayingBasmalah(false);
          playAyahDirect(surahNum, validIdx, autoPlay, data);
        }
      } catch (err: any) {
        setSurahError(err.message || 'Gagal memuat surah.');
        setToastMessage('Gagal memuat teks surah. Periksa koneksi.');
      } finally {
        setIsLoadingSurah(false);
      }
    },
    [playAyahDirect, playBasmalahOpening]
  );

  // End of Surah Handler (advances to next surah, repeats, or stops)
  const handleEndOfSurah = useCallback(
    (autoPlay = true) => {
      const { settings: currentSettings, currentSurahNumber: curSurah, surahData: curData } = stateRef.current;

      if (currentSettings.endOfSurahMode === 'stop') {
        if (audioRef.current) audioRef.current.pause();
        isPlayingRef.current = false;
        setIsPlaying(false);
        isPlayingBasmalahRef.current = false;
        setIsPlayingBasmalah(false);
        setToastMessage('Surah selesai dibacakan.');
        return;
      }

      if (currentSettings.endOfSurahMode === 'repeat') {
        setCurrentAyahIndex(0);
        setRepeatCount(0);
        setToastMessage(`Mengulang Surah ${curData?.indonesianName}`);
        if (curSurah !== 1 && curSurah !== 9 && currentSettings.playBasmalahOpening) {
          playBasmalahOpening(curSurah, autoPlay);
        } else {
          isPlayingBasmalahRef.current = false;
          setIsPlayingBasmalah(false);
          playAyahDirect(curSurah, 0, autoPlay);
        }
        return;
      }

      if (currentSettings.endOfSurahMode === 'next') {
        const nextSurah = curSurah < 114 ? curSurah + 1 : 1;
        const nextMeta = SURAH_LIST[nextSurah - 1];
        setToastMessage(`Lanjut ke Surah ${nextMeta?.indonesianName}`);
        setRepeatCount(0);
        loadAndPlaySurah(nextSurah, 0, autoPlay);
      }
    },
    [playAyahDirect, playBasmalahOpening, loadAndPlaySurah]
  );

  // Audio `ended` event handler: synchronous next ayah trigger (Crucial for mobile background autoplay)
  const handleAudioEnded = useCallback(() => {
    // 0. If current audio was the opening Basmalah, immediately start Ayah 1 of the new surah
    if (isPlayingBasmalahRef.current) {
      isPlayingBasmalahRef.current = false;
      setIsPlayingBasmalah(false);
      const { currentSurahNumber: curSurah } = stateRef.current;
      playAyahDirect(curSurah, 0, true);
      return;
    }

    const { settings: curSettings, repeatCount: curRepeat, currentSurahNumber: curSurah, currentAyahIndex: curIdx, surahData: curData } = stateRef.current;

    // 1. Check Repeat Mode (Tahfidz memorization)
    if (curSettings.repeatMode === '2x' && curRepeat < 1) {
      setRepeatCount(prev => prev + 1);
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(e => console.warn(e));
      }
      return;
    }
    if (curSettings.repeatMode === '3x' && curRepeat < 2) {
      setRepeatCount(prev => prev + 1);
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(e => console.warn(e));
      }
      return;
    }
    if (curSettings.repeatMode === 'infinite') {
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(e => console.warn(e));
      }
      return;
    }

    // Reset repeat counter
    setRepeatCount(0);

    // 2. Advance to next ayah in surah
    if (curData && curIdx < curData.ayahs.length - 1) {
      const nextIndex = curIdx + 1;
      setCurrentAyahIndex(nextIndex);
      // Synchronously play next ayah within audio ended event loop
      playAyahDirect(curSurah, nextIndex, true);
    } else {
      // Reached the end of the surah
      handleEndOfSurah(true);
    }
  }, [playAyahDirect, handleEndOfSurah]);

  // Initialize Audio element with single permanent listener lifecycle
  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    const onPlay = () => {
      setIsPlaying(true);
      isPlayingRef.current = true;
    };

    const onPause = () => {
      // Only set isPlaying(false) if user truly paused, NOT during internal track transition
      if (!isTransitioningRef.current) {
        setIsPlaying(false);
        isPlayingRef.current = false;
      }
    };

    const onWaiting = () => setIsLoadingAudio(true);
    const onCanPlay = () => setIsLoadingAudio(false);

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const onLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    const onEnded = () => {
      handleAudioEnded();
    };

    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('waiting', onWaiting);
    audio.addEventListener('canplay', onCanPlay);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.pause();
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('waiting', onWaiting);
      audio.removeEventListener('canplay', onCanPlay);
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
      audioRef.current = null;
    };
  }, [handleAudioEnded]);

  // Initial load of surah text on mount or surah change
  useEffect(() => {
    if (!surahData || surahData.number !== currentSurahNumber) {
      loadAndPlaySurah(currentSurahNumber, currentAyahIndex, isPlayingRef.current);
    }
  }, [currentSurahNumber]);

  // Sync playback speed whenever setting changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = settings.playbackSpeed;
    }
  }, [settings.playbackSpeed]);

  // Screen Wake Lock API
  useEffect(() => {
    const requestWakeLock = async () => {
      if ('wakeLock' in navigator && settings.keepScreenAwake && isPlaying) {
        try {
          if (!wakeLockRef.current) {
            wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
          }
        } catch (err) {
          console.warn('Wake Lock request failed:', err);
        }
      }
    };

    const releaseWakeLock = () => {
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {});
        wakeLockRef.current = null;
      }
    };

    if (isPlaying && settings.keepScreenAwake) {
      requestWakeLock();
    } else {
      releaseWakeLock();
    }

    return () => {
      releaseWakeLock();
    };
  }, [isPlaying, settings.keepScreenAwake]);

  // Sleep Timer countdown
  useEffect(() => {
    if (sleepTimerRemaining === null) {
      if (sleepTimerRef.current) clearInterval(sleepTimerRef.current);
      return;
    }

    if (sleepTimerRemaining <= 0) {
      if (audioRef.current) audioRef.current.pause();
      isPlayingRef.current = false;
      setIsPlaying(false);
      setSleepTimerRemaining(null);
      setToastMessage('Sleep timer selesai. Murottal dihentikan.');
      return;
    }

    sleepTimerRef.current = setInterval(() => {
      setSleepTimerRemaining(prev => (prev !== null && prev > 0 ? prev - 1 : null));
    }, 1000);

    return () => {
      if (sleepTimerRef.current) clearInterval(sleepTimerRef.current);
    };
  }, [sleepTimerRemaining]);

  // Media Session API
  useEffect(() => {
    if ('mediaSession' in navigator && surahData && currentAyah) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: isPlayingBasmalah
          ? `Basmalah • Pembuka QS. ${surahData.indonesianName}`
          : `QS. ${surahData.indonesianName} : Ayat ${currentAyah.numberInSurah}`,
        artist: `${selectedQari.name} (${selectedQari.bitrate})`,
        album: "Al-Qur'an Al-Karim Murottal",
        artwork: [{ src: '/icon.svg', sizes: '512x512', type: 'image/svg+xml' }],
      });

      navigator.mediaSession.setActionHandler('play', () => {
        play();
      });
      navigator.mediaSession.setActionHandler('pause', () => {
        pause();
      });
      navigator.mediaSession.setActionHandler('previoustrack', () => {
        prevAyah();
      });
      navigator.mediaSession.setActionHandler('nexttrack', () => {
        nextAyah();
      });
      navigator.mediaSession.setActionHandler('seekto', details => {
        if (details.seekTime !== undefined && audioRef.current) {
          audioRef.current.currentTime = details.seekTime;
        }
      });
    }
  }, [surahData, currentAyah, selectedQari, isPlayingBasmalah]);

  // Public Controls
  const play = async () => {
    isPlayingRef.current = true;
    if (!audioRef.current) return;

    // If currently reciting Basmalah
    if (isPlayingBasmalahRef.current) {
      try {
        await audioRef.current.play();
        setIsPlaying(true);
        return;
      } catch (e) {
        // Fallback
      }
    }

    // If at Ayah 1 of surahs 2-114 (except 9), play opening Basmalah first if enabled
    if (
      currentAyahIndex === 0 &&
      currentSurahNumber !== 1 &&
      currentSurahNumber !== 9 &&
      settings.playBasmalahOpening &&
      (!audioRef.current.src || audioRef.current.ended)
    ) {
      playBasmalahOpening(currentSurahNumber, true);
      return;
    }

    // If audio has no src or is at the end, load current ayah
    if (!audioRef.current.src || audioRef.current.ended) {
      playAyahDirect(currentSurahNumber, currentAyahIndex, true);
      return;
    }

    try {
      await audioRef.current.play();
      setIsPlaying(true);
    } catch (e) {
      // In case src expired or was cleared
      playAyahDirect(currentSurahNumber, currentAyahIndex, true);
    }
  };

  const pause = () => {
    isPlayingRef.current = false;
    isTransitioningRef.current = false;
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlaying(false);
  };

  const togglePlay = () => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };

  const nextAyah = () => {
    // If currently reciting Basmalah, skip directly into Ayah 1
    if (isPlayingBasmalahRef.current) {
      isPlayingBasmalahRef.current = false;
      setIsPlayingBasmalah(false);
      playAyahDirect(currentSurahNumber, 0, isPlayingRef.current);
      return;
    }

    const sData = stateRef.current.surahData;
    if (!sData || !sData.ayahs || sData.ayahs.length === 0) return;
    setRepeatCount(0);

    if (currentAyahIndex < sData.ayahs.length - 1) {
      const nextIdx = currentAyahIndex + 1;
      setCurrentAyahIndex(nextIdx);
      playAyahDirect(currentSurahNumber, nextIdx, isPlayingRef.current);
    } else {
      // Advance to next surah
      const nextSurah = currentSurahNumber < 114 ? currentSurahNumber + 1 : 1;
      loadAndPlaySurah(nextSurah, 0, isPlayingRef.current);
    }
  };

  const prevAyah = () => {
    // If during Basmalah, navigate back to previous surah
    if (isPlayingBasmalahRef.current) {
      isPlayingBasmalahRef.current = false;
      setIsPlayingBasmalah(false);
      if (currentSurahNumber > 1) {
        const prevSurah = currentSurahNumber - 1;
        const prevMeta = SURAH_LIST[prevSurah - 1];
        const lastAyahIdx = prevMeta ? prevMeta.numberOfAyahs - 1 : 0;
        loadAndPlaySurah(prevSurah, lastAyahIdx, isPlayingRef.current);
      }
      return;
    }

    const sData = stateRef.current.surahData;
    if (!sData || !sData.ayahs || sData.ayahs.length === 0) return;
    setRepeatCount(0);

    if (currentAyahIndex > 0) {
      const prevIdx = currentAyahIndex - 1;
      setCurrentAyahIndex(prevIdx);
      playAyahDirect(currentSurahNumber, prevIdx, isPlayingRef.current);
    } else {
      // Go to previous surah
      if (currentSurahNumber > 1) {
        const prevSurah = currentSurahNumber - 1;
        const prevMeta = SURAH_LIST[prevSurah - 1];
        const lastAyahIdx = prevMeta ? prevMeta.numberOfAyahs - 1 : 0;
        loadAndPlaySurah(prevSurah, lastAyahIdx, isPlayingRef.current);
      }
    }
  };

  const seek = (timeInSeconds: number) => {
    if (audioRef.current && !isNaN(timeInSeconds)) {
      audioRef.current.currentTime = timeInSeconds;
      setCurrentTime(timeInSeconds);
    }
  };

  const jumpToSurahAndAyah = (surahNum: number, ayahNum = 1) => {
    setRepeatCount(0);
    const targetSurah = Math.max(1, Math.min(114, surahNum));
    const targetAyahIndex = Math.max(0, ayahNum - 1);
    isPlayingRef.current = true;
    loadAndPlaySurah(targetSurah, targetAyahIndex, true);
  };

  const setQari = (qariId: string) => {
    setSettings(prev => ({ ...prev, selectedQariId: qariId }));
    // Immediately switch current audio to new qari
    setTimeout(() => {
      if (isPlayingBasmalahRef.current) {
        playBasmalahOpening(currentSurahNumber, isPlayingRef.current);
      } else {
        playAyahDirect(currentSurahNumber, currentAyahIndex, isPlayingRef.current);
      }
    }, 50);
  };

  const setPlaybackSpeed = (speed: number) => {
    setSettings(prev => ({ ...prev, playbackSpeed: speed }));
  };

  const setRepeatMode = (mode: RepeatMode) => {
    setSettings(prev => ({ ...prev, repeatMode: mode }));
    setRepeatCount(0);
  };

  const setEndOfSurahMode = (mode: EndOfSurahMode) => {
    setSettings(prev => ({ ...prev, endOfSurahMode: mode }));
  };

  const toggleTranslation = () => {
    setSettings(prev => ({ ...prev, showTranslation: !prev.showTranslation }));
  };

  const setTheme = (theme: ThemeType) => {
    setSettings(prev => ({ ...prev, theme }));
  };

  const setPlayBasmalahOpening = (val: boolean) => {
    setSettings(prev => ({ ...prev, playBasmalahOpening: val }));
  };

  const setKeepScreenAwake = (val: boolean) => {
    setSettings(prev => ({ ...prev, keepScreenAwake: val }));
  };

  const setSleepTimer = (minutes: number | null) => {
    if (minutes === null || minutes <= 0) {
      setSleepTimerRemaining(null);
      setToastMessage('Sleep timer dimatikan.');
    } else {
      setSleepTimerRemaining(minutes * 60);
      setToastMessage(`Sleep timer aktif: ${minutes} menit.`);
    }
  };

  // Check if current surah is downloaded offline
  const checkCurrentSurahDownloaded = useCallback(async () => {
    const downloaded = await isSurahDownloaded(currentSurahNumber, selectedQari);
    setIsCurrentSurahDownloaded(downloaded);
  }, [currentSurahNumber, selectedQari]);

  useEffect(() => {
    checkCurrentSurahDownloaded();
  }, [checkCurrentSurahDownloaded]);

  // Start downloading the whole current surah for the active Qari
  const downloadCurrentSurah = async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    setToastMessage(`Mendownload Surah ${surahData?.indonesianName || currentSurahNumber}...`);

    try {
      await downloadSurahAudio(currentSurahNumber, selectedQari, progress => {
        setDownloadProgress(progress);
      });
      setIsCurrentSurahDownloaded(true);
      setDownloadRegistry(getDownloadedSurahsRegistry());
      setToastMessage(`Alhamdulillah! Surah ${surahData?.indonesianName} tersimpan offline di perangkat.`);
    } catch (err: any) {
      console.error('Download surah failed:', err);
      setToastMessage(`Gagal mengunduh surah: ${err.message || 'Koneksi terputus'}`);
    } finally {
      setIsDownloading(false);
      setTimeout(() => setDownloadProgress(null), 3500);
    }
  };

  const deleteCurrentSurah = async () => {
    await deleteSurahAudio(currentSurahNumber, selectedQari);
    setIsCurrentSurahDownloaded(false);
    setDownloadRegistry(getDownloadedSurahsRegistry());
    setToastMessage(`Unduhan Surah ${surahData?.indonesianName} telah dihapus dari laptop/perangkat.`);
  };

  const clearAllDownloads = async () => {
    await clearAllAudioCache();
    setIsCurrentSurahDownloaded(false);
    setDownloadRegistry({});
    setToastMessage('Semua audio unduhan offline telah dibersihkan.');
  };

  const retryAudio = () => {
    playAyahDirect(currentSurahNumber, currentAyahIndex, true);
  };

  const audioProgress = duration > 0 ? Math.min(1, Math.max(0, currentTime / duration)) : 0;

  return {
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

    // Offline Download Features
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
  };
}
