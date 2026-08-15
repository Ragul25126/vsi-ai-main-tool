import React, { useState } from 'react';
import {
  Sparkles,
  BarChart3,
  Globe,
  Target,
  TrendingUp,
  Shield,
  LogOut,
  Bell,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  RefreshCw,
  SlidersHorizontal,
} from 'lucide-react';
import type { UserProfile } from '../../types';
import vgLogo from '../../assets/vg-logo.png';

interface VSIDashboardProps {
  user: UserProfile;
  onLogout: () => void;
}

export const VSIDashboard: React.FC<VSIDashboardProps> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'mentions' | 'competitors'>('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const platforms = [
    { name: 'ChatGPT 4.5', mentions: '142,500', share: '88%', status: 'Dominant', trend: '+14%' },
    { name: 'Perplexity AI', mentions: '98,200', share: '76%', status: 'Dominant', trend: '+22%' },
    { name: 'Claude 3.5 Sonnet', mentions: '110,400', share: '82%', status: 'Dominant', trend: '+18%' },
    { name: 'Google Gemini 1.5', mentions: '64,100', share: '64%', status: 'Opportunity', trend: '+5%' },
    { name: 'SearchGPT', mentions: '45,800', share: '71%', status: 'Growing', trend: '+31%' },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col font-sans selection:bg-[#ff2b2b] selection:text-white">
      {/* Top Navigation Bar */}
      <header className="h-16 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-40 px-6 flex items-center justify-between">
        {/* Brand logo */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-[0_0_15px_rgba(234,179,8,0.3)] border border-amber-300/40 p-0.5 overflow-hidden">
              <img
                src={vgLogo}
                alt="VG Logo"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <div>
              <span className="text-lg font-bold text-white tracking-tight">Valgrow AI Suite</span>
              <span className="ml-2 text-[10px] font-mono text-amber-400 px-2 py-0.5 rounded bg-amber-950/60 border border-amber-500/30 uppercase">
                GEO PLATFORM PRO
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-1 pl-6 border-l border-zinc-800">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'overview'
                  ? 'bg-zinc-800 text-white'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('mentions')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'mentions'
                  ? 'bg-zinc-800 text-white'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              AI Mentions
            </button>
            <button
              onClick={() => setActiveTab('competitors')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'competitors'
                  ? 'bg-zinc-800 text-white'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Competitor Gap
            </button>
          </nav>
        </div>

        {/* User Profile & Actions */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleRefresh}
            className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
            title="Refresh AI Data"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#ff2b2b]' : ''}`} />
          </button>

          <button className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors relative">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#ff2b2b]" />
          </button>

          <div className="h-6 w-[1px] bg-zinc-800" />

          {/* User info badge */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-red-600 to-red-400 flex items-center justify-center font-bold text-xs text-white shadow-md">
              {user.name.charAt(0)}
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="text-xs font-bold text-white leading-tight">{user.name}</span>
              <span className="text-[10px] text-zinc-400 leading-tight">{user.company}</span>
            </div>

            <button
              onClick={onLogout}
              className="ml-2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-red-950/80 border border-zinc-800 hover:border-red-500/40 text-zinc-300 hover:text-red-200 text-xs font-medium transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="flex-1 p-6 lg:p-8 max-w-[1500px] w-full mx-auto space-y-8">
        {/* Welcome Header Banner */}
        <div className="relative rounded-2xl bg-gradient-to-r from-red-950/40 via-zinc-950 to-zinc-950 border border-[#ef2b2b]/30 p-6 lg:p-8 overflow-hidden shadow-vsi-glow">
          <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/80 border border-red-500/40 text-red-300 text-xs font-mono mb-3">
                <Sparkles className="w-3.5 h-3.5 text-[#ff2b2b]" />
                <span>GEO PLATFORM INTELLIGENCE ACTIVE</span>
              </div>
              <h1 className="text-3xl font-extrabold text-white tracking-tight">
                AI Search Visibility Command Center
              </h1>
              <p className="text-zinc-400 text-sm mt-1 max-w-2xl">
                Tracking brand recommendations and synthetic buyer queries across ChatGPT, Claude, Perplexity, and Gemini in real-time.
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="bg-zinc-900/90 border border-zinc-800 rounded-xl px-4 py-3 text-center">
                <span className="text-xs text-zinc-400 block font-mono">GLOBAL GEO SCORE</span>
                <span className="text-2xl font-black text-[#ff2b2b]">94.8 / 100</span>
              </div>
              <button className="btn-red-gradient px-5 py-3 rounded-xl font-bold text-sm text-white flex items-center gap-2">
                <span>Run New GEO Audit</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-zinc-950/80 border border-zinc-800/80 rounded-xl p-5 backdrop-blur-md">
            <div className="flex items-center justify-between text-zinc-400 mb-3">
              <span className="text-xs font-medium uppercase tracking-wider font-mono">Total AI Mentions</span>
              <Target className="w-4 h-4 text-[#ff2b2b]" />
            </div>
            <div className="text-3xl font-black text-white font-mono">461,000</div>
            <div className="text-xs text-emerald-400 mt-2 flex items-center gap-1 font-semibold">
              <TrendingUp className="w-3.5 h-3.5" /> +16.4% this month
            </div>
          </div>

          <div className="bg-zinc-950/80 border border-zinc-800/80 rounded-xl p-5 backdrop-blur-md">
            <div className="flex items-center justify-between text-zinc-400 mb-3">
              <span className="text-xs font-medium uppercase tracking-wider font-mono">Share of Model Voice</span>
              <BarChart3 className="w-4 h-4 text-[#ff2b2b]" />
            </div>
            <div className="text-3xl font-black text-white font-mono">79.2%</div>
            <div className="text-xs text-emerald-400 mt-2 flex items-center gap-1 font-semibold">
              <TrendingUp className="w-3.5 h-3.5" /> #1 in Enterprise Software
            </div>
          </div>

          <div className="bg-zinc-950/80 border border-zinc-800/80 rounded-xl p-5 backdrop-blur-md">
            <div className="flex items-center justify-between text-zinc-400 mb-3">
              <span className="text-xs font-medium uppercase tracking-wider font-mono">Citation Accuracy</span>
              <Shield className="w-4 h-4 text-[#ff2b2b]" />
            </div>
            <div className="text-3xl font-black text-white font-mono">98.4%</div>
            <div className="text-xs text-zinc-400 mt-2 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Verified source links
            </div>
          </div>

          <div className="bg-zinc-950/80 border border-zinc-800/80 rounded-xl p-5 backdrop-blur-md">
            <div className="flex items-center justify-between text-zinc-400 mb-3">
              <span className="text-xs font-medium uppercase tracking-wider font-mono">Competitor Gaps</span>
              <Globe className="w-4 h-4 text-[#ff2b2b]" />
            </div>
            <div className="text-3xl font-black text-[#ff2b2b] font-mono">14 Opportunities</div>
            <div className="text-xs text-amber-400 mt-2 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" /> Ready for optimization
            </div>
          </div>
        </div>

        {/* AI Model Breakdown Table */}
        <div className="bg-zinc-950/80 border border-zinc-800/80 rounded-2xl p-6 backdrop-blur-md">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-white">AI Engine Performance</h2>
              <p className="text-xs text-zinc-400 mt-0.5">Brand recommendation rate by platform</p>
            </div>
            <button className="px-3.5 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-medium flex items-center gap-2 hover:bg-zinc-800">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filter Models</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-800 text-xs font-mono uppercase text-zinc-400">
                  <th className="pb-3 font-semibold">AI Platform</th>
                  <th className="pb-3 font-semibold">Monthly Mentions</th>
                  <th className="pb-3 font-semibold">Visibility Share</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold">Trend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60 text-sm">
                {platforms.map((platform, idx) => (
                  <tr key={idx} className="hover:bg-zinc-900/50 transition-colors">
                    <td className="py-4 font-semibold text-white flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-red-950/50 border border-red-500/30 flex items-center justify-center text-[#ff2b2b] font-mono font-bold text-xs">
                        AI
                      </div>
                      {platform.name}
                    </td>
                    <td className="py-4 text-zinc-300 font-mono">{platform.mentions}</td>
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-24 bg-zinc-800 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-[#ff2b2b] h-full rounded-full"
                            style={{ width: platform.share }}
                          />
                        </div>
                        <span className="text-xs font-mono font-bold text-zinc-200">
                          {platform.share}
                        </span>
                      </div>
                    </td>
                    <td className="py-4">
                      <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-950/70 border border-emerald-500/30 text-emerald-300">
                        {platform.status}
                      </span>
                    </td>
                    <td className="py-4 text-emerald-400 font-mono font-semibold">
                      {platform.trend}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};
