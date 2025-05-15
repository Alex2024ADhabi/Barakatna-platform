import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { format } from "date-fns";
import {
  Edit,
  Trash2,
  FileText,
  ShoppingCart,
  Loader2,
  Search,
} from "lucide-react";
import { PurchaseRequest } from "@/lib/api/procurement/types";
import { procurementApi } from "@/lib/api/procurement/procurementApi";
import { useToast } from "../ui/use-toast";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Status } from "@/lib/api/core/types";

const PurchaseRequestList: React.FC = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [purchaseRequests, setPurchaseRequests] = useState<PurchaseRequest[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  useEffect(() => {
    fetchPurchaseRequests();
  }, []);

  const fetchPurchaseRequests = async () => {
    setLoading(true);
    try {
      const response = await procurementApi.getPurchaseRequests({
        page: 1,
        pageSize: 50,
        sortBy: "requestDate",
        sortDirection: "desc",
      });

      if (response.success && response.data) {
        setPurchaseRequests(response.data.items);
      } else {
        // Mock data for development
        const mockPurchaseRequests: PurchaseRequest[] = [
          {
            id: "pr-001",
            requestNumber: "PR-2023-001",
            title: "Bathroom Safety Equipment",
            description: "Safety equipment for bathroom modifications",
            projectId: "proj-001",
            assessmentId: "assess-001",
            requestedBy: "Ahmed Al Mansouri",
            requestDate: new Date(),
            status: Status.Pending,
            items: [
              {
                id: "pri-001",
                purchaseRequestId: "pr-001",
                itemName: "Grab Bar",
                description: "Stainless steel grab bar, 24 inches",
                quantity: 5,
                unitPrice: 120,
                unit: "each",
                totalPrice: 600,
                categoryId: "cat-001",
                notes: "For bathroom safety modifications",
              },
              {
                id: "pri-002",
                purchaseRequestId: "pr-001",
                itemName: "Non-slip Floor Mat",
                description: "Rubber non-slip floor mat, 3x5 feet",
                quantity: 3,
                unitPrice: 80,
                unit: "each",
                totalPrice: 240,
                categoryId: "cat-001",
                notes: "For bathroom safety modifications",
              },
            ],
            totalAmount: 840,
            currency: "AED",
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: "pr-002",
            requestNumber: "PR-2023-002",
            title: "Kitchen Accessibility Equipment",
            description: "Accessibility equipment for kitchen modifications",
            projectId: "proj-002",
            requestedBy: "Sarah Johnson",
            requestDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
            status: Status.Approved,
            items: [
              {
                id: "pri-003",
                purchaseRequestId: "pr-002",
                itemName: "Adjustable Counter",
                description: "Height-adjustable kitchen counter, 6 feet",
                quantity: 1,
                unitPrice: 2500,
                unit: "each",
                totalPrice: 2500,
                categoryId: "cat-002",
                notes: "For kitchen accessibility modifications",
              },
              {
                id: "pri-004",
                purchaseRequestId: "pr-002",
                itemName: "Pull-out Shelves",
                description: "Pull-out cabinet shelves",
                quantity: 4,
                unitPrice: 350,
                unit: "each",
                totalPrice: 1400,
                categoryId: "cat-002",
                notes: "For kitchen accessibility modifications",
              },
            ],
            totalAmount: 3900,
            currency: "AED",
            approvedBy: "Mohammed Al Hashimi",
            approvalDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          },
          {
            id: "pr-003",
            requestNumber: "PR-2023-003",
            title: "Bedroom Mobility Equipment",
            description: "Mobility equipment for bedroom modifications",
            projectId: "proj-003",
            assessmentId: "assess-003",
            requestedBy: "Fatima Al Zaabi",
            requestDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
            status: Status.Rejected,
            items: [
              {
                id: "pri-005",
                purchaseRequestId: "pr-003",
                itemName: "Ceiling Lift",
                description: "Ceiling-mounted patient lift system",
                quantity: 1,
                unitPrice: 8000,
                unit: "each",
                totalPrice: 8000,
                categoryId: "cat-003",
                notes: "For bedroom mobility assistance",
              },
            ],
            totalAmount: 8000,
            currency: "AED",
            notes:
              "Rejected due to budget constraints. Consider alternative solutions.",
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
            updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
          },
        ];
        setPurchaseRequests(mockPurchaseRequests);
      }
    } catch (error) {
      console.error("Error fetching purchase requests:", error);
      toast({
        title: "Error",
        description: "Failed to load purchase requests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePurchaseOrder = (purchaseRequest: PurchaseRequest) => {
    // Logic to create purchase order from request
    toast({
      title: "Create Purchase Order",
      description: `Creating purchase order from request ${purchaseRequest.requestNumber}`,
    });
  };

  const handleEdit = (purchaseRequest: PurchaseRequest) => {
    // Logic to edit purchase request
    toast({
      title: "Edit Purchase Request",
      description: `Editing purchase request ${purchaseRequest.requestNumber}`,
    });
  };

  const handleDelete = (purchaseRequest: PurchaseRequest) => {
    // Logic to delete purchase request
    toast({
      title: "Delete Purchase Request",
      description: `Deleting purchase request ${purchaseRequest.requestNumber}`,
      variant: "destructive",
    });
  };

  const handleViewDetails = (purchaseRequest: PurchaseRequest) => {
    // Logic to view purchase request details
    toast({
      title: "View Details",
      description: `Viewing details for purchase request ${purchaseRequest.requestNumber}`,
    });
  };

  const handleApprove = (purchaseRequest: PurchaseRequest) => {
    // Logic to approve purchase request
    toast({
      title: "Approve Purchase Request",
      description: `Approving purchase request ${purchaseRequest.requestNumber}`,
      variant: "default",
    });
  };

  const handleReject = (purchaseRequest: PurchaseRequest) => {
    // Logic to reject purchase request
    toast({
      title: "Reject Purchase Request",
      description: `Rejecting purchase request ${purchaseRequest.requestNumber}`,
      variant: "destructive",
    });
  };

  const getStatusBadgeVariant = (
    status: Status,
  ): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case Status.Approved:
        return "default";
      case Status.Pending:
        return "secondary";
      case Status.Rejected:
        return "destructive";
      default:
        return "outline";
    }
  };

  const filteredPurchaseRequests = purchaseRequests.filter((pr) => {
    const matchesSearch = searchTerm
      ? pr.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pr.requestNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pr.description.toLowerCase().includes(searchTerm.toLowerCase())
      : true;

    const matchesStatus = statusFilter ? pr.status === statusFilter : true;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("procurement.searchRequests", "Search requests...")}
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue
                placeholder={t(
                  "procurement.filterByStatus",
                  "Filter by status",
                )}
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">
                {t("procurement.allStatuses", "All Statuses")}
              </SelectItem>
              <SelectItem value={Status.Pending}>
                {t("procurement.pending", "Pending")}
              </SelectItem>
              <SelectItem value={Status.Approved}>
                {t("procurement.approved", "Approved")}
              </SelectItem>
              <SelectItem value={Status.Rejected}>
                {t("procurement.rejected", "Rejected")}
              </SelectItem>
              <SelectItem value={Status.Completed}>
                {t("procurement.completed", "Completed")}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">{t("common.loading", "Loading...")}</span>
        </div>
      ) : filteredPurchaseRequests.length === 0 ? (
        <div className="text-center p-6 border rounded-md">
          <p className="text-muted-foreground">
            {t("procurement.noRequests", "No purchase requests found")}
          </p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  {t("procurement.requestNumber", "Request #")}
                </TableHead>
                <TableHead>{t("procurement.title", "Title")}</TableHead>
                <TableHead>
                  {t("procurement.requestedBy", "Requested By")}
                </TableHead>
                <TableHead>{t("procurement.date", "Date")}</TableHead>
                <TableHead>{t("procurement.amount", "Amount")}</TableHead>
                <TableHead>{t("procurement.status", "Status")}</TableHead>
                <TableHead className="text-right">
                  {t("common.actions", "Actions")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPurchaseRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>{request.requestNumber}</TableCell>
                  <TableCell className="font-medium">
                    <div>{request.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {request.description}
                    </div>
                  </TableCell>
                  <TableCell>{request.requestedBy}</TableCell>
                  <TableCell>
                    {format(new Date(request.requestDate), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>
                    {request.totalAmount.toFixed(2)} {request.currency}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(request.status)}>
                      {request.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(request)}
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                      {request.status === Status.Pending && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(request)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      {request.status === Status.Pending && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(request)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                      {request.status === Status.Pending && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-green-50 hover:bg-green-100 text-green-600"
                            onClick={() => handleApprove(request)}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-red-50 hover:bg-red-100 text-red-600"
                            onClick={() => handleReject(request)}
                          >
                            Reject
                          </Button>
                        </>
                      )}
                      {request.status === Status.Approved && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCreatePurchaseOrder(request)}
                        >
                          <ShoppingCart className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default PurchaseRequestList;
