import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
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
import { Budget, BudgetCategory, BudgetExpense } from "@/lib/api/budget/types";
import { budgetApi } from "@/lib/api/budget/budgetApi";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
} from "recharts";
import {
  AlertTriangle,
  ArrowRight,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

interface BudgetTrackingProps {
  budgetId: string;
}

const BudgetTracking = ({ budgetId }: BudgetTrackingProps) => {
  const { t } = useTranslation();
  const dir = useTranslatedDirection();
  const [budget, setBudget] = useState<Budget | null>(null);
  const [categories, setCategories] = useState<BudgetCategory[]>([]);
  const [expenses, setExpenses] = useState<BudgetExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const fetchBudgetData = async () => {
      try {
        const budgetData = await budgetApi.getBudgetById(budgetId);
        if (budgetData) {
          setBudget(budgetData);
          if (budgetData.categories) {
            setCategories(budgetData.categories);
          } else {
            const categoriesData =
              await budgetApi.getBudgetCategories(budgetId);
            setCategories(categoriesData);
          }

          if (budgetData.expenses) {
            setExpenses(budgetData.expenses);
          } else {
            const expensesData = await budgetApi.getBudgetExpenses(budgetId);
            setExpenses(expensesData);
          }
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching budget data:", error);
        setLoading(false);
      }
    };

    fetchBudgetData();
  }, [budgetId]);

  // Calculate budget metrics
  const totalPlanned = categories.reduce(
    (sum, category) => sum + category.plannedAmount,
    0,
  );
  const totalActual = categories.reduce(
    (sum, category) => sum + category.actualAmount,
    0,
  );
  const totalVariance = totalActual - totalPlanned;
  const totalVariancePercentage =
    totalPlanned > 0 ? (totalVariance / totalPlanned) * 100 : 0;
  const utilization = totalPlanned > 0 ? (totalActual / totalPlanned) * 100 : 0;

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: budget?.currency || "USD",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Prepare data for charts
  const categoryChartData = categories.map((category) => ({
    name:
      category.name.length > 15
        ? `${category.name.substring(0, 15)}...`
        : category.name,
    planned: category.plannedAmount,
    actual: category.actualAmount,
    variance: category.actualAmount - category.plannedAmount,
  }));

  // Mock performance data (in a real app, this would come from the API)
  const performanceData = [
    { month: "Jan", planned: 40000, actual: 35000 },
    { month: "Feb", planned: 40000, actual: 38000 },
    { month: "Mar", planned: 40000, actual: 37000 },
    { month: "Apr", planned: 40000, actual: 42000 },
    { month: "May", planned: 40000, actual: 43000 },
    { month: "Jun", planned: 40000, actual: 45000 },
  ];

  // Identify over-budget categories
  const overBudgetCategories = categories.filter(
    (category) => category.actualAmount > category.plannedAmount,
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{t("budget.budgetTracking")}</CardTitle>
            <CardDescription>
              {budget?.name || t("budget.budgetTrackingDescription")}
            </CardDescription>
          </div>
          {overBudgetCategories.length > 0 && (
            <Badge variant="destructive" className="flex items-center">
              <AlertTriangle className="mr-1 h-4 w-4" />
              {t("budget.overBudgetAlert", {
                count: overBudgetCategories.length,
              })}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Tabs
          defaultValue="overview"
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <TabsList>
            <TabsTrigger value="overview">{t("common.overview")}</TabsTrigger>
            <TabsTrigger value="categories">
              {t("budget.categories")}
            </TabsTrigger>
            <TabsTrigger value="trends">{t("budget.trends")}</TabsTrigger>
            <TabsTrigger value="alerts">{t("common.alerts")}</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">
                    {formatCurrency(totalPlanned)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t("budget.planned")}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">
                    {formatCurrency(totalActual)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t("budget.actual")}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div
                    className={`text-2xl font-bold flex items-center ${totalVariance > 0 ? "text-red-500" : totalVariance < 0 ? "text-green-500" : ""}`}
                  >
                    {totalVariance > 0 ? (
                      <>
                        <TrendingUp className="mr-2 h-5 w-5" />
                        {formatCurrency(totalVariance)}
                      </>
                    ) : totalVariance < 0 ? (
                      <>
                        <TrendingDown className="mr-2 h-5 w-5" />
                        {formatCurrency(Math.abs(totalVariance))}
                      </>
                    ) : (
                      formatCurrency(0)
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {t("budget.variance")}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">
                    {utilization.toFixed(1)}%
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                    <div
                      className={`h-2.5 rounded-full ${utilization > 90 ? "bg-red-500" : utilization > 70 ? "bg-amber-500" : "bg-green-500"}`}
                      style={{ width: `${Math.min(100, utilization)}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("budget.utilization")}
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
                    <TableHead>{t("budget.utilization")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4">
                        {t("common.loading")}
                      </TableCell>
                    </TableRow>
                  ) : categories.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-4">
                        {t("budget.noCategories")}
                      </TableCell>
                    </TableRow>
                  ) : (
                    categories.map((category) => {
                      const variance =
                        category.actualAmount - category.plannedAmount;
                      const variancePercentage =
                        category.plannedAmount > 0
                          ? (variance / category.plannedAmount) * 100
                          : 0;
                      const categoryUtilization =
                        category.plannedAmount > 0
                          ? (category.actualAmount / category.plannedAmount) *
                            100
                          : 0;

                      return (
                        <TableRow key={category.id}>
                          <TableCell className="font-medium">
                            {category.name}
                          </TableCell>
                          <TableCell>
                            {formatCurrency(category.plannedAmount)}
                          </TableCell>
                          <TableCell>
                            {formatCurrency(category.actualAmount)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              {variance > 0 ? (
                                <>
                                  <TrendingUp className="mr-1 h-4 w-4 text-red-500" />
                                  <span className="text-red-500">
                                    {formatCurrency(variance)} (
                                    {variancePercentage.toFixed(1)}%)
                                  </span>
                                </>
                              ) : variance < 0 ? (
                                <>
                                  <TrendingDown className="mr-1 h-4 w-4 text-green-500" />
                                  <span className="text-green-500">
                                    {formatCurrency(Math.abs(variance))} (
                                    {Math.abs(variancePercentage).toFixed(1)}%)
                                  </span>
                                </>
                              ) : (
                                <span>0</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                                <div
                                  className={`h-2.5 rounded-full ${categoryUtilization > 100 ? "bg-red-500" : categoryUtilization > 80 ? "bg-amber-500" : "bg-green-500"}`}
                                  style={{
                                    width: `${Math.min(100, categoryUtilization)}%`,
                                  }}
                                ></div>
                              </div>
                              <span className="text-xs">
                                {categoryUtilization.toFixed(1)}%
                              </span>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="categories">
            <div className="h-[400px]">
              {categoryChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={categoryChartData}
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
                    <Tooltip
                      formatter={(value) => formatCurrency(value as number)}
                    />
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
                  <p className="text-muted-foreground">{t("common.noData")}</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="trends">
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={performanceData}
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
                    dataKey="planned"
                    name={t("budget.planned")}
                    stroke="#8884d8"
                    activeDot={{ r: 8 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="actual"
                    name={t("budget.actual")}
                    stroke="#82ca9d"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          <TabsContent value="alerts">
            {overBudgetCategories.length > 0 ? (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">
                  {t("budget.overBudgetCategories")}
                </h3>
                {overBudgetCategories.map((category) => {
                  const variance =
                    category.actualAmount - category.plannedAmount;
                  const variancePercentage =
                    category.plannedAmount > 0
                      ? (variance / category.plannedAmount) * 100
                      : 0;

                  return (
                    <Card
                      key={category.id}
                      className="border-red-200 bg-red-50"
                    >
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{category.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {t("budget.planned")}:{" "}
                              {formatCurrency(category.plannedAmount)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {t("budget.actual")}:{" "}
                              {formatCurrency(category.actualAmount)}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-red-500 font-medium flex items-center">
                              <TrendingUp className="mr-1 h-4 w-4" />
                              {formatCurrency(variance)}
                            </div>
                            <p className="text-sm text-red-500">
                              +{variancePercentage.toFixed(1)}%
                            </p>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="border-t border-red-200 bg-red-100">
                        <Button
                          variant="link"
                          className="p-0 h-auto text-red-700"
                        >
                          {t("budget.viewDetails")}{" "}
                          <ArrowRight className="ml-1 h-4 w-4" />
                        </Button>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="bg-green-100 p-3 rounded-full mb-4">
                  <TrendingDown className="h-8 w-8 text-green-500" />
                </div>
                <h3 className="text-lg font-medium text-center">
                  {t("budget.noOverBudgetCategories")}
                </h3>
                <p className="text-sm text-muted-foreground text-center mt-1">
                  {t("budget.allCategoriesWithinBudget")}
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default BudgetTracking;
