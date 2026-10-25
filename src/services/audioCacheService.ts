import { Qari, SurahMeta } from '../types/quran';
import { getAudioUrl } from '../config/qari';
import { getSurahMeta } from '../config/surahs';
import { getBackgroundsForSurah } from '../config/backgrounds';

const AUDIO_CACHE_NAME = 'murottal_audio_v1';
const METADATA_KEY = 'murottal_downloaded_surahs_v1';

export interface DownloadProgress {
  surahNumber: number;
  qariId: string;
  downloadedAyahs: number;
  totalAyahs: number;
  percent: number;
  isCompleted: boolean;
  isError: boolean;
  errorMessage?: string;
}

/**
 * Check if CacheStorage API is available in current browser
 */
function isCacheAvailable(): boolean {
  return typeof window !== 'undefined' && 'caches' in window;
}

/**
 * Get the list of downloaded surahs from LocalStorage tracking
 */
export function getDownloadedSurahsRegistry(): Record<string, { surahNumber: number; qariId: string; totalAyahs: number; timestamp: number }> {
  try {
    const raw = localStorage.getItem(METADATA_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

function saveDownloadedSurahsRegistry(registry: Record<string, any>) {
  try {
    localStorage.setItem(METADATA_KEY, JSON.stringify(registry));
  } catch (e) {}
}

/**
 * Unique key for surah + qari download
 */
function getSurahQariKey(surahNumber: number, qariId: string): string {
  return `${surahNumber}_${qariId}`;
}

/**
 * Check if a specific Surah is completely downloaded for a given Qari
 */
export async function isSurahDownloaded(surahNumber: number, qari: Qari): Promise<boolean> {
  const meta = getSurahMeta(surahNumber);
  const total = meta.numberOfAyahs;
  const key = getSurahQariKey(surahNumber, qari.id);
  const registry = getDownloadedSurahsRegistry();

  if (registry[key] && registry[key].totalAyahs === total) {
    return true;
  }

  if (!isCacheAvailable()) return false;

  try {
    const cache = await caches.open(AUDIO_CACHE_NAME);
    // Check first and last ayah to verify cache presence
    const firstUrl = getAudioUrl(qari, surahNumber, 1);
    const lastUrl = getAudioUrl(qari, surahNumber, total);

    const [hasFirst, hasLast] = await Promise.all([
      cache.match(firstUrl),
      cache.match(lastUrl),
    ]);

    return Boolean(hasFirst && hasLast);
  } catch (e) {
    return false;
  }
}

/**
 * Retrieve cached audio URL for an ayah if it exists in local CacheStorage.
 * Returns either a local object URL (instant, no network) or the original remote URL.
 */
export async function getCachedOrRemoteAudioUrl(qari: Qari, surahNumber: number, ayahNumber: number): Promise<string> {
  const remoteUrl = getAudioUrl(qari, surahNumber, ayahNumber);
  if (!isCacheAvailable()) return remoteUrl;

  try {
    const cache = await caches.open(AUDIO_CACHE_NAME);
    const matched = await cache.match(remoteUrl);
    if (matched) {
      const blob = await matched.blob();
      if (blob && blob.size > 0) {
        return URL.createObjectURL(blob);
      }
    }
  } catch (err) {
    console.warn('Cache lookup failed, falling back to remote URL:', err);
  }

  return remoteUrl;
}

/**
 * Download all verses of a Surah into browser local cache
 */
export async function downloadSurahAudio(
  surahNumber: number,
  qari: Qari,
  onProgress?: (progress: DownloadProgress) => void
): Promise<void> {
  if (!isCacheAvailable()) {
    throw new Error('Browser ini tidak mendukung Cache Storage offline.');
  }

  const meta = getSurahMeta(surahNumber);
  const total = meta.numberOfAyahs;
  const cache = await caches.open(AUDIO_CACHE_NAME);

  let completed = 0;

  for (let ayah = 1; ayah <= total; ayah++) {
    const url = getAudioUrl(qari, surahNumber, ayah);

    // Check if already in cache
    const existing = await cache.match(url);
    if (!existing) {
      try {
        const response = await fetch(url, {
          mode: 'cors',
          cache: 'reload',
        });

        if (!response.ok) {
          throw new Error(`Gagal mendownload ayat ${ayah} (HTTP ${response.status})`);
        }

        // Store clone in cache
        await cache.put(url, response.clone());
      } catch (err: any) {
        // Try fallback if available
        if (qari.fallbackFolder) {
          const fallbackUrl = getAudioUrl(qari, surahNumber, ayah, true);
          const fbResponse = await fetch(fallbackUrl, { mode: 'cors' });
          if (fbResponse.ok) {
            await cache.put(url, fbResponse.clone());
          } else {
            throw new Error(`Ayat ${ayah} gagal diunduh: ${err.message || 'Koneksi terputus'}`);
          }
        } else {
          throw new Error(`Ayat ${ayah} gagal diunduh: ${err.message || 'Koneksi terputus'}`);
        }
      }
    }

    completed++;
    const percent = Math.round((completed / total) * 100);

    onProgress?.({
      surahNumber,
      qariId: qari.id,
      downloadedAyahs: completed,
      totalAyahs: total,
      percent,
      isCompleted: completed === total,
      isError: false,
    });
  }

  // Also cache opening Basmalah (Surah 1 Ayah 1) for this Qari if needed
  if (surahNumber !== 1 && surahNumber !== 9) {
    try {
      const basmalahUrl = getAudioUrl(qari, 1, 1);
      const hasBasmalah = await cache.match(basmalahUrl);
      if (!hasBasmalah) {
        const bRes = await fetch(basmalahUrl, { mode: 'cors' });
        if (bRes.ok) {
          await cache.put(basmalahUrl, bRes.clone());
        }
      }
    } catch (e) {
      console.warn('Could not pre-cache Basmalah audio:', e);
    }
  }

  // Pre-cache Islamic background wallpapers for this surah for offline viewing
  try {
    const backgrounds = getBackgroundsForSurah(surahNumber, total);
    for (const bg of backgrounds) {
      const hasBg = await cache.match(bg.src);
      if (!hasBg) {
        const bgRes = await fetch(bg.src);
        if (bgRes.ok) {
          await cache.put(bg.src, bgRes.clone());
        }
      }
    }
  } catch (e) {
    console.warn('Could not pre-cache background images:', e);
  }

  // Register in downloaded list
  const registry = getDownloadedSurahsRegistry();
  const key = getSurahQariKey(surahNumber, qari.id);
  registry[key] = {
    surahNumber,
    qariId: qari.id,
    totalAyahs: total,
    timestamp: Date.now(),
  };
  saveDownloadedSurahsRegistry(registry);
}

/**
 * Delete downloaded Surah from CacheStorage to free space
 */
export async function deleteSurahAudio(surahNumber: number, qari: Qari): Promise<void> {
  if (!isCacheAvailable()) return;

  const meta = getSurahMeta(surahNumber);
  const total = meta.numberOfAyahs;
  const cache = await caches.open(AUDIO_CACHE_NAME);

  for (let ayah = 1; ayah <= total; ayah++) {
    const url = getAudioUrl(qari, surahNumber, ayah);
    await cache.delete(url);
  }

  // Remove from registry
  const registry = getDownloadedSurahsRegistry();
  const key = getSurahQariKey(surahNumber, qari.id);
  delete registry[key];
  saveDownloadedSurahsRegistry(registry);
}

/**
 * Clear all downloaded audio
 */
export async function clearAllAudioCache(): Promise<void> {
  if (!isCacheAvailable()) return;
  await caches.delete(AUDIO_CACHE_NAME);
  localStorage.removeItem(METADATA_KEY);
}
