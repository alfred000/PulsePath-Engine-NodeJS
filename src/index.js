const readline = require('readline');
const metabolic = require('./logic/metabolicEngine');
const velocity = require('./logic/velocityEngine');
const logService = require('./logic/logService');
const insightEngine = require('./logic/insightEngine');
const courseCorrection = require('./logic/courseCorrectionEngine'); // Nouvel import

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const ask = (question) => new Promise((resolve) => rl.question(question, resolve));

async function runPulsePath() {
    // Configuration de la date de départ (Simule que l'objectif a été fixé il y a 5 jours)
    const dateFixationObjectif = new Date();
    dateFixationObjectif.setDate(dateFixationObjectif.getDate() - 5);

    console.log("=========================================================");
    console.log("⚡     BIENVENUE SUR PULSEPATH ENGINE (NODE.JS V2)      ⚡");
    console.log("=========================================================");

    // --- ÉTAPE 1 : ONBOARDING & DIAGNOSTIC MÉTABOLIQUE ---
    console.log("\n[1/3] DIAGNOSTIC DE DÉPART");
    const genreInput = await ask("Genre (h/f) : ");
    const isMale = genreInput.toLowerCase() === 'h';
    const age = parseInt(await ask("Votre Âge (ans) : "));
    const tailleCm = parseFloat(await ask("Votre Taille (cm) : "));
    const poidsDepart = parseFloat(await ask("Poids de départ (kg) : "));

    console.log("\nNiveau d'activité physique habituel :");
    console.log("1. Sédentaire | 2. Activité légère | 3. Activité modérée | 4. Activité élevée");
    const choixActivite = parseInt(await ask("Votre choix (1-4) : "));

    // Exécution des calculs biométriques initiaux
    const bmrInitial = metabolic.calculateBMR(poidsDepart, tailleCm, age, isMale);
    const imcInitial = metabolic.calculateIMC(poidsDepart, tailleCm);
    const imgInitial = metabolic.calculateIMG(imcInitial, age, isMale);
    const { categorie, poidsMin, poidsMax } = metabolic.getImcInterpretation(tailleCm, imcInitial);
    const facteurInitial = metabolic.getInitialActivityFactor(choixActivite);
    const tdeeInitial = metabolic.calculateTDEE(bmrInitial, facteurInitial);

    // Affichage du profil santé initial
    console.log("\n------------------- DIAGNOSTIC INITIAL -------------------");
    console.log(`📊 Catégorie IMC : ${categorie} (${imcInitial.toFixed(1)})`);
    console.log(`🧬 IMG (Masse Grasse) : ${imgInitial.toFixed(1)}%`);
    console.log(`⚖️ Votre plage de poids bien-être : ${poidsMin.toFixed(1)} kg - ${poidsMax.toFixed(1)} kg`);
    console.log(`🍏 Métabolisme de Base (BMR) : ${Math.round(bmrInitial)} kcal`);
    console.log(`🔥 Maintenance théorique initiale : ${Math.round(tdeeInitial)} kcal / jour`);

    // --- ÉTAPE 2 : PLANIFICATION S.M.A.R.T ---
    console.log("\n[2/3] PLANIFICATION DE L'OBJECTIF S.M.A.R.T");
    const objective = await ask("Choisissez votre objectif (perte / seche / maintien / gain) : ");
    const poidsCible = parseFloat(await ask("Entrez votre poids cible (kg) : "));
    const seancesPrevues = parseInt(await ask("Combien de séances de sport prévoyez-vous par semaine ? : "));

    // Calcul du budget énergétique cible
    let budgetCaloriesCible = tdeeInitial;
    if (objective === 'perte' || objective === 'seche') budgetCaloriesCible -= 500;
    else if (objective === 'gain') budgetCaloriesCible += 300;

    const { proteins, carbs, fats } = metabolic.calculateMacros(budgetCaloriesCible, objective);

    console.log("\n------------------- VOTRE PLANNING VALIDÉ -------------------");
    console.log(`🎯 Apport énergétique ciblé : ${Math.round(budgetCaloriesCible)} kcal / jour`);
    console.log(`🧬 Ratios Macros : P: ${proteins}g | G: ${carbs}g | L: ${fats}g`);
    console.log(`🏋️ Fréquence d'entraînement cible : ${seancesPrevues} séances / semaine`);
    if (objective === 'perte' || objective === 'seche') {
        console.log(`💡 Stratégie : Atteignez ${Math.round(budgetCaloriesCible)} kcal. Ajoutez 8000 pas/jour ou du cardio LISS pour maximiser la dépense.`);
    }

    // --- ÉTAPE 3 : JOURNALISATION QUOTIDIENNE (DAILY LOG) ---
    console.log("\n[3/3] DOSSIER DE SUIVI QUOTIDIEN");

    let continuer = true;
    while (continuer) {
        console.log("\n--- Saisie de la journée de suivi ---");
        const poids = parseFloat(await ask("Poids du jour (kg) : "));
        const calIn = parseInt(await ask("Calories consommées (kcal) : "));
        const pas = parseInt(await ask("Nombre de pas (Montre connectée) : "));
        const sommeil = parseFloat(await ask("Heures de sommeil (Tracker de nuit) : "));
        const proteinesSaisie = parseInt(await ask("Protéines consommées (g) : "));
        const sportAujourdhui = parseInt(await ask("Séance de sport validée aujourd'hui ? (1 pour oui / 0 pour non) : "));
        const jeuneReponse = await ask("Objectif de jeûne intermittent atteint ? (o/n) : ");
        const jeuneValide = jeuneReponse.toLowerCase() === 'o';

        // Calculs dynamiques du jour (RM-MET-01)
        const bmrDuJour = metabolic.calculateBMR(poids, tailleCm, age, isMale);
        const factor = metabolic.getActivityFactor(pas);
        const tdeeDuJour = metabolic.calculateTDEE(bmrDuJour, factor);
        const caloriesBruleesActivite = metabolic.calculateCaloriesBurned(tdeeDuJour, bmrDuJour);

        // Enregistrement des données et calcul de vélocité (RM-VEL-01)
        const logDuJour = {
            weight: poids, caloriesIn: calIn, steps: pas, sleepHours: sommeil,
            proteinsIn: proteinesSaisie, workoutsDone: sportAujourdhui, fastingValidated: jeuneValide
        };

        logService.addLog(logDuJour);
        const deficitHebdoReel = logService.getAverageWeeklyDeficit(tdeeDuJour);
        const dateEstimee = velocity.projectTargetDate(poids, poidsCible, deficitHebdoReel);

        // --- APPLICATION DE LA RÈGLE RM-KPI-01 : PROGRESSION LINÉAIRE ---
        const diffTemps = Math.abs(new Date() - dateFixationObjectif);
        const joursEcoules = Math.floor(diffTemps / (1000 * 60 * 60 * 24)) + 1;
        let perteTotaleKg = 0;
        let progresPourcent = 0;

        if (objective === 'perte' || objective === 'seche') {
            // Si l'utilisateur est en surplus (poids du jour >= poids de départ), le progrès reste figé à 0
            if (poids < poidsDepart) {
                perteTotaleKg = poidsDepart - poids;
                const totalAPerdre = poidsDepart - poidsCible;
                progresPourcent = (perteTotaleKg / totalAPerdre) * 100;
                if (progresPourcent > 100) progresPourcent = 100.0;
            } else {
                perteTotaleKg = 0.0;
                progresPourcent = 0.0;
            }
        }

        const totalSeancesCetteSemaine = logService.getAllLogs().reduce((acc, l) => acc + l.workoutsDone, 0);
        const scoreIntegrite = insightEngine.calculateIntegrityScore(logDuJour);

        // Simulation d'un calcul de retard pour déclencher le moteur de rattrapage
        let joursRetard = 0;
        if (dateEstimee) {
            const dateSeuil = new Date();
            dateSeuil.setDate(dateSeuil.getDate() + 30);
            if (dateEstimee > dateSeuil) {
                const diffRetard = Math.abs(dateEstimee - dateSeuil);
                joursRetard = Math.floor(diffRetard / (1000 * 60 * 60 * 24));
            }
        }

        // --- RESTITUTION DU DASHBOARD ---
        console.log("\n=================== DASHBOARD DU JOUR ===================");
        console.log(`⏱️ Jours cumulés depuis le début : ${joursEcoules} jours`);
        console.log(`📉 Perte totale : ${perteTotaleKg.toFixed(1)} kg | 📈 Progrès global : ${progresPourcent.toFixed(1)}%`);
        console.log(`🔥 TDEE du jour : ${Math.round(tdeeDuJour)} kcal | 🏃 Activité (Pas/LISS) : +${Math.round(caloriesBruleesActivite)} kcal`);
        console.log(`🏋️ Séances validées cette semaine : ${totalSeancesCetteSemaine} / ${seancesPrevues}`);
        console.log(`⚖️ Balance Calorique Net du jour : ${calIn - Math.round(tdeeDuJour)} kcal`);

        if (!dateEstimee) {
            console.log("⏱️ Trajectoire : Échéance gelée (En surplus métabolique temporaire).");
        } else {
            console.log(`⏱️ Date d'échéance révisée : ${dateEstimee.toLocaleDateString()}`);
        }

        // --- INTELLIGENCE PRESCRIPTIVE : MOTEUR DE RATTRAPAGE (RM-COR-01) ---
        if (joursRetard >= 3) {
            const planRattrapage = courseCorrection.calculateCourseCorrection(poids, budgetCaloriesCible, 8000, bmrDuJour, joursRetard);
            
            console.log("\n🚨 --- RECOMMANDATION PRESCRIPTIVE (REMETTRE SUR LA BONNE VOIE) ---");
            console.log(`${planRattrapage.message}`);
            console.log(`Cible Calories temporaire (7 jours) : ${planRattrapage.cibleCalories} kcal (Seuil de sécurité BMR respecté)`);
            console.log(`Cible Pas temporaire (7 jours)      : ${planRattrapage.ciblePas} pas`);
            console.log(`Cardio LISS suggéré                 : ${planRattrapage.cardioLISSSuggere}`);
        } else {
            console.log("\n--- COACHING & INSIGHTS STANDARD ---");
            console.log(insightEngine.getSleepInsight(sommeil));
            console.log(insightEngine.getProteinInsight(proteinesSaisie, poids));
            console.log(`📊 Score d'Intégrité de la donnée : ${scoreIntegrite}%`);
            if (scoreIntegrite === 100) console.WriteLine("🏆 Badge 'Intégrité' débloqué ! Vos données de santé sont parfaitement fiables.");
        }

        const reponse = await ask("\nAjouter une autre journée ? (o/n) : ");
        continuer = reponse.toLowerCase() === 'o';
    }

    console.log("\nApplication fermée. Toutes les métriques ont été calculées.");
    rl.close();
}

runPulsePath();
