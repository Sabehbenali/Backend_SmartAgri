// controllers/analyse.controller.js
// Contrôleur pour les analyses avec l'API Gemini
// Gestion complète des erreurs et validation des données
 
const geminiService = require('../config/gemini.config');
 
/**
 * Contrôleur pour les analyses agricoles avec Gemini AI
 */
class AnalyseController {
  /**
   * Analyse des données de capteurs en temps réel
   * Route: POST /api/analyse/sensors
   * 
   * Body attendu:
   * {
   *   "temperature": number (en °C),
   *   "soilMoisture": number (en %),
   *   "airHumidity": number (en %),
   *   "light": number (en lux, optionnel),
   *   "ph": number (optionnel)
   * }
   */
  async analyzeSensors(req, res) {
    try {
      const { temperature, soilMoisture, airHumidity, light, ph } = req.body;
 
      // Validation stricte des données obligatoires
      if (temperature === undefined || soilMoisture === undefined || airHumidity === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Données de capteurs incomplètes',
          required: ['temperature', 'soilMoisture', 'airHumidity'],
          received: { temperature, soilMoisture, airHumidity }
        });
      }
 
      // Validation des types et plages
      if (typeof temperature !== 'number' || temperature < -50 || temperature > 60) {
        return res.status(400).json({
          success: false,
          message: 'Température invalide (doit être entre -50 et 60°C)'
        });
      }
 
      if (typeof soilMoisture !== 'number' || soilMoisture < 0 || soilMoisture > 100) {
        return res.status(400).json({
          success: false,
          message: 'Humidité du sol invalide (doit être entre 0 et 100%)'
        });
      }
 
      if (typeof airHumidity !== 'number' || airHumidity < 0 || airHumidity > 100) {
        return res.status(400).json({
          success: false,
          message: 'Humidité de l\'air invalide (doit être entre 0 et 100%)'
        });
      }
 
      console.log('📊 Analyse de capteurs demandée:', { temperature, soilMoisture, airHumidity });
 
      // Appel au service Gemini
      const analysis = await geminiService.analyzeSensorData({
        temperature,
        soilMoisture,
        airHumidity,
        light: light || 0,
        ph: ph || 7
      });
 
      res.status(200).json({
        success: true,
        data: analysis,
        metadata: {
          timestamp: new Date(),
          inputData: { temperature, soilMoisture, airHumidity, light, ph }
        }
      });
 
    } catch (error) {
      console.error('❌ Erreur dans analyzeSensors:', error.message);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de l\'analyse des données de capteurs',
        error: error.message,
        timestamp: new Date()
      });
    }
  }
 
  /**
   * Génération de recommandations basées sur la météo
   * Route: POST /api/analyse/weather
   * 
   * Body attendu: Objet avec données météo
   */
  async analyzeWeather(req, res) {
    try {
      const weatherData = req.body;
 
      if (!weatherData || Object.keys(weatherData).length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Données météo manquantes',
          example: {
            forecast: 'ensoleillé',
            temperature: 25,
            humidity: 60,
            precipitation: 0
          }
        });
      }
 
      console.log('🌤️  Analyse météo demandée');
 
      const recommendations = await geminiService.predictAndRecommend(weatherData);
 
      res.status(200).json({
        success: true,
        data: {
          recommendations,
          weatherInput: weatherData
        },
        metadata: {
          generatedAt: new Date()
        }
      });
 
    } catch (error) {
      console.error('❌ Erreur dans analyzeWeather:', error.message);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de l\'analyse météo',
        error: error.message,
        timestamp: new Date()
      });
    }
  }
 
  /**
   * Diagnostic de maladies des plantes
   * Route: POST /api/analyse/disease
   * 
   * Body attendu:
   * {
   *   "symptoms": string,
   *   "cropType": string
   * }
   */
  async diagnosePlant(req, res) {
    try {
      const { symptoms, cropType } = req.body;
 
      if (!symptoms || !cropType) {
        return res.status(400).json({
          success: false,
          message: 'Symptômes et type de culture requis',
          required: {
            symptoms: 'Description des symptômes (ex: "feuilles jaunies avec taches brunes")',
            cropType: 'Type de culture (ex: "tomate", "blé", "maïs")'
          }
        });
      }
 
      if (typeof symptoms !== 'string' || symptoms.trim().length < 10) {
        return res.status(400).json({
          success: false,
          message: 'Description des symptômes trop courte (minimum 10 caractères)'
        });
      }
 
      console.log('🔬 Diagnostic de maladie demandé:', { cropType, symptoms: symptoms.substring(0, 50) });
 
      const diagnosis = await geminiService.diagnosePlantDisease(symptoms, cropType);
 
      res.status(200).json({
        success: true,
        data: {
          diagnosis,
          cropType,
          symptoms
        },
        metadata: {
          diagnosedAt: new Date()
        }
      });
 
    } catch (error) {
      console.error('❌ Erreur dans diagnosePlant:', error.message);
      res.status(500).json({
        success: false,
        message: 'Erreur lors du diagnostic de maladie',
        error: error.message,
        timestamp: new Date()
      });
    }
  }
 
  /**
   * Analyse personnalisée avec prompt libre
   * Route: POST /api/analyse/custom
   * 
   * Body attendu:
   * {
   *   "prompt": string
   * }
   */
  async customAnalysis(req, res) {
    try {
      const { prompt } = req.body;
 
      if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Prompt requis pour l\'analyse personnalisée',
          example: {
            prompt: 'Quels sont les meilleurs moments pour irriguer en été?'
          }
        });
      }
 
      if (prompt.length > 2000) {
        return res.status(400).json({
          success: false,
          message: 'Prompt trop long (maximum 2000 caractères)'
        });
      }
 
      console.log('💬 Analyse personnalisée demandée:', prompt.substring(0, 80) + '...');
 
      const result = await geminiService.generateAnalysis(prompt);
 
      res.status(200).json({
        success: true,
        data: {
          result,
          prompt
        },
        metadata: {
          generatedAt: new Date(),
          promptLength: prompt.length
        }
      });
 
    } catch (error) {
      console.error('❌ Erreur dans customAnalysis:', error.message);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de l\'analyse personnalisée',
        error: error.message,
        timestamp: new Date()
      });
    }
  }
 
  /**
   * Vérification de l'état du service Gemini
   * Route: GET /api/analyse/health
   */
  async healthCheck(req, res) {
    try {
      const isHealthy = await geminiService.healthCheck();
 
      res.status(isHealthy ? 200 : 503).json({
        success: isHealthy,
        service: 'Gemini API',
        status: isHealthy ? 'operational' : 'unavailable',
        timestamp: new Date()
      });
 
    } catch (error) {
      res.status(503).json({
        success: false,
        service: 'Gemini API',
        status: 'error',
        error: error.message,
        timestamp: new Date()
      });
    }
  }
}
 
module.exports = new AnalyseController();