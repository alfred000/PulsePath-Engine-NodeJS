const crypto = require('crypto');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { run, query } = require('../config/database');

// Récupération de la clé secrète depuis les variables d'environnement (.env)
const JWT_SECRET = process.env.JWT_SECRET || "SUPER_SECRET_KEY_MIN_32_CHARS_LONG_PULSEPATH_2026";

/**
 * US-01 : Inscription d'un nouvel utilisateur
 * Route : POST /api/auth/register
 */
async function register(req, res) {
    const { email, password } = req.body;

    // Validation basique des champs obligatoires
    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required." });
    }

    try {
        // Vérification de l'unicité de l'email
        const existingUser = await query(`SELECT id FROM users WHERE email = ?`, [email]);
        if (existingUser.length > 0) {
            return res.status(400).json({ message: "Email already exists." });
        }

        // RM-AUTH-01 : Hachage du mot de passe avec un sel (coût de 12) via BCrypt
        const saltRounds = 12;
        const passwordHash = await bcrypt.hash(password, saltRounds);
        const userId = crypto.randomUUID();

        // Insertion du nouvel utilisateur dans SQLite
        await run(
            `INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)`,
            [userId, email, passwordHash]
        );

        return res.status(201).json({ message: "User registered successfully." });

    } catch (error) {
        console.error("Registration error:", error.message);
        return res.status(500).json({ message: "An error occurred during registration." });
    }
}

/**
 * US-01 : Connexion de l'utilisateur et délivrance du jeton JWT
 * Route : POST /api/auth/login
 */
async function login(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required." });
    }

    try {
        // Récupération de l'utilisateur par son email
        const rows = await query(`SELECT * FROM users WHERE email = ?`, [email]);
        const user = rows[0];

        // CA-01.3 : Validation des identifiants et vérification du hachage
        if (!user || !(await bcrypt.compare(password, user.password_hash))) {
            return res.status(401).json({ message: "Invalid email or password." });
        }

        // CA-01.2 : Génération du jeton JWT valide pour une durée de 7 jours
        const token = jwt.sign(
            { userId: user.id }, 
            JWT_SECRET, 
            { expiresIn: '7d' }
        );

        return res.status(200).json({ token });

    } catch (error) {
        console.error("Login error:", error.message);
        return res.status(500).json({ message: "An error occurred during authentication." });
    }
}

module.exports = { register, login };
