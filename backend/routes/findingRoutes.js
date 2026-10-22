const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const { listFindings, reviewFinding } = require('../controllers/findingController');

router.use(protect);
router.use(requireRole('clinician'));

router.get('/', listFindings);
router.put('/:id/review', reviewFinding);

module.exports = router;
