// routes/aiDiagnostic.routes.js

const router = require('express').Router();
const aiDiagnostic = require('../controllers/aiDiagnostic.controller');
const authMiddleware = require('../middleware/utilisateur.middleware');

/**
 * POST /api/ai-diagnostic/diagnosis/:farmId
 * Génère un diagnostic IA complet pour une ferme
 * Nécessite authentification
 */
router.post(
  '/diagnosis/:farmId', 
  authMiddleware, 
  aiDiagnostic.fullDiagnosis
);

/**
 * GET /api/ai-diagnostic/history/:farmId
 * Récupère l'historique des diagnostics d'une ferme
 * Query params: limit, skip
 */
router.get(
  '/history/:farmId',
  authMiddleware,
  aiDiagnostic.getDiagnosticHistory
);

/**
 * GET /api/ai-diagnostic/:diagnosisId
 * Récupère un diagnostic spécifique par son ID
 */
router.get(
  '/:diagnosisId',
  authMiddleware,
  aiDiagnostic.getDiagnosticById
);

module.exports = router;