const Energy = require('../models/energy.model');

module.exports.addEnergyData = async (req, res) => {
    try {
        const { tensionBatterie, pourcentageBatterie, productionSolaire, consommationTotale } = req.body;
        const energy = new Energy({
            tensionBatterie,
            pourcentageBatterie,
            productionSolaire,
            consommationTotale,
            exploitationId: req.user.farmId
        });
        await energy.save();
        res.status(201).json({ message: "Donnée énergétique enregistrée" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports.getLatestEnergy = async (req, res) => {
    try {
        const energy = await Energy.findOne({ exploitationId: req.user.farmId }).sort({ horodatage: -1 });
        res.json(energy || {});
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};