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
import { format } from "date-fns";
import { Edit, History, Loader2, Search, AlertTriangle } from "lucide-react";
import { InventoryItem } from "@/lib/api/procurement/types";
import { procurementApi } from "@/lib/api/procurement/procurementApi";
import { useToast } from "../ui/use-toast";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

const InventoryManagement: React.FC = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [showEquipment, setShowEquipment] = useState<boolean>(false);

  useEffect(() => {
    fetchInventoryItems();
  }, [showEquipment]);

  const fetchInventoryItems = async () => {
    setLoading(true);
    try {
      const response = await procurementApi.getInventoryItems({
        page: 1,
        pageSize: 50,
        sortBy: "name",
        sortDirection: "asc",
        isEquipment: showEquipment,
      });

      if (response.success && response.data) {
        setInventoryItems(response.data.items);
      } else {
        // Mock data for development
        const mockInventoryItems: InventoryItem[] = [
          {
            id: "inv-001",
            itemCode: "GB-24SS",
            name: "Grab Bar, 24 inch, Stainless Steel",
            description: "Stainless steel grab bar for bathroom safety",
            categoryId: "cat-001",
            quantity: 15,
            unit: "each",
            unitCost: 120,
            totalValue: 1800,
            location: "Warehouse A, Shelf B3",
            minimumStockLevel: 5,
            reorderPoint: 10,
            lastRestockDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
            status: "available",
            createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
          },
          {
            id: "inv-002",
            itemCode: "NSM-3X5",
            name: "Non-slip Floor Mat, 3x5 feet",
            description: "Rubber non-slip floor mat for bathroom safety",
            categoryId: "cat-001",
            quantity: 8,
            unit: "each",
            unitCost: 80,
            totalValue: 640,
            location: "Warehouse A, Shelf C2",
            minimumStockLevel: 3,
            reorderPoint: 5,
            lastRestockDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
            status: "available",
            createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
            updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
          },
          {
            id: "inv-003",
            itemCode: "AC-6FT",
            name: "Adjustable Counter, 6 feet",
            description: "Height-adjustable kitchen counter",
            categoryId: "cat-002",
            quantity: 2,
            unit: "each",
            unitCost: 2500,
            totalValue: 5000,
            location: "Warehouse B, Section D",
            minimumStockLevel: 1,
            reorderPoint: 2,
            lastRestockDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
            status: "low",
            createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
            updatedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
          },
          {
            id: "inv-004",
            itemCode: "PS-STD",
            name: "Pull-out Shelves",
            description: "Pull-out cabinet shelves for kitchen accessibility",
            categoryId: "cat-002",
            quantity: 0,
            unit: "each",
            unitCost: 350,
            totalValue: 0,
            location: "Warehouse B, Section C",
            minimumStockLevel: 4,
            reorderPoint: 6,
            lastRestockDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            status: "out_of_stock",
            createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
            updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          },
          {
            id: "inv-005",
            itemCode: "MPL-STD",
            name: "Mobile Patient Lift",
            description: "Mobile floor-based patient lift system",
            categoryId: "cat-003",
            quantity: 3,
            unit: "each",
            unitCost: 4500,
            totalValue: 13500,
            location: "Warehouse C, Section A",
            minimumStockLevel: 1,
            reorderPoint: 2,
            lastRestockDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
            status: "available",
            createdAt: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000),
            updatedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
          },
        ];
        setInventoryItems(mockInventoryItems);
      }
    } catch (error) {
      console.error("Error fetching inventory items:", error);
      toast({
        title: "Error",
        description: "Failed to load inventory items",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: InventoryItem) => {
    // Logic to edit inventory item
    toast({
      title: "Edit Inventory Item",
      description: `Editing inventory item ${item.name}`,
    });
  };

  const handleViewTransactions = (item: InventoryItem) => {
    // Logic to view inventory transactions
    toast({
      title: "View Transactions",
      description: `Viewing transactions for inventory item ${item.name}`,
    });
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

  // Get unique categories for filter
  const categories = Array.from(
    new Set(inventoryItems.map((item) => item.categoryId)),
  );

  const filteredInventoryItems = inventoryItems.filter((item) => {
    const matchesSearch = searchTerm
      ? item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.itemCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase())
      : true;

    const matchesCategory = categoryFilter
      ? item.categoryId === categoryFilter
      : true;

    const matchesStatus = statusFilter ? item.status === statusFilter : true;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-4">
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
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="showEquipment"
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              checked={showEquipment}
              onChange={(e) => setShowEquipment(e.target.checked)}
            />
            <label htmlFor="showEquipment" className="text-sm font-medium">
              {t("procurement.showEquipment", "Show Equipment Only")}
            </label>
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue
                placeholder={t(
                  "procurement.filterByCategory",
                  "Filter by category",
                )}
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">
                {t("procurement.allCategories", "All Categories")}
              </SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

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

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">{t("common.loading", "Loading...")}</span>
        </div>
      ) : filteredInventoryItems.length === 0 ? (
        <div className="text-center p-6 border rounded-md">
          <p className="text-muted-foreground">
            {t("procurement.noInventoryItems", "No inventory items found")}
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
                <TableHead>{t("procurement.value", "Value")}</TableHead>
                <TableHead>{t("procurement.location", "Location")}</TableHead>
                <TableHead>{t("procurement.status", "Status")}</TableHead>
                <TableHead className="text-right">
                  {t("common.actions", "Actions")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInventoryItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.itemCode}</TableCell>
                  <TableCell className="font-medium">
                    <div>{item.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {item.description}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      {item.quantity} {item.unit}
                      {item.quantity <= item.reorderPoint && (
                        <AlertTriangle className="h-4 w-4 ml-2 text-amber-500" />
                      )}
                    </div>
                    {item.lastRestockDate && (
                      <div className="text-xs text-muted-foreground">
                        {t("procurement.lastRestock", "Last restock")}:{" "}
                        {format(new Date(item.lastRestockDate), "MMM d, yyyy")}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {item.totalValue.toFixed(2)} AED
                    <div className="text-xs text-muted-foreground">
                      @ {item.unitCost.toFixed(2)} AED / {item.unit}
                    </div>
                  </TableCell>
                  <TableCell>{item.location}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(item.status)}>
                      {getStatusLabel(item.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(item)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewTransactions(item)}
                      >
                        <History className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default InventoryManagement;
