import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createPayment } from "@/lib/api/financial/financialApi";
import { Invoice, PaymentMethod } from "@/lib/api/financial/types";
import { Save, X, AlertCircle } from "lucide-react";
import { ClientType } from "@/lib/forms/types";
import { clientConfigService } from "@/services/clientConfigService";

interface PaymentFormProps {
  invoice: Invoice;
  open: boolean;
  onClose: () => void;
  onPaymentCreated: () => void;
  clientType?: ClientType; // Optional client type override
}

// Define the form schema with Zod
const paymentFormSchema = z.object({
  amount: z
    .number()
    .min(0.01, "Amount must be greater than 0")
    .refine((val) => val > 0, { message: "Amount must be greater than 0" }),
  paymentDate: z.string().min(1, "Payment date is required"),
  paymentMethod: z.string().min(1, "Payment method is required"),
  transactionId: z.string().optional(),
  notes: z.string().optional(),
  receiptNumber: z.string().optional(),
});

type PaymentFormValues = z.infer<typeof paymentFormSchema>;

const PaymentForm: React.FC<PaymentFormProps> = ({
  invoice,
  open,
  onClose,
  onPaymentCreated,
  clientType: propClientType,
}) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeClientType, setActiveClientType] = useState<ClientType | null>(
    null,
  );
  const [requiresApproval, setRequiresApproval] = useState(false);
  const [availablePaymentMethods, setAvailablePaymentMethods] = useState<
    PaymentMethod[]
  >([]);

  // Calculate the remaining balance
  const remainingBalance =
    invoice.balanceDue || invoice.totalAmount - (invoice.paidAmount || 0);

  // Get client type from props or active client
  useEffect(() => {
    const clientTypeFromConfig = clientConfigService.getActiveClientType
      ? clientConfigService.getActiveClientType()
      : null;

    // Determine client type from props or active client
    const currentClientType =
      propClientType ||
      (clientTypeFromConfig
        ? mapClientTypeIdToEnum(clientTypeFromConfig)
        : ClientType.FDF);

    setActiveClientType(currentClientType);

    // Set client-specific configurations
    configureClientSpecificSettings(currentClientType);

    // Subscribe to client config changes
    const removeListener = clientConfigService.addChangeListener((event) => {
      if (event.configType === "active" && !propClientType) {
        const newClientType = mapClientTypeIdToEnum(event.clientTypeId);
        setActiveClientType(newClientType);
        configureClientSpecificSettings(newClientType);
      }
    });

    return () => removeListener();
  }, [propClientType]);

  // Map client type ID to enum
  const mapClientTypeIdToEnum = (clientTypeId: number): ClientType => {
    switch (clientTypeId) {
      case 1:
        return ClientType.FDF;
      case 2:
        return ClientType.ADHA;
      case 3:
        return ClientType.CASH;
      default:
        return ClientType.OTHER;
    }
  };

  // Configure client-specific settings
  const configureClientSpecificSettings = (clientType: ClientType) => {
    // Set available payment methods based on client type
    switch (clientType) {
      case ClientType.FDF:
        setAvailablePaymentMethods([
          PaymentMethod.BankTransfer,
          PaymentMethod.Check,
          PaymentMethod.OnlinePayment,
        ]);
        setRequiresApproval(true); // FDF requires approval workflow
        break;
      case ClientType.ADHA:
        setAvailablePaymentMethods([
          PaymentMethod.BankTransfer,
          PaymentMethod.OnlinePayment,
        ]);
        setRequiresApproval(true); // ADHA requires approval workflow
        break;
      case ClientType.CASH:
        setAvailablePaymentMethods([
          PaymentMethod.Cash,
          PaymentMethod.CreditCard,
          PaymentMethod.MobilePayment,
        ]);
        setRequiresApproval(false); // Cash clients don't require approval
        break;
      default:
        setAvailablePaymentMethods(Object.values(PaymentMethod));
        setRequiresApproval(false);
    }

    // Reset form with new default values
    form.reset({
      amount: remainingBalance,
      paymentDate: format(new Date(), "yyyy-MM-dd"),
      paymentMethod:
        availablePaymentMethods.length > 0
          ? availablePaymentMethods[0]
          : PaymentMethod.BankTransfer,
      transactionId: "",
      notes: "",
      receiptNumber: "",
    });
  };

  // Initialize the form
  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      amount: remainingBalance,
      paymentDate: format(new Date(), "yyyy-MM-dd"),
      paymentMethod: PaymentMethod.BankTransfer,
      transactionId: "",
      notes: "",
      receiptNumber: "",
    },
  });

  // Handle form submission
  const onSubmit = async (data: PaymentFormValues) => {
    setLoading(true);
    setError(null);

    try {
      // Apply client-specific validation rules
      if (
        activeClientType &&
        !validateClientSpecificRules(data, activeClientType)
      ) {
        setLoading(false);
        return;
      }

      // Add client type to payment data
      const response = await createPayment({
        invoiceId: invoice.id,
        amount: data.amount,
        paymentDate: data.paymentDate,
        paymentMethod: data.paymentMethod as PaymentMethod,
        transactionId: data.transactionId,
        notes: data.notes,
        receiptNumber: data.receiptNumber,
        clientType: activeClientType || undefined,
        requiresApproval: requiresApproval,
      });

      if (response.success) {
        // For clients requiring approval, show different message
        if (requiresApproval) {
          alert(t("Payment recorded and sent for approval"));
        }
        onPaymentCreated();
        onClose();
      } else {
        setError(response.error || "Failed to record payment");
      }
    } catch (err) {
      setError("An error occurred while recording the payment");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Client-specific validation rules
  const validateClientSpecificRules = (
    data: PaymentFormValues,
    clientType: ClientType,
  ): boolean => {
    switch (clientType) {
      case ClientType.FDF:
        // FDF requires transaction ID for bank transfers
        if (
          data.paymentMethod === PaymentMethod.BankTransfer &&
          !data.transactionId
        ) {
          setError(
            t("FDF payments require a transaction ID for bank transfers"),
          );
          return false;
        }
        // FDF requires receipt number for all payments
        if (!data.receiptNumber) {
          setError(t("FDF payments require a receipt number"));
          return false;
        }
        break;
      case ClientType.ADHA:
        // ADHA requires notes for all payments
        if (!data.notes) {
          setError(t("ADHA payments require notes for audit purposes"));
          return false;
        }
        break;
      case ClientType.CASH:
        // Cash clients have a payment limit
        if (data.paymentMethod === PaymentMethod.Cash && data.amount > 10000) {
          setError(t("Cash payments cannot exceed 10,000 SAR"));
          return false;
        }
        break;
    }
    return true;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t("Record Payment")}</DialogTitle>
          <DialogDescription>
            {t("Record a payment for invoice")} {invoice.invoiceNumber}
            {activeClientType && (
              <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                {activeClientType}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        {/* Client-specific approval notice */}
        {requiresApproval && (
          <div className="bg-yellow-50 text-yellow-800 p-3 rounded-md flex items-center mb-4">
            <AlertCircle className="h-4 w-4 mr-2" />
            {t("This payment will require approval based on client workflow")}
          </div>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Amount")}</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseFloat(e.target.value) || 0)
                        }
                        min="0.01"
                        max={remainingBalance}
                        step="0.01"
                      />
                    </FormControl>
                    <FormDescription>
                      {t("Remaining balance")}:{" "}
                      {remainingBalance.toLocaleString("en-US", {
                        style: "currency",
                        currency: "SAR",
                      })}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="paymentDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Payment Date")}</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Payment Method")}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={t("Select payment method")}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {/* Only show payment methods available for this client type */}
                        {availablePaymentMethods.includes(
                          PaymentMethod.Cash,
                        ) && (
                          <SelectItem value={PaymentMethod.Cash}>
                            {t("Cash")}
                          </SelectItem>
                        )}
                        {availablePaymentMethods.includes(
                          PaymentMethod.BankTransfer,
                        ) && (
                          <SelectItem value={PaymentMethod.BankTransfer}>
                            {t("Bank Transfer")}
                          </SelectItem>
                        )}
                        {availablePaymentMethods.includes(
                          PaymentMethod.CreditCard,
                        ) && (
                          <SelectItem value={PaymentMethod.CreditCard}>
                            {t("Credit Card")}
                          </SelectItem>
                        )}
                        {availablePaymentMethods.includes(
                          PaymentMethod.Check,
                        ) && (
                          <SelectItem value={PaymentMethod.Check}>
                            {t("Check")}
                          </SelectItem>
                        )}
                        {availablePaymentMethods.includes(
                          PaymentMethod.OnlinePayment,
                        ) && (
                          <SelectItem value={PaymentMethod.OnlinePayment}>
                            {t("Online Payment")}
                          </SelectItem>
                        )}
                        {availablePaymentMethods.includes(
                          PaymentMethod.MobilePayment,
                        ) && (
                          <SelectItem value={PaymentMethod.MobilePayment}>
                            {t("Mobile Payment")}
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="transactionId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Transaction ID")}</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder={t("Optional")} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="receiptNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t("Receipt Number")}
                      {/* Show required indicator for FDF clients */}
                      {activeClientType === ClientType.FDF && (
                        <span className="text-red-500 ml-1">*</span>
                      )}
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={
                          activeClientType === ClientType.FDF
                            ? t("Required for FDF")
                            : t("Optional")
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {t("Notes")}
                    {/* Show required indicator for ADHA clients */}
                    {activeClientType === ClientType.ADHA && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder={
                        activeClientType === ClientType.ADHA
                          ? t("Required for ADHA audit purposes")
                          : t("Additional payment notes")
                      }
                      rows={3}
                    />
                  </FormControl>
                  {activeClientType === ClientType.ADHA && (
                    <FormDescription>
                      {t("ADHA requires detailed notes for all payments")}
                    </FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Error message */}
            {error && (
              <div className="bg-red-50 text-red-800 p-4 rounded-md">
                {error}
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
              >
                <X className="mr-2 h-4 w-4" />
                {t("Cancel")}
              </Button>
              <Button type="submit" disabled={loading}>
                <Save className="mr-2 h-4 w-4" />
                {requiresApproval
                  ? t("Submit for Approval")
                  : t("Record Payment")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentForm;
