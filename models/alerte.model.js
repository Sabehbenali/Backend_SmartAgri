const mongoose = require('mongoose');

const alerteSchema = new mongoose.Schema({
    type: { type: String, enum: ['intrusion', 'niveau_eau_bas', 'arrosage_auto', 'batterie_faible', 'simulation_electrolyse'], required: true },
    description: String,
    horodatage: { type: Date, default: Date.now },
    statut: { type: String, enum: ['nouveau', 'en_cours', 'resolu'], default: 'nouveau' },
    idFerme: { type: mongoose.Schema.Types.ObjectId, ref: 'Ferme', required: true },
    idCapteur: { type: mongoose.Schema.Types.ObjectId, ref: 'Capteur' } // optionnel
}, { timestamps: true });

module.exports = mongoose.model('Alerte', alerteSchema);