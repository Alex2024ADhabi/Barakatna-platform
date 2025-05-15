/**
 * MeasurementOfflineManager
 *
 * Manages offline storage and synchronization for measurement data
 */

import { v4 as uuidv4 } from "uuid";
import {
  offlineService,
  SyncStatus,
  SyncItem,
  ConflictResolutionStrategy,
} from "./offlineService";
import { syncQueueManager } from "./SyncQueueManager";
import { eventBus, EventType } from "./eventBus";

// Define measurement data interface
export interface MeasurementData {
  id: string;
  assessmentId: string;
  roomId: string;
  type: string; // e.g., "length", "width", "height", "area", "perimeter"
  value: number;
  unit: string; // e.g., "cm", "m", "in", "ft"
  label?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, any>;
}

// Add measurement events to EventType
declare module "./eventBus" {
  export enum EventType {
    MEASUREMENT_ADDED = "MEASUREMENT_ADDED",
    MEASUREMENT_UPDATED = "MEASUREMENT_UPDATED",
    MEASUREMENT_DELETED = "MEASUREMENT_DELETED",
  }
}

export class MeasurementOfflineManager {
  private static instance: MeasurementOfflineManager;
  private readonly ENTITY_TYPE = "measurement";
  private readonly API_ENDPOINT = "/api/measurements";

  private constructor() {
    // Register with offline service
    offlineService.registerEntityManager(this.ENTITY_TYPE, this);

    // Set conflict resolution strategy
    offlineService.setConflictResolutionStrategy(
      this.ENTITY_TYPE,
      ConflictResolutionStrategy.LastModifiedWins,
    );

    // Initialize event listeners
    this.initEventListeners();
  }

  public static getInstance(): MeasurementOfflineManager {
    if (!MeasurementOfflineManager.instance) {
      MeasurementOfflineManager.instance = new MeasurementOfflineManager();
    }
    return MeasurementOfflineManager.instance;
  }

  private initEventListeners(): void {
    // Listen for measurement updates from other sources
    eventBus.subscribe(EventType.MEASUREMENT_UPDATED, async (event) => {
      const { measurementId, data } = event.payload;

      // Update local cache if the update came from a different source
      if (event.source !== "measurementOfflineManager") {
        await this.updateLocalMeasurement(measurementId, data);
      }
    });
  }

  /**
   * Create a new measurement
   * @param data The measurement data
   * @returns The created measurement
   */
  public async createMeasurement(
    data: Omit<MeasurementData, "id" | "createdAt" | "updatedAt">,
  ): Promise<MeasurementData> {
    const now = new Date().toISOString();
    const id = uuidv4();

    const measurement: MeasurementData = {
      ...data,
      id,
      createdAt: now,
      updatedAt: now,
    };

    // Store locally
    await offlineService.storeData(this.ENTITY_TYPE, id, measurement);

    // Queue for sync
    await syncQueueManager.queueCreate(
      this.ENTITY_TYPE,
      measurement,
      `${this.API_ENDPOINT}`,
      7, // Medium priority
    );

    // Publish event
    eventBus.publish({
      id: uuidv4(),
      type: EventType.MEASUREMENT_ADDED,
      timestamp: now,
      source: "measurementOfflineManager",
      payload: {
        measurementId: id,
        assessmentId: data.assessmentId,
        roomId: data.roomId,
        data: measurement,
        action: "create",
      },
    });

    return measurement;
  }

  /**
   * Get a measurement by ID
   * @param id The measurement ID
   * @returns The measurement data or null if not found
   */
  public async getMeasurement(id: string): Promise<MeasurementData | null> {
    // Try to get from local storage first
    const localData = await offlineService.getData<MeasurementData>(
      this.ENTITY_TYPE,
      id,
    );

    if (localData) {
      return localData;
    }

    // If not found locally and we're online, try to fetch from server
    if (offlineService.isOnline()) {
      // Queue a read operation
      await syncQueueManager.queueRead(
        this.ENTITY_TYPE,
        id,
        `${this.API_ENDPOINT}/${id}`,
        4,
      );

      // In a real implementation, we would wait for the sync to complete
      // and then return the data. For now, we'll just return null.
      return null;
    }

    return null;
  }

  /**
   * Get all measurements
   * @returns Object mapping measurement IDs to measurement data
   */
  public async getAllMeasurements(): Promise<Record<string, MeasurementData>> {
    return await offlineService.getAllData<MeasurementData>(this.ENTITY_TYPE);
  }

  /**
   * Get measurements by assessment ID
   * @param assessmentId The assessment ID
   * @returns Array of measurements for the assessment
   */
  public async getMeasurementsByAssessment(
    assessmentId: string,
  ): Promise<MeasurementData[]> {
    const allMeasurements = await this.getAllMeasurements();
    return Object.values(allMeasurements).filter(
      (measurement) => measurement.assessmentId === assessmentId,
    );
  }

  /**
   * Get measurements by room ID
   * @param roomId The room ID
   * @returns Array of measurements for the room
   */
  public async getMeasurementsByRoom(
    roomId: string,
  ): Promise<MeasurementData[]> {
    const allMeasurements = await this.getAllMeasurements();
    return Object.values(allMeasurements).filter(
      (measurement) => measurement.roomId === roomId,
    );
  }

  /**
   * Update a measurement
   * @param id The measurement ID
   * @param data The updated data
   * @returns The updated measurement
   */
  public async updateMeasurement(
    id: string,
    data: Partial<MeasurementData>,
  ): Promise<MeasurementData> {
    // Get current data
    const current = await this.getMeasurement(id);
    if (!current) {
      throw new Error(`Measurement with ID ${id} not found`);
    }

    // Update data
    const updated: MeasurementData = {
      ...current,
      ...data,
      updatedAt: new Date().toISOString(),
    };

    // Store locally
    await offlineService.storeData(this.ENTITY_TYPE, id, updated);

    // Queue for sync
    await syncQueueManager.queueUpdate(
      this.ENTITY_TYPE,
      id,
      updated,
      `${this.API_ENDPOINT}/${id}`,
      7, // Medium priority
    );

    // Publish event
    eventBus.publish({
      id: uuidv4(),
      type: EventType.MEASUREMENT_UPDATED,
      timestamp: updated.updatedAt,
      source: "measurementOfflineManager",
      payload: {
        measurementId: id,
        assessmentId: updated.assessmentId,
        roomId: updated.roomId,
        data: updated,
        action: "update",
      },
    });

    return updated;
  }

  /**
   * Delete a measurement
   * @param id The measurement ID
   */
  public async deleteMeasurement(id: string): Promise<void> {
    // Check if exists
    const exists = await this.getMeasurement(id);
    if (!exists) {
      throw new Error(`Measurement with ID ${id} not found`);
    }

    // Queue for sync before removing locally
    await syncQueueManager.queueDelete(
      this.ENTITY_TYPE,
      id,
      `${this.API_ENDPOINT}/${id}`,
      6, // Medium priority
    );

    // Remove locally
    await offlineService.removeData(this.ENTITY_TYPE, id);

    // Publish event
    eventBus.publish({
      id: uuidv4(),
      type: EventType.MEASUREMENT_DELETED,
      timestamp: new Date().toISOString(),
      source: "measurementOfflineManager",
      payload: {
        measurementId: id,
        assessmentId: exists.assessmentId,
        roomId: exists.roomId,
        action: "delete",
      },
    });
  }

  /**
   * Update local measurement data (used when receiving updates from other sources)
   * @param id The measurement ID
   * @param data The updated data
   */
  private async updateLocalMeasurement(
    id: string,
    data: MeasurementData,
  ): Promise<void> {
    await offlineService.storeData(this.ENTITY_TYPE, id, data);
  }

  /**
   * Process a sync item (called by the offline service)
   * @param item The sync item to process
   */
  public async processSyncItem(item: SyncItem): Promise<void> {
    // This method is called by the offline service when processing the sync queue
    // It allows for entity-specific sync logic

    if (item.entityType !== this.ENTITY_TYPE) {
      throw new Error(`Invalid entity type: ${item.entityType}`);
    }

    const { operation, endpoint } = item.metadata || {};

    switch (item.status) {
      case SyncStatus.PendingUpload:
        if (operation === "create") {
          await this.syncCreateMeasurement(item);
        } else if (operation === "update") {
          await this.syncUpdateMeasurement(item);
        } else if (operation === "delete") {
          await this.syncDeleteMeasurement(item);
        }
        break;

      case SyncStatus.PendingDownload:
        await this.syncDownloadMeasurement(item);
        break;

      case SyncStatus.Conflict:
        await this.resolveConflict(item);
        break;
    }
  }

  /**
   * Sync a create operation
   * @param item The sync item
   */
  private async syncCreateMeasurement(item: SyncItem): Promise<void> {
    // In a real implementation, this would make an API call to create the measurement
    console.log(`Creating measurement ${item.entityId} on server`);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    // In a real implementation, we would update the local data with the server response
    // For now, we'll just mark it as synced
  }

  /**
   * Sync an update operation
   * @param item The sync item
   */
  private async syncUpdateMeasurement(item: SyncItem): Promise<void> {
    // In a real implementation, this would make an API call to update the measurement
    console.log(`Updating measurement ${item.entityId} on server`);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    // In a real implementation, we would update the local data with the server response
    // For now, we'll just mark it as synced
  }

  /**
   * Sync a delete operation
   * @param item The sync item
   */
  private async syncDeleteMeasurement(item: SyncItem): Promise<void> {
    // In a real implementation, this would make an API call to delete the measurement
    console.log(`Deleting measurement ${item.entityId} on server`);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    // The local data should already be deleted, so nothing more to do
  }

  /**
   * Sync a download operation
   * @param item The sync item
   */
  private async syncDownloadMeasurement(item: SyncItem): Promise<void> {
    // In a real implementation, this would make an API call to get the measurement
    console.log(`Downloading measurement ${item.entityId} from server`);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Simulate server data
    const serverData: MeasurementData = {
      id: item.entityId,
      assessmentId: "sample-assessment-id",
      roomId: "sample-room-id",
      type: "length",
      value: 250,
      unit: "cm",
      label: "Wall length",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Store the downloaded data
    await offlineService.storeData(this.ENTITY_TYPE, item.entityId, serverData);
  }

  /**
   * Resolve a conflict
   * @param item The sync item with conflict
   */
  private async resolveConflict(item: SyncItem): Promise<void> {
    // In a real implementation, this would implement entity-specific conflict resolution
    console.log(`Resolving conflict for measurement ${item.entityId}`);

    // For measurements, we'll use last modified wins strategy
    // In a real implementation, we would get both client and server versions
    // and compare timestamps

    // Simulate API call to get server version
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Simulate server data
    const serverData = {
      ...item.data,
      updatedAt: new Date(Date.now() - 60000).toISOString(), // 1 minute ago
    };

    // Compare timestamps
    const clientTimestamp = new Date(item.data.updatedAt).getTime();
    const serverTimestamp = new Date(serverData.updatedAt).getTime();

    // Use the more recent version
    const resolvedData =
      clientTimestamp > serverTimestamp ? item.data : serverData;

    // Store the resolved data
    await offlineService.storeData(
      this.ENTITY_TYPE,
      item.entityId,
      resolvedData,
    );

    // Publish event
    eventBus.publish({
      id: uuidv4(),
      type: EventType.CONFLICT_RESOLVED,
      timestamp: new Date().toISOString(),
      source: "measurementOfflineManager",
      payload: {
        item,
        resolution: "last_modified_wins",
        entityId: item.entityId,
        entityType: this.ENTITY_TYPE,
      },
    });
  }

  /**
   * Convert measurements between units
   * @param value The measurement value
   * @param fromUnit The source unit
   * @param toUnit The target unit
   * @returns The converted value
   */
  public convertUnit(value: number, fromUnit: string, toUnit: string): number {
    // Define conversion factors to meters
    const toMeters: Record<string, number> = {
      mm: 0.001,
      cm: 0.01,
      m: 1,
      km: 1000,
      in: 0.0254,
      ft: 0.3048,
      yd: 0.9144,
      mi: 1609.34,
    };

    // Convert to meters first
    const valueInMeters = value * (toMeters[fromUnit] || 1);

    // Then convert from meters to target unit
    return valueInMeters / (toMeters[toUnit] || 1);
  }
}

// Export singleton instance
export const measurementOfflineManager =
  MeasurementOfflineManager.getInstance();
