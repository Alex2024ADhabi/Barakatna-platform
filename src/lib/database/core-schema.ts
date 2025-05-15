// Core Domain Schema for Barakatna Platform

// This file defines the core database schema structure that maps to SQL tables
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
    createdBy: { type: "INT", notNull: true },
    createdDate: { type: "DATETIME", notNull: true, default: "GETDATE()" },
    lastModifiedBy: { type: "INT" },
    lastModifiedDate: { type: "DATETIME" },
  },
};

// Status Schema
export const statusSchema = {
  tableName: "Status",
  columns: {
    statusId: { type: "INT", primaryKey: true, autoIncrement: true },
    statusCode: { type: "VARCHAR(20)", notNull: true, unique: true },
    statusNameEN: { type: "NVARCHAR(100)", notNull: true },
    statusNameAR: { type: "NVARCHAR(100)", notNull: true },
    description: { type: "NVARCHAR(500)" },
    statusCategory: { type: "VARCHAR(50)", notNull: true },
    orderSequence: { type: "INT", notNull: true },
    isActive: { type: "BIT", notNull: true, default: 1 },
  },
};

// User Schema
export const userSchema = {
  tableName: "User",
  columns: {
    userId: { type: "INT", primaryKey: true, autoIncrement: true },
    username: { type: "VARCHAR(50)", notNull: true, unique: true },
    email: { type: "VARCHAR(100)", notNull: true, unique: true },
    firstNameEN: { type: "NVARCHAR(50)", notNull: true },
    lastNameEN: { type: "NVARCHAR(50)", notNull: true },
    firstNameAR: { type: "NVARCHAR(50)", notNull: true },
    lastNameAR: { type: "NVARCHAR(50)", notNull: true },
    passwordHash: { type: "VARBINARY(64)", notNull: true },
    passwordSalt: { type: "VARBINARY(128)", notNull: true },
    isActive: { type: "BIT", notNull: true, default: 1 },
    lastLoginDate: { type: "DATETIME" },
    mobileNumber: { type: "VARCHAR(20)" },
    isEmailVerified: { type: "BIT", notNull: true, default: 0 },
    isMobileVerified: { type: "BIT", notNull: true, default: 0 },
    createdBy: { type: "INT" },
    createdDate: { type: "DATETIME", notNull: true, default: "GETDATE()" },
    lastModifiedBy: { type: "INT" },
    lastModifiedDate: { type: "DATETIME" },
  },
};

// Role Schema
export const roleSchema = {
  tableName: "Role",
  columns: {
    roleId: { type: "INT", primaryKey: true, autoIncrement: true },
    roleCode: { type: "VARCHAR(50)", notNull: true, unique: true },
    roleNameEN: { type: "NVARCHAR(100)", notNull: true },
    roleNameAR: { type: "NVARCHAR(100)", notNull: true },
    description: { type: "NVARCHAR(500)" },
    isActive: { type: "BIT", notNull: true, default: 1 },
    createdBy: { type: "INT", notNull: true },
    createdDate: { type: "DATETIME", notNull: true, default: "GETDATE()" },
    lastModifiedBy: { type: "INT" },
    lastModifiedDate: { type: "DATETIME" },
  },
};

// User Role Schema
export const userRoleSchema = {
  tableName: "UserRole",
  columns: {
    userRoleId: { type: "INT", primaryKey: true, autoIncrement: true },
    userId: {
      type: "INT",
      notNull: true,
      foreignKey: { table: "User", column: "userId" },
    },
    roleId: {
      type: "INT",
      notNull: true,
      foreignKey: { table: "Role", column: "roleId" },
    },
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
  constraints: [{ type: "UNIQUE", columns: ["userId", "roleId"] }],
};
