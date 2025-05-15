import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  createInvoice,
  updateInvoice,
  getBillingProfiles,
  getInvoiceTemplates,
  getTaxConfigurations,
} from "@/lib/api/financial/financialApi";
import {
  Invoice,
  InvoiceItem,
  BillingProfile,
  InvoiceTemplate,
  TaxConfiguration,
  InvoiceStatus,
} from "@/lib/api/financial/types";
import {
  Plus,
  Trash2,
  Save,
  X,
  FileText,
  Calculator,
  CreditCard,
} from "lucide-react";

interface InvoiceGeneratorProps {
  invoice?: Invoice | null;
  clientId?: string;
  clientType?: string;
  projectId?: string;
  onInvoiceCreated: () => void;
  onCancel: () => void;
}

// Define the form schema with Zod
const invoiceItemSchema = z.object({
  description: z.string().min(1, "Description is required"),
  quantity: z.number().min(0.01, "Quantity must be greater than 0"),
  unitPrice: z.number().min(0, "Unit price must be non-negative"),
  taxRate: z
    .number()
    .min(0, "Tax rate must be non-negative")
    .max(100, "Tax rate cannot exceed 100%"),
  discountRate: z
    .number()
    .min(0, "Discount rate must be non-negative")
    .max(100, "Discount rate cannot exceed 100%"),
  notes: z.string().optional(),
});

const invoiceFormSchema = z.object({
  clientId: z.string().min(1, "Client is required"),
  clientType: z.string().min(1, "Client type is required"),
  projectId: z.string().optional(),
  issueDate: z.string().min(1, "Issue date is required"),
  dueDate: z.string().min(1, "Due date is required"),
  notes: z.string().optional(),
  paymentTerms: z.string().optional(),
  billingProfileId: z.string().optional(),
  templateId: z.string().optional(),
  taxConfigurationId: z.string().optional(),
  items: z.array(invoiceItemSchema).min(1, "At least one item is required"),
});

type InvoiceFormValues = z.infer<typeof invoiceFormSchema>;

const InvoiceGenerator: React.FC<InvoiceGeneratorProps> = ({
  invoice,
  clientId,
  clientType,
  projectId,
  onInvoiceCreated,
  onCancel,
}) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [billingProfiles, setBillingProfiles] = useState<BillingProfile[]>([]);
  const [invoiceTemplates, setInvoiceTemplates] = useState<InvoiceTemplate[]>(
    [],
  );
  const [taxConfigurations, setTaxConfigurations] = useState<
    TaxConfiguration[]
  >([]);
  const [subtotal, setSubtotal] = useState<number>(0);
  const [taxAmount, setTaxAmount] = useState<number>(0);
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [totalAmount, setTotalAmount] = useState<number>(0);

  // Initialize the form
  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      clientId: clientId || "",
      clientType: clientType || "",
      projectId: projectId || "",
      issueDate: format(new Date(), "yyyy-MM-dd"),
      dueDate: format(
        new Date(new Date().setDate(new Date().getDate() + 30)),
        "yyyy-MM-dd",
      ),
      notes: "",
      paymentTerms: "Net 30",
      billingProfileId: "",
      templateId: "",
      taxConfigurationId: "",
      items: [
        {
          description: "",
          quantity: 1,
          unitPrice: 0,
          taxRate: 15, // Default VAT rate
          discountRate: 0,
          notes: "",
        },
      ],
    },
  });

  // Set up field array for invoice items
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  // Load existing invoice data if editing
  useEffect(() => {
    if (invoice) {
      form.reset({
        clientId: invoice.clientId,
        clientType: invoice.clientType,
        projectId: invoice.projectId || "",
        issueDate:
          typeof invoice.issueDate === "string"
            ? invoice.issueDate.substring(0, 10)
            : format(invoice.issueDate, "yyyy-MM-dd"),
        dueDate:
          typeof invoice.dueDate === "string"
            ? invoice.dueDate.substring(0, 10)
            : format(invoice.dueDate, "yyyy-MM-dd"),
        notes: invoice.notes || "",
        paymentTerms: invoice.paymentTerms || "Net 30",
        billingProfileId: "",
        templateId: invoice.templateId || "",
        taxConfigurationId: "",
        items: invoice.items.map((item) => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          taxRate: item.taxRate || 15,
          discountRate: item.discount
            ? (item.discount / (item.quantity * item.unitPrice)) * 100
            : 0,
          notes: item.notes || "",
        })),
      });
    }
  }, [invoice, form]);

  // Load billing profiles, invoice templates, and tax configurations
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch billing profiles for the client
        if (clientId) {
          const profilesResponse = await getBillingProfiles({ clientId });
          if (profilesResponse.success && profilesResponse.data) {
            setBillingProfiles(profilesResponse.data.items);

            // Set default billing profile if available
            const defaultProfile = profilesResponse.data.items.find(
              (profile) => profile.isDefault,
            );
            if (defaultProfile) {
              form.setValue("billingProfileId", defaultProfile.id);
            }
          }
        }

        // Fetch invoice templates
        const templatesResponse = await getInvoiceTemplates({});
        if (templatesResponse.success && templatesResponse.data) {
          setInvoiceTemplates(templatesResponse.data.items);

          // Set default template if available
          const defaultTemplate = templatesResponse.data.items.find(
            (template) => template.isDefault,
          );
          if (defaultTemplate && !invoice?.templateId) {
            form.setValue("templateId", defaultTemplate.id);
          }
        }

        // Fetch tax configurations
        const taxResponse = await getTaxConfigurations({ isActive: true });
        if (taxResponse.success && taxResponse.data) {
          setTaxConfigurations(taxResponse.data.items);

          // Set default tax configuration if available
          const standardVAT = taxResponse.data.items.find((tax) =>
            tax.name.includes("Standard"),
          );
          if (standardVAT) {
            form.setValue("taxConfigurationId", standardVAT.id);
          }
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load required data");
      }
    };

    fetchData();
  }, [clientId, form, invoice]);

  // Calculate totals whenever items change
  useEffect(() => {
    const items = form.getValues("items");
    let newSubtotal = 0;
    let newTaxAmount = 0;
    let newDiscountAmount = 0;

    items.forEach((item) => {
      const itemSubtotal = item.quantity * item.unitPrice;
      newSubtotal += itemSubtotal;
      newTaxAmount += itemSubtotal * (item.taxRate / 100);
      newDiscountAmount += itemSubtotal * (item.discountRate / 100);
    });

    setSubtotal(newSubtotal);
    setTaxAmount(newTaxAmount);
    setDiscountAmount(newDiscountAmount);
    setTotalAmount(newSubtotal + newTaxAmount - newDiscountAmount);
  }, [form.watch("items")]);

  // Add a new invoice item
  const addInvoiceItem = () => {
    append({
      description: "",
      quantity: 1,
      unitPrice: 0,
      taxRate: 15,
      discountRate: 0,
      notes: "",
    });
  };

  // Calculate item total
  const calculateItemTotal = (item: any) => {
    const subtotal = item.quantity * item.unitPrice;
    const tax = subtotal * (item.taxRate / 100);
    const discount = subtotal * (item.discountRate / 100);
    return subtotal + tax - discount;
  };

  // Handle form submission
  const onSubmit = async (data: InvoiceFormValues) => {
    setLoading(true);
    setError(null);

    try {
      // Prepare items with calculated values
      const preparedItems = data.items.map((item) => {
        const itemSubtotal = item.quantity * item.unitPrice;
        const taxAmount = itemSubtotal * (item.taxRate / 100);
        const discountAmount = itemSubtotal * (item.discountRate / 100);
        const totalAmount = itemSubtotal + taxAmount - discountAmount;

        return {
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          taxRate: item.taxRate,
          taxAmount,
          discount: discountAmount,
          totalAmount,
          notes: item.notes,
        };
      });

      let response;

      if (invoice) {
        // Update existing invoice
        response = await updateInvoice(invoice.id, {
          issueDate: data.issueDate,
          dueDate: data.dueDate,
          notes: data.notes,
          paymentTerms: data.paymentTerms,
          templateId: data.templateId || undefined,
          items: preparedItems,
        });
      } else {
        // Create new invoice
        response = await createInvoice({
          clientId: data.clientId,
          clientType: data.clientType,
          projectId: data.projectId || undefined,
          issueDate: data.issueDate,
          dueDate: data.dueDate,
          notes: data.notes,
          paymentTerms: data.paymentTerms,
          templateId: data.templateId || undefined,
          items: preparedItems,
        });
      }

      if (response.success) {
        onInvoiceCreated();
      } else {
        setError(response.error || "Failed to save invoice");
      }
    } catch (err) {
      setError("An error occurred while saving the invoice");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>
          {invoice ? t("Edit Invoice") : t("Create New Invoice")}
        </CardTitle>
        <CardDescription>
          {invoice
            ? t("Update invoice details and items")
            : t("Fill in the details to create a new invoice")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Invoice Header */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="clientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Client")}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={!!invoice || !!clientId}
                        placeholder={t("Client ID")}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="clientType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Client Type")}</FormLabel>
                    <Select
                      disabled={!!invoice || !!clientType}
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t("Select client type")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="FDF">FDF</SelectItem>
                        <SelectItem value="ADHA">ADHA</SelectItem>
                        <SelectItem value="Cash">Cash</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="projectId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Project")}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={!!invoice || !!projectId}
                        placeholder={t("Project ID (optional)")}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="issueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Issue Date")}</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Due Date")}</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="paymentTerms"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Payment Terms")}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={t("Select payment terms")}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Net 15">Net 15</SelectItem>
                        <SelectItem value="Net 30">Net 30</SelectItem>
                        <SelectItem value="Net 45">Net 45</SelectItem>
                        <SelectItem value="Net 60">Net 60</SelectItem>
                        <SelectItem value="Due on Receipt">
                          Due on Receipt
                        </SelectItem>
                        <SelectItem value="50% Upfront">50% Upfront</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="billingProfileId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Billing Profile")}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={t("Select billing profile")}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">{t("None")}</SelectItem>
                        {billingProfiles.map((profile) => (
                          <SelectItem key={profile.id} value={profile.id}>
                            {profile.billingName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="templateId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Invoice Template")}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t("Select template")} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">
                          {t("Default Template")}
                        </SelectItem>
                        {invoiceTemplates.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="taxConfigurationId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("Tax Configuration")}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue
                            placeholder={t("Select tax configuration")}
                          />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">{t("None")}</SelectItem>
                        {taxConfigurations.map((tax) => (
                          <SelectItem key={tax.id} value={tax.id}>
                            {tax.name} ({tax.rate}%)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            {/* Invoice Items */}
            <div>
              <h3 className="text-lg font-medium mb-4">{t("Invoice Items")}</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("Description")}</TableHead>
                    <TableHead className="w-[100px]">{t("Quantity")}</TableHead>
                    <TableHead className="w-[120px]">
                      {t("Unit Price")}
                    </TableHead>
                    <TableHead className="w-[100px]">{t("Tax %")}</TableHead>
                    <TableHead className="w-[100px]">
                      {t("Discount %")}
                    </TableHead>
                    <TableHead className="w-[120px]">{t("Total")}</TableHead>
                    <TableHead className="w-[80px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fields.map((field, index) => (
                    <TableRow key={field.id}>
                      <TableCell>
                        <FormField
                          control={form.control}
                          name={`items.${index}.description`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder={t("Item description")}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </TableCell>
                      <TableCell>
                        <FormField
                          control={form.control}
                          name={`items.${index}.quantity`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  type="number"
                                  {...field}
                                  onChange={(e) =>
                                    field.onChange(
                                      parseFloat(e.target.value) || 0,
                                    )
                                  }
                                  min="0"
                                  step="0.01"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </TableCell>
                      <TableCell>
                        <FormField
                          control={form.control}
                          name={`items.${index}.unitPrice`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  type="number"
                                  {...field}
                                  onChange={(e) =>
                                    field.onChange(
                                      parseFloat(e.target.value) || 0,
                                    )
                                  }
                                  min="0"
                                  step="0.01"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </TableCell>
                      <TableCell>
                        <FormField
                          control={form.control}
                          name={`items.${index}.taxRate`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  type="number"
                                  {...field}
                                  onChange={(e) =>
                                    field.onChange(
                                      parseFloat(e.target.value) || 0,
                                    )
                                  }
                                  min="0"
                                  max="100"
                                  step="0.01"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </TableCell>
                      <TableCell>
                        <FormField
                          control={form.control}
                          name={`items.${index}.discountRate`}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  type="number"
                                  {...field}
                                  onChange={(e) =>
                                    field.onChange(
                                      parseFloat(e.target.value) || 0,
                                    )
                                  }
                                  min="0"
                                  max="100"
                                  step="0.01"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </TableCell>
                      <TableCell>
                        {calculateItemTotal(
                          form.getValues(`items.${index}`),
                        ).toLocaleString("en-US", {
                          style: "currency",
                          currency: "SAR",
                        })}
                      </TableCell>
                      <TableCell>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => remove(index)}
                          disabled={fields.length === 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={addInvoiceItem}
              >
                <Plus className="mr-2 h-4 w-4" />
                {t("Add Item")}
              </Button>
            </div>

            <Separator />

            {/* Invoice Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("Notes")}</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder={t(
                        "Additional notes or payment instructions",
                      )}
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Invoice Summary */}
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="text-lg font-medium mb-4">
                {t("Invoice Summary")}
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>{t("Subtotal")}</span>
                  <span>
                    {subtotal.toLocaleString("en-US", {
                      style: "currency",
                      currency: "SAR",
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>{t("Tax")}</span>
                  <span>
                    {taxAmount.toLocaleString("en-US", {
                      style: "currency",
                      currency: "SAR",
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>{t("Discount")}</span>
                  <span>
                    -
                    {discountAmount.toLocaleString("en-US", {
                      style: "currency",
                      currency: "SAR",
                    })}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>{t("Total")}</span>
                  <span>
                    {totalAmount.toLocaleString("en-US", {
                      style: "currency",
                      currency: "SAR",
                    })}
                  </span>
                </div>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="bg-red-50 text-red-800 p-4 rounded-md">
                {error}
              </div>
            )}

            {/* Form actions */}
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={loading}
              >
                <X className="mr-2 h-4 w-4" />
                {t("Cancel")}
              </Button>
              <Button type="submit" disabled={loading}>
                <Save className="mr-2 h-4 w-4" />
                {invoice ? t("Update Invoice") : t("Create Invoice")}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default InvoiceGenerator;
