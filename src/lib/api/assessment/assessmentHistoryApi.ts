// Assessment History API for Barakatna Platform

import { apiClient } from "../core/apiClient";
import { ApiResponse, PaginatedResponse, QueryParams } from "../core/types";
import { Assessment } from "./types";

const BASE_URL = "/assessment-history";

// Additional filter parameters specific to assessment history
export interface AssessmentHistoryFilterParams {
  beneficiaryId?: string;
  dateFrom?: string;
  dateTo?: string;
  status?: string;
  assessorId?: string;
  type?: string;
  searchTerm?: string;
  page?: number;
  pageSize?: number;
}

// Assessment History API
export const assessmentHistoryApi = {
  // Get assessment history with pagination and filtering
  async getAssessmentHistory(
    params: QueryParams & AssessmentHistoryFilterParams,
  ): Promise<ApiResponse<PaginatedResponse<Assessment>>> {
    return apiClient.get<PaginatedResponse<Assessment>>(
      BASE_URL,
      params,
      params.language,
    );
  },

  // Get assessment history for a specific beneficiary
  async getBeneficiaryAssessmentHistory(
    beneficiaryId: string,
    params?: QueryParams & AssessmentHistoryFilterParams,
  ): Promise<ApiResponse<PaginatedResponse<Assessment>>> {
    return apiClient.get<PaginatedResponse<Assessment>>(
      `${BASE_URL}/beneficiary/${beneficiaryId}`,
      params,
      params?.language,
    );
  },

  // Export assessment as PDF
  async exportAssessmentAsPdf(
    assessmentId: string,
    language?: string,
  ): Promise<ApiResponse<Blob>> {
    return apiClient.download(
      `${BASE_URL}/${assessmentId}/export/pdf`,
      {},
      (language as "en" | "ar") || "en",
    );
  },

  // Export assessment as Excel
  async exportAssessmentAsExcel(
    assessmentId: string,
    language?: string,
  ): Promise<ApiResponse<Blob>> {
    return apiClient.download(
      `${BASE_URL}/${assessmentId}/export/excel`,
      {},
      (language as "en" | "ar") || "en",
    );
  },

  // Export assessment as CSV
  async exportAssessmentAsCsv(
    assessmentId: string,
    language?: string,
  ): Promise<ApiResponse<Blob>> {
    return apiClient.download(
      `${BASE_URL}/${assessmentId}/export/csv`,
      {},
      (language as "en" | "ar") || "en",
    );
  },

  // Export multiple assessments as PDF
  async exportAssessmentsAsPdf(
    filters: AssessmentHistoryFilterParams,
    language?: string,
  ): Promise<ApiResponse<Blob>> {
    return apiClient.download(
      `${BASE_URL}/export/pdf`,
      filters,
      (language as "en" | "ar") || "en",
    );
  },

  // Export multiple assessments as Excel
  async exportAssessmentsAsExcel(
    filters: AssessmentHistoryFilterParams,
    language?: string,
  ): Promise<ApiResponse<Blob>> {
    return apiClient.download(
      `${BASE_URL}/export/excel`,
      filters,
      (language as "en" | "ar") || "en",
    );
  },

  // Export multiple assessments as CSV
  async exportAssessmentsAsCsv(
    filters: AssessmentHistoryFilterParams,
    language?: string,
  ): Promise<ApiResponse<Blob>> {
    return apiClient.download(
      `${BASE_URL}/export/csv`,
      filters,
      (language as "en" | "ar") || "en",
    );
  },

  // Get assessment details
  async getAssessmentDetails(
    assessmentId: string,
    language?: string,
  ): Promise<ApiResponse<Assessment>> {
    return apiClient.get<Assessment>(
      `${BASE_URL}/${assessmentId}`,
      {},
      (language as "en" | "ar") || "en",
    );
  },

  // Get assessment statistics
  async getAssessmentStatistics(
    filters?: AssessmentHistoryFilterParams,
    language?: string,
  ): Promise<ApiResponse<Record<string, number>>> {
    return apiClient.get<Record<string, number>>(
      `${BASE_URL}/statistics`,
      filters,
      (language as "en" | "ar") || "en",
    );
  },
};
