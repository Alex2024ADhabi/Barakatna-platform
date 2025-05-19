// Form Registry & Metadata System Types

// Client types for reference
export enum ClientType {
  FDF = "FDF",
  ADHA = "ADHA",
  CASH = "CASH",
  OTHER = "OTHER",
}

// Form module categories
export enum FormModule {
  ASSESSMENT = "assessment",
  PROJECT = "project",
  PROCUREMENT = "procurement",
  COMMITTEE = "committee",
  FINANCIAL = "financial",
  INVENTORY = "inventory",
  USER = "user",
  CLIENT = "client",
  SUPPLIER = "supplier",
  REPORT = "report",
  SETTINGS = "settings",
  CASE = "case",
  MANPOWER = "manpower",
  DRAWING = "drawing",
  COHORT = "cohort",
  PRICE_LIST = "price_list",
  PROGRAM = "program",
  ADMINISTRATION = "administration",
}

// Form field types
export enum FieldType {
  TEXT = "text",
  TEXTAREA = "textarea",
  NUMBER = "number",
  DATE = "date",
  TIME = "time",
  DATETIME = "datetime",
  SELECT = "select",
  MULTISELECT = "multiselect",
  CHECKBOX = "checkbox",
  RADIO = "radio",
  FILE = "file",
  IMAGE = "image",
  SIGNATURE = "signature",
  LOCATION = "location",
  PHONE = "phone",
  EMAIL = "email",
  PASSWORD = "password",
  HIDDEN = "hidden",
  CALCULATED = "calculated",
  LOOKUP = "lookup",
  REFERENCE = "reference",
  SECTION = "section",
  SUBSECTION = "subsection",
  REPEATER = "repeater",
}

// Form permission types
export enum FormPermission {
  VIEW = "view",
  CREATE = "create",
  EDIT = "edit",
  DELETE = "delete",
  APPROVE = "approve",
  REJECT = "reject",
  SUBMIT = "submit",
  PRINT = "print",
  EXPORT = "export",
}

// Form validation rule types
export enum ValidationRuleType {
  REQUIRED = "required",
  MIN_LENGTH = "minLength",
  MAX_LENGTH = "maxLength",
  MIN_VALUE = "minValue",
  MAX_VALUE = "maxValue",
  PATTERN = "pattern",
  EMAIL = "email",
  URL = "url",
  CUSTOM = "custom",
}

// Form dependency types
export enum DependencyType {
  VISIBILITY = "visibility",
  REQUIREMENT = "requirement",
  VALUE = "value",
  OPTIONS = "options",
  VALIDATION = "validation",
}

// Form field validation rule
export interface ValidationRule {
  type: ValidationRuleType;
  value?: any;
  message: string;
  clientTypes?: ClientType[];
  condition?: string; // JavaScript expression that evaluates to boolean
}

// Form field dependency
export interface FieldDependency {
  type: DependencyType;
  sourceField: string;
  condition: string; // JavaScript expression that evaluates to boolean
  action: string; // JavaScript expression or function name
  clientTypes?: ClientType[];
  description?: string; // Optional description of the dependency
}

// Form field data source for lookups and dropdowns
export interface FieldDataSource {
  type: "static" | "api" | "function";
  source: string; // API endpoint, function name, or static data reference
  valueField: string;
  labelField: string;
  filters?: Record<string, any>;
  clientTypes?: ClientType[];
  dependsOn?: string[]; // Fields that this data source depends on
}

// Form field definition
export interface FormField {
  id: string;
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  helpText?: string;
  defaultValue?: any;
  required?: boolean;
  readOnly?: boolean;
  hidden?: boolean;
  validation?: ValidationRule[];
  dependencies?: FieldDependency[];
  dataSource?: FieldDataSource;
  options?: Array<{ value: string; label: string }>;
  clientTypeOverrides?: Record<
    ClientType,
    Partial<Omit<FormField, "id" | "name" | "type" | "clientTypeOverrides">>
  >;
  calculationFormula?: string; // For calculated fields
  section?: string; // Section this field belongs to
  order?: number; // Display order
  width?: "full" | "half" | "third" | "quarter" | number; // Width in the form layout
  conditional?: { field: string; operator: string; value: any }; // Simple conditional visibility
}

// Form section definition
export interface FormSection {
  id: string;
  title: string;
  description?: string;
  order: number;
  collapsible?: boolean;
  collapsed?: boolean;
  clientTypes?: ClientType[];
  conditional?: { field: string; operator: string; value: any }; // Simple conditional visibility
}

// Form dependency definition
export interface FormDependency {
  formId: string;
  description: string;
  type:
    | "prerequisite"
    | "reference"
    | "followup"
    | "workflow"
    | "validation"
    | "direct"
    | "derived";
  required: boolean;
  condition?: string; // When this dependency applies
  clientTypes?: ClientType[];
  fieldMappings?: Array<{
    sourceField: string;
    targetField: string;
    transformationRule?: string;
    description?: string;
  }>;
}

// Form metadata definition
export interface FormMetadata {
  id: string;
  title: string;
  description: string;
  module: FormModule;
  version: string;
  permissions: Record<FormPermission, string[]>; // Role names for each permission
  clientTypes: ClientType[];
  sections: FormSection[];
  fields: FormField[];
  dependencies: FormDependency[];
  workflow?: string; // Reference to workflow template
  submitEndpoint?: string; // API endpoint for form submission
  fetchDataEndpoint?: string; // API endpoint to fetch form data
  clientTypeOverrides?: Record<
    ClientType,
    Partial<Omit<FormMetadata, "id" | "clientTypeOverrides">>
  >;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

// Form registry entry
export interface FormRegistryEntry {
  id: string;
  title: string;
  description: string;
  module: FormModule;
  clientTypes: ClientType[];
  permissions: Record<FormPermission, string[]>;
  dependencies: FormDependency[];
  version: string;
  path: string; // Path to the form in the application
  icon?: string; // Icon for the form
  isActive: boolean;
}
