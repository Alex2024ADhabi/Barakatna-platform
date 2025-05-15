// Project API Types for Barakatna Platform

// Project Type
export interface ProjectType {
  projectTypeId: number;
  typeCode: string;
  typeNameEN: string;
  typeNameAR: string;
  description?: string;
  isActive: boolean;
}

// Project
export interface Project {
  projectId: number;
  projectCode: string;
  projectName: string;
  assessmentId: number;
  projectTypeId: number;
  statusId: number;
  startDate?: Date;
  targetCompletionDate: Date;
  actualCompletionDate?: Date;
  projectManagerId: number;
  totalBudget: number;
  approvedBudget?: number;
  actualCost?: number;
  priorityLevel: number;
  description?: string;
  notes?: string;
  createdBy: number;
  createdDate: Date;
  lastModifiedBy?: number;
  lastModifiedDate?: Date;
  isActive: boolean;
}

// Project Task
export interface ProjectTask {
  taskId: number;
  projectId: number;
  taskName: string;
  description?: string;
  startDate?: Date;
  dueDate: Date;
  completionDate?: Date;
  assignedToId?: number;
  statusId: number;
  priorityLevel: number;
  estimatedHours?: number;
  actualHours?: number;
  dependsOnTaskId?: number;
  createdBy: number;
  createdDate: Date;
  lastModifiedBy?: number;
  lastModifiedDate?: Date;
  isActive: boolean;
}

// Create Project Request
export interface CreateProjectRequest {
  projectCode: string;
  projectName: string;
  assessmentId: number;
  projectTypeId: number;
  statusId: number;
  startDate?: Date;
  targetCompletionDate: Date;
  projectManagerId: number;
  totalBudget: number;
  priorityLevel?: number;
  description?: string;
  notes?: string;
}

// Update Project Request
export interface UpdateProjectRequest {
  projectCode?: string;
  projectName?: string;
  projectTypeId?: number;
  statusId?: number;
  startDate?: Date;
  targetCompletionDate?: Date;
  actualCompletionDate?: Date;
  projectManagerId?: number;
  totalBudget?: number;
  approvedBudget?: number;
  actualCost?: number;
  priorityLevel?: number;
  description?: string;
  notes?: string;
  isActive?: boolean;
}

// Create Project Task Request
export interface CreateProjectTaskRequest {
  projectId: number;
  taskName: string;
  description?: string;
  startDate?: Date;
  dueDate: Date;
  assignedToId?: number;
  statusId: number;
  priorityLevel?: number;
  estimatedHours?: number;
  dependsOnTaskId?: number;
}

// Update Project Task Request
export interface UpdateProjectTaskRequest {
  taskName?: string;
  description?: string;
  startDate?: Date;
  dueDate?: Date;
  completionDate?: Date;
  assignedToId?: number;
  statusId?: number;
  priorityLevel?: number;
  estimatedHours?: number;
  actualHours?: number;
  dependsOnTaskId?: number;
  isActive?: boolean;
}

// Project Filter Parameters
export interface ProjectFilterParams {
  projectCode?: string;
  projectName?: string;
  assessmentId?: number;
  projectTypeId?: number;
  statusId?: number;
  projectManagerId?: number;
  startDateFrom?: Date;
  startDateTo?: Date;
  targetCompletionDateFrom?: Date;
  targetCompletionDateTo?: Date;
  actualCompletionDateFrom?: Date;
  actualCompletionDateTo?: Date;
  priorityLevel?: number;
  totalBudgetFrom?: number;
  totalBudgetTo?: number;
}

// Project Task Filter Parameters
export interface ProjectTaskFilterParams {
  projectId?: number;
  taskName?: string;
  assignedToId?: number;
  statusId?: number;
  priorityLevel?: number;
  startDateFrom?: Date;
  startDateTo?: Date;
  dueDateFrom?: Date;
  dueDateTo?: Date;
  completionDateFrom?: Date;
  completionDateTo?: Date;
  dependsOnTaskId?: number;
}
