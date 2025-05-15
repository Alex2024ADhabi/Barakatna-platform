// Cohort Analytics API for Barakatna Platform

import { apiClient } from "../core/apiClient";
import { ApiResponse, Language } from "../core/types";

const BASE_URL = "/cohort-analytics";

// Analytics data types
export interface CohortMetric {
  label: string;
  value: number;
  total: number;
  change: number;
}

export interface CohortAnalyticsData {
  assessments: CohortMetric[];
  modifications: CohortMetric[];
  satisfaction: CohortMetric[];
  timeline?: {
    dates: string[];
    assessments: number[];
    modifications: number[];
  };
}

export interface CohortAnalyticsParams {
  cohortId: string;
  startDate?: string;
  endDate?: string;
  timeframe?: string;
  includeTimeline?: boolean;
  detailLevel?: "summary" | "detailed";
  activeTab?: string;
}

// Cohort Analytics API
export const cohortAnalyticsApi = {
  // Get analytics data for a cohort
  async getCohortAnalytics(
    params: CohortAnalyticsParams,
  ): Promise<ApiResponse<CohortAnalyticsData>> {
    try {
      const response = await apiClient.get<CohortAnalyticsData>(
        `${BASE_URL}/${params.cohortId}`,
        {
          startDate: params.startDate,
          endDate: params.endDate,
          timeframe: params.timeframe,
          includeTimeline: params.includeTimeline,
          detailLevel: params.detailLevel,
        },
      );
      return response;
    } catch (error) {
      console.error("Error fetching cohort analytics:", error);
      return { success: false, error: "Failed to fetch cohort analytics" };
    }
  },

  // Export analytics data as PDF
  async exportAnalyticsAsPdf(
    params: CohortAnalyticsParams,
  ): Promise<ApiResponse<Blob>> {
    try {
      const queryParams = {
        startDate: params.startDate || "",
        endDate: params.endDate || "",
        timeframe: params.timeframe || "month",
        detailLevel: params.detailLevel || "summary",
        activeTab: params.activeTab || "assessments",
      };

      return await apiClient.download(
        `${BASE_URL}/${params.cohortId}/export/pdf`,
        queryParams,
      );
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  },

  // Export analytics data as Excel
  async exportAnalyticsAsExcel(
    params: CohortAnalyticsParams,
  ): Promise<ApiResponse<Blob>> {
    try {
      const queryParams = {
        startDate: params.startDate || "",
        endDate: params.endDate || "",
        timeframe: params.timeframe || "month",
        detailLevel: params.detailLevel || "summary",
        activeTab: params.activeTab || "assessments",
      };

      return await apiClient.download(
        `${BASE_URL}/${params.cohortId}/export/excel`,
        queryParams,
      );
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  },

  // Export analytics data as CSV
  async exportAnalyticsAsCsv(
    params: CohortAnalyticsParams,
  ): Promise<ApiResponse<Blob>> {
    try {
      const queryParams = {
        startDate: params.startDate || "",
        endDate: params.endDate || "",
        timeframe: params.timeframe || "month",
        detailLevel: params.detailLevel || "summary",
        activeTab: params.activeTab || "assessments",
      };

      return await apiClient.download(
        `${BASE_URL}/${params.cohortId}/export/csv`,
        queryParams,
      );
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  },

  // Get timeline data for a specific metric
  async getMetricTimeline(
    cohortId: string,
    metric: "assessments" | "modifications" | "satisfaction",
    startDate?: string,
    endDate?: string,
    timeframe: string = "month",
  ): Promise<
    ApiResponse<{
      dates: string[];
      values: number[];
    }>
  > {
    try {
      const response = await apiClient.get<{
        dates: string[];
        values: number[];
      }>(`${BASE_URL}/${cohortId}/timeline/${metric}`, {
        startDate,
        endDate,
        timeframe,
      });
      return response;
    } catch (error) {
      console.error("Error fetching metric timeline:", error);
      return { success: false, error: "Failed to fetch metric timeline" };
    }
  },

  // Compare cohorts
  async compareCohorts(
    cohortIds: string[],
    metric: "assessments" | "modifications" | "satisfaction",
    timeframe: string = "month",
  ): Promise<ApiResponse<Record<string, CohortMetric[]>>> {
    try {
      const response = await apiClient.get<Record<string, CohortMetric[]>>(
        `${BASE_URL}/compare`,
        {
          cohortIds: cohortIds.join(","),
          metric,
          timeframe,
        },
      );
      return response;
    } catch (error) {
      console.error("Error comparing cohorts:", error);
      return { success: false, error: "Failed to compare cohorts" };
    }
  },
};
