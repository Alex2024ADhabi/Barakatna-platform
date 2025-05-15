import {
  Case,
  CaseAssignment,
  CaseDocument,
  CaseCommunication,
  CaseNote,
  CaseHistory,
  CaseFilter,
  CaseSummary,
  CaseStatistics,
} from "./types";
import { v4 as uuidv4 } from "uuid";
import eventBus, { EventType } from "@/services/eventBus";

// Mock data for cases
const mockCases: Case[] = [
  {
    id: "1",
    caseNumber: "CS-2023-001",
    beneficiaryId: "b001",
    beneficiaryName: "Ahmed Al-Saud",
    status: "in-progress",
    priority: "high",
    type: "fdf",
    title: "Home Modification for Mobility",
    description:
      "Bathroom and entrance modifications for wheelchair accessibility",
    createdAt: "2023-10-15",
    updatedAt: "2023-10-20",
    assignedTo: "user123",
    address: "Riyadh, Al Olaya District",
    contactPhone: "+966501234567",
    contactEmail: "ahmed@example.com",
    estimatedCompletionDate: "2023-12-15",
    tags: ["wheelchair", "bathroom", "entrance"],
    totalBudget: 25000,
    spentBudget: 10000,
    remainingBudget: 15000,
  },
  {
    id: "2",
    caseNumber: "CS-2023-002",
    beneficiaryId: "b002",
    beneficiaryName: "Fatima Al-Qahtani",
    status: "pending",
    priority: "medium",
    type: "adha",
    title: "Kitchen Adaptation for Senior",
    description:
      "Kitchen modifications for easier access and use by elderly resident",
    createdAt: "2023-10-18",
    updatedAt: "2023-10-18",
    address: "Jeddah, Al Rawdah District",
    contactPhone: "+966512345678",
    estimatedCompletionDate: "2023-11-30",
    tags: ["kitchen", "elderly"],
    totalBudget: 18000,
    spentBudget: 0,
    remainingBudget: 18000,
  },
  {
    id: "3",
    caseNumber: "CS-2023-003",
    beneficiaryId: "b003",
    beneficiaryName: "Mohammed Al-Harbi",
    status: "completed",
    priority: "low",
    type: "cash",
    title: "Stair Lift Installation",
    description: "Installation of stair lift for second floor access",
    createdAt: "2023-10-10",
    updatedAt: "2023-10-25",
    assignedTo: "user456",
    address: "Dammam, Al Faisaliyah District",
    contactEmail: "mohammed@example.com",
    estimatedCompletionDate: "2023-10-25",
    actualCompletionDate: "2023-10-25",
    tags: ["stairs", "mobility"],
    totalBudget: 12000,
    spentBudget: 12000,
    remainingBudget: 0,
  },
  {
    id: "4",
    caseNumber: "CS-2023-004",
    beneficiaryId: "b004",
    beneficiaryName: "Noura Al-Otaibi",
    status: "on-hold",
    priority: "urgent",
    type: "fdf",
    title: "Full Home Assessment",
    description: "Comprehensive home assessment for multiple modifications",
    createdAt: "2023-10-20",
    updatedAt: "2023-10-22",
    assignedTo: "user789",
    address: "Riyadh, Al Malaz District",
    contactPhone: "+966523456789",
    contactEmail: "noura@example.com",
    estimatedCompletionDate: "2023-12-30",
    tags: ["assessment", "multiple"],
    totalBudget: 35000,
    spentBudget: 5000,
    remainingBudget: 30000,
  },
  {
    id: "5",
    caseNumber: "CS-2023-005",
    beneficiaryId: "b005",
    beneficiaryName: "Khalid Al-Dossary",
    status: "in-progress",
    priority: "high",
    type: "adha",
    title: "Bathroom Safety Modifications",
    description:
      "Installation of grab bars, non-slip flooring, and accessible shower",
    createdAt: "2023-10-22",
    updatedAt: "2023-10-24",
    assignedTo: "user123",
    address: "Makkah, Al Aziziyah District",
    contactPhone: "+966534567890",
    estimatedCompletionDate: "2023-11-15",
    tags: ["bathroom", "safety"],
    totalBudget: 15000,
    spentBudget: 7500,
    remainingBudget: 7500,
  },
];

// API functions for case management
export const caseApi = {
  // Get all cases with optional filtering
  getCases: async (filter?: CaseFilter): Promise<Case[]> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    let filteredCases = [...mockCases];

    if (filter) {
      if (filter.status && filter.status.length > 0) {
        filteredCases = filteredCases.filter((c) =>
          filter.status?.includes(c.status),
        );
      }

      if (filter.priority && filter.priority.length > 0) {
        filteredCases = filteredCases.filter((c) =>
          filter.priority?.includes(c.priority),
        );
      }

      if (filter.type && filter.type.length > 0) {
        filteredCases = filteredCases.filter((c) =>
          filter.type?.includes(c.type),
        );
      }

      if (filter.assignedTo && filter.assignedTo.length > 0) {
        filteredCases = filteredCases.filter(
          (c) => c.assignedTo && filter.assignedTo?.includes(c.assignedTo),
        );
      }

      if (filter.dateRange) {
        filteredCases = filteredCases.filter((c) => {
          const createdDate = new Date(c.createdAt);
          const startDate = new Date(filter.dateRange!.start);
          const endDate = new Date(filter.dateRange!.end);
          return createdDate >= startDate && createdDate <= endDate;
        });
      }

      if (filter.searchTerm) {
        const term = filter.searchTerm.toLowerCase();
        filteredCases = filteredCases.filter(
          (c) =>
            c.caseNumber.toLowerCase().includes(term) ||
            c.beneficiaryName.toLowerCase().includes(term) ||
            c.title.toLowerCase().includes(term) ||
            c.description.toLowerCase().includes(term) ||
            c.address.toLowerCase().includes(term),
        );
      }

      if (filter.tags && filter.tags.length > 0) {
        filteredCases = filteredCases.filter(
          (c) => c.tags && filter.tags?.some((tag) => c.tags?.includes(tag)),
        );
      }
    }

    return filteredCases;
  },

  // Get a single case by ID
  getCaseById: async (id: string): Promise<Case | null> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const foundCase = mockCases.find((c) => c.id === id);
    return foundCase || null;
  },

  // Create a new case
  createCase: async (
    caseData: Omit<Case, "id" | "caseNumber" | "createdAt" | "updatedAt">,
  ): Promise<Case> => {
    await new Promise((resolve) => setTimeout(resolve, 700));

    const newCase: Case = {
      id: uuidv4(),
      caseNumber: `CS-${new Date().getFullYear()}-${String(mockCases.length + 1).padStart(3, "0")}`,
      ...caseData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockCases.push(newCase);

    // Publish case created event
    eventBus.publish({
      id: `case_created_${Date.now()}`,
      type: EventType.CASE_CREATED,
      timestamp: new Date().toISOString(),
      source: "caseApi",
      payload: newCase,
    });

    return newCase;
  },

  // Update an existing case
  updateCase: async (
    id: string,
    caseData: Partial<Case>,
  ): Promise<Case | null> => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const index = mockCases.findIndex((c) => c.id === id);
    if (index === -1) return null;

    const originalCase = { ...mockCases[index] };
    const updatedCase = {
      ...originalCase,
      ...caseData,
      updatedAt: new Date().toISOString(),
    };

    mockCases[index] = updatedCase;

    // Publish case updated event
    eventBus.publish({
      id: `case_updated_${Date.now()}`,
      type: EventType.CASE_UPDATED,
      timestamp: new Date().toISOString(),
      source: "caseApi",
      payload: updatedCase,
    });

    // If status changed, publish status changed event
    if (originalCase.status !== updatedCase.status) {
      eventBus.publish({
        id: `case_status_${Date.now()}`,
        type: EventType.CASE_STATUS_CHANGED,
        timestamp: new Date().toISOString(),
        source: "caseApi",
        payload: {
          caseId: updatedCase.id,
          previousStatus: originalCase.status,
          newStatus: updatedCase.status,
          caseNumber: updatedCase.caseNumber,
          beneficiaryId: updatedCase.beneficiaryId,
        },
      });
    }

    return updatedCase;
  },

  // Delete a case
  deleteCase: async (id: string): Promise<boolean> => {
    await new Promise((resolve) => setTimeout(resolve, 400));

    const index = mockCases.findIndex((c) => c.id === id);
    if (index === -1) return false;

    const deletedCase = mockCases[index];
    mockCases.splice(index, 1);

    // Publish case deleted event
    eventBus.publish({
      id: `case_deleted_${Date.now()}`,
      type: EventType.CASE_UPDATED, // Using UPDATED with a deleted flag is more consistent
      timestamp: new Date().toISOString(),
      source: "caseApi",
      payload: {
        ...deletedCase,
        deleted: true,
      },
      metadata: {
        action: "delete",
      },
    });

    return true;
  },

  // Get case summary statistics
  getCaseSummary: async (): Promise<CaseSummary> => {
    await new Promise((resolve) => setTimeout(resolve, 600));

    const summary: CaseSummary = {
      totalCases: mockCases.length,
      byCaseType: {
        fdf: mockCases.filter((c) => c.type === "fdf").length,
        adha: mockCases.filter((c) => c.type === "adha").length,
        cash: mockCases.filter((c) => c.type === "cash").length,
        other: mockCases.filter((c) => c.type === "other").length,
      },
      byStatus: {
        pending: mockCases.filter((c) => c.status === "pending").length,
        "in-progress": mockCases.filter((c) => c.status === "in-progress")
          .length,
        completed: mockCases.filter((c) => c.status === "completed").length,
        "on-hold": mockCases.filter((c) => c.status === "on-hold").length,
        cancelled: mockCases.filter((c) => c.status === "cancelled").length,
      },
      byPriority: {
        low: mockCases.filter((c) => c.priority === "low").length,
        medium: mockCases.filter((c) => c.priority === "medium").length,
        high: mockCases.filter((c) => c.priority === "high").length,
        urgent: mockCases.filter((c) => c.priority === "urgent").length,
      },
      recentlyUpdated: [...mockCases]
        .sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
        )
        .slice(0, 5),
      upcomingDeadlines: mockCases
        .filter((c) => c.estimatedCompletionDate && c.status !== "completed")
        .sort(
          (a, b) =>
            new Date(a.estimatedCompletionDate!).getTime() -
            new Date(b.estimatedCompletionDate!).getTime(),
        )
        .slice(0, 5),
    };

    return summary;
  },

  // Get detailed case statistics
  getCaseStatistics: async (): Promise<CaseStatistics> => {
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Calculate average resolution time for completed cases
    const completedCases = mockCases.filter(
      (c) => c.status === "completed" && c.actualCompletionDate,
    );
    const totalDays = completedCases.reduce((sum, c) => {
      const start = new Date(c.createdAt);
      const end = new Date(c.actualCompletionDate!);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return sum + diffDays;
    }, 0);

    const averageResolutionTime =
      completedCases.length > 0 ? totalDays / completedCases.length : 0;

    // Mock data for statistics
    const statistics: CaseStatistics = {
      averageResolutionTime,
      casesByMonth: [
        { month: "Jan", count: 12 },
        { month: "Feb", count: 15 },
        { month: "Mar", count: 8 },
        { month: "Apr", count: 10 },
        { month: "May", count: 14 },
        { month: "Jun", count: 20 },
        { month: "Jul", count: 25 },
        { month: "Aug", count: 18 },
        { month: "Sep", count: 22 },
        { month: "Oct", count: mockCases.length },
        { month: "Nov", count: 0 },
        { month: "Dec", count: 0 },
      ],
      casesByType: [
        {
          type: "fdf",
          count: mockCases.filter((c) => c.type === "fdf").length,
        },
        {
          type: "adha",
          count: mockCases.filter((c) => c.type === "adha").length,
        },
        {
          type: "cash",
          count: mockCases.filter((c) => c.type === "cash").length,
        },
        {
          type: "other",
          count: mockCases.filter((c) => c.type === "other").length,
        },
      ],
      casesByStatus: [
        {
          status: "pending",
          count: mockCases.filter((c) => c.status === "pending").length,
        },
        {
          status: "in-progress",
          count: mockCases.filter((c) => c.status === "in-progress").length,
        },
        {
          status: "completed",
          count: mockCases.filter((c) => c.status === "completed").length,
        },
        {
          status: "on-hold",
          count: mockCases.filter((c) => c.status === "on-hold").length,
        },
        {
          status: "cancelled",
          count: mockCases.filter((c) => c.status === "cancelled").length,
        },
      ],
      casesByPriority: [
        {
          priority: "low",
          count: mockCases.filter((c) => c.priority === "low").length,
        },
        {
          priority: "medium",
          count: mockCases.filter((c) => c.priority === "medium").length,
        },
        {
          priority: "high",
          count: mockCases.filter((c) => c.priority === "high").length,
        },
        {
          priority: "urgent",
          count: mockCases.filter((c) => c.priority === "urgent").length,
        },
      ],
    };

    return statistics;
  },
};
