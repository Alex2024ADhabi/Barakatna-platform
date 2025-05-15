import React from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { useTranslatedDirection } from "@/hooks/useTranslatedDirection";
import {
  Check,
  Clock,
  AlertTriangle,
  ChevronRight,
  AlertCircle,
} from "lucide-react";
import { ClientType } from "@/lib/forms/types";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Progress } from "@/components/ui/progress";

interface WorkflowStage {
  stageId: number;
  stageCode: string;
  stageName: string;
  sequenceNumber: number;
  isCompleted: boolean;
  isActive: boolean;
  startDate: Date | null;
  completionDate: Date | null;
  assignedTo: string | null;
  estimatedDuration: number; // in hours
  expectedCompletionDate?: Date | null;
  actualDuration?: number; // in hours
  isDelayed?: boolean;
  delayReason?: string;
  clientSpecific?: boolean;
  clientTypes?: ClientType[];
}

interface WorkflowStatusTrackerProps {
  stages: WorkflowStage[];
  currentStageId: number;
  entityType: string;
  entityName: string;
  clientType?: ClientType;
  totalProgress?: number; // 0-100
  estimatedCompletionDate?: Date | null;
  slaTarget?: Date | null;
  hasBottlenecks?: boolean;
  bottleneckStageIds?: number[];
}

export const WorkflowStatusTracker: React.FC<WorkflowStatusTrackerProps> = ({
  stages,
  currentStageId,
  entityType,
  entityName,
  clientType,
  totalProgress = 0,
  estimatedCompletionDate = null,
  slaTarget = null,
  hasBottlenecks = false,
  bottleneckStageIds = [],
}) => {
  const { t } = useTranslation();
  const { directionClass, isRTL } = useTranslatedDirection();

  // Filter stages by client type if specified and sort by sequence number
  const filteredStages = clientType
    ? stages.filter(
        (stage) =>
          !stage.clientSpecific ||
          !stage.clientTypes ||
          stage.clientTypes.includes(clientType),
      )
    : stages;

  // Sort stages by sequence number
  const sortedStages = [...(filteredStages || [])].sort(
    (a, b) => a.sequenceNumber - b.sequenceNumber,
  );

  // Calculate progress if not provided
  const calculatedProgress =
    totalProgress > 0
      ? totalProgress
      : Math.round(
          (sortedStages.filter((stage) => stage.isCompleted).length /
            sortedStages.length) *
            100,
        );

  const formatDate = (date: Date | null) => {
    if (!date) return "--";
    return new Date(date).toLocaleDateString();
  };

  const getStageStatusIcon = (stage: WorkflowStage) => {
    if (stage.isCompleted) {
      return <Check className="h-5 w-5 text-green-500" />;
    }
    if (stage.isActive) {
      if (stage.isDelayed) {
        return <AlertCircle className="h-5 w-5 text-amber-500 animate-pulse" />;
      }
      return <Clock className="h-5 w-5 text-blue-500" />;
    }
    if (bottleneckStageIds.includes(stage.stageId)) {
      return <AlertTriangle className="h-5 w-5 text-red-500" />;
    }
    return <div className="h-5 w-5 rounded-full border-2 border-gray-300" />;
  };

  const getStageStatusClass = (stage: WorkflowStage) => {
    if (stage.isCompleted) {
      return "border-green-500 bg-green-50";
    }
    if (stage.isActive) {
      if (stage.isDelayed) {
        return "border-amber-500 bg-amber-50";
      }
      return "border-blue-500 bg-blue-50";
    }
    if (bottleneckStageIds.includes(stage.stageId)) {
      return "border-red-500 bg-red-50";
    }
    return "border-gray-200";
  };

  // Calculate time remaining and SLA status
  const now = new Date();
  const isOverdue = slaTarget && now > slaTarget;
  const timeToSla = slaTarget
    ? Math.ceil((slaTarget.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    : null;
  const timeToCompletion = estimatedCompletionDate
    ? Math.ceil(
        (estimatedCompletionDate.getTime() - now.getTime()) /
          (1000 * 60 * 60 * 24),
      )
    : null;

  const getConnectorClass = (index: number) => {
    const prevStage = sortedStages[index - 1];
    if (prevStage?.isCompleted) {
      return "bg-green-500";
    }
    return "bg-gray-200";
  };

  return (
    <Card className={directionClass}>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">
              {t("Workflow Status")}: {entityName}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {t("Type")}: {entityType} {clientType && `(${clientType})`}
            </p>
          </div>
          {slaTarget && (
            <div className="text-right">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isOverdue ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"}`}
              >
                {isOverdue
                  ? t("Overdue")
                  : t("Due in {{days}} days", { days: timeToSla })}
              </span>
              <p className="text-xs text-muted-foreground mt-1">
                {t("Target")}: {slaTarget.toLocaleDateString()}
              </p>
            </div>
          )}
        </div>
        <div className="mt-4">
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium">
              {t("Progress")}: {calculatedProgress}%
            </span>
            {estimatedCompletionDate && (
              <span className="text-sm text-muted-foreground">
                {t("Est. completion")}:{" "}
                {estimatedCompletionDate.toLocaleDateString()}
                {timeToCompletion !== null &&
                  ` (${timeToCompletion} ${t("days")})`}
              </span>
            )}
          </div>
          <Progress value={calculatedProgress} className="h-2" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Horizontal timeline for larger screens */}
          <div className="hidden md:flex items-center justify-between">
            {sortedStages.map((stage, index) => (
              <React.Fragment key={stage.stageId}>
                <div className="flex flex-col items-center">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${getStageStatusClass(
                            stage,
                          )}`}
                        >
                          {getStageStatusIcon(stage)}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="text-sm">
                          <p className="font-medium">{stage.stageName}</p>
                          {stage.isDelayed && (
                            <p className="text-amber-600">
                              {t("Delayed")}:{" "}
                              {stage.delayReason || t("Unknown reason")}
                            </p>
                          )}
                          {bottleneckStageIds.includes(stage.stageId) && (
                            <p className="text-red-600">
                              {t("Potential bottleneck")}
                            </p>
                          )}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <p className="mt-2 text-sm font-medium text-center">
                    {stage.stageName}
                  </p>
                  {stage.isActive && (
                    <Badge className="mt-1 bg-blue-500">{t("Current")}</Badge>
                  )}
                </div>
                {index < sortedStages.length - 1 && (
                  <div
                    className={`flex-1 h-1 ${getConnectorClass(index + 1)}`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Vertical timeline for mobile */}
          <div className="md:hidden space-y-4">
            {sortedStages.map((stage, index) => (
              <div
                key={stage.stageId}
                className={`p-3 border rounded-lg ${getStageStatusClass(
                  stage,
                )}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${getStageStatusClass(
                              stage,
                            )}`}
                          >
                            {getStageStatusIcon(stage)}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <div className="text-sm">
                            <p className="font-medium">{stage.stageName}</p>
                            {stage.isDelayed && (
                              <p className="text-amber-600">
                                {t("Delayed")}:{" "}
                                {stage.delayReason || t("Unknown reason")}
                              </p>
                            )}
                            {bottleneckStageIds.includes(stage.stageId) && (
                              <p className="text-red-600">
                                {t("Potential bottleneck")}
                              </p>
                            )}
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <div>
                      <p className="font-medium">{stage.stageName}</p>
                      {stage.assignedTo && (
                        <p className="text-xs text-muted-foreground">
                          {t("Assigned to")}: {stage.assignedTo}
                        </p>
                      )}
                    </div>
                  </div>
                  {stage.isActive && (
                    <Badge className="bg-blue-500">{t("Current")}</Badge>
                  )}
                </div>
                {(stage.startDate || stage.completionDate) && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    {stage.startDate && (
                      <p>
                        {t("Started")}: {formatDate(stage.startDate)}
                      </p>
                    )}
                    {stage.completionDate && (
                      <p>
                        {t("Completed")}: {formatDate(stage.completionDate)}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Stage details */}
          <div className="mt-6 space-y-4">
            <h3 className="text-lg font-medium">
              {t("Current Stage Details")}
            </h3>
            {sortedStages
              .filter((stage) => stage.isActive)
              .map((stage) => (
                <div key={stage.stageId} className="space-y-2">
                  <div className="flex justify-between">
                    <p className="text-sm text-muted-foreground">
                      {t("Stage")}:
                    </p>
                    <p className="font-medium">{stage.stageName}</p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-sm text-muted-foreground">
                      {t("Started")}:
                    </p>
                    <p>{formatDate(stage.startDate)}</p>
                  </div>
                  {stage.assignedTo && (
                    <div className="flex justify-between">
                      <p className="text-sm text-muted-foreground">
                        {t("Assigned To")}:
                      </p>
                      <p>{stage.assignedTo}</p>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <p className="text-sm text-muted-foreground">
                      {t("Estimated Duration")}:
                    </p>
                    <p>
                      {stage.estimatedDuration}{" "}
                      {stage.estimatedDuration === 1 ? t("hour") : t("hours")}
                    </p>
                  </div>
                  {stage.actualDuration !== undefined && (
                    <div className="flex justify-between">
                      <p className="text-sm text-muted-foreground">
                        {t("Actual Duration")}:
                      </p>
                      <p
                        className={
                          stage.actualDuration > stage.estimatedDuration
                            ? "text-amber-600"
                            : "text-green-600"
                        }
                      >
                        {stage.actualDuration}{" "}
                        {stage.actualDuration === 1 ? t("hour") : t("hours")}
                      </p>
                    </div>
                  )}
                  {stage.expectedCompletionDate && (
                    <div className="flex justify-between">
                      <p className="text-sm text-muted-foreground">
                        {t("Expected Completion")}:
                      </p>
                      <p>{stage.expectedCompletionDate.toLocaleDateString()}</p>
                    </div>
                  )}
                  {stage.isDelayed && (
                    <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-md">
                      <p className="text-sm text-amber-700">
                        <AlertTriangle className="inline-block h-4 w-4 mr-1" />
                        {t("Delayed")}:{" "}
                        {stage.delayReason ||
                          t("Processing taking longer than expected")}
                      </p>
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkflowStatusTracker;
