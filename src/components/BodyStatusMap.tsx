import React from "react";
import { pixelMusclePaths } from "../data/pixelMusclePaths";

interface BodyStatusMapProps {
  weeklyVolume?: Record<string, number>;
  weeklySubVolume?: Record<string, number>;
  interactive?: boolean;
  selectedMuscles?: string[];
  onToggleMuscle?: (muscle: string) => void;
  title?: string;
}

export default function BodyStatusMap({
  weeklyVolume = {},
  weeklySubVolume = {},
  interactive = false,
  selectedMuscles = [],
  onToggleMuscle,
  title
}: BodyStatusMapProps) {
  // Helper to extract muscle progress percentage for status mode
  const getProgress = (muscle: string): number => {
    switch (muscle) {
      case "chest":
        return weeklyVolume.chestStrength || 0;
      case "back":
        return weeklyVolume.backStrength || 0;
      case "core":
        return weeklyVolume.coreStrength || 0;
      case "shoulders":
        return weeklySubVolume?.shoulders ?? weeklyVolume.armStrength ?? 0;
      case "biceps":
        return weeklySubVolume?.biceps ?? weeklyVolume.armStrength ?? 0;
      case "triceps":
        return weeklySubVolume?.triceps ?? weeklyVolume.armStrength ?? 0;
      case "traps":
        return weeklySubVolume?.traps ?? weeklyVolume.armStrength ?? 0;
      case "glutes":
        return weeklySubVolume?.glutes ?? weeklyVolume.legStrength ?? 0;
      case "quads":
        return weeklySubVolume?.quads ?? weeklyVolume.legStrength ?? 0;
      case "hamstrings":
        return weeklySubVolume?.hamstrings ?? weeklyVolume.legStrength ?? 0;
      case "calves":
        return weeklySubVolume?.calves ?? weeklyVolume.legStrength ?? 0;
      case "forearms":
        return weeklyVolume.armStrength ?? 0;
      default:
        return 0;
    }
  };

  const getMuscleTier = (muscle: string): "green" | "yellow" | "red" => {
    const val = getProgress(muscle);
    if (val >= 20 && val <= 60) return "yellow";
    if (val > 60) return "red";
    return "green";
  };

  const formattedSelected = selectedMuscles.map(m => m.toUpperCase()).join(", ");

  return (
    <div className="flex flex-col items-center justify-center bg-[#0D0D0E] border-2 border-slate-800 rounded-2xl p-4 shadow-2xl w-full relative">
      <div className="text-[9px] font-press-start text-cyan-400 tracking-widest uppercase mb-3 text-center">
        {title || (interactive ? "SELECT TARGET MUSCLES (TAP BODY)" : "ANATOMY TARGETING HUD")}
      </div>

      <div className="relative w-full max-w-[340px] aspect-[976/585] bg-black rounded-xl overflow-hidden border border-slate-900 shadow-inner">
        {formattedSelected ? (
          <div className="absolute top-2 right-2 bg-slate-950/90 border border-cyan-400/80 px-2.5 py-1 rounded-lg text-cyan-300 font-press-start text-[8px] uppercase tracking-wider shadow-[0_0_10px_rgba(6,182,212,0.3)] z-20 pointer-events-none max-w-[70%] truncate text-right">
            {formattedSelected}
          </div>
        ) : interactive ? (
          <div className="absolute top-2 right-2 bg-slate-950/90 border border-cyan-400/80 px-2.5 py-1 rounded-lg text-cyan-300 font-press-start text-[8px] uppercase tracking-wider shadow-[0_0_10px_rgba(6,182,212,0.3)] z-20 pointer-events-none max-w-[70%] truncate text-right">
            SELECT MUSCLE
          </div>
        ) : null}

        <svg
          viewBox="0 0 976 585"
          className="w-full h-full select-none"
          xmlns="http://www.w3.org/2000/svg"
          shapeRendering="crispEdges"
        >
          {/* Layer 1: Base image */}
          <image
            href="/muscle_map.png"
            x="0"
            y="0"
            width="976"
            height="585"
            preserveAspectRatio="none"
          />

          {/* Layer 2: Interactive / Status Muscle Overlays */}
          {pixelMusclePaths.map((path, idx) => {
            const isSelected = selectedMuscles.includes(path.muscle);

            if (interactive) {
              return (
                <path
                  key={`${path.id}-${idx}-interactive`}
                  d={path.d}
                  fill={isSelected ? "#06b6d4" : "transparent"}
                  fillOpacity={isSelected ? 0.85 : 0}
                  stroke={isSelected ? "#22d3ee" : "none"}
                  strokeWidth="2"
                  className="cursor-pointer transition-all hover:fill-cyan-400/50 hover:fill-opacity-50"
                  onClick={() => onToggleMuscle?.(path.muscle)}
                />
              );
            } else {
              const tier = getMuscleTier(path.muscle);
              if (tier === "yellow") {
                return (
                  <path
                    key={`${path.id}-${idx}-yellow`}
                    d={path.d}
                    fill="#eab308"
                  />
                );
              } else if (tier === "red") {
                return (
                  <path
                    key={`${path.id}-${idx}-red`}
                    d={path.d}
                    fill="#ef4444"
                  />
                );
              }
              return null;
            }
          })}
        </svg>
      </div>
    </div>
  );
}
