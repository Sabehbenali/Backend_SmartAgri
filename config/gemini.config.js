// config/gemini.config.js
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

// Initialisation du client Gemini avec la clé API
const genAI = new GoogleGenerativeAI(process.env.GIMINI_API_KEY);

/**
 * Service pour interagir avec l'API Gemini
 */
class GeminiService {
  constructor() {
    // Modèle recommandé pour l'analyse agricole
    this.model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    // Modèle pour l'analyse d'images
    this.visionModel = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }

  /**
   * Génère une analyse basée sur des données agricoles
   * @param {string} prompt - Le prompt pour l'analyse
   * @returns {Promise<string>} - La réponse de Gemini
   */
  async generateAnalysis(prompt) {
    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      return text;
    } catch (error) {
      console.error('Erreur lors de l\'appel à l\'API Gemini:', error);
      throw new Error('Impossible de générer l\'analyse avec Gemini');
    }
  }

  /**
   * Analyse une image avec Gemini Vision
   * @param {string} prompt - Le prompt pour l'analyse
   * @param {string} base64Image - Image en base64
   * @param {string} mimeType - Type MIME de l'image
   * @returns {Promise<string>} - La réponse de Gemini
   */
  async analyzeImageWithPrompt(prompt, base64Image, mimeType) {
    try {
      const result = await this.visionModel.generateContent([
        prompt,
        {
          inlineData: {
            mimeType: mimeType,
            data: base64Image
          }
        }
      ]);
      
      const response = await result.response;
      const text = response.text();
      return text;
    } catch (error) {
      console.error('Erreur lors de l\'analyse d\'image avec Gemini:', error);
      throw new Error('Impossible d\'analyser l\'image avec Gemini');
    }
  }

  /**
   * Analyse des données de capteurs agricoles
   * @param {Object} sensorData - Données des capteurs
   * @returns {Promise<Object>} - Analyse et recommandations
   */
  async analyzeSensorData(sensorData) {
    try {
      const prompt = `
        En tant qu'expert en agriculture intelligente, analyse les données suivantes :
        
        Température: ${sensorData.temperature}°C
        Humidité du sol: ${sensorData.soilMoisture}%
        Humidité de l'air: ${sensorData.airHumidity}%
        Luminosité: ${sensorData.light} lux
        pH du sol: ${sensorData.ph}
        
        Fournis une analyse détaillée et des recommandations pour optimiser la production agricole.
        Format de réponse: JSON avec les clés suivantes:
        - analysis: analyse détaillée
        - recommendations: liste de recommandations
        - alerts: alertes éventuelles
        - irrigation: conseils d'irrigation
      `;

      const analysis = await this.generateAnalysis(prompt);
      
      // Tentative de parser le JSON si Gemini renvoie du JSON
      try {
        return JSON.parse(analysis);
      } catch {
        // Si ce n'est pas du JSON, retourner le texte brut
        return { analysis, recommendations: [], alerts: [], irrigation: '' };
      }
    } catch (error) {
      console.error('Erreur lors de l\'analyse des données:', error);
      throw error;
    }
  }

  /**
   * Génère des prédictions météo et recommandations
   * @param {Object} weatherData - Données météo
   * @returns {Promise<string>} - Prédictions et conseils
   */
  async predictAndRecommend(weatherData) {
    try {
      const prompt = `
        Basé sur les données météo suivantes pour une exploitation agricole:
        ${JSON.stringify(weatherData, null, 2)}
        
        Fournis des recommandations pour les 7 prochains jours concernant:
        - Irrigation
        - Protection des cultures
        - Moment optimal pour les activités agricoles
      `;

      return await this.generateAnalysis(prompt);
    } catch (error) {
      console.error('Erreur lors de la prédiction:', error);
      throw error;
    }
  }

  /**
   * Détection et diagnostic de maladies des plantes
   * @param {string} symptoms - Description des symptômes
   * @param {string} cropType - Type de culture
   * @returns {Promise<string>} - Diagnostic et traitement
   */
  async diagnosePlantDisease(symptoms, cropType) {
    try {
      const prompt = `
        En tant qu'agronome expert, diagnostique les problèmes suivants:
        
        Type de culture: ${cropType}
        Symptômes observés: ${symptoms}
        
        Fournis:
        1. Diagnostic probable
        2. Causes possibles
        3. Traitement recommandé
        4. Mesures préventives
      `;

      return await this.generateAnalysis(prompt);
    } catch (error) {
      console.error('Erreur lors du diagnostic:', error);
      throw error;
    }
  }

  /**
   * Vérification de l'état du service
   * @returns {Promise<boolean>}
   */
  async healthCheck() {
    try {
      const result = await this.model.generateContent('Test');
      return true;
    } catch (error) {
      return false;
    }
  }
}

// Export singleton
module.exports = new GeminiService();
