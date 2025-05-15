/**
 * EventBus Service
 *
 * A centralized event bus for inter-module communication in the Barakatna Platform.
 * Provides event publication, subscription, persistence, and replay capabilities.
 * Enhanced with WebSocket integration for real-time updates.
 */

import { v4 as uuidv4 } from "uuid";

// Event Types
export enum EventType {
  // Beneficiary Events
  BENEFICIARY_QUALIFIED = "BENEFICIARY_QUALIFIED",
  BENEFICIARY_UPDATED = "BENEFICIARY_UPDATED",

  // Assessment Events
  ASSESSMENT_CREATED = "ASSESSMENT_CREATED",
  ASSESSMENT_UPDATED = "ASSESSMENT_UPDATED",
  ASSESSMENT_COMPLETED = "ASSESSMENT_COMPLETED",

  // Committee Events
  COMMITTEE_DECISION = "COMMITTEE_DECISION",
  COMMITTEE_MEETING_SCHEDULED = "COMMITTEE_MEETING_SCHEDULED",

  // Project Events
  PROJECT_CREATED = "PROJECT_CREATED",
  PROJECT_UPDATED = "PROJECT_UPDATED",
  PROJECT_COMPLETED = "PROJECT_COMPLETED",

  // Budget Events
  BUDGET_CREATED = "BUDGET_CREATED",
  BUDGET_UPDATED = "BUDGET_UPDATED",
  BUDGET_CHANGED = "BUDGET_CHANGED",

  // Case Events
  CASE_CREATED = "CASE_CREATED",
  CASE_UPDATED = "CASE_UPDATED",
  CASE_STATUS_CHANGED = "CASE_STATUS_CHANGED",

  // Program Events
  PROGRAM_CREATED = "PROGRAM_CREATED",
  PROGRAM_UPDATED = "PROGRAM_UPDATED",
  PROGRAM_COMPLETED = "PROGRAM_COMPLETED",

  // Workflow Events
  WORKFLOW_STEP_COMPLETED = "WORKFLOW_STEP_COMPLETED",
  WORKFLOW_COMPLETED = "WORKFLOW_COMPLETED",

  // Data Synchronization Events
  DATA_CHANGED = "DATA_CHANGED",
  SYNC_STARTED = "SYNC_STARTED",
  SYNC_COMPLETED = "SYNC_COMPLETED",
  REQUEST_QUEUED = "REQUEST_QUEUED",
  OFFLINE_REQUEST_PROCESSED = "OFFLINE_REQUEST_PROCESSED",
  UPLOAD_PENDING = "UPLOAD_PENDING",
  UPLOAD_COMPLETED = "UPLOAD_COMPLETED",
  NETWORK_STATUS_CHANGED = "NETWORK_STATUS_CHANGED",

  // WebSocket Events
  WEBSOCKET_CONNECTED = "WEBSOCKET_CONNECTED",
  WEBSOCKET_DISCONNECTED = "WEBSOCKET_DISCONNECTED",
  WEBSOCKET_MESSAGE_RECEIVED = "WEBSOCKET_MESSAGE_RECEIVED",
  WEBSOCKET_ERROR = "WEBSOCKET_ERROR",

  // Conflict Resolution Events
  CONFLICT_DETECTED = "CONFLICT_DETECTED",
  CONFLICT_RESOLVED = "CONFLICT_RESOLVED",
}

// Base Event Interface
export interface Event {
  id: string;
  type: EventType;
  timestamp: string;
  source: string;
  payload: any;
  metadata?: Record<string, any>;
}

// Key Integration Events
export interface BeneficiaryQualifiedEvent extends Event {
  type: EventType.BENEFICIARY_QUALIFIED;
  payload: {
    beneficiaryId: string;
    clientType: string;
    qualificationCriteria: Record<string, any>;
  };
}

export interface AssessmentCompletedEvent extends Event {
  type: EventType.ASSESSMENT_COMPLETED;
  payload: {
    assessmentId: string;
    beneficiaryId: string;
    clientType: string;
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
  };
}

export interface CommitteeDecisionEvent extends Event {
  type: EventType.COMMITTEE_DECISION;
  payload: {
    committeeId: string;
    meetingId: string;
    decisionId: string;
    assessmentId: string;
    beneficiaryId: string;
    approved: boolean;
    comments: string;
    budget?: number;
  };
}

export interface ProjectCompletedEvent extends Event {
  type: EventType.PROJECT_COMPLETED;
  payload: {
    projectId: string;
    beneficiaryId: string;
    assessmentId: string;
    completionDate: string;
    finalCost: number;
    status: string;
  };
}

export interface BudgetChangedEvent extends Event {
  type: EventType.BUDGET_CHANGED;
  payload: {
    budgetId: string;
    previousAmount: number;
    newAmount: number;
    reason: string;
    affectedProjects?: string[];
    affectedPrograms?: string[];
  };
}

// Event Handler Type
export type EventHandler = (event: Event) => void | Promise<void>;

// Event Storage Interface
interface EventStorage {
  saveEvent(event: Event): Promise<void>;
  getEvents(filters?: EventFilter): Promise<Event[]>;
  getEventById(eventId: string): Promise<Event | null>;
}

// Event Filter Interface
export interface EventFilter {
  types?: EventType[];
  sources?: string[];
  fromTimestamp?: string;
  toTimestamp?: string;
  metadata?: Record<string, any>;
}

// In-Memory Event Storage Implementation
class InMemoryEventStorage implements EventStorage {
  private events: Event[] = [];

  async saveEvent(event: Event): Promise<void> {
    this.events.push(event);
  }

  async getEvents(filters?: EventFilter): Promise<Event[]> {
    if (!filters) return [...this.events];

    return this.events.filter((event) => {
      let match = true;

      if (filters.types && filters.types.length > 0) {
        match = match && filters.types.includes(event.type);
      }

      if (filters.sources && filters.sources.length > 0) {
        match = match && filters.sources.includes(event.source);
      }

      if (filters.fromTimestamp) {
        match = match && event.timestamp >= filters.fromTimestamp;
      }

      if (filters.toTimestamp) {
        match = match && event.timestamp <= filters.toTimestamp;
      }

      if (filters.metadata && Object.keys(filters.metadata).length > 0) {
        if (!event.metadata) return false;

        for (const [key, value] of Object.entries(filters.metadata)) {
          match = match && event.metadata[key] === value;
        }
      }

      return match;
    });
  }

  async getEventById(eventId: string): Promise<Event | null> {
    const event = this.events.find((e) => e.id === eventId);
    return event || null;
  }
}

// WebSocket connection manager
class WebSocketManager {
  private socket: WebSocket | null = null;
  private url: string;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 1000; // Start with 1 second
  private eventBus: EventBus;
  private isConnecting: boolean = false;
  private messageQueue: any[] = [];
  private authenticated: boolean = false;

  constructor(url: string, eventBus: EventBus) {
    this.url = url;
    this.eventBus = eventBus;

    // Listen for online/offline events
    if (typeof window !== "undefined") {
      window.addEventListener("online", () => this.handleOnline());
      window.addEventListener("offline", () => this.handleOffline());
    }
  }

  public connect(authToken?: string): void {
    if (typeof window === "undefined") return; // Skip if running on server

    if (
      this.socket &&
      (this.socket.readyState === WebSocket.OPEN ||
        this.socket.readyState === WebSocket.CONNECTING)
    ) {
      return; // Already connected or connecting
    }

    if (this.isConnecting) return;
    this.isConnecting = true;

    try {
      // Add auth token to URL if provided
      const connectionUrl = authToken
        ? `${this.url}?token=${authToken}`
        : this.url;
      this.socket = new WebSocket(connectionUrl);

      this.socket.onopen = () => {
        this.reconnectAttempts = 0;
        this.reconnectDelay = 1000;
        this.isConnecting = false;
        this.authenticated = !!authToken;

        // Publish connection event
        this.eventBus.publish({
          id: uuidv4(),
          type: EventType.WEBSOCKET_CONNECTED,
          timestamp: new Date().toISOString(),
          source: "websocket",
          payload: { url: this.url },
        });

        // Send any queued messages
        this.flushMessageQueue();
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          // Publish received message event
          this.eventBus.publish({
            id: uuidv4(),
            type: EventType.WEBSOCKET_MESSAGE_RECEIVED,
            timestamp: new Date().toISOString(),
            source: "websocket",
            payload: data,
          });

          // If the message contains an event type, also publish it directly
          if (data.type && Object.values(EventType).includes(data.type)) {
            this.eventBus.publish({
              ...data,
              id: data.id || uuidv4(),
              timestamp: data.timestamp || new Date().toISOString(),
              source: data.source || "websocket",
            });
          }
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      this.socket.onclose = (event) => {
        this.isConnecting = false;
        this.socket = null;

        // Publish disconnection event
        this.eventBus.publish({
          id: uuidv4(),
          type: EventType.WEBSOCKET_DISCONNECTED,
          timestamp: new Date().toISOString(),
          source: "websocket",
          payload: { code: event.code, reason: event.reason },
        });

        // Attempt to reconnect if not closed cleanly
        if (
          !event.wasClean &&
          navigator.onLine &&
          this.reconnectAttempts < this.maxReconnectAttempts
        ) {
          this.scheduleReconnect();
        }
      };

      this.socket.onerror = (error) => {
        this.isConnecting = false;

        // Publish error event
        this.eventBus.publish({
          id: uuidv4(),
          type: EventType.WEBSOCKET_ERROR,
          timestamp: new Date().toISOString(),
          source: "websocket",
          payload: { error: "WebSocket connection error" },
        });

        console.error("WebSocket error:", error);
      };
    } catch (error) {
      this.isConnecting = false;
      console.error("Failed to create WebSocket connection:", error);

      // Schedule reconnect
      if (
        navigator.onLine &&
        this.reconnectAttempts < this.maxReconnectAttempts
      ) {
        this.scheduleReconnect();
      }
    }
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.close(1000, "Client disconnected");
      this.socket = null;
    }
  }

  public send(data: any): boolean {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(data));
      return true;
    } else {
      // Queue message for later sending
      this.messageQueue.push(data);

      // Try to connect if not already connecting
      if (!this.isConnecting && navigator.onLine) {
        const authToken =
          typeof localStorage !== "undefined"
            ? localStorage.getItem("auth_token")
            : null;
        this.connect(authToken || undefined);
      }

      return false;
    }
  }

  public isConnected(): boolean {
    return this.socket !== null && this.socket.readyState === WebSocket.OPEN;
  }

  public authenticate(token: string): void {
    if (this.isConnected()) {
      // Send authentication message
      this.send({
        type: "authenticate",
        token,
      });
      this.authenticated = true;
    } else {
      // Connect with token
      this.connect(token);
    }
  }

  private handleOnline(): void {
    // Try to reconnect when coming back online
    if (!this.isConnected() && !this.isConnecting) {
      const authToken =
        typeof localStorage !== "undefined"
          ? localStorage.getItem("auth_token")
          : null;
      this.connect(authToken || undefined);
    }
  }

  private handleOffline(): void {
    // No need to do anything, the socket will close automatically
    // and onclose handler will be called
  }

  private scheduleReconnect(): void {
    this.reconnectAttempts++;

    // Exponential backoff with jitter
    const jitter = Math.random() * 0.3 + 0.85; // Random between 0.85 and 1.15
    const delay = Math.min(this.reconnectDelay * jitter, 30000); // Cap at 30 seconds

    setTimeout(() => {
      if (navigator.onLine && !this.isConnected() && !this.isConnecting) {
        const authToken =
          typeof localStorage !== "undefined"
            ? localStorage.getItem("auth_token")
            : null;
        this.connect(authToken || undefined);
      }
    }, delay);

    // Increase delay for next attempt
    this.reconnectDelay = Math.min(this.reconnectDelay * 2, 30000);
  }

  private flushMessageQueue(): void {
    if (
      this.socket &&
      this.socket.readyState === WebSocket.OPEN &&
      this.messageQueue.length > 0
    ) {
      const queue = [...this.messageQueue];
      this.messageQueue = [];

      for (const message of queue) {
        this.socket.send(JSON.stringify(message));
      }
    }
  }
}

class EventBus {
  private static instance: EventBus;
  private handlers: Map<EventType, EventHandler[]> = new Map();
  private storage: EventStorage;
  private replayInProgress: boolean = false;
  private websocket: WebSocketManager | null = null;

  private constructor(storage: EventStorage) {
    this.storage = storage;

    // Initialize WebSocket if URL is available
    const wsUrl =
      typeof import.meta !== "undefined"
        ? import.meta.env.VITE_WS_URL
        : undefined;
    if (wsUrl) {
      this.websocket = new WebSocketManager(wsUrl, this);

      // Connect if auth token is available
      if (typeof localStorage !== "undefined") {
        const authToken = localStorage.getItem("auth_token");
        if (authToken) {
          this.websocket.connect(authToken);
        }
      }
    }
  }

  public static getInstance(): EventBus {
    if (!EventBus.instance) {
      // Use in-memory storage by default
      EventBus.instance = new EventBus(new InMemoryEventStorage());
    }
    return EventBus.instance;
  }

  /**
   * Subscribe to an event type
   * @param eventType The type of event to subscribe to
   * @param handler The handler function to call when the event is published
   * @returns A function to unsubscribe the handler
   */
  public subscribe(eventType: EventType, handler: EventHandler): () => void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }

    this.handlers.get(eventType)!.push(handler);

    // Return unsubscribe function
    return () => {
      const handlers = this.handlers.get(eventType);
      if (handlers) {
        const index = handlers.indexOf(handler);
        if (index !== -1) {
          handlers.splice(index, 1);
        }
      }
    };
  }

  /**
   * Publish an event
   * @param event The event to publish
   * @param options Additional options for publishing
   */
  public async publish(
    event: Event,
    options?: { skipStorage?: boolean; skipWebSocket?: boolean },
  ): Promise<void> {
    // Ensure event has required properties
    const completeEvent: Event = {
      id: event.id || uuidv4(),
      type: event.type,
      timestamp: event.timestamp || new Date().toISOString(),
      source: event.source,
      payload: event.payload,
      metadata: event.metadata || {},
    };

    // Save event to storage unless explicitly skipped
    if (!options?.skipStorage) {
      await this.storage.saveEvent(completeEvent);
    }

    // Don't notify handlers if we're replaying events
    if (this.replayInProgress) return;

    // Notify handlers
    await this.notifyHandlers(completeEvent);

    // Send to WebSocket if connected and not skipped
    if (
      this.websocket &&
      this.websocket.isConnected() &&
      !options?.skipWebSocket
    ) {
      // Don't send WebSocket internal events over WebSocket to avoid loops
      if (!completeEvent.type.toString().startsWith("WEBSOCKET_")) {
        this.websocket.send(completeEvent);
      }
    }
  }

  /**
   * Notify all handlers for an event
   * @param event The event to notify handlers about
   */
  private async notifyHandlers(event: Event): Promise<void> {
    const handlers = this.handlers.get(event.type) || [];

    // Execute handlers asynchronously
    await Promise.all(
      handlers.map(async (handler) => {
        try {
          await handler(event);
        } catch (error) {
          console.error(`Error in event handler for ${event.type}:`, error);
        }
      }),
    );
  }

  /**
   * Get events from storage
   * @param filters Optional filters to apply
   * @returns Array of events matching the filters
   */
  public async getEvents(filters?: EventFilter): Promise<Event[]> {
    return this.storage.getEvents(filters);
  }

  /**
   * Get a specific event by ID
   * @param eventId The ID of the event to retrieve
   * @returns The event or null if not found
   */
  public async getEventById(eventId: string): Promise<Event | null> {
    return this.storage.getEventById(eventId);
  }

  /**
   * Replay events from storage
   * @param filters Optional filters to apply
   * @param skipHandlers Optional array of event types to skip handlers for
   */
  public async replayEvents(
    filters?: EventFilter,
    skipHandlers?: EventType[],
  ): Promise<void> {
    this.replayInProgress = true;

    try {
      const events = await this.storage.getEvents(filters);

      // Sort events by timestamp
      events.sort((a, b) => a.timestamp.localeCompare(b.timestamp));

      // Replay each event
      for (const event of events) {
        if (skipHandlers && skipHandlers.includes(event.type)) {
          continue;
        }

        await this.notifyHandlers(event);
      }
    } finally {
      this.replayInProgress = false;
    }
  }

  /**
   * Create and publish a BeneficiaryQualifiedEvent
   */
  public publishBeneficiaryQualified(
    source: string,
    beneficiaryId: string,
    clientType: string,
    qualificationCriteria: Record<string, any>,
  ): Promise<void> {
    const event: BeneficiaryQualifiedEvent = {
      id: uuidv4(),
      type: EventType.BENEFICIARY_QUALIFIED,
      timestamp: new Date().toISOString(),
      source,
      payload: {
        beneficiaryId,
        clientType,
        qualificationCriteria,
      },
    };

    return this.publish(event);
  }

  /**
   * Create and publish an AssessmentCompletedEvent
   */
  public publishAssessmentCompleted(
    source: string,
    assessmentId: string,
    beneficiaryId: string,
    clientType: string,
    rooms: any[],
    totalCost: number,
  ): Promise<void> {
    const event: AssessmentCompletedEvent = {
      id: uuidv4(),
      type: EventType.ASSESSMENT_COMPLETED,
      timestamp: new Date().toISOString(),
      source,
      payload: {
        assessmentId,
        beneficiaryId,
        clientType,
        rooms,
        totalCost,
      },
    };

    return this.publish(event);
  }

  /**
   * Create and publish a CommitteeDecisionEvent
   */
  public publishCommitteeDecision(
    source: string,
    committeeId: string,
    meetingId: string,
    decisionId: string,
    assessmentId: string,
    beneficiaryId: string,
    approved: boolean,
    comments: string,
    budget?: number,
  ): Promise<void> {
    const event: CommitteeDecisionEvent = {
      id: uuidv4(),
      type: EventType.COMMITTEE_DECISION,
      timestamp: new Date().toISOString(),
      source,
      payload: {
        committeeId,
        meetingId,
        decisionId,
        assessmentId,
        beneficiaryId,
        approved,
        comments,
        budget,
      },
    };

    return this.publish(event);
  }

  /**
   * Create and publish a ProjectCompletedEvent
   */
  public publishProjectCompleted(
    source: string,
    projectId: string,
    beneficiaryId: string,
    assessmentId: string,
    completionDate: string,
    finalCost: number,
    status: string,
  ): Promise<void> {
    const event: ProjectCompletedEvent = {
      id: uuidv4(),
      type: EventType.PROJECT_COMPLETED,
      timestamp: new Date().toISOString(),
      source,
      payload: {
        projectId,
        beneficiaryId,
        assessmentId,
        completionDate,
        finalCost,
        status,
      },
    };

    return this.publish(event);
  }

  /**
   * Create and publish a BudgetChangedEvent
   */
  public publishBudgetChanged(
    source: string,
    budgetId: string,
    previousAmount: number,
    newAmount: number,
    reason: string,
    affectedProjects?: string[],
    affectedPrograms?: string[],
  ): Promise<void> {
    const event: BudgetChangedEvent = {
      id: uuidv4(),
      type: EventType.BUDGET_CHANGED,
      timestamp: new Date().toISOString(),
      source,
      payload: {
        budgetId,
        previousAmount,
        newAmount,
        reason,
        affectedProjects,
        affectedPrograms,
      },
    };

    return this.publish(event);
  }
}

// Export singleton instance
export const eventBus = EventBus.getInstance();

// React hook for using the event bus
import { useEffect, useState } from "react";

export function useEventSubscription(
  eventType: EventType,
  handler: EventHandler,
) {
  useEffect(() => {
    // Subscribe to the event when the component mounts
    const unsubscribe = eventBus.subscribe(eventType, handler);

    // Unsubscribe when the component unmounts
    return unsubscribe;
  }, [eventType, handler]);
}

// WebSocket management methods
export const connectWebSocket = (authToken?: string): void => {
  const bus = EventBus.getInstance();
  if ((bus as any).websocket) {
    (bus as any).websocket.connect(authToken);
  }
};

export const disconnectWebSocket = (): void => {
  const bus = EventBus.getInstance();
  if ((bus as any).websocket) {
    (bus as any).websocket.disconnect();
  }
};

export const isWebSocketConnected = (): boolean => {
  const bus = EventBus.getInstance();
  return (bus as any).websocket ? (bus as any).websocket.isConnected() : false;
};

export const authenticateWebSocket = (token: string): void => {
  const bus = EventBus.getInstance();
  if ((bus as any).websocket) {
    (bus as any).websocket.authenticate(token);
  }
};

// React hook for WebSocket status
export function useWebSocketStatus() {
  const [isConnected, setIsConnected] = useState<boolean>(
    isWebSocketConnected(),
  );

  useEffect(() => {
    const handleConnected = () => setIsConnected(true);
    const handleDisconnected = () => setIsConnected(false);

    const connectSub = eventBus.subscribe(
      EventType.WEBSOCKET_CONNECTED,
      handleConnected,
    );
    const disconnectSub = eventBus.subscribe(
      EventType.WEBSOCKET_DISCONNECTED,
      handleDisconnected,
    );

    return () => {
      connectSub();
      disconnectSub();
    };
  }, []);

  return isConnected;
}

// React hook for network status
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== "undefined" ? navigator.onLine : true,
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleNetworkChange = (event: Event) => {
      setIsOnline(event.type === "online");
    };

    window.addEventListener("online", handleNetworkChange);
    window.addEventListener("offline", handleNetworkChange);

    return () => {
      window.removeEventListener("online", handleNetworkChange);
      window.removeEventListener("offline", handleNetworkChange);
    };
  }, []);

  return isOnline;
}

export default eventBus;
