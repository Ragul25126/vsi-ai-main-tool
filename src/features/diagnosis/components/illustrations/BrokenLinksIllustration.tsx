"use client";

import React from "react";

export default function BrokenLinksIllustration({ className = "w-32 h-28" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 160 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Background Soft Glow */}
      <circle cx="80" cy="60" r="50" fill="#FEE2E2" fillOpacity="0.4" />

      {/* Main Browser Window */}
      <rect x="18" y="18" width="80" height="60" rx="8" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" />
      <rect x="18" y="18" width="80" height="14" rx="8" fill="#F8FAFC" />
      <path d="M18 32H98" stroke="#E2E8F0" strokeWidth="1" />
      <circle cx="26" cy="25" r="2" fill="#EF4444" />
      <circle cx="33" cy="25" r="2" fill="#F59E0B" />
      <circle cx="40" cy="25" r="2" fill="#10B981" />

      {/* Content lines in browser */}
      <rect x="26" y="39" width="36" height="4" rx="2" fill="#E2E8F0" />
      <rect x="26" y="48" width="54" height="3" rx="1.5" fill="#F1F5F9" />
      <rect x="26" y="55" width="44" height="3" rx="1.5" fill="#F1F5F9" />

      {/* Connected Nodes Pathway */}
      <path
        d="M80 65 L108 82"
        stroke="#EF4444"
        strokeWidth="2"
        strokeDasharray="3 3"
      />

      {/* Target Broken Page Node */}
      <rect x="100" y="70" width="46" height="38" rx="6" fill="#FFFFFF" stroke="#FCA5A5" strokeWidth="1.5" />
      <rect x="106" y="77" width="22" height="3" rx="1.5" fill="#FEE2E2" />
      <rect x="106" y="84" width="30" height="2.5" rx="1" fill="#F3F4F6" />

      {/* Broken Chain Link Icon */}
      <g transform="translate(86, 68)">
        <circle cx="10" cy="10" r="10" fill="#EF4444" />
        <path d="M7 10H13M10 7L10 13" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" transform="rotate(45 10 10)" />
      </g>

      {/* Subtle Link Particle */}
      <circle cx="132" cy="30" r="4" fill="#FF5A1F" fillOpacity="0.2" />
      <circle cx="136" cy="45" r="2" fill="#EF4444" fillOpacity="0.4" />
    </svg>
  );
}
