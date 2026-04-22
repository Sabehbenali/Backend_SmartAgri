const Actuator = require('../models/actuator.model');
const ActuatorCommand = require('../models/actuatorCommand.model');
const Esp32Node = require('../models/Esp32Node.model');

module.exports.getActuators = async (req, res) => {
    try {
        const nodes = await Esp32Node.find({ exploitationId: req.user.farmId });
        const nodeIds = nodes.map(n => n._id);
        const actuators = await Actuator.find({ noeudId: { $in: nodeIds } });
        res.json(actuators);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports.sendCommand = async (req, res) => {
    try {
        const { id } = req.params;
        const { action, source = 'mobile' } = req.body;
        if (!['activer', 'desactiver'].includes(action)) {
            return res.status(400).json({ message: "Action invalide" });
        }
        const actuator = await Actuator.findById(id);
        if (!actuator) return res.status(404).json({ message: "Actionneur non trouvé" });

        const command = new ActuatorCommand({ action, source, actionneurId: id });
        await command.save();

        actuator.etat = action === 'activer' ? 'ON' : 'OFF';
        await actuator.save();

        res.json({ message: "Commande envoyée", actuator });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};