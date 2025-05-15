# Barakatna Platform API Layer

## Overview

This directory contains the API layer for the Barakatna Platform. The API layer provides a structured interface for interacting with the backend services, implementing CRUD operations, validation, error handling, and role-based authorization.

## Structure

The API layer is organized into domain-specific modules, each containing types and API functions:

```
api/
├── core/              # Core API functionality
│   ├── apiClient.ts   # Generic API client with CRUD operations
│   └── types.ts       # Common types for API requests and responses
├── assessment/        # Assessment domain API
│   ├── assessmentApi.ts # API functions for assessments
│   └── types.ts       # Assessment-specific types
├── client/           # Client domain API
│   ├── clientApi.ts   # API functions for clients
│   └── types.ts       # Client-specific types
├── project/          # Project domain API
│   ├── projectApi.ts  # API functions for projects
│   └── types.ts       # Project-specific types
└── index.ts          # Main export file
```

## Features

- **Structured API Calls**: Consistent interface for all API endpoints
- **Type Safety**: TypeScript interfaces for all API requests and responses
- **Error Handling**: Standardized error handling across all API calls
- **Pagination**: Support for paginated responses
- **Filtering**: Support for filtering data based on various criteria
- **Multilingual Support**: Support for Arabic and English responses

## Usage

### Import the API

```typescript
import { api } from '@/lib/api';
```

### Make API Calls

```typescript
// Get all senior citizens with pagination and filtering
const response = await api.client.getSeniorCitizens({
  page: 1,
  pageSize: 10,
  language: 'en',
  firstNameEN: 'John',
});

// Create a new assessment
const assessment = await api.assessment.createAssessment({
  assessmentCode: 'ASM-001',
  seniorCitizenId: 1,
  assessmentTypeId: 1,
  propertyId: 1,
  assessmentDate: new Date(),
  assessorId: 1,
  statusId: 1,
});
```

## Error Handling

All API functions return a standardized `ApiResponse` object with the following structure:

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
```

Example error handling:

```typescript
const response = await api.client.getSeniorCitizen(1);

if (!response.success) {
  console.error('Error:', response.error);
  // Handle error
} else {
  const seniorCitizen = response.data;
  // Use the data
}
```

## Pagination

Paginated responses follow this structure:

```typescript
interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
```

## Future Enhancements

1. Implement caching for frequently accessed data
2. Add request throttling and retry logic
3. Implement real-time updates using WebSockets
4. Add offline support with request queuing
