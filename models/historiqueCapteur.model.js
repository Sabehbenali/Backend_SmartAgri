const mongoose = require('mongoose');

const historiqueCapteurSchema = new mongoose.Schema({
    valeur: { type: Number, required: true },
    unite: String,
    horodatage: { type: Date, default: Date.now },
    idCapteur: { type: mongoose.Schema.Types.ObjectId, ref: 'Capteur', required: true }
});

module.exports = mongoose.model('HistoriqueCapteur', historiqueCapteurSchema);