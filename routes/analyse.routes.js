// routes/analyse.routes.js
const express = require('express');
const router = express.Router();
const analyseController = require('../controllers/analyse.controller');
const { uploadMiddleware } = require('../controllers/analyse.controller');

/**
 * Routes pour les analyses avec Gemini AI
 */

// Analyse des données de capteurs
router.post('/sensors', analyseController.analyzeSensors);

// Analyse météo et recommandations
router.post('/weather', analyseController.analyzeWeather);

// Diagnostic de maladies des plantes
router.post('/disease', analyseController.diagnosePlant);

// Analyse personnalisée
router.post('/custom', analyseController.customAnalysis);

// 🌿 NOUVELLE ROUTE: Analyse de photo de plante
router.post('/plant-image', uploadMiddleware, analyseController.analyzePlantImage);

// Vérification de l'état du service
router.get('/health', analyseController.healthCheck);

module.exports = router;
