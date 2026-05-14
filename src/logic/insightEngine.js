/**
 * Règle RM-FAST-01 & RM-PRO-01 : Moteur de recommandations automatisées
 */

const getSleepInsight = (sleepHours) => {
    if (sleepHours < 7) {
        return "⚠️ INSIGHT : Votre sommeil est inférieur à 7h. Attention, cela peut dérégler vos hormones de faim demain.";
    }
    return "✅ INSIGHT : Sommeil optimal. Votre récupération favorise la stabilité métabolique.";
};

const getProteinInsight = (proteins, weight) => {
    const seuil = weight * 1.5;
    if (proteins < seuil) {
        return "⚠️ ALERTE : Apport protéique trop bas. Risque de perte musculaire pendant le déficit.";
    }
    return "✅ INFO : Apport protéique suffisant pour protéger vos muscles.";
};

/**
 * Règle RM-GAM-01 : Calcul du Score d'Intégrité
 */
const calculateIntegrityScore = (log) => {
    let score = 0;

    // Poids et Calories (50%)
    if (log.weight > 0 && log.caloriesIn > 0) score += 50;

    // Pas et Sommeil (30%)
    if (log.steps > 0 && log.sleepHours > 0) score += 30;

    // Protéines et Jeûne (20% - 10% chacun)
    if (log.proteinsIn > 0) score += 10;
    if (log.fastingValidated) score += 10;

    return score;
};

module.exports = { getSleepInsight, getProteinInsight, calculateIntegrityScore };
