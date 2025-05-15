// Vendor Management Domain Schema for Barakatna Platform

// This file defines the vendor management database schema structure that maps to SQL tables
// It can be used with an ORM like Prisma or TypeORM, or with raw SQL queries

// Vendor Schema
export const vendorSchema = {
  tableName: "Vendor",
  columns: {
    vendorId: { type: "INT", primaryKey: true, autoIncrement: true },
    vendorCode: { type: "VARCHAR(20)", notNull: true, unique: true },
    vendorNameEN: { type: "NVARCHAR(100)", notNull: true },
    vendorNameAR: { type: "NVARCHAR(100)", notNull: true },
    contactPersonName: { type: "NVARCHAR(100)" },
    contactEmail: { type: "VARCHAR(100)" },
    contactPhone: { type: "VARCHAR(20)" },
    addressLine1: { type: "NVARCHAR(100)" },
    addressLine2: { type: "NVARCHAR(100)" },
    city: { type: "NVARCHAR(50)" },
    region: { type: "NVARCHAR(50)" },
    postalCode: { type: "VARCHAR(20)" },
    country: { type: "VARCHAR(50)" },
    website: { type: "VARCHAR(255)" },
    taxRegistrationNumber: { type: "VARCHAR(50)" },
    registrationDate: { type: "DATE" },
    vendorTypeId: {
      type: "INT",
      foreignKey: { table: "VendorType", column: "vendorTypeId" },
    },
    vendorCategoryId: {
      type: "INT",
      foreignKey: { table: "VendorCategory", column: "vendorCategoryId" },
    },
    paymentTerms: { type: "VARCHAR(100)" },
    bankName: { type: "NVARCHAR(100)" },
    bankAccountNumber: { type: "VARCHAR(50)" },
    bankIBAN: { type: "VARCHAR(50)" },
    bankSwiftCode: { type: "VARCHAR(20)" },
    notes: { type: "NVARCHAR(500)" },
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

// Vendor Type Schema
export const vendorTypeSchema = {
  tableName: "VendorType",
  columns: {
    vendorTypeId: { type: "INT", primaryKey: true, autoIncrement: true },
    typeCode: { type: "VARCHAR(20)", notNull: true, unique: true },
    typeNameEN: { type: "NVARCHAR(100)", notNull: true },
    typeNameAR: { type: "NVARCHAR(100)", notNull: true },
    description: { type: "NVARCHAR(500)" },
    isActive: { type: "BIT", notNull: true, default: 1 },
  },
};

// Vendor Category Schema
export const vendorCategorySchema = {
  tableName: "VendorCategory",
  columns: {
    vendorCategoryId: { type: "INT", primaryKey: true, autoIncrement: true },
    categoryCode: { type: "VARCHAR(20)", notNull: true, unique: true },
    categoryNameEN: { type: "NVARCHAR(100)", notNull: true },
    categoryNameAR: { type: "NVARCHAR(100)", notNull: true },
    description: { type: "NVARCHAR(500)" },
    isActive: { type: "BIT", notNull: true, default: 1 },
  },
};
