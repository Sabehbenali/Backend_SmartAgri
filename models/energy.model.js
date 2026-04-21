// models/Energy.js
const mongoose = require('mongoose');

const energySchema = new mongoose.Schema({
    tensionBatterie: Number,
    pourcentageBatterie: Number,
    productionSolaire: Number,
    consommationTotale: Number,
    horodatage: { type: Date, default: Date.now },
    exploitationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Farm', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Energy', energySchema);