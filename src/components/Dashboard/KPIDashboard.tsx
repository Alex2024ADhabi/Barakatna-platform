import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Progress } from "../ui/progress";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import {
  InfoIcon,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw,
  Save,
  WifiOff,
} from "lucide-react";
import kpiDashboardService, {
  KpiCategory,
  KpiMetric,
  ResourceUtilizationReport,
  ResourceUtilizationData,
} from "../../services/kpiDashboardService";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface KPIDashboardProps {
  refreshInterval?: number; // in seconds
  isOfflineMode?: boolean;
}

const KPIDashboard: React.FC<KPIDashboardProps> = ({
  refreshInterval = 300, // 5 minutes default
  isOfflineMode = false,
}) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<string>("resource-utilization");
  const [metrics, setMetrics] = useState<KpiMetric[]>([]);
  const [reports, setReports] = useState<ResourceUtilizationReport[]>([]);
  const [currentReport, setCurrentReport] =
    useState<ResourceUtilizationReport | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [syncStatus, setSyncStatus] = useState<
    "success" | "error" | "syncing" | "offline" | null
  >(null);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    loadDashboardData();

    // Set up refresh interval
    if (!isOfflineMode && refreshInterval > 0) {
      const intervalId = setInterval(() => {
        refreshDashboardData();
      }, refreshInterval * 1000);

      return () => clearInterval(intervalId);
    }
  }, [refreshInterval, isOfflineMode]);

  // Load dashboard data
  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // Get resource utilization metrics
      const resourceMetrics = kpiDashboardService.getMetricsByCategory(
        KpiCategory.ResourceUtilization,
      );
      setMetrics(resourceMetrics);

      // Get resource utilization reports
      const utilizationReports =
        kpiDashboardService.getResourceUtilizationReports();
      setReports(utilizationReports);

      // Set current report to the most recent one
      if (utilizationReports.length > 0) {
        setCurrentReport(utilizationReports[0]);
      }

      setLastSyncTime(new Date());
      setSyncStatus("success");
      setAlertMessage(null);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      setSyncStatus("error");
      setAlertMessage("Failed to load dashboard data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh dashboard data
  const refreshDashboardData = async () => {
    if (isOfflineMode) {
      setSyncStatus("offline");
      return;
    }

    setSyncStatus("syncing");
    try {
      // Simulate API call to refresh data
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Get updated metrics
      const resourceMetrics = kpiDashboardService.getMetricsByCategory(
        KpiCategory.ResourceUtilization,
      );
      setMetrics(resourceMetrics);

      // Get updated reports
      const utilizationReports =
        kpiDashboardService.getResourceUtilizationReports();
      setReports(utilizationReports);

      setLastSyncTime(new Date());
      setSyncStatus("success");
      setAlertMessage(null);
    } catch (error) {
      console.error("Error refreshing dashboard data:", error);
      setSyncStatus("error");
      setAlertMessage("Failed to refresh dashboard data. Please try again.");
    }
  };

  // Generate a new report
  const generateNewReport = () => {
    const now = new Date();
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const newReport = kpiDashboardService.generateResourceUtilizationReport(
      {
        from: oneMonthAgo,
        to: now,
      },
      `Resource Utilization Report - ${now.toLocaleDateString()}`,
    );

    setReports([newReport, ...reports]);
    setCurrentReport(newReport);
    setLastSyncTime(new Date());
    setSyncStatus("success");
  };

  // Save data for offline use
  const saveForOffline = () => {
    // In a real implementation, this would save data to local storage or IndexedDB
    localStorage.setItem("kpi_dashboard_metrics", JSON.stringify(metrics));
    localStorage.setItem("kpi_dashboard_reports", JSON.stringify(reports));
    localStorage.setItem("kpi_dashboard_last_sync", new Date().toISOString());

    setAlertMessage("Dashboard data saved for offline use");
    setTimeout(() => setAlertMessage(null), 3000);
  };

  // Format data for charts
  const formatMetricDataForChart = (metric: KpiMetric) => {
    return metric.dataPoints.map((dp) => ({
      date: new Date(dp.timestamp).toLocaleDateString(),
      value: dp.value,
    }));
  };

  // Get trend icon based on trend direction
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case "down":
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  // Get color based on value compared to threshold
  const getThresholdColor = (
    value: number,
    threshold?: { warning: number; critical: number },
  ) => {
    if (!threshold) return "bg-blue-500";

    if (value < threshold.critical) return "bg-red-500";
    if (value < threshold.warning) return "bg-amber-500";
    return "bg-green-500";
  };

  return (
    <div className="space-y-4 p-4 bg-white dark:bg-gray-900 rounded-lg">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">{t("KPI Dashboard")}</h2>
          <p className="text-muted-foreground">
            {t("Real-time performance metrics and analytics")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isOfflineMode && (
            <Badge
              variant="outline"
              className="flex items-center gap-1 bg-amber-100 text-amber-800 border-amber-300"
            >
              <WifiOff className="h-3 w-3" />
              {t("Offline Mode")}
            </Badge>
          )}
          {lastSyncTime && (
            <div className="text-sm text-muted-foreground">
              {t("Last synced")}: {lastSyncTime.toLocaleTimeString()}
            </div>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={refreshDashboardData}
            disabled={isLoading || isOfflineMode || syncStatus === "syncing"}
          >
            <RefreshCw
              className={`h-4 w-4 mr-1 ${syncStatus === "syncing" ? "animate-spin" : ""}`}
            />
            {t("Refresh")}
          </Button>
          <Button variant="outline" size="sm" onClick={saveForOffline}>
            <Save className="h-4 w-4 mr-1" />
            {t("Save Offline")}
          </Button>
        </div>
      </div>

      {/* Alert message */}
      {alertMessage && (
        <Alert variant={syncStatus === "error" ? "destructive" : "default"}>
          {syncStatus === "error" ? (
            <AlertTriangle className="h-4 w-4" />
          ) : (
            <InfoIcon className="h-4 w-4" />
          )}
          <AlertTitle>
            {syncStatus === "error" ? t("Error") : t("Information")}
          </AlertTitle>
          <AlertDescription>{alertMessage}</AlertDescription>
        </Alert>
      )}

      {/* Main content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="resource-utilization">
            {t("Resource Utilization")}
          </TabsTrigger>
          <TabsTrigger value="reports">{t("Reports")}</TabsTrigger>
          <TabsTrigger value="analytics">{t("Analytics")}</TabsTrigger>
        </TabsList>

        {/* Resource Utilization Tab */}
        <TabsContent value="resource-utilization" className="space-y-4">
          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {metrics.map((metric) => (
              <Card key={metric.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-sm font-medium">
                      {metric.name}
                    </CardTitle>
                    {getTrendIcon(metric.trend)}
                  </div>
                  <CardDescription className="text-xs">
                    {metric.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-2">
                    {metric.dataPoints.length > 0
                      ? `${metric.dataPoints[metric.dataPoints.length - 1].value.toFixed(1)}${metric.unit}`
                      : `0${metric.unit}`}
                  </div>
                  <Progress
                    value={
                      metric.dataPoints.length > 0
                        ? metric.dataPoints[metric.dataPoints.length - 1].value
                        : 0
                    }
                    max={100}
                    className={getThresholdColor(
                      metric.dataPoints.length > 0
                        ? metric.dataPoints[metric.dataPoints.length - 1].value
                        : 0,
                      metric.threshold,
                    )}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>0{metric.unit}</span>
                    <span>
                      {metric.target
                        ? `${t("Target")}: ${metric.target}${metric.unit}`
                        : "100%"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {metrics.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>
                    {metrics[0].name} - {t("Trend")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={formatMetricDataForChart(metrics[0])}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Area
                          type="monotone"
                          dataKey="value"
                          stroke="#8884d8"
                          fill="#8884d8"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}

            {metrics.length > 1 && (
              <Card>
                <CardHeader>
                  <CardTitle>
                    {metrics[1].name} - {t("Trend")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={formatMetricDataForChart(metrics[1])}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Area
                          type="monotone"
                          dataKey="value"
                          stroke="#82ca9d"
                          fill="#82ca9d"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">
              {t("Resource Utilization Reports")}
            </h3>
            <Button onClick={generateNewReport}>
              {t("Generate New Report")}
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Reports List */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle>{t("Available Reports")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {reports.map((report) => (
                    <div
                      key={report.id}
                      className={`p-3 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 ${currentReport?.id === report.id ? "bg-gray-100 dark:bg-gray-800" : ""}`}
                      onClick={() => setCurrentReport(report)}
                    >
                      <div className="font-medium">{report.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {new Date(report.dateRange.from).toLocaleDateString()} -{" "}
                        {new Date(report.dateRange.to).toLocaleDateString()}
                      </div>
                      <div className="text-sm">
                        {t("Overall Utilization")}:{" "}
                        <span className="font-medium">
                          {report.overallUtilization.toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Report Details */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>
                  {currentReport?.name || t("Select a Report")}
                </CardTitle>
                {currentReport && (
                  <CardDescription>
                    {t("Created")}:{" "}
                    {new Date(currentReport.createdAt).toLocaleString()}
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                {currentReport ? (
                  <div className="space-y-4">
                    {/* Department Utilization */}
                    <div>
                      <h4 className="font-medium mb-2">
                        {t("Department Utilization")}
                      </h4>
                      <div className="space-y-2">
                        {currentReport.departmentUtilization.map(
                          (dept, index) => (
                            <div key={index} className="space-y-1">
                              <div className="flex justify-between text-sm">
                                <span>{dept.department}</span>
                                <span className="font-medium">
                                  {dept.utilizationPercentage.toFixed(1)}%
                                </span>
                              </div>
                              <Progress
                                value={dept.utilizationPercentage}
                                max={100}
                              />
                            </div>
                          ),
                        )}
                      </div>
                    </div>

                    <Separator />

                    {/* Resource Utilization Chart */}
                    <div>
                      <h4 className="font-medium mb-2">
                        {t("Resource Utilization by Role")}
                      </h4>
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={currentReport.resourcesData.map((r) => ({
                              name: r.resourceRole,
                              utilization: r.utilizationPercentage,
                            }))}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar
                              dataKey="utilization"
                              name="Utilization %"
                              fill="#8884d8"
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-[400px] text-muted-foreground">
                    {t("Select a report to view details")}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("Advanced Analytics")}</CardTitle>
              <CardDescription>
                {t(
                  "Detailed analysis of resource utilization and performance metrics",
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-[400px] text-muted-foreground">
                {t("Advanced analytics features coming soon")}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default KPIDashboard;
