const { upsertProfile } = require('../controllers/profileController');

describe('🧬 TDD Suite: Node.js Profile Metabolic Constraints (US-02)', () => {
    let mockReq, mockRes;

    beforeEach(() => {
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
    });

    it('should reject profiles with age outside of physiological limits (CA-02.1)', async () => {
        // Arrange : Demande invalide (Âge = 12 ans, hors limites [15-90])
        mockReq = {
            userId: 'user-uuid-999',
            body: { age: 12, isMale: true, heightCm: 175, currentWeightKg: 70, activityFactor: 1.5 }
        };

        // Act
        await upsertProfile(mockReq, mockRes);

        // Assert : Rejet attendu avec un code d'état HTTP 400
        expect(mockRes.status).toHaveBeenCalledWith(400);
        expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
            message: expect.stringContaining("boundaries violation")
        }));
    });
});
