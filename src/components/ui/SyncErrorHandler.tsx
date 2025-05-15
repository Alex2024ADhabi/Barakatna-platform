/**
 * SyncErrorHandler Component
 *
 * Displays and helps resolve synchronization errors
 */

import React, { useState, useEffect } from "react";
import { useEventSubscription, EventType } from "../../services/eventBus";
import { synchronizationService } from "../../services/SynchronizationService";
import { AlertTriangle, RefreshCw, X, Info, ExternalLink } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "./alert";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./accordion";
import { Button } from "./button";
import { ScrollArea } from "./scroll-area";

interface SyncError {
  id: string;
  timestamp: string;
  message: string;
  details?: any;
  entityType?: string;
  entityId?: string;
  operation?: string;
  retryCount: number;
  resolved: boolean;
}

interface SyncErrorHandlerProps {
  className?: string;
  maxErrors?: number;
  autoHide?: boolean;
}

export const SyncErrorHandler: React.FC<SyncErrorHandlerProps> = ({
  className = "",
  maxErrors = 5,
  autoHide = true,
}) => {
  const [errors, setErrors] = useState<SyncError[]>([]);
  const [visible, setVisible] = useState(!autoHide);

  // Listen for sync errors
  useEventSubscription(EventType.SYNC_COMPLETED, (event) => {
    if (event.payload.status === "error") {
      const newError: SyncError = {
        id: event.id,
        timestamp: event.timestamp,
        message: event.payload.error || "Unknown sync error",
        details: event.payload,
        retryCount: 0,
        resolved: false,
      };

      setErrors((prev) => {
        const updated = [newError, ...prev].slice(0, maxErrors);
        setVisible(true);
        return updated;
      });
    }
  });

  // Listen for offline request errors
  useEventSubscription(EventType.OFFLINE_REQUEST_PROCESSED, (event) => {
    if (!event.payload.success) {
      const newError: SyncError = {
        id: event.id,
        timestamp: event.timestamp,
        message: event.payload.error || "Failed to process offline request",
        details: event.payload.request,
        entityType: event.payload.request?.entityType,
        entityId: event.payload.request?.entityId,
        operation: event.payload.request?.metadata?.operation,
        retryCount: event.payload.request?.retryCount || 0,
        resolved: false,
      };

      setErrors((prev) => {
        const updated = [newError, ...prev].slice(0, maxErrors);
        setVisible(true);
        return updated;
      });
    }
  });

  // Handle retry
  const handleRetry = async (error: SyncError) => {
    // Mark as resolved
    setErrors((prev) =>
      prev.map((e) => (e.id === error.id ? { ...e, resolved: true } : e)),
    );

    // Trigger sync
    await synchronizationService.syncAll();
  };

  // Handle dismiss
  const handleDismiss = (error: SyncError) => {
    setErrors((prev) =>
      prev.map((e) => (e.id === error.id ? { ...e, resolved: true } : e)),
    );
  };

  // Handle dismiss all
  const handleDismissAll = () => {
    setErrors((prev) => prev.map((e) => ({ ...e, resolved: true })));
    setVisible(false);
  };

  // Filter out resolved errors after a delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setErrors((prev) => prev.filter((e) => !e.resolved));
    }, 5000);

    return () => clearTimeout(timer);
  }, [errors]);

  // Hide if no errors and autoHide is true
  useEffect(() => {
    if (autoHide && errors.length === 0) {
      setVisible(false);
    }
  }, [errors, autoHide]);

  if (!visible || errors.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle className="flex items-center justify-between">
          <span>Synchronization Errors</span>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs"
            onClick={handleDismissAll}
          >
            Dismiss All
          </Button>
        </AlertTitle>
        <AlertDescription>
          <ScrollArea className="max-h-[300px] pr-4 mt-2">
            <Accordion type="single" collapsible className="w-full">
              {errors
                .filter((e) => !e.resolved)
                .map((error, index) => (
                  <AccordionItem key={error.id} value={error.id}>
                    <AccordionTrigger className="text-sm py-2">
                      <div className="flex items-center justify-between w-full pr-4">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {error.entityType
                              ? `${error.entityType.charAt(0).toUpperCase() + error.entityType.slice(1).toLowerCase()} Error`
                              : "Sync Error"}
                          </span>
                          {error.operation && (
                            <span className="text-xs bg-gray-100 px-2 py-0.5 rounded">
                              {error.operation}
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(error.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="text-sm mb-2">{error.message}</div>
                      {error.details && (
                        <div className="text-xs bg-gray-50 p-2 rounded mb-2 overflow-auto max-h-[100px]">
                          <pre>{JSON.stringify(error.details, null, 2)}</pre>
                        </div>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <div className="text-xs text-gray-500">
                          {error.retryCount > 0 && (
                            <span>Retry attempts: {error.retryCount}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => handleDismiss(error)}
                          >
                            <X className="h-3 w-3 mr-1" /> Dismiss
                          </Button>
                          <Button
                            variant="default"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => handleRetry(error)}
                          >
                            <RefreshCw className="h-3 w-3 mr-1" /> Retry
                          </Button>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
            </Accordion>
          </ScrollArea>

          <div className="flex items-center justify-between mt-4 text-xs">
            <div className="flex items-center gap-1">
              <Info className="h-3 w-3" />
              <span>
                {errors.filter((e) => !e.resolved).length} active error
                {errors.filter((e) => !e.resolved).length !== 1 ? "s" : ""}
              </span>
            </div>
            <Button
              variant="link"
              size="sm"
              className="h-6 p-0 text-xs"
              asChild
            >
              <a href="#" target="_blank" rel="noopener noreferrer">
                Troubleshooting <ExternalLink className="h-3 w-3 ml-1" />
              </a>
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default SyncErrorHandler;
