/**
 * Budget Management API
 * Provides functions for managing budgets, categories, items, allocations, expenses, and reports
 */

import { v4 as uuidv4 } from "uuid";
import {
  Budget,
  BudgetCategory,
  BudgetItem,
  BudgetAllocation,
  BudgetRevision,
  BudgetExpense,
  BudgetSummary,
  BudgetPerformance,
  BudgetForecast,
  BudgetFilter,
  BudgetReport,
  BudgetApprovalRequest,
  BudgetComparison,
} from "./types";
import eventBus, { EventType } from "@/services/eventBus";

// Mock data for development
let budgets: Budget[] = [
  {
    id: "1",
    name: "Annual Operations Budget",
    description: "Budget for annual operations and maintenance",
    clientId: "client1",
    fiscalYear: 2023,
    startDate: "2023-01-01",
    endDate: "2023-12-31",
    totalAmount: 500000,
    currency: "USD",
    status: "active",
    createdAt: "2022-11-15T10:30:00Z",
    updatedAt: "2022-11-15T10:30:00Z",
    createdBy: "user1",
    approvedBy: "user2",
    approvedAt: "2022-11-20T14:45:00Z",
    notes: "Approved with standard allocations",
    client: { id: "client1", name: "ADHA" },
    utilization: 42,
  },
  {
    id: "2",
    name: "Home Modification Project Budget",
    description: "Budget for senior home modifications in eastern region",
    clientId: "client2",
    projectId: "project1",
    fiscalYear: 2023,
    startDate: "2023-02-01",
    endDate: "2023-08-31",
    totalAmount: 250000,
    currency: "USD",
    status: "active",
    createdAt: "2023-01-10T09:15:00Z",
    updatedAt: "2023-01-15T11:20:00Z",
    createdBy: "user1",
    approvedBy: "user3",
    approvedAt: "2023-01-15T11:20:00Z",
    client: { id: "client2", name: "FDF" },
    project: { id: "project1", name: "Eastern Region Modifications" },
    utilization: 68,
  },
  {
    id: "3",
    name: "Department Operational Budget",
    description: "Annual budget for assessment department operations",
    clientId: "client1",
    departmentId: "dept1",
    fiscalYear: 2023,
    startDate: "2023-01-01",
    endDate: "2023-12-31",
    totalAmount: 120000,
    currency: "USD",
    status: "active",
    createdAt: "2022-12-05T13:45:00Z",
    updatedAt: "2022-12-10T09:30:00Z",
    createdBy: "user2",
    approvedBy: "user3",
    approvedAt: "2022-12-10T09:30:00Z",
    client: { id: "client1", name: "ADHA" },
    department: { id: "dept1", name: "Assessment Department" },
    utilization: 35,
  },
  {
    id: "4",
    name: "Special Projects Fund",
    description: "Budget allocation for special projects and initiatives",
    clientId: "client3",
    fiscalYear: 2023,
    startDate: "2023-01-01",
    endDate: "2023-12-31",
    totalAmount: 300000,
    currency: "USD",
    status: "draft",
    createdAt: "2023-01-20T15:30:00Z",
    updatedAt: "2023-01-20T15:30:00Z",
    createdBy: "user1",
    client: { id: "client3", name: "Cash Client" },
    utilization: 0,
  },
];

let categories: BudgetCategory[] = [
  {
    id: "1",
    budgetId: "1",
    name: "Materials",
    description: "Construction and renovation materials",
    plannedAmount: 200000,
    actualAmount: 85000,
    order: 1,
    createdAt: "2022-11-15T10:35:00Z",
    updatedAt: "2023-03-10T14:20:00Z",
    utilization: 42.5,
  },
  {
    id: "2",
    budgetId: "1",
    name: "Labor",
    description: "Contractor and labor costs",
    plannedAmount: 150000,
    actualAmount: 62000,
    order: 2,
    createdAt: "2022-11-15T10:40:00Z",
    updatedAt: "2023-03-10T14:25:00Z",
    utilization: 41.3,
  },
  {
    id: "3",
    budgetId: "1",
    name: "Equipment",
    description: "Equipment rental and purchases",
    plannedAmount: 100000,
    actualAmount: 43000,
    order: 3,
    createdAt: "2022-11-15T10:45:00Z",
    updatedAt: "2023-03-10T14:30:00Z",
    utilization: 43,
  },
  {
    id: "4",
    budgetId: "1",
    name: "Administrative",
    description: "Administrative and overhead costs",
    plannedAmount: 50000,
    actualAmount: 20000,
    order: 4,
    createdAt: "2022-11-15T10:50:00Z",
    updatedAt: "2023-03-10T14:35:00Z",
    utilization: 40,
  },
  {
    id: "5",
    budgetId: "2",
    name: "Materials",
    description: "Construction and renovation materials",
    plannedAmount: 100000,
    actualAmount: 72000,
    order: 1,
    createdAt: "2023-01-10T09:20:00Z",
    updatedAt: "2023-05-15T11:30:00Z",
    utilization: 72,
  },
  {
    id: "6",
    budgetId: "2",
    name: "Labor",
    description: "Contractor and labor costs",
    plannedAmount: 80000,
    actualAmount: 52000,
    order: 2,
    createdAt: "2023-01-10T09:25:00Z",
    updatedAt: "2023-05-15T11:35:00Z",
    utilization: 65,
  },
  {
    id: "7",
    budgetId: "2",
    name: "Equipment",
    description: "Equipment rental and purchases",
    plannedAmount: 50000,
    actualAmount: 32000,
    order: 3,
    createdAt: "2023-01-10T09:30:00Z",
    updatedAt: "2023-05-15T11:40:00Z",
    utilization: 64,
  },
  {
    id: "8",
    budgetId: "2",
    name: "Administrative",
    description: "Administrative and overhead costs",
    plannedAmount: 20000,
    actualAmount: 14000,
    order: 4,
    createdAt: "2023-01-10T09:35:00Z",
    updatedAt: "2023-05-15T11:45:00Z",
    utilization: 70,
  },
];

let items: BudgetItem[] = [
  {
    id: "1",
    budgetId: "1",
    categoryId: "1",
    name: "Lumber",
    description: "Various lumber for framing and construction",
    quantity: 5000,
    unitPrice: 10,
    plannedAmount: 50000,
    actualAmount: 22000,
    unit: "board feet",
    order: 1,
    createdAt: "2022-11-16T09:00:00Z",
    updatedAt: "2023-03-12T10:15:00Z",
    utilization: 44,
  },
  {
    id: "2",
    budgetId: "1",
    categoryId: "1",
    name: "Drywall",
    description: "Drywall sheets for interior walls",
    quantity: 1000,
    unitPrice: 15,
    plannedAmount: 15000,
    actualAmount: 6500,
    unit: "sheets",
    order: 2,
    createdAt: "2022-11-16T09:10:00Z",
    updatedAt: "2023-03-12T10:20:00Z",
    utilization: 43.3,
  },
];

let allocations: BudgetAllocation[] = [
  {
    id: "1",
    budgetId: "1",
    departmentId: "dept1",
    amount: 200000,
    startDate: "2023-01-01",
    endDate: "2023-06-30",
    status: "approved",
    createdAt: "2022-11-20T11:00:00Z",
    updatedAt: "2022-11-25T14:30:00Z",
    approvedBy: "user3",
    approvedAt: "2022-11-25T14:30:00Z",
    department: { id: "dept1", name: "Assessment Department" },
  },
  {
    id: "2",
    budgetId: "1",
    departmentId: "dept2",
    amount: 150000,
    startDate: "2023-01-01",
    endDate: "2023-06-30",
    status: "approved",
    createdAt: "2022-11-20T11:15:00Z",
    updatedAt: "2022-11-25T14:35:00Z",
    approvedBy: "user3",
    approvedAt: "2022-11-25T14:35:00Z",
    department: { id: "dept2", name: "Implementation Department" },
  },
];

let expenses: BudgetExpense[] = [
  {
    id: "1",
    budgetId: "1",
    categoryId: "1",
    itemId: "1",
    description: "Lumber purchase from Supplier A",
    amount: 22000,
    date: "2023-02-15",
    receiptUrl: "https://example.com/receipts/lumber-purchase.pdf",
    status: "approved",
    createdAt: "2023-02-15T13:45:00Z",
    updatedAt: "2023-02-18T10:30:00Z",
    createdBy: "user4",
    approvedBy: "user3",
    approvedAt: "2023-02-18T10:30:00Z",
  },
  {
    id: "2",
    budgetId: "1",
    categoryId: "1",
    itemId: "2",
    description: "Drywall purchase from Supplier B",
    amount: 6500,
    date: "2023-02-20",
    receiptUrl: "https://example.com/receipts/drywall-purchase.pdf",
    status: "approved",
    createdAt: "2023-02-20T14:20:00Z",
    updatedAt: "2023-02-22T11:15:00Z",
    createdBy: "user4",
    approvedBy: "user3",
    approvedAt: "2023-02-22T11:15:00Z",
  },
];

let forecasts: BudgetForecast[] = [
  {
    id: "1",
    budgetId: "1",
    period: "2023-Q1",
    forecastAmount: 125000,
    actualAmount: 110000,
    variance: -15000,
    variancePercentage: -12,
    createdAt: "2023-01-05T10:00:00Z",
    updatedAt: "2023-04-05T11:30:00Z",
  },
  {
    id: "2",
    budgetId: "1",
    period: "2023-Q2",
    forecastAmount: 125000,
    actualAmount: 100000,
    variance: -25000,
    variancePercentage: -20,
    createdAt: "2023-01-05T10:15:00Z",
    updatedAt: "2023-07-05T11:45:00Z",
  },
];

// Budget API functions
export const budgetApi = {
  // Budget CRUD operations
  getBudgets: async (filter?: BudgetFilter): Promise<Budget[]> => {
    // In a real implementation, this would filter based on the provided criteria
    return Promise.resolve(budgets);
  },

  getBudgetById: async (id: string): Promise<Budget | null> => {
    const budget = budgets.find((b) => b.id === id);
    if (!budget) return Promise.resolve(null);

    // Attach related data
    const budgetWithRelations = {
      ...budget,
      categories: categories.filter((c) => c.budgetId === id),
      allocations: allocations.filter((a) => a.budgetId === id),
      expenses: expenses.filter((e) => e.budgetId === id),
    };

    return Promise.resolve(budgetWithRelations);
  },

  createBudget: async (
    budget: Omit<Budget, "id" | "createdAt" | "updatedAt">,
  ): Promise<Budget> => {
    const now = new Date().toISOString();
    const newBudget: Budget = {
      ...budget,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
      utilization: 0,
    };

    budgets.push(newBudget);
    return Promise.resolve(newBudget);
  },

  updateBudget: async (
    id: string,
    budget: Partial<Budget>,
  ): Promise<Budget | null> => {
    const index = budgets.findIndex((b) => b.id === id);
    if (index === -1) return Promise.resolve(null);

    const originalBudget = { ...budgets[index] };
    const updatedBudget = {
      ...originalBudget,
      ...budget,
      updatedAt: new Date().toISOString(),
    };

    budgets[index] = updatedBudget;

    // If total amount changed, publish budget changed event
    if (originalBudget.totalAmount !== updatedBudget.totalAmount) {
      eventBus.publishBudgetChanged(
        "budgetApi",
        id,
        originalBudget.totalAmount,
        updatedBudget.totalAmount,
        "Budget amount updated",
        [], // No specific projects affected
        [], // No specific programs affected
      );
    }

    return Promise.resolve(updatedBudget);
  },

  deleteBudget: async (id: string): Promise<boolean> => {
    const initialLength = budgets.length;
    budgets = budgets.filter((b) => b.id !== id);
    return Promise.resolve(budgets.length < initialLength);
  },

  // Budget category operations
  getBudgetCategories: async (budgetId: string): Promise<BudgetCategory[]> => {
    const budgetCategories = categories.filter((c) => c.budgetId === budgetId);

    // Attach items to each category
    const categoriesWithItems = budgetCategories.map((category) => ({
      ...category,
      items: items.filter((item) => item.categoryId === category.id),
    }));

    return Promise.resolve(categoriesWithItems);
  },

  createBudgetCategory: async (
    category: Omit<BudgetCategory, "id" | "createdAt" | "updatedAt">,
  ): Promise<BudgetCategory> => {
    const now = new Date().toISOString();
    const newCategory: BudgetCategory = {
      ...category,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
      utilization: 0,
    };

    categories.push(newCategory);
    return Promise.resolve(newCategory);
  },

  // Budget item operations
  getBudgetItems: async (
    budgetId: string,
    categoryId?: string,
  ): Promise<BudgetItem[]> => {
    let filteredItems = items.filter((i) => i.budgetId === budgetId);
    if (categoryId) {
      filteredItems = filteredItems.filter((i) => i.categoryId === categoryId);
    }
    return Promise.resolve(filteredItems);
  },

  createBudgetItem: async (
    item: Omit<BudgetItem, "id" | "createdAt" | "updatedAt">,
  ): Promise<BudgetItem> => {
    const now = new Date().toISOString();
    const newItem: BudgetItem = {
      ...item,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
      utilization: 0,
    };

    items.push(newItem);
    return Promise.resolve(newItem);
  },

  // Budget allocation operations
  getBudgetAllocations: async (
    budgetId: string,
  ): Promise<BudgetAllocation[]> => {
    return Promise.resolve(allocations.filter((a) => a.budgetId === budgetId));
  },

  createBudgetAllocation: async (
    allocation: Omit<BudgetAllocation, "id" | "createdAt" | "updatedAt">,
  ): Promise<BudgetAllocation> => {
    const now = new Date().toISOString();
    const newAllocation: BudgetAllocation = {
      ...allocation,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
    };

    allocations.push(newAllocation);
    return Promise.resolve(newAllocation);
  },

  // Budget expense operations
  getBudgetExpenses: async (
    budgetId: string,
    categoryId?: string,
  ): Promise<BudgetExpense[]> => {
    let filteredExpenses = expenses.filter((e) => e.budgetId === budgetId);
    if (categoryId) {
      filteredExpenses = filteredExpenses.filter(
        (e) => e.categoryId === categoryId,
      );
    }
    return Promise.resolve(filteredExpenses);
  },

  createBudgetExpense: async (
    expense: Omit<BudgetExpense, "id" | "createdAt" | "updatedAt">,
  ): Promise<BudgetExpense> => {
    const now = new Date().toISOString();
    const newExpense: BudgetExpense = {
      ...expense,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
    };

    expenses.push(newExpense);
    return Promise.resolve(newExpense);
  },

  // Budget summary and reporting
  getBudgetSummaries: async (
    filter?: BudgetFilter,
  ): Promise<BudgetSummary[]> => {
    // In a real implementation, this would filter based on the provided criteria
    const summaries: BudgetSummary[] = budgets.map((budget) => {
      const budgetCategories = categories.filter(
        (c) => c.budgetId === budget.id,
      );
      const totalPlanned = budgetCategories.reduce(
        (sum, category) => sum + category.plannedAmount,
        0,
      );
      const totalActual = budgetCategories.reduce(
        (sum, category) => sum + category.actualAmount,
        0,
      );
      const utilization =
        totalPlanned > 0 ? (totalActual / totalPlanned) * 100 : 0;

      return {
        id: budget.id,
        name: budget.name,
        totalPlanned,
        totalActual,
        utilization,
        status: budget.status,
        startDate: budget.startDate,
        endDate: budget.endDate,
        currency: budget.currency,
        client: budget.client,
        project: budget.project,
      };
    });

    return Promise.resolve(summaries);
  },

  getBudgetPerformance: async (
    budgetId: string,
    period?: string,
  ): Promise<BudgetPerformance[]> => {
    // Mock performance data
    const performance: BudgetPerformance[] = [
      {
        budgetId,
        period: "2023-01",
        plannedAmount: 40000,
        actualAmount: 35000,
        variance: -5000,
        variancePercentage: -12.5,
      },
      {
        budgetId,
        period: "2023-02",
        plannedAmount: 40000,
        actualAmount: 38000,
        variance: -2000,
        variancePercentage: -5,
      },
      {
        budgetId,
        period: "2023-03",
        plannedAmount: 40000,
        actualAmount: 37000,
        variance: -3000,
        variancePercentage: -7.5,
      },
      {
        budgetId,
        period: "2023-04",
        plannedAmount: 40000,
        actualAmount: 42000,
        variance: 2000,
        variancePercentage: 5,
      },
      {
        budgetId,
        period: "2023-05",
        plannedAmount: 40000,
        actualAmount: 43000,
        variance: 3000,
        variancePercentage: 7.5,
      },
      {
        budgetId,
        period: "2023-06",
        plannedAmount: 40000,
        actualAmount: 45000,
        variance: 5000,
        variancePercentage: 12.5,
      },
    ];

    if (period) {
      return Promise.resolve(performance.filter((p) => p.period === period));
    }

    return Promise.resolve(performance);
  },

  getBudgetForecasts: async (budgetId: string): Promise<BudgetForecast[]> => {
    return Promise.resolve(forecasts.filter((f) => f.budgetId === budgetId));
  },

  generateBudgetReport: async (
    budgetId: string,
    reportType: "monthly" | "quarterly" | "annual" | "custom",
    startDate?: string,
    endDate?: string,
  ): Promise<BudgetReport> => {
    // Mock report generation
    const budget = budgets.find((b) => b.id === budgetId);
    if (!budget) throw new Error("Budget not found");

    const now = new Date().toISOString();
    const report: BudgetReport = {
      id: uuidv4(),
      budgetId,
      name: `${budget.name} - ${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report`,
      reportType,
      startDate: startDate || budget.startDate,
      endDate: endDate || budget.endDate,
      generatedAt: now,
      generatedBy: "system",
      status: "draft",
      summary: {
        plannedTotal: 500000,
        actualTotal: 210000,
        variance: -290000,
        variancePercentage: -58,
      },
      categoryBreakdown: categories
        .filter((c) => c.budgetId === budgetId)
        .map((category) => ({
          categoryId: category.id,
          categoryName: category.name,
          plannedAmount: category.plannedAmount,
          actualAmount: category.actualAmount,
          variance: category.actualAmount - category.plannedAmount,
          variancePercentage:
            category.plannedAmount > 0
              ? ((category.actualAmount - category.plannedAmount) /
                  category.plannedAmount) *
                100
              : 0,
        })),
      monthlyTrend: [
        { month: "2023-01", plannedAmount: 40000, actualAmount: 35000 },
        { month: "2023-02", plannedAmount: 40000, actualAmount: 38000 },
        { month: "2023-03", plannedAmount: 40000, actualAmount: 37000 },
        { month: "2023-04", plannedAmount: 40000, actualAmount: 42000 },
        { month: "2023-05", plannedAmount: 40000, actualAmount: 43000 },
        { month: "2023-06", plannedAmount: 40000, actualAmount: 45000 },
      ],
    };

    return Promise.resolve(report);
  },

  compareBudgets: async (budgetIds: string[]): Promise<BudgetComparison> => {
    const selectedBudgets = budgets.filter((b) => budgetIds.includes(b.id));

    // Get all unique category names across the selected budgets
    const allCategories = categories.filter((c) =>
      budgetIds.includes(c.budgetId),
    );
    const uniqueCategoryNames = [...new Set(allCategories.map((c) => c.name))];

    const comparison: BudgetComparison = {
      budgetIds,
      budgets: selectedBudgets.map((budget) => {
        const budgetCategories = categories.filter(
          (c) => c.budgetId === budget.id,
        );
        const totalPlanned = budgetCategories.reduce(
          (sum, category) => sum + category.plannedAmount,
          0,
        );
        const totalActual = budgetCategories.reduce(
          (sum, category) => sum + category.actualAmount,
          0,
        );
        const utilization =
          totalPlanned > 0 ? (totalActual / totalPlanned) * 100 : 0;

        return {
          id: budget.id,
          name: budget.name,
          totalPlanned,
          totalActual,
          utilization,
        };
      }),
      categories: uniqueCategoryNames.map((categoryName) => ({
        name: categoryName,
        values: budgetIds.map((budgetId) => {
          const category = categories.find(
            (c) => c.budgetId === budgetId && c.name === categoryName,
          );

          return {
            budgetId,
            plannedAmount: category ? category.plannedAmount : 0,
            actualAmount: category ? category.actualAmount : 0,
            utilization:
              category && category.plannedAmount > 0
                ? (category.actualAmount / category.plannedAmount) * 100
                : 0,
          };
        }),
      })),
    };

    return Promise.resolve(comparison);
  },
};
