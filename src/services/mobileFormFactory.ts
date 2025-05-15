// Mobile Form Factory for Barakatna Platform
// Generates field-optimized forms with responsive layouts
// Provides touch-friendly controls

import React from "react";

// Define form field types
export enum FieldType {
  Text = "text",
  Number = "number",
  Email = "email",
  Phone = "phone",
  Date = "date",
  Time = "time",
  DateTime = "datetime",
  Select = "select",
  MultiSelect = "multiselect",
  Checkbox = "checkbox",
  Radio = "radio",
  TextArea = "textarea",
  File = "file",
  Image = "image",
  Signature = "signature",
  Location = "location",
  Hidden = "hidden",
}

// Define validation rule types
export enum ValidationRuleType {
  Required = "required",
  MinLength = "minLength",
  MaxLength = "maxLength",
  Min = "min",
  Max = "max",
  Pattern = "pattern",
  Email = "email",
  Phone = "phone",
  Custom = "custom",
}

// Define validation rule interface
export interface ValidationRule {
  type: ValidationRuleType;
  value?: any;
  message: string;
  customValidator?: (value: any) => boolean | Promise<boolean>;
}

// Define field option interface
export interface FieldOption {
  value: string;
  label: string;
  disabled?: boolean;
}

// Define form field interface
export interface FormField {
  id: string;
  name: string;
  type: FieldType;
  label: string;
  placeholder?: string;
  helpText?: string;
  defaultValue?: any;
  options?: FieldOption[];
  validationRules?: ValidationRule[];
  isRequired?: boolean;
  isDisabled?: boolean;
  isReadOnly?: boolean;
  isHidden?: boolean;
  dependsOn?: {
    field: string;
    value: any;
    condition?:
      | "equals"
      | "notEquals"
      | "contains"
      | "notContains"
      | "greaterThan"
      | "lessThan";
  };
  className?: string;
  style?: React.CSSProperties;
  mobileOptimized?: boolean;
  offlineCapable?: boolean;
  metadata?: Record<string, any>;
}

// Define form section interface
export interface FormSection {
  id: string;
  title: string;
  description?: string;
  fields: FormField[];
  isCollapsible?: boolean;
  isCollapsed?: boolean;
  isHidden?: boolean;
  dependsOn?: {
    field: string;
    value: any;
    condition?:
      | "equals"
      | "notEquals"
      | "contains"
      | "notContains"
      | "greaterThan"
      | "lessThan";
  };
  className?: string;
  style?: React.CSSProperties;
}

// Define form interface
export interface Form {
  id: string;
  name: string;
  description?: string;
  sections: FormSection[];
  submitButtonText?: string;
  cancelButtonText?: string;
  isMultiStep?: boolean;
  showProgressBar?: boolean;
  showStepTitles?: boolean;
  showSectionTitles?: boolean;
  className?: string;
  style?: React.CSSProperties;
  mobileOptimized?: boolean;
  offlineCapable?: boolean;
  metadata?: Record<string, any>;
}

// Define form submission result interface
export interface FormSubmissionResult {
  success: boolean;
  data?: any;
  errors?: Record<string, string>;
  message?: string;
}

// Define form validation result interface
export interface FormValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

// Mobile Form Factory class
export class MobileFormFactory {
  private static instance: MobileFormFactory;
  private formTemplates: Map<string, Form> = new Map();

  private constructor() {}

  public static getInstance(): MobileFormFactory {
    if (!MobileFormFactory.instance) {
      MobileFormFactory.instance = new MobileFormFactory();
    }
    return MobileFormFactory.instance;
  }

  // Register a form template
  public registerFormTemplate(form: Form): void {
    this.formTemplates.set(form.id, form);
  }

  // Get a form template by ID
  public getFormTemplate(formId: string): Form | undefined {
    return this.formTemplates.get(formId);
  }

  // Get all form templates
  public getAllFormTemplates(): Form[] {
    return Array.from(this.formTemplates.values());
  }

  // Create a new form instance from a template
  public createFormInstance(
    formId: string,
    initialData?: Record<string, any>,
  ): Form | null {
    const template = this.formTemplates.get(formId);
    if (!template) {
      return null;
    }

    // Deep clone the template
    const formInstance = JSON.parse(JSON.stringify(template)) as Form;

    // Generate a unique instance ID
    formInstance.id = `${formId}_${Date.now()}`;

    // Apply initial data if provided
    if (initialData) {
      this.applyDataToForm(formInstance, initialData);
    }

    return formInstance;
  }

  // Apply data to a form instance
  private applyDataToForm(form: Form, data: Record<string, any>): void {
    for (const section of form.sections) {
      for (const field of section.fields) {
        if (data[field.name] !== undefined) {
          field.defaultValue = data[field.name];
        }
      }
    }
  }

  // Validate a form
  public async validateForm(
    form: Form,
    formData: Record<string, any>,
  ): Promise<FormValidationResult> {
    const errors: Record<string, string> = {};

    for (const section of form.sections) {
      if (section.isHidden) continue;

      for (const field of section.fields) {
        if (field.isHidden || field.isDisabled) continue;

        const value = formData[field.name];

        // Check if field is dependent on another field
        if (field.dependsOn) {
          const dependentValue = formData[field.dependsOn.field];
          const shouldValidate = this.evaluateDependency(
            dependentValue,
            field.dependsOn.value,
            field.dependsOn.condition,
          );
          if (!shouldValidate) continue;
        }

        // Validate field
        if (field.validationRules) {
          for (const rule of field.validationRules) {
            const isValid = await this.validateField(value, rule);
            if (!isValid) {
              errors[field.name] = rule.message;
              break;
            }
          }
        }
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  // Validate a single field
  private async validateField(
    value: any,
    rule: ValidationRule,
  ): Promise<boolean> {
    switch (rule.type) {
      case ValidationRuleType.Required:
        return value !== undefined && value !== null && value !== "";

      case ValidationRuleType.MinLength:
        return (
          typeof value === "string" && value.length >= (rule.value as number)
        );

      case ValidationRuleType.MaxLength:
        return (
          typeof value === "string" && value.length <= (rule.value as number)
        );

      case ValidationRuleType.Min:
        return typeof value === "number" && value >= (rule.value as number);

      case ValidationRuleType.Max:
        return typeof value === "number" && value <= (rule.value as number);

      case ValidationRuleType.Pattern:
        return new RegExp(rule.value as string).test(value);

      case ValidationRuleType.Email:
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

      case ValidationRuleType.Phone:
        // Simple phone validation - can be enhanced for specific formats
        return /^\+?[0-9\s-()]{8,20}$/.test(value);

      case ValidationRuleType.Custom:
        if (rule.customValidator) {
          return await Promise.resolve(rule.customValidator(value));
        }
        return true;

      default:
        return true;
    }
  }

  // Evaluate a dependency condition
  private evaluateDependency(
    value: any,
    targetValue: any,
    condition?: string,
  ): boolean {
    switch (condition) {
      case "equals":
        return value === targetValue;

      case "notEquals":
        return value !== targetValue;

      case "contains":
        if (Array.isArray(value)) {
          return value.includes(targetValue);
        }
        if (typeof value === "string") {
          return value.includes(String(targetValue));
        }
        return false;

      case "notContains":
        if (Array.isArray(value)) {
          return !value.includes(targetValue);
        }
        if (typeof value === "string") {
          return !value.includes(String(targetValue));
        }
        return true;

      case "greaterThan":
        return typeof value === "number" && value > targetValue;

      case "lessThan":
        return typeof value === "number" && value < targetValue;

      default:
        // Default to equals
        return value === targetValue;
    }
  }

  // Extract data from a form
  public extractFormData(
    form: Form,
    formData: Record<string, any>,
  ): Record<string, any> {
    const result: Record<string, any> = {};

    for (const section of form.sections) {
      if (section.isHidden) continue;

      for (const field of section.fields) {
        if (field.isHidden) continue;

        // Check if field is dependent on another field
        if (field.dependsOn) {
          const dependentValue = formData[field.dependsOn.field];
          const shouldInclude = this.evaluateDependency(
            dependentValue,
            field.dependsOn.value,
            field.dependsOn.condition,
          );
          if (!shouldInclude) continue;
        }

        result[field.name] = formData[field.name];
      }
    }

    return result;
  }

  // Create a mobile-optimized version of a form
  public optimizeFormForMobile(form: Form): Form {
    const optimizedForm = JSON.parse(JSON.stringify(form)) as Form;
    optimizedForm.mobileOptimized = true;

    // Apply mobile optimizations to sections and fields
    for (const section of optimizedForm.sections) {
      // Make sections collapsible by default on mobile
      section.isCollapsible = true;

      for (const field of section.fields) {
        // Set mobile-optimized flag
        field.mobileOptimized = true;

        // Adjust field properties based on type
        switch (field.type) {
          case FieldType.Text:
          case FieldType.Email:
          case FieldType.Phone:
          case FieldType.Number:
            // Increase touch target size
            field.className = `${field.className || ""} mobile-input-lg`;
            break;

          case FieldType.Select:
          case FieldType.MultiSelect:
            // Use full-width select on mobile
            field.className = `${field.className || ""} mobile-select-full`;
            break;

          case FieldType.Checkbox:
          case FieldType.Radio:
            // Increase spacing between options
            field.className = `${field.className || ""} mobile-options-spaced`;
            break;

          case FieldType.Date:
          case FieldType.Time:
          case FieldType.DateTime:
            // Use native date/time pickers
            field.className = `${field.className || ""} mobile-native-picker`;
            break;

          case FieldType.File:
          case FieldType.Image:
            // Simplify file uploads
            field.className = `${field.className || ""} mobile-upload-simple`;
            break;

          case FieldType.Signature:
            // Optimize signature pad
            field.className = `${field.className || ""} mobile-signature-pad`;
            break;
        }
      }
    }

    return optimizedForm;
  }

  // Create an offline-capable version of a form
  public makeFormOfflineCapable(form: Form): Form {
    const offlineForm = JSON.parse(JSON.stringify(form)) as Form;
    offlineForm.offlineCapable = true;

    // Mark fields as offline-capable
    for (const section of offlineForm.sections) {
      for (const field of section.fields) {
        field.offlineCapable = true;
      }
    }

    return offlineForm;
  }
}

// Export default instance
export default MobileFormFactory.getInstance();
