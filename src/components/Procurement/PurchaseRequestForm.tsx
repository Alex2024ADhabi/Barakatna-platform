import React, { useState, useEffect } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import {
  PurchaseRequest,
  PurchaseRequestItem,
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
import { AlertCircle, Plus, Trash2, Save, X } from "lucide-react";
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
const purchaseRequestItemSchema = z.object({
  id: z.string().optional(),
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
  supplierId: z.string().optional(),
  notes: z.string().optional(),
});

const purchaseRequestSchema = z.object({
  id: z.string().optional(),
  requestNumber: z.string().optional(),
  title: z.string().min(1, { message: "Title is required" }),
  description: z.string().min(1, { message: "Description is required" }),
  projectId: z.string().optional(),
  assessmentId: z.string().optional(),
  requestedBy: z.string().min(1, { message: "Requester is required" }),
  requestDate: z.date(),
  status: z.string(),
  items: z
    .array(purchaseRequestItemSchema)
    .min(1, { message: "At least one item is required" }),
  totalAmount: z.coerce.number(),
  currency: z.string().min(1, { message: "Currency is required" }),
  notes: z.string().optional(),
});

type PurchaseRequestFormData = z.infer<typeof purchaseRequestSchema>;

interface PurchaseRequestFormProps {
  purchaseRequestId?: string;
  projectId?: string;
  assessmentId?: string;
  onSave?: (purchaseRequest: PurchaseRequest) => void;
  onCancel?: () => void;
  isDialog?: boolean;
}

const defaultValues: PurchaseRequestFormData = {
  title: "",
  description: "",
  requestedBy: "",
  requestDate: new Date(),
  status: Status.DRAFT,
  items: [
    {
      itemName: "",
      description: "",
      quantity: 1,
      unitPrice: 0,
      unit: "each",
      totalPrice: 0,
    },
  ],
  totalAmount: 0,
  currency: "SAR",
};

const PurchaseRequestForm: React.FC<PurchaseRequestFormProps> = ({
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
  const [categories, setCategories] = useState<{ id: string; name: string }[]>(
    [],
  );
  const [suppliers, setSuppliers] = useState<{ id: string; name: string }[]>(
    [],
  );

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<PurchaseRequestFormData>({
    resolver: zodResolver(purchaseRequestSchema),
    defaultValues,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const watchItems = watch("items");

  // Calculate total amount whenever items change
  useEffect(() => {
    const total = watchItems.reduce(
      (sum, item) => sum + (item.totalPrice || 0),
      0,
    );
    setValue("totalAmount", total);
  }, [watchItems, setValue]);

  // Load purchase request data if editing
  useEffect(() => {
    const loadPurchaseRequest = async () => {
      if (!purchaseRequestId) return;

      setLoading(true);
      setError(null);

      try {
        const response =
          await procurementApi.getPurchaseRequest(purchaseRequestId);
        if (response.success && response.data) {
          // Format the data for the form
          const formData = {
            ...response.data,
            requestDate: new Date(response.data.requestDate),
          };
          reset(formData);
        } else {
          setError(response.message || "Failed to load purchase request");
        }
      } catch (err) {
        setError("An error occurred while loading the purchase request");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadPurchaseRequest();
  }, [purchaseRequestId, reset]);

  // Load categories and suppliers
  useEffect(() => {
    const loadData = async () => {
      try {
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
      } catch (err) {
        console.error("Error loading form data:", err);
      }
    };

    loadData();
  }, []);

  const onSubmit = async (data: PurchaseRequestFormData) => {
    setLoading(true);
    setError(null);

    try {
      let response;

      // Add project and assessment IDs if provided
      if (projectId) data.projectId = projectId;
      if (assessmentId) data.assessmentId = assessmentId;

      if (purchaseRequestId) {
        // Update existing purchase request
        response = await procurementApi.updatePurchaseRequest(
          purchaseRequestId,
          data,
        );
      } else {
        // Create new purchase request
        response = await procurementApi.createPurchaseRequest(data);
      }

      if (response.success && response.data) {
        toast({
          title: purchaseRequestId
            ? "Purchase Request Updated"
            : "Purchase Request Created",
          description: `${data.title} has been ${purchaseRequestId ? "updated" : "created"} successfully.`,
        });

        if (onSave) {
          onSave(response.data);
        }
      } else {
        setError(response.message || "Failed to save purchase request");
      }
    } catch (err) {
      setError("An error occurred while saving the purchase request");
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
    });
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title">{t("Title")}</Label>
          <Controller
            name="title"
            control={control}
            render={({ field }) => (
              <Input
                id="title"
                placeholder={t("Enter purchase request title")}
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
          <Label htmlFor="requestNumber">{t("Request Number")}</Label>
          <Controller
            name="requestNumber"
            control={control}
            render={({ field }) => (
              <Input
                id="requestNumber"
                placeholder={t("Auto-generated")}
                disabled={!purchaseRequestId}
                {...field}
              />
            )}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="requestedBy">{t("Requested By")}</Label>
          <Controller
            name="requestedBy"
            control={control}
            render={({ field }) => (
              <Input
                id="requestedBy"
                placeholder={t("Enter requester name")}
                {...field}
              />
            )}
          />
          {errors.requestedBy && (
            <p className="text-sm text-red-500">{errors.requestedBy.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="requestDate">{t("Request Date")}</Label>
          <Controller
            name="requestDate"
            control={control}
            render={({ field }) => (
              <Input
                id="requestDate"
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

        <div className="col-span-1 md:col-span-2 space-y-2">
          <Label htmlFor="description">{t("Description")}</Label>
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <Textarea
                id="description"
                placeholder={t("Enter purchase request description")}
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

                <div className="space-y-2">
                  <Label htmlFor={`items.${index}.supplierId`}>
                    {t("Preferred Supplier")}
                  </Label>
                  <Controller
                    name={`items.${index}.supplierId`}
                    control={control}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        value={field.value || ""}
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
                </div>

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

      <div className="flex justify-between items-center pt-4">
        <div className="text-lg font-medium">
          {t("Total Amount")}: {watch("totalAmount").toFixed(2)}{" "}
          {watch("currency")}
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
          <Button type="submit" disabled={loading}>
            <Save className="h-4 w-4 mr-2" />
            {purchaseRequestId ? t("Update") : t("Save")}
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
        {purchaseRequestId
          ? t("Edit Purchase Request")
          : t("Create Purchase Request")}
      </h2>
      {formContent}
    </div>
  );
};

export default PurchaseRequestForm;

export const PurchaseRequestFormDialog: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  purchaseRequestId?: string;
  projectId?: string;
  assessmentId?: string;
  onSave?: (purchaseRequest: PurchaseRequest) => void;
}> = ({
  isOpen,
  onClose,
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
            {purchaseRequestId
              ? "Edit Purchase Request"
              : "Create Purchase Request"}
          </DialogTitle>
        </DialogHeader>
        <PurchaseRequestForm
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
