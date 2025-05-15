import { registerFormMetadata } from "../registry";

// FDF Client specific form metadata
export const fdfAssessmentForm = {
  id: "fdf-assessment-form",
  name: "FDF Assessment Form",
  description: "Assessment form for Fujairah Development Foundation clients",
  clientTypeId: 1, // FDF
  sections: [
    {
      id: "personal-info",
      title: "Personal Information",
      fields: [
        { id: "fullName", label: "Full Name", type: "text", required: true },
        {
          id: "emiratesId",
          label: "Emirates ID",
          type: "text",
          required: true,
        },
        {
          id: "dateOfBirth",
          label: "Date of Birth",
          type: "date",
          required: true,
        },
        {
          id: "gender",
          label: "Gender",
          type: "select",
          options: ["Male", "Female"],
          required: true,
        },
        {
          id: "contactNumber",
          label: "Contact Number",
          type: "text",
          required: true,
        },
        { id: "email", label: "Email", type: "email", required: false },
      ],
    },
    {
      id: "address",
      title: "Address",
      fields: [
        {
          id: "emirate",
          label: "Emirate",
          type: "select",
          options: [
            "Abu Dhabi",
            "Dubai",
            "Sharjah",
            "Ajman",
            "Umm Al Quwain",
            "Fujairah",
            "Ras Al Khaimah",
          ],
          required: true,
        },
        { id: "area", label: "Area", type: "text", required: true },
        { id: "street", label: "Street", type: "text", required: true },
        {
          id: "buildingVilla",
          label: "Building/Villa",
          type: "text",
          required: true,
        },
        {
          id: "gpsCoordinates",
          label: "GPS Coordinates",
          type: "text",
          required: false,
        },
      ],
    },
    {
      id: "family-assessment",
      title: "Family Assessment",
      fields: [
        {
          id: "familySize",
          label: "Family Size",
          type: "number",
          required: true,
        },
        {
          id: "dependents",
          label: "Number of Dependents",
          type: "number",
          required: true,
        },
        {
          id: "familyIncome",
          label: "Monthly Family Income (AED)",
          type: "number",
          required: true,
        },
        {
          id: "socialStatus",
          label: "Social Status",
          type: "select",
          options: ["Married", "Single", "Divorced", "Widowed"],
          required: true,
        },
        {
          id: "socialSupportNeeds",
          label: "Social Support Needs",
          type: "multiselect",
          options: [
            "Financial Aid",
            "Healthcare",
            "Education",
            "Housing",
            "Psychological Support",
            "Other",
          ],
          required: true,
        },
        {
          id: "socialWorkerNotes",
          label: "Social Worker Notes",
          type: "textarea",
          required: true,
        },
      ],
    },
    {
      id: "health-safety",
      title: "Health and Safety Assessment",
      fields: [
        {
          id: "medicalConditions",
          label: "Medical Conditions",
          type: "multiselect",
          options: [
            "Mobility Impairment",
            "Visual Impairment",
            "Hearing Impairment",
            "Chronic Illness",
            "Cognitive Impairment",
            "Other",
          ],
          required: true,
        },
        {
          id: "mobilityAids",
          label: "Mobility Aids Used",
          type: "multiselect",
          options: [
            "Wheelchair",
            "Walker",
            "Cane",
            "Crutches",
            "None",
            "Other",
          ],
          required: true,
        },
        {
          id: "safetyRisks",
          label: "Safety Risks Identified",
          type: "multiselect",
          options: [
            "Fall Hazards",
            "Electrical Hazards",
            "Fire Hazards",
            "Access Issues",
            "Sanitation Issues",
            "None",
          ],
          required: true,
        },
        {
          id: "priorityLevel",
          label: "Health & Safety Priority Level",
          type: "select",
          options: ["Critical", "High", "Medium", "Low"],
          required: true,
        },
        {
          id: "healthSafetyNotes",
          label: "Health & Safety Notes",
          type: "textarea",
          required: true,
        },
      ],
    },
    {
      id: "social-worker-approval",
      title: "Social Worker Approval",
      fields: [
        {
          id: "socialWorkerName",
          label: "Social Worker Name",
          type: "text",
          required: true,
        },
        {
          id: "socialWorkerID",
          label: "Social Worker ID",
          type: "text",
          required: true,
        },
        {
          id: "assessmentDate",
          label: "Assessment Date",
          type: "date",
          required: true,
        },
        {
          id: "recommendationDetails",
          label: "Recommendation Details",
          type: "textarea",
          required: true,
        },
        {
          id: "socialWorkerSignature",
          label: "Social Worker Signature",
          type: "signature",
          required: true,
        },
      ],
    },
  ],
  workflowSteps: [
    {
      id: "initial-application",
      name: "Initial Application",
      order: 1,
      sla: 2,
    }, // 2 days
    {
      id: "document-verification",
      name: "Document Verification",
      order: 2,
      sla: 3,
    }, // 3 days
    { id: "social-assessment", name: "Social Assessment", order: 3, sla: 5 }, // 5 days
    {
      id: "health-safety-assessment",
      name: "Health & Safety Assessment",
      order: 4,
      sla: 5,
    }, // 5 days
    {
      id: "social-worker-review",
      name: "Social Worker Review",
      order: 5,
      sla: 3,
    }, // 3 days
    { id: "committee-approval", name: "Committee Approval", order: 6, sla: 7 }, // 7 days
    { id: "final-approval", name: "Final Approval", order: 7, sla: 2 }, // 2 days
  ],
  eligibilityCriteria: [
    {
      id: "family-focused",
      description: "Family-focused eligibility criteria",
      rule: "familySize > 1",
    },
    {
      id: "income-threshold",
      description: "Income below threshold",
      rule: "familyIncome < 15000",
    },
    {
      id: "health-priority",
      description: "Health and safety prioritization",
      rule: "priorityLevel === 'Critical' || priorityLevel === 'High'",
    },
  ],
};

// ADHA Client specific form metadata
export const adhaAssessmentForm = {
  id: "adha-assessment-form",
  name: "ADHA Assessment Form",
  description: "Assessment form for Abu Dhabi Housing Authority clients",
  clientTypeId: 2, // ADHA
  sections: [
    {
      id: "personal-info",
      title: "Personal Information",
      fields: [
        { id: "fullName", label: "Full Name", type: "text", required: true },
        {
          id: "emiratesId",
          label: "Emirates ID",
          type: "text",
          required: true,
        },
        {
          id: "dateOfBirth",
          label: "Date of Birth",
          type: "date",
          required: true,
        },
        {
          id: "gender",
          label: "Gender",
          type: "select",
          options: ["Male", "Female"],
          required: true,
        },
        {
          id: "contactNumber",
          label: "Contact Number",
          type: "text",
          required: true,
        },
        { id: "email", label: "Email", type: "email", required: false },
      ],
    },
    {
      id: "address",
      title: "Address",
      fields: [
        {
          id: "emirate",
          label: "Emirate",
          type: "select",
          options: ["Abu Dhabi", "Al Ain", "Al Dhafra"],
          required: true,
        },
        { id: "area", label: "Area", type: "text", required: true },
        { id: "street", label: "Street", type: "text", required: true },
        {
          id: "buildingVilla",
          label: "Building/Villa",
          type: "text",
          required: true,
        },
        {
          id: "gpsCoordinates",
          label: "GPS Coordinates",
          type: "text",
          required: true,
        },
      ],
    },
    {
      id: "property-verification",
      title: "Property Ownership Verification",
      fields: [
        {
          id: "propertyId",
          label: "Property ID",
          type: "text",
          required: true,
        },
        {
          id: "titleDeedNumber",
          label: "Title Deed Number",
          type: "text",
          required: true,
        },
        {
          id: "propertyType",
          label: "Property Type",
          type: "select",
          options: ["Villa", "Apartment", "Traditional House"],
          required: true,
        },
        {
          id: "yearOfConstruction",
          label: "Year of Construction",
          type: "number",
          required: true,
        },
        {
          id: "ownershipStatus",
          label: "Ownership Status",
          type: "select",
          options: ["Full Ownership", "Mortgage", "Government Grant"],
          required: true,
        },
        {
          id: "governmentDatabaseVerified",
          label: "Government Database Verified",
          type: "checkbox",
          required: true,
        },
      ],
    },
    {
      id: "structural-assessment",
      title: "Structural Assessment",
      fields: [
        {
          id: "structuralCondition",
          label: "Structural Condition",
          type: "select",
          options: ["Excellent", "Good", "Fair", "Poor", "Critical"],
          required: true,
        },
        {
          id: "foundationStatus",
          label: "Foundation Status",
          type: "select",
          options: ["Sound", "Minor Issues", "Major Issues", "Critical"],
          required: true,
        },
        {
          id: "wallCondition",
          label: "Wall Condition",
          type: "select",
          options: ["Sound", "Minor Issues", "Major Issues", "Critical"],
          required: true,
        },
        {
          id: "roofCondition",
          label: "Roof Condition",
          type: "select",
          options: ["Sound", "Minor Issues", "Major Issues", "Critical"],
          required: true,
        },
        {
          id: "electricalSystem",
          label: "Electrical System",
          type: "select",
          options: ["Up to Code", "Minor Issues", "Major Issues", "Critical"],
          required: true,
        },
        {
          id: "plumbingSystem",
          label: "Plumbing System",
          type: "select",
          options: ["Up to Code", "Minor Issues", "Major Issues", "Critical"],
          required: true,
        },
        {
          id: "structuralAssessmentNotes",
          label: "Structural Assessment Notes",
          type: "textarea",
          required: true,
        },
        {
          id: "engineerName",
          label: "Engineer Name",
          type: "text",
          required: true,
        },
        {
          id: "engineerLicenseNumber",
          label: "Engineer License Number",
          type: "text",
          required: true,
        },
        {
          id: "assessmentDate",
          label: "Assessment Date",
          type: "date",
          required: true,
        },
      ],
    },
    {
      id: "budget-approval",
      title: "Budget Approval",
      fields: [
        {
          id: "estimatedCost",
          label: "Estimated Cost (AED)",
          type: "number",
          required: true,
        },
        {
          id: "budgetCategory",
          label: "Budget Category",
          type: "select",
          options: ["Standard", "Extended", "Special Case"],
          required: true,
        },
        {
          id: "approvalThreshold",
          label: "Approval Threshold",
          type: "select",
          options: [
            "Level 1 (Up to 50,000 AED)",
            "Level 2 (50,001-150,000 AED)",
            "Level 3 (150,001-300,000 AED)",
            "Level 4 (Above 300,000 AED)",
          ],
          required: true,
        },
        {
          id: "additionalApprovalRequired",
          label: "Additional Approval Required",
          type: "checkbox",
          required: false,
        },
        {
          id: "budgetJustification",
          label: "Budget Justification",
          type: "textarea",
          required: true,
        },
      ],
    },
  ],
  workflowSteps: [
    {
      id: "initial-application",
      name: "Initial Application",
      order: 1,
      sla: 2,
    }, // 2 days
    {
      id: "document-verification",
      name: "Document Verification",
      order: 2,
      sla: 3,
    }, // 3 days
    {
      id: "property-verification",
      name: "Property Verification",
      order: 3,
      sla: 5,
    }, // 5 days
    {
      id: "structural-assessment",
      name: "Structural Assessment",
      order: 4,
      sla: 7,
    }, // 7 days
    { id: "budget-review", name: "Budget Review", order: 5, sla: 5 }, // 5 days
    { id: "approval-level-1", name: "Approval Level 1", order: 6, sla: 3 }, // 3 days
    {
      id: "approval-level-2",
      name: "Approval Level 2",
      order: 7,
      sla: 5,
      conditional: "estimatedCost > 50000",
    }, // 5 days, conditional
    {
      id: "approval-level-3",
      name: "Approval Level 3",
      order: 8,
      sla: 7,
      conditional: "estimatedCost > 150000",
    }, // 7 days, conditional
    { id: "final-approval", name: "Final Approval", order: 9, sla: 3 }, // 3 days
  ],
  eligibilityCriteria: [
    {
      id: "property-ownership",
      description: "Valid property ownership",
      rule: "ownershipStatus === 'Full Ownership' || ownershipStatus === 'Government Grant'",
    },
    {
      id: "property-age",
      description: "Property age requirement",
      rule: "(new Date().getFullYear() - yearOfConstruction) >= 10",
    },
    {
      id: "structural-need",
      description: "Demonstrated structural need",
      rule: "structuralCondition === 'Poor' || structuralCondition === 'Critical' || foundationStatus === 'Major Issues' || foundationStatus === 'Critical'",
    },
    {
      id: "database-verification",
      description: "Government database verification",
      rule: "governmentDatabaseVerified === true",
    },
  ],
  integrations: [
    {
      id: "property-database",
      name: "Government Property Database",
      endpoint: "/api/adha/property-verification",
      required: true,
    },
  ],
};

// Cash Client specific form metadata
export const cashClientAssessmentForm = {
  id: "cash-assessment-form",
  name: "Cash Client Assessment Form",
  description: "Assessment form for Cash clients",
  clientTypeId: 3, // Cash
  sections: [
    {
      id: "personal-info",
      title: "Personal Information",
      fields: [
        { id: "fullName", label: "Full Name", type: "text", required: true },
        {
          id: "emiratesId",
          label: "Emirates ID",
          type: "text",
          required: true,
        },
        {
          id: "dateOfBirth",
          label: "Date of Birth",
          type: "date",
          required: true,
        },
        {
          id: "gender",
          label: "Gender",
          type: "select",
          options: ["Male", "Female"],
          required: true,
        },
        {
          id: "contactNumber",
          label: "Contact Number",
          type: "text",
          required: true,
        },
        { id: "email", label: "Email", type: "email", required: true },
      ],
    },
    {
      id: "address",
      title: "Address",
      fields: [
        {
          id: "emirate",
          label: "Emirate",
          type: "select",
          options: [
            "Abu Dhabi",
            "Dubai",
            "Sharjah",
            "Ajman",
            "Umm Al Quwain",
            "Fujairah",
            "Ras Al Khaimah",
          ],
          required: true,
        },
        { id: "area", label: "Area", type: "text", required: true },
        { id: "street", label: "Street", type: "text", required: true },
        {
          id: "buildingVilla",
          label: "Building/Villa",
          type: "text",
          required: true,
        },
      ],
    },
    {
      id: "service-requirements",
      title: "Service Requirements",
      fields: [
        {
          id: "serviceType",
          label: "Service Type",
          type: "select",
          options: [
            "Basic Assessment",
            "Room Modification",
            "Full Home Assessment",
            "Specific Adaptation",
          ],
          required: true,
        },
        {
          id: "specificRequirements",
          label: "Specific Requirements",
          type: "textarea",
          required: true,
        },
        {
          id: "budgetRange",
          label: "Budget Range (AED)",
          type: "select",
          options: [
            "Up to 10,000",
            "10,001-25,000",
            "25,001-50,000",
            "50,001-100,000",
            "Above 100,000",
          ],
          required: true,
        },
      ],
    },
    {
      id: "payment-details",
      title: "Payment Details",
      fields: [
        {
          id: "paymentMethod",
          label: "Payment Method",
          type: "select",
          options: ["Credit Card", "Bank Transfer", "Cheque", "Cash"],
          required: true,
        },
        {
          id: "depositAmount",
          label: "Deposit Amount (AED)",
          type: "number",
          required: true,
        },
        {
          id: "installmentPreference",
          label: "Installment Preference",
          type: "select",
          options: [
            "Full Payment",
            "2 Installments",
            "3 Installments",
            "4 Installments",
          ],
          required: true,
        },
        {
          id: "paymentNotes",
          label: "Payment Notes",
          type: "textarea",
          required: false,
        },
      ],
    },
    {
      id: "invoice-details",
      title: "Invoice Details",
      fields: [
        {
          id: "invoiceName",
          label: "Name on Invoice",
          type: "text",
          required: true,
        },
        {
          id: "taxRegistrationNumber",
          label: "Tax Registration Number (if applicable)",
          type: "text",
          required: false,
        },
        {
          id: "billingAddress",
          label: "Billing Address",
          type: "textarea",
          required: true,
        },
        {
          id: "additionalInvoiceNotes",
          label: "Additional Invoice Notes",
          type: "textarea",
          required: false,
        },
      ],
    },
  ],
  workflowSteps: [
    { id: "initial-inquiry", name: "Initial Inquiry", order: 1, sla: 1 }, // 1 day
    { id: "service-quotation", name: "Service Quotation", order: 2, sla: 2 }, // 2 days
    { id: "deposit-payment", name: "Deposit Payment", order: 3, sla: 3 }, // 3 days
    {
      id: "assessment-scheduling",
      name: "Assessment Scheduling",
      order: 4,
      sla: 2,
    }, // 2 days
    {
      id: "assessment-completion",
      name: "Assessment Completion",
      order: 5,
      sla: 5,
    }, // 5 days
    { id: "final-quotation", name: "Final Quotation", order: 6, sla: 2 }, // 2 days
    { id: "payment-processing", name: "Payment Processing", order: 7, sla: 3 }, // 3 days
    { id: "invoice-generation", name: "Invoice Generation", order: 8, sla: 1 }, // 1 day
    { id: "service-delivery", name: "Service Delivery", order: 9, sla: 10 }, // 10 days
  ],
  paymentScheduleRules: [
    {
      installmentType: "Full Payment",
      schedule: [{ percentage: 100, timing: "Upon Approval" }],
    },
    {
      installmentType: "2 Installments",
      schedule: [
        { percentage: 50, timing: "Upon Approval" },
        { percentage: 50, timing: "Upon Completion" },
      ],
    },
    {
      installmentType: "3 Installments",
      schedule: [
        { percentage: 40, timing: "Upon Approval" },
        { percentage: 30, timing: "Mid-Project" },
        { percentage: 30, timing: "Upon Completion" },
      ],
    },
    {
      installmentType: "4 Installments",
      schedule: [
        { percentage: 25, timing: "Upon Approval" },
        { percentage: 25, timing: "Stage 1" },
        { percentage: 25, timing: "Stage 2" },
        { percentage: 25, timing: "Upon Completion" },
      ],
    },
  ],
  scopeOptions: [
    {
      budgetRange: "Up to 10,000",
      availableServices: ["Basic Assessment", "Specific Adaptation"],
    },
    {
      budgetRange: "10,001-25,000",
      availableServices: [
        "Basic Assessment",
        "Specific Adaptation",
        "Room Modification",
      ],
    },
    {
      budgetRange: "25,001-50,000",
      availableServices: [
        "Basic Assessment",
        "Specific Adaptation",
        "Room Modification",
      ],
    },
    {
      budgetRange: "50,001-100,000",
      availableServices: [
        "Basic Assessment",
        "Specific Adaptation",
        "Room Modification",
        "Full Home Assessment",
      ],
    },
    {
      budgetRange: "Above 100,000",
      availableServices: [
        "Basic Assessment",
        "Specific Adaptation",
        "Room Modification",
        "Full Home Assessment",
      ],
    },
  ],
};

// Register all client-specific forms
registerFormMetadata(fdfAssessmentForm);
registerFormMetadata(adhaAssessmentForm);
registerFormMetadata(cashClientAssessmentForm);
