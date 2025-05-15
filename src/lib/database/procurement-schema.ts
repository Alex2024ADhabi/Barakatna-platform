// Procurement Management Domain Schema for Barakatna Platform

// This file defines the procurement management database schema structure that maps to SQL tables
// It can be used with an ORM like Prisma or TypeORM, or with raw SQL queries

// Procurement Request Schema
export const procurementRequestSchema = {
  tableName: "ProcurementRequest",
  columns: {
    requestId: { type: "INT", primaryKey: true, autoIncrement: true },
    requestCode: { type: "VARCHAR(20)", notNull: true, unique: true },
    projectId: {
      type: "INT",
      notNull: true,
      foreignKey: { table: "Project", column: "projectId" },
    },
    requestTitle: { type: "NVARCHAR(100)", notNull: true },
    description: { type: "NVARCHAR(500)" },
    requestDate: { type: "DATE", notNull: true },
    requiredByDate: { type: "DATE", notNull: true },
    requestorId: {
      type: "INT",
      notNull: true,
      foreignKey: { table: "User", column: "userId" },
    },
    statusId: {
      type: "INT",
      notNull: true,
      foreignKey: { table: "Status", column: "statusId" },
    },
    approvedById: {
      type: "INT",
      foreignKey: { table: "User", column: "userId" },
    },
    approvalDate: { type: "DATE" },
    totalEstimatedCost: { type: "DECIMAL(12,2)" },
    budgetId: {
      type: "INT",
      foreignKey: { table: "Budget", column: "budgetId" },
    },
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

// Procurement Item Schema
export const procurementItemSchema = {
  tableName: "ProcurementItem",
  columns: {
    itemId: { type: "INT", primaryKey: true, autoIncrement: true },
    requestId: {
      type: "INT",
      notNull: true,
      foreignKey: { table: "ProcurementRequest", column: "requestId" },
    },
    itemName: { type: "NVARCHAR(100)", notNull: true },
    description: { type: "NVARCHAR(500)" },
    quantity: { type: "INT", notNull: true },
    unitOfMeasure: { type: "VARCHAR(20)", notNull: true },
    estimatedUnitCost: { type: "DECIMAL(12,2)" },
    estimatedTotalCost: { type: "DECIMAL(12,2)" },
    specifications: { type: "NVARCHAR(500)" },
    categoryId: {
      type: "INT",
      foreignKey: { table: "ItemCategory", column: "categoryId" },
    },
    statusId: {
      type: "INT",
      notNull: true,
      foreignKey: { table: "Status", column: "statusId" },
    },
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

// Item Category Schema
export const itemCategorySchema = {
  tableName: "ItemCategory",
  columns: {
    categoryId: { type: "INT", primaryKey: true, autoIncrement: true },
    categoryCode: { type: "VARCHAR(20)", notNull: true, unique: true },
    categoryNameEN: { type: "NVARCHAR(100)", notNull: true },
    categoryNameAR: { type: "NVARCHAR(100)", notNull: true },
    description: { type: "NVARCHAR(500)" },
    parentCategoryId: {
      type: "INT",
      foreignKey: { table: "ItemCategory", column: "categoryId" },
    },
    isActive: { type: "BIT", notNull: true, default: 1 },
  },
};
