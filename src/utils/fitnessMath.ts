import { ExerciseInfo, ExercisePillar, FitnessLog, MuscleKey } from "../types";
import { EXERCISE_DATABASE, deriveBuildsFromMuscles, getAllExercises } from "../exercises";

export interface StatLevels {
  chestStrength: number;
  backStrength: number;
  armStrength: number;
  legStrength: number;
  coreStrength: number;
  cardio: number;
  speed?: number; // fallback compatibility
  stamina?: number; // fallback compatibility
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
  pillar: ExercisePillar;
  formType: "A" | "B" | "C" | "D" | "E" | "F";
  baseline: number;
  peak: number;
  muscles: Partial<Record<MuscleKey, number>>;
  builds: {
    chestStrength?: number;
    backStrength?: number;
    armStrength?: number;
    legStrength?: number;
    coreStrength?: number;
    cardio?: number;
    speed?: number;
    stamina?: number;
  };
  subCategories?: string[];
}

export const PROGRESS_CONFIG = {
  muscleTargets: {
    chest: 10,
    back: 12,
    core: 8,
    biceps: 6,
    triceps: 6,
    shoulders: 8,
    traps: 4,
    quads: 6,
    hamstrings: 5,
    glutes: 5,
    calves: 4
  } as Record<MuscleKey, number>,
  armRollupWeights: {
    biceps: 0.30,
    triceps: 0.30,
    shoulders: 0.30,
    traps: 0.10
  },
  legRollupWeights: {
    quads: 0.30,
    hamstrings: 0.25,
    glutes: 0.25,
    calves: 0.20
  },
  effortThresholds: {
    fullThreshold: 0.80,
    halfThreshold: 0.60,
    fullCredit: 1.0,
    halfCredit: 0.5,
    warmupCredit: 0.0,
    lookbackDays: 90
  },
  setFactors: [1.0, 1.0, 1.0, 1.0, 0.5, 0.5], // sets 1-4 = 1.0, sets 5-6 = 0.5, sets 7+ = 0
  cardioMuscleSetsPer100: 2,
  weeklyDecayDays: 7,
  monthlyDecayDays: 30
};

const BASELINE_PEAK_MAP: Record<string, { baseline: number; peak: number }> = {
  "Bench Press": { baseline: 45, peak: 400 },
  "Barbell Squat": { baseline: 45, peak: 600 },
  "Power Clean": { baseline: 45, peak: 300 },
  "Dumbbell Lunges": { baseline: 10, peak: 150 },
  "Deadlift": { baseline: 45, peak: 600 },
  "Barbell Row": { baseline: 45, peak: 300 },
  "Romanian Deadlift": { baseline: 45, peak: 500 },
  "Barbell Overhead Press": { baseline: 45, peak: 250 },
  "Barbell Bicep Curl": { baseline: 20, peak: 180 },
  "Kettlebell Swings": { baseline: 15, peak: 150 },
  "Barbell Hip Thrust": { baseline: 45, peak: 600 },
  "Dumbbell Squat": { baseline: 10, peak: 200 },
  "Stiff Leg Deadlifts": { baseline: 45, peak: 500 },
  "Barbell Calf Raises": { baseline: 45, peak: 350 },
  "Barbell Silverback Shrug": { baseline: 45, peak: 400 },
  "Dumbbell Shrug": { baseline: 10, peak: 200 },
  "Barbell Upright Row": { baseline: 45, peak: 220 },
  "Kettlebell Incline Shrugs": { baseline: 10, peak: 180 },
  "Dumbbell Seated Shrug": { baseline: 10, peak: 180 },
  "Dumbbell Preacher Curl": { baseline: 10, peak: 100 },
  "Barbell Preacher Curl": { baseline: 20, peak: 180 },
  "Hammer Curl": { baseline: 10, peak: 100 },
  "Barbell Bent Over Row": { baseline: 45, peak: 350 },
  "Dumbbell Overhead Press": { baseline: 15, peak: 120 },
  "Barbell Incline Bench": { baseline: 45, peak: 350 },
  "Dumbbell Incline Bench": { baseline: 15, peak: 120 },
  "Dumbbell Front Raise": { baseline: 5, peak: 60 },
  "Close Grip Bench Press": { baseline: 45, peak: 350 },
  "Barbell Skull Crusher": { baseline: 20, peak: 180 },
  "Dumbbell Romanian Deadlift": { baseline: 20, peak: 250 },
  "Barbell Romanian Deadlift": { baseline: 45, peak: 500 },
  "Barbell Front Squat": { baseline: 45, peak: 400 },
  "Dumbbell Russian Twist": { baseline: 5, peak: 100 },
  "Plate Russian Twist": { baseline: 10, peak: 100 },
  "Plate Sit-Ups": { baseline: 10, peak: 100 },
  "Good Mornings": { baseline: 45, peak: 300 },
  "Dumbbell Chest Fly": { baseline: 10, peak: 120 },
  "Weighted Decline Sit-Up": { baseline: 10, peak: 120 },
  "Weighted Crunch": { baseline: 10, peak: 150 },
  "Chest Fly Machine": { baseline: 20, peak: 250 },
  "Cable Pec Fly": { baseline: 10, peak: 150 },
  "Cable Crossover": { baseline: 10, peak: 150 },
  "Lat Pulldown Machine": { baseline: 30, peak: 250 },
  "Seated Cable Row": { baseline: 30, peak: 250 },
  "Machine Leg Press": { baseline: 90, peak: 1000 },
  "Machine Hamstring Curl": { baseline: 20, peak: 200 },
  "Lying Leg Curl": { baseline: 15, peak: 180 },
  "Cable Tricep Pushdown": { baseline: 10, peak: 155 },
  "Cable Bicep Curl": { baseline: 15, peak: 150 },
  "Cable Crunch": { baseline: 20, peak: 200 },
  "Machine Leg Extension": { baseline: 20, peak: 250 },
  "Hip Abduction Machine": { baseline: 20, peak: 250 },
  "Cable Pull Through": { baseline: 10, peak: 200 },
  "Machine Standing Calf Raises": { baseline: 20, peak: 300 },
  "Machine Sitting Calf Raises": { baseline: 20, peak: 250 },
  "Cable Shrug": { baseline: 10, peak: 250 },
  "Cable Lateral Raise": { baseline: 5, peak: 80 },
  "Glute Kickback": { baseline: 10, peak: 150 },
  "Smith Machine Hip Thrust": { baseline: 45, peak: 400 },
  "Smith Machine Squat": { baseline: 45, peak: 450 },
  "Hack Squat": { baseline: 45, peak: 600 },
  "Machine Chest Press": { baseline: 20, peak: 300 },
  "Smith Machine Bench Press": { baseline: 30, peak: 400 },
  "Machine Incline Press": { baseline: 20, peak: 250 },
  "Machine Assisted Pull-Up": { baseline: 10, peak: 200 },
  "Close-Grip Lat Pulldown": { baseline: 30, peak: 250 },
  "Cable Straight-Arm Pulldown": { baseline: 10, peak: 150 },
  "Machine Preacher Curl": { baseline: 10, peak: 150 },
  "Cable Overhead Tricep Extension": { baseline: 10, peak: 150 },
  "Machine Seated Dips": { baseline: 20, peak: 250 },
  "Machine Ab Crunch": { baseline: 10, peak: 200 },
  "Cable Woodchopper": { baseline: 10, peak: 150 },
  "Cable Standing Oblique Twist": { baseline: 10, peak: 120 },
  "Machine Torso Rotation": { baseline: 10, peak: 150 },
  "Machine Seated Shoulder Press": { baseline: 20, peak: 250 },
  "Machine Lateral Raise": { baseline: 10, peak: 150 },
  "Smith Machine Overhead Press": { baseline: 30, peak: 300 },
  "Back Extension": { baseline: 0, peak: 250 },
  "Regular Push-Ups": { baseline: 3, peak: 100 },
  "Dips": { baseline: 3, peak: 50 },
  "Overhand Pull-Ups": { baseline: 1, peak: 40 },
  "Inverted Rows": { baseline: 3, peak: 60 },
  "Bodyweight Squats": { baseline: 10, peak: 150 },
  "Chin-Ups": { baseline: 1, peak: 40 },
  "Hanging Knee Raises": { baseline: 3, peak: 60 },
  "Plank": { baseline: 30, peak: 480 },
  "Sit-Ups": { baseline: 3, peak: 100 },
  "Ab Wheel Rollout": { baseline: 3, peak: 50 },
  "Decline Crunch": { baseline: 3, peak: 80 },
  "Box Jumps": { baseline: 3, peak: 100 },
  "Calf Raises": { baseline: 10, peak: 150 },
  "Lunges": { baseline: 5, peak: 100 },
  "Forward Lunges": { baseline: 5, peak: 100 },
  "Bench Dips": { baseline: 3, peak: 80 },
  "Diamond Push-Ups": { baseline: 1, peak: 60 },
  "Squat Jumps": { baseline: 5, peak: 100 },
  "Bodyweight Reverse Lunge": { baseline: 5, peak: 100 },
  "Incline Push-Ups": { baseline: 3, peak: 80 },
  "Decline Push-Ups": { baseline: 3, peak: 60 },
  "Wide Grip Push-Ups": { baseline: 3, peak: 60 },
  "Chest Dips": { baseline: 1, peak: 40 },
  "Underhand Pull-Ups": { baseline: 1, peak: 40 },
  "Pull-Up Negatives": { baseline: 1, peak: 30 },
  "Superman Holds": { baseline: 10, peak: 180 },
  "Scapular Pull-Ups": { baseline: 3, peak: 50 },
  "Pike Push-Ups": { baseline: 1, peak: 40 }
};

// Master definition of exercises derived directly from EXERCISE_DATABASE
export const EXERCISE_CONFIGS: ExerciseConfig[] = EXERCISE_DATABASE.map(ex => {
  const bp = BASELINE_PEAK_MAP[ex.name] || { baseline: 0, peak: 100 };
  return {
    name: ex.name,
    pillar: ex.pillar,
    formType: ex.formType,
    baseline: bp.baseline,
    peak: bp.peak,
    muscles: ex.muscles,
    builds: ex.builds,
    subCategories: ex.subCategories
  };
});

// Algorithmic anchors representing average (score = 50) and elite (score = 100) real-world thresholds
export const SCALING_ANCHORS: Record<string, { type: "weightRatio" | "reps" | "seconds" | "paceSeconds" | "distanceVolume" | "floors"; avg: number; elite: number }> = {
  "Outdoor Running": { type: "paceSeconds", avg: 660, elite: 420 },
  "Treadmill Run / Jog": { type: "paceSeconds", avg: 660, elite: 420 },
  "Walking": { type: "paceSeconds", avg: 1200, elite: 900 },
  "Sprint Intervals": { type: "paceSeconds", avg: 480, elite: 330 },
  "Stairmaster": { type: "floors", avg: 40, elite: 120 },
  "Jump Rope": { type: "seconds", avg: 600, elite: 1800 },
  "Bicycle": { type: "paceSeconds", avg: 240, elite: 150 },
  "Outdoor Bicycle": { type: "paceSeconds", avg: 240, elite: 150 },
  "Spin Bike": { type: "seconds", avg: 600, elite: 1800 },
  "Elliptical": { type: "seconds", avg: 900, elite: 2700 },
  "Rowing Machine": { type: "seconds", avg: 600, elite: 1800 },
  "Stair Climbing": { type: "floors", avg: 40, elite: 120 },
  "HIIT Cardio Circuit": { type: "seconds", avg: 300, elite: 1200 },
  "Back Extension": { type: "weightRatio", avg: 0.3, elite: 1.0 },
  "Bench Press": { type: "weightRatio", avg: 0.9, elite: 1.9 },
  "Barbell Squat": { type: "weightRatio", avg: 1.2, elite: 2.4 },
  "Power Clean": { type: "weightRatio", avg: 0.6, elite: 1.25 },
  "Dumbbell Lunges": { type: "weightRatio", avg: 0.4, elite: 0.9 },
  "Deadlift": { type: "weightRatio", avg: 1.5, elite: 2.8 },
  "Barbell Row": { type: "weightRatio", avg: 0.8, elite: 1.4 },
  "Romanian Deadlift": { type: "weightRatio", avg: 1.1, elite: 2.0 },
  "Barbell Overhead Press": { type: "weightRatio", avg: 0.6, elite: 1.2 },
  "Barbell Bicep Curl": { type: "weightRatio", avg: 0.45, elite: 0.85 },
  "Kettlebell Swings": { type: "weightRatio", avg: 0.3, elite: 0.6 },
  "Barbell Hip Thrust": { type: "weightRatio", avg: 1.25, elite: 2.25 },
  "Dumbbell Squat": { type: "weightRatio", avg: 0.6, elite: 1.2 },
  "Stiff Leg Deadlifts": { type: "weightRatio", avg: 1.0, elite: 1.8 },
  "Barbell Calf Raises": { type: "weightRatio", avg: 0.8, elite: 1.5 },
  "Barbell Silverback Shrug": { type: "weightRatio", avg: 1.0, elite: 1.8 },
  "Dumbbell Shrug": { type: "weightRatio", avg: 0.6, elite: 1.2 },
  "Barbell Upright Row": { type: "weightRatio", avg: 0.5, elite: 1.0 },
  "Kettlebell Incline Shrugs": { type: "weightRatio", avg: 0.5, elite: 1.0 },
  "Dumbbell Seated Shrug": { type: "weightRatio", avg: 0.5, elite: 1.0 },
  "Chest Fly Machine": { type: "weightRatio", avg: 0.8, elite: 1.5 },
  "Cable Pec Fly": { type: "weightRatio", avg: 0.35, elite: 0.7 },
  "Cable Crossover": { type: "weightRatio", avg: 0.35, elite: 0.7 },
  "Lat Pulldown Machine": { type: "weightRatio", avg: 0.85, elite: 1.4 },
  "Seated Cable Row": { type: "weightRatio", avg: 0.9, elite: 1.5 },
  "Machine Leg Press": { type: "weightRatio", avg: 2.5, elite: 5.0 },
  "Machine Hamstring Curl": { type: "weightRatio", avg: 0.5, elite: 0.9 },
  "Lying Leg Curl": { type: "weightRatio", avg: 0.45, elite: 0.85 },
  "Cable Tricep Pushdown": { type: "weightRatio", avg: 0.5, elite: 0.95 },
  "Cable Bicep Curl": { type: "weightRatio", avg: 0.4, elite: 0.8 },
  "Cable Crunch": { type: "weightRatio", avg: 0.6, elite: 1.2 },
  "Machine Leg Extension": { type: "weightRatio", avg: 0.6, elite: 1.2 },
  "Hip Abduction Machine": { type: "weightRatio", avg: 0.5, elite: 1.0 },
  "Cable Pull Through": { type: "weightRatio", avg: 0.5, elite: 1.0 },
  "Glute Kickback": { type: "weightRatio", avg: 0.4, elite: 0.8 },
  "Smith Machine Hip Thrust": { type: "weightRatio", avg: 1.0, elite: 2.2 },
  "Machine Standing Calf Raises": { type: "weightRatio", avg: 0.8, elite: 1.5 },
  "Machine Sitting Calf Raises": { type: "weightRatio", avg: 0.6, elite: 1.2 },
  "Cable Shrug": { type: "weightRatio", avg: 0.6, elite: 1.2 },
  "Regular Push-Ups": { type: "reps", avg: 25, elite: 90 },
  "Dips": { type: "reps", avg: 12, elite: 35 },
  "Overhand Pull-Ups": { type: "reps", avg: 6, elite: 28 },
  "Inverted Rows": { type: "reps", avg: 15, elite: 40 },
  "Bodyweight Squats": { type: "reps", avg: 40, elite: 100 },
  "Chin-Ups": { type: "reps", avg: 9, elite: 24 },
  "Hanging Knee Raises": { type: "reps", avg: 15, elite: 35 },
  "Sit-Ups": { type: "reps", avg: 30, elite: 90 },
  "Ab Wheel Rollout": { type: "reps", avg: 10, elite: 30 },
  "Decline Crunch": { type: "reps", avg: 20, elite: 50 },
  "Agility Ladder Drills": { type: "reps", avg: 3, elite: 8 },
  "Box Jumps": { type: "reps", avg: 8, elite: 22 },
  "Calf Raises": { type: "reps", avg: 20, elite: 50 },
  "Lunges": { type: "reps", avg: 20, elite: 50 },
  "Forward Lunges": { type: "reps", avg: 20, elite: 50 },
  "Plank": { type: "seconds", avg: 90, elite: 300 },
  "Dumbbell Preacher Curl": { type: "weightRatio", avg: 0.25, elite: 0.5 },
  "Barbell Preacher Curl": { type: "weightRatio", avg: 0.35, elite: 0.7 },
  "Hammer Curl": { type: "weightRatio", avg: 0.25, elite: 0.5 },
  "Barbell Bent Over Row": { type: "weightRatio", avg: 0.7, elite: 1.3 },
  "Dumbbell Overhead Press": { type: "weightRatio", avg: 0.35, elite: 0.7 },
  "Barbell Incline Bench": { type: "weightRatio", avg: 0.8, elite: 1.5 },
  "Dumbbell Incline Bench": { type: "weightRatio", avg: 0.5, elite: 1.0 },
  "Dumbbell Front Raise": { type: "weightRatio", avg: 0.15, elite: 0.3 },
  "Close Grip Bench Press": { type: "weightRatio", avg: 0.8, elite: 1.5 },
  "Barbell Skull Crusher": { type: "weightRatio", avg: 0.3, elite: 0.6 },
  "Dumbbell Romanian Deadlift": { type: "weightRatio", avg: 0.6, elite: 1.2 },
  "Barbell Romanian Deadlift": { type: "weightRatio", avg: 1.0, elite: 1.8 },
  "Cable Lateral Raise": { type: "weightRatio", avg: 0.15, elite: 0.3 },
  "Bench Dips": { type: "reps", avg: 12, elite: 40 },
  "Diamond Push-Ups": { type: "reps", avg: 12, elite: 45 },
  "Squat Jumps": { type: "reps", avg: 12, elite: 35 },
  "Jumping Jacks": { type: "reps", avg: 50, elite: 150 },
  "Burpees": { type: "reps", avg: 10, elite: 40 },
  "Barbell Front Squat": { type: "weightRatio", avg: 0.8, elite: 1.4 },
  "Dumbbell Russian Twist": { type: "weightRatio", avg: 0.2, elite: 0.4 },
  "Plate Russian Twist": { type: "weightRatio", avg: 0.15, elite: 0.35 },
  "Plate Sit-Ups": { type: "weightRatio", avg: 0.15, elite: 0.35 },
  "Good Mornings": { type: "weightRatio", avg: 0.6, elite: 1.1 },
  "Bodyweight Reverse Lunge": { type: "reps", avg: 20, elite: 50 },
  "Dumbbell Chest Fly": { type: "weightRatio", avg: 0.45, elite: 0.9 },
  "Weighted Decline Sit-Up": { type: "weightRatio", avg: 0.2, elite: 0.5 },
  "Weighted Crunch": { type: "weightRatio", avg: 0.2, elite: 0.55 },
  "Machine Chest Press": { type: "weightRatio", avg: 0.8, elite: 1.6 },
  "Smith Machine Bench Press": { type: "weightRatio", avg: 0.9, elite: 1.7 },
  "Smith Machine Squat": { type: "weightRatio", avg: 1.1, elite: 2.0 },
  "Hack Squat": { type: "weightRatio", avg: 1.25, elite: 2.5 },
  "Machine Incline Press": { type: "weightRatio", avg: 0.7, elite: 1.4 },
  "Machine Assisted Pull-Up": { type: "weightRatio", avg: 0.5, elite: 1.1 },
  "Close-Grip Lat Pulldown": { type: "weightRatio", avg: 0.75, elite: 1.35 },
  "Cable Straight-Arm Pulldown": { type: "weightRatio", avg: 0.35, elite: 0.7 },
  "Machine Preacher Curl": { type: "weightRatio", avg: 0.35, elite: 0.7 },
  "Cable Overhead Tricep Extension": { type: "weightRatio", avg: 0.35, elite: 0.7 },
  "Machine Seated Dips": { type: "weightRatio", avg: 0.6, elite: 1.2 },
  "Machine Ab Crunch": { type: "weightRatio", avg: 0.5, elite: 1.1 },
  "Cable Woodchopper": { type: "weightRatio", avg: 0.3, elite: 0.65 },
  "Cable Standing Oblique Twist": { type: "weightRatio", avg: 0.25, elite: 0.55 },
  "Machine Torso Rotation": { type: "weightRatio", avg: 0.3, elite: 0.65 },
  "Machine Seated Shoulder Press": { type: "weightRatio", avg: 0.5, elite: 1.05 },
  "Machine Lateral Raise": { type: "weightRatio", avg: 0.25, elite: 0.55 },
  "Smith Machine Overhead Press": { type: "weightRatio", avg: 0.6, elite: 1.15 },
  "Incline Push-Ups": { type: "reps", avg: 20, elite: 55 },
  "Decline Push-Ups": { type: "reps", avg: 15, elite: 45 },
  "Wide Grip Push-Ups": { type: "reps", avg: 15, elite: 45 },
  "Chest Dips": { type: "reps", avg: 8, elite: 25 },
  "Underhand Pull-Ups": { type: "reps", avg: 8, elite: 22 },
  "Pull-Up Negatives": { type: "reps", avg: 6, elite: 18 },
  "Superman Holds": { type: "seconds", avg: 45, elite: 120 },
  "Scapular Pull-Ups": { type: "reps", avg: 10, elite: 30 },
  "Pike Push-Ups": { type: "reps", avg: 10, elite: 30 },
  "Hiking": { type: "distanceVolume", avg: 5, elite: 15 }
};

const EXERCISE_ALIASES: Record<string, string> = {
  "bench": "Bench Press",
  "lat pulldown": "Lat Pulldown Machine",
  "leg press": "Machine Leg Press",
  "barbell curl": "Barbell Bicep Curl",
  "skull crusher": "Barbell Skull Crusher",
  "dumbbell skull crushers": "Barbell Skull Crusher",
  "barbell shrug": "Barbell Silverback Shrug"
};

export function getExerciseConfig(name: string): ExerciseConfig | undefined {
  const norm = (name || "").toLowerCase().trim();
  if (!norm) return undefined;

  const exact = EXERCISE_CONFIGS.find(conf => conf.name.toLowerCase().trim() === norm);
  if (exact) return exact;

  const aliasedName = EXERCISE_ALIASES[norm];
  if (aliasedName) {
    const aliased = EXERCISE_CONFIGS.find(conf => conf.name === aliasedName);
    if (aliased) return aliased;
  }

  const customEx = getAllExercises().find(e => e.name.toLowerCase().trim() === norm);
  if (customEx) {
    return {
      name: customEx.name,
      pillar: customEx.pillar,
      formType: customEx.formType,
      baseline: 0,
      peak: 100,
      muscles: customEx.muscles || {},
      builds: customEx.builds || deriveBuildsFromMuscles(customEx.muscles || {}, customEx.pillar),
      subCategories: customEx.subCategories || (Object.keys(customEx.muscles || {}) as MuscleKey[])
    };
  }

  return EXERCISE_CONFIGS.find(conf => {
    const configNameLower = conf.name.toLowerCase();
    return configNameLower.includes(norm) || norm.includes(configNameLower);
  });
}

export function isCardioExercise(
  conf?: ExerciseConfig,
  dbEx?: ExerciseInfo,
  log?: FitnessLog
): boolean {
  if (dbEx) return dbEx.pillar === "cardio";
  if (conf) return conf.pillar === "cardio";
  if (log?.categoryName) return log.categoryName.toLowerCase().trim() === "cardio";
  return false;
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

  const timeMatch = valStr.match(/(\d+)m\s*(\d+)s/i);
  if (timeMatch) {
    metrics.minutes = parseInt(timeMatch[1]) || 0;
    metrics.seconds = parseInt(timeMatch[2]) || 0;
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

/**
 * Raw performance score for strength effort comparison (§2):
 * - Weighted lifts: Epley estimated 1RM = weight * (1 + reps / 30)
 * - Bodyweight moves: reps
 * - Holds (Plank, Superman Holds): seconds
 */
export function calculateRawStrengthScore(log: FitnessLog, conf?: ExerciseConfig): number {
  const m = parseLogMetrics(log);
  const formType = conf?.formType || "A";

  if (formType === "C") {
    const mins = m.minutes || 0;
    const secs = m.seconds || 0;
    return mins * 60 + secs;
  }

  if (formType === "B") {
    if (m.reps !== undefined && m.reps > 0) return m.reps;
    const mins = m.minutes || 0;
    const secs = m.seconds || 0;
    return mins * 60 + secs;
  }

  // Weighted lifts (formType === "A")
  const weight = m.weight || 0;
  const reps = m.reps || 0;
  if (weight > 0) {
    return weight * (1 + reps / 30);
  }
  if (reps > 0) {
    return reps;
  }
  return 0;
}

export function getSetFactor(setNumber: number): number {
  if (setNumber <= 0) return 0;
  const idx = setNumber - 1;
  return idx < PROGRESS_CONFIG.setFactors.length ? PROGRESS_CONFIG.setFactors[idx] : 0;
}

export function getEffortFactor(ratio: number): number {
  if (ratio >= PROGRESS_CONFIG.effortThresholds.fullThreshold) {
    return PROGRESS_CONFIG.effortThresholds.fullCredit;
  }
  if (ratio >= PROGRESS_CONFIG.effortThresholds.halfThreshold) {
    return PROGRESS_CONFIG.effortThresholds.halfCredit;
  }
  return PROGRESS_CONFIG.effortThresholds.warmupCredit;
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
export function calculateScoreFromLog(
  log: FitnessLog,
  bodyWeight: number = 175,
  targetStat?: string,
  gender: "male" | "female" = "male"
): number {
  if (!log.exerciseName) return 0;

  const conf = getExerciseConfig(log.exerciseName);
  const resolvedName = conf ? conf.name : log.exerciseName.trim();
  const dbEx = getAllExercises().find(e => e.name.toLowerCase() === resolvedName.toLowerCase());
  const m = parseLogMetrics(log);

  if (resolvedName === "Hiking") {
    const mins = (m.minutes || 0) + (m.seconds || 0) / 60;
    const dist = m.distance || 0;
    // Trail difficulty: 8 is moderate on a 1-10 scale (60 mins * 8 / 480 * 100 = 100%).
    // If logged from the 1-100 UI slider (> 15), map slider 50 (steep/moderate hills) -> 8.
    const rawTrail = m.weight !== undefined && m.weight > 0 ? m.weight : 8;
    const trailDifficulty = rawTrail > 15 ? (4 + (rawTrail / 50) * 4) : rawTrail;
    const timeScore = mins > 0 ? ((mins * trailDifficulty) / 480) * 100 : 0;
    const distScore = dist > 0 ? (dist / 2.5) * 100 : 0;
    const scoreVal = Math.max(timeScore, distScore);
    return Math.max(0.00, Math.min(110.00, parseFloat(scoreVal.toFixed(2))));
  }

  // Decide isCardio strictly from category/pillar (never from builds)
  const isCardioEx = isCardioExercise(conf, dbEx, log);

  if (isCardioEx) {
    const mins = m.minutes || 0;
    const secs = m.seconds || 0;
    const totalMinutes = mins + secs / 60;
    const dist = m.distance || 0;
    const floors = m.floors || 0;
    const reps = m.reps || 0;

    let timeScore = 0;
    let distScore = 0;
    let repScore = 0;

    const nameLower = resolvedName.toLowerCase();
    const is20MinCardio =
      nameLower === "jumping jacks" ||
      nameLower === "burpees" ||
      nameLower === "agility ladder drills";

    if (totalMinutes > 0) {
      if (is20MinCardio) {
        // Jumping Jacks, Burpees, Agility Ladder Drills: 20 mins = 100%
        timeScore = (totalMinutes / 20.0) * 100.0;
      } else if (nameLower.includes("walk") || nameLower.includes("hike")) {
        // Walking/Hiking: 60 mins = 100% score (30 mins = 50%)
        timeScore = (totalMinutes / 60.0) * 100.0;
      } else if (nameLower.includes("bicycle") || nameLower.includes("bike") || nameLower.includes("cycling") || nameLower.includes("spin")) {
        // Bicycling: 40 mins = 100% score (30 mins = 75%, 20 mins = 50%)
        timeScore = (totalMinutes / 40.0) * 100.0;
      } else {
        // Running / HIIT / Stairmaster / General Cardio: 30 mins = 100% score (15 mins = 50%)
        timeScore = (totalMinutes / 30.0) * 100.0;
      }
    }

    if (reps > 0 && is20MinCardio) {
      if (nameLower === "burpees") {
        // 100 burpees = 100% cardio session (5 reps/min sustained pace over 20 mins)
        repScore = (reps / 100.0) * 100.0;
      } else if (nameLower === "jumping jacks") {
        // 500 jumping jacks = 100% cardio session (25 reps/min over 20 mins)
        repScore = (reps / 500.0) * 100.0;
      } else if (nameLower === "agility ladder drills") {
        // 20 ladder passes/laps = 100% cardio session (1 lap/min over 20 mins)
        repScore = (reps / 20.0) * 100.0;
      }
    }

    if (dist > 0) {
      if (nameLower.includes("bicycle") || nameLower.includes("bike") || nameLower.includes("cycling")) {
        distScore = (dist / 5.0) * 100.0;
      } else if (nameLower.includes("walk")) {
        distScore = (dist / 2.5) * 100.0;
      } else {
        distScore = (dist / 2.0) * 100.0;
      }
    } else if (floors > 0) {
      distScore = (floors / 50.0) * 100.0;
    }

    const finalCardioScore = Math.max(timeScore, distScore, repScore);
    if (finalCardioScore > 0) {
      return Math.max(0.00, Math.min(110.00, parseFloat(finalCardioScore.toFixed(2))));
    }
    return 0;
  }

  const anchor = SCALING_ANCHORS[resolvedName];
  if (!anchor) return 0;

  // Scale anchor by gender if it's a strength/core stat
  let scaledAvg = anchor.avg;
  let scaledElite = anchor.elite;

  if (gender === "female") {
    let scale = 1.0;
    if (targetStat === "legStrength") {
      scale = 0.80; // 80% for lower body
    } else if (targetStat === "chestStrength" || targetStat === "backStrength" || targetStat === "armStrength") {
      scale = 0.65; // 65% for upper body
    } else if (targetStat === "coreStrength") {
      scale = 0.85; // 85% for core
    } else {
      if (conf) {
        const builds = conf.builds as any;
        if (builds.legStrength) scale = 0.80;
        else if (builds.chestStrength || builds.backStrength || builds.armStrength) scale = 0.65;
        else if (builds.coreStrength) scale = 0.85;
      }
    }
    scaledAvg = anchor.avg * scale;
    scaledElite = anchor.elite * scale;
  }

  let score = 0;

  if (anchor.type === "weightRatio") {
    let weight = m.weight || 0;
    const reps = m.reps || 0;
    if (weight <= 0) return 0;
    const nameLower = resolvedName.toLowerCase();
    const isDumbbell = nameLower.includes("dumbbell") || nameLower.includes("dumbell") || nameLower.includes("hammer curl");
    if (isDumbbell) {
      weight = weight * 2;
    }
    // Cap the rep count used in the 1RM estimation at 10
    const epleyReps = Math.min(10, reps);
    const estimated1RM = epleyReps <= 1 ? weight : weight * (1 + epleyReps / 30);
    const ratio = estimated1RM / bodyWeight;
    score = ((ratio - scaledAvg) / (scaledElite - scaledAvg)) * 50 + 50;
  }
  else if (anchor.type === "reps") {
    const reps = m.reps || 0;
    if (reps <= 0) return 0;
    score = ((reps - scaledAvg) / (scaledElite - scaledAvg)) * 50 + 50;
  }
  else if (anchor.type === "seconds") {
    const mins = m.minutes || 0;
    const secs = m.seconds || 0;
    const inputSeconds = mins * 60 + secs;
    if (inputSeconds <= 0) return 0;
    score = ((inputSeconds - scaledAvg) / (scaledElite - scaledAvg)) * 50 + 50;
  }
  else if (anchor.type === "paceSeconds") {
    const mins = m.minutes || 0;
    const secs = m.seconds || 0;
    const dist = m.distance || 0;
    const totalSeconds = mins * 60 + secs;
    if (dist <= 0 || totalSeconds <= 0) return 0;
    const inputPaceSeconds = totalSeconds / dist;
    score = ((scaledAvg - inputPaceSeconds) / (scaledAvg - scaledElite)) * 50 + 50;
  }
  else if (anchor.type === "distanceVolume") {
    const dist = m.distance || 0;
    if (dist <= 0) return 0;
    score = ((dist - scaledAvg) / (scaledElite - scaledAvg)) * 50 + 50;
  }
  else if (anchor.type === "floors") {
    const floors = m.floors || 0;
    if (floors <= 0) return 0;
    score = ((floors - scaledAvg) / (scaledElite - scaledAvg)) * 50 + 50;
  }

  return Math.max(0.00, Math.min(110.00, parseFloat(score.toFixed(2))));
}

/**
 * Combined Complete Stateless Evaluation Engine
 */
export interface DerivedPerformance {
  statLevels: StatLevels;
  statXps: Record<string, number>;
  subCategoryLevels: Record<string, number>;
  weeklyVolume: Record<string, number>;
  weeklySubVolume: Record<string, number>;
  monthlyVolume: Record<string, number>;
  monthlySubVolume: Record<string, number>;
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

function getEffectiveLevelForExerciseAndStat(
  configName: string,
  stat: string,
  matchedLogs: FitnessLog[],
  now: number,
  bodyWeight: number,
  gender: "male" | "female" = "male"
): number {
  if (matchedLogs.length === 0) return 0;

  let pr = 0;
  matchedLogs.forEach(l => {
    const score = calculateScoreFromLog(l, bodyWeight, stat, gender);
    if (score > pr) pr = score;
  });

  const workingLogs = matchedLogs.filter(l => {
    const score = calculateScoreFromLog(l, bodyWeight, stat, gender);
    const ratio = pr > 0 ? (score / pr) : 1.0;
    return ratio >= 0.60 || pr === 0;
  });

  if (workingLogs.length === 0) return 0;

  let peakScore = 0;
  let newestTimestamp = 0;
  workingLogs.forEach(wl => {
    const score = calculateScoreFromLog(wl, bodyWeight, stat, gender);
    if (score > peakScore) peakScore = score;
    const setTime = new Date(wl.timestamp).getTime();
    if (setTime > newestTimestamp) newestTimestamp = setTime;
  });

  const daysElapsed = Math.max(0, (now - newestTimestamp) / (1000 * 60 * 60 * 24));
  let decayMultiplier = 1.0;

  if (stat === "stamina") {
    if (daysElapsed > 7) {
      if (daysElapsed >= 21) decayMultiplier = 0.4;
      else decayMultiplier = 1.0 - ((daysElapsed - 7) / 14.0) * 0.6;
    }
  } else {
    if (daysElapsed > 14) {
      if (daysElapsed >= 30) decayMultiplier = 0.4;
      else decayMultiplier = 1.0 - ((daysElapsed - 14) / 16.0) * 0.6;
    }
  }

  return peakScore * decayMultiplier;
}

export function evaluateAthletePerformance(
  logs: FitnessLog[],
  bodyWeight: number = 175,
  gender: "male" | "female" = "male",
  nowMs?: number
): DerivedPerformance {
  const now = nowMs !== undefined ? nowMs : Date.now();
  const evaluation: DerivedPerformance = {
    statLevels: {
      chestStrength: 0.00,
      backStrength: 0.00,
      armStrength: 0.00,
      legStrength: 0.00,
      coreStrength: 0.00,
      cardio: 0.00,
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
      cardio: 0,
      speed: 0,
      stamina: 0,
      cardioStamina: 0
    },
    subCategoryLevels: {
      biceps: 0.00,
      triceps: 0.00,
      shoulders: 0.00,
      traps: 0.00,
      glutes: 0.00,
      quads: 0.00,
      hamstrings: 0.00,
      calves: 0.00
    },
    weeklyVolume: {
      chestStrength: 0,
      backStrength: 0,
      armStrength: 0,
      legStrength: 0,
      coreStrength: 0,
      cardio: 0,
      speed: 0,
      stamina: 0
    },
    weeklySubVolume: {
      biceps: 0,
      triceps: 0,
      shoulders: 0,
      traps: 0,
      glutes: 0,
      quads: 0,
      hamstrings: 0,
      calves: 0
    },
    monthlyVolume: {
      chestStrength: 0,
      backStrength: 0,
      armStrength: 0,
      legStrength: 0,
      coreStrength: 0,
      cardio: 0,
      speed: 0,
      stamina: 0
    },
    monthlySubVolume: {
      biceps: 0,
      triceps: 0,
      shoulders: 0,
      traps: 0,
      glutes: 0,
      quads: 0,
      hamstrings: 0,
      calves: 0
    },
    recoveryRemaining: {
      chestStrength: 0,
      backStrength: 0,
      armStrength: 0,
      legStrength: 0,
      coreStrength: 0,
      cardio: 0,
      speed: 0,
      stamina: 0
    },
    logEvaluations: {},
    exerciseDetails: {}
  };

  // 1. Group logs by exercise to calculate All-time PR & 90-day best raw score
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
  const allTimeRawBestByExercise: Record<string, number> = {};
  const ninetyDayRawBestByExercise: Record<string, number> = {};
  const lookbackMs = PROGRESS_CONFIG.effortThresholds.lookbackDays * 24 * 60 * 60 * 1000;

  logs.forEach(log => {
    if (!log.exerciseName) return;
    const conf = getExerciseConfig(log.exerciseName);
    const resolvedName = conf ? conf.name : log.exerciseName.trim();
    const score = calculateScoreFromLog(log, bodyWeight, undefined, gender);
    prByExercise[resolvedName] = Math.max(prByExercise[resolvedName] || 0, score);

    const rawScore = calculateRawStrengthScore(log, conf);
    allTimeRawBestByExercise[resolvedName] = Math.max(allTimeRawBestByExercise[resolvedName] || 0, rawScore);
    const logTime = new Date(log.timestamp).getTime();
    if (now - logTime <= lookbackMs && now - logTime >= -300000) {
      ninetyDayRawBestByExercise[resolvedName] = Math.max(ninetyDayRawBestByExercise[resolvedName] || 0, rawScore);
    }
  });

  // 2. Evaluate each log's 90-day effort ratio & working set status
  logs.forEach(log => {
    if (!log.exerciseName) return;
    const conf = getExerciseConfig(log.exerciseName);
    const resolvedName = conf ? conf.name : log.exerciseName.trim();

    const score = calculateScoreFromLog(log, bodyWeight, undefined, gender);
    const pr = prByExercise[resolvedName] || 0;

    const rawScore = calculateRawStrengthScore(log, conf);
    const bestRaw = ninetyDayRawBestByExercise[resolvedName] || allTimeRawBestByExercise[resolvedName] || 0;
    const ratio = bestRaw > 0 ? (rawScore / bestRaw) : 1.0;

    // Threshold is 60% of 90-day (or all-time fallback) peak capacity
    const isWorkingSet = ratio >= PROGRESS_CONFIG.effortThresholds.halfThreshold || bestRaw === 0;
    const volumePower = getEffortFactor(ratio);

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

  // 4. Calculate individual decayed, capped levels for all 8 subcategories
  const subCategoryNames = ["biceps", "triceps", "shoulders", "traps", "glutes", "quads", "hamstrings", "calves"] as const;

  subCategoryNames.forEach(sub => {
    const contributions: number[] = [];
    let hasNonMachineLog = false;
    let hasAnyLog = false;
    const parentStat = ["biceps", "triceps", "shoulders", "traps"].includes(sub) ? "armStrength" : "legStrength";

    EXERCISE_CONFIGS.forEach(config => {
      const muscleW = config.muscles[sub] || 0;
      if (muscleW > 0) {
        const matchedLogs = exerciseLogs[config.name] || [];
        const statEffectiveLvl = getEffectiveLevelForExerciseAndStat(
          config.name,
          parentStat,
          matchedLogs,
          now,
          bodyWeight,
          gender
        );
        const contrib = statEffectiveLvl * muscleW;
        if (contrib > 0) {
          contributions.push(contrib);
          hasAnyLog = true;
          if (config.pillar !== "machines") {
            hasNonMachineLog = true;
          }
        }
      }
    });

    if (!hasAnyLog) {
      evaluation.subCategoryLevels[sub] = 0.00;
      return;
    }

    contributions.sort((a, b) => b - a);
    const rawSubLvl = (contributions[0] || 0) * 1.00 + (contributions[1] || 0) * 0.50 + (contributions[2] || 0) * 0.25;

    let finalSubLvl = Math.max(0.00, rawSubLvl);
    if (finalSubLvl > 50) {
      if (finalSubLvl > 100) {
        finalSubLvl = 100.00 + 100.00 * (finalSubLvl - 100.00) / (finalSubLvl - 100.00 + 400.00);
      } else {
        finalSubLvl = 100.00 * finalSubLvl / (finalSubLvl + 50.00);
      }
    }
    if (!hasNonMachineLog && finalSubLvl > 50.00) {
      finalSubLvl = 50.00;
    }

    evaluation.subCategoryLevels[sub] = parseFloat(finalSubLvl.toFixed(2));
  });

  // Calculate final Stat Levels
  const statNames = ["chestStrength", "backStrength", "armStrength", "legStrength", "coreStrength", "cardio"] as const;

  statNames.forEach(stat => {
    let offsetSum = 0;

    if (stat === "armStrength" || stat === "legStrength") {
      if (stat === "armStrength") {
        offsetSum =
          evaluation.subCategoryLevels.biceps * PROGRESS_CONFIG.armRollupWeights.biceps +
          evaluation.subCategoryLevels.triceps * PROGRESS_CONFIG.armRollupWeights.triceps +
          evaluation.subCategoryLevels.shoulders * PROGRESS_CONFIG.armRollupWeights.shoulders +
          evaluation.subCategoryLevels.traps * PROGRESS_CONFIG.armRollupWeights.traps;
      } else {
        offsetSum =
          evaluation.subCategoryLevels.quads * PROGRESS_CONFIG.legRollupWeights.quads +
          evaluation.subCategoryLevels.hamstrings * PROGRESS_CONFIG.legRollupWeights.hamstrings +
          evaluation.subCategoryLevels.glutes * PROGRESS_CONFIG.legRollupWeights.glutes +
          evaluation.subCategoryLevels.calves * PROGRESS_CONFIG.legRollupWeights.calves;
      }
    } else if (stat === "chestStrength" || stat === "backStrength" || stat === "coreStrength") {
      const muscleKey: MuscleKey = stat === "chestStrength" ? "chest" : stat === "backStrength" ? "back" : "core";
      const contributions: number[] = [];
      EXERCISE_CONFIGS.forEach(config => {
        const w = config.muscles[muscleKey] || 0;
        if (w > 0) {
          const matchedLogs = exerciseLogs[config.name] || [];
          const statEffectiveLvl = getEffectiveLevelForExerciseAndStat(
            config.name,
            stat,
            matchedLogs,
            now,
            bodyWeight,
            gender
          );
          const contrib = statEffectiveLvl * w;
          if (contrib > 0) {
            contributions.push(contrib);
          }
        }
      });
      contributions.sort((a, b) => b - a);
      offsetSum = (contributions[0] || 0) * 1.00 + (contributions[1] || 0) * 0.50 + (contributions[2] || 0) * 0.25;
    } else {
      EXERCISE_CONFIGS.forEach(config => {
        if (config.pillar === "cardio") {
          const matchedLogs = exerciseLogs[config.name] || [];
          const statEffectiveLvl = getEffectiveLevelForExerciseAndStat(
            config.name,
            "cardio",
            matchedLogs,
            now,
            bodyWeight,
            gender
          );
          offsetSum += statEffectiveLvl;
        }
      });
    }

    const clampedLvl = Math.max(0.00, offsetSum);

    let finalLvl = clampedLvl;
    if (stat !== "armStrength" && stat !== "legStrength") {
      if (finalLvl > 50) {
        if (finalLvl > 100) {
          finalLvl = 100.00 + 100.00 * (finalLvl - 100.00) / (finalLvl - 100.00 + 400.00);
        } else {
          finalLvl = 100.00 * finalLvl / (finalLvl + 50.00);
        }
      }
    }

    evaluation.statLevels[stat] = parseFloat(finalLvl.toFixed(2));
    evaluation.statXps[stat] = Math.round(finalLvl);
  });

  // Backward compatibility mirrors
  evaluation.statLevels.speed = evaluation.statLevels.cardio;
  evaluation.statLevels.stamina = evaluation.statLevels.cardio;
  evaluation.statLevels.cardioStamina = evaluation.statLevels.cardio;
  evaluation.statXps.speed = evaluation.statXps.cardio;
  evaluation.statXps.stamina = evaluation.statXps.cardio;
  evaluation.statXps.cardioStamina = evaluation.statXps.cardio;

  // --- TIME-BASED STATE DECAY OVERRIDE ---
  if (typeof window !== "undefined" && window.localStorage) {
    const rawDecay = localStorage.getItem("fitrpg_decay_stats");
    if (rawDecay) {
      try {
        const decayStats = JSON.parse(rawDecay);
        statNames.forEach(stat => {
          if (decayStats[stat] && decayStats[stat].activeScore !== undefined) {
            evaluation.statLevels[stat] = parseFloat(decayStats[stat].activeScore.toFixed(2));
            evaluation.statXps[stat] = Math.round(decayStats[stat].activeScore);
          }
        });
      } catch (e) {
        console.error("Error loading decay stats in evaluation", e);
      }
    }
  }

  evaluation.statLevels.cardioStamina = evaluation.statLevels.stamina;
  evaluation.statXps.cardioStamina = evaluation.statXps.stamina;

  // 5. Calculate Weekly & Monthly Progress (Fractional Sets Against Session Target + Decay & Stacking)
  const oneWeekMs = PROGRESS_CONFIG.weeklyDecayDays * 24 * 60 * 60 * 1000;
  const oneMonthMs = PROGRESS_CONFIG.monthlyDecayDays * 24 * 60 * 60 * 1000;

  const allMuscleKeys: MuscleKey[] = [
    "chest", "back", "core",
    "biceps", "triceps", "shoulders", "traps",
    "quads", "hamstrings", "glutes", "calves"
  ];

  // Sort valid logs within the 30-day window chronologically (preserving original order for identical timestamps)
  const validLogs = logs
    .map((log, idx) => ({ log, idx, time: new Date(log.timestamp).getTime() }))
    .filter(item => item.log.exerciseName && !isNaN(item.time) && (now - item.time) <= oneMonthMs && (now - item.time) >= -300000)
    .sort((a, b) => (a.time !== b.time ? a.time - b.time : a.idx - b.idx));

  // Group logs by local calendar day to compute daily fractional set credits and daily session progress
  interface DayBucket {
    dateKey: string;
    timestamp: number;
    muscleCredits: Record<MuscleKey, number>;
    cardioProgress: number;
    exerciseSetCounts: Record<string, number>;
  }

  const dayBucketsMap = new Map<string, DayBucket>();

  validLogs.forEach(({ log, time }) => {
    const d = new Date(time);
    const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

    let bucket = dayBucketsMap.get(dateKey);
    if (!bucket) {
      bucket = {
        dateKey,
        timestamp: time,
        muscleCredits: {
          chest: 0, back: 0, core: 0,
          biceps: 0, triceps: 0, shoulders: 0, traps: 0,
          quads: 0, hamstrings: 0, glutes: 0, calves: 0
        },
        cardioProgress: 0,
        exerciseSetCounts: {}
      };
      dayBucketsMap.set(dateKey, bucket);
    }
    if (time > bucket.timestamp) {
      bucket.timestamp = time;
    }

    let conf = getExerciseConfig(log.exerciseName!);
    const dbEx = getAllExercises().find(c => c.name.toLowerCase() === (conf?.name || log.exerciseName!).toLowerCase());
    if (!conf && dbEx) {
      conf = {
        name: dbEx.name,
        pillar: dbEx.pillar,
        formType: dbEx.formType,
        baseline: 0,
        peak: 100,
        muscles: dbEx.muscles || {},
        builds: dbEx.builds,
        subCategories: dbEx.subCategories
      };
    }
    if (!conf && isCardioExercise(undefined, undefined, log)) {
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
    if (!conf) return;

    const isCardio = isCardioExercise(conf, dbEx, log);

    if (isCardio) {
      const rawCardioScore = calculateScoreFromLog(log, bodyWeight, "cardio", gender);
      const cardioScore = Math.max(0, Math.min(100, rawCardioScore));
      bucket.cardioProgress += cardioScore;

      // Cardio adds (score / 100) * 2 fractional sets, split across the listed muscles (§3)
      const muscleEntries = (Object.entries(conf.muscles || {}) as [MuscleKey, number][]).filter(([_, w]) => (w || 0) > 0);
      if (muscleEntries.length > 0 && cardioScore > 0) {
        const totalWeight = muscleEntries.reduce((sum, [_, w]) => sum + (w || 0), 0);
        const totalCardioSets = (cardioScore / 100) * PROGRESS_CONFIG.cardioMuscleSetsPer100;
        muscleEntries.forEach(([mKey, w]) => {
          bucket!.muscleCredits[mKey] += totalCardioSets * ((w || 0) / totalWeight);
        });
      }
    } else {
      // Strength & Bodyweight model: fractional sets against session target (§2)
      const setNum = (bucket.exerciseSetCounts[conf.name] || 0) + 1;
      bucket.exerciseSetCounts[conf.name] = setNum;

      const setFactor = getSetFactor(setNum);
      if (setFactor <= 0) return;

      const evalItem = evaluation.logEvaluations[log.id];
      const ratio = evalItem ? evalItem.ratio : 1.0;
      const effort = getEffortFactor(ratio);
      if (effort <= 0) return;

      const muscleEntries = (Object.entries(conf.muscles || {}) as [MuscleKey, number][]).filter(([_, w]) => (w || 0) > 0);
      muscleEntries.forEach(([mKey, muscleWeight]) => {
        const credit = effort * setFactor * (muscleWeight || 0);
        bucket!.muscleCredits[mKey] += credit;
      });
    }
  });

  // Process day buckets chronologically to apply linear decay and stacking per muscle (capped at 100%)
  const sortedBuckets = Array.from(dayBucketsMap.values()).sort((a, b) => a.timestamp - b.timestamp);

  const weeklyMuscleProgress: Record<MuscleKey, number> = {
    chest: 0, back: 0, core: 0,
    biceps: 0, triceps: 0, shoulders: 0, traps: 0,
    quads: 0, hamstrings: 0, glutes: 0, calves: 0
  };
  const weeklyLastTime: Record<MuscleKey, number> = {
    chest: 0, back: 0, core: 0,
    biceps: 0, triceps: 0, shoulders: 0, traps: 0,
    quads: 0, hamstrings: 0, glutes: 0, calves: 0
  };

  const monthlyMuscleProgress: Record<MuscleKey, number> = {
    chest: 0, back: 0, core: 0,
    biceps: 0, triceps: 0, shoulders: 0, traps: 0,
    quads: 0, hamstrings: 0, glutes: 0, calves: 0
  };
  const monthlyLastTime: Record<MuscleKey, number> = {
    chest: 0, back: 0, core: 0,
    biceps: 0, triceps: 0, shoulders: 0, traps: 0,
    quads: 0, hamstrings: 0, glutes: 0, calves: 0
  };

  let weeklyCardioProgress = 0;
  let weeklyCardioLastTime = 0;
  let monthlyCardioProgress = 0;
  let monthlyCardioLastTime = 0;

  sortedBuckets.forEach(bucket => {
    const t = bucket.timestamp;

    allMuscleKeys.forEach(mKey => {
      const credits = bucket.muscleCredits[mKey];
      if (credits > 0) {
        const target = PROGRESS_CONFIG.muscleTargets[mKey];
        const sessionProgress = Math.min(100, (credits / target) * 100);

        // Weekly stacking with 7-day linear decay
        if (weeklyLastTime[mKey] > 0) {
          const elapsed = Math.max(0, t - weeklyLastTime[mKey]);
          const decay = (elapsed / oneWeekMs) * 100;
          weeklyMuscleProgress[mKey] = Math.max(0, weeklyMuscleProgress[mKey] - decay);
        }
        weeklyMuscleProgress[mKey] = Math.min(100, weeklyMuscleProgress[mKey] + sessionProgress);
        weeklyLastTime[mKey] = t;

        // Monthly stacking with 30-day linear decay (consistent: 1 full session = 100%)
        if (monthlyLastTime[mKey] > 0) {
          const elapsed = Math.max(0, t - monthlyLastTime[mKey]);
          const decay = (elapsed / oneMonthMs) * 100;
          monthlyMuscleProgress[mKey] = Math.max(0, monthlyMuscleProgress[mKey] - decay);
        }
        monthlyMuscleProgress[mKey] = Math.min(100, monthlyMuscleProgress[mKey] + sessionProgress);
        monthlyLastTime[mKey] = t;
      }
    });

    if (bucket.cardioProgress > 0) {
      const sessionCardio = Math.min(100, bucket.cardioProgress);

      if (weeklyCardioLastTime > 0) {
        const elapsed = Math.max(0, t - weeklyCardioLastTime);
        const decay = (elapsed / oneWeekMs) * 100;
        weeklyCardioProgress = Math.max(0, weeklyCardioProgress - decay);
      }
      weeklyCardioProgress = Math.min(100, weeklyCardioProgress + sessionCardio);
      weeklyCardioLastTime = t;

      if (monthlyCardioLastTime > 0) {
        const elapsed = Math.max(0, t - monthlyCardioLastTime);
        const decay = (elapsed / oneMonthMs) * 100;
        monthlyCardioProgress = Math.max(0, monthlyCardioProgress - decay);
      }
      monthlyCardioProgress = Math.min(100, monthlyCardioProgress + sessionCardio);
      monthlyCardioLastTime = t;
    }
  });

  // Final linear decay from each muscle's last active session timestamp up to `now`
  allMuscleKeys.forEach(mKey => {
    if (weeklyLastTime[mKey] > 0) {
      const elapsed = Math.max(0, now - weeklyLastTime[mKey]);
      const decay = (elapsed / oneWeekMs) * 100;
      weeklyMuscleProgress[mKey] = parseFloat(Math.max(0, Math.min(100, weeklyMuscleProgress[mKey] - decay)).toFixed(1));
    }
    if (monthlyLastTime[mKey] > 0) {
      const elapsed = Math.max(0, now - monthlyLastTime[mKey]);
      const decay = (elapsed / oneMonthMs) * 100;
      monthlyMuscleProgress[mKey] = parseFloat(Math.max(0, Math.min(100, monthlyMuscleProgress[mKey] - decay)).toFixed(1));
    }
  });

  if (weeklyCardioLastTime > 0) {
    const elapsed = Math.max(0, now - weeklyCardioLastTime);
    const decay = (elapsed / oneWeekMs) * 100;
    weeklyCardioProgress = parseFloat(Math.max(0, Math.min(100, weeklyCardioProgress - decay)).toFixed(1));
  }
  if (monthlyCardioLastTime > 0) {
    const elapsed = Math.max(0, now - monthlyCardioLastTime);
    const decay = (elapsed / oneMonthMs) * 100;
    monthlyCardioProgress = parseFloat(Math.max(0, Math.min(100, monthlyCardioProgress - decay)).toFixed(1));
  }

  // Assign capped & decayed sub-muscles first
  subCategoryNames.forEach(sub => {
    evaluation.weeklySubVolume[sub] = weeklyMuscleProgress[sub];
    evaluation.monthlySubVolume[sub] = monthlyMuscleProgress[sub];
  });

  // Assign main sections and weighted radar roll-ups for Arms & Legs
  evaluation.weeklyVolume.chestStrength = weeklyMuscleProgress.chest;
  evaluation.weeklyVolume.backStrength = weeklyMuscleProgress.back;
  evaluation.weeklyVolume.coreStrength = weeklyMuscleProgress.core;
  evaluation.weeklyVolume.cardio = weeklyCardioProgress;
  evaluation.weeklyVolume.speed = weeklyCardioProgress;
  evaluation.weeklyVolume.stamina = weeklyCardioProgress;

  evaluation.weeklyVolume.armStrength = parseFloat(
    (
      evaluation.weeklySubVolume.biceps * PROGRESS_CONFIG.armRollupWeights.biceps +
      evaluation.weeklySubVolume.triceps * PROGRESS_CONFIG.armRollupWeights.triceps +
      evaluation.weeklySubVolume.shoulders * PROGRESS_CONFIG.armRollupWeights.shoulders +
      evaluation.weeklySubVolume.traps * PROGRESS_CONFIG.armRollupWeights.traps
    ).toFixed(1)
  );
  evaluation.weeklyVolume.legStrength = parseFloat(
    (
      evaluation.weeklySubVolume.quads * PROGRESS_CONFIG.legRollupWeights.quads +
      evaluation.weeklySubVolume.hamstrings * PROGRESS_CONFIG.legRollupWeights.hamstrings +
      evaluation.weeklySubVolume.glutes * PROGRESS_CONFIG.legRollupWeights.glutes +
      evaluation.weeklySubVolume.calves * PROGRESS_CONFIG.legRollupWeights.calves
    ).toFixed(1)
  );

  evaluation.monthlyVolume.chestStrength = monthlyMuscleProgress.chest;
  evaluation.monthlyVolume.backStrength = monthlyMuscleProgress.back;
  evaluation.monthlyVolume.coreStrength = monthlyMuscleProgress.core;
  evaluation.monthlyVolume.cardio = monthlyCardioProgress;
  evaluation.monthlyVolume.speed = monthlyCardioProgress;
  evaluation.monthlyVolume.stamina = monthlyCardioProgress;

  evaluation.monthlyVolume.armStrength = parseFloat(
    (
      evaluation.monthlySubVolume.biceps * PROGRESS_CONFIG.armRollupWeights.biceps +
      evaluation.monthlySubVolume.triceps * PROGRESS_CONFIG.armRollupWeights.triceps +
      evaluation.monthlySubVolume.shoulders * PROGRESS_CONFIG.armRollupWeights.shoulders +
      evaluation.monthlySubVolume.traps * PROGRESS_CONFIG.armRollupWeights.traps
    ).toFixed(1)
  );
  evaluation.monthlyVolume.legStrength = parseFloat(
    (
      evaluation.monthlySubVolume.quads * PROGRESS_CONFIG.legRollupWeights.quads +
      evaluation.monthlySubVolume.hamstrings * PROGRESS_CONFIG.legRollupWeights.hamstrings +
      evaluation.monthlySubVolume.glutes * PROGRESS_CONFIG.legRollupWeights.glutes +
      evaluation.monthlySubVolume.calves * PROGRESS_CONFIG.legRollupWeights.calves
    ).toFixed(1)
  );

  // 6. Calculate 72-Hour recovery status timelines
  const seventyTwoHoursMs = 72 * 60 * 60 * 1000;
  logs.forEach(log => {
    if (!log.exerciseName) return;
    const elapsedMs = now - new Date(log.timestamp).getTime();
    if (elapsedMs > seventyTwoHoursMs || elapsedMs < -300000) return;

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
 * Calculates the undecayed baseline stat values based strictly on log history
 */
export function getUndecayedStats(
  logs: FitnessLog[],
  bodyWeight: number = 175,
  gender: "male" | "female" = "male"
): Record<string, number> {
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
    const score = calculateScoreFromLog(log, bodyWeight, undefined, gender);
    const conf = getExerciseConfig(log.exerciseName);
    const resolvedName = conf ? conf.name : log.exerciseName.trim();
    prByExercise[resolvedName] = Math.max(prByExercise[resolvedName] || 0, score);
  });

  const peakLevels: Record<string, number> = {};
  EXERCISE_CONFIGS.forEach(config => {
    const matchedLogs = exerciseLogs[config.name] || [];
    const workingLogs = matchedLogs.filter(l => {
      const score = calculateScoreFromLog(l, bodyWeight, undefined, gender);
      const pr = prByExercise[config.name] || 0;
      const ratio = pr > 0 ? (score / pr) : 1.0;
      return ratio >= 0.60 || pr === 0;
    });

    if (workingLogs.length === 0) {
      peakLevels[config.name] = 0;
      return;
    }

    let peakScore = 0;
    workingLogs.forEach(wl => {
      const score = calculateScoreFromLog(wl, bodyWeight, undefined, gender);
      if (score > peakScore) {
        peakScore = score;
      }
    });
    peakLevels[config.name] = peakScore;
  });

  const subCategoryNames = ["biceps", "triceps", "shoulders", "traps", "glutes", "quads", "hamstrings", "calves"] as const;
  const undecayedSubLevels: Record<string, number> = {};

  subCategoryNames.forEach(sub => {
    const contributions: number[] = [];
    let hasNonMachineLog = false;
    let hasAnyLog = false;

    EXERCISE_CONFIGS.forEach(config => {
      const w = config.muscles[sub] || 0;
      if (w > 0) {
        const peak = peakLevels[config.name] || 0;
        const contrib = peak * w;
        if (contrib > 0) {
          contributions.push(contrib);
          hasAnyLog = true;
          if (config.pillar !== "machines") {
            hasNonMachineLog = true;
          }
        }
      }
    });

    if (!hasAnyLog) {
      undecayedSubLevels[sub] = 0.00;
      return;
    }

    contributions.sort((a, b) => b - a);
    const rawSubLvl = (contributions[0] || 0) * 1.00 + (contributions[1] || 0) * 0.50 + (contributions[2] || 0) * 0.25;

    let finalSubLvl = Math.max(0.00, rawSubLvl);
    if (finalSubLvl > 50) {
      if (finalSubLvl > 100) {
        finalSubLvl = 100.00 + 100.00 * (finalSubLvl - 100.00) / (finalSubLvl - 100.00 + 400.00);
      } else {
        finalSubLvl = 100.00 * finalSubLvl / (finalSubLvl + 50.00);
      }
    }
    if (!hasNonMachineLog && finalSubLvl > 50.00) {
      finalSubLvl = 50.00;
    }

    undecayedSubLevels[sub] = parseFloat(finalSubLvl.toFixed(2));
  });

  const statNames = ["chestStrength", "backStrength", "armStrength", "legStrength", "coreStrength", "cardio"] as const;
  const baseStats: Record<string, number> = {};

  statNames.forEach(stat => {
    let finalLvl = 0;

    if (stat === "armStrength" || stat === "legStrength") {
      if (stat === "armStrength") {
        finalLvl =
          undecayedSubLevels.biceps * PROGRESS_CONFIG.armRollupWeights.biceps +
          undecayedSubLevels.triceps * PROGRESS_CONFIG.armRollupWeights.triceps +
          undecayedSubLevels.shoulders * PROGRESS_CONFIG.armRollupWeights.shoulders +
          undecayedSubLevels.traps * PROGRESS_CONFIG.armRollupWeights.traps;
      } else {
        finalLvl =
          undecayedSubLevels.quads * PROGRESS_CONFIG.legRollupWeights.quads +
          undecayedSubLevels.hamstrings * PROGRESS_CONFIG.legRollupWeights.hamstrings +
          undecayedSubLevels.glutes * PROGRESS_CONFIG.legRollupWeights.glutes +
          undecayedSubLevels.calves * PROGRESS_CONFIG.legRollupWeights.calves;
      }
    } else {
      let offsetSum = 0;
      if (stat === "chestStrength" || stat === "backStrength" || stat === "coreStrength") {
        const muscleKey: MuscleKey = stat === "chestStrength" ? "chest" : stat === "backStrength" ? "back" : "core";
        const contributions: number[] = [];
        EXERCISE_CONFIGS.forEach(config => {
          const w = config.muscles[muscleKey] || 0;
          if (w > 0) {
            const peak = peakLevels[config.name] || 0;
            const contrib = peak * w;
            if (contrib > 0) {
              contributions.push(contrib);
            }
          }
        });
        contributions.sort((a, b) => b - a);
        offsetSum = (contributions[0] || 0) * 1.00 + (contributions[1] || 0) * 0.50 + (contributions[2] || 0) * 0.25;
      } else {
        EXERCISE_CONFIGS.forEach(config => {
          if (config.pillar === "cardio") {
            offsetSum += peakLevels[config.name] || 0;
          }
        });
      }

      let hasNonMachineLog = false;
      EXERCISE_CONFIGS.forEach(config => {
        const builds = config.builds as any;
        const isMatched = builds[stat] > 0 || (stat === "cardio" && config.pillar === "cardio");
        if (isMatched) {
          const matchedLogs = exerciseLogs[config.name] || [];
          if (matchedLogs.length > 0 && config.pillar !== "machines") {
            hasNonMachineLog = true;
          }
        }
      });

      finalLvl = offsetSum;
      if (finalLvl > 50) {
        if (finalLvl > 100) {
          finalLvl = 100.00 + 100.00 * (finalLvl - 100.00) / (finalLvl - 100.00 + 400.00);
        } else {
          finalLvl = 100.00 * finalLvl / (finalLvl + 50.00);
        }
      }
      if (stat !== "cardio") {
        if (!hasNonMachineLog && finalLvl > 50.00) {
          finalLvl = 50.00;
        }
      }
    }

    baseStats[stat] = parseFloat(finalLvl.toFixed(2));
  });

  baseStats.speed = baseStats.cardio || 0;
  baseStats.stamina = baseStats.cardio || 0;
  baseStats.cardioStamina = baseStats.cardio || 0;

  return baseStats;
}

/**
 * Background calculations engine running on initialization to decay physical stats
 */
export function runStateDecayEngine(logs: FitnessLog[], bodyWeight: number = 175): void {
  if (typeof window === "undefined" || !window.localStorage) return;

  const now = Date.now();

  let gender: "male" | "female" = "male";
  try {
    const profileStr = localStorage.getItem("fitquest_profile");
    if (profileStr) {
      const parsed = JSON.parse(profileStr);
      if (parsed.gender === "female") {
        gender = "female";
      }
    }
  } catch (e) {
    console.error(e);
  }

  // 1. Calculate undecayed baseline stats
  const baseStats = getUndecayedStats(logs, bodyWeight, gender);

  // 2. Load stored decay states
  const storedStr = localStorage.getItem("fitrpg_decay_stats");
  let decayStats: Record<string, { activeScore: number; basePR: number; lastTrainedTimestamp: number }> = {};
  if (storedStr) {
    try {
      decayStats = JSON.parse(storedStr);
    } catch (e) {
      console.error("Failed to parse decay stats", e);
    }
  }

  const statNames = ["chestStrength", "backStrength", "armStrength", "legStrength", "coreStrength", "cardio", "speed", "stamina"] as const;

  statNames.forEach(stat => {
    const sCalc = (stat === "speed" || stat === "stamina") ? (baseStats.cardio || 0) : (baseStats[stat] || 0);
    const existing = decayStats[stat];

    // Find the newest timestamp of any logged exercise that builds this stat
    let newestLogTimestamp = 0;
    let newestLogWeight = 0;
    let historicalMaxWeight = 0;

    logs.forEach(log => {
      if (!log.exerciseName) return;
      const conf = getExerciseConfig(log.exerciseName);
      if (!conf) return;
      const builds = conf.builds as any;
      const isMatch = (builds[stat] && builds[stat] > 0) ||
                      ((stat === "cardio" || stat === "speed" || stat === "stamina") && conf.pillar === "cardio");
      if (isMatch) {
        const logTime = new Date(log.timestamp).getTime();
        const logWeight = log.weight || 0;
        if (logTime > newestLogTimestamp) {
          newestLogTimestamp = logTime;
          newestLogWeight = logWeight;
        }
        if (logWeight > historicalMaxWeight) {
          historicalMaxWeight = logWeight;
        }
      }
    });

    if (!existing) {
      decayStats[stat] = {
        activeScore: sCalc,
        basePR: sCalc,
        lastTrainedTimestamp: newestLogTimestamp || now
      };
    } else {
      // Keep baseline PR in sync with undecayed calculation
      decayStats[stat].basePR = Math.max(existing.basePR, sCalc);

      // Check if new training has occurred
      if (newestLogTimestamp > existing.lastTrainedTimestamp) {
        decayStats[stat].lastTrainedTimestamp = newestLogTimestamp;

        // Anti-Reset Protection:
        // Snap back to full PR value if the user logged a set matching/exceeding their max weight
        if (newestLogWeight >= historicalMaxWeight && historicalMaxWeight > 0) {
          decayStats[stat].activeScore = decayStats[stat].basePR;
        } else {
          decayStats[stat].activeScore = sCalc;
        }
      } else {
        // Linear 30-day decay from basePR down to 0
        const elapsedSeconds = (now - existing.lastTrainedTimestamp) / 1000;
        if (elapsedSeconds >= 2592000) {
          decayStats[stat].activeScore = 0;
        } else {
          decayStats[stat].activeScore = existing.basePR * (1 - (elapsedSeconds / 2592000));
        }
      }
    }

    // Cap at 99.00 if only machine exercises are used for this stat
    let hasNonMachineLog = false;
    logs.forEach(l => {
      if (!l.exerciseName) return;
      const conf = getExerciseConfig(l.exerciseName);
      if (!conf) return;
      const builds = conf.builds as any;
      if (builds[stat] && builds[stat] > 0 && conf.pillar !== "machines") {
        hasNonMachineLog = true;
      }
    });

    if (!hasNonMachineLog) {
      if (decayStats[stat].activeScore >= 100.00) {
        decayStats[stat].activeScore = 99.00;
      }
      if (decayStats[stat].basePR >= 100.00) {
        decayStats[stat].basePR = 99.00;
      }
    }

    // Clean decimals rounding
    decayStats[stat].activeScore = parseFloat(decayStats[stat].activeScore.toFixed(2));
    decayStats[stat].basePR = parseFloat(decayStats[stat].basePR.toFixed(2));
  });

  localStorage.setItem("fitrpg_decay_stats", JSON.stringify(decayStats));
}

/**
 * Triggered on new log entries to update stat decay states and reset timers
 */
export function updateDecayOnNewLog(log: FitnessLog, logs: FitnessLog[], bodyWeight: number = 175): void {
  if (typeof window === "undefined" || !window.localStorage) return;

  // Re-run the decay calculation flow completely on the new dataset
  runStateDecayEngine(logs, bodyWeight);
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
      border: "border-slate-800/40",
      description: "Leveling floor, establishing active calibration."
    };
  } else if (level < 50) {
    return {
      name: "Novice",
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20",
      description: "Developing consistent mechanical overload capacity."
    };
  } else if (level === 50) {
    return {
      name: "Average",
      color: "text-emerald-400/90",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/30",
      description: "Standard solid performance benchmark achieved."
    };
  } else if (level < 65) {
    return {
      name: "Intermediate",
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20",
      description: "Consolidated strength reserves and stamina thresholds."
    };
  } else if (level < 85) {
    return {
      name: "Advanced",
      color: "text-cyan-400",
      bg: "bg-cyan-500/10",
      border: "border-cyan-500/20",
      description: "Elite structural force output levels."
    };
  } else if (level < 100) {
    return {
      name: "Elite",
      color: "text-indigo-400",
      bg: "bg-indigo-500/10",
      border: "border-indigo-500/20",
      description: "Competitive performance indicators and high work efficiency."
    };
  } else {
    return {
      name: "Grandmaster",
      color: "text-rose-400 text-retro-glow",
      bg: "bg-rose-500/10",
      border: "border-rose-500/30",
      description: "Uncapped performance ranges, exceeding historical limits."
    };
  }
}

/**
 * Calculates the individual level for each arm and leg subcategory muscle
 */
export function calculateSubCategoryLevels(
  logs: FitnessLog[],
  bodyWeight: number,
  statLevels?: StatLevels
): Record<string, number> {
  return evaluateAthletePerformance(logs, bodyWeight).subCategoryLevels || {};
}

export function calculateAllRecords(logs: FitnessLog[]): { title: string; val: string; icon: string; style: string }[] {
  const list: { title: string; val: string; icon: string; style: string }[] = [];

  // 1. Max Bench Press
  const benchLogs = logs.filter(l => l.exerciseName === "Bench Press" && l.weight && l.reps);
  if (benchLogs.length > 0) {
    let max1RM = 0;
    let maxLog = benchLogs[0];
    benchLogs.forEach(l => {
      const oneRepMax = l.weight! * (1 + l.reps! / 30);
      if (oneRepMax > max1RM) {
        max1RM = oneRepMax;
        maxLog = l;
      }
    });
    list.push({
      title: "MAX BENCH PRESS (EST. 1RM)",
      val: `${Math.round(max1RM)} LBS (${maxLog.weight} LBS x ${maxLog.reps} REPS)`,
      icon: "🏋️",
      style: "border-cyan-500/30 text-cyan-400"
    });
  }

  // 2. Max Squat
  const squatLogs = logs.filter(l => l.exerciseName === "Barbell Squat" && l.weight && l.reps);
  if (squatLogs.length > 0) {
    let max1RM = 0;
    let maxLog = squatLogs[0];
    squatLogs.forEach(l => {
      const oneRepMax = l.weight! * (1 + l.reps! / 30);
      if (oneRepMax > max1RM) {
        max1RM = oneRepMax;
        maxLog = l;
      }
    });
    list.push({
      title: "MAX BARBELL SQUAT (EST. 1RM)",
      val: `${Math.round(max1RM)} LBS (${maxLog.weight} LBS x ${maxLog.reps} REPS)`,
      icon: "🦵",
      style: "border-emerald-500/30 text-emerald-400"
    });
  }

  // 3. Max Deadlift
  const deadliftLogs = logs.filter(l => l.exerciseName === "Deadlift" && l.weight && l.reps);
  if (deadliftLogs.length > 0) {
    let max1RM = 0;
    let maxLog = deadliftLogs[0];
    deadliftLogs.forEach(l => {
      const oneRepMax = l.weight! * (1 + l.reps! / 30);
      if (oneRepMax > max1RM) {
        max1RM = oneRepMax;
        maxLog = l;
      }
    });
    list.push({
      title: "MAX DEADLIFT (EST. 1RM)",
      val: `${Math.round(max1RM)} LBS (${maxLog.weight} LBS x ${maxLog.reps} REPS)`,
      icon: "💪",
      style: "border-orange-500/30 text-orange-400"
    });
  }

  // 4. Fastest Mile
  const runLogs = logs.filter(l => (l.exerciseName === "Treadmill Run / Jog" || l.exerciseName === "Sprint Intervals") && l.distance && l.minutes !== undefined && l.seconds !== undefined);
  if (runLogs.length > 0) {
    let fastestPace = Infinity; // seconds per mile
    let fastestLog = runLogs[0];
    runLogs.forEach(l => {
      const totalSeconds = l.minutes! * 60 + l.seconds!;
      const pace = totalSeconds / l.distance!;
      if (pace < fastestPace) {
        fastestPace = pace;
        fastestLog = l;
      }
    });
    if (fastestPace !== Infinity) {
      const minutesPart = Math.floor(fastestPace / 60);
      const secondsPart = Math.round(fastestPace % 60);
      list.push({
        title: "FASTEST MILE PACE",
        val: `${minutesPart}:${secondsPart.toString().padStart(2, "0")} / MILE (${fastestLog.distance} MI in ${fastestLog.minutes}m ${fastestLog.seconds}s)`,
        icon: "⚡",
        style: "border-rose-500/30 text-rose-400"
      });
    }
  }

  // 5. Most Floors Climbed
  const stairLogs = logs.filter(l => l.exerciseName === "Stairmaster" && l.floors);
  if (stairLogs.length > 0) {
    const maxFloors = Math.max(...stairLogs.map(l => l.floors!));
    list.push({
      title: "MOST FLOORS CLIMBED",
      val: `${maxFloors} FLOORS`,
      icon: "🪜",
      style: "border-purple-500/30 text-purple-400"
    });
  }

  // 6. Most Pushups Done
  const pushupLogs = logs.filter(l => l.exerciseName === "Regular Push-Ups" && l.reps);
  if (pushupLogs.length > 0) {
    const maxReps = Math.max(...pushupLogs.map(l => l.reps!));
    list.push({
      title: "MOST PUSH-UPS",
      val: `${maxReps} REPS`,
      icon: "👊",
      style: "border-cyan-500/30 text-cyan-400"
    });
  }

  // 7. Longest Distance Ran
  const cardioLogs = logs.filter(l => l.distance);
  if (cardioLogs.length > 0) {
    const maxDist = Math.max(...cardioLogs.map(l => l.distance!));
    list.push({
      title: "LONGEST DISTANCE RUN",
      val: `${maxDist.toFixed(2)} MILES`,
      icon: "🏃",
      style: "border-rose-500/30 text-rose-400"
    });
  }

  // 8. Most Situps
  const situpLogs = logs.filter(l => l.exerciseName === "Sit-Ups" && l.reps);
  if (situpLogs.length > 0) {
    const maxReps = Math.max(...situpLogs.map(l => l.reps!));
    list.push({
      title: "MOST SIT-UPS",
      val: `${maxReps} REPS`,
      icon: "🎯",
      style: "border-amber-500/30 text-amber-400"
    });
  }

  // 9. Most Bodyweight Squats
  const bwSquatLogs = logs.filter(l => l.exerciseName === "Bodyweight Squats" && l.reps);
  if (bwSquatLogs.length > 0) {
    const maxReps = Math.max(...bwSquatLogs.map(l => l.reps!));
    list.push({
      title: "MOST BODYWEIGHT SQUATS",
      val: `${maxReps} REPS`,
      icon: "🦵",
      style: "border-emerald-500/30 text-emerald-400"
    });
  }

  // 10. Longest Plank
  const plankLogs = logs.filter(l => l.exerciseName === "Plank" && l.minutes !== undefined && l.seconds !== undefined);
  if (plankLogs.length > 0) {
    let maxTime = 0; // in seconds
    plankLogs.forEach(l => {
      const total = l.minutes! * 60 + l.seconds!;
      if (total > maxTime) maxTime = total;
    });
    const mins = Math.floor(maxTime / 60);
    const secs = maxTime % 60;
    list.push({
      title: "LONGEST PLANK HOLD",
      val: `${mins}m ${secs.toString().padStart(2, "0")}s`,
      icon: "🛡️",
      style: "border-amber-500/30 text-amber-400"
    });
  }

  return list;
}

/**
 * Calculates the percentage distribution of logged workouts across all muscle sectors and cardio.
 */
export function calculateMuscleDistribution(logs: FitnessLog[]): Record<string, number> {
  const totals: Record<string, number> = {
    chestStrength: 0,
    backStrength: 0,
    coreStrength: 0,
    cardio: 0,
    speed: 0,
    stamina: 0,
    biceps: 0,
    triceps: 0,
    shoulders: 0,
    traps: 0,
    quads: 0,
    hamstrings: 0,
    glutes: 0,
    calves: 0
  };

  let grandTotal = 0;

  logs.forEach(log => {
    if (!log.exerciseName) return;
    const conf = getExerciseConfig(log.exerciseName);
    if (!conf) return;

    if (conf.pillar === "cardio") {
      totals.cardio += 1;
      grandTotal += 1;
    }

    const muscleEntries = Object.entries(conf.muscles || {}) as [MuscleKey, number][];
    muscleEntries.forEach(([mKey, w]) => {
      if ((w || 0) > 0) {
        if (mKey === "chest") totals.chestStrength += w;
        else if (mKey === "back") totals.backStrength += w;
        else if (mKey === "core") totals.coreStrength += w;
        else totals[mKey] += w;
        grandTotal += w;
      }
    });
  });

  const distribution: Record<string, number> = {};
  const allCategories = [
    "chestStrength", "backStrength", "coreStrength", "cardio", "speed", "stamina",
    "biceps", "triceps", "shoulders", "traps",
    "quads", "hamstrings", "glutes", "calves"
  ] as const;

  allCategories.forEach(cat => {
    distribution[cat] = grandTotal > 0 ? parseFloat(((totals[cat] / grandTotal) * 100).toFixed(1)) : 0;
  });

  return distribution;
}

