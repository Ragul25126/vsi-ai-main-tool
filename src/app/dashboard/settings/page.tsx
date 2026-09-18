"use client";

import React, { useState, useRef, useEffect, useTransition } from "react";
import {
  Settings,
  Save,
  CheckCircle2,
  Building2,
  Upload,
  X,
  ImageIcon,
  AlertCircle,
  Loader2,
  Shield,
  Mail,
  Eye,
  Sparkles,
  Palette,
  Lock,
  Bell,
  RefreshCw,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

/* ─── Storage keys ──────────────────────────────────────────────────── */
const LOGO_LS_KEY = "searchintel_agency_logo";
const NAME_LS_KEY = "searchintel_agency_name";
const EMAIL_LS_KEY = "searchintel_agency_email";

/* Cookie names (readable server-side by dynamicSession in auth.ts) */
const COOKIE_DISPLAY_NAME = "vsi_agency_display_name";
const COOKIE_EMAIL = "vsi_agency_email";
const COOKIE_LOGO_MARKER = "vsi_agency_logo_marker";

const MAX_AGE_30_DAYS = 2592000; // seconds

/* ─── Validation ────────────────────────────────────────────────────── */
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/svg+xml"];
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

/* ─── Helpers ───────────────────────────────────────────────────────── */
function setCookie(name: string, value: string) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${MAX_AGE_30_DAYS}; SameSite=Lax`;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
}

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

export default function SettingsPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  /* Agency Profile state */
  const [agencyName, setAgencyName] = useState("ValGrow Intelligence");
  const [contactEmail, setContactEmail] = useState("agency@valgrow.com");
  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);

  /* UI feedback state */
  const [logoError, setLogoError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ── Hydrate from localStorage + cookies on mount ─────────────────── */
  useEffect(() => {
    try {
      const storedLogo = localStorage.getItem(LOGO_LS_KEY);
      const storedName = localStorage.getItem(NAME_LS_KEY);
      const storedEmail = localStorage.getItem(EMAIL_LS_KEY);
      if (storedLogo) setLogoDataUrl(storedLogo);
      if (storedName) setAgencyName(storedName);
      if (storedEmail) setContactEmail(storedEmail);
    } catch {
      /* ignore */
    }
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
      const final = file.type === "image/svg+xml" ? raw : await compressImage(raw);
      setLogoDataUrl(final);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleRemoveLogo = () => {
    setLogoDataUrl(null);
    setLogoError(null);
  };

  const handleReset = () => {
    setAgencyName("ValGrow Intelligence");
    setContactEmail("agency@valgrow.com");
    setLogoDataUrl(null);
    setLogoError(null);
    setSaveError(null);
  };

  /* ── Save Preferences ─────────────────────────────────────────────── */
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving) return;

    setSaving(true);
    setSaveError(null);
    setSaved(false);

    try {
      if (logoDataUrl) {
        localStorage.setItem(LOGO_LS_KEY, logoDataUrl);
      } else {
        localStorage.removeItem(LOGO_LS_KEY);
      }
      localStorage.setItem(NAME_LS_KEY, agencyName);
      localStorage.setItem(EMAIL_LS_KEY, contactEmail);

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
        setCookie(COOKIE_LOGO_MARKER, "__local__");
      } else {
        deleteCookie(COOKIE_LOGO_MARKER);
      }

      window.dispatchEvent(new Event("storage"));

      try {
        const res = await fetch("/api/agency/settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            display_name: agencyName.trim() || null,
            support_email: contactEmail.trim() || null,
            logo_url: null,
          }),
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          if (data?.error && !data.error.includes("dummy") && !data.error.includes("Failed to fetch")) {
            console.warn("Agency settings API:", data.error);
          }
        }
      } catch {
        // graceful fallthrough
      }

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

  // Extract initials for preview
  const initials = agencyName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "VI";

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto font-sans bg-background min-h-screen animate-fadeIn">
      
      {/* ── 1. TOP HEADER & SECURITY BANNER ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        {/* Left: Gear Icon + Title + Subtitle */}
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-panel bg-orange-50 dark:bg-orange-950/40 text-brand-strong flex items-center justify-center shrink-0">
            <Settings size={24} className="stroke-[2.2]" />
          </div>
          <div className="space-y-0.5">
            <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-foreground tracking-tight">
              Account &amp; Platform Settings
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-muted-foreground font-medium">
              Manage your theme appearance, agency branding, and security credentials.
            </p>
          </div>
        </div>

        {/* Right: Security Badge Banner */}
        <div className="bg-[#FFF8F3] dark:bg-card border border-orange-100 dark:border-orange-900/40 rounded-panel px-4 py-2.5 flex items-center gap-3 shrink-0">
          <Shield size={18} className="text-brand-strong shrink-0 stroke-[2.2]" />
          <div>
            <p className="text-xs font-bold text-slate-900 dark:text-foreground leading-tight">
              Your information is secure
            </p>
            <p className="text-caption text-slate-500 dark:text-muted-foreground font-medium leading-tight mt-0.5">
              Only you can access these settings
            </p>
          </div>
        </div>

      </div>

      {/* Success Notification */}
      {saved && (
        <div className="rounded-panel bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/40 p-4 flex items-center gap-3 text-emerald-800 dark:text-emerald-300 text-xs font-bold animate-in fade-in">
          <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
          <span>Preferences saved successfully across your workspace.</span>
        </div>
      )}

      {/* Error Notification */}
      {saveError && (
        <div className="rounded-panel bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 p-4 flex items-center gap-3 text-rose-800 dark:text-rose-300 text-xs font-bold animate-in fade-in">
          <AlertCircle size={18} className="text-rose-600 shrink-0" />
          <span>{saveError}</span>
        </div>
      )}

      <form onSubmit={handleSaveSettings} className="space-y-6">

        {/* ── 2. AGENCY PROFILE MAIN CARD ── */}
        <div className="bg-white dark:bg-card border border-slate-200/80 dark:border-border/80 rounded-panel p-6 sm:p-8 space-y-6">
          
          {/* Card Section Header */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-panel bg-orange-50 dark:bg-orange-950/40 text-brand-strong flex items-center justify-center shrink-0">
              <Building2 size={20} className="stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-foreground">
                Agency Profile
              </h2>
              <p className="text-xs text-slate-500 dark:text-muted-foreground font-medium">
                This information will be used across your workspace, reports, and client communications.
              </p>
            </div>
          </div>

          {/* Form & Live Preview Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-2">
            
            {/* Left Form: Logo Upload + Inputs */}
            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
              
              {/* Company Logo Dropzone */}
              <div className="space-y-2">
                <div>
                  <label className="block text-xs font-bold text-slate-800 dark:text-foreground">
                    Company Logo
                  </label>
                  <p className="text-caption text-slate-500 dark:text-muted-foreground font-medium">
                    Upload your company logo
                  </p>
                </div>

                {/* Dashed Dropzone Container */}
                <div className="border-2 border-dashed border-slate-200 dark:border-border rounded-panel bg-slate-50/50 dark:bg-muted/20 p-6 flex flex-col items-center justify-center gap-3 text-center min-h-[170px]">
                  
                  {logoDataUrl ? (
                    <div className="space-y-3 flex flex-col items-center">
                      <div className="w-16 h-16 rounded-panel border border-slate-200 dark:border-border bg-white p-1.5 flex items-center justify-center overflow-hidden">
                        <Image
                          src={logoDataUrl}
                          alt="Agency Logo"
                          width={60}
                          height={60}
                          className="w-full h-full object-contain"
                          unoptimized
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="inline-flex items-center gap-1.5 rounded-panel border border-slate-200 bg-white dark:bg-card px-3 py-1.5 text-xs font-bold text-slate-800 dark:text-foreground hover:bg-slate-50 transition-colors cursor-pointer">
                          <Upload size={12} className="text-brand-strong" />
                          <span>Change</span>
                          <input
                            ref={fileInputRef}
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
                          className="inline-flex items-center gap-1 rounded-panel border border-slate-200 bg-white dark:bg-card px-2.5 py-1.5 text-xs font-bold text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
                        >
                          <X size={12} />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Orange Image Icon Circle */}
                      <div className="w-12 h-12 rounded-full bg-orange-100/70 dark:bg-orange-950/50 text-brand-strong flex items-center justify-center">
                        <ImageIcon size={22} className="stroke-[2.2]" />
                      </div>

                      <p className="text-xs text-slate-500 dark:text-muted-foreground font-medium max-w-[180px]">
                        Drag &amp; drop your logo here or click to browse
                      </p>

                      <label className="inline-flex items-center gap-1.5 px-4 py-2 rounded-panel bg-white dark:bg-card border border-slate-200 dark:border-border text-xs font-bold text-slate-800 dark:text-foreground hover:bg-slate-50 transition-colors cursor-pointer">
                        <Upload size={13} className="text-brand-strong" />
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
                    </>
                  )}

                </div>

                <p className="text-caption text-slate-400 dark:text-muted-foreground font-medium">
                  PNG, JPG, JPEG, WEBP, SVG • Max 5 MB
                </p>

                {logoError && (
                  <p className="text-caption text-rose-500 font-bold">{logoError}</p>
                )}
              </div>

              {/* Form Text Inputs */}
              <div className="space-y-4">
                
                {/* Agency Display Name */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-800 dark:text-foreground">
                    Agency Display Name <span className="text-[#EF4444]">*</span>
                  </label>
                  <div className="relative">
                    <Building2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={agencyName}
                      onChange={(e) => setAgencyName(e.target.value)}
                      disabled={isBusy}
                      className="w-full rounded-panel border border-slate-200 dark:border-border bg-slate-50/40 dark:bg-muted/40 pl-9 pr-3.5 py-2.5 text-xs font-semibold text-slate-900 dark:text-foreground placeholder:text-slate-400 focus:outline-none focus:border-line-strong"
                      placeholder="e.g. ValGrow Intelligence"
                    />
                  </div>
                  <p className="text-caption text-slate-400 dark:text-muted-foreground font-medium">
                    This will be shown across the platform and in reports.
                  </p>
                </div>

                {/* Primary Contact Email */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-800 dark:text-foreground">
                    Primary Contact Email <span className="text-[#EF4444]">*</span>
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      disabled={isBusy}
                      className="w-full rounded-panel border border-slate-200 dark:border-border bg-slate-50/40 dark:bg-muted/40 pl-9 pr-3.5 py-2.5 text-xs font-semibold text-slate-900 dark:text-foreground placeholder:text-slate-400 focus:outline-none focus:border-line-strong"
                      placeholder="e.g. agency@valgrow.com"
                    />
                  </div>
                  <p className="text-caption text-slate-400 dark:text-muted-foreground font-medium">
                    We&apos;ll use this for important notifications.
                  </p>
                </div>

              </div>

            </div>

            {/* Right Live Preview Card */}
            <div className="lg:col-span-4 bg-[#FFF9F5] dark:bg-card border border-orange-100/80 dark:border-orange-900/40 rounded-panel p-5 space-y-4">
              
              {/* Preview Header */}
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-orange-100/70 dark:bg-orange-950/50 text-brand-strong flex items-center justify-center shrink-0">
                  <Eye size={15} className="stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-foreground">
                    Preview
                  </h3>
                  <p className="text-caption text-slate-500 dark:text-muted-foreground font-medium">
                    How your brand will appear in the platform.
                  </p>
                </div>
              </div>

              {/* White Preview Pill Card */}
              <div className="bg-white dark:bg-card border border-slate-200/80 dark:border-border rounded-panel p-4 flex items-center gap-3.5">
                {logoDataUrl ? (
                  <div className="w-14 h-14 rounded-panel border border-slate-200 bg-white p-1 flex items-center justify-center overflow-hidden shrink-0">
                    <Image
                      src={logoDataUrl}
                      alt="Brand Logo"
                      width={52}
                      height={52}
                      className="w-full h-full object-contain"
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="w-14 h-14 rounded-panel bg-[#FFF0E6] text-brand-strong font-semibold text-xl flex items-center justify-center shrink-0 tracking-tight">
                    {initials}
                  </div>
                )}
                <div className="min-w-0">
                  <h4 className="font-semibold text-sm sm:text-base text-slate-900 dark:text-foreground truncate tracking-tight">
                    {agencyName || "ValGrow Intelligence"}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-muted-foreground font-medium truncate mt-0.5">
                    {contactEmail || "agency@valgrow.com"}
                  </p>
                </div>
              </div>

              {/* Tip Callout Banner */}
              <div className="bg-[#FFF3EB] dark:bg-orange-950/30 border border-[#FFE4D3] dark:border-orange-900/40 rounded-panel p-3.5 flex items-center gap-2.5">
                <span className="text-brand-strong text-sm">✦</span>
                <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                  A professional brand makes your reports look more credible.
                </p>
              </div>

            </div>

          </div>

        </div>

        {/* ── 3. OTHER SETTINGS ROW (COMING SOON PREFERENCES) ── */}
        <div className="bg-white dark:bg-card border border-slate-200/80 dark:border-border/80 rounded-panel p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          
          {/* Left Title */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-panel bg-slate-100 dark:bg-muted text-slate-600 dark:text-slate-400 flex items-center justify-center shrink-0">
              <Settings size={18} />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-slate-900 dark:text-foreground">
                Other Settings
              </h3>
              <p className="text-xs text-slate-500 dark:text-muted-foreground font-medium">
                Manage your platform preferences (coming soon).
              </p>
            </div>
          </div>

          {/* Right 3 Coming Soon Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full lg:w-auto">
            
            {/* Card 1: Theme Appearance */}
            <div className="bg-slate-50/60 dark:bg-muted/30 border border-slate-100 dark:border-border rounded-panel p-3 flex items-center gap-3 min-w-[160px]">
              <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <Palette size={16} />
              </div>
              <div>
                <p className="font-bold text-xs text-slate-800 dark:text-foreground leading-tight">
                  Theme Appearance
                </p>
                <span className="text-caption font-bold text-blue-500">
                  Coming soon
                </span>
              </div>
            </div>

            {/* Card 2: Security Credentials */}
            <div className="bg-slate-50/60 dark:bg-muted/30 border border-slate-100 dark:border-border rounded-panel p-3 flex items-center gap-3 min-w-[160px]">
              <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <Lock size={16} />
              </div>
              <div>
                <p className="font-bold text-xs text-slate-800 dark:text-foreground leading-tight">
                  Security Credentials
                </p>
                <span className="text-caption font-bold text-blue-500">
                  Coming soon
                </span>
              </div>
            </div>

            {/* Card 3: Notification Preferences */}
            <div className="bg-slate-50/60 dark:bg-muted/30 border border-slate-100 dark:border-border rounded-panel p-3 flex items-center gap-3 min-w-[160px]">
              <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <Bell size={16} />
              </div>
              <div>
                <p className="font-bold text-xs text-slate-800 dark:text-foreground leading-tight">
                  Notification Preferences
                </p>
                <span className="text-caption font-bold text-blue-500">
                  Coming soon
                </span>
              </div>
            </div>

          </div>

        </div>

        {/* ── 4. ACTION FOOTER ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
          
          {/* Left Buttons: Save & Reset */}
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={isBusy}
              className="flex items-center gap-2 px-6 py-2.5 rounded-panel bg-ink hover:bg-[#E04B14] disabled:opacity-60 disabled:cursor-not-allowed text-white text-xs font-semibold transition-all cursor-pointer"
            >
              {isBusy ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Saving…</span>
                </>
              ) : (
                <>
                  <Save size={14} className="stroke-[2.5]" />
                  <span>Save Preferences</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleReset}
              disabled={isBusy}
              className="px-5 py-2.5 rounded-panel bg-white dark:bg-card border border-slate-200 dark:border-border text-xs font-bold text-slate-700 dark:text-foreground hover:bg-slate-50 dark:hover:bg-muted transition-colors cursor-pointer"
            >
              Reset Changes
            </button>
          </div>

          {/* Right Disclaimer */}
          <p className="text-xs text-slate-500 dark:text-muted-foreground font-medium">
            Changes will be applied across your workspace.
          </p>

        </div>

      </form>
    </div>
  );
}
