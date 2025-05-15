import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { useTranslatedDirection } from "@/hooks/useTranslatedDirection";
import { budgetApi } from "@/lib/api/budget/budgetApi";
import { BudgetForecast, BudgetPerformance } from "@/lib/api/budget/types";
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
  TrendingUp,
  Settings,
  Download,
  Calendar,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import ForecastSettings from "./ForecastSettings";

interface BudgetForecastingProps {
  budgetId: string;
  onSettingsChange?: () => void;
}

const BudgetForecasting = ({
  budgetId,
  onSettingsChange,
}: BudgetForecastingProps) => {
  const { t } = useTranslation();
  const dir = useTranslatedDirection();
  const [forecasts, setForecasts] = useState<BudgetForecast[]>([]);
  const [performance, setPerformance] = useState<BudgetPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [forecastPeriod, setForecastPeriod] = useState<
    "monthly" | "quarterly" | "annual"
  >("monthly");
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState("trends");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const forecastData = await budgetApi.getBudgetForecasts(budgetId);
        const performanceData = await budgetApi.getBudgetPerformance(budgetId);
        setForecasts(forecastData);
        setPerformance(performanceData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching forecast data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, [budgetId]);

  // Generate forecast data for the next 6 months based on historical trends
  const generateForecastData = () => {
    if (performance.length === 0) return [];

    // Use historical data to predict future trends
    const lastSixMonths = performance.slice(-6);
    const avgGrowthRate =
      lastSixMonths.reduce((sum, curr, idx, arr) => {
        if (idx === 0) return sum;
        const prev = arr[idx - 1];
        const growthRate =
          (curr.actualAmount - prev.actualAmount) / prev.actualAmount;
        return sum + growthRate;
      }, 0) /
      (lastSixMonths.length - 1);

    // Generate next 6 months forecast
    const lastMonth = lastSixMonths[lastSixMonths.length - 1];
    const nextSixMonths = [];

    for (let i = 1; i <= 6; i++) {
      const [year, month] = lastMonth.period.split("-");
      let nextMonth = parseInt(month) + i;
      let nextYear = parseInt(year);

      if (nextMonth > 12) {
        nextMonth = nextMonth - 12;
        nextYear += 1;
      }

      const nextMonthStr = nextMonth.toString().padStart(2, "0");
      const period = `${nextYear}-${nextMonthStr}`;
      const forecastAmount =
        lastMonth.actualAmount * Math.pow(1 + avgGrowthRate, i);

      nextSixMonths.push({
        period,
        forecastAmount: Math.round(forecastAmount),
        actualAmount: 0, // No actual data yet
        lowerBound: Math.round(forecastAmount * 0.9), // 10% lower bound
        upperBound: Math.round(forecastAmount * 1.1), // 10% upper bound
      });
    }

    return nextSixMonths;
  };

  const forecastData = generateForecastData();

  // Combine historical and forecast data for visualization
  const combinedData = [
    ...performance.map((p) => ({
      period: p.period,
      actual: p.actualAmount,
      planned: p.plannedAmount,
    })),
    ...forecastData.map((f) => ({
      period: f.period,
      forecast: f.forecastAmount,
      lowerBound: f.lowerBound,
      upperBound: f.upperBound,
    })),
  ];

  const handleRefresh = async () => {
    try {
      setLoading(true);
      const forecastData = await budgetApi.getBudgetForecasts(budgetId);
      const performanceData = await budgetApi.getBudgetPerformance(budgetId);
      setForecasts(forecastData);
      setPerformance(performanceData);
      setLoading(false);
    } catch (error) {
      console.error("Error refreshing forecast data:", error);
      setLoading(false);
    }
  };

  const handleSettingsChange = () => {
    setShowSettings(false);
    if (onSettingsChange) onSettingsChange();
    handleRefresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            {t("budget.budgetForecasting")}
          </h2>
          <p className="text-muted-foreground">
            {t("budget.budgetForecastingDescription")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={forecastPeriod}
            onValueChange={(value) => setForecastPeriod(value as any)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t("budget.selectPeriod")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">{t("budget.monthly")}</SelectItem>
              <SelectItem value="quarterly">{t("budget.quarterly")}</SelectItem>
              <SelectItem value="annual">{t("budget.annual")}</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" />
            {t("common.refresh")}
          </Button>
          <Button onClick={() => setShowSettings(true)}>
            <Settings className="mr-2 h-4 w-4" />
            {t("budget.forecastSettings")}
          </Button>
        </div>
      </div>

      {showSettings ? (
        <ForecastSettings
          budgetId={budgetId}
          onSave={handleSettingsChange}
          onCancel={() => setShowSettings(false)}
        />
      ) : (
        <Tabs
          defaultValue="trends"
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <TabsList>
            <TabsTrigger value="trends">{t("budget.trends")}</TabsTrigger>
            <TabsTrigger value="scenarios">{t("budget.scenarios")}</TabsTrigger>
            <TabsTrigger value="analysis">{t("budget.analysis")}</TabsTrigger>
          </TabsList>

          <TabsContent value="trends" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5" />
                  {t("budget.budgetForecastTrends")}
                </CardTitle>
                <CardDescription>
                  {t("budget.historicalAndProjectedTrends")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  {loading ? (
                    <div className="flex h-full items-center justify-center">
                      <p className="text-muted-foreground">
                        {t("common.loading")}
                      </p>
                    </div>
                  ) : combinedData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={combinedData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="period"
                          angle={-45}
                          textAnchor="end"
                          height={70}
                        />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Area
                          type="monotone"
                          dataKey="planned"
                          name={t("budget.planned")}
                          stroke="#8884d8"
                          fill="#8884d8"
                          fillOpacity={0.1}
                          activeDot={{ r: 8 }}
                        />
                        <Area
                          type="monotone"
                          dataKey="actual"
                          name={t("budget.actual")}
                          stroke="#82ca9d"
                          fill="#82ca9d"
                          fillOpacity={0.1}
                          activeDot={{ r: 8 }}
                        />
                        <Area
                          type="monotone"
                          dataKey="forecast"
                          name={t("budget.forecast")}
                          stroke="#ff7300"
                          fill="#ff7300"
                          fillOpacity={0.1}
                          strokeDasharray="5 5"
                        />
                        <Area
                          type="monotone"
                          dataKey="upperBound"
                          name={t("budget.upperBound")}
                          stroke="#ff7300"
                          fill="#ff7300"
                          fillOpacity={0.1}
                          strokeDasharray="3 3"
                          strokeOpacity={0.5}
                        />
                        <Area
                          type="monotone"
                          dataKey="lowerBound"
                          name={t("budget.lowerBound")}
                          stroke="#ff7300"
                          fill="#ff7300"
                          fillOpacity={0.1}
                          strokeDasharray="3 3"
                          strokeOpacity={0.5}
                        />
                      </AreaChart>
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

            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>{t("budget.forecastSummary")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium">
                        {t("budget.projectedSpending")}
                      </h4>
                      <p className="text-2xl font-bold">
                        {forecastData.length > 0
                          ? new Intl.NumberFormat(undefined, {
                              style: "currency",
                              currency: "USD",
                            }).format(
                              forecastData.reduce(
                                (sum, f) => sum + f.forecastAmount,
                                0,
                              ),
                            )
                          : "$0.00"}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium">
                        {t("budget.confidenceInterval")}
                      </h4>
                      <p className="text-lg">±10% ({t("budget.medium")})</p>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium">
                        {t("budget.forecastPeriod")}
                      </h4>
                      <p className="text-lg">
                        {forecastData.length > 0
                          ? `${forecastData[0].period} - ${forecastData[forecastData.length - 1].period}`
                          : "N/A"}
                      </p>
                    </div>

                    <div className="flex items-center">
                      <AlertTriangle className="mr-2 h-5 w-5 text-amber-500" />
                      <p className="text-sm text-muted-foreground">
                        {t("budget.forecastDisclaimer")}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t("budget.forecastActions")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Button className="w-full">
                      <Download className="mr-2 h-4 w-4" />
                      {t("budget.exportForecast")}
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Calendar className="mr-2 h-4 w-4" />
                      {t("budget.scheduleForecastReview")}
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setShowSettings(true)}
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      {t("budget.adjustForecastParameters")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="scenarios" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t("budget.scenarioPlanning")}</CardTitle>
                <CardDescription>
                  {t("budget.scenarioPlanningDescription")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex h-[300px] items-center justify-center">
                  <p className="text-muted-foreground">
                    {t("budget.scenarioFeatureComingSoon")}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analysis" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{t("budget.forecastAnalysis")}</CardTitle>
                <CardDescription>
                  {t("budget.forecastAnalysisDescription")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex h-[300px] items-center justify-center">
                  <p className="text-muted-foreground">
                    {t("budget.analysisFeatureComingSoon")}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default BudgetForecasting;
