import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { useTranslatedDirection } from "@/hooks/useTranslatedDirection";
import { Users, Calendar, BarChart, PieChart, Clock } from "lucide-react";
import ResourceList from "./ResourceList";
import ResourceAllocationComponent from "./ResourceAllocation";
import SkillMatrixManagement from "./SkillMatrixManagement";
import ContractorManagement from "./ContractorManagement";
import TimesheetTracking from "./TimesheetTracking";
import ResourceForecasting from "./ResourceForecasting";
import { manpowerApi } from "@/lib/api/manpower/manpowerApi";

interface DashboardMetric {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon: React.ReactNode;
}

const ManpowerManagementDashboard = () => {
  const { t } = useTranslation();
  const dir = useTranslatedDirection();
  const [activeTab, setActiveTab] = useState("resources");

  const metrics: DashboardMetric[] = [
    {
      title: t("manpower.totalResources"),
      value: "32",
      change: "+3",
      isPositive: true,
      icon: <Users className="h-4 w-4 text-muted-foreground" />,
    },
    {
      title: t("manpower.averageUtilization"),
      value: "85%",
      change: "+5%",
      isPositive: true,
      icon: <BarChart className="h-4 w-4 text-muted-foreground" />,
    },
    {
      title: t("manpower.contractorsActive"),
      value: "8",
      change: "+2",
      isPositive: true,
      icon: <PieChart className="h-4 w-4 text-muted-foreground" />,
    },
    {
      title: t("manpower.pendingTimesheets"),
      value: "12",
      change: "-3",
      isPositive: true,
      icon: <Clock className="h-4 w-4 text-muted-foreground" />,
    },
  ];

  return (
    <div className="flex flex-col gap-4" dir={dir}>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">
          {t("manpower.managementDashboard")}
        </h1>
        <div className="flex items-center gap-2">
          <Button variant="outline">{t("common.export")}</Button>
          <Button>{t("common.settings")}</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {metric.title}
              </CardTitle>
              {metric.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p
                className={`text-xs ${metric.isPositive ? "text-green-500" : "text-red-500"}`}
              >
                {metric.change} {t("dashboard.fromLastMonth")}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs
        defaultValue="resources"
        className="space-y-4"
        onValueChange={setActiveTab}
      >
        <TabsList>
          <TabsTrigger value="resources">{t("manpower.resources")}</TabsTrigger>
          <TabsTrigger value="allocation">
            {t("manpower.allocation")}
          </TabsTrigger>
          <TabsTrigger value="skills">{t("manpower.skillMatrix")}</TabsTrigger>
          <TabsTrigger value="contractors">
            {t("manpower.contractors")}
          </TabsTrigger>
          <TabsTrigger value="timesheets">
            {t("manpower.timesheets")}
          </TabsTrigger>
          <TabsTrigger value="forecasting">
            {t("manpower.forecasting")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="resources" className="space-y-4">
          <ResourceList />
        </TabsContent>

        <TabsContent value="allocation" className="space-y-4">
          <ResourceAllocationComponent />
        </TabsContent>

        <TabsContent value="skills" className="space-y-4">
          <SkillMatrixManagement />
        </TabsContent>

        <TabsContent value="contractors" className="space-y-4">
          <ContractorManagement />
        </TabsContent>

        <TabsContent value="timesheets" className="space-y-4">
          <TimesheetTracking />
        </TabsContent>

        <TabsContent value="forecasting" className="space-y-4">
          <ResourceForecasting />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ManpowerManagementDashboard;
