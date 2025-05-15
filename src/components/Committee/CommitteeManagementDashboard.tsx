import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Button } from "../ui/button";
import { Plus, Loader2, Bell, FileText, ClipboardList } from "lucide-react";
import { useToast } from "../ui/use-toast";
import { committeeApi } from "@/lib/api/committee/committeeApi";
import { Committee } from "@/lib/api/committee/types";
import CommitteeList from "./CommitteeList";
import CommitteeMeetingSchedule from "./CommitteeMeetingSchedule";
import CommitteeDecisionList from "./CommitteeDecisionList";
import CommitteeForm from "./CommitteeForm";
import CommitteeMemberList from "./CommitteeMemberList";
import SubmissionReviewForm from "./SubmissionReviewForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Badge } from "../ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

const CommitteeManagementDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("committees");
  const [committees, setCommittees] = useState<Committee[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCommittee, setSelectedCommittee] = useState<Committee | null>(
    null,
  );
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [notificationCount, setNotificationCount] = useState(3); // Mock notification count
  const [showMembers, setShowMembers] = useState(false);
  const [pendingSubmissions, setPendingSubmissions] = useState<any[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [isReviewFormOpen, setIsReviewFormOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);

  useEffect(() => {
    fetchCommittees();
    fetchPendingSubmissions();
  }, []);

  const fetchCommittees = async () => {
    setLoading(true);
    try {
      const response = await committeeApi.getCommittees({
        page: 1,
        pageSize: 50,
        sortBy: "name",
        sortDirection: "asc",
      });

      if (response.success && response.data) {
        setCommittees(response.data.items);
      } else {
        // Mock data for development
        const mockCommittees: Committee[] = [
          {
            id: "com-001",
            name: "Assessment Approval Committee",
            description:
              "Reviews and approves assessment reports and recommendations",
            type: "Assessment",
            clientTypeId: 1,
            members: [],
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: "com-002",
            name: "Project Funding Committee",
            description: "Reviews and approves project funding requests",
            type: "Financial",
            clientTypeId: 1,
            members: [],
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: "com-003",
            name: "Quality Assurance Committee",
            description: "Ensures quality standards are met for all projects",
            type: "Quality",
            clientTypeId: 2,
            members: [],
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ];
        setCommittees(mockCommittees);
      }
    } catch (error) {
      console.error("Error fetching committees:", error);
      toast({
        title: "Error",
        description: "Failed to load committees",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCommittee = () => {
    setSelectedCommittee(null);
    setIsCreating(true);
    setIsFormOpen(true);
  };

  const handleEditCommittee = (committee: Committee) => {
    setSelectedCommittee(committee);
    setIsCreating(false);
    setIsFormOpen(true);
  };

  const handleSaveCommittee = async (committeeData: Partial<Committee>) => {
    try {
      if (isCreating) {
        // Create new committee
        const response = await committeeApi.createCommittee(
          committeeData as any,
        );
        if (response.success && response.data) {
          toast({
            title: "Success",
            description: "Committee created successfully",
          });
          fetchCommittees();
        } else {
          throw new Error(response.error || "Failed to create committee");
        }
      } else if (selectedCommittee) {
        // Update existing committee
        const response = await committeeApi.updateCommittee(
          selectedCommittee.id,
          committeeData,
        );
        if (response.success && response.data) {
          toast({
            title: "Success",
            description: "Committee updated successfully",
          });
          fetchCommittees();
        } else {
          throw new Error(response.error || "Failed to update committee");
        }
      }
      setIsFormOpen(false);
    } catch (error) {
      console.error("Error saving committee:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
    }
  };

  const fetchPendingSubmissions = async () => {
    setLoadingSubmissions(true);
    try {
      // Use the first committee as default if available
      const committeeId = committees.length > 0 ? committees[0].id : "com-001";

      const response = await committeeApi.getPendingSubmissions({
        committeeId,
        page: 1,
        pageSize: 10,
      });

      if (response.success && response.data) {
        setPendingSubmissions(response.data.items);
      } else {
        // If API returns no success, use mock data directly
        const mockSubmissions = [
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
            id: "proj-001",
            title: "Project Funding Request for Home Modifications #54321",
            description: "Funding request for comprehensive home modifications",
            type: "project",
            status: "pending_review",
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            beneficiaryId: "ben-54321",
          },
        ];
        setPendingSubmissions(mockSubmissions);
        console.log("Using mock data for pending submissions");
      }
    } catch (error) {
      console.error("Error fetching pending submissions:", error);
      toast({
        title: "Error",
        description: "Failed to load pending submissions",
        variant: "destructive",
      });
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const handleReviewSubmission = (submission: any) => {
    setSelectedSubmission(submission);
    setIsReviewFormOpen(true);
  };

  const handleDecisionComplete = (decision: any) => {
    toast({
      title: "Success",
      description: `Decision submitted: ${decision.decision}`,
    });
    setIsReviewFormOpen(false);
    fetchPendingSubmissions();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>
              {t("committee.title", "Committee Management")}
            </CardTitle>
            <CardDescription>
              {t(
                "committee.description",
                "Manage committees, meetings, and decisions for the organization",
              )}
            </CardDescription>
          </div>
          <Button onClick={handleCreateCommittee}>
            <Plus className="mr-2 h-4 w-4" />
            {t("committee.createCommittee", "Create Committee")}
          </Button>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="committees">
                {t("committee.committees", "Committees")}
              </TabsTrigger>
              <TabsTrigger value="submissions">
                {t("committee.submissions", "Submissions")}
                <Badge variant="secondary" className="ml-2">
                  {pendingSubmissions.length}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value="meetings">
                {t("committee.meetings", "Meetings")}
              </TabsTrigger>
              <TabsTrigger value="decisions">
                {t("committee.decisions", "Decisions")}
              </TabsTrigger>
              <TabsTrigger value="notifications" className="relative">
                {t("committee.notifications", "Notifications")}
                {notificationCount > 0 && (
                  <Badge variant="destructive" className="ml-2">
                    {notificationCount}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="committees" className="mt-6">
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2">
                    {t("common.loading", "Loading...")}
                  </span>
                </div>
              ) : (
                <CommitteeList
                  committees={committees}
                  onEdit={handleEditCommittee}
                  onRefresh={fetchCommittees}
                  setSelectedCommittee={setSelectedCommittee}
                  setShowMembers={setShowMembers}
                />
              )}
            </TabsContent>

            <TabsContent value="submissions" className="mt-6">
              {loadingSubmissions ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2">
                    {t("common.loading", "Loading...")}
                  </span>
                </div>
              ) : pendingSubmissions.length === 0 ? (
                <div className="text-center p-6 border rounded-md">
                  <p className="text-muted-foreground">
                    {t(
                      "committee.noSubmissions",
                      "No pending submissions found",
                    )}
                  </p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("committee.title", "Title")}</TableHead>
                        <TableHead>{t("committee.type", "Type")}</TableHead>
                        <TableHead>{t("committee.date", "Date")}</TableHead>
                        <TableHead>{t("committee.status", "Status")}</TableHead>
                        <TableHead className="text-right">
                          {t("common.actions", "Actions")}
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingSubmissions.map((submission) => (
                        <TableRow key={submission.id}>
                          <TableCell className="font-medium">
                            <div>{submission.title}</div>
                            <div className="text-sm text-muted-foreground">
                              {submission.description}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {submission.type === "assessment"
                                ? t("committee.assessment", "Assessment")
                                : submission.type === "project"
                                  ? t("committee.project", "Project")
                                  : submission.type}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(
                              submission.createdAt,
                            ).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              {submission.status === "pending_review"
                                ? t("committee.pendingReview", "Pending Review")
                                : submission.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              onClick={() => handleReviewSubmission(submission)}
                              size="sm"
                            >
                              <ClipboardList className="h-4 w-4 mr-1" />
                              {t("committee.review", "Review")}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>

            <TabsContent value="meetings" className="mt-6">
              <CommitteeMeetingSchedule committees={committees} />
            </TabsContent>

            <TabsContent value="decisions" className="mt-6">
              <CommitteeDecisionList committees={committees} />
            </TabsContent>

            <TabsContent value="notifications" className="mt-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">
                    {t("committee.notificationCenter", "Notification Center")}
                  </h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setNotificationCount(0)}
                  >
                    {t("committee.markAllRead", "Mark All as Read")}
                  </Button>
                </div>

                <div className="space-y-2">
                  <div className="p-4 border rounded-md bg-muted/50">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">New Meeting Scheduled</h3>
                        <p className="text-sm text-muted-foreground">
                          Assessment Approval Committee - Monthly Assessment
                          Review
                        </p>
                      </div>
                      <Badge>New</Badge>
                    </div>
                    <p className="mt-2 text-sm">
                      A new meeting has been scheduled for tomorrow at 10:00 AM.
                    </p>
                    <div className="mt-3 flex justify-end space-x-2">
                      <Button variant="outline" size="sm">
                        <Bell className="h-4 w-4 mr-1" />
                        {t("committee.remind", "Remind Me")}
                      </Button>
                      <Button size="sm">
                        {t("committee.viewDetails", "View Details")}
                      </Button>
                    </div>
                  </div>

                  <div className="p-4 border rounded-md bg-muted/50">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">
                          Decision Requires Your Approval
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Project Funding Committee - Funding Request for
                          Project #54321
                        </p>
                      </div>
                      <Badge variant="destructive">Urgent</Badge>
                    </div>
                    <p className="mt-2 text-sm">
                      A decision is waiting for your approval before it can be
                      finalized.
                    </p>
                    <div className="mt-3 flex justify-end space-x-2">
                      <Button variant="outline" size="sm">
                        {t("committee.later", "Later")}
                      </Button>
                      <Button size="sm">
                        {t("committee.review", "Review Now")}
                      </Button>
                    </div>
                  </div>

                  <div className="p-4 border rounded-md bg-muted/50">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">
                          Meeting Minutes Available
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Quality Assurance Committee - Final Quality Inspection
                          Review
                        </p>
                      </div>
                      <Badge variant="outline">Info</Badge>
                    </div>
                    <p className="mt-2 text-sm">
                      The minutes from yesterday's meeting are now available for
                      review.
                    </p>
                    <div className="mt-3 flex justify-end space-x-2">
                      <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4 mr-1" />
                        {t("committee.download", "Download")}
                      </Button>
                      <Button size="sm">
                        {t("committee.viewMinutes", "View Minutes")}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {isCreating
                ? t("committee.createCommittee", "Create Committee")
                : t("committee.editCommittee", "Edit Committee")}
            </DialogTitle>
          </DialogHeader>
          <CommitteeForm
            committee={selectedCommittee}
            onSave={handleSaveCommittee}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {selectedCommittee && showMembers && (
        <Dialog open={showMembers} onOpenChange={setShowMembers}>
          <DialogContent className="sm:max-w-[800px]">
            <DialogHeader>
              <DialogTitle>
                {t("committee.committeeMembers", "Committee Members")}:{" "}
                {selectedCommittee.name}
              </DialogTitle>
            </DialogHeader>
            <CommitteeMemberList committeeId={selectedCommittee.id} />
          </DialogContent>
        </Dialog>
      )}

      {selectedSubmission && (
        <Dialog open={isReviewFormOpen} onOpenChange={setIsReviewFormOpen}>
          <DialogContent className="sm:max-w-[900px]">
            <DialogHeader>
              <DialogTitle>
                {t("committee.reviewSubmission", "Review Submission")}
              </DialogTitle>
            </DialogHeader>
            <SubmissionReviewForm
              committeeId={committees.length > 0 ? committees[0].id : "com-001"}
              meetingId="meet-001" // This would typically come from a selected meeting
              submissionId={selectedSubmission.id}
              submissionType={selectedSubmission.type}
              onComplete={handleDecisionComplete}
              onCancel={() => setIsReviewFormOpen(false)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default CommitteeManagementDashboard;
