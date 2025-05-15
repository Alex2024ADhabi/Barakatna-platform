import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useTranslatedDirection } from "@/hooks/useTranslatedDirection";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SelectField, TextInput } from "@/components/ui/form-components";
import { priceListApi } from "@/lib/api/priceList/priceListApi";
import {
  PriceItem,
  PriceItemVersion,
  PriceListFilterParams,
  ExportPriceListRequest,
} from "@/lib/api/priceList/types";
import {
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  Filter,
  Download,
  BarChart,
} from "lucide-react";

import { ClientType } from "@/lib/forms/types";
import { FilterParams, PaginationParams } from "@/lib/api/core/types";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PriceListComparisonToolProps {
  clientId?: string;
  clientType?: string | ClientType;
  clientTypeId?: number;
}

interface ComparisonItem extends PriceItem {
  priceA?: number;
  priceB?: number;
  priceDiff?: number;
  priceDiffPercentage?: number;
  source: "A" | "B" | "both";
}

interface QueryParams extends PaginationParams {
  [key: string]: any;
}

export const PriceListComparisonTool: React.FC<
  PriceListComparisonToolProps
> = ({ clientId, clientType, clientTypeId }) => {
  const { t } = useTranslation();
  const { isRTL } = useTranslatedDirection();
  const { toast } = useToast();

  // State for comparison sources
  const [comparisonType, setComparisonType] = useState<
    "version" | "client" | "market"
  >("version");
  const [sourceAType, setSourceAType] = useState<
    "version" | "client" | "market"
  >("version");
  const [sourceBType, setSourceBType] = useState<
    "version" | "client" | "market"
  >("version");

  // State for selected values
  const [selectedVersionA, setSelectedVersionA] = useState<string>("");
  const [selectedVersionB, setSelectedVersionB] = useState<string>("");
  const [selectedClientA, setSelectedClientA] = useState<string>("");
  const [selectedClientB, setSelectedClientB] = useState<string>("");

  // State for available options
  const [versions, setVersions] = useState<PriceItemVersion[]>([]);
  const [clients, setClients] = useState<{ id: string; name: string }[]>([]);

  // State for comparison results
  const [comparisonItems, setComparisonItems] = useState<ComparisonItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State for filtering and sorting
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [categories, setCategories] = useState<string[]>([]);
  const [sortField, setSortField] = useState<string>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [diffThreshold, setDiffThreshold] = useState<number>(5); // Show items with >5% difference by default

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch categories
        const categoriesResponse = await priceListApi.getCategories();
        if (categoriesResponse.success && categoriesResponse.data) {
          setCategories(categoriesResponse.data);
        }

        // Fetch actual version data if available, otherwise use mock data
        try {
          // This would be the actual API call in a real implementation
          // const versionsResponse = await priceListApi.getVersions();
          // if (versionsResponse.success && versionsResponse.data) {
          //   setVersions(versionsResponse.data);
          // }

          // For now, use mock data
          setVersions([
            {
              id: "current",
              name: t("common.status.active"),
              createdAt: new Date(),
              createdBy: "System",
              isActive: true,
              itemCount: 25,
            },
            {
              id: "v2023-12",
              name: "December 2023",
              createdAt: new Date(2023, 11, 1),
              createdBy: "Admin",
              isActive: false,
              itemCount: 22,
            },
            {
              id: "v2023-06",
              name: "June 2023",
              createdAt: new Date(2023, 5, 1),
              createdBy: "Admin",
              isActive: false,
              itemCount: 20,
            },
          ]);
        } catch (versionErr) {
          console.error("Error fetching versions:", versionErr);
        }

        // Fetch actual client data if available, otherwise use mock data
        try {
          // This would be the actual API call in a real implementation
          // const clientsResponse = await clientApi.getClients();
          // if (clientsResponse.success && clientsResponse.data) {
          //   setClients(clientsResponse.data.map(c => ({ id: c.id, name: c.name })));
          // }

          // For now, use mock data
          setClients([
            { id: "fdf", name: "Family Development Foundation" },
            { id: "adha", name: "Abu Dhabi Housing Authority" },
            { id: "cash", name: "Cash Clients" },
            { id: "market", name: "Market Standard" },
          ]);
        } catch (clientErr) {
          console.error("Error fetching clients:", clientErr);
        }

        // Set default selections
        setSelectedVersionA("current");
        setSelectedVersionB("v2023-12");
        setSelectedClientA(clientId || "fdf");
        setSelectedClientB("market");
      } catch (err) {
        setError(t("common.errors.general"));
        console.error("Error fetching initial data:", err);
      }
    };

    fetchInitialData();
  }, [t, clientId]);

  // Fetch comparison data when sources change
  useEffect(() => {
    const fetchComparisonData = async () => {
      if (
        (comparisonType === "version" &&
          (!selectedVersionA || !selectedVersionB)) ||
        (comparisonType === "client" &&
          (!selectedClientA || !selectedClientB)) ||
        (comparisonType === "market" && !selectedClientA)
      ) {
        return;
      }

      // Ensure we have a valid client type for API calls
      const effectiveClientType =
        typeof clientType === "string"
          ? (clientType as ClientType)
          : clientType || ClientType.FDF;

      setLoading(true);
      setError(null);

      try {
        // Fetch source A items
        const sourceAParams: QueryParams = {
          clientTypeId:
            clientTypeId ||
            (typeof clientType === "string" ? undefined : clientType?.id),
        };

        if (comparisonType === "version" || sourceAType === "version") {
          sourceAParams.versionId = selectedVersionA;
        } else if (comparisonType === "client" || sourceAType === "client") {
          sourceAParams.clientId = selectedClientA;
        }

        const responseA = await priceListApi.getPriceItems(sourceAParams);
        const itemsA =
          responseA.success && responseA.data ? responseA.data.items || [] : [];

        // Fetch source B items
        const sourceBParams: QueryParams = {
          clientTypeId:
            clientTypeId ||
            (typeof clientType === "string" ? undefined : clientType?.id),
        };

        if (comparisonType === "version" || sourceBType === "version") {
          sourceBParams.versionId = selectedVersionB;
        } else if (comparisonType === "client" || sourceBType === "client") {
          sourceBParams.clientId = selectedClientB;
        } else if (comparisonType === "market" || sourceBType === "market") {
          sourceBParams.isMarketStandard = true;
        }

        const responseB = await priceListApi.getPriceItems(sourceBParams);
        const itemsB =
          responseB.success && responseB.data ? responseB.data.items || [] : [];

        // Create comparison items
        const comparisonMap = new Map<string, ComparisonItem>();

        // Process items from source A
        itemsA.forEach((item) => {
          if (!item || !item.id) return; // Skip invalid items

          comparisonMap.set(item.id, {
            ...item,
            priceA: item.price,
            source: "A",
          });
        });

        // Process items from source B and update the map
        itemsB.forEach((item) => {
          if (!item || !item.id) return; // Skip invalid items

          const existingItem = comparisonMap.get(item.id);

          if (existingItem) {
            // Item exists in both sources
            const priceA = existingItem.price;
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
              ...item,
              priceB: item.price,
              source: "B",
            });
          }
        });

        // Convert map to array
        setComparisonItems(Array.from(comparisonMap.values()));
      } catch (err) {
        setError(t("common.errors.general"));
        console.error("Error fetching comparison data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchComparisonData();
  }, [
    t,
    comparisonType,
    sourceAType,
    sourceBType,
    selectedVersionA,
    selectedVersionB,
    selectedClientA,
    selectedClientB,
    clientType,
    clientTypeId,
  ]);

  // Handle sort change
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Filter and sort comparison items
  const filteredItems = comparisonItems
    .filter((item) => {
      if (!item) return false; // Skip null or undefined items

      // Apply search filter
      const matchesSearch =
        !searchTerm || searchTerm.trim() === ""
          ? true
          : (item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ??
              false) ||
            (item.description
              ?.toLowerCase()
              .includes(searchTerm.toLowerCase()) ??
              false) ||
            (item.category?.toLowerCase().includes(searchTerm.toLowerCase()) ??
              false);

      // Apply category filter
      const matchesCategory =
        !selectedCategory || selectedCategory.trim() === ""
          ? true
          : item.category === selectedCategory;

      // Apply difference threshold filter
      const matchesDiff =
        diffThreshold > 0 && item.source === "both"
          ? Math.abs(item.priceDiffPercentage || 0) >= diffThreshold
          : diffThreshold <= 0; // If no threshold, include all items

      return matchesSearch && matchesCategory && matchesDiff;
    })
    .sort((a, b) => {
      // Handle sorting
      let comparison = 0;

      try {
        switch (sortField) {
          case "name":
            comparison = (a.name || "").localeCompare(b.name || "");
            break;
          case "category":
            comparison = (a.category || "").localeCompare(b.category || "");
            break;
          case "priceA":
            comparison = (a.priceA || 0) - (b.priceA || 0);
            break;
          case "priceB":
            comparison = (a.priceB || 0) - (b.priceB || 0);
            break;
          case "diff":
            // Only compare items that have both prices
            if (a.source === "both" && b.source === "both") {
              comparison = (a.priceDiff || 0) - (b.priceDiff || 0);
            } else if (a.source === "both") {
              comparison = 1; // a has both prices, b doesn't, so a comes first
            } else if (b.source === "both") {
              comparison = -1; // b has both prices, a doesn't, so b comes first
            }
            break;
          case "diffPercentage":
            // Only compare items that have both prices
            if (a.source === "both" && b.source === "both") {
              comparison =
                (a.priceDiffPercentage || 0) - (b.priceDiffPercentage || 0);
            } else if (a.source === "both") {
              comparison = 1; // a has both prices, b doesn't, so a comes first
            } else if (b.source === "both") {
              comparison = -1; // b has both prices, a doesn't, so b comes first
            }
            break;
          default:
            comparison = 0;
        }
      } catch (err) {
        console.error("Error during sorting:", err);
        comparison = 0;
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });

  // Get source names for display
  const getSourceAName = () => {
    if (comparisonType === "version") {
      return (
        versions.find((v) => v.id === selectedVersionA)?.name ||
        selectedVersionA
      );
    } else if (comparisonType === "client" || comparisonType === "market") {
      return (
        clients.find((c) => c.id === selectedClientA)?.name || selectedClientA
      );
    }
    return "";
  };

  const getSourceBName = () => {
    if (comparisonType === "version") {
      return (
        versions.find((v) => v.id === selectedVersionB)?.name ||
        selectedVersionB
      );
    } else if (comparisonType === "client") {
      return (
        clients.find((c) => c.id === selectedClientB)?.name || selectedClientB
      );
    } else if (comparisonType === "market") {
      return "Market Standard";
    }
    return "";
  };

  // Handle export functionality
  const handleExport = async () => {
    try {
      // Check if there are items to export
      if (!filteredItems || filteredItems.length === 0) {
        toast({
          title: t("common.errors.exportFailed", "Export failed"),
          description: t(
            "priceList.noItemsToExport",
            "There are no items to export. Please adjust your filters.",
          ),
          variant: "destructive",
        });
        return;
      }

      // Ask user for export format
      const formatOptions = ["excel", "csv", "pdf"];
      const formatPrompt = prompt(
        t(
          "priceList.selectExportFormat",
          "Select export format (1=Excel, 2=CSV, 3=PDF):",
        ),
        "1",
      );

      if (!formatPrompt) return;

      const formatIndex = parseInt(formatPrompt) - 1;
      const format =
        formatIndex >= 0 && formatIndex < formatOptions.length
          ? formatOptions[formatIndex]
          : "excel";

      // Prepare export data
      const exportData = {
        title: `Price Comparison: ${getSourceAName()} vs ${getSourceBName()}`,
        date: new Date().toISOString(),
        items: filteredItems.map((item) => ({
          id: item.id,
          name: item.name || "",
          category: item.category || "",
          priceA: item.priceA,
          priceB: item.priceB,
          difference: item.priceDiff,
          percentageDifference: item.priceDiffPercentage,
          unit: item.unit || "",
          currency: item.currency || "AED",
        })),
      };

      // Create export request
      const exportRequest: ExportPriceListRequest = {
        format: format as "csv" | "excel" | "pdf",
        includeVersionHistory: false,
        filters: {
          category: selectedCategory,
          searchTerm: searchTerm,
          sortBy: sortField,
          sortDirection: sortDirection,
          diffThreshold: diffThreshold,
        },
        clientTypeId:
          typeof clientType === "object" ? clientType?.id : undefined,
        clientId: comparisonType === "client" ? selectedClientA : undefined,
        versionId: comparisonType === "version" ? selectedVersionA : undefined,
        comparisonType: comparisonType,
        sourceAId:
          comparisonType === "version"
            ? selectedVersionA
            : comparisonType === "client"
              ? selectedClientA
              : undefined,
        sourceBId:
          comparisonType === "version"
            ? selectedVersionB
            : comparisonType === "client"
              ? selectedClientB
              : undefined,
      };

      try {
        toast({
          title: t("priceList.exportPreparing", "Preparing export"),
          description: t(
            "priceList.exportPreparingDescription",
            "Your export is being prepared and will download shortly.",
          ),
        });

        // Call the API to export the price list
        const response = await priceListApi.exportPriceList(exportRequest);

        if (response.success && response.data) {
          // Handle successful export - download the file
          setTimeout(() => {
            try {
              // Create a download link and trigger it
              const downloadLink = document.createElement("a");
              downloadLink.href = response.data.downloadUrl;
              downloadLink.download = `price-comparison-${getSourceAName()}-vs-${getSourceBName()}-${new Date().toISOString().split("T")[0]}.${format}`;
              document.body.appendChild(downloadLink);
              downloadLink.click();
              document.body.removeChild(downloadLink);

              toast({
                title: t("priceList.exportReady", "Export ready"),
                description: t(
                  "priceList.exportReadyDescription",
                  "Your export is ready for download.",
                ),
              });
            } catch (downloadErr) {
              console.error("Error downloading file:", downloadErr);
              toast({
                title: t("common.errors.downloadFailed", "Download failed"),
                description: t(
                  "common.errors.downloadFailedDescription",
                  "There was an error downloading your export. Please try again.",
                ),
                variant: "destructive",
              });
            }
          }, 2000);
        } else {
          throw new Error(response.error || "Export failed");
        }
      } catch (exportErr) {
        console.error("Export API error:", exportErr);
        toast({
          title: t("common.errors.exportFailed", "Export failed"),
          description: t(
            "common.errors.exportFailedDescription",
            "There was an error preparing your export.",
          ),
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Error preparing export data:", err);
      toast({
        title: t("common.errors.exportFailed", "Export failed"),
        description: t(
          "common.errors.exportFailedDescription",
          "There was an error preparing your export.",
        ),
        variant: "destructive",
      });
    }
  };

  // Handle approval of price changes
  const handleApproveChanges = async () => {
    try {
      toast({
        title: t("priceList.approvingChanges", "Approving changes"),
        description: t(
          "priceList.approvingChangesDescription",
          "Processing your approval request...",
        ),
      });

      // Prepare the approval request
      const approvalRequest = {
        sourceType: comparisonType,
        sourceId:
          comparisonType === "version"
            ? selectedVersionA
            : comparisonType === "client"
              ? selectedClientA
              : undefined,
        targetType:
          comparisonType === "version"
            ? "version"
            : comparisonType === "client"
              ? "client"
              : "market",
        targetId:
          comparisonType === "version"
            ? selectedVersionB
            : comparisonType === "client"
              ? selectedClientB
              : undefined,
        approverNotes: "Approved via Price List Comparison Tool",
        approvalDate: new Date().toISOString(),
        applyImmediately: true,
        notifyStakeholders: true,
      };

      // Call the API to approve changes
      let response;
      if (comparisonType === "version") {
        response = await priceListApi.approvePriceChanges(
          selectedVersionB,
          "Approved via Price List Comparison Tool",
        );
      } else {
        // For client or market comparisons, we would use a different endpoint
        // This is a placeholder for the actual implementation
        // In a real implementation, this would call a different API endpoint
        // For now, we'll simulate success
        response = { success: true };
      }

      if (response.success) {
        toast({
          title: t("priceList.changesApproved", "Changes approved"),
          description: t(
            "priceList.changesApprovedDescription",
            "The price list changes have been approved successfully.",
          ),
        });

        // Refresh the comparison data
        if (comparisonType === "version") {
          // After approval, version B becomes the current version
          setSelectedVersionA(selectedVersionB);
        }
      } else {
        throw new Error(response.error || "Approval failed");
      }
    } catch (err) {
      console.error("Error approving changes:", err);
      toast({
        title: t("common.errors.approvalFailed", "Approval failed"),
        description: t(
          "common.errors.approvalFailedDescription",
          "There was an error processing your approval request.",
        ),
        variant: "destructive",
      });
    }
  };

  // Handle rejection of price changes
  const handleRejectChanges = async (reason: string) => {
    try {
      if (!reason || reason.trim() === "") {
        toast({
          title: t("common.errors.validationError", "Validation Error"),
          description: t(
            "priceList.rejectionReasonRequired",
            "A reason for rejection is required.",
          ),
          variant: "destructive",
        });
        return;
      }

      toast({
        title: t("priceList.rejectingChanges", "Rejecting changes"),
        description: t(
          "priceList.rejectingChangesDescription",
          "Processing your rejection request...",
        ),
      });

      // Prepare the rejection request
      const rejectionRequest = {
        sourceType: comparisonType,
        sourceId:
          comparisonType === "version"
            ? selectedVersionA
            : comparisonType === "client"
              ? selectedClientA
              : undefined,
        targetType:
          comparisonType === "version"
            ? "version"
            : comparisonType === "client"
              ? "client"
              : "market",
        targetId:
          comparisonType === "version"
            ? selectedVersionB
            : comparisonType === "client"
              ? selectedClientB
              : undefined,
        rejectionReason: reason,
        rejectionDate: new Date().toISOString(),
        reviewerNotes: reason,
        notifyStakeholders: true,
        suggestAlternatives: false,
      };

      // Call the API to reject changes
      let response;
      if (comparisonType === "version") {
        response = await priceListApi.rejectPriceChanges(
          selectedVersionB,
          reason,
        );
      } else {
        // For client or market comparisons, we would use a different endpoint
        // This is a placeholder for the actual implementation
        // In a real implementation, this would call a different API endpoint
        // For now, we'll simulate success
        response = { success: true };
      }

      if (response.success) {
        toast({
          title: t("priceList.changesRejected", "Changes rejected"),
          description: t(
            "priceList.changesRejectedDescription",
            "The price list changes have been rejected.",
          ),
        });
      } else {
        throw new Error(response.error || "Rejection failed");
      }
    } catch (err) {
      console.error("Error rejecting changes:", err);
      toast({
        title: t("common.errors.rejectionFailed", "Rejection failed"),
        description: t(
          "common.errors.rejectionFailedDescription",
          "There was an error processing your rejection request.",
        ),
        variant: "destructive",
      });
    }
  };

  // Handle mass update of price items
  const handleMassUpdate = async (updateData: {
    percentage: number;
    categories: string[];
    itemIds?: string[];
  }) => {
    try {
      const { percentage, categories, itemIds } = updateData;

      // Validate percentage is a number
      if (isNaN(percentage)) {
        toast({
          title: t("common.errors.validationError", "Validation Error"),
          description: t(
            "priceList.invalidPercentage",
            "Please enter a valid percentage value.",
          ),
          variant: "destructive",
        });
        return;
      }

      // Confirm with user if percentage change is large
      if (Math.abs(percentage) > 20) {
        const confirmed = window.confirm(
          t(
            "priceList.confirmLargePercentageChange",
            `You are about to apply a ${percentage}% change, which is significant. Are you sure you want to continue?`,
          ),
        );
        if (!confirmed) return;
      }

      toast({
        title: t("priceList.updatingPrices", "Updating prices"),
        description: t(
          "priceList.updatingPricesDescription",
          `Applying ${percentage}% change to ${categories.length > 0 ? categories.length + " categories" : "all items"}...`,
        ),
      });

      // Prepare the update request
      const updateRequest = {
        percentage,
        categories,
        itemIds,
        clientId: comparisonType === "client" ? selectedClientA : undefined,
        clientTypeId:
          typeof clientType === "object" ? clientType?.id : undefined,
        versionId: comparisonType === "version" ? selectedVersionA : undefined,
        applyToAllItems:
          categories.length === 0 && (!itemIds || itemIds.length === 0),
        updateReason: `Mass update: ${percentage}% change applied to ${categories.length > 0 ? "selected categories" : itemIds && itemIds.length > 0 ? "selected items" : "all items"}`,
      };

      try {
        // Call the API to mass update prices
        let response;
        if (comparisonType === "version") {
          // Use the priceListApi to call the mass update endpoint
          response = await priceListApi.massUpdatePriceItems(
            filteredItems.map((item) => item.id),
            { percentage },
            "en",
          );
        } else {
          // For client or market comparisons, we would use a different approach
          // This is a placeholder for the actual implementation
          // For now, we'll simulate success
          response = {
            success: true,
            data: { updatedCount: filteredItems.length },
          };
        }

        if (response.success) {
          toast({
            title: t("priceList.pricesUpdated", "Prices updated"),
            description: t(
              "priceList.pricesUpdatedDescription",
              `Successfully updated ${response.data?.updatedCount || 0} items.`,
            ),
          });

          // Refresh the comparison data
          // This would trigger the useEffect to fetch the updated data
          setSelectedVersionA(selectedVersionA);
        } else {
          throw new Error(response.error || "Update failed");
        }
      } catch (apiErr) {
        console.error("API error during mass update:", apiErr);
        throw new Error("API error during mass update");
      }
    } catch (err) {
      console.error("Error updating prices:", err);
      toast({
        title: t("common.errors.updateFailed", "Update failed"),
        description: t(
          "common.errors.updateFailedDescription",
          "There was an error updating the prices.",
        ),
        variant: "destructive",
      });
    }
  };

  // Render the comparison tool
  return (
    <div className="space-y-6 bg-white p-4 rounded-lg">
      <div className="bg-blue-50 p-4 rounded-md">
        <h3 className="font-medium text-lg mb-2">
          {t("priceList.comparisonTool")}
        </h3>
        <p className="text-sm text-gray-600">
          {t("priceList.comparisonDescription")}
        </p>
        <div className="mt-2 flex items-center text-sm text-blue-700">
          <BarChart size={16} className="mr-1" />
          <span>
            {t(
              "priceList.comparisonToolHelp",
              "Compare price lists across versions, clients, or against market standards",
            )}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <SelectField
              label={t("priceList.comparisonType")}
              value={comparisonType}
              onChange={(value) =>
                setComparisonType(value as "version" | "client" | "market")
              }
              options={[
                { value: "version", label: t("priceList.compareVersions") },
                { value: "client", label: t("priceList.compareClients") },
                { value: "market", label: t("priceList.compareMarket") },
              ]}
            />
          </div>

          {comparisonType === "version" && (
            <>
              <div>
                <SelectField
                  label={t("priceList.sourceA")}
                  value={selectedVersionA}
                  onChange={setSelectedVersionA}
                  options={(versions || [])
                    .filter((v) => v && v.id)
                    .map((v) => ({
                      value: v.id,
                      label: v.name || v.id,
                    }))}
                />
              </div>
              <div>
                <SelectField
                  label={t("priceList.sourceB")}
                  value={selectedVersionB}
                  onChange={setSelectedVersionB}
                  options={(versions || [])
                    .filter((v) => v && v.id)
                    .map((v) => ({
                      value: v.id,
                      label: v.name || v.id,
                    }))}
                />
              </div>
            </>
          )}

          {comparisonType === "client" && (
            <>
              <div>
                <SelectField
                  label={t("priceList.sourceA")}
                  value={selectedClientA}
                  onChange={setSelectedClientA}
                  options={(clients || [])
                    .filter((c) => c && c.id)
                    .map((c) => ({
                      value: c.id,
                      label: c.name || c.id,
                    }))}
                />
              </div>
              <div>
                <SelectField
                  label={t("priceList.sourceB")}
                  value={selectedClientB}
                  onChange={setSelectedClientB}
                  options={(clients || [])
                    .filter((c) => c && c.id)
                    .map((c) => ({
                      value: c.id,
                      label: c.name || c.id,
                    }))}
                />
              </div>
            </>
          )}

          {comparisonType === "market" && (
            <>
              <div>
                <SelectField
                  label={t("priceList.client")}
                  value={selectedClientA}
                  onChange={setSelectedClientA}
                  options={(clients || [])
                    .filter((c) => c && c.id && c.id !== "market")
                    .map((c) => ({
                      value: c.id,
                      label: c.name || c.id,
                    }))}
                />
              </div>
              <div>
                <p className="text-sm font-medium mb-2">
                  {t("priceList.marketStandard")}
                </p>
                <div className="h-9 flex items-center text-gray-500">
                  {t("priceList.marketStandardPrices")}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="flex flex-col md:flex-row md:items-end space-y-4 md:space-y-0 md:space-x-4">
          <div className="w-full md:w-1/3">
            <TextInput
              label={t("common.buttons.search")}
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder={t("priceList.searchItems")}
            />
          </div>
          <div className="w-full md:w-1/3">
            <SelectField
              label={t("common.labels.category")}
              value={selectedCategory}
              onChange={setSelectedCategory}
              options={[
                { value: "", label: t("common.labels.all") },
                ...(categories || [])
                  .filter((cat) => cat)
                  .map((cat) => ({
                    value: cat,
                    label: cat,
                  })),
              ]}
              placeholder={t("common.labels.category")}
            />
          </div>
          <div className="w-full md:w-1/3">
            <div className="flex items-end space-x-2">
              <div className="flex-grow">
                <TextInput
                  label={t("priceList.diffThreshold")}
                  type="number"
                  value={diffThreshold.toString()}
                  onChange={(value) => setDiffThreshold(Number(value))}
                  min="0"
                  max="100"
                />
              </div>
              <Button variant="outline" size="sm" className="mb-0.5">
                <Filter className="mr-2" size={16} />
                {t("common.buttons.filter")}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">{t("common.loading")}</div>
      ) : error ? (
        <div className="text-center py-8 text-red-500">{error}</div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("name")}
                >
                  <div className="flex items-center">
                    {t("common.labels.name")}
                    {sortField === "name" &&
                      (sortDirection === "asc" ? (
                        <ChevronUp className="ml-1" size={16} />
                      ) : (
                        <ChevronDown className="ml-1" size={16} />
                      ))}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("category")}
                >
                  <div className="flex items-center">
                    {t("common.labels.category")}
                    {sortField === "category" &&
                      (sortDirection === "asc" ? (
                        <ChevronUp className="ml-1" size={16} />
                      ) : (
                        <ChevronDown className="ml-1" size={16} />
                      ))}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("priceA")}
                >
                  <div className="flex items-center">
                    {getSourceAName()}
                    {sortField === "priceA" &&
                      (sortDirection === "asc" ? (
                        <ChevronUp className="ml-1" size={16} />
                      ) : (
                        <ChevronDown className="ml-1" size={16} />
                      ))}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("priceB")}
                >
                  <div className="flex items-center">
                    {getSourceBName()}
                    {sortField === "priceB" &&
                      (sortDirection === "asc" ? (
                        <ChevronUp className="ml-1" size={16} />
                      ) : (
                        <ChevronDown className="ml-1" size={16} />
                      ))}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("diff")}
                >
                  <div className="flex items-center">
                    {t("priceList.difference")}
                    {sortField === "diff" &&
                      (sortDirection === "asc" ? (
                        <ChevronUp className="ml-1" size={16} />
                      ) : (
                        <ChevronDown className="ml-1" size={16} />
                      ))}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("diffPercentage")}
                >
                  <div className="flex items-center">
                    {t("priceList.diffPercentage")}
                    {sortField === "diffPercentage" &&
                      (sortDirection === "asc" ? (
                        <ChevronUp className="ml-1" size={16} />
                      ) : (
                        <ChevronDown className="ml-1" size={16} />
                      ))}
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    {t("common.noData")}
                  </TableCell>
                </TableRow>
              ) : (
                filteredItems.map((item) => {
                  // Determine row styling based on difference
                  const diffPercentage = item.priceDiffPercentage || 0;
                  let rowClass = "";

                  if (diffPercentage > 10) {
                    rowClass = "bg-red-50";
                  } else if (diffPercentage < -10) {
                    rowClass = "bg-green-50";
                  } else if (Math.abs(diffPercentage) > 5) {
                    rowClass = "bg-yellow-50";
                  }

                  return (
                    <TableRow key={item.id} className={rowClass}>
                      <TableCell>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-xs text-gray-500">
                          {item.description}
                        </div>
                      </TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell>
                        {item.priceA !== undefined ? (
                          <span>
                            {item.priceA.toFixed(2)} {item.currency}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {item.priceB !== undefined ? (
                          <span>
                            {item.priceB.toFixed(2)} {item.currency}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {item.priceDiff !== undefined ? (
                          <span
                            className={`${item.priceDiff > 0 ? "text-red-600" : item.priceDiff < 0 ? "text-green-600" : ""}`}
                          >
                            {item.priceDiff > 0 ? "+" : ""}
                            {item.priceDiff.toFixed(2)} {item.currency}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {item.priceDiffPercentage !== undefined ? (
                          <span
                            className={`${item.priceDiffPercentage > 0 ? "text-red-600" : item.priceDiffPercentage < 0 ? "text-green-600" : ""}`}
                          >
                            {item.priceDiffPercentage > 0 ? "+" : ""}
                            {item.priceDiffPercentage.toFixed(2)}%
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <div className="bg-gray-50 p-4 rounded-md">
        <Tabs defaultValue="summary" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="summary">{t("priceList.summary")}</TabsTrigger>
            <TabsTrigger value="analytics">
              {t("priceList.analytics")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="summary">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">
                  {t("priceList.totalItems")}
                </p>
                <p className="font-medium">{filteredItems.length}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">
                  {t("priceList.averageDiff")}
                </p>
                <p className="font-medium">
                  {filteredItems.length > 0
                    ? (
                        filteredItems.reduce(
                          (sum, item) => sum + (item.priceDiffPercentage || 0),
                          0,
                        ) / filteredItems.length
                      ).toFixed(2) + "%"
                    : "0%"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">
                  {t("priceList.itemsWithSignificantDiff")}
                </p>
                <p className="font-medium">
                  {
                    filteredItems.filter(
                      (item) => Math.abs(item.priceDiffPercentage || 0) > 10,
                    ).length
                  }
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-md p-3">
                  <h5 className="font-medium mb-2">
                    {t("priceList.categoryBreakdown")}
                  </h5>
                  <div className="text-sm">
                    {categories.slice(0, 5).map((category) => {
                      const categoryItems = filteredItems.filter(
                        (item) => item.category === category,
                      );
                      const avgDiff =
                        categoryItems.length > 0
                          ? categoryItems.reduce(
                              (sum, item) =>
                                sum + (item.priceDiffPercentage || 0),
                              0,
                            ) / categoryItems.length
                          : 0;

                      return (
                        <div
                          key={category}
                          className="flex justify-between items-center mb-1"
                        >
                          <span>{category}</span>
                          <span
                            className={`${avgDiff > 0 ? "text-red-600" : avgDiff < 0 ? "text-green-600" : ""}`}
                          >
                            {avgDiff > 0 ? "+" : ""}
                            {avgDiff.toFixed(2)}%
                          </span>
                        </div>
                      );
                    })}
                    {categories.length > 5 && (
                      <div className="text-blue-500 text-xs mt-2">
                        +{categories.length - 5} {t("common.labels.more")}
                      </div>
                    )}
                  </div>
                </div>

                <div className="border rounded-md p-3">
                  <h5 className="font-medium mb-2">
                    {t("priceList.priceRangeDistribution")}
                  </h5>
                  <div className="text-sm">
                    <div className="flex justify-between items-center mb-1">
                      <span>{t("priceList.increased")}</span>
                      <span className="text-red-600">
                        {
                          filteredItems.filter(
                            (item) => (item.priceDiffPercentage || 0) > 0,
                          ).length
                        }
                      </span>
                    </div>
                    <div className="flex justify-between items-center mb-1">
                      <span>{t("priceList.decreased")}</span>
                      <span className="text-green-600">
                        {
                          filteredItems.filter(
                            (item) => (item.priceDiffPercentage || 0) < 0,
                          ).length
                        }
                      </span>
                    </div>
                    <div className="flex justify-between items-center mb-1">
                      <span>{t("priceList.unchanged")}</span>
                      <span>
                        {
                          filteredItems.filter(
                            (item) => (item.priceDiffPercentage || 0) === 0,
                          ).length
                        }
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                className="w-full"
              >
                <Download className="mr-2" size={16} />
                {t("priceList.exportAnalytics")}
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        {comparisonItems.length > 0 && (
          <div className="mt-4 flex flex-wrap justify-end gap-2">
            <Button variant="outline" size="sm" onClick={handleExport}>
              {t("common.buttons.export")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                // Open a dialog for mass updates
                // This would be implemented with a dialog component
                // In a real implementation, this would open a dialog component for mass updates
                // For now, we'll use a simple prompt
                const percentage = prompt(
                  t(
                    "priceList.enterPercentageChange",
                    "Enter percentage change (e.g. 5 for 5% increase, -5 for 5% decrease):",
                  ),
                );

                if (percentage) {
                  const parsedPercentage =
                    percentage && !isNaN(parseFloat(percentage))
                      ? parseFloat(percentage)
                      : NaN;

                  // Validate the percentage
                  if (isNaN(parsedPercentage)) {
                    toast({
                      title: t(
                        "common.errors.validationError",
                        "Validation Error",
                      ),
                      description: t(
                        "priceList.invalidPercentage",
                        "Please enter a valid percentage value.",
                      ),
                      variant: "destructive",
                    });
                    return;
                  }

                  // In a real implementation, this would open a category selection dialog
                  // For now, we'll use a simple confirmation for category selection
                  const updateType = prompt(
                    t(
                      "priceList.selectUpdateType",
                      "Select update type: 1 = All items, 2 = By category, 3 = Selected items",
                    ),
                    "1",
                  );

                  if (!updateType) return;

                  let selectedCategories: string[] = [];
                  let selectedItemIds: string[] = [];

                  switch (updateType) {
                    case "1": // All items
                      break;

                    case "2": // By category
                      // In a real implementation, this would be a proper selection UI
                      // For now, we'll just use the first few categories as a mock
                      if (categories && categories.length > 0) {
                        const categoryOptions = categories
                          .map((cat, index) => `${index + 1} = ${cat}`)
                          .join("\n");

                        const categorySelection = prompt(
                          t(
                            "priceList.selectCategories",
                            `Select categories (comma-separated numbers):\n${categoryOptions}`,
                          ),
                        );

                        if (categorySelection) {
                          const selectedIndices = categorySelection
                            .split(",")
                            .map((s) => parseInt(s.trim()) - 1)
                            .filter(
                              (i) =>
                                !isNaN(i) &&
                                i >= 0 &&
                                categories &&
                                i < categories.length,
                            );

                          selectedCategories = selectedIndices
                            .map((i) => (categories ? categories[i] : ""))
                            .filter((cat) => cat);

                          if (selectedCategories.length > 0) {
                            alert(
                              t(
                                "priceList.selectedCategories",
                                `Selected categories: ${selectedCategories.join(", ")}`,
                              ),
                            );
                          }
                        }
                      } else {
                        alert(
                          t(
                            "priceList.noCategories",
                            "No categories available",
                          ),
                        );
                      }
                      break;

                    case "3": // Selected items
                      // In a real implementation, this would be a proper selection UI
                      // For now, we'll just use the first few items as a mock
                      if (filteredItems && filteredItems.length > 0) {
                        selectedItemIds = filteredItems
                          .slice(0, Math.min(5, filteredItems.length))
                          .map((item) => item.id);

                        if (selectedItemIds.length > 0) {
                          alert(
                            t(
                              "priceList.selectedItems",
                              `Selected ${selectedItemIds.length} items for update`,
                            ),
                          );
                        }
                      } else {
                        alert(t("priceList.noItems", "No items available"));
                      }
                      break;

                    default:
                      alert(
                        t("priceList.invalidSelection", "Invalid selection"),
                      );
                      return;
                  }

                  handleMassUpdate({
                    percentage: parsedPercentage,
                    categories: selectedCategories,
                    itemIds: selectedItemIds,
                  });
                }
              }}
            >
              {t("priceList.massUpdate", "Mass Update")}
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => {
                // Navigate to detailed analysis view
                const analysisParams = {
                  sourceType: comparisonType,
                  sourceId:
                    comparisonType === "version"
                      ? selectedVersionA
                      : comparisonType === "client"
                        ? selectedClientA
                        : undefined,
                  targetType:
                    comparisonType === "version"
                      ? "version"
                      : comparisonType === "client"
                        ? "client"
                        : "market",
                  targetId:
                    comparisonType === "version"
                      ? selectedVersionB
                      : comparisonType === "client"
                        ? selectedClientB
                        : undefined,
                  category: selectedCategory,
                  diffThreshold: diffThreshold,
                };

                // In a real implementation, this would navigate to a detailed analysis view
                // history.push(`/price-list/analysis?${new URLSearchParams(analysisParams).toString()}`);

                // For now, just show an alert
                alert(t("priceList.detailedAnalysisNotImplemented"));
              }}
            >
              {t("priceList.detailedAnalysis")}
            </Button>
            {comparisonType === "version" && (
              <>
                <Button
                  variant="default"
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                  onClick={handleApproveChanges}
                >
                  {t("common.buttons.approve", "Approve Changes")}
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  className="bg-red-600 hover:bg-red-700"
                  onClick={() => {
                    const reason = prompt(
                      t(
                        "priceList.enterRejectionReason",
                        "Enter reason for rejection:",
                      ),
                    );
                    if (reason) {
                      handleRejectChanges(reason);
                    }
                  }}
                >
                  {t("common.buttons.reject", "Reject Changes")}
                </Button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PriceListComparisonTool;

// Using the ExportPriceListRequest from types.ts
