const express = require('express');
const router = express.Router();
const { getReport } = require('../controllers/financeController');

// GET /api/finance/:type
// type can be 'weekly', 'monthly', or 'yearly'
router.get('/:type', getReport);

module.exports = router;
