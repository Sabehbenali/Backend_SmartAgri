// controllers/aiDiagnostic.controller.js

const dataAggregator = require('../services/dataAggregator.service');
const geminiService = require('../config/gemini.config');
const ragService = require('../services/rag.service');
const Diagnosis = require('../models/Diagnosis');

class AIDiagnosticController {
  /**
   * Diagnostic complet intelligent
   */
  async fullDiagnosis(req, res) {
    try {
      const { farmId } = req.params;
      const userId = req.user.id;

      // 1. COLLECTER toutes les données
      console.log('📊 Collecte des données...');
      const diagnosticData = await dataAggregator.collectDiagnosticData(farmId, userId);

      // 2. CONSTRUIRE le prompt structuré pour Gemini (avec RAG)
      console.log('🧠 Enrichissement avec base de connaissances...');
      const diagnosticPrompt = await this.buildDiagnosticPrompt(diagnosticData);

      // 3. APPELER Gemini pour analyse
      console.log('🤖 Analyse IA en cours...');
      const aiAnalysis = await geminiService.generateAnalysis(
        diagnosticPrompt,
        0.3, // Température basse pour analyse précise
        2500 // Plus de tokens pour analyse complète
      );

      // 4. PARSER la réponse structurée
      const parsedDiagnosis = this.parseDiagnosisResponse(aiAnalysis);

      // 5. CALCULER scores
      const scores = this.calculateScores(diagnosticData, parsedDiagnosis);

      // 6. SAUVEGARDER diagnostic
      const savedDiagnosis = await Diagnosis.create({
        farmId,
        userId,
        timestamp: new Date(),
        data: diagnosticData,
        aiAnalysis: parsedDiagnosis,
        scores: scores,
        recommendations: parsedDiagnosis.recommendations,
        riskLevel: scores.overallRisk
      });

      console.log('✅ Diagnostic complété avec succès');

      res.json({
        success: true,
        diagnosis: {
          id: savedDiagnosis._id,
          timestamp: savedDiagnosis.timestamp,
          scores: scores,
          analysis: parsedDiagnosis,
          actionPlan: this.generateActionPlan(parsedDiagnosis, scores),
          dataQuality: scores.dataQuality
        }
      });

    } catch (error) {
      console.error('❌ Erreur diagnostic:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }

  /**
   * Construit le prompt structuré pour Gemini (AVEC BASE DE CONNAISSANCES)
   */
  async buildDiagnosticPrompt(data) {
    // ENRICHISSEMENT AVEC BASE DE CONNAISSANCES (RAG)
    let knowledgeContext = '';
    
    try {
      knowledgeContext = await ragService.enrichPromptWithKnowledge(
        `diagnostic agricole ${data.crop?.type || 'général'}`,
        data
      );
    } catch (error) {
      console.warn('⚠️  Base de connaissances non disponible:', error.message);
      knowledgeContext = '(Base de connaissances non chargée - utilise connaissances générales)';
    }

    return `${knowledgeContext}

═══════════════════════════════════════════════════════════
Tu es un EXPERT AGRONOME IA avec 20 ans d'expérience.

Tu dois faire un DIAGNOSTIC COMPLET et STRUCTURÉ basé sur des DONNÉES RÉELLES (pas au hasard).
═══════════════════════════════════════════════════════════

═══════════════════════════════════════════════════════════
📊 DONNÉES ACTUELLES (TEMPS RÉEL)
═══════════════════════════════════════════════════════════
${JSON.stringify(data.current, null, 2)}

═══════════════════════════════════════════════════════════
📈 HISTORIQUE 7 JOURS
═══════════════════════════════════════════════════════════
Lectures capteurs: ${data.historical?.sensorReadings?.length || 0} points de données
Tendances: ${JSON.stringify(data.historical?.trends || {}, null, 2)}

Interventions passées:
${data.historical?.interventions?.length > 0 
  ? data.historical.interventions.map(i => `- ${i.type}: ${i.description} (${new Date(i.date).toLocaleDateString()})`).join('\n')
  : 'Aucune intervention récente'}

Production moyenne (30 jours):
${JSON.stringify(data.historical?.production || {}, null, 2)}

═══════════════════════════════════════════════════════════
⚠️  ALERTES ACTIVES
═══════════════════════════════════════════════════════════
${data.alerts?.length > 0 
  ? data.alerts.map(a => `- [${a.severity}] ${a.type}: ${a.message}`).join('\n')
  : 'Aucune alerte active'}

═══════════════════════════════════════════════════════════
🌤️  MÉTÉO PRÉVISIONS (7 jours)
═══════════════════════════════════════════════════════════
${JSON.stringify(data.weather || {}, null, 2)}

═══════════════════════════════════════════════════════════
🌱 INFORMATIONS CULTURE
═══════════════════════════════════════════════════════════
${JSON.stringify(data.crop || {}, null, 2)}

═══════════════════════════════════════════════════════════
🎯 TON RÔLE
═══════════════════════════════════════════════════════════

Fournis un diagnostic COMPLET au format JSON suivant:

{
  "healthAssessment": {
    "overall": "excellent|good|fair|poor|critical",
    "score": 0-100,
    "factors": [
      {
        "name": "irrigation",
        "status": "optimal|warning|critical",
        "score": 0-100,
        "evidence": "preuve basée sur les données ci-dessus",
        "impact": "high|medium|low"
      }
    ]
  },
  
  "trendAnalysis": {
    "summary": "résumé des tendances observées dans les données",
    "improving": ["facteur1", "facteur2"],
    "degrading": ["facteur3"],
    "stable": ["facteur4"]
  },
  
  "riskAssessment": {
    "productionRisk": {
      "level": "low|medium|high|critical",
      "score": 0-10,
      "reasons": ["raison basée sur les données réelles fournies"],
      "estimatedImpact": "X% de perte de production estimée"
    },
    "immediateRisks": [
      {
        "type": "disease|pest|weather|irrigation|nutrient",
        "severity": "low|medium|high|critical",
        "description": "description précise du risque",
        "evidence": "preuve CONCRÈTE dans les données ci-dessus",
        "timeframe": "immediate|24h|48h|week"
      }
    ]
  },
  
  "recommendations": [
    {
      "priority": 1-10,
      "category": "irrigation|fertilization|treatment|monitoring|ventilation",
      "action": "description PRÉCISE de l'action à prendre",
      "reasoning": "pourquoi cette action (avec références aux DONNÉES)",
      "expectedOutcome": "résultat attendu quantifié si possible",
      "urgency": "immediate|today|this_week|routine",
      "autoControlCompatible": true|false,
      "autoControlParams": {
        "action": "activate_irrigation|adjust_temperature|send_alert",
        "parameters": {}
      }
    }
  ],
  
  "productionForecast": {
    "nextWeek": {
      "expectedYield": "estimation basée sur les tendances observées",
      "confidence": "low|medium|high",
      "factors": ["facteurs influençant basés sur les données"]
    },
    "optimization": {
      "currentEfficiency": "X%",
      "potentialGain": "X% d'amélioration possible",
      "keyActions": ["actions concrètes pour optimiser"]
    }
  },
  
  "reasoning": "Explication DÉTAILLÉE de ton raisonnement avec CITATIONS des données utilisées"
}

═══════════════════════════════════════════════════════════
RÈGLES CRITIQUES - À RESPECTER ABSOLUMENT:
═══════════════════════════════════════════════════════════
1. TOUTES tes conclusions DOIVENT être basées sur les données fournies ci-dessus
2. CITE les données spécifiques qui supportent tes conclusions (ex: "température moyenne 28°C")
3. Si données insuffisantes pour une conclusion, DIS-LE et DEMANDE plus d'informations
4. PRIORISE la PRÉSERVATION de la production - c'est l'objectif #1
5. Sois PRÉCIS et ACTIONNABLE - pas de généralités
6. ANTICIPE les problèmes futurs basés sur les tendances observées
7. Utilise la BASE DE CONNAISSANCES fournie au début pour expertise scientifique
8. Ne génère JAMAIS de données fictives - seulement analyse les données réelles fournies

RÉPONDS UNIQUEMENT avec le JSON (pas de texte avant ou après).`;
  }

  /**
   * Parse et valide la réponse de Gemini
   */
  parseDiagnosisResponse(aiResponse) {
    try {
      // Nettoyer la réponse
      let cleaned = aiResponse.trim();
      
      // Enlever les balises markdown JSON
      cleaned = cleaned.replace(/```json\n?/g, '');
      cleaned = cleaned.replace(/```\n?/g, '');
      cleaned = cleaned.trim();

      // Tenter de parser
      const parsed = JSON.parse(cleaned);

      // Validation basique de la structure
      if (!parsed.healthAssessment || !parsed.recommendations) {
        throw new Error('Format de diagnostic invalide - champs obligatoires manquants');
      }

      // Validation des types
      if (typeof parsed.healthAssessment.score !== 'number') {
        parsed.healthAssessment.score = 0;
      }

      // S'assurer que recommendations est un tableau
      if (!Array.isArray(parsed.recommendations)) {
        parsed.recommendations = [];
      }

      return parsed;

    } catch (error) {
      console.error('❌ Erreur parsing diagnostic:', error.message);
      console.log('Réponse brute:', aiResponse.substring(0, 500));
      
      // Fallback structure complète
      return {
        healthAssessment: {
          overall: 'unknown',
          score: 0,
          factors: []
        },
        trendAnalysis: {
          summary: 'Données insuffisantes pour analyse',
          improving: [],
          degrading: [],
          stable: []
        },
        riskAssessment: {
          productionRisk: {
            level: 'unknown',
            score: 0,
            reasons: ['Erreur de parsing de la réponse IA'],
            estimatedImpact: 'N/A'
          },
          immediateRisks: []
        },
        recommendations: [
          {
            priority: 1,
            category: 'monitoring',
            action: 'Vérifier la qualité des données des capteurs',
            reasoning: 'Erreur lors de l\'analyse IA',
            expectedOutcome: 'Amélioration de la qualité des diagnostics',
            urgency: 'today',
            autoControlCompatible: false
          }
        ],
        productionForecast: {
          nextWeek: {
            expectedYield: 'N/A',
            confidence: 'low',
            factors: []
          },
          optimization: {
            currentEfficiency: 'N/A',
            potentialGain: 'N/A',
            keyActions: []
          }
        },
        reasoning: 'Erreur de parsing - réponse IA non valide',
        error: error.message,
        rawResponse: aiResponse
      };
    }
  }

  /**
   * Calcule les scores globaux
   */
  calculateScores(data, diagnosis) {
    return {
      healthScore: diagnosis.healthAssessment?.score || 0,
      productionRisk: diagnosis.riskAssessment?.productionRisk?.score || 0,
      overallRisk: this.calculateOverallRisk(diagnosis),
      efficiency: diagnosis.productionForecast?.optimization?.currentEfficiency || 'N/A',
      dataQuality: this.assessDataQuality(data)
    };
  }

  /**
   * Calcule le risque global
   */
  calculateOverallRisk(diagnosis) {
    const risks = diagnosis.riskAssessment?.immediateRisks || [];
    
    if (risks.some(r => r.severity === 'critical')) return 'critical';
    if (risks.some(r => r.severity === 'high')) return 'high';
    if (risks.some(r => r.severity === 'medium')) return 'medium';
    return 'low';
  }

  /**
   * Évalue la qualité des données collectées
   */
  assessDataQuality(data) {
    const points = data.analysis?.dataPoints || 0;
    
    if (points >= 500) return 'excellent';
    if (points >= 200) return 'good';
    if (points >= 50) return 'fair';
    if (points > 0) return 'poor';
    return 'insufficient';
  }

  /**
   * Génère un plan d'action structuré et priorisé
   */
  generateActionPlan(diagnosis, scores) {
    const recommendations = diagnosis.recommendations || [];
    
    // Trier par priorité et urgence
    const sorted = [...recommendations].sort((a, b) => {
      // D'abord par urgence
      if (a.urgency !== b.urgency) {
        const urgencyOrder = { 
          immediate: 0, 
          today: 1, 
          this_week: 2, 
          routine: 3 
        };
        return (urgencyOrder[a.urgency] || 999) - (urgencyOrder[b.urgency] || 999);
      }
      // Puis par priorité
      return (b.priority || 0) - (a.priority || 0);
    });

    return {
      immediate: sorted.filter(r => r.urgency === 'immediate'),
      today: sorted.filter(r => r.urgency === 'today'),
      thisWeek: sorted.filter(r => r.urgency === 'this_week'),
      routine: sorted.filter(r => r.urgency === 'routine'),
      autoControlActions: sorted.filter(r => r.autoControlCompatible === true),
      totalActions: sorted.length,
      criticalCount: sorted.filter(r => r.urgency === 'immediate').length
    };
  }

  /**
   * Récupérer l'historique des diagnostics
   */
  async getDiagnosticHistory(req, res) {
    try {
      const { farmId } = req.params;
      const { limit = 10, skip = 0 } = req.query;

      const diagnostics = await Diagnosis.find({ farmId })
        .sort({ timestamp: -1 })
        .limit(parseInt(limit))
        .skip(parseInt(skip))
        .select('-data -aiAnalysis') // Exclure les gros champs
        .lean();

      const total = await Diagnosis.countDocuments({ farmId });

      res.json({
        success: true,
        diagnostics,
        pagination: {
          total,
          limit: parseInt(limit),
          skip: parseInt(skip),
          hasMore: total > (parseInt(skip) + parseInt(limit))
        }
      });

    } catch (error) {
      console.error('❌ Erreur récupération historique:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Récupérer un diagnostic spécifique
   */
  async getDiagnosticById(req, res) {
    try {
      const { diagnosisId } = req.params;

      const diagnosis = await Diagnosis.findById(diagnosisId).lean();

      if (!diagnosis) {
        return res.status(404).json({
          success: false,
          error: 'Diagnostic non trouvé'
        });
      }

      res.json({
        success: true,
        diagnosis
      });

    } catch (error) {
      console.error('❌ Erreur récupération diagnostic:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = new AIDiagnosticController();