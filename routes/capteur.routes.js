const express = require('express');
const router = express.Router();
const sensorController = require('../controllers/capteur.controller');
const authMiddleware = require('../middleware/utilisateur.middleware');

router.get('/', authMiddleware, sensorController.getSensors);
router.post('/data', authMiddleware, sensorController.addSensorData);
router.get('/:id/history', authMiddleware, sensorController.getSensorHistory);

module.exports = router;