// Database Mappings for Barakatna Platform
// This file maps between our frontend component models and database models

import * as DB from "@/types/database";

// Map WorkflowNavigatorWithLanguage component data to database types
export function mapWorkflowPhaseToStatus(phase: any): Partial<DB.Status> {
  return {
    statusCode: `PHASE_${phase.id}`,
    statusNameEN: phase.name,
    statusNameAR: phase.nameAr,
    description: phase.description,
    statusCategory: "Workflow",
    orderSequence: phase.id,
    isActive: true,
  };
}

// Map client types from component to database
export function mapClientTypeFromComponent(
  clientType: string,
): Partial<DB.ClientType> {
  const clientTypeMap: Record<string, Partial<DB.ClientType>> = {
    fdf: {
      typeCode: "FDF",
      typeNameEN: "Family Development Foundation",
      typeNameAR: "مؤسسة تنمية الأسرة",
      isActive: true,
    },
    adha: {
      typeCode: "ADHA",
      typeNameEN: "Abu Dhabi Housing Authority",
      typeNameAR: "هيئة أبوظبي للإسكان",
      isActive: true,
    },
    cash: {
      typeCode: "CASH",
      typeNameEN: "Cash Client",
      typeNameAR: "عميل نقدي",
      isActive: true,
    },
  };

  return (
    clientTypeMap[clientType] || {
      typeCode: clientType.toUpperCase(),
      typeNameEN: clientType,
      typeNameAR: clientType,
      isActive: true,
    }
  );
}

// Map RoomAssessmentForm data to database types
export function mapRoomAssessmentFormToDatabase(
  formData: any,
  roomAssessmentId: number,
  userId: number,
): {
  roomAssessment: Partial<DB.RoomAssessment>;
  measurements: Partial<DB.Measurement>[];
  recommendations: Partial<DB.Recommendation>[];
} {
  // Map room assessment
  const roomAssessment: Partial<DB.RoomAssessment> = {
    roomAssessmentId,
    roomTypeId: getRoomTypeIdByCode(formData.roomType),
    roomName: formData.roomType,
    completionStatus: true,
    notes: formData.observations,
    isActive: true,
    createdBy: userId,
    createdDate: new Date(),
  };

  // Map measurements
  const measurements: Partial<DB.Measurement>[] = formData.measurements.map(
    (m: any, index: number) => ({
      roomAssessmentId,
      measurementTypeId: getMeasurementTypeIdByName(m.name),
      value: parseFloat(m.value) || 0,
      unitOfMeasure: m.unit,
      standardValue: parseFloat(m.standard) || undefined,
      notes: m.notes,
      isActive: true,
      createdBy: userId,
      createdDate: new Date(),
    }),
  );

  // Map recommendations
  const recommendations: Partial<DB.Recommendation>[] =
    formData.recommendations.map((r: any, index: number) => ({
      roomAssessmentId,
      recommendationTypeId: getRecommendationTypeIdByDescription(r.description),
      priorityLevel: getPriorityLevelValue(r.priority),
      description: r.description,
      estimatedCost: parseFloat(r.estimatedCost) || undefined,
      isSelected: false,
      isApproved: false,
      isActive: true,
      createdBy: userId,
      createdDate: new Date(),
    }));

  return { roomAssessment, measurements, recommendations };
}

// Map BeneficiaryProfile data to database types
export function mapBeneficiaryToSeniorCitizen(
  beneficiary: any,
  userId: number,
): Partial<DB.SeniorCitizen> {
  return {
    clientTypeId: getClientTypeIdByCode(beneficiary.clientType),
    seniorCitizenCode: beneficiary.id,
    firstNameEN: beneficiary.name.split(" ")[0],
    lastNameEN: beneficiary.name.split(" ").slice(1).join(" "),
    firstNameAR: beneficiary.nameAr ? beneficiary.nameAr.split(" ")[0] : "",
    lastNameAR: beneficiary.nameAr
      ? beneficiary.nameAr.split(" ").slice(1).join(" ")
      : "",
    dateOfBirth: new Date(new Date().getFullYear() - beneficiary.age, 0, 1), // Approximate from age
    gender: beneficiary.gender === "male" ? "M" : "F",
    nationalId: beneficiary.emiratesId,
    mobile: beneficiary.phone,
    addressLine1: beneficiary.address,
    city: extractCity(beneficiary.address),
    region: extractRegion(beneficiary.address),
    primaryLanguage: "Arabic",
    registrationDate: new Date(beneficiary.applicationDate),
    statusId: getStatusIdByCode(beneficiary.status),
    createdBy: userId,
    createdDate: new Date(),
    isActive: true,
  };
}

// Helper functions (these would connect to your database in a real implementation)
function getRoomTypeIdByCode(roomTypeCode: string): number {
  // This would query the database in a real implementation
  const roomTypeMappings: Record<string, number> = {
    bathroom: 1,
    bedroom: 2,
    kitchen: 3,
    livingRoom: 4,
    entrance: 5,
  };
  return roomTypeMappings[roomTypeCode] || 1;
}

function getMeasurementTypeIdByName(name: string): number {
  // This would query the database in a real implementation
  return 1; // Placeholder
}

function getRecommendationTypeIdByDescription(description: string): number {
  // This would query the database in a real implementation
  return 1; // Placeholder
}

function getPriorityLevelValue(priority: string): number {
  const priorityMap: Record<string, number> = {
    high: 1,
    medium: 2,
    low: 3,
  };
  return priorityMap[priority] || 2;
}

function getClientTypeIdByCode(clientTypeCode: string): number {
  const clientTypeMap: Record<string, number> = {
    fdf: 1,
    adha: 2,
    cash: 3,
  };
  return clientTypeMap[clientTypeCode] || 1;
}

function getStatusIdByCode(statusCode: string): number {
  const statusMap: Record<string, number> = {
    active: 1,
    pending: 2,
    completed: 3,
  };
  return statusMap[statusCode] || 1;
}

function extractCity(address: string): string {
  // Simple extraction logic - would be more sophisticated in real implementation
  const cities = [
    "Dubai",
    "Abu Dhabi",
    "Sharjah",
    "Al Ain",
    "Ajman",
    "Ras Al Khaimah",
    "Fujairah",
  ];
  for (const city of cities) {
    if (address.includes(city)) {
      return city;
    }
  }
  return "Dubai"; // Default
}

function extractRegion(address: string): string {
  // Simple extraction logic - would be more sophisticated in real implementation
  const regions = [
    "Al Nahda",
    "Deira",
    "Bur Dubai",
    "Jumeirah",
    "Al Barsha",
    "Al Quoz",
  ];
  for (const region of regions) {
    if (address.includes(region)) {
      return region;
    }
  }
  return "Unknown"; // Default
}
