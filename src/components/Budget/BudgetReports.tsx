import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
import { useTranslatedDirection } from "@/hooks/useTranslatedDirection";
import { Budget, BudgetReport } from "@/lib/api/budget/types";
import { budgetApi } from "@/lib/api/budget/budgetApi";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Calendar,
  Download,
  FileText,
  Filter,
  Loader2,
  Printer,
  RefreshCw,
} from "lucide-react";

interface BudgetReportsProps {
  budgetId?: string;
}

const BudgetReports = ({ budgetId }: BudgetReportsProps) => {
  const { t } = useTranslation();
  const dir = useTranslatedDirection();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [selectedBudgetId, setSelectedBudgetId] = useState<string>(
    budgetId || "",
  );
  const [reportType, setReportType] = useState<
    "monthly" | "quarterly" | "annual" | "custom"
  >("monthly");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [report, setReport] = useState<BudgetReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState("summary");

  useEffect(() => {
    const fetchBudgets = async () => {
      try {
        const data = await budgetApi.getBudgets();
        setBudgets(data);

        if (!budgetId && data.length > 0) {
          setSelectedBudgetId(data[0].id);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching budgets:", error);
        setLoading(false);
      }
    };

    fetchBudgets();
  }, [budgetId]);

  const handleGenerateReport = async () => {
    if (!selectedBudgetId) {
      alert(t("budget.selectBudget"));
      return;
    }

    try {
      setGenerating(true);

      const generatedReport = await budgetApi.generateBudgetReport(
        selectedBudgetId,
        reportType,
        startDate || undefined,
        endDate || undefined,
      );

      setReport(generatedReport);
      setGenerating(false);
      setActiveTab("summary");
    } catch (error) {
      console.error("Error generating report:", error);
      setGenerating(false);
    }
  };

  const handleExport = (format: "pdf" | "excel" | "csv") => {
    // In a real implementation, this would generate the appropriate file format
    alert(`${t("budget.exportingAs")} ${format.toUpperCase()}`);
  };

  const handlePrint = () => {
    // In a real implementation, this would open the print dialog
    window.print();
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: "USD", // This should come from the budget
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884d8",
    "#82ca9d",
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{t("budget.budgetReports")}</CardTitle>
            <CardDescription>
              {t("budget.budgetReportsDescription")}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => window.location.reload()}>
              <RefreshCw className="mr-2 h-4 w-4" /> {t("common.refresh")}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!report ? (
          <div className="space-y-6">
            <div className="p-4 border rounded-md">
              <h3 className="text-sm font-medium mb-4">
                {t("budget.generateReport")}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <Label htmlFor="budgetSelect">
                    {t("budget.selectBudget")}
                  </Label>
                  <select
                    id="budgetSelect"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={selectedBudgetId}
                    onChange={(e) => setSelectedBudgetId(e.target.value)}
                    disabled={loading || !!budgetId}
                  >
                    <option value="">{t("budget.selectBudget")}</option>
                    {budgets.map((budget) => (
                      <option key={budget.id} value={budget.id}>
                        {budget.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reportType">{t("budget.reportType")}</Label>
                  <select
                    id="reportType"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value as any)}
                  >
                    <option value="monthly">{t("budget.monthly")}</option>
                    <option value="quarterly">{t("budget.quarterly")}</option>
                    <option value="annual">{t("budget.annual")}</option>
                    <option value="custom">{t("budget.custom")}</option>
                  </select>
                </div>
              </div>

              {reportType === "custom" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">{t("budget.startDate")}</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">{t("budget.endDate")}</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                  </div>
                </div>
              )}

              <Button
                onClick={handleGenerateReport}
                disabled={loading || generating || !selectedBudgetId}
              >
                {generating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("budget.generatingReport")}
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    {t("budget.generateReport")}
                  </>
                )}
              </Button>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("budget.budget")}</TableHead>
                    <TableHead>{t("budget.reportType")}</TableHead>
                    <TableHead>{t("budget.period")}</TableHead>
                    <TableHead>{t("common.generatedAt")}</TableHead>
                    <TableHead>{t("common.status")}</TableHead>
                    <TableHead className="text-right">
                      {t("common.actions")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4">
                      {loading
                        ? t("common.loading")
                        : t("budget.noReportsGenerated")}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">{report.name}</h2>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handlePrint}>
                  <Printer className="mr-2 h-4 w-4" /> {t("common.print")}
                </Button>
                <Button variant="outline" onClick={() => handleExport("pdf")}>
                  <Download className="mr-2 h-4 w-4" /> PDF
                </Button>
                <Button variant="outline" onClick={() => handleExport("excel")}>
                  <Download className="mr-2 h-4 w-4" /> Excel
                </Button>
                <Button variant="outline" onClick={() => handleExport("csv")}>
                  <Download className="mr-2 h-4 w-4" /> CSV
                </Button>
              </div>
            </div>

            <div className="flex items-center text-sm text-muted-foreground">
              <Calendar className="mr-2 h-4 w-4" />
              {new Date(report.startDate).toLocaleDateString()} -{" "}
              {new Date(report.endDate).toLocaleDateString()}
              <span className="mx-2">•</span>
              {t("budget.generatedAt")}:{" "}
              {new Date(report.generatedAt).toLocaleString()}
            </div>

            <Tabs
              defaultValue="summary"
              value={activeTab}
              onValueChange={setActiveTab}
            >
              <TabsList>
                <TabsTrigger value="summary">{t("common.summary")}</TabsTrigger>
                <TabsTrigger value="categories">
                  {t("budget.categories")}
                </TabsTrigger>
                <TabsTrigger value="trends">{t("budget.trends")}</TabsTrigger>
              </TabsList>

              <TabsContent value="summary" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold">
                        {formatCurrency(report.summary?.plannedTotal || 0)}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {t("budget.planned")}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold">
                        {formatCurrency(report.summary?.actualTotal || 0)}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {t("budget.actual")}
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div
                        className={`text-2xl font-bold ${(report.summary?.variance || 0) > 0 ? "text-red-500" : (report.summary?.variance || 0) < 0 ? "text-green-500" : ""}`}
                      >
                        {formatCurrency(
                          Math.abs(report.summary?.variance || 0),
                        )}
                        <span className="text-sm ml-1">
                          (
                          {(report.summary?.variancePercentage || 0) > 0
                            ? "+"
                            : ""}
                          {(report.summary?.variancePercentage || 0).toFixed(1)}
                          %)
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {t("budget.variance")}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("budget.category")}</TableHead>
                        <TableHead>{t("budget.planned")}</TableHead>
                        <TableHead>{t("budget.actual")}</TableHead>
                        <TableHead>{t("budget.variance")}</TableHead>
                        <TableHead>{t("budget.variancePercentage")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {report.categoryBreakdown?.map((category) => (
                        <TableRow key={category.categoryId}>
                          <TableCell className="font-medium">
                            {category.categoryName}
                          </TableCell>
                          <TableCell>
                            {formatCurrency(category.plannedAmount)}
                          </TableCell>
                          <TableCell>
                            {formatCurrency(category.actualAmount)}
                          </TableCell>
                          <TableCell>
                            {formatCurrency(Math.abs(category.variance))}
                          </TableCell>
                          <TableCell>
                            <span
                              className={
                                category.variancePercentage > 0
                                  ? "text-red-500"
                                  : category.variancePercentage < 0
                                    ? "text-green-500"
                                    : ""
                              }
                            >
                              {category.variancePercentage > 0 ? "+" : ""}
                              {category.variancePercentage.toFixed(1)}%
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <TabsContent value="categories">
                <div className="h-[400px]">
                  {report.categoryBreakdown &&
                  report.categoryBreakdown.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={report.categoryBreakdown}
                        margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="categoryName"
                          angle={-45}
                          textAnchor="end"
                          height={70}
                        />
                        <YAxis />
                        <Tooltip
                          formatter={(value) => formatCurrency(value as number)}
                        />
                        <Legend />
                        <Bar
                          dataKey="plannedAmount"
                          name={t("budget.planned")}
                          fill="#8884d8"
                        />
                        <Bar
                          dataKey="actualAmount"
                          name={t("budget.actual")}
                          fill="#82ca9d"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <p className="text-muted-foreground">
                        {t("common.noData")}
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="trends">
                <div className="h-[400px]">
                  {report.monthlyTrend && report.monthlyTrend.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={report.monthlyTrend}
                        margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip
                          formatter={(value) => formatCurrency(value as number)}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="plannedAmount"
                          name={t("budget.planned")}
                          stroke="#8884d8"
                          activeDot={{ r: 8 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="actualAmount"
                          name={t("budget.actual")}
                          stroke="#82ca9d"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <p className="text-muted-foreground">
                        {t("common.noData")}
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BudgetReports;
