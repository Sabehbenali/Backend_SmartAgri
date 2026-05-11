const mongoose = require('mongoose');

const historiqueActionneurSchema = new mongoose.Schema({
    action: { type: String, enum: ['activer', 'desactiver'], required: true },
    source: { type: String, enum: ['mobile', 'centrale', 'secondaire'], required: true },
    horodatage: { type: Date, default: Date.now },
    idActionneur: { type: mongoose.Schema.Types.ObjectId, ref: 'Actionneur', required: true }
});

module.exports = mongoose.model('HistoriqueActionneur', historiqueActionneurSchema);