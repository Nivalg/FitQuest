import { FitnessLog, AthleteProfile } from "../types";

export const MAX_ACTIVE_QUESTS = 3;

export type QuestCategory = "milestone" | "streak" | "lore" | "boss";
export type QuestTierKey = "apprentice" | "journeyman" | "champion";
export type QuestUnit = "reps" | "miles" | "seconds" | "lbs" | "flights" | "sets" | "mins";

export interface QuestQuickLogPreset {
  exerciseName: string;
  categoryName: string;
  amount: number;
  buttonLabel: string;
  weight?: number;
  reps?: number;
  minutes?: number;
  seconds?: number;
  distance?: number;
  floors?: number;
}

export interface QuestObjectiveTemplate {
  id: string;
  label: string;
  target: number;
  unit: QuestUnit;
  /**
   * "cumulative": sums all matching logs since quest acceptance
   * "daily": sums matching logs per calendar day (used by streak quests)
   */
  scope: "cumulative" | "daily";
  /** Lowercase substrings or exercise names to match in FitnessLog.exerciseName */
  matchKeywords: string[];
  quickLog: QuestQuickLogPreset;
}

export interface QuestTierConfig {
  key: QuestTierKey;
  rankLabel: string;
  badgeLabel: string;
  durationDays: number;
  restPotions: number;
  streakTargetDays?: number;
  rewardXP: number;
  rewardTitle: string;
  objectives: QuestObjectiveTemplate[];
}

export interface QuestVariantOption {
  id: string;
  label: string;
  description?: string;
}

export interface QuestTemplate {
  id: string;
  title: string;
  subtitle: string;
  lore: string;
  icon: string;
  category: QuestCategory;
  variants?: QuestVariantOption[];
  getTiers: (variantId?: string) => Record<QuestTierKey, QuestTierConfig>;
}

export interface ActiveQuestInstance {
  instanceId: string;
  questId: string;
  tier: QuestTierKey;
  variantId?: string;
  acceptedAt: string; // ISO timestamp
  expiresAt: string; // ISO timestamp
  restPotionsRemaining: number;
  shieldedDates: string[]; // YYYY-MM-DD dates protected by a Rest Potion
  manualProgress: Record<string, number>; // objectiveId -> bonus manual progress
  manualDailyProgress: Record<string, Record<string, number>>; // YYYY-MM-DD -> objectiveId -> amount
}

export interface CompletedQuestRecord {
  instanceId: string;
  questId: string;
  title: string;
  tier: QuestTierKey;
  rankLabel: string;
  rewardXP: number;
  rewardTitle: string;
  completedAt: string;
}

export interface EvaluatedObjective {
  id: string;
  label: string;
  current: number;
  target: number;
  unit: QuestUnit;
  pct: number;
  completed: boolean;
  quickLog: QuestQuickLogPreset;
}

export interface EvaluatedActiveQuest {
  instance: ActiveQuestInstance;
  template: QuestTemplate;
  tierConfig: QuestTierConfig;
  variantLabel?: string;
  objectives: EvaluatedObjective[];
  overallPct: number;
  isReadyToClaim: boolean;
  isExpired: boolean;
  daysRemaining: number;
  hoursRemaining: number;
  // Streak quest specific
  isStreakQuest: boolean;
  streakDaysCompleted: number;
  streakTargetDays: number;
  todayCompleted: boolean;
  todayShielded: boolean;
}

// Helper for local YYYY-MM-DD string
export function toLocalDateKey(dateOrIso: Date | string | number): string {
  const d = new Date(dateOrIso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

// ---------------------------------------------------------------------------
// QUEST CATALOG (All 15 Quests Across 4 Categories)
// ---------------------------------------------------------------------------

export const QUEST_CATALOG: QuestTemplate[] = [
  // =========================================================================
  // 1. CUMULATIVE MILESTONE QUESTS (Long-Term Volume)
  // =========================================================================
  {
    id: "iron_century",
    title: "IRON CENTURY",
    subtitle: "The 1,000 Rep Gauntlet",
    lore: "Complete cumulative reps of your chosen compound movement over 30 days (~33–34 reps/day on Champion). Log micro-sets throughout the day at your own pace.",
    icon: "⚔️",
    category: "milestone",
    variants: [
      { id: "pushups", label: "Push-Ups", description: "Regular, Incline, Decline, or Wide Push-Ups" },
      { id: "squats", label: "Air Squats", description: "Bodyweight Squats or Squat Jumps" },
      { id: "lunges", label: "Lunges", description: "Bodyweight, Forward, or Dumbbell Lunges" },
      { id: "pullups", label: "Pull-Ups (Scaled)", description: "Overhand Pull-Ups or Chin-Ups (150 / 300 / 500 reps)" }
    ],
    getTiers: (variantId = "pushups") => {
      const isPullups = variantId === "pullups";
      const isSquats = variantId === "squats";
      const isLunges = variantId === "lunges";

      const exName = isPullups
        ? "Overhand Pull-Ups"
        : isSquats
        ? "Bodyweight Squats"
        : isLunges
        ? "Lunges"
        : "Regular Push-Ups";

      const keywords = isPullups
        ? ["pull-up", "pullup", "chin-up", "chinup"]
        : isSquats
        ? ["squat"]
        : isLunges
        ? ["lunge"]
        : ["push-up", "pushup", "push up"];

      const label = isPullups
        ? "Pull-Up / Chin-Up Reps"
        : isSquats
        ? "Squat Reps"
        : isLunges
        ? "Lunge Reps"
        : "Push-Up Reps";

      const tApp = isPullups ? 150 : 300;
      const tJour = isPullups ? 300 : 600;
      const tChamp = isPullups ? 500 : 1000;
      const quickAmt = isPullups ? 10 : 25;

      const makeObj = (target: number): QuestObjectiveTemplate => ({
        id: `iron_${variantId}`,
        label,
        target,
        unit: "reps",
        scope: "cumulative",
        matchKeywords: keywords,
        quickLog: {
          exerciseName: exName,
          categoryName: "Bodyweight",
          amount: quickAmt,
          reps: quickAmt,
          buttonLabel: `+${quickAmt} Reps`
        }
      });

      return {
        apprentice: {
          key: "apprentice",
          rankLabel: "Apprentice",
          badgeLabel: `${tApp} Reps / 30d`,
          durationDays: 30,
          restPotions: 0,
          rewardXP: 600,
          rewardTitle: "Bronze Centurion",
          objectives: [makeObj(tApp)]
        },
        journeyman: {
          key: "journeyman",
          rankLabel: "Journeyman",
          badgeLabel: `${tJour} Reps / 30d`,
          durationDays: 30,
          restPotions: 0,
          rewardXP: 1000,
          rewardTitle: "Silver Centurion",
          objectives: [makeObj(tJour)]
        },
        champion: {
          key: "champion",
          rankLabel: "Champion",
          badgeLabel: `${tChamp} Reps / 30d`,
          durationDays: 30,
          restPotions: 0,
          rewardXP: 1500,
          rewardTitle: "Iron Centurion",
          objectives: [makeObj(tChamp)]
        }
      };
    }
  },

  {
    id: "couriers_path",
    title: "THE COURIER'S PATH",
    subtitle: "7-Day Distance Expedition",
    lore: "Accumulate running, jogging, hiking, or walking miles across a 7-day window. Pace your miles however you choose before the dispatch window closes.",
    icon: "🥾",
    category: "milestone",
    getTiers: () => {
      const makeObj = (miles: number): QuestObjectiveTemplate => ({
        id: "courier_miles",
        label: "Run / Walk / Hike Distance",
        target: miles,
        unit: "miles",
        scope: "cumulative",
        matchKeywords: ["run", "jog", "walk", "hike", "hiking", "treadmill", "sprint"],
        quickLog: {
          exerciseName: "Outdoor Running",
          categoryName: "Cardio",
          amount: 2,
          distance: 2,
          minutes: 20,
          buttonLabel: "+2.0 Miles"
        }
      });

      return {
        apprentice: {
          key: "apprentice",
          rankLabel: "Scout",
          badgeLabel: "10 Miles / 7d",
          durationDays: 7,
          restPotions: 0,
          rewardXP: 500,
          rewardTitle: "Outland Scout",
          objectives: [makeObj(10)]
        },
        journeyman: {
          key: "journeyman",
          rankLabel: "Strider",
          badgeLabel: "25 Miles / 7d",
          durationDays: 7,
          restPotions: 0,
          rewardXP: 850,
          rewardTitle: "Realm Strider",
          objectives: [makeObj(25)]
        },
        champion: {
          key: "champion",
          rankLabel: "Ranger",
          badgeLabel: "50 Miles / 7d",
          durationDays: 7,
          restPotions: 0,
          rewardXP: 1300,
          rewardTitle: "Windrunner Ranger",
          objectives: [makeObj(50)]
        }
      };
    }
  },

  {
    id: "core_of_adamant",
    title: "CORE OF ADAMANT",
    subtitle: "Isometric Plank Mastery",
    lore: "Forge an unbreakable midsection by accumulating total isometric Plank hold time over 30 days. Every second held counts toward your 3,600-second pool.",
    icon: "🛡️",
    category: "milestone",
    getTiers: () => {
      const makeObj = (seconds: number): QuestObjectiveTemplate => ({
        id: "adamant_plank_sec",
        label: "Cumulative Plank Hold",
        target: seconds,
        unit: "seconds",
        scope: "cumulative",
        matchKeywords: ["plank", "superman"],
        quickLog: {
          exerciseName: "Plank",
          categoryName: "Bodyweight",
          amount: 60,
          minutes: 1,
          seconds: 60,
          buttonLabel: "+60s Plank"
        }
      });

      return {
        apprentice: {
          key: "apprentice",
          rankLabel: "Apprentice",
          badgeLabel: "20 Mins (1,200s) / 30d",
          durationDays: 30,
          restPotions: 0,
          rewardXP: 500,
          rewardTitle: "Iron Core Initiate",
          objectives: [makeObj(1200)]
        },
        journeyman: {
          key: "journeyman",
          rankLabel: "Journeyman",
          badgeLabel: "40 Mins (2,400s) / 30d",
          durationDays: 30,
          restPotions: 0,
          rewardXP: 850,
          rewardTitle: "Steel Bastion",
          objectives: [makeObj(2400)]
        },
        champion: {
          key: "champion",
          rankLabel: "Champion",
          badgeLabel: "60 Mins (3,600s) / 30d",
          durationDays: 30,
          restPotions: 0,
          rewardXP: 1300,
          rewardTitle: "Core of Adamant",
          objectives: [makeObj(3600)]
        }
      };
    }
  },

  {
    id: "titans_tonnage",
    title: "THE TITAN'S TONNAGE",
    subtitle: "Monthly Heavy Volume Crusade",
    lore: "Move a colossal total accumulated weight volume (reps × weight) within 30 days. Choose all weighted exercises or specialize in a signature compound lift.",
    icon: "🏋️",
    category: "milestone",
    variants: [
      { id: "all", label: "All Weighted Lifts", description: "Any weighted free-weight or machine lift" },
      { id: "bench", label: "Bench Press", description: "Bench Press, Incline Bench, or DB Press" },
      { id: "squat", label: "Barbell Squat", description: "Barbell Squat, Front Squat, or Leg Press" },
      { id: "deadlift", label: "Deadlift", description: "Deadlift or Romanian Deadlift" }
    ],
    getTiers: (variantId = "all") => {
      const isBench = variantId === "bench";
      const isSquat = variantId === "squat";
      const isDeadlift = variantId === "deadlift";

      const exName = isBench
        ? "Bench Press"
        : isSquat
        ? "Barbell Squat"
        : isDeadlift
        ? "Deadlift"
        : "Bench Press";

      const keywords = isBench
        ? ["bench", "chest press"]
        : isSquat
        ? ["squat", "leg press"]
        : isDeadlift
        ? ["deadlift"]
        : ["*"];

      const label = isBench
        ? "Bench Press Volume"
        : isSquat
        ? "Squat Volume"
        : isDeadlift
        ? "Deadlift Volume"
        : "Total Weight Volume (reps × lbs)";

      const makeObj = (lbs: number): QuestObjectiveTemplate => ({
        id: `tonnage_${variantId}`,
        label,
        target: lbs,
        unit: "lbs",
        scope: "cumulative",
        matchKeywords: keywords,
        quickLog: {
          exerciseName: exName,
          categoryName: "Free Weights",
          amount: 1350,
          weight: 135,
          reps: 10,
          buttonLabel: "+1,350 lbs (10×135)"
        }
      });

      return {
        apprentice: {
          key: "apprentice",
          rankLabel: "Apprentice",
          badgeLabel: "25,000 lbs / 30d",
          durationDays: 30,
          restPotions: 0,
          rewardXP: 600,
          rewardTitle: "Iron Lifter",
          objectives: [makeObj(25000)]
        },
        journeyman: {
          key: "journeyman",
          rankLabel: "Journeyman",
          badgeLabel: "50,000 lbs / 30d",
          durationDays: 30,
          restPotions: 0,
          rewardXP: 1000,
          rewardTitle: "Colossus of Iron",
          objectives: [makeObj(50000)]
        },
        champion: {
          key: "champion",
          rankLabel: "Champion",
          badgeLabel: "100,000 lbs / 30d",
          durationDays: 30,
          restPotions: 0,
          rewardXP: 1600,
          rewardTitle: "Titan of Steel",
          objectives: [makeObj(100000)]
        }
      };
    }
  },

  // =========================================================================
  // 2. DAILY CONSISTENCY & PROTOCOL QUESTS (Streak-Based + Rest Potions)
  // =========================================================================
  {
    id: "saitama_protocol",
    title: "THE SAITAMA PROTOCOL",
    subtitle: "Hero Association Daily Regimen",
    lore: "Complete your daily Push-Ups, Sit-Ups, Squats, and Run every single day. Includes Rest Potions so you can recover without breaking your streak.",
    icon: "👊",
    category: "streak",
    variants: [
      { id: "sprint_7", label: "7-Day Sprint", description: "7 consecutive days (1 Rest Potion included)" },
      { id: "mastery_30", label: "30-Day Mastery", description: "30 days of discipline (4 Rest Potions included)" }
    ],
    getTiers: (variantId = "sprint_7") => {
      const is30 = variantId === "mastery_30";
      const days = is30 ? 30 : 7;
      const potions = is30 ? 4 : 1;
      const xpMult = is30 ? 2.2 : 1.0;

      const buildObjectives = (reps: number, miles: number): QuestObjectiveTemplate[] => [
        {
          id: "saitama_pushups",
          label: "Daily Push-Ups",
          target: reps,
          unit: "reps",
          scope: "daily",
          matchKeywords: ["push-up", "pushup", "push up"],
          quickLog: {
            exerciseName: "Regular Push-Ups",
            categoryName: "Bodyweight",
            amount: Math.min(25, reps),
            reps: Math.min(25, reps),
            buttonLabel: `+${Math.min(25, reps)} Push-Ups`
          }
        },
        {
          id: "saitama_situps",
          label: "Daily Sit-Ups / Crunches",
          target: reps,
          unit: "reps",
          scope: "daily",
          matchKeywords: ["sit-up", "situp", "crunch"],
          quickLog: {
            exerciseName: "Sit-Ups",
            categoryName: "Bodyweight",
            amount: Math.min(25, reps),
            reps: Math.min(25, reps),
            buttonLabel: `+${Math.min(25, reps)} Sit-Ups`
          }
        },
        {
          id: "saitama_squats",
          label: "Daily Bodyweight Squats",
          target: reps,
          unit: "reps",
          scope: "daily",
          matchKeywords: ["squat"],
          quickLog: {
            exerciseName: "Bodyweight Squats",
            categoryName: "Bodyweight",
            amount: Math.min(25, reps),
            reps: Math.min(25, reps),
            buttonLabel: `+${Math.min(25, reps)} Squats`
          }
        },
        {
          id: "saitama_run",
          label: "Daily Run / Walk",
          target: miles,
          unit: "miles",
          scope: "daily",
          matchKeywords: ["run", "jog", "walk", "treadmill"],
          quickLog: {
            exerciseName: "Outdoor Running",
            categoryName: "Cardio",
            amount: miles,
            distance: miles,
            minutes: Math.round(miles * 10),
            buttonLabel: `+${miles} Mi Run`
          }
        }
      ];

      return {
        apprentice: {
          key: "apprentice",
          rankLabel: "Class C Hero",
          badgeLabel: `25/25/25 + 2km (${days}d)`,
          durationDays: days + potions + 2,
          restPotions: potions,
          streakTargetDays: days,
          rewardXP: Math.round(700 * xpMult),
          rewardTitle: "Class C Hero",
          objectives: buildObjectives(25, 1.25)
        },
        journeyman: {
          key: "journeyman",
          rankLabel: "Class B Hero",
          badgeLabel: `50/50/50 + 5km (${days}d)`,
          durationDays: days + potions + 2,
          restPotions: potions,
          streakTargetDays: days,
          rewardXP: Math.round(1100 * xpMult),
          rewardTitle: "Class B Fist",
          objectives: buildObjectives(50, 3.1)
        },
        champion: {
          key: "champion",
          rankLabel: "Class S Hero",
          badgeLabel: `100/100/100 + 10km (${days}d)`,
          durationDays: days + potions + 2,
          restPotions: potions,
          streakTargetDays: days,
          rewardXP: Math.round(1800 * xpMult),
          rewardTitle: "Limiter Breaker",
          objectives: buildObjectives(100, 6.2)
        }
      };
    }
  },

  {
    id: "dawn_patrol",
    title: "DAWN PATROL",
    subtitle: "Morning Calibration Circuit",
    lore: "Complete a daily activation circuit of Push-Ups, Bodyweight Squats, and Plank Holds for consecutive days to lock in your morning discipline.",
    icon: "🌅",
    category: "streak",
    getTiers: () => {
      const buildCircuit = (rounds: number): QuestObjectiveTemplate[] => [
        {
          id: "dawn_pushups",
          label: `Daily Push-Ups (${rounds}×20)`,
          target: rounds * 20,
          unit: "reps",
          scope: "daily",
          matchKeywords: ["push-up", "pushup", "push up"],
          quickLog: {
            exerciseName: "Regular Push-Ups",
            categoryName: "Bodyweight",
            amount: 20,
            reps: 20,
            buttonLabel: "+20 Push-Ups (1 Rd)"
          }
        },
        {
          id: "dawn_squats",
          label: `Daily Squats (${rounds}×20)`,
          target: rounds * 20,
          unit: "reps",
          scope: "daily",
          matchKeywords: ["squat"],
          quickLog: {
            exerciseName: "Bodyweight Squats",
            categoryName: "Bodyweight",
            amount: 20,
            reps: 20,
            buttonLabel: "+20 Squats (1 Rd)"
          }
        },
        {
          id: "dawn_plank",
          label: `Daily Plank Hold (${rounds}×60s)`,
          target: rounds * 60,
          unit: "seconds",
          scope: "daily",
          matchKeywords: ["plank"],
          quickLog: {
            exerciseName: "Plank",
            categoryName: "Bodyweight",
            amount: 60,
            minutes: 1,
            seconds: 60,
            buttonLabel: "+60s Plank (1 Rd)"
          }
        }
      ];

      return {
        apprentice: {
          key: "apprentice",
          rankLabel: "Apprentice",
          badgeLabel: "1 Round / 7 Days",
          durationDays: 9,
          restPotions: 1,
          streakTargetDays: 7,
          rewardXP: 600,
          rewardTitle: "Early Riser",
          objectives: buildCircuit(1)
        },
        journeyman: {
          key: "journeyman",
          rankLabel: "Journeyman",
          badgeLabel: "2 Rounds / 14 Days",
          durationDays: 17,
          restPotions: 2,
          streakTargetDays: 14,
          rewardXP: 1000,
          rewardTitle: "Morning Vanguard",
          objectives: buildCircuit(2)
        },
        champion: {
          key: "champion",
          rankLabel: "Champion",
          badgeLabel: "3 Rounds / 14 Days",
          durationDays: 17,
          restPotions: 2,
          streakTargetDays: 14,
          rewardXP: 1400,
          rewardTitle: "Dawn Sentinel",
          objectives: buildCircuit(3)
        }
      };
    }
  },

  {
    id: "step_march_10k",
    title: "THE 10K DAILY STEP MARCH",
    subtitle: "Unbroken Endurance Streak",
    lore: "Hit your daily walking or running distance equivalent every day without breaking the chain (10,000 steps ≈ 5.0 miles of walking/running).",
    icon: "👣",
    category: "streak",
    getTiers: () => {
      const makeDailyMiles = (miles: number, stepLabel: string): QuestObjectiveTemplate => ({
        id: "daily_step_miles",
        label: `Daily Walk / Run (${stepLabel})`,
        target: miles,
        unit: "miles",
        scope: "daily",
        matchKeywords: ["walk", "run", "jog", "hike", "hiking", "treadmill"],
        quickLog: {
          exerciseName: "Walking",
          categoryName: "Cardio",
          amount: miles,
          distance: miles,
          minutes: Math.round(miles * 12),
          buttonLabel: `+${miles} Mi (${stepLabel})`
        }
      });

      return {
        apprentice: {
          key: "apprentice",
          rankLabel: "Apprentice",
          badgeLabel: "6k Steps (3 mi) × 7d",
          durationDays: 9,
          restPotions: 1,
          streakTargetDays: 7,
          rewardXP: 550,
          rewardTitle: "Steady Walker",
          objectives: [makeDailyMiles(3.0, "6k Steps")]
        },
        journeyman: {
          key: "journeyman",
          rankLabel: "Journeyman",
          badgeLabel: "8k Steps (4 mi) × 14d",
          durationDays: 17,
          restPotions: 2,
          streakTargetDays: 14,
          rewardXP: 1000,
          rewardTitle: "Road Warden",
          objectives: [makeDailyMiles(4.0, "8k Steps")]
        },
        champion: {
          key: "champion",
          rankLabel: "Champion",
          badgeLabel: "10k Steps (5 mi) × 21d",
          durationDays: 25,
          restPotions: 3,
          streakTargetDays: 21,
          rewardXP: 1600,
          rewardTitle: "Relentless Strider",
          objectives: [makeDailyMiles(5.0, "10k Steps")]
        }
      };
    }
  },

  // =========================================================================
  // 3. THEMATIC RPG & LORE-BASED QUESTS
  // =========================================================================
  {
    id: "goblin_warrens",
    title: "ESCAPE THE GOBLIN WARRENS",
    subtitle: "High-Intensity Sprint Escape",
    lore: "Torchlight flickers out behind you as warhorns echo through the tunnels. Outrun your pursuers through all-out Sprint Intervals before the cavern seals.",
    icon: "⚡",
    category: "lore",
    getTiers: () => {
      const makeObj = (sets: number): QuestObjectiveTemplate => ({
        id: "goblin_sprints",
        label: "Sprint Interval Sets / Rounds",
        target: sets,
        unit: "sets",
        scope: "cumulative",
        matchKeywords: ["sprint", "hiit", "agility"],
        quickLog: {
          exerciseName: "Sprint Intervals",
          categoryName: "Cardio",
          amount: 1,
          minutes: 2,
          distance: 0.25,
          buttonLabel: "+1 Sprint Round"
        }
      });

      return {
        apprentice: {
          key: "apprentice",
          rankLabel: "Apprentice",
          badgeLabel: "4 Sprint Rounds / 3d",
          durationDays: 3,
          restPotions: 0,
          rewardXP: 400,
          rewardTitle: "Tunnel Runner",
          objectives: [makeObj(4)]
        },
        journeyman: {
          key: "journeyman",
          rankLabel: "Journeyman",
          badgeLabel: "6 Sprint Rounds / 3d",
          durationDays: 3,
          restPotions: 0,
          rewardXP: 650,
          rewardTitle: "Warren Escapee",
          objectives: [makeObj(6)]
        },
        champion: {
          key: "champion",
          rankLabel: "Champion",
          badgeLabel: "8 Sprint Rounds / 3d",
          durationDays: 3,
          restPotions: 0,
          rewardXP: 900,
          rewardTitle: "Shadow Sprinter",
          objectives: [makeObj(8)]
        }
      };
    }
  },

  {
    id: "castle_gates",
    title: "BREACH THE CASTLE GATES",
    subtitle: "Explosive Lower-Body Siege",
    lore: "The iron portcullis stands between your party and the keep. Unleash explosive Squat Jumps, Lunges, and Calf Raises to shatter the defenses.",
    icon: "🏰",
    category: "lore",
    getTiers: () => {
      const buildSiege = (rounds: number): QuestObjectiveTemplate[] => [
        {
          id: "castle_jump_squats",
          label: `Squat Jumps / Box Jumps (${rounds}×50)`,
          target: rounds * 50,
          unit: "reps",
          scope: "cumulative",
          matchKeywords: ["squat jump", "box jump", "squat"],
          quickLog: {
            exerciseName: "Squat Jumps",
            categoryName: "Bodyweight",
            amount: 25,
            reps: 25,
            buttonLabel: "+25 Squat Jumps"
          }
        },
        {
          id: "castle_lunges",
          label: `Walking / Forward Lunges (${rounds}×50)`,
          target: rounds * 50,
          unit: "reps",
          scope: "cumulative",
          matchKeywords: ["lunge"],
          quickLog: {
            exerciseName: "Lunges",
            categoryName: "Bodyweight",
            amount: 25,
            reps: 25,
            buttonLabel: "+25 Lunges"
          }
        },
        {
          id: "castle_calves",
          label: `Calf Raises (${rounds}×50)`,
          target: rounds * 50,
          unit: "reps",
          scope: "cumulative",
          matchKeywords: ["calf"],
          quickLog: {
            exerciseName: "Bodyweight Calf Raises",
            categoryName: "Bodyweight",
            amount: 25,
            reps: 25,
            buttonLabel: "+25 Calf Raises"
          }
        }
      ];

      return {
        apprentice: {
          key: "apprentice",
          rankLabel: "Apprentice",
          badgeLabel: "1 Round (50/50/50)",
          durationDays: 7,
          restPotions: 0,
          rewardXP: 500,
          rewardTitle: "Siege Vanguard",
          objectives: buildSiege(1)
        },
        journeyman: {
          key: "journeyman",
          rankLabel: "Journeyman",
          badgeLabel: "2 Rounds (100/100/100)",
          durationDays: 7,
          restPotions: 0,
          rewardXP: 800,
          rewardTitle: "Battering Ram",
          objectives: buildSiege(2)
        },
        champion: {
          key: "champion",
          rankLabel: "Champion",
          badgeLabel: "3 Rounds (150/150/150)",
          durationDays: 7,
          restPotions: 0,
          rewardXP: 1150,
          rewardTitle: "Gatebreaker",
          objectives: buildSiege(3)
        }
      };
    }
  },

  {
    id: "mount_ordeals",
    title: "CLIMBING MOUNT ORDEALS",
    subtitle: "5-Day Vertical Ascent",
    lore: "Ascend the jagged stone steps of Mount Ordeals. Log flights on the Stairmaster, Stair Climbing, or Hiking over 5 days to reach the summit shrine.",
    icon: "⛰️",
    category: "lore",
    getTiers: () => {
      const makeObj = (flights: number): QuestObjectiveTemplate => ({
        id: "ordeals_flights",
        label: "Stair Flights Climbed",
        target: flights,
        unit: "flights",
        scope: "cumulative",
        matchKeywords: ["stair", "hike", "hiking"],
        quickLog: {
          exerciseName: "Stairmaster",
          categoryName: "Cardio",
          amount: 20,
          floors: 20,
          minutes: 10,
          buttonLabel: "+20 Flights"
        }
      });

      return {
        apprentice: {
          key: "apprentice",
          rankLabel: "Apprentice",
          badgeLabel: "40 Flights / 5d",
          durationDays: 5,
          restPotions: 0,
          rewardXP: 450,
          rewardTitle: "Crag Climber",
          objectives: [makeObj(40)]
        },
        journeyman: {
          key: "journeyman",
          rankLabel: "Journeyman",
          badgeLabel: "70 Flights / 5d",
          durationDays: 5,
          restPotions: 0,
          rewardXP: 700,
          rewardTitle: "Summit Seeker",
          objectives: [makeObj(70)]
        },
        champion: {
          key: "champion",
          rankLabel: "Champion",
          badgeLabel: "100 Flights (1,500 ft) / 5d",
          durationDays: 5,
          restPotions: 0,
          rewardXP: 1050,
          rewardTitle: "Peak Ascendant",
          objectives: [makeObj(100)]
        }
      };
    }
  },

  {
    id: "shieldbearers_stance",
    title: "THE SHIELDBEARER'S STANCE",
    subtitle: "Grip, Traps & Loaded Carries",
    lore: "Anchor the phalanx with unyielding grip and upper-back endurance. Complete heavy Shrugs, Deadlifts, or Loaded Carry sets across 7 days.",
    icon: " 🛡️",
    category: "lore",
    getTiers: () => {
      const makeObj = (sets: number): QuestObjectiveTemplate => ({
        id: "shield_sets",
        label: "Heavy Shrug / Carry / Deadlift Sets",
        target: sets,
        unit: "sets",
        scope: "cumulative",
        matchKeywords: ["shrug", "deadlift", "carry", "farmer", "row"],
        quickLog: {
          exerciseName: "Dumbbell Shrug",
          categoryName: "Free Weights",
          amount: 1,
          weight: 70,
          reps: 12,
          buttonLabel: "+1 Heavy Carry/Shrug Set"
        }
      });

      return {
        apprentice: {
          key: "apprentice",
          rankLabel: "Apprentice",
          badgeLabel: "10 Sets / 7d",
          durationDays: 7,
          restPotions: 0,
          rewardXP: 450,
          rewardTitle: "Phalanx Guard",
          objectives: [makeObj(10)]
        },
        journeyman: {
          key: "journeyman",
          rankLabel: "Journeyman",
          badgeLabel: "16 Sets / 7d",
          durationDays: 7,
          restPotions: 0,
          rewardXP: 750,
          rewardTitle: "Vanguard Bulwark",
          objectives: [makeObj(16)]
        },
        champion: {
          key: "champion",
          rankLabel: "Champion",
          badgeLabel: "24 Sets / 7d",
          durationDays: 7,
          restPotions: 0,
          rewardXP: 1050,
          rewardTitle: "Iron Shieldbearer",
          objectives: [makeObj(24)]
        }
      };
    }
  },

  // =========================================================================
  // 4. SINGLE-SESSION "BOSS BATTLE" QUESTS
  // =========================================================================
  {
    id: "murph_rite",
    title: "THE MURPH RITE",
    subtitle: "Legendary Boss Raid (For Time)",
    lore: "1-Mile Run → 100 Pull-Ups → 200 Push-Ups → 300 Squats → 1-Mile Run. Partition sets as needed and conquer all four phases within the raid window.",
    icon: "💀",
    category: "boss",
    getTiers: () => {
      const buildMurph = (miles: number, pullups: number, pushups: number, squats: number): QuestObjectiveTemplate[] => [
        {
          id: "murph_run",
          label: "Total Run Distance",
          target: miles,
          unit: "miles",
          scope: "cumulative",
          matchKeywords: ["run", "jog", "treadmill"],
          quickLog: {
            exerciseName: "Outdoor Running",
            categoryName: "Cardio",
            amount: 1,
            distance: 1,
            minutes: 9,
            buttonLabel: "+1.0 Mi Run"
          }
        },
        {
          id: "murph_pullups",
          label: "Pull-Ups",
          target: pullups,
          unit: "reps",
          scope: "cumulative",
          matchKeywords: ["pull-up", "pullup", "chin-up", "chinup"],
          quickLog: {
            exerciseName: "Overhand Pull-Ups",
            categoryName: "Bodyweight",
            amount: 10,
            reps: 10,
            buttonLabel: "+10 Pull-Ups"
          }
        },
        {
          id: "murph_pushups",
          label: "Push-Ups",
          target: pushups,
          unit: "reps",
          scope: "cumulative",
          matchKeywords: ["push-up", "pushup", "push up"],
          quickLog: {
            exerciseName: "Regular Push-Ups",
            categoryName: "Bodyweight",
            amount: 20,
            reps: 20,
            buttonLabel: "+20 Push-Ups"
          }
        },
        {
          id: "murph_squats",
          label: "Bodyweight Squats",
          target: squats,
          unit: "reps",
          scope: "cumulative",
          matchKeywords: ["squat"],
          quickLog: {
            exerciseName: "Bodyweight Squats",
            categoryName: "Bodyweight",
            amount: 30,
            reps: 30,
            buttonLabel: "+30 Squats"
          }
        }
      ];

      return {
        apprentice: {
          key: "apprentice",
          rankLabel: "Apprentice (1/4 Murph)",
          badgeLabel: "1mi / 25 / 50 / 75",
          durationDays: 2,
          restPotions: 0,
          rewardXP: 750,
          rewardTitle: "Raid Initiate",
          objectives: buildMurph(1.0, 25, 50, 75)
        },
        journeyman: {
          key: "journeyman",
          rankLabel: "Journeyman (Half Murph)",
          badgeLabel: "1mi / 50 / 100 / 150",
          durationDays: 2,
          restPotions: 0,
          rewardXP: 1250,
          rewardTitle: "Raid Veteran",
          objectives: buildMurph(1.0, 50, 100, 150)
        },
        champion: {
          key: "champion",
          rankLabel: "Champion (Full Murph)",
          badgeLabel: "2mi / 100 / 200 / 300",
          durationDays: 2,
          restPotions: 0,
          rewardXP: 2000,
          rewardTitle: "Murph Conqueror",
          objectives: buildMurph(2.0, 100, 200, 300)
        }
      };
    }
  },

  {
    id: "death_by_burpees",
    title: "DEATH BY BURPEES",
    subtitle: "EMOM Survival Boss",
    lore: "Minute 1: 1 Burpee. Minute 2: 2 Burpees. Add 1 rep every minute on the minute until failure. Reaching Minute 12 requires 78 total burpees.",
    icon: "🔥",
    category: "boss",
    getTiers: () => {
      const makeObj = (reps: number, minReached: number): QuestObjectiveTemplate => ({
        id: "emom_burpees",
        label: `EMOM Burpees (Reach Min ${minReached}+)`,
        target: reps,
        unit: "reps",
        scope: "cumulative",
        matchKeywords: ["burpee"],
        quickLog: {
          exerciseName: "Burpees",
          categoryName: "Cardio",
          amount: reps,
          reps,
          minutes: minReached,
          buttonLabel: `Log ${reps} Burpees (Min ${minReached})`
        }
      });

      return {
        apprentice: {
          key: "apprentice",
          rankLabel: "Apprentice (Min 8)",
          badgeLabel: "36 Burpees (Min 8)",
          durationDays: 2,
          restPotions: 0,
          rewardXP: 500,
          rewardTitle: "Ember Survivor",
          objectives: [makeObj(36, 8)]
        },
        journeyman: {
          key: "journeyman",
          rankLabel: "Journeyman (Min 10)",
          badgeLabel: "55 Burpees (Min 10)",
          durationDays: 2,
          restPotions: 0,
          rewardXP: 850,
          rewardTitle: "Flame Forged",
          objectives: [makeObj(55, 10)]
        },
        champion: {
          key: "champion",
          rankLabel: "Champion (Min 12+)",
          badgeLabel: "78 Burpees (Min 12+)",
          durationDays: 2,
          restPotions: 0,
          rewardXP: 1300,
          rewardTitle: "Undying Ember",
          objectives: [makeObj(78, 12)]
        }
      };
    }
  },

  {
    id: "century_burn",
    title: "THE CENTURY BURN",
    subtitle: "5-Stage Conditioning Chipper",
    lore: "Chip through 100 Jumping Jacks, 80 Squats, 60 Mountain Climbers, 40 Push-Ups, and 20 Burpees in a single relentless conditioning session.",
    icon: "💥",
    category: "boss",
    getTiers: () => {
      const buildChipper = (scale: number): QuestObjectiveTemplate[] => {
        const jj = Math.round(100 * scale);
        const sq = Math.round(80 * scale);
        const mc = Math.round(60 * scale);
        const pu = Math.round(40 * scale);
        const bp = Math.round(20 * scale);
        return [
          {
            id: "chipper_jj",
            label: "Jumping Jacks",
            target: jj,
            unit: "reps",
            scope: "cumulative",
            matchKeywords: ["jumping jack"],
            quickLog: {
              exerciseName: "Jumping Jacks",
              categoryName: "Cardio",
              amount: jj,
              reps: jj,
              minutes: 3,
              buttonLabel: `+${jj} Jumping Jacks`
            }
          },
          {
            id: "chipper_sq",
            label: "Bodyweight Squats",
            target: sq,
            unit: "reps",
            scope: "cumulative",
            matchKeywords: ["squat"],
            quickLog: {
              exerciseName: "Bodyweight Squats",
              categoryName: "Bodyweight",
              amount: sq,
              reps: sq,
              buttonLabel: `+${sq} Squats`
            }
          },
          {
            id: "chipper_mc",
            label: "Mountain Climbers",
            target: mc,
            unit: "reps",
            scope: "cumulative",
            matchKeywords: ["mountain climber"],
            quickLog: {
              exerciseName: "Mountain Climbers",
              categoryName: "Bodyweight",
              amount: mc,
              reps: mc,
              buttonLabel: `+${mc} Mtn Climbers`
            }
          },
          {
            id: "chipper_pu",
            label: "Push-Ups",
            target: pu,
            unit: "reps",
            scope: "cumulative",
            matchKeywords: ["push-up", "pushup", "push up"],
            quickLog: {
              exerciseName: "Regular Push-Ups",
              categoryName: "Bodyweight",
              amount: pu,
              reps: pu,
              buttonLabel: `+${pu} Push-Ups`
            }
          },
          {
            id: "chipper_bp",
            label: "Burpees",
            target: bp,
            unit: "reps",
            scope: "cumulative",
            matchKeywords: ["burpee"],
            quickLog: {
              exerciseName: "Burpees",
              categoryName: "Cardio",
              amount: bp,
              reps: bp,
              minutes: 3,
              buttonLabel: `+${bp} Burpees`
            }
          }
        ];
      };

      return {
        apprentice: {
          key: "apprentice",
          rankLabel: "Apprentice (Half)",
          badgeLabel: "50 / 40 / 30 / 20 / 10",
          durationDays: 2,
          restPotions: 0,
          rewardXP: 500,
          rewardTitle: "Spark Chipper",
          objectives: buildChipper(0.5)
        },
        journeyman: {
          key: "journeyman",
          rankLabel: "Journeyman (3/4)",
          badgeLabel: "75 / 60 / 45 / 30 / 15",
          durationDays: 2,
          restPotions: 0,
          rewardXP: 850,
          rewardTitle: "Blaze Chipper",
          objectives: buildChipper(0.75)
        },
        champion: {
          key: "champion",
          rankLabel: "Champion (Full)",
          badgeLabel: "100 / 80 / 60 / 40 / 20",
          durationDays: 2,
          restPotions: 0,
          rewardXP: 1300,
          rewardTitle: "Inferno Chipper",
          objectives: buildChipper(1.0)
        }
      };
    }
  },

  {
    id: "iron_core_5min",
    title: "5-MINUTE IRON CORE",
    subtitle: "Isometric Core Boss Flow",
    lore: "60s Standard Plank → 60s Right Side Plank → 60s Left Side Plank → 60s Reverse Plank → 60s Hollow Hold. Complete 300 seconds of core holds in a single session.",
    icon: "🧘",
    category: "boss",
    getTiers: () => {
      const makeObj = (sec: number): QuestObjectiveTemplate => ({
        id: "boss_core_hold",
        label: "Isometric Plank / Core Hold",
        target: sec,
        unit: "seconds",
        scope: "cumulative",
        matchKeywords: ["plank", "superman"],
        quickLog: {
          exerciseName: "Plank",
          categoryName: "Bodyweight",
          amount: 60,
          minutes: 1,
          seconds: 60,
          buttonLabel: "+60s Plank Stage"
        }
      });

      return {
        apprentice: {
          key: "apprentice",
          rankLabel: "Apprentice (2.5m)",
          badgeLabel: "150 Seconds",
          durationDays: 2,
          restPotions: 0,
          rewardXP: 450,
          rewardTitle: "Core Adept",
          objectives: [makeObj(150)]
        },
        journeyman: {
          key: "journeyman",
          rankLabel: "Journeyman (3.75m)",
          badgeLabel: "225 Seconds",
          durationDays: 2,
          restPotions: 0,
          rewardXP: 750,
          rewardTitle: "Iron Pillar",
          objectives: [makeObj(225)]
        },
        champion: {
          key: "champion",
          rankLabel: "Champion (5.0m)",
          badgeLabel: "300 Seconds",
          durationDays: 2,
          restPotions: 0,
          rewardXP: 1150,
          rewardTitle: "Unbreakable Core",
          objectives: [makeObj(300)]
        }
      };
    }
  }
];

// ---------------------------------------------------------------------------
// STORAGE HELPERS (Active Quests & Completed Quest History)
// ---------------------------------------------------------------------------

const ACTIVE_QUESTS_STORAGE_KEY = "fitquest_active_quests_v1";
const COMPLETED_QUESTS_STORAGE_KEY = "fitquest_completed_quests_v1";

export function getActiveQuests(): ActiveQuestInstance[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem(ACTIVE_QUESTS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error("Failed to load active quests", e);
    return [];
  }
}

export function saveActiveQuests(quests: ActiveQuestInstance[]): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(ACTIVE_QUESTS_STORAGE_KEY, JSON.stringify(quests));
  } catch (e) {
    console.error("Failed to save active quests", e);
  }
}

export function getCompletedQuests(): CompletedQuestRecord[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem(COMPLETED_QUESTS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error("Failed to load completed quests", e);
    return [];
  }
}

export function saveCompletedQuests(records: CompletedQuestRecord[]): void {
  if (typeof localStorage === "undefined") return;
  try {
    localStorage.setItem(COMPLETED_QUESTS_STORAGE_KEY, JSON.stringify(records));
  } catch (e) {
    console.error("Failed to save completed quests", e);
  }
}

// ---------------------------------------------------------------------------
// QUEST PROGRESS EVALUATION ENGINE
// ---------------------------------------------------------------------------

function doesLogMatchObjective(log: FitnessLog, obj: QuestObjectiveTemplate): boolean {
  const exName = (log.exerciseName || "").toLowerCase();
  if (!exName) return false;
  if (obj.matchKeywords.includes("*")) {
    return Boolean(log.weight && log.weight > 0 && log.reps && log.reps > 0);
  }
  return obj.matchKeywords.some(kw => exName.includes(kw.toLowerCase()));
}

function extractLogContribution(log: FitnessLog, unit: QuestUnit): number {
  switch (unit) {
    case "reps":
      return log.reps || 0;
    case "miles":
      if (log.distance && log.distance > 0) return log.distance;
      // Fallback if user logged cardio minutes without distance (~10 min/mile run or 15 min/mile walk)
      if (log.minutes && log.minutes > 0) {
        const name = (log.exerciseName || "").toLowerCase();
        const minsPerMile = name.includes("walk") || name.includes("hike") ? 15 : 10;
        return parseFloat((log.minutes / minsPerMile).toFixed(2));
      }
      return 0;
    case "seconds":
      return (log.minutes || 0) * 60 + (log.seconds || 0);
    case "lbs":
      return (log.weight || 0) * (log.reps || 0);
    case "flights":
      if (log.floors && log.floors > 0) return log.floors;
      if (log.minutes && log.minutes > 0) return log.minutes * 3;
      return 0;
    case "sets":
      return 1;
    case "mins":
      return (log.minutes || 0) + Math.round((log.seconds || 0) / 60);
    default:
      return 0;
  }
}

export function evaluateActiveQuests(
  activeQuests: ActiveQuestInstance[],
  logs: FitnessLog[],
  nowMs: number = Date.now()
): EvaluatedActiveQuest[] {
  const todayKey = toLocalDateKey(nowMs);

  return activeQuests
    .map((instance): EvaluatedActiveQuest | null => {
      const template = QUEST_CATALOG.find(q => q.id === instance.questId);
      if (!template) return null;

      const tiers = template.getTiers(instance.variantId);
      const tierConfig = tiers[instance.tier] || tiers.apprentice;
      const variantLabel = template.variants?.find(v => v.id === instance.variantId)?.label;

      const acceptedMs = new Date(instance.acceptedAt).getTime();
      const expiresMs = new Date(instance.expiresAt).getTime();
      const remainingMs = Math.max(0, expiresMs - nowMs);
      const daysRemaining = Math.floor(remainingMs / (1000 * 60 * 60 * 24));
      const hoursRemaining = Math.floor((remainingMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const isExpired = nowMs > expiresMs;

      // Filter logs occurring after the quest was accepted (with a 5-min grace buffer)
      const relevantLogs = logs.filter(l => {
        const t = new Date(l.timestamp).getTime();
        return !isNaN(t) && t >= acceptedMs - 5 * 60 * 1000;
      });

      const isStreakQuest = template.category === "streak";

      if (!isStreakQuest) {
        // Cumulative / Lore / Boss quest evaluation
        const evaluatedObjectives: EvaluatedObjective[] = tierConfig.objectives.map(obj => {
          let sum = instance.manualProgress?.[obj.id] || 0;
          relevantLogs.forEach(log => {
            if (doesLogMatchObjective(log, obj)) {
              sum += extractLogContribution(log, obj.unit);
            }
          });
          const roundedCurrent = obj.unit === "miles" ? parseFloat(sum.toFixed(2)) : Math.round(sum);
          const pct = Math.min(100, Math.round((roundedCurrent / obj.target) * 100));
          return {
            id: obj.id,
            label: obj.label,
            current: roundedCurrent,
            target: obj.target,
            unit: obj.unit,
            pct,
            completed: roundedCurrent >= obj.target,
            quickLog: obj.quickLog
          };
        });

        const overallPct =
          evaluatedObjectives.length > 0
            ? Math.round(evaluatedObjectives.reduce((acc, o) => acc + o.pct, 0) / evaluatedObjectives.length)
            : 0;
        const isReadyToClaim = evaluatedObjectives.every(o => o.completed);

        return {
          instance,
          template,
          tierConfig,
          variantLabel,
          objectives: evaluatedObjectives,
          overallPct,
          isReadyToClaim,
          isExpired: isExpired && !isReadyToClaim,
          daysRemaining,
          hoursRemaining,
          isStreakQuest: false,
          streakDaysCompleted: 0,
          streakTargetDays: tierConfig.durationDays,
          todayCompleted: isReadyToClaim,
          todayShielded: false
        };
      }

      // Streak quest evaluation:
      // 1) Group relevant logs by local date key YYYY-MM-DD
      const logsByDate: Record<string, FitnessLog[]> = {};
      relevantLogs.forEach(log => {
        const dk = toLocalDateKey(log.timestamp);
        if (!logsByDate[dk]) logsByDate[dk] = [];
        logsByDate[dk].push(log);
      });

      // Helper to check if a given dateKey meets all daily objectives (or is shielded)
      const isDateCompleted = (dateKey: string): boolean => {
        if (instance.shieldedDates?.includes(dateKey)) return true;
        const dayLogs = logsByDate[dateKey] || [];
        const dayManual = instance.manualDailyProgress?.[dateKey] || {};

        return tierConfig.objectives.every(obj => {
          let sum = dayManual[obj.id] || 0;
          dayLogs.forEach(l => {
            if (doesLogMatchObjective(l, obj)) {
              sum += extractLogContribution(l, obj.unit);
            }
          });
          return sum >= obj.target;
        });
      };

      // Evaluate today's daily objectives for the live UI
      const todayLogs = logsByDate[todayKey] || [];
      const todayManual = instance.manualDailyProgress?.[todayKey] || {};
      const todayShielded = Boolean(instance.shieldedDates?.includes(todayKey));

      const evaluatedObjectives: EvaluatedObjective[] = tierConfig.objectives.map(obj => {
        let sum = todayManual[obj.id] || 0;
        todayLogs.forEach(log => {
          if (doesLogMatchObjective(log, obj)) {
            sum += extractLogContribution(log, obj.unit);
          }
        });
        if (todayShielded) {
          sum = Math.max(sum, obj.target);
        }
        const roundedCurrent = obj.unit === "miles" ? parseFloat(sum.toFixed(2)) : Math.round(sum);
        const pct = Math.min(100, Math.round((roundedCurrent / obj.target) * 100));
        return {
          id: obj.id,
          label: obj.label,
          current: roundedCurrent,
          target: obj.target,
          unit: obj.unit,
          pct,
          completed: roundedCurrent >= obj.target,
          quickLog: obj.quickLog
        };
      });

      // Count total completed/shielded days from acceptance date up to today
      const candidateDates = new Set<string>([
        ...Object.keys(logsByDate),
        ...(instance.shieldedDates || []),
        ...Object.keys(instance.manualDailyProgress || {}),
        todayKey
      ]);

      let streakDaysCompleted = 0;
      candidateDates.forEach(dk => {
        if (isDateCompleted(dk)) {
          streakDaysCompleted += 1;
        }
      });

      const streakTargetDays = tierConfig.streakTargetDays || tierConfig.durationDays;
      const todayCompleted = evaluatedObjectives.every(o => o.completed);
      const overallPct = Math.min(100, Math.round((streakDaysCompleted / streakTargetDays) * 100));
      const isReadyToClaim = streakDaysCompleted >= streakTargetDays;

      return {
        instance,
        template,
        tierConfig,
        variantLabel,
        objectives: evaluatedObjectives,
        overallPct,
        isReadyToClaim,
        isExpired: isExpired && !isReadyToClaim,
        daysRemaining,
        hoursRemaining,
        isStreakQuest: true,
        streakDaysCompleted,
        streakTargetDays,
        todayCompleted,
        todayShielded
      };
    })
    .filter((item): item is EvaluatedActiveQuest => item !== null);
}

// ---------------------------------------------------------------------------
// LEGACY DAILY QUESTS & LIFETIME ACHIEVEMENTS
// ---------------------------------------------------------------------------

export interface DailyQuest {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  unit: string;
  completed: boolean;
  rewardXP: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  current: number;
  target: number;
  unit: string;
  unlocked: boolean;
  category: "milestone" | "strength" | "stamina" | "mastery";
}

export function getDailyQuests(logs: FitnessLog[]): DailyQuest[] {
  const now = new Date();
  const todayYear = now.getFullYear();
  const todayMonth = now.getMonth();
  const todayDate = now.getDate();

  const todayLogs = logs.filter(log => {
    const d = new Date(log.timestamp);
    return (
      d.getFullYear() === todayYear &&
      d.getMonth() === todayMonth &&
      d.getDate() === todayDate
    );
  });

  let todayPushupReps = 0;
  let todayCardioMinutes = 0;
  const todayTotalSets = todayLogs.length;

  todayLogs.forEach(log => {
    const exName = (log.exerciseName || "").toLowerCase();
    if (exName.includes("pushup") || exName.includes("push-up") || exName.includes("push up")) {
      todayPushupReps += log.reps || 0;
    }
    if (log.minutes) {
      todayCardioMinutes += log.minutes;
    }
  });

  return [
    {
      id: "quest_pushups",
      title: "DAILY QUEST I: PUSH DISCIPLINE",
      description: "Log pushups or push sets today",
      target: 30,
      current: Math.min(30, todayPushupReps > 0 ? todayPushupReps : (todayLogs.filter(l => (l.exerciseName || "").toLowerCase().includes("press") || (l.exerciseName || "").toLowerCase().includes("push")).length * 10)),
      unit: "reps",
      completed: (todayPushupReps >= 30) || (todayLogs.filter(l => (l.exerciseName || "").toLowerCase().includes("press") || (l.exerciseName || "").toLowerCase().includes("push")).length >= 3),
      rewardXP: 150
    },
    {
      id: "quest_cardio",
      title: "DAILY QUEST II: STAMINA CONDITIONING",
      description: "Complete cardio or conditioning duration today",
      target: 15,
      current: Math.min(15, todayCardioMinutes),
      unit: "mins",
      completed: todayCardioMinutes >= 15,
      rewardXP: 200
    },
    {
      id: "quest_sets",
      title: "DAILY QUEST III: HEAVY TRAINING",
      description: "Log at least 3 total sets of any workout today",
      target: 3,
      current: Math.min(3, todayTotalSets),
      unit: "sets",
      completed: todayTotalSets >= 3,
      rewardXP: 100
    }
  ];
}

export function getAchievements(logs: FitnessLog[], profile: AthleteProfile | null): Achievement[] {
  let totalPushups = 0;
  let totalMiles = 0;
  let totalVolumeLbs = 0;
  let totalSets = 0;

  logs.forEach(log => {
    if (!log.exerciseName) return;
    totalSets += 1;
    const nameLower = log.exerciseName.toLowerCase();

    if (nameLower.includes("pushup") || nameLower.includes("push-up") || nameLower.includes("push up")) {
      totalPushups += log.reps || 0;
    }
    if (log.distance) {
      totalMiles += log.distance;
    }
    if (log.weight && log.reps) {
      totalVolumeLbs += log.weight * log.reps;
    }
  });

  const statsList = [
    profile?.chestStrength || 0,
    profile?.backStrength || 0,
    profile?.armStrength || 0,
    profile?.legStrength || 0,
    profile?.coreStrength || 0,
    profile?.cardio || profile?.speed || profile?.stamina || 0
  ];
  const maxStatLevel = Math.max(0, ...statsList);

  const uniqueDates = Array.from(
    new Set(
      logs.map(log => {
        const d = new Date(log.timestamp);
        return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}-${d.getDate().toString().padStart(2, "0")}`;
      })
    )
  ).sort();

  let maxStreak = 0;
  let currentStreak = 0;
  let lastDate: Date | null = null;

  uniqueDates.forEach(dateStr => {
    const d = new Date(dateStr);
    if (!lastDate) {
      currentStreak = 1;
    } else {
      const diffDays = Math.round((d.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));
      if (diffDays === 1) {
        currentStreak += 1;
      } else {
        currentStreak = 1;
      }
    }
    if (currentStreak > maxStreak) maxStreak = currentStreak;
    lastDate = d;
  });

  let hasCustomRoutine = false;
  if (typeof window !== "undefined" && window.localStorage) {
    const rawRoutines = localStorage.getItem("fitquest_custom_routines");
    if (rawRoutines) {
      try {
        const parsed = JSON.parse(rawRoutines);
        if (Array.isArray(parsed) && parsed.length > 0) {
          hasCustomRoutine = true;
        }
      } catch (e) {
        // ignore
      }
    }
  }

  return [
    {
      id: "ach_pushups_100",
      title: "CENTURY PUSHUP CLUB",
      description: "Complete a cumulative total of 100 Pushups",
      icon: "💪",
      current: totalPushups,
      target: 100,
      unit: "reps",
      unlocked: totalPushups >= 100,
      category: "strength"
    },
    {
      id: "ach_miles_100",
      title: "CENTURY MILES MARATHON",
      description: "Log a cumulative total of 100 Miles (Run / Hike / Walk)",
      icon: "🏃",
      current: parseFloat(totalMiles.toFixed(1)),
      target: 100,
      unit: "miles",
      unlocked: totalMiles >= 100,
      category: "stamina"
    },
    {
      id: "ach_volume_100k",
      title: "100K STEEL TONNAGE",
      description: "Lift a cumulative total of 100,000 lbs in weight workouts",
      icon: "⚡",
      current: Math.round(totalVolumeLbs),
      target: 100000,
      unit: "lbs",
      unlocked: totalVolumeLbs >= 100000,
      category: "strength"
    },
    {
      id: "ach_rank_e",
      title: "RANK E HUNTER",
      description: "Reach Level 10 in any physical stat category",
      icon: "👑",
      current: Math.min(10, Math.floor(maxStatLevel)),
      target: 10,
      unit: "lvl",
      unlocked: maxStatLevel >= 10,
      category: "milestone"
    },
    {
      id: "ach_rank_s",
      title: "RANK S HUNTER",
      description: "Reach Level 50 in any physical stat category",
      icon: "🏆",
      current: Math.min(50, Math.floor(maxStatLevel)),
      target: 50,
      unit: "lvl",
      unlocked: maxStatLevel >= 50,
      category: "mastery"
    },
    {
      id: "ach_streak_3",
      title: "CONSISTENCY STREAK",
      description: "Log workouts on 3 consecutive days",
      icon: "🔥",
      current: Math.min(3, maxStreak),
      target: 3,
      unit: "days",
      unlocked: maxStreak >= 3,
      category: "milestone"
    },
    {
      id: "ach_routine_architect",
      title: "ROUTINE ARCHITECT",
      description: "Create and save a custom workout routine",
      icon: "📋",
      current: hasCustomRoutine ? 1 : 0,
      target: 1,
      unit: "routine",
      unlocked: hasCustomRoutine,
      category: "mastery"
    },
    {
      id: "ach_50_sets",
      title: "VETERAN ATHLETE",
      description: "Log a cumulative total of 50 workout sets",
      icon: "🛡️",
      current: Math.min(50, totalSets),
      target: 50,
      unit: "sets",
      unlocked: totalSets >= 50,
      category: "milestone"
    }
  ];
}
