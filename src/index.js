const readline = require('readline');
const metabolic = require('./logic/metabolicEngine');
const insightEngine = require('./logic/insightEngine');
const PulsePathOrchestrator = require('./logic/pulsePathOrchestrator'); // Import de l'orchestrateur

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (question) => new Promise((resolve) => rl.question(question, resolve));

async function runPulsePath() {
    const dateFixationObjectif = new Date();
    dateFixationObjectif.setDate(dateFixationObjectif.getDate() - 5);

    console.log("=========================================================");
    console.log("⚡     BIENVENUE SUR PULSEPATH ENGINE (NODE.JS V2)      ⚡");
    console.log("=========================================================");

    const genreInput = await ask("Genre (h/f) : ");
    const profile = {
        isMale: genreInput.toLowerCase() === 'h',
        age: parseInt(await ask("Votre Âge (ans) : ")),
        tailleCm: parseFloat(await ask("Votre Taille (cm) : ")),
        poidsDepart: parseFloat(await ask("Poids de départ (kg) : ")),
        objective: await ask("Objectif (perte / seche / maintien / gain) : "),
        poidsCible: parseFloat(await ask("Entrez votre poids cible (kg) : ")),
        seancesPrevues: parseInt(await ask("Séances de sport par semaine : ")),
        dateFixationObjectif: dateFixationObjectif
    };

    const bmrInitial = metabolic.calculateBMR(profile.poidsDepart, profile.tailleCm, profile.age, profile.isMale);
    profile.budgetCaloriesCible = bmrInitial * 1.2;
    if (profile.objective === 'perte' || profile.objective === 'seche') profile.budgetCaloriesCible -= 500;
    else if (profile.objective === 'gain') profile.budgetCaloriesCible += 300;

    const orchestrator = new PulsePathOrchestrator(profile, dateFixationObjectif);

    let continuer = true;
    while (continuer) {
        console.log("\n--- Saisie du jour ---");
        const logDuJour = {
            weight: parseFloat(await ask("Poids du jour (kg) : ")),
            caloriesIn: parseInt(await ask("Calories consommées (kcal) : ")),
            steps: parseInt(await ask("Nombre de pas : ")),
            sleepHours: parseFloat(await ask("Heures de sommeil : ")),
            proteinsIn: parseInt(await ask("Protéines consommées (g) : ")),
            workoutsDone: parseInt(await ask("Séance de sport validée (1/0) : ")),
            fastingValidated: (await ask("Objectif de jeûne atteint ? (o/n) : ")).toLowerCase() === 'o'
        };

        const result = await orchestrator.processDailyLog(logDuJour);

        // === RESTITUTION DU DASHBOARD CONSOLE ===
        console.log("\n=================== [BLOC 1] DASHBOARD DU JOUR ===================");
        console.log(`⏱️ Jours cumulés : ${result.joursEcoules} jours | 🏋️ Sport : ${result.totalSeancesCetteSemaine} / ${profile.seancesPrevues}`);
        console.log(`📉 Perte totale : ${result.perteTotaleKg.toFixed(1)} kg | 📈 Progrès : ${result.progresPourcent.toFixed(1)}%`);
        console.log(`🔥 TDEE du jour : ${Math.round(result.tdeeDuJour)} kcal | 🏃 Activité : +${Math.round(result.caloriesBruleesActivite)} kcal`);
        console.log(`⚖️ Balance calorique Net : ${logDuJour.caloriesIn - Math.round(result.tdeeDuJour)} kcal`);
        console.log(`⏱️ Échéance révisée : ${result.dateEstimee ? result.dateEstimee.toLocaleDateString() : "Échéance gelée (En surplus)"}`);

        console.log("\n=================== [BLOC 2] RECOMMANDATION PRESCRIPTIVE ===================");
        if (result.planCorrection) {
            console.log(`${result.planCorrection.message}`);
            console.log(`🎯 Cible Calories temporaire (7 jours) : ${result.planCorrection.cibleCalories} kcal`);
            console.log(`🏃 Cible Pas temporaire (7 jours)      : ${result.planCorrection.ciblePas} pas`);
            console.log(`🏋️ Cardio LISS suggéré                 : ${result.planCorrection.cardioLISSSuggere}`);
        } else {
            console.log(result.messagePrescriptif);
        }

        console.log("\n=================== [BLOC 3] COACHING & INSIGHTS ===================");
        console.log(insightEngine.getSleepInsight(logDuJour.sleepHours));
        console.log(`📊 Score d'Intégrité de la donnée : ${result.scoreIntegrite}%`);

        const reponse = await ask("\nAjouter une autre journée ? (o/n) : ");
        continuer = reponse.toLowerCase() === 'o';
    }
    rl.close();
}

runPulsePath();
