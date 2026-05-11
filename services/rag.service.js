// services/rag.service.js

const KnowledgeBase = require('../models/KnowledgeBase');
const geminiService = require('../config/gemini.config');

class RAGService {
  /**
   * Recherche connaissances pertinentes
   */
  async searchRelevantKnowledge(query, context = {}) {
    try {
      // 1. Générer embedding de la question
      const queryEmbedding = await this.getEmbedding(query);

      // 2. Recherche sémantique + filtres contextuels
      const pipeline = [
        {
          $addFields: {
            // Calcul similarité cosinus
            similarity: {
              $let: {
                vars: {
                  dotProduct: {
                    $reduce: {
                      input: { $range: [0, { $size: '$embedding' }] },
                      initialValue: 0,
                      in: {
                        $add: [
                          '$$value',
                          {
                            $multiply: [
                              { $arrayElemAt: ['$embedding', '$$this'] },
                              { $arrayElemAt: [queryEmbedding, '$$this'] }
                            ]
                          }
                        ]
                      }
                    }
                  }
                },
                in: '$$dotProduct'
              }
            }
          }
        },
        // Filtres contextuels
        {
          $match: {
            $and: [
              context.crop ? { 'applicableConditions.crops': context.crop } : {},
              context.category ? { category: context.category } : {},
              { similarity: { $gte: 0.7 } } // Seuil de pertinence
            ]
          }
        },
        { $sort: { similarity: -1, reliability: -1 } },
        { $limit: 5 }
      ];

      const results = await KnowledgeBase.aggregate(pipeline);

      return results;
    } catch (error) {
      console.error('Erreur RAG:', error);
      return [];
    }
  }

  /**
   * Enrichir le prompt avec connaissances
   */
  async enrichPromptWithKnowledge(userQuery, diagnosticData) {
    // Recherche multi-critères
    const searches = [
      this.searchRelevantKnowledge(userQuery, { crop: diagnosticData.crop?.type }),
      this.searchRelevantKnowledge('symptômes maladie plante', { category: 'maladie', crop: diagnosticData.crop?.type }),
      this.searchRelevantKnowledge('irrigation optimale', { category: 'irrigation', crop: diagnosticData.crop?.type })
    ];

    const [generalKnowledge, diseaseKnowledge, irrigationKnowledge] = await Promise.all(searches);

    // Formater connaissances
    const knowledgeContext = `
═══════════════════════════════════════════════════════════
📚 BASE DE CONNAISSANCES PERTINENTES
═══════════════════════════════════════════════════════════

${this.formatKnowledge(generalKnowledge, 'GÉNÉRAL')}

${this.formatKnowledge(diseaseKnowledge, 'MALADIES & RAVAGEURS')}

${this.formatKnowledge(irrigationKnowledge, 'IRRIGATION')}

IMPORTANT: Utilise ces connaissances EXPERTES pour ton diagnostic.
Base tes recommandations sur ces données scientifiques.
`;

    return knowledgeContext;
  }

  formatKnowledge(knowledgeArray, title) {
    if (!knowledgeArray || knowledgeArray.length === 0) {
      return `${title}: Aucune donnée spécifique`;
    }

    return `
${title}:
${knowledgeArray.map((k, i) => `
${i + 1}. ${k.title} (Fiabilité: ${k.reliability}/10)
${k.content}

Symptômes: ${k.symptoms?.join(', ') || 'N/A'}
Solutions: ${k.solutions?.join(', ') || 'N/A'}
`).join('\n---\n')}`;
  }

  async getEmbedding(text) {
    // Utiliser Gemini Embedding (comme dans seedKnowledge.js)
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-2:embedContent?key=${process.env.GIMINI_API_KEY}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'models/gemini-embedding-2',
        content: { parts: [{ text }] }
      })
    });

    const data = await response.json();
    return data.embedding.values;
  }
}

module.exports = new RAGService();