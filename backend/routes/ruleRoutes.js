const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const { listRules, updateRule } = require('../controllers/ruleController');

router.use(protect);
router.get('/', listRules); // readable by any authenticated clinician for transparency
router.put('/:id', requireRole('admin'), updateRule);

module.exports = router;
