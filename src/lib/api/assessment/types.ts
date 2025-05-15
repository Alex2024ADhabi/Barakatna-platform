// Assessment API Types for Barakatna Platform

// Assessment Type
export interface AssessmentType {
  assessmentTypeId: number;
  typeCode: string;
  typeNameEN: string;
  typeNameAR: string;
  description?: string;
  isActive: boolean;
}

// Assessment
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
  notes?: string;
  createdBy: number;
  createdDate: Date;
  lastModifiedBy?: number;
  lastModifiedDate?: Date;
  isActive: boolean;
}

// Room Type
export interface RoomType {
  roomTypeId: number;
  typeCode: string;
  typeNameEN: string;
  typeNameAR: string;
  description?: string;
  isActive: boolean;
}

// Room Assessment
export interface RoomAssessment {
  roomAssessmentId: number;
  assessmentId: number;
  roomTypeId: number;
  roomName: string;
  completionStatus: boolean;
  notes?: string;
  createdBy: number;
  createdDate: Date;
  lastModifiedBy?: number;
  lastModifiedDate?: Date;
  isActive: boolean;
}

// Create Assessment Request
export interface CreateAssessmentRequest {
  assessmentCode: string;
  seniorCitizenId: number;
  assessmentTypeId: number;
  propertyId: number;
  assessmentDate: Date;
  assessorId: number;
  supervisorId?: number;
  statusId: number;
  notes?: string;
}

// Update Assessment Request
export interface UpdateAssessmentRequest {
  assessmentCode?: string;
  seniorCitizenId?: number;
  assessmentTypeId?: number;
  propertyId?: number;
  assessmentDate?: Date;
  assessorId?: number;
  supervisorId?: number;
  statusId?: number;
  completionDate?: Date;
  approvalDate?: Date;
  totalEstimatedCost?: number;
  notes?: string;
  isActive?: boolean;
}

// Create Room Assessment Request
export interface CreateRoomAssessmentRequest {
  assessmentId: number;
  roomTypeId: number;
  roomName: string;
  completionStatus?: boolean;
  notes?: string;
}

// Update Room Assessment Request
export interface UpdateRoomAssessmentRequest {
  roomTypeId?: number;
  roomName?: string;
  completionStatus?: boolean;
  notes?: string;
  isActive?: boolean;
}

// Assessment Filter Parameters
export interface AssessmentFilterParams {
  assessmentCode?: string;
  seniorCitizenId?: number;
  assessmentTypeId?: number;
  propertyId?: number;
  assessorId?: number;
  supervisorId?: number;
  statusId?: number;
  assessmentDateFrom?: Date;
  assessmentDateTo?: Date;
  completionDateFrom?: Date;
  completionDateTo?: Date;
  approvalDateFrom?: Date;
  approvalDateTo?: Date;
}

// Room Assessment Filter Parameters
export interface RoomAssessmentFilterParams {
  assessmentId?: number;
  roomTypeId?: number;
  roomName?: string;
  completionStatus?: boolean;
}
