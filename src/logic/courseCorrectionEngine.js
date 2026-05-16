/**
 * RM-COR-01 : Moteur de Rattrapage Intelligent sous contraintes
 */

const calculateCourseCorrection = (poidsActuel, budgetCaloriesInitial, objectifPasInitial, bmr, joursEcart) => {
    const dureeJours = 7;
    
    // Étape A : Calcul de l'écart énergétique (500 kcal par jour d'écart)
    const surplusARattraper = joursEcart * 500;
    const effortQuotidienRequis = surplusARattraper / dureeJours;

    // Étape B : Répartition des leviers (Règle 40/60)
    const ajustementCalorique = effortQuotidienRequis * 0.40;
    const cibleTemporaireCalories = budgetCaloriesInitial - ajustementCalorique;
    let effortResiduel = 0;
    let cibleCalories = 0;

    // Application de la contrainte métabolique (Hard Guardrail sur le BMR)
    if (cibleTemporaireCalories < bmr) {
        cibleCalories = bmr; // Bloqué au niveau de survie
        effortResiduel = effortQuotidienRequis - (budgetCaloriesInitial - bmr); // Le reste bascule sur l'activité
    } else {
        cibleCalories = cibleTemporaireCalories;
        effortResiduel = effortQuotidienRequis * 0.60;
    }

    // Étape C : Conversion de l'effort résiduel en activité
    // Modèle prédictif : 1000 pas = (Poids * 0.5) kcal
    const caloriesPar1000Pas = poidsActuel * 0.5;
    const pasSupplementaires = (effortResiduel / caloriesPar1000Pas) * 1000;
    const nouvelleCiblePas = objectifPasInitial + pasSupplementaires;

    let ciblePas = 0;
    let message = "";
    let cardioLISSSuggere = "";

    // Application de la contrainte d'épuisement (Hard Guardrail à 18 000 pas)
    if (nouvelleCiblePas > 18000) {
        ciblePas = 18000;
        message = "⚠️ Écart trop important pour être rattrapé sainement en 7 jours. Cible d'activité bridée pour éviter l'épuisement.";
        cardioLISSSuggere = "Ajouter 45 min de marche rapide ou vélo basse intensité (LISS).";
    } else {
        ciblePas = Math.round(nouvelleCiblePas);
        message = "📉 Plan de correction dynamique actif pour vous remettre sur la bonne voie.";
        cardioLISSSuggere = effortResiduel > 200 ? "Ajouter 20-30 min de marche active quotidienne." : "Aucun cardio additionnel requis.";
    }

    return {
        dureeJours,
        cibleCalories: Math.round(cibleCalories),
        ciblePas,
        message,
        cardioLISSSuggere
    };
};

module.exports = { calculateCourseCorrection };
