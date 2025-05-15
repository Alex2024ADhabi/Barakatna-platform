import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { useTranslatedDirection } from "@/hooks/useTranslatedDirection";
import BudgetForecasting from "./BudgetForecasting";
import BudgetScenarioPlanner from "./BudgetScenarioPlanner";
import ForecastSettingsModal from "./ForecastSettingsModal";
import {
  BudgetForecastService,
  ForecastSettings,
  ForecastResult,
} from "@/lib/services/budgetForecastService";
import {
  TrendingUp,
  Settings,
  BarChart4,
  RefreshCw,
  Download,
  AlertTriangle,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface BudgetForecastDashboardProps {
  budgetId: string;
  budgetName: string;
}

const BudgetForecastDashboard: React.FC<BudgetForecastDashboardProps> = ({
  budgetId,
  budgetName,
}) => {
  const { t } = useTranslation();
  const { directionClass } = useTranslatedDirection();
  const [activeTab, setActiveTab] = useState("overview");
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<ForecastSettings | null>(null);
  const [forecastResult, setForecastResult] = useState<ForecastResult | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string | null>(
    null,
  );

  const forecastService = BudgetForecastService.getInstance();

  useEffect(() => {
    // Load forecast settings
    const loadedSettings = forecastService.getForecastSettings(budgetId);
    setSettings(loadedSettings);

    // Generate forecast
    generateForecast();
  }, [budgetId]);

  const generateForecast = async (scenarioId?: string) => {
    setLoading(true);
    try {
      const result = await forecastService.generateForecast(
        budgetId,
        scenarioId || selectedScenarioId,
      );
      setForecastResult(result);
    } catch (error) {
      console.error("Error generating forecast:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSettingsSave = (newSettings: ForecastSettings) => {
    forecastService.updateForecastSettings(budgetId, newSettings);
    setSettings(newSettings);
    generateForecast();
  };

  const handleScenarioSelect = (scenarioId: string) => {
    setSelectedScenarioId(scenarioId);
    generateForecast(scenarioId);
  };

  const handleExportForecast = () => {
    if (!forecastResult) return;

    // Create CSV content
    const headers = ["Period", "Forecast Amount", "Lower Bound", "Upper Bound"];
    const rows = forecastResult.forecastData.map((d) => [
      d.period,
      d.forecastAmount,
      d.lowerBound,
      d.upperBound,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    // Create download link
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `budget_forecast_${budgetId}_${new Date().toISOString().split("T")[0]}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className={`space-y-6 ${directionClass}`}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            {t("budget.budgetForecastDashboard")}
          </h2>
          <p className="text-muted-foreground">
            {t("budget.budgetForecastDashboardDescription", { budgetName })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => generateForecast()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            {t("common.refresh")}
          </Button>
          <Button onClick={() => setShowSettings(true)}>
            <Settings className="mr-2 h-4 w-4" />
            {t("budget.forecastSettings")}
          </Button>
        </div>
      </div>

      <Tabs
        defaultValue="overview"
        value={activeTab}
        onValueChange={setActiveTab}
      >
        <TabsList>
          <TabsTrigger value="overview">
            <TrendingUp className="mr-2 h-4 w-4" />
            {t("budget.overview")}
          </TabsTrigger>
          <TabsTrigger value="scenarios">
            <BarChart4 className="mr-2 h-4 w-4" />
            {t("budget.scenarios")}
          </TabsTrigger>
          <TabsTrigger value="advanced">{t("budget.advanced")}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="mr-2 h-5 w-5" />
                {t("budget.forecastOverview")}
                {forecastResult?.scenarioName && (
                  <span className="ml-2 text-sm font-normal text-muted-foreground">
                    ({forecastResult.scenarioName})
                  </span>
                )}
              </CardTitle>
              <CardDescription>
                {t("budget.forecastOverviewDescription")}
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
                ) : forecastResult ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={forecastResult.forecastData}
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
                      <Tooltip
                        formatter={(value) => formatCurrency(value as number)}
                      />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="forecastAmount"
                        name={t("budget.forecast")}
                        stroke="#8884d8"
                        fill="#8884d8"
                        fillOpacity={0.3}
                        activeDot={{ r: 8 }}
                      />
                      <Area
                        type="monotone"
                        dataKey="upperBound"
                        name={t("budget.upperBound")}
                        stroke="#82ca9d"
                        fill="#82ca9d"
                        fillOpacity={0.1}
                        strokeDasharray="5 5"
                      />
                      <Area
                        type="monotone"
                        dataKey="lowerBound"
                        name={t("budget.lowerBound")}
                        stroke="#ff7300"
                        fill="#ff7300"
                        fillOpacity={0.1}
                        strokeDasharray="5 5"
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
                  {forecastResult ? (
                    <>
                      <div>
                        <h4 className="text-sm font-medium">
                          {t("budget.totalForecast")}
                        </h4>
                        <p className="text-2xl font-bold">
                          {formatCurrency(
                            forecastResult.forecastData.reduce(
                              (sum, d) => sum + d.forecastAmount,
                              0,
                            ),
                          )}
                        </p>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium">
                          {t("budget.forecastAccuracy")}
                        </h4>
                        <p className="text-lg">
                          {Math.round(forecastResult.metadata.accuracy * 100)}%
                        </p>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium">
                          {t("budget.forecastPeriod")}
                        </h4>
                        <p className="text-lg">
                          {forecastResult.forecastData.length > 0
                            ? `${forecastResult.forecastData[0].period} - ${forecastResult.forecastData[forecastResult.forecastData.length - 1].period}`
                            : "N/A"}
                        </p>
                      </div>

                      <div className="flex items-center">
                        <AlertTriangle className="mr-2 h-5 w-5 text-amber-500" />
                        <p className="text-sm text-muted-foreground">
                          {t("budget.forecastDisclaimer")}
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="flex h-[200px] items-center justify-center">
                      <p className="text-muted-foreground">
                        {loading ? t("common.loading") : t("common.noData")}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("budget.forecastActions")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Button
                    className="w-full"
                    onClick={handleExportForecast}
                    disabled={!forecastResult}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    {t("budget.exportForecast")}
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setActiveTab("scenarios")}
                  >
                    <BarChart4 className="mr-2 h-4 w-4" />
                    {t("budget.viewScenarios")}
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
          <BudgetScenarioPlanner
            budgetId={budgetId}
            onScenarioSelect={handleScenarioSelect}
          />
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
          <BudgetForecasting
            budgetId={budgetId}
            onSettingsChange={() => generateForecast()}
          />
        </TabsContent>
      </Tabs>

      {settings && (
        <ForecastSettingsModal
          open={showSettings}
          onClose={() => setShowSettings(false)}
          settings={settings}
          onSave={handleSettingsSave}
        />
      )}
    </div>
  );
};

export default BudgetForecastDashboard;
