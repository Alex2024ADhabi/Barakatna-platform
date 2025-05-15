import { ReportingEngine } from "./ReportingEngine";
import { ReportTemplate } from "./ReportTemplate";
import {
  ReportFormat,
  ReportParameters,
  ReportOutput,
  ReportSchedule,
} from "./ReportTypes";

/**
 * ReportManager provides a central access point for the reporting system,
 * making it easier to initialize all templates and generate reports from a single interface.
 */
export class ReportManager {
  private static instance: ReportManager;
  private reportingEngine: ReportingEngine;

  private constructor() {
    this.reportingEngine = new ReportingEngine();
  }

  /**
   * Get the singleton instance of ReportManager
   */
  public static getInstance(): ReportManager {
    if (!ReportManager.instance) {
      ReportManager.instance = new ReportManager();
    }
    return ReportManager.instance;
  }

  /**
   * Get the reporting engine
   */
  public getReportingEngine(): ReportingEngine {
    return this.reportingEngine;
  }

  /**
   * Get all available report templates
   */
  public getAvailableTemplates(): ReportTemplate[] {
    return this.reportingEngine.getAvailableTemplates();
  }

  /**
   * Get templates specific to a client type
   */
  public getClientSpecificTemplates(clientType: string): ReportTemplate[] {
    return this.reportingEngine.getClientSpecificTemplates(clientType);
  }

  /**
   * Generate a report
   */
  public async generateReport(
    templateId: string,
    parameters: ReportParameters,
    format?: ReportFormat,
    clientId?: string,
  ): Promise<ReportOutput> {
    return this.reportingEngine.generateReport(
      templateId,
      parameters,
      format,
      clientId,
    );
  }

  /**
   * Schedule a report
   */
  public scheduleReport(
    templateId: string,
    parameters: ReportParameters,
    schedule: ReportSchedule,
    format?: ReportFormat,
    clientId?: string,
  ): string {
    return this.reportingEngine.scheduleReport(
      templateId,
      parameters,
      schedule,
      format,
      clientId,
    );
  }

  /**
   * Create a new report template
   */
  public createTemplate(template: ReportTemplate): string {
    return this.reportingEngine.addTemplate(template);
  }

  /**
   * Update an existing template
   */
  public updateTemplate(
    templateId: string,
    updates: Partial<ReportTemplate>,
  ): boolean {
    return this.reportingEngine.updateTemplate(templateId, updates);
  }
}
