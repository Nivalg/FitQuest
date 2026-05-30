import { useState, useEffect } from "react";
import { AthleteProfile, FitnessLog, FitnessMetricType } from "./types";
import FitnessProfileSetup from "./components/fitnessProfileSetup";
import AthleteDashboard from "./components/AthleteDashboard";
import { WorkoutCalendar } from "./components/WorkoutCalendar";
import PastQuests from "./components/PastQuests";
import { WorkoutLogger } from "./components/WorkoutLogger";
import { EXERCISE_DATABASE } from "./exercises";
import { getStatLevelsFromLogs, evaluateAthletePerformance } from "./utils/fitnessMath";
import {
  Trophy,
  Dumbbell,
  Calendar as CalendarIcon,
  RotateCcw,
  Sliders
} from "lucide-react";

export default function App() {
  const [profile, setProfile] = useState<AthleteProfile | null>(null);
  const [logs, setLogs] = useState<FitnessLog[]>([]);
  const [activeTab, setActiveTab] = useState<"dashboard" | "log" | "calendar">("dashboard");
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  // Initialize state from LocalStorage on mount
  useEffect(() => {
    const savedProfile = localStorage.getItem("fit-rpg_profile") || localStorage.getItem("fitrpg_profile") || localStorage.getItem("fitquest_profile");
    const savedLogs = localStorage.getItem("fit-rpg_logs") || localStorage.getItem("fitrpg_logs") || localStorage.getItem("fitquest_logs");

    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile);
        const sanitizedProfile: AthleteProfile = {
          name: parsed.name || "Athlete",
          age: Number(parsed.age) || 25,
          bodyWeight: Number(parsed.bodyWeight) || 175,
          chestStrength: Number(parsed.chestStrength) || 0,
          chestStrengthXP: Number(parsed.chestStrengthXP) || 0,
          backStrength: Number(parsed.backStrength) || 0,
          backStrengthXP: Number(parsed.backStrengthXP) || 0,
          armStrength: Number(parsed.armStrength) || 0,
          armStrengthXP: Number(parsed.armStrengthXP) || 0,
          legStrength: Number(parsed.legStrength) || 0,
          legStrengthXP: Number(parsed.legStrengthXP) || 0,
          coreStrength: Number(parsed.coreStrength) || 0,
          coreStrengthXP: Number(parsed.coreStrengthXP) || 0,
          speed: Number(parsed.speed) || 0,
          speedXP: Number(parsed.speedXP) || 0,
          stamina: Number(parsed.stamina) || 0,
          staminaXP: Number(parsed.staminaXP) || 0,
          cardioStamina: Number(parsed.cardioStamina) || 0,
          cardioStaminaXP: Number(parsed.cardioStaminaXP) || 0,
        };
        setProfile(sanitizedProfile);
      } catch (e) {
        console.error("Failed to parse saved athlete profile", e);
      }
    }
    if (savedLogs) {
      try {
        setLogs(JSON.parse(savedLogs));
      } catch (e) {
        console.error("Failed to parse saved fitness logs", e);
      }
    }
  }, []);

  // Compute stats on the fly dynamically from logs (Stateless Performance Profiler standard)
  const performanceEvaluation = evaluateAthletePerformance(logs, profile?.bodyWeight || 175);
  const dynamicStats = performanceEvaluation.statLevels;
  
  const activeProfile: AthleteProfile | null = profile ? {
    ...profile,
    chestStrength: dynamicStats.chestStrength,
    chestStrengthXP: performanceEvaluation.statXps.chestStrength,
    backStrength: dynamicStats.backStrength,
    backStrengthXP: performanceEvaluation.statXps.backStrength,
    armStrength: dynamicStats.armStrength,
    armStrengthXP: performanceEvaluation.statXps.armStrength,
    legStrength: dynamicStats.legStrength,
    legStrengthXP: performanceEvaluation.statXps.legStrength,
    coreStrength: dynamicStats.coreStrength,
    coreStrengthXP: performanceEvaluation.statXps.coreStrength,
    speed: dynamicStats.speed,
    speedXP: performanceEvaluation.statXps.speed,
    stamina: dynamicStats.stamina,
    staminaXP: performanceEvaluation.statXps.stamina,
    cardioStamina: dynamicStats.stamina,
    cardioStaminaXP: performanceEvaluation.statXps.stamina,
  } : null;

  // Sync profile details to storage
  const saveProfile = (newProfile: AthleteProfile | null) => {
    setProfile(newProfile);
    if (newProfile) {
      localStorage.setItem("fit-rpg_profile", JSON.stringify(newProfile));
      localStorage.setItem("fitrpg_profile", JSON.stringify(newProfile));
      localStorage.setItem("fitquest_profile", JSON.stringify(newProfile));
    } else {
      localStorage.removeItem("fit-rpg_profile");
      localStorage.removeItem("fitrpg_profile");
      localStorage.removeItem("fitquest_profile");
    }
  };

  // Sync log array list to storage
  const saveLogs = (newLogs: FitnessLog[]) => {
    setLogs(newLogs);
    localStorage.setItem("fit-rpg_logs", JSON.stringify(newLogs));
    localStorage.setItem("fitrpg_logs", JSON.stringify(newLogs));
    localStorage.setItem("fitquest_logs", JSON.stringify(newLogs));
    
    // Also update localized storage dossier stats to keep them in alignment
    if (profile) {
      const perf = evaluateAthletePerformance(newLogs, profile.bodyWeight);
      const dStats = perf.statLevels;
      const alignedProfile: AthleteProfile = {
        ...profile,
        chestStrength: dStats.chestStrength,
        chestStrengthXP: perf.statXps.chestStrength,
        backStrength: dStats.backStrength,
        backStrengthXP: perf.statXps.backStrength,
        armStrength: dStats.armStrength,
        armStrengthXP: perf.statXps.armStrength,
        legStrength: dStats.legStrength,
        legStrengthXP: perf.statXps.legStrength,
        coreStrength: dStats.coreStrength,
        coreStrengthXP: perf.statXps.coreStrength,
        speed: dStats.speed,
        speedXP: perf.statXps.speed,
        stamina: dStats.stamina,
        staminaXP: perf.statXps.stamina,
        cardioStamina: dStats.stamina,
        cardioStaminaXP: perf.statXps.stamina,
      };
      localStorage.setItem("fit-rpg_profile", JSON.stringify(alignedProfile));
      localStorage.setItem("fitrpg_profile", JSON.stringify(alignedProfile));
      localStorage.setItem("fitquest_profile", JSON.stringify(alignedProfile));
    }
  };

  // Athlete setup is complete
  const handleProfileSetupComplete = (newProfile: AthleteProfile) => {
    saveProfile(newProfile);
    // Seed initial setup calibration logs
    const seedLogs: FitnessLog[] = [
      {
        id: "seed_1",
        timestamp: new Date().toISOString(),
        metricType: "general_workout",
        title: "Athlete Profile Calibration Achieved",
        newValue: `${newProfile.bodyWeight} lbs Somatotype Weight`,
        weight: newProfile.bodyWeight,
        notes: "Profile initialized cleanly. Commenced level progression metrics from Level 1."
      }
    ];
    saveLogs(seedLogs);
    setActiveTab("dashboard");
    showToast("Profile calibrated successfully!");
  };

  const handleProfileUpdate = (updatedProfile: AthleteProfile) => {
    saveProfile(updatedProfile);
  };

  // Save changes and generate a ledger entry
  const handleRecordLogCommit = (logData: {
    metricType: FitnessMetricType;
    title: string;
    previousValue?: string;
    newValue: string;
    notes?: string;
  }) => {
    const newLog: FitnessLog = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      metricType: logData.metricType,
      title: logData.title,
      newValue: logData.newValue,
      notes: logData.notes
    };

    const updatedLogs = [...logs, newLog];
    saveLogs(updatedLogs);
    showToast(`Successfully recorded: ${logData.title}`);
  };

  // Convert incoming exercise log trigger to general training history ledger
  const handleLogExerciseWorkout = (params: {
    exerciseName: string;
    categoryName: string;
    weight?: number;
    reps?: number;
    minutes?: number;
    seconds?: number;
    distance?: number;
    floors?: number;
    notes?: string;
  }) => {
    if (!profile) return;

    // Find exercise details inside our simplified dictionary
    const exercise = EXERCISE_DATABASE.find(
      ex => ex.name.toLowerCase() === params.exerciseName.toLowerCase()
    );
    if (!exercise) return;

    // 1. Prepare the details text for logging
    let valueDisplay = "";
    if (exercise.formType === "A") {
      valueDisplay = `${params.reps} reps @ ${params.weight} lbs`;
    } else if (exercise.formType === "B") {
      valueDisplay = `${params.reps} reps`;
    } else if (exercise.formType === "C") {
      valueDisplay = `${params.minutes}m ${params.seconds}s hold`;
    } else if (exercise.formType === "D") {
      valueDisplay = `${params.distance} miles in ${params.minutes}m ${params.seconds}s`;
    } else if (exercise.formType === "E") {
      valueDisplay = `${params.floors} floors in ${params.minutes} mins`;
    }

    // 2. Save history log entry including raw metrics to facilitate Stateless PR recalculations
    const newLog: FitnessLog = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      metricType: "general_workout",
      title: `Set Logged: ${params.exerciseName}`,
      newValue: valueDisplay,
      exerciseName: params.exerciseName,
      categoryName: params.categoryName,
      weight: params.weight,
      reps: params.reps,
      minutes: params.minutes,
      seconds: params.seconds,
      distance: params.distance,
      floors: params.floors,
      notes: params.notes?.trim() || undefined
    };

    const updatedLogs = [...logs, newLog];
    
    // Evaluate calibration before and after the new set to announce stat surges
    const prevStats = evaluateAthletePerformance(logs, profile.bodyWeight).statLevels;
    const postStats = evaluateAthletePerformance(updatedLogs, profile.bodyWeight).statLevels;
    
    saveLogs(updatedLogs);

    const levelUpsTriggered: string[] = [];
    const statKeys = [
      "chestStrength",
      "backStrength",
      "armStrength",
      "legStrength",
      "coreStrength",
      "speed",
      "stamina"
    ] as const;

    statKeys.forEach(statKey => {
      const oldVal = prevStats[statKey] !== undefined ? prevStats[statKey] : 0;
      const newVal = postStats[statKey] !== undefined ? postStats[statKey] : 0;
      if (newVal > oldVal) {
        const friendlyName = statKey
          .replace("Strength", " Strength")
          .replace("speed", "Speed")
          .replace("stamina", "Stamina")
          .replace(/^\w/, c => c.toUpperCase());
        levelUpsTriggered.push(`${friendlyName} calibrated up to Lvl ${newVal.toFixed(2)} (+${(newVal - oldVal).toFixed(2)})!`);
      }
    });

    // Show dynamic calibration surges
    if (levelUpsTriggered.length > 0) {
      showToast(`⚡ PROFILE LEVEL SURGE! ${levelUpsTriggered.join(" | ")}`);
    } else {
      showToast(`💪 Set Saved! Performance indices verified.`);
    }

    // Keep user on the exercise logging tab so they can continue logging sets
    // setActiveTab("dashboard");
  };

  // Reset/Clear everything
  const handleReset = () => {
    if (confirm("Are you sure you want to reset your athlete profile? All stat progress will return to 0.00 and historic logs will be deleted.")) {
      saveProfile(null);
      saveLogs([]);
      setActiveTab("dashboard");
      showToast("Profile reset completed.");
    }
  };

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => {
      setSuccessToast(null);
    }, 4000);
  };

  return (
    <div className="min-h-screen bg-[#090B0E] flex justify-center items-start sm:py-6 selection:bg-cyan-500/30 selection:text-white relative">
      <div className="w-full max-w-[430px] min-h-screen bg-[#0D1117] shadow-[0_0_50px_rgba(0,0,0,0.8)] border-x border-slate-900 flex flex-col relative overflow-hidden pb-28">
        
        {/* Animated Background Simulation Grid, Floating Mana Dust & Shooting Stars */}
        <div className="absolute inset-0 retro-grid-bg pointer-events-none z-0 overflow-hidden">
          {/* Shooting Stars */}
          <div className="shooting-star-1" />
          <div className="shooting-star-2" />
          <div className="shooting-star-3" />

          {/* Floating mana dust */}
          <div className="absolute bottom-[-100px] left-[15%] w-1.5 h-1.5 bg-cyan-400/20 rounded-full animate-float-slow text-retro-glow" style={{ animationDelay: "0s" }} />
          <div className="absolute bottom-[-100px] left-[80%] w-1 h-1 bg-emerald-400/20 rounded-full animate-float-medium" style={{ animationDelay: "2.5s" }} />
          <div className="absolute bottom-[-100px] left-[45%] w-2 h-2 bg-cyan-400/15 rounded-full animate-float-slow" style={{ animationDelay: "5s" }} />
          <div className="absolute bottom-[-100px] left-[70%] w-1.5 h-1.5 bg-emerald-400/25 rounded-full animate-float-fast" style={{ animationDelay: "1.5s" }} />
          <div className="absolute bottom-[-100px] left-[25%] w-1 h-1 bg-cyan-400/20 rounded-full animate-float-medium" style={{ animationDelay: "7s" }} />
          <div className="absolute bottom-[-100px] left-[60%] w-2 h-2 bg-cyan-400/15 rounded-full animate-float-slow" style={{ animationDelay: "9s" }} />
        </div>

        {/* Top Header Navigation (Centered Title) */}
        <header className="bg-[#161B22]/70 sticky top-0 z-40 backdrop-blur-md py-6 border-b border-slate-900/30">
          <div className="px-4 flex items-center justify-between w-full relative">
            {/* Spacer to preserve absolute centering of Fit-RPG title */}
            <div className="w-8" />
            
            <h1 className="font-press-start text-3xl sm:text-4xl text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-emerald-400 to-cyan-400 animate-text-shimmer text-retro-glow tracking-widest uppercase select-none text-center leading-none">
              Fit-RPG
            </h1>
            
            <button
              onClick={() => setIsHelpOpen(true)}
              className="w-8 h-8 rounded-xl bg-[#0D0D0E]/90 border border-slate-800 flex items-center justify-center font-mono font-black text-cyan-400 hover:text-cyan-300 hover:border-cyan-500/30 cursor-pointer active:scale-95 transition"
              title="Screen Guide"
            >
              ?
            </button>
          </div>
        </header>

        {/* Main Body */}
        <main className="px-4 mt-6 flex-1 relative z-10">

          {/* Dynamic Success Notification Toast */}
          {successToast && (
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] max-w-[380px] z-55 bg-[#161B22]/95 backdrop-blur-md border-2 border-cyan-500 text-slate-100 py-5 px-6 rounded-2xl shadow-[0_0_30px_rgba(6,182,212,0.3)] flex flex-col items-center justify-center gap-2.5 transition-all animate-fade-in duration-200 text-center">
              <div className="w-3 h-3 bg-cyan-400 rounded-full animate-ping shrink-0 shadow-[0_0_10px_#06b6d4]" />
              <span className="text-[10px] font-press-start tracking-widest text-cyan-400 block uppercase">SYSTEM MESSAGE</span>
              <span className="text-xs font-mono font-bold leading-relaxed text-slate-200 mt-1 block w-full text-center">{successToast}</span>
            </div>
          )}

          {!profile ? (
            /* Profile initial creation setup view */
            <FitnessProfileSetup onSetupComplete={handleProfileSetupComplete} />
          ) : (
            /* Profile loaded: render Active tab switcher at bottom */
            <div className="space-y-6">
              
              {/* TAB CONTENT SECTOR */}
              <div className="space-y-6 animate-fade-in pb-12">
                
                {/* Dashboard Content */}
                {activeTab === "dashboard" && (
                  <AthleteDashboard
                    profile={activeProfile!}
                    logs={logs}
                    onProfileUpdate={handleProfileUpdate}
                    onRecordLog={handleRecordLogCommit}
                    onReset={handleReset}
                    onNavigateToLogs={() => setActiveTab("calendar")}
                    onNavigateToExercises={() => setActiveTab("log")}
                  />
                )}

                {/* Workout Logger exercise directory */}
                {activeTab === "log" && (
                  <WorkoutLogger onLogWorkout={handleLogExerciseWorkout} />
                )}

                {/* Past chronicles log lists */}
                {activeTab === "calendar" && (
                  <div className="flex flex-col gap-6 items-stretch">
                    <WorkoutCalendar logs={logs} />
                    <PastQuests logs={logs} onClearLogs={() => saveLogs([])} />
                  </div>
                )}

              </div>

              {/* Visual Touch Tabs specifically optimized for mobile size at the bottom */}
              <div className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto bg-[#161B22]/95 border-t border-slate-800 p-2 z-40 backdrop-blur-md flex justify-around items-center">
                <button
                  onClick={() => setActiveTab("dashboard")}
                  className={`flex-1 min-h-[48px] py-2 px-1 rounded-xl text-[10px] font-mono font-bold tracking-tight transition flex flex-col items-center justify-center gap-1 cursor-pointer ${
                    activeTab === "dashboard"
                      ? "bg-cyan-500 text-black font-extrabold shadow-md shadow-cyan-500/15"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Sliders className="w-5 h-5" />
                  STATUS
                </button>

                <button
                  onClick={() => setActiveTab("log")}
                  className={`flex-1 min-h-[48px] py-2 px-1 rounded-xl text-[10px] font-mono font-bold tracking-tight transition flex flex-col items-center justify-center gap-1 cursor-pointer ${
                    activeTab === "log"
                      ? "bg-cyan-500 text-black font-extrabold shadow-md shadow-cyan-500/15"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Dumbbell className="w-5 h-5" />
                  EXERCISE
                </button>

                <button
                  onClick={() => setActiveTab("calendar")}
                  className={`flex-1 min-h-[48px] py-2 px-1 rounded-xl text-[10px] font-mono font-bold tracking-tight transition flex flex-col items-center justify-center gap-1 cursor-pointer ${
                    activeTab === "calendar"
                      ? "bg-cyan-500 text-black font-extrabold shadow-md shadow-cyan-500/15"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <CalendarIcon className="w-5 h-5" />
                  HISTORY
                </button>
              </div>

            </div>
          )}

        </main>
      </div>

      {/* 🔮 STICKY CORNER HELP DIALOG MODAL */}
      {isHelpOpen && (
        <div className="fixed inset-0 bg-[#090B0E]/80 backdrop-blur-md z-55 flex items-center justify-center p-4">
          <div className="w-full max-w-[340px] bg-[#0D1117] border-2 border-cyan-500/50 rounded-2xl p-6 shadow-[0_0_25px_rgba(6,182,212,0.2)] relative overflow-hidden flex flex-col items-center text-center gap-4 animate-fade-in">
            {/* Accent light decoration */}
            <div className="absolute top-0 right-0 w-20 h-20 bg-cyan-500/15 rounded-full blur-xl pointer-events-none" />
            
            {/* Icon Banner */}
            <div className="w-12 h-12 rounded-xl bg-[#161B22] border border-slate-800 flex items-center justify-center text-xl text-cyan-400 shadow-md font-mono font-black">
              ?
            </div>

            {/* Content Switcher based on active tab */}
            {(() => {
              let title = "SCREEN GUIDE";
              let text = "";

              if (activeTab === "dashboard") {
                title = "STATUS GUIDE";
                text = "This is your Character HUD. Log exercises to level up your 7 stats instantly. Tap any stat card to view your active rank. The Personal Record Shield rotates your peak achievements.";
              } else if (activeTab === "log") {
                title = "EXERCISE GUIDE";
                text = "Select a category or physical focus group to find an exercise. Enter your reps, weight, or duration to log sets. Diminishing returns gate your weekly progress—more sets build more stimulus progress!";
              } else if (activeTab === "calendar") {
                title = "HISTORY GUIDE";
                text = "View your historical training logs. The calendar marks your trained days, and the past quests list lets you scroll and clear your training chronicles. Great for tracking consistency.";
              }

              return (
                <div className="space-y-2">
                  <span className="text-[8px] font-press-start text-cyan-400 tracking-widest block uppercase font-bold">SYSTEM GUIDE</span>
                  <h3 className="text-xs font-press-start text-white uppercase tracking-wider block">
                    {title}
                  </h3>
                  <div className="bg-[#0D0D0E]/60 border border-slate-800 rounded-xl p-4 text-[10px] font-mono text-slate-300 leading-relaxed text-left mt-2">
                    {text}
                  </div>
                </div>
              );
            })()}

            {/* Action buttons */}
            <button
              onClick={() => setIsHelpOpen(false)}
              style={{ minHeight: "40px" }}
              className="w-full bg-cyan-500 hover:bg-cyan-600 active:scale-[0.98] transition cursor-pointer text-black font-press-start text-[9px] tracking-wider py-2.5 rounded-xl font-bold shadow-md shadow-cyan-500/10 uppercase"
            >
              UNDERSTOOD
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
