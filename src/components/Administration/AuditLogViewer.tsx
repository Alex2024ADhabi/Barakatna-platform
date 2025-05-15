import React, { useState, useEffect, useRef } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Label } from "../ui/label";
import {
  Search,
  Download,
  Filter,
  Calendar,
  RefreshCw,
  FileText,
  Shield,
  Clock,
  User,
  Link,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  Eye,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "../ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar as CalendarComponent } from "../ui/calendar";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Checkbox } from "../ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { Badge } from "../ui/badge";
import { AuditAction, EntityType } from "../../lib/api/core/types";

interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  userId: string;
  action: string;
  module: string;
  entityType: string;
  entityId: string;
  details: string;
  ipAddress: string;
  userAgent?: string;
  status: "success" | "failure";
  severity?: "low" | "medium" | "high" | "critical";
  relatedLogs?: string[];
  chainOfCustody?: ChainOfCustodyEntry[];
}

interface ChainOfCustodyEntry {
  timestamp: string;
  user: string;
  action: string;
  details: string;
}

interface SecurityEvent {
  id: string;
  timestamp: string;
  eventType: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  status: "active" | "resolved";
  ipAddress: string;
  affectedUser?: string;
}

interface UserActivity {
  userId: string;
  username: string;
  activities: {
    timestamp: string;
    action: string;
    module: string;
    details: string;
  }[];
}

const AuditLogViewer = () => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [moduleFilter, setModuleFilter] = useState<string>("all");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [entityTypeFilter, setEntityTypeFilter] = useState<string>("all");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [userFilter, setUserFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);
  const [activeTab, setActiveTab] = useState("audit-logs");
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [exportFormat, setExportFormat] = useState<"csv" | "pdf" | "json">(
    "csv",
  );
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [userActivities, setUserActivities] = useState<
    Record<string, UserActivity>
  >({});
  const csvLinkRef = useRef<HTMLAnchorElement>(null);

  // Mock data - would be replaced with API calls
  const [logs, setLogs] = useState<AuditLog[]>([
    {
      id: "1",
      timestamp: "2023-10-15 14:30:22",
      user: "Ahmed Al-Farsi",
      userId: "user-001",
      action: "login",
      module: "Authentication",
      entityType: "user",
      entityId: "user-001",
      details: "User logged in successfully",
      ipAddress: "192.168.1.1",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      status: "success",
      severity: "low",
      chainOfCustody: [
        {
          timestamp: "2023-10-15 14:30:22",
          user: "System",
          action: "record_created",
          details: "Audit log entry created",
        },
      ],
    },
    {
      id: "2",
      timestamp: "2023-10-15 14:35:10",
      user: "Ahmed Al-Farsi",
      userId: "user-001",
      action: "view",
      module: "Assessment",
      entityType: "assessment",
      entityId: "ASM-2023-001",
      details: "Viewed assessment ID: ASM-2023-001",
      ipAddress: "192.168.1.1",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      status: "success",
      severity: "low",
      chainOfCustody: [
        {
          timestamp: "2023-10-15 14:35:10",
          user: "System",
          action: "record_created",
          details: "Audit log entry created",
        },
      ],
    },
    {
      id: "3",
      timestamp: "2023-10-15 14:40:05",
      user: "Ahmed Al-Farsi",
      userId: "user-001",
      action: "update",
      module: "Assessment",
      entityType: "assessment",
      entityId: "ASM-2023-001",
      details: "Updated assessment ID: ASM-2023-001",
      ipAddress: "192.168.1.1",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      status: "success",
      severity: "medium",
      relatedLogs: ["2"],
      chainOfCustody: [
        {
          timestamp: "2023-10-15 14:40:05",
          user: "System",
          action: "record_created",
          details: "Audit log entry created",
        },
        {
          timestamp: "2023-10-15 14:40:10",
          user: "System",
          action: "record_verified",
          details: "Audit log entry verified",
        },
      ],
    },
    {
      id: "4",
      timestamp: "2023-10-15 15:10:30",
      user: "Fatima Khalid",
      userId: "user-002",
      action: "login",
      module: "Authentication",
      entityType: "user",
      entityId: "user-002",
      details: "User logged in successfully",
      ipAddress: "192.168.1.2",
      userAgent:
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      status: "success",
      severity: "low",
      chainOfCustody: [
        {
          timestamp: "2023-10-15 15:10:30",
          user: "System",
          action: "record_created",
          details: "Audit log entry created",
        },
      ],
    },
    {
      id: "5",
      timestamp: "2023-10-15 15:15:45",
      user: "Fatima Khalid",
      userId: "user-002",
      action: "create",
      module: "Beneficiary",
      entityType: "beneficiary",
      entityId: "BEN-2023-042",
      details: "Created new beneficiary ID: BEN-2023-042",
      ipAddress: "192.168.1.2",
      userAgent:
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      status: "success",
      severity: "medium",
      chainOfCustody: [
        {
          timestamp: "2023-10-15 15:15:45",
          user: "System",
          action: "record_created",
          details: "Audit log entry created",
        },
        {
          timestamp: "2023-10-15 15:15:50",
          user: "System",
          action: "record_verified",
          details: "Audit log entry verified",
        },
      ],
    },
    {
      id: "6",
      timestamp: "2023-10-15 15:30:12",
      user: "Mohammed Al-Saud",
      userId: "user-003",
      action: "login",
      module: "Authentication",
      entityType: "user",
      entityId: "user-003",
      details: "Failed login attempt",
      ipAddress: "192.168.1.3",
      userAgent:
        "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15",
      status: "failure",
      severity: "high",
      chainOfCustody: [
        {
          timestamp: "2023-10-15 15:30:12",
          user: "System",
          action: "record_created",
          details: "Audit log entry created",
        },
        {
          timestamp: "2023-10-15 15:30:15",
          user: "System",
          action: "security_alert_triggered",
          details: "Security alert triggered due to failed login",
        },
      ],
    },
    {
      id: "7",
      timestamp: "2023-10-15 15:32:08",
      user: "Mohammed Al-Saud",
      userId: "user-003",
      action: "login",
      module: "Authentication",
      entityType: "user",
      entityId: "user-003",
      details: "User logged in successfully",
      ipAddress: "192.168.1.3",
      userAgent:
        "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15",
      status: "success",
      severity: "low",
      relatedLogs: ["6"],
      chainOfCustody: [
        {
          timestamp: "2023-10-15 15:32:08",
          user: "System",
          action: "record_created",
          details: "Audit log entry created",
        },
      ],
    },
    {
      id: "8",
      timestamp: "2023-10-15 15:40:22",
      user: "Mohammed Al-Saud",
      userId: "user-003",
      action: "update",
      module: "Project",
      entityType: "project",
      entityId: "PRJ-2023-015",
      details: "Updated project ID: PRJ-2023-015",
      ipAddress: "192.168.1.3",
      userAgent:
        "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15",
      status: "success",
      severity: "medium",
      chainOfCustody: [
        {
          timestamp: "2023-10-15 15:40:22",
          user: "System",
          action: "record_created",
          details: "Audit log entry created",
        },
        {
          timestamp: "2023-10-15 15:40:25",
          user: "System",
          action: "record_verified",
          details: "Audit log entry verified",
        },
      ],
    },
    {
      id: "9",
      timestamp: "2023-10-15 16:05:18",
      user: "Admin System",
      userId: "system-001",
      action: "delete",
      module: "User Management",
      entityType: "user",
      entityId: "user-004",
      details: "Deleted inactive user account: user-004",
      ipAddress: "192.168.1.10",
      userAgent: "System Service",
      status: "success",
      severity: "critical",
      chainOfCustody: [
        {
          timestamp: "2023-10-15 16:05:18",
          user: "System",
          action: "record_created",
          details: "Audit log entry created",
        },
        {
          timestamp: "2023-10-15 16:05:20",
          user: "System",
          action: "admin_notification_sent",
          details: "Admin notification sent for critical action",
        },
        {
          timestamp: "2023-10-15 16:05:25",
          user: "System",
          action: "record_verified",
          details: "Audit log entry verified",
        },
      ],
    },
    {
      id: "10",
      timestamp: "2023-10-15 16:30:45",
      user: "Fatima Khalid",
      userId: "user-002",
      action: "export",
      module: "Reporting",
      entityType: "report",
      entityId: "REP-2023-089",
      details: "Exported sensitive beneficiary data report",
      ipAddress: "192.168.1.2",
      userAgent:
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      status: "success",
      severity: "high",
      chainOfCustody: [
        {
          timestamp: "2023-10-15 16:30:45",
          user: "System",
          action: "record_created",
          details: "Audit log entry created",
        },
        {
          timestamp: "2023-10-15 16:30:50",
          user: "System",
          action: "data_access_logged",
          details: "Sensitive data access logged",
        },
        {
          timestamp: "2023-10-15 16:30:55",
          user: "System",
          action: "record_verified",
          details: "Audit log entry verified",
        },
      ],
    },
  ]);

  // Initialize security events
  useEffect(() => {
    // Mock security events data
    setSecurityEvents([
      {
        id: "sec-001",
        timestamp: "2023-10-15 15:30:15",
        eventType: "failed_login_attempt",
        description: "Multiple failed login attempts detected",
        severity: "medium",
        status: "resolved",
        ipAddress: "192.168.1.3",
        affectedUser: "Mohammed Al-Saud",
      },
      {
        id: "sec-002",
        timestamp: "2023-10-15 16:05:20",
        eventType: "user_deletion",
        description: "User account deleted by admin",
        severity: "high",
        status: "resolved",
        ipAddress: "192.168.1.10",
      },
      {
        id: "sec-003",
        timestamp: "2023-10-15 16:30:50",
        eventType: "sensitive_data_access",
        description: "Export of sensitive beneficiary data",
        severity: "high",
        status: "active",
        ipAddress: "192.168.1.2",
        affectedUser: "Fatima Khalid",
      },
      {
        id: "sec-004",
        timestamp: "2023-10-15 17:15:30",
        eventType: "unusual_access_pattern",
        description: "Unusual access pattern detected from new location",
        severity: "medium",
        status: "active",
        ipAddress: "203.0.113.45",
        affectedUser: "Ahmed Al-Farsi",
      },
      {
        id: "sec-005",
        timestamp: "2023-10-15 18:22:10",
        eventType: "permission_escalation",
        description: "Attempted permission escalation detected",
        severity: "critical",
        status: "active",
        ipAddress: "198.51.100.78",
      },
    ]);
  }, []);

  // Process user activities for timeline view
  useEffect(() => {
    const activities: Record<string, UserActivity> = {};

    logs.forEach((log) => {
      if (!activities[log.userId]) {
        activities[log.userId] = {
          userId: log.userId,
          username: log.user,
          activities: [],
        };
      }

      activities[log.userId].activities.push({
        timestamp: log.timestamp,
        action: log.action,
        module: log.module,
        details: log.details,
      });
    });

    // Sort activities by timestamp
    Object.values(activities).forEach((user) => {
      user.activities.sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      );
    });

    setUserActivities(activities);
  }, [logs]);

  // Get unique values for filters
  const modules = ["all", ...new Set(logs.map((log) => log.module))];
  const actions = ["all", ...new Set(logs.map((log) => log.action))];
  const entityTypes = ["all", ...new Set(logs.map((log) => log.entityType))];
  const severities = ["all", "low", "medium", "high", "critical"];
  const users = ["all", ...new Set(logs.map((log) => log.user))];

  const handleRefresh = () => {
    // Refresh logs logic would go here
    console.log("Refreshing logs");
  };

  const handleExport = () => {
    // Export logs logic based on selected format
    console.log(`Exporting logs in ${exportFormat} format`);

    // Generate report title with date range
    const dateRangeText =
      dateFrom && dateTo
        ? `_${format(dateFrom, "yyyy-MM-dd")}_to_${format(dateTo, "yyyy-MM-dd")}`
        : "";

    const reportTitle = `audit_logs${dateRangeText}_${new Date().toISOString().slice(0, 10)}`;

    if (exportFormat === "csv") {
      // Generate CSV content
      const headers = [
        "ID",
        "Timestamp",
        "User",
        "User ID",
        "Action",
        "Module",
        "Entity Type",
        "Entity ID",
        "Details",
        "IP Address",
        "Status",
        "Severity",
      ];
      const csvContent = [
        headers.join(","),
        ...filteredLogs.map((log) =>
          [
            log.id,
            log.timestamp,
            log.user,
            log.userId,
            log.action,
            log.module,
            log.entityType,
            log.entityId,
            `"${log.details.replace(/"/g, '""')}"`,
            log.ipAddress,
            log.status,
            log.severity || "",
          ].join(","),
        ),
      ].join("\n");

      // Create download link
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);

      if (csvLinkRef.current) {
        csvLinkRef.current.href = url;
        csvLinkRef.current.download = `${reportTitle}.csv`;
        csvLinkRef.current.click();
      }
    } else if (exportFormat === "pdf") {
      // PDF export would be implemented here
      alert("PDF export would be implemented with a library like jsPDF");
    } else if (exportFormat === "json") {
      // JSON export with additional metadata
      const exportData = {
        metadata: {
          exportDate: new Date().toISOString(),
          totalRecords: filteredLogs.length,
          filters: {
            searchTerm,
            moduleFilter,
            actionFilter,
            statusFilter,
            entityTypeFilter,
            severityFilter,
            userFilter,
            dateFrom: dateFrom?.toISOString(),
            dateTo: dateTo?.toISOString(),
          },
          reportType: "Audit Log Export",
        },
        logs: filteredLogs,
      };

      const jsonContent = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonContent], { type: "application/json" });
      const url = URL.createObjectURL(blob);

      if (csvLinkRef.current) {
        csvLinkRef.current.href = url;
        csvLinkRef.current.download = `${reportTitle}.json`;
        csvLinkRef.current.click();
      }
    }
  };

  const toggleLogDetails = (logId: string) => {
    if (expandedLogId === logId) {
      setExpandedLogId(null);
    } else {
      setExpandedLogId(logId);
      const log = logs.find((l) => l.id === logId);
      if (log) setSelectedLog(log);
    }
  };

  const viewLogDetails = (log: AuditLog) => {
    setSelectedLog(log);
  };

  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case "low":
        return "bg-blue-100 text-blue-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "critical":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredLogs = logs.filter((log) => {
    // Text search
    const matchesSearch =
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.ipAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entityId.toLowerCase().includes(searchTerm.toLowerCase());

    // Module filter
    const matchesModule = moduleFilter === "all" || log.module === moduleFilter;

    // Action filter
    const matchesAction = actionFilter === "all" || log.action === actionFilter;

    // Status filter
    const matchesStatus = statusFilter === "all" || log.status === statusFilter;

    // Entity type filter
    const matchesEntityType =
      entityTypeFilter === "all" || log.entityType === entityTypeFilter;

    // Severity filter
    const matchesSeverity =
      severityFilter === "all" || log.severity === severityFilter;

    // User filter
    const matchesUser = userFilter === "all" || log.user === userFilter;

    // Date range filter
    const logDate = new Date(log.timestamp);
    const matchesDateFrom = !dateFrom || logDate >= dateFrom;
    const matchesDateTo = !dateTo || logDate <= dateTo;

    return (
      matchesSearch &&
      matchesModule &&
      matchesAction &&
      matchesStatus &&
      matchesEntityType &&
      matchesSeverity &&
      matchesUser &&
      matchesDateFrom &&
      matchesDateTo
    );
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">
          {t("administration.audit.title")}
        </h2>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            {t("common.refresh")}
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                {t("common.export")}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56">
              <div className="space-y-2">
                <h4 className="font-medium">Export Format</h4>
                <div className="flex flex-col space-y-1">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="csv"
                      checked={exportFormat === "csv"}
                      onCheckedChange={() => setExportFormat("csv")}
                    />
                    <Label htmlFor="csv">CSV</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="pdf"
                      checked={exportFormat === "pdf"}
                      onCheckedChange={() => setExportFormat("pdf")}
                    />
                    <Label htmlFor="pdf">PDF</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="json"
                      checked={exportFormat === "json"}
                      onCheckedChange={() => setExportFormat("json")}
                    />
                    <Label htmlFor="json">JSON</Label>
                  </div>
                </div>
                <Button className="w-full" onClick={handleExport}>
                  Export
                </Button>
              </div>
            </PopoverContent>
          </Popover>
          <a ref={csvLinkRef} style={{ display: "none" }}></a>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="audit-logs" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            {t("administration.audit.tabs.auditLogs")}
          </TabsTrigger>
          <TabsTrigger
            value="security-events"
            className="flex items-center gap-2"
          >
            <Shield className="h-4 w-4" />
            {t("administration.audit.tabs.securityEvents")}
          </TabsTrigger>
          <TabsTrigger
            value="user-activity"
            className="flex items-center gap-2"
          >
            <User className="h-4 w-4" />
            {t("administration.audit.tabs.userActivity")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="audit-logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>{t("administration.audit.filters.title")}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className="flex items-center gap-1"
                >
                  <Filter className="h-4 w-4" />
                  {showAdvancedFilters ? "Hide" : "Show"} Advanced Filters
                  {showAdvancedFilters ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              </CardTitle>
              <CardDescription>
                {t("administration.audit.filters.description")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div className="space-y-2">
                  <Label htmlFor="search">{t("common.search")}</Label>
                  <div className="flex items-center space-x-2">
                    <Search className="h-4 w-4 text-gray-400" />
                    <Input
                      id="search"
                      placeholder={t(
                        "administration.audit.filters.searchPlaceholder",
                      )}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="module">
                    {t("administration.audit.filters.module")}
                  </Label>
                  <Select value={moduleFilter} onValueChange={setModuleFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {modules.map((module) => (
                        <SelectItem key={module} value={module}>
                          {module === "all" ? t("common.all") : module}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="action">
                    {t("administration.audit.filters.action")}
                  </Label>
                  <Select value={actionFilter} onValueChange={setActionFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {actions.map((action) => (
                        <SelectItem key={action} value={action}>
                          {action === "all"
                            ? t("common.all")
                            : t(`administration.audit.actions.${action}`)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">{t("common.status")}</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t("common.all")}</SelectItem>
                      <SelectItem value="success">
                        {t("status.success")}
                      </SelectItem>
                      <SelectItem value="failure">
                        {t("status.failure")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {showAdvancedFilters && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4 pt-4 border-t">
                  <div className="space-y-2">
                    <Label htmlFor="entityType">
                      {t("administration.audit.filters.entityType")}
                    </Label>
                    <Select
                      value={entityTypeFilter}
                      onValueChange={setEntityTypeFilter}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {entityTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type === "all" ? t("common.all") : type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="severity">
                      {t("administration.audit.filters.severity")}
                    </Label>
                    <Select
                      value={severityFilter}
                      onValueChange={setSeverityFilter}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {severities.map((severity) => (
                          <SelectItem key={severity} value={severity}>
                            {severity === "all"
                              ? t("common.all")
                              : t(`severity.${severity}`)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="user">
                      {t("administration.audit.filters.user")}
                    </Label>
                    <Select value={userFilter} onValueChange={setUserFilter}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {users.map((user) => (
                          <SelectItem key={user} value={user}>
                            {user === "all" ? t("common.all") : user}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>{t("administration.audit.filters.dateRange")}</Label>
                    <div className="flex space-x-2">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                          >
                            <Calendar className="mr-2 h-4 w-4" />
                            {dateFrom
                              ? format(dateFrom, "PPP")
                              : t("common.from")}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <CalendarComponent
                            mode="single"
                            selected={dateFrom}
                            onSelect={setDateFrom}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>

                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                          >
                            <Calendar className="mr-2 h-4 w-4" />
                            {dateTo ? format(dateTo, "PPP") : t("common.to")}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <CalendarComponent
                            mode="single"
                            selected={dateTo}
                            onSelect={setDateTo}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10"></TableHead>
                  <TableHead>{t("common.timestamp")}</TableHead>
                  <TableHead>{t("common.user")}</TableHead>
                  <TableHead>{t("common.action")}</TableHead>
                  <TableHead>{t("common.module")}</TableHead>
                  <TableHead>{t("common.entityType")}</TableHead>
                  <TableHead>{t("common.entityId")}</TableHead>
                  <TableHead>{t("common.details")}</TableHead>
                  <TableHead>{t("common.ipAddress")}</TableHead>
                  <TableHead>{t("common.status")}</TableHead>
                  <TableHead>{t("common.severity")}</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.length > 0 ? (
                  filteredLogs.map((log) => (
                    <React.Fragment key={log.id}>
                      <TableRow
                        className={expandedLogId === log.id ? "bg-gray-50" : ""}
                        onClick={() => toggleLogDetails(log.id)}
                      >
                        <TableCell>
                          {expandedLogId === log.id ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </TableCell>
                        <TableCell className="font-mono">
                          {log.timestamp}
                        </TableCell>
                        <TableCell>{log.user}</TableCell>
                        <TableCell>
                          {t(`administration.audit.actions.${log.action}`)}
                        </TableCell>
                        <TableCell>{log.module}</TableCell>
                        <TableCell>{log.entityType}</TableCell>
                        <TableCell>{log.entityId}</TableCell>
                        <TableCell className="max-w-xs truncate">
                          {log.details}
                        </TableCell>
                        <TableCell className="font-mono">
                          {log.ipAddress}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${log.status === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                          >
                            {t(`status.${log.status}`)}
                          </span>
                        </TableCell>
                        <TableCell>
                          {log.severity && (
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${getSeverityColor(log.severity)}`}
                            >
                              {t(`severity.${log.severity}`)}
                            </span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  viewLogDetails(log);
                                }}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-3xl">
                              <DialogHeader>
                                <DialogTitle>Audit Log Details</DialogTitle>
                              </DialogHeader>
                              {selectedLog && (
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <h4 className="text-sm font-medium">
                                        ID
                                      </h4>
                                      <p>{selectedLog.id}</p>
                                    </div>
                                    <div>
                                      <h4 className="text-sm font-medium">
                                        Timestamp
                                      </h4>
                                      <p>{selectedLog.timestamp}</p>
                                    </div>
                                    <div>
                                      <h4 className="text-sm font-medium">
                                        User
                                      </h4>
                                      <p>{selectedLog.user}</p>
                                    </div>
                                    <div>
                                      <h4 className="text-sm font-medium">
                                        User ID
                                      </h4>
                                      <p>{selectedLog.userId}</p>
                                    </div>
                                    <div>
                                      <h4 className="text-sm font-medium">
                                        Action
                                      </h4>
                                      <p>{selectedLog.action}</p>
                                    </div>
                                    <div>
                                      <h4 className="text-sm font-medium">
                                        Module
                                      </h4>
                                      <p>{selectedLog.module}</p>
                                    </div>
                                    <div>
                                      <h4 className="text-sm font-medium">
                                        Entity Type
                                      </h4>
                                      <p>{selectedLog.entityType}</p>
                                    </div>
                                    <div>
                                      <h4 className="text-sm font-medium">
                                        Entity ID
                                      </h4>
                                      <p>{selectedLog.entityId}</p>
                                    </div>
                                    <div className="col-span-2">
                                      <h4 className="text-sm font-medium">
                                        Details
                                      </h4>
                                      <p>{selectedLog.details}</p>
                                    </div>
                                    <div>
                                      <h4 className="text-sm font-medium">
                                        IP Address
                                      </h4>
                                      <p>{selectedLog.ipAddress}</p>
                                    </div>
                                    <div>
                                      <h4 className="text-sm font-medium">
                                        User Agent
                                      </h4>
                                      <p className="truncate">
                                        {selectedLog.userAgent || "N/A"}
                                      </p>
                                    </div>
                                    <div>
                                      <h4 className="text-sm font-medium">
                                        Status
                                      </h4>
                                      <span
                                        className={`px-2 py-1 rounded-full text-xs ${selectedLog.status === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                                      >
                                        {selectedLog.status}
                                      </span>
                                    </div>
                                    <div>
                                      <h4 className="text-sm font-medium">
                                        Severity
                                      </h4>
                                      {selectedLog.severity && (
                                        <span
                                          className={`px-2 py-1 rounded-full text-xs ${getSeverityColor(selectedLog.severity)}`}
                                        >
                                          {selectedLog.severity}
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  {selectedLog.relatedLogs &&
                                    selectedLog.relatedLogs.length > 0 && (
                                      <div>
                                        <h4 className="text-sm font-medium mb-2">
                                          Related Logs
                                        </h4>
                                        <div className="border rounded-md p-2">
                                          <ul className="space-y-1">
                                            {selectedLog.relatedLogs.map(
                                              (relatedLogId) => {
                                                const relatedLog = logs.find(
                                                  (l) => l.id === relatedLogId,
                                                );
                                                return relatedLog ? (
                                                  <li
                                                    key={relatedLogId}
                                                    className="text-sm"
                                                  >
                                                    <span className="font-medium">
                                                      {relatedLog.timestamp}
                                                    </span>{" "}
                                                    - {relatedLog.action} by{" "}
                                                    {relatedLog.user}:{" "}
                                                    {relatedLog.details}
                                                  </li>
                                                ) : null;
                                              },
                                            )}
                                          </ul>
                                        </div>
                                      </div>
                                    )}

                                  {selectedLog.chainOfCustody &&
                                    selectedLog.chainOfCustody.length > 0 && (
                                      <div>
                                        <h4 className="text-sm font-medium mb-2">
                                          Chain of Custody
                                        </h4>
                                        <div className="border rounded-md p-2">
                                          <ul className="space-y-1">
                                            {selectedLog.chainOfCustody.map(
                                              (entry, index) => (
                                                <li
                                                  key={index}
                                                  className="text-sm"
                                                >
                                                  <span className="font-medium">
                                                    {entry.timestamp}
                                                  </span>{" "}
                                                  - {entry.action} by{" "}
                                                  {entry.user}: {entry.details}
                                                </li>
                                              ),
                                            )}
                                          </ul>
                                        </div>
                                      </div>
                                    )}
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                        </TableCell>
                      </TableRow>
                      {expandedLogId === log.id && (
                        <TableRow>
                          <TableCell colSpan={12} className="bg-gray-50 p-4">
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h4 className="text-sm font-medium">
                                    User Agent
                                  </h4>
                                  <p className="text-sm">
                                    {log.userAgent || "N/A"}
                                  </p>
                                </div>
                                {log.severity && (
                                  <div>
                                    <h4 className="text-sm font-medium">
                                      Severity
                                    </h4>
                                    <span
                                      className={`px-2 py-1 rounded-full text-xs ${getSeverityColor(log.severity)}`}
                                    >
                                      {log.severity}
                                    </span>
                                  </div>
                                )}
                              </div>

                              {log.relatedLogs &&
                                log.relatedLogs.length > 0 && (
                                  <div>
                                    <h4 className="text-sm font-medium mb-2">
                                      Related Logs
                                    </h4>
                                    <div className="border rounded-md p-2">
                                      <ul className="space-y-1">
                                        {log.relatedLogs.map((relatedLogId) => {
                                          const relatedLog = logs.find(
                                            (l) => l.id === relatedLogId,
                                          );
                                          return relatedLog ? (
                                            <li
                                              key={relatedLogId}
                                              className="text-sm"
                                            >
                                              <span className="font-medium">
                                                {relatedLog.timestamp}
                                              </span>{" "}
                                              - {relatedLog.action} by{" "}
                                              {relatedLog.user}:{" "}
                                              {relatedLog.details}
                                            </li>
                                          ) : null;
                                        })}
                                      </ul>
                                    </div>
                                  </div>
                                )}

                              {log.chainOfCustody &&
                                log.chainOfCustody.length > 0 && (
                                  <div>
                                    <h4 className="text-sm font-medium mb-2">
                                      Chain of Custody
                                    </h4>
                                    <div className="border rounded-md p-2">
                                      <ul className="space-y-1">
                                        {log.chainOfCustody.map(
                                          (entry, index) => (
                                            <li key={index} className="text-sm">
                                              <span className="font-medium">
                                                {entry.timestamp}
                                              </span>{" "}
                                              - {entry.action} by {entry.user}:{" "}
                                              {entry.details}
                                            </li>
                                          ),
                                        )}
                                      </ul>
                                    </div>
                                  </div>
                                )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={12} className="text-center py-4">
                      {t("common.noResults")}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="security-events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Events</CardTitle>
              <CardDescription>
                Monitor security-related events and potential threats
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Event Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>IP Address</TableHead>
                      <TableHead>Affected User</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {securityEvents.map((event) => (
                      <TableRow key={event.id}>
                        <TableCell className="font-mono">
                          {event.timestamp}
                        </TableCell>
                        <TableCell>
                          {event.eventType.replace(/_/g, " ")}
                        </TableCell>
                        <TableCell>{event.description}</TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${getSeverityColor(event.severity)}`}
                          >
                            {event.severity}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${event.status === "active" ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}
                          >
                            {event.status}
                          </span>
                        </TableCell>
                        <TableCell className="font-mono">
                          {event.ipAddress}
                        </TableCell>
                        <TableCell>{event.affectedUser || "N/A"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="user-activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Activity Timeline</CardTitle>
              <CardDescription>
                View chronological activity for each user
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {Object.values(userActivities).map((userActivity) => (
                  <div
                    key={userActivity.userId}
                    className="border rounded-md p-4"
                  >
                    <h3 className="text-lg font-medium mb-4 flex items-center">
                      <User className="h-5 w-5 mr-2" />
                      {userActivity.username}
                    </h3>
                    <div className="relative pl-6 border-l-2 border-gray-200 space-y-4">
                      {userActivity.activities.map((activity, index) => (
                        <div key={index} className="relative">
                          <div className="absolute -left-[25px] mt-1 w-4 h-4 rounded-full bg-primary"></div>
                          <div className="mb-1 text-sm text-gray-500">
                            {activity.timestamp}
                          </div>
                          <div className="flex items-center">
                            <Badge className="mr-2">{activity.action}</Badge>
                            <span className="text-sm font-medium">
                              {activity.module}
                            </span>
                          </div>
                          <p className="text-sm">{activity.details}</p>
                        </div>
                      ))}
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
};

export default AuditLogViewer;
