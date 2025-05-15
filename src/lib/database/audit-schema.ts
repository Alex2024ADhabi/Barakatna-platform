// Audit Schema for Barakatna Platform

// This file defines the database schema for audit logging

import { AuditAction } from "../api/core/types";

// Audit Log Schema
export const auditLogSchema = {
  tableName: "AuditLog",
  columns: {
    auditLogId: { type: "INT", primaryKey: true, autoIncrement: true },
    userId: {
      type: "INT",
      notNull: true,
      foreignKey: { table: "User", column: "userId" },
    },
    userName: { type: "NVARCHAR(100)", notNull: true },
    action: { type: "VARCHAR(50)", notNull: true },
    entityType: { type: "VARCHAR(50)", notNull: true },
    entityId: { type: "VARCHAR(50)", notNull: true },
    details: { type: "NVARCHAR(MAX)" },
    ipAddress: { type: "VARCHAR(50)" },
    userAgent: { type: "VARCHAR(500)" },
    timestamp: { type: "DATETIME", notNull: true, default: "GETDATE()" },
    clientType: { type: "VARCHAR(20)" },
  },
  indexes: [
    { name: "IX_AuditLog_UserId", columns: ["userId"] },
    {
      name: "IX_AuditLog_EntityType_EntityId",
      columns: ["entityType", "entityId"],
    },
    { name: "IX_AuditLog_Timestamp", columns: ["timestamp"] },
    { name: "IX_AuditLog_Action", columns: ["action"] },
  ],
};

// Data Change History Schema
export const dataChangeHistorySchema = {
  tableName: "DataChangeHistory",
  columns: {
    changeId: { type: "INT", primaryKey: true, autoIncrement: true },
    auditLogId: {
      type: "INT",
      notNull: true,
      foreignKey: { table: "AuditLog", column: "auditLogId" },
    },
    entityType: { type: "VARCHAR(50)", notNull: true },
    entityId: { type: "VARCHAR(50)", notNull: true },
    fieldName: { type: "VARCHAR(100)", notNull: true },
    oldValue: { type: "NVARCHAR(MAX)" },
    newValue: { type: "NVARCHAR(MAX)" },
    timestamp: { type: "DATETIME", notNull: true, default: "GETDATE()" },
  },
  indexes: [
    { name: "IX_DataChangeHistory_AuditLogId", columns: ["auditLogId"] },
    {
      name: "IX_DataChangeHistory_EntityType_EntityId",
      columns: ["entityType", "entityId"],
    },
    { name: "IX_DataChangeHistory_FieldName", columns: ["fieldName"] },
  ],
};

// SQL Triggers for Audit Logging
export const createAuditTriggers = (
  tableName: string,
  primaryKeyColumn: string,
  entityType: string,
) => {
  return {
    insertTrigger: `
      CREATE TRIGGER tr_${tableName}_Insert
      ON ${tableName}
      AFTER INSERT
      AS
      BEGIN
        SET NOCOUNT ON;
        
        DECLARE @userId INT;
        SELECT @userId = SYSTEM_USER;
        
        INSERT INTO AuditLog (userId, userName, action, entityType, entityId, details, timestamp)
        SELECT 
          @userId,
          USER_NAME(),
          '${AuditAction.Create}',
          '${entityType}',
          CAST(i.${primaryKeyColumn} AS VARCHAR(50)),
          (SELECT * FROM inserted i FOR JSON PATH, WITHOUT_ARRAY_WRAPPER),
          GETDATE()
        FROM inserted i;
      END
    `,
    updateTrigger: `
      CREATE TRIGGER tr_${tableName}_Update
      ON ${tableName}
      AFTER UPDATE
      AS
      BEGIN
        SET NOCOUNT ON;
        
        DECLARE @userId INT;
        SELECT @userId = SYSTEM_USER;
        
        -- Insert audit log entry
        DECLARE @auditLogId INT;
        
        INSERT INTO AuditLog (userId, userName, action, entityType, entityId, details, timestamp)
        SELECT 
          @userId,
          USER_NAME(),
          '${AuditAction.Update}',
          '${entityType}',
          CAST(i.${primaryKeyColumn} AS VARCHAR(50)),
          (SELECT i.* FROM inserted i FOR JSON PATH, WITHOUT_ARRAY_WRAPPER),
          GETDATE();
        
        SET @auditLogId = SCOPE_IDENTITY();
        
        -- Track individual field changes
        INSERT INTO DataChangeHistory (auditLogId, entityType, entityId, fieldName, oldValue, newValue, timestamp)
        SELECT 
          @auditLogId,
          '${entityType}',
          CAST(i.${primaryKeyColumn} AS VARCHAR(50)),
          c.name,
          CAST(d.[value] AS NVARCHAR(MAX)),
          CAST(i.[value] AS NVARCHAR(MAX)),
          GETDATE()
        FROM inserted i
        JOIN deleted d ON i.${primaryKeyColumn} = d.${primaryKeyColumn}
        CROSS APPLY sys.columns c
        WHERE c.object_id = OBJECT_ID('${tableName}')
          AND CAST(d.[value] AS NVARCHAR(MAX)) <> CAST(i.[value] AS NVARCHAR(MAX));
      END
    `,
    deleteTrigger: `
      CREATE TRIGGER tr_${tableName}_Delete
      ON ${tableName}
      AFTER DELETE
      AS
      BEGIN
        SET NOCOUNT ON;
        
        DECLARE @userId INT;
        SELECT @userId = SYSTEM_USER;
        
        INSERT INTO AuditLog (userId, userName, action, entityType, entityId, details, timestamp)
        SELECT 
          @userId,
          USER_NAME(),
          '${AuditAction.Delete}',
          '${entityType}',
          CAST(d.${primaryKeyColumn} AS VARCHAR(50)),
          (SELECT * FROM deleted d FOR JSON PATH, WITHOUT_ARRAY_WRAPPER),
          GETDATE()
        FROM deleted d;
      END
    `,
  };
};

// Example usage:
// const seniorCitizenTriggers = createAuditTriggers('SeniorCitizen', 'seniorCitizenId', 'beneficiary');
