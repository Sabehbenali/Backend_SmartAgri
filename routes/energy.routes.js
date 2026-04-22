const express = require('express');
const router = express.Router();
const energyController = require('../controllers/energy.controller');
const authMiddleware = require('../middleware/user.middleware');

router.post('/', authMiddleware, energyController.addEnergyData);
router.get('/latest', authMiddleware, energyController.getLatestEnergy);

module.exports = router;