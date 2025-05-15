import { ClientType } from "../forms/types";
import {
  ValidationRule,
  ValidationRuleType,
  ValidationSeverity,
} from "./types";

const mockValidationRules: ValidationRule[] = [
  // Initial Assessment Form Rules
  {
    id: "rule_1",
    formId: "initial-assessment-form",
    fieldId: "beneficiaryId",
    type: ValidationRuleType.REQUIRED,
    severity: ValidationSeverity.ERROR,
    message: "Beneficiary ID is required",
    clientTypes: [ClientType.FDF, ClientType.ADHA, ClientType.CASH],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: "system",
    updatedBy: "system",
    version: 1,
  },
  {
    id: "rule_2",
    formId: "initial-assessment-form",
    fieldId: "beneficiaryId",
    type: ValidationRuleType.PATTERN,
    severity: ValidationSeverity.ERROR,
    message: "Beneficiary ID must follow the format BEN-XXXXX",
    clientTypes: [ClientType.FDF],
    params: { pattern: "^BEN-\\d{5}$" },
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: "system",
    updatedBy: "system",
    version: 1,
  },
  {
    id: "rule_3",
    formId: "initial-assessment-form",
    fieldId: "assessmentDate",
    type: ValidationRuleType.REQUIRED,
    severity: ValidationSeverity.ERROR,
    message: "Assessment date is required",
    clientTypes: [ClientType.FDF, ClientType.ADHA, ClientType.CASH],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: "system",
    updatedBy: "system",
    version: 1,
  },
];

export default mockValidationRules;
