const express = require('express');
const router = express.Router();
const actuatorController = require('../controllers/actuator.controller');
const authMiddleware = require('../middleware/user.middleware');

router.get('/', authMiddleware, actuatorController.getActuators);
router.post('/:id/command', authMiddleware, actuatorController.sendCommand);

module.exports = router;