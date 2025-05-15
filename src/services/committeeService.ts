import { committeeApi } from "@/lib/api/committee/committeeApi";
import {
  CommitteeDecisionRequest,
  CommitteeSubmission,
  CommitteeSubmissionFilters,
  SubmissionStatus,
} from "@/lib/api/committee/types";
import { eventBus, EventType } from "./eventBus";
import { workflowEngine } from "./workflowEngine";
import { notificationService } from "./notificationService";

/**
 * Committee Service for handling committee-related business logic
 */
export const committeeService = {
  /**
   * Get pending submissions for committee review
   */
  getPendingSubmissions: async (filters: CommitteeSubmissionFilters = {}) => {
    // Default to pending status if not specified
    const submissionFilters = {
      ...filters,
      status: filters.status || "pending",
    };

    return committeeApi.getSubmissions(submissionFilters);
  },

  /**
   * Submit a committee decision with validation and workflow triggers
   */
  submitDecision: async (
    decision: CommitteeDecisionRequest,
    userId: string,
    committeeId: string,
  ) => {
    try {
      // 1. Validate permissions
      const permissionCheck = await committeeApi.validatePermissions(
        userId,
        committeeId,
        "submit_decision",
      );

      if (!permissionCheck.success || !permissionCheck.data?.hasPermission) {
        return {
          success: false,
          error:
            "You don't have permission to submit decisions for this committee",
        };
      }

      // 2. Get the submission to ensure it exists and is still pending
      const submissionResult = await committeeApi.getSubmission(
        decision.submissionId,
      );

      if (!submissionResult.success) {
        return submissionResult;
      }

      const submission = submissionResult.data as CommitteeSubmission;

      if (submission.status !== "pending") {
        return {
          success: false,
          error: `This submission has already been ${submission.status}`,
        };
      }

      // 3. Submit the decision
      const result = await committeeApi.submitDecision(decision);

      if (!result.success) {
        return result;
      }

      // 4. Update the submission status
      await committeeApi.updateSubmission(decision.submissionId, {
        status: decision.status,
      });

      // 5. Trigger appropriate workflow steps based on decision
      await this.triggerWorkflowSteps(
        submission,
        decision.status,
        result.data?.id,
      );

      // 6. Send notifications to affected parties
      await this.sendDecisionNotifications(
        submission,
        decision.status,
        decision.comments,
      );

      // 7. Publish event for real-time updates
      eventBus.publish({
        id: crypto.randomUUID(),
        type: EventType.COMMITTEE_DECISION,
        timestamp: new Date().toISOString(),
        source: "committeeService",
        payload: {
          submissionId: decision.submissionId,
          status: decision.status,
          decisionId: result.data?.id,
        },
      });

      return result;
    } catch (error) {
      console.error("Error submitting committee decision:", error);
      return {
        success: false,
        error: "Failed to process committee decision",
      };
    }
  },

  /**
   * Trigger appropriate workflow steps based on decision status
   */
  triggerWorkflowSteps: async (
    submission: CommitteeSubmission,
    status: SubmissionStatus,
    decisionId?: string,
  ) => {
    try {
      // Different workflow steps based on submission type and decision status
      switch (submission.type) {
        case "assessment":
          if (status === "approved") {
            await workflowEngine.triggerStep({
              workflowType: "assessment",
              stepName: "committee_approved",
              entityId: submission.relatedEntityId || submission.id,
              data: { submissionId: submission.id, decisionId },
            });
          } else if (status === "rejected") {
            await workflowEngine.triggerStep({
              workflowType: "assessment",
              stepName: "committee_rejected",
              entityId: submission.relatedEntityId || submission.id,
              data: {
                submissionId: submission.id,
                decisionId,
                requiresRevision: true,
              },
            });
          }
          break;

        case "budget":
          if (status === "approved") {
            await workflowEngine.triggerStep({
              workflowType: "budget",
              stepName: "budget_approved",
              entityId: submission.relatedEntityId || submission.id,
              data: { submissionId: submission.id, decisionId },
            });
          } else if (status === "rejected") {
            await workflowEngine.triggerStep({
              workflowType: "budget",
              stepName: "budget_rejected",
              entityId: submission.relatedEntityId || submission.id,
              data: { submissionId: submission.id, decisionId },
            });
          }
          break;

        case "project":
          if (status === "approved") {
            await workflowEngine.triggerStep({
              workflowType: "project",
              stepName: "project_approved",
              entityId: submission.relatedEntityId || submission.id,
              data: { submissionId: submission.id, decisionId },
            });
          } else if (status === "rejected") {
            await workflowEngine.triggerStep({
              workflowType: "project",
              stepName: "project_rejected",
              entityId: submission.relatedEntityId || submission.id,
              data: { submissionId: submission.id, decisionId },
            });
          }
          break;

        default:
          // Generic workflow step for other submission types
          await workflowEngine.triggerStep({
            workflowType: "committee_review",
            stepName: `submission_${status}`,
            entityId: submission.relatedEntityId || submission.id,
            data: { submissionId: submission.id, decisionId },
          });
      }

      // Log workflow step completion
      eventBus.publish({
        id: crypto.randomUUID(),
        type: EventType.WORKFLOW_STEP_COMPLETED,
        timestamp: new Date().toISOString(),
        source: "committeeService",
        payload: {
          submissionId: submission.id,
          submissionType: submission.type,
          status,
          step: `committee_${status}`,
        },
      });
    } catch (error) {
      console.error("Error triggering workflow steps:", error);
      // Continue execution even if workflow steps fail
      // The decision is still recorded
    }
  },

  /**
   * Send notifications to affected parties based on decision
   */
  sendDecisionNotifications: async (
    submission: CommitteeSubmission,
    status: SubmissionStatus,
    comments: string,
  ) => {
    try {
      // 1. Notify the submitter
      await notificationService.sendNotification({
        userId: submission.submittedBy,
        type: "committee_decision",
        title: `Your submission has been ${status}`,
        message:
          status === "approved"
            ? "Your submission has been approved by the committee."
            : status === "rejected"
              ? "Your submission has been rejected by the committee."
              : "Your submission has been deferred for further review.",
        data: {
          submissionId: submission.id,
          status,
          comments,
        },
        priority: status === "rejected" ? "high" : "medium",
      });

      // 2. Notify relevant stakeholders based on submission type
      if (submission.relatedEntityType && submission.relatedEntityId) {
        // Get stakeholders for the related entity
        const stakeholders = await this.getEntityStakeholders(
          submission.relatedEntityType,
          submission.relatedEntityId,
        );

        // Send notifications to all stakeholders except the submitter
        for (const stakeholder of stakeholders) {
          if (stakeholder !== submission.submittedBy) {
            await notificationService.sendNotification({
              userId: stakeholder,
              type: "committee_decision",
              title: `Committee decision: ${submission.title} - ${status}`,
              message: `A committee decision has been made regarding ${submission.title}.`,
              data: {
                submissionId: submission.id,
                status,
                comments,
              },
              priority: "medium",
            });
          }
        }
      }

      // 3. If beneficiary is associated, notify them if appropriate
      if (
        submission.beneficiaryId &&
        (status === "approved" || status === "rejected")
      ) {
        // In a real implementation, this would use a beneficiary notification system
        // which might send SMS, email, etc. based on beneficiary preferences
        console.log(
          `Beneficiary notification would be sent to ${submission.beneficiaryId}`,
        );
      }
    } catch (error) {
      console.error("Error sending decision notifications:", error);
      // Continue execution even if notifications fail
      // The decision is still recorded
    }
  },

  /**
   * Get stakeholders for a specific entity
   * This is a placeholder that would be implemented based on the entity type
   */
  getEntityStakeholders: async (
    entityType: string,
    entityId: string,
  ): Promise<string[]> => {
    // This would be implemented to retrieve stakeholders from the appropriate service
    // For now, return an empty array as a placeholder
    return [];
  },
};
