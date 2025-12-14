# Environment Setup Instructions

## Step 1: Create Backend .env File

Create a file named `.env` in the `backend` folder with the following content:

```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/wautoflow
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars
JWT_EXPIRES_IN=7d

# WhatsApp Cloud API (optional for now)
WHATSAPP_API_URL=https://graph.facebook.com/v18.0
WHATSAPP_PHONE_NUMBER_ID=your-phone-number-id
WHATSAPP_ACCESS_TOKEN=your-access-token
WHATSAPP_VERIFY_TOKEN=your-verify-token

# Stripe (optional for now)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Razorpay (optional for now)
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

**Important:** Update the `DATABASE_URL` with your PostgreSQL credentials:
- Replace `postgres:postgres` with your PostgreSQL username:password
- If your PostgreSQL is on a different port, update `5432`
- If your database name is different, update `wautoflow`

## Step 2: Create Frontend .env.local File

Create a file named `.env.local` in the `frontend` folder with:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## Step 3: Set Up PostgreSQL Database

If you don't have PostgreSQL installed:
1. Download from: https://www.postgresql.org/download/windows/
2. Install PostgreSQL
3. Remember your password during installation

Create the database:
```sql
-- Open psql or pgAdmin and run:
CREATE DATABASE wautoflow;
```

Or use command line (if psql is in PATH):
```bash
createdb wautoflow
```

## Step 4: Run Migrations

After creating the `.env` file with correct database credentials:

```bash
cd backend
npm run migrate
```

## Step 5: Start Servers

Terminal 1 - Backend:
```bash
cd backend
npm run dev
```

Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
```

Then open: http://localhost:3000

