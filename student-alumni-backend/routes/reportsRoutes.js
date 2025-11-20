const express = require('express');
const router = express.Router();
const reportsCtrl = require('../controllers/reportsController');
const auth = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');

// POST /api/reports  (authenticated users)
router.post('/', auth.auth, reportsCtrl.createReport);

// GET /api/reports  (admin only)
router.get('/', auth.auth, requireRole('admin'), reportsCtrl.listReports);

// PATCH /api/reports/:id/status  (admin only)
router.patch('/:id/status', auth.auth, requireRole('admin'), reportsCtrl.updateReportStatus);

module.exports = router;
