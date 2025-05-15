import {
  ClientType,
  FormMetadata,
  FormModule,
  FormPermission,
  FormRegistryEntry,
  FormField,
  FormDependency,
} from "./types";

// Import the FormParameterTracker service
import { formParameterTracker } from "../services/formParameterTrackerService";

/**
 * Form Registry Service
 *
 * Central registry for all forms in the Barakatna Platform.
 * Maps forms to modules, permissions, dependencies, and client-specific variations.
 * Integrates with FormParameterTracker to manage cross-form parameter dependencies.
 */
class FormRegistryService {
  private formRegistry: Map<string, FormRegistryEntry> = new Map();
  private formMetadata: Map<string, FormMetadata> = new Map();
  private formTemplates: Map<string, FormMetadata> = new Map();
  private formCache: Map<string, any> = new Map();
  private initialized: boolean = false;

  /**
   * Register a form in the registry
   */
  registerForm(entry: FormRegistryEntry, metadata: FormMetadata): void {
    if (this.formRegistry.has(entry.id)) {
      console.warn(
        `Form with ID ${entry.id} already exists in registry. Overwriting.`,
      );
    }

    this.formRegistry.set(entry.id, entry);
    this.formMetadata.set(entry.id, metadata);

    // Register form parameter dependencies if they exist
    this.registerFormParameterDependencies(entry.id, metadata);
  }

  /**
   * Register form parameter dependencies
   */
  private registerFormParameterDependencies(
    formId: string,
    metadata: FormMetadata,
  ): void {
    // This will be called when the FormParameterTracker is initialized
    if (!this.initialized) return;

    // Process field dependencies within the form
    metadata.fields.forEach((field) => {
      if (field.dependencies) {
        this.registerFieldDependencies(formId, field);
      }
    });

    // Process form dependencies (cross-form)
    if (metadata.dependencies) {
      this.registerCrossFormDependencies(formId, metadata.dependencies);
    }

    // Register client-specific dependencies if they exist
    if (metadata.clientTypeOverrides) {
      Object.entries(metadata.clientTypeOverrides).forEach(
        ([clientType, overrides]) => {
          // Register client-specific field dependencies
          if (overrides.fields) {
            overrides.fields.forEach((field) => {
              if (field.dependencies) {
                this.registerFieldDependencies(
                  formId,
                  field,
                  clientType as ClientType,
                );
              }
            });
          }

          // Register client-specific form dependencies
          if (overrides.dependencies) {
            this.registerCrossFormDependencies(
              formId,
              overrides.dependencies,
              clientType as ClientType,
            );
          }
        },
      );
    }
  }

  /**
   * Register field dependencies within a form
   */
  private registerFieldDependencies(
    formId: string,
    field: FormField,
    clientType?: ClientType,
  ): void {
    if (!field.dependencies || field.dependencies.length === 0) return;

    // Register each dependency with the FormParameterTracker
    field.dependencies.forEach((dependency) => {
      // Skip if this dependency is not applicable to the specified client type
      if (
        clientType &&
        dependency.clientTypes &&
        !dependency.clientTypes.includes(clientType)
      ) {
        return;
      }

      try {
        // Register the dependency with the FormParameterTracker
        formParameterTracker.registerDependency({
          sourceFormId: formId,
          sourceParameterId: dependency.sourceField,
          targetFormId: formId,
          targetParameterId: field.name,
          dependencyType: dependency.type,
          clientTypes: clientType ? [clientType] : undefined,
          transformationFunction: dependency.action,
          condition: dependency.condition,
          description:
            dependency.description ||
            `${field.name} depends on ${dependency.sourceField}`,
        });

        console.log(
          `Registered field dependency: ${formId}.${dependency.sourceField} -> ${formId}.${field.name}`,
          {
            clientType,
            dependencyType: dependency.type,
          },
        );
      } catch (error) {
        console.error(
          `Failed to register field dependency: ${formId}.${dependency.sourceField} -> ${formId}.${field.name}`,
          error,
        );
      }
    });
  }

  /**
   * Register cross-form dependencies
   */
  private registerCrossFormDependencies(
    formId: string,
    dependencies: FormDependency[],
    clientType?: ClientType,
  ): void {
    if (!dependencies || dependencies.length === 0) return;

    // Register each cross-form dependency with the FormParameterTracker
    dependencies.forEach((dependency) => {
      // Skip if this dependency is not applicable to the specified client type
      if (
        clientType &&
        dependency.clientTypes &&
        !dependency.clientTypes.includes(clientType)
      ) {
        return;
      }

      try {
        // For cross-form dependencies, we need to determine the target parameters
        const sourceFormId = dependency.formId;
        const targetFormId = formId;

        // If specific field mappings are provided, register each mapping
        if (dependency.fieldMappings && dependency.fieldMappings.length > 0) {
          dependency.fieldMappings.forEach((mapping) => {
            formParameterTracker.registerDependency({
              sourceFormId: sourceFormId,
              sourceParameterId: mapping.sourceField,
              targetFormId: targetFormId,
              targetParameterId: mapping.targetField,
              dependencyType: dependency.type,
              clientTypes: clientType ? [clientType] : undefined,
              transformationFunction: mapping.transformationRule,
              description:
                mapping.description ||
                `${targetFormId}.${mapping.targetField} depends on ${sourceFormId}.${mapping.sourceField}`,
            });
          });
        } else {
          // If no specific mappings, register a general form dependency
          formParameterTracker.registerFormDependency({
            sourceFormId: sourceFormId,
            targetFormId: targetFormId,
            dependencyType: dependency.type,
            required: dependency.required,
            clientTypes: clientType ? [clientType] : undefined,
            description:
              dependency.description ||
              `${targetFormId} depends on ${sourceFormId}`,
          });
        }

        console.log(
          `Registered cross-form dependency: ${sourceFormId} -> ${targetFormId}`,
          {
            clientType,
            dependencyType: dependency.type,
            required: dependency.required,
          },
        );
      } catch (error) {
        console.error(
          `Failed to register cross-form dependency: ${dependency.formId} -> ${formId}`,
          error,
        );
      }
    });
  }

  /**
   * Initialize the form registry and parameter dependencies
   */
  initialize(): void {
    if (this.initialized) return;

    // Initialize common parameter dependencies
    formParameterTracker.initializeCommonDependencies();

    // Register parameter dependencies for all forms
    this.formRegistry.forEach((entry, formId) => {
      const metadata = this.formMetadata.get(formId);
      if (metadata) {
        this.registerFormParameterDependencies(formId, metadata);
      }
    });

    this.initialized = true;
  }

  /**
   * Get all forms in the registry
   */
  getAllForms(): FormRegistryEntry[] {
    return Array.from(this.formRegistry.values());
  }

  /**
   * Get form by ID
   */
  getFormById(id: string): FormRegistryEntry | undefined {
    return this.formRegistry.get(id);
  }

  /**
   * Get form metadata by ID
   */
  getFormMetadataById(id: string): FormMetadata | undefined {
    return this.formMetadata.get(id);
  }

  /**
   * Get forms by module
   */
  getFormsByModule(module: FormModule): FormRegistryEntry[] {
    return this.getAllForms().filter((form) => form.module === module);
  }

  /**
   * Get forms by client type
   */
  getFormsByClientType(clientType: ClientType): FormRegistryEntry[] {
    return this.getAllForms().filter((form) =>
      form.clientTypes.includes(clientType),
    );
  }

  /**
   * Get forms by permission and role
   */
  getFormsByPermissionAndRole(
    permission: FormPermission,
    role: string,
  ): FormRegistryEntry[] {
    return this.getAllForms().filter((form) => {
      const roles = form.permissions[permission] || [];
      return roles.includes(role) || roles.includes("*");
    });
  }

  /**
   * Get forms that depend on a specific form
   */
  getFormDependents(
    formId: string,
    clientType?: ClientType,
  ): FormRegistryEntry[] {
    return this.getAllForms().filter((form) => {
      // Check standard dependencies
      const hasStandardDependency = form.dependencies.some((dep) => {
        // If clientType is specified, check if dependency applies to this client type
        if (clientType && dep.clientTypes) {
          return dep.formId === formId && dep.clientTypes.includes(clientType);
        }
        return dep.formId === formId;
      });

      if (hasStandardDependency) return true;

      // Check client-specific dependencies if clientType is specified
      if (clientType) {
        const formMetadata = this.getFormMetadataById(form.id);
        if (formMetadata?.clientTypeOverrides?.[clientType]?.dependencies) {
          return formMetadata.clientTypeOverrides[
            clientType
          ].dependencies!.some((dep) => dep.formId === formId);
        }
      }

      return false;
    });
  }

  /**
   * Get forms that a specific form depends on
   */
  getFormDependencies(formId: string): FormRegistryEntry[] {
    const form = this.getFormById(formId);
    if (!form) return [];

    return form.dependencies
      .map((dep) => this.getFormById(dep.formId))
      .filter((f): f is FormRegistryEntry => f !== undefined);
  }

  /**
   * Get client-specific form metadata
   */
  getClientSpecificFormMetadata(
    formId: string,
    clientType: ClientType,
  ): FormMetadata | undefined {
    const baseMetadata = this.getFormMetadataById(formId);
    if (!baseMetadata) return undefined;

    // If form doesn't support this client type, return undefined
    if (!baseMetadata.clientTypes.includes(clientType)) {
      return undefined;
    }

    // If no client-specific overrides, return the base metadata
    if (
      !baseMetadata.clientTypeOverrides ||
      !baseMetadata.clientTypeOverrides[clientType]
    ) {
      return baseMetadata;
    }

    // Apply client-specific overrides
    const overrides = baseMetadata.clientTypeOverrides[clientType];
    const clientSpecificMetadata: FormMetadata = {
      ...baseMetadata,
      ...overrides,
      // Ensure fields have client-specific overrides applied
      fields: baseMetadata.fields.map((field) => {
        if (
          field.clientTypeOverrides &&
          field.clientTypeOverrides[clientType]
        ) {
          return {
            ...field,
            ...field.clientTypeOverrides[clientType],
            // Preserve the original clientTypeOverrides to maintain all client type information
            clientTypeOverrides: field.clientTypeOverrides,
          };
        }
        return field;
      }),
    };

    // Apply client-specific field visibility rules
    if (overrides.fieldVisibility) {
      clientSpecificMetadata.fields = clientSpecificMetadata.fields.filter(
        (field) => {
          // Check if field is explicitly hidden for this client type
          if (overrides.fieldVisibility.hidden?.includes(field.name)) {
            return false;
          }
          // Check if field is not in the required list when only showing required fields
          if (
            overrides.fieldVisibility.showOnlyListed &&
            !overrides.fieldVisibility.required?.includes(field.name) &&
            !overrides.fieldVisibility.optional?.includes(field.name)
          ) {
            return false;
          }
          return true;
        },
      );

      // Update required status based on client-specific rules
      clientSpecificMetadata.fields = clientSpecificMetadata.fields.map(
        (field) => {
          if (overrides.fieldVisibility.required?.includes(field.name)) {
            return { ...field, required: true };
          }
          if (overrides.fieldVisibility.optional?.includes(field.name)) {
            return { ...field, required: false };
          }
          return field;
        },
      );
    }

    return clientSpecificMetadata;
  }

  /**
   * Check if a user has permission for a form
   */
  hasFormPermission(
    formId: string,
    permission: FormPermission,
    userRoles: string[],
  ): boolean {
    const form = this.getFormById(formId);
    if (!form) return false;

    const permittedRoles = form.permissions[permission] || [];

    // Check if any of the user's roles are permitted
    return userRoles.some(
      (role) => permittedRoles.includes(role) || permittedRoles.includes("*"),
    );
  }

  /**
   * Get parameter value from a form
   */
  getFormParameterValue(formId: string, parameterId: string): any {
    return formParameterTracker.getParameterValue(formId, parameterId);
  }

  /**
   * Set parameter value in a form
   */
  setFormParameterValue(
    formId: string,
    parameterId: string,
    value: any,
    clientType: ClientType,
    userId?: string,
  ): void {
    formParameterTracker.setParameterValue(
      formId,
      parameterId,
      value,
      clientType,
      userId,
    );
  }

  /**
   * Subscribe to parameter changes
   */
  subscribeToParameterChanges(
    formId: string,
    parameterId: string,
    callback: (event: any) => void,
    filter?: (event: any) => boolean,
  ): string {
    return formParameterTracker.subscribeToParameter(
      formId,
      parameterId,
      callback,
      filter,
    );
  }

  /**
   * Unsubscribe from parameter changes
   */
  unsubscribeFromParameterChanges(subscriptionId: string): boolean {
    return formParameterTracker.unsubscribe(subscriptionId);
  }

  /**
   * Get audit log for a form parameter
   */
  getFormParameterAuditLog(formId: string, parameterId: string): any[] {
    return formParameterTracker.getParameterAuditLog(formId, parameterId);
  }

  /**
   * Register a form template
   */
  registerFormTemplate(templateId: string, template: FormMetadata): void {
    if (this.formTemplates.has(templateId)) {
      console.warn(
        `Form template with ID ${templateId} already exists. Overwriting.`,
      );
    }
    this.formTemplates.set(templateId, template);
  }

  /**
   * Get a form template by ID
   */
  getFormTemplate(templateId: string): FormMetadata | undefined {
    return this.formTemplates.get(templateId);
  }

  /**
   * Get all form templates
   */
  getAllFormTemplates(): Map<string, FormMetadata> {
    return this.formTemplates;
  }

  /**
   * Create a form from a template
   */
  createFormFromTemplate(
    formId: string,
    templateId: string,
    overrides?: Partial<FormRegistryEntry>,
    metadataOverrides?: Partial<FormMetadata>,
  ): FormRegistryEntry | undefined {
    const template = this.formTemplates.get(templateId);
    if (!template) {
      console.error(`Form template with ID ${templateId} not found.`);
      return undefined;
    }

    // Create a new form entry based on the template
    const baseEntry: FormRegistryEntry = {
      id: formId,
      title: template.title,
      description: template.description || "",
      module: template.module,
      clientTypes: template.clientTypes,
      permissions: template.permissions || {},
      dependencies: template.dependencies || [],
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Apply any overrides
    const entry = { ...baseEntry, ...overrides };

    // Create metadata with overrides
    const metadata = { ...template, ...metadataOverrides };

    // Register the new form
    this.registerForm(entry, metadata);

    return entry;
  }

  /**
   * Create a new field for a form
   */
  createField(
    name: string,
    type: string,
    options: Partial<FormField>,
  ): FormField {
    return {
      name,
      type,
      label: options.label || name,
      required: options.required !== undefined ? options.required : false,
      defaultValue: options.defaultValue,
      placeholder: options.placeholder,
      helpText: options.helpText,
      options: options.options,
      validationRules: options.validationRules || [],
      dependencies: options.dependencies || [],
      clientTypeOverrides: options.clientTypeOverrides,
      noPropagation: options.noPropagation,
      localOnly: options.localOnly,
      validationExemptions: options.validationExemptions,
    };
  }

  /**
   * Add validation rule to a field
   */
  addValidationRule(
    field: FormField,
    rule: string | Function | { type: string; value: any; message: string },
  ): FormField {
    const updatedField = { ...field };
    if (!updatedField.validationRules) {
      updatedField.validationRules = [];
    }
    updatedField.validationRules.push(rule);
    return updatedField;
  }

  /**
   * Cache form data
   */
  cacheFormData(formId: string, key: string, data: any): void {
    const cacheKey = `${formId}:${key}`;
    this.formCache.set(cacheKey, {
      data,
      timestamp: Date.now(),
    });
  }

  /**
   * Get cached form data
   */
  getCachedFormData(formId: string, key: string, maxAge?: number): any {
    const cacheKey = `${formId}:${key}`;
    const cached = this.formCache.get(cacheKey);

    if (!cached) return undefined;

    // Check if cache is expired
    if (maxAge && Date.now() - cached.timestamp > maxAge) {
      this.formCache.delete(cacheKey);
      return undefined;
    }

    return cached.data;
  }

  /**
   * Clear form cache
   */
  clearFormCache(formId?: string): void {
    if (formId) {
      // Clear cache for specific form
      const keysToDelete: string[] = [];
      this.formCache.forEach((_, key) => {
        if (key.startsWith(`${formId}:`)) {
          keysToDelete.push(key);
        }
      });
      keysToDelete.forEach((key) => this.formCache.delete(key));
    } else {
      // Clear all cache
      this.formCache.clear();
    }
  }
}

// Export singleton instance
export const formRegistry = new FormRegistryService();

// Initialize the form registry after all forms are registered
// This should be called in the application's initialization code
export function initializeFormRegistry(): void {
  formRegistry.initialize();
}
