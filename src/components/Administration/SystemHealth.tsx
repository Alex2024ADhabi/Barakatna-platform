import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Progress } from "../ui/progress";
import {
  Activity,
  Server,
  Database,
  HardDrive,
  Cpu,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";

const SystemHealth = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("overview");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Mock system health data
  const [systemMetrics, setSystemMetrics] = useState({
    cpu: 42,
    memory: 68,
    disk: 57,
    network: 23,
    database: 35,
    apiLatency: 180, // ms
    activeUsers: 127,
    errorRate: 0.8, // percentage
  });

  const [alerts, setAlerts] = useState([
    {
      id: 1,
      severity: "warning",
      message: "Database connection pool nearing capacity",
      timestamp: "2023-10-15 14:32:45",
    },
    {
      id: 2,
      severity: "critical",
      message: "Disk space below 20% on /var/log partition",
      timestamp: "2023-10-15 10:17:22",
    },
    {
      id: 3,
      severity: "info",
      message: "System backup completed successfully",
      timestamp: "2023-10-15 03:00:12",
    },
  ]);

  const refreshData = () => {
    setIsRefreshing(true);

    // Simulate API call delay
    setTimeout(() => {
      // Generate new random values for demonstration
      setSystemMetrics({
        cpu: Math.floor(Math.random() * 60) + 20,
        memory: Math.floor(Math.random() * 40) + 50,
        disk: Math.floor(Math.random() * 30) + 50,
        network: Math.floor(Math.random() * 50) + 10,
        database: Math.floor(Math.random() * 40) + 20,
        apiLatency: Math.floor(Math.random() * 100) + 120,
        activeUsers: Math.floor(Math.random() * 50) + 100,
        errorRate: parseFloat((Math.random() * 2).toFixed(1)),
      });

      setLastUpdated(new Date());
      setIsRefreshing(false);
    }, 1500);
  };

  // Format the timestamp
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  // Get status color based on value
  const getStatusColor = (value: number, threshold1 = 60, threshold2 = 80) => {
    if (value < threshold1) return "text-green-500";
    if (value < threshold2) return "text-amber-500";
    return "text-red-500";
  };

  // Get alert color based on severity
  const getAlertColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-300";
      case "warning":
        return "bg-amber-100 text-amber-800 border-amber-300";
      case "info":
        return "bg-blue-100 text-blue-800 border-blue-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  return (
    <div className="space-y-6 bg-white">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{t("administration.systemHealth.title")}</CardTitle>
            <CardDescription>
              {t("administration.systemHealth.description")}
            </CardDescription>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {t("administration.systemHealth.lastUpdated")}:{" "}
              {formatTime(lastUpdated)}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={refreshData}
              disabled={isRefreshing}
              className="flex items-center gap-1"
            >
              <RefreshCw
                className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
              {t("administration.systemHealth.refresh")}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs
            defaultValue="overview"
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid grid-cols-3 mb-8">
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <Activity className="h-4 w-4" />
                {t("administration.systemHealth.tabs.overview")}
              </TabsTrigger>
              <TabsTrigger
                value="resources"
                className="flex items-center gap-2"
              >
                <Server className="h-4 w-4" />
                {t("administration.systemHealth.tabs.resources")}
              </TabsTrigger>
              <TabsTrigger value="alerts" className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                {t("administration.systemHealth.tabs.alerts")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center">
                      <Cpu
                        className={`h-8 w-8 mb-2 ${getStatusColor(systemMetrics.cpu)}`}
                      />
                      <h3 className="text-lg font-medium">
                        {t("administration.systemHealth.metrics.cpu")}
                      </h3>
                      <div className="text-3xl font-bold mt-2">
                        {systemMetrics.cpu}%
                      </div>
                      <Progress
                        value={systemMetrics.cpu}
                        className="h-2 mt-2"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center">
                      <Server
                        className={`h-8 w-8 mb-2 ${getStatusColor(systemMetrics.memory)}`}
                      />
                      <h3 className="text-lg font-medium">
                        {t("administration.systemHealth.metrics.memory")}
                      </h3>
                      <div className="text-3xl font-bold mt-2">
                        {systemMetrics.memory}%
                      </div>
                      <Progress
                        value={systemMetrics.memory}
                        className="h-2 mt-2"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center">
                      <HardDrive
                        className={`h-8 w-8 mb-2 ${getStatusColor(systemMetrics.disk)}`}
                      />
                      <h3 className="text-lg font-medium">
                        {t("administration.systemHealth.metrics.disk")}
                      </h3>
                      <div className="text-3xl font-bold mt-2">
                        {systemMetrics.disk}%
                      </div>
                      <Progress
                        value={systemMetrics.disk}
                        className="h-2 mt-2"
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center">
                      <Database
                        className={`h-8 w-8 mb-2 ${getStatusColor(systemMetrics.database)}`}
                      />
                      <h3 className="text-lg font-medium">
                        {t("administration.systemHealth.metrics.database")}
                      </h3>
                      <div className="text-3xl font-bold mt-2">
                        {systemMetrics.database}%
                      </div>
                      <Progress
                        value={systemMetrics.database}
                        className="h-2 mt-2"
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium">
                        {t("administration.systemHealth.metrics.apiLatency")}
                      </h3>
                      <span className="text-2xl font-bold">
                        {systemMetrics.apiLatency} ms
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium">
                        {t("administration.systemHealth.metrics.activeUsers")}
                      </h3>
                      <span className="text-2xl font-bold">
                        {systemMetrics.activeUsers}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium">
                        {t("administration.systemHealth.metrics.errorRate")}
                      </h3>
                      <span className="text-2xl font-bold">
                        {systemMetrics.errorRate}%
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="resources" className="space-y-6">
              <div className="grid gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {t("administration.systemHealth.resourceUtilization")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* More detailed resource metrics would go here */}
                      <p className="text-muted-foreground">
                        {t("administration.systemHealth.resourceDetails")}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="alerts" className="space-y-6">
              <div className="grid gap-4">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-4 border rounded-md ${getAlertColor(alert.severity)}`}
                  >
                    <div className="flex justify-between">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5" />
                        <span className="font-medium">{alert.message}</span>
                      </div>
                      <span className="text-sm">{alert.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemHealth;
