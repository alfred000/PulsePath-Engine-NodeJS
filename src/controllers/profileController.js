const { run, query } = require('../data/database');

/**
 * US-02 : Initialisation ou mise à jour du profil métabolique
 * Route protégée : POST /api/profile
 */
async function upsertProfile(req, res) {
    const { age, isMale, heightCm, currentWeightKg, activityFactor } = req.body;
    const userId = req.userId; // Injecté par le middleware authenticateToken

    // 1. Validation de présence des données obligatoires
    if (age === undefined || isMale === undefined || heightCm === undefined || currentWeightKg === undefined || activityFactor === undefined) {
        return res.status(400).json({ message: "All metabolic profile fields are required." });
    }

    // 2. CA-02.1 : Validation stricte des barrières physiologiques (Parité .NET)
    if (age < 15 || age > 90 || heightCm < 100 || heightCm > 250 || currentWeightKg < 40 || currentWeightKg > 250 || activityFactor < 1.2 || activityFactor > 2.5) {
        return res.status(400).json({ message: "Physiological boundaries violation." });
    }

    try {
        // Conversion de isMale (booléen) en entier (0 ou 1) pour SQLite
        const isMaleInt = isMale ? 1 : 0;

        // 3. Stratégie d'Upsert native dans SQLite pour remplacer ou insérer le profil
        await run(`
            INSERT INTO user_profiles (user_id, age, is_male, height_cm, current_weight_kg, activity_factor)
            VALUES (?, ?, ?, ?, ?, ?)
            ON CONFLICT(user_id) DO UPDATE SET
                age = excluded.age,
                is_male = excluded.is_male,
                height_cm = excluded.height_cm,
                current_weight_kg = excluded.current_weight_kg,
                activity_factor = excluded.activity_factor
        `, [userId, age, isMaleInt, heightCm, currentWeightKg, activityFactor]);

        return res.status(200).json({ message: "Profile metabolic variables initialized successfully." });

    } catch (error) {
        console.error("Profile upsert error:", error.message);
        return res.status(500).json({ message: "An error occurred during profile storage." });
    }
}

module.exports = { upsertProfile };
