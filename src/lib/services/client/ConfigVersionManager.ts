import { ClientConfiguration } from "@/lib/database/client-schema";
import { ClientType } from "@/lib/forms/types";

/**
 * Configuration version interface
 */
export interface ConfigurationVersion {
  id: string;
  clientId: string;
  configuration: ClientConfiguration;
  createdAt: Date;
  createdBy: string;
  comment?: string;
  tags?: string[];
  isSnapshot?: boolean;
}

/**
 * Configuration Version Manager
 *
 * Manages version history for client configurations with advanced features:
 * - Version tracking with metadata
 * - Snapshots for important configuration states
 * - Comparison between versions
 * - Rollback capabilities
 * - Tagging and labeling versions
 */
export class ConfigVersionManager {
  private configVersions: Map<string, ConfigurationVersion[]> = new Map();
  private maxVersionsPerClient: number = 20;

  /**
   * Save a new configuration version
   */
  saveVersion(
    clientId: string,
    configuration: ClientConfiguration,
    userId: string,
    comment?: string,
    tags?: string[],
    isSnapshot: boolean = false,
  ): ConfigurationVersion {
    // Generate a unique version ID
    const versionId = isSnapshot
      ? `snapshot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      : `version-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Create the version object
    const version: ConfigurationVersion = {
      id: versionId,
      clientId,
      configuration: JSON.parse(JSON.stringify(configuration)), // Deep copy
      createdAt: new Date(),
      createdBy: userId,
      comment,
      tags,
      isSnapshot,
    };

    // Get or initialize the client's version history
    if (!this.configVersions.has(clientId)) {
      this.configVersions.set(clientId, []);
    }

    const clientVersions = this.configVersions.get(clientId)!;
    clientVersions.push(version);

    // Enforce version limit
    this.enforceVersionLimit(clientId);

    // Log the version creation
    console.log(
      `Created configuration ${isSnapshot ? "snapshot" : "version"} ${version.id} for client ${clientId}`,
      {
        createdBy: userId,
        timestamp: version.createdAt,
        comment: comment || "No comment provided",
        isSnapshot,
      },
    );

    return version;
  }

  /**
   * Create a snapshot of the current configuration
   */
  createSnapshot(
    clientId: string,
    configuration: ClientConfiguration,
    userId: string,
    name: string,
    description?: string,
  ): ConfigurationVersion {
    return this.saveVersion(
      clientId,
      configuration,
      userId,
      `SNAPSHOT: ${name}${description ? ` - ${description}` : ""}`,
      ["snapshot"],
      true,
    );
  }

  /**
   * Get all versions for a client
   */
  getVersions(clientId: string): ConfigurationVersion[] {
    const versions = this.configVersions.get(clientId) || [];
    return [...versions].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );
  }

  /**
   * Get a specific version by ID
   */
  getVersion(versionId: string): ConfigurationVersion | null {
    for (const versions of this.configVersions.values()) {
      const version = versions.find((v) => v.id === versionId);
      if (version) return version;
    }
    return null;
  }

  /**
   * Get versions with specific tags
   */
  getVersionsByTags(clientId: string, tags: string[]): ConfigurationVersion[] {
    const versions = this.getVersions(clientId);
    return versions.filter(
      (version) =>
        version.tags && tags.some((tag) => version.tags!.includes(tag)),
    );
  }

  /**
   * Get all snapshots for a client
   */
  getSnapshots(clientId: string): ConfigurationVersion[] {
    const versions = this.getVersions(clientId);
    return versions.filter((version) => version.isSnapshot);
  }

  /**
   * Compare two configuration versions
   */
  compareVersions(
    versionAId: string,
    versionBId: string,
  ): {
    differences: Record<string, { oldValue: any; newValue: any }>;
    summary: string;
  } {
    // Find the two versions
    const versionA = this.getVersion(versionAId);
    const versionB = this.getVersion(versionBId);

    if (!versionA || !versionB) {
      throw new Error("One or both configuration versions not found");
    }

    // Compare the configurations
    const differences: Record<string, { oldValue: any; newValue: any }> = {};
    const configA = versionA.configuration;
    const configB = versionB.configuration;

    // Helper function to find differences
    const findDifferences = (objA: any, objB: any, path: string = "") => {
      // Get all keys from both objects
      const allKeys = new Set([
        ...Object.keys(objA || {}),
        ...Object.keys(objB || {}),
      ]);

      allKeys.forEach((key) => {
        const currentPath = path ? `${path}.${key}` : key;
        const valueA = objA?.[key];
        const valueB = objB?.[key];

        // If both values are objects, recursively compare them
        if (
          valueA &&
          valueB &&
          typeof valueA === "object" &&
          typeof valueB === "object" &&
          !Array.isArray(valueA) &&
          !Array.isArray(valueB)
        ) {
          findDifferences(valueA, valueB, currentPath);
        }
        // If values are different, record the difference
        else if (JSON.stringify(valueA) !== JSON.stringify(valueB)) {
          differences[currentPath] = {
            oldValue: valueA,
            newValue: valueB,
          };
        }
      });
    };

    // Find all differences
    findDifferences(configA, configB);

    // Create a summary
    const diffCount = Object.keys(differences).length;
    let summary = `Found ${diffCount} difference${diffCount !== 1 ? "s" : ""} between versions`;

    // Add version metadata to summary
    summary += `\nVersion A: ${versionA.id} (${new Date(versionA.createdAt).toLocaleString()}) by ${versionA.createdBy}`;
    summary += `\nVersion B: ${versionB.id} (${new Date(versionB.createdAt).toLocaleString()}) by ${versionB.createdBy}`;

    if (diffCount > 0) {
      // Add a few key differences to the summary
      const keyDiffs = Object.keys(differences).slice(0, 3);
      summary += "\nKey changes:";
      keyDiffs.forEach((key) => {
        const diff = differences[key];
        summary += `\n- ${key}: ${JSON.stringify(diff.oldValue)} → ${JSON.stringify(diff.newValue)}`;
      });

      if (diffCount > 3) {
        summary += `\n... and ${diffCount - 3} more changes`;
      }
    }

    return { differences, summary };
  }

  /**
   * Get version details with changes from previous version
   */
  getVersionDetails(versionId: string): {
    version: ConfigurationVersion;
    changes?: { key: string; oldValue: any; newValue: any }[];
  } | null {
    const version = this.getVersion(versionId);
    if (!version) return null;

    // Try to find the previous version to show changes
    const clientVersions = this.getVersions(version.clientId);
    const versionIndex = clientVersions.findIndex((v) => v.id === versionId);

    if (versionIndex === -1 || versionIndex === clientVersions.length - 1) {
      // This is either not found or the oldest version, so no changes to show
      return { version };
    }

    // Get the previous version
    const previousVersion = clientVersions[versionIndex + 1];

    // Compare with previous version
    const { differences } = this.compareVersions(previousVersion.id, versionId);

    // Format the changes
    const changes = Object.entries(differences).map(([key, diff]) => ({
      key,
      oldValue: diff.oldValue,
      newValue: diff.newValue,
    }));

    return { version, changes };
  }

  /**
   * Add tags to a version
   */
  addTags(versionId: string, tags: string[]): boolean {
    const version = this.getVersion(versionId);
    if (!version) return false;

    if (!version.tags) {
      version.tags = [];
    }

    // Add new tags that don't already exist
    tags.forEach((tag) => {
      if (!version.tags!.includes(tag)) {
        version.tags!.push(tag);
      }
    });

    return true;
  }

  /**
   * Remove tags from a version
   */
  removeTags(versionId: string, tags: string[]): boolean {
    const version = this.getVersion(versionId);
    if (!version || !version.tags) return false;

    version.tags = version.tags.filter((tag) => !tags.includes(tag));
    return true;
  }

  /**
   * Update the comment on a version
   */
  updateComment(versionId: string, comment: string): boolean {
    const version = this.getVersion(versionId);
    if (!version) return false;

    version.comment = comment;
    return true;
  }

  /**
   * Set the maximum number of versions to keep per client
   */
  setMaxVersionsPerClient(max: number): void {
    if (max < 1) {
      throw new Error("Maximum versions per client must be at least 1");
    }
    this.maxVersionsPerClient = max;

    // Apply the new limit to all clients
    this.configVersions.forEach((_, clientId) => {
      this.enforceVersionLimit(clientId);
    });
  }

  /**
   * Enforce the version limit for a client
   */
  private enforceVersionLimit(clientId: string): void {
    const clientVersions = this.configVersions.get(clientId);
    if (!clientVersions) return;

    // Sort versions by creation date (newest first)
    const sortedVersions = [...clientVersions].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );

    // Always keep snapshots and only trim regular versions if needed
    const snapshots = sortedVersions.filter((v) => v.isSnapshot);
    const regularVersions = sortedVersions.filter((v) => !v.isSnapshot);

    // If we have more regular versions than allowed, remove the oldest ones
    if (regularVersions.length > this.maxVersionsPerClient) {
      const versionsToKeep = regularVersions.slice(
        0,
        this.maxVersionsPerClient,
      );
      const versionsToKeepIds = new Set(
        [...versionsToKeep, ...snapshots].map((v) => v.id),
      );

      // Update the client's versions list
      this.configVersions.set(
        clientId,
        clientVersions.filter((v) => versionsToKeepIds.has(v.id)),
      );
    }
  }

  /**
   * Export configuration history to a file
   */
  exportHistory(clientId: string, format: "json" | "csv" = "json"): string {
    const history = this.getVersions(clientId);

    if (format === "json") {
      // Export as JSON
      return JSON.stringify(history, null, 2);
    } else {
      // Export as CSV
      const headers = [
        "Version ID",
        "Created At",
        "Created By",
        "Comment",
        "Is Snapshot",
        "Tags",
      ];
      const rows = history.map((version) => [
        version.id,
        version.createdAt.toISOString(),
        version.createdBy,
        version.comment || "",
        version.isSnapshot ? "Yes" : "No",
        version.tags ? version.tags.join(", ") : "",
      ]);

      // Convert to CSV format
      const csvContent = [
        headers.join(","),
        ...rows.map((row) =>
          row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
        ),
      ].join("\n");

      return csvContent;
    }
  }

  /**
   * Get configuration history summary for a client
   */
  getHistorySummary(clientId: string): {
    totalVersions: number;
    totalSnapshots: number;
    latestVersion: ConfigurationVersion | null;
    latestSnapshot: ConfigurationVersion | null;
    recentChanges: { date: Date; count: number }[];
  } {
    const history = this.getVersions(clientId);
    const snapshots = history.filter((v) => v.isSnapshot);

    // Group versions by day to show recent activity
    const changesByDay = new Map<string, number>();
    history.forEach((version) => {
      const dateKey = version.createdAt.toISOString().split("T")[0]; // YYYY-MM-DD
      changesByDay.set(dateKey, (changesByDay.get(dateKey) || 0) + 1);
    });

    // Convert to array of { date, count } objects
    const recentChanges = Array.from(changesByDay.entries())
      .map(([dateStr, count]) => ({
        date: new Date(dateStr),
        count,
      }))
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, 7); // Last 7 days with changes

    return {
      totalVersions: history.length,
      totalSnapshots: snapshots.length,
      latestVersion: history.length > 0 ? history[0] : null,
      latestSnapshot: snapshots.length > 0 ? snapshots[0] : null,
      recentChanges,
    };
  }
}

// Export singleton instance
export const configVersionManager = new ConfigVersionManager();
