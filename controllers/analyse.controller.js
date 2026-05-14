// controllers/analyse.controller.js
const geminiService = require('../config/gemini.config');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Configuration de multer pour l'upload d'images
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../public/images/temp');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'plant-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Type de fichier non supporté. Utilisez: JPG, PNG, GIF, WEBP'));
  }
});

// Middleware d'upload
const uploadMiddleware = upload.single('image');

/**
 * Contrôleur pour les analyses avec Gemini
 */
class AnalyseController {
  /**
   * Analyse des données de capteurs en temps réel
   * Route: POST /api/analyse/sensors
   */
  async analyzeSensors(req, res) {
    try {
      const { temperature, soilMoisture, airHumidity, light, ph } = req.body;

      // Validation des données
      if (!temperature || !soilMoisture || !airHumidity) {
        return res.status(400).json({
          success: false,
          message: 'Données de capteurs incomplètes'
        });
      }

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
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Erreur dans analyzeSensors:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de l\'analyse des données',
        error: error.message
      });
    }
  }

  /**
   * Génération de recommandations basées sur la météo
   * Route: POST /api/analyse/weather
   */
  async analyzeWeather(req, res) {
    try {
      const weatherData = req.body;

      if (!weatherData || Object.keys(weatherData).length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Données météo manquantes'
        });
      }

      const recommendations = await geminiService.predictAndRecommend(weatherData);

      res.status(200).json({
        success: true,
        data: {
          recommendations,
          generatedAt: new Date()
        }
      });
    } catch (error) {
      console.error('Erreur dans analyzeWeather:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de l\'analyse météo',
        error: error.message
      });
    }
  }

  /**
   * Diagnostic de maladies des plantes
   * Route: POST /api/analyse/disease
   */
  async diagnosePlant(req, res) {
    try {
      const { symptoms, cropType } = req.body;

      if (!symptoms || !cropType) {
        return res.status(400).json({
          success: false,
          message: 'Symptômes et type de culture requis'
        });
      }

      const diagnosis = await geminiService.diagnosePlantDisease(symptoms, cropType);

      res.status(200).json({
        success: true,
        data: {
          diagnosis,
          cropType,
          diagnosedAt: new Date()
        }
      });
    } catch (error) {
      console.error('Erreur dans diagnosePlant:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors du diagnostic',
        error: error.message
      });
    }
  }

  /**
   * Analyse personnalisée avec prompt libre
   * Route: POST /api/analyse/custom
   */
  async customAnalysis(req, res) {
    try {
      const { prompt } = req.body;

      if (!prompt || prompt.trim().length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Prompt requis pour l\'analyse'
        });
      }

      const result = await geminiService.generateAnalysis(prompt);

      res.status(200).json({
        success: true,
        data: {
          result,
          prompt,
          generatedAt: new Date()
        }
      });
    } catch (error) {
      console.error('Erreur dans customAnalysis:', error);
      res.status(500).json({
        success: false,
        message: 'Erreur lors de l\'analyse personnalisée',
        error: error.message
      });
    }
  }

  /**
   * 🌿 ANALYSER UNE PHOTO DE PLANTE AVEC GEMINI
   * Route: POST /api/analyse/plant-image
   * 
   * Form-data attendu:
   * - image: File (JPG, PNG, GIF, WEBP)
   * - question: String (optionnel)
   * - languageCode: String (fr, en, ar) - défaut: fr
   */
  async analyzePlantImage(req, res) {
    try {
      console.log('🌿 Analyse de photo de plante demandée');
      
      // Vérifier qu'une image a été uploadée
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Aucune image fournie',
          required: 'Envoyez une image dans le champ "image" (multipart/form-data)'
        });
      }
      
      const imagePath = req.file.path;
      const question = req.body.question || 'Quel est le problème avec cette plante ? Est-elle en bonne santé ?';
      const languageCode = req.body.languageCode || 'fr';
      
      console.log('📸 Image reçue:', {
        filename: req.file.filename,
        size: `${(req.file.size / 1024).toFixed(2)} KB`,
        type: req.file.mimetype,
        question: question.substring(0, 50) + '...'
      });
      
      // Lire l'image en base64
      const imageBuffer = await fs.readFile(imagePath);
      const base64Image = imageBuffer.toString('base64');
      
      // Construire le prompt selon la langue
      const prompts = {
        'fr': `Tu es un expert en diagnostic phytosanitaire. Analyse cette image de plante et réponds à la question suivante:

"${question}"

Fournis un diagnostic DÉTAILLÉ qui inclut:

1️⃣ **IDENTIFICATION**:
- Type de plante (si identifiable)
- État général de santé

2️⃣ **PROBLÈMES IDENTIFIÉS**:
- Maladies détectées
- Parasites visibles
- Carences nutritionnelles
- Stress environnemental

3️⃣ **DIAGNOSTIC**:
- Gravité du problème (SAIN, LÉGER, MODÉRÉ, GRAVE, CRITIQUE)
- Causes probables
- Niveau de certitude

4️⃣ **TRAITEMENT RECOMMANDÉ**:
- Actions immédiates à prendre
- Traitements biologiques
- Traitements chimiques (si nécessaire)
- Prévention future

5️⃣ **CONSEILS D'ENTRETIEN**:
- Arrosage optimal
- Exposition lumineuse
- Fertilisation
- Taille/élagage

Réponds en français, de manière claire et professionnelle.`,

        'en': `You are a plant health expert. Analyze this plant image and answer the following question:

"${question}"

Provide a DETAILED diagnosis including:

1️⃣ **IDENTIFICATION**:
- Plant type (if identifiable)
- Overall health status

2️⃣ **DETECTED PROBLEMS**:
- Identified diseases
- Visible pests
- Nutritional deficiencies
- Environmental stress

3️⃣ **DIAGNOSIS**:
- Problem severity (HEALTHY, LIGHT, MODERATE, SEVERE, CRITICAL)
- Probable causes
- Confidence level

4️⃣ **RECOMMENDED TREATMENT**:
- Immediate actions
- Biological treatments
- Chemical treatments (if needed)
- Future prevention

5️⃣ **CARE ADVICE**:
- Optimal watering
- Light exposure
- Fertilization
- Pruning

Respond in English, clearly and professionally.`,

        'ar': `أنت خبير في تشخيص صحة النباتات. قم بتحليل صورة النبات هذه وأجب على السؤال التالي:

"${question}"

قدم تشخيصًا مُفصلاً يتضمن:

1️⃣ **التعريف**:
- نوع النبات (إن أمكن تحديده)
- الحالة الصحية العامة

2️⃣ **المشاكل المكتشفة**:
- الأمراض المحددة
- الآفات المرئية
- أوجه القصور الغذائية
- الإجهاد البيئي

3️⃣ **التشخيص**:
- خطورة المشكلة (سليم، خفيف، متوسط، خطير، حرج)
- الأسباب المحتملة
- مستوى اليقين

4️⃣ **العلاج الموصى به**:
- الإجراءات الفورية
- العلاجات البيولوجية
- العلاجات الكيميائية (إذا لزم الأمر)
- الوقاية المستقبلية

5️⃣ **نصائح العناية**:
- الري الأمثل
- التعرض للضوء
- التسميد
- التقليم

أجب بالعربية، بوضوح واحترافية.`
      };
      
      const prompt = prompts[languageCode] || prompts['fr'];
      
      console.log('🚀 Envoi à Gemini...');
      
      // Appeler Gemini avec l'image
      const diagnosis = await geminiService.analyzeImageWithPrompt(
        prompt,
        base64Image,
        req.file.mimetype
      );
      
      console.log(`✅ Diagnostic reçu (${diagnosis.length} caractères)`);
      
      // Extraire le statut
      const status = extractStatusFromText(diagnosis);
      
      // Nettoyer le fichier temporaire
      try {
        await fs.unlink(imagePath);
      } catch (err) {
        console.warn('⚠️ Impossible de supprimer le fichier temporaire:', err.message);
      }
      
      // Retourner la réponse
      res.status(200).json({
        success: true,
        data: {
          diagnosis,
          question,
          status,
          languageCode
        },
        metadata: {
          timestamp: new Date(),
          imageSize: req.file.size,
          processedIn: 'Gemini 1.5 Flash'
        }
      });
      
    } catch (error) {
      console.error('❌ Erreur dans analyzePlantImage:', error.message);
      
      // Nettoyer le fichier en cas d'erreur
      if (req.file && req.file.path) {
        try {
          await fs.unlink(req.file.path);
        } catch (err) {
          // Ignorer les erreurs de nettoyage
        }
      }
      
      res.status(500).json({
        success: false,
        message: 'Erreur lors de l\'analyse de la photo',
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

/**
 * 🏥 EXTRAIRE LE STATUT DU TEXTE
 */
function extractStatusFromText(text) {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('critique') || 
      lowerText.includes('critical') ||
      lowerText.includes('حرج') ||
      lowerText.includes('mort') ||
      lowerText.includes('dead')) {
    return 'critical';
  }
  
  if (lowerText.includes('grave') || 
      lowerText.includes('severe') ||
      lowerText.includes('خطير') ||
      lowerText.includes('danger')) {
    return 'severe';
  }
  
  if (lowerText.includes('modéré') || 
      lowerText.includes('moderate') ||
      lowerText.includes('متوسط') ||
      lowerText.includes('moyen')) {
    return 'moderate';
  }
  
  if (lowerText.includes('léger') || 
      lowerText.includes('light') ||
      lowerText.includes('خفيف') ||
      lowerText.includes('mineur')) {
    return 'light';
  }
  
  if (lowerText.includes('sain') || 
      lowerText.includes('healthy') ||
      lowerText.includes('سليم') ||
      lowerText.includes('bon')) {
    return 'healthy';
  }
  
  return 'moderate'; // Par défaut
}

// Export du contrôleur et du middleware
module.exports = new AnalyseController();
module.exports.uploadMiddleware = uploadMiddleware;
