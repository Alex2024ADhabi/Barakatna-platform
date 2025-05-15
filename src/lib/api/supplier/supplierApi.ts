// Supplier API Service

import { apiClient } from "../core/apiClient";
import {
  ApiResponse,
  Language,
  PaginatedResponse,
  QueryParams,
} from "../core/types";
import {
  Supplier,
  SupplierDocument,
  SupplierOrder,
  SupplierReview,
  SupplierFilterParams,
  CreateSupplierRequest,
  UpdateSupplierRequest,
  CreateOrderRequest,
  CreateReviewRequest,
  UploadDocumentRequest,
} from "./types";

const BASE_ENDPOINT = "/suppliers";

export const supplierApi = {
  // Get all suppliers with pagination and filtering
  async getSuppliers(
    params?: QueryParams & SupplierFilterParams,
    language: Language = "en",
  ): Promise<ApiResponse<PaginatedResponse<Supplier>>> {
    return apiClient.get<PaginatedResponse<Supplier>>(
      BASE_ENDPOINT,
      params,
      language,
    );
  },

  // Get a single supplier by ID
  async getSupplierById(
    id: string,
    language: Language = "en",
  ): Promise<ApiResponse<Supplier>> {
    return apiClient.get<Supplier>(`${BASE_ENDPOINT}/${id}`, {}, language);
  },

  // Create a new supplier
  async createSupplier(
    data: CreateSupplierRequest,
    language: Language = "en",
  ): Promise<ApiResponse<Supplier>> {
    return apiClient.post<Supplier>(BASE_ENDPOINT, data, language);
  },

  // Update an existing supplier
  async updateSupplier(
    id: string,
    data: UpdateSupplierRequest,
    language: Language = "en",
  ): Promise<ApiResponse<Supplier>> {
    return apiClient.put<Supplier>(`${BASE_ENDPOINT}/${id}`, data, language);
  },

  // Delete a supplier
  async deleteSupplier(
    id: string,
    language: Language = "en",
  ): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`${BASE_ENDPOINT}/${id}`, language);
  },

  // Get documents for a supplier
  async getSupplierDocuments(
    supplierId: string,
    language: Language = "en",
  ): Promise<ApiResponse<SupplierDocument[]>> {
    return apiClient.get<SupplierDocument[]>(
      `${BASE_ENDPOINT}/${supplierId}/documents`,
      {},
      language,
    );
  },

  // Upload a document for a supplier
  async uploadDocument(
    data: UploadDocumentRequest,
    language: Language = "en",
  ): Promise<ApiResponse<SupplierDocument>> {
    // Create a FormData object to send the file
    const formData = new FormData();
    formData.append("file", data.file);
    formData.append("name", data.name);
    formData.append("type", data.type);

    try {
      const response = await fetch(
        `${apiClient.getBaseUrl()}${BASE_ENDPOINT}/${data.supplierId}/documents`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Accept-Language": language,
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: formData,
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        return { success: false, error: errorData.message || "Upload failed" };
      }

      const responseData = await response.json();
      return { success: true, data: responseData };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  },

  // Download a document
  async downloadDocument(
    documentId: string,
    language: Language = "en",
  ): Promise<ApiResponse<Blob>> {
    try {
      const response = await fetch(
        `${apiClient.getBaseUrl()}${BASE_ENDPOINT}/documents/${documentId}/download`,
        {
          method: "GET",
          headers: {
            Accept: "application/octet-stream",
            "Accept-Language": language,
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.message || "Download failed",
        };
      }

      const blob = await response.blob();
      return { success: true, data: blob };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  },

  // Delete a document
  async deleteDocument(
    documentId: string,
    language: Language = "en",
  ): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(
      `${BASE_ENDPOINT}/documents/${documentId}`,
      language,
    );
  },

  // Get orders for a supplier
  async getSupplierOrders(
    supplierId: string,
    language: Language = "en",
  ): Promise<ApiResponse<SupplierOrder[]>> {
    return apiClient.get<SupplierOrder[]>(
      `${BASE_ENDPOINT}/${supplierId}/orders`,
      {},
      language,
    );
  },

  // Create a new order for a supplier
  async createOrder(
    data: CreateOrderRequest,
    language: Language = "en",
  ): Promise<ApiResponse<SupplierOrder>> {
    return apiClient.post<SupplierOrder>(
      `${BASE_ENDPOINT}/${data.supplierId}/orders`,
      data,
      language,
    );
  },

  // Get reviews for a supplier
  async getSupplierReviews(
    supplierId: string,
    language: Language = "en",
  ): Promise<ApiResponse<SupplierReview[]>> {
    return apiClient.get<SupplierReview[]>(
      `${BASE_ENDPOINT}/${supplierId}/reviews`,
      {},
      language,
    );
  },

  // Create a new review for a supplier
  async createReview(
    data: CreateReviewRequest,
    language: Language = "en",
  ): Promise<ApiResponse<SupplierReview>> {
    return apiClient.post<SupplierReview>(
      `${BASE_ENDPOINT}/${data.supplierId}/reviews`,
      data,
      language,
    );
  },
};
