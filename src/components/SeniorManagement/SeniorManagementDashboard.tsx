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
import UserManagement from "./UserManagement";
import ManpowerManagementDashboard from "../Manpower/ManpowerManagementDashboard";
import {
  BarChart,
  PieChart,
  LineChart,
  Users,
  Settings,
  Bell,
  Calendar,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useTranslatedDirection } from "@/hooks/useTranslatedDirection";

interface DashboardMetric {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon: React.ReactNode;
}

interface RecentActivity {
  id: string;
  action: string;
  user: string;
  time: string;
  status: "pending" | "completed" | "rejected";
}

const SeniorManagementDashboard = () => {
  const { t } = useTranslation();
  const dir = useTranslatedDirection();
  const [activeTab, setActiveTab] = useState("overview");

  const metrics: DashboardMetric[] = [
    {
      title: t("dashboard.activeProjects"),
      value: "24",
      change: "+12%",
      isPositive: true,
      icon: <Calendar className="h-4 w-4 text-muted-foreground" />,
    },
    {
      title: t("dashboard.pendingApprovals"),
      value: "7",
      change: "-3%",
      isPositive: true,
      icon: <Bell className="h-4 w-4 text-muted-foreground" />,
    },
    {
      title: t("dashboard.activeUsers"),
      value: "132",
      change: "+8%",
      isPositive: true,
      icon: <Users className="h-4 w-4 text-muted-foreground" />,
    },
    {
      title: t("dashboard.budgetUtilization"),
      value: "78%",
      change: "+5%",
      isPositive: false,
      icon: <Settings className="h-4 w-4 text-muted-foreground" />,
    },
  ];

  const recentActivities: RecentActivity[] = [
    {
      id: "1",
      action: t("dashboard.projectApproved"),
      user: "Ahmed Hassan",
      time: "2 hours ago",
      status: "completed",
    },
    {
      id: "2",
      action: t("dashboard.newAssessmentSubmitted"),
      user: "Fatima Al-Sayed",
      time: "4 hours ago",
      status: "pending",
    },
    {
      id: "3",
      action: t("dashboard.budgetRequest"),
      user: "Mohammed Al-Harbi",
      time: "1 day ago",
      status: "rejected",
    },
    {
      id: "4",
      action: t("dashboard.newUserRegistered"),
      user: "Layla Mahmoud",
      time: "2 days ago",
      status: "completed",
    },
  ];

  return (
    <div className="flex flex-col gap-4" dir={dir}>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">
          {t("dashboard.seniorManagement")}
        </h1>
        <div className="flex items-center gap-2">
          <Button variant="outline">{t("common.export")}</Button>
          <Button>{t("common.settings")}</Button>
        </div>
      </div>

      <Tabs
        defaultValue="overview"
        className="space-y-4"
        onValueChange={setActiveTab}
      >
        <TabsList>
          <TabsTrigger value="overview">{t("dashboard.overview")}</TabsTrigger>
          <TabsTrigger value="users">{t("dashboard.users")}</TabsTrigger>
          <TabsTrigger value="manpower">{t("dashboard.manpower")}</TabsTrigger>
          <TabsTrigger value="reports">{t("dashboard.reports")}</TabsTrigger>
          <TabsTrigger value="settings">{t("dashboard.settings")}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
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

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>{t("dashboard.projectProgress")}</CardTitle>
                <CardDescription>
                  {t("dashboard.projectProgressDescription")}
                </CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <div className="h-[300px] w-full flex items-center justify-center border-dashed border-2 border-gray-200 rounded-md">
                  <LineChart className="h-16 w-16 text-gray-400" />
                  <span className="ml-2 text-gray-500">
                    {t("dashboard.projectChartPlaceholder")}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>{t("dashboard.clientDistribution")}</CardTitle>
                <CardDescription>
                  {t("dashboard.clientDistributionDescription")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full flex items-center justify-center border-dashed border-2 border-gray-200 rounded-md">
                  <PieChart className="h-16 w-16 text-gray-400" />
                  <span className="ml-2 text-gray-500">
                    {t("dashboard.clientChartPlaceholder")}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>{t("dashboard.budgetAllocation")}</CardTitle>
                <CardDescription>
                  {t("dashboard.budgetAllocationDescription")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full flex items-center justify-center border-dashed border-2 border-gray-200 rounded-md">
                  <BarChart className="h-16 w-16 text-gray-400" />
                  <span className="ml-2 text-gray-500">
                    {t("dashboard.budgetChartPlaceholder")}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>{t("dashboard.recentActivity")}</CardTitle>
                <CardDescription>
                  {t("dashboard.recentActivityDescription")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-center justify-between border-b pb-2"
                    >
                      <div>
                        <p className="font-medium">{activity.action}</p>
                        <p className="text-sm text-gray-500">
                          {activity.user} • {activity.time}
                        </p>
                      </div>
                      <div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${activity.status === "completed" ? "bg-green-100 text-green-800" : activity.status === "pending" ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"}`}
                        >
                          {t(`dashboard.${activity.status}`)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users">
          <UserManagement />
        </TabsContent>

        <TabsContent value="manpower">
          <ManpowerManagementDashboard />
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>{t("dashboard.reports")}</CardTitle>
              <CardDescription>
                {t("dashboard.reportsDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full flex items-center justify-center border-dashed border-2 border-gray-200 rounded-md">
                <p className="text-gray-500">
                  {t("dashboard.reportsPlaceholder")}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>{t("dashboard.settings")}</CardTitle>
              <CardDescription>
                {t("dashboard.settingsDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full flex items-center justify-center border-dashed border-2 border-gray-200 rounded-md">
                <p className="text-gray-500">
                  {t("dashboard.settingsPlaceholder")}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SeniorManagementDashboard;
