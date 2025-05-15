import { useState, useEffect } from "react";
import { ClientType } from "../lib/forms/types";
import eventBus, { EventType } from "./eventBus";

// Define workflow phase types
export enum WorkflowPhase {
  BeneficiaryEnrollment = "beneficiary_enrollment",
  Assessment = "assessment",
  CommitteeReview = "committee_review",
  ProjectPlanning = "project_planning",
  ApprovalProcess = "approval_process",
  Execution = "execution",
  FinancialManagement = "financial_management",
  Inspection = "inspection",
  Closure = "closure",
}

// Define workflow status types
export enum WorkflowStatus {
  NotStarted = "not_started",
  InProgress = "in_progress",
  Completed = "completed",
  OnHold = "on_hold",
  Cancelled = "cancelled",
}

// Define workflow step interface
export interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  phase: WorkflowPhase;
  order: number;
  status: WorkflowStatus;
  requiredRoles: string[];
  previousSteps: string[];
  nextSteps: string[];
  formIds?: string[];
  completionCriteria?: Record<string, any>;
  timeoutMinutes?: number;
  escalationRoles?: string[];
  autoTransition?: boolean;
  conditionalBranching?: boolean;
  parallelExecution?: boolean;
  stepType?: "task" | "approval" | "notification" | "condition" | "integration";
}

// Define workflow interface
export interface Workflow {
  id: string;
  name: string;
  description: string;
  clientType: ClientType;
  version: string;
  steps: WorkflowStep[];
  currentStepId: string;
  status: WorkflowStatus;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  isTemplate?: boolean;
  parentWorkflowId?: string;
  tags?: string[];
  category?: string;
}

// Define workflow context interface
export interface WorkflowContext {
  projectId?: string;
  assessmentId?: string;
  beneficiaryId?: string;
  userId?: string;
  committeeId?: string;
  invoiceId?: string;
  paymentId?: string;
  inspectionId?: string;
  clientType: ClientType;
  data?: Record<string, any>;
  history?: WorkflowHistoryEntry[];
}

// Define workflow history entry interface
export interface WorkflowHistoryEntry {
  id: string;
  workflowId: string;
  stepId: string;
  fromStepId?: string;
  toStepId?: string;
  action: string;
  userId: string;
  timestamp: Date;
  comments?: string;
  data?: Record<string, any>;
}

// Define workflow transition interface
export interface WorkflowTransition {
  id: string;
  name: string;
  fromStepId: string;
  toStepId: string;
  condition?: (context: WorkflowContext) => boolean;
  conditionExpression?: string; // For serializable conditions
  action?: (context: WorkflowContext) => Promise<void>;
  actionScript?: string; // For serializable actions
  requiredFields?: string[];
  requiredRoles?: string[];
  timeoutMinutes?: number;
}

// Define workflow template interface
export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  version: string;
  clientTypes: ClientType[];
  phases: WorkflowPhase[];
  steps: WorkflowStep[];
  transitions: WorkflowTransition[];
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  category?: string;
  tags?: string[];
}

// Define workflow engine service
export class WorkflowEngine {
  private static instance: WorkflowEngine;
  private workflows: Map<string, Workflow> = new Map();
  private transitions: Map<string, WorkflowTransition[]> = new Map();
  private templates: Map<string, WorkflowTemplate> = new Map();
  private history: WorkflowHistoryEntry[] = [];
  private timeoutHandlers: Map<string, NodeJS.Timeout> = new Map();

  private constructor() {}

  public static getInstance(): WorkflowEngine {
    if (!WorkflowEngine.instance) {
      WorkflowEngine.instance = new WorkflowEngine();
    }
    return WorkflowEngine.instance;
  }

  // Register a workflow
  public registerWorkflow(workflow: Workflow): void {
    this.workflows.set(workflow.id, workflow);
    this.transitions.set(workflow.id, []);

    // Set up timeout handlers for steps with timeouts
    workflow.steps.forEach((step) => {
      if (step.timeoutMinutes && step.id === workflow.currentStepId) {
        this.setupStepTimeout(workflow.id, step.id, step.timeoutMinutes);
      }
    });
  }

  // Register a workflow template
  public registerWorkflowTemplate(template: WorkflowTemplate): void {
    this.templates.set(template.id, template);
  }

  // Get a workflow template
  public getWorkflowTemplate(templateId: string): WorkflowTemplate | undefined {
    return this.templates.get(templateId);
  }

  // Get all workflow templates
  public getAllWorkflowTemplates(): WorkflowTemplate[] {
    return Array.from(this.templates.values());
  }

  // Get workflow templates by client type
  public getWorkflowTemplatesByClientType(
    clientType: ClientType,
  ): WorkflowTemplate[] {
    return Array.from(this.templates.values()).filter((template) =>
      template.clientTypes.includes(clientType),
    );
  }

  // Create a workflow from a template
  public createWorkflowFromTemplate(
    templateId: string,
    context: WorkflowContext,
    overrides?: Partial<Workflow>,
  ): Workflow | undefined {
    const template = this.templates.get(templateId);
    if (!template) return undefined;

    const workflowId = `wf_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const firstStep = template.steps.find((step) => !step.previousSteps.length);

    if (!firstStep) return undefined;

    const workflow: Workflow = {
      id: workflowId,
      name: template.name,
      description: template.description,
      clientType: context.clientType,
      version: template.version,
      steps: JSON.parse(JSON.stringify(template.steps)), // Deep copy
      currentStepId: firstStep.id,
      status: WorkflowStatus.InProgress,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    };

    // Register the workflow
    this.registerWorkflow(workflow);

    // Register transitions from template
    template.transitions.forEach((transition) => {
      this.registerTransition(workflowId, {
        ...transition,
        fromStepId: transition.fromStepId,
        toStepId: transition.toStepId,
      });
    });

    // Log workflow creation
    this.logWorkflowHistory({
      id: `hist_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      workflowId,
      stepId: firstStep.id,
      action: "workflow_created",
      userId: context.userId || "system",
      timestamp: new Date(),
      data: { templateId, context },
    });

    return workflow;
  }

  public registerTransition(
    workflowId: string,
    transition: WorkflowTransition,
  ): void {
    const transitions = this.transitions.get(workflowId) || [];
    transitions.push(transition);
    this.transitions.set(workflowId, transitions);
  }

  // Get a workflow by ID
  public getWorkflow(workflowId: string): Workflow | undefined {
    return this.workflows.get(workflowId);
  }

  // Get all workflows
  public getAllWorkflows(): Workflow[] {
    return Array.from(this.workflows.values());
  }

  // Get workflows by client type
  public getWorkflowsByClientType(clientType: ClientType): Workflow[] {
    return Array.from(this.workflows.values()).filter(
      (workflow) => workflow.clientType === clientType,
    );
  }

  // Get current step of a workflow
  public getCurrentStep(workflowId: string): WorkflowStep | undefined {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) return undefined;

    return workflow.steps.find((step) => step.id === workflow.currentStepId);
  }

  // Get available next steps
  public getAvailableNextSteps(
    workflowId: string,
    context: WorkflowContext,
  ): WorkflowStep[] {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) return [];

    const currentStep = this.getCurrentStep(workflowId);
    if (!currentStep) return [];

    const transitions = this.transitions.get(workflowId) || [];
    const availableTransitions = transitions.filter(
      (transition) =>
        transition.fromStepId === currentStep.id &&
        (!transition.condition || transition.condition(context)),
    );

    return availableTransitions
      .map((transition) =>
        workflow.steps.find((step) => step.id === transition.toStepId),
      )
      .filter((step): step is WorkflowStep => step !== undefined);
  }

  // Setup timeout for a step
  private setupStepTimeout(
    workflowId: string,
    stepId: string,
    timeoutMinutes: number,
  ): void {
    // Clear any existing timeout for this step
    if (this.timeoutHandlers.has(`${workflowId}_${stepId}`)) {
      clearTimeout(this.timeoutHandlers.get(`${workflowId}_${stepId}`));
    }

    // Set new timeout
    const timeoutMs = timeoutMinutes * 60 * 1000;
    const handler = setTimeout(() => {
      this.handleStepTimeout(workflowId, stepId);
    }, timeoutMs);

    this.timeoutHandlers.set(`${workflowId}_${stepId}`, handler);
  }

  // Handle step timeout
  private handleStepTimeout(workflowId: string, stepId: string): void {
    const workflow = this.workflows.get(workflowId);
    if (!workflow || workflow.currentStepId !== stepId) return;

    const step = workflow.steps.find((s) => s.id === stepId);
    if (!step || !step.escalationRoles) return;

    // Log the timeout event
    this.logWorkflowHistory({
      id: `hist_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      workflowId,
      stepId,
      action: "step_timeout",
      userId: "system",
      timestamp: new Date(),
      data: { escalationRoles: step.escalationRoles },
    });

    // Here you would typically trigger notifications to the escalation roles
    // This is a placeholder for the actual notification logic
    console.log(
      `Step ${stepId} in workflow ${workflowId} has timed out. Escalating to roles: ${step.escalationRoles.join(", ")}`,
    );
  }

  // Log workflow history
  private logWorkflowHistory(entry: WorkflowHistoryEntry): void {
    this.history.push(entry);
  }

  // Get workflow history
  public getWorkflowHistory(workflowId: string): WorkflowHistoryEntry[] {
    return this.history.filter((entry) => entry.workflowId === workflowId);
  }

  // Transition to next step
  public async transitionToStep(
    workflowId: string,
    nextStepId: string,
    context: WorkflowContext,
    comments?: string,
  ): Promise<boolean> {
    try {
      const workflow = this.workflows.get(workflowId);
      if (!workflow) {
        throw new Error(`Workflow with ID ${workflowId} not found`);
      }

      const currentStep = this.getCurrentStep(workflowId);
      if (!currentStep) {
        throw new Error(`Current step for workflow ${workflowId} not found`);
      }

      const transitions = this.transitions.get(workflowId) || [];
      const transition = transitions.find(
        (t) => t.fromStepId === currentStep.id && t.toStepId === nextStepId,
      );

      if (!transition) {
        throw new Error(
          `No transition found from ${currentStep.id} to ${nextStepId}`,
        );
      }

      // Check transition conditions
      if (transition.condition && !transition.condition(context)) {
        throw new Error(
          `Transition condition not met from ${currentStep.id} to ${nextStepId}`,
        );
      }

      // Check for required fields in context
      if (transition.requiredFields) {
        const missingFields = transition.requiredFields.filter(
          (field) => !context.data || context.data[field] === undefined,
        );

        if (missingFields.length > 0) {
          throw new Error(
            `Missing required fields for transition: ${missingFields.join(", ")}`,
          );
        }
      }

      // Check for required roles
      if (transition.requiredRoles && context.userId) {
        // This is a placeholder - in a real implementation, you would check if the user has the required roles
        // const userRoles = await getUserRoles(context.userId);
        // const hasRequiredRole = transition.requiredRoles.some(role => userRoles.includes(role));
        // if (!hasRequiredRole) {
        //   throw new Error(`User does not have required roles for this transition`);
        // }
      }

      // Execute transition action if defined
      if (transition.action) {
        await transition.action(context);
      } else if (transition.actionScript) {
        // Execute serialized action script if available
        try {
          const actionFn = new Function("context", transition.actionScript);
          await Promise.resolve(actionFn(context));
        } catch (scriptError) {
          console.error(
            "Error executing transition action script:",
            scriptError,
          );
          throw new Error(
            `Error in transition action script: ${scriptError instanceof Error ? scriptError.message : String(scriptError)}`,
          );
        }
      }

      // Clear any timeout for the current step
      if (this.timeoutHandlers.has(`${workflowId}_${currentStep.id}`)) {
        clearTimeout(
          this.timeoutHandlers.get(`${workflowId}_${currentStep.id}`),
        );
        this.timeoutHandlers.delete(`${workflowId}_${currentStep.id}`);
      }

      // Update workflow
      workflow.currentStepId = nextStepId;
      workflow.updatedAt = new Date();

      // Update step statuses
      const currentStepIndex = workflow.steps.findIndex(
        (step) => step.id === currentStep.id,
      );
      if (currentStepIndex >= 0) {
        workflow.steps[currentStepIndex].status = WorkflowStatus.Completed;
      }

      const nextStepIndex = workflow.steps.findIndex(
        (step) => step.id === nextStepId,
      );
      if (nextStepIndex >= 0) {
        workflow.steps[nextStepIndex].status = WorkflowStatus.InProgress;
      }

      // Set up timeout for the next step if it has one
      const nextStep = workflow.steps.find((step) => step.id === nextStepId);
      if (nextStep && nextStep.timeoutMinutes) {
        this.setupStepTimeout(workflowId, nextStepId, nextStep.timeoutMinutes);
      }

      // Check if workflow is completed
      const allStepsCompleted = workflow.steps.every(
        (step) =>
          step.status === WorkflowStatus.Completed || step.id === nextStepId,
      );

      const isLastStep =
        nextStep &&
        workflow.steps.every(
          (step) =>
            step.id === nextStepId || !nextStep.nextSteps.includes(step.id),
        );

      if (allStepsCompleted && isLastStep) {
        workflow.status = WorkflowStatus.Completed;
        workflow.completedAt = new Date();
      }

      // Log the transition in history
      this.logWorkflowHistory({
        id: `hist_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        workflowId,
        stepId: nextStepId,
        fromStepId: currentStep.id,
        toStepId: nextStepId,
        action: "transition",
        userId: context.userId || "system",
        timestamp: new Date(),
        comments,
        data: { context: { ...context, data: undefined } }, // Avoid storing potentially large data objects
      });

      // Publish workflow step completed event
      eventBus.publish({
        id: `wf_step_${Date.now()}`,
        type: EventType.WORKFLOW_STEP_COMPLETED,
        timestamp: new Date().toISOString(),
        source: "workflowEngine",
        payload: {
          workflowId,
          previousStepId: currentStep.id,
          nextStepId,
          context: { ...context, data: undefined }, // Avoid storing potentially large data objects
          comments,
        },
      });

      // If workflow is completed, publish workflow completed event
      if (workflow.status === WorkflowStatus.Completed) {
        eventBus.publish({
          id: `wf_completed_${Date.now()}`,
          type: EventType.WORKFLOW_COMPLETED,
          timestamp: new Date().toISOString(),
          source: "workflowEngine",
          payload: {
            workflowId,
            clientType: workflow.clientType,
            completedAt: workflow.completedAt?.toISOString(),
            context: { ...context, data: undefined }, // Avoid storing potentially large data objects
          },
        });
      }

      this.workflows.set(workflowId, workflow);

      // Check for auto-transition in the next step
      if (nextStep && nextStep.autoTransition) {
        const autoTransitions = transitions.filter(
          (t) => t.fromStepId === nextStepId,
        );

        // If there's only one possible transition and it's automatic, execute it
        if (autoTransitions.length === 1) {
          setTimeout(() => {
            this.transitionToStep(
              workflowId,
              autoTransitions[0].toStepId,
              context,
              "Auto-transition",
            );
          }, 100); // Small delay to ensure the current transition completes first
        }
        // If there are conditional branches, evaluate them
        else if (nextStep.conditionalBranching && autoTransitions.length > 0) {
          for (const autoTransition of autoTransitions) {
            if (
              !autoTransition.condition ||
              autoTransition.condition(context)
            ) {
              setTimeout(() => {
                this.transitionToStep(
                  workflowId,
                  autoTransition.toStepId,
                  context,
                  "Auto-transition (conditional)",
                );
              }, 100);
              break; // Take the first matching transition
            }
          }
        }
      }

      return true;
    } catch (error) {
      this.handleError(
        error instanceof Error ? error : new Error(String(error)),
      );
      return false;
    }
  }

  // Handle errors
  private handleError(error: Error): void {
    console.error("Workflow Engine Error:", error);
    // In a real implementation, you might want to log this to a monitoring service
  }
}

// React hook for using workflow
export function useWorkflow(workflowId: string, context: WorkflowContext) {
  const [workflow, setWorkflow] = useState<Workflow | undefined>();
  const [currentStep, setCurrentStep] = useState<WorkflowStep | undefined>();
  const [availableNextSteps, setAvailableNextSteps] = useState<WorkflowStep[]>(
    [],
  );
  const [workflowHistory, setWorkflowHistory] = useState<
    WorkflowHistoryEntry[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const workflowEngine = WorkflowEngine.getInstance();

  useEffect(() => {
    try {
      const workflow = workflowEngine.getWorkflow(workflowId);
      if (!workflow) {
        setError(`Workflow with ID ${workflowId} not found`);
        setLoading(false);
        return;
      }

      setWorkflow(workflow);
      setCurrentStep(workflowEngine.getCurrentStep(workflowId));
      setAvailableNextSteps(
        workflowEngine.getAvailableNextSteps(workflowId, context),
      );
      setWorkflowHistory(workflowEngine.getWorkflowHistory(workflowId));
      setLoading(false);
    } catch (err) {
      setError(
        `Error loading workflow: ${err instanceof Error ? err.message : String(err)}`,
      );
      setLoading(false);
    }
  }, [workflowId, context]);

  const transitionToStep = async (
    nextStepId: string,
    comments?: string,
  ): Promise<boolean> => {
    try {
      const success = await workflowEngine.transitionToStep(
        workflowId,
        nextStepId,
        context,
        comments,
      );
      if (success) {
        setWorkflow(workflowEngine.getWorkflow(workflowId));
        setCurrentStep(workflowEngine.getCurrentStep(workflowId));
        setAvailableNextSteps(
          workflowEngine.getAvailableNextSteps(workflowId, context),
        );
        setWorkflowHistory(workflowEngine.getWorkflowHistory(workflowId));
      }
      return success;
    } catch (err) {
      setError(
        `Error transitioning to step: ${err instanceof Error ? err.message : String(err)}`,
      );
      return false;
    }
  };

  // Create a new workflow from a template
  const createFromTemplate = (
    templateId: string,
    overrides?: Partial<Workflow>,
  ): Workflow | undefined => {
    try {
      const newWorkflow = workflowEngine.createWorkflowFromTemplate(
        templateId,
        context,
        overrides,
      );
      return newWorkflow;
    } catch (err) {
      setError(
        `Error creating workflow from template: ${err instanceof Error ? err.message : String(err)}`,
      );
      return undefined;
    }
  };

  return {
    workflow,
    currentStep,
    availableNextSteps,
    workflowHistory,
    loading,
    error,
    transitionToStep,
    createFromTemplate,
  };
}

// Hook for workflow templates
export function useWorkflowTemplates(clientType?: ClientType) {
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const workflowEngine = WorkflowEngine.getInstance();

  useEffect(() => {
    try {
      if (clientType) {
        setTemplates(
          workflowEngine.getWorkflowTemplatesByClientType(clientType),
        );
      } else {
        setTemplates(workflowEngine.getAllWorkflowTemplates());
      }
      setLoading(false);
    } catch (err) {
      setError(
        `Error loading workflow templates: ${err instanceof Error ? err.message : String(err)}`,
      );
      setLoading(false);
    }
  }, [clientType]);

  return { templates, loading, error };
}

// Export default instance
export default WorkflowEngine.getInstance();
