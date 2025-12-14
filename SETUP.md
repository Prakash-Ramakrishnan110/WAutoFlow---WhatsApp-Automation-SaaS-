# WAutoFlow Setup Guide

## Quick Start

### 1. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:

```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://user:password@localhost:5432/wautoflow
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# WhatsApp Cloud API
WHATSAPP_API_URL=https://graph.facebook.com/v18.0
WHATSAPP_PHONE_NUMBER_ID=your-phone-number-id
WHATSAPP_ACCESS_TOKEN=your-access-token
WHATSAPP_VERIFY_TOKEN=your-verify-token

# Stripe
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Razorpay
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

Set up PostgreSQL database:

```bash
# Create database
createdb wautoflow

# Or using psql
psql -U postgres
CREATE DATABASE wautoflow;
```

Run migrations:

```bash
npm run migrate
```

Start the backend:

```bash
npm run dev
```

Backend will run on `http://localhost:5000`

### 2. Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env.local` file in the `frontend` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Start the frontend:

```bash
npm run dev
```

Frontend will run on `http://localhost:3000`

## Getting WhatsApp Cloud API Credentials

1. Go to [Meta for Developers](https://developers.facebook.com/)
2. Create a new app or use an existing one
3. Add "WhatsApp" product to your app
4. Get your:
   - Phone Number ID
   - Access Token (temporary or permanent)
   - Verify Token (for webhook verification)

## Getting Payment Credentials

### Stripe

1. Sign up at [Stripe](https://stripe.com)
2. Get your API keys from the Dashboard
3. Set up webhook endpoint: `https://your-domain.com/api/webhooks/stripe`

### Razorpay

1. Sign up at [Razorpay](https://razorpay.com)
2. Get your Key ID and Key Secret from the Dashboard
3. Set up webhook endpoint: `https://your-domain.com/api/webhooks/razorpay`

## Testing the Application

1. Start both backend and frontend servers
2. Navigate to `http://localhost:3000`
3. Sign up for a new account
4. Create a template with variables (e.g., `Hello {{name}}, your order {{order_id}} is ready!`)
5. Create an event trigger
6. Send a test message

## Production Deployment

### Backend (Railway/Render)

1. Push code to GitHub
2. Connect repository to Railway/Render
3. Add environment variables
4. Deploy

### Frontend (Vercel)

1. Push code to GitHub
2. Import project to Vercel
3. Set `NEXT_PUBLIC_API_URL` to your backend URL
4. Deploy

## Troubleshooting

### Database Connection Issues

- Check PostgreSQL is running
- Verify DATABASE_URL in `.env`
- Ensure database exists

### WhatsApp API Errors

- Verify access token is valid
- Check phone number ID is correct
- Ensure webhook URL is accessible

### Payment Issues

- Use test keys for development
- Verify webhook endpoints are accessible
- Check payment provider logs
