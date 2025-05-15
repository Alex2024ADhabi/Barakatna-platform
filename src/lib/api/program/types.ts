import { Project } from "../project/types";
import { User } from "../user/types";

export type ProgramStatus =
  | "planning"
  | "active"
  | "on-hold"
  | "completed"
  | "cancelled";
export type ProgramPriority = "low" | "medium" | "high" | "critical";

export interface Program {
  id: string;
  programNumber: string;
  name: string;
  description: string;
  status: ProgramStatus;
  priority: ProgramPriority;
  startDate: string;
  endDate: string;
  budget: number;
  spentBudget: number;
  remainingBudget: number;
  managerId: string;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  objectives?: string[];
  stakeholders?: ProgramStakeholder[];
  projects?: string[]; // Project IDs linked to this program
  outcomes?: ProgramOutcome[];
  risks?: ProgramRisk[];
  budgetAllocations?: ProgramBudgetAllocation[];
  documents?: ProgramDocument[];
  timeline?: ProgramTimelineEvent[];
  kpis?: ProgramKPI[];
}

export interface ProgramStakeholder {
  id: string;
  programId: string;
  userId: string;
  role: string;
  responsibilities: string;
  engagementLevel: "low" | "medium" | "high";
  contactFrequency: "weekly" | "monthly" | "quarterly" | "as-needed";
  notes?: string;
}

export interface ProgramOutcome {
  id: string;
  programId: string;
  name: string;
  description: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  dueDate: string;
  status: "not-started" | "in-progress" | "achieved" | "at-risk" | "missed";
  notes?: string;
}

export interface ProgramRisk {
  id: string;
  programId: string;
  name: string;
  description: string;
  category: string;
  probability: "low" | "medium" | "high";
  impact: "low" | "medium" | "high";
  severity: "low" | "medium" | "high" | "critical";
  mitigationPlan?: string;
  contingencyPlan?: string;
  owner: string;
  status: "identified" | "analyzing" | "mitigating" | "monitoring" | "closed";
  createdAt: string;
  updatedAt: string;
}

export interface ProgramBudgetAllocation {
  id: string;
  programId: string;
  projectId?: string;
  category: string;
  amount: number;
  description: string;
  status: "planned" | "allocated" | "spent" | "adjusted";
  createdAt: string;
  updatedAt: string;
}

export interface ProgramReport {
  id: string;
  programId: string;
  title: string;
  description: string;
  generatedBy: string;
  generatedAt: string;
  reportType:
    | "status"
    | "financial"
    | "outcome"
    | "risk"
    | "stakeholder"
    | "comprehensive";
  fileUrl?: string;
  recipients?: string[];
  scheduledFrequency?: "weekly" | "monthly" | "quarterly" | "custom";
  data?: any; // Report data in JSON format
  charts?: ProgramReportChart[];
  tables?: ProgramReportTable[];
  lastSent?: string;
  nextScheduled?: string;
}

export interface ProgramReportChart {
  id: string;
  reportId: string;
  title: string;
  type: "bar" | "line" | "pie" | "radar" | "scatter";
  data: any; // Chart data in JSON format
  options?: any; // Chart options in JSON format
}

export interface ProgramReportTable {
  id: string;
  reportId: string;
  title: string;
  headers: string[];
  rows: any[][]; // Table data
}

export interface ProgramDocument {
  id: string;
  programId: string;
  name: string;
  description?: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  uploadedBy: string;
  uploadedAt: string;
  category: string;
  tags?: string[];
  version?: string;
}

export interface ProgramTimelineEvent {
  id: string;
  programId: string;
  title: string;
  description?: string;
  date: string;
  type: "milestone" | "deliverable" | "meeting" | "decision" | "other";
  status: "pending" | "completed" | "delayed" | "at-risk";
  assignedTo?: string;
  relatedProjectId?: string;
}

export interface ProgramKPI {
  id: string;
  programId: string;
  name: string;
  description?: string;
  category: string;
  target: number;
  actual: number;
  unit: string;
  frequency: "daily" | "weekly" | "monthly" | "quarterly" | "yearly";
  trend: "increasing" | "decreasing" | "stable";
  status: "on-track" | "at-risk" | "off-track";
  lastUpdated: string;
}

export interface ProgramFilter {
  status?: ProgramStatus[];
  priority?: ProgramPriority[];
  managerId?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  searchTerm?: string;
  tags?: string[];
  projectId?: string; // Filter programs by linked project
}

export interface ProgramSummary {
  totalPrograms: number;
  byStatus: Record<ProgramStatus, number>;
  byPriority: Record<ProgramPriority, number>;
  recentlyUpdated: Program[];
  upcomingDeadlines: Program[];
  budgetUtilization: number; // percentage
  outcomeAchievement: number; // percentage
}

export interface ProgramStatistics {
  programsByMonth: Array<{ month: string; count: number }>;
  programsByStatus: Array<{ status: ProgramStatus; count: number }>;
  programsByPriority: Array<{ priority: ProgramPriority; count: number }>;
  budgetAllocationByCategory: Array<{ category: string; amount: number }>;
  outcomeAchievementRate: Array<{ program: string; rate: number }>;
  riskDistribution: Array<{ severity: string; count: number }>;
  stakeholderEngagement?: Array<{
    role: string;
    count: number;
    engagementLevel: string;
  }>;
  timelineProgress?: Array<{
    program: string;
    progress: number;
    daysRemaining: number;
  }>;
  kpiAchievement?: Array<{
    kpi: string;
    target: number;
    actual: number;
    percentage: number;
  }>;
}
