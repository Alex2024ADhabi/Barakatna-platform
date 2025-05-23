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

// Case Creation Form
const caseCreationFormFields: FormField[] = [
  {
    id: "caseTitle",
    name: "caseTitle",
    label: "Case Title",
    type: FieldType.TEXT,
    required: true,
    validation: [
      {
        type: ValidationRuleType.REQUIRED,
        message: "Case title is required",
      },
    ],
    section: "basicInfo",
    order: 1,
  },
  {
    id: "caseType",
    name: "caseType",
    label: "Case Type",
    type: FieldType.SELECT,
    required: true,
    options: [
      { value: "inquiry", label: "Inquiry" },
      { value: "complaint", label: "Complaint" },
      { value: "support", label: "Support Request" },
      { value: "feedback", label: "Feedback" },
      { value: "incident", label: "Incident" },
      { value: "other", label: "Other" },
    ],
    validation: [
      {
        type: ValidationRuleType.REQUIRED,
        message: "Case type is required",
      },
    ],
    section: "basicInfo",
    order: 2,
  },
  {
    id: "priority",
    name: "priority",
    label: "Priority",
    type: FieldType.SELECT,
    required: true,
    options: [
      { value: "low", label: "Low" },
      { value: "medium", label: "Medium" },
      { value: "high", label: "High" },
      { value: "critical", label: "Critical" },
    ],
    defaultValue: "medium",
    validation: [
      {
        type: ValidationRuleType.REQUIRED,
        message: "Priority is required",
      },
    ],
    section: "basicInfo",
    order: 3,
  },
  {
    id: "beneficiaryId",
    name: "beneficiaryId",
    label: "Beneficiary",
    type: FieldType.SELECT,
    dataSource: {
      type: "api",
      source: "/api/beneficiaries",
      valueField: "id",
      labelField: "name",
    },
    section: "basicInfo",
    order: 4,
  },
  {
    id: "projectId",
    name: "projectId",
    label: "Related Project",
    type: FieldType.SELECT,
    dataSource: {
      type: "api",
      source: "/api/projects",
      valueField: "id",
      labelField: "name",
    },
    section: "basicInfo",
    order: 5,
  },
  {
    id: "description",
    name: "description",
    label: "Description",
    type: FieldType.TEXTAREA,
    required: true,
    placeholder: "Enter detailed description of the case",
    validation: [
      {
        type: ValidationRuleType.REQUIRED,
        message: "Description is required",
      },
    ],
    section: "caseDetails",
    order: 1,
  },
  {
    id: "reportedBy",
    name: "reportedBy",
    label: "Reported By",
    type: FieldType.TEXT,
    section: "caseDetails",
    order: 2,
  },
  {
    id: "reportedDate",
    name: "reportedDate",
    label: "Reported Date",
    type: FieldType.DATE,
    required: true,
    defaultValue: new Date().toISOString().split("T")[0],
    validation: [
      {
        type: ValidationRuleType.REQUIRED,
        message: "Reported date is required",
      },
    ],
    section: "caseDetails",
    order: 3,
  },
  {
    id: "contactPhone",
    name: "contactPhone",
    label: "Contact Phone",
    type: FieldType.PHONE,
    section: "contactInfo",
    order: 1,
  },
  {
    id: "contactEmail",
    name: "contactEmail",
    label: "Contact Email",
    type: FieldType.EMAIL,
    validation: [
      {
        type: ValidationRuleType.EMAIL,
        message: "Please enter a valid email address",
      },
    ],
    section: "contactInfo",
    order: 2,
  },
  {
    id: "preferredContactMethod",
    name: "preferredContactMethod",
    label: "Preferred Contact Method",
    type: FieldType.SELECT,
    options: [
      { value: "phone", label: "Phone" },
      { value: "email", label: "Email" },
      { value: "sms", label: "SMS" },
      { value: "whatsapp", label: "WhatsApp" },
    ],
    section: "contactInfo",
    order: 3,
  },
  {
    id: "attachments",
    name: "attachments",
    label: "Attachments",
    type: FieldType.FILE,
    section: "additionalInfo",
    order: 1,
  },
  {
    id: "notes",
    name: "notes",
    label: "Notes",
    type: FieldType.TEXTAREA,
    placeholder: "Enter any additional notes",
    section: "additionalInfo",
    order: 2,
  },
];

const caseCreationSections: FormSection[] = [
  {
    id: "basicInfo",
    title: "Basic Information",
    description: "Enter the basic case information",
    order: 1,
  },
  {
    id: "caseDetails",
    title: "Case Details",
    description: "Enter detailed information about the case",
    order: 2,
  },
  {
    id: "contactInfo",
    title: "Contact Information",
    description: "Enter contact information for follow-up",
    order: 3,
  },
  {
    id: "additionalInfo",
    title: "Additional Information",
    description: "Add attachments and notes",
    order: 4,
  },
];

const caseCreationMetadata: FormMetadata = {
  id: "case-creation-form",
  title: "Case Creation Form",
  description: "Form for creating new cases",
  module: FormModule.CASE,
  version: "1.0.0",
  permissions: {
    [FormPermission.VIEW]: [
      "case_manager",
      "admin",
      "case_worker",
      "support_staff",
    ],
    [FormPermission.CREATE]: [
      "case_manager",
      "admin",
      "case_worker",
      "support_staff",
    ],
    [FormPermission.EDIT]: ["case_manager", "admin", "case_worker"],
    [FormPermission.DELETE]: ["case_manager", "admin"],
    [FormPermission.APPROVE]: ["case_manager", "admin"],
    [FormPermission.REJECT]: ["case_manager", "admin"],
    [FormPermission.SUBMIT]: [
      "case_manager",
      "admin",
      "case_worker",
      "support_staff",
    ],
    [FormPermission.PRINT]: ["case_manager", "admin", "case_worker"],
    [FormPermission.EXPORT]: ["case_manager", "admin"],
  },
  clientTypes: [
    ClientType.FDF,
    ClientType.ADHA,
    ClientType.CASH,
    ClientType.OTHER,
  ],
  sections: caseCreationSections,
  fields: caseCreationFormFields,
  dependencies: [],
  workflow: "case-management-workflow",
  submitEndpoint: "/api/cases",
  fetchDataEndpoint: "/api/cases/{id}",
  createdAt: new Date(),
  updatedAt: new Date(),
  isActive: true,
};

const caseCreationEntry: FormRegistryEntry = {
  id: "case-creation-form",
  title: "Case Creation Form",
  description: "Form for creating new cases",
  module: FormModule.CASE,
  clientTypes: [
    ClientType.FDF,
    ClientType.ADHA,
    ClientType.CASH,
    ClientType.OTHER,
  ],
  permissions: caseCreationMetadata.permissions,
  dependencies: caseCreationMetadata.dependencies,
  version: "1.0.0",
  path: "/forms/cases/create",
  icon: "FileText",
  isActive: true,
};

// Case Assignment Form
const caseAssignmentFormFields: FormField[] = [
  {
    id: "caseId",
    name: "caseId",
    label: "Case",
    type: FieldType.SELECT,
    required: true,
    dataSource: {
      type: "api",
      source: "/api/cases",
      valueField: "id",
      labelField: "caseTitle",
    },
    validation: [
      {
        type: ValidationRuleType.REQUIRED,
        message: "Case is required",
      },
    ],
    section: "basicInfo",
    order: 1,
  },
  {
    id: "assigneeId",
    name: "assigneeId",
    label: "Assignee",
    type: FieldType.SELECT,
    required: true,
    dataSource: {
      type: "api",
      source: "/api/users",
      valueField: "id",
      labelField: "name",
      filters: { roles: ["case_worker", "case_manager"] },
    },
    validation: [
      {
        type: ValidationRuleType.REQUIRED,
        message: "Assignee is required",
      },
    ],
    section: "basicInfo",
    order: 2,
  },
  {
    id: "assignmentDate",
    name: "assignmentDate",
    label: "Assignment Date",
    type: FieldType.DATE,
    required: true,
    defaultValue: new Date().toISOString().split("T")[0],
    validation: [
      {
        type: ValidationRuleType.REQUIRED,
        message: "Assignment date is required",
      },
    ],
    section: "basicInfo",
    order: 3,
  },
  {
    id: "dueDate",
    name: "dueDate",
    label: "Due Date",
    type: FieldType.DATE,
    section: "basicInfo",
    order: 4,
  },
  {
    id: "assignmentReason",
    name: "assignmentReason",
    label: "Assignment Reason",
    type: FieldType.TEXTAREA,
    placeholder: "Enter reason for assignment",
    section: "assignmentDetails",
    order: 1,
  },
  {
    id: "instructions",
    name: "instructions",
    label: "Instructions",
    type: FieldType.TEXTAREA,
    placeholder: "Enter instructions for assignee",
    section: "assignmentDetails",
    order: 2,
  },
  {
    id: "notifyAssignee",
    name: "notifyAssignee",
    label: "Notify Assignee",
    type: FieldType.CHECKBOX,
    defaultValue: true,
    section: "notifications",
    order: 1,
  },
  {
    id: "notificationMessage",
    name: "notificationMessage",
    label: "Notification Message",
    type: FieldType.TEXTAREA,
    placeholder: "Enter custom notification message",
    conditional: { field: "notifyAssignee", operator: "==", value: true },
    section: "notifications",
    order: 2,
  },
];

const caseAssignmentSections: FormSection[] = [
  {
    id: "basicInfo",
    title: "Basic Information",
    description: "Select case and assignee",
    order: 1,
  },
  {
    id: "assignmentDetails",
    title: "Assignment Details",
    description: "Enter assignment reason and instructions",
    order: 2,
  },
  {
    id: "notifications",
    title: "Notifications",
    description: "Configure notification settings",
    order: 3,
  },
];

const caseAssignmentMetadata: FormMetadata = {
  id: "case-assignment-form",
  title: "Case Assignment Form",
  description: "Form for assigning cases to staff members",
  module: FormModule.CASE,
  version: "1.0.0",
  permissions: {
    [FormPermission.VIEW]: ["case_manager", "admin"],
    [FormPermission.CREATE]: ["case_manager", "admin"],
    [FormPermission.EDIT]: ["case_manager", "admin"],
    [FormPermission.DELETE]: ["case_manager", "admin"],
    [FormPermission.APPROVE]: ["case_manager", "admin"],
    [FormPermission.REJECT]: ["case_manager", "admin"],
    [FormPermission.SUBMIT]: ["case_manager", "admin"],
    [FormPermission.PRINT]: ["case_manager", "admin"],
    [FormPermission.EXPORT]: ["case_manager", "admin"],
  },
  clientTypes: [
    ClientType.FDF,
    ClientType.ADHA,
    ClientType.CASH,
    ClientType.OTHER,
  ],
  sections: caseAssignmentSections,
  fields: caseAssignmentFormFields,
  dependencies: [
    {
      formId: "case-creation-form",
      description: "Case must exist before assignment",
      type: "prerequisite",
      required: true,
    },
  ],
  workflow: "",
  submitEndpoint: "/api/cases/assign",
  fetchDataEndpoint: "/api/cases/assignments/{id}",
  createdAt: new Date(),
  updatedAt: new Date(),
  isActive: true,
};

const caseAssignmentEntry: FormRegistryEntry = {
  id: "case-assignment-form",
  title: "Case Assignment Form",
  description: "Form for assigning cases to staff members",
  module: FormModule.CASE,
  clientTypes: [
    ClientType.FDF,
    ClientType.ADHA,
    ClientType.CASH,
    ClientType.OTHER,
  ],
  permissions: caseAssignmentMetadata.permissions,
  dependencies: caseAssignmentMetadata.dependencies,
  version: "1.0.0",
  path: "/forms/cases/assign",
  icon: "UserCheck",
  isActive: true,
};

// Case Update Form
const caseUpdateFormFields: FormField[] = [
  {
    id: "caseId",
    name: "caseId",
    label: "Case",
    type: FieldType.SELECT,
    required: true,
    dataSource: {
      type: "api",
      source: "/api/cases",
      valueField: "id",
      labelField: "caseTitle",
    },
    validation: [
      {
        type: ValidationRuleType.REQUIRED,
        message: "Case is required",
      },
    ],
    section: "basicInfo",
    order: 1,
  },
  {
    id: "updateType",
    name: "updateType",
    label: "Update Type",
    type: FieldType.SELECT,
    required: true,
    options: [
      { value: "status_change", label: "Status Change" },
      { value: "comment", label: "Comment" },
      { value: "action_taken", label: "Action Taken" },
      { value: "escalation", label: "Escalation" },
      { value: "resolution", label: "Resolution" },
      { value: "other", label: "Other" },
    ],
    validation: [
      {
        type: ValidationRuleType.REQUIRED,
        message: "Update type is required",
      },
    ],
    section: "basicInfo",
    order: 2,
  },
  {
    id: "updateDate",
    name: "updateDate",
    label: "Update Date",
    type: FieldType.DATE,
    required: true,
    defaultValue: new Date().toISOString().split("T")[0],
    validation: [
      {
        type: ValidationRuleType.REQUIRED,
        message: "Update date is required",
      },
    ],
    section: "basicInfo",
    order: 3,
  },
  {
    id: "status",
    name: "status",
    label: "Status",
    type: FieldType.SELECT,
    options: [
      { value: "new", label: "New" },
      { value: "assigned", label: "Assigned" },
      { value: "in_progress", label: "In Progress" },
      { value: "on_hold", label: "On Hold" },
      { value: "pending_info", label: "Pending Information" },
      { value: "resolved", label: "Resolved" },
      { value: "closed", label: "Closed" },
      { value: "cancelled", label: "Cancelled" },
    ],
    conditional: {
      field: "updateType",
      operator: "==",
      value: "status_change",
    },
    section: "updateDetails",
    order: 1,
  },
  {
    id: "priority",
    name: "priority",
    label: "Priority",
    type: FieldType.SELECT,
    options: [
      { value: "low", label: "Low" },
      { value: "medium", label: "Medium" },
      { value: "high", label: "High" },
      { value: "critical", label: "Critical" },
    ],
    section: "updateDetails",
    order: 2,
  },
  {
    id: "updateDescription",
    name: "updateDescription",
    label: "Update Description",
    type: FieldType.TEXTAREA,
    required: true,
    placeholder: "Enter detailed description of the update",
    validation: [
      {
        type: ValidationRuleType.REQUIRED,
        message: "Update description is required",
      },
    ],
    section: "updateDetails",
    order: 3,
  },
  {
    id: "actionTaken",
    name: "actionTaken",
    label: "Action Taken",
    type: FieldType.TEXTAREA,
    placeholder: "Describe actions taken",
    conditional: { field: "updateType", operator: "==", value: "action_taken" },
    section: "updateDetails",
    order: 4,
  },
  {
    id: "resolutionDetails",
    name: "resolutionDetails",
    label: "Resolution Details",
    type: FieldType.TEXTAREA,
    placeholder: "Describe how the case was resolved",
    conditional: { field: "updateType", operator: "==", value: "resolution" },
    section: "updateDetails",
    order: 5,
  },
  {
    id: "timeSpent",
    name: "timeSpent",
    label: "Time Spent (minutes)",
    type: FieldType.NUMBER,
    validation: [
      {
        type: ValidationRuleType.MIN_VALUE,
        value: 0,
        message: "Time spent cannot be negative",
      },
    ],
    section: "timeTracking",
    order: 1,
  },
  {
    id: "nextFollowUpDate",
    name: "nextFollowUpDate",
    label: "Next Follow-up Date",
    type: FieldType.DATE,
    section: "timeTracking",
    order: 2,
  },
  {
    id: "attachments",
    name: "attachments",
    label: "Attachments",
    type: FieldType.FILE,
    section: "additionalInfo",
    order: 1,
  },
  {
    id: "notifyBeneficiary",
    name: "notifyBeneficiary",
    label: "Notify Beneficiary",
    type: FieldType.CHECKBOX,
    defaultValue: false,
    section: "notifications",
    order: 1,
  },
  {
    id: "notifyAssignee",
    name: "notifyAssignee",
    label: "Notify Assignee",
    type: FieldType.CHECKBOX,
    defaultValue: false,
    section: "notifications",
    order: 2,
  },
  {
    id: "notificationMessage",
    name: "notificationMessage",
    label: "Notification Message",
    type: FieldType.TEXTAREA,
    placeholder: "Enter custom notification message",
    conditional: {
      field: "notifyBeneficiary",
      operator: "==",
      value: true,
      or: { field: "notifyAssignee", operator: "==", value: true },
    },
    section: "notifications",
    order: 3,
  },
];

const caseUpdateSections: FormSection[] = [
  {
    id: "basicInfo",
    title: "Basic Information",
    description: "Select case and update type",
    order: 1,
  },
  {
    id: "updateDetails",
    title: "Update Details",
    description: "Enter details about the update",
    order: 2,
  },
  {
    id: "timeTracking",
    title: "Time Tracking",
    description: "Track time spent and follow-up dates",
    order: 3,
  },
  {
    id: "additionalInfo",
    title: "Additional Information",
    description: "Add attachments and notes",
    order: 4,
  },
  {
    id: "notifications",
    title: "Notifications",
    description: "Configure notification settings",
    order: 5,
  },
];

const caseUpdateMetadata: FormMetadata = {
  id: "case-update-form",
  title: "Case Update Form",
  description: "Form for updating case status and details",
  module: FormModule.CASE,
  version: "1.0.0",
  permissions: {
    [FormPermission.VIEW]: ["case_manager", "admin", "case_worker"],
    [FormPermission.CREATE]: ["case_manager", "admin", "case_worker"],
    [FormPermission.EDIT]: ["case_manager", "admin", "case_worker"],
    [FormPermission.DELETE]: ["case_manager", "admin"],
    [FormPermission.APPROVE]: ["case_manager", "admin"],
    [FormPermission.REJECT]: ["case_manager", "admin"],
    [FormPermission.SUBMIT]: ["case_manager", "admin", "case_worker"],
    [FormPermission.PRINT]: ["case_manager", "admin", "case_worker"],
    [FormPermission.EXPORT]: ["case_manager", "admin"],
  },
  clientTypes: [
    ClientType.FDF,
    ClientType.ADHA,
    ClientType.CASH,
    ClientType.OTHER,
  ],
  sections: caseUpdateSections,
  fields: caseUpdateFormFields,
  dependencies: [
    {
      formId: "case-creation-form",
      description: "Case must exist before updating",
      type: "prerequisite",
      required: true,
    },
  ],
  workflow: "",
  submitEndpoint: "/api/cases/update",
  fetchDataEndpoint: "/api/cases/updates/{id}",
  createdAt: new Date(),
  updatedAt: new Date(),
  isActive: true,
};

const caseUpdateEntry: FormRegistryEntry = {
  id: "case-update-form",
  title: "Case Update Form",
  description: "Form for updating case status and details",
  module: FormModule.CASE,
  clientTypes: [
    ClientType.FDF,
    ClientType.ADHA,
    ClientType.CASH,
    ClientType.OTHER,
  ],
  permissions: caseUpdateMetadata.permissions,
  dependencies: caseUpdateMetadata.dependencies,
  version: "1.0.0",
  path: "/forms/cases/update",
  icon: "MessageSquare",
  isActive: true,
};

// Register all forms
export function registercaseform() {
  formRegistry.registerForm(caseCreationEntry, caseCreationMetadata);
  formRegistry.registerForm(caseAssignmentEntry, caseAssignmentMetadata);
  formRegistry.registerForm(caseUpdateEntry, caseUpdateMetadata);
}

