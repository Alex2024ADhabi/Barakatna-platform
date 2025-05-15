// Notification Management Domain Schema for Barakatna Platform

// This file defines the notification management database schema structure that maps to SQL tables
// It can be used with an ORM like Prisma or TypeORM, or with raw SQL queries

// Notification Type Schema
export const notificationTypeSchema = {
  tableName: "NotificationType",
  columns: {
    notificationTypeId: { type: "INT", primaryKey: true, autoIncrement: true },
    typeCode: { type: "VARCHAR(20)", notNull: true, unique: true },
    typeNameEN: { type: "NVARCHAR(100)", notNull: true },
    typeNameAR: { type: "NVARCHAR(100)", notNull: true },
    description: { type: "NVARCHAR(500)" },
    category: { type: "VARCHAR(50)", notNull: true }, // System, Workflow, Task, etc.
    defaultPriority: { type: "INT", notNull: true, default: 2 }, // 1-High, 2-Medium, 3-Low
    defaultChannel: { type: "VARCHAR(50)" }, // Email, SMS, Push, InApp
    templateSubjectEN: { type: "NVARCHAR(200)" },
    templateSubjectAR: { type: "NVARCHAR(200)" },
    templateBodyEN: { type: "NVARCHAR(MAX)" },
    templateBodyAR: { type: "NVARCHAR(MAX)" },
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

// Notification Schema
export const notificationSchema = {
  tableName: "Notification",
  columns: {
    notificationId: { type: "INT", primaryKey: true, autoIncrement: true },
    notificationTypeId: {
      type: "INT",
      notNull: true,
      foreignKey: { table: "NotificationType", column: "notificationTypeId" },
    },
    recipientId: {
      type: "INT",
      notNull: true,
      foreignKey: { table: "User", column: "userId" },
    },
    senderId: {
      type: "INT",
      foreignKey: { table: "User", column: "userId" },
    },
    subjectEN: { type: "NVARCHAR(200)", notNull: true },
    subjectAR: { type: "NVARCHAR(200)", notNull: true },
    bodyEN: { type: "NVARCHAR(MAX)", notNull: true },
    bodyAR: { type: "NVARCHAR(MAX)", notNull: true },
    priority: { type: "INT", notNull: true, default: 2 }, // 1-High, 2-Medium, 3-Low
    channel: { type: "VARCHAR(50)", notNull: true }, // Email, SMS, Push, InApp
    entityType: { type: "VARCHAR(50)" }, // Assessment, Project, Task, etc.
    entityId: { type: "INT" }, // ID of the related entity
    isRead: { type: "BIT", notNull: true, default: 0 },
    readDate: { type: "DATETIME" },
    isDelivered: { type: "BIT", notNull: true, default: 0 },
    deliveryDate: { type: "DATETIME" },
    deliveryError: { type: "NVARCHAR(500)" },
    scheduledDate: { type: "DATETIME" },
    expiryDate: { type: "DATETIME" },
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

// Notification Subscription Schema
export const notificationSubscriptionSchema = {
  tableName: "NotificationSubscription",
  columns: {
    subscriptionId: { type: "INT", primaryKey: true, autoIncrement: true },
    userId: {
      type: "INT",
      notNull: true,
      foreignKey: { table: "User", column: "userId" },
    },
    notificationTypeId: {
      type: "INT",
      notNull: true,
      foreignKey: { table: "NotificationType", column: "notificationTypeId" },
    },
    isSubscribed: { type: "BIT", notNull: true, default: 1 },
    preferredChannel: { type: "VARCHAR(50)" }, // Email, SMS, Push, InApp
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
  constraints: [{ type: "UNIQUE", columns: ["userId", "notificationTypeId"] }],
};

// Notification Template Schema
export const notificationTemplateSchema = {
  tableName: "NotificationTemplate",
  columns: {
    templateId: { type: "INT", primaryKey: true, autoIncrement: true },
    templateCode: { type: "VARCHAR(50)", notNull: true, unique: true },
    templateNameEN: { type: "NVARCHAR(100)", notNull: true },
    templateNameAR: { type: "NVARCHAR(100)", notNull: true },
    subjectEN: { type: "NVARCHAR(200)", notNull: true },
    subjectAR: { type: "NVARCHAR(200)", notNull: true },
    bodyEN: { type: "NVARCHAR(MAX)", notNull: true },
    bodyAR: { type: "NVARCHAR(MAX)", notNull: true },
    channel: { type: "VARCHAR(50)", notNull: true }, // Email, SMS, Push, InApp
    placeholders: { type: "NVARCHAR(500)" }, // JSON array of placeholder names
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
