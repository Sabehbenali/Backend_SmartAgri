// routes/alerte.routes.js
const express = require('express');
const router = express.Router();
const alerteController = require('../controllers/alerte.controller');

// Routes pour les alertes (sans middleware pour l'instant)
router.get('/', alerteController.getAllAlertes);
router.get('/:id', alerteController.getAlerteById);
router.post('/', alerteController.createAlerte);
router.put('/:id', alerteController.updateAlerte);
router.delete('/:id', alerteController.deleteAlerte);

module.exports = router;