import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Filter,
  Calendar,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  PauseCircle,
  XCircle,
  MoreHorizontal,
  ChevronDown,
  ChevronUp,
  FileText,
  Link,
  DollarSign,
} from "lucide-react";
import { useTranslatedDirection } from "@/hooks/useTranslatedDirection";
import { programApi } from "@/lib/api/program/programApi";
import { Program, ProgramFilter } from "@/lib/api/program/types";

interface ProgramListProps {
  onViewDashboard: () => void;
  onViewProgram: (programId: string) => void;
  onCreateProgram: () => void;
}

export default function ProgramList({
  onViewDashboard,
  onViewProgram,
  onCreateProgram,
}: ProgramListProps) {
  const { t } = useTranslation();
  const dir = useTranslatedDirection();
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [priorityFilter, setPriorityFilter] = useState<string>("");
  const [viewMode, setViewMode] = useState<"list" | "grid">("grid");
  const [sortField, setSortField] = useState<string>("updatedAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    fetchPrograms();
  }, [statusFilter, priorityFilter]);

  const fetchPrograms = async () => {
    setLoading(true);
    try {
      const filter: ProgramFilter = {};

      if (statusFilter) {
        filter.status = [statusFilter as any];
      }

      if (priorityFilter) {
        filter.priority = [priorityFilter as any];
      }

      const response = await programApi.getPrograms(filter);
      setPrograms(response);
    } catch (error) {
      console.error("Error fetching programs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedPrograms = [...programs].sort((a, b) => {
    let comparison = 0;

    switch (sortField) {
      case "name":
        comparison = a.name.localeCompare(b.name);
        break;
      case "status":
        comparison = a.status.localeCompare(b.status);
        break;
      case "priority":
        comparison = a.priority.localeCompare(b.priority);
        break;
      case "startDate":
        comparison =
          new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
        break;
      case "endDate":
        comparison =
          new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
        break;
      case "budget":
        comparison = a.budget - b.budget;
        break;
      case "updatedAt":
      default:
        comparison =
          new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
        break;
    }

    return sortDirection === "asc" ? comparison : -comparison;
  });

  const filteredPrograms = sortedPrograms.filter((program) => {
    const matchesSearch = searchTerm
      ? program.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        program.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        program.programNumber.toLowerCase().includes(searchTerm.toLowerCase())
      : true;

    return matchesSearch;
  });

  const getStatusColor = (status: Program["status"]) => {
    switch (status) {
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

  const getPriorityColor = (priority: Program["priority"]) => {
    switch (priority) {
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

  const getStatusIcon = (status: Program["status"]) => {
    switch (status) {
      case "planning":
        return <Clock className="h-5 w-5 text-blue-600" />;
      case "active":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "on-hold":
        return <PauseCircle className="h-5 w-5 text-yellow-600" />;
      case "completed":
        return <CheckCircle className="h-5 w-5 text-purple-600" />;
      case "cancelled":
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-600" />;
    }
  };

  const getSortIcon = (field: string) => {
    if (sortField !== field) return null;
    return sortDirection === "asc" ? (
      <ChevronUp className="h-4 w-4 ml-1" />
    ) : (
      <ChevronDown className="h-4 w-4 ml-1" />
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-700"></div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow" dir={dir}>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <Button variant="ghost" onClick={onViewDashboard} className="mr-2">
            <ChevronDown className="h-4 w-4 mr-2 rotate-90" />
            {t("Dashboard")}
          </Button>
          <h1 className="text-2xl font-bold">{t("Program List")}</h1>
        </div>
        <Button onClick={onCreateProgram}>
          <Plus className="mr-2 h-4 w-4" />
          {t("New Program")}
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("Search programs...")}
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t("Filter by status")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">{t("All Statuses")}</SelectItem>
              <SelectItem value="planning">{t("Planning")}</SelectItem>
              <SelectItem value="active">{t("Active")}</SelectItem>
              <SelectItem value="on-hold">{t("On Hold")}</SelectItem>
              <SelectItem value="completed">{t("Completed")}</SelectItem>
              <SelectItem value="cancelled">{t("Cancelled")}</SelectItem>
            </SelectContent>
          </Select>

          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={t("Filter by priority")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">{t("All Priorities")}</SelectItem>
              <SelectItem value="low">{t("Low")}</SelectItem>
              <SelectItem value="medium">{t("Medium")}</SelectItem>
              <SelectItem value="high">{t("High")}</SelectItem>
              <SelectItem value="critical">{t("Critical")}</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex border rounded-md">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              className="rounded-r-none"
              onClick={() => setViewMode("grid")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
              </svg>
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              className="rounded-l-none"
              onClick={() => setViewMode("list")}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="8" y1="6" x2="21" y2="6" />
                <line x1="8" y1="12" x2="21" y2="12" />
                <line x1="8" y1="18" x2="21" y2="18" />
                <line x1="3" y1="6" x2="3.01" y2="6" />
                <line x1="3" y1="12" x2="3.01" y2="12" />
                <line x1="3" y1="18" x2="3.01" y2="18" />
              </svg>
            </Button>
          </div>
        </div>
      </div>

      {filteredPrograms.length === 0 ? (
        <div className="text-center p-8 border rounded-md">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            {t("No Programs Found")}
          </h3>
          <p className="text-gray-500">
            {t(
              "No programs match your current filters. Try adjusting your search criteria.",
            )}
          </p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPrograms.map((program) => (
            <Card key={program.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between">
                  <Badge className={getStatusColor(program.status)}>
                    {t(
                      program.status.charAt(0).toUpperCase() +
                        program.status.slice(1),
                    )}
                  </Badge>
                  <Badge className={getPriorityColor(program.priority)}>
                    {t(
                      program.priority.charAt(0).toUpperCase() +
                        program.priority.slice(1),
                    )}
                  </Badge>
                </div>
                <CardTitle className="mt-2">{program.name}</CardTitle>
                <div className="text-sm text-gray-500">
                  {program.programNumber}
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-600 line-clamp-2 mb-4">
                  {program.description}
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-gray-500 mr-1" />
                      <span>{t("Start")}:</span>
                    </div>
                    <span>
                      {new Date(program.startDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 text-gray-500 mr-1" />
                      <span>{t("End")}:</span>
                    </div>
                    <span>
                      {new Date(program.endDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <div className="flex items-center">
                      <DollarSign className="h-4 w-4 text-gray-500 mr-1" />
                      <span>{t("Budget")}:</span>
                    </div>
                    <span>{program.budget.toLocaleString()} SAR</span>
                  </div>
                  <div className="flex justify-between">
                    <div className="flex items-center">
                      <Link className="h-4 w-4 text-gray-500 mr-1" />
                      <span>{t("Projects")}:</span>
                    </div>
                    <span>{program.projects?.length || 0}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mt-4">
                  {program.tags?.slice(0, 3).map((tag, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="bg-gray-100"
                    >
                      {tag}
                    </Badge>
                  ))}
                  {(program.tags?.length || 0) > 3 && (
                    <Badge variant="outline" className="bg-gray-100">
                      +{program.tags!.length - 3}
                    </Badge>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    {t("Updated")}:{" "}
                    {new Date(program.updatedAt).toLocaleDateString()}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onViewProgram(program.id)}
                  >
                    {t("View")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("name")}
                >
                  <div className="flex items-center">
                    {t("Name")}
                    {getSortIcon("name")}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("status")}
                >
                  <div className="flex items-center">
                    {t("Status")}
                    {getSortIcon("status")}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("priority")}
                >
                  <div className="flex items-center">
                    {t("Priority")}
                    {getSortIcon("priority")}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("startDate")}
                >
                  <div className="flex items-center">
                    {t("Start Date")}
                    {getSortIcon("startDate")}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("endDate")}
                >
                  <div className="flex items-center">
                    {t("End Date")}
                    {getSortIcon("endDate")}
                  </div>
                </TableHead>
                <TableHead
                  className="cursor-pointer"
                  onClick={() => handleSort("budget")}
                >
                  <div className="flex items-center">
                    {t("Budget")}
                    {getSortIcon("budget")}
                  </div>
                </TableHead>
                <TableHead className="text-right">{t("Actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPrograms.map((program) => (
                <TableRow key={program.id}>
                  <TableCell>
                    <div className="font-medium">{program.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {program.programNumber}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(program.status)}>
                      {t(
                        program.status.charAt(0).toUpperCase() +
                          program.status.slice(1),
                      )}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getPriorityColor(program.priority)}>
                      {t(
                        program.priority.charAt(0).toUpperCase() +
                          program.priority.slice(1),
                      )}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(program.startDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {new Date(program.endDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{program.budget.toLocaleString()} SAR</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewProgram(program.id)}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
