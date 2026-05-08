/**
 * Service de gestion des logs et calculs d'historique
 */

class LogService {
    constructor() {
        this.logs = [];
    }

    addLog(log) {
        this.logs.push(log);
    }

    getAllLogs() {
        return this.logs;
    }

    // Règle RM-VEL-01 : Moyenne glissante sur 7 jours
    getAverageWeeklyDeficit(currentTdee) {
        // Trier par date décroissante et prendre les 7 premiers
        const lastSevenDays = [...this.logs]
            .sort((a, b) => b.date - a.date)
            .slice(0, 7);

        if (lastSevenDays.length === 0) return 0;

        const totalDeficit = lastSevenDays.reduce((acc, log) => {
            return acc + (log.caloriesIn - currentTdee);
        }, 0);

        return (totalDeficit / lastSevenDays.length) * 7;
    }
}

module.exports = new LogService(); // Singleton pour garder les logs en mémoire
