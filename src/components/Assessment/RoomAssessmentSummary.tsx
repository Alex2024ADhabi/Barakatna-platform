import React from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { Check, AlertTriangle, Home, Ruler } from "lucide-react";
import { useTranslatedDirection } from "@/hooks/useTranslatedDirection";

interface RoomAssessmentSummaryProps {
  roomAssessment: {
    roomAssessmentId: number;
    assessmentId: number;
    roomTypeId: number;
    roomTypeCode: string;
    roomTypeName: string;
    roomName: string;
    completionStatus: boolean;
    notes: string;
    isActive: boolean;
    measurements: {
      total: number;
      compliant: number;
      nonCompliant: number;
    };
    recommendations: {
      total: number;
      selected: number;
      approved: number;
      totalCost: number;
      selectedCost: number;
    };
    photos: number;
  };
}

export const RoomAssessmentSummary: React.FC<RoomAssessmentSummaryProps> = ({
  roomAssessment,
}) => {
  const { t } = useTranslation();
  const { directionClass } = useTranslatedDirection();

  const compliancePercentage =
    roomAssessment.measurements.total > 0
      ? Math.round(
          (roomAssessment.measurements.compliant /
            roomAssessment.measurements.total) *
            100,
        )
      : 0;

  const getComplianceColor = (percentage: number) => {
    if (percentage >= 90) return "bg-green-500";
    if (percentage >= 70) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getRoomIcon = (roomTypeCode: string) => {
    // In a real application, we would have different icons for different room types
    return <Home className="h-5 w-5" />;
  };

  return (
    <Card className={`${directionClass}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            {getRoomIcon(roomAssessment.roomTypeCode)}
            <CardTitle>
              {roomAssessment.roomName} ({roomAssessment.roomTypeName})
            </CardTitle>
          </div>
          <Badge
            variant={roomAssessment.completionStatus ? "default" : "outline"}
          >
            {roomAssessment.completionStatus
              ? t("Completed")
              : t("In Progress")}
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-medium">{t("Compliance")}:</span>
              <span className="text-sm font-medium">
                {compliancePercentage}%
              </span>
            </div>
            <Progress
              value={compliancePercentage}
              className={getComplianceColor(compliancePercentage)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Ruler className="h-4 w-4" />
                <span>{t("Measurements")}:</span>
              </div>
              <p className="font-medium">
                {roomAssessment.measurements.total}{" "}
                <span className="text-sm text-muted-foreground">
                  ({roomAssessment.measurements.compliant}{" "}
                  <span className="text-green-600">
                    <Check className="inline h-3 w-3" />
                  </span>{" "}
                  / {roomAssessment.measurements.nonCompliant}{" "}
                  <span className="text-red-600">
                    <AlertTriangle className="inline h-3 w-3" />
                  </span>
                  )
                </span>
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Check className="h-4 w-4" />
                <span>{t("Recommendations")}:</span>
              </div>
              <p className="font-medium">
                {roomAssessment.recommendations.selected} /{" "}
                {roomAssessment.recommendations.total}
              </p>
            </div>
          </div>

          <div className="pt-2 border-t">
            <div className="flex justify-between items-center">
              <span className="text-sm">
                {t("Selected Modifications Cost")}:
              </span>
              <span className="font-bold">
                {roomAssessment.recommendations.selectedCost.toLocaleString(
                  "en-US",
                  {
                    style: "currency",
                    currency: "SAR",
                  },
                )}
              </span>
            </div>
          </div>

          {roomAssessment.notes && (
            <div className="pt-2 border-t">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">{t("Notes")}:</span>{" "}
                {roomAssessment.notes}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RoomAssessmentSummary;
