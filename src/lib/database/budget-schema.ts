/**
 * Budget Management Schema
 * Defines the database schema for budget management
 */

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
