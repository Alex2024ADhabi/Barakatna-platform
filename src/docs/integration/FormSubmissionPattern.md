# Form Submission Pattern

## Overview

This document outlines the form submission patterns used throughout the Barakatna Platform, including validation, multi-step forms, draft saving, and error handling.

## Basic Form Submission Pattern

### Form State Management

Use the `useFormSubmission` hook to manage form state:

```tsx
import { useFormSubmission } from '@/lib/api/core/formSubmission';

function MyForm() {
  const {
    formData,
    isDirty,
    isSubmitting,
    isValid,
    errors,
    updateField,
    touchField,
    submitForm
  } = useFormSubmission({
    initialValues: {
      name: '',
      email: '',
      phone: ''
    },
    onSubmit: async (data) => {
      try {
        const response = await apiService.submitData(data);
        return response;
      } catch (error) {
        return { success: false, error: error.message };
      }
    },
    validate: (data) => {
      const errors = {};
      if (!data.name) errors.name = 'Name is required';
      if (!data.email) errors.email = 'Email is required';
      return Object.keys(errors).length > 0 ? errors : null;
    }
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
      
      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => updateField('email', e.target.value)}
          onBlur={() => touchField('email')}
        />
        {errors.email && <span className="error">{errors.email}</span>}
      </div>
      
      <div>
        <label htmlFor="phone">Phone</label>
        <input
          id="phone"
          type="tel"
          value={formData.phone}
          onChange={(e) => updateField('phone', e.target.value)}
        />
      </div>
      
      <button type="submit" disabled={isSubmitting || !isValid}>
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </button>
    </form>
  );
}
```

### Form Field Helper

Use the `getFieldProps` helper for cleaner form field handling:

```tsx
function MyForm() {
  const { formData, errors, getFieldProps, submitForm } = useFormSubmission({
    // configuration as above
  });

  return (
    <form onSubmit={submitForm}>
      <div>
        <label htmlFor="name">Name</label>
        <input id="name" {...getFieldProps('name')} />
        {errors.name && <span className="error">{errors.name}</span>}
      </div>
      
      {/* Other fields */}
      
      <button type="submit">Submit</button>
    </form>
  );
}
```

## Multi-Step Form Pattern

Implement multi-step forms with progress tracking:

```tsx
function MultiStepForm() {
  const {
    formData,
    currentStep,
    currentStepName,
    progress,
    nextStep,
    prevStep,
    submitForm
  } = useFormSubmission({
    initialValues: {
      // form fields
    },
    onSubmit: async (data) => {
      // submit logic
    },
    steps: ['Personal Info', 'Contact Details', 'Review']
  });

  return (
    <div>
      <div className="progress-bar">
        <div className="progress" style={{ width: `${progress}%` }}></div>
      </div>
      
      <h2>{currentStepName}</h2>
      
      {currentStep === 0 && (
        <div className="step">
          {/* Personal Info Fields */}
          <button onClick={nextStep}>Next</button>
        </div>
      )}
      
      {currentStep === 1 && (
        <div className="step">
          {/* Contact Details Fields */}
          <button onClick={prevStep}>Back</button>
          <button onClick={nextStep}>Next</button>
        </div>
      )}
      
      {currentStep === 2 && (
        <div className="step">
          {/* Review Form Data */}
          <button onClick={prevStep}>Back</button>
          <button onClick={submitForm}>Submit</button>
        </div>
      )}
    </div>
  );
}
```

## Form Validation Patterns

### Field-Level Validation

Implement field-level validation with immediate feedback:

```tsx
const validate = (data) => {
  const errors = {};
  
  // Name validation
  if (!data.name) {
    errors.name = 'Name is required';
  } else if (data.name.length < 2) {
    errors.name = 'Name must be at least 2 characters';
  }
  
  // Email validation
  if (!data.email) {
    errors.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'Please enter a valid email address';
  }
  
  // Phone validation (optional field)
  if (data.phone && !/^\+?[0-9]{10,15}$/.test(data.phone)) {
    errors.phone = 'Please enter a valid phone number';
  }
  
  return errors;
};
```

### Form-Level Validation

Implement form-level validation for cross-field validation:

```tsx
const validate = (data) => {
  const errors = {};
  
  // Field-level validations
  // ...
  
  // Cross-field validation
  if (data.password !== data.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }
  
  // Conditional validation
  if (data.hasPhoneNotification && !data.phone) {
    errors.phone = 'Phone number is required for notifications';
  }
  
  return errors;
};
```

## Form Draft Saving

Implement draft saving for long forms:

```tsx
function LongForm() {
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
      // submit logic
    },
    autosave: true,
    autosaveInterval: 30000, // 30 seconds
    onAutosave: async (data) => {
      // Custom autosave logic, e.g., save to server
      await apiService.saveDraft(data);
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

## Form Submission with Optimistic Updates

Implement optimistic updates for a better user experience:

```tsx
function CommentForm() {
  const [comments, setComments] = useState([]);
  
  const { formData, updateField, resetForm, submitForm } = useFormSubmission({
    initialValues: {
      comment: ''
    },
    onSubmit: async (data) => {
      // Optimistic update
      const tempId = `temp-${Date.now()}`;
      const optimisticComment = {
        id: tempId,
        text: data.comment,
        author: 'Current User',
        timestamp: new Date().toISOString(),
        isPending: true
      };
      
      setComments(prev => [...prev, optimisticComment]);
      
      try {
        // Actual API call
        const response = await apiService.postComment(data.comment);
        
        // Replace optimistic comment with real one
        if (response.success) {
          setComments(prev => prev.map(c => 
            c.id === tempId ? { ...response.data, isPending: false } : c
          ));
          return response;
        } else {
          // Remove optimistic comment on failure
          setComments(prev => prev.filter(c => c.id !== tempId));
          return response;
        }
      } catch (error) {
        // Remove optimistic comment on error
        setComments(prev => prev.filter(c => c.id !== tempId));
        return { success: false, error: error.message };
      }
    },
    resetOnSubmit: true
  });

  return (
    <div>
      <div className="comments-list">
        {comments.map(comment => (
          <div key={comment.id} className={comment.isPending ? 'pending' : ''}>
            <p>{comment.text}</p>
            <small>{comment.author} • {new Date(comment.timestamp).toLocaleString()}</small>
            {comment.isPending && <span className="badge">Sending...</span>}
          </div>
        ))}
      </div>
      
      <form onSubmit={submitForm}>
        <textarea
          value={formData.comment}
          onChange={(e) => updateField('comment', e.target.value)}
          placeholder="Write a comment..."
        />
        <button type="submit">Post Comment</button>
      </form>
    </div>
  );
}
```

## Form Submission with File Uploads

Implement file uploads with progress tracking:

```tsx
function FileUploadForm() {
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const { formData, updateField, submitForm } = useFormSubmission({
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
      
      try {
        const response = await apiClient.upload('/documents', formData, 'en', {
          onProgress: (progress) => setUploadProgress(progress)
        });
        return response;
      } catch (error) {
        return { success: false, error: error.message };
      }
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
      </div>
      
      {uploadProgress > 0 && uploadProgress < 100 && (
        <div className="progress-bar">
          <div className="progress" style={{ width: `${uploadProgress}%` }}></div>
          <span>{uploadProgress}%</span>
        </div>
      )}
      
      <button type="submit">Upload</button>
    </form>
  );
}
```

## Form Error Handling

Implement comprehensive error handling:

```tsx
function RegistrationForm() {
  const { formData, errors, updateField, submitForm } = useFormSubmission({
    initialValues: {
      // form fields
    },
    onSubmit: async (data) => {
      try {
        const response = await apiService.register(data);
        return response;
      } catch (error) {
        // Handle different types of errors
        if (error.response) {
          // Server responded with an error status
          const serverErrors = error.response.data.errors;
          
          if (serverErrors) {
            // Map server validation errors to form fields
            return {
              success: false,
              error: 'Validation failed',
              meta: {
                fieldErrors: serverErrors
              }
            };
          } else {
            return {
              success: false,
              error: error.response.data.message || 'Registration failed'
            };
          }
        } else if (error.request) {
          // Request was made but no response received
          return {
            success: false,
            error: 'Network error. Please check your connection.'
          };
        } else {
          // Something else happened while setting up the request
          return {
            success: false,
            error: error.message || 'An unexpected error occurred'
          };
        }
      }
    },
    errorMessage: 'Registration failed. Please try again.'
  });

  return (
    <form onSubmit={submitForm}>
      {/* Form fields */}
      
      {/* Global form error */}
      {errors._form && (
        <div className="error-message">{errors._form}</div>
      )}
      
      <button type="submit">Register</button>
    </form>
  );
}
```

## Best Practices

1. **Separate Form Logic from UI**: Keep form logic separate from UI components for better maintainability.

2. **Progressive Enhancement**: Ensure forms work without JavaScript, then enhance with client-side validation and features.

3. **Accessibility**: Ensure forms are accessible with proper labels, ARIA attributes, and keyboard navigation.

4. **Error Messages**: Provide clear, specific error messages that help users correct their input.

5. **Validation Timing**: Choose appropriate validation timing (onChange, onBlur, onSubmit) based on field complexity.

6. **Loading States**: Show clear loading states during form submission to prevent multiple submissions.

7. **Confirmation Dialogs**: Use confirmation dialogs for destructive or important actions.

8. **Form Analytics**: Track form completion rates and common errors to improve user experience.

9. **Internationalization**: Support multiple languages for form labels, placeholders, and error messages.

10. **Mobile Optimization**: Ensure forms are usable on mobile devices with appropriate input types and sizes.