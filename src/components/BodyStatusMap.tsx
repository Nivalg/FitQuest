import React from "react";
import { pixelMusclePaths } from "../data/pixelMusclePaths";

interface BodyStatusMapProps {
  weeklyVolume: Record<string, number>;
  weeklySubVolume?: Record<string, number>;
}

export default function BodyStatusMap({ weeklyVolume, weeklySubVolume }: BodyStatusMapProps) {
  // Helper to extract muscle progress percentage
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

  // Color mapping check
  const getMuscleTier = (muscle: string): "green" | "yellow" | "red" => {
    const val = getProgress(muscle);
    if (val >= 20 && val <= 60) return "yellow";
    if (val > 60) return "red";
    return "green";
  };

  return (
    <div className="flex flex-col items-center justify-center bg-[#0D0D0E] border-2 border-slate-800 rounded-2xl p-6 shadow-2xl w-full">
      <div className="text-[9px] font-press-start text-cyan-400 tracking-widest uppercase mb-4 text-center">
        ANATOMY TARGETING HUD
      </div>
      <div className="relative w-full max-w-[340px] aspect-[976/585] bg-black rounded-xl overflow-hidden border border-slate-900 shadow-inner">
        <svg
          viewBox="0 0 976 585"
          className="w-full h-full select-none"
          xmlns="http://www.w3.org/2000/svg"
          shapeRendering="crispEdges"
        >
          {/* Layer 1: Base image (Green muscles and outlines) */}
          <image
            href="/muscle_map.png"
            x="0"
            y="0"
            width="976"
            height="585"
            preserveAspectRatio="none"
          />

          {/* Layer 2: Pixel-perfect overlays for active muscles (Yellow / Red) */}
          {pixelMusclePaths.map((path, idx) => {
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
          })}
        </svg>
      </div>
    </div>
  );
}
