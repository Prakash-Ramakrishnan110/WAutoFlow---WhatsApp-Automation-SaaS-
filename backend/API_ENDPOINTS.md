# WAutoFlow Backend API Endpoints

## Base URL
```
http://localhost:5000
```

## Health Check
```
GET /health
```
Response: `{"status":"ok","timestamp":"..."}`

## Authentication Endpoints

### Sign Up
```
POST /api/auth/signup
Body: {
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

### Login
```
POST /api/auth/login
Body: {
  "email": "john@example.com",
  "password": "password123"
}
```

### Get Current User
```
GET /api/auth/me
Headers: Authorization: Bearer <token>
```

## Template Endpoints

### Get All Templates
```
GET /api/templates
Headers: Authorization: Bearer <token>
```

### Create Template
```
POST /api/templates
Headers: Authorization: Bearer <token>
Body: {
  "name": "Order Confirmation",
  "content": "Hello {{name}}, your order {{order_id}} is ready!"
}
```

### Get Template by ID
```
GET /api/templates/:id
Headers: Authorization: Bearer <token>
```

### Update Template
```
PUT /api/templates/:id
Headers: Authorization: Bearer <token>
Body: {
  "name": "Updated Name",
  "content": "Updated content"
}
```

### Delete Template
```
DELETE /api/templates/:id
Headers: Authorization: Bearer <token>
```

## Event/Trigger Endpoints

### Get All Events
```
GET /api/events
Headers: Authorization: Bearer <token>
```

### Create Event
```
POST /api/events
Headers: Authorization: Bearer <token>
Body: {
  "template_id": 1,
  "trigger_type": "webhook",
  "webhook_url": "https://example.com/webhook"
}
```

## Message Endpoints

### Send Message
```
POST /api/messages/send
Headers: Authorization: Bearer <token>
Body: {
  "template_id": 1,
  "to_number": "+1234567890",
  "variables": {
    "name": "John",
    "order_id": "12345"
  }
}
```

### Get Message Logs
```
GET /api/messages/logs?page=1&limit=50
Headers: Authorization: Bearer <token>
```

### Get Analytics
```
GET /api/messages/analytics?start_date=2024-01-01&end_date=2024-12-31
Headers: Authorization: Bearer <token>
```

## Subscription Endpoints

### Get All Plans
```
GET /api/subscriptions/plans
```

### Get Current Subscription
```
GET /api/subscriptions/current
Headers: Authorization: Bearer <token>
```

### Create Payment Intent
```
POST /api/subscriptions/payment-intent
Headers: Authorization: Bearer <token>
Body: {
  "plan_id": 2,
  "provider": "stripe"
}
```

## Testing with Browser

1. **Health Check**: Open http://localhost:5000/health
2. **Get Plans**: Open http://localhost:5000/api/subscriptions/plans

## Testing with Postman/Thunder Client

1. Import the endpoints above
2. For protected routes, get a token from `/api/auth/login` first
3. Add token to headers: `Authorization: Bearer <your-token>`

