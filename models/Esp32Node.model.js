// models/Esp32Node.js
const mongoose = require('mongoose');

const esp32NodeSchema = new mongoose.Schema({
    role: { type: String, enum: ['centrale', 'secondaire'], required: true },
    firmwareVersion: String,
    exploitationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Farm', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Esp32Node', esp32NodeSchema);