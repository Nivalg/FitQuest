import React from "react";
import { getAllExercises } from "../exercises";
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
import { getDailyQuests, getAchievements } from "../utils/quests";
import { EXERCISE_DATABASE } from "../exercises";

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

  const [activeSubTab, setActiveSubTab] = React.useState<"character" | "stats" | "quests">("character");
  const [hudViewSide, setHudViewSide] = React.useState<"front" | "back">("front");
  const [selectedHudMuscle, setSelectedHudMuscle] = React.useState<string>("chest");

  const dailyQuests = React.useMemo(() => getDailyQuests(logs), [logs]);
  const achievements = React.useMemo(() => getAchievements(logs, profile), [logs, profile]);
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

  const getMuscleColor = (muscleKey: string) => {
    if (muscleKey === selectedHudMuscle) {
      return "url(#steel-glint)";
    }
    return "#22D3EE";
  };

  const handleMuscleTap = (muscle: string) => {
    setSelectedHudMuscle(muscle);
  };

  const handleOpenStatModal = (muscle: string) => {
    const iconDict = {
      shield: <Shield className="w-5 h-5 text-cyan-400" />,
      trophy: <Trophy className="w-5 h-5 text-orange-400" />,
      award: <Award className="w-5 h-5 text-amber-400" />,
      dumbbell: <Dumbbell className="w-5 h-5 text-pink-400" />,
      zap: <Zap className="w-5 h-5 text-orange-400" />,
      activity: <Activity className="w-5 h-5 text-slate-400" />
    };

    if (muscle === "chest" || muscle === "back" || muscle === "core" || muscle === "speed") {
      const statKey = muscle === "chest" ? "chestStrength" : muscle === "back" ? "backStrength" : muscle === "core" ? "coreStrength" : "speed";
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

  const balanceDistribution = React.useMemo(() => {
    const dist = muscleDistribution || {};
    const chest = dist.chestStrength || 0;
    const back = dist.backStrength || 0;
    const arms = (dist.biceps || 0) + (dist.triceps || 0) + (dist.shoulders || 0) + (dist.traps || 0);
    const legs = (dist.quads || 0) + (dist.hamstrings || 0) + (dist.glutes || 0) + (dist.calves || 0);
    const core = dist.coreStrength || 0;
    const cardio = (dist.speed || 0) + (dist.stamina || 0) + (dist.cardio || 0);

    const total = chest + back + arms + legs + core + cardio;
    if (total === 0) {
      return { chest: 0, back: 0, arms: 0, legs: 0, core: 0, cardio: 0 };
    }
    // Normalize to make sure they sum to exactly 100%
    return {
      chest: parseFloat(((chest / total) * 100).toFixed(1)),
      back: parseFloat(((back / total) * 100).toFixed(1)),
      arms: parseFloat(((arms / total) * 100).toFixed(1)),
      legs: parseFloat(((legs / total) * 100).toFixed(1)),
      core: parseFloat(((core / total) * 100).toFixed(1)),
      cardio: parseFloat(((cardio / total) * 100).toFixed(1))
    };
  }, [muscleDistribution]);

  const aiCoachInsights = React.useMemo(() => {
    const list: { type: "warning" | "tip" | "success"; text: string }[] = [];
    if (logs.length === 0) {
      list.push({
        type: "tip",
        text: "Begin logging your workouts to receive training balance coaching and insights!"
      });
      return list;
    }

    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;

    // Define groups by exercise config builds
    const groupLastTrained: Record<string, number> = {
      chest: 0,
      back: 0,
      arms: 0,
      legs: 0,
      core: 0,
      cardio: 0
    };

    logs.forEach(log => {
      if (!log.exerciseName) return;
      let conf = EXERCISE_CONFIGS.find(c => c.name.toLowerCase() === log.exerciseName!.toLowerCase());
      if (!conf) {
        const dbEx = getAllExercises().find(c => c.name.toLowerCase() === log.exerciseName!.toLowerCase());
        if (dbEx) {
          conf = {
            name: dbEx.name,
            formType: dbEx.formType as any,
            baseline: 0,
            peak: 100,
            builds: dbEx.builds as any,
            subCategories: dbEx.subCategories
          };
        } else if (log.distance || log.minutes || log.floors || /run|jog|sprint|walk|bike|bicycle|cycling|stair|rope|elliptical|rowing|hike|cardio/i.test(log.exerciseName!)) {
          conf = {
            name: log.exerciseName!,
            formType: "D",
            baseline: 0,
            peak: 100,
            builds: { cardio: 100 }
          };
        }
      }
      if (!conf) return;

      const builds = conf.builds as any;
      const logTime = new Date(log.timestamp).getTime();

      if ((builds.chestStrength || 0) > 0) groupLastTrained.chest = Math.max(groupLastTrained.chest, logTime);
      if ((builds.backStrength || 0) > 0) groupLastTrained.back = Math.max(groupLastTrained.back, logTime);
      if ((builds.armStrength || 0) > 0) groupLastTrained.arms = Math.max(groupLastTrained.arms, logTime);
      if ((builds.legStrength || 0) > 0) groupLastTrained.legs = Math.max(groupLastTrained.legs, logTime);
      if ((builds.coreStrength || 0) > 0) groupLastTrained.core = Math.max(groupLastTrained.core, logTime);
      if ((builds.speed || 0) > 0 || (builds.stamina || 0) > 0 || (builds.cardio || 0) > 0) groupLastTrained.cardio = Math.max(groupLastTrained.cardio, logTime);
    });

    const labels: Record<string, string> = {
      chest: "Chest/Push",
      back: "Back/Pull",
      arms: "Arms & Shoulders",
      legs: "Lower Body (Legs)",
      core: "Core Stability",
      cardio: "Cardio & Endurance"
    };

    // 1. Neglected Zones Check
    Object.entries(groupLastTrained).forEach(([key, lastTime]) => {
      const name = labels[key];
      if (lastTime === 0) {
        list.push({
          type: "warning",
          text: `You have never logged a ${name} workout! Consider scheduling a session for balance.`
        });
      } else {
        const days = (now - lastTime) / oneDayMs;
        if (days > 8) {
          list.push({
            type: "warning",
            text: `It has been ${Math.floor(days)} days since your last ${name} workout. Don't neglect this muscle zone!`
          });
        }
      }
    });

    // 2. Hyper-focused Zone Check
    const dist = balanceDistribution;
    if (dist.chest > 35) {
      list.push({
        type: "tip",
        text: `Your Chest volume is high (${dist.chest}% of total volume). Balance it with Back/Pulling exercises to prevent shoulder issues.`
      });
    }
    if (dist.legs > 40) {
      list.push({
        type: "tip",
        text: `You are crushing leg days (${dist.legs}% of total volume)! Keep up the great lower-body foundation.`
      });
    }
    if (dist.cardio < 8) {
      list.push({
        type: "warning",
        text: `Cardio accounts for only ${dist.cardio}% of your workouts. Adding Treadmill Runs or Stairmaster sessions will increase your Stamina.`
      });
    }

    // 3. Specific Exercise Overuse Check (bench press focus)
    const exerciseCountLast14Days: Record<string, number> = {};
    let recentLogsCount = 0;
    logs.forEach(log => {
      const ageDays = (now - new Date(log.timestamp).getTime()) / oneDayMs;
      if (ageDays <= 14 && log.exerciseName) {
        exerciseCountLast14Days[log.exerciseName] = (exerciseCountLast14Days[log.exerciseName] || 0) + 1;
        recentLogsCount++;
      }
    });

    Object.entries(exerciseCountLast14Days).forEach(([exName, count]) => {
      if (recentLogsCount >= 5 && count / recentLogsCount > 0.45) {
        list.push({
          type: "tip",
          text: `Bench Press/workout overuse alert: "${exName}" represents ${Math.round((count / recentLogsCount) * 100)}% of your recent sets. Try variations (like incline dumbbell or push-ups) to vary load.`
        });
      }
    });

    // If balanced
    if (list.filter(i => i.type === "warning").length === 0) {
      list.push({
        type: "success",
        text: "Outstanding training balance! Your body split has no critical gaps or neglected zones."
      });
    }

    return list;
  }, [logs, balanceDistribution]);

  const groupedLogHistory = React.useMemo(() => {
    // 1. Sort logs chronologically (descending)
    const sorted = [...logs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // 2. Group by Date, then by Exercise Name
    const groups: { date: string; dateMs: number; exercises: Record<string, FitnessLog[]> }[] = [];

    sorted.forEach(log => {
      const dateObj = new Date(log.timestamp);
      const dateStr = dateObj.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
      
      let dateGroup = groups.find(g => g.date === dateStr);
      if (!dateGroup) {
        dateGroup = { date: dateStr, dateMs: dateObj.getTime(), exercises: {} };
        groups.push(dateGroup);
      }

      const exName = log.exerciseName || "General Workout";
      if (!dateGroup.exercises[exName]) {
        dateGroup.exercises[exName] = [];
      }
      dateGroup.exercises[exName].push(log);
    });

    // 3. Format into a simpler structure for rendering
    return groups.map(g => ({
      date: g.date,
      dateMs: g.dateMs,
      items: Object.entries(g.exercises).map(([exName, sets]) => {
        const exInfo = EXERCISE_DATABASE.find(e => e.name.toLowerCase() === exName.toLowerCase());
        return {
          exerciseName: exName,
          pillar: exInfo?.pillar || "general",
          sets: [...sets].reverse() // Sort sets chronologically (ascending for that day's progression)
        };
      })
    }));
  }, [logs]);

  const formatDateHeader = (dateStr: string) => {
    const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
    
    if (dateStr === today) return "TODAY";
    if (dateStr === yesterday) return "YESTERDAY";
    return dateStr.toUpperCase();
  };

  const statKeys = [
    "chestStrength",
    "backStrength",
    "armStrength",
    "legStrength",
    "coreStrength",
    "cardio"
  ] as const;

  // Calculate true multi-dimensional Level Index
  const totalLevels = statKeys.reduce((acc, key) => acc + (Number(performance.statLevels[key]) || 1.00), 0);
  const averageLevelFloat = totalLevels / 6;
  const averageLevelDecimal = parseFloat(averageLevelFloat.toFixed(2));
  const averageXP = Math.round((averageLevelFloat % 1) * 100);

  const displayedAverageLevel = React.useMemo(() => {
    return (
      getDisplayedStatLevel("chestStrength") +
      getDisplayedStatLevel("backStrength") +
      getDisplayedStatLevel("armStrength") +
      getDisplayedStatLevel("legStrength") +
      getDisplayedStatLevel("coreStrength") +
      getDisplayedStatLevel("cardio")
    ) / 6;
  }, [devHUDOverrides, performance.statLevels, subCategoryLevels]);

  // Define tier level text of overall athlete
  const overallTier = getMetricTier(averageLevelFloat);

  // 6 core strength stats with icons, labels, types and descriptions
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
      key: "cardio",
      label: "Cardio",
      desc: "Global cardiorespiratory endurance, running, cycling, & stamina loads.",
      color: "from-rose-500 to-red-500",
      textColor: "text-rose-400",
      bgBorder: "border-rose-500/20",
      bgLight: "bg-rose-500/5",
      icon: <Zap className="w-5 h-5 text-rose-400" />
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
        <div className="bg-[#161B22] border border-slate-800 p-1 rounded-full flex items-center relative shadow-lg shadow-cyan-950/10">
          {[
            { id: "character", label: "CHARACTER" },
            { id: "stats", label: "STATS" },
            { id: "quests", label: "QUESTS" }
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
                    layoutId="activeSubTabIndicator"
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

      {activeSubTab === "character" && (
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
      )}

      {activeSubTab === "stats" && (
        <motion.div 
          key="stats-view"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="space-y-6"
        >
          {/* A. TRAINING INSIGHTS & BALANCE COACH */}
          <div className="bg-[#161B22] border-2 border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
              <div>
                <span className="text-[9px] font-press-start text-cyan-400 tracking-wider block uppercase">
                  🤖 AI BALANCE COACH
                </span>
                <p className="text-[8px] text-slate-400 font-mono mt-1">
                  Actionable insights based on your recent training volume logs.
                </p>
              </div>
              <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
            </div>

            <div className="space-y-2.5">
              {aiCoachInsights.map((insight, idx) => {
                let borderStyle = "border-slate-850 bg-[#0D0D0E]";
                let icon = "💡";
                if (insight.type === "warning") {
                  borderStyle = "border-amber-500/30 bg-amber-955/5 text-amber-300";
                  icon = "⚠️";
                } else if (insight.type === "success") {
                  borderStyle = "border-emerald-500/30 bg-emerald-955/5 text-emerald-300";
                  icon = "✅";
                }
                return (
                  <div key={idx} className={`p-3 border rounded-xl flex items-start gap-2.5 text-[9px] font-mono leading-relaxed transition ${borderStyle}`}>
                    <span className="text-xs shrink-0 select-none">{icon}</span>
                    <span>{insight.text}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* B. TRAINING BALANCE CHARTS (VOLUME DISTRIBUTION) */}
          <div className="bg-[#161B22] border-2 border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <span className="text-[9px] font-press-start text-cyan-400 tracking-wider block uppercase">
                📊 TRAINING BALANCE METERS
              </span>
              <p className="text-[8px] text-slate-400 font-mono mt-1">
                Workout volume splits by muscle zone. Keep them balanced!
              </p>
            </div>

            <div className="space-y-4.5 pt-1">
              {[
                { key: "chest", label: "CHEST / PUSH", pct: balanceDistribution.chest, color: "from-cyan-500 to-blue-500", desc: "Pecs, push-ups, pressing volume" },
                { key: "back", label: "BACK / PULL", pct: balanceDistribution.back, color: "from-emerald-500 to-teal-500", desc: "Lats, rows, pull-ups, deadlifts" },
                { key: "arms", label: "ARMS & SHOULDERS", pct: balanceDistribution.arms, color: "from-purple-500 to-indigo-500", desc: "Biceps, triceps, shoulders, traps" },
                { key: "legs", label: "LOWER BODY / LEGS", pct: balanceDistribution.legs, color: "from-orange-500 to-amber-500", desc: "Quads, hamstrings, glutes, calves" },
                { key: "core", label: "CORE STABILITY", pct: balanceDistribution.core, color: "from-pink-500 to-rose-500", desc: "Abs, obliques, stabilizer sets" },
                { key: "cardio", label: "CARDIO & STAMINA", pct: balanceDistribution.cardio, color: "from-red-500 to-orange-500", desc: "Runs, treadmill jog, stairmaster, speed" }
              ].map((group) => (
                <div key={group.key} className="space-y-1.5">
                  <div className="flex justify-between items-center text-[8.5px] font-press-start">
                    <span className="text-slate-200">{group.label}</span>
                    <span className="text-cyan-400">{group.pct}%</span>
                  </div>
                  {/* Custom Progress Bar */}
                  <div className="w-full bg-[#0D0D0E] border border-slate-800 rounded-full h-3 overflow-hidden p-0.5">
                    <div
                      className={`bg-gradient-to-r ${group.color} h-full rounded-full transition-all duration-500 ease-out`}
                      style={{ width: `${group.pct}%` }}
                    />
                  </div>
                  <span className="text-[7.5px] font-mono text-slate-500 block uppercase">
                    {group.desc}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* C. CHRONOLOGICAL WORKOUT HISTORY FEED */}
          <div className="bg-[#161B22] border-2 border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
              <div>
                <span className="text-[9px] font-press-start text-cyan-400 tracking-wider block uppercase">
                  📜 WORKOUT HISTORY LOG
                </span>
                <p className="text-[8px] text-slate-400 font-mono mt-1">
                  Chronological history of completed sets and exercises.
                </p>
              </div>
              <History className="w-4 h-4 text-cyan-400" />
            </div>

            <div className="space-y-5 pt-1 max-h-[600px] overflow-y-auto pr-1 scrollbar-thin">
              {groupedLogHistory.map((group, groupIdx) => (
                <div key={groupIdx} className="space-y-3">
                  {/* Date Header */}
                  <div className="flex items-center gap-2 border-b border-slate-850 pb-1">
                    <span className="text-[8.5px] font-press-start text-slate-400 tracking-wider font-bold">
                      {formatDateHeader(group.date)}
                    </span>
                    <div className="flex-1 h-[1px] bg-slate-850" />
                  </div>

                  {/* Exercises on that Day */}
                  <div className="space-y-2.5">
                    {group.items.map((item, itemIdx) => (
                      <div key={itemIdx} className="bg-[#0D0D0E] border border-slate-850 rounded-xl p-3.5 space-y-2.5">
                        {/* Exercise title & category tag */}
                        <div className="flex items-center justify-between border-b border-slate-900 pb-1.5 gap-2">
                          <span className="text-[9px] font-press-start text-white tracking-wide uppercase truncate">
                            {item.exerciseName}
                          </span>
                          <span className="text-[7px] font-press-start text-cyan-400 border border-cyan-500/20 px-1.5 py-0.5 rounded-md uppercase shrink-0">
                            {item.pillar}
                          </span>
                        </div>

                        {/* Sets listed */}
                        <div className="space-y-1.5">
                          {item.sets.map((set, setIdx) => {
                            const reps = set.reps || 0;
                            const weight = set.weight || 0;
                            const distance = set.distance || 0;
                            const mins = set.minutes || 0;
                            const secs = set.seconds || 0;
                            const floors = set.floors || 0;

                            let detailStr = "";
                            if (weight > 0 || reps > 0) {
                              detailStr = `${weight} LBS x ${reps} REPS`;
                            } else if (distance > 0) {
                              detailStr = `${distance.toFixed(2)} MILES (${mins}m ${secs}s)`;
                            } else if (floors > 0) {
                              detailStr = `${floors} FLOORS (${mins}m ${secs}s)`;
                            } else if (mins > 0 || secs > 0) {
                              detailStr = `${mins}m ${secs}s`;
                            } else if (set.newValue) {
                              detailStr = set.newValue;
                            }

                            const xpGained = set.xpAwarded || 10;

                            return (
                              <div key={setIdx} className="flex justify-between items-center text-[9px] font-mono">
                                <div className="flex items-center gap-2">
                                  <span className="text-slate-500 uppercase">SET {setIdx + 1}:</span>
                                  <span className="text-slate-200 font-bold">{detailStr}</span>
                                </div>
                                <span className="text-emerald-400 font-bold shrink-0">+{xpGained} XP</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {groupedLogHistory.length === 0 && (
                <div className="text-center py-10 text-slate-500 font-mono text-[9px] uppercase border border-dashed border-slate-800 rounded-2xl">
                  No logged workouts found.
                  <br />
                  Log some exercises on the EXERCISE tab to fill your history feed!
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* 3. QUESTS & ACHIEVEMENTS VIEW */}
      {activeSubTab === "quests" && (
        <motion.div
          key="quests-view"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="space-y-6"
        >
          {/* 1. SOLO LEVELING SYSTEM DAILY QUEST HEADER */}
          <div className="bg-[#161B22] border-2 border-cyan-500/40 rounded-2xl p-5 shadow-2xl space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-cyan-400 rounded-full animate-ping" />
                <span className="text-[10px] font-press-start text-cyan-300 uppercase tracking-widest">
                  DAILY SYSTEM QUESTS
                </span>
              </div>
              <span className="text-[8px] font-mono text-slate-400 uppercase">
                RESETS IN 24H
              </span>
            </div>

            <div className="space-y-3">
              {dailyQuests.map((quest) => {
                const pct = Math.min(100, Math.round((quest.current / quest.target) * 100));
                return (
                  <div
                    key={quest.id}
                    className={`p-3.5 border-2 rounded-xl space-y-2 transition ${
                      quest.completed
                        ? "bg-cyan-950/20 border-cyan-400/60 shadow-[0_0_12px_rgba(6,182,212,0.15)]"
                        : "bg-[#0D0D0E] border-slate-850"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-press-start text-white tracking-wide block">
                        {quest.title}
                      </span>
                      {quest.completed ? (
                        <span className="px-2 py-0.5 bg-cyan-400 text-slate-950 text-[8px] font-press-start rounded font-black tracking-wider">
                          CLEARED
                        </span>
                      ) : (
                        <span className="text-[9px] font-mono text-cyan-400 font-bold">
                          +{quest.rewardXP} XP
                        </span>
                      )}
                    </div>

                    <p className="text-[9px] font-mono text-slate-400">
                      {quest.description}
                    </p>

                    <div className="space-y-1">
                      <div className="flex justify-between text-[8px] font-mono text-slate-400">
                        <span>PROGRESS</span>
                        <span>{quest.current} / {quest.target} {quest.unit} ({pct}%)</span>
                      </div>
                      <div className="w-full bg-[#12161A] h-2 rounded-full overflow-hidden border border-slate-800">
                        <div
                          className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. CUMULATIVE LIFETIME ACHIEVEMENTS DOSSIER */}
          <div className="bg-[#161B22] border-2 border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
              <span className="text-[10px] font-press-start text-cyan-400 tracking-wider block uppercase">
                🏆 LIFETIME ACHIEVEMENTS
              </span>
              <span className="text-[8px] font-mono text-slate-400 uppercase">
                {achievements.filter(a => a.unlocked).length} / {achievements.length} UNLOCKED
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {achievements.map((ach) => {
                const pct = Math.min(100, Math.round((ach.current / ach.target) * 100));
                return (
                  <div
                    key={ach.id}
                    className={`p-3.5 border-2 rounded-xl flex items-start gap-3 transition ${
                      ach.unlocked
                        ? "bg-cyan-950/15 border-cyan-400/50 shadow-[0_0_15px_rgba(6,182,212,0.12)]"
                        : "bg-[#0D0D0E] border-slate-850 opacity-80"
                    }`}
                  >
                    <div className="p-2.5 bg-[#12161A] border border-slate-800 rounded-xl text-xl shrink-0">
                      {ach.icon}
                    </div>

                    <div className="flex-1 space-y-1.5 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[9px] font-press-start text-white tracking-wide truncate">
                          {ach.title}
                        </span>
                        {ach.unlocked && (
                          <span className="px-2 py-0.5 bg-emerald-500/20 border border-emerald-400 text-emerald-300 text-[7.5px] font-press-start rounded shrink-0">
                            UNLOCKED
                          </span>
                        )}
                      </div>

                      <p className="text-[8.5px] font-mono text-slate-400 leading-normal">
                        {ach.description}
                      </p>

                      <div className="space-y-1 pt-1">
                        <div className="flex justify-between text-[8px] font-mono text-slate-400">
                          <span>MILESTONE</span>
                          <span>{ach.current} / {ach.target} {ach.unit}</span>
                        </div>
                        <div className="w-full bg-[#12161A] h-1.5 rounded-full overflow-hidden border border-slate-800">
                          <div
                            className={`h-full transition-all duration-500 ${
                              ach.unlocked ? "bg-cyan-400" : "bg-slate-600"
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
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
