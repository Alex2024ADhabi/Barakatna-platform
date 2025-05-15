// User API Service

import { apiClient } from "../core/apiClient";
import { ApiResponse, PaginatedResponse, QueryParams } from "../core/types";
import {
  CreateUserRequest,
  UpdateUserRequest,
  User,
  UserFilterParams,
  UserWithPermissions,
} from "./types";

const BASE_URL = "/users";

export const userApi = {
  // Get all users with pagination and filtering
  async getUsers(
    params?: QueryParams & UserFilterParams,
  ): Promise<ApiResponse<PaginatedResponse<User>>> {
    return apiClient.get<PaginatedResponse<User>>(
      BASE_URL,
      params,
      params?.language,
    );
  },

  // Get a single user by ID
  async getUserById(id: string): Promise<ApiResponse<User>> {
    return apiClient.get<User>(`${BASE_URL}/${id}`);
  },

  // Get current user with permissions
  async getCurrentUser(): Promise<ApiResponse<UserWithPermissions>> {
    return apiClient.get<UserWithPermissions>(`${BASE_URL}/me`);
  },

  // Create a new user
  async createUser(data: CreateUserRequest): Promise<ApiResponse<User>> {
    return apiClient.post<User>(BASE_URL, data);
  },

  // Update an existing user
  async updateUser(
    id: string,
    data: UpdateUserRequest,
  ): Promise<ApiResponse<User>> {
    return apiClient.put<User>(`${BASE_URL}/${id}`, data);
  },

  // Delete a user
  async deleteUser(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`${BASE_URL}/${id}`);
  },

  // Activate a user
  async activateUser(id: string): Promise<ApiResponse<User>> {
    return apiClient.post<User>(`${BASE_URL}/${id}/activate`, {});
  },

  // Deactivate a user
  async deactivateUser(id: string): Promise<ApiResponse<User>> {
    return apiClient.post<User>(`${BASE_URL}/${id}/deactivate`, {});
  },

  // Reset user password
  async resetPassword(
    id: string,
  ): Promise<ApiResponse<{ temporaryPassword: string }>> {
    return apiClient.post<{ temporaryPassword: string }>(
      `${BASE_URL}/${id}/reset-password`,
      {},
    );
  },

  // Change current user password
  async changePassword(
    currentPassword: string,
    newPassword: string,
  ): Promise<ApiResponse<void>> {
    return apiClient.post<void>(`${BASE_URL}/me/change-password`, {
      currentPassword,
      newPassword,
    });
  },
};
