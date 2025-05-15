import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Textarea } from "../ui/textarea";
import { Badge } from "../ui/badge";
import { ScrollArea } from "../ui/scroll-area";
import { Separator } from "../ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Check,
  ChevronRight,
  Code,
  Copy,
  Edit,
  Eye,
  FileText,
  Plus,
  Save,
  Trash2,
  Upload,
  X,
  ArrowRight,
  ArrowDown,
  Clock,
  AlertCircle,
  Users,
  Workflow,
  FileCheck,
  Settings,
  Layers,
} from "lucide-react";
import { useToast } from "../ui/use-toast";
import { ClientType } from "../../lib/forms/types";
import {
  WorkflowPhase,
  WorkflowStatus,
  WorkflowEngine,
} from "../../services/workflowEngine";

interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
  version: string;
  clientType: string;
  status: "draft" | "published" | "archived";
  createdAt: Date;
  updatedAt: Date;
  phases: WorkflowPhase[];
}

interface WorkflowPhase {
  id: string;
  name: string;
  description: string;
  order: number;
  steps: WorkflowStep[];
}

interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  type: "task" | "approval" | "notification" | "condition" | "integration";
  assignedRoles: string[];
  transitions: WorkflowTransition[];
  conditions?: WorkflowCondition[];
  formId?: string;
  timeoutMinutes?: number;
  escalationRoles?: string[];
}

interface WorkflowTransition {
  id: string;
  name: string;
  targetStepId: string;
  condition?: WorkflowCondition;
}

interface WorkflowCondition {
  id: string;
  field: string;
  operator:
    | "equals"
    | "notEquals"
    | "greaterThan"
    | "lessThan"
    | "contains"
    | "notContains";
  value: string;
  logicalOperator?: "and" | "or";
  nextCondition?: WorkflowCondition;
}

const mockClientTypes = [
  { id: ClientType.FDF, name: "FDF" },
  { id: ClientType.ADHA, name: "ADHA" },
  { id: ClientType.CASH, name: "Cash Client" },
  { id: ClientType.OTHER, name: "Other Clients" },
  { id: "all", name: "All Clients" },
];

const mockRoles = [
  { id: "admin", name: "Administrator" },
  { id: "manager", name: "Manager" },
  { id: "assessor", name: "Assessor" },
  { id: "approver", name: "Approver" },
  { id: "contractor", name: "Contractor" },
  { id: "finance", name: "Finance Officer" },
];

const mockForms = [
  { id: "assessment", name: "Assessment Form" },
  { id: "approval", name: "Approval Form" },
  { id: "inspection", name: "Inspection Form" },
  { id: "payment", name: "Payment Request Form" },
];

// Core business process workflows
const mockWorkflows: WorkflowDefinition[] = [
  {
    id: "1",
    name: "Assessment Workflow",
    description: "Standard workflow for home assessments",
    version: "1.0.0",
    clientType: "all",
    status: "published",
    createdAt: new Date("2023-10-15"),
    updatedAt: new Date("2023-10-20"),
    phases: [
      {
        id: "p1",
        name: "Initial Assessment",
        description: "First phase of assessment",
        order: 1,
        steps: [
          {
            id: "s1",
            name: "Schedule Visit",
            description: "Schedule initial home visit",
            type: "task",
            assignedRoles: ["assessor"],
            transitions: [
              {
                id: "t1",
                name: "Complete",
                targetStepId: "s2",
              },
            ],
          },
          {
            id: "s2",
            name: "Conduct Assessment",
            description: "Perform on-site assessment",
            type: "task",
            assignedRoles: ["assessor"],
            formId: "assessment",
            transitions: [
              {
                id: "t2",
                name: "Submit",
                targetStepId: "s3",
              },
            ],
          },
        ],
      },
      {
        id: "p2",
        name: "Approval",
        description: "Approval phase",
        order: 2,
        steps: [
          {
            id: "s3",
            name: "Review Assessment",
            description: "Manager reviews assessment",
            type: "approval",
            assignedRoles: ["manager"],
            transitions: [
              {
                id: "t3",
                name: "Approve",
                targetStepId: "s4",
              },
              {
                id: "t4",
                name: "Reject",
                targetStepId: "s2",
              },
            ],
            timeoutMinutes: 2880, // 48 hours
            escalationRoles: ["admin"],
          },
        ],
      },
      {
        id: "p3",
        name: "Implementation",
        description: "Implementation phase",
        order: 3,
        steps: [
          {
            id: "s4",
            name: "Assign Contractor",
            description: "Assign contractor for modifications",
            type: "task",
            assignedRoles: ["manager"],
            transitions: [
              {
                id: "t5",
                name: "Assigned",
                targetStepId: "s5",
              },
            ],
          },
          {
            id: "s5",
            name: "Perform Modifications",
            description: "Contractor performs home modifications",
            type: "task",
            assignedRoles: ["contractor"],
            transitions: [
              {
                id: "t6",
                name: "Complete",
                targetStepId: "s6",
              },
            ],
          },
        ],
      },
      {
        id: "p4",
        name: "Verification",
        description: "Final verification phase",
        order: 4,
        steps: [
          {
            id: "s6",
            name: "Inspection",
            description: "Inspect completed modifications",
            type: "task",
            assignedRoles: ["assessor"],
            formId: "inspection",
            transitions: [
              {
                id: "t7",
                name: "Pass",
                targetStepId: "s7",
              },
              {
                id: "t8",
                name: "Fail",
                targetStepId: "s5",
              },
            ],
          },
          {
            id: "s7",
            name: "Payment Processing",
            description: "Process payment to contractor",
            type: "task",
            assignedRoles: ["finance"],
            formId: "payment",
            transitions: [
              {
                id: "t9",
                name: "Complete",
                targetStepId: "s8",
              },
            ],
          },
        ],
      },
      {
        id: "p5",
        name: "Closure",
        description: "Case closure phase",
        order: 5,
        steps: [
          {
            id: "s8",
            name: "Close Case",
            description: "Close the assessment case",
            type: "task",
            assignedRoles: ["manager"],
            transitions: [],
          },
        ],
      },
    ],
  },
  {
    id: "2",
    name: "Beneficiary Enrollment Workflow",
    description: "Workflow for beneficiary enrollment and qualification",
    version: "1.0.0",
    clientType: "all",
    status: "published",
    createdAt: new Date("2023-11-05"),
    updatedAt: new Date("2023-11-10"),
    phases: [
      {
        id: "p1",
        name: "Initial Registration",
        description: "Beneficiary registration phase",
        order: 1,
        steps: [
          {
            id: "s1",
            name: "Registration Form",
            description: "Complete beneficiary registration form",
            type: "task",
            assignedRoles: ["assessor", "admin"],
            formId: "beneficiary-registration",
            transitions: [
              {
                id: "t1",
                name: "Submit",
                targetStepId: "s2",
              },
            ],
          },
        ],
      },
      {
        id: "p2",
        name: "Document Verification",
        description: "Verify beneficiary documents",
        order: 2,
        steps: [
          {
            id: "s2",
            name: "Document Upload",
            description: "Upload required documents",
            type: "task",
            assignedRoles: ["assessor", "admin"],
            formId: "document-upload",
            transitions: [
              {
                id: "t2",
                name: "Complete",
                targetStepId: "s3",
              },
            ],
          },
          {
            id: "s3",
            name: "Document Verification",
            description: "Verify uploaded documents",
            type: "approval",
            assignedRoles: ["verifier"],
            transitions: [
              {
                id: "t3",
                name: "Approve",
                targetStepId: "s4",
              },
              {
                id: "t4",
                name: "Request Additional Documents",
                targetStepId: "s2",
              },
            ],
          },
        ],
      },
      {
        id: "p3",
        name: "Eligibility Check",
        description: "Check beneficiary eligibility",
        order: 3,
        steps: [
          {
            id: "s4",
            name: "Eligibility Assessment",
            description: "Assess beneficiary eligibility based on criteria",
            type: "task",
            assignedRoles: ["assessor"],
            formId: "eligibility-assessment",
            transitions: [
              {
                id: "t5",
                name: "Eligible",
                targetStepId: "s5",
              },
              {
                id: "t6",
                name: "Not Eligible",
                targetStepId: "s8",
              },
            ],
          },
        ],
      },
      {
        id: "p4",
        name: "Qualification",
        description: "Final qualification approval",
        order: 4,
        steps: [
          {
            id: "s5",
            name: "Qualification Review",
            description: "Manager reviews qualification",
            type: "approval",
            assignedRoles: ["manager"],
            transitions: [
              {
                id: "t7",
                name: "Approve",
                targetStepId: "s6",
              },
              {
                id: "t8",
                name: "Reject",
                targetStepId: "s8",
              },
            ],
            timeoutMinutes: 1440, // 24 hours
            escalationRoles: ["admin"],
          },
        ],
      },
      {
        id: "p5",
        name: "Assessment Assignment",
        description: "Assign for detailed assessment",
        order: 5,
        steps: [
          {
            id: "s6",
            name: "Assessment Assignment",
            description: "Assign beneficiary for detailed assessment",
            type: "task",
            assignedRoles: ["manager"],
            transitions: [
              {
                id: "t9",
                name: "Assign",
                targetStepId: "s7",
              },
            ],
          },
          {
            id: "s7",
            name: "Enrollment Complete",
            description: "Beneficiary enrollment completed",
            type: "notification",
            assignedRoles: ["assessor", "manager"],
            transitions: [],
          },
        ],
      },
      {
        id: "p6",
        name: "Rejection Handling",
        description: "Handle rejected applications",
        order: 6,
        steps: [
          {
            id: "s8",
            name: "Rejection Processing",
            description: "Process rejection and notify beneficiary",
            type: "task",
            assignedRoles: ["admin"],
            transitions: [
              {
                id: "t10",
                name: "Process Appeal",
                targetStepId: "s9",
              },
              {
                id: "t11",
                name: "Close Application",
                targetStepId: "s10",
              },
            ],
          },
          {
            id: "s9",
            name: "Appeal Review",
            description: "Review beneficiary appeal",
            type: "approval",
            assignedRoles: ["manager", "admin"],
            transitions: [
              {
                id: "t12",
                name: "Approve Appeal",
                targetStepId: "s5",
              },
              {
                id: "t13",
                name: "Reject Appeal",
                targetStepId: "s10",
              },
            ],
          },
          {
            id: "s10",
            name: "Application Closed",
            description: "Application permanently closed",
            type: "notification",
            assignedRoles: ["admin"],
            transitions: [],
          },
        ],
      },
    ],
  },
  {
    id: "3",
    name: "Committee Review Workflow",
    description: "Workflow for committee review and approval process",
    version: "1.0.0",
    clientType: "all",
    status: "published",
    createdAt: new Date("2023-09-01"),
    updatedAt: new Date("2023-10-30"),
    phases: [
      {
        id: "p1",
        name: "Submission",
        description: "Assessment submission for committee review",
        order: 1,
        steps: [
          {
            id: "s1",
            name: "Prepare Submission",
            description: "Prepare assessment for committee review",
            type: "task",
            assignedRoles: ["assessor"],
            formId: "committee-submission",
            transitions: [
              {
                id: "t1",
                name: "Submit",
                targetStepId: "s2",
              },
            ],
          },
          {
            id: "s2",
            name: "Initial Review",
            description: "Initial review of submission completeness",
            type: "approval",
            assignedRoles: ["manager"],
            transitions: [
              {
                id: "t2",
                name: "Approve",
                targetStepId: "s3",
              },
              {
                id: "t3",
                name: "Request Changes",
                targetStepId: "s1",
              },
            ],
          },
        ],
      },
      {
        id: "p2",
        name: "Committee Scheduling",
        description: "Schedule committee meeting",
        order: 2,
        steps: [
          {
            id: "s3",
            name: "Schedule Meeting",
            description: "Schedule committee meeting for review",
            type: "task",
            assignedRoles: ["admin"],
            formId: "committee-scheduling",
            transitions: [
              {
                id: "t4",
                name: "Scheduled",
                targetStepId: "s4",
              },
            ],
          },
        ],
      },
      {
        id: "p3",
        name: "Review & Deliberation",
        description: "Committee review and deliberation",
        order: 3,
        steps: [
          {
            id: "s4",
            name: "Committee Review",
            description: "Committee reviews assessment",
            type: "task",
            assignedRoles: ["committee-member"],
            formId: "committee-review",
            transitions: [
              {
                id: "t5",
                name: "Complete Review",
                targetStepId: "s5",
              },
            ],
          },
          {
            id: "s5",
            name: "Committee Deliberation",
            description: "Committee deliberates on assessment",
            type: "task",
            assignedRoles: ["committee-chair"],
            transitions: [
              {
                id: "t6",
                name: "Decision Ready",
                targetStepId: "s6",
              },
              {
                id: "t7",
                name: "Request Additional Information",
                targetStepId: "s1",
              },
            ],
          },
        ],
      },
      {
        id: "p4",
        name: "Decision",
        description: "Committee decision",
        order: 4,
        steps: [
          {
            id: "s6",
            name: "Committee Decision",
            description: "Record committee decision",
            type: "task",
            assignedRoles: ["committee-chair"],
            formId: "committee-decision",
            transitions: [
              {
                id: "t8",
                name: "Approve",
                targetStepId: "s7",
              },
              {
                id: "t9",
                name: "Reject",
                targetStepId: "s8",
              },
              {
                id: "t10",
                name: "Defer",
                targetStepId: "s3",
              },
            ],
          },
        ],
      },
      {
        id: "p5",
        name: "Notification",
        description: "Notify stakeholders of decision",
        order: 5,
        steps: [
          {
            id: "s7",
            name: "Approval Notification",
            description: "Notify of approval decision",
            type: "notification",
            assignedRoles: ["admin"],
            transitions: [
              {
                id: "t11",
                name: "Proceed to Project",
                targetStepId: "s9",
              },
            ],
          },
          {
            id: "s8",
            name: "Rejection Notification",
            description: "Notify of rejection decision",
            type: "notification",
            assignedRoles: ["admin"],
            transitions: [
              {
                id: "t12",
                name: "Close",
                targetStepId: "s10",
              },
            ],
          },
          {
            id: "s9",
            name: "Project Initiation",
            description: "Initiate project implementation",
            type: "task",
            assignedRoles: ["manager"],
            transitions: [],
          },
          {
            id: "s10",
            name: "Case Closed",
            description: "Close rejected case",
            type: "notification",
            assignedRoles: ["admin"],
            transitions: [],
          },
        ],
      },
    ],
  },
  {
    id: "4",
    name: "Project Implementation Workflow",
    description: "Workflow for project implementation and execution",
    version: "1.0.0",
    clientType: "all",
    status: "published",
    createdAt: new Date("2023-10-01"),
    updatedAt: new Date("2023-10-15"),
    phases: [
      {
        id: "p1",
        name: "Project Creation",
        description: "Create and initialize project",
        order: 1,
        steps: [
          {
            id: "s1",
            name: "Project Setup",
            description: "Set up project details and parameters",
            type: "task",
            assignedRoles: ["manager"],
            formId: "project-setup",
            transitions: [
              {
                id: "t1",
                name: "Complete",
                targetStepId: "s2",
              },
            ],
          },
        ],
      },
      {
        id: "p2",
        name: "Planning",
        description: "Project planning phase",
        order: 2,
        steps: [
          {
            id: "s2",
            name: "Project Planning",
            description: "Create detailed project plan",
            type: "task",
            assignedRoles: ["project-manager"],
            formId: "project-planning",
            transitions: [
              {
                id: "t2",
                name: "Complete",
                targetStepId: "s3",
              },
            ],
          },
          {
            id: "s3",
            name: "Plan Approval",
            description: "Get approval for project plan",
            type: "approval",
            assignedRoles: ["manager"],
            transitions: [
              {
                id: "t3",
                name: "Approve",
                targetStepId: "s4",
              },
              {
                id: "t4",
                name: "Request Changes",
                targetStepId: "s2",
              },
            ],
          },
        ],
      },
      {
        id: "p3",
        name: "Resource Allocation",
        description: "Allocate resources for project",
        order: 3,
        steps: [
          {
            id: "s4",
            name: "Resource Allocation",
            description: "Allocate resources to project tasks",
            type: "task",
            assignedRoles: ["project-manager"],
            formId: "resource-allocation",
            transitions: [
              {
                id: "t5",
                name: "Complete",
                targetStepId: "s5",
              },
            ],
          },
        ],
      },
      {
        id: "p4",
        name: "Execution",
        description: "Project execution phase",
        order: 4,
        steps: [
          {
            id: "s5",
            name: "Task Execution",
            description: "Execute project tasks",
            type: "task",
            assignedRoles: ["contractor"],
            formId: "task-execution",
            transitions: [
              {
                id: "t6",
                name: "Complete",
                targetStepId: "s6",
              },
            ],
          },
          {
            id: "s6",
            name: "Progress Tracking",
            description: "Track and report project progress",
            type: "task",
            assignedRoles: ["project-manager"],
            formId: "progress-tracking",
            transitions: [
              {
                id: "t7",
                name: "Complete",
                targetStepId: "s7",
              },
            ],
          },
        ],
      },
      {
        id: "p5",
        name: "Inspection",
        description: "Project inspection phase",
        order: 5,
        steps: [
          {
            id: "s7",
            name: "Quality Inspection",
            description: "Inspect project quality",
            type: "task",
            assignedRoles: ["inspector"],
            formId: "quality-inspection",
            transitions: [
              {
                id: "t8",
                name: "Pass",
                targetStepId: "s9",
              },
              {
                id: "t9",
                name: "Fail",
                targetStepId: "s8",
              },
            ],
          },
          {
            id: "s8",
            name: "Remediation",
            description: "Address inspection issues",
            type: "task",
            assignedRoles: ["contractor"],
            formId: "remediation",
            transitions: [
              {
                id: "t10",
                name: "Complete",
                targetStepId: "s7",
              },
            ],
          },
        ],
      },
      {
        id: "p6",
        name: "Handover",
        description: "Project handover phase",
        order: 6,
        steps: [
          {
            id: "s9",
            name: "Project Handover",
            description: "Hand over completed project",
            type: "task",
            assignedRoles: ["project-manager"],
            formId: "project-handover",
            transitions: [
              {
                id: "t11",
                name: "Complete",
                targetStepId: "s10",
              },
            ],
          },
          {
            id: "s10",
            name: "Project Closure",
            description: "Close project and finalize documentation",
            type: "task",
            assignedRoles: ["manager"],
            formId: "project-closure",
            transitions: [],
          },
        ],
      },
    ],
  },
  {
    id: "5",
    name: "Financial Management Workflow",
    description: "Workflow for financial management and payment processing",
    version: "1.0.0",
    clientType: "all",
    status: "published",
    createdAt: new Date("2023-10-10"),
    updatedAt: new Date("2023-10-20"),
    phases: [
      {
        id: "p1",
        name: "Budget Allocation",
        description: "Allocate budget for project",
        order: 1,
        steps: [
          {
            id: "s1",
            name: "Budget Request",
            description: "Create budget request",
            type: "task",
            assignedRoles: ["project-manager"],
            formId: "budget-request",
            transitions: [
              {
                id: "t1",
                name: "Submit",
                targetStepId: "s2",
              },
            ],
          },
          {
            id: "s2",
            name: "Budget Review",
            description: "Review budget request",
            type: "approval",
            assignedRoles: ["finance-manager"],
            transitions: [
              {
                id: "t2",
                name: "Approve",
                targetStepId: "s3",
              },
              {
                id: "t3",
                name: "Request Changes",
                targetStepId: "s1",
              },
            ],
          },
          {
            id: "s3",
            name: "Budget Allocation",
            description: "Allocate approved budget",
            type: "task",
            assignedRoles: ["finance-officer"],
            formId: "budget-allocation",
            transitions: [
              {
                id: "t4",
                name: "Complete",
                targetStepId: "s4",
              },
            ],
          },
        ],
      },
      {
        id: "p2",
        name: "Expense Approval",
        description: "Approve project expenses",
        order: 2,
        steps: [
          {
            id: "s4",
            name: "Expense Request",
            description: "Submit expense request",
            type: "task",
            assignedRoles: ["project-manager", "contractor"],
            formId: "expense-request",
            transitions: [
              {
                id: "t5",
                name: "Submit",
                targetStepId: "s5",
              },
            ],
          },
          {
            id: "s5",
            name: "Expense Validation",
            description: "Validate expense request",
            type: "task",
            assignedRoles: ["finance-officer"],
            transitions: [
              {
                id: "t6",
                name: "Valid",
                targetStepId: "s6",
              },
              {
                id: "t7",
                name: "Invalid",
                targetStepId: "s4",
              },
            ],
          },
          {
            id: "s6",
            name: "Expense Approval",
            description: "Approve expense request",
            type: "approval",
            assignedRoles: ["finance-manager"],
            transitions: [
              {
                id: "t8",
                name: "Approve",
                targetStepId: "s7",
              },
              {
                id: "t9",
                name: "Reject",
                targetStepId: "s4",
              },
            ],
          },
        ],
      },
      {
        id: "p3",
        name: "Invoice Processing",
        description: "Process invoices for payment",
        order: 3,
        steps: [
          {
            id: "s7",
            name: "Invoice Creation",
            description: "Create invoice for approved expense",
            type: "task",
            assignedRoles: ["finance-officer"],
            formId: "invoice-creation",
            transitions: [
              {
                id: "t10",
                name: "Complete",
                targetStepId: "s8",
              },
            ],
          },
          {
            id: "s8",
            name: "Invoice Verification",
            description: "Verify invoice details",
            type: "task",
            assignedRoles: ["finance-officer"],
            transitions: [
              {
                id: "t11",
                name: "Verified",
                targetStepId: "s9",
              },
              {
                id: "t12",
                name: "Discrepancy",
                targetStepId: "s7",
              },
            ],
          },
        ],
      },
      {
        id: "p4",
        name: "Payment Authorization",
        description: "Authorize payment for invoices",
        order: 4,
        steps: [
          {
            id: "s9",
            name: "Payment Authorization",
            description: "Authorize payment for verified invoice",
            type: "approval",
            assignedRoles: ["finance-manager"],
            formId: "payment-authorization",
            transitions: [
              {
                id: "t13",
                name: "Authorize",
                targetStepId: "s10",
              },
              {
                id: "t14",
                name: "Reject",
                targetStepId: "s8",
              },
            ],
          },
          {
            id: "s10",
            name: "Payment Processing",
            description: "Process authorized payment",
            type: "task",
            assignedRoles: ["finance-officer"],
            formId: "payment-processing",
            transitions: [
              {
                id: "t15",
                name: "Complete",
                targetStepId: "s11",
              },
            ],
          },
        ],
      },
      {
        id: "p5",
        name: "Reconciliation",
        description: "Financial reconciliation",
        order: 5,
        steps: [
          {
            id: "s11",
            name: "Payment Reconciliation",
            description: "Reconcile payment with budget and expenses",
            type: "task",
            assignedRoles: ["finance-officer"],
            formId: "payment-reconciliation",
            transitions: [
              {
                id: "t16",
                name: "Complete",
                targetStepId: "s12",
              },
            ],
          },
          {
            id: "s12",
            name: "Financial Reporting",
            description: "Generate financial reports",
            type: "task",
            assignedRoles: ["finance-officer"],
            formId: "financial-reporting",
            transitions: [
              {
                id: "t17",
                name: "Complete",
                targetStepId: "s13",
              },
            ],
          },
          {
            id: "s13",
            name: "Financial Closure",
            description: "Close financial process",
            type: "task",
            assignedRoles: ["finance-manager"],
            transitions: [],
          },
        ],
      },
    ],
  },
  {
    id: "6",
    name: "FDF Assessment Workflow",
    description: "Specialized workflow for FDF clients",
    version: "1.2.1",
    clientType: ClientType.FDF,
    status: "draft",
    createdAt: new Date("2023-11-05"),
    updatedAt: new Date("2023-11-10"),
    phases: [],
  },
  {
    id: "7",
    name: "ADHA Assessment Workflow",
    description: "Specialized workflow for ADHA clients",
    version: "0.9.0",
    clientType: ClientType.ADHA,
    status: "archived",
    createdAt: new Date("2023-09-01"),
    updatedAt: new Date("2023-10-30"),
    phases: [],
  },
];

const WorkflowDefinitionManager: React.FC = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("list");
  const [workflows, setWorkflows] =
    useState<WorkflowDefinition[]>(mockWorkflows);
  const workflowEngine = WorkflowEngine.getInstance();
  const [selectedWorkflow, setSelectedWorkflow] =
    useState<WorkflowDefinition | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showVersionDialog, setShowVersionDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [newVersion, setNewVersion] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterClientType, setFilterClientType] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [jsonPreview, setJsonPreview] = useState("");
  const [importJson, setImportJson] = useState("");

  useEffect(() => {
    if (selectedWorkflow) {
      setJsonPreview(JSON.stringify(selectedWorkflow, null, 2));
    }
  }, [selectedWorkflow]);

  const filteredWorkflows = workflows.filter((workflow) => {
    const matchesSearch =
      workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      workflow.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClientType =
      filterClientType === "all" || workflow.clientType === filterClientType;
    const matchesStatus =
      filterStatus === "all" || workflow.status === filterStatus;

    return matchesSearch && matchesClientType && matchesStatus;
  });

  const handleSelectWorkflow = (workflow: WorkflowDefinition) => {
    setSelectedWorkflow(workflow);
    setActiveTab("details");
    setEditMode(false);
  };

  const handleCreateWorkflow = () => {
    const newWorkflow: WorkflowDefinition = {
      id: `wf-${Date.now()}`,
      name: "New Workflow",
      description: "Description of the new workflow",
      version: "0.1.0",
      clientType: "all",
      status: "draft",
      createdAt: new Date(),
      updatedAt: new Date(),
      phases: [],
    };

    setWorkflows([...workflows, newWorkflow]);
    setSelectedWorkflow(newWorkflow);
    setActiveTab("details");
    setEditMode(true);
  };

  const handleSaveWorkflow = () => {
    if (!selectedWorkflow) return;

    const updatedWorkflows = workflows.map((wf) =>
      wf.id === selectedWorkflow.id
        ? { ...selectedWorkflow, updatedAt: new Date() }
        : wf,
    );

    setWorkflows(updatedWorkflows);
    setEditMode(false);

    toast({
      title: "Workflow saved",
      description: `${selectedWorkflow.name} has been saved successfully.`,
    });
  };

  const handleDeleteWorkflow = () => {
    if (!selectedWorkflow) return;

    const updatedWorkflows = workflows.filter(
      (wf) => wf.id !== selectedWorkflow.id,
    );
    setWorkflows(updatedWorkflows);
    setSelectedWorkflow(null);
    setActiveTab("list");
    setShowDeleteDialog(false);

    toast({
      title: "Workflow deleted",
      description: `${selectedWorkflow.name} has been deleted.`,
      variant: "destructive",
    });
  };

  const handleCreateVersion = () => {
    if (!selectedWorkflow || !newVersion) return;

    const newVersionWorkflow: WorkflowDefinition = {
      ...selectedWorkflow,
      id: `wf-${Date.now()}`,
      version: newVersion,
      status: "draft",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setWorkflows([...workflows, newVersionWorkflow]);
    setSelectedWorkflow(newVersionWorkflow);
    setShowVersionDialog(false);
    setNewVersion("");

    toast({
      title: "New version created",
      description: `Version ${newVersion} of ${selectedWorkflow.name} has been created.`,
    });
  };

  const handlePublishWorkflow = () => {
    if (!selectedWorkflow) return;

    const updatedWorkflow = {
      ...selectedWorkflow,
      status: "published" as const,
      updatedAt: new Date(),
    };
    const updatedWorkflows = workflows.map((wf) =>
      wf.id === selectedWorkflow.id ? updatedWorkflow : wf,
    );

    setWorkflows(updatedWorkflows);
    setSelectedWorkflow(updatedWorkflow);

    toast({
      title: "Workflow published",
      description: `${selectedWorkflow.name} has been published successfully.`,
    });
  };

  const handleArchiveWorkflow = () => {
    if (!selectedWorkflow) return;

    const updatedWorkflow = {
      ...selectedWorkflow,
      status: "archived" as const,
      updatedAt: new Date(),
    };
    const updatedWorkflows = workflows.map((wf) =>
      wf.id === selectedWorkflow.id ? updatedWorkflow : wf,
    );

    setWorkflows(updatedWorkflows);
    setSelectedWorkflow(updatedWorkflow);

    toast({
      title: "Workflow archived",
      description: `${selectedWorkflow.name} has been archived.`,
    });
  };

  const handleExportWorkflow = () => {
    if (!selectedWorkflow) return;

    // In a real application, this would trigger a download
    const jsonString = JSON.stringify(selectedWorkflow, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${selectedWorkflow.name.replace(/\s+/g, "_").toLowerCase()}_v${selectedWorkflow.version}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setShowExportDialog(false);

    toast({
      title: "Workflow exported",
      description: `${selectedWorkflow.name} has been exported as JSON.`,
    });
  };

  const handleImportWorkflow = () => {
    try {
      const importedWorkflow = JSON.parse(importJson);

      // Validate the imported workflow has the required fields
      if (
        !importedWorkflow.name ||
        !importedWorkflow.description ||
        !importedWorkflow.version
      ) {
        throw new Error("Missing required fields in workflow definition");
      }

      // Generate a new ID and reset timestamps
      importedWorkflow.id = `wf-${Date.now()}`;
      importedWorkflow.createdAt = new Date();
      importedWorkflow.updatedAt = new Date();
      importedWorkflow.status = "draft";

      setWorkflows([...workflows, importedWorkflow]);
      setSelectedWorkflow(importedWorkflow);
      setActiveTab("details");
      setShowImportDialog(false);
      setImportJson("");

      toast({
        title: "Workflow imported",
        description: `${importedWorkflow.name} has been imported successfully.`,
      });
    } catch (error) {
      toast({
        title: "Import failed",
        description:
          error instanceof Error
            ? error.message
            : "Invalid JSON format. Please check your input.",
        variant: "destructive",
      });
    }
  };

  const handleFieldChange = (field: keyof WorkflowDefinition, value: any) => {
    if (!selectedWorkflow) return;
    setSelectedWorkflow({ ...selectedWorkflow, [field]: value });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return <Badge className="bg-green-500">Published</Badge>;
      case "draft":
        return <Badge className="bg-yellow-500">Draft</Badge>;
      case "archived":
        return <Badge className="bg-gray-500">Archived</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const renderWorkflowList = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{t("Workflow Definitions")}</h2>
        <Button onClick={handleCreateWorkflow}>
          <Plus className="mr-2 h-4 w-4" />
          {t("Create Workflow")}
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="flex-1">
          <Input
            placeholder={t("Search workflows...")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-full md:w-48">
          <Select value={filterClientType} onValueChange={setFilterClientType}>
            <SelectTrigger>
              <SelectValue placeholder={t("Client Type")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("All Client Types")}</SelectItem>
              {mockClientTypes.map((type) => (
                <SelectItem key={type.id} value={type.id}>
                  {t(type.name)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-full md:w-48">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger>
              <SelectValue placeholder={t("Status")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("All Statuses")}</SelectItem>
              <SelectItem value="draft">{t("Draft")}</SelectItem>
              <SelectItem value="published">{t("Published")}</SelectItem>
              <SelectItem value="archived">{t("Archived")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("Name")}</TableHead>
                <TableHead>{t("Client Type")}</TableHead>
                <TableHead>{t("Version")}</TableHead>
                <TableHead>{t("Status")}</TableHead>
                <TableHead>{t("Updated")}</TableHead>
                <TableHead className="text-right">{t("Actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredWorkflows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center py-8 text-gray-500"
                  >
                    {t("No workflows found")}
                  </TableCell>
                </TableRow>
              ) : (
                filteredWorkflows.map((workflow) => (
                  <TableRow key={workflow.id}>
                    <TableCell className="font-medium">
                      {workflow.name}
                    </TableCell>
                    <TableCell>
                      {mockClientTypes.find(
                        (ct) => ct.id === workflow.clientType,
                      )?.name || workflow.clientType}
                    </TableCell>
                    <TableCell>{workflow.version}</TableCell>
                    <TableCell>{getStatusBadge(workflow.status)}</TableCell>
                    <TableCell>
                      {new Date(workflow.updatedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSelectWorkflow(workflow)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        {t("View")}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{t("Import Workflow")}</DialogTitle>
            <DialogDescription>
              {t(
                "Paste the JSON definition of the workflow you want to import.",
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              rows={15}
              placeholder={t("Paste JSON here...")}
              value={importJson}
              onChange={(e) => setImportJson(e.target.value)}
              className="font-mono text-sm"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowImportDialog(false)}
            >
              {t("Cancel")}
            </Button>
            <Button onClick={handleImportWorkflow}>{t("Import")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="flex justify-end">
        <Button variant="outline" onClick={() => setShowImportDialog(true)}>
          <Upload className="mr-2 h-4 w-4" />
          {t("Import Workflow")}
        </Button>
      </div>
    </div>
  );

  const renderWorkflowDetails = () => {
    if (!selectedWorkflow) return null;

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => setActiveTab("list")}>
              <ChevronRight className="h-4 w-4 rotate-180" />
              {t("Back to List")}
            </Button>
            <h2 className="text-2xl font-bold">
              {editMode ? t("Edit Workflow") : selectedWorkflow.name}
            </h2>
            {!editMode && getStatusBadge(selectedWorkflow.status)}
          </div>
          <div className="flex gap-2">
            {!editMode ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => setEditMode(true)}
                  disabled={selectedWorkflow.status === "archived"}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  {t("Edit")}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowVersionDialog(true)}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  {t("New Version")}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowExportDialog(true)}
                >
                  <Code className="mr-2 h-4 w-4" />
                  {t("Export")}
                </Button>
                <AlertDialog
                  open={showDeleteDialog}
                  onOpenChange={setShowDeleteDialog}
                >
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      {t("Delete")}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        {t("Delete Workflow")}
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        {t(
                          "Are you sure you want to delete this workflow? This action cannot be undone.",
                        )}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>{t("Cancel")}</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteWorkflow}>
                        {t("Delete")}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => setEditMode(false)}>
                  <X className="mr-2 h-4 w-4" />
                  {t("Cancel")}
                </Button>
                <Button onClick={handleSaveWorkflow}>
                  <Save className="mr-2 h-4 w-4" />
                  {t("Save")}
                </Button>
              </>
            )}
          </div>
        </div>

        <Tabs defaultValue="general">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">{t("General")}</TabsTrigger>
            <TabsTrigger value="phases">{t("Phases & Steps")}</TabsTrigger>
            <TabsTrigger value="visualization">
              {t("Visualization")}
            </TabsTrigger>
            <TabsTrigger value="json">{t("JSON")}</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4 pt-4">
            <Card>
              <CardHeader>
                <CardTitle>{t("General Information")}</CardTitle>
                <CardDescription>
                  {t("Basic information about the workflow definition")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">{t("Workflow Name")}</Label>
                    <Input
                      id="name"
                      value={selectedWorkflow.name}
                      onChange={(e) =>
                        handleFieldChange("name", e.target.value)
                      }
                      disabled={!editMode}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="version">{t("Version")}</Label>
                    <Input
                      id="version"
                      value={selectedWorkflow.version}
                      disabled
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">{t("Description")}</Label>
                  <Textarea
                    id="description"
                    value={selectedWorkflow.description}
                    onChange={(e) =>
                      handleFieldChange("description", e.target.value)
                    }
                    disabled={!editMode}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="clientType">{t("Client Type")}</Label>
                    <Select
                      value={selectedWorkflow.clientType}
                      onValueChange={(value) =>
                        handleFieldChange("clientType", value)
                      }
                      disabled={!editMode}
                    >
                      <SelectTrigger id="clientType">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {mockClientTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            {t(type.name)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">{t("Status")}</Label>
                    <div className="flex items-center gap-2 h-10">
                      {getStatusBadge(selectedWorkflow.status)}
                      {selectedWorkflow.status === "draft" && !editMode && (
                        <Button size="sm" onClick={handlePublishWorkflow}>
                          <Check className="mr-2 h-4 w-4" />
                          {t("Publish")}
                        </Button>
                      )}
                      {selectedWorkflow.status === "published" && !editMode && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleArchiveWorkflow}
                        >
                          {t("Archive")}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t("Created")}</Label>
                    <div className="h-10 px-3 py-2 rounded-md border border-input bg-background text-sm">
                      {new Date(selectedWorkflow.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>{t("Last Updated")}</Label>
                    <div className="h-10 px-3 py-2 rounded-md border border-input bg-background text-sm">
                      {new Date(selectedWorkflow.updatedAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="phases" className="space-y-4 pt-4">
            <Card>
              <CardHeader>
                <CardTitle>{t("Workflow Phases")}</CardTitle>
                <CardDescription>
                  {t("Define the phases and steps of your workflow")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedWorkflow.phases.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    {t("No phases defined yet")}
                    {editMode && (
                      <div className="mt-4">
                        <Button>
                          <Plus className="mr-2 h-4 w-4" />
                          {t("Add First Phase")}
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {selectedWorkflow.phases
                      .sort((a, b) => a.order - b.order)
                      .map((phase) => (
                        <div key={phase.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h3 className="text-lg font-medium">
                                {phase.name}
                              </h3>
                              <p className="text-sm text-gray-500">
                                {phase.description}
                              </p>
                            </div>
                            {editMode && (
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline">
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button size="sm" variant="destructive">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </div>

                          <div className="space-y-4">
                            {phase.steps.map((step, index) => (
                              <div
                                key={step.id}
                                className="border-l-4 border-blue-500 pl-4 py-2"
                              >
                                <div className="flex items-center justify-between">
                                  <div>
                                    <h4 className="font-medium">{step.name}</h4>
                                    <p className="text-sm text-gray-500">
                                      {step.description}
                                    </p>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                      <Badge variant="outline">
                                        {t(step.type)}
                                      </Badge>
                                      {step.assignedRoles.map((role) => (
                                        <Badge key={role} variant="secondary">
                                          {mockRoles.find((r) => r.id === role)
                                            ?.name || role}
                                        </Badge>
                                      ))}
                                      {step.formId && (
                                        <Badge
                                          variant="outline"
                                          className="bg-purple-100"
                                        >
                                          {mockForms.find(
                                            (f) => f.id === step.formId,
                                          )?.name || step.formId}
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                  {editMode && (
                                    <div className="flex gap-2">
                                      <Button size="sm" variant="outline">
                                        <Edit className="h-4 w-4" />
                                      </Button>
                                      <Button size="sm" variant="destructive">
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  )}
                                </div>

                                {step.transitions.length > 0 && (
                                  <div className="mt-3 pl-4 border-l border-dashed border-gray-300">
                                    <p className="text-sm text-gray-500 mb-1">
                                      {t("Transitions")}:
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                      {step.transitions.map((transition) => (
                                        <Badge
                                          key={transition.id}
                                          className="bg-green-100 text-green-800 hover:bg-green-200"
                                        >
                                          {transition.name} →{" "}
                                          {selectedWorkflow.phases
                                            .flatMap((p) => p.steps)
                                            .find(
                                              (s) =>
                                                s.id ===
                                                transition.targetStepId,
                                            )?.name || transition.targetStepId}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}

                            {editMode && (
                              <Button variant="outline" className="w-full mt-2">
                                <Plus className="mr-2 h-4 w-4" />
                                {t("Add Step")}
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}

                    {editMode && (
                      <Button variant="outline" className="w-full">
                        <Plus className="mr-2 h-4 w-4" />
                        {t("Add Phase")}
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="visualization" className="space-y-4 pt-4">
            <Card>
              <CardHeader>
                <CardTitle>{t("Workflow Visualization")}</CardTitle>
                <CardDescription>
                  {t("Visual representation of the workflow")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedWorkflow && selectedWorkflow.phases.length > 0 ? (
                  <div className="p-4">
                    <div className="flex flex-col gap-8">
                      {selectedWorkflow.phases
                        .sort((a, b) => a.order - b.order)
                        .map((phase, phaseIndex) => (
                          <div key={phase.id} className="relative">
                            {/* Phase header */}
                            <div className="bg-blue-100 p-4 rounded-lg mb-4 border-l-4 border-blue-500">
                              <h3 className="text-lg font-medium">
                                {phaseIndex + 1}. {phase.name}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {phase.description}
                              </p>
                            </div>

                            {/* Steps */}
                            <div className="ml-8">
                              {phase.steps.map((step, stepIndex) => {
                                // Find transitions from this step
                                const transitions = step.transitions || [];

                                return (
                                  <div key={step.id} className="mb-8 relative">
                                    {/* Step box */}
                                    <div className="border rounded-lg p-4 bg-white shadow-sm relative z-10 max-w-md">
                                      <div className="flex items-start justify-between">
                                        <div>
                                          <div className="flex items-center gap-2 mb-1">
                                            {step.type === "task" && (
                                              <FileCheck className="h-4 w-4 text-blue-500" />
                                            )}
                                            {step.type === "approval" && (
                                              <Check className="h-4 w-4 text-green-500" />
                                            )}
                                            {step.type === "notification" && (
                                              <AlertCircle className="h-4 w-4 text-yellow-500" />
                                            )}
                                            {step.type === "condition" && (
                                              <Settings className="h-4 w-4 text-purple-500" />
                                            )}
                                            {step.type === "integration" && (
                                              <Layers className="h-4 w-4 text-indigo-500" />
                                            )}
                                            <h4 className="font-medium">
                                              {phaseIndex + 1}.{stepIndex + 1}{" "}
                                              {step.name}
                                            </h4>
                                          </div>
                                          <p className="text-sm text-gray-500 mb-2">
                                            {step.description}
                                          </p>
                                        </div>

                                        {step.timeoutMinutes && (
                                          <div className="flex items-center text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
                                            <Clock className="h-3 w-3 mr-1" />
                                            {Math.floor(
                                              step.timeoutMinutes / 60,
                                            )}
                                            h {step.timeoutMinutes % 60}m
                                          </div>
                                        )}
                                      </div>

                                      {/* Step metadata */}
                                      <div className="flex flex-wrap gap-2 mt-2">
                                        <Badge
                                          variant="outline"
                                          className="text-xs"
                                        >
                                          {step.type}
                                        </Badge>

                                        {step.assignedRoles &&
                                          step.assignedRoles.length > 0 && (
                                            <Badge
                                              variant="secondary"
                                              className="text-xs flex items-center gap-1"
                                            >
                                              <Users className="h-3 w-3" />
                                              {step.assignedRoles.join(", ")}
                                            </Badge>
                                          )}

                                        {step.formId && (
                                          <Badge
                                            variant="outline"
                                            className="bg-purple-50 text-purple-700 text-xs"
                                          >
                                            {step.formId}
                                          </Badge>
                                        )}
                                      </div>
                                    </div>

                                    {/* Transitions */}
                                    {transitions.length > 0 && (
                                      <div className="mt-4 ml-8">
                                        {transitions.map((transition) => {
                                          // Find the target step
                                          let targetStep;
                                          let targetPhase;

                                          selectedWorkflow.phases.forEach(
                                            (p) => {
                                              const found = p.steps.find(
                                                (s) =>
                                                  s.id ===
                                                  transition.targetStepId,
                                              );
                                              if (found) {
                                                targetStep = found;
                                                targetPhase = p;
                                              }
                                            },
                                          );

                                          return (
                                            <div
                                              key={transition.id}
                                              className="flex items-center mb-2"
                                            >
                                              <ArrowRight className="h-4 w-4 text-gray-400 mr-2" />
                                              <div className="flex items-center gap-1">
                                                <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                                                  {transition.name}
                                                </Badge>
                                                <span className="text-xs text-gray-500">
                                                  → {targetPhase?.name}:{" "}
                                                  {targetStep?.name ||
                                                    transition.targetStepId}
                                                </span>
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>

                            {/* Connector line to next phase */}
                            {phaseIndex <
                              selectedWorkflow.phases.length - 1 && (
                              <div className="flex items-center justify-center my-4">
                                <div className="h-8 border-l-2 border-dashed border-gray-300"></div>
                                <ArrowDown className="h-5 w-5 text-gray-400" />
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-100 rounded-lg p-8 min-h-[400px] flex items-center justify-center">
                    <p className="text-gray-500">
                      {t("No workflow phases defined yet")}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="json" className="space-y-4 pt-4">
            <Card>
              <CardHeader>
                <CardTitle>{t("JSON Definition")}</CardTitle>
                <CardDescription>
                  {t("Raw JSON representation of the workflow definition")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => {
                      navigator.clipboard.writeText(jsonPreview);
                      toast({
                        title: "Copied to clipboard",
                        description: "JSON definition copied to clipboard",
                      });
                    }}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <ScrollArea className="h-[500px] w-full rounded-md border">
                    <pre className="p-4 text-sm">{jsonPreview}</pre>
                  </ScrollArea>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Dialog open={showVersionDialog} onOpenChange={setShowVersionDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("Create New Version")}</DialogTitle>
              <DialogDescription>
                {t("Create a new version of this workflow definition.")}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Label htmlFor="newVersion">{t("Version Number")}</Label>
              <Input
                id="newVersion"
                placeholder="1.0.0"
                value={newVersion}
                onChange={(e) => setNewVersion(e.target.value)}
              />
              <p className="text-sm text-gray-500 mt-2">
                {t("Current version")}: {selectedWorkflow.version}
              </p>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowVersionDialog(false)}
              >
                {t("Cancel")}
              </Button>
              <Button onClick={handleCreateVersion} disabled={!newVersion}>
                {t("Create")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{t("Export Workflow")}</DialogTitle>
              <DialogDescription>
                {t("Export the workflow definition as JSON.")}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <ScrollArea className="h-[300px] w-full rounded-md border">
                <pre className="p-4 text-sm">{jsonPreview}</pre>
              </ScrollArea>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowExportDialog(false)}
              >
                {t("Cancel")}
              </Button>
              <Button onClick={handleExportWorkflow}>{t("Download")}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  };

  return (
    <div className="container mx-auto py-6 max-w-7xl">
      <div className="bg-white rounded-lg shadow-sm p-6">
        {activeTab === "list" ? renderWorkflowList() : renderWorkflowDetails()}
      </div>
    </div>
  );
};

export default WorkflowDefinitionManager;
