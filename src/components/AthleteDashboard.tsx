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
import {
  QUEST_CATALOG,
  MAX_ACTIVE_QUESTS,
  QuestCategory,
  QuestTierKey,
  ActiveQuestInstance,
  CompletedQuestRecord,
  QuestQuickLogPreset,
  getActiveQuests,
  saveActiveQuests,
  getCompletedQuests,
  saveCompletedQuests,
  evaluateActiveQuests,
  toLocalDateKey,
  getAchievements
} from "../utils/quests";
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
  onLogWorkout?: (params: {
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
  onReset: () => void;
  onNavigateToLogs: () => void;
  onNavigateToExercises: () => void;
}

export default function AthleteDashboard({
  profile,
  logs,
  onProfileUpdate,
  onLogWorkout,
  onReset,
  onNavigateToLogs,
  onNavigateToExercises
}: AthleteDashboardProps) {

  const [activeSubTab, setActiveSubTab] = React.useState<"character" | "stats" | "quests">("character");
  const [hudViewSide, setHudViewSide] = React.useState<"front" | "back">("front");
  const [selectedHudMuscle, setSelectedHudMuscle] = React.useState<string>("chest");
  const [selectedGraphExerciseByMuscle, setSelectedGraphExerciseByMuscle] = React.useState<Record<string, string>>({});

  // Quest Board state
  const [activeQuests, setActiveQuests] = React.useState<ActiveQuestInstance[]>(() => getActiveQuests());
  const [completedQuests, setCompletedQuests] = React.useState<CompletedQuestRecord[]>(() => getCompletedQuests());
  const [selectedQuestCategory, setSelectedQuestCategory] = React.useState<QuestCategory>("milestone");
  const [selectedTierByQuest, setSelectedTierByQuest] = React.useState<Record<string, QuestTierKey>>({});
  const [selectedVariantByQuest, setSelectedVariantByQuest] = React.useState<Record<string, string>>({});
  const [questFeedback, setQuestFeedback] = React.useState<string | null>(null);

  const showQuestFeedback = (msg: string) => {
    setQuestFeedback(msg);
    setTimeout(() => {
      setQuestFeedback(prev => (prev === msg ? null : prev));
    }, 3500);
  };

  const evaluatedQuests = React.useMemo(
    () => evaluateActiveQuests(activeQuests, logs),
    [activeQuests, logs]
  );

  const unlockedTitles = React.useMemo(() => {
    const fromProfile = profile.unlockedTitles || [];
    const fromCompleted = completedQuests.map(c => c.rewardTitle).filter(Boolean);
    return Array.from(new Set([...fromProfile, ...fromCompleted]));
  }, [profile.unlockedTitles, completedQuests]);

  const handleAcceptQuest = (questId: string) => {
    if (activeQuests.length >= MAX_ACTIVE_QUESTS) {
      showQuestFeedback(`Quest log full! Complete or abandon an active quest (max ${MAX_ACTIVE_QUESTS}).`);
      return;
    }
    if (activeQuests.some(q => q.questId === questId)) {
      showQuestFeedback("You already have this quest active!");
      return;
    }
    const template = QUEST_CATALOG.find(q => q.id === questId);
    if (!template) return;

    const tier: QuestTierKey = selectedTierByQuest[questId] || "apprentice";
    const variantId = selectedVariantByQuest[questId] || template.variants?.[0]?.id;
    const tierConfig = template.getTiers(variantId)[tier];

    const now = new Date();
    const expires = new Date(now.getTime() + tierConfig.durationDays * 24 * 60 * 60 * 1000);

    const newInstance: ActiveQuestInstance = {
      instanceId: `${questId}_${Date.now()}`,
      questId,
      tier,
      variantId,
      acceptedAt: now.toISOString(),
      expiresAt: expires.toISOString(),
      restPotionsRemaining: tierConfig.restPotions,
      shieldedDates: [],
      manualProgress: {},
      manualDailyProgress: {}
    };

    const next = [...activeQuests, newInstance];
    setActiveQuests(next);
    saveActiveQuests(next);
    showQuestFeedback(`Accepted Quest: ${template.title} (${tierConfig.rankLabel})!`);
  };

  const handleAbandonQuest = (instanceId: string) => {
    const next = activeQuests.filter(q => q.instanceId !== instanceId);
    setActiveQuests(next);
    saveActiveQuests(next);
    showQuestFeedback("Quest abandoned. Slot freed.");
  };

  const handleUseRestPotion = (instanceId: string) => {
    const todayKey = toLocalDateKey(Date.now());
    const next = activeQuests.map(q => {
      if (q.instanceId !== instanceId) return q;
      if (q.restPotionsRemaining <= 0) return q;
      if (q.shieldedDates.includes(todayKey)) return q;
      return {
        ...q,
        restPotionsRemaining: q.restPotionsRemaining - 1,
        shieldedDates: [...q.shieldedDates, todayKey]
      };
    });
    setActiveQuests(next);
    saveActiveQuests(next);
    showQuestFeedback("🧪 Rest Potion consumed! Today's streak is shielded.");
  };

  const handleQuickLogObjective = (
    instanceId: string,
    objectiveId: string,
    isStreakQuest: boolean,
    preset: QuestQuickLogPreset
  ) => {
    if (onLogWorkout) {
      onLogWorkout({
        exerciseName: preset.exerciseName,
        categoryName: preset.categoryName,
        weight: preset.weight,
        reps: preset.reps,
        minutes: preset.minutes,
        seconds: preset.seconds,
        distance: preset.distance,
        floors: preset.floors,
        notes: "Logged via Quest Tracker"
      });
    } else {
      // Fallback if onLogWorkout is not provided: record in manualProgress
      const todayKey = toLocalDateKey(Date.now());
      const next = activeQuests.map(q => {
        if (q.instanceId !== instanceId) return q;
        if (isStreakQuest) {
          const dayMap = q.manualDailyProgress?.[todayKey] || {};
          return {
            ...q,
            manualDailyProgress: {
              ...(q.manualDailyProgress || {}),
              [todayKey]: {
                ...dayMap,
                [objectiveId]: (dayMap[objectiveId] || 0) + preset.amount
              }
            }
          };
        }
        return {
          ...q,
          manualProgress: {
            ...(q.manualProgress || {}),
            [objectiveId]: (q.manualProgress?.[objectiveId] || 0) + preset.amount
          }
        };
      });
      setActiveQuests(next);
      saveActiveQuests(next);
    }
    showQuestFeedback(`Logged ${preset.buttonLabel} (${preset.exerciseName})!`);
  };

  const handleClaimQuestReward = (eq: ReturnType<typeof evaluateActiveQuests>[number]) => {
    if (!eq.isReadyToClaim) return;

    const record: CompletedQuestRecord = {
      instanceId: eq.instance.instanceId,
      questId: eq.template.id,
      title: eq.template.title,
      tier: eq.instance.tier,
      rankLabel: eq.tierConfig.rankLabel,
      rewardXP: eq.tierConfig.rewardXP,
      rewardTitle: eq.tierConfig.rewardTitle,
      completedAt: new Date().toISOString()
    };

    const nextCompleted = [record, ...completedQuests];
    setCompletedQuests(nextCompleted);
    saveCompletedQuests(nextCompleted);

    const nextActive = activeQuests.filter(q => q.instanceId !== eq.instance.instanceId);
    setActiveQuests(nextActive);
    saveActiveQuests(nextActive);

    if (onProfileUpdate) {
      const nextTitles = Array.from(new Set([...(profile.unlockedTitles || []), eq.tierConfig.rewardTitle]));
      onProfileUpdate({
        ...profile,
        questXP: (profile.questXP || 0) + eq.tierConfig.rewardXP,
        unlockedTitles: nextTitles,
        equippedTitle: profile.equippedTitle || eq.tierConfig.rewardTitle
      });
    }

    showQuestFeedback(
      `🏆 QUEST CLEARED! +${eq.tierConfig.rewardXP} XP & Unlocked Title: "${eq.tierConfig.rewardTitle}"!`
    );
  };

  const handleEquipTitle = (title: string) => {
    if (!onProfileUpdate) return;
    const nextEquipped = profile.equippedTitle === title ? undefined : title;
    onProfileUpdate({
      ...profile,
      equippedTitle: nextEquipped
    });
    showQuestFeedback(nextEquipped ? `Equipped Title: "${nextEquipped}"` : "Title unequipped.");
  };

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
  const monthlyVolume = performance.monthlyVolume;
  const monthlySubVolume = performance.monthlySubVolume;
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

  const handleOpenStatModal = (muscle: string, overrideLevel?: number) => {
    const iconDict = {
      shield: <Shield className="w-5 h-5 text-cyan-400" />,
      trophy: <Trophy className="w-5 h-5 text-orange-400" />,
      award: <Award className="w-5 h-5 text-amber-400" />,
      dumbbell: <Dumbbell className="w-5 h-5 text-pink-400" />,
      zap: <Zap className="w-5 h-5 text-orange-400" />,
      activity: <Activity className="w-5 h-5 text-slate-400" />
    };

    if (muscle === "chest" || muscle === "back" || muscle === "core" || muscle === "speed" || muscle === "cardio") {
      const statKey = muscle === "chest" ? "chestStrength" : muscle === "back" ? "backStrength" : muscle === "core" ? "coreStrength" : "cardio";
      const displayedLvl = overrideLevel ?? getDisplayedStatLevel(statKey);
      const matchingStat = fitnessStatsList.find(s => s.key === statKey);
      if (matchingStat) {
        setSelectedStatDetail({
          key: matchingStat.key,
          label: matchingStat.label,
          level: Math.max(1, Math.ceil(displayedLvl)),
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
        level: Math.max(1, Math.ceil(overrideLevel ?? levelVal)),
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

  const daysSinceLastTrained = React.useMemo(() => {
    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;

    const groupLastTrained: Record<string, number> = {
      chest: 0,
      back: 0,
      biceps: 0,
      triceps: 0,
      shoulders: 0,
      traps: 0,
      quads: 0,
      hamstrings: 0,
      glutes: 0,
      calves: 0,
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
            pillar: dbEx.pillar,
            formType: dbEx.formType as any,
            baseline: 0,
            peak: 100,
            muscles: dbEx.muscles || {},
            builds: dbEx.builds as any,
            subCategories: dbEx.subCategories
          };
        } else if (log.categoryName?.toLowerCase() === "cardio" || log.distance || log.minutes || log.floors || /run|jog|sprint|walk|bike|bicycle|cycling|stair|rope|elliptical|rowing|hike|cardio/i.test(log.exerciseName!)) {
          conf = {
            name: log.exerciseName!,
            pillar: "cardio",
            formType: "D",
            baseline: 0,
            peak: 100,
            muscles: {},
            builds: { cardio: 100 }
          };
        }
      }
      if (!conf) return;

      const m = conf.muscles || {};
      const builds = conf.builds as any;
      const subs = conf.subCategories || [];
      const logTime = new Date(log.timestamp).getTime();

      if ((m.chest || 0) > 0 || (builds.chestStrength || 0) > 0) groupLastTrained.chest = Math.max(groupLastTrained.chest, logTime);
      if ((m.back || 0) > 0 || (builds.backStrength || 0) > 0) groupLastTrained.back = Math.max(groupLastTrained.back, logTime);
      if ((m.biceps || 0) > 0 || subs.includes("biceps")) groupLastTrained.biceps = Math.max(groupLastTrained.biceps, logTime);
      if ((m.triceps || 0) > 0 || subs.includes("triceps")) groupLastTrained.triceps = Math.max(groupLastTrained.triceps, logTime);
      if ((m.shoulders || 0) > 0 || subs.includes("shoulders")) groupLastTrained.shoulders = Math.max(groupLastTrained.shoulders, logTime);
      if ((m.traps || 0) > 0 || subs.includes("traps")) groupLastTrained.traps = Math.max(groupLastTrained.traps, logTime);
      if ((m.quads || 0) > 0 || subs.includes("quads")) groupLastTrained.quads = Math.max(groupLastTrained.quads, logTime);
      if ((m.hamstrings || 0) > 0 || subs.includes("hamstrings")) groupLastTrained.hamstrings = Math.max(groupLastTrained.hamstrings, logTime);
      if ((m.glutes || 0) > 0 || subs.includes("glutes")) groupLastTrained.glutes = Math.max(groupLastTrained.glutes, logTime);
      if ((m.calves || 0) > 0 || subs.includes("calves")) groupLastTrained.calves = Math.max(groupLastTrained.calves, logTime);
      if ((m.core || 0) > 0 || (builds.coreStrength || 0) > 0) groupLastTrained.core = Math.max(groupLastTrained.core, logTime);
      if (conf.pillar === "cardio") groupLastTrained.cardio = Math.max(groupLastTrained.cardio, logTime);
    });

    const sectors = [
      { key: "chest", label: "CHEST", icon: "🛡️" },
      { key: "back", label: "BACK", icon: "⚔️" },
      { key: "biceps", label: "BICEPS", icon: "💪" },
      { key: "triceps", label: "TRICEPS", icon: "⚡" },
      { key: "shoulders", label: "SHOULDERS", icon: "🎯" },
      { key: "traps", label: "TRAPS", icon: "🐂" },
      { key: "quads", label: "QUADS", icon: "🦵" },
      { key: "hamstrings", label: "HAMSTRINGS", icon: "🏃" },
      { key: "glutes", label: "GLUTES", icon: "🍑" },
      { key: "calves", label: "CALVES", icon: "🥾" },
      { key: "core", label: "CORE", icon: "🧘" },
      { key: "cardio", label: "CARDIO", icon: "❤️" }
    ];

    const totalPips = 5;

    return sectors.map(sector => {
      const lastTime = groupLastTrained[sector.key] || 0;
      let days = 31;
      if (lastTime > 0) {
        days = Math.max(0, Math.floor((now - lastTime) / oneDayMs));
      }
      const isOver30 = lastTime === 0 || days >= 30;
      const clampedDays = isOver30 ? 30 : days;

      // 5-pip segmented battery drain curve across 30 days:
      // 0-2 days: 5 pips (Full / Fresh)
      // 3-6 days: 4 pips (Active)
      // 7-13 days: 3 pips (Cooling)
      // 14-21 days: 2 pips (Fading)
      // 22-29 days: 1 pip (Critical)
      // 30+ days: 0 pips (Drained)
      let filledPips = 0;
      if (!isOver30) {
        if (days <= 2) filledPips = 5;
        else if (days <= 6) filledPips = 4;
        else if (days <= 13) filledPips = 3;
        else if (days <= 21) filledPips = 2;
        else filledPips = 1;
      }

      const pipColor =
        filledPips >= 4
          ? "bg-emerald-400 border-emerald-300 shadow-[0_0_10px_rgba(52,211,153,0.45)]"
          : filledPips === 3
          ? "bg-amber-400 border-amber-300 shadow-[0_0_8px_rgba(251,191,36,0.35)]"
          : filledPips === 2
          ? "bg-orange-500 border-orange-400 shadow-[0_0_8px_rgba(249,115,22,0.35)]"
          : "bg-rose-500 border-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.45)] animate-pulse";

      const stateLabel =
        filledPips === 5
          ? "FRESH"
          : filledPips === 4
          ? "CHARGED"
          : filledPips === 3
          ? "COOLING"
          : filledPips === 2
          ? "FADING"
          : filledPips === 1
          ? "CRITICAL"
          : "DRAINED";

      const shortDaysText = isOver30
        ? "30+d"
        : days === 0
        ? "TODAY"
        : `${days}d AGO`;

      const statusText = isOver30
        ? "30+ DAYS"
        : days === 0
        ? "TODAY"
        : days === 1
        ? "1 DAY AGO"
        : `${days} DAYS AGO`;

      return {
        ...sector,
        days,
        isOver30,
        clampedDays,
        totalPips,
        filledPips,
        pipColor,
        stateLabel,
        shortDaysText,
        statusText
      };
    });
  }, [logs]);

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
              {/* Left side: name, equipped title & rank */}
              <div className="text-center flex flex-col items-center justify-center space-y-1.5 min-w-0 flex-1">
                <h2 className="text-xs sm:text-sm font-press-start text-white tracking-wider truncate w-full text-center">
                  {profile.name.toUpperCase()}
                </h2>
                {profile.equippedTitle && (
                  <span className="inline-block text-[8px] font-press-start text-amber-300 bg-amber-950/30 border border-amber-400/40 px-2.5 py-0.5 rounded-full tracking-wider uppercase truncate max-w-full">
                    « {profile.equippedTitle} »
                  </span>
                )}
                <div className="flex flex-wrap items-center justify-center gap-1.5 w-full mt-1">
                  <span className="inline-block text-[10px] font-mono font-extrabold bg-[#0D0D0E] text-slate-300 border border-slate-800 px-3 py-1 rounded-lg truncate max-w-full shadow-sm">
                    {overallTier.name.toUpperCase()}
                  </span>
                  {(profile.questXP || 0) > 0 && (
                    <span className="inline-block text-[9px] font-mono font-extrabold bg-cyan-950/40 text-cyan-300 border border-cyan-500/30 px-2 py-1 rounded-lg">
                      {profile.questXP} Q-XP
                    </span>
                  )}
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

          {/* 🚀 DYNAMIC WEEKLY / MONTHLY VOLUME TRACKER (BODY STATUS MAP) */}
          <div className="space-y-3">
            <BodyStatusMap
              weeklyVolume={weeklyVolume}
              weeklySubVolume={weeklySubVolume}
              monthlyVolume={monthlyVolume}
              monthlySubVolume={monthlySubVolume}
              logs={logs}
            />
          </div>

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
          {(() => {
            // Compute per-muscle workout counts, XP, Level, and Rank Color Tier
            const getMuscleLevelInfo = (muscleKey: string) => {
              const targetKey = muscleKey === "forearms" ? "biceps" : muscleKey;

              // 1. Count weighted workout sets & total sets logged for this muscle
              let weightedSets = 0;
              let rawSetCount = 0;

              logs.forEach((log) => {
                if (!log.exerciseName || log.id === "seed_1") return;
                const lowerName = log.exerciseName.toLowerCase();
                const conf = EXERCISE_CONFIGS.find((c) => c.name.toLowerCase() === lowerName);
                const dbEx = getAllExercises().find((e) => e.name.toLowerCase() === lowerName);
                const m = (conf?.muscles || dbEx?.muscles || {}) as Record<string, number>;
                const builds = (conf?.builds || dbEx?.builds || {}) as Record<string, number>;
                const subs = conf?.subCategories || dbEx?.subCategories || [];
                const pillar = conf?.pillar || dbEx?.pillar;

                if (targetKey === "cardio") {
                  if (pillar === "cardio" || log.categoryName?.toLowerCase() === "cardio") {
                    rawSetCount += 1;
                    weightedSets += Math.max(1, (log.minutes || 10) / 10);
                  }
                  return;
                }

                let w = m[targetKey] || 0;
                if (w === 0) {
                  if (subs.includes(targetKey)) w = 0.5;
                  else if (targetKey === "chest" && (builds.chestStrength || 0) > 0) w = 1.0;
                  else if (targetKey === "back" && (builds.backStrength || 0) > 0) w = 1.0;
                  else if (targetKey === "core" && (builds.coreStrength || 0) > 0) w = 1.0;
                  else if (muscleKey === "forearms" && /curl|deadlift|row|pull|shrug|carry/i.test(lowerName)) w = 0.5;
                }

                if (w > 0) {
                  rawSetCount += 1;
                  weightedSets += w;
                }
              });

              // 2. Combine performance stat level + cumulative workout XP (every 3 weighted sets = +1 Level, 100 XP per level)
              let perfLvl = 0;
              if (targetKey === "chest") perfLvl = getDisplayedStatLevel("chestStrength");
              else if (targetKey === "back") perfLvl = getDisplayedStatLevel("backStrength");
              else if (targetKey === "core") perfLvl = getDisplayedStatLevel("coreStrength");
              else if (targetKey === "cardio") perfLvl = getDisplayedStatLevel("cardio");
              else perfLvl = getDisplayedLevel(targetKey, subCategoryLevels[targetKey] || 0);

              const workoutXP = Math.round(weightedSets * 34); // ~3 primary sets = 102 XP (+1 Level)
              const perfXP = Math.round(perfLvl * 20);
              const totalXP = workoutXP + perfXP;
              const level = Math.max(1, 1 + Math.floor(totalXP / 100));
              const xpInCurrentLevel = totalXP % 100;

              // 3. Determine Rank Color Tier based on Level
              let rankName = "RANK E • ROOKIE";
              let fillHex = "#22c55e"; // Emerald Green (Lvl 1-4)
              let textClass = "text-emerald-400";
              let badgeClass = "bg-emerald-950/50 border-emerald-500/50 text-emerald-300";
              let barColor = "#22c55e";
              let nextRankLabel = "Rank D • Bronze (Lvl 5)";

              if (level >= 100) {
                rankName = "RANK SS • DIAMOND STEEL";
                fillHex = "url(#steel-glint-stats)";
                textClass = "text-cyan-200";
                badgeClass = "bg-cyan-950/70 border-cyan-300 text-cyan-200 shadow-[0_0_12px_rgba(165,243,252,0.4)]";
                barColor = "#67e8f9";
                nextRankLabel = "MAX RANK ACHIEVED";
              } else if (level >= 75) {
                rankName = "RANK S • CRIMSON";
                fillHex = "#f43f5e";
                textClass = "text-rose-400";
                badgeClass = "bg-rose-950/50 border-rose-500/50 text-rose-300";
                barColor = "#f43f5e";
                nextRankLabel = "Rank SS • Diamond Steel (Lvl 100)";
              } else if (level >= 50) {
                rankName = "RANK A • AMETHYST";
                fillHex = "#a855f7";
                textClass = "text-purple-400";
                badgeClass = "bg-purple-950/50 border-purple-500/50 text-purple-300";
                barColor = "#a855f7";
                nextRankLabel = "Rank S • Crimson (Lvl 75)";
              } else if (level >= 30) {
                rankName = "RANK B • GOLD";
                fillHex = "#facc15";
                textClass = "text-yellow-400";
                badgeClass = "bg-yellow-950/50 border-yellow-500/50 text-yellow-300";
                barColor = "#facc15";
                nextRankLabel = "Rank A • Amethyst (Lvl 50)";
              } else if (level >= 15) {
                rankName = "RANK C • SILVER CYAN";
                fillHex = "#38bdf8";
                textClass = "text-sky-400";
                badgeClass = "bg-sky-950/50 border-sky-500/50 text-sky-300";
                barColor = "#38bdf8";
                nextRankLabel = "Rank B • Gold (Lvl 30)";
              } else if (level >= 5) {
                rankName = "RANK D • BRONZE";
                fillHex = "#f97316";
                textClass = "text-orange-400";
                badgeClass = "bg-orange-950/50 border-orange-500/50 text-orange-300";
                barColor = "#f97316";
                nextRankLabel = "Rank C • Silver Cyan (Lvl 15)";
              }

              return {
                muscleKey,
                level,
                totalXP,
                xpInCurrentLevel,
                rawSetCount,
                rankName,
                fillHex,
                textClass,
                badgeClass,
                barColor,
                nextRankLabel
              };
            };

            const selectedInfo = getMuscleLevelInfo(selectedHudMuscle);

            const rankTiersLegend = [
              { label: "LVL 1–4", rank: "ROOKIE", color: "#22c55e" },
              { label: "LVL 5–14", rank: "BRONZE", color: "#f97316" },
              { label: "LVL 15–29", rank: "SILVER", color: "#38bdf8" },
              { label: "LVL 30–49", rank: "GOLD", color: "#facc15" },
              { label: "LVL 50–74", rank: "AMETHYST", color: "#a855f7" },
              { label: "LVL 75–99", rank: "CRIMSON", color: "#f43f5e" },
              { label: "LVL 100+", rank: "STEEL", color: "#94a3b8" }
            ];

            return (
              <div className="bg-[#161B22] border-2 border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4">
                {/* Header & FRONT / BACK Toggle Capsule (same layout as Exercise screen) */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-[9px] font-press-start text-cyan-400 tracking-widest block uppercase mb-1">
                      ⚔️ MUSCLE LEVEL & RANK HUD
                    </span>
                    <p className="text-[8px] text-slate-400 font-mono leading-relaxed">
                      Tap any muscle group to inspect its level. Muscles rank up in color the more workouts you log!
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

                {/* CENTERED CHARACTER DIAGRAM (Same as Exercise Screen, Colored by Muscle Level) */}
                <div className="flex flex-col items-center justify-center space-y-3 w-full">
                  <div className="relative w-full max-w-[290px] aspect-[488/585] bg-black rounded-xl overflow-hidden border border-slate-900 shadow-inner mx-auto">
                    {/* Top-Right Selected Muscle & Level Badge */}
                    <div className="absolute top-2 right-2 bg-slate-950/90 border border-cyan-400/80 px-2.5 py-1 rounded-lg text-cyan-300 font-press-start text-[7.5px] uppercase tracking-wider shadow-[0_0_10px_rgba(6,182,212,0.3)] z-20 pointer-events-none">
                      {selectedHudMuscle.toUpperCase()} • LVL {selectedInfo.level}
                    </div>

                    <svg
                      viewBox={hudViewSide === "front" ? "21 0 488 585" : "424 0 488 585"}
                      className="w-full h-full select-none"
                      xmlns="http://www.w3.org/2000/svg"
                      shapeRendering="crispEdges"
                    >
                      <defs>
                        <linearGradient id="steel-glint-stats" x1="0%" y1="0%" x2="100%" y2="50%">
                          <stop offset="0%" stopColor="#3E4A5A" />
                          <stop offset="42%" stopColor="#3E4A5A" />
                          <stop offset="50%" stopColor="#C9D6E8" stopOpacity="0.55" />
                          <stop offset="58%" stopColor="#3E4A5A" />
                          <stop offset="100%" stopColor="#3E4A5A" />
                          <animate attributeName="x1" from="-100%" to="100%" dur="2.8s" repeatCount="indefinite" />
                          <animate attributeName="x2" from="0%" to="200%" dur="2.8s" repeatCount="indefinite" />
                        </linearGradient>

                        <clipPath id="side-clip-stats">
                          <rect
                            x={hudViewSide === "front" ? "0" : "455"}
                            y="0"
                            width={hudViewSide === "front" ? "455" : "521"}
                            height="585"
                          />
                        </clipPath>
                      </defs>

                      {/* Layer 1: Base character sprite */}
                      <image
                        href="/muscle_map.png"
                        x="0"
                        y="0"
                        width="976"
                        height="585"
                        preserveAspectRatio="none"
                        clipPath="url(#side-clip-stats)"
                      />

                      {/* Layer 2: Muscle overlays colored dynamically by each muscle's Level Rank */}
                      {pixelMusclePaths.map((path, idx) => {
                        const mInfo = getMuscleLevelInfo(path.muscle);
                        const isSelected = path.muscle === selectedHudMuscle;
                        return (
                          <path
                            key={`${path.id}-${idx}-stats-hud`}
                            d={path.d}
                            fill={mInfo.fillHex}
                            opacity={isSelected ? 1 : 0.82}
                            style={{
                              filter: isSelected
                                ? "brightness(1.25) drop-shadow(0 0 6px rgba(255, 255, 255, 0.85))"
                                : undefined
                            }}
                            className="cursor-pointer hover:opacity-100 transition-all duration-150"
                            onClick={() => handleMuscleTap(path.muscle)}
                          />
                        );
                      })}
                    </svg>
                  </div>

                  {/* Cardio Button Below Image */}
                  {(() => {
                    const cardioInfo = getMuscleLevelInfo("cardio");
                    return (
                      <button
                        type="button"
                        onClick={() => handleMuscleTap("cardio")}
                        style={{ minHeight: "44px" }}
                        className={`w-full max-w-[290px] border-2 rounded-xl px-4 py-2.5 flex items-center justify-between font-press-start text-[10px] uppercase cursor-pointer transition active:scale-95 ${
                          selectedHudMuscle === "cardio"
                            ? "bg-cyan-950/60 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.3)] font-bold"
                            : "bg-[#12161A] hover:bg-[#161B22] border-slate-850 text-slate-300 hover:text-white"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <Flame className="w-4 h-4 text-cyan-400" /> CARDIO
                        </span>
                        <span className={`text-[9px] font-mono font-black ${cardioInfo.textClass}`}>
                          LVL {cardioInfo.level}
                        </span>
                      </button>
                    );
                  })()}
                </div>

                {/* 📈 EXERCISES DONE FOR SELECTED MUSCLE & DAILY MAX LINE GRAPH */}
                {(() => {
                  const targetKey = selectedHudMuscle === "forearms" ? "biceps" : selectedHudMuscle;

                  // Helper to check if a log targets selectedHudMuscle
                  const doesLogTargetMuscle = (log: FitnessLog): boolean => {
                    if (!log.exerciseName || log.id === "seed_1") return false;
                    const lowerName = log.exerciseName.toLowerCase();
                    const conf = EXERCISE_CONFIGS.find((c) => c.name.toLowerCase() === lowerName);
                    const dbEx = getAllExercises().find((e) => e.name.toLowerCase() === lowerName);
                    const m = (conf?.muscles || dbEx?.muscles || {}) as Record<string, number>;
                    const builds = (conf?.builds || dbEx?.builds || {}) as Record<string, number>;
                    const subs = conf?.subCategories || dbEx?.subCategories || [];
                    const pillar = conf?.pillar || dbEx?.pillar;

                    if (targetKey === "cardio") {
                      return pillar === "cardio" || log.categoryName?.toLowerCase() === "cardio";
                    }
                    if ((m[targetKey] || 0) > 0) return true;
                    if (subs.includes(targetKey)) return true;
                    if (targetKey === "chest" && (builds.chestStrength || 0) > 0) return true;
                    if (targetKey === "back" && (builds.backStrength || 0) > 0) return true;
                    if (targetKey === "core" && (builds.coreStrength || 0) > 0) return true;
                    if (selectedHudMuscle === "forearms" && /curl|deadlift|row|pull|shrug|carry/i.test(lowerName)) return true;
                    return false;
                  };

                  // Collect all logs for this muscle group and group by exercise name
                  const logsByExercise: Record<string, FitnessLog[]> = {};
                  logs.forEach((log) => {
                    if (!doesLogTargetMuscle(log) || !log.exerciseName) return;
                    const name = log.exerciseName;
                    if (!logsByExercise[name]) logsByExercise[name] = [];
                    logsByExercise[name].push(log);
                  });

                  const loggedExerciseNames = Object.keys(logsByExercise).sort(
                    (a, b) => logsByExercise[b].length - logsByExercise[a].length
                  );

                  const activeExerciseName =
                    (selectedGraphExerciseByMuscle[selectedHudMuscle] &&
                      logsByExercise[selectedGraphExerciseByMuscle[selectedHudMuscle]]
                      ? selectedGraphExerciseByMuscle[selectedHudMuscle]
                      : loggedExerciseNames[0]) || null;

                  // Compute daily best data points for the active exercise
                  interface DailyMaxPoint {
                    dateKey: string;
                    shortDate: string;
                    timestamp: number;
                    metricValue: number;
                    metricUnit: string;
                    metricTypeLabel: string;
                    rawBestSet: string;
                  }

                  const evaluateLogMaxMetric = (
                    log: FitnessLog,
                    exName: string
                  ): { val: number; unit: string; typeLabel: string; rawLabel: string } => {
                    const lowerName = exName.toLowerCase();
                    const conf = EXERCISE_CONFIGS.find((c) => c.name.toLowerCase() === lowerName);
                    const dbEx = getAllExercises().find((e) => e.name.toLowerCase() === lowerName);
                    const formType = conf?.formType || dbEx?.formType || "A";
                    const pillar = conf?.pillar || dbEx?.pillar;

                    // 1. Weighted lifts: Estimated 1-Rep Max (Epley formula: w * (1 + r / 30))
                    if ((log.weight || 0) > 0 && (log.reps || 0) > 0 && pillar !== "cardio") {
                      const w = log.weight!;
                      const r = log.reps!;
                      const est1RM = r <= 1 ? w : Math.round(w * (1 + r / 30));
                      return {
                        val: est1RM,
                        unit: "LBS",
                        typeLabel: "EST. 1RM MAX WEIGHT",
                        rawLabel: `${w} lbs × ${r}`
                      };
                    }

                    // 2. Cardio with distance & time: Max Speed (MPH)
                    const totalMinutes = (log.minutes || 0) + (log.seconds || 0) / 60;
                    if ((pillar === "cardio" || formType === "D" || formType === "F") && (log.distance || 0) > 0 && totalMinutes > 0) {
                      const mph = parseFloat(((log.distance! / totalMinutes) * 60).toFixed(1));
                      return {
                        val: mph,
                        unit: "MPH",
                        typeLabel: "MAX SPEED (MPH)",
                        rawLabel: `${log.distance} mi / ${Math.round(totalMinutes)}m`
                      };
                    }

                    // 3. Stairmaster / Floors
                    if ((log.floors || 0) > 0) {
                      return {
                        val: log.floors!,
                        unit: "FLOORS",
                        typeLabel: "MAX FLOORS CLIMBED",
                        rawLabel: `${log.floors} floors`
                      };
                    }

                    // 4. Isometric Holds (Plank, Superman)
                    if (formType === "C" || ((log.seconds || 0) > 0 && !(log.reps))) {
                      const totalSec = (log.minutes || 0) * 60 + (log.seconds || 0);
                      return {
                        val: totalSec,
                        unit: "SEC",
                        typeLabel: "MAX HOLD TIME",
                        rawLabel: `${totalSec}s hold`
                      };
                    }

                    // 5. Bodyweight Reps (Push-Ups, Pull-Ups, Burpees, etc.)
                    if ((log.reps || 0) > 0) {
                      return {
                        val: log.reps!,
                        unit: "REPS",
                        typeLabel: "MAX REPS IN A SET",
                        rawLabel: `${log.reps} reps`
                      };
                    }

                    // 6. Time-based Cardio fallback (minutes)
                    const mins = Math.round(totalMinutes);
                    return {
                      val: mins,
                      unit: "MINS",
                      typeLabel: "MAX DURATION",
                      rawLabel: `${mins} mins`
                    };
                  };

                  const dailyPoints: DailyMaxPoint[] = [];
                  if (activeExerciseName && logsByExercise[activeExerciseName]) {
                    const byDay = new Map<string, DailyMaxPoint>();

                    logsByExercise[activeExerciseName].forEach((log) => {
                      const d = new Date(log.timestamp);
                      if (isNaN(d.getTime())) return;
                      const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
                      const shortDate = d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
                      const evaluated = evaluateLogMaxMetric(log, activeExerciseName);

                      const existing = byDay.get(dateKey);
                      if (!existing || evaluated.val > existing.metricValue) {
                        byDay.set(dateKey, {
                          dateKey,
                          shortDate,
                          timestamp: d.getTime(),
                          metricValue: evaluated.val,
                          metricUnit: evaluated.unit,
                          metricTypeLabel: evaluated.typeLabel,
                          rawBestSet: evaluated.rawLabel
                        });
                      }
                    });

                    dailyPoints.push(
                      ...Array.from(byDay.values()).sort((a, b) => a.timestamp - b.timestamp)
                    );
                  }

                  const allTimeMax =
                    dailyPoints.length > 0
                      ? Math.max(...dailyPoints.map((p) => p.metricValue))
                      : 0;
                  const metricUnit = dailyPoints[0]?.metricUnit || "";
                  const metricTypeLabel = dailyPoints[0]?.metricTypeLabel || "DAILY MAX PROGRESSION";

                  return (
                    <div className="bg-[#0D0D0E] border-2 border-slate-800 rounded-2xl p-4 space-y-3.5 shadow-xl">
                      <div className="flex items-center justify-between gap-2 border-b border-slate-850 pb-2.5">
                        <div>
                          <span className="text-[8.5px] font-press-start text-cyan-400 uppercase tracking-wider block">
                            📈 {selectedHudMuscle.toUpperCase()} EXERCISE MAX GRAPH
                          </span>
                          <p className="text-[7.5px] font-mono text-slate-400 mt-0.5">
                            Graphs your best daily set (Est. 1RM max weight, max reps, or max speed) across workout days.
                          </p>
                        </div>
                      </div>

                      {loggedExerciseNames.length === 0 ? (
                        <div className="text-center py-6 border border-dashed border-slate-800 rounded-xl space-y-1.5">
                          <p className="text-[8.5px] font-press-start text-slate-400 uppercase">
                            NO {selectedHudMuscle.toUpperCase()} WORKOUTS LOGGED YET
                          </p>
                          <p className="text-[8px] font-mono text-slate-500">
                            Log an exercise targeting {selectedHudMuscle} to plot your daily max progression graph!
                          </p>
                        </div>
                      ) : (
                        <>
                          {/* Exercise Selector Pills for this Muscle Group */}
                          <div className="space-y-1.5">
                            <span className="text-[7px] font-press-start text-slate-400 uppercase block">
                              EXERCISES DONE FOR {selectedHudMuscle.toUpperCase()} ({loggedExerciseNames.length}):
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {loggedExerciseNames.map((exName) => {
                                const isSelected = exName === activeExerciseName;
                                const setCnt = logsByExercise[exName].length;
                                return (
                                  <button
                                    key={exName}
                                    type="button"
                                    onClick={() =>
                                      setSelectedGraphExerciseByMuscle((prev) => ({
                                        ...prev,
                                        [selectedHudMuscle]: exName
                                      }))
                                    }
                                    className={`px-2.5 py-1.5 rounded-xl text-[7.5px] font-press-start tracking-wide border transition cursor-pointer ${
                                      isSelected
                                        ? "bg-cyan-950/70 border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.2)]"
                                        : "bg-[#141920] border-slate-800 text-slate-400 hover:text-slate-200"
                                    }`}
                                  >
                                    {exName.toUpperCase()}{" "}
                                    <span className="font-mono text-[7.5px] text-emerald-400">
                                      ({setCnt})
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* SVG Daily Max Line Graph */}
                          {activeExerciseName && dailyPoints.length > 0 && (() => {
                            const svgW = 320;
                            const svgH = 165;
                            const padL = 36;
                            const padR = 24;
                            const padT = 26;
                            const padB = 34;
                            const plotW = svgW - padL - padR;
                            const plotH = svgH - padT - padB;

                            const values = dailyPoints.map((p) => p.metricValue);
                            const minVal = Math.min(...values);
                            const maxVal = Math.max(...values);
                            const range = maxVal - minVal;
                            const yMin = range === 0 ? Math.max(0, minVal * 0.85) : Math.max(0, minVal - range * 0.15);
                            const yMax = range === 0 ? maxVal * 1.15 || 10 : maxVal + range * 0.15;

                            const coords = dailyPoints.map((pt, idx) => {
                              const x =
                                dailyPoints.length === 1
                                  ? padL + plotW / 2
                                  : padL + (idx / (dailyPoints.length - 1)) * plotW;
                              const y =
                                padT + plotH - ((pt.metricValue - yMin) / (yMax - yMin || 1)) * plotH;
                              return { x, y, pt };
                            });

                            const polylinePoints = coords.map((c) => `${c.x},${c.y}`).join(" ");
                            const areaPoints =
                              coords.length > 1
                                ? `${coords[0].x},${padT + plotH} ${polylinePoints} ${coords[coords.length - 1].x},${padT + plotH}`
                                : "";

                            return (
                              <div className="bg-[#141920] border border-slate-850 rounded-xl p-3 space-y-2.5">
                                <div className="flex items-center justify-between gap-2">
                                  <div>
                                    <span className="text-[8px] font-press-start text-white uppercase block">
                                      {activeExerciseName}
                                    </span>
                                    <span className="text-[7px] font-mono text-cyan-400 uppercase">
                                      {metricTypeLabel}
                                    </span>
                                  </div>
                                  <div className="text-right bg-[#0D0D0E] border border-emerald-500/30 px-2.5 py-1 rounded-lg">
                                    <span className="text-[6.5px] font-press-start text-slate-400 block">
                                      BEST {metricUnit}
                                    </span>
                                    <span className="text-xs font-mono font-black text-emerald-400">
                                      {allTimeMax} {metricUnit}
                                    </span>
                                  </div>
                                </div>

                                <div className="w-full overflow-x-auto">
                                  <svg
                                    viewBox={`0 0 ${svgW} ${svgH}`}
                                    className="w-full h-auto select-none overflow-visible"
                                  >
                                    <defs>
                                      <linearGradient id="line-graph-area" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.35" />
                                        <stop offset="100%" stopColor="#22d3ee" stopOpacity="0.0" />
                                      </linearGradient>
                                    </defs>

                                    {/* Horizontal Grid Lines & Y-Axis Labels */}
                                    {[0, 0.5, 1].map((frac, gIdx) => {
                                      const gy = padT + plotH - frac * plotH;
                                      const gVal = Math.round(yMin + frac * (yMax - yMin));
                                      return (
                                        <g key={gIdx}>
                                          <line
                                            x1={padL}
                                            y1={gy}
                                            x2={svgW - padR}
                                            y2={gy}
                                            stroke="#1e293b"
                                            strokeDasharray="3 3"
                                            strokeWidth="1"
                                          />
                                          <text
                                            x={padL - 5}
                                            y={gy + 3}
                                            textAnchor="end"
                                            className="fill-slate-500 font-mono text-[7.5px]"
                                          >
                                            {gVal}
                                          </text>
                                        </g>
                                      );
                                    })}

                                    {/* Shaded Area under Line */}
                                    {coords.length > 1 && (
                                      <polygon points={areaPoints} fill="url(#line-graph-area)" />
                                    )}

                                    {/* Line connecting daily bests */}
                                    {coords.length > 1 && (
                                      <polyline
                                        fill="none"
                                        stroke="#22d3ee"
                                        strokeWidth="2.5"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        points={polylinePoints}
                                        style={{
                                          filter: "drop-shadow(0 0 6px rgba(34,211,238,0.5))"
                                        }}
                                      />
                                    )}

                                    {/* Data Points & Labels */}
                                    {coords.map((c, idx) => (
                                      <g key={c.pt.dateKey}>
                                        <circle
                                          cx={c.x}
                                          cy={c.y}
                                          r="4.5"
                                          fill="#10b981"
                                          stroke="#0D0D0E"
                                          strokeWidth="2"
                                        />
                                        {/* Max metric value above dot */}
                                        <text
                                          x={c.x}
                                          y={c.y - 8}
                                          textAnchor="middle"
                                          className="fill-cyan-300 font-mono font-bold text-[8px]"
                                        >
                                          {c.pt.metricValue}
                                        </text>
                                        {/* Date label on X-axis */}
                                        {(coords.length <= 7 ||
                                          idx === 0 ||
                                          idx === coords.length - 1 ||
                                          idx % Math.ceil(coords.length / 5) === 0) && (
                                          <text
                                            x={c.x}
                                            y={padT + plotH + 13}
                                            textAnchor="middle"
                                            className="fill-slate-400 font-mono text-[7px]"
                                          >
                                            {c.pt.shortDate}
                                          </text>
                                        )}
                                        {/* Raw set sub-label below date */}
                                        {(coords.length <= 5 ||
                                          idx === 0 ||
                                          idx === coords.length - 1) && (
                                          <text
                                            x={c.x}
                                            y={padT + plotH + 23}
                                            textAnchor="middle"
                                            className="fill-emerald-400/90 font-mono text-[6.5px]"
                                          >
                                            {c.pt.rawBestSet}
                                          </text>
                                        )}
                                      </g>
                                    ))}
                                  </svg>
                                </div>

                                {/* Daily Best Sets Breakdown List */}
                                <div className="border-t border-slate-800/80 pt-2 space-y-1 max-h-[110px] overflow-y-auto pr-1 scrollbar-thin">
                                  {[...dailyPoints].reverse().map((pt) => (
                                    <div
                                      key={pt.dateKey}
                                      className="flex items-center justify-between text-[7.5px] font-mono bg-[#0D0D0E] px-2.5 py-1 rounded border border-slate-850"
                                    >
                                      <span className="text-slate-400">{pt.shortDate}</span>
                                      <span className="text-slate-200 font-bold">
                                        Best Set: {pt.rawBestSet}
                                      </span>
                                      <span className="text-emerald-400 font-extrabold">
                                        → {pt.metricValue} {pt.metricUnit}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })()}
                        </>
                      )}
                    </div>
                  );
                })()}

                {/* Selected Muscle Level & XP Progression Card */}
                <div className="bg-[#0D0D0E] border-2 border-cyan-500/40 rounded-2xl p-4 space-y-3 shadow-[0_0_20px_rgba(6,182,212,0.12)]">
                  <div className="flex items-center justify-between gap-2 border-b border-slate-850 pb-2.5">
                    <div>
                      <span className="text-[7.5px] font-press-start text-slate-400 uppercase block">
                        SELECTED MUSCLE GROUP
                      </span>
                      <div className="flex items-center gap-2 mt-1">
                        <h4 className="text-xs font-press-start text-white uppercase tracking-wider">
                          {selectedHudMuscle.toUpperCase()}
                        </h4>
                        <span className={`text-[7.5px] font-press-start px-2 py-0.5 rounded border ${selectedInfo.badgeClass}`}>
                          {selectedInfo.rankName}
                        </span>
                      </div>
                    </div>

                    <div className="text-right bg-[#161B22] border border-slate-800 px-3 py-1.5 rounded-xl shrink-0">
                      <span className="text-[7px] font-press-start text-slate-400 block">LEVEL</span>
                      <span className={`text-lg font-mono font-black leading-none ${selectedInfo.textClass}`}>
                        {selectedInfo.level}
                      </span>
                    </div>
                  </div>

                  {/* XP Bar to Next Level */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[8px] font-mono">
                      <span className="text-slate-400 uppercase">
                        LEVEL {selectedInfo.level} PROGRESS ({selectedInfo.xpInCurrentLevel} / 100 XP)
                      </span>
                      <span className="text-cyan-300 font-bold">
                        {100 - selectedInfo.xpInCurrentLevel} XP TO LVL {selectedInfo.level + 1}
                      </span>
                    </div>
                    <div className="w-full bg-[#161B22] border border-slate-800 h-2.5 rounded-full overflow-hidden p-0.5">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.max(4, selectedInfo.xpInCurrentLevel)}%`,
                          backgroundColor: selectedInfo.barColor
                        }}
                      />
                    </div>
                  </div>

                  {/* Stats Footer Row */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[8px] font-mono text-slate-400">
                    <span>
                      🏋️ Workouts Logged:{" "}
                      <strong className="text-white">{selectedInfo.rawSetCount} sets</strong>
                    </span>
                    <span>
                      🎨 Next Color:{" "}
                      <strong className="text-cyan-300">{selectedInfo.nextRankLabel}</strong>
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOpenStatModal(selectedHudMuscle, selectedInfo.level)}
                    className="w-full py-2 px-3 rounded-xl bg-[#161B22] hover:bg-cyan-950/40 border border-slate-800 hover:border-cyan-500/40 text-cyan-300 text-[8px] font-press-start tracking-wider uppercase cursor-pointer transition"
                  >
                    📊 VIEW CONTRIBUTING EXERCISES & DETAILS
                  </button>
                </div>

                {/* Rank Color Progression Legend at Very Bottom */}
                <div className="bg-[#0D0D0E] border border-slate-850 rounded-xl p-2.5">
                  <div className="text-[7px] font-press-start text-slate-400 uppercase tracking-wider mb-2 text-center">
                    RANK UP COLOR TIERS
                  </div>
                  <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
                    {rankTiersLegend.map((t) => (
                      <div
                        key={t.rank}
                        className="flex flex-col items-center bg-[#141920] border border-slate-800/80 rounded-lg py-1.5 px-1 text-center"
                      >
                        <span
                          className="w-3 h-3 rounded-sm mb-1 border border-white/20"
                          style={{ backgroundColor: t.color }}
                        />
                        <span className="text-[6.5px] font-press-start text-slate-200 leading-tight">
                          {t.rank}
                        </span>
                        <span className="text-[6.5px] font-mono text-slate-400">
                          {t.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}
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
          {/* QUEST FEEDBACK TOAST BANNER */}
          {questFeedback && (
            <div className="bg-cyan-950/80 border-2 border-cyan-400 text-cyan-200 px-4 py-3 rounded-xl text-[9px] font-press-start tracking-wide text-center shadow-[0_0_20px_rgba(6,182,212,0.3)] animate-fade-in">
              {questFeedback}
            </div>
          )}

          {/* 1. ACTIVE QUEST CONTRACTS (UP TO 3) */}
          <div className="bg-[#161B22] border-2 border-cyan-500/40 rounded-2xl p-5 shadow-2xl space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-cyan-400 rounded-full animate-ping" />
                <span className="text-[10px] font-press-start text-cyan-300 uppercase tracking-widest">
                  ACTIVE CONTRACTS
                </span>
              </div>
              <span className="text-[8.5px] font-press-start text-emerald-400 bg-emerald-950/30 border border-emerald-500/30 px-2.5 py-1 rounded-lg">
                {evaluatedQuests.length} / {MAX_ACTIVE_QUESTS} ACTIVE
              </span>
            </div>

            {evaluatedQuests.length === 0 ? (
              <div className="bg-[#0D0D0E] border border-dashed border-slate-800 rounded-xl p-5 text-center space-y-2">
                <p className="text-[9px] font-press-start text-slate-400 uppercase">
                  NO ACTIVE QUESTS SELECTED
                </p>
                <p className="text-[9px] font-mono text-slate-500 leading-relaxed">
                  Choose a quest rank below on the Guild Quest Board and tap <span className="text-cyan-400 font-bold">ACCEPT QUEST</span> to begin tracking!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {evaluatedQuests.map((eq) => {
                  const categoryBadgeColors: Record<QuestCategory, string> = {
                    milestone: "text-cyan-300 border-cyan-500/40 bg-cyan-950/30",
                    streak: "text-amber-300 border-amber-500/40 bg-amber-950/30",
                    lore: "text-purple-300 border-purple-500/40 bg-purple-950/30",
                    boss: "text-rose-300 border-rose-500/40 bg-rose-950/30"
                  };

                  return (
                    <div
                      key={eq.instance.instanceId}
                      className={`p-4 border-2 rounded-2xl space-y-3.5 transition ${
                        eq.isReadyToClaim
                          ? "bg-emerald-950/20 border-emerald-400/70 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                          : "bg-[#0D0D0E] border-slate-800"
                      }`}
                    >
                      {/* Header Row */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="text-2xl p-2 bg-[#161B22] border border-slate-800 rounded-xl shrink-0">
                            {eq.template.icon}
                          </div>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="text-[9.5px] font-press-start text-white tracking-wide">
                                {eq.template.title}
                              </span>
                              <span
                                className={`text-[7px] font-press-start px-2 py-0.5 rounded border uppercase ${
                                  categoryBadgeColors[eq.template.category]
                                }`}
                              >
                                {eq.tierConfig.rankLabel}
                              </span>
                              {eq.variantLabel && (
                                <span className="text-[7px] font-mono font-bold text-slate-300 bg-slate-900 border border-slate-700 px-1.5 py-0.5 rounded uppercase">
                                  {eq.variantLabel}
                                </span>
                              )}
                            </div>
                            <p className="text-[8px] font-mono text-slate-400 mt-1">
                              Reward: <span className="text-cyan-400 font-bold">+{eq.tierConfig.rewardXP} XP</span> • Title:{" "}
                              <span className="text-amber-300 font-bold">«{eq.tierConfig.rewardTitle}»</span>
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          {eq.isReadyToClaim ? (
                            <span className="px-2 py-1 bg-emerald-400 text-slate-950 text-[7.5px] font-press-start rounded font-black tracking-wider inline-block">
                              READY!
                            </span>
                          ) : (
                            <span className="text-[8px] font-mono text-slate-400 block">
                              ⏳ {eq.daysRemaining}d {eq.hoursRemaining}h left
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Streak Quest Banner + Rest Potion Control */}
                      {eq.isStreakQuest && (
                        <div className="bg-[#161B22] border border-amber-500/30 rounded-xl p-2.5 flex flex-wrap items-center justify-between gap-2">
                          <div className="space-y-0.5">
                            <div className="text-[8px] font-press-start text-amber-300 flex items-center gap-1.5">
                              <span>🔥 STREAK: {eq.streakDaysCompleted} / {eq.streakTargetDays} DAYS</span>
                              {eq.todayCompleted && (
                                <span className="text-[7px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 px-1.5 py-0.5 rounded">
                                  {eq.todayShielded ? "SHIELDED TODAY" : "TODAY DONE ✓"}
                                </span>
                              )}
                            </div>
                            <p className="text-[7.5px] font-mono text-slate-400">
                              Complete today's daily targets below or use a Rest Potion to protect your streak.
                            </p>
                          </div>

                          {eq.instance.restPotionsRemaining > 0 && !eq.todayCompleted && (
                            <button
                              type="button"
                              onClick={() => handleUseRestPotion(eq.instance.instanceId)}
                              className="px-2.5 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/50 text-amber-300 text-[7.5px] font-press-start tracking-wider cursor-pointer active:scale-95 transition shrink-0"
                            >
                              🧪 USE REST POTION ({eq.instance.restPotionsRemaining})
                            </button>
                          )}
                          {eq.instance.restPotionsRemaining === 0 && (
                            <span className="text-[7.5px] font-mono text-slate-500">
                              🧪 0 Rest Potions left
                            </span>
                          )}
                        </div>
                      )}

                      {/* Objectives List with Live Bars & Quick-Log Micro-Set Buttons */}
                      <div className="space-y-2.5">
                        {eq.objectives.map((obj) => (
                          <div
                            key={obj.id}
                            className="bg-[#141920] border border-slate-850 rounded-xl p-2.5 space-y-1.5"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-[8.5px] font-mono font-bold text-slate-200">
                                {obj.label}
                              </span>
                              <span className="text-[8.5px] font-mono text-cyan-300 font-bold shrink-0">
                                {obj.current.toLocaleString()} / {obj.target.toLocaleString()} {obj.unit} ({obj.pct}%)
                              </span>
                            </div>

                            <div className="w-full bg-[#090B0E] h-2 rounded-full overflow-hidden border border-slate-800">
                              <div
                                className={`h-full transition-all duration-500 ${
                                  obj.completed
                                    ? "bg-gradient-to-r from-emerald-400 to-cyan-400"
                                    : "bg-gradient-to-r from-cyan-500 to-blue-500"
                                }`}
                                style={{ width: `${obj.pct}%` }}
                              />
                            </div>

                            <div className="flex items-center justify-between pt-1">
                              <span className="text-[7.5px] font-mono text-slate-500">
                                Auto-tracks from Exercise tab or quick-log:
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  handleQuickLogObjective(
                                    eq.instance.instanceId,
                                    obj.id,
                                    eq.isStreakQuest,
                                    obj.quickLog
                                  )
                                }
                                className="px-2.5 py-1 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/40 text-cyan-300 text-[7.5px] font-press-start tracking-wide cursor-pointer active:scale-95 transition"
                              >
                                {obj.quickLog.buttonLabel}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Footer Actions: Claim Reward or Abandon */}
                      <div className="flex items-center justify-between gap-2 pt-1">
                        {eq.isReadyToClaim ? (
                          <button
                            type="button"
                            onClick={() => handleClaimQuestReward(eq)}
                            className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 text-[9px] font-press-start font-black tracking-wider uppercase shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:brightness-110 cursor-pointer active:scale-98 transition"
                          >
                            ✨ CLAIM REWARD (+{eq.tierConfig.rewardXP} XP & TITLE)
                          </button>
                        ) : (
                          <div className="text-[8px] font-mono text-slate-500">
                            Overall Quest Completion:{" "}
                            <span className="text-cyan-400 font-bold">{eq.overallPct}%</span>
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={() => handleAbandonQuest(eq.instance.instanceId)}
                          className="px-2.5 py-1.5 rounded-lg border border-slate-800 hover:border-rose-500/40 text-slate-500 hover:text-rose-400 text-[7.5px] font-mono uppercase cursor-pointer transition"
                        >
                          Abandon
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* UNLOCKED TITLES BAR (IF ANY UNLOCKED) */}
          {unlockedTitles.length > 0 && (
            <div className="bg-[#161B22] border-2 border-amber-500/30 rounded-2xl p-4 shadow-xl space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-press-start text-amber-300 uppercase tracking-wider">
                  👑 UNLOCKED GUILD TITLES ({unlockedTitles.length})
                </span>
                <span className="text-[7.5px] font-mono text-slate-400">
                  Tap to equip on Character card
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {unlockedTitles.map((title) => {
                  const isEquipped = profile.equippedTitle === title;
                  return (
                    <button
                      key={title}
                      type="button"
                      onClick={() => handleEquipTitle(title)}
                      className={`px-3 py-1.5 rounded-xl text-[8px] font-press-start tracking-wide border transition cursor-pointer ${
                        isEquipped
                          ? "bg-amber-400 text-slate-950 border-amber-300 font-black shadow-[0_0_12px_rgba(251,191,36,0.3)]"
                          : "bg-[#0D0D0E] text-amber-300 border-amber-500/30 hover:border-amber-400"
                      }`}
                    >
                      « {title} » {isEquipped ? "✓" : ""}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 2. CHOOSE-AND-ACCEPT GUILD QUEST BOARD */}
          <div className="bg-[#161B22] border-2 border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="border-b border-slate-800 pb-3 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-press-start text-cyan-400 tracking-wider uppercase">
                  📜 GUILD QUEST BOARD
                </span>
                <span className="text-[8px] font-mono text-slate-400 uppercase">
                  {completedQuests.length} COMPLETED
                </span>
              </div>
              <p className="text-[8px] font-mono text-slate-400">
                Select a quest category, customize your difficulty tier (Apprentice → Journeyman → Champion), and accept up to {MAX_ACTIVE_QUESTS} active contracts.
              </p>
            </div>

            {/* Category Filter Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 bg-[#0D0D0E] p-1.5 rounded-xl border border-slate-850">
              {(
                [
                  { id: "milestone", label: "⚔️ MILESTONE", sub: "Volume" },
                  { id: "streak", label: "🔥 STREAK", sub: "Daily Protocol" },
                  { id: "lore", label: "🏰 LORE", sub: "RPG Campaigns" },
                  { id: "boss", label: "💀 BOSS", sub: "Single Raid" }
                ] as { id: QuestCategory; label: string; sub: string }[]
              ).map((cat) => {
                const isSelected = selectedQuestCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedQuestCategory(cat.id)}
                    className={`py-2 px-2 rounded-lg text-center transition cursor-pointer border ${
                      isSelected
                        ? "bg-cyan-950/60 border-cyan-400/60 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.15)]"
                        : "bg-transparent border-transparent text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <div className="text-[8px] font-press-start tracking-wide">{cat.label}</div>
                    <div className="text-[7px] font-mono text-slate-400 mt-0.5">{cat.sub}</div>
                  </button>
                );
              })}
            </div>

            {/* Quest Cards for Selected Category */}
            <div className="space-y-4">
              {QUEST_CATALOG.filter((q) => q.category === selectedQuestCategory).map((quest) => {
                const selectedVariantId = selectedVariantByQuest[quest.id] || quest.variants?.[0]?.id;
                const tiers = quest.getTiers(selectedVariantId);
                const selectedTierKey: QuestTierKey = selectedTierByQuest[quest.id] || "apprentice";
                const activeTier = tiers[selectedTierKey];
                const isAlreadyActive = activeQuests.some((a) => a.questId === quest.id);
                const isSlotsFull = activeQuests.length >= MAX_ACTIVE_QUESTS && !isAlreadyActive;
                const timesCompleted = completedQuests.filter((c) => c.questId === quest.id).length;

                return (
                  <div
                    key={quest.id}
                    className="bg-[#0D0D0E] border-2 border-slate-850 hover:border-slate-700 rounded-2xl p-4 space-y-3.5 transition"
                  >
                    {/* Title & Lore */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="p-2.5 bg-[#161B22] border border-slate-800 rounded-xl text-2xl shrink-0">
                          {quest.icon}
                        </div>
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[9.5px] font-press-start text-white tracking-wide">
                              {quest.title}
                            </span>
                            {timesCompleted > 0 && (
                              <span className="px-1.5 py-0.5 bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 text-[7px] font-press-start rounded">
                                CLEARED ×{timesCompleted}
                              </span>
                            )}
                          </div>
                          <span className="text-[8px] font-mono text-cyan-400 font-bold block uppercase">
                            {quest.subtitle}
                          </span>
                          <p className="text-[8.5px] font-mono text-slate-400 leading-relaxed">
                            {quest.lore}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Optional Variant Selector (e.g., Push-Ups vs Squats vs Lunges vs Pull-Ups) */}
                    {quest.variants && quest.variants.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-[7.5px] font-press-start text-slate-400 uppercase block">
                          CHOOSE VARIANT:
                        </span>
                        <div className="grid grid-cols-2 gap-1.5">
                          {quest.variants.map((v) => {
                            const isVarSelected = selectedVariantId === v.id;
                            return (
                              <button
                                key={v.id}
                                type="button"
                                onClick={() =>
                                  setSelectedVariantByQuest((prev) => ({
                                    ...prev,
                                    [quest.id]: v.id
                                  }))
                                }
                                className={`px-2.5 py-1.5 rounded-lg text-left border transition cursor-pointer ${
                                  isVarSelected
                                    ? "bg-cyan-950/40 border-cyan-400 text-cyan-200"
                                    : "bg-[#141920] border-slate-800 text-slate-400 hover:text-slate-200"
                                }`}
                              >
                                <div className="text-[8px] font-mono font-bold">{v.label}</div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Tiered Difficulty Selector (Apprentice -> Journeyman -> Champion) */}
                    <div className="space-y-1.5">
                      <span className="text-[7.5px] font-press-start text-slate-400 uppercase block">
                        SELECT RANK TIER:
                      </span>
                      <div className="grid grid-cols-3 gap-1.5">
                        {(["apprentice", "journeyman", "champion"] as QuestTierKey[]).map((tKey) => {
                          const tConf = tiers[tKey];
                          const isSelected = selectedTierKey === tKey;
                          const tierColor =
                            tKey === "apprentice"
                              ? isSelected
                                ? "border-emerald-400 bg-emerald-950/30 text-emerald-300"
                                : "border-slate-800 bg-[#141920] text-slate-400"
                              : tKey === "journeyman"
                              ? isSelected
                                ? "border-cyan-400 bg-cyan-950/30 text-cyan-300"
                                : "border-slate-800 bg-[#141920] text-slate-400"
                              : isSelected
                              ? "border-amber-400 bg-amber-950/30 text-amber-300"
                              : "border-slate-800 bg-[#141920] text-slate-400";

                          return (
                            <button
                              key={tKey}
                              type="button"
                              onClick={() =>
                                setSelectedTierByQuest((prev) => ({
                                  ...prev,
                                  [quest.id]: tKey
                                }))
                              }
                              className={`p-2 rounded-xl border text-center transition cursor-pointer ${tierColor}`}
                            >
                              <div className="text-[7.5px] font-press-start truncate">
                                {tConf.rankLabel.toUpperCase()}
                              </div>
                              <div className="text-[7.5px] font-mono font-bold mt-1 text-slate-200 truncate">
                                {tConf.badgeLabel}
                              </div>
                              <div className="text-[7px] font-mono text-cyan-400 mt-0.5">
                                +{tConf.rewardXP} XP
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Selected Tier Requirements & Rewards Preview */}
                    <div className="bg-[#141920] border border-slate-850 rounded-xl p-3 space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-1 text-[8px] font-mono">
                        <span className="text-slate-400">
                          ⏱️ Window:{" "}
                          <span className="text-slate-200 font-bold">
                            {activeTier.streakTargetDays
                              ? `${activeTier.streakTargetDays}-Day Streak`
                              : `${activeTier.durationDays} Days`}
                          </span>
                        </span>
                        {activeTier.restPotions > 0 && (
                          <span className="text-amber-300 font-bold">
                            🧪 {activeTier.restPotions} Rest Potion{activeTier.restPotions > 1 ? "s" : ""} Included
                          </span>
                        )}
                        <span className="text-amber-300">
                          👑 Title: <span className="font-bold">«{activeTier.rewardTitle}»</span>
                        </span>
                      </div>

                      <div className="border-t border-slate-800/80 pt-1.5 space-y-1">
                        {activeTier.objectives.map((obj) => (
                          <div
                            key={obj.id}
                            className="flex items-center justify-between text-[8px] font-mono text-slate-300"
                          >
                            <span>• {obj.label}</span>
                            <span className="text-cyan-300 font-bold">
                              {obj.target.toLocaleString()} {obj.unit}
                              {obj.scope === "daily" ? " / day" : ""}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Accept Quest Button */}
                    <button
                      type="button"
                      disabled={isAlreadyActive || isSlotsFull}
                      onClick={() => handleAcceptQuest(quest.id)}
                      className={`w-full py-2.5 px-4 rounded-xl text-[9px] font-press-start tracking-wider uppercase transition ${
                        isAlreadyActive
                          ? "bg-emerald-950/30 border border-emerald-500/40 text-emerald-400 cursor-default"
                          : isSlotsFull
                          ? "bg-slate-900 border border-slate-800 text-slate-600 cursor-not-allowed"
                          : "bg-gradient-to-r from-cyan-500 to-emerald-400 text-slate-950 font-black shadow-[0_0_15px_rgba(6,182,212,0.25)] hover:brightness-110 cursor-pointer active:scale-98"
                      }`}
                    >
                      {isAlreadyActive
                        ? "✓ QUEST ACTIVE IN CONTRACT LOG"
                        : isSlotsFull
                        ? `CONTRACT LOG FULL (${MAX_ACTIVE_QUESTS}/${MAX_ACTIVE_QUESTS})`
                        : `⚔️ ACCEPT QUEST (${activeTier.rankLabel.toUpperCase()})`}
                    </button>
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
