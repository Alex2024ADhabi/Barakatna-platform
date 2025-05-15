import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { approveInvoice } from "@/lib/api/financial/financialApi";
import { Invoice, InvoiceStatus } from "@/lib/api/financial/types";
import { CheckCircle, XCircle } from "lucide-react";

interface InvoiceApprovalWorkflowProps {
  invoice: Invoice;
  open: boolean;
  onClose: () => void;
  onApprovalComplete: () => void;
}

const InvoiceApprovalWorkflow: React.FC<InvoiceApprovalWorkflowProps> = ({
  invoice,
  open,
  onClose,
  onApprovalComplete,
}) => {
  const { t } = useTranslation();
  const [comments, setComments] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleApproval = async (action: "approve" | "reject") => {
    setLoading(true);
    setError(null);

    try {
      const response = await approveInvoice({
        invoiceId: invoice.id,
        action,
        comments,
      });

      if (response.success) {
        onApprovalComplete();
        onClose();
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

  const isApprovalDisabled = () => {
    return (
      invoice.status !== InvoiceStatus.Pending &&
      invoice.status !== InvoiceStatus.Draft
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t("Invoice Approval")}</DialogTitle>
          <DialogDescription>
            {t("Review and approve or reject invoice")} {invoice.invoiceNumber}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium">{t("Client")}</p>
              <p className="text-sm">{invoice.clientName}</p>
            </div>
            <div>
              <p className="text-sm font-medium">{t("Amount")}</p>
              <p className="text-sm">
                {invoice.totalAmount.toLocaleString("en-US", {
                  style: "currency",
                  currency: "SAR",
                })}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">{t("Issue Date")}</p>
              <p className="text-sm">
                {typeof invoice.issueDate === "string"
                  ? new Date(invoice.issueDate).toLocaleDateString()
                  : invoice.issueDate.toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium">{t("Due Date")}</p>
              <p className="text-sm">
                {typeof invoice.dueDate === "string"
                  ? new Date(invoice.dueDate).toLocaleDateString()
                  : invoice.dueDate.toLocaleDateString()}
              </p>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">{t("Comments")}</label>
            <Textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder={t("Add your comments here")}
              rows={4}
            />
          </div>

          {isApprovalDisabled() && (
            <div className="bg-yellow-50 text-yellow-800 p-4 rounded-md">
              {t(
                "This invoice is not in a state that can be approved or rejected",
              )}
            </div>
          )}

          {error && (
            <div className="bg-red-50 text-red-800 p-4 rounded-md">{error}</div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            {t("Cancel")}
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => handleApproval("reject")}
            disabled={loading || isApprovalDisabled()}
          >
            <XCircle className="mr-2 h-4 w-4" />
            {t("Reject")}
          </Button>
          <Button
            type="button"
            onClick={() => handleApproval("approve")}
            disabled={loading || isApprovalDisabled()}
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            {t("Approve")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InvoiceApprovalWorkflow;
