import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import type { ToastMessage } from '@/types/login';

interface ToastProps {
  toast: ToastMessage | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast, onClose]);

  if (!toast) return null;

  const isSuccess = toast.type === 'success';
  const isError = toast.type === 'error';

  return (
    <div className="fixed top-6 right-6 z-50 animate-bounce max-w-md w-full px-4">
      <div
        className={`flex items-center gap-3 p-4 rounded-xl shadow-2xl backdrop-blur-xl border ${
          isSuccess
            ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-200 shadow-emerald-900/20'
            : isError
            ? 'bg-red-950/85 border-red-500/50 text-red-100 shadow-red-950/40'
            : 'bg-zinc-900/90 border-zinc-700 text-zinc-200'
        }`}
      >
        {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
        {isError && <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />}
        {!isSuccess && !isError && <Info className="w-5 h-5 text-blue-400 shrink-0" />}
        
        <p className="text-sm font-medium leading-snug flex-1">{toast.text}</p>
        
        <button
          onClick={onClose}
          className="p-1 text-zinc-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
