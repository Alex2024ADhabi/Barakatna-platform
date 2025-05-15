// Offline Service for Barakatna Platform
// Implements a comprehensive offline data management strategy
// Provides selective data synchronization

import { eventBus, EventType } from "./eventBus";
import { v4 as uuidv4 } from "uuid";
import { ClientType } from "../lib/forms/types";

// Define sync status enum
export enum SyncStatus {
  Synced = "synced",
  PendingUpload = "pending_upload",
  PendingDownload = "pending_download",
  Conflict = "conflict",
  Error = "error",
}

// Define conflict resolution strategy
export enum ConflictResolutionStrategy {
  ClientWins = "client_wins",
  ServerWins = "server_wins",
  Manual = "manual",
  MergeByField = "merge_by_field",
  LastModifiedWins = "last_modified_wins",
}

// Define schema version for data migration
export interface SchemaVersion {
  version: number;
  timestamp: string;
  description: string;
  migrations: Array<{
    entityType: string;
    transform: (data: any) => any;
  }>;
}

// Define sync item interface
export interface SyncItem {
  id: string;
  entityType: string;
  entityId: string;
  data: any;
  lastModified: Date;
  status: SyncStatus;
  priority: number;
  error?: string;
  retryCount: number;
  serverVersion?: string; // For conflict detection
  clientVersion?: string; // For conflict detection
  conflictResolution?: ConflictResolutionStrategy;
}

// Define storage quota info
export interface StorageQuotaInfo {
  usage: number; // in bytes
  quota: number; // in bytes
  percentage: number; // usage as percentage of quota
}

// Define offline storage interface
export interface OfflineStorage {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T): Promise<void>;
  remove(key: string): Promise<void>;
  clear(): Promise<void>;
  keys(): Promise<string[]>;
  getByPrefix(prefix: string): Promise<Record<string, any>>;
  getStorageEstimate(): Promise<StorageQuotaInfo>;
}

// IndexedDB implementation of OfflineStorage
export class IndexedDBStorage implements OfflineStorage {
  private dbName: string;
  private storeName: string;
  private db: IDBDatabase | null = null;
  private dbVersion: number;
  private schemaVersions: SchemaVersion[] = [];

  constructor(dbName: string, storeName: string, dbVersion: number = 1) {
    this.dbName = dbName;
    this.storeName = storeName;
    this.dbVersion = dbVersion;
  }

  // Register schema versions for migrations
  public registerSchemaVersion(schemaVersion: SchemaVersion): void {
    this.schemaVersions.push(schemaVersion);
    this.schemaVersions.sort((a, b) => a.version - b.version);
  }

  private async openDatabase(): Promise<IDBDatabase> {
    if (this.db) {
      return this.db;
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        reject(new Error("Failed to open database"));
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve(request.result);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const oldVersion = event.oldVersion;

        // Create object store if it doesn't exist
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName);
        }

        // Apply migrations if needed
        const applicableMigrations = this.schemaVersions.filter(
          (sv) => sv.version > oldVersion && sv.version <= this.dbVersion,
        );

        if (applicableMigrations.length > 0) {
          console.log(`Applying ${applicableMigrations.length} migrations...`);
          // Migrations will be applied after the database is opened
          // We'll store the migrations to apply in a separate store
          const migrationStore = db.objectStoreNames.contains("_migrations")
            ? db
                .transaction("_migrations", "readwrite")
                .objectStore("_migrations")
            : db.createObjectStore("_migrations");

          migrationStore.put(applicableMigrations, "pendingMigrations");
        }
      };
    });
  }

  // Apply pending migrations
  private async applyPendingMigrations(): Promise<void> {
    const db = await this.openDatabase();
    if (!db.objectStoreNames.contains("_migrations")) {
      return;
    }

    const pendingMigrations = await new Promise<SchemaVersion[] | null>(
      (resolve, reject) => {
        const transaction = db.transaction("_migrations", "readwrite");
        const store = transaction.objectStore("_migrations");
        const request = store.get("pendingMigrations");

        request.onerror = () =>
          reject(new Error("Failed to get pending migrations"));
        request.onsuccess = () => resolve(request.result || null);
      },
    );

    if (!pendingMigrations) return;

    // Get all data that needs migration
    const allData = await this.getAll();
    const updatedData: Record<string, any> = {};

    // Apply migrations to each entity
    for (const migration of pendingMigrations) {
      for (const { entityType, transform } of migration.migrations) {
        // Find all keys for this entity type
        const entityKeys = Object.keys(allData).filter((key) =>
          key.startsWith(`${entityType}:`),
        );

        for (const key of entityKeys) {
          try {
            updatedData[key] = transform(allData[key]);
          } catch (error) {
            console.error(`Migration failed for ${key}:`, error);
          }
        }
      }
    }

    // Save all updated data
    for (const [key, value] of Object.entries(updatedData)) {
      await this.set(key, value);
    }

    // Clear pending migrations
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction("_migrations", "readwrite");
      const store = transaction.objectStore("_migrations");
      const request = store.delete("pendingMigrations");

      request.onerror = () =>
        reject(new Error("Failed to clear pending migrations"));
      request.onsuccess = () => resolve();
    });

    console.log("Migrations applied successfully");
  }

  // Get all data from storage
  private async getAll(): Promise<Record<string, any>> {
    const db = await this.openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, "readonly");
      const store = transaction.objectStore(this.storeName);
      const request = store.getAll();
      const keyRequest = store.getAllKeys();
      const result: Record<string, any> = {};

      keyRequest.onerror = () => {
        reject(new Error("Failed to get all keys"));
      };

      request.onerror = () => {
        reject(new Error("Failed to get all values"));
      };

      transaction.oncomplete = () => {
        const keys = keyRequest.result;
        const values = request.result;

        for (let i = 0; i < keys.length; i++) {
          result[String(keys[i])] = values[i];
        }

        resolve(result);
      };
    });
  }

  async get<T>(key: string): Promise<T | null> {
    const db = await this.openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, "readonly");
      const store = transaction.objectStore(this.storeName);
      const request = store.get(key);

      request.onerror = () => {
        reject(new Error(`Failed to get item with key: ${key}`));
      };

      request.onsuccess = () => {
        resolve(request.result || null);
      };
    });
  }

  async set<T>(key: string, value: T): Promise<void> {
    const db = await this.openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, "readwrite");
      const store = transaction.objectStore(this.storeName);
      const request = store.put(value, key);

      request.onerror = () => {
        reject(new Error(`Failed to set item with key: ${key}`));
      };

      request.onsuccess = () => {
        resolve();
      };
    });
  }

  async remove(key: string): Promise<void> {
    const db = await this.openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, "readwrite");
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(key);

      request.onerror = () => {
        reject(new Error(`Failed to remove item with key: ${key}`));
      };

      request.onsuccess = () => {
        resolve();
      };
    });
  }

  async clear(): Promise<void> {
    const db = await this.openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, "readwrite");
      const store = transaction.objectStore(this.storeName);
      const request = store.clear();

      request.onerror = () => {
        reject(new Error("Failed to clear storage"));
      };

      request.onsuccess = () => {
        resolve();
      };
    });
  }

  async keys(): Promise<string[]> {
    const db = await this.openDatabase();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, "readonly");
      const store = transaction.objectStore(this.storeName);
      const request = store.getAllKeys();

      request.onerror = () => {
        reject(new Error("Failed to get keys"));
      };

      request.onsuccess = () => {
        resolve(Array.from(request.result).map((key) => String(key)));
      };
    });
  }

  async getByPrefix(prefix: string): Promise<Record<string, any>> {
    const allKeys = await this.keys();
    const matchingKeys = allKeys.filter((key) => key.startsWith(prefix));
    const result: Record<string, any> = {};

    for (const key of matchingKeys) {
      const value = await this.get(key);
      if (value !== null) {
        result[key] = value;
      }
    }

    return result;
  }

  async getStorageEstimate(): Promise<StorageQuotaInfo> {
    if (navigator.storage && navigator.storage.estimate) {
      const estimate = await navigator.storage.estimate();
      const usage = estimate.usage || 0;
      const quota = estimate.quota || 0;
      const percentage = quota > 0 ? (usage / quota) * 100 : 0;

      return { usage, quota, percentage };
    }

    // Fallback for browsers that don't support the Storage API
    return { usage: 0, quota: 0, percentage: 0 };
  }
}

// Offline Service class
class OfflineServiceClass {
  private storage: OfflineStorage;
  private syncQueue: SyncItem[] = [];
  private isSyncing: boolean = false;
  private networkStatus: boolean = navigator.onLine;
  private syncInterval: number | null = null;
  private maxStoragePercentage: number = 90; // Maximum storage usage percentage
  private cleanupThreshold: number = 80; // Percentage at which to start cleanup
  private entityManagers: Map<string, any> = new Map();
  private conflictResolutionStrategies: Map<
    string,
    ConflictResolutionStrategy
  > = new Map();

  constructor(storage: OfflineStorage) {
    this.storage = storage;
    this.initNetworkListeners();
    this.monitorStorageUsage();
  }

  // Register an entity manager
  public registerEntityManager(entityType: string, manager: any): void {
    this.entityManagers.set(entityType, manager);
  }

  // Set conflict resolution strategy for an entity type
  public setConflictResolutionStrategy(
    entityType: string,
    strategy: ConflictResolutionStrategy,
  ): void {
    this.conflictResolutionStrategies.set(entityType, strategy);
  }

  // Get conflict resolution strategy for an entity type
  public getConflictResolutionStrategy(
    entityType: string,
  ): ConflictResolutionStrategy {
    return (
      this.conflictResolutionStrategies.get(entityType) ||
      ConflictResolutionStrategy.LastModifiedWins
    );
  }

  private initNetworkListeners(): void {
    window.addEventListener("online", () => {
      this.networkStatus = true;
      this.startSync();

      // Publish network status change event
      eventBus.publish({
        id: uuidv4(),
        type: EventType.NETWORK_STATUS_CHANGED,
        timestamp: new Date().toISOString(),
        source: "offlineService",
        payload: { status: "online" },
      });
    });

    window.addEventListener("offline", () => {
      this.networkStatus = false;
      this.stopSync();

      // Publish network status change event
      eventBus.publish({
        id: uuidv4(),
        type: EventType.NETWORK_STATUS_CHANGED,
        timestamp: new Date().toISOString(),
        source: "offlineService",
        payload: { status: "offline" },
      });
    });
  }

  // Monitor storage usage and cleanup if needed
  private async monitorStorageUsage(): Promise<void> {
    try {
      const quotaInfo = await this.storage.getStorageEstimate();

      if (quotaInfo.percentage > this.cleanupThreshold) {
        await this.performStorageCleanup(quotaInfo);
      }

      // Check again in 5 minutes
      setTimeout(() => this.monitorStorageUsage(), 5 * 60 * 1000);
    } catch (error) {
      console.error("Error monitoring storage usage:", error);
    }
  }

  // Perform storage cleanup when approaching quota limits
  private async performStorageCleanup(
    quotaInfo: StorageQuotaInfo,
  ): Promise<void> {
    if (quotaInfo.percentage <= this.cleanupThreshold) {
      return; // No cleanup needed
    }

    console.log(
      `Storage usage at ${quotaInfo.percentage.toFixed(1)}%, performing cleanup...`,
    );

    try {
      // 1. Remove old sync queue items that are in error state
      const keys = await this.storage.keys();
      const syncQueueKeys = keys.filter((key) => key.startsWith("syncQueue:"));

      for (const key of syncQueueKeys) {
        const item = await this.storage.get<SyncItem>(key);
        if (item && item.status === SyncStatus.Error && item.retryCount >= 5) {
          await this.storage.remove(key);
        }
      }

      // 2. Remove old cached data based on last access time
      // This would require tracking last access time for each item
      // For now, we'll just log that we would do this
      console.log("Would remove old cached data based on last access time");

      // 3. Check if we're still over threshold
      const updatedQuotaInfo = await this.storage.getStorageEstimate();
      if (updatedQuotaInfo.percentage > this.maxStoragePercentage) {
        // Emergency cleanup - remove non-essential data
        console.warn(
          `Storage still at ${updatedQuotaInfo.percentage.toFixed(1)}%, performing emergency cleanup`,
        );

        // Notify about storage issues
        eventBus.publish({
          id: uuidv4(),
          type: EventType.STORAGE_QUOTA_WARNING,
          timestamp: new Date().toISOString(),
          source: "offlineService",
          payload: { quotaInfo: updatedQuotaInfo },
        });
      }
    } catch (error) {
      console.error("Error during storage cleanup:", error);
    }
  }

  // Start automatic sync
  public startAutoSync(intervalMs: number = 30000): void {
    if (this.syncInterval !== null) {
      this.stopAutoSync();
    }

    this.syncInterval = window.setInterval(() => {
      if (this.networkStatus) {
        this.startSync();
      }
    }, intervalMs);
  }

  // Stop automatic sync
  public stopAutoSync(): void {
    if (this.syncInterval !== null) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  // Check if network is available
  public isOnline(): boolean {
    return this.networkStatus;
  }

  // Store data for offline use
  public async storeData<T>(
    entityType: string,
    entityId: string,
    data: T,
    version?: string,
  ): Promise<void> {
    const key = `${entityType}:${entityId}`;

    // Add metadata for versioning and conflict detection
    const dataWithMeta = {
      _data: data,
      _meta: {
        entityType,
        entityId,
        version: version || uuidv4(),
        lastModified: new Date().toISOString(),
        lastAccessed: new Date().toISOString(),
      },
    };

    await this.storage.set(key, dataWithMeta);
  }

  // Get stored data
  public async getData<T>(
    entityType: string,
    entityId: string,
  ): Promise<T | null> {
    const key = `${entityType}:${entityId}`;
    const result = await this.storage.get<{ _data: T; _meta: any }>(key);

    if (!result) return null;

    // Update last accessed time
    result._meta.lastAccessed = new Date().toISOString();
    await this.storage.set(key, result);

    return result._data;
  }

  // Get all data for an entity type
  public async getAllData<T>(entityType: string): Promise<Record<string, T>> {
    const prefix = `${entityType}:`;
    const allData = await this.storage.getByPrefix(prefix);
    const result: Record<string, T> = {};

    for (const [key, value] of Object.entries(allData)) {
      const entityId = key.substring(prefix.length);
      if (value && value._data) {
        result[entityId] = value._data;

        // Update last accessed time
        value._meta.lastAccessed = new Date().toISOString();
        await this.storage.set(key, value);
      }
    }

    return result;
  }

  // Remove stored data
  public async removeData(entityType: string, entityId: string): Promise<void> {
    const key = `${entityType}:${entityId}`;
    await this.storage.remove(key);
  }

  // Queue an item for sync
  public async queueForSync(
    item: Omit<SyncItem, "id" | "lastModified" | "retryCount">,
  ): Promise<string> {
    const id = `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const syncItem: SyncItem = {
      ...item,
      id,
      lastModified: new Date(),
      retryCount: 0,
    };

    this.syncQueue.push(syncItem);
    await this.storage.set(`syncQueue:${id}`, syncItem);

    // Publish event about queued item
    eventBus.publish({
      id: uuidv4(),
      type: EventType.REQUEST_QUEUED,
      timestamp: new Date().toISOString(),
      source: "offlineService",
      payload: { queueLength: this.syncQueue.length, request: syncItem },
    });

    if (this.networkStatus && !this.isSyncing) {
      this.startSync();
    }

    return id;
  }

  // Start sync process
  public async startSync(): Promise<void> {
    if (this.isSyncing || !this.networkStatus) {
      return;
    }

    this.isSyncing = true;

    // Publish sync started event
    eventBus.publish({
      id: uuidv4(),
      type: EventType.SYNC_STARTED,
      timestamp: new Date().toISOString(),
      source: "offlineService",
      payload: { queueLength: this.syncQueue.length },
    });

    try {
      // Load sync queue from storage if empty
      if (this.syncQueue.length === 0) {
        await this.loadSyncQueue();
      }

      // Sort by priority and retry count
      this.syncQueue.sort((a, b) => {
        if (a.priority !== b.priority) {
          return b.priority - a.priority; // Higher priority first
        }
        return a.retryCount - b.retryCount; // Fewer retries first
      });

      let successCount = 0;
      let failureCount = 0;
      let conflictCount = 0;

      // Process queue
      for (const item of [...this.syncQueue]) {
        try {
          await this.processSyncItem(item);

          // Remove from queue on success
          this.syncQueue = this.syncQueue.filter((i) => i.id !== item.id);
          await this.storage.remove(`syncQueue:${item.id}`);
          successCount++;
        } catch (error) {
          // Check if it's a conflict
          if (error instanceof Error && error.message.includes("conflict")) {
            conflictCount++;
            // Handle conflict based on strategy
            await this.handleConflict(item, error);
          } else {
            // Update retry count and error
            const updatedItem = {
              ...item,
              retryCount: item.retryCount + 1,
              error: error instanceof Error ? error.message : String(error),
              status: item.retryCount >= 3 ? SyncStatus.Error : item.status,
            };

            // Update in queue and storage
            const index = this.syncQueue.findIndex((i) => i.id === item.id);
            if (index >= 0) {
              this.syncQueue[index] = updatedItem;
            }
            await this.storage.set(`syncQueue:${item.id}`, updatedItem);
            failureCount++;
          }

          // Stop processing if network is lost
          if (!this.networkStatus) {
            break;
          }
        }
      }

      // Publish sync completed event
      eventBus.publish({
        id: uuidv4(),
        type: EventType.SYNC_COMPLETED,
        timestamp: new Date().toISOString(),
        source: "offlineService",
        payload: {
          processed: successCount + failureCount + conflictCount,
          successful: successCount,
          failed: failureCount,
          conflicts: conflictCount,
          remaining: this.syncQueue.length,
        },
      });
    } finally {
      this.isSyncing = false;
    }
  }

  // Handle conflict based on strategy
  private async handleConflict(item: SyncItem, error: Error): Promise<void> {
    const strategy =
      item.conflictResolution ||
      this.getConflictResolutionStrategy(item.entityType);

    switch (strategy) {
      case ConflictResolutionStrategy.ClientWins:
        // Force client data to win
        await this.forceUploadData(item);
        break;

      case ConflictResolutionStrategy.ServerWins:
        // Get server data and overwrite local
        await this.forceDownloadData(item);
        break;

      case ConflictResolutionStrategy.LastModifiedWins:
        // Compare timestamps and let the most recent win
        await this.resolveByTimestamp(item);
        break;

      case ConflictResolutionStrategy.MergeByField:
        // Merge data field by field
        await this.mergeData(item);
        break;

      case ConflictResolutionStrategy.Manual:
      default:
        // Mark as conflict for manual resolution
        item.status = SyncStatus.Conflict;
        await this.storage.set(`syncQueue:${item.id}`, item);

        // Publish conflict event
        eventBus.publish({
          id: uuidv4(),
          type: EventType.CONFLICT_DETECTED,
          timestamp: new Date().toISOString(),
          source: "offlineService",
          payload: { item, error: error.message },
        });
        break;
    }
  }

  // Force client data to overwrite server data
  private async forceUploadData(item: SyncItem): Promise<void> {
    // In a real implementation, this would make an API call with force flag
    console.log(
      `Force uploading client data for ${item.entityType}:${item.entityId}`,
    );

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Mark as synced
    item.status = SyncStatus.Synced;
    await this.storage.set(`syncQueue:${item.id}`, item);

    // Publish resolution event
    eventBus.publish({
      id: uuidv4(),
      type: EventType.CONFLICT_RESOLVED,
      timestamp: new Date().toISOString(),
      source: "offlineService",
      payload: { item, resolution: "client_wins" },
    });
  }

  // Force server data to overwrite client data
  private async forceDownloadData(item: SyncItem): Promise<void> {
    // In a real implementation, this would make an API call to get server data
    console.log(
      `Force downloading server data for ${item.entityType}:${item.entityId}`,
    );

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Mark as synced
    item.status = SyncStatus.Synced;
    await this.storage.set(`syncQueue:${item.id}`, item);

    // Publish resolution event
    eventBus.publish({
      id: uuidv4(),
      type: EventType.CONFLICT_RESOLVED,
      timestamp: new Date().toISOString(),
      source: "offlineService",
      payload: { item, resolution: "server_wins" },
    });
  }

  // Resolve conflict by comparing timestamps
  private async resolveByTimestamp(item: SyncItem): Promise<void> {
    // In a real implementation, this would compare client and server timestamps
    console.log(
      `Resolving by timestamp for ${item.entityType}:${item.entityId}`,
    );

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Mark as synced
    item.status = SyncStatus.Synced;
    await this.storage.set(`syncQueue:${item.id}`, item);

    // Publish resolution event
    eventBus.publish({
      id: uuidv4(),
      type: EventType.CONFLICT_RESOLVED,
      timestamp: new Date().toISOString(),
      source: "offlineService",
      payload: { item, resolution: "timestamp_based" },
    });
  }

  // Merge client and server data field by field
  private async mergeData(item: SyncItem): Promise<void> {
    // In a real implementation, this would merge client and server data
    console.log(`Merging data for ${item.entityType}:${item.entityId}`);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Mark as synced
    item.status = SyncStatus.Synced;
    await this.storage.set(`syncQueue:${item.id}`, item);

    // Publish resolution event
    eventBus.publish({
      id: uuidv4(),
      type: EventType.CONFLICT_RESOLVED,
      timestamp: new Date().toISOString(),
      source: "offlineService",
      payload: { item, resolution: "merged" },
    });
  }

  // Stop sync process
  public stopSync(): void {
    // This method doesn't actually stop in-progress sync operations
    // It just prevents new ones from starting
    this.isSyncing = false;
  }

  // Process a single sync item
  private async processSyncItem(item: SyncItem): Promise<void> {
    // Check if we have a specialized entity manager for this type
    const entityManager = this.entityManagers.get(item.entityType);
    if (entityManager && typeof entityManager.processSyncItem === "function") {
      // Let the entity manager handle it
      await entityManager.processSyncItem(item);
      return;
    }

    // Default processing if no specialized manager
    switch (item.status) {
      case SyncStatus.PendingUpload:
        await this.uploadData(item);
        break;
      case SyncStatus.PendingDownload:
        await this.downloadData(item);
        break;
      case SyncStatus.Conflict:
        await this.resolveConflict(item);
        break;
      default:
        // Skip already synced or error items
        break;
    }
  }

  // Upload data to server
  private async uploadData(item: SyncItem): Promise<void> {
    // In a real implementation, this would make an API call to upload the data
    console.log(`Uploading data for ${item.entityType}:${item.entityId}`);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Update local data with server response if needed
    // await this.storeData(item.entityType, item.entityId, updatedData);

    // Publish success event
    eventBus.publish({
      id: uuidv4(),
      type: EventType.OFFLINE_REQUEST_PROCESSED,
      timestamp: new Date().toISOString(),
      source: "offlineService",
      payload: { success: true, request: item },
    });
  }

  // Download data from server
  private async downloadData(item: SyncItem): Promise<void> {
    // In a real implementation, this would make an API call to download the data
    console.log(`Downloading data for ${item.entityType}:${item.entityId}`);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Store downloaded data
    // await this.storeData(item.entityType, item.entityId, downloadedData);

    // Publish success event
    eventBus.publish({
      id: uuidv4(),
      type: EventType.OFFLINE_REQUEST_PROCESSED,
      timestamp: new Date().toISOString(),
      source: "offlineService",
      payload: { success: true, request: item },
    });
  }

  // Resolve conflict between local and server data
  private async resolveConflict(item: SyncItem): Promise<void> {
    // In a real implementation, this would implement a conflict resolution strategy
    console.log(`Resolving conflict for ${item.entityType}:${item.entityId}`);

    // Simulate conflict resolution
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Store resolved data
    // await this.storeData(item.entityType, item.entityId, resolvedData);

    // Publish resolution event
    eventBus.publish({
      id: uuidv4(),
      type: EventType.CONFLICT_RESOLVED,
      timestamp: new Date().toISOString(),
      source: "offlineService",
      payload: { item, resolution: "automatic" },
    });
  }

  // Load sync queue from storage
  private async loadSyncQueue(): Promise<void> {
    const keys = await this.storage.keys();
    const syncKeys = keys.filter((key) => key.startsWith("syncQueue:"));

    this.syncQueue = [];

    for (const key of syncKeys) {
      const item = await this.storage.get<SyncItem>(key);
      if (item) {
        this.syncQueue.push(item);
      }
    }
  }

  // Clear all offline data
  public async clearAllData(): Promise<void> {
    this.syncQueue = [];
    await this.storage.clear();

    // Publish event
    eventBus.publish({
      id: uuidv4(),
      type: EventType.STORAGE_CLEARED,
      timestamp: new Date().toISOString(),
      source: "offlineService",
      payload: {},
    });
  }

  // Get storage usage information
  public async getStorageInfo(): Promise<StorageQuotaInfo> {
    return await this.storage.getStorageEstimate();
  }
}

// Add storage quota warning and cleared events
declare module "../services/eventBus" {
  export enum EventType {
    STORAGE_QUOTA_WARNING = "STORAGE_QUOTA_WARNING",
    STORAGE_CLEARED = "STORAGE_CLEARED",
  }
}

// Create and export default instance
export const offlineService = new OfflineServiceClass(
  new IndexedDBStorage("barakatna_offline", "data", 2),
);
