// Integration Service for Barakatna Platform
// Provides a unified gateway for all external system integrations

// Define integration types
export enum IntegrationType {
  API = "api",
  FileSystem = "file_system",
  Database = "database",
  MessageQueue = "message_queue",
  Email = "email",
  SMS = "sms",
  Payment = "payment",
  GIS = "gis",
  Calendar = "calendar",
}

// Define integration provider interface
export interface IntegrationProvider {
  id: string;
  name: string;
  type: IntegrationType;
  config: Record<string, any>;
  isActive: boolean;
}

// Define integration request interface
export interface IntegrationRequest {
  providerId: string;
  action: string;
  payload?: any;
  options?: Record<string, any>;
}

// Define integration response interface
export interface IntegrationResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  metadata?: Record<string, any>;
}

// Integration Service class
class IntegrationServiceClass {
  private providers: Map<string, IntegrationProvider> = new Map();
  private adapters: Map<string, IntegrationAdapter> = new Map();

  constructor() {
    this.initializeDefaultProviders();
  }

  private initializeDefaultProviders() {
    // Register order management system provider
    this.registerProvider({
      id: "order-management-system",
      name: "Order Management System",
      type: IntegrationType.API,
      config: {
        baseUrl:
          import.meta.env.VITE_ORDER_MANAGEMENT_API || "/api/order-management",
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 30000,
      },
      isActive: true,
    });

    // Register document management system provider
    this.registerProvider({
      id: "document-management-system",
      name: "Document Management System",
      type: IntegrationType.API,
      config: {
        baseUrl:
          import.meta.env.VITE_DOCUMENT_MANAGEMENT_API ||
          "/api/document-management",
        headers: {
          "Content-Type": "application/json",
        },
        timeout: 30000,
      },
      isActive: true,
    });

    // Register email notification provider
    this.registerProvider({
      id: "email-notification-service",
      name: "Email Notification Service",
      type: IntegrationType.Email,
      config: {
        apiKey: import.meta.env.VITE_EMAIL_SERVICE_API_KEY || "demo-key",
        from: "notifications@barakatna.ae",
      },
      isActive: true,
    });

    // Register SMS notification provider
    this.registerProvider({
      id: "sms-notification-service",
      name: "SMS Notification Service",
      type: IntegrationType.SMS,
      config: {
        apiKey: import.meta.env.VITE_SMS_SERVICE_API_KEY || "demo-key",
        senderId: "Barakatna",
      },
      isActive: true,
    });

    // Initialize adapters for each provider
    this.initializeAdapters();
  }

  private initializeAdapters() {
    // Create adapters for each provider based on their type
    for (const provider of this.providers.values()) {
      switch (provider.type) {
        case IntegrationType.API:
          this.registerAdapter(
            provider.id,
            new ApiIntegrationAdapter(provider),
          );
          break;
        case IntegrationType.Email:
          this.registerAdapter(
            provider.id,
            new EmailIntegrationAdapter(provider),
          );
          break;
        case IntegrationType.SMS:
          this.registerAdapter(
            provider.id,
            new SmsIntegrationAdapter(provider),
          );
          break;
        case IntegrationType.FileSystem:
          this.registerAdapter(
            provider.id,
            new FileSystemIntegrationAdapter(provider),
          );
          break;
        // Add more adapter types as needed
      }
    }
  }

  // Register a provider
  public registerProvider(provider: IntegrationProvider): void {
    this.providers.set(provider.id, provider);
  }

  // Register an adapter
  public registerAdapter(
    providerId: string,
    adapter: IntegrationAdapter,
  ): void {
    this.adapters.set(providerId, adapter);
  }

  // Get a provider by ID
  public getProvider(providerId: string): IntegrationProvider | undefined {
    return this.providers.get(providerId);
  }

  // Get all providers
  public getAllProviders(): IntegrationProvider[] {
    return Array.from(this.providers.values());
  }

  // Get providers by type
  public getProvidersByType(type: IntegrationType): IntegrationProvider[] {
    return Array.from(this.providers.values()).filter(
      (provider) => provider.type === type,
    );
  }

  // Execute an integration request
  public async execute<T = any>(
    request: IntegrationRequest,
  ): Promise<IntegrationResponse<T>> {
    try {
      const provider = this.providers.get(request.providerId);
      if (!provider) {
        return {
          success: false,
          error: `Provider with ID ${request.providerId} not found`,
        };
      }

      if (!provider.isActive) {
        return {
          success: false,
          error: `Provider with ID ${request.providerId} is not active`,
        };
      }

      const adapter = this.adapters.get(request.providerId);
      if (!adapter) {
        return {
          success: false,
          error: `Adapter for provider with ID ${request.providerId} not found`,
        };
      }

      return await adapter.execute<T>(request);
    } catch (error) {
      return {
        success: false,
        error: `Integration execution error: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }
}

// Integration Adapter interface
export interface IntegrationAdapter {
  execute<T = any>(
    request: IntegrationRequest,
  ): Promise<IntegrationResponse<T>>;
}

// Base Integration Adapter class
export abstract class BaseIntegrationAdapter implements IntegrationAdapter {
  protected provider: IntegrationProvider;

  constructor(provider: IntegrationProvider) {
    this.provider = provider;
  }

  abstract execute<T = any>(
    request: IntegrationRequest,
  ): Promise<IntegrationResponse<T>>;
}

// API Integration Adapter
export class ApiIntegrationAdapter extends BaseIntegrationAdapter {
  async execute<T = any>(
    request: IntegrationRequest,
  ): Promise<IntegrationResponse<T>> {
    try {
      const { baseUrl, headers = {}, timeout = 30000 } = this.provider.config;
      const { action, payload, options = {} } = request;

      const url = `${baseUrl}${action}`;
      const method = options.method || "GET";
      const requestHeaders = { ...headers, ...options.headers };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        method,
        headers: requestHeaders,
        body: payload ? JSON.stringify(payload) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      return {
        success: response.ok,
        data: response.ok ? data : undefined,
        error: !response.ok ? data.message || response.statusText : undefined,
        metadata: {
          status: response.status,
          headers: Object.fromEntries(response.headers.entries()),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: `API request error: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }
}

// File System Integration Adapter
export class FileSystemIntegrationAdapter extends BaseIntegrationAdapter {
  async execute<T = any>(
    request: IntegrationRequest,
  ): Promise<IntegrationResponse<T>> {
    // Implementation would depend on the environment (browser vs Node.js)
    // For browser, this might use the File System Access API
    // For Node.js, this would use the fs module
    return {
      success: false,
      error: "File System integration not implemented for this environment",
    };
  }
}

// Email Integration Adapter
export class EmailIntegrationAdapter extends BaseIntegrationAdapter {
  async execute<T = any>(
    request: IntegrationRequest,
  ): Promise<IntegrationResponse<T>> {
    try {
      const { action, payload } = request;

      if (action !== "send") {
        return {
          success: false,
          error: `Unsupported action: ${action}`,
        };
      }

      const { to, subject, body, attachments } = payload;

      // In a real implementation, this would use an email service API
      console.log(`Sending email to ${to} with subject: ${subject}`);

      return {
        success: true,
        data: { messageId: `email_${Date.now()}` } as unknown as T,
        metadata: {
          sentAt: new Date().toISOString(),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: `Email sending error: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }
}

// SMS Integration Adapter
export class SmsIntegrationAdapter extends BaseIntegrationAdapter {
  async execute<T = any>(
    request: IntegrationRequest,
  ): Promise<IntegrationResponse<T>> {
    try {
      const { action, payload } = request;

      if (action !== "send") {
        return {
          success: false,
          error: `Unsupported action: ${action}`,
        };
      }

      const { to, message } = payload;

      // In a real implementation, this would use an SMS service API
      console.log(`Sending SMS to ${to}: ${message}`);

      return {
        success: true,
        data: { messageId: `sms_${Date.now()}` } as unknown as T,
        metadata: {
          sentAt: new Date().toISOString(),
        },
      };
    } catch (error) {
      return {
        success: false,
        error: `SMS sending error: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }
}

// Create and export default instance
export const integrationService = new IntegrationServiceClass();
