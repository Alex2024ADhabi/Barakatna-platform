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
import { BudgetAllocation } from "@/lib/api/budget/types";
import { budgetApi } from "@/lib/api/budget/budgetApi";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import {
  AlertCircle,
  Check,
  Download,
  Filter,
  RefreshCw,
  X,
} from "lucide-react";

interface AllocationHistoryProps {
  budgetId?: string;
}

const AllocationHistory = ({ budgetId }: AllocationHistoryProps) => {
  const { t } = useTranslation();
  const dir = useTranslatedDirection();
  const [allocations, setAllocations] = useState<BudgetAllocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDepartment, setFilterDepartment] = useState("");
  const [filterProject, setFilterProject] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");

  useEffect(() => {
    const fetchAllocations = async () => {
      try {
        let data: BudgetAllocation[] = [];
        if (budgetId) {
          data = await budgetApi.getBudgetAllocations(budgetId);
        } else {
          // In a real implementation, this would fetch all allocations across budgets
          // For now, we'll just use the mock data from the first budget
          const budgets = await budgetApi.getBudgets();
          if (budgets.length > 0) {
            data = await budgetApi.getBudgetAllocations(budgets[0].id);
          }
        }
        setAllocations(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching allocations:", error);
        setLoading(false);
      }
    };

    fetchAllocations();
  }, [budgetId]);

  const getAllocationStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge className="bg-green-500">
            <Check className="mr-1 h-3 w-3" /> {t("budget.approved")}
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="outline" className="text-amber-500 border-amber-500">
            <AlertCircle className="mr-1 h-3 w-3" /> {t("budget.pending")}
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="bg-red-500">
            <X className="mr-1 h-3 w-3" /> {t("budget.rejected")}
          </Badge>
        );
      case "released":
        return <Badge className="bg-blue-500">{t("budget.released")}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: "USD", // This should come from the budget
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleExport = () => {
    // In a real implementation, this would generate a CSV or Excel file
    alert(t("budget.exportNotImplemented"));
  };

  const handleFilter = () => {
    // In a real implementation, this would filter the allocations based on the filter criteria
    // For now, we'll just log the filter criteria
    console.log("Filter criteria:", {
      department: filterDepartment,
      project: filterProject,
      status: filterStatus,
      dateFrom: filterDateFrom,
      dateTo: filterDateTo,
    });
  };

  const handleReset = () => {
    setFilterDepartment("");
    setFilterProject("");
    setFilterStatus("");
    setFilterDateFrom("");
    setFilterDateTo("");
  };

  // Apply filters
  const filteredAllocations = allocations.filter((allocation) => {
    if (
      filterDepartment &&
      (!allocation.departmentId ||
        !allocation.departmentId.toString().includes(filterDepartment))
    ) {
      return false;
    }
    if (
      filterProject &&
      (!allocation.projectId ||
        !allocation.projectId.toString().includes(filterProject))
    ) {
      return false;
    }
    if (filterStatus && allocation.status !== filterStatus) {
      return false;
    }
    if (
      filterDateFrom &&
      new Date(allocation.startDate) < new Date(filterDateFrom)
    ) {
      return false;
    }
    if (filterDateTo && new Date(allocation.endDate) > new Date(filterDateTo)) {
      return false;
    }
    return true;
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{t("budget.allocationHistory")}</CardTitle>
            <CardDescription>
              {t("budget.allocationHistoryDescription")}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" /> {t("common.export")}
            </Button>
            <Button variant="outline" onClick={() => window.location.reload()}>
              <RefreshCw className="mr-2 h-4 w-4" /> {t("common.refresh")}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-6 p-4 border rounded-md">
          <h3 className="text-sm font-medium mb-3">{t("common.filters")}</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="filterDepartment">{t("budget.department")}</Label>
              <Input
                id="filterDepartment"
                placeholder={t("budget.filterByDepartment")}
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="filterProject">{t("budget.project")}</Label>
              <Input
                id="filterProject"
                placeholder={t("budget.filterByProject")}
                value={filterProject}
                onChange={(e) => setFilterProject(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="filterStatus">{t("common.status")}</Label>
              <select
                id="filterStatus"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="">{t("common.all")}</option>
                <option value="pending">{t("budget.pending")}</option>
                <option value="approved">{t("budget.approved")}</option>
                <option value="rejected">{t("budget.rejected")}</option>
                <option value="released">{t("budget.released")}</option>
              </select>
            </div>
            <div>
              <Label htmlFor="filterDateFrom">{t("budget.dateFrom")}</Label>
              <Input
                id="filterDateFrom"
                type="date"
                value={filterDateFrom}
                onChange={(e) => setFilterDateFrom(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="filterDateTo">{t("budget.dateTo")}</Label>
              <Input
                id="filterDateTo"
                type="date"
                value={filterDateTo}
                onChange={(e) => setFilterDateTo(e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-end mt-4 gap-2">
            <Button variant="outline" onClick={handleReset}>
              {t("common.reset")}
            </Button>
            <Button onClick={handleFilter}>
              <Filter className="mr-2 h-4 w-4" /> {t("common.applyFilters")}
            </Button>
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("budget.budget")}</TableHead>
                <TableHead>{t("budget.department")}</TableHead>
                <TableHead>{t("budget.project")}</TableHead>
                <TableHead>{t("budget.amount")}</TableHead>
                <TableHead>{t("budget.period")}</TableHead>
                <TableHead>{t("common.status")}</TableHead>
                <TableHead>{t("budget.approvedBy")}</TableHead>
                <TableHead>{t("common.notes")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-4">
                    {t("common.loading")}
                  </TableCell>
                </TableRow>
              ) : filteredAllocations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-4">
                    {t("budget.noAllocations")}
                  </TableCell>
                </TableRow>
              ) : (
                filteredAllocations.map((allocation) => (
                  <TableRow key={allocation.id}>
                    <TableCell>{allocation.budgetId}</TableCell>
                    <TableCell>
                      {allocation.department?.name ||
                        allocation.departmentId ||
                        "-"}
                    </TableCell>
                    <TableCell>
                      {allocation.project?.name || allocation.projectId || "-"}
                    </TableCell>
                    <TableCell>{formatCurrency(allocation.amount)}</TableCell>
                    <TableCell>
                      {new Date(allocation.startDate).toLocaleDateString()} -{" "}
                      {new Date(allocation.endDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {getAllocationStatusBadge(allocation.status)}
                    </TableCell>
                    <TableCell>{allocation.approvedBy || "-"}</TableCell>
                    <TableCell className="max-w-xs truncate">
                      {allocation.notes || "-"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default AllocationHistory;
