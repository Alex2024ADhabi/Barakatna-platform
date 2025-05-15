/**
 * Budget Management API Types
 * Defines types for the budget management API
 */

// Core budget types
export interface Budget {
  id: string;
  name: string;
  description?: string;
  clientId: string;
  projectId?: string;
  departmentId?: string;
  fiscalYear: number;
  startDate: string;
  endDate: string;
  totalAmount: number;
  currency: string;
  status: "draft" | "active" | "closed" | "archived";
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  approvedBy?: string;
  approvedAt?: string;
  notes?: string;
  // Relationships
  client?: { id: string; name: string };
  project?: { id: string; name: string };
  department?: { id: string; name: string };
  categories?: BudgetCategory[];
  allocations?: BudgetAllocation[];
  expenses?: BudgetExpense[];
  utilization?: number; // Percentage of budget used
}

export interface BudgetCategory {
  id: string;
  budgetId: string;
  name: string;
  description?: string;
  plannedAmount: number;
  actualAmount: number;
  parentCategoryId?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
  // Relationships
  items?: BudgetItem[];
  utilization?: number; // Percentage of category used
}

export interface BudgetItem {
  id: string;
  budgetId: string;
  categoryId: string;
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  plannedAmount: number;
  actualAmount: number;
  unit?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
  notes?: string;
  // Relationships
  category?: BudgetCategory;
  utilization?: number; // Percentage of item used
}

export interface BudgetAllocation {
  id: string;
  budgetId: string;
  departmentId?: string;
  projectId?: string;
  amount: number;
  startDate: string;
  endDate: string;
  status: "pending" | "approved" | "rejected" | "released";
  createdAt: string;
  updatedAt: string;
  approvedBy?: string;
  approvedAt?: string;
  notes?: string;
  // Relationships
  department?: { id: string; name: string };
  project?: { id: string; name: string };
}

export interface BudgetRevision {
  id: string;
  budgetId: string;
  revisionNumber: number;
  previousAmount: number;
  newAmount: number;
  reason: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  approvedBy?: string;
  approvedAt?: string;
  notes?: string;
  // Relationships
  budget?: Budget;
}

export interface BudgetExpense {
  id: string;
  budgetId: string;
  categoryId: string;
  itemId?: string;
  description: string;
  amount: number;
  date: string;
  receiptUrl?: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  approvedBy?: string;
  approvedAt?: string;
  notes?: string;
  // Relationships
  category?: BudgetCategory;
  item?: BudgetItem;
}

// Summary and reporting types
export interface BudgetSummary {
  id: string;
  name: string;
  totalPlanned: number;
  totalActual: number;
  utilization: number; // Percentage
  status: "draft" | "active" | "closed" | "archived";
  startDate: string;
  endDate: string;
  currency: string;
  client?: { id: string; name: string };
  project?: { id: string; name: string };
}

export interface BudgetPerformance {
  budgetId: string;
  period: string; // e.g., "2023-Q1", "2023-01"
  plannedAmount: number;
  actualAmount: number;
  variance: number;
  variancePercentage: number;
}

export interface BudgetForecast {
  id: string;
  budgetId: string;
  period: string;
  forecastAmount: number;
  actualAmount: number;
  variance: number;
  variancePercentage: number;
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

// Filter and query types
export interface BudgetFilter {
  clientId?: string;
  projectId?: string;
  departmentId?: string;
  fiscalYear?: number;
  status?: "draft" | "active" | "closed" | "archived";
  startDateFrom?: string;
  startDateTo?: string;
  endDateFrom?: string;
  endDateTo?: string;
  minAmount?: number;
  maxAmount?: number;
  createdBy?: string;
  approvedBy?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface BudgetReport {
  id: string;
  budgetId: string;
  name: string;
  description?: string;
  reportType: "monthly" | "quarterly" | "annual" | "custom";
  startDate: string;
  endDate: string;
  generatedAt: string;
  generatedBy: string;
  status: "draft" | "final";
  fileUrl?: string;
  notes?: string;
  // Report data
  summary?: {
    plannedTotal: number;
    actualTotal: number;
    variance: number;
    variancePercentage: number;
  };
  categoryBreakdown?: Array<{
    categoryId: string;
    categoryName: string;
    plannedAmount: number;
    actualAmount: number;
    variance: number;
    variancePercentage: number;
  }>;
  monthlyTrend?: Array<{
    month: string;
    plannedAmount: number;
    actualAmount: number;
  }>;
}

export interface BudgetApprovalRequest {
  id: string;
  budgetId: string;
  requestType: "creation" | "revision" | "expense";
  requestedBy: string;
  requestedAt: string;
  status: "pending" | "approved" | "rejected";
  approvedBy?: string;
  approvedAt?: string;
  notes?: string;
  // Related entity
  budget?: Budget;
  revision?: BudgetRevision;
  expense?: BudgetExpense;
}

export interface BudgetComparison {
  budgetIds: string[];
  budgets: Array<{
    id: string;
    name: string;
    totalPlanned: number;
    totalActual: number;
    utilization: number;
  }>;
  categories: Array<{
    name: string;
    values: Array<{
      budgetId: string;
      plannedAmount: number;
      actualAmount: number;
      utilization: number;
    }>;
  }>;
}
