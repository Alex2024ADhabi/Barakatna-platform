/**
 * SyncHistoryView Component
 *
 * Displays a history of synchronization activities
 */

import React, { useState, useEffect } from "react";
import { useEventSubscription, EventType } from "../../services/eventBus";
import {
  synchronizationService,
  SyncHistoryEntry,
  SyncEntityType,
} from "../../services/SynchronizationService";
import { SyncStatus } from "../../services/offlineService";
import { Check, X, AlertCircle, Clock, RefreshCw, Filter } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./card";
import { Badge } from "./badge";
import { Button } from "./button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
import { ScrollArea } from "./scroll-area";

interface SyncHistoryViewProps {
  className?: string;
  limit?: number;
  showFilters?: boolean;
}

export const SyncHistoryView: React.FC<SyncHistoryViewProps> = ({
  className = "",
  limit = 50,
  showFilters = true,
}) => {
  const [history, setHistory] = useState<SyncHistoryEntry[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<SyncHistoryEntry[]>(
    [],
  );
  const [entityFilter, setEntityFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showFiltersUI, setShowFiltersUI] = useState(false);

  // Load initial history
  useEffect(() => {
    setHistory(synchronizationService.getSyncHistory(limit));
  }, [limit]);

  // Apply filters
  useEffect(() => {
    let filtered = [...history];

    if (entityFilter !== "all") {
      filtered = filtered.filter((entry) => entry.entityType === entityFilter);
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((entry) => entry.status === statusFilter);
    }

    setFilteredHistory(filtered);
  }, [history, entityFilter, statusFilter]);

  // Update history when sync events occur
  useEventSubscription(EventType.SYNC_COMPLETED, () => {
    setHistory(synchronizationService.getSyncHistory(limit));
  });

  useEventSubscription(EventType.CONFLICT_RESOLVED, () => {
    setHistory(synchronizationService.getSyncHistory(limit));
  });

  // Format timestamp
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Get status icon
  const getStatusIcon = (status: SyncStatus) => {
    switch (status) {
      case SyncStatus.Synced:
        return <Check className="h-4 w-4 text-green-500" />;
      case SyncStatus.Error:
        return <X className="h-4 w-4 text-red-500" />;
      case SyncStatus.Conflict:
        return <AlertCircle className="h-4 w-4 text-amber-500" />;
      case SyncStatus.PendingUpload:
      case SyncStatus.PendingDownload:
        return <Clock className="h-4 w-4 text-blue-500" />;
      default:
        return <RefreshCw className="h-4 w-4 text-gray-500" />;
    }
  };

  // Get status badge
  const getStatusBadge = (status: SyncStatus) => {
    switch (status) {
      case SyncStatus.Synced:
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200"
          >
            Synced
          </Badge>
        );
      case SyncStatus.Error:
        return (
          <Badge
            variant="outline"
            className="bg-red-50 text-red-700 border-red-200"
          >
            Error
          </Badge>
        );
      case SyncStatus.Conflict:
        return (
          <Badge
            variant="outline"
            className="bg-amber-50 text-amber-700 border-amber-200"
          >
            Conflict
          </Badge>
        );
      case SyncStatus.PendingUpload:
        return (
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-700 border-blue-200"
          >
            Pending Upload
          </Badge>
        );
      case SyncStatus.PendingDownload:
        return (
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-700 border-blue-200"
          >
            Pending Download
          </Badge>
        );
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  // Get operation badge
  const getOperationBadge = (operation: string) => {
    switch (operation) {
      case "create":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            Create
          </Badge>
        );
      case "update":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            Update
          </Badge>
        );
      case "delete":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            Delete
          </Badge>
        );
      case "read":
        return (
          <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">
            Read
          </Badge>
        );
      case "conflict_resolution":
        return (
          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
            Conflict Resolution
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">
            {operation}
          </Badge>
        );
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Sync History</span>
          {showFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFiltersUI(!showFiltersUI)}
            >
              <Filter className="h-4 w-4" />
            </Button>
          )}
        </CardTitle>
        <CardDescription>Recent synchronization activities</CardDescription>

        {showFilters && showFiltersUI && (
          <div className="flex flex-wrap gap-2 mt-2">
            <Select value={entityFilter} onValueChange={setEntityFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by entity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Entities</SelectItem>
                {Object.values(SyncEntityType).map((type) => (
                  <SelectItem key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1).toLowerCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {Object.values(SyncStatus).map((status) => (
                  <SelectItem key={status} value={status}>
                    {status.charAt(0).toUpperCase() +
                      status.slice(1).replace("_", " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          {filteredHistory.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No sync history available
            </div>
          ) : (
            <div className="space-y-4">
              {filteredHistory.map((entry) => (
                <div
                  key={entry.id}
                  className="border rounded-md p-3 bg-white shadow-sm"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(entry.status)}
                      <span className="font-medium capitalize">
                        {entry.entityType.toLowerCase()}
                      </span>
                      <span className="text-xs text-gray-500">
                        {entry.entityId.substring(0, 8)}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatTime(entry.timestamp)}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {getOperationBadge(entry.operation)}
                    {getStatusBadge(entry.status)}
                  </div>
                  {entry.error && (
                    <div className="mt-2 text-xs text-red-500 bg-red-50 p-2 rounded">
                      {entry.error}
                    </div>
                  )}
                  {entry.details && Object.keys(entry.details).length > 0 && (
                    <div className="mt-2 text-xs text-gray-500">
                      {Object.entries(entry.details).map(([key, value]) => (
                        <div key={key}>
                          <span className="font-medium">{key}:</span>{" "}
                          {typeof value === "object"
                            ? JSON.stringify(value)
                            : String(value)}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default SyncHistoryView;
