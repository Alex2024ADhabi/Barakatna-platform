// Beneficiary API Types for Barakatna Platform

// Beneficiary Type
export interface Beneficiary {
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
  clientTypeName: string;
  statusId: number;
  statusName: string;
  isActive: boolean;
  createdBy: number;
  createdDate: Date;
  lastModifiedBy?: number;
  lastModifiedDate?: Date;
}

// Address Type
export interface Address {
  emirate: string;
  area: string;
  street: string;
  buildingVilla: string;
  gpsCoordinates?: string;
}

// Property Details Type
export interface PropertyDetails {
  propertyType: string;
  ownership: string;
  bedrooms: number;
  bathrooms: number;
  floors: number;
  yearOfConstruction: number;
}

// Create Beneficiary Request
export interface CreateBeneficiaryRequest {
  emiratesId: string;
  fullNameEn: string;
  fullNameAr: string;
  dateOfBirth: Date | null;
  gender: string;
  contactNumber: string;
  secondaryContactNumber?: string;
  address: Address;
  propertyDetails: PropertyDetails;
  clientTypeId: number; // 1: FDF, 2: ADHA, 3: Cash-Based
  statusId?: number;
}

// Update Beneficiary Request
export interface UpdateBeneficiaryRequest {
  emiratesId?: string;
  fullNameEn?: string;
  fullNameAr?: string;
  dateOfBirth?: Date | null;
  gender?: string;
  contactNumber?: string;
  secondaryContactNumber?: string;
  address?: Partial<Address>;
  propertyDetails?: Partial<PropertyDetails>;
  clientTypeId?: number;
  statusId?: number;
  isActive?: boolean;
}

// Beneficiary Filter Parameters
export interface BeneficiaryFilterParams {
  searchText?: string;
  clientTypeId?: number;
  gender?: string;
  emirate?: string;
  registrationDateFrom?: Date;
  registrationDateTo?: Date;
  statusId?: number;
  isActive?: boolean;
}

// Beneficiary Summary
export interface BeneficiarySummary {
  totalBeneficiaries: number;
  activeBeneficiaries: number;
  inactiveBeneficiaries: number;
  beneficiariesByClientType: { clientType: string; count: number }[];
  beneficiariesByEmirate: { emirate: string; count: number }[];
  beneficiariesByGender: { gender: string; count: number }[];
  beneficiariesByAge: { ageRange: string; count: number }[];
  beneficiariesByMonth: { month: string; count: number }[];
}
