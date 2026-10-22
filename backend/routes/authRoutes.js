const express = require('express');
const router = express.Router();
const { login, register, me, listClinicians, listUsers, updateUserStatus } = require('../controllers/authController');
const { loginRules, registerRules } = require('../validators/authValidators');
const validate = require('../validators/validate');
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

router.post('/login', loginRules, validate, login);
router.post('/register', protect, requireRole('admin'), registerRules, validate, register);
router.get('/me', protect, me);
router.get('/clinicians', protect, listClinicians);
router.get('/users', protect, requireRole('admin'), listUsers);
router.put('/users/:id/status', protect, requireRole('admin'), updateUserStatus);

module.exports = router;
