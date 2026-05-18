const PulsePathOrchestrator = require('../logic/pulsePathOrchestrator');
const logService = require('../logic/logService');

// Simulation d'un profil de test (Homme, 30 ans, 180cm, objectif Perte) pour le MVP Web
const mockProfile = {
    isMale: true,
    age: 30,
    tailleCm: 180,
    poidsDepart: 85.0,
    poidsCible: 75.0,
    objective: "perte",
    budgetCaloriesCible: 1636,
    seancesPrevues: 4
};

// Date de fixation simulée à -5 jours
const dateFixation = new Date();
dateFixation.setDate(dateFixation.getDate() - 5);

const orchestrator = new PulsePathOrchestrator(mockProfile, dateFixation);

// Endpoint 1 : Récupérer tout l'historique (GET)
const getHistory = async (req, res) => {
    try {
        const logs = await logService.getAllLogs();
        res.status(200).json(logs);
    } catch (error) {
        res.status(500).json({ error: "Erreur lors de la récupération de l'historique", message: error.message });
    }
};

// Endpoint 2 : Soumettre un log et obtenir le Dashboard (POST)
const submitDailyLog = async (req, res) => {
    try {
        const dto = req.body;

        const logEntity = {
            date: new Date(),
            weight: dto.weight,
            caloriesIn: dto.caloriesIn,
            steps: dto.steps,
            sleepHours: dto.sleepHours,
            proteinsIn: dto.proteinsIn,
            fastingValidated: dto.fastingValidated,
            workoutsDone: dto.workoutsDone
        };

        const results = await orchestrator.processDailyLog(logEntity);
        res.status(200).json(results);
    } catch (error) {
        res.status(500).json({ error: "Erreur lors du traitement du log", message: error.message });
    }
};

module.exports = { getHistory, submitDailyLog };
