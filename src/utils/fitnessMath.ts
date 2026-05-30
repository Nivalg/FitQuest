import { FitnessLog } from "../types";

export interface StatLevels {
  chestStrength: number;
  backStrength: number;
  armStrength: number;
  legStrength: number;
  coreStrength: number;
  speed: number;
  stamina: number;
  cardioStamina?: number; // fallback compatibility
}

export interface LogMetrics {
  weight?: number;
  reps?: number;
  minutes?: number;
  seconds?: number;
  distance?: number;
  floors?: number;
}

export interface ExerciseConfig {
  name: string;
  formType: "A" | "B" | "C" | "D" | "E";
  baseline: number;
  peak: number;
  builds: {
    chestStrength?: number;
    backStrength?: number;
    armStrength?: number;
    legStrength?: number;
    coreStrength?: number;
    speed?: number;
    stamina?: number;
  };
}

// Master definition of the 35 exercises and precise stat percentages
export const EXERCISE_CONFIGS: ExerciseConfig[] = [
  // 1. FREE WEIGHTS
  {
    name: "Bench Press",
    formType: "A",
    baseline: 45,
    peak: 400,
    builds: { chestStrength: 80, armStrength: 20 }
  },
  {
    name: "Incline Dumbbell Press",
    formType: "A",
    baseline: 20,
    peak: 200,
    builds: { chestStrength: 70, armStrength: 30 }
  },
  {
    name: "Barbell Squat",
    formType: "A",
    baseline: 45,
    peak: 600,
    builds: { legStrength: 100 }
  },
  {
    name: "Deadlift",
    formType: "A",
    baseline: 45,
    peak: 600,
    builds: { backStrength: 60, legStrength: 40 }
  },
  {
    name: "Barbell Row",
    formType: "A",
    baseline: 45,
    peak: 300,
    builds: { backStrength: 80, armStrength: 20 }
  },
  {
    name: "Romanian Deadlift",
    formType: "A",
    baseline: 45,
    peak: 500,
    builds: { legStrength: 70, backStrength: 30 }
  },
  {
    name: "Overhead Press",
    formType: "A",
    baseline: 45,
    peak: 250,
    builds: { armStrength: 100 }
  },
  {
    name: "Barbell Bicep Curl",
    formType: "A",
    baseline: 20,
    peak: 180,
    builds: { armStrength: 100 }
  },
  {
    name: "Kettlebell Swings",
    formType: "A",
    baseline: 15,
    peak: 150,
    builds: { legStrength: 50, backStrength: 30, speed: 20 }
  },

  // 2. MACHINES
  {
    name: "Chest Fly Machine",
    formType: "A",
    baseline: 20,
    peak: 250,
    builds: { chestStrength: 70, stamina: 30 }
  },
  {
    name: "Cable Crossover",
    formType: "A",
    baseline: 10,
    peak: 150,
    builds: { chestStrength: 80, stamina: 20 }
  },
  {
    name: "Lat Pulldown Machine",
    formType: "A",
    baseline: 30,
    peak: 250,
    builds: { backStrength: 50, stamina: 50 }
  },
  {
    name: "Seated Cable Row",
    formType: "A",
    baseline: 30,
    peak: 250,
    builds: { backStrength: 70, stamina: 30 }
  },
  {
    name: "Leg Press Machine",
    formType: "A",
    baseline: 90,
    peak: 1000,
    builds: { legStrength: 50, stamina: 50 }
  },
  {
    name: "Leg Curl Machine",
    formType: "A",
    baseline: 20,
    peak: 200,
    builds: { legStrength: 80, stamina: 20 }
  },
  {
    name: "Cable Tricep Pushdown",
    formType: "A",
    baseline: 10,
    peak: 155,
    builds: { armStrength: 80, stamina: 20 }
  },
  {
    name: "Cable Bicep Curl",
    formType: "A",
    baseline: 15,
    peak: 150,
    builds: { stamina: 70, armStrength: 30 }
  },
  {
    name: "Cable Crunch",
    formType: "A",
    baseline: 20,
    peak: 200,
    builds: { coreStrength: 80, stamina: 20 }
  },

  // 3. BODYWEIGHT
  {
    name: "Regular Push-Ups",
    formType: "B",
    baseline: 3,
    peak: 100,
    builds: { stamina: 70, chestStrength: 30 }
  },
  {
    name: "Dips",
    formType: "B",
    baseline: 3,
    peak: 50,
    builds: { armStrength: 50, stamina: 30, chestStrength: 20 }
  },
  {
    name: "Regular Pull-Ups",
    formType: "B",
    baseline: 1,
    peak: 40,
    builds: { stamina: 60, backStrength: 40 }
  },
  {
    name: "Inverted Rows",
    formType: "B",
    baseline: 3,
    peak: 60,
    builds: { backStrength: 70, stamina: 30 }
  },
  {
    name: "Bodyweight Squats",
    formType: "B",
    baseline: 10,
    peak: 150,
    builds: { stamina: 70, legStrength: 30 }
  },
  {
    name: "Chin-Ups",
    formType: "B",
    baseline: 1,
    peak: 40,
    builds: { backStrength: 50, armStrength: 50 }
  },
  {
    name: "Hanging Knee Raises",
    formType: "B",
    baseline: 3,
    peak: 60,
    builds: { coreStrength: 80, stamina: 20 }
  },
  {
    name: "Plank",
    formType: "C",
    baseline: 30,
    peak: 480,
    builds: { coreStrength: 80, stamina: 20 }
  },
  {
    name: "Sit-Ups",
    formType: "B",
    baseline: 3,
    peak: 100,
    builds: { coreStrength: 60, stamina: 40 }
  },
  {
    name: "Ab Wheel Rollout",
    formType: "B",
    baseline: 3,
    peak: 50,
    builds: { coreStrength: 90, stamina: 10 }
  },
  {
    name: "Decline Crunch",
    formType: "B",
    baseline: 3,
    peak: 80,
    builds: { coreStrength: 70, stamina: 30 }
  },
  {
    name: "Agility Ladder Drills",
    formType: "B",
    baseline: 10,
    peak: 150,
    builds: { speed: 60, stamina: 40 }
  },
  {
    name: "Box Jumps",
    formType: "B",
    baseline: 3,
    peak: 100,
    builds: { legStrength: 50, speed: 50 }
  },

  // 4. CARDIO
  {
    name: "Treadmill Run / Jog",
    formType: "D",
    baseline: 4.615,
    peak: 13.333,
    builds: { stamina: 100 }
  },
  {
    name: "Sprint Intervals",
    formType: "D",
    baseline: 4.615,
    peak: 13.333,
    builds: { stamina: 70, legStrength: 30 }
  },
  {
    name: "Stairmaster",
    formType: "E",
    baseline: 10,
    peak: 150,
    builds: { stamina: 60, legStrength: 40 }
  },
  {
    name: "Jump Rope",
    formType: "C",
    baseline: 30,
    peak: 600,
    builds: { stamina: 80, speed: 20 }
  }
];

// Algorithmic anchors representing average (score = 50) and elite (score = 100) real-world thresholds
export const SCALING_ANCHORS: Record<string, { type: "weightRatio" | "reps" | "seconds" | "paceSeconds" | "distanceVolume" | "floors"; avg: number; elite: number }> = {
  "Bench Press": { type: "weightRatio", avg: 1.0, elite: 1.75 },
  "Incline Dumbbell Press": { type: "weightRatio", avg: 0.6, elite: 1.1 },
  "Barbell Squat": { type: "weightRatio", avg: 1.25, elite: 2.25 },
  "Deadlift": { type: "weightRatio", avg: 1.5, elite: 2.5 },
  "Barbell Row": { type: "weightRatio", avg: 0.8, elite: 1.4 },
  "Romanian Deadlift": { type: "weightRatio", avg: 1.1, elite: 2.0 },
  "Overhead Press": { type: "weightRatio", avg: 0.65, elite: 1.1 },
  "Barbell Bicep Curl": { type: "weightRatio", avg: 0.45, elite: 0.85 },
  "Kettlebell Swings": { type: "weightRatio", avg: 0.3, elite: 0.6 },
  "Chest Fly Machine": { type: "weightRatio", avg: 0.8, elite: 1.5 },
  "Cable Crossover": { type: "weightRatio", avg: 0.35, elite: 0.7 },
  "Lat Pulldown Machine": { type: "weightRatio", avg: 0.85, elite: 1.4 },
  "Seated Cable Row": { type: "weightRatio", avg: 0.9, elite: 1.5 },
  "Leg Press Machine": { type: "weightRatio", avg: 2.5, elite: 5.0 },
  "Leg Curl Machine": { type: "weightRatio", avg: 0.5, elite: 0.9 },
  "Cable Tricep Pushdown": { type: "weightRatio", avg: 0.5, elite: 0.95 },
  "Cable Bicep Curl": { type: "weightRatio", avg: 0.4, elite: 0.8 },
  "Cable Crunch": { type: "weightRatio", avg: 0.6, elite: 1.2 },
  "Regular Push-Ups": { type: "reps", avg: 25, elite: 60 },
  "Dips": { type: "reps", avg: 12, elite: 35 },
  "Regular Pull-Ups": { type: "reps", avg: 8, elite: 22 },
  "Inverted Rows": { type: "reps", avg: 15, elite: 40 },
  "Bodyweight Squats": { type: "reps", avg: 40, elite: 100 },
  "Chin-Ups": { type: "reps", avg: 9, elite: 24 },
  "Hanging Knee Raises": { type: "reps", avg: 15, elite: 35 },
  "Sit-Ups": { type: "reps", avg: 30, elite: 75 },
  "Ab Wheel Rollout": { type: "reps", avg: 10, elite: 30 },
  "Decline Crunch": { type: "reps", avg: 20, elite: 50 },
  "Agility Ladder Drills": { type: "reps", avg: 4, elite: 10 },
  "Box Jumps": { type: "reps", avg: 10, elite: 30 },
  "Plank": { type: "seconds", avg: 120, elite: 300 },
  "Treadmill Run / Jog": { type: "paceSeconds", avg: 540, elite: 330 }, 
  "Sprint Intervals": { type: "distanceVolume", avg: 0.25, elite: 1.0 },
  "Stairmaster": { type: "floors", avg: 40, elite: 120 },
  "Jump Rope": { type: "seconds", avg: 180, elite: 600 }
};

export function getExerciseConfig(name: string): ExerciseConfig | undefined {
  const norm = (name || "").toLowerCase().trim();
  if (!norm) return undefined;

  return EXERCISE_CONFIGS.find(conf => {
    const configNameLower = conf.name.toLowerCase();
    return configNameLower === norm || 
           configNameLower.includes(norm) || 
           norm.includes(configNameLower);
  });
}

/**
 * Extracts numeric metrics of a fitness log safely
 */
export function parseLogMetrics(log: FitnessLog): LogMetrics {
  const metrics: LogMetrics = {};
  
  if (log.weight !== undefined) metrics.weight = Number(log.weight);
  if (log.reps !== undefined) metrics.reps = Number(log.reps);
  if (log.minutes !== undefined) metrics.minutes = Number(log.minutes);
  if (log.seconds !== undefined) metrics.seconds = Number(log.seconds);
  if (log.distance !== undefined) metrics.distance = Number(log.distance);
  if (log.floors !== undefined) metrics.floors = Number(log.floors);
  
  if (Object.keys(metrics).some(k => metrics[k as keyof LogMetrics] !== undefined && !isNaN(metrics[k as keyof LogMetrics] as number))) {
    return metrics;
  }

  // Backup regex parsing
  const valStr = log.newValue || "";
  
  const weightMatch = valStr.match(/(\d+)\s*reps\s*@\s*(\d+)\s*lbs/i);
  if (weightMatch) {
    metrics.reps = parseInt(weightMatch[1]) || 1;
    metrics.weight = parseInt(weightMatch[2]) || 0;
    return metrics;
  }
  
  const distMatch = valStr.match(/([\d.]+)\s*miles\s*in\s*(\d+)m\s*(\d+)s/i);
  if (distMatch) {
    metrics.distance = parseFloat(distMatch[1]) || 0;
    metrics.minutes = parseInt(distMatch[2]) || 0;
    metrics.seconds = parseInt(distMatch[3]) || 0;
    return metrics;
  }

  const holdMatch = valStr.match(/(\d+)m\s*(\d+)s\s*hold/i);
  if (holdMatch) {
    metrics.minutes = parseInt(holdMatch[1]) || 0;
    metrics.seconds = parseInt(holdMatch[2]) || 0;
    return metrics;
  }

  const floorMatch = valStr.match(/(\d+)\s*floors\s*in\s*(\d+)\s*mins/i);
  if (floorMatch) {
    metrics.floors = parseInt(floorMatch[1]) || 0;
    metrics.minutes = parseInt(floorMatch[2]) || 0;
    return metrics;
  }

  const repsMatch = valStr.match(/(\d+)\s*reps/i);
  if (repsMatch) {
    metrics.reps = parseInt(repsMatch[1]) || 1;
  }

  return metrics;
}

export function getSessionSetCount(log: FitnessLog, allLogs: FitnessLog[]): number {
  if (!log.exerciseName) return 1;

  const logDateStr = new Date(log.timestamp).toLocaleDateString();
  const conf = getExerciseConfig(log.exerciseName);
  const resolvedName = conf ? conf.name : log.exerciseName.trim();

  // Find all logs of the same exercise logged on the same calendar day
  const sameDayLogs = allLogs
    .filter(l => {
      if (!l.exerciseName) return false;
      const c = getExerciseConfig(l.exerciseName);
      const name = c ? c.name : l.exerciseName.trim();
      return name === resolvedName && new Date(l.timestamp).toLocaleDateString() === logDateStr;
    })
    // Sort chronologically by timestamp
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  // Find the 1-based index of this specific log
  const index = sameDayLogs.findIndex(l => l.id === log.id);
  return index !== -1 ? index + 1 : 1;
}

/**
 * Core dynamic JavaScript score processor translating logged workouts to uncapped stat values
 */
export function calculateScoreFromLog(log: FitnessLog, bodyWeight: number = 175): number {
  if (!log.exerciseName) return 0;
  
  const conf = getExerciseConfig(log.exerciseName);
  const resolvedName = conf ? conf.name : log.exerciseName.trim();
  const anchor = SCALING_ANCHORS[resolvedName];
  if (!anchor) return 0;

  const m = parseLogMetrics(log);
  let score = 0;
  
  if (anchor.type === "weightRatio") {
    const weight = m.weight || 0;
    const reps = m.reps || 0;
    if (weight <= 0) return 0;
    // 1RM Epley Estimation
    const estimated1RM = reps <= 1 ? weight : weight * (1 + reps / 30);
    const ratio = estimated1RM / bodyWeight;
    score = ((ratio - anchor.avg) / (anchor.elite - anchor.avg)) * 50 + 50;
  }
  else if (anchor.type === "reps") {
    const reps = m.reps || 0;
    if (reps <= 0) return 0;
    score = ((reps - anchor.avg) / (anchor.elite - anchor.avg)) * 50 + 50;
  }
  else if (anchor.type === "seconds") {
    const mins = m.minutes || 0;
    const secs = m.seconds || 0;
    const inputSeconds = mins * 60 + secs;
    if (inputSeconds <= 0) return 0;
    score = ((inputSeconds - anchor.avg) / (anchor.elite - anchor.avg)) * 50 + 50;
  }
  else if (anchor.type === "paceSeconds") {
    const mins = m.minutes || 0;
    const secs = m.seconds || 0;
    const dist = m.distance || 0;
    const totalSeconds = mins * 60 + secs;
    if (dist <= 0 || totalSeconds <= 0) return 0;
    const inputPaceSeconds = totalSeconds / dist;
    // Lower pace seconds is better performance
    score = ((anchor.avg - inputPaceSeconds) / (anchor.avg - anchor.elite)) * 50 + 50;
  }
  else if (anchor.type === "distanceVolume") {
    const dist = m.distance || 0;
    if (dist <= 0) return 0;
    score = ((dist - anchor.avg) / (anchor.elite - anchor.avg)) * 50 + 50;
  }
  else if (anchor.type === "floors") {
    const floors = m.floors || 0;
    if (floors <= 0) return 0;
    score = ((floors - anchor.avg) / (anchor.elite - anchor.avg)) * 50 + 50;
  }

  // Graceful minimum floor at 0.00 (Uncapped past 100 for elite players!)
  return Math.max(0.00, parseFloat(score.toFixed(2)));
}

/**
 * Combined Complete Stateless Evaluation Engine
 */
export interface DerivedPerformance {
  statLevels: StatLevels;
  statXps: Record<string, number>;
  weeklyVolume: Record<string, number>;
  recoveryRemaining: Record<string, number>;
  logEvaluations: Record<string, {
    isWorkingSet: boolean;
    ratio: number;
    volumePower: number;
    score: number;
    allTimePR: number;
  }>;
  exerciseDetails: Record<string, {
    allTimePR: number;
    peakLevel: number;
    effectiveLevel: number;
    daysSinceLastLog: number;
    isAtrophying: boolean;
    lastLogDate: string | null;
  }>;
}

export function evaluateAthletePerformance(logs: FitnessLog[], bodyWeight: number = 175): DerivedPerformance {
  const now = Date.now();
  const evaluation: DerivedPerformance = {
    statLevels: {
      chestStrength: 0.00,
      backStrength: 0.00,
      armStrength: 0.00,
      legStrength: 0.00,
      coreStrength: 0.00,
      speed: 0.00,
      stamina: 0.00,
      cardioStamina: 0.00
    },
    statXps: {
      chestStrength: 0,
      backStrength: 0,
      armStrength: 0,
      legStrength: 0,
      coreStrength: 0,
      speed: 0,
      stamina: 0,
      cardioStamina: 0
    },
    weeklyVolume: {
      chestStrength: 0,
      backStrength: 0,
      armStrength: 0,
      legStrength: 0,
      coreStrength: 0,
      speed: 0,
      stamina: 0
    },
    recoveryRemaining: {
      chestStrength: 0,
      backStrength: 0,
      armStrength: 0,
      legStrength: 0,
      coreStrength: 0,
      speed: 0,
      stamina: 0
    },
    logEvaluations: {},
    exerciseDetails: {}
  };

  // 1. Group logs by exercise to calculate All-time PR first
  const exerciseLogs: Record<string, FitnessLog[]> = {};
  logs.forEach(log => {
    if (!log.exerciseName) return;
    const conf = getExerciseConfig(log.exerciseName);
    const resolvedName = conf ? conf.name : log.exerciseName.trim();
    if (!exerciseLogs[resolvedName]) {
      exerciseLogs[resolvedName] = [];
    }
    exerciseLogs[resolvedName].push(log);
  });

  const prByExercise: Record<string, number> = {};
  logs.forEach(log => {
    if (!log.exerciseName) return;
    const score = calculateScoreFromLog(log, bodyWeight);
    const conf = getExerciseConfig(log.exerciseName);
    const resolvedName = conf ? conf.name : log.exerciseName.trim();
    prByExercise[resolvedName] = Math.max(prByExercise[resolvedName] || 0, score);
  });

  // 2. Evaluate each log's 60% working threshold & relative overload volume power
  logs.forEach(log => {
    if (!log.exerciseName) return;
    const conf = getExerciseConfig(log.exerciseName);
    const resolvedName = conf ? conf.name : log.exerciseName.trim();
    
    const score = calculateScoreFromLog(log, bodyWeight);
    const pr = prByExercise[resolvedName] || 0;
    const ratio = pr > 0 ? (score / pr) : 1.0;
    
    // Threshold is 60% of peak historical capacity
    const isWorkingSet = ratio >= 0.60 || pr === 0;
    let volumePower = 0.0;
    if (isWorkingSet) {
      if (ratio >= 1.0) {
        volumePower = Math.min(3.0, ratio); // Cap ratio output power at 3.0x max for protection
      } else {
        // Linearly scales volume from 0.2 (at 60% capacity) to 1.0 (at 100% capacity)
        volumePower = 0.2 + 0.8 * (ratio - 0.60) / 0.40;
      }
    }

    evaluation.logEvaluations[log.id] = {
      isWorkingSet,
      ratio,
      volumePower,
      score,
      allTimePR: pr
    };
  });

  // 3. For each standardized exercise, find the peak working level, last log time, and detraining atrophy
  EXERCISE_CONFIGS.forEach(config => {
    const matchedLogs = exerciseLogs[config.name] || [];
    const workingLogs = matchedLogs.filter(l => {
      const evalItem = evaluation.logEvaluations[l.id];
      return evalItem && evalItem.isWorkingSet;
    });

    if (workingLogs.length === 0) {
      evaluation.exerciseDetails[config.name] = {
        allTimePR: 0,
        peakLevel: 0.00,
        effectiveLevel: 0.00,
        daysSinceLastLog: 999,
        isAtrophying: false,
        lastLogDate: null
      };
      return;
    }

    // Find peak performance score of working sets
    let peakScore = 0;
    let newestTimestamp = 0;
    let newestDateStr = "";

    workingLogs.forEach(wl => {
      const evalItem = evaluation.logEvaluations[wl.id];
      if (evalItem) {
        if (evalItem.score > peakScore) {
          peakScore = evalItem.score;
        }
        const setTime = new Date(wl.timestamp).getTime();
        if (setTime > newestTimestamp) {
          newestTimestamp = setTime;
          newestDateStr = wl.timestamp;
        }
      }
    });

    const peakLevel = peakScore;

    // Calculate atrophy decay based on elapsed days since newest working set
    const daysElapsed = Math.max(0, (now - newestTimestamp) / (1000 * 60 * 60 * 24));
    let decayMultiplier = 1.0;
    let isAtrophying = false;

    if (daysElapsed > 14) {
      isAtrophying = true;
      if (daysElapsed >= 30) {
        decayMultiplier = 0.0;
      } else {
        decayMultiplier = 1.0 - (daysElapsed - 14) / 16.0;
      }
    }

    const effectiveLevel = peakLevel * decayMultiplier;

    evaluation.exerciseDetails[config.name] = {
      allTimePR: prByExercise[config.name] || 0,
      peakLevel,
      effectiveLevel: parseFloat(effectiveLevel.toFixed(2)),
      daysSinceLastLog: parseFloat(daysElapsed.toFixed(3)),
      isAtrophying,
      lastLogDate: newestDateStr
    };
  });

  // 4. Calculate final Stat Levels as weighted sum of exercise Effective Levels
  const statNames = ["chestStrength", "backStrength", "armStrength", "legStrength", "coreStrength", "speed", "stamina"] as const;

  statNames.forEach(stat => {
    let offsetSum = 0;
    EXERCISE_CONFIGS.forEach(config => {
      const builds = config.builds as any;
      const pct = builds[stat] || 0;
      if (pct > 0) {
        const details = evaluation.exerciseDetails[config.name];
        if (details) {
          offsetSum += details.effectiveLevel * (pct / 100);
        }
      }
    });

    const clampedLvl = Math.max(0.00, offsetSum); // Uncapped! Can scale past 100.00 infinitely!
    evaluation.statLevels[stat] = parseFloat(clampedLvl.toFixed(2));
    evaluation.statXps[stat] = Math.round(clampedLvl); // Overall whole number representation
  });

  // Assign backward compatibility cardioStamina if needed
  evaluation.statLevels.cardioStamina = evaluation.statLevels.stamina;
  evaluation.statXps.cardioStamina = evaluation.statXps.stamina;

  // 5. Calculate Weekly Stimulus Progress (Relative Overload %)
  const oneWeekMs = 7 * 24 * 60 * 60 * 1000;
  logs.forEach(log => {
    if (!log.exerciseName) return;
    const elapsedMs = now - new Date(log.timestamp).getTime();
    if (elapsedMs > oneWeekMs || elapsedMs < 0) return;

    const conf = getExerciseConfig(log.exerciseName);
    if (!conf) return;

    const evalItem = evaluation.logEvaluations[log.id];
    if (!evalItem) return;

    // Intensity ratio R is dynamically calculated against historical peak capacity
    const R = Math.max(0, Math.min(1.1, evalItem.ratio));

    // Diminishing returns volume gatekeeper based on sets logged on same day
    const currentSetNum = getSessionSetCount(log, logs);
    let volumeModifier = 1.00;
    if (currentSetNum === 1) volumeModifier = 0.10;
    else if (currentSetNum === 2) volumeModifier = 0.35;
    else if (currentSetNum === 3) volumeModifier = 0.65;
    else if (currentSetNum === 4) volumeModifier = 0.85;
    else volumeModifier = 1.00;

    // Progress scales exponentially: R^3 * 25, gated by session volume modifier
    const progress = Math.pow(R, 3) * 25 * volumeModifier;

    statNames.forEach(stat => {
      const builds = conf.builds as any;
      const pct = builds[stat] || 0;
      if (pct > 0) {
        evaluation.weeklyVolume[stat] += progress * (pct / 100);
      }
    });
  });

  // Clamp weekly volume (stimulus progress) values at 100.0% max
  statNames.forEach(stat => {
    evaluation.weeklyVolume[stat] = parseFloat(
      Math.min(100.0, evaluation.weeklyVolume[stat]).toFixed(1)
    );
  });

  // 6. Calculate 72-Hour recovery status timelines
  const seventyTwoHoursMs = 72 * 60 * 60 * 1000;
  logs.forEach(log => {
    if (!log.exerciseName) return;
    const elapsedMs = now - new Date(log.timestamp).getTime();
    if (elapsedMs > seventyTwoHoursMs || elapsedMs < 0) return;

    const conf = getExerciseConfig(log.exerciseName);
    if (!conf) return;

    const evalItem = evaluation.logEvaluations[log.id];
    if (!evalItem || !evalItem.isWorkingSet) return;

    const hoursSinceSet = elapsedMs / (1000 * 60 * 60);

    statNames.forEach(stat => {
      const builds = conf.builds as any;
      const pct = builds[stat] || 0;
      if (pct > 0) {
        // Recovery duration is proportional to percentage contribution
        const durationForSet = 72 * (pct / 100);
        const remainingForSet = Math.max(0, durationForSet - hoursSinceSet);
        evaluation.recoveryRemaining[stat] += remainingForSet; // Accumulate recovery time remaining
      }
    });
  });

  // Clamp remaining recovery hours to 72 hours max
  statNames.forEach(stat => {
    evaluation.recoveryRemaining[stat] = parseFloat(
      Math.min(72.0, evaluation.recoveryRemaining[stat]).toFixed(1)
    );
  });

  return evaluation;
}

/**
 * Retained for backwards compatibility with component imports
 */
export function getStatLevelsFromLogs(logs: FitnessLog[]): StatLevels {
  const evalResult = evaluateAthletePerformance(logs);
  return evalResult.statLevels;
}

export function formatLevel(lvl: number): string {
  const num = Number(lvl);
  return isNaN(num) ? "1.00" : num.toFixed(2);
}

export function getMetricTier(lvl: number): { name: string; color: string; bg: string; border: string; description: string } {
  const level = Number(lvl) || 1;
  if (level < 15) {
    return {
      name: "Beginner",
      color: "text-slate-400",
      bg: "bg-slate-500/10",
      border: "border-slate-500/20",
      description: "Establishing foundational metrics and raw conditioning."
    };
  }
  if (level < 40) {
    return {
      name: "Novice",
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      border: "border-blue-500/25",
      description: "Exhibiting dedicated discipline. Well above standard base."
    };
  }
  if (level < 65) {
    return {
      name: "Intermediate",
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/25",
      description: "Consistent gym devotee possessing stout athletic force."
    };
  }
  if (level < 85) {
    return {
      name: "Advanced",
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/25",
      description: "Magnificent capacities earned through tireless training."
    };
  }
  if (level < 100) {
    return {
      name: "Elite",
      color: "text-purple-400 font-bold",
      bg: "bg-purple-500/10",
      border: "border-purple-500/25",
      description: "Peak structural optimization. Competitive margins achieved."
    };
  }
  return {
    name: "Master Pro",
    color: "text-cyan-400 font-extrabold animate-pulse",
    bg: "bg-cyan-500/15",
    border: "border-cyan-500/30",
    description: "Utmost human summit. Uncapped peerless kinetic capacity!"
  };
}

export function scalePiecewise(
  x: number,
  xStart: number,
  xEnd: number,
  yStart: number,
  yEnd: number,
  exponent: number = 1.0
): number {
  if (xStart === xEnd) return yStart;
  const t = (x - xStart) / (xEnd - xStart);
  const clampedT = Math.max(0, Math.min(1, t));
  return yStart + Math.pow(clampedT, exponent) * (yEnd - yStart);
}

export function addXP(currentLevel: number, currentXP: number, xpGained: number) {
  return {
    lvlGained: 0,
    newLevel: currentLevel,
    newXP: 0
  };
}
