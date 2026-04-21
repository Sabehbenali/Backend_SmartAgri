// models/Farm.js
const mongoose = require('mongoose');

const farmSchema = new mongoose.Schema({
    nom: { type: String, required: true },
    localisation: String,
    utilisateurId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Farm', farmSchema);