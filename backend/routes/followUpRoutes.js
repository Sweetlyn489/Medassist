const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { listFollowUps, createFollowUp, updateFollowUp } = require('../controllers/followUpController');
const { createFollowUpRules } = require('../validators/followUpValidators');
const validate = require('../validators/validate');

router.use(protect);
router.get('/', listFollowUps);
router.post('/', createFollowUpRules, validate, createFollowUp);
router.put('/:id', updateFollowUp);

module.exports = router;
