// Database Types for Barakatna Platform

// Core Client Domain Types
export interface ClientType {
  clientTypeId: number;
  typeCode: string; // FDF, ADHA, Cash
  typeNameEN: string;
  typeNameAR: string;
  description?: string;
  isActive: boolean;
  createdBy: number;
  createdDate: Date;
  lastModifiedBy?: number;
  lastModifiedDate?: Date;
}

export interface Status {
  statusId: number;
  statusCode: string;
  statusNameEN: string;
  statusNameAR: string;
  description?: string;
  statusCategory: string; // Assessment, Project, Task, etc.
  orderSequence: number;
  isActive: boolean;
}

export interface User {
  userId: number;
  username: string;
  email: string;
  firstNameEN: string;
  lastNameEN: string;
  firstNameAR: string;
  lastNameAR: string;
  passwordHash: string; // Store as string in TypeScript
  passwordSalt: string; // Store as string in TypeScript
  isActive: boolean;
  lastLoginDate?: Date;
  mobileNumber?: string;
  isEmailVerified: boolean;
  isMobileVerified: boolean;
  createdBy?: number;
  createdDate: Date;
  lastModifiedBy?: number;
  lastModifiedDate?: Date;
}

export interface Role {
  roleId: number;
  roleCode: string;
  roleNameEN: string;
  roleNameAR: string;
  description?: string;
  isActive: boolean;
  createdBy: number;
  createdDate: Date;
  lastModifiedBy?: number;
  lastModifiedDate?: Date;
}

export interface UserRole {
  userRoleId: number;
  userId: number;
  roleId: number;
  isActive: boolean;
  createdBy: number;
  createdDate: Date;
  lastModifiedBy?: number;
  lastModifiedDate?: Date;
}

export interface SeniorCitizen {
  seniorCitizenId: number;
  clientTypeId: number;
  seniorCitizenCode: string;
  firstNameEN: string;
  lastNameEN: string;
  firstNameAR: string;
  lastNameAR: string;
  dateOfBirth: Date;
  gender: "M" | "F";
  nationalId: string;
  phone?: string;
  mobile: string;
  email?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  region: string;
  postalCode?: string;
  locationGPS?: string; // Simplified for TypeScript
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;
  primaryLanguage: string;
  communicationPreference?: string;
  mobilityStatus?: string;
  registrationDate: Date;
  statusId: number;
  createdBy: number;
  createdDate: Date;
  lastModifiedBy?: number;
  lastModifiedDate?: Date;
  isActive: boolean;
}

export interface Property {
  propertyId: number;
  propertyCode: string;
  propertyTypeId: number;
  seniorCitizenId: number;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  region: string;
  postalCode?: string;
  locationGPS?: string; // Simplified for TypeScript
  constructionYear?: number;
  propertySize?: number;
  numberOfBedrooms?: number;
  numberOfBathrooms?: number;
  hasElevator?: boolean;
  numberOfFloors?: number;
  isActive: boolean;
  createdBy: number;
  createdDate: Date;
  lastModifiedBy?: number;
  lastModifiedDate?: Date;
}

// Assessment Domain Types
export interface AssessmentType {
  assessmentTypeId: number;
  typeCode: string;
  typeNameEN: string;
  typeNameAR: string;
  description?: string;
  isActive: boolean;
  createdBy: number;
  createdDate: Date;
  lastModifiedBy?: number;
  lastModifiedDate?: Date;
}

export interface Assessment {
  assessmentId: number;
  assessmentCode: string;
  seniorCitizenId: number;
  assessmentTypeId: number;
  propertyId: number;
  assessmentDate: Date;
  assessorId: number;
  supervisorId?: number;
  statusId: number;
  completionDate?: Date;
  approvalDate?: Date;
  totalEstimatedCost?: number;
  clientTypeId: number;
  notes?: string;
  isActive: boolean;
  createdBy: number;
  createdDate: Date;
  lastModifiedBy?: number;
  lastModifiedDate?: Date;
}

export interface RoomType {
  roomTypeId: number;
  roomTypeCode: string;
  roomTypeNameEN: string;
  roomTypeNameAR: string;
  description?: string;
  isActive: boolean;
  createdBy: number;
  createdDate: Date;
  lastModifiedBy?: number;
  lastModifiedDate?: Date;
}

export interface RoomAssessment {
  roomAssessmentId: number;
  assessmentId: number;
  roomTypeId: number;
  roomName?: string;
  completionStatus: boolean;
  notes?: string;
  isActive: boolean;
  createdBy: number;
  createdDate: Date;
  lastModifiedBy?: number;
  lastModifiedDate?: Date;
}

export interface MeasurementType {
  measurementTypeId: number;
  typeCode: string;
  typeNameEN: string;
  typeNameAR: string;
  description?: string;
  defaultUnitOfMeasure: string;
  standardValue?: number;
  minValue?: number;
  maxValue?: number;
  isActive: boolean;
  createdBy: number;
  createdDate: Date;
  lastModifiedBy?: number;
  lastModifiedDate?: Date;
}

export interface Measurement {
  measurementId: number;
  roomAssessmentId: number;
  measurementTypeId: number;
  value: number;
  unitOfMeasure: string;
  isCompliant?: boolean;
  standardValue?: number;
  notes?: string;
  isActive: boolean;
  createdBy: number;
  createdDate: Date;
  lastModifiedBy?: number;
  lastModifiedDate?: Date;
}

export interface RecommendationType {
  recommendationTypeId: number;
  typeCode: string;
  typeNameEN: string;
  typeNameAR: string;
  description?: string;
  isActive: boolean;
  createdBy: number;
  createdDate: Date;
  lastModifiedBy?: number;
  lastModifiedDate?: Date;
}

export interface Recommendation {
  recommendationId: number;
  roomAssessmentId: number;
  recommendationTypeId: number;
  priorityLevel: number; // 1=High, 2=Medium, 3=Low
  description: string;
  reason?: string;
  estimatedCost?: number;
  isSelected: boolean;
  isApproved: boolean;
  approvedBy?: number;
  approvalDate?: Date;
  isActive: boolean;
  createdBy: number;
  createdDate: Date;
  lastModifiedBy?: number;
  lastModifiedDate?: Date;
}

// Project Management Types
export interface Cohort {
  cohortId: number;
  cohortCode: string;
  cohortNameEN: string;
  cohortNameAR: string;
  startDate: Date;
  endDate?: Date;
  clientTypeId: number;
  totalBudget?: number;
  maxBeneficiaryCount?: number;
  currentBeneficiaryCount: number;
  statusId: number;
  description?: string;
  isActive: boolean;
  createdBy: number;
  createdDate: Date;
  lastModifiedBy?: number;
  lastModifiedDate?: Date;
}

export interface Project {
  projectId: number;
  projectCode: string;
  projectNameEN: string;
  projectNameAR: string;
  assessmentId: number;
  seniorCitizenId: number;
  projectManagerId: number;
  startDate?: Date;
  plannedEndDate?: Date;
  actualEndDate?: Date;
  statusId: number;
  budgetAmount: number;
  actualCost?: number;
  completionPercentage: number;
  cohortId?: number;
  clientTypeId: number;
  notes?: string;
  isActive: boolean;
  createdBy: number;
  createdDate: Date;
  lastModifiedBy?: number;
  lastModifiedDate?: Date;
}

export interface Task {
  taskId: number;
  taskCode: string;
  projectId: number;
  taskNameEN: string;
  taskNameAR: string;
  description?: string;
  roomId?: number;
  assignedToId?: number;
  startDate?: Date;
  dueDate?: Date;
  completionDate?: Date;
  statusId: number;
  priorityLevel: number; // 1=High, 2=Medium, 3=Low
  completionPercentage: number;
  dependsOnTaskId?: number;
  estimatedHours?: number;
  actualHours?: number;
  notes?: string;
  isActive: boolean;
  createdBy: number;
  createdDate: Date;
  lastModifiedBy?: number;
  lastModifiedDate?: Date;
}

// FDF-Specific Types
export interface MentalHealthAssessment {
  mentalHealthAssessmentId: number;
  assessmentId: number;
  cognitiveScore?: number;
  emotionalScore?: number;
  socialScore?: number;
  selfCareScore?: number;
  riskAssessmentScore?: number;
  totalScore?: number;
  recommendationEN?: string;
  recommendationAR?: string;
  assessorId: number;
  assessmentDate: Date;
  notes?: string;
  isActive: boolean;
  createdBy: number;
  createdDate: Date;
  lastModifiedBy?: number;
  lastModifiedDate?: Date;
}

// ADHA-Specific Types
export interface AccessibilityRequirement {
  accessibilityRequirementId: number;
  assessmentId: number;
  requirementCode: string;
  requirementNameEN: string;
  requirementNameAR: string;
  description?: string;
  standardReference?: string;
  isMandatory: boolean;
  complianceStatus: number; // 1=Compliant, 2=Non-Compliant, 3=Not Applicable
  remediationPlan?: string;
  estimatedCost?: number;
  notes?: string;
  isActive: boolean;
  createdBy: number;
  createdDate: Date;
  lastModifiedBy?: number;
  lastModifiedDate?: Date;
}
