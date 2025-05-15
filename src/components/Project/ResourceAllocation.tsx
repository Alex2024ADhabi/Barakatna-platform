import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Plus, Users, Calendar, Clock } from "lucide-react";
import { projectApi } from "@/lib/api/project/projectApi";
import { useTranslatedDirection } from "@/hooks/useTranslatedDirection";

interface ResourceAllocationProps {
  projectId?: number;
}

const ResourceAllocation: React.FC<ResourceAllocationProps> = ({
  projectId,
}) => {
  const { t } = useTranslation();
  const { directionClass } = useTranslatedDirection();
  const [resources, setResources] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddResourceDialogOpen, setIsAddResourceDialogOpen] = useState(false);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        setIsLoading(true);
        // In a real implementation, this would call an API
        // For now, we'll use mock data

        // Mock data for resources
        const mockResources = [
          {
            id: 1,
            name: "Ahmed Al-Farsi",
            role: "Project Manager",
            allocation: 100,
            startDate: "2023-05-01",
            endDate: "2023-08-30",
            skills: ["Management", "Planning", "Coordination"],
          },
          {
            id: 2,
            name: "Fatima Al-Saud",
            role: "Senior Contractor",
            allocation: 75,
            startDate: "2023-05-15",
            endDate: "2023-07-30",
            skills: ["Construction", "Renovation", "Accessibility"],
          },
          {
            id: 3,
            name: "Mohammed Al-Qahtani",
            role: "Accessibility Specialist",
            allocation: 50,
            startDate: "2023-06-01",
            endDate: "2023-07-15",
            skills: ["Accessibility Standards", "Senior Care", "Assessment"],
          },
          {
            id: 4,
            name: "Layla Ibrahim",
            role: "Interior Designer",
            allocation: 60,
            startDate: "2023-05-20",
            endDate: "2023-06-30",
            skills: ["Design", "Accessibility", "Senior-Friendly Spaces"],
          },
        ];

        setResources(mockResources);
      } catch (error) {
        console.error("Error fetching resources:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchResources();
  }, [projectId]);

  const handleAddResource = () => {
    setIsAddResourceDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${directionClass}`}>
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">
          {t("project.resourceAllocation", "Resource Allocation")}
        </h2>
        <Button onClick={handleAddResource}>
          <Plus className="mr-2 h-4 w-4" />
          {t("project.addResource", "Add Resource")}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {t("project.allocatedResources", "Allocated Resources")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("project.resourceName", "Name")}</TableHead>
                <TableHead>{t("project.role", "Role")}</TableHead>
                <TableHead>{t("project.allocation", "Allocation %")}</TableHead>
                <TableHead>{t("project.period", "Period")}</TableHead>
                <TableHead>{t("project.skills", "Skills")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {resources.map((resource) => (
                <TableRow key={resource.id}>
                  <TableCell className="font-medium">{resource.name}</TableCell>
                  <TableCell>{resource.role}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <div className="w-24 h-2 bg-gray-200 rounded-full mr-2">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${resource.allocation}%` }}
                        />
                      </div>
                      <span>{resource.allocation}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                      {new Date(resource.startDate).toLocaleDateString()} -{" "}
                      {new Date(resource.endDate).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {resource.skills.map((skill: string, index: number) => (
                        <Badge key={index} variant="outline">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            {t("project.resourceUtilization", "Resource Utilization")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Users className="h-5 w-5 mr-2 text-blue-500" />
                <span className="font-medium">
                  {t("project.totalResources", "Total Resources")}:
                </span>
              </div>
              <span className="font-bold">{resources.length}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Clock className="h-5 w-5 mr-2 text-green-500" />
                <span className="font-medium">
                  {t("project.averageAllocation", "Average Allocation")}:
                </span>
              </div>
              <span className="font-bold">
                {Math.round(
                  resources.reduce((sum, r) => sum + r.allocation, 0) /
                    resources.length,
                )}
                %
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Resource Dialog - Placeholder */}
      <Dialog
        open={isAddResourceDialogOpen}
        onOpenChange={setIsAddResourceDialogOpen}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {t("project.addResource", "Add Resource")}
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-muted-foreground">
              {t(
                "project.resourceFormPlaceholder",
                "Resource allocation form would be implemented here.",
              )}
            </p>
          </div>
          <div className="flex justify-end">
            <Button onClick={() => setIsAddResourceDialogOpen(false)}>
              {t("common.close", "Close")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ResourceAllocation;
