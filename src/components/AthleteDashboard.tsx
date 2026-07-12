import React from "react";
import { AthleteProfile, FitnessLog } from "../types";
import {
  evaluateAthletePerformance,
  getMetricTier,
  formatLevel,
  calculateAllRecords,
  calculateSubCategoryLevels,
  calculateMuscleDistribution,
  EXERCISE_CONFIGS
} from "../utils/fitnessMath";
import { pixelMusclePaths } from "../data/pixelMusclePaths";
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
  Info,
  ChevronDown
} from "lucide-react";
import { motion } from "motion/react";
import MuscleVolumeVisualizer from "./MuscleVolumeVisualizer";
import BodyStatusMap from "./BodyStatusMap";

const YOUTUBE_CHANNEL_LINK = "https://youtube.com/channel/UCwr35GfgTWfafg9qt6RQkMQ";

function getContributingExercises(
  key: string,
  exerciseDetails: Record<string, { effectiveLevel: number; peakLevel: number }>
) {
  const list: { name: string; level: number; peak: number }[] = [];
  
  EXERCISE_CONFIGS.forEach(config => {
    const builds = config.builds as any;
    let contributes = false;
    
    // Check if it's a parent stat
    if (builds[key] > 0) {
      contributes = true;
    } 
    // Check if it's a subcategory
    else {
      const parentStat = ["biceps", "triceps", "shoulders", "traps"].includes(key) ? "armStrength" : "legStrength";
      const subsList = parentStat === "armStrength"
        ? ["biceps", "triceps", "shoulders", "traps"]
        : ["quads", "hamstrings", "glutes", "calves"];
        
      if (builds[parentStat] > 0) {
        const configSubs = config.subCategories || [];
        let isMatched = configSubs.includes(key);
        if (!isMatched && !configSubs.some(s => subsList.includes(s))) {
          isMatched = true;
        }
        if (isMatched) {
          contributes = true;
        }
      }
    }
    
    if (contributes) {
      const detail = exerciseDetails[config.name];
      const level = detail ? detail.effectiveLevel : 0;
      const peak = detail ? detail.peakLevel : 0;
      list.push({ name: config.name, level, peak });
    }
  });
  
  return list.sort((a, b) => b.level - a.level || b.peak - a.peak);
}

function getSubcategoryDetail(key: string, d: any) {
  switch (key) {
    case "chest":
      return {
        label: "Chest Strength",
        desc: "Pectoral muscle strength. Developed by pressing exercises like Bench Press and Chest Flyes.",
        icon: d.shield,
        textColor: "text-cyan-400"
      };
    case "back":
      return {
        label: "Back Strength",
        desc: "Lats, rhomboids, and lower back strength. Built via pulling exercises like Pull-Ups and Rows.",
        icon: d.trophy,
        textColor: "text-orange-400"
      };
    case "core":
      return {
        label: "Core Strength",
        desc: "Abdominal and obliques stability. Built via planks, sit-ups, and ab wheel rollouts.",
        icon: d.award,
        textColor: "text-amber-400"
      };
    case "biceps":
      return {
        label: "Biceps",
        desc: "Arm flexor muscles on the front of the upper arm. Built via curl variations.",
        icon: d.dumbbell,
        textColor: "text-pink-450"
      };
    case "triceps":
      return {
        label: "Triceps",
        desc: "Arm extensor muscles on the back of the upper arm. Built via pushdowns and dips.",
        icon: d.dumbbell,
        textColor: "text-rose-400"
      };
    case "shoulders":
      return {
        label: "Shoulders",
        desc: "Deltoid muscle group covering the shoulder joint. Built via presses and raises.",
        icon: d.dumbbell,
        textColor: "text-purple-400"
      };
    case "traps":
      return {
        label: "Traps",
        desc: "Trapezius muscles of the upper back and neck. Built via shrugs and upright rows.",
        icon: d.dumbbell,
        textColor: "text-violet-400"
      };
    case "glutes":
      return {
        label: "Glutes",
        desc: "Gluteus maximus/medius muscles of the hips/buttocks. Built via hip thrusts and squats.",
        icon: d.zap,
        textColor: "text-orange-400"
      };
    case "quads":
      return {
        label: "Quads",
        desc: "Quadriceps muscles on the front of the thigh. Built via squats and leg extensions.",
        icon: d.zap,
        textColor: "text-teal-400"
      };
    case "hamstrings":
      return {
        label: "Hamstrings",
        desc: "Hamstring muscles on the back of the thigh. Built via deadlifts and leg curls.",
        icon: d.zap,
        textColor: "text-blue-400"
      };
    case "calves":
      return {
        label: "Calves",
        desc: "Gastrocnemius and soleus muscles of the lower leg. Built via calf raises.",
        icon: d.zap,
        textColor: "text-indigo-400"
      };
    default:
      return {
        label: key.toUpperCase(),
        desc: "Training sector of the physique.",
        icon: d.activity,
        textColor: "text-slate-400"
      };
  }
}

const SparkleOverlay: React.FC<{ active: boolean; type: "silver" | "gold" | "steel" }> = ({ active, type }) => {
  const [sparkle, setSparkle] = React.useState<{ x: number; y: number; id: number } | null>(null);

  React.useEffect(() => {
    if (!active) return;
    let timeoutId: any;
    
    const spawn = () => {
      setSparkle({
        x: Math.random() * 90 + 5,
        y: Math.random() * 40 + 30, // center-ish vertical offset
        id: Math.random()
      });
      
      const delay = type === "silver" ? (2500 + Math.random() * 1500) : 
                    type === "gold" ? (1500 + Math.random() * 1000) : 
                    (800 + Math.random() * 600);
      timeoutId = setTimeout(spawn, delay);
    };
    
    timeoutId = setTimeout(spawn, Math.random() * 1000);
    
    return () => clearTimeout(timeoutId);
  }, [active, type]);

  if (!active || !sparkle) return null;

  let pathD = "M 5,0 L 6.2,3.8 L 10,5 L 6.2,6.2 L 5,10 L 3.8,6.2 L 0,5 L 3.8,3.8 Z";
  let color = "#FFF3C4";
  let scaleVal = "1.0";
  
  if (type === "silver") {
    pathD = "M 5,1 L 6.5,5 L 5,9 L 3.5,5 Z";
    color = "#E2E8F0";
    scaleVal = "0.8";
  } else if (type === "steel") {
    pathD = "M 5,0 L 6.5,3.5 L 10,5 L 6.5,6.5 L 5,10 L 3.5,6.5 L 0,5 L 3.5,3.5 Z";
    color = "#A5F3FC";
    scaleVal = "1.3";
  }

  return (
    <div 
      key={sparkle.id}
      className="absolute pointer-events-none z-10"
      style={{
        left: `${sparkle.x}%`,
        top: `${sparkle.y}%`,
        transform: `translate(-50%, -50%) scale(${scaleVal})`
      }}
    >
      <svg width="8" height="8" viewBox="0 0 10 10" className="block">
        <path d={pathD} fill={color}>
          <animateTransform
            attributeName="transform"
            type="scale"
            values="0; 1; 1; 0"
            keyTimes="0; 0.3; 0.7; 1"
            dur="0.6s"
            repeatCount="1"
          />
          <animateTransform
            attributeName="transform"
            type="rotate"
            values="0; 45; 90; 135"
            keyTimes="0; 0.3; 0.7; 1"
            dur="0.6s"
            repeatCount="1"
            additive="sum"
          />
          <animate
            attributeName="opacity"
            values="0; 1; 0.8; 0"
            keyTimes="0; 0.3; 0.7; 1"
            dur="0.6s"
            repeatCount="1"
          />
        </path>
      </svg>
    </div>
  );
};

function getPathGroupBoundingBox(pathId: string) {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  const paths = pixelMusclePaths.filter(p => p.id === pathId);
  paths.forEach(p => {
    const numbers = p.d.match(/-?\d+(\.\d+)?/g);
    if (numbers) {
      for (let i = 0; i < numbers.length; i += 2) {
        const x = parseFloat(numbers[i]);
        const y = parseFloat(numbers[i+1]);
        if (!isNaN(x)) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
        }
        if (!isNaN(y)) {
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }
  });

  if (minX === Infinity) {
    return { x: 0, y: 0, width: 0, height: 0 };
  }

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY
  };
}

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
  onProfileUpdate,
  onReset,
  onNavigateToLogs,
  onNavigateToExercises
}: AthleteDashboardProps) {

  const [activeSubTab, setActiveSubTab] = React.useState<"character" | "stats">("character");
  const [selectedStatDetail, setSelectedStatDetail] = React.useState<{
    key: string;
    label: string;
    level: number;
    desc: string;
    textColor: string;
    icon: React.ReactNode;
  } | null>(null);
  const [isAllRecordsOpen, setIsAllRecordsOpen] = React.useState(false);
  const [devHUDOverrides, setDevHUDOverrides] = React.useState<Record<string, number> | null>(null);
  const [sparkles, setSparkles] = React.useState<Array<{
    id: number;
    x: number;
    y: number;
    active: boolean;
    muscleGroup: string;
  }>>([
    { id: 1, x: 0, y: 0, active: false, muscleGroup: "" },
    { id: 2, x: 0, y: 0, active: false, muscleGroup: "" },
    { id: 3, x: 0, y: 0, active: false, muscleGroup: "" },
    { id: 4, x: 0, y: 0, active: false, muscleGroup: "" }
  ]);

  // States for Adjust Age, Weight, and Gender Modal
  const [isEditProfileOpen, setIsEditProfileOpen] = React.useState(false);
  const [editAge, setEditAge] = React.useState(profile.age);
  const [editWeight, setEditWeight] = React.useState(profile.bodyWeight);
  const [editGender, setEditGender] = React.useState(profile.gender || "male");

  const handleOpenEditProfile = () => {
    setEditAge(profile.age);
    setEditWeight(profile.bodyWeight);
    setEditGender(profile.gender || "male");
    setIsEditProfileOpen(true);
  };

  const handleEditProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onProfileUpdate) {
      onProfileUpdate({
        ...profile,
        age: editAge,
        bodyWeight: editWeight,
        gender: editGender
      });
    }
    setIsEditProfileOpen(false);
  };

  // Evaluate complete athletic details using our stateless progressive overload engine
  const performance = evaluateAthletePerformance(logs, profile.bodyWeight, profile.gender || "male");
  const weeklyVolume = performance.weeklyVolume;
  const weeklySubVolume = performance.weeklySubVolume;
  const recoveryRemaining = performance.recoveryRemaining;
  const exerciseDetails = performance.exerciseDetails;

  // Compute individual muscle group levels for arms and legs
  const subCategoryLevels = React.useMemo(() => {
    return calculateSubCategoryLevels(logs, profile.bodyWeight, performance.statLevels);
  }, [logs, profile.bodyWeight, performance.statLevels]);

  const getDisplayedLevel = (muscle: string, actualValue: number): number => {
    if (devHUDOverrides && devHUDOverrides[muscle] !== undefined) {
      return devHUDOverrides[muscle];
    }
    return actualValue;
  };

  React.useEffect(() => {
    if (activeSubTab !== "stats") return;

    let timeoutId: any;
    const goldMusclesList = [
      "chest", "back", "core", "biceps", "triceps", 
      "shoulders", "traps", "quads", "hamstrings", 
      "glutes", "calves"
    ];

    const tick = () => {
      const activeGoldMuscles = goldMusclesList.filter(m => {
        let lvl = 0;
        if (m === "chest") lvl = getDisplayedLevel("chest", performance.statLevels.chestStrength || 0);
        else if (m === "back") lvl = getDisplayedLevel("back", performance.statLevels.backStrength || 0);
        else if (m === "core") lvl = getDisplayedLevel("core", performance.statLevels.coreStrength || 0);
        else lvl = getDisplayedLevel(m, subCategoryLevels[m] || 0);
        return lvl > 70 && lvl <= 99;
      });

      if (activeGoldMuscles.length > 0) {
        const chosenMuscle = activeGoldMuscles[Math.floor(Math.random() * activeGoldMuscles.length)];
        const paths = pixelMusclePaths.filter(p => p.muscle === chosenMuscle);
        if (paths.length > 0) {
          const chosenPath = paths[Math.floor(Math.random() * paths.length)];
          const bbox = getPathGroupBoundingBox(chosenPath.id);
          
          if (bbox.width > 0 && bbox.height > 0) {
            const px = bbox.x + Math.random() * bbox.width;
            const py = bbox.y + Math.random() * bbox.height;

            setSparkles(prev => {
              const next = [...prev];
              const idx = next.findIndex(s => !s.active);
              const targetIdx = idx !== -1 ? idx : 0;
              next[targetIdx] = {
                id: targetIdx + 1,
                x: px,
                y: py,
                active: true,
                muscleGroup: chosenMuscle
              };

              setTimeout(() => {
                setSparkles(p => {
                  const n = [...p];
                  if (n[targetIdx]) {
                    n[targetIdx].active = false;
                  }
                  return n;
                });
              }, 600);

              return next;
            });
          }
        }
      }

      timeoutId = setTimeout(tick, 1500 + Math.random() * 1000);
    };

    timeoutId = setTimeout(tick, 1000);

    return () => clearTimeout(timeoutId);
  }, [activeSubTab, devHUDOverrides, performance.statLevels, subCategoryLevels]);

  const getDisplayedStatLevel = (statKey: string): number => {
    if (statKey === "chestStrength") {
      return getDisplayedLevel("chest", performance.statLevels.chestStrength || 0);
    }
    if (statKey === "backStrength") {
      return getDisplayedLevel("back", performance.statLevels.backStrength || 0);
    }
    if (statKey === "coreStrength") {
      return getDisplayedLevel("core", performance.statLevels.coreStrength || 0);
    }
    if (statKey === "armStrength") {
      return (
        getDisplayedLevel("biceps", subCategoryLevels.biceps || 0) +
        getDisplayedLevel("triceps", subCategoryLevels.triceps || 0) +
        getDisplayedLevel("shoulders", subCategoryLevels.shoulders || 0) +
        getDisplayedLevel("traps", subCategoryLevels.traps || 0)
      ) / 4;
    }
    if (statKey === "legStrength") {
      return (
        getDisplayedLevel("quads", subCategoryLevels.quads || 0) +
        getDisplayedLevel("hamstrings", subCategoryLevels.hamstrings || 0) +
        getDisplayedLevel("glutes", subCategoryLevels.glutes || 0) +
        getDisplayedLevel("calves", subCategoryLevels.calves || 0)
      ) / 4;
    }
    return performance.statLevels[statKey] || 0;
  };

  const getMuscleColor = (muscle: string): string => {
    let level = 0;
    switch (muscle) {
      case "chest":
        level = getDisplayedLevel("chest", performance.statLevels.chestStrength || 0);
        break;
      case "back":
        level = getDisplayedLevel("back", performance.statLevels.backStrength || 0);
        break;
      case "core":
        level = getDisplayedLevel("core", performance.statLevels.coreStrength || 0);
        break;
      case "biceps":
        level = getDisplayedLevel("biceps", subCategoryLevels.biceps || 0);
        break;
      case "triceps":
        level = getDisplayedLevel("triceps", subCategoryLevels.triceps || 0);
        break;
      case "shoulders":
        level = getDisplayedLevel("shoulders", subCategoryLevels.shoulders || 0);
        break;
      case "traps":
        level = getDisplayedLevel("traps", subCategoryLevels.traps || 0);
        break;
      case "glutes":
        level = getDisplayedLevel("glutes", subCategoryLevels.glutes || 0);
        break;
      case "quads":
        level = getDisplayedLevel("quads", subCategoryLevels.quads || 0);
        break;
      case "hamstrings":
        level = getDisplayedLevel("hamstrings", subCategoryLevels.hamstrings || 0);
        break;
      case "calves":
        level = getDisplayedLevel("calves", subCategoryLevels.calves || 0);
        break;
      case "forearms":
        level = getDisplayedStatLevel("armStrength");
        break;
      default:
        level = 0;
    }
    
    if (level < 1.0) return "#4B5563"; // Gray
    if (level <= 35) return "#a15c1e"; // Bronze
    if (level <= 70) return "#5a8fbb"; // Silver/Blue
    if (level <= 99) return "#d4af37"; // Gold
    return "url(#steel-glint)"; // Steel (100+)
  };

  const handleMuscleTap = (muscle: string) => {
    const iconDict = {
      shield: <Shield className="w-5 h-5 text-cyan-400" />,
      trophy: <Trophy className="w-5 h-5 text-orange-400" />,
      award: <Award className="w-5 h-5 text-amber-400" />,
      dumbbell: <Dumbbell className="w-5 h-5 text-pink-400" />,
      zap: <Zap className="w-5 h-5 text-orange-400" />,
      activity: <Activity className="w-5 h-5 text-slate-400" />
    };

    if (muscle === "chest" || muscle === "back" || muscle === "core") {
      const statKey = muscle === "chest" ? "chestStrength" : muscle === "back" ? "backStrength" : "coreStrength";
      const displayedLvl = getDisplayedStatLevel(statKey);
      const matchingStat = fitnessStatsList.find(s => s.key === statKey);
      if (matchingStat) {
        setSelectedStatDetail({
          key: matchingStat.key,
          label: matchingStat.label,
          level: Math.ceil(displayedLvl),
          desc: matchingStat.desc,
          textColor: matchingStat.textColor,
          icon: matchingStat.icon
        });
      }
    } else {
      const detail = getSubcategoryDetail(muscle, iconDict);
      let levelVal = 0;
      if (muscle === "forearms") {
        levelVal = getDisplayedLevel("forearms", performance.statLevels.armStrength || 0);
      } else {
        levelVal = getDisplayedLevel(muscle, subCategoryLevels[muscle] || 0);
      }
      setSelectedStatDetail({
        key: muscle,
        label: detail.label,
        level: Math.ceil(levelVal),
        desc: detail.desc,
        textColor: detail.textColor,
        icon: detail.icon
      });
    }
  };

  // Rotate achievements every 5 seconds
  const [activeRecordIndex, setActiveRecordIndex] = React.useState(0);
  const [activeAccomplishmentIndex, setActiveAccomplishmentIndex] = React.useState(0);

  // Compute all personal records dynamically from logs
  const records = React.useMemo(() => {
    return calculateAllRecords(logs);
  }, [logs]);

  // Compute all-time muscle focus distribution
  const muscleDistribution = React.useMemo(() => {
    return calculateMuscleDistribution(logs);
  }, [logs]);

  // Compute total distance traveled in miles
  const totalMiles = React.useMemo(() => {
    return logs.reduce((sum, log) => sum + (log.distance || 0), 0);
  }, [logs]);

  // Compute all-time totals and accomplishments
  const accomplishments = React.useMemo(() => {
    const list: { title: string; val: string; icon: string }[] = [];

    // 1. Total Distance Traveled
    if (totalMiles > 0) {
      list.push({
        title: "TRAVELER DISTANCE",
        val: `${totalMiles.toFixed(2)} TOTAL MILES`,
        icon: "🥾"
      });
    }

    // 2. Total Sets Completed
    if (logs.length > 0) {
      list.push({
        title: "WARRIOR TRAINING VOLUME",
        val: `${logs.length} TOTAL SETS LOGGED`,
        icon: "⚔️"
      });
    }

    // 3. Count of each exercise
    const counts: Record<string, number> = {};
    logs.forEach(log => {
      if (log.exerciseName) {
        counts[log.exerciseName] = (counts[log.exerciseName] || 0) + 1;
      }
    });

    // Sort exercises by most logs first
    const sortedExercises = Object.entries(counts)
      .sort((a, b) => b[1] - a[1]);

    sortedExercises.forEach(([name, count]) => {
      let icon = "💪";
      const nameLower = name.toLowerCase();
      if (nameLower.includes("run") || nameLower.includes("jog") || nameLower.includes("sprint")) icon = "🏃";
      else if (nameLower.includes("hike") || nameLower.includes("hiking")) icon = "🥾";
      else if (nameLower.includes("bench") || nameLower.includes("press")) icon = "🏋️";
      else if (nameLower.includes("push") || nameLower.includes("pushup") || nameLower.includes("push-up")) icon = "🔥";
      else if (nameLower.includes("pull") || nameLower.includes("chin")) icon = "🦇";
      else if (nameLower.includes("plank") || nameLower.includes("sit-up") || nameLower.includes("core")) icon = "🛡️";
      else if (nameLower.includes("squat") || nameLower.includes("leg")) icon = "🦵";
      else if (nameLower.includes("row")) icon = "🚣";

      list.push({
        title: `${name.toUpperCase()} TOTALS`,
        val: `${count} COMPLETED SET${count > 1 ? "S" : ""}`,
        icon
      });
    });

    return list;
  }, [logs, totalMiles]);

  // Set up accomplishments rotation timer
  React.useEffect(() => {
    setActiveAccomplishmentIndex(0);
  }, [accomplishments.length]);

  React.useEffect(() => {
    if (accomplishments.length <= 1) return;
    const interval = setInterval(() => {
      setActiveAccomplishmentIndex(prev => (prev + 1) % accomplishments.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [accomplishments]);

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

  const displayedAverageLevel = React.useMemo(() => {
    return (
      getDisplayedStatLevel("chestStrength") +
      getDisplayedStatLevel("backStrength") +
      getDisplayedStatLevel("armStrength") +
      getDisplayedStatLevel("legStrength") +
      getDisplayedStatLevel("coreStrength") +
      getDisplayedStatLevel("speed") +
      getDisplayedStatLevel("stamina")
    ) / 7;
  }, [devHUDOverrides, performance.statLevels, subCategoryLevels]);

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
      icon: <span className="text-xs select-none">🦵</span>
    },
    {
      key: "armStrength",
      label: "Arm Strength",
      desc: "Tendon tricep dips, bicep curls & strict barbell vertical press.",
      color: "from-pink-500 to-rose-500",
      textColor: "text-pink-400",
      bgBorder: "border-pink-500/20",
      bgLight: "bg-pink-500/5",
      icon: <span className="text-xs select-none">💪</span>
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
      icon: <Zap className="w-5 h-5 text-rose-400" />
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

  const detailedStatsList = [
    {
      key: "chestStrength",
      label: "Chest",
      color: "from-cyan-500 to-blue-500",
      textColor: "text-cyan-400",
      icon: "🎯"
    },
    {
      key: "backStrength",
      label: "Back",
      color: "from-orange-500 to-amber-500",
      textColor: "text-orange-400",
      icon: "🛡️"
    },
    {
      key: "coreStrength",
      label: "Core",
      color: "from-amber-500 to-yellow-500",
      textColor: "text-amber-400",
      icon: "🧘"
    },
    {
      key: "biceps",
      label: "Biceps",
      color: "from-pink-500 to-rose-500",
      textColor: "text-pink-400",
      icon: "💪"
    },
    {
      key: "triceps",
      label: "Triceps",
      color: "from-pink-500/80 to-rose-500/80",
      textColor: "text-pink-350",
      icon: "🥊"
    },
    {
      key: "shoulders",
      label: "Shoulders",
      color: "from-pink-500/60 to-rose-500/60",
      textColor: "text-pink-300",
      icon: "🏋️"
    },
    {
      key: "traps",
      label: "Traps",
      color: "from-pink-500/40 to-rose-500/40",
      textColor: "text-pink-200",
      icon: "🐂"
    },
    {
      key: "quads",
      label: "Quads",
      color: "from-emerald-500 to-teal-500",
      textColor: "text-emerald-400",
      icon: "🦵"
    },
    {
      key: "hamstrings",
      label: "Hamstrings",
      color: "from-emerald-500/80 to-teal-500/80",
      textColor: "text-emerald-350",
      icon: "🏃"
    },
    {
      key: "glutes",
      label: "Glutes",
      color: "from-emerald-500/60 to-teal-500/60",
      textColor: "text-emerald-300",
      icon: "🍑"
    },
    {
      key: "calves",
      label: "Calves",
      color: "from-emerald-500/40 to-teal-500/40",
      textColor: "text-emerald-200",
      icon: "🥾"
    },
    {
      key: "speed",
      label: "Speed",
      color: "from-rose-500 to-red-500",
      textColor: "text-rose-400",
      icon: "🔥"
    },
    {
      key: "stamina",
      label: "Stamina",
      color: "from-purple-500 to-violet-500",
      textColor: "text-purple-400",
      icon: "⏱️"
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
            onClick={() => setActiveSubTab("stats")}
            style={{ minHeight: "36px", minWidth: "120px" }}
            className={`px-4 py-1.5 rounded-full text-[10px] font-press-start tracking-wider transition-all duration-300 relative z-10 cursor-pointer ${
              activeSubTab === "stats"
                ? "text-cyan-400 font-extrabold"
                : "text-slate-500 hover:text-slate-350"
            }`}
          >
            STATS
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

              {/* Right side: Age and Weight inside a clickable button wrapper */}
              <button
                onClick={handleOpenEditProfile}
                title="Adjust weight and age"
                className="flex items-center gap-3 bg-[#0D0D0E]/85 hover:bg-[#12161A]/90 border border-slate-800 hover:border-cyan-500/40 p-2.5 rounded-xl shrink-0 cursor-pointer transition active:scale-95 text-left focus:outline-none focus:ring-1 focus:ring-cyan-500/30"
              >
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
              </button>
            </div>
          </div>

          {/* 🚀 DYNAMIC WEEKLY VOLUME TRACKER (BODY STATUS MAP) */}
          <div className="space-y-3">
            <BodyStatusMap weeklyVolume={weeklyVolume} weeklySubVolume={weeklySubVolume} />
            <MuscleVolumeVisualizer weeklyVolume={weeklyVolume} weeklySubVolume={weeklySubVolume} />
          </div>

          {/* TRAINING FOCUS DISTRIBUTION CHART */}
          <div className="bg-[#161B22] border-2 border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4">
            <div>
              <h3 className="text-[10px] font-press-start text-cyan-300 tracking-wider uppercase">
                ⚔️ TRAINING FOCUS DISTRIBUTION
              </h3>
              <p className="text-[8px] text-slate-400 font-mono mt-1 leading-relaxed">
                Percentage breakdown of all-time effort spent training each physical sector (20%+ = fully filled).
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {detailedStatsList.map((stat) => {
                const percentage = muscleDistribution[stat.key] || 0;
                const barFill = Math.min(100, (percentage / 20) * 100);
                const shortLabel = stat.label.toUpperCase();
                
                return (
                  <div key={stat.key} className="space-y-1.5">
                    <div className="flex justify-between items-center text-[7px] font-press-start leading-none">
                      <span className="text-slate-400 tracking-wide flex items-center gap-1">
                        <span className="text-[9px]">{stat.icon}</span>
                        <span className={stat.textColor}>{shortLabel}</span>
                      </span>
                      <span className="font-mono text-[9px] text-slate-350 font-extrabold">
                        {percentage.toFixed(1)}%
                      </span>
                    </div>

                    <div className="w-full bg-[#0D0D0E] border border-slate-850 h-3 rounded-full overflow-hidden relative">
                      {/* Premium animated bar */}
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${barFill}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className={`h-full rounded-full bg-gradient-to-r ${stat.color} shadow-[0_0_8px_rgba(6,182,212,0.1)]`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 🏆 HALL OF HEROIC SETS (ACCOMPLISHMENTS CAROUSEL) */}
          {accomplishments.length > 0 ? (
            <div className="space-y-3">
              <div className="bg-[#161B22] border-2 border-cyan-500/50 rounded-2xl p-5 shadow-[0_0_20px_rgba(6,182,212,0.15)] relative overflow-hidden h-[120px] flex flex-col justify-center animate-fade-in">
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-cyan-500/10 to-transparent rounded-full blur-xl pointer-events-none" />
                
                <div className="flex items-center gap-4">
                  <div className="text-3xl shrink-0 p-2.5 bg-[#0D0D0E] border border-slate-800 rounded-xl">
                    {accomplishments[activeAccomplishmentIndex]?.icon || "🏆"}
                  </div>
                  
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="inline-block w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping shrink-0" />
                      <span className="text-[8px] font-press-start text-cyan-400 tracking-widest block uppercase">
                        HEROIC ACCOMPLISHMENTS
                      </span>
                    </div>
                    <h3 className="text-[10px] font-press-start text-white truncate uppercase tracking-wider block mt-1">
                      {accomplishments[activeAccomplishmentIndex]?.title || "ACCOMPLISHMENT"}
                    </h3>
                    <p className="text-xs font-mono font-black text-emerald-400 block tracking-wide mt-1">
                      {accomplishments[activeAccomplishmentIndex]?.val || "0"}
                    </p>
                  </div>
                </div>
                
                {/* Pagination Dots at bottom center */}
                {accomplishments.length > 1 && (
                  <div className="absolute bottom-2.5 left-0 right-0 flex justify-center gap-1.5">
                    {accomplishments.map((_, i) => (
                      <div 
                        key={i} 
                        className={`h-1 rounded-full transition-all duration-305 ${
                          i === activeAccomplishmentIndex ? "w-4 bg-cyan-400" : "w-1.5 bg-slate-850"
                        }`} 
                        style={{ minWidth: i === activeAccomplishmentIndex ? "16px" : "6px" }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-[#161B22] border-2 border-dashed border-slate-800 rounded-2xl p-5 shadow-inner text-center">
              <h3 className="text-xs font-press-start text-slate-500 tracking-wider">
                🏆 HEROIC TOTALS SHIELD
              </h3>
              <p className="text-[10px] text-slate-400 font-mono mt-3 leading-relaxed">
                No exercises logged yet. Log exercises under the EXERCISE tab to build up your totals and unlock accomplishments here!
              </p>
            </div>
          )}

          {/* RETRO YOUTUBE SOCIAL UTILITY */}
          <div className="pt-4 flex justify-center">
            <a
              href={YOUTUBE_CHANNEL_LINK}
              target="_blank"
              rel="noopener noreferrer"
              style={{ minHeight: "44px" }}
              className="w-full text-red-400 hover:text-red-300 hover:border-red-500/50 border-2 border-red-500/30 bg-red-950/5 hover:bg-red-950/15 px-4 py-2.5 rounded-xl text-[9px] font-press-start tracking-wider transition flex items-center justify-center gap-2 cursor-pointer duration-150 active:scale-[0.98] uppercase shadow-sm text-center font-bold"
            >
              📺 VISIT THE GUILD YOUTUBE
            </a>
          </div>

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
          key="stats-view"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="space-y-6"
        >
          <style dangerouslySetInnerHTML={{ __html: `
            @keyframes shimmer-bar-sweep {
              0% {
                background-position: 200% 0;
              }
              100% {
                background-position: -200% 0;
              }
            }
            .shimmer-steel-bar {
              background: linear-gradient(115deg, #3E4A5A 32%, #C9D6E8 50%, #3E4A5A 68%) !important;
              background-size: 200% 100% !important;
              animation: shimmer-bar-sweep 2.8s linear infinite !important;
            }
            @keyframes twinkle-sparkle {
              0% {
                transform: scale(0) rotate(0deg);
                opacity: 0;
              }
              30% {
                transform: scale(1.2) rotate(45deg);
                opacity: 1;
              }
              70% {
                transform: scale(1) rotate(90deg);
                opacity: 0.8;
              }
              100% {
                transform: scale(0) rotate(135deg);
                opacity: 0;
              }
            }
            .sparkle-element {
              transform-origin: center;
              animation: twinkle-sparkle 0.6s ease-out forwards;
            }
            @keyframes holo-flicker {
              0%, 19.999%, 22%, 62.999%, 64%, 64.999%, 70%, 100% {
                opacity: 0.99;
              }
              20%, 21.999%, 63%, 63.999%, 65%, 69.999% {
                opacity: 0.94;
              }
            }
            .holo-panel {
              background-color: #0A1220 !important;
              border: 1px solid rgba(79, 195, 247, 0.35) !important;
              box-shadow: 0 0 20px rgba(79, 195, 247, 0.12), inset 0 0 15px rgba(79, 195, 247, 0.05) !important;
              position: relative;
              animation: holo-flicker 6s infinite;
            }
            .holo-panel::before {
              content: " ";
              display: block;
              position: absolute;
              top: 0; left: 0; bottom: 0; right: 0;
              background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.1) 50%);
              background-size: 100% 3px;
              z-index: 10;
              pointer-events: none;
              opacity: 0.3;
            }
            .holo-text {
              color: #C8E6F5 !important;
              text-shadow: 0 0 5px rgba(79, 195, 247, 0.75) !important;
            }
            .holo-glow-fill {
              background-color: #C8E6F5 !important;
              background-image: linear-gradient(to right, #4FC3F7, #C8E6F5) !important;
              box-shadow: 0 0 8px rgba(79, 195, 247, 0.85) !important;
            }
            .holo-btn {
              background: transparent !important;
              border: 1px solid rgba(79, 195, 247, 0.18) !important;
              transition: all 0.15s ease-in-out;
            }
            .holo-btn:hover {
              border-color: rgba(79, 195, 247, 0.5) !important;
              box-shadow: 0 0 10px rgba(79, 195, 247, 0.18) !important;
              background: rgba(79, 195, 247, 0.02) !important;
            }
            .holo-btn svg {
              color: #C8E6F5 !important;
              filter: drop-shadow(0 0 3px rgba(79, 195, 247, 0.7)) !important;
            }
            @keyframes slide-down {
              from {
                opacity: 0;
                transform: translateY(-5px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
            .animate-slide-down {
              animation: slide-down 0.2s ease-out forwards;
            }
          ` }} />

          {/* Stats Page Muscle Map HUD */}
          <div className="bg-[#161B22] border-2 border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="text-center">
              <span className="text-[8px] font-press-start text-cyan-400 tracking-widest block uppercase mb-1">
                PHYSIQUE LEVEL HUD
              </span>
              <p className="text-[8px] text-slate-400 font-mono leading-relaxed">
                Click any muscle region to view its contributing exercises and subcategory details.
              </p>
            </div>

            <div className="relative w-full max-w-[340px] aspect-[976/585] bg-black rounded-xl overflow-hidden border border-slate-900 shadow-inner mx-auto">
              <svg
                viewBox="0 0 976 585"
                className="w-full h-full select-none"
                xmlns="http://www.w3.org/2000/svg"
                shapeRendering="crispEdges"
              >
                <defs>
                  <linearGradient id="steel-glint" x1="0%" y1="0%" x2="100%" y2="50%">
                    <stop offset="0%" stopColor="#3E4A5A" />
                    <stop offset="42%" stopColor="#3E4A5A" />
                    <stop offset="50%" stopColor="#C9D6E8" stopOpacity="0.35" />
                    <stop offset="58%" stopColor="#3E4A5A" />
                    <stop offset="100%" stopColor="#3E4A5A" />
                    {activeSubTab === "stats" && (
                      <>
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
                      </>
                    )}
                  </linearGradient>

                  {["chest", "back", "core", "biceps", "triceps", "shoulders", "traps", "quads", "hamstrings", "glutes", "calves"].map(m => {
                    const paths = pixelMusclePaths.filter(p => p.muscle === m);
                    return (
                      <clipPath id={`clip-${m}`} key={`clip-${m}`}>
                        {paths.map((p, idx) => (
                          <path d={p.d} key={idx} />
                        ))}
                      </clipPath>
                    );
                  })}
                </defs>

                {/* Layer 1: Base image (contains outlines) */}
                <image
                  href="/muscle_map.png"
                  x="0"
                  y="0"
                  width="976"
                  height="585"
                  preserveAspectRatio="none"
                />

                {/* Layer 2: Color overlays for ALL muscles based on level */}
                {pixelMusclePaths.map((path, idx) => {
                  const color = getMuscleColor(path.muscle);
                  return (
                    <path
                      key={`${path.id}-${idx}-stats-hud`}
                      d={path.d}
                      fill={color}
                      className="cursor-pointer hover:opacity-85 transition duration-150"
                      onClick={() => handleMuscleTap(path.muscle)}
                    />
                  );
                })}

                {/* Layer 3: Gold Twinkle Sparkle overlays (contained inside clipPath) */}
                {sparkles.map(s => {
                  if (!s.active) return null;
                  return (
                    <g key={s.id} clipPath={`url(#clip-${s.muscleGroup})`} className="pointer-events-none">
                      <g transform={`translate(${s.x}, ${s.y})`}>
                        <path
                          d="M 0,-5 L 1.2,-1.2 L 5,0 L 1.2,1.2 L 0,5 L -1.2,1.2 L -5,0 L -1.2,-1.2 Z"
                          fill="#FFF3C4"
                        >
                          <animateTransform
                            attributeName="transform"
                            type="scale"
                            values="0; 1; 1; 0"
                            keyTimes="0; 0.3; 0.7; 1"
                            dur="0.6s"
                            repeatCount="1"
                          />
                          <animateTransform
                            attributeName="transform"
                            type="rotate"
                            values="0; 45; 90; 135"
                            keyTimes="0; 0.3; 0.7; 1"
                            dur="0.6s"
                            repeatCount="1"
                            additive="sum"
                          />
                          <animate
                            attributeName="opacity"
                            values="0; 1; 0.8; 0"
                            keyTimes="0; 0.3; 0.7; 1"
                            dur="0.6s"
                            repeatCount="1"
                          />
                        </path>
                      </g>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Color ramp legend */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-1.5 border-t border-slate-850 text-[7px] font-press-start">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-[#4B5563] border border-slate-800" />
                <span className="text-slate-450">UNRANKED (0)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-[#a15c1e] border border-slate-800" />
                <span className="text-amber-600">BRONZE (1-35)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-[#5a8fbb] border border-slate-800" />
                <span className="text-blue-400">SILVER (36-70)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-[#d4af37] border border-slate-800" />
                <span className="text-yellow-500">GOLD (71-99)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded border border-slate-850 shimmer-steel-bar" />
                <span className="text-slate-400">STEEL (100+)</span>
              </div>
            </div>
          </div>

          {/* THE CORE GAME STATS HUD LIST - SOLO LEVELING STATUS STYLE */}
          <div className="space-y-5 p-6 rounded-2xl bg-[#0A1220]">
            {(() => {
              const armStat = fitnessStatsList.find(s => s.key === "armStrength")!;
              const legStat = fitnessStatsList.find(s => s.key === "legStrength")!;
              const chestStat = fitnessStatsList.find(s => s.key === "chestStrength")!;
              const backStat = fitnessStatsList.find(s => s.key === "backStrength")!;
              const coreStat = fitnessStatsList.find(s => s.key === "coreStrength")!;
              const speedStat = fitnessStatsList.find(s => s.key === "speed")!;
              const staminaStat = fitnessStatsList.find(s => s.key === "stamina")!;

              const chestVal = getDisplayedStatLevel("chestStrength");
              const backVal = getDisplayedStatLevel("backStrength");
              const legVal = getDisplayedStatLevel("legStrength");
              const armVal = getDisplayedStatLevel("armStrength");
              const coreVal = getDisplayedStatLevel("coreStrength");
              const speedVal = getDisplayedStatLevel("speed");
              const staminaVal = getDisplayedStatLevel("stamina");

              const renderHoloRow = (icon: React.ReactNode, label: string, val: number, isSub = false) => {
                if (isSub) {
                  return (
                    <div className="flex justify-between items-center pl-6 border-l-2 border-[#4FC3F7]/15 ml-2 py-0.5">
                      <span className="text-[7.5px] font-press-start holo-text opacity-85">
                        {label}:
                      </span>
                      <span className="text-[8.5px] font-press-start holo-text font-black">
                        {Math.ceil(val)}
                      </span>
                    </div>
                  );
                }

                return (
                  <div className="flex items-center justify-between py-1.5">
                    <div className="flex items-center gap-2">
                      <div className="shrink-0 text-[#C8E6F5] w-4 h-4 flex items-center justify-center">
                        {icon}
                      </div>
                      <span className="text-[8px] font-press-start tracking-wider holo-text uppercase font-bold">
                        {label}:
                      </span>
                    </div>
                    <span className="text-[11.5px] font-press-start holo-text font-black">
                      {Math.ceil(val)}
                    </span>
                  </div>
                );
              };

              return (
                <div className="flex flex-col space-y-4">
                  {/* Centered Level Header */}
                  <div className="flex items-center justify-center py-4 border-b border-[#4FC3F7]/15 w-full gap-4">
                    <span className="text-[28px] font-press-start holo-text font-black select-none tracking-widest">
                      LEVEL
                    </span>
                    <span className="text-[28px] font-press-start holo-text font-black select-none tracking-tighter">
                      {Math.ceil(displayedAverageLevel)}
                    </span>
                  </div>

                  {/* 2-Column Symmetrical Stats Grid */}
                  <div className="flex flex-col space-y-2.5 pt-2">
                    {/* Row 1: CHEST vs BACK */}
                    <div className="grid grid-cols-2 gap-x-8">
                      {renderHoloRow(chestStat.icon, "CHEST", chestVal)}
                      {renderHoloRow(backStat.icon, "BACK", backVal)}
                    </div>

                    {/* Row 2: LEG vs ARM */}
                    <div className="grid grid-cols-2 gap-x-8 border-t border-[#4FC3F7]/10 pt-2.5">
                      {renderHoloRow(legStat.icon, "LEG", legVal)}
                      {renderHoloRow(armStat.icon, "ARM", armVal)}
                    </div>

                    {/* Row 3: Quads vs Biceps */}
                    <div className="grid grid-cols-2 gap-x-8">
                      {renderHoloRow(null, "QUADS", subCategoryLevels.quads, true)}
                      {renderHoloRow(null, "BICEPS", subCategoryLevels.biceps, true)}
                    </div>

                    {/* Row 4: Hamstrings vs Triceps */}
                    <div className="grid grid-cols-2 gap-x-8">
                      {renderHoloRow(null, "HAMSTRINGS", subCategoryLevels.hamstrings, true)}
                      {renderHoloRow(null, "TRICEPS", subCategoryLevels.triceps, true)}
                    </div>

                    {/* Row 5: Glutes vs Shoulders */}
                    <div className="grid grid-cols-2 gap-x-8">
                      {renderHoloRow(null, "GLUTES", subCategoryLevels.glutes, true)}
                      {renderHoloRow(null, "SHOULDERS", subCategoryLevels.shoulders, true)}
                    </div>

                    {/* Row 6: Calves vs Traps */}
                    <div className="grid grid-cols-2 gap-x-8">
                      {renderHoloRow(null, "CALVES", subCategoryLevels.calves, true)}
                      {renderHoloRow(null, "TRAPS", subCategoryLevels.traps, true)}
                    </div>

                    {/* Row 7: CORE vs SPEED */}
                    <div className="grid grid-cols-2 gap-x-8 border-t border-[#4FC3F7]/10 pt-2.5">
                      {renderHoloRow(coreStat.icon, "CORE", coreVal)}
                      {renderHoloRow(speedStat.icon, "SPEED", speedVal)}
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>

          {/* PERSONAL RECORD DYNAMIC CAROUSEL TICKER - PLACED JUST BELOW IT */}
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
        </motion.div>
      )}

      {/* 🔮 STAT RANK DETAIL MODAL OVERLAY */}
      {selectedStatDetail && (
        <div className="fixed inset-0 bg-[#090B0E]/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-[360px] bg-[#0D1117] border-2 border-cyan-500/50 rounded-2xl p-6 shadow-[0_0_30px_rgba(6,182,212,0.25)] relative overflow-y-auto max-h-[90vh] scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent flex flex-col items-center text-center gap-4 animate-fade-in">
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

              const showBreakdown = selectedStatDetail.key === "armStrength" || selectedStatDetail.key === "legStrength";
              const subs = selectedStatDetail.key === "armStrength"
                ? [
                    { key: "biceps", label: "BICEPS" },
                    { key: "triceps", label: "TRICEPS" },
                    { key: "shoulders", label: "SHOULDERS" },
                    { key: "traps", label: "TRAPS" }
                  ]
                : [
                    { key: "quads", label: "QUADS" },
                    { key: "hamstrings", label: "HAMSTRINGS" },
                    { key: "glutes", label: "GLUTES" },
                    { key: "calves", label: "CALVES" }
                  ];

              const contributingExercises = getContributingExercises(selectedStatDetail.key, exerciseDetails);

              return (
                <div className="w-full space-y-3.5">
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

                  {showBreakdown && (
                    <div className="bg-[#0D0D0E]/40 border border-slate-850 rounded-xl p-3.5 text-left space-y-3.5 shadow-inner">
                      <span className="text-[8px] font-press-start text-cyan-300 tracking-widest block uppercase">
                        MUSCLE SUB-SECTOR BREAKDOWN
                      </span>
                      
                      <div className="space-y-3.5">
                        {subs.map(sub => {
                          const subLevel = getDisplayedLevel(sub.key, subCategoryLevels[sub.key] || 0.00);
                          const subTier = getMetricTier(subLevel);
                          const progressPercent = Math.min(100, subLevel);
                          
                          return (
                            <div key={sub.key} className="space-y-1.5 animate-fade-in">
                              <div className="flex justify-between items-center text-[8px] font-press-start leading-none">
                                <span className="text-slate-400 tracking-wide">{sub.label}</span>
                                <span className={`${subLevel >= 100 ? "text-slate-400 font-extrabold" : subTier.color} font-black font-mono text-[9.5px]`}>
                                  {subLevel >= 100 ? "STEEL" : `LVL ${subLevel.toFixed(2)}`}
                                </span>
                              </div>
                              
                              {/* Progress Bar Track Wrapper */}
                              <div className="w-full bg-[#12161A] border border-slate-850 h-2 rounded-full overflow-hidden relative">
                                <div 
                                  className={`h-full rounded-full transition-all duration-500 ${
                                    subLevel >= 100 ? "" :
                                    subLevel > 70 && subLevel <= 99 ? "" :
                                    subLevel > 35 && subLevel <= 70 ? "" :
                                    selectedStatDetail.key === "armStrength"
                                      ? "bg-gradient-to-r from-pink-500 to-rose-500"
                                      : "bg-gradient-to-r from-emerald-500 to-teal-500"
                                  }`}
                                  style={{
                                    width: `${progressPercent}%`,
                                    backgroundColor: subLevel >= 100
                                      ? "#3E4A5A"
                                      : subLevel > 70 && subLevel <= 99
                                        ? "#d4af37"
                                        : subLevel > 35 && subLevel <= 70
                                          ? "#5a8fbb"
                                          : undefined
                                  }}
                                />
                                {subLevel > 70 && subLevel <= 99 && (
                                  <SparkleOverlay 
                                    active={activeSubTab === "stats"} 
                                    type="gold"
                                  />
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Contributing Exercises List */}
                  <div className="bg-[#0D0D0E]/40 border border-slate-850 rounded-xl p-3.5 text-left space-y-3 shadow-inner w-full">
                    <span className="text-[8px] font-press-start text-cyan-300 tracking-widest block uppercase">
                      CONTRIBUTING EXERCISES
                    </span>
                    {contributingExercises.length > 0 ? (
                      <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-800/80 scrollbar-track-transparent">
                        {contributingExercises.map((ex, idx) => (
                          <div key={idx} className="flex justify-between items-center bg-[#161B22]/50 border border-slate-800/85 p-2 rounded-lg text-[10px] font-mono">
                            <span className="text-slate-350 truncate max-w-[140px]" title={ex.name}>{ex.name}</span>
                            <div className="flex gap-2 shrink-0 text-[9px]">
                              <span className="text-slate-550 font-bold">PEAK: {Math.round(ex.peak)}</span>
                              <span className="text-cyan-450 font-black">EFF: {Math.round(ex.level)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-[9px] text-slate-550 font-mono italic">No training data logged for this sector.</p>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Action buttons */}
            <button
              onClick={() => setSelectedStatDetail(null)}
              style={{ minHeight: "40px" }}
              className="w-full bg-cyan-500 hover:bg-cyan-600 active:scale-[0.98] transition cursor-pointer text-black font-press-start text-[9px] tracking-wider py-2.5 rounded-xl font-bold shadow-md shadow-cyan-500/10 uppercase shrink-0"
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

      {/* 🛠️ ADJUST WEIGHT & AGE MODAL OVERLAY */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 bg-[#090B0E]/80 backdrop-blur-md z-55 flex items-center justify-center p-4">
          <div className="w-full max-w-[340px] bg-[#0D1117] border-2 border-cyan-500/50 rounded-2xl p-6 shadow-[0_0_25px_rgba(6,182,212,0.2)] relative overflow-hidden flex flex-col gap-4 animate-fade-in">
            {/* Accent decoration */}
            <div className="absolute top-0 right-0 w-20 h-20 bg-cyan-500/10 rounded-full blur-xl pointer-events-none" />
            
            <div className="text-center">
              <span className="text-[8px] font-press-start text-cyan-400 tracking-widest block uppercase mb-1">
                CALIBRATION
              </span>
              <h3 className="text-xs font-press-start text-white uppercase tracking-wider block">
                ADJUST STATS
              </h3>
            </div>

            <form onSubmit={handleEditProfileSubmit} className="space-y-4 font-mono text-[11px]">
              {/* Age Field */}
              <div className="space-y-1.5 text-left">
                <label className="text-[8px] font-press-start text-slate-400 block uppercase tracking-wider">
                  AGE (YEARS)
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max="120"
                  value={editAge}
                  onChange={(e) => setEditAge(Math.max(1, parseInt(e.target.value) || 0))}
                  className="w-full bg-[#12161A] border-2 border-slate-800 text-white font-bold text-sm px-3.5 py-2 rounded-xl outline-none focus:border-cyan-500 font-mono tracking-wide"
                />
              </div>

              {/* Weight Field */}
              <div className="space-y-1.5 text-left">
                <label className="text-[8px] font-press-start text-slate-400 block uppercase tracking-wider">
                  BODY WEIGHT (LBS)
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max="1000"
                  value={editWeight}
                  onChange={(e) => setEditWeight(Math.max(1, parseInt(e.target.value) || 0))}
                  className="w-full bg-[#12161A] border-2 border-slate-800 text-white font-bold text-sm px-3.5 py-2 rounded-xl outline-none focus:border-cyan-500 font-mono tracking-wide"
                />
              </div>

              {/* Gender Field */}
              <div className="space-y-1.5 text-left">
                <label className="text-[8px] font-press-start text-slate-400 block uppercase tracking-wider">
                  GENDER
                </label>
                <select
                  value={editGender}
                  onChange={(e) => setEditGender(e.target.value as "male" | "female")}
                  className="w-full bg-[#12161A] border-2 border-slate-800 text-white font-bold text-xs px-3.5 py-2 rounded-xl outline-none focus:border-cyan-500 font-mono tracking-wide cursor-pointer"
                >
                  <option value="male" className="bg-[#0D1117] text-white">MALE</option>
                  <option value="female" className="bg-[#0D1117] text-white">FEMALE</option>
                </select>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditProfileOpen(false)}
                  style={{ minHeight: "36px" }}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 active:scale-[0.98] transition cursor-pointer text-slate-300 font-press-start text-[8px] tracking-wider py-2 rounded-xl font-bold uppercase"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  style={{ minHeight: "36px" }}
                  className="flex-1 bg-cyan-500 hover:bg-cyan-600 active:scale-[0.98] transition cursor-pointer text-black font-press-start text-[8px] tracking-wider py-2 rounded-xl font-bold shadow-md shadow-cyan-500/10 uppercase"
                >
                  SAVE
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
