"use client";

import React from "react";

export default function AuditProcessIllustration({ className = "w-40 h-32" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Soft Glow */}
      <circle cx="100" cy="70" r="60" fill="#FFF7ED" fillOpacity="0.7" />

      {/* Main Browser Canvas */}
      <rect x="35" y="25" width="130" height="90" rx="12" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.8" />
      <rect x="35" y="25" width="130" height="18" rx="12" fill="#F8FAFC" />
      <path d="M35 43H165" stroke="#E2E8F0" strokeWidth="1.2" />
      <circle cx="47" cy="34" r="2.5" fill="#EF4444" />
      <circle cx="55" cy="34" r="2.5" fill="#F59E0B" />
      <circle cx="63" cy="34" r="2.5" fill="#10B981" />

      {/* Website Mock Blocks */}
      <rect x="48" y="54" width="48" height="6" rx="3" fill="#1E293B" />
      <rect x="48" y="65" width="70" height="4" rx="2" fill="#E2E8F0" />
      <rect x="48" y="73" width="60" height="4" rx="2" fill="#F1F5F9" />

      {/* Two Columns Layout Mock */}
      <rect x="48" y="84" width="42" height="20" rx="4" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1" />
      <rect x="96" y="84" width="42" height="20" rx="4" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1" />

      {/* Scanner Radar Beam / Lens */}
      <g transform="translate(115, 45)">
        <circle cx="28" cy="28" r="24" fill="#FF5A1F" fillOpacity="0.12" stroke="#FF5A1F" strokeWidth="1.5" />
        <circle cx="28" cy="28" r="14" fill="#FFFFFF" stroke="#FF5A1F" strokeWidth="2" />
        <path d="M38 38L52 52" stroke="#FF5A1F" strokeWidth="3" strokeLinecap="round" />
        <path d="M23 28H33M28 23V33" stroke="#FF5A1F" strokeWidth="1.8" strokeLinecap="round" />
      </g>

      {/* AI Citation Check Sparkles */}
      <circle cx="168" cy="30" r="3" fill="#FF5A1F" />
      <path d="M28 65L30 60L32 65L37 67L32 69L30 74L28 69L23 67L28 65Z" fill="#3B82F6" />
    </svg>
  );
}
