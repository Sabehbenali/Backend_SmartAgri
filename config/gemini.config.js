// config/gemini.config.js
// Service Gemini adapté de la version Python fonctionnelle
// Compatible Node.js v20+

require('dotenv').config();

/**
 * Service pour interagir avec l'API Gemini
 * Utilise l'API REST directe (comme dans le code Python)
 */
class GeminiService {
  constructor() {
    this.apiKey = process.env.GIMINI_API_KEY;
    this.modelId = 'gemini-2.5-flash';
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta';

    if (!this.apiKey) {
      console.error('❌ ERREUR: GIMINI_API_KEY manquante dans .env');
      throw new Error('Configuration Gemini incomplète');
    }

    console.log('✅ Service Gemini initialisé avec succès');
    console.log(`📌 Modèle: ${this.modelId}`);
  }

  /**
   * Génère une analyse avec Gemini (méthode REST directe)
   * @param {string} prompt - Le prompt pour l'analyse
   * @param {number} temperature - Température de génération (0-1)
   * @param {number} maxTokens - Nombre maximum de tokens
   * @returns {Promise<string>} - La réponse de Gemini
   */
  async generateAnalysis(prompt, temperature = 0.7, maxTokens = 1000) {
    try {
      const url = `${this.baseUrl}/models/${this.modelId}:generateContent?key=${this.apiKey}`;

      const systemInstruction = `You are a professional agricultural AI assistant with expertise in:
- Smart irrigation systems and water conservation
- Soil analysis and crop management
- Plant disease diagnosis
- Agricultural sensor data interpretation
- Weather-based farming recommendations

Provide helpful, accurate, and concise answers in French.`;

      const requestBody = {
        contents: [{
          parts: [{
            text: `${systemInstruction}\n\nUser question: ${prompt}`
          }]
        }],
        generationConfig: {
          temperature: temperature,
          maxOutputTokens: maxTokens,
          topP: 0.95,
          topK: 40
        }
      };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();

      if (!data.candidates || data.candidates.length === 0) {
        throw new Error('Aucune réponse générée par Gemini');
      }

      const text = data.candidates[0].content.parts[0].text;
      return text;

    } catch (error) {
      console.error('❌ Erreur Gemini:', error.message);

      if (error.message.includes('API key not valid')) {
        throw new Error('Clé API Gemini invalide');
      } else if (error.message.includes('quota')) {
        throw new Error('Quota API Gemini dépassé');
      } else if (error.message.includes('404')) {
        throw new Error('Modèle Gemini non trouvé');
      } else {
        throw new Error(`Erreur Gemini: ${error.message}`);
      }
    }
  }

  /**
   * Analyse des données de capteurs agricoles
   */
  async analyzeSensorData(sensorData) {
    try {
      const prompt = `Analyse ces données de capteurs agricoles:

Température: ${sensorData.temperature}°C
Humidité du sol: ${sensorData.soilMoisture}%
Humidité de l'air: ${sensorData.airHumidity}%
Luminosité: ${sensorData.light} lux
pH du sol: ${sensorData.ph}

Fournis une analyse au format JSON avec:
{
  "analysis": "analyse en 2-3 phrases",
  "recommendations": ["recommandation 1", "recommandation 2", "recommandation 3"],
  "alerts": ["alerte si critique"],
  "irrigation": "conseil irrigation",
  "score": nombre entre 0-100
}`;

      const response = await this.generateAnalysis(prompt);

      // Nettoyage et parsing JSON
      let cleaned = response.trim();
      cleaned = cleaned.replace(/```json\n?/g, '');
      cleaned = cleaned.replace(/```\n?/g, '');
      cleaned = cleaned.trim();

      try {
        return JSON.parse(cleaned);
      } catch {
        // Fallback si pas du JSON
        return {
          analysis: cleaned,
          recommendations: ['Analyse générée avec succès'],
          alerts: [],
          irrigation: 'Voir analyse',
          score: 75
        };
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * Prédictions météo et recommandations
   */
  async predictAndRecommend(weatherData) {
    try {
      const prompt = `Basé sur ces données météo:
${JSON.stringify(weatherData, null, 2)}

Fournis des recommandations agricoles pour les 7 prochains jours concernant:
- Irrigation
- Protection des cultures
- Activités agricoles optimales`;

      return await this.generateAnalysis(prompt);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Diagnostic de maladies des plantes
   */
  async diagnosePlantDisease(symptoms, cropType) {
    try {
      const prompt = `Diagnostique ce problème agricole:

Type de culture: ${cropType}
Symptômes: ${symptoms}

Fournis:
1. Diagnostic probable
2. Causes possibles
3. Traitement recommandé
4. Mesures préventives`;

      return await this.generateAnalysis(prompt);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Healthcheck du service
   */
  async healthCheck() {
    try {
      const response = await this.generateAnalysis('Réponds simplement "OK"');
      return response.toLowerCase().includes('ok');
    } catch (error) {
      return false;
    }
  }
}

// Export singleton
module.exports = new GeminiService();