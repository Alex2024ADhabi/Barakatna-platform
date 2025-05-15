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
import { ResourceAllocation, ManpowerResource } from "@/lib/api/manpower/types";
import { manpowerApi } from "@/lib/api/manpower/manpowerApi";
import { Calendar, Plus } from "lucide-react";
import { SelectField } from "@/components/ui/form-components";

const ResourceAllocationComponent = () => {
  const { t } = useTranslation();
  const dir = useTranslatedDirection();
  const [allocations, setAllocations] = useState<ResourceAllocation[]>([]);
  const [resources, setResources] = useState<ManpowerResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [allocationsData, resourcesData] = await Promise.all([
          manpowerApi.getAllocations(),
          manpowerApi.getResources(),
        ]);
        setAllocations(allocationsData);
        setResources(resourcesData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Get unique project IDs from allocations
  const projects = [
    ...new Set(allocations.map((allocation) => allocation.projectId)),
  ];
  const projectOptions = projects.map((project) => ({
    value: project,
    label: `Project ${project}`,
  }));
  projectOptions.unshift({ value: "", label: t("manpower.allProjects") });

  // Filter allocations by selected project
  const filteredAllocations = selectedProject
    ? allocations.filter(
        (allocation) => allocation.projectId === selectedProject,
      )
    : allocations;

  // Get resource name by ID
  const getResourceName = (resourceId: string) => {
    const resource = resources.find((r) => r.id === resourceId);
    return resource ? resource.name : resourceId;
  };

  // Format date
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{t("manpower.resourceAllocation")}</CardTitle>
            <CardDescription>
              {t("manpower.resourceAllocationDescription")}
            </CardDescription>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> {t("manpower.allocateResource")}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <SelectField
            label={t("manpower.filterByProject")}
            value={selectedProject}
            onChange={setSelectedProject}
            options={projectOptions}
          />
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("manpower.resource")}</TableHead>
                <TableHead>{t("manpower.project")}</TableHead>
                <TableHead>{t("manpower.role")}</TableHead>
                <TableHead>{t("manpower.period")}</TableHead>
                <TableHead>{t("manpower.allocation")}</TableHead>
                <TableHead>{t("manpower.status")}</TableHead>
                <TableHead className="text-right">
                  {t("common.actions")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
                    {t("common.loading")}
                  </TableCell>
                </TableRow>
              ) : filteredAllocations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
                    {t("common.noResults")}
                  </TableCell>
                </TableRow>
              ) : (
                filteredAllocations.map((allocation) => (
                  <TableRow key={allocation.id}>
                    <TableCell className="font-medium">
                      {getResourceName(allocation.resourceId)}
                    </TableCell>
                    <TableCell>Project {allocation.projectId}</TableCell>
                    <TableCell>{allocation.role}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                        {formatDate(allocation.startDate)} -{" "}
                        {formatDate(allocation.endDate)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                          <div
                            className="h-2.5 rounded-full bg-blue-500"
                            style={{
                              width: `${allocation.allocationPercentage}%`,
                            }}
                          ></div>
                        </div>
                        <span className="text-xs">
                          {allocation.allocationPercentage}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          allocation.status === "active"
                            ? "default"
                            : allocation.status === "planned"
                              ? "outline"
                              : "secondary"
                        }
                      >
                        {allocation.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm">
                        {t("common.edit")}
                      </Button>
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

export default ResourceAllocationComponent;
