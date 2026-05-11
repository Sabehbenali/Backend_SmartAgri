const Actuator = require('../models/actionneur.model');
const ActuatorCommand = require('../models/historiqueActionneur.model');
const Esp32Node = require('../models/noeudESP32.model');

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


const HistoriqueActionneur = require('../models/historiqueActionneur.model'); // adaptez le chemin

exports.sendCommand = async (req, res) => {
    try {
        const { id } = req.params;
        const { action, source = 'mobile' } = req.body;
        if (!['activer', 'desactiver'].includes(action)) {
            return res.status(400).json({ message: "Action invalide" });
        }
        const actuator = await Actuator.findById(id);
        if (!actuator) return res.status(404).json({ message: "Actionneur non trouvé" });

        // Enregistrement dans l'historique (avec le bon champ)
        const historique = new HistoriqueActionneur({ action, source, idActionneur: id });
        await historique.save();

        // Mise à jour de l'état
        actuator.etat = action === 'activer' ? 'ON' : 'OFF';
        await actuator.save();

        res.json({ message: "Commande envoyée", actuator });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};