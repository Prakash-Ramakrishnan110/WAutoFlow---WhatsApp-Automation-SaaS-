const pool = require('../config/db');
const paymentService = require('../services/payment');

const getAllPlans = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM subscription_plans ORDER BY price ASC'
    );

    res.json({ plans: result.rows });
  } catch (error) {
    console.error('Get plans error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getCurrentSubscription = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT s.*, sp.name as plan_name, sp.price, sp.quota, sp.features 
       FROM subscriptions s 
       JOIN subscription_plans sp ON s.plan_id = sp.id 
       WHERE s.user_id = $1 AND s.status = 'active' 
       ORDER BY s.created_at DESC 
       LIMIT 1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      // Return free plan as default
      const freePlan = await pool.query(
        'SELECT * FROM subscription_plans WHERE name = $1',
        ['Free']
      );
      return res.json({ 
        subscription: null, 
        plan: freePlan.rows[0] || null 
      });
    }

    res.json({ subscription: result.rows[0] });
  } catch (error) {
    console.error('Get subscription error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const createPaymentIntent = async (req, res) => {
  try {
    const { plan_id, provider } = req.body;

    // Get plan
    const planResult = await pool.query(
      'SELECT * FROM subscription_plans WHERE id = $1',
      [plan_id]
    );

    if (planResult.rows.length === 0) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    const plan = planResult.rows[0];

    if (provider === 'stripe') {
      const paymentResult = await paymentService.createStripePaymentIntent(
        parseFloat(plan.price),
        plan.currency || 'USD',
        {
          user_id: req.user.id.toString(),
          plan_id: plan_id.toString()
        }
      );

      if (!paymentResult.success) {
        return res.status(400).json({ error: paymentResult.error });
      }

      res.json({
        provider: 'stripe',
        clientSecret: paymentResult.clientSecret,
        paymentIntentId: paymentResult.paymentIntentId
      });
    } else if (provider === 'razorpay') {
      const paymentResult = await paymentService.createRazorpayOrder(
        parseFloat(plan.price),
        plan.currency || 'INR',
        `sub_${req.user.id}_${Date.now()}`,
        {
          user_id: req.user.id.toString(),
          plan_id: plan_id.toString()
        }
      );

      if (!paymentResult.success) {
        return res.status(400).json({ error: paymentResult.error });
      }

      res.json({
        provider: 'razorpay',
        orderId: paymentResult.orderId,
        amount: paymentResult.amount,
        currency: paymentResult.currency
      });
    } else {
      return res.status(400).json({ error: 'Invalid payment provider' });
    }
  } catch (error) {
    console.error('Create payment intent error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const subscribe = async (req, res) => {
  try {
    const { plan_id, payment_provider, payment_id } = req.body;

    // Get plan
    const planResult = await pool.query(
      'SELECT * FROM subscription_plans WHERE id = $1',
      [plan_id]
    );

    if (planResult.rows.length === 0) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    // Deactivate existing subscriptions
    await pool.query(
      "UPDATE subscriptions SET status = 'cancelled' WHERE user_id = $1 AND status = 'active'",
      [req.user.id]
    );

    // Create new subscription
    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setMonth(periodEnd.getMonth() + 1);

    const result = await pool.query(
      `INSERT INTO subscriptions 
       (user_id, plan_id, status, payment_provider, payment_id, current_period_start, current_period_end) 
       VALUES ($1, $2, 'active', $3, $4, $5, $6) 
       RETURNING *`,
      [req.user.id, plan_id, payment_provider, payment_id, now, periodEnd]
    );

    // Update user's plan_id
    await pool.query(
      'UPDATE users SET plan_id = $1 WHERE id = $2',
      [plan_id, req.user.id]
    );

    res.status(201).json({ subscription: result.rows[0] });
  } catch (error) {
    console.error('Subscribe error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getAllPlans,
  getCurrentSubscription,
  createPaymentIntent,
  subscribe
};

