import React from 'react';

export const MainHeadline: React.FC = () => {
  return (
    <h1 className="text-3xl sm:text-4xl lg:text-[44px] xl:text-[48px] font-extrabold text-white tracking-tight leading-[1.08] select-none">
      <span className="block text-white">Dominate AI Search</span>
      <span className="block text-white">Before Your</span>
      <span className="block text-gradient-red drop-shadow-[0_0_25px_rgba(255,43,43,0.35)]">
        Competitors Do
      </span>
    </h1>
  );
};
