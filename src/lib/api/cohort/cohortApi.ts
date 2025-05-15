// Cohort API for Barakatna Platform

import { apiClient } from "../core/apiClient";
import { ApiResponse, PaginatedResponse, QueryParams } from "../core/types";
import {
  Cohort,
  CohortFilterParams,
  CohortMember,
  CohortMemberFilterParams,
  CohortType,
  CreateCohortMemberRequest,
  CreateCohortRequest,
  UpdateCohortMemberRequest,
  UpdateCohortRequest,
} from "./types";

const BASE_URL = "/cohorts";
const MEMBER_URL = "/cohort-members";
const TYPE_URL = "/cohort-types";

// Cohort API
export const cohortApi = {
  // Get all cohorts with pagination and filtering
  async getCohorts(
    params: QueryParams & CohortFilterParams,
  ): Promise<ApiResponse<PaginatedResponse<Cohort>>> {
    return apiClient.get<PaginatedResponse<Cohort>>(
      BASE_URL,
      params,
      params.language,
    );
  },

  // Get cohort by ID
  async getCohort(id: number, language?: string): Promise<ApiResponse<Cohort>> {
    return apiClient.get<Cohort>(`${BASE_URL}/${id}`, {}, language as any);
  },

  // Create new cohort
  async createCohort(
    cohort: CreateCohortRequest,
    language?: string,
  ): Promise<ApiResponse<Cohort>> {
    return apiClient.post<Cohort>(BASE_URL, cohort, language as any);
  },

  // Update cohort
  async updateCohort(
    id: number,
    cohort: UpdateCohortRequest,
    language?: string,
  ): Promise<ApiResponse<Cohort>> {
    return apiClient.put<Cohort>(`${BASE_URL}/${id}`, cohort, language as any);
  },

  // Delete cohort
  async deleteCohort(
    id: number,
    language?: string,
  ): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`${BASE_URL}/${id}`, language as any);
  },

  // Get cohort types
  async getCohortTypes(
    params?: QueryParams,
  ): Promise<ApiResponse<PaginatedResponse<CohortType>>> {
    return apiClient.get<PaginatedResponse<CohortType>>(
      TYPE_URL,
      params,
      params?.language,
    );
  },

  // Get cohort members for a cohort
  async getCohortMembers(
    cohortId: number,
    params?: QueryParams & CohortMemberFilterParams,
  ): Promise<ApiResponse<PaginatedResponse<CohortMember>>> {
    return apiClient.get<PaginatedResponse<CohortMember>>(
      `${BASE_URL}/${cohortId}/members`,
      params,
      params?.language,
    );
  },

  // Get all cohort members with pagination and filtering
  async getAllCohortMembers(
    params: QueryParams & CohortMemberFilterParams,
  ): Promise<ApiResponse<PaginatedResponse<CohortMember>>> {
    return apiClient.get<PaginatedResponse<CohortMember>>(
      MEMBER_URL,
      params,
      params.language,
    );
  },

  // Get cohort member by ID
  async getCohortMember(
    id: number,
    language?: string,
  ): Promise<ApiResponse<CohortMember>> {
    return apiClient.get<CohortMember>(
      `${MEMBER_URL}/${id}`,
      {},
      language as any,
    );
  },

  // Create cohort member
  async createCohortMember(
    member: CreateCohortMemberRequest,
    language?: string,
  ): Promise<ApiResponse<CohortMember>> {
    return apiClient.post<CohortMember>(MEMBER_URL, member, language as any);
  },

  // Update cohort member
  async updateCohortMember(
    id: number,
    member: UpdateCohortMemberRequest,
    language?: string,
  ): Promise<ApiResponse<CohortMember>> {
    return apiClient.put<CohortMember>(
      `${MEMBER_URL}/${id}`,
      member,
      language as any,
    );
  },

  // Delete cohort member
  async deleteCohortMember(
    id: number,
    language?: string,
  ): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`${MEMBER_URL}/${id}`, language as any);
  },

  // Get cohort summary
  async getCohortSummary(
    id: number,
    language?: string,
  ): Promise<ApiResponse<any>> {
    return apiClient.get<any>(`${BASE_URL}/${id}/summary`, {}, language as any);
  },
};
