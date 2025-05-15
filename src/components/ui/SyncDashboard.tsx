/**
 * SyncDashboard Component
 *
 * A comprehensive dashboard for managing data synchronization
 */

import React, { useState } from "react";
import { SyncStatusIndicator } from "./SyncStatusIndicator";
import { SyncControlPanel } from "./SyncControlPanel";
import { SyncHistoryView } from "./SyncHistoryView";
import { ConflictResolutionDialog } from "./ConflictResolutionDialog";
import { SyncErrorHandler } from "./SyncErrorHandler";
import {
  synchronizationService,
  SyncEntityType,
} from "../../services/SynchronizationService";
import { useEventSubscription, EventType } from "../../services/eventBus";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";
import { Button } from "./button";
import { AlertCircle } from "lucide-react";

interface SyncDashboardProps {
  className?: string;
}

export const SyncDashboard: React.FC<SyncDashboardProps> = ({
  className = "",
}) => {
  const [status, setStatus] = useState(synchronizationService.getSyncStatus());
  const [conflictDialogOpen, setConflictDialogOpen] = useState(false);

  // Update status when sync events occur
  useEventSubscription(EventType.SYNC_STARTED, () => {
    setStatus(synchronizationService.getSyncStatus());
  });

  useEventSubscription(EventType.SYNC_COMPLETED, () => {
    setStatus(synchronizationService.getSyncStatus());
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

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Data Synchronization</h2>
        <SyncStatusIndicator showDetails size="lg" />
      </div>

      <SyncErrorHandler />

      {status.unresolvedConflicts > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-md p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            <span>
              {status.unresolvedConflicts} data conflict
              {status.unresolvedConflicts !== 1 ? "s" : ""} need
              {status.unresolvedConflicts === 1 ? "s" : ""} resolution
            </span>
          </div>
          <Button variant="outline" onClick={() => setConflictDialogOpen(true)}>
            Resolve Conflicts
          </Button>
        </div>
      )}

      <Tabs defaultValue="controls">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="controls">Sync Controls</TabsTrigger>
          <TabsTrigger value="history">Sync History</TabsTrigger>
        </TabsList>
        <TabsContent value="controls" className="mt-4">
          <SyncControlPanel />
        </TabsContent>
        <TabsContent value="history" className="mt-4">
          <SyncHistoryView />
        </TabsContent>
      </Tabs>

      <ConflictResolutionDialog
        open={conflictDialogOpen}
        onOpenChange={setConflictDialogOpen}
      />
    </div>
  );
};

export default SyncDashboard;
