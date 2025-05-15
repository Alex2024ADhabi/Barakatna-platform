// Seed data for Barakatna Platform database
// This file provides initial data for development and testing

import * as DB from "@/types/database";

// Client Types
export const clientTypes: Partial<DB.ClientType>[] = [
  {
    typeCode: "FDF",
    typeNameEN: "Family Development Foundation",
    typeNameAR: "مؤسسة تنمية الأسرة",
    description: "Services provided through the Family Development Foundation",
    isActive: true,
  },
  {
    typeCode: "ADHA",
    typeNameEN: "Abu Dhabi Housing Authority",
    typeNameAR: "هيئة أبوظبي للإسكان",
    description: "Services provided through the Abu Dhabi Housing Authority",
    isActive: true,
  },
  {
    typeCode: "CASH",
    typeNameEN: "Cash Client",
    typeNameAR: "عميل نقدي",
    description: "Services paid directly by the client",
    isActive: true,
  },
];

// Status values
export const statuses: Partial<DB.Status>[] = [
  // Assessment Statuses
  {
    statusCode: "ASSESSMENT_DRAFT",
    statusNameEN: "Draft",
    statusNameAR: "مسودة",
    statusCategory: "Assessment",
    orderSequence: 1,
    isActive: true,
  },
  {
    statusCode: "ASSESSMENT_IN_PROGRESS",
    statusNameEN: "In Progress",
    statusNameAR: "قيد التنفيذ",
    statusCategory: "Assessment",
    orderSequence: 2,
    isActive: true,
  },
  {
    statusCode: "ASSESSMENT_COMPLETED",
    statusNameEN: "Completed",
    statusNameAR: "مكتمل",
    statusCategory: "Assessment",
    orderSequence: 3,
    isActive: true,
  },
  {
    statusCode: "ASSESSMENT_APPROVED",
    statusNameEN: "Approved",
    statusNameAR: "معتمد",
    statusCategory: "Assessment",
    orderSequence: 4,
    isActive: true,
  },
  {
    statusCode: "ASSESSMENT_REJECTED",
    statusNameEN: "Rejected",
    statusNameAR: "مرفوض",
    statusCategory: "Assessment",
    orderSequence: 5,
    isActive: true,
  },

  // Project Statuses
  {
    statusCode: "PROJECT_PLANNING",
    statusNameEN: "Planning",
    statusNameAR: "التخطيط",
    statusCategory: "Project",
    orderSequence: 1,
    isActive: true,
  },
  {
    statusCode: "PROJECT_APPROVAL",
    statusNameEN: "Pending Approval",
    statusNameAR: "في انتظار الموافقة",
    statusCategory: "Project",
    orderSequence: 2,
    isActive: true,
  },
  {
    statusCode: "PROJECT_EXECUTION",
    statusNameEN: "In Execution",
    statusNameAR: "قيد التنفيذ",
    statusCategory: "Project",
    orderSequence: 3,
    isActive: true,
  },
  {
    statusCode: "PROJECT_COMPLETED",
    statusNameEN: "Completed",
    statusNameAR: "مكتمل",
    statusCategory: "Project",
    orderSequence: 4,
    isActive: true,
  },

  // Beneficiary Statuses
  {
    statusCode: "BENEFICIARY_ACTIVE",
    statusNameEN: "Active",
    statusNameAR: "نشط",
    statusCategory: "Beneficiary",
    orderSequence: 1,
    isActive: true,
  },
  {
    statusCode: "BENEFICIARY_PENDING",
    statusNameEN: "Pending",
    statusNameAR: "قيد الانتظار",
    statusCategory: "Beneficiary",
    orderSequence: 2,
    isActive: true,
  },
  {
    statusCode: "BENEFICIARY_COMPLETED",
    statusNameEN: "Completed",
    statusNameAR: "مكتمل",
    statusCategory: "Beneficiary",
    orderSequence: 3,
    isActive: true,
  },
];

// Room Types
export const roomTypes: Partial<DB.RoomType>[] = [
  {
    roomTypeCode: "BATHROOM",
    roomTypeNameEN: "Bathroom",
    roomTypeNameAR: "الحمام",
    isActive: true,
  },
  {
    roomTypeCode: "BEDROOM",
    roomTypeNameEN: "Bedroom",
    roomTypeNameAR: "غرفة النوم",
    isActive: true,
  },
  {
    roomTypeCode: "KITCHEN",
    roomTypeNameEN: "Kitchen",
    roomTypeNameAR: "المطبخ",
    isActive: true,
  },
  {
    roomTypeCode: "LIVING_ROOM",
    roomTypeNameEN: "Living Room",
    roomTypeNameAR: "غرفة المعيشة",
    isActive: true,
  },
  {
    roomTypeCode: "ENTRANCE",
    roomTypeNameEN: "Entrance",
    roomTypeNameAR: "المدخل",
    isActive: true,
  },
];

// Measurement Types
export const measurementTypes: Partial<DB.MeasurementType>[] = [
  {
    typeCode: "DOOR_WIDTH",
    typeNameEN: "Door Width",
    typeNameAR: "عرض الباب",
    defaultUnitOfMeasure: "inches",
    standardValue: 32,
    minValue: 30,
    maxValue: 36,
    isActive: true,
  },
  {
    typeCode: "COUNTER_HEIGHT",
    typeNameEN: "Counter Height",
    typeNameAR: "ارتفاع المنضدة",
    defaultUnitOfMeasure: "inches",
    standardValue: 36,
    minValue: 34,
    maxValue: 38,
    isActive: true,
  },
  {
    typeCode: "GRAB_BAR_HEIGHT",
    typeNameEN: "Grab Bar Height",
    typeNameAR: "ارتفاع قضيب المسك",
    defaultUnitOfMeasure: "inches",
    standardValue: 34,
    minValue: 33,
    maxValue: 36,
    isActive: true,
  },
  {
    typeCode: "TOILET_HEIGHT",
    typeNameEN: "Toilet Height",
    typeNameAR: "ارتفاع المرحاض",
    defaultUnitOfMeasure: "inches",
    standardValue: 17,
    minValue: 17,
    maxValue: 19,
    isActive: true,
  },
  {
    typeCode: "SHOWER_SIZE",
    typeNameEN: "Shower Size",
    typeNameAR: "حجم الدش",
    defaultUnitOfMeasure: "inches",
    standardValue: 36,
    minValue: 36,
    maxValue: 60,
    isActive: true,
  },
];

// Recommendation Types
export const recommendationTypes: Partial<DB.RecommendationType>[] = [
  {
    typeCode: "GRAB_BAR",
    typeNameEN: "Install Grab Bars",
    typeNameAR: "تركيب قضبان المسك",
    isActive: true,
  },
  {
    typeCode: "RAMP",
    typeNameEN: "Install Ramp",
    typeNameAR: "تركيب منحدر",
    isActive: true,
  },
  {
    typeCode: "WIDEN_DOOR",
    typeNameEN: "Widen Doorway",
    typeNameAR: "توسيع المدخل",
    isActive: true,
  },
  {
    typeCode: "LOWER_COUNTER",
    typeNameEN: "Lower Counter",
    typeNameAR: "خفض المنضدة",
    isActive: true,
  },
  {
    typeCode: "RAISE_TOILET",
    typeNameEN: "Raise Toilet",
    typeNameAR: "رفع المرحاض",
    isActive: true,
  },
  {
    typeCode: "WALK_IN_SHOWER",
    typeNameEN: "Install Walk-in Shower",
    typeNameAR: "تركيب دش مفتوح",
    isActive: true,
  },
  {
    typeCode: "LIGHTING",
    typeNameEN: "Improve Lighting",
    typeNameAR: "تحسين الإضاءة",
    isActive: true,
  },
  {
    typeCode: "FLOORING",
    typeNameEN: "Non-slip Flooring",
    typeNameAR: "أرضية مانعة للانزلاق",
    isActive: true,
  },
];

// Roles
export const roles: Partial<DB.Role>[] = [
  {
    roleCode: "ADMIN",
    roleNameEN: "Administrator",
    roleNameAR: "مدير النظام",
    isActive: true,
  },
  {
    roleCode: "ASSESSOR",
    roleNameEN: "Assessor",
    roleNameAR: "مقيم",
    isActive: true,
  },
  {
    roleCode: "PROJECT_MANAGER",
    roleNameEN: "Project Manager",
    roleNameAR: "مدير المشروع",
    isActive: true,
  },
  {
    roleCode: "COMMITTEE_MEMBER",
    roleNameEN: "Committee Member",
    roleNameAR: "عضو اللجنة",
    isActive: true,
  },
  {
    roleCode: "FINANCE_OFFICER",
    roleNameEN: "Finance Officer",
    roleNameAR: "مسؤول مالي",
    isActive: true,
  },
  {
    roleCode: "FIELD_WORKER",
    roleNameEN: "Field Worker",
    roleNameAR: "عامل ميداني",
    isActive: true,
  },
];
