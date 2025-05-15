/**
 * AssessmentOfflineManager
 *
 * Manages offline storage and synchronization for assessment data
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

// Define assessment data interface
export interface AssessmentData {
  id: string;
  beneficiaryId: string;
  clientType: ClientType;
  status: string;
  rooms: Array<{
    id: string;
    name: string;
    completed: boolean;
    recommendations: Array<{
      id: string;
      selected: boolean;
      description: string;
      cost: number;
    }>;
  }>;
  totalCost: number;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  approvedAt?: string;
  metadata?: Record<string, any>;
}

export class AssessmentOfflineManager {
  private static instance: AssessmentOfflineManager;
  private readonly ENTITY_TYPE = "assessment";
  private readonly API_ENDPOINT = "/api/assessments";

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

  public static getInstance(): AssessmentOfflineManager {
    if (!AssessmentOfflineManager.instance) {
      AssessmentOfflineManager.instance = new AssessmentOfflineManager();
    }
    return AssessmentOfflineManager.instance;
  }

  private initEventListeners(): void {
    // Listen for assessment updates from other sources
    eventBus.subscribe(EventType.ASSESSMENT_UPDATED, async (event) => {
      const { assessmentId, data } = event.payload;

      // Update local cache if the update came from a different source
      if (event.source !== "assessmentOfflineManager") {
        await this.updateLocalAssessment(assessmentId, data);
      }
    });

    // Listen for assessment completion events
    eventBus.subscribe(EventType.ASSESSMENT_COMPLETED, async (event) => {
      const { assessmentId } = event.payload;

      // Get the assessment and update its status
      const assessment = await this.getAssessment(assessmentId);
      if (assessment) {
        assessment.status = "completed";
        assessment.submittedAt = new Date().toISOString();
        await this.updateAssessment(assessmentId, assessment);
      }
    });
  }

  /**
   * Create a new assessment
   * @param data The assessment data
   * @returns The created assessment
   */
  public async createAssessment(
    data: Omit<AssessmentData, "id" | "createdAt" | "updatedAt">,
  ): Promise<AssessmentData> {
    const now = new Date().toISOString();
    const id = uuidv4();

    const assessment: AssessmentData = {
      ...data,
      id,
      createdAt: now,
      updatedAt: now,
    };

    // Store locally
    await offlineService.storeData(this.ENTITY_TYPE, id, assessment);

    // Queue for sync
    await syncQueueManager.queueCreate(
      this.ENTITY_TYPE,
      assessment,
      `${this.API_ENDPOINT}`,
      10, // High priority
    );

    // Publish event
    eventBus.publish({
      id: uuidv4(),
      type: EventType.ASSESSMENT_CREATED,
      timestamp: now,
      source: "assessmentOfflineManager",
      payload: {
        assessmentId: id,
        data: assessment,
        action: "create",
      },
    });

    return assessment;
  }

  /**
   * Get an assessment by ID
   * @param id The assessment ID
   * @returns The assessment data or null if not found
   */
  public async getAssessment(id: string): Promise<AssessmentData | null> {
    // Try to get from local storage first
    const localData = await offlineService.getData<AssessmentData>(
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
   * Get all assessments
   * @returns Object mapping assessment IDs to assessment data
   */
  public async getAllAssessments(): Promise<Record<string, AssessmentData>> {
    return await offlineService.getAllData<AssessmentData>(this.ENTITY_TYPE);
  }

  /**
   * Get assessments by beneficiary ID
   * @param beneficiaryId The beneficiary ID
   * @returns Array of assessments for the beneficiary
   */
  public async getAssessmentsByBeneficiary(
    beneficiaryId: string,
  ): Promise<AssessmentData[]> {
    const allAssessments = await this.getAllAssessments();
    return Object.values(allAssessments).filter(
      (assessment) => assessment.beneficiaryId === beneficiaryId,
    );
  }

  /**
   * Update an assessment
   * @param id The assessment ID
   * @param data The updated data
   * @returns The updated assessment
   */
  public async updateAssessment(
    id: string,
    data: Partial<AssessmentData>,
  ): Promise<AssessmentData> {
    // Get current data
    const current = await this.getAssessment(id);
    if (!current) {
      throw new Error(`Assessment with ID ${id} not found`);
    }

    // Update data
    const updated: AssessmentData = {
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
      type: EventType.ASSESSMENT_UPDATED,
      timestamp: updated.updatedAt,
      source: "assessmentOfflineManager",
      payload: {
        assessmentId: id,
        data: updated,
        action: "update",
      },
    });

    return updated;
  }

  /**
   * Delete an assessment
   * @param id The assessment ID
   */
  public async deleteAssessment(id: string): Promise<void> {
    // Check if exists
    const exists = await this.getAssessment(id);
    if (!exists) {
      throw new Error(`Assessment with ID ${id} not found`);
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
      type: EventType.ASSESSMENT_UPDATED,
      timestamp: new Date().toISOString(),
      source: "assessmentOfflineManager",
      payload: {
        assessmentId: id,
        action: "delete",
      },
    });
  }

  /**
   * Complete an assessment
   * @param id The assessment ID
   * @returns The completed assessment
   */
  public async completeAssessment(id: string): Promise<AssessmentData> {
    const assessment = await this.getAssessment(id);
    if (!assessment) {
      throw new Error(`Assessment with ID ${id} not found`);
    }

    // Calculate total cost from all selected recommendations
    let totalCost = 0;
    for (const room of assessment.rooms) {
      for (const recommendation of room.recommendations) {
        if (recommendation.selected) {
          totalCost += recommendation.cost;
        }
      }
    }

    // Update assessment status and total cost
    const updated = await this.updateAssessment(id, {
      status: "completed",
      submittedAt: new Date().toISOString(),
      totalCost,
    });

    // Publish assessment completed event
    eventBus.publishAssessmentCompleted(
      "assessmentOfflineManager",
      id,
      assessment.beneficiaryId,
      assessment.clientType,
      assessment.rooms,
      totalCost,
    );

    return updated;
  }

  /**
   * Update local assessment data (used when receiving updates from other sources)
   * @param id The assessment ID
   * @param data The updated data
   */
  private async updateLocalAssessment(
    id: string,
    data: AssessmentData,
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
          await this.syncCreateAssessment(item);
        } else if (operation === "update") {
          await this.syncUpdateAssessment(item);
        } else if (operation === "delete") {
          await this.syncDeleteAssessment(item);
        }
        break;

      case SyncStatus.PendingDownload:
        await this.syncDownloadAssessment(item);
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
  private async syncCreateAssessment(item: SyncItem): Promise<void> {
    // In a real implementation, this would make an API call to create the assessment
    console.log(`Creating assessment ${item.entityId} on server`);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    // In a real implementation, we would update the local data with the server response
    // For now, we'll just mark it as synced
  }

  /**
   * Sync an update operation
   * @param item The sync item
   */
  private async syncUpdateAssessment(item: SyncItem): Promise<void> {
    // In a real implementation, this would make an API call to update the assessment
    console.log(`Updating assessment ${item.entityId} on server`);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    // In a real implementation, we would update the local data with the server response
    // For now, we'll just mark it as synced
  }

  /**
   * Sync a delete operation
   * @param item The sync item
   */
  private async syncDeleteAssessment(item: SyncItem): Promise<void> {
    // In a real implementation, this would make an API call to delete the assessment
    console.log(`Deleting assessment ${item.entityId} on server`);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    // The local data should already be deleted, so nothing more to do
  }

  /**
   * Sync a download operation
   * @param item The sync item
   */
  private async syncDownloadAssessment(item: SyncItem): Promise<void> {
    // In a real implementation, this would make an API call to get the assessment
    console.log(`Downloading assessment ${item.entityId} from server`);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Simulate server data
    const serverData: AssessmentData = {
      id: item.entityId,
      beneficiaryId: "sample-beneficiary-id",
      clientType: ClientType.FDF,
      status: "active",
      rooms: [
        {
          id: uuidv4(),
          name: "Living Room",
          completed: false,
          recommendations: [],
        },
      ],
      totalCost: 0,
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
    console.log(`Resolving conflict for assessment ${item.entityId}`);

    // For assessments, we'll use a field-by-field merge strategy
    // In a real implementation, we would get both client and server versions
    // and merge them based on business rules

    // Simulate API call to get server version
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Simulate merged data
    const mergedData: AssessmentData = {
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
      source: "assessmentOfflineManager",
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
export const assessmentOfflineManager = AssessmentOfflineManager.getInstance();
