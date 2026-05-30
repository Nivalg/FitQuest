import React, { useState, useRef, useEffect } from "react";
import { EXERCISE_DATABASE, CATEGORIES } from "../exercises";
import { ExerciseInfo, ExercisePillar } from "../types";
import { motion, AnimatePresence } from "motion/react";
import {
  ChevronLeft,
  Dumbbell,
  Activity,
  Zap,
  Flame,
  Plus,
  Minus,
  MessageSquare,
  Award,
  Timer,
  Shield,
  Target
} from "lucide-react";

interface WorkoutLoggerProps {
  onLogWorkout: (params: {
    exerciseName: string;
    categoryName: string;
    weight?: number;
    reps?: number;
    minutes?: number;
    seconds?: number;
    distance?: number;
    floors?: number;
    notes?: string;
  }) => void;
}

export function WorkoutLogger({ onLogWorkout }: WorkoutLoggerProps) {
  // Current view states: "categories" -> "exercises" -> "form"
  const [currentView, setCurrentView] = useState<"categories" | "exercises" | "form">("categories");
  const [selectedCategory, setSelectedCategory] = useState<{ id: string; name: string } | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<ExerciseInfo | null>(null);
  const [activeLogTab, setActiveLogTab] = useState<"categories" | "focus">("categories");

  const focusGroups = [
    {
      id: "chest",
      name: "Chest Focus",
      icon: <Dumbbell className="w-8 h-8 text-cyan-400" />,
      style: "border-cyan-500/30 hover:border-cyan-450 focus:border-cyan-400 bg-cyan-950/10 hover:bg-cyan-950/20",
      desc: "Barbell pressing, pushups, & flies isolation"
    },
    {
      id: "back",
      name: "Back Focus",
      icon: <Shield className="w-8 h-8 text-orange-400" />,
      style: "border-orange-500/30 hover:border-orange-450 focus:border-orange-400 bg-orange-950/10 hover:bg-orange-950/20",
      desc: "Deadlifts, pulldowns, & spinal pulling"
    },
    {
      id: "legs",
      name: "Legs Focus",
      icon: <Activity className="w-8 h-8 text-emerald-400" />,
      style: "border-emerald-500/30 hover:border-emerald-450 focus:border-emerald-400 bg-emerald-950/10 hover:bg-emerald-950/20",
      desc: "Heavy squats, leg presses, & Stairmaster climbing"
    },
    {
      id: "arms",
      name: "Arms Focus",
      icon: <Zap className="w-8 h-8 text-pink-400" />,
      style: "border-pink-500/30 hover:border-pink-450 focus:border-pink-400 bg-pink-950/10 hover:bg-pink-950/20",
      desc: "Vertical press, curls, dips & extension work"
    },
    {
      id: "core",
      name: "Core Focus",
      icon: <Target className="w-8 h-8 text-amber-400" />,
      style: "border-amber-500/30 hover:border-amber-450 focus:border-amber-400 bg-amber-950/10 hover:bg-amber-950/20",
      desc: "Trunk plank stability & sit-up torque"
    },
    {
      id: "speed",
      name: "Speed Focus",
      icon: <Flame className="w-8 h-8 text-rose-400" />,
      style: "border-rose-500/30 hover:border-rose-450 focus:border-rose-400 bg-rose-950/10 hover:bg-rose-950/20",
      desc: "Sprint intervals & running velocity sets"
    },
    {
      id: "stamina",
      name: "Stamina Focus",
      icon: <Timer className="w-8 h-8 text-purple-400" />,
      style: "border-purple-500/30 hover:border-purple-450 focus:border-purple-400 bg-purple-950/10 hover:bg-purple-950/20",
      desc: "Endurance cardio & bodyweight duration"
    }
  ];

  // Form inputs
  const [weight, setWeight] = useState<number>(135);
  const [reps, setReps] = useState<number>(10);
  const [minutes, setMinutes] = useState<number>(1);
  const [seconds, setSeconds] = useState<number>(30);
  const [distance, setDistance] = useState<number>(1.0);
  const [floors, setFloors] = useState<number>(30);
  const [notes, setNotes] = useState<string>("");

  const repsListRef = useRef<HTMLDivElement>(null);

  // Auto-scroll the active rep to center of visual touch-grid on change
  useEffect(() => {
    if (repsListRef.current) {
      const activeEl = repsListRef.current.querySelector('[data-selected="true"]');
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
      }
    }
  }, [reps, currentView, selectedExercise]);

  // Category Icon helper
  const getCategoryIcon = (catId: string) => {
    switch (catId) {
      case "weights":
        return <Dumbbell className="w-8 h-8 text-cyan-400" />;
      case "machines":
        return <Zap className="w-8 h-8 text-amber-400" />;
      case "bodyweight":
        return <Activity className="w-8 h-8 text-emerald-400" />;
      case "cardio":
        return <Flame className="w-8 h-8 text-purple-400" />;
      default:
        return <Award className="w-8 h-8 text-slate-400" />;
    }
  };

  // Border & Glow helpers
  const getCategoryStyle = (catId: string) => {
    switch (catId) {
      case "weights":
        return "border-cyan-500/30 hover:border-cyan-450 focus:border-cyan-400 bg-cyan-950/10 hover:bg-cyan-950/20";
      case "machines":
        return "border-amber-500/30 hover:border-amber-450 focus:border-amber-400 bg-amber-950/10 hover:bg-amber-950/20";
      case "bodyweight":
        return "border-emerald-500/30 hover:border-emerald-450 focus:border-emerald-400 bg-emerald-950/10 hover:bg-emerald-950/20";
      case "cardio":
        return "border-purple-500/30 hover:border-purple-450 focus:border-purple-400 bg-purple-950/10 hover:bg-purple-950/20";
      default:
        return "border-slate-850 hover:border-slate-700 bg-slate-900/40";
    }
  };

  // Form description helper
  const getBuildsDescription = (exercise: ExerciseInfo) => {
    const parts: string[] = [];
    if (exercise.builds.chestStrength) parts.push("Chest");
    if (exercise.builds.armStrength) parts.push("Arm");
    if (exercise.builds.legStrength) parts.push("Leg");
    if (exercise.builds.backStrength) parts.push("Back");
    if (exercise.builds.coreStrength) parts.push("Core");
    
    if (exercise.name.toLowerCase() === "treadmill run / jog") {
      parts.push("Speed");
      parts.push("Stamina");
    } else if (exercise.name.toLowerCase() === "sprint intervals") {
      parts.push("Speed");
      parts.push("Stamina");
    } else if (exercise.name.toLowerCase() === "stairmaster") {
      parts.push("Stamina");
    } else if (exercise.name.toLowerCase() === "bodyweight squats") {
      parts.push("Stamina");
      parts.push("Speed");
    } else if (exercise.builds.cardioStamina) {
      parts.push("Stamina");
    }
    return parts.join(" + ");
  };

  // Handle exercise selection
  const handleSelectExercise = (exercise: ExerciseInfo) => {
    setSelectedExercise(exercise);
    
    // Set default reasonable states depending on form type to speed up logging
    if (exercise.formType === "A") {
      // Free Weights / Machines
      if (exercise.name.toLowerCase().includes("press") && !exercise.name.toLowerCase().includes("leg")) {
        setWeight(exercise.name.toLowerCase().includes("bench") ? 135 : 65);
      } else if (exercise.name.toLowerCase().includes("squat") || exercise.name.toLowerCase().includes("deadlift") || exercise.name.toLowerCase().includes("leg press")) {
        setWeight(185);
      } else {
        setWeight(45);
      }
      setReps(10);
    } else if (exercise.formType === "B") {
      // Bodyweight Reps
      if (exercise.name.toLowerCase().includes("pullup")) {
        setReps(6);
      } else if (exercise.name.toLowerCase().includes("squat")) {
        setReps(20);
      } else {
        setReps(12);
      }
    } else if (exercise.formType === "C") {
      // Plain timer (plank)
      setMinutes(1);
      setSeconds(0);
    } else if (exercise.formType === "D") {
      // Cardio distance
      setDistance(1.0);
      setMinutes(8);
      setSeconds(30);
    } else if (exercise.formType === "E") {
      // Stairmaster
      setFloors(30);
      setMinutes(10);
      setSeconds(0);
    }

    setNotes("");
    setCurrentView("form");
  };

  const getExercisesForFocusGroup = (focusId: string) => {
    return EXERCISE_DATABASE.filter(ex => {
      const nameLower = ex.name.toLowerCase();
      
      // 1. Specific stat-to-exercise overrides that match our leveling physics
      if (focusId === "speed") {
        return !!ex.builds.speed || 
               nameLower === "treadmill run / jog" || 
               nameLower === "sprint intervals" || 
               nameLower === "bodyweight squats";
      }
      if (focusId === "stamina") {
        return nameLower === "treadmill run / jog" || 
               nameLower === "sprint intervals" || 
               nameLower === "stairmaster" || 
               nameLower === "regular push-ups" || 
               nameLower === "regular pull-ups" || 
               nameLower === "cable bicep curl";
      }
      
      // 2. Direct attribute checks
      if (focusId === "chest") return !!ex.builds.chestStrength;
      if (focusId === "back") return !!ex.builds.backStrength;
      if (focusId === "legs") return !!ex.builds.legStrength;
      if (focusId === "arms") return !!ex.builds.armStrength;
      if (focusId === "core") return !!ex.builds.coreStrength;
      
      return false;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExercise || !selectedCategory) return;

    // Resolve to standard equipment category name to keep historic log records compatible
    const actualCategoryName = CATEGORIES.find(c => c.id === selectedExercise.pillar)?.name || selectedCategory.name;

    onLogWorkout({
      exerciseName: selectedExercise.name,
      categoryName: actualCategoryName,
      weight: selectedExercise.formType === "A" ? weight : undefined,
      reps: (selectedExercise.formType === "A" || selectedExercise.formType === "B") ? reps : undefined,
      minutes: (selectedExercise.formType === "C" || selectedExercise.formType === "D" || selectedExercise.formType === "E") ? minutes : undefined,
      seconds: (selectedExercise.formType === "C" || selectedExercise.formType === "D" || selectedExercise.formType === "E") ? seconds : undefined,
      distance: selectedExercise.formType === "D" ? distance : undefined,
      floors: selectedExercise.formType === "E" ? floors : undefined,
      notes: notes.trim() || undefined
    });

    // Go back to the active category or focus group exercise selection screen instead of resetting to root categories
    setCurrentView("exercises");
    setSelectedExercise(null);
  };

  // Filter exercises matching active category or focus group
  const isFocusCategory = selectedCategory?.id.startsWith("focus_");
  const activeExercises = selectedCategory
    ? isFocusCategory
      ? getExercisesForFocusGroup(selectedCategory.id.replace("focus_", ""))
      : EXERCISE_DATABASE.filter(ex => ex.pillar === selectedCategory.id)
    : [];

  return (
    <div className="max-w-2xl mx-auto">
      
      {/* 1. CATEGORY / FOCUS SELECTION VIEW */}
      {currentView === "categories" && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Centered Capsule Sub-Navigation */}
          <div className="flex justify-center pb-2">
            <div className="bg-[#161B22] border border-slate-800 p-1 rounded-full flex items-center relative overflow-hidden shadow-lg shadow-cyan-950/10">
              {/* Sliding active glow pill indicator */}
              <div 
                className="absolute top-1 bottom-1 bg-gradient-to-r from-cyan-950 to-slate-900 border border-cyan-500/30 rounded-full transition-all duration-300 ease-out shadow-[0_0_10px_rgba(6,182,212,0.15)] pointer-events-none"
                style={{
                  left: activeLogTab === "categories" ? "4px" : "calc(50% + 2px)",
                  width: "calc(50% - 6px)",
                }}
              />

              <button
                type="button"
                onClick={() => setActiveLogTab("categories")}
                style={{ minHeight: "36px", minWidth: "120px" }}
                className={`px-4 py-1.5 rounded-full text-[10px] font-press-start tracking-wider transition-all duration-300 relative z-10 cursor-pointer ${
                  activeLogTab === "categories"
                    ? "text-cyan-400 font-extrabold"
                    : "text-slate-500 hover:text-slate-350"
                }`}
              >
                CATEGORIES
              </button>

              <button
                type="button"
                onClick={() => setActiveLogTab("focus")}
                style={{ minHeight: "36px", minWidth: "120px" }}
                className={`px-4 py-1.5 rounded-full text-[10px] font-press-start tracking-wider transition-all duration-300 relative z-10 cursor-pointer ${
                  activeLogTab === "focus"
                    ? "text-cyan-400 font-extrabold"
                    : "text-slate-500 hover:text-slate-350"
                }`}
              >
                FOCUS
              </button>
            </div>
          </div>

          <div className="text-center">
            <h2 className="text-sm font-press-start text-cyan-400 tracking-wider">
              {activeLogTab === "categories" ? "SELECT TARGET TRAINING DOMAIN" : "SELECT TARGET PHYSICAL FOCUS"}
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-1">
              {activeLogTab === "categories" 
                ? "Pick a domain category to view your hyper-focused exercise selection grid."
                : "Pick a physical stat group to view only exercises that calibrate that stat."}
            </p>
          </div>

          {activeLogTab === "categories" ? (
            <div className="flex flex-col gap-4">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  id={`cat-${cat.id}`}
                  style={{ minHeight: "84px" }}
                  onClick={() => {
                    setSelectedCategory(cat);
                    setCurrentView("exercises");
                  }}
                  className={`p-4 border-2 rounded-2xl flex items-center gap-4 text-left transition duration-150 cursor-pointer ${getCategoryStyle(cat.id)}`}
                >
                  <div className="p-3.5 bg-[#0D0D0E] border border-slate-800 rounded-xl shrink-0">
                    {getCategoryIcon(cat.id)}
                  </div>
                  <div>
                    <span className="text-xs font-press-start text-white tracking-wider block">
                      {cat.name.toUpperCase()}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 mt-1 block">
                      {cat.id === "weights" && "Iron barbells & heavy multi-joint lifts"}
                      {cat.id === "machines" && "Pulleys, tension cables & mechanical sleds"}
                      {cat.id === "bodyweight" && "Calisthenics, suspension bars & isometrics"}
                      {cat.id === "cardio" && "Cardiovascular pacing, sprints & step climbs"}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {focusGroups.map((group) => (
                <button
                  key={group.id}
                  id={`focus-${group.id}`}
                  style={{ minHeight: "84px" }}
                  onClick={() => {
                    setSelectedCategory({ id: `focus_${group.id}`, name: group.name });
                    setCurrentView("exercises");
                  }}
                  className={`p-4 border-2 rounded-2xl flex items-center gap-4 text-left transition duration-150 cursor-pointer ${group.style}`}
                >
                  <div className="p-3.5 bg-[#0D0D0E] border border-slate-800 rounded-xl shrink-0">
                    {group.icon}
                  </div>
                  <div>
                    <span className="text-xs font-press-start text-white tracking-wider block">
                      {group.name.toUpperCase()}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 mt-1 block">
                      {group.desc}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* 2. QUICK GRID EXERCISES VIEW */}
      {currentView === "exercises" && selectedCategory && (
        <motion.div
          initial={{ opacity: 0, x: -15 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-between border-b border-slate-850 pb-4">
            <button
              onClick={() => setCurrentView("categories")}
              style={{ minHeight: "44px" }}
              className="px-4 bg-[#161B22] border-2 border-slate-850 text-slate-300 hover:text-white rounded-xl text-xs font-mono font-bold flex items-center gap-2 cursor-pointer transition active:scale-95"
            >
              <ChevronLeft className="w-4 h-4 text-cyan-400" /> BACK
            </button>
            
            <div className="text-right">
              <span className="text-[10px] font-press-start text-slate-500 block">CATEGORY</span>
              <span className="text-xs font-press-start text-cyan-300 mt-0.5 block uppercase tracking-wider">
                {selectedCategory.name}
              </span>
            </div>
          </div>



          <div className="grid grid-cols-1 gap-3">
            {activeExercises.map((ex) => (
              <button
                key={ex.name}
                id={`exercise-${ex.name.replace(/\s+/g, "-").toLowerCase()}`}
                onClick={() => handleSelectExercise(ex)}
                style={{ minHeight: "56px" }}
                className="w-full p-4 bg-[#12161A] border-2 border-slate-850 hover:border-cyan-500/40 hover:bg-[#161B22]/60 rounded-xl text-center transition flex flex-col items-center justify-center gap-1.5 cursor-pointer"
              >
                <span className="text-xs font-press-start text-white block text-center">
                  {ex.name}
                </span>
                <span className="text-[9.5px] font-mono text-emerald-400 font-bold transition block text-center">
                  {getBuildsDescription(ex)}
                </span>
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* 3. ONE-SET ENTRY FORM VIEW */}
      {currentView === "form" && selectedCategory && selectedExercise && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[#161B22] border-2 border-slate-850 rounded-2xl p-5 md:p-6 shadow-2xl space-y-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <button
              onClick={() => setCurrentView("exercises")}
              style={{ minHeight: "44px" }}
              className="px-4 bg-[#0D0D0E] border border-slate-800 text-slate-400 hover:text-white rounded-xl text-xs font-mono font-bold flex items-center gap-2 cursor-pointer transition active:scale-95"
            >
              <ChevronLeft className="w-4 h-4 text-cyan-400" /> exercises
            </button>

            <div className="text-right">
              <span className="text-[8px] font-press-start text-slate-500 block uppercase">SINGLE SET LOGGING</span>
              <h3 className="text-xs font-press-start text-cyan-400 mt-0.5 block uppercase tracking-wide">
                {selectedExercise.name}
              </h3>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* FORM A: WEIGHTS & MACHINES (WEIGHT + REPS) */}
            {selectedExercise.formType === "A" && (
              <div className="space-y-6">
                {/* Weight Box */}
                <div className="bg-[#0D0D0E] border-2 border-slate-850 p-5 rounded-2xl text-center space-y-4">
                  <div>
                    <label className="text-[10px] font-press-start text-cyan-300 block uppercase tracking-wider">
                      🏋️ WEIGHT GAUGE (LBS)
                    </label>
                    <p className="text-[9px] font-mono text-slate-500 mt-1 uppercase">TAP TO ENTER TARGET WEIGHT</p>
                  </div>
                  
                  <div className="flex flex-col items-center max-w-xs mx-auto">
                    <div className="relative flex items-baseline justify-center gap-1.5">
                      <input
                        type="number"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={weight === 0 ? "" : weight}
                        placeholder="0"
                        onChange={(e) => setWeight(Math.max(0, parseInt(e.target.value) || 0))}
                        onFocus={(e) => e.target.select()}
                        className="bg-[#12161A] border-2 border-slate-850 text-center font-bold text-3xl text-white w-36 py-2.5 rounded-xl outline-none focus:border-cyan-500 font-mono tracking-wide shadow-inner"
                        required
                      />
                      <span className="text-xs font-mono text-slate-500 font-bold uppercase">LBS</span>
                    </div>
                  </div>

                  {/* Weight Quick Presets */}
                  <div className="flex flex-wrap gap-1.5 justify-center mt-3 pt-3 border-t border-slate-900">
                    {[45, 95, 135, 185, 225, 315].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setWeight(preset)}
                        style={{ minHeight: "36px", minWidth: "54px" }}
                        className={`px-3 py-1 bg-[#161B22]/70 border hover:border-slate-600 text-[11px] font-mono font-bold rounded-lg cursor-pointer transition ${
                          weight === preset ? "border-cyan-400 text-cyan-300 bg-cyan-950/20" : "border-slate-800 text-slate-400 hover:text-white"
                        }`}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reps Box */}
                <div className="bg-[#0D0D0E] border-2 border-slate-850 p-5 rounded-2xl space-y-4">
                  <div className="flex justify-between items-center px-1">
                    <div>
                      <label className="text-[10px] font-press-start text-emerald-400 block uppercase tracking-wider">
                        🔢 REPETITIONS DONE
                      </label>
                      <p className="text-[9px] font-mono text-slate-500 mt-1">SWIPE / TOUCH SCROLL TO SELECT</p>
                    </div>
                    <span className="font-mono text-xs text-slate-400 font-bold bg-[#12161A] px-2.5 py-1 rounded border border-slate-800">
                      Reps: <strong className="text-emerald-400 text-sm font-black mx-1">{reps}</strong>
                    </span>
                  </div>
                  
                  <div 
                    ref={repsListRef}
                    className="flex items-center gap-2 overflow-x-auto py-3.5 px-3 bg-[#12161A] border border-slate-800/80 rounded-xl snap-x snap-mandatory"
                    style={{
                      scrollbarWidth: "none",
                      WebkitOverflowScrolling: "touch",
                    }}
                  >
                    {Array.from({ length: 30 }, (_, i) => i + 1).map((r) => {
                      const isSelected = reps === r;
                      return (
                        <button
                          key={r}
                          type="button"
                          data-selected={isSelected ? "true" : "false"}
                          onClick={() => setReps(r)}
                          style={{ minHeight: "44px", minWidth: "44px" }}
                          className={`shrink-0 rounded-lg flex items-center justify-center font-mono font-bold text-sm tracking-tight transition-all duration-150 snap-center cursor-pointer select-none active:scale-95 ${
                            isSelected
                              ? "bg-gradient-to-r from-emerald-500 to-cyan-500 text-black font-black text-base scale-105 shadow-md shadow-emerald-500/15 border-emerald-400"
                              : "bg-[#0D0D0E] text-slate-400 border border-slate-850 hover:border-slate-700"
                          }`}
                        >
                          {r}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* FORM B: STANDARD BODYWEIGHT (REPS ONLY) */}
            {selectedExercise.formType === "B" && (
              <div className="bg-[#0D0D0E] border-2 border-slate-850 p-5 rounded-2xl text-center space-y-4">
                <div>
                  <label className="text-[10px] font-press-start text-emerald-400 block uppercase tracking-wider">
                    🔢 REPS ACHIEVED
                  </label>
                  <p className="text-[9px] font-mono text-slate-500 mt-1 uppercase">TAP TO ENTER TOTAL REPS</p>
                </div>
                
                <div className="flex flex-col items-center max-w-xs mx-auto">
                  <div className="relative flex items-baseline justify-center gap-1.5">
                    <input
                      type="number"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={reps === 0 ? "" : reps}
                      placeholder="0"
                      onChange={(e) => setReps(Math.max(0, parseInt(e.target.value) || 0))}
                      onFocus={(e) => e.target.select()}
                      className="bg-[#12161A] border-2 border-slate-850 text-center font-bold text-3xl text-white w-36 py-2.5 rounded-xl outline-none focus:border-emerald-500 font-mono tracking-wide shadow-inner"
                      required
                    />
                    <span className="text-xs font-mono text-slate-500 font-bold uppercase">Reps</span>
                  </div>
                </div>
              </div>
            )}

            {/* FORM C: TIME-BASED BODYWEIGHT (PLANKS - STOPWATCH BOX) */}
            {selectedExercise.formType === "C" && (
              <div className="bg-[#0D0D0E] border-2 border-slate-850 p-5 rounded-2xl text-center space-y-4">
                <div>
                  <label className="text-[10px] font-press-start text-amber-400 block uppercase tracking-wider">
                    ⏱️ SHIELD HOLD STOPWATCH TIMER
                  </label>
                  <p className="text-[9px] font-mono text-slate-500 mt-1">TAP NUMBERS TO ENTER TIME</p>
                </div>
                
                <div className="flex items-center justify-center gap-4 max-w-sm mx-auto">
                  {/* Minutes Input */}
                  <div className="flex flex-col items-center">
                    <span className="text-[8px] font-press-start text-slate-500 mb-2 uppercase">minutes</span>
                    <input
                      type="number"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={minutes}
                      onChange={(e) => setMinutes(Math.max(0, parseInt(e.target.value) || 0))}
                      onFocus={(e) => e.target.select()}
                      className="bg-[#12161A] border-2 border-slate-800 text-center font-bold text-2xl text-white w-20 py-2.5 rounded-xl outline-none focus:border-cyan-500 font-mono"
                    />
                  </div>

                  <span className="text-3xl font-mono text-slate-600 font-bold pt-4">:</span>

                  {/* Seconds Input */}
                  <div className="flex flex-col items-center">
                    <span className="text-[8px] font-press-start text-slate-500 mb-2 uppercase">seconds</span>
                    <input
                      type="number"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={seconds}
                      onChange={(e) => setSeconds(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                      onFocus={(e) => e.target.select()}
                      className="bg-[#12161A] border-2 border-slate-800 text-center font-bold text-2xl text-white w-20 py-2.5 rounded-xl outline-none focus:border-cyan-500 font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* FORM D: RUNNING & SPRINTING (CARDIO DISTANCE + TIME) */}
            {selectedExercise.formType === "D" && (
              <div className="space-y-4">
                {/* Distance Option */}
                <div className="bg-[#0D0D0E] border-2 border-slate-850 p-5 rounded-2xl text-center space-y-3">
                  <div>
                    <label className="text-[10px] font-press-start text-purple-400 block uppercase tracking-wider">
                      🏃 DISTANCE TRACKED (MILES)
                    </label>
                    <p className="text-[9px] font-mono text-slate-500 mt-1 uppercase">TAP TO ENTER TARGET DISTANCE</p>
                  </div>
                  
                  <div className="flex flex-col items-center max-w-xs mx-auto">
                    <div className="relative flex items-baseline justify-center gap-1.5">
                      <input
                        type="number"
                        step="0.01"
                        inputMode="decimal"
                        value={distance === 0 ? "" : distance}
                        onChange={(e) => setDistance(Math.max(0.01, parseFloat(e.target.value) || 0))}
                        onFocus={(e) => e.target.select()}
                        className="bg-[#12161A] border-2 border-slate-800 text-center font-bold text-3xl text-white w-32 py-2.5 rounded-xl outline-none focus:border-cyan-500 font-mono tracking-wide"
                        required
                      />
                      <span className="text-xs font-mono text-slate-500 font-bold uppercase">Miles</span>
                    </div>
                  </div>
                </div>

                {/* Stopwatch Time */}
                <div className="bg-[#0D0D0E] border-2 border-slate-850 p-5 rounded-2xl text-center space-y-4">
                  <div>
                    <label className="text-[10px] font-press-start text-purple-400 block uppercase tracking-wider">
                      ⏱️ EXCURSION TIME (MINS + SECS)
                    </label>
                    <p className="text-[9px] font-mono text-slate-500 mt-1">TAP NUMBERS TO ENTER TIME</p>
                  </div>

                  <div className="flex items-center justify-center gap-4 max-w-sm mx-auto">
                    {/* Minutes */}
                    <div className="flex flex-col items-center">
                      <span className="text-[8px] font-press-start text-slate-500 mb-2 uppercase">Min</span>
                      <input
                        type="number"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={minutes}
                        onChange={(e) => setMinutes(Math.max(0, parseInt(e.target.value) || 0))}
                        onFocus={(e) => e.target.select()}
                        className="bg-[#12161A] border-2 border-slate-800 text-center font-bold text-2xl text-white w-20 py-2.5 rounded-xl outline-none focus:border-cyan-500 font-mono"
                      />
                    </div>

                    <span className="text-3xl font-mono text-slate-600 font-bold pt-4">:</span>

                    {/* Seconds */}
                    <div className="flex flex-col items-center">
                      <span className="text-[8px] font-press-start text-slate-500 mb-2 uppercase">Sec</span>
                      <input
                        type="number"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={seconds}
                        onChange={(e) => setSeconds(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                        onFocus={(e) => e.target.select()}
                        className="bg-[#12161A] border-2 border-slate-800 text-center font-bold text-2xl text-white w-20 py-2.5 rounded-xl outline-none focus:border-cyan-500 font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* FORM E: STAIRMASTER (CARDIO FLOORS + TIME) */}
            {selectedExercise.formType === "E" && (
              <div className="space-y-4">
                {/* Floors Box */}
                <div className="bg-[#0D0D0E] border-2 border-slate-850 p-5 rounded-2xl text-center space-y-3">
                  <div>
                    <label className="text-[10px] font-press-start text-purple-400 block uppercase tracking-wider">
                      🪜 FLOORS / FLIGHTS CONQUERED
                    </label>
                    <p className="text-[9px] font-mono text-slate-500 mt-1 uppercase">TAP TO ENTER TARGET FLOORS</p>
                  </div>
                  
                  <div className="flex flex-col items-center max-w-xs mx-auto">
                    <div className="relative flex items-baseline justify-center gap-1.5">
                      <input
                        type="number"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={floors === 0 ? "" : floors}
                        onChange={(e) => setFloors(Math.max(1, parseInt(e.target.value) || 1))}
                        onFocus={(e) => e.target.select()}
                        className="bg-[#12161A] border-2 border-slate-800 text-center font-bold text-3xl text-white w-32 py-2.5 rounded-xl outline-none focus:border-cyan-500 font-mono tracking-wide"
                        required
                      />
                      <span className="text-xs font-mono text-slate-500 font-bold uppercase">Floors</span>
                    </div>
                  </div>
                </div>

                {/* Stairmaster Time */}
                <div className="bg-[#0D0D0E] border-2 border-slate-850 p-5 rounded-2xl text-center space-y-4">
                  <div>
                    <label className="text-[10px] font-press-start text-purple-400 block uppercase tracking-wider">
                      ⏱️ CLIMB DURATION (MINS + SECS)
                    </label>
                    <p className="text-[9px] font-mono text-slate-500 mt-1">TAP NUMBERS TO ENTER TIME</p>
                  </div>

                  <div className="flex items-center justify-center gap-4 max-w-sm mx-auto">
                    {/* Minutes */}
                    <div className="flex flex-col items-center">
                      <span className="text-[8px] font-press-start text-slate-500 mb-2 uppercase">Min</span>
                      <input
                        type="number"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={minutes}
                        onChange={(e) => setMinutes(Math.max(0, parseInt(e.target.value) || 0))}
                        onFocus={(e) => e.target.select()}
                        className="bg-[#12161A] border-2 border-slate-800 text-center font-bold text-2xl text-white w-20 py-2.5 rounded-xl outline-none focus:border-cyan-500 font-mono"
                      />
                    </div>

                    <span className="text-3xl font-mono text-slate-600 font-bold pt-4">:</span>

                    {/* Seconds */}
                    <div className="flex flex-col items-center">
                      <span className="text-[8px] font-press-start text-slate-500 mb-2 uppercase">Sec</span>
                      <input
                        type="number"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={seconds}
                        onChange={(e) => setSeconds(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                        onFocus={(e) => e.target.select()}
                        className="bg-[#12161A] border-2 border-slate-800 text-center font-bold text-2xl text-white w-20 py-2.5 rounded-xl outline-none focus:border-cyan-500 font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Action Box */}
            <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => setCurrentView("exercises")}
                style={{ minHeight: "50px" }}
                className="flex-1 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white rounded-xl text-xs font-mono font-bold cursor-pointer transition active:scale-95"
              >
                CANCEL ENTRY
              </button>
              
              <button
                type="submit"
                style={{ minHeight: "50px" }}
                className="flex-[2] bg-gradient-to-r from-cyan-500 to-emerald-400 hover:from-cyan-400 hover:to-emerald-350 text-black rounded-xl text-xs font-press-start text-center tracking-wider font-extrabold cursor-pointer shadow-lg shadow-cyan-500/10 active:translate-y-[1px]"
              >
                SUBMIT SINGLE SET
              </button>
            </div>

            {/* Optional Workout Notes */}
            <div className="space-y-2 pt-4 border-t border-slate-800">
              <label className="text-[8.5px] font-press-start text-slate-400 block tracking-widest pl-1">
                📝 ACTION MEMO (OPTIONAL CLINICAL LOG)
              </label>
              <div className="relative">
                <input
                  type="text"
                  maxLength={100}
                  placeholder="e.g. Strong push. Felt great chest squeeze today."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-[#0D0D0E] border border-slate-800 focus:border-cyan-500 rounded-xl py-3 px-4 text-xs font-sans text-slate-100 outline-none transition duration-150 pl-10"
                />
                <div className="absolute left-3.5 top-3.5 text-slate-500">
                  <MessageSquare className="w-4 h-4" />
                </div>
              </div>
            </div>

          </form>
        </motion.div>
      )}

    </div>
  );
}
