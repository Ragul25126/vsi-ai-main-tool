import React from 'react';

export const PillBadge: React.FC = () => {
  return (
    <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#0F1219]/90 border border-[#FF5500]/40 shadow-[0_0_20px_rgba(255,85,0,0.25)] text-zinc-200 backdrop-blur-md">
      {/* Glowing orange circular dot indicator matching Image 2 */}
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF5500] opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF5500] shadow-[0_0_10px_#FF5500]"></span>
      </span>

      {/* Uppercase text with monospace letter-spacing */}
      <span className="text-[11px] font-mono font-medium tracking-[0.15em] text-zinc-200 uppercase">
        VALGROW SEARCH INTELLIGENCE <span className="text-[#FF5500] mx-1">•</span> GEO PLATFORM
      </span>
    </div>
  );
};

