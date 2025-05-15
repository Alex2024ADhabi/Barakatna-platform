// Project Management Domain Schema for Barakatna Platform

// This file defines the project management database schema structure that maps to SQL tables
// It can be used with an ORM like Prisma or TypeORM, or with raw SQL queries

// Project Schema
export const projectSchema = {
  tableName: "Project",
  columns: {
    projectId: { type: "INT", primaryKey: true, autoIncrement: true },
    projectCode: { type: "VARCHAR(20)", notNull: true, unique: true },
    projectName: { type: "NVARCHAR(100)", notNull: true },
    assessmentId: {
      type: "INT",
      notNull: true,
      foreignKey: { table: "Assessment", column: "assessmentId" },
    },
    projectTypeId: {
      type: "INT",
      notNull: true,
      foreignKey: { table: "ProjectType", column: "projectTypeId" },
    },
    statusId: {
      type: "INT",
      notNull: true,
      foreignKey: { table: "Status", column: "statusId" },
    },
    startDate: { type: "DATE" },
    targetCompletionDate: { type: "DATE", notNull: true },
    actualCompletionDate: { type: "DATE" },
    projectManagerId: {
      type: "INT",
      notNull: true,
      foreignKey: { table: "User", column: "userId" },
    },
    totalBudget: { type: "DECIMAL(12,2)", notNull: true },
    approvedBudget: { type: "DECIMAL(12,2)" },
    actualCost: { type: "DECIMAL(12,2)" },
    priorityLevel: { type: "INT", notNull: true, default: 2 },
    description: { type: "NVARCHAR(500)" },
    notes: { type: "NVARCHAR(1000)" },
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

// Project Type Schema
export const projectTypeSchema = {
  tableName: "ProjectType",
  columns: {
    projectTypeId: { type: "INT", primaryKey: true, autoIncrement: true },
    typeCode: { type: "VARCHAR(20)", notNull: true, unique: true },
    typeNameEN: { type: "NVARCHAR(100)", notNull: true },
    typeNameAR: { type: "NVARCHAR(100)", notNull: true },
    description: { type: "NVARCHAR(500)" },
    isActive: { type: "BIT", notNull: true, default: 1 },
  },
};

// Project Task Schema
export const projectTaskSchema = {
  tableName: "ProjectTask",
  columns: {
    taskId: { type: "INT", primaryKey: true, autoIncrement: true },
    projectId: {
      type: "INT",
      notNull: true,
      foreignKey: { table: "Project", column: "projectId" },
    },
    taskName: { type: "NVARCHAR(100)", notNull: true },
    description: { type: "NVARCHAR(500)" },
    startDate: { type: "DATE" },
    dueDate: { type: "DATE", notNull: true },
    completionDate: { type: "DATE" },
    assignedToId: {
      type: "INT",
      foreignKey: { table: "User", column: "userId" },
    },
    statusId: {
      type: "INT",
      notNull: true,
      foreignKey: { table: "Status", column: "statusId" },
    },
    priorityLevel: { type: "INT", notNull: true, default: 2 },
    estimatedHours: { type: "DECIMAL(6,2)" },
    actualHours: { type: "DECIMAL(6,2)" },
    dependsOnTaskId: {
      type: "INT",
      foreignKey: { table: "ProjectTask", column: "taskId" },
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
