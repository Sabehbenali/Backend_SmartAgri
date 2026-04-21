// models/Sensor.js
const mongoose = require('mongoose');

const sensorSchema = new mongoose.Schema({
    type: { 
        type: String, 
        enum: ['temperature_air', 'humidite_air', 'pluie', 'humidite_sol', 'pir', 'niveau_eau', 'batterie'],
        required: true 
    },
    emplacement: String,
    derniereValeur: Number,
    // champs spécifiques (optionnels selon le type)
    seuilArrosage: Number,        // pour humidite_sol
    modeSurveillance: Boolean,    // pour pir
    hauteurMax: Number,           // pour niveau_eau
    noeudId: { type: mongoose.Schema.Types.ObjectId, ref: 'Esp32Node', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Sensor', sensorSchema);