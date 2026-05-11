const express = require('express');
const router = express.Router();
const energyController = require('../controllers/energie.controller');
const authMiddleware = require('../middleware/utilisateur.middleware');

router.post('/', authMiddleware, energyController.addEnergyData);
router.get('/latest', authMiddleware, energyController.getLatestEnergy);

module.exports = router;