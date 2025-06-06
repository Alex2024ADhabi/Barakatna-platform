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

// User Management Form
const userManagementFormFields: FormField[] = [
  {
    id: "username",
    name: "username",
    label: "Username",
    type: FieldType.TEXT,
    required: true,
    validation: [
      {
        type: ValidationRuleType.REQUIRED,
        message: "Username is required",
      },
      {
        type: ValidationRuleType.MIN_LENGTH,
        value: 3,
        message: "Username must be at least 3 characters",
      },
    ],
    section: "basicInfo",
    order: 1,
  },
  {
    id: "email",
    name: "email",
    label: "Email",
    type: FieldType.EMAIL,
    required: true,
    validation: [
      {
        type: ValidationRuleType.REQUIRED,
        message: "Email is required",
      },
      {
        type: ValidationRuleType.EMAIL,
        message: "Please enter a valid email address",
      },
    ],
    section: "basicInfo",
    order: 2,
  },
  {
    id: "firstName",
    name: "firstName",
    label: "First Name",
    type: FieldType.TEXT,
    required: true,
    validation: [
      {
        type: ValidationRuleType.REQUIRED,
        message: "First name is required",
      },
    ],
    section: "basicInfo",
    order: 3,
  },
  {
    id: "lastName",
    name: "lastName",
    label: "Last Name",
    type: FieldType.TEXT,
    required: true,
    validation: [
      {
        type: ValidationRuleType.REQUIRED,
        message: "Last name is required",
      },
    ],
    section: "basicInfo",
    order: 4,
  },
  {
    id: "password",
    name: "password",
    label: "Password",
    type: FieldType.PASSWORD,
    required: true,
    validation: [
      {
        type: ValidationRuleType.REQUIRED,
        message: "Password is required",
      },
      {
        type: ValidationRuleType.MIN_LENGTH,
        value: 8,
        message: "Password must be at least 8 characters",
      },
      {
        type: ValidationRuleType.PATTERN,
        value:
          "^(?=.*[a-z])(?=.*[A-Z])(?=.*d)(?=.*[@$!%*?&])[A-Za-zd@$!%*?&]+$",
        message:
          "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
      },
    ],
    section: "authentication",
    order: 1,
  },
  {
    id: "confirmPassword",
    name: "confirmPassword",
    label: "Confirm Password",
    type: FieldType.PASSWORD,
    required: true,
    validation: [
      {
        type: ValidationRuleType.REQUIRED,
        message: "Please confirm your password",
      },
      {
        type: ValidationRuleType.CUSTOM,
        value: "password === confirmPassword",
        message: "Passwords do not match",
      },
    ],
    section: "authentication",
    order: 2,
  },
  {
    id: "roleIds",
    name: "roleIds",
    label: "Roles",
    type: FieldType.MULTISELECT,
    required: true,
    dataSource: {
      type: "api",
      source: "/api/roles",
      valueField: "id",
      labelField: "name",
    },
    validation: [
      {
        type: ValidationRuleType.REQUIRED,
        message: "At least one role is required",
      },
    ],
    section: "roles",
    order: 1,
  },
  {
    id: "departmentId",
    name: "departmentId",
    label: "Department",
    type: FieldType.SELECT,
    dataSource: {
      type: "api",
      source: "/api/departments",
      valueField: "id",
      labelField: "name",
    },
    section: "organization",
    order: 1,
  },
  {
    id: "position",
    name: "position",
    label: "Position",
    type: FieldType.TEXT,
    section: "organization",
    order: 2,
  },
  {
    id: "phoneNumber",
    name: "phoneNumber",
    label: "Phone Number",
    type: FieldType.PHONE,
    section: "contactInfo",
    order: 1,
  },
  {
    id: "mobileNumber",
    name: "mobileNumber",
    label: "Mobile Number",
    type: FieldType.PHONE,
    section: "contactInfo",
    order: 2,
  },
  {
    id: "address",
    name: "address",
    label: "Address",
    type: FieldType.TEXTAREA,
    section: "contactInfo",
    order: 3,
  },
  {
    id: "profileImage",
    name: "profileImage",
    label: "Profile Image",
    type: FieldType.IMAGE,
    section: "profileSettings",
    order: 1,
  },
  {
    id: "languagePreference",
    name: "languagePreference",
    label: "Language Preference",
    type: FieldType.SELECT,
    options: [
      { value: "en", label: "English" },
      { value: "ar", label: "Arabic" },
    ],
    defaultValue: "en",
    section: "profileSettings",
    order: 2,
  },
  {
    id: "isActive",
    name: "isActive",
    label: "Active",
    type: FieldType.CHECKBOX,
    defaultValue: true,
    section: "accountStatus",
    order: 1,
  },
  {
    id: "accountExpiryDate",
    name: "accountExpiryDate",
    label: "Account Expiry Date",
    type: FieldType.DATE,
    section: "accountStatus",
    order: 2,
  },
  {
    id: "notes",
    name: "notes",
    label: "Notes",
    type: FieldType.TEXTAREA,
    placeholder: "Enter any additional notes",
    section: "additionalInfo",
    order: 1,
  },
];

const userManagementSections: FormSection[] = [
  {
    id: "basicInfo",
    title: "Basic Information",
    description: "Enter the basic user information",
    order: 1,
  },
  {
    id: "authentication",
    title: "Authentication",
    description: "Set user password",
    order: 2,
  },
  {
    id: "roles",
    title: "Roles",
    description: "Assign roles to the user",
    order: 3,
  },
  {
    id: "organization",
    title: "Organization",
    description: "Enter department and position information",
    order: 4,
  },
  {
    id: "contactInfo",
    title: "Contact Information",
    description: "Enter user contact details",
    order: 5,
  },
  {
    id: "profileSettings",
    title: "Profile Settings",
    description: "Configure user profile settings",
    order: 6,
  },
  {
    id: "accountStatus",
    title: "Account Status",
    description: "Set account status and expiry",
    order: 7,
  },
  {
    id: "additionalInfo",
    title: "Additional Information",
    description: "Add any additional notes",
    order: 8,
  },
];

const userManagementMetadata: FormMetadata = {
  id: "user-management-form",
  title: "User Management Form",
  description: "Form for creating and managing users",
  module: FormModule.ADMINISTRATION,
  version: "1.0.0",
  permissions: {
    [FormPermission.VIEW]: ["admin", "user_manager"],
    [FormPermission.CREATE]: ["admin", "user_manager"],
    [FormPermission.EDIT]: ["admin", "user_manager"],
    [FormPermission.DELETE]: ["admin"],
    [FormPermission.APPROVE]: ["admin"],
    [FormPermission.REJECT]: ["admin"],
    [FormPermission.SUBMIT]: ["admin", "user_manager"],
    [FormPermission.PRINT]: ["admin", "user_manager"],
    [FormPermission.EXPORT]: ["admin"],
  },
  clientTypes: [
    ClientType.FDF,
    ClientType.ADHA,
    ClientType.CASH,
    ClientType.OTHER,
  ],
  sections: userManagementSections,
  fields: userManagementFormFields,
  dependencies: [],
  workflow: "user-approval-workflow",
  submitEndpoint: "/api/users",
  fetchDataEndpoint: "/api/users/{id}",
  createdAt: new Date(),
  updatedAt: new Date(),
  isActive: true,
};

const userManagementEntry: FormRegistryEntry = {
  id: "user-management-form",
  title: "User Management Form",
  description: "Form for creating and managing users",
  module: FormModule.ADMINISTRATION,
  clientTypes: [
    ClientType.FDF,
    ClientType.ADHA,
    ClientType.CASH,
    ClientType.OTHER,
  ],
  permissions: userManagementMetadata.permissions,
  dependencies: userManagementMetadata.dependencies,
  version: "1.0.0",
  path: "/forms/admin/users",
  icon: "User",
  isActive: true,
};

// Role Management Form
const roleManagementFormFields: FormField[] = [
  {
    id: "roleName",
    name: "roleName",
    label: "Role Name",
    type: FieldType.TEXT,
    required: true,
    validation: [
      {
        type: ValidationRuleType.REQUIRED,
        message: "Role name is required",
      },
    ],
    section: "basicInfo",
    order: 1,
  },
  {
    id: "roleDescription",
    name: "roleDescription",
    label: "Description",
    type: FieldType.TEXTAREA,
    placeholder: "Enter role description",
    section: "basicInfo",
    order: 2,
  },
  {
    id: "permissionIds",
    name: "permissionIds",
    label: "Permissions",
    type: FieldType.MULTISELECT,
    required: true,
    dataSource: {
      type: "api",
      source: "/api/permissions",
      valueField: "id",
      labelField: "name",
    },
    validation: [
      {
        type: ValidationRuleType.REQUIRED,
        message: "At least one permission is required",
      },
    ],
    section: "permissions",
    order: 1,
  },
  {
    id: "isSystemRole",
    name: "isSystemRole",
    label: "System Role",
    type: FieldType.CHECKBOX,
    defaultValue: false,
    section: "roleSettings",
    order: 1,
  },
  {
    id: "isActive",
    name: "isActive",
    label: "Active",
    type: FieldType.CHECKBOX,
    defaultValue: true,
    section: "roleSettings",
    order: 2,
  },
  {
    id: "notes",
    name: "notes",
    label: "Notes",
    type: FieldType.TEXTAREA,
    placeholder: "Enter any additional notes",
    section: "additionalInfo",
    order: 1,
  },
];

const roleManagementSections: FormSection[] = [
  {
    id: "basicInfo",
    title: "Basic Information",
    description: "Enter the basic role information",
    order: 1,
  },
  {
    id: "permissions",
    title: "Permissions",
    description: "Assign permissions to the role",
    order: 2,
  },
  {
    id: "roleSettings",
    title: "Role Settings",
    description: "Configure role settings",
    order: 3,
  },
  {
    id: "additionalInfo",
    title: "Additional Information",
    description: "Add any additional notes",
    order: 4,
  },
];

const roleManagementMetadata: FormMetadata = {
  id: "role-management-form",
  title: "Role Management Form",
  description: "Form for creating and managing roles",
  module: FormModule.ADMINISTRATION,
  version: "1.0.0",
  permissions: {
    [FormPermission.VIEW]: ["admin"],
    [FormPermission.CREATE]: ["admin"],
    [FormPermission.EDIT]: ["admin"],
    [FormPermission.DELETE]: ["admin"],
    [FormPermission.APPROVE]: ["admin"],
    [FormPermission.REJECT]: ["admin"],
    [FormPermission.SUBMIT]: ["admin"],
    [FormPermission.PRINT]: ["admin"],
    [FormPermission.EXPORT]: ["admin"],
  },
  clientTypes: [
    ClientType.FDF,
    ClientType.ADHA,
    ClientType.CASH,
    ClientType.OTHER,
  ],
  sections: roleManagementSections,
  fields: roleManagementFormFields,
  dependencies: [],
  workflow: "",
  submitEndpoint: "/api/roles",
  fetchDataEndpoint: "/api/roles/{id}",
  createdAt: new Date(),
  updatedAt: new Date(),
  isActive: true,
};

const roleManagementEntry: FormRegistryEntry = {
  id: "role-management-form",
  title: "Role Management Form",
  description: "Form for creating and managing roles",
  module: FormModule.ADMINISTRATION,
  clientTypes: [
    ClientType.FDF,
    ClientType.ADHA,
    ClientType.CASH,
    ClientType.OTHER,
  ],
  permissions: roleManagementMetadata.permissions,
  dependencies: roleManagementMetadata.dependencies,
  version: "1.0.0",
  path: "/forms/admin/roles",
  icon: "Shield",
  isActive: true,
};

// Permission Management Form
const permissionManagementFormFields: FormField[] = [
  {
    id: "permissionName",
    name: "permissionName",
    label: "Permission Name",
    type: FieldType.TEXT,
    required: true,
    validation: [
      {
        type: ValidationRuleType.REQUIRED,
        message: "Permission name is required",
      },
    ],
    section: "basicInfo",
    order: 1,
  },
  {
    id: "permissionKey",
    name: "permissionKey",
    label: "Permission Key",
    type: FieldType.TEXT,
    required: true,
    validation: [
      {
        type: ValidationRuleType.REQUIRED,
        message: "Permission key is required",
      },
      {
        type: ValidationRuleType.PATTERN,
        value: "^[a-z_]+$",
        message:
          "Permission key must contain only lowercase letters and underscores",
      },
    ],
    section: "basicInfo",
    order: 2,
  },
  {
    id: "description",
    name: "description",
    label: "Description",
    type: FieldType.TEXTAREA,
    placeholder: "Enter permission description",
    section: "basicInfo",
    order: 3,
  },
  {
    id: "moduleId",
    name: "moduleId",
    label: "Module",
    type: FieldType.SELECT,
    required: true,
    dataSource: {
      type: "api",
      source: "/api/modules",
      valueField: "id",
      labelField: "name",
    },
    validation: [
      {
        type: ValidationRuleType.REQUIRED,
        message: "Module is required",
      },
    ],
    section: "basicInfo",
    order: 4,
  },
  {
    id: "isSystemPermission",
    name: "isSystemPermission",
    label: "System Permission",
    type: FieldType.CHECKBOX,
    defaultValue: false,
    section: "permissionSettings",
    order: 1,
  },
  {
    id: "isActive",
    name: "isActive",
    label: "Active",
    type: FieldType.CHECKBOX,
    defaultValue: true,
    section: "permissionSettings",
    order: 2,
  },
  {
    id: "notes",
    name: "notes",
    label: "Notes",
    type: FieldType.TEXTAREA,
    placeholder: "Enter any additional notes",
    section: "additionalInfo",
    order: 1,
  },
];

const permissionManagementSections: FormSection[] = [
  {
    id: "basicInfo",
    title: "Basic Information",
    description: "Enter the basic permission information",
    order: 1,
  },
  {
    id: "permissionSettings",
    title: "Permission Settings",
    description: "Configure permission settings",
    order: 2,
  },
  {
    id: "additionalInfo",
    title: "Additional Information",
    description: "Add any additional notes",
    order: 3,
  },
];

const permissionManagementMetadata: FormMetadata = {
  id: "permission-management-form",
  title: "Permission Management Form",
  description: "Form for creating and managing permissions",
  module: FormModule.ADMINISTRATION,
  version: "1.0.0",
  permissions: {
    [FormPermission.VIEW]: ["admin"],
    [FormPermission.CREATE]: ["admin"],
    [FormPermission.EDIT]: ["admin"],
    [FormPermission.DELETE]: ["admin"],
    [FormPermission.APPROVE]: ["admin"],
    [FormPermission.REJECT]: ["admin"],
    [FormPermission.SUBMIT]: ["admin"],
    [FormPermission.PRINT]: ["admin"],
    [FormPermission.EXPORT]: ["admin"],
  },
  clientTypes: [
    ClientType.FDF,
    ClientType.ADHA,
    ClientType.CASH,
    ClientType.OTHER,
  ],
  sections: permissionManagementSections,
  fields: permissionManagementFormFields,
  dependencies: [],
  workflow: "",
  submitEndpoint: "/api/permissions",
  fetchDataEndpoint: "/api/permissions/{id}",
  createdAt: new Date(),
  updatedAt: new Date(),
  isActive: true,
};

const permissionManagementEntry: FormRegistryEntry = {
  id: "permission-management-form",
  title: "Permission Management Form",
  description: "Form for creating and managing permissions",
  module: FormModule.ADMINISTRATION,
  clientTypes: [
    ClientType.FDF,
    ClientType.ADHA,
    ClientType.CASH,
    ClientType.OTHER,
  ],
  permissions: permissionManagementMetadata.permissions,
  dependencies: permissionManagementMetadata.dependencies,
  version: "1.0.0",
  path: "/forms/admin/permissions",
  icon: "Lock",
  isActive: true,
};

// System Configuration Form
const systemConfigurationFormFields: FormField[] = [
  {
    id: "configKey",
    name: "configKey",
    label: "Configuration Key",
    type: FieldType.TEXT,
    required: true,
    validation: [
      {
        type: ValidationRuleType.REQUIRED,
        message: "Configuration key is required",
      },
      {
        type: ValidationRuleType.PATTERN,
        value: "^[A-Z_]+$",
        message:
          "Configuration key must contain only uppercase letters and underscores",
      },
    ],
    section: "basicInfo",
    order: 1,
  },
  {
    id: "configValue",
    name: "configValue",
    label: "Configuration Value",
    type: FieldType.TEXT,
    required: true,
    validation: [
      {
        type: ValidationRuleType.REQUIRED,
        message: "Configuration value is required",
      },
    ],
    section: "basicInfo",
    order: 2,
  },
  {
    id: "dataType",
    name: "dataType",
    label: "Data Type",
    type: FieldType.SELECT,
    required: true,
    options: [
      { value: "string", label: "String" },
      { value: "number", label: "Number" },
      { value: "boolean", label: "Boolean" },
      { value: "json", label: "JSON" },
      { value: "date", label: "Date" },
    ],
    defaultValue: "string",
    validation: [
      {
        type: ValidationRuleType.REQUIRED,
        message: "Data type is required",
      },
    ],
    section: "basicInfo",
    order: 3,
  },
  {
    id: "description",
    name: "description",
    label: "Description",
    type: FieldType.TEXTAREA,
    placeholder: "Enter configuration description",
    section: "basicInfo",
    order: 4,
  },
  {
    id: "moduleId",
    name: "moduleId",
    label: "Module",
    type: FieldType.SELECT,
    dataSource: {
      type: "api",
      source: "/api/modules",
      valueField: "id",
      labelField: "name",
    },
    section: "basicInfo",
    order: 5,
  },
  {
    id: "isSystem",
    name: "isSystem",
    label: "System Configuration",
    type: FieldType.CHECKBOX,
    defaultValue: false,
    section: "configSettings",
    order: 1,
  },
  {
    id: "isEncrypted",
    name: "isEncrypted",
    label: "Encrypted Value",
    type: FieldType.CHECKBOX,
    defaultValue: false,
    section: "configSettings",
    order: 2,
  },
  {
    id: "isClientSpecific",
    name: "isClientSpecific",
    label: "Client Specific",
    type: FieldType.CHECKBOX,
    defaultValue: false,
    section: "configSettings",
    order: 3,
  },
  {
    id: "clientTypeOverrides",
    name: "clientTypeOverrides",
    label: "Client Type Overrides",
    type: FieldType.REPEATER,
    conditional: { field: "isClientSpecific", operator: "==", value: true },
    section: "clientOverrides",
    order: 1,
    defaultValue: [
      {
        clientType: "",
        configValue: "",
      },
    ],
  },
  {
    id: "isActive",
    name: "isActive",
    label: "Active",
    type: FieldType.CHECKBOX,
    defaultValue: true,
    section: "configSettings",
    order: 4,
  },
  {
    id: "notes",
    name: "notes",
    label: "Notes",
    type: FieldType.TEXTAREA,
    placeholder: "Enter any additional notes",
    section: "additionalInfo",
    order: 1,
  },
];

const systemConfigurationSections: FormSection[] = [
  {
    id: "basicInfo",
    title: "Basic Information",
    description: "Enter the basic configuration information",
    order: 1,
  },
  {
    id: "configSettings",
    title: "Configuration Settings",
    description: "Configure system settings",
    order: 2,
  },
  {
    id: "clientOverrides",
    title: "Client Type Overrides",
    description: "Configure client-specific overrides",
    order: 3,
    conditional: { field: "isClientSpecific", operator: "==", value: true },
  },
  {
    id: "additionalInfo",
    title: "Additional Information",
    description: "Add any additional notes",
    order: 4,
  },
];

const systemConfigurationMetadata: FormMetadata = {
  id: "system-configuration-form",
  title: "System Configuration Form",
  description: "Form for managing system configurations",
  module: FormModule.ADMINISTRATION,
  version: "1.0.0",
  permissions: {
    [FormPermission.VIEW]: ["admin", "system_admin"],
    [FormPermission.CREATE]: ["admin", "system_admin"],
    [FormPermission.EDIT]: ["admin", "system_admin"],
    [FormPermission.DELETE]: ["admin"],
    [FormPermission.APPROVE]: ["admin"],
    [FormPermission.REJECT]: ["admin"],
    [FormPermission.SUBMIT]: ["admin", "system_admin"],
    [FormPermission.PRINT]: ["admin", "system_admin"],
    [FormPermission.EXPORT]: ["admin"],
  },
  clientTypes: [
    ClientType.FDF,
    ClientType.ADHA,
    ClientType.CASH,
    ClientType.OTHER,
  ],
  sections: systemConfigurationSections,
  fields: systemConfigurationFormFields,
  dependencies: [],
  workflow: "config-approval-workflow",
  submitEndpoint: "/api/system/configurations",
  fetchDataEndpoint: "/api/system/configurations/{id}",
  createdAt: new Date(),
  updatedAt: new Date(),
  isActive: true,
};

const systemConfigurationEntry: FormRegistryEntry = {
  id: "system-configuration-form",
  title: "System Configuration Form",
  description: "Form for managing system configurations",
  module: FormModule.ADMINISTRATION,
  clientTypes: [
    ClientType.FDF,
    ClientType.ADHA,
    ClientType.CASH,
    ClientType.OTHER,
  ],
  permissions: systemConfigurationMetadata.permissions,
  dependencies: systemConfigurationMetadata.dependencies,
  version: "1.0.0",
  path: "/forms/admin/configurations",
  icon: "Settings",
  isActive: true,
};

// Audit Log Form
const auditLogFormFields: FormField[] = [
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
    section: "dateRange",
    order: 1,
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
    section: "dateRange",
    order: 2,
  },
  {
    id: "userId",
    name: "userId",
    label: "User",
    type: FieldType.SELECT,
    dataSource: {
      type: "api",
      source: "/api/users",
      valueField: "id",
      labelField: "username",
    },
    section: "filters",
    order: 1,
  },
  {
    id: "actionType",
    name: "actionType",
    label: "Action Type",
    type: FieldType.SELECT,
    options: [
      { value: "create", label: "Create" },
      { value: "read", label: "Read" },
      { value: "update", label: "Update" },
      { value: "delete", label: "Delete" },
      { value: "login", label: "Login" },
      { value: "logout", label: "Logout" },
      { value: "export", label: "Export" },
      { value: "import", label: "Import" },
      { value: "approve", label: "Approve" },
      { value: "reject", label: "Reject" },
      { value: "other", label: "Other" },
    ],
    section: "filters",
    order: 2,
  },
  {
    id: "moduleId",
    name: "moduleId",
    label: "Module",
    type: FieldType.SELECT,
    dataSource: {
      type: "api",
      source: "/api/modules",
      valueField: "id",
      labelField: "name",
    },
    section: "filters",
    order: 3,
  },
  {
    id: "entityType",
    name: "entityType",
    label: "Entity Type",
    type: FieldType.TEXT,
    placeholder: "e.g., User, Role, Project",
    section: "filters",
    order: 4,
  },
  {
    id: "entityId",
    name: "entityId",
    label: "Entity ID",
    type: FieldType.TEXT,
    section: "filters",
    order: 5,
  },
  {
    id: "ipAddress",
    name: "ipAddress",
    label: "IP Address",
    type: FieldType.TEXT,
    section: "filters",
    order: 6,
  },
  {
    id: "status",
    name: "status",
    label: "Status",
    type: FieldType.SELECT,
    options: [
      { value: "success", label: "Success" },
      { value: "failure", label: "Failure" },
      { value: "warning", label: "Warning" },
      { value: "info", label: "Information" },
    ],
    section: "filters",
    order: 7,
  },
  {
    id: "includeDetails",
    name: "includeDetails",
    label: "Include Details",
    type: FieldType.CHECKBOX,
    defaultValue: true,
    section: "displayOptions",
    order: 1,
  },
  {
    id: "sortBy",
    name: "sortBy",
    label: "Sort By",
    type: FieldType.SELECT,
    options: [
      { value: "timestamp", label: "Timestamp" },
      { value: "user", label: "User" },
      { value: "action", label: "Action" },
      { value: "module", label: "Module" },
      { value: "status", label: "Status" },
    ],
    defaultValue: "timestamp",
    section: "displayOptions",
    order: 2,
  },
  {
    id: "sortOrder",
    name: "sortOrder",
    label: "Sort Order",
    type: FieldType.SELECT,
    options: [
      { value: "desc", label: "Descending" },
      { value: "asc", label: "Ascending" },
    ],
    defaultValue: "desc",
    section: "displayOptions",
    order: 3,
  },
  {
    id: "pageSize",
    name: "pageSize",
    label: "Page Size",
    type: FieldType.SELECT,
    options: [
      { value: "10", label: "10" },
      { value: "25", label: "25" },
      { value: "50", label: "50" },
      { value: "100", label: "100" },
      { value: "all", label: "All" },
    ],
    defaultValue: "25",
    section: "displayOptions",
    order: 4,
  },
  {
    id: "exportFormat",
    name: "exportFormat",
    label: "Export Format",
    type: FieldType.SELECT,
    options: [
      { value: "pdf", label: "PDF" },
      { value: "excel", label: "Excel" },
      { value: "csv", label: "CSV" },
    ],
    defaultValue: "excel",
    section: "exportOptions",
    order: 1,
  },
];

const auditLogSections: FormSection[] = [
  {
    id: "dateRange",
    title: "Date Range",
    description: "Select the date range for audit logs",
    order: 1,
  },
  {
    id: "filters",
    title: "Filters",
    description: "Filter audit logs by various criteria",
    order: 2,
  },
  {
    id: "displayOptions",
    title: "Display Options",
    description: "Configure how audit logs are displayed",
    order: 3,
  },
  {
    id: "exportOptions",
    title: "Export Options",
    description: "Configure export settings",
    order: 4,
  },
];

const auditLogMetadata: FormMetadata = {
  id: "audit-log-form",
  title: "Audit Log Form",
  description: "Form for viewing and exporting audit logs",
  module: FormModule.ADMINISTRATION,
  version: "1.0.0",
  permissions: {
    [FormPermission.VIEW]: ["admin", "system_admin", "auditor"],
    [FormPermission.CREATE]: [],
    [FormPermission.EDIT]: [],
    [FormPermission.DELETE]: [],
    [FormPermission.APPROVE]: [],
    [FormPermission.REJECT]: [],
    [FormPermission.SUBMIT]: ["admin", "system_admin", "auditor"],
    [FormPermission.PRINT]: ["admin", "system_admin", "auditor"],
    [FormPermission.EXPORT]: ["admin", "system_admin", "auditor"],
  },
  clientTypes: [
    ClientType.FDF,
    ClientType.ADHA,
    ClientType.CASH,
    ClientType.OTHER,
  ],
  sections: auditLogSections,
  fields: auditLogFormFields,
  dependencies: [],
  workflow: "",
  submitEndpoint: "/api/system/audit-logs/search",
  fetchDataEndpoint: "/api/system/audit-logs",
  createdAt: new Date(),
  updatedAt: new Date(),
  isActive: true,
};

const auditLogEntry: FormRegistryEntry = {
  id: "audit-log-form",
  title: "Audit Log Form",
  description: "Form for viewing and exporting audit logs",
  module: FormModule.ADMINISTRATION,
  clientTypes: [
    ClientType.FDF,
    ClientType.ADHA,
    ClientType.CASH,
    ClientType.OTHER,
  ],
  permissions: auditLogMetadata.permissions,
  dependencies: auditLogMetadata.dependencies,
  version: "1.0.0",
  path: "/forms/admin/audit-logs",
  icon: "FileSearch",
  isActive: true,
};

// Register all forms
export function registeradminform() {
  formRegistry.registerForm(userManagementEntry, userManagementMetadata);
  formRegistry.registerForm(roleManagementEntry, roleManagementMetadata);
  formRegistry.registerForm(
    permissionManagementEntry,
    permissionManagementMetadata,
  );
  formRegistry.registerForm(
    systemConfigurationEntry,
    systemConfigurationMetadata,
  );
  formRegistry.registerForm(auditLogEntry, auditLogMetadata);


}
