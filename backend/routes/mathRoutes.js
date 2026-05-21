const express = require('express');
const router = express.Router();
const { evaluateMath, getHistory, addToHistory } = require('../controllers/mathController');

router.post('/evaluate', addToHistory, evaluateMath);
router.get('/history', getHistory);

module.exports = router;
