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
  CheckCircle2,
  XCircle,
  RefreshCw,
  Settings,
  Server,
  Database,
  Cpu,
  HardDrive,
  Activity,
  Clock,
  WifiOff,
  BarChart3,
  Bell,
} from "lucide-react";
import kpiDashboardService from "../../services/kpiDashboardService";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface SystemHealthDashboardProps {
  refreshInterval?: number; // in seconds
  isOfflineMode?: boolean;
}

interface SystemMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  status: "healthy" | "warning" | "critical" | "offline";
  history: { timestamp: Date; value: number }[];
}

interface SystemAlert {
  id: string;
  title: string;
  description: string;
  severity: "info" | "warning" | "critical";
  timestamp: Date;
  isResolved: boolean;
  resolvedAt?: Date;
  relatedMetric?: string;
}

interface SystemService {
  id: string;
  name: string;
  status: "online" | "offline" | "degraded";
  uptime: number; // in seconds
  lastChecked: Date;
  responseTime?: number; // in ms
}

const SystemHealthDashboard: React.FC<SystemHealthDashboardProps> = ({
  refreshInterval = 60, // 1 minute default
  isOfflineMode = false,
}) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [metrics, setMetrics] = useState<SystemMetric[]>([]);
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [services, setServices] = useState<SystemService[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [syncStatus, setSyncStatus] = useState<
    "success" | "error" | "syncing" | "offline" | null
  >(null);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    loadSystemHealthData();

    // Set up refresh interval
    if (!isOfflineMode && refreshInterval > 0) {
      const intervalId = setInterval(() => {
        refreshSystemHealthData();
      }, refreshInterval * 1000);

      return () => clearInterval(intervalId);
    }
  }, [refreshInterval, isOfflineMode]);

  // Mock data generation for system metrics
  const generateMockSystemMetrics = (): SystemMetric[] => {
    return [
      {
        id: "cpu_usage",
        name: t("administration.systemHealth.metrics.cpuUsage"),
        value: 45 + Math.random() * 20,
        unit: "%",
        status: "healthy",
        history: generateMetricHistory(30, 50, 15),
      },
      {
        id: "memory_usage",
        name: t("administration.systemHealth.metrics.memoryUsage"),
        value: 65 + Math.random() * 15,
        unit: "%",
        status: "warning",
        history: generateMetricHistory(30, 70, 10),
      },
      {
        id: "disk_usage",
        name: t("administration.systemHealth.metrics.diskUsage"),
        value: 72 + Math.random() * 5,
        unit: "%",
        status: "healthy",
        history: generateMetricHistory(30, 75, 5),
      },
      {
        id: "network_latency",
        name: t("administration.systemHealth.metrics.networkLatency"),
        value: 120 + Math.random() * 80,
        unit: "ms",
        status: "healthy",
        history: generateMetricHistory(30, 150, 50),
      },
      {
        id: "database_connections",
        name: t("administration.systemHealth.metrics.databaseConnections"),
        value: 42 + Math.random() * 10,
        unit: "",
        status: "healthy",
        history: generateMetricHistory(30, 45, 10),
      },
      {
        id: "api_response_time",
        name: t("administration.systemHealth.metrics.apiResponseTime"),
        value: 250 + Math.random() * 150,
        unit: "ms",
        status: "warning",
        history: generateMetricHistory(30, 300, 100),
      },
    ];
  };

  // Generate mock history data for metrics
  const generateMetricHistory = (
    points: number,
    baseValue: number,
    variance: number,
  ): { timestamp: Date; value: number }[] => {
    const history: { timestamp: Date; value: number }[] = [];
    const now = new Date();

    for (let i = points; i > 0; i--) {
      const timestamp = new Date(now.getTime() - i * 60000); // One point per minute
      const value = baseValue + (Math.random() * variance * 2 - variance);
      history.push({ timestamp, value });
    }

    return history;
  };

  // Generate mock system alerts
  const generateMockSystemAlerts = (): SystemAlert[] => {
    return [
      {
        id: "alert_1",
        title: t("administration.systemHealth.alerts.highMemoryUsage"),
        description: t(
          "administration.systemHealth.alerts.highMemoryUsageDescription",
        ),
        severity: "warning",
        timestamp: new Date(Date.now() - 25 * 60000),
        isResolved: false,
        relatedMetric: "memory_usage",
      },
      {
        id: "alert_2",
        title: t("administration.systemHealth.alerts.apiLatency"),
        description: t(
          "administration.systemHealth.alerts.apiLatencyDescription",
        ),
        severity: "warning",
        timestamp: new Date(Date.now() - 45 * 60000),
        isResolved: false,
        relatedMetric: "api_response_time",
      },
      {
        id: "alert_3",
        title: t("administration.systemHealth.alerts.databaseBackup"),
        description: t(
          "administration.systemHealth.alerts.databaseBackupDescription",
        ),
        severity: "info",
        timestamp: new Date(Date.now() - 120 * 60000),
        isResolved: true,
        resolvedAt: new Date(Date.now() - 100 * 60000),
      },
      {
        id: "alert_4",
        title: t("administration.systemHealth.alerts.diskSpaceLow"),
        description: t(
          "administration.systemHealth.alerts.diskSpaceLowDescription",
        ),
        severity: "critical",
        timestamp: new Date(Date.now() - 180 * 60000),
        isResolved: true,
        resolvedAt: new Date(Date.now() - 150 * 60000),
      },
    ];
  };

  // Generate mock system services
  const generateMockSystemServices = (): SystemService[] => {
    return [
      {
        id: "api_service",
        name: t("administration.systemHealth.services.apiService"),
        status: "online",
        uptime: 86400 * 3 + Math.floor(Math.random() * 3600), // ~3 days
        lastChecked: new Date(),
        responseTime: 120 + Math.floor(Math.random() * 50),
      },
      {
        id: "database_service",
        name: t("administration.systemHealth.services.databaseService"),
        status: "online",
        uptime: 86400 * 5 + Math.floor(Math.random() * 3600), // ~5 days
        lastChecked: new Date(),
        responseTime: 45 + Math.floor(Math.random() * 20),
      },
      {
        id: "auth_service",
        name: t("administration.systemHealth.services.authService"),
        status: "online",
        uptime: 86400 * 4 + Math.floor(Math.random() * 3600), // ~4 days
        lastChecked: new Date(),
        responseTime: 85 + Math.floor(Math.random() * 30),
      },
      {
        id: "file_storage_service",
        name: t("administration.systemHealth.services.fileStorageService"),
        status: "degraded",
        uptime: 86400 * 2 + Math.floor(Math.random() * 3600), // ~2 days
        lastChecked: new Date(),
        responseTime: 350 + Math.floor(Math.random() * 100),
      },
      {
        id: "notification_service",
        name: t("administration.systemHealth.services.notificationService"),
        status: "online",
        uptime: 86400 * 1 + Math.floor(Math.random() * 3600), // ~1 day
        lastChecked: new Date(),
        responseTime: 95 + Math.floor(Math.random() * 40),
      },
      {
        id: "backup_service",
        name: t("administration.systemHealth.services.backupService"),
        status: "online",
        uptime: 86400 * 6 + Math.floor(Math.random() * 3600), // ~6 days
        lastChecked: new Date(),
      },
    ];
  };

  // Load system health data
  const loadSystemHealthData = async () => {
    setIsLoading(true);
    try {
      // In a real implementation, this would fetch data from an API
      // For now, we'll use mock data
      const mockMetrics = generateMockSystemMetrics();
      const mockAlerts = generateMockSystemAlerts();
      const mockServices = generateMockSystemServices();
      const mockDatabaseMetrics = generateMockDatabaseMetrics();
      const mockApiEndpoints = generateMockApiEndpoints();
      const mockUserActivity = generateMockUserActivity();

      setMetrics(mockMetrics);
      setAlerts(mockAlerts);
      setServices(mockServices);
      setDatabaseMetrics(mockDatabaseMetrics);
      setApiEndpoints(mockApiEndpoints);
      setUserActivity(mockUserActivity);

      setLastSyncTime(new Date());
      setSyncStatus("success");
      setAlertMessage(null);
    } catch (error) {
      console.error("Error loading system health data:", error);
      setSyncStatus("error");
      setAlertMessage(t("administration.systemHealth.errors.loadFailed"));
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh system health data
  const refreshSystemHealthData = async () => {
    if (isOfflineMode) {
      setSyncStatus("offline");
      return;
    }

    setSyncStatus("syncing");
    try {
      // Simulate API call to refresh data
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Update metrics with slight variations
      const updatedMetrics = metrics.map((metric) => {
        const lastValue =
          metric.history.length > 0
            ? metric.history[metric.history.length - 1].value
            : metric.value;
        const newValue = Math.max(0, lastValue + (Math.random() * 10 - 5));

        // Determine status based on value
        let status: "healthy" | "warning" | "critical" | "offline" = "healthy";
        if (metric.id === "memory_usage" && newValue > 70) {
          status = "warning";
        } else if (metric.id === "api_response_time" && newValue > 350) {
          status = "warning";
        } else if (metric.id === "error_rate" && newValue > 5) {
          status = "warning";
        } else if (metric.id === "error_rate" && newValue > 8) {
          status = "critical";
        } else if (newValue > 90) {
          status = "critical";
        }

        // Add new data point to history
        const newHistory = [
          ...metric.history,
          { timestamp: new Date(), value: newValue },
        ];
        if (newHistory.length > 30) {
          newHistory.shift(); // Keep only the last 30 points
        }

        return {
          ...metric,
          value: newValue,
          status,
          history: newHistory,
        };
      });

      setMetrics(updatedMetrics);

      // Update services with new response times
      const updatedServices = services.map((service) => ({
        ...service,
        lastChecked: new Date(),
        responseTime:
          service.responseTime !== undefined
            ? Math.max(10, service.responseTime + (Math.random() * 20 - 10))
            : undefined,
      }));

      setServices(updatedServices);

      // Update database metrics
      const updatedDatabaseMetrics = databaseMetrics.map((metric) => {
        const lastValue =
          metric.history.length > 0
            ? metric.history[metric.history.length - 1].value
            : metric.value;
        const newValue = Math.max(0, lastValue + (Math.random() * 8 - 4));

        // Determine status based on value
        let status: "healthy" | "warning" | "critical" | "offline" = "healthy";
        if (metric.id === "db_disk_usage" && newValue > 75) {
          status = "warning";
        } else if (metric.id === "db_replication_lag" && newValue > 30) {
          status = "warning";
        } else if (newValue > 90) {
          status = "critical";
        }

        // Add new data point to history
        const newHistory = [
          ...metric.history,
          { timestamp: new Date(), value: newValue },
        ];
        if (newHistory.length > 30) {
          newHistory.shift(); // Keep only the last 30 points
        }

        return {
          ...metric,
          value: newValue,
          status,
          history: newHistory,
        };
      });

      setDatabaseMetrics(updatedDatabaseMetrics);

      // Update API endpoints
      const updatedApiEndpoints = apiEndpoints.map((endpoint) => {
        const newResponseTime = Math.max(
          10,
          endpoint.responseTime + (Math.random() * 40 - 20),
        );
        const newErrorRate = Math.max(
          0,
          endpoint.errorRate + (Math.random() * 1 - 0.5),
        );
        const newRequestsPerMinute = Math.max(
          1,
          endpoint.requestsPerMinute + (Math.random() * 10 - 5),
        );

        // Determine status based on values
        let status: "healthy" | "warning" | "critical" | "offline" = "healthy";
        if (newResponseTime > 300 || newErrorRate > 3) {
          status = "warning";
        }
        if (newResponseTime > 500 || newErrorRate > 5) {
          status = "critical";
        }

        return {
          ...endpoint,
          responseTime: newResponseTime,
          errorRate: newErrorRate,
          requestsPerMinute: newRequestsPerMinute,
          lastChecked: new Date(),
          status,
        };
      });

      setApiEndpoints(updatedApiEndpoints);

      // Update user activity
      if (userActivity) {
        const updatedUserActivity = {
          ...userActivity,
          timestamp: new Date(),
          activeUsers: Math.max(
            1,
            userActivity.activeUsers + (Math.random() * 20 - 10),
          ),
          newUsers: Math.max(
            0,
            userActivity.newUsers + (Math.random() * 5 - 2),
          ),
          averageSessionTime: Math.max(
            1,
            userActivity.averageSessionTime + (Math.random() * 2 - 1),
          ),
          topPages: userActivity.topPages.map((page) => ({
            ...page,
            visits: Math.max(
              1,
              page.visits + Math.floor(Math.random() * 20 - 10),
            ),
          })),
        };

        setUserActivity(updatedUserActivity);
      }

      setLastSyncTime(new Date());
      setSyncStatus("success");
      setAlertMessage(null);
    } catch (error) {
      console.error("Error refreshing system health data:", error);
      setSyncStatus("error");
      setAlertMessage(t("administration.systemHealth.errors.refreshFailed"));
    }
  };

  // Format uptime to human-readable format
  const formatUptime = (seconds: number): string => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  // Get status color for badges
  const getStatusColor = (status: string): string => {
    switch (status) {
      case "healthy":
      case "online":
        return "bg-green-500 hover:bg-green-600";
      case "warning":
      case "degraded":
        return "bg-amber-500 hover:bg-amber-600";
      case "critical":
      case "offline":
        return "bg-red-500 hover:bg-red-600";
      default:
        return "bg-gray-500 hover:bg-gray-600";
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
      case "online":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case "warning":
      case "degraded":
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case "critical":
      case "offline":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <InfoIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  // Format timestamp to relative time
  const formatRelativeTime = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) {
      return t("administration.systemHealth.time.justNow");
    } else if (diffMins < 60) {
      return t("administration.systemHealth.time.minutesAgo", {
        count: diffMins,
      });
    } else if (diffMins < 1440) {
      const hours = Math.floor(diffMins / 60);
      return t("administration.systemHealth.time.hoursAgo", { count: hours });
    } else {
      const days = Math.floor(diffMins / 1440);
      return t("administration.systemHealth.time.daysAgo", { count: days });
    }
  };

  // Format data for charts
  const formatMetricDataForChart = (metric: SystemMetric) => {
    return metric.history.map((dp) => ({
      time: dp.timestamp.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      value: dp.value,
    }));
  };

  // Calculate overall system health score
  const calculateSystemHealthScore = (): number => {
    if (metrics.length === 0) return 0;

    const statusScores = {
      healthy: 100,
      warning: 50,
      critical: 0,
      offline: 0,
    };

    const totalScore = metrics.reduce(
      (sum, metric) => sum + statusScores[metric.status],
      0,
    );

    return Math.round(totalScore / metrics.length);
  };

  // Get health score color
  const getHealthScoreColor = (score: number): string => {
    if (score >= 90) return "text-green-500";
    if (score >= 70) return "text-amber-500";
    return "text-red-500";
  };

  // Save data for offline use
  const saveForOffline = () => {
    try {
      // Save metrics
      localStorage.setItem("system_health_metrics", JSON.stringify(metrics));
      // Save alerts
      localStorage.setItem("system_health_alerts", JSON.stringify(alerts));
      // Save services
      localStorage.setItem("system_health_services", JSON.stringify(services));
      // Save timestamp
      localStorage.setItem("system_health_last_sync", new Date().toISOString());

      setAlertMessage(t("administration.systemHealth.messages.savedOffline"));
      setTimeout(() => setAlertMessage(null), 3000);
    } catch (error) {
      console.error("Error saving system health data for offline use:", error);
      setAlertMessage(t("administration.systemHealth.errors.saveFailed"));
    }
  };

  // Load data from offline storage
  const loadFromOffline = () => {
    try {
      // Load metrics
      const savedMetrics = localStorage.getItem("system_health_metrics");
      if (savedMetrics) {
        setMetrics(JSON.parse(savedMetrics));
      }

      // Load alerts
      const savedAlerts = localStorage.getItem("system_health_alerts");
      if (savedAlerts) {
        setAlerts(JSON.parse(savedAlerts));
      }

      // Load services
      const savedServices = localStorage.getItem("system_health_services");
      if (savedServices) {
        setServices(JSON.parse(savedServices));
      }

      // Load timestamp
      const savedTimestamp = localStorage.getItem("system_health_last_sync");
      if (savedTimestamp) {
        setLastSyncTime(new Date(savedTimestamp));
      }

      setAlertMessage(t("administration.systemHealth.messages.loadedOffline"));
      setTimeout(() => setAlertMessage(null), 3000);
    } catch (error) {
      console.error(
        "Error loading system health data from offline storage:",
        error,
      );
      setAlertMessage(
        t("administration.systemHealth.errors.loadOfflineFailed"),
      );
    }
  };

  // System health score
  const healthScore = calculateSystemHealthScore();

  return (
    <div className="space-y-4 p-4 bg-white dark:bg-gray-900 rounded-lg">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">
            {t("administration.systemHealth.title")}
          </h2>
          <p className="text-muted-foreground">
            {t("administration.systemHealth.description")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isOfflineMode && (
            <Badge
              variant="outline"
              className="flex items-center gap-1 bg-amber-100 text-amber-800 border-amber-300"
            >
              <WifiOff className="h-3 w-3" />
              {t("administration.systemHealth.offlineMode")}
            </Badge>
          )}
          {lastSyncTime && (
            <div className="text-sm text-muted-foreground">
              {t("administration.systemHealth.lastSynced")}:{" "}
              {lastSyncTime.toLocaleTimeString()}
            </div>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={refreshSystemHealthData}
            disabled={isLoading || isOfflineMode || syncStatus === "syncing"}
          >
            <RefreshCw
              className={`h-4 w-4 mr-1 ${syncStatus === "syncing" ? "animate-spin" : ""}`}
            />
            {t("administration.systemHealth.refresh")}
          </Button>
          <Button variant="outline" size="sm" onClick={saveForOffline}>
            <HardDrive className="h-4 w-4 mr-1" />
            {t("administration.systemHealth.saveOffline")}
          </Button>
          {isOfflineMode && (
            <Button variant="outline" size="sm" onClick={loadFromOffline}>
              <Database className="h-4 w-4 mr-1" />
              {t("administration.systemHealth.loadOffline")}
            </Button>
          )}
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
            {syncStatus === "error"
              ? t("administration.systemHealth.error")
              : t("administration.systemHealth.information")}
          </AlertTitle>
          <AlertDescription>{alertMessage}</AlertDescription>
        </Alert>
      )}

      {/* Main content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">
            {t("administration.systemHealth.tabs.overview")}
          </TabsTrigger>
          <TabsTrigger value="metrics">
            {t("administration.systemHealth.tabs.metrics")}
          </TabsTrigger>
          <TabsTrigger value="services">
            {t("administration.systemHealth.tabs.services")}
          </TabsTrigger>
          <TabsTrigger value="alerts">
            {t("administration.systemHealth.tabs.alerts")}
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          {/* Health Score */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>
                {t("administration.systemHealth.overview.healthScore")}
              </CardTitle>
              <CardDescription>
                {t(
                  "administration.systemHealth.overview.healthScoreDescription",
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center">
                <div className="text-center">
                  <div
                    className={`text-6xl font-bold ${getHealthScoreColor(
                      healthScore,
                    )}`}
                  >
                    {healthScore}%
                  </div>
                  <div className="mt-2 text-muted-foreground">
                    {healthScore >= 90
                      ? t("administration.systemHealth.overview.healthySystem")
                      : healthScore >= 70
                        ? t(
                            "administration.systemHealth.overview.attentionNeeded",
                          )
                        : t(
                            "administration.systemHealth.overview.criticalIssues",
                          )}
                  </div>
                </div>
              </div>
              <Progress
                value={healthScore}
                max={100}
                className={`mt-4 h-2 ${getHealthScoreColor(healthScore)}`}
              />
            </CardContent>
          </Card>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Metrics Summary */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-sm font-medium">
                    {t("administration.systemHealth.overview.metricsSummary")}
                  </CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {metrics.slice(0, 3).map((metric) => (
                    <div
                      key={metric.id}
                      className="flex justify-between items-center"
                    >
                      <span className="text-sm">{metric.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {metric.value.toFixed(1)}
                          {metric.unit}
                        </span>
                        {getStatusIcon(metric.status)}
                      </div>
                    </div>
                  ))}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full mt-2"
                    onClick={() => setActiveTab("metrics")}
                  >
                    {t("administration.systemHealth.overview.viewAllMetrics")}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Services Summary */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-sm font-medium">
                    {t("administration.systemHealth.overview.servicesSummary")}
                  </CardTitle>
                  <Server className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {services.slice(0, 3).map((service) => (
                    <div
                      key={service.id}
                      className="flex justify-between items-center"
                    >
                      <span className="text-sm">{service.name}</span>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="secondary"
                          className={getStatusColor(service.status)}
                        >
                          {service.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full mt-2"
                    onClick={() => setActiveTab("services")}
                  >
                    {t("administration.systemHealth.overview.viewAllServices")}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Alerts Summary */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-sm font-medium">
                    {t("administration.systemHealth.overview.alertsSummary")}
                  </CardTitle>
                  <Bell className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {alerts
                    .filter((alert) => !alert.isResolved)
                    .slice(0, 3)
                    .map((alert) => (
                      <div
                        key={alert.id}
                        className="flex justify-between items-center"
                      >
                        <span className="text-sm truncate max-w-[180px]">
                          {alert.title}
                        </span>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant="secondary"
                            className={
                              alert.severity === "critical"
                                ? "bg-red-500 hover:bg-red-600"
                                : alert.severity === "warning"
                                  ? "bg-amber-500 hover:bg-amber-600"
                                  : "bg-blue-500 hover:bg-blue-600"
                            }
                          >
                            {alert.severity}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full mt-2"
                    onClick={() => setActiveTab("alerts")}
                  >
                    {t("administration.systemHealth.overview.viewAllAlerts")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* System Health Chart */}
          <Card>
            <CardHeader>
              <CardTitle>
                {t("administration.systemHealth.overview.systemHealthTrend")}
              </CardTitle>
              <CardDescription>
                {t(
                  "administration.systemHealth.overview.systemHealthTrendDescription",
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {metrics.length > 0 && (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={formatMetricDataForChart(metrics[0])}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="value"
                        name={metrics[0].name}
                        stroke="#8884d8"
                        activeDot={{ r: 8 }}
                      />
                      {metrics.length > 1 && (
                        <Line
                          type="monotone"
                          dataKey="value"
                          name={metrics[1].name}
                          stroke="#82ca9d"
                          data={formatMetricDataForChart(metrics[1])}
                        />
                      )}
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Metrics Tab */}
        <TabsContent value="metrics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {metrics.map((metric) => (
              <Card key={metric.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-sm font-medium">
                      {metric.name}
                    </CardTitle>
                    {getStatusIcon(metric.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-2xl font-bold">
                      {metric.value.toFixed(1)}
                      {metric.unit}
                    </span>
                    <Badge
                      variant="secondary"
                      className={getStatusColor(metric.status)}
                    >
                      {metric.status}
                    </Badge>
                  </div>
                  <div className="h-[150px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={formatMetricDataForChart(metric)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
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
            ))}
          </div>
        </TabsContent>

        {/* Services Tab */}
        <TabsContent value="services" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.map((service) => (
              <Card key={service.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-sm font-medium">
                      {service.name}
                    </CardTitle>
                    <Badge
                      variant="secondary"
                      className={getStatusColor(service.status)}
                    >
                      {service.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        {t("administration.systemHealth.services.uptime")}:
                      </span>
                      <span className="font-medium">
                        {formatUptime(service.uptime)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">
                        {t("administration.systemHealth.services.lastChecked")}:
                      </span>
                      <span>{formatRelativeTime(service.lastChecked)}</span>
                    </div>
                    {service.responseTime !== undefined && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">
                          {t(
                            "administration.systemHealth.services.responseTime",
                          )}
                          :
                        </span>
                        <span>{service.responseTime.toFixed(0)} ms</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">
              {t("administration.systemHealth.alerts.activeAlerts")}
            </h3>
            <Button variant="outline" size="sm">
              <Bell className="h-4 w-4 mr-2" />
              {t("administration.systemHealth.alerts.configureAlerts")}
            </Button>
          </div>

          {/* Active Alerts */}
          <div className="space-y-2">
            {alerts
              .filter((alert) => !alert.isResolved)
              .map((alert) => (
                <Card key={alert.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      {alert.severity === "critical" ? (
                        <XCircle className="h-5 w-5 text-red-500 mt-1" />
                      ) : alert.severity === "warning" ? (
                        <AlertTriangle className="h-5 w-5 text-amber-500 mt-1" />
                      ) : (
                        <InfoIcon className="h-5 w-5 text-blue-500 mt-1" />
                      )}
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h4 className="font-medium">{alert.title}</h4>
                          <Badge
                            variant="secondary"
                            className={
                              alert.severity === "critical"
                                ? "bg-red-500 hover:bg-red-600"
                                : alert.severity === "warning"
                                  ? "bg-amber-500 hover:bg-amber-600"
                                  : "bg-blue-500 hover:bg-blue-600"
                            }
                          >
                            {alert.severity}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {alert.description}
                        </p>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-xs text-muted-foreground">
                            {formatRelativeTime(alert.timestamp)}
                          </span>
                          <Button variant="ghost" size="sm">
                            {t(
                              "administration.systemHealth.alerts.acknowledge",
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

            {alerts.filter((alert) => !alert.isResolved).length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-green-500" />
                <p>{t("administration.systemHealth.alerts.noActiveAlerts")}</p>
              </div>
            )}
          </div>

          <Separator className="my-4" />

          {/* Resolved Alerts */}
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">
              {t("administration.systemHealth.alerts.resolvedAlerts")}
            </h3>
          </div>

          <div className="space-y-2">
            {alerts
              .filter((alert) => alert.isResolved)
              .map((alert) => (
                <Card key={alert.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-1" />
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <h4 className="font-medium">{alert.title}</h4>
                          <Badge variant="outline">
                            {t("administration.systemHealth.alerts.resolved")}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {alert.description}
                        </p>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-xs text-muted-foreground">
                            {t("administration.systemHealth.alerts.resolvedAt")}{" "}
                            {formatRelativeTime(alert.resolvedAt!)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SystemHealthDashboard;
