/**
 * SynchronizationService
 *
 * Manages data synchronization between client and server with advanced features:
 * - Entity-specific sync handlers
 * - Transaction-based sync for data integrity
 * - Change tracking for efficient sync
 * - Conflict resolution with merge strategies
 * - Retry logic for failed operations
 */

import { v4 as uuidv4 } from "uuid";
import { eventBus, EventType } from "./eventBus";
import {
  offlineService,
  SyncStatus,
  ConflictResolutionStrategy,
} from "./offlineService";
import { syncQueueManager, SyncOperation } from "./SyncQueueManager";

// Entity types that can be synchronized
export enum SyncEntityType {
  BENEFICIARY = "beneficiary",
  ASSESSMENT = "assessment",
  PHOTO = "photo",
  MEASUREMENT = "measurement",
  ROOM = "room",
  RECOMMENDATION = "recommendation",
}

// Sync priority levels
export enum SyncPriority {
  CRITICAL = 10,
  HIGH = 8,
  MEDIUM = 5,
  LOW = 3,
  BACKGROUND = 1,
}

// Sync transaction status
export enum SyncTransactionStatus {
  PENDING = "pending",
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  FAILED = "failed",
  PARTIALLY_COMPLETED = "partially_completed",
}

// Sync transaction interface
export interface SyncTransaction {
  id: string;
  operations: SyncOperation[];
  status: SyncTransactionStatus;
  startTime?: string;
  endTime?: string;
  progress?: number;
  error?: string;
  metadata?: Record<string, any>;
}

// Sync history entry interface
export interface SyncHistoryEntry {
  id: string;
  timestamp: string;
  entityType: SyncEntityType;
  entityId: string;
  operation: string;
  status: SyncStatus;
  error?: string;
  details?: Record<string, any>;
}

// Sync conflict interface
export interface SyncConflict {
  id: string;
  entityType: SyncEntityType;
  entityId: string;
  clientData: any;
  serverData: any;
  timestamp: string;
  resolved: boolean;
  resolution?: ConflictResolutionStrategy;
  metadata?: Record<string, any>;
}

// Entity sync handler interface
export interface EntitySyncHandler {
  entityType: SyncEntityType;
  handleSync(operation: SyncOperation): Promise<boolean>;
  resolveConflict(conflict: SyncConflict): Promise<boolean>;
  getPendingChanges(): Promise<SyncOperation[]>;
}

// Bandwidth usage settings
export interface BandwidthSettings {
  enabled: boolean;
  highBandwidthThreshold: number; // in Mbps
  lowBandwidthThreshold: number; // in Mbps
  highBandwidthSyncTypes: SyncEntityType[];
  lowBandwidthSyncTypes: SyncEntityType[];
}

// Sync configuration interface
export interface SyncConfig {
  autoSync: boolean;
  syncInterval: number; // in milliseconds
  maxRetries: number;
  retryDelay: number; // in milliseconds
  batchSize: number;
  conflictResolution: Record<SyncEntityType, ConflictResolutionStrategy>;
  bandwidthAware: BandwidthSettings;
}

/**
 * SynchronizationService class
 * Manages the synchronization of data between client and server
 */
export class SynchronizationService {
  private static instance: SynchronizationService;
  private entityHandlers: Map<SyncEntityType, EntitySyncHandler> = new Map();
  private transactions: Map<string, SyncTransaction> = new Map();
  private syncHistory: SyncHistoryEntry[] = [];
  private conflicts: SyncConflict[] = [];
  private syncInProgress: boolean = false;
  private syncTimer: number | null = null;
  private retryTimers: Map<string, number> = new Map();
  private config: SyncConfig;
  private lastSyncTime: string | null = null;
  private networkStatus: boolean = navigator.onLine;
  private currentBandwidth: number | null = null;

  private constructor() {
    // Default configuration
    this.config = {
      autoSync: true,
      syncInterval: 60000, // 1 minute
      maxRetries: 5,
      retryDelay: 5000, // 5 seconds
      batchSize: 10,
      conflictResolution: {
        [SyncEntityType.BENEFICIARY]:
          ConflictResolutionStrategy.LastModifiedWins,
        [SyncEntityType.ASSESSMENT]: ConflictResolutionStrategy.MergeByField,
        [SyncEntityType.PHOTO]: ConflictResolutionStrategy.ClientWins,
        [SyncEntityType.MEASUREMENT]:
          ConflictResolutionStrategy.LastModifiedWins,
        [SyncEntityType.ROOM]: ConflictResolutionStrategy.MergeByField,
        [SyncEntityType.RECOMMENDATION]:
          ConflictResolutionStrategy.MergeByField,
      },
      bandwidthAware: {
        enabled: true,
        highBandwidthThreshold: 1.0, // 1 Mbps
        lowBandwidthThreshold: 0.2, // 200 Kbps
        highBandwidthSyncTypes: Object.values(SyncEntityType),
        lowBandwidthSyncTypes: [
          SyncEntityType.ASSESSMENT,
          SyncEntityType.BENEFICIARY,
        ], // Only sync critical data on low bandwidth
      },
    };

    // Initialize event listeners
    this.initEventListeners();

    // Start auto sync if enabled
    if (this.config.autoSync) {
      this.startAutoSync();
    }

    // Initialize bandwidth monitoring
    this.initBandwidthMonitoring();
  }

  /**
   * Get the singleton instance
   */
  public static getInstance(): SynchronizationService {
    if (!SynchronizationService.instance) {
      SynchronizationService.instance = new SynchronizationService();
    }
    return SynchronizationService.instance;
  }

  /**
   * Initialize event listeners
   */
  private initEventListeners(): void {
    // Listen for network status changes
    eventBus.subscribe(EventType.NETWORK_STATUS_CHANGED, async (event) => {
      this.networkStatus = event.payload.status === "online";

      if (this.networkStatus) {
        // When coming back online, start sync process
        this.syncAll();
      } else {
        // When going offline, stop any ongoing sync
        this.stopAutoSync();
      }
    });

    // Listen for conflict detection
    eventBus.subscribe(EventType.CONFLICT_DETECTED, async (event) => {
      const { item, error } = event.payload;

      // Create a conflict record
      const conflict: SyncConflict = {
        id: uuidv4(),
        entityType: item.entityType as SyncEntityType,
        entityId: item.entityId,
        clientData: item.data,
        serverData: null, // Will be populated when resolving
        timestamp: new Date().toISOString(),
        resolved: false,
        metadata: item.metadata,
      };

      this.conflicts.push(conflict);

      // Publish conflict event for UI
      eventBus.publish({
        id: uuidv4(),
        type: EventType.CONFLICT_DETECTED,
        timestamp: new Date().toISOString(),
        source: "synchronizationService",
        payload: { conflict },
      });
    });

    // Listen for conflict resolution
    eventBus.subscribe(EventType.CONFLICT_RESOLVED, async (event) => {
      const { item, resolution } = event.payload;

      // Update conflict record
      const conflictIndex = this.conflicts.findIndex(
        (c) => c.entityType === item.entityType && c.entityId === item.entityId,
      );

      if (conflictIndex >= 0) {
        this.conflicts[conflictIndex].resolved = true;
        this.conflicts[conflictIndex].resolution = resolution;

        // Add to sync history
        this.addToSyncHistory({
          id: uuidv4(),
          timestamp: new Date().toISOString(),
          entityType: item.entityType as SyncEntityType,
          entityId: item.entityId,
          operation: "conflict_resolution",
          status: SyncStatus.Synced,
          details: { resolution },
        });
      }
    });
  }

  /**
   * Initialize bandwidth monitoring
   */
  private initBandwidthMonitoring(): void {
    if (!this.config.bandwidthAware.enabled) return;

    // Use the Network Information API if available
    const connection = (navigator as any).connection;

    if (connection) {
      const updateBandwidth = () => {
        if (connection.downlink) {
          this.currentBandwidth = connection.downlink; // in Mbps
        }
      };

      connection.addEventListener("change", updateBandwidth);
      updateBandwidth();
    } else {
      // Fallback: estimate bandwidth by downloading a small file
      this.estimateBandwidth();

      // Periodically re-estimate bandwidth
      setInterval(() => this.estimateBandwidth(), 60000); // Every minute
    }
  }

  /**
   * Estimate bandwidth by downloading a small file
   */
  private async estimateBandwidth(): Promise<void> {
    if (!this.networkStatus) return;

    try {
      const startTime = Date.now();
      const response = await fetch(
        "/assets/bandwidth-test.json?nocache=" + startTime,
      );
      const data = await response.text();
      const endTime = Date.now();

      const fileSizeInBits = data.length * 8;
      const durationInSeconds = (endTime - startTime) / 1000;
      const speedMbps = fileSizeInBits / durationInSeconds / 1000000;

      this.currentBandwidth = speedMbps;
    } catch (error) {
      console.error("Error estimating bandwidth:", error);
    }
  }

  /**
   * Register an entity sync handler
   */
  public registerEntityHandler(handler: EntitySyncHandler): void {
    this.entityHandlers.set(handler.entityType, handler);
  }

  /**
   * Update sync configuration
   */
  public updateConfig(config: Partial<SyncConfig>): void {
    this.config = { ...this.config, ...config };

    // Restart auto sync if needed
    if (this.syncTimer) {
      this.stopAutoSync();
      if (this.config.autoSync) {
        this.startAutoSync();
      }
    } else if (this.config.autoSync) {
      this.startAutoSync();
    }
  }

  /**
   * Start automatic synchronization
   */
  public startAutoSync(): void {
    if (this.syncTimer !== null) {
      this.stopAutoSync();
    }

    this.syncTimer = window.setInterval(() => {
      if (this.networkStatus && !this.syncInProgress) {
        this.syncAll();
      }
    }, this.config.syncInterval);

    // Publish event
    eventBus.publish({
      id: uuidv4(),
      type: EventType.SYNC_STARTED,
      timestamp: new Date().toISOString(),
      source: "synchronizationService",
      payload: { mode: "auto", interval: this.config.syncInterval },
    });
  }

  /**
   * Stop automatic synchronization
   */
  public stopAutoSync(): void {
    if (this.syncTimer !== null) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;

      // Publish event
      eventBus.publish({
        id: uuidv4(),
        type: EventType.SYNC_COMPLETED,
        timestamp: new Date().toISOString(),
        source: "synchronizationService",
        payload: { mode: "auto", status: "stopped" },
      });
    }
  }

  /**
   * Synchronize all pending changes
   */
  public async syncAll(): Promise<boolean> {
    if (this.syncInProgress || !this.networkStatus) {
      return false;
    }

    this.syncInProgress = true;
    let success = true;

    try {
      // Publish sync started event
      eventBus.publish({
        id: uuidv4(),
        type: EventType.SYNC_STARTED,
        timestamp: new Date().toISOString(),
        source: "synchronizationService",
        payload: { mode: "manual" },
      });

      // Get all pending operations from sync queue manager
      await offlineService.startSync();

      this.lastSyncTime = new Date().toISOString();
    } catch (error) {
      console.error("Error during sync:", error);
      success = false;

      // Publish sync error event
      eventBus.publish({
        id: uuidv4(),
        type: EventType.SYNC_COMPLETED,
        timestamp: new Date().toISOString(),
        source: "synchronizationService",
        payload: {
          mode: "manual",
          status: "error",
          error: error instanceof Error ? error.message : String(error),
        },
      });
    } finally {
      this.syncInProgress = false;
    }

    return success;
  }

  /**
   * Synchronize specific entity types
   */
  public async syncEntityTypes(
    entityTypes: SyncEntityType[],
  ): Promise<boolean> {
    if (this.syncInProgress || !this.networkStatus) {
      return false;
    }

    this.syncInProgress = true;
    let success = true;

    try {
      // Publish sync started event
      eventBus.publish({
        id: uuidv4(),
        type: EventType.SYNC_STARTED,
        timestamp: new Date().toISOString(),
        source: "synchronizationService",
        payload: { mode: "partial", entityTypes },
      });

      // Filter operations by entity type
      for (const entityType of entityTypes) {
        const handler = this.entityHandlers.get(entityType);
        if (handler) {
          const operations = await handler.getPendingChanges();
          for (const operation of operations) {
            await syncQueueManager.queueOperation(operation);
          }
        }
      }

      // Start sync for these operations
      await offlineService.startSync();

      this.lastSyncTime = new Date().toISOString();
    } catch (error) {
      console.error("Error during partial sync:", error);
      success = false;

      // Publish sync error event
      eventBus.publish({
        id: uuidv4(),
        type: EventType.SYNC_COMPLETED,
        timestamp: new Date().toISOString(),
        source: "synchronizationService",
        payload: {
          mode: "partial",
          status: "error",
          entityTypes,
          error: error instanceof Error ? error.message : String(error),
        },
      });
    } finally {
      this.syncInProgress = false;
    }

    return success;
  }

  /**
   * Create a sync transaction with multiple operations
   */
  public async createTransaction(operations: SyncOperation[]): Promise<string> {
    const transactionId = uuidv4();

    const transaction: SyncTransaction = {
      id: transactionId,
      operations,
      status: SyncTransactionStatus.PENDING,
      metadata: {
        createdAt: new Date().toISOString(),
        operationCount: operations.length,
      },
    };

    this.transactions.set(transactionId, transaction);

    return transactionId;
  }

  /**
   * Execute a sync transaction
   */
  public async executeTransaction(transactionId: string): Promise<boolean> {
    const transaction = this.transactions.get(transactionId);
    if (!transaction) {
      throw new Error(`Transaction ${transactionId} not found`);
    }

    if (transaction.status === SyncTransactionStatus.IN_PROGRESS) {
      return false; // Already in progress
    }

    // Update transaction status
    transaction.status = SyncTransactionStatus.IN_PROGRESS;
    transaction.startTime = new Date().toISOString();
    transaction.progress = 0;

    try {
      let completedCount = 0;

      // Queue all operations
      for (const operation of transaction.operations) {
        await syncQueueManager.queueOperation(operation);
        completedCount++;
        transaction.progress =
          (completedCount / transaction.operations.length) * 100;
      }

      // Start sync
      if (this.networkStatus) {
        await offlineService.startSync();
      }

      // Update transaction status
      transaction.status = SyncTransactionStatus.COMPLETED;
      transaction.endTime = new Date().toISOString();
      transaction.progress = 100;

      return true;
    } catch (error) {
      // Update transaction status
      transaction.status = SyncTransactionStatus.FAILED;
      transaction.endTime = new Date().toISOString();
      transaction.error =
        error instanceof Error ? error.message : String(error);

      return false;
    }
  }

  /**
   * Resolve a sync conflict
   */
  public async resolveConflict(
    conflictId: string,
    resolution: ConflictResolutionStrategy,
  ): Promise<boolean> {
    const conflictIndex = this.conflicts.findIndex((c) => c.id === conflictId);
    if (conflictIndex === -1) {
      throw new Error(`Conflict ${conflictId} not found`);
    }

    const conflict = this.conflicts[conflictIndex];
    if (conflict.resolved) {
      return true; // Already resolved
    }

    // Get entity handler
    const handler = this.entityHandlers.get(conflict.entityType);
    if (!handler) {
      throw new Error(
        `No handler registered for entity type ${conflict.entityType}`,
      );
    }

    // Update conflict
    conflict.resolution = resolution;

    // Resolve conflict using handler
    const success = await handler.resolveConflict(conflict);

    if (success) {
      conflict.resolved = true;

      // Add to sync history
      this.addToSyncHistory({
        id: uuidv4(),
        timestamp: new Date().toISOString(),
        entityType: conflict.entityType,
        entityId: conflict.entityId,
        operation: "conflict_resolution",
        status: SyncStatus.Synced,
        details: { resolution },
      });

      // Publish conflict resolved event
      eventBus.publish({
        id: uuidv4(),
        type: EventType.CONFLICT_RESOLVED,
        timestamp: new Date().toISOString(),
        source: "synchronizationService",
        payload: {
          conflictId,
          entityType: conflict.entityType,
          entityId: conflict.entityId,
          resolution,
        },
      });
    }

    return success;
  }

  /**
   * Add an entry to the sync history
   */
  private addToSyncHistory(entry: SyncHistoryEntry): void {
    this.syncHistory.push(entry);

    // Limit history size
    if (this.syncHistory.length > 1000) {
      this.syncHistory = this.syncHistory.slice(-1000);
    }
  }

  /**
   * Get sync history
   */
  public getSyncHistory(limit: number = 100): SyncHistoryEntry[] {
    return this.syncHistory.slice(-limit).reverse();
  }

  /**
   * Get unresolved conflicts
   */
  public getUnresolvedConflicts(): SyncConflict[] {
    return this.conflicts.filter((c) => !c.resolved);
  }

  /**
   * Get sync status
   */
  public getSyncStatus(): {
    lastSyncTime: string | null;
    syncInProgress: boolean;
    networkStatus: boolean;
    autoSyncEnabled: boolean;
    pendingOperations: number;
    unresolvedConflicts: number;
    bandwidth: number | null;
  } {
    return {
      lastSyncTime: this.lastSyncTime,
      syncInProgress: this.syncInProgress,
      networkStatus: this.networkStatus,
      autoSyncEnabled: this.config.autoSync,
      pendingOperations: 0, // This would need to be calculated from the sync queue
      unresolvedConflicts: this.conflicts.filter((c) => !c.resolved).length,
      bandwidth: this.currentBandwidth,
    };
  }

  /**
   * Get entity types that can be synced based on current bandwidth
   */
  public getSyncableEntityTypes(): SyncEntityType[] {
    if (!this.config.bandwidthAware.enabled || this.currentBandwidth === null) {
      return Object.values(SyncEntityType);
    }

    if (
      this.currentBandwidth >= this.config.bandwidthAware.highBandwidthThreshold
    ) {
      return this.config.bandwidthAware.highBandwidthSyncTypes;
    } else if (
      this.currentBandwidth >= this.config.bandwidthAware.lowBandwidthThreshold
    ) {
      // Medium bandwidth - exclude large data types like photos
      return Object.values(SyncEntityType).filter(
        (type) => type !== SyncEntityType.PHOTO,
      );
    } else {
      return this.config.bandwidthAware.lowBandwidthSyncTypes;
    }
  }
}

// Export singleton instance
export const synchronizationService = SynchronizationService.getInstance();
