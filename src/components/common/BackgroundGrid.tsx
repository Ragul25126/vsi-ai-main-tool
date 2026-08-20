import React from 'react';

export const BackgroundGrid: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#07090E]">
      {/* Dark obsidian background base matching Image 2 */}
      <div className="absolute inset-0 bg-[#07090E]" />
      
      {/* Cyber Grid Pattern */}
      <div className="absolute inset-0 bg-cyber-grid opacity-50" />
      
      {/* Ambient Electric Orange Glows matching Image 2 */}
      <div className="absolute -top-32 -left-32 w-[550px] h-[550px] bg-[#FF5500]/20 rounded-full blur-[140px]" />
      <div className="absolute top-1/2 left-1/4 w-[400px] h-[400px] bg-[#FF7700]/15 rounded-full blur-[120px]" />
      <div className="absolute -bottom-20 -right-20 w-[600px] h-[600px] bg-[#FF4400]/20 rounded-full blur-[160px]" />
      
      {/* Subtle vignette border gradient */}
      <div className="absolute inset-0 bg-radial-vignette opacity-80" />
    </div>
  );
};

