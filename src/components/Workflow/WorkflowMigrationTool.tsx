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
import {
  WorkflowTemplate,
  Workflow,
  WorkflowStatus,
  WorkflowHistoryEntry,
} from "@/services/workflowEngine";
import {
  AlertCircle,
  Check,
  ArrowRight,
  History,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";

interface WorkflowMigrationToolProps {
  templates: WorkflowTemplate[];
  workflows: Workflow[];
  onMigrate?: (
    workflowIds: string[],
    targetTemplateId: string,
  ) => Promise<boolean>;
  onRollback?: (migrationId: string) => Promise<boolean>;
}

interface MigrationHistoryItem {
  id: string;
  timestamp: Date;
  sourceTemplateId: string;
  targetTemplateId: string;
  sourceTemplateVersion: string;
  targetTemplateVersion: string;
  affectedWorkflows: string[];
  status: "completed" | "failed" | "in_progress" | "rolled_back";
  userId: string;
  changes: {
    stepsAdded: string[];
    stepsRemoved: string[];
    stepsModified: string[];
    transitionsAdded: string[];
    transitionsRemoved: string[];
    transitionsModified: string[];
  };
}

const WorkflowMigrationTool: React.FC<WorkflowMigrationToolProps> = ({
  templates = [],
  workflows = [],
  onMigrate,
  onRollback,
}) => {
  const [activeTab, setActiveTab] = useState("migration");
  const [sourceTemplateId, setSourceTemplateId] = useState<string>("");
  const [targetTemplateId, setTargetTemplateId] = useState<string>("");
  const [selectedWorkflows, setSelectedWorkflows] = useState<string[]>([]);
  const [migrationHistory, setMigrationHistory] = useState<
    MigrationHistoryItem[]
  >([]);
  const [impactAnalysis, setImpactAnalysis] = useState<{
    stepsAdded: string[];
    stepsRemoved: string[];
    stepsModified: string[];
    transitionsAdded: string[];
    transitionsRemoved: string[];
    transitionsModified: string[];
    affectedWorkflows: number;
    criticalChanges: boolean;
  } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationError, setMigrationError] = useState<string | null>(null);
  const [migrationSuccess, setMigrationSuccess] = useState<string | null>(null);

  // Filter workflows by template
  const filteredWorkflows = workflows.filter(
    (workflow) =>
      workflow.parentWorkflowId === sourceTemplateId || sourceTemplateId === "",
  );

  // Select/deselect all workflows
  const handleSelectAllWorkflows = () => {
    if (selectedWorkflows.length === filteredWorkflows.length) {
      setSelectedWorkflows([]);
    } else {
      setSelectedWorkflows(filteredWorkflows.map((workflow) => workflow.id));
    }
  };

  // Toggle workflow selection
  const toggleWorkflowSelection = (workflowId: string) => {
    if (selectedWorkflows.includes(workflowId)) {
      setSelectedWorkflows(selectedWorkflows.filter((id) => id !== workflowId));
    } else {
      setSelectedWorkflows([...selectedWorkflows, workflowId]);
    }
  };

  // Analyze impact of migration
  const analyzeImpact = () => {
    setIsAnalyzing(true);
    setMigrationError(null);
    setMigrationSuccess(null);

    // Find source and target templates
    const sourceTemplate = templates.find(
      (template) => template.id === sourceTemplateId,
    );
    const targetTemplate = templates.find(
      (template) => template.id === targetTemplateId,
    );

    if (!sourceTemplate || !targetTemplate) {
      setMigrationError("Source or target template not found");
      setIsAnalyzing(false);
      return;
    }

    // Analyze differences between templates
    const sourceStepIds = sourceTemplate.steps.map((step) => step.id);
    const targetStepIds = targetTemplate.steps.map((step) => step.id);

    const sourceTransitionIds = sourceTemplate.transitions.map(
      (transition) => transition.id,
    );
    const targetTransitionIds = targetTemplate.transitions.map(
      (transition) => transition.id,
    );

    // Find added, removed, and modified steps
    const stepsAdded = targetTemplate.steps
      .filter((step) => !sourceStepIds.includes(step.id))
      .map((step) => step.name);

    const stepsRemoved = sourceTemplate.steps
      .filter((step) => !targetStepIds.includes(step.id))
      .map((step) => step.name);

    const stepsModified = targetTemplate.steps
      .filter((targetStep) => {
        const sourceStep = sourceTemplate.steps.find(
          (step) => step.id === targetStep.id,
        );
        if (!sourceStep) return false;

        // Check if any properties have changed
        return (
          JSON.stringify({
            name: targetStep.name,
            description: targetStep.description,
            phase: targetStep.phase,
            requiredRoles: targetStep.requiredRoles,
            timeoutMinutes: targetStep.timeoutMinutes,
            autoTransition: targetStep.autoTransition,
            conditionalBranching: targetStep.conditionalBranching,
          }) !==
          JSON.stringify({
            name: sourceStep.name,
            description: sourceStep.description,
            phase: sourceStep.phase,
            requiredRoles: sourceStep.requiredRoles,
            timeoutMinutes: sourceStep.timeoutMinutes,
            autoTransition: sourceStep.autoTransition,
            conditionalBranching: sourceStep.conditionalBranching,
          })
        );
      })
      .map((step) => step.name);

    // Find added, removed, and modified transitions
    const transitionsAdded = targetTemplate.transitions
      .filter((transition) => !sourceTransitionIds.includes(transition.id))
      .map((transition) => transition.name);

    const transitionsRemoved = sourceTemplate.transitions
      .filter((transition) => !targetTransitionIds.includes(transition.id))
      .map((transition) => transition.name);

    const transitionsModified = targetTemplate.transitions
      .filter((targetTransition) => {
        const sourceTransition = sourceTemplate.transitions.find(
          (transition) => transition.id === targetTransition.id,
        );
        if (!sourceTransition) return false;

        // Check if any properties have changed
        return (
          JSON.stringify({
            name: targetTransition.name,
            fromStepId: targetTransition.fromStepId,
            toStepId: targetTransition.toStepId,
            conditionExpression: targetTransition.conditionExpression,
            requiredRoles: targetTransition.requiredRoles,
          }) !==
          JSON.stringify({
            name: sourceTransition.name,
            fromStepId: sourceTransition.fromStepId,
            toStepId: sourceTransition.toStepId,
            conditionExpression: sourceTransition.conditionExpression,
            requiredRoles: sourceTransition.requiredRoles,
          })
        );
      })
      .map((transition) => transition.name);

    // Count affected workflows
    const affectedWorkflows = filteredWorkflows.filter((workflow) =>
      selectedWorkflows.includes(workflow.id),
    ).length;

    // Determine if there are critical changes
    const criticalChanges =
      stepsRemoved.length > 0 ||
      transitionsRemoved.length > 0 ||
      stepsModified.filter((step) => step.includes("required")).length > 0;

    setImpactAnalysis({
      stepsAdded,
      stepsRemoved,
      stepsModified,
      transitionsAdded,
      transitionsRemoved,
      transitionsModified,
      affectedWorkflows,
      criticalChanges,
    });

    setIsAnalyzing(false);
  };

  // Perform migration
  const performMigration = async () => {
    if (!onMigrate) {
      setMigrationError("Migration function not provided");
      return;
    }

    setIsMigrating(true);
    setMigrationError(null);
    setMigrationSuccess(null);

    try {
      const success = await onMigrate(selectedWorkflows, targetTemplateId);

      if (success) {
        // Create a migration history entry
        const sourceTemplate = templates.find(
          (template) => template.id === sourceTemplateId,
        );
        const targetTemplate = templates.find(
          (template) => template.id === targetTemplateId,
        );

        if (sourceTemplate && targetTemplate && impactAnalysis) {
          const migrationId = `migration_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
          const newMigrationEntry: MigrationHistoryItem = {
            id: migrationId,
            timestamp: new Date(),
            sourceTemplateId,
            targetTemplateId,
            sourceTemplateVersion: sourceTemplate.version,
            targetTemplateVersion: targetTemplate.version,
            affectedWorkflows: [...selectedWorkflows],
            status: "completed",
            userId: "current_user", // In a real app, this would be the actual user ID
            changes: {
              stepsAdded: impactAnalysis.stepsAdded,
              stepsRemoved: impactAnalysis.stepsRemoved,
              stepsModified: impactAnalysis.stepsModified,
              transitionsAdded: impactAnalysis.transitionsAdded,
              transitionsRemoved: impactAnalysis.transitionsRemoved,
              transitionsModified: impactAnalysis.transitionsModified,
            },
          };

          setMigrationHistory([newMigrationEntry, ...migrationHistory]);
          setMigrationSuccess(
            `Successfully migrated ${selectedWorkflows.length} workflow(s) to template ${targetTemplate.name} (v${targetTemplate.version})`,
          );
        }
      } else {
        setMigrationError(
          "Migration failed. Please check the logs for details.",
        );
      }
    } catch (error) {
      setMigrationError(
        `Migration error: ${error instanceof Error ? error.message : String(error)}`,
      );
    } finally {
      setIsMigrating(false);
    }
  };

  // Perform rollback
  const performRollback = async (migrationId: string) => {
    if (!onRollback) {
      setMigrationError("Rollback function not provided");
      return;
    }

    try {
      const success = await onRollback(migrationId);

      if (success) {
        // Update migration history
        const updatedHistory = migrationHistory.map((item) =>
          item.id === migrationId ? { ...item, status: "rolled_back" } : item,
        );
        setMigrationHistory(updatedHistory);
        setMigrationSuccess(
          `Successfully rolled back migration ${migrationId}`,
        );
      } else {
        setMigrationError(
          "Rollback failed. Please check the logs for details.",
        );
      }
    } catch (error) {
      setMigrationError(
        `Rollback error: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString();
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Workflow Migration Tool</h2>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="migration">Migration</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="audit">Audit Log</TabsTrigger>
        </TabsList>

        {/* Migration Tab */}
        <TabsContent value="migration" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Template Selection</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Source Template
                </label>
                <Select
                  value={sourceTemplateId}
                  onValueChange={setSourceTemplateId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select source template" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name} (v{template.version})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Target Template
                </label>
                <Select
                  value={targetTemplateId}
                  onValueChange={setTargetTemplateId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select target template" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates
                      .filter((template) => template.id !== sourceTemplateId)
                      .map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name} (v{template.version})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Workflow Selection</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex justify-between items-center">
                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={
                        selectedWorkflows.length === filteredWorkflows.length &&
                        filteredWorkflows.length > 0
                      }
                      onChange={handleSelectAllWorkflows}
                      className="rounded border-gray-300"
                    />
                    <span>Select All</span>
                  </label>
                </div>
                <div className="text-sm text-gray-500">
                  {selectedWorkflows.length} of {filteredWorkflows.length}{" "}
                  selected
                </div>
              </div>

              {filteredWorkflows.length === 0 ? (
                <p className="text-gray-500 italic">
                  No workflows found for the selected source template.
                </p>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {filteredWorkflows.map((workflow) => (
                    <div
                      key={workflow.id}
                      className="border p-3 rounded-md flex justify-between items-center"
                    >
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={selectedWorkflows.includes(workflow.id)}
                          onChange={() => toggleWorkflowSelection(workflow.id)}
                          className="rounded border-gray-300"
                        />
                        <div>
                          <h4 className="font-medium">{workflow.name}</h4>
                          <p className="text-sm text-gray-500">
                            Status: {workflow.status} | Created:{" "}
                            {formatDate(workflow.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${workflow.status === WorkflowStatus.Completed ? "bg-green-100 text-green-800" : workflow.status === WorkflowStatus.InProgress ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"}`}
                        >
                          {workflow.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Impact Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                onClick={analyzeImpact}
                disabled={
                  isAnalyzing ||
                  !sourceTemplateId ||
                  !targetTemplateId ||
                  selectedWorkflows.length === 0
                }
                className="mb-4"
              >
                {isAnalyzing ? "Analyzing..." : "Analyze Impact"}
              </Button>

              {impactAnalysis && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Steps</h4>
                      <div className="space-y-2">
                        <div>
                          <span className="text-green-600 font-medium">
                            Added:
                          </span>{" "}
                          {impactAnalysis.stepsAdded.length > 0
                            ? impactAnalysis.stepsAdded.join(", ")
                            : "None"}
                        </div>
                        <div>
                          <span className="text-red-600 font-medium">
                            Removed:
                          </span>{" "}
                          {impactAnalysis.stepsRemoved.length > 0
                            ? impactAnalysis.stepsRemoved.join(", ")
                            : "None"}
                        </div>
                        <div>
                          <span className="text-amber-600 font-medium">
                            Modified:
                          </span>{" "}
                          {impactAnalysis.stepsModified.length > 0
                            ? impactAnalysis.stepsModified.join(", ")
                            : "None"}
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Transitions</h4>
                      <div className="space-y-2">
                        <div>
                          <span className="text-green-600 font-medium">
                            Added:
                          </span>{" "}
                          {impactAnalysis.transitionsAdded.length > 0
                            ? impactAnalysis.transitionsAdded.join(", ")
                            : "None"}
                        </div>
                        <div>
                          <span className="text-red-600 font-medium">
                            Removed:
                          </span>{" "}
                          {impactAnalysis.transitionsRemoved.length > 0
                            ? impactAnalysis.transitionsRemoved.join(", ")
                            : "None"}
                        </div>
                        <div>
                          <span className="text-amber-600 font-medium">
                            Modified:
                          </span>{" "}
                          {impactAnalysis.transitionsModified.length > 0
                            ? impactAnalysis.transitionsModified.join(", ")
                            : "None"}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <h4 className="font-medium mb-2">Summary</h4>
                    <p>
                      This migration will affect{" "}
                      <span className="font-medium">
                        {impactAnalysis.affectedWorkflows}
                      </span>{" "}
                      workflow instances.
                    </p>

                    {impactAnalysis.criticalChanges && (
                      <div className="bg-amber-50 border border-amber-200 p-3 rounded-md mt-2 flex items-start">
                        <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 mt-0.5" />
                        <div>
                          <p className="text-amber-800 font-medium">
                            Warning: Critical Changes
                          </p>
                          <p className="text-amber-700 text-sm">
                            This migration includes removing steps or
                            transitions, which may cause data loss or workflow
                            disruption. Proceed with caution.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button
                onClick={performMigration}
                disabled={
                  isMigrating ||
                  !impactAnalysis ||
                  !sourceTemplateId ||
                  !targetTemplateId ||
                  selectedWorkflows.length === 0
                }
                className="w-full"
              >
                {isMigrating ? "Migrating..." : "Perform Migration"}
              </Button>
            </CardFooter>
          </Card>

          {migrationError && (
            <div className="bg-red-50 p-4 rounded-md">
              <h4 className="text-red-800 font-medium flex items-center">
                <AlertCircle className="h-4 w-4 mr-2" /> Error
              </h4>
              <p className="text-red-700 text-sm mt-1">{migrationError}</p>
            </div>
          )}

          {migrationSuccess && (
            <div className="bg-green-50 p-4 rounded-md">
              <h4 className="text-green-800 font-medium flex items-center">
                <Check className="h-4 w-4 mr-2" /> Success
              </h4>
              <p className="text-green-700 text-sm mt-1">{migrationSuccess}</p>
            </div>
          )}
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Migration History</CardTitle>
            </CardHeader>
            <CardContent>
              {migrationHistory.length === 0 ? (
                <p className="text-gray-500 italic">
                  No migration history available.
                </p>
              ) : (
                <div className="space-y-4">
                  {migrationHistory.map((migration) => {
                    const sourceTemplate = templates.find(
                      (template) => template.id === migration.sourceTemplateId,
                    );
                    const targetTemplate = templates.find(
                      (template) => template.id === migration.targetTemplateId,
                    );

                    return (
                      <div key={migration.id} className="border p-4 rounded-md">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">
                              Migration {migration.id.split("_")[1]}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {formatDate(migration.timestamp)}
                            </p>
                          </div>
                          <div>
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${migration.status === "completed" ? "bg-green-100 text-green-800" : migration.status === "in_progress" ? "bg-blue-100 text-blue-800" : migration.status === "rolled_back" ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-800"}`}
                            >
                              {migration.status.replace("_", " ")}
                            </span>
                          </div>
                        </div>

                        <div className="mt-3 flex items-center text-sm">
                          <span className="font-medium">
                            {sourceTemplate?.name || "Unknown"} (v
                            {migration.sourceTemplateVersion})
                          </span>
                          <ArrowRight className="h-4 w-4 mx-2" />
                          <span className="font-medium">
                            {targetTemplate?.name || "Unknown"} (v
                            {migration.targetTemplateVersion})
                          </span>
                        </div>

                        <div className="mt-2 text-sm">
                          <span className="text-gray-600">
                            Affected workflows:{" "}
                            {migration.affectedWorkflows.length}
                          </span>
                        </div>

                        <div className="mt-3 flex justify-between items-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setActiveTab("audit")}
                            className="flex items-center"
                          >
                            <History className="h-4 w-4 mr-1" /> View Details
                          </Button>

                          {migration.status === "completed" && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => performRollback(migration.id)}
                              className="flex items-center"
                            >
                              <RefreshCw className="h-4 w-4 mr-1" /> Rollback
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audit Log Tab */}
        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Audit Log</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {migrationHistory.length === 0 ? (
                  <p className="text-gray-500 italic">
                    No audit log entries available.
                  </p>
                ) : (
                  migrationHistory.map((migration) => {
                    const sourceTemplate = templates.find(
                      (template) => template.id === migration.sourceTemplateId,
                    );
                    const targetTemplate = templates.find(
                      (template) => template.id === migration.targetTemplateId,
                    );

                    return (
                      <div key={migration.id} className="border p-4 rounded-md">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">
                              Migration {migration.id.split("_")[1]}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {formatDate(migration.timestamp)}
                            </p>
                          </div>
                          <div>
                            <span
                              className={`px-2 py-1 text-xs rounded-full ${migration.status === "completed" ? "bg-green-100 text-green-800" : migration.status === "in_progress" ? "bg-blue-100 text-blue-800" : migration.status === "rolled_back" ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-800"}`}
                            >
                              {migration.status.replace("_", " ")}
                            </span>
                          </div>
                        </div>

                        <div className="mt-3">
                          <p className="text-sm">
                            <span className="font-medium">User:</span>{" "}
                            {migration.userId}
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">
                              Source Template:
                            </span>{" "}
                            {sourceTemplate?.name || "Unknown"} (v
                            {migration.sourceTemplateVersion})
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">
                              Target Template:
                            </span>{" "}
                            {targetTemplate?.name || "Unknown"} (v
                            {migration.targetTemplateVersion})
                          </p>
                          <p className="text-sm">
                            <span className="font-medium">
                              Affected Workflows:
                            </span>{" "}
                            {migration.affectedWorkflows.length}
                          </p>
                        </div>

                        <div className="mt-3">
                          <h4 className="font-medium text-sm mb-1">Changes</h4>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <p>
                                <span className="text-green-600">
                                  Steps Added:
                                </span>{" "}
                                {migration.changes.stepsAdded.length > 0
                                  ? migration.changes.stepsAdded.join(", ")
                                  : "None"}
                              </p>
                              <p>
                                <span className="text-red-600">
                                  Steps Removed:
                                </span>{" "}
                                {migration.changes.stepsRemoved.length > 0
                                  ? migration.changes.stepsRemoved.join(", ")
                                  : "None"}
                              </p>
                              <p>
                                <span className="text-amber-600">
                                  Steps Modified:
                                </span>{" "}
                                {migration.changes.stepsModified.length > 0
                                  ? migration.changes.stepsModified.join(", ")
                                  : "None"}
                              </p>
                            </div>
                            <div>
                              <p>
                                <span className="text-green-600">
                                  Transitions Added:
                                </span>{" "}
                                {migration.changes.transitionsAdded.length > 0
                                  ? migration.changes.transitionsAdded.join(
                                      ", ",
                                    )
                                  : "None"}
                              </p>
                              <p>
                                <span className="text-red-600">
                                  Transitions Removed:
                                </span>{" "}
                                {migration.changes.transitionsRemoved.length > 0
                                  ? migration.changes.transitionsRemoved.join(
                                      ", ",
                                    )
                                  : "None"}
                              </p>
                              <p>
                                <span className="text-amber-600">
                                  Transitions Modified:
                                </span>{" "}
                                {migration.changes.transitionsModified.length >
                                0
                                  ? migration.changes.transitionsModified.join(
                                      ", ",
                                    )
                                  : "None"}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="mt-3">
                          <h4 className="font-medium text-sm mb-1">
                            Affected Workflow IDs
                          </h4>
                          <div className="text-xs text-gray-500 max-h-20 overflow-y-auto">
                            {migration.affectedWorkflows.join(", ")}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WorkflowMigrationTool;
