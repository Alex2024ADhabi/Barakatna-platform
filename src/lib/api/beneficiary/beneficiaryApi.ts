// Beneficiary API for Barakatna Platform

import { apiClient } from "../core/apiClient";
import { ApiResponse, PaginatedResponse, QueryParams } from "../core/types";
import {
  Beneficiary,
  BeneficiaryFilterParams,
  BeneficiarySummary,
  CreateBeneficiaryRequest,
  UpdateBeneficiaryRequest,
} from "./types";

const BASE_URL = "/beneficiaries";

// Beneficiary API
export const beneficiaryApi = {
  // Get all beneficiaries with pagination and filtering
  async getBeneficiaries(
    params: QueryParams & BeneficiaryFilterParams,
  ): Promise<ApiResponse<PaginatedResponse<Beneficiary>>> {
    return apiClient.get<PaginatedResponse<Beneficiary>>(
      BASE_URL,
      params,
      params.language,
    );
  },

  // Get beneficiary by ID
  async getBeneficiary(
    id: string,
    language?: string,
  ): Promise<ApiResponse<Beneficiary>> {
    return apiClient.get<Beneficiary>(`${BASE_URL}/${id}`, {}, language as any);
  },

  // Create new beneficiary
  async createBeneficiary(
    beneficiary: CreateBeneficiaryRequest,
    language?: string,
  ): Promise<ApiResponse<Beneficiary>> {
    return apiClient.post<Beneficiary>(BASE_URL, beneficiary, language as any);
  },

  // Update beneficiary
  async updateBeneficiary(
    id: string,
    beneficiary: UpdateBeneficiaryRequest,
    language?: string,
  ): Promise<ApiResponse<Beneficiary>> {
    return apiClient.put<Beneficiary>(
      `${BASE_URL}/${id}`,
      beneficiary,
      language as any,
    );
  },

  // Delete beneficiary
  async deleteBeneficiary(
    id: string,
    language?: string,
  ): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`${BASE_URL}/${id}`, language as any);
  },

  // Get beneficiary summary
  async getBeneficiarySummary(
    clientTypeId?: number,
    language?: string,
  ): Promise<ApiResponse<BeneficiarySummary>> {
    const params: any = {};
    if (clientTypeId) params.clientTypeId = clientTypeId;

    return apiClient.get<BeneficiarySummary>(
      `${BASE_URL}/summary`,
      params,
      language as any,
    );
  },

  // Export beneficiaries to Excel
  async exportBeneficiariesToExcel(
    params: BeneficiaryFilterParams,
    language?: string,
  ): Promise<ApiResponse<Blob>> {
    return apiClient.getBlob(`${BASE_URL}/export`, params, language as any, {
      Accept:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
  },
};
