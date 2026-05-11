const mongoose = require('mongoose');

const actionneurSchema = new mongoose.Schema({
   type: { type: String, required: true },
    etat: { type: String, enum: ['ON', 'OFF'], default: 'OFF' },
   idNoeud: { type: mongoose.Schema.Types.ObjectId, ref: 'NoeudESP32', required: true },
    // champs spécifiques pompe
    dureeFonctionnement: Number,
    // champs spécifiques electrolyseur
    simulationActive: Boolean,
    dureeActivation: Number
}, { timestamps: true });

module.exports = mongoose.model('Actionneur', actionneurSchema);