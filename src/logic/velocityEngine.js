/**
 * Règle RM-VEL-01 : Logique de Vélocité et Projection
 */

const KCAL_PER_KG = 7700;

const calculateDailyNetBalance = (caloriesIn, tdee) => {
    return caloriesIn - tdee;
};

const projectTargetDate = (currentWeight, targetWeight, averageWeeklyDeficit) => {
    // Si surplus ou maintenance, pas de projection possible
    if (averageWeeklyDeficit >= 0) return null;

    const kgALoser = currentWeight - targetWeight;
    const totalKcalABruler = kgALoser * KCAL_PER_KG;
    
    const averageDailyDeficit = Math.abs(averageWeeklyDeficit / 7);
    const joursRestants = Math.ceil(totalKcalABruler / averageDailyDeficit);

    const dateCible = new Date();
    dateCible.setDate(dateCible.getDate() + joursRestants);
    
    return dateCible;
};

module.exports = { calculateDailyNetBalance, projectTargetDate };
