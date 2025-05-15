import { ApiResponse } from "../core/types";
import {
  Committee,
  CommitteeDecision,
  CommitteeMeeting,
  CommitteeMember,
  CommitteeSubmission,
  CommitteeSubmissionFilters,
  CommitteeDecisionRequest,
  SubmissionStatus,
} from "./types";

export const committeeApi = {
  getCommittees: async (params: {
    page: number;
    pageSize: number;
    sortBy: string;
    sortDirection: string;
  }): Promise<ApiResponse<{ items: Committee[]; total: number }>> => {
    // Mock implementation
    return {
      success: true,
      data: {
        items: [],
        total: 0,
      },
    };
  },

  getCommittee: async (id: string): Promise<ApiResponse<Committee>> => {
    // Mock implementation
    return {
      success: true,
      data: null,
    };
  },

  createCommittee: async (
    committee: Omit<Committee, "id">,
  ): Promise<ApiResponse<Committee>> => {
    // Mock implementation
    return {
      success: true,
      data: null,
    };
  },

  updateCommittee: async (
    id: string,
    committee: Partial<Committee>,
  ): Promise<ApiResponse<Committee>> => {
    // Mock implementation
    return {
      success: true,
      data: null,
    };
  },

  deleteCommittee: async (id: string): Promise<ApiResponse<void>> => {
    // Mock implementation
    return {
      success: true,
    };
  },

  getCommitteeMembers: async (
    committeeId: string,
  ): Promise<ApiResponse<{ items: CommitteeMember[]; total: number }>> => {
    // Mock implementation
    return {
      success: true,
      data: {
        items: [],
        total: 0,
      },
    };
  },

  addCommitteeMember: async (
    committeeId: string,
    member: Omit<CommitteeMember, "id">,
  ): Promise<ApiResponse<CommitteeMember>> => {
    // Mock implementation
    return {
      success: true,
      data: null,
    };
  },

  updateCommitteeMember: async (
    committeeId: string,
    memberId: string,
    member: Partial<CommitteeMember>,
  ): Promise<ApiResponse<CommitteeMember>> => {
    // Mock implementation
    return {
      success: true,
      data: null,
    };
  },

  removeCommitteeMember: async (
    committeeId: string,
    memberId: string,
  ): Promise<ApiResponse<void>> => {
    // Mock implementation
    return {
      success: true,
    };
  },

  getCommitteeMeetings: async (params: {
    page: number;
    pageSize: number;
    sortBy: string;
    sortDirection: string;
  }): Promise<ApiResponse<{ items: CommitteeMeeting[]; total: number }>> => {
    // Mock implementation
    return {
      success: true,
      data: {
        items: [],
        total: 0,
      },
    };
  },

  getCommitteeDecisions: async (params: {
    page: number;
    pageSize: number;
    sortBy: string;
    sortDirection: string;
  }): Promise<ApiResponse<{ items: CommitteeDecision[]; total: number }>> => {
    // Mock implementation
    return {
      success: true,
      data: {
        items: [],
        total: 0,
      },
    };
  },

  // New API methods for submission review
  getAssessmentForReview: async (
    assessmentId: string,
  ): Promise<ApiResponse<any>> => {
    try {
      // In a real implementation, this would make an API call
      // For now, we'll return mock data based on the assessment ID

      // Create mock assessment data
      const mockAssessmentData = {
        id: assessmentId,
        title: `Bathroom Modification Assessment for Beneficiary #${assessmentId.split("-")[1] || "12345"}`,
        description: "Assessment for installing grab bars and shower seat",
        type: "assessment",
        status: "pending_review",
        createdAt: new Date(),
        beneficiaryId: `ben-${assessmentId.split("-")[1] || "12345"}`,
        assessmentDetails: {
          roomType: "Bathroom",
          modifications: ["Grab bars", "Shower seat", "Non-slip flooring"],
          estimatedCost: 15000,
          priority: "High",
          assessorNotes:
            "Beneficiary has mobility issues and requires immediate modifications for safety.",
        },
      };

      return {
        success: true,
        data: mockAssessmentData,
      };
    } catch (error) {
      console.error("Error in getAssessmentForReview:", error);
      return {
        success: false,
        error: "Failed to fetch assessment data",
      };
    }
  },

  getProjectForReview: async (projectId: string): Promise<ApiResponse<any>> => {
    // Mock implementation
    return {
      success: true,
      data: null,
    };
  },

  getSubmissionForReview: async (
    submissionId: string,
  ): Promise<ApiResponse<any>> => {
    // Mock implementation
    return {
      success: true,
      data: null,
    };
  },

  getBeneficiaryData: async (
    beneficiaryId: string,
  ): Promise<ApiResponse<any>> => {
    try {
      // In a real implementation, this would make an API call
      // For now, we'll return mock data based on the beneficiary ID

      // Create mock beneficiary data
      const mockBeneficiaryData = {
        id: beneficiaryId,
        name:
          beneficiaryId === "ben-12345"
            ? "Ahmed Al Mansouri"
            : beneficiaryId === "ben-67890"
              ? "Fatima Al Hashemi"
              : beneficiaryId === "ben-54321"
                ? "Mohammed Al Zaabi"
                : beneficiaryId === "ben-98765"
                  ? "Aisha Al Suwaidi"
                  : beneficiaryId === "ben-24680"
                    ? "Khalid Al Mazrouei"
                    : "Unknown Beneficiary",
        age:
          beneficiaryId === "ben-12345"
            ? 72
            : beneficiaryId === "ben-67890"
              ? 68
              : beneficiaryId === "ben-54321"
                ? 75
                : beneficiaryId === "ben-98765"
                  ? 70
                  : beneficiaryId === "ben-24680"
                    ? 65
                    : 70,
        gender:
          beneficiaryId === "ben-67890" || beneficiaryId === "ben-98765"
            ? "Female"
            : "Male",
        clientType:
          beneficiaryId === "ben-12345" || beneficiaryId === "ben-54321"
            ? "FDF"
            : beneficiaryId === "ben-67890" || beneficiaryId === "ben-24680"
              ? "ADHA"
              : "Cash",
        address: `Villa ${beneficiaryId.split("-")[1] || "45"}, Street ${Math.floor(Math.random() * 20) + 1}, Al Wasl, Dubai`,
        contactNumber: `+971 50 ${Math.floor(Math.random() * 9000000) + 1000000}`,
        medicalConditions:
          beneficiaryId === "ben-12345"
            ? ["Arthritis", "Hypertension"]
            : beneficiaryId === "ben-67890"
              ? ["Osteoporosis", "Diabetes"]
              : beneficiaryId === "ben-54321"
                ? ["Parkinson's", "Heart Disease"]
                : beneficiaryId === "ben-98765"
                  ? ["Stroke Recovery", "Limited Mobility"]
                  : beneficiaryId === "ben-24680"
                    ? ["Multiple Sclerosis", "Chronic Pain"]
                    : ["Limited Mobility"],
        mobilityStatus:
          beneficiaryId === "ben-12345"
            ? "Uses walker"
            : beneficiaryId === "ben-67890"
              ? "Uses wheelchair"
              : beneficiaryId === "ben-54321"
                ? "Uses cane"
                : beneficiaryId === "ben-98765"
                  ? "Partial mobility"
                  : beneficiaryId === "ben-24680"
                    ? "Bedridden"
                    : "Limited mobility",
      };

      return {
        success: true,
        data: mockBeneficiaryData,
      };
    } catch (error) {
      console.error("Error in getBeneficiaryData:", error);
      return {
        success: false,
        error: "Failed to fetch beneficiary data",
      };
    }
  },

  getSubmissionVotes: async (
    submissionId: string,
  ): Promise<
    ApiResponse<{
      votesFor: number;
      votesAgainst: number;
      votesAbstain: number;
    }>
  > => {
    try {
      // In a real implementation, this would make an API call
      // For now, we'll return mock data based on the submission ID

      // Generate consistent mock votes based on submission ID
      const submissionNumber = parseInt(submissionId.split("-")[1] || "0");

      // Use submission number to generate consistent votes
      const votesFor = submissionNumber % 5;
      const votesAgainst = submissionNumber % 3;
      const votesAbstain = submissionNumber % 2;

      return {
        success: true,
        data: {
          votesFor,
          votesAgainst,
          votesAbstain,
        },
      };
    } catch (error) {
      console.error("Error in getSubmissionVotes:", error);
      return {
        success: false,
        error: "Failed to fetch submission votes",
      };
    }
  },

  submitDecision: async (
    decision: CommitteeDecisionRequest,
  ): Promise<ApiResponse<CommitteeDecision>> => {
    // Mock implementation
    return {
      success: true,
      data: {
        id: `dec-${Date.now()}`,
        committeeId: "committee-001",
        meetingId: "meeting-001",
        projectId: decision.submissionId.startsWith("proj-")
          ? decision.submissionId
          : undefined,
        assessmentId: decision.submissionId.startsWith("assess-")
          ? decision.submissionId
          : undefined,
        title: "Committee Decision",
        description: decision.comments || "",
        decision: decision.status as any,
        decisionDate: new Date(),
        rationale: decision.comments || "",
        conditions: decision.conditions?.join(", "),
        votesFor: 3,
        votesAgainst: 1,
        votesAbstain: 0,
        nextReviewDate: decision.followUpDate
          ? new Date(decision.followUpDate)
          : undefined,
        createdBy: "user-001",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    };
  },

  triggerWorkflowAction: async (params: {
    actionType: string;
    submissionId: string;
    submissionType: string;
    decisionId: string;
  }): Promise<ApiResponse<void>> => {
    // Mock implementation
    console.log(
      `Workflow action triggered: ${params.actionType} for ${params.submissionType} ${params.submissionId}`,
    );
    return {
      success: true,
    };
  },

  getPendingSubmissions: async (params: {
    committeeId: string;
    submissionType?: string;
    page: number;
    pageSize: number;
  }): Promise<
    ApiResponse<{
      items: Array<{
        id: string;
        title: string;
        description: string;
        type: string;
        status: string;
        createdAt: Date;
        beneficiaryId?: string;
      }>;
      total: number;
    }>
  > => {
    try {
      // In a real implementation, this would make an API call
      // For now, we'll return mock data

      // Filter by submission type if provided
      let mockSubmissions = [
        {
          id: "assess-001",
          title: "Bathroom Modification Assessment for Beneficiary #12345",
          description: "Assessment for installing grab bars and shower seat",
          type: "assessment",
          status: "pending_review",
          createdAt: new Date(),
          beneficiaryId: "ben-12345",
        },
        {
          id: "assess-002",
          title: "Kitchen Modification Assessment for Beneficiary #67890",
          description:
            "Assessment for lowering countertops and installing accessible cabinets",
          type: "assessment",
          status: "pending_review",
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          beneficiaryId: "ben-67890",
        },
        {
          id: "assess-003",
          title: "Bedroom Modification Assessment for Beneficiary #24680",
          description:
            "Assessment for installing hospital bed and mobility aids",
          type: "assessment",
          status: "pending_review",
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          beneficiaryId: "ben-24680",
        },
        {
          id: "proj-001",
          title: "Project Funding Request for Home Modifications #54321",
          description: "Funding request for comprehensive home modifications",
          type: "project",
          status: "pending_review",
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          beneficiaryId: "ben-54321",
        },
        {
          id: "proj-002",
          title: "Project Funding Request for Accessibility Ramp #98765",
          description:
            "Funding request for exterior accessibility ramp installation",
          type: "project",
          status: "pending_review",
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          beneficiaryId: "ben-98765",
        },
      ];

      // Filter by submission type if provided
      if (params.submissionType) {
        mockSubmissions = mockSubmissions.filter(
          (submission) => submission.type === params.submissionType,
        );
      }

      // Apply pagination
      const startIndex = (params.page - 1) * params.pageSize;
      const endIndex = startIndex + params.pageSize;
      const paginatedItems = mockSubmissions.slice(startIndex, endIndex);

      return {
        success: true,
        data: {
          items: paginatedItems,
          total: mockSubmissions.length,
        },
      };
    } catch (error) {
      console.error("Error in getPendingSubmissions:", error);
      return {
        success: false,
        error: "Failed to fetch pending submissions",
      };
    }
  },

  // New methods for the Committee Review functionality
  getSubmissions: async (
    filters: CommitteeSubmissionFilters = {},
  ): Promise<ApiResponse<CommitteeSubmission[]>> => {
    try {
      // Mock implementation for demo purposes
      const status = filters.status || "pending";

      // Generate mock submissions based on status
      const mockSubmissions: CommitteeSubmission[] = [
        {
          id: "sub-001",
          title: "Bathroom Modification Assessment",
          description:
            "Assessment for installing grab bars and shower seat for elderly beneficiary",
          submissionDate: new Date().toISOString(),
          submittedBy: "user-002",
          status: Array.isArray(status) ? status[0] : status,
          type: "assessment",
          priority: "high",
          clientId: "client-001",
          beneficiaryId: "BEN-2023-001",
        },
        {
          id: "sub-002",
          title: "Kitchen Accessibility Project",
          description:
            "Project proposal for lowering countertops and installing pull-out shelves",
          submissionDate: new Date(
            Date.now() - 2 * 24 * 60 * 60 * 1000,
          ).toISOString(),
          submittedBy: "user-003",
          status: Array.isArray(status) ? status[0] : status,
          type: "project",
          priority: "medium",
          clientId: "client-002",
          beneficiaryId: "BEN-2023-005",
        },
        {
          id: "sub-003",
          title: "Budget Allocation for Q3",
          description:
            "Quarterly budget allocation for home modification projects",
          submissionDate: new Date(
            Date.now() - 5 * 24 * 60 * 60 * 1000,
          ).toISOString(),
          submittedBy: "user-004",
          status: Array.isArray(status) ? status[0] : status,
          type: "budget",
          priority: "low",
          clientId: "client-001",
        },
      ];

      return {
        success: true,
        data: mockSubmissions,
      };
    } catch (error) {
      console.error("Error in getSubmissions:", error);
      return {
        success: false,
        error: "Failed to fetch submissions",
      };
    }
  },

  getSubmission: async (
    submissionId: string,
  ): Promise<ApiResponse<CommitteeSubmission>> => {
    try {
      // Mock implementation for demo purposes
      return {
        success: true,
        data: {
          id: submissionId,
          title: "Bathroom Modification Assessment",
          description:
            "Assessment for installing grab bars and shower seat for elderly beneficiary",
          submissionDate: new Date().toISOString(),
          submittedBy: "user-002",
          status: "pending",
          type: "assessment",
          priority: "high",
          clientId: "client-001",
          beneficiaryId: "BEN-2023-001",
        },
      };
    } catch (error) {
      console.error("Error in getSubmission:", error);
      return {
        success: false,
        error: "Failed to fetch submission",
      };
    }
  },

  updateSubmission: async (
    submissionId: string,
    submission: Partial<CommitteeSubmission>,
  ): Promise<ApiResponse<CommitteeSubmission>> => {
    try {
      // Mock implementation for demo purposes
      return {
        success: true,
        data: {
          id: submissionId,
          title: "Bathroom Modification Assessment",
          description:
            "Assessment for installing grab bars and shower seat for elderly beneficiary",
          submissionDate: new Date().toISOString(),
          submittedBy: "user-002",
          status: submission.status || "pending",
          type: "assessment",
          priority: "high",
          clientId: "client-001",
          beneficiaryId: "BEN-2023-001",
        },
      };
    } catch (error) {
      console.error("Error in updateSubmission:", error);
      return {
        success: false,
        error: "Failed to update submission",
      };
    }
  },

  validatePermissions: async (
    userId: string,
    committeeId: string,
    action: string,
  ): Promise<ApiResponse<{ hasPermission: boolean }>> => {
    try {
      // Mock implementation for demo purposes
      return {
        success: true,
        data: { hasPermission: true },
      };
    } catch (error) {
      console.error("Error in validatePermissions:", error);
      return {
        success: false,
        error: "Failed to validate permissions",
      };
    }
  },
};
