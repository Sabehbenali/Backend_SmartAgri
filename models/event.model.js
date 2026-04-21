// models/Event.js
const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    type: { 
        type: String, 
        enum: ['intrusion', 'niveau_eau_bas', 'arrosage_auto', 'batterie_faible', 'simulation_electrolyse'],
        required: true 
    },
    description: String,
    horodatage: { type: Date, default: Date.now },
    statut: { type: String, enum: ['nouveau', 'en_cours', 'resolu'], default: 'nouveau' },
    exploitationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Farm', required: true },
    // optionnel : si vous voulez lier à un capteur précis
    capteurId: { type: mongoose.Schema.Types.ObjectId, ref: 'Sensor' }
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);