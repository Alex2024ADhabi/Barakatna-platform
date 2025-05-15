import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
import { useTranslatedDirection } from "@/hooks/useTranslatedDirection";
import { BudgetApprovalRequest } from "@/lib/api/budget/types";
import { budgetApi } from "@/lib/api/budget/budgetApi";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertCircle,
  Check,
  Clock,
  Filter,
  Loader2,
  RefreshCw,
  Search,
  X,
} from "lucide-react";

interface BudgetApprovalWorkflowProps {
  userId?: string;
  isApprover?: boolean;
}

const BudgetApprovalWorkflow = ({
  userId = "current-user",
  isApprover = true,
}: BudgetApprovalWorkflowProps) => {
  const { t } = useTranslation();
  const dir = useTranslatedDirection();
  const [approvalRequests, setApprovalRequests] = useState<
    BudgetApprovalRequest[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");
  const [selectedRequest, setSelectedRequest] =
    useState<BudgetApprovalRequest | null>(null);
  const [approvalNotes, setApprovalNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Mock data for approval requests
  const mockApprovalRequests: BudgetApprovalRequest[] = [
    {
      id: "1",
      budgetId: "1",
      requestType: "creation",
      requestedBy: "user1",
      requestedAt: "2023-06-15T10:30:00Z",
      status: "pending",
      budget: {
        id: "1",
        name: "Annual Operations Budget",
        description: "Budget for annual operations and maintenance",
        clientId: "client1",
        fiscalYear: 2023,
        startDate: "2023-01-01",
        endDate: "2023-12-31",
        totalAmount: 500000,
        currency: "USD",
        status: "draft",
        createdAt: "2023-06-15T10:30:00Z",
        updatedAt: "2023-06-15T10:30:00Z",
        createdBy: "user1",
      },
    },
    {
      id: "2",
      budgetId: "2",
      requestType: "revision",
      requestedBy: "user2",
      requestedAt: "2023-06-16T14:45:00Z",
      status: "pending",
      revision: {
        id: "1",
        budgetId: "2",
        revisionNumber: 1,
        previousAmount: 250000,
        newAmount: 300000,
        reason: "Additional scope added to project",
        status: "pending",
        createdAt: "2023-06-16T14:45:00Z",
        updatedAt: "2023-06-16T14:45:00Z",
        createdBy: "user2",
      },
    },
    {
      id: "3",
      budgetId: "1",
      requestType: "expense",
      requestedBy: "user3",
      requestedAt: "2023-06-17T09:15:00Z",
      status: "pending",
      expense: {
        id: "3",
        budgetId: "1",
        categoryId: "1",
        description: "Emergency equipment purchase",
        amount: 15000,
        date: "2023-06-17",
        status: "pending",
        createdAt: "2023-06-17T09:15:00Z",
        updatedAt: "2023-06-17T09:15:00Z",
        createdBy: "user3",
      },
    },
    {
      id: "4",
      budgetId: "3",
      requestType: "creation",
      requestedBy: "user1",
      requestedAt: "2023-06-10T11:20:00Z",
      status: "approved",
      approvedBy: "user4",
      approvedAt: "2023-06-12T15:30:00Z",
      notes: "Approved as per department guidelines",
      budget: {
        id: "3",
        name: "Department Operational Budget",
        description: "Annual budget for assessment department operations",
        clientId: "client1",
        departmentId: "dept1",
        fiscalYear: 2023,
        startDate: "2023-01-01",
        endDate: "2023-12-31",
        totalAmount: 120000,
        currency: "USD",
        status: "active",
        createdAt: "2023-06-10T11:20:00Z",
        updatedAt: "2023-06-12T15:30:00Z",
        createdBy: "user1",
      },
    },
    {
      id: "5",
      budgetId: "2",
      requestType: "expense",
      requestedBy: "user2",
      requestedAt: "2023-06-08T13:40:00Z",
      status: "rejected",
      approvedBy: "user4",
      approvedAt: "2023-06-09T10:15:00Z",
      notes:
        "Expense exceeds category limit. Please resubmit with proper justification.",
      expense: {
        id: "4",
        budgetId: "2",
        categoryId: "5",
        description: "Consultant fees",
        amount: 25000,
        date: "2023-06-08",
        status: "rejected",
        createdAt: "2023-06-08T13:40:00Z",
        updatedAt: "2023-06-09T10:15:00Z",
        createdBy: "user2",
      },
    },
  ];

  useEffect(() => {
    // In a real implementation, this would fetch from the API
    setApprovalRequests(mockApprovalRequests);
    setLoading(false);
  }, []);

  const handleApprove = async () => {
    if (!selectedRequest) return;

    try {
      setSubmitting(true);

      // In a real implementation, this would call the API
      setTimeout(() => {
        const updatedRequests = approvalRequests.map((request) =>
          request.id === selectedRequest.id
            ? {
                ...request,
                status: "approved",
                approvedBy: userId,
                approvedAt: new Date().toISOString(),
                notes: approvalNotes || undefined,
              }
            : request,
        );

        setApprovalRequests(updatedRequests);
        setSelectedRequest(null);
        setApprovalNotes("");
        setSubmitting(false);
      }, 1000);
    } catch (error) {
      console.error("Error approving request:", error);
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest) return;

    if (!approvalNotes) {
      alert(t("budget.rejectionRequiresNotes"));
      return;
    }

    try {
      setSubmitting(true);

      // In a real implementation, this would call the API
      setTimeout(() => {
        const updatedRequests = approvalRequests.map((request) =>
          request.id === selectedRequest.id
            ? {
                ...request,
                status: "rejected",
                approvedBy: userId,
                approvedAt: new Date().toISOString(),
                notes: approvalNotes,
              }
            : request,
        );

        setApprovalRequests(updatedRequests);
        setSelectedRequest(null);
        setApprovalNotes("");
        setSubmitting(false);
      }, 1000);
    } catch (error) {
      console.error("Error rejecting request:", error);
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge className="bg-green-500">
            <Check className="mr-1 h-3 w-3" /> {t("budget.approved")}
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="outline" className="text-amber-500 border-amber-500">
            <Clock className="mr-1 h-3 w-3" /> {t("budget.pending")}
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-500">
            <X className="mr-1 h-3 w-3" /> {t("budget.rejected")}
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getRequestTypeBadge = (type: string) => {
    switch (type) {
      case "creation":
        return (
          <Badge
            variant="outline"
            className="bg-blue-100 text-blue-800 border-blue-200"
          >
            {t("budget.budgetCreation")}
          </Badge>
        );
      case "revision":
        return (
          <Badge
            variant="outline"
            className="bg-purple-100 text-purple-800 border-purple-200"
          >
            {t("budget.budgetRevision")}
          </Badge>
        );
      case "expense":
        return (
          <Badge
            variant="outline"
            className="bg-orange-100 text-orange-800 border-orange-200"
          >
            {t("budget.expenseApproval")}
          </Badge>
        );
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const filteredRequests = approvalRequests.filter((request) => {
    if (activeTab === "pending") return request.status === "pending";
    if (activeTab === "approved") return request.status === "approved";
    if (activeTab === "rejected") return request.status === "rejected";
    return true;
  });

  const getRequestDetails = (request: BudgetApprovalRequest) => {
    switch (request.requestType) {
      case "creation":
        return request.budget ? (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-sm font-medium">{t("budget.name")}:</p>
                <p className="text-sm">{request.budget.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium">{t("budget.amount")}:</p>
                <p className="text-sm">
                  {new Intl.NumberFormat(undefined, {
                    style: "currency",
                    currency: request.budget.currency,
                    maximumFractionDigits: 0,
                  }).format(request.budget.totalAmount)}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-sm font-medium">{t("budget.fiscalYear")}:</p>
                <p className="text-sm">{request.budget.fiscalYear}</p>
              </div>
              <div>
                <p className="text-sm font-medium">{t("budget.period")}:</p>
                <p className="text-sm">
                  {new Date(request.budget.startDate).toLocaleDateString()} -{" "}
                  {new Date(request.budget.endDate).toLocaleDateString()}
                </p>
              </div>
            </div>
            {request.budget.description && (
              <div>
                <p className="text-sm font-medium">
                  {t("common.description")}:
                </p>
                <p className="text-sm">{request.budget.description}</p>
              </div>
            )}
          </div>
        ) : null;
      case "revision":
        return request.revision ? (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-sm font-medium">
                  {t("budget.revisionNumber")}:
                </p>
                <p className="text-sm">{request.revision.revisionNumber}</p>
              </div>
              <div>
                <p className="text-sm font-medium">{t("budget.budgetId")}:</p>
                <p className="text-sm">{request.revision.budgetId}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-sm font-medium">
                  {t("budget.previousAmount")}:
                </p>
                <p className="text-sm">
                  {new Intl.NumberFormat(undefined, {
                    style: "currency",
                    currency: "USD",
                    maximumFractionDigits: 0,
                  }).format(request.revision.previousAmount)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">{t("budget.newAmount")}:</p>
                <p className="text-sm">
                  {new Intl.NumberFormat(undefined, {
                    style: "currency",
                    currency: "USD",
                    maximumFractionDigits: 0,
                  }).format(request.revision.newAmount)}
                </p>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium">{t("budget.reason")}:</p>
              <p className="text-sm">{request.revision.reason}</p>
            </div>
          </div>
        ) : null;
      case "expense":
        return request.expense ? (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-sm font-medium">{t("budget.budgetId")}:</p>
                <p className="text-sm">{request.expense.budgetId}</p>
              </div>
              <div>
                <p className="text-sm font-medium">{t("budget.categoryId")}:</p>
                <p className="text-sm">{request.expense.categoryId}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-sm font-medium">{t("budget.amount")}:</p>
                <p className="text-sm">
                  {new Intl.NumberFormat(undefined, {
                    style: "currency",
                    currency: "USD",
                    maximumFractionDigits: 0,
                  }).format(request.expense.amount)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">{t("common.date")}:</p>
                <p className="text-sm">
                  {new Date(request.expense.date).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium">{t("common.description")}:</p>
              <p className="text-sm">{request.expense.description}</p>
            </div>
          </div>
        ) : null;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{t("budget.approvalWorkflow")}</CardTitle>
            <CardDescription>
              {t("budget.approvalWorkflowDescription")}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => window.location.reload()}>
              <RefreshCw className="mr-2 h-4 w-4" /> {t("common.refresh")}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs
          defaultValue="pending"
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <TabsList>
            <TabsTrigger value="pending">
              {t("budget.pendingApprovals")}
            </TabsTrigger>
            <TabsTrigger value="approved">{t("budget.approved")}</TabsTrigger>
            <TabsTrigger value="rejected">{t("budget.rejected")}</TabsTrigger>
            <TabsTrigger value="all">{t("common.all")}</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder={t("common.search")} className="pl-8" />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" /> {t("common.filter")}
              </Button>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("budget.requestType")}</TableHead>
                    <TableHead>{t("budget.requestedBy")}</TableHead>
                    <TableHead>{t("budget.requestedAt")}</TableHead>
                    <TableHead>{t("common.status")}</TableHead>
                    <TableHead>{t("common.actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4">
                        {t("common.loading")}
                      </TableCell>
                    </TableRow>
                  ) : filteredRequests.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4">
                        {t("budget.noApprovalRequests")}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell>
                          {getRequestTypeBadge(request.requestType)}
                        </TableCell>
                        <TableCell>{request.requestedBy}</TableCell>
                        <TableCell>
                          {new Date(request.requestedAt).toLocaleString()}
                        </TableCell>
                        <TableCell>{getStatusBadge(request.status)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedRequest(request)}
                            >
                              {t("common.view")}
                            </Button>
                            {isApprover && request.status === "pending" && (
                              <>
                                <Button
                                  variant="default"
                                  size="sm"
                                  className="bg-green-600 hover:bg-green-700"
                                  onClick={() => setSelectedRequest(request)}
                                >
                                  {t("budget.approve")}
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => setSelectedRequest(request)}
                                >
                                  {t("budget.reject")}
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>

        {selectedRequest && (
          <div className="mt-6 border rounded-md p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-medium">
                  {t("budget.requestDetails")}
                </h3>
                {getRequestTypeBadge(selectedRequest.requestType)}
                {getStatusBadge(selectedRequest.status)}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedRequest(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4">
              {getRequestDetails(selectedRequest)}

              {selectedRequest.status !== "pending" && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm font-medium">
                    {selectedRequest.status === "approved"
                      ? t("budget.approvedBy")
                      : t("budget.rejectedBy")}
                    :
                  </p>
                  <p className="text-sm">{selectedRequest.approvedBy}</p>
                  <p className="text-sm font-medium mt-2">
                    {selectedRequest.status === "approved"
                      ? t("budget.approvedAt")
                      : t("budget.rejectedAt")}
                    :
                  </p>
                  <p className="text-sm">
                    {selectedRequest.approvedAt
                      ? new Date(selectedRequest.approvedAt).toLocaleString()
                      : ""}
                  </p>
                  {selectedRequest.notes && (
                    <>
                      <p className="text-sm font-medium mt-2">
                        {t("common.notes")}:
                      </p>
                      <p className="text-sm">{selectedRequest.notes}</p>
                    </>
                  )}
                </div>
              )}

              {isApprover && selectedRequest.status === "pending" && (
                <div className="mt-4 pt-4 border-t">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="approvalNotes">
                        {t("budget.approvalNotes")}
                      </Label>
                      <Textarea
                        id="approvalNotes"
                        placeholder={t("budget.approvalNotesPlaceholder")}
                        value={approvalNotes}
                        onChange={(e) => setApprovalNotes(e.target.value)}
                        rows={3}
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setSelectedRequest(null)}
                        disabled={submitting}
                      >
                        {t("common.cancel")}
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={handleReject}
                        disabled={submitting}
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {t("common.processing")}
                          </>
                        ) : (
                          <>
                            <X className="mr-2 h-4 w-4" />
                            {t("budget.reject")}
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={handleApprove}
                        disabled={submitting}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {t("common.processing")}
                          </>
                        ) : (
                          <>
                            <Check className="mr-2 h-4 w-4" />
                            {t("budget.approve")}
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BudgetApprovalWorkflow;
