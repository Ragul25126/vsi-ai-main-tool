"use client";

import React from "react";

export default function DirectoryIllustration({ className = "w-32 h-28" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 160 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Soft Glow */}
      <circle cx="80" cy="60" r="50" fill="#FEF3C7" fillOpacity="0.45" />

      {/* Stylized Globe Wireframe Behind */}
      <circle cx="95" cy="55" r="32" stroke="#E2E8F0" strokeWidth="1.5" strokeDasharray="3 3" />
      <ellipse cx="95" cy="55" rx="32" ry="12" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="2 2" />
      <path d="M95 23V87" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="2 2" />

      {/* Main Business Profile Card */}
      <rect x="20" y="28" width="76" height="64" rx="8" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" />
      
      {/* Store/Building Badge */}
      <rect x="28" y="36" width="16" height="16" rx="4" fill="#FF5A1F" fillOpacity="0.1" stroke="#FF5A1F" strokeWidth="1" />
      <path d="M32 46V41L36 39L40 41V46H32Z" stroke="#FF5A1F" strokeWidth="1.2" />
      
      {/* Company Name & Details */}
      <rect x="49" y="38" width="38" height="4" rx="2" fill="#1E293B" />
      <rect x="49" y="46" width="28" height="3" rx="1.5" fill="#64748B" />

      {/* Directory Check Row 1 (e.g. G2) */}
      <rect x="28" y="59" width="60" height="9" rx="4" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="0.8" />
      <circle cx="34" cy="63.5" r="2.5" fill="#10B981" />
      <rect x="40" y="62" width="24" height="3" rx="1.5" fill="#94A3B8" />
      <path d="M78 63.5L81 65.5L85 61.5" stroke="#10B981" strokeWidth="1.2" strokeLinecap="round" />

      {/* Directory Check Row 2 (e.g. Crunchbase) */}
      <rect x="28" y="72" width="60" height="9" rx="4" fill="#F8FAFC" stroke="#FDE68A" strokeWidth="0.8" />
      <circle cx="34" cy="76.5" r="2.5" fill="#F59E0B" />
      <rect x="40" y="75" width="28" height="3" rx="1.5" fill="#94A3B8" />
      <circle cx="81" cy="76.5" r="3" fill="#F59E0B" fillOpacity="0.2" />
      <circle cx="81" cy="76.5" r="1" fill="#F59E0B" />

      {/* Map Pin Sync Badge */}
      <g transform="translate(112, 60)">
        <rect x="0" y="0" width="36" height="36" rx="18" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.5" />
        <path d="M18 10C14.7 10 12 12.7 12 16C12 20.5 18 26 18 26C18 26 24 20.5 24 16C24 12.7 21.3 10 18 10ZM18 18C16.9 18 16 17.1 16 16C16 14.9 16.9 14 18 14C19.1 14 20 14.9 20 16C20 17.1 19.1 18 18 18Z" fill="#FF5A1F" />
      </g>
    </svg>
  );
}
