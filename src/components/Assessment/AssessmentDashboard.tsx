import React from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { useTranslatedDirection } from "@/hooks/useTranslatedDirection";
import { Home, User, Calendar, Clock, ArrowRight, Plus } from "lucide-react";

interface Assessment {
  assessmentId: number;
  assessmentCode: string;
  seniorCitizenId: number;
  seniorCitizenName: string;
  assessmentDate: Date;
  statusId: number;
  statusName: string;
  completionPercentage: number;
  roomCount: number;
  completedRooms: number;
  totalRecommendations: number;
  selectedRecommendations: number;
  totalEstimatedCost: number;
}

interface AssessmentDashboardProps {
  assessments: Assessment[];
  onViewAssessment: (assessmentId: number) => void;
  onCreateAssessment: () => void;
}

export const AssessmentDashboard: React.FC<AssessmentDashboardProps> = ({
  assessments = [],
  onViewAssessment,
  onCreateAssessment,
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

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
  };

  const pendingAssessments = assessments.filter(
    (a) =>
      a.statusName.toLowerCase() === "pending" ||
      a.statusName.toLowerCase() === "in progress",
  );

  const completedAssessments = assessments.filter(
    (a) => a.statusName.toLowerCase() === "completed",
  );

  return (
    <div className={`space-y-6 ${directionClass}`}>
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{t("Assessment Dashboard")}</h1>
        <Button onClick={onCreateAssessment}>
          <Plus className="mr-2 h-4 w-4" /> {t("New Assessment")}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {t("Total Assessments")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{assessments.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {t("Pending Assessments")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {pendingAssessments.length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {t("Completed Assessments")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {completedAssessments.length}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pending">
        <TabsList className="mb-4">
          <TabsTrigger value="pending">{t("Pending")}</TabsTrigger>
          <TabsTrigger value="completed">{t("Completed")}</TabsTrigger>
          <TabsTrigger value="all">{t("All")}</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingAssessments.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                {t("No pending assessments found.")}
              </CardContent>
            </Card>
          ) : (
            pendingAssessments.map((assessment) => (
              <AssessmentCard
                key={assessment.assessmentId}
                assessment={assessment}
                onViewAssessment={onViewAssessment}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedAssessments.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                {t("No completed assessments found.")}
              </CardContent>
            </Card>
          ) : (
            completedAssessments.map((assessment) => (
              <AssessmentCard
                key={assessment.assessmentId}
                assessment={assessment}
                onViewAssessment={onViewAssessment}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          {assessments.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">
                {t("No assessments found.")}
              </CardContent>
            </Card>
          ) : (
            assessments.map((assessment) => (
              <AssessmentCard
                key={assessment.assessmentId}
                assessment={assessment}
                onViewAssessment={onViewAssessment}
              />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

const AssessmentCard: React.FC<{
  assessment: Assessment;
  onViewAssessment: (assessmentId: number) => void;
}> = ({ assessment, onViewAssessment }) => {
  const { t } = useTranslation();

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

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">{assessment.assessmentCode}</h3>
              <Badge className={getStatusColor(assessment.statusName)}>
                {assessment.statusName}
              </Badge>
            </div>
            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span>{assessment.seniorCitizenName}</span>
            </div>
            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(assessment.assessmentDate)}</span>
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewAssessment(assessment.assessmentId)}
          >
            {t("View")} <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        <div className="mt-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm">{t("Completion")}:</span>
            <span className="text-sm">{assessment.completionPercentage}%</span>
          </div>
          <Progress value={assessment.completionPercentage} />
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div>
            <div className="text-sm text-muted-foreground">
              {t("Rooms Completed")}
            </div>
            <div className="font-medium">
              {assessment.completedRooms} / {assessment.roomCount}
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">
              {t("Estimated Cost")}
            </div>
            <div className="font-medium">
              {assessment.totalEstimatedCost.toLocaleString("en-US", {
                style: "currency",
                currency: "SAR",
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AssessmentDashboard;
