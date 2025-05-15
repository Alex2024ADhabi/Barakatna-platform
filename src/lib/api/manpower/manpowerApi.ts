import {
  ManpowerResource,
  Availability,
  ResourceAllocation,
  Timesheet,
  SkillMatrix,
  ResourceUtilizationReport,
  ResourceForecast,
} from "./types";

// Mock data for manpower resources
const mockManpowerResources: ManpowerResource[] = [
  {
    id: "1",
    name: "Ahmed Al-Mansouri",
    role: "Senior Engineer",
    department: "Engineering",
    skills: [
      {
        id: "1",
        name: "Structural Analysis",
        proficiencyLevel: "expert",
        certifications: ["PE"],
      },
      { id: "2", name: "AutoCAD", proficiencyLevel: "advanced" },
      { id: "3", name: "Project Management", proficiencyLevel: "intermediate" },
    ],
    availability: [
      {
        id: "1",
        resourceId: "1",
        startDate: new Date(2023, 5, 1),
        endDate: new Date(2023, 5, 15),
        availabilityType: "project",
        projectId: "P001",
      },
    ],
    utilization: 85,
    isContractor: false,
    hourlyRate: 75,
    timesheets: [],
  },
  {
    id: "2",
    name: "Fatima Al-Zahra",
    role: "Project Manager",
    department: "Project Management",
    skills: [
      {
        id: "3",
        name: "Project Management",
        proficiencyLevel: "expert",
        certifications: ["PMP"],
      },
      { id: "4", name: "Risk Assessment", proficiencyLevel: "advanced" },
      { id: "5", name: "Stakeholder Management", proficiencyLevel: "expert" },
    ],
    availability: [
      {
        id: "2",
        resourceId: "2",
        startDate: new Date(2023, 5, 10),
        endDate: new Date(2023, 5, 12),
        availabilityType: "vacation",
      },
    ],
    utilization: 90,
    isContractor: false,
    hourlyRate: 85,
    timesheets: [],
  },
  {
    id: "3",
    name: "Mohammed Al-Harbi",
    role: "Accessibility Specialist",
    department: "Design",
    skills: [
      { id: "6", name: "Accessibility Standards", proficiencyLevel: "expert" },
      { id: "7", name: "Home Modification", proficiencyLevel: "expert" },
      { id: "8", name: "Client Assessment", proficiencyLevel: "advanced" },
    ],
    availability: [],
    utilization: 75,
    isContractor: true,
    contractorDetails: {
      companyName: "AccessAbility Consultants",
      contractStartDate: new Date(2023, 1, 1),
      contractEndDate: new Date(2023, 12, 31),
      contractNumber: "C2023-045",
      contactPerson: "Saeed Al-Qahtani",
      contactEmail: "saeed@accessability.com",
      contactPhone: "+971-55-123-4567",
    },
    hourlyRate: 95,
    timesheets: [],
  },
  {
    id: "4",
    name: "Layla Mahmoud",
    role: "Healthcare Specialist",
    department: "Healthcare",
    skills: [
      {
        id: "9",
        name: "Geriatric Care",
        proficiencyLevel: "expert",
        certifications: ["RN"],
      },
      { id: "10", name: "Home Healthcare", proficiencyLevel: "advanced" },
      { id: "11", name: "Patient Assessment", proficiencyLevel: "expert" },
    ],
    availability: [
      {
        id: "3",
        resourceId: "4",
        startDate: new Date(2023, 5, 5),
        endDate: new Date(2023, 5, 20),
        availabilityType: "project",
        projectId: "P002",
      },
    ],
    utilization: 95,
    isContractor: false,
    hourlyRate: 80,
    timesheets: [],
  },
  {
    id: "5",
    name: "Khalid Al-Saud",
    role: "Construction Manager",
    department: "Construction",
    skills: [
      { id: "12", name: "Construction Management", proficiencyLevel: "expert" },
      { id: "13", name: "Building Codes", proficiencyLevel: "advanced" },
      { id: "14", name: "Quality Control", proficiencyLevel: "intermediate" },
    ],
    availability: [],
    utilization: 80,
    isContractor: false,
    hourlyRate: 70,
    timesheets: [],
  },
];

// Mock resource allocations
const mockResourceAllocations: ResourceAllocation[] = [
  {
    id: "1",
    resourceId: "1",
    projectId: "P001",
    role: "Lead Engineer",
    startDate: new Date(2023, 5, 1),
    endDate: new Date(2023, 5, 15),
    hoursPerDay: 6,
    allocationPercentage: 75,
    status: "active",
  },
  {
    id: "2",
    resourceId: "2",
    projectId: "P001",
    role: "Project Manager",
    startDate: new Date(2023, 5, 1),
    endDate: new Date(2023, 6, 30),
    hoursPerDay: 4,
    allocationPercentage: 50,
    status: "active",
  },
  {
    id: "3",
    resourceId: "4",
    projectId: "P002",
    role: "Healthcare Consultant",
    startDate: new Date(2023, 5, 5),
    endDate: new Date(2023, 5, 20),
    hoursPerDay: 8,
    allocationPercentage: 100,
    status: "active",
  },
];

// Mock skill matrix
const mockSkillMatrix: SkillMatrix = {
  departmentId: "all",
  skills: [
    {
      skillId: "1",
      skillName: "Structural Analysis",
      resourceCounts: {
        beginner: 2,
        intermediate: 3,
        advanced: 1,
        expert: 1,
      },
    },
    {
      skillId: "6",
      skillName: "Accessibility Standards",
      resourceCounts: {
        beginner: 1,
        intermediate: 2,
        advanced: 3,
        expert: 1,
      },
    },
    {
      skillId: "9",
      skillName: "Geriatric Care",
      resourceCounts: {
        beginner: 0,
        intermediate: 1,
        advanced: 2,
        expert: 1,
      },
    },
  ],
};

// Mock resource utilization report
const mockUtilizationReport: ResourceUtilizationReport = {
  period: "2023-Q2",
  resources: [
    {
      resourceId: "1",
      resourceName: "Ahmed Al-Mansouri",
      billableHours: 320,
      nonBillableHours: 40,
      utilization: 85,
    },
    {
      resourceId: "2",
      resourceName: "Fatima Al-Zahra",
      billableHours: 340,
      nonBillableHours: 20,
      utilization: 90,
    },
    {
      resourceId: "3",
      resourceName: "Mohammed Al-Harbi",
      billableHours: 280,
      nonBillableHours: 80,
      utilization: 75,
    },
    {
      resourceId: "4",
      resourceName: "Layla Mahmoud",
      billableHours: 360,
      nonBillableHours: 20,
      utilization: 95,
    },
    {
      resourceId: "5",
      resourceName: "Khalid Al-Saud",
      billableHours: 300,
      nonBillableHours: 60,
      utilization: 80,
    },
  ],
  averageUtilization: 85,
};

// Mock resource forecast
const mockResourceForecast: ResourceForecast[] = [
  {
    id: "1",
    departmentId: "Engineering",
    period: "2023-Q3",
    requiredResources: 8,
    availableResources: 6,
    gap: -2,
    plannedHiring: 2,
    notes: "Need to hire 2 structural engineers by August",
  },
  {
    id: "2",
    departmentId: "Healthcare",
    period: "2023-Q3",
    requiredResources: 5,
    availableResources: 4,
    gap: -1,
    plannedHiring: 1,
    notes: "Looking for experienced geriatric specialist",
  },
  {
    id: "3",
    departmentId: "Construction",
    period: "2023-Q3",
    requiredResources: 10,
    availableResources: 12,
    gap: 2,
    plannedHiring: 0,
    notes: "Consider reassigning excess resources to other departments",
  },
];

// API functions
export const manpowerApi = {
  // Resource management
  getResources: async (): Promise<ManpowerResource[]> => {
    return Promise.resolve(mockManpowerResources);
  },

  getResourceById: async (
    id: string,
  ): Promise<ManpowerResource | undefined> => {
    return Promise.resolve(
      mockManpowerResources.find((resource) => resource.id === id),
    );
  },

  createResource: async (
    resource: Omit<ManpowerResource, "id">,
  ): Promise<ManpowerResource> => {
    const newResource = {
      ...resource,
      id: `${mockManpowerResources.length + 1}`,
    };
    mockManpowerResources.push(newResource);
    return Promise.resolve(newResource);
  },

  updateResource: async (
    id: string,
    resource: Partial<ManpowerResource>,
  ): Promise<ManpowerResource | undefined> => {
    const index = mockManpowerResources.findIndex((r) => r.id === id);
    if (index !== -1) {
      mockManpowerResources[index] = {
        ...mockManpowerResources[index],
        ...resource,
      };
      return Promise.resolve(mockManpowerResources[index]);
    }
    return Promise.resolve(undefined);
  },

  deleteResource: async (id: string): Promise<boolean> => {
    const index = mockManpowerResources.findIndex((r) => r.id === id);
    if (index !== -1) {
      mockManpowerResources.splice(index, 1);
      return Promise.resolve(true);
    }
    return Promise.resolve(false);
  },

  // Resource allocation
  getAllocations: async (): Promise<ResourceAllocation[]> => {
    return Promise.resolve(mockResourceAllocations);
  },

  getAllocationsByResourceId: async (
    resourceId: string,
  ): Promise<ResourceAllocation[]> => {
    return Promise.resolve(
      mockResourceAllocations.filter(
        (allocation) => allocation.resourceId === resourceId,
      ),
    );
  },

  getAllocationsByProjectId: async (
    projectId: string,
  ): Promise<ResourceAllocation[]> => {
    return Promise.resolve(
      mockResourceAllocations.filter(
        (allocation) => allocation.projectId === projectId,
      ),
    );
  },

  createAllocation: async (
    allocation: Omit<ResourceAllocation, "id">,
  ): Promise<ResourceAllocation> => {
    const newAllocation = {
      ...allocation,
      id: `${mockResourceAllocations.length + 1}`,
    };
    mockResourceAllocations.push(newAllocation);
    return Promise.resolve(newAllocation);
  },

  updateAllocation: async (
    id: string,
    allocation: Partial<ResourceAllocation>,
  ): Promise<ResourceAllocation | undefined> => {
    const index = mockResourceAllocations.findIndex((a) => a.id === id);
    if (index !== -1) {
      mockResourceAllocations[index] = {
        ...mockResourceAllocations[index],
        ...allocation,
      };
      return Promise.resolve(mockResourceAllocations[index]);
    }
    return Promise.resolve(undefined);
  },

  deleteAllocation: async (id: string): Promise<boolean> => {
    const index = mockResourceAllocations.findIndex((a) => a.id === id);
    if (index !== -1) {
      mockResourceAllocations.splice(index, 1);
      return Promise.resolve(true);
    }
    return Promise.resolve(false);
  },

  // Skill matrix
  getSkillMatrix: async (departmentId?: string): Promise<SkillMatrix> => {
    return Promise.resolve(mockSkillMatrix);
  },

  // Resource utilization
  getUtilizationReport: async (
    period: string,
    departmentId?: string,
  ): Promise<ResourceUtilizationReport> => {
    return Promise.resolve(mockUtilizationReport);
  },

  // Resource forecasting
  getResourceForecasts: async (): Promise<ResourceForecast[]> => {
    return Promise.resolve(mockResourceForecast);
  },

  getResourceForecastByDepartment: async (
    departmentId: string,
  ): Promise<ResourceForecast[]> => {
    return Promise.resolve(
      mockResourceForecast.filter(
        (forecast) => forecast.departmentId === departmentId,
      ),
    );
  },
};
