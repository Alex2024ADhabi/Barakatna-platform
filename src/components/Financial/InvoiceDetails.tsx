import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  exportInvoice,
  sendInvoiceByEmail,
  approveInvoice,
} from "@/lib/api/financial/financialApi";
import { Invoice, InvoiceStatus } from "@/lib/api/financial/types";
import PaymentForm from "./PaymentForm";
import {
  Download,
  Mail,
  CreditCard,
  FileText,
  Check,
  X,
  Edit,
  Printer,
} from "lucide-react";

interface InvoiceDetailsProps {
  invoice: Invoice;
  onEdit?: () => void;
  onRefresh: () => void;
}

const InvoiceDetails: React.FC<InvoiceDetailsProps> = ({
  invoice,
  onEdit,
  onRefresh,
}) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showPaymentForm, setShowPaymentForm] = useState<boolean>(false);

  // Status color mapping
  const getStatusColor = (status: InvoiceStatus) => {
    switch (status) {
      case InvoiceStatus.Draft:
        return "bg-gray-200 text-gray-800";
      case InvoiceStatus.Pending:
        return "bg-yellow-100 text-yellow-800";
      case InvoiceStatus.Approved:
        return "bg-blue-100 text-blue-800";
      case InvoiceStatus.Paid:
        return "bg-green-100 text-green-800";
      case InvoiceStatus.PartiallyPaid:
        return "bg-teal-100 text-teal-800";
      case InvoiceStatus.Overdue:
        return "bg-red-100 text-red-800";
      case InvoiceStatus.Cancelled:
        return "bg-gray-100 text-gray-800";
      case InvoiceStatus.Rejected:
        return "bg-red-200 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Format date
  const formatDate = (date: Date | string) => {
    return format(new Date(date), "MMM d, yyyy");
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return amount.toLocaleString("en-US", {
      style: "currency",
      currency: "SAR",
    });
  };

  // Handle invoice export
  const handleExport = async (format: "pdf" | "excel" | "csv") => {
    setLoading(true);
    setError(null);
    try {
      const response = await exportInvoice(invoice.id, format);
      if (response.success && response.data) {
        window.open(response.data, "_blank");
      } else {
        setError(response.error || `Failed to export invoice as ${format}`);
      }
    } catch (err) {
      setError(`An error occurred while exporting the invoice as ${format}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle send email
  const handleSendEmail = async () => {
    const email = prompt(t("Enter email address to send the invoice:"));
    if (email) {
      setLoading(true);
      setError(null);
      try {
        const response = await sendInvoiceByEmail(invoice.id, email);
        if (response.success) {
          alert(t("Invoice sent successfully"));
        } else {
          setError(response.error || "Failed to send invoice");
        }
      } catch (err) {
        setError("An error occurred while sending the invoice");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };

  // Handle invoice approval
  const handleApproval = async (action: "approve" | "reject") => {
    setLoading(true);
    setError(null);
    try {
      const comments =
        action === "reject"
          ? prompt(t("Please provide a reason for rejection:")) || ""
          : undefined;
      const response = await approveInvoice({
        invoiceId: invoice.id,
        action,
        comments,
      });
      if (response.success) {
        onRefresh();
      } else {
        setError(response.error || `Failed to ${action} invoice`);
      }
    } catch (err) {
      setError(`An error occurred while ${action}ing the invoice`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle print
  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl">
                {t("Invoice")} #{invoice.invoiceNumber}
              </CardTitle>
              <CardDescription>
                {t("Created on")} {formatDate(invoice.createdAt)}
              </CardDescription>
            </div>
            <Badge className={getStatusColor(invoice.status)}>
              {t(invoice.status)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Client and Invoice Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-2">
                {t("Client Information")}
              </h3>
              <div className="space-y-1">
                <p>
                  <strong>{t("Client Name")}:</strong> {invoice.clientName}
                </p>
                <p>
                  <strong>{t("Client Type")}:</strong> {invoice.clientType}
                </p>
                {invoice.projectId && (
                  <p>
                    <strong>{t("Project")}:</strong>{" "}
                    {invoice.projectName || invoice.projectId}
                  </p>
                )}
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2">
                {t("Invoice Details")}
              </h3>
              <div className="space-y-1">
                <p>
                  <strong>{t("Issue Date")}:</strong>{" "}
                  {formatDate(invoice.issueDate)}
                </p>
                <p>
                  <strong>{t("Due Date")}:</strong>{" "}
                  {formatDate(invoice.dueDate)}
                </p>
                <p>
                  <strong>{t("Payment Terms")}:</strong>{" "}
                  {invoice.paymentTerms || t("Not specified")}
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Invoice Items */}
          <div>
            <h3 className="text-lg font-medium mb-4">{t("Invoice Items")}</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("Description")}</TableHead>
                  <TableHead className="text-right">{t("Quantity")}</TableHead>
                  <TableHead className="text-right">
                    {t("Unit Price")}
                  </TableHead>
                  <TableHead className="text-right">{t("Tax")}</TableHead>
                  <TableHead className="text-right">{t("Discount")}</TableHead>
                  <TableHead className="text-right">{t("Total")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoice.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.description}</TableCell>
                    <TableCell className="text-right">
                      {item.quantity}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(item.unitPrice)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(item.taxAmount || 0)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(item.discount || 0)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(item.totalAmount)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <Separator />

          {/* Invoice Summary */}
          <div className="flex justify-end">
            <div className="w-full md:w-1/3 space-y-2">
              <div className="flex justify-between">
                <span>{t("Subtotal")}:</span>
                <span>{formatCurrency(invoice.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>{t("Tax")}:</span>
                <span>{formatCurrency(invoice.taxAmount)}</span>
              </div>
              {invoice.discountAmount && invoice.discountAmount > 0 && (
                <div className="flex justify-between">
                  <span>{t("Discount")}:</span>
                  <span>-{formatCurrency(invoice.discountAmount)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-bold">
                <span>{t("Total")}:</span>
                <span>{formatCurrency(invoice.totalAmount)}</span>
              </div>
              {invoice.paidAmount !== undefined && invoice.paidAmount > 0 && (
                <>
                  <div className="flex justify-between text-green-600">
                    <span>{t("Paid")}:</span>
                    <span>{formatCurrency(invoice.paidAmount)}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>{t("Balance Due")}:</span>
                    <span>
                      {formatCurrency(
                        invoice.balanceDue ||
                          invoice.totalAmount - invoice.paidAmount,
                      )}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div>
              <h3 className="text-lg font-medium mb-2">{t("Notes")}</h3>
              <p className="text-gray-700">{invoice.notes}</p>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="bg-red-50 text-red-800 p-4 rounded-md">{error}</div>
          )}
        </CardContent>
        <CardFooter className="flex flex-wrap justify-between gap-2">
          <div className="flex flex-wrap gap-2">
            {/* Left side actions */}
            {invoice.status === InvoiceStatus.Pending && (
              <>
                <Button
                  variant="outline"
                  onClick={() => handleApproval("approve")}
                  disabled={loading}
                >
                  <Check className="mr-2 h-4 w-4 text-green-600" />
                  {t("Approve")}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleApproval("reject")}
                  disabled={loading}
                >
                  <X className="mr-2 h-4 w-4 text-red-600" />
                  {t("Reject")}
                </Button>
              </>
            )}
            {(invoice.status === InvoiceStatus.Approved ||
              invoice.status === InvoiceStatus.PartiallyPaid) && (
              <Button
                onClick={() => setShowPaymentForm(true)}
                disabled={loading}
              >
                <CreditCard className="mr-2 h-4 w-4" />
                {t("Record Payment")}
              </Button>
            )}
            {onEdit &&
              invoice.status !== InvoiceStatus.Paid &&
              invoice.status !== InvoiceStatus.Cancelled && (
                <Button variant="outline" onClick={onEdit} disabled={loading}>
                  <Edit className="mr-2 h-4 w-4" />
                  {t("Edit")}
                </Button>
              )}
          </div>
          <div className="flex flex-wrap gap-2">
            {/* Right side actions */}
            <Button
              variant="outline"
              onClick={() => handleExport("pdf")}
              disabled={loading}
            >
              <Download className="mr-2 h-4 w-4" />
              {t("Export PDF")}
            </Button>
            <Button
              variant="outline"
              onClick={handleSendEmail}
              disabled={loading}
            >
              <Mail className="mr-2 h-4 w-4" />
              {t("Send Email")}
            </Button>
            <Button variant="outline" onClick={handlePrint} disabled={loading}>
              <Printer className="mr-2 h-4 w-4" />
              {t("Print")}
            </Button>
          </div>
        </CardFooter>
      </Card>

      {/* Payment Form Dialog */}
      {showPaymentForm && (
        <PaymentForm
          invoice={invoice}
          open={showPaymentForm}
          onClose={() => setShowPaymentForm(false)}
          onPaymentCreated={onRefresh}
        />
      )}
    </>
  );
};

export default InvoiceDetails;
