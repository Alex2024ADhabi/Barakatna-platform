import axios from "axios";
import { API_BASE_URL } from "../config/api";
import { handleApiError } from "../utils/errorHandler";
import { authHeader } from "../utils/authHeader";
import { BeneficiaryData } from "../types/types";
import { apiClient } from "../lib/api/core/apiClient";
import {
  dataValidationService,
  SchemaType,
} from "../lib/api/core/dataValidation";
import eventBus, { EventType } from "./eventBus";

// Types
export interface BeneficiaryFilter {
  searchText?: string;
  clientTypeId?: number;
  gender?: string;
  emirate?: string;
  registrationDateFrom?: Date;
  registrationDateTo?: Date;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
  pageIndex?: number;
  pageSize?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  pageIndex: number;
  pageSize: number;
  totalPages: number;
}

export interface BeneficiaryRequest {
  emiratesId: string;
  fullNameEn: string;
  fullNameAr: string;
  dateOfBirth: Date | null;
  gender: string;
  contactNumber: string;
  secondaryContactNumber?: string;
  address: {
    emirate: string;
    area: string;
    street: string;
    buildingVilla: string;
    gpsCoordinates?: string;
  };
  propertyDetails: {
    propertyType: string;
    ownership: string;
    bedrooms: number;
    bathrooms: number;
    floors: number;
    yearOfConstruction: number;
  };
  clientTypeId: number; // 1: FDF, 2: ADHA, 3: Cash-Based
}

// Service implementation
const beneficiaryService = {
  /**
   * Get beneficiary by ID
   */
  getBeneficiaryById: async (
    beneficiaryId: string,
  ): Promise<{
    success: boolean;
    data?: BeneficiaryData;
    message?: string;
  }> => {
    try {
      // Use the apiClient instead of axios directly
      const response = await apiClient.get<BeneficiaryData>(
        `/beneficiaries/${beneficiaryId}`,
        undefined,
        "en",
        { entityType: "beneficiary", skipAudit: true }, // Skip audit for read operations
      );

      if (!response.success) {
        return {
          success: false,
          message: response.error || "Failed to fetch beneficiary",
        };
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error, "Failed to fetch beneficiary");
    }
  },

  /**
   * Get beneficiaries with pagination
   */
  getBeneficiaries: async (
    filter: BeneficiaryFilter,
  ): Promise<{
    success: boolean;
    data?: PaginatedResponse<BeneficiaryData>;
    message?: string;
  }> => {
    try {
      // Convert filter to query params object for apiClient
      const params: Record<string, any> = {};

      if (filter.searchText) params.searchText = filter.searchText;
      if (filter.clientTypeId) params.clientTypeId = filter.clientTypeId;
      if (filter.gender) params.gender = filter.gender;
      if (filter.emirate) params.emirate = filter.emirate;
      if (filter.registrationDateFrom)
        params.registrationDateFrom = filter.registrationDateFrom;
      if (filter.registrationDateTo)
        params.registrationDateTo = filter.registrationDateTo;
      if (filter.sortBy) params.sortBy = filter.sortBy;
      if (filter.sortDirection) params.sortDirection = filter.sortDirection;
      if (filter.pageIndex !== undefined) params.page = filter.pageIndex;
      if (filter.pageSize !== undefined) params.pageSize = filter.pageSize;

      // Use the apiClient instead of axios directly
      const response = await apiClient.get<PaginatedResponse<BeneficiaryData>>(
        "/beneficiaries",
        params,
        "en",
        { entityType: "beneficiary", skipAudit: true }, // Skip audit for read operations
      );

      if (!response.success) {
        return {
          success: false,
          message: response.error || "Failed to fetch beneficiaries",
        };
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error, "Failed to fetch beneficiaries");
    }
  },

  /**
   * Create a new beneficiary
   */
  createBeneficiary: async (
    beneficiary: BeneficiaryRequest,
  ): Promise<{
    success: boolean;
    data?: BeneficiaryData;
    message?: string;
    validationErrors?: Record<string, string[]>;
  }> => {
    try {
      // Validate the beneficiary data before sending to the server
      const validationResult = await dataValidationService.validate(
        SchemaType.Beneficiary,
        beneficiary,
      );

      if (!validationResult.valid) {
        return {
          success: false,
          message: "Validation failed",
          validationErrors: validationResult.errorsByField,
        };
      }

      // Use the apiClient instead of axios directly to benefit from audit logging
      const response = await apiClient.post<BeneficiaryData>(
        "/beneficiaries",
        beneficiary,
        "en",
        { entityType: "beneficiary" },
      );

      if (!response.success) {
        return {
          success: false,
          message: response.error || "Failed to create beneficiary",
        };
      }

      // Publish event for other modules to react to
      if (response.data) {
        eventBus.publishBeneficiaryQualified(
          "beneficiaryService",
          response.data.id,
          beneficiary.clientTypeId === 1
            ? "FDF"
            : beneficiary.clientTypeId === 2
              ? "ADHA"
              : "Cash-Based",
          { initialRegistration: true },
        );
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error, "Failed to create beneficiary");
    }
  },

  /**
   * Validate a beneficiary without saving
   */
  validateBeneficiary: async (
    beneficiary: BeneficiaryRequest,
  ): Promise<{
    valid: boolean;
    errors?: Record<string, string[]>;
  }> => {
    const validationResult = await dataValidationService.validate(
      SchemaType.Beneficiary,
      beneficiary,
    );

    return {
      valid: validationResult.valid,
      errors: validationResult.errorsByField,
    };
  },

  /**
   * Update a beneficiary
   */
  updateBeneficiary: async (
    beneficiaryId: string,
    beneficiary: Partial<BeneficiaryRequest>,
  ): Promise<{
    success: boolean;
    data?: BeneficiaryData;
    message?: string;
    validationErrors?: Record<string, string[]>;
  }> => {
    try {
      // For partial updates, we need to get the current data first to validate the complete object
      const currentBeneficiary =
        await beneficiaryService.getBeneficiaryById(beneficiaryId);
      if (!currentBeneficiary.success || !currentBeneficiary.data) {
        return {
          success: false,
          message: "Failed to retrieve current beneficiary data for validation",
        };
      }

      // Merge current data with updates for validation
      const mergedData = {
        ...currentBeneficiary.data,
        ...beneficiary,
      };

      // Validate the merged data
      const validationResult = await dataValidationService.validate(
        SchemaType.Beneficiary,
        mergedData,
      );

      if (!validationResult.valid) {
        return {
          success: false,
          message: "Validation failed",
          validationErrors: validationResult.errorsByField,
        };
      }

      // Use the apiClient instead of axios directly
      const response = await apiClient.put<BeneficiaryData>(
        `/beneficiaries/${beneficiaryId}`,
        beneficiary,
        "en",
        { entityType: "beneficiary" },
      );

      if (!response.success) {
        return {
          success: false,
          message: response.error || "Failed to update beneficiary",
        };
      }

      // Publish event for other modules to react to
      if (response.data) {
        eventBus.publish({
          id: `beneficiary_updated_${Date.now()}`,
          type: EventType.BENEFICIARY_UPDATED,
          timestamp: new Date().toISOString(),
          source: "beneficiaryService",
          payload: {
            beneficiaryId,
            updates: Object.keys(beneficiary),
          },
        });
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error, "Failed to update beneficiary");
    }
  },

  /**
   * Delete a beneficiary
   */
  deleteBeneficiary: async (
    beneficiaryId: string,
  ): Promise<{
    success: boolean;
    message?: string;
  }> => {
    try {
      // Use the apiClient instead of axios directly
      const response = await apiClient.delete(
        `/beneficiaries/${beneficiaryId}`,
        "en",
        { entityType: "beneficiary" },
      );

      if (!response.success) {
        return {
          success: false,
          message: response.error || "Failed to delete beneficiary",
        };
      }

      return {
        success: true,
      };
    } catch (error) {
      return handleApiError(error, "Failed to delete beneficiary");
    }
  },

  /**
   * Get beneficiary summary
   */
  getBeneficiarySummary: async (
    clientTypeId?: number,
  ): Promise<{
    success: boolean;
    data?: any;
    message?: string;
  }> => {
    try {
      // Convert params to object for apiClient
      const params: Record<string, any> = {};
      if (clientTypeId) params.clientTypeId = clientTypeId;

      // Use the apiClient instead of axios directly
      const response = await apiClient.get<any>(
        "/beneficiaries/summary",
        params,
        "en",
        { entityType: "beneficiary", skipAudit: true }, // Skip audit for read operations
      );

      if (!response.success) {
        return {
          success: false,
          message: response.error || "Failed to fetch beneficiary summary",
        };
      }

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error, "Failed to fetch beneficiary summary");
    }
  },
};

export { beneficiaryService };
