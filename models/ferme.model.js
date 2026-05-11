const mongoose = require('mongoose');

const fermeSchema = new mongoose.Schema({
    nom: { type: String, default: '' },
    localisation: { type: String, default: '' },
    idUtilisateur: { type: mongoose.Schema.Types.ObjectId, ref: 'Utilisateur', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Ferme', fermeSchema);