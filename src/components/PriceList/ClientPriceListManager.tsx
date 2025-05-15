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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { priceListApi } from "@/lib/api/priceList/priceListApi";
import { PriceItem, PriceItemVersion } from "@/lib/api/priceList/types";
import {
  SelectField,
  TextInput,
  NumberInput,
} from "@/components/ui/form-components";
import DatePickerWithRange from "@/components/ui/date-picker-with-range";
import PriceItemForm, { PriceItemFormData } from "./PriceItemForm";
import { PriceListComparisonTool } from "./PriceListComparisonTool";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import {
  Download,
  Upload,
  Plus,
  Search,
  Filter,
  Check,
  X,
  Copy,
  AlertTriangle,
  Calendar,
  History,
  BarChart,
  Percent,
  Tag,
  FileText,
  Clock,
  Settings,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formDependencyResolver } from "@/lib/services/FormDependencyResolver";

import { ClientType } from "@/lib/forms/types";
import { formDependencyResolver } from "@/lib/services/FormDependencyResolver";

interface ClientPriceListManagerProps {
  clientId?: string;
  clientType?: string | ClientType;
  clientTypeId?: number;
  readOnly?: boolean;
  showClientTypeSelector?: boolean;
  allowCopyToOtherClients?: boolean;
  showVersionHistory?: boolean;
  showApprovalWorkflow?: boolean;
  defaultTab?: "current" | "versions" | "pending" | "compare";
}

const ClientPriceListManager: React.FC<ClientPriceListManagerProps> = ({
  clientId,
  clientType,
  clientTypeId,
  readOnly = false,
  showClientTypeSelector = false,
  allowCopyToOtherClients = false,
  showVersionHistory = true,
  showApprovalWorkflow = true,
  defaultTab = "current",
}) => {
  // Convert string clientType to enum if needed
  const effectiveClientType =
    typeof clientType === "string"
      ? (clientType as ClientType)
      : clientType || ClientType.FDF;
  const { t } = useTranslation();
  const { isRTL } = useTranslatedDirection();

  const [activeTab, setActiveTab] = useState(defaultTab);
  const [priceItems, setPriceItems] = useState<PriceItem[]>([]);
  const [versions, setVersions] = useState<PriceItemVersion[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [categories, setCategories] = useState<string[]>([]);
  const [showAddItemDialog, setShowAddItemDialog] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [showCopyDialog, setShowCopyDialog] = useState(false);
  const [targetClientType, setTargetClientType] = useState<ClientType | "">("");
  const [availableClientTypes, setAvailableClientTypes] = useState<
    ClientType[]
  >([]);
  const [copyInProgress, setCopyInProgress] = useState(false);
  const [copyResult, setCopyResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [importFile, setImportFile] = useState<File | null>(null);
  const [pendingApproval, setPendingApproval] = useState<PriceItem[]>([]);
  const [massUpdateDialogOpen, setMassUpdateDialogOpen] = useState(false);
  const [massUpdatePercentage, setMassUpdatePercentage] = useState<number>(0);
  const [massUpdateCategories, setMassUpdateCategories] = useState<string[]>(
    [],
  );
  const [createVersionDialogOpen, setCreateVersionDialogOpen] = useState(false);
  const [newVersionName, setNewVersionName] = useState("");
  const [newVersionDescription, setNewVersionDescription] = useState("");
  const [newVersionEffectiveDate, setNewVersionEffectiveDate] = useState<Date>(
    new Date(),
  );

  // Fetch price list data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch categories
        const categoriesResponse = await priceListApi.getCategories();
        if (categoriesResponse.success && categoriesResponse.data) {
          setCategories(categoriesResponse.data);
        }

        // Fetch price items
        const params: any = {
          clientType: effectiveClientType,
        };
        if (clientId) params.clientId = clientId;
        if (clientTypeId) params.clientTypeId = clientTypeId;
        if (selectedVersion) params.versionId = selectedVersion;
        if (selectedCategory) params.category = selectedCategory;
        if (searchTerm) params.searchTerm = searchTerm;

        const response = await priceListApi.getPriceItems(params);
        if (response.success && response.data) {
          setPriceItems(response.data.items || []);
        } else {
          setError(response.error || t("common.errors.general"));
        }

        // Fetch versions
        // This would be a separate API call in a real implementation
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

        // Mock pending approval items
        setPendingApproval([
          {
            id: "pending1",
            category: "Bathroom",
            name: "Premium Grab Bar Installation",
            description: "Premium stainless steel grab bar with enhanced grip",
            unit: "Each",
            price: 180,
            currency: "AED",
            createdBy: "John Doe",
            createdAt: new Date(2023, 11, 15),
          },
          {
            id: "pending2",
            category: "Kitchen",
            name: "Adjustable Counter Installation",
            description: "Motorized adjustable counter for accessibility",
            unit: "Linear meter",
            price: 750,
            currency: "AED",
            createdBy: "Jane Smith",
            createdAt: new Date(2023, 11, 16),
          },
        ]);

        // Fetch available client types for copy functionality
        if (allowCopyToOtherClients) {
          // In a real implementation, this would come from an API
          // For now, we'll use the enum values except the current one
          const allClientTypes = Object.values(ClientType) as ClientType[];
          setAvailableClientTypes(
            allClientTypes.filter((type) => type !== effectiveClientType),
          );
        }
      } catch (err) {
        setError(t("common.errors.general"));
        console.error("Error fetching price list data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [
    t,
    clientId,
    clientTypeId,
    selectedVersion,
    selectedCategory,
    searchTerm,
    allowCopyToOtherClients,
    effectiveClientType,
  ]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is handled by the useEffect dependency on searchTerm
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
  };

  const handleVersionChange = (value: string) => {
    setSelectedVersion(value);
  };

  const handleItemSelect = (itemId: string) => {
    setSelectedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId],
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === priceItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(priceItems.map((item) => item.id));
    }
  };

  const handleImport = async () => {
    if (!importFile) return;

    setLoading(true);
    try {
      const response = await priceListApi.bulkImport(
        importFile,
        effectiveClientType,
      );
      if (response.success) {
        // Refresh the price list
        const priceItemsResponse = await priceListApi.getPriceItems();
        if (priceItemsResponse.success && priceItemsResponse.data) {
          setPriceItems(priceItemsResponse.data.items || []);
        }
        setShowImportDialog(false);
        setImportFile(null);
      } else {
        setError(response.error || t("common.errors.general"));
      }
    } catch (err) {
      setError(t("common.errors.general"));
      console.error("Error importing price list:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await priceListApi.exportPriceList({
        format: "excel",
        filters: {
          category: selectedCategory,
          searchTerm: searchTerm,
          versionId: selectedVersion,
          clientType: effectiveClientType,
        },
      });

      if (response.success && response.data) {
        // Create a download link for the blob
        const url = window.URL.createObjectURL(response.data);
        const a = document.createElement("a");
        a.href = url;
        a.download = `price-list-${effectiveClientType}-${format(new Date(), "yyyy-MM-dd")}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        setError(response.error || t("common.errors.general"));
      }
    } catch (err) {
      setError(t("common.errors.general"));
      console.error("Error exporting price list:", err);
    }
  };

  // Handle copying price list items to another client type
  const handleCopyToClientType = async () => {
    if (!targetClientType) {
      setCopyResult({
        success: false,
        message: t("priceList.selectTargetClientType"),
      });
      return;
    }

    setCopyInProgress(true);
    setCopyResult(null);

    try {
      // In a real implementation, this would be an API call
      // For now, we'll simulate the copy process

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Simulate success
      setCopyResult({
        success: true,
        message: t("priceList.copySuccess", {
          count: selectedItems.length || priceItems.length,
          clientType: targetClientType,
        }),
      });

      // In a real implementation, we would refresh the data after copying
      // formDependencyResolver.notifyDependentForms('priceList', targetClientType as ClientType);
    } catch (err) {
      setCopyResult({
        success: false,
        message: t("common.errors.general"),
      });
      console.error("Error copying price list items:", err);
    } finally {
      setCopyInProgress(false);
    }
  };

  const handleApproveItems = () => {
    // In a real implementation, this would call an API to approve the items
    setPendingApproval([]);
    setShowApprovalDialog(false);
  };

  const handleRejectItems = () => {
    // In a real implementation, this would call an API to reject the items
    setPendingApproval([]);
    setShowApprovalDialog(false);
  };

  const filteredItems = priceItems.filter((item) => {
    const matchesSearch = searchTerm
      ? item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase())
      : true;

    const matchesCategory = selectedCategory
      ? item.category === selectedCategory
      : true;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold mb-2">
              {t("common.labels.priceList")}
              {effectiveClientType && (
                <span className="ml-2 text-lg font-normal text-gray-600">
                  ({effectiveClientType})
                </span>
              )}
            </h2>
            <p className="text-gray-600">
              {clientId
                ? t("priceList.clientSpecificDescription")
                : t("priceList.standardDescription")}
            </p>
          </div>

          {showClientTypeSelector && (
            <div className="flex items-center space-x-2">
              <SelectField
                label={t("common.labels.clientType")}
                value={effectiveClientType}
                onChange={(value) => {
                  // In a real implementation, this would update the client type
                  // and trigger a reload of the price list
                  console.log("Selected client type:", value);
                }}
                options={Object.values(ClientType).map((type) => ({
                  value: type,
                  label: type,
                }))}
                placeholder={t("common.labels.selectClientType")}
              />
            </div>
          )}
        </div>
      </div>

      <Tabs
        defaultValue={defaultTab}
        value={activeTab}
        onValueChange={setActiveTab}
        className="mb-6"
      >
        <TabsList>
          <TabsTrigger value="current">
            {t("priceList.currentList")}
          </TabsTrigger>
          {showVersionHistory && (
            <TabsTrigger value="versions">
              <History className="mr-1" size={14} />
              {t("priceList.versions")}
            </TabsTrigger>
          )}
          {showApprovalWorkflow && (
            <TabsTrigger value="pending">
              <Clock className="mr-1" size={14} />
              {t("priceList.pendingApproval")}
              {pendingApproval.length > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {pendingApproval.length}
                </Badge>
              )}
            </TabsTrigger>
          )}
          <TabsTrigger value="compare">
            <BarChart className="mr-1" size={14} />
            {t("priceList.compare")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="mt-4">
          <div className="flex flex-col space-y-4">
            <div className="flex justify-between items-center">
              <form
                onSubmit={handleSearch}
                className="flex items-center space-x-2"
              >
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={16}
                  />
                  <input
                    type="text"
                    placeholder={t("common.buttons.search")}
                    className="border rounded-md pl-10 pr-3 py-2 w-64"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <SelectField
                  label=""
                  value={selectedCategory}
                  onChange={handleCategoryChange}
                  options={["", ...categories]}
                  placeholder={t("common.labels.category")}
                />
                <Button type="submit" variant="outline" size="sm">
                  <Filter className="mr-2" size={16} />
                  {t("common.buttons.filter")}
                </Button>
              </form>

              <div className="flex items-center space-x-2">
                {!readOnly && (
                  <>
                    <Button
                      onClick={() => setShowAddItemDialog(true)}
                      variant="default"
                      size="sm"
                    >
                      <Plus className="mr-2" size={16} />
                      {t("priceList.addItem")}
                    </Button>
                    <Button
                      onClick={() => setShowImportDialog(true)}
                      variant="outline"
                      size="sm"
                    >
                      <Upload className="mr-2" size={16} />
                      {t("common.buttons.import")}
                    </Button>
                    {allowCopyToOtherClients && (
                      <Button
                        onClick={() => setShowCopyDialog(true)}
                        variant="outline"
                        size="sm"
                        disabled={selectedItems.length === 0}
                      >
                        <Copy className="mr-2" size={16} />
                        {t("priceList.copyToClientType")}
                      </Button>
                    )}
                  </>
                )}
                <Button onClick={handleExport} variant="outline" size="sm">
                  <Download className="mr-2" size={16} />
                  {t("common.buttons.export")}
                </Button>
              </div>
            </div>

            {selectedItems.length > 0 && !readOnly && (
              <div className="bg-blue-50 p-3 rounded-md flex justify-between items-center">
                <span>
                  {t("priceList.itemsSelected", {
                    count: selectedItems.length,
                  })}
                </span>
                <div className="space-x-2">
                  <Button variant="outline" size="sm">
                    {t("common.buttons.edit")}
                  </Button>
                  <Button variant="destructive" size="sm">
                    {t("common.buttons.delete")}
                  </Button>
                </div>
              </div>
            )}

            {loading ? (
              <div className="text-center py-8">{t("common.loading")}</div>
            ) : error ? (
              <div className="text-center py-8 text-red-500">{error}</div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {!readOnly && (
                        <TableHead className="w-12">
                          <input
                            type="checkbox"
                            checked={selectedItems.length === priceItems.length}
                            onChange={handleSelectAll}
                            className="rounded"
                          />
                        </TableHead>
                      )}
                      <TableHead>{t("common.labels.id")}</TableHead>
                      <TableHead>{t("common.labels.category")}</TableHead>
                      <TableHead>{t("common.labels.name")}</TableHead>
                      <TableHead>{t("common.labels.description")}</TableHead>
                      <TableHead>{t("common.labels.unit")}</TableHead>
                      <TableHead>{t("common.labels.price")}</TableHead>
                      <TableHead>{t("common.labels.actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredItems.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={readOnly ? 7 : 8}
                          className="text-center py-8"
                        >
                          {t("common.noData")}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredItems.map((item) => (
                        <TableRow key={item.id}>
                          {!readOnly && (
                            <TableCell>
                              <input
                                type="checkbox"
                                checked={selectedItems.includes(item.id)}
                                onChange={() => handleItemSelect(item.id)}
                                className="rounded"
                              />
                            </TableCell>
                          )}
                          <TableCell>{item.id}</TableCell>
                          <TableCell>{item.category}</TableCell>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>{item.description}</TableCell>
                          <TableCell>{item.unit}</TableCell>
                          <TableCell>
                            {item.price} {item.currency}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-blue-500 hover:text-blue-700"
                              >
                                {t("common.buttons.view")}
                              </Button>
                              {!readOnly && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-blue-500 hover:text-blue-700"
                                >
                                  {t("common.buttons.edit")}
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="versions" className="mt-4">
          <div className="flex flex-col space-y-4">
            <div className="flex justify-between items-center">
              <SelectField
                label={t("priceList.selectVersion")}
                value={selectedVersion}
                onChange={handleVersionChange}
                options={versions.map((v) => ({ value: v.id, label: v.name }))}
                placeholder={t("priceList.selectVersion")}
              />

              {!readOnly && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setCreateVersionDialogOpen(true)}
                >
                  <Plus className="mr-2" size={16} />
                  {t("priceList.createVersion")}
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {versions.map((version) => (
                <div
                  key={version.id}
                  className={`border rounded-lg p-4 ${version.isActive ? "border-blue-500 bg-blue-50" : ""}`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">{version.name}</h3>
                      <p className="text-sm text-gray-500">
                        {t("common.labels.createdBy")}: {version.createdBy}
                      </p>
                      <p className="text-sm text-gray-500">
                        {t("common.labels.createdDate")}:{" "}
                        {format(version.createdAt, "MMM dd, yyyy")}
                      </p>
                      <p className="text-sm text-gray-500">
                        {t("priceList.itemCount")}: {version.itemCount}
                      </p>
                    </div>
                    {version.isActive && (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                        {t("common.status.active")}
                      </span>
                    )}
                  </div>
                  <div className="mt-4 flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedVersion(version.id);
                        setActiveTab("current");
                      }}
                    >
                      {t("common.buttons.view")}
                    </Button>
                    {!readOnly && !version.isActive && (
                      <Button variant="default" size="sm">
                        {t("priceList.activate")}
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="pending" className="mt-4">
          <div className="flex flex-col space-y-4">
            {pendingApproval.length === 0 ? (
              <div className="text-center py-8">
                {t("priceList.noPendingApprovals")}
              </div>
            ) : (
              <>
                <div className="bg-yellow-50 p-4 rounded-md">
                  <p className="text-yellow-800">
                    {t("priceList.pendingApprovalsDescription")}
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t("common.labels.id")}</TableHead>
                        <TableHead>{t("common.labels.category")}</TableHead>
                        <TableHead>{t("common.labels.name")}</TableHead>
                        <TableHead>{t("common.labels.description")}</TableHead>
                        <TableHead>{t("common.labels.unit")}</TableHead>
                        <TableHead>{t("common.labels.price")}</TableHead>
                        <TableHead>{t("common.labels.createdBy")}</TableHead>
                        <TableHead>{t("common.labels.createdDate")}</TableHead>
                        <TableHead>{t("common.labels.actions")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pendingApproval.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.id}</TableCell>
                          <TableCell>{item.category}</TableCell>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>{item.description}</TableCell>
                          <TableCell>{item.unit}</TableCell>
                          <TableCell>
                            {item.price} {item.currency}
                          </TableCell>
                          <TableCell>{item.createdBy}</TableCell>
                          <TableCell>
                            {format(item.createdAt!, "MMM dd, yyyy")}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-green-500 hover:text-green-700"
                                onClick={() => setShowApprovalDialog(true)}
                              >
                                <Check size={16} className="mr-1" />
                                {t("common.buttons.approve")}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-500 hover:text-red-700"
                                onClick={() => setShowApprovalDialog(true)}
                              >
                                <X size={16} className="mr-1" />
                                {t("common.buttons.reject")}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button
                    variant="default"
                    onClick={() => setShowApprovalDialog(true)}
                  >
                    {t("priceList.approveAll")}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowApprovalDialog(true)}
                  >
                    {t("priceList.rejectAll")}
                  </Button>
                </div>
              </>
            )}
          </div>
        </TabsContent>

        <TabsContent value="compare" className="mt-4">
          <PriceListComparisonTool
            clientId={clientId}
            clientType={clientType}
            clientTypeId={clientTypeId}
          />
        </TabsContent>
      </Tabs>

      {/* Add Item Dialog */}
      <Dialog open={showAddItemDialog} onOpenChange={setShowAddItemDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{t("priceList.addItem")}</DialogTitle>
            <DialogDescription>
              {t("priceList.addItemDescription")}
            </DialogDescription>
          </DialogHeader>
          <PriceItemForm
            onSubmit={(data) => {
              // In a real implementation, this would call the API to create a new price item
              // For now, we'll just close the dialog
              setShowAddItemDialog(false);
              toast({
                title: t("priceList.itemAdded"),
                description: t("priceList.itemAddedDescription"),
              });
            }}
            onCancel={() => setShowAddItemDialog(false)}
            categories={categories}
            subcategories={categories.map((cat) => `${cat} Subcategory`)}
          />
        </DialogContent>
      </Dialog>

      {/* Import Dialog */}
      <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("priceList.importPriceList")}</DialogTitle>
            <DialogDescription>
              {t("priceList.importDescription")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={(e) =>
                  setImportFile(e.target.files ? e.target.files[0] : null)
                }
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer text-blue-500 hover:text-blue-700"
              >
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-600">
                  {importFile ? importFile.name : t("priceList.dragAndDrop")}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  {t("priceList.supportedFormats")}
                </p>
              </label>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">{t("priceList.importOptions")}</h4>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="update-existing" />
                <label htmlFor="update-existing">
                  {t("priceList.updateExisting")}
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="skip-errors" />
                <label htmlFor="skip-errors">{t("priceList.skipErrors")}</label>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">{t("priceList.effectiveDates")}</h4>
              <DatePickerWithRange date={dateRange} setDate={setDateRange} />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowImportDialog(false)}
            >
              {t("common.buttons.cancel")}
            </Button>
            <Button
              onClick={handleImport}
              disabled={!importFile}
              className="ml-2"
            >
              {t("common.buttons.import")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approval Dialog */}
      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("priceList.confirmApproval")}</DialogTitle>
            <DialogDescription>
              {t("priceList.approvalDescription")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <p>{t("priceList.approvalWarning")}</p>
            <div className="space-y-2">
              <TextInput
                label={t("priceList.approvalComment")}
                value=""
                onChange={() => {}}
                placeholder={t("priceList.enterComment")}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowApprovalDialog(false)}
            >
              {t("common.buttons.cancel")}
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectItems}
              className="ml-2"
            >
              {t("common.buttons.reject")}
            </Button>
            <Button onClick={handleApproveItems} className="ml-2">
              {t("common.buttons.approve")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Copy to Client Type Dialog */}
      <Dialog open={showCopyDialog} onOpenChange={setShowCopyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("priceList.copyToClientType")}</DialogTitle>
            <DialogDescription>
              {selectedItems.length > 0
                ? t("priceList.copySelectedItemsDescription", {
                    count: selectedItems.length,
                  })
                : t("priceList.copyAllItemsDescription", {
                    count: priceItems.length,
                  })}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <SelectField
                label={t("priceList.targetClientType")}
                value={targetClientType}
                onChange={(value) => setTargetClientType(value as ClientType)}
                options={availableClientTypes.map((type) => ({
                  value: type,
                  label: type,
                }))}
                placeholder={t("priceList.selectTargetClientType")}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="copy-with-history" />
                <label htmlFor="copy-with-history">
                  {t("priceList.copyWithHistory", "Include version history")}
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="copy-override" />
                <label htmlFor="copy-override">
                  {t("priceList.overrideExisting", "Override existing items")}
                </label>
              </div>
            </div>

            {copyResult && (
              <div
                className={`p-3 rounded-md ${copyResult.success ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}
              >
                <div className="flex items-center">
                  {copyResult.success ? (
                    <Check className="mr-2" size={16} />
                  ) : (
                    <AlertTriangle className="mr-2" size={16} />
                  )}
                  <span>{copyResult.message}</span>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCopyDialog(false);
                setTargetClientType("");
                setCopyResult(null);
              }}
            >
              {t("common.buttons.close")}
            </Button>
            <Button
              onClick={handleCopyToClientType}
              disabled={!targetClientType || copyInProgress}
              className="ml-2"
            >
              {copyInProgress
                ? t("common.status.processing")
                : t("priceList.copyItems")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Mass Update Dialog */}
      <Dialog
        open={massUpdateDialogOpen}
        onOpenChange={setMassUpdateDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("priceList.massUpdate")}</DialogTitle>
            <DialogDescription>
              {t(
                "priceList.massUpdateDescription",
                "Apply percentage change to multiple price items at once.",
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <NumberInput
              label={t("priceList.percentageChange")}
              value={massUpdatePercentage}
              onChange={(value) => setMassUpdatePercentage(value)}
              helpText={t(
                "priceList.percentageChangeHelp",
                "Use positive values for increase, negative for decrease",
              )}
            />

            <div className="space-y-2">
              <h4 className="font-medium">{t("priceList.applyTo")}</h4>

              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="apply-all"
                  name="apply-to"
                  checked={
                    massUpdateCategories.length === 0 &&
                    selectedItems.length === 0
                  }
                  onChange={() => setMassUpdateCategories([])}
                />
                <label htmlFor="apply-all">{t("priceList.allItems")}</label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="apply-selected"
                  name="apply-to"
                  checked={selectedItems.length > 0}
                  disabled={selectedItems.length === 0}
                />
                <label
                  htmlFor="apply-selected"
                  className={selectedItems.length === 0 ? "text-gray-400" : ""}
                >
                  {t("priceList.selectedItems", {
                    count: selectedItems.length,
                  })}
                </label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="apply-categories"
                  name="apply-to"
                  checked={massUpdateCategories.length > 0}
                  onChange={() => setMassUpdateCategories([categories[0]])}
                />
                <label htmlFor="apply-categories">
                  {t("priceList.byCategory")}
                </label>
              </div>

              {massUpdateCategories.length > 0 && (
                <div className="pl-6 pt-2">
                  <SelectField
                    label={t("common.labels.categories")}
                    value={massUpdateCategories}
                    onChange={(value) => {
                      // In a real implementation, this would handle multi-select
                      setMassUpdateCategories([value]);
                    }}
                    options={categories}
                    placeholder={t("priceList.selectCategories")}
                  />
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setMassUpdateDialogOpen(false)}
            >
              {t("common.buttons.cancel")}
            </Button>
            <Button
              onClick={() => {
                handleMassUpdate({
                  percentage: massUpdatePercentage,
                  categories: massUpdateCategories,
                  itemIds: selectedItems.length > 0 ? selectedItems : undefined,
                });
                setMassUpdateDialogOpen(false);
              }}
              className="ml-2"
            >
              {t("priceList.applyChanges")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Version Dialog */}
      <Dialog
        open={createVersionDialogOpen}
        onOpenChange={setCreateVersionDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("priceList.createVersion")}</DialogTitle>
            <DialogDescription>
              {t(
                "priceList.createVersionDescription",
                "Create a new version of the price list with effective dates.",
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <TextInput
              label={t("priceList.versionName")}
              value={newVersionName}
              onChange={setNewVersionName}
              placeholder={t(
                "priceList.versionNamePlaceholder",
                "e.g. Q1 2024",
              )}
              required
            />

            <TextInput
              label={t("priceList.versionDescription")}
              value={newVersionDescription}
              onChange={setNewVersionDescription}
              placeholder={t(
                "priceList.versionDescriptionPlaceholder",
                "e.g. First quarter price adjustments",
              )}
            />

            <TextInput
              label={t("priceList.effectiveDate")}
              type="date"
              value={format(newVersionEffectiveDate, "yyyy-MM-dd")}
              onChange={(value) => setNewVersionEffectiveDate(new Date(value))}
              required
            />

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="copy-from-current" checked />
                <label htmlFor="copy-from-current">
                  {t(
                    "priceList.copyFromCurrent",
                    "Copy items from current version",
                  )}
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="set-as-active" />
                <label htmlFor="set-as-active">
                  {t("priceList.setAsActive", "Set as active version")}
                </label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreateVersionDialogOpen(false)}
            >
              {t("common.buttons.cancel")}
            </Button>
            <Button
              onClick={() => {
                // In a real implementation, this would call the API to create a new version
                // For now, we'll just close the dialog and show a toast
                setCreateVersionDialogOpen(false);
                toast({
                  title: t("priceList.versionCreated"),
                  description: t("priceList.versionCreatedDescription", {
                    name: newVersionName,
                  }),
                });

                // Reset form
                setNewVersionName("");
                setNewVersionDescription("");
                setNewVersionEffectiveDate(new Date());
              }}
              disabled={!newVersionName}
              className="ml-2"
            >
              {t("priceList.createVersion")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Mass Update Dialog */}
      <Dialog
        open={massUpdateDialogOpen}
        onOpenChange={setMassUpdateDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("priceList.massUpdate")}</DialogTitle>
            <DialogDescription>
              {t("priceList.massUpdateDescription")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Percent className="mr-2" size={16} />
              <TextInput
                label={t("priceList.massUpdatePercentage")}
                value={massUpdatePercentage}
                onChange={(e) =>
                  setMassUpdatePercentage(Number(e.target.value))
                }
                placeholder={t("priceList.enterPercentage")}
              />
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">
                {t("priceList.massUpdateCategories")}
              </h4>
              <SelectField
                label=""
                value={massUpdateCategories.join(", ") || ""}
                onChange={(value) => {
                  const selectedCategories = value
                    .split(",")
                    .map((cat) => cat.trim())
                    .filter((cat) => cat.length > 0);
                  setMassUpdateCategories(selectedCategories);
                }}
                options={categories}
                placeholder={t("priceList.selectCategories")}
              />
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">{t("priceList.massUpdateItems")}</h4>
              <SelectField
                label=""
                value={selectedItems.join(", ") || ""}
                onChange={(value) => {
                  const selectedItems = value
                    .split(",")
                    .map((id) => id.trim())
                    .filter((id) => id.length > 0);
                  setSelectedItems(selectedItems);
                }}
                options={priceItems.map((item) => ({
                  value: item.id,
                  label: item.name,
                }))}
                placeholder={t("priceList.selectItems")}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setMassUpdateDialogOpen(false)}
            >
              {t("common.buttons.cancel")}
            </Button>
            <Button
              onClick={() => {
                handleMassUpdate({
                  percentage: massUpdatePercentage,
                  categories: massUpdateCategories,
                  itemIds: selectedItems,
                });
                setMassUpdateDialogOpen(false);
              }}
              className="ml-2"
            >
              {t("common.buttons.apply")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export { ClientPriceListManager };
export default ClientPriceListManager;
