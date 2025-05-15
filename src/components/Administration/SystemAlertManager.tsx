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
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";
import { Switch } from "../ui/switch";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Badge } from "../ui/badge";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {
  Bell,
  Plus,
  Trash2,
  Edit,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Users,
  Server,
  Database,
  Activity,
  BarChart3,
  Cpu,
  HardDrive,
  RefreshCw,
  Save,
  Send,
  MessageSquare,
  UserPlus,
  ArrowUpRight,
} from "lucide-react";

interface SystemAlertManagerProps {
  onAlertConfigChange?: (alerts: AlertDefinition[]) => void;
  onAlertStatusChange?: (
    alertId: string,
    isResolved: boolean,
    resolution?: string,
  ) => void;
}

interface AlertDefinition {
  id: string;
  name: string;
  description: string;
  metric: string;
  condition: "above" | "below" | "equal";
  threshold: number;
  severity: "info" | "warning" | "critical";
  enabled: boolean;
  notifyChannels: string[];
  escalationRules: EscalationRule[];
}

interface EscalationRule {
  id: string;
  minutes: number;
  action: "notify" | "repeat" | "escalate";
  notifyUsers?: string[];
  escalateToGroup?: string;
}

interface AlertHistory {
  id: string;
  alertDefinitionId: string;
  alertName: string;
  triggeredAt: Date;
  resolvedAt?: Date;
  value: number;
  threshold: number;
  severity: "info" | "warning" | "critical";
  status: "active" | "acknowledged" | "resolved";
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  resolvedBy?: string;
  resolution?: string;
  escalationLevel: number;
  notifiedUsers: string[];
}

const SystemAlertManager: React.FC<SystemAlertManagerProps> = ({
  onAlertConfigChange,
  onAlertStatusChange,
}) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<string>("definitions");
  const [alertDefinitions, setAlertDefinitions] = useState<AlertDefinition[]>(
    [],
  );
  const [alertHistory, setAlertHistory] = useState<AlertHistory[]>([]);
  const [editingAlert, setEditingAlert] = useState<AlertDefinition | null>(
    null,
  );
  const [isAddDialogOpen, setIsAddDialogOpen] = useState<boolean>(false);
  const [isResolutionDialogOpen, setIsResolutionDialogOpen] =
    useState<boolean>(false);
  const [selectedAlert, setSelectedAlert] = useState<AlertHistory | null>(null);
  const [resolution, setResolution] = useState<string>("");

  // Mock data for alert definitions
  useEffect(() => {
    const mockAlertDefinitions: AlertDefinition[] = [
      {
        id: "alert-def-1",
        name: "High CPU Usage",
        description: "Alert when CPU usage exceeds 80%",
        metric: "cpu_usage",
        condition: "above",
        threshold: 80,
        severity: "warning",
        enabled: true,
        notifyChannels: ["email", "dashboard"],
        escalationRules: [
          {
            id: "esc-1",
            minutes: 15,
            action: "repeat",
          },
          {
            id: "esc-2",
            minutes: 30,
            action: "escalate",
            escalateToGroup: "system-admins",
          },
        ],
      },
      {
        id: "alert-def-2",
        name: "Database Connection Pool",
        description: "Alert when database connections exceed 90% of pool",
        metric: "database_connections",
        condition: "above",
        threshold: 90,
        severity: "critical",
        enabled: true,
        notifyChannels: ["email", "sms", "dashboard"],
        escalationRules: [
          {
            id: "esc-3",
            minutes: 5,
            action: "escalate",
            escalateToGroup: "database-admins",
          },
        ],
      },
      {
        id: "alert-def-3",
        name: "API Response Time",
        description: "Alert when API response time exceeds 500ms",
        metric: "api_response_time",
        condition: "above",
        threshold: 500,
        severity: "warning",
        enabled: true,
        notifyChannels: ["dashboard"],
        escalationRules: [],
      },
      {
        id: "alert-def-4",
        name: "Low Disk Space",
        description: "Alert when disk usage exceeds 85%",
        metric: "disk_usage",
        condition: "above",
        threshold: 85,
        severity: "warning",
        enabled: true,
        notifyChannels: ["email", "dashboard"],
        escalationRules: [
          {
            id: "esc-4",
            minutes: 60,
            action: "escalate",
            escalateToGroup: "system-admins",
          },
        ],
      },
      {
        id: "alert-def-5",
        name: "Error Rate",
        description: "Alert when error rate exceeds 5%",
        metric: "error_rate",
        condition: "above",
        threshold: 5,
        severity: "critical",
        enabled: true,
        notifyChannels: ["email", "sms", "dashboard"],
        escalationRules: [
          {
            id: "esc-5",
            minutes: 10,
            action: "notify",
            notifyUsers: ["admin@example.com", "manager@example.com"],
          },
          {
            id: "esc-6",
            minutes: 30,
            action: "escalate",
            escalateToGroup: "senior-management",
          },
        ],
      },
    ];

    setAlertDefinitions(mockAlertDefinitions);
  }, []);

  // Mock data for alert history
  useEffect(() => {
    const mockAlertHistory: AlertHistory[] = [
      {
        id: "alert-1",
        alertDefinitionId: "alert-def-1",
        alertName: "High CPU Usage",
        triggeredAt: new Date(Date.now() - 35 * 60000), // 35 minutes ago
        value: 87,
        threshold: 80,
        severity: "warning",
        status: "active",
        escalationLevel: 1,
        notifiedUsers: ["admin@example.com"],
      },
      {
        id: "alert-2",
        alertDefinitionId: "alert-def-2",
        alertName: "Database Connection Pool",
        triggeredAt: new Date(Date.now() - 120 * 60000), // 2 hours ago
        resolvedAt: new Date(Date.now() - 100 * 60000), // 1 hour 40 minutes ago
        value: 95,
        threshold: 90,
        severity: "critical",
        status: "resolved",
        acknowledgedBy: "admin@example.com",
        acknowledgedAt: new Date(Date.now() - 115 * 60000),
        resolvedBy: "admin@example.com",
        resolution:
          "Increased connection pool size and optimized database queries.",
        escalationLevel: 2,
        notifiedUsers: ["admin@example.com", "dba@example.com"],
      },
      {
        id: "alert-3",
        alertDefinitionId: "alert-def-3",
        alertName: "API Response Time",
        triggeredAt: new Date(Date.now() - 45 * 60000), // 45 minutes ago
        value: 620,
        threshold: 500,
        severity: "warning",
        status: "acknowledged",
        acknowledgedBy: "developer@example.com",
        acknowledgedAt: new Date(Date.now() - 40 * 60000),
        escalationLevel: 0,
        notifiedUsers: ["developer@example.com"],
      },
      {
        id: "alert-4",
        alertDefinitionId: "alert-def-5",
        alertName: "Error Rate",
        triggeredAt: new Date(Date.now() - 15 * 60000), // 15 minutes ago
        value: 8.5,
        threshold: 5,
        severity: "critical",
        status: "active",
        escalationLevel: 1,
        notifiedUsers: ["admin@example.com", "manager@example.com"],
      },
    ];

    setAlertHistory(mockAlertHistory);
  }, []);

  // Handle alert definition changes
  useEffect(() => {
    if (onAlertConfigChange) {
      onAlertConfigChange(alertDefinitions);
    }
  }, [alertDefinitions, onAlertConfigChange]);

  // Add new alert definition
  const handleAddAlert = (alert: AlertDefinition) => {
    const newAlertDefinitions = [...alertDefinitions, alert];
    setAlertDefinitions(newAlertDefinitions);
    setIsAddDialogOpen(false);
  };

  // Update existing alert definition
  const handleUpdateAlert = (alert: AlertDefinition) => {
    const newAlertDefinitions = alertDefinitions.map((a) =>
      a.id === alert.id ? alert : a,
    );
    setAlertDefinitions(newAlertDefinitions);
    setEditingAlert(null);
  };

  // Delete alert definition
  const handleDeleteAlert = (id: string) => {
    const newAlertDefinitions = alertDefinitions.filter((a) => a.id !== id);
    setAlertDefinitions(newAlertDefinitions);
  };

  // Toggle alert enabled/disabled
  const handleToggleAlertEnabled = (id: string, enabled: boolean) => {
    const newAlertDefinitions = alertDefinitions.map((a) =>
      a.id === id ? { ...a, enabled } : a,
    );
    setAlertDefinitions(newAlertDefinitions);
  };

  // Acknowledge alert
  const handleAcknowledgeAlert = (id: string) => {
    const newAlertHistory = alertHistory.map((a) =>
      a.id === id
        ? {
            ...a,
            status: "acknowledged",
            acknowledgedBy: "current-user@example.com",
            acknowledgedAt: new Date(),
          }
        : a,
    );
    setAlertHistory(newAlertHistory);
  };

  // Resolve alert
  const handleResolveAlert = (id: string, resolution: string) => {
    const newAlertHistory = alertHistory.map((a) =>
      a.id === id
        ? {
            ...a,
            status: "resolved",
            resolvedBy: "current-user@example.com",
            resolvedAt: new Date(),
            resolution,
          }
        : a,
    );
    setAlertHistory(newAlertHistory);

    if (onAlertStatusChange) {
      onAlertStatusChange(id, true, resolution);
    }

    setIsResolutionDialogOpen(false);
    setResolution("");
    setSelectedAlert(null);
  };

  // Format date to relative time
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

  // Get status color for badges
  const getStatusColor = (status: string): string => {
    switch (status) {
      case "resolved":
        return "bg-green-500 hover:bg-green-600";
      case "acknowledged":
        return "bg-amber-500 hover:bg-amber-600";
      case "active":
        return "bg-red-500 hover:bg-red-600";
      case "info":
        return "bg-blue-500 hover:bg-blue-600";
      case "warning":
        return "bg-amber-500 hover:bg-amber-600";
      case "critical":
        return "bg-red-500 hover:bg-red-600";
      default:
        return "bg-gray-500 hover:bg-gray-600";
    }
  };

  // Get metric icon
  const getMetricIcon = (metric: string) => {
    switch (metric) {
      case "cpu_usage":
        return <Cpu className="h-4 w-4" />;
      case "memory_usage":
        return <HardDrive className="h-4 w-4" />;
      case "disk_usage":
        return <HardDrive className="h-4 w-4" />;
      case "network_latency":
        return <Activity className="h-4 w-4" />;
      case "database_connections":
        return <Database className="h-4 w-4" />;
      case "api_response_time":
        return <Clock className="h-4 w-4" />;
      case "error_rate":
        return <AlertTriangle className="h-4 w-4" />;
      case "user_activity":
        return <Users className="h-4 w-4" />;
      default:
        return <BarChart3 className="h-4 w-4" />;
    }
  };

  // Get severity icon
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "info":
        return <Bell className="h-4 w-4 text-blue-500" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case "critical":
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  // Alert Definition Form
  const AlertDefinitionForm = ({
    alert,
    onSave,
    onCancel,
  }: {
    alert: AlertDefinition | null;
    onSave: (alert: AlertDefinition) => void;
    onCancel: () => void;
  }) => {
    const isNew = !alert?.id;
    const [formData, setFormData] = useState<AlertDefinition>(
      alert || {
        id: `alert-def-${Date.now()}`,
        name: "",
        description: "",
        metric: "cpu_usage",
        condition: "above",
        threshold: 80,
        severity: "warning",
        enabled: true,
        notifyChannels: ["dashboard"],
        escalationRules: [],
      },
    );

    const handleChange = (field: keyof AlertDefinition, value: any) => {
      setFormData({ ...formData, [field]: value });
    };

    const handleAddEscalationRule = () => {
      const newRule: EscalationRule = {
        id: `esc-${Date.now()}`,
        minutes: 15,
        action: "notify",
        notifyUsers: [],
      };
      setFormData({
        ...formData,
        escalationRules: [...formData.escalationRules, newRule],
      });
    };

    const handleUpdateEscalationRule = (
      index: number,
      field: keyof EscalationRule,
      value: any,
    ) => {
      const updatedRules = [...formData.escalationRules];
      updatedRules[index] = { ...updatedRules[index], [field]: value };
      setFormData({ ...formData, escalationRules: updatedRules });
    };

    const handleRemoveEscalationRule = (index: number) => {
      const updatedRules = [...formData.escalationRules];
      updatedRules.splice(index, 1);
      setFormData({ ...formData, escalationRules: updatedRules });
    };

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSave(formData);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">{t("administration.alerts.name")}</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">
            {t("administration.alerts.description")}
          </Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            rows={2}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="metric">{t("administration.alerts.metric")}</Label>
            <Select
              value={formData.metric}
              onValueChange={(value) => handleChange("metric", value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cpu_usage">CPU Usage</SelectItem>
                <SelectItem value="memory_usage">Memory Usage</SelectItem>
                <SelectItem value="disk_usage">Disk Usage</SelectItem>
                <SelectItem value="network_latency">Network Latency</SelectItem>
                <SelectItem value="database_connections">
                  Database Connections
                </SelectItem>
                <SelectItem value="api_response_time">
                  API Response Time
                </SelectItem>
                <SelectItem value="error_rate">Error Rate</SelectItem>
                <SelectItem value="user_activity">User Activity</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="condition">
              {t("administration.alerts.condition")}
            </Label>
            <Select
              value={formData.condition}
              onValueChange={(value: "above" | "below" | "equal") =>
                handleChange("condition", value)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="above">Above</SelectItem>
                <SelectItem value="below">Below</SelectItem>
                <SelectItem value="equal">Equal</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="threshold">
              {t("administration.alerts.threshold")}
            </Label>
            <Input
              id="threshold"
              type="number"
              value={formData.threshold}
              onChange={(e) =>
                handleChange("threshold", parseFloat(e.target.value))
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="severity">
              {t("administration.alerts.severity")}
            </Label>
            <Select
              value={formData.severity}
              onValueChange={(value: "info" | "warning" | "critical") =>
                handleChange("severity", value)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>{t("administration.alerts.notifyChannels")}</Label>
          <div className="flex flex-wrap gap-2">
            {["email", "sms", "dashboard", "slack"].map((channel) => (
              <div key={channel} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`channel-${channel}`}
                  checked={formData.notifyChannels.includes(channel)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      handleChange("notifyChannels", [
                        ...formData.notifyChannels,
                        channel,
                      ]);
                    } else {
                      handleChange(
                        "notifyChannels",
                        formData.notifyChannels.filter((c) => c !== channel),
                      );
                    }
                  }}
                  className="rounded border-gray-300"
                />
                <Label htmlFor={`channel-${channel}`}>{channel}</Label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label>{t("administration.alerts.escalationRules")}</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddEscalationRule}
            >
              <Plus className="h-4 w-4 mr-1" />
              {t("administration.alerts.addRule")}
            </Button>
          </div>

          {formData.escalationRules.length === 0 ? (
            <div className="text-sm text-muted-foreground">
              {t("administration.alerts.noEscalationRules")}
            </div>
          ) : (
            <div className="space-y-3">
              {formData.escalationRules.map((rule, index) => (
                <div key={rule.id} className="border rounded-md p-3 space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-medium">
                      {t("administration.alerts.escalationRule")} #{index + 1}
                    </h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveEscalationRule(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor={`rule-${index}-minutes`}>
                        {t("administration.alerts.afterMinutes")}
                      </Label>
                      <Input
                        id={`rule-${index}-minutes`}
                        type="number"
                        value={rule.minutes}
                        onChange={(e) =>
                          handleUpdateEscalationRule(
                            index,
                            "minutes",
                            parseInt(e.target.value),
                          )
                        }
                        min="1"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor={`rule-${index}-action`}>
                        {t("administration.alerts.action")}
                      </Label>
                      <Select
                        value={rule.action}
                        onValueChange={(
                          value: "notify" | "repeat" | "escalate",
                        ) => handleUpdateEscalationRule(index, "action", value)}
                      >
                        <SelectTrigger id={`rule-${index}-action`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="notify">Notify Users</SelectItem>
                          <SelectItem value="repeat">
                            Repeat Notification
                          </SelectItem>
                          <SelectItem value="escalate">
                            Escalate to Group
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {rule.action === "notify" && (
                    <div className="space-y-1">
                      <Label htmlFor={`rule-${index}-users`}>
                        {t("administration.alerts.notifyUsers")}
                      </Label>
                      <Input
                        id={`rule-${index}-users`}
                        placeholder="user1@example.com, user2@example.com"
                        value={(rule.notifyUsers || []).join(", ")}
                        onChange={(e) =>
                          handleUpdateEscalationRule(
                            index,
                            "notifyUsers",
                            e.target.value
                              .split(",")
                              .map((email) => email.trim()),
                          )
                        }
                      />
                    </div>
                  )}

                  {rule.action === "escalate" && (
                    <div className="space-y-1">
                      <Label htmlFor={`rule-${index}-group`}>
                        {t("administration.alerts.escalateToGroup")}
                      </Label>
                      <Select
                        value={rule.escalateToGroup || ""}
                        onValueChange={(value) =>
                          handleUpdateEscalationRule(
                            index,
                            "escalateToGroup",
                            value,
                          )
                        }
                      >
                        <SelectTrigger id={`rule-${index}-group`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="system-admins">
                            System Administrators
                          </SelectItem>
                          <SelectItem value="database-admins">
                            Database Administrators
                          </SelectItem>
                          <SelectItem value="developers">Developers</SelectItem>
                          <SelectItem value="senior-management">
                            Senior Management
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-between pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            {t("common.cancel")}
          </Button>
          <Button type="submit">
            {isNew ? t("common.create") : t("common.update")}
          </Button>
        </div>
      </form>
    );
  };

  return (
    <div className="space-y-4 p-4 bg-white dark:bg-gray-900 rounded-lg">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">
            {t("administration.alerts.title")}
          </h2>
          <p className="text-muted-foreground">
            {t("administration.alerts.description")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActiveTab("active")}
          >
            <Bell className="h-4 w-4 mr-1" />
            {t("administration.alerts.activeAlerts")}
            <Badge className="ml-2 bg-red-500">
              {alertHistory.filter((a) => a.status === "active").length}
            </Badge>
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => {
              setEditingAlert(null);
              setIsAddDialogOpen(true);
            }}
          >
            <Plus className="h-4 w-4 mr-1" />
            {t("administration.alerts.createAlert")}
          </Button>
        </div>
      </div>

      {/* Main content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="definitions">
            {t("administration.alerts.definitions")}
          </TabsTrigger>
          <TabsTrigger value="active">
            {t("administration.alerts.activeAlerts")}
            {alertHistory.filter((a) => a.status === "active").length > 0 && (
              <Badge className="ml-2 bg-red-500">
                {alertHistory.filter((a) => a.status === "active").length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="history">
            {t("administration.alerts.alertHistory")}
          </TabsTrigger>
        </TabsList>

        {/* Alert Definitions Tab */}
        <TabsContent value="definitions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>
                {t("administration.alerts.alertDefinitions")}
              </CardTitle>
              <CardDescription>
                {t("administration.alerts.alertDefinitionsDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("administration.alerts.name")}</TableHead>
                    <TableHead>{t("administration.alerts.metric")}</TableHead>
                    <TableHead>
                      {t("administration.alerts.condition")}
                    </TableHead>
                    <TableHead>{t("administration.alerts.severity")}</TableHead>
                    <TableHead>{t("administration.alerts.enabled")}</TableHead>
                    <TableHead className="text-right">
                      {t("common.actions")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {alertDefinitions.map((alert) => (
                    <TableRow key={alert.id}>
                      <TableCell className="font-medium">
                        {alert.name}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getMetricIcon(alert.metric)}
                          <span>
                            {alert.metric
                              .replace("_", " ")
                              .replace(/\b\w/g, (l) => l.toUpperCase())}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {alert.condition} {alert.threshold}
                        {alert.metric === "cpu_usage" ||
                        alert.metric === "memory_usage" ||
                        alert.metric === "disk_usage"
                          ? "%"
                          : ""}
                        {alert.metric === "api_response_time" ? "ms" : ""}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(alert.severity)}>
                          {alert.severity}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={alert.enabled}
                          onCheckedChange={(checked) =>
                            handleToggleAlertEnabled(alert.id, checked)
                          }
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingAlert(alert)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteAlert(alert.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Active Alerts Tab */}
        <TabsContent value="active" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("administration.alerts.activeAlerts")}</CardTitle>
              <CardDescription>
                {t("administration.alerts.activeAlertsDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {alertHistory.filter((alert) => alert.status === "active")
                .length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-green-500" />
                  <p className="text-lg font-medium">
                    {t("administration.alerts.noActiveAlerts")}
                  </p>
                  <p className="text-muted-foreground">
                    {t("administration.alerts.allSystemsNormal")}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {alertHistory
                    .filter((alert) => alert.status === "active")
                    .map((alert) => (
                      <Card key={alert.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            {getSeverityIcon(alert.severity)}
                            <div className="flex-1">
                              <div className="flex justify-between items-start">
                                <h4 className="font-medium">
                                  {alert.alertName}
                                </h4>
                                <Badge
                                  className={getStatusColor(alert.severity)}
                                >
                                  {alert.severity}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                {alert.metric
                                  .replace("_", " ")
                                  .replace(/\b\w/g, (l) => l.toUpperCase())}
                                :{" "}
                                <span className="font-medium">
                                  {alert.value}
                                  {alert.metric === "cpu_usage" ||
                                  alert.metric === "memory_usage" ||
                                  alert.metric === "disk_usage"
                                    ? "%"
                                    : ""}
                                  {alert.metric === "api_response_time"
                                    ? "ms"
                                    : ""}
                                </span>{" "}
                                (Threshold: {alert.threshold}
                                {alert.metric === "cpu_usage" ||
                                alert.metric === "memory_usage" ||
                                alert.metric === "disk_usage"
                                  ? "%"
                                  : ""}
                                {alert.metric === "api_response_time"
                                  ? "ms"
                                  : ""}
                                )
                              </p>
                              <div className="flex justify-between items-center mt-2">
                                <span className="text-xs text-muted-foreground">
                                  <Clock className="h-3 w-3 inline mr-1" />
                                  {formatRelativeTime(alert.triggeredAt)}
                                </span>
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                      handleAcknowledgeAlert(alert.id)
                                    }
                                  >
                                    {t("administration.alerts.acknowledge")}
                                  </Button>
                                  <Button
                                    variant="default"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedAlert(alert);
                                      setIsResolutionDialogOpen(true);
                                    }}
                                  >
                                    {t("administration.alerts.resolve")}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Alert History Tab */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("administration.alerts.alertHistory")}</CardTitle>
              <CardDescription>
                {t("administration.alerts.alertHistoryDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      {t("administration.alerts.alertName")}
                    </TableHead>
                    <TableHead>{t("administration.alerts.status")}</TableHead>
                    <TableHead>
                      {t("administration.alerts.triggered")}
                    </TableHead>
                    <TableHead>{t("administration.alerts.resolved")}</TableHead>
                    <TableHead className="text-right">
                      {t("common.actions")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {alertHistory.map((alert) => (
                    <TableRow key={alert.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getSeverityIcon(alert.severity)}
                          <span className="font-medium">{alert.alertName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(alert.status)}>
                          {alert.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {formatRelativeTime(alert.triggeredAt)}
                      </TableCell>
                      <TableCell>
                        {alert.resolvedAt
                          ? formatRelativeTime(alert.resolvedAt)
                          : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedAlert(alert);
                            if (alert.status === "active") {
                              setIsResolutionDialogOpen(true);
                            } else if (
                              alert.status === "resolved" &&
                              alert.resolution
                            ) {
                              // Show resolution details
                              alert(alert.resolution);
                            }
                          }}
                        >
                          {alert.status === "active"
                            ? t("administration.alerts.resolve")
                            : t("administration.alerts.details")}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add/Edit Alert Dialog */}
      <Dialog
        open={isAddDialogOpen || editingAlert !== null}
        onOpenChange={(open) => {
          if (!open) {
            setIsAddDialogOpen(false);
            setEditingAlert(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {editingAlert
                ? t("administration.alerts.editAlert")
                : t("administration.alerts.createAlert")}
            </DialogTitle>
            <DialogDescription>
              {t("administration.alerts.alertFormDescription")}
            </DialogDescription>
          </DialogHeader>
          <AlertDefinitionForm
            alert={editingAlert}
            onSave={(alert) => {
              if (editingAlert) {
                handleUpdateAlert(alert);
              } else {
                handleAddAlert(alert);
              }
            }}
            onCancel={() => {
              setIsAddDialogOpen(false);
              setEditingAlert(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Resolution Dialog */}
      <Dialog
        open={isResolutionDialogOpen}
        onOpenChange={setIsResolutionDialogOpen}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{t("administration.alerts.resolveAlert")}</DialogTitle>
            <DialogDescription>
              {t("administration.alerts.resolveAlertDescription")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="resolution">
                {t("administration.alerts.resolution")}
              </Label>
              <Textarea
                id="resolution"
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                placeholder={t("administration.alerts.resolutionPlaceholder")}
                rows={4}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsResolutionDialogOpen(false);
                setResolution("");
                setSelectedAlert(null);
              }}
            >
              {t("common.cancel")}
            </Button>
            <Button
              onClick={() => {
                if (selectedAlert) {
                  handleResolveAlert(selectedAlert.id, resolution);
                }
              }}
              disabled={!resolution.trim()}
            >
              {t("administration.alerts.markAsResolved")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SystemAlertManager;
