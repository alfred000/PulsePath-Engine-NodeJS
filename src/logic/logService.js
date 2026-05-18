const db = require('../data/database');

class LogService {
    // Insérer un log quotidien de manière persistante
    async addLog(log) {
        const sql = `
            INSERT INTO daily_logs (date, weight, calories_in, steps, sleep_hours, proteins_in, fasting_validated, workouts_done)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const params = [
            log.date || new Date().toISOString(),
            log.weight,
            log.caloriesIn,
            log.steps,
            log.sleepHours,
            log.proteinsIn,
            log.fastingValidated ? 1 : 0,
            log.workoutsDone
        ];
        return await db.run(sql, params);
    }

    // Récupérer l'intégralité des entrées depuis SQLite
    async getAllLogs() {
        const sql = `SELECT * FROM daily_logs ORDER BY date DESC`;
        const rows = await db.query(sql);
        // Réalignement du format de base de données vers le format du modèle JS
        return rows.map(row => ({
            id: row.id,
            date: new Date(row.date),
            weight: row.weight,
            caloriesIn: row.calories_in,
            steps: row.steps,
            sleepHours: row.sleep_hours,
            proteinsIn: row.proteins_in,
            fastingValidated: row.fasting_validated === 1,
            workoutsDone: row.workouts_done
        }));
    }

    // Règle RM-VEL-01 : Calcul de la moyenne glissante sur les 7 derniers logs persistés
    async getAverageWeeklyDeficit(currentTdee) {
        const sql = `SELECT calories_in FROM daily_logs ORDER BY date DESC LIMIT 7`;
        const rows = await db.query(sql);

        if (rows.length === 0) return 0;

        const totalDeficit = rows.reduce((acc, row) => {
            return acc + (row.calories_in - currentTdee);
        }, 0);

        return (totalDeficit / rows.length) * 7;
    }
}

module.exports = new LogService();
