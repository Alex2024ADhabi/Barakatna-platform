import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calendar";
import { format } from "date-fns";
import { CalendarIcon, Download, Loader2, RefreshCw } from "lucide-react";
import { useTranslatedDirection } from "@/hooks/useTranslatedDirection";
import { useToast } from "../ui/use-toast";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts";
import {
  cohortAnalyticsApi,
  CohortAnalyticsData,
  CohortMetric,
} from "@/lib/api/cohort/cohortAnalyticsApi";

interface CohortAnalyticsDetailProps {
  cohortId?: string;
}

const CohortAnalyticsDetail = ({
  cohortId = "COH-2024-01",
}: CohortAnalyticsDetailProps) => {
  const [timeframe, setTimeframe] = useState<string>("month");
  const [analyticsData, setAnalyticsData] =
    useState<CohortAnalyticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [exporting, setExporting] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>("assessments");
  const [detailLevel, setDetailLevel] = useState<"summary" | "detailed">(
    "summary",
  );
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });
  const [timelineData, setTimelineData] = useState<{
    dates: string[];
    assessments: number[];
    modifications: number[];
  } | null>(null);

  const { directionClass } = useTranslatedDirection();
  const { toast } = useToast();

  // Colors for charts
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

  // Fetch analytics data
  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      const response = await cohortAnalyticsApi.getCohortAnalytics({
        cohortId,
        startDate: dateRange.from
          ? format(dateRange.from, "yyyy-MM-dd")
          : undefined,
        endDate: dateRange.to ? format(dateRange.to, "yyyy-MM-dd") : undefined,
        timeframe,
        includeTimeline: true,
        detailLevel,
      });

      if (response.success && response.data) {
        setAnalyticsData(response.data);
        if (response.data.timeline) {
          setTimelineData(response.data.timeline);
        }
      } else {
        // If API fails, use mock data for demo purposes
        const mockData = {
          assessments: [
            { label: "Completed", value: 45, total: 60, change: 12 },
            { label: "In Progress", value: 10, total: 60, change: -5 },
            { label: "Pending", value: 5, total: 60, change: -7 },
          ],
          modifications: [
            { label: "Completed", value: 32, total: 50, change: 8 },
            { label: "In Progress", value: 15, total: 50, change: 3 },
            { label: "Pending", value: 3, total: 50, change: -11 },
          ],
          satisfaction: [
            { label: "Very Satisfied", value: 38, total: 50, change: 15 },
            { label: "Satisfied", value: 10, total: 50, change: -5 },
            { label: "Neutral", value: 2, total: 50, change: -10 },
          ],
          timeline: {
            dates: [
              "2024-01",
              "2024-02",
              "2024-03",
              "2024-04",
              "2024-05",
              "2024-06",
            ],
            assessments: [12, 18, 22, 27, 35, 45],
            modifications: [8, 14, 18, 22, 28, 32],
          },
        };

        setAnalyticsData(mockData);
        setTimelineData(mockData.timeline);

        toast({
          title: "Using demo data",
          description:
            "Could not connect to analytics API. Using demo data instead.",
          variant: "default",
        });
      }
    } catch (error) {
      console.error("Error fetching analytics data:", error);
      toast({
        title: "Error",
        description: "Failed to load analytics data. Using demo data instead.",
        variant: "destructive",
      });
      // Use mock data as fallback
      const mockData = {
        assessments: [
          { label: "Completed", value: 45, total: 60, change: 12 },
          { label: "In Progress", value: 10, total: 60, change: -5 },
          { label: "Pending", value: 5, total: 60, change: -7 },
        ],
        modifications: [
          { label: "Completed", value: 32, total: 50, change: 8 },
          { label: "In Progress", value: 15, total: 50, change: 3 },
          { label: "Pending", value: 3, total: 50, change: -11 },
        ],
        satisfaction: [
          { label: "Very Satisfied", value: 38, total: 50, change: 15 },
          { label: "Satisfied", value: 10, total: 50, change: -5 },
          { label: "Neutral", value: 2, total: 50, change: -10 },
        ],
        timeline: {
          dates: [
            "2024-01",
            "2024-02",
            "2024-03",
            "2024-04",
            "2024-05",
            "2024-06",
          ],
          assessments: [12, 18, 22, 27, 35, 45],
          modifications: [8, 14, 18, 22, 28, 32],
        },
      };

      setAnalyticsData(mockData);
      setTimelineData(mockData.timeline);
    } finally {
      setLoading(false);
    }
  };

  // Export analytics data
  const exportAnalytics = async (format: "pdf" | "excel" | "csv") => {
    setExporting(true);
    try {
      let response;

      const exportParams = {
        cohortId,
        startDate: dateRange.from
          ? format(dateRange.from, "yyyy-MM-dd")
          : undefined,
        endDate: dateRange.to ? format(dateRange.to, "yyyy-MM-dd") : undefined,
        timeframe,
        activeTab, // Include the active tab to export specific metrics
        detailLevel,
      };

      switch (format) {
        case "pdf":
          response =
            await cohortAnalyticsApi.exportAnalyticsAsPdf(exportParams);
          break;
        case "excel":
          response =
            await cohortAnalyticsApi.exportAnalyticsAsExcel(exportParams);
          break;
        case "csv":
          response =
            await cohortAnalyticsApi.exportAnalyticsAsCsv(exportParams);
          break;
      }

      if (response?.success && response.data) {
        // Create a download link
        const url = window.URL.createObjectURL(response.data);
        const link = document.createElement("a");
        link.href = url;
        const timestamp = new Date().toISOString().split("T")[0];
        link.setAttribute(
          "download",
          `cohort-${cohortId}-${activeTab}-analytics-${timestamp}.${format === "excel" ? "xlsx" : format}`,
        );
        document.body.appendChild(link);
        link.click();
        link.remove();

        toast({
          title: "Export successful",
          description: `Analytics data has been exported as ${format.toUpperCase()}.`,
          variant: "default",
        });
      } else {
        throw new Error(`Failed to export as ${format}`);
      }
    } catch (error) {
      console.error(`Error exporting as ${format}:`, error);
      toast({
        title: "Export failed",
        description: `Could not export analytics data as ${format.toUpperCase()}.`,
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  // Format date range for display
  const formatDateRange = () => {
    if (dateRange.from && dateRange.to) {
      return `${format(dateRange.from, "MMM dd, yyyy")} - ${format(
        dateRange.to,
        "MMM dd, yyyy",
      )}`;
    }
    if (dateRange.from) {
      return `From ${format(dateRange.from, "MMM dd, yyyy")}`;
    }
    if (dateRange.to) {
      return `Until ${format(dateRange.to, "MMM dd, yyyy")}`;
    }
    return "Select date range";
  };

  // Prepare data for bar chart
  const prepareBarChartData = (metrics: CohortMetric[] | undefined) => {
    if (!metrics) return [];
    return metrics.map((metric) => ({
      name: metric.label,
      value: metric.value,
      total: metric.total,
      percentage: Math.round((metric.value / metric.total) * 100),
    }));
  };

  // Prepare data for pie chart
  const preparePieChartData = (metrics: CohortMetric[] | undefined) => {
    if (!metrics) return [];
    return metrics.map((metric) => ({
      name: metric.label,
      value: metric.value,
    }));
  };

  // Prepare timeline data for line chart
  const prepareTimelineData = () => {
    if (!timelineData) return [];

    return timelineData.dates.map((date, index) => ({
      date,
      assessments: timelineData.assessments[index],
      modifications: timelineData.modifications[index],
    }));
  };

  // Effect to fetch data when dependencies change
  useEffect(() => {
    fetchAnalyticsData();
  }, [cohortId, timeframe, dateRange.from, dateRange.to, detailLevel]);

  return (
    <Card className={`w-full bg-white ${directionClass}`}>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Cohort Analytics</CardTitle>
          <CardDescription>
            Detailed metrics for cohort {cohortId}
          </CardDescription>
        </div>
        <div className="flex space-x-2">
          {/* Date Range Picker */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-[240px] justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formatDateRange()}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange.from}
                selected={{
                  from: dateRange.from,
                  to: dateRange.to,
                }}
                onSelect={(range) => {
                  setDateRange({
                    from: range?.from,
                    to: range?.to,
                  });
                }}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>

          {/* Timeframe Selector */}
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Last Week</SelectItem>
              <SelectItem value="month">Last Month</SelectItem>
              <SelectItem value="quarter">Last Quarter</SelectItem>
              <SelectItem value="year">Last Year</SelectItem>
            </SelectContent>
          </Select>

          {/* Detail Level Selector */}
          <Select
            value={detailLevel}
            onValueChange={(value: "summary" | "detailed") =>
              setDetailLevel(value)
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Detail level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="summary">Summary</SelectItem>
              <SelectItem value="detailed">Detailed</SelectItem>
            </SelectContent>
          </Select>

          {/* Refresh Button */}
          <Button
            variant="outline"
            onClick={fetchAnalyticsData}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>

          {/* Export Button */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" disabled={exporting}>
                {exporting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                Export
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48">
              <div className="flex flex-col space-y-2">
                <Button
                  variant="ghost"
                  className="justify-start"
                  onClick={() => exportAnalytics("pdf")}
                  disabled={exporting}
                >
                  Export as PDF
                </Button>
                <Button
                  variant="ghost"
                  className="justify-start"
                  onClick={() => exportAnalytics("excel")}
                  disabled={exporting}
                >
                  Export as Excel
                </Button>
                <Button
                  variant="ghost"
                  className="justify-start"
                  onClick={() => exportAnalytics("csv")}
                  disabled={exporting}
                >
                  Export as CSV
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading analytics data...</span>
          </div>
        ) : (
          <Tabs
            defaultValue="assessments"
            value={activeTab}
            onValueChange={setActiveTab}
          >
            <TabsList className="mb-4">
              <TabsTrigger value="assessments">Assessments</TabsTrigger>
              <TabsTrigger value="modifications">Modifications</TabsTrigger>
              <TabsTrigger value="satisfaction">Satisfaction</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
            </TabsList>

            {/* Timeline Tab */}
            <TabsContent value="timeline">
              <div className="space-y-6">
                <div className="h-80">
                  <h4 className="font-medium mb-4">Progress Over Time</h4>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={prepareTimelineData()}
                      margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="assessments"
                        stroke="#8884d8"
                        fill="#8884d8"
                        fillOpacity={0.3}
                        name="Assessments"
                      />
                      <Area
                        type="monotone"
                        dataKey="modifications"
                        stroke="#82ca9d"
                        fill="#82ca9d"
                        fillOpacity={0.3}
                        name="Modifications"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-4">
                  <h4 className="font-medium mb-2">Timeline Analysis</h4>
                  <p className="text-sm text-gray-600">
                    This chart shows the progression of assessments and
                    modifications over time. The data indicates that{" "}
                    {timelineData &&
                      timelineData.assessments[
                        timelineData.assessments.length - 1
                      ] - timelineData.assessments[0]}{" "}
                    new assessments and{" "}
                    {timelineData &&
                      timelineData.modifications[
                        timelineData.modifications.length - 1
                      ] - timelineData.modifications[0]}{" "}
                    new modifications were completed during this period, showing
                    steady progress in the cohort's activities.
                  </p>
                </div>
              </div>
            </TabsContent>

            {/* Metric Tabs */}
            {analyticsData &&
              Object.entries(analyticsData)
                .filter(([key]) => key !== "timeline")
                .map(([key, data]) => (
                  <TabsContent key={key} value={key}>
                    <div className="space-y-6">
                      {/* Bar Chart */}
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={prepareBarChartData(data)}
                            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="value" fill="#8884d8" name="Count" />
                            <Bar
                              dataKey="percentage"
                              fill="#82ca9d"
                              name="Percentage (%)"
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Pie Chart */}
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={preparePieChartData(data)}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) =>
                                `${name}: ${(percent * 100).toFixed(0)}%`
                              }
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {preparePieChartData(data).map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={COLORS[index % COLORS.length]}
                                />
                              ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Metrics Table */}
                      <div className="mt-4">
                        <h4 className="font-medium mb-2">Detailed Metrics</h4>
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse">
                            <thead>
                              <tr className="border-b">
                                <th className="text-left py-2">Category</th>
                                <th className="text-left py-2">Value</th>
                                <th className="text-left py-2">Total</th>
                                <th className="text-left py-2">Percentage</th>
                                <th className="text-left py-2">Change</th>
                              </tr>
                            </thead>
                            <tbody>
                              {data.map((metric, index) => (
                                <tr key={index} className="border-b">
                                  <td className="py-2">{metric.label}</td>
                                  <td className="py-2">{metric.value}</td>
                                  <td className="py-2">{metric.total}</td>
                                  <td className="py-2">
                                    {Math.round(
                                      (metric.value / metric.total) * 100,
                                    )}
                                    %
                                  </td>
                                  <td className="py-2">
                                    <span
                                      className={`${metric.change > 0 ? "text-green-600" : "text-red-600"}`}
                                    >
                                      {metric.change > 0 ? "+" : ""}
                                      {metric.change}%
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Summary */}
                      <div className="mt-8 pt-4 border-t">
                        <h4 className="font-medium mb-2">Summary</h4>
                        <p className="text-sm text-gray-600">
                          {key === "assessments" && (
                            <>
                              This cohort has completed {data[0].value}{" "}
                              assessments out of{" "}
                              {data[0].total + data[1].value + data[2].value}{" "}
                              total, showing a {data[0].change}% increase from
                              the previous {timeframe}.
                            </>
                          )}
                          {key === "modifications" && (
                            <>
                              Home modifications for this cohort are{" "}
                              {Math.round(
                                (data[0].value /
                                  (data[0].value +
                                    data[1].value +
                                    data[2].value)) *
                                  100,
                              )}
                              % complete, with {data[1].value} currently in
                              progress.
                            </>
                          )}
                          {key === "satisfaction" && (
                            <>
                              Beneficiary satisfaction is at{" "}
                              {Math.round(
                                ((data[0].value + data[1].value) /
                                  (data[0].value +
                                    data[1].value +
                                    data[2].value)) *
                                  100,
                              )}
                              %, with {data[0].value} beneficiaries reporting
                              being very satisfied.
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                  </TabsContent>
                ))}
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
};

export default CohortAnalyticsDetail;
