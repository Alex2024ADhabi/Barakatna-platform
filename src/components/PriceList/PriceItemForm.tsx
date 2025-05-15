import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useTranslatedDirection } from "@/hooks/useTranslatedDirection";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TextInput,
  NumberInput,
  SelectField,
  TextArea,
} from "@/components/ui/form-components";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";

interface PriceItemFormProps {
  initialData?: PriceItemFormData;
  onSubmit: (data: PriceItemFormData) => void;
  onCancel: () => void;
  categories: string[];
  subcategories?: string[];
}

interface PriceItemFormData {
  itemCode: string;
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  category: string;
  subcategory?: string;
  unit: string;
  baseCost: number;
  markupPercentage: number;
  finalPrice: number;
  materialCost: number;
  laborCost: number;
  effectiveFrom: Date;
  effectiveTo?: Date;
  version: string;
}

const formSchema = z.object({
  itemCode: z.string().min(1, { message: "Item code is required" }),
  nameEn: z.string().min(1, { message: "English name is required" }),
  nameAr: z.string().min(1, { message: "Arabic name is required" }),
  descriptionEn: z.string(),
  descriptionAr: z.string(),
  category: z.string().min(1, { message: "Category is required" }),
  subcategory: z.string().optional(),
  unit: z.string().min(1, { message: "Unit is required" }),
  baseCost: z.number().min(0, { message: "Base cost must be positive" }),
  markupPercentage: z.number().min(0, { message: "Markup must be positive" }),
  finalPrice: z.number().min(0, { message: "Final price must be positive" }),
  materialCost: z
    .number()
    .min(0, { message: "Material cost must be positive" }),
  laborCost: z.number().min(0, { message: "Labor cost must be positive" }),
  effectiveFrom: z.date(),
  effectiveTo: z.date().optional(),
  version: z.string(),
});

function PriceItemForm({
  initialData,
  onSubmit,
  onCancel,
  categories,
  subcategories = [],
}: PriceItemFormProps) {
  const { t } = useTranslation();
  const { isRTL } = useTranslatedDirection();

  const defaultValues: PriceItemFormData = {
    itemCode: "",
    nameEn: "",
    nameAr: "",
    descriptionEn: "",
    descriptionAr: "",
    category: "",
    subcategory: "",
    unit: "",
    baseCost: 0,
    markupPercentage: 0,
    finalPrice: 0,
    materialCost: 0,
    laborCost: 0,
    effectiveFrom: new Date(),
    version: "1.0",
    ...initialData,
  };

  const [formData, setFormData] = useState<PriceItemFormData>(defaultValues);

  // Units of measure options
  const unitOptions = [
    "Each",
    "Linear meter",
    "Square meter",
    "Cubic meter",
    "Hour",
    "Day",
    "Set",
    "Pair",
    "Roll",
    "Box",
    "Kg",
    "Liter",
  ];

  // Handle form field changes
  const handleChange = (field: keyof PriceItemFormData, value: any) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };

      // Auto-calculate final price when base cost or markup changes
      if (field === "baseCost" || field === "markupPercentage") {
        const baseCost = field === "baseCost" ? value : prev.baseCost;
        const markup =
          field === "markupPercentage" ? value : prev.markupPercentage;
        newData.finalPrice = baseCost * (1 + markup / 100);
      }

      // Auto-calculate base cost when material and labor costs change
      if (field === "materialCost" || field === "laborCost") {
        const materialCost =
          field === "materialCost" ? value : prev.materialCost;
        const laborCost = field === "laborCost" ? value : prev.laborCost;
        newData.baseCost = materialCost + laborCost;

        // Also update final price
        newData.finalPrice =
          newData.baseCost * (1 + prev.markupPercentage / 100);
      }

      return newData;
    });
  };

  const handleSubmit = () => {
    onSubmit(formData);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-medium">
            {t("priceList.basicInformation")}
          </h3>

          <TextInput
            label={t("priceList.itemCode")}
            value={formData.itemCode}
            onChange={(value) => handleChange("itemCode", value)}
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SelectField
              label={t("common.labels.category")}
              value={formData.category}
              onChange={(value) => handleChange("category", value)}
              options={categories}
              required
            />

            <SelectField
              label={t("priceList.subcategory")}
              value={formData.subcategory || ""}
              onChange={(value) => handleChange("subcategory", value)}
              options={subcategories}
            />
          </div>

          <SelectField
            label={t("common.labels.unit")}
            value={formData.unit}
            onChange={(value) => handleChange("unit", value)}
            options={unitOptions}
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <TextInput
              label={t("priceList.effectiveFrom")}
              type="date"
              value={
                formData.effectiveFrom
                  ? format(formData.effectiveFrom, "yyyy-MM-dd")
                  : ""
              }
              onChange={(value) =>
                handleChange("effectiveFrom", new Date(value))
              }
              required
            />

            <TextInput
              label={t("priceList.effectiveTo")}
              type="date"
              value={
                formData.effectiveTo
                  ? format(formData.effectiveTo, "yyyy-MM-dd")
                  : ""
              }
              onChange={(value) =>
                handleChange("effectiveTo", value ? new Date(value) : undefined)
              }
            />
          </div>

          <TextInput
            label={t("priceList.version")}
            value={formData.version}
            onChange={(value) => handleChange("version", value)}
            required
          />
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">
            {t("priceList.descriptionAndPricing")}
          </h3>

          <TextInput
            label={t("priceList.nameEn")}
            value={formData.nameEn}
            onChange={(value) => handleChange("nameEn", value)}
            required
          />

          <TextInput
            label={t("priceList.nameAr")}
            arabicLabel={"اسم العنصر"}
            value={formData.nameAr}
            onChange={(value) => handleChange("nameAr", value)}
            required
          />

          <TextArea
            label={t("priceList.descriptionEn")}
            value={formData.descriptionEn}
            onChange={(value) => handleChange("descriptionEn", value)}
            rows={3}
          />

          <TextArea
            label={t("priceList.descriptionAr")}
            arabicLabel={"وصف العنصر"}
            value={formData.descriptionAr}
            onChange={(value) => handleChange("descriptionAr", value)}
            rows={3}
          />
        </div>
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-medium mb-4">
          {t("priceList.costBreakdown")}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-4">
            <h4 className="font-medium">{t("priceList.components")}</h4>

            <NumberInput
              label={t("priceList.materialCost")}
              value={formData.materialCost}
              onChange={(value) => handleChange("materialCost", value)}
              min={0}
              required
            />

            <NumberInput
              label={t("priceList.laborCost")}
              value={formData.laborCost}
              onChange={(value) => handleChange("laborCost", value)}
              min={0}
              required
            />
          </div>

          <div className="space-y-4">
            <h4 className="font-medium">{t("priceList.baseCost")}</h4>

            <NumberInput
              label={t("priceList.baseCost")}
              value={formData.baseCost}
              onChange={(value) => handleChange("baseCost", value)}
              min={0}
              required
              readOnly
              helpText={t("priceList.baseCostHelp")}
            />
          </div>

          <div className="space-y-4">
            <h4 className="font-medium">{t("priceList.finalPricing")}</h4>

            <NumberInput
              label={t("priceList.markupPercentage")}
              value={formData.markupPercentage}
              onChange={(value) => handleChange("markupPercentage", value)}
              min={0}
              required
            />

            <NumberInput
              label={t("priceList.finalPrice")}
              value={formData.finalPrice}
              onChange={(value) => handleChange("finalPrice", value)}
              min={0}
              required
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-2 pt-4 border-t">
        <Button variant="outline" onClick={onCancel}>
          {t("common.buttons.cancel")}
        </Button>
        <Button onClick={handleSubmit}>{t("common.buttons.save")}</Button>
      </div>
    </div>
  );
}

export default PriceItemForm;
