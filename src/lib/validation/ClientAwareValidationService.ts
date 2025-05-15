import { ClientType } from "../forms/types";
import {
  ValidationContext,
  ValidationResult,
  ValidationRule,
  ValidationRuleType,
  ValidationSeverity,
  ValidationError,
} from "./types";
import mockValidationRules from "./mockValidationRules";

class ClientAwareValidationService {
  private validationRules: ValidationRule[] = [];
  private static instance: ClientAwareValidationService;

  private constructor() {
    // Private constructor for singleton pattern
  }

  public static getInstance(): ClientAwareValidationService {
    if (!ClientAwareValidationService.instance) {
      ClientAwareValidationService.instance =
        new ClientAwareValidationService();
    }
    return ClientAwareValidationService.instance;
  }

  /**
   * Load validation rules from storage or API
   */
  public async loadValidationRules(): Promise<void> {
    try {
      // In a real implementation, this would load from an API or database
      // For now, we'll use mock data
      this.validationRules = mockValidationRules;
    } catch (error) {
      console.error("Failed to load validation rules:", error);
      this.validationRules = [];
    }
  }

  /**
   * Get validation rules for a specific form and client type
   */
  public getValidationRulesForForm(
    formId: string,
    clientType: ClientType,
  ): ValidationRule[] {
    return this.validationRules.filter(
      (rule) =>
        rule.formId === formId &&
        rule.clientTypes.includes(clientType) &&
        rule.isActive,
    );
  }

  /**
   * Validate a form against all applicable rules
   */
  public validateForm(context: ValidationContext): ValidationResult {
    const { formId, clientType, formData } = context;
    const applicableRules = this.getValidationRulesForForm(formId, clientType);

    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];
    const infos: ValidationError[] = [];

    for (const rule of applicableRules) {
      // Skip validation if field doesn't exist in the form data
      if (
        !(rule.fieldId in formData) &&
        rule.type !== ValidationRuleType.REQUIRED
      ) {
        continue;
      }

      // Skip dependent validation if the condition isn't met
      if (rule.type === ValidationRuleType.DEPENDENT && rule.dependentField) {
        if (!this.evaluateDependentCondition(rule, formData)) {
          continue;
        }
      }

      const fieldValue = formData[rule.fieldId];
      const isValid = this.validateField(fieldValue, rule, context);

      if (!isValid) {
        const validationError: ValidationError = {
          fieldId: rule.fieldId,
          message: rule.message,
          severity: rule.severity,
          ruleId: rule.id,
        };

        switch (rule.severity) {
          case ValidationSeverity.ERROR:
            errors.push(validationError);
            break;
          case ValidationSeverity.WARNING:
            warnings.push(validationError);
            break;
          case ValidationSeverity.INFO:
            infos.push(validationError);
            break;
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      infos,
    };
  }

  /**
   * Validate a single field against a rule
   */
  private validateField(
    value: any,
    rule: ValidationRule,
    context: ValidationContext,
  ): boolean {
    switch (rule.type) {
      case ValidationRuleType.REQUIRED:
        return value !== undefined && value !== null && value !== "";

      case ValidationRuleType.MIN_LENGTH:
        return (
          value === undefined ||
          value === null ||
          String(value).length >= (rule.params?.minLength || 0)
        );

      case ValidationRuleType.MAX_LENGTH:
        return (
          value === undefined ||
          value === null ||
          String(value).length <= (rule.params?.maxLength || 0)
        );

      case ValidationRuleType.MIN_VALUE:
        return (
          value === undefined ||
          value === null ||
          Number(value) >= (rule.params?.minValue || 0)
        );

      case ValidationRuleType.MAX_VALUE:
        return (
          value === undefined ||
          value === null ||
          Number(value) <= (rule.params?.maxValue || 0)
        );

      case ValidationRuleType.PATTERN:
        if (value === undefined || value === null || value === "") return true;
        try {
          const pattern = new RegExp(rule.params?.pattern || "");
          return pattern.test(String(value));
        } catch (e) {
          console.error("Invalid regex pattern:", rule.params?.pattern);
          return true;
        }

      case ValidationRuleType.EMAIL:
        if (value === undefined || value === null || value === "") return true;
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailPattern.test(String(value));

      case ValidationRuleType.PHONE:
        if (value === undefined || value === null || value === "") return true;
        // Simple phone validation - can be enhanced based on regional requirements
        const phonePattern = /^\+?[0-9\s-()]{8,20}$/;
        return phonePattern.test(String(value));

      case ValidationRuleType.DATE:
        if (value === undefined || value === null || value === "") return true;
        const date = new Date(value);
        return !isNaN(date.getTime());

      case ValidationRuleType.CUSTOM:
        try {
          if (rule.customValidationFn) {
            // Create a function from the string representation
            // This is potentially unsafe and should be handled carefully in production
            const validationFn = new Function(
              "value",
              "formData",
              "context",
              rule.customValidationFn,
            );
            return validationFn(value, context.formData, context);
          }
          return true;
        } catch (e) {
          console.error("Error in custom validation function:", e);
          return true;
        }

      case ValidationRuleType.DEPENDENT:
        // Already checked if the dependent condition is met
        // Now validate the actual field value
        return this.validateDependentField(value, rule, context);

      default:
        return true;
    }
  }

  /**
   * Evaluate a dependent condition
   */
  private evaluateDependentCondition(
    rule: ValidationRule,
    formData: Record<string, any>,
  ): boolean {
    if (!rule.dependentField || !rule.dependentCondition) {
      return true;
    }

    try {
      const dependentValue = formData[rule.dependentField];
      // Create a function from the condition string
      const conditionFn = new Function(
        "dependentValue",
        "formData",
        `return ${rule.dependentCondition}`,
      );
      return conditionFn(dependentValue, formData);
    } catch (e) {
      console.error("Error evaluating dependent condition:", e);
      return true;
    }
  }

  /**
   * Validate a field that depends on another field
   */
  private validateDependentField(
    value: any,
    rule: ValidationRule,
    context: ValidationContext,
  ): boolean {
    // The dependent condition is already met at this point
    // Now validate based on the rule parameters
    if (rule.params?.validationType) {
      // Create a temporary rule with the specified validation type
      const tempRule: ValidationRule = {
        ...rule,
        type: rule.params.validationType as ValidationRuleType,
      };
      return this.validateField(value, tempRule, context);
    }
    return true;
  }

  /**
   * Add or update a validation rule
   */
  public async saveValidationRule(
    rule: ValidationRule,
  ): Promise<ValidationRule> {
    try {
      // Check if rule already exists
      const existingRuleIndex = this.validationRules.findIndex(
        (r) => r.id === rule.id,
      );

      if (existingRuleIndex >= 0) {
        // Update existing rule
        const updatedRule = {
          ...rule,
          updatedAt: new Date().toISOString(),
          version: this.validationRules[existingRuleIndex].version + 1,
        };
        this.validationRules[existingRuleIndex] = updatedRule;
        return updatedRule;
      } else {
        // Add new rule
        const newRule = {
          ...rule,
          id: rule.id || `rule_${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          version: 1,
        };
        this.validationRules.push(newRule);
        return newRule;
      }
    } catch (error) {
      console.error("Failed to save validation rule:", error);
      throw error;
    }
  }

  /**
   * Delete a validation rule
   */
  public async deleteValidationRule(ruleId: string): Promise<boolean> {
    try {
      const initialLength = this.validationRules.length;
      this.validationRules = this.validationRules.filter(
        (rule) => rule.id !== ruleId,
      );
      return this.validationRules.length < initialLength;
    } catch (error) {
      console.error("Failed to delete validation rule:", error);
      throw error;
    }
  }

  /**
   * Test a validation rule against sample data
   */
  public testValidationRule(
    rule: ValidationRule,
    sampleData: Record<string, any>,
    clientType: ClientType,
  ): { isValid: boolean; message: string } {
    try {
      // Create a context for validation
      const context: ValidationContext = {
        formId: rule.formId,
        clientType,
        userId: "test-user",
        formData: sampleData,
      };

      // Validate the field
      const isValid = this.validateField(
        sampleData[rule.fieldId],
        rule,
        context,
      );

      return {
        isValid,
        message: isValid ? "Validation passed" : rule.message,
      };
    } catch (error) {
      console.error("Error testing validation rule:", error);
      return {
        isValid: false,
        message: `Error: ${error.message}`,
      };
    }
  }
}

export const validationService = ClientAwareValidationService.getInstance();
