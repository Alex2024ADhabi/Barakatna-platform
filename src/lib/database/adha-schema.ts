/**
 * ADHA-Specific Schema
 *
 * This file defines the database schema for tables specific to the
 * Abu Dhabi Housing Authority (ADHA) client type in the Barakatna Platform.
 */

export const adhaSchema = {
  // ADHA Application table for ADHA beneficiaries
  ADHAApplication: {
    applicationId: "INT PRIMARY KEY IDENTITY(1,1)",
    beneficiaryId: "INT NOT NULL",
    adhaReferenceNumber: "NVARCHAR(50) NOT NULL",
    applicationDate: "DATETIME NOT NULL",
    propertyOwnershipNumber: "NVARCHAR(50) NOT NULL",
    propertyType: "NVARCHAR(50) NOT NULL",
    propertyAge: "INT NOT NULL",
    applicationStatus: "NVARCHAR(50) NOT NULL",
    approvalDate: "DATETIME",
    approvedById: "INT", // References UserId
    budgetAllocation: "DECIMAL(18,2)",
    notes: "NVARCHAR(1000)",
    isActive: "BIT NOT NULL DEFAULT 1",
    createdBy: "INT NOT NULL",
    createdDate: "DATETIME NOT NULL",
    lastModifiedBy: "INT",
    lastModifiedDate: "DATETIME",
    foreignKeys: [
      "FOREIGN KEY (beneficiaryId) REFERENCES Beneficiary(beneficiaryId)",
      "FOREIGN KEY (approvedById) REFERENCES [User](userId)",
      "FOREIGN KEY (createdBy) REFERENCES [User](userId)",
      "FOREIGN KEY (lastModifiedBy) REFERENCES [User](userId)",
    ],
  },

  // Accessibility Requirement table for ADHA beneficiaries
  AccessibilityRequirement: {
    requirementId: "INT PRIMARY KEY IDENTITY(1,1)",
    applicationId: "INT NOT NULL",
    roomAssessmentId: "INT NOT NULL",
    requirementType: "NVARCHAR(100) NOT NULL",
    requirementTypeAr: "NVARCHAR(200)",
    description: "NVARCHAR(500) NOT NULL",
    descriptionAr: "NVARCHAR(1000)",
    priority: "INT NOT NULL", // 1-5 scale
    isApproved: "BIT NOT NULL DEFAULT 0",
    approvedById: "INT", // References UserId
    approvalDate: "DATETIME",
    estimatedCost: "DECIMAL(18,2)",
    notes: "NVARCHAR(1000)",
    isActive: "BIT NOT NULL DEFAULT 1",
    createdBy: "INT NOT NULL",
    createdDate: "DATETIME NOT NULL",
    lastModifiedBy: "INT",
    lastModifiedDate: "DATETIME",
    foreignKeys: [
      "FOREIGN KEY (applicationId) REFERENCES ADHAApplication(applicationId)",
      "FOREIGN KEY (roomAssessmentId) REFERENCES RoomAssessment(roomAssessmentId)",
      "FOREIGN KEY (approvedById) REFERENCES [User](userId)",
      "FOREIGN KEY (createdBy) REFERENCES [User](userId)",
      "FOREIGN KEY (lastModifiedBy) REFERENCES [User](userId)",
    ],
  },

  // Material Selection table for ADHA projects
  MaterialSelection: {
    selectionId: "INT PRIMARY KEY IDENTITY(1,1)",
    applicationId: "INT NOT NULL",
    projectId: "INT NOT NULL",
    materialCategoryId: "INT NOT NULL",
    materialItemId: "INT NOT NULL",
    selectedOption: "NVARCHAR(100) NOT NULL",
    selectedOptionAr: "NVARCHAR(200)",
    color: "NVARCHAR(50)",
    dimensions: "NVARCHAR(100)",
    quantity: "INT NOT NULL",
    unitPrice: "DECIMAL(18,2) NOT NULL",
    totalPrice: "DECIMAL(18,2) NOT NULL",
    isApproved: "BIT NOT NULL DEFAULT 0",
    approvedById: "INT", // References UserId
    approvalDate: "DATETIME",
    notes: "NVARCHAR(1000)",
    isActive: "BIT NOT NULL DEFAULT 1",
    createdBy: "INT NOT NULL",
    createdDate: "DATETIME NOT NULL",
    lastModifiedBy: "INT",
    lastModifiedDate: "DATETIME",
    foreignKeys: [
      "FOREIGN KEY (applicationId) REFERENCES ADHAApplication(applicationId)",
      "FOREIGN KEY (projectId) REFERENCES Project(projectId)",
      "FOREIGN KEY (materialCategoryId) REFERENCES MaterialCategory(materialCategoryId)",
      "FOREIGN KEY (materialItemId) REFERENCES MaterialItem(materialItemId)",
      "FOREIGN KEY (approvedById) REFERENCES [User](userId)",
      "FOREIGN KEY (createdBy) REFERENCES [User](userId)",
      "FOREIGN KEY (lastModifiedBy) REFERENCES [User](userId)",
    ],
  },

  // Budget Allocation table for ADHA projects
  BudgetAllocation: {
    allocationId: "INT PRIMARY KEY IDENTITY(1,1)",
    applicationId: "INT NOT NULL",
    projectId: "INT NOT NULL",
    allocationDate: "DATETIME NOT NULL",
    totalBudget: "DECIMAL(18,2) NOT NULL",
    allocatedAmount: "DECIMAL(18,2) NOT NULL",
    remainingAmount: "DECIMAL(18,2) NOT NULL",
    allocationStatus: "NVARCHAR(50) NOT NULL",
    approvedById: "INT", // References UserId
    approvalDate: "DATETIME",
    notes: "NVARCHAR(1000)",
    isActive: "BIT NOT NULL DEFAULT 1",
    createdBy: "INT NOT NULL",
    createdDate: "DATETIME NOT NULL",
    lastModifiedBy: "INT",
    lastModifiedDate: "DATETIME",
    foreignKeys: [
      "FOREIGN KEY (applicationId) REFERENCES ADHAApplication(applicationId)",
      "FOREIGN KEY (projectId) REFERENCES Project(projectId)",
      "FOREIGN KEY (approvedById) REFERENCES [User](userId)",
      "FOREIGN KEY (createdBy) REFERENCES [User](userId)",
      "FOREIGN KEY (lastModifiedBy) REFERENCES [User](userId)",
    ],
  },
};
