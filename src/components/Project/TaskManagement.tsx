import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { projectApi } from "@/lib/api/project/projectApi";
import { ProjectTask } from "@/lib/api/project/types";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Checkbox } from "../ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Plus, Calendar, Clock, User, AlertTriangle } from "lucide-react";
import TaskForm from "./TaskForm";
import { useTranslatedDirection } from "@/hooks/useTranslatedDirection";
import { useToast } from "../ui/use-toast";

interface TaskManagementProps {
  projectId?: number;
}

const TaskManagement: React.FC<TaskManagementProps> = ({ projectId }) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { directionClass } = useTranslatedDirection();
  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateTaskDialogOpen, setIsCreateTaskDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<ProjectTask | null>(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setIsLoading(true);
        let response;

        if (projectId) {
          response = await projectApi.getProjectTasks(projectId, {
            page: 1,
            pageSize: 50,
            language: "en",
          });
        } else {
          response = await projectApi.getAllProjectTasks({
            page: 1,
            pageSize: 50,
            language: "en",
          });
        }

        // Check if we have valid data from the API
        if (response?.success && response?.data?.items) {
          setTasks(response.data.items);

          // Check for overdue tasks and notify user if there are any
          const overdueTasksCount = response.data.items.filter(
            (task) =>
              !task.completionDate && new Date() > new Date(task.dueDate),
          ).length;

          if (overdueTasksCount > 0) {
            toast({
              title: "Attention Required",
              description: `You have ${overdueTasksCount} overdue ${overdueTasksCount === 1 ? "task" : "tasks"} that require attention.`,
              variant: "warning",
            });
          }
        } else {
          // Use mock data if API response is not valid
          console.warn(
            "API returned no data or error, using mock data instead",
          );
          const mockTasks = generateMockTasks(projectId);
          setTasks(mockTasks);

          // Check for overdue mock tasks
          const overdueTasksCount = mockTasks.filter(
            (task) =>
              !task.completionDate && new Date() > new Date(task.dueDate),
          ).length;

          if (overdueTasksCount > 0) {
            toast({
              title: "Attention Required (Demo Data)",
              description: `You have ${overdueTasksCount} overdue ${overdueTasksCount === 1 ? "task" : "tasks"} that require attention.`,
              variant: "warning",
            });
          }
        }
      } catch (error) {
        console.error("Error fetching tasks:", error);
        toast({
          title: "Error",
          description: "Failed to load tasks. Using demo data instead.",
          variant: "warning",
        });

        // Use mock data in case of error
        const mockTasks = generateMockTasks(projectId);
        setTasks(mockTasks);
      } finally {
        setIsLoading(false);
      }
    };

    // Helper function to generate mock tasks
    const generateMockTasks = (projectId?: number): ProjectTask[] => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);

      return [
        {
          taskId: 1,
          projectId: projectId || 1,
          taskName: "Install bathroom grab bars",
          description: "Install ADA compliant grab bars in the main bathroom",
          startDate: yesterday,
          dueDate: tomorrow,
          completionDate: undefined,
          assignedToId: 2,
          statusId: 2, // In Progress
          priorityLevel: 1, // High
          estimatedHours: 4,
          actualHours: undefined,
          dependsOnTaskId: undefined,
          createdBy: 1,
          createdDate: yesterday,
          lastModifiedBy: 1,
          lastModifiedDate: yesterday,
          isActive: true,
        },
        {
          taskId: 2,
          projectId: projectId || 1,
          taskName: "Install shower seat",
          description: "Install fold-down shower seat in the main bathroom",
          startDate: yesterday,
          dueDate: yesterday, // Overdue
          completionDate: undefined,
          assignedToId: 3,
          statusId: 1, // Pending
          priorityLevel: 1, // High
          estimatedHours: 3,
          actualHours: undefined,
          dependsOnTaskId: 1,
          createdBy: 1,
          createdDate: yesterday,
          lastModifiedBy: undefined,
          lastModifiedDate: undefined,
          isActive: true,
        },
        {
          taskId: 3,
          projectId: projectId || 1,
          taskName: "Install non-slip flooring",
          description: "Replace bathroom floor with non-slip tiles",
          startDate: tomorrow,
          dueDate: nextWeek,
          completionDate: undefined,
          assignedToId: 4,
          statusId: 1, // Pending
          priorityLevel: 2, // Medium
          estimatedHours: 8,
          actualHours: undefined,
          dependsOnTaskId: undefined,
          createdBy: 1,
          createdDate: yesterday,
          lastModifiedBy: undefined,
          lastModifiedDate: undefined,
          isActive: true,
        },
        {
          taskId: 4,
          projectId: projectId || 1,
          taskName: "Final inspection",
          description: "Conduct final inspection of all bathroom modifications",
          startDate: nextWeek,
          dueDate: new Date(nextWeek.getTime() + 2 * 24 * 60 * 60 * 1000),
          completionDate: undefined,
          assignedToId: 1,
          statusId: 1, // Pending
          priorityLevel: 2, // Medium
          estimatedHours: 2,
          actualHours: undefined,
          dependsOnTaskId: 3,
          createdBy: 1,
          createdDate: yesterday,
          lastModifiedBy: undefined,
          lastModifiedDate: undefined,
          isActive: true,
        },
      ];
    };

    fetchTasks();
  }, [projectId, toast]);

  const handleCreateTask = () => {
    setSelectedTask(null);
    setIsCreateTaskDialogOpen(true);
  };

  const handleEditTask = (task: ProjectTask) => {
    setSelectedTask(task);
    setIsCreateTaskDialogOpen(true);
  };

  const handleSaveTask = async (taskData: any) => {
    try {
      setIsLoading(true);
      let response;

      if (selectedTask) {
        response = await projectApi.updateProjectTask(
          selectedTask.taskId,
          taskData,
          "en",
        );
      } else {
        response = await projectApi.createProjectTask(taskData, "en");
      }

      // Check if we have a valid response from the API
      const isSuccessful = response?.success && response?.data;

      if (isSuccessful) {
        // Show success message for successful API call
        toast({
          title: selectedTask ? "Task Updated" : "Task Created",
          description: selectedTask
            ? `Task "${taskData.taskName}" has been updated successfully.`
            : `Task "${taskData.taskName}" has been created successfully.`,
        });

        // Refresh tasks list from API
        await refreshTasksList();
        setIsCreateTaskDialogOpen(false);
      } else {
        // API call failed, use mock data for demonstration
        console.warn("API call failed, using mock data for demonstration");

        // Show success message with demo indication
        toast({
          title: selectedTask
            ? "Task Updated (Demo Mode)"
            : "Task Created (Demo Mode)",
          description: selectedTask
            ? `Task "${taskData.taskName}" has been updated successfully (using mock data).`
            : `Task "${taskData.taskName}" has been created successfully (using mock data).`,
        });

        // Update tasks list with mock data
        updateTasksWithMockData(taskData, selectedTask);
        setIsCreateTaskDialogOpen(false);
      }
    } catch (error) {
      console.error("Error saving task:", error);
      toast({
        title: "Error",
        description:
          "An error occurred. Using demo mode to demonstrate functionality.",
        variant: "warning",
      });

      // Even in case of error, update with mock data to demonstrate functionality
      updateTasksWithMockData(taskData, selectedTask);
      setIsCreateTaskDialogOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to refresh tasks list from API
  const refreshTasksList = async () => {
    try {
      const updatedTasksResponse = projectId
        ? await projectApi.getProjectTasks(projectId, {
            page: 1,
            pageSize: 50,
            language: "en",
          })
        : await projectApi.getAllProjectTasks({
            page: 1,
            pageSize: 50,
            language: "en",
          });

      if (updatedTasksResponse?.success && updatedTasksResponse?.data?.items) {
        setTasks(updatedTasksResponse.data.items);
      } else {
        // If API fails to return updated tasks, use mock data
        console.warn("Failed to refresh tasks from API, using existing data");
      }
    } catch (error) {
      console.error("Error refreshing tasks list:", error);
    }
  };

  // Helper function to update tasks with mock data
  const updateTasksWithMockData = (
    taskData: any,
    selectedTask: ProjectTask | null,
  ) => {
    if (selectedTask) {
      // Update existing task
      setTasks(
        tasks.map((task) =>
          task.taskId === selectedTask.taskId
            ? {
                ...task,
                ...taskData,
                lastModifiedDate: new Date(),
                lastModifiedBy: 1,
              }
            : task,
        ),
      );
    } else {
      // Create new task with mock ID
      const newTaskId = Math.max(...tasks.map((t) => t.taskId), 0) + 1;
      const newTask: ProjectTask = {
        taskId: newTaskId,
        projectId: taskData.projectId,
        taskName: taskData.taskName,
        description: taskData.description || "",
        startDate: taskData.startDate,
        dueDate: taskData.dueDate,
        completionDate: undefined,
        assignedToId: taskData.assignedToId,
        statusId: taskData.statusId,
        priorityLevel: taskData.priorityLevel || 2,
        estimatedHours: taskData.estimatedHours,
        actualHours: undefined,
        dependsOnTaskId: taskData.dependsOnTaskId,
        createdBy: 1,
        createdDate: new Date(),
        lastModifiedBy: undefined,
        lastModifiedDate: undefined,
        isActive: true,
      };

      setTasks([...tasks, newTask]);
    }
  };

  const handleCompleteTask = async (taskId: number) => {
    try {
      setIsLoading(true);
      const response = await projectApi.completeProjectTask(
        taskId,
        undefined,
        "en",
      );

      // Check if API call was successful
      const isSuccessful = response?.success;

      if (isSuccessful) {
        // Update the task in the local state
        updateCompletedTaskInState(taskId);
        showTaskCompletionToast(taskId);
      } else {
        // API call failed, use mock data for demonstration
        console.warn("API call failed, using mock data for demonstration");

        // Update the task in the local state anyway for demo purposes
        updateCompletedTaskInState(taskId);
        showTaskCompletionToast(taskId, true); // true indicates demo mode
      }
    } catch (error) {
      console.error("Error completing task:", error);
      toast({
        title: "Error",
        description:
          "An error occurred. Using demo mode to demonstrate functionality.",
        variant: "warning",
      });

      // Even in case of error, update the task in the local state for demo purposes
      updateCompletedTaskInState(taskId);
      showTaskCompletionToast(taskId, true); // true indicates demo mode
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to update completed task in state
  const updateCompletedTaskInState = (taskId: number) => {
    setTasks(
      tasks.map((task) =>
        task.taskId === taskId
          ? { ...task, completionDate: new Date(), statusId: 3 }
          : task,
      ),
    );
  };

  // Helper function to show task completion toast
  const showTaskCompletionToast = (
    taskId: number,
    isDemoMode: boolean = false,
  ) => {
    const completedTask = tasks.find((task) => task.taskId === taskId);
    if (completedTask) {
      toast({
        title: isDemoMode ? "Task Completed (Demo Mode)" : "Task Completed",
        description: `Task "${completedTask.taskName}" has been marked as complete.`,
      });
    }
  };

  const getStatusBadge = (statusId: number) => {
    switch (statusId) {
      case 3: // Completed
        return <Badge className="bg-green-500">Completed</Badge>;
      case 2: // In Progress
        return <Badge className="bg-blue-500">In Progress</Badge>;
      case 1: // Pending
      default:
        return <Badge className="bg-yellow-500">Pending</Badge>;
    }
  };

  const getPriorityBadge = (priorityLevel: number) => {
    switch (priorityLevel) {
      case 1: // High
        return <Badge className="bg-red-500">High</Badge>;
      case 2: // Medium
        return <Badge className="bg-yellow-500">Medium</Badge>;
      case 3: // Low
      default:
        return <Badge className="bg-green-500">Low</Badge>;
    }
  };

  const isTaskOverdue = (task: ProjectTask) => {
    if (task.completionDate) return false;
    return new Date() > new Date(task.dueDate);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${directionClass}`}>
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">
          {projectId
            ? t("project.projectTasks", "Project Tasks")
            : t("project.allTasks", "All Tasks")}
        </h2>
        <Button onClick={handleCreateTask}>
          <Plus className="mr-2 h-4 w-4" />
          {t("project.addTask", "Add Task")}
        </Button>
      </div>

      {tasks.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10">
            <p className="text-muted-foreground">
              {t("project.noTasks", "No tasks available.")}
            </p>
            <Button className="mt-4" onClick={handleCreateTask}>
              <Plus className="mr-2 h-4 w-4" />
              {t("project.createFirstTask", "Create your first task")}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => (
            <Card
              key={task.taskId}
              className={isTaskOverdue(task) ? "border-red-300" : ""}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={!!task.completionDate}
                      onCheckedChange={() => {
                        if (!task.completionDate) {
                          handleCompleteTask(task.taskId);
                        }
                      }}
                    />
                    <div>
                      <CardTitle
                        className={`text-lg ${task.completionDate ? "line-through text-muted-foreground" : ""}`}
                      >
                        {task.taskName}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {task.description ||
                          t("project.noDescription", "No description")}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {getPriorityBadge(task.priorityLevel)}
                    {getStatusBadge(task.statusId)}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {t("project.dueDate", "Due")}:
                    </span>
                    <span
                      className={
                        isTaskOverdue(task) ? "text-red-500 font-medium" : ""
                      }
                    >
                      {new Date(task.dueDate).toLocaleDateString()}
                      {isTaskOverdue(task) &&
                        ` (${t("project.overdue", "Overdue")})`}
                    </span>
                  </div>

                  {task.estimatedHours && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {t("project.estimatedHours", "Est")}:
                      </span>
                      <span>
                        {task.estimatedHours} {t("project.hours", "hrs")}
                      </span>
                    </div>
                  )}

                  {task.assignedToId && (
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {t("project.assignedTo", "Assigned")}:
                      </span>
                      <span>User {task.assignedToId}</span>
                    </div>
                  )}

                  {task.dependsOnTaskId && (
                    <div className="flex items-center gap-1">
                      <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {t("project.dependsOn", "Depends on")}:
                      </span>
                      <span>Task {task.dependsOnTaskId}</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditTask(task)}
                  >
                    {t("project.editTask", "Edit")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Task Dialog */}
      <Dialog
        open={isCreateTaskDialogOpen}
        onOpenChange={setIsCreateTaskDialogOpen}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedTask
                ? t("project.editTask", "Edit Task")
                : t("project.createTask", "Create Task")}
            </DialogTitle>
          </DialogHeader>
          <TaskForm
            task={selectedTask}
            projectId={projectId}
            onSave={handleSaveTask}
            onCancel={() => setIsCreateTaskDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TaskManagement;
