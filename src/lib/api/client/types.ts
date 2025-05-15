// Client API Types for Barakatna Platform

// Client Type
export interface ClientType {
  clientTypeId: number;
  typeCode: string;
  typeNameEN: string;
  typeNameAR: string;
  description?: string;
  isActive: boolean;
  createdBy: number;
  createdDate: Date;
  lastModifiedBy?: number;
  lastModifiedDate?: Date;
  adminFeatures?: ClientTypeAdminFeatures;
}

// Client Type Admin Features
export interface ClientTypeAdminFeatures {
  // FDF Client Features
  socialWorkerRoleManagement?: boolean;
  familyAssessmentTemplates?: boolean;
  socialImpactMeasurement?: boolean;
  communityProgramIntegration?: boolean;
  specializedDocumentRequirements?: boolean;

  // ADHA Client Features
  governmentOfficerRoleManagement?: boolean;
  propertyDatabaseIntegration?: boolean;
  regulatoryComplianceConfiguration?: boolean;
  governmentReportingTemplates?: boolean;
  officialDocumentManagement?: boolean;

  // Cash Client Features
  paymentProcessorConfiguration?: boolean;
  invoiceTemplateManagement?: boolean;
  priceListAdministration?: boolean;
  discountPromotionManagement?: boolean;
  contractManagementSettings?: boolean;
}

// Client-Supplier Association
export interface ClientSupplierAssociation {
  clientSupplierId: number;
  clientId: number;
  supplierId: number;
  status: "active" | "inactive" | "pending" | "blacklisted";
  isPreferred: boolean;
  startDate: Date;
  endDate?: Date;
  contractUrl?: string;
  paymentTerms?: string;
  discountPercentage?: number;
  notes?: string;
  createdBy: number;
  createdDate: Date;
  lastModifiedBy?: number;
  lastModifiedDate?: Date;
  isActive: boolean;
  supplier?: any; // Supplier details when populated
}

// Client-Supplier Service Agreement
export interface ClientSupplierServiceAgreement {
  agreementId: number;
  clientSupplierId: number;
  agreementCode: string;
  title: string;
  description?: string;
  startDate: Date;
  endDate?: Date;
  renewalDate?: Date;
  autoRenewal: boolean;
  documentUrl?: string;
  termsAndConditions?: string;
  paymentTerms?: string;
  discountPercentage?: number;
  statusId: number;
  status?: string; // Status name when populated
  createdBy: number;
  createdDate: Date;
  lastModifiedBy?: number;
  lastModifiedDate?: Date;
  isActive: boolean;
  items?: ClientSupplierServiceAgreementItem[];
}

// Client-Supplier Service Agreement Item
export interface ClientSupplierServiceAgreementItem {
  itemId: number;
  agreementId: number;
  serviceId?: number;
  productId?: number;
  description: string;
  quantity?: number;
  unitPrice?: number;
  discountPercentage?: number;
  taxPercentage?: number;
  totalPrice?: number;
  notes?: string;
  createdBy: number;
  createdDate: Date;
  lastModifiedBy?: number;
  lastModifiedDate?: Date;
  isActive: boolean;
}

// Senior Citizen
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
  locationGPS?: any;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;
  primaryLanguage?: string;
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

// Property
export interface Property {
  propertyId: number;
  seniorCitizenId: number;
  propertyTypeId: number;
  ownershipTypeId: number;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  region: string;
  postalCode?: string;
  locationGPS?: any;
  yearOfConstruction?: number;
  totalArea?: number;
  numberOfFloors?: number;
  numberOfBedrooms?: number;
  numberOfBathrooms?: number;
  hasElevator?: boolean;
  hasGarden?: boolean;
  hasGarage?: boolean;
  notes?: string;
  createdBy: number;
  createdDate: Date;
  lastModifiedBy?: number;
  lastModifiedDate?: Date;
  isActive: boolean;
}

// Property Type
export interface PropertyType {
  propertyTypeId: number;
  typeCode: string;
  typeNameEN: string;
  typeNameAR: string;
  description?: string;
  isActive: boolean;
}

// Ownership Type
export interface OwnershipType {
  ownershipTypeId: number;
  typeCode: string;
  typeNameEN: string;
  typeNameAR: string;
  description?: string;
  isActive: boolean;
}

// Create Senior Citizen Request
export interface CreateSeniorCitizenRequest {
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
  locationGPS?: any;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;
  primaryLanguage?: string;
  communicationPreference?: string;
  mobilityStatus?: string;
  statusId: number;
}

// Update Senior Citizen Request
export interface UpdateSeniorCitizenRequest {
  clientTypeId?: number;
  seniorCitizenCode?: string;
  firstNameEN?: string;
  lastNameEN?: string;
  firstNameAR?: string;
  lastNameAR?: string;
  dateOfBirth?: Date;
  gender?: "M" | "F";
  nationalId?: string;
  phone?: string;
  mobile?: string;
  email?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  region?: string;
  postalCode?: string;
  locationGPS?: any;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelation?: string;
  primaryLanguage?: string;
  communicationPreference?: string;
  mobilityStatus?: string;
  statusId?: number;
  isActive?: boolean;
}

// Create Property Request
export interface CreatePropertyRequest {
  seniorCitizenId: number;
  propertyTypeId: number;
  ownershipTypeId: number;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  region: string;
  postalCode?: string;
  locationGPS?: any;
  yearOfConstruction?: number;
  totalArea?: number;
  numberOfFloors?: number;
  numberOfBedrooms?: number;
  numberOfBathrooms?: number;
  hasElevator?: boolean;
  hasGarden?: boolean;
  hasGarage?: boolean;
  notes?: string;
}

// Update Property Request
export interface UpdatePropertyRequest {
  propertyTypeId?: number;
  ownershipTypeId?: number;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  region?: string;
  postalCode?: string;
  locationGPS?: any;
  yearOfConstruction?: number;
  totalArea?: number;
  numberOfFloors?: number;
  numberOfBedrooms?: number;
  numberOfBathrooms?: number;
  hasElevator?: boolean;
  hasGarden?: boolean;
  hasGarage?: boolean;
  notes?: string;
  isActive?: boolean;
}

// Senior Citizen Filter Parameters
export interface SeniorCitizenFilterParams {
  seniorCitizenCode?: string;
  clientTypeId?: number;
  firstNameEN?: string;
  lastNameEN?: string;
  firstNameAR?: string;
  lastNameAR?: string;
  nationalId?: string;
  mobile?: string;
  email?: string;
  city?: string;
  region?: string;
  statusId?: number;
  dateOfBirthFrom?: Date;
  dateOfBirthTo?: Date;
  registrationDateFrom?: Date;
  registrationDateTo?: Date;
}

// Property Filter Parameters
export interface PropertyFilterParams {
  seniorCitizenId?: number;
  propertyTypeId?: number;
  ownershipTypeId?: number;
  city?: string;
  region?: string;
  yearOfConstructionFrom?: number;
  yearOfConstructionTo?: number;
  totalAreaFrom?: number;
  totalAreaTo?: number;
  numberOfBedroomsFrom?: number;
  numberOfBedroomsTo?: number;
  numberOfBathroomsFrom?: number;
  numberOfBathroomsTo?: number;
  hasElevator?: boolean;
  hasGarden?: boolean;
  hasGarage?: boolean;
}
