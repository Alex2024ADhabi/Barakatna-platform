/**
 * Quality Control Schema
 *
 * This file defines the database schema for quality control-related tables
 * in the Barakatna Platform.
 */

export const qualityControlSchema = {
  // Quality Inspection table to track inspections of completed work
  QualityInspection: {
    qualityInspectionId: "INT PRIMARY KEY IDENTITY(1,1)",
    projectId: "INT NOT NULL",
    roomAssessmentId: "INT NOT NULL",
    inspectionDate: "DATETIME NOT NULL",
    inspectorId: "INT NOT NULL", // References UserId
    overallRating: "INT NOT NULL", // 1-5 scale
    passedInspection: "BIT NOT NULL",
    notes: "NVARCHAR(1000)",
    followUpRequired: "BIT NOT NULL DEFAULT 0",
    followUpDate: "DATETIME",
    isActive: "BIT NOT NULL DEFAULT 1",
    createdBy: "INT NOT NULL",
    createdDate: "DATETIME NOT NULL",
    lastModifiedBy: "INT",
    lastModifiedDate: "DATETIME",
    foreignKeys: [
      "FOREIGN KEY (projectId) REFERENCES Project(projectId)",
      "FOREIGN KEY (roomAssessmentId) REFERENCES RoomAssessment(roomAssessmentId)",
      "FOREIGN KEY (inspectorId) REFERENCES [User](userId)",
      "FOREIGN KEY (createdBy) REFERENCES [User](userId)",
      "FOREIGN KEY (lastModifiedBy) REFERENCES [User](userId)",
    ],
  },

  // Quality Inspection Criteria table to track specific criteria checked during inspections
  QualityInspectionCriteria: {
    criteriaId: "INT PRIMARY KEY IDENTITY(1,1)",
    qualityInspectionId: "INT NOT NULL",
    criteriaName: "NVARCHAR(100) NOT NULL",
    criteriaNameAr: "NVARCHAR(200)",
    description: "NVARCHAR(500)",
    descriptionAr: "NVARCHAR(1000)",
    category: "NVARCHAR(50) NOT NULL", // e.g., Safety, Functionality, Aesthetics
    isPassed: "BIT NOT NULL",
    rating: "INT", // 1-5 scale
    comments: "NVARCHAR(500)",
    isActive: "BIT NOT NULL DEFAULT 1",
    createdBy: "INT NOT NULL",
    createdDate: "DATETIME NOT NULL",
    lastModifiedBy: "INT",
    lastModifiedDate: "DATETIME",
    foreignKeys: [
      "FOREIGN KEY (qualityInspectionId) REFERENCES QualityInspection(qualityInspectionId)",
      "FOREIGN KEY (createdBy) REFERENCES [User](userId)",
      "FOREIGN KEY (lastModifiedBy) REFERENCES [User](userId)",
    ],
  },

  // Quality Standard table to define standards for different room types and client types
  QualityStandard: {
    standardId: "INT PRIMARY KEY IDENTITY(1,1)",
    roomTypeId: "INT NOT NULL",
    clientTypeId: "INT NOT NULL",
    standardName: "NVARCHAR(100) NOT NULL",
    standardNameAr: "NVARCHAR(200)",
    description: "NVARCHAR(500)",
    descriptionAr: "NVARCHAR(1000)",
    category: "NVARCHAR(50) NOT NULL",
    minimumRating: "INT NOT NULL", // Minimum acceptable rating
    isActive: "BIT NOT NULL DEFAULT 1",
    createdBy: "INT NOT NULL",
    createdDate: "DATETIME NOT NULL",
    lastModifiedBy: "INT",
    lastModifiedDate: "DATETIME",
    foreignKeys: [
      "FOREIGN KEY (roomTypeId) REFERENCES RoomType(roomTypeId)",
      "FOREIGN KEY (clientTypeId) REFERENCES ClientType(clientTypeId)",
      "FOREIGN KEY (createdBy) REFERENCES [User](userId)",
      "FOREIGN KEY (lastModifiedBy) REFERENCES [User](userId)",
    ],
  },

  // Defect table to track defects found during inspections
  Defect: {
    defectId: "INT PRIMARY KEY IDENTITY(1,1)",
    qualityInspectionId: "INT NOT NULL",
    defectTypeId: "INT NOT NULL",
    description: "NVARCHAR(500) NOT NULL",
    descriptionAr: "NVARCHAR(1000)",
    severity: "INT NOT NULL", // 1-5 scale
    photoUrl: "NVARCHAR(500)",
    isResolved: "BIT NOT NULL DEFAULT 0",
    resolutionDate: "DATETIME",
    resolutionNotes: "NVARCHAR(500)",
    isActive: "BIT NOT NULL DEFAULT 1",
    createdBy: "INT NOT NULL",
    createdDate: "DATETIME NOT NULL",
    lastModifiedBy: "INT",
    lastModifiedDate: "DATETIME",
    foreignKeys: [
      "FOREIGN KEY (qualityInspectionId) REFERENCES QualityInspection(qualityInspectionId)",
      "FOREIGN KEY (defectTypeId) REFERENCES DefectType(defectTypeId)",
      "FOREIGN KEY (createdBy) REFERENCES [User](userId)",
      "FOREIGN KEY (lastModifiedBy) REFERENCES [User](userId)",
    ],
  },

  // Defect Type table to categorize different types of defects
  DefectType: {
    defectTypeId: "INT PRIMARY KEY IDENTITY(1,1)",
    typeName: "NVARCHAR(100) NOT NULL",
    typeNameAr: "NVARCHAR(200)",
    description: "NVARCHAR(500)",
    descriptionAr: "NVARCHAR(1000)",
    category: "NVARCHAR(50) NOT NULL",
    isActive: "BIT NOT NULL DEFAULT 1",
    createdBy: "INT NOT NULL",
    createdDate: "DATETIME NOT NULL",
    lastModifiedBy: "INT",
    lastModifiedDate: "DATETIME",
    foreignKeys: [
      "FOREIGN KEY (createdBy) REFERENCES [User](userId)",
      "FOREIGN KEY (lastModifiedBy) REFERENCES [User](userId)",
    ],
  },
};
