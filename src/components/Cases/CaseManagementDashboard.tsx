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
  Filter,
  Plus,
  FileText,
  Calendar,
  User,
  Home,
  Clock,
  CheckCircle,
  AlertCircle,
  PauseCircle,
  XCircle,
  BarChart2,
  PieChart as PieChartIcon,
} from "lucide-react";
import { useTranslatedDirection } from "@/hooks/useTranslatedDirection";
import { caseApi } from "@/lib/api/case/caseApi";
import { CaseSummary, CaseStatistics, Case } from "@/lib/api/case/types";

export default function CaseManagementDashboard() {
  const { t } = useTranslation();
  const dir = useTranslatedDirection();
  const [activeTab, setActiveTab] = useState("overview");
  const [caseSummary, setCaseSummary] = useState<CaseSummary | null>(null);
  const [caseStatistics, setCaseStatistics] = useState<CaseStatistics | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const summary = await caseApi.getCaseSummary();
        const statistics = await caseApi.getCaseStatistics();

        setCaseSummary(summary);
        setCaseStatistics(statistics);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getStatusColor = (status: Case["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "in-progress":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "on-hold":
        return "bg-red-100 text-red-800";
      case "cancelled":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: Case["status"]) => {
    switch (status) {
      case "pending":
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case "in-progress":
        return <Clock className="h-5 w-5 text-blue-600" />;
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "on-hold":
        return <PauseCircle className="h-5 w-5 text-red-600" />;
      case "cancelled":
        return <XCircle className="h-5 w-5 text-gray-600" />;
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
        <h1 className="text-2xl font-bold">{t("Case Management Dashboard")}</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          {t("New Case")}
        </Button>
      </div>

      <Tabs
        defaultValue="overview"
        className="w-full"
        onValueChange={setActiveTab}
      >
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="overview">{t("Overview")}</TabsTrigger>
          <TabsTrigger value="analytics">{t("Analytics")}</TabsTrigger>
          <TabsTrigger value="recent">{t("Recent Cases")}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  {t("Total Cases")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {caseSummary?.totalCases}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  {t("In Progress")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">
                  {caseSummary?.byStatus["in-progress"]}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  {t("Completed")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {caseSummary?.byStatus.completed}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  {t("Avg. Resolution Time")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {caseStatistics?.averageResolutionTime.toFixed(1)} {t("days")}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>{t("Case Distribution")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={caseStatistics?.casesByMonth}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" fill="#3b82f6" name={t("Cases")} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("Case Types")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={caseStatistics?.casesByType}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                        nameKey="type"
                        label={({ type, percent }) =>
                          `${type}: ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {caseStatistics?.casesByType.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-4">
                  {caseStatistics?.casesByType.map((item, index) => (
                    <div key={item.type} className="flex items-center">
                      <div
                        className="w-3 h-3 rounded-full mr-2"
                        style={{
                          backgroundColor: COLORS[index % COLORS.length],
                        }}
                      ></div>
                      <span className="text-sm">
                        {item.type.toUpperCase()}: {item.count}
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
                <CardTitle>{t("Recently Updated Cases")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {caseSummary?.recentlyUpdated.map((caseItem) => (
                    <div
                      key={caseItem.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <div className="font-medium">{caseItem.title}</div>
                        <div className="text-sm text-gray-500">
                          {caseItem.caseNumber} • {caseItem.beneficiaryName}
                        </div>
                      </div>
                      <Badge className={getStatusColor(caseItem.status)}>
                        {t(
                          caseItem.status.charAt(0).toUpperCase() +
                            caseItem.status.slice(1),
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
                  {caseSummary?.upcomingDeadlines.map((caseItem) => (
                    <div
                      key={caseItem.id}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <div className="font-medium">{caseItem.title}</div>
                        <div className="text-sm text-gray-500">
                          {caseItem.caseNumber} • {caseItem.beneficiaryName}
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-500 mr-2" />
                        <span>
                          {caseItem.estimatedCompletionDate
                            ? new Date(
                                caseItem.estimatedCompletionDate,
                              ).toLocaleDateString()
                            : ""}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("Cases by Status")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={caseStatistics?.casesByStatus}
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
                        {caseStatistics?.casesByStatus.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-4">
                  {caseStatistics?.casesByStatus.map((item, index) => (
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

            <Card>
              <CardHeader>
                <CardTitle>{t("Cases by Priority")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={caseStatistics?.casesByPriority}
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
                        {caseStatistics?.casesByPriority.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-4">
                  {caseStatistics?.casesByPriority.map((item, index) => (
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

            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>{t("Monthly Case Trend")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={caseStatistics?.casesByMonth}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" fill="#3b82f6" name={t("Cases")} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="recent" className="mt-0">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle>{t("Recent Cases")}</CardTitle>
                <div className="flex space-x-2">
                  <div className="relative w-64">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      placeholder={t("Search cases...")}
                      className="pl-8"
                    />
                  </div>
                  <Select defaultValue="all">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder={t("Filter by Status")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t("All Statuses")}</SelectItem>
                      <SelectItem value="pending">{t("Pending")}</SelectItem>
                      <SelectItem value="in-progress">
                        {t("In Progress")}
                      </SelectItem>
                      <SelectItem value="completed">
                        {t("Completed")}
                      </SelectItem>
                      <SelectItem value="on-hold">{t("On Hold")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {caseSummary?.recentlyUpdated.map((caseItem) => (
                  <div key={caseItem.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-lg">
                          {caseItem.title}
                        </h3>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <FileText className="h-4 w-4 mr-1" />
                          <span>{caseItem.caseNumber}</span>
                          <span className="mx-2">•</span>
                          <User className="h-4 w-4 mr-1" />
                          <span>{caseItem.beneficiaryName}</span>
                        </div>
                      </div>
                      <Badge className={getStatusColor(caseItem.status)}>
                        {t(
                          caseItem.status.charAt(0).toUpperCase() +
                            caseItem.status.slice(1),
                        )}
                      </Badge>
                    </div>

                    <div className="mt-3 text-sm text-gray-600">
                      {caseItem.description.length > 150
                        ? `${caseItem.description.substring(0, 150)}...`
                        : caseItem.description}
                    </div>

                    <div className="flex flex-wrap gap-2 mt-3">
                      {caseItem.tags?.map((tag, index) => (
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
                        <Home className="h-4 w-4 mr-1" />
                        <span>{caseItem.address}</span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>
                            {new Date(caseItem.updatedAt).toLocaleDateString()}
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
      </Tabs>
    </div>
  );
}
