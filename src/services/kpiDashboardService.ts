// KPI Dashboard Service for Barakatna Platform
// Provides real-time performance metrics and analytics

// Define KPI category types
export enum KpiCategory {
  Assessment = "assessment",
  Project = "project",
  Financial = "financial",
  Operational = "operational",
  ClientSatisfaction = "client_satisfaction",
  Compliance = "compliance",
  ResourceUtilization = "resource_utilization",
}

// Define KPI data point interface
export interface KpiDataPoint {
  timestamp: Date;
  value: number;
  metadata?: Record<string, any>;
}

// Define KPI metric interface
export interface KpiMetric {
  id: string;
  name: string;
  description: string;
  category: KpiCategory;
  unit: string;
  target?: number;
  threshold?: {
    warning: number;
    critical: number;
  };
  trend: "up" | "down" | "neutral";
  dataPoints: KpiDataPoint[];
  aggregationMethod: "sum" | "average" | "min" | "max" | "last";
  isActive: boolean;
  metadata?: Record<string, any>;
}

// Define KPI dashboard interface
export interface KpiDashboard {
  id: string;
  name: string;
  description: string;
  metrics: KpiMetric[];
  refreshInterval: number; // in seconds
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, any>;
}

// Define KPI alert interface
export interface KpiAlert {
  id: string;
  metricId: string;
  condition: "above" | "below" | "equal";
  threshold: number;
  message: string;
  severity: "info" | "warning" | "critical";
  isActive: boolean;
  createdAt: Date;
  triggeredAt?: Date;
  resolvedAt?: Date;
  notificationChannels: string[];
  metadata?: Record<string, any>;
}

// Resource utilization interfaces
export interface ResourceUtilizationData {
  resourceId: string;
  resourceName: string;
  resourceRole: string;
  utilizationPercentage: number;
  assignedHours: number;
  totalAvailableHours: number;
  utilizationByDay: {
    date: Date;
    percentage: number;
  }[];
  utilizationByProject: {
    projectId: string;
    projectName: string;
    hours: number;
    percentage: number;
  }[];
}

export interface ResourceUtilizationReport {
  id: string;
  name: string;
  dateRange: {
    from: Date;
    to: Date;
  };
  overallUtilization: number;
  resourcesCount: number;
  resourcesData: ResourceUtilizationData[];
  departmentUtilization: {
    department: string;
    utilizationPercentage: number;
    resourcesCount: number;
  }[];
  createdAt: Date;
}

// KPI Dashboard Service class
export class KpiDashboardService {
  private static instance: KpiDashboardService;
  private dashboards: Map<string, KpiDashboard> = new Map();
  private metrics: Map<string, KpiMetric> = new Map();
  private alerts: Map<string, KpiAlert> = new Map();
  private refreshIntervals: Map<string, number> = new Map();
  private resourceUtilizationReports: Map<string, ResourceUtilizationReport> =
    new Map();

  private constructor() {
    // Initialize with some default resource utilization metrics
    this.initializeResourceUtilizationMetrics();
  }

  public static getInstance(): KpiDashboardService {
    if (!KpiDashboardService.instance) {
      KpiDashboardService.instance = new KpiDashboardService();
    }
    return KpiDashboardService.instance;
  }

  // Initialize resource utilization metrics
  private initializeResourceUtilizationMetrics(): void {
    // Create resource utilization metrics
    const overallUtilizationMetric: KpiMetric = {
      id: "metric_resource_overall_utilization",
      name: "Overall Resource Utilization",
      description:
        "Percentage of total resource hours utilized across all projects",
      category: KpiCategory.ResourceUtilization,
      unit: "%",
      target: 85,
      threshold: {
        warning: 70,
        critical: 50,
      },
      trend: "up",
      dataPoints: this.generateMockDataPoints(75, 10, 30),
      aggregationMethod: "average",
      isActive: true,
    };

    const seniorContractorUtilizationMetric: KpiMetric = {
      id: "metric_resource_senior_contractor_utilization",
      name: "Senior Contractor Utilization",
      description: "Percentage of senior contractor hours utilized",
      category: KpiCategory.ResourceUtilization,
      unit: "%",
      target: 90,
      threshold: {
        warning: 75,
        critical: 60,
      },
      trend: "up",
      dataPoints: this.generateMockDataPoints(82, 8, 30),
      aggregationMethod: "average",
      isActive: true,
    };

    const accessibilitySpecialistUtilizationMetric: KpiMetric = {
      id: "metric_resource_accessibility_specialist_utilization",
      name: "Accessibility Specialist Utilization",
      description: "Percentage of accessibility specialist hours utilized",
      category: KpiCategory.ResourceUtilization,
      unit: "%",
      target: 80,
      threshold: {
        warning: 65,
        critical: 50,
      },
      trend: "up",
      dataPoints: this.generateMockDataPoints(68, 12, 30),
      aggregationMethod: "average",
      isActive: true,
    };

    const resourceAllocationEfficiencyMetric: KpiMetric = {
      id: "metric_resource_allocation_efficiency",
      name: "Resource Allocation Efficiency",
      description: "Efficiency of resource allocation across projects",
      category: KpiCategory.ResourceUtilization,
      unit: "%",
      target: 95,
      threshold: {
        warning: 80,
        critical: 70,
      },
      trend: "up",
      dataPoints: this.generateMockDataPoints(88, 7, 30),
      aggregationMethod: "average",
      isActive: true,
    };

    // Register the metrics
    this.registerMetric(overallUtilizationMetric);
    this.registerMetric(seniorContractorUtilizationMetric);
    this.registerMetric(accessibilitySpecialistUtilizationMetric);
    this.registerMetric(resourceAllocationEfficiencyMetric);

    // Create a resource utilization dashboard
    const resourceUtilizationDashboard: KpiDashboard = {
      id: "dashboard_resource_utilization",
      name: "Resource Utilization Dashboard",
      description: "Monitors resource utilization and allocation efficiency",
      metrics: [
        overallUtilizationMetric,
        seniorContractorUtilizationMetric,
        accessibilitySpecialistUtilizationMetric,
        resourceAllocationEfficiencyMetric,
      ],
      refreshInterval: 3600, // Refresh every hour
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Register the dashboard
    this.registerDashboard(resourceUtilizationDashboard);

    // Create sample resource utilization reports
    this.createSampleResourceUtilizationReports();
  }

  // Generate mock data points for metrics
  private generateMockDataPoints(
    baseValue: number,
    variance: number,
    count: number,
  ): KpiDataPoint[] {
    const dataPoints: KpiDataPoint[] = [];
    const now = new Date();

    for (let i = count - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);

      const randomVariance = Math.random() * variance * 2 - variance;
      const value = Math.max(0, Math.min(100, baseValue + randomVariance));

      dataPoints.push({
        timestamp: date,
        value,
      });
    }

    return dataPoints;
  }

  // Create sample resource utilization reports
  private createSampleResourceUtilizationReports(): void {
    const now = new Date();

    // Current month report
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const currentMonthReport: ResourceUtilizationReport = {
      id: "report_current_month",
      name: "Current Month Resource Utilization",
      dateRange: {
        from: currentMonthStart,
        to: currentMonthEnd,
      },
      overallUtilization: 78.5,
      resourcesCount: 12,
      resourcesData: this.generateMockResourceUtilizationData(12),
      departmentUtilization: [
        {
          department: "Construction",
          utilizationPercentage: 82.3,
          resourcesCount: 5,
        },
        {
          department: "Design",
          utilizationPercentage: 75.8,
          resourcesCount: 3,
        },
        {
          department: "Assessment",
          utilizationPercentage: 79.1,
          resourcesCount: 2,
        },
        {
          department: "Management",
          utilizationPercentage: 68.4,
          resourcesCount: 2,
        },
      ],
      createdAt: now,
    };

    // Previous month report
    const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const prevMonthReport: ResourceUtilizationReport = {
      id: "report_previous_month",
      name: "Previous Month Resource Utilization",
      dateRange: {
        from: prevMonthStart,
        to: prevMonthEnd,
      },
      overallUtilization: 76.2,
      resourcesCount: 12,
      resourcesData: this.generateMockResourceUtilizationData(12),
      departmentUtilization: [
        {
          department: "Construction",
          utilizationPercentage: 80.1,
          resourcesCount: 5,
        },
        {
          department: "Design",
          utilizationPercentage: 73.5,
          resourcesCount: 3,
        },
        {
          department: "Assessment",
          utilizationPercentage: 77.8,
          resourcesCount: 2,
        },
        {
          department: "Management",
          utilizationPercentage: 65.9,
          resourcesCount: 2,
        },
      ],
      createdAt: prevMonthEnd,
    };

    this.resourceUtilizationReports.set(
      currentMonthReport.id,
      currentMonthReport,
    );
    this.resourceUtilizationReports.set(prevMonthReport.id, prevMonthReport);
  }

  // Generate mock resource utilization data
  private generateMockResourceUtilizationData(
    count: number,
  ): ResourceUtilizationData[] {
    const roles = [
      "Senior Contractor",
      "Accessibility Specialist",
      "Project Manager",
      "Interior Designer",
      "Construction Worker",
      "Electrician",
      "Plumber",
    ];

    const projects = [
      { id: "proj1", name: "Al Noor Senior Home Renovation" },
      { id: "proj2", name: "Barakah Accessibility Upgrade" },
      { id: "proj3", name: "Al Amal Senior Care Facility" },
      { id: "proj4", name: "Rahma Community Center" },
    ];

    const result: ResourceUtilizationData[] = [];

    for (let i = 0; i < count; i++) {
      const utilizationPercentage = 50 + Math.random() * 45; // Between 50% and 95%
      const totalAvailableHours = 160 + Math.floor(Math.random() * 40); // Between 160 and 200 hours
      const assignedHours = Math.floor(
        totalAvailableHours * (utilizationPercentage / 100),
      );

      const utilizationByDay = [];
      const now = new Date();
      for (let j = 0; j < 30; j++) {
        const date = new Date(now);
        date.setDate(date.getDate() - j);
        utilizationByDay.push({
          date,
          percentage: Math.min(
            100,
            Math.max(0, utilizationPercentage + (Math.random() * 30 - 15)),
          ),
        });
      }

      const utilizationByProject = [];
      const projectCount = 1 + Math.floor(Math.random() * 3); // Assigned to 1-3 projects
      const selectedProjects = [...projects]
        .sort(() => 0.5 - Math.random())
        .slice(0, projectCount);

      let remainingHours = assignedHours;
      for (let j = 0; j < selectedProjects.length; j++) {
        const isLast = j === selectedProjects.length - 1;
        const projectHours = isLast
          ? remainingHours
          : Math.floor(remainingHours * (Math.random() * 0.6 + 0.2));
        remainingHours -= projectHours;

        utilizationByProject.push({
          projectId: selectedProjects[j].id,
          projectName: selectedProjects[j].name,
          hours: projectHours,
          percentage: (projectHours / assignedHours) * 100,
        });
      }

      result.push({
        resourceId: `res${i + 1}`,
        resourceName: `Resource ${i + 1}`,
        resourceRole: roles[i % roles.length],
        utilizationPercentage,
        assignedHours,
        totalAvailableHours,
        utilizationByDay,
        utilizationByProject,
      });
    }

    return result;
  }

  // Register a dashboard
  public registerDashboard(dashboard: KpiDashboard): void {
    this.dashboards.set(dashboard.id, dashboard);

    // Register all metrics in the dashboard
    dashboard.metrics.forEach((metric) => {
      this.metrics.set(metric.id, metric);
    });

    // Set up refresh interval if active
    if (dashboard.isActive && dashboard.refreshInterval > 0) {
      const intervalId = window.setInterval(
        () => this.refreshDashboard(dashboard.id),
        dashboard.refreshInterval * 1000,
      );
      this.refreshIntervals.set(dashboard.id, intervalId);
    }
  }

  // Register a metric
  public registerMetric(metric: KpiMetric): void {
    this.metrics.set(metric.id, metric);
  }

  // Register an alert
  public registerAlert(alert: KpiAlert): void {
    this.alerts.set(alert.id, alert);
  }

  // Get a dashboard by ID
  public getDashboard(dashboardId: string): KpiDashboard | undefined {
    return this.dashboards.get(dashboardId);
  }

  // Get a metric by ID
  public getMetric(metricId: string): KpiMetric | undefined {
    return this.metrics.get(metricId);
  }

  // Get an alert by ID
  public getAlert(alertId: string): KpiAlert | undefined {
    return this.alerts.get(alertId);
  }

  // Get all dashboards
  public getAllDashboards(): KpiDashboard[] {
    return Array.from(this.dashboards.values());
  }

  // Get all metrics
  public getAllMetrics(): KpiMetric[] {
    return Array.from(this.metrics.values());
  }

  // Get all alerts
  public getAllAlerts(): KpiAlert[] {
    return Array.from(this.alerts.values());
  }

  // Get metrics by category
  public getMetricsByCategory(category: KpiCategory): KpiMetric[] {
    return Array.from(this.metrics.values()).filter(
      (metric) => metric.category === category,
    );
  }

  // Sync data with mobile app
  public async syncWithMobileApp(): Promise<boolean> {
    try {
      // In a real implementation, this would sync data with a mobile app
      console.log("Syncing data with mobile app...");

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Update local storage for offline access
      this.persistDataToLocalStorage();

      return true;
    } catch (error) {
      console.error("Error syncing with mobile app:", error);
      return false;
    }
  }

  // Persist data to local storage for offline access
  public persistDataToLocalStorage(): void {
    try {
      // Save metrics
      const metricsData = Array.from(this.metrics.values());
      localStorage.setItem("kpi_metrics", JSON.stringify(metricsData));

      // Save dashboards
      const dashboardsData = Array.from(this.dashboards.values());
      localStorage.setItem("kpi_dashboards", JSON.stringify(dashboardsData));

      // Save resource utilization reports
      const reportsData = Array.from(this.resourceUtilizationReports.values());
      localStorage.setItem("kpi_resource_reports", JSON.stringify(reportsData));

      // Save timestamp
      localStorage.setItem("kpi_last_sync", new Date().toISOString());

      console.log("KPI data persisted to local storage");
    } catch (error) {
      console.error("Error persisting data to local storage:", error);
    }
  }

  // Load data from local storage
  public loadDataFromLocalStorage(): boolean {
    try {
      // Load metrics
      const metricsData = localStorage.getItem("kpi_metrics");
      if (metricsData) {
        const metrics = JSON.parse(metricsData) as KpiMetric[];
        this.metrics.clear();
        metrics.forEach((metric) => this.metrics.set(metric.id, metric));
      }

      // Load dashboards
      const dashboardsData = localStorage.getItem("kpi_dashboards");
      if (dashboardsData) {
        const dashboards = JSON.parse(dashboardsData) as KpiDashboard[];
        this.dashboards.clear();
        dashboards.forEach((dashboard) =>
          this.dashboards.set(dashboard.id, dashboard),
        );
      }

      // Load resource utilization reports
      const reportsData = localStorage.getItem("kpi_resource_reports");
      if (reportsData) {
        const reports = JSON.parse(reportsData) as ResourceUtilizationReport[];
        this.resourceUtilizationReports.clear();
        reports.forEach((report) =>
          this.resourceUtilizationReports.set(report.id, report),
        );
      }

      console.log("KPI data loaded from local storage");
      return true;
    } catch (error) {
      console.error("Error loading data from local storage:", error);
      return false;
    }
  }

  // Get resource utilization reports
  public getResourceUtilizationReports(): ResourceUtilizationReport[] {
    return Array.from(this.resourceUtilizationReports.values());
  }

  // Get a specific resource utilization report
  public getResourceUtilizationReport(
    reportId: string,
  ): ResourceUtilizationReport | undefined {
    return this.resourceUtilizationReports.get(reportId);
  }

  // Generate a new resource utilization report
  public generateResourceUtilizationReport(
    dateRange: { from: Date; to: Date },
    name?: string,
  ): ResourceUtilizationReport {
    const reportId = `report_${Date.now()}`;
    const reportName =
      name ||
      `Resource Utilization Report (${dateRange.from.toLocaleDateString()} - ${dateRange.to.toLocaleDateString()})`;

    const resourceCount = 8 + Math.floor(Math.random() * 8); // Between 8 and 15 resources
    const overallUtilization = 65 + Math.random() * 25; // Between 65% and 90%

    const report: ResourceUtilizationReport = {
      id: reportId,
      name: reportName,
      dateRange,
      overallUtilization,
      resourcesCount: resourceCount,
      resourcesData: this.generateMockResourceUtilizationData(resourceCount),
      departmentUtilization: [
        {
          department: "Construction",
          utilizationPercentage: overallUtilization + (Math.random() * 10 - 5),
          resourcesCount: Math.floor(resourceCount * 0.4),
        },
        {
          department: "Design",
          utilizationPercentage: overallUtilization + (Math.random() * 10 - 5),
          resourcesCount: Math.floor(resourceCount * 0.25),
        },
        {
          department: "Assessment",
          utilizationPercentage: overallUtilization + (Math.random() * 10 - 5),
          resourcesCount: Math.floor(resourceCount * 0.2),
        },
        {
          department: "Management",
          utilizationPercentage: overallUtilization + (Math.random() * 10 - 5),
          resourcesCount: Math.floor(resourceCount * 0.15),
        },
      ],
      createdAt: new Date(),
    };

    this.resourceUtilizationReports.set(reportId, report);
    return report;
  }

  // Get active alerts
  public getActiveAlerts(): KpiAlert[] {
    return Array.from(this.alerts.values()).filter(
      (alert) => alert.isActive && alert.triggeredAt && !alert.resolvedAt,
    );
  }

  // Add a data point to a metric
  public addDataPoint(metricId: string, dataPoint: KpiDataPoint): boolean {
    const metric = this.metrics.get(metricId);
    if (!metric) {
      return false;
    }

    metric.dataPoints.push(dataPoint);
    this.updateMetricTrend(metric);
    this.checkAlerts(metric);

    return true;
  }

  // Update a dashboard
  public updateDashboard(dashboard: KpiDashboard): boolean {
    const existingDashboard = this.dashboards.get(dashboard.id);
    if (!existingDashboard) {
      return false;
    }

    // Update dashboard properties
    this.dashboards.set(dashboard.id, {
      ...dashboard,
      updatedAt: new Date(),
    });

    // Update refresh interval if needed
    if (
      existingDashboard.refreshInterval !== dashboard.refreshInterval ||
      existingDashboard.isActive !== dashboard.isActive
    ) {
      // Clear existing interval
      const existingIntervalId = this.refreshIntervals.get(dashboard.id);
      if (existingIntervalId) {
        clearInterval(existingIntervalId);
        this.refreshIntervals.delete(dashboard.id);
      }

      // Set up new interval if active
      if (dashboard.isActive && dashboard.refreshInterval > 0) {
        const intervalId = window.setInterval(
          () => this.refreshDashboard(dashboard.id),
          dashboard.refreshInterval * 1000,
        );
        this.refreshIntervals.set(dashboard.id, intervalId);
      }
    }

    return true;
  }

  // Delete a dashboard
  public deleteDashboard(dashboardId: string): boolean {
    const dashboard = this.dashboards.get(dashboardId);
    if (!dashboard) {
      return false;
    }

    // Clear refresh interval
    const intervalId = this.refreshIntervals.get(dashboardId);
    if (intervalId) {
      clearInterval(intervalId);
      this.refreshIntervals.delete(dashboardId);
    }

    // Remove dashboard
    this.dashboards.delete(dashboardId);

    return true;
  }

  // Refresh a dashboard
  private async refreshDashboard(dashboardId: string): Promise<void> {
    const dashboard = this.dashboards.get(dashboardId);
    if (!dashboard) {
      return;
    }

    try {
      // In a real implementation, this would fetch updated data from an API
      console.log(`Refreshing dashboard: ${dashboard.name}`);

      // Update each metric in the dashboard
      for (const metric of dashboard.metrics) {
        await this.refreshMetric(metric.id);
      }

      // Update dashboard timestamp
      dashboard.updatedAt = new Date();
    } catch (error) {
      console.error(
        `Error refreshing dashboard ${dashboardId}:`,
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  // Refresh a metric
  private async refreshMetric(metricId: string): Promise<void> {
    const metric = this.metrics.get(metricId);
    if (!metric) {
      return;
    }

    try {
      // In a real implementation, this would fetch updated data from an API
      console.log(`Refreshing metric: ${metric.name}`);

      // Simulate adding a new data point
      const lastValue =
        metric.dataPoints.length > 0
          ? metric.dataPoints[metric.dataPoints.length - 1].value
          : 0;
      const randomChange = Math.random() * 10 - 5; // Random value between -5 and 5
      const newValue = Math.max(0, lastValue + randomChange);

      const newDataPoint: KpiDataPoint = {
        timestamp: new Date(),
        value: newValue,
      };

      metric.dataPoints.push(newDataPoint);
      this.updateMetricTrend(metric);
      this.checkAlerts(metric);
    } catch (error) {
      console.error(
        `Error refreshing metric ${metricId}:`,
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  // Update metric trend based on recent data points
  private updateMetricTrend(metric: KpiMetric): void {
    const dataPoints = metric.dataPoints;
    if (dataPoints.length < 2) {
      metric.trend = "neutral";
      return;
    }

    // Get the last few data points for trend analysis
    const recentPoints = dataPoints.slice(-5);
    const firstValue = recentPoints[0].value;
    const lastValue = recentPoints[recentPoints.length - 1].value;

    if (lastValue > firstValue) {
      metric.trend = "up";
    } else if (lastValue < firstValue) {
      metric.trend = "down";
    } else {
      metric.trend = "neutral";
    }
  }

  // Check alerts for a metric
  private checkAlerts(metric: KpiMetric): void {
    if (metric.dataPoints.length === 0) {
      return;
    }

    const latestValue = metric.dataPoints[metric.dataPoints.length - 1].value;

    // Check all alerts for this metric
    Array.from(this.alerts.values())
      .filter((alert) => alert.metricId === metric.id && alert.isActive)
      .forEach((alert) => {
        let isTriggered = false;

        switch (alert.condition) {
          case "above":
            isTriggered = latestValue > alert.threshold;
            break;
          case "below":
            isTriggered = latestValue < alert.threshold;
            break;
          case "equal":
            isTriggered = latestValue === alert.threshold;
            break;
        }

        if (isTriggered && !alert.triggeredAt) {
          // Alert is triggered
          alert.triggeredAt = new Date();
          alert.resolvedAt = undefined;
          this.triggerAlert(alert);
        } else if (!isTriggered && alert.triggeredAt && !alert.resolvedAt) {
          // Alert is resolved
          alert.resolvedAt = new Date();
          this.resolveAlert(alert);
        }
      });
  }

  // Trigger an alert
  private triggerAlert(alert: KpiAlert): void {
    console.log(`Alert triggered: ${alert.message}`);

    // In a real implementation, this would send notifications through configured channels
    alert.notificationChannels.forEach((channel) => {
      console.log(`Sending ${alert.severity} alert to channel: ${channel}`);
    });
  }

  // Resolve an alert
  private resolveAlert(alert: KpiAlert): void {
    console.log(`Alert resolved: ${alert.message}`);

    // In a real implementation, this would send resolution notifications
    alert.notificationChannels.forEach((channel) => {
      console.log(`Sending resolution notification to channel: ${channel}`);
    });
  }

  // Clean up resources
  public dispose(): void {
    // Clear all refresh intervals
    this.refreshIntervals.forEach((intervalId) => {
      clearInterval(intervalId);
    });
    this.refreshIntervals.clear();
  }
}

// Export default instance
export default KpiDashboardService.getInstance();
