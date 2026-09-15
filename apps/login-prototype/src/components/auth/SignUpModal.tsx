import React, { useState } from 'react';
import { X, User, Mail, Building, Loader2, Sparkles } from 'lucide-react';
import { InputField } from './InputField';
import { PasswordField } from './PasswordField';

interface SignUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessSignUp: (name: string, email: string) => void;
}

export const SignUpModal: React.FC<SignUpModalProps> = ({
  isOpen,
  onClose,
  onSuccessSignUp,
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { [key: string]: string } = {};

    if (!name.trim()) newErrors.name = 'Full name is required';
    if (!email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      onSuccessSignUp(name, email);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-zinc-950 border border-[#ef2b2b]/30 rounded-2xl p-6 sm:p-8 shadow-[0_0_50px_rgba(239,43,43,0.25)] max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/60 border border-red-500/30 text-red-300 text-xs font-mono mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#ff2b2b]" />
            <span>START YOUR 14-DAY FREE TRIAL</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Create VSI AI Suite Account
          </h2>
          <p className="text-sm text-zinc-400 mt-1">
            Get instant access to AI Search Intelligence & GEO Platform
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <InputField
            label="Full Name"
            id="signup-name"
            type="text"
            placeholder="John Doe"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errors.name) setErrors({ ...errors, name: '' });
            }}
            error={errors.name}
            icon={<User className="w-5 h-5 text-[#ff2b2b]" />}
          />

          <InputField
            label="Work Email"
            id="signup-email"
            type="email"
            placeholder="john@company.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors({ ...errors, email: '' });
            }}
            error={errors.email}
            icon={<Mail className="w-5 h-5 text-[#ff2b2b]" />}
          />

          <InputField
            label="Company Name (Optional)"
            id="signup-company"
            type="text"
            placeholder="Acme Corp"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            icon={<Building className="w-5 h-5 text-[#ff2b2b]" />}
          />

          <PasswordField
            label="Password"
            id="signup-password"
            placeholder="Create a secure password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password) setErrors({ ...errors, password: '' });
            }}
            error={errors.password}
          />

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full btn-red-gradient font-bold text-white rounded-xl py-3.5 text-sm flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating Account...</span>
              </>
            ) : (
              <span>Create Free Account</span>
            )}
          </button>

          <p className="text-center text-xs text-zinc-500 mt-2">
            By signing up, you agree to our Terms of Service & Privacy Policy.
          </p>
        </form>
      </div>
    </div>
  );
};
