import React, { useState, useRef, useEffect } from "react";
import { EXERCISE_DATABASE, CATEGORIES } from "../exercises";
import { ExerciseInfo, ExercisePillar, AthleteProfile, FitnessLog } from "../types";
import { evaluateAthletePerformance } from "../utils/fitnessMath";
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
  Target,
  Search,
  Trash2,
  Play,
  Square,
  Save
} from "lucide-react";

interface WorkoutLoggerProps {
  profile: AthleteProfile;
  logs: FitnessLog[];
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
  onUndoWorkout?: () => void;
}

export function WorkoutLogger({ profile, logs, onLogWorkout, onUndoWorkout }: WorkoutLoggerProps) {
  // Current view states: "categories" | "exercises" | "form" | "create-routine"
  const [currentView, setCurrentView] = useState<"categories" | "exercises" | "form" | "create-routine">("categories");
  const [selectedCategory, setSelectedCategory] = useState<{ id: string; name: string } | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<ExerciseInfo | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>("all");
  const [restSeconds, setRestSeconds] = useState<number>(0);
  const [frameIndex, setFrameIndex] = useState<number>(0);

  // Custom Workout Routines and Recents states
  const [routines, setRoutines] = useState<{ name: string; exercises: string[] }[]>(() => {
    try {
      const saved = localStorage.getItem("fitquest_custom_routines");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Error loading routines:", e);
    }
    // Default preset routines
    return [
      { name: "Arm & Shoulder Day", exercises: ["Barbell Overhead Press", "Barbell Bicep Curl", "Dumbbell Skull Crushers", "Barbell Shrug"] },
      { name: "Leg & Core Day", exercises: ["Barbell Squat", "Romanian Deadlift", "Calf Raises", "Plank"] }
    ];
  });
  const [activeRoutine, setActiveRoutine] = useState<{ name: string; exercises: string[] } | null>(null);

  // Routine Creator Form states
  const [newRoutineName, setNewRoutineName] = useState("");
  const [selectedExerciseNames, setSelectedExerciseNames] = useState<string[]>([]);
  const [routineSearchQuery, setRoutineSearchQuery] = useState("");
  const [formBackTarget, setFormBackTarget] = useState<"categories" | "exercises">("exercises");


  // Dynamic Recents calculation
  const recents = React.useMemo(() => {
    const uniqueNames: string[] = [];
    const sortedLogs = [...logs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    for (const log of sortedLogs) {
      if (log.exerciseName) {
        const match = EXERCISE_DATABASE.find(e => e.name.toLowerCase() === log.exerciseName!.toLowerCase());
        if (match && !uniqueNames.includes(match.name)) {
          uniqueNames.push(match.name);
          if (uniqueNames.length >= 6) break;
        }
      }
    }
    return uniqueNames.map(name => EXERCISE_DATABASE.find(e => e.name === name)!).filter(Boolean);
  }, [logs]);

  const switcherExercises = React.useMemo(() => {
    if (activeRoutine) {
      return activeRoutine.exercises
        .map(name => EXERCISE_DATABASE.find(e => e.name === name)!)
        .filter(Boolean);
    }
    if (recents.length > 0) {
      return recents;
    }
    // Fallback default exercises if user has no logs yet
    return [
      "Bench Press",
      "Barbell Squat",
      "Deadlift",
      "Barbell Bicep Curl"
    ].map(name => EXERCISE_DATABASE.find(e => e.name === name)!).filter(Boolean);
  }, [activeRoutine, recents]);

  useEffect(() => {
    if (!selectedExercise || !selectedExercise.images || selectedExercise.images.length === 0) {
      return;
    }
    setFrameIndex(0);
    const duration = selectedExercise.frameDuration || 800;
    const timer = setInterval(() => {
      setFrameIndex(prev => (prev + 1) % selectedExercise.images!.length);
    }, duration);
    return () => clearInterval(timer);
  }, [selectedExercise]);

  // Equipment selection filters
  const [activeFilter, setActiveFilter] = useState<"weights" | "machines" | "bodyweight">("weights");

  // Dynamic weekly stimulus progress calculations
  const performance = evaluateAthletePerformance(logs, profile.bodyWeight);
  const weeklyVolume = performance.weeklyVolume;
  const weeklySubVolume = performance.weeklySubVolume;

  const statConfig = {
    chestStrength: { label: "Chest", colorHex: "#22d3ee" },
    backStrength: { label: "Back", colorHex: "#fb923c" },
    legStrength: { label: "Legs", colorHex: "#34d399" },
    armStrength: { label: "Arms", colorHex: "#f472b6" },
    coreStrength: { label: "Core", colorHex: "#fbbf24" },
    speed: { label: "Speed", colorHex: "#f43f5e" },
    stamina: { label: "Stamina", colorHex: "#c084fc" }
  };

  const subCategoryConfigs: Record<string, { label: string; colorHex: string }> = {
    biceps: { label: "Biceps", colorHex: "#ec4899" },
    triceps: { label: "Triceps", colorHex: "#f43f5e" },
    shoulders: { label: "Shoulders", colorHex: "#22d3ee" },
    traps: { label: "Traps", colorHex: "#a855f7" },
    glutes: { label: "Glutes", colorHex: "#10b981" },
    quads: { label: "Quads", colorHex: "#14b8a6" },
    hamstrings: { label: "Hamstrings", colorHex: "#84cc16" },
    calves: { label: "Calves", colorHex: "#22c55e" }
  };

  const renderProgressBar = (key: string, isSub: boolean = false) => {
    const config = isSub ? subCategoryConfigs[key] : (statConfig as any)[key];
    if (!config) return null;

    const progressValue = isSub 
      ? (weeklySubVolume[key] || 0) 
      : (weeklyVolume[key] || 0);

    return (
      <div className="space-y-1.5 pb-2 animate-fade-in w-full">
        <div className="flex justify-between items-center text-[9px] font-mono">
          <span className="text-slate-400 uppercase tracking-wider font-bold">
            {config.label} PROGRESS
          </span>
          <span className="text-white font-black">
            {progressValue.toFixed(1)}%
          </span>
        </div>
        <div className="relative w-full h-2 bg-[#12161A] border border-slate-850 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${progressValue}%`,
              backgroundColor: config.colorHex,
              backgroundImage: `linear-gradient(to right, ${config.colorHex}, #3b82f6)`
            }}
          />
        </div>
      </div>
    );
  };

  const handleToggleFilter = (filter: "weights" | "machines" | "bodyweight") => {
    setActiveFilter(filter);
  };

  const getExerciseEquipmentType = (pillar: string, name: string): "weights" | "machines" | "bodyweight" => {
    if (pillar === "weights") return "weights";
    if (pillar === "machines") return "machines";
    if (pillar === "bodyweight") return "bodyweight";
    if (pillar === "cardio") {
      const nameLower = name.toLowerCase();
      if (
        nameLower.includes("rope") ||
        nameLower.includes("jump") ||
        nameLower.includes("sprint") ||
        nameLower.includes("hiking")
      ) {
        return "bodyweight";
      }
      return "machines";
    }
    return "bodyweight";
  };

  const focusGroups = [
    {
      id: "chest",
      name: "Chest",
      icon: <Dumbbell className="w-8 h-8 text-cyan-400" />,
      style: "border-cyan-500/30 hover:border-cyan-450 focus:border-cyan-400 bg-cyan-950/10 hover:bg-cyan-950/20",
      desc: "Barbell pressing, pushups, & flies isolation"
    },
    {
      id: "back",
      name: "Back",
      icon: <Shield className="w-8 h-8 text-orange-400" />,
      style: "border-orange-500/30 hover:border-orange-450 focus:border-orange-400 bg-orange-950/10 hover:bg-orange-950/20",
      desc: "Deadlifts, pulldowns, & spinal pulling"
    },
    {
      id: "legs",
      name: "Legs",
      icon: <Activity className="w-8 h-8 text-emerald-400" />,
      style: "border-emerald-500/30 hover:border-emerald-450 focus:border-emerald-400 bg-emerald-950/10 hover:bg-emerald-950/20",
      desc: "Heavy squats, leg presses, & calf raises"
    },
    {
      id: "arms",
      name: "Arms",
      icon: <Zap className="w-8 h-8 text-pink-400" />,
      style: "border-pink-500/30 hover:border-pink-450 focus:border-pink-400 bg-pink-950/10 hover:bg-pink-950/20",
      desc: "Vertical press, curls, dips & extension work"
    },
    {
      id: "core",
      name: "Core",
      icon: <Target className="w-8 h-8 text-amber-400" />,
      style: "border-amber-500/30 hover:border-amber-450 focus:border-amber-400 bg-amber-950/10 hover:bg-amber-950/20",
      desc: "Trunk plank stability & sit-up torque"
    },
    {
      id: "speed",
      name: "Speed",
      icon: <Flame className="w-8 h-8 text-rose-400" />,
      style: "border-rose-500/30 hover:border-rose-450 focus:border-rose-400 bg-rose-950/10 hover:bg-rose-950/20",
      desc: "Treadmill runs, bike cycles, & explosive squat jumps"
    },
    {
      id: "stamina",
      name: "Stamina",
      icon: <Timer className="w-8 h-8 text-purple-400" />,
      style: "border-purple-500/30 hover:border-purple-450 focus:border-purple-400 bg-purple-950/10 hover:bg-purple-950/20",
      desc: "Conditioning pushups, burpees, & rowing"
    }
  ];

  // Form inputs
  const [weight, setWeight] = useState<number>(135);
  const [reps, setReps] = useState<number>(10);
  const [minutes, setMinutes] = useState<number>(1);
  const [seconds, setSeconds] = useState<number>(30);
  const [distanceStr, setDistanceStr] = useState<string>("1.0");
  const [floors, setFloors] = useState<number>(30);
  const [notes, setNotes] = useState<string>("");
  const [hours, setHours] = useState<number>(1);
  const [trailLevel, setTrailLevel] = useState<number>(10);

  const [exerciseInputs, setExerciseInputs] = useState<Record<string, { weight?: number, reps?: number, minutes?: number, seconds?: number, distanceStr?: string, floors?: number, hours?: number, trailLevel?: number }>>({});

  useEffect(() => {
    if (!selectedExercise) return;
    setExerciseInputs(prev => ({
      ...prev,
      [selectedExercise.name]: {
        ...(prev[selectedExercise.name] || {}),
        weight,
        reps,
        minutes,
        seconds,
        distanceStr,
        floors,
        hours,
        trailLevel
      }
    }));
  }, [selectedExercise, weight, reps, minutes, seconds, distanceStr, floors, hours, trailLevel]);

  useEffect(() => {
    const memory: typeof exerciseInputs = {};
    const sortedLogs = [...logs].sort((a, b) => new Date(a.timestamp).getTime() - new Date(a.timestamp).getTime());
    sortedLogs.forEach(log => {
      if (log.exerciseName) {
        memory[log.exerciseName] = {
          weight: log.weight !== undefined ? log.weight : memory[log.exerciseName]?.weight,
          reps: log.reps !== undefined ? log.reps : memory[log.exerciseName]?.reps,
          minutes: log.minutes !== undefined ? log.minutes : memory[log.exerciseName]?.minutes,
          seconds: log.seconds !== undefined ? log.seconds : memory[log.exerciseName]?.seconds,
          distanceStr: log.distance !== undefined ? log.distance.toString() : memory[log.exerciseName]?.distanceStr,
          floors: log.floors !== undefined ? log.floors : memory[log.exerciseName]?.floors
        };
      }
    });
    setExerciseInputs(prev => ({ ...memory, ...prev }));
  }, [logs]);

  const repsListRef = useRef<HTMLDivElement>(null);
  const lastLoggedTimeRef = useRef<number>(0);

  // Countdown timer handler
  useEffect(() => {
    if (restSeconds <= 0) return;
    const interval = setInterval(() => {
      setRestSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [restSeconds]);

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
    if (exercise.builds.backStrength) parts.push("Back");
    if (exercise.builds.legStrength) parts.push("Leg");
    if (exercise.builds.armStrength) parts.push("Arm");
    if (exercise.builds.coreStrength) parts.push("Core");
    if (exercise.builds.stamina) parts.push("Stamina");
    if (exercise.builds.speed) parts.push("Speed");
    
    // Legacy fallback compatibility
    if (exercise.builds.cardioStamina && !parts.includes("Stamina")) {
      parts.push("Stamina");
    }
    
    return parts.join(" + ");
  };

  // Handle exercise selection
  const handleSelectExercise = (exercise: ExerciseInfo, fromView: "categories" | "exercises" = "exercises") => {
    setSelectedExercise(exercise);
    setFormBackTarget(fromView);
    
    // Ensure selectedCategory is set so the form renders successfully
    if (!selectedCategory || fromView === "categories") {
      const cat = CATEGORIES.find(c => c.id === exercise.pillar) || { id: exercise.pillar, name: exercise.pillar };
      setSelectedCategory(cat);
    }
    
    // Set default reasonable states depending on form type to speed up logging
    const saved = exerciseInputs[exercise.name] || {};

    if (exercise.formType === "A") {
      if (saved.weight !== undefined) {
        setWeight(saved.weight);
      } else {
        if (exercise.name.toLowerCase().includes("press") && !exercise.name.toLowerCase().includes("leg")) {
          setWeight(exercise.name.toLowerCase().includes("bench") ? 135 : 65);
        } else if (exercise.name.toLowerCase().includes("squat") || exercise.name.toLowerCase().includes("deadlift") || exercise.name.toLowerCase().includes("leg press")) {
          setWeight(185);
        } else {
          setWeight(45);
        }
      }
      setReps(saved.reps !== undefined ? saved.reps : 10);
    } else if (exercise.formType === "B") {
      setReps(saved.reps !== undefined ? saved.reps : (exercise.name.toLowerCase().includes("pullup") ? 6 : (exercise.name.toLowerCase().includes("squat") ? 20 : 12)));
    } else if (exercise.formType === "C") {
      setMinutes(saved.minutes !== undefined ? saved.minutes : 1);
      setSeconds(saved.seconds !== undefined ? saved.seconds : 0);
    } else if (exercise.formType === "D") {
      setDistanceStr(saved.distanceStr !== undefined ? saved.distanceStr : "1.0");
      setMinutes(saved.minutes !== undefined ? saved.minutes : 8);
      setSeconds(saved.seconds !== undefined ? saved.seconds : 30);
    } else if (exercise.formType === "E") {
      setFloors(saved.floors !== undefined ? saved.floors : 30);
      setMinutes(saved.minutes !== undefined ? saved.minutes : 10);
      setSeconds(saved.seconds !== undefined ? saved.seconds : 0);
    } else if (exercise.formType === "F") {
      setHours(saved.hours !== undefined ? saved.hours : 1);
      setMinutes(saved.minutes !== undefined ? saved.minutes : 30);
      setSeconds(saved.seconds !== undefined ? saved.seconds : 0);
      setTrailLevel(saved.trailLevel !== undefined ? saved.trailLevel : 10);
      setDistanceStr(saved.distanceStr !== undefined ? saved.distanceStr : "2.5");
    }

    setNotes("");
    setCurrentView("form");
  };

  const getExercisesForFocusGroup = (focusId: string) => {
    const list = EXERCISE_DATABASE.filter(ex => {
      const nameLower = ex.name.toLowerCase().trim();
      
      if (focusId === "speed") {
        const speedNames = [
          "treadmill run / jog",
          "box jumps",
          "jump rope",
          "bicycle",
          "elliptical",
          "squat jumps",
          "hiking",
          "power clean",
          "barbell squat",
          "dumbbell lunges",
          "kettlebell swings",
          "walking"
        ];
        return speedNames.includes(nameLower);
      }
      if (focusId === "stamina") {
        const staminaNames = [
          "regular push-ups",
          "treadmill run / jog",
          "bodyweight squats",
          "jumping jacks",
          "rowing machine",
          "elliptical",
          "burpees",
          "kettlebell swings",
          "bicycle",
          "stairmaster",
          "hiking",
          "walking"
        ];
        return staminaNames.includes(nameLower);
      }
      
      if (focusId === "chest") return !!ex.builds.chestStrength;
      if (focusId === "back") return !!ex.builds.backStrength;
      if (focusId === "legs") return !!ex.builds.legStrength;
      if (focusId === "arms") return !!ex.builds.armStrength;
      if (focusId === "core") return !!ex.builds.coreStrength;
      
      return false;
    });

    // Filter by anatomical subcategory if selected
    if (selectedSubCategory && selectedSubCategory !== "all") {
      return list.filter(ex => ex.subCategories?.includes(selectedSubCategory));
    }

    return list;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExercise || !selectedCategory) return;
    
    if (restSeconds > 0) {
      // Prevent accidental double clicks within 500ms
      if (Date.now() - lastLoggedTimeRef.current < 500) {
        return;
      }
      if (onUndoWorkout) {
        onUndoWorkout();
      }
      setRestSeconds(0);
      return;
    }

    const actualCategoryName = CATEGORIES.find(c => c.id === selectedExercise.pillar)?.name || selectedCategory.name;

    onLogWorkout({
      exerciseName: selectedExercise.name,
      categoryName: actualCategoryName,
      weight: selectedExercise.formType === "A" ? weight : (selectedExercise.formType === "F" ? trailLevel : undefined),
      reps: (selectedExercise.formType === "A" || selectedExercise.formType === "B") ? reps : undefined,
      minutes: (selectedExercise.formType === "C" || selectedExercise.formType === "D" || selectedExercise.formType === "E") ? minutes : (selectedExercise.formType === "F" ? (hours * 60 + minutes) : undefined),
      seconds: (selectedExercise.formType === "C" || selectedExercise.formType === "D" || selectedExercise.formType === "E" || selectedExercise.formType === "F") ? seconds : undefined,
      distance: (selectedExercise.formType === "D" || selectedExercise.formType === "F") ? (parseFloat(distanceStr) || 1.0) : undefined,
      floors: selectedExercise.formType === "E" ? floors : undefined,
      notes: notes.trim() || undefined
    });

    // Retain form view and values (persistent weight/reps) but lock out with 5s rest timer
    setRestSeconds(5);
    lastLoggedTimeRef.current = Date.now();
  };

  const handleSaveRoutine = () => {
    if (!newRoutineName.trim()) return;
    if (selectedExerciseNames.length === 0) return;
    
    const newRoutine = {
      name: newRoutineName.trim(),
      exercises: selectedExerciseNames
    };
    
    const updated = [...routines, newRoutine];
    setRoutines(updated);
    localStorage.setItem("fitquest_custom_routines", JSON.stringify(updated));
    
    // Set active
    setActiveRoutine(newRoutine);
    
    // Reset form & go back
    setNewRoutineName("");
    setSelectedExerciseNames([]);
    setRoutineSearchQuery("");
    setCurrentView("categories");
  };

  const handleDeleteRoutine = (routineName: string, e: React.MouseEvent) => {
    e.stopPropagation(); // prevent activating it
    const updated = routines.filter(r => r.name !== routineName);
    setRoutines(updated);
    localStorage.setItem("fitquest_custom_routines", JSON.stringify(updated));
    if (activeRoutine?.name === routineName) {
      setActiveRoutine(null);
    }
  };

  const handleBackToCategories = () => {
    setSelectedSubCategory("all");
    setCurrentView("categories");
  };

  // Filter exercises matching active category or focus group
  const isFocusCategory = selectedCategory?.id.startsWith("focus_");
  const activeExercises = selectedCategory
    ? isFocusCategory
      ? getExercisesForFocusGroup(selectedCategory.id.replace("focus_", ""))
      : EXERCISE_DATABASE.filter(ex => ex.pillar === selectedCategory.id)
    : [];

  const filteredExercises = activeExercises.filter(ex => {
    const eqType = getExerciseEquipmentType(ex.pillar, ex.name);
    return eqType === activeFilter;
  });

  return (
    <div className="max-w-2xl mx-auto">
      
      {/* 1. CATEGORY / FOCUS SELECTION VIEW */}
      {currentView === "categories" && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="text-center">
            <h2 className="text-xs font-press-start text-cyan-400 tracking-wider">
              SELECT TARGET TRAINING ZONE
            </h2>
            <p className="text-[10px] font-mono text-slate-400 mt-1.5 uppercase">
              Pick a body section or conditioning focus to log your workout
            </p>
          </div>

          {/* A. ACTIVE WORKOUT ROUTINE STATUS BANNER */}
          {activeRoutine && (
            <div className="p-4 bg-cyan-950/15 border border-cyan-500/30 rounded-2xl space-y-3 shadow-lg shadow-cyan-950/5 animate-fade-in">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping" />
                  <span className="text-[9px] font-press-start text-cyan-300 uppercase tracking-widest">
                    ACTIVE: {activeRoutine.name}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveRoutine(null)}
                  className="px-2.5 py-1 bg-red-950/20 border border-red-500/30 hover:border-red-500 text-red-400 rounded-lg text-[8px] font-press-start flex items-center gap-1.5 cursor-pointer transition active:scale-95"
                >
                  <Square className="w-2.5 h-2.5" /> STOP
                </button>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {activeRoutine.exercises.map(name => {
                  const ex = EXERCISE_DATABASE.find(e => e.name === name);
                  if (!ex) return null;
                  return (
                    <button
                      key={name}
                      type="button"
                      onClick={() => handleSelectExercise(ex, "categories")}
                      className="px-3 py-2 bg-[#0D0D0E] border border-slate-800 hover:border-cyan-400/40 text-slate-350 hover:text-white rounded-xl text-[9px] font-press-start tracking-wide cursor-pointer transition shrink-0"
                    >
                      {ex.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* B. QUICK-LOG RECENTS BAR */}
          {recents.length > 0 && (
            <div className="space-y-2">
              <span className="text-[8px] font-press-start text-slate-500 tracking-wider block uppercase">
                ⚡️ QUICK-LOG RECENTS
              </span>
              <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-none w-full">
                {recents.map((ex) => (
                  <button
                    key={ex.name}
                    type="button"
                    onClick={() => handleSelectExercise(ex, "categories")}
                    className="px-3.5 py-2.5 bg-[#12161A] border border-slate-850 hover:border-cyan-500/40 rounded-xl text-[9px] font-press-start text-white tracking-wide cursor-pointer transition shrink-0"
                  >
                    {ex.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* C. CUSTOM WORKOUT ROUTINES LIST */}
          <div className="bg-[#12161A] border border-slate-855 p-4.5 rounded-2xl space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-850/80 pb-2.5">
              <span className="text-[9px] font-press-start text-cyan-300 uppercase tracking-wider">
                📋 CUSTOM WORKOUT ROUTINES
              </span>
              <button
                type="button"
                onClick={() => {
                  setNewRoutineName("");
                  setSelectedExerciseNames([]);
                  setRoutineSearchQuery("");
                  setCurrentView("create-routine");
                }}
                className="px-2.5 py-1 bg-cyan-500/10 border border-cyan-400/30 hover:border-cyan-400 text-cyan-300 rounded-lg text-[8px] font-press-start flex items-center gap-1 cursor-pointer transition active:scale-95"
              >
                <Plus className="w-2.5 h-2.5" /> CREATE
              </button>
            </div>

            <div className="space-y-2.5">
              {routines.map((routine) => {
                const isActive = activeRoutine?.name === routine.name;
                return (
                  <div
                    key={routine.name}
                    onClick={() => setActiveRoutine(routine)}
                    className={`p-3 border rounded-xl flex items-center justify-between cursor-pointer transition ${
                      isActive
                        ? "border-cyan-400 bg-cyan-950/10"
                        : "border-slate-850 bg-[#161B22]/40 hover:border-slate-700"
                    }`}
                  >
                    <div className="space-y-1">
                      <span className="text-[10px] font-press-start text-white tracking-wide block">
                        {routine.name.toUpperCase()}
                      </span>
                      <span className="text-[8px] font-mono text-slate-500 block uppercase">
                        {routine.exercises.length} Exercises: {routine.exercises.slice(0, 3).join(", ")}{routine.exercises.length > 3 ? "..." : ""}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {!isActive ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveRoutine(routine);
                          }}
                          className="p-1.5 bg-[#0D0D0E] border border-slate-800 text-slate-400 hover:text-cyan-400 rounded-lg cursor-pointer transition"
                          title="Start Workout"
                        >
                          <Play className="w-3 h-3 fill-current" />
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveRoutine(null);
                          }}
                          className="p-1.5 bg-cyan-950/30 border border-cyan-400 text-cyan-300 rounded-lg cursor-pointer transition"
                          title="Stop Workout"
                        >
                          <Square className="w-3 h-3 fill-current" />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={(e) => handleDeleteRoutine(routine.name, e)}
                        className="p-1.5 bg-[#0D0D0E] border border-slate-800 text-slate-400 hover:text-red-400 rounded-lg cursor-pointer transition"
                        title="Delete Routine"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
              {routines.length === 0 && (
                <div className="text-center py-4 text-slate-500 font-mono text-[9px] uppercase">
                  No routines saved. Create one to get started!
                </div>
              )}
            </div>
          </div>

          {/* D. TARGET TRAINING ZONES */}
          <div className="space-y-2">
            <span className="text-[8px] font-press-start text-slate-500 tracking-wider block uppercase">
              🎯 TARGET ZONES
            </span>
            <div className="flex flex-col gap-4">
              {focusGroups.map((group) => (
                <button
                  key={group.id}
                  id={`focus-${group.id}`}
                  style={{ minHeight: "84px" }}
                  onClick={() => {
                    const isSub = group.id === "legs" || group.id === "arms";
                    setSelectedCategory({ id: `focus_${group.id}`, name: group.name });
                    setSelectedSubCategory(isSub ? null : "all");
                    setActiveFilter("weights");
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
                    <span className="text-[10px] font-mono text-slate-450 mt-1 block">
                      {group.desc}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* 2. QUICK GRID EXERCISES VIEW */}
      {currentView === "exercises" && selectedCategory && (
        (() => {
          const hasSubCategories = selectedCategory.id === "focus_legs" || selectedCategory.id === "focus_arms";
          
          if (hasSubCategories && selectedSubCategory === null) {
            return (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="flex items-center justify-between border-b border-slate-850 pb-4">
                  <button
                    onClick={handleBackToCategories}
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

                <div className="text-center py-2">
                  <h2 className="text-xs font-press-start text-slate-350 tracking-wider">
                    SELECT MUSCLE ZONE
                  </h2>
                  <p className="text-[9px] font-mono text-slate-500 mt-1 uppercase">
                    Choose isolation focus group
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {(selectedCategory.id === "focus_legs"
                    ? ["quads", "hamstrings", "glutes", "calves"]
                    : ["biceps", "triceps", "shoulders", "traps"]
                  ).map((subCat) => {
                    const isLegs = selectedCategory.id === "focus_legs";
                    const themeStyle = isLegs
                      ? "border-emerald-500/20 hover:border-emerald-450 focus:border-emerald-400 bg-emerald-950/5 hover:bg-emerald-950/15 text-emerald-400 shadow-lg shadow-emerald-950/5"
                      : "border-pink-500/20 hover:border-pink-450 focus:border-pink-400 bg-pink-950/5 hover:bg-pink-950/15 text-pink-400 shadow-lg shadow-pink-950/5";

                    const getSubCatDesc = (s: string) => {
                      switch (s) {
                        case "quads": return "Front thighs";
                        case "hamstrings": return "Back thighs";
                        case "glutes": return "Hip power";
                        case "calves": return "Lower legs";
                        case "biceps": return "Front arms";
                        case "triceps": return "Back arms";
                        case "shoulders": return "Deltoids";
                        case "traps": return "Upper back";
                        default: return "";
                      }
                    };

                    return (
                      <button
                        key={subCat}
                        style={{ minHeight: "84px" }}
                        onClick={() => {
                          setSelectedSubCategory(subCat);
                          setActiveFilter("weights");
                        }}
                        className={`p-4 border-2 rounded-2xl flex flex-col items-center justify-center text-center transition duration-150 cursor-pointer ${themeStyle}`}
                      >
                        <span className="text-[10px] font-press-start block uppercase tracking-wider">
                          {subCat}
                        </span>
                        <span className="text-[8px] font-mono text-slate-500 mt-1 block uppercase">
                          {getSubCatDesc(subCat)}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Subcategory Progress Overview below the buttons */}
                <div className="bg-[#12161A] border-2 border-slate-855 p-4.5 rounded-2xl space-y-4 shadow-xl">
                  <h4 className="text-[10px] font-press-start text-cyan-300 uppercase tracking-wider text-center">
                    {selectedCategory.name} PROGRESS
                  </h4>
                  
                  {/* Parent progress bar */}
                  {(() => {
                    const focusId = selectedCategory.id.replace("focus_", "");
                    const statKeyMap: Record<string, string> = {
                      legs: "legStrength",
                      arms: "armStrength"
                    };
                    const statKey = statKeyMap[focusId];
                    return statKey ? renderProgressBar(statKey, false) : null;
                  })()}

                  <div className="border-t border-slate-850/80 my-2 pt-2" />

                  {/* Subcategories progress bars */}
                  <div className="space-y-3">
                    {(selectedCategory.id === "focus_legs"
                      ? ["quads", "hamstrings", "glutes", "calves"]
                      : ["biceps", "triceps", "shoulders", "traps"]
                    ).map((subCat) => (
                      <div key={subCat}>
                        {renderProgressBar(subCat, true)}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          }

          return (
            <motion.div
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              {/* Progress bar above the back button / header */}
              {(() => {
                const focusId = selectedCategory.id.replace("focus_", "");
                if (selectedSubCategory && selectedSubCategory !== "all") {
                  return renderProgressBar(selectedSubCategory, true);
                } else {
                  const statKeyMap: Record<string, string> = {
                    chest: "chestStrength",
                    back: "backStrength",
                    legs: "legStrength",
                    arms: "armStrength",
                    core: "coreStrength",
                    speed: "speed",
                    stamina: "stamina"
                  };
                  const statKey = statKeyMap[focusId];
                  return statKey ? renderProgressBar(statKey, false) : null;
                }
              })()}

              <div className="flex items-center justify-between border-b border-slate-850 pb-4">
                <button
                  onClick={hasSubCategories ? () => setSelectedSubCategory(null) : handleBackToCategories}
                  style={{ minHeight: "44px" }}
                  className="px-4 bg-[#161B22] border-2 border-slate-850 text-slate-300 hover:text-white rounded-xl text-xs font-mono font-bold flex items-center gap-2 cursor-pointer transition active:scale-95 shrink-0"
                >
                  <ChevronLeft className="w-4 h-4 text-cyan-400" /> BACK
                </button>
                
                <div className="text-right shrink-0">
                  <span className="text-[10px] font-press-start text-slate-500 block uppercase">
                    {selectedCategory.name}
                  </span>
                  {selectedSubCategory && selectedSubCategory !== "all" && (
                    <span className="text-xs font-press-start text-cyan-300 mt-0.5 block uppercase tracking-wider">
                      {selectedSubCategory}
                    </span>
                  )}
                </div>
              </div>

              {/* 🎛️ EQUIPMENT TYPE MULTI-SELECT FILTERS - Dedicated spacious row below header */}
              <div className="flex items-center justify-between gap-3 pt-1.5 pb-2.5 w-full">
                {[
                  { id: "bodyweight", label: "BODYWEIGHT" },
                  { id: "machines", label: "MACHINE" },
                  { id: "weights", label: "FREE WEIGHTS" }
                ].map((filter) => {
                  const isActive = activeFilter === filter.id;
                  return (
                    <button
                      key={filter.id}
                      type="button"
                      onClick={() => handleToggleFilter(filter.id as any)}
                      style={{ minHeight: "42px" }}
                      className={`flex-1 text-center px-4 py-2 text-[10px] font-mono font-black rounded-xl cursor-pointer transition active:scale-95 border-2 ${
                        isActive 
                          ? "bg-cyan-500/10 border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.15)]"
                          : "bg-[#161B22]/40 border-slate-850 text-slate-500 hover:text-slate-400"
                      }`}
                    >
                      {filter.label}
                    </button>
                  );
                })}
              </div>

              <div className="grid grid-cols-1 gap-3">
                {filteredExercises.map((ex) => (
                  <button
                    key={ex.name}
                    id={`exercise-${ex.name.replace(/\s+/g, "-").toLowerCase()}`}
                    onClick={() => handleSelectExercise(ex, "exercises")}
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
                {filteredExercises.length === 0 && (
                  <div className="text-center py-10 text-slate-500 font-mono text-xs">
                    No exercises registered under this sub-category.
                  </div>
                )}
              </div>
            </motion.div>
          );
        })()
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
              onClick={() => {
                setSelectedExercise(null);
                if (formBackTarget === "categories") {
                  setSelectedCategory(null);
                }
                setCurrentView(formBackTarget);
              }}
              style={{ minHeight: "44px" }}
              className="px-4 bg-[#0D0D0E] border border-slate-800 text-slate-400 hover:text-white rounded-xl text-xs font-mono font-bold flex items-center gap-2 cursor-pointer transition active:scale-95"
            >
              <ChevronLeft className="w-4 h-4 text-cyan-400" /> BACK
            </button>

            <div className="text-right">
              <span className="text-[8px] font-press-start text-slate-500 block uppercase">SINGLE SET LOGGING</span>
              <h3 className="text-xs font-press-start text-cyan-400 mt-0.5 block uppercase tracking-wide">
                {selectedExercise.name}
              </h3>
            </div>
          </div>

          {/* Superset Switcher Bar */}
          {switcherExercises.length > 0 && (
            <div className="bg-[#0D0D0E]/80 border border-slate-850 p-3 rounded-2xl flex flex-col space-y-2 animate-fade-in">
              <span className="text-[7.5px] font-press-start text-cyan-300 uppercase tracking-wider block">
                🔄 SUPERSET / QUICK SWITCH
              </span>
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none items-center w-full">
                {switcherExercises.map((ex) => {
                  const isActive = ex.name === selectedExercise.name;
                  return (
                    <button
                      key={ex.name}
                      type="button"
                      onClick={() => handleSelectExercise(ex, formBackTarget)}
                      className={`px-3.5 py-2 text-[9px] font-press-start rounded-xl border cursor-pointer transition shrink-0 uppercase ${
                        isActive
                          ? "bg-cyan-500/10 border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.15)]"
                          : "bg-[#161B22]/40 border-slate-850 text-slate-550 hover:text-slate-400"
                      }`}
                    >
                      {ex.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Muscle progress bar below the header and above the form fields */}
          {(() => {
            const progressBarsToRender: React.ReactNode[] = [];
            
            // 1. Gather all subcategories (e.g. quads, glutes, biceps, etc.)
            if (selectedExercise.subCategories && selectedExercise.subCategories.length > 0) {
              selectedExercise.subCategories.forEach((subCat) => {
                const bar = renderProgressBar(subCat, true);
                if (bar) progressBarsToRender.push(bar);
              });
            }

            // 2. Gather all builds keys that are main muscles (excluding speed and stamina)
            const buildsKeys = Object.keys(selectedExercise.builds || {});
            const muscleKeys = ["chestStrength", "backStrength", "legStrength", "armStrength", "coreStrength"];
            
            buildsKeys.forEach((key) => {
              const value = (selectedExercise.builds as any)[key] || 0;
              if (value > 0 && muscleKeys.includes(key)) {
                const bar = renderProgressBar(key, false);
                if (bar) progressBarsToRender.push(bar);
              }
            });

            if (progressBarsToRender.length === 0) return null;

            return (
              <div className="space-y-3 pb-1 border-b border-slate-800/60">
                {progressBarsToRender.map((bar, idx) => (
                  <div key={idx} className="animate-fade-in">{bar}</div>
                ))}
              </div>
            );
          })()}

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
                    {(() => {
                      const nameLower = (selectedExercise.name || "").toLowerCase();
                      const isDumbbell = nameLower.includes("dumbbell") || nameLower.includes("dumbell") || nameLower === "hammer curl";
                      return isDumbbell ? (
                        <p className="text-[9px] font-mono text-emerald-400 mt-1.5 uppercase font-bold">
                          Enter weight for ONE dumbbell (System doubles it)
                        </p>
                      ) : (
                        <p className="text-[9px] font-mono text-slate-500 mt-1 uppercase">TAP TO ENTER TARGET WEIGHT</p>
                      );
                    })()}
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
                        value={distanceStr}
                        onChange={(e) => setDistanceStr(e.target.value)}
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

            {/* FORM F: HIKING (CARDIO DURATION + TRAIL LEVEL + DISTANCE) */}
            {selectedExercise.formType === "F" && (
              <div className="space-y-4 animate-fade-in">
                {/* Distance Box */}
                <div className="bg-[#0D0D0E] border-2 border-slate-855 p-5 rounded-2xl text-center space-y-3">
                  <div>
                    <label className="text-[10px] font-press-start text-purple-400 block uppercase tracking-wider">
                      🥾 HIKING DISTANCE (MILES)
                    </label>
                    <p className="text-[9px] font-mono text-slate-500 mt-1 uppercase">TAP TO ENTER ESTIMATED MILES</p>
                  </div>
                  
                  <div className="flex flex-col items-center max-w-xs mx-auto">
                    <div className="relative flex items-baseline justify-center gap-1.5">
                      <input
                        type="number"
                        step="0.01"
                        inputMode="decimal"
                        value={distanceStr}
                        onChange={(e) => setDistanceStr(e.target.value)}
                        onFocus={(e) => e.target.select()}
                        className="bg-[#12161A] border-2 border-slate-800 text-center font-bold text-3xl text-white w-32 py-2.5 rounded-xl outline-none focus:border-cyan-500 font-mono tracking-wide"
                        required
                      />
                      <span className="text-xs font-mono text-slate-500 font-bold uppercase">Miles</span>
                    </div>
                  </div>
                </div>

                {/* Trail Level Box */}
                <div className="bg-[#0D0D0E] border-2 border-slate-855 p-5 rounded-2xl text-center space-y-3">
                  <div className="flex justify-between items-center px-1">
                    <div>
                      <label className="text-[10px] font-press-start text-cyan-300 block uppercase tracking-wider">
                        🏔️ TRAIL DIFFICULTY LEVEL
                      </label>
                      <p className="text-[9px] font-mono text-slate-500 mt-1">SLIDE TO SELECT TRAIL LEVEL (1-100)</p>
                    </div>
                    <span className="font-mono text-xs text-slate-400 font-bold bg-[#12161A] px-2.5 py-1 rounded border border-slate-800">
                      Level: <strong className="text-cyan-400 text-sm font-black mx-1">{trailLevel}</strong>
                    </span>
                  </div>
                  
                  <div className="pt-2 px-2">
                    <input
                      type="range"
                      min="1"
                      max="100"
                      value={trailLevel}
                      onChange={(e) => setTrailLevel(parseInt(e.target.value) || 1)}
                      className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                    />
                    <div className="flex justify-between text-[8px] font-mono text-slate-500 px-1 mt-1">
                      <span>LVL 1 (FLAT WALK)</span>
                      <span>LVL 50 (STEEP HILLS)</span>
                      <span>LVL 100 (MOUNTAIN PEAK)</span>
                    </div>
                  </div>
                </div>

                {/* Hiking Duration Time */}
                <div className="bg-[#0D0D0E] border-2 border-slate-855 p-5 rounded-2xl text-center space-y-4">
                  <div>
                    <label className="text-[10px] font-press-start text-purple-400 block uppercase tracking-wider">
                      ⏱️ HIKING DURATION (HOURS + MINS + SECS)
                    </label>
                    <p className="text-[9px] font-mono text-slate-500 mt-1">TAP NUMBERS TO ENTER TIME</p>
                  </div>

                  <div className="flex items-center justify-center gap-3 max-w-sm mx-auto">
                    {/* Hours */}
                    <div className="flex flex-col items-center">
                      <span className="text-[8px] font-press-start text-slate-500 mb-2 uppercase">Hrs</span>
                      <input
                        type="number"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={hours}
                        onChange={(e) => setHours(Math.max(0, parseInt(e.target.value) || 0))}
                        onFocus={(e) => e.target.select()}
                        className="bg-[#12161A] border-2 border-slate-800 text-center font-bold text-2xl text-white w-16 py-2.5 rounded-xl outline-none focus:border-cyan-500 font-mono"
                      />
                    </div>

                    <span className="text-xl font-mono text-slate-600 font-bold pt-4">:</span>

                    {/* Minutes */}
                    <div className="flex flex-col items-center">
                      <span className="text-[8px] font-press-start text-slate-500 mb-2 uppercase">Min</span>
                      <input
                        type="number"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={minutes}
                        onChange={(e) => setMinutes(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                        onFocus={(e) => e.target.select()}
                        className="bg-[#12161A] border-2 border-slate-800 text-center font-bold text-2xl text-white w-16 py-2.5 rounded-xl outline-none focus:border-cyan-500 font-mono"
                      />
                    </div>

                    <span className="text-xl font-mono text-slate-600 font-bold pt-4">:</span>

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
                        className="bg-[#12161A] border-2 border-slate-800 text-center font-bold text-2xl text-white w-16 py-2.5 rounded-xl outline-none focus:border-cyan-500 font-mono"
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
                onClick={() => { setSelectedExercise(null); setCurrentView("exercises"); }}
                style={{ minHeight: "50px" }}
                className="flex-1 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white rounded-xl text-xs font-mono font-bold cursor-pointer transition active:scale-95"
              >
                BACK TO LIST
              </button>
              
              <button
                type="submit"
                style={{ minHeight: "50px" }}
                className={`flex-[2] rounded-xl text-xs font-press-start text-center tracking-wider font-extrabold cursor-pointer transition select-none active:translate-y-[1px] ${
                  restSeconds > 0
                    ? "bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-450 hover:to-orange-400 text-white shadow-lg shadow-red-500/15 animate-pulse"
                    : "bg-gradient-to-r from-cyan-500 to-emerald-400 hover:from-cyan-400 hover:to-emerald-350 text-black shadow-lg shadow-cyan-500/10"
                }`}
              >
                {restSeconds > 0 ? `UNDO SET (${restSeconds}S)` : "SUBMIT SET"}
              </button>
            </div>

            {/* Visual Form Guide (Images / Image) */}
            {selectedExercise.images && selectedExercise.images.length > 0 ? (
              <div className="pt-6 border-t border-slate-800 flex flex-col items-center justify-center gap-2">
                <span className="text-[8.5px] font-press-start text-slate-500 block tracking-widest uppercase pl-1">
                  🖼️ VISUAL FORM GUIDE
                </span>
                <div className="border-2 border-cyan-500/35 bg-[#0D0D0E] p-2 rounded-2xl max-w-[240px] overflow-hidden shadow-md">
                  <img
                    src={selectedExercise.images[frameIndex]}
                    alt={selectedExercise.name}
                    className="w-full h-auto rounded-lg object-contain"
                    style={{ imageRendering: "pixelated" }}
                  />
                </div>
              </div>
            ) : selectedExercise.image ? (
              <div className="pt-6 border-t border-slate-800 flex flex-col items-center justify-center gap-2">
                <span className="text-[8.5px] font-press-start text-slate-500 block tracking-widest uppercase pl-1">
                  🖼️ VISUAL FORM GUIDE
                </span>
                <div className="border-2 border-cyan-500/35 bg-[#0D0D0E] p-2 rounded-2xl max-w-[240px] overflow-hidden shadow-md">
                  <img
                    src={selectedExercise.image}
                    alt={selectedExercise.name}
                    className="w-full h-auto rounded-lg object-contain"
                    style={{ imageRendering: "pixelated" }}
                  />
                </div>
              </div>
            ) : null}

          </form>
        </motion.div>
      )}

      {/* 4. WORKOUT ROUTINE CREATOR VIEW */}
      {currentView === "create-routine" && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[#161B22] border-2 border-slate-850 rounded-2xl p-5 md:p-6 shadow-2xl space-y-6 animate-fade-in"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <button
              type="button"
              onClick={() => setCurrentView("categories")}
              style={{ minHeight: "44px" }}
              className="px-4 bg-[#0D0D0E] border border-slate-800 text-slate-400 hover:text-white rounded-xl text-xs font-mono font-bold flex items-center gap-2 cursor-pointer transition active:scale-95"
            >
              <ChevronLeft className="w-4 h-4 text-cyan-400" /> CANCEL
            </button>

            <div className="text-right">
              <span className="text-[8px] font-press-start text-slate-500 block uppercase">ROUTINE CREATOR</span>
              <h3 className="text-xs font-press-start text-cyan-400 mt-0.5 block uppercase tracking-wide">
                NEW ROUTINE
              </h3>
            </div>
          </div>

          <div className="space-y-4">
            {/* Input Name field */}
            <div className="space-y-2">
              <label className="text-[9px] font-press-start text-cyan-300 block uppercase tracking-wider">
                ROUTINE NAME
              </label>
              <input
                type="text"
                placeholder="e.g. Push Day, Arm Blaster"
                value={newRoutineName}
                onChange={(e) => setNewRoutineName(e.target.value)}
                className="w-full bg-[#12161A] border-2 border-slate-850 text-white px-4 py-3 rounded-xl outline-none focus:border-cyan-500 font-mono tracking-wide"
              />
            </div>

            {/* Search Exercises field */}
            <div className="space-y-2">
              <label className="text-[9px] font-press-start text-slate-400 block uppercase tracking-wider">
                SELECT EXERCISES
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder="Search exercise..."
                  value={routineSearchQuery}
                  onChange={(e) => setRoutineSearchQuery(e.target.value)}
                  className="w-full bg-[#12161A] border-2 border-slate-850 text-white pl-10 pr-4 py-3 rounded-xl outline-none focus:border-cyan-500 font-mono tracking-wide"
                />
              </div>
            </div>

            {/* List of exercises with checkboxes */}
            <div className="max-h-[250px] overflow-y-auto border-2 border-slate-850 rounded-2xl bg-[#0D0D0E] divide-y divide-slate-900 scrollbar-thin">
              {EXERCISE_DATABASE.filter(ex => 
                ex.name.toLowerCase().includes(routineSearchQuery.toLowerCase())
              ).map((ex) => {
                const isChecked = selectedExerciseNames.includes(ex.name);
                const handleToggle = () => {
                  if (isChecked) {
                    setSelectedExerciseNames(prev => prev.filter(name => name !== ex.name));
                  } else {
                    setSelectedExerciseNames(prev => [...prev, ex.name]);
                  }
                };

                return (
                  <div
                    key={ex.name}
                    onClick={handleToggle}
                    className="p-3 flex items-center justify-between hover:bg-[#161B22]/30 cursor-pointer transition select-none"
                  >
                    <div className="space-y-0.5 pr-4 text-left">
                      <span className="text-[9px] font-press-start text-white block">
                        {ex.name}
                      </span>
                      <span className="text-[8px] font-mono text-cyan-400/85 uppercase block">
                        {ex.pillar.toUpperCase()} • builds: {Object.keys(ex.builds).join(", ")}
                      </span>
                    </div>

                    <div className="shrink-0 pr-1">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={handleToggle}
                        className="w-4 h-4 rounded border-slate-800 text-cyan-500 focus:ring-cyan-500/20 bg-[#12161A] cursor-pointer"
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Save Button */}
            <button
              onClick={handleSaveRoutine}
              disabled={!newRoutineName.trim() || selectedExerciseNames.length === 0}
              className={`w-full py-3.5 rounded-xl text-xs font-press-start tracking-wider flex items-center justify-center gap-2 transition active:scale-95 ${
                newRoutineName.trim() && selectedExerciseNames.length > 0
                  ? "bg-cyan-500 hover:bg-cyan-450 border border-cyan-400 text-slate-950 font-black cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                  : "bg-slate-800 border border-slate-850 text-slate-500 cursor-not-allowed"
              }`}
            >
              <Save className="w-4 h-4" /> SAVE WORKOUT ROUTINE
            </button>
          </div>
        </motion.div>
      )}

    </div>
  );
}
