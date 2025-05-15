import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Calendar,
  Clock,
  User,
  FileText,
  Link,
  DollarSign,
  Target,
  AlertTriangle,
  CheckCircle,
  PauseCircle,
  XCircle,
  Edit,
  Trash2,
  Plus,
  Users,
  BarChart2,
} from "lucide-react";
import { useTranslatedDirection } from "@/hooks/useTranslatedDirection";
import { programApi } from "@/lib/api/program/programApi";
import {
  Program,
  ProgramOutcome,
  ProgramRisk,
  ProgramStakeholder,
  ProgramBudgetAllocation,
} from "@/lib/api/program/types";

interface ProgramDetailProps {
  programId: string;
  onBack: () => void;
}

interface ProgramDetailProps {
  programId: string;
  onBack: () => void;
  onEdit?: (programId: string) => void;
  onDelete?: (programId: string) => void;
}

export const ProgramDetail: React.FC<ProgramDetailProps> = ({
  programId,
  onBack,
  onEdit,
  onDelete,
}) => {
  const { t } = useTranslation();
  const dir = useTranslatedDirection();
  const [program, setProgram] = useState<Program | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [outcomes, setOutcomes] = useState<ProgramOutcome[]>([]);
  const [risks, setRisks] = useState<ProgramRisk[]>([]);
  const [stakeholders, setStakeholders] = useState<ProgramStakeholder[]>([]);
  const [budgetAllocations, setBudgetAllocations] = useState<
    ProgramBudgetAllocation[]
  >([]);

  useEffect(() => {
    const fetchProgramData = async () => {
      setLoading(true);
      try {
        const programData = await programApi.getProgramById(programId);
        setProgram(programData);

        // In a real application, these would be separate API calls
        // For now, we'll use mock data from the program itself
        if (programData) {
          // Mock outcomes data
          setOutcomes([
            {
              id: "outcome-1",
              programId: programId,
              name: "Improve accessibility in homes",
              description:
                "Increase the number of homes with improved accessibility features",
              targetValue: 500,
              currentValue: 230,
              unit: "homes",
              dueDate: programData.endDate,
              status: "in-progress",
            },
            {
              id: "outcome-2",
              programId: programId,
              name: "Reduce fall incidents",
              description: "Reduce the number of fall incidents among seniors",
              targetValue: 30,
              currentValue: 15,
              unit: "%",
              dueDate: programData.endDate,
              status: "in-progress",
            },
          ]);

          // Mock risks data
          setRisks([
            {
              id: "risk-1",
              programId: programId,
              name: "Budget constraints",
              description:
                "Potential budget shortfall due to increased material costs",
              category: "Financial",
              probability: "medium",
              impact: "high",
              severity: "high",
              mitigationPlan: "Secure additional funding or adjust scope",
              contingencyPlan: "Prioritize critical modifications",
              owner: "Finance Manager",
              status: "mitigating",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            {
              id: "risk-2",
              programId: programId,
              name: "Resource availability",
              description:
                "Shortage of skilled contractors for specialized modifications",
              category: "Resource",
              probability: "high",
              impact: "medium",
              severity: "medium",
              mitigationPlan: "Early contractor engagement and training",
              contingencyPlan:
                "Develop contractor pool from neighboring regions",
              owner: "Resource Manager",
              status: "monitoring",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ]);

          // Mock stakeholders data
          setStakeholders([
            {
              id: "stakeholder-1",
              programId: programId,
              userId: "user123",
              role: "Program Manager",
              responsibilities: "Overall program management and reporting",
              engagementLevel: "high",
              contactFrequency: "weekly",
              notes: "Primary decision maker for program execution",
            },
            {
              id: "stakeholder-2",
              programId: programId,
              userId: "user456",
              role: "Financial Officer",
              responsibilities: "Budget management and financial reporting",
              engagementLevel: "medium",
              contactFrequency: "monthly",
              notes: "Approves all budget allocations and changes",
            },
            {
              id: "stakeholder-3",
              programId: programId,
              userId: "user789",
              role: "Community Representative",
              responsibilities: "Community liaison and feedback collection",
              engagementLevel: "medium",
              contactFrequency: "monthly",
              notes: "Represents beneficiary interests",
            },
          ]);

          // Mock budget allocations
          setBudgetAllocations([
            {
              id: "budget-1",
              programId: programId,
              category: "Materials",
              amount: programData.budget * 0.4,
              description: "Construction materials for home modifications",
              status: "allocated",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            {
              id: "budget-2",
              programId: programId,
              category: "Labor",
              amount: programData.budget * 0.35,
              description: "Contractor and labor costs",
              status: "allocated",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            {
              id: "budget-3",
              programId: programId,
              category: "Equipment",
              amount: programData.budget * 0.15,
              description: "Specialized equipment and tools",
              status: "allocated",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            {
              id: "budget-4",
              programId: programId,
              category: "Administration",
              amount: programData.budget * 0.1,
              description: "Program management and administrative costs",
              status: "allocated",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ]);
        }
      } catch (error) {
        console.error("Error fetching program details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProgramData();
  }, [programId]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "planning":
        return "bg-blue-100 text-blue-800";
      case "active":
        return "bg-green-100 text-green-800";
      case "on-hold":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-purple-100 text-purple-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "low":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-blue-100 text-blue-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "critical":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getOutcomeStatusColor = (status: string) => {
    switch (status) {
      case "achieved":
        return "bg-green-100 text-green-800";
      case "in-progress":
        return "bg-blue-100 text-blue-800";
      case "at-risk":
        return "bg-orange-100 text-orange-800";
      case "missed":
        return "bg-red-100 text-red-800";
      case "not-started":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRiskSeverityColor = (severity: string) => {
    switch (severity) {
      case "low":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "critical":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRiskStatusIcon = (status: string) => {
    switch (status) {
      case "identified":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case "analyzing":
        return <Clock className="h-4 w-4 text-blue-600" />;
      case "mitigating":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "monitoring":
        return <PauseCircle className="h-4 w-4 text-purple-600" />;
      case "closed":
        return <XCircle className="h-4 w-4 text-gray-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
      </div>
    );
  }

  if (!program) {
    return (
      <div className="bg-white p-4 rounded-lg shadow" dir={dir}>
        <div className="flex items-center mb-4">
          <Button variant="outline" onClick={onBack} className="mr-2">
            {t("Back")}
          </Button>
          <h1 className="text-2xl font-bold">{t("Program Not Found")}</h1>
        </div>
        <p>{t("The requested program could not be found.")}</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow" dir={dir}>
      <div className="flex items-center mb-4">
        <Button variant="outline" onClick={onBack} className="mr-2">
          {t("Back to Programs")}
        </Button>
        <h1 className="text-2xl font-bold">{program.name}</h1>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <Badge className={getStatusColor(program.status)}>
          {t(program.status.charAt(0).toUpperCase() + program.status.slice(1))}
        </Badge>
        <Badge className={getPriorityColor(program.priority)}>
          {t(
            program.priority.charAt(0).toUpperCase() +
              program.priority.slice(1),
          )}
        </Badge>
        <Badge variant="outline">{program.programNumber}</Badge>
      </div>

      <p className="text-gray-600 mb-6">{program.description}</p>

      <Tabs
        defaultValue="overview"
        className="w-full"
        onValueChange={setActiveTab}
      >
        <TabsList className="grid grid-cols-6 mb-4">
          <TabsTrigger value="overview">{t("Overview")}</TabsTrigger>
          <TabsTrigger value="projects">{t("Projects")}</TabsTrigger>
          <TabsTrigger value="outcomes">{t("Outcomes")}</TabsTrigger>
          <TabsTrigger value="budget">{t("Budget")}</TabsTrigger>
          <TabsTrigger value="stakeholders">{t("Stakeholders")}</TabsTrigger>
          <TabsTrigger value="risks">{t("Risks")}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("Program Details")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">
                      {t("Start Date")}
                    </div>
                    <div className="font-medium">
                      {new Date(program.startDate).toLocaleDateString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">
                      {t("End Date")}
                    </div>
                    <div className="font-medium">
                      {new Date(program.endDate).toLocaleDateString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">
                      {t("Manager")}
                    </div>
                    <div className="font-medium">{program.managerId}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">
                      {t("Created")}
                    </div>
                    <div className="font-medium">
                      {new Date(program.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">
                      {t("Last Updated")}
                    </div>
                    <div className="font-medium">
                      {new Date(program.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">
                      {t("Projects")}
                    </div>
                    <div className="font-medium">
                      {program.projects?.length || 0}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-sm text-muted-foreground mb-1">
                    {t("Tags")}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {program.tags?.map((tag, index) => (
                      <Badge key={index} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-sm text-muted-foreground mb-1">
                    {t("Objectives")}
                  </div>
                  <ul className="list-disc list-inside space-y-1">
                    {program.objectives?.map((objective, index) => (
                      <li key={index} className="text-sm">
                        {objective}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("Budget Overview")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">
                      {t("Total Budget")}
                    </div>
                    <div className="font-medium text-xl">
                      {program.budget.toLocaleString()} SAR
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">
                      {t("Spent Budget")}
                    </div>
                    <div className="font-medium text-xl">
                      {program.spentBudget.toLocaleString()} SAR
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm">{t("Budget Utilization")}:</span>
                    <span className="text-sm">
                      {((program.spentBudget / program.budget) * 100).toFixed(
                        1,
                      )}
                      %
                    </span>
                  </div>
                  <Progress
                    value={(program.spentBudget / program.budget) * 100}
                  />
                </div>

                <div>
                  <div className="text-sm text-muted-foreground mb-1">
                    {t("Remaining Budget")}
                  </div>
                  <div className="font-medium text-xl">
                    {program.remainingBudget.toLocaleString()} SAR
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("Quick Actions")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button
                    variant="outline"
                    className="flex flex-col h-24 items-center justify-center"
                  >
                    <Link className="h-5 w-5 mb-2" />
                    {t("Link Projects")}
                  </Button>
                  <Button
                    variant="outline"
                    className="flex flex-col h-24 items-center justify-center"
                  >
                    <Target className="h-5 w-5 mb-2" />
                    {t("Add Outcome")}
                  </Button>
                  <Button
                    variant="outline"
                    className="flex flex-col h-24 items-center justify-center"
                  >
                    <DollarSign className="h-5 w-5 mb-2" />
                    {t("Manage Budget")}
                  </Button>
                  <Button
                    variant="outline"
                    className="flex flex-col h-24 items-center justify-center"
                  >
                    <FileText className="h-5 w-5 mb-2" />
                    {t("Generate Report")}
                  </Button>
                  <Button
                    variant="outline"
                    className="flex flex-col h-24 items-center justify-center"
                  >
                    <Users className="h-5 w-5 mb-2" />
                    {t("Manage Stakeholders")}
                  </Button>
                  <Button
                    variant="outline"
                    className="flex flex-col h-24 items-center justify-center"
                  >
                    <AlertTriangle className="h-5 w-5 mb-2" />
                    {t("Assess Risks")}
                  </Button>
                  <Button
                    variant="outline"
                    className="flex flex-col h-24 items-center justify-center"
                    onClick={() => onEdit && onEdit(programId)}
                  >
                    <Edit className="h-5 w-5 mb-2" />
                    {t("Edit Program")}
                  </Button>
                  <Button
                    variant="outline"
                    className="flex flex-col h-24 items-center justify-center text-red-600"
                    onClick={() => {
                      if (
                        onDelete &&
                        window.confirm(
                          t("Are you sure you want to delete this program?"),
                        )
                      ) {
                        onDelete(programId);
                      }
                    }}
                  >
                    <Trash2 className="h-5 w-5 mb-2" />
                    {t("Delete Program")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="projects" className="mt-0">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{t("Linked Projects")}</CardTitle>
                <CardDescription>
                  {t("Projects associated with this program")}
                </CardDescription>
              </div>
              <Button
                onClick={() => {
                  // This would open a modal for project linking in a real implementation
                  alert(t("Project linking modal would open here"));
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                {t("Link Project")}
              </Button>
            </CardHeader>
            <CardContent>
              {program.projects && program.projects.length > 0 ? (
                <div className="space-y-4">
                  {program.projects.map((projectId) => (
                    <Card key={projectId}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-medium">
                              Project ID: {projectId}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {t("Project details would be displayed here")}
                            </p>
                          </div>
                          <Button variant="outline" size="sm">
                            {t("View Project")}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center p-8 border rounded-md">
                  <Link className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    {t("No Projects Linked")}
                  </h3>
                  <p className="text-gray-500">
                    {t("This program doesn't have any linked projects yet.")}
                  </p>
                  <Button className="mt-4">
                    <Plus className="mr-2 h-4 w-4" />
                    {t("Link Project")}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="outcomes" className="mt-0">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{t("Program Outcomes")}</CardTitle>
                <CardDescription>
                  {t(
                    "Track and manage program outcomes and their achievement rates",
                  )}
                </CardDescription>
              </div>
              <Button
                onClick={() => {
                  // This would open a modal for adding outcomes in a real implementation
                  alert(t("Add outcome modal would open here"));
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                {t("Add Outcome")}
              </Button>
            </CardHeader>
            <CardContent>
              {outcomes.length > 0 ? (
                <div className="space-y-4">
                  {outcomes.map((outcome) => (
                    <Card key={outcome.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">{outcome.name}</h3>
                            <p className="text-sm text-gray-500 mt-1">
                              {outcome.description}
                            </p>
                          </div>
                          <Badge
                            className={getOutcomeStatusColor(outcome.status)}
                          >
                            {t(
                              outcome.status.charAt(0).toUpperCase() +
                                outcome.status.slice(1).replace("-", " "),
                            )}
                          </Badge>
                        </div>

                        <div className="mt-4">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-sm">
                              {t("Progress")}:{" "}
                              {(
                                (outcome.currentValue / outcome.targetValue) *
                                100
                              ).toFixed(1)}
                              %
                            </span>
                            <span className="text-sm">
                              {outcome.currentValue} / {outcome.targetValue}{" "}
                              {outcome.unit}
                            </span>
                          </div>
                          <Progress
                            value={
                              (outcome.currentValue / outcome.targetValue) * 100
                            }
                          />
                        </div>

                        <div className="mt-4 flex justify-between items-center text-sm text-gray-500">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            <span>
                              {t("Due")}:{" "}
                              {new Date(outcome.dueDate).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm">
                              <Edit className="h-3 w-3 mr-1" />
                              {t("Edit")}
                            </Button>
                            <Button variant="outline" size="sm">
                              <BarChart2 className="h-3 w-3 mr-1" />
                              {t("Details")}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center p-8 border rounded-md">
                  <Target className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <h3 className="text-lg font-medium text-gray-900 mb-1">
                    {t("No Outcomes Defined")}
                  </h3>
                  <p className="text-gray-500">
                    {t("Define outcomes to track the success of this program.")}
                  </p>
                  <Button className="mt-4">
                    <Plus className="mr-2 h-4 w-4" />
                    {t("Add Outcome")}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="budget" className="mt-0">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{t("Budget Allocation")}</CardTitle>
                <CardDescription>
                  {t("Manage and track program budget allocations")}
                </CardDescription>
              </div>
              <Button
                onClick={() => {
                  // This would open a modal for adding budget allocations in a real implementation
                  alert(t("Add budget allocation modal would open here"));
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                {t("Add Allocation")}
              </Button>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-sm text-muted-foreground">
                        {t("Total Budget")}
                      </div>
                      <div className="font-medium text-xl">
                        {program.budget.toLocaleString()} SAR
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-sm text-muted-foreground">
                        {t("Spent Budget")}
                      </div>
                      <div className="font-medium text-xl">
                        {program.spentBudget.toLocaleString()} SAR
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-sm text-muted-foreground">
                        {t("Remaining Budget")}
                      </div>
                      <div className="font-medium text-xl">
                        {program.remainingBudget.toLocaleString()} SAR
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("Category")}</TableHead>
                    <TableHead>{t("Description")}</TableHead>
                    <TableHead>{t("Status")}</TableHead>
                    <TableHead className="text-right">{t("Amount")}</TableHead>
                    <TableHead className="text-right">
                      {t("% of Total")}
                    </TableHead>
                    <TableHead className="text-right">{t("Actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {budgetAllocations.map((allocation) => (
                    <TableRow key={allocation.id}>
                      <TableCell className="font-medium">
                        {allocation.category}
                      </TableCell>
                      <TableCell>{allocation.description}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            allocation.status === "allocated"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-green-100 text-green-800"
                          }
                        >
                          {t(
                            allocation.status.charAt(0).toUpperCase() +
                              allocation.status.slice(1),
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {allocation.amount.toLocaleString()} SAR
                      </TableCell>
                      <TableCell className="text-right">
                        {((allocation.amount / program.budget) * 100).toFixed(
                          1,
                        )}
                        %
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" size="sm">
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stakeholders" className="mt-0">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{t("Program Stakeholders")}</CardTitle>
                <CardDescription>
                  {t("Manage stakeholders involved in this program")}
                </CardDescription>
              </div>
              <Button
                onClick={() => {
                  // This would open a modal for adding stakeholders in a real implementation
                  alert(t("Add stakeholder modal would open here"));
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                {t("Add Stakeholder")}
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("Role")}</TableHead>
                    <TableHead>{t("User ID")}</TableHead>
                    <TableHead>{t("Responsibilities")}</TableHead>
                    <TableHead>{t("Engagement")}</TableHead>
                    <TableHead>{t("Contact Frequency")}</TableHead>
                    <TableHead className="text-right">{t("Actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stakeholders.map((stakeholder) => (
                    <TableRow key={stakeholder.id}>
                      <TableCell className="font-medium">
                        {stakeholder.role}
                      </TableCell>
                      <TableCell>{stakeholder.userId}</TableCell>
                      <TableCell>{stakeholder.responsibilities}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            stakeholder.engagementLevel === "high"
                              ? "bg-green-100 text-green-800"
                              : stakeholder.engagementLevel === "medium"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-gray-100 text-gray-800"
                          }
                        >
                          {t(
                            stakeholder.engagementLevel
                              .charAt(0)
                              .toUpperCase() +
                              stakeholder.engagementLevel.slice(1),
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {t(
                          stakeholder.contactFrequency.charAt(0).toUpperCase() +
                            stakeholder.contactFrequency.slice(1),
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" size="sm">
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risks" className="mt-0">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{t("Risk Assessment")}</CardTitle>
                <CardDescription>
                  {t("Identify and manage program risks")}
                </CardDescription>
              </div>
              <Button
                onClick={() => {
                  // This would open a modal for adding risks in a real implementation
                  alert(t("Add risk modal would open here"));
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                {t("Add Risk")}
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {risks.map((risk) => (
                  <Card key={risk.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium flex items-center">
                            {getRiskStatusIcon(risk.status)}
                            <span className="ml-2">{risk.name}</span>
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">
                            {risk.description}
                          </p>
                        </div>
                        <Badge className={getRiskSeverityColor(risk.severity)}>
                          {t(
                            risk.severity.charAt(0).toUpperCase() +
                              risk.severity.slice(1),
                          )}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div>
                          <div className="text-sm text-muted-foreground">
                            {t("Category")}
                          </div>
                          <div className="font-medium">{risk.category}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">
                            {t("Owner")}
                          </div>
                          <div className="font-medium">{risk.owner}</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">
                            {t("Probability")}
                          </div>
                          <div className="font-medium">
                            {t(
                              risk.probability.charAt(0).toUpperCase() +
                                risk.probability.slice(1),
                            )}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">
                            {t("Impact")}
                          </div>
                          <div className="font-medium">
                            {t(
                              risk.impact.charAt(0).toUpperCase() +
                                risk.impact.slice(1),
                            )}
                          </div>
                        </div>
                      </div>

                      <Separator className="my-4" />

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm text-muted-foreground mb-1">
                            {t("Mitigation Plan")}
                          </div>
                          <p className="text-sm">{risk.mitigationPlan}</p>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground mb-1">
                            {t("Contingency Plan")}
                          </div>
                          <p className="text-sm">{risk.contingencyPlan}</p>
                        </div>
                      </div>

                      <div className="mt-4 flex justify-end space-x-2">
                        <Button variant="outline" size="sm">
                          <Edit className="h-3 w-3 mr-1" />
                          {t("Edit")}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600"
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          {t("Delete")}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProgramDetail;
