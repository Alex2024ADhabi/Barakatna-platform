// User Roles and Permissions API for Barakatna Platform

import { apiClient } from "../core/apiClient";
import { ApiResponse, PaginatedResponse, QueryParams } from "../core/types";

const BASE_URL = "/user-roles";

// Types for user roles and permissions
export interface Permission {
  module: string;
  view: boolean;
  create: boolean;
  edit: boolean;
  delete: boolean;
  approve: boolean;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  parentRoleId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface RoleFilterParams {
  name?: string;
  module?: string;
}

export interface CreateRoleRequest {
  name: string;
  description: string;
  permissions: Permission[];
  parentRoleId?: string;
}

export interface UpdateRoleRequest {
  name?: string;
  description?: string;
  permissions?: Permission[];
  parentRoleId?: string;
}

// User Roles API
export const userRolesApi = {
  // Get all roles with pagination and filtering
  async getRoles(
    params?: QueryParams & RoleFilterParams,
  ): Promise<ApiResponse<PaginatedResponse<Role>>> {
    return apiClient.get<PaginatedResponse<Role>>(
      BASE_URL,
      params,
      params?.language,
    );
  },

  // Get a single role by ID
  async getRoleById(id: string): Promise<ApiResponse<Role>> {
    return apiClient.get<Role>(`${BASE_URL}/${id}`);
  },

  // Create a new role
  async createRole(data: CreateRoleRequest): Promise<ApiResponse<Role>> {
    return apiClient.post<Role>(BASE_URL, data);
  },

  // Update an existing role
  async updateRole(
    id: string,
    data: UpdateRoleRequest,
  ): Promise<ApiResponse<Role>> {
    return apiClient.put<Role>(`${BASE_URL}/${id}`, data);
  },

  // Delete a role
  async deleteRole(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`${BASE_URL}/${id}`);
  },

  // Get available modules for permissions
  async getAvailableModules(): Promise<ApiResponse<string[]>> {
    return apiClient.get<string[]>(`${BASE_URL}/modules`);
  },

  // Clone a role
  async cloneRole(id: string, newName: string): Promise<ApiResponse<Role>> {
    return apiClient.post<Role>(`${BASE_URL}/${id}/clone`, { name: newName });
  },

  // Get role hierarchy
  async getRoleHierarchy(): Promise<ApiResponse<Role[]>> {
    return apiClient.get<Role[]>(`${BASE_URL}/hierarchy`);
  },

  // Resolve permission conflicts
  async resolvePermissionConflicts(roleId: string): Promise<ApiResponse<Role>> {
    return apiClient.post<Role>(`${BASE_URL}/${roleId}/resolve-conflicts`, {});
  },
};
