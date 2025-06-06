import {
  ClientType,
  FieldType,
  FormMetadata,
  FormModule,
  FormPermission,
  ValidationRuleType,
} from "../types";
import { formRegistry } from "../registry";

/**
 * Mental Health Assessment Form (F03.3)
 * Used to evaluate mental health status and identify support needs
 */
export const mentalHealthAssessmentForm: FormMetadata = {
  id: "mental-health-assessment-form",
  title: "Mental Health Assessment",
  description: "Evaluate mental health status and identify support needs",
  module: FormModule.ASSESSMENT,
  version: "1.0.0",
  permissions: {
    [FormPermission.VIEW]: [
      "admin",
      "manager",
      "assessment-specialist",
      "case-manager",
    ],
    [FormPermission.CREATE]: ["admin", "manager", "assessment-specialist"],
    [FormPermission.EDIT]: ["admin", "manager", "assessment-specialist"],
    [FormPermission.DELETE]: ["admin"],
    [FormPermission.APPROVE]: ["admin", "manager"],
    [FormPermission.REJECT]: ["admin", "manager"],
    [FormPermission.SUBMIT]: ["admin", "manager", "assessment-specialist"],
    [FormPermission.PRINT]: [
      "admin",
      "manager",
      "assessment-specialist",
      "case-manager",
    ],
    [FormPermission.EXPORT]: ["admin", "manager"],
  },
  clientTypes: [
    ClientType.FDF,
    ClientType.ADHA,
    ClientType.CASH,
    ClientType.OTHER,
  ],
  sections: [
    {
      id: "beneficiary-information",
      title: "Beneficiary Information",
      description: "Basic information about the beneficiary",
      order: 1,
      collapsible: false,
    },
    {
      id: "cognitive-assessment",
      title: "Cognitive Assessment",
      description: "Assessment of cognitive function and memory",
      order: 2,
      collapsible: false,
    },
    {
      id: "mood-assessment",
      title: "Mood Assessment",
      description: "Assessment of mood and emotional state",
      order: 3,
      collapsible: false,
    },
    {
      id: "social-support",
      title: "Social Support",
      description: "Assessment of social connections and support systems",
      order: 4,
      collapsible: true,
    },
    {
      id: "daily-functioning",
      title: "Daily Functioning",
      description: "Assessment of ability to perform daily activities",
      order: 5,
      collapsible: true,
    },
    {
      id: "risk-assessment",
      title: "Risk Assessment",
      description: "Assessment of potential risks and safety concerns",
      order: 6,
      collapsible: true,
    },
    {
      id: "recommendations",
      title: "Recommendations",
      description: "Support recommendations and interventions",
      order: 7,
      collapsible: false,
    },
    {
      id: "assessment-details",
      title: "Assessment Details",
      description: "Details about the assessment process",
      order: 8,
      collapsible: true,
    },
  ],
  fields: [
    {
      id: "assessment-id",
      name: "assessmentId",
      label: "Assessment ID",
      type: FieldType.TEXT,
      readOnly: true,
      required: false,
      section: "beneficiary-information",
      order: 1,
      width: "full",
      helpText: "Auto-generated unique identifier (Format: MHA-YYYY-NNNNN)",
      defaultValue: "",
    },
    {
      id: "beneficiary-id",
      name: "beneficiaryId",
      label: "Beneficiary",
      type: FieldType.LOOKUP,
      required: true,
      section: "beneficiary-information",
      order: 2,
      width: "full",
      dataSource: {
        type: "api",
        source: "/api/v1/beneficiaries",
        valueField: "id",
        labelField: "fullName",
        filters: { status: "active" },
      },
    },
    {
      id: "beneficiary-name",
      name: "beneficiaryName",
      label: "Beneficiary Name",
      type: FieldType.TEXT,
      readOnly: true,
      required: false,
      section: "beneficiary-information",
      order: 3,
      width: "half",
      dependencies: [
        {
          type: "value",
          sourceField: "beneficiaryId",
          condition: "!!value",
          action: "fetchBeneficiaryName(value)",
        },
      ],
    },
    {
      id: "assessment-date",
      name: "assessmentDate",
      label: "Assessment Date",
      type: FieldType.DATE,
      required: true,
      section: "beneficiary-information",
      order: 4,
      width: "half",
      defaultValue: new Date().toISOString().split("T")[0],
      validation: [
        {
          type: ValidationRuleType.CUSTOM,
          value: (value: string) => {
            const assessDate = new Date(value);
            const today = new Date();
            return assessDate <= today;
          },
          message: "Assessment date cannot be in the future",
        },
      ],
    },
    {
      id: "case-id",
      name: "caseId",
      label: "Case Reference",
      type: FieldType.TEXT,
      readOnly: true,
      required: false,
      section: "beneficiary-information",
      order: 5,
      width: "half",
      dependencies: [
        {
          type: "value",
          sourceField: "beneficiaryId",
          condition: "!!value",
          action: "fetchCaseId(value)",
        },
      ],
    },
    {
      id: "assessment-type",
      name: "assessmentType",
      label: "Assessment Type",
      type: FieldType.SELECT,
      required: true,
      section: "beneficiary-information",
      order: 6,
      width: "half",
      options: [
        { value: "Initial", label: "Initial" },
        { value: "Follow-up", label: "Follow-up" },
        { value: "Reassessment", label: "Reassessment" },
      ],
      defaultValue: "Initial",
    },
    {
      id: "orientation-assessment",
      name: "orientationAssessment",
      label: "Orientation Assessment",
      type: FieldType.SELECT,
      required: true,
      section: "cognitive-assessment",
      order: 1,
      width: "half",
      options: [
        { value: "Fully Oriented", label: "Fully Oriented" },
        { value: "Mild Disorientation", label: "Mild Disorientation" },
        { value: "Moderate Disorientation", label: "Moderate Disorientation" },
        { value: "Severe Disorientation", label: "Severe Disorientation" },
      ],
    },
    {
      id: "orientation-notes",
      name: "orientationNotes",
      label: "Orientation Notes",
      type: FieldType.TEXTAREA,
      placeholder: "Enter notes about orientation assessment",
      required: false,
      section: "cognitive-assessment",
      order: 2,
      width: "half",
      validation: [
        {
          type: ValidationRuleType.MAX_LENGTH,
          value: 300,
          message: "Notes cannot exceed 300 characters",
        },
      ],
    },
    {
      id: "memory-assessment",
      name: "memoryAssessment",
      label: "Memory Assessment",
      type: FieldType.SELECT,
      required: true,
      section: "cognitive-assessment",
      order: 3,
      width: "half",
      options: [
        { value: "Intact", label: "Intact" },
        { value: "Mild Impairment", label: "Mild Impairment" },
        { value: "Moderate Impairment", label: "Moderate Impairment" },
        { value: "Severe Impairment", label: "Severe Impairment" },
      ],
    },
    {
      id: "memory-notes",
      name: "memoryNotes",
      label: "Memory Notes",
      type: FieldType.TEXTAREA,
      placeholder: "Enter notes about memory assessment",
      required: false,
      section: "cognitive-assessment",
      order: 4,
      width: "half",
      validation: [
        {
          type: ValidationRuleType.MAX_LENGTH,
          value: 300,
          message: "Notes cannot exceed 300 characters",
        },
      ],
    },
    {
      id: "attention-concentration",
      name: "attentionConcentration",
      label: "Attention and Concentration",
      type: FieldType.SELECT,
      required: true,
      section: "cognitive-assessment",
      order: 5,
      width: "half",
      options: [
        { value: "Intact", label: "Intact" },
        { value: "Mild Difficulty", label: "Mild Difficulty" },
        { value: "Moderate Difficulty", label: "Moderate Difficulty" },
        { value: "Severe Difficulty", label: "Severe Difficulty" },
      ],
    },
    {
      id: "attention-concentration-notes",
      name: "attentionConcentrationNotes",
      label: "Attention and Concentration Notes",
      type: FieldType.TEXTAREA,
      placeholder: "Enter notes about attention and concentration",
      required: false,
      section: "cognitive-assessment",
      order: 6,
      width: "half",
      validation: [
        {
          type: ValidationRuleType.MAX_LENGTH,
          value: 300,
          message: "Notes cannot exceed 300 characters",
        },
      ],
    },
    {
      id: "mood-state",
      name: "moodState",
      label: "Current Mood State",
      type: FieldType.SELECT,
      required: true,
      section: "mood-assessment",
      order: 1,
      width: "half",
      options: [
        { value: "Euthymic", label: "Euthymic (Normal)" },
        { value: "Depressed", label: "Depressed" },
        { value: "Anxious", label: "Anxious" },
        { value: "Irritable", label: "Irritable" },
        { value: "Elevated", label: "Elevated" },
        { value: "Labile", label: "Labile (Fluctuating)" },
      ],
    },
    {
      id: "mood-notes",
      name: "moodNotes",
      label: "Mood Notes",
      type: FieldType.TEXTAREA,
      placeholder: "Enter notes about mood assessment",
      required: false,
      section: "mood-assessment",
      order: 2,
      width: "half",
      validation: [
        {
          type: ValidationRuleType.MAX_LENGTH,
          value: 300,
          message: "Notes cannot exceed 300 characters",
        },
      ],
    },
    {
      id: "depression-indicators",
      name: "depressionIndicators",
      label: "Depression Indicators",
      type: FieldType.MULTISELECT,
      required: true,
      section: "mood-assessment",
      order: 3,
      width: "full",
      options: [
        { value: "None", label: "None" },
        { value: "Depressed Mood", label: "Depressed Mood" },
        { value: "Loss of Interest", label: "Loss of Interest" },
        { value: "Sleep Disturbance", label: "Sleep Disturbance" },
        { value: "Fatigue", label: "Fatigue" },
        { value: "Appetite Changes", label: "Appetite Changes" },
        {
          value: "Feelings of Worthlessness",
          label: "Feelings of Worthlessness",
        },
        { value: "Concentration Problems", label: "Concentration Problems" },
        { value: "Psychomotor Changes", label: "Psychomotor Changes" },
        { value: "Suicidal Ideation", label: "Suicidal Ideation" },
      ],
    },
    {
      id: "anxiety-indicators",
      name: "anxietyIndicators",
      label: "Anxiety Indicators",
      type: FieldType.MULTISELECT,
      required: true,
      section: "mood-assessment",
      order: 4,
      width: "full",
      options: [
        { value: "None", label: "None" },
        { value: "Excessive Worry", label: "Excessive Worry" },
        { value: "Restlessness", label: "Restlessness" },
        { value: "Fatigue", label: "Fatigue" },
        { value: "Concentration Problems", label: "Concentration Problems" },
        { value: "Irritability", label: "Irritability" },
        { value: "Muscle Tension", label: "Muscle Tension" },
        { value: "Sleep Disturbance", label: "Sleep Disturbance" },
        { value: "Panic Attacks", label: "Panic Attacks" },
      ],
    },
    {
      id: "family-support",
      name: "familySupport",
      label: "Family Support",
      type: FieldType.SELECT,
      required: true,
      section: "social-support",
      order: 1,
      width: "half",
      options: [
        { value: "Strong", label: "Strong" },
        { value: "Moderate", label: "Moderate" },
        { value: "Limited", label: "Limited" },
        { value: "None", label: "None" },
      ],
    },
    {
      id: "family-support-notes",
      name: "familySupportNotes",
      label: "Family Support Notes",
      type: FieldType.TEXTAREA,
      placeholder: "Enter notes about family support",
      required: false,
      section: "social-support",
      order: 2,
      width: "half",
      validation: [
        {
          type: ValidationRuleType.MAX_LENGTH,
          value: 300,
          message: "Notes cannot exceed 300 characters",
        },
      ],
    },
    {
      id: "community-support",
      name: "communitySupport",
      label: "Community Support",
      type: FieldType.SELECT,
      required: true,
      section: "social-support",
      order: 3,
      width: "half",
      options: [
        { value: "Strong", label: "Strong" },
        { value: "Moderate", label: "Moderate" },
        { value: "Limited", label: "Limited" },
        { value: "None", label: "None" },
      ],
    },
    {
      id: "community-support-notes",
      name: "communitySupportNotes",
      label: "Community Support Notes",
      type: FieldType.TEXTAREA,
      placeholder: "Enter notes about community support",
      required: false,
      section: "social-support",
      order: 4,
      width: "half",
      validation: [
        {
          type: ValidationRuleType.MAX_LENGTH,
          value: 300,
          message: "Notes cannot exceed 300 characters",
        },
      ],
    },
    {
      id: "social-isolation",
      name: "socialIsolation",
      label: "Social Isolation",
      type: FieldType.SELECT,
      required: true,
      section: "social-support",
      order: 5,
      width: "half",
      options: [
        { value: "None", label: "None" },
        { value: "Mild", label: "Mild" },
        { value: "Moderate", label: "Moderate" },
        { value: "Severe", label: "Severe" },
      ],
    },
    {
      id: "social-isolation-notes",
      name: "socialIsolationNotes",
      label: "Social Isolation Notes",
      type: FieldType.TEXTAREA,
      placeholder: "Enter notes about social isolation",
      required: false,
      section: "social-support",
      order: 6,
      width: "half",
      validation: [
        {
          type: ValidationRuleType.MAX_LENGTH,
          value: 300,
          message: "Notes cannot exceed 300 characters",
        },
      ],
    },
    {
      id: "adl-assessment",
      name: "adlAssessment",
      label: "Activities of Daily Living",
      type: FieldType.SELECT,
      required: true,
      section: "daily-functioning",
      order: 1,
      width: "half",
      options: [
        { value: "Independent", label: "Independent" },
        { value: "Minimal Assistance", label: "Minimal Assistance" },
        { value: "Moderate Assistance", label: "Moderate Assistance" },
        { value: "Maximum Assistance", label: "Maximum Assistance" },
        { value: "Dependent", label: "Dependent" },
      ],
    },
    {
      id: "adl-notes",
      name: "adlNotes",
      label: "ADL Notes",
      type: FieldType.TEXTAREA,
      placeholder: "Enter notes about activities of daily living",
      required: false,
      section: "daily-functioning",
      order: 2,
      width: "half",
      validation: [
        {
          type: ValidationRuleType.MAX_LENGTH,
          value: 300,
          message: "Notes cannot exceed 300 characters",
        },
      ],
    },
    {
      id: "iadl-assessment",
      name: "iadlAssessment",
      label: "Instrumental Activities of Daily Living",
      type: FieldType.SELECT,
      required: true,
      section: "daily-functioning",
      order: 3,
      width: "half",
      options: [
        { value: "Independent", label: "Independent" },
        { value: "Minimal Assistance", label: "Minimal Assistance" },
        { value: "Moderate Assistance", label: "Moderate Assistance" },
        { value: "Maximum Assistance", label: "Maximum Assistance" },
        { value: "Dependent", label: "Dependent" },
      ],
    },
    {
      id: "iadl-notes",
      name: "iadlNotes",
      label: "IADL Notes",
      type: FieldType.TEXTAREA,
      placeholder: "Enter notes about instrumental activities of daily living",
      required: false,
      section: "daily-functioning",
      order: 4,
      width: "half",
      validation: [
        {
          type: ValidationRuleType.MAX_LENGTH,
          value: 300,
          message: "Notes cannot exceed 300 characters",
        },
      ],
    },
    {
      id: "medication-management",
      name: "medicationManagement",
      label: "Medication Management",
      type: FieldType.SELECT,
      required: true,
      section: "daily-functioning",
      order: 5,
      width: "half",
      options: [
        { value: "Independent", label: "Independent" },
        { value: "Needs Reminders", label: "Needs Reminders" },
        { value: "Needs Assistance", label: "Needs Assistance" },
        { value: "Completely Dependent", label: "Completely Dependent" },
      ],
    },
    {
      id: "medication-management-notes",
      name: "medicationManagementNotes",
      label: "Medication Management Notes",
      type: FieldType.TEXTAREA,
      placeholder: "Enter notes about medication management",
      required: false,
      section: "daily-functioning",
      order: 6,
      width: "half",
      validation: [
        {
          type: ValidationRuleType.MAX_LENGTH,
          value: 300,
          message: "Notes cannot exceed 300 characters",
        },
      ],
    },
    {
      id: "suicide-risk",
      name: "suicideRisk",
      label: "Suicide Risk",
      type: FieldType.SELECT,
      required: true,
      section: "risk-assessment",
      order: 1,
      width: "half",
      options: [
        { value: "None", label: "None" },
        { value: "Low", label: "Low" },
        { value: "Moderate", label: "Moderate" },
        { value: "High", label: "High" },
      ],
    },
    {
      id: "suicide-risk-notes",
      name: "suicideRiskNotes",
      label: "Suicide Risk Notes",
      type: FieldType.TEXTAREA,
      placeholder: "Enter notes about suicide risk",
      required: false,
      section: "risk-assessment",
      order: 2,
      width: "half",
      validation: [
        {
          type: ValidationRuleType.MAX_LENGTH,
          value: 300,
          message: "Notes cannot exceed 300 characters",
        },
      ],
    },
    {
      id: "self-neglect-risk",
      name: "selfNeglectRisk",
      label: "Self-Neglect Risk",
      type: FieldType.SELECT,
      required: true,
      section: "risk-assessment",
      order: 3,
      width: "half",
      options: [
        { value: "None", label: "None" },
        { value: "Low", label: "Low" },
        { value: "Moderate", label: "Moderate" },
        { value: "High", label: "High" },
      ],
    },
    {
      id: "self-neglect-risk-notes",
      name: "selfNeglectRiskNotes",
      label: "Self-Neglect Risk Notes",
      type: FieldType.TEXTAREA,
      placeholder: "Enter notes about self-neglect risk",
      required: false,
      section: "risk-assessment",
      order: 4,
      width: "half",
      validation: [
        {
          type: ValidationRuleType.MAX_LENGTH,
          value: 300,
          message: "Notes cannot exceed 300 characters",
        },
      ],
    },
    {
      id: "wandering-risk",
      name: "wanderingRisk",
      label: "Wandering Risk",
      type: FieldType.SELECT,
      required: true,
      section: "risk-assessment",
      order: 5,
      width: "half",
      options: [
        { value: "None", label: "None" },
        { value: "Low", label: "Low" },
        { value: "Moderate", label: "Moderate" },
        { value: "High", label: "High" },
      ],
    },
    {
      id: "wandering-risk-notes",
      name: "wanderingRiskNotes",
      label: "Wandering Risk Notes",
      type: FieldType.TEXTAREA,
      placeholder: "Enter notes about wandering risk",
      required: false,
      section: "risk-assessment",
      order: 6,
      width: "half",
      validation: [
        {
          type: ValidationRuleType.MAX_LENGTH,
          value: 300,
          message: "Notes cannot exceed 300 characters",
        },
      ],
    },
    {
      id: "priority-concerns",
      name: "priorityConcerns",
      label: "Priority Mental Health Concerns",
      type: FieldType.MULTISELECT,
      required: true,
      section: "recommendations",
      order: 1,
      width: "full",
      options: [
        { value: "Cognitive Impairment", label: "Cognitive Impairment" },
        { value: "Depression", label: "Depression" },
        { value: "Anxiety", label: "Anxiety" },
        { value: "Social Isolation", label: "Social Isolation" },
        { value: "Self-Care Deficit", label: "Self-Care Deficit" },
        { value: "Medication Management", label: "Medication Management" },
        { value: "Safety Concerns", label: "Safety Concerns" },
        { value: "Caregiver Stress", label: "Caregiver Stress" },
        { value: "Other", label: "Other" },
      ],
    },
    {
      id: "intervention-urgency",
      name: "interventionUrgency",
      label: "Intervention Urgency",
      type: FieldType.SELECT,
      required: true,
      section: "recommendations",
      order: 2,
      width: "half",
      options: [
        { value: "Immediate", label: "Immediate" },
        { value: "High", label: "High" },
        { value: "Medium", label: "Medium" },
        { value: "Low", label: "Low" },
      ],
    },
    {
      id: "overall-mental-health-status",
      name: "overallMentalHealthStatus",
      label: "Overall Mental Health Status",
      type: FieldType.SELECT,
      required: true,
      section: "recommendations",
      order: 3,
      width: "half",
      options: [
        { value: "Good", label: "Good" },
        { value: "Fair", label: "Fair" },
        { value: "Poor", label: "Poor" },
        { value: "Critical", label: "Critical" },
      ],
    },
    {
      id: "recommended-interventions",
      name: "recommendedInterventions",
      label: "Recommended Interventions",
      type: FieldType.TEXTAREA,
      placeholder: "Enter detailed recommendations for mental health support",
      required: true,
      section: "recommendations",
      order: 4,
      width: "full",
      validation: [
        {
          type: ValidationRuleType.REQUIRED,
          message: "Recommended interventions are required",
        },
        {
          type: ValidationRuleType.MIN_LENGTH,
          value: 50,
          message: "Recommendations must be at least 50 characters",
        },
        {
          type: ValidationRuleType.MAX_LENGTH,
          value: 1000,
          message: "Recommendations cannot exceed 1000 characters",
        },
      ],
    },
    {
      id: "referrals-needed",
      name: "referralsNeeded",
      label: "Referrals Needed",
      type: FieldType.MULTISELECT,
      required: true,
      section: "recommendations",
      order: 5,
      width: "full",
      options: [
        { value: "None", label: "None" },
        { value: "Psychiatrist", label: "Psychiatrist" },
        { value: "Psychologist", label: "Psychologist" },
        { value: "Social Worker", label: "Social Worker" },
        { value: "Counselor", label: "Counselor" },
        { value: "Support Group", label: "Support Group" },
        { value: "Day Program", label: "Day Program" },
        { value: "Home Health", label: "Home Health" },
        { value: "Other", label: "Other" },
      ],
    },
    {
      id: "assessor-name",
      name: "assessorName",
      label: "Assessor Name",
      type: FieldType.TEXT,
      required: true,
      section: "assessment-details",
      order: 1,
      width: "half",
      defaultValue: "", // Will be populated with current user name
      validation: [
        {
          type: ValidationRuleType.REQUIRED,
          message: "Assessor name is required",
        },
        {
          type: ValidationRuleType.MIN_LENGTH,
          value: 3,
          message: "Assessor name must be at least 3 characters",
        },
      ],
    },
    {
      id: "assessor-position",
      name: "assessorPosition",
      label: "Assessor Position",
      type: FieldType.TEXT,
      required: true,
      section: "assessment-details",
      order: 2,
      width: "half",
      defaultValue: "", // Will be populated with current user position
      validation: [
        {
          type: ValidationRuleType.REQUIRED,
          message: "Assessor position is required",
        },
        {
          type: ValidationRuleType.MIN_LENGTH,
          value: 3,
          message: "Assessor position must be at least 3 characters",
        },
      ],
    },
    {
      id: "assessment-duration",
      name: "assessmentDuration",
      label: "Assessment Duration (minutes)",
      type: FieldType.NUMBER,
      required: true,
      section: "assessment-details",
      order: 3,
      width: "half",
      defaultValue: 60,
      validation: [
        {
          type: ValidationRuleType.MIN_VALUE,
          value: 1,
          message: "Assessment duration must be at least 1 minute",
        },
      ],
    },
    {
      id: "follow-up-required",
      name: "followUpRequired",
      label: "Follow-up Required",
      type: FieldType.CHECKBOX,
      required: true,
      section: "assessment-details",
      order: 4,
      width: "half",
      defaultValue: false,
    },
    {
      id: "follow-up-date",
      name: "followUpDate",
      label: "Follow-up Date",
      type: FieldType.DATE,
      required: false,
      section: "assessment-details",
      order: 5,
      width: "half",
      dependencies: [
        {
          type: "requirement",
          sourceField: "followUpRequired",
          condition: "value === true",
          action: "required = true",
        },
        {
          type: "visibility",
          sourceField: "followUpRequired",
          condition: "value === true",
          action: "visible = true",
        },
      ],
      validation: [
        {
          type: ValidationRuleType.CUSTOM,
          value: (value: string) => {
            if (!value) return true;
            const followUpDate = new Date(value);
            const today = new Date();
            return followUpDate > today;
          },
          message: "Follow-up date must be in the future",
        },
      ],
    },
    {
      id: "additional-notes",
      name: "additionalNotes",
      label: "Additional Notes",
      type: FieldType.TEXTAREA,
      placeholder: "Enter any additional notes about the assessment",
      required: false,
      section: "assessment-details",
      order: 6,
      width: "full",
      validation: [
        {
          type: ValidationRuleType.MAX_LENGTH,
          value: 1000,
          message: "Additional notes cannot exceed 1000 characters",
        },
      ],
    },
  ],
  dependencies: [
    {
      formId: "beneficiary-assessment-eligibility-form",
      description:
        "Mental health assessment must be linked to an eligible beneficiary",
      type: "prerequisite",
      required: true,
    },
  ],
  createdAt: new Date(),
  updatedAt: new Date(),
  isActive: true,
};

// Register form with the form registry
formRegistry.registerForm(
  {
    id: mentalHealthAssessmentForm.id,
    title: mentalHealthAssessmentForm.title,
    description: mentalHealthAssessmentForm.description,
    module: FormModule.ASSESSMENT,
    clientTypes: mentalHealthAssessmentForm.clientTypes,
    permissions: mentalHealthAssessmentForm.permissions,
    dependencies: mentalHealthAssessmentForm.dependencies,
    version: mentalHealthAssessmentForm.version,
    path: "/assessment/mental-health",
    icon: "brain",
    isActive: true,
  },
  mentalHealthAssessmentForm,
);
