import React, { useState } from "react";
import {
  Dumbbell,
  Shield,
  Activity,
  Zap,
  Target,
  Flame,
  Clock,
  Award,
  TrendingDown,
  TrendingUp,
  Sparkles
} from "lucide-react";

interface MuscleVolumeVisualizerProps {
  weeklyVolume: Record<string, number>;
}

export default function MuscleVolumeVisualizer({ weeklyVolume }: MuscleVolumeVisualizerProps) {
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const [isBalanceHelpOpen, setIsBalanceHelpOpen] = useState(false);

  const statKeys = [
    "chestStrength",
    "backStrength",
    "armStrength",
    "legStrength",
    "coreStrength",
    "speed",
    "stamina"
  ] as const;

  const statConfig = {
    chestStrength: {
      label: "Chest Progress",
      colorClass: "text-cyan-400",
      accentBg: "bg-cyan-500/10",
      colorHex: "#22d3ee",
      icon: <Dumbbell className="w-4.5 h-4.5 text-cyan-400" />,
      desc: "Horizontal chest press, pushups, & flies."
    },
    backStrength: {
      label: "Back Progress",
      colorClass: "text-orange-400",
      accentBg: "bg-orange-500/10",
      colorHex: "#fb923c",
      icon: <Shield className="w-4.5 h-4.5 text-orange-400" />,
      desc: "Pullups, rows, & spinal pulling movements."
    },
    armStrength: {
      label: "Arm Progress",
      colorClass: "text-pink-400",
      accentBg: "bg-pink-500/10",
      colorHex: "#f472b6",
      icon: <Zap className="w-4.5 h-4.5 text-pink-400" />,
      desc: "Triceps, biceps, & shoulder accessory work."
    },
    legStrength: {
      label: "Leg Progress",
      colorClass: "text-emerald-400",
      accentBg: "bg-emerald-500/10",
      colorHex: "#34d399",
      icon: <Activity className="w-4.5 h-4.5 text-emerald-400" />,
      desc: "Squats, lunges, leg presses, & climbs."
    },
    coreStrength: {
      label: "Core Progress",
      colorClass: "text-amber-400",
      accentBg: "bg-amber-500/10",
      colorHex: "#fbbf24",
      icon: <Target className="w-4.5 h-4.5 text-amber-400" />,
      desc: "Hanging raises, ab rollers, & planks."
    },
    speed: {
      label: "Speed Progress",
      colorClass: "text-rose-400",
      accentBg: "bg-rose-500/10",
      colorHex: "#f43f5e",
      icon: <Flame className="w-4.5 h-4.5 text-rose-400" />,
      desc: "High-intensity running velocity/sprinter sets."
    },
    stamina: {
      label: "Stamina Progress",
      colorClass: "text-purple-400",
      accentBg: "bg-purple-500/10",
      colorHex: "#c084fc",
      icon: <Clock className="w-4.5 h-4.5 text-purple-400" />,
      desc: "Endurance jogs, cardio trails, & stamina loads."
    }
  };

  const totalStimulus = statKeys.reduce((sum, key) => sum + (weeklyVolume[key] || 0), 0);
  const averageStimulus = totalStimulus / 7;

  // Balanced index calculation: how evenly distributed is weekly stimulus?
  const variance = statKeys.reduce((v, key) => v + Math.pow((weeklyVolume[key] || 0) - averageStimulus, 2), 0) / 7;
  const standardDeviation = Math.sqrt(variance);
  const balancePercentage = Math.max(0, Math.min(100, Math.round(100 - (standardDeviation * 12))));

  return (
    <div className="bg-[#161B22] border border-slate-800 rounded-2xl p-4 shadow-2xl relative overflow-hidden space-y-4 animate-fade-in">
      {/* Decorative Glow Effects */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Main Content Layout */}
      <div className="space-y-3 mt-1">
        {/* Dynamic Horizontal Overview Strip */}
        <div className="bg-[#0D0D0E]/60 border border-slate-800 rounded-xl p-3 flex flex-col gap-3">
          <div className="flex items-center justify-between w-full border-b border-slate-800/50 pb-2.5">
            <div className="w-10 h-10 shrink-0 opacity-0 pointer-events-none" />
            
            <h4 className="text-[11px] font-press-start text-emerald-400 flex items-center justify-center gap-1.5 text-center leading-none">
              <Sparkles className="w-3.5 h-3.5" /> WORKOUT BALANCE <Sparkles className="w-3.5 h-3.5" />
            </h4>
            
            <button
              onClick={() => setIsBalanceHelpOpen(true)}
              className="w-10 h-10 rounded-xl bg-[#0D0D0E]/90 border border-slate-800 flex items-center justify-center font-mono text-base font-black text-emerald-400 hover:text-emerald-300 hover:border-emerald-550 hover:bg-emerald-500/5 cursor-pointer active:scale-95 transition duration-150 shrink-0 shadow-sm"
              title="Balance Guide"
            >
              ?
            </button>
          </div>

          {/* Micro Visual Bar of Stat Ratios */}
          <div className="w-full">
            <div className="flex justify-between text-[9px] font-mono text-slate-500 mb-1">
              <span>WORKOUT TRAINING</span>
              <span>7 DYNAMIC SECTORS</span>
            </div>
            <div className="w-full h-3 bg-[#0D0D0E] border border-slate-800 rounded-lg overflow-hidden flex">
              {statKeys.map((key) => {
                const val = weeklyVolume[key] || 0;
                const share = totalStimulus > 0 ? (val / totalStimulus) * 100 : 100 / 7;
                return (
                  <div
                    key={key}
                    style={{
                      width: `${share}%`,
                      backgroundColor: statConfig[key].colorHex
                    }}
                    title={`${statConfig[key].label}: ${val.toFixed(1)}% (${share.toFixed(1)}% share)`}
                    className="h-full border-r border-[#0D0D0E] last:border-0 hover:brightness-110 transition duration-150 cursor-pointer"
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Beautiful high-tech grid of progress status panels */}
        <div className="flex flex-col gap-1.5">
          {statKeys.map((key) => {
            const val = weeklyVolume[key] || 0;
            const config = statConfig[key];
            const isHovered = hoveredKey === key;

            // Clamped progress map to fill the visual bar
            const visualPct = Math.max(0, Math.min(100, val));

            // Determine optimal stimulus color coding and rating
            let statusText = "Latent Progress";
            let statusColorBg = "bg-rose-950/20 border-rose-900/30 text-rose-400";
            let trendIcon = <TrendingDown className="w-3 h-3" />;

            if (val >= 35 && val <= 85) {
              statusText = "Sustained Progress";
              statusColorBg = "bg-amber-950/20 border-amber-900/20 text-amber-400";
              trendIcon = <TrendingUp className="w-3 h-3" />;
            } else if (val > 85) {
              statusText = "Optimal Growth";
              statusColorBg = "bg-emerald-950/20 border-emerald-900/30 text-emerald-400";
              trendIcon = <Award className="w-3.5 h-3.5" />;
            }

            return (
              <div
                key={key}
                onMouseEnter={() => setHoveredKey(key)}
                onMouseLeave={() => setHoveredKey(null)}
                className={`p-3 bg-[#0D0D0E]/80 border rounded-xl transition-all duration-200 flex flex-col justify-between space-y-2 relative overflow-hidden group ${
                  isHovered
                    ? "border-slate-700 bg-[#0D0D0E] shadow-lg"
                    : "border-slate-800/80 hover:border-slate-700"
                }`}
              >
                {/* Panel Glow */}
                {isHovered && (
                  <div
                    className="absolute inset-0 pointer-events-none opacity-[0.03]"
                    style={{
                      background: `radial-gradient(circle at 50% 50%, ${config.colorHex}, transparent 60%)`
                    }}
                  />
                )}

                {/* Top Section */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg bg-[#161B22] border border-slate-800 group-hover:scale-105 transition`}>
                      {config.icon}
                    </div>
                    <div>
                      <h4 className="text-xs font-mono font-black text-white capitalize leading-tight">
                        {config.label}
                      </h4>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-mono text-base font-black text-white leading-none block">
                      {val.toFixed(1)}%
                    </span>
                    <span className="text-[8px] text-slate-500 font-mono font-bold block uppercase leading-none mt-0.5">
                      Progress
                    </span>
                  </div>
                </div>

                {/* Progress Metric details */}
                <div className="space-y-1.5 pt-0.5">
                  {statusText !== "Latent Progress" && (
                    <div className="flex justify-between items-center text-[9px] font-mono mb-1">
                      <div className="flex items-center gap-1">
                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded border flex items-center gap-1 ${statusColorBg}`}>
                          {trendIcon} {statusText}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Enhanced high-tech bar */}
                  <div className="relative w-full h-2 bg-[#12161A] border border-slate-800 rounded-full overflow-hidden">
                    {/* Fill Bar */}
                    <div
                      className="h-full rounded-full transition-all duration-500 ease-out"
                      style={{
                        width: `${visualPct}%`,
                        backgroundColor: config.colorHex,
                        backgroundImage: `linear-gradient(to right, ${config.colorHex}, #3b82f6)`
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 🔮 WORKOUT BALANCE HELP POPUP OVERLAY */}
      {isBalanceHelpOpen && (
        <div className="fixed inset-0 bg-[#090B0E]/85 backdrop-blur-md z-55 flex items-center justify-center p-4">
          <div className="w-full max-w-[340px] bg-[#0D1117] border-2 border-emerald-500/50 rounded-2xl p-6 shadow-[0_0_25px_rgba(16,185,129,0.2)] relative overflow-hidden flex flex-col items-center text-center gap-4 animate-fade-in">
            {/* Accent decoration */}
            <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
            
            {/* Sparkles Header */}
            <div className="w-12 h-12 rounded-xl bg-[#161B22] border border-slate-800 flex items-center justify-center text-emerald-400 text-xl shadow-md font-mono">
              ✨
            </div>

            <div>
              <span className="text-[8px] font-press-start text-emerald-400 tracking-widest block uppercase mb-1">DOSSIER ADVISORY</span>
              <h3 className="text-xs font-press-start text-white uppercase tracking-wider block">
                WORKOUT BALANCE
              </h3>
              
              <div className="bg-[#0D0D0E]/60 border border-slate-800 rounded-xl p-4 text-[10px] font-mono text-slate-300 leading-relaxed text-left mt-3">
                Muscle Imbalance Warning! Your training is uneven right now. You are focusing heavily on your chest and legs while neglecting your back and core. Hit your back and core next to balance things out!
              </div>
            </div>

            {/* Action buttons */}
            <button
              onClick={() => setIsBalanceHelpOpen(false)}
              style={{ minHeight: "40px" }}
              className="w-full bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] transition cursor-pointer text-black font-press-start text-[9px] tracking-wider py-2.5 rounded-xl font-bold shadow-md shadow-emerald-500/10 uppercase"
            >
              UNDERSTOOD
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
