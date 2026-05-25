const jwt = require('jsonwebtoken');

// Récupération de la clé secrète depuis les variables d'environnement
const JWT_SECRET = process.env.JWT_SECRET || "SUPER_SECRET_KEY_MIN_32_CHARS_LONG_PULSEPATH_2026";

/**
 * Middleware Guard pour sécuriser les routes privées (US-06, US-07, US-08)
 */
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    // Le header est généralement sous la forme "Bearer TOKEN_STRING"
    const token = authHeader && authHeader.split(' ')[1];

    // CA-3 : Si le jeton est absent, accès refusé instantanément
    if (!token) {
        return res.status(401).json({ message: "Access token missing or unauthorized." });
    }

    // Vérification mathématique de la validité et de l'expiration du jeton
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        // CA-3 : Si le jeton a été modifié ou est expiré
        if (err) {
            return res.status(403).json({ message: "Invalid or expired session token." });
        }

        // Injection du contexte utilisateur isolé dans l'objet de requête (req)
        req.userId = decoded.userId;
        
        // Passage au contrôleur ou au middleware suivant
        next();
    });
}

module.exports = { authenticateToken };
