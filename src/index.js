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
    const dateFixationObjectif = new Date();
    dateFixationObjectif.setDate(dateFixationObjectif.getDate() - 5); // Simule 5 jours passés

    console.log("=================================================");
    console.log("⚡   BIENVENUE SUR PULSEPATH ENGINE (NODE.JS)   ⚡");
    console.log("=================================================");

    // --- ÉTAPE 1 : DIAGNOSTIC ---
    console.log("\n[1/3] DIAGNOSTIC DE DÉPART");
    const genreInput = await ask("Genre (h/f) : ");
    const isMale = genreInput.toLowerCase() === 'h';
    const age = parseInt(await ask("Votre Âge (ans) : "));
    const tailleCm = parseFloat(await ask("Votre Taille (cm) : "));
    const poidsDepart = parseFloat(await ask("Poids de départ (kg) : "));

    console.log("\nNiveau d'activité physique :");
    console.log("1. Sédentaire | 2. Activité légère | 3. Activité modérée | 4. Activité élevée");
    const choixActivite = parseInt(await ask("Votre choix (1-4) : "));

    const bmrInitial = metabolic.calculateBMR(poidsDepart, tailleCm, age, isMale);
    const imcInitial = metabolic.calculateIMC(poidsDepart, tailleCm);
    const imgInitial = metabolic.calculateIMG(imcInitial, age, isMale);
    const { categorie, poidsMin, poidsMax } = metabolic.getImcInterpretation(tailleCm, imcInitial);
    const facteurInitial = metabolic.getInitialActivityFactor(choixActivite);
    const tdeeInitial = bmrInitial * facteurInitial;

    console.log("\n------------------- DIAGNOSTIC INITIAL -------------------");
    console.log(`📊 Catégorie IMC : ${categorie} (${imcInitial.toFixed(1)})`);
    console.log(`🧬 IMG (Masse Grasse) : ${imgInitial.toFixed(1)}%`);
    console.log(`⚖️ Plage bien-être conseillée : ${poidsMin.toFixed(1)} kg - ${poidsMax.toFixed(1)} kg`);
    console.log(`🍏 Maintenance de départ : ${Math.round(tdeeInitial)} kcal`);

    // --- ÉTAPE 2 : PLANIFICATION ---
    console.log("\n[2/3] PLANIFICATION DE L'OBJECTIF S.M.A.R.T");
    const objective = await ask("Objectif (perte / seche / maintien / gain) : ");
    const poidsCible = parseFloat(await ask("Entrez votre poids cible (kg) : "));
    const seancesPrevues = parseInt(await ask("Nombre de séances de sport par semaine : "));

    let budgetCaloriesCible = tdeeInitial;
    if (objective === 'perte' || objective === 'seche') budgetCaloriesCible -= 500;
    else if (objective === 'gain') budgetCaloriesCible += 300;

    const { proteins, carbs, fats } = metabolic.calculateMacros(budgetCaloriesCible, objective);

    console.log("\n------------------- VOTRE PLANNING VALIDÉ -------------------");
    console.log(`🎯 Calories programmées : ${Math.round(budgetCaloriesCible)} kcal / jour`);
    console.log(`🧬 Ratio Macros : P: ${proteins}g | G: ${carbs}g | L: ${fats}g`);
    console.log(`🏋️ Objectif Sport : ${seancesPrevues} séances / semaine`);

    // --- ÉTAPE 3 : JOURNALISATION ---
    console.log("\n[3/3] JOURNAL DE BORD QUOTIDIEN");

    let continuer = true;
    while (continuer) {
        console.log("\n--- Saisie du jour ---");
        const poids = parseFloat(await ask("Poids du jour (kg) : "));
        const calIn = parseInt(await ask("Calories consommées (kcal) : "));
        const pas = parseInt(await ask("Nombre de pas : "));
        const sommeil = parseFloat(await ask("Heures de sommeil : "));
        const proteinesSaisie = parseInt(await ask("Protéines consommées (g) : "));
        const sportAujourdhui = parseInt(await ask("Séance de sport validée aujourd'hui ? (1 pour oui / 0 pour non) : "));
        const jeuneReponse = await ask("Objectif de jeûne atteint ? (o/n) : ");
        const jeuneValide = jeuneReponse.toLowerCase() === 'o';

        const bmrDuJour = metabolic.calculateBMR(poids, tailleCm, age, isMale);
        const factor = metabolic.getActivityFactor(pas);
        const tdeeDuJour = metabolic.calculateTDEE(bmrDuJour, factor);
        const calBrulees = tdeeDuJour - bmrDuJour;

        const logDuJour = {
            weight: poids, caloriesIn: calIn, steps: pas, sleepHours: sommeil,
            proteinsIn: proteinesSaisie, workoutsDone: sportAujourdhui, fastingValidated: jeuneValide
        };

        logService.addLog(logDuJour);
        const deficitHebdo = logService.getAverageWeeklyDeficit(tdeeDuJour);
        const dateEstimee = velocity.projectTargetDate(poids, poidsCible, deficitHebdo);
        const scoreIntegrite = insightEngine.calculateIntegrityScore(logDuJour);

        // Calcul des KPIs d'évolution
        const diffTemps = Math.abs(new Date() - dateFixationObjectif);
        const joursEcoules = Math.floor(diffTemps / (1000 * 60 * 60 * 24)) + 1;
        let perteTotaleKg = 0;
        let progresPourcent = 0;

        if (objective === 'perte' || objective === 'seche') {
            if (poids < poidsDepart) {
                perteTotaleKg = poidsDepart - poids;
                progresPourcent = (perteTotaleKg / (poidsDepart - poidsCible)) * 100;
                if (progresPourcent > 100) progresPourcent = 100;
            }
        }

        const totalSeancesSport = logService.getAllLogs().reduce((acc, l) => acc + l.workoutsDone, 0);

        console.log("\n=================== DASHBOARD DU JOUR ===================");
        console.log(`⏱️ Jours cumulés depuis le début : ${joursEcoules} jours`);
        console.log(`📉 Évolution : -${perteTotaleKg.toFixed(1)} kg | 📈 Progrès : ${progresPourcent.toFixed(1)}%`);
        console.log(`🔥 TDEE du jour : ${Math.round(tdeeDuJour)} kcal | 跑 Activité : +${Math.round(calBrulees)} kcal`);
        console.log(`🏋️ Planning Sport : ${totalSeancesSport} / ${seancesPrevues} séances effectuées`);
        console.log(`⚖️ Balance Calorique Net : ${calIn - Math.round(tdeeDuJour)} kcal`);
        console.log(`⏱️ Échéance révisée : ${dateEstimee ? dateEstimee.toLocaleDateString() : "Échéance gelée (Surplus)"}`);

        console.log("\n--- COACHING & INSIGHTS ---");
        console.log(insightEngine.getSleepInsight(sommeil));
        console.log(`📊 Intégrité de la donnée : ${scoreIntegrite}%`);

        const reponse = await ask("\nAjouter une autre journée ? (o/n) : ");
        continuer = reponse.toLowerCase() === 'o';
    }
    rl.close();
}

runPulsePath();
