// test-gemini.js
// Script de test pour vérifier la configuration de l'API Gemini

require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

console.log('========================================');
console.log('🧪 TEST DE CONFIGURATION GEMINI API');
console.log('========================================\n');

// Vérification de la version Node.js
const nodeVersion = process.version;
console.log(`📌 Version Node.js: ${nodeVersion}`);

const majorVersion = parseInt(nodeVersion.split('.')[0].substring(1));
if (majorVersion < 18) {
  console.log('⚠️  ATTENTION: Node.js v18+ recommandé pour @google/generative-ai');
  console.log(`   Votre version: ${nodeVersion}`);
} else {
  console.log(`✅ Version Node.js compatible (v${majorVersion})\n`);
}

// Vérification de la clé API
console.log('🔑 Vérification de la clé API...');
const apiKey = process.env.GIMINI_API_KEY;

if (!apiKey) {
  console.log('❌ ERREUR: GIMINI_API_KEY non trouvée dans .env');
  console.log('📝 Ajoutez cette ligne dans votre fichier .env:');
  console.log('   GIMINI_API_KEY=votre_cle_api_ici\n');
  console.log('🔗 Obtenez une clé sur: https://makersuite.google.com/app/apikey');
  process.exit(1);
}

console.log(`✅ Clé API trouvée: ${apiKey.substring(0, 12)}...\n`);

// Test de connexion à l'API
async function testGeminiAPI() {
  try {
    console.log('🚀 Initialisation du client Gemini...');
    const genAI = new GoogleGenerativeAI(apiKey);
    console.log('✅ Client initialisé avec succès\n');

    console.log('📡 Envoi d\'une requête de test à Gemini...');
    const model = genAI.getGenerativeModel({ model: 'models/gemini-2.5-flash' });
    
    const prompt = `En tant qu'expert agricole, donne-moi 3 conseils courts pour optimiser 
    la culture de tomates en été. Réponds en français, maximum 100 mots.`;
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log('✅ Réponse reçue de Gemini!\n');
    console.log('📝 Exemple de réponse:');
    console.log('─'.repeat(60));
    console.log(text);
    console.log('─'.repeat(60));
    console.log('\n✅ ✅ ✅ TOUS LES TESTS RÉUSSIS! ✅ ✅ ✅\n');
    console.log('🎉 Votre API Gemini est correctement configurée!');
    console.log('🚀 Vous pouvez maintenant démarrer votre serveur avec: npm start\n');
    
  } catch (error) {
    console.log('\n❌ ERREUR lors du test de l\'API:\n');
    
    if (error.message.includes('API key not valid')) {
      console.log('🔑 La clé API n\'est pas valide');
      console.log('📝 Solutions:');
      console.log('   1. Vérifiez que la clé dans .env est correcte');
      console.log('   2. Générez une nouvelle clé sur: https://makersuite.google.com/app/apikey');
      console.log('   3. Assurez-vous d\'avoir activé l\'API Gemini sur votre projet Google Cloud\n');
    } else if (error.message.includes('quota')) {
      console.log('⚠️  Quota API dépassé');
      console.log('📝 Attendez quelques minutes ou vérifiez vos limites sur Google Cloud Console\n');
    } else {
      console.log(`Détails de l'erreur: ${error.message}\n`);
    }
    
    process.exit(1);
  }
}

// Exécution du test
testGeminiAPI();