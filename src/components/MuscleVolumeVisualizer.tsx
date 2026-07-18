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
  TrendingUp
} from "lucide-react";

interface MuscleVolumeVisualizerProps {
  weeklyVolume: Record<string, number>;
  weeklySubVolume?: Record<string, number>;
}

export default function MuscleVolumeVisualizer({ weeklyVolume, weeklySubVolume }: MuscleVolumeVisualizerProps) {
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const [expandedKeys, setExpandedKeys] = useState<Record<string, boolean>>({});

  const toggleExpand = (key: string) => {
    if (key === "armStrength" || key === "legStrength") {
      setExpandedKeys(prev => ({
        ...prev,
        [key]: !prev[key]
      }));
    }
  };

  const subCategoryConfigs: Record<string, { label: string; colorHex: string }> = {
    biceps: { label: "Biceps Progress", colorHex: "#ec4899" },
    triceps: { label: "Triceps Progress", colorHex: "#f43f5e" },
    shoulders: { label: "Shoulders Progress", colorHex: "#22d3ee" },
    traps: { label: "Traps Progress", colorHex: "#a855f7" },
    glutes: { label: "Glutes Progress", colorHex: "#10b981" },
    quads: { label: "Quads Progress", colorHex: "#14b8a6" },
    hamstrings: { label: "Hamstrings Progress", colorHex: "#84cc16" },
    calves: { label: "Calves Progress", colorHex: "#22c55e" }
  };

  const subCategoriesByParent: Record<string, string[]> = {
    armStrength: ["biceps", "triceps", "shoulders", "traps"],
    legStrength: ["glutes", "quads", "hamstrings", "calves"]
  };

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

  return (
    <div className="bg-[#161B22] border border-slate-800 rounded-2xl p-4 shadow-2xl relative overflow-hidden space-y-4 animate-fade-in">
      {/* Decorative Glow Effects */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Main Content Layout */}
      <div className="space-y-3 mt-1">
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

            const canExpand = key === "armStrength" || key === "legStrength";
            const isExpanded = expandedKeys[key];

            return (
              <div
                key={key}
                onMouseEnter={() => setHoveredKey(key)}
                onMouseLeave={() => setHoveredKey(null)}
                onClick={() => canExpand && toggleExpand(key)}
                className={`p-3 bg-[#0D0D0E]/80 border rounded-xl transition-all duration-200 flex flex-col justify-between space-y-2 relative overflow-hidden group select-none ${
                  canExpand ? "cursor-pointer" : ""
                } ${
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
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-mono font-black text-white capitalize leading-tight">
                        {config.label}
                      </h4>
                      {canExpand && (
                        <span className="text-[7px] text-slate-500 font-press-start font-bold animate-pulse">
                          {isExpanded ? "[▲]" : "[▼]"}
                        </span>
                      )}
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

                {/* Progress Metric Details & Growth Target Status Badge */}
                <div className="space-y-2 pt-1">
                  {/* Status Badge & Target Checkpoint Goal */}
                  <div className="flex justify-between items-center text-[8px] font-mono">
                    <span className={`px-2 py-0.5 rounded-md border font-extrabold uppercase flex items-center gap-1 ${
                      val >= 100
                        ? "bg-emerald-950/40 border-emerald-400/60 text-emerald-300 shadow-[0_0_8px_rgba(52,211,153,0.3)]"
                        : val >= 50
                        ? "bg-cyan-950/40 border-cyan-400/60 text-cyan-300"
                        : val >= 20
                        ? "bg-amber-950/40 border-amber-500/50 text-amber-400"
                        : "bg-slate-900 border-slate-800 text-slate-400"
                    }`}>
                      {val >= 100 ? "🏆 PEAK HYPERTROPHY" : val >= 50 ? "⚡ OPTIMAL GROWTH" : val >= 20 ? "⚓ MAINTENANCE MET" : "🌱 LATENT STIMULUS"}
                    </span>

                    <span className="text-slate-400 font-bold uppercase">
                      {val >= 100 ? "100%+ MAXED" : val >= 50 ? `Need ${(100 - val).toFixed(1)}% for Peak` : val >= 20 ? `Need ${(50 - val).toFixed(1)}% for Growth` : `Need ${(20 - val).toFixed(1)}% for Maint.`}
                    </span>
                  </div>

                  {/* Thick 9px Glowing Bar with Checkpoint Notches */}
                  <div className="relative w-full h-3 bg-[#090D12] border border-slate-800 rounded-full overflow-hidden p-0.5">
                    {/* Fill Bar */}
                    <div
                      className="h-full rounded-full transition-all duration-500 ease-out shadow-[0_0_8px_rgba(34,211,238,0.4)]"
                      style={{
                        width: `${Math.max(2, Math.min(100, val))}%`,
                        backgroundImage: `linear-gradient(to right, ${
                          val >= 100 ? "#34d399, #10b981, #059669" : val >= 50 ? "#22d3ee, #0284c7, #3b82f6" : "#fbbf24, #f59e0b"
                        })`
                      }}
                    />

                    {/* 20% Maintenance Checkpoint Line */}
                    <div className="absolute top-0 bottom-0 left-[20%] w-[1.5px] bg-amber-400/40 pointer-events-none" title="20% Maintenance" />

                    {/* 50% Optimal Growth Checkpoint Line */}
                    <div className="absolute top-0 bottom-0 left-[50%] w-[1.5px] bg-cyan-400/50 pointer-events-none" title="50% Optimal Growth" />

                    {/* 80% Peak Volume Checkpoint Line */}
                    <div className="absolute top-0 bottom-0 left-[80%] w-[1.5px] bg-emerald-400/40 pointer-events-none" title="80% Heavy Volume" />
                  </div>

                  {/* Checkpoint Label Indicators below the bar */}
                  <div className="flex justify-between items-center text-[7px] font-mono text-slate-500 pt-0.5 px-0.5">
                    <span>0%</span>
                    <span className="text-amber-500/80 font-bold">| 20% MAINT</span>
                    <span className="text-cyan-400/90 font-bold">| 50% GROWTH</span>
                    <span className="text-emerald-400/80 font-bold">| 100% PEAK</span>
                  </div>
                </div>

                {/* Nested Subcategories volume detail */}
                {canExpand && isExpanded && (
                  <div className="mt-3 pt-3 border-t border-slate-850 space-y-2.5">
                    {subCategoriesByParent[key].map((subKey) => {
                      const subVal = (weeklySubVolume && weeklySubVolume[subKey]) || 0;
                      const subConfig = subCategoryConfigs[subKey];
                      return (
                        <div key={subKey} className="space-y-1 pl-2.5 border-l border-slate-800">
                          <div className="flex justify-between items-center text-[9px] font-mono">
                            <span className="text-slate-400 uppercase tracking-wider font-bold">
                              {subConfig.label}
                            </span>
                            <span className="text-white font-black">
                              {subVal.toFixed(1)}%
                            </span>
                          </div>
                          <div className="relative w-full h-2 bg-[#090D12] border border-slate-850 rounded-full overflow-hidden p-0.5">
                            <div
                              className="h-full rounded-full transition-all duration-300"
                              style={{
                                width: `${Math.max(2, Math.min(100, subVal))}%`,
                                backgroundColor: subConfig.colorHex
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
