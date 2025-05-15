import React, { useState, useEffect } from "react";
import { Wifi, WifiOff, Settings, Image, FileText } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { useTranslation } from "react-i18next";

interface LowBandwidthModeProps {
  initialEnabled?: boolean;
  onSettingsChange?: (settings: LowBandwidthSettings) => void;
}

export interface LowBandwidthSettings {
  enabled: boolean;
  imageQuality: number;
  disableAnimations: boolean;
  textOnlyMode: boolean;
  disableBackgroundSync: boolean;
}

const LowBandwidthMode: React.FC<LowBandwidthModeProps> = ({
  initialEnabled = false,
  onSettingsChange = () => {},
}) => {
  const { t } = useTranslation();
  const [settings, setSettings] = useState<LowBandwidthSettings>({
    enabled: initialEnabled,
    imageQuality: 50,
    disableAnimations: true,
    textOnlyMode: false,
    disableBackgroundSync: false,
  });

  // Apply CSS changes when low bandwidth mode is enabled/disabled
  useEffect(() => {
    if (settings.enabled) {
      document.documentElement.classList.add("low-bandwidth-mode");
      if (settings.disableAnimations) {
        document.documentElement.classList.add("disable-animations");
      }
      if (settings.textOnlyMode) {
        document.documentElement.classList.add("text-only-mode");
      }
    } else {
      document.documentElement.classList.remove(
        "low-bandwidth-mode",
        "disable-animations",
        "text-only-mode",
      );
    }
  }, [settings.enabled, settings.disableAnimations, settings.textOnlyMode]);

  // Notify parent component when settings change
  useEffect(() => {
    onSettingsChange(settings);
  }, [settings, onSettingsChange]);

  const updateSettings = (newSettings: Partial<LowBandwidthSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      return updated;
    });
  };

  const estimatedDataSaving = () => {
    let saving = 0;
    if (settings.enabled) {
      saving += 20; // Base saving
      saving += (100 - settings.imageQuality) * 0.3;
      if (settings.disableAnimations) saving += 10;
      if (settings.textOnlyMode) saving += 40;
      if (settings.disableBackgroundSync) saving += 15;
    }
    return Math.min(saving, 95); // Cap at 95%
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <Card className="p-6 bg-white dark:bg-gray-800 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div
              className={`p-2 rounded-full mr-3 ${settings.enabled ? "bg-green-100 dark:bg-green-900" : "bg-gray-100 dark:bg-gray-700"}`}
            >
              {settings.enabled ? (
                <Wifi className="h-6 w-6 text-green-600 dark:text-green-400" />
              ) : (
                <WifiOff className="h-6 w-6 text-gray-500 dark:text-gray-400" />
              )}
            </div>
            <div>
              <h2 className="text-lg font-bold">
                {t("lowBandwidth.title", "Low Bandwidth Mode")}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t(
                  "lowBandwidth.description",
                  "Optimize app performance for slow connections",
                )}
              </p>
            </div>
          </div>
          <Switch
            checked={settings.enabled}
            onCheckedChange={(checked) => updateSettings({ enabled: checked })}
          />
        </div>

        <div
          className={`space-y-6 ${!settings.enabled ? "opacity-50 pointer-events-none" : ""}`}
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <Image className="h-5 w-5 mr-2 text-blue-500" />
                <span className="font-medium">
                  {t("lowBandwidth.imageQuality", "Image Quality")}
                </span>
              </div>
              <span className="text-sm font-medium">
                {settings.imageQuality}%
              </span>
            </div>
            <Slider
              value={[settings.imageQuality]}
              min={10}
              max={100}
              step={10}
              onValueChange={(value) =>
                updateSettings({ imageQuality: value[0] })
              }
              className="my-2"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {t(
                "lowBandwidth.imageQualityDescription",
                "Lower quality uses less data but images may appear blurry",
              )}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Settings className="h-5 w-5 mr-2 text-purple-500" />
              <span className="font-medium">
                {t("lowBandwidth.disableAnimations", "Disable Animations")}
              </span>
            </div>
            <Switch
              checked={settings.disableAnimations}
              onCheckedChange={(checked) =>
                updateSettings({ disableAnimations: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FileText className="h-5 w-5 mr-2 text-amber-500" />
              <span className="font-medium">
                {t("lowBandwidth.textOnlyMode", "Text-Only Mode")}
              </span>
            </div>
            <Switch
              checked={settings.textOnlyMode}
              onCheckedChange={(checked) =>
                updateSettings({ textOnlyMode: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <WifiOff className="h-5 w-5 mr-2 text-red-500" />
              <span className="font-medium">
                {t(
                  "lowBandwidth.disableBackgroundSync",
                  "Disable Background Sync",
                )}
              </span>
            </div>
            <Switch
              checked={settings.disableBackgroundSync}
              onCheckedChange={(checked) =>
                updateSettings({ disableBackgroundSync: checked })
              }
            />
          </div>

          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-medium text-blue-700 dark:text-blue-300">
                {t("lowBandwidth.estimatedDataSaving", "Estimated Data Saving")}
                :
              </span>
              <span className="font-bold text-blue-700 dark:text-blue-300">
                {estimatedDataSaving()}%
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full mt-4"
            onClick={() =>
              updateSettings({
                imageQuality: 30,
                disableAnimations: true,
                textOnlyMode: true,
                disableBackgroundSync: true,
              })
            }
          >
            {t("lowBandwidth.extremeSavingMode", "Extreme Saving Mode")}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default LowBandwidthMode;
