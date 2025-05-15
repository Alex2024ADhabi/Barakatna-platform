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
import { FileText, Download, Loader2, Search, Truck } from "lucide-react";
import { PurchaseOrder } from "@/lib/api/procurement/types";
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

const PurchaseOrderList: React.FC = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  useEffect(() => {
    fetchPurchaseOrders();
  }, []);

  const fetchPurchaseOrders = async () => {
    setLoading(true);
    try {
      const response = await procurementApi.getPurchaseOrders({
        page: 1,
        pageSize: 50,
        sortBy: "orderDate",
        sortDirection: "desc",
      });

      if (response.success && response.data) {
        setPurchaseOrders(response.data.items);
      } else {
        // Mock data for development
        const mockPurchaseOrders: PurchaseOrder[] = [
          {
            id: "po-001",
            orderNumber: "PO-2023-001",
            purchaseRequestId: "pr-002",
            title: "Kitchen Accessibility Equipment",
            description: "Accessibility equipment for kitchen modifications",
            supplierId: "sup-001",
            projectId: "proj-002",
            orderDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
            expectedDeliveryDate: new Date(
              Date.now() + 7 * 24 * 60 * 60 * 1000,
            ), // 7 days from now
            status: Status.Pending,
            items: [
              {
                id: "poi-001",
                purchaseOrderId: "po-001",
                purchaseRequestItemId: "pri-003",
                itemName: "Adjustable Counter",
                description: "Height-adjustable kitchen counter, 6 feet",
                quantity: 1,
                unitPrice: 2500,
                unit: "each",
                totalPrice: 2500,
                categoryId: "cat-002",
                notes: "For kitchen accessibility modifications",
                receivedQuantity: 0,
              },
              {
                id: "poi-002",
                purchaseOrderId: "po-001",
                purchaseRequestItemId: "pri-004",
                itemName: "Pull-out Shelves",
                description: "Pull-out cabinet shelves",
                quantity: 4,
                unitPrice: 350,
                unit: "each",
                totalPrice: 1400,
                categoryId: "cat-002",
                notes: "For kitchen accessibility modifications",
                receivedQuantity: 0,
              },
            ],
            subtotal: 3900,
            taxAmount: 195,
            discountAmount: 0,
            totalAmount: 4095,
            currency: "AED",
            paymentTerms: "Net 30",
            deliveryTerms: "Delivery to project site",
            approvedBy: "Mohammed Al Hashimi",
            approvalDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          },
          {
            id: "po-002",
            orderNumber: "PO-2023-002",
            title: "Bathroom Safety Equipment",
            description: "Safety equipment for bathroom modifications",
            supplierId: "sup-002",
            projectId: "proj-001",
            assessmentId: "assess-001",
            orderDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
            expectedDeliveryDate: new Date(
              Date.now() - 3 * 24 * 60 * 60 * 1000,
            ), // 3 days ago
            actualDeliveryDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
            status: Status.Completed,
            items: [
              {
                id: "poi-003",
                purchaseOrderId: "po-002",
                itemName: "Grab Bar",
                description: "Stainless steel grab bar, 24 inches",
                quantity: 5,
                unitPrice: 120,
                unit: "each",
                totalPrice: 600,
                categoryId: "cat-001",
                notes: "For bathroom safety modifications",
                receivedQuantity: 5,
                receivedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
              },
              {
                id: "poi-004",
                purchaseOrderId: "po-002",
                itemName: "Non-slip Floor Mat",
                description: "Rubber non-slip floor mat, 3x5 feet",
                quantity: 3,
                unitPrice: 80,
                unit: "each",
                totalPrice: 240,
                categoryId: "cat-001",
                notes: "For bathroom safety modifications",
                receivedQuantity: 3,
                receivedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
              },
            ],
            subtotal: 840,
            taxAmount: 42,
            discountAmount: 0,
            totalAmount: 882,
            currency: "AED",
            paymentTerms: "Net 30",
            deliveryTerms: "Delivery to project site",
            approvedBy: "Ahmed Al Mansouri",
            approvalDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
            createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
            updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          },
          {
            id: "po-003",
            orderNumber: "PO-2023-003",
            title: "Bedroom Mobility Equipment",
            description: "Alternative mobility equipment for bedroom",
            supplierId: "sup-003",
            projectId: "proj-003",
            assessmentId: "assess-003",
            orderDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
            expectedDeliveryDate: new Date(
              Date.now() + 10 * 24 * 60 * 60 * 1000,
            ), // 10 days from now
            status: Status.Pending,
            items: [
              {
                id: "poi-005",
                purchaseOrderId: "po-003",
                itemName: "Mobile Patient Lift",
                description: "Mobile floor-based patient lift system",
                quantity: 1,
                unitPrice: 4500,
                unit: "each",
                totalPrice: 4500,
                categoryId: "cat-003",
                notes: "Alternative to ceiling lift",
                receivedQuantity: 0,
              },
              {
                id: "poi-006",
                purchaseOrderId: "po-003",
                itemName: "Transfer Board",
                description: "Patient transfer board, 30 inches",
                quantity: 2,
                unitPrice: 250,
                unit: "each",
                totalPrice: 500,
                categoryId: "cat-003",
                notes: "For patient transfers",
                receivedQuantity: 0,
              },
            ],
            subtotal: 5000,
            taxAmount: 250,
            discountAmount: 500,
            totalAmount: 4750,
            currency: "AED",
            paymentTerms: "Net 30",
            deliveryTerms: "Delivery to project site",
            approvedBy: "Fatima Al Zaabi",
            approvalDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          },
        ];
        setPurchaseOrders(mockPurchaseOrders);
      }
    } catch (error) {
      console.error("Error fetching purchase orders:", error);
      toast({
        title: "Error",
        description: "Failed to load purchase orders",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (purchaseOrder: PurchaseOrder) => {
    // Logic to view purchase order details
    toast({
      title: "View Details",
      description: `Viewing details for purchase order ${purchaseOrder.orderNumber}`,
    });
  };

  const handleExportPdf = async (purchaseOrder: PurchaseOrder) => {
    try {
      // Logic to export purchase order as PDF
      toast({
        title: "Export PDF",
        description: `Exporting purchase order ${purchaseOrder.orderNumber} as PDF`,
      });

      // In a real implementation, this would call the API and handle the download
      // const response = await procurementApi.exportPurchaseOrderAsPdf(purchaseOrder.id);
      // if (response.success && response.data) {
      //   // Handle the download
      // }
    } catch (error) {
      console.error("Error exporting purchase order:", error);
      toast({
        title: "Error",
        description: "Failed to export purchase order",
        variant: "destructive",
      });
    }
  };

  const handleMarkDelivered = (purchaseOrder: PurchaseOrder) => {
    // Logic to mark purchase order as delivered
    toast({
      title: "Mark Delivered",
      description: `Marking purchase order ${purchaseOrder.orderNumber} as delivered`,
    });
  };

  const getStatusBadgeVariant = (
    status: Status,
  ): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case Status.Completed:
        return "default";
      case Status.Pending:
        return "secondary";
      case Status.Cancelled:
        return "destructive";
      default:
        return "outline";
    }
  };

  const filteredPurchaseOrders = purchaseOrders.filter((po) => {
    const matchesSearch = searchTerm
      ? po.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        po.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        po.description.toLowerCase().includes(searchTerm.toLowerCase())
      : true;

    const matchesStatus = statusFilter ? po.status === statusFilter : true;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("procurement.searchOrders", "Search orders...")}
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
              <SelectItem value={Status.Completed}>
                {t("procurement.completed", "Completed")}
              </SelectItem>
              <SelectItem value={Status.Cancelled}>
                {t("procurement.cancelled", "Cancelled")}
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
      ) : filteredPurchaseOrders.length === 0 ? (
        <div className="text-center p-6 border rounded-md">
          <p className="text-muted-foreground">
            {t("procurement.noOrders", "No purchase orders found")}
          </p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("procurement.orderNumber", "Order #")}</TableHead>
                <TableHead>{t("procurement.title", "Title")}</TableHead>
                <TableHead>{t("procurement.supplier", "Supplier")}</TableHead>
                <TableHead>
                  {t("procurement.orderDate", "Order Date")}
                </TableHead>
                <TableHead>
                  {t("procurement.deliveryDate", "Delivery Date")}
                </TableHead>
                <TableHead>{t("procurement.amount", "Amount")}</TableHead>
                <TableHead>{t("procurement.status", "Status")}</TableHead>
                <TableHead className="text-right">
                  {t("common.actions", "Actions")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPurchaseOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>{order.orderNumber}</TableCell>
                  <TableCell className="font-medium">
                    <div>{order.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {order.description}
                    </div>
                  </TableCell>
                  <TableCell>{order.supplierId}</TableCell>
                  <TableCell>
                    {format(new Date(order.orderDate), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>
                    {order.actualDeliveryDate
                      ? format(
                          new Date(order.actualDeliveryDate),
                          "MMM d, yyyy",
                        )
                      : format(
                          new Date(order.expectedDeliveryDate),
                          "MMM d, yyyy",
                        ) + " (Expected)"}
                  </TableCell>
                  <TableCell>
                    {order.totalAmount.toFixed(2)} {order.currency}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(order.status)}>
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(order)}
                      >
                        <FileText className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleExportPdf(order)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      {order.status === Status.Pending &&
                        !order.actualDeliveryDate && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleMarkDelivered(order)}
                          >
                            <Truck className="h-4 w-4" />
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

export default PurchaseOrderList;
