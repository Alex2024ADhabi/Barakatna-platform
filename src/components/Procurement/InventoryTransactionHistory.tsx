import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { format } from "date-fns";
import {
  InventoryTransaction,
  InventoryItem,
} from "../../lib/api/procurement/types";
import { procurementApi } from "../../lib/api/procurement/procurementApi";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Pagination } from "../ui/pagination";
import { AlertCircle, Filter, RefreshCw, Search } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { Separator } from "../ui/separator";
import { Label } from "../ui/label";

interface InventoryTransactionHistoryProps {
  inventoryItemId?: string;
  showItemDetails?: boolean;
  limit?: number;
  className?: string;
}

const InventoryTransactionHistory: React.FC<
  InventoryTransactionHistoryProps
> = ({ inventoryItemId, showItemDetails = true, limit, className = "" }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [inventoryItem, setInventoryItem] = useState<InventoryItem | null>(
    null,
  );
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const pageSize = limit || 10;

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [transactionType, setTransactionType] = useState<string>("");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);

  // Load transactions
  const loadTransactions = async () => {
    setLoading(true);
    setError(null);

    try {
      // If no inventory item ID is provided, we can't load transactions
      if (!inventoryItemId) {
        setTransactions([]);
        setLoading(false);
        return;
      }

      // Build query parameters
      const params: any = {
        page,
        pageSize,
      };

      if (transactionType) {
        params.transactionType = transactionType;
      }

      if (dateFrom) {
        params.dateFrom = dateFrom;
      }

      if (dateTo) {
        params.dateTo = dateTo;
      }

      // Load transactions
      const response = await procurementApi.getInventoryTransactions(
        inventoryItemId,
        params,
      );

      if (response.success && response.data) {
        // Filter by search term if provided
        let filteredTransactions = response.data.items;
        if (searchTerm) {
          filteredTransactions = filteredTransactions.filter(
            (transaction) =>
              transaction.notes
                ?.toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
              transaction.performedBy
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
              transaction.referenceType
                ?.toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
              transaction.referenceId
                ?.toLowerCase()
                .includes(searchTerm.toLowerCase()),
          );
        }

        setTransactions(filteredTransactions);
        setTotalPages(response.data.totalPages);
        setTotalItems(response.data.totalItems);
      } else {
        setError(response.message || "Failed to load transactions");
      }

      // Load inventory item details if needed
      if (showItemDetails && !inventoryItem) {
        const itemResponse =
          await procurementApi.getInventoryItem(inventoryItemId);
        if (itemResponse.success && itemResponse.data) {
          setInventoryItem(itemResponse.data);
        }
      }
    } catch (err) {
      setError("An error occurred while loading transactions");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Load transactions when component mounts or filters change
  useEffect(() => {
    if (inventoryItemId) {
      loadTransactions();
    }
  }, [inventoryItemId, page, pageSize, transactionType, dateFrom, dateTo]);

  // Handle search
  const handleSearch = () => {
    setPage(1); // Reset to first page
    loadTransactions();
  };

  // Reset filters
  const resetFilters = () => {
    setSearchTerm("");
    setTransactionType("");
    setDateFrom("");
    setDateTo("");
    setPage(1);
  };

  // Get transaction type badge color
  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case "purchase":
        return "bg-green-100 text-green-800";
      case "allocation":
        return "bg-blue-100 text-blue-800";
      case "return":
        return "bg-purple-100 text-purple-800";
      case "adjustment":
        return "bg-yellow-100 text-yellow-800";
      case "disposal":
        return "bg-red-100 text-red-800";
      case "check_out":
        return "bg-orange-100 text-orange-800";
      case "check_in":
        return "bg-teal-100 text-teal-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Format transaction type for display
  const formatTransactionType = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  return (
    <Card className={`overflow-hidden bg-white ${className}`}>
      <CardHeader className="bg-muted">
        <div className="flex justify-between items-center">
          <CardTitle>
            {showItemDetails && inventoryItem
              ? `${t("Transaction History")}: ${inventoryItem.name}`
              : t("Transaction History")}
          </CardTitle>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              {showFilters ? t("Hide Filters") : t("Show Filters")}
            </Button>
            <Button variant="outline" size="sm" onClick={loadTransactions}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {error && (
          <Alert variant="destructive" className="m-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {showItemDetails && inventoryItem && (
          <div className="p-4 bg-muted/50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium">{t("Item Code")}</p>
                <p>{inventoryItem.itemCode}</p>
              </div>
              <div>
                <p className="text-sm font-medium">{t("Current Quantity")}</p>
                <p>
                  {inventoryItem.quantity} {inventoryItem.unit}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">{t("Status")}</p>
                <Badge
                  variant="outline"
                  className={
                    inventoryItem.status === "available"
                      ? "bg-green-100 text-green-800"
                      : inventoryItem.status === "low"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                  }
                >
                  {inventoryItem.status.replace("_", " ").toUpperCase()}
                </Badge>
              </div>
            </div>
          </div>
        )}

        {showFilters && (
          <div className="p-4 border-b">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="search">{t("Search")}</Label>
                <div className="flex">
                  <Input
                    id="search"
                    placeholder={t("Search transactions...")}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="rounded-r-none"
                  />
                  <Button
                    variant="default"
                    className="rounded-l-none"
                    onClick={handleSearch}
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="transactionType">{t("Transaction Type")}</Label>
                <Select
                  value={transactionType}
                  onValueChange={setTransactionType}
                >
                  <SelectTrigger id="transactionType">
                    <SelectValue placeholder={t("All Types")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">{t("All Types")}</SelectItem>
                    <SelectItem value="purchase">{t("Purchase")}</SelectItem>
                    <SelectItem value="allocation">
                      {t("Allocation")}
                    </SelectItem>
                    <SelectItem value="return">{t("Return")}</SelectItem>
                    <SelectItem value="adjustment">
                      {t("Adjustment")}
                    </SelectItem>
                    <SelectItem value="disposal">{t("Disposal")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateFrom">{t("Date From")}</Label>
                <Input
                  id="dateFrom"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateTo">{t("Date To")}</Label>
                <Input
                  id="dateTo"
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <Button variant="outline" size="sm" onClick={resetFilters}>
                {t("Reset Filters")}
              </Button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("Date")}</TableHead>
                <TableHead>{t("Type")}</TableHead>
                <TableHead>{t("Quantity")}</TableHead>
                <TableHead>{t("Performed By")}</TableHead>
                <TableHead>{t("Reference")}</TableHead>
                <TableHead>{t("Notes")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    {t("Loading transactions...")}
                  </TableCell>
                </TableRow>
              ) : transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    {t("No transactions found")}
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      {format(new Date(transaction.date), "yyyy-MM-dd HH:mm")}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={getTransactionTypeColor(
                          transaction.transactionType,
                        )}
                      >
                        {formatTransactionType(transaction.transactionType)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span
                        className={
                          transaction.transactionType === "allocation" ||
                          transaction.transactionType === "disposal"
                            ? "text-red-600"
                            : "text-green-600"
                        }
                      >
                        {transaction.transactionType === "allocation" ||
                        transaction.transactionType === "disposal"
                          ? "-"
                          : "+"}
                        {transaction.quantity}
                      </span>
                    </TableCell>
                    <TableCell>{transaction.performedBy}</TableCell>
                    <TableCell>
                      {transaction.referenceType && transaction.referenceId
                        ? `${transaction.referenceType.replace("_", " ")}: ${transaction.referenceId}`
                        : "-"}
                    </TableCell>
                    <TableCell>{transaction.notes || "-"}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className="p-4 flex justify-between items-center border-t">
            <div className="text-sm text-muted-foreground">
              {t("Showing")} {(page - 1) * pageSize + 1}-
              {Math.min(page * pageSize, totalItems)} {t("of")} {totalItems}{" "}
              {t("transactions")}
            </div>
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InventoryTransactionHistory;
