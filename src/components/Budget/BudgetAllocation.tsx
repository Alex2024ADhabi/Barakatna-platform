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
import { BudgetAllocation as BudgetAllocationType } from "@/lib/api/budget/types";
import { budgetApi } from "@/lib/api/budget/budgetApi";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { AlertCircle, Check, Plus, RefreshCw, X } from "lucide-react";

interface BudgetAllocationProps {
  budgetId: string;
}

const BudgetAllocation = ({ budgetId }: BudgetAllocationProps) => {
  const { t } = useTranslation();
  const dir = useTranslatedDirection();
  const [allocations, setAllocations] = useState<BudgetAllocationType[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("current");

  // Form state
  const [departmentId, setDepartmentId] = useState("");
  const [projectId, setProjectId] = useState("");
  const [amount, setAmount] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    const fetchAllocations = async () => {
      try {
        const data = await budgetApi.getBudgetAllocations(budgetId);
        setAllocations(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching allocations:", error);
        setLoading(false);
      }
    };

    fetchAllocations();
  }, [budgetId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      const newAllocation = await budgetApi.createBudgetAllocation({
        budgetId,
        departmentId: departmentId || undefined,
        projectId: projectId || undefined,
        amount: parseFloat(amount),
        startDate,
        endDate,
        status: "pending",
        notes: notes || undefined,
      });

      setAllocations([...allocations, newAllocation]);

      // Reset form
      setDepartmentId("");
      setProjectId("");
      setAmount("");
      setStartDate("");
      setEndDate("");
      setNotes("");

      setLoading(false);
    } catch (error) {
      console.error("Error creating allocation:", error);
      setLoading(false);
    }
  };

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

  // Prepare data for pie chart
  const departmentAllocations = allocations
    .filter((a) => a.departmentId)
    .reduce(
      (acc, curr) => {
        const deptName = curr.department?.name || curr.departmentId;
        if (acc[deptName as string]) {
          acc[deptName as string] += curr.amount;
        } else {
          acc[deptName as string] = curr.amount;
        }
        return acc;
      },
      {} as Record<string, number>,
    );

  const projectAllocations = allocations
    .filter((a) => a.projectId)
    .reduce(
      (acc, curr) => {
        const projName = curr.project?.name || curr.projectId;
        if (acc[projName as string]) {
          acc[projName as string] += curr.amount;
        } else {
          acc[projName as string] = curr.amount;
        }
        return acc;
      },
      {} as Record<string, number>,
    );

  const departmentChartData = Object.entries(departmentAllocations).map(
    ([name, value]) => ({
      name,
      value,
    }),
  );

  const projectChartData = Object.entries(projectAllocations).map(
    ([name, value]) => ({
      name,
      value,
    }),
  );

  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884d8",
    "#82ca9d",
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: "USD", // This should come from the budget
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{t("budget.budgetAllocation")}</CardTitle>
            <CardDescription>
              {t("budget.budgetAllocationDescription")}
            </CardDescription>
          </div>
          <Button variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" /> {t("common.refresh")}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs
          defaultValue="current"
          value={activeTab}
          onValueChange={setActiveTab}
        >
          <TabsList>
            <TabsTrigger value="current">
              {t("budget.currentAllocations")}
            </TabsTrigger>
            <TabsTrigger value="new">{t("budget.newAllocation")}</TabsTrigger>
            <TabsTrigger value="analytics">
              {t("budget.allocationAnalytics")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="current" className="space-y-4">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("budget.department")}</TableHead>
                    <TableHead>{t("budget.project")}</TableHead>
                    <TableHead>{t("budget.amount")}</TableHead>
                    <TableHead>{t("budget.period")}</TableHead>
                    <TableHead>{t("common.status")}</TableHead>
                    <TableHead>{t("common.notes")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4">
                        {t("common.loading")}
                      </TableCell>
                    </TableRow>
                  ) : allocations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4">
                        {t("budget.noAllocations")}
                      </TableCell>
                    </TableRow>
                  ) : (
                    allocations.map((allocation) => (
                      <TableRow key={allocation.id}>
                        <TableCell>
                          {allocation.department?.name ||
                            allocation.departmentId ||
                            "-"}
                        </TableCell>
                        <TableCell>
                          {allocation.project?.name ||
                            allocation.projectId ||
                            "-"}
                        </TableCell>
                        <TableCell>
                          {formatCurrency(allocation.amount)}
                        </TableCell>
                        <TableCell>
                          {new Date(allocation.startDate).toLocaleDateString()}{" "}
                          - {new Date(allocation.endDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {getAllocationStatusBadge(allocation.status)}
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {allocation.notes || "-"}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="new">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="departmentId">{t("budget.department")}</Label>
                  <Input
                    id="departmentId"
                    placeholder={t("budget.selectDepartment")}
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="projectId">{t("budget.project")}</Label>
                  <Input
                    id="projectId"
                    placeholder={t("budget.selectProject")}
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">{t("budget.amount")}</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="startDate">{t("budget.startDate")}</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">{t("budget.endDate")}</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">{t("common.notes")}</Label>
                <Input
                  id="notes"
                  placeholder={t("common.notesPlaceholder")}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>

              <Button type="submit" disabled={loading}>
                <Plus className="mr-2 h-4 w-4" /> {t("budget.createAllocation")}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="analytics">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">
                    {t("budget.departmentAllocation")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    {departmentChartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={departmentChartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) =>
                              `${name}: ${(percent * 100).toFixed(0)}%`
                            }
                          >
                            {departmentChartData.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                              />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value) =>
                              formatCurrency(value as number)
                            }
                          />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <p className="text-muted-foreground">
                          {t("common.noData")}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">
                    {t("budget.projectAllocation")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    {projectChartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={projectChartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                            label={({ name, percent }) =>
                              `${name}: ${(percent * 100).toFixed(0)}%`
                            }
                          >
                            {projectChartData.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                              />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value) =>
                              formatCurrency(value as number)
                            }
                          />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <p className="text-muted-foreground">
                          {t("common.noData")}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default BudgetAllocation;
