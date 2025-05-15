/**
 * Types for the reporting system
 */

export type ReportFormat = "pdf" | "excel" | "csv" | "html";

export interface DateRange {
  start: Date;
  end: Date;
}

export interface ReportParameters {
  dateRange: DateRange;
  [key: string]: any;
}

export interface ReportOutput {
  content: string; // Base64 encoded for binary formats, raw content for text formats
  format: ReportFormat;
  filename: string;
  generatedAt: Date;
  metadata?: Record<string, any>;
}

export interface ReportSchedule {
  frequency: "daily" | "weekly" | "monthly" | "quarterly";
  timeOfDay: string; // Format: "HH:MM"
  recipients: string[];
  dayOfWeek?: number; // 0-6, Sunday to Saturday (for weekly)
  dayOfMonth?: number; // 1-31 (for monthly and quarterly)
  lastRun?: Date;
  nextRun?: Date;
  active?: boolean;
}

export interface ClientSpecificReportConfig {
  clientType: "FDF" | "ADHA" | "Cash" | string;
  metrics: string[];
  additionalParameters?: Record<string, any>;
  customSections?: string[];
  customTemplates?: string[];
}

export interface FDFReportConfig extends ClientSpecificReportConfig {
  clientType: "FDF";
  socialImpactMetrics: boolean;
  familyWelfareTracking: boolean;
  healthSafetyMetrics: boolean;
  communityEngagement: boolean;
  socialWorkerActivity: boolean;
}

export interface ADHAReportConfig extends ClientSpecificReportConfig {
  clientType: "ADHA";
  propertyValuation: boolean;
  structuralEnhancements: boolean;
  renovationQuality: boolean;
  propertyDatabase: boolean;
  governmentCompliance: boolean;
}

export interface CashClientReportConfig extends ClientSpecificReportConfig {
  clientType: "Cash";
  costEffectiveness: boolean;
  paymentTracking: boolean;
  serviceQuality: boolean;
  valueForMoney: boolean;
  clientSatisfaction: boolean;
}

export interface AbuDhabiReportConfig extends ClientSpecificReportConfig {
  clientType: "AbuDhabi";
  region: "Abu Dhabi Emirate";
  cities: string[];
  propertyValuation: boolean;
  structuralEnhancements: boolean;
  renovationQuality: boolean;
  governmentCompliance: boolean;
  culturalPreservation: boolean;
  sustainabilityMetrics: boolean;
  accessibilityStandards: boolean;
}
