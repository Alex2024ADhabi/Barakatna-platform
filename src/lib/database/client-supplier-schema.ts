// Client-Supplier Relationship Schema for Barakatna Platform

// This file defines the client-supplier relationship database schema structure
// that maps to SQL tables. It can be used with an ORM like Prisma or TypeORM,
// or with raw SQL queries.

// Client-Supplier Association Schema
export const clientSupplierSchema = {
  tableName: "ClientSupplier",
  columns: {
    clientSupplierId: { type: "INT", primaryKey: true, autoIncrement: true },
    clientId: {
      type: "INT",
      notNull: true,
      foreignKey: { table: "Client", column: "clientId" },
    },
    supplierId: {
      type: "INT",
      notNull: true,
      foreignKey: { table: "Supplier", column: "supplierId" },
    },
    status: {
      type: "VARCHAR(20)",
      notNull: true,
      check: "status IN ('active', 'inactive', 'pending', 'blacklisted')",
    },
    isPreferred: { type: "BIT", notNull: true, default: 0 },
    startDate: { type: "DATE", notNull: true },
    endDate: { type: "DATE" },
    contractUrl: { type: "VARCHAR(255)" },
    paymentTerms: { type: "VARCHAR(50)" },
    discountPercentage: { type: "DECIMAL(5,2)" },
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
  uniqueConstraints: [
    {
      name: "UQ_ClientSupplier_ClientId_SupplierId",
      columns: ["clientId", "supplierId"],
    },
  ],
};

// Client-Supplier Service Agreement Schema
export const clientSupplierServiceAgreementSchema = {
  tableName: "ClientSupplierServiceAgreement",
  columns: {
    agreementId: { type: "INT", primaryKey: true, autoIncrement: true },
    clientSupplierId: {
      type: "INT",
      notNull: true,
      foreignKey: {
        table: "ClientSupplier",
        column: "clientSupplierId",
      },
    },
    agreementCode: { type: "VARCHAR(20)", notNull: true, unique: true },
    title: { type: "NVARCHAR(100)", notNull: true },
    description: { type: "NVARCHAR(500)" },
    startDate: { type: "DATE", notNull: true },
    endDate: { type: "DATE" },
    renewalDate: { type: "DATE" },
    autoRenewal: { type: "BIT", notNull: true, default: 0 },
    documentUrl: { type: "VARCHAR(255)" },
    termsAndConditions: { type: "NVARCHAR(MAX)" },
    paymentTerms: { type: "VARCHAR(50)" },
    discountPercentage: { type: "DECIMAL(5,2)" },
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

// Client-Supplier Service Agreement Item Schema
export const clientSupplierServiceAgreementItemSchema = {
  tableName: "ClientSupplierServiceAgreementItem",
  columns: {
    itemId: { type: "INT", primaryKey: true, autoIncrement: true },
    agreementId: {
      type: "INT",
      notNull: true,
      foreignKey: {
        table: "ClientSupplierServiceAgreement",
        column: "agreementId",
      },
    },
    serviceId: {
      type: "INT",
      foreignKey: { table: "Service", column: "serviceId" },
    },
    productId: {
      type: "INT",
      foreignKey: { table: "Product", column: "productId" },
    },
    description: { type: "NVARCHAR(200)", notNull: true },
    quantity: { type: "DECIMAL(10,2)" },
    unitPrice: { type: "DECIMAL(10,2)" },
    discountPercentage: { type: "DECIMAL(5,2)" },
    taxPercentage: { type: "DECIMAL(5,2)" },
    totalPrice: { type: "DECIMAL(10,2)" },
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

// Client-Supplier Evaluation Schema
export const clientSupplierEvaluationSchema = {
  tableName: "ClientSupplierEvaluation",
  columns: {
    evaluationId: { type: "INT", primaryKey: true, autoIncrement: true },
    clientSupplierId: {
      type: "INT",
      notNull: true,
      foreignKey: {
        table: "ClientSupplier",
        column: "clientSupplierId",
      },
    },
    evaluationDate: { type: "DATE", notNull: true },
    evaluationPeriodStart: { type: "DATE" },
    evaluationPeriodEnd: { type: "DATE" },
    overallRating: { type: "DECIMAL(3,1)", notNull: true },
    qualityRating: { type: "DECIMAL(3,1)" },
    deliveryRating: { type: "DECIMAL(3,1)" },
    costRating: { type: "DECIMAL(3,1)" },
    serviceRating: { type: "DECIMAL(3,1)" },
    communicationRating: { type: "DECIMAL(3,1)" },
    strengths: { type: "NVARCHAR(500)" },
    weaknesses: { type: "NVARCHAR(500)" },
    recommendations: { type: "NVARCHAR(500)" },
    evaluatedBy: {
      type: "INT",
      notNull: true,
      foreignKey: { table: "User", column: "userId" },
    },
    approvedBy: {
      type: "INT",
      foreignKey: { table: "User", column: "userId" },
    },
    approvalDate: { type: "DATETIME" },
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

// Client-Supplier Interfaces

// Client-Supplier Association Interface
export interface ClientSupplier {
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
  client?: any; // Client details when populated
  serviceAgreements?: ClientSupplierServiceAgreement[];
  evaluations?: ClientSupplierEvaluation[];
}

// Client-Supplier Service Agreement Interface
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
  clientSupplier?: ClientSupplier;
}

// Client-Supplier Service Agreement Item Interface
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
  service?: any; // Service details when populated
  product?: any; // Product details when populated
}

// Client-Supplier Evaluation Interface
export interface ClientSupplierEvaluation {
  evaluationId: number;
  clientSupplierId: number;
  evaluationDate: Date;
  evaluationPeriodStart?: Date;
  evaluationPeriodEnd?: Date;
  overallRating: number;
  qualityRating?: number;
  deliveryRating?: number;
  costRating?: number;
  serviceRating?: number;
  communicationRating?: number;
  strengths?: string;
  weaknesses?: string;
  recommendations?: string;
  evaluatedBy: number;
  approvedBy?: number;
  approvalDate?: Date;
  notes?: string;
  createdBy: number;
  createdDate: Date;
  lastModifiedBy?: number;
  lastModifiedDate?: Date;
  isActive: boolean;
  clientSupplier?: ClientSupplier;
}
