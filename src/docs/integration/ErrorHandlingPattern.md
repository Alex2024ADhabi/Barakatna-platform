# Error Handling Pattern

## Overview

This document outlines the standard error handling pattern used throughout the Barakatna Platform. Consistent error handling ensures a better user experience and easier debugging.

## Error Response Format

All API errors follow a standard format:

```json
{
  "success": false,
  "error": "User-friendly error message",
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

## Error Categories

Errors are categorized to help determine appropriate handling:

1. **Validation Errors**: Issues with input data format or content
2. **Authentication Errors**: Issues with user authentication or session
3. **Resource Errors**: Requested resource not found or unavailable
4. **Business Rule Errors**: Violation of business logic or constraints
5. **Network Errors**: Communication issues between client and server
6. **System Errors**: Internal server errors or unexpected issues

## Front-end Error Handling

### React Component Error Handling

```tsx
import { useEffect, useState } from 'react';
import { handleApiError } from '@/lib/api/core/errorHandling';
import { useToast } from '@/components/ui/use-toast';

function MyComponent() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await apiService.getData();
        if (response.success) {
          setData(response.data);
        } else {
          setError(response.error);
          toast({
            title: "Error",
            description: response.error,
            variant: "destructive",
          });
        }
      } catch (err) {
        const errorResponse = handleApiError(err);
        setError(errorResponse.error);
        toast({
          title: "Error",
          description: errorResponse.error,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return <div>{/* Render data */}</div>;
}
```

### Using the Error Handling Hook

```tsx
import { useAsyncOperation } from '@/lib/api/core/loadingState';
import { useToast } from '@/components/ui/use-toast';

function MyComponent() {
  const { toast } = useToast();
  const [state, fetchData] = useAsyncOperation(apiService.getData);
  
  useEffect(() => {
    fetchData();
  }, []);
  
  useEffect(() => {
    if (state.isError && state.error) {
      toast({
        title: "Error",
        description: state.error.message,
        variant: "destructive",
      });
    }
  }, [state.isError, state.error]);
  
  if (state.isLoading) return <div>Loading...</div>;
  if (state.isError) return <div>Error: {state.error?.message}</div>;
  
  return <div>{/* Render state.data */}</div>;
}
```

## Retry Mechanism

For transient errors (network issues, temporary server problems), implement retry logic:

```tsx
import { retryWithBackoff } from '@/lib/api/core/errorHandling';

async function fetchWithRetry() {
  try {
    // Retry up to 3 times with exponential backoff
    const data = await retryWithBackoff(
      () => apiService.getData(),
      3,  // retries
      300, // initial delay (ms)
      5000 // max delay (ms)
    );
    return data;
  } catch (error) {
    console.error('All retries failed:', error);
    throw error;
  }
}
```

## Error Logging

Implement detailed error logging for debugging:

```tsx
import { logger } from '@/lib/logger';

try {
  // API call or operation
} catch (error) {
  // Log detailed error for developers
  logger.error('Failed to fetch data', {
    error,
    component: 'MyComponent',
    user: currentUser?.id,
    timestamp: new Date().toISOString(),
    additionalContext: { /* relevant context */ }
  });
  
  // Show user-friendly message
  toast({
    title: "Error",
    description: "Unable to load data. Please try again later.",
    variant: "destructive",
  });
}
```

## Form Validation Errors

Handle field-specific validation errors:

```tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormItem, FormLabel, FormMessage } from '@/components/ui/form';

function MyForm() {
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [errors, setErrors] = useState({});
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    
    try {
      const response = await apiService.submitForm(formData);
      if (!response.success) {
        // Handle validation errors
        if (response.meta?.errorDetails?.category === 'validation') {
          setErrors(response.meta.errorDetails.details || {});
        } else {
          toast({
            title: "Error",
            description: response.error,
            variant: "destructive",
          });
        }
      } else {
        // Handle success
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit form. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <FormItem>
        <FormLabel>Name</FormLabel>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
        />
        {errors.name && <FormMessage>{errors.name}</FormMessage>}
      </FormItem>
      
      <FormItem>
        <FormLabel>Email</FormLabel>
        <Input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
        />
        {errors.email && <FormMessage>{errors.email}</FormMessage>}
      </FormItem>
      
      <Button type="submit">Submit</Button>
    </form>
  );
}
```

## Error Boundary

Implement React Error Boundaries to catch rendering errors:

```tsx
import { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  fallback?: ReactNode;
  children: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
    
    // Log the error
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 border border-red-300 bg-red-50 rounded-md">
          <h2 className="text-lg font-semibold text-red-800">Something went wrong</h2>
          <p className="text-red-600">{this.state.error?.message || 'Unknown error'}</p>
          <button
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

Usage:

```tsx
<ErrorBoundary
  fallback={<div>Something went wrong. Please refresh the page.</div>}
  onError={(error, errorInfo) => {
    // Log to monitoring service
    logger.error('UI Error', { error, errorInfo });
  }}
>
  <MyComponent />
</ErrorBoundary>
```

## Global Error Handler

Implement a global error handler for unhandled exceptions:

```tsx
// In your app initialization
window.addEventListener('error', (event) => {
  // Log to monitoring service
  logger.error('Unhandled error', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    stack: event.error?.stack,
    timestamp: new Date().toISOString()
  });
  
  // Optionally show a global error notification
  // if not in production to avoid overwhelming users
  if (process.env.NODE_ENV !== 'production') {
    toast({
      title: "Unexpected Error",
      description: "An unexpected error occurred. Our team has been notified.",
      variant: "destructive",
    });
  }
});

// For unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  logger.error('Unhandled promise rejection', {
    reason: event.reason,
    stack: event.reason?.stack,
    timestamp: new Date().toISOString()
  });
});
```

## Best Practices

1. **User-friendly messages**: Show technical details only in development
2. **Consistent UI**: Use the same error components throughout the application
3. **Actionable errors**: Provide clear next steps when possible
4. **Offline detection**: Handle offline scenarios gracefully
5. **Detailed logging**: Log comprehensive information for debugging
6. **Retry mechanisms**: Implement for transient errors
7. **Error categorization**: Handle different error types appropriately
8. **Form validation**: Show field-specific errors inline
9. **Error boundaries**: Prevent entire UI from crashing
10. **Global handlers**: Catch unhandled exceptions
