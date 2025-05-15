// Manpower resource data models

export interface ManpowerResource {
  id: string;
  name: string;
  role: string;
  department: string;
  skills: Skill[];
  availability: Availability[];
  utilization: number; // Percentage of time utilized
  isContractor: boolean;
  contractorDetails?: ContractorDetails;
  hourlyRate: number;
  timesheets: Timesheet[];
}

export interface Skill {
  id: string;
  name: string;
  proficiencyLevel: "beginner" | "intermediate" | "advanced" | "expert";
  certifications?: string[];
  lastUsed?: Date;
}

export interface Availability {
  id: string;
  resourceId: string;
  startDate: Date;
  endDate: Date;
  availabilityType: "available" | "vacation" | "sick" | "training" | "project";
  projectId?: string;
  notes?: string;
}

export interface ContractorDetails {
  companyName: string;
  contractStartDate: Date;
  contractEndDate: Date;
  contractNumber: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
}

export interface Timesheet {
  id: string;
  resourceId: string;
  date: Date;
  projectId: string;
  hours: number;
  description: string;
  status: "draft" | "submitted" | "approved" | "rejected";
  submittedDate?: Date;
  approvedBy?: string;
  approvedDate?: Date;
}

export interface ResourceAllocation {
  id: string;
  resourceId: string;
  projectId: string;
  role: string;
  startDate: Date;
  endDate: Date;
  hoursPerDay: number;
  allocationPercentage: number;
  status: "planned" | "active" | "completed";
}

export interface ResourceForecast {
  id: string;
  departmentId: string;
  period: string; // e.g., "2023-Q1"
  requiredResources: number;
  availableResources: number;
  gap: number;
  plannedHiring: number;
  notes?: string;
}

export interface SkillMatrix {
  departmentId: string;
  skills: {
    skillId: string;
    skillName: string;
    resourceCounts: {
      beginner: number;
      intermediate: number;
      advanced: number;
      expert: number;
    };
  }[];
}

export interface ResourceUtilizationReport {
  period: string; // e.g., "2023-Q1"
  departmentId?: string;
  resources: {
    resourceId: string;
    resourceName: string;
    billableHours: number;
    nonBillableHours: number;
    utilization: number; // Percentage
  }[];
  averageUtilization: number;
}
