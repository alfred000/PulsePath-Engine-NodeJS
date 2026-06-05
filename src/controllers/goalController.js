const { query } = require('../config/database');
const { evaluateGoal } = require('../logic/goalEngine');

/**
 * US-03 : Analyse et enregistre l'objectif S.M.A.R.T de l'utilisateur
 * Route protégée : POST /api/goals/evaluate
 */
async function evaluateUserGoal(req, res) {
    const { objective, targetWeightKg, durationWeeks } = req.body;
    const userId = req.userId; // Injecté automatiquement par le middleware JWT Guard

    if (!objective || !targetWeightKg || !durationWeeks) {
        return res.status(400).json({ message: "Objective, target weight, and duration are required." });
    }

    try {
        // Extraction du profil métabolique de l'utilisateur en base SQLite
        const profiles = await query(`SELECT * FROM user_profiles WHERE user_id = ?`, [userId]);
        const profile = profiles[0];

        if (!profile) {
            return res.status(400).json({ 
                message: "Metabolic profile variables must be initialized (US-02) before setting goals." 
            });
        }

        // Exécution du calcul algorithmique découpé
        const analysis = evaluateGoal(profile, { objective, targetWeightKg, durationWeeks });
        
        return res.status(200).json(analysis);

    } catch (error) {
        console.error("Goal evaluation error:", error.message);
        return res.status(500).json({ message: "An error occurred during goal analysis." });
    }
}

module.exports = { evaluateUserGoal };
