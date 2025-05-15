import axios from "axios";
import { API_BASE_URL } from "../config/api";
import { handleApiError } from "../utils/errorHandler";
import { authHeader } from "../utils/authHeader";

// Types
export interface CohortFilter {
  searchText?: string;
  cohortTypeId?: number;
  statusId?: number;
  startDateFrom?: Date;
  startDateTo?: Date;
  endDateFrom?: Date;
  endDateTo?: Date;
  coordinatorId?: number;
  hasAvailableCapacity?: boolean;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
  pageIndex?: number;
  pageSize?: number;
}

export interface CohortData {
  cohortId: number;
  cohortCode: string;
  cohortName: string;
  cohortTypeId: number;
  cohortTypeName: string;
  description?: string;
  startDate: Date;
  endDate?: Date;
  statusId: number;
  statusName: string;
  locationId?: number;
  locationName?: string;
  maxCapacity: number;
  currentMemberCount: number;
  coordinatorId?: number;
  coordinatorName?: string;
  notes?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  pageIndex: number;
  pageSize: number;
  totalPages: number;
}

export interface CohortRequest {
  cohortCode: string;
  cohortName: string;
  cohortTypeId: number;
  description?: string;
  startDate: Date;
  endDate?: Date;
  statusId: number;
  locationId?: number;
  maxCapacity: number;
  coordinatorId?: number;
  notes?: string;
}

// Service implementation
const cohortService = {
  /**
   * Get cohort by ID
   */
  getCohortById: async (
    cohortId: number,
  ): Promise<{
    success: boolean;
    data?: CohortData;
    message?: string;
  }> => {
    try {
      const response = await axios.get<CohortData>(
        `${API_BASE_URL}/cohorts/${cohortId}`,
        {
          headers: authHeader(),
        },
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error, "Failed to fetch cohort");
    }
  },

  /**
   * Get cohorts with pagination
   */
  getCohorts: async (
    filter: CohortFilter,
  ): Promise<{
    success: boolean;
    data?: PaginatedResponse<CohortData>;
    message?: string;
  }> => {
    try {
      const queryParams = new URLSearchParams();

      if (filter.searchText)
        queryParams.append("searchText", filter.searchText);
      if (filter.cohortTypeId)
        queryParams.append("cohortTypeId", filter.cohortTypeId.toString());
      if (filter.statusId)
        queryParams.append("statusId", filter.statusId.toString());
      if (filter.startDateFrom)
        queryParams.append("startDateFrom", filter.startDateFrom.toISOString());
      if (filter.startDateTo)
        queryParams.append("startDateTo", filter.startDateTo.toISOString());
      if (filter.endDateFrom)
        queryParams.append("endDateFrom", filter.endDateFrom.toISOString());
      if (filter.endDateTo)
        queryParams.append("endDateTo", filter.endDateTo.toISOString());
      if (filter.coordinatorId)
        queryParams.append("coordinatorId", filter.coordinatorId.toString());
      if (filter.hasAvailableCapacity !== undefined)
        queryParams.append(
          "hasAvailableCapacity",
          filter.hasAvailableCapacity.toString(),
        );
      if (filter.sortBy) queryParams.append("sortBy", filter.sortBy);
      if (filter.sortDirection)
        queryParams.append("sortDirection", filter.sortDirection);
      if (filter.pageIndex !== undefined)
        queryParams.append("pageIndex", filter.pageIndex.toString());
      if (filter.pageSize !== undefined)
        queryParams.append("pageSize", filter.pageSize.toString());

      const response = await axios.get<PaginatedResponse<CohortData>>(
        `${API_BASE_URL}/cohorts`,
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
      return handleApiError(error, "Failed to fetch cohorts");
    }
  },

  /**
   * Create a new cohort
   */
  createCohort: async (
    cohort: CohortRequest,
  ): Promise<{
    success: boolean;
    data?: CohortData;
    message?: string;
  }> => {
    try {
      const response = await axios.post<CohortData>(
        `${API_BASE_URL}/cohorts`,
        cohort,
        {
          headers: authHeader(),
        },
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error, "Failed to create cohort");
    }
  },

  /**
   * Update a cohort
   */
  updateCohort: async (
    cohortId: number,
    cohort: Partial<CohortRequest>,
  ): Promise<{
    success: boolean;
    data?: CohortData;
    message?: string;
  }> => {
    try {
      const response = await axios.put<CohortData>(
        `${API_BASE_URL}/cohorts/${cohortId}`,
        cohort,
        {
          headers: authHeader(),
        },
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error, "Failed to update cohort");
    }
  },

  /**
   * Delete a cohort
   */
  deleteCohort: async (
    cohortId: number,
  ): Promise<{
    success: boolean;
    message?: string;
  }> => {
    try {
      await axios.delete(`${API_BASE_URL}/cohorts/${cohortId}`, {
        headers: authHeader(),
      });

      return {
        success: true,
      };
    } catch (error) {
      return handleApiError(error, "Failed to delete cohort");
    }
  },

  /**
   * Get cohort summary
   */
  getCohortSummary: async (
    cohortId: number,
  ): Promise<{
    success: boolean;
    data?: any;
    message?: string;
  }> => {
    try {
      const response = await axios.get<any>(
        `${API_BASE_URL}/cohorts/${cohortId}/summary`,
        {
          headers: authHeader(),
        },
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return handleApiError(error, "Failed to fetch cohort summary");
    }
  },
};

export { cohortService };
