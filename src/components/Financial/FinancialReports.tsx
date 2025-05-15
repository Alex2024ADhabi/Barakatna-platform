import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { generateFinancialReport } from "@/lib/api/financial/financialApi";
import { FinancialReportType } from "@/lib/api/financial/types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import {
  Download,
  FileText,
  Calendar,
  BarChart2,
  PieChart as PieChartIcon,
  TrendingUp,
  DollarSign,
  Clock,
  Filter,
} from "lucide-react";

// Define the form schema with Zod
const reportFormSchema = z.object({
  reportType: z.string().min(1, "Report type is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
  clientId: z.string().optional(),
  clientType: z.string().optional(),
  projectId: z.string().optional(),
});

type ReportFormValues = z.infer<typeof reportFormSchema>;

interface FinancialReportsProps {
  clientId?: string;
  clientType?: string;
  projectId?: string;
}

const FinancialReports: React.FC<FinancialReportsProps> = ({
  clientId,
  clientType,
  projectId,
}) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<string>("generator");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [reportData, setReportData] = useState<any>(null);

  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884d8",
    "#82ca9d",
    "#ffc658",
    "#ff7300",
  ];

  // Initialize the form
  const form = useForm<ReportFormValues>({
    resolver: zodResolver(reportFormSchema),
    defaultValues: {
      reportType: FinancialReportType.InvoiceSummary,
      startDate: format(new Date(new Date().getFullYear(), 0, 1), "yyyy-MM-dd"), // Start of current year
      endDate: format(new Date(), "yyyy-MM-dd"), // Today
      clientId: clientId || "",
      clientType: clientType || "",
      projectId: projectId || "",
    },
  });

  // Handle form submission
  const onSubmit = async (data: ReportFormValues) => {
    setLoading(true);
    setError(null);

    try {
      const response = await generateFinancialReport({
        reportType: data.reportType as FinancialReportType,
        startDate: data.startDate,
        endDate: data.endDate,
        clientId: data.clientId || undefined,
        clientType: data.clientType || undefined,
        projectId: data.projectId || undefined,
      });

      if (response.success && response.data) {
        setReportData(response.data);
        setActiveTab("results");
      } else {
        setError(response.error || "Failed to generate report");
      }
    } catch (err) {
      setError("An error occurred while generating the report");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return amount.toLocaleString("en-US", {
      style: "currency",
      currency: "SAR",
    });
  };

  // Export report as CSV
  const exportReportAsCSV = () => {
    if (!reportData) return;

    // Create CSV content
    let csvContent = "data:text/csv;charset=utf-8,";

    // Add headers
    csvContent += "Report Type,Generated At,Period Start,Period End\n";

    // Add basic info
    csvContent += `${reportData.reportType},${new Date(reportData.generatedAt).toLocaleString()},${new Date(reportData.period.startDate).toLocaleDateString()},${new Date(reportData.period.endDate).toLocaleDateString()}\n\n`;

    // Add summary data
    csvContent +=
      "Total Invoices,Total Amount,Paid Amount,Outstanding Amount\n";
    csvContent += `${reportData.totalInvoices},${reportData.totalAmount},${reportData.paidAmount},${reportData.outstandingAmount}\n\n`;

    // Add status breakdown
    csvContent += "Status,Count\n";
    Object.entries(reportData.statusBreakdown).forEach(([status, count]) => {
      csvContent += `${status},${count}\n`;
    });

    // Create download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `financial_report_${format(new Date(), "yyyy-MM-dd")}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Render status distribution chart
  const renderStatusDistributionChart = () => {
    if (!reportData?.statusBreakdown) return null;

    const data = Object.entries(reportData.statusBreakdown).map(
      ([status, count]) => ({
        name: t(status),
        value: count as number,
      }),
    );

    return (
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              label={({ name, percent }) =>
                `${name}: ${(percent * 100).toFixed(0)}%`
              }
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  };

  // Render financial summary chart
  const renderFinancialSummaryChart = () => {
    if (!reportData) return null;

    const data = [
      {
        name: t("Total"),
        amount: reportData.totalAmount,
      },
      {
        name: t("Paid"),
        amount: reportData.paidAmount,
      },
      {
        name: t("Outstanding"),
        amount: reportData.outstandingAmount,
      },
    ];

    return (
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(value) => formatCurrency(value as number)} />
            <Legend />
            <Bar dataKey="amount" fill="#4f46e5" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{t("Financial Reports")}</CardTitle>
        <CardDescription>
          {t("Generate and view financial reports")}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="generator">{t("Report Generator")}</TabsTrigger>
            {reportData && (
              <TabsTrigger value="results">{t("Report Results")}</TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="generator">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="reportType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("Report Type")}</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                              placeholder={t("Select report type")}
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem
                            value={FinancialReportType.InvoiceSummary}
                          >
                            {t("Invoice Summary")}
                          </SelectItem>
                          <SelectItem
                            value={FinancialReportType.PaymentSummary}
                          >
                            {t("Payment Summary")}
                          </SelectItem>
                          <SelectItem
                            value={FinancialReportType.AgingReceivables}
                          >
                            {t("Aging Receivables")}
                          </SelectItem>
                          <SelectItem
                            value={FinancialReportType.RevenueByClient}
                          >
                            {t("Revenue by Client")}
                          </SelectItem>
                          <SelectItem
                            value={FinancialReportType.RevenueByProject}
                          >
                            {t("Revenue by Project")}
                          </SelectItem>
                          <SelectItem value={FinancialReportType.TaxSummary}>
                            {t("Tax Summary")}
                          </SelectItem>
                          <SelectItem value={FinancialReportType.ProfitAndLoss}>
                            {t("Profit and Loss")}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("Start Date")}</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
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
                        <FormLabel>{t("End Date")}</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="clientId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("Client ID")}</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder={t("Optional")}
                            disabled={!!clientId}
                          />
                        </FormControl>
                        <FormDescription>
                          {t("Filter by specific client")}
                        </FormDescription>
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
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={!!clientType}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue
                                placeholder={t("Select client type")}
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="">{t("All Types")}</SelectItem>
                            <SelectItem value="FDF">FDF</SelectItem>
                            <SelectItem value="ADHA">ADHA</SelectItem>
                            <SelectItem value="Cash">Cash</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          {t("Filter by client type")}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="projectId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("Project ID")}</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder={t("Optional")}
                            disabled={!!projectId}
                          />
                        </FormControl>
                        <FormDescription>
                          {t("Filter by specific project")}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Error message */}
                {error && (
                  <div className="bg-red-50 text-red-800 p-4 rounded-md">
                    {error}
                  </div>
                )}

                <div className="flex justify-end">
                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        {t("Generating...")}
                      </div>
                    ) : (
                      <>
                        <BarChart2 className="mr-2 h-4 w-4" />
                        {t("Generate Report")}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="results">
            {reportData && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-bold">
                      {t(reportData.reportType.replace(/_/g, " "))}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {t("Generated on")}:{" "}
                      {new Date(reportData.generatedAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" onClick={exportReportAsCSV}>
                      <Download className="mr-2 h-4 w-4" />
                      {t("Export CSV")}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setActiveTab("generator")}
                    >
                      <Filter className="mr-2 h-4 w-4" />
                      {t("Modify Filters")}
                    </Button>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-md">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">
                    {t("Report Period")}
                  </h3>
                  <div className="flex space-x-4">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                      <span>
                        {t("From")}:{" "}
                        {new Date(
                          reportData.period.startDate,
                        ).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                      <span>
                        {t("To")}:{" "}
                        {new Date(
                          reportData.period.endDate,
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-500">
                        {t("Total Invoices")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 mr-2 text-blue-500" />
                        <div className="text-2xl font-bold">
                          {reportData.totalInvoices}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-500">
                        {t("Total Amount")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center">
                        <DollarSign className="h-5 w-5 mr-2 text-green-500" />
                        <div className="text-2xl font-bold">
                          {formatCurrency(reportData.totalAmount)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-500">
                        {t("Paid Amount")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center">
                        <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                        <div className="text-2xl font-bold text-green-600">
                          {formatCurrency(reportData.paidAmount)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium text-gray-500">
                        {t("Outstanding Amount")}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center">
                        <Clock className="h-5 w-5 mr-2 text-amber-600" />
                        <div className="text-2xl font-bold text-amber-600">
                          {formatCurrency(reportData.outstandingAmount)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>{t("Financial Summary")}</CardTitle>
                      <CardDescription>
                        {t("Overview of financial status")}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>{renderFinancialSummaryChart()}</CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>{t("Invoice Status Distribution")}</CardTitle>
                      <CardDescription>
                        {t("Breakdown by status")}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>{renderStatusDistributionChart()}</CardContent>
                  </Card>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default FinancialReports;
