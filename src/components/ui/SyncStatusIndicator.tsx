/**
 * SyncStatusIndicator Component
 *
 * Displays the current synchronization status with visual indicators
 */

import React, { useState, useEffect } from "react";
import { useEventSubscription, EventType } from "../../services/eventBus";
import { synchronizationService } from "../../services/SynchronizationService";
import { Wifi, WifiOff, RefreshCw, AlertCircle, Check } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";

interface SyncStatusIndicatorProps {
  showDetails?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const SyncStatusIndicator: React.FC<SyncStatusIndicatorProps> = ({
  showDetails = false,
  size = "md",
  className = "",
}) => {
  const [status, setStatus] = useState(synchronizationService.getSyncStatus());
  const [syncAnimation, setSyncAnimation] = useState(false);

  // Update status when sync events occur
  useEventSubscription(EventType.SYNC_STARTED, () => {
    setStatus(synchronizationService.getSyncStatus());
    setSyncAnimation(true);
  });

  useEventSubscription(EventType.SYNC_COMPLETED, () => {
    setStatus(synchronizationService.getSyncStatus());
    setSyncAnimation(false);
  });

  useEventSubscription(EventType.NETWORK_STATUS_CHANGED, (event) => {
    setStatus({
      ...status,
      networkStatus: event.payload.status === "online",
    });
  });

  useEventSubscription(EventType.CONFLICT_DETECTED, () => {
    setStatus(synchronizationService.getSyncStatus());
  });

  useEventSubscription(EventType.CONFLICT_RESOLVED, () => {
    setStatus(synchronizationService.getSyncStatus());
  });

  // Refresh status periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setStatus(synchronizationService.getSyncStatus());
    }, 10000); // Every 10 seconds

    return () => clearInterval(interval);
  }, []);

  // Size mappings
  const sizeMap = {
    sm: {
      icon: 16,
      container: "h-6 px-2",
      text: "text-xs",
    },
    md: {
      icon: 20,
      container: "h-8 px-3",
      text: "text-sm",
    },
    lg: {
      icon: 24,
      container: "h-10 px-4",
      text: "text-base",
    },
  };

  // Get status icon and color
  const getStatusIcon = () => {
    if (!status.networkStatus) {
      return <WifiOff size={sizeMap[size].icon} className="text-gray-500" />;
    }

    if (status.syncInProgress) {
      return (
        <RefreshCw
          size={sizeMap[size].icon}
          className={`text-blue-500 ${syncAnimation ? "animate-spin" : ""}`}
        />
      );
    }

    if (status.unresolvedConflicts > 0) {
      return (
        <AlertCircle size={sizeMap[size].icon} className="text-amber-500" />
      );
    }

    return <Check size={sizeMap[size].icon} className="text-green-500" />;
  };

  // Get status text
  const getStatusText = () => {
    if (!status.networkStatus) return "Offline";
    if (status.syncInProgress) return "Syncing...";
    if (status.unresolvedConflicts > 0)
      return `${status.unresolvedConflicts} conflicts`;
    if (status.lastSyncTime) {
      const lastSync = new Date(status.lastSyncTime);
      const now = new Date();
      const diffMinutes = Math.floor(
        (now.getTime() - lastSync.getTime()) / 60000,
      );

      if (diffMinutes < 1) return "Synced just now";
      if (diffMinutes < 60) return `Synced ${diffMinutes}m ago`;

      const hours = Math.floor(diffMinutes / 60);
      return `Synced ${hours}h ago`;
    }
    return "Not synced";
  };

  // Get tooltip content
  const getTooltipContent = () => {
    return (
      <div className="text-xs">
        <div className="font-semibold mb-1">Sync Status</div>
        <div>Network: {status.networkStatus ? "Online" : "Offline"}</div>
        <div>Auto-sync: {status.autoSyncEnabled ? "Enabled" : "Disabled"}</div>
        {status.lastSyncTime && (
          <div>
            Last sync: {new Date(status.lastSyncTime).toLocaleTimeString()}
          </div>
        )}
        {status.pendingOperations > 0 && (
          <div>Pending: {status.pendingOperations} operations</div>
        )}
        {status.unresolvedConflicts > 0 && (
          <div className="text-amber-500">
            Conflicts: {status.unresolvedConflicts}
          </div>
        )}
        {status.bandwidth && (
          <div>Bandwidth: {status.bandwidth.toFixed(1)} Mbps</div>
        )}
      </div>
    );
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={`flex items-center gap-2 rounded-full bg-gray-100 ${sizeMap[size].container} ${className}`}
          >
            {getStatusIcon()}
            {showDetails && (
              <span className={`${sizeMap[size].text} whitespace-nowrap`}>
                {getStatusText()}
              </span>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom">{getTooltipContent()}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default SyncStatusIndicator;
