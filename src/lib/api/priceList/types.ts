// Price List API Types

import {
  ApiResponse,
  Language,
  PaginationParams,
  FilterParams,
} from "../core/types";

// Price list item interface
export interface PriceItem {
  id: string;
  category: string;
  name: string;
  description: string;
  unit: string;
  price: number;
  currency: string;
  clientTypeId?: number;
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
  version?: number;
  isActive?: boolean;
}

// Price list version history entry
export interface PriceItemVersion {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  createdBy: string;
  isActive: boolean;
  itemCount: number;
}

// Filter parameters for price list items
export interface PriceListFilterParams extends FilterParams {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  currency?: string;
  clientTypeId?: number;
  versionId?: string;
  searchTerm?: string;
  diffThreshold?: number;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
  isMarketStandard?: boolean;
}

// Request body for creating a price item
export interface CreatePriceItemRequest {
  category: string;
  name: string;
  description: string;
  unit: string;
  price: number;
  currency: string;
  clientTypeId?: number;
}

// Request body for updating a price item
export interface UpdatePriceItemRequest {
  category?: string;
  name?: string;
  description?: string;
  unit?: string;
  price?: number;
  currency?: string;
  clientTypeId?: number;
  changeReason?: string;
}

// Response for bulk import operation
export interface BulkImportResponse {
  totalProcessed: number;
  successCount: number;
  failedCount: number;
  errors?: Array<{
    rowIndex: number;
    message: string;
  }>;
}

// Request for bulk export operation
export interface ExportPriceListRequest {
  format: "csv" | "excel" | "pdf";
  includeVersionHistory?: boolean;
  filters?: PriceListFilterParams;
  clientTypeId?: number;
  clientId?: string;
  versionId?: string;
  comparisonType?: "version" | "client" | "market";
  sourceAId?: string;
  sourceBId?: string;
}
