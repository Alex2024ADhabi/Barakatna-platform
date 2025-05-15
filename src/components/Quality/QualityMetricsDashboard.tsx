import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
} from "recharts";
import { QualityCheck, Defect } from "@/lib/api/inspection/types";
import { inspectionApi } from "@/lib/api/inspection/inspectionApi";

interface QualityMetricsDashboardProps {
  projectId?: number;
}

const QualityMetricsDashboard: React.FC<QualityMetricsDashboardProps> = ({
  projectId,
}) => {
  const { t } = useTranslation();
  const [qualityChecks, setQualityChecks] = useState<QualityCheck[]>([]);
  const [defects, setDefects] = useState<Defect[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState("month");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const checksData = await inspectionApi.getQualityChecks(projectId);
        const defectsData = await inspectionApi.getDefects();

        setQualityChecks(checksData);
        setDefects(defectsData);
        setError(null);
      } catch (err) {
        console.error("Error fetching quality metrics data:", err);
        setError("Failed to load quality metrics");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [projectId]);

  // Calculate metrics
  const passRate =
    qualityChecks.length > 0
      ? Math.round(
          (qualityChecks.filter((check) => check.status === "Passed").length /
            qualityChecks.length) *
            100,
        )
      : 0;

  const averageRating =
    qualityChecks.length > 0
      ? Math.round(
          (qualityChecks.reduce((sum, check) => sum + check.overallRating, 0) /
            qualityChecks.length) *
            10,
        ) / 10
      : 0;

  const openDefects = defects.filter(
    (defect) => defect.status === "open",
  ).length;
  const resolvedDefects = defects.filter(
    (defect) => defect.status === "resolved",
  ).length;

  // Prepare chart data
  const defectsBySeverity = [
    {
      name: "Critical",
      value: defects.filter((d) => d.severity === "critical").length,
    },
    {
      name: "High",
      value: defects.filter((d) => d.severity === "high").length,
    },
    {
      name: "Medium",
      value: defects.filter((d) => d.severity === "medium").length,
    },
    { name: "Low", value: defects.filter((d) => d.severity === "low").length },
  ];

  const defectsByCategory = [
    {
      name: "Installation",
      count: defects.filter((d) => d.category === "Installation").length,
    },
    {
      name: "Materials",
      count: defects.filter((d) => d.category === "Materials").length,
    },
    {
      name: "Design",
      count: defects.filter((d) => d.category === "Design").length,
    },
    {
      name: "Other",
      count: defects.filter((d) => d.category === "Other").length,
    },
  ];

  const defectStatusData = [
    { name: "Open", value: openDefects },
    {
      name: "In Progress",
      value: defects.filter((d) => d.status === "in-progress").length,
    },
    { name: "Resolved", value: resolvedDefects },
  ];

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Quality Metrics Dashboard</h2>
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
      </div>

      {loading ? (
        <div className="text-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2">Loading quality metrics...</p>
        </div>
      ) : error ? (
        <div className="text-center p-8 text-red-500">
          <p>{error}</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <MetricCard
              title="Pass Rate"
              value={`${passRate}%`}
              description="Quality checks passed"
              trend={passRate > 80 ? "up" : "down"}
            />
            <MetricCard
              title="Average Rating"
              value={`${averageRating}/5`}
              description="Overall quality rating"
              trend={averageRating >= 4 ? "up" : "down"}
            />
            <MetricCard
              title="Open Defects"
              value={openDefects.toString()}
              description="Defects requiring attention"
              trend={openDefects < 5 ? "up" : "down"}
            />
            <MetricCard
              title="Resolved Defects"
              value={resolvedDefects.toString()}
              description="Successfully addressed issues"
              trend="up"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Defects by Severity</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={defectsBySeverity}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {defectsBySeverity.map((entry, index) => (
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
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Defects by Category</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={defectsByCategory}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Defect Resolution Status</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={defectStatusData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {defectStatusData.map((entry, index) => (
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
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

interface MetricCardProps {
  title: string;
  value: string;
  description: string;
  trend: "up" | "down" | "neutral";
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  description,
  trend,
}) => {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-2xl font-bold mt-1">{value}</p>
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          </div>
          <div
            className={`flex items-center ${trend === "up" ? "text-green-500" : trend === "down" ? "text-red-500" : "text-gray-500"}`}
          >
            {trend === "up" && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            {trend === "down" && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M12 13a1 1 0 100 2h5a1 1 0 001-1v-5a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586l-4.293-4.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default QualityMetricsDashboard;
