import React, { useState, useRef, useEffect } from "react";
import { EXERCISE_DATABASE, CATEGORIES, getAllExercises, saveCustomExercise, deleteCustomExercise, getCustomExercises } from "../exercises";
import { ExerciseInfo, ExercisePillar, AthleteProfile, FitnessLog } from "../types";
import { evaluateAthletePerformance, calculateSubCategoryLevels } from "../utils/fitnessMath";
import { pixelMusclePaths } from "../data/pixelMusclePaths";
import BodyStatusMap from "./BodyStatusMap";
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
  Save,
  Sparkles,
  Upload,
  Image as ImageIcon,
  Trophy,
  Heart
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
  // Current view states: "categories" | "exercises" | "form" | "create-routine" | "create-exercise"
  const [currentView, setCurrentView] = useState<"categories" | "exercises" | "form" | "create-routine" | "create-exercise">("categories");
  const [selectedCategory, setSelectedCategory] = useState<{ id: string; name: string } | null>(null);
  const [selectedExercise, setSelectedExercise] = useState<ExerciseInfo | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>("all");
  const [expandedGroup, setExpandedGroup] = useState<"arms" | "legs" | null>(null);
  const [restSeconds, setRestSeconds] = useState<number>(0);
  const [frameIndex, setFrameIndex] = useState<number>(0);

  // Anatomy targeting HUD view states
  const [hudViewSide, setHudViewSide] = useState<"front" | "back">("front");
  const [selectedHudMuscle, setSelectedHudMuscle] = useState<string>("chest");
  const [activeSubTab, setActiveSubTab] = useState<"exercises" | "workouts">("exercises");

  const getMuscleColor = (muscleKey: string) => {
    if (muscleKey === selectedHudMuscle) {
      return "url(#steel-glint-logger)";
    }
    return "#22D3EE";
  };

  const handleMuscleTap = (muscle: string) => {
    setSelectedHudMuscle(muscle);
  };

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

  // Custom Exercise Creator Form states
  const [customExName, setCustomExName] = useState("");
  const [customExPillar, setCustomExPillar] = useState<ExercisePillar>("weights");
  const [customExMuscles, setCustomExMuscles] = useState<string[]>(["chest"]);
  const [customExFormType, setCustomExFormType] = useState<"A" | "B" | "C" | "D">("A");
  const [customExImageUrl, setCustomExImageUrl] = useState("");
  const [customExImagePreview, setCustomExImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dynamic Recents calculation
  const recents = React.useMemo(() => {
    const uniqueNames: string[] = [];
    const sortedLogs = [...logs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    for (const log of sortedLogs) {
      if (log.exerciseName) {
        const match = getAllExercises().find(e => e.name.toLowerCase() === log.exerciseName!.toLowerCase());
        if (match && !uniqueNames.includes(match.name)) {
          uniqueNames.push(match.name);
          if (uniqueNames.length >= 6) break;
        }
      }
    }
    return uniqueNames.map(name => getAllExercises().find(e => e.name === name)!).filter(Boolean);
  }, [logs]);

  const switcherExercises = React.useMemo(() => {
    if (activeRoutine) {
      return activeRoutine.exercises
        .map(name => getAllExercises().find(e => e.name === name)!)
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
    ].map(name => getAllExercises().find(e => e.name === name)!).filter(Boolean);
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
  const [activeFilter, setActiveFilter] = useState<"weights" | "machines" | "bodyweight" | "cardio">("bodyweight");

  // Dynamic weekly stimulus progress calculations
  const performance = evaluateAthletePerformance(logs, profile.bodyWeight);
  const weeklyVolume = performance.weeklyVolume;
  const weeklySubVolume = performance.weeklySubVolume;

  const subCategoryLevels = React.useMemo(() => {
    return calculateSubCategoryLevels(logs, profile.bodyWeight, performance.statLevels);
  }, [logs, profile.bodyWeight, performance.statLevels]);

  const statConfig = {
    chestStrength: { label: "Chest", colorHex: "#22d3ee" },
    backStrength: { label: "Back", colorHex: "#fb923c" },
    legStrength: { label: "Legs", colorHex: "#34d399" },
    armStrength: { label: "Arms", colorHex: "#f472b6" },
    coreStrength: { label: "Core", colorHex: "#fbbf24" },
    cardio: { label: "Cardio", colorHex: "#06b6d4" },
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

  const handleToggleFilter = (filter: "weights" | "machines" | "bodyweight" | "cardio") => {
    setActiveFilter(filter);
    if (filter === "cardio") {
      setSelectedHudMuscle("cardio");
    }
  };

  const getExerciseEquipmentType = (pillar: string, name: string): "weights" | "machines" | "bodyweight" | "cardio" => {
    if (pillar === "cardio") return "cardio";
    if (pillar === "weights") return "weights";
    if (pillar === "machines") return "machines";
    if (pillar === "bodyweight") return "bodyweight";
    return "bodyweight";
  };

  const focusGroups = [
    {
      id: "stamina",
      name: "Stamina",
      icon: <Timer className="w-8 h-8 text-purple-400" />,
      style: "border-purple-500/30 hover:border-purple-450 focus:border-purple-400 bg-purple-950/10 hover:bg-purple-950/20",
      desc: "Conditioning pushups, burpees, & rowing"
    },
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
      id: "arms",
      name: "Arms",
      icon: <Zap className="w-8 h-8 text-pink-400" />,
      style: "border-pink-500/30 hover:border-pink-450 focus:border-pink-400 bg-pink-950/10 hover:bg-pink-950/20",
      desc: "Vertical press, curls, dips & extension work"
    },
    {
      id: "legs",
      name: "Legs",
      icon: <Activity className="w-8 h-8 text-emerald-400" />,
      style: "border-emerald-500/30 hover:border-emerald-450 focus:border-emerald-400 bg-emerald-950/10 hover:bg-emerald-950/20",
      desc: "Heavy squats, leg presses, & calf raises"
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
    if (exercise.builds.cardio || exercise.builds.stamina || exercise.builds.speed || exercise.pillar === "cardio") {
      parts.push("Cardio");
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

  const getExercisesForMuscle = (muscle: string) => {
    return getAllExercises().filter(ex => {
      const nameLower = ex.name.toLowerCase().trim();
      
      switch (muscle) {
        case "cardio":
          return ex.pillar === "cardio" || !!ex.builds.cardio || ex.subCategories?.includes("cardio");
        case "chest":
          return !!ex.builds.chestStrength || ex.subCategories?.includes("chest") || nameLower.includes("push") || nameLower.includes("bench") || nameLower.includes("fly") || nameLower.includes("pec");
        case "back":
          return !!ex.builds.backStrength || ex.subCategories?.includes("back") || nameLower.includes("row") || nameLower.includes("pulldown") || nameLower.includes("pull-up") || nameLower.includes("pullup") || nameLower.includes("deadlift") || nameLower.includes("superman");
        case "core":
          return !!ex.builds.coreStrength || ex.subCategories?.includes("core") || nameLower.includes("plank") || nameLower.includes("crunch") || nameLower.includes("sit-up") || nameLower.includes("twist") || nameLower.includes("ab");
        case "speed":
        case "stamina":
          return ex.pillar === "cardio" || !!ex.builds.cardio || !!ex.builds.speed || !!ex.builds.stamina;
        case "shoulders":
          return ex.subCategories?.includes("shoulders") || nameLower.includes("overhead press") || nameLower.includes("lateral raise") || nameLower.includes("front raise") || nameLower.includes("deltoid") || nameLower.includes("pike");
        case "biceps":
          return ex.subCategories?.includes("biceps") || nameLower.includes("bicep") || nameLower.includes("curl") || nameLower.includes("chin-up");
        case "triceps":
          return ex.subCategories?.includes("triceps") || nameLower.includes("tricep") || nameLower.includes("pushdown") || nameLower.includes("skull") || nameLower.includes("dip");
        case "traps":
          return ex.subCategories?.includes("traps") || nameLower.includes("shrug") || nameLower.includes("upright row");
        case "quads":
          return ex.subCategories?.includes("quads") || nameLower.includes("squat") || nameLower.includes("leg press") || nameLower.includes("leg extension") || nameLower.includes("quad extension") || nameLower.includes("lunge");
        case "hamstrings":
          return ex.subCategories?.includes("hamstrings") || nameLower.includes("hamstring") || nameLower.includes("romanian") || nameLower.includes("good morning") || nameLower.includes("stiff leg");
        case "glutes":
          return ex.subCategories?.includes("glutes") || nameLower.includes("glute") || nameLower.includes("hip thrust") || nameLower.includes("abduction") || nameLower.includes("kickback");
        case "calves":
          return ex.subCategories?.includes("calves") || nameLower.includes("calf") || nameLower.includes("calves");
        case "forearms":
          return ex.subCategories?.includes("forearms") || nameLower.includes("forearm") || nameLower.includes("wrist") || nameLower.includes("grip");
        default:
          return false;
      }
    });
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

  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setCustomExImagePreview(reader.result);
          setCustomExImageUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveCustomExerciseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customExName.trim()) {
      alert("Please enter an exercise name!");
      return;
    }
    if (customExMuscles.length === 0) {
      alert("Please select at least one target muscle on the body map!");
      return;
    }

    let buildsDict: Record<string, number> = {};
    let subCats: string[] = [];

    const weightPerMuscle = Math.round(100 / customExMuscles.length);
    customExMuscles.forEach(m => {
      subCats.push(m);
      if (m === "chest") buildsDict.chestStrength = (buildsDict.chestStrength || 0) + weightPerMuscle;
      else if (m === "back") buildsDict.backStrength = (buildsDict.backStrength || 0) + weightPerMuscle;
      else if (m === "core") buildsDict.coreStrength = (buildsDict.coreStrength || 0) + weightPerMuscle;
      else if (m === "cardio" || m === "speed" || m === "stamina") buildsDict.cardio = (buildsDict.cardio || 0) + weightPerMuscle;
      else if (["quads", "hamstrings", "glutes", "calves"].includes(m)) buildsDict.legStrength = (buildsDict.legStrength || 0) + weightPerMuscle;
      else buildsDict.armStrength = (buildsDict.armStrength || 0) + weightPerMuscle;
    });

    const newExercise: ExerciseInfo = {
      name: customExName.trim(),
      pillar: customExPillar,
      formType: customExFormType,
      description: `Custom ${customExPillar} exercise targeting ${customExMuscles.join(", ")}.`,
      builds: buildsDict,
      subCategories: subCats,
      image: customExImageUrl.trim() || undefined
    };

    saveCustomExercise(newExercise);

    // Reset form
    setCustomExName("");
    setCustomExMuscles(["chest"]);
    setCustomExImageUrl("");
    setCustomExImagePreview(null);
    
    // Select category matching custom exercise
    const catName = customExPillar === "weights" ? "Free Weights" : customExPillar === "machines" ? "Machines" : customExPillar === "bodyweight" ? "Bodyweight" : "Cardio";
    setSelectedCategory({ id: customExPillar, name: catName });
    setSelectedSubCategory("all");
    
    // Open logging form
    handleSelectExercise(newExercise, "categories");
  };

  const handleDeleteCustomEx = (name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Delete custom exercise "${name}"?`)) {
      deleteCustomExercise(name);
      // force re-render by toggling selectedSubCategory
      setSelectedSubCategory(prev => prev === "all" ? null : "all");
      setTimeout(() => setSelectedSubCategory("all"), 50);
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
      : getAllExercises().filter(ex => ex.pillar === selectedCategory.id)
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

          {/* Centered Capsule Sub-Navigation */}
          <div className="flex justify-center pb-2">
            <div className="bg-[#161B22] border border-slate-800 p-1 rounded-full flex items-center relative shadow-lg shadow-cyan-950/10">
              {[
                { id: "exercises", label: "EXERCISES" },
                { id: "workouts", label: "WORKOUTS" }
              ].map((tab) => {
                const isActive = activeSubTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveSubTab(tab.id as any)}
                    style={{ minHeight: "36px" }}
                    className={`px-4 py-1.5 rounded-full text-[9px] font-press-start tracking-wider transition-colors duration-200 relative cursor-pointer ${
                      isActive
                        ? "text-cyan-300 font-extrabold"
                        : "text-slate-500 hover:text-slate-350"
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeSubTabIndicatorLogger"
                        className="absolute inset-0 bg-gradient-to-r from-cyan-950/90 via-cyan-900/40 to-slate-900 border border-cyan-400/50 rounded-full shadow-[0_0_12px_rgba(6,182,212,0.25)] z-0"
                        transition={{ type: "spring", stiffness: 400, damping: 32 }}
                      />
                    )}
                    <span className="relative z-10">{tab.label}</span>
                  </button>
                );
              })}
            </div>
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
                      className="px-3 py-2 bg-[#0D0D0E] border border-slate-800 hover:border-cyan-400/40 text-slate-355 hover:text-white rounded-xl text-[9px] font-press-start tracking-wide cursor-pointer transition shrink-0"
                    >
                      {ex.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {activeSubTab === "exercises" && (
            <motion.div
              key="exercises-subtab"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15 }}
              className="space-y-6"
            >
              {/* D. ANATOMY TARGETING HUD */}
              <div className="bg-[#161B22] border-2 border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4">
                {/* Header & FRONT / BACK capsule */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-[8px] font-press-start text-cyan-400 tracking-widest block uppercase mb-1">
                      ANATOMY TARGETING HUD
                    </span>
                    <p className="text-[8px] text-slate-400 font-mono leading-relaxed">
                      Click any muscle region or list item to view and log exercises.
                    </p>
                  </div>

                  {/* FRONT / BACK TOGGLE CAPSULE */}
                  <div className="bg-[#0D0D0E] border border-slate-800 p-1 rounded-xl flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        setHudViewSide("front");
                        setSelectedHudMuscle("chest");
                      }}
                      style={{ minHeight: "30px", minWidth: "75px" }}
                      className={`px-3 py-1 rounded-lg text-[8px] font-press-start tracking-wider transition-all duration-200 cursor-pointer ${
                        hudViewSide === "front"
                          ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-[0_0_8px_rgba(6,182,212,0.3)] font-bold"
                          : "text-slate-500 hover:text-slate-300"
                      }`}
                    >
                      FRONT
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setHudViewSide("back");
                        setSelectedHudMuscle("back");
                      }}
                      style={{ minHeight: "30px", minWidth: "75px" }}
                      className={`px-3 py-1 rounded-lg text-[8px] font-press-start tracking-wider transition-all duration-200 cursor-pointer ${
                        hudViewSide === "back"
                          ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-[0_0_8px_rgba(6,182,212,0.3)] font-bold"
                          : "text-slate-500 hover:text-slate-300"
                      }`}
                    >
                      BACK
                    </button>
                  </div>
                </div>

                {/* CENTERED CHARACTER DIAGRAM WITH TOP-RIGHT BADGE & BOTTOM CARDIO BUTTON */}
                <div className="flex flex-col items-center justify-center space-y-3 w-full">
                  {/* Character Diagram Image */}
                  <div className="relative w-full max-w-[290px] aspect-[488/585] bg-black rounded-xl overflow-hidden border border-slate-900 shadow-inner mx-auto">
                    {/* Top-Right Highlighted Muscle Label Badge */}
                    <div className="absolute top-2 right-2 bg-slate-950/90 border border-cyan-400/80 px-2 py-0.5 rounded-lg text-cyan-300 font-press-start text-[7.5px] uppercase tracking-wider shadow-[0_0_10px_rgba(6,182,212,0.3)] z-20 pointer-events-none">
                      {selectedHudMuscle.toUpperCase()}
                    </div>

                    <svg
                      viewBox={hudViewSide === "front" ? "21 0 488 585" : "424 0 488 585"}
                      className="w-full h-full select-none"
                      xmlns="http://www.w3.org/2000/svg"
                      shapeRendering="crispEdges"
                    >
                      <defs>
                        <linearGradient id="steel-glint-logger" x1="0%" y1="0%" x2="100%" y2="50%">
                          <stop offset="0%" stopColor="#3E4A5A" />
                          <stop offset="42%" stopColor="#3E4A5A" />
                          <stop offset="50%" stopColor="#C9D6E8" stopOpacity="0.35" />
                          <stop offset="58%" stopColor="#3E4A5A" />
                          <stop offset="100%" stopColor="#3E4A5A" />
                          <animate 
                            attributeName="x1" 
                            from="-100%" 
                            to="100%" 
                            dur="2.8s" 
                            repeatCount="indefinite" 
                          />
                          <animate 
                            attributeName="x2" 
                            from="0%" 
                            to="200%" 
                            dur="2.8s" 
                            repeatCount="indefinite" 
                          />
                        </linearGradient>

                        {["chest", "back", "core", "biceps", "triceps", "shoulders", "traps", "quads", "hamstrings", "glutes", "calves", "forearms"].map(m => {
                          const paths = pixelMusclePaths.filter(p => p.muscle === m);
                          return (
                            <clipPath id={`clip-logger-${m}`} key={`clip-logger-${m}`}>
                              {paths.map((p, idx) => (
                                <path d={p.d} key={idx} />
                              ))}
                            </clipPath>
                          );
                        })}

                        <clipPath id="side-clip-logger">
                          <rect
                            x={hudViewSide === "front" ? "0" : "455"}
                            y="0"
                            width={hudViewSide === "front" ? "455" : "521"}
                            height="585"
                          />
                        </clipPath>
                      </defs>

                      {/* Layer 1: Base image */}
                      <image
                        href="/muscle_map.png"
                        x="0"
                        y="0"
                        width="976"
                        height="585"
                        preserveAspectRatio="none"
                        clipPath="url(#side-clip-logger)"
                      />

                      {/* Layer 2: Color overlays for ALL muscles based on level */}
                      {pixelMusclePaths.map((path, idx) => {
                        const color = getMuscleColor(path.muscle);
                        const isSelected = path.muscle === selectedHudMuscle;
                        return (
                          <path
                            key={`${path.id}-${idx}-logger-hud`}
                            d={path.d}
                            fill={color}
                            opacity={isSelected ? 1 : 0.7}
                            style={{
                              filter: isSelected
                                ? "drop-shadow(0 0 6px rgba(200, 230, 245, 0.9))"
                                : "drop-shadow(0 0 4px rgba(34, 211, 238, 0.85))"
                            }}
                            className="cursor-pointer hover:opacity-90 transition-all duration-150"
                            onClick={() => handleMuscleTap(path.muscle)}
                          />
                        );
                      })}
                    </svg>
                  </div>

                  {/* Cardio Button Below Image */}
                  <button
                    type="button"
                    onClick={() => handleMuscleTap("cardio")}
                    style={{ minHeight: "44px" }}
                    className={`w-full max-w-[290px] border-2 rounded-xl px-4 py-2.5 flex items-center justify-center gap-2 font-press-start text-xs uppercase cursor-pointer transition active:scale-95 ${
                      selectedHudMuscle === "cardio"
                        ? "bg-cyan-950/60 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)] font-bold"
                        : "bg-[#12161A] hover:bg-[#161B22] border-slate-850 text-slate-400 hover:text-white"
                    }`}
                  >
                    <Flame className="w-4 h-4 text-cyan-400" /> CARDIO
                  </button>
                </div>

                {/* Custom Exercise Creator and Header */}
                <div className="flex items-center justify-between border-t border-slate-800 pt-4">
                  <span className="text-[8px] font-press-start text-slate-500 tracking-wider block uppercase">
                    ⚙️ FILTER BY EQUIPMENT
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setCustomExName("");
                      setCustomExImageUrl("");
                      setCustomExImagePreview(null);
                      setCurrentView("create-exercise");
                    }}
                    className="px-2.5 py-1 bg-cyan-500/10 border border-cyan-400/40 hover:border-cyan-400 text-cyan-300 rounded-lg text-[8px] font-press-start flex items-center gap-1 cursor-pointer transition active:scale-95"
                  >
                    <Plus className="w-2.5 h-2.5 text-cyan-400" /> ADD CUSTOM EXERCISE
                  </button>
                </div>

                {/* 🎛️ EQUIPMENT TYPE FILTERS */}
                <div className="flex items-center justify-between gap-3 w-full">
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

                {/* Exercises Grid */}
                <div className="space-y-2 pt-2">
                  <span className="text-[8px] font-press-start text-slate-500 tracking-wider block uppercase">
                    ⚔️ AVAILABLE EXERCISES ({selectedHudMuscle.toUpperCase()})
                  </span>
                  <div className="grid grid-cols-1 gap-3">
                    {(() => {
                      const activeExercises = getExercisesForMuscle(selectedHudMuscle);
                      const filteredExercises = activeExercises.filter(ex => {
                        if (selectedHudMuscle === "cardio") {
                          return true;
                        }
                        const eqType = getExerciseEquipmentType(ex.pillar, ex.name);
                        return eqType === activeFilter;
                      });

                      const displayExercises = (filteredExercises.length > 0) ? filteredExercises : activeExercises;

                      return (
                        <>
                          {displayExercises.map((ex) => {
                            const isCustom = getCustomExercises().some(c => c.name.toLowerCase() === ex.name.toLowerCase());
                            return (
                              <div key={ex.name} className="relative group">
                                <button
                                  id={`exercise-${ex.name.replace(/\s+/g, "-").toLowerCase()}`}
                                  onClick={() => handleSelectExercise(ex, "categories")}
                                  style={{ minHeight: "56px" }}
                                  className="w-full p-3 bg-[#12161A] border-2 border-slate-850 hover:border-cyan-500/40 hover:bg-[#161B22]/60 rounded-xl text-center transition flex flex-col items-center justify-center gap-1 cursor-pointer"
                                >
                                  <div className="flex items-center justify-center gap-1.5 flex-wrap">
                                    <span className="text-[9px] font-press-start text-white group-hover:text-cyan-300 uppercase leading-snug">
                                      {ex.name}
                                    </span>
                                  </div>
                                  <span className="text-[7.5px] font-mono text-slate-450 uppercase font-bold tracking-wide">
                                    {getBuildsDescription(ex)}
                                  </span>
                                </button>
                                
                                {isCustom && (
                                  <button
                                    type="button"
                                    onClick={(e) => handleDeleteCustomEx(ex.name, e)}
                                    className="absolute -top-1 -right-1 w-5 h-5 bg-[#0D0D0E] border border-slate-800 hover:border-red-500 text-slate-400 hover:text-red-400 rounded-lg flex items-center justify-center cursor-pointer transition active:scale-90"
                                    title="Delete Custom Exercise"
                                  >
                                    ✕
                                  </button>
                                )}
                              </div>
                            );
                          })}
                          {displayExercises.length === 0 && (
                            <div className="col-span-2 text-center py-6 text-slate-500 border border-dashed border-slate-850 rounded-2xl font-mono text-[9px] uppercase">
                              No exercises found for this muscle zone.
                            </div>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeSubTab === "workouts" && (
            <motion.div
              key="workouts-subtab"
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.15 }}
              className="space-y-6"
            >
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
                            : "border-slate-855 bg-[#161B22]/40 hover:border-slate-700"
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
            </motion.div>
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
          {/* Progress bar above the back button / header */}
          {(() => {
            const focusId = selectedCategory.id.replace("focus_", "");
            if (selectedSubCategory && selectedSubCategory !== "all") {
              return renderProgressBar(selectedSubCategory, true);
            } else {
              const statKeyMap: Record<string, string> = {
                chest: "chestStrength",
                back: "backStrength",
                core: "coreStrength",
                speed: "cardio",
                stamina: "cardio",
                cardio: "cardio"
              };
              const statKey = statKeyMap[focusId];
              return statKey ? renderProgressBar(statKey, false) : null;
            }
          })()}

          <div className="flex items-center justify-between border-b border-slate-850 pb-4">
            <button
              onClick={handleBackToCategories}
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

              <div className="grid grid-cols-2 gap-3">
                {filteredExercises.map((ex) => {
                  const isCustom = getCustomExercises().some(c => c.name.toLowerCase() === ex.name.toLowerCase());
                  return (
                    <div key={ex.name} className="relative group">
                      <button
                        id={`exercise-${ex.name.replace(/\s+/g, "-").toLowerCase()}`}
                        onClick={() => handleSelectExercise(ex, "exercises")}
                        style={{ minHeight: "56px" }}
                        className="w-full p-3 bg-[#12161A] border-2 border-slate-850 hover:border-cyan-500/40 hover:bg-[#161B22]/60 rounded-xl text-center transition flex flex-col items-center justify-center gap-1 cursor-pointer"
                      >
                        <div className="flex items-center justify-center gap-1.5 flex-wrap">
                          <span className="text-[10.5px] font-press-start text-white block text-center leading-snug">
                            {ex.name}
                          </span>
                          {isCustom && (
                            <span className="text-[7px] font-press-start text-cyan-400 bg-cyan-950/60 border border-cyan-500/40 px-1 py-0.5 rounded">
                              CUSTOM
                            </span>
                          )}
                        </div>
                        <span className="text-[9px] font-mono text-emerald-400 font-bold transition block text-center">
                          {getBuildsDescription(ex)}
                        </span>
                      </button>

                      {isCustom && (
                        <button
                          type="button"
                          onClick={(e) => handleDeleteCustomEx(ex.name, e)}
                          className="absolute top-2 right-2 p-1 bg-[#0D0D0E]/80 hover:bg-red-950/80 border border-slate-800 hover:border-red-500 text-slate-400 hover:text-red-300 rounded-md transition cursor-pointer"
                          title="Delete Custom Exercise"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  );
                })}
                {filteredExercises.length === 0 && (
                  <div className="col-span-2 text-center py-10 text-slate-500 font-mono text-xs">
                    No exercises registered under this sub-category.
                  </div>
                )}
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

          {/* EXERCISE DEMONSTRATION IMAGE / ANIMATION DISPLAY CARD */}
          {(selectedExercise.images?.length || selectedExercise.image) && (
            <div className="bg-black border-2 border-slate-850 rounded-2xl p-3 flex flex-col items-center justify-center overflow-hidden shadow-inner relative max-w-sm mx-auto w-full">
              <div className="relative w-full max-h-48 aspect-video flex items-center justify-center">
                <img
                  src={
                    selectedExercise.images && selectedExercise.images.length > 0
                      ? selectedExercise.images[frameIndex % selectedExercise.images.length]
                      : selectedExercise.image
                  }
                  alt={selectedExercise.name}
                  className="max-h-48 w-auto object-contain rounded-lg shadow-lg"
                />
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

            // 2. Gather main muscle/cardio progress bars
            const buildsKeys = Object.keys(selectedExercise.builds || {});
            const muscleKeys = ["chestStrength", "backStrength", "coreStrength", "cardio"];
            const isCardioEx = selectedExercise.pillar === "cardio" || 
                               !!(selectedExercise.builds as any).cardio || 
                               !!(selectedExercise.builds as any).stamina || 
                               !!(selectedExercise.builds as any).speed;

            if (isCardioEx) {
              const cardioBar = renderProgressBar("cardio", false);
              if (cardioBar) progressBarsToRender.push(cardioBar);

              buildsKeys.forEach((key) => {
                if (key !== "cardio" && key !== "stamina" && key !== "speed" && muscleKeys.includes(key)) {
                  const value = (selectedExercise.builds as any)[key] || 0;
                  if (value > 0) {
                    const bar = renderProgressBar(key, false);
                    if (bar) progressBarsToRender.push(bar);
                  }
                }
              });
            } else {
              buildsKeys.forEach((key) => {
                const value = (selectedExercise.builds as any)[key] || 0;
                if (value > 0 && muscleKeys.includes(key)) {
                  const bar = renderProgressBar(key, false);
                  if (bar) progressBarsToRender.push(bar);
                }
              });
            }

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

      {/* 5. CREATE CUSTOM EXERCISE VIEW */}
      {currentView === "create-exercise" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-between border-b border-slate-850 pb-4">
            <button
              type="button"
              onClick={() => setCurrentView("categories")}
              style={{ minHeight: "44px" }}
              className="px-4 bg-[#161B22] border-2 border-slate-850 text-slate-300 hover:text-white rounded-xl text-xs font-mono font-bold flex items-center gap-2 cursor-pointer transition active:scale-95 shrink-0"
            >
              <ChevronLeft className="w-4 h-4 text-cyan-400" /> BACK
            </button>
            <div className="text-right">
              <span className="text-[10px] font-press-start text-slate-500 block uppercase">UTILITY</span>
              <span className="text-xs font-press-start text-cyan-300 mt-0.5 block uppercase tracking-wider">
                CREATE CUSTOM EXERCISE
              </span>
            </div>
          </div>

          <form onSubmit={handleSaveCustomExerciseSubmit} className="bg-[#161B22] border-2 border-slate-800 rounded-2xl p-5 space-y-6 shadow-2xl">
            <div>
              <h3 className="text-xs font-press-start text-cyan-300 uppercase tracking-wider flex items-center gap-2">
                ✨ DESIGN CUSTOM EXERCISE
              </h3>
              <p className="text-[9px] font-mono text-slate-400 mt-1 leading-relaxed">
                Add your custom exercise. Its performance stats will automatically feed your Stat Levels, Weekly Volume, and Daily Quests!
              </p>
            </div>

            {/* 1. EXERCISE NAME */}
            <div className="space-y-2">
              <label className="text-[9px] font-press-start text-slate-400 uppercase block">
                EXERCISE NAME *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Incline Cable Fly, Nordic Curl, Landmine Press..."
                value={customExName}
                onChange={(e) => setCustomExName(e.target.value)}
                className="w-full bg-[#0D0D0E] border-2 border-slate-800 focus:border-cyan-400 rounded-xl px-4 py-3 text-xs font-mono text-white placeholder-slate-600 focus:outline-none transition"
              />
            </div>

            {/* 2. PILLAR CATEGORY */}
            <div className="space-y-2">
              <label className="text-[9px] font-press-start text-slate-400 uppercase block">
                EQUIPMENT / PILLAR CATEGORY *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: "weights", label: "FREE WEIGHTS" },
                  { id: "machines", label: "MACHINES" },
                  { id: "bodyweight", label: "BODYWEIGHT" },
                  { id: "cardio", label: "CARDIO" }
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setCustomExPillar(p.id as ExercisePillar)}
                    className={`p-2.5 rounded-xl border text-[8.5px] font-press-start cursor-pointer transition uppercase ${
                      customExPillar === p.id
                        ? "bg-cyan-500/10 border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.2)]"
                        : "bg-[#0D0D0E] border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. TARGET MUSCLE FOCUS (INTERACTIVE ANATOMY MAP) */}
            <div className="space-y-2">
              <label className="text-[9px] font-press-start text-slate-400 uppercase block">
                TARGET MUSCLE FOCUS (TAP BODY TO PICK MULTIPLE) *
              </label>
              <BodyStatusMap
                interactive={true}
                selectedMuscles={customExMuscles}
                onToggleMuscle={(m) => {
                  setCustomExMuscles(prev =>
                    prev.includes(m)
                      ? (prev.length > 1 ? prev.filter(x => x !== m) : prev)
                      : [...prev, m]
                  );
                }}
              />
            </div>

            {/* 4. SET LOGGING TYPE */}
            <div className="space-y-2">
              <label className="text-[9px] font-press-start text-slate-400 uppercase block">
                LOGGING METRIC FORMAT *
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "A", label: "WEIGHT + REPS", desc: "e.g. 150 lbs x 10 reps" },
                  { id: "B", label: "REPS ONLY", desc: "e.g. 25 pushups/pullups" },
                  { id: "C", label: "TIME DURATION", desc: "e.g. 2 mins 30 secs plank" },
                  { id: "D", label: "DISTANCE + TIME", desc: "e.g. 3.0 miles in 24 mins" }
                ].map((ft) => (
                  <button
                    key={ft.id}
                    type="button"
                    onClick={() => setCustomExFormType(ft.id as any)}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition ${
                      customExFormType === ft.id
                        ? "bg-cyan-500/10 border-cyan-400"
                        : "bg-[#0D0D0E] border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <span className={`text-[8.5px] font-press-start block uppercase ${customExFormType === ft.id ? "text-cyan-300" : "text-white"}`}>
                      {ft.label}
                    </span>
                    <span className="text-[8px] font-mono text-slate-500 block mt-0.5">
                      {ft.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* 5. IMAGE / GIF UPLOAD OR URL */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <label className="text-[9px] font-press-start text-cyan-300 uppercase block">
                📸 EXERCISE DEMO IMAGE OR GIF (OPTIONAL)
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* File Upload Button */}
                <div className="space-y-1.5">
                  <span className="text-[8px] font-mono text-slate-400 uppercase block font-bold">
                    1. UPLOAD IMAGE FROM DEVICE
                  </span>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleImageFileUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-2.5 px-3 bg-[#0D0D0E] border border-slate-700 hover:border-cyan-400 rounded-xl text-[8.5px] font-press-start text-slate-300 hover:text-white flex items-center justify-center gap-2 cursor-pointer transition"
                  >
                    <Upload className="w-3 h-3 text-cyan-400" /> CHOOSE FILE...
                  </button>
                </div>

                {/* Web URL Input */}
                <div className="space-y-1.5">
                  <span className="text-[8px] font-mono text-slate-400 uppercase block font-bold">
                    2. OR PASTE IMAGE/GIF WEB LINK
                  </span>
                  <input
                    type="url"
                    placeholder="https://example.com/demo.gif"
                    value={customExImageUrl}
                    onChange={(e) => {
                      setCustomExImageUrl(e.target.value);
                      setCustomExImagePreview(e.target.value);
                    }}
                    className="w-full bg-[#0D0D0E] border border-slate-800 focus:border-cyan-400 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder-slate-600 focus:outline-none transition"
                  />
                </div>
              </div>

              {/* Preview Box */}
              {customExImagePreview && (
                <div className="pt-2 flex flex-col items-center space-y-2">
                  <span className="text-[7.5px] font-press-start text-cyan-400 uppercase">PREVIEW DEMO:</span>
                  <div className="relative w-32 h-32 bg-[#0D0D0E] border-2 border-cyan-400/60 rounded-xl overflow-hidden shadow-lg flex items-center justify-center">
                    <img
                      src={customExImagePreview}
                      alt="Exercise Preview"
                      className="w-full h-full object-contain"
                      onError={() => {
                        setCustomExImagePreview(null);
                        alert("Could not load image from that URL link.");
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setCustomExImagePreview(null);
                        setCustomExImageUrl("");
                      }}
                      className="absolute top-1 right-1 bg-red-950/80 border border-red-500 text-red-300 text-[8px] px-1.5 py-0.5 rounded cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* SAVE BUTTON */}
            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                style={{ minHeight: "44px" }}
                className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-press-start text-xs rounded-xl transition shadow-[0_0_15px_rgba(6,182,212,0.3)] cursor-pointer active:scale-95 font-bold uppercase tracking-wider"
              >
                ✨ SAVE CUSTOM EXERCISE & START LOGGING
              </button>
            </div>
          </form>
        </motion.div>
      )}

    </div>
  );
}
