const express = require('express');
const router = express.Router();
const farmController = require('../controllers/ferme.controller');
const authMiddleware = require('../middleware/utilisateur.middleware');

router.get('/me', authMiddleware, farmController.getMyFarm);
router.put('/me', authMiddleware, farmController.updateMyFarm);

module.exports = router;