import React from 'react';
import vgLogo from '../../assets/vg-logo.png';

export const BrandHeader: React.FC = () => {
  return (
    <div className="flex items-center gap-3.5 select-none">
      {/* Orange/Golden VG logo container matching Image 2 */}
      <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center shadow-[0_0_22px_rgba(255,85,0,0.45)] shrink-0 border border-[#FF5500]/60 p-0.5 overflow-hidden">
        <img
          src={typeof vgLogo === 'string' ? vgLogo : (vgLogo as { src: string }).src}
          alt="VG Logo"
          className="w-full h-full object-cover rounded-full"
        />
      </div>

      {/* Brand Text matching Image 2 */}
      <div className="flex flex-col justify-center text-left">
        <div className="flex items-center gap-1.5">
          <span className="text-white text-2xl font-black tracking-tight leading-none font-sans">
            SearchIntel
          </span>
          <span className="bg-[#FF5500] text-black font-extrabold px-1.5 py-0.5 rounded text-[10px] tracking-wider uppercase shadow-[0_0_10px_rgba(255,85,0,0.6)]">
            PRO
          </span>
        </div>
        <span className="text-[#FF8800] text-[10px] font-bold tracking-[0.22em] uppercase leading-tight font-sans mt-1">
          AI SEARCH INTELLIGENCE
        </span>
      </div>
    </div>
  );
};


