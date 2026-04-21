// models/Actuator.js
const mongoose = require('mongoose');

const actuatorSchema = new mongoose.Schema({
    type: { type: String, enum: ['pompe', 'electrolyseur', 'relais'], required: true },
    etat: { type: String, enum: ['ON', 'OFF'], default: 'OFF' },
    // champs spécifiques
    dureeFonctionnement: Number,   // pour pompe (en heures)
    simulationActive: Boolean,     // pour electrolyseur
    dureeActivation: Number,       // pour electrolyseur (secondes)
    noeudId: { type: mongoose.Schema.Types.ObjectId, ref: 'Esp32Node', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Actuator', actuatorSchema);