import { ExerciseInfo, ExercisePillar, MuscleKey } from "./types";

export function deriveBuildsFromMuscles(
  muscles: Partial<Record<MuscleKey, number>>,
  pillar: ExercisePillar
): ExerciseInfo["builds"] {
  if (pillar === "cardio") {
    return { cardio: 100 };
  }

  let chestW = muscles.chest || 0;
  let backW = muscles.back || 0;
  let coreW = muscles.core || 0;
  let armW = (muscles.biceps || 0) + (muscles.triceps || 0) + (muscles.shoulders || 0) + (muscles.traps || 0);
  let legW = (muscles.quads || 0) + (muscles.hamstrings || 0) + (muscles.glutes || 0) + (muscles.calves || 0);

  const total = chestW + backW + coreW + armW + legW;
  if (total <= 0) return {};

  const builds: ExerciseInfo["builds"] = {};
  if (chestW > 0) builds.chestStrength = Math.round((chestW / total) * 100);
  if (backW > 0) builds.backStrength = Math.round((backW / total) * 100);
  if (coreW > 0) builds.coreStrength = Math.round((coreW / total) * 100);
  if (armW > 0) builds.armStrength = Math.round((armW / total) * 100);
  if (legW > 0) builds.legStrength = Math.round((legW / total) * 100);

  return builds;
}

const RAW_EXERCISE_DATABASE: (Omit<ExerciseInfo, "builds"> & { builds?: ExerciseInfo["builds"] })[] = [
  // 1. FREE WEIGHTS
  {
    name: "Bench Press",
    pillar: "weights",
    formType: "A",
    description: "Classic horizontal press. Excellent for structural chest pushing force.",
    muscles: { chest: 1, triceps: 0.5, shoulders: 0.5 },
    image: "/bench_press_nes.gif?v=5",
    images: ["/bench_press_up.png?v=5", "/bench_press_down.png?v=5"]
  },
  {
    name: "Barbell Squat",
    pillar: "weights",
    formType: "A",
    description: "The gold standard of lower-body power and spine stability.",
    muscles: { quads: 1, glutes: 0.5, core: 0.25 },
    link: "https://liftmanual.com/barbell-squat/"
  },
  {
    name: "Power Clean",
    pillar: "weights",
    formType: "A",
    description: "Explosive Olympic lift pulling a barbell from the floor to the shoulders.",
    muscles: { traps: 1, quads: 0.5, hamstrings: 0.5, glutes: 0.5, back: 0.25 },
    image: "/power_clean.png?v=1"
  },
  {
    name: "Dumbbell Lunges",
    pillar: "weights",
    formType: "A",
    description: "Walking or stationary lunges holding dumbbells to build leg power and speed.",
    muscles: { quads: 1, glutes: 1, hamstrings: 0.25 }
  },
  {
    name: "Deadlift",
    pillar: "weights",
    formType: "A",
    description: "Heavy posterior chain lift recruiting back and legs.",
    muscles: { back: 1, hamstrings: 1, glutes: 1, traps: 0.5, quads: 0.25, core: 0.25 },
    link: "https://liftmanual.com/barbell-deadlift/"
  },
  {
    name: "Barbell Row",
    pillar: "weights",
    formType: "A",
    description: "Horizontal row targeting back width and thickness.",
    muscles: { back: 1, biceps: 0.5, shoulders: 0.25 },
    link: "https://liftmanual.com/bent-over-row/"
  },
  {
    name: "Romanian Deadlift",
    pillar: "weights",
    formType: "A",
    description: "Hamstring and glute overload focusing on hip hinge.",
    muscles: { hamstrings: 1, glutes: 0.5, back: 0.25 },
    link: "https://liftmanual.com/barbell-romanian-deadlift/"
  },
  {
    name: "Barbell Overhead Press",
    pillar: "weights",
    formType: "A",
    description: "Strict vertical barbell shoulder press for shoulders.",
    muscles: { shoulders: 1, triceps: 0.5 }
  },
  {
    name: "Barbell Bicep Curl",
    pillar: "weights",
    formType: "A",
    description: "Strict standing barbell curl for bicep peaks.",
    muscles: { biceps: 1 },
    link: "https://liftmanual.com/barbell-curl/"
  },
  {
    name: "Kettlebell Swings",
    pillar: "weights",
    formType: "A",
    description: "Explosive hip hinge swing for posterior power and speed.",
    muscles: { glutes: 1, hamstrings: 0.5, back: 0.25 },
    link: "https://liftmanual.com/kettlebell-swing/"
  },
  {
    name: "Barbell Hip Thrust",
    pillar: "weights",
    formType: "A",
    description: "Barbell hip thrust targeting maximum glute isolation.",
    muscles: { glutes: 1, hamstrings: 0.25 },
    link: "https://liftmanual.com/barbell-hip-thrust/"
  },
  {
    name: "Dumbbell Squat",
    pillar: "weights",
    formType: "A",
    description: "Dumbbell squat holding weights by your sides.",
    muscles: { quads: 1, glutes: 0.5 },
    link: "https://liftmanual.com/dumbbell-squat/"
  },
  {
    name: "Stiff Leg Deadlifts",
    pillar: "weights",
    formType: "A",
    description: "Deadlifts with stiff legs focusing on hamstrings hinge.",
    muscles: { hamstrings: 1, glutes: 0.5, back: 0.25 }
  },
  {
    name: "Barbell Calf Raises",
    pillar: "weights",
    formType: "A",
    description: "Standing calf raises with loaded barbell.",
    muscles: { calves: 1 }
  },
  {
    name: "Barbell Silverback Shrug",
    pillar: "weights",
    formType: "A",
    description: "Shrugs with a forward lean to activate full traps width.",
    muscles: { traps: 1 }
  },
  {
    name: "Dumbbell Shrug",
    pillar: "weights",
    formType: "A",
    description: "Standing shrugs holding dumbbells.",
    muscles: { traps: 1 },
    link: "https://liftmanual.com/dumbbell-shrug/"
  },
  {
    name: "Barbell Upright Row",
    pillar: "weights",
    formType: "A",
    description: "Upright rowing motion to build traps and shoulders.",
    muscles: { traps: 1, shoulders: 1 },
    link: "https://liftmanual.com/barbell-upright-row/"
  },
  {
    name: "Kettlebell Incline Shrugs",
    pillar: "weights",
    formType: "A",
    description: "Shrugs holding kettlebells on an incline bench.",
    muscles: { traps: 1 }
  },
  {
    name: "Dumbbell Seated Shrug",
    pillar: "weights",
    formType: "A",
    description: "Seated dumbbell shrugs targeting upper traps.",
    muscles: { traps: 1 }
  },
  {
    name: "Dumbbell Preacher Curl",
    pillar: "weights",
    formType: "A",
    description: "Preacher bench dumbbell curl isolating the biceps.",
    muscles: { biceps: 1 },
    link: "https://liftmanual.com/dumbbell-preacher-curl/"
  },
  {
    name: "Barbell Preacher Curl",
    pillar: "weights",
    formType: "A",
    description: "EZ-bar or straight barbell preacher curl for maximum bicep isolation.",
    muscles: { biceps: 1 },
    link: "https://liftmanual.com/barbell-preacher-curl/"
  },
  {
    name: "Hammer Curl",
    pillar: "weights",
    formType: "A",
    description: "Neutral grip dumbbell curls building the biceps and brachialis.",
    muscles: { biceps: 1 },
    link: "https://liftmanual.com/dumbbell-hammer-curl/"
  },
  {
    name: "Barbell Bent Over Row",
    pillar: "weights",
    formType: "A",
    description: "Bent-over barbell rowing motion building back and bicep thickness.",
    muscles: { back: 1, biceps: 0.5, shoulders: 0.25 },
    link: "https://liftmanual.com/bent-over-row/"
  },
  {
    name: "Dumbbell Overhead Press",
    pillar: "weights",
    formType: "A",
    description: "Seated or standing dumbbell overhead press for shoulders.",
    muscles: { shoulders: 1, triceps: 0.5 }
  },
  {
    name: "Barbell Incline Bench",
    pillar: "weights",
    formType: "A",
    description: "Incline barbell press building upper chest and shoulders.",
    muscles: { chest: 1, shoulders: 0.5, triceps: 0.5 },
    image: "/incline_press_nes.gif?v=5",
    images: ["/incline_press_up.png?v=5", "/incline_press_down.png?v=5"]
  },
  {
    name: "Dumbbell Incline Bench",
    pillar: "weights",
    formType: "A",
    description: "Incline dumbbell chest press building upper chest and shoulders.",
    muscles: { chest: 1, shoulders: 0.5, triceps: 0.5 },
    image: "/incline_dumbbells_nes.gif?v=5",
    images: ["/incline_dumbbells_up.png?v=5", "/incline_dumbbells_down.png?v=5"]
  },
  {
    name: "Dumbbell Front Raise",
    pillar: "weights",
    formType: "A",
    description: "Front dumbbell raise isolating the anterior deltoids.",
    muscles: { shoulders: 1 },
    link: "https://liftmanual.com/dumbbell-front-raise/"
  },
  {
    name: "Close Grip Bench Press",
    pillar: "weights",
    formType: "A",
    description: "Close grip bench press overloading the triceps.",
    muscles: { triceps: 1, chest: 0.5, shoulders: 0.25 },
    image: "/bench_press_nes.gif?v=5",
    images: ["/bench_press_up.png?v=5", "/bench_press_down.png?v=5"]
  },
  {
    name: "Barbell Skull Crusher",
    pillar: "weights",
    formType: "A",
    description: "EZ-bar or straight barbell extension to isolate the triceps.",
    muscles: { triceps: 1 },
    image: "/barbell_skull_crusher_up.png?v=5",
    images: ["/barbell_skull_crusher_up.png?v=5", "/barbell_skull_crusher_down.png?v=5"]
  },
  {
    name: "Dumbbell Romanian Deadlift",
    pillar: "weights",
    formType: "A",
    description: "Romanian deadlift with dumbbells focusing on glute extension.",
    muscles: { hamstrings: 1, glutes: 0.5, back: 0.25 },
    link: "https://liftmanual.com/dumbbell-romanian-deadlift/"
  },
  {
    name: "Barbell Romanian Deadlift",
    pillar: "weights",
    formType: "A",
    description: "Romanian deadlift with a loaded barbell focusing on glute extension.",
    muscles: { hamstrings: 1, glutes: 0.5, back: 0.25 },
    link: "https://liftmanual.com/barbell-romanian-deadlift/"
  },
  {
    name: "Barbell Front Squat",
    pillar: "weights",
    formType: "A",
    description: "Front rack barbell squat targeting quads and deep core stability.",
    muscles: { quads: 1, glutes: 0.5, core: 0.25 },
    link: "https://liftmanual.com/barbell-front-squat/"
  },
  {
    name: "Dumbbell Russian Twist",
    pillar: "weights",
    formType: "A",
    description: "Seated core rotation holding a single dumbbell.",
    muscles: { core: 1 },
    link: "https://liftmanual.com/dumbbell-russian-twist/"
  },
  {
    name: "Plate Russian Twist",
    pillar: "weights",
    formType: "A",
    description: "Seated core rotation holding a weight plate.",
    muscles: { core: 1 }
  },
  {
    name: "Plate Sit-Ups",
    pillar: "weights",
    formType: "A",
    description: "Weighted sit-up holding a weight plate against the chest.",
    muscles: { core: 1 }
  },
  {
    name: "Good Mornings",
    pillar: "weights",
    formType: "A",
    description: "Barbell hip hinge targeting the hamstrings and lower back.",
    muscles: { hamstrings: 1, glutes: 0.5, back: 0.5 },
    link: "https://liftmanual.com/good-morning/"
  },
  {
    name: "Dumbbell Chest Fly",
    pillar: "weights",
    formType: "A",
    description: "Dumbbell chest flyes isolating the pectoral muscles.",
    muscles: { chest: 1, shoulders: 0.25 },
    image: "/dumbbell_fly_nes.gif?v=5",
    images: ["/dumbbell_fly_up.png?v=5", "/dumbbell_fly_down.png?v=5"]
  },
  {
    name: "Weighted Decline Sit-Up",
    pillar: "weights",
    formType: "A",
    description: "Decline bench crunch holding a plate or dumbbell to load the core.",
    muscles: { core: 1 },
    link: "https://liftmanual.com/weighted-decline-sit-up/"
  },
  {
    name: "Weighted Crunch",
    pillar: "weights",
    formType: "A",
    description: "Standard abdominal crunch holding a plate for core resistance.",
    muscles: { core: 1 },
    link: "https://liftmanual.com/weighted-crunch/"
  },

  // 2. MACHINES
  {
    name: "Chest Fly Machine",
    pillar: "machines",
    formType: "A",
    description: "Pec deck isolator targeting inner chest contraction.",
    muscles: { chest: 1, shoulders: 0.25 },
    link: "https://liftmanual.com/pec-deck-fly/",
    image: "/chest_fly_machine.png?v=1"
  },
  {
    name: "Cable Pec Fly",
    pillar: "machines",
    formType: "A",
    description: "Cable chest fly targeting inner and lower pec squeeze.",
    muscles: { chest: 1, shoulders: 0.25 },
    image: "/cable_pec_fly.png?v=1"
  },
  {
    name: "Cable Crossover",
    pillar: "machines",
    formType: "A",
    description: "Cable flies targeting complete chest squeeze.",
    muscles: { chest: 1, shoulders: 0.25 },
    link: "https://liftmanual.com/cable-crossover/",
    image: "/cable_crossover.png?v=1"
  },
  {
    name: "Lat Pulldown Machine",
    pillar: "machines",
    formType: "A",
    description: "Wide vertical cable pulldowns for back width.",
    muscles: { back: 1, biceps: 0.5 },
    link: "https://liftmanual.com/cable-wide-grip-lat-pulldown/",
    image: "/lat_pulldown_machine.png?v=1"
  },
  {
    name: "Seated Cable Row",
    pillar: "machines",
    formType: "A",
    description: "Cable pull targeting mid-back thickness.",
    muscles: { back: 1, biceps: 0.5, traps: 0.25 },
    image: "/seated_cable_row.png?v=1"
  },
  {
    name: "Machine Leg Press",
    pillar: "machines",
    formType: "A",
    description: "Seated deep leg sled pressing to overload quads.",
    muscles: { quads: 1, glutes: 0.5 },
    image: "/machine_leg_press.png?v=1"
  },
  {
    name: "Machine Hamstring Curl",
    pillar: "machines",
    formType: "A",
    description: "Isolated hamstring curls targeting knee flexion.",
    muscles: { hamstrings: 1 },
    image: "/machine_hamstring_curl.png?v=1"
  },
  {
    name: "Lying Leg Curl",
    pillar: "machines",
    formType: "A",
    description: "Lying prone machine curl isolating hamstring contraction.",
    muscles: { hamstrings: 1 }
  },
  {
    name: "Cable Tricep Pushdown",
    pillar: "machines",
    formType: "A",
    description: "Cable extension targeting tricep isolation.",
    muscles: { triceps: 1 },
    image: "/cable_tricep_pushdown.png?v=6"
  },
  {
    name: "Cable Bicep Curl",
    pillar: "machines",
    formType: "A",
    description: "Double-arm cable curls with constant tension.",
    muscles: { biceps: 1 },
    image: "/cable_bicep_curl.png?v=1"
  },
  {
    name: "Cable Crunch",
    pillar: "machines",
    formType: "A",
    description: "Kneeling cable crunch to overload upper abs.",
    muscles: { core: 1 },
    image: "/cable_crunch.png?v=1"
  },
  {
    name: "Machine Leg Extension",
    pillar: "machines",
    formType: "A",
    description: "Machine leg extensions isolating the quadriceps.",
    muscles: { quads: 1 },
    link: "https://liftmanual.com/leg-extension/"
  },
  {
    name: "Hip Abduction Machine",
    pillar: "machines",
    formType: "A",
    description: "Machine outer thigh drive to build glute medius stability.",
    muscles: { glutes: 1 },
    image: "/hip_abduction_machine.png?v=1"
  },
  {
    name: "Cable Pull Through",
    pillar: "machines",
    formType: "A",
    description: "Cable pull-throughs targeting hamstring stretch.",
    muscles: { glutes: 1, hamstrings: 0.5 },
    image: "/cable_pull_through.png?v=1"
  },
  {
    name: "Machine Standing Calf Raises",
    pillar: "machines",
    formType: "A",
    description: "Standing machine raises overloading the calves.",
    muscles: { calves: 1 },
    image: "/machine_standing_calf_raises.png?v=1"
  },
  {
    name: "Machine Sitting Calf Raises",
    pillar: "machines",
    formType: "A",
    description: "Seated machine raises targeting the soleus calves muscle.",
    muscles: { calves: 1 },
    image: "/machine_sitting_calf_raises.png?v=1"
  },
  {
    name: "Cable Shrug",
    pillar: "machines",
    formType: "A",
    description: "Cable shrugs providing continuous traps tension.",
    muscles: { traps: 1 },
    image: "/cable_shrug.png?v=1"
  },
  {
    name: "Cable Lateral Raise",
    pillar: "machines",
    formType: "A",
    description: "Side lateral raise with cables isolating the lateral deltoids.",
    muscles: { shoulders: 1 },
    image: "/cable_lateral_raise.png?v=1"
  },
  {
    name: "Glute Kickback",
    pillar: "machines",
    formType: "A",
    description: "Cable or machine kickbacks isolating the glutes through hip extension.",
    muscles: { glutes: 1 },
    image: "/glute_kickback.png?v=1"
  },
  {
    name: "Smith Machine Hip Thrust",
    pillar: "machines",
    formType: "A",
    description: "Smith machine hip thrusts isolating and overloading the glute max.",
    muscles: { glutes: 1, hamstrings: 0.25 },
    image: "/smith_machine_hip_thrust.png?v=1"
  },
  {
    name: "Smith Machine Squat",
    pillar: "machines",
    formType: "A",
    description: "Squatting on a Smith machine to guide the vertical bar path and isolate quads and glutes.",
    muscles: { quads: 1, glutes: 0.5 },
    image: "/smith_machine_squat.png?v=1"
  },
  {
    name: "Hack Squat",
    pillar: "machines",
    formType: "A",
    description: "An angled sled machine squat focusing on chest-up stability to overload thighs and glutes.",
    muscles: { quads: 1, glutes: 0.5 },
    image: "/hack_squat.png?v=1"
  },
  {
    name: "Machine Chest Press",
    pillar: "machines",
    formType: "A",
    description: "Seated chest press machine to isolate and build the pectorals.",
    muscles: { chest: 1, triceps: 0.5, shoulders: 0.5 },
    link: "https://liftmanual.com/machine-chest-press/",
    image: "/machine_chest_press.png?v=1"
  },
  {
    name: "Smith Machine Bench Press",
    pillar: "machines",
    formType: "A",
    description: "Bench press performed on a Smith machine for path control.",
    muscles: { chest: 1, triceps: 0.5, shoulders: 0.5 },
    link: "https://liftmanual.com/smith-bench-press/",
    image: "/smith_machine_bench_press.png?v=1"
  },
  {
    name: "Machine Incline Press",
    pillar: "machines",
    formType: "A",
    description: "Incline seated chest press machine targeting the upper pecs.",
    muscles: { chest: 1, triceps: 0.5, shoulders: 0.5 },
    link: "https://liftmanual.com/machine-incline-press/",
    image: "/machine_incline_press.png?v=1"
  },
  {
    name: "Machine Assisted Pull-Up",
    pillar: "machines",
    formType: "A",
    description: "Machine-assisted pull-ups to build back strength and control.",
    muscles: { back: 1, biceps: 0.5 },
    link: "https://liftmanual.com/assisted-pull-up/",
    image: "/machine_assisted_pull_up.png?v=1"
  },
  {
    name: "Close-Grip Lat Pulldown",
    pillar: "machines",
    formType: "A",
    description: "Cable pulldowns using a close-grip V-bar to build lat thickness.",
    muscles: { back: 1, biceps: 0.5 },
    link: "https://liftmanual.com/close-grip-lat-pulldown/",
    image: "/close_grip_lat_pulldown.png?v=1"
  },
  {
    name: "Cable Straight-Arm Pulldown",
    pillar: "machines",
    formType: "A",
    description: "Straight-arm pull-downs isolating the lats and back length.",
    muscles: { back: 1 },
    link: "https://liftmanual.com/cable-straight-arm-pulldown/",
    image: "/cable_straight_arm_pulldown.png?v=1"
  },
  {
    name: "Machine Preacher Curl",
    pillar: "machines",
    formType: "A",
    description: "Seated preacher curl machine isolating the biceps brachii.",
    muscles: { biceps: 1 },
    image: "/machine_preacher_curl.png?v=1"
  },
  {
    name: "Cable Overhead Tricep Extension",
    pillar: "machines",
    formType: "A",
    description: "Cable rope extensions overhead to target the long head triceps.",
    muscles: { triceps: 1 },
    image: "/cable_overhead_tricep_extension.png?v=1"
  },
  {
    name: "Machine Seated Dips",
    pillar: "machines",
    formType: "A",
    description: "Seated dip machine to overload the triceps and chest.",
    muscles: { triceps: 1, chest: 0.25 },
    image: "/machine_seated_dips.png?v=1"
  },
  {
    name: "Machine Ab Crunch",
    pillar: "machines",
    formType: "A",
    description: "Seated abdominal crunch machine to load the core.",
    muscles: { core: 1 },
    image: "/machine_ab_crunch.png?v=1"
  },
  {
    name: "Cable Woodchopper",
    pillar: "machines",
    formType: "A",
    description: "Cable pull twisting diagonally to target core rotators and obliques.",
    muscles: { core: 1 },
    image: "/cable_woodchopper.png?v=1"
  },
  {
    name: "Cable Standing Oblique Twist",
    pillar: "machines",
    formType: "A",
    description: "Oblique rotation with a horizontal cable pull.",
    muscles: { core: 1 },
    link: "https://liftmanual.com/cable-standing-oblique-twist/",
    image: "/cable_standing_oblique_twist_left.png?v=6",
    images: ["/cable_standing_oblique_twist_left.png?v=6", "/cable_standing_oblique_twist_right.png?v=6"]
  },
  {
    name: "Machine Torso Rotation",
    pillar: "machines",
    formType: "A",
    description: "Seated rotary torso machine targeting the internal and external obliques.",
    muscles: { core: 1 },
    link: "https://liftmanual.com/machine-torso-rotation/",
    image: "/machine_torso_rotation.png?v=5"
  },
  {
    name: "Machine Seated Shoulder Press",
    pillar: "machines",
    formType: "A",
    description: "Seated press machine to build upper body pushing power and shoulders.",
    muscles: { shoulders: 1, triceps: 0.5 },
    link: "https://liftmanual.com/machine-shoulder-press/",
    image: "/machine_seated_shoulder_press.png?v=1"
  },
  {
    name: "Machine Lateral Raise",
    pillar: "machines",
    formType: "A",
    description: "Seated or standing machine side raises to isolate the lateral deltoids.",
    muscles: { shoulders: 1 },
    link: "https://liftmanual.com/machine-lateral-raise/",
    image: "/machine_lateral_raise.png?v=1"
  },
  {
    name: "Smith Machine Overhead Press",
    pillar: "machines",
    formType: "A",
    description: "Overhead press performed on a Smith machine to isolate shoulder drive.",
    muscles: { shoulders: 1, triceps: 0.5 },
    link: "https://liftmanual.com/smith-machine-overhead-press/",
    image: "/smith_machine_overhead_press.png?v=1"
  },
  {
    name: "Back Extension",
    pillar: "machines",
    formType: "A",
    description: "Hyperextension exercise on a 45-degree or horizontal bench to overload lower back and glutes.",
    muscles: { back: 1, glutes: 0.5, hamstrings: 0.5 },
    link: "https://liftmanual.com/back-extension/"
  },

  // 3. BODYWEIGHT
  {
    name: "Regular Push-Ups",
    pillar: "bodyweight",
    formType: "B",
    description: "Pistons of pushing power using your own body's angle.",
    muscles: { chest: 1, triceps: 0.5, shoulders: 0.5 },
    link: "https://liftmanual.com/push-up/",
    image: "/pushups_up.png?v=11",
    images: ["/pushups_up.png?v=11", "/pushups_down.png?v=11"],
    frameDuration: 1750
  },
  {
    name: "Dips",
    pillar: "bodyweight",
    formType: "B",
    description: "Deep parallel bars pressing that blasts triceps and chest.",
    muscles: { triceps: 1, chest: 0.5, shoulders: 0.25 },
    link: "https://liftmanual.com/dips/"
  },
  {
    name: "Overhand Pull-Ups",
    pillar: "bodyweight",
    formType: "B",
    description: "Strict vertical pull for back and biceps strength.",
    muscles: { back: 1, biceps: 0.5 },
    link: "https://liftmanual.com/pull-up/"
  },
  {
    name: "Inverted Rows",
    pillar: "bodyweight",
    formType: "B",
    description: "Horizontal bodyweight row targeting mid-back thickness.",
    muscles: { back: 1, biceps: 0.5 },
    link: "https://liftmanual.com/inverted-row/"
  },
  {
    name: "Bodyweight Squats",
    pillar: "bodyweight",
    formType: "B",
    description: "High-rep squats for lower body stamina.",
    muscles: { quads: 1, glutes: 0.5 },
    link: "https://liftmanual.com/bodyweight-squat/"
  },
  {
    name: "Chin-Ups",
    pillar: "bodyweight",
    formType: "B",
    description: "Underhand vertical pull for lats and bicep peaks.",
    muscles: { back: 1, biceps: 0.75 },
    link: "https://liftmanual.com/chin-up/"
  },
  {
    name: "Hanging Knee Raises",
    pillar: "bodyweight",
    formType: "B",
    description: "Hanging knee raises targeting lower abs.",
    muscles: { core: 1 },
    link: "https://liftmanual.com/hanging-knee-raise/"
  },
  {
    name: "Plank",
    pillar: "bodyweight",
    formType: "C",
    description: "Isometric core shield holding in straight alignment.",
    muscles: { core: 1 },
    link: "https://liftmanual.com/plank/"
  },
  {
    name: "Sit-Ups",
    pillar: "bodyweight",
    formType: "B",
    description: "Classic trunk flexes that demand stability.",
    muscles: { core: 1 },
    link: "https://liftmanual.com/sit-up/"
  },
  {
    name: "Ab Wheel Rollout",
    pillar: "bodyweight",
    formType: "B",
    description: "Rollout targeting deep core stabilization.",
    muscles: { core: 1 },
    link: "https://liftmanual.com/ab-wheel-rollout/"
  },
  {
    name: "Decline Crunch",
    pillar: "bodyweight",
    formType: "B",
    description: "Decline crunch targeting core endurance.",
    muscles: { core: 1 },
    link: "https://liftmanual.com/decline-crunch/"
  },
  {
    name: "Box Jumps",
    pillar: "bodyweight",
    formType: "B",
    description: "Vertical jumps targeting explosive power and speed.",
    muscles: { quads: 1, glutes: 0.5, calves: 0.5 },
    link: "https://liftmanual.com/box-jump/"
  },
  {
    name: "Calf Raises",
    pillar: "bodyweight",
    formType: "B",
    description: "Raise on toes to isolate and build the calf muscles.",
    muscles: { calves: 1 },
    link: "https://liftmanual.com/calf-raise/"
  },
  {
    name: "Lunges",
    pillar: "bodyweight",
    formType: "B",
    description: "Bodyweight lunges targeting glute power and stability.",
    muscles: { quads: 1, glutes: 1 },
    link: "https://liftmanual.com/lunge/"
  },
  {
    name: "Forward Lunges",
    pillar: "bodyweight",
    formType: "B",
    description: "Alternating lunges stepping forward to isolate quadriceps.",
    muscles: { quads: 1, glutes: 1 },
    link: "https://liftmanual.com/lunge/"
  },
  {
    name: "Bench Dips",
    pillar: "bodyweight",
    formType: "B",
    description: "Weighted or bodyweight dips performed off a flat bench.",
    muscles: { triceps: 1, chest: 0.25 },
    link: "https://liftmanual.com/bench-dips/"
  },
  {
    name: "Diamond Push-Ups",
    pillar: "bodyweight",
    formType: "B",
    description: "Close grip pushups placing maximum load on the triceps.",
    muscles: { triceps: 1, chest: 0.5 },
    link: "https://liftmanual.com/diamond-push-up/"
  },
  {
    name: "Squat Jumps",
    pillar: "bodyweight",
    formType: "B",
    description: "Explosive bodyweight squats jumping off the ground.",
    muscles: { quads: 1, glutes: 0.5, calves: 0.5 },
    link: "https://liftmanual.com/jump-squat/"
  },
  {
    name: "Bodyweight Reverse Lunge",
    pillar: "bodyweight",
    formType: "B",
    description: "Step backward into a lunge to overload hamstrings and glutes.",
    muscles: { glutes: 1, quads: 0.75, hamstrings: 0.25 },
    link: "https://liftmanual.com/reverse-lunge/"
  },
  {
    name: "Incline Push-Ups",
    pillar: "bodyweight",
    formType: "B",
    description: "Push-ups with hands elevated to target the lower chest.",
    muscles: { chest: 1, triceps: 0.5, shoulders: 0.5 },
    link: "https://liftmanual.com/incline-push-up/"
  },
  {
    name: "Decline Push-Ups",
    pillar: "bodyweight",
    formType: "B",
    description: "Push-ups with feet elevated to overload the upper chest.",
    muscles: { chest: 1, triceps: 0.5, shoulders: 0.5 },
    link: "https://liftmanual.com/decline-push-up/"
  },
  {
    name: "Wide Grip Push-Ups",
    pillar: "bodyweight",
    formType: "B",
    description: "Push-ups with hands wider than shoulder width to focus on outer pecs.",
    muscles: { chest: 1, triceps: 0.5, shoulders: 0.5 },
    link: "https://liftmanual.com/wide-grip-push-up/"
  },
  {
    name: "Chest Dips",
    pillar: "bodyweight",
    formType: "B",
    description: "Parallel bar dips leaning forward to recruit lower chest.",
    muscles: { chest: 1, triceps: 0.5, shoulders: 0.25 },
    link: "https://liftmanual.com/chest-dips/"
  },
  {
    name: "Underhand Pull-Ups",
    pillar: "bodyweight",
    formType: "B",
    description: "Chin-ups with an underhand grip targeting the back and biceps.",
    muscles: { back: 1, biceps: 0.75 },
    link: "https://liftmanual.com/underhand-pull-up/"
  },
  {
    name: "Pull-Up Negatives",
    pillar: "bodyweight",
    formType: "B",
    description: "Jump to the top position and perform a slow, controlled drop.",
    muscles: { back: 1, biceps: 0.5 },
    link: "https://liftmanual.com/negative-pull-up/"
  },
  {
    name: "Superman Holds",
    pillar: "bodyweight",
    formType: "C",
    description: "Lie face down and lift arms and legs off the floor to hold.",
    muscles: { back: 0.5 },
    link: "https://liftmanual.com/superman/"
  },
  {
    name: "Scapular Pull-Ups",
    pillar: "bodyweight",
    formType: "B",
    description: "Active hang on bar pulling shoulder blades down and back.",
    muscles: { back: 0.5, traps: 0.5 },
    link: "https://liftmanual.com/scapular-pull-up/"
  },
  {
    name: "Pike Push-Ups",
    pillar: "bodyweight",
    formType: "B",
    description: "Hips-elevated pushups to shift the load onto the shoulders.",
    muscles: { shoulders: 1, triceps: 0.5 },
    link: "https://liftmanual.com/pike-push-up/"
  },

  // 4. CARDIO
  {
    name: "Agility Ladder Drills",
    pillar: "cardio",
    formType: "C",
    description: "High-speed ladder footwork for coordination and conditioning (20 mins = 100%).",
    muscles: {}
  },
  {
    name: "Jumping Jacks",
    pillar: "cardio",
    formType: "C",
    description: "Classic jumping jacks for continuous conditioning (20 mins = 100%).",
    muscles: {},
    link: "https://liftmanual.com/jumping-jack/"
  },
  {
    name: "Burpees",
    pillar: "cardio",
    formType: "C",
    description: "Full-body burpees linking push-ups and squat jumps (20 mins or 100 reps = 100%).",
    muscles: {},
    link: "https://liftmanual.com/burpee/"
  },
  {
    name: "Treadmill Run / Jog",
    pillar: "cardio",
    formType: "D",
    description: "High-cadence run or jog tracking distance and pace.",
    muscles: {},
    image: "/treadmill_jog.png?v=5"
  },
  {
    name: "Walking",
    pillar: "cardio",
    formType: "D",
    description: "Steady outdoor or treadmill walking to build foundational stamina and active recovery.",
    muscles: {}
  },
  {
    name: "Sprint Intervals",
    pillar: "cardio",
    formType: "D",
    description: "High-intensity sprint bursts to push speed.",
    muscles: { hamstrings: 1, glutes: 1, calves: 1 }
  },
  {
    name: "Stairmaster",
    pillar: "cardio",
    formType: "E",
    description: "Continuous vertical climbing to test quad endurance.",
    muscles: { quads: 1, glutes: 1, calves: 1 },
    image: "/stairmaster.png?v=5"
  },
  {
    name: "Jump Rope",
    pillar: "cardio",
    formType: "C",
    description: "Continuous rope jumping for cardio condition and agility.",
    muscles: {}
  },
  {
    name: "Bicycle",
    pillar: "cardio",
    formType: "D",
    description: "Cycling on a stationary or road bike (5 miles target = 100%).",
    muscles: {},
    image: "/bicycle.png?v=5"
  },
  {
    name: "Outdoor Bicycle",
    pillar: "cardio",
    formType: "D",
    description: "Outdoor cycling tracking distance and duration (5 miles = 100%).",
    muscles: {},
    image: "/bicycle.png?v=5"
  },
  {
    name: "Spin Bike",
    pillar: "cardio",
    formType: "D",
    description: "High-energy indoor spinning workout (40 mins = 100%).",
    muscles: {}
  },
  {
    name: "Elliptical",
    pillar: "cardio",
    formType: "D",
    description: "Low-impact gliding on the elliptical trainer.",
    muscles: {},
    image: "/elliptical.png?v=5"
  },
  {
    name: "Rowing Machine",
    pillar: "cardio",
    formType: "D",
    description: "Rowing ergometer workout tracking distance and time.",
    muscles: { back: 1 },
    image: "/rowing_machine.png?v=5"
  },
  {
    name: "Hiking",
    pillar: "cardio",
    formType: "F",
    description: "Navigate outdoor trails tracking duration, distance, and difficulty level.",
    muscles: { quads: 1, glutes: 1, calves: 1 },
    image: "/hiking.png?v=1"
  },
  {
    name: "Outdoor Running",
    pillar: "cardio",
    formType: "D",
    description: "Outdoor running tracking miles and time (2 miles = 100%).",
    muscles: {},
    image: "/treadmill.png?v=5"
  },
  {
    name: "HIIT Cardio Circuit",
    pillar: "cardio",
    formType: "C",
    description: "High-intensity interval cardio training for time.",
    muscles: {}
  },
  {
    name: "Stair Climbing",
    pillar: "cardio",
    formType: "E",
    description: "Climbing stairs or stairmaster (50 floors target = 100%).",
    muscles: { quads: 1, glutes: 1, calves: 1 },
    image: "/stairmaster.png?v=5"
  }
];

export const EXERCISE_DATABASE: ExerciseInfo[] = RAW_EXERCISE_DATABASE.map(ex => ({
  ...ex,
  builds: ex.builds || deriveBuildsFromMuscles(ex.muscles, ex.pillar),
  subCategories: ex.subCategories || (Object.keys(ex.muscles) as MuscleKey[])
}));

export const CATEGORIES = [
  { id: "weights", name: "Free Weights" },
  { id: "machines", name: "Machines" },
  { id: "bodyweight", name: "Bodyweight" },
  { id: "cardio", name: "Cardio" }
];

export function getCustomExercises(): ExerciseInfo[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const saved = localStorage.getItem("fitquest_custom_exercises");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return parsed.map((ex: any) => ({
          ...ex,
          muscles: ex.muscles || {},
          builds: ex.builds || deriveBuildsFromMuscles(ex.muscles || {}, ex.pillar || "weights")
        }));
      }
    }
  } catch (e) {
    console.error("Error reading fitquest_custom_exercises from localStorage", e);
  }
  return [];
}

const EXERCISE_IMAGE_OVERRIDES_KEY = "fitquest_exercise_image_overrides";

export interface ExerciseImageOverride {
  topImage?: string;
  bottomImage?: string;
  image?: string;
  images?: string[];
}

export function getExerciseImageOverrides(): Record<string, ExerciseImageOverride> {
  if (typeof localStorage === "undefined") return {};
  try {
    const raw = localStorage.getItem(EXERCISE_IMAGE_OVERRIDES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") return parsed;
    }
  } catch (e) {
    console.error("Error reading fitquest_exercise_image_overrides from localStorage", e);
  }
  return {};
}

export function hasDefaultExerciseImage(exerciseName: string): boolean {
  const base = EXERCISE_DATABASE.find((e) => e.name.toLowerCase() === exerciseName.toLowerCase());
  return Boolean(base && (base.image || (base.images && base.images.length > 0)));
}

export function saveExerciseImageOverride(
  exerciseName: string,
  slot: "top" | "bottom",
  imageUrl: string
): void {
  if (typeof localStorage === "undefined") return;
  const cleanUrl = imageUrl.trim();
  const current = getExerciseImageOverrides();
  const key = exerciseName.toLowerCase();
  const existing = current[key] || {};

  // Exercises that already have a default image can only change their bottom image
  if (slot === "top" && hasDefaultExerciseImage(exerciseName)) {
    return;
  }

  const next: ExerciseImageOverride = {
    topImage: slot === "top" ? cleanUrl : existing.topImage,
    bottomImage: slot === "bottom" ? cleanUrl : existing.bottomImage
  };

  if (!next.topImage && !next.bottomImage) {
    delete current[key];
  } else {
    current[key] = next;
  }

  try {
    localStorage.setItem(EXERCISE_IMAGE_OVERRIDES_KEY, JSON.stringify(current));
  } catch (e) {
    console.error("Error saving fitquest_exercise_image_overrides to localStorage", e);
    alert("Image file is too large for browser storage. Try a smaller image.");
  }
}

export function clearExerciseImageOverride(exerciseName: string): void {
  if (typeof localStorage === "undefined") return;
  const current = getExerciseImageOverrides();
  delete current[exerciseName.toLowerCase()];
  try {
    localStorage.setItem(EXERCISE_IMAGE_OVERRIDES_KEY, JSON.stringify(current));
  } catch (e) {
    console.error("Error clearing fitquest_exercise_image_overrides", e);
  }
}

export function getAllExercises(): ExerciseInfo[] {
  const custom = getCustomExercises();
  const overrides = getExerciseImageOverrides();

  let combined: ExerciseInfo[] = EXERCISE_DATABASE;
  if (custom.length > 0) {
    const customNames = new Set(custom.map(c => c.name.toLowerCase()));
    const defaultFiltered = EXERCISE_DATABASE.filter(e => !customNames.has(e.name.toLowerCase()));
    combined = [...defaultFiltered, ...custom];
  }

  if (Object.keys(overrides).length === 0) return combined;

  return combined.map((ex) => {
    const ov = overrides[ex.name.toLowerCase()];
    if (!ov) return ex;
    const lockedTop = hasDefaultExerciseImage(ex.name);
    const customTop = !lockedTop ? (ov.topImage || ov.image || ov.images?.[0]) : undefined;
    const customBottom = ov.bottomImage || ov.images?.[1];
    return {
      ...ex,
      image: lockedTop ? ex.image : (customTop || ex.image),
      bottomImage: customBottom || ex.bottomImage
    };
  });
}

export function saveCustomExercise(newEx: ExerciseInfo): ExerciseInfo[] {
  const current = getCustomExercises();
  const updated = [newEx, ...current.filter(e => e.name.toLowerCase() !== newEx.name.toLowerCase())];
  try {
    localStorage.setItem("fitquest_custom_exercises", JSON.stringify(updated));
  } catch (e) {
    console.error("Error saving fitquest_custom_exercises to localStorage", e);
  }
  return updated;
}

export function deleteCustomExercise(name: string): ExerciseInfo[] {
  const current = getCustomExercises();
  const updated = current.filter(e => e.name.toLowerCase() !== name.toLowerCase());
  try {
    localStorage.setItem("fitquest_custom_exercises", JSON.stringify(updated));
  } catch (e) {
    console.error("Error deleting fitquest_custom_exercises from localStorage", e);
  }
  return updated;
}
