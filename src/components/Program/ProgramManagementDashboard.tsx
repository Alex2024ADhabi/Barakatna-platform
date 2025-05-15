import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Search,
  Plus,
  FileText,
  Calendar,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  PauseCircle,
  XCircle,
  BarChart2,
  DollarSign,
  Target,
  Briefcase,
  Link,
  AlertTriangle,
} from "lucide-react";
import { useTranslatedDirection } from "@/hooks/useTranslatedDirection";
import { programApi } from "@/lib/api/program/programApi";
import {
  ProgramSummary,
  ProgramStatistics,
  Program,
} from "@/lib/api/program/types";

interface ProgramManagementDashboardProps {
  onViewPrograms: () => void;
  onCreateProgram: () => void;
}

export default function ProgramManagementDashboard({
  onViewPrograms,
  onCreateProgram,
}: ProgramManagementDashboardProps) {
  const { t } = useTranslation();
  const dir = useTranslatedDirection();
  const [activeTab, setActiveTab] = useState("overview");
  const [programSummary, setProgramSummary] = useState<ProgramSummary | null>(
    null,
  );
  const [programStatistics, setProgramStatistics] =
    useState<ProgramStatistics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const summary = await programApi.getProgramSummary();
        const statistics = await programApi.getProgramStatistics();

        setProgramSummary(summary);
        setProgramStatistics(statistics);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getStatusColor = (status: Program["status"]) => {
    switch (status) {
      case "planning":
        return "bg-blue-100 text-blue-800";
      case "active":
        return "bg-green-100 text-green-800";
      case "on-hold":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-purple-100 text-purple-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: Program["priority"]) => {
    switch (priority) {
      case "low":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-blue-100 text-blue-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "critical":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: Program["status"]) => {
    switch (status) {
      case "planning":
        return <Clock className="h-5 w-5 text-blue-600" />;
      case "active":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "on-hold":
        return <PauseCircle className="h-5 w-5 text-yellow-600" />;
      case "completed":
        return <CheckCircle className="h-5 w-5 text-purple-600" />;
      case "cancelled":
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-600" />;
    }
  };

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow" dir={dir}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">
          {t("Program Management Dashboard")}
        </h1>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={onViewPrograms}>
            <FileText className="mr-2 h-4 w-4" />
            {t("View All Programs")}
          </Button>
          <Button onClick={onCreateProgram}>
            <Plus className="mr-2 h-4 w-4" />
            {t("New Program")}
          </Button>
        </div>
      </div>

      <Tabs
        defaultValue="overview"
        className="w-full"
        onValueChange={setActiveTab}
      >
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="overview">{t("Overview")}</TabsTrigger>
          <TabsTrigger value="analytics">{t("Analytics")}</TabsTrigger>
          <TabsTrigger value="programs">{t("Programs")}</TabsTrigger>
          <TabsTrigger value="outcomes">{t("Outcomes")}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  {t("Total Programs")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {programSummary?.totalPrograms}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {t("Across all statuses")}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  {t("Active Programs")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {programSummary?.byStatus.active}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {t("Currently in progress")}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  {t("Budget Utilization")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">
                  {programSummary?.budgetUtilization.toFixed(1)}%
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${programSummary?.budgetUtilization}%` }}
                  ></div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  {t("Outcome Achievement")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600">
                  {programSummary?.outcomeAchievement.toFixed(1)}%
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full"
                    style={{ width: `${programSummary?.outcomeAchievement}%` }}
                  ></div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>{t("Program Distribution")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={programStatistics?.programsByMonth}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar
                        dataKey="count"
                        fill="#3b82f6"
                        name={t("Programs")}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("Programs by Status")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={programStatistics?.programsByStatus}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                        nameKey="status"
                        label={({ status, percent }) =>
                          `${status}: ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {programStatistics?.programsByStatus.map(
                          (entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ),
                        )}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-4">
                  {programStatistics?.programsByStatus.map((item, index) => (
                    <div key={item.status} className="flex items-center">
                      <div
                        className="w-3 h-3 rounded-full mr-2"
                        style={{
                          backgroundColor: COLORS[index % COLORS.length],
                        }}
                      ></div>
                      <span className="text-sm">
                        {t(
                          item.status.charAt(0).toUpperCase() +
                            item.status.slice(1),
                        )}
                        : {item.count}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("Recently Updated Programs")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {programSummary?.recentlyUpdated.map((program) => (
                    <div
                      key={program.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <div className="font-medium">{program.name}</div>
                        <div className="text-sm text-gray-500">
                          {program.programNumber} • {t("Updated")}:{" "}
                          {new Date(program.updatedAt).toLocaleDateString()}
                        </div>
                      </div>
                      <Badge className={getStatusColor(program.status)}>
                        {t(
                          program.status.charAt(0).toUpperCase() +
                            program.status.slice(1),
                        )}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("Upcoming Deadlines")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {programSummary?.upcomingDeadlines.map((program) => (
                    <div
                      key={program.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <div className="font-medium">{program.name}</div>
                        <div className="text-sm text-gray-500">
                          {program.programNumber} • {t("Priority")}:{" "}
                          <span
                            className={`font-medium ${program.priority === "critical" ? "text-red-600" : ""}`}
                          >
                            {t(
                              program.priority.charAt(0).toUpperCase() +
                                program.priority.slice(1),
                            )}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                        <span>
                          {new Date(program.endDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center">
                  <Briefcase className="h-5 w-5 text-blue-500 mr-2" />
                  <CardTitle>{t("Quick Actions")}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <Plus className="mr-2 h-4 w-4" />
                    {t("Create New Program")}
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Link className="mr-2 h-4 w-4" />
                    {t("Link Projects to Program")}
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Target className="mr-2 h-4 w-4" />
                    {t("Define Program Outcomes")}
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    {t("Manage Program Risks")}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-2">
              <CardHeader className="pb-2">
                <div className="flex items-center">
                  <BarChart2 className="h-5 w-5 text-purple-500 mr-2" />
                  <CardTitle>{t("Budget Allocation by Category")}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={programStatistics?.budgetAllocationByCategory}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="category" type="category" width={80} />
                      <Tooltip
                        formatter={(value) => `${value.toLocaleString()} SAR`}
                      />
                      <Bar
                        dataKey="amount"
                        fill="#8884d8"
                        name={t("Budget Amount")}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("Programs by Priority")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={programStatistics?.programsByPriority}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                        nameKey="priority"
                        label={({ priority, percent }) =>
                          `${priority}: ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {programStatistics?.programsByPriority.map(
                          (entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ),
                        )}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-4">
                  {programStatistics?.programsByPriority.map((item, index) => (
                    <div key={item.priority} className="flex items-center">
                      <div
                        className="w-3 h-3 rounded-full mr-2"
                        style={{
                          backgroundColor: COLORS[index % COLORS.length],
                        }}
                      ></div>
                      <span className="text-sm">
                        {t(
                          item.priority.charAt(0).toUpperCase() +
                            item.priority.slice(1),
                        )}
                        : {item.count}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("Risk Distribution")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={programStatistics?.riskDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                        nameKey="severity"
                        label={({ severity, count }) => `${severity}: ${count}`}
                      >
                        {programStatistics?.riskDistribution.map(
                          (entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={
                                [
                                  "#4ade80", // green for low
                                  "#facc15", // yellow for medium
                                  "#fb923c", // orange for high
                                  "#f87171", // red for critical
                                ][index % 4]
                              }
                            />
                          ),
                        )}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>{t("Outcome Achievement Rate")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={programStatistics?.outcomeAchievementRate}
                      margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="program"
                        angle={-45}
                        textAnchor="end"
                        height={70}
                      />
                      <YAxis
                        label={{
                          value: t("Achievement Rate (%)"),
                          angle: -90,
                          position: "insideLeft",
                        }}
                      />
                      <Tooltip />
                      <Bar
                        dataKey="rate"
                        fill="#8884d8"
                        name={t("Achievement Rate")}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="programs" className="mt-0">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle>{t("Program List")}</CardTitle>
                <div className="flex space-x-2">
                  <div className="relative w-64">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder={t("Search programs...")}
                      className="pl-8"
                    />
                  </div>
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder={t("Filter by Status")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t("All Statuses")}</SelectItem>
                      <SelectItem value="planning">{t("Planning")}</SelectItem>
                      <SelectItem value="active">{t("Active")}</SelectItem>
                      <SelectItem value="on-hold">{t("On Hold")}</SelectItem>
                      <SelectItem value="completed">
                        {t("Completed")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {programSummary?.recentlyUpdated.map((program) => (
                  <div key={program.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-lg">{program.name}</h3>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <FileText className="h-4 w-4 mr-1" />
                          <span>{program.programNumber}</span>
                          <span className="mx-2">•</span>
                          <User className="h-4 w-4 mr-1" />
                          <span>Manager ID: {program.managerId}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getPriorityColor(program.priority)}>
                          {t(
                            program.priority.charAt(0).toUpperCase() +
                              program.priority.slice(1),
                          )}
                        </Badge>
                        <Badge className={getStatusColor(program.status)}>
                          {t(
                            program.status.charAt(0).toUpperCase() +
                              program.status.slice(1),
                          )}
                        </Badge>
                      </div>
                    </div>

                    <div className="mt-3 text-sm text-gray-600">
                      {program.description.length > 150
                        ? `${program.description.substring(0, 150)}...`
                        : program.description}
                    </div>

                    <div className="flex flex-wrap gap-2 mt-3">
                      {program.tags?.map((tag, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="bg-gray-100"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex justify-between items-center mt-4 pt-3 border-t">
                      <div className="flex items-center text-sm text-gray-500">
                        <DollarSign className="h-4 w-4 mr-1" />
                        <span>
                          {t("Budget")}: {program.budget.toLocaleString()} SAR
                        </span>
                        <span className="mx-2">•</span>
                        <span>
                          {t("Spent")}: {program.spentBudget.toLocaleString()}{" "}
                          SAR
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>
                            {new Date(program.startDate).toLocaleDateString()} -{" "}
                            {new Date(program.endDate).toLocaleDateString()}
                          </span>
                        </div>
                        <Button variant="outline" size="sm">
                          {t("View")}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="outcomes" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  {t("Overall Achievement")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600">
                  {programSummary?.outcomeAchievement.toFixed(1)}%
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className="bg-purple-600 h-2 rounded-full"
                    style={{ width: `${programSummary?.outcomeAchievement}%` }}
                  ></div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  {t("Outcomes Tracked")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">24</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {t("Across all programs")}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  {t("Outcomes Achieved")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">9</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {t("Fully completed outcomes")}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t("Program Outcomes")}</CardTitle>
              <CardDescription>
                {t(
                  "Track and manage program outcomes and their achievement rates",
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {programStatistics?.outcomeAchievementRate.map(
                  (item, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{item.program}</h3>
                          <div className="text-sm text-gray-500 mt-1">
                            {t("Achievement Rate")}: {item.rate}%
                          </div>
                        </div>
                        <Badge
                          className={
                            item.rate >= 75
                              ? "bg-green-100 text-green-800"
                              : item.rate >= 50
                                ? "bg-blue-100 text-blue-800"
                                : item.rate >= 25
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                          }
                        >
                          {item.rate >= 75
                            ? t("On Track")
                            : item.rate >= 50
                              ? t("Progressing")
                              : item.rate >= 25
                                ? t("Needs Attention")
                                : t("At Risk")}
                        </Badge>
                      </div>

                      <div className="mt-3">
                        <div className="text-xs text-gray-500 mb-1">
                          {t("Progress")}
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className={
                              item.rate >= 75
                                ? "bg-green-600 h-2.5 rounded-full"
                                : item.rate >= 50
                                  ? "bg-blue-600 h-2.5 rounded-full"
                                  : item.rate >= 25
                                    ? "bg-yellow-500 h-2.5 rounded-full"
                                    : "bg-red-600 h-2.5 rounded-full"
                            }
                            style={{ width: `${item.rate}%` }}
                          ></div>
                        </div>
                      </div>

                      <div className="mt-4 flex justify-end">
                        <Button variant="outline" size="sm">
                          {t("View Details")}
                        </Button>
                      </div>
                    </div>
                  ),
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
