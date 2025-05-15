import React from "react";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";
import { useTranslatedDirection } from "@/hooks/useTranslatedDirection";
import { Calendar, Clock, User, Home, ArrowRight } from "lucide-react";

interface Project {
  projectId: number;
  projectCode: string;
  projectName: string;
  assessmentId: number;
  seniorCitizenName: string;
  statusId: number;
  statusName: string;
  startDate: Date | null;
  targetCompletionDate: Date;
  actualCompletionDate: Date | null;
  projectManagerName: string;
  totalBudget: number;
  approvedBudget: number | null;
  actualCost: number | null;
  priorityLevel: number;
  completionPercentage: number;
  taskCount: number;
  completedTasks: number;
}

interface ProjectCardProps {
  project: Project;
  onViewProject: (projectId: number) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onViewProject,
}) => {
  const { t } = useTranslation();
  const { directionClass } = useTranslatedDirection();

  const getStatusColor = (statusName: string) => {
    switch (statusName.toLowerCase()) {
      case "completed":
        return "bg-green-500";
      case "in progress":
        return "bg-blue-500";
      case "pending":
        return "bg-yellow-500";
      case "cancelled":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getPriorityLabel = (priority: number) => {
    switch (priority) {
      case 1:
        return t("High");
      case 2:
        return t("Medium");
      case 3:
        return t("Low");
      default:
        return t("Medium");
    }
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1:
        return "bg-red-500";
      case 2:
        return "bg-yellow-500";
      case 3:
        return "bg-green-500";
      default:
        return "bg-yellow-500";
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "--";
    return new Date(date).toLocaleDateString();
  };

  const isOverdue = () => {
    if (project.actualCompletionDate) return false;
    if (!project.targetCompletionDate) return false;
    return new Date() > new Date(project.targetCompletionDate);
  };

  return (
    <Card className={`${directionClass}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{project.projectName}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {project.projectCode}
            </p>
          </div>
          <div className="flex gap-2">
            <Badge className={getPriorityColor(project.priorityLevel)}>
              {getPriorityLabel(project.priorityLevel)}
            </Badge>
            <Badge className={getStatusColor(project.statusName)}>
              {project.statusName}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex flex-col space-y-1">
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">{t("Beneficiary")}:</span>
            <span>{project.seniorCitizenName}</span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              {t("Project Manager")}:
            </span>
            <span>{project.projectManagerName}</span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">{t("Target Date")}:</span>
            <span className={isOverdue() ? "text-red-500 font-medium" : ""}>
              {formatDate(project.targetCompletionDate)}
              {isOverdue() && ` (${t("Overdue")})`}
            </span>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm">{t("Progress")}:</span>
            <span className="text-sm">{project.completionPercentage}%</span>
          </div>
          <Progress value={project.completionPercentage} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-muted-foreground">
              {t("Tasks Completed")}
            </div>
            <div className="font-medium">
              {project.completedTasks} / {project.taskCount}
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">
              {t("Budget Utilization")}
            </div>
            <div className="font-medium">
              {project.actualCost?.toLocaleString("en-US", {
                style: "currency",
                currency: "SAR",
              }) || "--"}{" "}
              /{" "}
              {project.approvedBudget?.toLocaleString("en-US", {
                style: "currency",
                currency: "SAR",
              }) || "--"}
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <Button
          className="w-full"
          variant="outline"
          onClick={() => onViewProject(project.projectId)}
        >
          {t("View Project Details")}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProjectCard;
