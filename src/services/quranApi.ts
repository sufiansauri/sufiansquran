import { Ayah, SurahData } from '../types/quran';
import { getSurahMeta } from '../config/surahs';

const CACHE_PREFIX = 'murottal_surah_v1_';

export const STANDARD_BASMALAH_ARABIC = 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ';

/**
 * Clean & separate Basmalah from Ayah 1 according to Islamic scripture rules:
 * - Surah 1 (Al-Fatihah): Ayah 1 is the Basmalah itself. Do NOT strip.
 * - Surah 9 (At-Taubah): Does NOT have Basmalah.
 * - Surah 2-114 (except 9): Strip the 4 Basmalah words from Ayah 1, and flag hasBasmalahHeader = true.
 */
function processBasmalah(surahNumber: number, ayahs: Ayah[]): { ayahs: Ayah[]; hasBasmalahHeader: boolean; basmalahText: string } {
  if (ayahs.length === 0) {
    return { ayahs, hasBasmalahHeader: false, basmalahText: STANDARD_BASMALAH_ARABIC };
  }

  // Surah 1: Ayah 1 is the Basmalah
  if (surahNumber === 1) {
    return { ayahs, hasBasmalahHeader: false, basmalahText: STANDARD_BASMALAH_ARABIC };
  }

  // Surah 9 (At-Taubah): No Basmalah
  if (surahNumber === 9) {
    return { ayahs, hasBasmalahHeader: false, basmalahText: '' };
  }

  // For Surah 2-114 (except 9)
  const firstAyah = ayahs[0];
  const words = firstAyah.text.trim().split(/\s+/);

  // Check if firstAyah starts with Bismillah (بِسْمِ)
  const isBismillahPrefixed = words.length >= 4 && words[0].includes('بِسْمِ');

  if (isBismillahPrefixed) {
    // The first 4 words are Bismillah: "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ"
    const cleanedArabic = words.slice(4).join(' ');
    
    // Also clean Indonesian translation if it has Basmalah prefixed
    let cleanedTranslation = firstAyah.translation.trim();
    const basmalahIdRegex = /^(Dengan nama Allah Yang Maha Pengasih|Dengan menyebut nama Allah|Dengan nama Allah, Maha Pengasih)[^.]*\.\s*/i;
    cleanedTranslation = cleanedTranslation.replace(basmalahIdRegex, '');

    const updatedAyahs = [
      {
        ...firstAyah,
        text: cleanedArabic.length > 0 ? cleanedArabic : firstAyah.text,
        translation: cleanedTranslation.length > 0 ? cleanedTranslation : firstAyah.translation,
      },
      ...ayahs.slice(1),
    ];

    return {
      ayahs: updatedAyahs,
      hasBasmalahHeader: true,
      basmalahText: STANDARD_BASMALAH_ARABIC,
    };
  }

  return {
    ayahs,
    hasBasmalahHeader: true,
    basmalahText: STANDARD_BASMALAH_ARABIC,
  };
}

/**
 * Fetch Surah with caching (LocalStorage + Memory)
 */
export async function fetchSurah(surahNumber: number): Promise<SurahData> {
  const meta = getSurahMeta(surahNumber);
  const cacheKey = `${CACHE_PREFIX}${surahNumber}`;

  // 1. Try reading from LocalStorage
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached) as SurahData;
      if (parsed && Array.isArray(parsed.ayahs) && parsed.ayahs.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Cache read error:', err);
  }

  // 2. Fetch from Primary Source: AlQuran Cloud API
  try {
    const url = `https://api.alquran.cloud/v1/surah/${surahNumber}/editions/quran-uthmani,id.indonesian`;
    const res = await fetch(url, { cache: 'force-cache' });
    
    if (res.ok) {
      const json = await res.json();
      if (json.code === 200 && Array.isArray(json.data) && json.data.length >= 2) {
        const arData = json.data[0];
        const idData = json.data[1];

        const rawAyahs: Ayah[] = arData.ayahs.map((a: any, idx: number) => {
          const idAyah = idData.ayahs[idx] || {};
          return {
            number: a.number,
            numberInSurah: a.numberInSurah,
            text: a.text,
            translation: idAyah.text || '',
            juz: a.juz,
            page: a.page,
          };
        });

        const { ayahs, hasBasmalahHeader, basmalahText } = processBasmalah(surahNumber, rawAyahs);

        const result: SurahData = {
          number: meta.number,
          name: arData.name || meta.name,
          englishName: meta.englishName,
          indonesianName: meta.indonesianName,
          translation: meta.translation,
          numberOfAyahs: meta.numberOfAyahs,
          revelationType: meta.revelationType,
          ayahs,
          hasBasmalahHeader,
          basmalahText,
        };

        // Cache in LocalStorage
        try {
          localStorage.setItem(cacheKey, JSON.stringify(result));
        } catch (e) {
          console.warn('Failed to cache surah:', e);
        }

        return result;
      }
    }
  } catch (primaryErr) {
    console.warn('Primary AlQuran Cloud fetch failed, trying fallback EQuran.id:', primaryErr);
  }

  // 3. Fallback Source: EQuran.id API v2
  try {
    const fallbackUrl = `https://equran.id/api/v2/surat/${surahNumber}`;
    const fbRes = await fetch(fallbackUrl);
    if (fbRes.ok) {
      const fbJson = await fbRes.json();
      if (fbJson.code === 200 && fbJson.data && Array.isArray(fbJson.data.ayat)) {
        const rawAyahs: Ayah[] = fbJson.data.ayat.map((item: any) => ({
          number: item.nomorAyat,
          numberInSurah: item.nomorAyat,
          text: item.teksArab,
          translation: item.teksIndonesia,
        }));

        const { ayahs, hasBasmalahHeader, basmalahText } = processBasmalah(surahNumber, rawAyahs);

        const result: SurahData = {
          number: meta.number,
          name: fbJson.data.nama || meta.name,
          englishName: meta.englishName,
          indonesianName: fbJson.data.namaLatin || meta.indonesianName,
          translation: fbJson.data.arti || meta.translation,
          numberOfAyahs: meta.numberOfAyahs,
          revelationType: meta.revelationType,
          ayahs,
          hasBasmalahHeader,
          basmalahText,
        };

        try {
          localStorage.setItem(cacheKey, JSON.stringify(result));
        } catch (e) {
          // Ignore
        }

        return result;
      }
    }
  } catch (fallbackErr) {
    console.error('All Quran APIs failed:', fallbackErr);
  }

  throw new Error(`Gagal memuat Surah ${meta.indonesianName}. Periksa koneksi internet Anda.`);
}
