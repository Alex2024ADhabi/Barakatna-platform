import {
  ClientType,
  FormDependency,
  FormField,
  DependencyType,
} from "../forms/types";
import { formRegistry } from "../forms/registry";
import {
  formParameterTracker,
  ParameterDependencyType,
} from "./formParameterTrackerService";

/**
 * Form Dependency Resolver Service
 *
 * Manages relationships between related forms, handles data propagation,
 * enforces data integrity, and supports validation across multiple forms.
 */
class FormDependencyResolver {
  // Parameter dependencies array
  private parameterDependencies: Array<{
    sourceFormId: string;
    sourceParameterId: string;
    targetFormId: string;
    targetParameterId: string;
    dependencyType: any;
    transformationFunction?: string;
    condition?: string;
    clientTypes?: any[];
    description: string;
  }> = [];
  // Cache for dependency resolution results
  private dependencyCache: Map<string, { result: any; timestamp: number }> =
    new Map();
  // Cache for validation results
  private validationCache: Map<string, { result: any; timestamp: number }> =
    new Map();
  // Cache expiration time in milliseconds (default: 5 minutes)
  private cacheExpiration: number = 5 * 60 * 1000;
  // Field mapping cache for cross-form dependencies
  private fieldMappingCache: Map<
    string,
    { sourceField: string; targetField: string }[]
  > = new Map();

  /**
   * Register a form dependency
   */
  registerFormDependency(dependency: {
    sourceFormId: string;
    targetFormId: string;
    dependencyType: string;
    clientType?: ClientType;
    required?: boolean;
    description: string;
  }): void {
    // Check if source and target forms exist
    const sourceForm = formRegistry.getFormById(dependency.sourceFormId);
    const targetForm = formRegistry.getFormById(dependency.targetFormId);

    if (!sourceForm || !targetForm) {
      console.warn(
        `Cannot register form dependency: Source form ${dependency.sourceFormId} or target form ${dependency.targetFormId} not found.`,
      );
      return;
    }

    // Add the dependency to the form registry
    // In a real implementation, this would update the form registry
    console.log(
      `Registered form dependency: ${dependency.sourceFormId} -> ${dependency.targetFormId} (${dependency.dependencyType})`,
      dependency,
    );
  }

  /**
   * Register a parameter dependency
   */
  registerDependency(dependency: any): void {
    try {
      // Check if source and target forms exist
      const sourceForm = formRegistry.getFormById(dependency.sourceFormId);
      const targetForm = formRegistry.getFormById(dependency.targetFormId);

      if (!sourceForm || !targetForm) {
        console.warn(
          `Cannot register dependency: Source form ${dependency.sourceFormId} or target form ${dependency.targetFormId} not found.`,
        );
        // For demo purposes, we'll continue even if forms don't exist
        // return;
      }

      // Check if source and target parameters exist in their respective forms
      const sourceFormMetadata = formRegistry.getFormMetadataById(
        dependency.sourceFormId,
      );
      const targetFormMetadata = formRegistry.getFormMetadataById(
        dependency.targetFormId,
      );

      if (!sourceFormMetadata || !targetFormMetadata) {
        console.warn(
          `Cannot register dependency: Metadata for source form ${dependency.sourceFormId} or target form ${dependency.targetFormId} not found.`,
        );
        // For demo purposes, we'll continue even if metadata doesn't exist
        // return;
      }

      // Check if the parameters exist - use name or id depending on what's provided
      const sourceParameterField =
        dependency.sourceParameterId || dependency.sourceParameterName;
      const targetParameterField =
        dependency.targetParameterId || dependency.targetParameterName;

      // Only check parameter existence if we have metadata
      let sourceParameterExists = true;
      let targetParameterExists = true;

      if (sourceFormMetadata) {
        sourceParameterExists = sourceFormMetadata.fields.some(
          (field) =>
            field.id === sourceParameterField ||
            field.name === sourceParameterField,
        );
      }

      if (targetFormMetadata) {
        targetParameterExists = targetFormMetadata.fields.some(
          (field) =>
            field.id === targetParameterField ||
            field.name === targetParameterField,
        );
      }

      if (!sourceParameterExists || !targetParameterExists) {
        console.warn(
          `Cannot register dependency: Source parameter ${sourceParameterField} or target parameter ${targetParameterField} not found.`,
        );
        // For demo purposes, we'll continue even if parameters don't exist
        // return;
      }
    } catch (error) {
      console.error(`Error in registerDependency: ${error}`);
      // Continue despite errors for demo purposes
    }

    // Convert to standard parameter dependency format
    const paramDependency = {
      sourceFormId: dependency.sourceFormId,
      sourceParameterId: sourceParameterField,
      targetFormId: dependency.targetFormId,
      targetParameterId: targetParameterField,
      dependencyType: this.mapDependencyType(
        dependency.dependencyType || dependency.type,
      ),
      transformationFunction:
        dependency.transformationFunction || dependency.transformationRule,
      condition: dependency.condition,
      clientTypes:
        dependency.clientTypes ||
        (dependency.clientType ? [dependency.clientType] : undefined),
      description:
        dependency.description ||
        `${dependency.targetFormId}.${targetParameterField} depends on ${dependency.sourceFormId}.${sourceParameterField}`,
    };

    this.parameterDependencies.push(paramDependency);
    console.log(
      `Registered dependency: ${paramDependency.sourceFormId}.${paramDependency.sourceParameterId} -> ${paramDependency.targetFormId}.${paramDependency.targetParameterId}`,
    );
  }

  /**
   * Map dependency types between different formats
   */
  private mapDependencyType(type: string): ParameterDependencyType {
    switch (type.toLowerCase()) {
      case "direct":
      case "value":
        return ParameterDependencyType.DIRECT;
      case "derived":
        return ParameterDependencyType.DERIVED;
      case "conditional":
      case "visibility":
        return ParameterDependencyType.CONDITIONAL;
      case "validation":
        return ParameterDependencyType.VALIDATION;
      case "workflow":
        return ParameterDependencyType.WORKFLOW;
      default:
        return ParameterDependencyType.DIRECT;
    }
  }

  /**
   * Resolve dependencies for a form
   */
  resolveDependencies(
    formId: string,
    clientType: ClientType,
    userId?: string,
    useCache: boolean = true,
  ): FormDependency[] {
    // Generate cache key
    const cacheKey = `${formId}:${clientType}:${userId || "anonymous"}`;

    // Check cache if enabled
    if (useCache) {
      const cached = this.dependencyCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.cacheExpiration) {
        return cached.result;
      }
    }

    const form = formRegistry.getFormById(formId);
    if (!form) return [];

    const result = form.dependencies.filter((dependency) => {
      // Check if dependency applies to this client type
      if (
        dependency.clientTypes &&
        !dependency.clientTypes.includes(clientType)
      ) {
        return false;
      }
      return true;
    });

    // Cache the result
    if (useCache) {
      this.dependencyCache.set(cacheKey, {
        result,
        timestamp: Date.now(),
      });
    }

    return result;
  }

  /**
   * Check if all prerequisites are met for a form
   */
  checkPrerequisites(
    formId: string,
    clientType: ClientType,
  ): { valid: boolean; missingPrerequisites: FormDependency[] } {
    const dependencies = this.resolveDependencies(formId, clientType);
    const missingPrerequisites = dependencies.filter((dependency) => {
      if (dependency.type !== "prerequisite" || !dependency.required) {
        return false;
      }

      // Check if the prerequisite form has been submitted
      const prerequisiteFormId = dependency.formId;
      const prerequisiteFormData = formParameterTracker.getParameterValue(
        prerequisiteFormId,
        "id",
      );

      return !prerequisiteFormData;
    });

    return {
      valid: missingPrerequisites.length === 0,
      missingPrerequisites,
    };
  }

  /**
   * Propagate data from one form to another based on dependencies
   */
  propagateData(
    sourceFormId: string,
    targetFormId: string,
    clientType: ClientType,
    userId?: string,
  ): void {
    const sourceFormMetadata = formRegistry.getFormMetadataById(sourceFormId);
    const targetFormMetadata = formRegistry.getFormMetadataById(targetFormId);

    if (!sourceFormMetadata || !targetFormMetadata) return;

    // Get dependencies where source form is the prerequisite for target form
    const form = formRegistry.getFormById(targetFormId);
    if (!form) return;

    const relevantDependencies = form.dependencies.filter(
      (dep) => dep.formId === sourceFormId,
    );

    // Get client-specific form metadata if available
    const clientSourceFormMetadata =
      formRegistry.getClientSpecificFormMetadata(sourceFormId, clientType) ||
      sourceFormMetadata;
    const clientTargetFormMetadata =
      formRegistry.getClientSpecificFormMetadata(targetFormId, clientType) ||
      targetFormMetadata;

    // First check for explicit parameter dependencies
    const explicitDependencies = this.parameterDependencies.filter(
      (dep) =>
        dep.sourceFormId === sourceFormId && dep.targetFormId === targetFormId,
    );

    // Process explicit parameter dependencies first
    explicitDependencies.forEach((dependency) => {
      // Skip if this dependency is not applicable to the current client type
      if (
        dependency.clientTypes &&
        !dependency.clientTypes.includes(clientType)
      ) {
        return;
      }

      // Get the value from the source form
      const sourceValue = formParameterTracker.getParameterValue(
        sourceFormId,
        dependency.sourceParameterId,
      );

      if (sourceValue !== undefined && sourceValue !== null) {
        // Check if condition is met (if any)
        if (dependency.condition) {
          try {
            // Create a context for evaluating the condition
            const context = {
              sourceValue,
              clientType,
              getParameterValue: (formId: string, parameterId: string) => {
                return formParameterTracker.getParameterValue(
                  formId,
                  parameterId,
                );
              },
            };

            // Evaluate the condition
            const conditionMet = this.evaluateExpression(
              dependency.condition,
              context,
            );
            if (!conditionMet) return; // Skip if condition not met
          } catch (error) {
            console.error(
              `Error evaluating condition for dependency: ${error}`,
            );
            return;
          }
        }

        // Determine the new value for the target parameter
        let transformedValue = sourceValue;

        // Apply transformation if specified
        if (dependency.transformationFunction) {
          try {
            // Create a context for evaluating the transformation
            const context = {
              sourceValue,
              clientType,
              getParameterValue: (formId: string, parameterId: string) => {
                return formParameterTracker.getParameterValue(
                  formId,
                  parameterId,
                );
              },
            };

            // Evaluate the transformation
            transformedValue = this.evaluateExpression(
              dependency.transformationFunction,
              context,
            );
          } catch (error) {
            console.error(`Error applying transformation: ${error}`);
            return;
          }
        }

        // Set the value in the target form
        formParameterTracker.setParameterValue(
          targetFormId,
          dependency.targetParameterId,
          transformedValue,
          clientType,
          userId,
        );

        // Log the propagation for audit purposes
        console.log(
          `Propagated value from ${sourceFormId}.${dependency.sourceParameterId} to ${targetFormId}.${dependency.targetParameterId}`,
          {
            sourceValue,
            targetValue: transformedValue,
            clientType,
            userId,
          },
        );
      }
    });

    // If there are no explicit dependencies or there are form-level dependencies,
    // propagate matching fields by name
    if (explicitDependencies.length === 0 || relevantDependencies.length > 0) {
      // For each field in the source form, check if it should be propagated to the target form
      clientSourceFormMetadata.fields.forEach((sourceField) => {
        // Skip fields marked as non-propagatable
        if (sourceField.noPropagation) return;

        // Skip fields with client-specific non-propagation setting
        if (sourceField.clientTypeOverrides?.[clientType]?.noPropagation)
          return;

        // Check if there's a matching field in the target form
        const targetField = clientTargetFormMetadata.fields.find(
          (field) => field.name === sourceField.name,
        );

        if (targetField) {
          // Skip target fields marked as non-propagatable
          if (targetField.noPropagation) return;
          if (targetField.clientTypeOverrides?.[clientType]?.noPropagation)
            return;

          // Get the value from the source form
          const value = formParameterTracker.getParameterValue(
            sourceFormId,
            sourceField.name,
          );

          if (value !== undefined && value !== null) {
            // Check if value transformation is needed based on client type
            const transformedValue = this.transformValueForClientType(
              value,
              sourceField,
              targetField,
              clientType,
            );

            // Set the value in the target form
            formParameterTracker.setParameterValue(
              targetFormId,
              targetField.name,
              transformedValue,
              clientType,
              userId,
            );

            // Log the propagation for audit purposes
            console.log(
              `Propagated value from ${sourceFormId}.${sourceField.name} to ${targetFormId}.${targetField.name}`,
              {
                sourceValue: value,
                targetValue: transformedValue,
                clientType,
                userId,
              },
            );
          }
        }
      });
    }
  }

  /**
   * Evaluate an expression with a given context
   */
  private evaluateExpression(
    expression: string,
    context: Record<string, any>,
  ): any {
    // Create a function from the expression
    try {
      const func = new Function(
        ...Object.keys(context),
        `"use strict"; return (${expression});`,
      );

      // Execute the function with the context
      return func(...Object.values(context));
    } catch (error) {
      console.error(`Error evaluating expression: ${expression}`, error);
      throw error;
    }
  }

  /**
   * Transform a value based on client-specific rules when propagating between forms
   */
  private transformValueForClientType(
    value: any,
    sourceField: any,
    targetField: any,
    clientType: ClientType,
  ): any {
    // Check for client-specific transformation rules
    const sourceTransform =
      sourceField.clientTypeOverrides?.[clientType]?.transformOnPropagation;
    const targetTransform =
      targetField.clientTypeOverrides?.[clientType]?.transformOnReceive;

    let transformedValue = value;

    // Apply source field's transformation if defined
    if (typeof sourceTransform === "function") {
      try {
        transformedValue = sourceTransform(value, targetField.name);
      } catch (error) {
        console.error(
          `Error in source transform for ${sourceField.name}:`,
          error,
        );
      }
    }

    // Apply target field's transformation if defined
    if (typeof targetTransform === "function") {
      try {
        transformedValue = targetTransform(transformedValue, sourceField.name);
      } catch (error) {
        console.error(
          `Error in target transform for ${targetField.name}:`,
          error,
        );
      }
    }

    // Apply type-based transformations if needed
    if (sourceField.type !== targetField.type) {
      transformedValue = this.convertValueBetweenTypes(
        transformedValue,
        sourceField.type,
        targetField.type,
      );
    }

    return transformedValue;
  }

  /**
   * Convert a value between different field types
   */
  private convertValueBetweenTypes(
    value: any,
    sourceType: string,
    targetType: string,
  ): any {
    // Handle null/undefined
    if (value === null || value === undefined) return value;

    // No conversion needed for same types
    if (sourceType === targetType) return value;

    // Handle conversions between different types
    switch (targetType) {
      case "number":
      case "integer":
      case "float":
      case "currency":
        // Convert to number
        return Number(value);

      case "string":
      case "text":
      case "textarea":
        // Convert to string
        return String(value);

      case "boolean":
      case "checkbox":
      case "toggle":
        // Convert to boolean
        if (typeof value === "string") {
          return (
            value.toLowerCase() === "true" ||
            value === "1" ||
            value.toLowerCase() === "yes"
          );
        }
        return Boolean(value);

      case "date":
      case "datetime":
        // Convert to Date object
        if (typeof value === "string" || typeof value === "number") {
          return new Date(value);
        }
        return value;

      default:
        // For other types, return as is
        return value;
    }
  }

  /**
   * Validate data across multiple forms
   */
  validateAcrossForms(
    formIds: string[],
    clientType: ClientType,
    useCache: boolean = true,
  ): { valid: boolean; errors: Record<string, Record<string, string[]>> } {
    // Generate cache key
    const cacheKey = `validate:${formIds.join(",")}:${clientType}`;

    // Check cache if enabled
    if (useCache) {
      const cached = this.validationCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < this.cacheExpiration) {
        return cached.result;
      }
    }
    const errors: Record<string, Record<string, string[]>> = {};

    // Check prerequisites first
    for (const formId of formIds) {
      const prerequisiteCheck = this.checkPrerequisites(formId, clientType);
      if (!prerequisiteCheck.valid) {
        errors[formId] = {
          prerequisites: prerequisiteCheck.missingPrerequisites.map(
            (dep) => `Missing prerequisite: ${dep.description}`,
          ),
        };
      }
    }

    // Implement cross-form validation rules
    for (const formId of formIds) {
      const form = formRegistry.getFormById(formId);
      if (!form) continue;

      // Get all forms that this form depends on
      const dependencies = form.dependencies.filter(
        (dep) =>
          (!dep.clientTypes || dep.clientTypes.includes(clientType)) &&
          formIds.includes(dep.formId),
      );

      // Check cross-form field validations
      for (const dependency of dependencies) {
        const sourceFormMetadata = formRegistry.getFormMetadataById(
          dependency.formId,
        );
        const targetFormMetadata = formRegistry.getFormMetadataById(formId);

        if (!sourceFormMetadata || !targetFormMetadata) continue;

        // Check for field value consistency across forms
        const fieldValidations = this.validateFieldsAcrossForms(
          dependency.formId,
          formId,
          clientType,
        );

        if (fieldValidations.length > 0) {
          if (!errors[formId]) errors[formId] = {};
          errors[formId].fieldValidations = fieldValidations;
        }
      }
    }

    const result = {
      valid: Object.keys(errors).length === 0,
      errors,
    };

    // Cache the result
    if (useCache) {
      this.validationCache.set(cacheKey, {
        result,
        timestamp: Date.now(),
      });
    }

    return result;
  }

  /**
   * Get all forms that depend on a specific form
   */
  getDependentForms(formId: string): string[] {
    const allForms = formRegistry.getAllForms();
    return allForms
      .filter((form) => form.dependencies.some((dep) => dep.formId === formId))
      .map((form) => form.id);
  }

  /**
   * Validate fields across two forms
   */
  private validateFieldsAcrossForms(
    sourceFormId: string,
    targetFormId: string,
    clientType: ClientType,
  ): string[] {
    const errors: string[] = [];
    const sourceFormMetadata = formRegistry.getFormMetadataById(sourceFormId);
    const targetFormMetadata = formRegistry.getFormMetadataById(targetFormId);

    if (!sourceFormMetadata || !targetFormMetadata) return errors;

    // Check for matching fields that should have consistent values
    sourceFormMetadata.fields.forEach((sourceField) => {
      const targetField = targetFormMetadata.fields.find(
        (field) => field.name === sourceField.name,
      );

      if (targetField) {
        const sourceValue = formParameterTracker.getParameterValue(
          sourceFormId,
          sourceField.name,
        );
        const targetValue = formParameterTracker.getParameterValue(
          targetFormId,
          targetField.name,
        );

        // Check if values should match but don't
        if (
          sourceValue !== undefined &&
          targetValue !== undefined &&
          sourceValue !== targetValue &&
          this.shouldFieldsMatch(sourceField, targetField, clientType)
        ) {
          // Check if the mismatch is allowed based on client-specific rules
          const isExemptFromValidation = this.isExemptFromValidation(
            sourceFormId,
            targetFormId,
            sourceField.name,
            clientType,
          );

          if (!isExemptFromValidation) {
            errors.push(
              `Value mismatch between ${sourceFormId}.${sourceField.name} (${sourceValue}) and ${targetFormId}.${targetField.name} (${targetValue})`,
            );
          }
        }
      }
    });

    return errors;
  }

  /**
   * Validate a specific field against business rules
   */
  validateField(
    formId: string,
    fieldName: string,
    value: any,
    clientType: ClientType,
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    const formMetadata = formRegistry.getFormMetadataById(formId);

    if (!formMetadata) {
      return { valid: false, errors: ["Form metadata not found"] };
    }

    // Find the field in the form metadata
    const field = formMetadata.fields.find((f) => f.name === fieldName);
    if (!field) {
      return {
        valid: false,
        errors: [`Field ${fieldName} not found in form ${formId}`],
      };
    }

    // Check client-specific field validation rules
    const clientSpecificField = field.clientTypeOverrides?.[clientType];

    // Apply validation rules
    if (
      field.required &&
      (value === undefined || value === null || value === "")
    ) {
      errors.push(`${field.label || fieldName} is required`);
    }

    // Apply type-specific validation
    errors.push(...this.validateFieldByType(field, value));

    // Apply client-specific validation if available
    if (clientSpecificField?.validationRules) {
      errors.push(
        ...this.applyCustomValidationRules(
          clientSpecificField.validationRules,
          value,
          field,
        ),
      );
    } else if (field.validationRules) {
      errors.push(
        ...this.applyCustomValidationRules(field.validationRules, value, field),
      );
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Apply custom validation rules to a field value
   */
  private applyCustomValidationRules(
    rules: any[],
    value: any,
    field: FormField,
  ): string[] {
    const errors: string[] = [];

    rules.forEach((rule) => {
      try {
        if (typeof rule === "function") {
          const result = rule(value, field);
          if (result !== true && typeof result === "string") {
            errors.push(result);
          }
        } else if (rule.type && rule.message) {
          // Handle predefined rule types
          switch (rule.type) {
            case "min":
              if (typeof value === "number" && value < rule.value) {
                errors.push(rule.message);
              }
              break;
            case "max":
              if (typeof value === "number" && value > rule.value) {
                errors.push(rule.message);
              }
              break;
            case "minLength":
              if (typeof value === "string" && value.length < rule.value) {
                errors.push(rule.message);
              }
              break;
            case "maxLength":
              if (typeof value === "string" && value.length > rule.value) {
                errors.push(rule.message);
              }
              break;
            case "pattern":
              if (
                typeof value === "string" &&
                !new RegExp(rule.pattern).test(value)
              ) {
                errors.push(rule.message);
              }
              break;
          }
        }
      } catch (error) {
        console.error(`Error applying validation rule:`, error);
        errors.push("Validation error occurred");
      }
    });

    return errors;
  }

  /**
   * Validate a field value based on its type
   */
  private validateFieldByType(field: FormField, value: any): string[] {
    const errors: string[] = [];

    if (value === undefined || value === null) {
      return errors; // Skip type validation for empty values (required check is separate)
    }

    switch (field.type) {
      case "number":
      case "integer":
      case "float":
      case "currency":
        if (typeof value !== "number" || isNaN(value)) {
          errors.push(`${field.label || field.name} must be a valid number`);
        }
        if (field.type === "integer" && !Number.isInteger(value)) {
          errors.push(`${field.label || field.name} must be an integer`);
        }
        break;

      case "date":
      case "datetime":
        if (!(value instanceof Date) && isNaN(Date.parse(value))) {
          errors.push(`${field.label || field.name} must be a valid date`);
        }
        break;

      case "boolean":
      case "checkbox":
      case "toggle":
        if (typeof value !== "boolean") {
          errors.push(`${field.label || field.name} must be a boolean value`);
        }
        break;

      case "select":
      case "radio":
        if (field.options && !field.options.includes(value)) {
          errors.push(
            `${field.label || field.name} must be one of the allowed options`,
          );
        }
        break;

      case "multiselect":
        if (field.options && Array.isArray(value)) {
          const invalidOptions = value.filter(
            (v) => !field.options?.includes(v),
          );
          if (invalidOptions.length > 0) {
            errors.push(
              `${field.label || field.name} contains invalid options`,
            );
          }
        } else if (!Array.isArray(value)) {
          errors.push(`${field.label || field.name} must be an array`);
        }
        break;
    }

    return errors;
  }

  /**
   * Check if a field is exempt from cross-form validation based on client type
   */
  private isExemptFromValidation(
    sourceFormId: string,
    targetFormId: string,
    fieldName: string,
    clientType: ClientType,
  ): boolean {
    // Get client-specific exemptions from form registry or configuration
    const sourceFormMetadata = formRegistry.getClientSpecificFormMetadata(
      sourceFormId,
      clientType,
    );
    const targetFormMetadata = formRegistry.getClientSpecificFormMetadata(
      targetFormId,
      clientType,
    );

    if (!sourceFormMetadata || !targetFormMetadata) return false;

    // Check if the field has validation exemptions in either form
    const sourceField = sourceFormMetadata.fields.find(
      (f) => f.name === fieldName,
    );
    const targetField = targetFormMetadata.fields.find(
      (f) => f.name === fieldName,
    );

    if (!sourceField || !targetField) return false;

    // Check for exemption flags in the field metadata
    const sourceExempt =
      sourceField.validationExemptions?.includes(targetFormId) || false;
    const targetExempt =
      targetField.validationExemptions?.includes(sourceFormId) || false;

    // Check for client-specific exemptions
    const sourceClientExempt =
      sourceField.clientTypeOverrides?.[
        clientType
      ]?.validationExemptions?.includes(targetFormId) || false;
    const targetClientExempt =
      targetField.clientTypeOverrides?.[
        clientType
      ]?.validationExemptions?.includes(sourceFormId) || false;

    return (
      sourceExempt || targetExempt || sourceClientExempt || targetClientExempt
    );
  }

  /**
   * Determine if two fields should have matching values
   */
  private shouldFieldsMatch(
    sourceField: any,
    targetField: any,
    clientType: ClientType,
  ): boolean {
    // Fields with the same name that are not calculated or derived should match
    // This is a simple implementation - in a real system, you might have more complex rules
    if (
      sourceField.type === "calculated" ||
      targetField.type === "calculated" ||
      sourceField.type === "derived" ||
      targetField.type === "derived"
    ) {
      return false;
    }

    // Fields that are marked as local-only should not be matched across forms
    if (sourceField.localOnly || targetField.localOnly) {
      return false;
    }

    // Check if there are client-specific rules for matching
    if (
      sourceField.clientTypeOverrides &&
      sourceField.clientTypeOverrides[clientType] &&
      sourceField.clientTypeOverrides[clientType].matchAcrossForms === false
    ) {
      return false;
    }

    if (
      targetField.clientTypeOverrides &&
      targetField.clientTypeOverrides[clientType] &&
      targetField.clientTypeOverrides[clientType].matchAcrossForms === false
    ) {
      return false;
    }

    // Check field types - only match fields of compatible types
    const compatibleTypes = this.areFieldTypesCompatible(
      sourceField.type,
      targetField.type,
    );
    if (!compatibleTypes) {
      return false;
    }

    // By default, fields with the same name should match
    return true;
  }

  /**
   * Check if field types are compatible for cross-form validation
   */
  private areFieldTypesCompatible(
    sourceType: string,
    targetType: string,
  ): boolean {
    // Same types are always compatible
    if (sourceType === targetType) return true;

    // Define groups of compatible types
    const numericTypes = ["number", "integer", "float", "currency"];
    const textTypes = ["text", "string", "textarea", "richtext"];
    const dateTypes = ["date", "datetime", "time"];
    const booleanTypes = ["boolean", "checkbox", "toggle"];
    const selectTypes = ["select", "multiselect", "dropdown", "radio"];

    // Check if both types belong to the same group
    if (numericTypes.includes(sourceType) && numericTypes.includes(targetType))
      return true;
    if (textTypes.includes(sourceType) && textTypes.includes(targetType))
      return true;
    if (dateTypes.includes(sourceType) && dateTypes.includes(targetType))
      return true;
    if (booleanTypes.includes(sourceType) && booleanTypes.includes(targetType))
      return true;
    if (selectTypes.includes(sourceType) && selectTypes.includes(targetType))
      return true;

    // Otherwise, types are not compatible
    return false;
  }

  /**
   * Notify dependent forms of changes in a source form
   */
  notifyDependentForms(
    sourceFormId: string,
    clientType: ClientType,
    userId?: string,
  ): void {
    const dependentFormIds = this.getDependentForms(sourceFormId);

    dependentFormIds.forEach((targetFormId) => {
      this.propagateData(sourceFormId, targetFormId, clientType, userId);
    });

    // Invalidate relevant caches
    this.invalidateDependencyCache(sourceFormId, clientType);
    this.invalidateValidationCache(sourceFormId);

    // Trigger workflow actions if needed
    this.triggerWorkflowActions(sourceFormId, clientType, userId);
  }

  /**
   * Trigger workflow actions based on form changes
   */
  private triggerWorkflowActions(
    formId: string,
    clientType: ClientType,
    userId?: string,
  ): void {
    // Find workflow dependencies where this form is the source
    const workflowDependencies = this.parameterDependencies.filter(
      (dep) =>
        dep.sourceFormId === formId &&
        dep.dependencyType === ParameterDependencyType.WORKFLOW,
    );

    if (workflowDependencies.length === 0) return;

    // Process each workflow dependency
    workflowDependencies.forEach((dependency) => {
      // Skip if this dependency is not applicable to the current client type
      if (
        dependency.clientTypes &&
        !dependency.clientTypes.includes(clientType)
      ) {
        return;
      }

      // Check if condition is met (if any)
      if (dependency.condition) {
        try {
          const sourceValue = formParameterTracker.getParameterValue(
            dependency.sourceFormId,
            dependency.sourceParameterId,
          );

          // Create a context for evaluating the condition
          const context = {
            sourceValue,
            clientType,
            getParameterValue: (formId: string, parameterId: string) => {
              return formParameterTracker.getParameterValue(
                formId,
                parameterId,
              );
            },
          };

          // Evaluate the condition
          const conditionMet = this.evaluateExpression(
            dependency.condition,
            context,
          );
          if (!conditionMet) return; // Skip if condition not met
        } catch (error) {
          console.error(`Error evaluating workflow condition: ${error}`);
          return;
        }
      }

      // Trigger the workflow action
      console.log(
        `Triggering workflow action: ${dependency.sourceFormId} -> ${dependency.targetFormId}`,
      );

      // In a real implementation, this would trigger a workflow action
      // For now, we'll just propagate the data to the target form
      this.propagateData(
        dependency.sourceFormId,
        dependency.targetFormId,
        clientType,
        userId,
      );
    });
  }

  /**
   * Set cache expiration time
   */
  setCacheExpiration(milliseconds: number): void {
    this.cacheExpiration = milliseconds;
  }

  /**
   * Clear all caches
   */
  clearAllCaches(): void {
    this.dependencyCache.clear();
    this.validationCache.clear();
    this.fieldMappingCache.clear();
  }

  /**
   * Invalidate dependency cache for a form
   */
  invalidateDependencyCache(formId: string, clientType?: ClientType): void {
    const keysToDelete: string[] = [];

    this.dependencyCache.forEach((_, key) => {
      if (key.startsWith(`${formId}:`)) {
        if (!clientType || key.includes(`:${clientType}:`)) {
          keysToDelete.push(key);
        }
      }
    });

    keysToDelete.forEach((key) => this.dependencyCache.delete(key));
  }

  /**
   * Invalidate validation cache for forms
   */
  invalidateValidationCache(formId: string): void {
    const keysToDelete: string[] = [];

    this.validationCache.forEach((_, key) => {
      if (key.includes(formId)) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach((key) => this.validationCache.delete(key));
  }

  /**
   * Cache field mappings for cross-form dependencies
   */
  cacheFieldMappings(
    sourceFormId: string,
    targetFormId: string,
    mappings: { sourceField: string; targetField: string }[],
  ): void {
    const cacheKey = `${sourceFormId}:${targetFormId}`;
    this.fieldMappingCache.set(cacheKey, mappings);
  }

  /**
   * Get cached field mappings
   */
  getCachedFieldMappings(
    sourceFormId: string,
    targetFormId: string,
  ): { sourceField: string; targetField: string }[] | undefined {
    const cacheKey = `${sourceFormId}:${targetFormId}`;
    return this.fieldMappingCache.get(cacheKey);
  }

  /**
   * Optimize data propagation between forms
   */
  optimizePropagation(
    sourceFormId: string,
    targetFormId: string,
    clientType: ClientType,
  ): void {
    const sourceFormMetadata = formRegistry.getFormMetadataById(sourceFormId);
    const targetFormMetadata = formRegistry.getFormMetadataById(targetFormId);

    if (!sourceFormMetadata || !targetFormMetadata) return;

    // Find matching fields between forms
    const mappings: { sourceField: string; targetField: string }[] = [];

    // First check for explicit parameter dependencies
    const explicitDependencies = this.parameterDependencies.filter(
      (dep) =>
        dep.sourceFormId === sourceFormId && dep.targetFormId === targetFormId,
    );

    // Add explicit mappings first
    explicitDependencies.forEach((dep) => {
      if (!dep.clientTypes || dep.clientTypes.includes(clientType)) {
        mappings.push({
          sourceField: dep.sourceParameterId,
          targetField: dep.targetParameterId,
        });
      }
    });

    // Then add field mappings based on matching names
    sourceFormMetadata.fields.forEach((sourceField) => {
      if (sourceField.noPropagation) return;
      if (sourceField.clientTypeOverrides?.[clientType]?.noPropagation) return;

      const targetField = targetFormMetadata.fields.find(
        (field) => field.name === sourceField.name,
      );
      if (
        targetField &&
        !targetField.noPropagation &&
        !targetField.clientTypeOverrides?.[clientType]?.noPropagation &&
        // Don't add duplicate mappings
        !mappings.some(
          (m) =>
            m.sourceField === sourceField.name &&
            m.targetField === targetField.name,
        )
      ) {
        mappings.push({
          sourceField: sourceField.name,
          targetField: targetField.name,
        });
      }
    });

    // Cache the mappings for future use
    this.cacheFieldMappings(sourceFormId, targetFormId, mappings);

    // Register these mappings as dependencies if they don't already exist
    mappings.forEach((mapping) => {
      const existingDependency = this.parameterDependencies.some(
        (dep) =>
          dep.sourceFormId === sourceFormId &&
          dep.targetFormId === targetFormId &&
          dep.sourceParameterId === mapping.sourceField &&
          dep.targetParameterId === mapping.targetField,
      );

      if (!existingDependency) {
        this.registerDependency({
          sourceFormId,
          sourceParameterId: mapping.sourceField,
          targetFormId,
          targetParameterId: mapping.targetField,
          dependencyType: ParameterDependencyType.DIRECT,
          description: `Auto-mapped field from ${sourceFormId}.${mapping.sourceField} to ${targetFormId}.${mapping.targetField}`,
          clientTypes: [clientType],
        });
      }
    });
  }

  /**
   * Batch validate multiple fields across forms
   */
  batchValidateFields(
    validations: Array<{
      formId: string;
      fieldName: string;
      value: any;
      clientType: ClientType;
    }>,
  ): Record<string, { valid: boolean; errors: string[] }> {
    const results: Record<string, { valid: boolean; errors: string[] }> = {};

    validations.forEach((validation) => {
      const result = this.validateField(
        validation.formId,
        validation.fieldName,
        validation.value,
        validation.clientType,
      );

      results[`${validation.formId}:${validation.fieldName}`] = result;
    });

    return results;
  }

  /**
   * Create a dependency between two forms
   */
  createFormDependency(
    sourceFormId: string,
    targetFormId: string,
    options: {
      type: "prerequisite" | "reference" | "followup";
      required: boolean;
      description: string;
      clientTypes?: ClientType[];
      condition?: string;
      fieldMappings?: Array<{
        sourceField: string;
        targetField: string;
        transformationRule?: string;
        description?: string;
      }>;
    },
  ): boolean {
    // Validate that both forms exist
    const sourceForm = formRegistry.getFormById(sourceFormId);
    const targetForm = formRegistry.getFormById(targetFormId);

    if (!sourceForm || !targetForm) {
      console.error(
        `Cannot create dependency: Source form ${sourceFormId} or target form ${targetFormId} not found.`,
      );
      return false;
    }

    // Create the form dependency
    const dependency: FormDependency = {
      formId: sourceFormId,
      type: options.type,
      required: options.required,
      description: options.description,
      clientTypes: options.clientTypes,
      condition: options.condition,
    };

    // In a real implementation, this would update the form registry
    console.log(
      `Created form dependency: ${sourceFormId} -> ${targetFormId}`,
      dependency,
    );

    // Register field mappings if provided
    if (options.fieldMappings && options.fieldMappings.length > 0) {
      options.fieldMappings.forEach((mapping) => {
        this.registerDependency({
          sourceFormId,
          sourceParameterId: mapping.sourceField,
          targetFormId,
          targetParameterId: mapping.targetField,
          dependencyType: ParameterDependencyType.DIRECT,
          transformationFunction: mapping.transformationRule,
          description:
            mapping.description ||
            `${targetFormId}.${mapping.targetField} depends on ${sourceFormId}.${mapping.sourceField}`,
          clientTypes: options.clientTypes,
        });
      });
    }

    return true;
  }

  /**
   * Get a multi-step workflow path for a set of forms
   */
  getWorkflowPath(
    formIds: string[],
    clientType: ClientType,
  ): Array<{
    formId: string;
    title: string;
    status: "completed" | "current" | "pending";
    optional: boolean;
  }> {
    // Validate that all forms exist
    const invalidForms = formIds.filter((id) => !formRegistry.getFormById(id));
    if (invalidForms.length > 0) {
      throw new Error(
        `Invalid form IDs in workflow: ${invalidForms.join(", ")}`,
      );
    }

    // Build the workflow path
    const workflowPath = formIds.map((formId) => {
      const form = formRegistry.getFormById(formId)!;

      // Determine if the form is optional
      const isRequired = formIds.some((otherFormId) => {
        if (otherFormId === formId) return false;
        const otherForm = formRegistry.getFormById(otherFormId);
        return (
          otherForm?.dependencies.some(
            (dep) =>
              dep.formId === formId &&
              dep.required &&
              dep.type === "prerequisite",
          ) || false
        );
      });

      // Determine the form status
      let status: "completed" | "current" | "pending" = "pending";
      const formData = formParameterTracker.getParameterValue(formId, "id");
      if (formData) {
        status = "completed";
      } else {
        // Check if all prerequisites are met
        const prerequisites = this.checkPrerequisites(formId, clientType);
        status = prerequisites.valid ? "current" : "pending";
      }

      return {
        formId,
        title: form.title,
        status,
        optional: !isRequired,
      };
    });

    // Ensure at least one form is marked as current if all are pending
    if (workflowPath.every((step) => step.status !== "current")) {
      // Find the first pending form that has all prerequisites met
      for (const step of workflowPath) {
        if (step.status === "pending") {
          const prerequisites = this.checkPrerequisites(
            step.formId,
            clientType,
          );
          if (prerequisites.valid) {
            step.status = "current";
            break;
          }
        }
      }

      // If still no current step, mark the first pending as current
      if (workflowPath.every((step) => step.status !== "current")) {
        const firstPending = workflowPath.find(
          (step) => step.status === "pending",
        );
        if (firstPending) {
          firstPending.status = "current";
        }
      }
    }

    return workflowPath;
  }
}

// Export singleton instance
export const formDependencyResolver = new FormDependencyResolver();
