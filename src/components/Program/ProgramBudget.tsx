import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  Plus,
  DollarSign,
  FileText,
  Download,
  Filter,
  BarChart3,
  PieChart,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
} from "recharts";

interface BudgetItem {
  id: string;
  category: string;
  description: string;
  allocated: number;
  spent: number;
  committed: number;
  remaining: number;
  status: "on-track" | "at-risk" | "over-budget";
}

interface BudgetSummary {
  totalAllocated: number;
  totalSpent: number;
  totalCommitted: number;
  totalRemaining: number;
  percentageUsed: number;
}

interface ProgramBudgetProps {
  programId: string;
}

const statusColors: Record<string, string> = {
  "on-track": "bg-green-100 text-green-800",
  "at-risk": "bg-yellow-100 text-yellow-800",
  "over-budget": "bg-red-100 text-red-800",
};

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

const ProgramBudget: React.FC<ProgramBudgetProps> = ({ programId }) => {
  const { t } = useTranslation();
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [filteredBudgetItems, setFilteredBudgetItems] = useState<BudgetItem[]>(
    [],
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("table");
  const [budgetSummary, setBudgetSummary] = useState<BudgetSummary>({
    totalAllocated: 0,
    totalSpent: 0,
    totalCommitted: 0,
    totalRemaining: 0,
    percentageUsed: 0,
  });

  // Mock data - in a real app, this would come from an API
  useEffect(() => {
    // Simulate API call
    const mockBudgetItems: BudgetItem[] = [
      {
        id: "1",
        category: "Materials",
        description: "Bathroom modification materials",
        allocated: 25000,
        spent: 18500,
        committed: 3000,
        remaining: 3500,
        status: "on-track",
      },
      {
        id: "2",
        category: "Labor",
        description: "Contractor fees for installations",
        allocated: 35000,
        spent: 20000,
        committed: 10000,
        remaining: 5000,
        status: "at-risk",
      },
      {
        id: "3",
        category: "Equipment",
        description: "Specialized equipment rental",
        allocated: 15000,
        spent: 12000,
        committed: 4000,
        remaining: -1000,
        status: "over-budget",
      },
      {
        id: "4",
        category: "Permits",
        description: "Building permits and inspections",
        allocated: 5000,
        spent: 3500,
        committed: 0,
        remaining: 1500,
        status: "on-track",
      },
      {
        id: "5",
        category: "Contingency",
        description: "Emergency fund for unexpected issues",
        allocated: 10000,
        spent: 2000,
        committed: 0,
        remaining: 8000,
        status: "on-track",
      },
    ];

    setBudgetItems(mockBudgetItems);
    setFilteredBudgetItems(mockBudgetItems);

    // Calculate budget summary
    const totalAllocated = mockBudgetItems.reduce(
      (sum, item) => sum + item.allocated,
      0,
    );
    const totalSpent = mockBudgetItems.reduce(
      (sum, item) => sum + item.spent,
      0,
    );
    const totalCommitted = mockBudgetItems.reduce(
      (sum, item) => sum + item.committed,
      0,
    );
    const totalRemaining = totalAllocated - totalSpent - totalCommitted;
    const percentageUsed = (totalSpent / totalAllocated) * 100;

    setBudgetSummary({
      totalAllocated,
      totalSpent,
      totalCommitted,
      totalRemaining,
      percentageUsed,
    });
  }, []);

  useEffect(() => {
    let result = [...budgetItems];

    // Apply search filter
    if (searchTerm) {
      result = result.filter(
        (item) =>
          item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.description.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Apply status filter
    if (statusFilter.length > 0) {
      result = result.filter((item) => statusFilter.includes(item.status));
    }

    setFilteredBudgetItems(result);
  }, [searchTerm, statusFilter, budgetItems]);

  const handleAddBudgetItem = () => {
    // In a real app, this would send data to an API
    setIsAddDialogOpen(false);
  };

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status],
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getProgressColor = (status: string) => {
    switch (status) {
      case "on-track":
        return "bg-green-500";
      case "at-risk":
        return "bg-yellow-500";
      case "over-budget":
        return "bg-red-500";
      default:
        return "bg-blue-500";
    }
  };

  const calculatePercentage = (spent: number, allocated: number) => {
    return (spent / allocated) * 100;
  };

  // Prepare data for charts
  const barChartData = budgetItems.map((item) => ({
    name: item.category,
    allocated: item.allocated,
    spent: item.spent,
    committed: item.committed,
  }));

  const pieChartData = [
    { name: "Spent", value: budgetSummary.totalSpent },
    { name: "Committed", value: budgetSummary.totalCommitted },
    {
      name: "Remaining",
      value:
        budgetSummary.totalRemaining > 0 ? budgetSummary.totalRemaining : 0,
    },
  ];

  return (
    <Card className="w-full bg-white shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            {t("Budget Management")}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-1"
            >
              <FileText className="h-4 w-4" />
              {t("Export Report")}
            </Button>
            <Button
              onClick={() => setIsAddDialogOpen(true)}
              className="flex items-center gap-1"
              size="sm"
            >
              <Plus className="h-4 w-4" />
              {t("Add Budget Item")}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Budget Summary Cards */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-gray-500">{t("Total Budget")}</div>
              <div className="text-2xl font-bold mt-1">
                {formatCurrency(budgetSummary.totalAllocated)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-gray-500">{t("Spent")}</div>
              <div className="text-2xl font-bold mt-1">
                {formatCurrency(budgetSummary.totalSpent)}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {budgetSummary.percentageUsed.toFixed(1)}% {t("of total")}
              </div>
              <Progress
                value={budgetSummary.percentageUsed}
                className="h-1 mt-2"
                indicatorClassName={
                  budgetSummary.percentageUsed > 90
                    ? "bg-red-500"
                    : "bg-blue-500"
                }
              />
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-gray-500">{t("Committed")}</div>
              <div className="text-2xl font-bold mt-1">
                {formatCurrency(budgetSummary.totalCommitted)}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {(
                  (budgetSummary.totalCommitted /
                    budgetSummary.totalAllocated) *
                  100
                ).toFixed(1)}
                % {t("of total")}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-gray-500">{t("Remaining")}</div>
              <div
                className={`text-2xl font-bold mt-1 ${budgetSummary.totalRemaining < 0 ? "text-red-600" : ""}`}
              >
                {formatCurrency(budgetSummary.totalRemaining)}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {(
                  (budgetSummary.totalRemaining /
                    budgetSummary.totalAllocated) *
                  100
                ).toFixed(1)}
                % {t("of total")}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="table" className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                {t("Table View")}
              </TabsTrigger>
              <TabsTrigger value="charts" className="flex items-center gap-1">
                <BarChart3 className="h-4 w-4" />
                {t("Charts")}
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-4">
              <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder={t("Search budget items...")}
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-500" />
                {Object.keys(statusColors).map((status) => (
                  <Badge
                    key={status}
                    variant={
                      statusFilter.includes(status) ? "default" : "outline"
                    }
                    className="cursor-pointer capitalize"
                    onClick={() => handleStatusFilterChange(status)}
                  >
                    {t(status)}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <TabsContent value="table" className="mt-0">
            <div className="border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("Category")}</TableHead>
                    <TableHead>{t("Description")}</TableHead>
                    <TableHead className="text-right">
                      {t("Allocated")}
                    </TableHead>
                    <TableHead className="text-right">{t("Spent")}</TableHead>
                    <TableHead className="text-right">
                      {t("Committed")}
                    </TableHead>
                    <TableHead className="text-right">
                      {t("Remaining")}
                    </TableHead>
                    <TableHead>{t("Status")}</TableHead>
                    <TableHead>{t("Usage")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBudgetItems.length > 0 ? (
                    filteredBudgetItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          {item.category}
                        </TableCell>
                        <TableCell>{item.description}</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.allocated)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.spent)}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(item.committed)}
                        </TableCell>
                        <TableCell
                          className={`text-right ${item.remaining < 0 ? "text-red-600 font-medium" : ""}`}
                        >
                          {formatCurrency(item.remaining)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className={`${statusColors[item.status]} capitalize`}
                          >
                            {t(item.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress
                              value={calculatePercentage(
                                item.spent,
                                item.allocated,
                              )}
                              className="h-2 w-16"
                              indicatorClassName={getProgressColor(item.status)}
                            />
                            <span className="text-xs">
                              {calculatePercentage(
                                item.spent,
                                item.allocated,
                              ).toFixed(0)}
                              %
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="text-center py-4 text-gray-500"
                      >
                        {t("No budget items found matching your criteria")}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="charts" className="mt-0">
            <div className="grid grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {t("Budget Allocation vs. Spending")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={barChartData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip
                          formatter={(value) => formatCurrency(value as number)}
                        />
                        <Legend />
                        <Bar
                          dataKey="allocated"
                          name={t("Allocated")}
                          fill="#8884d8"
                        />
                        <Bar dataKey="spent" name={t("Spent")} fill="#82ca9d" />
                        <Bar
                          dataKey="committed"
                          name={t("Committed")}
                          fill="#ffc658"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {t("Budget Distribution")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={pieChartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) =>
                            `${name}: ${(percent * 100).toFixed(0)}%`
                          }
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {pieChartData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value) => formatCurrency(value as number)}
                        />
                        <Legend />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Add Budget Item Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{t("Add Budget Item")}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="category">{t("Category")}</Label>
                  <Select>
                    <SelectTrigger id="category">
                      <SelectValue placeholder={t("Select category")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Materials">
                        {t("Materials")}
                      </SelectItem>
                      <SelectItem value="Labor">{t("Labor")}</SelectItem>
                      <SelectItem value="Equipment">
                        {t("Equipment")}
                      </SelectItem>
                      <SelectItem value="Permits">{t("Permits")}</SelectItem>
                      <SelectItem value="Contingency">
                        {t("Contingency")}
                      </SelectItem>
                      <SelectItem value="Other">{t("Other")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="allocated">{t("Allocated Amount")}</Label>
                  <Input id="allocated" type="number" placeholder="0.00" />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="description">{t("Description")}</Label>
                <Input id="description" placeholder={t("Enter description")} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="spent">{t("Amount Spent")}</Label>
                  <Input id="spent" type="number" placeholder="0.00" />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="committed">{t("Amount Committed")}</Label>
                  <Input id="committed" type="number" placeholder="0.00" />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
              >
                {t("Cancel")}
              </Button>
              <Button onClick={handleAddBudgetItem}>{t("Add Item")}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default ProgramBudget;
