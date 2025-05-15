/**
 * SyncQueueManager
 *
 * Manages the synchronization queue for offline operations
 * Provides prioritization, retry logic, and conflict detection
 */

import { v4 as uuidv4 } from "uuid";
import { eventBus, EventType } from "./eventBus";
import {
  offlineService,
  SyncStatus,
  ConflictResolutionStrategy,
} from "./offlineService";

export interface SyncOperation {
  id?: string;
  entityType: string;
  entityId: string;
  operation: "create" | "update" | "delete" | "read";
  endpoint: string;
  data?: any;
  priority: number;
  timestamp?: string;
  metadata?: Record<string, any>;
}

export class SyncQueueManager {
  private static instance: SyncQueueManager;

  private constructor() {
    // Initialize event listeners
    this.initEventListeners();
  }

  public static getInstance(): SyncQueueManager {
    if (!SyncQueueManager.instance) {
      SyncQueueManager.instance = new SyncQueueManager();
    }
    return SyncQueueManager.instance;
  }

  private initEventListeners(): void {
    // Listen for network status changes
    eventBus.subscribe(EventType.NETWORK_STATUS_CHANGED, async (event) => {
      if (event.payload.status === "online") {
        // When coming back online, start sync process
        await offlineService.startSync();
      }
    });

    // Listen for conflict detection
    eventBus.subscribe(EventType.CONFLICT_DETECTED, async (event) => {
      console.log("Conflict detected:", event.payload);
      // In a real app, you might want to notify the user or take other actions
    });

    // Listen for conflict resolution
    eventBus.subscribe(EventType.CONFLICT_RESOLVED, async (event) => {
      console.log("Conflict resolved:", event.payload);
      // In a real app, you might want to update UI or take other actions
    });
  }

  /**
   * Queue an operation for synchronization
   * @param operation The operation to queue
   * @returns The ID of the queued operation
   */
  public async queueOperation(operation: SyncOperation): Promise<string> {
    const operationId = operation.id || uuidv4();

    // Determine sync status based on operation type
    let status: SyncStatus;
    switch (operation.operation) {
      case "create":
      case "update":
      case "delete":
        status = SyncStatus.PendingUpload;
        break;
      case "read":
        status = SyncStatus.PendingDownload;
        break;
      default:
        throw new Error(`Invalid operation type: ${operation.operation}`);
    }

    // Queue the operation
    const syncItemId = await offlineService.queueForSync({
      entityType: operation.entityType,
      entityId: operation.entityId,
      data: operation.data,
      status,
      priority: operation.priority,
      metadata: {
        ...operation.metadata,
        operation: operation.operation,
        endpoint: operation.endpoint,
        operationId,
      },
    });

    // If we're online, start sync immediately
    if (offlineService.isOnline()) {
      offlineService.startSync().catch((error) => {
        console.error("Error starting sync:", error);
      });
    }

    return operationId;
  }

  /**
   * Queue a create operation
   * @param entityType The type of entity
   * @param data The data to create
   * @param endpoint The API endpoint
   * @param priority The priority (higher numbers = higher priority)
   * @returns The ID of the queued operation
   */
  public async queueCreate(
    entityType: string,
    data: any,
    endpoint: string,
    priority: number = 5,
  ): Promise<string> {
    const entityId = data.id || uuidv4();

    return this.queueOperation({
      entityType,
      entityId,
      operation: "create",
      endpoint,
      data,
      priority,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Queue an update operation
   * @param entityType The type of entity
   * @param entityId The ID of the entity
   * @param data The data to update
   * @param endpoint The API endpoint
   * @param priority The priority (higher numbers = higher priority)
   * @returns The ID of the queued operation
   */
  public async queueUpdate(
    entityType: string,
    entityId: string,
    data: any,
    endpoint: string,
    priority: number = 5,
  ): Promise<string> {
    return this.queueOperation({
      entityType,
      entityId,
      operation: "update",
      endpoint,
      data,
      priority,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Queue a delete operation
   * @param entityType The type of entity
   * @param entityId The ID of the entity
   * @param endpoint The API endpoint
   * @param priority The priority (higher numbers = higher priority)
   * @returns The ID of the queued operation
   */
  public async queueDelete(
    entityType: string,
    entityId: string,
    endpoint: string,
    priority: number = 5,
  ): Promise<string> {
    return this.queueOperation({
      entityType,
      entityId,
      operation: "delete",
      endpoint,
      priority,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Queue a read operation
   * @param entityType The type of entity
   * @param entityId The ID of the entity
   * @param endpoint The API endpoint
   * @param priority The priority (higher numbers = higher priority)
   * @returns The ID of the queued operation
   */
  public async queueRead(
    entityType: string,
    entityId: string,
    endpoint: string,
    priority: number = 3,
  ): Promise<string> {
    return this.queueOperation({
      entityType,
      entityId,
      operation: "read",
      endpoint,
      priority,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Set conflict resolution strategy for an entity type
   * @param entityType The type of entity
   * @param strategy The conflict resolution strategy
   */
  public setConflictResolutionStrategy(
    entityType: string,
    strategy: ConflictResolutionStrategy,
  ): void {
    offlineService.setConflictResolutionStrategy(entityType, strategy);
  }
}

// Export singleton instance
export const syncQueueManager = SyncQueueManager.getInstance();
