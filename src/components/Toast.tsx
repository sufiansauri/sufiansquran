import React, { useEffect } from 'react';
import { AlertCircle, RefreshCw, X } from 'lucide-react';

interface ToastProps {
  message: string | null;
  onClose: () => void;
  onRetry?: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, onClose, onRetry }) => {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, 4500);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div className="fixed top-14 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none animate-slide-down">
      <div className="pointer-events-auto max-w-sm w-full p-3 rounded-2xl bg-stone-900/95 border border-amber-500/30 text-white shadow-2xl backdrop-blur-md flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="font-ui text-xs text-stone-200 truncate">
            {message}
          </span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-2 py-1 rounded-lg bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 text-[11px] font-ui font-semibold flex items-center gap-1 active:scale-95 transition"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Coba Lagi</span>
            </button>
          )}
          <button
            onClick={onClose}
            className="w-6 h-6 rounded-lg text-stone-400 hover:text-white flex items-center justify-center transition"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
