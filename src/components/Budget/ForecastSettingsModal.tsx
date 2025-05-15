import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslation } from "react-i18next";
import { useTranslatedDirection } from "@/hooks/useTranslatedDirection";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  ForecastModelType,
  ForecastSettings,
} from "@/lib/services/budgetForecastService";

interface ForecastSettingsModalProps {
  open: boolean;
  onClose: () => void;
  settings: ForecastSettings;
  onSave: (settings: ForecastSettings) => void;
}

const ForecastSettingsModal: React.FC<ForecastSettingsModalProps> = ({
  open,
  onClose,
  settings,
  onSave,
}) => {
  const { t } = useTranslation();
  const { directionClass } = useTranslatedDirection();
  const [localSettings, setLocalSettings] = useState<ForecastSettings>({
    ...settings,
  });

  const handleSave = () => {
    onSave(localSettings);
    onClose();
  };

  const handleChange = (field: keyof ForecastSettings, value: any) => {
    setLocalSettings((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className={`sm:max-w-[500px] ${directionClass}`}>
        <DialogHeader>
          <DialogTitle>{t("budget.forecastSettings")}</DialogTitle>
          <DialogDescription>
            {t("budget.forecastSettingsDescription")}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="modelType" className="text-right">
              {t("budget.forecastModel")}
            </Label>
            <Select
              value={localSettings.modelType}
              onValueChange={(value) => handleChange("modelType", value)}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder={t("budget.selectModel")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ForecastModelType.SimpleMovingAverage}>
                  {t("budget.simpleMovingAverage")}
                </SelectItem>
                <SelectItem value={ForecastModelType.WeightedMovingAverage}>
                  {t("budget.weightedMovingAverage")}
                </SelectItem>
                <SelectItem value={ForecastModelType.ExponentialSmoothing}>
                  {t("budget.exponentialSmoothing")}
                </SelectItem>
                <SelectItem value={ForecastModelType.LinearRegression}>
                  {t("budget.linearRegression")}
                </SelectItem>
                <SelectItem value={ForecastModelType.SeasonalAdjusted}>
                  {t("budget.seasonalAdjusted")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="historyMonths" className="text-right">
              {t("budget.historyMonths")}
            </Label>
            <Input
              id="historyMonths"
              type="number"
              min={1}
              max={24}
              value={localSettings.historyMonths}
              onChange={(e) =>
                handleChange("historyMonths", parseInt(e.target.value))
              }
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="forecastMonths" className="text-right">
              {t("budget.forecastMonths")}
            </Label>
            <Input
              id="forecastMonths"
              type="number"
              min={1}
              max={24}
              value={localSettings.forecastMonths}
              onChange={(e) =>
                handleChange("forecastMonths", parseInt(e.target.value))
              }
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="confidenceInterval" className="text-right">
              {t("budget.confidenceInterval")}
            </Label>
            <div className="col-span-3">
              <Slider
                id="confidenceInterval"
                min={0.5}
                max={0.99}
                step={0.01}
                value={[localSettings.confidenceInterval]}
                onValueChange={(value) =>
                  handleChange("confidenceInterval", value[0])
                }
              />
              <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                <span>50%</span>
                <span>
                  {Math.round(localSettings.confidenceInterval * 100)}%
                </span>
                <span>99%</span>
              </div>
            </div>
          </div>

          {localSettings.modelType === ForecastModelType.SeasonalAdjusted && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="seasonalityPattern" className="text-right">
                {t("budget.seasonalityPattern")}
              </Label>
              <Select
                value={localSettings.seasonalityPattern || "monthly"}
                onValueChange={(value) =>
                  handleChange("seasonalityPattern", value)
                }
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder={t("budget.selectPattern")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">{t("budget.monthly")}</SelectItem>
                  <SelectItem value="quarterly">
                    {t("budget.quarterly")}
                  </SelectItem>
                  <SelectItem value="annual">{t("budget.annual")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="includeOutliers" className="text-right">
              {t("budget.includeOutliers")}
            </Label>
            <div className="flex items-center space-x-2 col-span-3">
              <Switch
                id="includeOutliers"
                checked={localSettings.includeOutliers}
                onCheckedChange={(checked) =>
                  handleChange("includeOutliers", checked)
                }
              />
              <Label htmlFor="includeOutliers">
                {localSettings.includeOutliers
                  ? t("budget.includeOutliersYes")
                  : t("budget.includeOutliersNo")}
              </Label>
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="adjustForInflation" className="text-right">
              {t("budget.adjustForInflation")}
            </Label>
            <div className="flex items-center space-x-2 col-span-3">
              <Switch
                id="adjustForInflation"
                checked={localSettings.adjustForInflation}
                onCheckedChange={(checked) =>
                  handleChange("adjustForInflation", checked)
                }
              />
              <Label htmlFor="adjustForInflation">
                {localSettings.adjustForInflation
                  ? t("budget.adjustForInflationYes")
                  : t("budget.adjustForInflationNo")}
              </Label>
            </div>
          </div>

          {localSettings.adjustForInflation && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="inflationRate" className="text-right">
                {t("budget.inflationRate")}
              </Label>
              <div className="col-span-3 flex items-center gap-2">
                <Input
                  id="inflationRate"
                  type="number"
                  min={0}
                  max={0.5}
                  step={0.001}
                  value={localSettings.inflationRate || 0.03}
                  onChange={(e) =>
                    handleChange("inflationRate", parseFloat(e.target.value))
                  }
                />
                <span>%</span>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t("common.cancel")}
          </Button>
          <Button onClick={handleSave}>{t("common.save")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ForecastSettingsModal;
