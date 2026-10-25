import React, { useState, useEffect } from 'react';
import {
  X,
  Smartphone,
  QrCode,
  Copy,
  Check,
  ExternalLink,
  Sliders,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import QRCode from 'qrcode';
import { ThemeType } from '../types/quran';
import { THEMES } from '../config/themes';

export type MobilePreset = 'iphone' | 'galaxy' | 'compact' | 'standard';

export interface MobilePresetConfig {
  id: MobilePreset;
  name: string;
  sub: string;
  width: number;
  height: number;
  radius: string;
}

export const MOBILE_PRESETS: Record<MobilePreset, MobilePresetConfig> = {
  iphone: {
    id: 'iphone',
    name: 'iPhone 15 / 16 Pro',
    sub: '393 × 852 px',
    width: 393,
    height: 852,
    radius: 'rounded-[50px]',
  },
  galaxy: {
    id: 'galaxy',
    name: 'Samsung Galaxy S24',
    sub: '412 × 915 px',
    width: 412,
    height: 915,
    radius: 'rounded-[46px]',
  },
  compact: {
    id: 'compact',
    name: 'Compact Phone',
    sub: '360 × 780 px',
    width: 360,
    height: 780,
    radius: 'rounded-[42px]',
  },
  standard: {
    id: 'standard',
    name: 'Lebar Standar Mobile',
    sub: '440 × 932 px',
    width: 440,
    height: 932,
    radius: 'rounded-[44px]',
  },
};

interface MobileViewModalProps {
  isOpen: boolean;
  theme: ThemeType;
  frameEnabled: boolean;
  selectedPreset: MobilePreset;
  onClose: () => void;
  onToggleFrame: (enabled: boolean) => void;
  onSelectPreset: (preset: MobilePreset) => void;
}

export const MobileViewModal: React.FC<MobileViewModalProps> = ({
  isOpen,
  theme,
  frameEnabled,
  selectedPreset,
  onClose,
  onToggleFrame,
  onSelectPreset,
}) => {
  const themeConfig = THEMES[theme] || THEMES['midnight-emerald'];
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isCopied, setIsCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'simulator' | 'qrcode'>('simulator');

  const mobileUrl = 'https://sufiansmurottal.vercel.app';

  // Generate QR Code on load
  useEffect(() => {
    let isMounted = true;
    const targetUrl = typeof window !== 'undefined' && window.location.href.startsWith('http')
      ? window.location.href
      : mobileUrl;

    QRCode.toDataURL(targetUrl, {
      margin: 2,
      width: 240,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
    })
      .then(url => {
        if (isMounted) setQrDataUrl(url);
      })
      .catch(err => {
        console.warn('QR code generation warning:', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard?.writeText(mobileUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none">
      <div
        className={`relative w-full max-w-md rounded-3xl border ${themeConfig.glassSurface} ${themeConfig.glassBorder} p-6 text-white shadow-2xl flex flex-col max-h-[90vh] overflow-hidden`}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-400/30 flex items-center justify-center">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-ui font-bold text-base text-white">Versi Mobile</h3>
              <p className="font-ui text-xs text-stone-400">Pratinjau Smartphone & Akses HP</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Tutup"
            className="w-9 h-9 rounded-xl flex items-center justify-center border border-white/10 text-stone-400 hover:text-white hover:bg-white/10 transition active:scale-90"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 gap-2 p-1 mt-4 rounded-xl bg-black/40 border border-white/10 shrink-0">
          <button
            onClick={() => setActiveTab('simulator')}
            className={`py-2 px-3 rounded-lg font-ui text-xs font-semibold flex items-center justify-center gap-2 transition ${
              activeTab === 'simulator'
                ? 'bg-amber-500 text-stone-950 shadow-md'
                : 'text-stone-300 hover:text-white'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Mode Bingkai HP</span>
          </button>
          <button
            onClick={() => setActiveTab('qrcode')}
            className={`py-2 px-3 rounded-lg font-ui text-xs font-semibold flex items-center justify-center gap-2 transition ${
              activeTab === 'qrcode'
                ? 'bg-amber-500 text-stone-950 shadow-md'
                : 'text-stone-300 hover:text-white'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Buka di HP (QR)</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          {activeTab === 'simulator' ? (
            <>
              {/* Toggle Realistic Frame */}
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between">
                <div>
                  <div className="font-ui font-semibold text-xs text-stone-200">
                    Bingkai Smartphone Realistis
                  </div>
                  <div className="font-ui text-[11px] text-stone-400 mt-0.5">
                    Tampilkan bezel HP, Dynamic Island, dan bar status di desktop
                  </div>
                </div>
                <button
                  onClick={() => onToggleFrame(!frameEnabled)}
                  aria-label={frameEnabled ? 'Matikan Bingkai' : 'Aktifkan Bingkai'}
                  className={`w-12 h-6.5 rounded-full p-1 transition-colors ${
                    frameEnabled ? 'bg-amber-500' : 'bg-stone-700'
                  }`}
                >
                  <div
                    className={`w-4.5 h-4.5 rounded-full bg-white transition-transform ${
                      frameEnabled ? 'translate-x-5.5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Preset Selection */}
              <div>
                <label className="block font-ui text-xs font-semibold text-stone-300 mb-2">
                  Pilih Ukuran Layar HP:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(MOBILE_PRESETS) as MobilePreset[]).map(key => {
                    const preset = MOBILE_PRESETS[key];
                    const isSelected = selectedPreset === key;
                    return (
                      <button
                        key={key}
                        onClick={() => onSelectPreset(key)}
                        className={`p-3 rounded-2xl border text-left transition active:scale-95 flex flex-col justify-between ${
                          isSelected
                            ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                            : 'bg-white/5 border-white/10 text-stone-300 hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full mb-1">
                          <span className="font-ui font-bold text-xs">{preset.name}</span>
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />}
                        </div>
                        <span className="font-mono text-[10px] text-stone-400">{preset.sub}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Information Note */}
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-ui text-emerald-300 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                <div className="text-[11px] leading-relaxed">
                  Aplikasi ini dirancang khusus <strong>Mobile-First</strong>. Teks ayat, ukuran font otomatis (FitText), dan tombol responsif menyesuaikan layar smartphone secara presisi.
                </div>
              </div>
            </>
          ) : (
            <>
              {/* QR Code Tab */}
              <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
                <div className="p-2.5 bg-white rounded-2xl shadow-xl mb-3">
                  {qrDataUrl ? (
                    <img
                      src={qrDataUrl}
                      alt="QR Code Versi Mobile"
                      className="w-48 h-48 rounded-xl object-contain"
                    />
                  ) : (
                    <div className="w-48 h-48 flex items-center justify-center text-stone-500 font-ui text-xs">
                      Membuat QR Code...
                    </div>
                  )}
                </div>

                <p className="font-ui text-xs font-semibold text-white">
                  Arahkan Kamera HP ke QR Code
                </p>
                <p className="font-ui text-[11px] text-stone-400 mt-1 max-w-xs leading-relaxed">
                  Buka aplikasi kamera di smartphone Anda dan pindai untuk langsung membuka versi mobile di HP.
                </p>
              </div>

              {/* Link copy */}
              <div className="p-3 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-between gap-2">
                <span className="font-mono text-xs text-amber-300 truncate pl-1">
                  {mobileUrl}
                </span>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={handleCopy}
                    className="px-3 py-1.5 rounded-xl bg-amber-500 text-stone-950 font-ui font-semibold text-xs flex items-center gap-1.5 active:scale-95 transition"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Salin</span>
                      </>
                    )}
                  </button>
                  <a
                    href={mobileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-xl border border-white/10 text-stone-300 hover:text-white transition"
                    title="Buka di tab baru"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-ui font-medium text-xs transition active:scale-95"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
