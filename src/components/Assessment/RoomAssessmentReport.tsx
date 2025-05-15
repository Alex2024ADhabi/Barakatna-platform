import React, { useState, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RoomForComponent } from "@/hooks/useRoomAssessments";
import {
  Download,
  Printer,
  FileText,
  Share2,
  Mail,
  Filter,
  ChevronDown,
  ChevronUp,
  Camera,
  FileSpreadsheet,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface RoomAssessmentReportProps {
  rooms: RoomForComponent[];
  clientType?: string;
  assessmentId?: string;
  assessmentDate?: string;
  assessor?: string;
  beneficiaryName?: string;
  beneficiaryId?: string;
  propertyAddress?: string;
  propertyType?: string;
  reportType?: "summary" | "detailed" | "compliance" | "cost" | "adha" | "fdf";
}

const RoomAssessmentReport: React.FC<RoomAssessmentReportProps> = ({
  rooms,
  clientType = "CASH",
  assessmentId = "1",
  assessmentDate = new Date().toISOString(),
  assessor = "John Doe",
  beneficiaryName = "Ahmed Abdullah",
  beneficiaryId = "BEN-2023-001",
  propertyAddress = "123 Main St, Riyadh, Saudi Arabia",
  propertyType = "Residential",
  reportType = "summary",
}) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("summary");
  const [filterCompliance, setFilterCompliance] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>("name");
  const [expandedRooms, setExpandedRooms] = useState<Record<string, boolean>>(
    {},
  );
  const reportRef = useRef<HTMLDivElement>(null);

  // Calculate overall statistics
  const totalRooms = rooms.length;
  const completedRooms = rooms.filter((room) => room.completed).length;
  const completionPercentage =
    totalRooms > 0 ? (completedRooms / totalRooms) * 100 : 0;

  const totalMeasurements = rooms.reduce(
    (sum, room) => sum + room.measurements.length,
    0,
  );
  const compliantMeasurements = rooms.reduce(
    (sum, room) =>
      sum + room.measurements.filter((m) => m.isCompliant === true).length,
    0,
  );
  const compliancePercentage =
    totalMeasurements > 0
      ? (compliantMeasurements / totalMeasurements) * 100
      : 0;

  const totalRecommendations = rooms.reduce(
    (sum, room) => sum + room.recommendations.length,
    0,
  );
  const selectedRecommendations = rooms.reduce(
    (sum, room) => sum + room.recommendations.filter((r) => r.selected).length,
    0,
  );

  const totalCost = rooms.reduce(
    (sum, room) =>
      sum +
      room.recommendations
        .filter((r) => r.selected)
        .reduce((s, r) => s + r.estimatedCost, 0),
    0,
  );

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  // Handle print report
  const handlePrint = () => {
    window.print();
  };

  // Handle export as PDF
  const handleExportPDF = useCallback(() => {
    // In a real implementation, this would use a PDF generation library
    // For now, we'll simulate the export process
    const reportElement = reportRef.current;
    if (!reportElement) return;

    // Show export in progress
    const exportNotification = document.createElement("div");
    exportNotification.className =
      "fixed top-4 right-4 bg-primary text-white p-4 rounded shadow-lg z-50";
    exportNotification.innerHTML = `<div class="flex items-center"><div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>${t("Generating PDF...")}</div>`;
    document.body.appendChild(exportNotification);

    // Simulate export delay
    setTimeout(() => {
      document.body.removeChild(exportNotification);

      // Show success notification
      const successNotification = document.createElement("div");
      successNotification.className =
        "fixed top-4 right-4 bg-green-600 text-white p-4 rounded shadow-lg z-50";
      successNotification.innerHTML = `<div class="flex items-center"><svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>${t("PDF exported successfully")}</div>`;
      document.body.appendChild(successNotification);

      // Remove success notification after 3 seconds
      setTimeout(() => {
        document.body.removeChild(successNotification);
      }, 3000);

      // In a real implementation, this would trigger the download
      const filename = `${beneficiaryName.replace(/\s+/g, "_")}_Assessment_Report_${new Date().toISOString().split("T")[0]}.pdf`;
      console.log(`PDF would be downloaded as: ${filename}`);

      // Trigger committee submission if this is a final report
      if (
        reportType === "compliance" ||
        reportType === "adha" ||
        reportType === "fdf"
      ) {
        // This would integrate with the committee submission process
        console.log(
          `Assessment report ${assessmentId} for ${beneficiaryName} submitted to committee for review`,
        );

        // In a real implementation, this would call an API or event bus
        // eventBus.publishEvent(EventType.ASSESSMENT_SUBMITTED_TO_COMMITTEE, {
        //   assessmentId,
        //   beneficiaryId,
        //   beneficiaryName,
        //   clientType,
        //   reportType,
        //   submissionDate: new Date().toISOString()
        // });
      }
    }, 2000);
  }, [t, beneficiaryName, assessmentId, beneficiaryId, clientType, reportType]);

  // Handle export as Excel
  const handleExportExcel = useCallback(() => {
    // In a real implementation, this would use an Excel generation library
    // For now, we'll simulate the export process

    // Show export in progress
    const exportNotification = document.createElement("div");
    exportNotification.className =
      "fixed top-4 right-4 bg-primary text-white p-4 rounded shadow-lg z-50";
    exportNotification.innerHTML = `<div class="flex items-center"><div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>${t("Generating Excel...")}</div>`;
    document.body.appendChild(exportNotification);

    // Simulate export delay
    setTimeout(() => {
      document.body.removeChild(exportNotification);

      // Show success notification
      const successNotification = document.createElement("div");
      successNotification.className =
        "fixed top-4 right-4 bg-green-600 text-white p-4 rounded shadow-lg z-50";
      successNotification.innerHTML = `<div class="flex items-center"><svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>${t("Excel exported successfully")}</div>`;
      document.body.appendChild(successNotification);

      // Remove success notification after 3 seconds
      setTimeout(() => {
        document.body.removeChild(successNotification);
      }, 3000);

      // In a real implementation, this would trigger the download
      const filename = `${beneficiaryName.replace(/\s+/g, "_")}_Assessment_Report_${new Date().toISOString().split("T")[0]}.xlsx`;
      console.log(`Excel would be downloaded as: ${filename}`);
    }, 1500);
  }, [t, beneficiaryName]);

  // Toggle room expansion in detailed view
  const toggleRoomExpansion = (roomId: string) => {
    setExpandedRooms((prev) => ({
      ...prev,
      [roomId]: !prev[roomId],
    }));
  };

  // Filter rooms based on compliance status
  const filteredRooms = filterCompliance
    ? rooms.filter((room) => {
        const roomCompliantMeasurements = room.measurements.filter(
          (m) => m.isCompliant === true,
        ).length;
        const roomTotalMeasurements = room.measurements.length;
        const roomCompliancePercentage =
          roomTotalMeasurements > 0
            ? (roomCompliantMeasurements / roomTotalMeasurements) * 100
            : 0;

        if (filterCompliance === "compliant") {
          return roomCompliancePercentage >= 90; // 90% or more compliant
        } else if (filterCompliance === "partial") {
          return (
            roomCompliancePercentage >= 50 && roomCompliancePercentage < 90
          );
        } else {
          return roomCompliancePercentage < 50;
        }
      })
    : rooms;

  // Sort rooms based on selected criteria
  const sortedRooms = [...filteredRooms].sort((a, b) => {
    if (sortBy === "name") {
      return a.name.localeCompare(b.name);
    } else if (sortBy === "compliance") {
      const aCompliance =
        (a.measurements.filter((m) => m.isCompliant === true).length /
          a.measurements.length) *
          100 || 0;
      const bCompliance =
        (b.measurements.filter((m) => m.isCompliant === true).length /
          b.measurements.length) *
          100 || 0;
      return bCompliance - aCompliance;
    } else if (sortBy === "cost") {
      const aCost = a.recommendations
        .filter((r) => r.selected)
        .reduce((sum, r) => sum + r.estimatedCost, 0);
      const bCost = b.recommendations
        .filter((r) => r.selected)
        .reduce((sum, r) => sum + r.estimatedCost, 0);
      return bCost - aCost;
    } else if (sortBy === "recommendations") {
      return b.recommendations.length - a.recommendations.length;
    }
    return 0;
  });

  // Handle email report
  const handleEmail = () => {
    // This would be implemented with an email service
    alert(t("Email functionality would be implemented with an email service"));
  };

  // Handle share report
  const handleShare = () => {
    // This would be implemented with a sharing service
    alert(t("Share functionality would be implemented with a sharing service"));
  };

  return (
    <div className="space-y-6" ref={reportRef}>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{t("Room Assessment Report")}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {clientType === "ADHA"
                ? t("ADHA Compliance Assessment")
                : clientType === "FDF"
                  ? t("FDF Funding Eligibility Assessment")
                  : t("Cash Client Assessment")}
            </p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              {t("Print")}
            </Button>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  {t("Export")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48">
                <div className="flex flex-col space-y-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleExportPDF}
                    className="justify-start"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    {t("Export as PDF")}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleExportExcel}
                    className="justify-start"
                  >
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    {t("Export as Excel")}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => alert(t("Export as images"))}
                    className="justify-start"
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    {t("Export as Images")}
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
            <Button variant="outline" size="sm" onClick={handleEmail}>
              <Mail className="h-4 w-4 mr-2" />
              {t("Email")}
            </Button>
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="h-4 w-4 mr-2" />
              {t("Share")}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div>
                <p className="text-sm text-muted-foreground">
                  {t("Assessment ID")}
                </p>
                <p className="font-medium">{assessmentId}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {t("Assessment Date")}
                </p>
                <p className="font-medium">{formatDate(assessmentDate)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t("Assessor")}</p>
                <p className="font-medium">{assessor}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {t("Client Type")}
                </p>
                <p className="font-medium">{clientType}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {t("Beneficiary Name")}
                </p>
                <p className="font-medium">{beneficiaryName}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {t("Beneficiary ID")}
                </p>
                <p className="font-medium">{beneficiaryId}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {t("Property Address")}
                </p>
                <p className="font-medium">{propertyAddress}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {t("Property Type")}
                </p>
                <p className="font-medium">{propertyType}</p>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    {t("Filter")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-56">
                  <div className="space-y-2">
                    <h4 className="font-medium">{t("Compliance Status")}</h4>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="filter-all"
                        checked={filterCompliance === null}
                        onCheckedChange={() => setFilterCompliance(null)}
                      />
                      <Label htmlFor="filter-all">{t("All Rooms")}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="filter-compliant"
                        checked={filterCompliance === "compliant"}
                        onCheckedChange={() =>
                          setFilterCompliance(
                            filterCompliance === "compliant"
                              ? null
                              : "compliant",
                          )
                        }
                      />
                      <Label htmlFor="filter-compliant">{t("Compliant")}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="filter-partial"
                        checked={filterCompliance === "partial"}
                        onCheckedChange={() =>
                          setFilterCompliance(
                            filterCompliance === "partial" ? null : "partial",
                          )
                        }
                      />
                      <Label htmlFor="filter-partial">
                        {t("Partially Compliant")}
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="filter-non-compliant"
                        checked={filterCompliance === "non-compliant"}
                        onCheckedChange={() =>
                          setFilterCompliance(
                            filterCompliance === "non-compliant"
                              ? null
                              : "non-compliant",
                          )
                        }
                      />
                      <Label htmlFor="filter-non-compliant">
                        {t("Non-Compliant")}
                      </Label>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder={t("Sort by")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">{t("Room Name")}</SelectItem>
                  <SelectItem value="compliance">
                    {t("Compliance Rate")}
                  </SelectItem>
                  <SelectItem value="cost">{t("Estimated Cost")}</SelectItem>
                  <SelectItem value="recommendations">
                    {t("Recommendations Count")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="summary">{t("Summary")}</TabsTrigger>
              <TabsTrigger value="details">{t("Room Details")}</TabsTrigger>
              <TabsTrigger value="recommendations">
                {t("Recommendations")}
              </TabsTrigger>
              <TabsTrigger value="compliance">{t("Compliance")}</TabsTrigger>
              <TabsTrigger value="adha">{t("ADHA Report")}</TabsTrigger>
              <TabsTrigger value="fdf">{t("FDF Report")}</TabsTrigger>
            </TabsList>

            <TabsContent value="summary" className="mt-4">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <h3 className="text-2xl font-bold">
                          {completedRooms}/{totalRooms}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {t("Rooms Completed")}
                        </p>
                        <Progress
                          value={completionPercentage}
                          className="mt-2"
                        />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <h3 className="text-2xl font-bold">
                          {compliantMeasurements}/{totalMeasurements}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {t("Compliant Measurements")}
                        </p>
                        <Progress
                          value={compliancePercentage}
                          className="mt-2"
                        />
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <h3 className="text-2xl font-bold">
                          {selectedRecommendations}/{totalRecommendations}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {t("Selected Recommendations")}
                        </p>
                        <p className="font-medium mt-2">
                          {totalCost.toLocaleString()} AED
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>{t("Room Compliance Overview")}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {rooms.map((room) => {
                        const roomCompliantMeasurements =
                          room.measurements.filter(
                            (m) => m.isCompliant === true,
                          ).length;
                        const roomTotalMeasurements = room.measurements.length;
                        const roomCompliancePercentage =
                          roomTotalMeasurements > 0
                            ? (roomCompliantMeasurements /
                                roomTotalMeasurements) *
                              100
                            : 0;

                        return (
                          <div
                            key={room.id}
                            className="flex items-center justify-between"
                          >
                            <div>
                              <p className="font-medium">{room.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {room.type}
                              </p>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <p className="text-sm">
                                  {roomCompliantMeasurements}/
                                  {roomTotalMeasurements} {t("Compliant")}
                                </p>
                              </div>
                              <div className="w-32">
                                <Progress value={roomCompliancePercentage} />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="details" className="mt-4">
              <div className="space-y-6">
                {sortedRooms.map((room) => (
                  <Card key={room.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="p-0 h-8 w-8"
                            onClick={() => toggleRoomExpansion(room.id)}
                          >
                            {expandedRooms[room.id] ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                          <CardTitle>{room.name}</CardTitle>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={room.completed ? "default" : "outline"}
                          >
                            {room.completed ? t("Completed") : t("In Progress")}
                          </Badge>
                          {room.measurements.length > 0 && (
                            <Badge
                              variant="outline"
                              className={
                                room.measurements.filter(
                                  (m) => m.isCompliant === true,
                                ).length /
                                  room.measurements.length >=
                                0.9
                                  ? "bg-green-100"
                                  : room.measurements.filter(
                                        (m) => m.isCompliant === true,
                                      ).length /
                                        room.measurements.length >=
                                      0.5
                                    ? "bg-amber-100"
                                    : "bg-red-100"
                              }
                            >
                              {Math.round(
                                (room.measurements.filter(
                                  (m) => m.isCompliant === true,
                                ).length /
                                  room.measurements.length) *
                                  100,
                              )}
                              % {t("Compliant")}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div
                        className="space-y-4"
                        style={{
                          display: expandedRooms[room.id] ? "block" : "none",
                        }}
                      >
                        <div>
                          <h4 className="font-medium mb-2">
                            {t("Measurements")}
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {room.measurements.map((measurement) => (
                              <div
                                key={measurement.id}
                                className="p-2 border rounded-md flex justify-between items-center"
                              >
                                <div>
                                  <p className="font-medium">
                                    {measurement.name}
                                  </p>
                                  <p className="text-sm">
                                    {measurement.value !== null
                                      ? measurement.value
                                      : "-"}{" "}
                                    {measurement.unit}
                                    <span className="text-muted-foreground ml-2">
                                      ({t("Standard")}: {measurement.standard}{" "}
                                      {measurement.unit})
                                    </span>
                                  </p>
                                </div>
                                <Badge
                                  variant="outline"
                                  className={
                                    measurement.isCompliant
                                      ? "bg-green-100"
                                      : "bg-red-100"
                                  }
                                >
                                  {measurement.isCompliant
                                    ? t("Compliant")
                                    : t("Non-Compliant")}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>

                        <Separator />

                        <div>
                          <h4 className="font-medium mb-2">
                            {t("Recommendations")}
                          </h4>
                          {room.recommendations.length > 0 ? (
                            <div className="space-y-2">
                              {room.recommendations
                                .filter((r) => r.selected)
                                .map((recommendation) => (
                                  <div
                                    key={recommendation.id}
                                    className="p-2 border rounded-md"
                                  >
                                    <div className="flex justify-between items-start">
                                      <p className="font-medium">
                                        {recommendation.description}
                                      </p>
                                      <Badge
                                        variant="outline"
                                        className={
                                          recommendation.priority === "high"
                                            ? "bg-red-100"
                                            : recommendation.priority ===
                                                "medium"
                                              ? "bg-amber-100"
                                              : "bg-blue-100"
                                        }
                                      >
                                        {recommendation.priority}
                                      </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-1">
                                      {t("Estimated Cost")}:{" "}
                                      {recommendation.estimatedCost.toLocaleString()}{" "}
                                      AED
                                    </p>
                                  </div>
                                ))}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">
                              {t("No recommendations for this room.")}
                            </p>
                          )}
                        </div>

                        {room.photos.length > 0 && (
                          <>
                            <Separator />

                            <div>
                              <h4 className="font-medium mb-2">
                                {t("Photos")}
                              </h4>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                {room.photos.map((photo) => (
                                  <div
                                    key={photo.id}
                                    className="aspect-square relative"
                                  >
                                    <img
                                      src={photo.url}
                                      alt={photo.description}
                                      className="object-cover w-full h-full rounded-md"
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="recommendations" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>{t("Recommendations Summary")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-medium">
                        {t("Total Estimated Cost")}
                      </h3>
                      <p className="text-2xl font-bold">
                        {totalCost.toLocaleString()} AED
                      </p>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="text-lg font-medium mb-4">
                        {t("Recommendations by Priority")}
                      </h3>
                      <div className="space-y-4">
                        {["high", "medium", "low"].map((priority) => {
                          const priorityRecommendations = rooms.flatMap(
                            (room) =>
                              room.recommendations.filter(
                                (r) => r.selected && r.priority === priority,
                              ),
                          );

                          const priorityCost = priorityRecommendations.reduce(
                            (sum, r) => sum + r.estimatedCost,
                            0,
                          );

                          if (priorityRecommendations.length === 0) return null;

                          return (
                            <div key={priority}>
                              <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center">
                                  <Badge
                                    variant="outline"
                                    className={
                                      priority === "high"
                                        ? "bg-red-100"
                                        : priority === "medium"
                                          ? "bg-amber-100"
                                          : "bg-blue-100"
                                    }
                                  >
                                    {t(priority)}
                                  </Badge>
                                  <span className="ml-2">
                                    {priorityRecommendations.length}{" "}
                                    {t("recommendations")}
                                  </span>
                                </div>
                                <p className="font-medium">
                                  {priorityCost.toLocaleString()} AED
                                </p>
                              </div>

                              <div className="space-y-2 ml-4">
                                {priorityRecommendations.map(
                                  (recommendation, index) => (
                                    <div
                                      key={index}
                                      className="flex justify-between items-start"
                                    >
                                      <p className="text-sm">
                                        {recommendation.description}
                                      </p>
                                      <p className="text-sm font-medium">
                                        {recommendation.estimatedCost.toLocaleString()}{" "}
                                        AED
                                      </p>
                                    </div>
                                  ),
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h3 className="text-lg font-medium mb-4">
                        {t("Recommendations by Room")}
                      </h3>
                      <div className="space-y-4">
                        {sortedRooms.map((room) => {
                          const roomRecommendations =
                            room.recommendations.filter((r) => r.selected);
                          const roomCost = roomRecommendations.reduce(
                            (sum, r) => sum + r.estimatedCost,
                            0,
                          );

                          if (roomRecommendations.length === 0) return null;

                          return (
                            <div key={room.id}>
                              <div className="flex justify-between items-center mb-2">
                                <h4 className="font-medium">{room.name}</h4>
                                <p className="font-medium">
                                  {roomCost.toLocaleString()} AED
                                </p>
                              </div>

                              <div className="space-y-2 ml-4">
                                {roomRecommendations.map((recommendation) => (
                                  <div
                                    key={recommendation.id}
                                    className="flex justify-between items-start"
                                  >
                                    <div className="flex items-center">
                                      <Badge
                                        variant="outline"
                                        className={
                                          recommendation.priority === "high"
                                            ? "bg-red-100"
                                            : recommendation.priority ===
                                                "medium"
                                              ? "bg-amber-100"
                                              : "bg-blue-100"
                                        }
                                      >
                                        {recommendation.priority}
                                      </Badge>
                                      <p className="text-sm ml-2">
                                        {recommendation.description}
                                      </p>
                                    </div>
                                    <p className="text-sm font-medium">
                                      {recommendation.estimatedCost.toLocaleString()}{" "}
                                      AED
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="compliance" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>{t("Compliance Analysis")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-center">
                            <h3 className="text-2xl font-bold">
                              {Math.round(compliancePercentage)}%
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {t("Overall Compliance Rate")}
                            </p>
                            <Progress
                              value={compliancePercentage}
                              className="mt-2"
                            />
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-center">
                            <h3 className="text-2xl font-bold">
                              {
                                rooms.filter((room) => {
                                  const roomCompliantMeasurements =
                                    room.measurements.filter(
                                      (m) => m.isCompliant === true,
                                    ).length;
                                  const roomTotalMeasurements =
                                    room.measurements.length;
                                  return (
                                    roomTotalMeasurements > 0 &&
                                    roomCompliantMeasurements /
                                      roomTotalMeasurements >=
                                      0.9
                                  );
                                }).length
                              }
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {t("Fully Compliant Rooms")}
                            </p>
                            <div className="h-2 mt-2"></div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="pt-6">
                          <div className="text-center">
                            <h3 className="text-2xl font-bold">
                              {clientType === "ADHA"
                                ? "ADHA"
                                : clientType === "FDF"
                                  ? "FDF"
                                  : "Standard"}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {t("Compliance Standard")}
                            </p>
                            <div className="h-2 mt-2"></div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <Card>
                      <CardHeader>
                        <CardTitle>
                          {t("Compliance by Measurement Type")}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {/* Group measurements by type across all rooms */}
                          {Array.from(
                            new Set(
                              rooms.flatMap((room) =>
                                room.measurements.map((m) => m.name),
                              ),
                            ),
                          ).map((measurementName) => {
                            const allMeasurementsOfType = rooms.flatMap(
                              (room) =>
                                room.measurements.filter(
                                  (m) => m.name === measurementName,
                                ),
                            );
                            const compliantCount = allMeasurementsOfType.filter(
                              (m) => m.isCompliant === true,
                            ).length;
                            const totalCount = allMeasurementsOfType.length;
                            const complianceRate =
                              totalCount > 0
                                ? (compliantCount / totalCount) * 100
                                : 0;

                            return (
                              <div
                                key={measurementName}
                                className="flex items-center justify-between"
                              >
                                <div>
                                  <p className="font-medium">
                                    {measurementName}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {compliantCount}/{totalCount}{" "}
                                    {t("Compliant")}
                                  </p>
                                </div>
                                <div className="flex items-center gap-4">
                                  <div className="text-right">
                                    <p className="text-sm">
                                      {Math.round(complianceRate)}%
                                    </p>
                                  </div>
                                  <div className="w-32">
                                    <Progress value={complianceRate} />
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>
                          {t("Client Type Specific Requirements")}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {clientType === "ADHA" ? (
                            <div>
                              <h4 className="font-medium mb-2">
                                {t("ADHA Compliance Requirements")}
                              </h4>
                              <ul className="list-disc pl-5 space-y-1">
                                <li>{t("Door width must be at least 80cm")}</li>
                                <li>
                                  {t(
                                    "Grab bars must be installed at proper heights",
                                  )}
                                </li>
                                <li>
                                  {t("Ramps must have a slope of 1:12 or less")}
                                </li>
                                <li>
                                  {t(
                                    "Thresholds must not exceed 1.5cm in height",
                                  )}
                                </li>
                                <li>
                                  {t(
                                    "Clearance spaces must meet minimum requirements",
                                  )}
                                </li>
                              </ul>
                            </div>
                          ) : clientType === "FDF" ? (
                            <div>
                              <h4 className="font-medium mb-2">
                                {t("FDF Funding Eligibility Requirements")}
                              </h4>
                              <ul className="list-disc pl-5 space-y-1">
                                <li>
                                  {t(
                                    "Minimum 70% overall compliance rate required",
                                  )}
                                </li>
                                <li>
                                  {t(
                                    "Critical areas (bathroom, entrance) must be 80% compliant",
                                  )}
                                </li>
                                <li>
                                  {t(
                                    "Cost-effective modifications are prioritized",
                                  )}
                                </li>
                                <li>
                                  {t(
                                    "Documentation of all non-compliant measurements required",
                                  )}
                                </li>
                              </ul>
                            </div>
                          ) : (
                            <div>
                              <h4 className="font-medium mb-2">
                                {t("Standard Accessibility Guidelines")}
                              </h4>
                              <ul className="list-disc pl-5 space-y-1">
                                <li>
                                  {t(
                                    "Recommendations based on general accessibility standards",
                                  )}
                                </li>
                                <li>{t("Focus on safety and independence")}</li>
                                <li>
                                  {t("Cost-effective solutions prioritized")}
                                </li>
                              </ul>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ADHA Specific Report */}
            <TabsContent value="adha" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>{t("ADHA Compliance Report")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                      <h3 className="text-lg font-medium text-blue-800 mb-2">
                        {t("ADHA Compliance Overview")}
                      </h3>
                      <p className="text-blue-700 mb-4">
                        {t(
                          "This report is specifically formatted for ADHA compliance requirements and focuses on accessibility standards for senior citizens.",
                        )}
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white p-4 rounded-md shadow-sm">
                          <p className="text-sm text-gray-500">
                            {t("Overall Compliance")}
                          </p>
                          <p className="text-2xl font-bold">
                            {Math.round(compliancePercentage)}%
                          </p>
                          <Progress
                            value={compliancePercentage}
                            className="mt-2"
                          />
                        </div>
                        <div className="bg-white p-4 rounded-md shadow-sm">
                          <p className="text-sm text-gray-500">
                            {t("Critical Areas Compliance")}
                          </p>
                          <p className="text-2xl font-bold">
                            {Math.round(
                              rooms
                                .filter(
                                  (room) =>
                                    room.type === "Bathroom" ||
                                    room.type === "Entrance",
                                )
                                .reduce((sum, room) => {
                                  const roomCompliance =
                                    (room.measurements.filter(
                                      (m) => m.isCompliant,
                                    ).length /
                                      room.measurements.length) *
                                    100;
                                  return sum + roomCompliance;
                                }, 0) /
                                rooms.filter(
                                  (room) =>
                                    room.type === "Bathroom" ||
                                    room.type === "Entrance",
                                ).length,
                            )}
                            %
                          </p>
                        </div>
                        <div className="bg-white p-4 rounded-md shadow-sm">
                          <p className="text-sm text-gray-500">
                            {t("ADHA Certification Status")}
                          </p>
                          <p className="text-xl font-bold">
                            {compliancePercentage >= 80 ? (
                              <span className="text-green-600">
                                {t("Eligible")}
                              </span>
                            ) : (
                              <span className="text-red-600">
                                {t("Not Eligible")}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-4">
                        {t("ADHA Specific Requirements")}
                      </h3>
                      <div className="space-y-4">
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle>{t("Bathroom Accessibility")}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              {rooms
                                .filter((room) => room.type === "Bathroom")
                                .map((room) => {
                                  const doorWidthMeasurement =
                                    room.measurements.find((m) =>
                                      m.name.includes("Door Width"),
                                    );
                                  const grabBarsMeasurement =
                                    room.measurements.find((m) =>
                                      m.name.includes("Grab Bar"),
                                    );
                                  const clearanceSpaceMeasurement =
                                    room.measurements.find((m) =>
                                      m.name.includes("Clearance"),
                                    );

                                  return (
                                    <div
                                      key={room.id}
                                      className="border p-3 rounded-md"
                                    >
                                      <h4 className="font-medium">
                                        {room.name}
                                      </h4>
                                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
                                        <div className="flex items-center">
                                          <Badge
                                            className={
                                              doorWidthMeasurement?.isCompliant
                                                ? "bg-green-100 text-green-800"
                                                : "bg-red-100 text-red-800"
                                            }
                                          >
                                            {doorWidthMeasurement?.isCompliant
                                              ? t("Pass")
                                              : t("Fail")}
                                          </Badge>
                                          <span className="ml-2">
                                            {t("Door Width")}
                                          </span>
                                        </div>
                                        <div className="flex items-center">
                                          <Badge
                                            className={
                                              grabBarsMeasurement?.isCompliant
                                                ? "bg-green-100 text-green-800"
                                                : "bg-red-100 text-red-800"
                                            }
                                          >
                                            {grabBarsMeasurement?.isCompliant
                                              ? t("Pass")
                                              : t("Fail")}
                                          </Badge>
                                          <span className="ml-2">
                                            {t("Grab Bars")}
                                          </span>
                                        </div>
                                        <div className="flex items-center">
                                          <Badge
                                            className={
                                              clearanceSpaceMeasurement?.isCompliant
                                                ? "bg-green-100 text-green-800"
                                                : "bg-red-100 text-red-800"
                                            }
                                          >
                                            {clearanceSpaceMeasurement?.isCompliant
                                              ? t("Pass")
                                              : t("Fail")}
                                          </Badge>
                                          <span className="ml-2">
                                            {t("Clearance Space")}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle>
                              {t("Entrance & Pathway Accessibility")}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              {rooms
                                .filter(
                                  (room) =>
                                    room.type === "Entrance" ||
                                    room.type === "Hallway",
                                )
                                .map((room) => {
                                  const rampMeasurement =
                                    room.measurements.find((m) =>
                                      m.name.includes("Ramp"),
                                    );
                                  const thresholdMeasurement =
                                    room.measurements.find((m) =>
                                      m.name.includes("Threshold"),
                                    );
                                  const widthMeasurement =
                                    room.measurements.find((m) =>
                                      m.name.includes("Width"),
                                    );

                                  return (
                                    <div
                                      key={room.id}
                                      className="border p-3 rounded-md"
                                    >
                                      <h4 className="font-medium">
                                        {room.name}
                                      </h4>
                                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
                                        {rampMeasurement && (
                                          <div className="flex items-center">
                                            <Badge
                                              className={
                                                rampMeasurement.isCompliant
                                                  ? "bg-green-100 text-green-800"
                                                  : "bg-red-100 text-red-800"
                                              }
                                            >
                                              {rampMeasurement.isCompliant
                                                ? t("Pass")
                                                : t("Fail")}
                                            </Badge>
                                            <span className="ml-2">
                                              {t("Ramp Slope")}
                                            </span>
                                          </div>
                                        )}
                                        {thresholdMeasurement && (
                                          <div className="flex items-center">
                                            <Badge
                                              className={
                                                thresholdMeasurement.isCompliant
                                                  ? "bg-green-100 text-green-800"
                                                  : "bg-red-100 text-red-800"
                                              }
                                            >
                                              {thresholdMeasurement.isCompliant
                                                ? t("Pass")
                                                : t("Fail")}
                                            </Badge>
                                            <span className="ml-2">
                                              {t("Threshold Height")}
                                            </span>
                                          </div>
                                        )}
                                        {widthMeasurement && (
                                          <div className="flex items-center">
                                            <Badge
                                              className={
                                                widthMeasurement.isCompliant
                                                  ? "bg-green-100 text-green-800"
                                                  : "bg-red-100 text-red-800"
                                              }
                                            >
                                              {widthMeasurement.isCompliant
                                                ? t("Pass")
                                                : t("Fail")}
                                            </Badge>
                                            <span className="ml-2">
                                              {t("Pathway Width")}
                                            </span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-4">
                        {t("ADHA Certification Requirements")}
                      </h3>
                      <div className="p-4 border rounded-md">
                        <ul className="list-disc pl-5 space-y-2">
                          <li>
                            {t("Overall compliance rate must be at least 80%")}
                          </li>
                          <li>
                            {t(
                              "Bathroom and entrance areas must be at least 90% compliant",
                            )}
                          </li>
                          <li>
                            {t(
                              "All critical measurements must meet ADHA standards",
                            )}
                          </li>
                          <li>
                            {t(
                              "Selected recommendations must address all non-compliant areas",
                            )}
                          </li>
                          <li>
                            {t(
                              "Implementation timeline must be provided for all modifications",
                            )}
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* FDF Specific Report */}
            <TabsContent value="fdf" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>{t("FDF Funding Eligibility Report")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                      <h3 className="text-lg font-medium text-green-800 mb-2">
                        {t("FDF Funding Eligibility Overview")}
                      </h3>
                      <p className="text-green-700 mb-4">
                        {t(
                          "This report is specifically formatted for FDF funding eligibility assessment and focuses on cost-effective modifications for senior accessibility.",
                        )}
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white p-4 rounded-md shadow-sm">
                          <p className="text-sm text-gray-500">
                            {t("Funding Eligibility")}
                          </p>
                          <p className="text-2xl font-bold">
                            {compliancePercentage >= 70 ? (
                              <span className="text-green-600">
                                {t("Eligible")}
                              </span>
                            ) : (
                              <span className="text-red-600">
                                {t("Not Eligible")}
                              </span>
                            )}
                          </p>
                        </div>
                        <div className="bg-white p-4 rounded-md shadow-sm">
                          <p className="text-sm text-gray-500">
                            {t("Estimated Funding")}
                          </p>
                          <p className="text-2xl font-bold">
                            {totalCost > 0
                              ? `${Math.min(totalCost, 50000).toLocaleString()} AED`
                              : t("Not Applicable")}
                          </p>
                        </div>
                        <div className="bg-white p-4 rounded-md shadow-sm">
                          <p className="text-sm text-gray-500">
                            {t("Cost-Benefit Ratio")}
                          </p>
                          <p className="text-2xl font-bold">
                            {totalCost > 0
                              ? (
                                  (selectedRecommendations / totalCost) *
                                  10000
                                ).toFixed(2)
                              : "N/A"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-4">
                        {t("Priority Modifications for Funding")}
                      </h3>
                      <div className="space-y-4">
                        {["high", "medium"].map((priority) => {
                          const priorityRecommendations = rooms.flatMap(
                            (room) =>
                              room.recommendations.filter(
                                (r) => r.selected && r.priority === priority,
                              ),
                          );

                          const priorityCost = priorityRecommendations.reduce(
                            (sum, r) => sum + r.estimatedCost,
                            0,
                          );

                          if (priorityRecommendations.length === 0) return null;

                          return (
                            <Card key={priority}>
                              <CardHeader className="pb-2">
                                <div className="flex justify-between items-center">
                                  <CardTitle>
                                    {priority === "high"
                                      ? t("High Priority")
                                      : t("Medium Priority")}{" "}
                                    {t("Modifications")}
                                  </CardTitle>
                                  <p className="font-medium">
                                    {priorityCost.toLocaleString()} AED
                                  </p>
                                </div>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-2">
                                  {priorityRecommendations.map(
                                    (recommendation, index) => (
                                      <div
                                        key={index}
                                        className="flex justify-between items-start border-b pb-2"
                                      >
                                        <div>
                                          <p className="font-medium">
                                            {recommendation.description}
                                          </p>
                                          <p className="text-sm text-muted-foreground">
                                            {
                                              rooms.find((r) =>
                                                r.recommendations.some(
                                                  (rec) =>
                                                    rec.id ===
                                                    recommendation.id,
                                                ),
                                              )?.name
                                            }
                                          </p>
                                        </div>
                                        <p className="font-medium">
                                          {recommendation.estimatedCost.toLocaleString()}{" "}
                                          AED
                                        </p>
                                      </div>
                                    ),
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-4">
                        {t("FDF Funding Requirements")}
                      </h3>
                      <div className="p-4 border rounded-md">
                        <ul className="list-disc pl-5 space-y-2">
                          <li>
                            {t(
                              "Minimum 70% overall compliance rate required for funding eligibility",
                            )}
                          </li>
                          <li>
                            {t(
                              "Critical areas (bathroom, entrance) must be 80% compliant",
                            )}
                          </li>
                          <li>
                            {t(
                              "Maximum funding cap of 50,000 AED per beneficiary",
                            )}
                          </li>
                          <li>
                            {t(
                              "Cost-effective modifications are prioritized for funding approval",
                            )}
                          </li>
                          <li>
                            {t(
                              "Documentation of all non-compliant measurements required",
                            )}
                          </li>
                          <li>
                            {t(
                              "Implementation must be completed within 6 months of funding approval",
                            )}
                          </li>
                        </ul>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-4">
                        {t("Implementation Timeline")}
                      </h3>
                      <div className="border rounded-md overflow-hidden">
                        <table className="w-full">
                          <thead className="bg-muted">
                            <tr>
                              <th className="p-2 text-left">{t("Phase")}</th>
                              <th className="p-2 text-left">{t("Duration")}</th>
                              <th className="p-2 text-left">
                                {t("Description")}
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-t">
                              <td className="p-2">
                                {t("Assessment Approval")}
                              </td>
                              <td className="p-2">2 {t("weeks")}</td>
                              <td className="p-2">
                                {t(
                                  "FDF committee reviews and approves assessment",
                                )}
                              </td>
                            </tr>
                            <tr className="border-t">
                              <td className="p-2">{t("Funding Allocation")}</td>
                              <td className="p-2">3 {t("weeks")}</td>
                              <td className="p-2">
                                {t(
                                  "Budget allocation and contractor selection",
                                )}
                              </td>
                            </tr>
                            <tr className="border-t">
                              <td className="p-2">{t("Implementation")}</td>
                              <td className="p-2">8-12 {t("weeks")}</td>
                              <td className="p-2">
                                {t("Modification work and installation")}
                              </td>
                            </tr>
                            <tr className="border-t">
                              <td className="p-2">{t("Final Inspection")}</td>
                              <td className="p-2">1 {t("week")}</td>
                              <td className="p-2">
                                {t("Quality check and compliance verification")}
                              </td>
                            </tr>
                            <tr className="border-t">
                              <td className="p-2">{t("Project Closure")}</td>
                              <td className="p-2">2 {t("weeks")}</td>
                              <td className="p-2">
                                {t("Documentation and final report submission")}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default RoomAssessmentReport;
