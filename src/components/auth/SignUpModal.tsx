import React from 'react';
import { X, AlertCircle } from 'lucide-react';

interface SignUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessSignUp?: (name: string, email: string) => void;
}

export const SignUpModal: React.FC<SignUpModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-zinc-950 border border-[#ef2b2b]/30 rounded-2xl p-6 sm:p-8 shadow-[0_0_50px_rgba(239,43,43,0.25)]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center py-4 flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-red-950/80 border border-red-500/40 flex items-center justify-center text-[#ff2b2b] mb-4">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-white">Public Sign Up Disabled</h3>
          <p className="text-sm text-zinc-400 mt-2 max-w-xs leading-relaxed">
            Self-service registration is disabled. Access to the ValGrow Labs platform is restricted to authorized administrative accounts only.
          </p>
          <button
            onClick={onClose}
            className="mt-6 w-full btn-red-gradient font-bold text-white rounded-xl py-3 text-sm cursor-pointer"
          >
            Back to Sign In
          </button>
        </div>
      </div>
    </div>
  );
};
