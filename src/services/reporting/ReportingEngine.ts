import { ReportTemplate } from "./ReportTemplate";
import {
  ReportFormat,
  ReportParameters,
  ReportOutput,
  ReportSchedule,
  ClientSpecificReportConfig,
} from "./ReportTypes";

// Mock templates for demonstration
const mockTemplates: ReportTemplate[] = [
  new ReportTemplate({
    id: "beneficiary-status",
    name: "Beneficiary Status Report",
    description: "Comprehensive report on beneficiary status and progress",
    parameters: ["beneficiaryId", "includeHistory", "detailLevel"],
    defaultFormat: "pdf",
  }),
  new ReportTemplate({
    id: "assessment-analysis",
    name: "Assessment Analysis Report",
    description: "Detailed analysis of assessments with recommendations",
    parameters: ["assessmentType", "roomTypes", "includePhotos"],
    defaultFormat: "pdf",
  }),
  new ReportTemplate({
    id: "project-performance",
    name: "Project Performance Report",
    description: "Performance metrics and progress tracking for projects",
    parameters: ["projectId", "includeFinancials", "milestoneTracking"],
    defaultFormat: "excel",
  }),
  new ReportTemplate({
    id: "financial-summary",
    name: "Financial Summary Report",
    description: "Financial overview with budget tracking and forecasting",
    parameters: ["fiscalYear", "budgetCategory", "includeForecasts"],
    defaultFormat: "excel",
  }),
  new ReportTemplate({
    id: "fdf-social-impact",
    name: "FDF Social Impact Report",
    description:
      "Social impact metrics and family welfare tracking for FDF clients",
    parameters: ["communityId", "impactMetrics", "timeframe"],
    defaultFormat: "pdf",
    clientSpecificConfig: {
      clientType: "FDF",
      metrics: [
        "socialImpact",
        "familyWelfare",
        "healthSafety",
        "communityEngagement",
        "socialWorkerActivity",
      ],
    },
  }),
  new ReportTemplate({
    id: "adha-property",
    name: "ADHA Property Improvement Report",
    description:
      "Property improvement valuation and structural enhancement tracking",
    parameters: ["propertyId", "improvementTypes", "complianceLevel"],
    defaultFormat: "pdf",
    clientSpecificConfig: {
      clientType: "ADHA",
      metrics: [
        "propertyValuation",
        "structuralEnhancements",
        "renovationQuality",
        "governmentCompliance",
      ],
    },
  }),
  new ReportTemplate({
    id: "cash-client-value",
    name: "Cash Client Value Report",
    description: "Cost-effectiveness analysis and value-for-money assessment",
    parameters: ["clientId", "serviceTypes", "paymentPeriod"],
    defaultFormat: "excel",
    clientSpecificConfig: {
      clientType: "Cash",
      metrics: [
        "costEffectiveness",
        "paymentTracking",
        "serviceQuality",
        "valueForMoney",
        "clientSatisfaction",
      ],
    },
  }),
];

// Mock scheduled reports
const mockScheduledReports: Array<{
  id: string;
  templateId: string;
  parameters: ReportParameters;
  schedule: ReportSchedule;
  format: ReportFormat;
  clientId?: string;
}> = [];

export class ReportingEngine {
  private templates: ReportTemplate[] = [];
  private scheduledReports: Array<{
    id: string;
    templateId: string;
    parameters: ReportParameters;
    schedule: ReportSchedule;
    format: ReportFormat;
    clientId?: string;
  }> = [];

  constructor() {
    // Initialize with mock data for demonstration
    this.templates = mockTemplates;
    this.scheduledReports = mockScheduledReports;
  }

  /**
   * Get all available report templates
   */
  getAvailableTemplates(): ReportTemplate[] {
    return this.templates.filter((t) => t.isActive);
  }

  /**
   * Get templates specific to a client type
   */
  getClientSpecificTemplates(clientType: string): ReportTemplate[] {
    return this.templates.filter(
      (t) => t.isActive && t.clientSpecificConfig?.clientType === clientType,
    );
  }

  /**
   * Get a specific template by ID
   */
  getTemplateById(templateId: string): ReportTemplate | undefined {
    return this.templates.find((t) => t.id === templateId);
  }

  /**
   * Add a new template
   */
  addTemplate(template: ReportTemplate): string {
    this.templates.push(template);
    return template.id;
  }

  /**
   * Update an existing template
   */
  updateTemplate(
    templateId: string,
    updates: Partial<ReportTemplate>,
  ): boolean {
    const index = this.templates.findIndex((t) => t.id === templateId);
    if (index !== -1) {
      this.templates[index] = {
        ...this.templates[index],
        ...updates,
        updatedAt: new Date(),
      };
      return true;
    }
    return false;
  }

  /**
   * Delete a template
   */
  deleteTemplate(templateId: string): boolean {
    const initialLength = this.templates.length;
    this.templates = this.templates.filter((t) => t.id !== templateId);
    return this.templates.length < initialLength;
  }

  /**
   * Generate a report based on template and parameters
   */
  async generateReport(
    templateId: string,
    parameters: ReportParameters,
    format: ReportFormat = "pdf",
    clientId?: string,
  ): Promise<ReportOutput> {
    // In a real implementation, this would generate the actual report
    // For now, we'll return a mock response
    const template = this.getTemplateById(templateId);
    if (!template) {
      throw new Error(`Template with ID ${templateId} not found`);
    }

    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Generate mock content based on format
    let content = "";
    if (format === "html") {
      content = `<html><body><h1>${template.name}</h1><p>Generated at: ${new Date().toLocaleString()}</p><div>Parameters: ${JSON.stringify(parameters)}</div></body></html>`;
    } else if (format === "csv") {
      content = `"Report Name","Generated Date","Parameters"\n"${template.name}","${new Date().toLocaleString()}","${JSON.stringify(parameters)}"`;
    } else {
      // For PDF and Excel, we'd return base64 encoded content
      // Here we just return a placeholder
      content = "base64encodedcontent";
    }

    return {
      content,
      format,
      filename: `${template.name.replace(/\s+/g, "-").toLowerCase()}-${new Date().toISOString().split("T")[0]}.${format}`,
      generatedAt: new Date(),
      metadata: {
        templateId,
        templateName: template.name,
        parameters,
        clientId,
      },
    };
  }

  /**
   * Schedule a report for recurring generation
   */
  scheduleReport(
    templateId: string,
    parameters: ReportParameters,
    schedule: ReportSchedule,
    format: ReportFormat = "pdf",
    clientId?: string,
  ): string {
    const id = crypto.randomUUID();
    this.scheduledReports.push({
      id,
      templateId,
      parameters,
      schedule: {
        ...schedule,
        active: true,
        lastRun: undefined,
        nextRun: this.calculateNextRunDate(schedule),
      },
      format,
      clientId,
    });
    return id;
  }

  /**
   * Get all scheduled reports
   */
  getScheduledReports(): Array<{
    id: string;
    templateId: string;
    parameters: ReportParameters;
    schedule: ReportSchedule;
    format: ReportFormat;
    clientId?: string;
  }> {
    return this.scheduledReports;
  }

  /**
   * Update a scheduled report
   */
  updateScheduledReport(
    scheduleId: string,
    updates: Partial<{
      parameters: ReportParameters;
      schedule: Partial<ReportSchedule>;
      format: ReportFormat;
    }>,
  ): boolean {
    const index = this.scheduledReports.findIndex((s) => s.id === scheduleId);
    if (index !== -1) {
      if (updates.parameters) {
        this.scheduledReports[index].parameters = updates.parameters;
      }
      if (updates.schedule) {
        this.scheduledReports[index].schedule = {
          ...this.scheduledReports[index].schedule,
          ...updates.schedule,
          nextRun:
            updates.schedule.frequency || updates.schedule.timeOfDay
              ? this.calculateNextRunDate({
                  ...this.scheduledReports[index].schedule,
                  ...updates.schedule,
                })
              : this.scheduledReports[index].schedule.nextRun,
        };
      }
      if (updates.format) {
        this.scheduledReports[index].format = updates.format;
      }
      return true;
    }
    return false;
  }

  /**
   * Delete a scheduled report
   */
  deleteScheduledReport(scheduleId: string): boolean {
    const initialLength = this.scheduledReports.length;
    this.scheduledReports = this.scheduledReports.filter(
      (s) => s.id !== scheduleId,
    );
    return this.scheduledReports.length < initialLength;
  }

  /**
   * Calculate the next run date based on schedule
   */
  private calculateNextRunDate(schedule: ReportSchedule): Date {
    const now = new Date();
    const [hours, minutes] = schedule.timeOfDay.split(":").map(Number);

    let nextRun = new Date(now);
    nextRun.setHours(hours, minutes, 0, 0);

    if (nextRun <= now) {
      nextRun.setDate(nextRun.getDate() + 1); // Move to tomorrow if time has passed today
    }

    if (schedule.frequency === "weekly" && schedule.dayOfWeek !== undefined) {
      const currentDay = nextRun.getDay();
      const daysUntilTarget = (schedule.dayOfWeek - currentDay + 7) % 7;
      nextRun.setDate(nextRun.getDate() + daysUntilTarget);
    } else if (
      (schedule.frequency === "monthly" ||
        schedule.frequency === "quarterly") &&
      schedule.dayOfMonth !== undefined
    ) {
      nextRun.setDate(
        Math.min(
          schedule.dayOfMonth,
          new Date(nextRun.getFullYear(), nextRun.getMonth() + 1, 0).getDate(),
        ),
      );
      if (nextRun <= now) {
        nextRun.setMonth(nextRun.getMonth() + 1);
      }

      if (schedule.frequency === "quarterly") {
        const currentMonth = nextRun.getMonth();
        const monthsUntilNextQuarter = 3 - (currentMonth % 3);
        if (monthsUntilNextQuarter > 0) {
          nextRun.setMonth(currentMonth + monthsUntilNextQuarter);
        }
      }
    }

    return nextRun;
  }
}
