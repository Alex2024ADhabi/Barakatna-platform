// Procurement API Types for Barakatna Platform

import { Status } from "../core/types";

// Purchase Request interface
export interface PurchaseRequest {
  id: string;
  requestNumber: string;
  title: string;
  description: string;
  projectId?: string;
  assessmentId?: string;
  requestedBy: string;
  requestDate: Date;
  status: Status;
  items: PurchaseRequestItem[];
  totalAmount: number;
  currency: string;
  approvedBy?: string;
  approvalDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Purchase Request Item interface
export interface PurchaseRequestItem {
  id: string;
  purchaseRequestId: string;
  itemName: string;
  description: string;
  quantity: number;
  unitPrice: number;
  unit: string;
  totalPrice: number;
  categoryId?: string;
  supplierId?: string;
  notes?: string;
}

// Purchase Order interface
export interface PurchaseOrder {
  id: string;
  orderNumber: string;
  purchaseRequestId?: string;
  title: string;
  description: string;
  supplierId: string;
  projectId?: string;
  assessmentId?: string;
  orderDate: Date;
  expectedDeliveryDate: Date;
  actualDeliveryDate?: Date;
  status: Status;
  items: PurchaseOrderItem[];
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  currency: string;
  paymentTerms: string;
  deliveryTerms: string;
  approvedBy?: string;
  approvalDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Purchase Order Item interface
export interface PurchaseOrderItem {
  id: string;
  purchaseOrderId: string;
  purchaseRequestItemId?: string;
  itemName: string;
  description: string;
  quantity: number;
  unitPrice: number;
  unit: string;
  totalPrice: number;
  categoryId?: string;
  notes?: string;
  receivedQuantity: number;
  receivedDate?: Date;
}

// Inventory Item interface
export interface InventoryItem {
  id: string;
  itemCode: string;
  name: string;
  description: string;
  categoryId: string;
  quantity: number;
  unit: string;
  unitCost: number;
  totalValue: number;
  location: string;
  minimumStockLevel: number;
  reorderPoint: number;
  lastRestockDate?: Date;
  expiryDate?: Date;
  status: "available" | "low" | "out_of_stock" | "expired";
  notes?: string;
  isEquipment?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Inventory Transaction interface
export interface InventoryTransaction {
  id: string;
  inventoryItemId: string;
  transactionType:
    | "purchase"
    | "allocation"
    | "return"
    | "adjustment"
    | "disposal"
    | "check_out"
    | "check_in";
  quantity: number;
  referenceId?: string; // Could be PO ID, Project ID, etc.
  referenceType?: string; // "purchase_order", "project", etc.
  date: Date;
  performedBy: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Supplier interface
export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  postalCode?: string;
  website?: string;
  taxRegistrationNumber?: string;
  categories: string[];
  rating?: number;
  isApproved: boolean;
  approvedForClientTypes: number[];
  specialPricing: boolean;
  paymentTerms?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Category interface
export interface Category {
  id: string;
  name: string;
  description?: string;
  parentCategoryId?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Purchase Request filter parameters
export interface PurchaseRequestFilterParams {
  requestNumber?: string;
  projectId?: string;
  assessmentId?: string;
  requestedBy?: string;
  status?: Status;
  dateFrom?: Date | string;
  dateTo?: Date | string;
  minAmount?: number;
  maxAmount?: number;
}

// Purchase Order filter parameters
export interface PurchaseOrderFilterParams {
  orderNumber?: string;
  purchaseRequestId?: string;
  supplierId?: string;
  projectId?: string;
  assessmentId?: string;
  status?: Status;
  dateFrom?: Date | string;
  dateTo?: Date | string;
  minAmount?: number;
  maxAmount?: number;
}

// Inventory filter parameters
export interface InventoryFilterParams {
  itemCode?: string;
  name?: string;
  categoryId?: string;
  location?: string;
  status?: string;
  minQuantity?: number;
  maxQuantity?: number;
  isEquipment?: boolean;
}

// Equipment interface
export interface Equipment extends InventoryItem {
  serialNumber: string;
  model: string;
  manufacturer: string;
  purchaseDate: Date;
  warrantyExpiryDate?: Date;
  currentStatus: "available" | "in_use" | "maintenance" | "retired";
  assignedTo?: string;
  maintenanceSchedule?: MaintenanceSchedule[];
  lastMaintenanceDate?: Date;
  nextMaintenanceDate?: Date;
  depreciationValue?: number;
  depreciationRate?: number;
  expectedLifespan?: number; // in months
}

// Maintenance Schedule interface
export interface MaintenanceSchedule {
  id: string;
  equipmentId: string;
  maintenanceType: "routine" | "repair" | "inspection" | "calibration";
  scheduledDate: Date;
  completedDate?: Date;
  status: "scheduled" | "completed" | "overdue" | "cancelled";
  assignedTechnician?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Equipment Check-in/Check-out interface
export interface EquipmentCheckout {
  id: string;
  equipmentId: string;
  checkedOutBy: string;
  checkedOutTo: string;
  checkoutDate: Date;
  expectedReturnDate: Date;
  actualReturnDate?: Date;
  status: "checked_out" | "returned" | "overdue";
  condition: "excellent" | "good" | "fair" | "poor";
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Equipment Audit interface
export interface EquipmentAudit {
  id: string;
  equipmentId: string;
  auditDate: Date;
  auditedBy: string;
  location: string;
  condition: "excellent" | "good" | "fair" | "poor";
  notes?: string;
  discrepancies?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Supplier filter parameters
export interface SupplierFilterParams {
  name?: string;
  category?: string;
  isApproved?: boolean;
  clientTypeId?: number;
  specialPricing?: boolean;
  minRating?: number;
}
