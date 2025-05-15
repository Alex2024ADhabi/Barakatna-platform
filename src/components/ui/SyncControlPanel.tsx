/**
 * SyncControlPanel Component
 *
 * Provides user controls for manual synchronization operations
 */

import React, { useState } from "react";
import { useEventSubscription, EventType } from "../../services/eventBus";
import {
  synchronizationService,
  SyncEntityType,
} from "../../services/SynchronizationService";
import { RefreshCw, Settings, Clock, Wifi, WifiOff } from "lucide-react";
import { Button } from "./button";
import { Switch } from "./switch";
import { Checkbox } from "./checkbox";
import { Label } from "./label";
import { Separator } from "./separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./collapsible";

interface SyncControlPanelProps {
  className?: string;
  compact?: boolean;
}

export const SyncControlPanel: React.FC<SyncControlPanelProps> = ({
  className = "",
  compact = false,
}) => {
  const [status, setStatus] = useState(synchronizationService.getSyncStatus());
  const [syncing, setSyncing] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedEntities, setSelectedEntities] = useState<
    Record<SyncEntityType, boolean>
  >(
    Object.values(SyncEntityType).reduce(
      (acc, type) => {
        acc[type] = true;
        return acc;
      },
      {} as Record<SyncEntityType, boolean>,
    ),
  );

  // Update status when sync events occur
  useEventSubscription(EventType.SYNC_STARTED, () => {
    setStatus(synchronizationService.getSyncStatus());
    setSyncing(true);
  });

  useEventSubscription(EventType.SYNC_COMPLETED, () => {
    setStatus(synchronizationService.getSyncStatus());
    setSyncing(false);
  });

  useEventSubscription(EventType.NETWORK_STATUS_CHANGED, (event) => {
    setStatus({
      ...status,
      networkStatus: event.payload.status === "online",
    });
  });

  // Handle sync all
  const handleSyncAll = async () => {
    if (syncing || !status.networkStatus) return;
    setSyncing(true);
    await synchronizationService.syncAll();
    setSyncing(false);
  };

  // Handle partial sync
  const handlePartialSync = async () => {
    if (syncing || !status.networkStatus) return;

    const entitiesToSync = Object.entries(selectedEntities)
      .filter(([_, selected]) => selected)
      .map(([type]) => type as SyncEntityType);

    if (entitiesToSync.length === 0) return;

    setSyncing(true);
    await synchronizationService.syncEntityTypes(entitiesToSync);
    setSyncing(false);
  };

  // Toggle auto sync
  const toggleAutoSync = () => {
    const newValue = !status.autoSyncEnabled;
    synchronizationService.updateConfig({ autoSync: newValue });
    setStatus({ ...status, autoSyncEnabled: newValue });
  };

  // Toggle entity selection
  const toggleEntity = (entityType: SyncEntityType) => {
    setSelectedEntities({
      ...selectedEntities,
      [entityType]: !selectedEntities[entityType],
    });
  };

  // Select/deselect all entities
  const selectAllEntities = (selected: boolean) => {
    const newSelection = {} as Record<SyncEntityType, boolean>;
    Object.values(SyncEntityType).forEach((type) => {
      newSelection[type] = selected;
    });
    setSelectedEntities(newSelection);
  };

  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Button
          variant="outline"
          size="sm"
          onClick={handleSyncAll}
          disabled={syncing || !status.networkStatus}
        >
          <RefreshCw
            className={`h-4 w-4 mr-1 ${syncing ? "animate-spin" : ""}`}
          />
          Sync
        </Button>
        <div className="flex items-center gap-1">
          <Switch
            id="auto-sync-compact"
            checked={status.autoSyncEnabled}
            onCheckedChange={toggleAutoSync}
            disabled={!status.networkStatus}
          />
          <Label htmlFor="auto-sync-compact" className="text-xs">
            Auto
          </Label>
        </div>
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Synchronization</span>
          {status.networkStatus ? (
            <Wifi className="h-5 w-5 text-green-500" />
          ) : (
            <WifiOff className="h-5 w-5 text-gray-500" />
          )}
        </CardTitle>
        <CardDescription>
          {status.networkStatus
            ? "Manage data synchronization with the server"
            : "You are currently offline"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              onClick={handleSyncAll}
              disabled={syncing || !status.networkStatus}
              className="w-full"
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${syncing ? "animate-spin" : ""}`}
              />
              Sync All Data
            </Button>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="auto-sync"
            checked={status.autoSyncEnabled}
            onCheckedChange={toggleAutoSync}
            disabled={!status.networkStatus}
          />
          <Label htmlFor="auto-sync">Auto-sync</Label>
        </div>

        {status.lastSyncTime && (
          <div className="text-sm text-gray-500 flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            Last synced: {new Date(status.lastSyncTime).toLocaleString()}
          </div>
        )}

        <Collapsible
          open={showAdvanced}
          onOpenChange={setShowAdvanced}
          className="w-full"
        >
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="flex w-full justify-between p-0">
              <span className="text-sm font-medium">Advanced Options</span>
              <Settings className="h-4 w-4" />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-4 space-y-4">
            <Separator />
            <div>
              <div className="mb-2 flex items-center justify-between">
                <h4 className="text-sm font-medium">Selective Sync</h4>
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => selectAllEntities(true)}
                  >
                    Select All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => selectAllEntities(false)}
                  >
                    Clear
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {Object.values(SyncEntityType).map((entityType) => (
                  <div key={entityType} className="flex items-center space-x-2">
                    <Checkbox
                      id={`entity-${entityType}`}
                      checked={selectedEntities[entityType]}
                      onCheckedChange={() => toggleEntity(entityType)}
                    />
                    <Label
                      htmlFor={`entity-${entityType}`}
                      className="capitalize"
                    >
                      {entityType.toLowerCase()}
                    </Label>
                  </div>
                ))}
              </div>
              <Button
                className="mt-4 w-full"
                variant="secondary"
                onClick={handlePartialSync}
                disabled={syncing || !status.networkStatus}
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${syncing ? "animate-spin" : ""}`}
                />
                Sync Selected
              </Button>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
      <CardFooter className="flex justify-between text-xs text-gray-500">
        {status.pendingOperations > 0 && (
          <div>{status.pendingOperations} operations pending</div>
        )}
        {status.unresolvedConflicts > 0 && (
          <div className="text-amber-500">
            {status.unresolvedConflicts} unresolved conflicts
          </div>
        )}
        {status.bandwidth && (
          <div>Bandwidth: {status.bandwidth.toFixed(1)} Mbps</div>
        )}
      </CardFooter>
    </Card>
  );
};

export default SyncControlPanel;
