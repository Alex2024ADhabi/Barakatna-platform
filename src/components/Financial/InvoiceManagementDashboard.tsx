import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  getInvoices,
  getPayments,
  generateFinancialReport,
} from "@/lib/api/financial/financialApi";
import {
  Invoice,
  Payment,
  InvoiceStatus,
  FinancialReportType,
} from "@/lib/api/financial/types";
import InvoiceList from "./InvoiceList";
import InvoiceGenerator from "./InvoiceGenerator";
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
} from "recharts";
import {
  FileText,
  CreditCard,
  DollarSign,
  AlertCircle,
  Clock,
  CheckCircle,
  XCircle,
  BarChart2,
  Plus,
  Download,
} from "lucide-react";

interface InvoiceManagementDashboardProps {
  clientId?: string;
  clientType?: string;
  projectId?: string;
}

const InvoiceManagementDashboard: React.FC<InvoiceManagementDashboardProps> = ({
  clientId,
  clientType,
  projectId,
}) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("overview");
  const [showInvoiceGenerator, setShowInvoiceGenerator] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    fetchDashboardStats();
  }, [clientId, clientType, projectId]);

  const fetchDashboardStats = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch invoice summary report
      const reportResponse = await generateFinancialReport({
        reportType: FinancialReportType.InvoiceSummary,
        startDate: new Date(new Date().getFullYear(), 0, 1).toISOString(), // Start of current year
        endDate: new Date().toISOString(),
        clientId,
        clientType,
        projectId,
      });

      // Fetch recent invoices
      const invoicesResponse = await getInvoices({
        page: 1,
        pageSize: 5,
        clientId,
        clientType,
        projectId,
        sortBy: "issueDate",
        sortDirection: "desc",
      });

      // Fetch recent payments
      const paymentsResponse = await getPayments({
        page: 1,
        pageSize: 5,
        sortBy: "paymentDate",
        sortDirection: "desc",
      });

      if (
        reportResponse.success &&
        invoicesResponse.success &&
        paymentsResponse.success
      ) {
        setDashboardStats({
          summary: reportResponse.data,
          recentInvoices: invoicesResponse.data?.items || [],
          recentPayments: paymentsResponse.data?.items || [],
        });
      } else {
        setError("Failed to fetch dashboard statistics");
      }
    } catch (err) {
      setError("An error occurred while fetching dashboard statistics");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInvoice = () => {
    setSelectedInvoice(null);
    setShowInvoiceGenerator(true);
    setActiveTab("create");
  };

  const handleEditInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowInvoiceGenerator(true);
    setActiveTab("create");
  };

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowInvoiceGenerator(true);
    setActiveTab("create");
  };

  const handleInvoiceCreated = () => {
    setShowInvoiceGenerator(false);
    setActiveTab("invoices");
    fetchDashboardStats();
  };

  const handleCancelCreate = () => {
    setShowInvoiceGenerator(false);
    setActiveTab("invoices");
  };

  const renderStatusDistributionChart = () => {
    if (!dashboardStats?.summary?.statusBreakdown) return null;

    const data = Object.entries(dashboardStats.summary.statusBreakdown).map(
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

  const renderFinancialSummaryChart = () => {
    if (!dashboardStats?.summary) return null;

    const data = [
      {
        name: t("Total"),
        amount: dashboardStats.summary.totalAmount,
      },
      {
        name: t("Paid"),
        amount: dashboardStats.summary.paidAmount,
      },
      {
        name: t("Outstanding"),
        amount: dashboardStats.summary.outstandingAmount,
      },
    ];

    return (
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip
              formatter={(value) =>
                value.toLocaleString("en-US", {
                  style: "currency",
                  currency: "SAR",
                })
              }
            />
            <Legend />
            <Bar dataKey="amount" fill="#4f46e5" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4">{t("Loading dashboard data...")}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertCircle className="h-5 w-5 text-red-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium">{t("Error")}</h3>
            <div className="mt-2 text-sm">
              <p>{error}</p>
            </div>
            <div className="mt-4">
              <Button variant="outline" size="sm" onClick={fetchDashboardStats}>
                {t("Try Again")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 bg-white">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t("Invoice Management")}</h1>
        <Button onClick={handleCreateInvoice}>
          <Plus className="mr-2 h-4 w-4" />
          {t("New Invoice")}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="overview">{t("Overview")}</TabsTrigger>
          <TabsTrigger value="invoices">{t("Invoices")}</TabsTrigger>
          <TabsTrigger value="create">{t("Create Invoice")}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {dashboardStats && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">
                      {t("Total Invoices")}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {dashboardStats.summary.totalInvoices}
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
                    <div className="text-2xl font-bold">
                      {dashboardStats.summary.totalAmount.toLocaleString(
                        "en-US",
                        { style: "currency", currency: "SAR" },
                      )}
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
                    <div className="text-2xl font-bold text-green-600">
                      {dashboardStats.summary.paidAmount.toLocaleString(
                        "en-US",
                        { style: "currency", currency: "SAR" },
                      )}
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
                    <div className="text-2xl font-bold text-amber-600">
                      {dashboardStats.summary.outstandingAmount.toLocaleString(
                        "en-US",
                        { style: "currency", currency: "SAR" },
                      )}
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

              <Card>
                <CardHeader>
                  <CardTitle>{t("Recent Invoices")}</CardTitle>
                  <CardDescription>
                    {t("Latest invoices created")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4">
                            {t("Invoice #")}
                          </th>
                          <th className="text-left py-3 px-4">{t("Client")}</th>
                          <th className="text-left py-3 px-4">
                            {t("Issue Date")}
                          </th>
                          <th className="text-left py-3 px-4">{t("Amount")}</th>
                          <th className="text-left py-3 px-4">{t("Status")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dashboardStats.recentInvoices.map(
                          (invoice: Invoice) => (
                            <tr
                              key={invoice.id}
                              className="border-b hover:bg-gray-50 cursor-pointer"
                              onClick={() => handleViewInvoice(invoice)}
                            >
                              <td className="py-3 px-4">
                                {invoice.invoiceNumber}
                              </td>
                              <td className="py-3 px-4">
                                {invoice.clientName}
                              </td>
                              <td className="py-3 px-4">
                                {typeof invoice.issueDate === "string"
                                  ? new Date(
                                      invoice.issueDate,
                                    ).toLocaleDateString()
                                  : invoice.issueDate.toLocaleDateString()}
                              </td>
                              <td className="py-3 px-4">
                                {invoice.totalAmount.toLocaleString("en-US", {
                                  style: "currency",
                                  currency: "SAR",
                                })}
                              </td>
                              <td className="py-3 px-4">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs ${
                                    invoice.status === InvoiceStatus.Paid
                                      ? "bg-green-100 text-green-800"
                                      : invoice.status === InvoiceStatus.Pending
                                        ? "bg-yellow-100 text-yellow-800"
                                        : invoice.status ===
                                            InvoiceStatus.Overdue
                                          ? "bg-red-100 text-red-800"
                                          : "bg-gray-100 text-gray-800"
                                  }`}
                                >
                                  {t(invoice.status)}
                                </span>
                              </td>
                            </tr>
                          ),
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setActiveTab("invoices")}
                  >
                    {t("View All Invoices")}
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t("Recent Payments")}</CardTitle>
                  <CardDescription>
                    {t("Latest payments received")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4">
                            {t("Receipt #")}
                          </th>
                          <th className="text-left py-3 px-4">
                            {t("Invoice #")}
                          </th>
                          <th className="text-left py-3 px-4">
                            {t("Payment Date")}
                          </th>
                          <th className="text-left py-3 px-4">{t("Amount")}</th>
                          <th className="text-left py-3 px-4">{t("Method")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dashboardStats.recentPayments.map(
                          (payment: Payment) => (
                            <tr
                              key={payment.id}
                              className="border-b hover:bg-gray-50"
                            >
                              <td className="py-3 px-4">
                                {payment.receiptNumber || "-"}
                              </td>
                              <td className="py-3 px-4">
                                {dashboardStats.recentInvoices.find(
                                  (i: Invoice) => i.id === payment.invoiceId,
                                )?.invoiceNumber || payment.invoiceId}
                              </td>
                              <td className="py-3 px-4">
                                {typeof payment.paymentDate === "string"
                                  ? new Date(
                                      payment.paymentDate,
                                    ).toLocaleDateString()
                                  : payment.paymentDate.toLocaleDateString()}
                              </td>
                              <td className="py-3 px-4">
                                {payment.amount.toLocaleString("en-US", {
                                  style: "currency",
                                  currency: "SAR",
                                })}
                              </td>
                              <td className="py-3 px-4">
                                {t(payment.paymentMethod)}
                              </td>
                            </tr>
                          ),
                        )}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>{t("Revenue Report")}</CardTitle>
                    <CardDescription>
                      {t("Financial performance overview")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-500">
                      {t(
                        "Generate a detailed report of revenue across different time periods.",
                      )}
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">
                      <Download className="mr-2 h-4 w-4" />
                      {t("Download Report")}
                    </Button>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>{t("Payment Analysis")}</CardTitle>
                    <CardDescription>
                      {t("Payment method breakdown")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-500">
                      {t("Analyze payment methods and collection efficiency.")}
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">
                      <BarChart2 className="mr-2 h-4 w-4" />
                      {t("View Analysis")}
                    </Button>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>{t("Aging Receivables")}</CardTitle>
                    <CardDescription>
                      {t("Outstanding invoice aging")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-500">
                      {t("Track overdue invoices and aging receivables.")}
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full">
                      <Clock className="mr-2 h-4 w-4" />
                      {t("View Aging Report")}
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="invoices">
          <InvoiceList
            clientId={clientId}
            clientType={clientType}
            projectId={projectId}
            onViewInvoice={handleViewInvoice}
            onEditInvoice={handleEditInvoice}
            onCreateInvoice={handleCreateInvoice}
          />
        </TabsContent>

        <TabsContent value="create">
          {showInvoiceGenerator && (
            <InvoiceGenerator
              invoice={selectedInvoice}
              clientId={clientId}
              clientType={clientType}
              projectId={projectId}
              onInvoiceCreated={handleInvoiceCreated}
              onCancel={handleCancelCreate}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InvoiceManagementDashboard;
