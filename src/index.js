const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./docs/swaggerSpec');
const controller = require('./controllers/pulsePathController');

const app = express();
const PORT = 3000;

// Middlewares obligatoires pour le traitement des requêtes JSON et la gestion CORS
app.use(express.json());
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    next();
});

// Branchement des routes de notre contrôleur
app.get('/api/pulsepath/history', controller.getHistory);
app.post('/api/pulsepath/log', controller.submitDailyLog);

// Activation systématique de l'interface de documentation Swagger
app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Lancement du serveur Web Express
app.listen(PORT, () => {
    console.log("=========================================================");
    console.log(`🌐   SERVEUR WEB EXPRESS DÉMARRÉ SUR LE PORT ${PORT}`);
    console.log(`🌐   URL SWAGGER : http://localhost:${PORT}/swagger`);
    console.log("=========================================================");
});
