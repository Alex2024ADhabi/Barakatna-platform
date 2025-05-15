import React, { useState, useEffect } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import {
  PurchaseOrder,
  PurchaseOrderItem,
  PurchaseRequest,
} from "../../lib/api/procurement/types";
import { procurementApi } from "../../lib/api/procurement/procurementApi";
import { Status } from "../../lib/api/core/types";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";
import { AlertCircle, Plus, Trash2, Save, X, FileText } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { useToast } from "../ui/use-toast";

// Define schema for form validation
const purchaseOrderItemSchema = z.object({
  id: z.string().optional(),
  purchaseRequestItemId: z.string().optional(),
  itemName: z.string().min(1, { message: "Item name is required" }),
  description: z.string().min(1, { message: "Description is required" }),
  quantity: z.coerce
    .number()
    .positive({ message: "Quantity must be positive" }),
  unitPrice: z.coerce
    .number()
    .nonnegative({ message: "Unit price must be non-negative" }),
  unit: z.string().min(1, { message: "Unit is required" }),
  totalPrice: z.coerce.number().nonnegative(),
  categoryId: z.string().optional(),
  notes: z.string().optional(),
  receivedQuantity: z.coerce.number().nonnegative().default(0),
  receivedDate: z.date().optional().nullable(),
});

const purchaseOrderSchema = z.object({
  id: z.string().optional(),
  orderNumber: z.string().optional(),
  purchaseRequestId: z.string().optional(),
  title: z.string().min(1, { message: "Title is required" }),
  description: z.string().min(1, { message: "Description is required" }),
  supplierId: z.string().min(1, { message: "Supplier is required" }),
  projectId: z.string().optional(),
  assessmentId: z.string().optional(),
  orderDate: z.date(),
  expectedDeliveryDate: z.date(),
  actualDeliveryDate: z.date().optional().nullable(),
  status: z.string(),
  items: z
    .array(purchaseOrderItemSchema)
    .min(1, { message: "At least one item is required" }),
  subtotal: z.coerce.number(),
  taxAmount: z.coerce.number().nonnegative(),
  discountAmount: z.coerce.number().nonnegative(),
  totalAmount: z.coerce.number(),
  currency: z.string().min(1, { message: "Currency is required" }),
  paymentTerms: z.string().min(1, { message: "Payment terms are required" }),
  deliveryTerms: z.string().min(1, { message: "Delivery terms are required" }),
  notes: z.string().optional(),
});

type PurchaseOrderFormData = z.infer<typeof purchaseOrderSchema>;

interface PurchaseOrderFormProps {
  purchaseOrderId?: string;
  purchaseRequestId?: string;
  projectId?: string;
  assessmentId?: string;
  onSave?: (purchaseOrder: PurchaseOrder) => void;
  onCancel?: () => void;
  isDialog?: boolean;
}

const defaultValues: PurchaseOrderFormData = {
  title: "",
  description: "",
  supplierId: "",
  orderDate: new Date(),
  expectedDeliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
  status: Status.DRAFT,
  items: [
    {
      itemName: "",
      description: "",
      quantity: 1,
      unitPrice: 0,
      unit: "each",
      totalPrice: 0,
      receivedQuantity: 0,
    },
  ],
  subtotal: 0,
  taxAmount: 0,
  discountAmount: 0,
  totalAmount: 0,
  currency: "SAR",
  paymentTerms: "Net 30",
  deliveryTerms: "FOB Destination",
};

const PurchaseOrderForm: React.FC<PurchaseOrderFormProps> = ({
  purchaseOrderId,
  purchaseRequestId,
  projectId,
  assessmentId,
  onSave,
  onCancel,
  isDialog = false,
}) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suppliers, setSuppliers] = useState<{ id: string; name: string }[]>(
    [],
  );
  const [categories, setCategories] = useState<{ id: string; name: string }[]>(
    [],
  );
  const [purchaseRequests, setPurchaseRequests] = useState<PurchaseRequest[]>(
    [],
  );
  const [showPurchaseRequestDialog, setShowPurchaseRequestDialog] =
    useState(false);
  const [selectedPurchaseRequest, setSelectedPurchaseRequest] =
    useState<PurchaseRequest | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<PurchaseOrderFormData>({
    resolver: zodResolver(purchaseOrderSchema),
    defaultValues,
  });

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "items",
  });

  const watchItems = watch("items");
  const watchSubtotal = watch("subtotal");
  const watchTaxAmount = watch("taxAmount");
  const watchDiscountAmount = watch("discountAmount");
  const watchSupplierId = watch("supplierId");

  // Calculate subtotal and total amount whenever items change
  useEffect(() => {
    const subtotal = watchItems.reduce(
      (sum, item) => sum + (item.totalPrice || 0),
      0,
    );
    setValue("subtotal", subtotal);

    const total = subtotal + (watchTaxAmount || 0) - (watchDiscountAmount || 0);
    setValue("totalAmount", total);
  }, [watchItems, watchTaxAmount, watchDiscountAmount, setValue]);

  // Load purchase order data if editing
  useEffect(() => {
    const loadPurchaseOrder = async () => {
      if (!purchaseOrderId) return;

      setLoading(true);
      setError(null);

      try {
        const response = await procurementApi.getPurchaseOrder(purchaseOrderId);
        if (response.success && response.data) {
          // Format the data for the form
          const formData = {
            ...response.data,
            orderDate: new Date(response.data.orderDate),
            expectedDeliveryDate: new Date(response.data.expectedDeliveryDate),
            actualDeliveryDate: response.data.actualDeliveryDate
              ? new Date(response.data.actualDeliveryDate)
              : null,
          };
          reset(formData);

          // If this order is linked to a purchase request, load it
          if (response.data.purchaseRequestId) {
            loadPurchaseRequest(response.data.purchaseRequestId);
          }
        } else {
          setError(response.message || "Failed to load purchase order");
        }
      } catch (err) {
        setError("An error occurred while loading the purchase order");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadPurchaseOrder();
  }, [purchaseOrderId, reset]);

  // This is needed to properly handle the loadPurchaseRequest dependency
  // eslint-disable-next-line react-hooks/exhaustive-deps

  // Load purchase request data if provided
  useEffect(() => {
    if (purchaseRequestId && !purchaseOrderId) {
      loadPurchaseRequest(purchaseRequestId);
    }
  }, [purchaseRequestId]);

  // Load suppliers and categories
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load suppliers
        const suppliersResponse = await procurementApi.getSuppliers({});
        if (suppliersResponse.success && suppliersResponse.data) {
          setSuppliers(
            suppliersResponse.data.items.map((sup) => ({
              id: sup.id,
              name: sup.name,
            })),
          );
        }

        // Load categories
        const categoriesResponse = await procurementApi.getCategories();
        if (categoriesResponse.success && categoriesResponse.data) {
          setCategories(
            categoriesResponse.data.items.map((cat) => ({
              id: cat.id,
              name: cat.name,
            })),
          );
        }

        // Load purchase requests for selection
        const purchaseRequestsResponse =
          await procurementApi.getPurchaseRequests({
            status: Status.APPROVED,
            pageSize: 100,
          });
        if (purchaseRequestsResponse.success && purchaseRequestsResponse.data) {
          setPurchaseRequests(purchaseRequestsResponse.data.items);
        }
      } catch (err) {
        console.error("Error loading form data:", err);
      }
    };

    loadData();
  }, []);

  const loadPurchaseRequest = async (requestId: string) => {
    try {
      const response = await procurementApi.getPurchaseRequest(requestId);
      if (response.success && response.data) {
        setSelectedPurchaseRequest(response.data);

        // Update form with purchase request data
        setValue("purchaseRequestId", response.data.id);
        setValue("title", `PO for: ${response.data.title}`);
        setValue("description", response.data.description);
        setValue("currency", response.data.currency);

        if (response.data.projectId) {
          setValue("projectId", response.data.projectId);
        }

        if (response.data.assessmentId) {
          setValue("assessmentId", response.data.assessmentId);
        }

        // Convert purchase request items to purchase order items
        const orderItems = response.data.items.map((item) => ({
          purchaseRequestItemId: item.id,
          itemName: item.itemName,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          unit: item.unit,
          totalPrice: item.totalPrice,
          categoryId: item.categoryId,
          notes: item.notes,
          receivedQuantity: 0,
        }));

        replace(orderItems);

        // If a supplier is specified in any of the items, use that supplier
        const supplierItem = response.data.items.find(
          (item) => item.supplierId,
        );
        if (supplierItem && supplierItem.supplierId) {
          setValue("supplierId", supplierItem.supplierId);
        }
      }
    } catch (err) {
      console.error("Error loading purchase request:", err);
      toast({
        title: "Error",
        description: "Failed to load purchase request data",
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (data: PurchaseOrderFormData) => {
    setLoading(true);
    setError(null);

    try {
      let response;

      // Add project and assessment IDs if provided
      if (projectId) data.projectId = projectId;
      if (assessmentId) data.assessmentId = assessmentId;

      if (purchaseOrderId) {
        // Update existing purchase order
        response = await procurementApi.updatePurchaseOrder(
          purchaseOrderId,
          data,
        );
      } else if (purchaseRequestId) {
        // Create purchase order from purchase request
        response = await procurementApi.createPurchaseOrderFromRequest(
          purchaseRequestId,
          data.supplierId,
          data,
        );
      } else {
        // Create new purchase order
        response = await procurementApi.createPurchaseOrder(data);
      }

      if (response.success && response.data) {
        toast({
          title: purchaseOrderId
            ? "Purchase Order Updated"
            : "Purchase Order Created",
          description: `${data.title} has been ${purchaseOrderId ? "updated" : "created"} successfully.`,
        });

        if (onSave) {
          onSave(response.data);
        }
      } else {
        setError(response.message || "Failed to save purchase order");
      }
    } catch (err) {
      setError("An error occurred while saving the purchase order");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const calculateItemTotal = (index: number) => {
    const item = watchItems[index];
    if (item && item.quantity && item.unitPrice) {
      const total = item.quantity * item.unitPrice;
      setValue(`items.${index}.totalPrice`, total);
    }
  };

  const addItem = () => {
    append({
      itemName: "",
      description: "",
      quantity: 1,
      unitPrice: 0,
      unit: "each",
      totalPrice: 0,
      receivedQuantity: 0,
    });
  };

  const handlePurchaseRequestSelect = (requestId: string) => {
    loadPurchaseRequest(requestId);
    setShowPurchaseRequestDialog(false);
  };

  const formContent = (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {selectedPurchaseRequest && (
        <Alert>
          <FileText className="h-4 w-4" />
          <AlertTitle>Based on Purchase Request</AlertTitle>
          <AlertDescription>
            This purchase order is based on purchase request #
            {selectedPurchaseRequest.requestNumber}:{" "}
            {selectedPurchaseRequest.title}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title">{t("Title")}</Label>
          <Controller
            name="title"
            control={control}
            render={({ field }) => (
              <Input
                id="title"
                placeholder={t("Enter purchase order title")}
                {...field}
                error={errors.title?.message}
              />
            )}
          />
          {errors.title && (
            <p className="text-sm text-red-500">{errors.title.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="orderNumber">{t("Order Number")}</Label>
          <Controller
            name="orderNumber"
            control={control}
            render={({ field }) => (
              <Input
                id="orderNumber"
                placeholder={t("Auto-generated")}
                disabled={!purchaseOrderId}
                {...field}
              />
            )}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="supplierId">{t("Supplier")}</Label>
          <Controller
            name="supplierId"
            control={control}
            render={({ field }) => (
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                value={field.value}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("Select supplier")} />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((supplier) => (
                    <SelectItem key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.supplierId && (
            <p className="text-sm text-red-500">{errors.supplierId.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">{t("Status")}</Label>
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                value={field.value}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("Select status")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={Status.DRAFT}>{t("Draft")}</SelectItem>
                  <SelectItem value={Status.PENDING}>{t("Pending")}</SelectItem>
                  <SelectItem value={Status.APPROVED}>
                    {t("Approved")}
                  </SelectItem>
                  <SelectItem value={Status.REJECTED}>
                    {t("Rejected")}
                  </SelectItem>
                  <SelectItem value={Status.COMPLETED}>
                    {t("Completed")}
                  </SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="orderDate">{t("Order Date")}</Label>
          <Controller
            name="orderDate"
            control={control}
            render={({ field }) => (
              <Input
                id="orderDate"
                type="date"
                value={
                  field.value ? format(new Date(field.value), "yyyy-MM-dd") : ""
                }
                onChange={(e) =>
                  field.onChange(
                    e.target.value ? new Date(e.target.value) : null,
                  )
                }
              />
            )}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="expectedDeliveryDate">
            {t("Expected Delivery Date")}
          </Label>
          <Controller
            name="expectedDeliveryDate"
            control={control}
            render={({ field }) => (
              <Input
                id="expectedDeliveryDate"
                type="date"
                value={
                  field.value ? format(new Date(field.value), "yyyy-MM-dd") : ""
                }
                onChange={(e) =>
                  field.onChange(
                    e.target.value ? new Date(e.target.value) : null,
                  )
                }
              />
            )}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="currency">{t("Currency")}</Label>
          <Controller
            name="currency"
            control={control}
            render={({ field }) => (
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                value={field.value}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("Select currency")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SAR">{t("Saudi Riyal (SAR)")}</SelectItem>
                  <SelectItem value="USD">{t("US Dollar (USD)")}</SelectItem>
                  <SelectItem value="EUR">{t("Euro (EUR)")}</SelectItem>
                  <SelectItem value="GBP">
                    {t("British Pound (GBP)")}
                  </SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="paymentTerms">{t("Payment Terms")}</Label>
          <Controller
            name="paymentTerms"
            control={control}
            render={({ field }) => (
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                value={field.value}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("Select payment terms")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Net 30">{t("Net 30")}</SelectItem>
                  <SelectItem value="Net 60">{t("Net 60")}</SelectItem>
                  <SelectItem value="Net 90">{t("Net 90")}</SelectItem>
                  <SelectItem value="Immediate">{t("Immediate")}</SelectItem>
                  <SelectItem value="50% Advance">
                    {t("50% Advance")}
                  </SelectItem>
                  <SelectItem value="100% Advance">
                    {t("100% Advance")}
                  </SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {errors.paymentTerms && (
            <p className="text-sm text-red-500">
              {errors.paymentTerms.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="deliveryTerms">{t("Delivery Terms")}</Label>
          <Controller
            name="deliveryTerms"
            control={control}
            render={({ field }) => (
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                value={field.value}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("Select delivery terms")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FOB Destination">
                    {t("FOB Destination")}
                  </SelectItem>
                  <SelectItem value="FOB Origin">{t("FOB Origin")}</SelectItem>
                  <SelectItem value="CIF">{t("CIF")}</SelectItem>
                  <SelectItem value="EXW">{t("EXW")}</SelectItem>
                  <SelectItem value="DDP">{t("DDP")}</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {errors.deliveryTerms && (
            <p className="text-sm text-red-500">
              {errors.deliveryTerms.message}
            </p>
          )}
        </div>

        <div className="col-span-1 md:col-span-2 space-y-2">
          <Label htmlFor="description">{t("Description")}</Label>
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <Textarea
                id="description"
                placeholder={t("Enter purchase order description")}
                rows={3}
                {...field}
              />
            )}
          />
          {errors.description && (
            <p className="text-sm text-red-500">{errors.description.message}</p>
          )}
        </div>

        <div className="col-span-1 md:col-span-2 space-y-2">
          <Label htmlFor="notes">{t("Notes")}</Label>
          <Controller
            name="notes"
            control={control}
            render={({ field }) => (
              <Textarea
                id="notes"
                placeholder={t("Enter additional notes")}
                rows={2}
                {...field}
              />
            )}
          />
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">{t("Items")}</h3>
          <Button type="button" variant="outline" size="sm" onClick={addItem}>
            <Plus className="h-4 w-4 mr-2" />
            {t("Add Item")}
          </Button>
        </div>

        {errors.items && errors.items.root && (
          <p className="text-sm text-red-500">{errors.items.root.message}</p>
        )}

        {fields.map((field, index) => (
          <Card key={field.id} className="overflow-hidden">
            <CardHeader className="bg-muted py-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-md">
                  {t("Item")} {index + 1}
                </CardTitle>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => remove(index)}
                  disabled={fields.length === 1}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`items.${index}.itemName`}>
                    {t("Item Name")}
                  </Label>
                  <Controller
                    name={`items.${index}.itemName`}
                    control={control}
                    render={({ field }) => (
                      <Input
                        id={`items.${index}.itemName`}
                        placeholder={t("Enter item name")}
                        {...field}
                      />
                    )}
                  />
                  {errors.items?.[index]?.itemName && (
                    <p className="text-sm text-red-500">
                      {errors.items[index]?.itemName?.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`items.${index}.categoryId`}>
                    {t("Category")}
                  </Label>
                  <Controller
                    name={`items.${index}.categoryId`}
                    control={control}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value || ""}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t("Select category")} />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`items.${index}.quantity`}>
                    {t("Quantity")}
                  </Label>
                  <Controller
                    name={`items.${index}.quantity`}
                    control={control}
                    render={({ field }) => (
                      <Input
                        id={`items.${index}.quantity`}
                        type="number"
                        min="1"
                        placeholder={t("Enter quantity")}
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          calculateItemTotal(index);
                        }}
                      />
                    )}
                  />
                  {errors.items?.[index]?.quantity && (
                    <p className="text-sm text-red-500">
                      {errors.items[index]?.quantity?.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`items.${index}.unit`}>{t("Unit")}</Label>
                  <Controller
                    name={`items.${index}.unit`}
                    control={control}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t("Select unit")} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="each">{t("Each")}</SelectItem>
                          <SelectItem value="kg">{t("Kilogram")}</SelectItem>
                          <SelectItem value="m">{t("Meter")}</SelectItem>
                          <SelectItem value="m2">
                            {t("Square Meter")}
                          </SelectItem>
                          <SelectItem value="liter">{t("Liter")}</SelectItem>
                          <SelectItem value="set">{t("Set")}</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.items?.[index]?.unit && (
                    <p className="text-sm text-red-500">
                      {errors.items[index]?.unit?.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`items.${index}.unitPrice`}>
                    {t("Unit Price")}
                  </Label>
                  <Controller
                    name={`items.${index}.unitPrice`}
                    control={control}
                    render={({ field }) => (
                      <Input
                        id={`items.${index}.unitPrice`}
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder={t("Enter unit price")}
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          calculateItemTotal(index);
                        }}
                      />
                    )}
                  />
                  {errors.items?.[index]?.unitPrice && (
                    <p className="text-sm text-red-500">
                      {errors.items[index]?.unitPrice?.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`items.${index}.totalPrice`}>
                    {t("Total Price")}
                  </Label>
                  <Controller
                    name={`items.${index}.totalPrice`}
                    control={control}
                    render={({ field }) => (
                      <Input
                        id={`items.${index}.totalPrice`}
                        type="number"
                        min="0"
                        step="0.01"
                        readOnly
                        {...field}
                      />
                    )}
                  />
                </div>

                {watch("status") === Status.COMPLETED && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor={`items.${index}.receivedQuantity`}>
                        {t("Received Quantity")}
                      </Label>
                      <Controller
                        name={`items.${index}.receivedQuantity`}
                        control={control}
                        render={({ field }) => (
                          <Input
                            id={`items.${index}.receivedQuantity`}
                            type="number"
                            min="0"
                            max={watchItems[index]?.quantity}
                            placeholder={t("Enter received quantity")}
                            {...field}
                          />
                        )}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`items.${index}.receivedDate`}>
                        {t("Received Date")}
                      </Label>
                      <Controller
                        name={`items.${index}.receivedDate`}
                        control={control}
                        render={({ field }) => (
                          <Input
                            id={`items.${index}.receivedDate`}
                            type="date"
                            value={
                              field.value
                                ? format(new Date(field.value), "yyyy-MM-dd")
                                : ""
                            }
                            onChange={(e) =>
                              field.onChange(
                                e.target.value
                                  ? new Date(e.target.value)
                                  : null,
                              )
                            }
                          />
                        )}
                      />
                    </div>
                  </>
                )}

                <div className="col-span-1 md:col-span-2 space-y-2">
                  <Label htmlFor={`items.${index}.description`}>
                    {t("Description")}
                  </Label>
                  <Controller
                    name={`items.${index}.description`}
                    control={control}
                    render={({ field }) => (
                      <Textarea
                        id={`items.${index}.description`}
                        placeholder={t("Enter item description")}
                        rows={2}
                        {...field}
                      />
                    )}
                  />
                  {errors.items?.[index]?.description && (
                    <p className="text-sm text-red-500">
                      {errors.items[index]?.description?.message}
                    </p>
                  )}
                </div>

                <div className="col-span-1 md:col-span-2 space-y-2">
                  <Label htmlFor={`items.${index}.notes`}>{t("Notes")}</Label>
                  <Controller
                    name={`items.${index}.notes`}
                    control={control}
                    render={({ field }) => (
                      <Textarea
                        id={`items.${index}.notes`}
                        placeholder={t("Enter additional notes for this item")}
                        rows={2}
                        {...field}
                      />
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="subtotal">{t("Subtotal")}</Label>
          <Controller
            name="subtotal"
            control={control}
            render={({ field }) => (
              <Input
                id="subtotal"
                type="number"
                min="0"
                step="0.01"
                readOnly
                {...field}
              />
            )}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="taxAmount">{t("Tax Amount")}</Label>
          <Controller
            name="taxAmount"
            control={control}
            render={({ field }) => (
              <Input
                id="taxAmount"
                type="number"
                min="0"
                step="0.01"
                placeholder={t("Enter tax amount")}
                {...field}
              />
            )}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="discountAmount">{t("Discount Amount")}</Label>
          <Controller
            name="discountAmount"
            control={control}
            render={({ field }) => (
              <Input
                id="discountAmount"
                type="number"
                min="0"
                step="0.01"
                placeholder={t("Enter discount amount")}
                {...field}
              />
            )}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="totalAmount">{t("Total Amount")}</Label>
          <Controller
            name="totalAmount"
            control={control}
            render={({ field }) => (
              <Input
                id="totalAmount"
                type="number"
                min="0"
                step="0.01"
                readOnly
                {...field}
              />
            )}
          />
        </div>
      </div>

      <div className="flex justify-between items-center pt-4">
        <div className="text-lg font-medium">
          {t("Total")}: {watch("totalAmount").toFixed(2)} {watch("currency")}
        </div>
        <div className="space-x-2">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              <X className="h-4 w-4 mr-2" />
              {t("Cancel")}
            </Button>
          )}
          <Button type="submit" disabled={loading || !watchSupplierId}>
            <Save className="h-4 w-4 mr-2" />
            {purchaseOrderId ? t("Update") : t("Save")}
          </Button>
        </div>
      </div>
    </form>
  );

  if (isDialog) {
    return formContent;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm w-full">
      <h2 className="text-2xl font-bold mb-6">
        {purchaseOrderId
          ? t("Edit Purchase Order")
          : t("Create Purchase Order")}
      </h2>
      {formContent}
    </div>
  );
};

export default PurchaseOrderForm;

export const PurchaseOrderFormDialog: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  purchaseOrderId?: string;
  purchaseRequestId?: string;
  projectId?: string;
  assessmentId?: string;
  onSave?: (purchaseOrder: PurchaseOrder) => void;
}> = ({
  isOpen,
  onClose,
  purchaseOrderId,
  purchaseRequestId,
  projectId,
  assessmentId,
  onSave,
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {purchaseOrderId ? "Edit Purchase Order" : "Create Purchase Order"}
          </DialogTitle>
        </DialogHeader>
        <PurchaseOrderForm
          purchaseOrderId={purchaseOrderId}
          purchaseRequestId={purchaseRequestId}
          projectId={projectId}
          assessmentId={assessmentId}
          onSave={(data) => {
            if (onSave) onSave(data);
            onClose();
          }}
          onCancel={onClose}
          isDialog
        />
        <DialogFooter className="sm:justify-start">
          <div className="w-full flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
