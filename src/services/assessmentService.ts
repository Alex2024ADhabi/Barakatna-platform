import axios from "axios";
import { API_BASE_URL } from "../config/api";
import { handleApiError } from "../utils/errorHandler";
import { authHeader } from "../utils/authHeader";

// Types
export interface Assessment {
  assessmentId: number;
  assessmentCode: string;
  seniorCitizenId: number;
  seniorCitizenName: string;
  assessmentTypeId: number;
  assessmentTypeName: string;
  propertyId: number;
  propertyAddress: string;
  assessmentDate: Date;
  assessorId: number;
  assessorName: string;
  supervisorId: number | null;
  supervisorName: string | null;
  statusId: number;
  statusName: string;
  completionDate: Date | null;
  approvalDate: Date | null;
  totalEstimatedCost: number | null;
  clientTypeId: number;
  clientTypeName: string;
  notes: string | null;
  isActive: boolean;
  createdBy: number;
  createdDate: Date;
  lastModifiedBy: number | null;
  lastModifiedDate: Date | null;
}

export interface AssessmentType {
  assessmentTypeId: number;
  typeCode: string;
  typeName: string;
  description: string;
}

export interface AssessmentStatus {
  statusId: number;
  statusCode: string;
  statusName: string;
  statusCategory: string;
  orderSequence: number;
}

export interface AssessmentRequest {
  seniorCitizenId: number;
  assessmentTypeId: number;
  propertyId: number;
  assessmentDate: Date;
  assessorId: number;
  supervisorId?: number;
  notes?: string;
  clientTypeId: number;
}

export interface AssessmentSummary {
  totalAssessments: number;
  pendingAssessments: number;
  completedAssessments: number;
  approvedAssessments: number;
  rejectedAssessments: number;
  totalEstimatedCost: number;
  averageCompletionDays: number;
  assessmentsByMonth: { month: string; count: number }[];
  assessmentsByClientType: { clientType: string; count: number }[];
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  pageIndex: number;
  pageSize: number;
  totalPages: number;
}

export interface AssessmentFilter {
  searchText?: string;
  clientTypeId?: number;
  statusId?: number[];
  assessorId?: number;
  startDate?: Date;
  endDate?: Date;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
  pageIndex?: number;
  pageSize?: number;
}

// Service implementation
const assessmentService = {
  /**
   * Get assessment by ID
   */
  getAssessmentById: async (
    assessmentId: number,
  ): Promise<{ success: boolean; data?: Assessment; message?: string }> => {
    try {
      const response = await axios.get<Assessment>(
        `${API_BASE_URL}/assessments/${assessmentId}`,
        {
          headers: authHeader(),
        },
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error, "Failed to fetch assessment");
    }
  },

  /**
   * Get assessments with pagination
   */
  getAssessments: async (
    filter: AssessmentFilter,
  ): Promise<{
    success: boolean;
    data?: PaginatedResponse<Assessment>;
    message?: string;
  }> => {
    try {
      const queryParams = new URLSearchParams();

      if (filter.searchText)
        queryParams.append("searchText", filter.searchText);
      if (filter.clientTypeId)
        queryParams.append("clientTypeId", filter.clientTypeId.toString());
      if (filter.statusId && filter.statusId.length)
        filter.statusId.forEach((id) =>
          queryParams.append("statusId", id.toString()),
        );
      if (filter.assessorId)
        queryParams.append("assessorId", filter.assessorId.toString());
      if (filter.startDate)
        queryParams.append("startDate", filter.startDate.toISOString());
      if (filter.endDate)
        queryParams.append("endDate", filter.endDate.toISOString());
      if (filter.sortBy) queryParams.append("sortBy", filter.sortBy);
      if (filter.sortDirection)
        queryParams.append("sortDirection", filter.sortDirection);
      if (filter.pageIndex !== undefined)
        queryParams.append("pageIndex", filter.pageIndex.toString());
      if (filter.pageSize !== undefined)
        queryParams.append("pageSize", filter.pageSize.toString());

      const response = await axios.get<PaginatedResponse<Assessment>>(
        `${API_BASE_URL}/assessments`,
        {
          headers: authHeader(),
          params: queryParams,
        },
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error, "Failed to fetch assessments");
    }
  },

  /**
   * Get assessments for a senior citizen
   */
  getAssessmentsBySeniorCitizen: async (
    seniorCitizenId: number,
  ): Promise<{
    success: boolean;
    data?: Assessment[];
    message?: string;
  }> => {
    try {
      const response = await axios.get<Assessment[]>(
        `${API_BASE_URL}/senior-citizens/${seniorCitizenId}/assessments`,
        {
          headers: authHeader(),
        },
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(
        error,
        "Failed to fetch assessments for senior citizen",
      );
    }
  },

  /**
   * Get assessments assigned to an assessor
   */
  getAssessmentsByAssessor: async (
    assessorId: number,
  ): Promise<{
    success: boolean;
    data?: Assessment[];
    message?: string;
  }> => {
    try {
      const response = await axios.get<Assessment[]>(
        `${API_BASE_URL}/assessments/by-assessor/${assessorId}`,
        {
          headers: authHeader(),
        },
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error, "Failed to fetch assessments for assessor");
    }
  },

  /**
   * Create a new assessment
   */
  createAssessment: async (
    assessment: AssessmentRequest,
  ): Promise<{
    success: boolean;
    data?: Assessment;
    message?: string;
  }> => {
    try {
      const response = await axios.post<Assessment>(
        `${API_BASE_URL}/assessments`,
        assessment,
        {
          headers: authHeader(),
        },
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error, "Failed to create assessment");
    }
  },

  /**
   * Update an assessment
   */
  updateAssessment: async (
    assessmentId: number,
    assessment: Partial<Assessment>,
  ): Promise<{
    success: boolean;
    data?: Assessment;
    message?: string;
  }> => {
    try {
      const response = await axios.put<Assessment>(
        `${API_BASE_URL}/assessments/${assessmentId}`,
        assessment,
        {
          headers: authHeader(),
        },
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error, "Failed to update assessment");
    }
  },

  /**
   * Complete an assessment
   */
  completeAssessment: async (
    assessmentId: number,
  ): Promise<{
    success: boolean;
    data?: Assessment;
    message?: string;
  }> => {
    try {
      const response = await axios.post<Assessment>(
        `${API_BASE_URL}/assessments/${assessmentId}/complete`,
        {},
        {
          headers: authHeader(),
        },
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error, "Failed to complete assessment");
    }
  },

  /**
   * Approve an assessment
   */
  approveAssessment: async (
    assessmentId: number,
    approvedAmount: number,
    notes?: string,
  ): Promise<{
    success: boolean;
    data?: Assessment;
    message?: string;
  }> => {
    try {
      const response = await axios.post<Assessment>(
        `${API_BASE_URL}/assessments/${assessmentId}/approve`,
        { approvedAmount, notes },
        { headers: authHeader() },
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error, "Failed to approve assessment");
    }
  },

  /**
   * Reject an assessment
   */
  rejectAssessment: async (
    assessmentId: number,
    reason: string,
  ): Promise<{
    success: boolean;
    data?: Assessment;
    message?: string;
  }> => {
    try {
      const response = await axios.post<Assessment>(
        `${API_BASE_URL}/assessments/${assessmentId}/reject`,
        { reason },
        { headers: authHeader() },
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error, "Failed to reject assessment");
    }
  },

  /**
   * Get assessment types
   */
  getAssessmentTypes: async (): Promise<{
    success: boolean;
    data?: AssessmentType[];
    message?: string;
  }> => {
    try {
      const response = await axios.get<AssessmentType[]>(
        `${API_BASE_URL}/assessment-types`,
        {
          headers: authHeader(),
        },
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error, "Failed to fetch assessment types");
    }
  },

  /**
   * Get assessment statuses
   */
  getAssessmentStatuses: async (): Promise<{
    success: boolean;
    data?: AssessmentStatus[];
    message?: string;
  }> => {
    try {
      const response = await axios.get<AssessmentStatus[]>(
        `${API_BASE_URL}/assessment-statuses`,
        {
          headers: authHeader(),
        },
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error, "Failed to fetch assessment statuses");
    }
  },

  /**
   * Get assessment summary for dashboard
   */
  getAssessmentSummary: async (
    clientTypeId?: number,
    startDate?: Date,
    endDate?: Date,
  ): Promise<{
    success: boolean;
    data?: AssessmentSummary;
    message?: string;
  }> => {
    try {
      const queryParams = new URLSearchParams();

      if (clientTypeId)
        queryParams.append("clientTypeId", clientTypeId.toString());
      if (startDate) queryParams.append("startDate", startDate.toISOString());
      if (endDate) queryParams.append("endDate", endDate.toISOString());

      const response = await axios.get<AssessmentSummary>(
        `${API_BASE_URL}/assessments/summary`,
        {
          headers: authHeader(),
          params: queryParams,
        },
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error, "Failed to fetch assessment summary");
    }
  },

  /**
   * Get assessments by client type
   */
  getAssessmentsByClientType: async (
    clientTypeId: number,
  ): Promise<{
    success: boolean;
    data?: Assessment[];
    message?: string;
  }> => {
    try {
      const response = await axios.get<Assessment[]>(
        `${API_BASE_URL}/assessments/by-client-type/${clientTypeId}`,
        {
          headers: authHeader(),
        },
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(
        error,
        "Failed to fetch assessments by client type",
      );
    }
  },

  /**
   * Export assessments to Excel
   */
  exportAssessmentsToExcel: async (
    filter: AssessmentFilter,
  ): Promise<{
    success: boolean;
    data?: Blob;
    message?: string;
  }> => {
    try {
      const queryParams = new URLSearchParams();

      if (filter.searchText)
        queryParams.append("searchText", filter.searchText);
      if (filter.clientTypeId)
        queryParams.append("clientTypeId", filter.clientTypeId.toString());
      if (filter.statusId && filter.statusId.length)
        filter.statusId.forEach((id) =>
          queryParams.append("statusId", id.toString()),
        );
      if (filter.assessorId)
        queryParams.append("assessorId", filter.assessorId.toString());
      if (filter.startDate)
        queryParams.append("startDate", filter.startDate.toISOString());
      if (filter.endDate)
        queryParams.append("endDate", filter.endDate.toISOString());

      const response = await axios.get(`${API_BASE_URL}/assessments/export`, {
        headers: {
          ...authHeader(),
          Accept:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        },
        params: queryParams,
        responseType: "blob",
      });

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error, "Failed to export assessments");
    }
  },

  /**
   * Get assessment history
   */
  getAssessmentHistory: async (
    assessmentId: number,
  ): Promise<{
    success: boolean;
    data?: any[]; // Define proper type for assessment history
    message?: string;
  }> => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/assessments/${assessmentId}/history`,
        {
          headers: authHeader(),
        },
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error, "Failed to fetch assessment history");
    }
  },

  /**
   * Generate assessment report
   */
  generateAssessmentReport: async (
    assessmentId: number,
    reportType: string,
  ): Promise<{
    success: boolean;
    data?: Blob;
    message?: string;
  }> => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/assessments/${assessmentId}/report/${reportType}`,
        {
          headers: {
            ...authHeader(),
            Accept: "application/pdf",
          },
          responseType: "blob",
        },
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error, "Failed to generate assessment report");
    }
  },

  /**
   * Submit assessment for approval
   */
  submitAssessmentForApproval: async (
    assessmentId: number,
    notes?: string,
  ): Promise<{
    success: boolean;
    data?: Assessment;
    message?: string;
  }> => {
    try {
      const response = await axios.post<Assessment>(
        `${API_BASE_URL}/assessments/${assessmentId}/submit-for-approval`,
        { notes },
        { headers: authHeader() },
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error, "Failed to submit assessment for approval");
    }
  },

  /**
   * Assign assessment to a different assessor
   */
  assignAssessment: async (
    assessmentId: number,
    assessorId: number,
  ): Promise<{
    success: boolean;
    data?: Assessment;
    message?: string;
  }> => {
    try {
      const response = await axios.post<Assessment>(
        `${API_BASE_URL}/assessments/${assessmentId}/assign`,
        { assessorId },
        { headers: authHeader() },
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error, "Failed to assign assessment");
    }
  },

  /**
   * Delete assessment (soft delete)
   */
  deleteAssessment: async (
    assessmentId: number,
  ): Promise<{
    success: boolean;
    message?: string;
  }> => {
    try {
      await axios.delete(`${API_BASE_URL}/assessments/${assessmentId}`, {
        headers: authHeader(),
      });

      return {
        success: true,
      };
    } catch (error) {
      return handleApiError(error, "Failed to delete assessment");
    }
  },
};

export { assessmentService };
