// Cohort API Types for Barakatna Platform

// Cohort Type
export interface CohortType {
  cohortTypeId: number;
  typeCode: string;
  typeNameEN: string;
  typeNameAR: string;
  description?: string;
  isActive: boolean;
}

// Cohort
export interface Cohort {
  cohortId: number;
  cohortCode: string;
  cohortName: string;
  cohortTypeId: number;
  description?: string;
  startDate: Date;
  endDate?: Date;
  statusId: number;
  locationId?: number;
  maxCapacity: number;
  currentMemberCount: number;
  coordinatorId?: number;
  notes?: string;
  createdBy: number;
  createdDate: Date;
  lastModifiedBy?: number;
  lastModifiedDate?: Date;
  isActive: boolean;
}

// Cohort Member
export interface CohortMember {
  memberId: number;
  cohortId: number;
  beneficiaryId: string;
  joinDate: Date;
  exitDate?: Date;
  statusId: number;
  attendanceRate?: number;
  notes?: string;
  createdBy: number;
  createdDate: Date;
  lastModifiedBy?: number;
  lastModifiedDate?: Date;
  isActive: boolean;
}

// Create Cohort Request
export interface CreateCohortRequest {
  cohortCode: string;
  cohortName: string;
  cohortTypeId: number;
  description?: string;
  startDate: Date;
  endDate?: Date;
  statusId: number;
  locationId?: number;
  maxCapacity: number;
  coordinatorId?: number;
  notes?: string;
}

// Update Cohort Request
export interface UpdateCohortRequest {
  cohortCode?: string;
  cohortName?: string;
  cohortTypeId?: number;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  statusId?: number;
  locationId?: number;
  maxCapacity?: number;
  coordinatorId?: number;
  notes?: string;
  isActive?: boolean;
}

// Create Cohort Member Request
export interface CreateCohortMemberRequest {
  cohortId: number;
  beneficiaryId: string;
  joinDate: Date;
  exitDate?: Date;
  statusId: number;
  notes?: string;
}

// Update Cohort Member Request
export interface UpdateCohortMemberRequest {
  joinDate?: Date;
  exitDate?: Date;
  statusId?: number;
  attendanceRate?: number;
  notes?: string;
  isActive?: boolean;
}

// Cohort Filter Parameters
export interface CohortFilterParams {
  cohortCode?: string;
  cohortName?: string;
  cohortTypeId?: number;
  statusId?: number;
  coordinatorId?: number;
  startDateFrom?: Date;
  startDateTo?: Date;
  endDateFrom?: Date;
  endDateTo?: Date;
  hasAvailableCapacity?: boolean;
}

// Cohort Member Filter Parameters
export interface CohortMemberFilterParams {
  cohortId?: number;
  beneficiaryId?: string;
  statusId?: number;
  joinDateFrom?: Date;
  joinDateTo?: Date;
  exitDateFrom?: Date;
  exitDateTo?: Date;
  attendanceRateFrom?: number;
  attendanceRateTo?: number;
}
