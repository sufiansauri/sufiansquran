import React from 'react';
import {
  X,
  Heart,
  Globe,
  ExternalLink,
  Youtube,
  Share2,
  Coffee,
  Bookmark,
  Sparkles,
  Info,
} from 'lucide-react';
import { ThemeType } from '../types/quran';
import { THEMES } from '../config/themes';

interface AboutSheetProps {
  isOpen: boolean;
  theme: ThemeType;
  currentQariName: string;
  onClose: () => void;
}

export const AboutSheet: React.FC<AboutSheetProps> = ({
  isOpen,
  theme,
  currentQariName,
  onClose,
}) => {
  const themeConfig = THEMES[theme] || THEMES['midnight-emerald'];

  if (!isOpen) return null;

  const links = [
    {
      label: 'Dukung / Traktir',
      url: 'https://sociabuzz.com/sufiansauri05/tribe',
      icon: Coffee,
      color: 'bg-amber-500/20 text-amber-300 border-amber-400/30',
      description: 'SociaBuzz Tribe donasi & apresiasi karya',
    },
    {
      label: 'Teer',
      url: 'https://teer.id/sufian_sauri',
      icon: Heart,
      color: 'bg-rose-500/20 text-rose-300 border-rose-400/30',
      description: 'Dukungan karya melalui platform Teer.id',
    },
    {
      label: 'Quran Nature Web (YouTube)',
      url: 'https://www.youtube.com/@QuranNatureWeb',
      icon: Youtube,
      color: 'bg-red-500/20 text-red-300 border-red-400/30',
      description: 'Channel lantunan Quran & visual alam menenangkan',
    },
    {
      label: 'Portofolio: sufiansweb.vercel.app',
      url: 'https://sufiansweb.vercel.app',
      icon: Globe,
      color: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30',
      description: 'Website portofolio resmi Sufian Sauri, S.Hum',
    },
    {
      label: 'TikTok',
      url: 'https://tiktok.com/@sufiansauri05',
      icon: Share2,
      color: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/30',
      description: '@sufiansauri05',
    },
    {
      label: 'Instagram',
      url: 'https://www.instagram.com/sufian_sauri05?utm_source=qr&stkn=MXExczV2ZWwzeHc2cQ==',
      icon: Bookmark,
      color: 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-400/30',
      description: '@sufian_sauri05',
    },
    {
      label: 'Facebook',
      url: 'https://www.facebook.com/share/1FGBLuXfvP/',
      icon: Globe,
      color: 'bg-blue-500/20 text-blue-300 border-blue-400/30',
      description: 'Profil Facebook Sufian Sauri',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="absolute inset-0" onClick={onClose} />

      <div
        className={`relative w-full max-w-lg max-h-[88dvh] rounded-t-3xl border-t border-x flex flex-col shadow-2xl overflow-hidden pb-safe animate-slide-up ${themeConfig.glassSurface} ${themeConfig.glassBorder}`}
      >
        <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto my-3 shrink-0" />

        <div className="px-5 pb-3 flex items-center justify-between border-b border-white/10 shrink-0">
          <div>
            <h2 className="font-ui font-bold text-lg text-white">Tentang Aplikasi</h2>
            <p className="font-ui text-xs text-stone-400">Informasi pembuat, sumber data, dan dukungan</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Tutup"
            className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-stone-300 hover:text-white active:scale-95 transition min-h-[44px] min-w-[44px]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Creator Profile Box */}
          <div className="p-4 rounded-2xl bg-gradient-to-tr from-amber-500/10 via-emerald-500/10 to-amber-400/15 border border-amber-400/30">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shrink-0 shadow-inner">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-amber-300/90 font-ui">
                  Pembuat Aplikasi
                </span>
                <h3 className="font-ui font-bold text-base text-white">
                  Aplikasi ini dibuat oleh Sufian Sauri, S.Hum
                </h3>
                <p className="font-ui text-xs text-stone-300 mt-0.5">
                  Pengembang front-end & desainer web islami modern
                </p>
              </div>
            </div>
          </div>

          {/* Social & Support Links */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-stone-300 font-ui block mb-2.5">
              Tautan & Kanal Pembuat
            </label>
            <div className="space-y-2">
              {links.map(link => {
                const IconComponent = link.icon;
                return (
                  <a
                    key={link.label}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full p-3 rounded-2xl bg-white/5 border border-white/10 hover:border-amber-400/40 hover:bg-white/10 flex items-center justify-between transition-all group min-h-[52px]"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center border shrink-0 ${link.color}`}
                      >
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-ui font-semibold text-xs text-white group-hover:text-amber-300 transition-colors">
                          {link.label}
                        </div>
                        <div className="font-ui text-[11px] text-stone-400">
                          {link.description}
                        </div>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-stone-500 group-hover:text-amber-300 transition-colors shrink-0" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Source Attribution (Mandatory) */}
          <div className="p-4 rounded-2xl bg-black/30 border border-white/10 space-y-2">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-amber-400" />
              <span className="font-ui font-semibold text-xs text-white">
                Atribusi Sumber Data
              </span>
            </div>
            <p className="font-ui text-xs text-stone-300 leading-relaxed">
              Teks & terjemah: <strong className="text-white">Al-Quran Cloud</strong> (terjemah resmi Kemenag RI) · Audio per ayat: <a href="https://everyayah.com" target="_blank" rel="noopener noreferrer" className="text-amber-300 underline font-semibold">everyayah.com</a>.
            </p>
            <div className="text-[11px] font-ui text-stone-400 pt-1 border-t border-white/10">
              Qari sedang diputar: <strong className="text-amber-300">{currentQariName}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
