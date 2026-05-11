// models/KnowledgeBase.js

const mongoose = require('mongoose');

const knowledgeSchema = new mongoose.Schema({
  // Identification
  title: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['culture', 'maladie', 'ravageur', 'irrigation', 'fertilisation', 'météo', 'technique'],
    required: true 
  },
  subcategory: String, // Ex: "tomate", "mildiou", "goutte-à-goutte"
  
  // Contenu
  content: { type: String, required: true }, // Texte de connaissance
  symptoms: [String], // Symptômes à identifier
  solutions: [String], // Solutions recommandées
  preventions: [String], // Mesures préventives
  
  // Conditions d'application
  applicableConditions: {
    crops: [String], // Cultures concernées
    climate: [String], // Climats concernés
    season: [String], // Saisons
    growthStage: [String] // Stades de croissance
  },
  
  // Données techniques
  optimalRanges: {
    temperature: { min: Number, max: Number },
    soilMoisture: { min: Number, max: Number },
    ph: { min: Number, max: Number },
    humidity: { min: Number, max: Number }
  },
  
  // Embedding pour recherche sémantique
  embedding: [Number], // Vector pour recherche IA
  
  // Métadonnées
  language: { type: String, default: 'fr' },
  sources: [String], // Sources d'information
  reliability: { type: Number, min: 0, max: 10, default: 5 },
  lastUpdated: { type: Date, default: Date.now },
  tags: [String],
  
  // Statistiques
  usageCount: { type: Number, default: 0 },
  successRate: { type: Number, default: 0 } // Si solution appliquée avec succès
});

// Index pour recherche rapide
knowledgeSchema.index({ category: 1, subcategory: 1 });
knowledgeSchema.index({ tags: 1 });
knowledgeSchema.index({ 'applicableConditions.crops': 1 });

module.exports = mongoose.model('KnowledgeBase', knowledgeSchema);