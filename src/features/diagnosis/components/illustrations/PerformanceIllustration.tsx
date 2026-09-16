"use client";

import React from "react";

export default function PerformanceIllustration({ className = "w-32 h-28" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 160 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Soft Glow */}
      <circle cx="80" cy="60" r="50" fill="#ECFDF5" fillOpacity="0.45" />

      {/* Browser Window Behind */}
      <rect x="20" y="24" width="76" height="58" rx="8" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" />
      <rect x="20" y="24" width="76" height="13" rx="8" fill="#F8FAFC" />
      <path d="M20 37H96" stroke="#E2E8F0" strokeWidth="1" />
      <circle cx="27" cy="30.5" r="2" fill="#EF4444" />
      <circle cx="33" cy="30.5" r="2" fill="#F59E0B" />
      <circle cx="39" cy="30.5" r="2" fill="#10B981" />

      <rect x="28" y="44" width="34" height="4" rx="2" fill="#E2E8F0" />
      <rect x="28" y="52" width="52" height="3" rx="1.5" fill="#F1F5F9" />
      <rect x="28" y="58" width="40" height="3" rx="1.5" fill="#F1F5F9" />

      {/* Speedometer Gauge Dial in Foreground */}
      <g transform="translate(74, 46)">
        <rect x="0" y="0" width="70" height="58" rx="12" fill="#FFFFFF" stroke="#A7F3D0" strokeWidth="1.5" />
        
        {/* Gauge Arc */}
        <path
          d="M18 42 A 18 18 0 1 1 52 42"
          fill="none"
          stroke="#E2E8F0"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M18 42 A 18 18 0 0 1 45 23"
          fill="none"
          stroke="#10B981"
          strokeWidth="4"
          strokeLinecap="round"
        />
        
        {/* Center needle */}
        <circle cx="35" cy="40" r="3" fill="#047857" />
        <path d="M35 40L42 27" stroke="#047857" strokeWidth="2" strokeLinecap="round" />

        {/* Speed text badge */}
        <rect x="23" y="46" width="24" height="6" rx="3" fill="#ECFDF5" />
        <rect x="26" y="48" width="18" height="2" rx="1" fill="#059669" />
      </g>

      {/* Fast Lightning Accent */}
      <path d="M125 18L120 28H126L122 38L132 26H126L129 18H125Z" fill="#F59E0B" />
    </svg>
  );
}
