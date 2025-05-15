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
  AlertTriangle,
  Edit,
  Trash2,
  Filter,
  ArrowUpDown,
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
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";

interface Risk {
  id: string;
  title: string;
  description: string;
  category: string;
  probability: "high" | "medium" | "low";
  impact: "high" | "medium" | "low";
  status: "active" | "mitigated" | "occurred" | "closed";
  owner: string;
  mitigationPlan: string;
  contingencyPlan: string;
  createdAt: string;
  updatedAt: string;
}

interface ProgramRisksProps {
  programId: string;
}

const probabilityColors: Record<string, string> = {
  high: "bg-red-100 text-red-800",
  medium: "bg-yellow-100 text-yellow-800",
  low: "bg-green-100 text-green-800",
};

const impactColors: Record<string, string> = {
  high: "bg-red-100 text-red-800",
  medium: "bg-yellow-100 text-yellow-800",
  low: "bg-green-100 text-green-800",
};

const statusColors: Record<string, string> = {
  active: "bg-blue-100 text-blue-800",
  mitigated: "bg-green-100 text-green-800",
  occurred: "bg-red-100 text-red-800",
  closed: "bg-gray-100 text-gray-800",
};

const ProgramRisks: React.FC<ProgramRisksProps> = ({ programId }) => {
  const { t } = useTranslation();
  const [risks, setRisks] = useState<Risk[]>([]);
  const [filteredRisks, setFilteredRisks] = useState<Risk[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [currentRisk, setCurrentRisk] = useState<Risk | null>(null);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [sortConfig, setSortConfig] = useState<{
    key: keyof Risk;
    direction: "asc" | "desc";
  } | null>(null);

  // Mock data - in a real app, this would come from an API
  useEffect(() => {
    // Simulate API call
    const mockRisks: Risk[] = [
      {
        id: "1",
        title: "Budget Overrun",
        description:
          "Risk of exceeding allocated budget due to unforeseen material cost increases",
        category: "Financial",
        probability: "medium",
        impact: "high",
        status: "active",
        owner: "Sarah Johnson",
        mitigationPlan: "Regular budget reviews, contingency fund allocation",
        contingencyPlan:
          "Identify areas for cost reduction, request additional funding",
        createdAt: "2023-05-15",
        updatedAt: "2023-06-01",
      },
      {
        id: "2",
        title: "Contractor Availability",
        description:
          "Risk of delays due to limited availability of specialized contractors",
        category: "Resource",
        probability: "high",
        impact: "medium",
        status: "mitigated",
        owner: "Mohammed Al-Qahtani",
        mitigationPlan: "Early contractor engagement, flexible scheduling",
        contingencyPlan: "Alternative contractor list, adjust project timeline",
        createdAt: "2023-05-20",
        updatedAt: "2023-06-10",
      },
      {
        id: "3",
        title: "Regulatory Compliance",
        description:
          "Risk of non-compliance with updated accessibility regulations",
        category: "Compliance",
        probability: "low",
        impact: "high",
        status: "active",
        owner: "Khalid Al-Otaibi",
        mitigationPlan:
          "Regular regulatory reviews, compliance specialist consultation",
        contingencyPlan: "Rapid remediation plan, regulatory liaison",
        createdAt: "2023-05-25",
        updatedAt: "2023-05-25",
      },
      {
        id: "4",
        title: "Material Shortage",
        description: "Risk of delays due to shortage of specialized materials",
        category: "Supply Chain",
        probability: "medium",
        impact: "medium",
        status: "occurred",
        owner: "Ahmed Al-Mansour",
        mitigationPlan: "Early procurement, alternative materials research",
        contingencyPlan: "Alternative supplier network, design modifications",
        createdAt: "2023-06-01",
        updatedAt: "2023-06-15",
      },
      {
        id: "5",
        title: "Stakeholder Resistance",
        description:
          "Risk of project delays due to stakeholder concerns or resistance",
        category: "Stakeholder",
        probability: "low",
        impact: "medium",
        status: "closed",
        owner: "Fatima Al-Harbi",
        mitigationPlan: "Stakeholder engagement plan, regular communications",
        contingencyPlan: "Mediation process, executive sponsorship",
        createdAt: "2023-06-05",
        updatedAt: "2023-06-20",
      },
    ];

    setRisks(mockRisks);
    setFilteredRisks(mockRisks);
  }, []);

  useEffect(() => {
    let result = [...risks];

    // Apply search filter
    if (searchTerm) {
      result = result.filter(
        (risk) =>
          risk.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          risk.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          risk.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
          risk.owner.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Apply status filter
    if (statusFilter.length > 0) {
      result = result.filter((risk) => statusFilter.includes(risk.status));
    }

    // Apply sorting
    if (sortConfig) {
      result.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }

    setFilteredRisks(result);
  }, [searchTerm, statusFilter, sortConfig, risks]);

  const handleAddRisk = () => {
    // In a real app, this would send data to an API
    setIsAddDialogOpen(false);
  };

  const handleViewRisk = (risk: Risk) => {
    setCurrentRisk(risk);
    setIsViewDialogOpen(true);
  };

  const handleDeleteRisk = (id: string) => {
    // In a real app, this would send a delete request to an API
    setRisks(risks.filter((r) => r.id !== id));
  };

  const handleStatusFilterChange = (status: string) => {
    setStatusFilter((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status],
    );
  };

  const requestSort = (key: keyof Risk) => {
    let direction: "asc" | "desc" = "asc";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "asc"
    ) {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const calculateRiskScore = (probability: string, impact: string) => {
    const probabilityScore =
      probability === "high" ? 3 : probability === "medium" ? 2 : 1;
    const impactScore = impact === "high" ? 3 : impact === "medium" ? 2 : 1;
    return probabilityScore * impactScore;
  };

  const getRiskScoreColor = (score: number) => {
    if (score >= 6) return "text-red-600";
    if (score >= 3) return "text-yellow-600";
    return "text-green-600";
  };

  const getRiskScoreLabel = (score: number) => {
    if (score >= 6) return t("High");
    if (score >= 3) return t("Medium");
    return t("Low");
  };

  return (
    <Card className="w-full bg-white shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            {t("Risk Management")}
          </div>
          <Button
            onClick={() => setIsAddDialogOpen(true)}
            className="flex items-center gap-1"
          >
            <Plus className="h-4 w-4" />
            {t("Add Risk")}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder={t("Search risks...")}
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-500">
              {t("Filter by status")}:
            </span>
            {Object.keys(statusColors).map((status) => (
              <Badge
                key={status}
                variant={statusFilter.includes(status) ? "default" : "outline"}
                className="cursor-pointer capitalize"
                onClick={() => handleStatusFilterChange(status)}
              >
                {t(status)}
              </Badge>
            ))}
          </div>
        </div>

        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => requestSort("title")}
                >
                  <div className="flex items-center gap-1">
                    {t("Risk Title")}
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead>{t("Category")}</TableHead>
                <TableHead>{t("Probability")}</TableHead>
                <TableHead>{t("Impact")}</TableHead>
                <TableHead>{t("Risk Score")}</TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => requestSort("status")}
                >
                  <div className="flex items-center gap-1">
                    {t("Status")}
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </TableHead>
                <TableHead>{t("Owner")}</TableHead>
                <TableHead className="text-right">{t("Actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRisks.length > 0 ? (
                filteredRisks.map((risk) => {
                  const riskScore = calculateRiskScore(
                    risk.probability,
                    risk.impact,
                  );
                  const scoreColor = getRiskScoreColor(riskScore);
                  const scoreLabel = getRiskScoreLabel(riskScore);

                  return (
                    <TableRow key={risk.id}>
                      <TableCell className="font-medium">
                        <div
                          className="cursor-pointer hover:text-blue-600"
                          onClick={() => handleViewRisk(risk)}
                        >
                          {risk.title}
                        </div>
                      </TableCell>
                      <TableCell>{risk.category}</TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={`${probabilityColors[risk.probability]} capitalize`}
                        >
                          {t(risk.probability)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={`${impactColors[risk.impact]} capitalize`}
                        >
                          {t(risk.impact)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress
                            value={(riskScore / 9) * 100}
                            className="h-2 w-16"
                            indicatorClassName={
                              riskScore >= 6
                                ? "bg-red-500"
                                : riskScore >= 3
                                  ? "bg-yellow-500"
                                  : "bg-green-500"
                            }
                          />
                          <span className={`text-sm font-medium ${scoreColor}`}>
                            {scoreLabel}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={`${statusColors[risk.status]} capitalize`}
                        >
                          {t(risk.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>{risk.owner}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewRisk(risk)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteRisk(risk.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={8}
                    className="text-center py-4 text-gray-500"
                  >
                    {t("No risks found matching your criteria")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Add Risk Dialog */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{t("Add New Risk")}</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="title">{t("Risk Title")}</Label>
                <Input id="title" placeholder={t("Enter risk title")} />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="description">{t("Description")}</Label>
                <Textarea
                  id="description"
                  placeholder={t("Describe the risk in detail")}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="category">{t("Category")}</Label>
                  <Select>
                    <SelectTrigger id="category">
                      <SelectValue placeholder={t("Select category")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Financial">
                        {t("Financial")}
                      </SelectItem>
                      <SelectItem value="Resource">{t("Resource")}</SelectItem>
                      <SelectItem value="Compliance">
                        {t("Compliance")}
                      </SelectItem>
                      <SelectItem value="Supply Chain">
                        {t("Supply Chain")}
                      </SelectItem>
                      <SelectItem value="Stakeholder">
                        {t("Stakeholder")}
                      </SelectItem>
                      <SelectItem value="Technical">
                        {t("Technical")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="owner">{t("Risk Owner")}</Label>
                  <Input id="owner" placeholder={t("Enter risk owner")} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="probability">{t("Probability")}</Label>
                  <Select>
                    <SelectTrigger id="probability">
                      <SelectValue placeholder={t("Select level")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">{t("High")}</SelectItem>
                      <SelectItem value="medium">{t("Medium")}</SelectItem>
                      <SelectItem value="low">{t("Low")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="impact">{t("Impact")}</Label>
                  <Select>
                    <SelectTrigger id="impact">
                      <SelectValue placeholder={t("Select level")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">{t("High")}</SelectItem>
                      <SelectItem value="medium">{t("Medium")}</SelectItem>
                      <SelectItem value="low">{t("Low")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="mitigation">{t("Mitigation Plan")}</Label>
                <Textarea
                  id="mitigation"
                  placeholder={t("Describe how to mitigate this risk")}
                  rows={2}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="contingency">{t("Contingency Plan")}</Label>
                <Textarea
                  id="contingency"
                  placeholder={t(
                    "Describe the contingency plan if risk occurs",
                  )}
                  rows={2}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsAddDialogOpen(false)}
              >
                {t("Cancel")}
              </Button>
              <Button onClick={handleAddRisk}>{t("Add Risk")}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View/Edit Risk Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{t("Risk Details")}</DialogTitle>
            </DialogHeader>
            {currentRisk && (
              <div className="grid gap-4 py-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="view-title">{t("Risk Title")}</Label>
                  <Input id="view-title" defaultValue={currentRisk.title} />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="view-description">{t("Description")}</Label>
                  <Textarea
                    id="view-description"
                    defaultValue={currentRisk.description}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="view-category">{t("Category")}</Label>
                    <Select defaultValue={currentRisk.category}>
                      <SelectTrigger id="view-category">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Financial">
                          {t("Financial")}
                        </SelectItem>
                        <SelectItem value="Resource">
                          {t("Resource")}
                        </SelectItem>
                        <SelectItem value="Compliance">
                          {t("Compliance")}
                        </SelectItem>
                        <SelectItem value="Supply Chain">
                          {t("Supply Chain")}
                        </SelectItem>
                        <SelectItem value="Stakeholder">
                          {t("Stakeholder")}
                        </SelectItem>
                        <SelectItem value="Technical">
                          {t("Technical")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="view-owner">{t("Risk Owner")}</Label>
                    <Input id="view-owner" defaultValue={currentRisk.owner} />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="view-probability">{t("Probability")}</Label>
                    <Select defaultValue={currentRisk.probability}>
                      <SelectTrigger id="view-probability">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">{t("High")}</SelectItem>
                        <SelectItem value="medium">{t("Medium")}</SelectItem>
                        <SelectItem value="low">{t("Low")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="view-impact">{t("Impact")}</Label>
                    <Select defaultValue={currentRisk.impact}>
                      <SelectTrigger id="view-impact">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">{t("High")}</SelectItem>
                        <SelectItem value="medium">{t("Medium")}</SelectItem>
                        <SelectItem value="low">{t("Low")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Label htmlFor="view-status">{t("Status")}</Label>
                    <Select defaultValue={currentRisk.status}>
                      <SelectTrigger id="view-status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">{t("Active")}</SelectItem>
                        <SelectItem value="mitigated">
                          {t("Mitigated")}
                        </SelectItem>
                        <SelectItem value="occurred">
                          {t("Occurred")}
                        </SelectItem>
                        <SelectItem value="closed">{t("Closed")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="view-mitigation">
                    {t("Mitigation Plan")}
                  </Label>
                  <Textarea
                    id="view-mitigation"
                    defaultValue={currentRisk.mitigationPlan}
                    rows={2}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Label htmlFor="view-contingency">
                    {t("Contingency Plan")}
                  </Label>
                  <Textarea
                    id="view-contingency"
                    defaultValue={currentRisk.contingencyPlan}
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
                  <div>
                    {t("Created")}:{" "}
                    {new Date(currentRisk.createdAt).toLocaleDateString()}
                  </div>
                  <div>
                    {t("Last Updated")}:{" "}
                    {new Date(currentRisk.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsViewDialogOpen(false)}
              >
                {t("Cancel")}
              </Button>
              <Button onClick={() => setIsViewDialogOpen(false)}>
                {t("Save Changes")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default ProgramRisks;
