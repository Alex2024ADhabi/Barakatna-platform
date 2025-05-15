// Project API for Barakatna Platform

import { apiClient } from "../core/apiClient";
import { ApiResponse, PaginatedResponse, QueryParams } from "../core/types";
import {
  CreateProjectRequest,
  CreateProjectTaskRequest,
  Project,
  ProjectFilterParams,
  ProjectTask,
  ProjectTaskFilterParams,
  ProjectType,
  UpdateProjectRequest,
  UpdateProjectTaskRequest,
} from "./types";

const BASE_URL = "/projects";
const TASK_URL = "/project-tasks";
const TYPE_URL = "/project-types";

// Project API
export const projectApi = {
  // Get all projects with pagination and filtering
  async getProjects(
    params: QueryParams & ProjectFilterParams,
  ): Promise<ApiResponse<PaginatedResponse<Project>>> {
    return apiClient.get<PaginatedResponse<Project>>(
      BASE_URL,
      params,
      params.language,
    );
  },

  // Get project by ID
  async getProject(
    id: number,
    language?: string,
  ): Promise<ApiResponse<Project>> {
    return apiClient.get<Project>(`${BASE_URL}/${id}`, {}, language as any);
  },

  // Create new project
  async createProject(
    project: CreateProjectRequest,
    language?: string,
  ): Promise<ApiResponse<Project>> {
    return apiClient.post<Project>(BASE_URL, project, language as any);
  },

  // Update project
  async updateProject(
    id: number,
    project: UpdateProjectRequest,
    language?: string,
  ): Promise<ApiResponse<Project>> {
    return apiClient.put<Project>(
      `${BASE_URL}/${id}`,
      project,
      language as any,
    );
  },

  // Delete project
  async deleteProject(
    id: number,
    language?: string,
  ): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`${BASE_URL}/${id}`, language as any);
  },

  // Get project types
  async getProjectTypes(
    params?: QueryParams,
  ): Promise<ApiResponse<PaginatedResponse<ProjectType>>> {
    return apiClient.get<PaginatedResponse<ProjectType>>(
      TYPE_URL,
      params,
      params?.language,
    );
  },

  // Get project tasks for a project
  async getProjectTasks(
    projectId: number,
    params?: QueryParams & ProjectTaskFilterParams,
  ): Promise<ApiResponse<PaginatedResponse<ProjectTask>>> {
    return apiClient.get<PaginatedResponse<ProjectTask>>(
      `${BASE_URL}/${projectId}/tasks`,
      params,
      params?.language,
    );
  },

  // Get all project tasks with pagination and filtering
  async getAllProjectTasks(
    params: QueryParams & ProjectTaskFilterParams,
  ): Promise<ApiResponse<PaginatedResponse<ProjectTask>>> {
    return apiClient.get<PaginatedResponse<ProjectTask>>(
      TASK_URL,
      params,
      params.language,
    );
  },

  // Get project task by ID
  async getProjectTask(
    id: number,
    language?: string,
  ): Promise<ApiResponse<ProjectTask>> {
    return apiClient.get<ProjectTask>(`${TASK_URL}/${id}`, {}, language as any);
  },

  // Create project task
  async createProjectTask(
    task: CreateProjectTaskRequest,
    language?: string,
  ): Promise<ApiResponse<ProjectTask>> {
    return apiClient.post<ProjectTask>(TASK_URL, task, language as any);
  },

  // Update project task
  async updateProjectTask(
    id: number,
    task: UpdateProjectTaskRequest,
    language?: string,
  ): Promise<ApiResponse<ProjectTask>> {
    return apiClient.put<ProjectTask>(
      `${TASK_URL}/${id}`,
      task,
      language as any,
    );
  },

  // Delete project task
  async deleteProjectTask(
    id: number,
    language?: string,
  ): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`${TASK_URL}/${id}`, language as any);
  },

  // Complete project task
  async completeProjectTask(
    id: number,
    actualHours?: number,
    language?: string,
  ): Promise<ApiResponse<ProjectTask>> {
    return apiClient.post<ProjectTask>(
      `${TASK_URL}/${id}/complete`,
      { actualHours },
      language as any,
    );
  },

  // Get project summary
  async getProjectSummary(
    id: number,
    language?: string,
  ): Promise<ApiResponse<any>> {
    return apiClient.get<any>(`${BASE_URL}/${id}/summary`, {}, language as any);
  },

  // Get project timeline
  async getProjectTimeline(
    id: number,
    language?: string,
  ): Promise<ApiResponse<any>> {
    return apiClient.get<any>(
      `${BASE_URL}/${id}/timeline`,
      {},
      language as any,
    );
  },

  // Get project budget summary
  async getProjectBudgetSummary(
    id: number,
    language?: string,
  ): Promise<ApiResponse<any>> {
    return apiClient.get<any>(
      `${BASE_URL}/${id}/budget-summary`,
      {},
      language as any,
    );
  },
};
