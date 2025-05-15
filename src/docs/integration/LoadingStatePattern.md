# Loading State Management Pattern

## Overview

This document outlines the standard loading state management pattern used throughout the Barakatna Platform. Proper loading state handling improves user experience by providing visual feedback during asynchronous operations.

## Loading State Interface

```typescript
interface LoadingState {
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  isSuccess: boolean;
}

interface LoadingStateWithData<T> extends LoadingState {
  data: T | null;
}
```

## Loading Indicators

### Basic Loading Indicator

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
    return (
      <div className="flex justify-center items-center h-40">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return <div>{/* Render data */}</div>;
}
```

### Using the Loading State Hook

```tsx
import { useAsyncOperation } from '@/lib/api/core/loadingState';

function MyComponent() {
  const [state, fetchData] = useAsyncOperation(apiService.getData, true);

  if (state.isLoading) {
    return <Spinner />;
  }

  if (state.isError) {
    return <div>Error: {state.error?.message}</div>;
  }

  return <div>{/* Render state.data */}</div>;
}
```

## Skeleton Screens

Skeleton screens provide a better user experience than simple spinners by showing the layout of the content before it loads.

### Table Skeleton

```tsx
import { useEffect } from 'react';
import { useAsyncOperation } from '@/lib/api/core/loadingState';
import { TableSkeleton } from '@/components/ui/skeleton-loader';

function DataTable() {
  const [state, fetchData] = useAsyncOperation(apiService.getTableData, true);

  if (state.isLoading) {
    return <TableSkeleton rows={5} columns={4} />;
  }

  if (state.isError) {
    return <div>Error: {state.error?.message}</div>;
  }

  return (
    <table>
      {/* Table content */}
    </table>
  );
}
```

### Card Skeleton

```tsx
import { CardSkeleton } from '@/components/ui/skeleton-loader';

function ProfileCard() {
  const [state, fetchProfile] = useAsyncOperation(apiService.getProfile, true);

  if (state.isLoading) {
    return <CardSkeleton hasHeader={true} lines={4} hasFooter={true} />;
  }

  // Rest of component
}
```

### Form Skeleton

```tsx
import { FormSkeleton } from '@/components/ui/skeleton-loader';

function UserForm() {
  const [state, fetchUser] = useAsyncOperation(apiService.getUser, true);

  if (state.isLoading) {
    return <FormSkeleton fields={6} />;
  }

  // Rest of component
}
```

## Cancellable Requests

Implement cancellable requests to prevent race conditions and unnecessary updates when navigating away:

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

  if (state.isLoading) {
    return <div>Searching...</div>;
  }

  return <div>{/* Render search results */}</div>;
}
```

## Background Loading

Implement background loading for non-critical data to improve perceived performance:

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

  if (mainState.isLoading) {
    return <div>Loading dashboard...</div>;
  }

  return (
    <div>
      {/* Main content */}
      <div>{/* Render main data */}</div>
      
      {/* Stats section - shows only when available */}
      {statsState.data && (
        <div className="mt-4">
          <h3>Statistics</h3>
          {/* Render stats */}
        </div>
      )}
    </div>
  );
}
```

## Loading Button States

Provide feedback during form submissions with loading buttons:

```tsx
import { useState } from 'react';
import { Button } from '@/components/ui/button';

function SubmitForm() {
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await apiService.submitForm(formData);
      // Handle success
    } catch (error) {
      // Handle error
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      
      <Button type="submit" disabled={loading}>
        {loading ? (
          <>
            <span className="mr-2">Submitting</span>
            <Spinner size="sm" />
          </>
        ) : (
          'Submit'
        )}
      </Button>
    </form>
  );
}
```

## Progress Indicators

Show progress for operations that take time:

```tsx
import { useState } from 'react';
import { Progress } from '@/components/ui/progress';

function FileUpload() {
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  
  const handleUpload = async (file) => {
    setUploading(true);
    setProgress(0);
    
    try {
      await apiService.uploadFile(file, (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        setProgress(percentCompleted);
      });
      
      // Handle success
    } catch (error) {
      // Handle error
    } finally {
      setUploading(false);
    }
  };
  
  return (
    <div>
      <input type="file" onChange={(e) => handleUpload(e.target.files[0])} />
      
      {uploading && (
        <div className="mt-4">
          <Progress value={progress} className="w-full" />
          <p className="text-sm text-center mt-1">{progress}% complete</p>
        </div>
      )}
    </div>
  );
}
```

## Optimistic Updates

Implement optimistic updates for a more responsive UI:

```tsx
import { useState } from 'react';

function TodoList() {
  const [todos, setTodos] = useState([]);
  const [optimisticTodos, setOptimisticTodos] = useState([]);
  const [pendingOperations, setPendingOperations] = useState({});
  
  const addTodo = async (text) => {
    // Generate temporary ID
    const tempId = `temp-${Date.now()}`;
    
    // Add optimistically
    const newTodo = { id: tempId, text, completed: false };
    setOptimisticTodos([...optimisticTodos, newTodo]);
    setPendingOperations({ ...pendingOperations, [tempId]: true });
    
    try {
      // Actual API call
      const result = await apiService.addTodo(text);
      
      // Replace temporary with real todo
      setTodos([...todos, result.data]);
      setOptimisticTodos(optimisticTodos.filter(t => t.id !== tempId));
    } catch (error) {
      // Revert optimistic update on error
      setOptimisticTodos(optimisticTodos.filter(t => t.id !== tempId));
      // Show error
    } finally {
      // Clear pending operation
      const newPendingOps = { ...pendingOperations };
      delete newPendingOps[tempId];
      setPendingOperations(newPendingOps);
    }
  };
  
  // Combine real and optimistic todos for rendering
  const displayTodos = [...todos, ...optimisticTodos];
  
  return (
    <div>
      {/* Todo input */}
      
      <ul>
        {displayTodos.map(todo => (
          <li key={todo.id} className={pendingOperations[todo.id] ? 'opacity-50' : ''}>
            {todo.text}
            {pendingOperations[todo.id] && <Spinner size="xs" className="ml-2" />}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

## Lazy Loading Components

Implement lazy loading for components to improve initial load time:

```tsx
import { lazy, Suspense } from 'react';
import { Spinner } from '@/components/ui/spinner';

// Lazy load heavy component
const HeavyComponent = lazy(() => import('@/components/HeavyComponent'));

function MyPage() {
  return (
    <div>
      {/* Regular content */}
      
      <Suspense fallback={<div className="p-4"><Spinner /></div>}>
        <HeavyComponent />
      </Suspense>
    </div>
  );
}
```

## Best Practices

1. **Use appropriate loading indicators**: Choose between spinners, skeletons, and progress bars based on context
2. **Show loading states for operations over 300ms**: Immediate feedback for longer operations
3. **Use skeleton screens**: They provide a better user experience than spinners
4. **Implement cancellable requests**: Prevent race conditions and unnecessary updates
5. **Use background loading**: Load non-critical data without blocking the UI
6. **Provide feedback during submissions**: Show loading state on buttons
7. **Show progress for long operations**: Use progress bars for file uploads and multi-step processes
8. **Implement optimistic updates**: Make the UI feel more responsive
9. **Lazy load heavy components**: Improve initial load time
10. **Handle loading errors gracefully**: Show appropriate error messages and recovery options
