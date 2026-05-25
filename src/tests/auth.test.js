const request = require('supertest');
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// 🔥 Correction : Utilisation du nom d'export exact de votre middleware
const { authenticateToken } = require('../middlewares/authMiddleware');

const app = express();
app.use(express.json());

// 🔥 Correction : Passage de la bonne fonction à Express à la ligne 11
app.get('/api/protected-route', authenticateToken, (req, res) => {
    // Utilisation de req.userId injecté par le middleware
    res.status(200).json({ success: true, userId: req.userId });
});

describe('🔐 TDD Suite: JWT Authentication Guard & Isolation', () => {
    const JWT_SECRET = "SUPER_SECRET_KEY_MIN_32_CHARS_LONG_PULSEPATH_2026";
    process.env.JWT_SECRET = JWT_SECRET;

    it('should reject requests with missing Authorization header (CA-01.3)', async () => {
        const response = await request(app).get('/api/protected-route');
        
        expect(response.status).toBe(401);
        expect(response.body.message).toContain("missing");
    });

    it('should reject invalid or expired tokens (CA-01.3)', async () => {
        const response = await request(app)
            .get('/api/protected-route')
            .set('Authorization', 'Bearer invalid_token_string');

        expect(response.status).toBe(403);
        expect(response.body.message).toContain("Invalid");
    });

    it('should grant access and inject context for valid JWT tokens (CA-01.2)', async () => {
        const mockUserId = "user-uuid-12345";
        // Correction : Utilisation du champ userId pour correspondre au payload du contrôleur
        const token = jwt.sign({ userId: mockUserId }, JWT_SECRET, { expiresIn: '1h' });

        const response = await request(app)
            .get('/api/protected-route')
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.userId).toBe(mockUserId);
    });
});
