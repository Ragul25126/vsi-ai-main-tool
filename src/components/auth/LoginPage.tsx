"use client";

import React, { useState, useEffect } from 'react';
import { FullScreenSignup, type AuthMode } from '@/components/ui/full-screen-signup';
import { Toast } from '../common/Toast';
import type { ToastMessage, UserProfile } from '@/types/login';
import { setClientSession, isAuthenticatedClient, markJustSignedIn, clearClientSession } from '@/lib/auth-client';
import { createClient } from '@/lib/supabase/client';
import { signUpWithEmail, type SignupInput } from '@/lib/signup';

// Display name when the account has no full name: the part of the email before the "@".
const nameFromEmail = (email: string) => {
  const local = email.split('@')[0] ?? '';
  return local ? local.charAt(0).toUpperCase() + local.slice(1) : 'User';
};

export const LoginPage: React.FC<{ initialMode?: AuthMode }> = ({ initialMode = 'signin' }) => {
  const [isLoading, setIsLoading] = useState(false);
  // Set when an account was created but must be confirmed from the email first.
  const [confirmationEmail, setConfirmationEmail] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [authError, setAuthError] = useState<string>('');

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const hasRedirectParam = params.has("redirect");

    if (isAuthenticatedClient() && !hasRedirectParam) {
      window.location.href = "/dashboard";
      return;
    }

    if (!isAuthenticatedClient()) {
      clearClientSession();
    }

    const errorParam = params.get("error");
    if (errorParam === "google_unavailable") {
      setAuthError("Google sign-in isn't available. Sign in with your email and password.");
    } else if (errorParam === "auth_callback_error") {
      setAuthError("Authentication failed. Please try again.");
    }
  }, []);

  const completeAuthentication = (user: UserProfile, target?: string) => {
    setClientSession(user);
    // Go straight to the next page. The dashboard shows the welcome message once it has loaded.
    markJustSignedIn();
    const params = new URLSearchParams(window.location.search);
    window.location.href = target || params.get("redirect") || "/dashboard";
  };

  const isPlaceholder = () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
    return !url || url.includes("dummy") || url.includes("your-project.supabase.co");
  };

  const handleSignupSubmit = async (input: SignupInput) => {
    if (isLoading) return;
    setAuthError('');
    setConfirmationEmail(null);

    if (isPlaceholder()) {
      setAuthError("Creating an account needs a configured Supabase project. Add your project URL and key to .env.local.");
      return;
    }

    setIsLoading(true);
    // The account comes from Supabase Auth; the profile row comes from the existing sign-up trigger.
    // The confirmation link comes back through /auth/callback. A new account has no organization, so
    // the dashboard sends it on to workspace setup. This exact URL must be in the Supabase project's
    // Auth redirect URL allow-list.
    const result = await signUpWithEmail(createClient(), input, `${window.location.origin}/auth/callback`);

    if (result.status === 'signed_in') {
      // Email confirmation is off: Supabase signed the user in. A new account has no organization
      // yet, so the next step is creating one.
      completeAuthentication(
        { name: result.fullName, email: result.email, role: 'Member', company: '', plan: '' },
        '/onboarding',
      );
      return;
    }
    if (result.status === 'confirm_email') {
      setConfirmationEmail(result.email);
    } else {
      setAuthError(result.message);
    }
    setIsLoading(false);
  };

  const handleLoginSubmit = async (email: string, password: string) => {
    if (isLoading) return;

    setIsLoading(true);
    setAuthError('');

    const cleanEmail = email.trim().toLowerCase();
    const isPlaceholderSupabase = isPlaceholder();

    try {
      const supabase = createClient();
      let { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: password,
      });

      // If lowercased email fails, attempt exact trimmed email in case of legacy account casing
      if (error && cleanEmail !== email.trim()) {
        const retry = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password,
        });
        if (!retry.error && retry.data?.session) {
          data = retry.data;
          error = null;
        }
      }

      if (!error && data?.session && data?.user) {
        const userProfile: UserProfile = {
          name: data.user.user_metadata?.full_name || nameFromEmail(data.user.email!),
          email: data.user.email!,
          role: 'Member',
          company: '',
          plan: '',
        };

        completeAuthentication(userProfile);
        return;
      }

      if (error) {
        console.error("[Login] Supabase Auth error:", error.message, error.status);
        if (error.message && !error.message.toLowerCase().includes("invalid login credentials")) {
          setAuthError(error.message);
        } else {
          setAuthError('Invalid email or password.');
        }
        setIsLoading(false);
        return;
      }
    } catch (e: any) {
      console.error("[Login] Exception during sign in:", e);
      if (e?.message) {
        setAuthError(e.message);
        setIsLoading(false);
        return;
      }
    }

    if (isPlaceholderSupabase) {
      const userProfile: UserProfile = {
        name: nameFromEmail(cleanEmail),
        email: cleanEmail,
        role: "Member",
        company: "",
        plan: "",
      };
      completeAuthentication(userProfile);
      return;
    }

    setAuthError('Invalid email or password.');
    setIsLoading(false);
  };

  return (
    <div className="relative min-h-screen w-full bg-surface text-ink overflow-hidden">
      {/* Toast Feedback */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Full Screen Signup/Login Component */}
      <div className="relative z-10 min-h-screen flex items-center justify-center">
        <FullScreenSignup
          onLoginSubmit={handleLoginSubmit}
          onSignupSubmit={handleSignupSubmit}
          confirmationEmail={confirmationEmail}
          initialMode={initialMode}
          isLoading={isLoading}
          authError={authError}
          clearAuthError={() => setAuthError('')}
        />
      </div>
    </div>
  );
};
