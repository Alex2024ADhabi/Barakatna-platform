import {
  ClientType,
  FormDependency,
  FormField,
  FormModule,
} from "../forms/types";
import { formRegistry } from "../forms/registry";

/**
 * Form Parameter Dependency Types
 */
export enum ParameterDependencyType {
  DIRECT = "direct", // Direct dependency between parameters
  DERIVED = "derived", // Value is derived from another parameter
  CONDITIONAL = "conditional", // Parameter's visibility/requirement is conditional on another
  VALIDATION = "validation", // Parameter's validation depends on another
  WORKFLOW = "workflow", // Parameter triggers workflow actions
}

/**
 * Parameter Change Event Types
 */
export enum ParameterChangeEventType {
  VALUE_CHANGED = "value_changed",
  VISIBILITY_CHANGED = "visibility_changed",
  VALIDATION_CHANGED = "validation_changed",
  REQUIREMENT_CHANGED = "requirement_changed",
  OPTIONS_CHANGED = "options_changed",
}

/**
 * Parameter Change Event
 */
export interface ParameterChangeEvent {
  formId: string;
  parameterId: string;
  eventType: ParameterChangeEventType;
  previousValue?: any;
  newValue?: any;
  timestamp: Date;
  userId?: string;
  clientType: ClientType;
  metadata?: Record<string, any>;
}

/**
 * Parameter Dependency Definition
 */
export interface ParameterDependency {
  sourceFormId: string;
  sourceParameterId: string;
  targetFormId: string;
  targetParameterId: string;
  dependencyType: ParameterDependencyType;
  transformationFunction?: string; // JavaScript function as string that can be evaluated
  condition?: string; // Condition when this dependency applies
  clientTypes?: ClientType[];
  description: string;
}

/**
 * Parameter Subscription
 */
export interface ParameterSubscription {
  id: string;
  formId: string;
  parameterId: string;
  callback: (event: ParameterChangeEvent) => void;
  filter?: (event: ParameterChangeEvent) => boolean;
}

/**
 * Parameter Audit Log Entry
 */
export interface ParameterAuditLogEntry extends ParameterChangeEvent {
  id: string;
  affectedParameters?: {
    formId: string;
    parameterId: string;
    changeType: ParameterChangeEventType;
  }[];
}

/**
 * Form Parameter Tracker Service
 *
 * Tracks parameter dependencies across forms, manages change events,
 * maintains data consistency, and logs parameter history.
 */
class FormParameterTrackerService {
  private parameterDependencies: ParameterDependency[] = [];
  private parameterSubscriptions: ParameterSubscription[] = [];
  private parameterAuditLog: ParameterAuditLogEntry[] = [];
  private parameterCache: Map<string, Map<string, any>> = new Map(); // formId -> (parameterId -> value)

  /**
   * Register a parameter dependency
   */
  registerDependency(dependency: ParameterDependency): void {
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

      // Only check parameter existence if we have metadata
      let sourceParameterExists = true;
      let targetParameterExists = true;

      if (sourceFormMetadata) {
        sourceParameterExists = sourceFormMetadata.fields.some(
          (field) =>
            field.id === dependency.sourceParameterId ||
            field.name === dependency.sourceParameterId,
        );
      }

      if (targetFormMetadata) {
        targetParameterExists = targetFormMetadata.fields.some(
          (field) =>
            field.id === dependency.targetParameterId ||
            field.name === dependency.targetParameterId,
        );
      }

      if (!sourceParameterExists || !targetParameterExists) {
        console.warn(
          `Cannot register dependency: Source parameter ${dependency.sourceParameterId} or target parameter ${dependency.targetParameterId} not found.`,
        );
        // For demo purposes, we'll continue even if parameters don't exist
        // return;
      }

      this.parameterDependencies.push(dependency);
      console.log(
        `Registered dependency: ${dependency.sourceFormId}.${dependency.sourceParameterId} -> ${dependency.targetFormId}.${dependency.targetParameterId}`,
      );
    } catch (error) {
      console.error(`Error registering dependency: ${error}`);
    }
  }

  /**
   * Register multiple parameter dependencies
   */
  registerDependencies(dependencies: ParameterDependency[]): void {
    dependencies.forEach((dependency) => this.registerDependency(dependency));
  }

  /**
   * Get all dependencies for a parameter
   */
  getDependenciesForParameter(
    formId: string,
    parameterId: string,
  ): ParameterDependency[] {
    return this.parameterDependencies.filter(
      (dep) =>
        dep.sourceFormId === formId && dep.sourceParameterId === parameterId,
    );
  }

  /**
   * Get all dependencies that affect a parameter
   */
  getDependenciesAffectingParameter(
    formId: string,
    parameterId: string,
  ): ParameterDependency[] {
    return this.parameterDependencies.filter(
      (dep) =>
        dep.targetFormId === formId && dep.targetParameterId === parameterId,
    );
  }

  /**
   * Subscribe to parameter changes
   */
  subscribeToParameter(
    formId: string,
    parameterId: string,
    callback: (event: ParameterChangeEvent) => void,
    filter?: (event: ParameterChangeEvent) => boolean,
  ): string {
    const subscriptionId = `sub_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    this.parameterSubscriptions.push({
      id: subscriptionId,
      formId,
      parameterId,
      callback,
      filter,
    });

    return subscriptionId;
  }

  /**
   * Unsubscribe from parameter changes
   */
  unsubscribe(subscriptionId: string): boolean {
    const initialLength = this.parameterSubscriptions.length;
    this.parameterSubscriptions = this.parameterSubscriptions.filter(
      (sub) => sub.id !== subscriptionId,
    );
    return this.parameterSubscriptions.length < initialLength;
  }

  /**
   * Track parameter change
   */
  trackParameterChange(
    formId: string,
    parameterId: string,
    eventType: ParameterChangeEventType,
    previousValue: any,
    newValue: any,
    clientType: ClientType,
    userId?: string,
    metadata?: Record<string, any>,
  ): void {
    // Create change event
    const changeEvent: ParameterChangeEvent = {
      formId,
      parameterId,
      eventType,
      previousValue,
      newValue,
      timestamp: new Date(),
      userId,
      clientType,
      metadata,
    };

    // Update parameter cache
    if (!this.parameterCache.has(formId)) {
      this.parameterCache.set(formId, new Map());
    }
    this.parameterCache.get(formId)?.set(parameterId, newValue);

    // Process dependencies
    const affectedParameters = this.processDependencies(changeEvent);

    // Create audit log entry
    const auditLogEntry: ParameterAuditLogEntry = {
      ...changeEvent,
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      affectedParameters,
    };

    // Add to audit log
    this.parameterAuditLog.push(auditLogEntry);

    // Notify subscribers
    this.notifySubscribers(changeEvent);
  }

  /**
   * Process dependencies affected by a parameter change
   */
  private processDependencies(changeEvent: ParameterChangeEvent): {
    formId: string;
    parameterId: string;
    changeType: ParameterChangeEventType;
  }[] {
    const { formId, parameterId } = changeEvent;
    const affectedParameters: {
      formId: string;
      parameterId: string;
      changeType: ParameterChangeEventType;
    }[] = [];

    // Find all dependencies where this parameter is the source
    const dependencies = this.getDependenciesForParameter(formId, parameterId);

    // Process each dependency
    dependencies.forEach((dependency) => {
      // Check if this dependency applies to the current client type
      if (
        dependency.clientTypes &&
        !dependency.clientTypes.includes(changeEvent.clientType)
      ) {
        return; // Skip if not applicable to this client type
      }

      // Check if condition is met (if any)
      if (dependency.condition) {
        try {
          const conditionMet = this.evaluateExpression(
            dependency.condition,
            changeEvent,
            dependency,
          );
          if (!conditionMet) {
            return; // Skip if condition not met
          }
        } catch (error) {
          console.error(`Error evaluating condition for dependency: ${error}`);
          return;
        }
      }

      // Determine the new value for the target parameter
      let newTargetValue = changeEvent.newValue;

      // Apply transformation if specified
      if (dependency.transformationFunction) {
        try {
          newTargetValue = this.evaluateExpression(
            dependency.transformationFunction,
            changeEvent,
            dependency,
          );
        } catch (error) {
          console.error(`Error applying transformation: ${error}`);
          return;
        }
      }

      // Determine the change event type for the target parameter
      let targetChangeEventType: ParameterChangeEventType;

      switch (dependency.dependencyType) {
        case ParameterDependencyType.DIRECT:
        case ParameterDependencyType.DERIVED:
          targetChangeEventType = ParameterChangeEventType.VALUE_CHANGED;
          break;
        case ParameterDependencyType.CONDITIONAL:
          targetChangeEventType = ParameterChangeEventType.VISIBILITY_CHANGED;
          break;
        case ParameterDependencyType.VALIDATION:
          targetChangeEventType = ParameterChangeEventType.VALIDATION_CHANGED;
          break;
        case ParameterDependencyType.WORKFLOW:
          // For workflow dependencies, we don't directly change the target parameter
          // but we still want to notify subscribers
          targetChangeEventType = ParameterChangeEventType.VALUE_CHANGED;
          break;
        default:
          targetChangeEventType = ParameterChangeEventType.VALUE_CHANGED;
      }

      // Get the current value of the target parameter
      const targetFormCache = this.parameterCache.get(dependency.targetFormId);
      const currentTargetValue = targetFormCache?.get(
        dependency.targetParameterId,
      );

      // Track the change to the target parameter
      this.trackParameterChange(
        dependency.targetFormId,
        dependency.targetParameterId,
        targetChangeEventType,
        currentTargetValue,
        newTargetValue,
        changeEvent.clientType,
        changeEvent.userId,
        {
          sourceDependency: `${dependency.sourceFormId}.${dependency.sourceParameterId}`,
          dependencyType: dependency.dependencyType,
        },
      );

      // Add to affected parameters
      affectedParameters.push({
        formId: dependency.targetFormId,
        parameterId: dependency.targetParameterId,
        changeType: targetChangeEventType,
      });
    });

    return affectedParameters;
  }

  /**
   * Notify subscribers of a parameter change
   */
  private notifySubscribers(changeEvent: ParameterChangeEvent): void {
    const { formId, parameterId } = changeEvent;

    // Find all subscribers for this parameter
    const subscribers = this.parameterSubscriptions.filter(
      (sub) => sub.formId === formId && sub.parameterId === parameterId,
    );

    // Notify each subscriber
    subscribers.forEach((subscriber) => {
      // Apply filter if specified
      if (subscriber.filter && !subscriber.filter(changeEvent)) {
        return;
      }

      try {
        subscriber.callback(changeEvent);
      } catch (error) {
        console.error(`Error notifying subscriber: ${error}`);
      }
    });
  }

  /**
   * Evaluate an expression in the context of a change event and dependency
   */
  private evaluateExpression(
    expression: string,
    changeEvent: ParameterChangeEvent,
    dependency: ParameterDependency,
  ): any {
    // Create a safe evaluation context
    const context = {
      sourceValue: changeEvent.newValue,
      previousSourceValue: changeEvent.previousValue,
      sourceFormId: dependency.sourceFormId,
      sourceParameterId: dependency.sourceParameterId,
      targetFormId: dependency.targetFormId,
      targetParameterId: dependency.targetParameterId,
      clientType: changeEvent.clientType,
      getParameterValue: (formId: string, parameterId: string) => {
        return this.getParameterValue(formId, parameterId);
      },
    };

    // Create a function from the expression
    const func = new Function(
      ...Object.keys(context),
      `"use strict"; return (${expression});`,
    );

    // Execute the function with the context
    return func(...Object.values(context));
  }

  /**
   * Get the current value of a parameter
   */
  getParameterValue(formId: string, parameterId: string): any {
    return this.parameterCache.get(formId)?.get(parameterId);
  }

  /**
   * Set the value of a parameter
   */
  setParameterValue(
    formId: string,
    parameterId: string,
    value: any,
    clientType: ClientType,
    userId?: string,
  ): void {
    const previousValue = this.getParameterValue(formId, parameterId);
    this.trackParameterChange(
      formId,
      parameterId,
      ParameterChangeEventType.VALUE_CHANGED,
      previousValue,
      value,
      clientType,
      userId,
    );
  }

  /**
   * Get audit log for a parameter
   */
  getParameterAuditLog(
    formId: string,
    parameterId: string,
  ): ParameterAuditLogEntry[] {
    return this.parameterAuditLog.filter(
      (entry) => entry.formId === formId && entry.parameterId === parameterId,
    );
  }

  /**
   * Get all audit logs
   */
  getAllAuditLogs(): ParameterAuditLogEntry[] {
    return [...this.parameterAuditLog];
  }

  /**
   * Clear audit logs older than a specified date
   */
  clearAuditLogsOlderThan(date: Date): number {
    const initialCount = this.parameterAuditLog.length;
    this.parameterAuditLog = this.parameterAuditLog.filter(
      (entry) => entry.timestamp >= date,
    );
    return initialCount - this.parameterAuditLog.length;
  }

  /**
   * Initialize common parameter dependencies
   */
  initializeCommonDependencies(): void {
    // Beneficiary ID flows through assessment, committee, project forms
    this.registerDependencies([
      {
        sourceFormId: "initial-assessment-form",
        sourceParameterId: "beneficiaryId",
        targetFormId: "room-assessment-form",
        targetParameterId: "beneficiaryId",
        dependencyType: ParameterDependencyType.DIRECT,
        description:
          "Beneficiary ID flows from initial assessment to room assessment",
        clientTypes: [ClientType.FDF, ClientType.ADHA, ClientType.CASH],
      },
      {
        sourceFormId: "initial-assessment-form",
        sourceParameterId: "beneficiaryId",
        targetFormId: "project-creation-form",
        targetParameterId: "beneficiaryId",
        dependencyType: ParameterDependencyType.DIRECT,
        description:
          "Beneficiary ID flows from initial assessment to project creation",
        clientTypes: [ClientType.FDF, ClientType.ADHA, ClientType.CASH],
      },
    ]);

    // Assessment measurements drive project scope and budget allocation
    this.registerDependencies([
      {
        sourceFormId: "room-assessment-form",
        sourceParameterId: "estimatedCost",
        targetFormId: "project-creation-form",
        targetParameterId: "totalBudget",
        dependencyType: ParameterDependencyType.DERIVED,
        transformationFunction: "sourceValue > 0 ? sourceValue : 0",
        description: "Room assessment estimated cost affects project budget",
        clientTypes: [ClientType.FDF, ClientType.ADHA, ClientType.CASH],
      },
      {
        sourceFormId: "room-assessment-form",
        sourceParameterId: "recommendedModifications",
        targetFormId: "project-creation-form",
        targetParameterId: "projectDescription",
        dependencyType: ParameterDependencyType.DERIVED,
        transformationFunction:
          "'Project based on recommendations: ' + sourceValue.join(', ')",
        description:
          "Room assessment recommendations affect project description",
        clientTypes: [ClientType.FDF, ClientType.ADHA, ClientType.CASH],
      },
    ]);

    // Committee decisions affect project approval and budget release
    this.registerDependencies([
      {
        sourceFormId: "committee-decision-form",
        sourceParameterId: "decision",
        targetFormId: "project-creation-form",
        targetParameterId: "statusId",
        dependencyType: ParameterDependencyType.WORKFLOW,
        transformationFunction: "sourceValue === 'approved' ? 2 : 1", // 2 = In Progress, 1 = Pending
        description: "Committee approval decision affects project status",
        clientTypes: [ClientType.FDF, ClientType.ADHA],
      },
      {
        sourceFormId: "committee-decision-form",
        sourceParameterId: "approvedBudget",
        targetFormId: "project-creation-form",
        targetParameterId: "totalBudget",
        dependencyType: ParameterDependencyType.DIRECT,
        condition: "sourceValue === 'approved'",
        description: "Committee approved budget flows to project budget",
        clientTypes: [ClientType.FDF, ClientType.ADHA],
      },
    ]);

    // Project completion triggers financial processes and reporting
    this.registerDependencies([
      {
        sourceFormId: "project-creation-form",
        sourceParameterId: "statusId",
        targetFormId: "invoice-generation-form",
        targetParameterId: "projectId",
        dependencyType: ParameterDependencyType.WORKFLOW,
        condition: "sourceValue === 3", // 3 = Completed
        transformationFunction: "getParameterValue(sourceFormId, 'id')",
        description: "Project completion triggers invoice generation",
        clientTypes: [ClientType.FDF, ClientType.ADHA, ClientType.CASH],
      },
      {
        sourceFormId: "project-creation-form",
        sourceParameterId: "statusId",
        targetFormId: "financial-report-form",
        targetParameterId: "projectId",
        dependencyType: ParameterDependencyType.WORKFLOW,
        condition: "sourceValue === 3", // 3 = Completed
        transformationFunction: "getParameterValue(sourceFormId, 'id')",
        description: "Project completion triggers financial reporting",
        clientTypes: [ClientType.FDF, ClientType.ADHA, ClientType.CASH],
      },
    ]);
  }
}

// Export singleton instance
export const formParameterTracker = new FormParameterTrackerService();
