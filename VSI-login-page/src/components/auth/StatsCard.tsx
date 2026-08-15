import React from 'react';
import { Users, Activity, CheckCircle, Radio } from 'lucide-react';

export const StatsCard: React.FC = () => {
  const stats = [
    {
      number: '10K+',
      label: 'Active Users',
      icon: <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#ff2b2b]" />,
    },
    {
      number: '500M+',
      label: 'AI Mentions Tracked',
      icon: <Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#ff2b2b]" />,
    },
    {
      number: '98%',
      label: 'Accuracy Rate',
      icon: <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#ff2b2b]" />,
    },
    {
      number: '24/7',
      label: 'Live Monitoring',
      icon: <Radio className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#ff2b2b]" />,
    },
  ];

  return (
    <div className="w-full rounded-2xl bg-zinc-950/70 border border-[#ef2b2b]/25 backdrop-blur-md p-3.5 sm:p-4 shadow-[0_0_25px_rgba(239,43,43,0.12)]">
      <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-zinc-800/80 gap-y-3 sm:gap-y-0">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className={`flex flex-col justify-center ${
              idx > 0 ? 'sm:pl-4 lg:pl-5' : ''
            } ${idx % 2 !== 0 ? 'pl-3 sm:pl-4' : ''} ${idx >= 2 ? 'pt-2.5 sm:pt-0' : ''}`}
          >
            <div className="flex items-center gap-1.5 mb-0.5">
              {stat.icon}
              <span className="text-lg sm:text-xl font-black text-[#ff2b2b] tracking-tight font-sans">
                {stat.number}
              </span>
            </div>
            <span className="text-[11px] sm:text-xs font-medium text-zinc-400 leading-snug">
              {stat.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

