import { useState, useEffect } from "react";
import { ClientType } from "../lib/forms/types";

// Define notification priority levels
export enum NotificationPriority {
  Low = "low",
  Medium = "medium",
  High = "high",
  Critical = "critical",
}

// Define notification types
export enum NotificationType {
  Info = "info",
  Success = "success",
  Warning = "warning",
  Error = "error",
  Task = "task",
  Reminder = "reminder",
  Update = "update",
  WorkflowTransition = "workflow_transition",
  WorkflowDelay = "workflow_delay",
  WorkflowCompletion = "workflow_completion",
  WorkflowBottleneck = "workflow_bottleneck",
  ClientSpecific = "client_specific",
}

// Define notification channel types
export enum NotificationChannel {
  InApp = "in_app",
  Email = "email",
  SMS = "sms",
  Push = "push",
  WhatsApp = "whatsapp",
}

// Define notification template interface
export interface NotificationTemplate {
  id: string;
  name: string;
  description: string;
  type: NotificationType;
  channels: NotificationChannel[];
  titleTemplate: string;
  bodyTemplate: string;
  defaultPriority: NotificationPriority;
  metadata?: Record<string, any>;
  clientTypes?: ClientType[];
  isClientSpecific?: boolean;
  workflowEvent?: string;
  workflowStageId?: string;
  roleRestrictions?: string[];
  localization?: Record<
    string,
    {
      titleTemplate: string;
      bodyTemplate: string;
    }
  >;
}

// Define notification interface
export interface Notification {
  id: string;
  templateId: string;
  userId: string;
  title: string;
  body: string;
  type: NotificationType;
  priority: NotificationPriority;
  channels: NotificationChannel[];
  isRead: boolean;
  isDelivered: Record<NotificationChannel, boolean>;
  createdAt: Date;
  expiresAt?: Date;
  data?: Record<string, any>;
  metadata?: Record<string, any>;
  clientType?: ClientType;
  workflowId?: string;
  workflowStageId?: string;
  readAt?: Date;
  deliveredAt?: Record<NotificationChannel, Date | null>;
  actionRequired?: boolean;
  actionUrl?: string;
  actionLabel?: string;
  actionCompleted?: boolean;
  actionCompletedAt?: Date;
}

// Define notification preference interface
export interface NotificationPreference {
  userId: string;
  channels: Partial<Record<NotificationType, NotificationChannel[]>>;
  disabledTypes: NotificationType[];
  quietHours?: {
    enabled: boolean;
    start: string; // HH:MM format
    end: string; // HH:MM format
    timezone: string;
  };
  metadata?: Record<string, any>;
  clientTypePreferences?: Partial<
    Record<
      ClientType,
      {
        channels: Partial<Record<NotificationType, NotificationChannel[]>>;
        disabledTypes: NotificationType[];
      }
    >
  >;
  workflowNotifications?: {
    transitionNotifications: boolean;
    delayNotifications: boolean;
    completionNotifications: boolean;
    bottleneckNotifications: boolean;
  };
  language?: string;
  emailFormat?: "html" | "text";
  smsFormat?: "short" | "detailed";
  frequency?: "immediate" | "hourly" | "daily" | "weekly";
  batchNotifications?: boolean;
}

// Define notification delivery result interface
export interface NotificationDeliveryResult {
  success: boolean;
  channel: NotificationChannel;
  error?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
  recipientId?: string;
  messageId?: string;
  deliveryStatus?: "sent" | "delivered" | "failed" | "pending";
  retryCount?: number;
  retryScheduled?: Date;
}

// Client-specific notification template interface
export interface ClientNotificationTemplate extends NotificationTemplate {
  clientType: ClientType;
  overrideDefault: boolean;
}

// Workflow notification configuration interface
export interface WorkflowNotificationConfig {
  workflowId: string;
  clientType: ClientType;
  stageTransitions: Record<
    string,
    {
      notifyRoles: string[];
      channels: NotificationChannel[];
      templateId?: string;
    }
  >;
  delayThresholds: Record<string, number>; // stageId -> hours before notification
  escalationRules: Record<
    string,
    {
      delayHours: number;
      escalateToRoles: string[];
    }
  >;
}

// Notification Service class
export class NotificationService {
  private static instance: NotificationService;
  private templates: Map<string, NotificationTemplate> = new Map();
  private clientTemplates: Map<string, ClientNotificationTemplate> = new Map();
  private notifications: Map<string, Notification> = new Map();
  private userNotifications: Map<string, string[]> = new Map(); // userId -> notificationIds
  private preferences: Map<string, NotificationPreference> = new Map(); // userId -> preferences
  private deliveryHandlers: Map<
    NotificationChannel,
    NotificationDeliveryHandler
  > = new Map();
  private workflowConfigs: Map<string, WorkflowNotificationConfig> = new Map(); // workflowId -> config
  private notificationStats: {
    sent: number;
    delivered: number;
    read: number;
    failed: number;
    actionCompleted: number;
  } = { sent: 0, delivered: 0, read: 0, failed: 0, actionCompleted: 0 };

  private constructor() {}

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // Register a notification template
  public registerTemplate(template: NotificationTemplate): void {
    this.templates.set(template.id, template);
  }

  // Register a client-specific notification template
  public registerClientTemplate(template: ClientNotificationTemplate): void {
    const key = `${template.id}_${template.clientType}`;
    this.clientTemplates.set(key, template);
  }

  // Register a workflow notification configuration
  public registerWorkflowConfig(config: WorkflowNotificationConfig): void {
    this.workflowConfigs.set(config.workflowId, config);
  }

  // Get workflow notification configuration
  public getWorkflowConfig(
    workflowId: string,
  ): WorkflowNotificationConfig | undefined {
    return this.workflowConfigs.get(workflowId);
  }

  // Register a delivery handler for a channel
  public registerDeliveryHandler(
    channel: NotificationChannel,
    handler: NotificationDeliveryHandler,
  ): void {
    this.deliveryHandlers.set(channel, handler);
  }

  // Get a template by ID, with optional client type override
  public getTemplate(
    templateId: string,
    clientType?: ClientType,
  ): NotificationTemplate | undefined {
    if (clientType) {
      const clientKey = `${templateId}_${clientType}`;
      const clientTemplate = this.clientTemplates.get(clientKey);
      if (clientTemplate && clientTemplate.overrideDefault) {
        return clientTemplate;
      }
    }
    return this.templates.get(templateId);
  }

  // Get all templates
  public getAllTemplates(): NotificationTemplate[] {
    return Array.from(this.templates.values());
  }

  // Get all client-specific templates
  public getClientTemplates(
    clientType?: ClientType,
  ): ClientNotificationTemplate[] {
    if (clientType) {
      return Array.from(this.clientTemplates.values()).filter(
        (template) => template.clientType === clientType,
      );
    }
    return Array.from(this.clientTemplates.values());
  }

  // Get templates by notification type
  public getTemplatesByType(type: NotificationType): NotificationTemplate[] {
    return Array.from(this.templates.values()).filter(
      (template) => template.type === type,
    );
  }

  // Get a notification by ID
  public getNotification(notificationId: string): Notification | undefined {
    return this.notifications.get(notificationId);
  }

  // Get notifications for a user
  public getUserNotifications(userId: string): Notification[] {
    const notificationIds = this.userNotifications.get(userId) || [];
    return notificationIds
      .map((id) => this.notifications.get(id))
      .filter((notification): notification is Notification => !!notification);
  }

  // Get unread notifications for a user
  public getUnreadNotifications(userId: string): Notification[] {
    return this.getUserNotifications(userId).filter(
      (notification) => !notification.isRead,
    );
  }

  // Get notifications by type for a user
  public getUserNotificationsByType(
    userId: string,
    type: NotificationType,
  ): Notification[] {
    return this.getUserNotifications(userId).filter(
      (notification) => notification.type === type,
    );
  }

  // Get workflow notifications for a user
  public getWorkflowNotifications(
    userId: string,
    workflowId: string,
  ): Notification[] {
    return this.getUserNotifications(userId).filter(
      (notification) => notification.workflowId === workflowId,
    );
  }

  // Get client-specific notifications for a user
  public getClientSpecificNotifications(
    userId: string,
    clientType: ClientType,
  ): Notification[] {
    return this.getUserNotifications(userId).filter(
      (notification) => notification.clientType === clientType,
    );
  }

  // Get user notification preferences
  public getUserPreferences(
    userId: string,
  ): NotificationPreference | undefined {
    return this.preferences.get(userId);
  }

  // Set user notification preferences
  public setUserPreferences(
    userId: string,
    preferences: NotificationPreference,
  ): void {
    this.preferences.set(userId, preferences);
  }

  // Update client-specific preferences for a user
  public updateClientPreferences(
    userId: string,
    clientType: ClientType,
    preferences: {
      channels?: Partial<Record<NotificationType, NotificationChannel[]>>;
      disabledTypes?: NotificationType[];
    },
  ): void {
    const userPrefs = this.preferences.get(userId);
    if (!userPrefs) return;

    if (!userPrefs.clientTypePreferences) {
      userPrefs.clientTypePreferences = {};
    }

    if (!userPrefs.clientTypePreferences[clientType]) {
      userPrefs.clientTypePreferences[clientType] = {
        channels: {},
        disabledTypes: [],
      };
    }

    if (preferences.channels) {
      userPrefs.clientTypePreferences[clientType].channels = {
        ...userPrefs.clientTypePreferences[clientType].channels,
        ...preferences.channels,
      };
    }

    if (preferences.disabledTypes) {
      userPrefs.clientTypePreferences[clientType].disabledTypes =
        preferences.disabledTypes;
    }

    this.preferences.set(userId, userPrefs);
  }

  // Update workflow notification preferences for a user
  public updateWorkflowPreferences(
    userId: string,
    preferences: {
      transitionNotifications?: boolean;
      delayNotifications?: boolean;
      completionNotifications?: boolean;
      bottleneckNotifications?: boolean;
    },
  ): void {
    const userPrefs = this.preferences.get(userId);
    if (!userPrefs) return;

    if (!userPrefs.workflowNotifications) {
      userPrefs.workflowNotifications = {
        transitionNotifications: true,
        delayNotifications: true,
        completionNotifications: true,
        bottleneckNotifications: true,
      };
    }

    userPrefs.workflowNotifications = {
      ...userPrefs.workflowNotifications,
      ...preferences,
    };

    this.preferences.set(userId, userPrefs);
  }

  // Send a notification using a template
  public async sendNotification(
    templateId: string,
    userId: string,
    data: Record<string, any> = {},
    options: {
      priority?: NotificationPriority;
      channels?: NotificationChannel[];
      expiresAt?: Date;
      metadata?: Record<string, any>;
      clientType?: ClientType;
      workflowId?: string;
      workflowStageId?: string;
      actionRequired?: boolean;
      actionUrl?: string;
      actionLabel?: string;
    } = {},
  ): Promise<string | null> {
    try {
      // Get template with client-specific override if available
      const template = this.getTemplate(templateId, options.clientType);
      if (!template) {
        console.error(`Template with ID ${templateId} not found`);
        return null;
      }

      // Check if template is client-specific and matches the client type
      if (
        template.isClientSpecific &&
        template.clientTypes &&
        options.clientType &&
        !template.clientTypes.includes(options.clientType)
      ) {
        console.log(
          `Template ${templateId} is not applicable for client type ${options.clientType}`,
        );
        return null;
      }

      // Get user preferences
      const userPreferences = this.preferences.get(userId);

      // Check if user has disabled this notification type (considering client-specific preferences)
      let isDisabled = false;

      if (userPreferences) {
        // Check client-specific preferences first
        if (
          options.clientType &&
          userPreferences.clientTypePreferences?.[options.clientType]
        ) {
          isDisabled = userPreferences.clientTypePreferences[
            options.clientType
          ].disabledTypes.includes(template.type);
        }

        // If not determined by client preferences, check general preferences
        if (!isDisabled) {
          isDisabled = userPreferences.disabledTypes.includes(template.type);
        }
      }

      // Always allow critical notifications
      if (isDisabled && template.type !== NotificationType.Critical) {
        console.log(
          `User ${userId} has disabled notifications of type ${template.type}`,
        );
        return null;
      }

      // Check workflow notification preferences
      if (options.workflowId && userPreferences?.workflowNotifications) {
        if (
          template.type === NotificationType.WorkflowTransition &&
          !userPreferences.workflowNotifications.transitionNotifications
        ) {
          console.log(
            `User ${userId} has disabled workflow transition notifications`,
          );
          return null;
        }
        if (
          template.type === NotificationType.WorkflowDelay &&
          !userPreferences.workflowNotifications.delayNotifications
        ) {
          console.log(
            `User ${userId} has disabled workflow delay notifications`,
          );
          return null;
        }
        if (
          template.type === NotificationType.WorkflowCompletion &&
          !userPreferences.workflowNotifications.completionNotifications
        ) {
          console.log(
            `User ${userId} has disabled workflow completion notifications`,
          );
          return null;
        }
        if (
          template.type === NotificationType.WorkflowBottleneck &&
          !userPreferences.workflowNotifications.bottleneckNotifications
        ) {
          console.log(
            `User ${userId} has disabled workflow bottleneck notifications`,
          );
          return null;
        }
      }

      // Determine channels to use
      let channels = options.channels || template.channels;

      // Apply user channel preferences if available (considering client-specific preferences)
      if (userPreferences) {
        // Check client-specific channel preferences first
        if (
          options.clientType &&
          userPreferences.clientTypePreferences?.[options.clientType]?.channels[
            template.type
          ]
        ) {
          channels =
            userPreferences.clientTypePreferences[options.clientType].channels[
              template.type
            ] || channels;
        }
        // If not overridden by client preferences, check general preferences
        else if (userPreferences.channels[template.type]) {
          channels = userPreferences.channels[template.type] || channels;
        }
      }

      // Check quiet hours for non-critical notifications
      if (
        template.type !== NotificationType.Critical &&
        this.isInQuietHours(userId)
      ) {
        // During quiet hours, only send in-app notifications
        channels = channels.filter(
          (channel) => channel === NotificationChannel.InApp,
        );

        if (channels.length === 0) {
          console.log(
            `Skipping notification for user ${userId} due to quiet hours`,
          );
          return null;
        }
      }

      // Render notification content with localization support
      let titleTemplate = template.titleTemplate;
      let bodyTemplate = template.bodyTemplate;

      // Apply localization if available
      if (
        template.localization &&
        userPreferences?.language &&
        template.localization[userPreferences.language]
      ) {
        titleTemplate =
          template.localization[userPreferences.language].titleTemplate;
        bodyTemplate =
          template.localization[userPreferences.language].bodyTemplate;
      }

      const title = this.renderTemplate(titleTemplate, data);
      const body = this.renderTemplate(bodyTemplate, data);

      // Create notification
      const notificationId = `notification_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      const notification: Notification = {
        id: notificationId,
        templateId,
        userId,
        title,
        body,
        type: template.type,
        priority: options.priority || template.defaultPriority,
        channels,
        isRead: false,
        isDelivered: Object.values(NotificationChannel).reduce(
          (acc, channel) => {
            acc[channel] = false;
            return acc;
          },
          {} as Record<NotificationChannel, boolean>,
        ),
        createdAt: new Date(),
        expiresAt: options.expiresAt,
        data,
        metadata: options.metadata,
        clientType: options.clientType,
        workflowId: options.workflowId,
        workflowStageId: options.workflowStageId,
        deliveredAt: Object.values(NotificationChannel).reduce(
          (acc, channel) => {
            acc[channel] = null;
            return acc;
          },
          {} as Record<NotificationChannel, Date | null>,
        ),
        actionRequired: options.actionRequired || false,
        actionUrl: options.actionUrl,
        actionLabel: options.actionLabel,
        actionCompleted: false,
      };

      // Store notification
      this.notifications.set(notificationId, notification);

      // Add to user's notifications
      const userNotificationIds = this.userNotifications.get(userId) || [];
      userNotificationIds.push(notificationId);
      this.userNotifications.set(userId, userNotificationIds);

      // Update notification stats
      this.notificationStats.sent++;

      // Check if notifications should be batched based on user preferences
      const shouldBatch =
        userPreferences?.batchNotifications &&
        userPreferences.frequency !== "immediate";

      if (shouldBatch) {
        // Store for later batch delivery
        console.log(
          `Batching notification ${notificationId} for user ${userId} based on preference: ${userPreferences?.frequency}`,
        );
        // In a real implementation, you would store this for batch processing
      } else {
        // Deliver notification through each channel immediately
        for (const channel of channels) {
          this.deliverNotification(notificationId, channel).catch((error) => {
            console.error(
              `Error delivering notification through ${channel}:`,
              error instanceof Error ? error.message : String(error),
            );
            this.notificationStats.failed++;
          });
        }
      }

      return notificationId;
    } catch (error) {
      console.error(
        "Error sending notification:",
        error instanceof Error ? error.message : String(error),
      );
      return null;
    }
  }

  // Mark a notification as read
  public markAsRead(notificationId: string): boolean {
    const notification = this.notifications.get(notificationId);
    if (!notification) {
      return false;
    }

    notification.isRead = true;
    notification.readAt = new Date();
    this.notifications.set(notificationId, notification);
    this.notificationStats.read++;
    return true;
  }

  // Mark a notification action as completed
  public markActionCompleted(notificationId: string): boolean {
    const notification = this.notifications.get(notificationId);
    if (!notification || !notification.actionRequired) {
      return false;
    }

    notification.actionCompleted = true;
    notification.actionCompletedAt = new Date();
    this.notifications.set(notificationId, notification);
    this.notificationStats.actionCompleted++;
    return true;
  }

  // Mark all notifications as read for a user
  public markAllAsRead(userId: string): number {
    const notificationIds = this.userNotifications.get(userId) || [];
    let count = 0;

    for (const id of notificationIds) {
      const notification = this.notifications.get(id);
      if (notification && !notification.isRead) {
        notification.isRead = true;
        this.notifications.set(id, notification);
        count++;
      }
    }

    return count;
  }

  // Delete a notification
  public deleteNotification(notificationId: string): boolean {
    const notification = this.notifications.get(notificationId);
    if (!notification) {
      return false;
    }

    // Remove from user's notifications
    const userNotificationIds =
      this.userNotifications.get(notification.userId) || [];
    const updatedIds = userNotificationIds.filter(
      (id) => id !== notificationId,
    );
    this.userNotifications.set(notification.userId, updatedIds);

    // Remove notification
    this.notifications.delete(notificationId);

    return true;
  }

  // Delete all notifications for a user
  public deleteAllNotifications(userId: string): number {
    const notificationIds = this.userNotifications.get(userId) || [];
    const count = notificationIds.length;

    // Remove all notifications
    for (const id of notificationIds) {
      this.notifications.delete(id);
    }

    // Clear user's notification list
    this.userNotifications.set(userId, []);

    return count;
  }

  // Clean up expired notifications
  public cleanupExpiredNotifications(): number {
    const now = new Date();
    let count = 0;

    for (const [id, notification] of this.notifications.entries()) {
      if (notification.expiresAt && notification.expiresAt <= now) {
        // Remove from user's notifications
        const userNotificationIds =
          this.userNotifications.get(notification.userId) || [];
        const updatedIds = userNotificationIds.filter((nid) => nid !== id);
        this.userNotifications.set(notification.userId, updatedIds);

        // Remove notification
        this.notifications.delete(id);
        count++;
      }
    }

    return count;
  }

  // Get notification statistics
  public getNotificationStats(): {
    sent: number;
    delivered: number;
    read: number;
    failed: number;
    actionCompleted: number;
  } {
    return { ...this.notificationStats };
  }

  // Send workflow transition notification
  public async sendWorkflowTransitionNotification(
    workflowId: string,
    fromStageId: string,
    toStageId: string,
    userId: string,
    clientType: ClientType,
    data: Record<string, any> = {},
  ): Promise<string | null> {
    // Check if we have a workflow config for this workflow
    const workflowConfig = this.workflowConfigs.get(workflowId);
    if (!workflowConfig) {
      console.log(
        `No workflow notification config found for workflow ${workflowId}`,
      );
      return null;
    }

    // Check if we have a transition config for this stage
    const transitionKey = `${fromStageId}_${toStageId}`;
    const transitionConfig = workflowConfig.stageTransitions[transitionKey];
    if (!transitionConfig) {
      console.log(
        `No transition notification config found for transition ${transitionKey}`,
      );
      return null;
    }

    // Use specified template or default workflow transition template
    const templateId =
      transitionConfig.templateId || "workflow_transition_default";

    return this.sendNotification(templateId, userId, data, {
      channels: transitionConfig.channels,
      clientType,
      workflowId,
      workflowStageId: toStageId,
      actionRequired: false,
    });
  }

  // Send workflow delay notification
  public async sendWorkflowDelayNotification(
    workflowId: string,
    stageId: string,
    userId: string,
    clientType: ClientType,
    delayHours: number,
    data: Record<string, any> = {},
  ): Promise<string | null> {
    // Check if we have a workflow config for this workflow
    const workflowConfig = this.workflowConfigs.get(workflowId);
    if (!workflowConfig) {
      return null;
    }

    // Check if delay exceeds threshold for this stage
    const delayThreshold = workflowConfig.delayThresholds[stageId];
    if (!delayThreshold || delayHours < delayThreshold) {
      return null;
    }

    // Check if we need to escalate
    const escalationRule = workflowConfig.escalationRules[stageId];
    const needsEscalation =
      escalationRule && delayHours >= escalationRule.delayHours;

    const templateId = needsEscalation
      ? "workflow_delay_escalation"
      : "workflow_delay_notification";

    return this.sendNotification(
      templateId,
      userId,
      {
        ...data,
        delayHours,
        isEscalated: needsEscalation,
      },
      {
        priority: needsEscalation
          ? NotificationPriority.High
          : NotificationPriority.Medium,
        clientType,
        workflowId,
        workflowStageId: stageId,
        actionRequired: true,
        actionUrl: `/workflows/${workflowId}/stages/${stageId}`,
        actionLabel: "Review Delayed Stage",
      },
    );
  }

  // Send workflow bottleneck notification
  public async sendWorkflowBottleneckNotification(
    workflowId: string,
    stageId: string,
    userId: string,
    clientType: ClientType,
    bottleneckData: Record<string, any>,
  ): Promise<string | null> {
    return this.sendNotification(
      "workflow_bottleneck_notification",
      userId,
      bottleneckData,
      {
        priority: NotificationPriority.High,
        clientType,
        workflowId,
        workflowStageId: stageId,
        actionRequired: true,
        actionUrl: `/workflows/${workflowId}/analytics`,
        actionLabel: "View Bottleneck Analysis",
      },
    );
  }

  // Deliver a notification through a specific channel
  private async deliverNotification(
    notificationId: string,
    channel: NotificationChannel,
  ): Promise<NotificationDeliveryResult> {
    const notification = this.notifications.get(notificationId);
    if (!notification) {
      return {
        success: false,
        channel,
        error: `Notification with ID ${notificationId} not found`,
        timestamp: new Date(),
      };
    }

    try {
      const handler = this.deliveryHandlers.get(channel);
      if (!handler) {
        return {
          success: false,
          channel,
          error: `No delivery handler registered for channel ${channel}`,
          timestamp: new Date(),
        };
      }

      // Deliver notification
      const result = await handler.deliver(notification);

      // Update delivery status
      notification.isDelivered[channel] = result.success;
      notification.deliveredAt[channel] = result.success ? new Date() : null;
      this.notifications.set(notificationId, notification);

      if (result.success) {
        this.notificationStats.delivered++;
      } else {
        this.notificationStats.failed++;
      }

      return result;
    } catch (error) {
      return {
        success: false,
        channel,
        error: `Delivery error: ${error instanceof Error ? error.message : String(error)}`,
        timestamp: new Date(),
      };
    }
  }

  // Check if current time is within user's quiet hours
  private isInQuietHours(userId: string): boolean {
    const preferences = this.preferences.get(userId);
    if (!preferences?.quietHours?.enabled) {
      return false;
    }

    const { start, end, timezone } = preferences.quietHours;
    const now = new Date();

    // Convert to user's timezone
    const userTime = new Date(
      now.toLocaleString("en-US", { timeZone: timezone }),
    );
    const userHour = userTime.getHours();
    const userMinute = userTime.getMinutes();
    const userTimeMinutes = userHour * 60 + userMinute;

    // Parse quiet hours
    const [startHour, startMinute] = start.split(":").map(Number);
    const [endHour, endMinute] = end.split(":").map(Number);
    const startTimeMinutes = startHour * 60 + startMinute;
    const endTimeMinutes = endHour * 60 + endMinute;

    if (startTimeMinutes <= endTimeMinutes) {
      // Normal case: start time is before end time
      return (
        userTimeMinutes >= startTimeMinutes && userTimeMinutes <= endTimeMinutes
      );
    } else {
      // Overnight case: start time is after end time
      return (
        userTimeMinutes >= startTimeMinutes || userTimeMinutes <= endTimeMinutes
      );
    }
  }

  // Render a template with data
  private renderTemplate(template: string, data: Record<string, any>): string {
    // Support for nested properties using dot notation
    return template.replace(/\{\{([\w\.]+)\}\}/g, (match, path) => {
      const keys = path.split(".");
      let value = data;

      for (const key of keys) {
        if (value === undefined || value === null) {
          return match; // Return the original placeholder if path is invalid
        }
        value = value[key];
      }

      return value !== undefined ? String(value) : match;
    });
  }

  // Process batched notifications (would be called by a scheduler)
  public async processBatchedNotifications(): Promise<number> {
    // In a real implementation, this would process notifications based on user frequency preferences
    console.log("Processing batched notifications...");
    return 0; // Return number of processed notifications
  }
}

// Notification Delivery Handler interface
export interface NotificationDeliveryHandler {
  deliver(notification: Notification): Promise<NotificationDeliveryResult>;
}

// In-App Notification Delivery Handler
export class InAppNotificationHandler implements NotificationDeliveryHandler {
  async deliver(
    notification: Notification,
  ): Promise<NotificationDeliveryResult> {
    try {
      // In a real implementation, this would store the notification for display in the UI
      console.log(
        `Delivering in-app notification to user ${notification.userId}`,
      );

      // Add client-specific logging
      if (notification.clientType) {
        console.log(`Client type: ${notification.clientType}`);
      }

      // Add workflow-specific logging
      if (notification.workflowId) {
        console.log(
          `Workflow ID: ${notification.workflowId}, Stage ID: ${notification.workflowStageId || "N/A"}`,
        );
      }

      return {
        success: true,
        channel: NotificationChannel.InApp,
        timestamp: new Date(),
        recipientId: notification.userId,
        messageId: `in_app_${Date.now()}`,
        deliveryStatus: "delivered",
      };
    } catch (error) {
      return {
        success: false,
        channel: NotificationChannel.InApp,
        error: `In-app delivery error: ${error instanceof Error ? error.message : String(error)}`,
        timestamp: new Date(),
        recipientId: notification.userId,
        deliveryStatus: "failed",
      };
    }
  }
}

// Email Notification Delivery Handler
export class EmailNotificationHandler implements NotificationDeliveryHandler {
  private emailService: any; // Would be an actual email service in a real implementation

  constructor(emailService: any) {
    this.emailService = emailService;
  }

  async deliver(
    notification: Notification,
  ): Promise<NotificationDeliveryResult> {
    try {
      // In a real implementation, this would send an email
      console.log(`Sending email notification to user ${notification.userId}`);

      // Get user preferences for email format
      const userPreferences =
        NotificationService.getInstance().getUserPreferences(
          notification.userId,
        );
      const emailFormat = userPreferences?.emailFormat || "html";

      // Add client-specific template customization
      let emailTemplate = "default";
      if (notification.clientType) {
        console.log(
          `Using client-specific email template for ${notification.clientType}`,
        );
        emailTemplate = `${notification.clientType.toLowerCase()}_template`;
      }

      // Add workflow-specific content
      let additionalContent = "";
      if (notification.workflowId) {
        additionalContent = `Related to workflow: ${notification.workflowId}`;
        if (notification.workflowStageId) {
          additionalContent += `, stage: ${notification.workflowStageId}`;
        }
      }

      // Simulate email sending
      await new Promise((resolve) => setTimeout(resolve, 500));

      const messageId = `email_${Date.now()}`;

      return {
        success: true,
        channel: NotificationChannel.Email,
        timestamp: new Date(),
        recipientId: notification.userId,
        messageId,
        deliveryStatus: "delivered",
        metadata: {
          messageId,
          template: emailTemplate,
          format: emailFormat,
          additionalContent,
        },
      };
    } catch (error) {
      return {
        success: false,
        channel: NotificationChannel.Email,
        error: `Email delivery error: ${error instanceof Error ? error.message : String(error)}`,
        timestamp: new Date(),
        recipientId: notification.userId,
        deliveryStatus: "failed",
        retryCount: 0,
        retryScheduled: new Date(Date.now() + 15 * 60 * 1000), // Retry in 15 minutes
      };
    }
  }
}

// SMS Notification Delivery Handler
export class SmsNotificationHandler implements NotificationDeliveryHandler {
  private smsService: any; // Would be an actual SMS service in a real implementation

  constructor(smsService: any) {
    this.smsService = smsService;
  }

  async deliver(
    notification: Notification,
  ): Promise<NotificationDeliveryResult> {
    try {
      // In a real implementation, this would send an SMS
      console.log(`Sending SMS notification to user ${notification.userId}`);

      // Get user preferences for SMS format
      const userPreferences =
        NotificationService.getInstance().getUserPreferences(
          notification.userId,
        );
      const smsFormat = userPreferences?.smsFormat || "detailed";

      // Prepare SMS content based on format preference
      let smsContent = notification.title;
      if (smsFormat === "detailed") {
        smsContent += `: ${notification.body.substring(0, 100)}`;
        if (notification.body.length > 100) smsContent += "...";
      }

      // Add action URL if required
      if (notification.actionRequired && notification.actionUrl) {
        smsContent += ` ${notification.actionLabel || "Action required"}: ${notification.actionUrl}`;
      }

      // Simulate SMS sending
      await new Promise((resolve) => setTimeout(resolve, 500));

      const messageId = `sms_${Date.now()}`;

      return {
        success: true,
        channel: NotificationChannel.SMS,
        timestamp: new Date(),
        recipientId: notification.userId,
        messageId,
        deliveryStatus: "delivered",
        metadata: {
          messageId,
          format: smsFormat,
          contentLength: smsContent.length,
        },
      };
    } catch (error) {
      return {
        success: false,
        channel: NotificationChannel.SMS,
        error: `SMS delivery error: ${error instanceof Error ? error.message : String(error)}`,
        timestamp: new Date(),
        recipientId: notification.userId,
        deliveryStatus: "failed",
        retryCount: 0,
        retryScheduled: new Date(Date.now() + 5 * 60 * 1000), // Retry in 5 minutes
      };
    }
  }
}

// WhatsApp Notification Delivery Handler
export class WhatsAppNotificationHandler
  implements NotificationDeliveryHandler
{
  private whatsappService: any; // Would be an actual WhatsApp service in a real implementation

  constructor(whatsappService: any) {
    this.whatsappService = whatsappService;
  }

  async deliver(
    notification: Notification,
  ): Promise<NotificationDeliveryResult> {
    try {
      // In a real implementation, this would send a WhatsApp message
      console.log(
        `Sending WhatsApp notification to user ${notification.userId}`,
      );

      // Simulate WhatsApp sending
      await new Promise((resolve) => setTimeout(resolve, 500));

      const messageId = `whatsapp_${Date.now()}`;

      return {
        success: true,
        channel: NotificationChannel.WhatsApp,
        timestamp: new Date(),
        recipientId: notification.userId,
        messageId,
        deliveryStatus: "delivered",
        metadata: {
          messageId,
          hasMedia: false,
        },
      };
    } catch (error) {
      return {
        success: false,
        channel: NotificationChannel.WhatsApp,
        error: `WhatsApp delivery error: ${error instanceof Error ? error.message : String(error)}`,
        timestamp: new Date(),
        recipientId: notification.userId,
        deliveryStatus: "failed",
      };
    }
  }
}

// Push Notification Delivery Handler
export class PushNotificationHandler implements NotificationDeliveryHandler {
  private pushService: any; // Would be an actual push notification service in a real implementation

  constructor(pushService: any) {
    this.pushService = pushService;
  }

  async deliver(
    notification: Notification,
  ): Promise<NotificationDeliveryResult> {
    try {
      // In a real implementation, this would send a push notification
      console.log(`Sending push notification to user ${notification.userId}`);

      // Simulate push notification sending
      await new Promise((resolve) => setTimeout(resolve, 300));

      const messageId = `push_${Date.now()}`;

      return {
        success: true,
        channel: NotificationChannel.Push,
        timestamp: new Date(),
        recipientId: notification.userId,
        messageId,
        deliveryStatus: "delivered",
        metadata: {
          messageId,
          platform: "mobile", // or "web"
        },
      };
    } catch (error) {
      return {
        success: false,
        channel: NotificationChannel.Push,
        error: `Push notification delivery error: ${error instanceof Error ? error.message : String(error)}`,
        timestamp: new Date(),
        recipientId: notification.userId,
        deliveryStatus: "failed",
      };
    }
  }
}

// Export default instance
export default NotificationService.getInstance();
