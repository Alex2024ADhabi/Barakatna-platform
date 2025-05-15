# Component Integration Documentation

## Overview

This document provides detailed integration documentation for key components in the Barakatna Platform, showing front-end component responsibilities, back-end service methods, data flow, and integration patterns.

## Committee Module Integration

### Front-end Component Responsibilities

#### CommitteeDecisionList Component

**Purpose**: Displays a list of pending submissions for committee review and allows committee members to approve or reject submissions.

**Responsibilities**:
- Display committees in tabs
- Show pending submissions for the selected committee
- Provide approve/reject actions for each submission
- Handle loading, error, and empty states
- Refresh data when needed

**Props**:
```typescript
interface CommitteeDecisionListProps {
  committees: Committee[];
}
```

#### SubmissionReviewForm Component

**Purpose**: Allows detailed review of a specific submission with options to approve, reject, or defer.

**Responsibilities**:
- Display submission details
- Provide decision options (approve/reject/defer)
- Allow comments input
- Handle form submission
- Validate input before submission

**Props**:
```typescript
interface SubmissionReviewFormProps {
  submissionId: string;
  submissionType: string;
  onComplete: () => void;
  onCancel: () => void;
}
```

### Back-end Service Methods

#### Committee Service

```typescript
const committeeService = {
  // Get pending submissions for review
  getPendingSubmissions: async ({ status }: { status: string }): Promise<ApiResponse<CommitteeSubmission[]>>

  // Submit a decision on a submission
  submitDecision: async (
    decision: CommitteeDecisionRequest,
    userId: string,
    committeeId: string
  ): Promise<ApiResponse<{ success: boolean }>>

  // Get committee details
  getCommittee: async (id: string): Promise<ApiResponse<Committee>>

  // Get submission details
  getSubmission: async (id: string): Promise<ApiResponse<CommitteeSubmission>>
};
```

### Data Flow

1. **Loading Committee Data**:
   - CommitteeDecisionList component mounts
   - Component receives committees as props
   - Component sets the first committee as active
   - Component calls `committeeService.getPendingSubmissions`
   - Component displays submissions or appropriate loading/error state

2. **Submission Decision Flow**:
   - User clicks Approve/Reject button
   - Component calls `committeeService.submitDecision`
   - Component shows loading state during API call
   - On success, component refreshes the submissions list
   - On error, component displays error message

### Error Handling Strategy

- Use toast notifications for user-friendly error messages
- Implement retry mechanism for network errors
- Show inline error messages for validation errors
- Log detailed error information for debugging

### Performance Considerations

- Implement pagination for large submission lists
- Use skeleton screens during loading
- Memoize expensive computations
- Implement debouncing for frequent user actions

## Assessment Module Integration

### Front-end Component Responsibilities

#### AssessmentForm Component

**Purpose**: Allows creation and editing of assessments with multi-step workflow.

**Responsibilities**:
- Implement multi-step form flow
- Validate each step before proceeding
- Save draft automatically
- Handle form submission
- Display appropriate feedback

**Props**:
```typescript
interface AssessmentFormProps {
  initialData?: Assessment;
  onComplete: (assessment: Assessment) => void;
  onCancel: () => void;
}
```

#### RoomAssessment Component

**Purpose**: Allows detailed assessment of a room with modifications.

**Responsibilities**:
- Display room details
- Allow adding/editing modifications
- Upload and display photos
- Validate modifications
- Handle form submission

**Props**:
```typescript
interface RoomAssessmentProps {
  assessmentId: string;
  roomId?: string;
  initialData?: RoomData;
  onComplete: (roomData: RoomData) => void;
  onCancel: () => void;
}
```

### Back-end Service Methods

#### Assessment Service

```typescript
const assessmentService = {
  // Create a new assessment
  createAssessment: async (data: AssessmentData): Promise<ApiResponse<Assessment>>

  // Update an existing assessment
  updateAssessment: async (id: string, data: Partial<AssessmentData>): Promise<ApiResponse<Assessment>>

  // Get assessment details
  getAssessment: async (id: string): Promise<ApiResponse<Assessment>>

  // Save assessment draft
  saveDraft: async (data: Partial<AssessmentData>): Promise<ApiResponse<Assessment>>

  // Submit assessment for review
  submitForReview: async (id: string): Promise<ApiResponse<Assessment>>
};
```

#### Room Assessment Service

```typescript
const roomAssessmentService = {
  // Add a room to an assessment
  addRoom: async (assessmentId: string, data: RoomData): Promise<ApiResponse<Room>>

  // Update a room in an assessment
  updateRoom: async (assessmentId: string, roomId: string, data: Partial<RoomData>): Promise<ApiResponse<Room>>

  // Get room details
  getRoom: async (assessmentId: string, roomId: string): Promise<ApiResponse<Room>>

  // Add a modification to a room
  addModification: async (assessmentId: string, roomId: string, data: ModificationData): Promise<ApiResponse<Modification>>

  // Upload room photos
  uploadPhotos: async (assessmentId: string, roomId: string, files: File[]): Promise<ApiResponse<Photo[]>>
};
```

### Data Flow

1. **Assessment Creation Flow**:
   - User starts new assessment
   - AssessmentForm component initializes multi-step form
   - User completes each step with validation
   - Form automatically saves drafts at intervals
   - On final submission, component calls `assessmentService.createAssessment`
   - On success, component calls onComplete callback

2. **Room Assessment Flow**:
   - User selects a room to assess
   - RoomAssessment component loads room data or initializes new room
   - User adds modifications and uploads photos
   - Component validates modifications
   - On save, component calls appropriate service method based on whether it's a new or existing room
   - On success, component calls onComplete callback

### Error Handling Strategy

- Implement form validation for each step
- Use toast notifications for API errors
- Implement auto-save to prevent data loss
- Show confirmation dialogs for destructive actions

### Performance Considerations

- Optimize image uploads with compression
- Implement lazy loading for room photos
- Use virtualized lists for large datasets
- Implement background saving for drafts

## Integration Between Modules

### Assessment to Committee Workflow

1. **Submission Flow**:
   - Assessment is completed and submitted for review
   - System creates a committee submission record
   - Relevant committee members are notified
   - Submission appears in CommitteeDecisionList

2. **Decision Flow**:
   - Committee member reviews and makes decision
   - Decision is recorded and linked to assessment
   - Assessment status is updated based on decision
   - Relevant stakeholders are notified
   - If approved, assessment moves to project planning phase
   - If rejected, assessment is returned to assessor with comments

### Data Consistency

- Use consistent data structures across modules
- Implement proper validation at both client and server
- Use optimistic updates with rollback capability
- Implement proper error handling and recovery

## Conclusion

This integration documentation provides a comprehensive overview of how the Committee and Assessment modules are integrated within the Barakatna Platform. By following these patterns, developers can ensure consistent implementation and seamless integration between front-end components and back-end services.