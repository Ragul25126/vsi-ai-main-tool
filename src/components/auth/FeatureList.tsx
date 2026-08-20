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
      {/* Icon Container: Dark orange gradient, thin orange border, rounded corners, orange glowing icon matching Image 2 */}
      <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-[#FF5500]/20 via-[#161B26] to-[#0B0E14] border border-[#FF5500]/40 flex items-center justify-center shrink-0 shadow-[0_0_18px_rgba(255,85,0,0.25)] group-hover:border-[#FF5500] group-hover:shadow-[0_0_25px_rgba(255,85,0,0.5)] transition-all duration-300">
        <div className="text-[#FF5500] drop-shadow-[0_0_10px_rgba(255,85,0,0.8)]">
          {icon}
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col justify-center text-left">
        <h3 className="text-white font-semibold text-sm sm:text-base leading-snug group-hover:text-orange-200 transition-colors">
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

