/**
 * PhotoOfflineManager
 *
 * Manages offline storage and synchronization for photo data
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

// Define photo data interface
export interface PhotoData {
  id: string;
  assessmentId: string;
  roomId: string;
  caption?: string;
  dataUrl: string; // Base64 encoded image data
  thumbnailUrl?: string; // Base64 encoded thumbnail data
  createdAt: string;
  updatedAt: string;
  uploadedAt?: string;
  metadata?: Record<string, any>;
}

// Define photo upload event
export interface PhotoUploadEvent extends Event {
  type: EventType.UPLOAD_COMPLETED;
  payload: {
    photoId: string;
    assessmentId: string;
    roomId: string;
    url: string;
  };
}

// Add photo events to EventType
declare module "./eventBus" {
  export enum EventType {
    PHOTO_ADDED = "PHOTO_ADDED",
    PHOTO_UPDATED = "PHOTO_UPDATED",
    PHOTO_DELETED = "PHOTO_DELETED",
  }
}

export class PhotoOfflineManager {
  private static instance: PhotoOfflineManager;
  private readonly ENTITY_TYPE = "photo";
  private readonly API_ENDPOINT = "/api/photos";
  private readonly MAX_PHOTO_SIZE_MB = 5; // Maximum photo size in MB
  private readonly THUMBNAIL_SIZE = 200; // Thumbnail width/height in pixels

  private constructor() {
    // Register with offline service
    offlineService.registerEntityManager(this.ENTITY_TYPE, this);

    // Set conflict resolution strategy
    offlineService.setConflictResolutionStrategy(
      this.ENTITY_TYPE,
      ConflictResolutionStrategy.ClientWins, // For photos, client version usually wins
    );

    // Initialize event listeners
    this.initEventListeners();
  }

  public static getInstance(): PhotoOfflineManager {
    if (!PhotoOfflineManager.instance) {
      PhotoOfflineManager.instance = new PhotoOfflineManager();
    }
    return PhotoOfflineManager.instance;
  }

  private initEventListeners(): void {
    // Listen for photo updates from other sources
    eventBus.subscribe(EventType.PHOTO_UPDATED, async (event) => {
      const { photoId, data } = event.payload;

      // Update local cache if the update came from a different source
      if (event.source !== "photoOfflineManager") {
        await this.updateLocalPhoto(photoId, data);
      }
    });

    // Listen for upload completed events
    eventBus.subscribe(EventType.UPLOAD_COMPLETED, async (event) => {
      const { photoId, url } = event.payload;

      // Get the photo and update its status
      const photo = await this.getPhoto(photoId);
      if (photo) {
        photo.uploadedAt = new Date().toISOString();
        photo.metadata = {
          ...photo.metadata,
          remoteUrl: url,
        };
        await this.updatePhoto(photoId, photo);
      }
    });
  }

  /**
   * Create a new photo
   * @param data The photo data
   * @returns The created photo
   */
  public async createPhoto(
    data: Omit<PhotoData, "id" | "createdAt" | "updatedAt" | "thumbnailUrl">,
  ): Promise<PhotoData> {
    const now = new Date().toISOString();
    const id = uuidv4();

    // Generate thumbnail
    const thumbnailUrl = await this.generateThumbnail(data.dataUrl);

    const photo: PhotoData = {
      ...data,
      id,
      thumbnailUrl,
      createdAt: now,
      updatedAt: now,
    };

    // Store locally
    await offlineService.storeData(this.ENTITY_TYPE, id, photo);

    // Queue for sync
    await syncQueueManager.queueCreate(
      this.ENTITY_TYPE,
      photo,
      `${this.API_ENDPOINT}`,
      6, // Medium priority
    );

    // Publish event
    eventBus.publish({
      id: uuidv4(),
      type: EventType.PHOTO_ADDED,
      timestamp: now,
      source: "photoOfflineManager",
      payload: {
        photoId: id,
        assessmentId: data.assessmentId,
        roomId: data.roomId,
        data: photo,
        action: "create",
      },
    });

    return photo;
  }

  /**
   * Generate a thumbnail from a data URL
   * @param dataUrl The original image data URL
   * @returns A thumbnail data URL
   */
  private async generateThumbnail(dataUrl: string): Promise<string> {
    // In a browser environment, this would use canvas to resize the image
    // For this implementation, we'll just return the original data URL
    // In a real implementation, you would create a smaller version of the image
    return dataUrl;
  }

  /**
   * Get a photo by ID
   * @param id The photo ID
   * @returns The photo data or null if not found
   */
  public async getPhoto(id: string): Promise<PhotoData | null> {
    // Try to get from local storage first
    const localData = await offlineService.getData<PhotoData>(
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
   * Get all photos
   * @returns Object mapping photo IDs to photo data
   */
  public async getAllPhotos(): Promise<Record<string, PhotoData>> {
    return await offlineService.getAllData<PhotoData>(this.ENTITY_TYPE);
  }

  /**
   * Get photos by assessment ID
   * @param assessmentId The assessment ID
   * @returns Array of photos for the assessment
   */
  public async getPhotosByAssessment(
    assessmentId: string,
  ): Promise<PhotoData[]> {
    const allPhotos = await this.getAllPhotos();
    return Object.values(allPhotos).filter(
      (photo) => photo.assessmentId === assessmentId,
    );
  }

  /**
   * Get photos by room ID
   * @param roomId The room ID
   * @returns Array of photos for the room
   */
  public async getPhotosByRoom(roomId: string): Promise<PhotoData[]> {
    const allPhotos = await this.getAllPhotos();
    return Object.values(allPhotos).filter((photo) => photo.roomId === roomId);
  }

  /**
   * Update a photo
   * @param id The photo ID
   * @param data The updated data
   * @returns The updated photo
   */
  public async updatePhoto(
    id: string,
    data: Partial<PhotoData>,
  ): Promise<PhotoData> {
    // Get current data
    const current = await this.getPhoto(id);
    if (!current) {
      throw new Error(`Photo with ID ${id} not found`);
    }

    // If dataUrl is being updated, regenerate thumbnail
    let thumbnailUrl = current.thumbnailUrl;
    if (data.dataUrl && data.dataUrl !== current.dataUrl) {
      thumbnailUrl = await this.generateThumbnail(data.dataUrl);
    }

    // Update data
    const updated: PhotoData = {
      ...current,
      ...data,
      thumbnailUrl,
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
      6, // Medium priority
    );

    // Publish event
    eventBus.publish({
      id: uuidv4(),
      type: EventType.PHOTO_UPDATED,
      timestamp: updated.updatedAt,
      source: "photoOfflineManager",
      payload: {
        photoId: id,
        assessmentId: updated.assessmentId,
        roomId: updated.roomId,
        data: updated,
        action: "update",
      },
    });

    return updated;
  }

  /**
   * Delete a photo
   * @param id The photo ID
   */
  public async deletePhoto(id: string): Promise<void> {
    // Check if exists
    const exists = await this.getPhoto(id);
    if (!exists) {
      throw new Error(`Photo with ID ${id} not found`);
    }

    // Queue for sync before removing locally
    await syncQueueManager.queueDelete(
      this.ENTITY_TYPE,
      id,
      `${this.API_ENDPOINT}/${id}`,
      5, // Medium priority
    );

    // Remove locally
    await offlineService.removeData(this.ENTITY_TYPE, id);

    // Publish event
    eventBus.publish({
      id: uuidv4(),
      type: EventType.PHOTO_DELETED,
      timestamp: new Date().toISOString(),
      source: "photoOfflineManager",
      payload: {
        photoId: id,
        assessmentId: exists.assessmentId,
        roomId: exists.roomId,
        action: "delete",
      },
    });
  }

  /**
   * Update local photo data (used when receiving updates from other sources)
   * @param id The photo ID
   * @param data The updated data
   */
  private async updateLocalPhoto(id: string, data: PhotoData): Promise<void> {
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
          await this.syncCreatePhoto(item);
        } else if (operation === "update") {
          await this.syncUpdatePhoto(item);
        } else if (operation === "delete") {
          await this.syncDeletePhoto(item);
        }
        break;

      case SyncStatus.PendingDownload:
        await this.syncDownloadPhoto(item);
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
  private async syncCreatePhoto(item: SyncItem): Promise<void> {
    // In a real implementation, this would make an API call to create the photo
    console.log(`Creating photo ${item.entityId} on server`);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Simulate successful upload
    const remoteUrl = `https://api.example.com/photos/${item.entityId}`;

    // Publish upload completed event
    eventBus.publish({
      id: uuidv4(),
      type: EventType.UPLOAD_COMPLETED,
      timestamp: new Date().toISOString(),
      source: "photoOfflineManager",
      payload: {
        photoId: item.entityId,
        assessmentId: item.data.assessmentId,
        roomId: item.data.roomId,
        url: remoteUrl,
      },
    });
  }

  /**
   * Sync an update operation
   * @param item The sync item
   */
  private async syncUpdatePhoto(item: SyncItem): Promise<void> {
    // In a real implementation, this would make an API call to update the photo
    console.log(`Updating photo ${item.entityId} on server`);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    // In a real implementation, we would update the local data with the server response
    // For now, we'll just mark it as synced
  }

  /**
   * Sync a delete operation
   * @param item The sync item
   */
  private async syncDeletePhoto(item: SyncItem): Promise<void> {
    // In a real implementation, this would make an API call to delete the photo
    console.log(`Deleting photo ${item.entityId} on server`);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    // The local data should already be deleted, so nothing more to do
  }

  /**
   * Sync a download operation
   * @param item The sync item
   */
  private async syncDownloadPhoto(item: SyncItem): Promise<void> {
    // In a real implementation, this would make an API call to get the photo
    console.log(`Downloading photo ${item.entityId} from server`);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Simulate server data - in a real implementation, this would be an actual image
    const serverData: PhotoData = {
      id: item.entityId,
      assessmentId: "sample-assessment-id",
      roomId: "sample-room-id",
      dataUrl:
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
      thumbnailUrl:
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      uploadedAt: new Date().toISOString(),
    };

    // Store the downloaded data
    await offlineService.storeData(this.ENTITY_TYPE, item.entityId, serverData);
  }

  /**
   * Resolve a conflict
   * @param item The sync item with conflict
   */
  private async resolveConflict(item: SyncItem): Promise<void> {
    // For photos, we typically use client wins strategy
    console.log(`Resolving conflict for photo ${item.entityId} (client wins)`);

    // Simulate API call to update server with client version
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Store the client data
    await offlineService.storeData(this.ENTITY_TYPE, item.entityId, item.data);

    // Publish event
    eventBus.publish({
      id: uuidv4(),
      type: EventType.CONFLICT_RESOLVED,
      timestamp: new Date().toISOString(),
      source: "photoOfflineManager",
      payload: {
        item,
        resolution: "client_wins",
        entityId: item.entityId,
        entityType: this.ENTITY_TYPE,
      },
    });
  }
}

// Export singleton instance
export const photoOfflineManager = PhotoOfflineManager.getInstance();
