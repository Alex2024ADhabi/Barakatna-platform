import React from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SupplierServiceAgreementFormProps {
  supplierId?: string;
  clientId?: string;
  initialData?: any;
  onSubmit: (data: any) => void;
  onCancel?: () => void;
}

const agreementSchema = z.object({
  // Contract Information
  agreementTitle: z.string().min(2, { message: "Agreement title is required" }),
  agreementNumber: z
    .string()
    .min(2, { message: "Agreement number is required" }),
  startDate: z.date(),
  endDate: z.date().optional(),
  autoRenew: z.boolean().default(false),
  renewalTerms: z.string().optional(),

  // Pricing Information
  priceListId: z.string().optional(),
  discountPercentage: z.number().min(0).max(100).default(0),
  paymentTerms: z.string().min(2, { message: "Payment terms are required" }),
  paymentDays: z.number().min(0).default(30),
  currency: z.string().default("AED"),

  // Service Level Agreement
  deliveryTimeframe: z
    .string()
    .min(2, { message: "Delivery timeframe is required" }),
  qualityStandards: z
    .string()
    .min(2, { message: "Quality standards are required" }),
  warrantyPeriod: z.string().min(2, { message: "Warranty period is required" }),
  returnPolicy: z.string().min(2, { message: "Return policy is required" }),

  // Additional Terms
  additionalTerms: z.string().optional(),
  confidentialityTerms: z.string().optional(),
  terminationTerms: z
    .string()
    .min(2, { message: "Termination terms are required" }),
});

type AgreementFormValues = z.infer<typeof agreementSchema>;

export const SupplierServiceAgreementForm: React.FC<
  SupplierServiceAgreementFormProps
> = ({ supplierId, clientId, initialData, onSubmit, onCancel }) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = React.useState("contract");

  const form = useForm<AgreementFormValues>({
    resolver: zodResolver(agreementSchema),
    defaultValues: initialData || {
      agreementTitle: "",
      agreementNumber: `SA-${Date.now().toString().substring(6)}`,
      startDate: new Date(),
      autoRenew: false,
      discountPercentage: 0,
      paymentTerms: "Net 30",
      paymentDays: 30,
      currency: "AED",
      deliveryTimeframe: "Within 7 business days",
      qualityStandards: "As per industry standards",
      warrantyPeriod: "12 months from delivery date",
      returnPolicy: "Within 14 days of delivery",
      terminationTerms: "30 days written notice required",
    },
  });

  const handleFormSubmit = (data: AgreementFormValues) => {
    onSubmit(data);
  };

  // Mock price lists for the form
  const priceLists = [
    { id: "pl-001", name: "Standard Price List v1.0" },
    { id: "pl-002", name: "Premium Services v1.2" },
    { id: "pl-003", name: "Special Rates 2023" },
  ];

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleFormSubmit)}
        className="space-y-6"
      >
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 mb-6">
            <TabsTrigger value="contract">
              {t("supplier.contractInformation")}
            </TabsTrigger>
            <TabsTrigger value="pricing">
              {t("supplier.pricingInformation")}
            </TabsTrigger>
            <TabsTrigger value="sla">
              {t("supplier.serviceLevelAgreement")}
            </TabsTrigger>
            <TabsTrigger value="terms">
              {t("supplier.additionalTerms")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="contract" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="agreementTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("supplier.agreementTitle")}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Service Agreement with Supplier XYZ"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="agreementNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("supplier.agreementNumber")}</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormDescription>
                          {t("supplier.agreementNumberDescription")}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("supplier.startDate")}</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            value={
                              field.value
                                ? format(field.value, "yyyy-MM-dd")
                                : ""
                            }
                            onChange={(e) =>
                              field.onChange(new Date(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("supplier.endDate")}</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            value={
                              field.value
                                ? format(field.value, "yyyy-MM-dd")
                                : ""
                            }
                            onChange={(e) =>
                              field.onChange(
                                e.target.value
                                  ? new Date(e.target.value)
                                  : undefined,
                              )
                            }
                          />
                        </FormControl>
                        <FormDescription>
                          {t("supplier.endDateDescription")}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="renewalTerms"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>{t("supplier.renewalTerms")}</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder={t("supplier.renewalTermsPlaceholder")}
                            {...field}
                            rows={3}
                          />
                        </FormControl>
                        <FormDescription>
                          {t("supplier.renewalTermsDescription")}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pricing" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="priceListId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("supplier.priceList")}</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue
                                placeholder={t("supplier.selectPriceList")}
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {priceLists.map((priceList) => (
                              <SelectItem
                                key={priceList.id}
                                value={priceList.id}
                              >
                                {priceList.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          {t("supplier.priceListDescription")}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="discountPercentage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t("supplier.discountPercentage")}
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseFloat(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormDescription>
                          {t("supplier.discountPercentageDescription")}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="paymentTerms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("supplier.paymentTerms")}</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue
                                placeholder={t("supplier.selectPaymentTerms")}
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Net 30">Net 30</SelectItem>
                            <SelectItem value="Net 45">Net 45</SelectItem>
                            <SelectItem value="Net 60">Net 60</SelectItem>
                            <SelectItem value="Advance Payment">
                              Advance Payment
                            </SelectItem>
                            <SelectItem value="50% Advance, 50% on Delivery">
                              50% Advance, 50% on Delivery
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="paymentDays"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("supplier.paymentDays")}</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            {...field}
                            onChange={(e) =>
                              field.onChange(parseInt(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormDescription>
                          {t("supplier.paymentDaysDescription")}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("supplier.currency")}</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue
                                placeholder={t("supplier.selectCurrency")}
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="AED">
                              AED - UAE Dirham
                            </SelectItem>
                            <SelectItem value="USD">USD - US Dollar</SelectItem>
                            <SelectItem value="EUR">EUR - Euro</SelectItem>
                            <SelectItem value="GBP">
                              GBP - British Pound
                            </SelectItem>
                            <SelectItem value="SAR">
                              SAR - Saudi Riyal
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sla" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 gap-6">
                  <FormField
                    control={form.control}
                    name="deliveryTimeframe"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("supplier.deliveryTimeframe")}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Within 7 business days"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          {t("supplier.deliveryTimeframeDescription")}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="qualityStandards"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("supplier.qualityStandards")}</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="As per industry standards"
                            {...field}
                            rows={3}
                          />
                        </FormControl>
                        <FormDescription>
                          {t("supplier.qualityStandardsDescription")}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="warrantyPeriod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("supplier.warrantyPeriod")}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="12 months from delivery date"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="returnPolicy"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("supplier.returnPolicy")}</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Within 14 days of delivery"
                            {...field}
                            rows={3}
                          />
                        </FormControl>
                        <FormDescription>
                          {t("supplier.returnPolicyDescription")}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="terms" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 gap-6">
                  <FormField
                    control={form.control}
                    name="additionalTerms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("supplier.additionalTerms")}</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder={t(
                              "supplier.additionalTermsPlaceholder",
                            )}
                            {...field}
                            rows={4}
                          />
                        </FormControl>
                        <FormDescription>
                          {t("supplier.additionalTermsDescription")}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="confidentialityTerms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          {t("supplier.confidentialityTerms")}
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder={t(
                              "supplier.confidentialityTermsPlaceholder",
                            )}
                            {...field}
                            rows={4}
                          />
                        </FormControl>
                        <FormDescription>
                          {t("supplier.confidentialityTermsDescription")}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="terminationTerms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("supplier.terminationTerms")}</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="30 days written notice required"
                            {...field}
                            rows={4}
                          />
                        </FormControl>
                        <FormDescription>
                          {t("supplier.terminationTermsDescription")}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              {t("common.cancel")}
            </Button>
          )}
          <Button type="submit">{t("common.save")}</Button>
        </div>
      </form>
    </Form>
  );
};

export default SupplierServiceAgreementForm;
