const mongoose = require('mongoose');

const energieSchema = new mongoose.Schema({
    tensionBatterie: Number,
    pourcentageBatterie: Number,
    productionSolaire: Number,
    consommationTotale: Number,
    horodatage: { type: Date, default: Date.now },
    idFerme: { type: mongoose.Schema.Types.ObjectId, ref: 'Ferme', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Energie', energieSchema);