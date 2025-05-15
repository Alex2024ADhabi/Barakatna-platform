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
import { BudgetSummary } from "@/lib/api/budget/types";
import { budgetApi } from "@/lib/api/budget/budgetApi";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
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
  Plus,
  FileText,
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  Filter,
  Download,
  RefreshCw,
} from "lucide-react";
import BudgetSummaryComponent from "./BudgetSummary";

interface BudgetManagementDashboardProps {
  onBudgetSelect?: (budgetId: string) => void;
}

const BudgetManagementDashboard = ({
  onBudgetSelect,
}: BudgetManagementDashboardProps) => {
  const { t } = useTranslation();
  const dir = useTranslatedDirection();
  const [budgets, setBudgets] = useState<BudgetSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const fetchBudgets = async () => {
      try {
        const data = await budgetApi.getBudgetSummaries();
        setBudgets(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching budgets:", error);
        setLoading(false);
      }
    };

    fetchBudgets();
  }, []);

  // Sample data for charts
  const budgetStatusData = [
    {
      name: t("budget.active"),
      value: budgets.filter((b) => b.status === "active").length,
    },
    {
      name: t("budget.draft"),
      value: budgets.filter((b) => b.status === "draft").length,
    },
    {
      name: t("budget.closed"),
      value: budgets.filter((b) => b.status === "closed").length,
    },
    {
      name: t("budget.archived"),
      value: budgets.filter((b) => b.status === "archived").length,
    },
  ];

  const budgetUtilizationData = budgets.map((budget) => ({
    name:
      budget.name.length > 20
        ? `${budget.name.substring(0, 20)}...`
        : budget.name,
    planned: budget.totalPlanned,
    actual: budget.totalActual,
  }));

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    index,
  }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos((-midAngle * Math.PI) / 180);
    const y = cy + radius * Math.sin((-midAngle * Math.PI) / 180);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const getBudgetStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">{t("budget.active")}</Badge>;
      case "draft":
        return <Badge variant="outline">{t("budget.draft")}</Badge>;
      case "closed":
        return <Badge className="bg-gray-500">{t("budget.closed")}</Badge>;
      case "archived":
        return <Badge className="bg-amber-500">{t("budget.archived")}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            {t("budget.budgetManagement")}
          </h2>
          <p className="text-muted-foreground">
            {t("budget.budgetManagementDescription")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            {t("common.filter")}
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            {t("budget.createBudget")}
          </Button>
        </div>
      </div>

      <Tabs
        defaultValue="overview"
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <TabsList>
          <TabsTrigger value="overview">{t("common.overview")}</TabsTrigger>
          <TabsTrigger value="budgets">{t("budget.budgets")}</TabsTrigger>
          <TabsTrigger value="reports">{t("common.reports")}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {budgets.slice(0, 4).map((budget) => (
              <div
                key={budget.id}
                onClick={() => onBudgetSelect && onBudgetSelect(budget.id)}
                className="cursor-pointer transition-transform hover:scale-[1.01]"
              >
                <BudgetSummaryComponent budget={budget} />
              </div>
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChartIcon className="mr-2 h-5 w-5" />
                  {t("budget.budgetUtilization")}
                </CardTitle>
                <CardDescription>{t("budget.plannedVsActual")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {budgetUtilizationData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={budgetUtilizationData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="name"
                          angle={-45}
                          textAnchor="end"
                          height={70}
                        />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar
                          dataKey="planned"
                          name={t("budget.planned")}
                          fill="#8884d8"
                        />
                        <Bar
                          dataKey="actual"
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
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChartIcon className="mr-2 h-5 w-5" />
                  {t("budget.budgetStatus")}
                </CardTitle>
                <CardDescription>{t("budget.budgetsByStatus")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  {budgetStatusData.some((item) => item.value > 0) ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={budgetStatusData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={renderCustomizedLabel}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {budgetStatusData.map((entry, index) => (
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
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <p className="text-muted-foreground">
                        {t("common.noData")}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="budgets">
          <Card>
            <CardHeader>
              <CardTitle>{t("budget.allBudgets")}</CardTitle>
              <CardDescription>
                {t("budget.allBudgetsDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("common.name")}</TableHead>
                      <TableHead>{t("budget.client")}</TableHead>
                      <TableHead>{t("budget.project")}</TableHead>
                      <TableHead>{t("budget.planned")}</TableHead>
                      <TableHead>{t("budget.actual")}</TableHead>
                      <TableHead>{t("budget.utilization")}</TableHead>
                      <TableHead>{t("common.status")}</TableHead>
                      <TableHead>{t("budget.period")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-4">
                          {t("common.loading")}
                        </TableCell>
                      </TableRow>
                    ) : budgets.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-4">
                          {t("common.noResults")}
                        </TableCell>
                      </TableRow>
                    ) : (
                      budgets.map((budget) => (
                        <TableRow
                          key={budget.id}
                          className="cursor-pointer hover:bg-gray-50"
                          onClick={() =>
                            onBudgetSelect && onBudgetSelect(budget.id)
                          }
                        >
                          <TableCell className="font-medium">
                            {budget.name}
                          </TableCell>
                          <TableCell>{budget.client?.name || "-"}</TableCell>
                          <TableCell>{budget.project?.name || "-"}</TableCell>
                          <TableCell>
                            {new Intl.NumberFormat(undefined, {
                              style: "currency",
                              currency: budget.currency,
                            }).format(budget.totalPlanned)}
                          </TableCell>
                          <TableCell>
                            {new Intl.NumberFormat(undefined, {
                              style: "currency",
                              currency: budget.currency,
                            }).format(budget.totalActual)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                                <div
                                  className={`h-2.5 rounded-full ${budget.utilization > 90 ? "bg-red-500" : budget.utilization > 70 ? "bg-amber-500" : "bg-green-500"}`}
                                  style={{
                                    width: `${Math.min(100, budget.utilization)}%`,
                                  }}
                                ></div>
                              </div>
                              <span className="text-xs">
                                {budget.utilization.toFixed(0)}%
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {getBudgetStatusBadge(budget.status)}
                          </TableCell>
                          <TableCell>
                            {new Date(budget.startDate).toLocaleDateString()} -{" "}
                            {new Date(budget.endDate).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
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
                  <Button variant="outline">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    {t("common.refresh")}
                  </Button>
                  <Button>
                    <FileText className="mr-2 h-4 w-4" />
                    {t("budget.generateReport")}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("common.name")}</TableHead>
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
                        {t("budget.noReportsGenerated")}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BudgetManagementDashboard;
