const { calculateBMR, getActivityFactor, calculateTDEE } = require('./logic/metabolicEngine');

const bmr = calculateBMR(80, 180, 30, true);
const factor = getActivityFactor(12000);
const tdee = calculateTDEE(bmr, factor);

console.log("---------------- PulsePath Test ----------------");
console.log(`Mon TDEE aujourd'hui : ${tdee.toFixed(2)} kcal`);
console.log("------------------------------------------------");

