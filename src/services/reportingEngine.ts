// Reporting Engine for Barakatna Platform
// Generates dynamic reports with customizable templates

// Define report format types
export enum ReportFormat {
  PDF = "pdf",
  Excel = "excel",
  CSV = "csv",
  HTML = "html",
  JSON = "json",
}

// Define report type
export enum ReportType {
  Assessment = "assessment",
  Project = "project",
  Financial = "financial",
  Operational = "operational",
  Compliance = "compliance",
  Executive = "executive",
  Custom = "custom",
}

// Define report frequency
export enum ReportFrequency {
  OneTime = "one_time",
  Daily = "daily",
  Weekly = "weekly",
  Monthly = "monthly",
  Quarterly = "quarterly",
  Yearly = "yearly",
  Custom = "custom",
}

// Define report parameter interface
export interface ReportParameter {
  name: string;
  label: string;
  type: "string" | "number" | "date" | "boolean" | "select" | "multi-select";
  required: boolean;
  defaultValue?: any;
  options?: { value: string; label: string }[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
}

// Define report template interface
export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: ReportType;
  formats: ReportFormat[];
  parameters: ReportParameter[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  version: string;
  templateContent: string; // Template content (could be HTML, JSON schema, etc.)
  metadata?: Record<string, any>;
}

// Define report interface
export interface Report {
  id: string;
  templateId: string;
  name: string;
  description?: string;
  format: ReportFormat;
  parameters: Record<string, any>;
  createdAt: Date;
  createdBy: string;
  status: "pending" | "processing" | "completed" | "failed";
  url?: string;
  error?: string;
  metadata?: Record<string, any>;
}

// Define scheduled report interface
export interface ScheduledReport {
  id: string;
  templateId: string;
  name: string;
  description?: string;
  format: ReportFormat;
  parameters: Record<string, any>;
  frequency: ReportFrequency;
  customCronExpression?: string;
  nextRunDate: Date;
  lastRunDate?: Date;
  recipients: string[];
  isActive: boolean;
  createdAt: Date;
  createdBy: string;
  metadata?: Record<string, any>;
}

// Define report generation result interface
export interface ReportGenerationResult {
  success: boolean;
  reportId?: string;
  url?: string;
  error?: string;
  metadata?: Record<string, any>;
}

// Reporting Engine class
export class ReportingEngine {
  private static instance: ReportingEngine;
  private templates: Map<string, ReportTemplate> = new Map();
  private reports: Map<string, Report> = new Map();
  private scheduledReports: Map<string, ScheduledReport> = new Map();
  private scheduledJobIds: Map<string, number> = new Map();

  private constructor() {}

  public static getInstance(): ReportingEngine {
    if (!ReportingEngine.instance) {
      ReportingEngine.instance = new ReportingEngine();
    }
    return ReportingEngine.instance;
  }

  // Register a report template
  public registerTemplate(template: ReportTemplate): void {
    this.templates.set(template.id, template);
  }

  // Get a template by ID
  public getTemplate(templateId: string): ReportTemplate | undefined {
    return this.templates.get(templateId);
  }

  // Get all templates
  public getAllTemplates(): ReportTemplate[] {
    return Array.from(this.templates.values());
  }

  // Get templates by type
  public getTemplatesByType(type: ReportType): ReportTemplate[] {
    return Array.from(this.templates.values()).filter(
      (template) => template.type === type,
    );
  }

  // Get a report by ID
  public getReport(reportId: string): Report | undefined {
    return this.reports.get(reportId);
  }

  // Get all reports
  public getAllReports(): Report[] {
    return Array.from(this.reports.values());
  }

  // Get a scheduled report by ID
  public getScheduledReport(reportId: string): ScheduledReport | undefined {
    return this.scheduledReports.get(reportId);
  }

  // Get all scheduled reports
  public getAllScheduledReports(): ScheduledReport[] {
    return Array.from(this.scheduledReports.values());
  }

  // Generate a report
  public async generateReport(
    templateId: string,
    parameters: Record<string, any>,
    format: ReportFormat,
    userId: string,
  ): Promise<ReportGenerationResult> {
    try {
      const template = this.templates.get(templateId);
      if (!template) {
        return {
          success: false,
          error: `Template with ID ${templateId} not found`,
        };
      }

      if (!template.formats.includes(format)) {
        return {
          success: false,
          error: `Format ${format} not supported for this template`,
        };
      }

      // Validate parameters
      const validationResult = this.validateParameters(template, parameters);
      if (!validationResult.valid) {
        return {
          success: false,
          error: `Parameter validation failed: ${validationResult.error}`,
        };
      }

      // Create report record
      const reportId = `report_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      const report: Report = {
        id: reportId,
        templateId,
        name: `${template.name} - ${new Date().toISOString()}`,
        format,
        parameters,
        createdAt: new Date(),
        createdBy: userId,
        status: "pending",
      };

      this.reports.set(reportId, report);

      // Start report generation process
      this.processReport(reportId);

      return {
        success: true,
        reportId,
      };
    } catch (error) {
      return {
        success: false,
        error: `Report generation error: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  // Schedule a report
  public scheduleReport(
    templateId: string,
    parameters: Record<string, any>,
    format: ReportFormat,
    frequency: ReportFrequency,
    recipients: string[],
    userId: string,
    name?: string,
    description?: string,
    customCronExpression?: string,
  ): string | null {
    try {
      const template = this.templates.get(templateId);
      if (!template) {
        console.error(`Template with ID ${templateId} not found`);
        return null;
      }

      if (!template.formats.includes(format)) {
        console.error(`Format ${format} not supported for this template`);
        return null;
      }

      // Validate parameters
      const validationResult = this.validateParameters(template, parameters);
      if (!validationResult.valid) {
        console.error(`Parameter validation failed: ${validationResult.error}`);
        return null;
      }

      // Calculate next run date
      const nextRunDate = this.calculateNextRunDate(
        frequency,
        customCronExpression,
      );
      if (!nextRunDate) {
        console.error("Failed to calculate next run date");
        return null;
      }

      // Create scheduled report record
      const reportId = `scheduled_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      const scheduledReport: ScheduledReport = {
        id: reportId,
        templateId,
        name: name || `${template.name} - ${frequency}`,
        description,
        format,
        parameters,
        frequency,
        customCronExpression,
        nextRunDate,
        recipients,
        isActive: true,
        createdAt: new Date(),
        createdBy: userId,
      };

      this.scheduledReports.set(reportId, scheduledReport);

      // Schedule the report
      this.scheduleReportExecution(reportId);

      return reportId;
    } catch (error) {
      console.error(
        "Error scheduling report:",
        error instanceof Error ? error.message : String(error),
      );
      return null;
    }
  }

  // Update a scheduled report
  public updateScheduledReport(
    reportId: string,
    updates: Partial<ScheduledReport>,
  ): boolean {
    try {
      const scheduledReport = this.scheduledReports.get(reportId);
      if (!scheduledReport) {
        return false;
      }

      // Update the scheduled report
      const updatedReport = { ...scheduledReport, ...updates };
      this.scheduledReports.set(reportId, updatedReport);

      // If frequency or active status changed, reschedule
      if (
        updates.frequency !== undefined ||
        updates.customCronExpression !== undefined ||
        updates.isActive !== undefined
      ) {
        // Clear existing schedule
        const jobId = this.scheduledJobIds.get(reportId);
        if (jobId) {
          clearTimeout(jobId);
          this.scheduledJobIds.delete(reportId);
        }

        // Reschedule if active
        if (updatedReport.isActive) {
          this.scheduleReportExecution(reportId);
        }
      }

      return true;
    } catch (error) {
      console.error(
        "Error updating scheduled report:",
        error instanceof Error ? error.message : String(error),
      );
      return false;
    }
  }

  // Delete a scheduled report
  public deleteScheduledReport(reportId: string): boolean {
    try {
      const scheduledReport = this.scheduledReports.get(reportId);
      if (!scheduledReport) {
        return false;
      }

      // Clear schedule
      const jobId = this.scheduledJobIds.get(reportId);
      if (jobId) {
        clearTimeout(jobId);
        this.scheduledJobIds.delete(reportId);
      }

      // Remove report
      this.scheduledReports.delete(reportId);

      return true;
    } catch (error) {
      console.error(
        "Error deleting scheduled report:",
        error instanceof Error ? error.message : String(error),
      );
      return false;
    }
  }

  // Process a report
  private async processReport(reportId: string): Promise<void> {
    const report = this.reports.get(reportId);
    if (!report) {
      return;
    }

    try {
      // Update status to processing
      report.status = "processing";
      this.reports.set(reportId, report);

      // In a real implementation, this would generate the actual report
      console.log(`Processing report: ${report.name}`);

      // Simulate report generation delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Update report with success
      const updatedReport = {
        ...report,
        status: "completed",
        url: `https://example.com/reports/${reportId}.${report.format}`,
      };
      this.reports.set(reportId, updatedReport);

      console.log(`Report generated successfully: ${report.name}`);
    } catch (error) {
      // Update report with error
      const updatedReport = {
        ...report,
        status: "failed",
        error: `Report generation failed: ${error instanceof Error ? error.message : String(error)}`,
      };
      this.reports.set(reportId, updatedReport);

      console.error(
        `Error processing report ${reportId}:`,
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  // Schedule report execution
  private scheduleReportExecution(reportId: string): void {
    const scheduledReport = this.scheduledReports.get(reportId);
    if (!scheduledReport || !scheduledReport.isActive) {
      return;
    }

    const now = new Date();
    const nextRunDate = scheduledReport.nextRunDate;
    const timeUntilNextRun = nextRunDate.getTime() - now.getTime();

    if (timeUntilNextRun <= 0) {
      // Run immediately if next run date is in the past
      this.executeScheduledReport(reportId);
    } else {
      // Schedule for future execution
      const timeoutId = window.setTimeout(() => {
        this.executeScheduledReport(reportId);
      }, timeUntilNextRun);

      this.scheduledJobIds.set(reportId, timeoutId);
    }
  }

  // Execute a scheduled report
  private async executeScheduledReport(reportId: string): Promise<void> {
    const scheduledReport = this.scheduledReports.get(reportId);
    if (!scheduledReport) {
      return;
    }

    try {
      // Generate the report
      const result = await this.generateReport(
        scheduledReport.templateId,
        scheduledReport.parameters,
        scheduledReport.format,
        scheduledReport.createdBy,
      );

      if (result.success && result.reportId) {
        // Wait for report to complete
        await this.waitForReportCompletion(result.reportId);

        // Send report to recipients
        this.distributeReport(result.reportId, scheduledReport.recipients);
      }

      // Update last run date and calculate next run date
      const lastRunDate = new Date();
      const nextRunDate = this.calculateNextRunDate(
        scheduledReport.frequency,
        scheduledReport.customCronExpression,
        lastRunDate,
      );

      if (nextRunDate) {
        const updatedReport = {
          ...scheduledReport,
          lastRunDate,
          nextRunDate,
        };
        this.scheduledReports.set(reportId, updatedReport);

        // Schedule next execution
        this.scheduleReportExecution(reportId);
      }
    } catch (error) {
      console.error(
        `Error executing scheduled report ${reportId}:`,
        error instanceof Error ? error.message : String(error),
      );

      // Reschedule for next run even if there was an error
      const nextRunDate = this.calculateNextRunDate(
        scheduledReport.frequency,
        scheduledReport.customCronExpression,
      );

      if (nextRunDate) {
        const updatedReport = {
          ...scheduledReport,
          lastRunDate: new Date(),
          nextRunDate,
        };
        this.scheduledReports.set(reportId, updatedReport);

        // Schedule next execution
        this.scheduleReportExecution(reportId);
      }
    }
  }

  // Wait for a report to complete
  private async waitForReportCompletion(reportId: string): Promise<void> {
    const maxWaitTime = 60000; // 60 seconds
    const checkInterval = 1000; // 1 second
    let waitTime = 0;

    while (waitTime < maxWaitTime) {
      const report = this.reports.get(reportId);
      if (!report) {
        throw new Error(`Report ${reportId} not found`);
      }

      if (report.status === "completed") {
        return;
      }

      if (report.status === "failed") {
        throw new Error(report.error || "Report generation failed");
      }

      // Wait for check interval
      await new Promise((resolve) => setTimeout(resolve, checkInterval));
      waitTime += checkInterval;
    }

    throw new Error(
      `Report generation timed out after ${maxWaitTime / 1000} seconds`,
    );
  }

  // Distribute report to recipients
  private distributeReport(reportId: string, recipients: string[]): void {
    const report = this.reports.get(reportId);
    if (!report || report.status !== "completed" || !report.url) {
      return;
    }

    // In a real implementation, this would send emails or notifications
    console.log(
      `Distributing report ${report.name} to ${recipients.length} recipients`,
    );
    recipients.forEach((recipient) => {
      console.log(`Sending report to ${recipient}: ${report.url}`);
    });
  }

  // Calculate next run date based on frequency
  private calculateNextRunDate(
    frequency: ReportFrequency,
    customCronExpression?: string,
    fromDate: Date = new Date(),
  ): Date | null {
    try {
      const date = new Date(fromDate);

      switch (frequency) {
        case ReportFrequency.Daily:
          date.setDate(date.getDate() + 1);
          date.setHours(0, 0, 0, 0);
          return date;

        case ReportFrequency.Weekly:
          date.setDate(date.getDate() + 7);
          date.setHours(0, 0, 0, 0);
          return date;

        case ReportFrequency.Monthly:
          date.setMonth(date.getMonth() + 1);
          date.setDate(1);
          date.setHours(0, 0, 0, 0);
          return date;

        case ReportFrequency.Quarterly:
          date.setMonth(date.getMonth() + 3);
          date.setDate(1);
          date.setHours(0, 0, 0, 0);
          return date;

        case ReportFrequency.Yearly:
          date.setFullYear(date.getFullYear() + 1);
          date.setMonth(0);
          date.setDate(1);
          date.setHours(0, 0, 0, 0);
          return date;

        case ReportFrequency.Custom:
          if (!customCronExpression) {
            console.error("Custom frequency requires a cron expression");
            return null;
          }
          // In a real implementation, this would parse the cron expression
          // For now, just add a day as a placeholder
          date.setDate(date.getDate() + 1);
          return date;

        case ReportFrequency.OneTime:
        default:
          return null;
      }
    } catch (error) {
      console.error(
        "Error calculating next run date:",
        error instanceof Error ? error.message : String(error),
      );
      return null;
    }
  }

  // Validate report parameters
  private validateParameters(
    template: ReportTemplate,
    parameters: Record<string, any>,
  ): { valid: boolean; error?: string } {
    for (const param of template.parameters) {
      // Check required parameters
      if (param.required && parameters[param.name] === undefined) {
        return {
          valid: false,
          error: `Required parameter ${param.name} is missing`,
        };
      }

      // Skip validation for optional parameters that are not provided
      if (!param.required && parameters[param.name] === undefined) {
        continue;
      }

      const value = parameters[param.name];

      // Type validation
      switch (param.type) {
        case "string":
          if (typeof value !== "string") {
            return {
              valid: false,
              error: `Parameter ${param.name} must be a string`,
            };
          }

          // String validation
          if (
            param.validation?.pattern &&
            !new RegExp(param.validation.pattern).test(value)
          ) {
            return {
              valid: false,
              error:
                param.validation.message ||
                `Parameter ${param.name} does not match required pattern`,
            };
          }
          break;

        case "number":
          if (typeof value !== "number") {
            return {
              valid: false,
              error: `Parameter ${param.name} must be a number`,
            };
          }

          // Number validation
          if (
            param.validation?.min !== undefined &&
            value < param.validation.min
          ) {
            return {
              valid: false,
              error:
                param.validation.message ||
                `Parameter ${param.name} must be at least ${param.validation.min}`,
            };
          }

          if (
            param.validation?.max !== undefined &&
            value > param.validation.max
          ) {
            return {
              valid: false,
              error:
                param.validation.message ||
                `Parameter ${param.name} must be at most ${param.validation.max}`,
            };
          }
          break;

        case "date":
          if (!(value instanceof Date) && isNaN(Date.parse(value))) {
            return {
              valid: false,
              error: `Parameter ${param.name} must be a valid date`,
            };
          }
          break;

        case "boolean":
          if (typeof value !== "boolean") {
            return {
              valid: false,
              error: `Parameter ${param.name} must be a boolean`,
            };
          }
          break;

        case "select":
          if (
            param.options &&
            !param.options.some((option) => option.value === value)
          ) {
            return {
              valid: false,
              error: `Parameter ${param.name} must be one of the allowed values`,
            };
          }
          break;

        case "multi-select":
          if (!Array.isArray(value)) {
            return {
              valid: false,
              error: `Parameter ${param.name} must be an array`,
            };
          }

          if (
            param.options &&
            !value.every((v) =>
              param.options?.some((option) => option.value === v),
            )
          ) {
            return {
              valid: false,
              error: `Parameter ${param.name} contains invalid values`,
            };
          }
          break;
      }
    }

    return { valid: true };
  }

  // Clean up resources
  public dispose(): void {
    // Clear all scheduled report timeouts
    this.scheduledJobIds.forEach((timeoutId) => {
      clearTimeout(timeoutId);
    });
    this.scheduledJobIds.clear();
  }
}

// Export default instance
export default ReportingEngine.getInstance();
