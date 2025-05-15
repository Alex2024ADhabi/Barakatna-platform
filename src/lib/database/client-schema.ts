// Client Domain Schema for Barakatna Platform

// This file defines the client-related database schema structure that maps to SQL tables
// It can be used with an ORM like Prisma or TypeORM, or with raw SQL queries

// Client Type Schema
export const clientTypeSchema = {
  tableName: "ClientType",
  columns: {
    clientTypeId: { type: "INT", primaryKey: true, autoIncrement: true },
    typeCode: { type: "VARCHAR(20)", notNull: true, unique: true },
    typeNameEN: { type: "NVARCHAR(100)", notNull: true },
    typeNameAR: { type: "NVARCHAR(100)", notNull: true },
    description: { type: "NVARCHAR(500)" },
    isActive: { type: "BIT", notNull: true, default: 1 },
    createdBy: {
      type: "INT",
      notNull: true,
      foreignKey: { table: "User", column: "userId" },
    },
    createdDate: { type: "DATETIME", notNull: true, default: "GETDATE()" },
    lastModifiedBy: {
      type: "INT",
      foreignKey: { table: "User", column: "userId" },
    },
    lastModifiedDate: { type: "DATETIME" },
  },
};

// Client Schema
export const clientSchema = {
  tableName: "Client",
  columns: {
    clientId: { type: "INT", primaryKey: true, autoIncrement: true },
    clientTypeId: {
      type: "INT",
      notNull: true,
      foreignKey: { table: "ClientType", column: "clientTypeId" },
    },
    clientCode: { type: "VARCHAR(20)", notNull: true, unique: true },
    nameEN: { type: "NVARCHAR(100)", notNull: true },
    nameAR: { type: "NVARCHAR(100)", notNull: true },
    description: { type: "NVARCHAR(500)" },
    contactPersonName: { type: "NVARCHAR(100)" },
    contactPersonEmail: { type: "VARCHAR(100)" },
    contactPersonPhone: { type: "VARCHAR(20)" },
    addressLine1: { type: "NVARCHAR(100)" },
    addressLine2: { type: "NVARCHAR(100)" },
    city: { type: "NVARCHAR(50)" },
    region: { type: "NVARCHAR(50)" },
    postalCode: { type: "VARCHAR(20)" },
    country: { type: "VARCHAR(50)", default: "'United Arab Emirates'" },
    logoUrl: { type: "VARCHAR(255)" },
    websiteUrl: { type: "VARCHAR(255)" },
    registrationDate: { type: "DATETIME", notNull: true, default: "GETDATE()" },
    statusId: {
      type: "INT",
      notNull: true,
      foreignKey: { table: "Status", column: "statusId" },
    },
    createdBy: {
      type: "INT",
      notNull: true,
      foreignKey: { table: "User", column: "userId" },
    },
    createdDate: { type: "DATETIME", notNull: true, default: "GETDATE()" },
    lastModifiedBy: {
      type: "INT",
      foreignKey: { table: "User", column: "userId" },
    },
    lastModifiedDate: { type: "DATETIME" },
    isActive: { type: "BIT", notNull: true, default: 1 },
  },
};

// Client Configuration Schema
export const clientConfigurationSchema = {
  tableName: "ClientConfiguration",
  columns: {
    configurationId: { type: "INT", primaryKey: true, autoIncrement: true },
    clientId: {
      type: "INT",
      notNull: true,
      foreignKey: { table: "Client", column: "clientId" },
      unique: true,
    },
    configurationJson: { type: "NVARCHAR(MAX)", notNull: true },
    versionNumber: { type: "INT", notNull: true, default: 1 },
    isActive: { type: "BIT", notNull: true, default: 1 },
    createdBy: {
      type: "INT",
      notNull: true,
      foreignKey: { table: "User", column: "userId" },
    },
    createdDate: { type: "DATETIME", notNull: true, default: "GETDATE()" },
    lastModifiedBy: {
      type: "INT",
      foreignKey: { table: "User", column: "userId" },
    },
    lastModifiedDate: { type: "DATETIME" },
  },
};

// Client Configuration History Schema
export const clientConfigurationHistorySchema = {
  tableName: "ClientConfigurationHistory",
  columns: {
    historyId: { type: "INT", primaryKey: true, autoIncrement: true },
    clientId: {
      type: "INT",
      notNull: true,
      foreignKey: { table: "Client", column: "clientId" },
    },
    configurationJson: { type: "NVARCHAR(MAX)", notNull: true },
    versionNumber: { type: "INT", notNull: true },
    comment: { type: "NVARCHAR(500)" },
    isSnapshot: { type: "BIT", notNull: true, default: 0 },
    snapshotName: { type: "NVARCHAR(100)" },
    createdBy: {
      type: "INT",
      notNull: true,
      foreignKey: { table: "User", column: "userId" },
    },
    createdDate: { type: "DATETIME", notNull: true, default: "GETDATE()" },
  },
};

// Senior Citizen Schema
export const seniorCitizenSchema = {
  tableName: "SeniorCitizen",
  columns: {
    seniorCitizenId: { type: "INT", primaryKey: true, autoIncrement: true },
    clientId: {
      type: "INT",
      notNull: true,
      foreignKey: { table: "Client", column: "clientId" },
    },
    clientTypeId: {
      type: "INT",
      notNull: true,
      foreignKey: { table: "ClientType", column: "clientTypeId" },
    },
    seniorCitizenCode: { type: "VARCHAR(20)", notNull: true, unique: true },
    firstNameEN: { type: "NVARCHAR(50)", notNull: true },
    lastNameEN: { type: "NVARCHAR(50)", notNull: true },
    firstNameAR: { type: "NVARCHAR(50)", notNull: true },
    lastNameAR: { type: "NVARCHAR(50)", notNull: true },
    dateOfBirth: { type: "DATE", notNull: true },
    gender: { type: "CHAR(1)", notNull: true, check: "gender IN ('M', 'F')" },
    nationalId: { type: "VARCHAR(20)", notNull: true },
    phone: { type: "VARCHAR(20)" },
    mobile: { type: "VARCHAR(20)", notNull: true },
    email: { type: "VARCHAR(100)" },
    addressLine1: { type: "NVARCHAR(100)", notNull: true },
    addressLine2: { type: "NVARCHAR(100)" },
    city: { type: "NVARCHAR(50)", notNull: true },
    region: { type: "NVARCHAR(50)", notNull: true },
    postalCode: { type: "VARCHAR(20)" },
    locationGPS: { type: "GEOGRAPHY" },
    emergencyContactName: { type: "NVARCHAR(100)" },
    emergencyContactPhone: { type: "VARCHAR(20)" },
    emergencyContactRelation: { type: "NVARCHAR(50)" },
    primaryLanguage: { type: "VARCHAR(20)", default: "'Arabic'" },
    communicationPreference: { type: "VARCHAR(20)" },
    mobilityStatus: { type: "VARCHAR(20)" },
    registrationDate: { type: "DATETIME", notNull: true, default: "GETDATE()" },
    statusId: {
      type: "INT",
      notNull: true,
      foreignKey: { table: "Status", column: "statusId" },
    },
    createdBy: {
      type: "INT",
      notNull: true,
      foreignKey: { table: "User", column: "userId" },
    },
    createdDate: { type: "DATETIME", notNull: true, default: "GETDATE()" },
    lastModifiedBy: {
      type: "INT",
      foreignKey: { table: "User", column: "userId" },
    },
    lastModifiedDate: { type: "DATETIME" },
    isActive: { type: "BIT", notNull: true, default: 1 },
  },
};

// Property Schema
export const propertySchema = {
  tableName: "Property",
  columns: {
    propertyId: { type: "INT", primaryKey: true, autoIncrement: true },
    seniorCitizenId: {
      type: "INT",
      notNull: true,
      foreignKey: { table: "SeniorCitizen", column: "seniorCitizenId" },
    },
    propertyTypeId: {
      type: "INT",
      notNull: true,
      foreignKey: { table: "PropertyType", column: "propertyTypeId" },
    },
    ownershipTypeId: {
      type: "INT",
      notNull: true,
      foreignKey: { table: "OwnershipType", column: "ownershipTypeId" },
    },
    addressLine1: { type: "NVARCHAR(100)", notNull: true },
    addressLine2: { type: "NVARCHAR(100)" },
    city: { type: "NVARCHAR(50)", notNull: true },
    region: { type: "NVARCHAR(50)", notNull: true },
    postalCode: { type: "VARCHAR(20)" },
    locationGPS: { type: "GEOGRAPHY" },
    yearOfConstruction: { type: "INT" },
    totalArea: { type: "DECIMAL(10,2)" },
    numberOfFloors: { type: "INT" },
    numberOfBedrooms: { type: "INT" },
    numberOfBathrooms: { type: "INT" },
    hasElevator: { type: "BIT" },
    hasGarden: { type: "BIT" },
    hasGarage: { type: "BIT" },
    notes: { type: "NVARCHAR(500)" },
    createdBy: {
      type: "INT",
      notNull: true,
      foreignKey: { table: "User", column: "userId" },
    },
    createdDate: { type: "DATETIME", notNull: true, default: "GETDATE()" },
    lastModifiedBy: {
      type: "INT",
      foreignKey: { table: "User", column: "userId" },
    },
    lastModifiedDate: { type: "DATETIME" },
    isActive: { type: "BIT", notNull: true, default: 1 },
  },
};

// Property Type Schema
export const propertyTypeSchema = {
  tableName: "PropertyType",
  columns: {
    propertyTypeId: { type: "INT", primaryKey: true, autoIncrement: true },
    typeCode: { type: "VARCHAR(20)", notNull: true, unique: true },
    typeNameEN: { type: "NVARCHAR(100)", notNull: true },
    typeNameAR: { type: "NVARCHAR(100)", notNull: true },
    description: { type: "NVARCHAR(500)" },
    isActive: { type: "BIT", notNull: true, default: 1 },
  },
};

// Ownership Type Schema
export const ownershipTypeSchema = {
  tableName: "OwnershipType",
  columns: {
    ownershipTypeId: { type: "INT", primaryKey: true, autoIncrement: true },
    typeCode: { type: "VARCHAR(20)", notNull: true, unique: true },
    typeNameEN: { type: "NVARCHAR(100)", notNull: true },
    typeNameAR: { type: "NVARCHAR(100)", notNull: true },
    description: { type: "NVARCHAR(500)" },
    isActive: { type: "BIT", notNull: true, default: 1 },
  },
};

// Client Configuration Interface
export interface ClientConfiguration {
  theme: {
    primaryColor: string;
    secondaryColor: string;
    logoUrl?: string;
    fontFamily?: string;
    rtlSupport?: boolean;
    darkMode?: boolean;
    customCSS?: string;
  };
  features: {
    assessments: boolean;
    projects: boolean;
    committees: boolean;
    financials: boolean;
    inventory?: boolean;
    reporting?: boolean;
    seniorCitizenManagement?: boolean;
    propertyManagement?: boolean;
    supplierManagement?: boolean;
    qualityControl?: boolean;
    budgetPlanning?: boolean;
    resourceAllocation?: boolean;
  };
  workflow: {
    approvalLevels: number;
    requiresCommitteeApproval: boolean;
    skipFinancialVerification?: boolean;
    autoCloseProjects?: boolean;
    maxDaysToComplete?: number;
    autoAssignProjects: boolean;
    notificationFrequency?: "daily" | "weekly" | "immediate";
    escalationThreshold?: number;
    reminderDays?: number;
  };
  financial: {
    currency: string;
    taxRate: number;
    paymentTerms: string;
    budgetCycle: "annual" | "quarterly" | "monthly" | "per-project";
    usesCustomPriceList?: boolean;
    priceListId?: string;
    discountPercentage?: number;
    allowNegotiation?: boolean;
    customSupplierList?: boolean;
    vatRegistered?: boolean;
    vatNumber?: string;
    fiscalYearStart?: string;
    budgetApprovalThreshold?: number;
  };
  beneficiary: {
    maxProjectsPerBeneficiary?: number;
    requiresVerification?: boolean;
    verificationDocuments?: string[];
    followUpFrequency?: number;
    priorityCategories?: string[];
    eligibilityCriteria?: Record<string, any>;
  };
  security: {
    approvalHierarchy?: string;
    documentRequirements?: string;
    dataRetentionPeriod?: number;
    accessLevels?: string[];
    twoFactorRequired?: boolean;
    passwordPolicy?: Record<string, any>;
  };
  integration: {
    externalSystems?: string[];
    apiKeys?: Record<string, string>;
    webhookEndpoints?: string[];
    dataExportSchedule?: string;
    importSettings?: Record<string, any>;
  };
  supplier: {
    preferredSuppliers?: string[];
    approvedSuppliers?: string[];
    blacklistedSuppliers?: string[];
    requireApproval?: boolean;
    approvalWorkflow?: string;
    qualityThreshold?: number;
    autoRenewalEnabled?: boolean;
    contractDuration?: number;
    paymentTerms?: string;
    discountSettings?: Record<string, any>;
    evaluationCriteria?: string[];
    documentRequirements?: string[];
  };
  notes?: string;
  customFields?: Record<
    string,
    {
      type: string;
      label: string;
      required?: boolean;
      options?: string[];
      defaultValue?: any;
      validation?: string;
      dependsOn?: string;
      visibilityCondition?: string;
    }
  >;
  metadata?: Record<string, any>;
  version?: number;
  lastUpdated?: string;
  updatedBy?: string;
}

// Client Interface
export interface Client {
  clientId: number;
  clientTypeId: number;
  clientType: ClientType;
  clientCode: string;
  nameEN: string;
  nameAR: string;
  description?: string;
  contactPersonName?: string;
  contactPersonEmail?: string;
  contactPersonPhone?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  region?: string;
  postalCode?: string;
  country?: string;
  logoUrl?: string;
  websiteUrl?: string;
  registrationDate: Date;
  statusId: number;
  status?: string;
  isActive: boolean;
  createdBy: number;
  createdDate: Date;
  lastModifiedBy?: number;
  lastModifiedDate?: Date;
  configuration?: ClientConfiguration;
  tags?: string[];
  parentClientId?: number;
  subsidiaries?: Client[];
  accountManager?: number;
  contractStartDate?: Date;
  contractEndDate?: Date;
  renewalDate?: Date;
  serviceLevel?: string;
  customAttributes?: Record<string, any>;
}
