"use client";

import React from "react";

export default function ContentIllustration({ className = "w-32 h-28" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 160 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Soft Glow */}
      <circle cx="80" cy="60" r="50" fill="#F3E8FF" fillOpacity="0.4" />

      {/* Main Document Mockup */}
      <rect x="36" y="16" width="70" height="88" rx="8" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" />
      
      {/* Header Bar */}
      <rect x="46" y="28" width="34" height="6" rx="3" fill="#8B5CF6" />
      <rect x="46" y="38" width="50" height="3" rx="1.5" fill="#E2E8F0" />
      <rect x="46" y="44" width="46" height="3" rx="1.5" fill="#F1F5F9" />

      {/* Secondary Section Heading */}
      <rect x="46" y="54" width="26" height="5" rx="2.5" fill="#A855F7" fillOpacity="0.8" />
      <rect x="46" y="63" width="50" height="3" rx="1.5" fill="#E2E8F0" />
      <rect x="46" y="69" width="42" height="3" rx="1.5" fill="#F1F5F9" />

      {/* Highlighted Quote Callout Box in Document */}
      <rect x="44" y="77" width="54" height="16" rx="4" fill="#F5F3FF" stroke="#DDD6FE" strokeWidth="1" />
      <path d="M44 77V93" stroke="#8B5CF6" strokeWidth="3" strokeLinecap="round" />
      <rect x="50" y="81" width="38" height="3" rx="1.5" fill="#8B5CF6" fillOpacity="0.7" />
      <rect x="50" y="87" width="30" height="2.5" rx="1" fill="#C4B5FD" />

      {/* Floating Edit / Structure Badge */}
      <g transform="translate(94, 62)">
        <rect x="0" y="0" width="36" height="36" rx="10" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.5" />
        <rect x="6" y="6" width="24" height="24" rx="6" fill="#8B5CF6" fillOpacity="0.1" />
        {/* Document Structure Icon */}
        <path d="M12 14H24M12 18H20M12 22H22" stroke="#8B5CF6" strokeWidth="1.8" strokeLinecap="round" />
      </g>
    </svg>
  );
}
