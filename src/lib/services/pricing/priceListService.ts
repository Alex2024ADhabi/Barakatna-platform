import { ClientPriceList, PriceListItem } from "@/lib/database/client-schema";
import { clientApi } from "@/lib/api/client/clientApi";
import { clientConfigService } from "@/services/clientConfigService";

// Price list version interface
export interface PriceListVersion {
  id: string;
  priceListId: string;
  items: PriceListItem[];
  effectiveFrom: Date;
  effectiveTo?: Date;
  createdAt: Date;
  createdBy: string;
  status:
    | "draft"
    | "pending_approval"
    | "approved"
    | "rejected"
    | "active"
    | "archived";
  comment?: string;
}

// Price calculation options
export interface PriceCalculationOptions {
  includeTax?: boolean;
  applyDiscount?: number; // Percentage discount
  quantity?: number;
  clientId?: string; // For client-specific pricing
  date?: Date; // For date-specific pricing
}

// Mock price list storage
const priceLists: ClientPriceList[] = [];

// Mock price list versions storage
const priceListVersions: PriceListVersion[] = [];

// Price List Service
export const priceListService = {
  /**
   * Get price list by ID
   */
  getPriceList: async (
    priceListId: string,
  ): Promise<ClientPriceList | null> => {
    try {
      // In a real implementation, this would be an API call
      // For now, use mock data
      const priceList = priceLists.find((pl) => pl.id === priceListId);

      if (!priceList) {
        console.error(`Price list not found: ${priceListId}`);
        return null;
      }

      return priceList;
    } catch (error) {
      console.error(`Error retrieving price list: ${error}`);
      return null;
    }
  },

  /**
   * Get client price lists
   */
  getClientPriceLists: async (clientId: string): Promise<ClientPriceList[]> => {
    try {
      // Get price list IDs for client
      const response = await clientApi.getClientPriceLists(clientId);
      if (!response.success || !response.data) {
        console.error(
          `Failed to get price lists for client ${clientId}: ${response.error}`,
        );
        return [];
      }

      const priceListIds = response.data;

      // Get price lists by IDs
      const clientPriceLists: ClientPriceList[] = [];

      for (const id of priceListIds) {
        const priceList = await priceListService.getPriceList(id);
        if (priceList) {
          clientPriceLists.push(priceList);
        }
      }

      return clientPriceLists;
    } catch (error) {
      console.error(`Error retrieving client price lists: ${error}`);
      return [];
    }
  },

  /**
   * Get active price list for client
   */
  getActivePriceList: async (
    clientId: string,
  ): Promise<ClientPriceList | null> => {
    try {
      const clientPriceLists =
        await priceListService.getClientPriceLists(clientId);

      // Find active price list (status = active and current date is within effective dates)
      const now = new Date();
      const activePriceList = clientPriceLists.find((pl) => {
        return (
          pl.status === "active" &&
          new Date(pl.effectiveFrom) <= now &&
          (!pl.effectiveTo || new Date(pl.effectiveTo) >= now)
        );
      });

      if (!activePriceList) {
        console.error(`No active price list found for client ${clientId}`);
        return null;
      }

      return activePriceList;
    } catch (error) {
      console.error(`Error retrieving active price list: ${error}`);
      return null;
    }
  },

  /**
   * Get price for a specific item
   */
  getItemPrice: async (
    itemCode: string,
    options: PriceCalculationOptions = {},
  ): Promise<{ price: number; breakdown: Record<string, number> } | null> => {
    try {
      // Default options
      const {
        includeTax = true,
        applyDiscount = 0,
        quantity = 1,
        clientId,
        date = new Date(),
      } = options;

      // Get price list
      let priceList: ClientPriceList | null = null;

      if (clientId) {
        priceList = await priceListService.getActivePriceList(clientId);
      } else {
        // Use default price list if no client specified
        priceList =
          priceLists.find(
            (pl) =>
              pl.status === "active" &&
              new Date(pl.effectiveFrom) <= date &&
              (!pl.effectiveTo || new Date(pl.effectiveTo) >= date),
          ) || null;
      }

      if (!priceList) {
        console.error(`No applicable price list found`);
        return null;
      }

      // Find item in price list
      const item = priceList.items.find((i) => i.code === itemCode);
      if (!item) {
        console.error(
          `Item ${itemCode} not found in price list ${priceList.id}`,
        );
        return null;
      }

      // Calculate base price
      let basePrice = item.price * quantity;

      // Apply discount if any
      const discountAmount =
        applyDiscount > 0 ? (basePrice * applyDiscount) / 100 : 0;
      const priceAfterDiscount = basePrice - discountAmount;

      // Apply tax if needed
      let taxAmount = 0;
      if (includeTax && !item.taxIncluded) {
        // Get tax rate from client configuration or use default
        let taxRate = 5; // Default tax rate

        if (clientId) {
          // Try to get tax rate from client config service first
          const clientTypeId = await clientApi.getClientTypeId(clientId);
          if (clientTypeId) {
            taxRate =
              clientConfigService.getConfigValue(
                clientTypeId,
                "pricing",
                "taxPercentage",
              ) || taxRate;
          } else {
            // Fallback to client API if client type not found
            const clientResponse = await clientApi.getClientById(clientId);
            if (clientResponse.success && clientResponse.data) {
              taxRate = clientResponse.data.configuration?.taxRate || taxRate;
            }
          }
        }

        taxAmount = priceAfterDiscount * (taxRate / 100);
      }

      // Calculate final price
      const finalPrice = priceAfterDiscount + taxAmount;

      // Return price with breakdown
      return {
        price: finalPrice,
        breakdown: {
          basePrice,
          discount: discountAmount,
          priceAfterDiscount,
          tax: taxAmount,
          finalPrice,
        },
      };
    } catch (error) {
      console.error(`Error calculating item price: ${error}`);
      return null;
    }
  },

  /**
   * Calculate total price for multiple items
   */
  calculateTotalPrice: async (
    items: Array<{ code: string; quantity: number }>,
    options: Omit<PriceCalculationOptions, "quantity"> = {},
  ): Promise<{
    total: number;
    items: Array<{ code: string; price: number; quantity: number }>;
  } | null> => {
    try {
      let total = 0;
      const itemDetails: Array<{
        code: string;
        price: number;
        quantity: number;
      }> = [];

      for (const item of items) {
        const priceResult = await priceListService.getItemPrice(item.code, {
          ...options,
          quantity: item.quantity,
        });

        if (!priceResult) {
          console.error(`Failed to calculate price for item ${item.code}`);
          continue;
        }

        total += priceResult.price;
        itemDetails.push({
          code: item.code,
          price: priceResult.price,
          quantity: item.quantity,
        });
      }

      return {
        total,
        items: itemDetails,
      };
    } catch (error) {
      console.error(`Error calculating total price: ${error}`);
      return null;
    }
  },

  /**
   * Create a new price list
   */
  createPriceList: async (
    clientId: string,
    priceListData: Omit<
      ClientPriceList,
      "id" | "clientId" | "createdAt" | "updatedAt" | "createdBy"
    >,
    userId: string,
  ): Promise<ClientPriceList | null> => {
    try {
      // Validate price list data
      if (!priceListData.name) {
        console.error("Price list name is required");
        return null;
      }

      if (!priceListData.effectiveFrom) {
        console.error("Effective from date is required");
        return null;
      }

      if (!priceListData.items || priceListData.items.length === 0) {
        console.error("Price list must contain at least one item");
        return null;
      }

      // Create new price list
      const newPriceList: ClientPriceList = {
        id: `pricelist-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        clientId,
        name: priceListData.name,
        description: priceListData.description,
        effectiveFrom: priceListData.effectiveFrom,
        effectiveTo: priceListData.effectiveTo,
        items: priceListData.items,
        status: priceListData.status || "draft",
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: userId,
      };

      // In a real implementation, this would be saved to the database
      priceLists.push(newPriceList);

      // Associate price list with client
      await clientApi.associatePriceList(clientId, newPriceList.id);

      // Save price list version
      priceListService.savePriceListVersion(
        newPriceList.id,
        newPriceList.items,
        newPriceList.effectiveFrom,
        newPriceList.effectiveTo,
        userId,
        newPriceList.status as any,
        "Initial version",
      );

      return newPriceList;
    } catch (error) {
      console.error(`Error creating price list: ${error}`);
      return null;
    }
  },

  /**
   * Update price list
   */
  updatePriceList: async (
    priceListId: string,
    updates: Partial<ClientPriceList>,
    userId: string,
    comment?: string,
  ): Promise<ClientPriceList | null> => {
    try {
      // Find price list
      const priceListIndex = priceLists.findIndex(
        (pl) => pl.id === priceListId,
      );
      if (priceListIndex === -1) {
        console.error(`Price list not found: ${priceListId}`);
        return null;
      }

      const currentPriceList = priceLists[priceListIndex];

      // Check if price list is in a state that can be updated
      if (currentPriceList.status === "archived") {
        console.error("Cannot update archived price list");
        return null;
      }

      // Update price list
      const updatedPriceList: ClientPriceList = {
        ...currentPriceList,
        ...updates,
        updatedAt: new Date(),
      };

      // In a real implementation, this would update the database
      priceLists[priceListIndex] = updatedPriceList;

      // Save price list version if items were updated
      if (updates.items) {
        priceListService.savePriceListVersion(
          priceListId,
          updatedPriceList.items,
          updatedPriceList.effectiveFrom,
          updatedPriceList.effectiveTo,
          userId,
          updatedPriceList.status as any,
          comment || "Updated price list",
        );
      }

      return updatedPriceList;
    } catch (error) {
      console.error(`Error updating price list: ${error}`);
      return null;
    }
  },

  /**
   * Submit price list for approval
   */
  submitPriceListForApproval: async (
    priceListId: string,
    userId: string,
  ): Promise<ClientPriceList | null> => {
    try {
      return await priceListService.updatePriceList(
        priceListId,
        { status: "pending_approval" },
        userId,
        "Submitted for approval",
      );
    } catch (error) {
      console.error(`Error submitting price list for approval: ${error}`);
      return null;
    }
  },

  /**
   * Approve price list
   */
  approvePriceList: async (
    priceListId: string,
    userId: string,
    comments?: string,
  ): Promise<ClientPriceList | null> => {
    try {
      return await priceListService.updatePriceList(
        priceListId,
        { status: "approved" },
        userId,
        comments || "Price list approved",
      );
    } catch (error) {
      console.error(`Error approving price list: ${error}`);
      return null;
    }
  },

  /**
   * Reject price list
   */
  rejectPriceList: async (
    priceListId: string,
    userId: string,
    reason: string,
  ): Promise<ClientPriceList | null> => {
    try {
      return await priceListService.updatePriceList(
        priceListId,
        { status: "rejected" },
        userId,
        `Rejected: ${reason}`,
      );
    } catch (error) {
      console.error(`Error rejecting price list: ${error}`);
      return null;
    }
  },

  /**
   * Activate price list
   */
  activatePriceList: async (
    priceListId: string,
    userId: string,
  ): Promise<ClientPriceList | null> => {
    try {
      // Find price list
      const priceList = await priceListService.getPriceList(priceListId);
      if (!priceList) {
        console.error(`Price list not found: ${priceListId}`);
        return null;
      }

      // Check if price list is approved
      if (priceList.status !== "approved") {
        console.error("Only approved price lists can be activated");
        return null;
      }

      // Deactivate any currently active price lists for the same client
      const clientPriceLists = await priceListService.getClientPriceLists(
        priceList.clientId,
      );
      for (const pl of clientPriceLists) {
        if (pl.id !== priceListId && pl.status === "active") {
          await priceListService.updatePriceList(
            pl.id,
            { status: "archived" },
            userId,
            `Archived due to activation of price list ${priceListId}`,
          );
        }
      }

      // Activate the price list
      return await priceListService.updatePriceList(
        priceListId,
        { status: "active" },
        userId,
        "Price list activated",
      );
    } catch (error) {
      console.error(`Error activating price list: ${error}`);
      return null;
    }
  },

  /**
   * Get price list history
   */
  getPriceListHistory: (priceListId: string): PriceListVersion[] => {
    return priceListVersions
      .filter((version) => version.priceListId === priceListId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  },

  /**
   * Get specific price list version
   */
  getPriceListVersion: (versionId: string): PriceListVersion | null => {
    return (
      priceListVersions.find((version) => version.id === versionId) || null
    );
  },

  /**
   * Restore price list from a previous version
   */
  restorePriceListVersion: async (
    priceListId: string,
    versionId: string,
    userId: string,
  ): Promise<ClientPriceList | null> => {
    try {
      // Find the version
      const version = priceListService.getPriceListVersion(versionId);
      if (!version || version.priceListId !== priceListId) {
        console.error(
          `Version not found or doesn't belong to price list: ${versionId}`,
        );
        return null;
      }

      // Update price list with version data
      return await priceListService.updatePriceList(
        priceListId,
        {
          items: version.items,
          effectiveFrom: version.effectiveFrom,
          effectiveTo: version.effectiveTo,
        },
        userId,
        `Restored from version ${versionId} (${version.createdAt.toISOString()})`,
      );
    } catch (error) {
      console.error(`Error restoring price list version: ${error}`);
      return null;
    }
  },

  /**
   * Helper: Save price list version
   */
  savePriceListVersion: (
    priceListId: string,
    items: PriceListItem[],
    effectiveFrom: Date,
    effectiveTo: Date | undefined,
    userId: string,
    status:
      | "draft"
      | "pending_approval"
      | "approved"
      | "rejected"
      | "active"
      | "archived",
    comment?: string,
  ): void => {
    const version: PriceListVersion = {
      id: `version-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      priceListId,
      items: JSON.parse(JSON.stringify(items)), // Deep copy
      effectiveFrom,
      effectiveTo,
      createdAt: new Date(),
      createdBy: userId,
      status,
      comment,
    };

    priceListVersions.push(version);
  },

  /**
   * Compare price lists
   */
  comparePriceLists: async (
    sourceAId: string,
    sourceBId: string,
    options: {
      type: "version" | "client" | "market";
      diffThreshold?: number;
      categories?: string[];
    },
  ): Promise<{
    items: Array<{
      id: string;
      name: string;
      category: string;
      priceA?: number;
      priceB?: number;
      priceDiff?: number;
      priceDiffPercentage?: number;
      source: "A" | "B" | "both";
    }>;
    summary: {
      totalItems: number;
      averageDiff: number;
      significantDiffs: number;
    };
  }> => {
    try {
      // Get items from source A
      let itemsA: PriceListItem[] = [];
      let itemsB: PriceListItem[] = [];

      if (options.type === "version") {
        // Compare two versions
        const versionA = priceListService.getPriceListVersion(sourceAId);
        const versionB = priceListService.getPriceListVersion(sourceBId);

        if (versionA) itemsA = versionA.items;
        if (versionB) itemsB = versionB.items;
      } else if (options.type === "client") {
        // Compare two clients
        const priceListA = await priceListService.getActivePriceList(sourceAId);
        const priceListB = await priceListService.getActivePriceList(sourceBId);

        if (priceListA) itemsA = priceListA.items;
        if (priceListB) itemsB = priceListB.items;
      } else if (options.type === "market") {
        // Compare client to market standard
        const priceListA = await priceListService.getActivePriceList(sourceAId);
        // Market standard would be fetched differently in a real implementation
        // For now, we'll use a mock
        const marketStandard = priceLists.find(
          (pl) => pl.id === "market-standard",
        );

        if (priceListA) itemsA = priceListA.items;
        if (marketStandard) itemsB = marketStandard.items;
      }

      // Create comparison map
      const comparisonMap = new Map<
        string,
        {
          id: string;
          name: string;
          category: string;
          priceA?: number;
          priceB?: number;
          priceDiff?: number;
          priceDiffPercentage?: number;
          source: "A" | "B" | "both";
        }
      >();

      // Process items from source A
      itemsA.forEach((item) => {
        if (
          options.categories &&
          options.categories.length > 0 &&
          !options.categories.includes(item.category)
        ) {
          return; // Skip items not in the selected categories
        }

        comparisonMap.set(item.id, {
          id: item.id,
          name: item.name,
          category: item.category,
          priceA: item.price,
          source: "A",
        });
      });

      // Process items from source B
      itemsB.forEach((item) => {
        if (
          options.categories &&
          options.categories.length > 0 &&
          !options.categories.includes(item.category)
        ) {
          return; // Skip items not in the selected categories
        }

        const existingItem = comparisonMap.get(item.id);

        if (existingItem) {
          // Item exists in both sources
          const priceA = existingItem.priceA!;
          const priceB = item.price;
          const priceDiff = priceB - priceA;
          const priceDiffPercentage =
            priceA > 0 ? (priceDiff / priceA) * 100 : 0;

          comparisonMap.set(item.id, {
            ...existingItem,
            priceB,
            priceDiff,
            priceDiffPercentage,
            source: "both",
          });
        } else {
          // Item only exists in source B
          comparisonMap.set(item.id, {
            id: item.id,
            name: item.name,
            category: item.category,
            priceB: item.price,
            source: "B",
          });
        }
      });

      // Convert map to array and apply threshold filter if specified
      let comparisonItems = Array.from(comparisonMap.values());

      if (options.diffThreshold && options.diffThreshold > 0) {
        comparisonItems = comparisonItems.filter(
          (item) =>
            item.source === "both" &&
            Math.abs(item.priceDiffPercentage || 0) >= options.diffThreshold,
        );
      }

      // Calculate summary statistics
      const totalItems = comparisonItems.length;
      const itemsWithDiff = comparisonItems.filter(
        (item) => item.source === "both",
      );
      const averageDiff =
        itemsWithDiff.length > 0
          ? itemsWithDiff.reduce(
              (sum, item) => sum + (item.priceDiffPercentage || 0),
              0,
            ) / itemsWithDiff.length
          : 0;
      const significantDiffs = comparisonItems.filter(
        (item) => Math.abs(item.priceDiffPercentage || 0) > 10,
      ).length;

      return {
        items: comparisonItems,
        summary: {
          totalItems,
          averageDiff,
          significantDiffs,
        },
      };
    } catch (error) {
      console.error(`Error comparing price lists: ${error}`);
      return {
        items: [],
        summary: {
          totalItems: 0,
          averageDiff: 0,
          significantDiffs: 0,
        },
      };
    }
  },

  /**
   * Mass update price items
   */
  massUpdatePriceItems: async (
    priceListId: string,
    updateData: {
      percentage: number;
      categories?: string[];
      itemIds?: string[];
    },
    userId: string,
  ): Promise<{ updatedCount: number } | null> => {
    try {
      // Get the price list
      const priceList = await priceListService.getPriceList(priceListId);
      if (!priceList) {
        console.error(`Price list not found: ${priceListId}`);
        return null;
      }

      // Make a copy of the items
      const updatedItems = [...priceList.items];
      let updatedCount = 0;

      // Apply the percentage change to the selected items
      for (let i = 0; i < updatedItems.length; i++) {
        const item = updatedItems[i];

        // Check if this item should be updated
        const shouldUpdate =
          (!updateData.categories ||
            updateData.categories.length === 0 ||
            updateData.categories.includes(item.category)) &&
          (!updateData.itemIds ||
            updateData.itemIds.length === 0 ||
            updateData.itemIds.includes(item.id));

        if (shouldUpdate) {
          // Apply the percentage change
          const factor = 1 + updateData.percentage / 100;
          updatedItems[i] = {
            ...item,
            price: Math.round(item.price * factor * 100) / 100, // Round to 2 decimal places
          };
          updatedCount++;
        }
      }

      // Update the price list with the new items
      const comment = `Mass update: ${updateData.percentage > 0 ? "+" : ""}${updateData.percentage}% applied to ${updatedCount} items`;
      await priceListService.updatePriceList(
        priceListId,
        { items: updatedItems },
        userId,
        comment,
      );

      return { updatedCount };
    } catch (error) {
      console.error(`Error mass updating price items: ${error}`);
      return null;
    }
  },
};
