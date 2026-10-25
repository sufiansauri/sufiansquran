export interface SurahMeta {
  number: number;
  name: string; // Arabic name, e.g. "الفَاتِحة"
  englishName: string; // Transliterated name, e.g. "Al-Faatiha"
  indonesianName: string; // Indonesian transliteration, e.g. "Al-Fatihah"
  translation: string; // Meaning in Indonesian, e.g. "Pembukaan"
  numberOfAyahs: number;
  revelationType: 'Meccan' | 'Medinan';
}

export interface Ayah {
  number: number; // Global ayah number in Quran (1-6236)
  numberInSurah: number; // Ayah number in surah (e.g. 1, 2, 255)
  text: string; // Uthmani Arabic text
  translation: string; // Indonesian translation
  juz?: number;
  page?: number;
  audioUrl?: string;
}

export interface SurahData {
  number: number;
  name: string;
  englishName: string;
  indonesianName: string;
  translation: string;
  numberOfAyahs: number;
  revelationType: 'Meccan' | 'Medinan';
  ayahs: Ayah[];
  hasBasmalahHeader?: boolean;
  basmalahText?: string;
}

export interface Qari {
  id: string;
  name: string;
  arabicName: string;
  folder: string;
  fallbackFolder?: string;
  bitrate: string;
  style: string;
}

export type ThemeType = 'midnight-emerald' | 'golden-night' | 'ocean-dusk' | 'cream-light';

export type RepeatMode = 'off' | '2x' | '3x' | 'infinite';

export type EndOfSurahMode = 'next' | 'repeat' | 'stop';

export interface PlayerSettings {
  selectedQariId: string;
  playbackSpeed: number;
  repeatMode: RepeatMode;
  endOfSurahMode: EndOfSurahMode;
  showTranslation: boolean;
  playBasmalahOpening: boolean;
  theme: ThemeType;
  keepScreenAwake: boolean;
}
