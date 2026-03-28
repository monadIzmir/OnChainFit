# PrintChain API Documentation

## Overview

PrintChain is a decentralized print-on-demand platform with automatic designer royalty distribution enabled by blockchain technology.

**API Base URL**: `http://localhost:3001/api`

**Authentication**: JWT Bearer token in `Authorization` header

---

## Authentication Endpoints

### Register

Create a new user account.

```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123",
  "role": "CUSTOMER" | "DESIGNER" | "BRAND"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "role": "CUSTOMER",
      "kybStatus": "PENDING"
    },
    "accessToken": "eyJhbGc..."
  }
}
```

### Login

Authenticate with email and password.

```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "role": "CUSTOMER"
    },
    "accessToken": "eyJhbGc..."
  }
}
```

---

## Products Endpoints (Brand Only)

### Create Product

Upload a product template for designers to work with.

```http
POST /products
Authorization: Bearer {token}
Content-Type: multipart/form-data

{
  "name": "Classic T-Shirt",
  "category": "T-Shirt",
  "basePrice": 15.99,
  "printZone": {
    "x": 100,
    "y": 100,
    "width": 400,
    "height": 300
  },
  "image": <binary>
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Classic T-Shirt",
    "category": "T-Shirt",
    "basePrice": 15.99,
    "imageUrl": "https://r2.example.com/products/...",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

### Get Products

Retrieve all product templates (paginated).

```http
GET /products?skip=0&take=20
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Classic T-Shirt",
      "category": "T-Shirt",
      "basePrice": 15.99,
      "imageUrl": "https://r2.example.com/products/..."
    }
  ]
}
```

---

## Designs Endpoints

### Create Design

Upload and register a new design with IPFS and blockchain.

```http
POST /designs
Authorization: Bearer {token}
Content-Type: multipart/form-data

{
  "title": "Awesome Design",
  "productId": "uuid",
  "salePrice": 25.99,
  "image": <binary>,
  "canvasData": "{...fabric.js json...}"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Awesome Design",
    "status": "DRAFT",
    "ipfsHash": "QmXxx...",
    "previewUrl": "https://r2.example.com/designs/preview/...",
    "blockchainTxHash": "0x...",
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

### Get My Designs

Retrieve all designs created by the authenticated designer.

```http
GET /designs/mine?skip=0&take=20
Authorization: Bearer {token}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "title": "Awesome Design",
      "status": "PUBLISHED",
      "salePrice": 25.99,
      "previewUrl": "...",
      "totalSalesCount": 42,
      "totalEarnings": 1089.58
    }
  ]
}
```

### Publish Design

Publish a design to make it available for purchase.

```http
PUT /designs/{designId}/publish
Authorization: Bearer {token}
```

### Update Design Price

Update the sale price of a published design.

```http
PUT /designs/{designId}/price
Authorization: Bearer {token}
Content-Type: application/json

{
  "salePrice": 29.99
}
```

---

## Orders Endpoints

### Create Order

Place an order with selected designs.

```http
POST /orders
Authorization: Bearer {token}
Content-Type: application/json

{
  "items": [
    {
      "designId": "uuid",
      "quantity": 2
    }
  ],
  "shippingAddress": "123 Main St",
  "shippingCity": "Istanbul",
  "shippingZip": "34000"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "PENDING",
    "totalAmount": 51.98,
    "items": [
      {
        "designId": "uuid",
        "quantity": 2,
        "price": 25.99
      }
    ],
    "createdAt": "2024-01-15T10:30:00Z"
  }
}
```

### Get My Orders

Retrieve all orders placed by the authenticated customer.

```http
GET /orders/mine?skip=0&take=10
Authorization: Bearer {token}
```

### Get Order Details

Retrieve details of a specific order.

```http
GET /orders/{orderId}
Authorization: Bearer {token}
```

### Cancel Order

Cancel a pending order.

```http
POST /orders/{orderId}/cancel
Authorization: Bearer {token}
```

---

## Payments Endpoints

### Create Stripe Payment Intent

Initiate a Stripe payment for an order.

```http
POST /payments/stripe/intent
Authorization: Bearer {token}
Content-Type: application/json

{
  "orderId": "uuid",
  "amount": 5198
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "clientSecret": "pi_xxx_secret_xxx",
    "orderId": "uuid"
  }
}
```

### Stripe Webhook

Handle Stripe webhook events (configure in Stripe dashboard).

```http
POST /payments/stripe/webhook
Content-Type: application/json
Stripe-Signature: {signature}

{
  "type": "payment_intent.succeeded",
  "data": {...}
}
```

### Verify MONAD Payment

Verify a blockchain MONAD token payment.

```http
POST /payments/monad/verify
Authorization: Bearer {token}
Content-Type: application/json

{
  "orderId": "uuid",
  "transactionHash": "0x...",
  "amount": 5198
}
```

---

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "error": {
    "code": "DESIGN_NOT_FOUND",
    "message": "The requested design does not exist",
    "statusCode": 404,
    "details": {}
  }
}
```

### Common Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `UNAUTHORIZED` | 401 | Authentication required or invalid token |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Invalid request data |
| `DESIGN_NOT_FOUND` | 404 | Design does not exist |
| `PRICE_BELOW_BASE` | 400 | Sale price below product base price |
| `ORDER_STATUS_INVALID` | 400 | Invalid order status transition |
| `PAYMENT_FAILED` | 402 | Payment processing failed |
| `INSUFFICIENT_BALANCE` | 402 | Insufficient funds for MONAD payment |

---

## Rate Limiting

API endpoints are rate-limited per user:
- **Standard endpoints**: 100 requests/minute
- **Upload endpoints**: 10 requests/minute
- **Payment endpoints**: 5 requests/minute

Rate limit headers in response:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1705342200
```

---

## Pagination

List endpoints support pagination with `skip` and `take` parameters:

```http
GET /designs?skip=0&take=20
```

**Response:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "skip": 0,
    "take": 20,
    "total": 1245
  }
}
```

---

## Versioning

Current API version: `v1`

All requests should be made to `/api/v1/` endpoints (currently not enforced).

---

## Support

For API support:
- GitHub Issues: https://github.com/monadIzmir/OnChainFit/issues
- Email: support@printchain.io
