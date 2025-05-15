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
import { useTranslation } from "react-i18next";
import { useTranslatedDirection } from "@/hooks/useTranslatedDirection";
import { Budget, BudgetCategory } from "@/lib/api/budget/types";
import { budgetApi } from "@/lib/api/budget/budgetApi";
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
import { ArrowRight, TrendingDown, TrendingUp } from "lucide-react";

interface VarianceAnalysisProps {
  budgetId: string;
}

const VarianceAnalysis = ({ budgetId }: VarianceAnalysisProps) => {
  const { t } = useTranslation();
  const dir = useTranslatedDirection();
  const [budget, setBudget] = useState<Budget | null>(null);
  const [categories, setCategories] = useState<BudgetCategory[]>([]);
  const [loading, setLoading] = useState(true);

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
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching budget data:", error);
        setLoading(false);
      }
    };

    fetchBudgetData();
  }, [budgetId]);

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: budget?.currency || "USD",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Calculate variance metrics
  const categoriesWithVariance = categories.map((category) => {
    const variance = category.actualAmount - category.plannedAmount;
    const variancePercentage =
      category.plannedAmount > 0
        ? (variance / category.plannedAmount) * 100
        : 0;
    return {
      ...category,
      variance,
      variancePercentage,
      varianceType:
        variance > 0 ? "over" : variance < 0 ? "under" : "on-target",
    };
  });

  // Sort by variance percentage (highest to lowest)
  const sortedCategories = [...categoriesWithVariance].sort(
    (a, b) => Math.abs(b.variancePercentage) - Math.abs(a.variancePercentage),
  );

  // Prepare data for charts
  const varianceChartData = sortedCategories.map((category) => ({
    name:
      category.name.length > 15
        ? `${category.name.substring(0, 15)}...`
        : category.name,
    variance: category.variance,
    variancePercentage: category.variancePercentage,
  }));

  // Mock performance data (in a real app, this would come from the API)
  const performanceData = [
    { month: "Jan", planned: 40000, actual: 35000, variance: -5000 },
    { month: "Feb", planned: 40000, actual: 38000, variance: -2000 },
    { month: "Mar", planned: 40000, actual: 37000, variance: -3000 },
    { month: "Apr", planned: 40000, actual: 42000, variance: 2000 },
    { month: "May", planned: 40000, actual: 43000, variance: 3000 },
    { month: "Jun", planned: 40000, actual: 45000, variance: 5000 },
  ];

  // Generate recommendations based on variance analysis
  const generateRecommendations = () => {
    const recommendations = [];

    // Find categories with significant variances
    const significantOverBudget = sortedCategories.filter(
      (c) => c.variancePercentage > 10,
    );
    const significantUnderBudget = sortedCategories.filter(
      (c) => c.variancePercentage < -10,
    );

    if (significantOverBudget.length > 0) {
      recommendations.push({
        type: "warning",
        title: t("budget.overBudgetCategories"),
        description: t("budget.overBudgetRecommendation"),
        categories: significantOverBudget,
      });
    }

    if (significantUnderBudget.length > 0) {
      recommendations.push({
        type: "info",
        title: t("budget.underBudgetCategories"),
        description: t("budget.underBudgetRecommendation"),
        categories: significantUnderBudget,
      });
    }

    // Add general recommendation
    if (recommendations.length === 0) {
      recommendations.push({
        type: "success",
        title: t("budget.onTrackBudget"),
        description: t("budget.onTrackRecommendation"),
        categories: [],
      });
    }

    return recommendations;
  };

  const recommendations = generateRecommendations();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("budget.varianceAnalysis")}</CardTitle>
        <CardDescription>
          {budget?.name || t("budget.varianceAnalysisDescription")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium mb-4">
              {t("budget.varianceByCategory")}
            </h3>
            <div className="h-[300px]">
              {varianceChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={varianceChartData}
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
                      dataKey="variance"
                      name={t("budget.variance")}
                      fill="#8884d8"
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <p className="text-muted-foreground">{t("common.noData")}</p>
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-4">
              {t("budget.varianceTrend")}
            </h3>
            <div className="h-[300px]">
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
                    dataKey="variance"
                    name={t("budget.variance")}
                    stroke="#8884d8"
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
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
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    {t("common.loading")}
                  </TableCell>
                </TableRow>
              ) : sortedCategories.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    {t("budget.noCategories")}
                  </TableCell>
                </TableRow>
              ) : (
                sortedCategories.map((category) => (
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
                        {category.variance > 0 ? (
                          <>
                            <TrendingUp className="mr-1 h-4 w-4 text-red-500" />
                            <span className="text-red-500">
                              {formatCurrency(category.variance)}
                            </span>
                          </>
                        ) : category.variance < 0 ? (
                          <>
                            <TrendingDown className="mr-1 h-4 w-4 text-green-500" />
                            <span className="text-green-500">
                              {formatCurrency(Math.abs(category.variance))}
                            </span>
                          </>
                        ) : (
                          <span>0</span>
                        )}
                      </div>
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
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">{t("budget.recommendations")}</h3>
          {recommendations.map((recommendation, index) => (
            <Card
              key={index}
              className={`border-${recommendation.type === "warning" ? "red" : recommendation.type === "info" ? "blue" : "green"}-200 bg-${recommendation.type === "warning" ? "red" : recommendation.type === "info" ? "blue" : "green"}-50`}
            >
              <CardContent className="pt-6">
                <h4 className="font-medium">{recommendation.title}</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {recommendation.description}
                </p>
                {recommendation.categories.length > 0 && (
                  <div className="mt-4">
                    <h5 className="text-sm font-medium mb-2">
                      {t("budget.affectedCategories")}:
                    </h5>
                    <ul className="list-disc pl-5 space-y-1">
                      {recommendation.categories.slice(0, 3).map((category) => (
                        <li key={category.id} className="text-sm">
                          {category.name} (
                          {category.variancePercentage > 0 ? "+" : ""}
                          {category.variancePercentage.toFixed(1)}%)
                        </li>
                      ))}
                      {recommendation.categories.length > 3 && (
                        <li className="text-sm text-muted-foreground">
                          {t("budget.andMoreCategories", {
                            count: recommendation.categories.length - 3,
                          })}
                        </li>
                      )}
                    </ul>
                  </div>
                )}
                {recommendation.categories.length > 0 && (
                  <Button variant="link" className="p-0 h-auto mt-2">
                    {t("budget.viewDetails")}{" "}
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default VarianceAnalysis;
