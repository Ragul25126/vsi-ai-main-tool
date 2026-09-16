"use client";

import React from "react";

export default function AISearchIllustration({ className = "w-32 h-28" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 160 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Background Soft Glow */}
      <circle cx="85" cy="58" r="52" fill="#E0F2FE" fillOpacity="0.45" />

      {/* Main Search Query Card */}
      <rect x="16" y="24" width="86" height="52" rx="8" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" />
      {/* Search Input Bar Mock */}
      <rect x="23" y="32" width="72" height="10" rx="5" fill="#F1F5F9" stroke="#E2E8F0" strokeWidth="1" />
      <circle cx="28" cy="37" r="2.5" fill="#94A3B8" />
      <rect x="34" y="35.5" width="30" height="3" rx="1.5" fill="#94A3B8" />

      {/* Search results snippet lines */}
      <rect x="23" y="49" width="48" height="4" rx="2" fill="#3B82F6" fillOpacity="0.8" />
      <rect x="23" y="57" width="65" height="3" rx="1.5" fill="#E2E8F0" />
      <rect x="23" y="63" width="50" height="3" rx="1.5" fill="#F1F5F9" />

      {/* AI Overview Floating Dialog Card */}
      <rect x="80" y="52" width="68" height="52" rx="8" fill="#FFFFFF" stroke="#BAE6FD" strokeWidth="1.5" />
      <rect x="80" y="52" width="68" height="15" rx="8" fill="#F0F9FF" />
      <path d="M80 67H148" stroke="#E0F2FE" strokeWidth="1" />

      {/* AI Badge header */}
      <circle cx="89" cy="60" r="3" fill="#0284C7" />
      <rect x="96" y="58.5" width="32" height="3" rx="1.5" fill="#0284C7" />

      {/* Direct Quote Content */}
      <rect x="87" y="73" width="50" height="3" rx="1.5" fill="#334155" />
      <rect x="87" y="79" width="44" height="3" rx="1.5" fill="#64748B" />
      <rect x="87" y="85" width="38" height="3" rx="1.5" fill="#94A3B8" />

      {/* Citation tag pill */}
      <rect x="87" y="93" width="28" height="6" rx="3" fill="#FF5A1F" fillOpacity="0.15" />
      <rect x="91" y="94.5" width="18" height="3" rx="1.5" fill="#FF5A1F" />

      {/* AI Sparkles */}
      <path d="M125 24L127 19L129 24L134 26L129 28L127 33L125 28L120 26L125 24Z" fill="#FF5A1F" />
      <circle cx="140" cy="40" r="2.5" fill="#38BDF8" />
    </svg>
  );
}
