const { EXERCISE_DATABASE } = require('./scratch_exercises.cjs');

const getEquipmentType = (pillar, name) => {
  if (pillar === 'weights') return 'weights';
  if (pillar === 'machines') return 'machines';
  if (pillar === 'bodyweight') return 'bodyweight';
  if (pillar === 'cardio') {
    const nameLower = name.toLowerCase();
    if (nameLower.includes('rope') || nameLower.includes('jump') || nameLower.includes('sprint')) {
      return 'bodyweight';
    }
    return 'machines';
  }
  return 'bodyweight';
};

const categories = ['chest', 'back', 'legs', 'arms', 'core'];
const types = ['weights', 'machines', 'bodyweight'];

const audit = {};
categories.forEach(cat => {
  audit[cat] = { weights: [], machines: [], bodyweight: [] };
});

EXERCISE_DATABASE.forEach(ex => {
  const eqType = getEquipmentType(ex.pillar, ex.name);
  if (ex.builds.chestStrength) audit.chest[eqType].push(ex.name);
  if (ex.builds.backStrength) audit.back[eqType].push(ex.name);
  if (ex.builds.legStrength) audit.legs[eqType].push(ex.name);
  if (ex.builds.armStrength) audit.arms[eqType].push(ex.name);
  if (ex.builds.coreStrength) audit.core[eqType].push(ex.name);
});

categories.forEach(cat => {
  console.log(`=== ${cat.toUpperCase()} ===`);
  types.forEach(type => {
    console.log(`  ${type.toUpperCase()} (${audit[cat][type].length}):`);
    audit[cat][type].forEach(name => {
      console.log(`    - ${name}`);
    });
  });
  console.log('');
});
