const Farm = require('../models/farm.model');

module.exports.getMyFarm = async (req, res) => {
    try {
        const farm = await Farm.findOne({ utilisateurId: req.user.id });
        if (!farm) return res.status(404).json({ message: "Ferme non trouvée" });
        res.json(farm);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports.updateMyFarm = async (req, res) => {
    try {
        const { nom, localisation } = req.body;
        const farm = await Farm.findOneAndUpdate(
            { utilisateurId: req.user.id },
            { nom, localisation },
            { new: true }
        );
        if (!farm) return res.status(404).json({ message: "Ferme non trouvée" });
        res.json({ message: "Ferme mise à jour", farm });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};