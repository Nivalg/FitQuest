import React, { useState, useMemo } from "react";
import { pixelMusclePaths } from "../data/pixelMusclePaths";
import { FitnessLog } from "../types";
import { getAllExercises } from "../exercises";
import { EXERCISE_CONFIGS } from "../utils/fitnessMath";
import { motion, AnimatePresence } from "motion/react";

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
  const [inspectedMuscle, setInspectedMuscle] = useState<string | null>(null);

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

  // Find past workouts targeting the inspected muscle
  const inspectedMuscleWorkouts = useMemo(() => {
    if (!inspectedMuscle || interactive) return [];

    const targetKey = inspectedMuscle === "forearms" ? "biceps" : inspectedMuscle;

    const matchingLogs = logs.filter((log) => {
      if (!log.exerciseName || log.id === "seed_1") return false;
      const lowerName = log.exerciseName.toLowerCase();

      const conf = EXERCISE_CONFIGS.find((c) => c.name.toLowerCase() === lowerName);
      const dbEx = getAllExercises().find((e) => e.name.toLowerCase() === lowerName);
      const muscles = (conf?.muscles || dbEx?.muscles || {}) as Record<string, number>;
      const builds = (conf?.builds || dbEx?.builds || {}) as Record<string, number>;
      const subs = conf?.subCategories || dbEx?.subCategories || [];

      if ((muscles[targetKey] || 0) > 0) return true;
      if (subs.includes(targetKey)) return true;
      if (targetKey === "chest" && (builds.chestStrength || 0) > 0) return true;
      if (targetKey === "back" && (builds.backStrength || 0) > 0) return true;
      if (targetKey === "core" && (builds.coreStrength || 0) > 0) return true;
      if (inspectedMuscle === "forearms" && /curl|deadlift|row|pull|shrug|carry/i.test(lowerName)) return true;

      return false;
    });

    // Sort newest first
    return [...matchingLogs].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [inspectedMuscle, logs, interactive]);

  const formatLogDetails = (log: FitnessLog): string => {
    if (log.weight && log.reps) return `${log.weight} lbs × ${log.reps} reps`;
    if (log.reps) return `${log.reps} reps`;
    if (log.distance && log.minutes) return `${log.distance} mi in ${log.minutes}m`;
    if (log.floors && log.minutes) return `${log.floors} floors in ${log.minutes}m`;
    if (log.minutes || log.seconds) return `${log.minutes || 0}m ${log.seconds || 0}s`;
    return log.newValue || "Completed";
  };

  const formatLogDate = (iso: string): string => {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit"
    });
  };

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

      <div className="flex flex-col items-center justify-center bg-[#0D0D0E] border-2 border-slate-800 rounded-2xl p-4 shadow-2xl w-full relative">
        <div className="text-[9px] font-press-start text-cyan-400 tracking-widest uppercase mb-1 text-center">
          {title || (interactive ? "SELECT TARGET MUSCLES (TAP BODY)" : `${timeframe === "weekly" ? "WEEKLY" : "MONTHLY"} ANATOMY TARGETING HUD`)}
        </div>
        {!interactive && (
          <p className="text-[8px] font-mono text-slate-400 mb-2.5 text-center">
            Tap any muscle on the diagram to view past workouts for that muscle
          </p>
        )}

        <div className="relative w-full max-w-[340px] aspect-[976/585] bg-black rounded-xl overflow-hidden border border-slate-900 shadow-inner">
          {formattedSelected ? (
            <div className="absolute top-2 right-2 bg-slate-950/90 border border-cyan-400/80 px-2.5 py-1 rounded-lg text-cyan-300 font-press-start text-[8px] uppercase tracking-wider shadow-[0_0_10px_rgba(6,182,212,0.3)] z-20 pointer-events-none max-w-[70%] truncate text-right">
              {formattedSelected}
            </div>
          ) : interactive ? (
            <div className="absolute top-2 right-2 bg-slate-950/90 border border-cyan-400/80 px-2.5 py-1 rounded-lg text-cyan-300 font-press-start text-[8px] uppercase tracking-wider shadow-[0_0_10px_rgba(6,182,212,0.3)] z-20 pointer-events-none max-w-[70%] truncate text-right">
              SELECT MUSCLE
            </div>
          ) : inspectedMuscle ? (
            <div className="absolute top-2 right-2 bg-slate-950/90 border border-cyan-400/80 px-2.5 py-1 rounded-lg text-cyan-300 font-press-start text-[8px] uppercase tracking-wider shadow-[0_0_10px_rgba(6,182,212,0.3)] z-20 pointer-events-none">
              {inspectedMuscle.toUpperCase()} ({getProgress(inspectedMuscle).toFixed(0)}%)
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

              // Status mode: keep green/yellow/red muscle color and make every muscle clickable
              const tier = getMuscleTier(path.muscle);
              const fillColor =
                tier === "yellow"
                  ? "#eab308"
                  : tier === "red"
                  ? "#ef4444"
                  : "transparent";

              return (
                <path
                  key={`${path.id}-${idx}-status`}
                  d={path.d}
                  fill={fillColor}
                  className="cursor-pointer transition-opacity hover:opacity-80"
                  onClick={() =>
                    setInspectedMuscle((prev) => (prev === path.muscle ? null : path.muscle))
                  }
                />
              );
            })}
          </svg>
        </div>

        {/* Slide-Down Past Workouts Window for the Clicked Muscle */}
        <AnimatePresence>
          {!interactive && inspectedMuscle && (
            <motion.div
              key="muscle-history-drawer"
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: "auto", marginTop: 14 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="w-full overflow-hidden"
            >
              <div className="bg-[#141920] border-2 border-cyan-500/40 rounded-xl p-3.5 space-y-3 shadow-[0_0_20px_rgba(6,182,212,0.15)]">
                {/* Drawer Header */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5 gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[9.5px] font-press-start text-cyan-300 uppercase tracking-wider">
                        {inspectedMuscle.toUpperCase()} WORKOUT LOGS
                      </span>
                      <span className="text-[8px] font-mono font-extrabold px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-500/40 text-cyan-300">
                        {timeframe.toUpperCase()}: {getProgress(inspectedMuscle).toFixed(1)}%
                      </span>
                    </div>
                    <p className="text-[7.5px] font-mono text-slate-400 mt-0.5">
                      {inspectedMuscleWorkouts.length} recorded set{inspectedMuscleWorkouts.length === 1 ? "" : "s"} targeting {inspectedMuscle}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setInspectedMuscle(null)}
                    className="w-6 h-6 rounded-lg bg-[#0D0D0E] border border-slate-800 hover:border-cyan-400 text-slate-400 hover:text-white text-xs font-mono flex items-center justify-center cursor-pointer transition shrink-0"
                    title="Close window"
                  >
                    ✕
                  </button>
                </div>

                {/* Past Workouts List */}
                {inspectedMuscleWorkouts.length === 0 ? (
                  <div className="text-center py-5 text-slate-500 font-mono text-[8.5px] uppercase border border-dashed border-slate-800 rounded-xl">
                    No past workouts logged for {inspectedMuscle} yet.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1 scrollbar-thin">
                    {inspectedMuscleWorkouts.slice(0, 30).map((log) => (
                      <div
                        key={log.id}
                        className="bg-[#0D0D0E] border border-slate-850 rounded-lg px-3 py-2 flex items-center justify-between gap-2"
                      >
                        <div className="min-w-0">
                          <span className="text-[8.5px] font-press-start text-white block truncate">
                            {log.exerciseName}
                          </span>
                          <span className="text-[7.5px] font-mono text-slate-500 block mt-0.5">
                            {formatLogDate(log.timestamp)}
                          </span>
                        </div>
                        <span className="text-[8.5px] font-mono font-bold text-emerald-400 shrink-0">
                          {formatLogDetails(log)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
