const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const { listAuditLogs } = require('../controllers/auditController');

router.use(protect, requireRole('admin'));
router.get('/', listAuditLogs);

module.exports = router;
