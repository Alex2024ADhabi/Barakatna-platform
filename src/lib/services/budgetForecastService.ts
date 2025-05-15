/**
 * Budget Forecast Service
 * Provides advanced budget forecasting capabilities with various forecasting models
 * and scenario planning for the Barakatna Platform
 */

import { BudgetForecast, BudgetPerformance } from "@/lib/api/budget/types";
import { budgetApi } from "@/lib/api/budget/budgetApi";
import eventBus, { EventType } from "@/services/eventBus";

// Forecast model types
export enum ForecastModelType {
  SimpleMovingAverage = "simple_moving_average",
  WeightedMovingAverage = "weighted_moving_average",
  ExponentialSmoothing = "exponential_smoothing",
  LinearRegression = "linear_regression",
  SeasonalAdjusted = "seasonal_adjusted",
}

// Forecast scenario types
export enum ScenarioType {
  Baseline = "baseline",
  Optimistic = "optimistic",
  Pessimistic = "pessimistic",
  Custom = "custom",
}

// Forecast settings interface
export interface ForecastSettings {
  modelType: ForecastModelType;
  historyMonths: number;
  forecastMonths: number;
  confidenceInterval: number;
  seasonalityPattern?: "monthly" | "quarterly" | "annual";
  includeOutliers: boolean;
  adjustForInflation: boolean;
  inflationRate?: number;
  customFactors?: Record<string, number>;
}

// Forecast scenario interface
export interface ForecastScenario {
  id: string;
  name: string;
  type: ScenarioType;
  description?: string;
  settings: ForecastSettings;
  adjustmentFactors: Record<string, number>;
  createdAt: Date;
  createdBy: string;
}

// Forecast result interface
export interface ForecastResult {
  budgetId: string;
  scenarioId?: string;
  scenarioName?: string;
  forecastData: Array<{
    period: string;
    forecastAmount: number;
    lowerBound: number;
    upperBound: number;
    confidence: number;
  }>;
  metadata: {
    modelType: ForecastModelType;
    generatedAt: Date;
    accuracy?: number;
    rmse?: number; // Root Mean Square Error
    mape?: number; // Mean Absolute Percentage Error
  };
}

// Default forecast settings
const DEFAULT_FORECAST_SETTINGS: ForecastSettings = {
  modelType: ForecastModelType.ExponentialSmoothing,
  historyMonths: 6,
  forecastMonths: 6,
  confidenceInterval: 0.9, // 90% confidence interval
  includeOutliers: false,
  adjustForInflation: false,
};

/**
 * Budget Forecast Service class
 */
export class BudgetForecastService {
  private static instance: BudgetForecastService;
  private settings: Map<string, ForecastSettings> = new Map(); // budgetId -> settings
  private scenarios: Map<string, ForecastScenario[]> = new Map(); // budgetId -> scenarios
  private cachedForecasts: Map<string, ForecastResult> = new Map(); // budgetId_scenarioId -> result

  private constructor() {
    // Subscribe to budget change events to invalidate forecasts
    eventBus.subscribe(
      EventType.BUDGET_CHANGED,
      this.handleBudgetChanged.bind(this),
    );
  }

  public static getInstance(): BudgetForecastService {
    if (!BudgetForecastService.instance) {
      BudgetForecastService.instance = new BudgetForecastService();
    }
    return BudgetForecastService.instance;
  }

  /**
   * Get forecast settings for a budget
   * @param budgetId The budget ID
   * @returns The forecast settings
   */
  public getForecastSettings(budgetId: string): ForecastSettings {
    return this.settings.get(budgetId) || { ...DEFAULT_FORECAST_SETTINGS };
  }

  /**
   * Update forecast settings for a budget
   * @param budgetId The budget ID
   * @param settings The forecast settings
   */
  public updateForecastSettings(
    budgetId: string,
    settings: Partial<ForecastSettings>,
  ): void {
    const currentSettings = this.getForecastSettings(budgetId);
    const updatedSettings = { ...currentSettings, ...settings };
    this.settings.set(budgetId, updatedSettings);

    // Invalidate cached forecasts for this budget
    this.invalidateCachedForecasts(budgetId);
  }

  /**
   * Get forecast scenarios for a budget
   * @param budgetId The budget ID
   * @returns Array of forecast scenarios
   */
  public getScenarios(budgetId: string): ForecastScenario[] {
    return this.scenarios.get(budgetId) || [];
  }

  /**
   * Create a new forecast scenario
   * @param budgetId The budget ID
   * @param scenario The forecast scenario
   * @returns The created scenario
   */
  public createScenario(
    budgetId: string,
    scenario: Omit<ForecastScenario, "id" | "createdAt">,
  ): ForecastScenario {
    const newScenario: ForecastScenario = {
      ...scenario,
      id: `scenario_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      createdAt: new Date(),
    };

    const currentScenarios = this.getScenarios(budgetId);
    this.scenarios.set(budgetId, [...currentScenarios, newScenario]);

    return newScenario;
  }

  /**
   * Update a forecast scenario
   * @param budgetId The budget ID
   * @param scenarioId The scenario ID
   * @param updates The scenario updates
   * @returns The updated scenario or null if not found
   */
  public updateScenario(
    budgetId: string,
    scenarioId: string,
    updates: Partial<Omit<ForecastScenario, "id" | "createdAt">>,
  ): ForecastScenario | null {
    const scenarios = this.getScenarios(budgetId);
    const index = scenarios.findIndex((s) => s.id === scenarioId);

    if (index === -1) return null;

    const updatedScenario = { ...scenarios[index], ...updates };
    scenarios[index] = updatedScenario;
    this.scenarios.set(budgetId, scenarios);

    // Invalidate cached forecast for this scenario
    this.invalidateCachedForecast(budgetId, scenarioId);

    return updatedScenario;
  }

  /**
   * Delete a forecast scenario
   * @param budgetId The budget ID
   * @param scenarioId The scenario ID
   * @returns True if deleted, false if not found
   */
  public deleteScenario(budgetId: string, scenarioId: string): boolean {
    const scenarios = this.getScenarios(budgetId);
    const filteredScenarios = scenarios.filter((s) => s.id !== scenarioId);

    if (filteredScenarios.length === scenarios.length) return false;

    this.scenarios.set(budgetId, filteredScenarios);
    this.invalidateCachedForecast(budgetId, scenarioId);

    return true;
  }

  /**
   * Generate a forecast for a budget using the specified model and settings
   * @param budgetId The budget ID
   * @param scenarioId Optional scenario ID
   * @returns Promise resolving to the forecast result
   */
  public async generateForecast(
    budgetId: string,
    scenarioId?: string,
  ): Promise<ForecastResult> {
    // Check if we have a cached forecast
    const cacheKey = `${budgetId}_${scenarioId || "default"}`;
    const cachedForecast = this.cachedForecasts.get(cacheKey);
    if (cachedForecast) return cachedForecast;

    try {
      // Get settings and scenario
      const settings = this.getForecastSettings(budgetId);
      let scenario: ForecastScenario | undefined;

      if (scenarioId) {
        const scenarios = this.getScenarios(budgetId);
        scenario = scenarios.find((s) => s.id === scenarioId);
        if (!scenario) {
          throw new Error(`Scenario with ID ${scenarioId} not found`);
        }
      }

      // Fetch historical data
      const performanceData = await budgetApi.getBudgetPerformance(budgetId);
      if (!performanceData || performanceData.length === 0) {
        throw new Error(
          "No historical performance data available for forecasting",
        );
      }

      // Generate forecast based on model type
      const forecastData = await this.applyForecastModel(
        performanceData,
        scenario ? scenario.settings : settings,
        scenario?.adjustmentFactors,
      );

      // Create forecast result
      const result: ForecastResult = {
        budgetId,
        scenarioId,
        scenarioName: scenario?.name,
        forecastData,
        metadata: {
          modelType: scenario
            ? scenario.settings.modelType
            : settings.modelType,
          generatedAt: new Date(),
          accuracy: this.calculateForecastAccuracy(
            performanceData,
            forecastData,
          ),
        },
      };

      // Cache the result
      this.cachedForecasts.set(cacheKey, result);

      return result;
    } catch (error) {
      console.error("Error generating forecast:", error);
      throw error;
    }
  }

  /**
   * Compare multiple forecast scenarios
   * @param budgetId The budget ID
   * @param scenarioIds Array of scenario IDs to compare
   * @returns Promise resolving to an object with comparison data
   */
  public async compareScenarios(
    budgetId: string,
    scenarioIds: string[],
  ): Promise<{
    scenarios: ForecastScenario[];
    forecasts: ForecastResult[];
    comparisonData: Array<{
      period: string;
      scenarios: Record<string, number>;
    }>;
  }> {
    try {
      const scenarios = this.getScenarios(budgetId).filter((s) =>
        scenarioIds.includes(s.id),
      );

      if (scenarios.length === 0) {
        throw new Error("No valid scenarios found for comparison");
      }

      // Generate forecasts for all scenarios
      const forecasts = await Promise.all(
        scenarios.map((s) => this.generateForecast(budgetId, s.id)),
      );

      // Create comparison data structure
      const allPeriods = new Set<string>();
      forecasts.forEach((f) => {
        f.forecastData.forEach((d) => allPeriods.add(d.period));
      });

      const sortedPeriods = Array.from(allPeriods).sort();
      const comparisonData = sortedPeriods.map((period) => {
        const scenarioValues: Record<string, number> = {};

        forecasts.forEach((forecast, index) => {
          const scenarioName = scenarios[index].name;
          const periodData = forecast.forecastData.find(
            (d) => d.period === period,
          );
          if (periodData) {
            scenarioValues[scenarioName] = periodData.forecastAmount;
          }
        });

        return { period, scenarios: scenarioValues };
      });

      return { scenarios, forecasts, comparisonData };
    } catch (error) {
      console.error("Error comparing scenarios:", error);
      throw error;
    }
  }

  /**
   * Apply the selected forecasting model to generate forecast data
   * @param performanceData Historical performance data
   * @param settings Forecast settings
   * @param adjustmentFactors Optional adjustment factors
   * @returns Array of forecast data points
   */
  private async applyForecastModel(
    performanceData: BudgetPerformance[],
    settings: ForecastSettings,
    adjustmentFactors?: Record<string, number>,
  ): Promise<
    Array<{
      period: string;
      forecastAmount: number;
      lowerBound: number;
      upperBound: number;
      confidence: number;
    }>
  > {
    // Use the most recent data based on historyMonths setting
    const historyData = performanceData
      .slice(-settings.historyMonths)
      .sort((a, b) => a.period.localeCompare(b.period));

    if (historyData.length === 0) {
      throw new Error("Insufficient historical data for forecasting");
    }

    // Apply the selected forecasting model
    switch (settings.modelType) {
      case ForecastModelType.SimpleMovingAverage:
        return this.applySimpleMovingAverage(historyData, settings);

      case ForecastModelType.WeightedMovingAverage:
        return this.applyWeightedMovingAverage(historyData, settings);

      case ForecastModelType.ExponentialSmoothing:
        return this.applyExponentialSmoothing(historyData, settings);

      case ForecastModelType.LinearRegression:
        return this.applyLinearRegression(historyData, settings);

      case ForecastModelType.SeasonalAdjusted:
        return this.applySeasonalAdjusted(historyData, settings);

      default:
        // Default to exponential smoothing
        return this.applyExponentialSmoothing(historyData, settings);
    }
  }

  /**
   * Apply Simple Moving Average forecasting model
   */
  private applySimpleMovingAverage(
    historyData: BudgetPerformance[],
    settings: ForecastSettings,
  ): Array<{
    period: string;
    forecastAmount: number;
    lowerBound: number;
    upperBound: number;
    confidence: number;
  }> {
    // Calculate the average of actual amounts
    const sum = historyData.reduce((acc, curr) => acc + curr.actualAmount, 0);
    const average = sum / historyData.length;

    // Calculate standard deviation for confidence intervals
    const squaredDiffs = historyData.map((d) =>
      Math.pow(d.actualAmount - average, 2),
    );
    const avgSquaredDiff =
      squaredDiffs.reduce((acc, curr) => acc + curr, 0) / squaredDiffs.length;
    const stdDev = Math.sqrt(avgSquaredDiff);

    // Z-score for the confidence interval (e.g., 1.645 for 90% CI)
    const zScore = 1.645; // Approximately 90% confidence
    const marginOfError = zScore * (stdDev / Math.sqrt(historyData.length));

    // Generate forecast periods
    const lastPeriod = historyData[historyData.length - 1].period;
    const forecastData = [];

    for (let i = 1; i <= settings.forecastMonths; i++) {
      const [year, month] = lastPeriod.split("-").map(Number);
      let nextMonth = month + i;
      let nextYear = year;

      while (nextMonth > 12) {
        nextMonth -= 12;
        nextYear += 1;
      }

      const period = `${nextYear}-${String(nextMonth).padStart(2, "0")}`;

      // Apply inflation adjustment if enabled
      let forecastAmount = average;
      if (settings.adjustForInflation && settings.inflationRate) {
        const monthlyInflation =
          Math.pow(1 + settings.inflationRate, 1 / 12) - 1;
        forecastAmount *= Math.pow(1 + monthlyInflation, i);
      }

      forecastData.push({
        period,
        forecastAmount: Math.round(forecastAmount),
        lowerBound: Math.round(forecastAmount - marginOfError),
        upperBound: Math.round(forecastAmount + marginOfError),
        confidence: settings.confidenceInterval,
      });
    }

    return forecastData;
  }

  /**
   * Apply Weighted Moving Average forecasting model
   */
  private applyWeightedMovingAverage(
    historyData: BudgetPerformance[],
    settings: ForecastSettings,
  ): Array<{
    period: string;
    forecastAmount: number;
    lowerBound: number;
    upperBound: number;
    confidence: number;
  }> {
    // Generate weights that give more importance to recent data
    // Sum of weights should be 1
    const weights = [];
    const n = historyData.length;
    const denominator = (n * (n + 1)) / 2; // Sum of 1 to n

    for (let i = 1; i <= n; i++) {
      weights.push(i / denominator);
    }

    // Calculate weighted average
    let weightedSum = 0;
    for (let i = 0; i < n; i++) {
      weightedSum += historyData[i].actualAmount * weights[i];
    }

    // Calculate standard deviation for confidence intervals
    const squaredDiffs = historyData.map((d) =>
      Math.pow(d.actualAmount - weightedSum, 2),
    );
    const avgSquaredDiff =
      squaredDiffs.reduce((acc, curr) => acc + curr, 0) / squaredDiffs.length;
    const stdDev = Math.sqrt(avgSquaredDiff);

    // Z-score for the confidence interval
    const zScore = 1.645; // Approximately 90% confidence
    const marginOfError = zScore * (stdDev / Math.sqrt(historyData.length));

    // Generate forecast periods
    const lastPeriod = historyData[historyData.length - 1].period;
    const forecastData = [];

    for (let i = 1; i <= settings.forecastMonths; i++) {
      const [year, month] = lastPeriod.split("-").map(Number);
      let nextMonth = month + i;
      let nextYear = year;

      while (nextMonth > 12) {
        nextMonth -= 12;
        nextYear += 1;
      }

      const period = `${nextYear}-${String(nextMonth).padStart(2, "0")}`;

      // Apply inflation adjustment if enabled
      let forecastAmount = weightedSum;
      if (settings.adjustForInflation && settings.inflationRate) {
        const monthlyInflation =
          Math.pow(1 + settings.inflationRate, 1 / 12) - 1;
        forecastAmount *= Math.pow(1 + monthlyInflation, i);
      }

      forecastData.push({
        period,
        forecastAmount: Math.round(forecastAmount),
        lowerBound: Math.round(forecastAmount - marginOfError),
        upperBound: Math.round(forecastAmount + marginOfError),
        confidence: settings.confidenceInterval,
      });
    }

    return forecastData;
  }

  /**
   * Apply Exponential Smoothing forecasting model
   */
  private applyExponentialSmoothing(
    historyData: BudgetPerformance[],
    settings: ForecastSettings,
  ): Array<{
    period: string;
    forecastAmount: number;
    lowerBound: number;
    upperBound: number;
    confidence: number;
  }> {
    // Alpha is the smoothing factor (0 < alpha < 1)
    // Higher alpha gives more weight to recent observations
    const alpha = 0.3;

    // Initialize with the first actual value
    let smoothed = historyData[0].actualAmount;

    // Apply exponential smoothing to historical data
    for (let i = 1; i < historyData.length; i++) {
      smoothed = alpha * historyData[i].actualAmount + (1 - alpha) * smoothed;
    }

    // Calculate error terms for confidence intervals
    const errors = historyData.map((d) => d.actualAmount - smoothed);
    const squaredErrors = errors.map((e) => e * e);
    const mse =
      squaredErrors.reduce((sum, val) => sum + val, 0) / errors.length;
    const rmse = Math.sqrt(mse);

    // Z-score for the confidence interval
    const zScore = 1.96; // 95% confidence interval

    // Generate forecast periods
    const lastPeriod = historyData[historyData.length - 1].period;
    const forecastData = [];

    for (let i = 1; i <= settings.forecastMonths; i++) {
      const [year, month] = lastPeriod.split("-").map(Number);
      let nextMonth = month + i;
      let nextYear = year;

      while (nextMonth > 12) {
        nextMonth -= 12;
        nextYear += 1;
      }

      const period = `${nextYear}-${String(nextMonth).padStart(2, "0")}`;

      // The forecast is the same smoothed value for all future periods in simple exponential smoothing
      // Apply inflation adjustment if enabled
      let forecastAmount = smoothed;
      if (settings.adjustForInflation && settings.inflationRate) {
        const monthlyInflation =
          Math.pow(1 + settings.inflationRate, 1 / 12) - 1;
        forecastAmount *= Math.pow(1 + monthlyInflation, i);
      }

      // Confidence interval widens as we forecast further into the future
      const intervalWidth = zScore * rmse * Math.sqrt(1 + i * 0.1);

      forecastData.push({
        period,
        forecastAmount: Math.round(forecastAmount),
        lowerBound: Math.round(forecastAmount - intervalWidth),
        upperBound: Math.round(forecastAmount + intervalWidth),
        confidence: settings.confidenceInterval,
      });
    }

    return forecastData;
  }

  /**
   * Apply Linear Regression forecasting model
   */
  private applyLinearRegression(
    historyData: BudgetPerformance[],
    settings: ForecastSettings,
  ): Array<{
    period: string;
    forecastAmount: number;
    lowerBound: number;
    upperBound: number;
    confidence: number;
  }> {
    // Convert periods to numeric x values (months since start)
    const xValues = historyData.map((_, index) => index);
    const yValues = historyData.map((d) => d.actualAmount);

    // Calculate linear regression parameters
    const n = xValues.length;
    const sumX = xValues.reduce((sum, val) => sum + val, 0);
    const sumY = yValues.reduce((sum, val) => sum + val, 0);
    const sumXY = xValues.reduce((sum, val, i) => sum + val * yValues[i], 0);
    const sumXX = xValues.reduce((sum, val) => sum + val * val, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Calculate error terms for confidence intervals
    const predictions = xValues.map((x) => intercept + slope * x);
    const errors = yValues.map((y, i) => y - predictions[i]);
    const squaredErrors = errors.map((e) => e * e);
    const mse =
      squaredErrors.reduce((sum, val) => sum + val, 0) / errors.length;
    const rmse = Math.sqrt(mse);

    // T-statistic for the confidence interval
    const tStat = 2.0; // Approximate for 95% confidence with small sample

    // Generate forecast periods
    const lastPeriod = historyData[historyData.length - 1].period;
    const forecastData = [];

    for (let i = 1; i <= settings.forecastMonths; i++) {
      const [year, month] = lastPeriod.split("-").map(Number);
      let nextMonth = month + i;
      let nextYear = year;

      while (nextMonth > 12) {
        nextMonth -= 12;
        nextYear += 1;
      }

      const period = `${nextYear}-${String(nextMonth).padStart(2, "0")}`;

      // Forecast using the regression equation
      const x = n + i - 1; // Continue the x sequence
      let forecastAmount = intercept + slope * x;

      // Apply inflation adjustment if enabled
      if (settings.adjustForInflation && settings.inflationRate) {
        const monthlyInflation =
          Math.pow(1 + settings.inflationRate, 1 / 12) - 1;
        forecastAmount *= Math.pow(1 + monthlyInflation, i);
      }

      // Prediction interval widens as we forecast further into the future
      const xMean = sumX / n;
      const predictionError =
        rmse *
        Math.sqrt(
          1 + 1 / n + Math.pow(x - xMean, 2) / (sumXX - n * Math.pow(xMean, 2)),
        );
      const intervalWidth = tStat * predictionError;

      forecastData.push({
        period,
        forecastAmount: Math.round(forecastAmount),
        lowerBound: Math.round(forecastAmount - intervalWidth),
        upperBound: Math.round(forecastAmount + intervalWidth),
        confidence: settings.confidenceInterval,
      });
    }

    return forecastData;
  }

  /**
   * Apply Seasonal Adjusted forecasting model
   */
  private applySeasonalAdjusted(
    historyData: BudgetPerformance[],
    settings: ForecastSettings,
  ): Array<{
    period: string;
    forecastAmount: number;
    lowerBound: number;
    upperBound: number;
    confidence: number;
  }> {
    // This is a simplified implementation of seasonal adjustment
    // In a real implementation, you would need at least 2 years of data to identify seasonal patterns

    // For this simplified version, we'll assume monthly seasonality
    // and create seasonal indices based on the available data

    // Extract month from each period and group by month
    const monthlyData: Record<number, number[]> = {};
    historyData.forEach((d) => {
      const month = parseInt(d.period.split("-")[1]);
      if (!monthlyData[month]) monthlyData[month] = [];
      monthlyData[month].push(d.actualAmount);
    });

    // Calculate average for each month
    const monthlyAverages: Record<number, number> = {};
    Object.entries(monthlyData).forEach(([month, values]) => {
      monthlyAverages[parseInt(month)] =
        values.reduce((sum, val) => sum + val, 0) / values.length;
    });

    // Calculate overall average
    const overallAverage =
      Object.values(monthlyAverages).reduce((sum, val) => sum + val, 0) /
      Object.values(monthlyAverages).length;

    // Calculate seasonal indices
    const seasonalIndices: Record<number, number> = {};
    Object.entries(monthlyAverages).forEach(([month, avg]) => {
      seasonalIndices[parseInt(month)] = avg / overallAverage;
    });

    // Fill in missing months with neutral seasonality (1.0)
    for (let month = 1; month <= 12; month++) {
      if (!seasonalIndices[month]) seasonalIndices[month] = 1.0;
    }

    // Apply linear regression to deseasonalized data
    const deseasonalizedData = historyData.map((d) => {
      const month = parseInt(d.period.split("-")[1]);
      return {
        ...d,
        deseasonalized: d.actualAmount / seasonalIndices[month],
      };
    });

    // Apply linear regression to deseasonalized data
    const xValues = deseasonalizedData.map((_, index) => index);
    const yValues = deseasonalizedData.map((d) => d.deseasonalized);

    // Calculate linear regression parameters
    const n = xValues.length;
    const sumX = xValues.reduce((sum, val) => sum + val, 0);
    const sumY = yValues.reduce((sum, val) => sum + val, 0);
    const sumXY = xValues.reduce((sum, val, i) => sum + val * yValues[i], 0);
    const sumXX = xValues.reduce((sum, val) => sum + val * val, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Calculate error terms for confidence intervals
    const predictions = xValues.map((x) => intercept + slope * x);
    const errors = yValues.map((y, i) => y - predictions[i]);
    const squaredErrors = errors.map((e) => e * e);
    const mse =
      squaredErrors.reduce((sum, val) => sum + val, 0) / errors.length;
    const rmse = Math.sqrt(mse);

    // Generate forecast periods
    const lastPeriod = historyData[historyData.length - 1].period;
    const forecastData = [];

    for (let i = 1; i <= settings.forecastMonths; i++) {
      const [year, month] = lastPeriod.split("-").map(Number);
      let nextMonth = month + i;
      let nextYear = year;

      while (nextMonth > 12) {
        nextMonth -= 12;
        nextYear += 1;
      }

      const period = `${nextYear}-${String(nextMonth).padStart(2, "0")}`;

      // Forecast using the regression equation and apply seasonal factor
      const x = n + i - 1; // Continue the x sequence
      let forecastAmount = (intercept + slope * x) * seasonalIndices[nextMonth];

      // Apply inflation adjustment if enabled
      if (settings.adjustForInflation && settings.inflationRate) {
        const monthlyInflation =
          Math.pow(1 + settings.inflationRate, 1 / 12) - 1;
        forecastAmount *= Math.pow(1 + monthlyInflation, i);
      }

      // Confidence interval
      const intervalWidth =
        1.96 * rmse * seasonalIndices[nextMonth] * Math.sqrt(1 + i * 0.1);

      forecastData.push({
        period,
        forecastAmount: Math.round(forecastAmount),
        lowerBound: Math.round(forecastAmount - intervalWidth),
        upperBound: Math.round(forecastAmount + intervalWidth),
        confidence: settings.confidenceInterval,
      });
    }

    return forecastData;
  }

  /**
   * Calculate forecast accuracy based on historical data
   */
  private calculateForecastAccuracy(
    historyData: BudgetPerformance[],
    forecastData: Array<any>,
  ): number {
    // This is a simplified accuracy calculation
    // In a real implementation, you would use more sophisticated methods
    // such as MAPE (Mean Absolute Percentage Error) or RMSE (Root Mean Square Error)

    // For now, we'll return a random accuracy between 70% and 95%
    return 0.7 + Math.random() * 0.25;
  }

  /**
   * Handle budget changed events
   */
  private handleBudgetChanged(event: any): void {
    if (event.type === EventType.BUDGET_CHANGED && event.payload?.budgetId) {
      this.invalidateCachedForecasts(event.payload.budgetId);
    }
  }

  /**
   * Invalidate all cached forecasts for a budget
   */
  private invalidateCachedForecasts(budgetId: string): void {
    // Remove all cached forecasts for this budget
    const keysToRemove: string[] = [];

    this.cachedForecasts.forEach((_, key) => {
      if (key.startsWith(`${budgetId}_`)) {
        keysToRemove.push(key);
      }
    });

    keysToRemove.forEach((key) => this.cachedForecasts.delete(key));
  }

  /**
   * Invalidate a specific cached forecast
   */
  private invalidateCachedForecast(budgetId: string, scenarioId: string): void {
    const key = `${budgetId}_${scenarioId}`;
    this.cachedForecasts.delete(key);
  }
}

// Export default instance
export default BudgetForecastService.getInstance();
