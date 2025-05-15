/**
 * BeneficiaryOfflineManager
 *
 * Manages offline storage and synchronization for beneficiary data
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
import { ClientType } from "../lib/forms/types";

// Define beneficiary data interface
export interface BeneficiaryData {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  gender?: string;
  nationalId?: string;
  contactInfo?: {
    email?: string;
    phone?: string;
    address?: string;
  };
  clientType: ClientType;
  status: string;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, any>;
}

export class BeneficiaryOfflineManager {
  private static instance: BeneficiaryOfflineManager;
  private readonly ENTITY_TYPE = "beneficiary";
  private readonly API_ENDPOINT = "/api/beneficiaries";

  private constructor() {
    // Register with offline service
    offlineService.registerEntityManager(this.ENTITY_TYPE, this);

    // Set conflict resolution strategy
    offlineService.setConflictResolutionStrategy(
      this.ENTITY_TYPE,
      ConflictResolutionStrategy.MergeByField,
    );

    // Initialize event listeners
    this.initEventListeners();
  }

  public static getInstance(): BeneficiaryOfflineManager {
    if (!BeneficiaryOfflineManager.instance) {
      BeneficiaryOfflineManager.instance = new BeneficiaryOfflineManager();
    }
    return BeneficiaryOfflineManager.instance;
  }

  private initEventListeners(): void {
    // Listen for beneficiary updates from other sources
    eventBus.subscribe(EventType.BENEFICIARY_UPDATED, async (event) => {
      const { beneficiaryId, data } = event.payload;

      // Update local cache if the update came from a different source
      if (event.source !== "beneficiaryOfflineManager") {
        await this.updateLocalBeneficiary(beneficiaryId, data);
      }
    });
  }

  /**
   * Create a new beneficiary
   * @param data The beneficiary data
   * @returns The created beneficiary
   */
  public async createBeneficiary(
    data: Omit<BeneficiaryData, "id" | "createdAt" | "updatedAt">,
  ): Promise<BeneficiaryData> {
    const now = new Date().toISOString();
    const id = uuidv4();

    const beneficiary: BeneficiaryData = {
      ...data,
      id,
      createdAt: now,
      updatedAt: now,
    };

    // Store locally
    await offlineService.storeData(this.ENTITY_TYPE, id, beneficiary);

    // Queue for sync
    await syncQueueManager.queueCreate(
      this.ENTITY_TYPE,
      beneficiary,
      `${this.API_ENDPOINT}`,
      10, // High priority
    );

    // Publish event
    eventBus.publish({
      id: uuidv4(),
      type: EventType.BENEFICIARY_UPDATED,
      timestamp: now,
      source: "beneficiaryOfflineManager",
      payload: {
        beneficiaryId: id,
        data: beneficiary,
        action: "create",
      },
    });

    return beneficiary;
  }

  /**
   * Get a beneficiary by ID
   * @param id The beneficiary ID
   * @returns The beneficiary data or null if not found
   */
  public async getBeneficiary(id: string): Promise<BeneficiaryData | null> {
    // Try to get from local storage first
    const localData = await offlineService.getData<BeneficiaryData>(
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
        5,
      );

      // In a real implementation, we would wait for the sync to complete
      // and then return the data. For now, we'll just return null.
      return null;
    }

    return null;
  }

  /**
   * Get all beneficiaries
   * @returns Object mapping beneficiary IDs to beneficiary data
   */
  public async getAllBeneficiaries(): Promise<Record<string, BeneficiaryData>> {
    return await offlineService.getAllData<BeneficiaryData>(this.ENTITY_TYPE);
  }

  /**
   * Update a beneficiary
   * @param id The beneficiary ID
   * @param data The updated data
   * @returns The updated beneficiary
   */
  public async updateBeneficiary(
    id: string,
    data: Partial<BeneficiaryData>,
  ): Promise<BeneficiaryData> {
    // Get current data
    const current = await this.getBeneficiary(id);
    if (!current) {
      throw new Error(`Beneficiary with ID ${id} not found`);
    }

    // Update data
    const updated: BeneficiaryData = {
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
      8, // Medium-high priority
    );

    // Publish event
    eventBus.publish({
      id: uuidv4(),
      type: EventType.BENEFICIARY_UPDATED,
      timestamp: updated.updatedAt,
      source: "beneficiaryOfflineManager",
      payload: {
        beneficiaryId: id,
        data: updated,
        action: "update",
      },
    });

    return updated;
  }

  /**
   * Delete a beneficiary
   * @param id The beneficiary ID
   */
  public async deleteBeneficiary(id: string): Promise<void> {
    // Check if exists
    const exists = await this.getBeneficiary(id);
    if (!exists) {
      throw new Error(`Beneficiary with ID ${id} not found`);
    }

    // Queue for sync before removing locally
    await syncQueueManager.queueDelete(
      this.ENTITY_TYPE,
      id,
      `${this.API_ENDPOINT}/${id}`,
      7, // Medium priority
    );

    // Remove locally
    await offlineService.removeData(this.ENTITY_TYPE, id);

    // Publish event
    eventBus.publish({
      id: uuidv4(),
      type: EventType.BENEFICIARY_UPDATED,
      timestamp: new Date().toISOString(),
      source: "beneficiaryOfflineManager",
      payload: {
        beneficiaryId: id,
        action: "delete",
      },
    });
  }

  /**
   * Update local beneficiary data (used when receiving updates from other sources)
   * @param id The beneficiary ID
   * @param data The updated data
   */
  private async updateLocalBeneficiary(
    id: string,
    data: BeneficiaryData,
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
          await this.syncCreateBeneficiary(item);
        } else if (operation === "update") {
          await this.syncUpdateBeneficiary(item);
        } else if (operation === "delete") {
          await this.syncDeleteBeneficiary(item);
        }
        break;

      case SyncStatus.PendingDownload:
        await this.syncDownloadBeneficiary(item);
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
  private async syncCreateBeneficiary(item: SyncItem): Promise<void> {
    // In a real implementation, this would make an API call to create the beneficiary
    console.log(`Creating beneficiary ${item.entityId} on server`);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    // In a real implementation, we would update the local data with the server response
    // For now, we'll just mark it as synced
  }

  /**
   * Sync an update operation
   * @param item The sync item
   */
  private async syncUpdateBeneficiary(item: SyncItem): Promise<void> {
    // In a real implementation, this would make an API call to update the beneficiary
    console.log(`Updating beneficiary ${item.entityId} on server`);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    // In a real implementation, we would update the local data with the server response
    // For now, we'll just mark it as synced
  }

  /**
   * Sync a delete operation
   * @param item The sync item
   */
  private async syncDeleteBeneficiary(item: SyncItem): Promise<void> {
    // In a real implementation, this would make an API call to delete the beneficiary
    console.log(`Deleting beneficiary ${item.entityId} on server`);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    // The local data should already be deleted, so nothing more to do
  }

  /**
   * Sync a download operation
   * @param item The sync item
   */
  private async syncDownloadBeneficiary(item: SyncItem): Promise<void> {
    // In a real implementation, this would make an API call to get the beneficiary
    console.log(`Downloading beneficiary ${item.entityId} from server`);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Simulate server data
    const serverData: BeneficiaryData = {
      id: item.entityId,
      firstName: "Server",
      lastName: "Data",
      clientType: ClientType.FDF,
      status: "active",
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
    console.log(`Resolving conflict for beneficiary ${item.entityId}`);

    // For beneficiaries, we'll use a field-by-field merge strategy
    // In a real implementation, we would get both client and server versions
    // and merge them based on business rules

    // Simulate API call to get server version
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Simulate merged data
    const mergedData: BeneficiaryData = {
      ...item.data,
      updatedAt: new Date().toISOString(),
      metadata: {
        ...item.data.metadata,
        conflictResolved: true,
        conflictResolvedAt: new Date().toISOString(),
      },
    };

    // Store the merged data
    await offlineService.storeData(this.ENTITY_TYPE, item.entityId, mergedData);

    // Publish event
    eventBus.publish({
      id: uuidv4(),
      type: EventType.CONFLICT_RESOLVED,
      timestamp: new Date().toISOString(),
      source: "beneficiaryOfflineManager",
      payload: {
        item,
        resolution: "merged",
        entityId: item.entityId,
        entityType: this.ENTITY_TYPE,
      },
    });
  }
}

// Export singleton instance
export const beneficiaryOfflineManager =
  BeneficiaryOfflineManager.getInstance();
