import React from 'react';

export const PillBadge: React.FC = () => {
  return (
    <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-zinc-950/80 border border-[#ef2b2b]/30 shadow-[0_0_15px_rgba(239,43,43,0.15)] text-zinc-300 backdrop-blur-md">
      {/* Glowing red circular dot indicator */}
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ff2b2b] opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ff2b2b] shadow-[0_0_8px_#ff2b2b]"></span>
      </span>

      {/* Uppercase text with monospace letter-spacing */}
      <span className="text-[11px] font-mono font-medium tracking-[0.15em] text-zinc-300 uppercase">
        VALGROW SEARCH INTELLIGENCE <span className="text-[#ef2b2b] mx-1">•</span> GEO PLATFORM
      </span>
    </div>
  );
};
