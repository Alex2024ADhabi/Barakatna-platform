/**
 * FDF-Specific Schema
 *
 * This file defines the database schema for tables specific to the
 * Family Development Foundation (FDF) client type in the Barakatna Platform.
 */

export const fdfSchema = {
  // Mental Health Assessment table for FDF beneficiaries
  MentalHealthAssessment: {
    mentalHealthAssessmentId: "INT PRIMARY KEY IDENTITY(1,1)",
    beneficiaryId: "INT NOT NULL",
    assessmentDate: "DATETIME NOT NULL",
    assessorId: "INT NOT NULL", // References UserId
    cognitiveStatus: "NVARCHAR(50) NOT NULL",
    emotionalWellbeing: "NVARCHAR(50) NOT NULL",
    socialInteraction: "NVARCHAR(50) NOT NULL",
    independenceLevel: "NVARCHAR(50) NOT NULL",
    memoryAssessment: "NVARCHAR(50) NOT NULL",
    overallScore: "INT NOT NULL",
    recommendations: "NVARCHAR(1000)",
    followUpRequired: "BIT NOT NULL DEFAULT 0",
    followUpDate: "DATETIME",
    notes: "NVARCHAR(1000)",
    isActive: "BIT NOT NULL DEFAULT 1",
    createdBy: "INT NOT NULL",
    createdDate: "DATETIME NOT NULL",
    lastModifiedBy: "INT",
    lastModifiedDate: "DATETIME",
    foreignKeys: [
      "FOREIGN KEY (beneficiaryId) REFERENCES Beneficiary(beneficiaryId)",
      "FOREIGN KEY (assessorId) REFERENCES [User](userId)",
      "FOREIGN KEY (createdBy) REFERENCES [User](userId)",
      "FOREIGN KEY (lastModifiedBy) REFERENCES [User](userId)",
    ],
  },

  // Social Security Verification table for FDF beneficiaries
  SocialSecurityVerification: {
    verificationId: "INT PRIMARY KEY IDENTITY(1,1)",
    beneficiaryId: "INT NOT NULL",
    socialSecurityNumber: "NVARCHAR(20) NOT NULL",
    verificationDate: "DATETIME NOT NULL",
    verifierId: "INT NOT NULL", // References UserId
    isVerified: "BIT NOT NULL",
    incomeLevel: "DECIMAL(18,2)",
    subsidyEligibility: "BIT NOT NULL",
    subsidyPercentage: "DECIMAL(5,2)",
    documentationUrl: "NVARCHAR(500)",
    notes: "NVARCHAR(1000)",
    isActive: "BIT NOT NULL DEFAULT 1",
    createdBy: "INT NOT NULL",
    createdDate: "DATETIME NOT NULL",
    lastModifiedBy: "INT",
    lastModifiedDate: "DATETIME",
    foreignKeys: [
      "FOREIGN KEY (beneficiaryId) REFERENCES Beneficiary(beneficiaryId)",
      "FOREIGN KEY (verifierId) REFERENCES [User](userId)",
      "FOREIGN KEY (createdBy) REFERENCES [User](userId)",
      "FOREIGN KEY (lastModifiedBy) REFERENCES [User](userId)",
    ],
  },

  // Multidisciplinary Plan table for FDF beneficiaries
  MultidisciplinaryPlan: {
    planId: "INT PRIMARY KEY IDENTITY(1,1)",
    beneficiaryId: "INT NOT NULL",
    assessmentId: "INT NOT NULL",
    planDate: "DATETIME NOT NULL",
    planLeadId: "INT NOT NULL", // References UserId
    planStatus: "NVARCHAR(50) NOT NULL",
    healthGoals: "NVARCHAR(500)",
    socialGoals: "NVARCHAR(500)",
    environmentalGoals: "NVARCHAR(500)",
    startDate: "DATETIME NOT NULL",
    endDate: "DATETIME NOT NULL",
    reviewDate: "DATETIME",
    notes: "NVARCHAR(1000)",
    isActive: "BIT NOT NULL DEFAULT 1",
    createdBy: "INT NOT NULL",
    createdDate: "DATETIME NOT NULL",
    lastModifiedBy: "INT",
    lastModifiedDate: "DATETIME",
    foreignKeys: [
      "FOREIGN KEY (beneficiaryId) REFERENCES Beneficiary(beneficiaryId)",
      "FOREIGN KEY (assessmentId) REFERENCES Assessment(assessmentId)",
      "FOREIGN KEY (planLeadId) REFERENCES [User](userId)",
      "FOREIGN KEY (createdBy) REFERENCES [User](userId)",
      "FOREIGN KEY (lastModifiedBy) REFERENCES [User](userId)",
    ],
  },

  // Specialist Referral table for FDF beneficiaries
  SpecialistReferral: {
    referralId: "INT PRIMARY KEY IDENTITY(1,1)",
    beneficiaryId: "INT NOT NULL",
    planId: "INT", // Optional reference to MultidisciplinaryPlan
    referralDate: "DATETIME NOT NULL",
    referringUserId: "INT NOT NULL", // References UserId
    specialistType: "NVARCHAR(100) NOT NULL", // e.g., Geriatrician, Physiotherapist
    specialistName: "NVARCHAR(200)",
    specialistContact: "NVARCHAR(100)",
    referralReason: "NVARCHAR(500) NOT NULL",
    urgency: "NVARCHAR(50) NOT NULL",
    appointmentDate: "DATETIME",
    followUpDate: "DATETIME",
    status: "NVARCHAR(50) NOT NULL",
    outcome: "NVARCHAR(500)",
    notes: "NVARCHAR(1000)",
    isActive: "BIT NOT NULL DEFAULT 1",
    createdBy: "INT NOT NULL",
    createdDate: "DATETIME NOT NULL",
    lastModifiedBy: "INT",
    lastModifiedDate: "DATETIME",
    foreignKeys: [
      "FOREIGN KEY (beneficiaryId) REFERENCES Beneficiary(beneficiaryId)",
      "FOREIGN KEY (planId) REFERENCES MultidisciplinaryPlan(planId)",
      "FOREIGN KEY (referringUserId) REFERENCES [User](userId)",
      "FOREIGN KEY (createdBy) REFERENCES [User](userId)",
      "FOREIGN KEY (lastModifiedBy) REFERENCES [User](userId)",
    ],
  },
};
