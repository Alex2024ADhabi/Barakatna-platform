import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "../ui/dialog";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { Checkbox } from "../ui/checkbox";
import {
  Search,
  Download,
  Filter,
  FileText,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Award,
  ChevronDown,
  ChevronRight,
  Eye,
  Plus,
  RefreshCw,
  Calendar,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar as CalendarComponent } from "../ui/calendar";
import { format } from "date-fns";

// Types
interface ComplianceRule {
  id: string;
  name: string;
  description: string;
  category: string;
  framework: string;
  severity: "low" | "medium" | "high" | "critical";
  clientTypes: string[];
  createdAt: string;
  updatedAt: string;
  status: "active" | "inactive";
}

interface ComplianceViolation {
  id: string;
  ruleId: string;
  ruleName: string;
  entityId: string;
  entityType: string;
  description: string;
  detectedAt: string;
  severity: "low" | "medium" | "high" | "critical";
  status: "open" | "in_progress" | "resolved" | "false_positive";
  assignedTo?: string;
  resolvedAt?: string;
  resolutionNotes?: string;
  clientId?: string;
  clientType?: string;
}

interface ComplianceReport {
  id: string;
  title: string;
  description: string;
  generatedAt: string;
  generatedBy: string;
  framework: string;
  clientType?: string;
  clientId?: string;
  status: "draft" | "final" | "archived";
  totalRules: number;
  passedRules: number;
  failedRules: number;
  notApplicable: number;
  score: number;
  findings: string[];
  recommendations: string[];
}

interface ComplianceCertificate {
  id: string;
  title: string;
  issuedAt: string;
  expiresAt: string;
  issuedTo: string;
  issuedBy: string;
  framework: string;
  clientType?: string;
  clientId?: string;
  status: "active" | "expired" | "revoked";
  reportId: string;
  score: number;
}

const ComplianceReporting = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("rules");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [clientTypeFilter, setClientTypeFilter] = useState<string>("all");
  const [frameworkFilter, setFrameworkFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedRule, setSelectedRule] = useState<ComplianceRule | null>(null);
  const [selectedViolation, setSelectedViolation] =
    useState<ComplianceViolation | null>(null);
  const [selectedReport, setSelectedReport] = useState<ComplianceReport | null>(
    null,
  );
  const [selectedCertificate, setSelectedCertificate] =
    useState<ComplianceCertificate | null>(null);

  // Mock data for compliance rules
  const [rules, setRules] = useState<ComplianceRule[]>([
    {
      id: "rule-001",
      name: "Password Complexity",
      description:
        "Passwords must contain at least 8 characters, including uppercase, lowercase, numbers, and special characters.",
      category: "Authentication",
      framework: "HIPAA",
      severity: "high",
      clientTypes: ["FDF", "ADHA", "Cash"],
      createdAt: "2023-09-01",
      updatedAt: "2023-09-01",
      status: "active",
    },
    {
      id: "rule-002",
      name: "Data Encryption at Rest",
      description:
        "All sensitive data must be encrypted when stored using AES-256 encryption.",
      category: "Data Security",
      framework: "HIPAA",
      severity: "critical",
      clientTypes: ["FDF", "ADHA", "Cash"],
      createdAt: "2023-09-01",
      updatedAt: "2023-09-15",
      status: "active",
    },
    {
      id: "rule-003",
      name: "Access Control Logging",
      description:
        "All access to sensitive data must be logged and retained for at least 90 days.",
      category: "Audit",
      framework: "HIPAA",
      severity: "medium",
      clientTypes: ["FDF", "ADHA"],
      createdAt: "2023-09-02",
      updatedAt: "2023-09-02",
      status: "active",
    },
    {
      id: "rule-004",
      name: "Regular Security Assessment",
      description: "Security assessments must be conducted at least quarterly.",
      category: "Security",
      framework: "ISO 27001",
      severity: "medium",
      clientTypes: ["FDF", "ADHA", "Cash"],
      createdAt: "2023-09-03",
      updatedAt: "2023-09-03",
      status: "active",
    },
    {
      id: "rule-005",
      name: "Data Backup",
      description:
        "Data must be backed up daily and stored in a secure, off-site location.",
      category: "Data Management",
      framework: "ISO 27001",
      severity: "high",
      clientTypes: ["FDF", "ADHA", "Cash"],
      createdAt: "2023-09-04",
      updatedAt: "2023-09-04",
      status: "active",
    },
    {
      id: "rule-006",
      name: "Incident Response Plan",
      description:
        "An incident response plan must be documented and tested annually.",
      category: "Security",
      framework: "NIST",
      severity: "high",
      clientTypes: ["FDF", "ADHA"],
      createdAt: "2023-09-05",
      updatedAt: "2023-09-05",
      status: "active",
    },
    {
      id: "rule-007",
      name: "Physical Access Controls",
      description:
        "Physical access to server rooms and data centers must be restricted and logged.",
      category: "Physical Security",
      framework: "NIST",
      severity: "high",
      clientTypes: ["FDF", "ADHA", "Cash"],
      createdAt: "2023-09-06",
      updatedAt: "2023-09-06",
      status: "active",
    },
    {
      id: "rule-008",
      name: "Vendor Risk Assessment",
      description:
        "All third-party vendors must undergo security assessment before engagement.",
      category: "Vendor Management",
      framework: "GDPR",
      severity: "medium",
      clientTypes: ["FDF", "ADHA"],
      createdAt: "2023-09-07",
      updatedAt: "2023-09-07",
      status: "inactive",
    },
  ]);

  // Mock data for compliance violations
  const [violations, setViolations] = useState<ComplianceViolation[]>([
    {
      id: "viol-001",
      ruleId: "rule-001",
      ruleName: "Password Complexity",
      entityId: "user-042",
      entityType: "user",
      description: "User password does not meet complexity requirements",
      detectedAt: "2023-10-10 09:15:22",
      severity: "high",
      status: "open",
      clientId: "client-001",
      clientType: "FDF",
    },
    {
      id: "viol-002",
      ruleId: "rule-002",
      ruleName: "Data Encryption at Rest",
      entityId: "db-backup-20231009",
      entityType: "database",
      description: "Database backup found unencrypted",
      detectedAt: "2023-10-10 10:30:45",
      severity: "critical",
      status: "in_progress",
      assignedTo: "Ahmed Al-Farsi",
      clientId: "client-002",
      clientType: "ADHA",
    },
    {
      id: "viol-003",
      ruleId: "rule-003",
      ruleName: "Access Control Logging",
      entityId: "module-assessment",
      entityType: "module",
      description: "Access logs not retained for required period",
      detectedAt: "2023-10-11 14:22:10",
      severity: "medium",
      status: "resolved",
      assignedTo: "Fatima Khalid",
      resolvedAt: "2023-10-12 16:45:30",
      resolutionNotes: "Log retention period extended to 90 days",
      clientId: "client-001",
      clientType: "FDF",
    },
    {
      id: "viol-004",
      ruleId: "rule-005",
      ruleName: "Data Backup",
      entityId: "backup-system",
      entityType: "system",
      description: "Backup failed for 2 consecutive days",
      detectedAt: "2023-10-12 01:15:00",
      severity: "high",
      status: "resolved",
      assignedTo: "Mohammed Al-Saud",
      resolvedAt: "2023-10-12 09:30:15",
      resolutionNotes:
        "Backup system disk space increased and monitoring alert added",
      clientId: "client-003",
      clientType: "Cash",
    },
    {
      id: "viol-005",
      ruleId: "rule-007",
      ruleName: "Physical Access Controls",
      entityId: "server-room-b",
      entityType: "location",
      description: "Unauthorized access detected to server room",
      detectedAt: "2023-10-13 15:45:22",
      severity: "high",
      status: "in_progress",
      assignedTo: "Ahmed Al-Farsi",
      clientId: "client-002",
      clientType: "ADHA",
    },
    {
      id: "viol-006",
      ruleId: "rule-001",
      ruleName: "Password Complexity",
      entityId: "user-108",
      entityType: "user",
      description: "User password does not meet complexity requirements",
      detectedAt: "2023-10-14 11:20:45",
      severity: "high",
      status: "false_positive",
      assignedTo: "Fatima Khalid",
      resolvedAt: "2023-10-14 13:10:30",
      resolutionNotes:
        "User account is a system account with different requirements",
      clientId: "client-001",
      clientType: "FDF",
    },
  ]);

  // Mock data for compliance reports
  const [reports, setReports] = useState<ComplianceReport[]>([
    {
      id: "report-001",
      title: "HIPAA Quarterly Compliance Report - Q3 2023",
      description:
        "Quarterly assessment of HIPAA compliance across all systems",
      generatedAt: "2023-10-01",
      generatedBy: "Ahmed Al-Farsi",
      framework: "HIPAA",
      clientType: "FDF",
      clientId: "client-001",
      status: "final",
      totalRules: 24,
      passedRules: 21,
      failedRules: 2,
      notApplicable: 1,
      score: 91.3,
      findings: [
        "Password policy not enforced on legacy systems",
        "Access logs not retained for required period",
      ],
      recommendations: [
        "Implement password policy across all systems by end of Q4",
        "Extend log retention period to 90 days",
      ],
    },
    {
      id: "report-002",
      title: "ISO 27001 Annual Assessment - 2023",
      description: "Annual comprehensive assessment of ISO 27001 compliance",
      generatedAt: "2023-09-15",
      generatedBy: "Fatima Khalid",
      framework: "ISO 27001",
      clientType: "ADHA",
      clientId: "client-002",
      status: "final",
      totalRules: 32,
      passedRules: 28,
      failedRules: 3,
      notApplicable: 1,
      score: 87.5,
      findings: [
        "Backup system not tested in last 6 months",
        "Vendor security assessments incomplete",
        "Physical access control logs not reviewed regularly",
      ],
      recommendations: [
        "Implement monthly backup testing schedule",
        "Complete vendor security assessments by end of Q4",
        "Establish weekly review of physical access logs",
      ],
    },
    {
      id: "report-003",
      title: "NIST Security Framework Assessment - Q4 2023",
      description: "Quarterly assessment of NIST security framework compliance",
      generatedAt: "2023-10-10",
      generatedBy: "Mohammed Al-Saud",
      framework: "NIST",
      clientType: "Cash",
      clientId: "client-003",
      status: "draft",
      totalRules: 18,
      passedRules: 15,
      failedRules: 2,
      notApplicable: 1,
      score: 88.2,
      findings: [
        "Incident response plan not tested in last 12 months",
        "Security awareness training not completed by all staff",
      ],
      recommendations: [
        "Schedule incident response simulation by end of Q4",
        "Ensure all staff complete security awareness training by November 30",
      ],
    },
    {
      id: "report-004",
      title: "GDPR Data Protection Assessment - 2023",
      description: "Annual assessment of GDPR compliance for data protection",
      generatedAt: "2023-08-20",
      generatedBy: "Ahmed Al-Farsi",
      framework: "GDPR",
      clientType: "FDF",
      clientId: "client-001",
      status: "archived",
      totalRules: 15,
      passedRules: 13,
      failedRules: 1,
      notApplicable: 1,
      score: 92.9,
      findings: ["Data subject access request process not fully documented"],
      recommendations: [
        "Complete documentation of data subject access request process",
      ],
    },
  ]);

  // Mock data for compliance certificates
  const [certificates, setCertificates] = useState<ComplianceCertificate[]>([
    {
      id: "cert-001",
      title: "HIPAA Compliance Certificate - 2023",
      issuedAt: "2023-10-05",
      expiresAt: "2024-10-05",
      issuedTo: "FDF Client Services",
      issuedBy: "Barakatna Compliance Authority",
      framework: "HIPAA",
      clientType: "FDF",
      clientId: "client-001",
      status: "active",
      reportId: "report-001",
      score: 91.3,
    },
    {
      id: "cert-002",
      title: "ISO 27001 Compliance Certificate - 2023",
      issuedAt: "2023-09-20",
      expiresAt: "2024-09-20",
      issuedTo: "ADHA Health Services",
      issuedBy: "Barakatna Compliance Authority",
      framework: "ISO 27001",
      clientType: "ADHA",
      clientId: "client-002",
      status: "active",
      reportId: "report-002",
      score: 87.5,
    },
    {
      id: "cert-003",
      title: "GDPR Compliance Certificate - 2022",
      issuedAt: "2022-08-25",
      expiresAt: "2023-08-25",
      issuedTo: "FDF Client Services",
      issuedBy: "Barakatna Compliance Authority",
      framework: "GDPR",
      clientType: "FDF",
      clientId: "client-001",
      status: "expired",
      reportId: "report-004",
      score: 92.9,
    },
  ]);

  // Get unique values for filters
  const categories = ["all", ...new Set(rules.map((rule) => rule.category))];
  const severities = ["all", "low", "medium", "high", "critical"];
  const statuses = ["all", "active", "inactive"];
  const clientTypes = ["all", "FDF", "ADHA", "Cash"];
  const frameworks = ["all", ...new Set(rules.map((rule) => rule.framework))];

  // Filtered rules based on selected filters
  const filteredRules = rules.filter((rule) => {
    // Text search
    const matchesSearch =
      rule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rule.description.toLowerCase().includes(searchTerm.toLowerCase());

    // Category filter
    const matchesCategory =
      categoryFilter === "all" || rule.category === categoryFilter;

    // Severity filter
    const matchesSeverity =
      severityFilter === "all" || rule.severity === severityFilter;

    // Status filter
    const matchesStatus =
      statusFilter === "all" || rule.status === statusFilter;

    // Client type filter
    const matchesClientType =
      clientTypeFilter === "all" || rule.clientTypes.includes(clientTypeFilter);

    // Framework filter
    const matchesFramework =
      frameworkFilter === "all" || rule.framework === frameworkFilter;

    return (
      matchesSearch &&
      matchesCategory &&
      matchesSeverity &&
      matchesStatus &&
      matchesClientType &&
      matchesFramework
    );
  });

  // Filtered violations based on selected filters
  const filteredViolations = violations.filter((violation) => {
    // Text search
    const matchesSearch =
      violation.ruleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      violation.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      violation.entityId.toLowerCase().includes(searchTerm.toLowerCase());

    // Severity filter
    const matchesSeverity =
      severityFilter === "all" || violation.severity === severityFilter;

    // Status filter - different statuses for violations
    const violationStatusFilter =
      statusFilter === "all"
        ? "all"
        : statusFilter === "active"
          ? "open"
          : statusFilter === "inactive"
            ? "resolved"
            : statusFilter;

    const matchesStatus =
      violationStatusFilter === "all" ||
      violation.status === violationStatusFilter;

    // Client type filter
    const matchesClientType =
      clientTypeFilter === "all" || violation.clientType === clientTypeFilter;

    return (
      matchesSearch && matchesSeverity && matchesStatus && matchesClientType
    );
  });

  // Filtered reports based on selected filters
  const filteredReports = reports.filter((report) => {
    // Text search
    const matchesSearch =
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description.toLowerCase().includes(searchTerm.toLowerCase());

    // Framework filter
    const matchesFramework =
      frameworkFilter === "all" || report.framework === frameworkFilter;

    // Client type filter
    const matchesClientType =
      clientTypeFilter === "all" || report.clientType === clientTypeFilter;

    // Status filter - different statuses for reports
    const reportStatusFilter =
      statusFilter === "all"
        ? "all"
        : statusFilter === "active"
          ? "final"
          : statusFilter === "inactive"
            ? "archived"
            : statusFilter;

    const matchesStatus =
      reportStatusFilter === "all" || report.status === reportStatusFilter;

    return (
      matchesSearch && matchesFramework && matchesClientType && matchesStatus
    );
  });

  // Filtered certificates based on selected filters
  const filteredCertificates = certificates.filter((certificate) => {
    // Text search
    const matchesSearch =
      certificate.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      certificate.issuedTo.toLowerCase().includes(searchTerm.toLowerCase());

    // Framework filter
    const matchesFramework =
      frameworkFilter === "all" || certificate.framework === frameworkFilter;

    // Client type filter
    const matchesClientType =
      clientTypeFilter === "all" || certificate.clientType === clientTypeFilter;

    // Status filter
    const matchesStatus =
      statusFilter === "all" || certificate.status === statusFilter;

    return (
      matchesSearch && matchesFramework && matchesClientType && matchesStatus
    );
  });

  const getSeverityColor = (severity: string) => {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
      case "final":
        return "bg-green-100 text-green-800";
      case "inactive":
      case "archived":
      case "expired":
      case "revoked":
        return "bg-gray-100 text-gray-800";
      case "open":
        return "bg-red-100 text-red-800";
      case "in_progress":
        return "bg-yellow-100 text-yellow-800";
      case "resolved":
        return "bg-green-100 text-green-800";
      case "false_positive":
        return "bg-blue-100 text-blue-800";
      case "draft":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleRefresh = () => {
    // Refresh data logic would go here
    console.log("Refreshing compliance data");
  };

  const handleExportRules = () => {
    // Export rules logic would go here
    console.log("Exporting compliance rules");
    alert("Rules export functionality would be implemented here");
  };

  const handleExportViolations = () => {
    // Export violations logic would go here
    console.log("Exporting compliance violations");
    alert("Violations export functionality would be implemented here");
  };

  const handleExportReports = () => {
    // Export reports logic would go here
    console.log("Exporting compliance reports");
    alert("Reports export functionality would be implemented here");
  };

  const handleExportCertificates = () => {
    // Export certificates logic would go here
    console.log("Exporting compliance certificates");
    alert("Certificates export functionality would be implemented here");
  };

  const handleGenerateReport = () => {
    // Generate new compliance report logic would go here
    console.log("Generating new compliance report");
    alert("Report generation functionality would be implemented here");
  };

  const handleGenerateCertificate = () => {
    // Generate new compliance certificate logic would go here
    console.log("Generating new compliance certificate");
    alert("Certificate generation functionality would be implemented here");
  };

  const handleResolveViolation = (violation: ComplianceViolation) => {
    // Resolve violation logic would go here
    console.log(`Resolving violation ${violation.id}`);
    alert(
      `Resolution functionality for violation ${violation.id} would be implemented here`,
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">
          {t("administration.compliance.title", "Compliance Reporting")}
        </h2>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            {t("common.refresh", "Refresh")}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="rules" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            {t("administration.compliance.tabs.rules", "Compliance Rules")}
          </TabsTrigger>
          <TabsTrigger value="violations" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            {t("administration.compliance.tabs.violations", "Violations")}
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            {t("administration.compliance.tabs.reports", "Reports")}
          </TabsTrigger>
          <TabsTrigger value="certificates" className="flex items-center gap-2">
            <Award className="h-4 w-4" />
            {t("administration.compliance.tabs.certificates", "Certificates")}
          </TabsTrigger>
        </TabsList>

        {/* Rules Tab */}
        <TabsContent value="rules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>
                  {t(
                    "administration.compliance.rules.title",
                    "Compliance Rules",
                  )}
                </span>
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
                {t(
                  "administration.compliance.rules.description",
                  "Manage and view compliance rules across different frameworks",
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div className="space-y-2">
                  <Label htmlFor="search">{t("common.search", "Search")}</Label>
                  <div className="flex items-center space-x-2">
                    <Search className="h-4 w-4 text-gray-400" />
                    <Input
                      id="search"
                      placeholder={t(
                        "administration.compliance.filters.searchPlaceholder",
                        "Search rules...",
                      )}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">
                    {t(
                      "administration.compliance.filters.category",
                      "Category",
                    )}
                  </Label>
                  <Select
                    value={categoryFilter}
                    onValueChange={setCategoryFilter}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category === "all"
                            ? t("common.all", "All")
                            : category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="severity">
                    {t(
                      "administration.compliance.filters.severity",
                      "Severity",
                    )}
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
                            ? t("common.all", "All")
                            : t(`severity.${severity}`, severity)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">{t("common.status", "Status")}</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statuses.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status === "all"
                            ? t("common.all", "All")
                            : t(`status.${status}`, status)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {showAdvancedFilters && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4 pt-4 border-t">
                  <div className="space-y-2">
                    <Label htmlFor="clientType">
                      {t(
                        "administration.compliance.filters.clientType",
                        "Client Type",
                      )}
                    </Label>
                    <Select
                      value={clientTypeFilter}
                      onValueChange={setClientTypeFilter}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {clientTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type === "all" ? t("common.all", "All") : type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="framework">
                      {t(
                        "administration.compliance.filters.framework",
                        "Framework",
                      )}
                    </Label>
                    <Select
                      value={frameworkFilter}
                      onValueChange={setFrameworkFilter}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {frameworks.map((framework) => (
                          <SelectItem key={framework} value={framework}>
                            {framework === "all"
                              ? t("common.all", "All")
                              : framework}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <div>
                <span className="text-sm text-gray-500">
                  {filteredRules.length}{" "}
                  {filteredRules.length === 1 ? "rule" : "rules"} found
                </span>
              </div>
              <Button
                onClick={handleExportRules}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                {t("common.export", "Export")}
              </Button>
            </CardFooter>
          </Card>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("common.name", "Name")}</TableHead>
                  <TableHead>{t("common.category", "Category")}</TableHead>
                  <TableHead>{t("common.framework", "Framework")}</TableHead>
                  <TableHead>{t("common.severity", "Severity")}</TableHead>
                  <TableHead>
                    {t("common.clientTypes", "Client Types")}
                  </TableHead>
                  <TableHead>{t("common.status", "Status")}</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRules.length > 0 ? (
                  filteredRules.map((rule) => (
                    <TableRow key={rule.id}>
                      <TableCell className="font-medium">{rule.name}</TableCell>
                      <TableCell>{rule.category}</TableCell>
                      <TableCell>{rule.framework}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${getSeverityColor(rule.severity)}`}
                        >
                          {t(`severity.${rule.severity}`, rule.severity)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {rule.clientTypes.map((type) => (
                            <Badge key={type} variant="outline">
                              {type}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${getStatusColor(rule.status)}`}
                        >
                          {t(`status.${rule.status}`, rule.status)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl">
                            <DialogHeader>
                              <DialogTitle>Rule Details</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <h3 className="text-lg font-medium">
                                  {rule.name}
                                </h3>
                                <p className="text-gray-500">
                                  {rule.description}
                                </p>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h4 className="text-sm font-medium">
                                    Category
                                  </h4>
                                  <p>{rule.category}</p>
                                </div>
                                <div>
                                  <h4 className="text-sm font-medium">
                                    Framework
                                  </h4>
                                  <p>{rule.framework}</p>
                                </div>
                                <div>
                                  <h4 className="text-sm font-medium">
                                    Severity
                                  </h4>
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs ${getSeverityColor(rule.severity)}`}
                                  >
                                    {rule.severity}
                                  </span>
                                </div>
                                <div>
                                  <h4 className="text-sm font-medium">
                                    Status
                                  </h4>
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs ${getStatusColor(rule.status)}`}
                                  >
                                    {rule.status}
                                  </span>
                                </div>
                                <div>
                                  <h4 className="text-sm font-medium">
                                    Created
                                  </h4>
                                  <p>{rule.createdAt}</p>
                                </div>
                                <div>
                                  <h4 className="text-sm font-medium">
                                    Updated
                                  </h4>
                                  <p>{rule.updatedAt}</p>
                                </div>
                                <div className="col-span-2">
                                  <h4 className="text-sm font-medium">
                                    Client Types
                                  </h4>
                                  <div className="flex flex-wrap gap-1 mt-1">
                                    {rule.clientTypes.map((type) => (
                                      <Badge key={type} variant="outline">
                                        {type}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4">
                      {t("common.noResults", "No results found")}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Violations Tab */}
        <TabsContent value="violations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>
                {t(
                  "administration.compliance.violations.title",
                  "Compliance Violations",
                )}
              </CardTitle>
              <CardDescription>
                {t(
                  "administration.compliance.violations.description",
                  "Track and resolve compliance violations",
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div className="space-y-2">
                  <Label htmlFor="search">{t("common.search", "Search")}</Label>
                  <div className="flex items-center space-x-2">
                    <Search className="h-4 w-4 text-gray-400" />
                    <Input
                      id="search"
                      placeholder={t(
                        "administration.compliance.filters.searchViolations",
                        "Search violations...",
                      )}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="severity">
                    {t(
                      "administration.compliance.filters.severity",
                      "Severity",
                    )}
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
                            ? t("common.all", "All")
                            : t(`severity.${severity}`, severity)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">{t("common.status", "Status")}</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        {t("common.all", "All")}
                      </SelectItem>
                      <SelectItem value="open">
                        {t("status.open", "Open")}
                      </SelectItem>
                      <SelectItem value="in_progress">
                        {t("status.in_progress", "In Progress")}
                      </SelectItem>
                      <SelectItem value="resolved">
                        {t("status.resolved", "Resolved")}
                      </SelectItem>
                      <SelectItem value="false_positive">
                        {t("status.false_positive", "False Positive")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="clientType">
                    {t(
                      "administration.compliance.filters.clientType",
                      "Client Type",
                    )}
                  </Label>
                  <Select
                    value={clientTypeFilter}
                    onValueChange={setClientTypeFilter}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {clientTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type === "all" ? t("common.all", "All") : type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div>
                <span className="text-sm text-gray-500">
                  {filteredViolations.length}{" "}
                  {filteredViolations.length === 1 ? "violation" : "violations"}{" "}
                  found
                </span>
              </div>
              <Button
                onClick={handleExportViolations}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                {t("common.export", "Export")}
              </Button>
            </CardFooter>
          </Card>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("common.detectedAt", "Detected At")}</TableHead>
                  <TableHead>{t("common.rule", "Rule")}</TableHead>
                  <TableHead>{t("common.entityType", "Entity Type")}</TableHead>
                  <TableHead>{t("common.entityId", "Entity ID")}</TableHead>
                  <TableHead>{t("common.severity", "Severity")}</TableHead>
                  <TableHead>{t("common.status", "Status")}</TableHead>
                  <TableHead>{t("common.assignedTo", "Assigned To")}</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredViolations.length > 0 ? (
                  filteredViolations.map((violation) => (
                    <TableRow key={violation.id}>
                      <TableCell className="font-mono">
                        {violation.detectedAt}
                      </TableCell>
                      <TableCell>{violation.ruleName}</TableCell>
                      <TableCell>{violation.entityType}</TableCell>
                      <TableCell>{violation.entityId}</TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${getSeverityColor(violation.severity)}`}
                        >
                          {t(
                            `severity.${violation.severity}`,
                            violation.severity,
                          )}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${getStatusColor(violation.status)}`}
                        >
                          {t(
                            `status.${violation.status}`,
                            violation.status.replace("_", " "),
                          )}
                        </span>
                      </TableCell>
                      <TableCell>{violation.assignedTo || "—"}</TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl">
                            <DialogHeader>
                              <DialogTitle>Violation Details</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <h3 className="text-lg font-medium">
                                  {violation.ruleName}
                                </h3>
                                <p className="text-gray-500">
                                  {violation.description}
                                </p>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h4 className="text-sm font-medium">
                                    Detected At
                                  </h4>
                                  <p>{violation.detectedAt}</p>
                                </div>
                                <div>
                                  <h4 className="text-sm font-medium">
                                    Entity
                                  </h4>
                                  <p>
                                    {violation.entityType}: {violation.entityId}
                                  </p>
                                </div>
                                <div>
                                  <h4 className="text-sm font-medium">
                                    Severity
                                  </h4>
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs ${getSeverityColor(violation.severity)}`}
                                  >
                                    {violation.severity}
                                  </span>
                                </div>
                                <div>
                                  <h4 className="text-sm font-medium">
                                    Status
                                  </h4>
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs ${getStatusColor(violation.status)}`}
                                  >
                                    {violation.status.replace("_", " ")}
                                  </span>
                                </div>
                                <div>
                                  <h4 className="text-sm font-medium">
                                    Client
                                  </h4>
                                  <p>
                                    {violation.clientType}: {violation.clientId}
                                  </p>
                                </div>
                                <div>
                                  <h4 className="text-sm font-medium">
                                    Assigned To
                                  </h4>
                                  <p>
                                    {violation.assignedTo || "Not assigned"}
                                  </p>
                                </div>
                                {violation.resolvedAt && (
                                  <>
                                    <div>
                                      <h4 className="text-sm font-medium">
                                        Resolved At
                                      </h4>
                                      <p>{violation.resolvedAt}</p>
                                    </div>
                                    <div className="col-span-2">
                                      <h4 className="text-sm font-medium">
                                        Resolution Notes
                                      </h4>
                                      <p>{violation.resolutionNotes}</p>
                                    </div>
                                  </>
                                )}
                              </div>
                              {violation.status !== "resolved" &&
                                violation.status !== "false_positive" && (
                                  <div className="flex justify-end">
                                    <Button
                                      onClick={() =>
                                        handleResolveViolation(violation)
                                      }
                                    >
                                      Resolve Violation
                                    </Button>
                                  </div>
                                )}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-4">
                      {t("common.noResults", "No results found")}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>
                  {t(
                    "administration.compliance.reports.title",
                    "Compliance Reports",
                  )}
                </span>
                <Button
                  onClick={handleGenerateReport}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  {t(
                    "administration.compliance.reports.generate",
                    "Generate Report",
                  )}
                </Button>
              </CardTitle>
              <CardDescription>
                {t(
                  "administration.compliance.reports.description",
                  "View and generate compliance reports",
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                <div className="space-y-2">
                  <Label htmlFor="search">{t("common.search", "Search")}</Label>
                  <div className="flex items-center space-x-2">
                    <Search className="h-4 w-4 text-gray-400" />
                    <Input
                      id="search"
                      placeholder={t(
                        "administration.compliance.filters.searchReports",
                        "Search reports...",
                      )}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="framework">
                    {t(
                      "administration.compliance.filters.framework",
                      "Framework",
                    )}
                  </Label>
                  <Select
                    value={frameworkFilter}
                    onValueChange={setFrameworkFilter}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {frameworks.map((framework) => (
                        <SelectItem key={framework} value={framework}>
                          {framework === "all"
                            ? t("common.all", "All")
                            : framework}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="clientType">
                    {t(
                      "administration.compliance.filters.clientType",
                      "Client Type",
                    )}
                  </Label>
                  <Select
                    value={clientTypeFilter}
                    onValueChange={setClientTypeFilter}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {clientTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type === "all" ? t("common.all", "All") : type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div>
                <span className="text-sm text-gray-500">
                  {filteredReports.length}{" "}
                  {filteredReports.length === 1 ? "report" : "reports"} found
                </span>
              </div>
              <Button
                onClick={handleExportReports}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                {t("common.export", "Export")}
              </Button>
            </CardFooter>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredReports.map((report) => (
              <Card key={report.id} className="overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{report.title}</CardTitle>
                      <CardDescription className="text-sm">
                        {report.framework} | {report.generatedAt}
                      </CardDescription>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${getStatusColor(report.status)}`}
                    >
                      {report.status}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Compliance Score</span>
                        <span className="font-medium">{report.score}%</span>
                      </div>
                      <Progress value={report.score} className="h-2" />
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center text-sm">
                      <div>
                        <div className="font-medium text-green-600">
                          {report.passedRules}
                        </div>
                        <div className="text-gray-500">Passed</div>
                      </div>
                      <div>
                        <div className="font-medium text-red-600">
                          {report.failedRules}
                        </div>
                        <div className="text-gray-500">Failed</div>
                      </div>
                      <div>
                        <div className="font-medium text-gray-600">
                          {report.notApplicable}
                        </div>
                        <div className="text-gray-500">N/A</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full">
                        View Details
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl">
                      <DialogHeader>
                        <DialogTitle>{report.title}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-lg font-medium mb-2">
                            Report Overview
                          </h3>
                          <p className="text-gray-600">{report.description}</p>
                          <div className="grid grid-cols-2 gap-4 mt-4">
                            <div>
                              <h4 className="text-sm font-medium">Framework</h4>
                              <p>{report.framework}</p>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium">
                                Generated By
                              </h4>
                              <p>{report.generatedBy}</p>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium">
                                Generated At
                              </h4>
                              <p>{report.generatedAt}</p>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium">Status</h4>
                              <span
                                className={`px-2 py-1 rounded-full text-xs ${getStatusColor(report.status)}`}
                              >
                                {report.status}
                              </span>
                            </div>
                            <div>
                              <h4 className="text-sm font-medium">Client</h4>
                              <p>
                                {report.clientType}: {report.clientId}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-lg font-medium mb-2">
                            Compliance Score
                          </h3>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Overall Score</span>
                            <span className="font-medium">{report.score}%</span>
                          </div>
                          <Progress value={report.score} className="h-2 mb-4" />
                          <div className="grid grid-cols-3 gap-4 text-center">
                            <div className="p-3 bg-green-50 rounded-md">
                              <div className="text-2xl font-bold text-green-600">
                                {report.passedRules}
                              </div>
                              <div className="text-sm text-gray-600">
                                Rules Passed
                              </div>
                            </div>
                            <div className="p-3 bg-red-50 rounded-md">
                              <div className="text-2xl font-bold text-red-600">
                                {report.failedRules}
                              </div>
                              <div className="text-sm text-gray-600">
                                Rules Failed
                              </div>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-md">
                              <div className="text-2xl font-bold text-gray-600">
                                {report.notApplicable}
                              </div>
                              <div className="text-sm text-gray-600">
                                Not Applicable
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                          <div>
                            <h3 className="text-lg font-medium mb-2">
                              Findings
                            </h3>
                            <ul className="list-disc pl-5 space-y-1">
                              {report.findings.map((finding, index) => (
                                <li key={index} className="text-gray-600">
                                  {finding}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h3 className="text-lg font-medium mb-2">
                              Recommendations
                            </h3>
                            <ul className="list-disc pl-5 space-y-1">
                              {report.recommendations.map(
                                (recommendation, index) => (
                                  <li key={index} className="text-gray-600">
                                    {recommendation}
                                  </li>
                                ),
                              )}
                            </ul>
                          </div>
                        </div>

                        <div className="flex justify-end space-x-2">
                          <Button variant="outline">Download PDF</Button>
                          {report.status === "draft" && (
                            <Button>Finalize Report</Button>
                          )}
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardFooter>
              </Card>
            ))}

            {filteredReports.length === 0 && (
              <div className="col-span-3 text-center py-8 border rounded-md">
                {t("common.noResults", "No results found")}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Certificates Tab */}
        <TabsContent value="certificates" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>
                  {t(
                    "administration.compliance.certificates.title",
                    "Compliance Certificates",
                  )}
                </span>
                <Button
                  onClick={handleGenerateCertificate}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  {t(
                    "administration.compliance.certificates.generate",
                    "Generate Certificate",
                  )}
                </Button>
              </CardTitle>
              <CardDescription>
                {t(
                  "administration.compliance.certificates.description",
                  "View and generate compliance certificates",
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                <div className="space-y-2">
                  <Label htmlFor="search">{t("common.search", "Search")}</Label>
                  <div className="flex items-center space-x-2">
                    <Search className="h-4 w-4 text-gray-400" />
                    <Input
                      id="search"
                      placeholder={t(
                        "administration.compliance.filters.searchCertificates",
                        "Search certificates...",
                      )}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="framework">
                    {t(
                      "administration.compliance.filters.framework",
                      "Framework",
                    )}
                  </Label>
                  <Select
                    value={frameworkFilter}
                    onValueChange={setFrameworkFilter}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {frameworks.map((framework) => (
                        <SelectItem key={framework} value={framework}>
                          {framework === "all"
                            ? t("common.all", "All")
                            : framework}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">{t("common.status", "Status")}</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        {t("common.all", "All")}
                      </SelectItem>
                      <SelectItem value="active">
                        {t("status.active", "Active")}
                      </SelectItem>
                      <SelectItem value="expired">
                        {t("status.expired", "Expired")}
                      </SelectItem>
                      <SelectItem value="revoked">
                        {t("status.revoked", "Revoked")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <div>
                <span className="text-sm text-gray-500">
                  {filteredCertificates.length}{" "}
                  {filteredCertificates.length === 1
                    ? "certificate"
                    : "certificates"}{" "}
                  found
                </span>
              </div>
              <Button
                onClick={handleExportCertificates}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                {t("common.export", "Export")}
              </Button>
            </CardFooter>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCertificates.map((certificate) => (
              <Card
                key={certificate.id}
                className="overflow-hidden border-t-4 border-primary"
              >
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        {certificate.title}
                      </CardTitle>
                      <CardDescription className="text-sm">
                        {certificate.framework} | Score: {certificate.score}%
                      </CardDescription>
                    </div>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${getStatusColor(certificate.status)}`}
                    >
                      {certificate.status}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Issued To:</span>
                      <span>{certificate.issuedTo}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Issued At:</span>
                      <span>{certificate.issuedAt}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Expires At:</span>
                      <span>{certificate.expiresAt}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full">
                        View Certificate
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl">
                      <DialogHeader>
                        <DialogTitle>{certificate.title}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-6">
                        <div className="border-2 border-gray-200 rounded-lg p-6 text-center space-y-4">
                          <div className="flex justify-center">
                            <Award className="h-16 w-16 text-primary" />
                          </div>
                          <h2 className="text-2xl font-bold">
                            Certificate of Compliance
                          </h2>
                          <p className="text-lg">This certifies that</p>
                          <p className="text-xl font-bold">
                            {certificate.issuedTo}
                          </p>
                          <p className="text-lg">
                            has successfully met the requirements of
                          </p>
                          <p className="text-xl font-bold">
                            {certificate.framework}
                          </p>
                          <p className="text-lg">with a compliance score of</p>
                          <p className="text-2xl font-bold text-primary">
                            {certificate.score}%
                          </p>
                          <div className="grid grid-cols-2 gap-4 mt-6 text-left">
                            <div>
                              <p className="text-sm text-gray-500">
                                Issued Date
                              </p>
                              <p>{certificate.issuedAt}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">
                                Expiration Date
                              </p>
                              <p>{certificate.expiresAt}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">
                                Certificate ID
                              </p>
                              <p>{certificate.id}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Issued By</p>
                              <p>{certificate.issuedBy}</p>
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-end space-x-2">
                          <Button variant="outline">Download PDF</Button>
                          <Button>Print Certificate</Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardFooter>
              </Card>
            ))}

            {filteredCertificates.length === 0 && (
              <div className="col-span-3 text-center py-8 border rounded-md">
                {t("common.noResults", "No results found")}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ComplianceReporting;
