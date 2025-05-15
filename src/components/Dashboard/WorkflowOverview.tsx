import React from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTranslatedDirection } from "@/hooks/useTranslatedDirection";
import {
  BarChart,
  Activity,
  Users,
  Home,
  ClipboardCheck,
  ShoppingCart,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  Ban,
} from "lucide-react";

interface WorkflowPhase {
  id: string;
  name: string;
  completedCases: number;
  totalCases: number;
  status: "on-track" | "at-risk" | "delayed" | "completed";
}

interface WorkflowSummary {
  totalCases: number;
  activeCases: number;
  completedCases: number;
  phases: WorkflowPhase[];
}

const mockWorkflowData: WorkflowSummary = {
  totalCases: 120,
  activeCases: 78,
  completedCases: 42,
  phases: [
    {
      id: "phase1",
      name: "Assessment",
      completedCases: 95,
      totalCases: 120,
      status: "on-track",
    },
    {
      id: "phase2",
      name: "Project Planning",
      completedCases: 68,
      totalCases: 120,
      status: "on-track",
    },
    {
      id: "phase3",
      name: "Approval Process",
      completedCases: 52,
      totalCases: 120,
      status: "at-risk",
    },
    {
      id: "phase4",
      name: "Execution",
      completedCases: 45,
      totalCases: 120,
      status: "delayed",
    },
    {
      id: "phase5",
      name: "Financial Management",
      completedCases: 42,
      totalCases: 120,
      status: "delayed",
    },
  ],
};

const getStatusIcon = (status: WorkflowPhase["status"]) => {
  switch (status) {
    case "on-track":
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    case "at-risk":
      return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    case "delayed":
      return <Clock className="h-4 w-4 text-red-500" />;
    case "completed":
      return <CheckCircle2 className="h-4 w-4 text-blue-500" />;
    default:
      return <Ban className="h-4 w-4 text-gray-500" />;
  }
};

const getStatusColor = (status: WorkflowPhase["status"]) => {
  switch (status) {
    case "on-track":
      return "bg-green-100 text-green-800";
    case "at-risk":
      return "bg-yellow-100 text-yellow-800";
    case "delayed":
      return "bg-red-100 text-red-800";
    case "completed":
      return "bg-blue-100 text-blue-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getProgressColor = (percentage: number) => {
  if (percentage >= 75) return "bg-green-500";
  if (percentage >= 50) return "bg-blue-500";
  if (percentage >= 25) return "bg-yellow-500";
  return "bg-red-500";
};

export default function WorkflowOverview() {
  const { t } = useTranslation();
  const dir = useTranslatedDirection();

  return (
    <div className="bg-white p-4 rounded-lg shadow" dir={dir}>
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <div className="flex items-center">
            <BarChart className="mr-2 h-5 w-5 text-gray-500" />
            <CardTitle>{t("Workflow Overview")}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <StatCard
              icon={<FileText className="h-8 w-8 text-blue-500" />}
              title={t("Total Cases")}
              value={mockWorkflowData.totalCases}
              footer={t("All registered cases")}
            />
            <StatCard
              icon={<Activity className="h-8 w-8 text-yellow-500" />}
              title={t("Active Cases")}
              value={mockWorkflowData.activeCases}
              footer={t("Currently in progress")}
            />
            <StatCard
              icon={<CheckCircle2 className="h-8 w-8 text-green-500" />}
              title={t("Completed Cases")}
              value={mockWorkflowData.completedCases}
              footer={t("Successfully finished")}
            />
          </div>

          <Tabs defaultValue="phases" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="phases">{t("Workflow Phases")}</TabsTrigger>
              <TabsTrigger value="summary">{t("Summary")}</TabsTrigger>
            </TabsList>
            <TabsContent value="phases" className="mt-4">
              <div className="space-y-4">
                {mockWorkflowData.phases.map((phase) => {
                  const percentage = Math.round(
                    (phase.completedCases / phase.totalCases) * 100,
                  );
                  return (
                    <div key={phase.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center">
                          <PhaseIcon phase={phase.name} />
                          <h3 className="font-medium ml-2">{t(phase.name)}</h3>
                        </div>
                        <Badge className={getStatusColor(phase.status)}>
                          <span className="flex items-center">
                            {getStatusIcon(phase.status)}
                            <span className="ml-1">
                              {t(
                                phase.status.charAt(0).toUpperCase() +
                                  phase.status.slice(1),
                              )}
                            </span>
                          </span>
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center text-sm text-gray-500 mb-1">
                        <span>{t("Progress")}</span>
                        <span>{percentage}%</span>
                      </div>
                      <Progress
                        value={percentage}
                        className={`h-2 ${getProgressColor(percentage)}`}
                      />
                      <div className="mt-2 text-sm text-gray-500">
                        {phase.completedCases} / {phase.totalCases} {t("cases")}
                      </div>
                    </div>
                  );
                })}
              </div>
            </TabsContent>
            <TabsContent value="summary" className="mt-4">
              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-4">
                  {t("Overall Workflow Progress")}
                </h3>
                <div className="space-y-6">
                  {mockWorkflowData.phases.map((phase) => {
                    const percentage = Math.round(
                      (phase.completedCases / phase.totalCases) * 100,
                    );
                    return (
                      <div key={phase.id} className="flex items-center">
                        <div className="w-1/4 font-medium">{t(phase.name)}</div>
                        <div className="w-3/4">
                          <div className="flex justify-between items-center text-sm text-gray-500 mb-1">
                            <span>{percentage}%</span>
                          </div>
                          <Progress
                            value={percentage}
                            className={`h-2 ${getProgressColor(percentage)}`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: number;
  footer: string;
}

function StatCard({ icon, title, value, footer }: StatCardProps) {
  return (
    <div className="border rounded-lg p-4 flex items-start">
      <div className="p-2 rounded-full bg-gray-50 mr-4">{icon}</div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <h3 className="text-2xl font-bold">{value}</h3>
        <p className="text-xs text-gray-400">{footer}</p>
      </div>
    </div>
  );
}

function PhaseIcon({ phase }: { phase: string }) {
  switch (phase) {
    case "Assessment":
      return <ClipboardCheck className="h-5 w-5 text-blue-500" />;
    case "Project Planning":
      return <FileText className="h-5 w-5 text-indigo-500" />;
    case "Approval Process":
      return <Users className="h-5 w-5 text-purple-500" />;
    case "Execution":
      return <ShoppingCart className="h-5 w-5 text-orange-500" />;
    case "Financial Management":
      return <Home className="h-5 w-5 text-green-500" />;
    default:
      return <Activity className="h-5 w-5 text-gray-500" />;
  }
}
