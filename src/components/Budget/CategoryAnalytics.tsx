import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { useTranslatedDirection } from "@/hooks/useTranslatedDirection";
import { budgetApi } from "@/lib/api/budget/budgetApi";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  PieChart as PieChartIcon,
  BarChart as BarChartIcon,
  LineChart as LineChartIcon,
  TrendingUp,
  AlertTriangle,
  Download,
  RefreshCw,
  Filter,
} from "lucide-react";
import {
  BudgetCategory,
  BudgetExpense,
  BudgetPerformance,
} from "@/lib/api/budget/types";

interface CategoryAnalyticsProps {
  budgetId: string;
}

interface CategoryTrend {
  month: string;
  plannedAmount: number;
  actualAmount: number;
  variance: number;
  variancePercentage: number;
}

interface CategoryBenchmark {
  category: string;
  yourSpending: number;
  industryAverage: number;
  difference: number;
}

interface CategoryRecommendation {
  category: string;
  message: string;
  impact: "high" | "medium" | "low";
  potentialSavings: number;
}

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82CA9D",
  "#FFC658",
  "#8DD1E1",
];

const CategoryAnalytics = ({ budgetId }: CategoryAnalyticsProps) => {
  const { t } = useTranslation();
  const dir = useTranslatedDirection();
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<BudgetCategory[]>([]);
  const [expenses, setExpenses] = useState<BudgetExpense[]>([]);
  const [performance, setPerformance] = useState<BudgetPerformance[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [timeframe, setTimeframe] = useState<
    "monthly" | "quarterly" | "yearly"
  >("monthly");
  const [activeTab, setActiveTab] = useState("distribution");

  // Mock data for demonstration
  const [categoryTrends, setCategoryTrends] = useState<CategoryTrend[]>([]);
  const [benchmarks, setBenchmarks] = useState<CategoryBenchmark[]>([]);
  const [recommendations, setRecommendations] = useState<
    CategoryRecommendation[]
  >([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch categories and expenses for the budget
        const categoriesData = await budgetApi.getBudgetCategories(budgetId);
        const expensesData = await budgetApi.getBudgetExpenses(budgetId);
        const performanceData = await budgetApi.getBudgetPerformance(budgetId);

        setCategories(categoriesData);
        setExpenses(expensesData);
        setPerformance(performanceData);

        if (categoriesData.length > 0) {
          setSelectedCategory(categoriesData[0].id);
        }

        // Generate mock trend data
        const mockTrends: CategoryTrend[] = [
          {
            month: "Jan",
            plannedAmount: 40000,
            actualAmount: 35000,
            variance: -5000,
            variancePercentage: -12.5,
          },
          {
            month: "Feb",
            plannedAmount: 40000,
            actualAmount: 38000,
            variance: -2000,
            variancePercentage: -5,
          },
          {
            month: "Mar",
            plannedAmount: 40000,
            actualAmount: 37000,
            variance: -3000,
            variancePercentage: -7.5,
          },
          {
            month: "Apr",
            plannedAmount: 40000,
            actualAmount: 42000,
            variance: 2000,
            variancePercentage: 5,
          },
          {
            month: "May",
            plannedAmount: 40000,
            actualAmount: 43000,
            variance: 3000,
            variancePercentage: 7.5,
          },
          {
            month: "Jun",
            plannedAmount: 40000,
            actualAmount: 45000,
            variance: 5000,
            variancePercentage: 12.5,
          },
        ];
        setCategoryTrends(mockTrends);

        // Generate mock benchmark data
        const mockBenchmarks: CategoryBenchmark[] = [
          {
            category: "Materials",
            yourSpending: 85000,
            industryAverage: 90000,
            difference: -5000,
          },
          {
            category: "Labor",
            yourSpending: 62000,
            industryAverage: 58000,
            difference: 4000,
          },
          {
            category: "Equipment",
            yourSpending: 43000,
            industryAverage: 45000,
            difference: -2000,
          },
          {
            category: "Administrative",
            yourSpending: 20000,
            industryAverage: 25000,
            difference: -5000,
          },
        ];
        setBenchmarks(mockBenchmarks);

        // Generate mock recommendations
        const mockRecommendations: CategoryRecommendation[] = [
          {
            category: "Materials",
            message: t("budget.bulkPurchaseRecommendation"),
            impact: "high",
            potentialSavings: 12000,
          },
          {
            category: "Labor",
            message: t("budget.laborSchedulingRecommendation"),
            impact: "medium",
            potentialSavings: 8000,
          },
          {
            category: "Equipment",
            message: t("budget.equipmentRentalRecommendation"),
            impact: "low",
            potentialSavings: 3000,
          },
        ];
        setRecommendations(mockRecommendations);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching budget analytics data:", error);
        setLoading(false);
      }
    };

    if (budgetId) {
      fetchData();
    }
  }, [budgetId, t]);

  const handleRefresh = () => {
    // In a real implementation, this would refresh the data from the API
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 500);
  };

  const getCategoryById = (id: string) => {
    return categories.find((category) => category.id === id);
  };

  const getDistributionData = () => {
    return categories.map((category) => ({
      name: category.name,
      value: category.actualAmount,
      plannedAmount: category.plannedAmount,
      utilization: category.utilization || 0,
    }));
  };

  const getTrendData = () => {
    // In a real implementation, this would filter by the selected category
    return categoryTrends;
  };

  const getBenchmarkData = () => {
    // In a real implementation, this would filter by the selected category
    return benchmarks;
  };

  const getRecommendationsForCategory = (categoryId: string) => {
    const category = getCategoryById(categoryId);
    if (!category) return [];

    // In a real implementation, this would filter recommendations by the selected category
    return recommendations.filter((rec) => rec.category === category.name);
  };

  const renderImpactBadge = (impact: "high" | "medium" | "low") => {
    const colorMap = {
      high: "bg-green-100 text-green-800",
      medium: "bg-yellow-100 text-yellow-800",
      low: "bg-blue-100 text-blue-800",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${colorMap[impact]}`}
      >
        {t(`budget.impact${impact.charAt(0).toUpperCase() + impact.slice(1)}`)}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            {t("budget.categoryAnalytics")}
          </h2>
          <p className="text-muted-foreground">
            {t("budget.categoryAnalyticsDescription")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" />
            {t("common.refresh")}
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            {t("common.export")}
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="flex-1 flex items-center gap-2">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder={t("budget.selectCategory")} />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={timeframe}
            onValueChange={(value) =>
              setTimeframe(value as "monthly" | "quarterly" | "yearly")
            }
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder={t("budget.selectTimeframe")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">{t("budget.monthly")}</SelectItem>
              <SelectItem value="quarterly">{t("budget.quarterly")}</SelectItem>
              <SelectItem value="yearly">{t("budget.yearly")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs
        defaultValue="distribution"
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList>
          <TabsTrigger value="distribution" className="flex items-center">
            <PieChartIcon className="mr-2 h-4 w-4" />
            {t("budget.distribution")}
          </TabsTrigger>
          <TabsTrigger value="trends" className="flex items-center">
            <LineChartIcon className="mr-2 h-4 w-4" />
            {t("budget.trends")}
          </TabsTrigger>
          <TabsTrigger value="benchmarks" className="flex items-center">
            <BarChartIcon className="mr-2 h-4 w-4" />
            {t("budget.benchmarks")}
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="flex items-center">
            <TrendingUp className="mr-2 h-4 w-4" />
            {t("budget.recommendations")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="distribution">
          <Card>
            <CardHeader>
              <CardTitle>{t("budget.categoryDistribution")}</CardTitle>
              <CardDescription>
                {t("budget.categoryDistributionDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex h-80 items-center justify-center">
                  <p className="text-muted-foreground">{t("common.loading")}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">
                      {t("budget.actualSpending")}
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={getDistributionData()}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                          nameKey="name"
                          label={({ name, percent }) =>
                            `${name}: ${(percent * 100).toFixed(0)}%`
                          }
                        >
                          {getDistributionData().map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `$${value}`} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-4">
                      {t("budget.plannedVsActual")}
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={getDistributionData()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value) => `$${value}`} />
                        <Legend />
                        <Bar
                          dataKey="plannedAmount"
                          name={t("budget.planned")}
                          fill="#8884d8"
                        />
                        <Bar
                          dataKey="value"
                          name={t("budget.actual")}
                          fill="#82ca9d"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="md:col-span-2">
                    <h3 className="text-lg font-medium mb-4">
                      {t("budget.utilizationByCategory")}
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={getDistributionData()} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" domain={[0, 100]} />
                        <YAxis dataKey="name" type="category" width={150} />
                        <Tooltip formatter={(value) => `${value}%`} />
                        <Legend />
                        <Bar
                          dataKey="utilization"
                          name={t("budget.utilization")}
                          fill="#8884d8"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedCategory
                  ? t("budget.categoryTrends", {
                      category: getCategoryById(selectedCategory)?.name,
                    })
                  : t("budget.allCategoriesTrends")}
              </CardTitle>
              <CardDescription>
                {t("budget.categoryTrendsDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex h-80 items-center justify-center">
                  <p className="text-muted-foreground">{t("common.loading")}</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">
                      {t("budget.spendingOverTime")}
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={getTrendData()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip formatter={(value) => `$${value}`} />
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
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-4">
                      {t("budget.varianceOverTime")}
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={getTrendData()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip formatter={(value) => `${value}%`} />
                        <Legend />
                        <Bar
                          dataKey="variancePercentage"
                          name={t("budget.variance")}
                          fill="#8884d8"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="benchmarks">
          <Card>
            <CardHeader>
              <CardTitle>{t("budget.categoryBenchmarks")}</CardTitle>
              <CardDescription>
                {t("budget.categoryBenchmarksDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex h-80 items-center justify-center">
                  <p className="text-muted-foreground">{t("common.loading")}</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">
                      {t("budget.industryComparison")}
                    </h3>
                    <ResponsiveContainer width="100%" height={400}>
                      <BarChart data={getBenchmarkData()}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="category" />
                        <YAxis />
                        <Tooltip formatter={(value) => `$${value}`} />
                        <Legend />
                        <Bar
                          dataKey="yourSpending"
                          name={t("budget.yourSpending")}
                          fill="#8884d8"
                        />
                        <Bar
                          dataKey="industryAverage"
                          name={t("budget.industryAverage")}
                          fill="#82ca9d"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-4">
                      {t("budget.differenceFromAverage")}
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2 px-4">
                              {t("budget.category")}
                            </th>
                            <th className="text-right py-2 px-4">
                              {t("budget.yourSpending")}
                            </th>
                            <th className="text-right py-2 px-4">
                              {t("budget.industryAverage")}
                            </th>
                            <th className="text-right py-2 px-4">
                              {t("budget.difference")}
                            </th>
                            <th className="text-right py-2 px-4">
                              {t("budget.status")}
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {getBenchmarkData().map((benchmark, index) => (
                            <tr key={index} className="border-b">
                              <td className="py-2 px-4">
                                {benchmark.category}
                              </td>
                              <td className="text-right py-2 px-4">
                                ${benchmark.yourSpending.toLocaleString()}
                              </td>
                              <td className="text-right py-2 px-4">
                                ${benchmark.industryAverage.toLocaleString()}
                              </td>
                              <td className="text-right py-2 px-4">
                                ${benchmark.difference.toLocaleString()}
                              </td>
                              <td className="text-right py-2 px-4">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${benchmark.difference < 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                                >
                                  {benchmark.difference < 0
                                    ? t("budget.underAverage")
                                    : t("budget.overAverage")}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations">
          <Card>
            <CardHeader>
              <CardTitle>{t("budget.optimizationRecommendations")}</CardTitle>
              <CardDescription>
                {t("budget.optimizationRecommendationsDescription")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex h-80 items-center justify-center">
                  <p className="text-muted-foreground">{t("common.loading")}</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {selectedCategory ? (
                    <div>
                      <h3 className="text-lg font-medium mb-4">
                        {t("budget.recommendationsFor", {
                          category: getCategoryById(selectedCategory)?.name,
                        })}
                      </h3>
                      {getRecommendationsForCategory(selectedCategory).length >
                      0 ? (
                        <div className="grid gap-4">
                          {getRecommendationsForCategory(selectedCategory).map(
                            (recommendation, index) => (
                              <Card key={index}>
                                <CardContent className="pt-6">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <h4 className="font-medium text-lg mb-2">
                                        {recommendation.category}
                                      </h4>
                                      <p className="text-muted-foreground mb-2">
                                        {recommendation.message}
                                      </p>
                                      <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium">
                                          {t("budget.impact")}:
                                        </span>
                                        {renderImpactBadge(
                                          recommendation.impact,
                                        )}
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-sm text-muted-foreground">
                                        {t("budget.potentialSavings")}
                                      </p>
                                      <p className="text-lg font-bold text-green-600">
                                        $
                                        {recommendation.potentialSavings.toLocaleString()}
                                      </p>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ),
                          )}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center p-6 bg-muted/20 rounded-lg">
                          <AlertTriangle className="h-12 w-12 text-muted-foreground mb-2" />
                          <p className="text-muted-foreground">
                            {t("budget.noRecommendations")}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center p-6 bg-muted/20 rounded-lg">
                      <p className="text-muted-foreground">
                        {t("budget.selectCategoryForRecommendations")}
                      </p>
                    </div>
                  )}

                  <div>
                    <h3 className="text-lg font-medium mb-4">
                      {t("budget.topSavingsOpportunities")}
                    </h3>
                    <div className="grid gap-4 md:grid-cols-3">
                      {recommendations
                        .sort((a, b) => b.potentialSavings - a.potentialSavings)
                        .slice(0, 3)
                        .map((recommendation, index) => (
                          <Card key={index}>
                            <CardContent className="pt-6">
                              <h4 className="font-medium mb-2">
                                {recommendation.category}
                              </h4>
                              <p className="text-sm text-muted-foreground mb-4">
                                {recommendation.message}
                              </p>
                              <div className="flex justify-between items-center">
                                {renderImpactBadge(recommendation.impact)}
                                <span className="font-bold text-green-600">
                                  $
                                  {recommendation.potentialSavings.toLocaleString()}
                                </span>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CategoryAnalytics;
