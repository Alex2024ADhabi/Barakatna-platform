import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
import { useTranslatedDirection } from "@/hooks/useTranslatedDirection";
import { Calendar, Clock, Check, X } from "lucide-react";

const TimesheetTracking = () => {
  const { t } = useTranslation();
  const dir = useTranslatedDirection();
  const [activeTab, setActiveTab] = useState("pending");

  // Mock timesheet data
  const timesheets = [
    {
      id: "1",
      resourceName: "Ahmed Al-Mansouri",
      projectName: "Villa Renovation - Al Ain",
      week: "May 1 - May 7, 2023",
      hours: 38,
      status: "pending",
      submittedDate: "May 8, 2023",
    },
    {
      id: "2",
      resourceName: "Fatima Al-Zahra",
      projectName: "Accessibility Upgrade - Dubai",
      week: "May 1 - May 7, 2023",
      hours: 42,
      status: "pending",
      submittedDate: "May 7, 2023",
    },
    {
      id: "3",
      resourceName: "Mohammed Al-Harbi",
      projectName: "Senior Home Assessment - Sharjah",
      week: "May 1 - May 7, 2023",
      hours: 35,
      status: "approved",
      submittedDate: "May 7, 2023",
      approvedBy: "Khalid Al-Saud",
      approvedDate: "May 9, 2023",
    },
    {
      id: "4",
      resourceName: "Layla Mahmoud",
      projectName: "Healthcare Integration - Abu Dhabi",
      week: "May 1 - May 7, 2023",
      hours: 40,
      status: "approved",
      submittedDate: "May 8, 2023",
      approvedBy: "Khalid Al-Saud",
      approvedDate: "May 10, 2023",
    },
    {
      id: "5",
      resourceName: "Khalid Al-Saud",
      projectName: "Construction Management - Ras Al Khaimah",
      week: "May 1 - May 7, 2023",
      hours: 45,
      status: "rejected",
      submittedDate: "May 8, 2023",
      rejectedBy: "Ahmed Hassan",
      rejectedDate: "May 10, 2023",
      rejectionReason: "Hours exceed project allocation",
    },
  ];

  const filteredTimesheets = timesheets.filter((timesheet) => {
    if (activeTab === "all") return true;
    return timesheet.status === activeTab;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline">{t("manpower.pending")}</Badge>;
      case "approved":
        return <Badge variant="default">{t("manpower.approved")}</Badge>;
      case "rejected":
        return <Badge variant="destructive">{t("manpower.rejected")}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("manpower.timesheetTracking")}</CardTitle>
        <CardDescription>
          {t("manpower.timesheetTrackingDescription")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs
          defaultValue="pending"
          className="space-y-4"
          onValueChange={setActiveTab}
          value={activeTab}
        >
          <TabsList>
            <TabsTrigger value="pending">
              {t("manpower.pending")} (
              {timesheets.filter((t) => t.status === "pending").length})
            </TabsTrigger>
            <TabsTrigger value="approved">
              {t("manpower.approved")} (
              {timesheets.filter((t) => t.status === "approved").length})
            </TabsTrigger>
            <TabsTrigger value="rejected">
              {t("manpower.rejected")} (
              {timesheets.filter((t) => t.status === "rejected").length})
            </TabsTrigger>
            <TabsTrigger value="all">{t("common.all")}</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("manpower.resource")}</TableHead>
                    <TableHead>{t("manpower.project")}</TableHead>
                    <TableHead>{t("manpower.period")}</TableHead>
                    <TableHead>{t("manpower.hours")}</TableHead>
                    <TableHead>{t("manpower.submitted")}</TableHead>
                    <TableHead>{t("common.status")}</TableHead>
                    <TableHead className="text-right">
                      {t("common.actions")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTimesheets.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-4">
                        {t("common.noResults")}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredTimesheets.map((timesheet) => (
                      <TableRow key={timesheet.id}>
                        <TableCell className="font-medium">
                          {timesheet.resourceName}
                        </TableCell>
                        <TableCell>{timesheet.projectName}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                            {timesheet.week}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                            {timesheet.hours} hrs
                          </div>
                        </TableCell>
                        <TableCell>{timesheet.submittedDate}</TableCell>
                        <TableCell>
                          {getStatusBadge(timesheet.status)}
                        </TableCell>
                        <TableCell className="text-right">
                          {timesheet.status === "pending" ? (
                            <div className="flex justify-end space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0"
                              >
                                <Check className="h-4 w-4 text-green-500" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 p-0"
                              >
                                <X className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          ) : (
                            <Button variant="ghost" size="sm">
                              {t("common.view")}
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default TimesheetTracking;
