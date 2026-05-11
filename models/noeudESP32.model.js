const mongoose = require('mongoose');

const noeudSchema = new mongoose.Schema({
    role: { type: String, enum: ['centrale', 'secondaire'], required: true },
    idFerme: { type: mongoose.Schema.Types.ObjectId, ref: 'Ferme', required: true }
}, { timestamps: true });

module.exports = mongoose.model('NoeudESP32', noeudSchema);