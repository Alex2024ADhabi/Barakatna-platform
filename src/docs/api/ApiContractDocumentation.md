# API Contract Documentation

## Overview

This document provides comprehensive documentation for the Barakatna Platform API, including endpoint definitions, authentication requirements, error handling, and integration patterns. The Barakatna Platform API follows RESTful principles and uses JSON for data exchange.

## API Versioning Strategy

The Barakatna Platform API uses a versioning strategy to ensure backward compatibility as new features are added and existing ones are modified.

### Version Header

All API requests should include the API version in the `X-API-Version` header:

```
X-API-Version: v1
```

If no version is specified, the latest stable version will be used.

### Deprecation Notices

When an endpoint is deprecated, the response will include deprecation notices in the headers:

```
X-API-Deprecated: true
X-API-Deprecation-Date: 2023-12-31
X-API-Sunset-Date: 2024-06-30
X-API-Alternative-Endpoint: /v2/resource
```

Deprecated endpoints will continue to function until the sunset date, after which they will return a 410 Gone status code.

### Migration Guides

Detailed migration guides are available for transitioning between API versions:

- [v1 to v2 Migration Guide](https://docs.barakatna.org/api/migration-guides/v1-to-v2)

### Feature Flags

The API supports feature flags for incremental updates. To check available features:

```http
GET /api/features
Authorization: Bearer {token}
```

Response:

```json
{
  "success": true,
  "data": {
    "features": [
      {
        "name": "room_3d_visualization",
        "enabled": true,
        "description": "3D visualization of room assessments",
        "version": "v1"
      },
      {
        "name": "ai_recommendations",
        "enabled": false,
        "description": "AI-powered modification recommendations",
        "version": "v2"
      }
    ]
  }
}
```

## Authentication and Authorization

### Authentication Methods

The API supports JWT (JSON Web Token) authentication:

```
Authorization: Bearer {token}
```

### Obtaining a Token

To obtain a token, make a POST request to the `/auth/login` endpoint:

```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "your_password"
}
```

Response:

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 3600,
    "user": {
      "id": "user-123",
      "name": "John Doe",
      "email": "user@example.com",
      "role": "healthcare_provider"
    }
  }
}
```

### Token Refresh

To refresh an expired token:

```http
POST /auth/refresh
Content-Type: application/json
Authorization: Bearer {expired_token}

{
  "refreshToken": "refresh_token_value"
}
```

### Role-Based Access Control

The API implements role-based access control with the following roles:

- `admin`: Full access to all resources
- `healthcare_provider`: Access to assessments and beneficiary data
- `project_manager`: Access to project management features
- `procurement_officer`: Access to procurement features
- `committee_member`: Access to committee-related features
- `financial_officer`: Access to financial features

## Standard Response Format

### Success Response

```json
{
  "success": true,
  "data": { ... },
  "meta": { ... }
}
```

### Error Response

```json
{
  "success": false,
  "error": "Error message",
  "meta": {
    "errorDetails": {
      "code": "ERROR_CODE",
      "category": "validation|authentication|resource|business|network|system",
      "severity": "error|warning|info",
      "field": "field_name",
      "details": { ... },
      "retryable": false,
      "helpLink": "https://docs.example.com/errors/ERROR_CODE",
      "timestamp": "2023-06-15T10:30:00Z"
    }
  }
}
```

## Pagination

Endpoints that return collections support pagination using the following query parameters:

- `page`: Page number (default: 1)
- `limit`: Number of items per page (default: 20, max: 100)
- `sortBy`: Field to sort by
- `sortOrder`: Sort direction (`asc` or `desc`)

Example:

```
GET /assessments?page=2&limit=10&sortBy=createdAt&sortOrder=desc
```

Paginated responses include metadata:

```json
{
  "success": true,
  "data": [ ... ],
  "meta": {
    "pagination": {
      "currentPage": 2,
      "pageSize": 10,
      "totalPages": 5,
      "totalItems": 48,
      "hasNextPage": true,
      "hasPrevPage": true
    }
  }
}
```

## Rate Limiting

The API implements rate limiting to prevent abuse. Limits are applied per API key or IP address.

Rate limit headers are included in all responses:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1623760800
```

When the rate limit is exceeded, the API returns a 429 Too Many Requests response.

## Error Codes

| HTTP Status | Error Code | Description |
|------------|------------|-------------|
| 400 | BAD_REQUEST | The request was malformed or contained invalid parameters |
| 401 | UNAUTHORIZED | Authentication is required or failed |
| 403 | FORBIDDEN | The authenticated user doesn't have permission |
| 404 | NOT_FOUND | The requested resource was not found |
| 409 | CONFLICT | The request conflicts with the current state |
| 422 | VALIDATION_ERROR | The request data failed validation |
| 429 | RATE_LIMIT_EXCEEDED | Too many requests in a given time period |
| 500 | INTERNAL_SERVER_ERROR | An unexpected error occurred on the server |
| 503 | SERVICE_UNAVAILABLE | The service is temporarily unavailable |

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /auth/login | Authenticate user and get token |
| POST | /auth/logout | Invalidate the current token |
| POST | /auth/refresh | Refresh an expired token |
| POST | /auth/register | Register a new user |
| POST | /auth/forgot-password | Request password reset |
| POST | /auth/reset-password | Reset password with token |
| POST | /auth/verify-email | Verify email address |
| GET | /auth/me | Get current user profile |
| POST | /auth/mfa/setup | Set up multi-factor authentication |
| POST | /auth/mfa/verify | Verify MFA code |

### Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /users | List users |
| GET | /users/:id | Get user details |
| POST | /users | Create a new user |
| PUT | /users/:id | Update a user |
| DELETE | /users/:id | Delete a user |
| GET | /users/profile | Get current user profile |
| PUT | /users/profile | Update current user profile |

### Beneficiaries

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /beneficiaries | List beneficiaries |
| GET | /beneficiaries/:id | Get beneficiary details |
| POST | /beneficiaries | Create a new beneficiary |
| PUT | /beneficiaries/:id | Update a beneficiary |
| DELETE | /beneficiaries/:id | Delete a beneficiary |

### Assessments

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /assessments | List assessments |
| GET | /assessments/:id | Get assessment details |
| POST | /assessments | Create a new assessment |
| PUT | /assessments/:id | Update an assessment |
| DELETE | /assessments/:id | Delete an assessment |
| GET | /assessments/:id/rooms | List rooms in an assessment |
| POST | /assessments/:id/rooms | Add a room to an assessment |
| PUT | /assessments/:id/rooms/:roomId | Update a room in an assessment |
| DELETE | /assessments/:id/rooms/:roomId | Remove a room from an assessment |

### Committees

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /committees | List committees |
| GET | /committees/:id | Get committee details |
| POST | /committees | Create a new committee |
| PUT | /committees/:id | Update a committee |
| DELETE | /committees/:id | Delete a committee |
| GET | /committees/:id/meetings | List committee meetings |
| POST | /committees/:id/meetings | Create a committee meeting |
| GET | /committees/:id/submissions | List committee submissions |
| POST | /committees/:id/submissions | Create a committee submission |
| POST | /committees/:id/decisions | Submit a committee decision |

### Projects

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /projects | List projects |
| GET | /projects/:id | Get project details |
| POST | /projects | Create a new project |
| PUT | /projects/:id | Update a project |
| DELETE | /projects/:id | Delete a project |
| GET | /projects/:id/tasks | List tasks in a project |
| POST | /projects/:id/tasks | Create a task in a project |
| PUT | /projects/:id/tasks/:taskId | Update a task in a project |
| DELETE | /projects/:id/tasks/:taskId | Delete a task from a project |

## Example Requests and Responses

### Create an Assessment

**Request:**

```http
POST /assessments
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

{
  "beneficiaryId": "ben-12345",
  "clientId": "client-001",
  "assessmentType": "home_modification",
  "priority": "high",
  "notes": "Initial assessment for bathroom modifications",
  "scheduledDate": "2023-07-15T09:00:00Z",
  "assignedTo": "user-456"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "assess-789",
    "beneficiaryId": "ben-12345",
    "clientId": "client-001",
    "assessmentType": "home_modification",
    "priority": "high",
    "status": "scheduled",
    "notes": "Initial assessment for bathroom modifications",
    "scheduledDate": "2023-07-15T09:00:00Z",
    "assignedTo": "user-456",
    "createdAt": "2023-06-15T10:30:00Z",
    "updatedAt": "2023-06-15T10:30:00Z"
  }
}
```

### Submit a Committee Decision

**Request:**

```http
POST /committees/com-001/decisions
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

{
  "submissionId": "sub-123",
  "decision": "approved",
  "comments": "Approved with minor modifications",
  "conditions": ["Install additional grab bar", "Use non-slip flooring"],
  "votesFor": 4,
  "votesAgainst": 1,
  "votesAbstain": 0
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "dec-456",
    "submissionId": "sub-123",
    "committeeId": "com-001",
    "decision": "approved",
    "comments": "Approved with minor modifications",
    "conditions": ["Install additional grab bar", "Use non-slip flooring"],
    "votesFor": 4,
    "votesAgainst": 1,
    "votesAbstain": 0,
    "decidedBy": "user-789",
    "decidedAt": "2023-06-15T14:45:00Z"
  }
}
```

### Upload Assessment Photos

**Request:**

```http
POST /assessments/assess-789/photos
Content-Type: multipart/form-data
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

--boundary
Content-Disposition: form-data; name="roomId"

room-123
--boundary
Content-Disposition: form-data; name="description"

Bathroom before modifications
--boundary
Content-Disposition: form-data; name="file"; filename="bathroom_before.jpg"
Content-Type: image/jpeg

[Binary file data]
--boundary--
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "photo-001",
    "assessmentId": "assess-789",
    "roomId": "room-123",
    "description": "Bathroom before modifications",
    "filename": "bathroom_before.jpg",
    "fileSize": 1245678,
    "mimeType": "image/jpeg",
    "url": "https://storage.barakatna.org/photos/bathroom_before_uuid.jpg",
    "thumbnailUrl": "https://storage.barakatna.org/photos/thumbnails/bathroom_before_uuid.jpg",
    "uploadedBy": "user-456",
    "uploadedAt": "2023-06-15T11:30:00Z"
  }
}
```

### Get Client Configuration with Versioning

**Request:**

```http
GET /clients/client-001/configurations
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "config-001",
    "clientId": "client-001",
    "version": "1.2.0",
    "general": {
      "code": "FDF",
      "nameEN": "Family Development Foundation",
      "nameAR": "مؤسسة تنمية الأسرة",
      "notes": "Primary government client for senior citizen services"
    },
    "workflow": {
      "requireApproval": true,
      "approvalLevels": 2,
      "autoAssign": false
    },
    "forms": {
      "assessment": {
        "sections": ["personal", "home", "mobility", "bathroom", "kitchen", "bedroom"],
        "requiredFields": ["beneficiaryId", "assessmentDate", "assessorId"]
      }
    },
    "createdAt": "2023-01-15T08:30:00Z",
    "updatedAt": "2023-06-10T14:45:00Z",
    "updatedBy": "user-001",
    "previousVersions": [
      {
        "version": "1.1.0",
        "updatedAt": "2023-03-22T11:15:00Z",
        "updatedBy": "user-002",
        "changeDescription": "Added new form fields for kitchen assessment"
      },
      {
        "version": "1.0.0",
        "updatedAt": "2023-01-15T08:30:00Z",
        "updatedBy": "user-001",
        "changeDescription": "Initial configuration"
      }
    ]
  }
}
```

## Error Handling Recommendations

1. **Always check the `success` field** in the response to determine if the request was successful.

2. **Handle specific error codes** appropriately:
   - `VALIDATION_ERROR`: Display field-specific errors to the user
   - `UNAUTHORIZED`: Redirect to login page
   - `FORBIDDEN`: Show permission denied message
   - `NOT_FOUND`: Show resource not found message
   - `RATE_LIMIT_EXCEEDED`: Implement exponential backoff retry

3. **Implement retry logic** for network errors and 5xx responses.

4. **Log detailed error information** for debugging but show user-friendly messages to end users.

5. **Use the `retryable` field** in error responses to determine if a request can be retried.

6. **Implement offline support** for critical operations:
   ```typescript
   import { apiClient } from '@/lib/api/core/apiClient';
   
   // Check if online before making requests
   if (apiClient.isOnline()) {
     // Make regular request
   } else {
     // Handle offline scenario or queue request
     const response = await apiClient.post('/endpoint', data, 'en', {
       offlineSupport: true // This will queue the request if offline
     });
     
     if (response.offline) {
       // Show user that request is queued
     }
   }
   ```

7. **Use the error handling utilities** provided by the platform:
   ```typescript
   import { handleApiError, retryWithBackoff } from '@/lib/api/core/errorHandling';
   
   try {
     const result = await retryWithBackoff(
       () => apiService.getData(),
       { maxRetries: 3, initialDelay: 300 }
     );
     return result;
   } catch (error) {
     const apiResponse = handleApiError(error, 'entityType', 'operation');
     // Handle the standardized error response
   }
   ```

8. **Implement proper error boundaries** in React components to prevent cascading failures:
   ```tsx
   import { ErrorBoundary } from '@/components/ErrorBoundary';
   
   <ErrorBoundary fallback={<ErrorFallback />}>
     <YourComponent />
   </ErrorBoundary>
   ```