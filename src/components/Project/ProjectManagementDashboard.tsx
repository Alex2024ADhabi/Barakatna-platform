import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  Plus,
  Calendar,
  ClipboardList,
  Users,
  BarChart3,
  DollarSign,
  Clock,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Target,
} from "lucide-react";
import { projectApi } from "@/lib/api/project/projectApi";
import { Project, ProjectTask } from "@/lib/api/project/types";
import { useTranslatedDirection } from "@/hooks/useTranslatedDirection";
import ProjectList from "./ProjectList";
import ProjectCard from "./ProjectCard";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import ProjectForm from "./ProjectForm";
import TaskManagement from "./TaskManagement";

const ProjectManagementDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { directionClass } = useTranslatedDirection();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isCreateProjectDialogOpen, setIsCreateProjectDialogOpen] =
    useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<ProjectTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const projectsResponse = await projectApi.getProjects({
          page: 1,
          pageSize: 10,
          language: "en",
        });

        if (projectsResponse.success && projectsResponse.data) {
          setProjects(projectsResponse.data.items || []);
        }

        const tasksResponse = await projectApi.getAllProjectTasks({
          page: 1,
          pageSize: 10,
          language: "en",
        });

        if (tasksResponse.success && tasksResponse.data) {
          setTasks(tasksResponse.data.items || []);
        }
      } catch (error) {
        console.error("Error fetching project data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAddAction = () => {
    switch (activeTab) {
      case "projects":
        setIsCreateProjectDialogOpen(true);
        break;
      case "tasks":
        // Open task dialog
        break;
      case "resources":
        // Open resource dialog
        break;
      case "documents":
        // Open document dialog
        break;
    }
  };

  const handleViewProject = (projectId: number) => {
    const project = projects.find((p) => p.projectId === projectId);
    if (project) {
      setSelectedProject(project);
      setActiveTab("project-detail");
    }
  };

  const handleSaveProject = async (projectData: any) => {
    try {
      setIsLoading(true);
      const response = await projectApi.createProject(projectData, "en");

      if (response.success && response.data) {
        setProjects([...projects, response.data]);
        setIsCreateProjectDialogOpen(false);
      }
    } catch (error) {
      console.error("Error creating project:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Mock data for analytics
  const projectAnalytics = {
    totalProjects: projects.length,
    completedProjects: projects.filter((p) => p.statusId === 3).length,
    inProgressProjects: projects.filter((p) => p.statusId === 2).length,
    pendingProjects: projects.filter((p) => p.statusId === 1).length,
    totalBudget: projects.reduce(
      (sum, project) => sum + project.totalBudget,
      0,
    ),
    approvedBudget: projects.reduce(
      (sum, project) => sum + (project.approvedBudget || 0),
      0,
    ),
    actualCost: projects.reduce(
      (sum, project) => sum + (project.actualCost || 0),
      0,
    ),
    overdueTasks: tasks.filter((task) => {
      return !task.completionDate && new Date() > new Date(task.dueDate);
    }).length,
    completedTasks: tasks.filter((task) => task.completionDate).length,
    pendingTasks: tasks.filter((task) => !task.completionDate).length,
  };

  return (
    <div className="space-y-6">
      <Card className={directionClass}>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{t("project.title", "Project Management")}</CardTitle>
            <CardDescription>
              {t(
                "project.description",
                "Manage projects, tasks, resources, and track progress",
              )}
            </CardDescription>
          </div>
          {activeTab !== "dashboard" && activeTab !== "project-detail" && (
            <Button onClick={handleAddAction}>
              <Plus className="mr-2 h-4 w-4" />
              {activeTab === "projects"
                ? t("project.createProject", "Create Project")
                : activeTab === "tasks"
                  ? t("project.createTask", "Create Task")
                  : activeTab === "resources"
                    ? t("project.addResource", "Add Resource")
                    : t("project.addDocument", "Add Document")}
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="dashboard">
                <BarChart3 className="h-4 w-4 mr-2" />
                {t("project.dashboard", "Dashboard")}
              </TabsTrigger>
              <TabsTrigger value="projects">
                <ClipboardList className="h-4 w-4 mr-2" />
                {t("project.projects", "Projects")}
              </TabsTrigger>
              <TabsTrigger value="tasks">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                {t("project.tasks", "Tasks")}
              </TabsTrigger>
              <TabsTrigger value="resources">
                <Users className="h-4 w-4 mr-2" />
                {t("project.resources", "Resources")}
              </TabsTrigger>
              <TabsTrigger value="timeline">
                <Calendar className="h-4 w-4 mr-2" />
                {t("project.timeline", "Timeline")}
              </TabsTrigger>
              <TabsTrigger value="documents">
                <FileText className="h-4 w-4 mr-2" />
                {t("project.documents", "Documents")}
              </TabsTrigger>
            </TabsList>

            {/* Dashboard Tab */}
            <TabsContent value="dashboard" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">
                      {t("project.totalProjects", "Total Projects")}
                    </CardTitle>
                    <ClipboardList className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {projectAnalytics.totalProjects}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {t("project.activeProjects", "Active projects")}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">
                      {t("project.pendingTasks", "Pending Tasks")}
                    </CardTitle>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {projectAnalytics.pendingTasks}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {t(
                        "project.tasksAwaitingCompletion",
                        "Tasks awaiting completion",
                      )}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">
                      {t("project.overdueTasks", "Overdue Tasks")}
                    </CardTitle>
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {projectAnalytics.overdueTasks}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {t("project.tasksPassedDueDate", "Tasks passed due date")}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">
                      {t("project.budgetUtilization", "Budget Utilization")}
                    </CardTitle>
                    <DollarSign className="h-4 w-4 text-green-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {projectAnalytics.actualCost > 0 &&
                      projectAnalytics.approvedBudget > 0
                        ? Math.round(
                            (projectAnalytics.actualCost /
                              projectAnalytics.approvedBudget) *
                              100,
                          )
                        : 0}
                      %
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {t("project.budgetUsed", "Budget used")}
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {t("project.projectsByStatus", "Projects by Status")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-sm">
                          {t("project.completed", "Completed")}
                        </span>
                        <span className="font-medium">
                          {projectAnalytics.completedProjects}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">
                          {t("project.inProgress", "In Progress")}
                        </span>
                        <span className="font-medium">
                          {projectAnalytics.inProgressProjects}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">
                          {t("project.pending", "Pending")}
                        </span>
                        <span className="font-medium">
                          {projectAnalytics.pendingProjects}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>
                      {t("project.recentProjects", "Recent Projects")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {projects.slice(0, 3).map((project) => (
                        <div
                          key={project.projectId}
                          className="flex justify-between items-center"
                        >
                          <div>
                            <p className="font-medium">{project.projectName}</p>
                            <p className="text-sm text-muted-foreground">
                              {project.projectCode}
                            </p>
                          </div>
                          <Badge
                            variant="outline"
                            className={`${
                              project.statusId === 3
                                ? "bg-green-100 text-green-800"
                                : project.statusId === 2
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {project.statusId === 3
                              ? "Completed"
                              : project.statusId === 2
                                ? "In Progress"
                                : "Pending"}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Projects Tab */}
            <TabsContent value="projects" className="mt-6">
              <ProjectList
                projects={projects}
                onViewProject={handleViewProject}
                isLoading={isLoading}
              />
            </TabsContent>

            {/* Project Detail Tab */}
            <TabsContent value="project-detail" className="mt-6">
              {selectedProject && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold">
                      {selectedProject.projectName}
                    </h2>
                    <Button
                      variant="outline"
                      onClick={() => setActiveTab("projects")}
                    >
                      Back to Projects
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>
                          {t("project.details", "Project Details")}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div>
                            <span className="text-sm text-muted-foreground">
                              {t("project.code", "Code")}:
                            </span>
                            <span className="ml-2">
                              {selectedProject.projectCode}
                            </span>
                          </div>
                          <div>
                            <span className="text-sm text-muted-foreground">
                              {t("project.startDate", "Start Date")}:
                            </span>
                            <span className="ml-2">
                              {selectedProject.startDate
                                ? new Date(
                                    selectedProject.startDate,
                                  ).toLocaleDateString()
                                : "--"}
                            </span>
                          </div>
                          <div>
                            <span className="text-sm text-muted-foreground">
                              {t("project.targetDate", "Target Date")}:
                            </span>
                            <span className="ml-2">
                              {new Date(
                                selectedProject.targetCompletionDate,
                              ).toLocaleDateString()}
                            </span>
                          </div>
                          <div>
                            <span className="text-sm text-muted-foreground">
                              {t("project.budget", "Budget")}:
                            </span>
                            <span className="ml-2">
                              {selectedProject.totalBudget.toLocaleString()} SAR
                            </span>
                          </div>
                          <div>
                            <span className="text-sm text-muted-foreground">
                              {t("project.description", "Description")}:
                            </span>
                            <p className="mt-1">
                              {selectedProject.description ||
                                "No description available."}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>{t("project.tasks", "Tasks")}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <TaskManagement projectId={selectedProject.projectId} />
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>
                          {t("project.milestones", "Milestones")}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center text-white mr-3">
                              <CheckCircle2 className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="font-medium">Project Initiation</p>
                              <p className="text-sm text-muted-foreground">
                                Completed
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white mr-3">
                              <Target className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="font-medium">Assessment Complete</p>
                              <p className="text-sm text-muted-foreground">
                                In Progress
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center text-white mr-3">
                              <Target className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="font-medium">Implementation</p>
                              <p className="text-sm text-muted-foreground">
                                Not Started
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center text-white mr-3">
                              <Target className="h-4 w-4" />
                            </div>
                            <div>
                              <p className="font-medium">Project Completion</p>
                              <p className="text-sm text-muted-foreground">
                                Not Started
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Tasks Tab */}
            <TabsContent value="tasks" className="mt-6">
              <TaskManagement />
            </TabsContent>

            {/* Resources Tab */}
            <TabsContent value="resources" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {t("project.resourceAllocation", "Resource Allocation")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {t(
                      "project.resourceAllocationDescription",
                      "Manage and allocate resources for your projects.",
                    )}
                  </p>
                  {/* Resource allocation component will go here */}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Timeline Tab */}
            <TabsContent value="timeline" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {t("project.projectTimeline", "Project Timeline")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {t(
                      "project.timelineDescription",
                      "View and manage project timelines and schedules.",
                    )}
                  </p>
                  {/* Timeline visualization component will go here */}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Documents Tab */}
            <TabsContent value="documents" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>
                    {t("project.projectDocuments", "Project Documents")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {t(
                      "project.documentsDescription",
                      "Manage and store project-related documents.",
                    )}
                  </p>
                  {/* Document management component will go here */}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Create Project Dialog */}
      <Dialog
        open={isCreateProjectDialogOpen}
        onOpenChange={setIsCreateProjectDialogOpen}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {t("project.createProject", "Create Project")}
            </DialogTitle>
          </DialogHeader>
          <ProjectForm
            onSave={handleSaveProject}
            onCancel={() => setIsCreateProjectDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectManagementDashboard;
