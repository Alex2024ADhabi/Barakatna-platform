import { Inspection, InspectionItem, QualityCheck, Defect } from "./types";
import {
  mockInspections,
  mockInspectionItems,
  mockQualityChecks,
  mockDefects,
} from "./mockData";

// Simple inspection API with mock data
export const inspectionApi = {
  // Get all inspections
  getInspections: async (projectId?: number): Promise<Inspection[]> => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (projectId) {
      return mockInspections.filter(
        (inspection) => inspection.projectId === projectId,
      );
    }
    return mockInspections;
  },

  // Get an inspection by ID
  getInspection: async (id: number): Promise<Inspection | undefined> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return mockInspections.find((inspection) => inspection.id === id);
  },

  // Create a new inspection
  createInspection: async (
    inspection: Omit<Inspection, "id">,
  ): Promise<Inspection> => {
    await new Promise((resolve) => setTimeout(resolve, 800));

    const newInspection: Inspection = {
      ...inspection,
      id: Math.max(...mockInspections.map((i) => i.id)) + 1,
    };

    mockInspections.push(newInspection);
    return newInspection;
  },

  // Update inspection status
  updateInspectionStatus: async (
    id: number,
    status: string,
    completedDate?: string,
  ): Promise<Inspection | undefined> => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const inspection = mockInspections.find((i) => i.id === id);
    if (inspection) {
      inspection.status = status;
      if (completedDate) {
        inspection.completedDate = completedDate;
      }
    }

    return inspection;
  },

  // Get inspection items
  getInspectionItems: async (
    inspectionId: number,
  ): Promise<InspectionItem[]> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return mockInspectionItems.filter(
      (item) => item.inspectionId === inspectionId,
    );
  },

  // Add inspection item
  addInspectionItem: async (
    item: Omit<InspectionItem, "id">,
  ): Promise<InspectionItem> => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const newItem: InspectionItem = {
      ...item,
      id: Math.max(...mockInspectionItems.map((i) => i.id)) + 1,
    };

    mockInspectionItems.push(newItem);
    return newItem;
  },

  // Get quality checks
  getQualityChecks: async (projectId?: number): Promise<QualityCheck[]> => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (projectId) {
      return mockQualityChecks.filter((check) => check.projectId === projectId);
    }
    return mockQualityChecks;
  },

  // Create quality check
  createQualityCheck: async (
    check: Omit<QualityCheck, "id">,
  ): Promise<QualityCheck> => {
    await new Promise((resolve) => setTimeout(resolve, 800));

    const newCheck: QualityCheck = {
      ...check,
      id: Math.max(...mockQualityChecks.map((c) => c.id)) + 1,
    };

    mockQualityChecks.push(newCheck);
    return newCheck;
  },

  // Get defects
  getDefects: async (qualityCheckId?: number): Promise<Defect[]> => {
    await new Promise((resolve) => setTimeout(resolve, 300));

    if (qualityCheckId) {
      return mockDefects.filter(
        (defect) => defect.qualityCheckId === qualityCheckId,
      );
    }
    return mockDefects;
  },

  // Create defect
  createDefect: async (defect: Omit<Defect, "id">): Promise<Defect> => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const newDefect: Defect = {
      ...defect,
      id: Math.max(...mockDefects.map((d) => d.id)) + 1,
    };

    mockDefects.push(newDefect);
    return newDefect;
  },

  // Update defect status
  updateDefectStatus: async (
    id: number,
    status: "open" | "in-progress" | "resolved",
    resolvedDate?: string,
  ): Promise<Defect | undefined> => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    const defect = mockDefects.find((d) => d.id === id);
    if (defect) {
      defect.status = status;
      if (status === "resolved" && resolvedDate) {
        defect.resolvedDate = resolvedDate;
      }
    }

    return defect;
  },
};
