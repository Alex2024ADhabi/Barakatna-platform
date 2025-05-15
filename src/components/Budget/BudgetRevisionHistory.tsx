import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "react-i18next";
import { useTranslatedDirection } from "@/hooks/useTranslatedDirection";
import { BudgetRevision } from "@/lib/api/budget/types";
import { budgetApi } from "@/lib/api/budget/budgetApi";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  History,
  Filter,
  Search,
  Eye,
  ArrowUpDown,
  RefreshCw,
  Download,
  Undo2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import RevisionDetails from "./RevisionDetails";

interface BudgetRevisionHistoryProps {
  budgetId: string;
}

const BudgetRevisionHistory = ({ budgetId }: BudgetRevisionHistoryProps) => {
  const { t } = useTranslation();
  const dir = useTranslatedDirection();
  const [revisions, setRevisions] = useState<BudgetRevision[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedRevision, setSelectedRevision] =
    useState<BudgetRevision | null>(null);

  // Mock data for revisions since we don't have a real API endpoint for this yet
  useEffect(() => {
    const fetchRevisions = async () => {
      try {
        setLoading(true);
        // In a real implementation, this would call an API endpoint
        // For now, we'll use mock data
        const mockRevisions: BudgetRevision[] = [
          {
            id: "1",
            budgetId,
            revisionNumber: 1,
            previousAmount: 500000,
            newAmount: 550000,
            reason: "Increased material costs due to supply chain issues",
            status: "approved",
            createdAt: "2023-02-15T10:30:00Z",
            updatedAt: "2023-02-20T14:45:00Z",
            createdBy: "user1",
            approvedBy: "user3",
            approvedAt: "2023-02-20T14:45:00Z",
            notes: "Approved after review of material cost increases",
          },
          {
            id: "2",
            budgetId,
            revisionNumber: 2,
            previousAmount: 550000,
            newAmount: 575000,
            reason: "Additional labor costs for specialized installations",
            status: "approved",
            createdAt: "2023-04-10T09:15:00Z",
            updatedAt: "2023-04-15T11:30:00Z",
            createdBy: "user2",
            approvedBy: "user3",
            approvedAt: "2023-04-15T11:30:00Z",
            notes: "Approved with condition to monitor labor efficiency",
          },
          {
            id: "3",
            budgetId,
            revisionNumber: 3,
            previousAmount: 575000,
            newAmount: 560000,
            reason: "Reduction due to change in project scope",
            status: "approved",
            createdAt: "2023-06-05T13:45:00Z",
            updatedAt: "2023-06-10T10:20:00Z",
            createdBy: "user1",
            approvedBy: "user3",
            approvedAt: "2023-06-10T10:20:00Z",
            notes: "Approved after scope review meeting",
          },
          {
            id: "4",
            budgetId,
            revisionNumber: 4,
            previousAmount: 560000,
            newAmount: 590000,
            reason: "Additional funds for accessibility modifications",
            status: "pending",
            createdAt: "2023-08-20T15:30:00Z",
            updatedAt: "2023-08-20T15:30:00Z",
            createdBy: "user2",
            notes: "Awaiting approval from finance committee",
          },
        ];

        setRevisions(mockRevisions);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching budget revisions:", error);
        setLoading(false);
      }
    };

    fetchRevisions();
  }, [budgetId]);

  const handleRefresh = () => {
    // In a real implementation, this would refresh the data from the API
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 500);
  };

  const handleViewRevision = (revision: BudgetRevision) => {
    setSelectedRevision(revision);
  };

  const handleCloseDetails = () => {
    setSelectedRevision(null);
  };

  const filteredRevisions = revisions
    .filter((revision) => {
      // Apply status filter
      if (statusFilter !== "all" && revision.status !== statusFilter) {
        return false;
      }

      // Apply search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          revision.reason.toLowerCase().includes(searchLower) ||
          revision.notes?.toLowerCase().includes(searchLower) ||
          revision.createdBy.toLowerCase().includes(searchLower) ||
          revision.approvedBy?.toLowerCase().includes(searchLower)
        );
      }

      return true;
    })
    .sort((a, b) => {
      // Sort by revision number
      if (sortOrder === "asc") {
        return a.revisionNumber - b.revisionNumber;
      } else {
        return b.revisionNumber - a.revisionNumber;
      }
    });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500">{t("budget.approved")}</Badge>;
      case "pending":
        return <Badge variant="outline">{t("budget.pending")}</Badge>;
      case "rejected":
        return <Badge className="bg-red-500">{t("budget.rejected")}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (selectedRevision) {
    return (
      <RevisionDetails
        revision={selectedRevision}
        onBack={handleCloseDetails}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">
            {t("budget.revisionHistory")}
          </h2>
          <p className="text-muted-foreground">
            {t("budget.revisionHistoryDescription")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" />
            {t("common.refresh")}
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            {t("common.export")}
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("budget.searchRevisions")}
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t("budget.filterByStatus")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("common.all")}</SelectItem>
              <SelectItem value="approved">{t("budget.approved")}</SelectItem>
              <SelectItem value="pending">{t("budget.pending")}</SelectItem>
              <SelectItem value="rejected">{t("budget.rejected")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-1"
          onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
        >
          <ArrowUpDown className="h-4 w-4" />
          {sortOrder === "asc"
            ? t("budget.oldestFirst")
            : t("budget.newestFirst")}
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("budget.revisionNumber")}</TableHead>
                  <TableHead>{t("budget.date")}</TableHead>
                  <TableHead>{t("budget.previousAmount")}</TableHead>
                  <TableHead>{t("budget.newAmount")}</TableHead>
                  <TableHead>{t("budget.change")}</TableHead>
                  <TableHead>{t("budget.reason")}</TableHead>
                  <TableHead>{t("common.status")}</TableHead>
                  <TableHead>{t("common.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-4">
                      {t("common.loading")}
                    </TableCell>
                  </TableRow>
                ) : filteredRevisions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-4">
                      {t("common.noResults")}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRevisions.map((revision) => {
                    const change = revision.newAmount - revision.previousAmount;
                    const changePercent =
                      (change / revision.previousAmount) * 100;
                    const isIncrease = change > 0;

                    return (
                      <TableRow key={revision.id}>
                        <TableCell className="font-medium">
                          {revision.revisionNumber}
                        </TableCell>
                        <TableCell>{formatDate(revision.createdAt)}</TableCell>
                        <TableCell>
                          {formatAmount(revision.previousAmount)}
                        </TableCell>
                        <TableCell>
                          {formatAmount(revision.newAmount)}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`${isIncrease ? "text-red-500" : "text-green-500"}`}
                          >
                            {isIncrease ? "+" : ""}
                            {formatAmount(change)} ({isIncrease ? "+" : ""}
                            {changePercent.toFixed(1)}%)
                          </span>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {revision.reason}
                        </TableCell>
                        <TableCell>{getStatusBadge(revision.status)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleViewRevision(revision)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {revision.status === "approved" && (
                              <Button
                                variant="ghost"
                                size="icon"
                                disabled
                                title={t("budget.cannotRevertApproved")}
                              >
                                <Undo2 className="h-4 w-4" />
                              </Button>
                            )}
                            {revision.status === "pending" && (
                              <Button
                                variant="ghost"
                                size="icon"
                                title={t("budget.revertToThisVersion")}
                              >
                                <Undo2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BudgetRevisionHistory;
