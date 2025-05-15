import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Badge } from "../ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Calendar } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { projectApi } from "@/lib/api/project/projectApi";
import { Project, ProjectTask } from "@/lib/api/project/types";
import { useTranslatedDirection } from "@/hooks/useTranslatedDirection";
import { format } from "date-fns";
import {
  Calendar as CalendarIcon,
  Plus,
  User,
  Users,
  Clock,
  CheckCircle,
} from "lucide-react";

interface Resource {
  id: string;
  name: string;
  role: string;
  availability: {
    date: Date;
    hours: number;
    assigned: boolean;
  }[];
}

interface ProjectTimelineProps {
  projectId?: number;
}

const ProjectTimeline: React.FC<ProjectTimelineProps> = ({ projectId }) => {
  const { t } = useTranslation();
  const { directionClass } = useTranslatedDirection();
  const [timelineData, setTimelineData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("timeline");
  const [resources, setResources] = useState<Resource[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date(),
  );
  const [showResourceDialog, setShowResourceDialog] = useState(false);
  const [newResource, setNewResource] = useState<Partial<Resource>>({});
  const [selectedResource, setSelectedResource] = useState<Resource | null>(
    null,
  );
  const [selectedDateRange, setSelectedDateRange] = useState<{
    from: Date;
    to: Date;
  }>({
    from: new Date(),
    to: new Date(new Date().setDate(new Date().getDate() + 14)),
  });

  useEffect(() => {
    const fetchTimelineData = async () => {
      if (!projectId) return;

      try {
        setIsLoading(true);
        const response = await projectApi.getProjectTimeline(projectId);

        if (response.success && response.data) {
          setTimelineData(response.data);
        }
      } catch (error) {
        console.error("Error fetching project timeline:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTimelineData();

    // Mock resource data
    const mockResources: Resource[] = [
      {
        id: "res1",
        name: "Ahmed Al-Farsi",
        role: "Senior Contractor",
        availability: generateMockAvailability(30, 8, 0.7),
      },
      {
        id: "res2",
        name: "Fatima Khalid",
        role: "Accessibility Specialist",
        availability: generateMockAvailability(30, 6, 0.5),
      },
      {
        id: "res3",
        name: "Mohammed Rahman",
        role: "Project Manager",
        availability: generateMockAvailability(30, 4, 0.8),
      },
      {
        id: "res4",
        name: "Layla Mahmoud",
        role: "Interior Designer",
        availability: generateMockAvailability(30, 7, 0.6),
      },
    ];

    setResources(mockResources);
  }, [projectId]);

  // Generate mock availability data for resources
  const generateMockAvailability = (
    days: number,
    hoursPerDay: number,
    assignedProbability: number,
  ) => {
    const availability = [];
    const today = new Date();

    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);

      // Skip weekends (Friday and Saturday in many Middle Eastern countries)
      if (date.getDay() === 5 || date.getDay() === 6) {
        continue;
      }

      availability.push({
        date: new Date(date),
        hours: hoursPerDay,
        assigned: Math.random() < assignedProbability,
      });
    }

    return availability;
  };

  // Add a new resource
  const addResource = () => {
    if (!newResource.name || !newResource.role) return;

    const resource: Resource = {
      id: `res${Date.now()}`,
      name: newResource.name,
      role: newResource.role,
      availability: generateMockAvailability(30, 8, 0.3),
    };

    setResources([...resources, resource]);
    setNewResource({});
    setShowResourceDialog(false);
  };

  // Update resource availability
  const updateResourceAvailability = (
    resourceId: string,
    date: Date,
    hours: number,
    assigned: boolean,
  ) => {
    setResources(
      resources.map((resource) => {
        if (resource.id !== resourceId) return resource;

        return {
          ...resource,
          availability: resource.availability.map((a) => {
            if (a.date.toDateString() !== date.toDateString()) return a;
            return { ...a, hours, assigned };
          }),
        };
      }),
    );
  };

  // Get resource availability for a specific date
  const getResourceAvailabilityForDate = (resource: Resource, date: Date) => {
    return resource.availability.find(
      (a) => a.date.toDateString() === date.toDateString(),
    );
  };

  // Calculate resource utilization
  const calculateResourceUtilization = (resource: Resource) => {
    const totalDays = resource.availability.length;
    const assignedDays = resource.availability.filter((a) => a.assigned).length;
    return totalDays > 0 ? (assignedDays / totalDays) * 100 : 0;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If no timeline data is available, show a placeholder
  if (!timelineData) {
    return (
      <Card className={directionClass}>
        <CardHeader>
          <CardTitle>{t("project.timeline", "Project Timeline")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-10">
            <p className="text-muted-foreground">
              {projectId
                ? t(
                    "project.noTimelineData",
                    "No timeline data available for this project.",
                  )
                : t(
                    "project.selectProject",
                    "Select a project to view its timeline.",
                  )}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Mock timeline data for visualization
  const mockTimelineData = {
    startDate: new Date("2023-01-01"),
    endDate: new Date("2023-06-30"),
    milestones: [
      {
        name: "Project Initiation",
        date: new Date("2023-01-15"),
        completed: true,
      },
      {
        name: "Assessment Phase",
        date: new Date("2023-02-15"),
        completed: true,
      },
      { name: "Design Phase", date: new Date("2023-03-15"), completed: false },
      {
        name: "Implementation",
        date: new Date("2023-04-15"),
        completed: false,
      },
      { name: "Testing", date: new Date("2023-05-15"), completed: false },
      {
        name: "Project Completion",
        date: new Date("2023-06-15"),
        completed: false,
      },
    ],
    tasks: [
      {
        name: "Initial Assessment",
        startDate: new Date("2023-01-05"),
        endDate: new Date("2023-01-20"),
        completed: true,
      },
      {
        name: "Client Requirements",
        startDate: new Date("2023-01-21"),
        endDate: new Date("2023-02-10"),
        completed: true,
      },
      {
        name: "Design Planning",
        startDate: new Date("2023-02-11"),
        endDate: new Date("2023-03-10"),
        completed: true,
      },
      {
        name: "Material Procurement",
        startDate: new Date("2023-03-11"),
        endDate: new Date("2023-03-25"),
        completed: false,
      },
      {
        name: "Construction Phase 1",
        startDate: new Date("2023-03-26"),
        endDate: new Date("2023-04-15"),
        completed: false,
      },
      {
        name: "Construction Phase 2",
        startDate: new Date("2023-04-16"),
        endDate: new Date("2023-05-05"),
        completed: false,
      },
      {
        name: "Quality Assurance",
        startDate: new Date("2023-05-06"),
        endDate: new Date("2023-05-20"),
        completed: false,
      },
      {
        name: "Final Inspection",
        startDate: new Date("2023-05-21"),
        endDate: new Date("2023-06-05"),
        completed: false,
      },
      {
        name: "Project Handover",
        startDate: new Date("2023-06-06"),
        endDate: new Date("2023-06-15"),
        completed: false,
      },
    ],
  };

  // Calculate the total duration in days
  const totalDays = Math.ceil(
    (mockTimelineData.endDate.getTime() -
      mockTimelineData.startDate.getTime()) /
      (1000 * 60 * 60 * 24),
  );

  // Function to calculate position and width for timeline items
  const getTimelineItemStyle = (startDate: Date, endDate: Date) => {
    const startDiff = Math.ceil(
      (startDate.getTime() - mockTimelineData.startDate.getTime()) /
        (1000 * 60 * 60 * 24),
    );
    const duration = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    const leftPosition = (startDiff / totalDays) * 100;
    const width = (duration / totalDays) * 100;

    return {
      left: `${leftPosition}%`,
      width: `${width}%`,
    };
  };

  // Function to calculate position for milestones
  const getMilestonePosition = (date: Date) => {
    const daysDiff = Math.ceil(
      (date.getTime() - mockTimelineData.startDate.getTime()) /
        (1000 * 60 * 60 * 24),
    );

    return {
      left: `${(daysDiff / totalDays) * 100}%`,
    };
  };

  return (
    <Card className={directionClass}>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>{t("project.timeline", "Project Timeline")}</CardTitle>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-[400px]"
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="timeline">
                {t("project.timeline", "Timeline")}
              </TabsTrigger>
              <TabsTrigger value="resources">
                {t("project.resources", "Resources")}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        <TabsContent value="timeline" className="mt-0">
          <div className="space-y-8">
            {/* Timeline header with months */}
            <div className="relative h-10 border-b border-gray-200">
              {Array.from({ length: 6 }).map((_, index) => {
                const date = new Date(mockTimelineData.startDate);
                date.setMonth(date.getMonth() + index);
                return (
                  <div
                    key={index}
                    className="absolute text-xs text-muted-foreground"
                    style={{ left: `${(index / 6) * 100}%` }}
                  >
                    {date.toLocaleDateString(undefined, {
                      month: "short",
                      year: "numeric",
                    })}
                  </div>
                );
              })}
            </div>

            {/* Milestones */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium">
                {t("project.milestones", "Milestones")}
              </h3>
              <div className="relative h-12 border-b border-gray-200">
                {mockTimelineData.milestones.map(
                  (milestone: any, index: number) => (
                    <div
                      key={index}
                      className="absolute -top-1"
                      style={getMilestonePosition(milestone.date)}
                    >
                      <div
                        className={`h-4 w-4 rounded-full ${milestone.completed ? "bg-green-500" : "bg-blue-500"}`}
                        title={`${milestone.name}: ${milestone.date.toLocaleDateString()}`}
                      />
                      <div className="absolute -left-10 w-20 text-xs text-center mt-1">
                        {milestone.name}
                      </div>
                    </div>
                  ),
                )}
              </div>
            </div>

            {/* Tasks */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium">
                {t("project.tasks", "Tasks")}
              </h3>
              <div className="space-y-2">
                {mockTimelineData.tasks.map((task: any, index: number) => (
                  <div key={index} className="relative h-8">
                    <div className="absolute left-0 w-1/4 text-xs truncate pr-2">
                      {task.name}
                    </div>
                    <div className="absolute left-1/4 right-0 h-full">
                      <div
                        className={`absolute h-4 rounded-sm ${task.completed ? "bg-green-500" : "bg-blue-500"}`}
                        style={getTimelineItemStyle(
                          task.startDate,
                          task.endDate,
                        )}
                        title={`${task.name}: ${task.startDate.toLocaleDateString()} - ${task.endDate.toLocaleDateString()}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="resources" className="mt-0">
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">
                {t(
                  "project.resourceAvailability",
                  "Resource Availability Calendar",
                )}
              </h3>
              <div className="flex space-x-2">
                <Dialog
                  open={showResourceDialog}
                  onOpenChange={setShowResourceDialog}
                >
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      {t("project.addResource", "Add Resource")}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {t("project.addNewResource", "Add New Resource")}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <label htmlFor="name">
                          {t("project.resourceName", "Resource Name")}
                        </label>
                        <Input
                          id="name"
                          value={newResource.name || ""}
                          onChange={(e) =>
                            setNewResource({
                              ...newResource,
                              name: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="grid gap-2">
                        <label htmlFor="role">
                          {t("project.resourceRole", "Role")}
                        </label>
                        <Input
                          id="role"
                          value={newResource.role || ""}
                          onChange={(e) =>
                            setNewResource({
                              ...newResource,
                              role: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={addResource}>
                        {t("common.add", "Add")}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-[240px] justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDateRange?.from ? (
                        selectedDateRange.to ? (
                          <>
                            {format(selectedDateRange.from, "LLL dd, y")} -{" "}
                            {format(selectedDateRange.to, "LLL dd, y")}
                          </>
                        ) : (
                          format(selectedDateRange.from, "LLL dd, y")
                        )
                      ) : (
                        <span>
                          {t("project.selectDateRange", "Select date range")}
                        </span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={selectedDateRange?.from}
                      selected={selectedDateRange}
                      onSelect={(range) => {
                        if (range?.from && range?.to) {
                          setSelectedDateRange(
                            range as { from: Date; to: Date },
                          );
                        }
                      }}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <div className="grid grid-cols-[200px_1fr] divide-x">
                {/* Resource names column */}
                <div className="bg-muted/20">
                  <div className="h-12 border-b flex items-center px-4 font-medium">
                    {t("project.resources", "Resources")}
                  </div>
                  {resources.map((resource) => (
                    <div
                      key={resource.id}
                      className="h-16 border-b flex items-center px-4 hover:bg-muted/30 cursor-pointer"
                      onClick={() => setSelectedResource(resource)}
                    >
                      <div>
                        <div className="font-medium">{resource.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {resource.role}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Calendar grid */}
                <div className="overflow-x-auto">
                  <div className="min-w-[800px]">
                    {/* Date headers */}
                    <div className="grid grid-cols-7 h-12 border-b">
                      {Array.from({ length: 7 }).map((_, i) => {
                        const date = new Date(selectedDateRange.from);
                        date.setDate(date.getDate() + i);
                        return (
                          <div
                            key={i}
                            className="flex flex-col items-center justify-center border-r last:border-r-0"
                          >
                            <div className="text-xs font-medium">
                              {format(date, "EEE")}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {format(date, "MMM d")}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Resource availability rows */}
                    {resources.map((resource) => {
                      const utilization =
                        calculateResourceUtilization(resource);
                      return (
                        <div
                          key={resource.id}
                          className={`grid grid-cols-7 h-16 border-b ${selectedResource?.id === resource.id ? "bg-muted/20" : ""}`}
                        >
                          {Array.from({ length: 7 }).map((_, i) => {
                            const date = new Date(selectedDateRange.from);
                            date.setDate(date.getDate() + i);
                            const availability = getResourceAvailabilityForDate(
                              resource,
                              date,
                            );

                            return (
                              <div
                                key={i}
                                className="p-1 border-r last:border-r-0 relative"
                                onClick={() => {
                                  if (availability) {
                                    updateResourceAvailability(
                                      resource.id,
                                      date,
                                      availability.hours,
                                      !availability.assigned,
                                    );
                                  }
                                }}
                              >
                                {availability ? (
                                  <div
                                    className={`h-full rounded p-1 flex flex-col justify-between ${availability.assigned ? "bg-blue-100" : "bg-gray-100"}`}
                                  >
                                    <div className="flex justify-between items-center">
                                      <span className="text-xs font-medium">
                                        {availability.assigned
                                          ? "Assigned"
                                          : "Available"}
                                      </span>
                                      {availability.assigned && (
                                        <CheckCircle className="h-3 w-3 text-blue-600" />
                                      )}
                                    </div>
                                    <div className="flex items-center text-xs text-muted-foreground">
                                      <Clock className="h-3 w-3 mr-1" />
                                      {availability.hours}h
                                    </div>
                                  </div>
                                ) : (
                                  <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                                    N/A
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Resource utilization section */}
            <div className="mt-8">
              <h3 className="text-lg font-medium mb-4">
                {t("project.resourceUtilization", "Resource Utilization")}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {resources.map((resource) => {
                  const utilization = calculateResourceUtilization(resource);
                  return (
                    <Card key={resource.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-center mb-2">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                            <User className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-medium">{resource.name}</h4>
                            <p className="text-xs text-muted-foreground">
                              {resource.role}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4">
                          <div className="flex justify-between mb-1">
                            <span className="text-sm">
                              {t("project.utilization", "Utilization")}
                            </span>
                            <span className="text-sm font-medium">
                              {Math.round(utilization)}%
                            </span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2.5">
                            <div
                              className="bg-primary h-2.5 rounded-full"
                              style={{ width: `${utilization}%` }}
                            ></div>
                          </div>
                        </div>

                        <div className="mt-4 flex justify-between text-xs text-muted-foreground">
                          <div className="flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            <span>
                              {resource.availability.reduce(
                                (sum, a) => sum + a.hours,
                                0,
                              )}{" "}
                              hours total
                            </span>
                          </div>
                          <div className="flex items-center">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            <span>
                              {
                                resource.availability.filter((a) => a.assigned)
                                  .length
                              }{" "}
                              days assigned
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        </TabsContent>
      </CardContent>
    </Card>
  );
};

export default ProjectTimeline;
