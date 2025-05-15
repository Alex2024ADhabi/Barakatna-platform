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
import {
  BarChart3,
  Calendar,
  Download,
  Filter,
  Loader2,
  Search,
  TrendingUp,
} from "lucide-react";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { InventoryTransaction } from "@/lib/api/procurement/types";
import { procurementApi } from "@/lib/api/procurement/procurementApi";
import { useToast } from "../ui/use-toast";

const InventoryUtilizationTracking: React.FC = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [transactionTypeFilter, setTransactionTypeFilter] =
    useState<string>("");
  const [dateRangeFilter, setDateRangeFilter] = useState<string>("last30");

  useEffect(() => {
    fetchTransactions();
  }, [dateRangeFilter]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      // In a real app, this would call an API with filters
      // For now, we'll use mock data
      const mockTransactions: InventoryTransaction[] =
        generateMockTransactions();
      setTransactions(mockTransactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      toast({
        title: "Error",
        description: "Failed to load inventory transactions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateMockTransactions = (): InventoryTransaction[] => {
    const transactionTypes: (
      | "purchase"
      | "allocation"
      | "return"
      | "adjustment"
      | "disposal"
      | "check_out"
      | "check_in"
    )[] = [
      "purchase",
      "allocation",
      "return",
      "adjustment",
      "disposal",
      "check_out",
      "check_in",
    ];

    const now = new Date();
    const transactions: InventoryTransaction[] = [];

    // Generate 50 random transactions over the last 90 days
    for (let i = 0; i < 50; i++) {
      const daysAgo = Math.floor(Math.random() * 90);
      const transactionDate = new Date(
        now.getTime() - daysAgo * 24 * 60 * 60 * 1000,
      );
      const transactionType =
        transactionTypes[Math.floor(Math.random() * transactionTypes.length)];
      const quantity = Math.floor(Math.random() * 10) + 1;

      transactions.push({
        id: `trans-${i}`,
        inventoryItemId: `item-${Math.floor(Math.random() * 10) + 1}`,
        transactionType,
        quantity:
          transactionType === "return" || transactionType === "disposal"
            ? -quantity
            : quantity,
        referenceId:
          transactionType === "purchase"
            ? `PO-${Math.floor(Math.random() * 1000)}`
            : transactionType === "allocation"
              ? `PROJ-${Math.floor(Math.random() * 100)}`
              : undefined,
        referenceType:
          transactionType === "purchase"
            ? "purchase_order"
            : transactionType === "allocation"
              ? "project"
              : undefined,
        date: transactionDate,
        performedBy: `User-${Math.floor(Math.random() * 5) + 1}`,
        notes: `Sample transaction note for ${transactionType}`,
        createdAt: transactionDate,
        updatedAt: transactionDate,
      });
    }

    return transactions;
  };

  const getDateRangeFilter = () => {
    const now = new Date();
    switch (dateRangeFilter) {
      case "last7":
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case "last30":
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      case "last90":
        return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      default:
        return new Date(0); // All time
    }
  };

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch = searchTerm
      ? transaction.inventoryItemId
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        transaction.performedBy
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (transaction.notes &&
          transaction.notes.toLowerCase().includes(searchTerm.toLowerCase()))
      : true;

    const matchesType = transactionTypeFilter
      ? transaction.transactionType === transactionTypeFilter
      : true;

    const matchesDateRange =
      dateRangeFilter !== "all"
        ? transaction.date >= getDateRangeFilter()
        : true;

    return matchesSearch && matchesType && matchesDateRange;
  });

  // Calculate utilization metrics
  const calculateUtilizationMetrics = () => {
    const dateFilter = getDateRangeFilter();
    const filteredByDate = transactions.filter((t) => t.date >= dateFilter);

    // Total items checked out
    const totalCheckouts = filteredByDate
      .filter((t) => t.transactionType === "check_out")
      .reduce((sum, t) => sum + t.quantity, 0);

    // Total items returned
    const totalReturns = filteredByDate
      .filter((t) => t.transactionType === "check_in")
      .reduce((sum, t) => sum + t.quantity, 0);

    // Total allocations
    const totalAllocations = filteredByDate
      .filter((t) => t.transactionType === "allocation")
      .reduce((sum, t) => sum + t.quantity, 0);

    // Total disposals
    const totalDisposals = filteredByDate
      .filter((t) => t.transactionType === "disposal")
      .reduce((sum, t) => sum + Math.abs(t.quantity), 0);

    return {
      totalCheckouts,
      totalReturns,
      totalAllocations,
      totalDisposals,
      utilizationRate:
        totalReturns > 0
          ? ((totalCheckouts / totalReturns) * 100).toFixed(1)
          : 0,
    };
  };

  const metrics = calculateUtilizationMetrics();

  const getTransactionTypeLabel = (type: string): string => {
    switch (type) {
      case "purchase":
        return t("procurement.purchase", "Purchase");
      case "allocation":
        return t("procurement.allocation", "Allocation");
      case "return":
        return t("procurement.return", "Return");
      case "adjustment":
        return t("procurement.adjustment", "Adjustment");
      case "disposal":
        return t("procurement.disposal", "Disposal");
      case "check_out":
        return t("procurement.checkOut", "Check Out");
      case "check_in":
        return t("procurement.checkIn", "Check In");
      default:
        return type;
    }
  };

  const getTransactionTypeBadgeVariant = (
    type: string,
  ): "default" | "secondary" | "destructive" | "outline" => {
    switch (type) {
      case "purchase":
        return "default";
      case "allocation":
        return "secondary";
      case "return":
        return "outline";
      case "disposal":
        return "destructive";
      case "check_out":
        return "secondary";
      case "check_in":
        return "default";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {t("procurement.totalCheckouts", "Total Checkouts")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalCheckouts}</div>
            <p className="text-xs text-muted-foreground">
              {t("procurement.itemsCheckedOut", "Items checked out")}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {t("procurement.totalReturns", "Total Returns")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalReturns}</div>
            <p className="text-xs text-muted-foreground">
              {t("procurement.itemsReturned", "Items returned")}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {t("procurement.utilizationRate", "Utilization Rate")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.utilizationRate}%</div>
            <p className="text-xs text-muted-foreground">
              {t(
                "procurement.checkoutToReturnRatio",
                "Checkout to return ratio",
              )}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {t("procurement.totalAllocations", "Total Allocations")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalAllocations}</div>
            <p className="text-xs text-muted-foreground">
              {t("procurement.itemsAllocated", "Items allocated to projects")}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t(
              "procurement.searchTransactions",
              "Search transactions...",
            )}
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select
            value={transactionTypeFilter}
            onValueChange={setTransactionTypeFilter}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue
                placeholder={t("procurement.filterByType", "Filter by type")}
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">
                {t("procurement.allTypes", "All Types")}
              </SelectItem>
              <SelectItem value="purchase">
                {t("procurement.purchase", "Purchase")}
              </SelectItem>
              <SelectItem value="allocation">
                {t("procurement.allocation", "Allocation")}
              </SelectItem>
              <SelectItem value="return">
                {t("procurement.return", "Return")}
              </SelectItem>
              <SelectItem value="adjustment">
                {t("procurement.adjustment", "Adjustment")}
              </SelectItem>
              <SelectItem value="disposal">
                {t("procurement.disposal", "Disposal")}
              </SelectItem>
              <SelectItem value="check_out">
                {t("procurement.checkOut", "Check Out")}
              </SelectItem>
              <SelectItem value="check_in">
                {t("procurement.checkIn", "Check In")}
              </SelectItem>
            </SelectContent>
          </Select>

          <Select value={dateRangeFilter} onValueChange={setDateRangeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue
                placeholder={t("procurement.dateRange", "Date Range")}
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                {t("procurement.allTime", "All Time")}
              </SelectItem>
              <SelectItem value="last7">
                {t("procurement.last7Days", "Last 7 Days")}
              </SelectItem>
              <SelectItem value="last30">
                {t("procurement.last30Days", "Last 30 Days")}
              </SelectItem>
              <SelectItem value="last90">
                {t("procurement.last90Days", "Last 90 Days")}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">
          {t("procurement.transactionHistory", "Transaction History")}
        </h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <BarChart3 className="h-4 w-4 mr-2" />
            {t("procurement.analytics", "Analytics")}
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            {t("procurement.export", "Export")}
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">{t("common.loading", "Loading...")}</span>
        </div>
      ) : filteredTransactions.length === 0 ? (
        <div className="text-center p-6 border rounded-md">
          <p className="text-muted-foreground">
            {t("procurement.noTransactionsFound", "No transactions found")}
          </p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("procurement.date", "Date")}</TableHead>
                <TableHead>{t("procurement.type", "Type")}</TableHead>
                <TableHead>{t("procurement.itemId", "Item ID")}</TableHead>
                <TableHead>{t("procurement.quantity", "Quantity")}</TableHead>
                <TableHead>
                  {t("procurement.performedBy", "Performed By")}
                </TableHead>
                <TableHead>{t("procurement.reference", "Reference")}</TableHead>
                <TableHead>{t("procurement.notes", "Notes")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    {format(new Date(transaction.date), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={getTransactionTypeBadgeVariant(
                        transaction.transactionType,
                      )}
                    >
                      {getTransactionTypeLabel(transaction.transactionType)}
                    </Badge>
                  </TableCell>
                  <TableCell>{transaction.inventoryItemId}</TableCell>
                  <TableCell
                    className={transaction.quantity < 0 ? "text-red-500" : ""}
                  >
                    {transaction.quantity}
                  </TableCell>
                  <TableCell>{transaction.performedBy}</TableCell>
                  <TableCell>
                    {transaction.referenceId ? (
                      <span>
                        {transaction.referenceType}: {transaction.referenceId}
                      </span>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {transaction.notes || "-"}
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

export default InventoryUtilizationTracking;
