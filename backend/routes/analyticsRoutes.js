const express = require('express');
const router = express.Router();
const {
  trackVisit,
  getStats,
  getVisitsGraph,
  getOrdersGraph
} = require('../controllers/analyticsController');
const { protect, admin, optionalProtect } = require('../middleware/auth');

router.post('/track-visit', optionalProtect, trackVisit);
router.get('/admin/stats', protect, admin, getStats);
router.get('/admin/visits-graph', protect, admin, getVisitsGraph);
router.get('/admin/orders-graph', protect, admin, getOrdersGraph);

module.exports = router;