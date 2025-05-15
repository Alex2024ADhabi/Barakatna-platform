// Common types used across the application

// Beneficiary related types
export interface Address {
  emirate: string;
  area: string;
  street: string;
  buildingVilla: string;
  gpsCoordinates: string;
}

export interface PropertyDetails {
  propertyType: string;
  ownership: string;
  bedrooms: number;
  bathrooms: number;
  floors: number;
  yearOfConstruction: number;
}

export interface BeneficiaryData {
  beneficiaryId: string;
  registrationDate: Date;
  emiratesId: string;
  fullNameEn: string;
  fullNameAr: string;
  dateOfBirth: Date | null;
  gender: string;
  contactNumber: string;
  secondaryContactNumber: string;
  address: Address;
  propertyDetails: PropertyDetails;
  clientTypeId: number; // 1: FDF, 2: ADHA, 3: Cash-Based
}

// Assessment related types
export interface InitialAssessment {
  assessmentId: string;
  beneficiaryId: string;
  assessmentDate: Date;
  assessorName: string;
  propertySize: number;
  entranceAccessibility: string;
  bathroomAccessibility: string;
  kitchenAccessibility: string;
  bedroomAccessibility: string;
  overallHomeSafety: string;
  primaryModificationNeeds: string;
  modificationPriority: string;
  estimatedComplexity: string;
  estimatedBudgetRange: string;
  photosReference: string;
  floorPlanReference: string;
  notes: string;
}

export interface RoomAssessment {
  roomAssessmentId: string;
  assessmentId: string;
  roomType: string;
  roomName: string;
  measurements: Measurement[];
  recommendations: Recommendation[];
  photos: Photo[];
  notes: string;
}

export interface Measurement {
  measurementId: string;
  roomAssessmentId: string;
  measurementType: string;
  value: number;
  unitOfMeasure: string;
  isCompliant: boolean;
  standardValue: number;
  notes: string;
}

export interface Recommendation {
  recommendationId: string;
  roomAssessmentId: string;
  recommendationType: string;
  priorityLevel: string;
  description: string;
  reason: string;
  estimatedCost: number;
  isSelected: boolean;
  isApproved: boolean;
}

export interface Photo {
  photoId: string;
  roomAssessmentId: string;
  photoUrl: string;
  capturedDate: Date;
  description: string;
  annotations: string;
  photoType: string;
}

// Program status related types
export interface ProgramStatus {
  beneficiaryId: string;
  qualificationStatus: string;
  qualificationDate: Date | null;
  assignedCohortId: string | null;
  priorityLevel: string;
  currentStage: string;
  stageStartDate: Date;
  expectedCompletion: Date | null;
  actualCompletion: Date | null;
  currentStatus: string;
  assignedProjectManager: string;
  assignedTechnicalLead: string;
  budgetApproved: number;
  budgetUtilized: number;
  satisfactionSurveyCompleted: boolean;
  satisfactionRating: number | null;
  statusNotes: string;
}

// Workflow related types
export interface WorkflowState {
  description: string;
  allowedTransitions: string[];
}

export interface WorkflowTransition {
  from: string;
  to: string;
  requiredRole?: string;
  action: (context: WorkflowContext) => Promise<any>;
}

export interface WorkflowContext {
  userId: string;
  data: Record<string, any>;
}

export interface ClientTypeRule {
  additionalValidation?: (id: string) => Promise<boolean>;
  additionalWorkflowSteps?: string[];
  simplifiedFlow?: boolean;
}

export interface Workflow {
  name: string;
  states: Record<string, WorkflowState>;
  transitions: Record<string, WorkflowTransition>;
  clientTypeRules?: Record<string, ClientTypeRule>;
}

// Integration related types
export interface IntegrationTrigger {
  event: string;
  action: string;
  dataMapping: Record<string, string>;
}

export interface IntegrationListener {
  event: string;
  action: (data: any) => Promise<void>;
}

export interface ModuleIntegration {
  triggers: IntegrationTrigger[];
  listeners: IntegrationListener[];
}

export interface ModuleIntegrations {
  [moduleName: string]: ModuleIntegration;
}
