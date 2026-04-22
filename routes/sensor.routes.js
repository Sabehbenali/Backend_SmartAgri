const express = require('express');
const router = express.Router();
const sensorController = require('../controllers/sensor.controller');
const authMiddleware = require('../middleware/user.middleware');

router.get('/', authMiddleware, sensorController.getSensors);
router.post('/data', authMiddleware, sensorController.addSensorData);
router.get('/:id/history', authMiddleware, sensorController.getSensorHistory);

module.exports = router;