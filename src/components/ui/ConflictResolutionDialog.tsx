/**
 * ConflictResolutionDialog Component
 *
 * Displays a dialog for resolving data conflicts
 */

import React, { useState, useEffect } from "react";
import { useEventSubscription, EventType } from "../../services/eventBus";
import {
  synchronizationService,
  SyncConflict,
  SyncEntityType,
} from "../../services/SynchronizationService";
import { ConflictResolutionStrategy } from "../../services/offlineService";
import {
  AlertCircle,
  Check,
  X,
  ArrowLeftRight,
  Server,
  Smartphone,
  Clock,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./dialog";
import { Button } from "./button";
import { RadioGroup, RadioGroupItem } from "./radio-group";
import { Label } from "./label";
import { ScrollArea } from "./scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";

interface ConflictResolutionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conflict?: SyncConflict;
  onResolve?: (
    conflict: SyncConflict,
    strategy: ConflictResolutionStrategy,
  ) => void;
}

export const ConflictResolutionDialog: React.FC<
  ConflictResolutionDialogProps
> = ({ open, onOpenChange, conflict, onResolve }) => {
  const [conflicts, setConflicts] = useState<SyncConflict[]>([]);
  const [currentConflict, setCurrentConflict] = useState<
    SyncConflict | undefined
  >(conflict);
  const [selectedStrategy, setSelectedStrategy] =
    useState<ConflictResolutionStrategy>(
      ConflictResolutionStrategy.LastModifiedWins,
    );
  const [resolving, setResolving] = useState(false);

  // Load conflicts when dialog opens
  useEffect(() => {
    if (open) {
      const unresolvedConflicts =
        synchronizationService.getUnresolvedConflicts();
      setConflicts(unresolvedConflicts);

      if (!currentConflict && unresolvedConflicts.length > 0) {
        setCurrentConflict(unresolvedConflicts[0]);
      }
    }
  }, [open, currentConflict]);

  // Update conflicts when new conflicts are detected
  useEventSubscription(EventType.CONFLICT_DETECTED, () => {
    if (open) {
      const unresolvedConflicts =
        synchronizationService.getUnresolvedConflicts();
      setConflicts(unresolvedConflicts);

      if (!currentConflict && unresolvedConflicts.length > 0) {
        setCurrentConflict(unresolvedConflicts[0]);
      }
    }
  });

  // Update conflicts when conflicts are resolved
  useEventSubscription(EventType.CONFLICT_RESOLVED, (event) => {
    if (open) {
      const unresolvedConflicts =
        synchronizationService.getUnresolvedConflicts();
      setConflicts(unresolvedConflicts);

      // If current conflict was resolved, move to next conflict
      if (currentConflict && event.payload.conflictId === currentConflict.id) {
        if (unresolvedConflicts.length > 0) {
          setCurrentConflict(unresolvedConflicts[0]);
        } else {
          setCurrentConflict(undefined);
          onOpenChange(false);
        }
      }
    }
  });

  // Handle resolve button click
  const handleResolve = async () => {
    if (!currentConflict) return;

    setResolving(true);

    try {
      if (onResolve) {
        onResolve(currentConflict, selectedStrategy);
      } else {
        await synchronizationService.resolveConflict(
          currentConflict.id,
          selectedStrategy,
        );
      }

      // Move to next conflict
      const remainingConflicts = conflicts.filter(
        (c) => c.id !== currentConflict.id,
      );
      if (remainingConflicts.length > 0) {
        setCurrentConflict(remainingConflicts[0]);
      } else {
        setCurrentConflict(undefined);
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Error resolving conflict:", error);
    } finally {
      setResolving(false);
    }
  };

  // Format entity type for display
  const formatEntityType = (type: SyncEntityType) => {
    return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
  };

  // Format data for display
  const formatData = (data: any) => {
    if (!data) return "No data";

    try {
      return JSON.stringify(data, null, 2);
    } catch (error) {
      return String(data);
    }
  };

  // Get recommended strategy based on entity type
  const getRecommendedStrategy = (
    entityType: SyncEntityType,
  ): ConflictResolutionStrategy => {
    switch (entityType) {
      case SyncEntityType.PHOTO:
        return ConflictResolutionStrategy.ClientWins;
      case SyncEntityType.ASSESSMENT:
      case SyncEntityType.ROOM:
      case SyncEntityType.RECOMMENDATION:
        return ConflictResolutionStrategy.MergeByField;
      default:
        return ConflictResolutionStrategy.LastModifiedWins;
    }
  };

  // Set recommended strategy when conflict changes
  useEffect(() => {
    if (currentConflict) {
      setSelectedStrategy(getRecommendedStrategy(currentConflict.entityType));
    }
  }, [currentConflict]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            Data Conflict Resolution
          </DialogTitle>
          <DialogDescription>
            {conflicts.length > 0
              ? `${conflicts.length} conflict${conflicts.length > 1 ? "s" : ""} need${conflicts.length === 1 ? "s" : ""} to be resolved`
              : "All conflicts have been resolved"}
          </DialogDescription>
        </DialogHeader>

        {currentConflict ? (
          <>
            <div className="py-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-medium">
                    {formatEntityType(currentConflict.entityType)} Conflict
                  </h3>
                  <p className="text-xs text-gray-500">
                    ID: {currentConflict.entityId}
                  </p>
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(currentConflict.timestamp).toLocaleString()}
                </div>
              </div>

              <Tabs defaultValue="comparison">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="comparison">Comparison</TabsTrigger>
                  <TabsTrigger value="raw">Raw Data</TabsTrigger>
                </TabsList>
                <TabsContent value="comparison" className="mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="border rounded-md p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Smartphone className="h-4 w-4 text-blue-500" />
                        <h4 className="text-sm font-medium">Client Version</h4>
                      </div>
                      <ScrollArea className="h-[200px]">
                        <pre className="text-xs whitespace-pre-wrap overflow-auto">
                          {formatData(currentConflict.clientData)}
                        </pre>
                      </ScrollArea>
                    </div>
                    <div className="border rounded-md p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Server className="h-4 w-4 text-purple-500" />
                        <h4 className="text-sm font-medium">Server Version</h4>
                      </div>
                      <ScrollArea className="h-[200px]">
                        <pre className="text-xs whitespace-pre-wrap overflow-auto">
                          {formatData(currentConflict.serverData)}
                        </pre>
                      </ScrollArea>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="raw" className="mt-4">
                  <ScrollArea className="h-[250px]">
                    <pre className="text-xs whitespace-pre-wrap overflow-auto border rounded-md p-3">
                      {formatData({
                        clientData: currentConflict.clientData,
                        serverData: currentConflict.serverData,
                        metadata: currentConflict.metadata,
                      })}
                    </pre>
                  </ScrollArea>
                </TabsContent>
              </Tabs>

              <div className="mt-6">
                <h3 className="text-sm font-medium mb-3">
                  Resolution Strategy
                </h3>
                <RadioGroup
                  value={selectedStrategy}
                  onValueChange={(value) =>
                    setSelectedStrategy(value as ConflictResolutionStrategy)
                  }
                  className="space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value={ConflictResolutionStrategy.ClientWins}
                      id="client-wins"
                    />
                    <Label
                      htmlFor="client-wins"
                      className="flex items-center gap-1"
                    >
                      <Smartphone className="h-4 w-4" /> Client Wins
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value={ConflictResolutionStrategy.ServerWins}
                      id="server-wins"
                    />
                    <Label
                      htmlFor="server-wins"
                      className="flex items-center gap-1"
                    >
                      <Server className="h-4 w-4" /> Server Wins
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value={ConflictResolutionStrategy.LastModifiedWins}
                      id="last-modified-wins"
                    />
                    <Label
                      htmlFor="last-modified-wins"
                      className="flex items-center gap-1"
                    >
                      <Clock className="h-4 w-4" /> Last Modified Wins
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      value={ConflictResolutionStrategy.MergeByField}
                      id="merge-by-field"
                    />
                    <Label
                      htmlFor="merge-by-field"
                      className="flex items-center gap-1"
                    >
                      <ArrowLeftRight className="h-4 w-4" /> Merge Fields
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={resolving}
              >
                Cancel
              </Button>
              <Button onClick={handleResolve} disabled={resolving}>
                {resolving ? "Resolving..." : "Resolve Conflict"}
              </Button>
            </DialogFooter>
          </>
        ) : (
          <div className="py-8 text-center">
            <Check className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <p>All conflicts have been resolved</p>
            <Button className="mt-4" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ConflictResolutionDialog;
