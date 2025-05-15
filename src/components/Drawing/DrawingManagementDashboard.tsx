import React, { useState, useEffect, useRef } from "react";
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
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  FileText,
  Download,
  Eye,
  Upload,
  Edit,
  Save,
  X,
  Plus,
  FileCheck,
  FileWarning,
} from "lucide-react";
import { drawingApi, Drawing } from "@/lib/api/drawing/types";
import { drawingApi as api } from "@/lib/api/drawing/drawingApi";

interface Annotation {
  id: string;
  x: number;
  y: number;
  text: string;
  author: string;
  timestamp: Date;
  resolved: boolean;
}

interface InspectionReport {
  id: string;
  drawingId: string;
  inspectorName: string;
  date: Date;
  status: "Passed" | "Failed" | "Pending";
  notes: string;
  issues: Array<{
    id: string;
    description: string;
    severity: "Low" | "Medium" | "High";
    resolved: boolean;
  }>;
}

interface DrawingManagementDashboardProps {
  projectId?: number;
}

const DrawingManagementDashboard: React.FC<DrawingManagementDashboardProps> = ({
  projectId,
}) => {
  const { t } = useTranslation();
  const [drawings, setDrawings] = useState<Drawing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDrawing, setSelectedDrawing] = useState<Drawing | null>(null);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [newAnnotation, setNewAnnotation] = useState<{
    x: number;
    y: number;
    text: string;
  } | null>(null);
  const [isAnnotating, setIsAnnotating] = useState(false);
  const [inspectionReports, setInspectionReports] = useState<
    InspectionReport[]
  >([]);
  const [newReport, setNewReport] = useState<Partial<InspectionReport>>({});
  const [activeTab, setActiveTab] = useState("view");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const fetchDrawings = async () => {
      try {
        setLoading(true);
        const data = await api.getDrawings(projectId);
        setDrawings(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching drawings:", err);
        setError("Failed to load drawings");
      } finally {
        setLoading(false);
      }
    };

    fetchDrawings();
  }, [projectId]);

  // Mock function to fetch annotations for a drawing
  const fetchAnnotations = async (drawingId: string) => {
    // In a real implementation, this would fetch from an API
    // For now, return mock data
    return [
      {
        id: "ann1",
        x: 100,
        y: 150,
        text: "Check this dimension",
        author: "Ahmed",
        timestamp: new Date(),
        resolved: false,
      },
      {
        id: "ann2",
        x: 300,
        y: 200,
        text: "Material specification needed",
        author: "Fatima",
        timestamp: new Date(Date.now() - 86400000), // 1 day ago
        resolved: true,
      },
    ];
  };

  // Mock function to fetch inspection reports for a drawing
  const fetchInspectionReports = async (drawingId: string) => {
    // In a real implementation, this would fetch from an API
    // For now, return mock data
    return [
      {
        id: "rep1",
        drawingId,
        inspectorName: "Mohammed",
        date: new Date(Date.now() - 172800000), // 2 days ago
        status: "Passed" as const,
        notes: "All specifications met. Ready for implementation.",
        issues: [],
      },
      {
        id: "rep2",
        drawingId,
        inspectorName: "Layla",
        date: new Date(Date.now() - 432000000), // 5 days ago
        status: "Failed" as const,
        notes: "Several issues need to be addressed before approval.",
        issues: [
          {
            id: "issue1",
            description: "Incorrect measurements in bathroom area",
            severity: "High" as const,
            resolved: false,
          },
          {
            id: "issue2",
            description: "Missing accessibility features",
            severity: "Medium" as const,
            resolved: true,
          },
        ],
      },
    ];
  };

  // Handle opening a drawing for annotation/viewing
  const handleOpenDrawing = async (drawing: Drawing) => {
    setSelectedDrawing(drawing);
    setActiveTab("view");

    try {
      const fetchedAnnotations = await fetchAnnotations(drawing.id);
      setAnnotations(fetchedAnnotations);

      const fetchedReports = await fetchInspectionReports(drawing.id);
      setInspectionReports(fetchedReports);
    } catch (err) {
      console.error("Error fetching drawing details:", err);
    }
  };

  // Handle canvas click for adding annotations
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isAnnotating || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setNewAnnotation({ x, y, text: "" });
  };

  // Save a new annotation
  const saveAnnotation = () => {
    if (!newAnnotation || !newAnnotation.text.trim() || !selectedDrawing)
      return;

    const annotation: Annotation = {
      id: `ann${Date.now()}`,
      x: newAnnotation.x,
      y: newAnnotation.y,
      text: newAnnotation.text,
      author: "Current User", // In a real app, get from auth context
      timestamp: new Date(),
      resolved: false,
    };

    setAnnotations([...annotations, annotation]);
    setNewAnnotation(null);
    setIsAnnotating(false);

    // In a real implementation, save to API
    console.log("Saving annotation:", annotation);
  };

  // Toggle annotation resolution status
  const toggleAnnotationResolved = (id: string) => {
    setAnnotations(
      annotations.map((ann) =>
        ann.id === id ? { ...ann, resolved: !ann.resolved } : ann,
      ),
    );

    // In a real implementation, update via API
  };

  // Create a new inspection report
  const createInspectionReport = () => {
    if (!selectedDrawing || !newReport.inspectorName || !newReport.notes)
      return;

    const report: InspectionReport = {
      id: `rep${Date.now()}`,
      drawingId: selectedDrawing.id,
      inspectorName: newReport.inspectorName || "",
      date: new Date(),
      status: newReport.status || "Pending",
      notes: newReport.notes || "",
      issues: newReport.issues || [],
    };

    setInspectionReports([...inspectionReports, report]);
    setNewReport({});

    // In a real implementation, save to API
    console.log("Creating inspection report:", report);
  };

  // Add issue to new report
  const addIssueToReport = () => {
    if (!newReport.newIssue) return;

    const issue = {
      id: `issue${Date.now()}`,
      description: newReport.newIssue,
      severity: newReport.newIssueSeverity || "Medium",
      resolved: false,
    };

    setNewReport({
      ...newReport,
      issues: [...(newReport.issues || []), issue],
      newIssue: "",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Approved":
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case "In Review":
        return <Badge className="bg-blue-100 text-blue-800">In Review</Badge>;
      case "Rejected":
        return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  // Render annotations on canvas
  useEffect(() => {
    if (!canvasRef.current || !selectedDrawing) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw a placeholder for the drawing (in a real app, load the actual drawing)
    ctx.fillStyle = "#f0f0f0";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#ccc";
    ctx.strokeRect(0, 0, canvas.width, canvas.height);
    ctx.font = "20px Arial";
    ctx.fillStyle = "#999";
    ctx.textAlign = "center";
    ctx.fillText(
      `Drawing: ${selectedDrawing.title}`,
      canvas.width / 2,
      canvas.height / 2,
    );

    // Draw annotations
    annotations.forEach((ann) => {
      ctx.beginPath();
      ctx.arc(ann.x, ann.y, 10, 0, 2 * Math.PI);
      ctx.fillStyle = ann.resolved ? "#4caf50" : "#ff9800";
      ctx.fill();
      ctx.stroke();

      // Draw annotation number
      ctx.font = "12px Arial";
      ctx.fillStyle = "#fff";
      ctx.textAlign = "center";
      ctx.fillText(String(annotations.indexOf(ann) + 1), ann.x, ann.y + 4);
    });
  }, [selectedDrawing, annotations, isAnnotating]);

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Drawing Management</CardTitle>
            <div className="flex space-x-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Drawing
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Upload New Drawing</DialogTitle>
                  </DialogHeader>
                  <div className="p-4">
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <label htmlFor="drawingNumber">Drawing Number</label>
                        <Input
                          id="drawingNumber"
                          placeholder="Enter drawing number"
                        />
                      </div>
                      <div className="grid gap-2">
                        <label htmlFor="title">Title</label>
                        <Input id="title" placeholder="Enter drawing title" />
                      </div>
                      <div className="grid gap-2">
                        <label htmlFor="version">Version</label>
                        <Input id="version" placeholder="1.0" />
                      </div>
                      <div className="grid gap-2">
                        <label htmlFor="file">File</label>
                        <Input id="file" type="file" />
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit">Upload</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <FileCheck className="mr-2 h-4 w-4" />
                    Inspection Reports
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl">
                  <DialogHeader>
                    <DialogTitle>Inspection Reports</DialogTitle>
                  </DialogHeader>
                  <div className="p-4">
                    <Tabs defaultValue="reports" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="reports">View Reports</TabsTrigger>
                        <TabsTrigger value="create">Create Report</TabsTrigger>
                      </TabsList>
                      <TabsContent value="reports" className="p-4">
                        {inspectionReports.length === 0 ? (
                          <div className="text-center p-8">
                            <FileWarning className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-lg font-medium">
                              No inspection reports found
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                              Create your first inspection report to get
                              started.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {inspectionReports.map((report) => (
                              <Card key={report.id}>
                                <CardHeader className="pb-2">
                                  <div className="flex justify-between">
                                    <div>
                                      <CardTitle className="text-lg">
                                        Inspection by {report.inspectorName}
                                      </CardTitle>
                                      <p className="text-sm text-muted-foreground">
                                        {new Date(
                                          report.date,
                                        ).toLocaleDateString()}
                                      </p>
                                    </div>
                                    <Badge
                                      className={`${
                                        report.status === "Passed"
                                          ? "bg-green-100 text-green-800"
                                          : report.status === "Failed"
                                            ? "bg-red-100 text-red-800"
                                            : "bg-yellow-100 text-yellow-800"
                                      }`}
                                    >
                                      {report.status}
                                    </Badge>
                                  </div>
                                </CardHeader>
                                <CardContent>
                                  <div className="space-y-2">
                                    <h4 className="font-medium">Notes:</h4>
                                    <p className="text-sm">{report.notes}</p>

                                    {report.issues.length > 0 && (
                                      <div className="mt-4">
                                        <h4 className="font-medium mb-2">
                                          Issues:
                                        </h4>
                                        <ul className="space-y-2">
                                          {report.issues.map((issue) => (
                                            <li
                                              key={issue.id}
                                              className="flex items-start"
                                            >
                                              <Badge
                                                className={`mr-2 ${
                                                  issue.severity === "High"
                                                    ? "bg-red-100 text-red-800"
                                                    : issue.severity ===
                                                        "Medium"
                                                      ? "bg-yellow-100 text-yellow-800"
                                                      : "bg-blue-100 text-blue-800"
                                                }`}
                                              >
                                                {issue.severity}
                                              </Badge>
                                              <span
                                                className={
                                                  issue.resolved
                                                    ? "line-through"
                                                    : ""
                                                }
                                              >
                                                {issue.description}
                                              </span>
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        )}
                      </TabsContent>
                      <TabsContent value="create" className="p-4">
                        <div className="space-y-4">
                          <div className="grid gap-2">
                            <label htmlFor="inspectorName">
                              Inspector Name
                            </label>
                            <Input
                              id="inspectorName"
                              placeholder="Enter your name"
                              value={newReport.inspectorName || ""}
                              onChange={(e) =>
                                setNewReport({
                                  ...newReport,
                                  inspectorName: e.target.value,
                                })
                              }
                            />
                          </div>
                          <div className="grid gap-2">
                            <label htmlFor="status">Status</label>
                            <select
                              id="status"
                              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                              value={newReport.status || "Pending"}
                              onChange={(e) =>
                                setNewReport({
                                  ...newReport,
                                  status: e.target.value as any,
                                })
                              }
                            >
                              <option value="Passed">Passed</option>
                              <option value="Failed">Failed</option>
                              <option value="Pending">Pending</option>
                            </select>
                          </div>
                          <div className="grid gap-2">
                            <label htmlFor="notes">Notes</label>
                            <Textarea
                              id="notes"
                              placeholder="Enter inspection notes"
                              value={newReport.notes || ""}
                              onChange={(e) =>
                                setNewReport({
                                  ...newReport,
                                  notes: e.target.value,
                                })
                              }
                            />
                          </div>

                          <div className="border-t pt-4 mt-4">
                            <h4 className="font-medium mb-2">Issues</h4>
                            {(newReport.issues || []).length > 0 && (
                              <ul className="space-y-2 mb-4">
                                {(newReport.issues || []).map(
                                  (issue, index) => (
                                    <li
                                      key={issue.id}
                                      className="flex items-center justify-between"
                                    >
                                      <div className="flex items-center">
                                        <Badge
                                          className={`mr-2 ${
                                            issue.severity === "High"
                                              ? "bg-red-100 text-red-800"
                                              : issue.severity === "Medium"
                                                ? "bg-yellow-100 text-yellow-800"
                                                : "bg-blue-100 text-blue-800"
                                          }`}
                                        >
                                          {issue.severity}
                                        </Badge>
                                        <span>{issue.description}</span>
                                      </div>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                          const updatedIssues = [
                                            ...(newReport.issues || []),
                                          ];
                                          updatedIssues.splice(index, 1);
                                          setNewReport({
                                            ...newReport,
                                            issues: updatedIssues,
                                          });
                                        }}
                                      >
                                        <X className="h-4 w-4" />
                                      </Button>
                                    </li>
                                  ),
                                )}
                              </ul>
                            )}

                            <div className="flex space-x-2">
                              <Input
                                placeholder="New issue description"
                                value={newReport.newIssue || ""}
                                onChange={(e) =>
                                  setNewReport({
                                    ...newReport,
                                    newIssue: e.target.value,
                                  })
                                }
                              />
                              <select
                                className="w-32 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                                value={newReport.newIssueSeverity || "Medium"}
                                onChange={(e) =>
                                  setNewReport({
                                    ...newReport,
                                    newIssueSeverity: e.target.value as any,
                                  })
                                }
                              >
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                              </select>
                              <Button onClick={addIssueToReport}>
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          <Button
                            className="w-full mt-4"
                            onClick={createInspectionReport}
                          >
                            Create Inspection Report
                          </Button>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center p-4">Loading drawings...</div>
          ) : error ? (
            <div className="text-center p-4 text-red-500">{error}</div>
          ) : drawings.length === 0 ? (
            <div className="text-center p-4">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-lg font-medium">No drawings found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Upload your first drawing to get started.
              </p>
            </div>
          ) : (
            <>
              {selectedDrawing ? (
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="text-lg font-medium">
                        {selectedDrawing.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Drawing #{selectedDrawing.drawingNumber} | Version{" "}
                        {selectedDrawing.version}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant={activeTab === "view" ? "default" : "outline"}
                        onClick={() => setActiveTab("view")}
                      >
                        <Eye className="h-4 w-4 mr-1" /> View
                      </Button>
                      <Button
                        variant={
                          activeTab === "annotate" ? "default" : "outline"
                        }
                        onClick={() => {
                          setActiveTab("annotate");
                          setIsAnnotating(false);
                        }}
                      >
                        <Edit className="h-4 w-4 mr-1" /> Annotations
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setSelectedDrawing(null)}
                      >
                        <X className="h-4 w-4 mr-1" /> Close
                      </Button>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    {activeTab === "view" ? (
                      <div className="flex justify-center">
                        <canvas
                          ref={canvasRef}
                          width={800}
                          height={600}
                          className="border"
                        />
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <h3 className="font-medium">Annotations</h3>
                          <div className="flex space-x-2">
                            {isAnnotating ? (
                              <Button
                                variant="outline"
                                onClick={() => setIsAnnotating(false)}
                              >
                                Cancel
                              </Button>
                            ) : (
                              <Button onClick={() => setIsAnnotating(true)}>
                                <Plus className="h-4 w-4 mr-1" /> Add Annotation
                              </Button>
                            )}
                          </div>
                        </div>

                        <div className="flex space-x-4">
                          <div className="w-1/2">
                            <div className="border rounded-lg overflow-hidden">
                              <canvas
                                ref={canvasRef}
                                width={400}
                                height={400}
                                className="border w-full"
                                onClick={handleCanvasClick}
                                style={{
                                  cursor: isAnnotating
                                    ? "crosshair"
                                    : "default",
                                }}
                              />
                            </div>

                            {newAnnotation && (
                              <div className="mt-4 p-4 border rounded-lg">
                                <h4 className="font-medium mb-2">
                                  New Annotation
                                </h4>
                                <div className="space-y-2">
                                  <Textarea
                                    placeholder="Enter annotation text"
                                    value={newAnnotation.text}
                                    onChange={(e) =>
                                      setNewAnnotation({
                                        ...newAnnotation,
                                        text: e.target.value,
                                      })
                                    }
                                  />
                                  <div className="flex justify-end space-x-2">
                                    <Button
                                      variant="outline"
                                      onClick={() => setNewAnnotation(null)}
                                    >
                                      Cancel
                                    </Button>
                                    <Button onClick={saveAnnotation}>
                                      <Save className="h-4 w-4 mr-1" /> Save
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="w-1/2">
                            <div className="border rounded-lg p-4 h-full overflow-auto">
                              <h4 className="font-medium mb-4">
                                Annotation List
                              </h4>
                              {annotations.length === 0 ? (
                                <p className="text-center text-muted-foreground py-8">
                                  No annotations yet. Click on the drawing to
                                  add one.
                                </p>
                              ) : (
                                <div className="space-y-4">
                                  {annotations.map((ann, index) => (
                                    <div
                                      key={ann.id}
                                      className="p-3 border rounded-lg"
                                    >
                                      <div className="flex justify-between items-start">
                                        <div className="flex items-center">
                                          <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-medium mr-2">
                                            {index + 1}
                                          </div>
                                          <div>
                                            <p className="font-medium">
                                              {ann.author}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                              {new Date(
                                                ann.timestamp,
                                              ).toLocaleString()}
                                            </p>
                                          </div>
                                        </div>
                                        <Badge
                                          className={
                                            ann.resolved
                                              ? "bg-green-100 text-green-800"
                                              : "bg-yellow-100 text-yellow-800"
                                          }
                                          onClick={() =>
                                            toggleAnnotationResolved(ann.id)
                                          }
                                        >
                                          {ann.resolved ? "Resolved" : "Open"}
                                        </Badge>
                                      </div>
                                      <p className="mt-2">{ann.text}</p>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Drawing Number</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Version</TableHead>
                      <TableHead>Upload Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {drawings.map((drawing) => (
                      <TableRow key={drawing.id}>
                        <TableCell className="font-medium">
                          {drawing.drawingNumber}
                        </TableCell>
                        <TableCell>{drawing.title}</TableCell>
                        <TableCell>{drawing.version}</TableCell>
                        <TableCell>{drawing.uploadDate}</TableCell>
                        <TableCell>{getStatusBadge(drawing.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenDrawing(drawing)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            <Button variant="outline" size="sm" asChild>
                              <a href={drawing.fileUrl} download>
                                <Download className="h-4 w-4 mr-1" />
                                Download
                              </a>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DrawingManagementDashboard;
