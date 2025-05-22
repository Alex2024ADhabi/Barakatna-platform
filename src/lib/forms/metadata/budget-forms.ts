import { formRegistry } from "../registry";
import {
  ClientType,
  FieldType,
  FormField,
  FormMetadata,
  FormModule,
  FormPermission,
  FormRegistryEntry,
  FormSection,
  ValidationRuleType,
} from "../types";

// Budget Planning Form
const budgetPlanningFormFields: FormField[] = [
  {
    id: "fiscalYear",
    name: "fiscalYear",
    label: "Fiscal Year",
    type: FieldType.SELECT,
    required: true,
    options: [
      { value: "2023", label: "2023" },
      { value: "2024", label: "2024" },
      { value: "2025", label: "2025" },
      { value: "2026", label: "2026" },
    ],
    validation: [
      {
        type: ValidationRuleType.REQUIRED,
        message: "Fiscal year is required",
      },
    ],
    section: "basicInfo",
    order: 1,
  },
  {
    id: "departmentId",
    name: "departmentId",
    label: "Department",
    type: FieldType.SELECT,
    required: true,
    dataSource: {
      type: "api",
      source: "/api/departments",
      valueField: "id",
      labelField: "name",
    },
    validation: [
      {
        type: ValidationRuleType.REQUIRED,
        message: "Department is required",
      },
    ],
    section: "basicInfo",
    order: 2,
  },
  {
    id: "budgetTitle",
    name: "budgetTitle",
    label: "Budget Title",
    type: FieldType.TEXT,
    required: true,
    validation: [
      {
        type: ValidationRuleType.REQUIRED,
        message: "Budget title is required",
      },
    ],
    section: "basicInfo",
    order: 3,
  },
  {
    id: "totalAmount",
    name: "totalAmount",
    label: "Total Budget Amount",
    type: FieldType.NUMBER,
    required: true,
    validation: [
      {
        type: ValidationRuleType.REQUIRED,
        message: "Total budget amount is required",
      },
      {
        type: ValidationRuleType.MIN_VALUE,
        value: 0,
        message: "Budget amount must be greater than 0",
      },
    ],
    section: "basicInfo",
    order: 4,
  },
  {
    id: "startDate",
    name: "startDate",
    label: "Start Date",
    type: FieldType.DATE,
    required: true,
    validation: [
      {
        type: ValidationRuleType.REQUIRED,
        message: "Start date is required",
      },
    ],
    section: "basicInfo",
    order: 5,
  },
  {
    id: "endDate",
    name: "endDate",
    label: "End Date",
    type: FieldType.DATE,
    required: true,
    validation: [
      {
        type: ValidationRuleType.REQUIRED,
        message: "End date is required",
      },
    ],
    section: "basicInfo",
    order: 6,
  },
  {
    id: "budgetCategories",
    name: "budgetCategories",
    label: "Budget Categories",
    type: FieldType.REPEATER,
    section: "categories",
    order: 1,
    defaultValue: [
      {
        categoryName: "",
        categoryAmount: 0,
        categoryDescription: "",
      },
    ],
  },
  {
    id: "approvalRequired",
    name: "approvalRequired",
    label: "Approval Required",
    type: FieldType.CHECKBOX,
    defaultValue: true,
    section: "approval",
    order: 1,
  },
  {
    id: "approvalLevel",
    name: "approvalLevel",
    label: "Approval Level",
    type: FieldType.SELECT,
    options: [
      { value: "department", label: "Department Level" },
      { value: "division", label: "Division Level" },
      { value: "executive", label: "Executive Level" },
    ],
    conditional: { field: "approvalRequired", operator: "==", value: true },
    section: "approval",
    order: 2,
  },
  {
    id: "notes",
    name: "notes",
    label: "Notes",
    type: FieldType.TEXTAREA,
    placeholder: "Enter any additional notes",
    section: "notes",
    order: 1,
  },
];

const budgetPlanningSections: FormSection[] = [
  {
    id: "basicInfo",
    title: "Basic Information",
    description: "Enter the basic budget information",
    order: 1,
  },
  {
    id: "categories",
    title: "Budget Categories",
    description: "Define budget categories and allocations",
    order: 2,
  },
  {
    id: "approval",
    title: "Approval Settings",
    description: "Configure approval requirements",
    order: 3,
  },
  {
    id: "notes",
    title: "Additional Notes",
    description: "Any additional information",
    order: 4,
  },
];

const budgetPlanningMetadata: FormMetadata = {
  id: "budget-planning-form",
  title: "Budget Planning Form",
  description: "Form for creating and planning budgets",
  module: FormModule.FINANCIAL,
  version: "1.0.0",
  permissions: {
    [FormPermission.VIEW]: ["finance_manager", "admin", "budget_planner"],
    [FormPermission.CREATE]: ["finance_manager", "admin", "budget_planner"],
    [FormPermission.EDIT]: ["finance_manager", "admin"],
    [FormPermission.DELETE]: ["finance_manager", "admin"],
    [FormPermission.APPROVE]: ["finance_manager", "admin"],
    [FormPermission.REJECT]: ["finance_manager", "admin"],
    [FormPermission.SUBMIT]: ["finance_manager", "admin", "budget_planner"],
    [FormPermission.PRINT]: ["finance_manager", "admin", "budget_planner"],
    [FormPermission.EXPORT]: ["finance_manager", "admin"],
  },
  clientTypes: [
    ClientType.FDF,
    ClientType.ADHA,
    ClientType.CASH,
    ClientType.OTHER,
  ],
  sections: budgetPlanningSections,
  fields: budgetPlanningFormFields,
  dependencies: [],
  workflow: "budget-approval-workflow",
  submitEndpoint: "/api/budget/planning",
  fetchDataEndpoint: "/api/budget/planning/{id}",
  createdAt: new Date(),
  updatedAt: new Date(),
  isActive: true,
};

const budgetPlanningEntry: FormRegistryEntry = {
  id: "budget-planning-form",
  title: "Budget Planning Form",
  description: "Form for creating and planning budgets",
  module: FormModule.FINANCIAL,
  clientTypes: [
    ClientType.FDF,
    ClientType.ADHA,
    ClientType.CASH,
    ClientType.OTHER,
  ],
  permissions: budgetPlanningMetadata.permissions,
  dependencies: [],
  version: "1.0.0",
  path: "/forms/budget/planning",
  icon: "FileSpreadsheet",
  isActive: true,
};

// Budget Allocation Form
const budgetAllocationFormFields: FormField[] = [
  {
    id: "budgetId",
    name: "budgetId",
    label: "Budget Plan",
    type: FieldType.SELECT,
    required: true,
    dataSource: {
      type: "api",
      source: "/api/budgets",
      valueField: "id",
      labelField: "title",
    },
    validation: [
      {
        type: ValidationRuleType.REQUIRED,
        message: "Budget plan is required",
      },
    ],
    section: "basicInfo",
    order: 1,
  },
  {
    id: "departmentId",
    name: "departmentId",
    label: "Department",
    type: FieldType.SELECT,
    required: true,
    dataSource: {
      type: "api",
      source: "/api/departments",
      valueField: "id",
      labelField: "name",
    },
    validation: [
      {
        type: ValidationRuleType.REQUIRED,
        message: "Department is required",
      },
    ],
    section: "basicInfo",
    order: 2,
  },
  {
    id: "allocationTitle",
    name: "allocationTitle",
    label: "Allocation Title",
    type: FieldType.TEXT,
    required: true,
    validation: [
      {
        type: ValidationRuleType.REQUIRED,
        message: "Allocation title is required",
      },
    ],
    section: "basicInfo",
    order: 3,
  },
  {
    id: "allocationDate",
    name: "allocationDate",
    label: "Allocation Date",
    type: FieldType.DATE,
    required: true,
    validation: [
      {
        type: ValidationRuleType.REQUIRED,
        message: "Allocation date is required",
      },
    ],
    section: "basicInfo",
    order: 4,
  },
  {
    id: "allocations",
    name: "allocations",
    label: "Budget Allocations",
    type: FieldType.REPEATER,
    section: "allocationDetails",
    order: 1,
    defaultValue: [
      {
        categoryId: "",
        amount: 0,
        description: "",
      },
    ],
  },
  {
    id: "totalAllocated",
    name: "totalAllocated",
    label: "Total Allocated Amount",
    type: FieldType.CALCULATED,
    calculationFormula: "sum(allocations.*.amount)",
    readOnly: true,
    section: "allocationDetails",
    order: 2,
  },
  {
    id: "notes",
    name: "notes",
    label: "Notes",
    type: FieldType.TEXTAREA,
    placeholder: "Enter any additional notes",
    section: "notes",
    order: 1,
  },
];

const budgetAllocationSections: FormSection[] = [
  {
    id: "basicInfo",
    title: "Basic Information",
    description: "Enter the basic allocation information",
    order: 1,
  },
  {
    id: "allocationDetails",
    title: "Allocation Details",
    description: "Specify budget allocations",
    order: 2,
  },
  {
    id: "notes",
    title: "Additional Notes",
    description: "Any additional information",
    order: 3,
  },
];

const budgetAllocationMetadata: FormMetadata = {
  id: "budget-allocation-form",
  title: "Budget Allocation Form",
  description: "Form for allocating budget to departments and categories",
  module: FormModule.FINANCIAL,
  version: "1.0.0",
  permissions: {
    [FormPermission.VIEW]: ["finance_manager", "admin", "budget_planner"],
    [FormPermission.CREATE]: ["finance_manager", "admin"],
    [FormPermission.EDIT]: ["finance_manager", "admin"],
    [FormPermission.DELETE]: ["finance_manager", "admin"],
    [FormPermission.APPROVE]: ["finance_manager", "admin"],
    [FormPermission.REJECT]: ["finance_manager", "admin"],
    [FormPermission.SUBMIT]: ["finance_manager", "admin"],
    [FormPermission.PRINT]: ["finance_manager", "admin", "budget_planner"],
    [FormPermission.EXPORT]: ["finance_manager", "admin"],
  },
  clientTypes: [
    ClientType.FDF,
    ClientType.ADHA,
    ClientType.CASH,
    ClientType.OTHER,
  ],
  sections: budgetAllocationSections,
  fields: budgetAllocationFormFields,
  dependencies: [
    {
      formId: "budget-planning-form",
      description: "Budget plan must exist before allocation",
      type: "prerequisite",
      required: true,
    },
  ],
  workflow: "budget-allocation-workflow",
  submitEndpoint: "/api/budget/allocation",
  fetchDataEndpoint: "/api/budget/allocation/{id}",
  createdAt: new Date(),
  updatedAt: new Date(),
  isActive: true,
};

const budgetAllocationEntry: FormRegistryEntry = {
  id: "budget-allocation-form",
  title: "Budget Allocation Form",
  description: "Form for allocating budget to departments and categories",
  module: FormModule.FINANCIAL,
  clientTypes: [
    ClientType.FDF,
    ClientType.ADHA,
    ClientType.CASH,
    ClientType.OTHER,
  ],
  permissions: budgetAllocationMetadata.permissions,
  dependencies: budgetAllocationMetadata.dependencies,
  version: "1.0.0",
  path: "/forms/budget/allocation",
  icon: "DollarSign",
  isActive: true,
};

// Budget Revision Form
const budgetRevisionFormFields: FormField[] = [
  {
    id: "budgetId",
    name: "budgetId",
    label: "Budget Plan",
    type: FieldType.SELECT,
    required: true,
    dataSource: {
      type: "api",
      source: "/api/budgets",
      valueField: "id",
      labelField: "title",
    },
    validation: [
      {
        type: ValidationRuleType.REQUIRED,
        message: "Budget plan is required",
      },
    ],
    section: "basicInfo",
    order: 1,
  },
  {
    id: "revisionTitle",
    name: "revisionTitle",
    label: "Revision Title",
    type: FieldType.TEXT,
    required: true,
    validation: [
      {
        type: ValidationRuleType.REQUIRED,
        message: "Revision title is required",
      },
    ],
    section: "basicInfo",
    order: 2,
  },
  {
    id: "revisionDate",
    name: "revisionDate",
    label: "Revision Date",
    type: FieldType.DATE,
    required: true,
    validation: [
      {
        type: ValidationRuleType.REQUIRED,
        message: "Revision date is required",
      },
    ],
    section: "basicInfo",
    order: 3,
  },
  {
    id: "revisionReason",
    name: "revisionReason",
    label: "Reason for Revision",
    type: FieldType.TEXTAREA,
    required: true,
    validation: [
      {
        type: ValidationRuleType.REQUIRED,
        message: "Reason for revision is required",
      },
    ],
    section: "basicInfo",
    order: 4,
  },
  {
    id: "revisionItems",
    name: "revisionItems",
    label: "Budget Revision Items",
    type: FieldType.REPEATER,
    section: "revisionDetails",
    order: 1,
    defaultValue: [
      {
        categoryId: "",
        originalAmount: 0,
        revisedAmount: 0,
        justification: "",
      },
    ],
  },
  {
    id: "totalRevision",
    name: "totalRevision",
    label: "Total Revision Amount",
    type: FieldType.CALCULATED,
    calculationFormula:
      "sum(revisionItems.*.revisedAmount) - sum(revisionItems.*.originalAmount)",
    readOnly: true,
    section: "revisionDetails",
    order: 2,
  },
  {
    id: "attachments",
    name: "attachments",
    label: "Supporting Documents",
    type: FieldType.FILE,
    section: "attachments",
    order: 1,
  },
  {
    id: "approvalRequired",
    name: "approvalRequired",
    label: "Approval Required",
    type: FieldType.CHECKBOX,
    defaultValue: true,
    section: "approval",
    order: 1,
  },
  {
    id: "approvalLevel",
    name: "approvalLevel",
    label: "Approval Level",
    type: FieldType.SELECT,
    options: [
      { value: "department", label: "Department Level" },
      { value: "division", label: "Division Level" },
      { value: "executive", label: "Executive Level" },
    ],
    conditional: { field: "approvalRequired", operator: "==", value: true },
    section: "approval",
    order: 2,
  },
];

const budgetRevisionSections: FormSection[] = [
  {
    id: "basicInfo",
    title: "Basic Information",
    description: "Enter the basic revision information",
    order: 1,
  },
  {
    id: "revisionDetails",
    title: "Revision Details",
    description: "Specify budget revisions",
    order: 2,
  },
  {
    id: "attachments",
    title: "Supporting Documents",
    description: "Attach any supporting documents",
    order: 3,
  },
  {
    id: "approval",
    title: "Approval Settings",
    description: "Configure approval requirements",
    order: 4,
  },
];

const budgetRevisionMetadata: FormMetadata = {
  id: "budget-revision-form",
  title: "Budget Revision Form",
  description: "Form for revising existing budgets",
  module: FormModule.FINANCIAL,
  version: "1.0.0",
  permissions: {
    [FormPermission.VIEW]: ["finance_manager", "admin", "budget_planner"],
    [FormPermission.CREATE]: ["finance_manager", "admin"],
    [FormPermission.EDIT]: ["finance_manager", "admin"],
    [FormPermission.DELETE]: ["finance_manager", "admin"],
    [FormPermission.APPROVE]: ["finance_manager", "admin"],
    [FormPermission.REJECT]: ["finance_manager", "admin"],
    [FormPermission.SUBMIT]: ["finance_manager", "admin", "budget_planner"],
    [FormPermission.PRINT]: ["finance_manager", "admin", "budget_planner"],
    [FormPermission.EXPORT]: ["finance_manager", "admin"],
  },
  clientTypes: [
    ClientType.FDF,
    ClientType.ADHA,
    ClientType.CASH,
    ClientType.OTHER,
  ],
  sections: budgetRevisionSections,
  fields: budgetRevisionFormFields,
  dependencies: [
    {
      formId: "budget-planning-form",
      description: "Budget plan must exist before revision",
      type: "prerequisite",
      required: true,
    },
  ],
  workflow: "budget-revision-workflow",
  submitEndpoint: "/api/budget/revision",
  fetchDataEndpoint: "/api/budget/revision/{id}",
  createdAt: new Date(),
  updatedAt: new Date(),
  isActive: true,
};

const budgetRevisionEntry: FormRegistryEntry = {
  id: "budget-revision-form",
  title: "Budget Revision Form",
  description: "Form for revising existing budgets",
  module: FormModule.FINANCIAL,
  clientTypes: [
    ClientType.FDF,
    ClientType.ADHA,
    ClientType.CASH,
    ClientType.OTHER,
  ],
  permissions: budgetRevisionMetadata.permissions,
  dependencies: budgetRevisionMetadata.dependencies,
  version: "1.0.0",
  path: "/forms/budget/revision",
  icon: "FileEdit",
  isActive: true,
};

// Register all forms
export function registerbudgetform() {
  formRegistry.registerForm(budgetPlanningEntry, budgetPlanningMetadata);
  formRegistry.registerForm(budgetAllocationEntry, budgetAllocationMetadata);
  formRegistry.registerForm(budgetRevisionEntry, budgetRevisionMetadata);
}

