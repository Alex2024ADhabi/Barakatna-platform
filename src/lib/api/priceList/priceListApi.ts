// Price List API Service

import { apiClient } from "../core/apiClient";
import {
  ApiResponse,
  Language,
  PaginatedResponse,
  QueryParams,
} from "../core/types";
import {
  PriceItem,
  PriceItemVersion,
  PriceListFilterParams,
  CreatePriceItemRequest,
  UpdatePriceItemRequest,
  BulkImportResponse,
  ExportPriceListRequest,
} from "./types";

const BASE_ENDPOINT = "/price-list";

export const priceListApi = {
  // Get all price list items with pagination and filtering
  async getPriceItems(
    params?: QueryParams & PriceListFilterParams,
    language: Language = "en",
  ): Promise<ApiResponse<PaginatedResponse<PriceItem>>> {
    return apiClient.get<PaginatedResponse<PriceItem>>(
      BASE_ENDPOINT,
      params,
      language,
    );
  },

  // Get a single price list item by ID
  async getPriceItemById(
    id: string,
    language: Language = "en",
  ): Promise<ApiResponse<PriceItem>> {
    return apiClient.get<PriceItem>(`${BASE_ENDPOINT}/${id}`, {}, language);
  },

  // Create a new price list item
  async createPriceItem(
    data: CreatePriceItemRequest,
    language: Language = "en",
  ): Promise<ApiResponse<PriceItem>> {
    return apiClient.post<PriceItem>(BASE_ENDPOINT, data, language);
  },

  // Update an existing price list item
  async updatePriceItem(
    id: string,
    data: UpdatePriceItemRequest,
    language: Language = "en",
  ): Promise<ApiResponse<PriceItem>> {
    return apiClient.put<PriceItem>(`${BASE_ENDPOINT}/${id}`, data, language);
  },

  // Delete a price list item
  async deletePriceItem(
    id: string,
    language: Language = "en",
  ): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`${BASE_ENDPOINT}/${id}`, language);
  },

  // Get version history for a price list item
  async getPriceItemVersionHistory(
    id: string,
    language: Language = "en",
  ): Promise<ApiResponse<PriceItemVersion[]>> {
    return apiClient.get<PriceItemVersion[]>(
      `${BASE_ENDPOINT}/${id}/history`,
      {},
      language,
    );
  },

  // Bulk import price list items from a file
  async bulkImport(
    file: File,
    language: Language = "en",
  ): Promise<ApiResponse<BulkImportResponse>> {
    // Create a FormData object to send the file
    const formData = new FormData();
    formData.append("file", file);

    // Custom implementation for file upload
    try {
      const response = await fetch(
        `${apiClient.getBaseUrl()}${BASE_ENDPOINT}/bulk-import`,
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
        return { success: false, error: errorData.message || "Request failed" };
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  },

  // Export price list items to a file
  async exportPriceList(
    request: ExportPriceListRequest,
    language: Language = "en",
  ): Promise<ApiResponse<{ downloadUrl: string }>> {
    try {
      const response = await fetch(
        `${apiClient.getBaseUrl()}${BASE_ENDPOINT}/export`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "Accept-Language": language,
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(request),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        return { success: false, error: errorData.message || "Request failed" };
      }

      const data = await response.json();
      return { success: true, data };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  },

  // Get all available categories
  async getCategories(
    language: Language = "en",
  ): Promise<ApiResponse<string[]>> {
    return apiClient.get<string[]>(`${BASE_ENDPOINT}/categories`, {}, language);
  },

  // Get price list versions
  async getVersions(
    language: Language = "en",
  ): Promise<ApiResponse<PriceItemVersion[]>> {
    return apiClient.get<PriceItemVersion[]>(
      `${BASE_ENDPOINT}/versions`,
      {},
      language,
    );
  },

  // Approve price list changes
  async approvePriceChanges(
    versionId: string,
    comment: string,
    language: Language = "en",
  ): Promise<ApiResponse<void>> {
    return apiClient.post<void>(
      `${BASE_ENDPOINT}/versions/${versionId}/approve`,
      { comment },
      language,
    );
  },

  // Reject price list changes
  async rejectPriceChanges(
    versionId: string,
    reason: string,
    language: Language = "en",
  ): Promise<ApiResponse<void>> {
    return apiClient.post<void>(
      `${BASE_ENDPOINT}/versions/${versionId}/reject`,
      { reason },
      language,
    );
  },

  // Mass update price items
  async massUpdatePriceItems(
    itemIds: string[],
    updates: Partial<UpdatePriceItemRequest>,
    language: Language = "en",
  ): Promise<ApiResponse<{ updatedCount: number }>> {
    return apiClient.post<{ updatedCount: number }>(
      `${BASE_ENDPOINT}/mass-update`,
      { itemIds, updates },
      language,
    );
  },
};
