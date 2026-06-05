const { evaluateGoal } = require('../logic/goalEngine');

describe('🎯 TDD Suite: Node.js 1% Metabolic Boundary Guardrail (RM-GOAL-01)', () => {

    it('should approve a safe and sustainable weight loss target', () => {
        // Arrange : Utilisateur de 80 kg (Plafond de sécurité = 0.8 kg/semaine)
        const mockProfile = { current_weight_kg: 80.0 };
        // Demande : Perdre 4 kg en 10 semaines -> 0.4 kg/semaine (Sécurisé)
        const safeRequest = { objective: 'perte', targetWeightKg: 76.0, durationWeeks: 10 };

        // Act
        const analysis = evaluateGoal(mockProfile, safeRequest);

        // Assert
        expect(analysis.status).toBe('Approved');
        expect(analysis.safeWeeklyRateKg).toBe(0.4);
        expect(analysis.caloricDeficitTarget).toBe(440); // (0.4 * 7700) / 7
    });

    it('should override and clamp a dangerous and aggressive target rate', () => {
        // Arrange : Utilisateur de 100 kg (Plafond de sécurité = 1.0 kg/semaine)
        const mockProfile = { current_weight_kg: 100.0 };
        // Demande : Perdre 10 kg en 5 semaines -> 2.0 kg/semaine (Agressif et dangereux)
        const aggressiveRequest = { objective: 'perte', targetWeightKg: 90.0, durationWeeks: 5 };

        // Act
        const analysis = evaluateGoal(mockProfile, aggressiveRequest);

        // Assert
        expect(analysis.status).toBe('Overridden');
        expect(analysis.safeWeeklyRateKg).toBe(1.0); // Bridé au seuil maximal de 1%
        expect(analysis.caloricDeficitTarget).toBe(1100); // (1.0 * 7700) / 7
        expect(analysis.warningMessage).toContain('exceeds the 1% metabolic safety ceiling');
    });
});
