import React, { useState, useCallback, useEffect } from "react";
import { Button } from "./button";
import { Loader2, AlertTriangle, Wifi, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { eventBus, EventType, useNetworkStatus } from "@/services/eventBus";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./dialog";

interface OptimisticActionProps {
  /** The action to perform when the button is clicked */
  action: () => Promise<
    | boolean
    | {
        success: boolean;
        data?: any;
        error?: string;
        offline?: boolean;
        optimistic?: boolean;
        conflicts?: any[];
      }
  >;
  /** The text to display on the button */
  children: React.ReactNode;
  /** Optional success callback */
  onSuccess?: (data?: any) => void;
  /** Optional error callback */
  onError?: (error: any) => void;
  /** Button variant from shadcn/ui button */
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  /** Button size from shadcn/ui button */
  size?: "default" | "sm" | "lg" | "icon";
  /** Additional class names */
  className?: string;
  /** Whether the button is disabled */
  disabled?: boolean;
  /** Whether to show a loading indicator during the action */
  showLoading?: boolean;
  /** Text to show during loading state */
  loadingText?: string;
  /** Whether to disable the button during loading */
  disableDuringLoading?: boolean;
  /** Whether to allow offline operations */
  allowOffline?: boolean;
  /** Whether to show network status indicator */
  showNetworkStatus?: boolean;
  /** Whether to show conflict resolution dialog */
  showConflictResolution?: boolean;
  /** Function to resolve conflicts */
  resolveConflict?: (serverData: any, localData: any) => Promise<any>;
  /** Entity type for conflict resolution */
  entityType?: string;
  /** Additional props to pass to the button */
  buttonProps?: React.ButtonHTMLAttributes<HTMLButtonElement>;
}

/**
 * OptimisticAction component for handling UI updates during async operations
 * Provides loading state, success/error handling, optimistic UI updates, and conflict resolution
 */
export function OptimisticAction({
  action,
  children,
  onSuccess,
  onError,
  variant = "default",
  size = "default",
  className,
  disabled = false,
  showLoading = true,
  loadingText,
  disableDuringLoading = true,
  allowOffline = false,
  showNetworkStatus = false,
  showConflictResolution = false,
  resolveConflict,
  entityType,
  buttonProps,
}: OptimisticActionProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isOfflineAction, setIsOfflineAction] = useState(false);
  const [conflictData, setConflictData] = useState<{
    serverData: any;
    localData: any;
  } | null>(null);
  const isOnline = useNetworkStatus();

  // Listen for network status changes to retry offline actions
  useEffect(() => {
    if (isOnline && isOfflineAction) {
      // Wait a moment for connection to stabilize
      const timer = setTimeout(() => {
        setIsOfflineAction(false);
        handleClick();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [isOnline, isOfflineAction]);

  const handleClick = useCallback(async () => {
    if (
      (isLoading && disableDuringLoading) ||
      (conflictData && showConflictResolution)
    )
      return;

    setIsLoading(true);
    try {
      const result = await action();

      // Handle boolean result (legacy support)
      if (typeof result === "boolean") {
        if (result && onSuccess) {
          onSuccess();
        }
        return;
      }

      // Handle enhanced result object
      if (result.success) {
        // Check if this was an optimistic offline update
        if (result.offline && result.optimistic) {
          setIsOfflineAction(true);
          // Publish event about optimistic update
          eventBus.publish({
            id: crypto.randomUUID(),
            type: EventType.REQUEST_QUEUED,
            timestamp: new Date().toISOString(),
            source: "optimisticAction",
            payload: { data: result.data, entityType },
          });
        }

        // Check for conflicts that need resolution
        if (
          result.conflicts &&
          result.conflicts.length > 0 &&
          showConflictResolution
        ) {
          setConflictData({
            serverData: result.conflicts[0].serverData,
            localData: result.conflicts[0].localData,
          });
          return;
        }

        if (onSuccess) {
          onSuccess(result.data);
        }
      } else if (onError) {
        onError(result.error);
      }
    } catch (error) {
      console.error("Error in optimistic action:", error);
      if (onError) {
        onError(error);
      }
    } finally {
      if (!isOfflineAction) {
        setIsLoading(false);
      }
    }
  }, [
    action,
    isLoading,
    disableDuringLoading,
    onSuccess,
    onError,
    isOfflineAction,
    showConflictResolution,
  ]);

  const handleResolveConflict = async (useServer: boolean) => {
    if (!conflictData) return;

    try {
      let resolvedData;

      if (useServer) {
        // Use server data
        resolvedData = conflictData.serverData;
      } else if (resolveConflict) {
        // Use custom resolution function
        resolvedData = await resolveConflict(
          conflictData.serverData,
          conflictData.localData,
        );
      } else {
        // Default to local data if no resolution function
        resolvedData = conflictData.localData;
      }

      // Publish conflict resolution event
      eventBus.publish({
        id: crypto.randomUUID(),
        type: EventType.CONFLICT_RESOLVED,
        timestamp: new Date().toISOString(),
        source: "optimisticAction",
        payload: {
          entityType,
          resolution: useServer
            ? "server"
            : resolveConflict
              ? "custom"
              : "local",
          data: resolvedData,
        },
      });

      if (onSuccess) {
        onSuccess(resolvedData);
      }
    } catch (error) {
      console.error("Error resolving conflict:", error);
      if (onError) {
        onError(error);
      }
    } finally {
      setConflictData(null);
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={cn(className)}
        disabled={
          disabled ||
          (isLoading && disableDuringLoading) ||
          (!isOnline && !allowOffline)
        }
        onClick={handleClick}
        {...buttonProps}
      >
        {isLoading && showLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {loadingText || children}
          </>
        ) : isOfflineAction ? (
          <>
            <WifiOff className="mr-2 h-4 w-4" />
            {"Queued"}
          </>
        ) : showNetworkStatus && !isOnline ? (
          <>
            <WifiOff className="mr-2 h-4 w-4" />
            {allowOffline ? children : "Offline"}
          </>
        ) : showNetworkStatus ? (
          <>
            <Wifi className="mr-2 h-4 w-4" />
            {children}
          </>
        ) : (
          children
        )}
      </Button>

      {/* Conflict Resolution Dialog */}
      {showConflictResolution && conflictData && (
        <Dialog
          open={!!conflictData}
          onOpenChange={() => setConflictData(null)}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Conflict Detected</DialogTitle>
              <DialogDescription>
                Changes were made to this data both locally and on the server.
                Please choose which version to keep.
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="border p-3 rounded-md">
                <h4 className="font-medium mb-2">Server Version</h4>
                <pre className="text-xs overflow-auto max-h-40">
                  {JSON.stringify(conflictData.serverData, null, 2)}
                </pre>
              </div>

              <div className="border p-3 rounded-md">
                <h4 className="font-medium mb-2">Your Version</h4>
                <pre className="text-xs overflow-auto max-h-40">
                  {JSON.stringify(conflictData.localData, null, 2)}
                </pre>
              </div>
            </div>

            <DialogFooter className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => handleResolveConflict(true)}
              >
                Use Server Version
              </Button>

              {resolveConflict && (
                <Button
                  variant="secondary"
                  onClick={() => handleResolveConflict(false)}
                >
                  Merge Changes
                </Button>
              )}

              <Button
                variant="default"
                onClick={() => handleResolveConflict(false)}
              >
                Use My Version
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
