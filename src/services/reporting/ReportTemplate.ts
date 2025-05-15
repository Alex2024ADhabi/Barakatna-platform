import { ClientSpecificReportConfig, ReportFormat } from "./ReportTypes";

export interface TemplateSection {
  id: string;
  title: string;
  type:
    | "text"
    | "table"
    | "chart"
    | "image"
    | "pageBreak"
    | "header"
    | "footer";
  content?: string;
  dataSource?: string;
  chartType?: "bar" | "line" | "pie" | "gantt" | "heatmap";
  chartOptions?: Record<string, any>;
  tableColumns?: Array<{ field: string; header: string; width?: string }>;
  conditionalDisplay?: ConditionalLogic;
  styling?: SectionStyling;
  order: number;
}

export interface ConditionalLogic {
  condition:
    | "equals"
    | "notEquals"
    | "contains"
    | "greaterThan"
    | "lessThan"
    | "between"
    | "exists"
    | "notExists";
  field: string;
  value?: any;
  values?: any[];
}

export interface SectionStyling {
  fontFamily?: string;
  fontSize?: string;
  fontWeight?: string;
  textAlign?: "left" | "center" | "right" | "justify";
  color?: string;
  backgroundColor?: string;
  border?: string;
  padding?: string;
  margin?: string;
  width?: string;
  height?: string;
}

export interface DataSource {
  id: string;
  name: string;
  type: "api" | "static" | "function";
  endpoint?: string;
  staticData?: any;
  functionName?: string;
  parameters?: Record<string, any>;
}

export class ReportTemplate {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  createdAt: Date;
  updatedAt: Date;
  sections: TemplateSection[];
  dataSources: DataSource[];
  parameters?: string[];
  defaultFormat: ReportFormat;
  clientSpecificConfig?: ClientSpecificReportConfig;
  isActive: boolean;

  constructor(data: Partial<ReportTemplate>) {
    this.id = data.id || crypto.randomUUID();
    this.name = data.name || "New Template";
    this.description = data.description || "";
    this.version = data.version || "1.0.0";
    this.author = data.author || "System";
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();
    this.sections = data.sections || [];
    this.dataSources = data.dataSources || [];
    this.parameters = data.parameters || [];
    this.defaultFormat = data.defaultFormat || "pdf";
    this.clientSpecificConfig = data.clientSpecificConfig;
    this.isActive = data.isActive !== undefined ? data.isActive : true;
  }

  addSection(section: Partial<TemplateSection>): void {
    const newSection: TemplateSection = {
      id: section.id || crypto.randomUUID(),
      title: section.title || "New Section",
      type: section.type || "text",
      content: section.content,
      dataSource: section.dataSource,
      chartType: section.chartType,
      chartOptions: section.chartOptions,
      tableColumns: section.tableColumns,
      conditionalDisplay: section.conditionalDisplay,
      styling: section.styling,
      order: section.order || this.sections.length,
    };

    this.sections.push(newSection);
    this.updatedAt = new Date();
  }

  updateSection(sectionId: string, updates: Partial<TemplateSection>): void {
    const index = this.sections.findIndex((s) => s.id === sectionId);
    if (index !== -1) {
      this.sections[index] = { ...this.sections[index], ...updates };
      this.updatedAt = new Date();
    }
  }

  removeSection(sectionId: string): void {
    this.sections = this.sections.filter((s) => s.id !== sectionId);
    this.updatedAt = new Date();
  }

  addDataSource(dataSource: Partial<DataSource>): void {
    const newDataSource: DataSource = {
      id: dataSource.id || crypto.randomUUID(),
      name: dataSource.name || "New Data Source",
      type: dataSource.type || "api",
      endpoint: dataSource.endpoint,
      staticData: dataSource.staticData,
      functionName: dataSource.functionName,
      parameters: dataSource.parameters,
    };

    this.dataSources.push(newDataSource);
    this.updatedAt = new Date();
  }

  updateDataSource(dataSourceId: string, updates: Partial<DataSource>): void {
    const index = this.dataSources.findIndex((ds) => ds.id === dataSourceId);
    if (index !== -1) {
      this.dataSources[index] = { ...this.dataSources[index], ...updates };
      this.updatedAt = new Date();
    }
  }

  removeDataSource(dataSourceId: string): void {
    this.dataSources = this.dataSources.filter((ds) => ds.id !== dataSourceId);
    this.updatedAt = new Date();
  }

  setClientSpecificConfig(config: ClientSpecificReportConfig): void {
    this.clientSpecificConfig = config;
    this.updatedAt = new Date();
  }
}
