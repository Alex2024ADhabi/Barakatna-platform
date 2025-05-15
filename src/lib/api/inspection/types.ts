// Basic types for inspection management
export interface Inspection {
  id: number;
  projectId: number;
  roomId?: number;
  inspectionType: string;
  scheduledDate: string;
  completedDate?: string;
  inspectorId: number;
  inspectorName?: string;
  status: string;
  notes?: string;
}

export interface InspectionItem {
  id: number;
  inspectionId: number;
  description: string;
  status: "pass" | "fail" | "na";
  notes?: string;
  photoUrl?: string;
}

export interface QualityCheck {
  id: number;
  projectId: number;
  roomId: number;
  checkDate: string;
  inspectorId: number;
  inspectorName?: string;
  overallRating: number;
  status: string;
  notes?: string;
}

export interface Defect {
  id: number;
  qualityCheckId: number;
  category: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  status: "open" | "in-progress" | "resolved";
  assignedTo?: number;
  assigneeName?: string;
  reportedDate: string;
  resolvedDate?: string;
  photoUrl?: string;
}
