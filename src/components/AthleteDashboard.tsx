import React from "react";
import { AthleteProfile, FitnessLog } from "../types";
import {
  evaluateAthletePerformance,
  getMetricTier,
  formatLevel,
  EXERCISE_CONFIGS
} from "../utils/fitnessMath";
import {
  Trophy,
  Dumbbell,
  Clock,
  RotateCcw,
  Activity,
  Flame,
  Award,
  Zap,
  Target,
  Shield,
  History,
  Heart,
  Sparkles,
  ArrowRight,
  Info
} from "lucide-react";
import { motion } from "motion/react";
import MuscleVolumeVisualizer from "./MuscleVolumeVisualizer";

interface AthleteDashboardProps {
  profile: AthleteProfile;
  logs: FitnessLog[];
  onProfileUpdate?: (profile: AthleteProfile) => void;
  onRecordLog?: (logData: any) => void;
  onReset: () => void;
  onNavigateToLogs: () => void;
  onNavigateToExercises: () => void;
}

export default function AthleteDashboard({
  profile,
  logs,
  onReset,
  onNavigateToLogs,
  onNavigateToExercises
}: AthleteDashboardProps) {

  const [activeSubTab, setActiveSubTab] = React.useState<"character" | "training">("character");
  const [selectedStatDetail, setSelectedStatDetail] = React.useState<{
    key: string;
    label: string;
    level: number;
    desc: string;
    textColor: string;
    icon: React.ReactNode;
  } | null>(null);
  const [isAllRecordsOpen, setIsAllRecordsOpen] = React.useState(false);

  // Evaluate complete athletic details using our stateless progressive overload engine
  const performance = evaluateAthletePerformance(logs, profile.bodyWeight);
  const weeklyVolume = performance.weeklyVolume;
  const recoveryRemaining = performance.recoveryRemaining;
  const exerciseDetails = performance.exerciseDetails;

  // Rotate achievements every 5 seconds
  const [activeRecordIndex, setActiveRecordIndex] = React.useState(0);

  // Compute all personal records dynamically from logs
  const records = React.useMemo(() => {
    const list: { title: string; val: string; icon: string; style: string }[] = [];

    // 1. Max Bench Press
    const benchLogs = logs.filter(l => l.exerciseName === "Bench Press" && l.weight && l.reps);
    if (benchLogs.length > 0) {
      let max1RM = 0;
      let maxLog = benchLogs[0];
      benchLogs.forEach(l => {
        const oneRepMax = l.weight! * (1 + l.reps! / 30);
        if (oneRepMax > max1RM) {
          max1RM = oneRepMax;
          maxLog = l;
        }
      });
      list.push({
        title: "MAX BENCH PRESS (EST. 1RM)",
        val: `${Math.round(max1RM)} LBS (${maxLog.weight} LBS x ${maxLog.reps} REPS)`,
        icon: "🏋️",
        style: "border-cyan-500/30 text-cyan-400"
      });
    }

    // 2. Max Squat
    const squatLogs = logs.filter(l => l.exerciseName === "Barbell Squat" && l.weight && l.reps);
    if (squatLogs.length > 0) {
      let max1RM = 0;
      let maxLog = squatLogs[0];
      squatLogs.forEach(l => {
        const oneRepMax = l.weight! * (1 + l.reps! / 30);
        if (oneRepMax > max1RM) {
          max1RM = oneRepMax;
          maxLog = l;
        }
      });
      list.push({
        title: "MAX BARBELL SQUAT (EST. 1RM)",
        val: `${Math.round(max1RM)} LBS (${maxLog.weight} LBS x ${maxLog.reps} REPS)`,
        icon: "🦵",
        style: "border-emerald-500/30 text-emerald-400"
      });
    }

    // 3. Max Deadlift
    const deadliftLogs = logs.filter(l => l.exerciseName === "Deadlift" && l.weight && l.reps);
    if (deadliftLogs.length > 0) {
      let max1RM = 0;
      let maxLog = deadliftLogs[0];
      deadliftLogs.forEach(l => {
        const oneRepMax = l.weight! * (1 + l.reps! / 30);
        if (oneRepMax > max1RM) {
          max1RM = oneRepMax;
          maxLog = l;
        }
      });
      list.push({
        title: "MAX DEADLIFT (EST. 1RM)",
        val: `${Math.round(max1RM)} LBS (${maxLog.weight} LBS x ${maxLog.reps} REPS)`,
        icon: "💪",
        style: "border-orange-500/30 text-orange-400"
      });
    }

    // 4. Fastest Mile
    const runLogs = logs.filter(l => (l.exerciseName === "Treadmill Run / Jog" || l.exerciseName === "Sprint Intervals") && l.distance && l.minutes !== undefined && l.seconds !== undefined);
    if (runLogs.length > 0) {
      let fastestPace = Infinity; // seconds per mile
      let fastestLog = runLogs[0];
      runLogs.forEach(l => {
        const totalSeconds = l.minutes! * 60 + l.seconds!;
        const pace = totalSeconds / l.distance!;
        if (pace < fastestPace) {
          fastestPace = pace;
          fastestLog = l;
        }
      });
      if (fastestPace !== Infinity) {
        const minutesPart = Math.floor(fastestPace / 60);
        const secondsPart = Math.round(fastestPace % 60);
        list.push({
          title: "FASTEST MILE PACE",
          val: `${minutesPart}:${secondsPart.toString().padStart(2, "0")} / MILE (${fastestLog.distance} MI in ${fastestLog.minutes}m ${fastestLog.seconds}s)`,
          icon: "⚡",
          style: "border-rose-500/30 text-rose-400"
        });
      }
    }

    // 5. Most Floors Climbed
    const stairLogs = logs.filter(l => l.exerciseName === "Stairmaster" && l.floors);
    if (stairLogs.length > 0) {
      const maxFloors = Math.max(...stairLogs.map(l => l.floors!));
      list.push({
        title: "MOST FLOORS CLIMBED",
        val: `${maxFloors} FLOORS`,
        icon: "🪜",
        style: "border-purple-500/30 text-purple-400"
      });
    }

    // 6. Most Pushups Done
    const pushupLogs = logs.filter(l => l.exerciseName === "Regular Push-Ups" && l.reps);
    if (pushupLogs.length > 0) {
      const maxReps = Math.max(...pushupLogs.map(l => l.reps!));
      list.push({
        title: "MOST PUSH-UPS",
        val: `${maxReps} REPS`,
        icon: "👊",
        style: "border-cyan-500/30 text-cyan-400"
      });
    }

    // 7. Longest Distance Ran
    const cardioLogs = logs.filter(l => l.distance);
    if (cardioLogs.length > 0) {
      const maxDist = Math.max(...cardioLogs.map(l => l.distance!));
      list.push({
        title: "LONGEST DISTANCE RUN",
        val: `${maxDist.toFixed(2)} MILES`,
        icon: "🏃",
        style: "border-rose-500/30 text-rose-400"
      });
    }

    // 8. Most Situps
    const situpLogs = logs.filter(l => l.exerciseName === "Sit-Ups" && l.reps);
    if (situpLogs.length > 0) {
      const maxReps = Math.max(...situpLogs.map(l => l.reps!));
      list.push({
        title: "MOST SIT-UPS",
        val: `${maxReps} REPS`,
        icon: "🎯",
        style: "border-amber-500/30 text-amber-400"
      });
    }

    // 9. Most Bodyweight Squats
    const bwSquatLogs = logs.filter(l => l.exerciseName === "Bodyweight Squats" && l.reps);
    if (bwSquatLogs.length > 0) {
      const maxReps = Math.max(...bwSquatLogs.map(l => l.reps!));
      list.push({
        title: "MOST BODYWEIGHT SQUATS",
        val: `${maxReps} REPS`,
        icon: "🦵",
        style: "border-emerald-500/30 text-emerald-400"
      });
    }

    // 10. Longest Plank
    const plankLogs = logs.filter(l => l.exerciseName === "Plank" && l.minutes !== undefined && l.seconds !== undefined);
    if (plankLogs.length > 0) {
      let maxTime = 0; // in seconds
      plankLogs.forEach(l => {
        const total = l.minutes! * 60 + l.seconds!;
        if (total > maxTime) maxTime = total;
      });
      const mins = Math.floor(maxTime / 60);
      const secs = maxTime % 60;
      list.push({
        title: "LONGEST PLANK HOLD",
        val: `${mins}m ${secs.toString().padStart(2, "0")}s`,
        icon: "🛡️",
        style: "border-amber-500/30 text-amber-400"
      });
    }

    return list;
  }, [logs]);

  // Set up rotation timer
  React.useEffect(() => {
    if (records.length <= 1) return;
    const interval = setInterval(() => {
      setActiveRecordIndex(prev => (prev + 1) % records.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [records]);

  const statKeys = [
    "chestStrength",
    "backStrength",
    "armStrength",
    "legStrength",
    "coreStrength",
    "speed",
    "stamina"
  ] as const;

  // Calculate true multi-dimensional Level Index
  const totalLevels = statKeys.reduce((acc, key) => acc + (Number(performance.statLevels[key]) || 1.00), 0);
  const averageLevelFloat = totalLevels / 7;
  const averageLevelDecimal = parseFloat(averageLevelFloat.toFixed(2));
  const averageXP = Math.round((averageLevelFloat % 1) * 100);

  // Define tier level text of overall athlete
  const overallTier = getMetricTier(averageLevelFloat);

  // 7 core strength stats with icons, labels, types and descriptions
  const fitnessStatsList = [
    {
      key: "chestStrength",
      label: "Chest Strength",
      desc: "Horizontal pushing force, barbell bench presses & machine flies.",
      color: "from-cyan-500 to-blue-500",
      textColor: "text-cyan-400",
      bgBorder: "border-cyan-500/20",
      bgLight: "bg-cyan-500/5",
      icon: <Dumbbell className="w-5 h-5 text-cyan-400" />
    },
    {
      key: "backStrength",
      label: "Back Strength",
      desc: "Posterior spine pulling integrity, heavy deadlifts & pulldown sets.",
      color: "from-orange-500 to-amber-500",
      textColor: "text-orange-400",
      bgBorder: "border-orange-500/20",
      bgLight: "bg-orange-500/5",
      icon: <Shield className="w-5 h-5 text-orange-400" />
    },
    {
      key: "legStrength",
      label: "Leg Strength",
      desc: "Low-end squat power, heavy machine leg press & Stairmaster climbing.",
      color: "from-emerald-500 to-teal-500",
      textColor: "text-emerald-400",
      bgBorder: "border-emerald-500/20",
      bgLight: "bg-emerald-500/5",
      icon: <Activity className="w-5 h-5 text-emerald-400" />
    },
    {
      key: "armStrength",
      label: "Arm Strength",
      desc: "Tendon tricep dips, bicep curls & strict barbell vertical press.",
      color: "from-pink-500 to-rose-500",
      textColor: "text-pink-400",
      bgBorder: "border-pink-500/20",
      bgLight: "bg-pink-500/5",
      icon: <Zap className="w-5 h-5 text-pink-400" />
    },
    {
      key: "coreStrength",
      label: "Core Strength",
      desc: "Isometric trunk plank duration & sit-ups contraction torque.",
      color: "from-amber-500 to-yellow-500",
      textColor: "text-amber-400",
      bgBorder: "border-amber-500/20",
      bgLight: "bg-amber-500/5",
      icon: <Target className="w-5 h-5 text-amber-400" />
    },
    {
      key: "speed",
      label: "Speed",
      desc: "Sprint pacing, high-speed velocity, and running cadence.",
      color: "from-rose-500 to-red-500",
      textColor: "text-rose-400",
      bgBorder: "border-rose-500/20",
      bgLight: "bg-rose-500/5",
      icon: <Flame className="w-5 h-5 text-rose-400" />
    },
    {
      key: "stamina",
      label: "Stamina",
      desc: "Global cardiorespiratory endurance, high-rep machine capacity & bodyweight endurance.",
      color: "from-purple-500 to-violet-500",
      textColor: "text-purple-400",
      bgBorder: "border-purple-500/20",
      bgLight: "bg-purple-500/5",
      icon: <Clock className="w-5 h-5 text-purple-400" />
    }
  ] as const;

  // Muscle Volume details helpers
  const volumeLabels: Record<string, string> = {
    chestStrength: "Chest Sets",
    backStrength: "Back Sets",
    armStrength: "Arms Sets",
    legStrength: "Legs Sets",
    coreStrength: "Core Sets",
    speed: "Speed Sets",
    stamina: "Stamina Sets"
  };

  const volumeColors: Record<string, string> = {
    chestStrength: "bg-cyan-550",
    backStrength: "bg-orange-550",
    armStrength: "bg-pink-550",
    legStrength: "bg-emerald-550",
    coreStrength: "bg-amber-550",
    speed: "bg-rose-550",
    stamina: "bg-purple-550"
  };



  return (
    <div className="space-y-6">
      
      {/* Centered Capsule Sub-Navigation */}
      <div className="flex justify-center pb-2">
        <div className="bg-[#161B22] border border-slate-800 p-1 rounded-full flex items-center relative overflow-hidden shadow-lg shadow-cyan-950/10">
          {/* Sliding active glow pill indicator */}
          <div 
            className="absolute top-1 bottom-1 bg-gradient-to-r from-cyan-950 to-slate-900 border border-cyan-500/30 rounded-full transition-all duration-300 ease-out shadow-[0_0_10px_rgba(6,182,212,0.15)] pointer-events-none"
            style={{
              left: activeSubTab === "character" ? "4px" : "calc(50% + 2px)",
              width: "calc(50% - 6px)",
            }}
          />

          <button
            onClick={() => setActiveSubTab("character")}
            style={{ minHeight: "36px", minWidth: "120px" }}
            className={`px-4 py-1.5 rounded-full text-[10px] font-press-start tracking-wider transition-all duration-300 relative z-10 cursor-pointer ${
              activeSubTab === "character"
                ? "text-cyan-400 font-extrabold"
                : "text-slate-500 hover:text-slate-350"
            }`}
          >
            CHARACTER
          </button>

          <button
            onClick={() => setActiveSubTab("training")}
            style={{ minHeight: "36px", minWidth: "120px" }}
            className={`px-4 py-1.5 rounded-full text-[10px] font-press-start tracking-wider transition-all duration-300 relative z-10 cursor-pointer ${
              activeSubTab === "training"
                ? "text-cyan-400 font-extrabold"
                : "text-slate-500 hover:text-slate-350"
            }`}
          >
            TRAINING
          </button>
        </div>
      </div>

      {activeSubTab === "character" ? (
        <motion.div 
          key="character-view"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="space-y-6"
        >
          {/* ATHLETE RPG PROFILE STATUS OVERVIEW */}
          <div className="bg-[#161B22] border-2 border-slate-800 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-cyan-500/10 to-transparent rounded-full blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-emerald-500/5 to-transparent rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-center justify-between w-full gap-4">
              {/* Left side: name & rank */}
              <div className="text-center flex flex-col items-center justify-center space-y-1.5 min-w-0 flex-1">
                <h2 className="text-xs sm:text-sm font-press-start text-white tracking-wider truncate w-full text-center">
                  {profile.name.toUpperCase()}
                </h2>
                <div className="flex justify-center w-full mt-1">
                  <span className="inline-block text-[10px] font-mono font-extrabold bg-[#0D0D0E] text-slate-300 border border-slate-800 px-3 py-1 rounded-lg truncate max-w-full shadow-sm">
                    {overallTier.name.toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Right side: Age and Weight inside a single box wrapper */}
              <div className="flex items-center gap-3 bg-[#0D0D0E]/85 border border-slate-800 p-2.5 rounded-xl shrink-0">
                <div className="text-center px-1">
                  <span className="text-[7px] font-press-start text-slate-500 block uppercase tracking-wider">AGE</span>
                  <span className="text-xs font-mono text-cyan-400 font-black block mt-1">
                    {profile.age} <span className="text-[8px] text-slate-500 font-bold">YRS</span>
                  </span>
                </div>
                <div className="w-[1px] h-6 bg-slate-800 shrink-0" />
                <div className="text-center px-1">
                  <span className="text-[7px] font-press-start text-slate-500 block uppercase tracking-wider">WEIGHT</span>
                  <span className="text-xs font-mono text-emerald-400 font-black block mt-1">
                    {profile.bodyWeight} <span className="text-[8px] text-slate-500 font-bold">LBS</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* THE 7 CORE GAME STATS HUD LIST - TAP FRIENDLY AND CLEAN */}
          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-press-start text-cyan-300 tracking-wider uppercase">
                📊 PERFORMANCE STRENGTH
              </h3>
              <p className="text-[10px] text-slate-400 font-mono mt-1 leading-relaxed">
                Stateless Performance Index levels (0.00 - 100.00). Derived from your physical capacities.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {fitnessStatsList.map((stat) => {
                const levelValue = Number(performance.statLevels[stat.key]) || 0;
                const shortLabel = stat.label.replace("Strength", "").trim().toUpperCase();

                return (
                  <button
                    key={stat.key}
                    id={`stat-${stat.key}`}
                    onClick={() => setSelectedStatDetail({
                      key: stat.key,
                      label: stat.label,
                      level: Math.ceil(levelValue),
                      desc: stat.desc,
                      textColor: stat.textColor,
                      icon: stat.icon
                    })}
                    className="flex items-center justify-between p-3 bg-[#161B22]/90 border border-slate-800 rounded-xl shadow-lg hover:border-slate-700 active:scale-[0.98] transition duration-150 text-left w-full cursor-pointer focus:outline-none focus:ring-1 focus:ring-cyan-500/30"
                  >
                    <div className="flex items-center gap-2">
                      <div className="shrink-0 p-1.5 bg-[#0D0D0E]/60 border border-slate-900 rounded-lg">
                        {stat.icon}
                      </div>
                      <span className="text-[9px] font-press-start text-slate-350 tracking-wider">
                        {shortLabel}:
                      </span>
                    </div>
                    <span className={`text-base font-sans font-black tracking-wide ${stat.textColor}`}>
                      {Math.ceil(levelValue)}
                    </span>
                  </button>
                );
              })}

              {/* 8th Card Wrapper: LEVEL back inside the regular grid structure */}
              <button
                key="level-card"
                id="stat-level"
                onClick={() => setSelectedStatDetail({
                  key: "averageLevel",
                  label: "Player Level",
                  level: Math.ceil(averageLevelFloat),
                  desc: "Your overall Athlete Level, representing the average level across all 7 training sectors.",
                  textColor: "text-cyan-400",
                  icon: <Trophy className="w-5 h-5 text-cyan-400" />
                })}
                className="flex items-center justify-between p-3 bg-[#161B22] border-2 border-cyan-500/35 rounded-xl bg-cyan-500/5 shadow-[0_0_12px_rgba(6,182,212,0.08)] hover:border-cyan-500/50 active:scale-[0.98] transition duration-150 text-left w-full cursor-pointer focus:outline-none focus:ring-1 focus:ring-cyan-500/30"
              >
                <div className="flex items-center gap-2">
                  <div className="shrink-0 p-1.5 bg-[#0D0D0E] border border-cyan-500/40 rounded-lg">
                    <Trophy className="w-4.5 h-4.5 text-cyan-400 animate-pulse" />
                  </div>
                  <span className="text-[9px] font-press-start text-cyan-300 tracking-wider">
                    LEVEL:
                  </span>
                </div>
                <span className="text-base font-sans font-black tracking-wide text-cyan-400">
                  {Math.ceil(averageLevelFloat)}
                </span>
              </button>
            </div>
          </div>

          {/* PERSONAL RECORD DYNAMIC CAROUSEL TICKER */}
          {records.length > 0 ? (
            <div className="space-y-3">
              <div className="bg-[#161B22] border-2 border-cyan-500/50 rounded-2xl p-5 shadow-[0_0_20px_rgba(6,182,212,0.15)] relative overflow-hidden h-[120px] flex flex-col justify-center animate-fade-in">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-cyan-500/10 to-transparent rounded-full blur-xl pointer-events-none" />
                
                <div className="flex items-center gap-4">
                  <div className="text-3xl shrink-0 p-2.5 bg-[#0D0D0E] border border-slate-800 rounded-xl">
                    {records[activeRecordIndex].icon}
                  </div>
                  
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="inline-block w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping shrink-0" />
                      <span className="text-[8px] font-press-start text-cyan-400 tracking-widest block uppercase">
                        PERSONAL RECORD SHIELD
                      </span>
                    </div>
                    <h3 className="text-[10px] font-press-start text-white truncate uppercase tracking-wider block mt-1">
                      {records[activeRecordIndex].title}
                    </h3>
                    <p className="text-xs font-mono font-black text-emerald-400 block tracking-wide mt-1">
                      {records[activeRecordIndex].val}
                    </p>
                  </div>
                </div>
                
                {/* Pagination Dots at bottom center */}
                {records.length > 1 && (
                  <div className="absolute bottom-2.5 left-0 right-0 flex justify-center gap-1.5">
                    {records.map((_, i) => (
                      <div 
                        key={i} 
                        className={`h-1 rounded-full transition-all duration-300 ${
                          i === activeRecordIndex ? "w-4 bg-cyan-400" : "w-1.5 bg-slate-850"
                        }`} 
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* SEE ALL RECORDS BUTTON */}
              <button
                onClick={() => setIsAllRecordsOpen(true)}
                style={{ minHeight: "36px" }}
                className="w-full bg-[#161B22]/90 hover:bg-[#1C232E] border-2 border-slate-800 hover:border-cyan-500/40 text-cyan-400 hover:text-cyan-300 rounded-xl text-[9px] font-press-start tracking-wider transition flex items-center justify-center gap-2 cursor-pointer duration-150 active:scale-[0.98] shadow-sm uppercase"
              >
                🏆 SEE ALL RECORDS
              </button>
            </div>
          ) : (
            <div className="bg-[#161B22] border-2 border-dashed border-slate-800 rounded-2xl p-5 shadow-inner text-center">
              <h3 className="text-xs font-press-start text-slate-500 tracking-wider">
                🛡️ CHARACTER RECORD SHIELD
              </h3>
              <p className="text-[10px] text-slate-400 font-mono mt-3 leading-relaxed">
                No personal records logged yet. Begin logging exercises under the EXERCISE tab to unlock rotating achievements here!
              </p>
            </div>
          )}

          {/* RETRO SAVE RESET UTILITY */}
          <div className="pt-2 flex justify-center">
            <button
              onClick={onReset}
              style={{ minHeight: "44px" }}
              className="w-full text-slate-500 hover:text-red-400 hover:border-red-950/20 border-2 border-slate-800 hover:bg-red-950/5 px-4 py-2.5 rounded-xl text-[9px] font-press-start tracking-wider transition flex items-center justify-center gap-2 cursor-pointer duration-150 active:scale-[0.98]"
            >
              <RotateCcw className="w-3.5 h-3.5 text-red-500/60" /> RESET GAME SAVE DATA
            </button>
          </div>
        </motion.div>
      ) : (
        <motion.div 
          key="training-view"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="space-y-6"
        >
          {/* 🚀 DYNAMIC WEEKLY VOLUME TRACKER */}
          <MuscleVolumeVisualizer weeklyVolume={weeklyVolume} />
        </motion.div>
      )}

      {/* 🔮 STAT RANK DETAIL MODAL OVERLAY */}
      {selectedStatDetail && (
        <div className="fixed inset-0 bg-[#090B0E]/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-[360px] bg-[#0D1117] border-2 border-cyan-500/50 rounded-2xl p-6 shadow-[0_0_30px_rgba(6,182,212,0.25)] relative overflow-hidden flex flex-col items-center text-center gap-4 animate-fade-in">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-cyan-500/10 to-transparent rounded-full blur-xl pointer-events-none" />
            
            {/* Stat Icon Header */}
            <div className="p-3 bg-[#161B22] border-2 border-cyan-500/20 rounded-2xl text-3xl">
              {selectedStatDetail.icon}
            </div>

            {/* Title & Level */}
            <div>
              <span className="text-[8px] font-press-start text-cyan-400 tracking-widest block uppercase mb-1">
                STAT DOSSIER
              </span>
              <h3 className="text-sm font-press-start text-white uppercase tracking-wider block">
                {selectedStatDetail.label}
              </h3>
              <div className="mt-2.5 inline-flex items-center gap-2 px-3 py-1 bg-[#161B22] border border-slate-800 rounded-lg">
                <span className="text-[9px] font-press-start text-slate-400">LEVEL:</span>
                <span className={`text-base font-sans font-black tracking-wide ${selectedStatDetail.textColor}`}>
                  {selectedStatDetail.level}
                </span>
              </div>
            </div>

            {/* Rank Tier Box */}
            {(() => {
              const tier = getMetricTier(selectedStatDetail.level);
              let rankExplain = "";
              if (selectedStatDetail.level < 15) {
                rankExplain = "Establishing foundational athletic parameters. Focus on basic physical volume. Target Level 50 to reach standard Average status!";
              } else if (selectedStatDetail.level < 50) {
                rankExplain = "Building dedicated physical capacity! Level 50 represents the standard Average benchmark—you are rapidly closing in on it.";
              } else if (selectedStatDetail.level === 50) {
                rankExplain = "Perfect Average score! You have achieved the standard solid fitness benchmark for a trained athlete.";
              } else if (selectedStatDetail.level < 65) {
                rankExplain = "Solid Intermediate range! You are safely above the standard Average (50) benchmark. Great structural integrity!";
              } else if (selectedStatDetail.level < 85) {
                rankExplain = "Advanced trainee! Tireless dedication has earned you high athletic output capacity, scaling far past the average.";
              } else if (selectedStatDetail.level < 100) {
                rankExplain = "Elite athlete status! You represent peak competitive structural margins and optimized absolute strength.";
              } else {
                rankExplain = "Peerless Master Pro! You have broken past the Elite 100 threshold into uncapped kinetic capacity limits.";
              }

              return (
                <div className="w-full space-y-3">
                  <div className={`p-2.5 rounded-xl border ${tier.bg} ${tier.border} flex flex-col items-center gap-1`}>
                    <span className="text-[8px] font-mono text-slate-500 font-black tracking-widest block uppercase leading-none">RANK TIER</span>
                    <span className={`text-xs font-mono font-black tracking-wide leading-none uppercase ${tier.color}`}>
                      {tier.name}
                    </span>
                  </div>
                  
                  <div className="bg-[#0D0D0E]/60 border border-slate-800 rounded-xl p-4 text-[10px] font-mono text-slate-350 leading-relaxed text-left space-y-2">
                    <p>{selectedStatDetail.desc}</p>
                    <div className="w-full h-[1px] bg-slate-800/80 my-1" />
                    <p className="text-cyan-400/90 font-bold">{rankExplain}</p>
                  </div>
                </div>
              );
            })()}

            {/* Action buttons */}
            <button
              onClick={() => setSelectedStatDetail(null)}
              style={{ minHeight: "40px" }}
              className="w-full bg-cyan-500 hover:bg-cyan-600 active:scale-[0.98] transition cursor-pointer text-black font-press-start text-[9px] tracking-wider py-2.5 rounded-xl font-bold shadow-md shadow-cyan-500/10 uppercase"
            >
              DISMISS
            </button>
          </div>
        </div>
      )}

      {/* 🏆 PERSONAL RECORDS ALL LEDGER MODAL OVERLAY */}
      {isAllRecordsOpen && (
        <div className="fixed inset-0 bg-[#090B0E]/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-[360px] bg-[#0D1117] border-2 border-cyan-500/50 rounded-2xl p-6 shadow-[0_0_30px_rgba(6,182,212,0.25)] relative overflow-hidden flex flex-col gap-4 animate-fade-in max-h-[85vh]">
            {/* Background elements */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-cyan-500/10 to-transparent rounded-full blur-xl pointer-events-none" />
            
            {/* Header */}
            <div className="text-center">
              <span className="text-[8px] font-press-start text-cyan-400 tracking-widest block uppercase mb-1">
                HALL OF TRIUMPH
              </span>
              <h3 className="text-xs font-press-start text-white uppercase tracking-wider block">
                🏆 ATHLETE RECORDS 🏆
              </h3>
            </div>

            {/* Scrollable Records List */}
            <div className="space-y-2 overflow-y-auto max-h-[300px] pr-1 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
              {records.map((rec, i) => (
                <div 
                  key={i}
                  className="flex items-center gap-3 p-3 bg-[#0D0D0E]/80 border border-slate-800/85 hover:border-slate-700 rounded-xl transition duration-150"
                >
                  <div className="text-2xl shrink-0 p-2 bg-[#161B22] border border-slate-800 rounded-xl flex items-center justify-center w-11 h-11">
                    {rec.icon}
                  </div>
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <span className="text-[7px] font-press-start text-slate-400 uppercase tracking-wider block truncate">
                      {rec.title}
                    </span>
                    <span className="text-xs font-mono font-black text-emerald-400 block tracking-wide truncate">
                      {rec.val}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Action buttons */}
            <button
              onClick={() => setIsAllRecordsOpen(false)}
              style={{ minHeight: "40px" }}
              className="w-full bg-cyan-500 hover:bg-cyan-600 active:scale-[0.98] transition cursor-pointer text-black font-press-start text-[9px] tracking-wider py-2.5 rounded-xl font-bold shadow-md shadow-cyan-500/10 uppercase"
            >
              DISMISS LEDGER
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
