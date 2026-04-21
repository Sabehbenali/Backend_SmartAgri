// models/SensorData.js
const mongoose = require('mongoose');

const sensorDataSchema = new mongoose.Schema({
    valeur: { type: Number, required: true },
    unite: String,
    horodatage: { type: Date, default: Date.now },
    capteurId: { type: mongoose.Schema.Types.ObjectId, ref: 'Sensor', required: true }
}, { timestamps: true });

module.exports = mongoose.model('SensorData', sensorDataSchema);