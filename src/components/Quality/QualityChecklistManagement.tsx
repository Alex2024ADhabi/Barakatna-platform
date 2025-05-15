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
  ClipboardCheck,
  Plus,
  Star,
  StarHalf,
  AlertTriangle,
} from "lucide-react";
import { QualityCheck } from "@/lib/api/inspection/types";
import { inspectionApi } from "@/lib/api/inspection/inspectionApi";

interface QualityChecklistManagementProps {
  projectId?: number;
}

const QualityChecklistManagement: React.FC<QualityChecklistManagementProps> = ({
  projectId,
}) => {
  const { t } = useTranslation();
  const [qualityChecks, setQualityChecks] = useState<QualityCheck[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    const fetchQualityChecks = async () => {
      try {
        setLoading(true);
        const data = await inspectionApi.getQualityChecks(projectId);
        setQualityChecks(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching quality checks:", err);
        setError("Failed to load quality checks");
      } finally {
        setLoading(false);
      }
    };

    fetchQualityChecks();
  }, [projectId]);

  const filteredChecks = qualityChecks.filter((check) => {
    if (activeTab === "passed") return check.status === "Passed";
    if (activeTab === "failed") return check.status === "Failed";
    return true;
  });

  const getRatingStars = (rating: number) => {
    const stars = [];
    const maxRating = 5;

    for (let i = 1; i <= maxRating; i++) {
      if (i <= rating) {
        stars.push(
          <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />,
        );
      } else if (i - 0.5 <= rating) {
        stars.push(
          <StarHalf
            key={i}
            className="h-4 w-4 fill-yellow-400 text-yellow-400"
          />,
        );
      } else {
        stars.push(<Star key={i} className="h-4 w-4 text-gray-300" />);
      }
    }

    return <div className="flex">{stars}</div>;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Passed":
        return <Badge className="bg-green-100 text-green-800">Passed</Badge>;
      case "Failed":
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Quality Management</CardTitle>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Quality Check
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Quality Check</DialogTitle>
                </DialogHeader>
                <div className="p-4 text-center">
                  <p>Quality check form would go here</p>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">All Checks</TabsTrigger>
              <TabsTrigger value="passed">Passed</TabsTrigger>
              <TabsTrigger value="failed">Failed</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-4">
              {loading ? (
                <div className="text-center p-4">Loading quality checks...</div>
              ) : error ? (
                <div className="text-center p-4 text-red-500">{error}</div>
              ) : filteredChecks.length === 0 ? (
                <div className="text-center p-4">
                  <ClipboardCheck className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-lg font-medium">
                    No quality checks found
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Create your first quality check to get started.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Room</TableHead>
                      <TableHead>Inspector</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredChecks.map((check) => (
                      <TableRow key={check.id}>
                        <TableCell>Room {check.roomId}</TableCell>
                        <TableCell>{check.inspectorName}</TableCell>
                        <TableCell>{check.checkDate}</TableCell>
                        <TableCell>
                          {getRatingStars(check.overallRating)}
                        </TableCell>
                        <TableCell>{getStatusBadge(check.status)}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
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

export default QualityChecklistManagement;
