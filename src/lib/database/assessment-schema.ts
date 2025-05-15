// Assessment Domain Schema for Barakatna Platform

// This file defines the assessment-related database schema structure that maps to SQL tables
// It can be used with an ORM like Prisma or TypeORM, or with raw SQL queries

// Assessment Type Schema
export const assessmentTypeSchema = {
  tableName: "AssessmentType",
  columns: {
    assessmentTypeId: { type: "INT", primaryKey: true, autoIncrement: true },
    typeCode: { type: "VARCHAR(20)", notNull: true, unique: true },
    typeNameEN: { type: "NVARCHAR(100)", notNull: true },
    typeNameAR: { type: "NVARCHAR(100)", notNull: true },
    description: { type: "NVARCHAR(500)" },
    isActive: { type: "BIT", notNull: true, default: 1 },
  },
};

// Assessment Schema
export const assessmentSchema = {
  tableName: "Assessment",
  columns: {
    assessmentId: { type: "INT", primaryKey: true, autoIncrement: true },
    assessmentCode: { type: "VARCHAR(20)", notNull: true, unique: true },
    seniorCitizenId: {
      type: "INT",
      notNull: true,
      foreignKey: { table: "SeniorCitizen", column: "seniorCitizenId" },
    },
    assessmentTypeId: {
      type: "INT",
      notNull: true,
      foreignKey: { table: "AssessmentType", column: "assessmentTypeId" },
    },
    propertyId: {
      type: "INT",
      notNull: true,
      foreignKey: { table: "Property", column: "propertyId" },
    },
    assessmentDate: { type: "DATETIME", notNull: true },
    assessorId: {
      type: "INT",
      notNull: true,
      foreignKey: { table: "User", column: "userId" },
    },
    supervisorId: {
      type: "INT",
      foreignKey: { table: "User", column: "userId" },
    },
    statusId: {
      type: "INT",
      notNull: true,
      foreignKey: { table: "Status", column: "statusId" },
    },
    completionDate: { type: "DATETIME" },
    approvalDate: { type: "DATETIME" },
    totalEstimatedCost: { type: "DECIMAL(12,2)" },
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

// Room Type Schema
export const roomTypeSchema = {
  tableName: "RoomType",
  columns: {
    roomTypeId: { type: "INT", primaryKey: true, autoIncrement: true },
    typeCode: { type: "VARCHAR(20)", notNull: true, unique: true },
    typeNameEN: { type: "NVARCHAR(100)", notNull: true },
    typeNameAR: { type: "NVARCHAR(100)", notNull: true },
    description: { type: "NVARCHAR(500)" },
    isActive: { type: "BIT", notNull: true, default: 1 },
  },
};

// Room Assessment Schema
export const roomAssessmentSchema = {
  tableName: "RoomAssessment",
  columns: {
    roomAssessmentId: { type: "INT", primaryKey: true, autoIncrement: true },
    assessmentId: {
      type: "INT",
      notNull: true,
      foreignKey: { table: "Assessment", column: "assessmentId" },
    },
    roomTypeId: {
      type: "INT",
      notNull: true,
      foreignKey: { table: "RoomType", column: "roomTypeId" },
    },
    roomName: { type: "NVARCHAR(100)", notNull: true },
    completionStatus: { type: "BIT", notNull: true, default: 0 },
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
