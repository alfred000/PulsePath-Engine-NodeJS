const readline = require('readline');
const metabolic = require('./logic/metabolicEngine');
const velocity = require('./logic/velocityEngine');
const logService = require('./logic/logService');
const insightEngine = require('./logic/insightEngine');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const ask = (question) => new Promise((resolve) => rl.question(question, resolve));

async function runPulsePath() {
    console.log("=================================================");
    console.log("⚡   BIENVENUE SUR PULSEPATH ENGINE (NODE.JS)   ⚡");
    console.log("=================================================");

    // --- ÉTAPE 1 : ONBOARDING & DIAGNOSTIC ---
    console.log("\n[1/3] DIAGNOSTIC DE DÉPART");
    const genreInput = await ask("Genre (h/f) : ");
    const isMale = genreInput.toLowerCase() === 'h';
    const age = parseInt(await ask("Votre Âge (ans) : "));
    const tailleCm = parseFloat(await ask("Votre Taille (cm) : "));
    const poidsDepart = parseFloat(await ask("Poids de départ (kg) : "));

    const bmrInitial = metabolic.calculateBMR(poidsDepart, tailleCm, age, isMale);
    const imcInitial = metabolic.calculateIMC(poidsDepart, tailleCm);
    const imgInitial = metabolic.calculateIMG(imcInitial, age, isMale);
    const { poidsMin, poidsMax } = metabolic.getWeightPlage(tailleCm);

    console.log("\n------------------- VOS MÉTRIQUES -------------------");
    console.log(`📊 IMC : ${imcInitial.toFixed(1)}`);
    console.log(`🧬 IMG (Masse Grasse) : ${imgInitial.toFixed(1)}%`);
    console.log(`⚖️ Plage bien-être conseillée : ${poidsMin.toFixed(1)} kg - ${poidsMax.toFixed(1)} kg`);
    console.log(`🍏 BMR initial : ${Math.round(bmrInitial)} kcal`);

    // --- ÉTAPE 2 : PLANIFICATION S.M.A.R.T ---
    console.log("\n[2/3] PLANIFICATION DE L'OBJECTIF S.M.A.R.T");
    const objective = await ask("Choisissez votre objectif (perte / maintien / gain) : ");
    const poidsCible = parseFloat(await ask("Entrez votre poids cible (kg) : "));

    if (objective.toLowerCase() === 'perte' && poidsCible < poidsMin) {
        console.log(`⚠️ ATTENTION : Cible agressive inférieure au poids bien-être (${poidsMin.toFixed(1)} kg).`);
    }

    const tdeeInitial = bmrInitial * 1.4;
    let budgetCaloriesCible = tdeeInitial;
    if (objective.toLowerCase() === 'perte') budgetCaloriesCible -= 500;
    else if (objective.toLowerCase() === 'gain') budgetCaloriesCible += 300;

    const { proteins, carbs, fats } = metabolic.calculateMacros(budgetCaloriesCible, objective);

    console.log("\n------------------- VOTRE PLANNING -------------------");
    console.log(`🎯 Budget Énergétique Ciblé : ${Math.round(budgetCaloriesCible)} Calories / jour`);
    console.log(`🧬 Ratio Macros : P: ${proteins}g | G: ${carbs}g | L: ${fats}g`);

    // --- ÉTAPE 3 : JOURNALISATION (DAILY LOG) ---
    console.log("\n[3/3] JOURNAL DE BORD QUOTIDIEN");

    let continuer = true;
    while (continuer) {
        console.log("\n--- Saisie du jour ---");
        const poids = parseFloat(await ask("Poids du jour (kg) : "));
        const calIn = parseInt(await ask("Calories consommées (kcal) : "));
        const pas = parseInt(await ask("Nombre de pas : "));
        const sommeil = parseFloat(await ask("Heures de sommeil : "));
        const proteinesSaisie = parseInt(await ask("Protéines consommées (g) : "));
        const jeuneReponse = await ask("Objectif de jeûne atteint ? (o/n) : ");
        const jeuneValide = jeuneReponse.toLowerCase() === 'o';

        const bmrDuJour = metabolic.calculateBMR(poids, tailleCm, age, isMale);
        const factor = metabolic.getActivityFactor(pas);
        const tdeeDuJour = metabolic.calculateTDEE(bmrDuJour, factor);
        const calBrulees = tdeeDuJour - bmrDuJour;

        const logDuJour = {
            weight: poids,
            caloriesIn: calIn,
            steps: pas,
            sleepHours: sommeil,
            proteinsIn: proteinesSaisie,
            fastingValidated: jeuneValide
        };

        logService.addLog(logDuJour);
        const deficitHebdo = logService.getAverageWeeklyDeficit(tdeeDuJour);
        const dateEstimee = velocity.projectTargetDate(poids, poidsCible, deficitHebdo);
        const scoreIntegrite = insightEngine.calculateIntegrityScore(logDuJour);

        console.log("\n=================== DASHBOARD DU JOUR ===================");
        console.log(`🔥 TDEE du jour : ${Math.round(tdeeDuJour)} kcal`);
        console.log(`🏃 Activité : +${Math.round(calBrulees)} kcal brûlées`);
        console.log(`⚖️ Balance Net : ${calIn - Math.round(tdeeDuJour)} kcal`);
        console.log(`⏱️ Échéance estimée : ${dateEstimee ? dateEstimee.toLocaleDateString() : "Surplus / Impossible à projeter"}`);

        console.log("\n--- COACHING & INSIGHTS ---");
        console.log(insightEngine.getSleepInsight(sommeil));
        console.log(insightEngine.getProteinInsight(proteinesSaisie, poids));
        console.log(`📊 Qualité des données (Intégrité) : ${scoreIntegrite}%`);
        if (scoreIntegrite === 100) console.log("🏆 Badge 'Intégrité' obtenu ! Vos prédictions sont hautement fiables.");

        const reponse = await ask("\nAjouter une autre journée ? (o/n) : ");
        continuer = reponse.toLowerCase() === 'o';
    }
    console.log("\nFermeture de l'application.");
    rl.close();
}

runPulsePath();

