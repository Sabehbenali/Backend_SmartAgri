// routes/analyse.routes.js
// Routes pour les analyses avec Gemini AI

const express = require('express');
const router = express.Router();
const analyseController = require('../controllers/analyse.controlleur');

/**
 * Routes pour les analyses agricoles avec Gemini
 * Préfixe: /api/analyse
 */

/**
 * @route   POST /api/analyse/sensors
 * @desc    Analyse des données de capteurs agricoles
 * @access  Public (ajoutez auth middleware si nécessaire)
 * @body    { temperature, soilMoisture, airHumidity, light?, ph? }
 */
router.post('/sensors', analyseController.analyzeSensors);

/**
 * @route   POST /api/analyse/weather
 * @desc    Recommandations basées sur les prévisions météo
 * @access  Public
 * @body    { forecast, temperature, humidity, etc. }
 */
router.post('/weather', analyseController.analyzeWeather);

/**
 * @route   POST /api/analyse/disease
 * @desc    Diagnostic de maladies des plantes
 * @access  Public
 * @body    { cropType, symptoms }
 */
router.post('/disease', analyseController.diagnosePlant);

/**
 * @route   POST /api/analyse/custom
 * @desc    Analyse personnalisée avec prompt libre
 * @access  Public
 * @body    { prompt }
 */
router.post('/custom', analyseController.customAnalysis);

/**
 * @route   GET /api/analyse/health
 * @desc    Vérification de l'état du service Gemini
 * @access  Public
 */
router.get('/health', analyseController.healthCheck);

module.exports = router;