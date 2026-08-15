import React from 'react';
import { Target, TrendingUp, ShieldCheck } from 'lucide-react';

interface FeatureItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureRow: React.FC<FeatureItemProps> = ({ icon, title, description }) => {
  return (
    <div className="flex items-center gap-4 group">
      {/* Icon Container: Dark red/black gradient, thin red border, rounded corners, red glowing icon */}
      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-red-950/80 via-zinc-950 to-black border border-[#ef2b2b]/40 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(239,43,43,0.2)] group-hover:border-[#ff2b2b] group-hover:shadow-[0_0_22px_rgba(255,43,43,0.45)] transition-all duration-300">
        <div className="text-[#ff2b2b] drop-shadow-[0_0_8px_rgba(255,43,43,0.8)]">
          {icon}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col justify-center text-left">
        <h3 className="text-white font-semibold text-sm sm:text-base leading-snug group-hover:text-red-100 transition-colors">
          {title}
        </h3>
        <p className="text-zinc-400 text-xs sm:text-sm font-normal leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
};

export const FeatureList: React.FC = () => {
  return (
    <div className="flex flex-col gap-4 py-1">
      <FeatureRow
        icon={<Target className="w-5 h-5" />}
        title="Track AI Mentions"
        description="Monitor brand mentions across leading AI platforms"
      />
      <FeatureRow
        icon={<TrendingUp className="w-5 h-5" />}
        title="Discover Opportunities"
        description="Uncover competitor gaps and content opportunities"
      />
      <FeatureRow
        icon={<ShieldCheck className="w-5 h-5" />}
        title="Boost Visibility"
        description="Optimize content and increase AI search presence"
      />
    </div>
  );
};
