import React, { useState, useEffect } from 'react';
import { Wifi, BatteryMedium, Signal } from 'lucide-react';
import { MOBILE_PRESETS, MobilePreset } from './MobileViewModal';

interface PhoneChassisProps {
  children: React.ReactNode;
  frameEnabled: boolean;
  preset: MobilePreset;
}

export const PhoneChassis: React.FC<PhoneChassisProps> = ({
  children,
  frameEnabled,
  preset,
}) => {
  const [timeStr, setTimeStr] = useState<string>('09:41');
  const presetConfig = MOBILE_PRESETS[preset] || MOBILE_PRESETS.iphone;

  // Real clock for simulated status bar
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      setTimeStr(`${hours}:${minutes}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 15000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={`relative flex items-center justify-center transition-all duration-300 w-full h-full ${
        frameEnabled ? 'md:py-4' : ''
      }`}
    >
      <div className="relative flex items-center justify-center">
        {/* Subtle phone side buttons accents on desktop when frame enabled */}
        {frameEnabled && (
          <div className="hidden md:block pointer-events-none select-none">
            {/* Volume Buttons Left */}
            <div className="absolute -left-[14px] top-28 w-[4px] h-12 bg-stone-700 rounded-l-sm" />
            <div className="absolute -left-[14px] top-44 w-[4px] h-12 bg-stone-700 rounded-l-sm" />
            {/* Power Button Right */}
            <div className="absolute -right-[14px] top-32 w-[4px] h-16 bg-stone-700 rounded-r-sm" />
          </div>
        )}

        {/* Single Device Container (Native on mobile, Realistic Phone Mockup on desktop) */}
        <div
          style={{
            maxWidth: `${presetConfig.width}px`,
          }}
          className={`relative w-full flex flex-col justify-between overflow-hidden bg-stone-950 transition-all duration-300 ${
            frameEnabled
              ? `h-[100dvh] md:h-[min(880px,94vh)] md:border-[10px] md:border-stone-800 md:shadow-[0_25px_65px_-10px_rgba(0,0,0,0.95)] md:ring-1 md:ring-white/15 ${presetConfig.radius}`
              : 'h-[100dvh] shadow-2xl'
          }`}
        >
          {/* Top Status Bar (Only on desktop when frame is enabled) */}
          {frameEnabled && (
            <div className="hidden md:flex absolute top-0 inset-x-0 h-9 z-40 px-6 items-center justify-between text-white/90 pointer-events-none select-none">
              {/* Left Time */}
              <span className="font-sans font-semibold text-xs tracking-tight">
                {timeStr}
              </span>

              {/* Dynamic Island Notch Pill */}
              <div className="w-24 h-5 bg-black rounded-full border border-white/10 flex items-center justify-between px-2 shadow-inner">
                <div className="w-2 h-2 rounded-full bg-stone-900 border border-white/20" />
                <div className="w-2.5 h-2.5 rounded-full bg-stone-900/90 border border-blue-500/20" />
              </div>

              {/* Right Phone Status Icons */}
              <div className="flex items-center gap-1.5 text-stone-200">
                <Signal className="w-3.5 h-3.5" />
                <Wifi className="w-3.5 h-3.5" />
                <BatteryMedium className="w-4 h-4 text-emerald-400" />
              </div>
            </div>
          )}

          {/* Children app contents rendered exactly once */}
          <div className="relative w-full h-full flex flex-col justify-between overflow-hidden">
            {children}
          </div>

          {/* Bottom Home Indicator Bar (Only on desktop when frame is enabled) */}
          {frameEnabled && (
            <div className="hidden md:flex absolute bottom-1 inset-x-0 h-4 items-center justify-center pointer-events-none z-40">
              <div className="w-32 h-1 bg-white/40 rounded-full" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
