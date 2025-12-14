const express = require('express');
const router = express.Router();
const {
  getAllPlans,
  getCurrentSubscription,
  createPaymentIntent,
  subscribe
} = require('../controllers/subscriptionController');
const authenticate = require('../middleware/auth');

router.get('/plans', getAllPlans);
router.use(authenticate);
router.get('/current', getCurrentSubscription);
router.post('/payment-intent', createPaymentIntent);
router.post('/subscribe', subscribe);

module.exports = router;

