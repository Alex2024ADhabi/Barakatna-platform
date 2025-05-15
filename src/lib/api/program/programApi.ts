import { v4 as uuidv4 } from "uuid";
import {
  Program,
  ProgramStakeholder,
  ProgramOutcome,
  ProgramRisk,
  ProgramBudgetAllocation,
  ProgramReport,
  ProgramFilter,
  ProgramSummary,
  ProgramStatistics,
} from "./types";
import eventBus, { EventType } from "@/services/eventBus";

// Mock data for programs
const mockPrograms: Program[] = [
  {
    id: "1",
    programNumber: "PRG-2023-001",
    name: "Senior Home Accessibility Enhancement",
    description:
      "Comprehensive program to improve home accessibility for seniors across multiple regions",
    status: "active",
    priority: "high",
    startDate: "2023-01-15",
    endDate: "2023-12-31",
    budget: 1500000,
    spentBudget: 750000,
    remainingBudget: 750000,
    managerId: "user123",
    createdAt: "2023-01-10",
    updatedAt: "2023-06-15",
    tags: ["accessibility", "seniors", "home-modification"],
    objectives: [
      "Improve accessibility in 500 homes",
      "Reduce fall incidents by 30%",
      "Increase independent living capability by 40%",
    ],
    projects: ["proj-001", "proj-002", "proj-003"],
  },
  {
    id: "2",
    programNumber: "PRG-2023-002",
    name: "Community Support Network",
    description:
      "Program to establish support networks for elderly in rural communities",
    status: "planning",
    priority: "medium",
    startDate: "2023-07-01",
    endDate: "2024-06-30",
    budget: 800000,
    spentBudget: 50000,
    remainingBudget: 750000,
    managerId: "user456",
    createdAt: "2023-05-20",
    updatedAt: "2023-06-10",
    tags: ["community", "rural", "support-network"],
    objectives: [
      "Establish 20 community support hubs",
      "Train 100 community volunteers",
      "Connect 1000 seniors to support services",
    ],
    projects: ["proj-004", "proj-005"],
  },
  {
    id: "3",
    programNumber: "PRG-2023-003",
    name: "Healthcare Facility Upgrades",
    description:
      "Program to modernize healthcare facilities serving senior populations",
    status: "on-hold",
    priority: "high",
    startDate: "2023-03-01",
    endDate: "2023-12-31",
    budget: 2500000,
    spentBudget: 1000000,
    remainingBudget: 1500000,
    managerId: "user789",
    createdAt: "2023-02-15",
    updatedAt: "2023-05-30",
    tags: ["healthcare", "facility", "modernization"],
    objectives: [
      "Upgrade 5 healthcare facilities",
      "Improve patient capacity by 25%",
      "Reduce average wait times by 40%",
    ],
    projects: ["proj-006", "proj-007", "proj-008"],
  },
  {
    id: "4",
    programNumber: "PRG-2022-001",
    name: "Senior Digital Literacy",
    description: "Program to improve digital literacy among senior citizens",
    status: "completed",
    priority: "medium",
    startDate: "2022-06-01",
    endDate: "2023-05-31",
    budget: 500000,
    spentBudget: 480000,
    remainingBudget: 20000,
    managerId: "user123",
    createdAt: "2022-05-15",
    updatedAt: "2023-06-05",
    tags: ["digital", "education", "technology"],
    objectives: [
      "Train 2000 seniors in basic digital skills",
      "Establish 10 technology learning centers",
      "Distribute 500 tablets to seniors",
    ],
    projects: ["proj-009", "proj-010"],
  },
  {
    id: "5",
    programNumber: "PRG-2023-004",
    name: "Senior Nutrition Initiative",
    description: "Program to improve nutrition and food security for seniors",
    status: "active",
    priority: "critical",
    startDate: "2023-04-01",
    endDate: "2024-03-31",
    budget: 1200000,
    spentBudget: 400000,
    remainingBudget: 800000,
    managerId: "user456",
    createdAt: "2023-03-10",
    updatedAt: "2023-06-20",
    tags: ["nutrition", "food-security", "health"],
    objectives: [
      "Provide meals to 5000 seniors",
      "Establish 15 community kitchens",
      "Reduce malnutrition rates by 30%",
    ],
    projects: ["proj-011", "proj-012", "proj-013"],
  },
];

// API functions for program management
export const programApi = {
  // Get all programs with optional filtering
  getPrograms: async (filter?: ProgramFilter): Promise<Program[]> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    let filteredPrograms = [...mockPrograms];

    if (filter) {
      if (filter.status && filter.status.length > 0) {
        filteredPrograms = filteredPrograms.filter((p) =>
          filter.status?.includes(p.status),
        );
      }

      if (filter.priority && filter.priority.length > 0) {
        filteredPrograms = filteredPrograms.filter((p) =>
          filter.priority?.includes(p.priority),
        );
      }

      if (filter.managerId && filter.managerId.length > 0) {
        filteredPrograms = filteredPrograms.filter((p) =>
          filter.managerId?.includes(p.managerId),
        );
      }

      if (filter.dateRange) {
        filteredPrograms = filteredPrograms.filter((p) => {
          const startDate = new Date(p.startDate);
          const filterStartDate = new Date(filter.dateRange!.start);
          const filterEndDate = new Date(filter.dateRange!.end);
          return startDate >= filterStartDate && startDate <= filterEndDate;
        });
      }

      if (filter.searchTerm) {
        const term = filter.searchTerm.toLowerCase();
        filteredPrograms = filteredPrograms.filter(
          (p) =>
            p.name.toLowerCase().includes(term) ||
            p.description.toLowerCase().includes(term) ||
            p.programNumber.toLowerCase().includes(term),
        );
      }

      if (filter.tags && filter.tags.length > 0) {
        filteredPrograms = filteredPrograms.filter(
          (p) => p.tags && filter.tags?.some((tag) => p.tags?.includes(tag)),
        );
      }
    }

    return filteredPrograms;
  },

  // Get a single program by ID
  getProgramById: async (id: string): Promise<Program | null> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const foundProgram = mockPrograms.find((p) => p.id === id);
    return foundProgram || null;
  },

  // Create a new program
  createProgram: async (
    programData: Omit<
      Program,
      "id" | "programNumber" | "createdAt" | "updatedAt"
    >,
  ): Promise<Program> => {
    await new Promise((resolve) => setTimeout(resolve, 700));

    const newProgram: Program = {
      id: uuidv4(),
      programNumber: `PRG-${new Date().getFullYear()}-${String(mockPrograms.length + 1).padStart(3, "0")}`,
      ...programData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockPrograms.push(newProgram);

    // Publish program created event
    eventBus.publish({
      id: `program_created_${Date.now()}`,
      type: EventType.PROGRAM_CREATED,
      timestamp: new Date().toISOString(),
      source: "programApi",
      payload: newProgram,
    });

    return newProgram;
  },

  // Update an existing program
  updateProgram: async (
    id: string,
    programData: Partial<Program>,
  ): Promise<Program | null> => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const index = mockPrograms.findIndex((p) => p.id === id);
    if (index === -1) return null;

    const originalProgram = { ...mockPrograms[index] };
    const updatedProgram = {
      ...originalProgram,
      ...programData,
      updatedAt: new Date().toISOString(),
    };

    mockPrograms[index] = updatedProgram;

    // Publish program updated event
    eventBus.publish({
      id: `program_updated_${Date.now()}`,
      type: EventType.PROGRAM_UPDATED,
      timestamp: new Date().toISOString(),
      source: "programApi",
      payload: updatedProgram,
    });

    // Check if program status changed to completed
    if (
      originalProgram.status !== "completed" &&
      updatedProgram.status === "completed"
    ) {
      // Publish program completed event
      eventBus.publish({
        id: `program_completed_${Date.now()}`,
        type: EventType.PROGRAM_COMPLETED,
        timestamp: new Date().toISOString(),
        source: "programApi",
        payload: {
          programId: updatedProgram.id,
          programName: updatedProgram.name,
          completionDate: new Date().toISOString(),
          budget: updatedProgram.budget,
          spentBudget: updatedProgram.spentBudget,
          remainingBudget: updatedProgram.remainingBudget,
          projects: updatedProgram.projects,
        },
      });
    }

    return updatedProgram;
  },

  // Delete a program
  deleteProgram: async (id: string): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 400));

    const index = mockPrograms.findIndex((p) => p.id === id);
    if (index === -1) return false;

    mockPrograms.splice(index, 1);
    return true;
  },

  // Link a project to a program
  linkProjectToProgram: async (
    programId: string,
    projectId: string,
  ): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const program = mockPrograms.find((p) => p.id === programId);
    if (!program) return false;

    if (!program.projects) {
      program.projects = [];
    }

    if (!program.projects.includes(projectId)) {
      program.projects.push(projectId);
      program.updatedAt = new Date().toISOString();
    }

    return true;
  },

  // Unlink a project from a program
  unlinkProjectFromProgram: async (
    programId: string,
    projectId: string,
  ): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 300));

    const program = mockPrograms.find((p) => p.id === programId);
    if (!program || !program.projects) return false;

    const index = program.projects.indexOf(projectId);
    if (index !== -1) {
      program.projects.splice(index, 1);
      program.updatedAt = new Date().toISOString();
      return true;
    }

    return false;
  },

  // Batch link projects to a program
  batchLinkProjectsToProgram: async (
    programId: string,
    projectIds: string[],
  ): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const program = mockPrograms.find((p) => p.id === programId);
    if (!program) return false;

    if (!program.projects) {
      program.projects = [];
    }

    let changed = false;
    for (const projectId of projectIds) {
      if (!program.projects.includes(projectId)) {
        program.projects.push(projectId);
        changed = true;
      }
    }

    if (changed) {
      program.updatedAt = new Date().toISOString();
    }

    return true;
  },

  // Add outcome to a program
  addProgramOutcome: async (
    programId: string,
    outcome: Omit<ProgramOutcome, "id" | "programId">,
  ): Promise<ProgramOutcome | null> => {
    await new Promise((resolve) => setTimeout(resolve, 400));

    const program = mockPrograms.find((p) => p.id === programId);
    if (!program) return null;

    const newOutcome: ProgramOutcome = {
      id: uuidv4(),
      programId,
      ...outcome,
    };

    // In a real implementation, this would be stored in a separate collection
    return newOutcome;
  },

  // Update outcome
  updateProgramOutcome: async (
    outcomeId: string,
    outcomeData: Partial<ProgramOutcome>,
  ): Promise<ProgramOutcome | null> => {
    await new Promise((resolve) => setTimeout(resolve, 400));

    // In a real implementation, this would update the outcome in a database
    return {
      id: outcomeId,
      programId: outcomeData.programId || "",
      name: outcomeData.name || "",
      description: outcomeData.description || "",
      targetValue: outcomeData.targetValue || 0,
      currentValue: outcomeData.currentValue || 0,
      unit: outcomeData.unit || "",
      dueDate: outcomeData.dueDate || new Date().toISOString(),
      status: outcomeData.status || "not-started",
      notes: outcomeData.notes,
    };
  },

  // Add risk to a program
  addProgramRisk: async (
    programId: string,
    risk: Omit<ProgramRisk, "id" | "programId" | "createdAt" | "updatedAt">,
  ): Promise<ProgramRisk | null> => {
    await new Promise((resolve) => setTimeout(resolve, 400));

    const program = mockPrograms.find((p) => p.id === programId);
    if (!program) return null;

    const newRisk: ProgramRisk = {
      id: uuidv4(),
      programId,
      ...risk,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // In a real implementation, this would be stored in a separate collection
    return newRisk;
  },

  // Add stakeholder to a program
  addProgramStakeholder: async (
    programId: string,
    stakeholder: Omit<ProgramStakeholder, "id" | "programId">,
  ): Promise<ProgramStakeholder | null> => {
    await new Promise((resolve) => setTimeout(resolve, 400));

    const program = mockPrograms.find((p) => p.id === programId);
    if (!program) return null;

    const newStakeholder: ProgramStakeholder = {
      id: uuidv4(),
      programId,
      ...stakeholder,
    };

    // In a real implementation, this would be stored in a separate collection
    return newStakeholder;
  },

  // Add budget allocation to a program
  addProgramBudgetAllocation: async (
    programId: string,
    allocation: Omit<
      ProgramBudgetAllocation,
      "id" | "programId" | "createdAt" | "updatedAt"
    >,
  ): Promise<ProgramBudgetAllocation | null> => {
    await new Promise((resolve) => setTimeout(resolve, 400));

    const program = mockPrograms.find((p) => p.id === programId);
    if (!program) return null;

    const newAllocation: ProgramBudgetAllocation = {
      id: uuidv4(),
      programId,
      ...allocation,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // In a real implementation, this would be stored in a separate collection
    return newAllocation;
  },

  // Get program summary statistics
  getProgramSummary: async (): Promise<ProgramSummary> => {
    await new Promise((resolve) => setTimeout(resolve, 600));

    const totalBudget = mockPrograms.reduce((sum, p) => sum + p.budget, 0);
    const totalSpent = mockPrograms.reduce((sum, p) => sum + p.spentBudget, 0);
    const budgetUtilization =
      totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

    // Mock outcome achievement rate (would be calculated from actual outcomes in a real system)
    const outcomeAchievement = 65; // 65% achievement rate

    const summary: ProgramSummary = {
      totalPrograms: mockPrograms.length,
      byStatus: {
        planning: mockPrograms.filter((p) => p.status === "planning").length,
        active: mockPrograms.filter((p) => p.status === "active").length,
        "on-hold": mockPrograms.filter((p) => p.status === "on-hold").length,
        completed: mockPrograms.filter((p) => p.status === "completed").length,
        cancelled: mockPrograms.filter((p) => p.status === "cancelled").length,
      },
      byPriority: {
        low: mockPrograms.filter((p) => p.priority === "low").length,
        medium: mockPrograms.filter((p) => p.priority === "medium").length,
        high: mockPrograms.filter((p) => p.priority === "high").length,
        critical: mockPrograms.filter((p) => p.priority === "critical").length,
      },
      recentlyUpdated: [...mockPrograms]
        .sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
        )
        .slice(0, 5),
      upcomingDeadlines: mockPrograms
        .filter((p) => p.status !== "completed" && p.status !== "cancelled")
        .sort(
          (a, b) =>
            new Date(a.endDate).getTime() - new Date(b.endDate).getTime(),
        )
        .slice(0, 5),
      budgetUtilization,
      outcomeAchievement,
    };

    return summary;
  },

  // Get detailed program statistics
  getProgramStatistics: async (): Promise<ProgramStatistics> => {
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Mock data for statistics
    const statistics: ProgramStatistics = {
      programsByMonth: [
        { month: "Jan", count: 2 },
        { month: "Feb", count: 1 },
        { month: "Mar", count: 3 },
        { month: "Apr", count: 2 },
        { month: "May", count: 0 },
        { month: "Jun", count: 1 },
        { month: "Jul", count: 0 },
        { month: "Aug", count: 0 },
        { month: "Sep", count: 0 },
        { month: "Oct", count: 0 },
        { month: "Nov", count: 0 },
        { month: "Dec", count: 0 },
      ],
      programsByStatus: [
        {
          status: "planning",
          count: mockPrograms.filter((p) => p.status === "planning").length,
        },
        {
          status: "active",
          count: mockPrograms.filter((p) => p.status === "active").length,
        },
        {
          status: "on-hold",
          count: mockPrograms.filter((p) => p.status === "on-hold").length,
        },
        {
          status: "completed",
          count: mockPrograms.filter((p) => p.status === "completed").length,
        },
        {
          status: "cancelled",
          count: mockPrograms.filter((p) => p.status === "cancelled").length,
        },
      ],
      programsByPriority: [
        {
          priority: "low",
          count: mockPrograms.filter((p) => p.priority === "low").length,
        },
        {
          priority: "medium",
          count: mockPrograms.filter((p) => p.priority === "medium").length,
        },
        {
          priority: "high",
          count: mockPrograms.filter((p) => p.priority === "high").length,
        },
        {
          priority: "critical",
          count: mockPrograms.filter((p) => p.priority === "critical").length,
        },
      ],
      budgetAllocationByCategory: [
        { category: "Infrastructure", amount: 1500000 },
        { category: "Training", amount: 500000 },
        { category: "Equipment", amount: 800000 },
        { category: "Personnel", amount: 1200000 },
        { category: "Operations", amount: 600000 },
      ],
      outcomeAchievementRate: [
        { program: "Senior Home Accessibility Enhancement", rate: 70 },
        { program: "Community Support Network", rate: 30 },
        { program: "Healthcare Facility Upgrades", rate: 40 },
        { program: "Senior Digital Literacy", rate: 95 },
        { program: "Senior Nutrition Initiative", rate: 60 },
      ],
      riskDistribution: [
        { severity: "low", count: 12 },
        { severity: "medium", count: 8 },
        { severity: "high", count: 5 },
        { severity: "critical", count: 2 },
      ],
    };

    return statistics;
  },
};
