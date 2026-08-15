"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BackgroundGrid } from '../common/BackgroundGrid';
import { BrandHeader } from './BrandHeader';
import { PillBadge } from './PillBadge';
import { MainHeadline } from './MainHeadline';
import { FeatureList } from './FeatureList';
import { StatsCard } from './StatsCard';
import { LoginCard } from './LoginCard';
import { ForgotPasswordModal } from './ForgotPasswordModal';
import { SignUpModal } from './SignUpModal';
import { Toast } from '../common/Toast';
import type { ToastMessage, UserProfile } from '@/types/login';
import { setClientSession } from '@/lib/auth-client';

import { createClient } from '@/lib/supabase/client';

export const LoginPage: React.FC = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);

  const showToast = (type: 'success' | 'error' | 'info', text: string) => {
    setToast({
      id: Date.now().toString(),
      type,
      text,
    });
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const errorParam = params.get("error");
    if (errorParam === "google_cancelled") {
      showToast("info", "Google Sign-In was cancelled.");
    } else if (errorParam === "google_credentials_missing") {
      showToast("error", "Google OAuth configuration (GOOGLE_CLIENT_ID) is missing in environment variables.");
    } else if (errorParam === "google_auth_failed" || errorParam === "google_token_failed") {
      showToast("error", "Google authentication failed. Please try again.");
    }
  }, []);

  const completeAuthentication = (user: UserProfile) => {
    setClientSession(user);
    showToast('success', `Welcome back to VSI AI Suite, ${user.name}!`);
    setTimeout(() => {
      window.location.href = '/dashboard';
    }, 700);
  };

  const handleLoginSubmit = (email: string, _password: string, _remember: boolean) => {
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

      completeAuthentication(mockUser);
    }, 1000);
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const redirectUrl = `${window.location.origin}/auth/callback`;
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: { prompt: 'select_account' },
        },
      });

      if (!error && data?.url) {
        window.location.href = data.url;
        return;
      }
    } catch {
      // Fallback to direct OAuth endpoint /api/auth/google
    }

    window.location.href = '/api/auth/google';
  };

  const handleSignUpSuccess = (name: string, email: string) => {
    setIsSignUpOpen(false);
    showToast('success', `Account created successfully for ${name}! Logging you in...`);
    const newUser: UserProfile = {
      name,
      email,
      role: 'Owner',
      company: 'My Brand',
      plan: '14-Day Free Trial',
    };
    setTimeout(() => {
      completeAuthentication(newUser);
    }, 800);
  };

  return (
    <div className="relative min-h-screen w-full bg-[#050505] text-white flex flex-col justify-center items-center overflow-x-hidden selection:bg-[#ff2b2b] selection:text-white dark">
      {/* Dynamic Cyber Grid & Red Orbs Background */}
      <BackgroundGrid />

      {/* Toast Feedback */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Main Container */}
      <main className="relative z-10 w-full max-w-[1380px] min-h-screen lg:min-h-0 lg:h-screen px-4 sm:px-8 lg:px-12 py-6 lg:py-4 flex items-center justify-center">
        {/* Desktop Two-Column Layout: 52% Left, 48% Right. No scroll on desktop */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-[52%_48%] gap-8 lg:gap-12 items-center my-auto">
          
          {/* Mobile Header branding (shown on smaller screens above login card) */}
          <div className="lg:hidden flex flex-col items-center text-center gap-3 pt-2">
            <BrandHeader />
            <PillBadge />
          </div>

          {/* LEFT COLUMN: BRANDING & FEATURES (Desktop view) */}
          <div className="hidden lg:flex flex-col justify-center gap-4 xl:gap-5">
            {/* Top Logo */}
            <div>
              <BrandHeader />
            </div>

            {/* Small Badge / Tagline */}
            <div>
              <PillBadge />
            </div>

            {/* Main Headline */}
            <div>
              <MainHeadline />
            </div>

            {/* Description */}
            <p className="text-zinc-400 text-sm xl:text-base leading-relaxed max-w-xl font-normal">
              Monitor how AI platforms mention your brand, discover competitor opportunities, optimize your content for AI search, and increase visibility where modern buyers search first.
            </p>

            {/* Feature Rows */}
            <FeatureList />

            {/* Statistics Horizontal Container */}
            <div className="pt-1">
              <StatsCard />
            </div>
          </div>

          {/* RIGHT COLUMN: LOGIN CARD */}
          <div className="flex items-center justify-center w-full my-auto">
            <LoginCard
              onLoginSubmit={handleLoginSubmit}
              onOpenForgotPassword={() => setIsForgotOpen(true)}
              onOpenSignUp={() => setIsSignUpOpen(true)}
              onGoogleLogin={handleGoogleLogin}
              isLoading={isLoading}
            />
          </div>

          {/* MOBILE MARKETING & FEATURES (Shown below login card on mobile viewports) */}
          <div className="lg:hidden flex flex-col gap-6 pt-2 pb-6">
            <div className="text-center">
              <MainHeadline />
              <p className="text-zinc-400 text-sm leading-relaxed mt-3 max-w-md mx-auto">
                Monitor how AI platforms mention your brand, discover competitor opportunities, optimize your content for AI search, and increase visibility where modern buyers search first.
              </p>
            </div>

            <FeatureList />

            <div className="pt-1">
              <StatsCard />
            </div>
          </div>

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
