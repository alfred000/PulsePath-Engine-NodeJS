/**
 * RM-GOAL-01 : Évalue la sécurité d'un objectif de poids
 * @param {Object} profile - Profil métabolique actuel de l'utilisateur
 * @param {Object} request - Demande d'objectif (targetWeightKg, durationWeeks, objective)
 */
function evaluateGoal(profile, request) {
    const targetWeightKg = parseFloat(request.targetWeightKg);
    const durationWeeks = parseInt(request.durationWeeks, 10);
    const objective = request.objective.toLowerCase();

    const totalWeightChange = Math.abs(profile.current_weight_kg - targetWeightKg);
    const plannedWeeklyRate = totalWeightChange / durationWeeks;

    // Règle des 1% : Plafond de sécurité basé sur le poids biologique actuel
    const maxSafeWeeklyRate = profile.current_weight_kg * 0.01;

    let status = "Approved";
    let warningMessage = "Goal parameters fall within safe metabolic boundaries.";
    let finalWeeklyRate = plannedWeeklyRate;

    // Déclenchement du garde-fou en cas de déficit trop agressif
    if (objective === "perte" && plannedWeeklyRate > maxSafeWeeklyRate) {
        status = "Overridden";
        finalWeeklyRate = maxSafeWeeklyRate; // Bridage de sécurité
        warningMessage = `The planned rate of ${plannedWeeklyRate.toFixed(2)}kg/week exceeds the 1% metabolic safety ceiling (${maxSafeWeeklyRate.toFixed(2)}kg/week). Goal auto-adjusted to safe limits.`;
    }

    // Conversion métabolique : 1kg de gras de réserve ~ 7700 kcal
    // Déficit quotidien = (Vitesse hebdomadaire * 7700) / 7 jours
    const calculatedDailyDeficit = Math.round((finalWeeklyRate * 7700) / 7);

    return {
        status,
        safeWeeklyRateKg: finalWeeklyRate,
        caloricDeficitTarget: calculatedDailyDeficit,
        warningMessage
    };
}

module.exports = { evaluateGoal };
