const metabolic = require('./metabolicEngine');
const velocity = require('./velocityEngine');
const logService = require('./logService');
const insightEngine = require('./insightEngine');
const courseCorrection = require('./courseCorrectionEngine');

class PulsePathOrchestrator {
    constructor(profile, dateFixation) {
        this.profile = profile;
        this.dateFixationObjectif = dateFixation;
    }

    async processDailyLog(log) {
        await logService.addLog(log);

        const bmrDuJour = metabolic.calculateBMR(log.weight, this.profile.tailleCm, this.profile.age, this.profile.isMale);
        const factor = metabolic.getActivityFactor(log.steps);
        const tdeeDuJour = metabolic.calculateTDEE(bmrDuJour, factor);
        const caloriesBruleesActivite = tdeeDuJour - bmrDuJour;

        const deficitHebdoReel = await logService.getAverageWeeklyDeficit(tdeeDuJour);
        const dateEstimee = velocity.projectTargetDate(log.weight, this.profile.poidsCible, deficitHebdoReel);

        const diffTemps = Math.abs(new Date() - this.profile.dateFixationObjectif);
        const joursEcoules = Math.floor(diffTemps / (1000 * 60 * 60 * 24)) + 1;

        let perteTotaleKg = 0;
        let progresPourcent = 0;

        if (this.profile.objective === 'perte' || this.profile.objective === 'seche') {
            if (log.weight < this.profile.poidsDepart) {
                perteTotaleKg = this.profile.poidsDepart - log.weight;
                progresPourcent = (perteTotaleKg / (this.profile.poidsDepart - this.profile.poidsCible)) * 100;
                if (progresPourcent > 100) progresPourcent = 100;
            }
        }

        const totalSeancesCetteSemaine = await logService.getAllLogs().reduce((acc, l) => acc + l.workoutsDone, 0);
        const scoreIntegrite = insightEngine.calculateIntegrityScore(log);

        let joursRetard = 0;
        if (dateEstimee) {
            const dateSeuil = new Date();
            dateSeuil.setDate(dateSeuil.getDate() + 30);
            if (dateEstimee > dateSeuil) {
                joursRetard = Math.floor(Math.abs(dateEstimee - dateSeuil) / (1000 * 60 * 60 * 24));
            }
        }

        let planCorrection = null;
        let messagePrescriptif = "";

        if (joursRetard >= 3) {
            planCorrection = courseCorrection.calculateCourseCorrection(log.weight, this.profile.budgetCaloriesCible, 8000, bmrDuJour, joursRetard);
        } else {
            messagePrescriptif = "🔥 Recommandation : Vous êtes parfaitement sur la bonne voie ! Continuez ainsi pour sécuriser votre date d'échéance cible.";
        }

        return {
            joursEcoules, perteTotaleKg, progresPourcent, tdeeDuJour, caloriesBruleesActivite,
            totalSeancesCetteSemaine, dateEstimee, scoreIntegrite, planCorrection, messagePrescriptif
        };
    }
}

module.exports = PulsePathOrchestrator;
