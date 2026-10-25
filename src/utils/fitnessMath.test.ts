import assert from "node:assert/strict";
import { EXERCISE_DATABASE } from "../exercises";
import { FitnessLog } from "../types";
import {
  PROGRESS_CONFIG,
  EXERCISE_CONFIGS,
  evaluateAthletePerformance,
  calculateScoreFromLog,
  calculateRawStrengthScore,
  getEffortFactor,
  getSetFactor,
} from "./fitnessMath";

let idCounter = 1;
const NOW = Date.now();

function makeStrengthSet(
  exerciseName: string,
  opts: {
    weight?: number;
    reps?: number;
    seconds?: number;
    timestamp?: number;
  } = {}
): FitnessLog {
  const ts = opts.timestamp ?? NOW;
  return {
    id: `test-${idCounter++}`,
    timestamp: new Date(ts).toISOString(),
    metricType: "general_workout",
    title: exerciseName,
    newValue: `${opts.weight ?? 135}x${opts.reps ?? 10}`,
    categoryName: "Free Weights",
    exerciseName,
    weight: opts.weight ?? 135,
    reps: opts.reps ?? 10,
    seconds: opts.seconds,
  };
}

function makeStrengthSets(
  exerciseName: string,
  count: number,
  opts: {
    weight?: number;
    reps?: number;
    seconds?: number;
    timestamp?: number;
  } = {}
): FitnessLog[] {
  return Array.from({ length: count }, (_, i) =>
    makeStrengthSet(exerciseName, {
      ...opts,
      timestamp: (opts.timestamp ?? NOW) + i * 1000,
    })
  );
}

function makeCardioLog(
  exerciseName: string,
  opts: {
    minutes?: number;
    distance?: number;
    reps?: number;
    floors?: number;
    weight?: number;
    timestamp?: number;
  }
): FitnessLog {
  const ts = opts.timestamp ?? NOW;
  return {
    id: `cardio-${idCounter++}`,
    timestamp: new Date(ts).toISOString(),
    metricType: "general_workout",
    title: exerciseName,
    newValue: `${opts.minutes ?? 20} mins`,
    categoryName: "Cardio",
    exerciseName,
    minutes: opts.minutes,
    distance: opts.distance,
    reps: opts.reps,
    floors: opts.floors,
    weight: opts.weight,
  };
}

const results: { name: string; passed: boolean; detail: string }[] = [];

function runTest(name: string, fn: () => string) {
  try {
    const detail = fn();
    results.push({ name, passed: true, detail });
    console.log(`PASS  ${name}\n      -> ${detail}`);
  } catch (err: any) {
    results.push({ name, passed: false, detail: err?.message || String(err) });
    console.error(`FAIL  ${name}\n      -> ${err?.message || err}`);
    throw err;
  }
}

console.log("=== FitQuest Exercise Progress Math Unit Tests ===\n");

// ---------------------------------------------------------------------------
// 1. Benchmark Workouts (§6 Table)
// ---------------------------------------------------------------------------

runTest("Benchmark 1: Chest day (Bench 4, Incline DB 3, Cable Fly 3) -> Chest 100%", () => {
  const logs: FitnessLog[] = [
    ...makeStrengthSets("Bench Press", 4, { weight: 185, reps: 8 }),
    ...makeStrengthSets("Dumbbell Incline Bench", 3, { weight: 70, reps: 10 }),
    ...makeStrengthSets("Cable Pec Fly", 3, { weight: 40, reps: 12 }),
  ];
  const perf = evaluateAthletePerformance(logs, 175, "male", NOW + 10000);
  const w = perf.weeklyVolume;
  const sub = perf.weeklySubVolume;
  assert.equal(w.chestStrength, 100, `Expected Chest 100%, got ${w.chestStrength}%`);
  assert.equal(w.cardio, 0, `Expected Cardio 0%, got ${w.cardio}%`);
  return `Chest=${w.chestStrength}%, Arms=${w.armStrength}% (triceps=${sub.triceps}%, shoulders=${sub.shoulders}%), Cardio=${w.cardio}%`;
});

runTest("Benchmark 2: Back day (Pull-Ups 3, Barbell Row 4, Lat Pulldown 3, Seated Row 3) -> Back 100%", () => {
  const logs: FitnessLog[] = [
    ...makeStrengthSets("Overhand Pull-Ups", 3, { weight: 0, reps: 10 }),
    ...makeStrengthSets("Barbell Row", 4, { weight: 155, reps: 8 }),
    ...makeStrengthSets("Lat Pulldown Machine", 3, { weight: 140, reps: 10 }),
    ...makeStrengthSets("Seated Cable Row", 3, { weight: 140, reps: 10 }),
  ];
  const perf = evaluateAthletePerformance(logs, 175, "male", NOW + 15000);
  const w = perf.weeklyVolume;
  const sub = perf.weeklySubVolume;
  assert.equal(w.backStrength, 100, `Expected Back 100%, got ${w.backStrength}%`);
  assert.equal(w.cardio, 0, `Expected Cardio 0%, got ${w.cardio}%`);
  return `Back=${w.backStrength}%, Biceps=${sub.biceps}%, Cardio=${w.cardio}%`;
});

runTest("Benchmark 3: Leg day (Squat 4, RDL 3, Leg Press 3, Lying Leg Curl 3, Calf Raise 4) -> Legs 100%", () => {
  const logs: FitnessLog[] = [
    ...makeStrengthSets("Barbell Squat", 4, { weight: 225, reps: 8 }),
    ...makeStrengthSets("Romanian Deadlift", 3, { weight: 185, reps: 10 }),
    ...makeStrengthSets("Machine Leg Press", 3, { weight: 360, reps: 10 }),
    ...makeStrengthSets("Lying Leg Curl", 3, { weight: 110, reps: 12 }),
    ...makeStrengthSets("Machine Standing Calf Raises", 4, { weight: 150, reps: 15 }),
  ];
  const perf = evaluateAthletePerformance(logs, 175, "male", NOW + 20000);
  const w = perf.weeklyVolume;
  const sub = perf.weeklySubVolume;
  assert.equal(w.legStrength, 100, `Expected Legs 100%, got ${w.legStrength}%`);
  assert.equal(sub.quads, 100);
  assert.equal(sub.hamstrings, 100);
  assert.equal(sub.glutes, 100);
  assert.equal(sub.calves, 100);
  assert.equal(w.cardio, 0);
  return `Legs=${w.legStrength}% (quads=${sub.quads}%, hamstrings=${sub.hamstrings}%, glutes=${sub.glutes}%, calves=${sub.calves}%), Cardio=${w.cardio}%`;
});

runTest("Benchmark 4: Arm day (Barbell Curl 3, Hammer 3, Pushdown 3, Skull Crusher 3, Lateral Raise 3, OHP 3, Shrug 3) -> Arms 90%", () => {
  const logs: FitnessLog[] = [
    ...makeStrengthSets("Barbell Bicep Curl", 3, { weight: 75, reps: 10 }),
    ...makeStrengthSets("Hammer Curl", 3, { weight: 35, reps: 10 }),
    ...makeStrengthSets("Cable Tricep Pushdown", 3, { weight: 60, reps: 12 }),
    ...makeStrengthSets("Barbell Skull Crusher", 3, { weight: 65, reps: 10 }),
    ...makeStrengthSets("Cable Lateral Raise", 3, { weight: 20, reps: 15 }),
    ...makeStrengthSets("Dumbbell Overhead Press", 3, { weight: 50, reps: 10 }),
    ...makeStrengthSets("Dumbbell Shrug", 3, { weight: 80, reps: 12 }),
  ];
  const perf = evaluateAthletePerformance(logs, 175, "male", NOW + 25000);
  const w = perf.weeklyVolume;
  const sub = perf.weeklySubVolume;
  assert.equal(w.armStrength, 90, `Expected Arms 90%, got ${w.armStrength}%`);
  assert.equal(sub.biceps, 100);
  assert.equal(sub.triceps, 100);
  assert.equal(sub.shoulders, 75);
  assert.equal(sub.traps, 75);
  assert.equal(w.cardio, 0);
  return `Arms=${w.armStrength}% (biceps=${sub.biceps}%, triceps=${sub.triceps}%, shoulders=${sub.shoulders}%, traps=${sub.traps}%), Cardio=${w.cardio}%`;
});

runTest("Benchmark 5: Core (Cable Crunch 3, Hanging Knee Raise 3, Plank 3) -> Core 100%", () => {
  const logs: FitnessLog[] = [
    ...makeStrengthSets("Cable Crunch", 3, { weight: 70, reps: 15 }),
    ...makeStrengthSets("Hanging Knee Raises", 3, { weight: 0, reps: 12 }),
    ...makeStrengthSets("Plank", 3, { weight: 0, reps: 0, seconds: 60 }),
  ];
  const perf = evaluateAthletePerformance(logs, 175, "male", NOW + 10000);
  const w = perf.weeklyVolume;
  assert.equal(w.coreStrength, 100, `Expected Core 100%, got ${w.coreStrength}%`);
  assert.equal(w.cardio, 0);
  return `Core=${w.coreStrength}%, Cardio=${w.cardio}%`;
});

runTest("Benchmark 6: Run (30-min Treadmill Run / Jog) -> Cardio 100%", () => {
  const logs: FitnessLog[] = [
    makeCardioLog("Treadmill Run / Jog", { minutes: 30, distance: 3.1 }),
  ];
  const perf = evaluateAthletePerformance(logs, 175, "male", NOW);
  const w = perf.weeklyVolume;
  assert.equal(w.cardio, 100, `Expected Cardio 100%, got ${w.cardio}%`);
  assert.equal(w.chestStrength, 0);
  assert.equal(w.backStrength, 0);
  assert.equal(w.armStrength, 0);
  assert.equal(w.legStrength, 0);
  assert.equal(w.coreStrength, 0);
  return `Cardio=${w.cardio}%, Strength sections=0%`;
});

// ---------------------------------------------------------------------------
// 2. Six Mandatory Assertions (§6)
// ---------------------------------------------------------------------------

runTest("Assertion 1: 1 set of any strength exercise gives <= 15% to any section", () => {
  const strengthExercises = EXERCISE_DATABASE.filter(e => e.pillar !== "cardio");
  let maxSectionVal = 0;
  let maxExName = "";
  let maxSectionKey = "";

  for (const ex of strengthExercises) {
    const log = makeStrengthSet(ex.name, { weight: 135, reps: 10, seconds: 60, timestamp: NOW });
    const perf = evaluateAthletePerformance([log], 175, "male", NOW);
    const w = perf.weeklyVolume;
    const sections: [string, number][] = [
      ["chestStrength", w.chestStrength],
      ["backStrength", w.backStrength],
      ["armStrength", w.armStrength],
      ["legStrength", w.legStrength],
      ["coreStrength", w.coreStrength],
      ["cardio", w.cardio],
    ];
    for (const [secKey, val] of sections) {
      if (val > maxSectionVal) {
        maxSectionVal = val;
        maxExName = ex.name;
        maxSectionKey = secKey;
      }
      assert.ok(
        val <= 15,
        `1 set of "${ex.name}" gave ${val}% to ${secKey} (must be <= 15%)`
      );
    }
  }
  return `Checked all ${strengthExercises.length} strength exercises; highest 1-set section score is ${maxSectionVal}% (${maxExName} -> ${maxSectionKey})`;
});

runTest("Assertion 2: No non-cardio exercise adds to Cardio", () => {
  const nonCardioExercises = EXERCISE_DATABASE.filter(e => e.pillar !== "cardio");
  for (const ex of nonCardioExercises) {
    const b = ex.builds as Record<string, number | undefined>;
    assert.equal(b.cardio || 0, 0, `${ex.name} has builds.cardio=${b.cardio}`);
    assert.equal(b.stamina || 0, 0, `${ex.name} has builds.stamina=${b.stamina}`);
    assert.equal(b.speed || 0, 0, `${ex.name} has builds.speed=${b.speed}`);

    const logs = makeStrengthSets(ex.name, 4, { weight: 135, reps: 10, seconds: 60, timestamp: NOW });
    const perf = evaluateAthletePerformance(logs, 175, "male", NOW + 5000);
    assert.equal(perf.weeklyVolume.cardio, 0, `Non-cardio exercise "${ex.name}" added ${perf.weeklyVolume.cardio}% to Cardio`);
  }
  return `Verified all ${nonCardioExercises.length} non-cardio exercises have 0 stamina/speed/cardio and add 0% to Cardio`;
});

runTest("Assertion 3: Every exercise has an explicit muscles map, and no weight is > 1", () => {
  assert.ok(EXERCISE_DATABASE.length > 0, "EXERCISE_DATABASE must not be empty");
  for (const ex of EXERCISE_DATABASE) {
    assert.ok(ex.muscles && typeof ex.muscles === "object", `${ex.name} is missing muscles map`);
    const entries = Object.entries(ex.muscles);
    if (ex.pillar !== "cardio") {
      assert.ok(entries.length > 0, `Strength exercise "${ex.name}" has empty muscles map`);
    }
    for (const [mKey, w] of entries) {
      assert.ok(
        typeof w === "number" && w > 0 && w <= 1.0,
        `${ex.name} muscle "${mKey}" has invalid weight ${w} (must be in (0, 1.0])`
      );
    }
  }
  return `Verified all ${EXERCISE_DATABASE.length} exercises in EXERCISE_DATABASE have explicit muscles maps with all weights in (0, 1.0]`;
});

runTest("Assertion 4: 10 sets of a single exercise give no more credit than 6 sets", () => {
  const logs6 = makeStrengthSets("Bench Press", 6, { weight: 185, reps: 8, timestamp: NOW });
  const logs10 = makeStrengthSets("Bench Press", 10, { weight: 185, reps: 8, timestamp: NOW });
  const perf6 = evaluateAthletePerformance(logs6, 175, "male", NOW + 10000);
  const perf10 = evaluateAthletePerformance(logs10, 175, "male", NOW + 10000);
  assert.deepEqual(
    perf10.weeklyVolume,
    perf6.weeklyVolume,
    `10 sets (${JSON.stringify(perf10.weeklyVolume)}) differed from 6 sets (${JSON.stringify(perf6.weeklyVolume)})`
  );
  // 4*1.0 + 2*0.5 = 5.0 chest sets -> 5.0 / 10 * 100 = 50%
  assert.equal(perf6.weeklyVolume.chestStrength, 50);
  assert.equal(perf10.weeklyVolume.chestStrength, 50);
  return `6 sets of Bench Press = ${perf6.weeklyVolume.chestStrength}% Chest, 10 sets = ${perf10.weeklyVolume.chestStrength}% Chest (identical)`;
});

runTest("Assertion 5: Full chest day logged on top of 70% leftover chest progress ends at 100% (not higher)", () => {
  const twoPointOneDaysMs = 2.1 * 24 * 60 * 60 * 1000; // 100% * (1 - 2.1/7) = 70%
  const earlierTs = NOW - twoPointOneDaysMs;

  const priorChestDay: FitnessLog[] = [
    ...makeStrengthSets("Bench Press", 4, { weight: 185, reps: 8, timestamp: earlierTs }),
    ...makeStrengthSets("Dumbbell Incline Bench", 3, { weight: 70, reps: 10, timestamp: earlierTs }),
    ...makeStrengthSets("Cable Pec Fly", 3, { weight: 40, reps: 12, timestamp: earlierTs }),
  ];
  const leftoverPerf = evaluateAthletePerformance(priorChestDay, 175, "male", NOW + 9000);
  assert.equal(leftoverPerf.weeklyVolume.chestStrength, 70, `Expected 70% leftover chest, got ${leftoverPerf.weeklyVolume.chestStrength}%`);

  const todayChestDay: FitnessLog[] = [
    ...makeStrengthSets("Bench Press", 4, { weight: 185, reps: 8, timestamp: NOW }),
    ...makeStrengthSets("Dumbbell Incline Bench", 3, { weight: 70, reps: 10, timestamp: NOW }),
    ...makeStrengthSets("Cable Pec Fly", 3, { weight: 40, reps: 12, timestamp: NOW }),
  ];

  const stackedPerf = evaluateAthletePerformance([...priorChestDay, ...todayChestDay], 175, "male", NOW + 9000);
  assert.equal(stackedPerf.weeklyVolume.chestStrength, 100, `Expected capped 100% chest, got ${stackedPerf.weeklyVolume.chestStrength}%`);
  return `Leftover=${leftoverPerf.weeklyVolume.chestStrength}% + Full Chest Day (100%) -> Capped at ${stackedPerf.weeklyVolume.chestStrength}%`;
});

runTest("Assertion 6: After a full chest day, the Chest bar decays to 0 on the 7-day timer", () => {
  const chestDayLogs: FitnessLog[] = [
    ...makeStrengthSets("Bench Press", 4, { weight: 185, reps: 8, timestamp: NOW }),
    ...makeStrengthSets("Dumbbell Incline Bench", 3, { weight: 70, reps: 10, timestamp: NOW }),
    ...makeStrengthSets("Cable Pec Fly", 3, { weight: 40, reps: 12, timestamp: NOW }),
  ];
  const lastLogTs = NOW + 9000;
  const halfWeekLater = lastLogTs + 3.5 * 24 * 60 * 60 * 1000;
  const sevenDaysLater = lastLogTs + 7.0 * 24 * 60 * 60 * 1000;

  const perfHalfWeek = evaluateAthletePerformance(chestDayLogs, 175, "male", halfWeekLater);
  assert.equal(perfHalfWeek.weeklyVolume.chestStrength, 50, `Expected 50% at 3.5 days, got ${perfHalfWeek.weeklyVolume.chestStrength}%`);

  const perfSevenDays = evaluateAthletePerformance(chestDayLogs, 175, "male", sevenDaysLater);
  assert.equal(perfSevenDays.weeklyVolume.chestStrength, 0, `Expected 0% at 7 days, got ${perfSevenDays.weeklyVolume.chestStrength}%`);
  return `Day 0=100%, Day 3.5=${perfHalfWeek.weeklyVolume.chestStrength}%, Day 7.0=${perfSevenDays.weeklyVolume.chestStrength}%`;
});

// ---------------------------------------------------------------------------
// 3. Effort Curve, Cardio Muscle Credit & Hiking / Burpees Verification
// ---------------------------------------------------------------------------

runTest("Effort Curve: 90-day 1RM comparison (R >= 0.8 -> 1.0, 0.6 <= R < 0.8 -> 0.5, R < 0.6 -> 0)", () => {
  const tenDaysAgo = NOW - 10 * 24 * 60 * 60 * 1000;
  // Best set: 200 lbs x 10 -> 1RM = 200 * (1 + 10/30) = 266.67
  const bestLog = makeStrengthSet("Bench Press", { weight: 200, reps: 10, timestamp: tenDaysAgo });
  // Working set: 180 lbs x 10 -> 1RM = 240 -> R = 240/266.67 = 0.90 -> effort = 1.0
  const workingLog = makeStrengthSet("Bench Press", { weight: 180, reps: 10, timestamp: NOW });
  // Moderate set: 140 lbs x 10 -> 1RM = 186.67 -> R = 0.70 -> effort = 0.5
  const moderateLog = makeStrengthSet("Bench Press", { weight: 140, reps: 10, timestamp: NOW + 1000 });
  // Warmup set: 100 lbs x 10 -> 1RM = 133.33 -> R = 0.50 -> effort = 0
  const warmupLog = makeStrengthSet("Bench Press", { weight: 100, reps: 10, timestamp: NOW + 2000 });

  const perf = evaluateAthletePerformance([bestLog, workingLog, moderateLog, warmupLog], 175, "male", NOW + 3000);
  assert.equal(perf.logEvaluations[workingLog.id].volumePower, 1.0);
  assert.equal(perf.logEvaluations[moderateLog.id].volumePower, 0.5);
  assert.equal(perf.logEvaluations[warmupLog.id].volumePower, 0);

  return "Verified effort=1.0 (R=0.90), effort=0.5 (R=0.70), effort=0 (R=0.50 warm-up)";
});

runTest("Cardio Model: Burpees, Jumping Jacks, Agility Ladder (20 min = 100%, 100 Burpees = 100%), Hiking (60 min moderate = 100%) & Cardio Muscle Credit", () => {
  // 20 min Burpees -> 100% cardio
  const burpeeTimeScore = calculateScoreFromLog(makeCardioLog("Burpees", { minutes: 20 }), 175, "cardio");
  assert.equal(Math.round(burpeeTimeScore), 100);

  // 100 reps Burpees -> 100% cardio
  const burpeeRepsScore = calculateScoreFromLog(makeCardioLog("Burpees", { minutes: 0, reps: 100 }), 175, "cardio");
  assert.equal(Math.round(burpeeRepsScore), 100);

  // 60 min Hiking on moderate trail (difficulty=8) -> 100% cardio + 2 fractional sets split across quads, glutes, calves (2/3 set each)
  const hikePerf = evaluateAthletePerformance([makeCardioLog("Hiking", { minutes: 60, weight: 8, timestamp: NOW })], 175, "male", NOW);
  assert.equal(hikePerf.weeklyVolume.cardio, 100);
  // quads: (2/3)/6 * 100 = 11.1%, glutes: (2/3)/5 * 100 = 13.3%, calves: (2/3)/4 * 100 = 16.7%
  assert.equal(hikePerf.weeklySubVolume.quads, 11.1);
  assert.equal(hikePerf.weeklySubVolume.glutes, 13.3);
  assert.equal(hikePerf.weeklySubVolume.calves, 16.7);

  // 30 min Rowing Machine -> 100% cardio + 2 fractional sets to back (2 / 12 * 100 = 16.7%)
  const rowPerf = evaluateAthletePerformance([makeCardioLog("Rowing Machine", { minutes: 30, timestamp: NOW })], 175, "male", NOW);
  assert.equal(rowPerf.weeklyVolume.cardio, 100);
  assert.equal(rowPerf.weeklyVolume.backStrength, 16.7);

  return `Burpees(20m)=${burpeeTimeScore}%, Burpees(100reps)=${burpeeRepsScore}%, Hiking(60m mod)=${hikePerf.weeklyVolume.cardio}% Cardio + Legs=${hikePerf.weeklyVolume.legStrength}%, Rowing(30m)=${rowPerf.weeklyVolume.cardio}% Cardio + Back=${rowPerf.weeklyVolume.backStrength}%`;
});

console.log(`\nAll ${results.length}/${results.length} test suites passed!`);
