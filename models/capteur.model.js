const mongoose = require('mongoose');   // <-- Ajoutez cette ligne

const capteurSchema = new mongoose.Schema({
    nom: String,
    emplacement: String,
    derniereValeur: Number,
    type: { type: String, enum: ['Air', 'PIR', 'HumiditeSol', 'NiveauEau', 'Pluie', 'Fumee'], required: true },
    idNoeud: { type: mongoose.Schema.Types.ObjectId, ref: 'NoeudESP32', required: true },
    // champs spécifiques
    temperature: Number,
    humidite: Number,
    modeSurveillance: Boolean,
    seuilArrosage: Number,
    hauteurMax: Number,
    hauteurCourante: Number,
}, { timestamps: true });

module.exports = mongoose.model('Capteur', capteurSchema);