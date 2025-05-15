import React, { useState, useEffect } from "react";
import { Bug, Activity, BarChart, RefreshCw, Wifi } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useTranslation } from "react-i18next";

interface MobileDebugToolsProps {
  initialEnabled?: boolean;
  onSettingsChange?: (settings: MobileDebugSettings) => void;
}

export interface MobileDebugSettings {
  enabled: boolean;
  verboseLogging: boolean;
  performanceMonitoring: boolean;
  errorReporting: boolean;
  syncDiagnostics: boolean;
  usageAnalytics: boolean;
}

interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  status: "good" | "warning" | "critical";
}

const MobileDebugTools: React.FC<MobileDebugToolsProps> = ({
  initialEnabled = false,
  onSettingsChange = () => {},
}) => {
  const { t } = useTranslation();
  const [settings, setSettings] = useState<MobileDebugSettings>({
    enabled: initialEnabled,
    verboseLogging: false,
    performanceMonitoring: true,
    errorReporting: true,
    syncDiagnostics: true,
    usageAnalytics: false,
  });

  const [metrics, setMetrics] = useState<PerformanceMetric[]>([
    { name: "Memory Usage", value: 45, unit: "%", status: "good" },
    { name: "CPU Usage", value: 22, unit: "%", status: "good" },
    { name: "Battery Drain", value: 3, unit: "%/hr", status: "good" },
    { name: "Network Latency", value: 120, unit: "ms", status: "warning" },
  ]);

  const [logs, setLogs] = useState<string[]>([]);

  // Enable/disable debug tools
  useEffect(() => {
    if (settings.enabled) {
      if (settings.verboseLogging) {
        addLog("Verbose logging enabled");
      }
      if (settings.performanceMonitoring) {
        startPerformanceMonitoring();
        addLog("Performance monitoring started");
      }
      if (settings.errorReporting) {
        setupErrorReporting();
        addLog("Error reporting enabled");
      }
      if (settings.syncDiagnostics) {
        setupSyncDiagnostics();
        addLog("Sync diagnostics enabled");
      }
      if (settings.usageAnalytics) {
        setupUsageAnalytics();
        addLog("Usage analytics enabled");
      }
    } else {
      addLog("Debug tools disabled");
    }

    // Notify parent component
    onSettingsChange(settings);
  }, [settings, onSettingsChange]);

  // Simulate updating metrics every 3 seconds
  useEffect(() => {
    if (!settings.enabled || !settings.performanceMonitoring) return;

    const interval = setInterval(() => {
      setMetrics((prevMetrics) =>
        prevMetrics.map((metric) => {
          // Simulate some random fluctuation
          let newValue = metric.value + (Math.random() * 6 - 3);

          // Keep within reasonable bounds
          if (metric.name === "Memory Usage" || metric.name === "CPU Usage") {
            newValue = Math.max(5, Math.min(95, newValue));
          } else if (metric.name === "Battery Drain") {
            newValue = Math.max(1, Math.min(10, newValue));
          } else if (metric.name === "Network Latency") {
            newValue = Math.max(50, Math.min(500, newValue));
          }

          // Update status based on new value
          let status: "good" | "warning" | "critical" = "good";
          if (metric.name === "Memory Usage" || metric.name === "CPU Usage") {
            if (newValue > 80) status = "critical";
            else if (newValue > 60) status = "warning";
          } else if (metric.name === "Battery Drain") {
            if (newValue > 7) status = "critical";
            else if (newValue > 5) status = "warning";
          } else if (metric.name === "Network Latency") {
            if (newValue > 300) status = "critical";
            else if (newValue > 150) status = "warning";
          }

          return { ...metric, value: Math.round(newValue * 10) / 10, status };
        }),
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [settings.enabled, settings.performanceMonitoring]);

  const updateSettings = (newSettings: Partial<MobileDebugSettings>) => {
    setSettings((prev) => {
      return { ...prev, ...newSettings };
    });
  };

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prevLogs) => [
      `[${timestamp}] ${message}`,
      ...prevLogs.slice(0, 49), // Keep only the last 50 logs
    ]);
  };

  const startPerformanceMonitoring = () => {
    // In a real app, implement actual performance monitoring
    // This would use the Performance API, memory API, etc.
  };

  const setupErrorReporting = () => {
    // In a real app, set up error reporting service
    window.addEventListener("error", (event) => {
      if (settings.enabled && settings.errorReporting) {
        addLog(`Error: ${event.message}`);
        // In a real app, send to error reporting service
      }
    });
  };

  const setupSyncDiagnostics = () => {
    // In a real app, set up sync diagnostics
    // This would monitor sync operations and report issues
  };

  const setupUsageAnalytics = () => {
    // In a real app, set up usage analytics
    // This would track user interactions and feature usage
  };

  const clearLogs = () => {
    setLogs([]);
    addLog("Logs cleared");
  };

  const simulateError = () => {
    try {
      // Deliberately cause an error for testing
      throw new Error("Test error for debugging");
    } catch (error) {
      if (error instanceof Error) {
        addLog(`Caught error: ${error.message}`);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "good":
        return "text-green-500";
      case "warning":
        return "text-amber-500";
      case "critical":
        return "text-red-500";
      default:
        return "text-gray-500";
    }
  };

  const getProgressColor = (status: string) => {
    switch (status) {
      case "good":
        return "bg-green-500";
      case "warning":
        return "bg-amber-500";
      case "critical":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <Card className="p-6 bg-white dark:bg-gray-800 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div
              className={`p-2 rounded-full mr-3 ${settings.enabled ? "bg-purple-100 dark:bg-purple-900" : "bg-gray-100 dark:bg-gray-700"}`}
            >
              {settings.enabled ? (
                <Bug className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              ) : (
                <Bug className="h-6 w-6 text-gray-500 dark:text-gray-400" />
              )}
            </div>
            <div>
              <h2 className="text-lg font-bold">
                {t("mobileDebug.title", "Mobile Debug Tools")}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t(
                  "mobileDebug.description",
                  "Monitor and troubleshoot mobile app performance",
                )}
              </p>
            </div>
          </div>
          <Switch
            checked={settings.enabled}
            onCheckedChange={(checked) => updateSettings({ enabled: checked })}
          />
        </div>

        <div
          className={`space-y-6 ${!settings.enabled ? "opacity-50 pointer-events-none" : ""}`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Activity className="h-5 w-5 mr-2 text-blue-500" />
              <span className="font-medium">
                {t("mobileDebug.verboseLogging", "Verbose Logging")}
              </span>
            </div>
            <Switch
              checked={settings.verboseLogging}
              onCheckedChange={(checked) =>
                updateSettings({ verboseLogging: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <BarChart className="h-5 w-5 mr-2 text-green-500" />
              <span className="font-medium">
                {t(
                  "mobileDebug.performanceMonitoring",
                  "Performance Monitoring",
                )}
              </span>
            </div>
            <Switch
              checked={settings.performanceMonitoring}
              onCheckedChange={(checked) =>
                updateSettings({ performanceMonitoring: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Bug className="h-5 w-5 mr-2 text-red-500" />
              <span className="font-medium">
                {t("mobileDebug.errorReporting", "Error Reporting")}
              </span>
            </div>
            <Switch
              checked={settings.errorReporting}
              onCheckedChange={(checked) =>
                updateSettings({ errorReporting: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <RefreshCw className="h-5 w-5 mr-2 text-amber-500" />
              <span className="font-medium">
                {t("mobileDebug.syncDiagnostics", "Sync Diagnostics")}
              </span>
            </div>
            <Switch
              checked={settings.syncDiagnostics}
              onCheckedChange={(checked) =>
                updateSettings({ syncDiagnostics: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Wifi className="h-5 w-5 mr-2 text-purple-500" />
              <span className="font-medium">
                {t("mobileDebug.usageAnalytics", "Usage Analytics")}
              </span>
            </div>
            <Switch
              checked={settings.usageAnalytics}
              onCheckedChange={(checked) =>
                updateSettings({ usageAnalytics: checked })
              }
            />
          </div>

          {settings.performanceMonitoring && (
            <div className="mt-6">
              <h3 className="font-medium mb-3">
                {t("mobileDebug.performanceMetrics", "Performance Metrics")}
              </h3>
              <div className="space-y-3">
                {metrics.map((metric, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-sm">{metric.name}</span>
                      <span
                        className={`text-sm font-medium ${getStatusColor(metric.status)}`}
                      >
                        {metric.value} {metric.unit}
                      </span>
                    </div>
                    <Progress
                      value={
                        metric.name === "Network Latency"
                          ? metric.value / 5
                          : metric.value
                      }
                      className={`h-2 ${getProgressColor(metric.status)}`}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {settings.verboseLogging && (
            <div className="mt-6">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-medium">
                  {t("mobileDebug.logs", "Debug Logs")}
                </h3>
                <Button variant="outline" size="sm" onClick={clearLogs}>
                  {t("mobileDebug.clearLogs", "Clear")}
                </Button>
              </div>
              <div className="bg-gray-100 dark:bg-gray-900 rounded-md p-2 h-32 overflow-y-auto text-xs font-mono">
                {logs.length > 0 ? (
                  logs.map((log, index) => (
                    <div key={index} className="py-1">
                      {log}
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500 py-1">
                    {t("mobileDebug.noLogs", "No logs yet")}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex space-x-2 mt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={simulateError}
            >
              {t("mobileDebug.simulateError", "Simulate Error")}
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => addLog("Manual test log entry")}
            >
              {t("mobileDebug.addTestLog", "Add Test Log")}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default MobileDebugTools;
