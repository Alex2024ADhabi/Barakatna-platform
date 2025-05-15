// Client API for Barakatna Platform

import { apiClient } from "../core/apiClient";
import { ApiResponse, PaginatedResponse, QueryParams } from "../core/types";
import {
  Client,
  ClientType,
  CreateClientRequest,
  CreatePropertyRequest,
  CreateSeniorCitizenRequest,
  OwnershipType,
  Property,
  PropertyFilterParams,
  PropertyType,
  SeniorCitizen,
  SeniorCitizenFilterParams,
  UpdateClientRequest,
  UpdatePropertyRequest,
  UpdateSeniorCitizenRequest,
  ClientConfiguration,
  ClientFilterParams,
  ClientSupplierAssociation,
  ClientSupplierServiceAgreement,
} from "./types";

const BASE_URL = "/clients";
const SENIOR_URL = "/senior-citizens";
const PROPERTY_URL = "/properties";
const CLIENT_TYPE_URL = "/client-types";
const PROPERTY_TYPE_URL = "/property-types";
const OWNERSHIP_TYPE_URL = "/ownership-types";
const CONFIG_URL = "/configurations";
const SUPPLIER_URL = "/suppliers";
const SERVICE_AGREEMENT_URL = "/service-agreements";

// Client API
export const clientApi = {
  // Get all clients with pagination and filtering
  async getClients(
    params?: QueryParams & ClientFilterParams,
  ): Promise<ApiResponse<PaginatedResponse<Client>>> {
    return apiClient.get<PaginatedResponse<Client>>(
      BASE_URL,
      params,
      params?.language,
    );
  },

  // Get client by ID
  async getClientById(
    id: string | number,
    language?: string,
  ): Promise<ApiResponse<Client>> {
    return apiClient.get<Client>(`${BASE_URL}/${id}`, {}, language as any);
  },

  // Create new client
  async createClient(
    client: CreateClientRequest,
    language?: string,
  ): Promise<ApiResponse<Client>> {
    return apiClient.post<Client>(BASE_URL, client, language as any);
  },

  // Update client
  async updateClient(
    id: string | number,
    client: UpdateClientRequest,
    language?: string,
  ): Promise<ApiResponse<Client>> {
    return apiClient.put<Client>(`${BASE_URL}/${id}`, client, language as any);
  },

  // Delete client
  async deleteClient(
    id: string | number,
    language?: string,
  ): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`${BASE_URL}/${id}`, language as any);
  },

  // Get client configuration
  async getClientConfiguration(
    clientId: string | number,
    language?: string,
  ): Promise<ApiResponse<ClientConfiguration>> {
    return apiClient.get<ClientConfiguration>(
      `${BASE_URL}/${clientId}${CONFIG_URL}`,
      {},
      language as any,
    );
  },

  // Update client configuration
  async updateClientConfiguration(
    clientId: string | number,
    configuration: Partial<ClientConfiguration>,
    language?: string,
  ): Promise<ApiResponse<ClientConfiguration>> {
    return apiClient.put<ClientConfiguration>(
      `${BASE_URL}/${clientId}${CONFIG_URL}`,
      configuration,
      language as any,
    );
  },

  // Get client configuration history
  async getClientConfigurationHistory(
    clientId: string | number,
    limit?: number,
    fromDate?: string,
    toDate?: string,
    language?: string,
  ): Promise<ApiResponse<any[]>> {
    return apiClient.get<any[]>(
      `${BASE_URL}/${clientId}${CONFIG_URL}/history`,
      { limit, fromDate, toDate },
      language as any,
    );
  },

  // Restore client configuration from history
  async restoreClientConfiguration(
    clientId: string | number,
    versionId: string,
    language?: string,
  ): Promise<ApiResponse<ClientConfiguration>> {
    return apiClient.post<ClientConfiguration>(
      `${BASE_URL}/${clientId}${CONFIG_URL}/restore`,
      { versionId },
      language as any,
    );
  },

  // Compare client configurations
  async compareClientConfigurations(
    clientId: string | number,
    versionId1: string,
    versionId2: string,
    language?: string,
  ): Promise<ApiResponse<any>> {
    return apiClient.get<any>(
      `${BASE_URL}/${clientId}${CONFIG_URL}/compare`,
      { versionId1, versionId2 },
      language as any,
    );
  },

  // Create a snapshot of client configuration
  async createConfigurationSnapshot(
    clientId: string | number,
    snapshotName: string,
    comment?: string,
    language?: string,
  ): Promise<ApiResponse<any>> {
    return apiClient.post<any>(
      `${BASE_URL}/${clientId}${CONFIG_URL}/snapshot`,
      { snapshotName, comment },
      language as any,
    );
  },

  // Get client configuration snapshots
  async getConfigurationSnapshots(
    clientId: string | number,
    language?: string,
  ): Promise<ApiResponse<any[]>> {
    return apiClient.get<any[]>(
      `${BASE_URL}/${clientId}${CONFIG_URL}/snapshots`,
      {},
      language as any,
    );
  },

  // Get price lists associated with a client
  async getClientPriceLists(
    clientId: string | number,
    params?: QueryParams,
    language?: string,
  ): Promise<ApiResponse<any>> {
    return apiClient.get<any>(
      `${BASE_URL}/${clientId}/price-lists`,
      params || {},
      language as any,
    );
  },

  // Associate a price list with a client
  async associatePriceList(
    clientId: string | number,
    priceListId: string | number,
    isDefault?: boolean,
    effectiveDate?: string,
    expirationDate?: string,
    language?: string,
  ): Promise<ApiResponse<any>> {
    return apiClient.post<any>(
      `${BASE_URL}/${clientId}/price-lists`,
      { priceListId, isDefault, effectiveDate, expirationDate },
      language as any,
    );
  },

  // Disassociate a price list from a client
  async disassociatePriceList(
    clientId: string | number,
    priceListId: string | number,
    language?: string,
  ): Promise<ApiResponse<any>> {
    return apiClient.delete<any>(
      `${BASE_URL}/${clientId}/price-lists/${priceListId}`,
      language as any,
    );
  },

  // Get default price list for a client
  async getClientDefaultPriceList(
    clientId: string | number,
    language?: string,
  ): Promise<ApiResponse<any>> {
    return apiClient.get<any>(
      `${BASE_URL}/${clientId}/price-lists/default`,
      {},
      language as any,
    );
  },

  // Get all client types
  async getClientTypes(
    params?: QueryParams,
  ): Promise<ApiResponse<PaginatedResponse<ClientType>>> {
    return apiClient.get<PaginatedResponse<ClientType>>(
      CLIENT_TYPE_URL,
      params,
      params?.language,
    );
  },

  // Get active client types
  async getActiveClientTypes(
    params?: QueryParams,
  ): Promise<ApiResponse<PaginatedResponse<ClientType>>> {
    return apiClient.get<PaginatedResponse<ClientType>>(
      `${CLIENT_TYPE_URL}/active`,
      params,
      params?.language,
    );
  },

  // Get clients by type
  async getClientsByType(
    clientTypeId: number,
    params?: QueryParams & ClientFilterParams,
  ): Promise<ApiResponse<PaginatedResponse<Client>>> {
    return apiClient.get<PaginatedResponse<Client>>(
      `${CLIENT_TYPE_URL}/${clientTypeId}/clients`,
      params,
      params?.language,
    );
  },

  // Get client type by ID
  async getClientType(
    id: number,
    language?: string,
  ): Promise<ApiResponse<ClientType>> {
    return apiClient.get<ClientType>(
      `${CLIENT_TYPE_URL}/${id}`,
      {},
      language as any,
    );
  },

  // Create a new client type
  async createClientType(
    clientType: Omit<
      ClientType,
      | "clientTypeId"
      | "createdBy"
      | "createdDate"
      | "lastModifiedBy"
      | "lastModifiedDate"
    >,
    language?: string,
  ): Promise<ApiResponse<ClientType>> {
    return apiClient.post<ClientType>(
      CLIENT_TYPE_URL,
      clientType,
      language as any,
    );
  },

  // Update a client type
  async updateClientType(
    id: number,
    clientType: Partial<ClientType>,
    language?: string,
  ): Promise<ApiResponse<ClientType>> {
    return apiClient.put<ClientType>(
      `${CLIENT_TYPE_URL}/${id}`,
      clientType,
      language as any,
    );
  },

  // Delete a client type
  async deleteClientType(
    id: number,
    language?: string,
  ): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`${CLIENT_TYPE_URL}/${id}`, language as any);
  },

  // Get all senior citizens with pagination and filtering
  async getSeniorCitizens(
    params: QueryParams & SeniorCitizenFilterParams,
  ): Promise<ApiResponse<PaginatedResponse<SeniorCitizen>>> {
    return apiClient.get<PaginatedResponse<SeniorCitizen>>(
      SENIOR_URL,
      params,
      params.language,
    );
  },

  // Get senior citizen by ID
  async getSeniorCitizen(
    id: number,
    language?: string,
  ): Promise<ApiResponse<SeniorCitizen>> {
    return apiClient.get<SeniorCitizen>(
      `${SENIOR_URL}/${id}`,
      {},
      language as any,
    );
  },

  // Create new senior citizen
  async createSeniorCitizen(
    seniorCitizen: CreateSeniorCitizenRequest,
    language?: string,
  ): Promise<ApiResponse<SeniorCitizen>> {
    return apiClient.post<SeniorCitizen>(
      SENIOR_URL,
      seniorCitizen,
      language as any,
    );
  },

  // Update senior citizen
  async updateSeniorCitizen(
    id: number,
    seniorCitizen: UpdateSeniorCitizenRequest,
    language?: string,
  ): Promise<ApiResponse<SeniorCitizen>> {
    return apiClient.put<SeniorCitizen>(
      `${SENIOR_URL}/${id}`,
      seniorCitizen,
      language as any,
    );
  },

  // Delete senior citizen
  async deleteSeniorCitizen(
    id: number,
    language?: string,
  ): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`${SENIOR_URL}/${id}`, language as any);
  },

  // Get all properties with pagination and filtering
  async getProperties(
    params: QueryParams & PropertyFilterParams,
  ): Promise<ApiResponse<PaginatedResponse<Property>>> {
    return apiClient.get<PaginatedResponse<Property>>(
      PROPERTY_URL,
      params,
      params.language,
    );
  },

  // Get properties by senior citizen ID
  async getPropertiesBySeniorCitizen(
    seniorCitizenId: number,
    params?: QueryParams & PropertyFilterParams,
  ): Promise<ApiResponse<PaginatedResponse<Property>>> {
    return apiClient.get<PaginatedResponse<Property>>(
      `${SENIOR_URL}/${seniorCitizenId}/properties`,
      params,
      params?.language,
    );
  },

  // Get property by ID
  async getProperty(
    id: number,
    language?: string,
  ): Promise<ApiResponse<Property>> {
    return apiClient.get<Property>(
      `${PROPERTY_URL}/${id}`,
      {},
      language as any,
    );
  },

  // Create new property
  async createProperty(
    property: CreatePropertyRequest,
    language?: string,
  ): Promise<ApiResponse<Property>> {
    return apiClient.post<Property>(PROPERTY_URL, property, language as any);
  },

  // Update property
  async updateProperty(
    id: number,
    property: UpdatePropertyRequest,
    language?: string,
  ): Promise<ApiResponse<Property>> {
    return apiClient.put<Property>(
      `${PROPERTY_URL}/${id}`,
      property,
      language as any,
    );
  },

  // Delete property
  async deleteProperty(
    id: number,
    language?: string,
  ): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`${PROPERTY_URL}/${id}`, language as any);
  },

  // Get all property types
  async getPropertyTypes(
    params?: QueryParams,
  ): Promise<ApiResponse<PaginatedResponse<PropertyType>>> {
    return apiClient.get<PaginatedResponse<PropertyType>>(
      PROPERTY_TYPE_URL,
      params,
      params?.language,
    );
  },

  // Get all ownership types
  async getOwnershipTypes(
    params?: QueryParams,
  ): Promise<ApiResponse<PaginatedResponse<OwnershipType>>> {
    return apiClient.get<PaginatedResponse<OwnershipType>>(
      OWNERSHIP_TYPE_URL,
      params,
      params?.language,
    );
  },

  // Get senior citizen summary
  async getSeniorCitizenSummary(
    id: number,
    language?: string,
  ): Promise<ApiResponse<any>> {
    return apiClient.get<any>(
      `${SENIOR_URL}/${id}/summary`,
      {},
      language as any,
    );
  },

  // Get suppliers associated with a client
  async getClientSuppliers(
    clientId: string | number,
    params?: QueryParams,
    language?: string,
  ): Promise<ApiResponse<PaginatedResponse<ClientSupplierAssociation>>> {
    return apiClient.get<PaginatedResponse<ClientSupplierAssociation>>(
      `${BASE_URL}/${clientId}${SUPPLIER_URL}`,
      params || {},
      language as any,
    );
  },

  // Get preferred suppliers for a client
  async getClientPreferredSuppliers(
    clientId: string | number,
    params?: QueryParams,
    language?: string,
  ): Promise<ApiResponse<PaginatedResponse<ClientSupplierAssociation>>> {
    return apiClient.get<PaginatedResponse<ClientSupplierAssociation>>(
      `${BASE_URL}/${clientId}${SUPPLIER_URL}/preferred`,
      params || {},
      language as any,
    );
  },

  // Associate a supplier with a client
  async associateSupplier(
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
  ): Promise<ApiResponse<ClientSupplierAssociation>> {
    return apiClient.post<ClientSupplierAssociation>(
      `${BASE_URL}/${clientId}${SUPPLIER_URL}`,
      { supplierId, ...data },
      language as any,
    );
  },

  // Update client-supplier association
  async updateSupplierAssociation(
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
  ): Promise<ApiResponse<ClientSupplierAssociation>> {
    return apiClient.put<ClientSupplierAssociation>(
      `${BASE_URL}/${clientId}${SUPPLIER_URL}/${supplierId}`,
      data,
      language as any,
    );
  },

  // Remove supplier association from a client
  async disassociateSupplier(
    clientId: string | number,
    supplierId: string | number,
    language?: string,
  ): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(
      `${BASE_URL}/${clientId}${SUPPLIER_URL}/${supplierId}`,
      language as any,
    );
  },

  // Get service agreements for a client-supplier association
  async getClientSupplierServiceAgreements(
    clientId: string | number,
    supplierId: string | number,
    params?: QueryParams,
    language?: string,
  ): Promise<ApiResponse<PaginatedResponse<ClientSupplierServiceAgreement>>> {
    return apiClient.get<PaginatedResponse<ClientSupplierServiceAgreement>>(
      `${BASE_URL}/${clientId}${SUPPLIER_URL}/${supplierId}${SERVICE_AGREEMENT_URL}`,
      params || {},
      language as any,
    );
  },

  // Create a service agreement for a client-supplier association
  async createServiceAgreement(
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
  ): Promise<ApiResponse<ClientSupplierServiceAgreement>> {
    return apiClient.post<ClientSupplierServiceAgreement>(
      `${BASE_URL}/${clientId}${SUPPLIER_URL}/${supplierId}${SERVICE_AGREEMENT_URL}`,
      data,
      language as any,
    );
  },

  // Get a specific service agreement
  async getServiceAgreement(
    agreementId: string | number,
    language?: string,
  ): Promise<ApiResponse<ClientSupplierServiceAgreement>> {
    return apiClient.get<ClientSupplierServiceAgreement>(
      `${BASE_URL}${SERVICE_AGREEMENT_URL}/${agreementId}`,
      {},
      language as any,
    );
  },

  // Update a service agreement
  async updateServiceAgreement(
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
  ): Promise<ApiResponse<ClientSupplierServiceAgreement>> {
    return apiClient.put<ClientSupplierServiceAgreement>(
      `${BASE_URL}${SERVICE_AGREEMENT_URL}/${agreementId}`,
      data,
      language as any,
    );
  },

  // Delete a service agreement
  async deleteServiceAgreement(
    agreementId: string | number,
    language?: string,
  ): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(
      `${BASE_URL}${SERVICE_AGREEMENT_URL}/${agreementId}`,
      language as any,
    );
  },

  // Get client supplier evaluations
  async getClientSupplierEvaluations(
    clientId: string | number,
    supplierId: string | number,
    params?: QueryParams,
    language?: string,
  ): Promise<ApiResponse<any>> {
    return apiClient.get<any>(
      `${BASE_URL}/${clientId}${SUPPLIER_URL}/${supplierId}/evaluations`,
      params || {},
      language as any,
    );
  },

  // Create a supplier evaluation
  async createSupplierEvaluation(
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
  ): Promise<ApiResponse<any>> {
    return apiClient.post<any>(
      `${BASE_URL}/${clientId}${SUPPLIER_URL}/${supplierId}/evaluations`,
      data,
      language as any,
    );
  },
};
