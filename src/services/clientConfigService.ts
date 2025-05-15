/**
 * Client Configuration Service
 *
 * This service manages client-specific configurations and settings.
 * It provides methods to load, save, and apply client-specific settings
 * throughout the application.
 */

import { ClientType } from "@/lib/forms/types";
import { clientApi } from "@/lib/api/client/clientApi";

// Client configuration interface
export interface ClientConfig {
  clientTypeId: number;
  version: number;
  lastUpdated: Date;
  updatedBy?: string;
  general: {
    enableAssessments: boolean;
    enableProjects: boolean;
    enableFinancials: boolean;
    maxProjectsPerBeneficiary: number;
    requireApproval: boolean;
    notes: string;
    language?: string;
    rtlSupport?: boolean;
    theme?: {
      primaryColor: string;
      secondaryColor: string;
      logoUrl?: string;
      fontFamily?: string;
    };
  };
  pricing: {
    usesCustomPriceList: boolean;
    priceListId: string;
    discountPercentage: number;
    taxPercentage: number;
    allowNegotiation: boolean;
    currency?: string;
    vatRegistered?: boolean;
    vatNumber?: string;
    paymentTerms?: string;
  };
  workflow: {
    requiresCommitteeApproval: boolean;
    skipFinancialVerification: boolean;
    autoCloseProjects: boolean;
    maxDaysToComplete: number;
    approvalLevels?: number;
    notificationFrequency?: "daily" | "weekly" | "immediate";
    escalationThreshold?: number;
    reminderDays?: number;
  };
  beneficiary?: {
    requiresVerification?: boolean;
    verificationDocuments?: string[];
    followUpFrequency?: number;
    priorityCategories?: string[];
    eligibilityCriteria?: Record<string, any>;
  };
  security?: {
    approvalHierarchy?: string;
    documentRequirements?: string[];
    dataRetentionPeriod?: number;
    accessLevels?: string[];
    twoFactorRequired?: boolean;
    passwordPolicy?: Record<string, any>;
  };
  integration?: {
    externalSystems?: string[];
    apiKeys?: Record<string, string>;
    webhookEndpoints?: string[];
    dataExportSchedule?: string;
    importSettings?: Record<string, any>;
  };
  customFields?: Record<
    string,
    {
      type: string;
      label: string;
      required?: boolean;
      options?: string[];
      defaultValue?: any;
      validation?: string;
      dependsOn?: string;
      visibilityCondition?: string;
    }
  >;
  [key: string]: any; // Allow for additional configuration sections
}

// Event types for client configuration changes
export type ClientConfigChangeEvent = {
  clientTypeId: number;
  configType:
    | "active"
    | "modified"
    | "created"
    | "deleted"
    | "restored"
    | "snapshot";
  timestamp: Date;
  version?: number;
  changedBy?: string;
  changes?: Record<string, { oldValue: any; newValue: any }>;
};

type ClientConfigChangeListener = (event: ClientConfigChangeEvent) => void;

class ClientConfigService {
  private static instance: ClientConfigService;
  private clientConfigs: Map<number, ClientConfig> = new Map();
  private configHistory: Map<number, ClientConfig[]> = new Map();
  private configSnapshots: Map<number, Map<string, ClientConfig>> = new Map();
  private activeClientTypeId: number | null = null;
  private changeListeners: ClientConfigChangeListener[] = [];
  private validationRules: Map<string, (value: any) => boolean> = new Map();

  private constructor() {
    // Initialize with default configurations
    this.loadDefaultConfigurations();

    // Initialize validation rules
    this.setupValidationRules();
  }

  public static getInstance(): ClientConfigService {
    if (!ClientConfigService.instance) {
      ClientConfigService.instance = new ClientConfigService();
    }
    return ClientConfigService.instance;
  }

  /**
   * Load default configurations for known client types
   */
  private loadDefaultConfigurations(): void {
    const now = new Date();

    // FDF Configuration
    const fdfConfig: ClientConfig = {
      clientTypeId: 1,
      version: 1,
      lastUpdated: now,
      updatedBy: "system",
      general: {
        enableAssessments: true,
        enableProjects: true,
        enableFinancials: true,
        maxProjectsPerBeneficiary: 1,
        requireApproval: true,
        notes:
          "Family Development Foundation clients require full approval process.",
        language: "ar",
        rtlSupport: true,
        theme: {
          primaryColor: "#2563eb",
          secondaryColor: "#1e40af",
        },
      },
      pricing: {
        usesCustomPriceList: true,
        priceListId: "FDF-2023",
        discountPercentage: 100, // Full subsidy
        taxPercentage: 0,
        allowNegotiation: false,
        currency: "AED",
        vatRegistered: false,
        paymentTerms: "Immediate",
      },
      workflow: {
        requiresCommitteeApproval: true,
        skipFinancialVerification: false,
        autoCloseProjects: false,
        maxDaysToComplete: 90,
        approvalLevels: 3,
        notificationFrequency: "daily",
        reminderDays: 7,
      },
      beneficiary: {
        requiresVerification: true,
        verificationDocuments: [
          "ID",
          "Proof of Residence",
          "Income Certificate",
        ],
        followUpFrequency: 30,
        priorityCategories: ["Elderly", "Special Needs", "Low Income"],
      },
      security: {
        approvalHierarchy: "Manager,Director,Committee",
        documentRequirements: ["Signed Agreement", "Terms Acceptance"],
        twoFactorRequired: true,
      },
      integration: {
        externalSystems: ["System A", "System B"],
        apiKeys: {
          systemA: "key1",
          systemB: "key2",
        },
        webhookEndpoints: ["https://example.com/webhook"],
        dataExportSchedule: "daily",
        importSettings: {
          importType: "csv",
          delimiter: ",",
        },
      },
      customFields: {
        customField1: {
          type: "text",
          label: "Custom Field 1",
          required: true,
          options: ["Option 1", "Option 2"],
          defaultValue: "Default Value",
          validation: "required",
          dependsOn: "field1",
          visibilityCondition: "field2 > 10",
        },
      },
      supplier: {
        requireApproval: true,
        approvalWorkflow: "committee",
        qualityThreshold: 4.0,
        autoRenewalEnabled: false,
        contractDuration: 365,
        evaluationCriteria: [
          "quality",
          "delivery",
          "cost",
          "service",
          "communication",
        ],
        documentRequirements: ["trade_license", "vat_certificate", "insurance"],
      },
    };

    this.clientConfigs.set(1, fdfConfig);
    this.configHistory.set(1, [{ ...fdfConfig }]);
    this.configSnapshots.set(1, new Map());

    // ADHA Configuration
    const adhaConfig: ClientConfig = {
      clientTypeId: 2,
      version: 1,
      lastUpdated: now,
      updatedBy: "system",
      general: {
        enableAssessments: true,
        enableProjects: true,
        enableFinancials: true,
        maxProjectsPerBeneficiary: 2,
        requireApproval: true,
        notes:
          "Abu Dhabi Housing Authority clients follow standard process with extended limits.",
        language: "ar",
        rtlSupport: true,
        theme: {
          primaryColor: "#1565C0",
          secondaryColor: "#2196F3",
          logoUrl:
            "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=200&q=80",
          fontFamily: "Cairo, sans-serif",
        },
      },
      pricing: {
        usesCustomPriceList: true,
        priceListId: "ADHA-2023",
        discountPercentage: 80, // Partial subsidy
        taxPercentage: 0,
        allowNegotiation: false,
        currency: "AED",
        vatRegistered: true,
        vatNumber: "AE123456789",
        paymentTerms: "Net 30",
      },
      workflow: {
        requiresCommitteeApproval: true,
        skipFinancialVerification: false,
        autoCloseProjects: false,
        maxDaysToComplete: 120,
        approvalLevels: 2,
        notificationFrequency: "weekly",
      },
      beneficiary: {
        requiresVerification: true,
        verificationDocuments: ["ID", "Proof of Residence", "Property Deed"],
        followUpFrequency: 45,
      },
      security: {
        approvalHierarchy: "Supervisor,Manager,Director",
        twoFactorRequired: false,
      },
      features: {
        assessments: true,
        projects: true,
        committees: true,
        financials: true,
        inventory: true,
        supplierManagement: true,
      },
      approvalLevels: 2,
      requiresCommitteeApproval: true,
      autoAssignProjects: true,
      currency: "AED",
      taxRate: 5,
      paymentTerms: "Net 45",
      budgetCycle: "annual",
      supplier: {
        requireApproval: true,
        approvalWorkflow: "manager",
        qualityThreshold: 3.5,
        autoRenewalEnabled: true,
        contractDuration: 730,
        evaluationCriteria: ["quality", "delivery", "cost", "service"],
        documentRequirements: [
          "trade_license",
          "vat_certificate",
          "insurance",
          "quality_certification",
        ],
      },
    };

    this.clientConfigs.set(2, adhaConfig);
    this.configHistory.set(2, [{ ...adhaConfig }]);
    this.configSnapshots.set(2, new Map());

    // Cash Configuration
    const cashConfig: ClientConfig = {
      clientTypeId: 3,
      version: 1,
      lastUpdated: now,
      updatedBy: "system",
      general: {
        enableAssessments: true,
        enableProjects: true,
        enableFinancials: true,
        maxProjectsPerBeneficiary: 5,
        requireApproval: false,
        notes: "Cash clients follow simplified workflow with direct payment.",
        language: "en",
        rtlSupport: false,
        theme: {
          primaryColor: "#F57C00",
          secondaryColor: "#FF9800",
          fontFamily: "Roboto, sans-serif",
        },
      },
      pricing: {
        usesCustomPriceList: false,
        priceListId: "STANDARD-2023",
        discountPercentage: 0,
        taxPercentage: 5,
        allowNegotiation: true,
        currency: "AED",
        vatRegistered: true,
        vatNumber: "AE987654321",
        paymentTerms: "COD",
      },
      workflow: {
        requiresCommitteeApproval: false,
        skipFinancialVerification: true,
        autoCloseProjects: true,
        maxDaysToComplete: 60,
        approvalLevels: 1,
        notificationFrequency: "immediate",
      },
      // Cash specific configuration
      cashConfig: {
        paymentProcessor: {
          provider: "stripe",
          mode: "live",
          apiKeys: {
            publishable: "pk_live_sample_key",
            secret: "sk_live_sample_key",
          },
        },
        invoiceTemplates: {
          defaultTemplate: "professional",
          customTemplates: [
            { id: "simple", name: "Simple Invoice", sections: 3 },
            { id: "professional", name: "Professional Invoice", sections: 5 },
            { id: "detailed", name: "Detailed Invoice", sections: 7 },
          ],
        },
        priceList: {
          enableCustomPricing: true,
          strategy: "tiered",
          lists: [
            { id: 1, name: "Standard Price List", items: 45 },
            { id: 2, name: "Premium Price List", items: 72 },
            { id: 3, name: "Custom Price List", items: 18 },
          ],
        },
        discountPromotion: {
          enabled: true,
          maxDiscountPercentage: 25,
          activePromotions: [
            { id: 1, name: "New Customer", discount: 10, active: true },
            { id: 2, name: "Seasonal Discount", discount: 15, active: true },
            { id: 3, name: "Loyalty Program", discount: 20, active: false },
          ],
        },
        contractManagement: {
          defaultTemplate: "standard",
          customTemplates: [
            { id: "basic", name: "Basic Contract", clauses: 10 },
            { id: "standard", name: "Standard Contract", clauses: 15 },
            {
              id: "comprehensive",
              name: "Comprehensive Contract",
              clauses: 25,
            },
          ],
          autoRenewal: false,
        },
      },
    };

    this.clientConfigs.set(3, cashConfig);
    this.configHistory.set(3, [{ ...cashConfig }]);
    this.configSnapshots.set(3, new Map());

    // Other Configuration
    const otherConfig: ClientConfig = {
      clientTypeId: 4,
      version: 1,
      lastUpdated: now,
      updatedBy: "system",
      general: {
        enableAssessments: true,
        enableProjects: true,
        enableFinancials: true,
        maxProjectsPerBeneficiary: 3,
        requireApproval: true,
        notes: "Other clients follow standard process.",
        language: "en",
        rtlSupport: false,
        theme: {
          primaryColor: "#6366f1",
          secondaryColor: "#4f46e5",
        },
      },
      pricing: {
        usesCustomPriceList: false,
        priceListId: "STANDARD-2023",
        discountPercentage: 0,
        taxPercentage: 5,
        allowNegotiation: true,
        currency: "AED",
        paymentTerms: "Net 30",
      },
      workflow: {
        requiresCommitteeApproval: true,
        skipFinancialVerification: false,
        autoCloseProjects: false,
        maxDaysToComplete: 90,
        approvalLevels: 2,
        notificationFrequency: "weekly",
      },
      beneficiary: {
        requiresVerification: true,
        verificationDocuments: ["ID", "Proof of Residence"],
        followUpFrequency: 30,
      },
      security: {
        twoFactorRequired: false,
        dataRetentionPeriod: 365,
      },
      features: {
        assessments: true,
        projects: true,
        committees: false,
        financials: true,
        supplierManagement: false,
      },
      approvalLevels: 1,
      requiresCommitteeApproval: false,
      autoAssignProjects: false,
      currency: "AED",
      taxRate: 5,
      paymentTerms: "Net 30",
      budgetCycle: "annual",
      supplier: {
        requireApproval: false,
        approvalWorkflow: "direct",
        qualityThreshold: 3.0,
        contractDuration: 365,
        evaluationCriteria: ["quality", "cost"],
        documentRequirements: ["trade_license"],
      },
    };

    this.clientConfigs.set(4, otherConfig);
    this.configHistory.set(4, [{ ...otherConfig }]);
    this.configSnapshots.set(4, new Map());
  }

  /**
   * Setup validation rules for configuration properties
   */
  private setupValidationRules(): void {
    // General section validations
    this.validationRules.set(
      "general.maxProjectsPerBeneficiary",
      (value) => typeof value === "number" && value >= 0 && value <= 10,
    );

    // Pricing section validations
    this.validationRules.set(
      "pricing.discountPercentage",
      (value) => typeof value === "number" && value >= 0 && value <= 100,
    );
    this.validationRules.set(
      "pricing.taxPercentage",
      (value) => typeof value === "number" && value >= 0 && value <= 30,
    );

    // Workflow section validations
    this.validationRules.set(
      "workflow.maxDaysToComplete",
      (value) => typeof value === "number" && value >= 1 && value <= 365,
    );
    this.validationRules.set(
      "workflow.approvalLevels",
      (value) => typeof value === "number" && value >= 0 && value <= 5,
    );
  }

  /**
   * Set the active client type ID
   * @param clientTypeId The client type ID to set as active
   */
  public setActiveClientType(clientTypeId: number): void {
    if (this.activeClientTypeId !== clientTypeId) {
      this.activeClientTypeId = clientTypeId;

      // Notify listeners about the change
      this.notifyChangeListeners({
        clientTypeId,
        configType: "active",
        timestamp: new Date(),
      });
    }
  }

  /**
   * Get the active client type ID
   * @returns The active client type ID or null if not set
   */
  public getActiveClientType(): number | null {
    return this.activeClientTypeId;
  }

  /**
   * Get configuration for a specific client type
   * @param clientTypeId The client type ID
   * @returns The client configuration or undefined if not found
   */
  public getClientConfig(clientTypeId: number): ClientConfig | undefined {
    return this.clientConfigs.get(clientTypeId);
  }

  /**
   * Get configuration for the active client type
   * @returns The active client configuration or undefined if not set
   */
  public getActiveClientConfig(): ClientConfig | undefined {
    if (this.activeClientTypeId === null) {
      return undefined;
    }
    return this.getClientConfig(this.activeClientTypeId);
  }

  /**
   * Save configuration for a client type
   * @param config The client configuration to save
   * @param changedBy User ID or name who made the change
   * @param changeComment Optional comment about the changes
   */
  public async saveClientConfig(
    config: ClientConfig,
    changedBy: string = "system",
    changeComment?: string,
  ): Promise<boolean> {
    try {
      // Validate the configuration before saving
      if (!this.validateClientConfig(config)) {
        console.error("Invalid client configuration");
        return false;
      }

      // Get the current config to compare changes
      const currentConfig = this.clientConfigs.get(config.clientTypeId);
      const changes: Record<string, { oldValue: any; newValue: any }> = {};

      // If there's an existing config, track changes
      if (currentConfig) {
        // Compare and record changes (simplified - in real implementation would be recursive)
        Object.keys(config).forEach((section) => {
          if (typeof config[section] === "object" && config[section] !== null) {
            Object.keys(config[section]).forEach((key) => {
              if (
                JSON.stringify(currentConfig[section]?.[key]) !==
                JSON.stringify(config[section][key])
              ) {
                changes[`${section}.${key}`] = {
                  oldValue: currentConfig[section]?.[key],
                  newValue: config[section][key],
                };
              }
            });
          } else if (config[section] !== currentConfig[section]) {
            changes[section] = {
              oldValue: currentConfig[section],
              newValue: config[section],
            };
          }
        });
      }

      // Update version and timestamps
      const newVersion = currentConfig ? currentConfig.version + 1 : 1;
      const now = new Date();

      const updatedConfig: ClientConfig = {
        ...config,
        version: newVersion,
        lastUpdated: now,
        updatedBy: changedBy,
      };

      // In a real implementation, this would call an API to save the configuration
      // For now, we'll just update the local state
      this.clientConfigs.set(config.clientTypeId, updatedConfig);

      // Add to history
      if (!this.configHistory.has(config.clientTypeId)) {
        this.configHistory.set(config.clientTypeId, []);
      }
      this.configHistory.get(config.clientTypeId)?.push({ ...updatedConfig });

      // Limit history size (keep last 20 versions)
      const history = this.configHistory.get(config.clientTypeId);
      if (history && history.length > 20) {
        this.configHistory.set(
          config.clientTypeId,
          history.slice(history.length - 20),
        );
      }

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Notify listeners about the change
      this.notifyChangeListeners({
        clientTypeId: config.clientTypeId,
        configType: "modified",
        timestamp: now,
        version: newVersion,
        changedBy,
        changes: Object.keys(changes).length > 0 ? changes : undefined,
      });

      return true;
    } catch (error) {
      console.error("Error saving client configuration:", error);
      return false;
    }
  }

  /**
   * Validate a client configuration against defined rules
   * @param config The configuration to validate
   * @returns True if valid, false otherwise
   */
  public validateClientConfig(config: ClientConfig): boolean {
    try {
      // Check required fields
      if (
        !config ||
        !config.clientTypeId ||
        !config.general ||
        !config.pricing ||
        !config.workflow
      ) {
        console.error("Missing required config fields");
        return false;
      }

      // Apply validation rules
      for (const [path, validator] of this.validationRules.entries()) {
        const [section, key] = path.split(".");
        if (config[section] && key in config[section]) {
          if (!validator(config[section][key])) {
            console.error(
              `Validation failed for ${path}: ${config[section][key]}`,
            );
            return false;
          }
        }
      }

      // Additional validation for specific fields
      if (config.general && config.general.theme) {
        const theme = config.general.theme;
        // Validate color format (simple hex validation)
        if (
          theme.primaryColor &&
          !/^#[0-9A-Fa-f]{6}$/.test(theme.primaryColor)
        ) {
          console.error(`Invalid primary color format: ${theme.primaryColor}`);
          return false;
        }
        if (
          theme.secondaryColor &&
          !/^#[0-9A-Fa-f]{6}$/.test(theme.secondaryColor)
        ) {
          console.error(
            `Invalid secondary color format: ${theme.secondaryColor}`,
          );
          return false;
        }
        // Validate logo URL format
        if (theme.logoUrl && !this.isValidUrl(theme.logoUrl)) {
          console.error(`Invalid logo URL format: ${theme.logoUrl}`);
          return false;
        }
      }

      // Validate pricing section
      if (config.pricing) {
        // Validate discount and tax percentages are within range
        if (
          typeof config.pricing.discountPercentage === "number" &&
          (config.pricing.discountPercentage < 0 ||
            config.pricing.discountPercentage > 100)
        ) {
          console.error(
            `Invalid discount percentage: ${config.pricing.discountPercentage}`,
          );
          return false;
        }
        if (
          typeof config.pricing.taxPercentage === "number" &&
          (config.pricing.taxPercentage < 0 ||
            config.pricing.taxPercentage > 100)
        ) {
          console.error(
            `Invalid tax percentage: ${config.pricing.taxPercentage}`,
          );
          return false;
        }
      }

      // Validate budget cycle
      if (
        config.budgetCycle &&
        !["annual", "quarterly", "monthly", "per-project"].includes(
          config.budgetCycle,
        )
      ) {
        errors.push(
          "Budget cycle must be one of: annual, quarterly, monthly, per-project",
        );
      }

      // Validate supplier configuration
      if (config.supplier) {
        // Validate quality threshold
        if (
          config.supplier.qualityThreshold !== undefined &&
          (config.supplier.qualityThreshold < 0 ||
            config.supplier.qualityThreshold > 5)
        ) {
          errors.push("Supplier quality threshold must be between 0 and 5");
        }

        // Validate contract duration
        if (
          config.supplier.contractDuration !== undefined &&
          (config.supplier.contractDuration < 1 ||
            config.supplier.contractDuration > 3650)
        ) {
          errors.push("Contract duration must be between 1 and 3650 days");
        }

        // Validate approval workflow
        if (
          config.supplier.approvalWorkflow &&
          !["direct", "manager", "committee", "multi-level"].includes(
            config.supplier.approvalWorkflow,
          )
        ) {
          errors.push(
            "Supplier approval workflow must be one of: direct, manager, committee, multi-level",
          );
        }
      }

      return true;
    } catch (error) {
      console.error("Error validating client configuration:", error);
      return false;
    }
  }

  /**
   * Validate a URL string
   * @param url The URL to validate
   * @returns True if valid, false otherwise
   */
  private isValidUrl(url: string): boolean {
    try {
      if (!url) return false;
      new URL(url);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Load configurations from API
   * @returns Promise that resolves when configurations are loaded
   */
  public async loadConfigurationsFromApi(): Promise<boolean> {
    try {
      // In a real implementation, this would call an API to load configurations
      // For now, we'll just use the default configurations

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      // We already have default configurations loaded, so just return true
      return true;
    } catch (error) {
      console.error("Error loading client configurations from API:", error);
      return false;
    }
  }

  /**
   * Check if a feature is enabled for a client type
   * @param clientTypeId The client type ID
   * @param feature The feature to check (e.g., 'enableAssessments')
   * @returns True if the feature is enabled, false otherwise
   */
  public isFeatureEnabled(clientTypeId: number, feature: string): boolean {
    const config = this.getClientConfig(clientTypeId);
    if (!config || !config.general) {
      return false;
    }
    return config.general[feature] === true;
  }

  /**
   * Add a listener for client configuration changes
   * @param listener The listener function to add
   * @returns A function to remove the listener
   */
  public addChangeListener(listener: ClientConfigChangeListener): () => void {
    this.changeListeners.push(listener);
    return () => {
      this.changeListeners = this.changeListeners.filter((l) => l !== listener);
    };
  }

  /**
   * Notify all listeners about a client configuration change
   * @param event The change event
   */
  private notifyChangeListeners(event: ClientConfigChangeEvent): void {
    this.changeListeners.forEach((listener) => {
      try {
        listener(event);
      } catch (error) {
        console.error("Error in client config change listener:", error);
      }
    });
  }

  /**
   * Get the price list ID for the active client type
   * @returns The price list ID or undefined if not set
   */
  public getActivePriceListId(): string | undefined {
    const config = this.getActiveClientConfig();
    return config?.pricing?.priceListId;
  }

  /**
   * Get the price list ID for a specific client type
   * @param clientTypeId The client type ID
   * @returns The price list ID or undefined if not set
   */
  public getPriceListId(clientTypeId: number): string | undefined {
    const config = this.getClientConfig(clientTypeId);
    return config?.pricing?.priceListId;
  }

  /**
   * Check if the active client type uses a custom price list
   * @returns True if the active client type uses a custom price list, false otherwise
   */
  public activeClientUsesCustomPriceList(): boolean {
    const config = this.getActiveClientConfig();
    return config?.pricing?.usesCustomPriceList === true;
  }

  /**
   * Get the discount percentage for the active client type
   * @returns The discount percentage or 0 if not set
   */
  public getActiveDiscountPercentage(): number {
    const config = this.getActiveClientConfig();
    return config?.pricing?.discountPercentage ?? 0;
  }

  /**
   * Get the tax percentage for the active client type
   * @returns The tax percentage or 0 if not set
   */
  public getActiveTaxPercentage(): number {
    const config = this.getActiveClientConfig();
    return config?.pricing?.taxPercentage ?? 0;
  }

  /**
   * Check if price negotiation is allowed for the active client type
   * @returns True if price negotiation is allowed, false otherwise
   */
  public isNegotiationAllowed(): boolean {
    const config = this.getActiveClientConfig();
    return config?.pricing?.allowNegotiation === true;
  }

  /**
   * Check if committee approval is required for the active client type
   * @returns True if committee approval is required, false otherwise
   */
  public requiresCommitteeApproval(): boolean {
    const config = this.getActiveClientConfig();
    return config?.workflow?.requiresCommitteeApproval === true;
  }

  /**
   * Check if financial verification can be skipped for the active client type
   * @returns True if financial verification can be skipped, false otherwise
   */
  public canSkipFinancialVerification(): boolean {
    const config = this.getActiveClientConfig();
    return config?.workflow?.skipFinancialVerification === true;
  }

  /**
   * Get a specific configuration value for a client type
   * @param clientTypeId The client type ID
   * @param section The configuration section (e.g., 'general', 'pricing')
   * @param key The configuration key
   * @returns The configuration value or undefined if not found
   */
  public getConfigValue(
    clientTypeId: number,
    section: string,
    key: string,
  ): any {
    const config = this.getClientConfig(clientTypeId);
    if (!config || !config[section]) {
      return undefined;
    }
    return config[section][key];
  }

  /**
   * Get all client configurations
   * @returns Map of all client configurations
   */
  public getAllClientConfigs(): Map<number, ClientConfig> {
    return this.clientConfigs;
  }

  /**
   * Add a new client type with default configuration
   * @param clientType The client type to add
   * @param createdBy User ID or name who created the client type
   */
  public addClientType(clientType: any, createdBy: string = "system"): void {
    if (!this.clientConfigs.has(clientType.clientTypeId)) {
      const now = new Date();

      // Create default configuration for the new client type
      const defaultConfig: ClientConfig = {
        clientTypeId: clientType.clientTypeId,
        version: 1,
        lastUpdated: now,
        updatedBy: createdBy,
        general: {
          enableAssessments: true,
          enableProjects: true,
          enableFinancials: true,
          maxProjectsPerBeneficiary: 3,
          requireApproval: true,
          notes: `Default configuration for ${clientType.typeNameEN}`,
          language: "en",
          rtlSupport: false,
          theme: {
            primaryColor: "#607D8B",
            secondaryColor: "#90A4AE",
            fontFamily: "Roboto, sans-serif",
          },
        },
        pricing: {
          usesCustomPriceList: false,
          priceListId: "STANDARD-2023",
          discountPercentage: 0,
          taxPercentage: 5,
          allowNegotiation: true,
          currency: "AED",
          paymentTerms: "Net 30",
        },
        workflow: {
          requiresCommitteeApproval: true,
          skipFinancialVerification: false,
          autoCloseProjects: false,
          maxDaysToComplete: 90,
          approvalLevels: 2,
          notificationFrequency: "weekly",
        },
        beneficiary: {
          requiresVerification: true,
          verificationDocuments: ["ID", "Proof of Residence"],
          followUpFrequency: 30,
        },
        security: {
          twoFactorRequired: false,
          dataRetentionPeriod: 365,
        },
      };

      this.clientConfigs.set(clientType.clientTypeId, defaultConfig);

      // Initialize history and snapshots for this client type
      this.configHistory.set(clientType.clientTypeId, [{ ...defaultConfig }]);
      this.configSnapshots.set(clientType.clientTypeId, new Map());

      // Notify listeners about the change
      this.notifyChangeListeners({
        clientTypeId: clientType.clientTypeId,
        configType: "created",
        timestamp: now,
        version: 1,
        changedBy: createdBy,
      });
    }
  }

  /**
   * Update an existing client type
   * @param clientType The updated client type
   */
  public updateClientType(clientType: any): void {
    // If we have a configuration for this client type, keep it
    // Otherwise, this is effectively the same as adding a new client type
    if (!this.clientConfigs.has(clientType.clientTypeId)) {
      this.addClientType(clientType);
    } else {
      // Notify listeners about the change
      this.notifyChangeListeners({
        clientTypeId: clientType.clientTypeId,
        configType: "modified",
        timestamp: new Date(),
      });
    }
  }

  /**
   * Remove a client type and its configuration
   * @param clientTypeId The ID of the client type to remove
   * @param deletedBy User ID or name who deleted the client type
   */
  public removeClientType(
    clientTypeId: number,
    deletedBy: string = "system",
  ): void {
    if (this.clientConfigs.has(clientTypeId)) {
      // Archive the configuration before deleting (in a real system)
      const config = this.clientConfigs.get(clientTypeId);

      // Delete the configuration
      this.clientConfigs.delete(clientTypeId);

      // If the active client type was removed, clear it
      if (this.activeClientTypeId === clientTypeId) {
        this.activeClientTypeId = null;
      }

      // Notify listeners about the change
      this.notifyChangeListeners({
        clientTypeId,
        configType: "deleted",
        timestamp: new Date(),
        changedBy: deletedBy,
        version: config?.version,
      });
    }
  }

  /**
   * Create a snapshot of the current configuration
   * @param clientTypeId The client type ID
   * @param snapshotName Name for the snapshot
   * @param comment Optional comment about the snapshot
   * @param createdBy User ID or name who created the snapshot
   * @returns True if successful, false otherwise
   */
  public createConfigSnapshot(
    clientTypeId: number,
    snapshotName: string,
    comment?: string,
    createdBy: string = "system",
  ): boolean {
    try {
      const config = this.clientConfigs.get(clientTypeId);
      if (!config) {
        return false;
      }

      // Make sure snapshots map exists for this client type
      if (!this.configSnapshots.has(clientTypeId)) {
        this.configSnapshots.set(clientTypeId, new Map());
      }

      const snapshotMap = this.configSnapshots.get(clientTypeId);
      if (!snapshotMap) {
        return false;
      }

      // Create a deep copy of the config with snapshot metadata
      const snapshot: ClientConfig = {
        ...JSON.parse(JSON.stringify(config)),
        snapshotName,
        snapshotComment: comment,
        snapshotDate: new Date(),
        snapshotBy: createdBy,
      };

      // Save the snapshot
      snapshotMap.set(snapshotName, snapshot);

      // Notify listeners
      this.notifyChangeListeners({
        clientTypeId,
        configType: "snapshot",
        timestamp: new Date(),
        changedBy: createdBy,
        version: config.version,
      });

      return true;
    } catch (error) {
      console.error("Error creating configuration snapshot:", error);
      return false;
    }
  }

  /**
   * Get a list of all snapshots for a client type
   * @param clientTypeId The client type ID
   * @returns Array of snapshot metadata or empty array if none exist
   */
  public getConfigSnapshots(clientTypeId: number): Array<{
    name: string;
    date: Date;
    version: number;
    createdBy: string;
    comment?: string;
  }> {
    const snapshotMap = this.configSnapshots.get(clientTypeId);
    if (!snapshotMap) {
      return [];
    }

    return Array.from(snapshotMap.entries()).map(([name, snapshot]) => ({
      name,
      date: snapshot.snapshotDate as Date,
      version: snapshot.version,
      createdBy: snapshot.snapshotBy as string,
      comment: snapshot.snapshotComment as string | undefined,
    }));
  }

  /**
   * Restore a configuration from a snapshot
   * @param clientTypeId The client type ID
   * @param snapshotName Name of the snapshot to restore
   * @param restoredBy User ID or name who performed the restore
   * @returns True if successful, false otherwise
   */
  public restoreConfigFromSnapshot(
    clientTypeId: number,
    snapshotName: string,
    restoredBy: string = "system",
  ): boolean {
    try {
      const snapshotMap = this.configSnapshots.get(clientTypeId);
      if (!snapshotMap) {
        return false;
      }

      const snapshot = snapshotMap.get(snapshotName);
      if (!snapshot) {
        return false;
      }

      // Create a new version based on the snapshot
      const currentConfig = this.clientConfigs.get(clientTypeId);
      const newVersion = currentConfig ? currentConfig.version + 1 : 1;
      const now = new Date();

      // Remove snapshot metadata and update version info
      const {
        snapshotName: _,
        snapshotComment: __,
        snapshotDate: ___,
        snapshotBy: ____,
        ...configData
      } = snapshot;
      const restoredConfig: ClientConfig = {
        ...configData,
        version: newVersion,
        lastUpdated: now,
        updatedBy: restoredBy,
        restoredFromSnapshot: snapshotName,
        restoredFromVersion: snapshot.version,
      };

      // Save the restored config
      this.clientConfigs.set(config.clientTypeId, restoredConfig);

      // Add to history
      if (!this.configHistory.has(config.clientTypeId)) {
        this.configHistory.set(config.clientTypeId, []);
      }
      this.configHistory.get(config.clientTypeId)?.push({ ...restoredConfig });

      // Notify listeners
      this.notifyChangeListeners({
        clientTypeId,
        configType: "restored",
        timestamp: now,
        version: newVersion,
        changedBy: restoredBy,
      });

      return true;
    } catch (error) {
      console.error("Error restoring configuration from snapshot:", error);
      return false;
    }
  }

  /**
   * Get configuration history for a client type
   * @param clientTypeId The client type ID
   * @param limit Maximum number of history entries to return (default: all)
   * @returns Array of configuration history entries
   */
  public getConfigHistory(
    clientTypeId: number,
    limit?: number,
  ): ClientConfig[] {
    const history = this.configHistory.get(clientTypeId) || [];

    // Return the most recent entries first
    const sortedHistory = [...history].reverse();

    return limit ? sortedHistory.slice(0, limit) : sortedHistory;
  }

  /**
   * Export client configuration to JSON
   * @param clientTypeId The client type ID
   * @returns The configuration as a JSON string, or undefined if not found
   */
  public exportConfigToJson(clientTypeId: number): string | undefined {
    const config = this.getClientConfig(clientTypeId);
    if (!config) {
      console.error("Client configuration not found");
      return undefined;
    }

    try {
      return JSON.stringify(config, null, 2);
    } catch (error) {
      console.error("Error exporting client configuration to JSON:", error);
      return undefined;
    }
  }

  /**
   * Import client configuration from JSON
   * @param jsonString The configuration as a JSON string
   * @param overwrite Whether to overwrite an existing configuration
   * @param importedBy User ID or name who imported the configuration
   * @returns True if successful, false otherwise
   */
  public importConfigFromJson(
    jsonString: string,
    overwrite: boolean = false,
    importedBy: string = "system",
  ): boolean {
    try {
      if (!jsonString) {
        console.error("Empty JSON string provided for import");
        return false;
      }

      const config = JSON.parse(jsonString) as ClientConfig;

      // Validate the imported configuration
      if (!this.validateClientConfig(config)) {
        console.error("Invalid imported client configuration");
        return false;
      }

      // Check if a configuration with this client type ID already exists
      if (this.clientConfigs.has(config.clientTypeId) && !overwrite) {
        console.error("Client configuration with this ID already exists");
        return false;
      }

      // Update version and timestamps
      const now = new Date();
      const existingConfig = this.clientConfigs.get(config.clientTypeId);
      const newVersion = existingConfig ? existingConfig.version + 1 : 1;

      const updatedConfig: ClientConfig = {
        ...config,
        version: newVersion,
        lastUpdated: now,
        updatedBy: importedBy,
      };

      // Save the configuration
      this.clientConfigs.set(config.clientTypeId, updatedConfig);

      // Add to history
      if (!this.configHistory.has(config.clientTypeId)) {
        this.configHistory.set(config.clientTypeId, []);
      }
      this.configHistory.get(config.clientTypeId)?.push({ ...updatedConfig });

      // Limit history size (keep last 20 versions)
      const history = this.configHistory.get(config.clientTypeId);
      if (history && history.length > 20) {
        this.configHistory.set(
          config.clientTypeId,
          history.slice(history.length - 20),
        );
      }

      // Notify listeners about the change
      this.notifyChangeListeners({
        clientTypeId: config.clientTypeId,
        configType: overwrite ? "modified" : "created",
        timestamp: now,
        version: newVersion,
        changedBy: importedBy,
      });

      return true;
    } catch (error) {
      console.error("Error importing client configuration from JSON:", error);
      return false;
    }
  }

  /**
   * Compare two versions of a client configuration
   * @param clientTypeId The client type ID
   * @param version1 First version to compare
   * @param version2 Second version to compare
   * @returns Object containing the differences or null if versions not found
   */
  public compareConfigVersions(
    clientTypeId: number,
    version1: number,
    version2: number,
  ): Record<string, { oldValue: any; newValue: any }> | null {
    const history = this.configHistory.get(clientTypeId) || [];

    const config1 = history.find((c) => c.version === version1);
    const config2 = history.find((c) => c.version === version2);

    if (!config1 || !config2) {
      return null;
    }

    const differences: Record<string, { oldValue: any; newValue: any }> = {};

    // Compare configurations (simplified - in real implementation would be recursive)
    this.findDifferences(config1, config2, "", differences);

    return differences;
  }

  /**
   * Helper method to recursively find differences between two objects
   */
  private findDifferences(
    obj1: any,
    obj2: any,
    path: string,
    result: Record<string, { oldValue: any; newValue: any }>,
  ): void {
    if (!obj1 || !obj2) {
      return;
    }
    // Skip certain metadata fields
    const skipFields = [
      "version",
      "lastUpdated",
      "updatedBy",
      "snapshotName",
      "snapshotDate",
      "snapshotBy",
      "snapshotComment",
    ];

    for (const key in obj1) {
      if (skipFields.includes(key)) continue;

      const currentPath = path ? `${path}.${key}` : key;

      if (
        typeof obj1[key] === "object" &&
        obj1[key] !== null &&
        typeof obj2[key] === "object" &&
        obj2[key] !== null
      ) {
        // Recursively compare objects
        this.findDifferences(obj1[key], obj2[key], currentPath, result);
      } else if (JSON.stringify(obj1[key]) !== JSON.stringify(obj2[key])) {
        // Values differ
        result[currentPath] = {
          oldValue: obj1[key],
          newValue: obj2[key],
        };
      }
    }

    // Check for keys in obj2 that aren't in obj1
    for (const key in obj2) {
      if (skipFields.includes(key)) continue;

      const currentPath = path ? `${path}.${key}` : key;

      if (!(key in obj1)) {
        result[currentPath] = {
          oldValue: undefined,
          newValue: obj2[key],
        };
      }
    }
  }
}

export const clientConfigService = ClientConfigService.getInstance();
