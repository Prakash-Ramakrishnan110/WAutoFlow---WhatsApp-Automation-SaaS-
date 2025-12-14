const express = require('express');
const router = express.Router();
const {
  sendMessage,
  getMessageLogs,
  getAnalytics
} = require('../controllers/messageController');
const authenticate = require('../middleware/auth');

router.use(authenticate);

router.post('/send', sendMessage);
router.get('/logs', getMessageLogs);
router.get('/analytics', getAnalytics);

module.exports = router;

