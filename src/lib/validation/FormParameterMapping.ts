import { ClientType } from "../forms/types";

export enum ParameterDataType {
  STRING = "string",
  NUMBER = "number",
  BOOLEAN = "boolean",
  DATE = "date",
  ARRAY = "array",
  OBJECT = "object",
}

export enum ModuleType {
  ASSESSMENT = "assessment",
  PROJECT_MANAGEMENT = "project_management",
  PROCUREMENT = "procurement",
  APPROVAL = "approval",
  FINANCIAL = "financial",
  ADMIN = "admin",
}

export interface ParameterDefinition {
  id: string;
  name: string;
  dataType: ParameterDataType;
  isRequired: Record<ClientType, boolean>;
  defaultValue?: any;
  calculationFormula?: string;
  dependsOn?: string[];
  description?: string;
}

export interface FormDefinition {
  id: string;
  name: string;
  module: ModuleType;
  parameters: ParameterDefinition[];
  clientSpecificParameters?: Record<ClientType, string[]>;
}

// This would be a comprehensive mapping of all forms and their parameters
export const formParameterMapping: FormDefinition[] = [
  // Assessment Module Forms
  {
    id: "initial-assessment-form",
    name: "Initial Assessment",
    module: ModuleType.ASSESSMENT,
    parameters: [
      {
        id: "beneficiaryId",
        name: "Beneficiary ID",
        dataType: ParameterDataType.STRING,
        isRequired: {
          [ClientType.FDF]: true,
          [ClientType.ADHA]: true,
          [ClientType.CASH]: true,
        },
        description: "Unique identifier for the beneficiary",
      },
      {
        id: "assessmentDate",
        name: "Assessment Date",
        dataType: ParameterDataType.DATE,
        isRequired: {
          [ClientType.FDF]: true,
          [ClientType.ADHA]: true,
          [ClientType.CASH]: true,
        },
        defaultValue: new Date().toISOString().split("T")[0],
        description: "Date when the assessment was conducted",
      },
      {
        id: "assessmentType",
        name: "Assessment Type",
        dataType: ParameterDataType.STRING,
        isRequired: {
          [ClientType.FDF]: true,
          [ClientType.ADHA]: true,
          [ClientType.CASH]: false,
        },
        defaultValue: "Initial",
        description: "Type of assessment (Initial, Follow-up, Final)",
      },
    ],
    clientSpecificParameters: {
      [ClientType.FDF]: ["fdfReferenceNumber", "fdfPriorityLevel"],
      [ClientType.ADHA]: ["adhaReferenceNumber", "adhaRegion"],
      [ClientType.CASH]: ["paymentMethod", "receiptNumber"],
    },
  },
  {
    id: "room-assessment-form",
    name: "Room Assessment",
    module: ModuleType.ASSESSMENT,
    parameters: [
      {
        id: "beneficiaryId",
        name: "Beneficiary ID",
        dataType: ParameterDataType.STRING,
        isRequired: {
          [ClientType.FDF]: true,
          [ClientType.ADHA]: true,
          [ClientType.CASH]: true,
        },
        dependsOn: ["initial-assessment-form.beneficiaryId"],
        description: "Beneficiary ID linked from initial assessment",
      },
      {
        id: "roomType",
        name: "Room Type",
        dataType: ParameterDataType.STRING,
        isRequired: {
          [ClientType.FDF]: true,
          [ClientType.ADHA]: true,
          [ClientType.CASH]: true,
        },
        defaultValue: "Bathroom",
        description: "Type of room being assessed",
      },
      {
        id: "estimatedCost",
        name: "Estimated Cost",
        dataType: ParameterDataType.NUMBER,
        isRequired: {
          [ClientType.FDF]: true,
          [ClientType.ADHA]: true,
          [ClientType.CASH]: false,
        },
        defaultValue: 0,
        description: "Estimated cost for room modifications",
      },
    ],
  },

  // Project Management Module Forms
  {
    id: "project-creation-form",
    name: "Project Creation",
    module: ModuleType.PROJECT_MANAGEMENT,
    parameters: [
      {
        id: "beneficiaryId",
        name: "Beneficiary ID",
        dataType: ParameterDataType.STRING,
        isRequired: {
          [ClientType.FDF]: true,
          [ClientType.ADHA]: true,
          [ClientType.CASH]: true,
        },
        dependsOn: ["initial-assessment-form.beneficiaryId"],
        description: "Beneficiary ID linked from initial assessment",
      },
      {
        id: "projectDescription",
        name: "Project Description",
        dataType: ParameterDataType.STRING,
        isRequired: {
          [ClientType.FDF]: true,
          [ClientType.ADHA]: true,
          [ClientType.CASH]: true,
        },
        defaultValue: "",
        description: "Detailed description of the project",
      },
      {
        id: "totalBudget",
        name: "Total Budget",
        dataType: ParameterDataType.NUMBER,
        isRequired: {
          [ClientType.FDF]: true,
          [ClientType.ADHA]: true,
          [ClientType.CASH]: false,
        },
        defaultValue: 0,
        dependsOn: ["room-assessment-form.estimatedCost"],
        calculationFormula:
          "return context.allFormsData['room-assessment-form'].estimatedCost;",
        description: "Total budget for the project",
      },
    ],
  },
];
