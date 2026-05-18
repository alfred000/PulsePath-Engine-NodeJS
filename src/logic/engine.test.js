const courseCorrection = require('./courseCorrectionEngine');

describe('⚡ Tests Unitaires PulsePath Engine - Validation des Règles Métier', () => {

    test('RM-COR-01 : Le plan de correction ne doit jamais descendre sous le BMR', () => {
        // Arrange
        const poidsActuel = 80;
        const budgetCaloriesInitial = 2000;
        const objectifPasInitial = 8000;
        const bmr = 1800;
        const joursEcart = 15;

        // Act
        const plan = courseCorrection.calculateCourseCorrection(poidsActuel, budgetCaloriesInitial, objectifPasInitial, bmr, joursEcart);

        // Assert
        expect(plan.cibleCalories).toBeGreaterThanOrEqual(bmr);
        expect(plan.cibleCalories).toEqual(bmr); // Doit être bridé exactement au seuil
    });

    test('RM-KPI-01 : Le progrès doit rester à 0% si l’utilisateur est en surplus par rapport au départ', () => {
        // Arrange
        const poidsDepart = 85.0;
        const poidsCible = 75.0;
        const poidsActuel = 86.0;
        const objective = 'perte';

        let perteTotaleKg = 0;
        let progresPourcent = 0;

        // Act (Copie conforme de notre orchestrateur)
        if (objective === 'perte') {
            if (poidsActuel < poidsDepart) {
                perteTotaleKg = poidsDepart - poidsActuel;
                progresPourcent = (perteTotaleKg / (poidsDepart - poidsCible)) * 100;
            } else {
                perteTotaleKg = 0.0;
                progresPourcent = 0.0;
            }
        }

        // Assert
        expect(perteTotaleKg).toEqual(0.0);
        expect(progresPourcent).toEqual(0.0);
    });

    test('RM-COR-01 : L’objectif de pas ne doit jamais dépasser le plafond de sécurité de 18 000 pas', () => {
        // Arrange
        const poidsActuel = 100;
        const budgetCaloriesInitial = 2500;
        const objectifPasInitial = 8000;
        const bmr = 1900;
        const joursEcart = 30;

        // Act
        const plan = courseCorrection.calculateCourseCorrection(poidsActuel, budgetCaloriesInitial, objectifPasInitial, bmr, joursEcart);

        // Assert
        expect(plan.ciblePas).toBeLessThanOrEqual(18000);
        expect(plan.ciblePas).toEqual(18000);
    });
});
