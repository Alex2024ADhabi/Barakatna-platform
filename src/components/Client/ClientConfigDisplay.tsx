import React, { useState, useEffect } from "react";
import { clientConfigService } from "@/services/clientConfigService";
import type { ClientConfigChangeEvent } from "@/services/clientConfigService";
import { ConfigurationVersion } from "@/lib/services/client/ConfigVersionManager";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

export const ClientConfigDisplay: React.FC = () => {
  const [activeClientTypeId, setActiveClientTypeId] = useState<number | null>(
    null,
  );
  const [configChangeEvents, setConfigChangeEvents] = useState<
    ClientConfigChangeEvent[]
  >([]);
  const [activeConfig, setActiveConfig] = useState<any>(null);
  const [configVersions, setConfigVersions] = useState<ConfigurationVersion[]>(
    [],
  );

  useEffect(() => {
    // Initialize with current active client type
    setActiveClientTypeId(clientConfigService.getActiveClientType());
    setActiveConfig(clientConfigService.getActiveClientConfig());

    // Subscribe to client config changes
    const removeListener = clientConfigService.addChangeListener((event) => {
      setConfigChangeEvents((prev) => [event, ...prev].slice(0, 10)); // Keep last 10 events
      setActiveClientTypeId(clientConfigService.getActiveClientType());
      setActiveConfig(clientConfigService.getActiveClientConfig());

      // If we have a client ID, try to load version history
      if (event.clientTypeId) {
        try {
          // In a real implementation, this would use the lib/services/client/clientConfigService
          // For now, we'll just show mock data
          const mockVersions = [
            {
              id: `version-${Date.now()}-1`,
              clientId: event.clientTypeId.toString(),
              configuration: activeConfig,
              createdAt: new Date(),
              createdBy: "current-user",
              comment: "Configuration updated",
              tags: ["active"],
              isSnapshot: false,
            },
            {
              id: `version-${Date.now()}-2`,
              clientId: event.clientTypeId.toString(),
              configuration: activeConfig,
              createdAt: new Date(Date.now() - 86400000), // 1 day ago
              createdBy: "current-user",
              comment: "Initial configuration",
              tags: ["initial"],
              isSnapshot: false,
            },
          ];
          setConfigVersions(mockVersions);
        } catch (error) {
          console.error("Error loading configuration versions:", error);
        }
      }
    });

    return () => removeListener();
  }, []);

  const getClientTypeName = (clientTypeId: number | null): string => {
    if (clientTypeId === null) return "None";
    switch (clientTypeId) {
      case 1:
        return "Family Development Foundation (FDF)";
      case 2:
        return "Abu Dhabi Housing Authority (ADHA)";
      case 3:
        return "Cash-Based Client";
      default:
        return `Client Type ${clientTypeId}`;
    }
  };

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    }).format(date);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Client Configuration Monitor</CardTitle>
        <CardDescription>
          Displays the current active client type and configuration changes
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="current">
          <TabsList className="mb-4">
            <TabsTrigger value="current">Current Configuration</TabsTrigger>
            <TabsTrigger value="events">Change Events</TabsTrigger>
            <TabsTrigger value="versions">Version History</TabsTrigger>
          </TabsList>

          <TabsContent value="current">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">Active Client Type</h3>
                <div className="flex items-center gap-2">
                  <Badge variant={activeClientTypeId ? "default" : "outline"}>
                    {getClientTypeName(activeClientTypeId)}
                  </Badge>
                </div>
              </div>

              {activeConfig && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium mb-2">
                      General Settings
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="p-3 border rounded-md">
                        <div className="text-sm font-medium">Assessments</div>
                        <div className="text-sm">
                          {activeConfig.general.enableAssessments
                            ? "Enabled"
                            : "Disabled"}
                        </div>
                      </div>
                      <div className="p-3 border rounded-md">
                        <div className="text-sm font-medium">Projects</div>
                        <div className="text-sm">
                          {activeConfig.general.enableProjects
                            ? "Enabled"
                            : "Disabled"}
                        </div>
                      </div>
                      <div className="p-3 border rounded-md">
                        <div className="text-sm font-medium">Financials</div>
                        <div className="text-sm">
                          {activeConfig.general.enableFinancials
                            ? "Enabled"
                            : "Disabled"}
                        </div>
                      </div>
                      <div className="p-3 border rounded-md">
                        <div className="text-sm font-medium">
                          Max Projects Per Beneficiary
                        </div>
                        <div className="text-sm">
                          {activeConfig.general.maxProjectsPerBeneficiary}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">
                      Pricing Settings
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="p-3 border rounded-md">
                        <div className="text-sm font-medium">
                          Custom Price List
                        </div>
                        <div className="text-sm">
                          {activeConfig.pricing.usesCustomPriceList
                            ? "Yes"
                            : "No"}
                        </div>
                      </div>
                      <div className="p-3 border rounded-md">
                        <div className="text-sm font-medium">Price List ID</div>
                        <div className="text-sm">
                          {activeConfig.pricing.priceListId}
                        </div>
                      </div>
                      <div className="p-3 border rounded-md">
                        <div className="text-sm font-medium">Discount</div>
                        <div className="text-sm">
                          {activeConfig.pricing.discountPercentage}%
                        </div>
                      </div>
                      <div className="p-3 border rounded-md">
                        <div className="text-sm font-medium">Tax</div>
                        <div className="text-sm">
                          {activeConfig.pricing.taxPercentage}%
                        </div>
                      </div>
                      <div className="p-3 border rounded-md">
                        <div className="text-sm font-medium">Negotiation</div>
                        <div className="text-sm">
                          {activeConfig.pricing.allowNegotiation
                            ? "Allowed"
                            : "Not Allowed"}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">
                      Workflow Settings
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="p-3 border rounded-md">
                        <div className="text-sm font-medium">
                          Committee Approval
                        </div>
                        <div className="text-sm">
                          {activeConfig.workflow.requiresCommitteeApproval
                            ? "Required"
                            : "Not Required"}
                        </div>
                      </div>
                      <div className="p-3 border rounded-md">
                        <div className="text-sm font-medium">
                          Financial Verification
                        </div>
                        <div className="text-sm">
                          {activeConfig.workflow.skipFinancialVerification
                            ? "Skipped"
                            : "Required"}
                        </div>
                      </div>
                      <div className="p-3 border rounded-md">
                        <div className="text-sm font-medium">
                          Auto Close Projects
                        </div>
                        <div className="text-sm">
                          {activeConfig.workflow.autoCloseProjects
                            ? "Yes"
                            : "No"}
                        </div>
                      </div>
                      <div className="p-3 border rounded-md">
                        <div className="text-sm font-medium">
                          Max Days to Complete
                        </div>
                        <div className="text-sm">
                          {activeConfig.workflow.maxDaysToComplete} days
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {!activeConfig && (
                <div className="p-4 border border-dashed rounded-md text-center text-muted-foreground">
                  No active client configuration. Please select a client type.
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="events">
            <div className="space-y-2">
              <h3 className="text-lg font-medium">
                Recent Configuration Changes
              </h3>
              {configChangeEvents.length > 0 ? (
                <div className="border rounded-md overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="p-2 text-left">Time</th>
                        <th className="p-2 text-left">Client Type</th>
                        <th className="p-2 text-left">Event Type</th>
                      </tr>
                    </thead>
                    <tbody>
                      {configChangeEvents.map((event, index) => (
                        <tr key={index} className="border-t">
                          <td className="p-2">{formatDate(event.timestamp)}</td>
                          <td className="p-2">
                            {getClientTypeName(event.clientTypeId)}
                          </td>
                          <td className="p-2">
                            <Badge
                              variant={
                                event.configType === "active"
                                  ? "default"
                                  : "secondary"
                              }
                            >
                              {event.configType === "active"
                                ? "Set Active"
                                : "Modified"}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-4 border border-dashed rounded-md text-center text-muted-foreground">
                  No configuration changes detected yet.
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="versions">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">
                  Configuration Version History
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!activeClientTypeId}
                >
                  Create Snapshot
                </Button>
              </div>

              {configVersions.length > 0 ? (
                <div className="border rounded-md overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="p-2 text-left">Date</th>
                        <th className="p-2 text-left">Created By</th>
                        <th className="p-2 text-left">Comment</th>
                        <th className="p-2 text-left">Type</th>
                        <th className="p-2 text-left">Tags</th>
                        <th className="p-2 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {configVersions.map((version) => (
                        <tr key={version.id} className="border-t">
                          <td className="p-2">
                            {new Date(version.createdAt).toLocaleDateString()}{" "}
                            {new Date(version.createdAt).toLocaleTimeString()}
                          </td>
                          <td className="p-2">{version.createdBy}</td>
                          <td className="p-2">
                            {version.comment || "No comment"}
                          </td>
                          <td className="p-2">
                            <Badge
                              variant={
                                version.isSnapshot ? "default" : "secondary"
                              }
                            >
                              {version.isSnapshot ? "Snapshot" : "Version"}
                            </Badge>
                          </td>
                          <td className="p-2">
                            {version.tags?.map((tag) => (
                              <Badge
                                key={tag}
                                variant="outline"
                                className="mr-1"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </td>
                          <td className="p-2 text-right">
                            <Button variant="ghost" size="sm" disabled>
                              View
                            </Button>
                            <Button variant="ghost" size="sm" disabled>
                              Restore
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-4 border border-dashed rounded-md text-center text-muted-foreground">
                  No version history available for this client type.
                </div>
              )}

              <div className="mt-4 p-4 bg-muted/20 rounded-md">
                <h4 className="text-sm font-medium mb-2">
                  About Version Control
                </h4>
                <p className="text-sm text-muted-foreground">
                  Configuration versions are automatically saved whenever
                  changes are made. You can create named snapshots for important
                  milestones, compare versions, and restore previous
                  configurations if needed.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-sm text-muted-foreground">
          Client configuration service is{" "}
          {activeClientTypeId ? "active" : "inactive"}
        </div>
      </CardFooter>
    </Card>
  );
};

export default ClientConfigDisplay;
