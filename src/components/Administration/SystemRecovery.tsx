import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Progress } from "../ui/progress";
import {
  Upload,
  Calendar,
  CheckCircle,
  AlertCircle,
  Clock,
  FileCheck,
  Database,
  History,
  Filter,
  Search,
  RotateCcw,
  Layers,
  FileText,
  ClipboardList,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Checkbox } from "../ui/checkbox";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Separator } from "../ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";

// Define backup types and interfaces
interface BackupItem {
  id: number;
  date: string;
  size: string;
  status: string;
  type: string;
  verified: boolean;
  location: string;
  description?: string;
}

interface RecoveryPoint {
  id: number;
  date: string;
  type: string;
  size: string;
  status: string;
  description?: string;
}

interface RecoveryLog {
  id: number;
  date: string;
  user: string;
  backupId: number;
  status: string;
  details: string;
}

const SystemRecovery = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("selection");
  const [recoveryProgress, setRecoveryProgress] = useState(0);
  const [recoveryStatus, setRecoveryStatus] = useState<
    "idle" | "progress" | "success" | "error"
  >("idle");
  const [testProgress, setTestProgress] = useState(0);
  const [testStatus, setTestStatus] = useState<
    "idle" | "progress" | "success" | "error"
  >("idle");
  const [selectedBackupId, setSelectedBackupId] = useState<number | null>(null);
  const [showRecoveryDialog, setShowRecoveryDialog] = useState(false);
  const [showTestDialog, setShowTestDialog] = useState(false);
  const [recoveryType, setRecoveryType] = useState("full");

  // Sample data for backups
  const backupHistory: BackupItem[] = [
    {
      id: 1,
      date: "2023-10-15 08:30",
      size: "1.2 GB",
      status: "Complete",
      type: "Full",
      verified: true,
      location: "/var/backups/barakatna/backup_20231015_083000.zip",
      description: "Weekly full backup",
    },
    {
      id: 2,
      date: "2023-10-08 09:15",
      size: "1.1 GB",
      status: "Complete",
      type: "Full",
      verified: true,
      location: "/var/backups/barakatna/backup_20231008_091500.zip",
    },
    {
      id: 3,
      date: "2023-10-01 07:45",
      size: "1.0 GB",
      status: "Complete",
      type: "Full",
      verified: false,
      location: "/var/backups/barakatna/backup_20231001_074500.zip",
    },
  ];

  // Sample data for recovery points
  const recoveryPoints: RecoveryPoint[] = [
    {
      id: 1,
      date: "2023-10-15 08:30",
      type: "Full Backup",
      size: "1.2 GB",
      status: "Available",
      description: "Weekly full backup",
    },
    {
      id: 2,
      date: "2023-10-14 01:00",
      type: "Incremental",
      size: "0.2 GB",
      status: "Available",
    },
    {
      id: 3,
      date: "2023-10-13 01:00",
      type: "Incremental",
      size: "0.15 GB",
      status: "Available",
    },
    {
      id: 4,
      date: "2023-10-12 01:00",
      type: "Incremental",
      size: "0.18 GB",
      status: "Available",
    },
  ];

  // Sample data for recovery logs
  const recoveryLogs: RecoveryLog[] = [
    {
      id: 1,
      date: "2023-10-10 14:25",
      user: "admin",
      backupId: 2,
      status: "Success",
      details: "Full system recovery completed successfully",
    },
    {
      id: 2,
      date: "2023-09-15 09:30",
      user: "admin",
      backupId: 3,
      status: "Success",
      details: "Selective recovery of user data completed",
    },
    {
      id: 3,
      date: "2023-08-22 16:45",
      user: "system",
      backupId: 3,
      status: "Failed",
      details: "Recovery failed due to corrupted backup file",
    },
  ];

  const handleStartRecovery = () => {
    setRecoveryStatus("progress");
    setRecoveryProgress(0);
    setShowRecoveryDialog(true);

    const interval = setInterval(() => {
      setRecoveryProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setRecoveryStatus("success");
          return 100;
        }
        return prev + 5;
      });
    }, 300);
  };

  const handleTestRecovery = () => {
    setTestStatus("progress");
    setTestProgress(0);
    setShowTestDialog(true);

    const interval = setInterval(() => {
      setTestProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTestStatus("success");
          return 100;
        }
        return prev + 8;
      });
    }, 200);
  };

  const handleSelectBackup = (backupId: number) => {
    setSelectedBackupId(backupId);
  };

  return (
    <div className="space-y-6 bg-white">
      <Card>
        <CardHeader>
          <CardTitle>{t("administration.systemRecovery.title")}</CardTitle>
          <CardDescription>
            {t("administration.systemRecovery.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs
            defaultValue="selection"
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid grid-cols-3 mb-8">
              <TabsTrigger
                value="selection"
                className="flex items-center gap-2"
              >
                <Search className="h-4 w-4" />
                {t("administration.systemRecovery.tabs.selection")}
              </TabsTrigger>
              <TabsTrigger
                value="pointInTime"
                className="flex items-center gap-2"
              >
                <Clock className="h-4 w-4" />
                {t("administration.systemRecovery.tabs.pointInTime")}
              </TabsTrigger>
              <TabsTrigger value="logs" className="flex items-center gap-2">
                <ClipboardList className="h-4 w-4" />
                {t("administration.systemRecovery.tabs.logs")}
              </TabsTrigger>
            </TabsList>

            {/* Backup Selection Tab */}
            <TabsContent value="selection" className="space-y-6">
              <div className="grid gap-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">
                    {t("administration.systemRecovery.selectBackup")}
                  </h3>
                  <div className="flex gap-2">
                    <Input placeholder="Search backups..." className="w-64" />
                    <Button variant="outline">
                      <Filter className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                  </div>
                </div>

                <div className="border rounded-md overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="p-2 text-left">
                          {t("administration.systemRecovery.table.date")}
                        </th>
                        <th className="p-2 text-left">
                          {t("administration.systemRecovery.table.type")}
                        </th>
                        <th className="p-2 text-left">
                          {t("administration.systemRecovery.table.size")}
                        </th>
                        <th className="p-2 text-left">
                          {t("administration.systemRecovery.table.status")}
                        </th>
                        <th className="p-2 text-left">
                          {t("administration.systemRecovery.table.verified")}
                        </th>
                        <th className="p-2 text-left">
                          {t("administration.systemRecovery.table.actions")}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {backupHistory.map((backup) => (
                        <tr
                          key={backup.id}
                          className={`border-b ${selectedBackupId === backup.id ? "bg-blue-50" : ""}`}
                          onClick={() => handleSelectBackup(backup.id)}
                        >
                          <td className="p-2 flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {backup.date}
                          </td>
                          <td className="p-2">{backup.type}</td>
                          <td className="p-2">{backup.size}</td>
                          <td className="p-2">
                            <Badge
                              variant="outline"
                              className="bg-green-50 text-green-700 hover:bg-green-100"
                            >
                              {backup.status}
                            </Badge>
                          </td>
                          <td className="p-2">
                            {backup.verified ? (
                              <Badge
                                variant="outline"
                                className="bg-green-50 text-green-700 hover:bg-green-100"
                              >
                                <FileCheck className="h-3 w-3 mr-1" />
                                Verified
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="bg-yellow-50 text-yellow-700 hover:bg-yellow-100"
                              >
                                Not Verified
                              </Badge>
                            )}
                          </td>
                          <td className="p-2">
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleSelectBackup(backup.id)}
                              >
                                Select
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {selectedBackupId && (
                  <div className="border rounded-md p-4 space-y-4">
                    <h3 className="font-medium">Recovery Options</h3>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <RadioGroup
                          defaultValue="full"
                          onValueChange={setRecoveryType}
                        >
                          <div className="flex items-center space-x-2 mb-2">
                            <RadioGroupItem value="full" id="r1" />
                            <Label htmlFor="r1">Full System Recovery</Label>
                          </div>
                          <div className="flex items-center space-x-2 mb-2">
                            <RadioGroupItem value="selective" id="r2" />
                            <Label htmlFor="r2">Selective Data Recovery</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="database" id="r3" />
                            <Label htmlFor="r3">Database Only Recovery</Label>
                          </div>
                        </RadioGroup>
                      </div>

                      {recoveryType === "selective" && (
                        <div className="space-y-2">
                          <Label>Select Data to Recover</Label>
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Checkbox id="user-data" />
                              <Label htmlFor="user-data">User Data</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="config-files" />
                              <Label htmlFor="config-files">
                                Configuration Files
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="media-files" />
                              <Label htmlFor="media-files">Media Files</Label>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <Separator className="my-4" />

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="recovery-target">Recovery Target</Label>
                        <Select defaultValue="original">
                          <SelectTrigger id="recovery-target" className="mt-1">
                            <SelectValue placeholder="Select recovery target" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="original">
                              Original Location
                            </SelectItem>
                            <SelectItem value="alternate">
                              Alternate Location
                            </SelectItem>
                            <SelectItem value="test">
                              Test Environment
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox id="verify-after" defaultChecked />
                          <Label htmlFor="verify-after">
                            Verify after recovery
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="log-details" defaultChecked />
                          <Label htmlFor="log-details">
                            Log detailed recovery information
                          </Label>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <Button onClick={handleStartRecovery}>
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Start Recovery
                      </Button>
                      <Button variant="outline" onClick={handleTestRecovery}>
                        <FileCheck className="h-4 w-4 mr-2" />
                        Test Recovery
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Point-in-Time Recovery Tab */}
            <TabsContent value="pointInTime" className="space-y-6">
              <div className="grid gap-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">
                    {t("administration.systemRecovery.pointInTimeRecovery")}
                  </h3>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="recovery-date">Recovery Date</Label>
                      <Input type="date" id="recovery-date" />
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="recovery-time">Recovery Time</Label>
                      <Input type="time" id="recovery-time" />
                    </div>

                    <Button className="mt-2">
                      <Search className="h-4 w-4 mr-2" />
                      Find Recovery Points
                    </Button>
                  </div>

                  <div className="border rounded-md p-4">
                    <h4 className="font-medium mb-2">
                      Available Recovery Points
                    </h4>
                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {recoveryPoints.map((point) => (
                        <div
                          key={point.id}
                          className="border rounded-md p-3 hover:bg-muted/50 cursor-pointer"
                          onClick={() => handleSelectBackup(point.id)}
                        >
                          <div className="flex justify-between">
                            <span className="font-medium">{point.date}</span>
                            <Badge variant="outline">{point.type}</Badge>
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {point.size} • {point.status}
                          </div>
                          {point.description && (
                            <div className="text-sm mt-1">
                              {point.description}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="border rounded-md p-4">
                  <h3 className="font-medium mb-3">
                    Point-in-Time Recovery Options
                  </h3>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <RadioGroup defaultValue="database">
                        <div className="flex items-center space-x-2 mb-2">
                          <RadioGroupItem value="database" id="pit-db" />
                          <Label htmlFor="pit-db">Database Recovery</Label>
                        </div>
                        <div className="flex items-center space-x-2 mb-2">
                          <RadioGroupItem value="files" id="pit-files" />
                          <Label htmlFor="pit-files">
                            File System Recovery
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="both" id="pit-both" />
                          <Label htmlFor="pit-both">
                            Complete System Recovery
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="pit-verify" defaultChecked />
                        <Label htmlFor="pit-verify">
                          Verify consistency after recovery
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="pit-test" />
                        <Label htmlFor="pit-test">
                          Perform test recovery first
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="pit-log" defaultChecked />
                        <Label htmlFor="pit-log">
                          Generate detailed recovery report
                        </Label>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-4">
                    <Button onClick={handleStartRecovery}>
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Start Point-in-Time Recovery
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Recovery Logs Tab */}
            <TabsContent value="logs" className="space-y-6">
              <div className="grid gap-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">
                    {t("administration.systemRecovery.recoveryLogs")}
                  </h3>
                  <Button variant="outline">
                    <FileText className="h-4 w-4 mr-2" />
                    Export Logs
                  </Button>
                </div>

                <div className="border rounded-md overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="p-2 text-left">
                          {t("administration.systemRecovery.table.date")}
                        </th>
                        <th className="p-2 text-left">
                          {t("administration.systemRecovery.table.user")}
                        </th>
                        <th className="p-2 text-left">
                          {t("administration.systemRecovery.table.backupId")}
                        </th>
                        <th className="p-2 text-left">
                          {t("administration.systemRecovery.table.status")}
                        </th>
                        <th className="p-2 text-left">
                          {t("administration.systemRecovery.table.details")}
                        </th>
                        <th className="p-2 text-left">
                          {t("administration.systemRecovery.table.actions")}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {recoveryLogs.map((log) => (
                        <tr key={log.id} className="border-b">
                          <td className="p-2">{log.date}</td>
                          <td className="p-2">{log.user}</td>
                          <td className="p-2">{log.backupId}</td>
                          <td className="p-2">
                            <Badge
                              variant="outline"
                              className={
                                log.status === "Success"
                                  ? "bg-green-50 text-green-700"
                                  : "bg-red-50 text-red-700"
                              }
                            >
                              {log.status}
                            </Badge>
                          </td>
                          <td className="p-2">{log.details}</td>
                          <td className="p-2">
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="border rounded-md p-4">
                  <h3 className="font-medium mb-3">Recovery Audit Settings</h3>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="audit-success" defaultChecked />
                        <Label htmlFor="audit-success">
                          Log successful recoveries
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="audit-failed" defaultChecked />
                        <Label htmlFor="audit-failed">
                          Log failed recoveries
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="audit-tests" defaultChecked />
                        <Label htmlFor="audit-tests">Log recovery tests</Label>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="retention-period">
                        Log Retention Period
                      </Label>
                      <Select defaultValue="90days">
                        <SelectTrigger id="retention-period">
                          <SelectValue placeholder="Select retention period" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="30days">30 days</SelectItem>
                          <SelectItem value="90days">90 days</SelectItem>
                          <SelectItem value="1year">1 year</SelectItem>
                          <SelectItem value="permanent">Permanent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-4">
                    <Button variant="outline">
                      <Settings className="h-4 w-4 mr-2" />
                      Save Audit Settings
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Recovery Progress Dialog */}
      <Dialog open={showRecoveryDialog} onOpenChange={setShowRecoveryDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {t("administration.systemRecovery.recoveryProgress")}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {recoveryStatus === "progress" && (
              <div className="space-y-4">
                <div className="text-center">
                  <p className="mb-2">Recovery in progress...</p>
                  <p className="text-sm text-muted-foreground">
                    Please do not close this window or interrupt the process.
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Recovery progress</span>
                    <span>{recoveryProgress}%</span>
                  </div>
                  <Progress value={recoveryProgress} className="h-2" />
                </div>
                <div className="space-y-1 text-sm">
                  <p>✓ Preparing recovery environment</p>
                  <p>✓ Extracting backup data</p>
                  {recoveryProgress > 30 && <p>✓ Restoring system files</p>}
                  {recoveryProgress > 60 && <p>✓ Restoring database</p>}
                  {recoveryProgress > 80 && <p>✓ Validating restored data</p>}
                </div>
              </div>
            )}

            {recoveryStatus === "success" && (
              <div className="space-y-4">
                <div className="bg-green-50 p-4 rounded-md flex items-center gap-2 text-green-700">
                  <CheckCircle className="h-5 w-5" />
                  <span>Recovery completed successfully!</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Files restored:</span>
                    <span>12,458</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Database tables:</span>
                    <span>42</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Recovery time:</span>
                    <span>5m 23s</span>
                  </div>
                </div>
              </div>
            )}

            {recoveryStatus === "error" && (
              <div className="space-y-4">
                <div className="bg-red-50 p-4 rounded-md flex items-center gap-2 text-red-700">
                  <AlertCircle className="h-5 w-5" />
                  <span>Recovery failed!</span>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-red-700">
                    An error occurred during the recovery process. Please check
                    the logs for more details.
                  </p>
                </div>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-3">
            {recoveryStatus === "progress" ? (
              <Button variant="outline" disabled>
                Cancel
              </Button>
            ) : (
              <Button onClick={() => setShowRecoveryDialog(false)}>
                Close
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Test Recovery Dialog */}
      <Dialog open={showTestDialog} onOpenChange={setShowTestDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {t("administration.systemRecovery.testRecovery")}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {testStatus === "progress" && (
              <div className="space-y-4">
                <div className="text-center">
                  <p className="mb-2">Testing recovery process...</p>
                  <p className="text-sm text-muted-foreground">
                    This will validate the backup without affecting the live
                    system.
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Test progress</span>
                    <span>{testProgress}%</span>
                  </div>
                  <Progress value={testProgress} className="h-2" />
                </div>
                <div className="space-y-1 text-sm">
                  <p>✓ Creating test environment</p>
                  <p>✓ Extracting backup data</p>
                  {testProgress > 40 && <p>✓ Validating file integrity</p>}
                  {testProgress > 70 && <p>✓ Testing database restoration</p>}
                  {testProgress > 90 && <p>✓ Generating test report</p>}
                </div>
              </div>
            )}

            {testStatus === "success" && (
              <div className="space-y-4">
                <div className="bg-green-50 p-4 rounded-md flex items-center gap-2 text-green-700">
                  <CheckCircle className="h-5 w-5" />
                  <span>Recovery test completed successfully!</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Files tested:</span>
                    <span>12,458</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Database integrity:</span>
                    <span>100%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Estimated recovery time:</span>
                    <span>~5 minutes</span>
                  </div>
                </div>
                <div className="bg-blue-50 p-3 rounded-md text-sm text-blue-700">
                  The backup is valid and can be used for a full system
                  recovery.
                </div>
              </div>
            )}

            {testStatus === "error" && (
              <div className="space-y-4">
                <div className="bg-red-50 p-4 rounded-md flex items-center gap-2 text-red-700">
                  <AlertCircle className="h-5 w-5" />
                  <span>Recovery test failed!</span>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-red-700">
                    The test recovery process encountered errors. This backup
                    may not be suitable for recovery.
                  </p>
                </div>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-3">
            {testStatus === "progress" ? (
              <Button variant="outline" disabled>
                Cancel
              </Button>
            ) : (
              <Button onClick={() => setShowTestDialog(false)}>Close</Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SystemRecovery;
