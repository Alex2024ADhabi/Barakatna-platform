import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Search, Plus, Link, ExternalLink, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Project {
  id: string;
  name: string;
  status: string;
  startDate: string;
  endDate: string;
  budget: number;
  linked: boolean;
}

interface ProgramProjectLinkingProps {
  programId: string;
}

const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-800",
  pending: "bg-yellow-100 text-yellow-800",
  completed: "bg-blue-100 text-blue-800",
  cancelled: "bg-red-100 text-red-800",
};

const ProgramProjectLinking: React.FC<ProgramProjectLinkingProps> = ({
  programId,
}) => {
  const { t } = useTranslation();
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [availableStatuses, setAvailableStatuses] = useState<string[]>([
    "active",
    "pending",
    "completed",
    "cancelled",
  ]);

  // Mock data - in a real app, this would come from an API
  useEffect(() => {
    // Simulate API call
    const mockProjects: Project[] = [
      {
        id: "1",
        name: "Bathroom Modification Project",
        status: "active",
        startDate: "2023-06-01",
        endDate: "2023-08-30",
        budget: 15000,
        linked: true,
      },
      {
        id: "2",
        name: "Kitchen Accessibility Project",
        status: "pending",
        startDate: "2023-07-15",
        endDate: "2023-10-15",
        budget: 22000,
        linked: false,
      },
      {
        id: "3",
        name: "Entrance Ramp Installation",
        status: "completed",
        startDate: "2023-05-01",
        endDate: "2023-05-30",
        budget: 8500,
        linked: true,
      },
      {
        id: "4",
        name: "Bedroom Modification",
        status: "active",
        startDate: "2023-08-01",
        endDate: "2023-09-15",
        budget: 12000,
        linked: false,
      },
      {
        id: "5",
        name: "Outdoor Accessibility",
        status: "cancelled",
        startDate: "2023-04-01",
        endDate: "2023-05-30",
        budget: 18000,
        linked: false,
      },
    ];

    setProjects(mockProjects);
    setFilteredProjects(mockProjects);
  }, []);

  useEffect(() => {
    let result = projects;

    // Apply search filter
    if (searchTerm) {
      result = result.filter((project) =>
        project.name.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Apply status filter
    if (statusFilter.length > 0) {
      result = result.filter((project) =>
        statusFilter.includes(project.status),
      );
    }

    setFilteredProjects(result);
  }, [searchTerm, statusFilter, projects]);

  const toggleProjectLink = (projectId: string) => {
    setProjects(
      projects.map((project) =>
        project.id === projectId
          ? { ...project, linked: !project.linked }
          : project,
      ),
    );
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

  return (
    <Card className="w-full bg-white shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link className="h-5 w-5" />
            {t("Project Linking")}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsDialogOpen(true)}
            className="flex items-center gap-1"
          >
            <Plus className="h-4 w-4" />
            {t("Link Projects")}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder={t("Search projects...")}
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
            {availableStatuses.map((status) => (
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
                <TableHead>{t("Project Name")}</TableHead>
                <TableHead>{t("Status")}</TableHead>
                <TableHead>{t("Timeline")}</TableHead>
                <TableHead>{t("Budget")}</TableHead>
                <TableHead className="text-right">{t("Actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProjects.length > 0 ? (
                filteredProjects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell className="font-medium">
                      {project.name}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={`${statusColors[project.status]} capitalize`}
                      >
                        {t(project.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-gray-500">
                        {new Date(project.startDate).toLocaleDateString()} -{" "}
                        {new Date(project.endDate).toLocaleDateString()}
                      </span>
                    </TableCell>
                    <TableCell>{formatCurrency(project.budget)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant={project.linked ? "destructive" : "default"}
                          size="sm"
                          onClick={() => toggleProjectLink(project.id)}
                        >
                          {project.linked ? t("Unlink") : t("Link")}
                        </Button>
                        <Button variant="outline" size="sm">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-4 text-gray-500"
                  >
                    {t("No projects found matching your criteria")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{t("Link Projects to Program")}</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <div className="mb-4">
                <Input
                  placeholder={t("Search projects to link...")}
                  className="w-full"
                />
              </div>
              <div className="max-h-[300px] overflow-y-auto border rounded-md">
                {projects
                  .filter((p) => !p.linked)
                  .map((project) => (
                    <div
                      key={project.id}
                      className="flex items-center justify-between p-3 border-b last:border-b-0"
                    >
                      <div className="flex items-center gap-2">
                        <Checkbox id={`project-${project.id}`} />
                        <label
                          htmlFor={`project-${project.id}`}
                          className="text-sm font-medium"
                        >
                          {project.name}
                        </label>
                      </div>
                      <Badge
                        variant="secondary"
                        className={`${statusColors[project.status]} capitalize`}
                      >
                        {t(project.status)}
                      </Badge>
                    </div>
                  ))}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                {t("Cancel")}
              </Button>
              <Button onClick={() => setIsDialogOpen(false)}>
                {t("Link Selected")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default ProgramProjectLinking;
