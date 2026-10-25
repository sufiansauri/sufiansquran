import { getSurahMeta } from './surahs';

export interface BackgroundItem {
  id: string;
  title: string;
  description: string;
  src: string;
  themes: string[]; // surah categories or keywords
}

export const ISLAMIC_BACKGROUNDS: BackgroundItem[] = [
  {
    id: 'straight_path',
    title: 'Ash-Shirath Al-Mustaqim',
    description: 'Jalan lurus yang dibimbing Allah menuju cahaya fajar',
    src: '/src/assets/images/bg_straight_path_1792891191982.jpg',
    themes: ['guidance', 'fatihah', 'iman', 'nature', 'dawn'],
  },
  {
    id: 'holy_masjid',
    title: 'Baitullah & Masjid Agung',
    description: 'Menara marmer dan kubah indah tempat bersujud kepada Allah',
    src: '/src/assets/images/bg_holy_masjid_1792891192622.jpg',
    themes: ['masjid', 'worship', 'sujud', 'fatihah', 'dusk'],
  },
  {
    id: 'makkah_kaaba',
    title: "Ka'bah Al-Musyarrafah",
    description: 'Kiblat umat Islam di Tanah Suci Makkah Al-Mukarramah',
    src: '/src/assets/images/bg_makkah_kaaba_1792891193038.jpg',
    themes: ['kaaba', 'makkah', 'hajj', 'baqarah', 'ibrahim'],
  },
  {
    id: 'prophet_mosque',
    title: 'Masjid Nabawi Madinah',
    description: 'Kubah hijau megah dan pelataran suci Nabawi di kala senja',
    src: '/src/assets/images/prophet_mosque_sunset_1792892774454.jpg',
    themes: ['nabawi', 'madinah', 'rasulullah', 'masjid', 'dusk', 'baqarah'],
  },
  {
    id: 'quran_rehal',
    title: "Mushaf Al-Qur'an & Rehal",
    description: 'Kalam Ilahi petunjuk kebenaran bermandikan cahaya berkah fajar',
    src: '/src/assets/images/quran_rehal_glow_1792892775925.jpg',
    themes: ['quran', 'wahyu', 'hidayah', 'cahaya', 'sanctuary', 'baqarah'],
  },
  {
    id: 'mount_hira',
    title: 'Jabal An-Nur & Gua Hira',
    description: 'Puncak gunung suci tempat turunnya wahyu pertama saat fajar',
    src: '/src/assets/images/mount_hira_dawn_1792892775944.jpg',
    themes: ['hira', 'jabal', 'wahyu', 'dawn', 'mountain', 'kahf'],
  },
  {
    id: 'islamic_garden',
    title: 'Taman Air Firdaus',
    description: 'Telaga jernih dan pepohonan asri penyejuk jiwa yang beriman',
    src: '/src/assets/images/islamic_garden_water_1792892776888.jpg',
    themes: ['jannah', 'garden', 'water', 'fountain', 'nature', 'rahman', 'waqiah'],
  },
  {
    id: 'desert_fajr_dunes',
    title: 'Gurun Emas Waktu Fajr',
    description: 'Hamparan padang pasir luas tanda keagungan ciptaan Allah',
    src: '/src/assets/images/desert_fajr_dunes_1792892777112.jpg',
    themes: ['desert', 'fajr', 'vast', 'creation', 'dunes', 'yusuf'],
  },
  {
    id: 'nature_olive_fig',
    title: 'Alam & Pepohonan Zaitun-Tin',
    description: 'Ciptaan Allah yang asri dan tanaman yang diberkahi',
    src: '/src/assets/images/bg_nature_olive_fig_1792891193638.jpg',
    themes: ['nature', 'olive', 'tin', 'rahman', 'rizq'],
  },
  {
    id: 'desert_stars',
    title: 'Gugusan Bintang & Langit Malam',
    description: 'Kebesaran ciptaan Allah di langit malam yang penuh galaksi',
    src: '/src/assets/images/bg_desert_stars_1792891194811.jpg',
    themes: ['cosmos', 'stars', 'mulk', 'najm', 'tariq', 'lail', 'yusuf'],
  },
];

/**
 * Returns an ordered array of background items matching a specific Surah.
 * If the Surah is long (>= 75 verses, such as Al-Baqarah, Ali Imran, An-Nisa, Al-Kahf, Yusuf, etc.),
 * it includes all 10 stock backgrounds so the user enjoys a fresh 5-minute visual cycle without feeling bored.
 * Medium surahs (30-74 verses) receive 7-8 backgrounds.
 * Short surahs (< 30 verses) receive 5-6 thematic backgrounds.
 */
export function getBackgroundsForSurah(surahNumber: number, totalAyahsOverride?: number): BackgroundItem[] {
  const meta = getSurahMeta(surahNumber);
  const totalAyahs = totalAyahsOverride ?? (meta?.numberOfAyahs ?? 7);

  // Helper map by ID
  const map: Record<string, BackgroundItem> = {};
  for (const item of ISLAMIC_BACKGROUNDS) {
    map[item.id] = item;
  }

  // 1. Surah Al-Fatihah (1) - 7 verses
  if (surahNumber === 1) {
    return [
      map['straight_path'],
      map['holy_masjid'],
      map['prophet_mosque'],
      map['makkah_kaaba'],
      map['quran_rehal'],
      map['islamic_garden'],
    ];
  }

  // 2. Surah Al-Baqarah (2, 286 verses) & Ali 'Imran (3, 200 verses) - Very long surahs
  if (surahNumber === 2 || surahNumber === 3) {
    return [
      map['makkah_kaaba'],
      map['prophet_mosque'],
      map['quran_rehal'],
      map['straight_path'],
      map['mount_hira'],
      map['islamic_garden'],
      map['holy_masjid'],
      map['desert_fajr_dunes'],
      map['nature_olive_fig'],
      map['desert_stars'],
    ];
  }

  // 3. Surah Al-Kahf (18, 110 verses) - Very long surah with cave, faith, knowledge, jannatain
  if (surahNumber === 18) {
    return [
      map['mount_hira'],
      map['quran_rehal'],
      map['islamic_garden'],
      map['holy_masjid'],
      map['desert_fajr_dunes'],
      map['prophet_mosque'],
      map['straight_path'],
      map['nature_olive_fig'],
      map['desert_stars'],
      map['makkah_kaaba'],
    ];
  }

  // 4. Surah Yusuf (12, 111 verses) - Eleven stars, desert journey, beauty of patience
  if (surahNumber === 12) {
    return [
      map['desert_stars'],
      map['desert_fajr_dunes'],
      map['quran_rehal'],
      map['islamic_garden'],
      map['straight_path'],
      map['holy_masjid'],
      map['mount_hira'],
      map['prophet_mosque'],
      map['nature_olive_fig'],
      map['makkah_kaaba'],
    ];
  }

  // 5. Surah Ar-Rahman (55, 78 verses) & Al-Waqi'ah (56, 96 verses)
  if (surahNumber === 55 || surahNumber === 56 || surahNumber === 95) {
    return [
      map['islamic_garden'],
      map['nature_olive_fig'],
      map['desert_stars'],
      map['quran_rehal'],
      map['straight_path'],
      map['prophet_mosque'],
      map['holy_masjid'],
      map['mount_hira'],
      map['desert_fajr_dunes'],
      map['makkah_kaaba'],
    ];
  }

  // 6. Cosmic / Night Surahs: An-Najm (53), Al-Mulk (67), Al-Buruj (85), At-Tariq (86), Al-Lail (92), Al-Qadr (97)
  if ([53, 67, 85, 86, 91, 92, 97].includes(surahNumber)) {
    const list = [
      map['desert_stars'],
      map['mount_hira'],
      map['quran_rehal'],
      map['holy_masjid'],
      map['prophet_mosque'],
      map['makkah_kaaba'],
      map['straight_path'],
      map['desert_fajr_dunes'],
    ];
    return totalAyahs >= 75 ? [...list, map['islamic_garden'], map['nature_olive_fig']] : list;
  }

  // 7. General Long Surah (>= 75 verses) -> Always provide ALL 10 backgrounds!
  if (totalAyahs >= 75) {
    const offset = (surahNumber * 3) % ISLAMIC_BACKGROUNDS.length;
    return [
      ...ISLAMIC_BACKGROUNDS.slice(offset),
      ...ISLAMIC_BACKGROUNDS.slice(0, offset),
    ];
  }

  // 8. General Medium Surah (30 to 74 verses) -> Provide 7 to 8 backgrounds!
  if (totalAyahs >= 30) {
    const offset = (surahNumber * 2) % ISLAMIC_BACKGROUNDS.length;
    const rotated = [
      ...ISLAMIC_BACKGROUNDS.slice(offset),
      ...ISLAMIC_BACKGROUNDS.slice(0, offset),
    ];
    return rotated.slice(0, 8);
  }

  // 9. Short Surahs (< 30 verses) -> Provide 6 thematic backgrounds
  const offset = surahNumber % ISLAMIC_BACKGROUNDS.length;
  const rotated = [
    ...ISLAMIC_BACKGROUNDS.slice(offset),
    ...ISLAMIC_BACKGROUNDS.slice(0, offset),
  ];
  return rotated.slice(0, 6);
}
