/**
 * Client Rules Service
 *
 * This service manages client-specific business rules in a structured format.
 * It provides functionality for rule evaluation, prioritization, conflict resolution,
 * and maintains an audit log of rule changes.
 */

import { ClientType } from "@/lib/forms/types";
import { clientConfigService } from "@/services/clientConfigService";

// Rule types
export enum RuleCategory {
  ELIGIBILITY = "eligibility",
  BUDGET = "budget",
  APPROVAL = "approval",
  SCHEDULING = "scheduling",
  DOCUMENT = "document",
}

export enum RuleOperator {
  EQUALS = "equals",
  NOT_EQUALS = "notEquals",
  GREATER_THAN = "greaterThan",
  LESS_THAN = "lessThan",
  GREATER_THAN_OR_EQUAL = "greaterThanOrEqual",
  LESS_THAN_OR_EQUAL = "lessThanOrEqual",
  CONTAINS = "contains",
  NOT_CONTAINS = "notContains",
  STARTS_WITH = "startsWith",
  ENDS_WITH = "endsWith",
  BETWEEN = "between",
  IN = "in",
  NOT_IN = "notIn",
  EXISTS = "exists",
  NOT_EXISTS = "notExists",
  REGEX = "regex",
}

export enum RuleAction {
  APPROVE = "approve",
  REJECT = "reject",
  ESCALATE = "escalate",
  NOTIFY = "notify",
  SET_VALUE = "setValue",
  CALCULATE = "calculate",
  REQUIRE_DOCUMENT = "requireDocument",
  SET_DEADLINE = "setDeadline",
  SET_REMINDER = "setReminder",
  CUSTOM = "custom",
}

export interface RuleCondition {
  field: string;
  operator: RuleOperator;
  value: any;
  valueType?: "string" | "number" | "boolean" | "date" | "array" | "object";
  isParameterized?: boolean; // Whether the value contains parameters that need substitution
}

export interface RuleActionConfig {
  type: RuleAction;
  target?: string; // Field or entity to apply the action to
  value?: any; // Value to set or use in calculation
  formula?: string; // Formula for calculations
  message?: string; // Message for notifications or rejections
  recipients?: string[]; // Recipients for notifications
  documentTypes?: string[]; // Document types for document requirements
  deadline?: number; // Deadline in days
  reminderDays?: number[]; // Days before deadline to send reminders
  customFunction?: string; // Name of custom function to execute
}

export interface BusinessRule {
  id: string;
  name: string;
  description: string;
  category: RuleCategory;
  clientTypes: ClientType[];
  conditions: RuleCondition[];
  conditionLogic?: string; // e.g., "(1 AND 2) OR 3" where numbers refer to condition indices
  actions: RuleActionConfig[];
  priority: number; // Higher number means higher priority
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
  version: number;
  tags?: string[];
  expiresAt?: Date; // Optional expiration date
}

export interface RuleEvaluationContext {
  clientTypeId: number;
  parameters: Record<string, any>;
  user?: string;
  timestamp?: Date;
}

export interface RuleEvaluationResult {
  ruleId: string;
  ruleName: string;
  category: RuleCategory;
  matched: boolean;
  actions: RuleActionConfig[];
  priority: number;
  appliedAt: Date;
  context: RuleEvaluationContext;
}

export interface RuleAuditEntry {
  ruleId: string;
  action:
    | "created"
    | "updated"
    | "deleted"
    | "activated"
    | "deactivated"
    | "evaluated";
  timestamp: Date;
  user: string;
  previousVersion?: Partial<BusinessRule>;
  newVersion?: Partial<BusinessRule>;
  evaluationResult?: RuleEvaluationResult;
  clientTypeId?: number;
}

class ClientRulesService {
  private static instance: ClientRulesService;
  private rules: Map<string, BusinessRule> = new Map();
  private ruleAuditLog: RuleAuditEntry[] = [];
  private ruleVersionHistory: Map<string, BusinessRule[]> = new Map();

  private constructor() {
    this.initializeDefaultRules();
  }

  public static getInstance(): ClientRulesService {
    if (!ClientRulesService.instance) {
      ClientRulesService.instance = new ClientRulesService();
    }
    return ClientRulesService.instance;
  }

  /**
   * Initialize default rules for different client types
   */
  private initializeDefaultRules(): void {
    // Eligibility rules
    this.createRule({
      id: "eligibility-age-fdf",
      name: "FDF Age Eligibility",
      description: "Beneficiary must be 60 years or older for FDF clients",
      category: RuleCategory.ELIGIBILITY,
      clientTypes: [ClientType.FDF],
      conditions: [
        {
          field: "beneficiary.age",
          operator: RuleOperator.GREATER_THAN_OR_EQUAL,
          value: 60,
        },
      ],
      actions: [
        {
          type: RuleAction.APPROVE,
          message: "Beneficiary meets age requirement",
        },
      ],
      priority: 100,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: "system",
      updatedBy: "system",
      version: 1,
    });

    // Budget allocation rules
    this.createRule({
      id: "budget-limit-adha",
      name: "ADHA Budget Limit",
      description: "Maximum budget allocation for ADHA projects",
      category: RuleCategory.BUDGET,
      clientTypes: [ClientType.ADHA],
      conditions: [
        {
          field: "project.estimatedCost",
          operator: RuleOperator.LESS_THAN_OR_EQUAL,
          value: 100000,
        },
      ],
      actions: [
        {
          type: RuleAction.APPROVE,
          message: "Project budget within limits",
        },
      ],
      priority: 90,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: "system",
      updatedBy: "system",
      version: 1,
    });

    // Approval rules
    this.createRule({
      id: "approval-threshold-cash",
      name: "Cash Client Approval Threshold",
      description:
        "Projects under 10,000 AED for cash clients can be approved by manager",
      category: RuleCategory.APPROVAL,
      clientTypes: [ClientType.CASH],
      conditions: [
        {
          field: "project.estimatedCost",
          operator: RuleOperator.LESS_THAN,
          value: 10000,
        },
      ],
      actions: [
        {
          type: RuleAction.SET_VALUE,
          target: "project.approvalLevel",
          value: "manager",
        },
      ],
      priority: 80,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: "system",
      updatedBy: "system",
      version: 1,
    });

    // Scheduling rules
    this.createRule({
      id: "scheduling-deadline-fdf",
      name: "FDF Project Deadline",
      description: "FDF projects must be completed within 90 days",
      category: RuleCategory.SCHEDULING,
      clientTypes: [ClientType.FDF],
      conditions: [
        {
          field: "project.type",
          operator: RuleOperator.EQUALS,
          value: "renovation",
        },
      ],
      actions: [
        {
          type: RuleAction.SET_DEADLINE,
          deadline: 90,
          reminderDays: [30, 15, 7],
        },
      ],
      priority: 70,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: "system",
      updatedBy: "system",
      version: 1,
    });

    // Document rules
    this.createRule({
      id: "document-requirements-adha",
      name: "ADHA Document Requirements",
      description: "Required documents for ADHA projects",
      category: RuleCategory.DOCUMENT,
      clientTypes: [ClientType.ADHA],
      conditions: [
        {
          field: "project.status",
          operator: RuleOperator.EQUALS,
          value: "pending_approval",
        },
      ],
      actions: [
        {
          type: RuleAction.REQUIRE_DOCUMENT,
          documentTypes: ["ID", "Property Deed", "Income Certificate"],
        },
      ],
      priority: 60,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: "system",
      updatedBy: "system",
      version: 1,
    });
  }

  /**
   * Get all business rules
   */
  public getAllRules(): BusinessRule[] {
    return Array.from(this.rules.values());
  }

  /**
   * Get rules by category
   */
  public getRulesByCategory(category: RuleCategory): BusinessRule[] {
    return this.getAllRules().filter((rule) => rule.category === category);
  }

  /**
   * Get rules by client type
   */
  public getRulesByClientType(clientType: ClientType): BusinessRule[] {
    return this.getAllRules().filter(
      (rule) => rule.clientTypes.includes(clientType) && rule.isActive,
    );
  }

  /**
   * Get a specific rule by ID
   */
  public getRule(id: string): BusinessRule | undefined {
    return this.rules.get(id);
  }

  /**
   * Create a new business rule
   */
  public createRule(rule: BusinessRule): boolean {
    try {
      if (this.rules.has(rule.id)) {
        console.error(`Rule with ID ${rule.id} already exists`);
        return false;
      }

      this.rules.set(rule.id, rule);

      // Initialize version history for this rule
      if (!this.ruleVersionHistory.has(rule.id)) {
        this.ruleVersionHistory.set(rule.id, []);
      }
      this.ruleVersionHistory.get(rule.id)?.push({ ...rule });

      // Add audit entry
      this.addAuditEntry({
        ruleId: rule.id,
        action: "created",
        timestamp: new Date(),
        user: rule.createdBy,
        newVersion: rule,
      });

      return true;
    } catch (error) {
      console.error("Error creating rule:", error);
      return false;
    }
  }

  /**
   * Update an existing business rule
   */
  public updateRule(
    id: string,
    updates: Partial<BusinessRule>,
    updatedBy: string,
  ): boolean {
    try {
      const existingRule = this.rules.get(id);
      if (!existingRule) {
        console.error(`Rule with ID ${id} not found`);
        return false;
      }

      const previousVersion = { ...existingRule };
      const updatedRule: BusinessRule = {
        ...existingRule,
        ...updates,
        updatedAt: new Date(),
        updatedBy,
        version: existingRule.version + 1,
      };

      this.rules.set(id, updatedRule);

      // Add to version history
      this.ruleVersionHistory.get(id)?.push({ ...updatedRule });

      // Add audit entry
      this.addAuditEntry({
        ruleId: id,
        action: "updated",
        timestamp: new Date(),
        user: updatedBy,
        previousVersion,
        newVersion: updatedRule,
      });

      return true;
    } catch (error) {
      console.error("Error updating rule:", error);
      return false;
    }
  }

  /**
   * Delete a business rule
   */
  public deleteRule(id: string, deletedBy: string): boolean {
    try {
      const existingRule = this.rules.get(id);
      if (!existingRule) {
        console.error(`Rule with ID ${id} not found`);
        return false;
      }

      this.rules.delete(id);

      // Add audit entry
      this.addAuditEntry({
        ruleId: id,
        action: "deleted",
        timestamp: new Date(),
        user: deletedBy,
        previousVersion: existingRule,
      });

      return true;
    } catch (error) {
      console.error("Error deleting rule:", error);
      return false;
    }
  }

  /**
   * Activate or deactivate a rule
   */
  public setRuleActive(
    id: string,
    isActive: boolean,
    updatedBy: string,
  ): boolean {
    try {
      const existingRule = this.rules.get(id);
      if (!existingRule) {
        console.error(`Rule with ID ${id} not found`);
        return false;
      }

      const previousVersion = { ...existingRule };
      const updatedRule: BusinessRule = {
        ...existingRule,
        isActive,
        updatedAt: new Date(),
        updatedBy,
        version: existingRule.version + 1,
      };

      this.rules.set(id, updatedRule);

      // Add to version history
      this.ruleVersionHistory.get(id)?.push({ ...updatedRule });

      // Add audit entry
      this.addAuditEntry({
        ruleId: id,
        action: isActive ? "activated" : "deactivated",
        timestamp: new Date(),
        user: updatedBy,
        previousVersion,
        newVersion: updatedRule,
      });

      return true;
    } catch (error) {
      console.error(
        `Error ${isActive ? "activating" : "deactivating"} rule:`,
        error,
      );
      return false;
    }
  }

  /**
   * Add an entry to the rule audit log
   */
  private addAuditEntry(entry: RuleAuditEntry): void {
    this.ruleAuditLog.push(entry);
  }

  /**
   * Get the audit log for a specific rule
   */
  public getRuleAuditLog(ruleId: string): RuleAuditEntry[] {
    return this.ruleAuditLog.filter((entry) => entry.ruleId === ruleId);
  }

  /**
   * Get the complete audit log
   */
  public getCompleteAuditLog(): RuleAuditEntry[] {
    return [...this.ruleAuditLog];
  }

  /**
   * Get version history for a specific rule
   */
  public getRuleVersionHistory(ruleId: string): BusinessRule[] {
    return this.ruleVersionHistory.get(ruleId) || [];
  }

  /**
   * Evaluate rules for a specific client type and context
   */
  public evaluateRules(context: RuleEvaluationContext): RuleEvaluationResult[] {
    try {
      const clientType = this.getClientTypeFromId(context.clientTypeId);
      if (!clientType) {
        console.error(`Invalid client type ID: ${context.clientTypeId}`);
        return [];
      }

      // Get all active rules for this client type
      const applicableRules = this.getRulesByClientType(clientType);

      // Sort by priority (highest first)
      const sortedRules = [...applicableRules].sort(
        (a, b) => b.priority - a.priority,
      );

      const results: RuleEvaluationResult[] = [];
      const timestamp = context.timestamp || new Date();

      for (const rule of sortedRules) {
        // Skip expired rules
        if (rule.expiresAt && rule.expiresAt < timestamp) {
          continue;
        }

        // Evaluate rule conditions
        const matched = this.evaluateRuleConditions(rule, context);

        if (matched) {
          const result: RuleEvaluationResult = {
            ruleId: rule.id,
            ruleName: rule.name,
            category: rule.category,
            matched: true,
            actions: rule.actions,
            priority: rule.priority,
            appliedAt: timestamp,
            context: { ...context },
          };

          results.push(result);

          // Add to audit log
          this.addAuditEntry({
            ruleId: rule.id,
            action: "evaluated",
            timestamp,
            user: context.user || "system",
            evaluationResult: result,
            clientTypeId: context.clientTypeId,
          });
        }
      }

      return results;
    } catch (error) {
      console.error("Error evaluating rules:", error);
      return [];
    }
  }

  /**
   * Evaluate conditions for a specific rule
   */
  private evaluateRuleConditions(
    rule: BusinessRule,
    context: RuleEvaluationContext,
  ): boolean {
    try {
      if (!rule.conditions || rule.conditions.length === 0) {
        return true; // No conditions means always match
      }

      // If there's custom condition logic, evaluate it
      if (rule.conditionLogic) {
        return this.evaluateConditionLogic(
          rule.conditions,
          rule.conditionLogic,
          context,
        );
      }

      // Otherwise, all conditions must match (AND logic)
      return rule.conditions.every((condition) =>
        this.evaluateCondition(condition, context),
      );
    } catch (error) {
      console.error(`Error evaluating conditions for rule ${rule.id}:`, error);
      return false;
    }
  }

  /**
   * Evaluate a single condition
   */
  private evaluateCondition(
    condition: RuleCondition,
    context: RuleEvaluationContext,
  ): boolean {
    try {
      // Get the field value from the context parameters
      const fieldPath = condition.field.split(".");
      let fieldValue = context.parameters;

      for (const part of fieldPath) {
        if (fieldValue === undefined || fieldValue === null) {
          return false; // Field path doesn't exist
        }
        fieldValue = fieldValue[part];
      }

      // Handle parameterized values
      let conditionValue = condition.value;
      if (condition.isParameterized && typeof conditionValue === "string") {
        conditionValue = this.substituteParameters(
          conditionValue,
          context.parameters,
        );
      }

      // Evaluate based on operator
      switch (condition.operator) {
        case RuleOperator.EQUALS:
          return fieldValue === conditionValue;
        case RuleOperator.NOT_EQUALS:
          return fieldValue !== conditionValue;
        case RuleOperator.GREATER_THAN:
          return fieldValue > conditionValue;
        case RuleOperator.LESS_THAN:
          return fieldValue < conditionValue;
        case RuleOperator.GREATER_THAN_OR_EQUAL:
          return fieldValue >= conditionValue;
        case RuleOperator.LESS_THAN_OR_EQUAL:
          return fieldValue <= conditionValue;
        case RuleOperator.CONTAINS:
          return String(fieldValue).includes(String(conditionValue));
        case RuleOperator.NOT_CONTAINS:
          return !String(fieldValue).includes(String(conditionValue));
        case RuleOperator.STARTS_WITH:
          return String(fieldValue).startsWith(String(conditionValue));
        case RuleOperator.ENDS_WITH:
          return String(fieldValue).endsWith(String(conditionValue));
        case RuleOperator.BETWEEN:
          if (Array.isArray(conditionValue) && conditionValue.length === 2) {
            return (
              fieldValue >= conditionValue[0] && fieldValue <= conditionValue[1]
            );
          }
          return false;
        case RuleOperator.IN:
          return (
            Array.isArray(conditionValue) && conditionValue.includes(fieldValue)
          );
        case RuleOperator.NOT_IN:
          return (
            Array.isArray(conditionValue) &&
            !conditionValue.includes(fieldValue)
          );
        case RuleOperator.EXISTS:
          return fieldValue !== undefined && fieldValue !== null;
        case RuleOperator.NOT_EXISTS:
          return fieldValue === undefined || fieldValue === null;
        case RuleOperator.REGEX:
          try {
            const regex = new RegExp(String(conditionValue));
            return regex.test(String(fieldValue));
          } catch {
            return false;
          }
        default:
          console.error(`Unknown operator: ${condition.operator}`);
          return false;
      }
    } catch (error) {
      console.error("Error evaluating condition:", error);
      return false;
    }
  }

  /**
   * Evaluate complex condition logic
   */
  private evaluateConditionLogic(
    conditions: RuleCondition[],
    logic: string,
    context: RuleEvaluationContext,
  ): boolean {
    try {
      // Replace condition indices with their evaluation results
      let evaluationString = logic;

      for (let i = 0; i < conditions.length; i++) {
        const conditionResult = this.evaluateCondition(conditions[i], context);
        // Replace all occurrences of the index with the result
        evaluationString = evaluationString.replace(
          new RegExp(`\\b${i + 1}\\b`, "g"),
          conditionResult.toString(),
        );
      }

      // Replace AND, OR, NOT with &&, ||, !
      evaluationString = evaluationString
        .replace(/\bAND\b/g, "&&")
        .replace(/\bOR\b/g, "||")
        .replace(/\bNOT\b/g, "!");

      // Safely evaluate the logic expression
      // eslint-disable-next-line no-new-func
      return new Function(`return ${evaluationString}`)() as boolean;
    } catch (error) {
      console.error("Error evaluating condition logic:", error);
      return false;
    }
  }

  /**
   * Substitute parameters in a string value
   */
  private substituteParameters(
    value: string,
    parameters: Record<string, any>,
  ): any {
    try {
      // Replace ${param} with actual values
      return value.replace(/\${([^}]+)}/g, (match, path) => {
        const parts = path.split(".");
        let result = parameters;

        for (const part of parts) {
          if (result === undefined || result === null) {
            return match; // Keep original if path doesn't exist
          }
          result = result[part];
        }

        return result !== undefined ? String(result) : match;
      });
    } catch (error) {
      console.error("Error substituting parameters:", error);
      return value; // Return original on error
    }
  }

  /**
   * Get ClientType enum value from client type ID
   */
  private getClientTypeFromId(clientTypeId: number): ClientType | undefined {
    switch (clientTypeId) {
      case 1:
        return ClientType.FDF;
      case 2:
        return ClientType.ADHA;
      case 3:
        return ClientType.CASH;
      case 4:
        return ClientType.OTHER;
      default:
        return undefined;
    }
  }

  /**
   * Export rules to JSON
   */
  public exportRulesToJson(): string {
    try {
      const rules = this.getAllRules();
      return JSON.stringify(rules, null, 2);
    } catch (error) {
      console.error("Error exporting rules to JSON:", error);
      return "";
    }
  }

  /**
   * Import rules from JSON
   */
  public importRulesFromJson(json: string, importedBy: string): boolean {
    try {
      const rules = JSON.parse(json) as BusinessRule[];

      if (!Array.isArray(rules)) {
        console.error("Invalid rules JSON format");
        return false;
      }

      let success = true;

      for (const rule of rules) {
        // Validate rule structure
        if (!this.validateRuleStructure(rule)) {
          console.error(
            `Invalid rule structure for rule: ${rule.id || "unknown"}`,
          );
          success = false;
          continue;
        }

        // Check if rule exists
        if (this.rules.has(rule.id)) {
          // Update existing rule
          if (!this.updateRule(rule.id, rule, importedBy)) {
            success = false;
          }
        } else {
          // Create new rule
          const newRule: BusinessRule = {
            ...rule,
            createdAt: new Date(),
            updatedAt: new Date(),
            createdBy: importedBy,
            updatedBy: importedBy,
            version: 1,
          };

          if (!this.createRule(newRule)) {
            success = false;
          }
        }
      }

      return success;
    } catch (error) {
      console.error("Error importing rules from JSON:", error);
      return false;
    }
  }

  /**
   * Validate rule structure
   */
  private validateRuleStructure(rule: any): boolean {
    // Check required fields
    if (!rule.id || !rule.name || !rule.category || !rule.clientTypes) {
      return false;
    }

    // Validate category
    if (!Object.values(RuleCategory).includes(rule.category)) {
      return false;
    }

    // Validate client types
    if (!Array.isArray(rule.clientTypes) || rule.clientTypes.length === 0) {
      return false;
    }

    for (const clientType of rule.clientTypes) {
      if (!Object.values(ClientType).includes(clientType)) {
        return false;
      }
    }

    // Validate conditions if present
    if (rule.conditions) {
      if (!Array.isArray(rule.conditions)) {
        return false;
      }

      for (const condition of rule.conditions) {
        if (!condition.field || !condition.operator) {
          return false;
        }

        if (!Object.values(RuleOperator).includes(condition.operator)) {
          return false;
        }
      }
    }

    // Validate actions
    if (!Array.isArray(rule.actions) || rule.actions.length === 0) {
      return false;
    }

    for (const action of rule.actions) {
      if (!action.type) {
        return false;
      }

      if (!Object.values(RuleAction).includes(action.type)) {
        return false;
      }
    }

    return true;
  }
}

export const clientRulesService = ClientRulesService.getInstance();
