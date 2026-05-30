export interface AthleteProfile {
  name: string;
  age: number;
  bodyWeight: number; // in lbs
  
  // 7 profile stats: levels (start at 1.00 to 100.00) and sub-level index tracking
  chestStrength: number;
  chestStrengthXP: number;
  
  backStrength: number;
  backStrengthXP: number;
  
  armStrength: number;
  armStrengthXP: number;
  
  legStrength: number;
  legStrengthXP: number;
  
  coreStrength: number;
  coreStrengthXP: number;
  
  speed: number;
  speedXP: number;
  
  stamina: number;
  staminaXP: number;

  // For absolute backward compatibility
  cardioStamina?: number;
  cardioStaminaXP?: number;
}

export type FitnessMetricType = "bench" | "squat" | "mile" | "pushups" | "general_workout";

export interface FitnessLog {
  id: string;
  timestamp: string;
  metricType: FitnessMetricType;
  title: string;
  newValue: string;
  previousValue?: string;
  notes?: string;
  
  // Added fields for cleaner tracking
  exerciseName?: string;
  categoryName?: string;
  xpAwarded?: number;

  // Raw metrics for Stateless Performance Profiler PR evaluation
  weight?: number;
  reps?: number;
  minutes?: number;
  seconds?: number;
  distance?: number;
  floors?: number;
}

export type ExercisePillar = "weights" | "machines" | "cardio" | "bodyweight";
export type GameStat = "chestStrength" | "armStrength" | "legStrength" | "backStrength" | "coreStrength" | "cardioStamina";

export interface ExerciseInfo {
  name: string;
  pillar: ExercisePillar;
  formType: "A" | "B" | "C" | "D" | "E";
  description: string;
  builds: {
    chestStrength?: number; // e.g. 80 for 80%
    armStrength?: number;
    legStrength?: number;
    backStrength?: number;
    coreStrength?: number;
    speed?: number;
    stamina?: number;
    cardioStamina?: number;
  };
}
