const Event = require('../models/event.model');

module.exports.getEvents = async (req, res) => {
    try {
        const events = await Event.find({ exploitationId: req.user.farmId }).sort({ horodatage: -1 });
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports.createEvent = async (req, res) => {
    try {
        const { type, description, capteurId } = req.body;
        const event = new Event({
            type,
            description,
            exploitationId: req.user.farmId,
            capteurId,
            statut: 'nouveau'
        });
        await event.save();
        res.status(201).json(event);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports.updateEventStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { statut } = req.body;
        if (!['nouveau', 'en_cours', 'resolu'].includes(statut)) {
            return res.status(400).json({ message: "Statut invalide" });
        }
        const event = await Event.findByIdAndUpdate(id, { statut }, { new: true });
        if (!event) return res.status(404).json({ message: "Événement non trouvé" });
        res.json(event);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};