import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useTranslatedDirection } from "@/hooks/useTranslatedDirection";
import { beneficiaryService } from "@/services/beneficiaryService";
import { beneficiaryApi } from "@/lib/api/beneficiary/beneficiaryApi";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Home,
  Tool,
  ClipboardCheck,
  CheckCheck,
  Calendar,
  ArrowRight,
} from "lucide-react";

interface BeneficiaryStatusTrackerProps {
  beneficiaryId: string;
}

interface StatusStep {
  id: number;
  name: string;
  description: string;
  date: Date | null;
  status: "completed" | "current" | "pending" | "skipped";
  icon: React.ReactNode;
  details?: string;
}

export const BeneficiaryStatusTracker: React.FC<
  BeneficiaryStatusTrackerProps
> = ({ beneficiaryId }) => {
  const { t } = useTranslation();
  const { directionClass } = useTranslatedDirection();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [statusSteps, setStatusSteps] = useState<StatusStep[]>([]);

  useEffect(() => {
    const fetchBeneficiaryStatus = async () => {
      setLoading(true);
      setError(null);
      try {
        // In a real implementation, this would be an API call
        // For now, we'll use mock data
        setTimeout(() => {
          const mockStatusSteps: StatusStep[] = [
            {
              id: 1,
              name: t("beneficiary.statusSteps.registration"),
              description: t("beneficiary.statusSteps.registrationDesc"),
              date: new Date(2023, 0, 15),
              status: "completed",
              icon: <FileText className="h-6 w-6 text-green-600" />,
              details: t("beneficiary.statusSteps.registrationDetails"),
            },
            {
              id: 2,
              name: t("beneficiary.statusSteps.initialAssessment"),
              description: t("beneficiary.statusSteps.initialAssessmentDesc"),
              date: new Date(2023, 0, 20),
              status: "completed",
              icon: <Home className="h-6 w-6 text-green-600" />,
              details: t("beneficiary.statusSteps.initialAssessmentDetails"),
            },
            {
              id: 3,
              name: t("beneficiary.statusSteps.committeeApproval"),
              description: t("beneficiary.statusSteps.committeeApprovalDesc"),
              date: new Date(2023, 1, 5),
              status: "completed",
              icon: <ClipboardCheck className="h-6 w-6 text-green-600" />,
              details: t("beneficiary.statusSteps.committeeApprovalDetails"),
            },
            {
              id: 4,
              name: t("beneficiary.statusSteps.projectCreation"),
              description: t("beneficiary.statusSteps.projectCreationDesc"),
              date: new Date(2023, 1, 10),
              status: "completed",
              icon: <Tool className="h-6 w-6 text-green-600" />,
              details: t("beneficiary.statusSteps.projectCreationDetails"),
            },
            {
              id: 5,
              name: t("beneficiary.statusSteps.implementation"),
              description: t("beneficiary.statusSteps.implementationDesc"),
              date: null,
              status: "current",
              icon: <Clock className="h-6 w-6 text-blue-600" />,
              details: t("beneficiary.statusSteps.implementationDetails"),
            },
            {
              id: 6,
              name: t("beneficiary.statusSteps.finalInspection"),
              description: t("beneficiary.statusSteps.finalInspectionDesc"),
              date: null,
              status: "pending",
              icon: <AlertCircle className="h-6 w-6 text-gray-400" />,
            },
            {
              id: 7,
              name: t("beneficiary.statusSteps.projectClosure"),
              description: t("beneficiary.statusSteps.projectClosureDesc"),
              date: null,
              status: "pending",
              icon: <CheckCheck className="h-6 w-6 text-gray-400" />,
            },
          ];
          setStatusSteps(mockStatusSteps);
          setLoading(false);
        }, 500);
      } catch (err) {
        console.error("Error fetching beneficiary status:", err);
        setError("An error occurred while fetching beneficiary status");
        setLoading(false);
      }
    };

    fetchBeneficiaryStatus();
  }, [beneficiaryId, t]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4">{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
        <strong className="font-bold">{t("common.error")}:</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  return (
    <div className={`${directionClass} space-y-6`}>
      <Card>
        <CardHeader>
          <CardTitle>{t("beneficiary.statusTracker")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-muted"></div>

            {/* Status Steps */}
            <div className="space-y-8">
              {statusSteps.map((step, index) => (
                <div key={step.id} className="relative">
                  <div className="flex gap-4">
                    <div
                      className={`h-12 w-12 rounded-full flex items-center justify-center z-10 ${
                        step.status === "completed"
                          ? "bg-green-100"
                          : step.status === "current"
                            ? "bg-blue-100"
                            : step.status === "skipped"
                              ? "bg-amber-100"
                              : "bg-gray-100"
                      }`}
                    >
                      {step.icon}
                    </div>
                    <div className="flex-1 pt-1">
                      <div className="flex flex-col md:flex-row md:items-center justify-between mb-1">
                        <h3 className="text-lg font-medium flex items-center gap-2">
                          {step.name}
                          {step.status === "completed" && (
                            <Badge className="bg-green-500">
                              {t("beneficiary.statusLabels.completed")}
                            </Badge>
                          )}
                          {step.status === "current" && (
                            <Badge className="bg-blue-500">
                              {t("beneficiary.statusLabels.inProgress")}
                            </Badge>
                          )}
                          {step.status === "skipped" && (
                            <Badge className="bg-amber-500">
                              {t("beneficiary.statusLabels.skipped")}
                            </Badge>
                          )}
                        </h3>
                        {step.date && (
                          <div className="text-sm text-muted-foreground flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {step.date.toLocaleDateString()}
                          </div>
                        )}
                      </div>
                      <p className="text-muted-foreground">
                        {step.description}
                      </p>
                      {step.details && step.status !== "pending" && (
                        <div className="mt-2 p-3 bg-muted/50 rounded-md text-sm">
                          {step.details}
                        </div>
                      )}
                      {step.status === "current" && (
                        <div className="mt-2">
                          <Button variant="outline" size="sm">
                            {t("beneficiary.viewDetails")}
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BeneficiaryStatusTracker;
