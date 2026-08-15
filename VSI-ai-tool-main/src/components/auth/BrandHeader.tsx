import React from 'react';
import Image from 'next/image';

export const BrandHeader: React.FC = () => {
  return (
    <div className="flex items-center gap-3.5 select-none">
      {/* Golden VG logo container */}
      <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-[0_0_20px_rgba(234,179,8,0.35)] shrink-0 border border-amber-300/40 p-0.5 overflow-hidden">
        <Image
          src="/logo.png"
          alt="VG Logo"
          width={48}
          height={48}
          className="w-full h-full object-cover rounded-full"
        />
      </div>

      {/* Brand Text */}
      <div className="flex flex-col justify-center text-left">
        <span className="text-white text-2xl font-black tracking-tight leading-none font-sans">
          VALGROW
        </span>
        <span className="text-amber-400/90 text-[10px] font-bold tracking-[0.24em] uppercase leading-tight font-sans mt-0.5">
          ENTERPRISE
        </span>
      </div>
    </div>
  );
};
