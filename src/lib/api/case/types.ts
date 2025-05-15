import { User } from "../user/types";
import { Beneficiary } from "../beneficiary/types";

export type CaseStatus =
  | "pending"
  | "in-progress"
  | "completed"
  | "on-hold"
  | "cancelled";
export type CasePriority = "low" | "medium" | "high" | "urgent";
export type CaseType = "fdf" | "adha" | "cash" | "other";

export interface Case {
  id: string;
  caseNumber: string;
  beneficiaryId: string;
  beneficiaryName: string;
  status: CaseStatus;
  priority: CasePriority;
  type: CaseType;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  assignedTo?: string;
  address: string;
  contactPhone?: string;
  contactEmail?: string;
  estimatedCompletionDate?: string;
  actualCompletionDate?: string;
  tags?: string[];
  totalBudget?: number;
  spentBudget?: number;
  remainingBudget?: number;
}

export interface CaseAssignment {
  id: string;
  caseId: string;
  userId: string;
  assignedBy: string;
  assignedAt: string;
  role: string;
  notes?: string;
  status: "active" | "completed" | "reassigned";
}

export interface CaseDocument {
  id: string;
  caseId: string;
  name: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  uploadedBy: string;
  uploadedAt: string;
  description?: string;
  tags?: string[];
  category: "assessment" | "contract" | "invoice" | "report" | "other";
}

export interface CaseCommunication {
  id: string;
  caseId: string;
  type: "email" | "phone" | "meeting" | "visit" | "other";
  direction: "incoming" | "outgoing";
  contactPerson: string;
  timestamp: string;
  subject?: string;
  content: string;
  recordedBy: string;
  attachments?: CaseDocument[];
}

export interface CaseNote {
  id: string;
  caseId: string;
  content: string;
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
  isPrivate: boolean;
  category?: "general" | "assessment" | "follow-up" | "important";
}

export interface CaseHistory {
  id: string;
  caseId: string;
  action: string;
  description: string;
  performedBy: string;
  timestamp: string;
  previousValues?: Record<string, any>;
  newValues?: Record<string, any>;
}

export interface CaseFilter {
  status?: CaseStatus[];
  priority?: CasePriority[];
  type?: CaseType[];
  assignedTo?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  searchTerm?: string;
  tags?: string[];
}

export interface CaseSummary {
  totalCases: number;
  byCaseType: Record<CaseType, number>;
  byStatus: Record<CaseStatus, number>;
  byPriority: Record<CasePriority, number>;
  recentlyUpdated: Case[];
  upcomingDeadlines: Case[];
}

export interface CaseStatistics {
  averageResolutionTime: number; // in days
  casesByMonth: Array<{ month: string; count: number }>;
  casesByType: Array<{ type: CaseType; count: number }>;
  casesByStatus: Array<{ status: CaseStatus; count: number }>;
  casesByPriority: Array<{ priority: CasePriority; count: number }>;
}
