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

module.exports = { calculateBMR, getActivityFactor, calculateTDEE };
