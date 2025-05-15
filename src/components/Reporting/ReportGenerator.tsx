import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import {
  Calendar as CalendarIcon,
  Download,
  Clock,
  Mail,
  FileText,
  Check,
  BarChart,
  LineChart,
  PieChart,
  Activity,
  TrendingUp,
  Settings,
  Filter,
  Layers,
  Sliders,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ReportingEngine } from "@/services/reporting/ReportingEngine";
import { ReportTemplate } from "@/services/reporting/ReportTemplate";
import {
  ReportFormat,
  ReportParameters,
  ReportSchedule,
  ReportOutput,
  FDFReportConfig,
  ADHAReportConfig,
  CashClientReportConfig,
} from "@/services/reporting/ReportTypes";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ReportManager } from "@/services/reporting/ReportManager";

interface ReportGeneratorProps {
  reportingEngine?: ReportingEngine;
  clientId?: string;
  clientType?: string;
  onReportGenerated?: (reportOutput: ReportOutput) => void;
}

export default function ReportGenerator({
  reportingEngine,
  clientId,
  clientType,
  onReportGenerated,
}: ReportGeneratorProps) {
  const { t } = useTranslation();
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [format, setFormat] = useState<ReportFormat>("pdf");
  const [dateRange, setDateRange] = useState<{
    start: Date | undefined;
    end: Date | undefined;
  }>({
    start: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    end: new Date(),
  });
  const [parameters, setParameters] = useState<Record<string, any>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<ReportOutput | null>(
    null,
  );
  const [activeTab, setActiveTab] = useState("parameters");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Scheduling options
  const [enableScheduling, setEnableScheduling] = useState(false);
  const [scheduleFrequency, setScheduleFrequency] = useState<
    "daily" | "weekly" | "monthly" | "quarterly"
  >("weekly");
  const [scheduleTime, setScheduleTime] = useState("09:00");
  const [scheduleRecipients, setScheduleRecipients] = useState("");
  const [scheduleDayOfWeek, setScheduleDayOfWeek] = useState<number>(1); // Monday
  const [scheduleDayOfMonth, setScheduleDayOfMonth] = useState<number>(1);

  // Analytics options
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [analyticsType, setAnalyticsType] = useState<
    "exploration" | "benchmarking" | "performance"
  >("exploration");
  const [dataFilters, setDataFilters] = useState<Record<string, any>>({});
  const [benchmarkTarget, setBenchmarkTarget] = useState<string>("");
  const [performanceMetrics, setPerformanceMetrics] = useState<string[]>([]);

  // Client-specific options
  const [clientSpecificOptions, setClientSpecificOptions] = useState<
    Record<string, any>
  >({});

  // Get the reporting engine instance
  const engine =
    reportingEngine || ReportManager.getInstance().getReportingEngine();

  // Get available templates from the engine
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);

  useEffect(() => {
    // Load templates based on client type if provided
    if (clientType) {
      setTemplates(engine.getClientSpecificTemplates(clientType));
    } else {
      setTemplates(engine.getAvailableTemplates());
    }
  }, [engine, clientType]);

  // Get the selected template object
  const template = templates.find((t) => t.id === selectedTemplate);

  // Handle template selection
  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId);
    setParameters({});
    setError(null);
    setClientSpecificOptions({});

    // Set default format from template
    const selectedTemplate = templates.find((t) => t.id === templateId);
    if (selectedTemplate) {
      setFormat(selectedTemplate.defaultFormat);

      // Initialize client-specific options if applicable
      if (selectedTemplate.clientSpecificConfig) {
        const { clientType } = selectedTemplate.clientSpecificConfig;
        if (clientType === "FDF") {
          setClientSpecificOptions({
            socialImpactMetrics: true,
            familyWelfareTracking: true,
            healthSafetyMetrics: false,
            communityEngagement: false,
            socialWorkerActivity: false,
          });
        } else if (clientType === "ADHA") {
          setClientSpecificOptions({
            propertyValuation: true,
            structuralEnhancements: true,
            renovationQuality: false,
            propertyDatabase: false,
            governmentCompliance: true,
          });
        } else if (clientType === "Cash") {
          setClientSpecificOptions({
            costEffectiveness: true,
            paymentTracking: true,
            serviceQuality: false,
            valueForMoney: true,
            clientSatisfaction: false,
          });
        }
      }
    }
  };

  // Handle parameter change
  const handleParameterChange = (key: string, value: any) => {
    setParameters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Handle client-specific option change
  const handleClientSpecificOptionChange = (key: string, value: any) => {
    setClientSpecificOptions((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Handle analytics filter change
  const handleAnalyticsFilterChange = (key: string, value: any) => {
    setDataFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Handle report generation
  const handleGenerateReport = async () => {
    if (!selectedTemplate) return;

    setIsGenerating(true);
    setError(null);
    setSuccess(null);

    try {
      // Prepare report parameters
      const reportParams: ReportParameters = {
        ...parameters,
        dateRange: {
          start: dateRange.start || new Date(),
          end: dateRange.end || new Date(),
        },
      };

      // Add client-specific options if applicable
      if (template?.clientSpecificConfig) {
        reportParams.clientSpecificOptions = clientSpecificOptions;
      }

      // Add analytics options if enabled
      if (showAnalytics) {
        reportParams.analytics = {
          type: analyticsType,
          filters: dataFilters,
          benchmarkTarget: benchmarkTarget || undefined,
          performanceMetrics:
            performanceMetrics.length > 0 ? performanceMetrics : undefined,
        };
      }

      // Generate the report
      const report = await engine.generateReport(
        selectedTemplate,
        reportParams,
        format,
        clientId,
      );

      setGeneratedReport(report);
      setSuccess(
        t("reporting.generator.reportSuccess", "Report generated successfully"),
      );

      if (onReportGenerated) {
        onReportGenerated(report);
      }

      // Switch to preview tab after successful generation
      setActiveTab("preview");
    } catch (error: any) {
      console.error("Error generating report:", error);
      setError(
        error.message ||
          t("reporting.generator.reportError", "Failed to generate report"),
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle report scheduling
  const handleScheduleReport = async () => {
    if (!selectedTemplate || !enableScheduling) return;

    setError(null);
    setSuccess(null);

    try {
      // Prepare report parameters
      const reportParams: ReportParameters = {
        ...parameters,
        dateRange: {
          start: dateRange.start || new Date(),
          end: dateRange.end || new Date(),
        },
      };

      // Add client-specific options if applicable
      if (template?.clientSpecificConfig) {
        reportParams.clientSpecificOptions = clientSpecificOptions;
      }

      // Add analytics options if enabled
      if (showAnalytics) {
        reportParams.analytics = {
          type: analyticsType,
          filters: dataFilters,
          benchmarkTarget: benchmarkTarget || undefined,
          performanceMetrics:
            performanceMetrics.length > 0 ? performanceMetrics : undefined,
        };
      }

      // Prepare schedule configuration
      const schedule: ReportSchedule = {
        frequency: scheduleFrequency,
        timeOfDay: scheduleTime,
        recipients: scheduleRecipients.split(",").map((email) => email.trim()),
      };

      // Add day of week/month based on frequency
      if (scheduleFrequency === "weekly") {
        schedule.dayOfWeek = scheduleDayOfWeek;
      } else if (
        scheduleFrequency === "monthly" ||
        scheduleFrequency === "quarterly"
      ) {
        schedule.dayOfMonth = scheduleDayOfMonth;
      }

      // Schedule the report
      const scheduleId = engine.scheduleReport(
        selectedTemplate,
        reportParams,
        schedule,
        format,
        clientId,
      );

      setSuccess(
        t(
          "reporting.generator.scheduleSuccess",
          "Report scheduled successfully",
        ),
      );
    } catch (error: any) {
      console.error("Error scheduling report:", error);
      setError(
        error.message ||
          t("reporting.generator.scheduleError", "Error scheduling report"),
      );
    }
  };

  // Handle downloading the generated report
  const handleDownloadReport = () => {
    if (!generatedReport) return;

    // Create a download link
    const link = document.createElement("a");

    // Set up the link based on the report format
    if (generatedReport.format === "html") {
      const blob = new Blob([generatedReport.content], { type: "text/html" });
      link.href = URL.createObjectURL(blob);
    } else if (generatedReport.format === "csv") {
      const blob = new Blob([generatedReport.content], { type: "text/csv" });
      link.href = URL.createObjectURL(blob);
    } else {
      // For PDF and Excel, assume content is base64 encoded
      link.href = `data:application/${generatedReport.format === "pdf" ? "pdf" : "vnd.ms-excel"};base64,${generatedReport.content}`;
    }

    link.download = generatedReport.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Render parameter fields based on template parameters
  const renderParameterFields = () => {
    if (!template || !template.parameters) return null;

    return template.parameters.map((param) => {
      if (
        param === "beneficiaryId" ||
        param === "projectId" ||
        param === "propertyId" ||
        param === "clientId" ||
        param === "communityId" ||
        param === "fiscalYear"
      ) {
        return (
          <div key={param} className="space-y-2">
            <label className="text-sm font-medium">
              {t(
                `reporting.parameters.${param}`,
                param.charAt(0).toUpperCase() +
                  param.slice(1).replace(/([A-Z])/g, " $1"),
              )}
            </label>
            <Input
              type="text"
              className="w-full"
              value={parameters[param] || ""}
              onChange={(e) => handleParameterChange(param, e.target.value)}
              placeholder={t(
                `reporting.parameters.${param}Placeholder`,
                `Enter ${param}`,
              )}
            />
          </div>
        );
      } else if (
        param === "includeHistory" ||
        param === "includePhotos" ||
        param === "includeFinancials" ||
        param === "includeForecasts" ||
        param === "milestoneTracking"
      ) {
        return (
          <div key={param} className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id={param}
                checked={parameters[param] === "true"}
                onCheckedChange={(checked) =>
                  handleParameterChange(param, checked ? "true" : "false")
                }
              />
              <Label htmlFor={param}>
                {t(
                  `reporting.parameters.${param}`,
                  param.charAt(0).toUpperCase() +
                    param.slice(1).replace(/([A-Z])/g, " $1"),
                )}
              </Label>
            </div>
          </div>
        );
      } else if (
        param === "detailLevel" ||
        param === "assessmentType" ||
        param === "roomTypes" ||
        param === "impactMetrics" ||
        param === "timeframe" ||
        param === "improvementTypes" ||
        param === "complianceLevel" ||
        param === "serviceTypes" ||
        param === "paymentPeriod" ||
        param === "budgetCategory"
      ) {
        return (
          <div key={param} className="space-y-2">
            <label className="text-sm font-medium">
              {t(
                `reporting.parameters.${param}`,
                param.charAt(0).toUpperCase() +
                  param.slice(1).replace(/([A-Z])/g, " $1"),
              )}
            </label>
            <Select
              value={parameters[param] || ""}
              onValueChange={(value) => handleParameterChange(param, value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue
                  placeholder={t(
                    `reporting.parameters.${param}Placeholder`,
                    `Select ${param}`,
                  )}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="basic">
                  {t(`reporting.parameters.${param}.basic`, "Basic")}
                </SelectItem>
                <SelectItem value="detailed">
                  {t(`reporting.parameters.${param}.detailed`, "Detailed")}
                </SelectItem>
                <SelectItem value="comprehensive">
                  {t(
                    `reporting.parameters.${param}.comprehensive`,
                    "Comprehensive",
                  )}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        );
      } else {
        return (
          <div key={param} className="space-y-2">
            <label className="text-sm font-medium">
              {t(
                `reporting.parameters.${param}`,
                param.charAt(0).toUpperCase() +
                  param.slice(1).replace(/([A-Z])/g, " $1"),
              )}
            </label>
            <Input
              type="text"
              className="w-full"
              value={parameters[param] || ""}
              onChange={(e) => handleParameterChange(param, e.target.value)}
              placeholder={t(
                `reporting.parameters.${param}Placeholder`,
                `Enter ${param}`,
              )}
            />
          </div>
        );
      }
    });
  };

  // Render client-specific options based on template
  const renderClientSpecificOptions = () => {
    if (!template?.clientSpecificConfig) return null;

    const { clientType } = template.clientSpecificConfig;

    return (
      <div className="space-y-4 mt-4 p-4 bg-gray-50 rounded-md">
        <h3 className="text-md font-medium">
          {t(
            `reporting.clientSpecific.${clientType}.title`,
            `${clientType} Specific Options`,
          )}
        </h3>

        {clientType === "FDF" && (
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="socialImpactMetrics"
                checked={!!clientSpecificOptions.socialImpactMetrics}
                onCheckedChange={(checked) =>
                  handleClientSpecificOptionChange(
                    "socialImpactMetrics",
                    checked,
                  )
                }
              />
              <Label htmlFor="socialImpactMetrics">
                {t(
                  "reporting.clientSpecific.FDF.socialImpactMetrics",
                  "Include Social Impact Metrics",
                )}
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="familyWelfareTracking"
                checked={!!clientSpecificOptions.familyWelfareTracking}
                onCheckedChange={(checked) =>
                  handleClientSpecificOptionChange(
                    "familyWelfareTracking",
                    checked,
                  )
                }
              />
              <Label htmlFor="familyWelfareTracking">
                {t(
                  "reporting.clientSpecific.FDF.familyWelfareTracking",
                  "Include Family Welfare Tracking",
                )}
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="healthSafetyMetrics"
                checked={!!clientSpecificOptions.healthSafetyMetrics}
                onCheckedChange={(checked) =>
                  handleClientSpecificOptionChange(
                    "healthSafetyMetrics",
                    checked,
                  )
                }
              />
              <Label htmlFor="healthSafetyMetrics">
                {t(
                  "reporting.clientSpecific.FDF.healthSafetyMetrics",
                  "Include Health & Safety Metrics",
                )}
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="communityEngagement"
                checked={!!clientSpecificOptions.communityEngagement}
                onCheckedChange={(checked) =>
                  handleClientSpecificOptionChange(
                    "communityEngagement",
                    checked,
                  )
                }
              />
              <Label htmlFor="communityEngagement">
                {t(
                  "reporting.clientSpecific.FDF.communityEngagement",
                  "Include Community Engagement",
                )}
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="socialWorkerActivity"
                checked={!!clientSpecificOptions.socialWorkerActivity}
                onCheckedChange={(checked) =>
                  handleClientSpecificOptionChange(
                    "socialWorkerActivity",
                    checked,
                  )
                }
              />
              <Label htmlFor="socialWorkerActivity">
                {t(
                  "reporting.clientSpecific.FDF.socialWorkerActivity",
                  "Include Social Worker Activity",
                )}
              </Label>
            </div>
          </div>
        )}

        {clientType === "ADHA" && (
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="propertyValuation"
                checked={!!clientSpecificOptions.propertyValuation}
                onCheckedChange={(checked) =>
                  handleClientSpecificOptionChange("propertyValuation", checked)
                }
              />
              <Label htmlFor="propertyValuation">
                {t(
                  "reporting.clientSpecific.ADHA.propertyValuation",
                  "Include Property Valuation",
                )}
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="structuralEnhancements"
                checked={!!clientSpecificOptions.structuralEnhancements}
                onCheckedChange={(checked) =>
                  handleClientSpecificOptionChange(
                    "structuralEnhancements",
                    checked,
                  )
                }
              />
              <Label htmlFor="structuralEnhancements">
                {t(
                  "reporting.clientSpecific.ADHA.structuralEnhancements",
                  "Include Structural Enhancements",
                )}
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="renovationQuality"
                checked={!!clientSpecificOptions.renovationQuality}
                onCheckedChange={(checked) =>
                  handleClientSpecificOptionChange("renovationQuality", checked)
                }
              />
              <Label htmlFor="renovationQuality">
                {t(
                  "reporting.clientSpecific.ADHA.renovationQuality",
                  "Include Renovation Quality Assessment",
                )}
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="propertyDatabase"
                checked={!!clientSpecificOptions.propertyDatabase}
                onCheckedChange={(checked) =>
                  handleClientSpecificOptionChange("propertyDatabase", checked)
                }
              />
              <Label htmlFor="propertyDatabase">
                {t(
                  "reporting.clientSpecific.ADHA.propertyDatabase",
                  "Include Property Database Integration",
                )}
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="governmentCompliance"
                checked={!!clientSpecificOptions.governmentCompliance}
                onCheckedChange={(checked) =>
                  handleClientSpecificOptionChange(
                    "governmentCompliance",
                    checked,
                  )
                }
              />
              <Label htmlFor="governmentCompliance">
                {t(
                  "reporting.clientSpecific.ADHA.governmentCompliance",
                  "Include Government Compliance",
                )}
              </Label>
            </div>
          </div>
        )}

        {clientType === "Cash" && (
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="costEffectiveness"
                checked={!!clientSpecificOptions.costEffectiveness}
                onCheckedChange={(checked) =>
                  handleClientSpecificOptionChange("costEffectiveness", checked)
                }
              />
              <Label htmlFor="costEffectiveness">
                {t(
                  "reporting.clientSpecific.Cash.costEffectiveness",
                  "Include Cost Effectiveness Analysis",
                )}
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="paymentTracking"
                checked={!!clientSpecificOptions.paymentTracking}
                onCheckedChange={(checked) =>
                  handleClientSpecificOptionChange("paymentTracking", checked)
                }
              />
              <Label htmlFor="paymentTracking">
                {t(
                  "reporting.clientSpecific.Cash.paymentTracking",
                  "Include Payment Tracking",
                )}
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="serviceQuality"
                checked={!!clientSpecificOptions.serviceQuality}
                onCheckedChange={(checked) =>
                  handleClientSpecificOptionChange("serviceQuality", checked)
                }
              />
              <Label htmlFor="serviceQuality">
                {t(
                  "reporting.clientSpecific.Cash.serviceQuality",
                  "Include Service Quality Metrics",
                )}
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="valueForMoney"
                checked={!!clientSpecificOptions.valueForMoney}
                onCheckedChange={(checked) =>
                  handleClientSpecificOptionChange("valueForMoney", checked)
                }
              />
              <Label htmlFor="valueForMoney">
                {t(
                  "reporting.clientSpecific.Cash.valueForMoney",
                  "Include Value for Money Assessment",
                )}
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="clientSatisfaction"
                checked={!!clientSpecificOptions.clientSatisfaction}
                onCheckedChange={(checked) =>
                  handleClientSpecificOptionChange(
                    "clientSatisfaction",
                    checked,
                  )
                }
              />
              <Label htmlFor="clientSatisfaction">
                {t(
                  "reporting.clientSpecific.Cash.clientSatisfaction",
                  "Include Client Satisfaction Metrics",
                )}
              </Label>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render analytics options
  const renderAnalyticsOptions = () => {
    if (!showAnalytics) return null;

    return (
      <div className="space-y-4 mt-4 p-4 bg-gray-50 rounded-md">
        <h3 className="text-md font-medium">
          {t("reporting.analytics.title", "Analytics Options")}
        </h3>

        <div className="space-y-3">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {t("reporting.analytics.type", "Analytics Type")}
            </label>
            <RadioGroup
              value={analyticsType}
              onValueChange={(value) => setAnalyticsType(value as any)}
              className="flex flex-col space-y-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="exploration" id="exploration" />
                <Label htmlFor="exploration" className="flex items-center">
                  <BarChart className="h-4 w-4 mr-2" />
                  {t("reporting.analytics.exploration", "Data Exploration")}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="benchmarking" id="benchmarking" />
                <Label htmlFor="benchmarking" className="flex items-center">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  {t("reporting.analytics.benchmarking", "Benchmarking")}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="performance" id="performance" />
                <Label htmlFor="performance" className="flex items-center">
                  <Activity className="h-4 w-4 mr-2" />
                  {t("reporting.analytics.performance", "Performance Analysis")}
                </Label>
              </div>
            </RadioGroup>
          </div>

          {analyticsType === "exploration" && (
            <div className="space-y-3 mt-3">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center">
                  <Filter className="h-4 w-4 mr-2" />
                  {t("reporting.analytics.filters", "Data Filters")}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="text"
                    placeholder={t(
                      "reporting.analytics.filterKey",
                      "Filter Key",
                    )}
                    className="w-full"
                    value={dataFilters.filterKey || ""}
                    onChange={(e) =>
                      handleAnalyticsFilterChange("filterKey", e.target.value)
                    }
                  />
                  <Input
                    type="text"
                    placeholder={t(
                      "reporting.analytics.filterValue",
                      "Filter Value",
                    )}
                    className="w-full"
                    value={dataFilters.filterValue || ""}
                    onChange={(e) =>
                      handleAnalyticsFilterChange("filterValue", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center">
                  <Layers className="h-4 w-4 mr-2" />
                  {t("reporting.analytics.groupBy", "Group By")}
                </label>
                <Select
                  value={dataFilters.groupBy || ""}
                  onValueChange={(value) =>
                    handleAnalyticsFilterChange("groupBy", value)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={t(
                        "reporting.analytics.selectGrouping",
                        "Select Grouping",
                      )}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">
                      {t("reporting.analytics.groupByDate", "Date")}
                    </SelectItem>
                    <SelectItem value="category">
                      {t("reporting.analytics.groupByCategory", "Category")}
                    </SelectItem>
                    <SelectItem value="location">
                      {t("reporting.analytics.groupByLocation", "Location")}
                    </SelectItem>
                    <SelectItem value="status">
                      {t("reporting.analytics.groupByStatus", "Status")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center">
                  <PieChart className="h-4 w-4 mr-2" />
                  {t("reporting.analytics.visualization", "Visualization Type")}
                </label>
                <Select
                  value={dataFilters.visualizationType || ""}
                  onValueChange={(value) =>
                    handleAnalyticsFilterChange("visualizationType", value)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={t(
                        "reporting.analytics.selectVisualization",
                        "Select Visualization",
                      )}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bar">
                      {t("reporting.analytics.barChart", "Bar Chart")}
                    </SelectItem>
                    <SelectItem value="line">
                      {t("reporting.analytics.lineChart", "Line Chart")}
                    </SelectItem>
                    <SelectItem value="pie">
                      {t("reporting.analytics.pieChart", "Pie Chart")}
                    </SelectItem>
                    <SelectItem value="table">
                      {t("reporting.analytics.table", "Table")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {analyticsType === "benchmarking" && (
            <div className="space-y-3 mt-3">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  {t("reporting.analytics.benchmarkTarget", "Benchmark Target")}
                </label>
                <Select
                  value={benchmarkTarget}
                  onValueChange={setBenchmarkTarget}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={t(
                        "reporting.analytics.selectBenchmark",
                        "Select Benchmark Target",
                      )}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="historical">
                      {t(
                        "reporting.analytics.historical",
                        "Historical Performance",
                      )}
                    </SelectItem>
                    <SelectItem value="industry">
                      {t("reporting.analytics.industry", "Industry Standard")}
                    </SelectItem>
                    <SelectItem value="target">
                      {t("reporting.analytics.target", "Target Goals")}
                    </SelectItem>
                    <SelectItem value="peer">
                      {t("reporting.analytics.peer", "Peer Comparison")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center">
                  <LineChart className="h-4 w-4 mr-2" />
                  {t("reporting.analytics.trendPeriod", "Trend Period")}
                </label>
                <Select
                  value={dataFilters.trendPeriod || ""}
                  onValueChange={(value) =>
                    handleAnalyticsFilterChange("trendPeriod", value)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={t(
                        "reporting.analytics.selectPeriod",
                        "Select Period",
                      )}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">
                      {t("reporting.analytics.monthly", "Monthly")}
                    </SelectItem>
                    <SelectItem value="quarterly">
                      {t("reporting.analytics.quarterly", "Quarterly")}
                    </SelectItem>
                    <SelectItem value="yearly">
                      {t("reporting.analytics.yearly", "Yearly")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {analyticsType === "performance" && (
            <div className="space-y-3 mt-3">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center">
                  <Activity className="h-4 w-4 mr-2" />
                  {t(
                    "reporting.analytics.performanceMetrics",
                    "Performance Metrics",
                  )}
                </label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="efficiency"
                      checked={performanceMetrics.includes("efficiency")}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setPerformanceMetrics([
                            ...performanceMetrics,
                            "efficiency",
                          ]);
                        } else {
                          setPerformanceMetrics(
                            performanceMetrics.filter(
                              (m) => m !== "efficiency",
                            ),
                          );
                        }
                      }}
                    />
                    <Label htmlFor="efficiency">
                      {t(
                        "reporting.analytics.efficiency",
                        "Process Efficiency",
                      )}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="bottlenecks"
                      checked={performanceMetrics.includes("bottlenecks")}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setPerformanceMetrics([
                            ...performanceMetrics,
                            "bottlenecks",
                          ]);
                        } else {
                          setPerformanceMetrics(
                            performanceMetrics.filter(
                              (m) => m !== "bottlenecks",
                            ),
                          );
                        }
                      }}
                    />
                    <Label htmlFor="bottlenecks">
                      {t(
                        "reporting.analytics.bottlenecks",
                        "Bottleneck Identification",
                      )}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="resources"
                      checked={performanceMetrics.includes("resources")}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setPerformanceMetrics([
                            ...performanceMetrics,
                            "resources",
                          ]);
                        } else {
                          setPerformanceMetrics(
                            performanceMetrics.filter((m) => m !== "resources"),
                          );
                        }
                      }}
                    />
                    <Label htmlFor="resources">
                      {t(
                        "reporting.analytics.resources",
                        "Resource Optimization",
                      )}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="timeline"
                      checked={performanceMetrics.includes("timeline")}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setPerformanceMetrics([
                            ...performanceMetrics,
                            "timeline",
                          ]);
                        } else {
                          setPerformanceMetrics(
                            performanceMetrics.filter((m) => m !== "timeline"),
                          );
                        }
                      }}
                    />
                    <Label htmlFor="timeline">
                      {t("reporting.analytics.timeline", "Timeline Analysis")}
                    </Label>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center">
                  <Sliders className="h-4 w-4 mr-2" />
                  {t(
                    "reporting.analytics.optimizationTarget",
                    "Optimization Target",
                  )}
                </label>
                <Select
                  value={dataFilters.optimizationTarget || ""}
                  onValueChange={(value) =>
                    handleAnalyticsFilterChange("optimizationTarget", value)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={t(
                        "reporting.analytics.selectTarget",
                        "Select Optimization Target",
                      )}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cost">
                      {t("reporting.analytics.cost", "Cost Reduction")}
                    </SelectItem>
                    <SelectItem value="time">
                      {t("reporting.analytics.time", "Time Efficiency")}
                    </SelectItem>
                    <SelectItem value="quality">
                      {t("reporting.analytics.quality", "Quality Improvement")}
                    </SelectItem>
                    <SelectItem value="resource">
                      {t("reporting.analytics.resource", "Resource Allocation")}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white">
      <Card>
        <CardHeader>
          <CardTitle>
            <div className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              {t("reporting.generator.title", "Report Generator")}
            </div>
          </CardTitle>
          <CardDescription>
            {t(
              "reporting.generator.description",
              "Generate custom reports based on templates",
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert variant="success" className="mb-4">
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-6">
            {/* Template Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {t(
                  "reporting.generator.selectTemplate",
                  "Select Report Template",
                )}
              </label>
              <Select
                value={selectedTemplate}
                onValueChange={handleTemplateChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue
                    placeholder={t(
                      "reporting.generator.selectTemplatePlaceholder",
                      "Select a template",
                    )}
                  />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{template.name}</span>
                        {template.clientSpecificConfig && (
                          <Badge variant="outline" className="ml-2">
                            {template.clientSpecificConfig.clientType}
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {template && (
              <>
                {/* Template Description */}
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-sm text-gray-600">
                    {template.description}
                  </p>
                  {template.clientSpecificConfig && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {template.clientSpecificConfig.metrics.map((metric) => (
                        <Badge
                          key={metric}
                          variant="secondary"
                          className="text-xs"
                        >
                          {metric}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="parameters">
                      {t("reporting.generator.parameters", "Parameters")}
                    </TabsTrigger>
                    <TabsTrigger value="format">
                      {t("reporting.generator.format", "Format")}
                    </TabsTrigger>
                    <TabsTrigger value="analytics">
                      {t("reporting.generator.analytics", "Analytics")}
                    </TabsTrigger>
                    <TabsTrigger value="schedule">
                      {t("reporting.generator.schedule", "Schedule")}
                    </TabsTrigger>
                    <TabsTrigger value="preview">
                      {t("reporting.generator.preview", "Preview")}
                    </TabsTrigger>
                  </TabsList>

                  {/* Parameters Tab */}
                  <TabsContent value="parameters" className="space-y-4 pt-4">
                    {/* Date Range */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          {t("reporting.generator.startDate", "Start Date")}
                        </label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left font-normal"
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {dateRange.start ? (
                                format(dateRange.start, "PPP")
                              ) : (
                                <span>
                                  {t(
                                    "reporting.generator.pickDate",
                                    "Pick a date",
                                  )}
                                </span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={dateRange.start}
                              onSelect={(date) =>
                                setDateRange((prev) => ({
                                  ...prev,
                                  start: date,
                                }))
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          {t("reporting.generator.endDate", "End Date")}
                        </label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-start text-left font-normal"
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {dateRange.end ? (
                                format(dateRange.end, "PPP")
                              ) : (
                                <span>
                                  {t(
                                    "reporting.generator.pickDate",
                                    "Pick a date",
                                  )}
                                </span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={dateRange.end}
                              onSelect={(date) =>
                                setDateRange((prev) => ({ ...prev, end: date }))
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>

                    {/* Template-specific parameters */}
                    {renderParameterFields()}

                    {/* Client-specific options */}
                    {renderClientSpecificOptions()}
                  </TabsContent>

                  {/* Format Tab */}
                  <TabsContent value="format" className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        {t("reporting.generator.outputFormat", "Output Format")}
                      </label>
                      <Select
                        value={format}
                        onValueChange={(value) =>
                          setFormat(value as ReportFormat)
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pdf">PDF</SelectItem>
                          <SelectItem value="excel">Excel</SelectItem>
                          <SelectItem value="csv">CSV</SelectItem>
                          <SelectItem value="html">HTML</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="mt-6 p-4 bg-gray-50 rounded-md">
                      <h3 className="text-sm font-medium mb-2">
                        {t(
                          "reporting.generator.formatDetails",
                          "Format Details",
                        )}
                      </h3>
                      {format === "pdf" && (
                        <p className="text-sm text-gray-600">
                          {t(
                            "reporting.generator.pdfDescription",
                            "PDF format is ideal for printing and sharing reports with a professional layout. All charts and tables will be rendered as they appear in the preview.",
                          )}
                        </p>
                      )}
                      {format === "excel" && (
                        <p className="text-sm text-gray-600">
                          {t(
                            "reporting.generator.excelDescription",
                            "Excel format allows for further data analysis and manipulation. Data will be organized in worksheets with formulas preserved where applicable.",
                          )}
                        </p>
                      )}
                      {format === "csv" && (
                        <p className="text-sm text-gray-600">
                          {t(
                            "reporting.generator.csvDescription",
                            "CSV format provides raw data in a comma-separated values format, ideal for importing into other systems or data analysis tools.",
                          )}
                        </p>
                      )}
                      {format === "html" && (
                        <p className="text-sm text-gray-600">
                          {t(
                            "reporting.generator.htmlDescription",
                            "HTML format provides an interactive web-based report that can be viewed in any browser, with support for interactive charts and tables.",
                          )}
                        </p>
                      )}
                    </div>
                  </TabsContent>

                  {/* Analytics Tab */}
                  <TabsContent value="analytics" className="space-y-4 pt-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="enable-analytics"
                        checked={showAnalytics}
                        onCheckedChange={setShowAnalytics}
                      />
                      <Label htmlFor="enable-analytics">
                        {t(
                          "reporting.generator.enableAnalytics",
                          "Enable advanced analytics",
                        )}
                      </Label>
                    </div>

                    {renderAnalyticsOptions()}
                  </TabsContent>

                  {/* Schedule Tab */}
                  <TabsContent value="schedule" className="space-y-4 pt-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="enable-scheduling"
                        checked={enableScheduling}
                        onCheckedChange={setEnableScheduling}
                      />
                      <Label htmlFor="enable-scheduling">
                        {t(
                          "reporting.generator.enableScheduling",
                          "Enable scheduled report generation",
                        )}
                      </Label>
                    </div>

                    {enableScheduling && (
                      <div className="mt-4 space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">
                            {t("reporting.generator.frequency", "Frequency")}
                          </label>
                          <RadioGroup
                            value={scheduleFrequency}
                            onValueChange={(value) =>
                              setScheduleFrequency(value as any)
                            }
                            className="flex space-x-4"
                          >
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="daily" id="daily" />
                              <Label htmlFor="daily">
                                {t("reporting.generator.daily", "Daily")}
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="weekly" id="weekly" />
                              <Label htmlFor="weekly">
                                {t("reporting.generator.weekly", "Weekly")}
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem value="monthly" id="monthly" />
                              <Label htmlFor="monthly">
                                {t("reporting.generator.monthly", "Monthly")}
                              </Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <RadioGroupItem
                                value="quarterly"
                                id="quarterly"
                              />
                              <Label htmlFor="quarterly">
                                {t(
                                  "reporting.generator.quarterly",
                                  "Quarterly",
                                )}
                              </Label>
                            </div>
                          </RadioGroup>
                        </div>

                        {scheduleFrequency === "weekly" && (
                          <div className="space-y-2">
                            <label className="text-sm font-medium">
                              {t(
                                "reporting.generator.dayOfWeek",
                                "Day of Week",
                              )}
                            </label>
                            <Select
                              value={scheduleDayOfWeek.toString()}
                              onValueChange={(value) =>
                                setScheduleDayOfWeek(parseInt(value))
                              }
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="0">
                                  {t("reporting.generator.sunday", "Sunday")}
                                </SelectItem>
                                <SelectItem value="1">
                                  {t("reporting.generator.monday", "Monday")}
                                </SelectItem>
                                <SelectItem value="2">
                                  {t("reporting.generator.tuesday", "Tuesday")}
                                </SelectItem>
                                <SelectItem value="3">
                                  {t(
                                    "reporting.generator.wednesday",
                                    "Wednesday",
                                  )}
                                </SelectItem>
                                <SelectItem value="4">
                                  {t(
                                    "reporting.generator.thursday",
                                    "Thursday",
                                  )}
                                </SelectItem>
                                <SelectItem value="5">
                                  {t("reporting.generator.friday", "Friday")}
                                </SelectItem>
                                <SelectItem value="6">
                                  {t(
                                    "reporting.generator.saturday",
                                    "Saturday",
                                  )}
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}

                        {(scheduleFrequency === "monthly" ||
                          scheduleFrequency === "quarterly") && (
                          <div className="space-y-2">
                            <label className="text-sm font-medium">
                              {t(
                                "reporting.generator.dayOfMonth",
                                "Day of Month",
                              )}
                            </label>
                            <Select
                              value={scheduleDayOfMonth.toString()}
                              onValueChange={(value) =>
                                setScheduleDayOfMonth(parseInt(value))
                              }
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {Array.from(
                                  { length: 31 },
                                  (_, i) => i + 1,
                                ).map((day) => (
                                  <SelectItem key={day} value={day.toString()}>
                                    {day}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}

                        <div className="space-y-2">
                          <label className="text-sm font-medium">
                            {t("reporting.generator.timeOfDay", "Time of Day")}
                          </label>
                          <div className="flex items-center">
                            <Clock className="mr-2 h-4 w-4 text-gray-500" />
                            <Input
                              type="time"
                              value={scheduleTime}
                              onChange={(e) => setScheduleTime(e.target.value)}
                              className="w-full"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <label className="text-sm font-medium">
                            {t(
                              "reporting.generator.recipients",
                              "Recipients (comma separated emails)",
                            )}
                          </label>
                          <div className="flex items-center">
                            <Mail className="mr-2 h-4 w-4 text-gray-500" />
                            <Input
                              type="text"
                              value={scheduleRecipients}
                              onChange={(e) =>
                                setScheduleRecipients(e.target.value)
                              }
                              placeholder="email@example.com, another@example.com"
                              className="w-full"
                            />
                          </div>
                        </div>

                        <Button
                          onClick={handleScheduleReport}
                          className="mt-4"
                          disabled={
                            !selectedTemplate ||
                            !enableScheduling ||
                            !scheduleRecipients
                          }
                        >
                          <Check className="mr-2 h-4 w-4" />
                          {t(
                            "reporting.generator.scheduleReport",
                            "Schedule Report",
                          )}
                        </Button>
                      </div>
                    )}
                  </TabsContent>

                  {/* Preview Tab */}
                  <TabsContent value="preview" className="pt-4">
                    <div className="bg-gray-50 p-4 rounded-md min-h-[300px] flex flex-col items-center justify-center">
                      {generatedReport ? (
                        <div className="text-center w-full">
                          <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-4">
                            <p className="text-green-600 font-medium mb-2">
                              {t(
                                "reporting.generator.reportGenerated",
                                "Report generated successfully",
                              )}
                            </p>
                            <p className="text-sm text-gray-600">
                              {t(
                                "reporting.generator.generatedAt",
                                "Generated at",
                              )}
                              : {format(new Date(), "PPpp")}
                            </p>
                          </div>

                          <div className="mt-4">
                            <Button
                              onClick={handleDownloadReport}
                              className="flex items-center"
                            >
                              <Download className="mr-2 h-4 w-4" />
                              {t(
                                "reporting.generator.download",
                                "Download Report",
                              )}
                            </Button>
                          </div>

                          {generatedReport.format === "html" && (
                            <div className="mt-6 border rounded-md p-4 max-h-[400px] overflow-auto w-full">
                              <div
                                dangerouslySetInnerHTML={{
                                  __html: generatedReport.content,
                                }}
                                className="text-left"
                              />
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center">
                          <p className="text-gray-500 mb-4">
                            {t(
                              "reporting.generator.previewDescription",
                              "Generate a report to see a preview",
                            )}
                          </p>
                          <Button
                            onClick={handleGenerateReport}
                            disabled={!selectedTemplate || isGenerating}
                          >
                            {isGenerating
                              ? t(
                                  "reporting.generator.generating",
                                  "Generating...",
                                )
                              : t(
                                  "reporting.generator.generate",
                                  "Generate Report",
                                )}
                          </Button>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline">{t("common.cancel", "Cancel")}</Button>
          {activeTab !== "preview" && (
            <Button
              onClick={handleGenerateReport}
              disabled={!selectedTemplate || isGenerating}
            >
              {isGenerating
                ? t("reporting.generator.generating", "Generating...")
                : t("reporting.generator.generate", "Generate Report")}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
