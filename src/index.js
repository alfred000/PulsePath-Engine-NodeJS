const metabolic = require('./logic/metabolicEngine');
const velocity = require('./logic/velocityEngine');

const tdee = 2500;
const calIn = 2000;
const deficitHebdo = (calIn - tdee) * 7;

const dateEstimee = velocity.projectTargetDate(85, 80, deficitHebdo);

console.log("--- PulsePath Engine NodeJS ---");
console.log(`Date cible estimée : ${dateEstimee ? dateEstimee.toLocaleDateString() : "Calcul impossible (Surplus)"}`);


