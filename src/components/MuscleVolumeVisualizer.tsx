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
  Info
} from "lucide-react";

interface MuscleVolumeVisualizerProps {
  weeklyVolume: Record<string, number>;
  weeklySubVolume?: Record<string, number>;
}

export default function MuscleVolumeVisualizer({ weeklyVolume, weeklySubVolume }: MuscleVolumeVisualizerProps) {
  const [selectedKey, setSelectedKey] = useState<string>("chestStrength");

  const statKeys = [
    "chestStrength",
    "backStrength",
    "armStrength",
    "legStrength",
    "coreStrength",
    "cardio"
  ] as const;

  const statConfig: Record<string, { label: string; colorHex: string; colorClass: string; accentBg: string; icon: React.ReactNode; desc: string }> = {
    chestStrength: {
      label: "Chest Progress",
      colorHex: "#22d3ee",
      colorClass: "text-cyan-400",
      accentBg: "bg-cyan-500/10",
      icon: <Dumbbell className="w-4 h-4 text-cyan-400" />,
      desc: "Horizontal chest press, pushups, & flies."
    },
    backStrength: {
      label: "Back Progress",
      colorHex: "#fb923c",
      colorClass: "text-orange-400",
      accentBg: "bg-orange-500/10",
      icon: <Shield className="w-4 h-4 text-orange-400" />,
      desc: "Pullups, rows, & spinal pulling movements."
    },
    armStrength: {
      label: "Arm Progress",
      colorHex: "#f472b6",
      colorClass: "text-pink-400",
      accentBg: "bg-pink-500/10",
      icon: <Zap className="w-4 h-4 text-pink-400" />,
      desc: "Triceps, biceps, & shoulder accessory work."
    },
    legStrength: {
      label: "Leg Progress",
      colorHex: "#34d399",
      colorClass: "text-emerald-400",
      accentBg: "bg-emerald-500/10",
      icon: <Activity className="w-4 h-4 text-emerald-400" />,
      desc: "Squats, lunges, leg presses, & climbs."
    },
    coreStrength: {
      label: "Core Progress",
      colorHex: "#fbbf24",
      colorClass: "text-amber-400",
      accentBg: "bg-amber-500/10",
      icon: <Target className="w-4 h-4 text-amber-400" />,
      desc: "Hanging raises, ab roller, & plank sets."
    },
    cardio: {
      label: "Cardio Progress",
      colorHex: "#f43f5e",
      colorClass: "text-rose-400",
      accentBg: "bg-rose-500/10",
      icon: <Flame className="w-4 h-4 text-rose-400" />,
      desc: "Running, cycling, stairmaster, jump rope, & outdoor trails."
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

  // Helper to map percent to visual radius (0% to 120% scale on 6-axis hexagon)
  const getCoordinatesForPercent = (index: number, percent: number) => {
    const angle = (2 * Math.PI * index) / 6 - Math.PI / 2;
    const clampedVal = Math.max(0, Math.min(120, percent));
    const dist = (clampedVal / 120) * 105; // 105px is maximum visual radius
    const x = 170 + dist * Math.cos(angle);
    const y = 170 + dist * Math.sin(angle);
    return { x, y };
  };

  const currentVal = weeklyVolume[selectedKey] || 0;
  const currentConfig = statConfig[selectedKey] || statConfig.chestStrength;

  return (
    <div className="bg-[#161B22] border-2 border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4 animate-fade-in relative overflow-hidden">
      {/* Decorative Blur Background Glow */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="border-b border-slate-800 pb-2.5 text-center sm:text-left">
        <span className="text-[9px] font-press-start text-cyan-400 tracking-widest block uppercase">
          ⚔️ WEEKLY ATTRIBUTE RADAR
        </span>
        <p className="text-[8px] text-slate-400 font-mono mt-1">
          Tap any attribute label to view details and sub-muscle splits.
        </p>
      </div>

      {/* Radar SVG Chart Container */}
      <div className="flex justify-center items-center py-2">
        <svg
          viewBox="0 0 340 340"
          className="w-full max-w-[310px] aspect-square select-none overflow-visible"
        >
          {/* Concentric regular hexagons representing thresholds */}
          {[20, 50, 100, 120].map((threshold) => {
            const points = Array.from({ length: 6 }, (_, i) => {
              const { x, y } = getCoordinatesForPercent(i, threshold);
              return `${x},${y}`;
            }).join(" ");

            let strokeColor = "rgba(71, 85, 105, 0.3)";
            let strokeDash = "2 3";
            
            if (threshold === 20) {
              strokeColor = "rgba(251, 191, 36, 0.4)"; // Amber Maint
            } else if (threshold === 50) {
              strokeColor = "rgba(34, 211, 238, 0.5)"; // Cyan Growth
            } else if (threshold === 100) {
              strokeColor = "rgba(52, 211, 153, 0.5)"; // Emerald Peak
              strokeDash = "0"; // solid
            }

            return (
              <polygon
                key={threshold}
                points={points}
                fill="none"
                stroke={strokeColor}
                strokeDasharray={strokeDash}
                strokeWidth="1"
              />
            );
          })}

          {/* Radial spoke lines from center to outer bounds */}
          {statKeys.map((_, i) => {
            const outer = getCoordinatesForPercent(i, 120);
            return (
              <line
                key={i}
                x1="170"
                y1="170"
                x2={outer.x}
                y2={outer.y}
                stroke="rgba(71, 85, 105, 0.25)"
                strokeWidth="1"
              />
            );
          })}

          {/* Glowing user data polygon */}
          {(() => {
            const dataPoints = statKeys.map((key, i) => {
              const val = weeklyVolume[key] || 0;
              const { x, y } = getCoordinatesForPercent(i, val);
              return `${x},${y}`;
            }).join(" ");

            return (
              <polygon
                points={dataPoints}
                fill="rgba(34, 211, 238, 0.22)"
                stroke="#22D3EE"
                strokeWidth="2.5"
                className="drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]"
              />
            );
          })()}

          {/* Vertex point circles */}
          {statKeys.map((key, i) => {
            const val = weeklyVolume[key] || 0;
            const { x, y } = getCoordinatesForPercent(i, val);
            const isSelected = selectedKey === key;
            return (
              <circle
                key={key}
                cx={x}
                cy={y}
                r={isSelected ? "5.5" : "4"}
                fill={isSelected ? "#22D3EE" : (statConfig[key]?.colorHex || "#22d3ee")}
                className="stroke-[#0D0D0E] stroke-2 cursor-pointer transition-all duration-150"
                onClick={() => setSelectedKey(key)}
              />
            );
          })}

          {/* Interactive labels and percentages */}
          {statKeys.map((key, i) => {
            const val = weeklyVolume[key] || 0;
            const config = statConfig[key] || statConfig.chestStrength;
            const angle = (2 * Math.PI * i) / 6 - Math.PI / 2;
            const dist = 126; // position labels outside the 120% boundary
            const lx = 170 + dist * Math.cos(angle);
            const ly = 170 + dist * Math.sin(angle);

            let textAnchor = "middle";
            if (Math.cos(angle) > 0.15) textAnchor = "start";
            else if (Math.cos(angle) < -0.15) textAnchor = "end";

            const yOffset = Math.sin(angle) < -0.85 ? -3 : Math.sin(angle) > 0.85 ? 12 : 4;
            const isSelected = selectedKey === key;

            return (
              <g key={key} className="cursor-pointer" onClick={() => setSelectedKey(key)}>
                <text
                  x={lx}
                  y={ly + yOffset}
                  textAnchor={textAnchor}
                  className={`text-[8.5px] font-press-start leading-none tracking-wide select-none ${
                    isSelected ? "fill-cyan-300 font-extrabold" : "fill-slate-400 hover:fill-cyan-400"
                  }`}
                >
                  {config.label.replace(" Progress", "").toUpperCase()}
                </text>
                <text
                  x={lx}
                  y={ly + yOffset + 10}
                  textAnchor={textAnchor}
                  className={`text-[9.5px] font-mono font-extrabold select-none ${
                    isSelected ? "fill-cyan-300" : "fill-white"
                  }`}
                >
                  {val.toFixed(1)}%
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Selected Attribute Detail Card */}
      <div className="bg-[#0D0D0E] border border-slate-850 p-4 rounded-xl space-y-3">
        {/* Title and Icon */}
        <div className="flex items-center justify-between border-b border-slate-900 pb-2">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg bg-[#161B22] border border-slate-800`}>
              {currentConfig.icon}
            </div>
            <span className="text-[9.5px] font-press-start text-white uppercase tracking-wide">
              {currentConfig.label.toUpperCase()}
            </span>
          </div>

          <span className={`px-2 py-0.5 rounded-md border text-[8px] font-mono font-extrabold uppercase ${
            currentVal >= 100
              ? "bg-emerald-950/40 border-emerald-400/60 text-emerald-300 shadow-[0_0_8px_rgba(52,211,153,0.3)]"
              : currentVal >= 50
              ? "bg-cyan-950/40 border-cyan-400/60 text-cyan-300"
              : currentVal >= 20
              ? "bg-amber-950/40 border-amber-500/50 text-amber-400"
              : "bg-slate-900 border-slate-800 text-slate-400"
          }`}>
            {currentVal >= 100 ? "🏆 PEAK HYPERTROPHY" : currentVal >= 50 ? "⚡ OPTIMAL GROWTH" : currentVal >= 20 ? "⚓ MAINTENANCE MET" : "🌱 LATENT STIMULUS"}
          </span>
        </div>

        {/* Value and Checkpoint Goal */}
        <div className="flex justify-between items-center text-[9px] font-mono">
          <div>
            <span className="text-slate-400 uppercase">Weekly Volume: </span>
            <span className="text-white font-extrabold">{currentVal.toFixed(1)}%</span>
          </div>
          <span className="text-cyan-400 font-bold uppercase">
            {currentVal >= 100 ? "100%+ MAXED" : currentVal >= 50 ? `Need ${(100 - currentVal).toFixed(1)}% for Peak` : currentVal >= 20 ? `Need ${(50 - currentVal).toFixed(1)}% for Growth` : `Need ${(20 - currentVal).toFixed(1)}% for Maint.`}
          </span>
        </div>

        {/* Description */}
        <p className="text-[8.5px] font-mono text-slate-450 leading-relaxed italic">
          {currentConfig.desc}
        </p>

        {/* Sub-Muscle Categories Progress Bars (Only for Arms or Legs) */}
        {subCategoriesByParent[selectedKey] && (
          <div className="pt-2 border-t border-slate-900 space-y-2.5">
            <span className="text-[7.5px] font-press-start text-slate-500 uppercase tracking-wider block mb-1">
              🧬 SUB-MUSCLE PROGRESS SPLIT
            </span>
            {subCategoriesByParent[selectedKey].map((subKey) => {
              const subVal = (weeklySubVolume && weeklySubVolume[subKey]) || 0;
              const subConfig = subCategoryConfigs[subKey];
              return (
                <div key={subKey} className="space-y-1 pl-2 border-l border-slate-800">
                  <div className="flex justify-between items-center text-[8.5px] font-mono">
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
    </div>
  );
}
