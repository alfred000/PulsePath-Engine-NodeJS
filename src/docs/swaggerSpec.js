const swaggerDocument = {
    openapi: "3.0.0",
    info: {
        title: "PulsePath Engine API V2 (Node.js)",
        version: "2.0.0",
        description: "Documentation de l'API REST PulsePath implémentée avec Express.js"
    },
    servers: [
        {
            url: "http://localhost:3000",
            description: "Serveur local Node.js"
        }
    ],
    paths: {
        "/api/pulsepath/history": {
            get: {
                summary: "Récupérer l'historique des logs quotidiens",
                responses: {
                    200: { description: "Liste des logs récupérée avec succès" }
                }
            }
        },
        "/api/pulsepath/log": {
            post: {
                summary: "Soumettre une nouvelle journée et obtenir le diagnostic prescriptif",
                requestBody: {
                    required: true,
                    content: {
                        "application/json": {
                            schema: {
                                type: "object",
                                properties: {
                                    weight: { type: "number", example: 84.5 },
                                    caloriesIn: { type: "integer", example: 1600 },
                                    steps: { type: "integer", example: 10000 },
                                    sleepHours: { type: "number", example: 7.5 },
                                    proteinsIn: { type: "integer", example: 140 },
                                    fastingValidated: { type: "boolean", example: true },
                                    workoutsDone: { type: "integer", example: 1 }
                                }
                            }
                        }
                    }
                },
                responses: {
                    200: { description: "Dashboard et plan de correction générés" }
                }
            }
        }
    }
};

module.exports = swaggerDocument;
