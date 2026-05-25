const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../../pulsepath.db');

// Connexion et création du fichier de base de données SQLite
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Erreur lors de la création de la base de données SQLite:', err.message);
    }
});

// Initialisation synchrone de l'ensemble des tables (Parité technique avec .NET)
db.serialize(() => {
    // 1. Votre table existante reste inchangée
    db.run(`
        CREATE TABLE IF NOT EXISTS daily_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT NOT NULL,
            weight REAL NOT NULL,
            calories_in INTEGER NOT NULL,
            steps INTEGER NOT NULL,
            sleep_hours REAL NOT NULL,
            proteins_in INTEGER NOT NULL,
            fasting_validated INTEGER NOT NULL,
            workouts_done INTEGER NOT NULL
        )
    `);

    // 2. Nouvelle table Users pour l'authentification sécurisée (US-01 / RM-AUTH-01)
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            email TEXT UNIQUE NOT EXISTS,
            password_hash TEXT NOT NULL,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // 3. Nouvelle table UserProfiles avec barrières de sécurité physiologiques (US-02 / CA-02.1)
    db.run(`
        CREATE TABLE IF NOT EXISTS user_profiles (
            user_id TEXT PRIMARY KEY,
            age INTEGER CHECK(age >= 15 AND age <= 90),
            is_male INTEGER CHECK(is_male IN (0, 1)),
            height_cm REAL CHECK(height_cm >= 100 AND height_cm <= 250),
            current_weight_kg REAL CHECK(current_weight_kg >= 40 AND current_weight_kg <= 250),
            activity_factor REAL CHECK(activity_factor >= 1.2 AND activity_factor <= 2.5),
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
        )
    `);
});

// Utilitaires pour encapsuler les requêtes SQL dans des Promises (Async/Await)
const query = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
};

const run = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) reject(err);
            else resolve({ id: this.lastID, changes: this.changes });
        });
    });
};

module.exports = { query, run };
