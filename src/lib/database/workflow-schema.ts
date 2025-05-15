// Workflow Management Domain Schema for Barakatna Platform

// This file defines the workflow management database schema structure that maps to SQL tables
// It can be used with an ORM like Prisma or TypeORM, or with raw SQL queries

// Workflow Definition Schema
export const workflowDefinitionSchema = {
  tableName: "WorkflowDefinition",
  columns: {
    workflowDefinitionId: {
      type: "INT",
      primaryKey: true,
      autoIncrement: true,
    },
    workflowCode: { type: "VARCHAR(20)", notNull: true, unique: true },
    workflowNameEN: { type: "NVARCHAR(100)", notNull: true },
    workflowNameAR: { type: "NVARCHAR(100)", notNull: true },
    description: { type: "NVARCHAR(500)" },
    entityType: { type: "VARCHAR(50)", notNull: true }, // Assessment, Project, Procurement, etc.
    version: { type: "INT", notNull: true, default: 1 },
    isDefault: { type: "BIT", notNull: true, default: 0 },
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

// Workflow Stage Schema
export const workflowStageSchema = {
  tableName: "WorkflowStage",
  columns: {
    stageId: { type: "INT", primaryKey: true, autoIncrement: true },
    workflowDefinitionId: {
      type: "INT",
      notNull: true,
      foreignKey: {
        table: "WorkflowDefinition",
        column: "workflowDefinitionId",
      },
    },
    stageCode: { type: "VARCHAR(20)", notNull: true },
    stageNameEN: { type: "NVARCHAR(100)", notNull: true },
    stageNameAR: { type: "NVARCHAR(100)", notNull: true },
    description: { type: "NVARCHAR(500)" },
    sequenceNumber: { type: "INT", notNull: true },
    estimatedDuration: { type: "INT" }, // in hours
    isInitialStage: { type: "BIT", notNull: true, default: 0 },
    isFinalStage: { type: "BIT", notNull: true, default: 0 },
    roleId: {
      type: "INT",
      foreignKey: { table: "Role", column: "roleId" },
    },
    statusId: {
      type: "INT",
      foreignKey: { table: "Status", column: "statusId" },
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
  constraints: [
    { type: "UNIQUE", columns: ["workflowDefinitionId", "stageCode"] },
  ],
};

// Workflow Transition Schema
export const workflowTransitionSchema = {
  tableName: "WorkflowTransition",
  columns: {
    transitionId: { type: "INT", primaryKey: true, autoIncrement: true },
    workflowDefinitionId: {
      type: "INT",
      notNull: true,
      foreignKey: {
        table: "WorkflowDefinition",
        column: "workflowDefinitionId",
      },
    },
    fromStageId: {
      type: "INT",
      notNull: true,
      foreignKey: { table: "WorkflowStage", column: "stageId" },
    },
    toStageId: {
      type: "INT",
      notNull: true,
      foreignKey: { table: "WorkflowStage", column: "stageId" },
    },
    transitionNameEN: { type: "NVARCHAR(100)", notNull: true },
    transitionNameAR: { type: "NVARCHAR(100)", notNull: true },
    description: { type: "NVARCHAR(500)" },
    requiredApprovalRoleId: {
      type: "INT",
      foreignKey: { table: "Role", column: "roleId" },
    },
    isAutomatic: { type: "BIT", notNull: true, default: 0 },
    conditionExpression: { type: "NVARCHAR(500)" }, // JSON or expression for conditional transitions
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
  constraints: [
    {
      type: "UNIQUE",
      columns: ["workflowDefinitionId", "fromStageId", "toStageId"],
    },
  ],
};

// Workflow Instance Schema
export const workflowInstanceSchema = {
  tableName: "WorkflowInstance",
  columns: {
    instanceId: { type: "INT", primaryKey: true, autoIncrement: true },
    workflowDefinitionId: {
      type: "INT",
      notNull: true,
      foreignKey: {
        table: "WorkflowDefinition",
        column: "workflowDefinitionId",
      },
    },
    entityId: { type: "INT", notNull: true }, // ID of the entity (Assessment, Project, etc.)
    entityType: { type: "VARCHAR(50)", notNull: true }, // Type of entity
    currentStageId: {
      type: "INT",
      notNull: true,
      foreignKey: { table: "WorkflowStage", column: "stageId" },
    },
    startDate: { type: "DATETIME", notNull: true, default: "GETDATE()" },
    completionDate: { type: "DATETIME" },
    isCompleted: { type: "BIT", notNull: true, default: 0 },
    isCancelled: { type: "BIT", notNull: true, default: 0 },
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
