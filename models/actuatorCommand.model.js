// models/ActuatorCommand.js
const mongoose = require('mongoose');

const actuatorCommandSchema = new mongoose.Schema({
    action: { type: String, enum: ['activer', 'desactiver'], required: true },
    source: { type: String, enum: ['mobile', 'centrale', 'secondaire'], required: true },
    horodatage: { type: Date, default: Date.now },
    actionneurId: { type: mongoose.Schema.Types.ObjectId, ref: 'Actuator', required: true }
}, { timestamps: true });

module.exports = mongoose.model('ActuatorCommand', actuatorCommandSchema);