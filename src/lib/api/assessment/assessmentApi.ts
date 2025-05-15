// Assessment API for Barakatna Platform

import { apiClient } from "../core/apiClient";
import { ApiResponse, PaginatedResponse, QueryParams } from "../core/types";
import {
  Assessment,
  AssessmentFilterParams,
  AssessmentType,
  CreateAssessmentRequest,
  RoomAssessment,
  RoomAssessmentFilterParams,
  RoomType,
  UpdateAssessmentRequest,
  CreateRoomAssessmentRequest,
  UpdateRoomAssessmentRequest,
} from "./types";

const BASE_URL = "/assessments";
const ROOM_URL = "/room-assessments";
const TYPE_URL = "/assessment-types";
const ROOM_TYPE_URL = "/room-types";

// Assessment API
export const assessmentApi = {
  // Get all assessments with pagination and filtering
  async getAssessments(
    params: QueryParams & AssessmentFilterParams,
  ): Promise<ApiResponse<PaginatedResponse<Assessment>>> {
    return apiClient.get<PaginatedResponse<Assessment>>(
      BASE_URL,
      params,
      params.language,
    );
  },

  // Get assessment by ID
  async getAssessment(
    id: number,
    language?: string,
  ): Promise<ApiResponse<Assessment>> {
    return apiClient.get<Assessment>(`${BASE_URL}/${id}`, {}, language as any);
  },

  // Create new assessment
  async createAssessment(
    assessment: CreateAssessmentRequest,
    language?: string,
  ): Promise<ApiResponse<Assessment>> {
    return apiClient.post<Assessment>(BASE_URL, assessment, language as any);
  },

  // Update assessment
  async updateAssessment(
    id: number,
    assessment: UpdateAssessmentRequest,
    language?: string,
  ): Promise<ApiResponse<Assessment>> {
    return apiClient.put<Assessment>(
      `${BASE_URL}/${id}`,
      assessment,
      language as any,
    );
  },

  // Delete assessment
  async deleteAssessment(
    id: number,
    language?: string,
  ): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`${BASE_URL}/${id}`, language as any);
  },

  // Get assessment types
  async getAssessmentTypes(
    params?: QueryParams,
  ): Promise<ApiResponse<PaginatedResponse<AssessmentType>>> {
    return apiClient.get<PaginatedResponse<AssessmentType>>(
      TYPE_URL,
      params,
      params?.language,
    );
  },

  // Get room types
  async getRoomTypes(
    params?: QueryParams,
  ): Promise<ApiResponse<PaginatedResponse<RoomType>>> {
    return apiClient.get<PaginatedResponse<RoomType>>(
      ROOM_TYPE_URL,
      params,
      params?.language,
    );
  },

  // Get room assessments for an assessment
  async getRoomAssessments(
    assessmentId: number,
    params?: QueryParams & RoomAssessmentFilterParams,
  ): Promise<ApiResponse<PaginatedResponse<RoomAssessment>>> {
    return apiClient.get<PaginatedResponse<RoomAssessment>>(
      `${BASE_URL}/${assessmentId}/rooms`,
      params,
      params?.language,
    );
  },

  // Get room assessment by ID
  async getRoomAssessment(
    id: number,
    language?: string,
  ): Promise<ApiResponse<RoomAssessment>> {
    return apiClient.get<RoomAssessment>(
      `${ROOM_URL}/${id}`,
      {},
      language as any,
    );
  },

  // Create room assessment
  async createRoomAssessment(
    roomAssessment: CreateRoomAssessmentRequest,
    language?: string,
  ): Promise<ApiResponse<RoomAssessment>> {
    return apiClient.post<RoomAssessment>(
      ROOM_URL,
      roomAssessment,
      language as any,
    );
  },

  // Update room assessment
  async updateRoomAssessment(
    id: number,
    roomAssessment: UpdateRoomAssessmentRequest,
    language?: string,
  ): Promise<ApiResponse<RoomAssessment>> {
    return apiClient.put<RoomAssessment>(
      `${ROOM_URL}/${id}`,
      roomAssessment,
      language as any,
    );
  },

  // Delete room assessment
  async deleteRoomAssessment(
    id: number,
    language?: string,
  ): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`${ROOM_URL}/${id}`, language as any);
  },

  // Complete assessment
  async completeAssessment(
    id: number,
    language?: string,
  ): Promise<ApiResponse<Assessment>> {
    return apiClient.post<Assessment>(
      `${BASE_URL}/${id}/complete`,
      {},
      language as any,
    );
  },

  // Approve assessment
  async approveAssessment(
    id: number,
    language?: string,
  ): Promise<ApiResponse<Assessment>> {
    return apiClient.post<Assessment>(
      `${BASE_URL}/${id}/approve`,
      {},
      language as any,
    );
  },

  // Get assessment summary
  async getAssessmentSummary(
    id: number,
    language?: string,
  ): Promise<ApiResponse<any>> {
    return apiClient.get<any>(`${BASE_URL}/${id}/summary`, {}, language as any);
  },
};
