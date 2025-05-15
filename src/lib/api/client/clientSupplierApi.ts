// Client-Supplier API for Barakatna Platform

import { apiClient } from "../core/apiClient";
import { ApiResponse, PaginatedResponse, QueryParams } from "../core/types";
import {
  ClientSupplierAssociation,
  ClientSupplierServiceAgreement,
} from "./types";

const BASE_URL = "/clients";
const SUPPLIER_URL = "/suppliers";
const SERVICE_AGREEMENT_URL = "/service-agreements";

// Client-Supplier API
export const clientSupplierApi = {
  /**
   * Get suppliers associated with a client
   */
  getClientSuppliers: async (
    clientId: string | number,
    params?: QueryParams,
    language?: string,
  ): Promise<ApiResponse<PaginatedResponse<ClientSupplierAssociation>>> => {
    return apiClient.get<PaginatedResponse<ClientSupplierAssociation>>(
      `${BASE_URL}/${clientId}${SUPPLIER_URL}`,
      params || {},
      language as any,
    );
  },

  /**
   * Get preferred suppliers for a client
   */
  getClientPreferredSuppliers: async (
    clientId: string | number,
    params?: QueryParams,
    language?: string,
  ): Promise<ApiResponse<PaginatedResponse<ClientSupplierAssociation>>> => {
    return apiClient.get<PaginatedResponse<ClientSupplierAssociation>>(
      `${BASE_URL}/${clientId}${SUPPLIER_URL}/preferred`,
      params || {},
      language as any,
    );
  },

  /**
   * Get blacklisted suppliers for a client
   */
  getClientBlacklistedSuppliers: async (
    clientId: string | number,
    params?: QueryParams,
    language?: string,
  ): Promise<ApiResponse<PaginatedResponse<ClientSupplierAssociation>>> => {
    return apiClient.get<PaginatedResponse<ClientSupplierAssociation>>(
      `${BASE_URL}/${clientId}${SUPPLIER_URL}/blacklisted`,
      params || {},
      language as any,
    );
  },

  /**
   * Associate a supplier with a client
   */
  associateSupplier: async (
    clientId: string | number,
    supplierId: string | number,
    data: {
      status?: "active" | "inactive" | "pending" | "blacklisted";
      isPreferred?: boolean;
      startDate?: string;
      endDate?: string;
      contractUrl?: string;
      paymentTerms?: string;
      discountPercentage?: number;
      notes?: string;
    },
    language?: string,
  ): Promise<ApiResponse<ClientSupplierAssociation>> => {
    return apiClient.post<ClientSupplierAssociation>(
      `${BASE_URL}/${clientId}${SUPPLIER_URL}`,
      { supplierId, ...data },
      language as any,
    );
  },

  /**
   * Update client-supplier association
   */
  updateSupplierAssociation: async (
    clientId: string | number,
    supplierId: string | number,
    data: {
      status?: "active" | "inactive" | "pending" | "blacklisted";
      isPreferred?: boolean;
      startDate?: string;
      endDate?: string;
      contractUrl?: string;
      paymentTerms?: string;
      discountPercentage?: number;
      notes?: string;
    },
    language?: string,
  ): Promise<ApiResponse<ClientSupplierAssociation>> => {
    return apiClient.put<ClientSupplierAssociation>(
      `${BASE_URL}/${clientId}${SUPPLIER_URL}/${supplierId}`,
      data,
      language as any,
    );
  },

  /**
   * Remove supplier association from a client
   */
  disassociateSupplier: async (
    clientId: string | number,
    supplierId: string | number,
    language?: string,
  ): Promise<ApiResponse<void>> => {
    return apiClient.delete<void>(
      `${BASE_URL}/${clientId}${SUPPLIER_URL}/${supplierId}`,
      language as any,
    );
  },

  /**
   * Get service agreements for a client-supplier association
   */
  getClientSupplierServiceAgreements: async (
    clientId: string | number,
    supplierId: string | number,
    params?: QueryParams,
    language?: string,
  ): Promise<
    ApiResponse<PaginatedResponse<ClientSupplierServiceAgreement>>
  > => {
    return apiClient.get<PaginatedResponse<ClientSupplierServiceAgreement>>(
      `${BASE_URL}/${clientId}${SUPPLIER_URL}/${supplierId}${SERVICE_AGREEMENT_URL}`,
      params || {},
      language as any,
    );
  },

  /**
   * Create a service agreement for a client-supplier association
   */
  createServiceAgreement: async (
    clientId: string | number,
    supplierId: string | number,
    data: {
      agreementCode: string;
      title: string;
      description?: string;
      startDate: string;
      endDate?: string;
      renewalDate?: string;
      autoRenewal?: boolean;
      documentUrl?: string;
      termsAndConditions?: string;
      paymentTerms?: string;
      discountPercentage?: number;
      statusId: number;
      items?: Array<{
        serviceId?: number;
        productId?: number;
        description: string;
        quantity?: number;
        unitPrice?: number;
        discountPercentage?: number;
        taxPercentage?: number;
        totalPrice?: number;
        notes?: string;
      }>;
    },
    language?: string,
  ): Promise<ApiResponse<ClientSupplierServiceAgreement>> => {
    return apiClient.post<ClientSupplierServiceAgreement>(
      `${BASE_URL}/${clientId}${SUPPLIER_URL}/${supplierId}${SERVICE_AGREEMENT_URL}`,
      data,
      language as any,
    );
  },

  /**
   * Get a specific service agreement
   */
  getServiceAgreement: async (
    agreementId: string | number,
    language?: string,
  ): Promise<ApiResponse<ClientSupplierServiceAgreement>> => {
    return apiClient.get<ClientSupplierServiceAgreement>(
      `${BASE_URL}${SERVICE_AGREEMENT_URL}/${agreementId}`,
      {},
      language as any,
    );
  },

  /**
   * Update a service agreement
   */
  updateServiceAgreement: async (
    agreementId: string | number,
    data: {
      title?: string;
      description?: string;
      startDate?: string;
      endDate?: string;
      renewalDate?: string;
      autoRenewal?: boolean;
      documentUrl?: string;
      termsAndConditions?: string;
      paymentTerms?: string;
      discountPercentage?: number;
      statusId?: number;
    },
    language?: string,
  ): Promise<ApiResponse<ClientSupplierServiceAgreement>> => {
    return apiClient.put<ClientSupplierServiceAgreement>(
      `${BASE_URL}${SERVICE_AGREEMENT_URL}/${agreementId}`,
      data,
      language as any,
    );
  },

  /**
   * Delete a service agreement
   */
  deleteServiceAgreement: async (
    agreementId: string | number,
    language?: string,
  ): Promise<ApiResponse<void>> => {
    return apiClient.delete<void>(
      `${BASE_URL}${SERVICE_AGREEMENT_URL}/${agreementId}`,
      language as any,
    );
  },

  /**
   * Get client supplier evaluations
   */
  getClientSupplierEvaluations: async (
    clientId: string | number,
    supplierId: string | number,
    params?: QueryParams,
    language?: string,
  ): Promise<ApiResponse<any>> => {
    return apiClient.get<any>(
      `${BASE_URL}/${clientId}${SUPPLIER_URL}/${supplierId}/evaluations`,
      params || {},
      language as any,
    );
  },

  /**
   * Create a supplier evaluation
   */
  createSupplierEvaluation: async (
    clientId: string | number,
    supplierId: string | number,
    data: {
      evaluationDate: string;
      evaluationPeriodStart?: string;
      evaluationPeriodEnd?: string;
      overallRating: number;
      qualityRating?: number;
      deliveryRating?: number;
      costRating?: number;
      serviceRating?: number;
      communicationRating?: number;
      strengths?: string;
      weaknesses?: string;
      recommendations?: string;
      notes?: string;
    },
    language?: string,
  ): Promise<ApiResponse<any>> => {
    return apiClient.post<any>(
      `${BASE_URL}/${clientId}${SUPPLIER_URL}/${supplierId}/evaluations`,
      data,
      language as any,
    );
  },

  /**
   * Update a supplier evaluation
   */
  updateSupplierEvaluation: async (
    evaluationId: string | number,
    data: {
      evaluationDate?: string;
      evaluationPeriodStart?: string;
      evaluationPeriodEnd?: string;
      overallRating?: number;
      qualityRating?: number;
      deliveryRating?: number;
      costRating?: number;
      serviceRating?: number;
      communicationRating?: number;
      strengths?: string;
      weaknesses?: string;
      recommendations?: string;
      notes?: string;
    },
    language?: string,
  ): Promise<ApiResponse<any>> => {
    return apiClient.put<any>(
      `${BASE_URL}${SUPPLIER_URL}/evaluations/${evaluationId}`,
      data,
      language as any,
    );
  },

  /**
   * Delete a supplier evaluation
   */
  deleteSupplierEvaluation: async (
    evaluationId: string | number,
    language?: string,
  ): Promise<ApiResponse<void>> => {
    return apiClient.delete<void>(
      `${BASE_URL}${SUPPLIER_URL}/evaluations/${evaluationId}`,
      language as any,
    );
  },

  /**
   * Get suppliers that match client criteria
   */
  getMatchingSuppliers: async (
    clientId: string | number,
    criteria: {
      specialties?: string[];
      minRating?: number;
      location?: string;
      services?: string[];
      products?: string[];
    },
    params?: QueryParams,
    language?: string,
  ): Promise<ApiResponse<any>> => {
    return apiClient.post<any>(
      `${BASE_URL}/${clientId}${SUPPLIER_URL}/match`,
      criteria,
      language as any,
    );
  },
};
