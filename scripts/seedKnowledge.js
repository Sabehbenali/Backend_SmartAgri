// scripts/seedKnowledge.js

const KnowledgeBase = require('../models/KnowledgeBase');
const geminiService = require('../config/gemini.config');

class KnowledgeSeedService {
  async seedInitialKnowledge() {
    console.log('🌱 Remplissage de la base de connaissances...');

    const knowledgeData = [
      // 1. MALADIES DES PLANTES
      {
        title: "Mildiou de la tomate",
        category: "maladie",
        subcategory: "mildiou",
        content: `Le mildiou est une maladie fongique causée par Phytophthora infestans. 
        Elle se développe dans des conditions humides (>80% humidité) et températures fraîches (15-25°C).
        
        Cycle de développement:
        - Infection: 1-2 jours en conditions favorables
        - Symptômes visibles: 3-5 jours
        - Sporulation: 5-7 jours
        - Peut détruire 100% de la récolte en 2 semaines sans traitement`,
        
        symptoms: [
          "Taches brunes irrégulières sur les feuilles",
          "Bord jaune autour des taches",
          "Duvet blanc sous les feuilles par temps humide",
          "Fruits avec taches brunes dures",
          "Dessèchement rapide des feuilles"
        ],
        
        solutions: [
          "Traitement fongicide cuivre (bouillie bordelaise) dès premiers symptômes",
          "Éliminer immédiatement les parties atteintes",
          "Améliorer ventilation entre plants",
          "Réduire irrigation foliaire",
          "Traitement préventif avant pluies annoncées"
        ],
        
        preventions: [
          "Espacement adéquat entre plants (50-60cm)",
          "Irrigation goutte-à-goutte (éviter feuillage mouillé)",
          "Rotation des cultures (3-4 ans)",
          "Variétés résistantes",
          "Surveillance humidité >75% + température 18-22°C = alerte"
        ],
        
        applicableConditions: {
          crops: ['tomate', 'pomme de terre', 'aubergine'],
          climate: ['tempéré', 'méditerranéen'],
          season: ['printemps', 'automne'],
          growthStage: ['végétatif', 'floraison', 'fructification']
        },
        
        optimalRanges: {
          temperature: { min: 10, max: 30 },
          humidity: { min: 40, max: 80 }, // Au-dessus = risque
          soilMoisture: { min: 60, max: 80 }
        },
        
        tags: ['maladie', 'fongique', 'tomate', 'urgence', 'préventif'],
        sources: ['INRAE', 'Chambre Agriculture'],
        reliability: 9
      },

      // 2. IRRIGATION OPTIMALE
      {
        title: "Irrigation optimale de la tomate",
        category: "irrigation",
        subcategory: "tomate",
        content: `Besoins en eau de la tomate selon stade de croissance:
        
        Transplantation (J0-J15): 2-3L/plante/jour
        Développement végétatif (J15-J45): 3-5L/plante/jour
        Floraison (J45-J65): 5-7L/plante/jour (CRITIQUE - impact sur nouaison)
        Fructification (J65-J120): 6-10L/plante/jour (selon température)
        Maturation (J120+): 4-6L/plante/jour (réduire pour concentrer saveurs)
        
        Moments optimaux:
        - Matin tôt (6h-9h): évaporation minimale
        - Ou soir (18h-20h): plante récupère la nuit
        - JAMAIS en pleine chaleur (11h-16h)
        
        Indicateurs critiques:
        - Humidité sol <50% = irrigation urgente
        - Humidité sol 60-70% = optimal
        - Humidité sol >80% = risque asphyxie racinaire`,
        
        symptoms: [
          "Feuilles qui s'enroulent = manque d'eau",
          "Feuilles jaunissent = excès d'eau",
          "Blossom end rot (cul noir) = irrigation irrégulière",
          "Fentes sur fruits = apport irrégulier"
        ],
        
        solutions: [
          "Installer goutte-à-goutte avec programmateur",
          "Mulching pour conserver humidité",
          "Sonde humidité sol pour pilotage précis",
          "Adapter selon météo (pluie, canicule)"
        ],
        
        preventions: [
          "Ne jamais laisser sol <40% humidité",
          "Régularité > quantité ponctuelle",
          "Éviter chocs hydriques",
          "Drainage si sol argileux"
        ],
        
        applicableConditions: {
          crops: ['tomate'],
          climate: ['tempéré', 'méditerranéen', 'chaud'],
          season: ['printemps', 'été'],
          growthStage: ['végétatif', 'floraison', 'fructification']
        },
        
        optimalRanges: {
          temperature: { min: 15, max: 35 },
          soilMoisture: { min: 60, max: 75 },
          humidity: { min: 60, max: 80 }
        },
        
        tags: ['irrigation', 'tomate', 'eau', 'optimisation'],
        sources: ['ITAB', 'GRAB'],
        reliability: 10
      },

      // 3. FERTILISATION
      {
        title: "Fertilisation tomate en agriculture raisonnée",
        category: "fertilisation",
        subcategory: "tomate",
        content: `Besoins nutritionnels de la tomate (kg/ha pour 50 tonnes/ha):
        
        Azote (N): 150-200 kg/ha
        Phosphore (P2O5): 80-120 kg/ha
        Potassium (K2O): 200-300 kg/ha
        
        Programme type:
        
        Plantation:
        - Fumier décomposé: 30-40 T/ha (apport de fond)
        - Engrais starter NPK 10-20-10: 300 kg/ha
        
        Croissance végétative (J15-J45):
        - Azote fractionné: 50 kg/ha toutes les 2 semaines
        - Éviter excès azote (favorise feuillage au détriment fruits)
        
        Floraison-Nouaison (J45-J65):
        - Réduire azote: 30 kg/ha
        - Augmenter potassium: 50 kg/ha
        - Bore: 1-2 kg/ha (favorise nouaison)
        
        Fructification (J65-J100):
        - Azote modéré: 40 kg/ha tous les 15 jours
        - Potassium élevé: 60-80 kg/ha (qualité fruits)
        - Calcium: 20 kg/ha (prévention cul noir)
        
        Maturation (J100+):
        - Stopper azote 15 jours avant récolte
        - Potassium: 40 kg/ha (coloration, goût)
        
        Surveillance carences:
        - Feuilles jaunes + nervures vertes = manque fer
        - Bords feuilles brûlés = excès potassium ou manque calcium
        - Croissance ralentie = manque azote
        - Fruits petits = manque potassium`,
        
        symptoms: [
          "Feuilles jaunes du bas vers haut = carence azote",
          "Taches nécrotiques feuilles = carence potassium",
          "Cul noir tomates = carence calcium",
          "Feuilles vert foncé, croissance excessive = excès azote"
        ],
        
        solutions: [
          "Analyse sol avant plantation",
          "Fertigation (engrais avec irrigation)",
          "Apports fractionnés selon stade",
          "Engrais organiques à libération lente"
        ],
        
        preventions: [
          "pH sol optimal: 6.0-6.8",
          "Matière organique >3%",
          "Éviter surfertilisation azotée",
          "Équilibre NPK adapté au stade"
        ],
        
        applicableConditions: {
          crops: ['tomate'],
          climate: ['tous'],
          season: ['plantation', 'croissance'],
          growthStage: ['végétatif', 'floraison', 'fructification']
        },
        
        optimalRanges: {
          ph: { min: 6.0, max: 6.8 }
        },
        
        tags: ['fertilisation', 'NPK', 'tomate', 'nutrition'],
        sources: ['ITAB', 'INRAE'],
        reliability: 9
      },

      // Ajoutez plus de connaissances...
    ];

    // Insérer dans MongoDB
    for (const knowledge of knowledgeData) {
      // Générer embedding avec Gemini
      knowledge.embedding = await this.generateEmbedding(knowledge.content);
      
      await KnowledgeBase.create(knowledge);
      console.log(`✅ Ajouté: ${knowledge.title}`);
    }

    console.log('🎉 Base de connaissances initialisée !');
  }

  async generateEmbedding(text) {
    try {
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
    } catch (error) {
      console.error('Erreur embedding:', error);
      return [];
    }
  }
}

// Exécuter le seed
const seeder = new KnowledgeSeedService();
seeder.seedInitialKnowledge();