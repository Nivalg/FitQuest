import { FitnessLog, AthleteProfile } from "../types";

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

/**
 * Calculates daily quest progress for today's date based on workout logs.
 */
export function getDailyQuests(logs: FitnessLog[]): DailyQuest[] {
  const now = new Date();
  const todayYear = now.getFullYear();
  const todayMonth = now.getMonth();
  const todayDate = now.getDate();

  // Filter logs for today
  const todayLogs = logs.filter(log => {
    const d = new Date(log.timestamp);
    return (
      d.getFullYear() === todayYear &&
      d.getMonth() === todayMonth &&
      d.getDate() === todayDate
    );
  });

  // Calculate metrics for today
  let todayPushupReps = 0;
  let todayCardioMinutes = 0;
  let todayTotalSets = todayLogs.length;

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

/**
 * Calculates lifetime cumulative achievements from workout logs and profile stats.
 */
export function getAchievements(logs: FitnessLog[], profile: AthleteProfile | null): Achievement[] {
  let totalPushups = 0;
  let totalMiles = 0;
  let totalVolumeLbs = 0;
  let totalSets = 0;

  logs.forEach(log => {
    if (!log.exerciseName) return;
    totalSets += 1;
    const nameLower = log.exerciseName.toLowerCase();

    // Pushups count
    if (nameLower.includes("pushup") || nameLower.includes("push-up") || nameLower.includes("push up")) {
      totalPushups += log.reps || 0;
    }

    // Miles count
    if (log.distance) {
      totalMiles += log.distance;
    }

    // Weight tonnage count
    if (log.weight && log.reps) {
      totalVolumeLbs += log.weight * log.reps;
    }
  });

  // Calculate highest stat level
  const statsList = [
    profile?.chestStrength || 0,
    profile?.backStrength || 0,
    profile?.armStrength || 0,
    profile?.legStrength || 0,
    profile?.coreStrength || 0,
    profile?.cardio || profile?.speed || profile?.stamina || 0
  ];
  const maxStatLevel = Math.max(0, ...statsList);

  // Consecutive day streak calculation
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

  // Custom routines created count
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
