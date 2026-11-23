import React, { useState, useMemo } from "react";
import { pixelMusclePaths } from "../data/pixelMusclePaths";
import { FitnessLog } from "../types";
import { getAllExercises } from "../exercises";
import { EXERCISE_CONFIGS } from "../utils/fitnessMath";
import { motion, AnimatePresence } from "motion/react";
import { Flame } from "lucide-react";

interface BodyStatusMapProps {
  weeklyVolume?: Record<string, number>;
  weeklySubVolume?: Record<string, number>;
  monthlyVolume?: Record<string, number>;
  monthlySubVolume?: Record<string, number>;
  logs?: FitnessLog[];
  interactive?: boolean;
  selectedMuscles?: string[];
  onToggleMuscle?: (muscle: string) => void;
  title?: string;
}

const SCROLLABLE_MUSCLES = [
  { key: "chest", label: "CHEST" },
  { key: "back", label: "BACK" },
  { key: "biceps", label: "BICEPS" },
  { key: "triceps", label: "TRICEPS" },
  { key: "shoulders", label: "SHOULDERS" },
  { key: "traps", label: "TRAPS" },
  { key: "quads", label: "QUADS" },
  { key: "hamstrings", label: "HAMSTRINGS" },
  { key: "glutes", label: "GLUTES" },
  { key: "calves", label: "CALVES" },
  { key: "core", label: "CORE" }
] as const;

export default function BodyStatusMap({
  weeklyVolume = {},
  weeklySubVolume = {},
  monthlyVolume,
  monthlySubVolume,
  logs = [],
  interactive = false,
  selectedMuscles = [],
  onToggleMuscle,
  title
}: BodyStatusMapProps) {
  const [timeframe, setTimeframe] = useState<"weekly" | "monthly">("weekly");
  const [inspectedMuscle, setInspectedMuscle] = useState<string>("chest");

  const activeVolume = !interactive && timeframe === "monthly" && monthlyVolume ? monthlyVolume : weeklyVolume;
  const activeSubVolume = !interactive && timeframe === "monthly" && monthlySubVolume ? monthlySubVolume : weeklySubVolume;

  // Helper to extract muscle progress percentage for status mode
  const getProgress = (muscle: string): number => {
    switch (muscle) {
      case "chest":
        return activeVolume.chestStrength || 0;
      case "back":
        return activeVolume.backStrength || 0;
      case "core":
        return activeVolume.coreStrength || 0;
      case "cardio":
        return activeVolume.cardio || 0;
      case "shoulders":
        return activeSubVolume?.shoulders ?? activeVolume.armStrength ?? 0;
      case "biceps":
        return activeSubVolume?.biceps ?? activeVolume.armStrength ?? 0;
      case "triceps":
        return activeSubVolume?.triceps ?? activeVolume.armStrength ?? 0;
      case "traps":
        return activeSubVolume?.traps ?? activeVolume.armStrength ?? 0;
      case "glutes":
        return activeSubVolume?.glutes ?? activeVolume.legStrength ?? 0;
      case "quads":
        return activeSubVolume?.quads ?? activeVolume.legStrength ?? 0;
      case "hamstrings":
        return activeSubVolume?.hamstrings ?? activeVolume.legStrength ?? 0;
      case "calves":
        return activeSubVolume?.calves ?? activeVolume.legStrength ?? 0;
      case "forearms":
        return activeSubVolume?.biceps ?? activeVolume.armStrength ?? 0;
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

  // Group past workouts targeting the inspected muscle within the selected timeframe (Weekly = 7d, Monthly = 30d)
  const groupedMuscleWorkouts = useMemo(() => {
    if (!inspectedMuscle || interactive) return [];

    const now = Date.now();
    const windowMs = (timeframe === "monthly" ? 30 : 7) * 24 * 60 * 60 * 1000;
    const targetKey = inspectedMuscle === "forearms" ? "biceps" : inspectedMuscle;

    const matchingLogs = logs.filter((log) => {
      if (!log.exerciseName || log.id === "seed_1") return false;
      const logTime = new Date(log.timestamp).getTime();
      if (isNaN(logTime) || now - logTime > windowMs || now - logTime < -300000) return false;

      const lowerName = log.exerciseName.toLowerCase();

      const conf = EXERCISE_CONFIGS.find((c) => c.name.toLowerCase() === lowerName);
      const dbEx = getAllExercises().find((e) => e.name.toLowerCase() === lowerName);
      const muscles = (conf?.muscles || dbEx?.muscles || {}) as Record<string, number>;
      const builds = (conf?.builds || dbEx?.builds || {}) as Record<string, number>;
      const subs = conf?.subCategories || dbEx?.subCategories || [];
      const pillar = conf?.pillar || dbEx?.pillar;

      if (targetKey === "cardio") {
        return pillar === "cardio" || log.categoryName?.toLowerCase() === "cardio";
      }

      if ((muscles[targetKey] || 0) > 0) return true;
      if (subs.includes(targetKey)) return true;
      if (targetKey === "chest" && (builds.chestStrength || 0) > 0) return true;
      if (targetKey === "back" && (builds.backStrength || 0) > 0) return true;
      if (targetKey === "core" && (builds.coreStrength || 0) > 0) return true;

      return false;
    });

    // Group sets by exercise name so it shows "Exercise Name   X4"
    const groupedMap = new Map<string, { exerciseName: string; count: number; latestTimestamp: number }>();

    matchingLogs.forEach((log) => {
      const name = log.exerciseName!;
      const key = name.toLowerCase();
      const ts = new Date(log.timestamp).getTime() || 0;
      const existing = groupedMap.get(key);
      if (existing) {
        existing.count += 1;
        if (ts > existing.latestTimestamp) existing.latestTimestamp = ts;
      } else {
        groupedMap.set(key, {
          exerciseName: name,
          count: 1,
          latestTimestamp: ts
        });
      }
    });

    if (groupedMap.size === 0) {
      // Always show default exercises for this muscle (with X0) if none logged yet in this window
      const defaultExercisesForMuscle = getAllExercises()
        .filter((ex) => {
          if (targetKey === "cardio") return ex.pillar === "cardio";
          const m = (ex.muscles || {}) as Record<string, number>;
          return (m[targetKey] || 0) > 0;
        })
        .slice(0, 4);

      return defaultExercisesForMuscle.map((ex, idx) => ({
        exerciseName: ex.name,
        count: 0,
        latestTimestamp: -idx
      }));
    }

    return Array.from(groupedMap.values()).sort(
      (a, b) => b.latestTimestamp - a.latestTimestamp || b.count - a.count
    );
  }, [inspectedMuscle, logs, interactive, timeframe]);

  const formattedSelected = selectedMuscles.map((m) => m.toUpperCase()).join(", ");

  return (
    <div className="space-y-2.5 w-full">
      {!interactive && (
        <div className="flex justify-center">
          <div className="bg-[#161B22] border border-slate-800 p-1 rounded-full flex items-center shadow-lg">
            {(["weekly", "monthly"] as const).map((mode) => {
              const isActive = timeframe === mode;
              return (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setTimeframe(mode)}
                  className={`px-5 py-1.5 rounded-full text-[8.5px] font-press-start tracking-wider uppercase transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "bg-gradient-to-r from-cyan-950/90 via-cyan-900/50 to-slate-900 border border-cyan-400/60 text-cyan-300 font-extrabold shadow-[0_0_10px_rgba(6,182,212,0.25)]"
                      : "text-slate-500 hover:text-slate-300 border border-transparent"
                  }`}
                >
                  {mode === "weekly" ? "WEEKLY" : "MONTHLY"}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex flex-col items-center justify-center bg-[#0D0D0E] border-2 border-slate-800 rounded-2xl p-4 shadow-2xl w-full relative space-y-3">
        <div className="text-[9px] font-press-start text-cyan-400 tracking-widest uppercase text-center">
          {title || (interactive ? "SELECT TARGET MUSCLES (TAP BODY)" : `${timeframe === "weekly" ? "WEEKLY" : "MONTHLY"} ANATOMY TARGETING HUD`)}
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
              if (interactive) {
                const isSelected = selectedMuscles.includes(path.muscle);
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
              }

              // Status mode: non-clickable character image retaining green/yellow/red color
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

        {/* Horizontal Scrollable Muscle Selector + Separate Cardio Button */}
        {!interactive && (
          <div className="w-full space-y-2.5 pt-1">
            <div
              className="flex items-center gap-2 overflow-x-auto pb-1.5 pt-0.5 px-1 scrollbar-thin"
              style={{ WebkitOverflowScrolling: "touch" }}
            >
              {SCROLLABLE_MUSCLES.map((m) => {
                const isSelected = inspectedMuscle === m.key;
                const pct = Math.round(getProgress(m.key));
                return (
                  <button
                    key={m.key}
                    type="button"
                    onClick={() => setInspectedMuscle(m.key)}
                    className={`shrink-0 px-3.5 py-2 rounded-xl border text-[8.5px] font-press-start tracking-wider uppercase cursor-pointer transition active:scale-95 flex items-center gap-1.5 ${
                      isSelected
                        ? "bg-cyan-950/70 border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.25)]"
                        : "bg-[#161B22] border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white"
                    }`}
                  >
                    <span>{m.label}</span>
                    <span className="font-mono text-[8px] text-emerald-400 font-bold">
                      {pct}%
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Separate Button for Cardio */}
            <button
              type="button"
              onClick={() => setInspectedMuscle("cardio")}
              style={{ minHeight: "42px" }}
              className={`w-full border-2 rounded-xl px-4 py-2 flex items-center justify-center gap-2 font-press-start text-[9.5px] uppercase cursor-pointer transition active:scale-95 ${
                inspectedMuscle === "cardio"
                  ? "bg-cyan-950/70 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)] font-bold"
                  : "bg-[#161B22] hover:bg-[#1c222b] border-slate-800 text-slate-300 hover:text-white"
              }`}
            >
              <Flame className="w-4 h-4 text-cyan-400" />
              <span>CARDIO</span>
              <span className="font-mono text-[9px] text-emerald-400 font-bold">
                ({Math.round(getProgress("cardio"))}%)
              </span>
            </button>
          </div>
        )}

        {/* Always-Visible Past Workouts Window for the Selected Muscle (Exercise Name + X4 set count) */}
        {!interactive && inspectedMuscle && (
          <div className="w-full">
            <div className="bg-[#141920] border-2 border-cyan-500/40 rounded-xl p-3.5 space-y-2.5 shadow-[0_0_20px_rgba(6,182,212,0.15)]">
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-2 gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-press-start text-cyan-300 uppercase tracking-wider">
                    {inspectedMuscle.toUpperCase()} WORKOUTS
                  </span>
                </div>
                <span className="text-[8px] font-mono font-extrabold px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/40 text-cyan-300">
                  {timeframe.toUpperCase()}: {getProgress(inspectedMuscle).toFixed(0)}%
                </span>
              </div>

              {/* Grouped Past Workouts List: Exercise Name -> X4 */}
              <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin">
                {groupedMuscleWorkouts.map((item) => (
                  <div
                    key={item.exerciseName}
                    className="bg-[#0D0D0E] border border-slate-850 rounded-lg px-3 py-2 flex items-center justify-between gap-2"
                  >
                    <span className="text-[8.5px] font-press-start text-white truncate uppercase">
                      {item.exerciseName}
                    </span>
                    <span className="text-[10px] font-mono font-black text-emerald-400 shrink-0">
                      X{item.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
