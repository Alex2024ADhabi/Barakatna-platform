import { Inspection, InspectionItem, QualityCheck, Defect } from "./types";

// Mock inspections data
export const mockInspections: Inspection[] = [
  {
    id: 1,
    projectId: 1,
    roomId: 101,
    inspectionType: "Pre-modification",
    scheduledDate: "2023-07-10",
    completedDate: "2023-07-10",
    inspectorId: 5,
    inspectorName: "Ahmed Hassan",
    status: "Completed",
    notes: "Initial inspection before modifications",
  },
  {
    id: 2,
    projectId: 1,
    roomId: 102,
    inspectionType: "Progress",
    scheduledDate: "2023-07-15",
    inspectorId: 5,
    inspectorName: "Ahmed Hassan",
    status: "Scheduled",
    notes: "Mid-project progress check",
  },
  {
    id: 3,
    projectId: 2,
    roomId: 201,
    inspectionType: "Final",
    scheduledDate: "2023-06-28",
    completedDate: "2023-06-28",
    inspectorId: 6,
    inspectorName: "Fatima Al-Sayed",
    status: "Completed",
    notes: "Final inspection after modifications",
  },
];

// Mock inspection items data
export const mockInspectionItems: InspectionItem[] = [
  {
    id: 1,
    inspectionId: 1,
    description: "Grab bar installation",
    status: "pass",
    notes: "Properly installed and secure",
  },
  {
    id: 2,
    inspectionId: 1,
    description: "Non-slip flooring",
    status: "fail",
    notes: "Material not meeting requirements",
    photoUrl:
      "https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?w=800&q=80",
  },
  {
    id: 3,
    inspectionId: 3,
    description: "Doorway width",
    status: "pass",
    notes: "Meets accessibility standards",
  },
];

// Mock quality checks data
export const mockQualityChecks: QualityCheck[] = [
  {
    id: 1,
    projectId: 1,
    roomId: 101,
    checkDate: "2023-07-12",
    inspectorId: 7,
    inspectorName: "Omar Khalid",
    overallRating: 4,
    status: "Passed",
    notes: "Good quality work overall",
  },
  {
    id: 2,
    projectId: 1,
    roomId: 102,
    checkDate: "2023-07-16",
    inspectorId: 7,
    inspectorName: "Omar Khalid",
    overallRating: 2,
    status: "Failed",
    notes: "Multiple issues found",
  },
];

// Mock defects data
export const mockDefects: Defect[] = [
  {
    id: 1,
    qualityCheckId: 2,
    category: "Installation",
    description: "Improper grab bar installation",
    severity: "high",
    status: "open",
    assignedTo: 10,
    assigneeName: "Mohammed Al-Farsi",
    reportedDate: "2023-07-16",
    photoUrl:
      "https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?w=800&q=80",
  },
  {
    id: 2,
    qualityCheckId: 2,
    category: "Materials",
    description: "Wrong flooring material used",
    severity: "medium",
    status: "in-progress",
    assignedTo: 11,
    assigneeName: "Layla Mahmoud",
    reportedDate: "2023-07-16",
  },
];
