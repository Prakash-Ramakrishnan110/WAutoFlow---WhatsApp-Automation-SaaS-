const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Razorpay = require('razorpay');

class PaymentService {
  constructor() {
    this.stripe = stripe;
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });
  }

  /**
   * Create Stripe payment intent
   */
  async createStripePaymentIntent(amount, currency, metadata = {}) {
    try {
      const paymentIntent = await this.stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: currency.toLowerCase(),
        metadata
      });

      return {
        success: true,
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      };
    } catch (error) {
      console.error('Stripe Error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Create Razorpay order
   */
  async createRazorpayOrder(amount, currency, receipt, notes = {}) {
    try {
      const order = await this.razorpay.orders.create({
        amount: Math.round(amount * 100), // Convert to paise
        currency: currency.toUpperCase(),
        receipt: receipt,
        notes
      });

      return {
        success: true,
        orderId: order.id,
        amount: order.amount,
        currency: order.currency
      };
    } catch (error) {
      console.error('Razorpay Error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Verify Stripe webhook signature
   */
  verifyStripeWebhook(payload, signature) {
    try {
      return this.stripe.webhooks.constructEvent(
        payload,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (error) {
      console.error('Stripe webhook verification error:', error);
      return null;
    }
  }

  /**
   * Verify Razorpay payment signature
   */
  verifyRazorpayPayment(orderId, paymentId, signature) {
    const crypto = require('crypto');
    const text = orderId + '|' + paymentId;
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(text)
      .digest('hex');

    return generatedSignature === signature;
  }
}

module.exports = new PaymentService();

