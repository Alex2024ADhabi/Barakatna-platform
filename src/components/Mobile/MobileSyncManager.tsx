import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Spinner } from "../ui/spinner";
import { offlineService } from "../../services/offlineService";
import { syncQueueManager } from "../../services/SyncQueueManager";

export default function MobileSyncManager() {
  const [networkStatus, setNetworkStatus] = useState(offlineService.isOnline());
  const [syncing, setSyncing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [syncStats, setSyncStats] = useState({
    pending: 0,
    completed: 0,
    failed: 0,
    lastSync: null as Date | null,
  });
  const [storageInfo, setStorageInfo] = useState({
    usage: 0,
    quota: 0,
    percentage: 0,
  });

  useEffect(() => {
    // Set up network status listener
    const handleNetworkChange = () => {
      setNetworkStatus(offlineService.isOnline());
    };

    window.addEventListener("online", handleNetworkChange);
    window.addEventListener("offline", handleNetworkChange);

    // Load initial stats
    loadSyncStats();
    loadStorageInfo();

    // Set up event listeners for sync events
    const handleSyncStarted = () => {
      setSyncing(true);
      setSyncProgress(0);
    };

    const handleSyncCompleted = (event) => {
      setSyncing(false);
      setSyncProgress(100);
      loadSyncStats();
    };

    const handleRequestProcessed = () => {
      // Increment progress
      setSyncProgress((prev) => Math.min(prev + 5, 95));
    };

    // Subscribe to events
    document.addEventListener("SYNC_STARTED", handleSyncStarted);
    document.addEventListener("SYNC_COMPLETED", handleSyncCompleted);
    document.addEventListener(
      "OFFLINE_REQUEST_PROCESSED",
      handleRequestProcessed,
    );

    return () => {
      window.removeEventListener("online", handleNetworkChange);
      window.removeEventListener("offline", handleNetworkChange);
      document.removeEventListener("SYNC_STARTED", handleSyncStarted);
      document.removeEventListener("SYNC_COMPLETED", handleSyncCompleted);
      document.removeEventListener(
        "OFFLINE_REQUEST_PROCESSED",
        handleRequestProcessed,
      );
    };
  }, []);

  const loadSyncStats = async () => {
    try {
      // In a real implementation, you would get this from the sync queue
      // For now, we'll simulate it
      const pendingItems = await getPendingSyncItems();

      setSyncStats({
        pending: pendingItems.length,
        completed: localStorage.getItem("syncCompletedCount")
          ? parseInt(localStorage.getItem("syncCompletedCount") || "0")
          : 0,
        failed: localStorage.getItem("syncFailedCount")
          ? parseInt(localStorage.getItem("syncFailedCount") || "0")
          : 0,
        lastSync: localStorage.getItem("lastSyncTime")
          ? new Date(localStorage.getItem("lastSyncTime") || "")
          : null,
      });
    } catch (error) {
      console.error("Error loading sync stats:", error);
    }
  };

  const loadStorageInfo = async () => {
    try {
      const info = await offlineService.getStorageInfo();
      setStorageInfo(info);
    } catch (error) {
      console.error("Error loading storage info:", error);
    }
  };

  const getPendingSyncItems = async () => {
    // In a real implementation, you would get this from the sync queue
    // For now, we'll return an empty array
    return [];
  };

  const startSync = async (
    type: "auto" | "manual" | "partial" | "metadata",
  ) => {
    if (!networkStatus) {
      alert(
        "Cannot sync while offline. Please connect to the internet and try again.",
      );
      return;
    }

    setSyncing(true);
    setSyncProgress(0);

    try {
      // Different sync strategies based on type
      switch (type) {
        case "auto":
          // Auto sync - system decides what to sync based on priority
          await offlineService.startSync();
          break;

        case "manual":
          // Manual sync - force sync everything
          await offlineService.startSync();
          break;

        case "partial":
          // Partial sync - only sync high priority items
          // In a real implementation, you would filter by priority
          await offlineService.startSync();
          break;

        case "metadata":
          // Metadata sync - only sync metadata (no photos)
          // In a real implementation, you would filter by entity type
          await offlineService.startSync();
          break;
      }

      // Update stats
      localStorage.setItem("lastSyncTime", new Date().toISOString());
      const completedCount =
        parseInt(localStorage.getItem("syncCompletedCount") || "0") + 1;
      localStorage.setItem("syncCompletedCount", completedCount.toString());

      // Reload stats
      loadSyncStats();
      loadStorageInfo();
    } catch (error) {
      console.error("Error during sync:", error);
      const failedCount =
        parseInt(localStorage.getItem("syncFailedCount") || "0") + 1;
      localStorage.setItem("syncFailedCount", failedCount.toString());
    } finally {
      setSyncing(false);
      setSyncProgress(100);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Sync Manager</CardTitle>
            <div className="flex items-center space-x-2">
              <div
                className={`h-3 w-3 rounded-full ${networkStatus ? "bg-green-500" : "bg-red-500"}`}
              ></div>
              <span className="text-xs">
                {networkStatus ? "Online" : "Offline"}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Sync Status */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Sync Status</h3>
              <div className="grid grid-cols-3 gap-2">
                <div className="p-2 bg-blue-50 rounded-md text-center">
                  <p className="text-xs text-gray-500">Pending</p>
                  <p className="font-medium">{syncStats.pending}</p>
                </div>
                <div className="p-2 bg-green-50 rounded-md text-center">
                  <p className="text-xs text-gray-500">Completed</p>
                  <p className="font-medium">{syncStats.completed}</p>
                </div>
                <div className="p-2 bg-red-50 rounded-md text-center">
                  <p className="text-xs text-gray-500">Failed</p>
                  <p className="font-medium">{syncStats.failed}</p>
                </div>
              </div>
              {syncStats.lastSync && (
                <p className="text-xs text-gray-500 text-center">
                  Last sync: {syncStats.lastSync.toLocaleString()}
                </p>
              )}
            </div>

            {/* Storage Usage */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Storage Usage</h3>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className={`h-2.5 rounded-full ${storageInfo.percentage > 90 ? "bg-red-500" : storageInfo.percentage > 70 ? "bg-yellow-500" : "bg-green-500"}`}
                  style={{ width: `${storageInfo.percentage}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 text-center">
                {formatBytes(storageInfo.usage)} of{" "}
                {formatBytes(storageInfo.quota)} used (
                {storageInfo.percentage.toFixed(1)}%)
              </p>
            </div>

            {/* Sync Options */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Sync Options</h3>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={() => startSync("auto")}
                  disabled={syncing || !networkStatus}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  Auto Sync
                </Button>
                <Button
                  onClick={() => startSync("manual")}
                  disabled={syncing || !networkStatus}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  Force Sync All
                </Button>
                <Button
                  onClick={() => startSync("metadata")}
                  disabled={syncing || !networkStatus}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  Sync Metadata Only
                </Button>
                <Button
                  onClick={() => startSync("partial")}
                  disabled={syncing || !networkStatus}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  Partial Sync
                </Button>
              </div>
            </div>

            {/* Sync Progress */}
            {syncing && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-medium">Sync Progress</h3>
                  <Spinner size="sm" />
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="h-2.5 rounded-full bg-blue-500 transition-all duration-300"
                    style={{ width: `${syncProgress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-center">{syncProgress}% complete</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
