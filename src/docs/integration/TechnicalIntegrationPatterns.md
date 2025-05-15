# Technical Integration Patterns

## Overview

This document outlines the technical integration patterns used throughout the Barakatna Platform, including error handling, loading state management, and form submission patterns.

## Error Handling Pattern

### Consistent Error Response Format

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

### Error Categorization

Errors are categorized to help determine appropriate handling:

1. **Validation Errors**: Issues with input data format or content
2. **Authentication Errors**: Issues with user authentication or session
3. **Resource Errors**: Requested resource not found or unavailable
4. **Business Rule Errors**: Violation of business logic or constraints
5. **Network Errors**: Communication issues between client and server
6. **System Errors**: Internal server errors or unexpected issues

### User-friendly Error Messages

Error messages should be:

- Clear and concise
- Action-oriented when possible
- Free of technical jargon for end users
- Localized based on user preferences

### Detailed Logging

Implement comprehensive error logging:

```typescript
import { logger } from '@/lib/logger';

try {
  // API call or operation
} catch (error) {
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

### Retry Mechanisms

For transient errors, implement retry logic with exponential backoff:

```typescript
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

## Loading State Management

### Loading Indicators

Provide visual feedback during asynchronous operations:

```tsx
import { useState, useEffect } from 'react';
import { Spinner } from '@/components/ui/spinner';

function MyComponent() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiService.getData();
        setData(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <Spinner />;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return <div>{/* Render data */}</div>;
}
```

### Skeleton Screens

Use skeleton screens for a better loading experience:

```tsx
import { TableSkeleton } from '@/components/ui/skeleton-loader';

function DataTable() {
  const [state, fetchData] = useAsyncOperation(apiService.getTableData, true);

  if (state.isLoading) {
    return <TableSkeleton rows={5} columns={4} />;
  }

  // Rest of component
}
```

### Cancellable Requests

Implement cancellable requests to prevent race conditions:

```tsx
import { useCancellableAsyncOperation } from '@/lib/api/core/loadingState';
import { useEffect } from 'react';

function SearchResults({ query }) {
  const [state, search, cancelSearch] = useCancellableAsyncOperation(apiService.search);

  useEffect(() => {
    if (query) {
      search(query);
    }
    
    // Cancel request when component unmounts or query changes
    return () => cancelSearch();
  }, [query]);

  // Rest of component
}
```

### Background Loading

Implement background loading for non-critical data:

```tsx
import { useBackgroundLoader } from '@/lib/api/core/loadingState';

function Dashboard() {
  // Critical data - shows loading state
  const [mainState, fetchMainData] = useAsyncOperation(apiService.getMainData, true);
  
  // Non-critical data - loads in background without showing loading state
  const statsState = useBackgroundLoader(
    () => apiService.getStats(),
    [] // dependencies array
  );

  // Rest of component
}
```

## Form Submission Pattern

### Using the Form Submission Hook

Use the `useFormSubmission` hook for comprehensive form management:

```tsx
import { useFormSubmission } from '@/lib/api/core/formSubmission';
import { apiClient } from '@/lib/api/core/apiClient';

function RegistrationForm() {
  const {
    formData,
    errors,
    isSubmitting,
    isValid,
    updateField,
    touchField,
    submitForm
  } = useFormSubmission({
    initialValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    },
    onSubmit: async (data) => {
      try {
        return await apiClient.post('/auth/register', {
          name: data.name,
          email: data.email,
          password: data.password
        });
      } catch (error) {
        return { success: false, error: error.message };
      }
    },
    validate: (data) => {
      const errors = {};
      
      // Name validation
      if (!data.name.trim()) {
        errors.name = 'Name is required';
      }
      
      // Email validation
      if (!data.email.trim()) {
        errors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        errors.email = 'Please enter a valid email address';
      }
      
      // Password validation
      if (!data.password) {
        errors.password = 'Password is required';
      } else if (data.password.length < 8) {
        errors.password = 'Password must be at least 8 characters';
      }
      
      // Confirm password validation
      if (data.password !== data.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
      
      return Object.keys(errors).length > 0 ? errors : null;
    },
    validateOnChange: true,
    validateOnBlur: true,
    resetOnSubmit: true,
    successMessage: 'Registration successful!',
    errorMessage: 'Registration failed. Please try again.'
  });
  
  return (
    <form onSubmit={submitForm}>
      <div>
        <label htmlFor="name">Name</label>
        <input
          id="name"
          value={formData.name}
          onChange={(e) => updateField('name', e.target.value)}
          onBlur={() => touchField('name')}
        />
        {errors.name && <span className="error">{errors.name}</span>}
      </div>
      
      {/* Other form fields */}
      
      <button type="submit" disabled={isSubmitting || !isValid}>
        {isSubmitting ? 'Submitting...' : 'Register'}
      </button>
    </form>
  );
}
```

### Progress Tracking for Multi-step Forms

Implement progress tracking for multi-step forms:

```tsx
import { useFormSubmission } from '@/lib/api/core/formSubmission';

function AssessmentForm() {
  const {
    formData,
    errors,
    currentStep,
    currentStepName,
    progress,
    nextStep,
    prevStep,
    submitForm
  } = useFormSubmission({
    initialValues: {
      // form fields for all steps
      beneficiaryId: '',
      roomType: '',
      measurements: {},
      modifications: []
    },
    onSubmit: async (data) => {
      return await apiClient.post('/assessments', data);
    },
    validate: (data) => {
      // Validation logic
      const errors = {};
      // ...
      return errors;
    },
    steps: ['Beneficiary', 'Rooms', 'Modifications', 'Review']
  });
  
  return (
    <div>
      <div className="progress-tracker">
        <div className="progress-bar">
          <div className="progress" style={{ width: `${progress}%` }}></div>
        </div>
        <div className="steps">
          {['Beneficiary', 'Rooms', 'Modifications', 'Review'].map((step, index) => (
            <div 
              key={index} 
              className={`step ${currentStep === index ? 'active' : ''} ${currentStep > index ? 'completed' : ''}`}
            >
              {step}
            </div>
          ))}
        </div>
      </div>
      
      <h2>{currentStepName}</h2>
      
      {currentStep === 0 && (
        <div className="step-content">
          {/* Beneficiary fields */}
          <button onClick={nextStep}>Next</button>
        </div>
      )}
      
      {currentStep === 1 && (
        <div className="step-content">
          {/* Room fields */}
          <button onClick={prevStep}>Back</button>
          <button onClick={nextStep}>Next</button>
        </div>
      )}
      
      {/* Other steps */}
      
      {currentStep === 3 && (
        <div className="step-content">
          {/* Review step */}
          <button onClick={prevStep}>Back</button>
          <button onClick={submitForm}>Submit</button>
        </div>
      )}
    </div>
  );
}
```

### Draft Saving for Interrupted Sessions

Implement draft saving for interrupted sessions:

```tsx
import { useFormSubmission } from '@/lib/api/core/formSubmission';

function AssessmentForm() {
  const {
    formData,
    isDirty,
    savedDraft,
    lastSaved,
    saveDraft,
    loadDraft,
    submitForm
  } = useFormSubmission({
    initialValues: {
      // form fields
    },
    onSubmit: async (data) => {
      return await apiClient.post('/assessments', data);
    },
    autosave: true,
    autosaveInterval: 30000, // 30 seconds
    onAutosave: async (data) => {
      // Optional server-side draft saving
      await apiClient.post('/assessments/drafts', data);
    }
  });
  
  return (
    <form onSubmit={submitForm}>
      {/* Form fields */}
      
      <div className="form-actions">
        {isDirty && (
          <button type="button" onClick={saveDraft}>Save Draft</button>
        )}
        
        {lastSaved && (
          <p className="text-sm text-muted">
            Last saved: {new Date(lastSaved).toLocaleString()}
          </p>
        )}
        
        <button type="submit">Submit</button>
      </div>
    </form>
  );
}
```

### Confirmation Dialogs

Implement confirmation dialogs for important actions:

```tsx
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { apiClient } from '@/lib/api/core/apiClient';
import { useToast } from '@/components/ui/use-toast';

function DeleteItemButton({ itemId, itemName, onDelete }) {
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  
  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await apiClient.delete(`/items/${itemId}`, 'en', {
        entityType: 'item',
        offlineSupport: true
      });
      
      if (response.success) {
        onDelete(itemId);
        toast({
          title: "Success",
          description: `${itemName} has been deleted successfully.`,
        });
      } else {
        toast({
          title: "Error",
          description: response.error || "Failed to delete item",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete item",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setShowConfirmation(false);
    }
  };
  
  return (
    <>
      <Button 
        variant="destructive" 
        onClick={() => setShowConfirmation(true)}
      >
        Delete
      </Button>
      
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {itemName}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowConfirmation(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
```

### Form Submission with File Uploads

Implement file uploads with progress tracking:

```tsx
import { useState } from 'react';
import { useFormSubmission } from '@/lib/api/core/formSubmission';
import { apiClient } from '@/lib/api/core/apiClient';
import { Progress } from '@/components/ui/progress';

function DocumentUploadForm() {
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const {
    formData,
    updateField,
    errors,
    submitForm
  } = useFormSubmission({
    initialValues: {
      title: '',
      description: '',
      file: null
    },
    onSubmit: async (data) => {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('file', data.file);
      
      // Custom upload function with progress tracking
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress = Math.round((event.loaded / event.total) * 100);
            setUploadProgress(progress);
          }
        });
        
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve({ success: true, data: JSON.parse(xhr.responseText) });
          } else {
            reject(new Error('Upload failed'));
          }
        };
        
        xhr.onerror = () => reject(new Error('Network error'));
        
        xhr.open('POST', `${apiClient.getBaseUrl()}/documents`);
        xhr.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('auth_token')}`);
        xhr.send(formData);
      });
    },
    validate: (data) => {
      const errors = {};
      if (!data.title) errors.title = 'Title is required';
      if (!data.file) errors.file = 'File is required';
      return errors;
    }
  });

  const handleFileChange = (e) => {
    updateField('file', e.target.files[0]);
  };

  return (
    <form onSubmit={submitForm}>
      <div>
        <label htmlFor="title">Title</label>
        <input
          id="title"
          value={formData.title}
          onChange={(e) => updateField('title', e.target.value)}
        />
        {errors.title && <span className="error">{errors.title}</span>}
      </div>
      
      <div>
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => updateField('description', e.target.value)}
        />
      </div>
      
      <div>
        <label htmlFor="file">File</label>
        <input
          id="file"
          type="file"
          onChange={handleFileChange}
        />
        {errors.file && <span className="error">{errors.file}</span>}
      </div>
      
      {uploadProgress > 0 && uploadProgress < 100 && (
        <div className="mt-4">
          <Progress value={uploadProgress} />
          <p className="text-sm text-center mt-1">{uploadProgress}%</p>
        </div>
      )}
      
      <button type="submit" className="mt-4">
        Upload Document
      </button>
    </form>
  );
}
```

For more detailed information on form submission patterns, see the [Form Submission Pattern](./FormSubmissionPattern.md) documentation.

## Data Flow Diagrams

### Assessment Creation Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   User      │     │  Form UI     │     │  API Client │     │  API Server │
└─────┬───────┘     └─────┬───────┘     └─────┬───────┘     └─────┬───────┘
      │                   │                   │                   │
      │ Enter Data        │                   │                   │
      ├──────────────────>│                   │                   │
      │                   │                   │                   │
      │                   │ Validate Form     │                   │
      │                   ├───────────────────┤                   │
      │                   │                   │                   │
      │                   │ Submit Form       │                   │
      │                   ├──────────────────>│                   │
      │                   │                   │                   │
      │                   │                   │ POST /assessments │
      │                   │                   ├──────────────────>│
      │                   │                   │                   │
      │                   │                   │                   │ Process Request
      │                   │                   │                   ├───────────────
      │                   │                   │                   │
      │                   │                   │ Response          │
      │                   │                   │<──────────────────┤
      │                   │                   │                   │
      │                   │ Update UI         │                   │
      │                   ├───────────────────┤                   │
      │                   │                   │                   │
      │ Confirmation      │                   │                   │
      │<──────────────────┤                   │                   │
      │                   │                   │                   │
```

### Committee Decision Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ Committee   │     │  Review UI   │     │  API Client │     │  API Server │
│ Member      │     │             │     │             │     │             │
└─────┬───────┘     └─────┬───────┘     └─────┬───────┘     └─────┬───────┘
      │                   │                   │                   │
      │ Review Submission │                   │                   │
      ├──────────────────>│                   │                   │
      │                   │                   │                   │
      │ Make Decision     │                   │                   │
      ├──────────────────>│                   │                   │
      │                   │                   │                   │
      │                   │ Submit Decision   │                   │
      │                   ├──────────────────>│                   │
      │                   │                   │                   │
      │                   │                   │ POST /committees/{id}/decisions
      │                   │                   ├──────────────────>│
      │                   │                   │                   │
      │                   │                   │                   │ Process Decision
      │                   │                   │                   ├───────────────
      │                   │                   │                   │
      │                   │                   │                   │ Update Status
      │                   │                   │                   ├───────────────
      │                   │                   │                   │
      │                   │                   │                   │ Notify Stakeholders
      │                   │                   │                   ├───────────────
      │                   │                   │                   │
      │                   │                   │ Response          │
      │                   │                   │<──────────────────┤
      │                   │                   │                   │
      │                   │ Update UI         │                   │
      │                   ├───────────────────┤                   │
      │                   │                   │                   │
      │ Confirmation      │                   │                   │
      │<──────────────────┤                   │                   │
      │                   │                   │                   │
```

## State Management Considerations

1. **Component-level State**: Use React's `useState` for simple component-specific state
2. **Context API**: Use for sharing state across related components without prop drilling
3. **Global State**: Use a state management library (Redux, Zustand, etc.) for application-wide state
4. **Server State**: Use React Query or SWR for managing server state with caching and synchronization
5. **Form State**: Use specialized form libraries (React Hook Form, Formik) for complex forms

## Performance Optimization Techniques

1. **Memoization**: Use `useMemo` and `useCallback` to prevent unnecessary re-renders
2. **Code Splitting**: Use dynamic imports to split code into smaller chunks
3. **Virtualization**: Use virtualized lists for rendering large datasets
4. **Lazy Loading**: Load components and data only when needed
5. **Debouncing and Throttling**: Limit the frequency of expensive operations
6. **Optimistic Updates**: Update UI immediately before server confirmation
7. **Caching**: Implement client-side caching for frequently accessed data
8. **Prefetching**: Load data before it's needed for a smoother user experience
9. **Image Optimization**: Use appropriate image formats and sizes
10. **Skeleton Screens**: Show placeholders while content is loading