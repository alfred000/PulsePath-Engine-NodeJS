const express = require('express');
require('dotenv').config(); // Charge les variables d'environnement du fichier .env
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./docs/swaggerSpec');
const controller = require('./controllers/pulsePathController');
const goalController = require('./controllers/goalController');
const profileController = require('./controllers/profileController');
const goalController = require('./controllers/goalController');

// Importations des nouvelles briques de sécurité (US-06)
const authController = require('./controllers/authController');
const { authenticateToken } = require('./middlewares/authMiddleware');

const app = express();
// Utilisation du PORT du fichier .env ou du port 3000 par défaut
const PORT = process.env.PORT || 3000; 

// Middlewares obligatoires pour le traitement des requêtes JSON et la gestion CORS
app.use(express.json());
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    next();
});

// 1. Nouvelles routes publiques d'authentification (US-06 / Must)
app.post('/api/auth/register', authController.register);
app.post('/api/auth/login', authController.login);

// 2. Branchement des routes du contrôleur métabolique existant
// La récupération de l'historique et la saisie du journal sont maintenant protégées par le JWT Guard
app.get('/api/pulsepath/history', authenticateToken, controller.getHistory);
app.post('/api/pulsepath/log', authenticateToken, controller.submitDailyLog);

// Déclaration de la route d'évaluation S.M.A.R.T sécurisée (US-03)
app.post('/api/goals/evaluate', authenticateToken, goalController.evaluateUserGoal);

// US-01 : Routes d'authentification publiques
app.post('/api/auth/register', authController.register);
app.post('/api/auth/login', authController.login);

// 🔥 US-02 : Route d'Onboarding du Profil Métabolique protégée par JWT
app.post('/api/profile', authenticateToken, profileController.upsertProfile);

// US-03 : Route d'Évaluation d'Objectifs S.M.A.R.T protégée par JWT
app.post('/api/goals/evaluate', authenticateToken, goalController.evaluateUserGoal);

// Activation systématique de l'interface de documentation Swagger
app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Lancement du serveur Web Express
app.listen(PORT, () => {
    console.log("=========================================================");
    console.log(`🌐   SERVEUR WEB EXPRESS DÉMARRÉ SUR LE PORT ${PORT}`);
    console.log(`🌐   URL SWAGGER : http://localhost:${PORT}/swagger`);
    console.log("=========================================================");
});
