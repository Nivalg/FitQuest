var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var exercises_exports = {};
__export(exercises_exports, {
  CATEGORIES: () => CATEGORIES,
  EXERCISE_DATABASE: () => EXERCISE_DATABASE
});
module.exports = __toCommonJS(exercises_exports);
const EXERCISE_DATABASE = [
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
    name: "Barbell Squat",
    pillar: "weights",
    formType: "A",
    description: "The gold standard of lower-body power and spine stability.",
    builds: {
      legStrength: 100
    },
    subCategories: ["quads", "glutes"]
  },
  {
    name: "Deadlift",
    pillar: "weights",
    formType: "A",
    description: "Heavy posterior chain lift recruiting back and legs.",
    builds: {
      backStrength: 60,
      legStrength: 40
    },
    subCategories: ["glutes"]
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
    },
    subCategories: ["hamstrings"]
  },
  {
    name: "Barbell Overhead Press",
    pillar: "weights",
    formType: "A",
    description: "Strict vertical barbell shoulder press for shoulders.",
    builds: {
      armStrength: 100
    },
    subCategories: ["shoulders"]
  },
  {
    name: "Barbell Bicep Curl",
    pillar: "weights",
    formType: "A",
    description: "Strict standing barbell curl for bicep peaks.",
    builds: {
      armStrength: 100
    },
    subCategories: ["biceps"]
  },
  {
    name: "Kettlebell Swings",
    pillar: "weights",
    formType: "A",
    description: "Explosive hip hinge swing for posterior power and speed.",
    builds: {
      legStrength: 50,
      backStrength: 30,
      speed: 20,
      stamina: 20
    },
    subCategories: ["hamstrings"]
  },
  {
    name: "Barbell Hip Thrust",
    pillar: "weights",
    formType: "A",
    description: "Barbell hip thrust targeting maximum glute isolation.",
    builds: {
      legStrength: 100,
      stamina: 20
    },
    subCategories: ["glutes"]
  },
  {
    name: "Dumbbell Squat",
    pillar: "weights",
    formType: "A",
    description: "Dumbbell squat holding weights by your sides.",
    builds: {
      legStrength: 100,
      stamina: 20
    },
    subCategories: ["quads", "glutes"]
  },
  {
    name: "Stiff Leg Deadlifts",
    pillar: "weights",
    formType: "A",
    description: "Deadlifts with stiff legs focusing on hamstrings hinge.",
    builds: {
      legStrength: 80,
      backStrength: 20,
      stamina: 20
    },
    subCategories: ["hamstrings", "glutes"]
  },
  {
    name: "Barbell Calf Raises",
    pillar: "weights",
    formType: "A",
    description: "Standing calf raises with loaded barbell.",
    builds: {
      legStrength: 100,
      stamina: 10
    },
    subCategories: ["calves"]
  },
  {
    name: "Barbell Silverback Shrug",
    pillar: "weights",
    formType: "A",
    description: "Shrugs with a forward lean to activate full traps width.",
    builds: {
      armStrength: 100
    },
    subCategories: ["traps"]
  },
  {
    name: "Dumbbell Shrug",
    pillar: "weights",
    formType: "A",
    description: "Standing shrugs holding dumbbells.",
    builds: {
      armStrength: 100
    },
    subCategories: ["traps"]
  },
  {
    name: "Barbell Upright Row",
    pillar: "weights",
    formType: "A",
    description: "Upright rowing motion to build traps and shoulders.",
    builds: {
      armStrength: 100
    },
    subCategories: ["traps", "shoulders"]
  },
  {
    name: "Kettlebell Incline Shrugs",
    pillar: "weights",
    formType: "A",
    description: "Shrugs holding kettlebells on an incline bench.",
    builds: {
      armStrength: 100
    },
    subCategories: ["traps"]
  },
  {
    name: "Dumbbell Seated Shrug",
    pillar: "weights",
    formType: "A",
    description: "Seated dumbbell shrugs targeting upper traps.",
    builds: {
      armStrength: 100
    },
    subCategories: ["traps"]
  },
  {
    name: "Dumbbell Preacher Curl",
    pillar: "weights",
    formType: "A",
    description: "Preacher bench dumbbell curl isolating the biceps.",
    builds: {
      armStrength: 100
    },
    subCategories: ["biceps"]
  },
  {
    name: "Barbell Preacher Curl",
    pillar: "weights",
    formType: "A",
    description: "EZ-bar or straight barbell preacher curl for maximum bicep isolation.",
    builds: {
      armStrength: 100
    },
    subCategories: ["biceps"]
  },
  {
    name: "Hammer Curl",
    pillar: "weights",
    formType: "A",
    description: "Neutral grip dumbbell curls building the biceps and brachialis.",
    builds: {
      armStrength: 100
    },
    subCategories: ["biceps"]
  },
  {
    name: "Barbell Bent Over Row",
    pillar: "weights",
    formType: "A",
    description: "Bent-over barbell rowing motion building back and bicep thickness.",
    builds: {
      backStrength: 70,
      armStrength: 30
    },
    subCategories: ["biceps"]
  },
  {
    name: "Dumbbell Overhead Press",
    pillar: "weights",
    formType: "A",
    description: "Seated or standing dumbbell overhead press for shoulders.",
    builds: {
      armStrength: 100
    },
    subCategories: ["shoulders"]
  },
  {
    name: "Barbell Incline Bench",
    pillar: "weights",
    formType: "A",
    description: "Incline barbell press building upper chest and shoulders.",
    builds: {
      chestStrength: 70,
      armStrength: 30
    },
    subCategories: ["shoulders"]
  },
  {
    name: "Dumbbell Incline Bench",
    pillar: "weights",
    formType: "A",
    description: "Incline dumbbell chest press building upper chest and shoulders.",
    builds: {
      chestStrength: 70,
      armStrength: 30
    },
    subCategories: ["shoulders"]
  },
  {
    name: "Dumbbell Front Raise",
    pillar: "weights",
    formType: "A",
    description: "Front dumbbell raise isolating the anterior deltoids.",
    builds: {
      armStrength: 90,
      stamina: 10
    },
    subCategories: ["shoulders"]
  },
  {
    name: "Close Grip Bench Press",
    pillar: "weights",
    formType: "A",
    description: "Close grip bench press overloading the triceps.",
    builds: {
      chestStrength: 50,
      armStrength: 50
    },
    subCategories: ["triceps"]
  },
  {
    name: "Barbell Skull Crusher",
    pillar: "weights",
    formType: "A",
    description: "EZ-bar or straight barbell extension to isolate the triceps.",
    builds: {
      armStrength: 90,
      stamina: 10
    },
    subCategories: ["triceps"]
  },
  {
    name: "Dumbbell Romanian Deadlift",
    pillar: "weights",
    formType: "A",
    description: "Romanian deadlift with dumbbells focusing on glute extension.",
    builds: {
      legStrength: 70,
      backStrength: 30
    },
    subCategories: ["glutes"]
  },
  {
    name: "Barbell Romanian Deadlift",
    pillar: "weights",
    formType: "A",
    description: "Romanian deadlift with a loaded barbell focusing on glute extension.",
    builds: {
      legStrength: 70,
      backStrength: 30
    },
    subCategories: ["glutes"]
  },
  {
    name: "Barbell Front Squat",
    pillar: "weights",
    formType: "A",
    description: "Front rack barbell squat targeting quads and deep core stability.",
    builds: {
      coreStrength: 50,
      legStrength: 50
    }
  },
  {
    name: "Dumbbell Russian Twist",
    pillar: "weights",
    formType: "A",
    description: "Seated core rotation holding a single dumbbell.",
    builds: {
      coreStrength: 80,
      stamina: 20
    }
  },
  {
    name: "Plate Russian Twist",
    pillar: "weights",
    formType: "A",
    description: "Seated core rotation holding a weight plate.",
    builds: {
      coreStrength: 80,
      stamina: 20
    }
  },
  {
    name: "Plate Sit-Ups",
    pillar: "weights",
    formType: "A",
    description: "Weighted sit-up holding a weight plate against the chest.",
    builds: {
      coreStrength: 90,
      stamina: 10
    }
  },
  {
    name: "Good Mornings",
    pillar: "weights",
    formType: "A",
    description: "Barbell hip hinge targeting the hamstrings and lower back.",
    builds: {
      legStrength: 70,
      backStrength: 30
    },
    subCategories: ["hamstrings"]
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
    name: "Cable Pec Fly",
    pillar: "machines",
    formType: "A",
    description: "Cable chest fly targeting inner and lower pec squeeze.",
    builds: {
      chestStrength: 80,
      stamina: 20
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
    name: "Machine Leg Press",
    pillar: "machines",
    formType: "A",
    description: "Seated deep leg sled pressing to overload quads.",
    builds: {
      legStrength: 50,
      stamina: 50
    },
    subCategories: ["quads", "glutes"]
  },
  {
    name: "Machine Hamstring Curl",
    pillar: "machines",
    formType: "A",
    description: "Isolated hamstring curls targeting knee flexion.",
    builds: {
      legStrength: 80,
      stamina: 20
    },
    subCategories: ["hamstrings"]
  },
  {
    name: "Cable Tricep Pushdown",
    pillar: "machines",
    formType: "A",
    description: "Cable extension targeting tricep isolation.",
    builds: {
      armStrength: 80,
      stamina: 20
    },
    subCategories: ["triceps"]
  },
  {
    name: "Cable Bicep Curl",
    pillar: "machines",
    formType: "A",
    description: "Double-arm cable curls with constant tension.",
    builds: {
      stamina: 70,
      armStrength: 30
    },
    subCategories: ["biceps"]
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
  {
    name: "Machine Leg Extension",
    pillar: "machines",
    formType: "A",
    description: "Machine leg extensions isolating the quadriceps.",
    builds: {
      legStrength: 100,
      stamina: 30
    },
    subCategories: ["quads"]
  },
  {
    name: "Hip Abduction Machine",
    pillar: "machines",
    formType: "A",
    description: "Machine outer thigh drive to build glute medius stability.",
    builds: {
      legStrength: 80,
      stamina: 20
    },
    subCategories: ["glutes"]
  },
  {
    name: "Cable Pull Through",
    pillar: "machines",
    formType: "A",
    description: "Cable pull-throughs targeting hamstring stretch.",
    builds: {
      legStrength: 70,
      coreStrength: 10,
      stamina: 20
    },
    subCategories: ["hamstrings"]
  },
  {
    name: "Machine Standing Calf Raises",
    pillar: "machines",
    formType: "A",
    description: "Standing machine raises overloading the calves.",
    builds: {
      legStrength: 100,
      stamina: 10
    },
    subCategories: ["calves"]
  },
  {
    name: "Machine Sitting Calf Raises",
    pillar: "machines",
    formType: "A",
    description: "Seated machine raises targeting the soleus calves muscle.",
    builds: {
      legStrength: 100,
      stamina: 10
    },
    subCategories: ["calves"]
  },
  {
    name: "Cable Shrug",
    pillar: "machines",
    formType: "A",
    description: "Cable shrugs providing continuous traps tension.",
    builds: {
      armStrength: 80,
      stamina: 20
    },
    subCategories: ["traps"]
  },
  {
    name: "Cable Lateral Raise",
    pillar: "machines",
    formType: "A",
    description: "Side lateral raise with cables isolating the lateral deltoids.",
    builds: {
      armStrength: 80,
      stamina: 20
    },
    subCategories: ["shoulders"]
  },
  {
    name: "Glute Kickback",
    pillar: "machines",
    formType: "A",
    description: "Cable or machine kickbacks isolating the glutes through hip extension.",
    builds: {
      legStrength: 80,
      stamina: 20
    },
    subCategories: ["glutes"]
  },
  {
    name: "Machine Hip Thrust",
    pillar: "machines",
    formType: "A",
    description: "Machine hip thrusts isolating and overloading the glute max.",
    builds: {
      legStrength: 80,
      stamina: 20
    },
    subCategories: ["glutes"]
  },
  {
    name: "Gluteator",
    pillar: "machines",
    formType: "A",
    description: "Gluteator machine rotation targeting deep outer glute development.",
    builds: {
      legStrength: 80,
      stamina: 20
    },
    subCategories: ["glutes"]
  },
  // 3. BODYWEIGHT
  {
    name: "Regular Push-Ups",
    pillar: "bodyweight",
    formType: "B",
    description: "Pistons of pushing power using your own body's angle.",
    builds: {
      stamina: 50,
      chestStrength: 30,
      armStrength: 20
    },
    subCategories: ["biceps", "shoulders", "traps"]
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
    },
    subCategories: ["triceps"]
  },
  {
    name: "Overhand Pull-Ups",
    pillar: "bodyweight",
    formType: "B",
    description: "Strict vertical pull for back and biceps strength.",
    builds: {
      backStrength: 70,
      stamina: 30
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
    },
    subCategories: ["quads", "glutes"]
  },
  {
    name: "Chin-Ups",
    pillar: "bodyweight",
    formType: "B",
    description: "Underhand vertical pull for lats and bicep peaks.",
    builds: {
      armStrength: 100
    },
    subCategories: ["biceps"]
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
  {
    name: "Calf Raises",
    pillar: "bodyweight",
    formType: "B",
    description: "Raise on toes to isolate and build the calf muscles.",
    builds: {
      legStrength: 100,
      stamina: 20
    },
    subCategories: ["calves"]
  },
  {
    name: "Lunges",
    pillar: "bodyweight",
    formType: "B",
    description: "Bodyweight lunges targeting glute power and stability.",
    builds: {
      legStrength: 80,
      stamina: 35
    },
    subCategories: ["glutes"]
  },
  {
    name: "Forward Lunges",
    pillar: "bodyweight",
    formType: "B",
    description: "Alternating lunges stepping forward to isolate quadriceps.",
    builds: {
      legStrength: 80,
      stamina: 30
    },
    subCategories: ["quads"]
  },
  {
    name: "Bench Dips",
    pillar: "bodyweight",
    formType: "B",
    description: "Weighted or bodyweight dips performed off a flat bench.",
    builds: {
      armStrength: 70,
      stamina: 30
    },
    subCategories: ["triceps"]
  },
  {
    name: "Diamond Push-Ups",
    pillar: "bodyweight",
    formType: "B",
    description: "Close grip pushups placing maximum load on the triceps.",
    builds: {
      armStrength: 75,
      stamina: 25
    },
    subCategories: ["triceps"]
  },
  {
    name: "Squat Jumps",
    pillar: "bodyweight",
    formType: "B",
    description: "Explosive bodyweight squats jumping off the ground.",
    builds: {
      legStrength: 50,
      speed: 50
    }
  },
  {
    name: "Jumping Jacks",
    pillar: "bodyweight",
    formType: "B",
    description: "Classic jumping jacks for continuous conditioning.",
    builds: {
      stamina: 100
    }
  },
  {
    name: "Burpees",
    pillar: "bodyweight",
    formType: "B",
    description: "Full-body burpees linking push-ups and squat jumps.",
    builds: {
      stamina: 80,
      coreStrength: 20
    }
  },
  {
    name: "Bodyweight Reverse Lunge",
    pillar: "bodyweight",
    formType: "B",
    description: "Step backward into a lunge to overload hamstrings and glutes.",
    builds: {
      legStrength: 70,
      stamina: 30
    },
    subCategories: ["hamstrings"]
  },
  // 4. CARDIO
  {
    name: "Treadmill Run / Jog",
    pillar: "cardio",
    formType: "D",
    description: "High-cadence run or jog tracking distance and pace.",
    builds: {
      stamina: 80,
      speed: 20
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
  },
  {
    name: "Bicycle",
    pillar: "cardio",
    formType: "D",
    description: "Cycling on a stationary or road bike for endurance and speed.",
    builds: {
      stamina: 50,
      speed: 50
    }
  },
  {
    name: "Elliptical",
    pillar: "cardio",
    formType: "D",
    description: "Low-impact gliding on the elliptical trainer.",
    builds: {
      stamina: 50,
      speed: 50
    }
  },
  {
    name: "Rowing Machine",
    pillar: "cardio",
    formType: "D",
    description: "Rowing ergometer workout tracking distance and time.",
    builds: {
      stamina: 70,
      backStrength: 30
    }
  }
];
const CATEGORIES = [
  { id: "weights", name: "Free Weights" },
  { id: "machines", name: "Machines" },
  { id: "bodyweight", name: "Bodyweight" },
  { id: "cardio", name: "Cardio" }
];
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  CATEGORIES,
  EXERCISE_DATABASE
});
