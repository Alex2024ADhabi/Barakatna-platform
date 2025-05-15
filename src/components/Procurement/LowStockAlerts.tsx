import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  AlertTriangle,
  ArrowUpRight,
  Loader2,
  Search,
  ShoppingCart,
} from "lucide-react";
import { Input } from "../ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { InventoryItem } from "@/lib/api/procurement/types";
import { procurementApi } from "@/lib/api/procurement/procurementApi";
import { useToast } from "../ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { Label } from "../ui/label";

const LowStockAlerts: React.FC = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [showCreatePRDialog, setShowCreatePRDialog] = useState(false);
  const [selectedItems, setSelectedItems] = useState<InventoryItem[]>([]);
  const [prForm, setPrForm] = useState({
    title: "",
    description: "",
    notes: "",
  });

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const response = await procurementApi.getInventoryItems({
        page: 1,
        pageSize: 50,
        sortBy: "name",
        sortDirection: "asc",
      });

      if (response.success && response.data) {
        setInventory(response.data.items as InventoryItem[]);
      } else {
        // Mock data for development
        const mockInventory: InventoryItem[] = generateMockInventory();
        setInventory(mockInventory);
      }
    } catch (error) {
      console.error("Error fetching inventory:", error);
      toast({
        title: "Error",
        description: "Failed to load inventory items",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateMockInventory = (): InventoryItem[] => {
    const statuses: ("available" | "low" | "out_of_stock" | "expired")[] = [
      "available",
      "low",
      "out_of_stock",
      "expired",
    ];

    const items: InventoryItem[] = [];

    // Generate 30 random inventory items
    for (let i = 0; i < 30; i++) {
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const quantity =
        status === "available"
          ? Math.floor(Math.random() * 100) + 20
          : status === "low"
            ? Math.floor(Math.random() * 10) + 1
            : status === "out_of_stock"
              ? 0
              : Math.floor(Math.random() * 5);

      const minimumStockLevel = Math.floor(Math.random() * 10) + 5;
      const reorderPoint =
        minimumStockLevel + Math.floor(Math.random() * 5) + 5;

      items.push({
        id: `item-${i}`,
        itemCode: `ITM-${1000 + i}`,
        name: `Item ${i + 1}`,
        description: `Description for item ${i + 1}`,
        categoryId: `cat-${Math.floor(Math.random() * 5) + 1}`,
        quantity,
        unit: Math.random() > 0.5 ? "each" : "box",
        unitCost: Math.floor(Math.random() * 1000) + 10,
        totalValue: (Math.floor(Math.random() * 1000) + 10) * quantity,
        location: `Warehouse ${String.fromCharCode(65 + Math.floor(Math.random() * 5))}, Section ${Math.floor(Math.random() * 10) + 1}`,
        minimumStockLevel,
        reorderPoint,
        lastRestockDate: new Date(
          Date.now() - Math.floor(Math.random() * 90) * 24 * 60 * 60 * 1000,
        ),
        expiryDate:
          Math.random() > 0.7
            ? new Date(
                Date.now() +
                  Math.floor(Math.random() * 365) * 24 * 60 * 60 * 1000,
              )
            : undefined,
        status,
        notes:
          Math.random() > 0.7 ? `Sample note for item ${i + 1}` : undefined,
        isEquipment: Math.random() > 0.8,
        createdAt: new Date(
          Date.now() - Math.floor(Math.random() * 365) * 24 * 60 * 60 * 1000,
        ),
        updatedAt: new Date(
          Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000,
        ),
      });
    }

    return items;
  };

  const handleCreatePurchaseRequest = (items: InventoryItem[]) => {
    setSelectedItems(items);
    setPrForm({
      title: `Restock Request - ${new Date().toLocaleDateString()}`,
      description: `Automatic restock request for ${items.length} low stock items`,
      notes: "",
    });
    setShowCreatePRDialog(true);
  };

  const submitPurchaseRequest = () => {
    // In a real app, this would call an API
    toast({
      title: "Purchase Request Created",
      description: `Created purchase request for ${selectedItems.length} items`,
    });

    setShowCreatePRDialog(false);
    setPrForm({
      title: "",
      description: "",
      notes: "",
    });
    setSelectedItems([]);
  };

  const getStatusBadgeVariant = (
    status: string,
  ): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "available":
        return "default";
      case "low":
        return "secondary";
      case "out_of_stock":
        return "destructive";
      case "expired":
        return "outline";
      default:
        return "outline";
    }
  };

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case "available":
        return t("procurement.available", "Available");
      case "low":
        return t("procurement.lowStock", "Low Stock");
      case "out_of_stock":
        return t("procurement.outOfStock", "Out of Stock");
      case "expired":
        return t("procurement.expired", "Expired");
      default:
        return status;
    }
  };

  const filteredInventory = inventory.filter((item) => {
    const matchesSearch = searchTerm
      ? item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.itemCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
      : true;

    const matchesStatus = statusFilter ? item.status === statusFilter : true;

    return matchesSearch && matchesStatus;
  });

  // Get items that need reordering
  const lowStockItems = inventory.filter(
    (item) =>
      item.quantity <= item.minimumStockLevel && item.status !== "expired",
  );

  // Get items that are out of stock
  const outOfStockItems = inventory.filter((item) => item.quantity === 0);

  // Get items that are expired
  const expiredItems = inventory.filter(
    (item) =>
      item.status === "expired" ||
      (item.expiryDate && new Date(item.expiryDate) < new Date()),
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {t("procurement.lowStockItems", "Low Stock Items")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lowStockItems.length}</div>
            <p className="text-xs text-muted-foreground">
              {t(
                "procurement.itemsBelowMinimum",
                "Items below minimum stock level",
              )}
            </p>
            {lowStockItems.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => handleCreatePurchaseRequest(lowStockItems)}
              >
                <ShoppingCart className="h-4 w-4 mr-2" />
                {t(
                  "procurement.createPurchaseRequest",
                  "Create Purchase Request",
                )}
              </Button>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {t("procurement.outOfStockItems", "Out of Stock Items")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{outOfStockItems.length}</div>
            <p className="text-xs text-muted-foreground">
              {t(
                "procurement.itemsWithZeroQuantity",
                "Items with zero quantity",
              )}
            </p>
            {outOfStockItems.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => handleCreatePurchaseRequest(outOfStockItems)}
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                {t("procurement.urgentReorder", "Urgent Reorder")}
              </Button>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {t("procurement.expiredItems", "Expired Items")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{expiredItems.length}</div>
            <p className="text-xs text-muted-foreground">
              {t("procurement.itemsPastExpiryDate", "Items past expiry date")}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t(
              "procurement.searchInventory",
              "Search inventory...",
            )}
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue
                placeholder={t(
                  "procurement.filterByStatus",
                  "Filter by status",
                )}
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">
                {t("procurement.allStatuses", "All Statuses")}
              </SelectItem>
              <SelectItem value="available">
                {t("procurement.available", "Available")}
              </SelectItem>
              <SelectItem value="low">
                {t("procurement.lowStock", "Low Stock")}
              </SelectItem>
              <SelectItem value="out_of_stock">
                {t("procurement.outOfStock", "Out of Stock")}
              </SelectItem>
              <SelectItem value="expired">
                {t("procurement.expired", "Expired")}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">
          {t("procurement.inventoryAlerts", "Inventory Alerts")}
        </h2>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">{t("common.loading", "Loading...")}</span>
        </div>
      ) : filteredInventory.length === 0 ? (
        <div className="text-center p-6 border rounded-md">
          <p className="text-muted-foreground">
            {t("procurement.noItemsFound", "No items found")}
          </p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("procurement.itemCode", "Item Code")}</TableHead>
                <TableHead>{t("procurement.name", "Name")}</TableHead>
                <TableHead>{t("procurement.quantity", "Quantity")}</TableHead>
                <TableHead>
                  {t("procurement.minimumLevel", "Minimum Level")}
                </TableHead>
                <TableHead>
                  {t("procurement.reorderPoint", "Reorder Point")}
                </TableHead>
                <TableHead>{t("procurement.status", "Status")}</TableHead>
                <TableHead className="text-right">
                  {t("common.actions", "Actions")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInventory.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.itemCode}</TableCell>
                  <TableCell className="font-medium">
                    <div>{item.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {item.description}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div
                      className={
                        item.quantity <= item.minimumStockLevel
                          ? "text-red-500 font-bold"
                          : ""
                      }
                    >
                      {item.quantity} {item.unit}
                    </div>
                  </TableCell>
                  <TableCell>
                    {item.minimumStockLevel} {item.unit}
                  </TableCell>
                  <TableCell>
                    {item.reorderPoint} {item.unit}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(item.status)}>
                      {getStatusLabel(item.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCreatePurchaseRequest([item])}
                    >
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      {t("procurement.reorder", "Reorder")}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Create Purchase Request Dialog */}
      <Dialog open={showCreatePRDialog} onOpenChange={setShowCreatePRDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t(
                "procurement.createPurchaseRequest",
                "Create Purchase Request",
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">
                {t("procurement.requestTitle", "Request Title")}
              </Label>
              <Input
                id="title"
                value={prForm.title}
                onChange={(e) =>
                  setPrForm({ ...prForm, title: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">
                {t("procurement.description", "Description")}
              </Label>
              <Input
                id="description"
                value={prForm.description}
                onChange={(e) =>
                  setPrForm({ ...prForm, description: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">{t("common.notes", "Notes")}</Label>
              <Input
                id="notes"
                value={prForm.notes}
                onChange={(e) =>
                  setPrForm({ ...prForm, notes: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label>{t("procurement.selectedItems", "Selected Items")}</Label>
              <div className="max-h-40 overflow-y-auto border rounded-md p-2">
                <ul className="space-y-1">
                  {selectedItems.map((item) => (
                    <li key={item.id} className="text-sm">
                      <span className="font-medium">{item.itemCode}</span> -{" "}
                      {item.name} ({item.quantity}/{item.minimumStockLevel})
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCreatePRDialog(false)}
            >
              {t("common.cancel", "Cancel")}
            </Button>
            <Button onClick={submitPurchaseRequest}>
              {t("procurement.submit", "Submit")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LowStockAlerts;
