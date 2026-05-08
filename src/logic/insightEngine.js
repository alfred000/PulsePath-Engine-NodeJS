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

module.exports = { getSleepInsight, getProteinInsight };
