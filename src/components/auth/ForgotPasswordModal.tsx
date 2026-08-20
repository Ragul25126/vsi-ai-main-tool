import React, { useState } from 'react';
import { X, Mail, CheckCircle2, Loader2 } from 'lucide-react';
import { InputField } from './InputField';
import { createClient } from '@/lib/supabase/client';
import { isAuthorizedEmail } from '@/lib/auth-config';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessToast: (msg: string) => void;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  onSuccessToast,
}) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setError('');
    setLoading(true);

    try {
      if (isAuthorizedEmail(email)) {
        const supabase = createClient();
        const resetUrl = typeof window !== "undefined" ? `${window.location.origin}/auth/reset-password` : undefined;
        await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: resetUrl,
        });
      }
    } catch {
      // Do not reveal errors to prevent account enumeration
    } finally {
      setLoading(false);
      setSent(true);
      onSuccessToast(`Password reset instructions sent to ${email}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-[#0B0E14] border border-[#FF5500]/30 rounded-2xl p-6 sm:p-8 shadow-[0_0_50px_rgba(255,85,0,0.25)]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {!sent ? (
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white tracking-tight">
                Reset Password
              </h2>
              <p className="text-sm text-zinc-400 mt-1">
                Enter your email address and we&apos;ll send you instructions to reset your password.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <InputField
                label="Email address"
                id="reset-email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError('');
                }}
                error={error}
                icon={<Mail className="w-5 h-5 text-[#FF5500]" />}
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-[#FF5500] to-[#FF3300] hover:from-[#FF6600] hover:to-[#FF4400] font-bold text-white rounded-xl py-3.5 text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 shadow-[0_4px_25px_rgba(255,85,0,0.45)]"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending Reset Link...</span>
                  </>
                ) : (
                  <span>Send Reset Instructions</span>
                )}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center py-4 flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-4">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">Reset Link Sent</h3>
            <p className="text-sm text-zinc-400 mt-2 max-w-xs">
              Check your inbox at <span className="text-white font-medium">{email}</span> for instructions to reset your password.
            </p>
            <button
              onClick={onClose}
              className="mt-6 w-full bg-gradient-to-r from-[#FF5500] to-[#FF3300] hover:from-[#FF6600] hover:to-[#FF4400] font-bold text-white rounded-xl py-3 text-sm cursor-pointer shadow-[0_4px_25px_rgba(255,85,0,0.45)]"
            >
              Back to Sign In
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

