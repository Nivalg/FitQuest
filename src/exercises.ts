import { ExerciseInfo } from "./types";

export const EXERCISE_DATABASE: ExerciseInfo[] = [
  // 1. FREE WEIGHTS
  {
    name: "Bench Press",
    pillar: "weights",
    formType: "A",
    description: "Classic horizontal press. Excellent for structural chest pushing force.",
    builds: {
      chestStrength: 80,
      armStrength: 20
    }
  },
  {
    name: "Incline Dumbbell Press",
    pillar: "weights",
    formType: "A",
    description: "Incline press targeting upper chest clavicular fibers.",
    builds: {
      chestStrength: 70,
      armStrength: 30
    }
  },
  {
    name: "Barbell Squat",
    pillar: "weights",
    formType: "A",
    description: "The gold standard of lower-body power and spine stability.",
    builds: {
      legStrength: 100
    }
  },
  {
    name: "Deadlift",
    pillar: "weights",
    formType: "A",
    description: "Heavy posterior chain lift recruiting back and legs.",
    builds: {
      backStrength: 60,
      legStrength: 40
    }
  },
  {
    name: "Barbell Row",
    pillar: "weights",
    formType: "A",
    description: "Horizontal row targeting back width and thickness.",
    builds: {
      backStrength: 80,
      armStrength: 20
    }
  },
  {
    name: "Romanian Deadlift",
    pillar: "weights",
    formType: "A",
    description: "Hamstring and glute overload focusing on hip hinge.",
    builds: {
      legStrength: 70,
      backStrength: 30
    }
  },
  {
    name: "Overhead Press",
    pillar: "weights",
    formType: "A",
    description: "Strict vertical barbell shoulder press for shoulders.",
    builds: {
      armStrength: 100
    }
  },
  {
    name: "Barbell Bicep Curl",
    pillar: "weights",
    formType: "A",
    description: "Strict standing barbell curl for bicep peaks.",
    builds: {
      armStrength: 100
    }
  },
  {
    name: "Kettlebell Swings",
    pillar: "weights",
    formType: "A",
    description: "Explosive hip hinge swing for posterior power and speed.",
    builds: {
      legStrength: 50,
      backStrength: 30,
      speed: 20
    }
  },

  // 2. MACHINES
  {
    name: "Chest Fly Machine",
    pillar: "machines",
    formType: "A",
    description: "Pec deck isolator targeting inner chest contraction.",
    builds: {
      chestStrength: 70,
      stamina: 30
    }
  },
  {
    name: "Cable Crossover",
    pillar: "machines",
    formType: "A",
    description: "Cable flies targeting complete chest squeeze.",
    builds: {
      chestStrength: 80,
      stamina: 20
    }
  },
  {
    name: "Lat Pulldown Machine",
    pillar: "machines",
    formType: "A",
    description: "Wide vertical cable pulldowns for back width.",
    builds: {
      backStrength: 50,
      stamina: 50
    }
  },
  {
    name: "Seated Cable Row",
    pillar: "machines",
    formType: "A",
    description: "Cable pull targeting mid-back thickness.",
    builds: {
      backStrength: 70,
      stamina: 30
    }
  },
  {
    name: "Leg Press Machine",
    pillar: "machines",
    formType: "A",
    description: "Seated deep leg sled pressing to overload quads.",
    builds: {
      legStrength: 50,
      stamina: 50
    }
  },
  {
    name: "Leg Curl Machine",
    pillar: "machines",
    formType: "A",
    description: "Isolated hamstring curls targeting knee flexion.",
    builds: {
      legStrength: 80,
      stamina: 20
    }
  },
  {
    name: "Cable Tricep Pushdown",
    pillar: "machines",
    formType: "A",
    description: "Cable extension targeting tricep isolation.",
    builds: {
      armStrength: 80,
      stamina: 20
    }
  },
  {
    name: "Cable Bicep Curl",
    pillar: "machines",
    formType: "A",
    description: "Double-arm cable curls with constant tension.",
    builds: {
      stamina: 70,
      armStrength: 30
    }
  },
  {
    name: "Cable Crunch",
    pillar: "machines",
    formType: "A",
    description: "Kneeling cable crunch to overload upper abs.",
    builds: {
      coreStrength: 80,
      stamina: 20
    }
  },

  // 3. BODYWEIGHT
  {
    name: "Regular Push-Ups",
    pillar: "bodyweight",
    formType: "B",
    description: "Pistons of pushing power using your own body's angle.",
    builds: {
      stamina: 70,
      chestStrength: 30
    }
  },
  {
    name: "Dips",
    pillar: "bodyweight",
    formType: "B",
    description: "Deep parallel bars pressing that blasts triceps.",
    builds: {
      armStrength: 50,
      stamina: 30,
      chestStrength: 20
    }
  },
  {
    name: "Regular Pull-Ups",
    pillar: "bodyweight",
    formType: "B",
    description: "Strict vertical pull for back and biceps strength.",
    builds: {
      stamina: 60,
      backStrength: 40
    }
  },
  {
    name: "Inverted Rows",
    pillar: "bodyweight",
    formType: "B",
    description: "Horizontal bodyweight row targeting mid-back thickness.",
    builds: {
      backStrength: 70,
      stamina: 30
    }
  },
  {
    name: "Bodyweight Squats",
    pillar: "bodyweight",
    formType: "B",
    description: "High-rep squats for lower body stamina.",
    builds: {
      stamina: 70,
      legStrength: 30
    }
  },
  {
    name: "Chin-Ups",
    pillar: "bodyweight",
    formType: "B",
    description: "Underhand vertical pull for lats and bicep peaks.",
    builds: {
      backStrength: 50,
      armStrength: 50
    }
  },
  {
    name: "Hanging Knee Raises",
    pillar: "bodyweight",
    formType: "B",
    description: "Hanging knee raises targeting lower abs.",
    builds: {
      coreStrength: 80,
      stamina: 20
    }
  },
  {
    name: "Plank",
    pillar: "bodyweight",
    formType: "C",
    description: "Isometric core shield holding in straight alignment.",
    builds: {
      coreStrength: 80,
      stamina: 20
    }
  },
  {
    name: "Sit-Ups",
    pillar: "bodyweight",
    formType: "B",
    description: "Classic trunk flexes that demand stability.",
    builds: {
      coreStrength: 60,
      stamina: 40
    }
  },
  {
    name: "Ab Wheel Rollout",
    pillar: "bodyweight",
    formType: "B",
    description: "Rollout targeting deep core stabilization.",
    builds: {
      coreStrength: 90,
      stamina: 10
    }
  },
  {
    name: "Decline Crunch",
    pillar: "bodyweight",
    formType: "B",
    description: "Decline crunch targeting core endurance.",
    builds: {
      coreStrength: 70,
      stamina: 30
    }
  },
  {
    name: "Agility Ladder Drills",
    pillar: "bodyweight",
    formType: "B",
    description: "High-speed ladder footwork for coordination and speed.",
    builds: {
      speed: 60,
      stamina: 40
    }
  },
  {
    name: "Box Jumps",
    pillar: "bodyweight",
    formType: "B",
    description: "Vertical jumps targeting explosive power and speed.",
    builds: {
      legStrength: 50,
      speed: 50
    }
  },

  // 4. CARDIO
  {
    name: "Treadmill Run / Jog",
    pillar: "cardio",
    formType: "D",
    description: "High-cadence run or jog tracking distance and pace.",
    builds: {
      stamina: 100
    }
  },
  {
    name: "Sprint Intervals",
    pillar: "cardio",
    formType: "D",
    description: "High-intensity sprint bursts to push speed.",
    builds: {
      stamina: 70,
      legStrength: 30
    }
  },
  {
    name: "Stairmaster",
    pillar: "cardio",
    formType: "E",
    description: "Continuous vertical climbing to test quad endurance.",
    builds: {
      stamina: 60,
      legStrength: 40
    }
  },
  {
    name: "Jump Rope",
    pillar: "cardio",
    formType: "C",
    description: "Continuous rope jumping for stamina and light speed.",
    builds: {
      stamina: 80,
      speed: 20
    }
  }
];

export const CATEGORIES = [
  { id: "weights", name: "Free Weights" },
  { id: "machines", name: "Machines" },
  { id: "bodyweight", name: "Bodyweight" },
  { id: "cardio", name: "Cardio" }
];
