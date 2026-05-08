const readline = require('readline');
const metabolic = require('./logic/metabolicEngine');
const velocity = require('./logic/velocityEngine');
const logService = require('./logic/logService');
const insightEngine = require('./logic/insightEngine'); // Importation du moteur d'insights

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const ask = (question) => new Promise((resolve) => rl.question(question, resolve));

async function startEngine() {
    console.log("\n=== BIENVENUE SUR PULSEPATH ENGINE (NODE.JS) ===");
    const poidsCible = parseFloat(await ask("Poids cible (kg) : "));

    let continuer = true;
    while (continuer) {
        console.log("\n--- Nouvelle saisie quotidienne ---");
        
        const poids = parseFloat(await ask("Poids actuel (kg) : "));
        const calIn = parseInt(await ask("Calories consommées (kcal) : "));
        const pas = parseInt(await ask("Nombre de pas : "));
        const sommeil = parseFloat(await ask("Heures de sommeil : "));

        // 1. Calculs Métaboliques
        const bmr = metabolic.calculateBMR(poids, 180, 30, true);
        const factor = metabolic.getActivityFactor(pas);
        const tdee = metabolic.calculateTDEE(bmr, factor);

        // 2. Sauvegarde et Vélocité
        logService.addLog({ date: new Date(), caloriesIn: calIn, weight: poids });
        const deficitHebdo = logService.getAverageWeeklyDeficit(tdee);
        const dateEstimee = velocity.projectTargetDate(poids, poidsCible, deficitHebdo);

        // 3. Affichage des résultats
        console.log("\n--- RÉSULTATS DU MOTEUR ---");
        console.log(`TDEE : ${Math.round(tdee)} kcal | Bilan Net : ${calIn - Math.round(tdee)} kcal`);
        
        if (!dateEstimee) {
            console.log("Trajectoire : En surplus (Calcul impossible)");
        } else {
            console.log(`Date d'échéance estimée : ${dateEstimee.toLocaleDateString()}`);
        }

        // 4. Génération des Insights (Coaching)
        console.log("\n--- COACHING & INSIGHTS ---");
        console.log(insightEngine.getSleepInsight(sommeil));

        const reponse = await ask("\nAjouter une autre journée ? (o/n) : ");
        continuer = reponse.toLowerCase() === 'o';
    }
    console.log("\nFin du programme. Vos données en mémoire ont été traitées.");
    rl.close();
}

startEngine();
