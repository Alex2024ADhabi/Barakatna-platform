// Procurement API for Barakatna Platform

import { apiClient } from "../core/apiClient";
import { ApiResponse, PaginatedResponse, QueryParams } from "../core/types";
import {
  PurchaseRequest,
  PurchaseRequestFilterParams,
  PurchaseOrder,
  PurchaseOrderFilterParams,
  InventoryItem,
  InventoryFilterParams,
  InventoryTransaction,
  Supplier,
  SupplierFilterParams,
  Category,
  Equipment,
  MaintenanceSchedule,
  EquipmentCheckout,
  EquipmentAudit,
} from "./types";

const PURCHASE_REQUEST_URL = "/purchase-requests";
const PURCHASE_ORDER_URL = "/purchase-orders";
const INVENTORY_URL = "/inventory";
const SUPPLIER_URL = "/suppliers";
const CATEGORY_URL = "/categories";

// Procurement API
export const procurementApi = {
  // Equipment Management

  // Get all equipment with pagination and filtering
  async getEquipment(
    params: QueryParams & InventoryFilterParams,
  ): Promise<ApiResponse<PaginatedResponse<Equipment>>> {
    return apiClient.get<PaginatedResponse<Equipment>>(
      `${INVENTORY_URL}/equipment`,
      params,
      params.language,
    );
  },

  // Get equipment by ID
  async getEquipmentById(
    id: string,
    language?: string,
  ): Promise<ApiResponse<Equipment>> {
    return apiClient.get<Equipment>(
      `${INVENTORY_URL}/equipment/${id}`,
      {},
      language as any,
    );
  },

  // Create a new equipment
  async createEquipment(
    equipment: Omit<Equipment, "id" | "createdAt" | "updatedAt">,
    language?: string,
  ): Promise<ApiResponse<Equipment>> {
    return apiClient.post<Equipment>(
      `${INVENTORY_URL}/equipment`,
      equipment,
      language as any,
    );
  },

  // Update equipment
  async updateEquipment(
    id: string,
    equipment: Partial<Equipment>,
    language?: string,
  ): Promise<ApiResponse<Equipment>> {
    return apiClient.put<Equipment>(
      `${INVENTORY_URL}/equipment/${id}`,
      equipment,
      language as any,
    );
  },

  // Delete equipment
  async deleteEquipment(
    id: string,
    language?: string,
  ): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(
      `${INVENTORY_URL}/equipment/${id}`,
      language as any,
    );
  },

  // Equipment Check-out
  async checkoutEquipment(
    checkout: Omit<EquipmentCheckout, "id" | "createdAt" | "updatedAt">,
    language?: string,
  ): Promise<ApiResponse<EquipmentCheckout>> {
    return apiClient.post<EquipmentCheckout>(
      `${INVENTORY_URL}/equipment/checkout`,
      checkout,
      language as any,
    );
  },

  // Equipment Check-in
  async checkinEquipment(
    checkoutId: string,
    returnData: {
      actualReturnDate: Date;
      condition: "excellent" | "good" | "fair" | "poor";
      notes?: string;
    },
    language?: string,
  ): Promise<ApiResponse<EquipmentCheckout>> {
    return apiClient.put<EquipmentCheckout>(
      `${INVENTORY_URL}/equipment/checkin/${checkoutId}`,
      returnData,
      language as any,
    );
  },

  // Get equipment checkout history
  async getEquipmentCheckoutHistory(
    equipmentId: string,
    params?: QueryParams,
  ): Promise<ApiResponse<PaginatedResponse<EquipmentCheckout>>> {
    return apiClient.get<PaginatedResponse<EquipmentCheckout>>(
      `${INVENTORY_URL}/equipment/${equipmentId}/checkout-history`,
      params,
      params?.language,
    );
  },

  // Schedule maintenance for equipment
  async scheduleEquipmentMaintenance(
    maintenance: Omit<MaintenanceSchedule, "id" | "createdAt" | "updatedAt">,
    language?: string,
  ): Promise<ApiResponse<MaintenanceSchedule>> {
    return apiClient.post<MaintenanceSchedule>(
      `${INVENTORY_URL}/equipment/maintenance`,
      maintenance,
      language as any,
    );
  },

  // Update maintenance schedule
  async updateMaintenanceSchedule(
    id: string,
    maintenance: Partial<MaintenanceSchedule>,
    language?: string,
  ): Promise<ApiResponse<MaintenanceSchedule>> {
    return apiClient.put<MaintenanceSchedule>(
      `${INVENTORY_URL}/equipment/maintenance/${id}`,
      maintenance,
      language as any,
    );
  },

  // Complete maintenance task
  async completeMaintenanceTask(
    id: string,
    completionData: {
      completedDate: Date;
      notes?: string;
    },
    language?: string,
  ): Promise<ApiResponse<MaintenanceSchedule>> {
    return apiClient.put<MaintenanceSchedule>(
      `${INVENTORY_URL}/equipment/maintenance/${id}/complete`,
      completionData,
      language as any,
    );
  },

  // Get maintenance history for equipment
  async getEquipmentMaintenanceHistory(
    equipmentId: string,
    params?: QueryParams,
  ): Promise<ApiResponse<PaginatedResponse<MaintenanceSchedule>>> {
    return apiClient.get<PaginatedResponse<MaintenanceSchedule>>(
      `${INVENTORY_URL}/equipment/${equipmentId}/maintenance-history`,
      params,
      params?.language,
    );
  },

  // Create equipment audit
  async createEquipmentAudit(
    audit: Omit<EquipmentAudit, "id" | "createdAt" | "updatedAt">,
    language?: string,
  ): Promise<ApiResponse<EquipmentAudit>> {
    return apiClient.post<EquipmentAudit>(
      `${INVENTORY_URL}/equipment/audit`,
      audit,
      language as any,
    );
  },

  // Get equipment audit history
  async getEquipmentAuditHistory(
    equipmentId: string,
    params?: QueryParams,
  ): Promise<ApiResponse<PaginatedResponse<EquipmentAudit>>> {
    return apiClient.get<PaginatedResponse<EquipmentAudit>>(
      `${INVENTORY_URL}/equipment/${equipmentId}/audit-history`,
      params,
      params?.language,
    );
  },

  // Update equipment location
  async updateEquipmentLocation(
    id: string,
    location: string,
    language?: string,
  ): Promise<ApiResponse<Equipment>> {
    return apiClient.put<Equipment>(
      `${INVENTORY_URL}/equipment/${id}/location`,
      { location },
      language as any,
    );
  },

  // Update equipment depreciation
  async updateEquipmentDepreciation(
    id: string,
    depreciationData: {
      depreciationValue: number;
      depreciationRate: number;
    },
    language?: string,
  ): Promise<ApiResponse<Equipment>> {
    return apiClient.put<Equipment>(
      `${INVENTORY_URL}/equipment/${id}/depreciation`,
      depreciationData,
      language as any,
    );
  },

  // Get low stock alerts
  async getLowStockAlerts(
    params?: QueryParams,
  ): Promise<ApiResponse<PaginatedResponse<InventoryItem>>> {
    return apiClient.get<PaginatedResponse<InventoryItem>>(
      `${INVENTORY_URL}/low-stock`,
      params,
      params?.language,
    );
  },

  // Purchase Requests

  // Get all purchase requests with pagination and filtering
  async getPurchaseRequests(
    params: QueryParams & PurchaseRequestFilterParams,
  ): Promise<ApiResponse<PaginatedResponse<PurchaseRequest>>> {
    return apiClient.get<PaginatedResponse<PurchaseRequest>>(
      PURCHASE_REQUEST_URL,
      params,
      params.language,
    );
  },

  // Get purchase request by ID
  async getPurchaseRequest(
    id: string,
    language?: string,
  ): Promise<ApiResponse<PurchaseRequest>> {
    return apiClient.get<PurchaseRequest>(
      `${PURCHASE_REQUEST_URL}/${id}`,
      {},
      language as any,
    );
  },

  // Create a new purchase request
  async createPurchaseRequest(
    purchaseRequest: Omit<PurchaseRequest, "id" | "createdAt" | "updatedAt">,
    language?: string,
  ): Promise<ApiResponse<PurchaseRequest>> {
    return apiClient.post<PurchaseRequest>(
      PURCHASE_REQUEST_URL,
      purchaseRequest,
      language as any,
    );
  },

  // Update a purchase request
  async updatePurchaseRequest(
    id: string,
    purchaseRequest: Partial<PurchaseRequest>,
    language?: string,
  ): Promise<ApiResponse<PurchaseRequest>> {
    return apiClient.put<PurchaseRequest>(
      `${PURCHASE_REQUEST_URL}/${id}`,
      purchaseRequest,
      language as any,
    );
  },

  // Delete a purchase request
  async deletePurchaseRequest(
    id: string,
    language?: string,
  ): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(
      `${PURCHASE_REQUEST_URL}/${id}`,
      language as any,
    );
  },

  // Approve a purchase request
  async approvePurchaseRequest(
    id: string,
    approvedBy: string,
    notes?: string,
    language?: string,
  ): Promise<ApiResponse<PurchaseRequest>> {
    return apiClient.put<PurchaseRequest>(
      `${PURCHASE_REQUEST_URL}/${id}/approve`,
      { approvedBy, notes },
      language as any,
    );
  },

  // Reject a purchase request
  async rejectPurchaseRequest(
    id: string,
    rejectedBy: string,
    reason: string,
    language?: string,
  ): Promise<ApiResponse<PurchaseRequest>> {
    return apiClient.put<PurchaseRequest>(
      `${PURCHASE_REQUEST_URL}/${id}/reject`,
      { rejectedBy, reason },
      language as any,
    );
  },

  // Purchase Orders

  // Get all purchase orders with pagination and filtering
  async getPurchaseOrders(
    params: QueryParams & PurchaseOrderFilterParams,
  ): Promise<ApiResponse<PaginatedResponse<PurchaseOrder>>> {
    return apiClient.get<PaginatedResponse<PurchaseOrder>>(
      PURCHASE_ORDER_URL,
      params,
      params.language,
    );
  },

  // Get purchase order by ID
  async getPurchaseOrder(
    id: string,
    language?: string,
  ): Promise<ApiResponse<PurchaseOrder>> {
    return apiClient.get<PurchaseOrder>(
      `${PURCHASE_ORDER_URL}/${id}`,
      {},
      language as any,
    );
  },

  // Create a new purchase order
  async createPurchaseOrder(
    purchaseOrder: Omit<PurchaseOrder, "id" | "createdAt" | "updatedAt">,
    language?: string,
  ): Promise<ApiResponse<PurchaseOrder>> {
    return apiClient.post<PurchaseOrder>(
      PURCHASE_ORDER_URL,
      purchaseOrder,
      language as any,
    );
  },

  // Create purchase order from purchase request
  async createPurchaseOrderFromRequest(
    purchaseRequestId: string,
    supplierId: string,
    additionalData: Partial<PurchaseOrder>,
    language?: string,
  ): Promise<ApiResponse<PurchaseOrder>> {
    return apiClient.post<PurchaseOrder>(
      `${PURCHASE_ORDER_URL}/from-request/${purchaseRequestId}`,
      { supplierId, ...additionalData },
      language as any,
    );
  },

  // Update a purchase order
  async updatePurchaseOrder(
    id: string,
    purchaseOrder: Partial<PurchaseOrder>,
    language?: string,
  ): Promise<ApiResponse<PurchaseOrder>> {
    return apiClient.put<PurchaseOrder>(
      `${PURCHASE_ORDER_URL}/${id}`,
      purchaseOrder,
      language as any,
    );
  },

  // Delete a purchase order
  async deletePurchaseOrder(
    id: string,
    language?: string,
  ): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(
      `${PURCHASE_ORDER_URL}/${id}`,
      language as any,
    );
  },

  // Approve a purchase order
  async approvePurchaseOrder(
    id: string,
    approvedBy: string,
    notes?: string,
    language?: string,
  ): Promise<ApiResponse<PurchaseOrder>> {
    return apiClient.put<PurchaseOrder>(
      `${PURCHASE_ORDER_URL}/${id}/approve`,
      { approvedBy, notes },
      language as any,
    );
  },

  // Mark purchase order as delivered
  async markPurchaseOrderDelivered(
    id: string,
    actualDeliveryDate: Date,
    receivedItems: Array<{ id: string; receivedQuantity: number }>,
    notes?: string,
    language?: string,
  ): Promise<ApiResponse<PurchaseOrder>> {
    return apiClient.put<PurchaseOrder>(
      `${PURCHASE_ORDER_URL}/${id}/delivered`,
      { actualDeliveryDate, receivedItems, notes },
      language as any,
    );
  },

  // Export purchase order as PDF
  async exportPurchaseOrderAsPdf(
    id: string,
    language?: string,
  ): Promise<ApiResponse<Blob>> {
    return apiClient.download(
      `${PURCHASE_ORDER_URL}/${id}/export/pdf`,
      {},
      language as any,
    );
  },

  // Inventory

  // Get all inventory items with pagination and filtering
  async getInventoryItems(
    params: QueryParams & InventoryFilterParams,
  ): Promise<ApiResponse<PaginatedResponse<InventoryItem>>> {
    return apiClient.get<PaginatedResponse<InventoryItem>>(
      INVENTORY_URL,
      params,
      params.language,
    );
  },

  // Get inventory item by ID
  async getInventoryItem(
    id: string,
    language?: string,
  ): Promise<ApiResponse<InventoryItem>> {
    return apiClient.get<InventoryItem>(
      `${INVENTORY_URL}/${id}`,
      {},
      language as any,
    );
  },

  // Create a new inventory item
  async createInventoryItem(
    inventoryItem: Omit<InventoryItem, "id" | "createdAt" | "updatedAt">,
    language?: string,
  ): Promise<ApiResponse<InventoryItem>> {
    return apiClient.post<InventoryItem>(
      INVENTORY_URL,
      inventoryItem,
      language as any,
    );
  },

  // Update an inventory item
  async updateInventoryItem(
    id: string,
    inventoryItem: Partial<InventoryItem>,
    language?: string,
  ): Promise<ApiResponse<InventoryItem>> {
    return apiClient.put<InventoryItem>(
      `${INVENTORY_URL}/${id}`,
      inventoryItem,
      language as any,
    );
  },

  // Delete an inventory item
  async deleteInventoryItem(
    id: string,
    language?: string,
  ): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`${INVENTORY_URL}/${id}`, language as any);
  },

  // Get inventory transactions for an item
  async getInventoryTransactions(
    itemId: string,
    params?: QueryParams,
  ): Promise<ApiResponse<PaginatedResponse<InventoryTransaction>>> {
    return apiClient.get<PaginatedResponse<InventoryTransaction>>(
      `${INVENTORY_URL}/${itemId}/transactions`,
      params,
      params?.language,
    );
  },

  // Create inventory transaction
  async createInventoryTransaction(
    transaction: Omit<InventoryTransaction, "id" | "createdAt" | "updatedAt">,
    language?: string,
  ): Promise<ApiResponse<InventoryTransaction>> {
    return apiClient.post<InventoryTransaction>(
      `${INVENTORY_URL}/transactions`,
      transaction,
      language as any,
    );
  },

  // Suppliers

  // Get all suppliers with pagination and filtering
  async getSuppliers(
    params: QueryParams & SupplierFilterParams,
  ): Promise<ApiResponse<PaginatedResponse<Supplier>>> {
    return apiClient.get<PaginatedResponse<Supplier>>(
      SUPPLIER_URL,
      params,
      params.language,
    );
  },

  // Get supplier by ID
  async getSupplier(
    id: string,
    language?: string,
  ): Promise<ApiResponse<Supplier>> {
    return apiClient.get<Supplier>(
      `${SUPPLIER_URL}/${id}`,
      {},
      language as any,
    );
  },

  // Create a new supplier
  async createSupplier(
    supplier: Omit<Supplier, "id" | "createdAt" | "updatedAt">,
    language?: string,
  ): Promise<ApiResponse<Supplier>> {
    return apiClient.post<Supplier>(SUPPLIER_URL, supplier, language as any);
  },

  // Update a supplier
  async updateSupplier(
    id: string,
    supplier: Partial<Supplier>,
    language?: string,
  ): Promise<ApiResponse<Supplier>> {
    return apiClient.put<Supplier>(
      `${SUPPLIER_URL}/${id}`,
      supplier,
      language as any,
    );
  },

  // Delete a supplier
  async deleteSupplier(
    id: string,
    language?: string,
  ): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`${SUPPLIER_URL}/${id}`, language as any);
  },

  // Approve a supplier
  async approveSupplier(
    id: string,
    approvedBy: string,
    clientTypeIds: number[],
    language?: string,
  ): Promise<ApiResponse<Supplier>> {
    return apiClient.put<Supplier>(
      `${SUPPLIER_URL}/${id}/approve`,
      { approvedBy, clientTypeIds },
      language as any,
    );
  },

  // Categories

  // Get all categories
  async getCategories(
    params?: QueryParams,
  ): Promise<ApiResponse<PaginatedResponse<Category>>> {
    return apiClient.get<PaginatedResponse<Category>>(
      CATEGORY_URL,
      params,
      params?.language,
    );
  },

  // Get category by ID
  async getCategory(
    id: string,
    language?: string,
  ): Promise<ApiResponse<Category>> {
    return apiClient.get<Category>(
      `${CATEGORY_URL}/${id}`,
      {},
      language as any,
    );
  },

  // Create a new category
  async createCategory(
    category: Omit<Category, "id" | "createdAt" | "updatedAt">,
    language?: string,
  ): Promise<ApiResponse<Category>> {
    return apiClient.post<Category>(CATEGORY_URL, category, language as any);
  },

  // Update a category
  async updateCategory(
    id: string,
    category: Partial<Category>,
    language?: string,
  ): Promise<ApiResponse<Category>> {
    return apiClient.put<Category>(
      `${CATEGORY_URL}/${id}`,
      category,
      language as any,
    );
  },

  // Delete a category
  async deleteCategory(
    id: string,
    language?: string,
  ): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`${CATEGORY_URL}/${id}`, language as any);
  },
};
