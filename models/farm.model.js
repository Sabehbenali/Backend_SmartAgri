const mongoose = require('mongoose');

const farmSchema = new mongoose.Schema({
    nom: { type: String, default: '' },          // plus obligatoire
    localisation: { type: String, default: '' }, // optionnel
    utilisateurId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true }
}, { timestamps: true });

module.exports = mongoose.model('Farm', farmSchema);