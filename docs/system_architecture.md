# WAutoFlow System Architecture

## Overview

WAutoFlow is a global B2B SaaS application for automating WhatsApp messages using the WhatsApp Cloud API. The system is built with a modern, scalable architecture that supports multi-tenancy, payment processing, and real-time message tracking.

## Architecture Diagram

```
┌─────────────────┐
│   Next.js App   │  (Frontend)
│   (Port 3000)   │
└────────┬────────┘
         │ REST API
         │
┌────────▼────────┐
│  Express API    │  (Backend)
│   (Port 5000)   │
└────────┬────────┘
         │
    ┌────┴────┬──────────┬──────────────┐
    │         │          │              │
┌───▼───┐ ┌───▼───┐ ┌────▼────┐ ┌───────▼──────┐
│  PG   │ │WhatsApp│ │ Stripe │ │  Razorpay   │
│  DB   │ │  API   │ │   API  │ │     API     │
└───────┘ └────────┘ └─────────┘ └─────────────┘
```

## Technology Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **State Management**: React Hooks
- **HTTP Client**: Axios
- **Charts**: Recharts

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Validation**: express-validator
- **Security**: Helmet, CORS, Rate Limiting

### Integrations
- **WhatsApp**: Cloud API (Graph API)
- **Payments**: Stripe, Razorpay
- **Deployment**: Vercel (Frontend), Railway/Render/AWS (Backend)

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  plan_id INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Subscription Plans Table
```sql
CREATE TABLE subscription_plans (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  quota INTEGER NOT NULL,
  features JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### WhatsApp Accounts Table
```sql
CREATE TABLE whatsapp_accounts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  phone_number VARCHAR(20) NOT NULL,
  access_token TEXT NOT NULL,
  phone_number_id VARCHAR(100),
  business_account_id VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Templates Table
```sql
CREATE TABLE templates (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  variables JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Events/Triggers Table
```sql
CREATE TABLE events (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  template_id INTEGER REFERENCES templates(id) ON DELETE CASCADE,
  trigger_type VARCHAR(50) NOT NULL,
  webhook_url VARCHAR(500),
  conditions JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Message Logs Table
```sql
CREATE TABLE message_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  template_id INTEGER REFERENCES templates(id) ON DELETE SET NULL,
  event_id INTEGER REFERENCES events(id) ON DELETE SET NULL,
  to_number VARCHAR(20) NOT NULL,
  message_id VARCHAR(100),
  status VARCHAR(50) DEFAULT 'pending',
  delivery_status VARCHAR(50),
  read_status VARCHAR(50),
  error_message TEXT,
  sent_at TIMESTAMP,
  delivered_at TIMESTAMP,
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Subscriptions Table
```sql
CREATE TABLE subscriptions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  plan_id INTEGER REFERENCES subscription_plans(id),
  status VARCHAR(50) DEFAULT 'active',
  payment_provider VARCHAR(50),
  payment_id VARCHAR(255),
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user (protected)

### Templates
- `GET /api/templates` - Get all templates (protected)
- `POST /api/templates` - Create template (protected)
- `GET /api/templates/:id` - Get template by ID (protected)
- `PUT /api/templates/:id` - Update template (protected)
- `DELETE /api/templates/:id` - Delete template (protected)

### Events/Triggers
- `GET /api/events` - Get all events (protected)
- `POST /api/events` - Create event trigger (protected)
- `GET /api/events/:id` - Get event by ID (protected)
- `PUT /api/events/:id` - Update event (protected)
- `DELETE /api/events/:id` - Delete event (protected)
- `POST /api/events/:id/trigger` - Trigger event manually (protected)

### Messages
- `POST /api/messages/send` - Send WhatsApp message (protected)
- `GET /api/messages/logs` - Get message logs (protected)
- `GET /api/messages/analytics` - Get analytics data (protected)

### Subscriptions
- `GET /api/subscriptions/plans` - Get all plans (public)
- `GET /api/subscriptions/current` - Get current subscription (protected)
- `POST /api/subscriptions/payment-intent` - Create payment intent (protected)
- `POST /api/subscriptions/subscribe` - Subscribe to plan (protected)

### Webhooks
- `GET /api/webhooks/whatsapp` - WhatsApp webhook verification
- `POST /api/webhooks/whatsapp` - WhatsApp webhook handler
- `POST /api/webhooks/stripe` - Stripe webhook handler
- `POST /api/webhooks/razorpay` - Razorpay webhook handler

## Authentication Flow

1. User signs up/logs in via `/api/auth/signup` or `/api/auth/login`
2. Backend validates credentials and returns JWT token
3. Frontend stores token in HTTP-only cookie or localStorage
4. All subsequent requests include token in `Authorization: Bearer <token>` header
5. Backend middleware validates token on protected routes

## Message Sending Flow

1. User creates template with variables (e.g., `{{name}}`, `{{order_id}}`)
2. User creates event trigger linked to template
3. Event can be triggered via:
   - Webhook (external system calls webhook URL)
   - Scheduled (cron job or scheduler)
   - Manual (user triggers via UI)
4. System replaces template variables with actual values
5. System sends message via WhatsApp Cloud API
6. System logs message status and updates delivery/read status via webhooks

## Payment Flow

### Stripe
1. User selects plan and payment provider (Stripe)
2. Frontend calls `/api/subscriptions/payment-intent`
3. Backend creates Stripe PaymentIntent
4. Frontend uses Stripe.js to collect payment
5. Stripe sends webhook to `/api/webhooks/stripe` on success
6. Backend creates subscription record

### Razorpay
1. User selects plan and payment provider (Razorpay)
2. Frontend calls `/api/subscriptions/payment-intent`
3. Backend creates Razorpay order
4. Frontend uses Razorpay checkout
5. Razorpay sends webhook to `/api/webhooks/razorpay` on success
6. Backend verifies signature and creates subscription record

## Security Measures

1. **Authentication**: JWT tokens with expiration
2. **Password Security**: bcrypt hashing (10 rounds)
3. **Input Validation**: express-validator on all inputs
4. **Rate Limiting**: 100 requests per 15 minutes per IP
5. **CORS**: Configured for specific frontend origin
6. **Helmet**: Security headers
7. **SQL Injection Prevention**: Parameterized queries (pg library)
8. **XSS Prevention**: Input sanitization and React's built-in protection

## Scalability Considerations

1. **Database Indexing**: Indexes on foreign keys and frequently queried columns
2. **Connection Pooling**: PostgreSQL connection pool
3. **Stateless API**: JWT tokens enable horizontal scaling
4. **Caching**: Can add Redis for frequently accessed data
5. **Queue System**: Can add message queue (Bull/BullMQ) for async message sending
6. **CDN**: Static assets served via CDN
7. **Load Balancing**: Multiple backend instances behind load balancer

## Deployment

### Frontend (Vercel)
1. Connect GitHub repository
2. Set environment variable: `NEXT_PUBLIC_API_URL`
3. Deploy automatically on push

### Backend (Railway/Render/AWS)
1. Connect GitHub repository
2. Set environment variables (see `.env.example`)
3. Run migrations: `npm run migrate`
4. Start server: `npm start`

### Database (PostgreSQL)
- Managed service: Railway PostgreSQL, Render PostgreSQL, AWS RDS
- Or self-hosted PostgreSQL instance

## Monitoring & Logging

1. **Application Logs**: Morgan middleware for HTTP logging
2. **Error Tracking**: Can integrate Sentry
3. **Analytics**: Built-in analytics endpoints
4. **Health Checks**: `/health` endpoint

## Future Enhancements

1. **Multi-language Templates**: Support for multiple languages
2. **Scheduled Messages**: Cron-based scheduling
3. **Message Queue**: Async processing with Bull/BullMQ
4. **Real-time Updates**: WebSocket for live status updates
5. **Template Approval**: WhatsApp template approval workflow
6. **Team Management**: Multi-user accounts with roles
7. **API Keys**: Allow users to generate API keys for integrations
8. **Webhook Signatures**: Verify webhook authenticity

## GDPR & Privacy Compliance

1. **Data Encryption**: Passwords hashed, sensitive data encrypted
2. **User Data Export**: Users can export their data
3. **Data Deletion**: Users can delete their accounts and data
4. **Opt-in Messaging**: Only send to opted-in recipients
5. **Privacy Policy**: Required for production
6. **Terms of Service**: Required for production

