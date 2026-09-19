"use client";

import React, { useState, useRef, useEffect, useTransition } from "react";
import { ImageIcon, Loader2, Save, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Eyebrow, PageContainer, PageHeader, Section } from "@/components/ui/Page";
import { Notice } from "@/components/ui/Status";
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

  const field =
    "h-10 w-full rounded-control border border-line-strong bg-surface px-3 text-body text-ink placeholder:text-ink-3 focus:border-brand focus:outline-none disabled:opacity-60";

  return (
    <PageContainer>
      <PageHeader
        title="Settings"
        description="How your organization appears across VSI and in the reports you share."
        meta={<span>Only people in your organization can see these settings</span>}
      />

      {saved && (
        <Notice tone="positive" title="Settings saved">
          Your changes now apply across your workspace.
        </Notice>
      )}
      {saveError && <Notice tone="critical" title={saveError} />}

      <form onSubmit={handleSaveSettings} className="space-y-10">
        <Section title="Organization" description="Shown across your workspace, in reports and in messages to clients.">
          <div className="grid items-start gap-x-12 gap-y-8 border-t border-line pt-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,4fr)]">
            <div className="divide-y divide-line">
              {/* Name */}
              <div className="grid gap-x-8 gap-y-2 pb-6 sm:grid-cols-[12rem_minmax(0,1fr)]">
                <div>
                  <label htmlFor="org-name" className="text-body font-medium text-ink">
                    Display name
                  </label>
                  <p className="mt-0.5 text-support text-ink-3">Shown across VSI and in reports.</p>
                </div>
                <input
                  id="org-name"
                  type="text"
                  required
                  value={agencyName}
                  onChange={(e) => setAgencyName(e.target.value)}
                  disabled={isBusy}
                  className={field}
                  placeholder="For example: ValGrow Intelligence"
                />
              </div>

              {/* Email */}
              <div className="grid gap-x-8 gap-y-2 py-6 sm:grid-cols-[12rem_minmax(0,1fr)]">
                <div>
                  <label htmlFor="org-email" className="text-body font-medium text-ink">
                    Contact email
                  </label>
                  <p className="mt-0.5 text-support text-ink-3">Used for important notices.</p>
                </div>
                <input
                  id="org-email"
                  type="email"
                  required
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  disabled={isBusy}
                  className={field}
                  placeholder="For example: hello@yourcompany.com"
                />
              </div>

              {/* Logo */}
              <div className="grid gap-x-8 gap-y-3 pt-6 sm:grid-cols-[12rem_minmax(0,1fr)]">
                <div>
                  <p className="text-body font-medium text-ink">Logo</p>
                  <p className="mt-0.5 text-support text-ink-3">PNG, JPG, WEBP or SVG, up to 5 MB.</p>
                </div>
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-4 rounded-panel border border-dashed border-line-strong bg-surface p-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-control border border-line bg-surface-2 text-ink-3">
                      {logoDataUrl ? (
                        <Image src={logoDataUrl} alt="Your logo" width={52} height={52} className="h-full w-full object-contain p-1" unoptimized />
                      ) : (
                        <ImageIcon size={20} strokeWidth={1.6} aria-hidden />
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <label className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-control border border-line bg-surface px-3.5 text-body font-medium text-ink transition-colors hover:border-line-strong hover:bg-surface-2">
                        <Upload size={14} strokeWidth={1.75} aria-hidden />
                        {logoDataUrl ? "Change logo" : "Choose logo"}
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/png,image/jpeg,image/webp,image/svg+xml"
                          className="hidden"
                          onChange={handleFileChange}
                          disabled={isBusy}
                        />
                      </label>
                      {logoDataUrl && (
                        <button
                          type="button"
                          onClick={handleRemoveLogo}
                          disabled={isBusy}
                          className="inline-flex h-9 items-center gap-1.5 rounded-control px-3 text-body font-medium text-critical transition-colors hover:bg-critical-soft"
                        >
                          <X size={14} strokeWidth={1.75} aria-hidden />
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                  {logoError && (
                    <p role="alert" className="text-support text-critical">
                      {logoError}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Preview */}
            <figure className="rounded-panel bg-surface-2 p-5">
              <figcaption>
                <Eyebrow>Preview</Eyebrow>
                <p className="mt-1.5 text-support text-ink-3">How your organization appears in VSI.</p>
              </figcaption>
              <div className="mt-4 flex items-center gap-3.5 rounded-panel border border-line bg-surface p-4">
                {logoDataUrl ? (
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-control border border-line bg-surface p-1">
                    <Image src={logoDataUrl} alt="" width={44} height={44} className="h-full w-full object-contain" unoptimized />
                  </div>
                ) : (
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-control bg-brand-soft text-[1.0625rem] font-semibold text-brand-strong">
                    {initials}
                  </div>
                )}
                <div className="min-w-0">
                  <p className="truncate text-body font-semibold text-ink">{agencyName || "Your organization"}</p>
                  <p className="mt-0.5 truncate text-support text-ink-3">{contactEmail || "Contact email"}</p>
                </div>
              </div>
            </figure>
          </div>
        </Section>

        <div className="flex flex-wrap items-center gap-3 border-t border-line pt-6">
          <Button type="submit" variant="primary" disabled={isBusy}>
            {isBusy ? <Loader2 size={15} className="animate-spin" aria-hidden /> : <Save size={15} strokeWidth={1.75} aria-hidden />}
            {isBusy ? "Saving" : "Save changes"}
          </Button>
          <Button type="button" onClick={handleReset} disabled={isBusy}>
            Reset
          </Button>
          <p className="text-support text-ink-3">Changes apply across your workspace.</p>
        </div>
      </form>

      <Section title="Not available yet" description="These settings are planned. Nothing here can be changed today.">
        <ul className="divide-y divide-line border-y border-line">
          {["Appearance", "Password and sign-in", "Notification preferences"].map((label) => (
            <li key={label} className="flex items-center justify-between gap-4 py-3.5">
              <span className="text-body text-ink-2">{label}</span>
              <span className="text-caption text-ink-3">Coming soon</span>
            </li>
          ))}
        </ul>
      </Section>
    </PageContainer>
  );
}
