"use client";

import React, { useState, useRef, useEffect, useTransition } from "react";
import {
  Settings, Moon, Sun, Save, CheckCircle2, Building2,
  Upload, X, ImageIcon, AlertCircle, Loader2
} from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { useRouter } from "next/navigation";
import Image from "next/image";

/* ─── Storage keys ──────────────────────────────────────────────────── */
const LOGO_LS_KEY   = "searchintel_agency_logo";
const NAME_LS_KEY   = "searchintel_agency_name";
const EMAIL_LS_KEY  = "searchintel_agency_email";

/* Cookie names (readable server-side by dynamicSession in auth.ts) */
const COOKIE_DISPLAY_NAME = "vsi_agency_display_name";
const COOKIE_EMAIL        = "vsi_agency_email";
const COOKIE_LOGO_MARKER  = "vsi_agency_logo_marker";

const MAX_AGE_30_DAYS = 2592000; // seconds

/* ─── Validation ────────────────────────────────────────────────────── */
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

/* ─── Helpers ───────────────────────────────────────────────────────── */

/** Write a cookie that persists 30 days — survives refresh + re-login */
function setCookie(name: string, value: string) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${MAX_AGE_30_DAYS}; SameSite=Lax`;
}

/** Remove a cookie */
function deleteCookie(name: string) {
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
}

/** Compress image via Canvas to ≤400px / JPEG 0.75 — keeps localStorage safe */
function compressImage(dataUrl: string, maxDim = 400, quality = 0.75): Promise<string> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => {
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
      const w = Math.round(img.width * scale);
      const h = Math.round(img.height * scale);
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      canvas.getContext("2d")!.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL("image/jpeg", quality));
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
}

/* ─── Component ─────────────────────────────────────────────────────── */

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  /* Agency Profile state */
  const [agencyName,    setAgencyName]    = useState("ValGrow Intelligence");
  const [contactEmail,  setContactEmail]  = useState("agency@valgrow.com");
  const [logoDataUrl,   setLogoDataUrl]   = useState<string | null>(null);

  /* UI feedback state */
  const [logoError, setLogoError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving,    setSaving]    = useState(false);
  const [saved,     setSaved]     = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ── Hydrate from localStorage + cookies on mount ─────────────────── */
  useEffect(() => {
    try {
      const storedLogo  = localStorage.getItem(LOGO_LS_KEY);
      const storedName  = localStorage.getItem(NAME_LS_KEY);
      const storedEmail = localStorage.getItem(EMAIL_LS_KEY);
      if (storedLogo)  setLogoDataUrl(storedLogo);
      if (storedName)  setAgencyName(storedName);
      if (storedEmail) setContactEmail(storedEmail);
    } catch { /* ignore */ }
  }, []);

  /* ── File pick & validate ─────────────────────────────────────────── */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLogoError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setLogoError("Please upload PNG, JPG, JPEG, WEBP, or SVG image.");
      e.target.value = "";
      return;
    }
    if (file.size > MAX_SIZE_BYTES) {
      setLogoError("Logo size must be less than 5 MB.");
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = async (ev) => {
      const raw = ev.target?.result as string;
      const final = file.type === "image/svg+xml"
        ? raw
        : await compressImage(raw);
      setLogoDataUrl(final);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleRemoveLogo = () => {
    setLogoDataUrl(null);
    setLogoError(null);
  };

  /* ── Save Preferences ─────────────────────────────────────────────── */
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return; // prevent duplicate submissions

    setSaving(true);
    setSaveError(null);
    setSaved(false);

    try {
      /* 1. Persist branding to localStorage ─────────────────────────── */
      if (logoDataUrl) {
        localStorage.setItem(LOGO_LS_KEY, logoDataUrl);
      } else {
        localStorage.removeItem(LOGO_LS_KEY);
      }
      localStorage.setItem(NAME_LS_KEY,  agencyName);
      localStorage.setItem(EMAIL_LS_KEY, contactEmail);

      /* 2. Write cookies so server-side dynamicSession() picks them up ─
         These survive page refresh, navigation, and re-login (30 days). */
      if (agencyName.trim()) {
        setCookie(COOKIE_DISPLAY_NAME, agencyName.trim());
      } else {
        deleteCookie(COOKIE_DISPLAY_NAME);
      }
      if (contactEmail.trim()) {
        setCookie(COOKIE_EMAIL, contactEmail.trim());
      } else {
        deleteCookie(COOKIE_EMAIL);
      }
      if (logoDataUrl) {
        // We store "__local__" as the marker so the server knows a logo exists
        // (the actual image is in localStorage for the client-side Sidebar).
        setCookie(COOKIE_LOGO_MARKER, "__local__");
      } else {
        deleteCookie(COOKIE_LOGO_MARKER);
      }

      /* 3. Optimistically notify client components (Sidebar localStorage read) */
      window.dispatchEvent(new Event("storage"));

      /* 4. Try the real API (works when Supabase is configured) ────────
         Falls through gracefully if dummy/unconfigured. */
      try {
        const res = await fetch("/api/agency/settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            display_name:  agencyName.trim()  || null,
            support_email: contactEmail.trim() || null,
            logo_url: null, // logo stored in localStorage; URL-based upload needs Supabase Storage
          }),
        });
        // Non-ok response from dummy Supabase is expected — don't throw
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          // Only surface real errors (not dummy-Supabase connection errors)
          if (data?.error && !data.error.includes("dummy") && !data.error.includes("Failed to fetch")) {
            console.warn("Agency settings API:", data.error);
          }
        }
      } catch {
        // Network/API failure — cookie persistence still works fine
      }

      /* 5. Re-run the Next.js server layout so Sidebar gets new agencyName
         from the updated cookies — same pattern used by AgencySettingsForm,
         ClientSettingsForm, and every other form in this codebase. */
      startTransition(() => {
        router.refresh();
      });

      setSaved(true);
      setTimeout(() => setSaved(false), 4000);

    } catch (err) {
      const msg = err instanceof Error ? err.message : "Save failed";
      if (msg.toLowerCase().includes("quota")) {
        setSaveError("Logo is too large to save locally. Try a smaller image (under 500 KB).");
      } else {
        setSaveError("Failed to save preferences. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  };

  const isBusy = saving || isPending;

  /* ── Render ───────────────────────────────────────────────────────── */
  return (
    <div className="p-4 sm:p-8 space-y-8 max-w-[1200px] mx-auto font-sans">

      {/* Header */}
      <div className="pb-6 border-b border-border">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight flex items-center gap-3">
          <Settings className="text-primary" size={28} />
          <span>Account &amp; Platform Settings</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your theme appearance, agency branding, and security credentials.
        </p>
      </div>

      {/* Success banner */}
      {saved && (
        <div className="rounded-[20px] bg-[#22C55E]/10 border border-[#22C55E]/20 p-3.5 flex items-center gap-2 text-[#22C55E] text-xs font-medium">
          <CheckCircle2 size={16} />
          <span>Preferences saved successfully.</span>
        </div>
      )}

      {/* Error banner */}
      {saveError && (
        <div className="rounded-[20px] bg-red-500/10 border border-red-500/20 p-3.5 flex items-center gap-2 text-red-500 text-xs font-medium">
          <AlertCircle size={16} />
          <span>{saveError}</span>
        </div>
      )}

      <form onSubmit={handleSaveSettings} className="space-y-8">

        {/* ── Interface Theme Section ────────────────────────────────── */}
        <div className="bg-card rounded-[24px] border border-border p-6 sm:p-7 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-border pb-4 flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500">
                <Sun size={20} />
              </div>
              <div>
                <h2 className="text-base font-bold text-foreground leading-tight">Interface Theme</h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Select your visual appearance preference across SearchIntel
                </p>
              </div>
            </div>
            <span className="text-[11px] font-bold px-3 py-1 rounded-full bg-muted-bg border border-border text-muted-foreground uppercase tracking-wider">
              {theme.toUpperCase()} MODE
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
            {/* Light */}
            <button
              type="button"
              onClick={() => setTheme("light")}
              className={`group relative p-5 rounded-[20px] border text-left flex flex-col justify-between transition-all duration-200 cursor-pointer ${
                theme === "light"
                  ? "bg-amber-500 border-amber-500 text-white shadow-lg shadow-amber-500/20 ring-2 ring-amber-500/30 scale-[1.01]"
                  : "bg-muted-bg/50 border-border text-foreground hover:border-amber-500/40 hover:bg-muted-bg"
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2.5 rounded-xl ${theme === "light" ? "bg-white/20 text-white" : "bg-card border border-border text-amber-500"}`}>
                  <Sun size={22} />
                </div>
                {theme === "light" && (
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-white/20 text-white tracking-wider">Active</span>
                )}
              </div>
              <div>
                <h3 className="text-sm font-bold tracking-tight">Light Mode</h3>
                <p className={`text-xs mt-0.5 font-medium ${theme === "light" ? "text-white/80" : "text-muted-foreground"}`}>
                  Clean light background interface
                </p>
              </div>
            </button>

            {/* Dark */}
            <button
              type="button"
              onClick={() => setTheme("dark")}
              className={`group relative p-5 rounded-[20px] border text-left flex flex-col justify-between transition-all duration-200 cursor-pointer ${
                theme === "dark"
                  ? "bg-amber-500 border-amber-500 text-white shadow-lg shadow-amber-500/20 ring-2 ring-amber-500/30 scale-[1.01]"
                  : "bg-muted-bg/50 border-border text-foreground hover:border-amber-500/40 hover:bg-muted-bg"
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-2.5 rounded-xl ${theme === "dark" ? "bg-white/20 text-white" : "bg-card border border-border text-amber-500"}`}>
                  <Moon size={22} />
                </div>
                {theme === "dark" && (
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-white/20 text-white tracking-wider">Active</span>
                )}
              </div>
              <div>
                <h3 className="text-sm font-bold tracking-tight">Dark Mode</h3>
                <p className={`text-xs mt-0.5 font-medium ${theme === "dark" ? "text-white/80" : "text-muted-foreground"}`}>
                  Sleek dark background interface
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* ── Agency Profile Section ─────────────────────────────────── */}
        <div className="bg-card rounded-[20px] border border-border p-6 shadow-xs space-y-5">
          <div className="flex items-center gap-3 border-b border-border pb-3">
            <Building2 size={20} className="text-primary" />
            <h2 className="text-base font-bold text-foreground">Agency Profile</h2>
          </div>

          {/* Company Logo */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-foreground">
              Company Logo
            </label>

            <div className="flex items-start gap-4 flex-wrap sm:flex-nowrap">
              {/* Preview */}
              <div className="w-[88px] h-[88px] rounded-[16px] border border-border bg-background flex items-center justify-center overflow-hidden shrink-0">
                {logoDataUrl ? (
                  <Image
                    src={logoDataUrl}
                    alt="Company Logo Preview"
                    width={88}
                    height={88}
                    className="w-full h-full object-contain"
                    unoptimized
                  />
                ) : (
                  <div className="flex flex-col items-center gap-1.5 text-muted-foreground">
                    <ImageIcon size={22} className="opacity-50" />
                    <span className="text-[9px] font-medium text-center leading-tight opacity-60">No logo</span>
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="flex flex-col justify-center gap-2.5 min-w-0">
                {!logoDataUrl ? (
                  <label className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted-bg/60 hover:border-amber-500/60 hover:bg-muted-bg text-foreground px-4 py-2 text-xs font-semibold cursor-pointer transition-colors w-fit">
                    <Upload size={13} className="text-primary shrink-0" />
                    <span>Choose Logo</span>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/svg+xml"
                      className="hidden"
                      onChange={handleFileChange}
                      disabled={isBusy}
                    />
                  </label>
                ) : (
                  <div className="flex items-center gap-2 flex-wrap">
                    <label className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted-bg/60 hover:border-amber-500/60 hover:bg-muted-bg text-foreground px-4 py-2 text-xs font-semibold cursor-pointer transition-colors w-fit">
                      <Upload size={13} className="text-primary shrink-0" />
                      <span>Change Logo</span>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/svg+xml"
                        className="hidden"
                        onChange={handleFileChange}
                        disabled={isBusy}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={handleRemoveLogo}
                      disabled={isBusy}
                      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted-bg/60 hover:border-red-500/50 hover:text-red-500 text-muted-foreground px-3 py-2 text-xs font-semibold transition-colors w-fit disabled:opacity-50"
                    >
                      <X size={12} className="shrink-0" />
                      <span>Remove</span>
                    </button>
                  </div>
                )}

                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  Upload company logo
                  <br />
                  PNG, JPG, JPEG, WEBP, SVG &bull; Max 5 MB
                </p>

                {logoError && (
                  <p className="text-[10px] text-red-500 font-medium">{logoError}</p>
                )}
              </div>
            </div>
          </div>

          {/* Agency Name + Contact Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Agency Display Name
              </label>
              <input
                type="text"
                value={agencyName}
                onChange={(e) => setAgencyName(e.target.value)}
                disabled={isBusy}
                className="w-full rounded-[20px] border border-border bg-background px-3.5 py-2 text-xs text-foreground focus:outline-none focus:border-amber-500 disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Primary Contact Email
              </label>
              <input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                disabled={isBusy}
                className="w-full rounded-[20px] border border-border bg-background px-3.5 py-2 text-xs text-foreground focus:outline-none focus:border-amber-500 disabled:opacity-60"
              />
            </div>
          </div>
        </div>

        {/* ── Save Button ────────────────────────────────────────────── */}
        <button
          type="submit"
          disabled={isBusy}
          className="flex items-center gap-2 rounded-full bg-amber-500 hover:bg-amber-600 disabled:opacity-60 disabled:cursor-not-allowed text-white px-5 py-2.5 text-xs font-bold shadow-sm transition-colors"
        >
          {isBusy ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <Save size={15} />
          )}
          <span>{isBusy ? "Saving…" : "Save Preferences"}</span>
        </button>

      </form>
    </div>
  );
}
