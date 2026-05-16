/**
 * Règle RM-MET-01 : Calcul du Métabolisme de Base et du TDEE
 */

const calculateBMR = (weight, height, age, isMale) => {
    if (isMale) {
        return (10 * weight) + (6.25 * height) - (5 * age) + 5;
    }
    return (10 * weight) + (6.25 * height) - (5 * age) - 161;
};

const getActivityFactor = (steps) => {
    if (steps < 5000) return 1.2;
    if (steps < 10000) return 1.4;
    return 1.6;
};

const calculateTDEE = (bmr, activityFactor) => {
    return bmr * activityFactor;
};

const calculateIMC = (weight, heightCm) => {
    const heightMeters = heightCm / 100;
    return weight / (heightMeters * heightMeters);
};

const getWeightPlage = (heightCm) => {
    const heightMeters = heightCm / 100;
    return {
        poidsMin: 18.5 * (heightMeters * heightMeters),
        poidsMax: 25.0 * (heightMeters * heightMeters)
    };
};

const calculateIMG = (imc, age, isMale) => {
    const genderFactor = isMale ? 1 : 0;
    return (1.20 * imc) + (0.23 * age) - (10.8 * genderFactor) - 5.4;
};

const calculateMacros = (targetCalories, objective) => {
    let pPro = 0.25, pGlu = 0.45, pLip = 0.30;
    if (objective === "perte") { pPro = 0.30; pGlu = 0.40; pLip = 0.30; }
    else if (objective === "gain") { pPro = 0.25; pGlu = 0.50; pLip = 0.25; }

    return {
        proteins: Math.round((targetCalories * pPro) / 4),
        carbs: Math.round((targetCalories * pGlu) / 4),
        fats: Math.round((targetCalories * pLip) / 9)
    };
};

const getImcInterpretation = (heightCm, imc) => {
    const heightMeters = heightCm / 100;
    const poidsMin = 18.5 * (heightMeters * heightMeters);
    const poidsMax = 25.0 * (heightMeters * heightMeters);
    
    let categorie = "Normal";
    if (imc < 18.5) categorie = "Maigreur";
    else if (imc >= 25.0 && imc < 30.0) categorie = "Surpoids";
    else if (imc >= 30.0) categorie = "Obésité";

    return { categorie, poidsMin, poidsMax };
};


const getInitialActivityFactor = (choix) => {
    const factors = { 1: 1.2, 2: 1.375, 3: 1.55, 4: 1.725 };
    return factors[choix] || 1.2;
};

const calculateCaloriesBurned = (tdee, bmr) => tdee - bmr;

module.exports = { 
    calculateBMR, calculateIMC, getImcInterpretation, calculateIMG, 
    getInitialActivityFactor, getActivityFactor, calculateCaloriesBurned, calculateMacros 
};


module.exports = { getImcInterpretation, getInitialActivityFactor, calculateCaloriesBurned, calculateBMR, calculateIMC, getWeightPlage, calculateIMG, calculateMacros, getActivityFactor, calculateTDEE  };

