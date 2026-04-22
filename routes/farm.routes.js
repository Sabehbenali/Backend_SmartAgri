const express = require('express');
const router = express.Router();
const farmController = require('../controllers/farm.controller');
const authMiddleware = require('../middleware/user.middleware');

router.get('/me', authMiddleware, farmController.getMyFarm);
router.put('/me', authMiddleware, farmController.updateMyFarm);

module.exports = router;