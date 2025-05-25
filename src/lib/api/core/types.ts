// core/types.ts

// Generic API Response
export interface ApiResponse<T> {
  data: T;
  status: number;
}

export enum Status {
  Approved = "approved",
  Pending = "pending",
  Rejected = "rejected",
}
// Generic Pagination Structure
export interface PaginatedResponse<T> {
  items: T[];                // Array of records
  total: number;             // Total number of records
  page: number;              // Current page
  pageSize: number;          // Items per page
  totalPages: number;        // Computed total pages
}

// Query Parameters used for GET requests
export type QueryParams = Record<string, string | number | boolean | undefined>;
