import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { ScrollArea } from "../ui/scroll-area";
import { Bell, CheckCircle, Clock, AlertTriangle, Info } from "lucide-react";
import {
  WorkflowEngine,
  WorkflowPhase,
  WorkflowStatus,
  WorkflowStep,
  Workflow,
  WorkflowContext,
} from "../../services/workflowEngine";

import { ClientType } from "@/lib/forms/types";

import {
  NotificationService,
  NotificationType,
  NotificationPriority,
  NotificationChannel,
  Notification,
} from "../../services/notificationService";
import { useAuth } from "../../context/AuthContext";

interface WorkflowNotificationIntegrationProps {
  workflowId?: string;
  userId?: string;
  clientType?: ClientType;
}

const WorkflowNotificationIntegration: React.FC<
  WorkflowNotificationIntegrationProps
> = ({
  workflowId = "default-workflow",
  userId = "current-user",
  clientType = ClientType.FDF,
}) => {
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [currentStep, setCurrentStep] = useState<WorkflowStep | null>(null);
  const [nextSteps, setNextSteps] = useState<WorkflowStep[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { user } = useAuth();
  const workflowEngine = WorkflowEngine.getInstance();
  const notificationService = NotificationService.getInstance();

  // Initialize workflow and notification system
  useEffect(() => {
    const initializeWorkflow = async () => {
      setIsLoading(true);

      try {
        // Create a sample workflow if it doesn't exist
        if (!workflowEngine.getWorkflow(workflowId)) {
          const sampleWorkflow: Workflow = {
            id: workflowId,
            name: "Home Modification Process",
            description: "Workflow for senior home modification projects",
            clientType: clientType,
            steps: [
              {
                id: "assessment",
                name: "Initial Assessment",
                description: "Conduct initial home assessment",
                phase: WorkflowPhase.Assessment,
                order: 1,
                status: WorkflowStatus.Completed,
                requiredRoles: ["Assessor"],
                previousSteps: [],
                nextSteps: ["planning"],
              },
              {
                id: "planning",
                name: "Project Planning",
                description: "Create project plan and budget",
                phase: WorkflowPhase.ProjectPlanning,
                order: 2,
                status: WorkflowStatus.InProgress,
                requiredRoles: ["Project Manager"],
                previousSteps: ["assessment"],
                nextSteps: ["approval"],
              },
              {
                id: "approval",
                name: "Committee Approval",
                description: "Get approval from committee",
                phase: WorkflowPhase.ApprovalProcess,
                order: 3,
                status: WorkflowStatus.NotStarted,
                requiredRoles: ["Committee Member"],
                previousSteps: ["planning"],
                nextSteps: ["execution"],
              },
              {
                id: "execution",
                name: "Project Execution",
                description: "Execute the home modification project",
                phase: WorkflowPhase.Execution,
                order: 4,
                status: WorkflowStatus.NotStarted,
                requiredRoles: ["Contractor"],
                previousSteps: ["approval"],
                nextSteps: ["financial"],
              },
              {
                id: "financial",
                name: "Financial Closure",
                description: "Complete financial transactions and reporting",
                phase: WorkflowPhase.FinancialManagement,
                order: 5,
                status: WorkflowStatus.NotStarted,
                requiredRoles: ["Financial Officer"],
                previousSteps: ["execution"],
                nextSteps: [],
              },
            ],
            currentStepId: "planning",
            status: WorkflowStatus.InProgress,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          workflowEngine.registerWorkflow(sampleWorkflow);

          // Register transitions
          workflowEngine.registerTransition(workflowId, {
            fromStepId: "assessment",
            toStepId: "planning",
          });

          workflowEngine.registerTransition(workflowId, {
            fromStepId: "planning",
            toStepId: "approval",
          });

          workflowEngine.registerTransition(workflowId, {
            fromStepId: "approval",
            toStepId: "execution",
          });

          workflowEngine.registerTransition(workflowId, {
            fromStepId: "execution",
            toStepId: "financial",
          });
        }

        // Register notification templates
        const stepCompletedTemplate = {
          id: "step-completed",
          name: "Workflow Step Completed",
          description: "Notification sent when a workflow step is completed",
          type: NotificationType.Success,
          channels: [NotificationChannel.InApp, NotificationChannel.Email],
          titleTemplate: "{{workflowName}}: {{stepName}} Completed",
          bodyTemplate:
            "The {{stepName}} step has been completed for workflow {{workflowName}}.",
          defaultPriority: NotificationPriority.Medium,
        };

        const stepStartedTemplate = {
          id: "step-started",
          name: "Workflow Step Started",
          description: "Notification sent when a workflow step is started",
          type: NotificationType.Info,
          channels: [NotificationChannel.InApp],
          titleTemplate: "{{workflowName}}: {{stepName}} Started",
          bodyTemplate:
            "The {{stepName}} step has been started for workflow {{workflowName}}.",
          defaultPriority: NotificationPriority.Low,
        };

        const approvalRequiredTemplate = {
          id: "approval-required",
          name: "Approval Required",
          description: "Notification sent when approval is required",
          type: NotificationType.Warning,
          channels: [NotificationChannel.InApp, NotificationChannel.Email],
          titleTemplate: "Approval Required: {{workflowName}}",
          bodyTemplate:
            "Your approval is required for the {{stepName}} step in workflow {{workflowName}}.",
          defaultPriority: NotificationPriority.High,
        };

        notificationService.registerTemplate(stepCompletedTemplate);
        notificationService.registerTemplate(stepStartedTemplate);
        notificationService.registerTemplate(approvalRequiredTemplate);

        // Get workflow data
        const workflowData = workflowEngine.getWorkflow(workflowId);
        if (workflowData) {
          setWorkflow(workflowData);

          const currentStepData = workflowEngine.getCurrentStep(workflowId);
          setCurrentStep(currentStepData || null);

          const context: WorkflowContext = { userId };
          const availableNextSteps = workflowEngine.getAvailableNextSteps(
            workflowId,
            context,
          );
          setNextSteps(availableNextSteps);

          // Create some sample notifications
          await notificationService.sendNotification("step-completed", userId, {
            workflowName: workflowData.name,
            stepName: "Initial Assessment",
          });

          await notificationService.sendNotification("step-started", userId, {
            workflowName: workflowData.name,
            stepName: "Project Planning",
          });
        }

        // Get user notifications
        const userNotifications =
          notificationService.getUserNotifications(userId);
        setNotifications(userNotifications);
      } catch (error) {
        console.error("Error initializing workflow:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeWorkflow();
  }, [workflowId, userId, clientType]);

  // Handle transition to next step
  const handleTransition = async (nextStepId: string) => {
    if (!workflow) return;

    setIsLoading(true);
    try {
      const context: WorkflowContext = { userId };
      const success = await workflowEngine.transitionToStep(
        workflowId,
        nextStepId,
        context,
      );

      if (success) {
        // Get updated workflow data
        const updatedWorkflow = workflowEngine.getWorkflow(workflowId);
        if (updatedWorkflow) {
          setWorkflow(updatedWorkflow);

          const updatedCurrentStep = workflowEngine.getCurrentStep(workflowId);
          setCurrentStep(updatedCurrentStep || null);

          const updatedNextSteps = workflowEngine.getAvailableNextSteps(
            workflowId,
            context,
          );
          setNextSteps(updatedNextSteps);

          // Send notifications
          const previousStep = workflow.steps.find(
            (step) => step.id === workflow.currentStepId,
          );
          const nextStep = updatedWorkflow.steps.find(
            (step) => step.id === nextStepId,
          );

          if (previousStep) {
            await notificationService.sendNotification(
              "step-completed",
              userId,
              {
                workflowName: workflow.name,
                stepName: previousStep.name,
              },
            );
          }

          if (nextStep) {
            await notificationService.sendNotification("step-started", userId, {
              workflowName: workflow.name,
              stepName: nextStep.name,
            });

            // If this is an approval step, send approval notification
            if (nextStep.phase === WorkflowPhase.ApprovalProcess) {
              await notificationService.sendNotification(
                "approval-required",
                userId,
                {
                  workflowName: workflow.name,
                  stepName: nextStep.name,
                },
              );
            }
          }

          // Get updated notifications
          const updatedNotifications =
            notificationService.getUserNotifications(userId);
          setNotifications(updatedNotifications);
        }
      }
    } catch (error) {
      console.error("Error transitioning to next step:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Mark notification as read
  const handleMarkAsRead = (notificationId: string) => {
    notificationService.markAsRead(notificationId);
    const updatedNotifications =
      notificationService.getUserNotifications(userId);
    setNotifications(updatedNotifications);
  };

  // Mark all notifications as read
  const handleMarkAllAsRead = () => {
    notificationService.markAllAsRead(userId);
    const updatedNotifications =
      notificationService.getUserNotifications(userId);
    setNotifications(updatedNotifications);
  };

  // Get status badge color
  const getStatusBadgeColor = (status: WorkflowStatus) => {
    switch (status) {
      case WorkflowStatus.Completed:
        return "bg-green-500";
      case WorkflowStatus.InProgress:
        return "bg-blue-500";
      case WorkflowStatus.OnHold:
        return "bg-amber-500";
      case WorkflowStatus.Cancelled:
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  // Get notification icon
  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case NotificationType.Success:
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case NotificationType.Warning:
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case NotificationType.Error:
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-center items-center h-40">
            <p>Loading workflow and notifications...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!workflow || !currentStep) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-center items-center h-40">
            <p>No workflow data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Workflow & Notification Integration</CardTitle>
        <CardDescription>
          Demonstrating integration between workflow engine and notification
          service
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="workflow">
          <TabsList className="mb-4">
            <TabsTrigger value="workflow">Workflow</TabsTrigger>
            <TabsTrigger value="notifications">
              Notifications
              {notifications.filter((n) => !n.isRead).length > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {notifications.filter((n) => !n.isRead).length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="workflow">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">{workflow.name}</h3>
                <p className="text-sm text-gray-500">{workflow.description}</p>
                <Badge
                  className={`mt-2 ${getStatusBadgeColor(workflow.status)}`}
                >
                  {workflow.status}
                </Badge>
              </div>

              <div>
                <h4 className="text-md font-medium mb-2">Current Step</h4>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h5 className="font-medium">{currentStep.name}</h5>
                        <p className="text-sm text-gray-500">
                          {currentStep.description}
                        </p>
                        <div className="mt-2">
                          <Badge
                            className={getStatusBadgeColor(currentStep.status)}
                          >
                            {currentStep.status}
                          </Badge>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm">
                          Phase:{" "}
                          <span className="font-medium">
                            {currentStep.phase}
                          </span>
                        </p>
                        <p className="text-sm">
                          Required Roles:{" "}
                          <span className="font-medium">
                            {currentStep.requiredRoles.join(", ")}
                          </span>
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div>
                <h4 className="text-md font-medium mb-2">
                  Available Next Steps
                </h4>
                {nextSteps.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {nextSteps.map((step) => (
                      <Card key={step.id}>
                        <CardContent className="pt-6">
                          <div className="flex justify-between items-start">
                            <div>
                              <h5 className="font-medium">{step.name}</h5>
                              <p className="text-sm text-gray-500">
                                {step.description}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                Phase: {step.phase}
                              </p>
                            </div>
                            <Button
                              onClick={() => handleTransition(step.id)}
                              disabled={isLoading}
                            >
                              Transition
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">
                    No available next steps
                  </p>
                )}
              </div>

              <div>
                <h4 className="text-md font-medium mb-2">All Workflow Steps</h4>
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
                  <div className="space-y-4">
                    {workflow.steps.map((step) => {
                      const isCurrentStep = step.id === workflow.currentStepId;
                      return (
                        <div key={step.id} className="relative pl-10">
                          <div
                            className={`absolute left-0 top-1.5 w-8 h-8 rounded-full flex items-center justify-center ${isCurrentStep ? "bg-blue-500 text-white" : getStatusBadgeColor(step.status)}`}
                          >
                            {step.order}
                          </div>
                          <div
                            className={`p-3 border rounded-md ${isCurrentStep ? "border-blue-500 bg-blue-50" : ""}`}
                          >
                            <h5 className="font-medium">{step.name}</h5>
                            <p className="text-sm text-gray-500">
                              {step.description}
                            </p>
                            <div className="flex justify-between items-center mt-2">
                              <Badge
                                className={getStatusBadgeColor(step.status)}
                              >
                                {step.status}
                              </Badge>
                              <p className="text-xs text-gray-400">
                                Phase: {step.phase}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="notifications">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Notifications</h3>
                {notifications.filter((n) => !n.isRead).length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleMarkAllAsRead}
                  >
                    Mark All as Read
                  </Button>
                )}
              </div>

              <ScrollArea className="h-[400px] pr-4">
                {notifications.length > 0 ? (
                  <div className="space-y-3">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-3 border rounded-md ${notification.isRead ? "bg-white" : "bg-blue-50 border-blue-200"}`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex items-start space-x-2">
                            <div className="mt-0.5">
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div>
                              <h4 className="text-sm font-medium">
                                {notification.title}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {notification.body}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                {new Date(
                                  notification.createdAt,
                                ).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          {!notification.isRead && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMarkAsRead(notification.id)}
                            >
                              Mark as Read
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-40 text-gray-500">
                    <Bell className="h-8 w-8 mb-2 text-gray-400" />
                    <p>No notifications</p>
                  </div>
                )}
              </ScrollArea>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default WorkflowNotificationIntegration;
