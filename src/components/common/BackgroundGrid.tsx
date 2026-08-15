import React from 'react';

export const BackgroundGrid: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#050505]">
      {/* Dark background base */}
      <div className="absolute inset-0 bg-[#050505]" />
      
      {/* Cyber Grid Pattern */}
      <div className="absolute inset-0 bg-cyber-grid opacity-60" />
      
      {/* Ambient Red Glows */}
      <div className="absolute -top-32 -left-32 w-[550px] h-[550px] bg-red-600/15 rounded-full blur-[140px] animate-pulse" />
      <div className="absolute top-1/2 left-1/4 w-[400px] h-[400px] bg-red-700/10 rounded-full blur-[120px]" />
      <div className="absolute -bottom-20 -right-20 w-[600px] h-[600px] bg-red-600/15 rounded-full blur-[160px] animate-pulse" />
      
      {/* Subtle vignette border gradient */}
      <div className="absolute inset-0 bg-radial-vignette opacity-80" />
    </div>
  );
};
