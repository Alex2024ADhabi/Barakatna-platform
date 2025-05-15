// Inventory Management Domain Schema for Barakatna Platform

// This file defines the inventory management database schema structure that maps to SQL tables
// It can be used with an ORM like Prisma or TypeORM, or with raw SQL queries

// Inventory Item Schema
export const inventoryItemSchema = {
  tableName: "InventoryItem",
  columns: {
    itemId: { type: "INT", primaryKey: true, autoIncrement: true },
    itemCode: { type: "VARCHAR(20)", notNull: true, unique: true },
    itemNameEN: { type: "NVARCHAR(100)", notNull: true },
    itemNameAR: { type: "NVARCHAR(100)", notNull: true },
    description: { type: "NVARCHAR(500)" },
    categoryId: {
      type: "INT",
      notNull: true,
      foreignKey: { table: "ItemCategory", column: "categoryId" },
    },
    unitOfMeasure: { type: "VARCHAR(20)", notNull: true },
    minimumStockLevel: { type: "INT" },
    reorderPoint: { type: "INT" },
    currentStock: { type: "INT", notNull: true, default: 0 },
    unitCost: { type: "DECIMAL(12,2)" },
    vendorId: {
      type: "INT",
      foreignKey: { table: "Vendor", column: "vendorId" },
    },
    locationId: {
      type: "INT",
      foreignKey: { table: "InventoryLocation", column: "locationId" },
    },
    barcode: { type: "VARCHAR(50)" },
    serialNumber: { type: "VARCHAR(50)" },
    expiryDate: { type: "DATE" },
    lastStockTakeDate: { type: "DATE" },
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

// Inventory Location Schema
export const inventoryLocationSchema = {
  tableName: "InventoryLocation",
  columns: {
    locationId: { type: "INT", primaryKey: true, autoIncrement: true },
    locationCode: { type: "VARCHAR(20)", notNull: true, unique: true },
    locationNameEN: { type: "NVARCHAR(100)", notNull: true },
    locationNameAR: { type: "NVARCHAR(100)", notNull: true },
    description: { type: "NVARCHAR(500)" },
    addressLine1: { type: "NVARCHAR(100)" },
    addressLine2: { type: "NVARCHAR(100)" },
    city: { type: "NVARCHAR(50)" },
    region: { type: "NVARCHAR(50)" },
    postalCode: { type: "VARCHAR(20)" },
    locationGPS: { type: "GEOGRAPHY" },
    contactPerson: { type: "NVARCHAR(100)" },
    contactPhone: { type: "VARCHAR(20)" },
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

// Inventory Transaction Schema
export const inventoryTransactionSchema = {
  tableName: "InventoryTransaction",
  columns: {
    transactionId: { type: "INT", primaryKey: true, autoIncrement: true },
    transactionCode: { type: "VARCHAR(20)", notNull: true, unique: true },
    transactionType: { type: "VARCHAR(20)", notNull: true }, // Receive, Issue, Transfer, Adjust
    itemId: {
      type: "INT",
      notNull: true,
      foreignKey: { table: "InventoryItem", column: "itemId" },
    },
    quantity: { type: "INT", notNull: true },
    unitCost: { type: "DECIMAL(12,2)" },
    totalCost: { type: "DECIMAL(12,2)" },
    sourceLocationId: {
      type: "INT",
      foreignKey: { table: "InventoryLocation", column: "locationId" },
    },
    destinationLocationId: {
      type: "INT",
      foreignKey: { table: "InventoryLocation", column: "locationId" },
    },
    projectId: {
      type: "INT",
      foreignKey: { table: "Project", column: "projectId" },
    },
    referenceNumber: { type: "VARCHAR(50)" }, // PO number, requisition number, etc.
    transactionDate: { type: "DATETIME", notNull: true },
    notes: { type: "NVARCHAR(500)" },
    approvedById: {
      type: "INT",
      foreignKey: { table: "User", column: "userId" },
    },
    approvalDate: { type: "DATETIME" },
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
