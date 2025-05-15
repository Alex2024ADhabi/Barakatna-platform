import {
  ClientType,
  FormMetadata,
  FormField,
  FormSection,
  FieldType,
  ValidationRuleType,
  DependencyType,
} from "../forms/types";
import { formRegistry } from "../forms/registry";
import {
  formParameterTracker,
  ParameterChangeEventType,
} from "./formParameterTrackerService";
import { formDependencyResolver } from "./FormDependencyResolver";

/**
 * Dynamic Form Engine Service
 *
 * Responsible for dynamically generating and managing forms based on metadata,
 * handling client-specific variations, and managing form state and validation.
 */
class DynamicFormEngine {
  /**
   * Generate a form configuration based on form metadata and client type
   */
  generateFormConfig(
    formId: string,
    clientType: ClientType,
    userId?: string,
    formData?: Record<string, any>,
  ): {
    sections: FormSection[];
    fields: FormField[];
    title: string;
    description: string;
    workflow?: string;
    dependencies: string[];
  } | null {
    // Get client-specific form metadata
    const formMetadata = formRegistry.getClientSpecificFormMetadata(
      formId,
      clientType,
    );

    if (!formMetadata) {
      console.error(`Form metadata not found for form ID: ${formId}`);
      return null;
    }

    // Filter sections based on client type and conditions
    const filteredSections = this.filterSectionsByClientType(
      formMetadata.sections,
      clientType,
      formData,
    );

    // Filter and process fields based on client type and conditions
    const filteredFields = this.filterFieldsByClientType(
      formMetadata.fields,
      clientType,
      formData,
    );

    // Get dependent form IDs
    const dependentFormIds = formMetadata.dependencies.map((dep) => dep.formId);

    return {
      sections: filteredSections,
      fields: filteredFields,
      title: formMetadata.title,
      description: formMetadata.description,
      workflow: formMetadata.workflow,
      dependencies: dependentFormIds,
    };
  }

  /**
   * Filter sections based on client type and form data
   */
  private filterSectionsByClientType(
    sections: FormSection[],
    clientType: ClientType,
    formData?: Record<string, any>,
  ): FormSection[] {
    return sections.filter((section) => {
      // If section has client types specified, check if current client type is included
      if (section.clientTypes && !section.clientTypes.includes(clientType)) {
        return false;
      }

      // If section has a conditional, evaluate it
      if (section.conditional && formData) {
        const { field, operator, value } = section.conditional;
        const fieldValue = formData[field];

        // Evaluate the condition based on the operator
        switch (operator) {
          case "equals":
            if (field === "clientType") {
              if (value !== clientType) return false;
            } else if (fieldValue !== value) {
              return false;
            }
            break;
          case "notEquals":
            if (fieldValue === value) return false;
            break;
          case "contains":
            if (Array.isArray(fieldValue) && !fieldValue.includes(value))
              return false;
            break;
          case "greaterThan":
            if (typeof fieldValue === "number" && fieldValue <= value)
              return false;
            break;
          case "lessThan":
            if (typeof fieldValue === "number" && fieldValue >= value)
              return false;
            break;
          case "isEmpty":
            if (
              fieldValue !== undefined &&
              fieldValue !== null &&
              fieldValue !== ""
            )
              return false;
            break;
          case "isNotEmpty":
            if (
              fieldValue === undefined ||
              fieldValue === null ||
              fieldValue === ""
            )
              return false;
            break;
        }
      }

      return true;
    });
  }

  /**
   * Filter fields based on client type and form data
   */
  private filterFieldsByClientType(
    fields: FormField[],
    clientType: ClientType,
    formData?: Record<string, any>,
  ): FormField[] {
    return fields
      .filter((field) => {
        // If field has client types specified, check if current client type is included
        if (field.clientTypes && !field.clientTypes.includes(clientType)) {
          return false;
        }

        // If field has a conditional, evaluate it
        if (field.conditional && formData) {
          const { field: condField, operator, value } = field.conditional;
          const fieldValue = formData[condField];

          // Evaluate the condition based on the operator
          switch (operator) {
            case "equals":
              if (condField === "clientType") {
                if (value !== clientType) return false;
              } else if (fieldValue !== value) {
                return false;
              }
              break;
            case "notEquals":
              if (fieldValue === value) return false;
              break;
            case "contains":
              if (Array.isArray(fieldValue) && !fieldValue.includes(value))
                return false;
              break;
            case "greaterThan":
              if (typeof fieldValue === "number" && fieldValue <= value)
                return false;
              break;
            case "lessThan":
              if (typeof fieldValue === "number" && fieldValue >= value)
                return false;
              break;
            case "isEmpty":
              if (
                fieldValue !== undefined &&
                fieldValue !== null &&
                fieldValue !== ""
              )
                return false;
              break;
            case "isNotEmpty":
              if (
                fieldValue === undefined ||
                fieldValue === null ||
                fieldValue === ""
              )
                return false;
              break;
          }
        }

        // Check field dependencies if they exist
        if (field.dependencies && field.dependencies.length > 0 && formData) {
          for (const dependency of field.dependencies) {
            const sourceValue = formData[dependency.sourceField];
            let conditionMet = false;

            // Evaluate the condition
            try {
              // Simple evaluation for common conditions
              if (dependency.condition === "isNotEmpty") {
                conditionMet =
                  sourceValue !== undefined &&
                  sourceValue !== null &&
                  sourceValue !== "";
              } else if (dependency.condition === "isEmpty") {
                conditionMet =
                  sourceValue === undefined ||
                  sourceValue === null ||
                  sourceValue === "";
              } else if (dependency.condition.includes("==")) {
                const parts = dependency.condition.split("==");
                const rightSide = parts[1].trim();
                conditionMet = sourceValue == rightSide.replace(/["']/g, "");
              } else {
                // For more complex conditions, use a safer evaluation approach
                const safeEval = new Function(
                  "value",
                  `return ${dependency.condition.replace("sourceValue", "value")};`,
                );
                conditionMet = safeEval(sourceValue);
              }
            } catch (error) {
              console.error(
                `Error evaluating field dependency condition: ${error}`,
              );
              conditionMet = false;
            }

            // If condition is not met and dependency type is visibility, hide the field
            if (
              !conditionMet &&
              dependency.type === DependencyType.VISIBILITY
            ) {
              return false;
            }
          }
        }

        return true;
      })
      .map((field) => {
        // Apply client-specific overrides if available
        if (
          field.clientTypeOverrides &&
          field.clientTypeOverrides[clientType]
        ) {
          return {
            ...field,
            ...field.clientTypeOverrides[clientType],
          };
        }
        return field;
      });
  }

  /**
   * Initialize form state with default values
   */
  initializeFormState(
    formId: string,
    clientType: ClientType,
    userId?: string,
  ): Record<string, any> {
    const formConfig = this.generateFormConfig(formId, clientType, userId);
    if (!formConfig) return {};

    const initialState: Record<string, any> = {};

    // Set default values for all fields
    formConfig.fields.forEach((field) => {
      if (field.defaultValue !== undefined) {
        initialState[field.name] = field.defaultValue;
      } else {
        // Set appropriate default values based on field type
        switch (field.type) {
          case "text":
          case "textarea":
          case "email":
          case "password":
          case "phone":
            initialState[field.name] = "";
            break;
          case "number":
            initialState[field.name] = 0;
            break;
          case "checkbox":
            initialState[field.name] = false;
            break;
          case "select":
          case "radio":
            initialState[field.name] =
              field.options && field.options.length > 0
                ? field.options[0].value
                : "";
            break;
          case "multiselect":
            initialState[field.name] = [];
            break;
          case "date":
          case "datetime":
            initialState[field.name] = null;
            break;
          case "file":
          case "image":
            initialState[field.name] = null;
            break;
          case "repeater":
            initialState[field.name] = [];
            break;
          default:
            initialState[field.name] = null;
        }
      }

      // Register the parameter with the tracker
      formParameterTracker.setParameterValue(
        formId,
        field.name,
        initialState[field.name],
        clientType,
        userId,
      );
    });

    return initialState;
  }

  /**
   * Validate form data against form metadata
   */
  validateForm(
    formId: string,
    clientType: ClientType,
    formData: Record<string, any>,
    validateDependencies: boolean = false,
  ): { valid: boolean; errors: Record<string, string[]> } {
    const formConfig = this.generateFormConfig(
      formId,
      clientType,
      undefined,
      formData,
    );
    if (!formConfig) {
      return {
        valid: false,
        errors: { form: ["Form configuration not found"] },
      };
    }

    const errors: Record<string, string[]> = {};

    // Validate each field
    formConfig.fields.forEach((field) => {
      const fieldErrors: string[] = [];
      const value = formData[field.name];

      // Check if field is required based on dependencies
      let isRequired = field.required;
      if (field.dependencies) {
        for (const dependency of field.dependencies) {
          if (dependency.type === DependencyType.REQUIREMENT) {
            const sourceValue = formData[dependency.sourceField];
            try {
              // Evaluate the condition to determine if field is required
              const safeEval = new Function(
                "value",
                `return ${dependency.condition.replace("sourceValue", "value")};`,
              );
              const conditionMet = safeEval(sourceValue);
              if (conditionMet) {
                // If condition is met, update the required status based on the action
                isRequired =
                  dependency.action === "true" ||
                  dependency.action === "required";
                break;
              }
            } catch (error) {
              console.error(
                `Error evaluating requirement dependency: ${error}`,
              );
            }
          }
        }
      }

      // Check required fields
      if (
        isRequired &&
        (value === undefined || value === null || value === "")
      ) {
        fieldErrors.push(`${field.label} is required`);
      }

      // Apply validation rules if any
      if (field.validation && value !== undefined && value !== null) {
        field.validation.forEach((rule) => {
          // Skip validation if rule is client-specific and not for current client
          if (rule.clientTypes && !rule.clientTypes.includes(clientType)) {
            return;
          }

          // Check if condition is met (if any)
          if (rule.condition) {
            try {
              // Evaluate the condition based on form data
              const conditionMet = this.evaluateExpression(
                rule.condition,
                formData,
              );
              if (!conditionMet) return;
            } catch (error) {
              console.error(`Error evaluating validation condition: ${error}`);
              return;
            }
          }

          // Apply validation rule
          switch (rule.type) {
            case ValidationRuleType.REQUIRED:
              if (value === undefined || value === null || value === "") {
                fieldErrors.push(rule.message);
              }
              break;
            case ValidationRuleType.MIN_LENGTH:
              if (typeof value === "string" && value.length < rule.value) {
                fieldErrors.push(rule.message);
              }
              break;
            case ValidationRuleType.MAX_LENGTH:
              if (typeof value === "string" && value.length > rule.value) {
                fieldErrors.push(rule.message);
              }
              break;
            case ValidationRuleType.MIN_VALUE:
              if (typeof value === "number" && value < rule.value) {
                fieldErrors.push(rule.message);
              }
              break;
            case ValidationRuleType.MAX_VALUE:
              if (typeof value === "number" && value > rule.value) {
                fieldErrors.push(rule.message);
              }
              break;
            case ValidationRuleType.PATTERN:
              if (
                typeof value === "string" &&
                !new RegExp(rule.value).test(value)
              ) {
                fieldErrors.push(rule.message);
              }
              break;
            case ValidationRuleType.EMAIL:
              if (
                typeof value === "string" &&
                !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
              ) {
                fieldErrors.push(rule.message);
              }
              break;
            case ValidationRuleType.URL:
              try {
                if (typeof value === "string") {
                  new URL(value);
                }
              } catch {
                fieldErrors.push(rule.message);
              }
              break;
            case ValidationRuleType.CUSTOM:
              try {
                // Evaluate custom validation rule
                const isValid = this.evaluateExpression(rule.value, {
                  ...formData,
                  field,
                  value,
                });
                if (!isValid) {
                  fieldErrors.push(rule.message);
                }
              } catch (error) {
                console.error(`Error evaluating custom validation: ${error}`);
              }
              break;
          }
        });
      }

      // Check field dependencies with validation type
      if (field.dependencies) {
        for (const dependency of field.dependencies) {
          if (dependency.type === DependencyType.VALIDATION) {
            const sourceValue = formData[dependency.sourceField];
            try {
              // Evaluate the condition
              const safeEval = new Function(
                "value",
                `return ${dependency.condition.replace("sourceValue", "value")};`,
              );
              const conditionMet = safeEval(sourceValue);

              if (conditionMet) {
                // If condition is met, evaluate the validation action
                const validationResult = this.evaluateExpression(
                  dependency.action,
                  { value, sourceValue, formData },
                );

                if (!validationResult) {
                  fieldErrors.push(
                    `${field.label} is invalid based on ${dependency.sourceField}`,
                  );
                }
              }
            } catch (error) {
              console.error(`Error evaluating validation dependency: ${error}`);
            }
          }
        }
      }

      if (fieldErrors.length > 0) {
        errors[field.name] = fieldErrors;
      }
    });

    // If requested, validate dependencies with other forms
    if (validateDependencies && formConfig.dependencies.length > 0) {
      const dependencyValidation = formDependencyResolver.validateAcrossForms(
        [formId, ...formConfig.dependencies],
        clientType,
      );

      if (!dependencyValidation.valid) {
        // Add cross-form validation errors
        Object.entries(dependencyValidation.errors).forEach(
          ([formId, formErrors]) => {
            Object.entries(formErrors).forEach(([field, fieldErrors]) => {
              const errorKey = `${formId}.${field}`;
              errors[errorKey] = fieldErrors;
            });
          },
        );
      }
    }

    return {
      valid: Object.keys(errors).length === 0,
      errors,
    };
  }

  /**
   * Process form dependencies when a field value changes
   */
  processFieldChange(
    formId: string,
    fieldName: string,
    value: any,
    clientType: ClientType,
    userId?: string,
  ): void {
    try {
      // Update the parameter value in the tracker
      formParameterTracker.setParameterValue(
        formId,
        fieldName,
        value,
        clientType,
        userId,
      );

      // The formParameterTracker will handle dependency processing
    } catch (error) {
      console.error(`Error processing field change: ${error}`);
      // Continue despite errors for demo purposes
    }
  }

  /**
   * Evaluate an expression with form data context
   */
  evaluateExpression(expression: string, context: Record<string, any>): any {
    // Create a safe evaluation context with all form data
    const evalContext = { ...context };

    // Create a function from the expression
    try {
      const func = new Function(
        ...Object.keys(evalContext),
        `"use strict"; return (${expression});`,
      );

      // Execute the function with the context
      return func(...Object.values(evalContext));
    } catch (error) {
      console.error(`Error evaluating expression: ${expression}`, error);
      throw error;
    }
  }

  /**
   * Calculate field values based on calculation formulas
   */
  calculateDerivedFields(
    formId: string,
    clientType: ClientType,
    formData: Record<string, any>,
  ): Record<string, any> {
    const formConfig = this.generateFormConfig(formId, clientType);
    if (!formConfig) return formData;

    const result = { ...formData };

    // Process fields with calculation formulas
    formConfig.fields
      .filter(
        (field) =>
          field.type === FieldType.CALCULATED && field.calculationFormula,
      )
      .forEach((field) => {
        try {
          // Evaluate the calculation formula with the current form data
          result[field.name] = this.evaluateExpression(
            field.calculationFormula!,
            result,
          );

          // Update the parameter tracker with the calculated value
          formParameterTracker.setParameterValue(
            formId,
            field.name,
            result[field.name],
            clientType,
          );
        } catch (error) {
          console.error(`Error calculating field ${field.name}: ${error}`);
        }
      });

    return result;
  }

  /**
   * Generate a submission payload for the form
   */
  generateSubmissionPayload(
    formId: string,
    clientType: ClientType,
    formData: Record<string, any>,
  ): Record<string, any> {
    const formMetadata = formRegistry.getClientSpecificFormMetadata(
      formId,
      clientType,
    );

    if (!formMetadata) {
      console.error(`Form metadata not found for form ID: ${formId}`);
      return formData;
    }

    // Calculate any derived fields first
    const processedData = this.calculateDerivedFields(
      formId,
      clientType,
      formData,
    );

    // Create a base payload with all form data
    const payload: Record<string, any> = { ...processedData };

    // Add metadata about the submission
    payload._metadata = {
      formId,
      formVersion: formMetadata.version,
      clientType,
      submittedAt: new Date().toISOString(),
    };

    return payload;
  }

  /**
   * Submit a form to the appropriate endpoint
   */
  async submitForm(
    formId: string,
    clientType: ClientType,
    formData: Record<string, any>,
    validateDependencies: boolean = true,
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    const formMetadata = formRegistry.getClientSpecificFormMetadata(
      formId,
      clientType,
    );

    if (!formMetadata) {
      return {
        success: false,
        error: `Form metadata not found for form ID: ${formId}`,
      };
    }

    // Validate the form data including dependencies if requested
    const validation = this.validateForm(
      formId,
      clientType,
      formData,
      validateDependencies,
    );
    if (!validation.valid) {
      return {
        success: false,
        error: "Form validation failed",
        data: validation.errors,
      };
    }

    // Check prerequisites if this form has dependencies
    if (validateDependencies && formMetadata.dependencies.length > 0) {
      const prerequisiteCheck = formDependencyResolver.checkPrerequisites(
        formId,
        clientType,
      );
      if (!prerequisiteCheck.valid) {
        return {
          success: false,
          error: "Missing required prerequisites",
          data: {
            prerequisites: prerequisiteCheck.missingPrerequisites.map(
              (dep) => dep.description,
            ),
          },
        };
      }
    }

    // Generate the submission payload
    const payload = this.generateSubmissionPayload(
      formId,
      clientType,
      formData,
    );

    // Determine the submission endpoint
    const submitEndpoint = formMetadata.submitEndpoint;
    if (!submitEndpoint) {
      return {
        success: false,
        error: "No submission endpoint defined for this form",
      };
    }

    try {
      // In a real implementation, we would make an API call to the endpoint
      // For now, we'll simulate a successful submission
      console.log(`Submitting form to ${submitEndpoint}`, payload);

      // Simulate API call
      // const response = await fetch(submitEndpoint, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(payload),
      // });
      // const data = await response.json();

      // Simulate successful response
      const data = {
        success: true,
        id: `submission_${Date.now()}`,
        message: "Form submitted successfully",
      };

      // After successful submission, notify dependent forms
      formDependencyResolver.notifyDependentForms(formId, clientType);

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error(`Error submitting form: ${error}`);
      return {
        success: false,
        error: `Error submitting form: ${error}`,
      };
    }
  }

  /**
   * Load form data from an API endpoint
   */
  async loadFormData(
    formId: string,
    recordId: string,
    clientType: ClientType,
  ): Promise<{ success: boolean; data?: Record<string, any>; error?: string }> {
    const formMetadata = formRegistry.getClientSpecificFormMetadata(
      formId,
      clientType,
    );

    if (!formMetadata) {
      return {
        success: false,
        error: `Form metadata not found for form ID: ${formId}`,
      };
    }

    // Determine the fetch data endpoint
    const fetchEndpoint = formMetadata.fetchDataEndpoint;
    if (!fetchEndpoint) {
      return {
        success: false,
        error: "No fetch data endpoint defined for this form",
      };
    }

    // Replace any placeholders in the endpoint URL
    const endpoint = fetchEndpoint.replace("{id}", recordId);

    try {
      // In a real implementation, we would make an API call to the endpoint
      // For now, we'll simulate a successful data fetch
      console.log(`Fetching form data from ${endpoint}`);

      // Simulate API call
      // const response = await fetch(endpoint);
      // const data = await response.json();

      // Simulate successful response with mock data
      const data = {
        id: recordId,
        // Generate some mock data based on form fields
        ...this.generateMockData(formId, clientType),
      };

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error(`Error fetching form data: ${error}`);
      return {
        success: false,
        error: `Error fetching form data: ${error}`,
      };
    }
  }

  /**
   * Generate mock data for testing
   */
  private generateMockData(
    formId: string,
    clientType: ClientType,
  ): Record<string, any> {
    const formConfig = this.generateFormConfig(formId, clientType);
    if (!formConfig) return {};

    const mockData: Record<string, any> = {};

    // Generate mock data for each field
    formConfig.fields.forEach((field) => {
      switch (field.type) {
        case "text":
          mockData[field.name] = `Sample ${field.label}`;
          break;
        case "textarea":
          mockData[field.name] =
            `This is a sample description for ${field.label}.`;
          break;
        case "number":
          mockData[field.name] = Math.floor(Math.random() * 100);
          break;
        case "checkbox":
          mockData[field.name] = Math.random() > 0.5;
          break;
        case "select":
        case "radio":
          if (field.options && field.options.length > 0) {
            const randomIndex = Math.floor(
              Math.random() * field.options.length,
            );
            mockData[field.name] = field.options[randomIndex].value;
          }
          break;
        case "multiselect":
          if (field.options && field.options.length > 0) {
            const numSelected =
              Math.floor(Math.random() * field.options.length) + 1;
            const selectedIndices = new Set<number>();
            while (selectedIndices.size < numSelected) {
              selectedIndices.add(
                Math.floor(Math.random() * field.options.length),
              );
            }
            mockData[field.name] = Array.from(selectedIndices).map(
              (index) => field.options![index].value,
            );
          } else {
            mockData[field.name] = [];
          }
          break;
        case "date":
          mockData[field.name] = new Date(
            Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000,
          )
            .toISOString()
            .split("T")[0];
          break;
        case "datetime":
          mockData[field.name] = new Date(
            Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000,
          ).toISOString();
          break;
        case "email":
          mockData[field.name] =
            `user${Math.floor(Math.random() * 1000)}@example.com`;
          break;
        case "phone":
          mockData[field.name] = `+971${Math.floor(Math.random() * 10000000)}`;
          break;
        case "file":
        case "image":
          mockData[field.name] = null;
          break;
        case "repeater":
          if (field.fields) {
            const numItems = Math.floor(Math.random() * 3) + 1;
            mockData[field.name] = Array.from({ length: numItems }, () => {
              const itemData: Record<string, any> = {};
              field.fields!.forEach((subField) => {
                // Recursively generate mock data for subfields
                // This is simplified for now
                itemData[subField.name] = `Sample ${subField.label}`;
              });
              return itemData;
            });
          } else {
            mockData[field.name] = [];
          }
          break;
        default:
          mockData[field.name] = null;
      }
    });

    return mockData;
  }

  /**
   * Create a multi-step form workflow
   */
  createFormWorkflow(
    workflowId: string,
    formIds: string[],
    clientType: ClientType,
    options?: {
      title?: string;
      description?: string;
      allowSkipSteps?: boolean;
    },
  ): {
    id: string;
    steps: Array<{ formId: string; title: string; optional: boolean }>;
  } {
    // Validate that all forms exist
    const invalidForms = formIds.filter((id) => !formRegistry.getFormById(id));
    if (invalidForms.length > 0) {
      throw new Error(
        `Invalid form IDs in workflow: ${invalidForms.join(", ")}`,
      );
    }

    // Create workflow steps from the forms
    const steps = formIds.map((formId) => {
      const form = formRegistry.getFormById(formId)!;
      const formMetadata = formRegistry.getClientSpecificFormMetadata(
        formId,
        clientType,
      )!;

      // Determine if the step is optional based on dependencies
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

      return {
        formId,
        title: form.title,
        optional: !isRequired,
      };
    });

    // Register dependencies between workflow steps
    for (let i = 0; i < formIds.length - 1; i++) {
      const currentFormId = formIds[i];
      const nextFormId = formIds[i + 1];

      // Check if dependency already exists
      const currentForm = formRegistry.getFormById(nextFormId);
      const alreadyHasDependency =
        currentForm?.dependencies.some((dep) => dep.formId === currentFormId) ||
        false;

      if (!alreadyHasDependency) {
        // Add dependency to make the workflow sequential
        // This would be implemented in a real system by updating the form registry
        console.log(`Would add dependency: ${currentFormId} -> ${nextFormId}`);
      }
    }

    return {
      id: workflowId,
      steps,
    };
  }

  /**
   * Get form workflow status
   */
  getFormWorkflowStatus(
    formId: string,
    clientType: ClientType,
  ): {
    currentStep: string;
    nextSteps: string[];
    previousSteps: string[];
  } | null {
    const formMetadata = formRegistry.getClientSpecificFormMetadata(
      formId,
      clientType,
    );
    if (!formMetadata || !formMetadata.workflow) return null;

    // In a real implementation, this would query a workflow engine
    // For now, we'll return a simplified workflow status
    const workflowId = formMetadata.workflow;

    // Get dependent forms as next steps
    const dependentForms = formDependencyResolver.getDependentForms(formId);
    const nextSteps = dependentForms.map((depFormId) => {
      const depForm = formRegistry.getFormById(depFormId);
      return depForm ? depForm.title : depFormId;
    });

    // Get prerequisite forms as previous steps
    const prerequisites = formMetadata.dependencies
      .filter((dep) => dep.type === "prerequisite")
      .map((dep) => {
        const preForm = formRegistry.getFormById(dep.formId);
        return preForm ? preForm.title : dep.formId;
      });

    return {
      currentStep: formMetadata.title,
      nextSteps,
      previousSteps: prerequisites,
    };
  }
}

// Export singleton instance
export const dynamicFormEngine = new DynamicFormEngine();
