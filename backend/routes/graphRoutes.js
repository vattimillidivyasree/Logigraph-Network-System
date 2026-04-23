
const express = require('express');
const router = express.Router();
const graphController = require('../controllers/graphController');
const auth = require('../middleware/authMiddleware');

router.post('/save', auth, graphController.saveGraph);
router.get('/my-graphs', auth, graphController.getUserGraphs);
router.post('/optimize', auth, graphController.optimizeNetwork);

module.exports = router;