import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertTriangle,
  Plus,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import { Defect } from "@/lib/api/inspection/types";
import { inspectionApi } from "@/lib/api/inspection/inspectionApi";

interface DefectTrackingProps {
  qualityCheckId?: number;
}

const DefectTracking: React.FC<DefectTrackingProps> = ({ qualityCheckId }) => {
  const { t } = useTranslation();
  const [defects, setDefects] = useState<Defect[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    const fetchDefects = async () => {
      try {
        setLoading(true);
        const data = await inspectionApi.getDefects(qualityCheckId);
        setDefects(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching defects:", err);
        setError("Failed to load defects");
      } finally {
        setLoading(false);
      }
    };

    fetchDefects();
  }, [qualityCheckId]);

  const filteredDefects = defects.filter((defect) => {
    if (activeTab === "open") return defect.status === "open";
    if (activeTab === "in-progress") return defect.status === "in-progress";
    if (activeTab === "resolved") return defect.status === "resolved";
    return true;
  });

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "critical":
        return <Badge className="bg-red-100 text-red-800">Critical</Badge>;
      case "high":
        return <Badge className="bg-orange-100 text-orange-800">High</Badge>;
      case "medium":
        return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>;
      case "low":
        return <Badge className="bg-blue-100 text-blue-800">Low</Badge>;
      default:
        return <Badge>{severity}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return (
          <Badge className="bg-red-100 text-red-800">
            <AlertCircle className="mr-1 h-3 w-3" />
            Open
          </Badge>
        );
      case "in-progress":
        return (
          <Badge className="bg-blue-100 text-blue-800">
            <Clock className="mr-1 h-3 w-3" />
            In Progress
          </Badge>
        );
      case "resolved":
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle className="mr-1 h-3 w-3" />
            Resolved
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const handleUpdateStatus = async (
    id: number,
    status: "open" | "in-progress" | "resolved",
  ) => {
    try {
      await inspectionApi.updateDefectStatus(id, status);

      // Update local state
      setDefects(
        defects.map((defect) =>
          defect.id === id ? { ...defect, status } : defect,
        ),
      );
    } catch (err) {
      console.error("Error updating defect status:", err);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Defect Tracking</CardTitle>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Report Defect
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Report New Defect</DialogTitle>
                </DialogHeader>
                <div className="p-4 text-center">
                  <p>Defect reporting form would go here</p>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="open">Open</TabsTrigger>
              <TabsTrigger value="in-progress">In Progress</TabsTrigger>
              <TabsTrigger value="resolved">Resolved</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-4">
              {loading ? (
                <div className="text-center p-4">Loading defects...</div>
              ) : error ? (
                <div className="text-center p-4 text-red-500">{error}</div>
              ) : filteredDefects.length === 0 ? (
                <div className="text-center p-4">
                  <AlertTriangle className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-lg font-medium">No defects found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {activeTab === "all"
                      ? "No defects have been reported yet."
                      : `No ${activeTab} defects found.`}
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Category</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Assigned To</TableHead>
                      <TableHead>Reported</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDefects.map((defect) => (
                      <TableRow key={defect.id}>
                        <TableCell>{defect.category}</TableCell>
                        <TableCell className="max-w-xs truncate">
                          {defect.description}
                        </TableCell>
                        <TableCell>
                          {getSeverityBadge(defect.severity)}
                        </TableCell>
                        <TableCell>
                          {defect.assigneeName || "Unassigned"}
                        </TableCell>
                        <TableCell>{defect.reportedDate}</TableCell>
                        <TableCell>{getStatusBadge(defect.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button variant="outline" size="sm">
                              View
                            </Button>
                            {defect.status !== "resolved" && (
                              <Button
                                size="sm"
                                onClick={() =>
                                  handleUpdateStatus(defect.id, "resolved")
                                }
                              >
                                Resolve
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default DefectTracking;
