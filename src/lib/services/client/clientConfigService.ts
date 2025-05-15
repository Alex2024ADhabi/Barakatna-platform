import { Client, ClientConfiguration } from "@/lib/database/client-schema";
import { ClientType } from "@/lib/forms/types";
import { clientApi } from "@/lib/api/client/clientApi";

import {
  configVersionManager,
  ConfigurationVersion,
} from "./ConfigVersionManager";

// Default configurations by client type
const defaultConfigurations: Record<
  ClientType,
  Partial<ClientConfiguration>
> = {
  [ClientType.FDF]: {
    theme: {
      primaryColor: "#2563eb",
      secondaryColor: "#1e40af",
    },
    features: {
      assessments: true,
      projects: true,
      committees: true,
      financials: true,
    },
    approvalLevels: 3,
    requiresCommitteeApproval: true,
    autoAssignProjects: false,
    currency: "AED",
    taxRate: 5,
    paymentTerms: "Net 30",
    budgetCycle: "annual",
  },
  [ClientType.ADHA]: {
    theme: {
      primaryColor: "#10b981",
      secondaryColor: "#059669",
    },
    features: {
      assessments: true,
      projects: true,
      committees: true,
      financials: true,
      inventory: true,
    },
    approvalLevels: 2,
    requiresCommitteeApproval: true,
    autoAssignProjects: true,
    currency: "AED",
    taxRate: 5,
    paymentTerms: "Net 45",
    budgetCycle: "annual",
  },
  [ClientType.CASH]: {
    theme: {
      primaryColor: "#f59e0b",
      secondaryColor: "#d97706",
    },
    features: {
      assessments: true,
      projects: true,
      committees: false,
      financials: true,
    },
    approvalLevels: 1,
    requiresCommitteeApproval: false,
    autoAssignProjects: false,
    currency: "AED",
    taxRate: 5,
    paymentTerms: "Advance Payment",
    budgetCycle: "per-project",
  },
  [ClientType.OTHER]: {
    theme: {
      primaryColor: "#6366f1",
      secondaryColor: "#4f46e5",
    },
    features: {
      assessments: true,
      projects: true,
      committees: false,
      financials: true,
    },
    approvalLevels: 1,
    requiresCommitteeApproval: false,
    autoAssignProjects: false,
    currency: "AED",
    taxRate: 5,
    paymentTerms: "Net 30",
    budgetCycle: "annual",
  },
};

// Configuration version limit per client
const MAX_CONFIG_VERSIONS_PER_CLIENT = 20;

// Set the max versions in the version manager
configVersionManager.setMaxVersionsPerClient(MAX_CONFIG_VERSIONS_PER_CLIENT);

// Client Configuration Service
export const clientConfigService = {
  /**
   * Get client config based on client type
   */
  getClientConfig: (clientType: ClientType) => {
    return defaultConfigurations[clientType] || null;
  },
  /**
   * Get client configuration with inheritance from default templates
   */
  getClientConfiguration: async (
    clientId: string,
  ): Promise<ClientConfiguration | null> => {
    try {
      // Get client details to determine client type
      const clientResponse = await clientApi.getClientById(clientId);
      if (!clientResponse.success || !clientResponse.data) {
        console.error(`Client not found: ${clientId}`);
        return null;
      }

      const client = clientResponse.data;

      // Get client's specific configuration
      const configResponse = await clientApi.getClientConfiguration(clientId);
      if (!configResponse.success || !configResponse.data) {
        console.error(`Configuration not found for client: ${clientId}`);

        // If no configuration exists, create one based on client type defaults
        const defaultConfig = defaultConfigurations[client.clientType] || {};
        const newConfigResponse =
          await clientConfigService.createClientConfiguration(
            clientId,
            defaultConfig,
            "system",
          );

        if (!newConfigResponse) {
          console.error(
            `Failed to create default configuration for client: ${clientId}`,
          );
          return null;
        }

        return newConfigResponse;
      }

      // Get default configuration for client type
      const defaultConfig = defaultConfigurations[client.clientType] || {};

      // Merge default with client-specific configuration (client config overrides defaults)
      const mergedConfig = this.mergeConfigurations(
        defaultConfig,
        configResponse.data,
      );

      return mergedConfig as ClientConfiguration;
    } catch (error) {
      console.error(`Error retrieving client configuration: ${error}`);
      return null;
    }
  },

  /**
   * Get client configuration by version ID
   */
  getClientConfigurationByVersion: async (
    clientId: string,
    versionId: string,
  ): Promise<ClientConfiguration | null> => {
    try {
      // Find the specific version
      const version = this.getConfigurationVersion(versionId);
      if (!version || version.clientId !== clientId) {
        console.error(
          `Version not found or doesn't belong to client: ${versionId}`,
        );
        return null;
      }

      return version.configuration;
    } catch (error) {
      console.error(`Error retrieving client configuration version: ${error}`);
      return null;
    }
  },

  /**
   * Validate client configuration against schema and business rules
   */
  validateConfiguration: (
    config: Partial<ClientConfiguration>,
  ): { valid: boolean; errors: string[] } => {
    const errors: string[] = [];

    // Check required fields
    if (!config.theme) errors.push("Theme configuration is required");
    if (!config.features) errors.push("Features configuration is required");

    // Validate theme
    if (config.theme) {
      if (!config.theme.primaryColor) errors.push("Primary color is required");
      if (!config.theme.secondaryColor)
        errors.push("Secondary color is required");

      // Validate color format (hex)
      const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
      if (
        config.theme.primaryColor &&
        !hexColorRegex.test(config.theme.primaryColor)
      ) {
        errors.push("Primary color must be a valid hex color");
      }
      if (
        config.theme.secondaryColor &&
        !hexColorRegex.test(config.theme.secondaryColor)
      ) {
        errors.push("Secondary color must be a valid hex color");
      }
    }

    // Validate approval levels
    if (
      config.approvalLevels !== undefined &&
      (config.approvalLevels < 0 || config.approvalLevels > 5)
    ) {
      errors.push("Approval levels must be between 0 and 5");
    }

    // Validate tax rate
    if (
      config.taxRate !== undefined &&
      (config.taxRate < 0 || config.taxRate > 100)
    ) {
      errors.push("Tax rate must be between 0 and 100");
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

    // Validate custom fields
    if (config.customFields) {
      Object.entries(config.customFields).forEach(
        ([fieldName, fieldConfig]) => {
          if (!fieldConfig.type)
            errors.push(`Custom field ${fieldName} must have a type`);
          if (!fieldConfig.label)
            errors.push(`Custom field ${fieldName} must have a label`);

          // Validate select fields have options
          if (
            fieldConfig.type === "select" &&
            (!fieldConfig.options || fieldConfig.options.length === 0)
          ) {
            errors.push(
              `Custom field ${fieldName} of type 'select' must have options`,
            );
          }
        },
      );
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  },

  /**
   * Get default configuration template for a client type
   */
  getDefaultConfiguration: (
    clientType: ClientType,
  ): Partial<ClientConfiguration> => {
    return defaultConfigurations[clientType] || {};
  },

  /**
   * Create a new client configuration
   */
  createClientConfiguration: async (
    clientId: string,
    config: Partial<ClientConfiguration>,
    userId: string,
  ): Promise<ClientConfiguration | null> => {
    try {
      // Validate configuration
      const validation = this.validateConfiguration(config);
      if (!validation.valid) {
        console.error(`Invalid configuration: ${validation.errors.join(", ")}`);
        return null;
      }

      // Get client details
      const clientResponse = await clientApi.getClientById(clientId);
      if (!clientResponse.success || !clientResponse.data) {
        console.error(`Client not found: ${clientId}`);
        return null;
      }

      const client = clientResponse.data;

      // Get default configuration for client type
      const defaultConfig = this.getDefaultConfiguration(client.clientType);

      // Merge default with provided configuration
      const mergedConfig = this.mergeConfigurations(defaultConfig, config);

      // Update client configuration
      const updateResponse = await clientApi.updateClientConfiguration(
        clientId,
        mergedConfig,
      );
      if (!updateResponse.success || !updateResponse.data) {
        console.error(
          `Failed to update client configuration: ${updateResponse.error}`,
        );
        return null;
      }

      // Save configuration version
      configVersionManager.saveVersion(
        clientId,
        updateResponse.data,
        userId,
        "Initial configuration",
        ["initial"],
      );

      return updateResponse.data;
    } catch (error) {
      console.error(`Error creating client configuration: ${error}`);
      return null;
    }
  },

  /**
   * Update client configuration
   */
  updateClientConfiguration: async (
    clientId: string,
    configUpdates: Partial<ClientConfiguration>,
    userId: string,
    comment?: string,
  ): Promise<ClientConfiguration | null> => {
    try {
      // Get current configuration
      const currentConfigResponse =
        await clientApi.getClientConfiguration(clientId);
      if (!currentConfigResponse.success || !currentConfigResponse.data) {
        console.error(`Configuration not found for client: ${clientId}`);
        return null;
      }

      const currentConfig = currentConfigResponse.data;

      // Merge current with updates
      const mergedConfig = this.mergeConfigurations(
        currentConfig,
        configUpdates,
      );

      // Validate merged configuration
      const validation = this.validateConfiguration(mergedConfig);
      if (!validation.valid) {
        console.error(`Invalid configuration: ${validation.errors.join(", ")}`);
        return null;
      }

      // Update client configuration
      const updateResponse = await clientApi.updateClientConfiguration(
        clientId,
        mergedConfig,
      );
      if (!updateResponse.success || !updateResponse.data) {
        console.error(
          `Failed to update client configuration: ${updateResponse.error}`,
        );
        return null;
      }

      // Save configuration version
      configVersionManager.saveVersion(
        clientId,
        updateResponse.data,
        userId,
        comment,
      );

      return updateResponse.data;
    } catch (error) {
      console.error(`Error updating client configuration: ${error}`);
      return null;
    }
  },

  /**
   * Get configuration history for a client
   */
  getConfigurationHistory: (
    clientId: string,
    limit?: number,
  ): ConfigurationVersion[] => {
    const history = configVersionManager.getVersions(clientId);
    return limit ? history.slice(0, limit) : history;
  },

  /**
   * Get configuration history summary for a client
   */
  getConfigurationHistorySummary: (
    clientId: string,
  ): {
    totalVersions: number;
    totalSnapshots: number;
    latestVersion: ConfigurationVersion | null;
    latestSnapshot: ConfigurationVersion | null;
    recentChanges: { date: Date; count: number }[];
  } => {
    return configVersionManager.getHistorySummary(clientId);
  },

  /**
   * Export configuration history to a file
   */
  exportConfigurationHistory: (
    clientId: string,
    format: "json" | "csv" = "json",
  ): string => {
    return configVersionManager.exportHistory(clientId, format);
  },

  /**
   * Create a snapshot of the current configuration
   */
  createConfigurationSnapshot: async (
    clientId: string,
    userId: string,
    name: string,
    description?: string,
  ): Promise<string | null> => {
    try {
      // Get current configuration
      const currentConfig = await clientApi.getClientConfiguration(clientId);
      if (!currentConfig.success || !currentConfig.data) {
        console.error(`Configuration not found for client: ${clientId}`);
        return null;
      }

      // Create a snapshot using the version manager
      const snapshot = configVersionManager.createSnapshot(
        clientId,
        currentConfig.data,
        userId,
        name,
        description,
      );

      return snapshot.id;
    } catch (error) {
      console.error(`Error creating configuration snapshot: ${error}`);
      return null;
    }
  },

  /**
   * Get specific configuration version
   */
  getConfigurationVersion: (versionId: string): ConfigurationVersion | null => {
    return configVersionManager.getVersion(versionId);
  },

  /**
   * Restore configuration from a previous version
   */
  restoreConfigurationVersion: async (
    clientId: string,
    versionId: string,
    userId: string,
  ): Promise<ClientConfiguration | null> => {
    try {
      // Find the version
      const version = configVersionManager.getVersion(versionId);
      if (!version || version.clientId !== clientId) {
        console.error(
          `Version not found or doesn't belong to client: ${versionId}`,
        );
        return null;
      }

      // Update client configuration
      const updateResponse = await clientApi.updateClientConfiguration(
        clientId,
        version.configuration,
      );
      if (!updateResponse.success || !updateResponse.data) {
        console.error(
          `Failed to restore configuration version: ${updateResponse.error}`,
        );
        return null;
      }

      // Save new configuration version
      configVersionManager.saveVersion(
        clientId,
        updateResponse.data,
        userId,
        `Restored from version ${versionId} (${version.createdAt.toISOString()})`,
        ["restored"],
      );

      return updateResponse.data;
    } catch (error) {
      console.error(`Error restoring configuration version: ${error}`);
      return null;
    }
  },

  /**
   * Helper: Merge configurations (deep merge)
   */
  mergeConfigurations: (
    base: Partial<ClientConfiguration>,
    override: Partial<ClientConfiguration>,
  ): Partial<ClientConfiguration> => {
    // Create a deep copy of the base configuration
    const result = JSON.parse(JSON.stringify(base));

    // Helper function for deep merging
    const deepMerge = (target: any, source: any) => {
      if (source === null || source === undefined) return target;

      Object.keys(source).forEach((key) => {
        if (
          source[key] &&
          typeof source[key] === "object" &&
          !Array.isArray(source[key])
        ) {
          // If property is an object, recursively merge
          target[key] = target[key] || {};
          deepMerge(target[key], source[key]);
        } else {
          // Otherwise, override with source value
          target[key] = source[key];
        }
      });

      return target;
    };

    // Perform the deep merge
    return deepMerge(result, override);
  },

  /**
   * Add tags to a configuration version
   */
  addTagsToConfigurationVersion: (
    versionId: string,
    tags: string[],
  ): boolean => {
    return configVersionManager.addTags(versionId, tags);
  },

  /**
   * Remove tags from a configuration version
   */
  removeTagsFromConfigurationVersion: (
    versionId: string,
    tags: string[],
  ): boolean => {
    return configVersionManager.removeTags(versionId, tags);
  },

  /**
   * Update comment on a configuration version
   */
  updateConfigurationVersionComment: (
    versionId: string,
    comment: string,
  ): boolean => {
    return configVersionManager.updateComment(versionId, comment);
  },

  /**
   * Compare two configuration versions
   */
  compareConfigurationVersions: (
    versionAId: string,
    versionBId: string,
  ): {
    differences: Record<string, { oldValue: any; newValue: any }>;
    summary: string;
  } => {
    return configVersionManager.compareVersions(versionAId, versionBId);
  },

  /**
   * Get configuration version details
   */
  getConfigurationVersionDetails: (
    versionId: string,
  ): {
    version: ConfigurationVersion;
    changes?: { key: string; oldValue: any; newValue: any }[];
  } | null => {
    return configVersionManager.getVersionDetails(versionId);
  },
};
