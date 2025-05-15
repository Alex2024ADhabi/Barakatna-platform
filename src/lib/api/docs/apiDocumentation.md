# Barakatna Platform API Documentation

## Overview

The Barakatna Platform API provides a comprehensive set of endpoints for managing healthcare services for senior citizens, including assessment management, project management, procurement, committee approvals, and financial management.

## Base URL

```
https://api.barakatna.org/v1
```

## Authentication

All API requests require authentication using a JWT token. Include the token in the `Authorization` header:

```
Authorization: Bearer YOUR_TOKEN
```

To obtain a token, use the authentication endpoints described below.

### Authentication Endpoints

#### POST /auth/login

Authenticate a user and receive a JWT token.

**Request:**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user-001",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "roles": ["admin"]
    }
  }
}
```

## API Versioning

The API uses versioning to ensure backward compatibility. Specify the API version using the `X-API-Version` header:

```
X-API-Version: v1
```

Available versions: `v1`, `v2`, `v3`

## Error Handling

Errors are returned with appropriate HTTP status codes and a consistent JSON structure:

```json
{
  "success": false,
  "error": "User-friendly error message",
  "meta": {
    "errorDetails": {
      "code": "VALIDATION_ERROR",
      "category": "validation",
      "severity": "warning",
      "field": "email",
      "details": { "additionalInfo": "value" },
      "retryable": false,
      "helpLink": "/help/validation-errors",
      "timestamp": "2023-06-15T10:30:00Z"
    }
  }
}
```

### Common Error Codes

| Code | Description |
|------|-------------|
| BAD_REQUEST | Invalid request parameters |
| UNAUTHORIZED | Authentication required |
| FORBIDDEN | Insufficient permissions |
| NOT_FOUND | Resource not found |
| CONFLICT | Resource conflict |
| INTERNAL_SERVER_ERROR | Server error |
| SERVICE_UNAVAILABLE | Service temporarily unavailable |
| VALIDATION_ERROR | Input validation failed |
| NETWORK_ERROR | Network connectivity issue |
| OFFLINE_ERROR | Operation attempted while offline |

## Rate Limiting

API requests are subject to rate limiting to ensure fair usage. The following headers are included in API responses:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1623760800
```

If you exceed the rate limit, you'll receive a `429 Too Many Requests` response.

## Pagination

Endpoints that return collections support pagination using the following query parameters:

- `page`: Page number (default: 1)
- `pageSize`: Number of items per page (default: 10, max: 100)
- `sortBy`: Field to sort by
- `sortDirection`: Sort direction (`asc` or `desc`)

Paginated responses include metadata:

```json
{
  "success": true,
  "data": [...],
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 10,
      "total": 42,
      "totalPages": 5
    }
  }
}
```

## Modules

### Assessment Module

#### GET /assessments

Retrieve a list of assessments.

**Query Parameters:**

- `page`: Page number
- `pageSize`: Items per page
- `sortBy`: Field to sort by
- `sortDirection`: Sort direction
- `status`: Filter by status
- `beneficiaryId`: Filter by beneficiary
- `fromDate`: Filter by date range start
- `toDate`: Filter by date range end

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "assess-001",
      "title": "Bathroom Modification Assessment",
      "beneficiaryId": "ben-12345",
      "status": "completed",
      "createdAt": "2023-06-01T10:00:00Z",
      "completedDate": "2023-06-05T14:30:00Z"
    }
  ],
  "meta": {
    "pagination": {
      "page": 1,
      "pageSize": 10,
      "total": 42,
      "totalPages": 5
    }
  }
}
```

#### GET /assessments/:id

Retrieve a specific assessment by ID.

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "assess-001",
    "title": "Bathroom Modification Assessment",
    "description": "Assessment for installing grab bars and shower seat",
    "beneficiaryId": "ben-12345",
    "status": "completed",
    "createdAt": "2023-06-01T10:00:00Z",
    "completedDate": "2023-06-05T14:30:00Z",
    "rooms": [
      {
        "id": "room-001",
        "name": "Bathroom",
        "measurements": {
          "length": 3.5,
          "width": 2.8,
          "height": 2.4
        },
        "modifications": [
          {
            "id": "mod-001",
            "type": "grab_bar",
            "description": "Install grab bar next to toilet",
            "cost": 250
          }
        ]
      }
    ],
    "totalCost": 1500
  }
}
```

#### POST /assessments

Create a new assessment.

**Request:**

```json
{
  "title": "Kitchen Modification Assessment",
  "description": "Assessment for lowering countertops",
  "beneficiaryId": "ben-67890",
  "rooms": [
    {
      "name": "Kitchen",
      "measurements": {
        "length": 4.2,
        "width": 3.5,
        "height": 2.4
      }
    }
  ]
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "assess-002",
    "title": "Kitchen Modification Assessment",
    "description": "Assessment for lowering countertops",
    "beneficiaryId": "ben-67890",
    "status": "draft",
    "createdAt": "2023-06-10T09:15:00Z",
    "rooms": [
      {
        "id": "room-002",
        "name": "Kitchen",
        "measurements": {
          "length": 4.2,
          "width": 3.5,
          "height": 2.4
        },
        "modifications": []
      }
    ],
    "totalCost": 0
  }
}
```

### Committee Module

#### GET /committees

Retrieve a list of committees.

**Response:**

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "committee-001",
        "name": "Assessment Review Committee",
        "description": "Reviews and approves assessment recommendations",
        "members": 5,
        "createdAt": "2023-01-15T08:00:00Z"
      }
    ],
    "total": 3
  }
}
```

#### POST /committees/:id/decisions

Submit a committee decision.

**Request:**

```json
{
  "submissionId": "assess-001",
  "status": "approved",
  "comments": "Approved with minor modifications",
  "conditions": ["Reduce cost by 10%", "Use standard materials"],
  "followUpDate": "2023-07-15T00:00:00Z"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "dec-12345",
    "committeeId": "committee-001",
    "meetingId": "meeting-001",
    "assessmentId": "assess-001",
    "title": "Committee Decision",
    "description": "Approved with minor modifications",
    "decision": "approved",
    "decisionDate": "2023-06-15T14:30:00Z",
    "rationale": "Approved with minor modifications",
    "conditions": "Reduce cost by 10%, Use standard materials",
    "votesFor": 3,
    "votesAgainst": 1,
    "votesAbstain": 0,
    "nextReviewDate": "2023-07-15T00:00:00Z"
  }
}
```

## Webhooks

The API supports webhooks for real-time notifications. Configure webhooks in the developer portal.

### Webhook Events

- `assessment.created`
- `assessment.updated`
- `assessment.completed`
- `committee.decision`
- `project.created`
- `project.updated`
- `project.completed`

### Webhook Payload

```json
{
  "id": "evt-12345",
  "type": "assessment.completed",
  "timestamp": "2023-06-05T14:30:00Z",
  "data": {
    "assessmentId": "assess-001",
    "beneficiaryId": "ben-12345",
    "status": "completed",
    "totalCost": 1500
  },
  "signature": "sha256=..."
}
```

## Migration Guides

### Migrating from v1 to v2

#### Breaking Changes

1. The `/beneficiaries/:id/legacy` endpoint has been deprecated and will be removed in v3. Use `/beneficiaries/:id` instead.

2. The assessment response format has changed:

   **v1:**
   ```json
   {
     "rooms": [
       {
         "modifications": [{ "type": "grab_bar" }]
       }
     ]
   }
   ```

   **v2:**
   ```json
   {
     "rooms": [
       {
         "modifications": [{ "modificationType": "grab_bar" }]
       }
     ]
   }
   ```

3. Authentication now requires the `X-Client-ID` header in addition to the JWT token.

#### New Features

1. Batch operations are now supported via the `/assessments/batch` endpoint.

2. Real-time updates are available through WebSocket connections.

## SDKs and Client Libraries

- [JavaScript SDK](https://github.com/barakatna/js-sdk)
- [Python SDK](https://github.com/barakatna/python-sdk)
- [Mobile SDK (iOS/Android)](https://github.com/barakatna/mobile-sdk)

## Support

For API support, contact api-support@barakatna.org or visit the [Developer Portal](https://developers.barakatna.org).
