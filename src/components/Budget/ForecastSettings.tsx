import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useTranslation } from "react-i18next";
import { useTranslatedDirection } from "@/hooks/useTranslatedDirection";

interface ForecastSettingsProps {
  budgetId: string;
  onSave: () => void;
  onCancel: () => void;
}

const ForecastSettings = ({
  budgetId,
  onSave,
  onCancel,
}: ForecastSettingsProps) => {
  const { t } = useTranslation();
  const dir = useTranslatedDirection();

  // Default settings
  const [forecastMethod, setForecastMethod] = useState("movingAverage");
  const [forecastPeriod, setForecastPeriod] = useState("6");
  const [confidenceInterval, setConfidenceInterval] = useState(10);
  const [includeSeasonality, setIncludeSeasonality] = useState(true);
  const [historicalPeriods, setHistoricalPeriods] = useState("12");
  const [weightRecentData, setWeightRecentData] = useState(true);
  const [adjustForInflation, setAdjustForInflation] = useState(false);
  const [inflationRate, setInflationRate] = useState("2.5");

  const handleSave = () => {
    // In a real implementation, this would save the settings to the backend
    // For now, we just call the onSave callback
    onSave();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("budget.forecastSettings")}</CardTitle>
        <CardDescription>
          {t("budget.forecastSettingsDescription")}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="forecastMethod">{t("budget.forecastMethod")}</Label>
            <Select value={forecastMethod} onValueChange={setForecastMethod}>
              <SelectTrigger id="forecastMethod">
                <SelectValue placeholder={t("budget.selectMethod")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="movingAverage">
                  {t("budget.movingAverage")}
                </SelectItem>
                <SelectItem value="exponentialSmoothing">
                  {t("budget.exponentialSmoothing")}
                </SelectItem>
                <SelectItem value="linearRegression">
                  {t("budget.linearRegression")}
                </SelectItem>
                <SelectItem value="arima">{t("budget.arima")}</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              {t("budget.forecastMethodDescription")}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="forecastPeriod">{t("budget.forecastPeriod")}</Label>
            <Select value={forecastPeriod} onValueChange={setForecastPeriod}>
              <SelectTrigger id="forecastPeriod">
                <SelectValue placeholder={t("budget.selectPeriod")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">{t("budget.threeMonths")}</SelectItem>
                <SelectItem value="6">{t("budget.sixMonths")}</SelectItem>
                <SelectItem value="12">{t("budget.oneYear")}</SelectItem>
                <SelectItem value="24">{t("budget.twoYears")}</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              {t("budget.forecastPeriodDescription")}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="historicalPeriods">
              {t("budget.historicalPeriods")}
            </Label>
            <Select
              value={historicalPeriods}
              onValueChange={setHistoricalPeriods}
            >
              <SelectTrigger id="historicalPeriods">
                <SelectValue
                  placeholder={t("budget.selectHistoricalPeriods")}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="6">{t("budget.sixMonths")}</SelectItem>
                <SelectItem value="12">{t("budget.oneYear")}</SelectItem>
                <SelectItem value="24">{t("budget.twoYears")}</SelectItem>
                <SelectItem value="36">{t("budget.threeYears")}</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              {t("budget.historicalPeriodsDescription")}
            </p>
          </div>

          <div className="space-y-2">
            <Label>{t("budget.confidenceInterval")}</Label>
            <div className="pt-2">
              <Slider
                defaultValue={[confidenceInterval]}
                max={30}
                step={5}
                onValueChange={(value) => setConfidenceInterval(value[0])}
              />
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">5%</span>
              <span className="text-sm font-medium">{confidenceInterval}%</span>
              <span className="text-sm text-muted-foreground">30%</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {t("budget.confidenceIntervalDescription")}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">
            {t("budget.advancedSettings")}
          </h3>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{t("budget.includeSeasonality")}</Label>
                <p className="text-sm text-muted-foreground">
                  {t("budget.includeSeasonalityDescription")}
                </p>
              </div>
              <Switch
                checked={includeSeasonality}
                onCheckedChange={setIncludeSeasonality}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{t("budget.weightRecentData")}</Label>
                <p className="text-sm text-muted-foreground">
                  {t("budget.weightRecentDataDescription")}
                </p>
              </div>
              <Switch
                checked={weightRecentData}
                onCheckedChange={setWeightRecentData}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>{t("budget.adjustForInflation")}</Label>
                <p className="text-sm text-muted-foreground">
                  {t("budget.adjustForInflationDescription")}
                </p>
              </div>
              <Switch
                checked={adjustForInflation}
                onCheckedChange={setAdjustForInflation}
              />
            </div>

            {adjustForInflation && (
              <div className="space-y-2">
                <Label htmlFor="inflationRate">
                  {t("budget.inflationRate")}
                </Label>
                <div className="flex items-center">
                  <Input
                    id="inflationRate"
                    type="number"
                    value={inflationRate}
                    onChange={(e) => setInflationRate(e.target.value)}
                    className="w-20"
                  />
                  <span className="ml-2">%</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {t("budget.inflationRateDescription")}
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onCancel}>
          {t("common.cancel")}
        </Button>
        <Button onClick={handleSave}>{t("common.save")}</Button>
      </CardFooter>
    </Card>
  );
};

export default ForecastSettings;
