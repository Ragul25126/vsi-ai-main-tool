"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, X } from "lucide-react";
import { consumeJustSignedIn } from "@/lib/auth-client";

const VISIBLE_MS = 4000;

/**
 * Greets the user once after sign-in. It lives in the dashboard layout, which renders only
 * for a verified session, and it mounts after the page is on screen, so it never holds up
 * navigation or rendering.
 */
export default function WelcomeToast() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Browser-only, one-time read of the sign-in marker.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (consumeJustSignedIn()) setVisible(true);
  }, []);

  useEffect(() => {
    if (!visible) return;
    const timer = setTimeout(() => setVisible(false), VISIBLE_MS);
    return () => clearTimeout(timer);
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-4 top-28 z-[9999] flex justify-center md:inset-x-auto md:right-6"
    >
      <div className="pointer-events-auto flex animate-fade-in items-center gap-3 rounded-panel border border-positive bg-positive px-4 py-3.5 text-body font-semibold text-white shadow-overlay">
        <CheckCircle2 size={18} className="shrink-0" />
        <span>Welcome back to VSI AI Suite!</span>
        <button
          type="button"
          onClick={() => setVisible(false)}
          className="ml-1 cursor-pointer opacity-80 transition-opacity hover:opacity-100"
          aria-label="Dismiss"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
