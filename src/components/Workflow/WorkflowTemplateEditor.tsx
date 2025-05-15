import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { ClientType } from "@/lib/forms/types";
import {
  WorkflowPhase,
  WorkflowStatus,
  WorkflowStep,
  WorkflowTemplate,
  WorkflowTransition,
} from "@/services/workflowEngine";
import {
  ArrowRight,
  Plus,
  Trash2,
  AlertCircle,
  Check,
  Save,
} from "lucide-react";

interface WorkflowTemplateEditorProps {
  initialTemplate?: WorkflowTemplate;
  onSave?: (template: WorkflowTemplate) => void;
  availableRoles?: string[];
}

const defaultRoles = [
  "admin",
  "manager",
  "assessor",
  "committee_member",
  "finance_officer",
  "project_manager",
  "inspector",
];

const WorkflowTemplateEditor: React.FC<WorkflowTemplateEditorProps> = ({
  initialTemplate,
  onSave,
  availableRoles = defaultRoles,
}) => {
  const [activeTab, setActiveTab] = useState("general");
  const [template, setTemplate] = useState<WorkflowTemplate>(
    initialTemplate || {
      id: `wft_${Date.now()}`,
      name: "New Workflow Template",
      description: "Description of the workflow template",
      version: "1.0.0",
      clientTypes: [ClientType.FDF],
      phases: [WorkflowPhase.BeneficiaryEnrollment],
      steps: [],
      transitions: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
      category: "general",
      tags: [],
    },
  );
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string[]>
  >({
    general: [],
    steps: [],
    transitions: [],
  });
  const [selectedStep, setSelectedStep] = useState<string | null>(null);
  const [selectedTransition, setSelectedTransition] = useState<string | null>(
    null,
  );
  const [clientTypeView, setClientTypeView] = useState<ClientType | "all">(
    "all",
  );

  // New step and transition states
  const [newStep, setNewStep] = useState<Partial<WorkflowStep>>({
    name: "",
    description: "",
    phase: WorkflowPhase.BeneficiaryEnrollment,
    requiredRoles: [],
    previousSteps: [],
    nextSteps: [],
    status: WorkflowStatus.NotStarted,
  });

  const [newTransition, setNewTransition] = useState<
    Partial<WorkflowTransition>
  >({
    name: "",
    fromStepId: "",
    toStepId: "",
    requiredRoles: [],
  });

  // Handle general template info changes
  const handleTemplateChange = (field: keyof WorkflowTemplate, value: any) => {
    setTemplate((prev) => ({
      ...prev,
      [field]: value,
      updatedAt: new Date(),
    }));
  };

  // Add a new step to the template
  const handleAddStep = () => {
    if (!newStep.name || !newStep.phase) {
      setValidationErrors((prev) => ({
        ...prev,
        steps: [...prev.steps, "Step name and phase are required"],
      }));
      return;
    }

    const stepId = `step_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const step: WorkflowStep = {
      id: stepId,
      name: newStep.name || "New Step",
      description: newStep.description || "",
      phase: newStep.phase || WorkflowPhase.BeneficiaryEnrollment,
      order: template.steps.length + 1,
      status: WorkflowStatus.NotStarted,
      requiredRoles: newStep.requiredRoles || [],
      previousSteps: newStep.previousSteps || [],
      nextSteps: [],
      timeoutMinutes: newStep.timeoutMinutes,
      escalationRoles: newStep.escalationRoles,
      autoTransition: newStep.autoTransition || false,
      conditionalBranching: newStep.conditionalBranching || false,
      parallelExecution: newStep.parallelExecution || false,
      stepType: newStep.stepType || "task",
    };

    // Update next steps for previous steps
    const updatedSteps = template.steps.map((existingStep) => {
      if (step.previousSteps?.includes(existingStep.id)) {
        return {
          ...existingStep,
          nextSteps: [...existingStep.nextSteps, stepId],
        };
      }
      return existingStep;
    });

    setTemplate((prev) => ({
      ...prev,
      steps: [...updatedSteps, step],
      updatedAt: new Date(),
    }));

    // Reset new step form
    setNewStep({
      name: "",
      description: "",
      phase: WorkflowPhase.BeneficiaryEnrollment,
      requiredRoles: [],
      previousSteps: [],
      nextSteps: [],
      status: WorkflowStatus.NotStarted,
    });
  };

  // Add a new transition to the template
  const handleAddTransition = () => {
    if (
      !newTransition.name ||
      !newTransition.fromStepId ||
      !newTransition.toStepId
    ) {
      setValidationErrors((prev) => ({
        ...prev,
        transitions: [
          ...prev.transitions,
          "Transition name, from step, and to step are required",
        ],
      }));
      return;
    }

    const transitionId = `trans_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const transition: WorkflowTransition = {
      id: transitionId,
      name: newTransition.name || "New Transition",
      fromStepId: newTransition.fromStepId || "",
      toStepId: newTransition.toStepId || "",
      conditionExpression: newTransition.conditionExpression,
      actionScript: newTransition.actionScript,
      requiredFields: newTransition.requiredFields,
      requiredRoles: newTransition.requiredRoles,
      timeoutMinutes: newTransition.timeoutMinutes,
    };

    setTemplate((prev) => ({
      ...prev,
      transitions: [...prev.transitions, transition],
      updatedAt: new Date(),
    }));

    // Reset new transition form
    setNewTransition({
      name: "",
      fromStepId: "",
      toStepId: "",
      requiredRoles: [],
    });
  };

  // Delete a step
  const handleDeleteStep = (stepId: string) => {
    // Remove the step
    const updatedSteps = template.steps.filter((step) => step.id !== stepId);

    // Update next steps and previous steps references
    const cleanedSteps = updatedSteps.map((step) => ({
      ...step,
      previousSteps: step.previousSteps.filter((id) => id !== stepId),
      nextSteps: step.nextSteps.filter((id) => id !== stepId),
    }));

    // Remove transitions involving this step
    const updatedTransitions = template.transitions.filter(
      (transition) =>
        transition.fromStepId !== stepId && transition.toStepId !== stepId,
    );

    setTemplate((prev) => ({
      ...prev,
      steps: cleanedSteps,
      transitions: updatedTransitions,
      updatedAt: new Date(),
    }));

    if (selectedStep === stepId) {
      setSelectedStep(null);
    }
  };

  // Delete a transition
  const handleDeleteTransition = (transitionId: string) => {
    const updatedTransitions = template.transitions.filter(
      (transition) => transition.id !== transitionId,
    );

    setTemplate((prev) => ({
      ...prev,
      transitions: updatedTransitions,
      updatedAt: new Date(),
    }));

    if (selectedTransition === transitionId) {
      setSelectedTransition(null);
    }
  };

  // Update an existing step
  const handleUpdateStep = (stepId: string, updates: Partial<WorkflowStep>) => {
    const updatedSteps = template.steps.map((step) =>
      step.id === stepId ? { ...step, ...updates } : step,
    );

    setTemplate((prev) => ({
      ...prev,
      steps: updatedSteps,
      updatedAt: new Date(),
    }));
  };

  // Update an existing transition
  const handleUpdateTransition = (
    transitionId: string,
    updates: Partial<WorkflowTransition>,
  ) => {
    const updatedTransitions = template.transitions.map((transition) =>
      transition.id === transitionId
        ? { ...transition, ...updates }
        : transition,
    );

    setTemplate((prev) => ({
      ...prev,
      transitions: updatedTransitions,
      updatedAt: new Date(),
    }));
  };

  // Validate the workflow template
  const validateTemplate = () => {
    const errors: Record<string, string[]> = {
      general: [],
      steps: [],
      transitions: [],
    };

    // General validation
    if (!template.name) errors.general.push("Template name is required");
    if (!template.description)
      errors.general.push("Template description is required");
    if (template.clientTypes.length === 0)
      errors.general.push("At least one client type is required");

    // Steps validation
    if (template.steps.length === 0) {
      errors.steps.push("At least one step is required");
    } else {
      // Check for steps with no incoming or outgoing connections
      const startSteps = template.steps.filter(
        (step) => step.previousSteps.length === 0,
      );
      const endSteps = template.steps.filter(
        (step) => step.nextSteps.length === 0,
      );

      if (startSteps.length === 0)
        errors.steps.push("Workflow must have at least one starting step");
      if (endSteps.length === 0)
        errors.steps.push("Workflow must have at least one ending step");

      // Check for orphaned steps (no incoming and no outgoing connections)
      const orphanedSteps = template.steps.filter(
        (step) =>
          step.previousSteps.length === 0 &&
          step.nextSteps.length === 0 &&
          template.steps.length > 1,
      );
      if (orphanedSteps.length > 0) {
        errors.steps.push(
          `Found ${orphanedSteps.length} orphaned step(s): ${orphanedSteps.map((s) => s.name).join(", ")}`,
        );
      }
    }

    // Transitions validation
    if (template.transitions.length === 0 && template.steps.length > 1) {
      errors.transitions.push(
        "At least one transition is required for multiple steps",
      );
    }

    // Check for transitions referencing non-existent steps
    const stepIds = template.steps.map((step) => step.id);
    const invalidTransitions = template.transitions.filter(
      (transition) =>
        !stepIds.includes(transition.fromStepId) ||
        !stepIds.includes(transition.toStepId),
    );

    if (invalidTransitions.length > 0) {
      errors.transitions.push(
        `Found ${invalidTransitions.length} transition(s) referencing non-existent steps`,
      );
    }

    setValidationErrors(errors);
    return Object.values(errors).every((errorList) => errorList.length === 0);
  };

  // Handle save
  const handleSave = () => {
    const isValid = validateTemplate();
    if (isValid && onSave) {
      onSave(template);
    }
  };

  // Filter steps and transitions based on client type view
  const filteredSteps = template.steps.filter((step) => {
    if (clientTypeView === "all") return true;
    // This is a placeholder - in a real implementation, you would check if the step applies to the selected client type
    return true;
  });

  const filteredTransitions = template.transitions.filter((transition) => {
    if (clientTypeView === "all") return true;
    // This is a placeholder - in a real implementation, you would check if the transition applies to the selected client type
    return true;
  });

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Workflow Template Editor</h2>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="steps">Steps</TabsTrigger>
          <TabsTrigger value="transitions">Transitions</TabsTrigger>
          <TabsTrigger value="visualization">Visualization</TabsTrigger>
          <TabsTrigger value="validation">Validation</TabsTrigger>
          <TabsTrigger value="clientSpecific">Client Variations</TabsTrigger>
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Template Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Template Name
                </label>
                <Input
                  value={template.name}
                  onChange={(e) => handleTemplateChange("name", e.target.value)}
                  placeholder="Enter template name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Description
                </label>
                <Input
                  value={template.description}
                  onChange={(e) =>
                    handleTemplateChange("description", e.target.value)
                  }
                  placeholder="Enter template description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Version
                </label>
                <Input
                  value={template.version}
                  onChange={(e) =>
                    handleTemplateChange("version", e.target.value)
                  }
                  placeholder="1.0.0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Category
                </label>
                <Input
                  value={template.category}
                  onChange={(e) =>
                    handleTemplateChange("category", e.target.value)
                  }
                  placeholder="Enter category"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Tags (comma separated)
                </label>
                <Input
                  value={template.tags?.join(", ") || ""}
                  onChange={(e) =>
                    handleTemplateChange(
                      "tags",
                      e.target.value.split(",").map((tag) => tag.trim()),
                    )
                  }
                  placeholder="tag1, tag2, tag3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Client Types
                </label>
                <div className="flex flex-wrap gap-2">
                  {Object.values(ClientType).map((type) => (
                    <label key={type} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={template.clientTypes.includes(type)}
                        onChange={(e) => {
                          const updatedTypes = e.target.checked
                            ? [...template.clientTypes, type]
                            : template.clientTypes.filter((t) => t !== type);
                          handleTemplateChange("clientTypes", updatedTypes);
                        }}
                        className="rounded border-gray-300"
                      />
                      <span>{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Active</label>
                <input
                  type="checkbox"
                  checked={template.isActive}
                  onChange={(e) =>
                    handleTemplateChange("isActive", e.target.checked)
                  }
                  className="rounded border-gray-300"
                />
              </div>
            </CardContent>
          </Card>

          {validationErrors.general.length > 0 && (
            <div className="bg-red-50 p-4 rounded-md">
              <h4 className="text-red-800 font-medium flex items-center">
                <AlertCircle className="h-4 w-4 mr-2" /> Validation Errors
              </h4>
              <ul className="list-disc pl-5 mt-2">
                {validationErrors.general.map((error, index) => (
                  <li key={index} className="text-red-700 text-sm">
                    {error}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </TabsContent>

        {/* Steps Tab */}
        <TabsContent value="steps" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Add New Step</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Step Name
                </label>
                <Input
                  value={newStep.name}
                  onChange={(e) =>
                    setNewStep({ ...newStep, name: e.target.value })
                  }
                  placeholder="Enter step name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Description
                </label>
                <Input
                  value={newStep.description}
                  onChange={(e) =>
                    setNewStep({ ...newStep, description: e.target.value })
                  }
                  placeholder="Enter step description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Phase</label>
                <Select
                  value={newStep.phase}
                  onValueChange={(value) =>
                    setNewStep({ ...newStep, phase: value as WorkflowPhase })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select phase" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(WorkflowPhase).map((phase) => (
                      <SelectItem key={phase} value={phase}>
                        {phase.replace(/_/g, " ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Step Type
                </label>
                <Select
                  value={newStep.stepType}
                  onValueChange={(value) =>
                    setNewStep({ ...newStep, stepType: value as any })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select step type" />
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      "task",
                      "approval",
                      "notification",
                      "condition",
                      "integration",
                    ].map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Required Roles
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableRoles.map((role) => (
                    <label key={role} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={newStep.requiredRoles?.includes(role) || false}
                        onChange={(e) => {
                          const updatedRoles = e.target.checked
                            ? [...(newStep.requiredRoles || []), role]
                            : (newStep.requiredRoles || []).filter(
                                (r) => r !== role,
                              );
                          setNewStep({
                            ...newStep,
                            requiredRoles: updatedRoles,
                          });
                        }}
                        className="rounded border-gray-300"
                      />
                      <span>{role.replace(/_/g, " ")}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Previous Steps
                </label>
                <div className="flex flex-wrap gap-2">
                  {template.steps.map((step) => (
                    <label
                      key={step.id}
                      className="flex items-center space-x-2"
                    >
                      <input
                        type="checkbox"
                        checked={
                          newStep.previousSteps?.includes(step.id) || false
                        }
                        onChange={(e) => {
                          const updatedPrevSteps = e.target.checked
                            ? [...(newStep.previousSteps || []), step.id]
                            : (newStep.previousSteps || []).filter(
                                (id) => id !== step.id,
                              );
                          setNewStep({
                            ...newStep,
                            previousSteps: updatedPrevSteps,
                          });
                        }}
                        className="rounded border-gray-300"
                      />
                      <span>{step.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  SLA (minutes)
                </label>
                <Input
                  type="number"
                  value={newStep.timeoutMinutes || ""}
                  onChange={(e) =>
                    setNewStep({
                      ...newStep,
                      timeoutMinutes: parseInt(e.target.value) || undefined,
                    })
                  }
                  placeholder="Enter SLA in minutes"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Escalation Roles
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableRoles.map((role) => (
                    <label key={role} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={
                          newStep.escalationRoles?.includes(role) || false
                        }
                        onChange={(e) => {
                          const updatedRoles = e.target.checked
                            ? [...(newStep.escalationRoles || []), role]
                            : (newStep.escalationRoles || []).filter(
                                (r) => r !== role,
                              );
                          setNewStep({
                            ...newStep,
                            escalationRoles: updatedRoles,
                          });
                        }}
                        className="rounded border-gray-300"
                      />
                      <span>{role.replace(/_/g, " ")}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={newStep.autoTransition || false}
                    onChange={(e) =>
                      setNewStep({
                        ...newStep,
                        autoTransition: e.target.checked,
                      })
                    }
                    className="rounded border-gray-300"
                  />
                  <span>Auto Transition</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={newStep.conditionalBranching || false}
                    onChange={(e) =>
                      setNewStep({
                        ...newStep,
                        conditionalBranching: e.target.checked,
                      })
                    }
                    className="rounded border-gray-300"
                  />
                  <span>Conditional Branching</span>
                </label>

                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={newStep.parallelExecution || false}
                    onChange={(e) =>
                      setNewStep({
                        ...newStep,
                        parallelExecution: e.target.checked,
                      })
                    }
                    className="rounded border-gray-300"
                  />
                  <span>Parallel Execution</span>
                </label>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleAddStep} className="flex items-center">
                <Plus className="h-4 w-4 mr-2" /> Add Step
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Workflow Steps</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredSteps.length === 0 ? (
                <p className="text-gray-500 italic">No steps defined yet.</p>
              ) : (
                <div className="space-y-4">
                  {filteredSteps.map((step) => (
                    <div
                      key={step.id}
                      className={`border p-4 rounded-md ${selectedStep === step.id ? "border-blue-500 bg-blue-50" : "border-gray-200"}`}
                      onClick={() =>
                        setSelectedStep(
                          selectedStep === step.id ? null : step.id,
                        )
                      }
                    >
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium">{step.name}</h3>
                        <div className="flex space-x-2">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteStep(step.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {selectedStep === step.id && (
                        <div className="mt-4 space-y-4">
                          <div>
                            <label className="block text-sm font-medium mb-1">
                              Step Name
                            </label>
                            <Input
                              value={step.name}
                              onChange={(e) =>
                                handleUpdateStep(step.id, {
                                  name: e.target.value,
                                })
                              }
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-1">
                              Description
                            </label>
                            <Input
                              value={step.description}
                              onChange={(e) =>
                                handleUpdateStep(step.id, {
                                  description: e.target.value,
                                })
                              }
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-1">
                              Phase
                            </label>
                            <Select
                              value={step.phase}
                              onValueChange={(value) =>
                                handleUpdateStep(step.id, {
                                  phase: value as WorkflowPhase,
                                })
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.values(WorkflowPhase).map((phase) => (
                                  <SelectItem key={phase} value={phase}>
                                    {phase.replace(/_/g, " ")}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-1">
                              Required Roles
                            </label>
                            <div className="flex flex-wrap gap-2">
                              {availableRoles.map((role) => (
                                <label
                                  key={role}
                                  className="flex items-center space-x-2"
                                >
                                  <input
                                    type="checkbox"
                                    checked={step.requiredRoles.includes(role)}
                                    onChange={(e) => {
                                      const updatedRoles = e.target.checked
                                        ? [...step.requiredRoles, role]
                                        : step.requiredRoles.filter(
                                            (r) => r !== role,
                                          );
                                      handleUpdateStep(step.id, {
                                        requiredRoles: updatedRoles,
                                      });
                                    }}
                                    className="rounded border-gray-300"
                                  />
                                  <span>{role.replace(/_/g, " ")}</span>
                                </label>
                              ))}
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium mb-1">
                              SLA (minutes)
                            </label>
                            <Input
                              type="number"
                              value={step.timeoutMinutes || ""}
                              onChange={(e) =>
                                handleUpdateStep(step.id, {
                                  timeoutMinutes:
                                    parseInt(e.target.value) || undefined,
                                })
                              }
                            />
                          </div>

                          <div className="flex items-center space-x-4">
                            <label className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={step.autoTransition || false}
                                onChange={(e) =>
                                  handleUpdateStep(step.id, {
                                    autoTransition: e.target.checked,
                                  })
                                }
                                className="rounded border-gray-300"
                              />
                              <span>Auto Transition</span>
                            </label>

                            <label className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={step.conditionalBranching || false}
                                onChange={(e) =>
                                  handleUpdateStep(step.id, {
                                    conditionalBranching: e.target.checked,
                                  })
                                }
                                className="rounded border-gray-300"
                              />
                              <span>Conditional Branching</span>
                            </label>
                          </div>
                        </div>
                      )}

                      <div className="mt-2 text-sm text-gray-500">
                        <span className="inline-block bg-gray-100 px-2 py-1 rounded mr-2">
                          {step.phase.replace(/_/g, " ")}
                        </span>
                        {step.requiredRoles.length > 0 && (
                          <span className="inline-block bg-gray-100 px-2 py-1 rounded">
                            {step.requiredRoles.length} role(s)
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {validationErrors.steps.length > 0 && (
            <div className="bg-red-50 p-4 rounded-md">
              <h4 className="text-red-800 font-medium flex items-center">
                <AlertCircle className="h-4 w-4 mr-2" /> Validation Errors
              </h4>
              <ul className="list-disc pl-5 mt-2">
                {validationErrors.steps.map((error, index) => (
                  <li key={index} className="text-red-700 text-sm">
                    {error}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </TabsContent>

        {/* Transitions Tab */}
        <TabsContent value="transitions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Add New Transition</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Transition Name
                </label>
                <Input
                  value={newTransition.name}
                  onChange={(e) =>
                    setNewTransition({ ...newTransition, name: e.target.value })
                  }
                  placeholder="Enter transition name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  From Step
                </label>
                <Select
                  value={newTransition.fromStepId}
                  onValueChange={(value) =>
                    setNewTransition({ ...newTransition, fromStepId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select from step" />
                  </SelectTrigger>
                  <SelectContent>
                    {template.steps.map((step) => (
                      <SelectItem key={step.id} value={step.id}>
                        {step.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  To Step
                </label>
                <Select
                  value={newTransition.toStepId}
                  onValueChange={(value) =>
                    setNewTransition({ ...newTransition, toStepId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select to step" />
                  </SelectTrigger>
                  <SelectContent>
                    {template.steps.map((step) => (
                      <SelectItem key={step.id} value={step.id}>
                        {step.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Required Roles
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableRoles.map((role) => (
                    <label key={role} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={
                          newTransition.requiredRoles?.includes(role) || false
                        }
                        onChange={(e) => {
                          const updatedRoles = e.target.checked
                            ? [...(newTransition.requiredRoles || []), role]
                            : (newTransition.requiredRoles || []).filter(
                                (r) => r !== role,
                              );
                          setNewTransition({
                            ...newTransition,
                            requiredRoles: updatedRoles,
                          });
                        }}
                        className="rounded border-gray-300"
                      />
                      <span>{role.replace(/_/g, " ")}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Condition Expression
                </label>
                <Input
                  value={newTransition.conditionExpression || ""}
                  onChange={(e) =>
                    setNewTransition({
                      ...newTransition,
                      conditionExpression: e.target.value,
                    })
                  }
                  placeholder="context.data.status === 'approved'"
                />
                <p className="text-xs text-gray-500 mt-1">
                  JavaScript expression that evaluates to boolean
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Action Script
                </label>
                <Input
                  value={newTransition.actionScript || ""}
                  onChange={(e) =>
                    setNewTransition({
                      ...newTransition,
                      actionScript: e.target.value,
                    })
                  }
                  placeholder="context.data.transitionDate = new Date().toISOString();"
                />
                <p className="text-xs text-gray-500 mt-1">
                  JavaScript code to execute on transition
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Required Fields (comma separated)
                </label>
                <Input
                  value={newTransition.requiredFields?.join(", ") || ""}
                  onChange={(e) =>
                    setNewTransition({
                      ...newTransition,
                      requiredFields: e.target.value
                        .split(",")
                        .map((field) => field.trim()),
                    })
                  }
                  placeholder="field1, field2, field3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Timeout (minutes)
                </label>
                <Input
                  type="number"
                  value={newTransition.timeoutMinutes || ""}
                  onChange={(e) =>
                    setNewTransition({
                      ...newTransition,
                      timeoutMinutes: parseInt(e.target.value) || undefined,
                    })
                  }
                  placeholder="Enter timeout in minutes"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={handleAddTransition}
                className="flex items-center"
              >
                <Plus className="h-4 w-4 mr-2" /> Add Transition
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Workflow Transitions</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredTransitions.length === 0 ? (
                <p className="text-gray-500 italic">
                  No transitions defined yet.
                </p>
              ) : (
                <div className="space-y-4">
                  {filteredTransitions.map((transition) => {
                    const fromStep = template.steps.find(
                      (s) => s.id === transition.fromStepId,
                    );
                    const toStep = template.steps.find(
                      (s) => s.id === transition.toStepId,
                    );

                    return (
                      <div
                        key={transition.id}
                        className={`border p-4 rounded-md ${selectedTransition === transition.id ? "border-blue-500 bg-blue-50" : "border-gray-200"}`}
                        onClick={() =>
                          setSelectedTransition(
                            selectedTransition === transition.id
                              ? null
                              : transition.id,
                          )
                        }
                      >
                        <div className="flex justify-between items-center">
                          <h3 className="font-medium">{transition.name}</h3>
                          <div className="flex space-x-2">
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteTransition(transition.id);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="mt-2 flex items-center text-sm text-gray-600">
                          <span>{fromStep?.name || "Unknown"}</span>
                          <ArrowRight className="h-4 w-4 mx-2" />
                          <span>{toStep?.name || "Unknown"}</span>
                        </div>

                        {selectedTransition === transition.id && (
                          <div className="mt-4 space-y-4">
                            <div>
                              <label className="block text-sm font-medium mb-1">
                                Transition Name
                              </label>
                              <Input
                                value={transition.name}
                                onChange={(e) =>
                                  handleUpdateTransition(transition.id, {
                                    name: e.target.value,
                                  })
                                }
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium mb-1">
                                From Step
                              </label>
                              <Select
                                value={transition.fromStepId}
                                onValueChange={(value) =>
                                  handleUpdateTransition(transition.id, {
                                    fromStepId: value,
                                  })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {template.steps.map((step) => (
                                    <SelectItem key={step.id} value={step.id}>
                                      {step.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <label className="block text-sm font-medium mb-1">
                                To Step
                              </label>
                              <Select
                                value={transition.toStepId}
                                onValueChange={(value) =>
                                  handleUpdateTransition(transition.id, {
                                    toStepId: value,
                                  })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {template.steps.map((step) => (
                                    <SelectItem key={step.id} value={step.id}>
                                      {step.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <label className="block text-sm font-medium mb-1">
                                Condition Expression
                              </label>
                              <Input
                                value={transition.conditionExpression || ""}
                                onChange={(e) =>
                                  handleUpdateTransition(transition.id, {
                                    conditionExpression: e.target.value,
                                  })
                                }
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium mb-1">
                                Required Roles
                              </label>
                              <div className="flex flex-wrap gap-2">
                                {availableRoles.map((role) => (
                                  <label
                                    key={role}
                                    className="flex items-center space-x-2"
                                  >
                                    <input
                                      type="checkbox"
                                      checked={
                                        transition.requiredRoles?.includes(
                                          role,
                                        ) || false
                                      }
                                      onChange={(e) => {
                                        const updatedRoles = e.target.checked
                                          ? [
                                              ...(transition.requiredRoles ||
                                                []),
                                              role,
                                            ]
                                          : (
                                              transition.requiredRoles || []
                                            ).filter((r) => r !== role);
                                        handleUpdateTransition(transition.id, {
                                          requiredRoles: updatedRoles,
                                        });
                                      }}
                                      className="rounded border-gray-300"
                                    />
                                    <span>{role.replace(/_/g, " ")}</span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {validationErrors.transitions.length > 0 && (
            <div className="bg-red-50 p-4 rounded-md">
              <h4 className="text-red-800 font-medium flex items-center">
                <AlertCircle className="h-4 w-4 mr-2" /> Validation Errors
              </h4>
              <ul className="list-disc pl-5 mt-2">
                {validationErrors.transitions.map((error, index) => (
                  <li key={index} className="text-red-700 text-sm">
                    {error}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </TabsContent>

        {/* Visualization Tab */}
        <TabsContent value="visualization" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Workflow Visualization</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-100 p-4 rounded-md h-96 flex items-center justify-center">
                <p className="text-gray-500">
                  Workflow visualization would be rendered here using a graph
                  library like React Flow or D3.js
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Validation Tab */}
        <TabsContent value="validation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Workflow Validation</CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={validateTemplate} className="mb-4">
                Validate Workflow
              </Button>

              {Object.values(validationErrors).some(
                (errors) => errors.length > 0,
              ) ? (
                <div className="space-y-4">
                  {Object.entries(validationErrors).map(
                    ([section, errors]) =>
                      errors.length > 0 && (
                        <div key={section} className="bg-red-50 p-4 rounded-md">
                          <h4 className="text-red-800 font-medium capitalize">
                            {section} Errors
                          </h4>
                          <ul className="list-disc pl-5 mt-2">
                            {errors.map((error, index) => (
                              <li key={index} className="text-red-700 text-sm">
                                {error}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ),
                  )}
                </div>
              ) : (
                <div className="bg-green-50 p-4 rounded-md">
                  <h4 className="text-green-800 font-medium flex items-center">
                    <Check className="h-4 w-4 mr-2" /> Workflow is valid
                  </h4>
                  <p className="text-green-700 text-sm mt-1">
                    No validation errors found in the workflow template.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Test Workflow</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500 mb-4">
                Test your workflow by simulating transitions and checking the
                expected behavior.
              </p>
              <div className="bg-gray-100 p-4 rounded-md h-40 flex items-center justify-center">
                <p className="text-gray-500">
                  Workflow testing interface would be implemented here
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Client Variations Tab */}
        <TabsContent value="clientSpecific" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Client-Specific Variations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  View for Client Type
                </label>
                <Select
                  value={clientTypeView}
                  onValueChange={(value) =>
                    setClientTypeView(value as ClientType | "all")
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Client Types</SelectItem>
                    {Object.values(ClientType).map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-gray-100 p-4 rounded-md">
                <p className="text-gray-500 mb-4">
                  Define client-specific variations for steps and transitions.
                  Select a client type above to view and edit variations.
                </p>

                {clientTypeView !== "all" && (
                  <div className="space-y-4">
                    <h3 className="font-medium">
                      Client-Specific Step Overrides for {clientTypeView}
                    </h3>
                    <div className="bg-white p-4 rounded-md">
                      <p className="text-gray-500 italic">
                        Client-specific step configuration would be implemented
                        here
                      </p>
                    </div>

                    <h3 className="font-medium">
                      Client-Specific Transition Overrides for {clientTypeView}
                    </h3>
                    <div className="bg-white p-4 rounded-md">
                      <p className="text-gray-500 italic">
                        Client-specific transition configuration would be
                        implemented here
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-6 flex justify-end">
        <Button onClick={handleSave} className="flex items-center">
          <Save className="h-4 w-4 mr-2" /> Save Template
        </Button>
      </div>
    </div>
  );
};

export default WorkflowTemplateEditor;
