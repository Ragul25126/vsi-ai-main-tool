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
    <div className="fixed top-6 right-6 z-50 animate-fade-in max-w-md w-full px-4">
      <div
        className={`flex items-center gap-3 p-4 rounded-panel shadow-overlay border ${
          isSuccess
            ? 'bg-positive-soft border-positive/30 text-positive'
            : isError
            ? 'bg-critical-soft border-critical/30 text-critical'
            : 'bg-ink border-ink text-white'
        }`}
      >
        {isSuccess && <CheckCircle2 className="w-5 h-5 text-positive shrink-0" />}
        {isError && <AlertCircle className="w-5 h-5 text-critical shrink-0" />}
        {!isSuccess && !isError && <Info className="w-5 h-5 text-info shrink-0" />}
        
        <p className="text-body font-medium leading-snug flex-1">{toast.text}</p>
        
        <button
          onClick={onClose}
          className="p-1 text-ink-3 hover:text-white rounded-control hover:bg-surface/10 transition-colors"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
