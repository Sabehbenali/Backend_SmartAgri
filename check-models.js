require('dotenv').config();

async function checkModels() {
  const apiKey = process.env.GIMINI_API_KEY;
  
  console.log('🔑 Clé API:', apiKey ? apiKey.substring(0, 20) + '...' : 'MANQUANTE');
  console.log('');
  
  try {
    // Liste des modèles disponibles
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    
    console.log('📡 Appel à:', url.replace(apiKey, 'XXX'));
    console.log('');
    
    const response = await fetch(url);
    
    console.log('📊 Status HTTP:', response.status, response.statusText);
    console.log('');
    
    if (!response.ok) {
      const error = await response.text();
      console.log('❌ ERREUR:');
      console.log(error);
      console.log('');
      console.log('🔧 SOLUTIONS:');
      console.log('1. Créez une NOUVELLE clé sur: https://aistudio.google.com/app/apikey');
      console.log('2. Assurez-vous de choisir "Create API key in new project"');
      console.log('3. Vérifiez que vous êtes connecté avec le bon compte Google');
      return;
    }
    
    const data = await response.json();
    
    if (!data.models || data.models.length === 0) {
      console.log('⚠️  AUCUN MODÈLE DISPONIBLE !');
      console.log('');
      console.log('Votre clé API n\'a AUCUN accès aux modèles Gemini.');
      console.log('');
      console.log('🔧 SOLUTIONS:');
      console.log('1. Allez sur https://aistudio.google.com/app/apikey');
      console.log('2. SUPPRIMEZ toutes vos anciennes clés');
      console.log('3. Créez une NOUVELLE clé dans un NOUVEAU projet');
      console.log('4. Ou essayez avec un autre compte Google');
      return;
    }
    
    console.log(`✅ ${data.models.length} MODÈLE(S) TROUVÉ(S):\n`);
    
    for (const model of data.models) {
      console.log(`📌 ${model.name}`);
      if (model.displayName) console.log(`   Nom: ${model.displayName}`);
      if (model.supportedGenerationMethods) {
        console.log(`   Méthodes: ${model.supportedGenerationMethods.join(', ')}`);
      }
      console.log('');
    }
    
    // Trouver un modèle qui supporte generateContent
    const workingModel = data.models.find(m => 
      m.supportedGenerationMethods?.includes('generateContent')
    );
    
    if (workingModel) {
      console.log('💡 UTILISEZ CE MODÈLE:');
      console.log(`   ${workingModel.name}`);
      console.log('');
      console.log('📝 Dans config/gemini.config.js, changez:');
      console.log(`   this.modelId = '${workingModel.name}';`);
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

checkModels();