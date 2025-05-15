import { ClientType } from "../forms/types";

export enum ValidationSeverity {
  ERROR = "error",
  WARNING = "warning",
  INFO = "info",
}

export enum ValidationRuleType {
  REQUIRED = "required",
  MIN_LENGTH = "minLength",
  MAX_LENGTH = "maxLength",
  MIN_VALUE = "minValue",
  MAX_VALUE = "maxValue",
  PATTERN = "pattern",
  EMAIL = "email",
  PHONE = "phone",
  DATE = "date",
  CUSTOM = "custom",
  DEPENDENT = "dependent",
}

export interface ValidationRule {
  id: string;
  formId: string;
  fieldId: string;
  type: ValidationRuleType;
  severity: ValidationSeverity;
  message: string;
  clientTypes: ClientType[];
  params?: Record<string, any>;
  customValidationFn?: string; // Stored as a string to be evaluated
  dependentField?: string; // For dependent validations
  dependentCondition?: string; // Condition to evaluate
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  version: number;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  infos: ValidationError[];
}

export interface ValidationError {
  fieldId: string;
  message: string;
  severity: ValidationSeverity;
  ruleId: string;
}

export interface ValidationRuleHistory {
  id: string;
  ruleId: string;
  version: number;
  changes: Partial<ValidationRule>;
  changedAt: string;
  changedBy: string;
}

export interface ValidationContext {
  formId: string;
  clientType: ClientType;
  userId: string;
  formData: Record<string, any>;
  allFormsData?: Record<string, Record<string, any>>; // For cross-form validations
}
