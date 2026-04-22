const Sensor = require('../models/sensor.model');
const SensorData = require('../models/sensorData.model');
const Esp32Node = require('../models/Esp32Node.model');

module.exports.getSensors = async (req, res) => {
    try {
        const nodes = await Esp32Node.find({ exploitationId: req.user.farmId });
        const nodeIds = nodes.map(n => n._id);
        const sensors = await Sensor.find({ noeudId: { $in: nodeIds } });
        res.json(sensors);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports.addSensorData = async (req, res) => {
    try {
        const { capteurId, valeur, unite } = req.body;
        const data = new SensorData({ capteurId, valeur, unite });
        await data.save();
        await Sensor.findByIdAndUpdate(capteurId, { derniereValeur: valeur });
        res.status(201).json({ message: "Mesure enregistrée" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports.getSensorHistory = async (req, res) => {
    try {
        const { id } = req.params;
        const { start, end, limit = 100 } = req.query;
        let query = { capteurId: id };
        if (start || end) {
            query.horodatage = {};
            if (start) query.horodatage.$gte = new Date(start);
            if (end) query.horodatage.$lte = new Date(end);
        }
        const data = await SensorData.find(query).sort({ horodatage: -1 }).limit(parseInt(limit));
        res.json(data);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};