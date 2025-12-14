const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const whatsappService = require('../services/whatsapp');
const paymentService = require('../services/payment');

// WhatsApp Webhook
router.get('/whatsapp', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  const verified = whatsappService.verifyWebhook(mode, token, challenge);
  if (verified) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

router.post('/whatsapp', async (req, res) => {
  try {
    const event = whatsappService.processWebhookEvent(req.body);
    
    // Handle status updates
    if (event.type === 'status') {
      const statuses = req.body.entry?.[0]?.changes?.[0]?.value?.statuses || [];
      
      for (const status of statuses) {
        const messageId = status.id;
        const statusValue = status.status;
        const timestamp = status.timestamp * 1000; // Convert to milliseconds

        // Update message log
        if (statusValue === 'delivered') {
          await pool.query(
            'UPDATE message_logs SET delivery_status = $1, delivered_at = $2 WHERE message_id = $3',
            ['delivered', new Date(timestamp), messageId]
          );
        } else if (statusValue === 'read') {
          await pool.query(
            'UPDATE message_logs SET read_status = $1, read_at = $2 WHERE message_id = $3',
            ['read', new Date(timestamp), messageId]
          );
        }
      }
    }

    res.sendStatus(200);
  } catch (error) {
    console.error('WhatsApp webhook error:', error);
    res.sendStatus(500);
  }
});

// Stripe Webhook
router.post('/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  const signature = req.headers['stripe-signature'];
  const event = paymentService.verifyStripeWebhook(req.body, signature);

  if (!event) {
    return res.sendStatus(400);
  }

  try {
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object;
      const userId = paymentIntent.metadata.user_id;
      const planId = paymentIntent.metadata.plan_id;

      // Create subscription
      const now = new Date();
      const periodEnd = new Date(now);
      periodEnd.setMonth(periodEnd.getMonth() + 1);

      await pool.query(
        `INSERT INTO subscriptions 
         (user_id, plan_id, status, payment_provider, payment_id, current_period_start, current_period_end) 
         VALUES ($1, $2, 'active', 'stripe', $3, $4, $5) 
         ON CONFLICT DO NOTHING`,
        [userId, planId, paymentIntent.id, now, periodEnd]
      );

      // Update user's plan_id
      await pool.query('UPDATE users SET plan_id = $1 WHERE id = $2', [planId, userId]);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Stripe webhook error:', error);
    res.sendStatus(500);
  }
});

// Razorpay Webhook
router.post('/razorpay', async (req, res) => {
  try {
    const { event, payload } = req.body;

    if (event === 'payment.captured') {
      const payment = payload.payment.entity;
      const orderId = payment.order_id;
      const userId = payment.notes?.user_id;
      const planId = payment.notes?.plan_id;

      // Verify payment signature
      const isValid = paymentService.verifyRazorpayPayment(
        orderId,
        payment.id,
        payment.signature
      );

      if (!isValid) {
        return res.sendStatus(400);
      }

      // Create subscription
      const now = new Date();
      const periodEnd = new Date(now);
      periodEnd.setMonth(periodEnd.getMonth() + 1);

      await pool.query(
        `INSERT INTO subscriptions 
         (user_id, plan_id, status, payment_provider, payment_id, current_period_start, current_period_end) 
         VALUES ($1, $2, 'active', 'razorpay', $3, $4, $5) 
         ON CONFLICT DO NOTHING`,
        [userId, planId, payment.id, now, periodEnd]
      );

      // Update user's plan_id
      await pool.query('UPDATE users SET plan_id = $1 WHERE id = $2', [planId, userId]);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Razorpay webhook error:', error);
    res.sendStatus(500);
  }
});

module.exports = router;

