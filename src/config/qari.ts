import { Qari } from '../types/quran';

export const QARI_LIST: Qari[] = [
  {
    id: 'alafasy',
    name: 'Misyari Rasyid Al-Afasy',
    arabicName: 'مشاري بن راشد العفاسي',
    folder: 'Alafasy_128kbps',
    bitrate: '128 kbps',
    style: 'Murattal, Penuh Penghayatan',
  },
  {
    id: 'ghamadi',
    name: "Sa'ad Al-Ghamdi",
    arabicName: 'سعد بن سعيد الغامدي',
    folder: 'Ghamadi_40kbps',
    bitrate: '40 kbps',
    style: 'Murattal, Cepat & Jernih',
  },
  {
    id: 'basfar',
    name: 'Abdullah Basfar',
    arabicName: 'عبد الله بن علي بصفر',
    folder: 'Abdullah_Basfar_64kbps',
    fallbackFolder: 'Abdullah_Basfar_192kbps',
    bitrate: '64 kbps',
    style: 'Murattal, Fasih & Mantap',
  },
  {
    id: 'sudais',
    name: 'Abdurrahman As-Sudais',
    arabicName: 'عبد الرحمن بن عبد العزيز السديس',
    folder: 'Abdurrahmaan_As-Sudais_192kbps',
    bitrate: '192 kbps',
    style: 'Imam Masjidil Haram, Khas & Merdu',
  },
  {
    id: 'husary',
    name: 'Mahmoud Khalil Al-Husary',
    arabicName: 'محمود خليل الحصري',
    folder: 'Husary_64kbps',
    bitrate: '64 kbps',
    style: 'Standar Tajwid Internasional',
  },
  {
    id: 'abdulbasit',
    name: 'Abdul Basit Abdus Samad',
    arabicName: 'عبد الباسط عبد الصمد',
    folder: 'Abdul_Basit_Murattal_64kbps',
    bitrate: '64 kbps',
    style: 'Murattal Klasik & Syahdu',
  },
  {
    id: 'shatree',
    name: 'Abu Bakr Asy-Syatri',
    arabicName: 'أبو بكر الشاطري',
    folder: 'Abu_Bakr_Ash-Shaatree_128kbps',
    bitrate: '128 kbps',
    style: 'Lembut & Menyentuh Hati',
  },
  {
    id: 'minshawi',
    name: 'Mohamed Siddiq Al-Minshawi',
    arabicName: 'محمد صديق المنشاوي',
    folder: 'Minshawy_Murattal_128kbps',
    bitrate: '128 kbps',
    style: 'Murattal Legendaris & Khusyuk',
  },
];

export const DEFAULT_QARI = QARI_LIST[0]; // Misyari Rasyid Al-Afasy

/**
 * Format 3-digit number (e.g. 1 -> "001", 255 -> "255")
 */
export function pad3(num: number): string {
  return String(num).padStart(3, '0');
}

/**
 * Construct URL for ayah audio on EveryAyah CDN:
 * https://everyayah.com/data/{FOLDER}/{SSS}{AAA}.mp3
 */
export function getAudioUrl(qari: Qari, surah: number, ayah: number, useFallback = false): string {
  const folder = useFallback && qari.fallbackFolder ? qari.fallbackFolder : qari.folder;
  const fileName = `${pad3(surah)}${pad3(ayah)}.mp3`;
  return `https://everyayah.com/data/${folder}/${fileName}`;
}

/**
 * Opening Basmalah audio URL (Surah 1, Ayah 1):
 */
export function getBasmalahAudioUrl(qari: Qari, useFallback = false): string {
  return getAudioUrl(qari, 1, 1, useFallback);
}
