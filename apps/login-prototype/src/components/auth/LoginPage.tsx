import React, { useState } from 'react';
import { SunIcon as Sunburst, Loader2, Eye, EyeOff } from 'lucide-react';
import { ForgotPasswordModal } from './ForgotPasswordModal';
import { SignUpModal } from './SignUpModal';
import { Toast } from '../common/Toast';
import type { ToastMessage, UserProfile } from '../../types';

interface LoginPageProps {
  onLoginSuccess: (user: UserProfile) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const showToast = (type: 'success' | 'error' | 'info', text: string) => {
    setToast({
      id: Date.now().toString(),
      type,
      text,
    });
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let hasError = false;

    if (!email.trim()) {
      setEmailError('Email address is required');
      hasError = true;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Please enter a valid email address');
      hasError = true;
    } else {
      setEmailError('');
    }

    if (!password) {
      setPasswordError('Password is required');
      hasError = true;
    } else {
      setPasswordError('');
    }

    if (hasError) return;

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      
      const mockUser: UserProfile = {
        name: email.split('@')[0].toUpperCase(),
        email,
        role: 'Administrator',
        company: 'Valgrow Enterprise',
        plan: 'VSI GEO Platform Pro',
      };

      localStorage.setItem('vsi_user', JSON.stringify(mockUser));
      showToast('success', `Welcome back to VSI AI Suite, ${mockUser.name}!`);
      
      setTimeout(() => {
        onLoginSuccess(mockUser);
      }, 700);
    }, 1000);
  };

  const handleSignUpSuccess = (name: string, userEmail: string) => {
    setIsSignUpOpen(false);
    showToast('success', `Account created successfully for ${name}! Logging you in...`);
    const newUser: UserProfile = {
      name,
      email: userEmail,
      role: 'Owner',
      company: 'My Brand',
      plan: '14-Day Free Trial',
    };
    setTimeout(() => {
      onLoginSuccess(newUser);
    }, 900);
  };

  return (
    <div className="relative min-h-screen w-full bg-black text-white flex items-center justify-center p-4 sm:p-6 lg:p-12 selection:bg-[#FF5500] selection:text-white">
      {/* Toast Feedback */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Floating Centered Card Container matching Image 2 */}
      <main className="relative z-10 w-full max-w-5xl overflow-hidden flex flex-col md:flex-row shadow-[0_0_60px_rgba(0,0,0,0.8)] rounded-3xl border border-zinc-800/80 bg-black min-h-[500px] my-auto">
        
        {/* LEFT COLUMN: BRANDING & HEADLINE matching Image 2 */}
        <div className="bg-black text-white p-8 sm:p-12 md:p-14 md:w-1/2 relative rounded-l-3xl overflow-hidden flex flex-col justify-between z-10 min-h-[440px]">
          {/* Vertical Grid Lines Overlay */}
          <div className="absolute inset-0 grid grid-cols-5 pointer-events-none opacity-20 divide-x divide-zinc-800 z-0">
            <div className="h-full" />
            <div className="h-full" />
            <div className="h-full" />
            <div className="h-full" />
            <div className="h-full" />
          </div>

          {/* Main Headline & Description matching Image 2 */}
          <div className="flex flex-col justify-center my-auto relative z-10 gap-4">
            <h1 className="text-3xl sm:text-4xl md:text-[44px] xl:text-[48px] font-extrabold text-white tracking-tight leading-[1.12]">
              Design and dev partner for startups and founders.
            </h1>
            <p className="text-zinc-400 text-sm sm:text-base leading-relaxed font-normal max-w-md mt-2">
              Monitor AI search mentions, citation share of voice, and brand visibility across modern AI platforms.
            </p>
          </div>

          {/* Footer Copyright */}
          <div className="relative z-10 text-xs text-zinc-500 font-normal">
            © ValGrow Labs • VSI AI Suite
          </div>
        </div>

        {/* RIGHT COLUMN: FORM matching Image 2 */}
        <div className="p-8 sm:p-12 md:p-14 md:w-1/2 flex flex-col bg-[#16181f] z-10 text-white border-l border-zinc-800/80 justify-center">
          <div className="flex flex-col items-start mb-8">
            <div className="text-[#FF5500] mb-3 drop-shadow-[0_0_12px_rgba(255,85,0,0.5)]">
              <Sunburst className="h-8 w-8 stroke-[1.8]" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold mb-1.5 tracking-tight text-white">
              Get Started
            </h2>
            <p className="text-left text-zinc-400 text-xs sm:text-sm">
              Welcome to VSI AI Suite — Let&apos;s get started
            </p>
          </div>

          <form onSubmit={handleLoginSubmit} noValidate className="flex flex-col gap-4">
            <div>
              <label htmlFor="email-vsi" className="block text-sm mb-2 font-medium text-zinc-300">
                Your email
              </label>
              <input
                type="email"
                id="email-vsi"
                placeholder="valgrowlabs444@gmail.com"
                className={`text-sm font-medium w-full py-3 px-4 border rounded-lg focus:outline-none focus:ring-2 bg-white text-black placeholder:text-gray-400 focus:ring-[#FF5500] transition-all ${
                  emailError ? "border-red-500" : "border-gray-200"
                }`}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError('');
                }}
                autoComplete="email"
              />
              {emailError && (
                <p className="text-red-400 text-xs mt-1 font-medium">{emailError}</p>
              )}
            </div>

            <div>
              <label htmlFor="password-vsi" className="block text-sm mb-2 font-medium text-zinc-300">
                Password
              </label>
              <div className="relative flex items-center">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password-vsi"
                  placeholder="••••••••••••"
                  className={`text-sm font-medium w-full py-3 pl-4 pr-11 border rounded-lg focus:outline-none focus:ring-2 bg-white text-black placeholder:text-gray-400 focus:ring-[#FF5500] transition-all ${
                    passwordError ? "border-red-500" : "border-gray-200"
                  }`}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (passwordError) setPasswordError('');
                  }}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 text-gray-500 hover:text-gray-700 p-1 rounded-lg transition-colors focus:outline-none cursor-pointer"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {passwordError && (
                <p className="text-red-400 text-xs mt-1 font-medium">{passwordError}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#ff5500] hover:bg-[#e64d00] active:scale-[0.99] text-white font-bold text-base py-3.5 px-4 rounded-xl transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 mt-3 disabled:opacity-60 shadow-[0_4px_20px_rgba(255,85,0,0.35)]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>

            <div className="flex items-center justify-between text-xs text-zinc-400 mt-4">
              <button
                type="button"
                onClick={() => setIsForgotOpen(true)}
                className="hover:text-white transition-colors"
              >
                Forgot password?
              </button>
              <button
                type="button"
                onClick={() => setIsSignUpOpen(true)}
                className="text-[#FF5500] hover:underline font-medium"
              >
                Create account
              </button>
            </div>
          </form>
        </div>

      </main>

      {/* Modals */}
      <ForgotPasswordModal
        isOpen={isForgotOpen}
        onClose={() => setIsForgotOpen(false)}
        onSuccessToast={(msg) => showToast('info', msg)}
      />

      <SignUpModal
        isOpen={isSignUpOpen}
        onClose={() => setIsSignUpOpen(false)}
        onSuccessSignUp={handleSignUpSuccess}
      />
    </div>
  );
};


