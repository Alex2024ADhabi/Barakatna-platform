import React from "react";
import {
  AlertTriangle,
  WifiOff,
  RefreshCw,
  HelpCircle,
  BookOpen,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslation } from "react-i18next";

interface OfflineHelpProps {
  onRetryConnection?: () => void;
  showTroubleshooting?: boolean;
}

const OfflineHelp: React.FC<OfflineHelpProps> = ({
  onRetryConnection = () => {},
  showTroubleshooting = true,
}) => {
  const { t } = useTranslation();

  return (
    <div className="p-4 max-w-md mx-auto">
      <Card className="p-6 bg-white dark:bg-gray-800 shadow-lg">
        <div className="flex items-center justify-center mb-4">
          <div className="bg-amber-100 dark:bg-amber-900 p-3 rounded-full">
            <WifiOff className="h-8 w-8 text-amber-600 dark:text-amber-400" />
          </div>
        </div>

        <h2 className="text-xl font-bold text-center mb-4">
          {t("offline.title", "You are offline")}
        </h2>

        <p className="text-gray-600 dark:text-gray-300 mb-6 text-center">
          {t(
            "offline.description",
            "Don't worry, you can still use most features of the app in offline mode.",
          )}
        </p>

        <div className="space-y-4">
          <div className="flex items-start">
            <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full mr-3">
              <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-medium">
                {t("offline.availableFeatures", "Available Offline")}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t(
                  "offline.featuresDescription",
                  "Room assessments, form filling, and photo capture are available offline.",
                )}
              </p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="bg-purple-100 dark:bg-purple-900 p-2 rounded-full mr-3">
              <RefreshCw className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="font-medium">
                {t("offline.syncLater", "Sync Later")}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t(
                  "offline.syncDescription",
                  "Your changes will be saved locally and synced when you reconnect.",
                )}
              </p>
            </div>
          </div>

          {showTroubleshooting && (
            <div className="flex items-start">
              <div className="bg-red-100 dark:bg-red-900 p-2 rounded-full mr-3">
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="font-medium">
                  {t("offline.limitations", "Limitations")}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t(
                    "offline.limitationsDescription",
                    "Some features like committee approvals and real-time notifications require an internet connection.",
                  )}
                </p>
              </div>
            </div>
          )}

          <div className="flex items-start">
            <div className="bg-green-100 dark:bg-green-900 p-2 rounded-full mr-3">
              <HelpCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="font-medium">{t("offline.tips", "Tips")}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t(
                  "offline.tipsDescription",
                  "Complete your work offline and sync when you have a stable connection.",
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-col space-y-3">
          <Button
            onClick={onRetryConnection}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            {t("offline.checkConnection", "Check Connection")}
          </Button>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => window.location.reload()}
          >
            {t("offline.reload", "Reload App")}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default OfflineHelp;
