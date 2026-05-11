// models/Diagnosis.js

const mongoose = require('mongoose');

const diagnosisSchema = new mongoose.Schema({
  farmId: { type: mongoose.Schema.Types.ObjectId, ref: 'Farm', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  timestamp: { type: Date, default: Date.now },
  data: { type: Object }, // Données collectées
  aiAnalysis: { type: Object }, // Analyse IA complète
  scores: {
    healthScore: Number,
    productionRisk: Number,
    overallRisk: String,
    efficiency: String,
    dataQuality: String
  },
  recommendations: [Object],
  riskLevel: String,
  implemented: { type: Boolean, default: false }
});

module.exports = mongoose.model('Diagnosis', diagnosisSchema);