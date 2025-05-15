/**
 * Base Service Class
 *
 * Provides common functionality for all service classes in the Barakatna Platform.
 * Implements transaction management, event publication, and client-specific logic isolation.
 */

import { ApiResponse } from "../lib/api/core/types";
import { BaseRepository } from "../lib/api/core/repository";
import eventBus, { Event, EventType } from "./eventBus";
import { ClientType } from "../lib/forms/types";

// Transaction context interface
export interface TransactionContext {
  id: string;
  startTime: Date;
  operations: Array<{
    type: string;
    target: string;
    data?: any;
    result?: any;
    timestamp: Date;
  }>;
  status: "active" | "committed" | "rolledback";
  clientType?: ClientType;
  userId?: string;
}

// Base service class
export abstract class BaseService<T> {
  protected repository: BaseRepository<T>;
  protected entityName: string;
  protected currentTransaction: TransactionContext | null = null;
  protected clientType: ClientType | null = null;

  constructor(repository: BaseRepository<T>, entityName: string) {
    this.repository = repository;
    this.entityName = entityName;
  }

  /**
   * Set the client type for client-specific logic
   * @param clientType The client type
   */
  setClientType(clientType: ClientType): void {
    this.clientType = clientType;
  }

  /**
   * Get all entities
   * @param params Query parameters
   * @returns ApiResponse with entities
   */
  async getAll(params?: any): Promise<ApiResponse<T[]>> {
    // Apply client-specific filtering if client type is set
    if (this.clientType) {
      params = { ...params, clientType: this.clientType };
    }

    const result = await this.repository.getAll(params);

    // Record operation in transaction if active
    if (this.currentTransaction) {
      this.recordOperation("getAll", this.entityName, params, result);
    }

    return result;
  }

  /**
   * Get entity by ID
   * @param id Entity ID
   * @returns ApiResponse with entity
   */
  async getById(id: string | number): Promise<ApiResponse<T>> {
    const result = await this.repository.getById(id);

    // Record operation in transaction if active
    if (this.currentTransaction) {
      this.recordOperation(
        "getById",
        `${this.entityName}/${id}`,
        { id },
        result,
      );
    }

    return result;
  }

  /**
   * Create a new entity
   * @param data Entity data
   * @returns ApiResponse with created entity
   */
  async create(data: Partial<T>): Promise<ApiResponse<T>> {
    // Apply client-specific data if client type is set
    if (this.clientType) {
      data = { ...data, clientType: this.clientType };
    }

    // Validate data before creating
    const validationResult = await this.repository.validate(data);
    if (
      !validationResult.success ||
      (validationResult.data && !validationResult.data.valid)
    ) {
      return {
        success: false,
        error: "Validation failed",
        meta: { validationErrors: validationResult.data?.errors },
      };
    }

    // Apply business rules before creation
    const processedData = await this.beforeCreate(data);

    // Create entity
    const result = await this.repository.create(processedData);

    // Record operation in transaction if active
    if (this.currentTransaction) {
      this.recordOperation("create", this.entityName, processedData, result);
    }

    // Apply business rules after creation
    if (result.success) {
      await this.afterCreate(result.data!);

      // Publish event
      this.publishEvent(
        `${this.entityName.toUpperCase()}_CREATED`,
        result.data!,
      );
    }

    return result;
  }

  /**
   * Update an entity
   * @param id Entity ID
   * @param data Updated entity data
   * @returns ApiResponse with updated entity
   */
  async update(id: string | number, data: Partial<T>): Promise<ApiResponse<T>> {
    // Get current entity for comparison
    const currentEntity = await this.repository.getById(id);
    if (!currentEntity.success) {
      return currentEntity;
    }

    // Validate data before updating
    const validationResult = await this.repository.validate(data);
    if (
      !validationResult.success ||
      (validationResult.data && !validationResult.data.valid)
    ) {
      return {
        success: false,
        error: "Validation failed",
        meta: { validationErrors: validationResult.data?.errors },
      };
    }

    // Apply business rules before update
    const processedData = await this.beforeUpdate(
      id,
      data,
      currentEntity.data!,
    );

    // Update entity
    const result = await this.repository.update(id, processedData);

    // Record operation in transaction if active
    if (this.currentTransaction) {
      this.recordOperation(
        "update",
        `${this.entityName}/${id}`,
        processedData,
        result,
      );
    }

    // Apply business rules after update
    if (result.success) {
      await this.afterUpdate(result.data!, currentEntity.data!);

      // Publish event
      this.publishEvent(
        `${this.entityName.toUpperCase()}_UPDATED`,
        result.data!,
      );
    }

    return result;
  }

  /**
   * Delete an entity
   * @param id Entity ID
   * @returns ApiResponse
   */
  async delete(id: string | number): Promise<ApiResponse<void>> {
    // Get current entity for reference
    const currentEntity = await this.repository.getById(id);
    if (!currentEntity.success) {
      return { success: false, error: currentEntity.error };
    }

    // Apply business rules before deletion
    await this.beforeDelete(id, currentEntity.data!);

    // Delete entity
    const result = await this.repository.delete(id);

    // Record operation in transaction if active
    if (this.currentTransaction) {
      this.recordOperation(
        "delete",
        `${this.entityName}/${id}`,
        { id },
        result,
      );
    }

    // Apply business rules after deletion
    if (result.success) {
      await this.afterDelete(id, currentEntity.data!);

      // Publish event
      this.publishEvent(`${this.entityName.toUpperCase()}_DELETED`, {
        id,
        ...currentEntity.data!,
      });
    }

    return result;
  }

  /**
   * Begin a transaction
   * @param userId Optional user ID
   * @returns Transaction ID
   */
  beginTransaction(userId?: string): string {
    if (this.currentTransaction) {
      throw new Error("Transaction already in progress");
    }

    const transactionId = `tx_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    this.currentTransaction = {
      id: transactionId,
      startTime: new Date(),
      operations: [],
      status: "active",
      clientType: this.clientType || undefined,
      userId,
    };

    return transactionId;
  }

  /**
   * Commit the current transaction
   * @returns True if committed successfully
   */
  async commitTransaction(): Promise<boolean> {
    if (!this.currentTransaction) {
      throw new Error("No active transaction");
    }

    if (this.currentTransaction.status !== "active") {
      throw new Error(`Transaction already ${this.currentTransaction.status}`);
    }

    // In a real implementation, this would commit the transaction to the database
    // For now, we'll just change the status and publish an event

    this.currentTransaction.status = "committed";

    // Publish transaction committed event
    this.publishEvent("TRANSACTION_COMMITTED", {
      transactionId: this.currentTransaction.id,
      operations: this.currentTransaction.operations.length,
      duration:
        new Date().getTime() - this.currentTransaction.startTime.getTime(),
    });

    const transaction = this.currentTransaction;
    this.currentTransaction = null;

    return true;
  }

  /**
   * Rollback the current transaction
   * @returns True if rolled back successfully
   */
  async rollbackTransaction(): Promise<boolean> {
    if (!this.currentTransaction) {
      throw new Error("No active transaction");
    }

    if (this.currentTransaction.status !== "active") {
      throw new Error(`Transaction already ${this.currentTransaction.status}`);
    }

    // In a real implementation, this would rollback the transaction in the database
    // For now, we'll just change the status and publish an event

    this.currentTransaction.status = "rolledback";

    // Publish transaction rolled back event
    this.publishEvent("TRANSACTION_ROLLEDBACK", {
      transactionId: this.currentTransaction.id,
      operations: this.currentTransaction.operations.length,
      duration:
        new Date().getTime() - this.currentTransaction.startTime.getTime(),
    });

    const transaction = this.currentTransaction;
    this.currentTransaction = null;

    return true;
  }

  /**
   * Record an operation in the current transaction
   * @param type Operation type
   * @param target Operation target
   * @param data Operation data
   * @param result Operation result
   */
  protected recordOperation(
    type: string,
    target: string,
    data?: any,
    result?: any,
  ): void {
    if (!this.currentTransaction) return;

    this.currentTransaction.operations.push({
      type,
      target,
      data,
      result,
      timestamp: new Date(),
    });
  }

  /**
   * Publish an event
   * @param eventType Event type
   * @param payload Event payload
   */
  protected publishEvent(eventType: string, payload: any): void {
    // Convert string event type to EventType enum if possible
    let eventTypeEnum: EventType;
    try {
      eventTypeEnum = EventType[eventType as keyof typeof EventType];
    } catch (error) {
      console.warn(`Unknown event type: ${eventType}`);
      return;
    }

    const event: Event = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      type: eventTypeEnum,
      timestamp: new Date().toISOString(),
      source: this.entityName,
      payload,
      metadata: {
        clientType: this.clientType,
        transactionId: this.currentTransaction?.id,
      },
    };

    eventBus.publish(event);
  }

  // Lifecycle hooks for business logic - to be overridden by subclasses

  /**
   * Hook called before creating an entity
   * @param data Entity data
   * @returns Processed entity data
   */
  protected async beforeCreate(data: Partial<T>): Promise<Partial<T>> {
    return data;
  }

  /**
   * Hook called after creating an entity
   * @param entity Created entity
   */
  protected async afterCreate(entity: T): Promise<void> {}

  /**
   * Hook called before updating an entity
   * @param id Entity ID
   * @param data Updated entity data
   * @param currentEntity Current entity data
   * @returns Processed entity data
   */
  protected async beforeUpdate(
    id: string | number,
    data: Partial<T>,
    currentEntity: T,
  ): Promise<Partial<T>> {
    return data;
  }

  /**
   * Hook called after updating an entity
   * @param entity Updated entity
   * @param previousEntity Previous entity data
   */
  protected async afterUpdate(entity: T, previousEntity: T): Promise<void> {}

  /**
   * Hook called before deleting an entity
   * @param id Entity ID
   * @param entity Entity to be deleted
   */
  protected async beforeDelete(id: string | number, entity: T): Promise<void> {}

  /**
   * Hook called after deleting an entity
   * @param id Entity ID
   * @param entity Deleted entity
   */
  protected async afterDelete(id: string | number, entity: T): Promise<void> {}
}
