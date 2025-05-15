// Committee API Types for Barakatna Platform

import { Status } from "../core/types";

// Committee member interface
export interface CommitteeMember {
  id: string;
  userId: string;
  name: string;
  email: string;
  role: string;
  position: string;
  department: string;
  isActive: boolean;
  joinDate: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Committee interface
export interface Committee {
  id: string;
  name: string;
  description: string;
  type: string;
  clientTypeId: number;
  members: CommitteeMember[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Committee meeting interface
export interface CommitteeMeeting {
  id: string;
  committeeId: string;
  title: string;
  description: string;
  date: Date;
  startTime: string;
  endTime: string;
  location: string;
  isVirtual: boolean;
  meetingLink?: string;
  status: Status;
  agenda: CommitteeMeetingAgendaItem[];
  attendees: string[];
  minutes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Committee meeting agenda item interface
export interface CommitteeMeetingAgendaItem {
  id: string;
  meetingId: string;
  title: string;
  description: string;
  presenter: string;
  duration: number; // in minutes
  order: number;
  status: Status;
  notes?: string;
}

// Committee decision interface
export interface CommitteeDecision {
  id: string;
  committeeId: string;
  meetingId: string;
  projectId?: string;
  assessmentId?: string;
  title: string;
  description: string;
  decision: "approved" | "rejected" | "deferred" | "modified";
  decisionDate: Date;
  rationale: string;
  conditions?: string;
  votesFor: number;
  votesAgainst: number;
  votesAbstain: number;
  nextReviewDate?: Date;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// Committee filter parameters
export interface CommitteeFilterParams {
  name?: string;
  type?: string;
  clientTypeId?: number;
  isActive?: boolean;
}

// Committee meeting filter parameters
export interface CommitteeMeetingFilterParams {
  committeeId?: string;
  dateFrom?: Date | string;
  dateTo?: Date | string;
  status?: Status;
}

// Committee decision filter parameters
export interface CommitteeDecisionFilterParams {
  committeeId?: string;
  meetingId?: string;
  projectId?: string;
  assessmentId?: string;
  decision?: string;
  dateFrom?: Date | string;
  dateTo?: Date | string;
}

// Submission status type
export type SubmissionStatus = "pending" | "approved" | "rejected" | "deferred";

// Committee submission interface
export interface CommitteeSubmission {
  id: string;
  title: string;
  description: string;
  submissionDate: string;
  submittedBy: string;
  status: SubmissionStatus;
  type: "assessment" | "budget" | "project" | "other";
  priority: "high" | "medium" | "low";
  dueDate?: string;
  attachments?: string[];
  relatedEntityId?: string;
  relatedEntityType?: string;
  clientId: string;
  beneficiaryId?: string;
  metadata?: Record<string, any>;
}

// Committee submission filter parameters
export interface CommitteeSubmissionFilters {
  status?: SubmissionStatus | SubmissionStatus[];
  type?: string;
  priority?: string;
  clientId?: string;
  beneficiaryId?: string;
  submittedBy?: string;
  submittedDateFrom?: string;
  submittedDateTo?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
  search?: string;
}

// Committee decision request payload
export interface CommitteeDecisionRequest {
  submissionId: string;
  status: SubmissionStatus;
  comments: string;
  conditions?: string[];
  followUpRequired?: boolean;
  followUpDate?: string;
  followUpAssignedTo?: string;
  attachments?: string[];
  metadata?: Record<string, any>;
}
