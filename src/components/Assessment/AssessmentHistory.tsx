import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Badge } from "../ui/badge";
import { ScrollArea } from "../ui/scroll-area";
import { Button } from "../ui/button";
import {
  FileText,
  Download,
  Eye,
  FileSpreadsheet,
  Calendar,
  Search,
  Loader2,
} from "lucide-react";
import {
  assessmentHistoryApi,
  AssessmentHistoryFilterParams,
} from "@/lib/api/assessment/assessmentHistoryApi";
import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import DatePickerWithRange from "../ui/date-picker-with-range";
import { Input } from "../ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../ui/pagination";
import { useToast } from "../ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";

interface AssessmentHistoryProps {
  beneficiaryId?: string;
}

interface AssessmentRecord {
  id: string;
  date: string;
  type: string;
  status: "completed" | "in-progress" | "pending";
  assessor: string;
  assessorId?: string;
}

const AssessmentHistory = ({ beneficiaryId = "" }: AssessmentHistoryProps) => {
  const { toast } = useToast();
  const [assessments, setAssessments] = useState<AssessmentRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [showDateFilter, setShowDateFilter] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // Load assessments from API
  const loadAssessments = async () => {
    setLoading(true);
    try {
      const filters: AssessmentHistoryFilterParams = {
        beneficiaryId: beneficiaryId || undefined,
      };

      // Add date range filters if set
      if (dateRange?.from) {
        filters.dateFrom = format(dateRange.from, "yyyy-MM-dd");
      }
      if (dateRange?.to) {
        filters.dateTo = format(dateRange.to, "yyyy-MM-dd");
      }

      // Add status filter if not "all"
      if (activeTab !== "all") {
        filters.status = activeTab;
      }

      // Add search term if provided
      if (searchTerm) {
        filters.searchTerm = searchTerm;
      }

      const response = await assessmentHistoryApi.getAssessmentHistory({
        ...filters,
        page: currentPage,
        pageSize,
      });

      if (response.success && response.data) {
        // Transform API data to match our component's expected format
        const formattedAssessments = response.data.items.map((item) => ({
          id: item.id.toString(),
          date: item.createdAt
            ? format(new Date(item.createdAt), "yyyy-MM-dd")
            : "",
          type: item.type?.name || "Assessment",
          status:
            (item.status?.toLowerCase() as
              | "completed"
              | "in-progress"
              | "pending") || "pending",
          assessor: item.assessor?.name || "Unknown",
          assessorId: item.assessor?.id?.toString(),
        }));

        setAssessments(formattedAssessments);
        setTotalPages(response.data.totalPages);
        setTotalItems(response.data.totalCount);
      } else {
        // If API call fails, use mock data for development
        const mockData = [
          {
            id: "ASM-001",
            date: "2023-10-15",
            type: "Initial Assessment",
            status: "completed",
            assessor: "Ahmed Mohammed",
          },
          {
            id: "ASM-002",
            date: "2023-11-20",
            type: "Follow-up Assessment",
            status: "completed",
            assessor: "Fatima Al-Sayed",
          },
          {
            id: "ASM-003",
            date: "2024-01-10",
            type: "Modification Verification",
            status: "in-progress",
            assessor: "Khalid Ibrahim",
          },
          {
            id: "ASM-004",
            date: "2024-02-15",
            type: "Final Assessment",
            status: "pending",
            assessor: "Layla Ahmed",
          },
          {
            id: "ASM-005",
            date: "2024-03-05",
            type: "Bathroom Assessment",
            status: "completed",
            assessor: "Mohammed Al-Farsi",
          },
          {
            id: "ASM-006",
            date: "2024-03-20",
            type: "Kitchen Assessment",
            status: "in-progress",
            assessor: "Sara Al-Mansoori",
          },
        ];

        // Filter mock data based on search term
        let filteredMockData = mockData;
        if (searchTerm) {
          const searchLower = searchTerm.toLowerCase();
          filteredMockData = mockData.filter(
            (item) =>
              item.id.toLowerCase().includes(searchLower) ||
              item.type.toLowerCase().includes(searchLower) ||
              item.assessor.toLowerCase().includes(searchLower),
          );
        }

        // Filter by status if not "all"
        if (activeTab !== "all") {
          filteredMockData = filteredMockData.filter(
            (item) => item.status === activeTab,
          );
        }

        // Filter by date range if set
        if (dateRange?.from || dateRange?.to) {
          filteredMockData = filteredMockData.filter((item) => {
            const itemDate = new Date(item.date);
            if (dateRange?.from && dateRange?.to) {
              return itemDate >= dateRange.from && itemDate <= dateRange.to;
            } else if (dateRange?.from) {
              return itemDate >= dateRange.from;
            } else if (dateRange?.to) {
              return itemDate <= dateRange.to;
            }
            return true;
          });
        }

        setAssessments(filteredMockData);
        setTotalItems(filteredMockData.length);
        setTotalPages(Math.ceil(filteredMockData.length / pageSize));

        console.error("Failed to load assessments:", response.error);
        toast({
          title: "Using mock data",
          description:
            "Could not connect to assessment API. Using demo data instead.",
          variant: "default",
        });
      }
    } catch (error) {
      console.error("Error loading assessments:", error);
      toast({
        title: "Error",
        description: "Failed to load assessment history. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Export assessment as PDF or Excel
  const exportAssessment = async (
    id: string,
    format: "pdf" | "excel" | "csv",
  ) => {
    setExportLoading(id);
    try {
      let response;
      if (format === "pdf") {
        response = await assessmentHistoryApi.exportAssessmentAsPdf(id);
      } else if (format === "excel") {
        response = await assessmentHistoryApi.exportAssessmentAsExcel(id);
      } else {
        response = await assessmentHistoryApi.exportAssessmentAsCsv(id);
      }

      if (response.success && response.data) {
        // Create a download link for the blob
        const url = window.URL.createObjectURL(response.data);
        const a = document.createElement("a");
        a.href = url;
        a.download = `assessment-${id}.${format === "pdf" ? "pdf" : format === "excel" ? "xlsx" : "csv"}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        toast({
          title: "Export Successful",
          description: `Assessment exported as ${format.toUpperCase()}.`,
        });
      } else {
        throw new Error(response.error || "Export failed");
      }
    } catch (error) {
      console.error(`Error exporting assessment as ${format}:`, error);
      toast({
        title: "Export Failed",
        description: `Could not export assessment as ${format.toUpperCase()}.`,
        variant: "destructive",
      });
    } finally {
      setExportLoading(null);
    }
  };

  // Export all assessments in current filter
  const exportAllAssessments = async (format: "pdf" | "excel" | "csv") => {
    setExportLoading("all");
    try {
      const filters: AssessmentHistoryFilterParams = {
        beneficiaryId: beneficiaryId || undefined,
      };

      // Add date range filters if set
      if (dateRange?.from) {
        filters.dateFrom = format(dateRange.from, "yyyy-MM-dd");
      }
      if (dateRange?.to) {
        filters.dateTo = format(dateRange.to, "yyyy-MM-dd");
      }

      // Add status filter if not "all"
      if (activeTab !== "all") {
        filters.status = activeTab;
      }

      // Add search term if provided
      if (searchTerm) {
        filters.searchTerm = searchTerm;
      }

      let response;
      if (format === "pdf") {
        response = await assessmentHistoryApi.exportAssessmentsAsPdf(filters);
      } else if (format === "excel") {
        response = await assessmentHistoryApi.exportAssessmentsAsExcel(filters);
      } else {
        response = await assessmentHistoryApi.exportAssessmentsAsCsv(filters);
      }

      if (response.success && response.data) {
        // Create a download link for the blob
        const url = window.URL.createObjectURL(response.data);
        const a = document.createElement("a");
        a.href = url;
        a.download = `assessments-${new Date().toISOString().split("T")[0]}.${format === "pdf" ? "pdf" : format === "excel" ? "xlsx" : "csv"}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        toast({
          title: "Export Successful",
          description: `All assessments exported as ${format.toUpperCase()}.`,
        });
      } else {
        throw new Error(response.error || "Export failed");
      }
    } catch (error) {
      console.error(`Error exporting all assessments as ${format}:`, error);
      toast({
        title: "Export Failed",
        description: `Could not export all assessments as ${format.toUpperCase()}.`,
        variant: "destructive",
      });
    } finally {
      setExportLoading(null);
    }
  };

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setCurrentPage(1); // Reset to first page when changing tabs
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Apply date filter
  const applyDateFilter = () => {
    setCurrentPage(1); // Reset to first page when applying filter
    loadAssessments();
    setShowDateFilter(false);
  };

  // Clear date filter
  const clearDateFilter = () => {
    setDateRange(undefined);
    setCurrentPage(1);
    loadAssessments();
    setShowDateFilter(false);
  };

  // Load assessments when component mounts or when filters change
  useEffect(() => {
    loadAssessments();
  }, [beneficiaryId, currentPage, pageSize, activeTab]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in-progress":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-amber-100 text-amber-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card className="w-full bg-white">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Assessment History</CardTitle>
            <CardDescription>
              View past and upcoming assessments{" "}
              {beneficiaryId ? "for this beneficiary" : ""}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDateFilter(!showDateFilter)}
            >
              <Calendar className="h-4 w-4 mr-1" /> Filter by Date
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadAssessments()}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <Search className="h-4 w-4 mr-1" />
              )}
              Refresh
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-1" /> Export All
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Export Assessments</DialogTitle>
                  <DialogDescription>
                    Choose a format to export all filtered assessments.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-4 py-4">
                  <Button
                    onClick={() => exportAllAssessments("pdf")}
                    disabled={exportLoading === "all"}
                  >
                    {exportLoading === "all" ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4 mr-2" />
                    )}
                    Export as PDF
                  </Button>
                  <Button
                    onClick={() => exportAllAssessments("excel")}
                    disabled={exportLoading === "all"}
                  >
                    {exportLoading === "all" ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <FileSpreadsheet className="h-4 w-4 mr-2" />
                    )}
                    Export as Excel
                  </Button>
                  <Button
                    onClick={() => exportAllAssessments("csv")}
                    disabled={exportLoading === "all"}
                  >
                    {exportLoading === "all" ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <FileText className="h-4 w-4 mr-2" />
                    )}
                    Export as CSV
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {showDateFilter && (
          <div className="mt-4 p-4 border rounded-md bg-muted/20">
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <h4 className="font-medium">Filter by Date Range</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDateFilter(false)}
                >
                  Cancel
                </Button>
              </div>
              <DatePickerWithRange
                className="w-full"
                date={dateRange}
                setDate={setDateRange as (date: DateRange | undefined) => void}
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={clearDateFilter}>
                  Clear Filter
                </Button>
                <Button size="sm" onClick={applyDateFilter}>
                  Apply Filter
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="mt-4">
          <Input
            placeholder="Search by ID, type, or assessor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mb-4"
          />
        </div>
      </CardHeader>
      <CardContent>
        <Tabs
          defaultValue="all"
          value={activeTab}
          onValueChange={handleTabChange}
        >
          <TabsList className="mb-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="in-progress">In Progress</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            <ScrollArea className="h-[400px] rounded-md border">
              <div className="p-4">
                {loading ? (
                  <div className="flex justify-center items-center h-40">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : assessments.length > 0 ? (
                  assessments.map((assessment) => (
                    <div
                      key={assessment.id}
                      className="mb-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-medium">
                              {assessment.type}
                            </h3>
                            <Badge
                              className={getStatusColor(assessment.status)}
                              variant="outline"
                            >
                              {assessment.status === "in-progress"
                                ? "In Progress"
                                : assessment.status.charAt(0).toUpperCase() +
                                  assessment.status.slice(1)}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-500">
                            ID: {assessment.id}
                          </p>
                          <p className="text-sm text-gray-500">
                            Date: {assessment.date}
                          </p>
                          <p className="text-sm text-gray-500">
                            Assessor: {assessment.assessor}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              exportAssessment(assessment.id, "pdf")
                            }
                            disabled={exportLoading === assessment.id}
                          >
                            {exportLoading === assessment.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <FileText className="h-4 w-4" />
                            )}
                            <span className="sr-only">Export as PDF</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              exportAssessment(assessment.id, "excel")
                            }
                            disabled={exportLoading === assessment.id}
                          >
                            {exportLoading === assessment.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <FileSpreadsheet className="h-4 w-4" />
                            )}
                            <span className="sr-only">Export as Excel</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              exportAssessment(assessment.id, "csv")
                            }
                            disabled={exportLoading === assessment.id}
                          >
                            {exportLoading === assessment.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Download className="h-4 w-4" />
                            )}
                            <span className="sr-only">Export as CSV</span>
                          </Button>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">View Details</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center h-40">
                    <p className="text-gray-500">No assessments found</p>
                    <Button
                      variant="link"
                      onClick={() => {
                        setSearchTerm("");
                        setDateRange(undefined);
                        setActiveTab("all");
                        loadAssessments();
                      }}
                    >
                      Clear filters
                    </Button>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() =>
                        handlePageChange(Math.max(1, currentPage - 1))
                      }
                      disabled={currentPage === 1}
                    />
                  </PaginationItem>

                  {/* First page */}
                  {currentPage > 2 && (
                    <PaginationItem>
                      <PaginationLink onClick={() => handlePageChange(1)}>
                        1
                      </PaginationLink>
                    </PaginationItem>
                  )}

                  {/* Ellipsis if needed */}
                  {currentPage > 3 && (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )}

                  {/* Previous page if not first */}
                  {currentPage > 1 && (
                    <PaginationItem>
                      <PaginationLink
                        onClick={() => handlePageChange(currentPage - 1)}
                      >
                        {currentPage - 1}
                      </PaginationLink>
                    </PaginationItem>
                  )}

                  {/* Current page */}
                  <PaginationItem>
                    <PaginationLink isActive>{currentPage}</PaginationLink>
                  </PaginationItem>

                  {/* Next page if not last */}
                  {currentPage < totalPages && (
                    <PaginationItem>
                      <PaginationLink
                        onClick={() => handlePageChange(currentPage + 1)}
                      >
                        {currentPage + 1}
                      </PaginationLink>
                    </PaginationItem>
                  )}

                  {/* Ellipsis if needed */}
                  {currentPage < totalPages - 2 && (
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                  )}

                  {/* Last page */}
                  {currentPage < totalPages - 1 && (
                    <PaginationItem>
                      <PaginationLink
                        onClick={() => handlePageChange(totalPages)}
                      >
                        {totalPages}
                      </PaginationLink>
                    </PaginationItem>
                  )}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        handlePageChange(Math.min(totalPages, currentPage + 1))
                      }
                      disabled={currentPage === totalPages}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}

            <div className="text-sm text-gray-500 text-center">
              Showing {assessments.length} of {totalItems} assessments
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AssessmentHistory;
