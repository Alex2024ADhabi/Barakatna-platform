// Financial Management Domain Schema for Barakatna Platform

// This file defines the financial management database schema structure that maps to SQL tables
// It can be used with an ORM like Prisma or TypeORM, or with raw SQL queries

// Budget Schema
export const budgetSchema = {
  tableName: "Budget",
  columns: {
    budgetId: { type: "INT", primaryKey: true, autoIncrement: true },
    projectId: {
      type: "INT",
      notNull: true,
      foreignKey: { table: "Project", column: "projectId" },
    },
    fiscalYear: { type: "INT", notNull: true },
    budgetCode: { type: "VARCHAR(20)", notNull: true, unique: true },
    totalAmount: { type: "DECIMAL(12,2)", notNull: true },
    allocatedAmount: { type: "DECIMAL(12,2)", notNull: true },
    remainingAmount: { type: "DECIMAL(12,2)", notNull: true },
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

// Expense Schema
export const expenseSchema = {
  tableName: "Expense",
  columns: {
    expenseId: { type: "INT", primaryKey: true, autoIncrement: true },
    projectId: {
      type: "INT",
      notNull: true,
      foreignKey: { table: "Project", column: "projectId" },
    },
    budgetId: {
      type: "INT",
      notNull: true,
      foreignKey: { table: "Budget", column: "budgetId" },
    },
    expenseTypeId: {
      type: "INT",
      notNull: true,
      foreignKey: { table: "ExpenseType", column: "expenseTypeId" },
    },
    expenseCode: { type: "VARCHAR(20)", notNull: true, unique: true },
    amount: { type: "DECIMAL(12,2)", notNull: true },
    expenseDate: { type: "DATE", notNull: true },
    description: { type: "NVARCHAR(200)", notNull: true },
    vendorId: {
      type: "INT",
      foreignKey: { table: "Vendor", column: "vendorId" },
    },
    invoiceNumber: { type: "VARCHAR(50)" },
    invoiceDate: { type: "DATE" },
    paymentMethod: { type: "VARCHAR(50)" },
    paymentReference: { type: "VARCHAR(50)" },
    paymentDate: { type: "DATE" },
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
    notes: { type: "NVARCHAR(500)" },
    receiptUrl: { type: "VARCHAR(255)" },
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

// Expense Type Schema
export const expenseTypeSchema = {
  tableName: "ExpenseType",
  columns: {
    expenseTypeId: { type: "INT", primaryKey: true, autoIncrement: true },
    typeCode: { type: "VARCHAR(20)", notNull: true, unique: true },
    typeNameEN: { type: "NVARCHAR(100)", notNull: true },
    typeNameAR: { type: "NVARCHAR(100)", notNull: true },
    description: { type: "NVARCHAR(500)" },
    budgetCategory: { type: "VARCHAR(50)", notNull: true },
    isActive: { type: "BIT", notNull: true, default: 1 },
  },
};
