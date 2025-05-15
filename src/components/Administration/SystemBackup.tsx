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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Progress } from "../ui/progress";
import {
  Download,
  Upload,
  Calendar,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

const SystemBackup = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("backup");
  const [backupProgress, setBackupProgress] = useState(0);
  const [restoreProgress, setRestoreProgress] = useState(0);
  const [backupStatus, setBackupStatus] = useState<
    "idle" | "progress" | "success" | "error"
  >("idle");
  const [restoreStatus, setRestoreStatus] = useState<
    "idle" | "progress" | "success" | "error"
  >("idle");

  const backupHistory = [
    { id: 1, date: "2023-10-15 08:30", size: "1.2 GB", status: "Complete" },
    { id: 2, date: "2023-10-08 09:15", size: "1.1 GB", status: "Complete" },
    { id: 3, date: "2023-10-01 07:45", size: "1.0 GB", status: "Complete" },
  ];

  const handleBackup = () => {
    setBackupStatus("progress");
    setBackupProgress(0);

    const interval = setInterval(() => {
      setBackupProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setBackupStatus("success");
          return 100;
        }
        return prev + 10;
      });
    }, 500);
  };

  const handleRestore = () => {
    setRestoreStatus("progress");
    setRestoreProgress(0);

    const interval = setInterval(() => {
      setRestoreProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setRestoreStatus("success");
          return 100;
        }
        return prev + 5;
      });
    }, 300);
  };

  return (
    <div className="space-y-6 bg-white">
      <Card>
        <CardHeader>
          <CardTitle>{t("administration.systemBackup.title")}</CardTitle>
          <CardDescription>
            {t("administration.systemBackup.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs
            defaultValue="backup"
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid grid-cols-3 mb-8">
              <TabsTrigger value="backup" className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                {t("administration.systemBackup.tabs.backup")}
              </TabsTrigger>
              <TabsTrigger
                value="scheduled"
                className="flex items-center gap-2"
              >
                <Clock className="h-4 w-4" />
                {t("administration.systemBackup.tabs.scheduled")}
              </TabsTrigger>
              <TabsTrigger
                value="management"
                className="flex items-center gap-2"
              >
                <HardDrive className="h-4 w-4" />
                {t("administration.systemBackup.tabs.management")}
              </TabsTrigger>
            </TabsList>

            {/* Manual Backup Tab */}
            <TabsContent value="backup" className="space-y-6">
              <div className="grid gap-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="grid gap-3">
                    <Label htmlFor="backup-location">
                      {t("administration.systemBackup.backupLocation")}
                    </Label>
                    <Input
                      id="backup-location"
                      placeholder="/var/backups/barakatna"
                      defaultValue="/var/backups/barakatna"
                    />
                  </div>

                  <div className="grid gap-3">
                    <Label htmlFor="backup-type">
                      {t("administration.systemBackup.backupType")}
                    </Label>
                    <Select defaultValue="full">
                      <SelectTrigger id="backup-type">
                        <SelectValue placeholder="Select backup type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full">
                          {t("administration.systemBackup.types.full")}
                        </SelectItem>
                        <SelectItem value="incremental">
                          {t("administration.systemBackup.types.incremental")}
                        </SelectItem>
                        <SelectItem value="differential">
                          {t("administration.systemBackup.types.differential")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="grid gap-3">
                    <Label htmlFor="backup-description">
                      {t("administration.systemBackup.backupDescription")}
                    </Label>
                    <Input
                      id="backup-description"
                      placeholder="Enter a description for this backup"
                    />
                  </div>

                  <div className="grid gap-3">
                    <Label htmlFor="backup-retention">
                      {t("administration.systemBackup.retentionPeriod")}
                    </Label>
                    <Select defaultValue="30days">
                      <SelectTrigger id="backup-retention">
                        <SelectValue placeholder="Select retention period" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7days">7 days</SelectItem>
                        <SelectItem value="30days">30 days</SelectItem>
                        <SelectItem value="90days">90 days</SelectItem>
                        <SelectItem value="1year">1 year</SelectItem>
                        <SelectItem value="permanent">Permanent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="verify-backup" defaultChecked />
                    <Label htmlFor="verify-backup">
                      {t("administration.systemBackup.verifyAfterBackup")}
                    </Label>
                  </div>
                </div>

                {backupStatus === "progress" && (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>
                        {t("administration.systemBackup.backupInProgress")}
                      </span>
                      <span>{backupProgress}%</span>
                    </div>
                    <Progress value={backupProgress} className="h-2" />
                  </div>
                )}

                {backupStatus === "success" && (
                  <div className="bg-green-50 p-4 rounded-md flex items-center gap-2 text-green-700">
                    <CheckCircle className="h-5 w-5" />
                    <span>
                      {t("administration.systemBackup.backupSuccess")}
                    </span>
                  </div>
                )}

                {backupStatus === "error" && (
                  <div className="bg-red-50 p-4 rounded-md flex items-center gap-2 text-red-700">
                    <AlertCircle className="h-5 w-5" />
                    <span>{t("administration.systemBackup.backupError")}</span>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    onClick={handleBackup}
                    disabled={backupStatus === "progress"}
                    className="w-full md:w-auto"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {t("administration.systemBackup.startBackup")}
                  </Button>

                  <Button
                    variant="outline"
                    onClick={handleScheduleBackup}
                    className="w-full md:w-auto"
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    {t("administration.systemBackup.scheduleBackup")}
                  </Button>
                </div>

                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-4">
                    {t("administration.systemBackup.backupHistory")}
                  </h3>
                  <div className="border rounded-md overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-muted/50">
                          <th className="p-2 text-left">
                            {t("administration.systemBackup.table.date")}
                          </th>
                          <th className="p-2 text-left">
                            {t("administration.systemBackup.table.type")}
                          </th>
                          <th className="p-2 text-left">
                            {t("administration.systemBackup.table.size")}
                          </th>
                          <th className="p-2 text-left">
                            {t("administration.systemBackup.table.status")}
                          </th>
                          <th className="p-2 text-left">
                            {t("administration.systemBackup.table.verified")}
                          </th>
                          <th className="p-2 text-left">
                            {t("administration.systemBackup.table.actions")}
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {backupHistory.map((backup) => (
                          <tr key={backup.id} className="border-b">
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
                                  onClick={() => handleVerifyBackup(backup.id)}
                                  disabled={backup.verified}
                                >
                                  Verify
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteBackup(backup.id)}
                                >
                                  Delete
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Scheduled Backups Tab */}
            <TabsContent value="scheduled" className="space-y-6">
              <div className="grid gap-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">
                    {t("administration.systemBackup.scheduledBackups")}
                  </h3>
                  <Button onClick={handleScheduleBackup}>
                    <Clock className="h-4 w-4 mr-2" />
                    {t("administration.systemBackup.newSchedule")}
                  </Button>
                </div>

                <div className="border rounded-md overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-muted/50">
                        <th className="p-2 text-left">
                          {t("administration.systemBackup.table.name")}
                        </th>
                        <th className="p-2 text-left">
                          {t("administration.systemBackup.table.frequency")}
                        </th>
                        <th className="p-2 text-left">
                          {t("administration.systemBackup.table.nextRun")}
                        </th>
                        <th className="p-2 text-left">
                          {t("administration.systemBackup.table.type")}
                        </th>
                        <th className="p-2 text-left">
                          {t("administration.systemBackup.table.retention")}
                        </th>
                        <th className="p-2 text-left">
                          {t("administration.systemBackup.table.status")}
                        </th>
                        <th className="p-2 text-left">
                          {t("administration.systemBackup.table.actions")}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {scheduledBackups.map((schedule) => (
                        <tr key={schedule.id} className="border-b">
                          <td className="p-2">{schedule.name}</td>
                          <td className="p-2">{schedule.frequency}</td>
                          <td className="p-2">{schedule.nextRun}</td>
                          <td className="p-2">{schedule.type}</td>
                          <td className="p-2">{schedule.retention}</td>
                          <td className="p-2">
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={schedule.status === "Active"}
                                onCheckedChange={(checked) =>
                                  handleToggleSchedule(schedule.id, checked)
                                }
                              />
                              <span>{schedule.status}</span>
                            </div>
                          </td>
                          <td className="p-2">
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowScheduleDialog(true)}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteBackup(schedule.id)}
                              >
                                Delete
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>

            {/* Backup Management Tab */}
            <TabsContent value="management" className="space-y-6">
              <div className="grid gap-6">
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="storage">
                    <AccordionTrigger className="text-lg font-medium">
                      <div className="flex items-center gap-2">
                        <HardDrive className="h-5 w-5" />
                        {t("administration.systemBackup.storageManagement")}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4 p-4">
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-medium mb-2">Storage Usage</h4>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span>Total Space</span>
                                <span>500 GB</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Used Space</span>
                                <span>125 GB (25%)</span>
                              </div>
                              <Progress value={25} className="h-2" />
                            </div>
                          </div>

                          <div>
                            <h4 className="font-medium mb-2">
                              Storage Locations
                            </h4>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span>Primary Location</span>
                                <span>/var/backups/barakatna</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Secondary Location</span>
                                <span>/mnt/backup-drive/barakatna</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Cloud Storage</span>
                                <span>s3://barakatna-backups/</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="pt-4">
                          <h4 className="font-medium mb-2">Storage Settings</h4>
                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="flex items-center space-x-2">
                              <Checkbox id="compress-backups" defaultChecked />
                              <Label htmlFor="compress-backups">
                                Compress backups
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="encrypt-backups" defaultChecked />
                              <Label htmlFor="encrypt-backups">
                                Encrypt backups
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="auto-cleanup" defaultChecked />
                              <Label htmlFor="auto-cleanup">
                                Auto cleanup expired backups
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox id="replicate-backups" defaultChecked />
                              <Label htmlFor="replicate-backups">
                                Replicate to secondary location
                              </Label>
                            </div>
                          </div>
                        </div>

                        <div className="pt-4">
                          <Button variant="outline">
                            <Settings className="h-4 w-4 mr-2" />
                            Configure Storage
                          </Button>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="catalog">
                    <AccordionTrigger className="text-lg font-medium">
                      <div className="flex items-center gap-2">
                        <Database className="h-5 w-5" />
                        {t("administration.systemBackup.backupCatalog")}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4 p-4">
                        <div className="flex justify-between items-center">
                          <h4 className="font-medium">
                            Backup Catalog Statistics
                          </h4>
                          <Button variant="outline" size="sm">
                            <History className="h-4 w-4 mr-2" />
                            View Full History
                          </Button>
                        </div>

                        <div className="grid md:grid-cols-3 gap-4">
                          <div className="border rounded-md p-4">
                            <div className="text-sm text-muted-foreground">
                              Total Backups
                            </div>
                            <div className="text-2xl font-bold">42</div>
                          </div>
                          <div className="border rounded-md p-4">
                            <div className="text-sm text-muted-foreground">
                              Total Size
                            </div>
                            <div className="text-2xl font-bold">125 GB</div>
                          </div>
                          <div className="border rounded-md p-4">
                            <div className="text-sm text-muted-foreground">
                              Oldest Backup
                            </div>
                            <div className="text-2xl font-bold">180 days</div>
                          </div>
                        </div>

                        <div className="pt-4">
                          <h4 className="font-medium mb-2">
                            Catalog Management
                          </h4>
                          <div className="grid md:grid-cols-2 gap-4">
                            <Button variant="outline">Export Catalog</Button>
                            <Button variant="outline">Import Catalog</Button>
                            <Button variant="outline">Rebuild Catalog</Button>
                            <Button variant="outline">
                              Verify All Backups
                            </Button>
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Schedule Backup Dialog */}
      <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {t("administration.systemBackup.scheduleBackup")}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="schedule-name">Name</Label>
              <Input id="schedule-name" placeholder="Daily Backup" />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="schedule-frequency">Frequency</Label>
                <Select defaultValue="daily">
                  <SelectTrigger id="schedule-frequency">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="schedule-time">Time</Label>
                <Input id="schedule-time" type="time" defaultValue="01:00" />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="schedule-type">Backup Type</Label>
                <Select defaultValue="incremental">
                  <SelectTrigger id="schedule-type">
                    <SelectValue placeholder="Select backup type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full">Full</SelectItem>
                    <SelectItem value="incremental">Incremental</SelectItem>
                    <SelectItem value="differential">Differential</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="schedule-retention">Retention Period</Label>
                <Select defaultValue="30days">
                  <SelectTrigger id="schedule-retention">
                    <SelectValue placeholder="Select retention period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7days">7 days</SelectItem>
                    <SelectItem value="30days">30 days</SelectItem>
                    <SelectItem value="90days">90 days</SelectItem>
                    <SelectItem value="1year">1 year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <div className="flex items-center space-x-2">
                <Checkbox id="schedule-verify" defaultChecked />
                <Label htmlFor="schedule-verify">Verify after backup</Label>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setShowScheduleDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveSchedule}>Save Schedule</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Verification Dialog */}
      <Dialog
        open={showVerificationDialog}
        onOpenChange={setShowVerificationDialog}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {t("administration.systemBackup.verifyBackup")}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {verificationStatus === "progress" && (
              <div className="space-y-4">
                <div className="text-center">
                  <p className="mb-2">Verifying backup integrity...</p>
                  <p className="text-sm text-muted-foreground">
                    This may take several minutes depending on the backup size.
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Verification progress</span>
                    <span>{verificationProgress}%</span>
                  </div>
                  <Progress value={verificationProgress} className="h-2" />
                </div>
                <div className="space-y-1 text-sm">
                  <p>✓ Checking backup metadata</p>
                  <p>✓ Verifying file checksums</p>
                  {verificationProgress > 50 && <p>✓ Testing data integrity</p>}
                  {verificationProgress > 80 && (
                    <p>✓ Validating database consistency</p>
                  )}
                </div>
              </div>
            )}

            {verificationStatus === "success" && (
              <div className="space-y-4">
                <div className="bg-green-50 p-4 rounded-md flex items-center gap-2 text-green-700">
                  <CheckCircle className="h-5 w-5" />
                  <span>Backup verification completed successfully!</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Files verified:</span>
                    <span>1,245</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Data integrity:</span>
                    <span>100%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Database consistency:</span>
                    <span>Valid</span>
                  </div>
                </div>
              </div>
            )}

            {verificationStatus === "error" && (
              <div className="space-y-4">
                <div className="bg-red-50 p-4 rounded-md flex items-center gap-2 text-red-700">
                  <AlertCircle className="h-5 w-5" />
                  <span>Backup verification failed!</span>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-red-700">
                    The backup appears to be corrupted or incomplete. Please
                    create a new backup.
                  </p>
                </div>
              </div>
            )}
          </div>
          <div className="flex justify-end">
            <Button onClick={() => setShowVerificationDialog(false)}>
              {verificationStatus === "progress" ? "Cancel" : "Close"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SystemBackup;
