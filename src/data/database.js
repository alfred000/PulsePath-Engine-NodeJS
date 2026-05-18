const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, '../../pulsepath.db');

// Connexion et création du fichier de base de données
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Erreur lors de la création de la base de données SQLite:', err.message);
    }
});

// Initialisation de la table correspondante au modèle DailyLog
db.serialize(() => {
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
});

// Utilitaire pour encapsuler les requêtes SQL dans des Promises (Async/Await ready)
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
