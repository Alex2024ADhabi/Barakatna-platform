import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Search,
  Download,
  Upload,
  History,
  Filter,
  FileText,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { priceListApi } from "@/lib/api/priceList/priceListApi";
import { PriceItem, PriceItemVersion } from "@/lib/api/priceList/types";
import { useToast } from "../ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Badge } from "../ui/badge";
import { Pagination } from "../ui/pagination-simple";

interface PriceListEditorProps {
  initialItems?: PriceItem[];
  onSave?: (items: PriceItem[]) => void;
  readOnly?: boolean;
}

const PriceListEditor = ({
  initialItems,
  onSave,
  readOnly = false,
}: PriceListEditorProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();

  // State variables
  const [items, setItems] = useState<PriceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<PriceItem | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [selectedItemHistory, setSelectedItemHistory] = useState<
    PriceItemVersion[]
  >([]);
  const [selectedItemForHistory, setSelectedItemForHistory] =
    useState<PriceItem | null>(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredItems, setFilteredItems] = useState<PriceItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importLoading, setImportLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [newItem, setNewItem] = useState<Partial<PriceItem>>({
    category: "",
    name: "",
    description: "",
    unit: "Each",
    price: 0,
    currency: "AED",
  });

  // Load initial data
  useEffect(() => {
    if (initialItems) {
      setItems(initialItems);
      setFilteredItems(initialItems);
      setLoading(false);
      // Extract unique categories from initial items
      const uniqueCategories = [
        ...new Set(initialItems.map((item) => item.category)),
      ];
      setCategories(uniqueCategories);
    } else {
      fetchPriceItems();
      fetchCategories();
    }
  }, [initialItems]);

  // Filter items when search term or category changes
  useEffect(() => {
    if (searchTerm || selectedCategory) {
      const filtered = items.filter((item) => {
        const matchesSearch = searchTerm
          ? item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.id.toLowerCase().includes(searchTerm.toLowerCase())
          : true;

        const matchesCategory = selectedCategory
          ? item.category === selectedCategory
          : true;

        return matchesSearch && matchesCategory;
      });

      setFilteredItems(filtered);
    } else {
      setFilteredItems(items);
    }
  }, [searchTerm, selectedCategory, items]);

  // Fetch price list items from API
  const fetchPriceItems = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await priceListApi.getPriceItems({
        page,
        pageSize,
        searchTerm,
        category: selectedCategory || undefined,
      });

      if (response.success && response.data) {
        setItems(response.data.items);
        setFilteredItems(response.data.items);
        setTotalItems(response.data.totalCount);
        setTotalPages(response.data.totalPages);
      } else {
        setError(response.error || "Failed to fetch price list items");
        // Use mock data if API fails
        setItems(getMockItems());
        setFilteredItems(getMockItems());
      }
    } catch (err) {
      setError("An unexpected error occurred");
      // Use mock data if API fails
      setItems(getMockItems());
      setFilteredItems(getMockItems());
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories from API
  const fetchCategories = async () => {
    try {
      const response = await priceListApi.getCategories();

      if (response.success && response.data) {
        setCategories(response.data);
      } else {
        // Use mock categories if API fails
        const mockCategories = [
          "Bathroom",
          "Kitchen",
          "Mobility",
          "Lighting",
          "Other",
        ];
        setCategories(mockCategories);
      }
    } catch (err) {
      // Use mock categories if API fails
      const mockCategories = [
        "Bathroom",
        "Kitchen",
        "Mobility",
        "Lighting",
        "Other",
      ];
      setCategories(mockCategories);
    }
  };

  // Fetch version history for a price item
  const fetchItemHistory = async (item: PriceItem) => {
    setHistoryLoading(true);
    setSelectedItemForHistory(item);

    try {
      const response = await priceListApi.getPriceItemVersionHistory(item.id);

      if (response.success && response.data) {
        setSelectedItemHistory(response.data);
      } else {
        setSelectedItemHistory([]);
        toast({
          title: "Error",
          description: response.error || "Failed to fetch version history",
          variant: "destructive",
        });
      }
    } catch (err) {
      setSelectedItemHistory([]);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setHistoryLoading(false);
      setIsHistoryDialogOpen(true);
    }
  };

  // Handle editing an item
  const handleEditItem = (item: PriceItem) => {
    setEditingItem(item);
  };

  // Handle saving an edit
  const handleSaveEdit = async (
    id: string,
    field: keyof PriceItem,
    value: string | number,
  ) => {
    // Update local state first for immediate feedback
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    );

    // If not connected to API, just update local state
    if (initialItems) {
      return;
    }

    // Otherwise, update via API
    try {
      const itemToUpdate = items.find((item) => item.id === id);
      if (!itemToUpdate) return;

      const updateData = { [field]: value };
      const response = await priceListApi.updatePriceItem(id, updateData);

      if (!response.success) {
        toast({
          title: "Error",
          description: response.error || "Failed to update item",
          variant: "destructive",
        });
        // Revert changes if API call fails
        fetchPriceItems();
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      // Revert changes if API call fails
      fetchPriceItems();
    }
  };

  // Handle finishing an edit
  const handleFinishEdit = () => {
    setEditingItem(null);
    if (onSave) {
      onSave(items);
    }
  };

  // Handle deleting an item
  const handleDeleteItem = async (id: string) => {
    // Update local state first for immediate feedback
    setItems(items.filter((item) => item.id !== id));

    // If not connected to API, just update local state
    if (initialItems && onSave) {
      onSave(items.filter((item) => item.id !== id));
      return;
    }

    // Otherwise, delete via API
    try {
      const response = await priceListApi.deletePriceItem(id);

      if (!response.success) {
        toast({
          title: "Error",
          description: response.error || "Failed to delete item",
          variant: "destructive",
        });
        // Revert changes if API call fails
        fetchPriceItems();
      } else {
        toast({
          title: "Success",
          description: "Item deleted successfully",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      // Revert changes if API call fails
      fetchPriceItems();
    }
  };

  // Handle adding a new item
  const handleAddItem = async () => {
    // Generate a temporary ID for local state
    const tempId = `temp-${Date.now()}`;
    const itemToAdd = { ...newItem, id: tempId } as PriceItem;

    // Update local state first for immediate feedback
    setItems([...items, itemToAdd]);
    setIsAddDialogOpen(false);

    // Reset new item form
    setNewItem({
      category: categories[0] || "Bathroom",
      name: "",
      description: "",
      unit: "Each",
      price: 0,
      currency: "AED",
    });

    // If not connected to API, just update local state
    if (initialItems && onSave) {
      onSave([...items, itemToAdd]);
      return;
    }

    // Otherwise, add via API
    try {
      const response = await priceListApi.createPriceItem(newItem as any);

      if (!response.success) {
        toast({
          title: "Error",
          description: response.error || "Failed to add item",
          variant: "destructive",
        });
        // Revert changes if API call fails
        fetchPriceItems();
      } else {
        toast({
          title: "Success",
          description: "Item added successfully",
        });
        // Refresh to get the real ID from the server
        fetchPriceItems();
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
      // Revert changes if API call fails
      fetchPriceItems();
    }
  };

  // Handle importing price list items
  const handleImport = async () => {
    if (!importFile) {
      toast({
        title: "Error",
        description: "Please select a file to import",
        variant: "destructive",
      });
      return;
    }

    setImportLoading(true);

    try {
      const response = await priceListApi.bulkImport(importFile);

      if (response.success && response.data) {
        toast({
          title: "Import Successful",
          description: `Processed ${response.data.totalProcessed} items: ${response.data.successCount} succeeded, ${response.data.failedCount} failed`,
        });
        // Refresh the price list
        fetchPriceItems();
        setIsImportDialogOpen(false);
        setImportFile(null);
      } else {
        toast({
          title: "Import Failed",
          description: response.error || "Failed to import price list items",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "An unexpected error occurred during import",
        variant: "destructive",
      });
    } finally {
      setImportLoading(false);
    }
  };

  // Handle exporting price list items
  const handleExport = async (format: "csv" | "excel" | "pdf") => {
    setExportLoading(true);

    try {
      const response = await priceListApi.exportPriceList({
        format,
        filters: {
          category: selectedCategory || undefined,
          searchTerm: searchTerm || undefined,
        },
      });

      if (response.success && response.data) {
        // Create a download link for the blob
        const url = window.URL.createObjectURL(response.data);
        const a = document.createElement("a");
        a.href = url;
        a.download = `price-list-${new Date().toISOString().split("T")[0]}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        toast({
          title: "Export Successful",
          description: `Price list exported as ${format.toUpperCase()}`,
        });
      } else {
        toast({
          title: "Export Failed",
          description: response.error || "Failed to export price list",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "An unexpected error occurred during export",
        variant: "destructive",
      });
    } finally {
      setExportLoading(false);
    }
  };

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    fetchPriceItems();
  };

  // Get mock items for fallback
  const getMockItems = (): PriceItem[] => [
    {
      id: "P001",
      category: "Bathroom",
      name: "Grab Bar Installation",
      description: "Standard stainless steel grab bar",
      unit: "Each",
      price: 150,
      currency: "AED",
      version: 1,
    },
    {
      id: "P002",
      category: "Bathroom",
      name: "Non-Slip Flooring",
      description: "Per square meter of non-slip tile installation",
      unit: "m²",
      price: 200,
      currency: "AED",
      version: 2,
    },
    {
      id: "P003",
      category: "Bathroom",
      name: "Raised Toilet Seat",
      description: "Elevated toilet seat with handles",
      unit: "Each",
      price: 300,
      currency: "AED",
      version: 1,
    },
    {
      id: "P004",
      category: "Kitchen",
      name: "Lowered Countertop",
      description: "Modification of existing countertop",
      unit: "Linear meter",
      price: 500,
      currency: "AED",
      version: 3,
    },
    {
      id: "P005",
      category: "Kitchen",
      name: "Pull-out Shelving",
      description: "Installation of pull-out shelves in cabinets",
      unit: "Each",
      price: 350,
      currency: "AED",
      version: 1,
    },
    {
      id: "P006",
      category: "Mobility",
      name: "Ramp Installation",
      description: "Wooden ramp with handrails",
      unit: "Linear meter",
      price: 600,
      currency: "AED",
      version: 2,
    },
    {
      id: "P007",
      category: "Mobility",
      name: "Stair Lift",
      description: "Single floor straight stair lift",
      unit: "Each",
      price: 12000,
      currency: "AED",
      version: 1,
    },
    {
      id: "P008",
      category: "Lighting",
      name: "Motion Sensor Lights",
      description: "Installation of motion activated lighting",
      unit: "Each",
      price: 250,
      currency: "AED",
      version: 1,
    },
  ];

  return (
    <Card className="w-full bg-white">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{t("priceList.title", "Price List Management")}</CardTitle>
          <CardDescription>
            {t(
              "priceList.description",
              "Manage modification items and their prices",
            )}
          </CardDescription>
        </div>
        <div className="flex gap-2">
          {!readOnly && (
            <>
              {/* Export Button */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" disabled={exportLoading}>
                    {exportLoading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="mr-2 h-4 w-4" />
                    )}
                    {t("priceList.export", "Export")}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {t("priceList.exportTitle", "Export Price List")}
                    </DialogTitle>
                    <DialogDescription>
                      {t(
                        "priceList.exportDescription",
                        "Choose a format to export the price list",
                      )}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex flex-col gap-4 py-4">
                    <Button onClick={() => handleExport("csv")}>
                      <FileText className="mr-2 h-4 w-4" />
                      {t("priceList.exportCSV", "Export as CSV")}
                    </Button>
                    <Button onClick={() => handleExport("excel")}>
                      <FileText className="mr-2 h-4 w-4" />
                      {t("priceList.exportExcel", "Export as Excel")}
                    </Button>
                    <Button onClick={() => handleExport("pdf")}>
                      <FileText className="mr-2 h-4 w-4" />
                      {t("priceList.exportPDF", "Export as PDF")}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              {/* Import Button */}
              <Dialog
                open={isImportDialogOpen}
                onOpenChange={setIsImportDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Upload className="mr-2 h-4 w-4" />
                    {t("priceList.import", "Import")}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {t("priceList.importTitle", "Import Price List")}
                    </DialogTitle>
                    <DialogDescription>
                      {t(
                        "priceList.importDescription",
                        "Upload a CSV or Excel file with price list items",
                      )}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label htmlFor="file" className="text-right">
                        {t("priceList.file", "File")}
                      </label>
                      <Input
                        id="file"
                        type="file"
                        accept=".csv,.xlsx,.xls"
                        className="col-span-3"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            setImportFile(e.target.files[0]);
                          }
                        }}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsImportDialogOpen(false)}
                    >
                      {t("common.buttons.cancel", "Cancel")}
                    </Button>
                    <Button onClick={handleImport} disabled={importLoading}>
                      {importLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="mr-2 h-4 w-4" />
                      )}
                      {t("priceList.importButton", "Import")}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              {/* Add Item Button */}
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    {t("priceList.addItem", "Add Item")}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {t("priceList.addItemTitle", "Add New Price Item")}
                    </DialogTitle>
                    <DialogDescription>
                      {t(
                        "priceList.addItemDescription",
                        "Enter the details for the new price list item",
                      )}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label htmlFor="category" className="text-right">
                        {t("common.labels.category", "Category")}
                      </label>
                      <Select
                        value={newItem.category}
                        onValueChange={(value) =>
                          setNewItem({ ...newItem, category: value })
                        }
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue
                            placeholder={t(
                              "priceList.selectCategory",
                              "Select category",
                            )}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                          <SelectItem value="Other">
                            {t("common.other", "Other")}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label htmlFor="name" className="text-right">
                        {t("common.labels.name", "Name")}
                      </label>
                      <Input
                        id="name"
                        value={newItem.name}
                        onChange={(e) =>
                          setNewItem({ ...newItem, name: e.target.value })
                        }
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label htmlFor="description" className="text-right">
                        {t("common.labels.description", "Description")}
                      </label>
                      <Input
                        id="description"
                        value={newItem.description}
                        onChange={(e) =>
                          setNewItem({
                            ...newItem,
                            description: e.target.value,
                          })
                        }
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label htmlFor="unit" className="text-right">
                        {t("common.labels.unit", "Unit")}
                      </label>
                      <Input
                        id="unit"
                        value={newItem.unit}
                        onChange={(e) =>
                          setNewItem({ ...newItem, unit: e.target.value })
                        }
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label htmlFor="price" className="text-right">
                        {t("common.labels.price", "Price")}
                      </label>
                      <Input
                        id="price"
                        type="number"
                        value={newItem.price?.toString() || "0"}
                        onChange={(e) =>
                          setNewItem({
                            ...newItem,
                            price: parseFloat(e.target.value),
                          })
                        }
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label htmlFor="currency" className="text-right">
                        {t("common.labels.currency", "Currency")}
                      </label>
                      <Select
                        value={newItem.currency}
                        onValueChange={(value) =>
                          setNewItem({ ...newItem, currency: value })
                        }
                      >
                        <SelectTrigger className="col-span-3">
                          <SelectValue
                            placeholder={t(
                              "priceList.selectCurrency",
                              "Select currency",
                            )}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="AED">AED</SelectItem>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsAddDialogOpen(false)}
                    >
                      {t("common.buttons.cancel", "Cancel")}
                    </Button>
                    <Button onClick={handleAddItem}>
                      {t("priceList.addItemButton", "Add Item")}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder={t(
                "priceList.searchItems",
                "Search items by name, description, or ID",
              )}
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Select
              value={selectedCategory}
              onValueChange={setSelectedCategory}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue
                  placeholder={t("priceList.allCategories", "All Categories")}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">
                  {t("priceList.allCategories", "All Categories")}
                </SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("");
              }}
            >
              {t("common.buttons.reset", "Reset")}
            </Button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 mb-6 flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">{t("common.loading", "Loading...")}</span>
          </div>
        ) : (
          <>
            {/* Price List Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("common.labels.id", "ID")}</TableHead>
                    <TableHead>
                      {t("common.labels.category", "Category")}
                    </TableHead>
                    <TableHead>{t("common.labels.name", "Name")}</TableHead>
                    <TableHead>
                      {t("common.labels.description", "Description")}
                    </TableHead>
                    <TableHead>{t("common.labels.unit", "Unit")}</TableHead>
                    <TableHead>{t("common.labels.price", "Price")}</TableHead>
                    {!readOnly && (
                      <TableHead className="text-right">
                        {t("common.labels.actions", "Actions")}
                      </TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.length > 0 ? (
                    filteredItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="flex items-center">
                            {item.id}
                            {item.version && item.version > 1 && (
                              <Badge variant="outline" className="ml-2">
                                v{item.version}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {editingItem?.id === item.id ? (
                            <Select
                              value={item.category}
                              onValueChange={(value) =>
                                handleSaveEdit(item.id, "category", value)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {categories.map((category) => (
                                  <SelectItem key={category} value={category}>
                                    {category}
                                  </SelectItem>
                                ))}
                                <SelectItem value="Other">
                                  {t("common.other", "Other")}
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            item.category
                          )}
                        </TableCell>
                        <TableCell>
                          {editingItem?.id === item.id ? (
                            <Input
                              value={item.name}
                              onChange={(e) =>
                                handleSaveEdit(item.id, "name", e.target.value)
                              }
                            />
                          ) : (
                            item.name
                          )}
                        </TableCell>
                        <TableCell>
                          {editingItem?.id === item.id ? (
                            <Input
                              value={item.description}
                              onChange={(e) =>
                                handleSaveEdit(
                                  item.id,
                                  "description",
                                  e.target.value,
                                )
                              }
                            />
                          ) : (
                            item.description
                          )}
                        </TableCell>
                        <TableCell>
                          {editingItem?.id === item.id ? (
                            <Input
                              value={item.unit}
                              onChange={(e) =>
                                handleSaveEdit(item.id, "unit", e.target.value)
                              }
                            />
                          ) : (
                            item.unit
                          )}
                        </TableCell>
                        <TableCell>
                          {editingItem?.id === item.id ? (
                            <Input
                              type="number"
                              value={item.price}
                              onChange={(e) =>
                                handleSaveEdit(
                                  item.id,
                                  "price",
                                  parseFloat(e.target.value),
                                )
                              }
                            />
                          ) : (
                            `${item.price} ${item.currency}`
                          )}
                        </TableCell>
                        {!readOnly && (
                          <TableCell className="text-right">
                            {editingItem?.id === item.id ? (
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={handleFinishEdit}
                                >
                                  <Save className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setEditingItem(null)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ) : (
                              <div className="flex justify-end gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => fetchItemHistory(item)}
                                  title={t(
                                    "priceList.viewHistory",
                                    "View History",
                                  )}
                                >
                                  <History className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEditItem(item)}
                                  title={t("common.buttons.edit", "Edit")}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteItem(item.id)}
                                  title={t("common.buttons.delete", "Delete")}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        )}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={readOnly ? 6 : 7}
                        className="h-24 text-center"
                      >
                        {t("common.noData", "No items found")}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {!initialItems && totalPages > 1 && (
              <div className="flex justify-center mt-4">
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        )}

        {/* Version History Dialog */}
        <Dialog
          open={isHistoryDialogOpen}
          onOpenChange={setIsHistoryDialogOpen}
        >
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>
                {t("priceList.versionHistory", "Version History")}:{" "}
                {selectedItemForHistory?.name}
              </DialogTitle>
              <DialogDescription>
                {t(
                  "priceList.versionHistoryDescription",
                  "Track changes to this price list item over time",
                )}
              </DialogDescription>
            </DialogHeader>
            {historyLoading ? (
              <div className="flex justify-center items-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">
                  {t("common.loading", "Loading...")}
                </span>
              </div>
            ) : selectedItemHistory.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        {t("common.labels.version", "Version")}
                      </TableHead>
                      <TableHead>{t("common.labels.price", "Price")}</TableHead>
                      <TableHead>
                        {t("common.labels.updatedBy", "Updated By")}
                      </TableHead>
                      <TableHead>
                        {t("common.labels.updatedAt", "Updated At")}
                      </TableHead>
                      <TableHead>
                        {t("common.labels.reason", "Reason")}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedItemHistory.map((version) => (
                      <TableRow key={version.version}>
                        <TableCell>{version.version}</TableCell>
                        <TableCell>{`${version.price} ${version.currency}`}</TableCell>
                        <TableCell>{version.updatedBy}</TableCell>
                        <TableCell>
                          {new Date(version.updatedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{version.changeReason || "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                {t(
                  "priceList.noVersionHistory",
                  "No version history available for this item",
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default PriceListEditor;
