import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";
import { useTranslatedDirection } from "@/hooks/useTranslatedDirection";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  BudgetForecastService,
  ForecastScenario,
  ScenarioType,
  ForecastModelType,
} from "@/lib/services/budgetForecastService";
import { Plus, Trash2, Edit, Copy, BarChart4 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface BudgetScenarioPlannerProps {
  budgetId: string;
  onScenarioSelect?: (scenarioId: string) => void;
}

const BudgetScenarioPlanner: React.FC<BudgetScenarioPlannerProps> = ({
  budgetId,
  onScenarioSelect,
}) => {
  const { t } = useTranslation();
  const { directionClass } = useTranslatedDirection();
  const [scenarios, setScenarios] = useState<ForecastScenario[]>([]);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string | null>(
    null,
  );
  const [comparisonData, setComparisonData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const forecastService = BudgetForecastService.getInstance();

  useEffect(() => {
    // Load scenarios
    const loadedScenarios = forecastService.getScenarios(budgetId);
    setScenarios(loadedScenarios);

    // If no scenarios exist, create default ones
    if (loadedScenarios.length === 0) {
      createDefaultScenarios();
    }
  }, [budgetId]);

  const createDefaultScenarios = () => {
    const settings = forecastService.getForecastSettings(budgetId);

    // Create baseline scenario
    const baselineScenario = forecastService.createScenario(budgetId, {
      name: t("budget.baselineScenario"),
      type: ScenarioType.Baseline,
      description: t("budget.baselineScenarioDescription"),
      settings: { ...settings },
      adjustmentFactors: {},
      createdBy: "system",
    });

    // Create optimistic scenario
    const optimisticScenario = forecastService.createScenario(budgetId, {
      name: t("budget.optimisticScenario"),
      type: ScenarioType.Optimistic,
      description: t("budget.optimisticScenarioDescription"),
      settings: { ...settings },
      adjustmentFactors: { growth: 1.1, efficiency: 0.95 },
      createdBy: "system",
    });

    // Create pessimistic scenario
    const pessimisticScenario = forecastService.createScenario(budgetId, {
      name: t("budget.pessimisticScenario"),
      type: ScenarioType.Pessimistic,
      description: t("budget.pessimisticScenarioDescription"),
      settings: { ...settings, adjustForInflation: true, inflationRate: 0.05 },
      adjustmentFactors: { growth: 0.9, efficiency: 1.05 },
      createdBy: "system",
    });

    setScenarios([baselineScenario, optimisticScenario, pessimisticScenario]);
  };

  const handleCompareScenarios = async () => {
    if (scenarios.length < 2) return;

    setLoading(true);
    try {
      const scenarioIds = scenarios.map((s) => s.id);
      const comparison = await forecastService.compareScenarios(
        budgetId,
        scenarioIds,
      );
      setComparisonData(comparison.comparisonData);
    } catch (error) {
      console.error("Error comparing scenarios:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectScenario = (scenarioId: string) => {
    setSelectedScenarioId(scenarioId);
    if (onScenarioSelect) {
      onScenarioSelect(scenarioId);
    }
  };

  const handleDeleteScenario = (scenarioId: string) => {
    forecastService.deleteScenario(budgetId, scenarioId);
    setScenarios(scenarios.filter((s) => s.id !== scenarioId));
    if (selectedScenarioId === scenarioId) {
      setSelectedScenarioId(null);
    }
  };

  const getScenarioTypeBadge = (type: ScenarioType) => {
    switch (type) {
      case ScenarioType.Baseline:
        return <Badge variant="default">{t("budget.baseline")}</Badge>;
      case ScenarioType.Optimistic:
        return <Badge variant="success">{t("budget.optimistic")}</Badge>;
      case ScenarioType.Pessimistic:
        return <Badge variant="destructive">{t("budget.pessimistic")}</Badge>;
      case ScenarioType.Custom:
        return <Badge variant="outline">{t("budget.custom")}</Badge>;
      default:
        return null;
    }
  };

  const getModelTypeName = (modelType: ForecastModelType) => {
    switch (modelType) {
      case ForecastModelType.SimpleMovingAverage:
        return t("budget.simpleMovingAverage");
      case ForecastModelType.WeightedMovingAverage:
        return t("budget.weightedMovingAverage");
      case ForecastModelType.ExponentialSmoothing:
        return t("budget.exponentialSmoothing");
      case ForecastModelType.LinearRegression:
        return t("budget.linearRegression");
      case ForecastModelType.SeasonalAdjusted:
        return t("budget.seasonalAdjusted");
      default:
        return modelType;
    }
  };

  return (
    <div className={`space-y-6 ${directionClass}`}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {t("budget.scenarioPlanning")}
          </h2>
          <p className="text-muted-foreground">
            {t("budget.scenarioPlanningDescription")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => createDefaultScenarios()}>
            <Plus className="mr-2 h-4 w-4" />
            {t("budget.addScenario")}
          </Button>
          <Button onClick={handleCompareScenarios}>
            <BarChart4 className="mr-2 h-4 w-4" />
            {t("budget.compareScenarios")}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>{t("budget.scenarios")}</CardTitle>
            <CardDescription>
              {t("budget.scenariosDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {scenarios.map((scenario) => (
                  <div
                    key={scenario.id}
                    className={`p-4 border rounded-lg cursor-pointer ${selectedScenarioId === scenario.id ? "border-primary bg-primary/5" : ""}`}
                    onClick={() => handleSelectScenario(scenario.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{scenario.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {scenario.description}
                        </p>
                      </div>
                      <div>{getScenarioTypeBadge(scenario.type)}</div>
                    </div>
                    <div className="mt-2">
                      <p className="text-xs text-muted-foreground">
                        {t("budget.forecastModel")}:{" "}
                        {getModelTypeName(scenario.settings.modelType)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {t("budget.forecastMonths")}:{" "}
                        {scenario.settings.forecastMonths}
                      </p>
                    </div>
                    <div className="mt-2 flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Edit scenario functionality
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Clone scenario functionality
                        }}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteScenario(scenario.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>{t("budget.scenarioComparison")}</CardTitle>
            <CardDescription>
              {t("budget.scenarioComparisonDescription")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-[400px]">
                <p className="text-muted-foreground">{t("common.loading")}</p>
              </div>
            ) : comparisonData.length > 0 ? (
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={comparisonData}
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
                    {scenarios.map((scenario, index) => (
                      <Line
                        key={scenario.id}
                        type="monotone"
                        dataKey={`scenarios.${scenario.name}`}
                        name={scenario.name}
                        stroke={getScenarioColor(index)}
                        activeDot={{ r: 8 }}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[400px]">
                <p className="text-muted-foreground mb-4">
                  {t("budget.noComparisonData")}
                </p>
                <Button onClick={handleCompareScenarios}>
                  {t("budget.compareScenarios")}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Helper function to get colors for scenarios
function getScenarioColor(index: number): string {
  const colors = [
    "#8884d8", // Purple
    "#82ca9d", // Green
    "#ff7300", // Orange
    "#0088fe", // Blue
    "#ff8042", // Coral
    "#00C49F", // Teal
  ];
  return colors[index % colors.length];
}

export default BudgetScenarioPlanner;
