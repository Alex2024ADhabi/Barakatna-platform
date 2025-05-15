/**
 * Client-Supplier Service
 *
 * This service manages the relationship between clients and suppliers,
 * including associations, service agreements, and evaluations.
 */

import { clientApi } from "@/lib/api/client/clientApi";
import { clientSupplierApi } from "@/lib/api/client/clientSupplierApi";
import { supplierApi } from "@/lib/api/supplier/supplierApi";
import {
  ClientSupplierAssociation,
  ClientSupplierServiceAgreement,
} from "@/lib/api/client/types";
import { Supplier } from "@/lib/api/supplier/types";

export const clientSupplierService = {
  /**
   * Get all suppliers associated with a client
   */
  getClientSuppliers: async (
    clientId: string | number,
    includeDetails: boolean = false,
  ): Promise<ClientSupplierAssociation[]> => {
    try {
      const response = await clientSupplierApi.getClientSuppliers(clientId);
      if (!response.success || !response.data) {
        console.error(
          `Failed to get suppliers for client ${clientId}:`,
          response.error,
        );
        return [];
      }

      const associations = response.data.items || [];

      // If detailed supplier information is requested, fetch it
      if (includeDetails && associations.length > 0) {
        const enrichedAssociations = await Promise.all(
          associations.map(async (association) => {
            const supplierResponse = await supplierApi.getSupplierById(
              association.supplierId.toString(),
            );
            if (supplierResponse.success && supplierResponse.data) {
              return {
                ...association,
                supplier: supplierResponse.data,
              };
            }
            return association;
          }),
        );
        return enrichedAssociations;
      }

      return associations;
    } catch (error) {
      console.error("Error fetching client suppliers:", error);
      return [];
    }
  },

  /**
   * Get preferred suppliers for a client
   */
  getClientPreferredSuppliers: async (
    clientId: string | number,
  ): Promise<ClientSupplierAssociation[]> => {
    try {
      const response =
        await clientSupplierApi.getClientPreferredSuppliers(clientId);
      if (!response.success || !response.data) {
        console.error(
          `Failed to get preferred suppliers for client ${clientId}:`,
          response.error,
        );
        return [];
      }
      return response.data.items || [];
    } catch (error) {
      console.error("Error fetching preferred suppliers:", error);
      return [];
    }
  },

  /**
   * Get blacklisted suppliers for a client
   */
  getClientBlacklistedSuppliers: async (
    clientId: string | number,
  ): Promise<ClientSupplierAssociation[]> => {
    try {
      const response =
        await clientSupplierApi.getClientBlacklistedSuppliers(clientId);
      if (!response.success || !response.data) {
        console.error(
          `Failed to get blacklisted suppliers for client ${clientId}:`,
          response.error,
        );
        return [];
      }
      return response.data.items || [];
    } catch (error) {
      console.error("Error fetching blacklisted suppliers:", error);
      return [];
    }
  },

  /**
   * Associate a supplier with a client
   */
  associateSupplier: async (
    clientId: string | number,
    supplierId: string | number,
    data: {
      status?: "active" | "inactive" | "pending" | "blacklisted";
      isPreferred?: boolean;
      startDate?: string;
      endDate?: string;
      contractUrl?: string;
      paymentTerms?: string;
      discountPercentage?: number;
      notes?: string;
    },
  ): Promise<ClientSupplierAssociation | null> => {
    try {
      // Set default values if not provided
      const associationData = {
        status: data.status || "pending",
        isPreferred: data.isPreferred || false,
        startDate: data.startDate || new Date().toISOString().split("T")[0],
        ...data,
      };

      const response = await clientSupplierApi.associateSupplier(
        clientId,
        supplierId,
        associationData,
      );

      if (!response.success || !response.data) {
        console.error(
          `Failed to associate supplier ${supplierId} with client ${clientId}:`,
          response.error,
        );
        return null;
      }

      return response.data;
    } catch (error) {
      console.error("Error associating supplier with client:", error);
      return null;
    }
  },

  /**
   * Update a client-supplier association
   */
  updateSupplierAssociation: async (
    clientId: string | number,
    supplierId: string | number,
    data: {
      status?: "active" | "inactive" | "pending" | "blacklisted";
      isPreferred?: boolean;
      startDate?: string;
      endDate?: string;
      contractUrl?: string;
      paymentTerms?: string;
      discountPercentage?: number;
      notes?: string;
    },
  ): Promise<ClientSupplierAssociation | null> => {
    try {
      const response = await clientSupplierApi.updateSupplierAssociation(
        clientId,
        supplierId,
        data,
      );

      if (!response.success || !response.data) {
        console.error(`Failed to update supplier association:`, response.error);
        return null;
      }

      return response.data;
    } catch (error) {
      console.error("Error updating supplier association:", error);
      return null;
    }
  },

  /**
   * Remove a supplier association from a client
   */
  disassociateSupplier: async (
    clientId: string | number,
    supplierId: string | number,
  ): Promise<boolean> => {
    try {
      const response = await clientSupplierApi.disassociateSupplier(
        clientId,
        supplierId,
      );

      if (!response.success) {
        console.error(
          `Failed to disassociate supplier ${supplierId} from client ${clientId}:`,
          response.error,
        );
        return false;
      }

      return true;
    } catch (error) {
      console.error("Error disassociating supplier from client:", error);
      return false;
    }
  },

  /**
   * Get service agreements for a client-supplier association
   */
  getServiceAgreements: async (
    clientId: string | number,
    supplierId: string | number,
  ): Promise<ClientSupplierServiceAgreement[]> => {
    try {
      const response =
        await clientSupplierApi.getClientSupplierServiceAgreements(
          clientId,
          supplierId,
        );

      if (!response.success || !response.data) {
        console.error(`Failed to get service agreements:`, response.error);
        return [];
      }

      return response.data.items || [];
    } catch (error) {
      console.error("Error fetching service agreements:", error);
      return [];
    }
  },

  /**
   * Create a service agreement for a client-supplier association
   */
  createServiceAgreement: async (
    clientId: string | number,
    supplierId: string | number,
    data: {
      agreementCode: string;
      title: string;
      description?: string;
      startDate: string;
      endDate?: string;
      renewalDate?: string;
      autoRenewal?: boolean;
      documentUrl?: string;
      termsAndConditions?: string;
      paymentTerms?: string;
      discountPercentage?: number;
      statusId: number;
      items?: Array<{
        serviceId?: number;
        productId?: number;
        description: string;
        quantity?: number;
        unitPrice?: number;
        discountPercentage?: number;
        taxPercentage?: number;
        totalPrice?: number;
        notes?: string;
      }>;
    },
  ): Promise<ClientSupplierServiceAgreement | null> => {
    try {
      const response = await clientSupplierApi.createServiceAgreement(
        clientId,
        supplierId,
        data,
      );

      if (!response.success || !response.data) {
        console.error(`Failed to create service agreement:`, response.error);
        return null;
      }

      return response.data;
    } catch (error) {
      console.error("Error creating service agreement:", error);
      return null;
    }
  },

  /**
   * Find suppliers that match client criteria
   */
  findMatchingSuppliers: async (
    clientId: string | number,
    criteria: {
      specialties?: string[];
      minRating?: number;
      location?: string;
      services?: string[];
      products?: string[];
    },
  ): Promise<Supplier[]> => {
    try {
      const response = await clientSupplierApi.getMatchingSuppliers(
        clientId,
        criteria,
      );

      if (!response.success || !response.data) {
        console.error(`Failed to find matching suppliers:`, response.error);
        return [];
      }

      return response.data.suppliers || [];
    } catch (error) {
      console.error("Error finding matching suppliers:", error);
      return [];
    }
  },

  /**
   * Create a supplier evaluation
   */
  createSupplierEvaluation: async (
    clientId: string | number,
    supplierId: string | number,
    data: {
      evaluationDate: string;
      evaluationPeriodStart?: string;
      evaluationPeriodEnd?: string;
      overallRating: number;
      qualityRating?: number;
      deliveryRating?: number;
      costRating?: number;
      serviceRating?: number;
      communicationRating?: number;
      strengths?: string;
      weaknesses?: string;
      recommendations?: string;
      notes?: string;
    },
  ): Promise<any> => {
    try {
      const response = await clientSupplierApi.createSupplierEvaluation(
        clientId,
        supplierId,
        data,
      );

      if (!response.success || !response.data) {
        console.error(`Failed to create supplier evaluation:`, response.error);
        return null;
      }

      return response.data;
    } catch (error) {
      console.error("Error creating supplier evaluation:", error);
      return null;
    }
  },

  /**
   * Get supplier evaluations for a client-supplier association
   */
  getSupplierEvaluations: async (
    clientId: string | number,
    supplierId: string | number,
  ): Promise<any[]> => {
    try {
      const response = await clientSupplierApi.getClientSupplierEvaluations(
        clientId,
        supplierId,
      );

      if (!response.success || !response.data) {
        console.error(`Failed to get supplier evaluations:`, response.error);
        return [];
      }

      return response.data.evaluations || [];
    } catch (error) {
      console.error("Error fetching supplier evaluations:", error);
      return [];
    }
  },

  /**
   * Get supplier performance metrics
   */
  getSupplierPerformanceMetrics: async (
    clientId: string | number,
    supplierId: string | number,
  ): Promise<any> => {
    try {
      // Get all evaluations
      const evaluations = await this.getSupplierEvaluations(
        clientId,
        supplierId,
      );

      if (evaluations.length === 0) {
        return {
          averageRating: 0,
          evaluationCount: 0,
          ratingTrend: "neutral",
          metrics: {
            quality: 0,
            delivery: 0,
            cost: 0,
            service: 0,
            communication: 0,
          },
        };
      }

      // Calculate average ratings
      const averageRating =
        evaluations.reduce((sum, eval) => sum + eval.overallRating, 0) /
        evaluations.length;

      // Calculate metrics
      const metrics = {
        quality: this.calculateAverageMetric(evaluations, "qualityRating"),
        delivery: this.calculateAverageMetric(evaluations, "deliveryRating"),
        cost: this.calculateAverageMetric(evaluations, "costRating"),
        service: this.calculateAverageMetric(evaluations, "serviceRating"),
        communication: this.calculateAverageMetric(
          evaluations,
          "communicationRating",
        ),
      };

      // Calculate rating trend
      let ratingTrend = "neutral";
      if (evaluations.length >= 2) {
        // Sort by date
        const sortedEvals = [...evaluations].sort(
          (a, b) =>
            new Date(b.evaluationDate).getTime() -
            new Date(a.evaluationDate).getTime(),
        );

        // Compare most recent with previous
        const recent = sortedEvals[0].overallRating;
        const previous = sortedEvals[1].overallRating;

        if (recent > previous) ratingTrend = "improving";
        else if (recent < previous) ratingTrend = "declining";
      }

      return {
        averageRating,
        evaluationCount: evaluations.length,
        ratingTrend,
        metrics,
      };
    } catch (error) {
      console.error("Error calculating supplier performance metrics:", error);
      return null;
    }
  },

  /**
   * Helper method to calculate average metric from evaluations
   */
  calculateAverageMetric: (evaluations: any[], metricName: string): number => {
    const validEvaluations = evaluations.filter(
      (eval) => eval[metricName] !== undefined,
    );
    if (validEvaluations.length === 0) return 0;

    return (
      validEvaluations.reduce((sum, eval) => sum + eval[metricName], 0) /
      validEvaluations.length
    );
  },
};
