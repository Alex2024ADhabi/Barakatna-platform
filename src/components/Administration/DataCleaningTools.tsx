import React, { useState, useEffect } from "react";
import {
  Tabs,
  Tab,
  Box,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Grid,
  Alert,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  LinearProgress,
  Tooltip,
  Divider,
  Card,
  CardContent,
  CardActions,
} from "@mui/material";
import {
  Search,
  Merge,
  Assessment,
  Edit,
  Delete,
  Save,
  Close,
  Check,
  Warning,
  Refresh,
  Link,
  LinkOff,
  VerifiedUser,
  ErrorOutline,
  CloudUpload,
  CloudDownload,
  FilterList,
  CompareArrows,
  AutoFixHigh,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";

// Mock data interfaces
interface DataRecord {
  id: string;
  entityType: string;
  entityId: string;
  attributes: Record<string, any>;
  lastUpdated: string;
  createdBy: string;
  score?: number;
}

interface DuplicateGroup {
  id: string;
  entityType: string;
  records: DataRecord[];
  confidence: number;
  matchedFields: string[];
  status: "pending" | "reviewed" | "merged" | "rejected";
}

interface QualityMetric {
  id: string;
  entityType: string;
  metricName: string;
  description: string;
  score: number;
  affectedRecords: number;
  totalRecords: number;
  lastChecked: string;
}

interface OrphanedRecord {
  id: string;
  entityType: string;
  entityId: string;
  missingRelations: { entityType: string; fieldName: string }[];
  createdDate: string;
  lastAccessed: string;
}

interface IntegrityIssue {
  id: string;
  entityType: string;
  entityId: string;
  issueType: "constraint" | "reference" | "format" | "business_rule";
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  detectedDate: string;
  status: "open" | "in_progress" | "resolved";
}

const DataCleaningTools: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<string>("duplicates");
  const [duplicateGroups, setDuplicateGroups] = useState<DuplicateGroup[]>([]);
  const [qualityMetrics, setQualityMetrics] = useState<QualityMetric[]>([]);
  const [orphanedRecords, setOrphanedRecords] = useState<OrphanedRecord[]>([]);
  const [integrityIssues, setIntegrityIssues] = useState<IntegrityIssue[]>([]);
  const [selectedDuplicateGroup, setSelectedDuplicateGroup] =
    useState<DuplicateGroup | null>(null);
  const [selectedRecords, setSelectedRecords] = useState<string[]>([]);
  const [openMergeDialog, setOpenMergeDialog] = useState(false);
  const [openMassUpdateDialog, setOpenMassUpdateDialog] = useState(false);
  const [openFilterDialog, setOpenFilterDialog] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<
    "success" | "error" | "info" | "warning"
  >("success");
  const [entityTypeFilter, setEntityTypeFilter] = useState<string>("all");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [mergedRecord, setMergedRecord] = useState<Record<string, any>>({});
  const [massUpdateField, setMassUpdateField] = useState("");
  const [massUpdateValue, setMassUpdateValue] = useState("");
  const [massUpdateRecords, setMassUpdateRecords] = useState<string[]>([]);

  // Mock data for demonstration
  useEffect(() => {
    // Simulating API call to fetch data
    const mockDuplicateGroups: DuplicateGroup[] = [
      {
        id: "1",
        entityType: "beneficiary",
        records: [
          {
            id: "101",
            entityType: "beneficiary",
            entityId: "B001",
            attributes: {
              name: "Ahmed Al Mansouri",
              phone: "971-55-123-4567",
              email: "ahmed.m@example.com",
              address: "123 Palm St, Abu Dhabi",
            },
            lastUpdated: new Date(Date.now() - 86400000).toISOString(),
            createdBy: "system",
            score: 0.95,
          },
          {
            id: "102",
            entityType: "beneficiary",
            entityId: "B002",
            attributes: {
              name: "Ahmed Mansouri",
              phone: "971-55-123-4567",
              email: "ahmed.mansouri@example.com",
              address: "123 Palm Street, Abu Dhabi",
            },
            lastUpdated: new Date().toISOString(),
            createdBy: "admin",
            score: 0.92,
          },
        ],
        confidence: 0.9,
        matchedFields: ["phone", "name", "address"],
        status: "pending",
      },
      {
        id: "2",
        entityType: "supplier",
        records: [
          {
            id: "201",
            entityType: "supplier",
            entityId: "S001",
            attributes: {
              name: "Al Futtaim Construction",
              phone: "971-4-987-6543",
              email: "info@alfuttaim-const.example.com",
              address: "456 Sheikh Zayed Rd, Dubai",
            },
            lastUpdated: new Date(Date.now() - 172800000).toISOString(),
            createdBy: "system",
            score: 0.88,
          },
          {
            id: "202",
            entityType: "supplier",
            entityId: "S002",
            attributes: {
              name: "Al-Futtaim Construction Services",
              phone: "971-4-987-6543",
              email: "contact@alfuttaim.example.com",
              address: "456 SZR, Dubai",
            },
            lastUpdated: new Date(Date.now() - 259200000).toISOString(),
            createdBy: "import",
            score: 0.85,
          },
        ],
        confidence: 0.85,
        matchedFields: ["phone", "name"],
        status: "reviewed",
      },
    ];

    const mockQualityMetrics: QualityMetric[] = [
      {
        id: "1",
        entityType: "beneficiary",
        metricName: "Email Validity",
        description: "Percentage of beneficiaries with valid email addresses",
        score: 0.92,
        affectedRecords: 24,
        totalRecords: 300,
        lastChecked: new Date().toISOString(),
      },
      {
        id: "2",
        entityType: "beneficiary",
        metricName: "Phone Number Format",
        description:
          "Percentage of beneficiaries with correctly formatted phone numbers",
        score: 0.78,
        affectedRecords: 66,
        totalRecords: 300,
        lastChecked: new Date().toISOString(),
      },
      {
        id: "3",
        entityType: "supplier",
        metricName: "Address Completeness",
        description:
          "Percentage of suppliers with complete address information",
        score: 0.85,
        affectedRecords: 15,
        totalRecords: 100,
        lastChecked: new Date().toISOString(),
      },
      {
        id: "4",
        entityType: "project",
        metricName: "Required Fields",
        description: "Percentage of projects with all required fields filled",
        score: 0.95,
        affectedRecords: 5,
        totalRecords: 100,
        lastChecked: new Date().toISOString(),
      },
    ];

    const mockOrphanedRecords: OrphanedRecord[] = [
      {
        id: "1",
        entityType: "assessment",
        entityId: "A001",
        missingRelations: [
          { entityType: "beneficiary", fieldName: "beneficiaryId" },
        ],
        createdDate: new Date(Date.now() - 2592000000).toISOString(), // 30 days ago
        lastAccessed: new Date(Date.now() - 864000000).toISOString(), // 10 days ago
      },
      {
        id: "2",
        entityType: "project",
        entityId: "P001",
        missingRelations: [
          { entityType: "client", fieldName: "clientId" },
          { entityType: "program", fieldName: "programId" },
        ],
        createdDate: new Date(Date.now() - 5184000000).toISOString(), // 60 days ago
        lastAccessed: new Date(Date.now() - 1728000000).toISOString(), // 20 days ago
      },
      {
        id: "3",
        entityType: "invoice",
        entityId: "I001",
        missingRelations: [{ entityType: "project", fieldName: "projectId" }],
        createdDate: new Date(Date.now() - 1296000000).toISOString(), // 15 days ago
        lastAccessed: new Date(Date.now() - 432000000).toISOString(), // 5 days ago
      },
    ];

    const mockIntegrityIssues: IntegrityIssue[] = [
      {
        id: "1",
        entityType: "beneficiary",
        entityId: "B005",
        issueType: "constraint",
        description: "Missing required field: phone number",
        severity: "high",
        detectedDate: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        status: "open",
      },
      {
        id: "2",
        entityType: "project",
        entityId: "P010",
        issueType: "reference",
        description: "Invalid reference to non-existent supplier ID: S999",
        severity: "critical",
        detectedDate: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        status: "in_progress",
      },
      {
        id: "3",
        entityType: "assessment",
        entityId: "A023",
        issueType: "format",
        description: "Date format incorrect in completion date field",
        severity: "medium",
        detectedDate: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
        status: "resolved",
      },
      {
        id: "4",
        entityType: "invoice",
        entityId: "I045",
        issueType: "business_rule",
        description: "Invoice amount exceeds project budget by 15%",
        severity: "high",
        detectedDate: new Date().toISOString(),
        status: "open",
      },
    ];

    setDuplicateGroups(mockDuplicateGroups);
    setQualityMetrics(mockQualityMetrics);
    setOrphanedRecords(mockOrphanedRecords);
    setIntegrityIssues(mockIntegrityIssues);
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setActiveTab(newValue);
  };

  const handleScanForDuplicates = () => {
    setIsScanning(true);
    setScanProgress(0);

    // Simulate scanning progress
    const interval = setInterval(() => {
      setScanProgress((prevProgress) => {
        const newProgress = prevProgress + 10;
        if (newProgress >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          showSnackbar("Duplicate scan completed", "success");
          return 100;
        }
        return newProgress;
      });
    }, 500);
  };

  const handleOpenMergeDialog = (group: DuplicateGroup) => {
    setSelectedDuplicateGroup(group);

    // Initialize merged record with values from the first record
    const initialMerged: Record<string, any> = {};
    if (group.records.length > 0) {
      const firstRecord = group.records[0];
      Object.keys(firstRecord.attributes).forEach((key) => {
        initialMerged[key] = firstRecord.attributes[key];
      });
    }

    setMergedRecord(initialMerged);
    setOpenMergeDialog(true);
  };

  const handleSelectRecordForMerge = (
    recordId: string,
    field: string,
    value: any,
  ) => {
    setMergedRecord((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleMergeDuplicates = () => {
    if (!selectedDuplicateGroup) return;

    // In a real application, this would call an API to merge the records
    const updatedGroups = duplicateGroups.map((group) =>
      group.id === selectedDuplicateGroup.id
        ? { ...group, status: "merged" as const }
        : group,
    );

    setDuplicateGroups(updatedGroups);
    setOpenMergeDialog(false);
    showSnackbar("Records successfully merged", "success");
  };

  const handleOpenMassUpdateDialog = () => {
    setMassUpdateField("");
    setMassUpdateValue("");
    setMassUpdateRecords([]);
    setOpenMassUpdateDialog(true);
  };

  const handleMassUpdate = () => {
    // In a real application, this would call an API to update the records
    showSnackbar(
      `Updated ${massUpdateRecords.length} records with new value for ${massUpdateField}`,
      "success",
    );
    setOpenMassUpdateDialog(false);
  };

  const handleResolveIntegrityIssue = (issueId: string) => {
    const updatedIssues = integrityIssues.map((issue) =>
      issue.id === issueId ? { ...issue, status: "resolved" as const } : issue,
    );

    setIntegrityIssues(updatedIssues);
    showSnackbar("Issue marked as resolved", "success");
  };

  const handleFixOrphanedRecord = (recordId: string) => {
    // In a real application, this would open a dialog to fix the orphaned record
    showSnackbar("Orphaned record fixed", "success");
  };

  const handleDeleteOrphanedRecord = (recordId: string) => {
    const updatedRecords = orphanedRecords.filter(
      (record) => record.id !== recordId,
    );
    setOrphanedRecords(updatedRecords);
    showSnackbar("Orphaned record deleted", "success");
  };

  const handleRunQualityCheck = () => {
    setIsScanning(true);
    setScanProgress(0);

    // Simulate scanning progress
    const interval = setInterval(() => {
      setScanProgress((prevProgress) => {
        const newProgress = prevProgress + 5;
        if (newProgress >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          showSnackbar("Quality check completed", "success");
          return 100;
        }
        return newProgress;
      });
    }, 300);
  };

  const handleOpenFilterDialog = () => {
    setOpenFilterDialog(true);
  };

  const handleApplyFilters = () => {
    // In a real application, this would filter the data based on the selected filters
    setOpenFilterDialog(false);
    showSnackbar("Filters applied", "info");
  };

  const showSnackbar = (
    message: string,
    severity: "success" | "error" | "info" | "warning",
  ) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString();
  };

  const getEntityTypeName = (entityType: string): string => {
    const entityTypes: Record<string, string> = {
      beneficiary: "Beneficiary",
      supplier: "Supplier",
      project: "Project",
      assessment: "Assessment",
      invoice: "Invoice",
      client: "Client",
      program: "Program",
    };
    return entityTypes[entityType] || entityType;
  };

  const getSeverityColor = (severity: string): string => {
    const colors: Record<string, string> = {
      low: "#4caf50",
      medium: "#ff9800",
      high: "#f44336",
      critical: "#9c27b0",
    };
    return colors[severity] || "#757575";
  };

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      open: "#f44336",
      in_progress: "#ff9800",
      resolved: "#4caf50",
      pending: "#2196f3",
      reviewed: "#9c27b0",
      merged: "#4caf50",
      rejected: "#757575",
    };
    return colors[status] || "#757575";
  };

  const getQualityScoreColor = (score: number): string => {
    if (score >= 0.9) return "#4caf50";
    if (score >= 0.7) return "#ff9800";
    return "#f44336";
  };

  return (
    <Box sx={{ width: "100%", bgcolor: "background.paper" }}>
      <Box
        sx={{
          borderBottom: 1,
          borderColor: "divider",
          mb: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          aria-label="data cleaning tools tabs"
        >
          <Tab label={t("Duplicate Detection")} value="duplicates" />
          <Tab label={t("Data Quality")} value="quality" />
          <Tab label={t("Mass Updates")} value="mass_updates" />
          <Tab label={t("Orphaned Records")} value="orphaned" />
          <Tab label={t("Data Integrity")} value="integrity" />
        </Tabs>
        <Box>
          <Button
            variant="outlined"
            startIcon={<FilterList />}
            onClick={handleOpenFilterDialog}
            sx={{ mr: 1 }}
          >
            {t("Filter")}
          </Button>
        </Box>
      </Box>

      {/* Duplicate Detection Tab */}
      {activeTab === "duplicates" && (
        <Box>
          <Box
            sx={{
              mb: 2,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h6">{t("Duplicate Detection")}</Typography>
            <Button
              variant="contained"
              startIcon={<Search />}
              onClick={handleScanForDuplicates}
              disabled={isScanning}
            >
              {t("Scan for Duplicates")}
            </Button>
          </Box>

          {isScanning && (
            <Box sx={{ width: "100%", mb: 2 }}>
              <LinearProgress variant="determinate" value={scanProgress} />
              <Typography variant="body2" color="text.secondary" align="center">
                {t("Scanning")} {scanProgress}%
              </Typography>
            </Box>
          )}

          {duplicateGroups.length > 0 ? (
            duplicateGroups.map((group) => (
              <Paper key={group.id} sx={{ mb: 2, p: 2 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 1,
                  }}
                >
                  <Box>
                    <Typography variant="h6">
                      {t("Potential Duplicate")} -{" "}
                      {getEntityTypeName(group.entityType)}
                    </Typography>
                    <Box
                      sx={{ display: "flex", alignItems: "center", mt: 0.5 }}
                    >
                      <Chip
                        size="small"
                        label={`${t("Confidence")}: ${(group.confidence * 100).toFixed(0)}%`}
                        sx={{
                          mr: 1,
                          bgcolor:
                            group.confidence > 0.8 ? "#f44336" : "#ff9800",
                          color: "white",
                        }}
                      />
                      <Chip
                        size="small"
                        label={`${t("Status")}: ${group.status}`}
                        sx={{
                          mr: 1,
                          bgcolor: getStatusColor(group.status),
                          color: "white",
                        }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        {t("Matched Fields")}: {group.matchedFields.join(", ")}
                      </Typography>
                    </Box>
                  </Box>
                  <Box>
                    <Button
                      variant="contained"
                      startIcon={<Merge />}
                      onClick={() => handleOpenMergeDialog(group)}
                      disabled={group.status === "merged"}
                      sx={{ mr: 1 }}
                    >
                      {t("Merge")}
                    </Button>
                  </Box>
                </Box>

                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>{t("ID")}</TableCell>
                        {group.records.length > 0 &&
                          Object.keys(group.records[0].attributes).map(
                            (key) => <TableCell key={key}>{t(key)}</TableCell>,
                          )}
                        <TableCell>{t("Last Updated")}</TableCell>
                        <TableCell>{t("Created By")}</TableCell>
                        <TableCell align="right">{t("Match Score")}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {group.records.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell>{record.entityId}</TableCell>
                          {Object.keys(record.attributes).map((key) => (
                            <TableCell key={key}>
                              {record.attributes[key]}
                            </TableCell>
                          ))}
                          <TableCell>
                            {formatDate(record.lastUpdated)}
                          </TableCell>
                          <TableCell>{record.createdBy}</TableCell>
                          <TableCell align="right">
                            {record.score
                              ? `${(record.score * 100).toFixed(0)}%`
                              : "N/A"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
            ))
          ) : (
            <Typography variant="body1" sx={{ textAlign: "center", my: 4 }}>
              {t(
                "No duplicate records found. Click the 'Scan for Duplicates' button to start a new scan.",
              )}
            </Typography>
          )}
        </Box>
      )}

      {/* Data Quality Tab */}
      {activeTab === "quality" && (
        <Box>
          <Box
            sx={{
              mb: 2,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h6">{t("Data Quality Assessment")}</Typography>
            <Button
              variant="contained"
              startIcon={<Assessment />}
              onClick={handleRunQualityCheck}
              disabled={isScanning}
            >
              {t("Run Quality Check")}
            </Button>
          </Box>

          {isScanning && (
            <Box sx={{ width: "100%", mb: 2 }}>
              <LinearProgress variant="determinate" value={scanProgress} />
              <Typography variant="body2" color="text.secondary" align="center">
                {t("Running quality check")} {scanProgress}%
              </Typography>
            </Box>
          )}

          <Grid container spacing={2}>
            {qualityMetrics.map((metric) => (
              <Grid item xs={12} md={6} key={metric.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {metric.metricName}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom
                    >
                      {metric.description}
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", mt: 2 }}>
                      <Box sx={{ width: "100%", mr: 1 }}>
                        <LinearProgress
                          variant="determinate"
                          value={metric.score * 100}
                          sx={{
                            height: 10,
                            borderRadius: 5,
                            bgcolor: "#e0e0e0",
                            "& .MuiLinearProgress-bar": {
                              bgcolor: getQualityScoreColor(metric.score),
                            },
                          }}
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {(metric.score * 100).toFixed(0)}%
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        mt: 2,
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <Typography variant="body2">
                        {t("Entity Type")}:{" "}
                        {getEntityTypeName(metric.entityType)}
                      </Typography>
                      <Typography variant="body2">
                        {t("Affected Records")}: {metric.affectedRecords} /{" "}
                        {metric.totalRecords}
                      </Typography>
                    </Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 1 }}
                    >
                      {t("Last Checked")}: {formatDate(metric.lastChecked)}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button size="small">{t("View Details")}</Button>
                    <Button size="small">{t("Fix Issues")}</Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>

          {qualityMetrics.length === 0 && (
            <Typography variant="body1" sx={{ textAlign: "center", my: 4 }}>
              {t(
                "No quality metrics available. Click the 'Run Quality Check' button to generate metrics.",
              )}
            </Typography>
          )}
        </Box>
      )}

      {/* Mass Updates Tab */}
      {activeTab === "mass_updates" && (
        <Box>
          <Box
            sx={{
              mb: 2,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h6">
              {t("Mass Update Capabilities")}
            </Typography>
            <Button
              variant="contained"
              startIcon={<Edit />}
              onClick={handleOpenMassUpdateDialog}
            >
              {t("Create Mass Update")}
            </Button>
          </Box>

          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              {t("Mass Update Instructions")}
            </Typography>
            <Typography variant="body1" paragraph>
              {t(
                "Use this tool to update multiple records at once. You can filter records by entity type and other criteria, then apply the same change to all selected records.",
              )}
            </Typography>
            <Alert severity="info" sx={{ mb: 2 }}>
              {t(
                "Mass updates are logged and can be reversed if needed. Always verify your selection before applying changes.",
              )}
            </Alert>

            <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
              {t("Common Use Cases")}:
            </Typography>
            <ul>
              <li>{t("Update status for multiple projects")}</li>
              <li>{t("Standardize phone number formats")}</li>
              <li>{t("Assign multiple records to a new owner")}</li>
              <li>
                {t("Apply data corrections identified in quality checks")}
              </li>
            </ul>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              {t("Recent Mass Updates")}
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>{t("Date")}</TableCell>
                    <TableCell>{t("Entity Type")}</TableCell>
                    <TableCell>{t("Field Updated")}</TableCell>
                    <TableCell>{t("New Value")}</TableCell>
                    <TableCell>{t("Records Affected")}</TableCell>
                    <TableCell>{t("Updated By")}</TableCell>
                    <TableCell align="right">{t("Actions")}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>
                      {formatDate(
                        new Date(Date.now() - 86400000).toISOString(),
                      )}
                    </TableCell>
                    <TableCell>{t("Beneficiary")}</TableCell>
                    <TableCell>status</TableCell>
                    <TableCell>active</TableCell>
                    <TableCell>45</TableCell>
                    <TableCell>admin</TableCell>
                    <TableCell align="right">
                      <Button size="small">{t("View")}</Button>
                      <Button size="small" color="error">
                        {t("Revert")}
                      </Button>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      {formatDate(
                        new Date(Date.now() - 172800000).toISOString(),
                      )}
                    </TableCell>
                    <TableCell>{t("Project")}</TableCell>
                    <TableCell>assignedTo</TableCell>
                    <TableCell>Team B</TableCell>
                    <TableCell>12</TableCell>
                    <TableCell>manager</TableCell>
                    <TableCell align="right">
                      <Button size="small">{t("View")}</Button>
                      <Button size="small" color="error">
                        {t("Revert")}
                      </Button>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Box>
      )}

      {/* Orphaned Records Tab */}
      {activeTab === "orphaned" && (
        <Box>
          <Box
            sx={{
              mb: 2,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h6">
              {t("Orphaned Record Management")}
            </Typography>
            <Button
              variant="contained"
              startIcon={<Search />}
              onClick={() =>
                showSnackbar("Scanning for orphaned records", "info")
              }
            >
              {t("Scan for Orphaned Records")}
            </Button>
          </Box>

          {orphanedRecords.length > 0 ? (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>{t("Entity Type")}</TableCell>
                    <TableCell>{t("Entity ID")}</TableCell>
                    <TableCell>{t("Missing Relations")}</TableCell>
                    <TableCell>{t("Created Date")}</TableCell>
                    <TableCell>{t("Last Accessed")}</TableCell>
                    <TableCell align="right">{t("Actions")}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orphanedRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>
                        {getEntityTypeName(record.entityType)}
                      </TableCell>
                      <TableCell>{record.entityId}</TableCell>
                      <TableCell>
                        {record.missingRelations.map((relation, index) => (
                          <Chip
                            key={index}
                            size="small"
                            icon={<LinkOff fontSize="small" />}
                            label={`${getEntityTypeName(relation.entityType)}: ${relation.fieldName}`}
                            sx={{ mr: 0.5, mb: 0.5 }}
                          />
                        ))}
                      </TableCell>
                      <TableCell>{formatDate(record.createdDate)}</TableCell>
                      <TableCell>{formatDate(record.lastAccessed)}</TableCell>
                      <TableCell align="right">
                        <Button
                          size="small"
                          startIcon={<Link />}
                          onClick={() => handleFixOrphanedRecord(record.id)}
                          sx={{ mr: 1 }}
                        >
                          {t("Fix")}
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          startIcon={<Delete />}
                          onClick={() => handleDeleteOrphanedRecord(record.id)}
                        >
                          {t("Delete")}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography variant="body1" sx={{ textAlign: "center", my: 4 }}>
              {t(
                "No orphaned records found. Click the 'Scan for Orphaned Records' button to start a new scan.",
              )}
            </Typography>
          )}
        </Box>
      )}

      {/* Data Integrity Tab */}
      {activeTab === "integrity" && (
        <Box>
          <Box
            sx={{
              mb: 2,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h6">{t("Data Integrity Checks")}</Typography>
            <Button
              variant="contained"
              startIcon={<VerifiedUser />}
              onClick={() => showSnackbar("Running integrity checks", "info")}
            >
              {t("Run Integrity Checks")}
            </Button>
          </Box>

          {integrityIssues.length > 0 ? (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>{t("Entity Type")}</TableCell>
                    <TableCell>{t("Entity ID")}</TableCell>
                    <TableCell>{t("Issue Type")}</TableCell>
                    <TableCell>{t("Description")}</TableCell>
                    <TableCell>{t("Severity")}</TableCell>
                    <TableCell>{t("Detected Date")}</TableCell>
                    <TableCell>{t("Status")}</TableCell>
                    <TableCell align="right">{t("Actions")}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {integrityIssues.map((issue) => (
                    <TableRow key={issue.id}>
                      <TableCell>
                        {getEntityTypeName(issue.entityType)}
                      </TableCell>
                      <TableCell>{issue.entityId}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={issue.issueType.replace("_", " ")}
                        />
                      </TableCell>
                      <TableCell>{issue.description}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={issue.severity}
                          sx={{
                            bgcolor: getSeverityColor(issue.severity),
                            color: "white",
                          }}
                        />
                      </TableCell>
                      <TableCell>{formatDate(issue.detectedDate)}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={issue.status.replace("_", " ")}
                          sx={{
                            bgcolor: getStatusColor(issue.status),
                            color: "white",
                          }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Button
                          size="small"
                          startIcon={<Check />}
                          onClick={() => handleResolveIntegrityIssue(issue.id)}
                          disabled={issue.status === "resolved"}
                        >
                          {t("Resolve")}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography variant="body1" sx={{ textAlign: "center", my: 4 }}>
              {t(
                "No integrity issues found. Click the 'Run Integrity Checks' button to start a new scan.",
              )}
            </Typography>
          )}
        </Box>
      )}

      {/* Merge Dialog */}
      <Dialog
        open={openMergeDialog}
        onClose={() => setOpenMergeDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {t("Merge Duplicate Records")}
          <IconButton
            aria-label="close"
            onClick={() => setOpenMergeDialog(false)}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedDuplicateGroup && (
            <>
              <Typography variant="subtitle1" gutterBottom>
                {t("Select which values to keep for each field")}
              </Typography>
              <TableContainer
                component={Paper}
                variant="outlined"
                sx={{ mb: 2 }}
              >
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>{t("Field")}</TableCell>
                      {selectedDuplicateGroup.records.map((record) => (
                        <TableCell key={record.id}>
                          {record.entityId}
                          <Typography variant="caption" display="block">
                            {formatDate(record.lastUpdated)}
                          </Typography>
                        </TableCell>
                      ))}
                      <TableCell>{t("Merged Value")}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedDuplicateGroup.records.length > 0 &&
                      Object.keys(
                        selectedDuplicateGroup.records[0].attributes,
                      ).map((field) => (
                        <TableRow key={field}>
                          <TableCell>{field}</TableCell>
                          {selectedDuplicateGroup.records.map((record) => (
                            <TableCell key={`${record.id}-${field}`}>
                              <Button
                                size="small"
                                variant={
                                  mergedRecord[field] ===
                                  record.attributes[field]
                                    ? "contained"
                                    : "outlined"
                                }
                                onClick={() =>
                                  handleSelectRecordForMerge(
                                    record.id,
                                    field,
                                    record.attributes[field],
                                  )
                                }
                              >
                                {record.attributes[field]}
                              </Button>
                            </TableCell>
                          ))}
                          <TableCell>
                            <TextField
                              size="small"
                              value={mergedRecord[field] || ""}
                              onChange={(e) =>
                                handleSelectRecordForMerge(
                                  "",
                                  field,
                                  e.target.value,
                                )
                              }
                              fullWidth
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <Alert severity="info">
                {t(
                  "The merged record will replace all duplicate records. This action cannot be undone.",
                )}
              </Alert>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenMergeDialog(false)}>
            {t("Cancel")}
          </Button>
          <Button
            onClick={handleMergeDuplicates}
            variant="contained"
            startIcon={<Merge />}
          >
            {t("Merge Records")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Mass Update Dialog */}
      <Dialog
        open={openMassUpdateDialog}
        onClose={() => setOpenMassUpdateDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {t("Create Mass Update")}
          <IconButton
            aria-label="close"
            onClick={() => setOpenMassUpdateDialog(false)}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>{t("Entity Type")}</InputLabel>
                <Select
                  value={entityTypeFilter}
                  label={t("Entity Type")}
                  onChange={(e) => setEntityTypeFilter(e.target.value)}
                >
                  <MenuItem value="all">{t("All Types")}</MenuItem>
                  <MenuItem value="beneficiary">{t("Beneficiary")}</MenuItem>
                  <MenuItem value="supplier">{t("Supplier")}</MenuItem>
                  <MenuItem value="project">{t("Project")}</MenuItem>
                  <MenuItem value="assessment">{t("Assessment")}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t("Search Criteria")}
                placeholder={t("Search by ID, name, etc.")}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="outlined"
                startIcon={<Search />}
                onClick={() => setMassUpdateRecords(["1", "2", "3", "4", "5"])}
                fullWidth
              >
                {t("Find Records")}
              </Button>
            </Grid>
          </Grid>

          {massUpdateRecords.length > 0 && (
            <>
              <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }}>
                {t("Found")} {massUpdateRecords.length}{" "}
                {t("records matching your criteria")}
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>{t("Field to Update")}</InputLabel>
                    <Select
                      value={massUpdateField}
                      label={t("Field to Update")}
                      onChange={(e) =>
                        setMassUpdateField(e.target.value as string)
                      }
                    >
                      <MenuItem value="status">{t("Status")}</MenuItem>
                      <MenuItem value="assignedTo">{t("Assigned To")}</MenuItem>
                      <MenuItem value="priority">{t("Priority")}</MenuItem>
                      <MenuItem value="category">{t("Category")}</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label={t("New Value")}
                    value={massUpdateValue}
                    onChange={(e) => setMassUpdateValue(e.target.value)}
                  />
                </Grid>
              </Grid>
              <Box sx={{ mt: 2 }}>
                <FormControlLabel
                  control={<Checkbox />}
                  label={t(
                    "I understand this will update multiple records and have verified my selection",
                  )}
                />
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenMassUpdateDialog(false)}>
            {t("Cancel")}
          </Button>
          <Button
            onClick={handleMassUpdate}
            variant="contained"
            startIcon={<Save />}
            disabled={
              !massUpdateField ||
              !massUpdateValue ||
              massUpdateRecords.length === 0
            }
          >
            {t("Apply Update")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Filter Dialog */}
      <Dialog
        open={openFilterDialog}
        onClose={() => setOpenFilterDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {t("Filter Options")}
          <IconButton
            aria-label="close"
            onClick={() => setOpenFilterDialog(false)}
            sx={{ position: "absolute", right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>{t("Entity Type")}</InputLabel>
                <Select
                  value={entityTypeFilter}
                  label={t("Entity Type")}
                  onChange={(e) => setEntityTypeFilter(e.target.value)}
                >
                  <MenuItem value="all">{t("All Types")}</MenuItem>
                  <MenuItem value="beneficiary">{t("Beneficiary")}</MenuItem>
                  <MenuItem value="supplier">{t("Supplier")}</MenuItem>
                  <MenuItem value="project">{t("Project")}</MenuItem>
                  <MenuItem value="assessment">{t("Assessment")}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>{t("Severity")}</InputLabel>
                <Select
                  value={severityFilter}
                  label={t("Severity")}
                  onChange={(e) => setSeverityFilter(e.target.value)}
                >
                  <MenuItem value="all">{t("All Severities")}</MenuItem>
                  <MenuItem value="low">{t("Low")}</MenuItem>
                  <MenuItem value="medium">{t("Medium")}</MenuItem>
                  <MenuItem value="high">{t("High")}</MenuItem>
                  <MenuItem value="critical">{t("Critical")}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>{t("Status")}</InputLabel>
                <Select
                  value={statusFilter}
                  label={t("Status")}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <MenuItem value="all">{t("All Statuses")}</MenuItem>
                  <MenuItem value="open">{t("Open")}</MenuItem>
                  <MenuItem value="in_progress">{t("In Progress")}</MenuItem>
                  <MenuItem value="resolved">{t("Resolved")}</MenuItem>
                  <MenuItem value="pending">{t("Pending")}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t("Date Range")}
                type="date"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenFilterDialog(false)}>
            {t("Cancel")}
          </Button>
          <Button
            onClick={handleApplyFilters}
            variant="contained"
            startIcon={<FilterList />}
          >
            {t("Apply Filters")}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DataCleaningTools;
